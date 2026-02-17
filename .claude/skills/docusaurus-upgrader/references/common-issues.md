# Common Issues and Solutions

This guide covers common problems encountered during Docusaurus upgrades and their solutions.

## Build Errors

### Issue: CSS Styling Broken

**Symptoms**: Site renders but CSS classes don't apply correctly, layout looks broken.

**Cause**: Docusaurus may have changed CSS class names between versions.

**Solution**:
1. Check browser console for missing CSS classes
2. Inspect elements to see what classes are applied
3. Search for changed class names in [Docusaurus changelog](https://github.com/facebook/docusaurus/blob/main/CHANGELOG.md)
4. Update custom CSS if you override Docusaurus classes

**Example**:
```css
/* May need to update class names */
.theme-doc-sidebar-container { }  /* Check if this changed */
```

### Issue: Custom Components Not Working

**Symptoms**: Custom React components in MDX files don't render or throw errors.

**Cause**: API changes in Docusaurus theme components.

**Solution**:
1. Check console for specific error messages
2. Review component imports
3. Check if swizzled components need updating
4. Refer to [Docusaurus component API docs](https://docusaurus.io/docs/api/themes/configuration)

**Common fixes**:
- Update `@theme/*` imports
- Check for changed prop names
- Verify MDX frontmatter format

### Issue: MDX Content Rendering Issues

**Symptoms**: MDX files don't render, show unexpected output, or throw errors.

**Cause**: MDX 3 has stricter parsing and different behavior.

**Solution**:
1. Check for unclosed JSX tags
2. Ensure proper spacing around JSX blocks
3. Verify imports are at top of file
4. Check for invalid MDX syntax

**MDX 3 requirements**:
```mdx
<!-- WRONG: No blank line before JSX -->
Some text
<Component />

<!-- CORRECT: Blank line before JSX -->
Some text

<Component />
```

## Search Issues

### Issue: Search Doesn't Work

**Symptoms**: Search bar doesn't show results or is broken.

**Cause**: Algolia configuration may need updating.

**Solution**:
1. Check Algolia credentials in `docusaurus.config.js`
2. Verify Algolia index is up to date
3. Check browser console for API errors
4. Test with Algolia's DocSearch crawler

**Check configuration**:
```javascript
themeConfig: {
  algolia: {
    appId: 'YOUR_APP_ID',
    apiKey: 'YOUR_SEARCH_API_KEY',
    indexName: 'YOUR_INDEX_NAME',
  },
}
```

## Development Server Issues

### Issue: Dev Server Won't Start

**Symptoms**: `npm start` fails or hangs.

**Cause**: Stale cache or dependency conflicts.

**Solution**:
```bash
# Clear everything
npm run clear
rm -rf node_modules package-lock.json .docusaurus build

# Reinstall
npm install

# Try starting again
npm start
```

### Issue: Hot Reload Not Working

**Symptoms**: Changes don't show up without manual refresh.

**Cause**: May be related to file watching or cache.

**Solution**:
1. Restart dev server
2. Clear `.docusaurus` folder
3. Check file permissions
4. Try in different browser

## Production Build Issues

### Issue: Build Fails But Dev Works

**Symptoms**: `npm start` works but `npm run build` fails.

**Cause**: Build process is stricter than dev server.

**Common causes**:
- Broken links
- Missing files
- Invalid frontmatter
- Strict TypeScript errors

**Solution**:
1. Read error messages carefully
2. Check for broken links (most common)
3. Validate all MDX frontmatter
4. Run `npm run build` to see full errors

### Issue: Build Output Too Large

**Symptoms**: Build folder is very large.

**Cause**: Including unnecessary files or unoptimized assets.

**Solution**:
1. Check `.gitignore` and `static/` folder
2. Optimize images before adding
3. Review what's being included in build
4. Consider code splitting

## Dependency Issues

### Issue: Conflicting Dependencies

**Symptoms**: npm install shows peer dependency warnings or errors.

**Cause**: Incompatible package versions.

**Solution**:
```bash
# Clear everything
rm -rf node_modules package-lock.json

# Install with legacy peer deps flag if needed
npm install --legacy-peer-deps

# Or force
npm install --force
```

**Better solution**: Update all packages to compatible versions.

### Issue: Wrong Node Version

**Symptoms**: Build fails with Node version error.

**Cause**: Docusaurus 3.x requires Node 18+.

**Solution**:
```bash
# Check Node version
node --version

# If < 18, upgrade Node
# Use nvm if available
nvm install 18
nvm use 18

# Or install Node 18+ directly
```

## MDX-Specific Issues

### Issue: Import Statements Not Working in MDX

**Symptoms**: Imports in MDX files throw errors.

**Cause**: Imports must be at top of file, before frontmatter ends.

**Solution**:
```mdx
---
title: My Page
---

import Component from '@site/src/components/Component';

{/* Now you can use Component */}
<Component />
```

### Issue: JSX Not Rendering in MDX

**Symptoms**: JSX code shows as text instead of rendering.

**Cause**: Incorrect spacing or nesting.

**Solution**:
- Ensure blank lines around JSX
- Don't nest JSX in indented blocks (like lists) without proper formatting
- Check for unclosed tags

## Plugin Issues

### Issue: Plugin Errors After Upgrade

**Symptoms**: Third-party plugins throw errors.

**Cause**: Plugin may not be compatible with new Docusaurus version.

**Solution**:
1. Check plugin documentation for compatible versions
2. Update plugin to latest version
3. Check plugin's GitHub issues
4. Temporarily disable plugin to isolate issue

**Example**:
```javascript
// In docusaurus.config.js
plugins: [
  // Try commenting out to isolate issue
  // 'problematic-plugin',
]
```

## Performance Issues

### Issue: Slow Build Times

**Symptoms**: Build takes much longer than before.

**Cause**: More content, unoptimized images, or inefficient plugins.

**Solution**:
1. Check build output for warnings
2. Optimize images (use WebP, reduce size)
3. Review plugins (disable unused ones)
4. Consider incremental builds for development

### Issue: Large Bundle Size

**Symptoms**: Site loads slowly, large JavaScript files.

**Cause**: Including too much in client bundle.

**Solution**:
1. Check webpack bundle analyzer output
2. Lazy load heavy components
3. Review what's being imported
4. Use code splitting

## Rollback Scenarios

### When to Rollback

Consider rolling back if:
- Critical functionality is broken
- Build completely fails
- Performance significantly degraded
- Can't fix issues in reasonable time

### How to Rollback

```bash
# Quick rollback
git checkout package.json
rm -rf node_modules package-lock.json
npm install

# Or use rollback script
scripts/rollback.sh
```

## Prevention Tips

1. **Test in development first**: Always test `npm start` before building
2. **Incremental upgrades**: Don't skip major versions
3. **Read changelogs**: Check for breaking changes
4. **Keep backups**: Git commit or branch before upgrading
5. **Test thoroughly**: Run through full test checklist
6. **Update incrementally**: Update packages in small batches

## Getting Help

If you encounter issues not covered here:

1. Check [Docusaurus GitHub Issues](https://github.com/facebook/docusaurus/issues)
2. Search [Docusaurus Discord](https://discord.gg/docusaurus)
3. Review [Docusaurus Documentation](https://docusaurus.io/docs)
4. Check package-specific documentation for plugins
