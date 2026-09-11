package main

import (
	"path/filepath"
	"testing"
)

func TestIsLegacyOrphan(t *testing.T) {
	tests := []struct {
		name         string
		outputDir    string
		relativePath string
		want         bool
	}{
		{
			name:         "tracked version relative target",
			outputDir:    "vcluster_versioned_docs/version-0.37.0/_partials/config",
			relativePath: "sleepMode.mdx",
			want:         true,
		},
		{
			name:         "tracked version absolute target",
			outputDir:    filepath.Join(string(filepath.Separator), "tmp", "checkout", "vcluster_versioned_docs", "version-0.35.0", "_partials", "config"),
			relativePath: filepath.Join("sync", "toHost", "resourceclaims.mdx"),
			want:         true,
		},
		{
			name:         "current docs target",
			outputDir:    "vcluster/_partials/config",
			relativePath: "sleepMode.mdx",
			want:         false,
		},
		{
			name:         "future version target",
			outputDir:    "vcluster_versioned_docs/version-0.38.0/_partials/config",
			relativePath: "sleepMode.mdx",
			want:         false,
		},
		{
			name:         "unlisted orphan in tracked version",
			outputDir:    "vcluster_versioned_docs/version-0.36.0/_partials/config",
			relativePath: "unexpected.mdx",
			want:         false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := isLegacyOrphan(tt.outputDir, tt.relativePath); got != tt.want {
				t.Fatalf("isLegacyOrphan(%q, %q) = %v, want %v", tt.outputDir, tt.relativePath, got, tt.want)
			}
		})
	}
}

func TestPathsUseCurrentSleepSchema(t *testing.T) {
	foundSleep := false
	for _, path := range paths {
		if path == "sleep" {
			foundSleep = true
		}
		if path == "sleepMode" {
			t.Error("paths contains legacy sleepMode; it must be added only when the input schema supports it")
		}
	}
	if !foundSleep {
		t.Error("paths does not contain current sleep schema")
	}
}
