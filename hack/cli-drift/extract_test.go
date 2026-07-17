package main

import (
	"os"
	"os/exec"
	"path/filepath"
	"testing"
)

const connectDoc = `---
title: "vcluster connect --help"
---

## Flags

` + "```" + `
      --address string      The local address
  -h, --help                help for connect
      --print               When enabled prints the context to stdout
` + "```" + `

## Global and inherited flags

` + "```" + `
      --config string       The vcluster CLI config to use
  -n, --namespace string    The kubernetes namespace to use
` + "```" + `
`

func writeCLIDir(t *testing.T, files map[string]string) string {
	t.Helper()
	dir := t.TempDir()
	for name, body := range files {
		if err := os.WriteFile(filepath.Join(dir, name), []byte(body), 0644); err != nil {
			t.Fatal(err)
		}
	}
	return dir
}

func TestParseCLIDocs_FlagsAndPath(t *testing.T) {
	dir := writeCLIDir(t, map[string]string{
		"vcluster_connect.md":         connectDoc,
		"vcluster_platform_login.md":  "## Flags\n```\n  --user string  the user\n```\n",
		"vcluster_node_load-image.md": "## Flags\n```\n  --image string  the image\n```\n",
	})

	gt, err := ParseCLIDocs(dir)
	if err != nil {
		t.Fatal(err)
	}

	cmd := gt.byStem["vcluster_connect"]
	if cmd == nil {
		t.Fatal("vcluster_connect not parsed")
	}
	if cmd.Path != "vcluster connect" {
		t.Errorf("path = %q, want %q", cmd.Path, "vcluster connect")
	}
	for _, want := range []string{"address", "help", "print", "config", "namespace"} {
		if !cmd.Flags[want] {
			t.Errorf("expected flag --%s to be valid for connect", want)
		}
	}
	// A long flag mentioned only in a description must NOT be captured; here we
	// assert a made-up flag is absent.
	if cmd.Flags["update-current"] {
		t.Error("--update-current should not be a valid connect flag")
	}

	// Hyphenated subcommand path.
	if c := gt.byStem["vcluster_node_load-image"]; c == nil || c.Path != "vcluster node load-image" {
		t.Errorf("hyphenated path wrong: %+v", c)
	}
}

func TestResolveCommand_LongestMatch(t *testing.T) {
	dir := writeCLIDir(t, map[string]string{
		"vcluster_platform.md":                 "## Flags\n```\n  --x string  x\n```\n",
		"vcluster_platform_sleep.md":           "## Flags\n```\n  --x string  x\n```\n",
		"vcluster_platform_sleep_namespace.md": "## Flags\n```\n  --project string  p\n```\n",
		"vcluster_connect.md":                  connectDoc,
	})
	gt, err := ParseCLIDocs(dir)
	if err != nil {
		t.Fatal(err)
	}

	tests := []struct {
		name     string
		tokens   []string
		wantStem string
		wantN    int
	}{
		{"longest platform match", []string{"vcluster", "platform", "sleep", "namespace", "myns", "--project", "p"}, "vcluster_platform_sleep_namespace", 4},
		{"stops at flag", []string{"vcluster", "platform", "sleep", "--x"}, "vcluster_platform_sleep", 3},
		{"unknown subcommand falls back to group", []string{"vcluster", "platform", "bogus"}, "vcluster_platform", 2},
		{"bare vcluster unresolved", []string{"vcluster", "--help"}, "", 0},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			cmd, n := gt.resolveCommand(tc.tokens)
			if tc.wantStem == "" {
				if cmd != nil {
					t.Fatalf("expected nil command, got %s", cmd.Stem)
				}
				return
			}
			if cmd == nil || cmd.Stem != tc.wantStem {
				t.Fatalf("resolved %v, want %s", cmd, tc.wantStem)
			}
			if n != tc.wantN {
				t.Errorf("consumed = %d, want %d", n, tc.wantN)
			}
		})
	}
}

func TestGrepInvocation_DriftIgnoreMarkerSkipsFence(t *testing.T) {
	docs := t.TempDir()
	// The marked fence deliberately shows the removed command; only the
	// unmarked prose mention on the last line may match.
	content := "{/* drift-ignore */}\n```bash\nvcluster convert config < old.yaml\n```\n\nRun vcluster convert to migrate.\n"
	if err := os.WriteFile(filepath.Join(docs, "page.mdx"), []byte(content), 0644); err != nil {
		t.Fatal(err)
	}
	hits, err := grepInvocation(docs, "vcluster convert")
	if err != nil {
		t.Fatal(err)
	}
	if len(hits) != 1 || hits[0].LineNumber != 6 {
		t.Fatalf("marked fence must be skipped, prose mention kept: %+v", hits)
	}
}

// TestCommandDrift_EndToEnd exercises the full removed-command path: a git
// history where a command file existed at the old ref but is gone on disk,
// and a prose doc still referencing the dead invocation.
func TestCommandDrift_EndToEnd(t *testing.T) {
	repo := t.TempDir()
	git := func(args ...string) {
		t.Helper()
		cmd := exec.Command("git", args...)
		cmd.Dir = repo
		if out, err := cmd.CombinedOutput(); err != nil {
			t.Fatalf("git %v: %v\n%s", args, err, out)
		}
	}

	cliDir := filepath.Join(repo, "cli")
	if err := os.MkdirAll(cliDir, 0755); err != nil {
		t.Fatal(err)
	}
	files := map[string]string{
		"vcluster_connect.md": connectDoc,
		"vcluster_convert.md": "## Flags\n```\n  --distro string  the distro\n```\n",
	}
	for name, body := range files {
		if err := os.WriteFile(filepath.Join(cliDir, name), []byte(body), 0644); err != nil {
			t.Fatal(err)
		}
	}
	git("init", "-q")
	git("add", ".")
	git("-c", "user.email=test@test", "-c", "user.name=test", "commit", "-q", "-m", "old command set")

	// The release removed `vcluster convert`: its file vanishes from disk but
	// remains at HEAD (the old ref).
	if err := os.Remove(filepath.Join(cliDir, "vcluster_convert.md")); err != nil {
		t.Fatal(err)
	}
	docsDir := filepath.Join(repo, "docs")
	if err := os.MkdirAll(docsDir, 0755); err != nil {
		t.Fatal(err)
	}
	prose := "Run vcluster convert config to migrate.\nvcluster connect is fine.\n"
	if err := os.WriteFile(filepath.Join(docsDir, "page.mdx"), []byte(prose), 0644); err != nil {
		t.Fatal(err)
	}

	gt, err := ParseCLIDocs(cliDir)
	if err != nil {
		t.Fatal(err)
	}

	// gitFileStems runs git in the working directory; run the test from the
	// temp repo so relative paths resolve there.
	oldWD, err := os.Getwd()
	if err != nil {
		t.Fatal(err)
	}
	if err := os.Chdir(repo); err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = os.Chdir(oldWD) })

	findings, err := CommandDrift("cli", "HEAD", "docs", gt)
	if err != nil {
		t.Fatal(err)
	}
	if len(findings) != 1 {
		t.Fatalf("got %d findings, want 1: %+v", len(findings), findings)
	}
	if findings[0].Command != "vcluster convert" || findings[0].LineNumber != 1 {
		t.Errorf("unexpected finding: %+v", findings[0])
	}
}

func TestGrepInvocation_TokenBoundary(t *testing.T) {
	docs := t.TempDir()
	content := `Line one references kubectl --context kind-vcluster get namespace here.
A real call: vcluster get pods.
In a path /opt/vcluster get should not match.
`
	if err := os.WriteFile(filepath.Join(docs, "page.mdx"), []byte(content), 0644); err != nil {
		t.Fatal(err)
	}

	hits, err := grepInvocation(docs, "vcluster get")
	if err != nil {
		t.Fatal(err)
	}
	// Only the "A real call" line is a genuine invocation. "kind-vcluster get"
	// (preceded by '-') and "/opt/vcluster get" (preceded by '/') must not match.
	if len(hits) != 1 {
		for _, h := range hits {
			t.Logf("hit: %s:%d %q", h.File, h.LineNumber, h.Line)
		}
		t.Fatalf("got %d hits, want 1", len(hits))
	}
	if hits[0].LineNumber != 2 {
		t.Errorf("hit on line %d, want 2", hits[0].LineNumber)
	}
}
