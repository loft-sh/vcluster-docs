# Docusaurus Upgrade Testing Checklist

Comprehensive testing checklist to run after upgrading Docusaurus.

## Pre-Testing Setup

- [ ] Clean installation completed
- [ ] No errors during `npm install`
- [ ] Git is in clean state (or backup created)

## Development Server Testing

### Start Development Server

- [ ] Run `npm start` without errors
- [ ] Site loads at `http://localhost:3000`
- [ ] No errors in terminal
- [ ] No errors in browser console

### Navigation Testing

- [ ] Homepage loads correctly
- [ ] Navigation menu works
- [ ] Clicking links navigates properly
- [ ] Back/forward buttons work
- [ ] Sidebar navigation works
- [ ] Breadcrumbs work (if applicable)

### Version Dropdown Testing

- [ ] Version dropdown appears
- [ ] Clicking version dropdown shows options
- [ ] Selecting different version works
- [ ] Current version is highlighted
- [ ] Version links navigate correctly

### Custom Components Testing

Test all custom React components:

- [ ] `<Columns>` and `<Column>` render correctly
- [ ] Custom admonitions display properly
- [ ] Interactive components work
- [ ] Code blocks render
- [ ] Tables display correctly
- [ ] Images load properly
- [ ] Videos/embeds work (if any)

### Code Block Testing

- [ ] Syntax highlighting works
- [ ] Copy button works
- [ ] Line numbers display (if enabled)
- [ ] Language label shows correctly
- [ ] Long code blocks scroll properly
- [ ] Code tabs work (if using tabs)

### Admonition Testing

Test all admonition types:

- [ ] `:::note` renders correctly
- [ ] `:::tip` renders correctly
- [ ] `:::info` renders correctly
- [ ] `:::warning` renders correctly
- [ ] `:::danger` renders correctly
- [ ] Custom admonitions work (if any)

### Search Functionality

- [ ] Search bar is visible
- [ ] Typing in search shows results
- [ ] Clicking results navigates correctly
- [ ] Search shortcuts work (Ctrl+K / Cmd+K)
- [ ] Search closes on Escape
- [ ] Recent searches show (if applicable)

### Responsive Design Testing

Test on different viewport sizes:

- [ ] Desktop view (>1024px) looks correct
- [ ] Tablet view (768px-1024px) looks correct
- [ ] Mobile view (<768px) looks correct
- [ ] Mobile menu works
- [ ] Touch interactions work on mobile

### Dark Mode Testing

If dark mode is enabled:

- [ ] Dark mode toggle works
- [ ] Colors are correct in dark mode
- [ ] Readability is good in dark mode
- [ ] Custom components work in dark mode
- [ ] Images are visible in dark mode

## Production Build Testing

### Build Process

- [ ] Run `npm run build` without errors
- [ ] Build completes successfully
- [ ] No broken links reported
- [ ] Build output directory exists
- [ ] Build size is reasonable

### Serve Production Build

- [ ] Run `npm run serve` without errors
- [ ] Site loads at `http://localhost:3000`
- [ ] No 404 errors

### Production Site Testing

Test the served production build:

- [ ] All pages accessible
- [ ] Static assets load (CSS, JS, images)
- [ ] Fonts load correctly
- [ ] Icons display properly
- [ ] Performance is acceptable

### Link Validation

- [ ] No broken internal links
- [ ] External links work
- [ ] Anchor links work (#fragments)
- [ ] Download links work (if any)
- [ ] Redirects work (if configured)

### SEO and Meta Tags

- [ ] Page titles are correct
- [ ] Meta descriptions exist
- [ ] Open Graph tags work
- [ ] Twitter cards work (if configured)
- [ ] Canonical URLs are correct

## Functionality Testing

### Core Features

- [ ] Markdown renders correctly
- [ ] MDX components work
- [ ] Frontmatter is processed
- [ ] Table of contents generates
- [ ] Last updated dates show (if enabled)
- [ ] Edit page links work (if enabled)

### Advanced Features

If using these features:

- [ ] i18n/localization works
- [ ] Versioning works correctly
- [ ] Blog functionality works
- [ ] Docs sidebar customization works
- [ ] Custom CSS applies correctly
- [ ] Custom plugins work

### Form Testing

If forms exist:

- [ ] Form inputs work
- [ ] Form validation works
- [ ] Form submission works
- [ ] Error messages display

### Interactive Elements

- [ ] Buttons are clickable
- [ ] Dropdowns work
- [ ] Modals open/close
- [ ] Tooltips show on hover
- [ ] Collapsible sections work

## Browser Compatibility Testing

Test in multiple browsers:

- [ ] Chrome/Chromium (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest, if on Mac)
- [ ] Edge (latest)
- [ ] Mobile browsers (Chrome/Safari)

## Performance Testing

### Load Time

- [ ] Homepage loads quickly (<3s)
- [ ] Subsequent pages load quickly
- [ ] Images load without delay
- [ ] No layout shift during load

### Lighthouse Audit

Run Lighthouse audit (Chrome DevTools):

- [ ] Performance score acceptable (>80)
- [ ] Accessibility score good (>90)
- [ ] Best Practices score good (>90)
- [ ] SEO score good (>90)

## Console Checks

### Development Console

- [ ] No errors in browser console
- [ ] No warnings (or only acceptable ones)
- [ ] No network errors (404s, CORS, etc.)

### Production Console

- [ ] No errors in browser console
- [ ] No warnings in production build
- [ ] Source maps work (if enabled)

## Regression Testing

### Compare with Previous Version

- [ ] All pages that worked before still work
- [ ] No features were broken
- [ ] Custom functionality still works
- [ ] Performance didn't degrade significantly

## Documentation-Specific Testing

### Content Verification

- [ ] All docs pages accessible
- [ ] Code examples render correctly
- [ ] API references work
- [ ] Examples run/work as expected
- [ ] Screenshots are up to date

### Navigation Structure

- [ ] Sidebar structure is correct
- [ ] Categories expand/collapse
- [ ] Page order is correct
- [ ] Nested pages work

## Final Checks

### Pre-Commit

- [ ] All tests passed
- [ ] No critical issues found
- [ ] Git diff reviewed
- [ ] Ready to commit

### Post-Commit

- [ ] Changes committed with good message
- [ ] Branch pushed (if using branches)
- [ ] CI/CD pipeline passed (if applicable)
- [ ] Deployed to staging (if applicable)

## Rollback Decision

If issues were found:

- [ ] Issues documented
- [ ] Severity assessed
- [ ] Decision made: Fix now or rollback
- [ ] If rolling back: `scripts/rollback.sh`

## Notes

Use this space to note any issues found during testing:

```
Issue 1:
  - Description:
  - Severity: Critical / High / Medium / Low
  - Action taken:

Issue 2:
  - Description:
  - Severity:
  - Action taken:
```

## Sign-off

- [ ] All critical tests passed
- [ ] All high-priority tests passed
- [ ] Known issues documented
- [ ] Upgrade approved for production

**Tested by**: _______________
**Date**: _______________
**Docusaurus version**: _______________
