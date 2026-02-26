---
name: config-partials-generator
description: Generate MDX config reference partials from vCluster JSON schema. Use when automation is skipped for alpha releases or when manually refreshing config docs.
---

# Config Partials Generator Skill

## Overview

Generates MDX config reference partials from vCluster JSON schema. The CI automation (`sync-config-schema.yaml` in vcluster repo) skips alpha releases, so manual generation is needed during alpha/early development phases.

## When to Use This Skill

Trigger this skill when:
- User asks to "generate config partials", "update config reference", or "regenerate config docs"
- Linear issue mentions config generation or automation being down
- A new vCluster pre-release (alpha/beta) has schema changes not yet reflected in docs
- The `vcluster/_partials/config/` files are stale compared to the vcluster schema

## Prerequisites

- Local clone of `vcluster` repo (default: `~/loft/vcluster`, adjust if different)
- Go toolchain installed (for running the generator)

## Source Files

| File | Purpose |
|------|---------|
| `<VCLUSTER_REPO>/chart/values.schema.json` | vCluster JSON schema (source of truth) |
| `<VCLUSTER_REPO>/chart/values.yaml` | Default values |
| `<VCLUSTER_REPO>/.github/workflows/sync-config-schema.yaml` | CI automation (reference for manual steps) |
| `hack/vcluster/partials/main.go` | vCluster MDX partials generator |
| `hack/platform/partials/main.go` | Platform MDX partials generator |
| `configsrc/vcluster/` | Per-version schema source directories |
| `configsrc/platform/` | Platform schema source directory |

`<VCLUSTER_REPO>` defaults to `~/loft/vcluster`. Confirm path before starting.

## Automation Gap

The `sync-config-schema.yaml` workflow in the vcluster repo:
- Fires on `release` events
- **Skips** alpha and next releases (exits early)
- For **beta** releases: targets `configsrc/vcluster/main/` and `vcluster/_partials/config/`
- For **RC** releases: targets versioned folder (e.g., `configsrc/vcluster/0.33.0/`)
- For **stable** releases: triggers config sync in vcluster-config repo

Manual generation fills the gap for alpha releases.

## Workflow: Generate vCluster Partials

### Step 1: Update vcluster repo

```bash
cd <VCLUSTER_REPO>
git fetch --tags
git checkout main && git pull origin main
```

Verify the latest tag: `git tag --sort=-v:refname | head -5`

### Step 2: Copy schema files to configsrc

From the vcluster-docs repo root:

```bash
cp <VCLUSTER_REPO>/chart/values.yaml configsrc/vcluster/main/default_values.yaml
cp <VCLUSTER_REPO>/chart/values.schema.json configsrc/vcluster/main/vcluster.schema.json
```

For versioned docs (RC releases), replace `main` with `X.Y.0`:
```bash
mkdir -p configsrc/vcluster/X.Y.0/
cp <VCLUSTER_REPO>/chart/values.yaml configsrc/vcluster/X.Y.0/default_values.yaml
cp <VCLUSTER_REPO>/chart/values.schema.json configsrc/vcluster/X.Y.0/vcluster.schema.json
```

### Step 3: Vendor Go modules

From the vcluster-docs repo root:

```bash
go mod tidy && go mod vendor
```

### Step 4: Run the generator

For main/next docs:
```bash
go run hack/vcluster/partials/main.go configsrc/vcluster/main vcluster/_partials/config
```

For versioned docs:
```bash
go run hack/vcluster/partials/main.go configsrc/vcluster/X.Y.0 vcluster_versioned_docs/version-X.Y.0/_partials/config
```

### Step 5: Review output

```bash
git diff --stat vcluster/_partials/config/
```

Expected warnings (safe to ignore):
- `Skipping path "experimental/isolatedControlPlane"` — deprecated path
- `Skipping path "experimental/genericSync"` — deprecated path
- `Skipping path "controlPlane/distro/k3s"` — removed in v0.33+
- `Skipping path "controlPlane/distro/k0s"` — removed in v0.33+

### Step 6: Platform configsrc

Update the platform schema reference:

```bash
cp <VCLUSTER_REPO>/chart/values.schema.json configsrc/platform/main/vcluster.schema.json
```

**Platform partials generator:** Before running, check whether it preserves manual content:

```bash
gh pr view 1663 --json state --jq '.state'
```

<!-- TODO: Remove this guard once PR #1663 is merged -->
If `MERGED`, safe to run:
```bash
go run hack/platform/partials/main.go configsrc/platform/main/vcluster.schema.json
```

If `OPEN`, do NOT run — the generator overwrites manually-added sections in API reference docs.

### Step 7: Commit and open PR

```bash
git checkout -b chore/update-config-partials-vX.Y.Z
git add configsrc/ vcluster/_partials/config/
git commit -m "chore: generate vcluster config partials for X.Y alpha"
git push -u origin HEAD
gh pr create --title "chore: generate vcluster config partials for X.Y alpha" --body "..."
```

## Output Files

The generator produces/updates MDX files under `vcluster/_partials/config/`:
- `controlPlane.mdx` — control plane top-level config
- `controlPlane/distro.mdx` — distro configuration (k8s, k3s, k0s, eks)
- `controlPlane/backingStore.mdx` — etcd/database backing store
- `controlPlane/backingStore/database/embedded.mdx`
- `controlPlane/backingStore/database/external.mdx`
- And many more nested partials matching the schema structure

## Never Do

- Run `npm run build` locally — let CI handle it
- Modify generated partials by hand — they get overwritten on next generation
- Run the platform generator without checking its manual-content-preservation status
- Modify files under `vcluster_versioned_docs/` unless explicitly targeting a released version
