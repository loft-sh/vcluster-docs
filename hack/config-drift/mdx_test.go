package main

import (
	"os"
	"path/filepath"
	"testing"
)

func scanConfigContent(t *testing.T, content string) []Finding {
	t.Helper()
	gt, err := ParseConfigPartials(writeConfigDir(t))
	if err != nil {
		t.Fatal(err)
	}
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

func fence(body string) string { return "```yaml\n" + body + "\n```\n" }

func TestWalk_UnknownField(t *testing.T) {
	// "bogus" under exportKubeConfig (a structured object) is unknown drift.
	findings := scanConfigContent(t, fence("exportKubeConfig:\n  bogus: true"))
	if len(findings) != 1 || findings[0].Kind != "unknown" || findings[0].Path != "exportKubeConfig.bogus" {
		t.Fatalf("want one unknown exportKubeConfig.bogus, got %+v", findings)
	}
}

func TestWalk_KnownFieldsClean(t *testing.T) {
	findings := scanConfigContent(t, fence("exportKubeConfig:\n  context: my-ctx\nsync:\n  toHost:\n    pods:\n      enabled: true"))
	if len(findings) != 0 {
		t.Fatalf("valid config should yield no findings, got %+v", findings)
	}
}

func TestWalk_DeprecatedField(t *testing.T) {
	findings := scanConfigContent(t, fence("exportKubeConfig:\n  secret:\n    name: my-secret"))
	if len(findings) != 1 || findings[0].Kind != "deprecated" || findings[0].Path != "exportKubeConfig.secret" {
		t.Fatalf("want one deprecated exportKubeConfig.secret, got %+v", findings)
	}
	if findings[0].Detail == "" {
		t.Error("deprecated finding should carry the replacement note")
	}
}

func TestWalk_FreeFormScalarMapNotFlagged(t *testing.T) {
	// labels is a map[string]string leaf (no known children); its user keys
	// must not be flagged.
	findings := scanConfigContent(t, fence("sync:\n  toHost:\n    pods:\n      labels:\n        my.io/team: backend\n        env: prod"))
	if len(findings) != 0 {
		t.Fatalf("free-form label keys must not be flagged, got %+v", findings)
	}
}

func TestWalk_StopsDescendingPastUnknown(t *testing.T) {
	// One unknown parent should yield exactly one finding, not one per child.
	findings := scanConfigContent(t, fence("exportKubeConfig:\n  bogus:\n    child1: a\n    child2: b"))
	if len(findings) != 1 {
		t.Fatalf("want exactly one finding at the unknown parent, got %+v", findings)
	}
}

func TestWalk_NonVClusterBlockSkipped(t *testing.T) {
	// A Kubernetes manifest has no known schema root → skipped entirely.
	findings := scanConfigContent(t, fence("apiVersion: v1\nkind: Pod\nmetadata:\n  name: x\nspec:\n  containers: []"))
	if len(findings) != 0 {
		t.Fatalf("non-vcluster block must be skipped, got %+v", findings)
	}
}

func TestWalk_SequenceOfMappingsCollapsesIndex(t *testing.T) {
	// additionalSecrets is a list; each element validates against the collapsed
	// path. Here "bogusEl" is unknown under exportKubeConfig, "context" is not.
	// (Using exportKubeConfig which is structured; list under a leaf is a no-op.)
	gt, err := ParseConfigPartials(writeConfigDir(t))
	if err != nil {
		t.Fatal(err)
	}
	// Add a structured list-typed known path (a field with a known child) so
	// unknown element keys under it are flagged.
	gt.known["sync.toHost.pods.tolerations"] = true
	gt.known["sync.toHost.pods.tolerations.operator"] = true
	gt.hasChild["sync.toHost.pods"] = true
	gt.hasChild["sync.toHost.pods.tolerations"] = true

	docs := t.TempDir()
	body := fence("sync:\n  toHost:\n    pods:\n      tolerations:\n      - bogusKey: x")
	if err := os.WriteFile(filepath.Join(docs, "p.mdx"), []byte(body), 0644); err != nil {
		t.Fatal(err)
	}
	findings, err := ScanProse(docs, gt)
	if err != nil {
		t.Fatal(err)
	}
	if len(findings) != 1 || findings[0].Path != "sync.toHost.pods.tolerations.bogusKey" {
		t.Fatalf("want unknown under collapsed list path, got %+v", findings)
	}
}

func TestWalk_ReportsAccurateLineNumber(t *testing.T) {
	// Two prose lines precede the fence; the unknown key sits on the 3rd line
	// of the block, so it must be reported at file line 5.
	content := "intro line\nmore prose\n" + fence("exportKubeConfig:\n  context: x\n  bogus: y")
	findings := scanConfigContent(t, content)
	if len(findings) != 1 {
		t.Fatalf("want 1 finding, got %+v", findings)
	}
	// Layout: 1 "intro", 2 "more prose", 3 "```yaml", 4 "exportKubeConfig:",
	// 5 "  context: x", 6 "  bogus: y".
	if findings[0].LineNumber != 6 {
		t.Errorf("reported line %d, want 6", findings[0].LineNumber)
	}
}

func TestWalk_IgnoresNonYamlFences(t *testing.T) {
	// A bash fence with vcluster.yaml-looking text must not be parsed.
	findings := scanConfigContent(t, "```bash\nexportKubeConfig:\n  bogus: true\n```\n")
	if len(findings) != 0 {
		t.Fatalf("non-yaml fence must be ignored, got %+v", findings)
	}
}
