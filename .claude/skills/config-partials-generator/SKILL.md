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

- Local clone of `vcluster` repo at `~/loft/vcluster`
- Go toolchain installed (for running the generator)

## Source Files

| File | Purpose |
|------|---------|
| `~/loft/vcluster/chart/values.schema.json` | vCluster JSON schema (source of truth) |
| `~/loft/vcluster/chart/values.yaml` | Default values |
| `~/loft/vcluster/.github/workflows/sync-config-schema.yaml` | CI automation (reference for manual steps) |
| `hack/vcluster/partials/main.go` | vCluster MDX partials generator |
| `hack/platform/partials/main.go` | Platform MDX partials generator |
| `configsrc/vcluster/` | Per-version schema source directories |
| `configsrc/platform/` | Platform schema source directory |

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
cd ~/loft/vcluster
git fetch --tags
git checkout main && git pull origin main
```

Verify the latest tag: `git tag --sort=-v:refname | head -5`

### Step 2: Copy schema files to configsrc

```bash
cd <vcluster-docs-repo>
cp ~/loft/vcluster/chart/values.yaml configsrc/vcluster/main/default_values.yaml
cp ~/loft/vcluster/chart/values.schema.json configsrc/vcluster/main/vcluster.schema.json
```

For versioned docs (RC releases), replace `main` with `X.Y.0`:
```bash
mkdir -p configsrc/vcluster/X.Y.0/
cp ~/loft/vcluster/chart/values.yaml configsrc/vcluster/X.Y.0/default_values.yaml
cp ~/loft/vcluster/chart/values.schema.json configsrc/vcluster/X.Y.0/vcluster.schema.json
```

### Step 3: Vendor Go modules

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

### Step 6: Update platform configsrc (schema only)

```bash
cp ~/loft/vcluster/chart/values.schema.json configsrc/platform/main/vcluster.schema.json
```

**Do NOT run the platform partials generator** unless PR #1663 (preserve manual content during generation) has been merged. The platform generator overwrites manually-added sections in API reference docs.

Check PR status: `gh pr view 1663 --json state`

If merged, platform generation is:
```bash
go run hack/platform/partials/main.go configsrc/platform/main/vcluster.schema.json
```

## Output Files

The generator produces/updates MDX files under `vcluster/_partials/config/`:
- `controlPlane.mdx` — control plane top-level config
- `controlPlane/distro.mdx` — distro configuration (k8s, k3s, k0s, eks)
- `controlPlane/backingStore.mdx` — etcd/database backing store
- `controlPlane/backingStore/database/embedded.mdx`
- `controlPlane/backingStore/database/external.mdx`
- And many more nested partials matching the schema structure

## Do Not

- Run `npm run build` locally — let CI handle it
- Modify generated partials by hand — they get overwritten on next generation
- Run the platform generator without checking PR #1663 status
- Modify files under `vcluster_versioned_docs/` unless explicitly targeting a released version
