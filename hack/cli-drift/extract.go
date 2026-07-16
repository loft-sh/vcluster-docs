package main

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
)

// flagDefPattern matches a flag-definition line inside a cobra-generated
// "## Flags" / "## Global and inherited flags" code block, e.g.:
//
//	    --address string   The local address ...
//	-h, --help             help for connect
//
// It deliberately requires the line to START (after indentation) with an
// optional short flag then the long flag, so long-flag mentions inside a
// description ("... only used if --background-proxy is enabled") are not
// captured.
var flagDefPattern = regexp.MustCompile(`^\s{2,}(?:-[a-zA-Z0-9], )?--([a-zA-Z][a-zA-Z0-9-]*)`)

// Command holds the ground truth for a single CLI command: its stem (filename
// without extension, e.g. "vcluster_connect"), the human command path
// ("vcluster connect"), and the set of flags cobra considers currently valid.
type Command struct {
	Stem  string
	Path  string
	Flags map[string]bool
}

// CLIGroundTruth is the parsed, indexed ground truth for all commands.
type CLIGroundTruth struct {
	// byStem maps a command stem to its Command.
	byStem map[string]*Command
	// stemPrefix holds every stem AND every underscore-prefix of a stem, so
	// the resolver can tell "keep consuming tokens" from "dead end".
	stemPrefix map[string]bool
}

// ParseCLIDocs reads every "*.md" file in dir and builds the CLI ground truth.
// A file's flag set is the union of every flag-definition line in the file,
// which naturally includes the repeated "Global and inherited flags" block, so
// each command's valid set already accounts for inherited persistent flags.
func ParseCLIDocs(dir string) (*CLIGroundTruth, error) {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}

	gt := &CLIGroundTruth{
		byStem:     make(map[string]*Command),
		stemPrefix: make(map[string]bool),
	}

	for _, e := range entries {
		if e.IsDir() || !strings.HasSuffix(e.Name(), ".md") {
			continue
		}
		stem := strings.TrimSuffix(e.Name(), ".md")
		data, err := os.ReadFile(filepath.Join(dir, e.Name()))
		if err != nil {
			return nil, err
		}

		cmd := &Command{
			Stem:  stem,
			Path:  strings.ReplaceAll(stem, "_", " "),
			Flags: make(map[string]bool),
		}
		for _, line := range strings.Split(string(data), "\n") {
			if m := flagDefPattern.FindStringSubmatch(line); m != nil {
				cmd.Flags[m[1]] = true
			}
		}
		gt.byStem[stem] = cmd
	}

	// Build the prefix index over the discovered stems.
	for stem := range gt.byStem {
		parts := strings.Split(stem, "_")
		for i := 1; i <= len(parts); i++ {
			gt.stemPrefix[strings.Join(parts[:i], "_")] = true
		}
	}

	if len(gt.byStem) == 0 {
		return nil, fmt.Errorf("no *.md command files found in %s", dir)
	}
	return gt, nil
}

// resolveCommand takes the token run of a "vcluster ..." invocation (tokens[0]
// is "vcluster") and returns the Command matched by the longest run of leading
// bareword tokens whose underscore-join is a known stem. It also returns the
// number of tokens consumed by the command path, so the caller can scan the
// remaining tokens for flags. Returns nil if no stem matched.
func (gt *CLIGroundTruth) resolveCommand(tokens []string) (*Command, int) {
	var best *Command
	bestConsumed := 0

	cur := ""
	for i, tok := range tokens {
		// A command path is an unbroken run of barewords; stop at the first
		// flag or non-bareword token.
		if strings.HasPrefix(tok, "-") {
			break
		}
		if i == 0 {
			cur = tok
		} else {
			cur = cur + "_" + tok
		}
		if !gt.stemPrefix[cur] {
			break
		}
		if cmd, ok := gt.byStem[cur]; ok {
			best = cmd
			bestConsumed = i + 1
		}
	}
	return best, bestConsumed
}

// CommandDrift diffs the set of command files present at oldRef against the set
// present in cliDir on disk, then greps the docs tree for the literal dead
// invocation string of every command whose file disappeared. A removed OR
// newly-deprecated command produces no in-file marker (cobra hides both from
// the generated docs identically), so the vanished filename is the only signal.
func CommandDrift(cliDir, oldRef, docsRoot string, gt *CLIGroundTruth) ([]CommandFinding, error) {
	oldStems, err := gitFileStems(oldRef, cliDir)
	if err != nil {
		return nil, err
	}

	var removed []string
	for stem := range oldStems {
		if _, stillHere := gt.byStem[stem]; !stillHere {
			removed = append(removed, stem)
		}
	}
	sort.Strings(removed)

	var findings []CommandFinding
	for _, stem := range removed {
		invocation := strings.ReplaceAll(stem, "_", " ")
		hits, err := grepInvocation(docsRoot, invocation)
		if err != nil {
			return nil, err
		}
		findings = append(findings, hits...)
	}
	return findings, nil
}

// gitFileStems returns the set of command stems (filename without ".md") that
// existed under cliDir at the given git ref.
func gitFileStems(ref, cliDir string) (map[string]bool, error) {
	cmd := exec.Command("git", "ls-tree", "-r", "--name-only", ref, "--", cliDir)
	out, err := cmd.Output()
	if err != nil {
		return nil, fmt.Errorf("git ls-tree %s: %w", ref, err)
	}
	stems := make(map[string]bool)
	for _, line := range strings.Split(strings.TrimSpace(string(out)), "\n") {
		line = strings.TrimSpace(line)
		if !strings.HasSuffix(line, ".md") {
			continue
		}
		stems[strings.TrimSuffix(filepath.Base(line), ".md")] = true
	}
	return stems, nil
}

// grepInvocation walks docsRoot for prose files that contain the literal
// command invocation as a whole-word token run, returning one finding per match
// line. It skips the CLI ground-truth directory itself.
func grepInvocation(docsRoot, invocation string) ([]CommandFinding, error) {
	// Match the invocation only when "vcluster" begins a real shell token: the
	// preceding char (if any) must not be alphanumeric, '.', '/', '_' or '-'.
	// A plain \b prefix is too weak — it treats '-' as a boundary and so
	// false-matches the "vcluster get" inside `kubectl --context kind-vcluster
	// get ...`. The trailing \b keeps "vcluster get" from hitting "vcluster
	// getx". RE2 has no lookbehind, so the leading boundary char is matched but
	// not captured.
	pat := regexp.MustCompile(`(?:^|[^A-Za-z0-9._/-])` + regexp.QuoteMeta(invocation) + `\b`)

	var findings []CommandFinding
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
		for i, line := range strings.Split(string(data), "\n") {
			if pat.MatchString(line) {
				findings = append(findings, CommandFinding{
					File:       path,
					LineNumber: i + 1,
					Command:    invocation,
					Line:       strings.TrimSpace(line),
				})
			}
		}
		return nil
	})
	return findings, err
}
