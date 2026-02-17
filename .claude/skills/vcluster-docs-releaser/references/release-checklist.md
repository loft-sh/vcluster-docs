# vCluster Documentation Release Checklist

Complete checklist for vCluster documentation releases based on Linear issue template (ENG-XXXX pattern).

## Pre-Release

- [ ] New vCluster version released (e.g., 0.30.0)
- [ ] Version number confirmed with user
- [ ] Working directory: `/home/decoder/loft/vcluster-docs`
- [ ] On `main` branch and up to date

## Part 1: Next Branch Merge (If Applicable)

- [ ] Check if `next` branch has unique content:
  ```bash
  git log --oneline --no-merges origin/next ^main
  ```
- [ ] If content exists, create PR:
  ```bash
  gh pr create --base main --head next \
    --title "docs: merge next branch for vX.Y release" \
    --body "Squash merge of preview docs from next branch"
  ```
- [ ] Review and merge PR with squash merge
- [ ] If no content, skip this step entirely

## Part 2: User Creates Versioned Docs (Item 1)

**User Responsibility:**

- [ ] Run versioning command:
  ```bash
  npm run docusaurus docs:version:vcluster 0.XX.0
  ```
- [ ] Verify created:
  - `vcluster_versioned_docs/version-0.XX.0/` directory
  - `vcluster_versioned_sidebars/version-0.XX.0-sidebars.json`
  - Updated `vcluster_versions.json`

## Part 3: AI Configuration Updates (Items 2-5)

**AI Responsibility:**

### Item 2: Update Banner

- [ ] File: `docusaurus.config.js` line ~400
- [ ] Change: `vCluster 0.XX` in announcement bar content
- [ ] Verify: Banner displays new version

### Item 3: Update Netlify Redirect

- [ ] File: `netlify.toml` line ~521
- [ ] Change: `from = "/docs/vcluster/0.XX.0/*"`
- [ ] Verify: Redirect points to new version

### Item 4: Verify CLI Commands

- [ ] Check: `vcluster_versioned_docs/version-0.XX.0/cli/` exists
- [ ] Count files: `ls *.md | wc -l` (expect 90+)
- [ ] Spot check: `vcluster_create.md`, `vcluster_certs.md` exist
- [ ] Verify: `_category_.json` exists

### Item 5: Create Hurl Test File

- [ ] Copy: `cp hack/test-vcluster-0.YY.hurl hack/test-vcluster-0.XX.hurl`
- [ ] Update header: Version number and usage comment
- [ ] Update Test 32: vCluster redirect test
- [ ] Update Test 69-70: Version verification tests
- [ ] Remove: All `(lines X-Y)` references from section headers
- [ ] Note: Tests run AFTER PR deployed

### Additional AI Tasks:

- [ ] Update main docs label (line ~81): `label: "v0.XX"`
- [ ] Update SEO sitemap priority (line ~108): `0.XX.0`
- [ ] Update SEO comment (line ~120): `0.19-0.XX`
- [ ] Update vCluster plugin lastVersion (line ~192): `"0.XX.0"`
- [ ] Update onlyIncludeVersions (line ~193): Add new, remove oldest
- [ ] Add new version entry (line ~198): `"0.XX.0": { label: "v0.XX Stable", ... }`
- [ ] Demote previous version (line ~204): Remove "Stable" from label

## Part 4: User Manual Tasks (Items 6-9)

**User Responsibility:**

### Item 6: Review Enterprise/Pro Tags

- [ ] Search codebase for `<ProAdmonition>` tags
- [ ] Review [Linear enterprise features view](https://linear.app/loft/view/enterprise-features-32b0326b38a5)
- [ ] Verify all Pro features properly tagged
- [ ] Check version-specific Pro feature differences

### Item 7: Partials PR Automation

- [ ] Wait for automated partials PR to be created
- [ ] Review partials PR changes
- [ ] Merge partials PR if valid
- [ ] Verify partials updates in build

### Item 8: Update Release Support Dates

- [ ] File: `vcluster/deploy/upgrade/supported_versions.mdx`
- [ ] Update: Release date for new version
- [ ] Update: End of support dates for older versions
- [ ] Update: End of life dates
- [ ] Verify: Dates follow lifecycle policy

### Item 9: Update Compatibility Matrix

- [ ] File: `vcluster/deploy/upgrade/supported_versions.mdx`
- [ ] Update: Kubernetes version support matrix
- [ ] Add: New K8s versions if released
- [ ] Verify: Host cluster compatibility
- [ ] Check: vCluster version compatibility

## Part 5: Build & Test

**User Responsibility:**

### Build Check

- [ ] Clear cache (optional): `rm -rf .docusaurus build node_modules/.cache`
- [ ] Run build: `npm run build`
- [ ] Check for errors: Build should complete successfully
- [ ] Fix any broken links or issues

### Hurl Test (After PR Deployed)

- [ ] Push PR to GitHub
- [ ] Wait for Netlify preview deployment
- [ ] Get preview URL from PR
- [ ] Run hurl tests:
  ```bash
  hurl --test --variable BASE_URL=https://deploy-preview-XXXX--vcluster-docs-site.netlify.app \
    hack/test-vcluster-0.XX.hurl
  ```
- [ ] Verify: All tests pass
- [ ] Fix: Any failing redirects

## Part 6: Final Review & Merge

- [ ] Review all changes in PR
- [ ] Verify checklist complete
- [ ] Get approval if required
- [ ] Merge PR to main
- [ ] Monitor production deployment
- [ ] Verify site loads correctly

## Post-Release

- [ ] Close Linear issue (ENG-XXXX)
- [ ] Update team in Slack
- [ ] Archive oldest version if needed (see `vcluster-docs-archiver` skill)
- [ ] Update changelogs if applicable

## Quick Status Report Template

Use this template to report status:

```
✅ vCluster 0.XX.0 Release Status

AI Tasks (2-5): ✅ COMPLETE
- Updated banner
- Updated netlify redirect
- Verified CLI docs (XX files)
- Created hurl test file

User Tasks (1, 6-9):
⏳ Awaiting:
- Review enterprise/pro tags
- Update support dates
- Update compatibility matrix
- Partials PR merge

Ready for: Build & Test
```

## Files Changed Reference

| File | Purpose | AI/User |
|------|---------|---------|
| `docusaurus.config.js` | Version config, labels, SEO | AI |
| `netlify.toml` | Redirect config | AI |
| `hack/test-vcluster-0.XX.hurl` | SEO/redirect tests | AI |
| `vcluster/deploy/upgrade/supported_versions.mdx` | Support dates & compat | User |
| `vcluster_versioned_docs/version-0.XX.0/` | Versioned docs | User |
| `vcluster_versions.json` | Version list | Auto |

## Common Issues Checklist

- [ ] Issue: "Version already exists" → User already versioned, proceed
- [ ] Issue: "CLI docs missing" → Check generation script
- [ ] Issue: "Build fails" → User fixes, not AI
- [ ] Issue: "Hurl tests fail" → Check BASE_URL and version numbers
- [ ] Issue: "Partials not merged" → Wait for automation
- [ ] Issue: "Wrong version in config" → Double-check all occurrences
