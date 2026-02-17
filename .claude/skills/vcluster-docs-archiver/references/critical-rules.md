# Critical Rules for vCluster Documentation Archiving

## 🚨 ABSOLUTE PROHIBITIONS 🚨

### Git Operations - FORBIDDEN
- ⛔ **NEVER EVER perform git operations**
- ⛔ NO `git commit`
- ⛔ NO `git push`
- ⛔ NO `git branch` creation
- ⛔ NO `gh pr create`
- ⛔ AI assistant is FORBIDDEN from using these commands
- ⛔ User must manually commit all changes after verification
- ⛔ Protection exists on main branch - do not attempt to bypass

**Why**: User needs to review and verify all changes before they're committed. Automated commits can introduce errors and bypass review processes.

## Never-Do Rules

### Configuration
- ⚠️ **NEVER set Platform `onlyIncludeVersions` to empty array**
  - MUST have `["X.X.X"]` with actual version
  - Empty array causes build failures

- ⚠️ **NEVER set `includeCurrentVersion: false`**
  - Breaks partial/fragment imports
  - Keep default behavior

### Caching
- ⚠️ **NEVER skip clearing cache after major fixes**
  - Stale cache causes phantom errors
  - Always run `scripts/clear_cache.sh`

### Links
- ⚠️ **NEVER use relative paths in fragments**
  - Fragments (`_fragments/*.mdx`) are imported from multiple locations
  - MUST use absolute paths starting with `/vcluster/` or `/platform/`
  - NEVER include .mdx extension in absolute paths

### Versions
- ⚠️ **NEVER use oldest vCluster version**
  - Always use LATEST (e.g., 0.30.0, not 0.25.0)
  - Platform archives should reference current/stable vCluster docs

### URL Paths
- ⚠️ **NEVER keep /next/ prefix in links**
  - Replace `/vcluster/next/` with `/vcluster/`
  - Replace `/platform/next/` with `/platform/`
  - Causes broken links in archived versions

## Always-Do Rules

### Before Starting
- ✅ **Always verify versioned docs exist**: `scripts/verify_version.sh VERSION`
- ✅ **Always check version-specific feature locations**: air-gapped, sleep mode

### During Work
- ✅ **Always clear cache after major fixes**: `scripts/clear_cache.sh`
- ✅ **Always use absolute paths WITHOUT .mdx in fragments**
- ✅ **Always use LATEST vCluster version with Platform archives**
- ✅ **Always remove /next/ prefix from ALL links early**

### After Completion
- ✅ **Always stage changes for user to commit** - NEVER commit yourself
- ✅ **Always show git status** to user after staging changes
- ✅ **Always verify Netlify deployment** before updating main branch

## Special Rules by File Type

### Fragment Files (`_fragments/*.mdx`)
- MUST use absolute paths: `/vcluster/configure/...`
- NEVER use relative paths: `../configure/...`
- NEVER include .mdx extension in absolute paths
- Reason: Imported from multiple locations at different depths

### Regular Documentation Files
- Absolute URL paths: `/vcluster/deploy/basics` (NO .mdx)
- Relative file paths: `../api/project/project.mdx` (YES .mdx)

### Configuration Files
- `docusaurus.config.js`: Never empty arrays for `onlyIncludeVersions`
- `src/theme/DocSidebar/Desktop/Content/index.js`: Empty dropdown in archive branch, populated in main

## Archive Branch vs Main Branch

### Archive Branch (Standalone)
- Contains specific versions only (e.g., Platform 4.2.0 + vCluster 0.30.0)
- Sets `onlyIncludeVersions` to specific versions
- Empty dropdown: `dropdownItemsAfter={[]}`
- **NEVER merged to main** - it's a standalone deployment
- Deploys to Netlify subdomain

### Main Branch
- Removes archived version from `onlyIncludeVersions`
- Deletes versioned folder (e.g., `platform_versioned_docs/version-4.2.0/`)
- Adds EOL link to dropdown
- User commits changes manually

## Speed & Efficiency Tips

1. **Fix fragments first** - they affect multiple pages
2. **Use scripts for bulk replacements** - faster than manual edits
3. **Clear cache after every major fix** - prevents phantom errors
4. **Work systematically** - fix one error type at a time
5. **Use absolute paths WITHOUT .mdx in fragments** - saves debugging time
6. **Grep by filename only, not full path** - paths are often wrong in error messages
7. **Use LATEST vCluster version** - don't waste time with oldest version
8. **Remove ALL /next/ prefixes early** - prevents cascading link errors
9. **Accept broken links in discontinued versions** - don't over-perfect old docs
10. **Stage all changes for user** - never attempt commits yourself

## Deployment & Merge Order

### Netlify Branch Deploy Configuration
- ⚠️ **Netlify branch deploys are MANUAL** - must configure in Netlify dashboard
- Go to: Site settings → Build & deploy → Branches and deploy contexts
- Add branch name (e.g., `vcluster-v0.25`) to "Branch deploys" list
- After configuring, push empty commit to trigger initial build:
  ```bash
  git commit --allow-empty -m "chore: trigger netlify build"
  git push origin vcluster-v0.25
  ```

### Two Repos Involved
- **vcluster-docs**: Archive branches, dropdown updates, version cleanup
- **vcluster.com**: Redirects in `/themes/loft/static/_redirects`

### Merge Order is CRITICAL
1. **FIRST**: Merge redirects PR (vcluster.com) - ensures URLs work
2. **THEN**: Merge dropdown PR (vcluster-docs) - exposes the links

If you merge dropdown first, users clicking EOL links will hit 404s until redirects are live.

### Verification Before Merge
- ✅ Archive branch deploys work: `curl -s -o /dev/null -w "%{http_code}" "https://vcluster-v0-XX--vcluster-docs-site.netlify.app/docs/vcluster/"`
- ✅ Both PRs approved and CI passing
- ✅ Redirects PR merged FIRST

## When Things Go Wrong

If you violate these rules:
- User will correct you (sometimes forcefully)
- Protection may block your actions (good!)
- Build will fail with cryptic errors
- You'll waste time fixing preventable issues

**Follow these rules religiously. They're based on hard-won experience.**
