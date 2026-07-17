package main

import (
	"bytes"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"

	"gopkg.in/yaml.v3"
)

// yamlFenceOpen matches the opening of a ```yaml / ```yml fenced block,
// including Docusaurus-attributed fences (```yaml title="vcluster.yaml",
// ```yaml {3-5}), which most docs pages use.
var yamlFenceOpen = regexp.MustCompile("^\\s*```ya?ml(\\s.*)?$")

// fenceClose matches any fenced-block delimiter line.
var fenceClose = regexp.MustCompile("^\\s*```\\s*$")

// driftIgnoreMarker opts a fence out of scanning when it appears on the line
// directly above the opening fence, e.g. {/* drift-ignore */} in MDX or
// <!-- drift-ignore --> in plain Markdown. Deliberate examples of deprecated
// or removed config (migration guides) use it so every release-sync run does
// not re-flag them and prompt the fix drafter to "correct" intentional docs.
const driftIgnoreMarker = "drift-ignore"

// freeFormMapPaths are known schema paths that are Go map[string]struct fields.
// The generator enumerates the value struct's fields directly beneath the path
// (so the path "has known children"), but the real key level is user-defined,
// so the user's keys must not be flagged as unknown. Descent stops at these.
var freeFormMapPaths = map[string]bool{
	"sync.toHost.customResources":        true,
	"sync.fromHost.customResources":      true,
	"experimental.proxy.customResources": true,
	"plugins":                            true,
	"plugin":                             true,
}

// undocumentedRoots are top-level keys that exist in the product's
// values.schema.json but are deliberately absent from the generated config
// reference partials (the ground truth), so their validity cannot be judged
// from the partials. They are skipped entirely rather than flagged.
var undocumentedRoots = map[string]bool{
	"pro":         true,
	"global":      true,
	"serviceCIDR": true,
}

// ScanProse walks docsRoot for prose files, extracts ```yaml blocks that look
// like vcluster.yaml, and reports unknown (hard) and deprecated (soft) field
// references against the schema ground truth. The config-partials directory and
// CLI ground-truth directory are skipped.
func ScanProse(docsRoot string, gt *ConfigGroundTruth) ([]Finding, error) {
	var findings []Finding

	err := filepath.Walk(docsRoot, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return nil
		}
		if info.IsDir() {
			if skipDir(path, info.Name()) {
				return filepath.SkipDir
			}
			return nil
		}
		if !strings.HasSuffix(path, ".mdx") && !strings.HasSuffix(path, ".md") {
			return nil
		}
		data, err := os.ReadFile(path)
		if err != nil {
			// Skipping silently would mask drift that lives only in this file;
			// make the skip visible without failing the scan.
			fmt.Fprintf(os.Stderr, "WARN: skipping %s: %v\n", path, err)
			return nil
		}
		findings = append(findings, scanFile(path, string(data), gt)...)
		return nil
	})
	if err != nil {
		return nil, err
	}

	sort.Slice(findings, func(i, j int) bool {
		if findings[i].File != findings[j].File {
			return findings[i].File < findings[j].File
		}
		if findings[i].LineNumber != findings[j].LineNumber {
			return findings[i].LineNumber < findings[j].LineNumber
		}
		return findings[i].Path < findings[j].Path
	})
	return findings, nil
}

// scanFile extracts ```yaml blocks from one file and validates each.
func scanFile(path, content string, gt *ConfigGroundTruth) []Finding {
	var findings []Finding
	lines := strings.Split(content, "\n")

	i := 0
	for i < len(lines) {
		if !yamlFenceOpen.MatchString(lines[i]) {
			i++
			continue
		}
		ignored := i > 0 && strings.Contains(lines[i-1], driftIgnoreMarker)
		// lines[i] is the opening fence (0-indexed i, 1-indexed i+1), so the
		// first content line is 1-indexed i+2. yaml.Node.Line is 1-indexed
		// within the block, so a key's file line is blockStart + node.Line - 1.
		blockStart := i + 2
		var block []string
		i++
		for i < len(lines) && !fenceClose.MatchString(lines[i]) {
			block = append(block, lines[i])
			i++
		}
		i++ // consume closing fence

		if ignored {
			continue
		}
		findings = append(findings, validateBlock(path, blockStart, strings.Join(block, "\n"), gt)...)
	}
	return findings
}

// validateBlock parses a single YAML block (possibly multiple documents) and
// walks every document that looks like vcluster.yaml.
func validateBlock(path string, blockStartLine int, block string, gt *ConfigGroundTruth) []Finding {
	var findings []Finding

	dec := yaml.NewDecoder(bytes.NewReader([]byte(block)))
	for {
		var doc yaml.Node
		if err := dec.Decode(&doc); err != nil {
			// Parse error (templated YAML, partial snippet, etc.) — skip the
			// rest of this block. Not a tool error.
			break
		}
		root := documentMapping(&doc)
		if root == nil {
			continue
		}
		if !looksLikeVClusterYAML(root, gt) {
			continue
		}
		walk(path, blockStartLine, root, "", gt, &findings)
	}
	return findings
}

// documentMapping returns the top-level mapping node of a decoded document, or
// nil if the document is not a mapping.
func documentMapping(doc *yaml.Node) *yaml.Node {
	n := doc
	if n.Kind == yaml.DocumentNode && len(n.Content) > 0 {
		n = n.Content[0]
	}
	if n.Kind == yaml.MappingNode {
		return n
	}
	return nil
}

// looksLikeVClusterYAML reports whether any top-level key is a known schema root.
func looksLikeVClusterYAML(m *yaml.Node, gt *ConfigGroundTruth) bool {
	for i := 0; i+1 < len(m.Content); i += 2 {
		if gt.roots[m.Content[i].Value] {
			return true
		}
	}
	return false
}

// walk validates each key of a mapping node against the schema, recording
// findings and recursing only into known structured fields.
func walk(file string, blockStart int, m *yaml.Node, prefix string, gt *ConfigGroundTruth, out *[]Finding) {
	for i := 0; i+1 < len(m.Content); i += 2 {
		keyNode := m.Content[i]
		valNode := m.Content[i+1]
		key := keyNode.Value

		// Template placeholders (`<resource>:`) and their subtrees are not
		// decidable against the schema.
		if strings.ContainsAny(key, "<>") {
			continue
		}
		if prefix == "" && undocumentedRoots[key] {
			continue
		}

		path := key
		if prefix != "" {
			path = prefix + "." + key
		}

		switch {
		case gt.known[path]:
			if note, dep := gt.deprecated[path]; dep {
				*out = append(*out, Finding{
					File: file, LineNumber: blockStart + keyNode.Line - 1,
					Path: path, Kind: "deprecated", Detail: note,
				})
			}
			if freeFormMapPaths[path] {
				continue // user-defined keys below; schema stops here
			}
			recurse(file, blockStart, valNode, path, gt, out)
		default:
			// Unknown key. Flag it only when its parent is a structured object
			// with known children; beneath a scalar or free-form map we cannot
			// tell drift from user data. Never descend past an unknown key.
			if gt.hasChild[prefix] {
				*out = append(*out, Finding{
					File: file, LineNumber: blockStart + keyNode.Line - 1,
					Path: path, Kind: "unknown",
				})
			}
		}
	}
}

// recurse descends into a value node: mapping → walk; sequence → walk each
// mapping element under the same path (array indices are collapsed, matching
// how the schema anchors represent list-of-object fields).
func recurse(file string, blockStart int, val *yaml.Node, path string, gt *ConfigGroundTruth, out *[]Finding) {
	switch val.Kind {
	case yaml.MappingNode:
		walk(file, blockStart, val, path, gt, out)
	case yaml.SequenceNode:
		for _, el := range val.Content {
			if el.Kind == yaml.MappingNode {
				walk(file, blockStart, el, path, gt, out)
			}
		}
	}
}

// skipDir prunes VCS/build noise plus the generated ground-truth trees.
func skipDir(path, name string) bool {
	switch name {
	case ".git", "node_modules", "vendor", "build", ".docusaurus":
		return true
	}
	slash := filepath.ToSlash(path)
	// Skip the config partials (the ground truth) and the CLI docs.
	if strings.Contains(slash, "/_partials/config") || (name == "cli" && strings.Contains(slash, "/cli")) {
		return true
	}
	return false
}
