---
name: vcluster-docs-releaser
description: vCluster Documentation Release Skill
---

# vCluster Documentation Release Skill

## Overview

This skill automates the vCluster documentation release process, handling version updates, configuration changes, and SEO setup for new vCluster releases.

## Versioning Timing: rc-1 Process

Starting with vCluster v0.33, docs versioning happens at rc-1, NOT on release day.

### How it works

1. At rc-1: Create the new docs version the same day rc-1 is cut
2. Deploy hidden: The version is deployed but HIDDEN from the public version dropdown — users cannot discover it via the UI
3. Validation window: The hidden version can be accessed via Netlify preview URL or by manually changing the version in the URL, allowing the platform team and contributors to validate against real deployed docs
4. On release day: A single "config flip" PR exposes the version in the dropdown. This PR is small, reviewable, and safe to merge by anyone with merge rights
5. Backport flow: Contributors continue targeting `vcluster/` on `main` as usual. If a change needs to land in the upcoming release, add the `backport-v0.33` label to the PR

### Config flip PR (release day)

The config flip PR changes only the version visibility in `docusaurus.config.js`:
- Moves the new version entry from hidden to visible in the dropdown
- Updates `lastVersion` to point to the new version
- Demotes the previous stable version label (removes "Stable" suffix)
- Updates SEO sitemap priorities, announcement bar, and netlify redirect

This separation means all the heavy lifting (version creation, content, link fixes) is done during the rc-1 window, and release day is a low-risk config change.

## When to Use This Skill

Trigger this skill when:
- User mentions "vCluster release", "new vCluster version", or "prepare vCluster docs"
- User mentions "rc-1" or "release candidate" for vCluster docs
- Working on Linear issue with title matching "docs updates for vCluster vX.Y release"
- User asks to prepare docs for a new vCluster version (e.g., 0.33.0)
- User references the release checklist or ENG-XXXX release issues
- User asks to create the "config flip" PR for release day

Note: This skill is for vCluster releases only. Platform releases have a separate skill (`platform-docs-releaser`).

## Prerequisites

Before starting:
1. User must create versioned docs folder — Run: `npm run docusaurus docs:version:vcluster X.Y.Z`
2. Verify version exists: Check `vcluster_versions.json` and `vcluster_versioned_docs/version-X.Y.Z/` exist
3. CLI docs should be generated — Usually automated, but verify 90+ `.md` files in `vcluster_versioned_docs/version-X.Y.Z/cli/`

## Release Workflow

### Part 0: Timing Decision

- rc-1 day: Perform Parts 1-3 (version creation + hidden deploy)
- Release day: Perform Part 4 (config flip PR only)

### Part 1: Next Branch Merge (If Needed)

When: Only if `next` branch contains preview docs that need to go to `main`

Process:
1. Check if `next` has unique content:
   ```bash
   git log --oneline --no-merges origin/next ^main | grep -v "Merge remote-tracking branch"
   ```

2. If `next` has content to merge:
   - Create PR from `next` → `main` with squash merge
   - PR Title: `docs: merge next branch for vX.Y release`
   - PR Body: "Squash merge of preview docs from next branch"
   - Why PR? Branch auto-delete + allows review + CI checks

3. Merge command:
   ```bash
   gh pr create --base main --head next \
     --title "docs: merge next branch for vX.Y release" \
     --body "Squash merge of preview docs from next branch"

   # After review:
   gh pr merge <pr-number> --squash
   ```

Note: Currently `next` only has merge commits, so this step can be skipped for now.

### Part 2: Configuration Updates (rc-1 — hidden deploy)

At rc-1, the version is added to the build but hidden from the dropdown. Do NOT change `lastVersion`, SEO, netlify redirect, or announcement bar — those are Part 4 (release day).

#### 1. Update `docusaurus.config.js` — vCluster plugin config

Add the new version to `onlyIncludeVersions` and `versions` with hidden/unreleased flags:

```js
lastVersion: "0.YY.0",  // DO NOT CHANGE — stays on current stable
onlyIncludeVersions: ["current", "0.XX.0", "0.YY.0", ...],  // Add new version
versions: {
  current: {
    label: "main 🚧",
  },
  "0.XX.0": {  // NEW ENTRY — hidden pre-release
    label: "v0.XX",
    banner: "unreleased",  // Shows warning banner on every page
    badge: true,
    noIndex: true,          // Prevents search engine indexing
  },
  "0.YY.0": {  // KEEP as-is — still current stable
    label: "v0.YY Stable",
    banner: "none",
    badge: true,
  },
  // ... rest unchanged
}
```

#### 2. Update `src/config/versionConfig.js` — hide from dropdown

Add the version to the hidden array so it doesn't appear in the version dropdown:

```js
export const vclusterHiddenVersions = ["0.XX.0"];
export const platformHiddenVersions = [];
```

This is the single source of truth for hiding versions. Two custom components consume it:

- Desktop sidebar (`src/theme/DocSidebar/Desktop/Content/index.js`): filters `useVersions()` and passes visible names to `DocsVersionDropdownNavbarItem` `versions` prop
- Mobile TOC (`src/theme/TOCCollapsible/index.js`): filters `useVersions()` before rendering

Result: the version is built, accessible via direct URL (e.g., `/docs/vcluster/0.XX.0/`), shows the "unreleased" banner, but does not appear in the dropdown.

### Part 3: Verification (rc-1)

AI performs:
1. ✅ Verify versioned docs exist: `ls -la vcluster_versioned_docs/version-0.XX.0/`
2. ✅ Count CLI docs: `ls vcluster_versioned_docs/version-0.XX.0/cli/*.md | wc -l` (expect 90+)
3. ✅ Check vcluster_versions.json includes new version
4. ✅ All config changes applied
5. ✅ Version is hidden from dropdown (in `vclusterHiddenVersions` array in `versionConfig.js`)

User performs:
1. Build check: `npm run build` (not AI's responsibility)
2. Review enterprise/pro tags (manual)
3. Update support dates in `vcluster/manage/upgrade/supported_versions.mdx`
4. Update compatibility matrix in same file
5. Verify partials PR merged (automated PR)
6. Run hurl tests after PR deployed

### Part 4: Config Flip PR (Release Day)

This is the release-day action. All heavy work was done at rc-1. This PR only flips visibility.

PR title: `docs: expose vCluster 0.XX docs in version dropdown`
PR body: "Config flip to make the pre-deployed v0.XX docs visible in the version dropdown. All content was deployed at rc-1."

#### 1. `src/config/versionConfig.js` — unhide from dropdown

```js
export const vclusterHiddenVersions = [];  // Remove the version string
```

#### 2. `docusaurus.config.js` — promote to stable

```js
lastVersion: "0.XX.0",  // Was 0.YY.0 — now points to new version
versions: {
  "0.XX.0": {
    label: "v0.XX Stable",  // Was "v0.XX" — add "Stable"
    banner: "none",          // Was "unreleased" — remove banner
    badge: true,
    // noIndex removed — allow search engine indexing
  },
  "0.YY.0": {
    label: "v0.YY",  // Was "v0.YY Stable" — demote
    banner: "none",
    badge: true,
  },
}
```

#### 3. `src/config/docsearch.js` — update stable version for search

```js
vcluster: {
  pluginId: "vcluster",
  stableVersion: "0.XX.0",  // Was "0.YY.0" — update to new stable
  stableLabel: "v0.XX Stable",
},
```

This drives search modal version boosting (stable docs get `pageRank: 120`, others get `60` or `20`) and the default version filter on the `/docs/search` page. Without this update, search will continue biasing toward the old stable version.

#### 4. `docusaurus.config.js` — SEO sitemap priorities

```js
if (item.url.match(/\/vcluster\/0\.XX\.0\//) ||
    item.url.match(/\/platform\/X\.Y\.0\//)) {
  return { ...item, priority: 1.0, changefreq: 'daily' };
}
```

#### 5. `docusaurus.config.js` — announcement bar

```js
announcementBar: {
  id: "vcluster-0-XX-release",
  content: '... vCluster 0.XX ...',
},
```

#### 6. `netlify.toml` — redirect

```toml
[[redirects]]
  from = "/docs/vcluster/0.XX.0/*"
  to = "/docs/vcluster/:splat"
  status = 301
  force = true
```

#### 7. `hack/test-vcluster-0.XX.hurl` — create hurl test

Copy from previous version, update version numbers. Hurl tests run AFTER PR is deployed to Netlify preview.

This PR is small, reviewable, and safe to merge by anyone with merge rights.

## Files Modified Summary

| File | Changes | Phase |
|------|---------|-------|
| `docusaurus.config.js` | Add to `onlyIncludeVersions`, add version with `banner: "unreleased"` + `noIndex: true` | rc-1 |
| `src/config/versionConfig.js` | Add version to `vclusterHiddenVersions` array | rc-1 |
| `docusaurus.config.js` | `lastVersion`, labels, SEO, announcement bar | Release day |
| `src/config/versionConfig.js` | Remove version from `vclusterHiddenVersions` | Release day |
| `src/config/docsearch.js` | Update `stableVersion` to new stable version string | Release day |
| `netlify.toml` | Redirect | Release day |
| `hack/test-vcluster-0.XX.hurl` | New file | Release day |

## Division of Responsibilities

### AI Handles (Items 2-5):
- ✅ **Update banner** - `announcementBar.content`
- ✅ **Update netlify redirect** - `netlify.toml`
- ✅ **Verify CLI commands** - Check files exist
- ✅ **Create hurl test** - Create new test file
- ✅ **Update search stable version** - `src/config/docsearch.js` `stableVersion` field (release day only)

### User Handles (Items 1, 6-9):
- **Create versioned docs** - `npm run docusaurus docs:version:vcluster X.Y.Z`
- **Review enterprise/pro tags** - Manual review of `<ProAdmonition>` tags
- **Partials PR** - Verify automation ran
- **Update support dates** - Edit `vcluster/manage/upgrade/supported_versions.mdx`
- **Update compatibility matrix** - Edit same file
- **Run build** - `npm run build`
- **Run hurl tests** - After PR deployed

## Common Patterns

### Version Number Pattern
- Major.Minor.Patch: `0.30.0`
- Label format: `v0.30` (without patch)
- Label stable: `v0.30 Stable` (current release)
- Label EOL: `v0.26 (EOS)` (old versions)

### onlyIncludeVersions Pattern
```js
// Rolling window of 6 versions (current + 5 stable)
onlyIncludeVersions: ["current", "0.30.0", "0.29.0", "0.28.0", "0.27.0", "0.26.0"]

// When 0.31.0 releases, becomes:
onlyIncludeVersions: ["current", "0.31.0", "0.30.0", "0.29.0", "0.28.0", "0.27.0"]
// 0.26.0 drops out - goes to archive branch
```

### Archive Process
When a version drops out of `onlyIncludeVersions`:
- Gets moved to dedicated archive branch (see `vcluster-docs-archiver` skill)
- Gets own Netlify deployment
- Main branch dropdown links to archived version

## Testing & Validation

### Before PR:
```bash
# Verify changes
git diff docusaurus.config.js netlify.toml

# Check versions
cat vcluster_versions.json

# Verify CLI docs
ls vcluster_versioned_docs/version-0.XX.0/cli/*.md | wc -l
```

### After PR Deployed:
```bash
# Run hurl tests
hurl --test --variable BASE_URL=https://deploy-preview-XXXX--vcluster-docs-site.netlify.app \
  hack/test-vcluster-0.XX.hurl
```

## Troubleshooting

### Issue: Version already exists
**Solution:** User already ran versioning command - proceed with config updates

### Issue: CLI docs missing
**Solution:** Check if CLI generation script ran - see [Notion doc](https://www.notion.so/loftsh/Update-vCluster-CLI-docs-1a5109408069807aa9ffd8e392269e08)

### Issue: Build fails
**Solution:** User responsibility - they run `npm run build`

### Issue: Hurl tests fail
**Solution:**
1. Check BASE_URL is correct Netlify preview
2. Verify netlify.toml redirect is correct
3. Check version numbers in test file match

## Linear Issue Integration

When triggered by Linear issue (e.g., ENG-9160):
1. Extract version number from issue or ask user
2. Verify prerequisites completed
3. Execute workflow (Part 2)
4. Report checklist status
5. Remind user of their tasks

## Example Output

After completing workflow, provide summary:

```
✅ vCluster 0.30.0 Release Configuration Complete

Files Updated:
- docusaurus.config.js (6 locations)
- netlify.toml (redirect updated)
- hack/test-vcluster-0.30.hurl (created)

My Tasks Complete (2-5):
✅ Updated banner
✅ Updated netlify redirect
✅ Verified CLI docs (93 files found)
✅ Created hurl test file

Your Tasks Remaining (1, 6-9):
⏳ Review enterprise/pro tags
⏳ Update support dates
⏳ Update compatibility matrix
⏳ Run build: npm run build
⏳ Run hurl tests (after PR deployed)

Ready to commit and push!
```

## Quick Reference

**Version pattern:** `0.30.0` → label: `v0.30`
**Files to modify:** 4 files total (release day adds `src/config/docsearch.js`)
**Lines to change:** ~10 locations across all files
**Time estimate:** 2-3 minutes for AI tasks

## Notes

- This skill is for vCluster only — Platform has separate release process
- Starting with v0.33, versioning happens at rc-1, not on release day
- The version is deployed hidden at rc-1, then exposed via config flip PR on release day
- Contributors use `backport-v0.33` label for changes that must land in the upcoming release
- Always remove "Stable" label from previous version when adding new one
- Keep 5-6 versions in `onlyIncludeVersions` for build performance
- Hurl tests validate redirects work correctly
- User runs build — AI does not run npm commands

## CRITICAL: Cross-Plugin Links to Platform

vCluster docs frequently link to Platform docs. These links can break when Platform releases a new version.

### Why Cross-Plugin Links Break

1. **Platform `lastVersion` change**: When Platform releases (e.g., 4.5.0 → 4.6.0), `/docs/platform/...` routes to new version
2. **Path restructuring**: Platform may reorganize docs between versions
3. **vCluster links resolve to Platform's lastVersion**: All `/platform/...` links in vCluster docs point to current Platform version

### Common Platform Path Changes to Watch

When Platform releases, check if vCluster docs have broken links to:
```
/platform/administer/monitoring/...  → /platform/maintenance/monitoring/...
/platform/install/advanced/air-gapped → /platform/install/air-gapped
/platform/administer/users-permissions/... → /platform/administer/authentication/...
/platform/api/authentication → /platform/administer/authentication/access-keys
```

### Fixing vCluster→Platform Links

After Platform release, run Netlify build to find broken links, then fix:
```bash
# Update paths in all vCluster versioned docs
find vcluster vcluster_versioned_docs -name "*.mdx" \
  -exec sed -i 's|/platform/administer/monitoring/|/platform/maintenance/monitoring/|g' {} \;

find vcluster vcluster_versioned_docs -name "*.mdx" \
  -exec sed -i 's|/platform/install/advanced/air-gapped|/platform/install/air-gapped|g' {} \;
```

### Version-Specific Platform Links

If vCluster docs link to Platform version that's no longer in `onlyIncludeVersions`:
```markdown
<!-- WRONG - 4.3.0 not in Platform build anymore -->
[Templates](/platform/4.3.0/administer/templates/create-virtual-cluster-template)

<!-- CORRECT - use current Platform path -->
[Templates](/platform/administer/templates/create-templates)
```

### Coordinating Releases

When both vCluster and Platform release simultaneously:
1. Platform changes `lastVersion` and may restructure paths
2. vCluster cross-plugin links need updating to match new Platform structure
3. Test vCluster→Platform links in Netlify preview before merging
