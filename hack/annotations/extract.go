package main

import (
	"bufio"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
)

// Annotation holds an extracted annotation key, its classified type, and the
// Go doc comment from the constant definition (if any).
type Annotation struct {
	Key     string // e.g. "loft.sh/cluster-uid"
	Type    string // "Annotation", "Label", or "Finalizer"
	Comment string // Go doc comment text, empty if none
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
	typ     string
	comment string
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

		f, err := os.Open(path)
		if err != nil {
			return nil
		}
		defer f.Close()

		lowerPath := strings.ToLower(path)
		scanner := bufio.NewScanner(f)
		buf := make([]byte, 0, 256*1024)
		scanner.Buffer(buf, 1024*1024)

		var commentLines []string
		for scanner.Scan() {
			line := scanner.Text()

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

				// Only override if new entry has a comment or upgrading type
				if existing, ok := seen[key]; !ok || (existing.comment == "" && comment != "") {
					seen[key] = annotationEntry{typ: typ, comment: comment}
				} else if existing.typ == "Annotation" && typ != "Annotation" {
					seen[key] = annotationEntry{typ: typ, comment: existing.comment}
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
		result = append(result, Annotation{Key: key, Type: entry.typ, Comment: entry.comment})
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
