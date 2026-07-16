package main

import (
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
)

// fencePattern matches the opening/closing of a fenced code block. The optional
// info string (language) is ignored; any fenced block may hold a shell
// invocation.
var fencePattern = regexp.MustCompile("^\\s*```")

// promptPattern strips a leading shell prompt ("$ " or "> ") from a code line.
var promptPattern = regexp.MustCompile(`^\s*[$>]\s+`)

// shellBreak tokens terminate a command's token run within a line (pipes,
// sequencing, redirection, backgrounding).
var shellBreak = map[string]bool{
	"|": true, "||": true, "&&": true, ";": true, "&": true,
	">": true, ">>": true, "<": true,
}

// ScanProse walks docsRoot for prose files, extracts fenced code blocks, and
// reports every "vcluster ..." invocation that references a flag cobra no
// longer lists for the resolved command. The CLI ground-truth directory is
// skipped.
func ScanProse(docsRoot string, gt *CLIGroundTruth) ([]FlagFinding, error) {
	var findings []FlagFinding

	err := filepath.Walk(docsRoot, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return nil
		}
		if info.IsDir() {
			if skipProseDir(path, info.Name()) {
				return filepath.SkipDir
			}
			return nil
		}
		if !isProseFile(path) {
			return nil
		}
		data, err := os.ReadFile(path)
		if err != nil {
			return nil
		}
		findings = append(findings, scanFileForFlagDrift(path, string(data), gt)...)
		return nil
	})
	if err != nil {
		return nil, err
	}

	sort.Slice(findings, func(i, j int) bool {
		if findings[i].File != findings[j].File {
			return findings[i].File < findings[j].File
		}
		if findings[i].LineNumber != findings[j].LineNumber {
			return findings[i].LineNumber < findings[j].LineNumber
		}
		return findings[i].Flag < findings[j].Flag
	})
	return findings, nil
}

// scanFileForFlagDrift extracts fenced code blocks from a single file's content
// and checks every vcluster invocation for unknown flags.
func scanFileForFlagDrift(path, content string, gt *CLIGroundTruth) []FlagFinding {
	var findings []FlagFinding
	lines := strings.Split(content, "\n")

	inFence := false
	for i := 0; i < len(lines); i++ {
		if fencePattern.MatchString(lines[i]) {
			inFence = !inFence
			continue
		}
		if !inFence {
			continue
		}

		// Join backslash line-continuations so multi-line invocations parse as
		// one logical command. Track the starting line for reporting.
		startLine := i + 1
		logical := stripContinuation(lines[i])
		for strings.HasSuffix(strings.TrimRight(lines[i], " \t"), "\\") && i+1 < len(lines) {
			i++
			if fencePattern.MatchString(lines[i]) {
				inFence = !inFence
				break
			}
			logical += " " + stripContinuation(lines[i])
		}

		for _, f := range checkLine(logical, gt) {
			f.File = path
			f.LineNumber = startLine
			findings = append(findings, f)
		}
	}
	return findings
}

// stripContinuation removes a trailing backslash and normalizes a code line.
func stripContinuation(line string) string {
	line = strings.TrimRight(line, " \t")
	line = strings.TrimSuffix(line, "\\")
	return strings.TrimSpace(line)
}

// checkLine finds every "vcluster" invocation in a single logical line and
// returns a finding for each flag not in the resolved command's valid set.
func checkLine(line string, gt *CLIGroundTruth) []FlagFinding {
	trimmed := promptPattern.ReplaceAllString(line, "")
	// Skip pure comment lines inside code blocks.
	if strings.HasPrefix(strings.TrimSpace(trimmed), "#") {
		return nil
	}

	tokens := strings.Fields(trimmed)
	var findings []FlagFinding

	for start := 0; start < len(tokens); start++ {
		if tokens[start] != "vcluster" {
			continue
		}
		// Collect the invocation's tokens up to the next shell break.
		run := []string{}
		for j := start; j < len(tokens); j++ {
			if shellBreak[tokens[j]] {
				break
			}
			run = append(run, tokens[j])
		}

		cmd, consumed := gt.resolveCommand(run)
		if cmd == nil {
			continue // unresolved command path; flag drift is not decidable
		}
		for _, tok := range run[consumed:] {
			// A bare "--" ends vcluster's own flags; everything after it is the
			// command vcluster execs (e.g. `vcluster connect x -- kubectl ...`),
			// whose flags are not ours to validate.
			if tok == "--" {
				break
			}
			flag := parseLongFlag(tok)
			if flag == "" {
				continue
			}
			if !cmd.Flags[flag] {
				findings = append(findings, FlagFinding{
					Command:    cmd.Path,
					Flag:       "--" + flag,
					Invocation: strings.Join(run, " "),
				})
			}
		}
		// Advance start past this run to avoid re-scanning its tokens.
		start += len(run) - 1
	}
	return findings
}

// parseLongFlag returns the flag name (without leading dashes, without any
// "=value" suffix) if tok is a long flag, else "".
func parseLongFlag(tok string) string {
	if !strings.HasPrefix(tok, "--") {
		return ""
	}
	name := strings.TrimPrefix(tok, "--")
	if idx := strings.IndexByte(name, '='); idx != -1 {
		name = name[:idx]
	}
	if name == "" || !isFlagName(name) {
		return ""
	}
	return name
}

var flagNamePattern = regexp.MustCompile(`^[a-zA-Z][a-zA-Z0-9-]*$`)

func isFlagName(s string) bool {
	return flagNamePattern.MatchString(s)
}

// isProseFile reports whether path is a hand-written docs file to scan.
func isProseFile(path string) bool {
	return strings.HasSuffix(path, ".mdx") || strings.HasSuffix(path, ".md")
}

// skipProseDir reports whether a directory should be pruned from the prose
// walk: VCS/build/vendor noise and the generated CLI ground-truth trees.
func skipProseDir(path, name string) bool {
	switch name {
	case ".git", "node_modules", "vendor", "build", ".docusaurus":
		return true
	}
	// Skip any generated "cli" directory (the ground truth), e.g.
	// vcluster/cli or vcluster_versioned_docs/version-*/cli.
	if name == "cli" && strings.Contains(filepath.ToSlash(path), "/cli") {
		return true
	}
	return false
}
