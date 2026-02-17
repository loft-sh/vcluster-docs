# vCluster Documentation Release Skill

## Overview

This skill automates the vCluster documentation release process, handling version updates, configuration changes, and SEO setup for new vCluster releases.

## When to Use This Skill

Trigger this skill when:
- User mentions "vCluster release", "new vCluster version", or "prepare vCluster docs"
- Working on Linear issue with title matching "docs updates for vCluster vX.Y release"
- User asks to prepare docs for a new vCluster version (e.g., 0.30.0)
- User references the release checklist or ENG-XXXX release issues

**Note:** This skill is for vCluster releases only. Platform releases will have a separate skill.

## Prerequisites

Before starting:
1. **User must create versioned docs folder** - Run: `npm run docusaurus docs:version:vcluster X.Y.Z`
2. **Verify version exists**: Check `vcluster_versions.json` and `vcluster_versioned_docs/version-X.Y.Z/` exist
3. **CLI docs should be generated** - Usually automated, but verify 90+ `.md` files in `vcluster_versioned_docs/version-X.Y.Z/cli/`

## Release Workflow

### Part 1: Next Branch Merge (If Needed)

**When:** Only if `next` branch contains preview docs that need to go to `main`

**Process:**
1. Check if `next` has unique content:
   ```bash
   git log --oneline --no-merges origin/next ^main | grep -v "Merge remote-tracking branch"
   ```

2. If `next` has content to merge:
   - Create PR from `next` → `main` with **squash merge**
   - PR Title: `docs: merge next branch for vX.Y release`
   - PR Body: "Squash merge of preview docs from next branch"
   - **Why PR?** Branch auto-delete + allows review + CI checks

3. Merge command:
   ```bash
   gh pr create --base main --head next \
     --title "docs: merge next branch for vX.Y release" \
     --body "Squash merge of preview docs from next branch"

   # After review:
   gh pr merge <pr-number> --squash
   ```

**Note:** Currently `next` only has merge commits, so this step can be skipped for now.

### Part 2: Configuration Updates

These are the AI's responsibility (automated):

#### 1. Update `docusaurus.config.js`

**Location 1: Main docs label (~line 80)**
```js
versions: {
  current: {
    label: "v0.XX",  // Update version number
    banner: "none",
    badge: false,
  },
},
```

**Location 2: SEO sitemap priorities (~line 108)**
```js
// Latest stable versions get highest priority (0.XX.0 for vCluster, 4.4.0 for platform)
if (item.url.match(/\/vcluster\/0\.XX\.0\//) ||
```

**Location 3: SEO comment (~line 120)**
```js
// ALL other versioned docs get very low priority (0.19-0.XX for vCluster, older platform versions)
```

**Location 4: vCluster plugin config (~line 192)**
```js
lastVersion: "0.XX.0",
onlyIncludeVersions: ["current", "0.XX.0", "0.YY.0", "0.ZZ.0", ...],  // Add new, remove oldest
versions: {
  current: {
    label: "main 🚧",
  },
  "0.XX.0": {  // NEW ENTRY
    label: "v0.XX Stable",
    banner: "none",
    badge: true,
  },
  "0.YY.0": {  // DEMOTE previous stable
    label: "v0.YY",  // Remove "Stable" suffix
    banner: "none",
    badge: true,
  },
  // ... rest
}
```

**Pattern:**
- Keep 5-6 versions in `onlyIncludeVersions` (current + 5 stable)
- New version gets "Stable" label
- Previous stable loses "Stable" suffix
- Remove oldest version (drops out of build)

**Location 5: Announcement bar (~line 400)**
```js
announcementBar: {
  id: "platform-4-4-release",
  content:
    '🚀 <strong>New releases: <a href="https://www.vcluster.com/releases/en/changelog?hideLogo=true&hideMenu=true&theme=dark&embed=true&c=vCluster" target="_blank">vCluster Platform 4.4 and vCluster 0.XX</a></strong>',
  backgroundColor: "#4a90e2",
  textColor: "#ffffff",
  isCloseable: true,
},
```

#### 2. Update `netlify.toml`

**Location: Redirect section (~line 520)**
```toml
[[redirects]]
  from = "/docs/vcluster/0.XX.0/*"  # Update to new version
  to = "/docs/vcluster/:splat"
  status = 301
  force = true
```

#### 3. Create Hurl Test File

**File:** `hack/test-vcluster-0.XX.hurl`

**Process:**
1. Copy previous version: `cp hack/test-vcluster-0.YY.hurl hack/test-vcluster-0.XX.hurl`
2. Update header:
   ```
   # vCluster 0.XX Comprehensive Redirect Tests
   # Usage: hurl --test --variable BASE_URL=https://deploy-preview-XXXX--vcluster-docs-site.netlify.app hack/test-vcluster-0.XX.hurl
   ```
3. Update redirect test (~line 207):
   ```
   # Test 32: vCluster 0.XX.0 wildcard redirect
   GET {{BASE_URL}}/docs/vcluster/0.XX.0/introduction/what-are-virtual-clusters
   ```
4. Update verification tests (~line 441-448):
   ```
   body contains "vCluster 0.XX"
   body contains "v0.XX Stable"
   ```
5. **Remove all line number references**: Do NOT include `(lines X-Y)` in section headers - they're volatile

**IMPORTANT:** Hurl tests run AFTER PR is deployed to Netlify preview.

### Part 3: Verification

**AI performs:**
1. ✅ Verify versioned docs exist: `ls -la vcluster_versioned_docs/version-0.XX.0/`
2. ✅ Count CLI docs: `ls vcluster_versioned_docs/version-0.XX.0/cli/*.md | wc -l` (expect 90+)
3. ✅ Check vcluster_versions.json includes new version
4. ✅ All config changes applied

**User performs:**
1. Build check: `npm run build` (not AI's responsibility)
2. Review enterprise/pro tags (manual)
3. Update support dates in `vcluster/deploy/upgrade/supported_versions.mdx`
4. Update compatibility matrix in same file
5. Verify partials PR merged (automated PR)
6. Run hurl tests after PR deployed

## Files Modified Summary

| File | Changes | Lines |
|------|---------|-------|
| `docusaurus.config.js` | Label, SEO, versions, banner | ~81, ~108, ~120, ~192-223, ~400 |
| `netlify.toml` | Redirect | ~521 |
| `hack/test-vcluster-0.XX.hurl` | New file | All |

## Division of Responsibilities

### AI Handles (Items 2-5):
- ✅ **Update banner** - `announcementBar.content`
- ✅ **Update netlify redirect** - `netlify.toml`
- ✅ **Verify CLI commands** - Check files exist
- ✅ **Create hurl test** - Create new test file

### User Handles (Items 1, 6-9):
- **Create versioned docs** - `npm run docusaurus docs:version:vcluster X.Y.Z`
- **Review enterprise/pro tags** - Manual review of `<ProAdmonition>` tags
- **Partials PR** - Verify automation ran
- **Update support dates** - Edit `vcluster/deploy/upgrade/supported_versions.mdx`
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
**Files to modify:** 3 files total
**Lines to change:** ~10 locations across all files
**Time estimate:** 2-3 minutes for AI tasks

## Notes

- This skill is for **vCluster only** - Platform has separate release process
- Always remove "Stable" label from previous version when adding new one
- Keep 5-6 versions in `onlyIncludeVersions` for build performance
- Hurl tests validate redirects work correctly
- User runs build - AI does not run npm commands

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
