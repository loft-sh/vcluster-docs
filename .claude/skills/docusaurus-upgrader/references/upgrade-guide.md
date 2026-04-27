# Docusaurus Upgrade Guide

This guide documents the process and changes made when upgrading Docusaurus.

## Package Updates

### Docusaurus Core Packages

All Docusaurus packages should be upgraded together to the same version:

```json
{
  "@docusaurus/core": "3.7.0",
  "@docusaurus/preset-classic": "3.7.0",
  "@docusaurus/theme-classic": "3.7.0",
  "@docusaurus/theme-mermaid": "3.7.0",
  "@docusaurus/module-type-aliases": "3.7.0",
  "@docusaurus/types": "3.7.0"
}
```

**Important**: Never upgrade only some Docusaurus packages. They must all be on the same version to avoid compatibility issues.

### Related Dependencies

These packages should also be updated when upgrading Docusaurus:

```json
{
  "@mdx-js/react": "3.1.0",
  "@saucelabs/theme-github-codeblock": "0.3.0",
  "clsx": "2.1.1",
  "docusaurus-plugin-sass": "0.2.6",
  "prism-react-renderer": "2.4.1",
  "redocusaurus": "2.2.3",
  "sass": "1.87.0"
}
```

### Version Compatibility

- **Docusaurus 3.7.0** works with:
  - MDX 3.x
  - React 18.x
  - Node 18.x or higher

- **Docusaurus 3.3.2** (previous version) works with:
  - MDX 3.x
  - React 18.x
  - Node 18.x or higher

## Code Changes

### Change 1: ES Module Imports

**File**: `docusaurus.config.js`

**Issue**: Some modules may need to be imported as ES modules instead of CommonJS requires.

**Before**:
```javascript
const resolveGlob = require('resolve-glob');
```

**After**:
```javascript
import resolveGlob from 'resolve-glob';
```

**Why**: Newer versions of Docusaurus prefer ES modules for better compatibility.

### Change 2: Remove Deprecated Imports

**File**: `src/theme/DocSidebar/Desktop/Content/index.js`

**Issue**: `useHistory` from `@docusaurus/router` may be deprecated.

**Before**:
```javascript
import {useHistory} from '@docusaurus/router';

// ... later in code
const history = useHistory();
```

**After**:
```javascript
// Remove if not used
// Or replace with alternative navigation method
```

**Why**: Docusaurus is moving away from certain router APIs. Check the component to see if `useHistory` is actually used.

## Upgrade Process

### Step 1: Pre-Upgrade Preparation

1. **Ensure clean git state**:
   ```bash
   git status
   # Should show "nothing to commit, working tree clean"
   ```

2. **Note current versions**:
   ```bash
   grep "@docusaurus/core" package.json
   # Note the version for rollback if needed
   ```

3. **Create a backup branch** (optional but recommended):
   ```bash
   git checkout -b backup/pre-docusaurus-upgrade
   git push origin backup/pre-docusaurus-upgrade
   git checkout main
   ```

### Step 2: Update package.json

**Option A: Manual edit**

Edit `package.json` and update version numbers for all Docusaurus packages.

**Option B: npm install**

```bash
npm install @docusaurus/core@3.7.0 \
  @docusaurus/preset-classic@3.7.0 \
  @docusaurus/theme-classic@3.7.0 \
  @docusaurus/theme-mermaid@3.7.0 \
  @docusaurus/module-type-aliases@3.7.0 \
  @docusaurus/types@3.7.0
```

### Step 3: Update Related Dependencies

```bash
npm install @mdx-js/react@latest \
  @saucelabs/theme-github-codeblock@latest \
  clsx@latest \
  docusaurus-plugin-sass@latest \
  prism-react-renderer@latest \
  redocusaurus@latest \
  sass@latest
```

Or update manually in `package.json`.

### Step 4: Apply Code Changes

Apply any necessary code changes documented in the "Code Changes" section above.

### Step 5: Clean Install

```bash
npm run clear
rm -rf node_modules package-lock.json
npm install
```

### Step 6: Test Development Server

```bash
npm start
```

Check:
- Site loads without errors
- Navigation works
- Custom components render
- Console has no errors

### Step 7: Test Production Build

```bash
npm run build
npm run serve
```

Check:
- Build completes successfully
- Site serves correctly
- All pages accessible
- No broken links

### Step 8: Commit Changes

```bash
git add package.json package-lock.json docusaurus.config.js
git commit -m "chore: upgrade Docusaurus to 3.7.0

- Updated all @docusaurus packages to 3.7.0
- Updated related dependencies
- Fixed ES module imports in docusaurus.config.js
- Removed deprecated useHistory import

Tested:
- Development server works
- Production build succeeds
- All functionality verified"
```

## Rollback Procedure

If the upgrade causes issues:

### Quick Rollback

```bash
git checkout package.json
git checkout docusaurus.config.js
git checkout src/theme/DocSidebar/Desktop/Content/index.js
rm -rf node_modules package-lock.json
npm install
npm start
```

### Full Rollback

```bash
# Reset to previous commit
git reset --hard HEAD~1

# Or checkout backup branch
git checkout backup/pre-docusaurus-upgrade

# Clean install
rm -rf node_modules package-lock.json
npm install
```

## Breaking Changes by Version

### Docusaurus 3.7.0

- No major breaking changes from 3.3.2
- Improved MDX support
- Better TypeScript support
- Performance improvements

### Docusaurus 3.0 (from 2.x)

Major breaking changes (if upgrading from 2.x):
- MDX 3 required
- React 18 required
- Node 18+ required
- Some theme APIs changed
- swizzle command changes

See [Docusaurus v3 migration guide](https://docusaurus.io/docs/migration/v3) for details.

## Additional Resources

- [Docusaurus Changelog](https://github.com/facebook/docusaurus/blob/main/CHANGELOG.md)
- [Docusaurus v3 Migration Guide](https://docusaurus.io/docs/migration/v3)
- [Docusaurus Documentation](https://docusaurus.io/docs)
