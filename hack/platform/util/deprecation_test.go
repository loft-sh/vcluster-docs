package util

import (
	"go/ast"
	"go/parser"
	"go/token"
	"os"
	"path/filepath"
	"testing"
)

func TestDeprecationNotice(t *testing.T) {
	for _, test := range []struct {
		name string
		doc  string
		want string
	}{
		{
			name: "no deprecation",
			doc:  "Foo holds the foo information",
			want: "",
		},
		{
			name: "deprecation paragraph after summary",
			doc: "Foo holds the foo information\n\n" +
				"Deprecated: use Bar instead.\n+subresource-request",
			want: "Deprecated: use Bar instead.",
		},
		{
			name: "deprecation is the summary itself",
			doc:  "Deprecated: Foo is no longer supported.",
			want: "Deprecated: Foo is no longer supported.",
		},
	} {
		t.Run(test.name, func(t *testing.T) {
			if got := deprecationNotice(test.doc); got != test.want {
				t.Fatalf("deprecationNotice() = %q, want %q", got, test.want)
			}
		})
	}
}

func TestDeprecationAdmonition(t *testing.T) {
	got := DeprecationAdmonition("Deprecated: migrating virtual cluster instances between projects is deprecated and will be removed in a future release.")
	want := ":::warning Deprecated\n" +
		"Migrating virtual cluster instances between projects is deprecated and will be removed in a future release.\n" +
		":::"
	if got != want {
		t.Fatalf("DeprecationAdmonition() = %q, want %q", got, want)
	}
}

func TestTypeDocCachePreservesSiblingTypes(t *testing.T) {
	dir := t.TempDir()
	src := `package example

// Foo does something.
//
// Deprecated: use Bar instead.
type Foo struct{}

// Bar does something else.
type Bar struct{}
`
	if err := os.WriteFile(filepath.Join(dir, "example.go"), []byte(src), 0o644); err != nil {
		t.Fatal(err)
	}

	// Regression test: typeDoc caches per dir, so Bar is looked up against an
	// already-cached parse triggered by the earlier Foo lookup. If the cache
	// stored a *parsed package* instead of pre-extracted doc text, this second
	// call would silently return "" (see docsFromPackages).
	if got, want := typeDoc(dir, "Foo"), "Foo does something.\n\nDeprecated: use Bar instead.\n"; got != want {
		t.Fatalf("typeDoc(dir, %q) = %q, want %q", "Foo", got, want)
	}
	if got, want := typeDoc(dir, "Bar"), "Bar does something else.\n"; got != want {
		t.Fatalf("typeDoc(dir, %q) = %q, want %q", "Bar", got, want)
	}
}

func TestDocsFromPackages(t *testing.T) {
	src := `package example

// Foo does something.
//
// Deprecated: use Bar instead.
// +subresource-request
type Foo struct{}

// Bar does something else.
type Bar struct{}
`
	fset := token.NewFileSet()
	f, err := parser.ParseFile(fset, "example.go", src, parser.ParseComments)
	if err != nil {
		t.Fatal(err)
	}
	astPkgs := map[string]*ast.Package{
		f.Name.Name: {Name: f.Name.Name, Files: map[string]*ast.File{"example.go": f}},
	}

	// Both lookups read from the same extracted map, mirroring typeDoc's
	// cache: a single doc.New pass must capture every type's doc up front,
	// since running doc.New again over the same ast.Package returns empty docs.
	docs := docsFromPackages(astPkgs, "example")
	if got, want := deprecationNotice(docs["Foo"]), "Deprecated: use Bar instead."; got != want {
		t.Fatalf("deprecationNotice(docs[%q]) = %q, want %q", "Foo", got, want)
	}
	if got := deprecationNotice(docs["Bar"]); got != "" {
		t.Fatalf("deprecationNotice(docs[%q]) = %q, want \"\"", "Bar", got)
	}
}
