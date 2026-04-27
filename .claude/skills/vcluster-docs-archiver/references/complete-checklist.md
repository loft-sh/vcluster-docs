# vCluster Branch Archive Preparation Checklist

This comprehensive checklist must be followed when creating a new branch archive for EOL documentation versions. It consolidates all best practices and lessons learned from previous branch preparations.

## 0. Pre-Setup Verification

- [ ] Identify the version to archive (e.g., vCluster 0.22.0)
- [ ] Create new branch from main: `git checkout -b vcluster-v0.22` (replace with actual version)
- [ ] Verify versioned docs exist: `ls vcluster_versioned_docs/ | grep version-0.22`
- [ ] Note which vCluster features exist in this version:
  - [ ] Check for air-gapped docs: `find vcluster_versioned_docs/version-0.22.0 -name "*air*"`
  - [ ] Check sleep mode location: `find vcluster_versioned_docs/version-0.22.0 -name "*sleep*"`
  - [ ] Document the correct paths for commonly linked features

## Quick Reference for Common Patterns

### Critical Rules to Remember:
- **Fragments (`_fragments/*.mdx`) MUST use absolute paths** (they're imported from multiple locations)
- **Never include .mdx extensions in links** - Docusaurus resolves them automatically
- **Always clear cache after fixes**: `rm -rf .docusaurus build node_modules/.cache`
- **Platform plugin MUST have `onlyIncludeVersions: ["X.X.X"]`** - never empty array!

### Common Path Patterns:
- Main index broken link: `/docs/vcluster/deploy/control-plane/container/basics` → `/vcluster/deploy/basics`
- Platform template links: `/platform/next/` → `/platform/`
- All `@site` imports → relative paths from file location

## 1. Configure Docusaurus Build Settings

### Update `docusaurus.config.js`

#### For vCluster Plugin:
- [ ] Set `lastVersion: "0.22.0"` (use the actual version being archived)
- [ ] Set `onlyIncludeVersions: ["0.22.0"]` (only the version for this branch)
- [ ] Keep all version definitions but Docusaurus will only build what's in `onlyIncludeVersions`
- [ ] **DO NOT** set `includeCurrentVersion: false` - this breaks partial imports!

#### For Platform Plugin:
- [ ] Set `lastVersion` to latest platform version (e.g., `"4.3.0"`)
- [ ] Set `onlyIncludeVersions: ["4.3.0"]`
- [ ] **CRITICAL**: Platform plugin MUST have non-empty `onlyIncludeVersions` array

#### For Main Docs (if present):
- [ ] Update the label in the main docs preset to match the version:
  ```javascript
  versions: {
    current: {
      label: "v0.22",  // Update this to match your version
      banner: "none",
      badge: false,
    },
  },
  ```

## 2. Fix Broken Links - The Fast Method

### 🚨 SUPER IMPORTANT: Efficient Broken Link Debugging Method 🚨

When you see a broken link error like:
```
Broken link on source page path = /docs/vcluster/configure/vcluster-yaml/sync/:
   -> linking to ../control-plane/other/advanced/virtual-scheduler
```

**DO THIS:**
1. **CD into the versioned folder** matching the path structure
   ```bash
   cd vcluster_versioned_docs/version-0.22.0/configure/vcluster-yaml/sync/
   ```
2. **Grep for the referenced file** by name only (not full path!) to find where it's being used
   ```bash
   grep -r "virtual-scheduler" . --include="*.mdx"
   ```
3. **Fix the relative path** in the file that shows up

This is MUCH faster than trying to calculate relative paths manually!

### Fragment Files Need Special Treatment

**Fragments in `_fragments/` folders MUST use absolute paths!**
- These files are imported by multiple docs at different directory depths
- Always use paths starting with `/vcluster/` or `/platform/`
- Example: `/vcluster/configure/vcluster-yaml/sync/to-host/core/pods`

Common fragments that need absolute paths:
- sync-to-host-resources.mdx
- sync-from-host-resources.mdx
- multi-namespace-mode-explanation.mdx

### Automated Quick Fixes

#### Remove ALL .mdx extensions at once:
```bash
# In versioned docs folder
find vcluster_versioned_docs/version-0.22.0 -name "*.mdx" -exec sed -i 's/\.mdx)/)/g' {} \;
```

#### Fix @site imports:
```bash
# Find them
grep -r "@site" vcluster_versioned_docs/version-0.22.0/

# Replace with relative paths from each file's location
# @site/vcluster/_fragments/ → ../../../_fragments/
```

#### Find all broken link patterns at once:
```bash
# Run these in parallel to identify all issues upfront
grep -r "/platform/next/" platform_versioned_docs/version-* | head -20
grep -r "/vcluster/configure/vcluster-yaml/sleep-mode" platform_versioned_docs/version-*
grep -r "\.mdx#" platform_versioned_docs/version-* | head -20
grep -r "/docs/vcluster/" docs/
grep -r "/docs/platform" docs/
```

### Version-Specific Link Locations

#### For air-gapped links:
```bash
# Check if air-gapped docs exist
find vcluster_versioned_docs/version-0.22.0 -name "*air*" -type f
# If not found, you'll need to remove or comment out these links
```

#### For sleep mode:
```bash
# Check for sleep mode docs location
find vcluster_versioned_docs/version-0.22.0 -name "*sleep*" -type f
# Common locations:
# - /vcluster/manage/sleep-wakeup (newer versions)
# - /vcluster/configure/vcluster-yaml/sleep-mode (older versions)
```

## 3. Clean Build Artifacts

- [ ] Clear everything: `rm -rf .docusaurus build node_modules/.cache`
- [ ] This is CRITICAL - stale cache causes phantom errors!

Alias for convenience:
```bash
alias rebuild="rm -rf .docusaurus build node_modules/.cache && npm run build"
```

## 4. Test Build Locally

- [ ] Run build: `npm run build`
- [ ] If broken links appear, go back to step 2
- [ ] Keep fixing until build succeeds
- [ ] Pay attention to warnings (like Vale) but focus on errors first

## 5. Clean Up Version Dropdowns

### Update `src/theme/DocSidebar/Desktop/Content/index.js`
- [ ] Remove hardcoded legacy versions from `dropdownItemsAfter`
- [ ] Set to empty array: `dropdownItemsAfter={[]}`

## 6. Configure Netlify Deployment

- [ ] Ensure branch deploys are enabled in Netlify
- [ ] Branch will auto-deploy to: `vcluster-v0-22--vcluster-docs-site.netlify.app`
- [ ] Verify deployment succeeds

## 7. Post-Build Verification

- [ ] Test key documentation paths manually:
  - [ ] `/vcluster/` loads
  - [ ] `/platform/` loads (if applicable)
  - [ ] Version dropdown shows correct version
  - [ ] No 404s on main navigation items
- [ ] Check build output size: `du -sh build/`
- [ ] Verify no lingering `/next/` references: `grep -r "/next/" build/ | wc -l` (should be 0 or very low)

## 8. Update Main Branch (After Branch is Deployed)

On the main branch:
- [ ] Add dropdown item in `src/theme/DocSidebar/Desktop/Content/index.js`:
  ```javascript
  dropdownItemsAfter={[
    {
      to: "https://vcluster-v0-22--vcluster-docs-site.netlify.app/vcluster",
      label: "v0.22 (EOL)"
    }
  ]}
  ```

## Common Issues & Quick Solutions

### "Docusaurus found broken links!"
→ Use the efficient method in Step 2. CD to the path, grep for the file name, fix it.

### Links still broken after fixing
→ Clear cache! `rm -rf .docusaurus build node_modules/.cache`

### Fragment imported in multiple places has broken links
→ Fragment MUST use absolute paths starting with `/vcluster/`

### @site imports failing
→ Replace with relative paths from the importing file's location

### Platform plugin validation error
→ Platform plugin `onlyIncludeVersions` cannot be empty - must have ["X.X.X"]

### Build succeeds but with warnings about markdown links
→ Check the WARNING messages - they often indicate broken relative paths in fragments or partials

### Broken link appears on "all pages"
→ Check navbar configuration in docusaurus.config.js - likely a navbar link pointing to non-existent route

### Vale warnings (e.g., "Disabled" vs "disabled")
→ These are non-blocking but good to fix for consistency

## Version-Specific Known Issues

### vCluster 0.20.0
- No air-gapped documentation
- Sleep mode at different location
- Platform 4.3.0 typically paired

### vCluster 0.21.0
- No air-gapped documentation
- Sleep mode moved to `/vcluster/manage/sleep-wakeup`
- Platform 4.3.0 typically paired
- Vale warning about "Disabled" vs "disabled"

### vCluster 0.22.0+
- Check for new documentation structure
- May have different integration paths
- Air-gapped docs may or may not exist

## Tips for Speed

1. **Fix fragments first** - they affect multiple pages
2. **Use sed for bulk replacements** - faster than manual edits
3. **Clear cache after every major fix** - prevents phantom errors
4. **Work systematically** - fix one error type at a time
5. **Use absolute paths in fragments** - saves debugging time
6. **Grep by filename only, not full path** - paths are often wrong in error messages

## Final Verification Checklist

- [ ] Build completes without errors
- [ ] No broken links in build output
- [ ] All tests pass
- [ ] Netlify deployment successful
- [ ] Branch URL is accessible
- [ ] Version dropdown shows correct version
- [ ] Navigation works correctly
- [ ] Search functionality works (if enabled)
