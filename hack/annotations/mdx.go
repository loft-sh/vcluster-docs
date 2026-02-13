package main

import (
	"os"
	"regexp"
	"strings"
)

// headingPattern matches MDX annotation headings like: ### loft.sh/key {#anchor}
var headingPattern = regexp.MustCompile(`^### ([a-z][^\s]*)\s+\{#[^}]+\}`)

// ParseDocumentedAnnotations reads an MDX file and returns the set of annotation keys
// that already have headings (### key {#anchor}).
func ParseDocumentedAnnotations(path string) (map[string]bool, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	return parseHeadings(string(data)), nil
}

func parseHeadings(content string) map[string]bool {
	documented := make(map[string]bool)
	for _, line := range strings.Split(content, "\n") {
		if m := headingPattern.FindStringSubmatch(line); m != nil {
			documented[m[1]] = true
		}
	}
	return documented
}

// DriftReport is the JSON output for --detect-only mode.
type DriftReport struct {
	DocsPath           string       `json:"docs_path"`
	Product            string       `json:"product"`
	Label              string       `json:"label"`
	NewAnnotations     []Annotation `json:"new_annotations"`
	RemovedAnnotations []string     `json:"removed_annotations,omitempty"`
}
