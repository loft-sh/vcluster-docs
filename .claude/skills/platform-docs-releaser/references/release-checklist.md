# Platform Documentation Release Checklist

Complete checklist for Platform documentation releases.

## Pre-Release

- [ ] New Platform version released (e.g., 4.5.0)
- [ ] Version number confirmed with user
- [ ] Working directory: `/home/decoder/loft/vcluster-docs`
- [ ] On appropriate branch and up to date
- [ ] vCluster schema available at `configsrc/vcluster/main/vcluster.schema.json`

## Part 1: AI Generates Platform API Partials (Item 1)

**AI Responsibility - CRITICAL FIRST STEP:**

- [ ] Locate vCluster schema:
  ```bash
  ls configsrc/vcluster/main/vcluster.schema.json
  ```
- [ ] Run API generation script:
  ```bash
  go run hack/platform/partials/main.go configsrc/vcluster/main/vcluster.schema.json
  ```
- [ ] Verify generation succeeded:
  ```bash
  ls platform/api/_partials/resources/ | wc -l  # Should show multiple files
  ```
- [ ] Check generated files look reasonable (not empty, proper MDX format)

## Part 2: User Creates Versioned Docs (Item 2)

**User Responsibility:**

- [ ] Run versioning command:
  ```bash
  npm run docusaurus docs:version:platform X.Y.Z
  ```
- [ ] Verify created:
  - `platform_versioned_docs/version-X.Y.Z/` directory
  - `platform_versioned_sidebars/version-X.Y.Z-sidebars.json`
  - Updated `platform_versions.json`

## Part 2.5: Verify Cross-Plugin Imports Use @site Alias (Item 3)

**AI Responsibility - BEFORE versioning:**

**Understanding import types:**
- Same-plugin (platform→platform/_partials): Use relative paths (versioned together) ✅
- Cross-plugin (platform→vcluster/_partials or docs/_partials): Use @site (shared, not versioned) ✅

- [ ] Check for cross-plugin imports using relative paths:
  ```bash
  grep -r "import.*\.\./\.\./\.\./vcluster\|import.*\.\./\.\./\.\./docs" platform/ --include="*.mdx" -l
  ```
- [ ] If cross-plugin relative paths found, convert to `@site`:
  ```javascript
  // ❌ WRONG - cross-plugin with relative path
  import InstallCli from '../../../vcluster/_partials/deploy/install-cli.mdx';

  // ✅ CORRECT - cross-plugin with @site
  import InstallCli from '@site/vcluster/_partials/deploy/install-cli.mdx';

  // ✅ CORRECT - same-plugin with relative path (stays as-is)
  import InstallNextSteps from "../../_partials/install/install-next-steps.mdx";
  ```
- [ ] Common files with cross-plugin imports:
  - `platform/install/environments/{aws,azure,gcp}.mdx`
  - `platform/install/quick-start-guide.mdx`
  - `platform/understand/what-are-virtual-clusters.mdx`
- [ ] Do NOT change same-plugin imports (platform→platform/_partials) - they should stay relative

## Part 3: AI Configuration Updates (Items 4-5)

**AI Responsibility:**

### Item 3: Update docusaurus.config.js

- [ ] Update SEO sitemap priority (line ~108): `/platform/X.Y.0/`
- [ ] Update SEO comment (line ~120): Include new version range
- [ ] Update platform plugin lastVersion (line ~175): `"X.Y.0"`
- [ ] Add new version entry (line ~180):
  ```js
  "X.Y.0": {
    label: "vX.Y Stable",
    banner: "none",
    badge: true,
  }
  ```
- [ ] Demote previous version (line ~186): Remove "Stable" from label
- [ ] Update announcement bar (line ~400): New version number

### Item 4: Update netlify.toml

- [ ] File: `netlify.toml` line ~520
- [ ] Change: `from = "/docs/platform/X.Y.0/*"`
- [ ] Verify: Redirect points to new version

### Item 5: Create Hurl Test File

- [ ] Copy: `cp hack/test-platform-X.Z.hurl hack/test-platform-X.Y.hurl`
- [ ] Update header: Version number and usage comment
- [ ] Update redirect tests: Platform X.Y.0 redirect test
- [ ] Update version verification tests: Check for "Platform X.Y", "vX.Y Stable"
- [ ] Add/update cross-version tests: vCluster→Platform link verification
- [ ] Remove: All `(lines X-Y)` references from section headers
- [ ] Note: Tests run AFTER PR deployed

## Part 4: User Manual Tasks (Items 6-9)

**User Responsibility:**

### Item 6: Review Enterprise/Pro Tags

- [ ] Search codebase for platform-specific `<ProAdmonition>` tags
- [ ] Review enterprise features
- [ ] Verify all Pro features properly tagged in new version
- [ ] Check version-specific Pro feature differences

### Item 7: Update Release Support Dates

- [ ] Find platform support dates file
- [ ] Update: Release date for new version
- [ ] Update: End of support dates for older versions
- [ ] Update: End of life dates
- [ ] Verify: Dates follow platform lifecycle policy

### Item 8: Update Compatibility Matrix

- [ ] Update: Platform version compatibility
- [ ] Update: Connected cluster requirements
- [ ] Add: New integrations if released
- [ ] Verify: vCluster version compatibility with platform

## Part 5: Build & Test

**User Responsibility:**

### Build Check

- [ ] Clear cache (optional): `rm -rf .docusaurus build node_modules/.cache`
- [ ] Run build: `npm run build`
- [ ] Check for errors: Build should complete successfully
- [ ] **If build errors occur**: Check `CLAUDE.md` for instructions on fixing broken import paths in versioned docs
- [ ] Fix any broken links or issues

### Hurl Test (After PR Deployed)

- [ ] Push PR to GitHub
- [ ] Wait for Netlify preview deployment
- [ ] Get preview URL from PR
- [ ] Run hurl tests:
  ```bash
  hurl --test --variable BASE_URL=https://deploy-preview-XXXX--vcluster-docs-site.netlify.app \
    hack/test-platform-X.Y.hurl
  ```
- [ ] Verify: All tests pass
- [ ] Verify: Cross-version references work
- [ ] Fix: Any failing redirects

## Part 6: Final Review & Merge

- [ ] Review all changes in PR
- [ ] Verify checklist complete
- [ ] Get approval if required
- [ ] Merge PR to main
- [ ] Monitor production deployment
- [ ] Verify site loads correctly
- [ ] Test version dropdown works

## Post-Release

- [ ] Close Linear issue
- [ ] Update team in Slack
- [ ] Archive oldest version if needed (see archiver skill if exists)
- [ ] Update changelogs if applicable

## Quick Status Report Template

Use this template to report status:

```
✅ Platform X.Y.0 Release Status

AI Tasks (1, 3-5): ✅ COMPLETE
- Generated API partials
- Updated docusaurus.config.js
- Updated netlify redirect
- Created hurl test file with cross-version tests

User Tasks (2, 6-8):
⏳ Awaiting:
- Review enterprise/pro tags
- Update support dates
- Update compatibility matrix

Ready for: Build & Test
```

## Files Changed Reference

| File | Purpose | AI/User |
|------|---------|---------|
| `platform/api/_partials/resources/**` | API documentation | AI (generated) |
| `docusaurus.config.js` | Version config, labels, SEO | AI |
| `netlify.toml` | Redirect config | AI |
| `hack/test-platform-X.Y.hurl` | SEO/redirect/cross-version tests | AI |
| Platform support dates file | Support dates & compat | User |
| `platform_versioned_docs/version-X.Y.Z/` | Versioned docs | User |
| `platform_versions.json` | Version list | Auto |

## Common Issues Checklist

- [ ] Issue: "API partials generation fails" → Check schema path and Go deps
- [ ] Issue: "Version already exists" → User already versioned, proceed
- [ ] Issue: "Build fails" → User fixes, not AI
- [ ] Issue: "Hurl tests fail" → Check BASE_URL and version numbers
- [ ] Issue: "Cross-version links broken" → Verify vCluster→Platform references
- [ ] Issue: "Wrong version in config" → Double-check all occurrences

## Platform-Specific Reminders

- [ ] API partials MUST be generated first
- [ ] Platform maintains fewer versions than vCluster (2-3 vs 5-6)
- [ ] No CLI docs to verify (unlike vCluster)
- [ ] Cross-version testing with vCluster links is critical
- [ ] Version display format is `vX.Y` not `vX.Y.Z`
