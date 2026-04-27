# Link Resolution Guide for Docusaurus

## Two Types of Links

Docusaurus treats links differently based on their format. Understanding this is CRITICAL for archiving success.

### Type 1: Absolute URL Paths

**Pattern**: Starts with `/vcluster/` or `/platform/`

**Rules**:
- ❌ **NEVER include .mdx extension**
- ✅ Docusaurus resolves these automatically
- Used in: Fragments, cross-version links, navigation menus

**Examples**:
```markdown
✅ CORRECT:
[Pod Identity](/vcluster/integrations/pod-identity/eks-pod-identity)
[Backing Store](/vcluster/configure/vcluster-yaml/control-plane/components/backing-store)
[Policies](/vcluster/configure/vcluster-yaml/policies)

❌ WRONG (will break build):
[Pod Identity](/vcluster/integrations/pod-identity/eks-pod-identity.mdx)
[Backing Store](/vcluster/configure/vcluster-yaml/control-plane/components/backing-store.mdx)
```

### Type 2: Relative File Paths

**Pattern**: Starts with `./` or `../`

**Rules**:
- ✅ **MUST include .mdx extension**
- Resolved relative to current file location
- Used in: Same-folder or parent-folder references

**Examples**:
```markdown
✅ CORRECT:
[FIPS Guide](./fips.mdx)
[Project](../api/resources/project/project.mdx)
[Related Doc](../../some-folder/README.mdx)

❌ WRONG (file not found):
[FIPS Guide](./fips)
[Project](../api/resources/project/project)
```

## Fragments MUST Use Absolute Paths

Fragment files in `_fragments/` folders are imported by multiple docs at different directory depths.

**Rules for fragments**:
- MUST use absolute paths: `/vcluster/...` or `/platform/...`
- NEVER use relative paths: `../...`
- NEVER include .mdx extension
- NEVER use `@site` imports

**Why**: A fragment imported by both:
- `deploy/basics.mdx` (2 levels deep)
- `deploy/advanced/security/fips.mdx` (4 levels deep)

Can't use relative paths because `../` means different things at different depths.

**Example fragment** (`_fragments/auto-nodes.mdx`):
```markdown
✅ CORRECT:
vCluster provides [node providers](/platform/administer/node-providers/overview)

❌ WRONG:
vCluster provides [node providers](../../platform/administer/node-providers/overview.mdx)
```

## Common Patterns to Fix

### Pattern 1: Remove .mdx from Absolute Paths

```bash
# Find all .mdx in absolute paths
grep -r "](/vcluster/.*\.mdx)" vcluster_versioned_docs/version-X.X.X/
grep -r "](/platform/.*\.mdx)" platform_versioned_docs/version-X.X.X/

# Fix automatically
find . -name "*.mdx" -exec sed -i 's|(/vcluster/\([^)]*\)\.mdx)|(/vcluster/\1)|g' {} +
find . -name "*.mdx" -exec sed -i 's|(/platform/\([^)]*\)\.mdx)|(/platform/\1)|g' {} +
```

### Pattern 2: Add .mdx to Relative Paths

```bash
# Find relative paths without .mdx (manual review needed)
grep -r "](\.\./.*[^x]))" vcluster_versioned_docs/version-X.X.X/

# Fix manually - verify each one
```

### Pattern 3: Remove /next/ Prefixes

```bash
# Find all /next/ links
grep -r "/vcluster/next/" vcluster_versioned_docs/version-X.X.X/
grep -r "/platform/next/" platform_versioned_docs/version-X.X.X/

# Fix automatically
find . -name "*.mdx" -exec sed -i 's|/vcluster/next/|/vcluster/|g' {} +
find . -name "*.mdx" -exec sed -i 's|/platform/next/|/platform/|g' {} +
```

## Efficient Debugging Method

When you see a broken link error:
```
Broken link on source page path = /docs/vcluster/configure/vcluster-yaml/sync/:
   -> linking to ../control-plane/other/advanced/virtual-scheduler
```

**Don't try to calculate the correct path manually!**

Instead:
1. **CD into the folder** matching the path structure
2. **Grep for the filename** being linked to
3. **Fix the path** in the file that shows up

```bash
# Step 1: CD to the problem location
cd vcluster_versioned_docs/version-X.X.X/configure/vcluster-yaml/sync/

# Step 2: Search for the file being linked
grep -r "virtual-scheduler" . --include="*.mdx"

# Step 3: Fix the path in whichever file shows up
```

This is MUCH faster than manually counting `../` levels!

## Special Cases

### README.mdx Files

README.mdx files represent directory index pages.

```markdown
✅ Both work:
[Sync Config](/vcluster/configure/vcluster-yaml/sync)
[Sync Config](/vcluster/configure/vcluster-yaml/sync/README.mdx)

Prefer the shorter version without README.mdx
```

### Cross-Plugin Links

Links between vCluster and Platform docs:

```markdown
✅ CORRECT (absolute paths):
[vCluster Config](/vcluster/configure/vcluster-yaml)
[Platform Install](/platform/install/helm)

❌ WRONG (can't use relative paths across plugins):
[vCluster Config](../../vcluster/configure/vcluster-yaml.mdx)
```

## Quick Reference

| Link Type | Extension | Example |
|-----------|-----------|---------|
| Absolute URL path | NO .mdx | `/vcluster/deploy/basics` |
| Relative file path | YES .mdx | `../folder/file.mdx` |
| Fragment imports | NO .mdx | `/vcluster/configure/...` |
| Cross-plugin | NO .mdx | `/platform/install/helm` |
| README index | Optional | `/vcluster/sync` or `/vcluster/sync/README.mdx` |

## When Build Fails

1. **Clear cache first**: `scripts/clear_cache.sh`
2. **Use the efficient debugging method** (cd + grep)
3. **Check fragments first** - they affect multiple pages
4. **Fix one type of error at a time** - don't mix absolute/relative fixes
5. **Rebuild after each major fix** - catch new errors early
