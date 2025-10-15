package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"
)

type RedirectHistory struct {
	Version   string     `json:"version"`
	Movements []Movement `json:"movements"`
	Metadata  Metadata   `json:"metadata"`
}

type Movement struct {
	From      string    `json:"from"`
	To        string    `json:"to"`
	Version   string    `json:"version"`
	Timestamp time.Time `json:"timestamp"`
}

type Metadata struct {
	Created     time.Time `json:"created"`
	LastUpdated time.Time `json:"last_updated"`
}

type PathChanges struct {
	Version string   `json:"version"`
	Changes []Change `json:"changes"`
}

type Change struct {
	Old string `json:"old"`
	New string `json:"new"`
}

type Resolver struct {
	historyFile string
	outputFile  string
	history     *RedirectHistory
}

func NewResolver(historyFile, outputFile string) *Resolver {
	return &Resolver{
		historyFile: historyFile,
		outputFile:  outputFile,
	}
}

func (r *Resolver) LoadHistory() error {
	if _, err := os.Stat(r.historyFile); os.IsNotExist(err) {
		// Ensure directory exists
		dir := filepath.Dir(r.historyFile)
		if err := os.MkdirAll(dir, 0755); err != nil {
			return fmt.Errorf("creating directory: %w", err)
		}
		
		r.history = &RedirectHistory{
			Version:   "1.0",
			Movements: []Movement{},
			Metadata: Metadata{
				Created:     time.Now().UTC(),
				LastUpdated: time.Now().UTC(),
			},
		}
		return r.SaveHistory()
	}

	data, err := os.ReadFile(r.historyFile)
	if err != nil {
		return fmt.Errorf("reading history file: %w", err)
	}

	r.history = &RedirectHistory{}
	if err := json.Unmarshal(data, r.history); err != nil {
		return fmt.Errorf("parsing history file: %w", err)
	}

	return nil
}

func (r *Resolver) SaveHistory() error {
	r.history.Metadata.LastUpdated = time.Now().UTC()
	
	data, err := json.MarshalIndent(r.history, "", "  ")
	if err != nil {
		return fmt.Errorf("marshaling history: %w", err)
	}

	if err := os.WriteFile(r.historyFile, data, 0644); err != nil {
		return fmt.Errorf("writing history file: %w", err)
	}

	return nil
}

func (r *Resolver) BuildGraph() map[string]string {
	graph := make(map[string]string)
	for _, movement := range r.history.Movements {
		if movement.From != "" && movement.To != "" {
			graph[movement.From] = movement.To
		}
	}
	return graph
}

func (r *Resolver) ResolveChain(start string, graph map[string]string) (string, bool) {
	visited := make(map[string]bool)
	current := start

	for {
		if visited[current] {
			return "", true // Cycle detected
		}

		next, exists := graph[current]
		if !exists {
			return current, false
		}

		visited[current] = true
		current = next
	}
}

func (r *Resolver) ResolveAll() (map[string]string, []string) {
	graph := r.BuildGraph()
	resolved := make(map[string]string)
	var cycles []string

	for source := range graph {
		target, hasCycle := r.ResolveChain(source, graph)
		if hasCycle {
			cycles = append(cycles, source)
		} else if target != source {
			resolved[source] = target
		}
	}

	return resolved, cycles
}

func (r *Resolver) DetectConflicts() map[string][]string {
	conflicts := make(map[string][]string)
	targets := make(map[string]map[string]bool)

	for _, movement := range r.history.Movements {
		if targets[movement.From] == nil {
			targets[movement.From] = make(map[string]bool)
		}
		targets[movement.From][movement.To] = true
	}

	for from, toMap := range targets {
		if len(toMap) > 1 {
			var toList []string
			for to := range toMap {
				toList = append(toList, to)
			}
			conflicts[from] = toList
		}
	}

	return conflicts
}

func (r *Resolver) GenerateHurlTests(resolved map[string]string) error {
	hurlFile := "hack/test-redirects.hurl"
	
	var tests strings.Builder
	tests.WriteString("# Auto-generated redirect tests\n")
	tests.WriteString("# Generated: " + time.Now().UTC().Format("2006-01-02 15:04:05 UTC") + "\n")
	tests.WriteString("# Usage: hurl --test --variable BASE_URL=https://www.vcluster.com test-redirects.hurl\n\n")
	
	basePath := "/docs/vcluster"
	
	var sortedKeys []string
	for k := range resolved {
		sortedKeys = append(sortedKeys, k)
	}
	sort.Strings(sortedKeys)
	
	for _, from := range sortedKeys {
		to := resolved[from]
		
		// Skip any paths with underscores - Docusaurus doesn't generate pages from underscore-prefixed directories
		if strings.Contains(from, "_") || strings.Contains(to, "_") {
			continue
		}
		
		// Test unversioned redirect
		tests.WriteString(fmt.Sprintf("# Test: %s -> %s\n", from, to))
		tests.WriteString(fmt.Sprintf("GET {{BASE_URL}}%s/%s/\n", basePath, from))
		tests.WriteString("HTTP 301\n")
		tests.WriteString("[Asserts]\n")
		tests.WriteString(fmt.Sprintf("header \"Location\" contains \"%s/%s\"\n\n", basePath, to))
		
		// Test /next/ redirect
		tests.WriteString(fmt.Sprintf("GET {{BASE_URL}}%s/next/%s/\n", basePath, from))
		tests.WriteString("HTTP 301\n")
		tests.WriteString("[Asserts]\n")
		tests.WriteString(fmt.Sprintf("header \"Location\" contains \"%s/next/%s\"\n\n", basePath, to))
		
		// Verify destination exists
		tests.WriteString(fmt.Sprintf("# Verify destination exists\n"))
		tests.WriteString(fmt.Sprintf("GET {{BASE_URL}}%s/%s/\n", basePath, to))
		tests.WriteString("HTTP 200\n\n")
	}
	
	if err := os.WriteFile(hurlFile, []byte(tests.String()), 0644); err != nil {
		return fmt.Errorf("writing hurl tests: %w", err)
	}
	
	return nil
}

func (r *Resolver) GenerateRedirects(resolved map[string]string) error {
	// Read existing netlify.toml
	existingContent, err := os.ReadFile(r.outputFile)
	if err != nil {
		return fmt.Errorf("reading netlify.toml: %w", err)
	}

	// Remove old auto-generated section if it exists
	content := string(existingContent)
	startMarker := "# AUTO-GENERATED REDIRECTS START"
	endMarker := "# AUTO-GENERATED REDIRECTS END"
	
	startIdx := strings.Index(content, startMarker)
	endIdx := strings.Index(content, endMarker)
	
	if startIdx != -1 && endIdx != -1 {
		content = content[:startIdx] + content[endIdx+len(endMarker):]
	}

	// Prepare new redirects
	var redirects strings.Builder
	redirects.WriteString("\n")
	redirects.WriteString("# AUTO-GENERATED REDIRECTS START\n")
	redirects.WriteString("# Do not edit manually - generated by redirect-resolver\n")
	redirects.WriteString(fmt.Sprintf("# Generated: %s\n", time.Now().UTC().Format("2006-01-02 15:04:05 UTC")))
	redirects.WriteString("# All redirects are transitively resolved to prevent redirect chains\n\n")

	basePath := "/docs/vcluster"
	
	var sortedKeys []string
	for k := range resolved {
		sortedKeys = append(sortedKeys, k)
	}
	sort.Strings(sortedKeys)

	for _, from := range sortedKeys {
		to := resolved[from]
		
		// Skip any paths with underscores - Docusaurus doesn't generate pages from underscore-prefixed directories
		if strings.Contains(from, "_") || strings.Contains(to, "_") {
			continue
		}
		
		// Unversioned
		redirects.WriteString("[[redirects]]\n")
		redirects.WriteString(fmt.Sprintf("  from = \"%s/%s\"\n", basePath, from))
		redirects.WriteString(fmt.Sprintf("  to = \"%s/%s\"\n", basePath, to))
		redirects.WriteString("  status = 301\n\n")
		
		// Next version
		redirects.WriteString("[[redirects]]\n")
		redirects.WriteString(fmt.Sprintf("  from = \"%s/next/%s\"\n", basePath, from))
		redirects.WriteString(fmt.Sprintf("  to = \"%s/next/%s\"\n", basePath, to))
		redirects.WriteString("  status = 301\n\n")
		
		// Wildcard versions
		redirects.WriteString("[[redirects]]\n")
		redirects.WriteString(fmt.Sprintf("  from = \"%s/*/%s\"\n", basePath, from))
		redirects.WriteString(fmt.Sprintf("  to = \"%s/:splat/%s\"\n", basePath, to))
		redirects.WriteString("  status = 301\n\n")
	}
	
	redirects.WriteString("# AUTO-GENERATED REDIRECTS END\n")

	// Write back
	if err := os.WriteFile(r.outputFile, []byte(content+redirects.String()), 0644); err != nil {
		return fmt.Errorf("writing netlify.toml: %w", err)
	}

	return nil
}

func (r *Resolver) ImportChanges(changesFile string) error {
	data, err := os.ReadFile(changesFile)
	if err != nil {
		if os.IsNotExist(err) {
			fmt.Printf("No path changes file found at: %s\n", changesFile)
			return nil
		}
		return fmt.Errorf("reading changes file: %w", err)
	}

	var changes PathChanges
	if err := json.Unmarshal(data, &changes); err != nil {
		return fmt.Errorf("parsing changes file: %w", err)
	}

	for _, change := range changes.Changes {
		if change.Old != "" && change.New != "" {
			r.history.Movements = append(r.history.Movements, Movement{
				From:      change.Old,
				To:        change.New,
				Version:   changes.Version,
				Timestamp: time.Now().UTC(),
			})
			fmt.Printf("Added movement: %s -> %s (version: %s)\n", change.Old, change.New, changes.Version)
		}
	}

	return r.SaveHistory()
}

func (r *Resolver) Audit(w io.Writer) {
	cycles := []string{}
	graph := r.BuildGraph()
	
	for source := range graph {
		_, hasCycle := r.ResolveChain(source, graph)
		if hasCycle {
			cycles = append(cycles, source)
		}
	}

	if len(cycles) > 0 {
		fmt.Fprintf(w, "⚠️  Warning: Cycles detected involving: %s\n", strings.Join(cycles, ", "))
	} else {
		fmt.Fprintln(w, "✅ No cycles detected")
	}

	conflicts := r.DetectConflicts()
	if len(conflicts) > 0 {
		fmt.Fprintln(w, "⚠️  Warning: Conflicting redirects detected:")
		for from, targets := range conflicts {
			fmt.Fprintf(w, "  %s -> %s\n", from, strings.Join(targets, ", "))
		}
	} else {
		fmt.Fprintln(w, "✅ No conflicts detected")
	}
}

func detectPathChanges(baseDir string) (*PathChanges, error) {
	versionDirs, err := filepath.Glob(filepath.Join(baseDir, "vcluster_versioned_docs", "version-*"))
	if err != nil || len(versionDirs) == 0 {
		return nil, fmt.Errorf("no versioned docs found")
	}

	sort.Strings(versionDirs)
	latestVersionDir := versionDirs[len(versionDirs)-1]
	version := filepath.Base(latestVersionDir)[8:] // Remove "version-" prefix

	currentFiles := make(map[string]string)
	previousFiles := make(map[string]string)

	err = filepath.Walk(filepath.Join(baseDir, "vcluster"), func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		// Skip directories that start with underscore - Docusaurus doesn't generate pages from these
		if info.IsDir() && strings.HasPrefix(info.Name(), "_") {
			return filepath.SkipDir
		}
		if !info.IsDir() && (strings.HasSuffix(path, ".md") || strings.HasSuffix(path, ".mdx")) {
			relPath := strings.TrimPrefix(path, filepath.Join(baseDir, "vcluster")+"/")
			relPath = strings.TrimSuffix(relPath, filepath.Ext(relPath))
			filename := filepath.Base(relPath)
			currentFiles[filename] = relPath
		}
		return nil
	})
	if err != nil {
		return nil, err
	}

	err = filepath.Walk(latestVersionDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		// Skip directories that start with underscore - Docusaurus doesn't generate pages from these
		if info.IsDir() && strings.HasPrefix(info.Name(), "_") {
			return filepath.SkipDir
		}
		if !info.IsDir() && (strings.HasSuffix(path, ".md") || strings.HasSuffix(path, ".mdx")) {
			relPath := strings.TrimPrefix(path, latestVersionDir+"/")
			relPath = strings.TrimSuffix(relPath, filepath.Ext(relPath))
			filename := filepath.Base(relPath)
			previousFiles[filename] = relPath
		}
		return nil
	})
	if err != nil {
		return nil, err
	}

	changes := &PathChanges{
		Version: version,
		Changes: []Change{},
	}

	for filename, oldPath := range previousFiles {
		newPath, exists := currentFiles[filename]
		// Only create redirects for files that exist in current docs but have moved
		// Skip files that have been deleted (not in currentFiles)
		if !exists {
			// File was deleted, no redirect needed
			continue
		}
		if oldPath != newPath {
			// Never create redirects for underscore directories - Docusaurus doesn't generate pages from these
			if strings.Contains(oldPath, "/_") || strings.Contains(newPath, "/_") {
				continue
			}
			changes.Changes = append(changes.Changes, Change{
				Old: oldPath,
				New: newPath,
			})
			fmt.Printf("Found: %s -> %s\n", oldPath, newPath)
		}
	}

	return changes, nil
}

func main() {
	var (
		mode        string
		historyFile string
		outputFile  string
		changesFile string
		baseDir     string
	)

	flag.StringVar(&mode, "mode", "update", "Operation mode: update, audit, resolve, detect")
	flag.StringVar(&historyFile, "history", "hack/redirect-history.json", "Path to redirect history JSON file")
	flag.StringVar(&outputFile, "output", "netlify.toml", "Output file for redirects")
	flag.StringVar(&changesFile, "changes", "hack/path-changes.json", "Path changes file")
	flag.StringVar(&baseDir, "base", ".", "Base directory for detecting changes")
	flag.Parse()

	resolver := NewResolver(historyFile, outputFile)

	if mode != "detect" {
		if err := resolver.LoadHistory(); err != nil {
			fmt.Fprintf(os.Stderr, "Error loading history: %v\n", err)
			os.Exit(1)
		}
	}

	switch mode {
	case "update":
		fmt.Println("=== Update Mode ===")
		if err := resolver.ImportChanges(changesFile); err != nil {
			fmt.Fprintf(os.Stderr, "Error importing changes: %v\n", err)
			os.Exit(1)
		}
		resolver.Audit(os.Stdout)
		resolved, cycles := resolver.ResolveAll()
		fmt.Printf("Resolved %d redirects, %d cycles detected\n", len(resolved), len(cycles))
		if err := resolver.GenerateRedirects(resolved); err != nil {
			fmt.Fprintf(os.Stderr, "Error generating redirects: %v\n", err)
			os.Exit(1)
		}
		if err := resolver.GenerateHurlTests(resolved); err != nil {
			fmt.Fprintf(os.Stderr, "Error generating hurl tests: %v\n", err)
			os.Exit(1)
		}
		fmt.Printf("✅ Generated redirects in %s and tests in hack/test-redirects.hurl\n", outputFile)

	case "audit":
		fmt.Println("=== Audit Mode ===")
		resolver.Audit(os.Stdout)

	case "resolve":
		fmt.Println("=== Resolve Mode ===")
		resolved, cycles := resolver.ResolveAll()
		fmt.Printf("Resolved %d redirects, %d cycles detected\n", len(resolved), len(cycles))
		if err := resolver.GenerateRedirects(resolved); err != nil {
			fmt.Fprintf(os.Stderr, "Error generating redirects: %v\n", err)
			os.Exit(1)
		}
		if err := resolver.GenerateHurlTests(resolved); err != nil {
			fmt.Fprintf(os.Stderr, "Error generating hurl tests: %v\n", err)
			os.Exit(1)
		}
		fmt.Printf("✅ Generated redirects in %s and tests in hack/test-redirects.hurl\n", outputFile)

	case "detect":
		fmt.Println("=== Detect Mode ===")
		changes, err := detectPathChanges(baseDir)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Error detecting changes: %v\n", err)
			os.Exit(1)
		}
		
		data, err := json.MarshalIndent(changes, "", "  ")
		if err != nil {
			fmt.Fprintf(os.Stderr, "Error marshaling changes: %v\n", err)
			os.Exit(1)
		}
		
		if err := os.WriteFile(changesFile, data, 0644); err != nil {
			fmt.Fprintf(os.Stderr, "Error writing changes file: %v\n", err)
			os.Exit(1)
		}
		fmt.Printf("Changes saved to %s\n", changesFile)

	default:
		fmt.Fprintf(os.Stderr, "Unknown mode: %s\n", mode)
		os.Exit(1)
	}

	fmt.Println("Done!")
}