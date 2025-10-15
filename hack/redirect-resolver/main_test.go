package main

import (
	"bytes"
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

func TestResolveChain(t *testing.T) {
	tests := []struct {
		name      string
		graph     map[string]string
		start     string
		wantTarget string
		wantCycle bool
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
		name         string
		movements    []Movement
		wantCycles   bool
		wantConflicts bool
	}{
		{
			name: "no issues",
			movements: []Movement{
				{From: "a", To: "b"},
				{From: "c", To: "d"},
			},
			wantCycles:   false,
			wantConflicts: false,
		},
		{
			name: "with cycle",
			movements: []Movement{
				{From: "a", To: "b"},
				{From: "b", To: "c"},
				{From: "c", To: "a"},
			},
			wantCycles:   true,
			wantConflicts: false,
		},
		{
			name: "with conflict",
			movements: []Movement{
				{From: "page", To: "loc1"},
				{From: "page", To: "loc2"},
			},
			wantCycles:   false,
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

func TestDetectPathChangesSkipsUnderscoreDirs(t *testing.T) {
	// Create temporary directory structure
	tempDir := t.TempDir()
	
	// Create test structure
	vclusterDir := filepath.Join(tempDir, "vcluster")
	versionedDir := filepath.Join(tempDir, "vcluster_versioned_docs", "version-0.20.0")
	
	// Create directories
	os.MkdirAll(filepath.Join(vclusterDir, "_fragments"), 0755)
	os.MkdirAll(filepath.Join(vclusterDir, "deploy"), 0755)
	os.MkdirAll(filepath.Join(versionedDir, "_fragments"), 0755)
	os.MkdirAll(filepath.Join(versionedDir, "configure"), 0755)
	
	// Create files in _fragments (should be ignored)
	os.WriteFile(filepath.Join(vclusterDir, "_fragments", "test.mdx"), []byte("content"), 0644)
	os.WriteFile(filepath.Join(versionedDir, "_fragments", "test.mdx"), []byte("content"), 0644)
	
	// Create files in normal directories (should be detected)
	os.WriteFile(filepath.Join(vclusterDir, "deploy", "guide.mdx"), []byte("content"), 0644)
	os.WriteFile(filepath.Join(versionedDir, "configure", "guide.mdx"), []byte("old content"), 0644)
	
	// Run detectPathChanges
	changes, err := detectPathChanges(tempDir)
	if err != nil {
		t.Fatalf("detectPathChanges() error = %v", err)
	}
	
	// Verify that _fragments files are NOT in the changes
	for _, change := range changes.Changes {
		if strings.Contains(change.Old, "_fragments") || strings.Contains(change.New, "_fragments") {
			t.Errorf("detectPathChanges() included _fragments path: %s -> %s", change.Old, change.New)
		}
	}
	
	// Verify that the normal file change was detected (guide.mdx moved from configure to deploy)
	foundGuide := false
	for _, change := range changes.Changes {
		if change.Old == "configure/guide" && change.New == "deploy/guide" {
			foundGuide = true
			break
		}
	}
	
	if !foundGuide {
		t.Error("detectPathChanges() did not detect the guide.mdx movement from configure to deploy")
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
		"old/path": "new/path",
		"_fragments/test": "_fragments/new-test",  // Should NOT appear in output
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

func TestDetectPathChangesIgnoresDeletedFiles(t *testing.T) {
	// Create temporary directory structure
	tempDir := t.TempDir()
	
	// Create test structure
	vclusterDir := filepath.Join(tempDir, "vcluster")
	versionedDir := filepath.Join(tempDir, "vcluster_versioned_docs", "version-0.20.0")
	
	// Create directories
	os.MkdirAll(filepath.Join(vclusterDir, "deploy"), 0755)
	os.MkdirAll(filepath.Join(vclusterDir, "configure"), 0755)
	os.MkdirAll(filepath.Join(versionedDir, "deploy"), 0755)
	os.MkdirAll(filepath.Join(versionedDir, "configure"), 0755)
	os.MkdirAll(filepath.Join(versionedDir, "manage"), 0755)
	
	// Scenario 1: File moved from configure to deploy (should create redirect)
	os.WriteFile(filepath.Join(vclusterDir, "deploy", "moved.mdx"), []byte("content"), 0644)
	os.WriteFile(filepath.Join(versionedDir, "configure", "moved.mdx"), []byte("content"), 0644)
	
	// Scenario 2: File deleted entirely (should NOT create redirect)
	// File exists in versioned docs but not in current docs
	os.WriteFile(filepath.Join(versionedDir, "manage", "deleted.mdx"), []byte("content"), 0644)
	// NOT creating the file in vclusterDir - simulating deletion
	
	// Scenario 3: File unchanged (should NOT create redirect)
	os.WriteFile(filepath.Join(vclusterDir, "configure", "unchanged.mdx"), []byte("content"), 0644)
	os.WriteFile(filepath.Join(versionedDir, "configure", "unchanged.mdx"), []byte("content"), 0644)
	
	// Run detectPathChanges
	changes, err := detectPathChanges(tempDir)
	if err != nil {
		t.Fatalf("detectPathChanges() error = %v", err)
	}
	
	// Verify that only the moved file is in changes
	if len(changes.Changes) != 1 {
		t.Errorf("detectPathChanges() found %d changes, want 1 (only moved file)", len(changes.Changes))
		for _, change := range changes.Changes {
			t.Logf("  Found change: %s -> %s", change.Old, change.New)
		}
	}
	
	// Verify the moved file is detected correctly
	foundMoved := false
	for _, change := range changes.Changes {
		if change.Old == "configure/moved" && change.New == "deploy/moved" {
			foundMoved = true
		}
		// Ensure deleted file is NOT in changes
		if strings.Contains(change.Old, "deleted") || strings.Contains(change.New, "deleted") {
			t.Errorf("detectPathChanges() incorrectly created redirect for deleted file: %s -> %s", change.Old, change.New)
		}
	}
	
	if !foundMoved {
		t.Error("detectPathChanges() did not detect the moved.mdx file movement")
	}
}

func TestDetectPathChangesHandlesMultipleScenarios(t *testing.T) {
	// Create temporary directory structure
	tempDir := t.TempDir()
	
	// Create test structure
	vclusterDir := filepath.Join(tempDir, "vcluster")
	versionedDir := filepath.Join(tempDir, "vcluster_versioned_docs", "version-0.27.0")
	
	// Create directories
	os.MkdirAll(filepath.Join(vclusterDir, "deploy"), 0755)
	os.MkdirAll(filepath.Join(vclusterDir, "configure"), 0755)
	os.MkdirAll(filepath.Join(vclusterDir, "manage"), 0755)
	os.MkdirAll(filepath.Join(versionedDir, "deploy"), 0755)
	os.MkdirAll(filepath.Join(versionedDir, "configure"), 0755)
	os.MkdirAll(filepath.Join(versionedDir, "manage", "backup-restore"), 0755)
	
	// Simulate the real scenario from the PR:
	// backup-restore/README.mdx was deleted from both current and versioned docs
	os.WriteFile(filepath.Join(versionedDir, "manage/backup-restore", "README.mdx"), []byte("backup content"), 0644)
	// NOT creating in vclusterDir - it's been deleted
	
	// Add some legitimate moves
	os.WriteFile(filepath.Join(vclusterDir, "deploy", "api.mdx"), []byte("api content"), 0644)
	os.WriteFile(filepath.Join(versionedDir, "configure", "api.mdx"), []byte("api content"), 0644)
	
	// Run detectPathChanges
	changes, err := detectPathChanges(tempDir)
	if err != nil {
		t.Fatalf("detectPathChanges() error = %v", err)
	}
	
	// Should only have the moved file, not the deleted backup-restore
	if len(changes.Changes) != 1 {
		t.Errorf("detectPathChanges() found %d changes, want 1", len(changes.Changes))
		for _, change := range changes.Changes {
			t.Logf("  Found change: %s -> %s", change.Old, change.New)
		}
	}
	
	// Verify backup-restore is NOT in changes
	for _, change := range changes.Changes {
		if strings.Contains(change.Old, "backup-restore") || strings.Contains(change.New, "backup-restore") {
			t.Errorf("detectPathChanges() incorrectly included deleted backup-restore: %s -> %s", change.Old, change.New)
		}
	}
	
	// Verify api.mdx move is detected
	foundApi := false
	for _, change := range changes.Changes {
		if change.Old == "configure/api" && change.New == "deploy/api" {
			foundApi = true
		}
	}
	
	if !foundApi {
		t.Error("detectPathChanges() did not detect the api.mdx movement")
	}
}