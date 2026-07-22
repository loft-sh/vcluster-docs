package util

import (
	"os"
	"path/filepath"
	"testing"
)

func TestWriteGeneratedFileUsesNonExecutablePermissions(t *testing.T) {
	for _, test := range []struct {
		name     string
		existing bool
	}{
		{name: "new file"},
		{name: "existing executable file", existing: true},
	} {
		t.Run(test.name, func(t *testing.T) {
			filePath := filepath.Join(t.TempDir(), "nested", "reference.mdx")
			if test.existing {
				if err := os.MkdirAll(filepath.Dir(filePath), 0o755); err != nil {
					t.Fatal(err)
				}
				if err := os.WriteFile(filePath, []byte("old"), 0o755); err != nil {
					t.Fatal(err)
				}
			}

			if err := writeGeneratedFile(filePath, []byte("generated")); err != nil {
				t.Fatal(err)
			}

			info, err := os.Stat(filePath)
			if err != nil {
				t.Fatal(err)
			}
			if got, want := info.Mode().Perm(), os.FileMode(0o644); got != want {
				t.Fatalf("permissions = %04o, want %04o", got, want)
			}
		})
	}
}
