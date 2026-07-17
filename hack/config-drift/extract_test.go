package main

import (
	"os"
	"path/filepath"
	"testing"
)

// depth-1 partial: full-path anchors, defines roots.
const exportPartial = `
## ` + "`exportKubeConfig`" + ` ... {#exportKubeConfig}

ExportKubeConfig describes ...

### ` + "`context`" + ` ... {#exportKubeConfig-context}

Context ...

### ` + "`secret`" + ` ... {#exportKubeConfig-secret}

Declare the secret ...

Deprecated: Use AdditionalSecrets instead.

#### ` + "`name`" + ` ... {#exportKubeConfig-secret-name}

Name ...
`

const syncPartial = `
## ` + "`sync`" + ` ... {#sync}

### ` + "`toHost`" + ` ... {#sync-toHost}

#### ` + "`pods`" + ` ... {#sync-toHost-pods}

##### ` + "`enabled`" + ` ... {#sync-toHost-pods-enabled}

##### ` + "`labels`" + ` ... {#sync-toHost-pods-labels}
`

// pluginsPartial models a freeFormMapPaths root: the partial documents child
// anchors (so the parent looks structured), but real configs key it by
// user-chosen plugin names.
const pluginsPartial = `
## ` + "`plugins`" + ` ... {#plugins}

### ` + "`image`" + ` ... {#plugins-image}
`

func writeConfigDir(t *testing.T) string {
	t.Helper()
	dir := t.TempDir()
	for name, body := range map[string]string{
		"exportKubeConfig.mdx": exportPartial,
		"sync.mdx":             syncPartial,
		"plugins.mdx":          pluginsPartial,
	} {
		if err := os.WriteFile(filepath.Join(dir, name), []byte(body), 0644); err != nil {
			t.Fatal(err)
		}
	}
	return dir
}

func TestParseConfigPartials(t *testing.T) {
	gt, err := ParseConfigPartials(writeConfigDir(t))
	if err != nil {
		t.Fatal(err)
	}

	for _, p := range []string{
		"exportKubeConfig", "exportKubeConfig.context", "exportKubeConfig.secret",
		"exportKubeConfig.secret.name", "sync", "sync.toHost.pods.enabled", "sync.toHost.pods.labels",
	} {
		if !gt.known[p] {
			t.Errorf("expected known path %q", p)
		}
	}

	if !gt.roots["exportKubeConfig"] || !gt.roots["sync"] {
		t.Errorf("roots missing: %v", gt.roots)
	}
	// Nested full segments must NOT be treated as roots.
	if gt.roots["toHost"] || gt.roots["context"] {
		t.Errorf("nested segment leaked into roots: %v", gt.roots)
	}

	if _, dep := gt.deprecated["exportKubeConfig.secret"]; !dep {
		t.Error("exportKubeConfig.secret should be deprecated")
	}
	if _, dep := gt.deprecated["exportKubeConfig.context"]; dep {
		t.Error("exportKubeConfig.context must not be deprecated")
	}

	// hasChild: a structured object has known children; a leaf does not.
	if !gt.hasChild["exportKubeConfig"] {
		t.Error("exportKubeConfig should have known children")
	}
	if gt.hasChild["exportKubeConfig.context"] {
		t.Error("exportKubeConfig.context is a leaf, must have no known children")
	}
	if !gt.hasChild[""] {
		t.Error("root must have known children")
	}
}
