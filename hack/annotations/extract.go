package main

import (
	"bufio"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
)

// Annotation holds an extracted annotation key and its classified type.
type Annotation struct {
	Key  string // e.g. "loft.sh/cluster-uid"
	Type string // "Annotation", "Label", or "Finalizer"
}

// annotationPattern matches Go string literals containing known annotation namespaces.
var annotationPattern = regexp.MustCompile(
	`"((?:loft\.sh|sleepmode\.loft\.sh|vcluster\.loft\.sh|virtualcluster\.loft\.sh|drift\.loft\.sh|rbac\.loft\.sh|platform\.vcluster\.com)/[^"]+)"`,
)

// Filters applied after extraction.
var (
	filterFormatSpec = regexp.MustCompile(`%[sdvftwq]`)
	filterUUIDSuffix = regexp.MustCompile(`-[a-f0-9]{10}$`)
)

// ExtractAnnotations walks all .go files under root and returns sorted, deduplicated annotations.
func ExtractAnnotations(root string) ([]Annotation, error) {
	seen := make(map[string]string) // key → type

	err := filepath.Walk(root, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return nil // skip inaccessible files
		}
		if info.IsDir() {
			// Skip .git and vendor directories
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

		for scanner.Scan() {
			line := scanner.Text()
			matches := annotationPattern.FindAllStringSubmatch(line, -1)
			for _, m := range matches {
				key := m[1]
				if !isValidAnnotation(key) {
					continue
				}
				// Classify type
				typ := classifyType(key, line, lowerPath)
				// Only override if upgrading from default "Annotation"
				if existing, ok := seen[key]; !ok || existing == "Annotation" {
					seen[key] = typ
				}
			}
		}
		return nil
	})
	if err != nil {
		return nil, err
	}

	result := make([]Annotation, 0, len(seen))
	for key, typ := range seen {
		result = append(result, Annotation{Key: key, Type: typ})
	}
	sort.Slice(result, func(i, j int) bool {
		return result[i].Key < result[j].Key
	})
	return result, nil
}

func isValidAnnotation(key string) bool {
	// Exclude format specifiers
	if filterFormatSpec.MatchString(key) {
		return false
	}
	// Exclude assignment patterns
	if strings.HasSuffix(key, "=") {
		return false
	}
	// Exclude boolean/value assignments
	if idx := strings.Index(key, "="); idx != -1 {
		return false
	}
	// Exclude bare namespaces (no key after /)
	parts := strings.SplitN(key, "/", 2)
	if len(parts) < 2 || parts[1] == "" {
		return false
	}
	// Exclude prefix constants (e.g. "vcluster.loft.sh/token-")
	if strings.HasSuffix(key, "-") || strings.HasSuffix(key, "/") {
		return false
	}
	// Exclude UUID-like suffixes (generated names)
	if filterUUIDSuffix.MatchString(key) {
		return false
	}
	return true
}

func classifyType(key, line, lowerPath string) string {
	lowerLine := strings.ToLower(line)

	// Check line context
	if strings.Contains(lowerLine, "label") {
		return "Label"
	}
	if strings.Contains(lowerLine, "finalizer") {
		return "Finalizer"
	}

	// Check filename
	if strings.Contains(lowerPath, "label") {
		return "Label"
	}
	if strings.Contains(lowerPath, "finalizer") {
		return "Finalizer"
	}

	return "Annotation"
}
