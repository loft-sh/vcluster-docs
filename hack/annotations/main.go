// Command annotations detects undocumented annotations in a Go source repo
// and outputs a JSON drift report for Claude to generate documentation.
//
// Workflow:
//  1. Extracts annotation string literals from Go source files
//  2. Parses existing MDX headings to find documented annotations
//  3. Outputs JSON with new/removed annotations for Claude Code Action
//
// Exit codes: 0 = no drift, 1 = drift detected, 2 = error.
//
// Usage:
//
//	go run ./hack/annotations \
//	  --source ./loft-enterprise \
//	  --docs ./platform/reference/platform-annotations.mdx \
//	  --label "loft-enterprise (v4.6.0)" \
//	  --product platform \
//	  --json-output /tmp/drift.json
package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"
)

func main() {
	source := flag.String("source", "", "path to Go source repository")
	docs := flag.String("docs", "", "path to MDX annotations reference file")
	label := flag.String("label", "source", "human-readable label for the source (used in output)")
	product := flag.String("product", "", "product type: 'platform' or 'vcluster'")
	jsonOutput := flag.String("json-output", "", "path to write JSON drift report")
	flag.Parse()

	if *source == "" || *docs == "" {
		fmt.Fprintln(os.Stderr, "Usage: go run ./hack/annotations --source <path> --docs <path> --product <platform|vcluster> [--label <name>] [--json-output <path>]")
		os.Exit(2)
	}

	if _, err := os.Stat(*source); os.IsNotExist(err) {
		fmt.Fprintf(os.Stderr, "ERROR: source path does not exist: %s\n", *source)
		os.Exit(2)
	}

	if _, err := os.Stat(*docs); os.IsNotExist(err) {
		fmt.Printf("Docs file does not exist: %s (skipping)\n", *docs)
		os.Exit(0)
	}

	// Extract annotations from Go source
	annotations, err := ExtractAnnotations(*source)
	if err != nil {
		fmt.Fprintf(os.Stderr, "ERROR: extracting annotations from %s: %v\n", *source, err)
		os.Exit(2)
	}
	fmt.Printf("=== Annotation Report (%s) ===\n", *label)
	fmt.Printf("Source annotations: %d\n", len(annotations))

	documented, err := ParseDocumentedAnnotations(*docs)
	if err != nil {
		fmt.Fprintf(os.Stderr, "ERROR: reading docs: %v\n", err)
		os.Exit(2)
	}

	sourceSet := make(map[string]bool)
	for _, a := range annotations {
		sourceSet[a.Key] = true
	}

	var newAnnotations []Annotation
	for _, a := range annotations {
		if !documented[a.Key] {
			newAnnotations = append(newAnnotations, a)
		}
	}

	var removed []string
	for key := range documented {
		if !sourceSet[key] {
			removed = append(removed, key)
		}
	}

	report := DriftReport{
		DocsPath:           *docs,
		Product:            *product,
		Label:              *label,
		NewAnnotations:     newAnnotations,
		RemovedAnnotations: removed,
	}

	data, err := json.MarshalIndent(report, "", "  ")
	if err != nil {
		fmt.Fprintf(os.Stderr, "ERROR: marshaling JSON: %v\n", err)
		os.Exit(2)
	}

	if *jsonOutput != "" {
		if err := os.WriteFile(*jsonOutput, data, 0644); err != nil {
			fmt.Fprintf(os.Stderr, "ERROR: writing %s: %v\n", *jsonOutput, err)
			os.Exit(2)
		}
		fmt.Printf("Wrote drift report to %s\n", *jsonOutput)
	} else {
		fmt.Println(string(data))
	}

	fmt.Printf("New: %d, Removed: %d\n", len(newAnnotations), len(removed))
	if len(newAnnotations) > 0 {
		os.Exit(1)
	}
	os.Exit(0)
}
