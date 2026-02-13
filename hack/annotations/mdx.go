package main

import (
	"fmt"
	"os"
	"regexp"
	"sort"
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

// MergeResult holds the outcome of a merge operation.
type MergeResult struct {
	NewAnnotations     []Annotation // annotations added as stubs
	RemovedAnnotations []string     // annotations in docs but not in source
	FileChanged        bool         // whether the file was modified
}

// MergeAnnotations reads the existing MDX, appends stubs for new annotations,
// and writes the result back. Existing content is preserved byte-for-byte.
func MergeAnnotations(docsPath string, sourceAnnotations []Annotation, label string) (*MergeResult, error) {
	data, err := os.ReadFile(docsPath)
	if err != nil {
		return nil, fmt.Errorf("reading %s: %w", docsPath, err)
	}
	content := string(data)
	documented := parseHeadings(content)

	// Build source set for removed detection
	sourceSet := make(map[string]bool)
	for _, a := range sourceAnnotations {
		sourceSet[a.Key] = true
	}

	// Find new annotations (in source, not documented)
	var newAnnotations []Annotation
	for _, a := range sourceAnnotations {
		if !documented[a.Key] {
			newAnnotations = append(newAnnotations, a)
		}
	}

	// Find removed annotations (documented, not in source)
	var removed []string
	for key := range documented {
		if !sourceSet[key] {
			removed = append(removed, key)
		}
	}
	sort.Strings(removed)

	result := &MergeResult{
		NewAnnotations:     newAnnotations,
		RemovedAnnotations: removed,
	}

	if len(newAnnotations) == 0 {
		return result, nil
	}

	// Build stubs
	stubs := buildStubs(newAnnotations)

	// Insert stubs into the file
	newContent := insertStubs(content, stubs)
	if newContent == content {
		return result, nil
	}

	if err := os.WriteFile(docsPath, []byte(newContent), 0644); err != nil {
		return nil, fmt.Errorf("writing %s: %w", docsPath, err)
	}
	result.FileChanged = true
	return result, nil
}

func buildStubs(annotations []Annotation) string {
	var sb strings.Builder
	for _, a := range annotations {
		anchor := toAnchor(a.Key)
		sb.WriteString(fmt.Sprintf("### %s {#%s}\n", a.Key, anchor))
		sb.WriteString("\n")
		sb.WriteString(fmt.Sprintf("**Type:** %s\n", a.Type))
		sb.WriteString("\n")
		sb.WriteString(fmt.Sprintf("**Example:** `%s: \"\"`\n", a.Key))
		sb.WriteString("\n")
	}
	return sb.String()
}

func insertStubs(content, stubs string) string {
	// Check if "## Needs documentation" section already exists
	needsDocIdx := strings.Index(content, "## Needs documentation")
	if needsDocIdx != -1 {
		// Find the end of the section (before <!-- vale on --> or EOF)
		valeOnIdx := strings.Index(content[needsDocIdx:], "<!-- vale on -->")
		if valeOnIdx != -1 {
			insertPoint := needsDocIdx + valeOnIdx
			// Insert stubs before <!-- vale on -->
			return content[:insertPoint] + stubs + content[insertPoint:]
		}
		// No vale on marker — append at end
		return content + "\n" + stubs
	}

	// No "Needs documentation" section — create one
	section := "\n## Needs documentation {#needs-documentation}\n\n" +
		":::caution\n" +
		"The following annotations were detected in the codebase but lack full documentation.\n" +
		"Entries are auto-generated stubs.\n" +
		":::\n\n" +
		stubs

	// Try to insert before <!-- vale on -->
	valeOnIdx := strings.LastIndex(content, "<!-- vale on -->")
	if valeOnIdx != -1 {
		return content[:valeOnIdx] + section + content[valeOnIdx:]
	}

	// No vale marker — append at end
	if !strings.HasSuffix(content, "\n") {
		content += "\n"
	}
	return content + section + "<!-- vale on -->\n"
}

// toAnchor converts "loft.sh/cluster-uid" to "loft-sh-cluster-uid"
func toAnchor(key string) string {
	r := strings.NewReplacer("/", "-", ".", "-")
	return r.Replace(key)
}
