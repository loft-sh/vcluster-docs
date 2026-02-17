# vCluster EOL Documentation Branch Checklist

Quick reference checklist for archiving EOL documentation versions.

## Overview
This checklist guides the process of preparing End-of-Life (EOL) documentation branches for vCluster versions. Each EOL version gets its own branch and standalone Netlify deployment.

## Prerequisites
- Access to vcluster-docs and vcluster.com repositories
- Netlify deployment permissions
- Git branch creation permissions

## Checklist

### 1. Create New Branch
- [ ] Create branch named `vcluster-v0.XX` (e.g., `vcluster-v0.24`)
- [ ] Verify versioned docs folder exists: `vcluster_versioned_docs/version-0.XX.0/`

### 2. Configure Docusaurus Build
**File:** `docusaurus.config.js`
- [ ] Set vCluster `lastVersion` to the EOL version (e.g., `"0.24.0"`)
- [ ] Set vCluster `onlyIncludeVersions` to only this version: `["0.24.0"]`
- [ ] Set platform plugin `lastVersion` to latest platform version (e.g., `"4.3.0"`)
- [ ] Add platform plugin `onlyIncludeVersions: ["4.3.0"]`

### 3. Clean Version Dropdowns
**File:** `src/theme/DocSidebar/Desktop/Content/index.js`
- [ ] Set `dropdownItemsAfter={[]}` for both vCluster and platform selectors
- [ ] This removes all external version links from the dropdown

### 4. Fix Broken Links
Common patterns to fix:
- [ ] Replace `@site` imports with relative paths in versioned docs
- [ ] Fix fragment imports (must use absolute paths when imported across directories)
- [ ] Update platform links pointing to non-existent paths
- [ ] Remove or simplify external documentation references
- [ ] Clear cache: `rm -rf .docusaurus build node_modules/.cache`
- [ ] Run build to verify: `npm run build`

### 5. Deploy to Netlify
- [ ] Add branch to Netlify deployments
- [ ] Branch URL format: `vcluster-v0-XX--vcluster-docs-site.netlify.app`
- [ ] Verify deployment succeeds

### 6. Add Redirects to vcluster.com
**File:** `/themes/loft/static/_redirects` in vcluster.com repo
- [ ] Add redirect entries for the new EOL version:
```
# v0.XX Docs Site (EOL version with dedicated standalone site)
/docs/v0.XX         https://vcluster-v0-XX--vcluster-docs-site.netlify.app/docs/vcluster/introduction/what-are-virtual-clusters/   302!
/docs/v0.XX/*       https://vcluster-v0-XX--vcluster-docs-site.netlify.app/docs/vcluster/:splat   302!
```

### 7. Update Main Branch Documentation Menu
**In main/master branch of vcluster-docs:**

**File:** `docusaurus.config.js`
- [ ] Remove the version from `onlyIncludeVersions` array
- [ ] Remove the version configuration object from `versions`

**File:** `src/theme/DocSidebar/Desktop/Content/index.js`
- [ ] Add the EOL version to dropdown menu:
```javascript
{
  to: "https://vcluster.com/docs/v0.XX",
  label: "v0.XX (EOL) ↗"
}
```

## Verification
- [ ] EOL branch builds successfully with only its version
- [ ] Netlify deployment is accessible
- [ ] Redirects from vcluster.com work correctly
- [ ] Version appears in main docs dropdown and redirects properly

## Notes
- Each EOL branch is self-contained with only its version documentation
- Platform documentation is always set to the latest stable version (currently 4.3.0)
- All cross-version references should be removed or simplified
- The main branch aggregates all versions through the dropdown menu
