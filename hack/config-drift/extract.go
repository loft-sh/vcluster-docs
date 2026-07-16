package main

import (
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

// anchorPattern matches a config-field heading anchor, e.g.
// "... {#exportKubeConfig-additionalSecrets-serviceAccount-name}". The anchor,
// with '-' rewritten to '.', IS the dotted schema path.
var anchorPattern = regexp.MustCompile(`\{#([A-Za-z0-9][A-Za-z0-9-]*)\}`)

// ConfigGroundTruth is the parsed vcluster.yaml schema ground truth derived
// from the generated config partials.
type ConfigGroundTruth struct {
	// known is the set of every valid dotted schema path.
	known map[string]bool
	// deprecated maps a deprecated dotted path to the note explaining the
	// replacement (the text of the "Deprecated..." line).
	deprecated map[string]string
	// hasChild is the set of paths (plus "" for the root) that have at least
	// one known child. A path with no known children is a scalar or a
	// free-form map, so unknown keys beneath it must not be flagged.
	hasChild map[string]bool
	// roots is the set of authoritative top-level schema keys, taken from the
	// single-segment anchors of the depth-1 partial files.
	roots map[string]bool
}

// deprecatedPattern matches the Go "Deprecated:" doc convention that the schema
// generator preserves in the field description, e.g.
// "Deprecated: Use AdditionalSecrets instead." It is intentionally
// case-sensitive so a lowercase "deprecated" mentioned in prose about some
// other field does not mark this field deprecated.
var deprecatedPattern = regexp.MustCompile(`\bDeprecated\b`)

// ParseConfigPartials walks configDir (vcluster/_partials/config) and builds the
// schema ground truth from every "*.mdx" heading anchor. Both the full-path
// anchors of the depth-1 files (e.g. sync-toHost-pods) and the relative anchors
// of the nested fragment files contribute to the known set; only the depth-1
// single-segment anchors define the authoritative top-level roots.
func ParseConfigPartials(configDir string) (*ConfigGroundTruth, error) {
	gt := &ConfigGroundTruth{
		known:      make(map[string]bool),
		deprecated: make(map[string]string),
		hasChild:   make(map[string]bool),
		roots:      make(map[string]bool),
	}

	err := filepath.Walk(configDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return nil
		}
		if info.IsDir() {
			return nil
		}
		if !strings.HasSuffix(path, ".mdx") {
			return nil
		}
		data, err := os.ReadFile(path)
		if err != nil {
			return nil
		}
		// Depth-1 files (directly under configDir) carry full-path anchors and
		// define the authoritative roots.
		isDepth1 := filepath.Dir(path) == filepath.Clean(configDir)
		gt.ingestFile(string(data), isDepth1)
		return nil
	})
	if err != nil {
		return nil, err
	}
	return gt, nil
}

// ingestFile parses one partial file's anchors into the ground truth.
func (gt *ConfigGroundTruth) ingestFile(content string, isDepth1 bool) {
	lines := strings.Split(content, "\n")

	currentPath := ""
	for _, line := range lines {
		if m := anchorPattern.FindStringSubmatch(line); m != nil {
			path := strings.ReplaceAll(m[1], "-", ".")
			gt.known[path] = true
			gt.hasChild[parentPath(path)] = true
			if isDepth1 && !strings.Contains(path, ".") {
				gt.roots[path] = true
			}
			currentPath = path
			continue
		}
		// Body text between this heading and the next: a "Deprecated" marker
		// applies to the current field.
		if currentPath != "" && deprecatedPattern.MatchString(line) {
			if _, seen := gt.deprecated[currentPath]; !seen {
				gt.deprecated[currentPath] = strings.TrimSpace(line)
			}
		}
	}
}

// parentPath returns the dotted parent of a path ("" for a top-level key).
func parentPath(path string) string {
	if idx := strings.LastIndexByte(path, '.'); idx != -1 {
		return path[:idx]
	}
	return ""
}
