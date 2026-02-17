# Common Issues & Solutions

This guide covers common problems encountered during vCluster documentation archiving and their solutions.

## Build Errors

### "Docusaurus found broken links!"

**Problem**: Build fails with broken link errors.

**Solution**: Use the efficient debugging method:
1. CD into the versioned folder matching the path structure
2. Grep for the referenced file by name only (not full path!)
3. Fix the relative path in the file that shows up

**Example**:
```bash
# Error message shows:
# Broken link on source page path = /docs/vcluster/configure/vcluster-yaml/sync/:
#    -> linking to ../control-plane/other/advanced/virtual-scheduler

cd vcluster_versioned_docs/version-0.22.0/configure/vcluster-yaml/sync/
grep -r "virtual-scheduler" . --include="*.mdx"
# Fix the relative path in the file that appears
```

This is MUCH faster than calculating relative paths manually!

### Links Still Broken After Fixing

**Problem**: Fixed broken links but build still fails with same errors.

**Solution**: Clear ALL caches - stale cache causes phantom errors!

```bash
rm -rf .docusaurus build node_modules/.cache
npm run build
```

**Pro tip**: Create an alias:
```bash
alias rebuild="rm -rf .docusaurus build node_modules/.cache && npm run build"
```

### Fragment Imported in Multiple Places Has Broken Links

**Problem**: A fragment file (`_fragments/*.mdx`) has links that break in some locations but not others.

**Solution**: Fragments MUST use absolute paths!

**Why**: Fragment files are imported by multiple docs at different directory depths. Relative paths will work in some places and fail in others.

**Fix**:
- Use absolute paths starting with `/vcluster/` or `/platform/`
- Example: `/vcluster/configure/vcluster-yaml/sync/to-host/core/pods`
- **Never** use relative paths (`../../../`) in fragments
- **Never** use `@site` imports in fragments

**Common fragments that need absolute paths**:
- `sync-to-host-resources.mdx`
- `sync-from-host-resources.mdx`
- `multi-namespace-mode-explanation.mdx`

## Import/Path Errors

### @site Imports Failing

**Problem**: Imports using `@site/` prefix fail in versioned docs.

**Solution**: Replace `@site` imports with relative paths from the importing file's location.

**Why**: `@site` imports work in the main docs but can fail in versioned docs due to how Docusaurus resolves paths.

**How to fix**:
1. Find all `@site` imports:
   ```bash
   grep -r "@site" vcluster_versioned_docs/version-0.22.0/
   ```

2. Replace with relative paths:
   ```
   @site/vcluster/_fragments/example.mdx  →  ../../../_fragments/example.mdx
   @site/docs/_partials/example.mdx       →  ../../_partials/example.mdx
   ```

3. The number of `../` depends on the directory depth of the importing file

## Configuration Errors

### Platform Plugin Validation Error

**Problem**: Build fails with validation error for platform plugin configuration.

**Solution**: Platform plugin `onlyIncludeVersions` cannot be empty - must have `["X.X.X"]`

**Correct configuration**:
```javascript
{
  id: 'platform',
  lastVersion: "4.3.0",
  onlyIncludeVersions: ["4.3.0"],  // MUST NOT BE EMPTY
  // ... rest of config
}
```

**Wrong configuration**:
```javascript
{
  id: 'platform',
  onlyIncludeVersions: [],  // ❌ THIS WILL FAIL
}
```

### includeCurrentVersion: false Breaks Partial Imports

**Problem**: Setting `includeCurrentVersion: false` causes partial/fragment imports to fail.

**Solution**: **DO NOT** set `includeCurrentVersion: false` - keep it at default `true`.

**Why**: Docusaurus needs access to current version files to resolve imports, even when building only versioned docs.

## Link Format Errors

### Build Warnings About Markdown Links

**Problem**: Build succeeds but shows warnings about markdown links.

**Solution**: Check fragments and partials - they're likely using the wrong path type.

**Common causes**:
- Fragments using relative paths instead of absolute paths
- Links including `.mdx` extensions (should be removed)
- Links using `/docs/` prefix (should be `/vcluster/` or `/platform/`)

### Broken Link Appears on "All Pages"

**Problem**: Build reports a broken link affecting all pages, not just one file.

**Solution**: Check navbar configuration in `docusaurus.config.js` - likely a navbar link pointing to a non-existent route.

**Example**:
```javascript
// Check navbar items in docusaurus.config.js
navbar: {
  items: [
    {
      to: '/some-path',  // ← This path might not exist
      label: 'Link',
    }
  ]
}
```

## Build Warnings

### Vale Warnings (e.g., "Disabled" vs "disabled")

**Problem**: Build shows Vale linting warnings.

**Solution**: These are non-blocking but good to fix for consistency.

**Common Vale warnings**:
- Capitalization: "Disabled" vs "disabled"
- Contractions: "don't" vs "do not"
- Passive voice
- Long sentences

**Fix**: Follow the suggestions or disable Vale for specific content using:
```markdown
<!-- vale off -->
Content that ignores Vale rules
<!-- vale on -->
```

## Deployment Issues

### Netlify Deployment Fails

**Problem**: Netlify deployment fails even though local build succeeds.

**Possible causes**:
1. **Node version mismatch**: Check `package.json` or `.nvmrc` for required Node version
2. **Missing environment variables**: Check if any env vars are needed
3. **Cache issues**: Clear Netlify cache and rebuild

**Solution**: Check Netlify build logs for specific error and address it.

### Netlify Deployment URL Not Working

**Problem**: Deployment succeeds but URL returns 404 or errors.

**Solution**: Verify key paths work:
```bash
# Test these URLs:
https://vcluster-v0-22--vcluster-docs-site.netlify.app/vcluster
https://vcluster-v0-22--vcluster-docs-site.netlify.app/docs/vcluster
https://vcluster-v0-22--vcluster-docs-site.netlify.app/platform
```

If paths don't work, check:
- Docusaurus base URL configuration
- Netlify deploy settings
- Build output directory (`build/`)

## Version-Specific Issues

### No Air-Gapped Documentation for Version

**Problem**: Platform docs reference air-gapped vCluster docs, but they don't exist in this version.

**Solution**:
1. Check if docs exist: `find vcluster_versioned_docs/version-0.22.0 -name "*air*"`
2. If not found, remove or comment out the links
3. Or update links to point to main docs (if appropriate)

### Sleep Mode Path Changed Between Versions

**Problem**: Links to sleep mode documentation are broken.

**Solution**: Find the correct path for this version:
```bash
find vcluster_versioned_docs/version-0.22.0 -name "*sleep*" -type f
```

**Common locations by version**:
- **Newer versions (0.22.0+)**: `/vcluster/manage/sleep-wakeup`
- **Older versions (0.20.0-0.21.0)**: `/vcluster/configure/vcluster-yaml/sleep-mode`

Update all links to use the correct path for the version being archived.

## Prevention Tips

### How to Avoid These Issues

1. **Fix fragments first** - they affect multiple pages
2. **Use scripts for bulk replacements** - faster and more reliable than manual edits
3. **Clear cache after every major fix** - prevents phantom errors
4. **Work systematically** - fix one error type at a time
5. **Use absolute paths in fragments** - saves debugging time later
6. **Grep by filename only, not full path** - error messages often have wrong paths
7. **Verify versioned docs exist** before starting the process
8. **Check version-specific feature locations** early (air-gapped, sleep mode, etc.)
