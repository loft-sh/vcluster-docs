// Command cli-drift detects CLI drift between hand-written prose docs and the
// canonical cobra-generated command reference under vcluster/cli/*.md.
//
// Two finding kinds:
//
//   - Flag drift: a "vcluster ..." invocation in a fenced code block references
//     a --flag that cobra no longer lists for that command (removed or
//     deprecated flags are hidden from generated docs).
//   - Command drift: a whole command was removed or newly deprecated. Cobra
//     hides both from generated docs identically, so the only signal is the
//     command's *.md file disappearing between an older git ref and now. The
//     tool greps prose for the literal dead invocation string.
//
// Ground truth is already committed and kept fresh by handle-source-release.yml;
// no live CLI binary is needed.
//
// Exit codes: 0 = no drift, 1 = drift detected, 2 = error.
//
// Usage:
//
//	go run ./hack/cli-drift \
//	  --cli ./vcluster/cli \
//	  --docs ./vcluster \
//	  --old-ref HEAD~50 \
//	  --label "vcluster (next)" \
//	  --json-output /tmp/cli-drift.json
package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"
)

// FlagFinding is one prose invocation referencing an unknown/deprecated flag.
type FlagFinding struct {
	File       string `json:"file"`
	LineNumber int    `json:"line"`
	Command    string `json:"command"`
	Flag       string `json:"flag"`
	Invocation string `json:"invocation"`
}

// CommandFinding is one prose line referencing a removed/deprecated command.
type CommandFinding struct {
	File       string `json:"file"`
	LineNumber int    `json:"line"`
	Command    string `json:"command"`
	Line       string `json:"context"`
}

// Report is the JSON drift report consumed by the Claude fix step.
type Report struct {
	Label        string           `json:"label"`
	CLIDir       string           `json:"cli_dir"`
	DocsRoot     string           `json:"docs_root"`
	OldRef       string           `json:"old_ref,omitempty"`
	FlagDrift    []FlagFinding    `json:"flag_drift"`
	CommandDrift []CommandFinding `json:"command_drift"`
}

func main() {
	cli := flag.String("cli", "", "path to the cobra-generated CLI docs dir (vcluster/cli)")
	docs := flag.String("docs", "", "path to the prose docs tree to scan")
	oldRef := flag.String("old-ref", "", "git ref for the older command set (command drift); empty skips command drift")
	label := flag.String("label", "vcluster", "human-readable label for the source (used in output)")
	jsonOutput := flag.String("json-output", "", "path to write the JSON drift report")
	flag.Parse()

	if *cli == "" || *docs == "" {
		fmt.Fprintln(os.Stderr, "Usage: cli-drift --cli <dir> --docs <dir> [--old-ref <ref>] [--label <name>] [--json-output <path>]")
		os.Exit(2)
	}

	if st, err := os.Stat(*cli); err != nil || !st.IsDir() {
		fmt.Printf("CLI docs dir does not exist: %s (skipping)\n", *cli)
		os.Exit(0)
	}
	if st, err := os.Stat(*docs); err != nil || !st.IsDir() {
		fmt.Printf("Docs dir does not exist: %s (skipping)\n", *docs)
		os.Exit(0)
	}

	gt, err := ParseCLIDocs(*cli)
	if err != nil {
		fmt.Fprintf(os.Stderr, "ERROR: parsing CLI docs %s: %v\n", *cli, err)
		os.Exit(2)
	}
	fmt.Printf("=== CLI Drift Report (%s) ===\n", *label)
	fmt.Printf("Known commands: %d\n", len(gt.byStem))

	flagFindings, err := ScanProse(*docs, gt)
	if err != nil {
		fmt.Fprintf(os.Stderr, "ERROR: scanning prose for flag drift: %v\n", err)
		os.Exit(2)
	}

	var cmdFindings []CommandFinding
	if *oldRef != "" {
		cmdFindings, err = CommandDrift(*cli, *oldRef, *docs, gt)
		if err != nil {
			fmt.Fprintf(os.Stderr, "ERROR: computing command drift against %s: %v\n", *oldRef, err)
			os.Exit(2)
		}
	}

	report := Report{
		Label:        *label,
		CLIDir:       *cli,
		DocsRoot:     *docs,
		OldRef:       *oldRef,
		FlagDrift:    flagFindings,
		CommandDrift: cmdFindings,
	}

	data, err := json.MarshalIndent(report, "", "  ")
	if err != nil {
		fmt.Fprintf(os.Stderr, "ERROR: marshaling JSON: %v\n", err)
		os.Exit(2)
	}
	if *jsonOutput != "" {
		if err := os.WriteFile(*jsonOutput, data, 0644); err != nil {
			fmt.Fprintf(os.Stderr, "ERROR: writing %s: %v\n", *jsonOutput, err)
			os.Exit(2)
		}
		fmt.Printf("Wrote drift report to %s\n", *jsonOutput)
	} else {
		fmt.Println(string(data))
	}

	fmt.Printf("Flag drift: %d, Command drift: %d\n", len(flagFindings), len(cmdFindings))
	if len(flagFindings) > 0 || len(cmdFindings) > 0 {
		os.Exit(1)
	}
	os.Exit(0)
}
