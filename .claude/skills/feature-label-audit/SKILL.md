---
name: feature-label-audit
description: Audit and fix the vCluster docs feature table that the FeatureTable component renders from src/data/features.yaml. Covers three facets - sidebar tier badges (FREE/ENTERPRISE) versus plan assignments in the plans repo, feature docs_url link targets, and which FeatureTable rows each page imports. Use when verifying badges, checking that feature links resolve to the right page, or confirming a page surfaces the correct rows.
context: fork
---

# Feature Table Audit

The feature comparison table (rendered by the `FeatureTable` component from `src/data/features.yaml`) drives three things in the docs, each its own audit facet:

1. **Sidebar tier badges** (FREE / ENTERPRISE pills) that must match plan assignments in `~/git/vcluster/plans/`.
2. **Feature `docs_url` link targets** that each row links to.
3. **`<FeatureTable names="...">` row imports** that decide which rows a given page surfaces.

This skill covers all three. Labels and the plans repo come first, then the link-target and row-import audits.

## The feature table source (`src/data/features.yaml`)

`src/data/features.yaml` is the single source the `FeatureTable` component reads. Each entry is keyed by a feature ID and carries the row label, description, category, optional `pricing`, and `docs_url`:

```yaml
ha-mode:
  name: "High-Availability Mode"   # label shown in the table
  description: "..."
  category: "Deployment Modes"
  docs_url: "/docs/platform/maintenance/reliability-scaling/high-availability"
  pricing: "add-on"                # optional
```

Feature keys are synced from `loft-sh/admin-apis`, and tiers from `loft-sh/plans` (see the header comment in the file), so do not hand-edit keys. The `docs_url` value and which pages import which rows are docs-owned, and are what facets 2 and 3 audit.

## Sidebar tier badges

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

## Audit: `docs_url` link targets

Every `docs_url` in `features.yaml` should resolve to a real page whose topic matches the feature.

**URL to file mapping** (site baseUrl is `/docs`):
- `/docs/vcluster/PATH` maps to `vcluster/PATH.mdx` or `vcluster/PATH/README.mdx`
- `/docs/platform/PATH` maps to `platform/PATH.mdx` or `platform/PATH/README.mdx`

**Three gotchas that make a link look fine but break:**
- **`slug:` overrides.** A page can set `slug:` in frontmatter, so the file path is not the served URL. If the literal path file is missing, grep for a `slug:` that resolves to the URL before calling the link broken (this is how `air-gapped` and `standalone` resolve).
- **Anchors.** `#foo` must match a heading (slugified: lowercase, spaces to hyphens) or an explicit `{#id}`. A valid page with a dead anchor still loads, it just lands at the top.
- **Moved pages.** A page relocating under a new parent (for example into `configure/platform-configs/`) silently breaks the old `docs_url`; nothing redirects.

Existence, slug, and anchor checks:
```bash
ls vcluster/PATH.mdx platform/PATH.mdx 2>/dev/null            # literal path
grep -rl "^slug:.*PATH" platform vcluster --include="*.mdx"   # slug fallback
grep -n "{#anchor-id}\|^#\+ Heading Text" path/to/page.mdx    # anchor
```

**Orphaned partials.** Some config reference partials (for example `_partials/config/experimental/genericSync.mdx`) carry valid `{#id}` anchors but are imported into no page, so a `docs_url` pointing at that anchor never resolves. Confirm something imports the partial:
```bash
grep -rln "experimental/genericSync" platform vcluster --include="*.mdx" | grep -v versioned
```
If nothing imports it, the fix is to create the page (mirroring a sibling page that imports its partial), not to tweak the link.

## Audit: `<FeatureTable names="...">` row imports

A page's `<FeatureTable>` renders the row(s) named in `names`. The classic bug is a page importing the wrong row (the HA page once imported `platform-external-db` instead of `ha-mode`).

List every usage:
```bash
grep -rn "<FeatureTable" platform vcluster --include="*.mdx" | grep -v versioned
```
`names="all"` on the comparison pages (`oss-vs-free.mdx`, `what-are-virtual-clusters.mdx`) is intentional and renders the whole table.

**The check** is a loose bidirectional consistency with each row's canonical `docs_url`: for `<FeatureTable names="X">` on page P, look up X's `docs_url`. If it points somewhere other than P, P is surfacing a row that belongs elsewhere. Treat that as a smell, then judge:

- Row's `docs_url` is a clearly unrelated page (deletion page showing the Auto Sleep row) → wrong row, fix `names` or drop the table.
- Two pages import the same row → fine if both genuinely discuss the feature; just pick which page owns the canonical `docs_url`.
- A row's `docs_url` points at page P but no page imports it → the row surfaces nowhere; decide whether P should show it.

**The invariant:** a page may surface any row it genuinely discusses, but every row must still have one sensible canonical `docs_url`.
