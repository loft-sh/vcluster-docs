// Command config-drift detects vcluster.yaml drift between hand-written prose
// docs and the canonical schema partials under vcluster/_partials/config.
//
// It parses every field-heading anchor ("{#a-b-c}" => dotted path "a.b.c") into
// a schema ground truth, then scans ```yaml fenced blocks in prose whose
// top-level keys match a known schema root, walks each dotted path, and reports:
//
//   - unknown fields (hard finding): a path absent from the schema, sitting
//     under a structured object that does have known children.
//   - deprecated fields (soft finding): a path present but marked "Deprecated:"
//     in the schema; the note carries the suggested replacement.
//
// Ground truth is already committed and kept fresh by handle-source-release.yml.
//
// Exit codes: 0 = no drift, 1 = drift detected, 2 = error.
//
// Usage:
//
//	go run ./hack/config-drift \
//	  --config ./vcluster/_partials/config \
//	  --docs ./vcluster \
//	  --label "vcluster (next)" \
//	  --json-output /tmp/config-drift.json
package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"
)

// Finding is one prose reference to an unknown or deprecated schema field.
type Finding struct {
	File       string `json:"file"`
	LineNumber int    `json:"line"`
	Path       string `json:"path"`
	Kind       string `json:"kind"`             // "unknown" | "deprecated"
	Detail     string `json:"detail,omitempty"` // deprecation note, if any
}

// Report is the JSON drift report consumed by the Claude fix step.
type Report struct {
	Label      string    `json:"label"`
	ConfigDir  string    `json:"config_dir"`
	DocsRoot   string    `json:"docs_root"`
	Unknown    []Finding `json:"unknown_fields"`
	Deprecated []Finding `json:"deprecated_fields"`
}

func main() {
	config := flag.String("config", "", "path to the generated config partials dir (vcluster/_partials/config)")
	docs := flag.String("docs", "", "path to the prose docs tree to scan")
	label := flag.String("label", "vcluster", "human-readable label for the source (used in output)")
	jsonOutput := flag.String("json-output", "", "path to write the JSON drift report")
	flag.Parse()

	if *config == "" || *docs == "" {
		fmt.Fprintln(os.Stderr, "Usage: config-drift --config <dir> --docs <dir> [--label <name>] [--json-output <path>]")
		os.Exit(2)
	}

	if st, err := os.Stat(*config); err != nil || !st.IsDir() {
		fmt.Printf("Config partials dir does not exist: %s (skipping)\n", *config)
		os.Exit(0)
	}
	if st, err := os.Stat(*docs); err != nil || !st.IsDir() {
		fmt.Printf("Docs dir does not exist: %s (skipping)\n", *docs)
		os.Exit(0)
	}

	gt, err := ParseConfigPartials(*config)
	if err != nil {
		fmt.Fprintf(os.Stderr, "ERROR: parsing config partials %s: %v\n", *config, err)
		os.Exit(2)
	}
	if len(gt.roots) == 0 {
		fmt.Fprintf(os.Stderr, "ERROR: no schema roots found in %s (wrong path?)\n", *config)
		os.Exit(2)
	}
	fmt.Printf("=== Config Drift Report (%s) ===\n", *label)
	fmt.Printf("Known schema paths: %d, roots: %d\n", len(gt.known), len(gt.roots))

	findings, err := ScanProse(*docs, gt)
	if err != nil {
		fmt.Fprintf(os.Stderr, "ERROR: scanning prose: %v\n", err)
		os.Exit(2)
	}

	var unknown, deprecated []Finding
	for _, f := range findings {
		if f.Kind == "deprecated" {
			deprecated = append(deprecated, f)
		} else {
			unknown = append(unknown, f)
		}
	}

	report := Report{
		Label:      *label,
		ConfigDir:  *config,
		DocsRoot:   *docs,
		Unknown:    unknown,
		Deprecated: deprecated,
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

	fmt.Printf("Unknown fields: %d, Deprecated fields: %d\n", len(unknown), len(deprecated))
	if len(unknown) > 0 || len(deprecated) > 0 {
		os.Exit(1)
	}
	os.Exit(0)
}
