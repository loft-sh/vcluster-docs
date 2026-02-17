# Platform Documentation Release Skill

## Overview

This skill automates the vCluster Platform documentation release process, handling API generation, version updates, configuration changes, and SEO setup for new Platform releases.

## When to Use This Skill

Trigger this skill when:
- User mentions "Platform release", "new Platform version", or "prepare Platform docs"
- Working on Linear issue with title matching "docs updates for Platform vX.Y release"
- User asks to prepare docs for a new Platform version (e.g., 4.5.0)
- User references the platform release checklist

**Note:** This skill is for Platform releases only. vCluster releases have a separate skill (`vcluster-docs-releaser`).

## Prerequisites

Before starting:
1. **User must create versioned docs folder** - Run: `npm run docusaurus docs:version:platform X.Y.Z`
2. **Verify version exists**: Check `platform_versions.json` and `platform_versioned_docs/version-X.Y.Z/` exist
3. **vCluster schema available**: Typically in `configsrc/vcluster/main/vcluster.schema.json`

## Release Workflow

### Part 1: Generate Platform API Partials

**CRITICAL FIRST STEP**: Platform releases require generating API documentation partials before any other changes.

**Process:**
1. Locate the vCluster schema file:
   ```bash
   ls configsrc/vcluster/main/vcluster.schema.json
   ```

2. Run the Go generation script:
   ```bash
   go run hack/platform/partials/main.go configsrc/vcluster/main/vcluster.schema.json
   ```

3. This generates API documentation in:
   - `platform/api/_partials/resources/` - API resource documentation
   - Configuration reference files
   - Status reference files

**Why this matters**: Platform API docs are auto-generated from the schema. Without this step, the build will fail or have outdated API references.

### Part 2: Import Path Strategy - Same-Plugin vs Cross-Plugin

**IMPORTANT**: Understand the difference between versioned and non-versioned partials.

**Two types of imports**:

1. **Same-plugin imports** (platform→platform/_partials):
   - These partials ARE versioned with the docs
   - Use **relative paths** - they stay relative and version together
   - Example:
     ```javascript
     // ✅ CORRECT - relative path for platform's own partials
     import InstallNextSteps from "../../_partials/install/install-next-steps.mdx";
     import BasePrerequisites from '../../_partials/install/base-prerequisites.mdx';
     ```

2. **Cross-plugin imports** (platform→vcluster/_partials or platform→docs/_partials):
   - These partials are NOT versioned per platform release (shared across all versions)
   - Use **@site alias** - works at any depth
   - Example:
     ```javascript
     // ✅ CORRECT - @site for shared cross-plugin partials
     import InstallCli from '@site/vcluster/_partials/deploy/install-cli.mdx';
     import KubeconfigUpdate from '@site/docs/_partials/kubeconfig_update.mdx';
     import ProAdmonition from '@site/vcluster/_partials/admonitions/pro-admonition.mdx';

     // ❌ WRONG - relative paths break when versioned
     import InstallCli from '../../../vcluster/_partials/deploy/install-cli.mdx';
     ```

**Why this matters**:
- When `npm run docusaurus docs:version:platform` runs, same-plugin partials copy WITH the docs (relative paths still work)
- **Per CLAUDE.md line 241-243**: "Markdown file references only work when the source and target files are processed by the same plugin instance... If you are linking files between plugins, you have to use URL links."
- Cross-plugin imports cannot use relative file paths - must use `@site` alias (absolute)

**Files that need @site for cross-plugin imports**:
- `platform/install/environments/{aws,azure,gcp}.mdx`
- `platform/install/quick-start-guide.mdx`
- `platform/understand/what-are-virtual-clusters.mdx`

**Verification command**:
```bash
# Find cross-plugin imports using relative paths (should use @site instead)
grep -r "import.*\.\./\.\./\.\./vcluster\|import.*\.\./\.\./\.\./docs" platform/ --include="*.mdx" -l
```

## Part 3: Configuration Updates

These are the AI's responsibility (automated):

#### 1. Update `docusaurus.config.js`

**Location 1: SEO sitemap priorities (~line 108)**
```js
// Latest stable versions get highest priority (0.XX.0 for vCluster, X.Y.0 for platform)
if (item.url.match(/\/vcluster\/0\.XX\.0\//) ||
    item.url.match(/\/platform\/X\.Y\.0\//)) {
```

**Location 2: SEO comment (~line 120)**
```js
// ALL other versioned docs get very low priority (older platform versions)
```

**Location 3: Platform plugin config (~line 170-190)**
```js
{
  id: "platform",
  path: "platform",
  routeBasePath: "platform",
  sidebarPath: require.resolve("./sidebarsPlatform.js"),
  editUrl: ({ versionDocsDirPath, docPath }) =>
    `https://github.com/loft-sh/vcluster-docs/edit/main/${versionDocsDirPath}/${docPath}`,
  editCurrentVersion: true,
  lastVersion: "X.Y.0",  // UPDATE THIS
  versions: {
    current: {
      label: "main 🚧",
    },
    "X.Y.0": {  // NEW ENTRY
      label: "vX.Y Stable",
      banner: "none",
      badge: true,
    },
    "X.Z.0": {  // DEMOTE previous stable
      label: "vX.Z",  // Remove "Stable" suffix
      banner: "none",
      badge: true,
    },
    // Older versions...
  },
},
```

**Pattern:**
- Keep 2-3 versions (current + 2 stable)
- New version gets "Stable" label
- Previous stable loses "Stable" suffix
- Oldest version may get "EOL" or "unmaintained" banner

**Location 4: Announcement bar (~line 400)**
```js
announcementBar: {
  id: "platform-X-Y-release",
  content:
    '🚀 <strong>New releases: <a href="https://www.vcluster.com/releases/en/changelog?hideLogo=true&hideMenu=true&theme=dark&embed=true&c=vCluster" target="_blank">vCluster Platform X.Y and vCluster 0.ZZ</a></strong>',
  backgroundColor: "#4a90e2",
  textColor: "#ffffff",
  isCloseable: true,
},
```

#### 2. Update `netlify.toml`

**Location: Redirect section (~line 520)**
```toml
[[redirects]]
  from = "/docs/platform/X.Y.0/*"  # Update to new version
  to = "/docs/platform/:splat"
  status = 301
  force = true
```

#### 3. Create Hurl Test File

**File:** `hack/test-platform-X.Y.hurl`

**Process:**
1. Copy previous version: `cp hack/test-platform-X.Z.hurl hack/test-platform-X.Y.hurl`
2. Update header:
   ```
   # Platform X.Y Documentation Release Tests
   # Usage: hurl --test --variable BASE_URL=https://deploy-preview-XXXX--vcluster-docs-site.netlify.app hack/test-platform-X.Y.hurl
   ```
3. Update redirect tests:
   ```
   # Test: Platform X.Y.0 redirects to main platform docs
   GET {{BASE_URL}}/docs/platform/X.Y.0
   ```
4. Update version verification tests:
   ```
   body contains "Platform X.Y"
   body contains "vX.Y Stable"
   ```
5. **Add cross-version reference tests**: Verify vCluster→Platform links work
6. **Remove all line number references**: Do NOT include `(lines X-Y)` in section headers

**IMPORTANT:** Hurl tests run AFTER PR is deployed to Netlify preview.

**Cross-Version Testing**: Platform hurl tests should verify that:
- Latest vCluster version links to current Platform docs
- Older vCluster versions link to appropriate Platform versions
- Example: vCluster 0.27 → Platform 4.4, vCluster 0.26 → Platform 4.3

### Part 3: Verification

**AI performs:**
1. ✅ Verify versioned docs exist: `ls -la platform_versioned_docs/version-X.Y.0/`
2. ✅ Check platform_versions.json includes new version
3. ✅ Verify API partials generated: `ls platform/api/_partials/resources/`
4. ✅ All config changes applied

**User performs:**
1. Build check: `npm run build` (**IMPORTANT**: Per CLAUDE.md, AI never runs build - user only)
2. Review enterprise/pro tags (manual)
3. Update support dates in platform-specific supported versions file
4. Update compatibility matrix
5. Run hurl tests after PR deployed

**If build errors occur**: Reference CLAUDE.md for:
- Link resolution rules (use relative file paths with `.mdx` extensions)
- Broken link debugging method (cd into versioned folder, grep for file)

## Files Modified Summary

| File | Changes | AI/User |
|------|---------|---------|
| `platform/api/_partials/resources/**` | Generated API docs | AI (via Go script) |
| `docusaurus.config.js` | SEO, lastVersion, versions, banner | AI |
| `netlify.toml` | Redirect | AI |
| `hack/test-platform-X.Y.hurl` | New test file | AI |
| Platform support dates file | Release/EOL dates | User |

## Division of Responsibilities

### AI Handles (Items 1, 3-5):
- ✅ **Generate API partials** - Run Go script with schema path
- ✅ **Verify @site alias usage** - Check main branch uses `@site` for cross-plugin imports
- ✅ **Update docusaurus config** - lastVersion, versions, SEO, banner
- ✅ **Update netlify redirect** - `netlify.toml`
- ✅ **Create hurl test** - Including cross-version tests

### User Handles (Items 2, 6-8):
- **Create versioned docs** - `npm run docusaurus docs:version:platform X.Y.Z`
- **Review enterprise/pro tags** - Manual review
- **Update support dates** - Platform-specific file
- **Update compatibility matrix** - Platform-specific file
- **Run build** - `npm run build`
- **Run hurl tests** - After PR deployed

## Common Patterns

### Version Number Pattern
- Major.Minor.Patch: `4.5.0`
- Display format: `vX.Y` (without patch)
- Label stable: `vX.Y Stable` (current release)
- Label EOL: `vX.Y (EOL)` or banner: `unmaintained`

### versions Pattern
```js
// Platform typically keeps 2-3 versions (current + 2 stable)
versions: {
  current: {
    label: "main 🚧",
  },
  "4.5.0": {
    label: "v4.5 Stable",
    banner: "none",
    badge: true,
  },
  "4.4.0": {
    label: "v4.4",  // Removed "Stable"
    banner: "none",
    badge: true,
  },
  "4.3.0": {
    label: "v4.3",
    banner: "none",
    badge: true,
  },
}

// When 4.6.0 releases, 4.3.0 might get EOL treatment
```

## Platform-Specific Notes

### Differences from vCluster Releases

1. **No CLI docs to verify** - Platform doesn't have CLI documentation
2. **Must generate API partials** - Critical first step
3. **Fewer versions** - Typically 2-3 vs vCluster's 5-6
4. **Cross-version testing** - Must verify vCluster→Platform links

### API Partials Generation

The Go script at `hack/platform/partials/main.go`:
- Reads vCluster JSON schema
- Generates MDX partials for API resources
- Creates reference documentation
- Updates status references

If the schema path changes, check:
- `configsrc/vcluster/main/vcluster.schema.json` (typical location)
- `configsrc/vcluster/vX.Y/vcluster.schema.json` (version-specific)

## Testing & Validation

### Before PR:
```bash
# 1. Generate API partials
go run hack/platform/partials/main.go configsrc/vcluster/main/vcluster.schema.json

# 2. Verify partials generated
ls platform/api/_partials/resources/ | wc -l  # Should have multiple files

# 3. Verify changes
git diff docusaurus.config.js netlify.toml

# 4. Check versions
cat platform_versions.json
```

### After PR Deployed:
```bash
# Run hurl tests
hurl --test --variable BASE_URL=https://deploy-preview-XXXX--vcluster-docs-site.netlify.app \
  hack/test-platform-X.Y.hurl
```

## Troubleshooting

### Issue: API partials generation fails
**Solution:**
1. Check schema path is correct
2. Verify Go dependencies: `cd hack/platform/partials && go mod download`
3. Check schema format is valid JSON

### Issue: Version already exists
**Solution:** User already ran versioning command - proceed with config updates

### Issue: Build fails
**Solution:** User responsibility - they run `npm run build`

### Issue: Hurl tests fail
**Solution:**
1. Check BASE_URL is correct Netlify preview
2. Verify netlify.toml redirect is correct
3. Check version numbers in test file match
4. Verify cross-version references work

### Issue: Cross-version links broken
**Solution:**
1. Check vCluster versioned docs point to correct Platform version
2. Verify Platform version exists and is accessible
3. Update links in older vCluster versions if needed

## CRITICAL: lastVersion Routing and Link Breakage

**Root Cause Understanding**: When `lastVersion` changes in `docusaurus.config.js`, URL routing fundamentally changes.

### How Docusaurus Version Routing Works

```
lastVersion: "4.6.0"  →  /docs/platform/...  routes to 4.6.0 content
                         /docs/platform/4.5.0/...  routes to 4.5.0 content
                         /docs/platform/4.4.0/...  routes to 4.4.0 content
```

**Key insight**: `/docs/platform/...` (no version) ALWAYS routes to `lastVersion` content.

### Why Links Break When lastVersion Changes

1. **Older versioned docs** (4.4.0, 4.5.0) that use `/docs/platform/...` links will now resolve to 4.6.0 content
2. **Path restructuring** between versions causes 404s (e.g., `configure/config.mdx` moved to `configure/introduction.mdx`)
3. **vCluster cross-plugin links** always resolve to lastVersion, so they break if Platform restructured paths

### Version Isolation Principle

**RULE**: Each version should link within itself using version prefixes.

```markdown
<!-- In 4.5.0 docs - CORRECT -->
[Link](/docs/platform/4.5.0/configure/config)

<!-- In 4.5.0 docs - WRONG (will resolve to 4.6.0) -->
[Link](/docs/platform/configure/config)
```

### Common Path Changes to Check (4.6.0 example)

When releasing a new version, check if these paths changed:
- `administer/monitoring/...` → `maintenance/monitoring/...`
- `install/advanced/air-gapped` → `install/air-gapped`
- `administer/users-permissions/...` → `administer/authentication/...`
- `api/authentication` → `administer/authentication/access-keys`
- `configure/config.mdx` → `configure/introduction.mdx`

### Fixing Broken Links Workflow

1. **Run Netlify build** - it will list all broken links
2. **Categorize by source**:
   - Platform versioned docs (4.3.0, 4.4.0, 4.5.0) → add version prefix
   - vCluster docs → update to new Platform paths
   - Shared partials (`docs/_partials/`) → use versioned paths or update to new structure
3. **Bulk fix with sed**:
   ```bash
   # Add version prefix to older platform docs
   find platform_versioned_docs/version-4.5.0 -name "*.mdx" \
     -exec sed -i 's|/docs/platform/configure/|/docs/platform/4.5.0/configure/|g' {} \;

   # Update vCluster cross-plugin links to new paths
   find vcluster vcluster_versioned_docs -name "*.mdx" \
     -exec sed -i 's|/platform/administer/monitoring/|/platform/maintenance/monitoring/|g' {} \;
   ```

### onlyIncludeVersions Impact

Versions NOT in `onlyIncludeVersions` won't be built:
```js
onlyIncludeVersions: ["current", "4.6.0", "4.5.0", "4.4.0"]
// 4.3.0 NOT included = /docs/platform/4.3.0/... will 404
```

**When removing a version**: Update any links pointing to that version to use an included version or the generic path.

## Linear Issue Integration

When triggered by Linear issue:
1. Extract version number from issue or ask user
2. Verify prerequisites completed
3. Execute workflow (Part 1 & 2)
4. Report checklist status
5. Remind user of their tasks

## Example Output

After completing workflow, provide summary:

```
✅ Platform 4.5.0 Release Configuration Complete

Files Updated:
- platform/api/_partials/resources/ (API docs generated)
- platform/ (verified @site alias usage for cross-plugin imports)
- docusaurus.config.js (4 locations)
- netlify.toml (redirect updated)
- hack/test-platform-4.5.hurl (created)

My Tasks Complete (1, 3-5):
✅ Generated API partials
✅ Verified main branch uses @site alias for cross-plugin imports
✅ Updated docusaurus config
✅ Updated netlify redirect
✅ Created hurl test file (including cross-version tests)

Your Tasks Remaining (2, 6-8):
⏳ Review enterprise/pro tags
⏳ Update support dates
⏳ Update compatibility matrix
⏳ Run build: npm run build
⏳ Run hurl tests (after PR deployed)

Ready to commit and push!
```

## Quick Reference

**Version pattern:** `4.5.0` → display: `v4.5`
**Files to modify:** 4 types (API partials, config, redirect, tests)
**Critical first step:** Generate API partials with Go script
**Time estimate:** 3-5 minutes for AI tasks

## Notes

- This skill is for **Platform only** - vCluster has separate release process
- Always generate API partials FIRST before any other changes
- Platform maintains fewer versions than vCluster
- Cross-version testing with vCluster links is important
- **Per CLAUDE.md**: User runs build - AI NEVER runs `npm run build`
- **⚠️ CRITICAL**: Never modify versioned docs unless explicitly requested by user (CLAUDE.md warning)
- For detailed Docusaurus guidelines, always reference CLAUDE.md
