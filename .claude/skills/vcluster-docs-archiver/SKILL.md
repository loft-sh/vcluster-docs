---
name: vcluster-docs-archiver
description: Archive End-of-Life vCluster documentation versions. Use this skill when creating EOL documentation branches for vCluster or Platform versions. Handles branch creation, Docusaurus configuration, link fixing, Netlify deployment, and main branch updates.
---

# vCluster Documentation Archiver

## Overview

Archive End-of-Life (EOL) vCluster or Platform documentation versions to standalone Netlify deployments. Each EOL version gets its own branch that never merges to main.

## When to Use

- User asks to archive a vCluster or Platform version
- User mentions EOL documentation, branch archiving, or version archiving
- Working in `/home/decoder/loft/vcluster-docs` with archiving tasks
- User encounters broken links during version archiving

## Quick Start

### Step 1: Setup Archive Branch
```bash
# Create branch (use correct naming: vcluster-v0.22 or platform-v4.2)
git checkout -b vcluster-v0.22

# Verify version exists
scripts/verify_version.sh 0.22.0
```

### Step 2: Configure Docusaurus
Edit `docusaurus.config.js`:
- Set `lastVersion: "0.22.0"` (actual version)
- Set `onlyIncludeVersions: ["0.22.0"]` (only this version)
- Update main docs label to match version

Edit `src/theme/DocSidebar/Desktop/Content/index.js`:
- Set `dropdownItemsAfter={[]}` (empty dropdown)

See `references/docusaurus-config.md` for detailed configuration.

### Step 3: Fix Broken Links
```bash
# Clear cache first
scripts/clear_cache.sh

# Auto-fix common patterns
scripts/fix_mdx_extensions.sh vcluster_versioned_docs/version-0.22.0
scripts/fix_site_imports.sh vcluster_versioned_docs/version-0.22.0

# Build and fix remaining errors
npm run build
```

**Efficient debugging method**: See `references/link-resolution-guide.md`

### Step 4: Configure Netlify & Deploy
⚠️ **Netlify branch deploys require MANUAL configuration**

1. User configures in Netlify dashboard:
   - Site settings → Build & deploy → Branches and deploy contexts
   - Add branch name (e.g., `vcluster-v0.22`) to "Branch deploys"

2. After configuration, trigger build:
   ```bash
   git commit --allow-empty -m "chore: trigger netlify build"
   git push origin vcluster-v0.22
   ```

3. Verify deployment:
   ```bash
   curl -s -o /dev/null -w "%{http_code}" "https://vcluster-v0-22--vcluster-docs-site.netlify.app/docs/vcluster/"
   ```

### Step 5: Update Main Branch
**⚠️ IMPORTANT: Stage changes, do NOT commit (user commits manually)**

```bash
git checkout main

# Update dropdown in src/theme/DocSidebar/Desktop/Content/index.js
# Remove version from docusaurus.config.js onlyIncludeVersions
# Delete versioned folder: rm -rf vcluster_versioned_docs/version-0.22.0

git status  # Show staged changes to user
```

### Step 6: Add Redirects (REQUIRED)
In `/home/decoder/loft/vcluster.com/themes/loft/static/_redirects`:
```
# v0.22 Docs Site (EOL version with dedicated standalone site)
/docs/v0.22         https://vcluster-v0-22--vcluster-docs-site.netlify.app/docs/vcluster/introduction/what-are-virtual-clusters/   302!
/docs/v0.22/*       https://vcluster-v0-22--vcluster-docs-site.netlify.app/docs/vcluster/:splat   302!
```

⚠️ **MERGE ORDER IS CRITICAL:**
1. Merge redirects PR (vcluster.com) FIRST
2. Then merge dropdown PR (vcluster-docs)

If dropdown merges first, users clicking EOL links will hit 404s.

**User must commit vcluster.com changes**

## Critical Rules

🚨 **NEVER perform git operations** - NO commits, NO PRs, NO branches, NO pushes
- Platform `onlyIncludeVersions` MUST NOT be empty - use `["X.X.X"]`
- NEVER set `includeCurrentVersion: false` - breaks partials
- Use LATEST vCluster version with Platform archives (0.30.0, not 0.25.0)
- Clear cache after major fixes: `scripts/clear_cache.sh`

See `references/critical-rules.md` for complete list.

## Resources

### scripts/
- `verify_version.sh` - Check if versioned docs exist
- `fix_mdx_extensions.sh` - Remove .mdx from links
- `fix_site_imports.sh` - Replace @site imports
- `clear_cache.sh` - Clear Docusaurus caches
- `find_feature_location.sh` - Find version-specific features

### references/
- `critical-rules.md` - Complete never-do and always-do rules
- `link-resolution-guide.md` - Link types and .mdx extension rules
- `platform-archiving.md` - Platform-specific workflow
- `platform-4.2-example.md` - Real-world example with mistakes
- `complete-checklist.md` - Full step-by-step checklist
- `common-issues.md` - Troubleshooting guide

### Step 7: Announce (Optional)
Slack announcement template:
```
*vCluster docs: EOL version archiving*

We archived vCluster vX.XX documentation to standalone Netlify branch deploys.

*Why:* The main docs build includes all active versions. As we add new versions, the build size grows and eventually exceeds Netlify's memory limits. Archiving EOL versions to separate branches keeps the main build healthy.

*What changed:*
- vX.XX docs removed from main branch
- Version now lives on its own branch (`vcluster-vX.XX`)
- Added to EOL dropdown in version selector
- Redirects ensure `vcluster.com/docs/vX.XX` still works

*Impact:* None. Users accessing EOL docs via the dropdown or direct URLs will be redirected to the archived deployments. No action required.
```

## Quick Reference

| Issue | Solution |
|-------|----------|
| Broken links | `references/link-resolution-guide.md` |
| Platform version | `references/platform-archiving.md` |
| Config errors | `references/docusaurus-config.md` |
| Real example | `references/platform-4.2-example.md` |
| Netlify setup | Configure in Netlify dashboard, then empty commit |
| Merge order | Redirects (vcluster.com) FIRST, then dropdown (vcluster-docs) |

## Final Checklist (Copy-Paste for User)

When archiving is complete, guide the user with these steps:

```
Archive Complete! Final steps:

□ 1. Configure Netlify branch deploys (manual in dashboard)
   - Site settings → Build & deploy → Branches and deploy contexts
   - Add: vcluster-vX.XX (or platform-vX.X)

□ 2. Trigger builds (empty commits if needed)
   - git checkout vcluster-vX.XX && git commit --allow-empty -m "chore: trigger netlify build" && git push

□ 3. Verify deployments work
   - https://vcluster-v0-XX--vcluster-docs-site.netlify.app/docs/vcluster/

□ 4. MERGE ORDER (critical!):
   a. FIRST: Merge redirects PR (vcluster.com)
   b. THEN: Merge dropdown PR (vcluster-docs)

□ 5. Post to Slack (optional)
   - Use template from Step 7

□ 6. Verify production
   - Check vcluster.com/docs/vX.XX redirects correctly
   - Check dropdown shows new EOL version
```
