package util

import (
	"go/ast"
	"go/parser"
	"go/token"
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

func TestDocFromPackages(t *testing.T) {
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

	if got, want := deprecationNotice(docFromPackages(astPkgs, "example", "Foo")), "Deprecated: use Bar instead."; got != want {
		t.Fatalf("deprecationNotice(docFromPackages(..., %q)) = %q, want %q", "Foo", got, want)
	}
	if got := deprecationNotice(docFromPackages(astPkgs, "example", "Bar")); got != "" {
		t.Fatalf("deprecationNotice(docFromPackages(..., %q)) = %q, want \"\"", "Bar", got)
	}
}
