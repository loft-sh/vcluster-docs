// Command annotations detects undocumented annotations in a Go source repo
// and appends documentation stubs to an MDX reference page.
//
// It combines drift detection and stub generation into a single pass:
//  1. Extracts annotation string literals from Go source files
//  2. Parses existing MDX headings to find documented annotations
//  3. Appends stubs for new annotations, preserving existing content
//
// If the docs file does not exist, it creates one with proper frontmatter
// based on the --product flag.
//
// Exit codes: 0 = no changes, 1 = file updated, 2 = error.
//
// Usage:
//
//	go run ./hack/annotations \
//	  --source ./loft-enterprise \
//	  --docs ./platform/reference/platform-annotations.mdx \
//	  --label "loft-enterprise (v4.6.0)" \
//	  --product platform
package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"path/filepath"
)

var frontmatter = map[string]string{
	"platform": `---
title: Platform Annotations and Labels Reference
sidebar_label: Platform Annotations
sidebar_position: 6
description: Reference documentation for all loft.sh annotations and labels used by vCluster Platform for cluster, project, space, and user management
---

<!-- vale off -->

# Platform annotations and labels reference {#platform-annotations-reference}

This page documents the well-known annotations and labels in the ` + "`loft.sh`" + ` namespace used by vCluster Platform for managing clusters, projects, spaces, users, teams, and integrations.

<!-- vale on -->
`,
	"vcluster": `---
title: Annotations and Labels Reference
sidebar_label: Annotations & Labels
sidebar_position: 5
description: Reference documentation for vCluster sync annotations and labels
---

<!-- vale off -->

# Annotations and labels reference {#annotations-reference}

This page documents the well-known annotations and labels in the ` + "`vcluster.loft.sh`" + ` namespace used by vCluster for resource synchronization between virtual and host clusters.

<!-- vale on -->
`,
}

func main() {
	source := flag.String("source", "", "path to Go source repository")
	docs := flag.String("docs", "", "path to MDX annotations reference file")
	label := flag.String("label", "source", "human-readable label for the source (used in output)")
	product := flag.String("product", "", "product type: 'platform' or 'vcluster' (used for frontmatter when creating new file)")
	detectOnly := flag.Bool("detect-only", false, "only detect drift, output JSON instead of writing stubs")
	jsonOutput := flag.String("json-output", "", "path to write JSON output (used with --detect-only)")
	flag.Parse()

	if *source == "" || *docs == "" {
		fmt.Fprintln(os.Stderr, "Usage: go run ./hack/annotations --source <path> --docs <path> --product <platform|vcluster> [--label <name>]")
		os.Exit(2)
	}

	if _, err := os.Stat(*source); os.IsNotExist(err) {
		fmt.Fprintf(os.Stderr, "ERROR: source path does not exist: %s\n", *source)
		os.Exit(2)
	}

	// Create docs file with frontmatter if it doesn't exist
	created := false
	if _, err := os.Stat(*docs); os.IsNotExist(err) {
		if *detectOnly {
			fmt.Printf("Docs file does not exist: %s (skipping in detect-only mode)\n", *docs)
			os.Exit(0)
		}
		fm, ok := frontmatter[*product]
		if !ok {
			fmt.Fprintf(os.Stderr, "ERROR: docs file does not exist and --product is not set or invalid: %q\n", *product)
			fmt.Fprintln(os.Stderr, "Use --product platform or --product vcluster to create the file.")
			os.Exit(2)
		}
		if err := os.MkdirAll(filepath.Dir(*docs), 0755); err != nil {
			fmt.Fprintf(os.Stderr, "ERROR: creating directory for %s: %v\n", *docs, err)
			os.Exit(2)
		}
		if err := os.WriteFile(*docs, []byte(fm), 0644); err != nil {
			fmt.Fprintf(os.Stderr, "ERROR: creating %s: %v\n", *docs, err)
			os.Exit(2)
		}
		fmt.Printf("Created %s with frontmatter\n", *docs)
		created = true
	}

	// Extract annotations from Go source
	annotations, err := ExtractAnnotations(*source)
	if err != nil {
		fmt.Fprintf(os.Stderr, "ERROR: extracting annotations from %s: %v\n", *source, err)
		os.Exit(2)
	}
	fmt.Printf("=== Annotation Report (%s) ===\n", *label)
	fmt.Printf("Source annotations: %d\n", len(annotations))

	// Detect-only mode: output JSON and exit
	if *detectOnly {
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

	// Merge with existing docs
	result, err := MergeAnnotations(*docs, annotations, *label)
	if err != nil {
		fmt.Fprintf(os.Stderr, "ERROR: merging annotations: %v\n", err)
		os.Exit(2)
	}

	// Parse documented count from the file
	documented, err := ParseDocumentedAnnotations(*docs)
	if err != nil {
		fmt.Fprintf(os.Stderr, "ERROR: reading docs: %v\n", err)
		os.Exit(2)
	}
	fmt.Printf("Documented annotations: %d\n", len(documented))

	if len(result.NewAnnotations) > 0 {
		fmt.Printf("\n--- New annotations (%d) ---\n", len(result.NewAnnotations))
		fmt.Printf("Added stubs for annotations not in %s:\n", *docs)
		for _, a := range result.NewAnnotations {
			fmt.Printf("  + %s (%s)\n", a.Key, a.Type)
		}
	}

	if len(result.RemovedAnnotations) > 0 {
		fmt.Printf("\n--- Possibly removed (%d) ---\n", len(result.RemovedAnnotations))
		fmt.Printf("Documented but not found in %s:\n", *label)
		for _, key := range result.RemovedAnnotations {
			fmt.Printf("  - %s\n", key)
		}
	}

	if result.FileChanged || created {
		fmt.Println("\nRESULT: File updated")
		os.Exit(1)
	}

	fmt.Println("\nRESULT: No changes needed")
	os.Exit(0)
}
