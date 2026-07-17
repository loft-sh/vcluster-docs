package main

import (
	"os"
	"path/filepath"
	"testing"
)

func testGroundTruth(t *testing.T) *CLIGroundTruth {
	t.Helper()
	dir := writeCLIDir(t, map[string]string{
		"vcluster_connect.md": connectDoc,
		"vcluster_create.md":  "## Flags\n```\n      --connect          connect after create\n  -f, --values string    values file\n```\n",
		"vcluster_upgrade.md": "## Synopsis\n```\nvcluster upgrade [flags]\n```\n## Global and inherited flags\n```\n      --debug   debug\n```\n",
	})
	gt, err := ParseCLIDocs(dir)
	if err != nil {
		t.Fatal(err)
	}
	return gt
}

func scanContent(t *testing.T, gt *CLIGroundTruth, content string) []FlagFinding {
	t.Helper()
	docs := t.TempDir()
	if err := os.WriteFile(filepath.Join(docs, "page.mdx"), []byte(content), 0644); err != nil {
		t.Fatal(err)
	}
	findings, err := ScanProse(docs, gt)
	if err != nil {
		t.Fatal(err)
	}
	return findings
}

func TestScanProse_DetectsUnknownFlag(t *testing.T) {
	gt := testGroundTruth(t)
	content := "```bash\nvcluster connect my-vcluster --update-current=false\n```\n"
	findings := scanContent(t, gt, content)
	if len(findings) != 1 {
		t.Fatalf("got %d findings, want 1: %+v", len(findings), findings)
	}
	if findings[0].Flag != "--update-current" || findings[0].Command != "vcluster connect" {
		t.Errorf("unexpected finding: %+v", findings[0])
	}
}

func TestScanProse_ValidFlagsClean(t *testing.T) {
	gt := testGroundTruth(t)
	content := "```bash\nvcluster connect my-vcluster --print --namespace foo\nvcluster create x --connect\n```\n"
	if findings := scanContent(t, gt, content); len(findings) != 0 {
		t.Fatalf("expected no findings, got %+v", findings)
	}
}

func TestScanProse_DoubleDashStopsFlagParsing(t *testing.T) {
	gt := testGroundTruth(t)
	// --as belongs to kubectl, not vcluster connect; it must be ignored.
	content := "```bash\nvcluster connect x -- kubectl auth can-i list --as=someuser\n```\n"
	if findings := scanContent(t, gt, content); len(findings) != 0 {
		t.Fatalf("flags after -- must be ignored, got %+v", findings)
	}
}

func TestScanProse_LineContinuation(t *testing.T) {
	gt := testGroundTruth(t)
	content := "```bash\nvcluster connect my-vcluster \\\n  --bogus-flag \\\n  --print\n```\n"
	findings := scanContent(t, gt, content)
	if len(findings) != 1 || findings[0].Flag != "--bogus-flag" {
		t.Fatalf("continuation join failed: %+v", findings)
	}
	if findings[0].LineNumber != 2 {
		t.Errorf("finding line = %d, want 2 (start of invocation)", findings[0].LineNumber)
	}
}

func TestScanProse_IgnoresOutsideFences(t *testing.T) {
	gt := testGroundTruth(t)
	// Same text as prose, not fenced — must be ignored.
	content := "Run vcluster connect my-vcluster --bogus-flag to connect.\n"
	if findings := scanContent(t, gt, content); len(findings) != 0 {
		t.Fatalf("prose outside fences must be ignored, got %+v", findings)
	}
}

func TestScanProse_IgnoresCommentLines(t *testing.T) {
	gt := testGroundTruth(t)
	content := "```bash\n# vcluster connect x --bogus-flag (this is a comment)\n```\n"
	if findings := scanContent(t, gt, content); len(findings) != 0 {
		t.Fatalf("comment lines must be ignored, got %+v", findings)
	}
}

func TestScanProse_DriftIgnoreMarkerSkipsFence(t *testing.T) {
	gt := testGroundTruth(t)
	// The first fence is marked (a deliberate legacy example); the second is
	// not and must still be scanned.
	content := "{/* drift-ignore */}\n```bash\nvcluster connect x --bogus-flag\n```\n\n```bash\nvcluster connect x --also-bogus\n```\n"
	findings := scanContent(t, gt, content)
	if len(findings) != 1 || findings[0].Flag != "--also-bogus" {
		t.Fatalf("marked fence must be skipped, unmarked scanned: %+v", findings)
	}
}

func TestParseLongFlag(t *testing.T) {
	cases := map[string]string{
		"--print":                "print",
		"--update-current=false": "update-current",
		"-n":                     "",
		"--":                     "",
		"notflag":                "",
		"--123":                  "",
	}
	for in, want := range cases {
		if got := parseLongFlag(in); got != want {
			t.Errorf("parseLongFlag(%q) = %q, want %q", in, got, want)
		}
	}
}
