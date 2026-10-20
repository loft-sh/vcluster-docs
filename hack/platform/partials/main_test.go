package main

import (
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
)

func TestGenerateV5ResourceReferences(t *testing.T) {
	outputDir := t.TempDir()
	partials := filepath.Join(outputDir, "api", "_partials", "resources")
	resources := filepath.Join(outputDir, "api", "resources")
	cmd := exec.Command("go", "run", "./hack/platform/partials/main.go", "--partials-base", partials, "--resources-base", resources)
	cmd.Dir = "../../.."
	if output, err := cmd.CombinedOutput(); err != nil {
		t.Fatalf("generate references: %v\n%s", err, output)
	}

	for _, resource := range []string{"connectors", "machines", "networkenvironments", "tenants"} {
		t.Run(resource, func(t *testing.T) {
			data, err := os.ReadFile(filepath.Join(partials, resource, "retrieve.mdx"))
			if err != nil {
				t.Fatal(err)
			}
			if !strings.Contains(string(data), "/apis/management.loft.sh/v1/"+resource) {
				t.Errorf("retrieve reference does not use the %s management endpoint", resource)
			}
		})
	}

	for _, operation := range []string{"create", "update", "delete"} {
		if _, err := os.Stat(filepath.Join(partials, "machines", operation+".mdx")); !os.IsNotExist(err) {
			t.Errorf("read-only machine inventory has a %s operation: %v", operation, err)
		}
	}

	for file, want := range map[string]string{
		"connectors/reference.mdx":             "SharedDatabase is the shared-database connector payload.",
		"tenants/config/subresourceget.mdx":    "/tenants/development/config",
		"tenants/config/subresourcecreate.mdx": "curl -s -X POST",
	} {
		data, err := os.ReadFile(filepath.Join(partials, file))
		if err != nil {
			t.Fatal(err)
		}
		if !strings.Contains(string(data), want) {
			t.Errorf("%s is missing %q", file, want)
		}
	}
}
