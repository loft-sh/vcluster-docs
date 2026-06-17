---
name: feature-label-audit
description: Audit and fix sidebar feature tier labels in vCluster docs. Use when verifying that sidebar badges (FREE/ENTERPRISE) match plan assignments in the plans repo, or when adding missing labels to newly documented features.
context: fork
---

# Feature Label Audit

Sidebar badges in the docs are driven by CSS classes set via frontmatter or category config. They must match the feature assignments in `~/git/vcluster/plans/`.

## How the Labels Work

### Setting a label

On an `.mdx` page (frontmatter):
```yaml
sidebar_class_name: pro        # ENTERPRISE badge
sidebar_class_name: free       # FREE badge
sidebar_class_name: pro host-nodes  # multiple classes — only one label class allowed
```

On a category (`_category_.json`):
```json
{ "className": "pro" }
{ "className": "free" }
```

The category className labels the collapsible section header only — it does **not** propagate to pages inside the category. Individual pages need their own `sidebar_class_name`.

### What the badges render

Defined in `src/css/sidebar.scss`:
- `.pro` → orange "ENTERPRISE" pill
- `.free` → dark "FREE" pill

## The Plans Repo

Plans live at `~/git/vcluster/plans/`:

| File | Tier |
|------|------|
| `free.yaml` | Free |
| `dev.yaml` | Dev (superset of free) |
| `prod.yaml` | Prod (superset of dev) |
| `scale.yaml` | Scale/Enterprise (superset of prod) |
| `internal.yaml` | Internal (superset of all) |

**Rule:** A feature in `free.yaml` → label `free`. A feature absent from `free.yaml` but present in any paid plan → label `pro`.

## Finding the Feature Key

The feature key is exposed on the page via the `FeatureTable` component:

```mdx
<FeatureTable names="vault-integration" />
<FeatureTable names="ha-mode,regional-cluster-endpoints" />
```

The `names` attribute is the feature key to look up in the plans YAML files.

Pages with `<ProAdmonition/>` but no `FeatureTable` require checking the code (see below).

## Audit Workflow

### 1. Find all labeled pages

```bash
# Pages with sidebar_class_name
grep -rn "sidebar_class_name.*pro\|sidebar_class_name.*free" platform vcluster --include="*.mdx"

# Categories with className
grep -rn "\"className\"" platform vcluster --include="_category_.json"
```

### 2. Find pages with feature references but no label (missing labels)

```bash
# Pages with FeatureTable or ProAdmonition but no sidebar_class_name
grep -rln "FeatureTable\|ProAdmonition" platform vcluster --include="*.mdx" \
  | grep -v "_partials\|_fragments\|versioned_docs" \
  | while read f; do
      grep -q "sidebar_class_name" "$f" || echo "UNLABELED: $f"
    done
```

### 3. Extract feature keys from unlabeled pages

```bash
grep -o 'names="[^"]*"' <file.mdx>
```

### 4. Check the plan tier

```bash
grep "<feature-key>" ~/git/vcluster/plans/free.yaml   # in free = label free
grep "<feature-key>" ~/git/vcluster/plans/dev.yaml    # not in free but in dev+ = label pro
```

If the feature key appears in `free.yaml` → `free`. If absent from `free.yaml` → `pro`.

### 5. Apply the label

Add `sidebar_class_name: pro` (or `free`) as the last field before the closing `---` in the frontmatter.

## Verifying ProAdmonition Usage

`<ProAdmonition/>` shows an "Enterprise-Only Feature" callout inline. It should only appear when the surrounding content is genuinely enterprise-gated.

Common issues:
- **Imported but never used** — dead import, just remove the `import` line.
- **Used in a sub-section of a free feature** — remove the admonition from that section.
- **Used for a feature with no plan key** — check the vCluster OSS/Pro Go code for a license gate. Search in `~/git/vcluster/vcluster-pro/` for the feature name near `license.GetLicense()` or `currentLicense.Enabled(...)`.

## Skip These

- Air-gapped install pages inside a `pro`-labeled category — the category header carries the badge; individual pages don't need one.
- API reference pages — no label needed.
- Overview/index pages that span multiple tiers — no label needed.
- `vcluster/introduction/oss-vs-free.mdx` — intro page.

## What to Check in Code

When a `ProAdmonition` has no matching `FeatureTable`, verify the gate in the Go code:

```bash
# Check if feature is in OSS or Pro repo
grep -r "migrate\|<feature-name>" ~/git/vcluster/vcluster-pro/pkg/ | grep -i "license\|Enabled\|feature"

# OSS stub pattern confirms pro-only:
# var Foo = func(...) { return nil, NewFeatureError(...) }
grep -r "NewFeatureError" ~/git/vcluster/vcluster/pkg/pro/
```

If the implementation lives only in `vcluster-pro/` with a license check → the `ProAdmonition` is correct and the page needs `sidebar_class_name: pro`.
