---
name: docusaurus-upgrader
description: Upgrades Docusaurus to latest version in vCluster documentation. Use when upgrading Docusaurus packages from older to newer versions. Handles package updates, compatibility fixes, testing, and rollback procedures.
---

# Docusaurus Upgrader

Upgrades Docusaurus in vCluster documentation repository with safe workflows, testing procedures, and rollback capability.

## When to Use

- User asks to upgrade Docusaurus
- User mentions updating Docusaurus packages or dependencies
- User wants to update documentation dependencies
- Working in `/home/decoder/loft/vcluster-docs` with upgrade tasks
- User encounters issues after a Docusaurus upgrade

## Quick Workflow

### Step 1: Pre-Upgrade Checks

```bash
# Check current versions
scripts/check_versions.sh
cat package.json | grep "@docusaurus"
```

**Note current versions for rollback if needed.**

### Step 2: Upgrade Packages

```bash
# Upgrade to specific version (e.g., 3.7.0)
npm install @docusaurus/core@3.7.0 @docusaurus/preset-classic@3.7.0 \
            @docusaurus/plugin-content-docs@3.7.0 \
            @docusaurus/plugin-content-blog@3.7.0 \
            @docusaurus/theme-classic@3.7.0

# Or to latest
npm update @docusaurus/core @docusaurus/preset-classic
```

**Critical**: Upgrade ALL Docusaurus packages to same version.

See `references/upgrade-guide.md` for complete package list.

### Step 3: Clean Install

```bash
# Essential step - prevents dependency conflicts
npm run clear
rm -rf node_modules package-lock.json
npm install
```

**Never skip this step!**

### Step 4: Fix Breaking Changes

Check for breaking changes:

```bash
# Review official changelog
# https://docusaurus.io/changelog

# Test dev server
npm start
```

**Common fixes needed**:
- CSS class name changes
- Theme component API changes
- MDX 3 compatibility updates
- Config file deprecations

See `references/common-issues.md` for known compatibility fixes.

### Step 5: Test Thoroughly

**Development test**:
```bash
npm start
# Verify: pages load, navigation works, search works
```

**Production build test**:
```bash
scripts/test_build.sh
# Or manually:
npm run build && npm run serve
```

**Checklist**:
- [ ] Build completes without errors
- [ ] All pages accessible
- [ ] No broken links
- [ ] Assets load properly
- [ ] Search works
- [ ] Version dropdowns work

See `references/testing-checklist.md` for comprehensive checks.

### Step 6: Rollback (If Issues)

If upgrade causes issues:

```bash
# Automated
scripts/rollback.sh

# Manual
git checkout package.json docusaurus.config.js src/theme/
rm -rf node_modules package-lock.json
npm install
```

## Critical Rules

### Never-Do
- ⚠️ **NEVER upgrade without testing**
- ⚠️ **NEVER skip clean install** - causes dependency conflicts
- ⚠️ **NEVER upgrade only some packages** - all Docusaurus packages together
- ⚠️ **NEVER commit without verifying build succeeds**

### Always-Do
- ✅ **Always check current versions** before upgrading
- ✅ **Always clean install**: `npm run clear && rm -rf node_modules package-lock.json && npm install`
- ✅ **Always upgrade all Docusaurus packages to same version**
- ✅ **Always test dev and production builds**
- ✅ **Always keep rollback plan ready**

## Common Issues

| Issue | Solution |
|-------|----------|
| CSS styling broken | Check for class name changes |
| Components not working | Check theme API changes |
| MDX rendering issues | Check MDX 3 compatibility |
| Search broken | Verify Algolia config |
| Build fails | Check deprecated API usage |
| Dev server won't start | Clear cache, clean install |

See `references/common-issues.md` for detailed troubleshooting.

## Success Tips

1. **Read release notes** - Check Docusaurus changelog for breaking changes
2. **Upgrade incrementally** - Don't skip major versions
3. **Test thoroughly** - Manual testing catches issues
4. **Keep dependencies aligned** - Update related packages together
5. **Have rollback ready** - Clean git state before upgrading

## Resources

### scripts/
- `check_versions.sh` - Show current vs available versions
- `clean_install.sh` - Clean and reinstall dependencies
- `test_build.sh` - Production build and serve tests
- `rollback.sh` - Revert to previous version

### references/
- `upgrade-guide.md` - Full upgrade notes and package list
- `common-issues.md` - Compatibility issues and fixes
- `testing-checklist.md` - Comprehensive testing procedures
