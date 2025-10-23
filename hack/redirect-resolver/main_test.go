package main

import (
	"bytes"
	"encoding/json"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

func TestResolveChain(t *testing.T) {
	tests := []struct {
		name       string
		graph      map[string]string
		start      string
		wantTarget string
		wantCycle  bool
	}{
		{
			name: "simple chain",
			graph: map[string]string{
				"a": "b",
				"b": "c",
				"c": "d",
			},
			start:      "a",
			wantTarget: "d",
			wantCycle:  false,
		},
		{
			name: "direct mapping",
			graph: map[string]string{
				"x": "y",
			},
			start:      "x",
			wantTarget: "y",
			wantCycle:  false,
		},
		{
			name: "cycle detection",
			graph: map[string]string{
				"a": "b",
				"b": "c",
				"c": "a",
			},
			start:      "a",
			wantTarget: "",
			wantCycle:  true,
		},
		{
			name: "no mapping",
			graph: map[string]string{
				"a": "b",
			},
			start:      "z",
			wantTarget: "z",
			wantCycle:  false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			r := &Resolver{}
			target, hasCycle := r.ResolveChain(tt.start, tt.graph)

			if hasCycle != tt.wantCycle {
				t.Errorf("ResolveChain() hasCycle = %v, want %v", hasCycle, tt.wantCycle)
			}

			if target != tt.wantTarget {
				t.Errorf("ResolveChain() target = %v, want %v", target, tt.wantTarget)
			}
		})
	}
}

func TestResolveAll(t *testing.T) {
	r := &Resolver{
		history: &RedirectHistory{
			Movements: []Movement{
				{From: "a", To: "b"},
				{From: "b", To: "c"},
				{From: "c", To: "d"},
				{From: "x", To: "y"},
				{From: "y", To: "z"},
			},
		},
	}

	resolved, cycles := r.ResolveAll()

	expectedResolved := map[string]string{
		"a": "d",
		"b": "d",
		"c": "d",
		"x": "z",
		"y": "z",
	}

	if len(resolved) != len(expectedResolved) {
		t.Errorf("ResolveAll() returned %d resolved, want %d", len(resolved), len(expectedResolved))
	}

	for from, expectedTo := range expectedResolved {
		if actualTo, exists := resolved[from]; !exists || actualTo != expectedTo {
			t.Errorf("ResolveAll() resolved[%s] = %s, want %s", from, actualTo, expectedTo)
		}
	}

	if len(cycles) != 0 {
		t.Errorf("ResolveAll() detected %d cycles, want 0", len(cycles))
	}
}

func TestDetectConflicts(t *testing.T) {
	r := &Resolver{
		history: &RedirectHistory{
			Movements: []Movement{
				{From: "page", To: "location1"},
				{From: "page", To: "location2"},
				{From: "other", To: "dest"},
			},
		},
	}

	conflicts := r.DetectConflicts()

	if len(conflicts) != 1 {
		t.Errorf("DetectConflicts() found %d conflicts, want 1", len(conflicts))
	}

	if targets, exists := conflicts["page"]; !exists {
		t.Error("DetectConflicts() did not find conflict for 'page'")
	} else {
		if len(targets) != 2 {
			t.Errorf("DetectConflicts() found %d targets for 'page', want 2", len(targets))
		}
	}
}

func TestGenerateRedirects(t *testing.T) {
	tempFile := filepath.Join(t.TempDir(), "netlify.toml")

	// Create initial file
	os.WriteFile(tempFile, []byte("# Initial content\n"), 0644)

	r := &Resolver{
		outputFile: tempFile,
	}

	resolved := map[string]string{
		"old/path": "new/path",
		"api/v1":   "api/v2",
	}

	if err := r.GenerateRedirects(resolved); err != nil {
		t.Fatalf("GenerateRedirects() error = %v", err)
	}

	content, err := os.ReadFile(tempFile)
	if err != nil {
		t.Fatalf("Failed to read generated file: %v", err)
	}

	contentStr := string(content)

	// Check for expected redirect patterns
	expectedPatterns := []string{
		`from = "/docs/vcluster/api/v1"`,
		`to = "/docs/vcluster/api/v2"`,
		`from = "/docs/vcluster/old/path"`,
		`to = "/docs/vcluster/new/path"`,
		`status = 301`,
	}

	for _, expected := range expectedPatterns {
		if !strings.Contains(contentStr, expected) {
			t.Errorf("Generated redirects missing pattern: %s", expected)
		}
	}
}

func TestImportChanges(t *testing.T) {
	tempHistory := filepath.Join(t.TempDir(), "history.json")
	tempChanges := filepath.Join(t.TempDir(), "changes.json")

	changes := PathChanges{
		Version: "0.28.0",
		Changes: []Change{
			{Old: "old/file", New: "new/file"},
			{Old: "api/old", New: "api/new"},
		},
	}

	changesData, _ := json.Marshal(changes)
	if err := os.WriteFile(tempChanges, changesData, 0644); err != nil {
		t.Fatalf("Failed to write test changes file: %v", err)
	}

	r := &Resolver{
		historyFile: tempHistory,
		history: &RedirectHistory{
			Version:   "1.0",
			Movements: []Movement{},
			Metadata: Metadata{
				Created:     time.Now(),
				LastUpdated: time.Now(),
			},
		},
	}

	if err := r.ImportChanges(tempChanges); err != nil {
		t.Fatalf("ImportChanges() error = %v", err)
	}

	if len(r.history.Movements) != 2 {
		t.Errorf("ImportChanges() resulted in %d movements, want 2", len(r.history.Movements))
	}

	for i, expected := range changes.Changes {
		actual := r.history.Movements[i]
		if actual.From != expected.Old || actual.To != expected.New {
			t.Errorf("ImportChanges() movement[%d] = %s->%s, want %s->%s",
				i, actual.From, actual.To, expected.Old, expected.New)
		}
	}
}

func TestAudit(t *testing.T) {
	tests := []struct {
		name          string
		movements     []Movement
		wantCycles    bool
		wantConflicts bool
	}{
		{
			name: "no issues",
			movements: []Movement{
				{From: "a", To: "b"},
				{From: "c", To: "d"},
			},
			wantCycles:    false,
			wantConflicts: false,
		},
		{
			name: "with cycle",
			movements: []Movement{
				{From: "a", To: "b"},
				{From: "b", To: "c"},
				{From: "c", To: "a"},
			},
			wantCycles:    true,
			wantConflicts: false,
		},
		{
			name: "with conflict",
			movements: []Movement{
				{From: "page", To: "loc1"},
				{From: "page", To: "loc2"},
			},
			wantCycles:    false,
			wantConflicts: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			r := &Resolver{
				history: &RedirectHistory{
					Movements: tt.movements,
				},
			}

			var buf bytes.Buffer
			r.Audit(&buf)
			output := buf.String()

			if tt.wantCycles && !strings.Contains(output, "Cycles detected") {
				t.Error("Audit() did not detect expected cycles")
			}

			if !tt.wantCycles && strings.Contains(output, "Cycles detected") {
				t.Error("Audit() incorrectly detected cycles")
			}

			if tt.wantConflicts && !strings.Contains(output, "Conflicting redirects") {
				t.Error("Audit() did not detect expected conflicts")
			}

			if !tt.wantConflicts && strings.Contains(output, "Conflicting redirects") {
				t.Error("Audit() incorrectly detected conflicts")
			}
		})
	}
}

func TestLoadSaveHistory(t *testing.T) {
	tempFile := filepath.Join(t.TempDir(), "test-history.json")

	r := &Resolver{
		historyFile: tempFile,
	}

	// Test creating new history
	if err := r.LoadHistory(); err != nil {
		t.Fatalf("LoadHistory() error creating new history: %v", err)
	}

	if r.history == nil {
		t.Fatal("LoadHistory() did not initialize history")
	}

	// Add some movements
	r.history.Movements = append(r.history.Movements, Movement{
		From:      "test/old",
		To:        "test/new",
		Version:   "1.0.0",
		Timestamp: time.Now(),
	})

	// Save history
	if err := r.SaveHistory(); err != nil {
		t.Fatalf("SaveHistory() error: %v", err)
	}

	// Load again
	r2 := &Resolver{historyFile: tempFile}
	if err := r2.LoadHistory(); err != nil {
		t.Fatalf("LoadHistory() error loading existing history: %v", err)
	}

	if len(r2.history.Movements) != 1 {
		t.Errorf("LoadHistory() loaded %d movements, want 1", len(r2.history.Movements))
	}

	if r2.history.Movements[0].From != "test/old" {
		t.Errorf("LoadHistory() loaded movement from = %s, want test/old", r2.history.Movements[0].From)
	}
}

func TestTransitiveResolution(t *testing.T) {
	// Test the key feature: A->B->C->D should resolve to A->D, B->D, C->D
	r := &Resolver{
		history: &RedirectHistory{
			Movements: []Movement{
				{From: "learn-how-to/kai-scheduler", To: "integrations/scheduler/kai-scheduler"},
				{From: "integrations/scheduler/kai-scheduler", To: "third-party/scheduler/kai-scheduler"},
			},
		},
	}

	resolved, _ := r.ResolveAll()

	// Both old paths should resolve to the final destination
	if resolved["learn-how-to/kai-scheduler"] != "third-party/scheduler/kai-scheduler" {
		t.Errorf("Transitive resolution failed for oldest path")
	}

	if resolved["integrations/scheduler/kai-scheduler"] != "third-party/scheduler/kai-scheduler" {
		t.Errorf("Transitive resolution failed for intermediate path")
	}
}

// Helper functions for git-based tests

// createTestGitRepo creates a temporary git repository for testing
func createTestGitRepo(t *testing.T) (string, func()) {
	t.Helper()

	repoPath := t.TempDir()

	// Initialize git repo
	runGitCmd(t, repoPath, "init")
	runGitCmd(t, repoPath, "config", "user.email", "test@example.com")
	runGitCmd(t, repoPath, "config", "user.name", "Test User")

	return repoPath, func() {
		// Cleanup handled by t.TempDir()
	}
}

// runGitCmd runs a git command in the specified directory
func runGitCmd(t *testing.T, dir string, args ...string) {
	t.Helper()

	cmd := exec.Command("git", args...)
	cmd.Dir = dir
	output, err := cmd.CombinedOutput()
	if err != nil {
		t.Fatalf("git %v failed: %v\nOutput: %s", args, err, output)
	}
}

// createFile creates a file with given content in the repo
func createFile(t *testing.T, repoPath, filePath, content string) {
	t.Helper()

	fullPath := filepath.Join(repoPath, filePath)
	dir := filepath.Dir(fullPath)

	if err := os.MkdirAll(dir, 0755); err != nil {
		t.Fatalf("Failed to create directory %s: %v", dir, err)
	}

	if err := os.WriteFile(fullPath, []byte(content), 0644); err != nil {
		t.Fatalf("Failed to write file %s: %v", fullPath, err)
	}
}

// Git-based move detection tests

// TestDetectFileMoves_FileCopy_NotDetectedAsMove verifies that file copies are not detected as moves
func TestDetectFileMoves_FileCopy_NotDetectedAsMove(t *testing.T) {
	repoPath, cleanup := createTestGitRepo(t)
	defer cleanup()

	// Commit 1: Create file at control-plane location
	createFile(t, repoPath, "vcluster/deploy/control-plane/container/security/air-gapped.mdx", "# Air-gapped setup\nContent here")
	runGitCmd(t, repoPath, "add", ".")
	runGitCmd(t, repoPath, "commit", "-m", "Add air-gapped doc at control-plane location")
	runGitCmd(t, repoPath, "tag", "v0.20.0")

	// Commit 2: COPY file to private-nodes location (both paths now exist)
	createFile(t, repoPath, "vcluster/deploy/worker-nodes/private-nodes/security/air-gapped.mdx", "# Air-gapped setup\nContent here")
	runGitCmd(t, repoPath, "add", ".")
	runGitCmd(t, repoPath, "commit", "-m", "Copy air-gapped doc to private-nodes location")
	runGitCmd(t, repoPath, "tag", "v0.21.0")

	// Detect moves between v0.20.0 and v0.21.0
	moves, err := DetectFileMoves(repoPath, "v0.20.0", "v0.21.0")
	if err != nil {
		t.Fatalf("DetectFileMoves() error = %v", err)
	}

	// Should NOT detect any moves (file was copied, not moved)
	if len(moves) > 0 {
		t.Errorf("DetectFileMoves() detected %d moves for a file COPY operation", len(moves))
		for _, move := range moves {
			t.Errorf("  Incorrectly detected: %s -> %s", move.OldPath, move.NewPath)
		}
		t.Fatal("File copies must NOT be detected as moves")
	}
}

// TestDetectFileMoves_MultipleBasename_DetectsOnlyActualMove verifies correct move detection with multiple files sharing the same basename
func TestDetectFileMoves_MultipleBasename_DetectsOnlyActualMove(t *testing.T) {
	repoPath, cleanup := createTestGitRepo(t)
	defer cleanup()

	// Commit 1: Create two files with same name in different directories
	createFile(t, repoPath, "vcluster/docs/feature-a/config.mdx", "# Feature A Config\nConfig for A")
	createFile(t, repoPath, "vcluster/docs/feature-b/config.mdx", "# Feature B Config\nConfig for B")
	runGitCmd(t, repoPath, "add", ".")
	runGitCmd(t, repoPath, "commit", "-m", "Add two config.mdx files")
	runGitCmd(t, repoPath, "tag", "v1.0.0")

	// Commit 2: Move ONLY feature-a/config.mdx to feature-c/config.mdx
	// feature-b/config.mdx stays in place
	// Create target directory first
	targetDir := filepath.Join(repoPath, "vcluster/docs/feature-c")
	if err := os.MkdirAll(targetDir, 0755); err != nil {
		t.Fatalf("Failed to create target directory: %v", err)
	}
	runGitCmd(t, repoPath, "mv", "vcluster/docs/feature-a/config.mdx", "vcluster/docs/feature-c/config.mdx")
	runGitCmd(t, repoPath, "commit", "-m", "Move feature-a config to feature-c")
	runGitCmd(t, repoPath, "tag", "v1.1.0")

	// Detect moves
	moves, err := DetectFileMoves(repoPath, "v1.0.0", "v1.1.0")
	if err != nil {
		t.Fatalf("DetectFileMoves() error = %v", err)
	}

	// Should detect EXACTLY ONE move (feature-a -> feature-c)
	if len(moves) != 1 {
		t.Errorf("DetectFileMoves() detected %d moves, want 1", len(moves))
		for _, move := range moves {
			t.Logf("  Detected: %s -> %s", move.OldPath, move.NewPath)
		}
		t.Fatal("Basename collision: detected wrong number of moves")
	}

	// Verify the correct move was detected
	move := moves[0]
	expectedOld := "vcluster/docs/feature-a/config.mdx"
	expectedNew := "vcluster/docs/feature-c/config.mdx"

	if move.OldPath != expectedOld || move.NewPath != expectedNew {
		t.Errorf("DetectFileMoves() detected wrong move:\n  Got: %s -> %s\n  Want: %s -> %s",
			move.OldPath, move.NewPath, expectedOld, expectedNew)
	}

	// Verify feature-b/config.mdx was NOT detected as moved
	for _, move := range moves {
		if strings.Contains(move.OldPath, "feature-b") || strings.Contains(move.NewPath, "feature-b") {
			t.Errorf("feature-b/config.mdx incorrectly detected as moved: %s -> %s",
				move.OldPath, move.NewPath)
		}
	}
}

// TestDetectFileMoves_SimpleMove validates basic move detection works
func TestDetectFileMoves_SimpleMove(t *testing.T) {
	repoPath, cleanup := createTestGitRepo(t)
	defer cleanup()

	// Commit 1: Create file at old location
	createFile(t, repoPath, "vcluster/docs/old-location/example.mdx", "# Example\nContent")
	runGitCmd(t, repoPath, "add", ".")
	runGitCmd(t, repoPath, "commit", "-m", "Add example at old location")
	runGitCmd(t, repoPath, "tag", "v1.0.0")

	// Commit 2: Move file to new location
	// Create target directory first
	targetDir := filepath.Join(repoPath, "vcluster/docs/new-location")
	if err := os.MkdirAll(targetDir, 0755); err != nil {
		t.Fatalf("Failed to create target directory: %v", err)
	}
	runGitCmd(t, repoPath, "mv", "vcluster/docs/old-location/example.mdx", "vcluster/docs/new-location/example.mdx")
	runGitCmd(t, repoPath, "commit", "-m", "Move example to new location")
	runGitCmd(t, repoPath, "tag", "v1.1.0")

	// Detect moves
	moves, err := DetectFileMoves(repoPath, "v1.0.0", "v1.1.0")
	if err != nil {
		t.Fatalf("DetectFileMoves() error = %v", err)
	}

	// Should detect exactly one move
	if len(moves) != 1 {
		t.Fatalf("DetectFileMoves() detected %d moves, want 1", len(moves))
	}

	move := moves[0]
	expectedOld := "vcluster/docs/old-location/example.mdx"
	expectedNew := "vcluster/docs/new-location/example.mdx"

	if move.OldPath != expectedOld || move.NewPath != expectedNew {
		t.Errorf("DetectFileMoves() = %s -> %s, want %s -> %s",
			move.OldPath, move.NewPath, expectedOld, expectedNew)
	}

	if move.Similarity != "100" {
		t.Errorf("DetectFileMoves() similarity = %s, want 100 (identical content)",
			move.Similarity)
	}
}

// TestDetectFileMoves_NonGitRepo validates error handling for non-git repositories
func TestDetectFileMoves_NonGitRepo(t *testing.T) {
	tempDir := t.TempDir()

	// Don't initialize git repo
	moves, err := DetectFileMoves(tempDir, "v1.0.0", "v2.0.0")

	if err == nil {
		t.Error("DetectFileMoves() expected error for non-git repo, got nil")
	}

	if !strings.Contains(err.Error(), "not a git repository") {
		t.Errorf("DetectFileMoves() error = %v, want error containing 'not a git repository'", err)
	}

	if len(moves) != 0 {
		t.Errorf("DetectFileMoves() returned %d moves for non-git repo, want 0", len(moves))
	}
}

// TestDetectFileMoves_InvalidRefs validates error handling for invalid git refs
func TestDetectFileMoves_InvalidRefs(t *testing.T) {
	repoPath, cleanup := createTestGitRepo(t)
	defer cleanup()

	// Create initial commit
	createFile(t, repoPath, "vcluster/test.mdx", "test")
	runGitCmd(t, repoPath, "add", ".")
	runGitCmd(t, repoPath, "commit", "-m", "Initial commit")

	// Try with invalid refs
	moves, err := DetectFileMoves(repoPath, "v99.99.99", "v88.88.88")

	// Should return empty array, not error (graceful handling)
	if err != nil {
		t.Logf("DetectFileMoves() with invalid refs returned error: %v (gracefully handled)", err)
	}

	if len(moves) != 0 {
		t.Errorf("DetectFileMoves() with invalid refs returned %d moves, want 0", len(moves))
	}
}

// TestExtractDocPath validates the path extraction helper function
func TestExtractDocPath(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "vcluster path",
			input:    "vcluster/deploy/security/air-gapped.mdx",
			expected: "deploy/security/air-gapped.mdx",
		},
		{
			name:     "versioned docs path",
			input:    "vcluster_versioned_docs/version-0.27.0/configure/README.mdx",
			expected: "configure/README.mdx",
		},
		{
			name:     "non-vcluster path",
			input:    "some/other/path/file.mdx",
			expected: "",
		},
		{
			name:     "root level vcluster file",
			input:    "vcluster/README.mdx",
			expected: "README.mdx",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := extractDocPath(tt.input)
			if result != tt.expected {
				t.Errorf("extractDocPath(%q) = %q, want %q", tt.input, result, tt.expected)
			}
		})
	}
}

func TestGenerateRedirectsSkipsUnderscorePaths(t *testing.T) {
	tempFile := filepath.Join(t.TempDir(), "netlify.toml")

	// Create initial netlify.toml
	os.WriteFile(tempFile, []byte("# Test netlify config\n"), 0644)

	r := &Resolver{
		outputFile: tempFile,
	}

	// Include both normal and underscore paths
	resolved := map[string]string{
		"old/path":        "new/path",
		"_fragments/test": "_fragments/new-test", // Should NOT appear in output
	}

	if err := r.GenerateRedirects(resolved); err != nil {
		t.Fatalf("GenerateRedirects() error = %v", err)
	}

	content, err := os.ReadFile(tempFile)
	if err != nil {
		t.Fatalf("Failed to read generated file: %v", err)
	}

	contentStr := string(content)

	// Verify normal path is included
	if !strings.Contains(contentStr, "/docs/vcluster/old/path") {
		t.Error("GenerateRedirects() did not include normal path redirect")
	}

	// Verify underscore path is NOT included
	if strings.Contains(contentStr, "_fragments") {
		t.Error("GenerateRedirects() incorrectly included _fragments path in redirects")
	}
}
