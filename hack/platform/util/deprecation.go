package util

import (
	"go/ast"
	"go/doc"
	"go/parser"
	"go/token"
	"path/filepath"
	"reflect"
	"strings"
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

// typeDoc returns the full doc comment of typeName in the Go package at dir.
func typeDoc(dir, typeName string) string {
	fset := token.NewFileSet()
	astPkgs, err := parser.ParseDir(fset, dir, nil, parser.ParseComments)
	if err != nil {
		panic(err)
	}
	return docFromPackages(astPkgs, dir, typeName)
}

// docFromPackages returns the full doc comment of typeName among astPkgs,
// which go/doc treats as importable at dir.
func docFromPackages(astPkgs map[string]*ast.Package, dir, typeName string) string {
	for _, astPkg := range astPkgs {
		for _, t := range doc.New(astPkg, dir, doc.AllDecls).Types {
			if t.Name == typeName {
				return t.Doc
			}
		}
	}
	return ""
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
