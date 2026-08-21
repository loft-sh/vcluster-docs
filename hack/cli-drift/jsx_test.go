package main

import (
	"strings"
	"testing"
)

func TestExtractInterpolatedBlocks_TemplateLiteral(t *testing.T) {
	bt := "`"
	content := strings.Join([]string{
		"intro prose",
		"<InterpolatedCodeBlock",
		"  code={" + bt + "line1",
		"line2 [[VAR:NAMESPACE:team-x]] [[GLOBAL:VERSION]]" + bt + "}",
		"  language=\"yaml\"",
		"  title=\"vcluster.yaml\"",
		"/>",
	}, "\n")

	blocks := extractInterpolatedBlocks(content)
	if len(blocks) != 1 {
		t.Fatalf("want 1 block, got %+v", blocks)
	}
	b := blocks[0]
	if b.startLine != 2 || b.language != "yaml" || b.title != "vcluster.yaml" || b.ignored {
		t.Errorf("metadata wrong: %+v", b)
	}
	// [[VAR:...:default]] substitutes the default; [[GLOBAL:NAME]] the name.
	if want := "line1\nline2 team-x VERSION"; b.code != want {
		t.Errorf("code = %q, want %q", b.code, want)
	}
}

func TestExtractInterpolatedBlocks_AttrsNotReadFromCode(t *testing.T) {
	// The code string may contain attribute-looking text and a bare '>' —
	// neither may leak into attribute detection or end the tag early.
	content := `<InterpolatedCodeBlock code={'echo language="yaml" > file'} language="bash" />`
	blocks := extractInterpolatedBlocks(content)
	if len(blocks) != 1 {
		t.Fatalf("want 1 block, got %+v", blocks)
	}
	if blocks[0].language != "bash" {
		t.Errorf("language = %q, want bash (from the attribute, not the code)", blocks[0].language)
	}
	if want := `echo language="yaml" > file`; blocks[0].code != want {
		t.Errorf("code = %q, want %q", blocks[0].code, want)
	}
}

func TestExtractInterpolatedBlocks_EscapedNewlinesInQuoted(t *testing.T) {
	content := `<InterpolatedCodeBlock code={'a:\n  b: 1'} language="yaml" />`
	blocks := extractInterpolatedBlocks(content)
	if len(blocks) != 1 || blocks[0].code != "a:\n  b: 1" {
		t.Fatalf("escaped \\n must decode to a newline, got %+v", blocks)
	}
}

func TestExtractInterpolatedBlocks_PlainAttrString(t *testing.T) {
	// code="..." is a plain JSX attribute: newlines are literal, specials are
	// entity-escaped, and no backslash unescaping happens.
	content := "<InterpolatedCodeBlock\n  code=\"kubectl get nodes\nkubectl get pods &amp;&amp; echo &quot;ok&quot;\"\n  language=\"bash\"\n/>"
	blocks := extractInterpolatedBlocks(content)
	if len(blocks) != 1 {
		t.Fatalf("want 1 block, got %+v", blocks)
	}
	if want := "kubectl get nodes\nkubectl get pods && echo \"ok\""; blocks[0].code != want {
		t.Errorf("code = %q, want %q", blocks[0].code, want)
	}
	if blocks[0].language != "bash" {
		t.Errorf("language = %q, want bash", blocks[0].language)
	}
}

func TestExtractInterpolatedBlocks_DynamicExpressionSkipped(t *testing.T) {
	// Non-literal expressions (identifiers, calls) are not statically known;
	// they must be skipped entirely, never guessed at.
	content := `<InterpolatedCodeBlock code={someVariable} language="bash" />` + "\n" +
		`<InterpolatedCodeBlock code={'literal ok'} language="bash" />`
	blocks := extractInterpolatedBlocks(content)
	if len(blocks) != 1 || blocks[0].code != "literal ok" {
		t.Fatalf("dynamic component must be skipped, literal kept: %+v", blocks)
	}
}

func TestExtractInterpolatedBlocks_MarkerAboveTag(t *testing.T) {
	content := "{/* drift-ignore */}\n" +
		`<InterpolatedCodeBlock code={'x'} language="bash" />`
	blocks := extractInterpolatedBlocks(content)
	if len(blocks) != 1 || !blocks[0].ignored {
		t.Fatalf("marker above the tag must set ignored, got %+v", blocks)
	}
}
