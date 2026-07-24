package util

import (
	"fmt"
	"go/ast"
	"go/doc"
	"go/parser"
	"go/token"
	"path/filepath"
	"reflect"
	"strings"
	"unicode"
)

// TypeDeprecationNotice returns the "Deprecated: ..." notice carried by obj's
// Go type doc comment, or "" if the type isn't deprecated.
func TypeDeprecationNotice(obj interface{}) string {
	t := reflect.TypeOf(obj)
	for t != nil && t.Kind() == reflect.Ptr {
		t = t.Elem()
	}
	if t == nil || t.PkgPath() == "" {
		return ""
	}
	return deprecationNotice(typeDoc(filepath.Join("vendor", t.PkgPath()), t.Name()))
}

// typeDocCache holds, per package dir, every type's doc comment already
// extracted by packageTypeDocs, so sibling types sharing a vendor package
// don't each re-parse it from disk. It caches the extracted strings rather
// than the parsed packages because go/doc.New mutates the AST as it consumes
// doc comments, so running it a second time over an already-processed
// package silently returns empty docs.
var typeDocCache = map[string]map[string]string{}

// typeDoc returns the full doc comment of typeName in the Go package at dir.
func typeDoc(dir, typeName string) string {
	docs, ok := typeDocCache[dir]
	if !ok {
		docs = packageTypeDocs(dir)
		typeDocCache[dir] = docs
	}
	return docs[typeName]
}

// packageTypeDocs parses the Go package at dir and returns every type's full
// doc comment, keyed by type name.
func packageTypeDocs(dir string) map[string]string {
	fset := token.NewFileSet()
	astPkgs, err := parser.ParseDir(fset, dir, nil, parser.ParseComments)
	if err != nil {
		panic(err)
	}
	return docsFromPackages(astPkgs, dir)
}

// docsFromPackages returns every type's full doc comment among astPkgs,
// which go/doc treats as importable at dir, keyed by type name.
func docsFromPackages(astPkgs map[string]*ast.Package, dir string) map[string]string {
	docs := map[string]string{}
	for _, astPkg := range astPkgs {
		for _, t := range doc.New(astPkg, dir, doc.AllDecls).Types {
			docs[t.Name] = t.Doc
		}
	}
	return docs
}

// deprecationNotice returns the "Deprecated: ..." paragraph of a Go doc
// comment (per https://go.dev/wiki/Deprecated), or "" if there is none.
func deprecationNotice(docText string) string {
	for para := range strings.SplitSeq(docText, "\n\n") {
		para = strings.TrimSpace(para)
		if !strings.HasPrefix(para, "Deprecated:") {
			continue
		}
		para, _, _ = strings.Cut(para, "\n+") // drop trailing kubebuilder/genclient "+tag" lines
		return strings.Join(strings.Fields(para), " ")
	}
	return ""
}

// DeprecationAdmonition renders notice (as returned by TypeDeprecationNotice)
// as a Docusaurus admonition, dropping the leading "Deprecated:" so it isn't
// repeated right after the admonition's own "Deprecated" title, and
// capitalizing the sentence that remains.
func DeprecationAdmonition(notice string) string {
	body := strings.TrimSpace(strings.TrimPrefix(notice, "Deprecated:"))
	if body != "" {
		r := []rune(body)
		r[0] = unicode.ToUpper(r[0])
		body = string(r)
	}
	return fmt.Sprintf(":::warning Deprecated\n%s\n:::", body)
}
