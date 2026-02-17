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

## Version Archive History

| vCluster Version | Platform Version | Air-gapped Docs | Sleep Mode Path | Notes |
|------------------|------------------|-----------------|-----------------|-------|
| 0.20.0 | 4.3.0 | ❌ No | `configure/vcluster-yaml/sleep-mode` | Older path structure |
| 0.21.0 | 4.3.0 | ❌ No | `manage/sleep-wakeup` | Sleep moved to new path |
| 0.22.0 | 4.3.0 | ⚠️ Verify | `manage/sleep-wakeup` | Check for structure changes |
| 0.23.0+ | TBD | ⚠️ Verify | ⚠️ Verify | Document when archived |

**Legend**:
- ✅ = Feature exists
- ❌ = Feature doesn't exist
- ⚠️ = Verify before assuming
