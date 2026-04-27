package main

import (
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
)

// Annotation holds an extracted annotation key, its classified type, and the
// Go doc comment from the constant definition (if any).
type Annotation struct {
	Key           string `json:"key"`
	Type          string `json:"type"`
	Comment       string `json:"comment,omitempty"`
	SourceFile    string `json:"source_file,omitempty"`
	SourceContext string `json:"source_context,omitempty"`
}

// annotationPattern matches Go string literals containing known annotation namespaces.
var annotationPattern = regexp.MustCompile(
	`"((?:loft\.sh|sleepmode\.loft\.sh|vcluster\.loft\.sh|virtualcluster\.loft\.sh|drift\.loft\.sh|rbac\.loft\.sh|platform\.vcluster\.com)/[^"]+)"`,
)

// commentPattern matches Go single-line comments.
var commentPattern = regexp.MustCompile(`^\s*//\s*(.*)`)

// godocPrefixPattern strips the Go constant name and connecting verb from doc comments.
// Matches: "ConstName is ...", "ConstName specifies ...", "ConstName holds ...", etc.
var godocPrefixPattern = regexp.MustCompile(`^\w+\s+(?:is\s+(?:used\s+to\s+|the\s+)?|specifies\s+|holds\s+|indicates\s+|signals\s+|marks\s+|stores\s+|contains\s+|defines\s+|controls\s+|prevents\s+|skips\s+)`)

// Filters applied after extraction.
var (
	filterFormatSpec = regexp.MustCompile(`%[sdvftwq]`)
	filterUUIDSuffix = regexp.MustCompile(`-[a-f0-9]{10}$`)
)

// annotationEntry tracks an annotation with its comment and type for deduplication.
type annotationEntry struct {
	typ           string
	comment       string
	sourceFile    string
	sourceContext string
}

// ExtractAnnotations walks all .go files under root and returns sorted, deduplicated annotations.
// Only annotations with a Go doc comment on the preceding line are included.
func ExtractAnnotations(root string) ([]Annotation, error) {
	seen := make(map[string]annotationEntry) // key → entry

	err := filepath.Walk(root, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return nil // skip inaccessible files
		}
		if info.IsDir() {
			base := info.Name()
			if base == ".git" || base == "vendor" || base == "node_modules" {
				return filepath.SkipDir
			}
			return nil
		}
		if !strings.HasSuffix(path, ".go") {
			return nil
		}

		data, err := os.ReadFile(path)
		if err != nil {
			return nil
		}
		lines := strings.Split(string(data), "\n")

		relPath, _ := filepath.Rel(root, path)
		lowerPath := strings.ToLower(path)

		var commentLines []string
		for lineNum, line := range lines {

			// Track comments: accumulate consecutive comment lines
			if m := commentPattern.FindStringSubmatch(line); m != nil {
				commentLines = append(commentLines, strings.TrimSpace(m[1]))
				continue
			}

			// Check for annotation on this line
			matches := annotationPattern.FindAllStringSubmatch(line, -1)
			for _, m := range matches {
				key := m[1]
				if !isValidAnnotation(key) {
					continue
				}

				// Only include annotations that have a Go doc comment
				if len(commentLines) == 0 {
					continue
				}

				comment := cleanComment(strings.Join(commentLines, " "))
				typ := classifyType(key, line, lowerPath)
				ctx := extractContext(lines, lineNum, 15)

				// Only override if new entry has a comment or upgrading type
				if existing, ok := seen[key]; !ok || (existing.comment == "" && comment != "") {
					seen[key] = annotationEntry{typ: typ, comment: comment, sourceFile: relPath, sourceContext: ctx}
				} else if existing.typ == "Annotation" && typ != "Annotation" {
					seen[key] = annotationEntry{typ: typ, comment: existing.comment, sourceFile: existing.sourceFile, sourceContext: existing.sourceContext}
				}
			}

			// Reset comment tracker on any non-comment line (including blanks)
			commentLines = nil
		}
		return nil
	})
	if err != nil {
		return nil, err
	}

	result := make([]Annotation, 0, len(seen))
	for key, entry := range seen {
		result = append(result, Annotation{
			Key:           key,
			Type:          entry.typ,
			Comment:       entry.comment,
			SourceFile:    entry.sourceFile,
			SourceContext: entry.sourceContext,
		})
	}
	sort.Slice(result, func(i, j int) bool {
		return result[i].Key < result[j].Key
	})
	return result, nil
}

func isValidAnnotation(key string) bool {
	if filterFormatSpec.MatchString(key) {
		return false
	}
	if strings.HasSuffix(key, "=") {
		return false
	}
	if idx := strings.Index(key, "="); idx != -1 {
		return false
	}
	parts := strings.SplitN(key, "/", 2)
	if len(parts) < 2 || parts[1] == "" {
		return false
	}
	if strings.HasSuffix(key, "-") || strings.HasSuffix(key, "/") {
		return false
	}
	if filterUUIDSuffix.MatchString(key) {
		return false
	}
	return true
}

func classifyType(key, line, lowerPath string) string {
	lowerLine := strings.ToLower(line)

	if strings.Contains(lowerLine, "label") {
		return "Label"
	}
	if strings.Contains(lowerLine, "finalizer") {
		return "Finalizer"
	}

	if strings.Contains(lowerPath, "label") {
		return "Label"
	}
	if strings.Contains(lowerPath, "finalizer") {
		return "Finalizer"
	}

	return "Annotation"
}

// extractContext returns lines[lineNum-radius : lineNum+radius] joined by newlines.
func extractContext(lines []string, lineNum, radius int) string {
	start := lineNum - radius
	if start < 0 {
		start = 0
	}
	end := lineNum + radius + 1
	if end > len(lines) {
		end = len(lines)
	}
	return strings.Join(lines[start:end], "\n")
}

// cleanComment strips Go doc comment prefixes like "ConstName is used to ..."
// and capitalizes the first letter of the remaining text.
func cleanComment(s string) string {
	s = strings.TrimSpace(s)
	if s == "" {
		return ""
	}
	cleaned := godocPrefixPattern.ReplaceAllString(s, "")
	if cleaned == s {
		// No prefix matched — return as-is
		return s
	}
	cleaned = strings.TrimSpace(cleaned)
	if cleaned == "" {
		return s
	}
	// Capitalize first letter
	return strings.ToUpper(cleaned[:1]) + cleaned[1:]
}
