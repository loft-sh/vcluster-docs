# Version-Specific Known Issues and Quirks

This document tracks known issues, quirks, and special considerations for specific vCluster versions during the archiving process.

## vCluster 0.20.0

### Documentation Features
- **No air-gapped documentation**: Air-gapped installation docs don't exist in this version
- **Sleep mode location**: Different from later versions
- **Platform pairing**: Typically paired with Platform 4.3.0

### Common Issues
- **Air-gapped links**: Need to be removed or commented out in Platform docs that reference them
- **Sleep mode path**: May be at `/vcluster/configure/vcluster-yaml/sleep-mode` (older location)

### Fixes Required
```bash
# Remove air-gapped references
grep -r "air-gapped" platform_versioned_docs/version-4.3.0/
# Comment out or remove these references

# Verify sleep mode location
find vcluster_versioned_docs/version-0.20.0 -name "*sleep*"
```

## vCluster 0.21.0

### Documentation Features
- **No air-gapped documentation**: Air-gapped installation docs still don't exist
- **Sleep mode moved**: Now at `/vcluster/manage/sleep-wakeup` (new location)
- **Platform pairing**: Typically paired with Platform 4.3.0

### Common Issues
- **Vale warning**: "Disabled" vs "disabled" capitalization warning appears
- **Sleep mode links**: May need updating if copied from 0.20.0
- **Air-gapped links**: Still need to be removed from Platform docs

### Fixes Required
```bash
# Verify sleep mode is at new location
find vcluster_versioned_docs/version-0.21.0 -name "*sleep*"
# Should find: vcluster/manage/sleep-wakeup

# Fix Vale warnings (optional but recommended)
# Look for "Disabled" → change to "disabled" in context
```

## vCluster 0.22.0

### Documentation Features
- **Check for new structure**: Documentation structure may have changed
- **Integration paths**: May have different paths for third-party integrations
- **Air-gapped docs**: May or may not exist - verify first
- **Platform pairing**: Check which Platform version is paired

### Common Issues
- **New feature locations**: Features may have moved to different paths
- **Integration docs**: Third-party integration docs may be reorganized

### Verification Steps
```bash
# Check for air-gapped docs
find vcluster_versioned_docs/version-0.22.0 -name "*air*"

# Check for sleep mode location
find vcluster_versioned_docs/version-0.22.0 -name "*sleep*"

# Check for integration reorganization
ls vcluster_versioned_docs/version-0.22.0/integrations/
# or
ls vcluster_versioned_docs/version-0.22.0/third-party-integrations/
```

## vCluster 0.23.0+

### Documentation Features
- **Newer versions**: May have significant structural changes
- **Check everything**: Don't assume paths from previous versions

### Verification Required
```bash
# Always verify major feature locations
find vcluster_versioned_docs/version-0.XX.0 -name "*air*"
find vcluster_versioned_docs/version-0.XX.0 -name "*sleep*"
find vcluster_versioned_docs/version-0.XX.0 -name "*sync*"

# Check for new directories
ls vcluster_versioned_docs/version-0.XX.0/

# Check for reorganizations
diff -r vcluster_versioned_docs/version-0.22.0/ vcluster_versioned_docs/version-0.XX.0/ | grep "Only in"
```

## Platform Version Compatibility

### Platform 4.3.0
- **Most common pairing**: Used with vCluster 0.20.0, 0.21.0, and often 0.22.0
- **Stable**: Well-tested and documented

### Platform 4.4.0+
- **Check compatibility**: Verify which vCluster versions are compatible
- **New features**: May reference vCluster features that don't exist in older versions

## Common Cross-Version Issues

### Fragment Path Consistency

**Issue**: Fragments may have moved between versions.

**Solution**: Always verify fragment locations:
```bash
# Check if fragment exists in expected location
ls vcluster_versioned_docs/version-0.XX.0/_fragments/

# Search for fragment by name if not in expected location
find vcluster_versioned_docs/version-0.XX.0/ -name "*fragment-name*"
```

### Feature Availability

**Issue**: Platform docs may reference vCluster features that don't exist in older versions.

**Common features to check**:
- Air-gapped installation
- Sleep/wake mode
- Multi-namespace mode
- Specific sync options
- Integration with cloud providers (EKS pod identity, GKE workload identity)

**Solution**:
1. Verify feature exists in version being archived
2. If missing, remove or comment out references in Platform docs
3. Or link to main docs with disclaimer about version availability

### Path Reorganizations

**Issue**: Documentation structure changes between versions.

**Common reorganizations**:
- `integrations/` → `third-party-integrations/`
- `deploy/` path restructuring
- `configure/` → `manage/`
- `vcluster-yaml/` location changes

**Solution**:
```bash
# Compare directory structures
diff -r vcluster_versioned_docs/version-0.21.0/ vcluster_versioned_docs/version-0.22.0/ | grep "Only in"

# Search for moved files
find vcluster_versioned_docs/version-0.XX.0/ -name "*filename*"
```

## Tips for New Versions

When archiving a new version that's not documented here:

1. **Document as you go**: Take notes on quirks and issues
2. **Compare with previous version**: Use diff to find structural changes
3. **Verify all major features**: Don't assume paths stayed the same
4. **Update this document**: Add a new section for the version
5. **Note Platform pairing**: Record which Platform version is used
6. **List common fixes**: Document any bulk replacements needed

## Platform v4.5 (Archived March 2026)

### Archive Details
- Branch: `platform-v4-5`
- Paired with: vCluster 0.32.0
- Netlify URL: `https://platform-v4-5--vcluster-docs-site.netlify.app/docs/platform/`
- Redirect: `/docs/v4.5` → archive site (in vcluster.com `_redirects`)

### Key Learnings
- 70 internal links had version prefix `/docs/platform/4.5.0/` that needed stripping to `/docs/platform/`
- Cross-section mismatches between vCluster 0.32 and Platform 4.5 required `onBrokenLinks: "warn"`
- `noIndex: true` set at top level to prevent search engine indexing
- Archive announcement bar (yellow, not closeable) with link to latest docs
- Vale bug discovered: markdown links with `#` fragments break backtick detection (see common-issues.md)
- `docs/_partials/platform_supported_versions.mdx` had a cross-version link to v4.5 migration guide that broke because v4.5 was excluded from the main build — fixed by pointing to archive URL

### Fixes Required
```bash
# Strip version prefix (70 occurrences)
find platform_versioned_docs/version-4.5.0 -name "*.mdx" \
  -exec sed -i 's|/docs/platform/4.5.0/|/docs/platform/|g' {} +

# Set onBrokenLinks to warn (cross-section mismatches expected)
# Set noIndex: true (archive should not be indexed)
# Empty versionConfig.js hidden arrays
```

## Version Archive History

| vCluster Version | Platform Version | Air-gapped Docs | Sleep Mode Path | Notes |
|------------------|------------------|-----------------|-----------------|-------|
| 0.20.0 | 4.3.0 | No | `configure/vcluster-yaml/sleep-mode` | Older path structure |
| 0.21.0 | 4.3.0 | No | `manage/sleep-wakeup` | Sleep moved to new path |
| 0.22.0 | 4.3.0 | Verify | `manage/sleep-wakeup` | Check for structure changes |
| 0.23.0+ | TBD | Verify | Verify | Document when archived |
| - | 4.5.0 + vCluster 0.32.0 | N/A | N/A | 70 version prefix links stripped, onBrokenLinks: warn |

**Legend**:
- ✅ = Feature exists
- ❌ = Feature doesn't exist
- ⚠️ = Verify before assuming
