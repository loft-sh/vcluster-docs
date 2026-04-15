---
name: platform-docs-releaser
description: Platform Documentation Release Skill
---

# Platform Documentation Release Skill

## Overview

This skill automates the vCluster Platform documentation release process, handling API generation, version updates, configuration changes, and SEO setup for new Platform releases.

## Versioning Timing: rc-1 Process

Starting with Platform v4.8, docs versioning happens at rc-1, NOT on release day.

### How it works

1. At rc-1: Create the new docs version the same day rc-1 is cut
2. Deploy hidden: The version is deployed but HIDDEN from the public version dropdown — users cannot discover it via the UI
3. Validation window: The hidden version can be accessed via Netlify preview URL or by manually changing the version in the URL, allowing the platform team and contributors to validate against real deployed docs
4. On release day: A single "config flip" PR exposes the version in the dropdown. This PR is small, reviewable, and safe to merge by anyone with merge rights
5. Backport flow: Contributors continue targeting `platform/` on `main` as usual. If a change needs to land in the upcoming release, add the `backport-v4.8.0` label to the PR

### Config flip PR (release day)

The config flip PR changes only the version visibility in `docusaurus.config.js`:
- Updates `lastVersion` to point to the new version
- Adds the new version to the dropdown with "Stable" label
- Demotes the previous stable version label (removes "Stable" suffix)
- Updates SEO sitemap priorities, announcement bar, and netlify redirect

This separation means all the heavy lifting (version creation, API partials, content, link fixes) is done during the rc-1 window, and release day is a low-risk config change.

## When to Use This Skill

Trigger this skill when:
- User mentions "Platform release", "new Platform version", or "prepare Platform docs"
- User mentions "rc-1" or "release candidate" for Platform docs
- Working on Linear issue with title matching "docs updates for Platform vX.Y release"
- User asks to prepare docs for a new Platform version (e.g., 4.8.0)
- User references the platform release checklist
- User asks to create the "config flip" PR for release day

Note: This skill is for Platform releases only. vCluster releases have a separate skill (`vcluster-docs-releaser`).

## Prerequisites

Before starting:
1. **User must create versioned docs folder** - Run: `npm run docusaurus docs:version:platform X.Y.Z`
2. **Verify version exists**: Check `platform_versions.json` and `platform_versioned_docs/version-X.Y.Z/` exist
3. **vCluster schema available**: Typically in `configsrc/vcluster/main/vcluster.schema.json`

## Release Workflow

### Part 1: Generate Platform API Partials

**CRITICAL FIRST STEP**: Platform releases require updating the Go API dependency and regenerating API documentation partials before any other changes.

The generator at `hack/platform/partials/main.go` produces docs from two sources:
- **Go types** in `github.com/loft-sh/api/v4` — platform config fields, resource references (must match the new platform version)
- **vCluster JSON schema** — vCluster config reference sections embedded in the platform docs

**Process:**

1. Bump `github.com/loft-sh/api/v4` to the version matching the new platform release:
   ```bash
   go get github.com/loft-sh/api/v4@vX.Y.Z   # e.g. v4.9.0
   go mod tidy
   go mod vendor
   ```
   The api module version tracks the platform version (platform v4.9.x → api v4.9.x). Check available tags with:
   ```bash
   cd ~/git/vcluster/api && git tag | sort -V | grep "^vX\.Y" | tail -5
   ```
   Use the highest stable tag for the target minor version (e.g. `v4.9.1` over `v4.9.0-rc.1`).

2. Locate the vCluster schema file:
   ```bash
   ls configsrc/vcluster/main/vcluster.schema.json
   ```

3. Run the Go generation script:
   ```bash
   go run hack/platform/partials/main.go configsrc/vcluster/main/vcluster.schema.json
   ```

4. This generates/updates API documentation in:
   - `platform/api/_partials/resources/` - API resource documentation
   - Configuration reference files (`config/reference.mdx`, `config/status_reference.mdx`)
   - Any fields added or removed in the new platform version are automatically reflected

**Why this matters**: The Go types in `api/v4` define the platform config schema. If the dependency is stale, new config fields (like `database`) will be missing from the docs and removed fields will remain as dead content.

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

## Part 3: Configuration Updates (rc-1 — hidden deploy)

At rc-1, the version is added to the build but hidden from the dropdown. Do NOT change `lastVersion`, SEO, netlify redirect, or announcement bar — those are Part 5 (release day).

#### 1. Update `docusaurus.config.js` — Platform plugin config

Add the new version to `onlyIncludeVersions` and `versions` with hidden/unreleased flags:

```js
lastVersion: "X.Z.0",  // DO NOT CHANGE — stays on current stable
onlyIncludeVersions: ["current", "X.Y.0", "X.Z.0", ...],  // Add new version
versions: {
  current: {
    label: "main 🚧",
  },
  "X.Y.0": {  // NEW ENTRY — hidden pre-release
    label: "vX.Y",
    banner: "unreleased",  // Shows warning banner on every page
    badge: true,
    noIndex: true,          // Prevents search engine indexing
  },
  "X.Z.0": {  // KEEP as-is — still current stable
    label: "vX.Z Stable",
    banner: "none",
    badge: true,
  },
  // ... rest unchanged
}
```

#### 2. Update `src/config/versionConfig.js` — hide from dropdown

Add the version to the hidden array so it doesn't appear in the version dropdown:

```js
export const vclusterHiddenVersions = [];
export const platformHiddenVersions = ["X.Y.0"];
```

This is the single source of truth for hiding versions. Two custom components consume it:

- Desktop sidebar (`src/theme/DocSidebar/Desktop/Content/index.js`): filters `useVersions()` and passes visible names to `DocsVersionDropdownNavbarItem` `versions` prop
- Mobile TOC (`src/theme/TOCCollapsible/index.js`): filters `useVersions()` before rendering

Result: the version is built, accessible via direct URL (e.g., `/docs/platform/X.Y.0/`), shows the "unreleased" banner, but does not appear in the dropdown.

### Part 4: Verification (rc-1)

AI performs:

1. ✅ Verify versioned docs exist: `ls -la platform_versioned_docs/version-X.Y.0/`
2. ✅ Check platform_versions.json includes new version
3. ✅ Verify API partials generated: `ls platform/api/_partials/resources/`
4. ✅ All config changes applied
5. ✅ Version is hidden from dropdown (in `platformHiddenVersions` array in `versionConfig.js`)

User performs:

1. Build check: `npm run build` (per CLAUDE.md, AI never runs build — user only)
2. Review enterprise/pro tags (manual)
3. Update support dates in platform-specific supported versions file
4. Update compatibility matrix
5. Run hurl tests after PR deployed

If build errors occur: Reference CLAUDE.md for link resolution rules and broken link debugging.

### Part 5: Config Flip PR (Release Day)

This is the release-day action. All heavy work was done at rc-1. This PR only flips visibility.

PR title: `docs: expose Platform X.Y docs in version dropdown`
PR body: "Config flip to make the pre-deployed vX.Y docs visible in the version dropdown. All content was deployed at rc-1."

#### 1. `src/config/versionConfig.js` — unhide from dropdown

```js
export const platformHiddenVersions = [];  // Remove the version string
```

#### 2. `docusaurus.config.js` — promote to stable

```js
lastVersion: "X.Y.0",  // Was X.Z.0 — now points to new version
versions: {
  "X.Y.0": {
    label: "vX.Y Stable",  // Was "vX.Y" — add "Stable"
    banner: "none",          // Was "unreleased" — remove banner
    badge: true,
    // noIndex removed — allow search engine indexing
  },
  "X.Z.0": {
    label: "vX.Z",  // Was "vX.Z Stable" — demote
    banner: "none",
    badge: true,
  },
}
```

#### 3. `docusaurus.config.js` — SEO sitemap priorities

```js
if (item.url.match(/\/vcluster\/0\.XX\.0\//) ||
    item.url.match(/\/platform\/X\.Y\.0\//)) {
  return { ...item, priority: 1.0, changefreq: 'daily' };
}
```

#### 4. `docusaurus.config.js` — announcement bar

```js
announcementBar: {
  id: "platform-X-Y-release",
  content: '... vCluster Platform X.Y ...',
},
```

#### 5. `netlify.toml` — redirect

```toml
[[redirects]]
  from = "/docs/platform/X.Y.0/*"
  to = "/docs/platform/:splat"
  status = 301
  force = true
```

#### 6. `hack/test-platform-X.Y.hurl` — create hurl test

Copy from previous version, update version numbers. Include cross-version tests (vCluster→Platform links). Hurl tests run AFTER PR is deployed to Netlify preview.

This PR is small, reviewable, and safe to merge by anyone with merge rights.

## Files Modified Summary

| File | Changes | Phase |
|------|---------|-------|
| `platform/api/_partials/resources/**` | Generated API docs | rc-1 |
| `docusaurus.config.js` | Add to `onlyIncludeVersions`, add version with `banner: "unreleased"` + `noIndex: true` | rc-1 |
| `src/config/versionConfig.js` | Add version to `platformHiddenVersions` array | rc-1 |
| `docusaurus.config.js` | `lastVersion`, labels, SEO, announcement bar | Release day |
| `src/config/versionConfig.js` | Remove version from `platformHiddenVersions` | Release day |
| `netlify.toml` | Redirect | Release day |
| `hack/test-platform-X.Y.hurl` | New test file | Release day |
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
- Reads Go types from `github.com/loft-sh/api/v4` (vendored) to generate platform config and resource reference docs
- Reads the vCluster JSON schema for vCluster config reference sections embedded in platform docs
- Generates MDX partials for API resources
- Creates/updates `config/reference.mdx` and `config/status_reference.mdx`
- Deletes partials for fields removed from the API, adds partials for new fields

**The Go dependency must be bumped to match the new platform release before running the generator.** See Part 1 above.

If the schema path changes, check:
- `configsrc/vcluster/main/vcluster.schema.json` (typical location)
- `configsrc/vcluster/vX.Y/vcluster.schema.json` (version-specific)

## Testing & Validation

### Before PR:
```bash
# 1. Bump api/v4 dependency to match new platform version
go get github.com/loft-sh/api/v4@vX.Y.Z
go mod tidy
go mod vendor

# 2. Generate API partials
go run hack/platform/partials/main.go configsrc/vcluster/main/vcluster.schema.json

# 3. Verify partials generated
ls platform/api/_partials/resources/ | wc -l  # Should have multiple files

# 4. Review what changed in the generated partials
git diff --stat platform/api/

# 5. Verify other changes
git diff docusaurus.config.js netlify.toml

# 6. Check versions
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

- This skill is for Platform only — vCluster has separate release process
- Starting with v4.8, versioning happens at rc-1, not on release day
- The version is deployed hidden at rc-1, then exposed via config flip PR on release day
- Contributors use `backport-v4.8.0` label for changes that must land in the upcoming release
- Always generate API partials FIRST before any other changes
- Platform maintains fewer versions than vCluster
- Cross-version testing with vCluster links is important
- Per CLAUDE.md: User runs build — AI NEVER runs `npm run build`
- CRITICAL: Never modify versioned docs unless explicitly requested by user (CLAUDE.md warning)
- For detailed Docusaurus guidelines, always reference CLAUDE.md
