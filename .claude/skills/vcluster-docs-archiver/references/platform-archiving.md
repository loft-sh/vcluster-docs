# Platform-Specific Archiving Workflow

## Key Concept: Platform "Drags Along" vCluster

Platform versions include vCluster documentation for compatibility. When archiving a Platform version, you must include a vCluster version.

**Critical Rule**: Use LATEST vCluster version, not oldest!

### Why This Matters

❌ **Wrong Approach**:
- Platform 4.2 + vCluster 0.25.0 (oldest in versions)
- Results in outdated vCluster docs
- Broken links to new vCluster features

✅ **Correct Approach**:
- Platform 4.2 + vCluster 0.30.0 (latest stable)
- Platform users see current vCluster documentation
- Better compatibility information

## Platform Archiving Checklist

### 1. Determine Versions

```bash
# Platform version to archive
PLATFORM_VERSION="4.2.0"

# Use LATEST vCluster version
VCLUSTER_VERSION="0.30.0"  # NOT 0.25.0!

# Verify both exist
ls platform_versioned_docs/version-${PLATFORM_VERSION}
ls vcluster_versioned_docs/version-${VCLUSTER_VERSION}
```

### 2. Create Archive Branch

```bash
# Branch naming convention
git checkout -b platform-v4.2
# OR with ticket number
git checkout -b doc-1029/archive-v4.2
```

### 3. Configure docusaurus.config.js

**Platform plugin**:
```javascript
{
  id: "platform",
  path: "platform",
  lastVersion: "4.2.0",
  onlyIncludeVersions: ["4.2.0"],  // ONLY the archived version
  versions: {
    "4.2.0": {
      label: "v4.2",
      banner: "none",
      badge: true,
    },
    // Keep other version definitions but they won't build
  }
}
```

**vCluster plugin**:
```javascript
{
  id: "vcluster",
  path: "vcluster",
  lastVersion: "0.30.0",  // LATEST!
  onlyIncludeVersions: ["0.30.0"],
  versions: {
    "0.30.0": {
      label: "v0.30 Stable",
      banner: "none",
      badge: true,
    },
  }
}
```

**Main docs label**:
```javascript
docs: {
  versions: {
    current: {
      label: "Platform v4.2",  // Make it clear this is Platform archive
      banner: "none",
      badge: false,
    }
  }
}
```

### 4. Update Version Dropdown

**File**: `src/theme/DocSidebar/Desktop/Content/index.js`

Set BOTH dropdowns to empty (archive branch has no version selector):
```javascript
{shouldShowVClusterVersioning && <VersionSelector docsPluginId={"vcluster"} dropdownItemsAfter={[]} />}
{shouldShowPlatformVersioning && <VersionSelector docsPluginId={"platform"} dropdownItemsAfter={[]} />}
```

### 5. Fix Platform-Specific Links

#### Remove /next/ Prefixes

Platform docs often reference `/platform/next/` which breaks in archives:

```bash
# Find all /next/ links
grep -r "/platform/next/" platform_versioned_docs/version-4.2.0/
grep -r "/vcluster/next/" vcluster_versioned_docs/version-0.30.0/

# Fix automatically
find platform_versioned_docs/version-4.2.0 -name "*.mdx" -exec sed -i 's|/platform/next/|/platform/|g' {} +
find vcluster_versioned_docs/version-0.30.0 -name "*.mdx" -exec sed -i 's|/vcluster/next/|/vcluster/|g' {} +
```

Count: Platform 4.2 had 13 files with `/next/` links.

#### Remove Links to Non-Existent Features

Older Platform versions don't have newer features. Remove or comment out:

**Platform 4.2 doesn't have**:
- Node Providers (BCM, KubeVirt, Terraform)
- VirtualClusterTemplates
- Some newer RBAC features

**Example** (in `_fragments/auto-nodes.mdx`):
```markdown
❌ BEFORE:
vCluster provides [node providers](/platform/next/administer/node-providers/overview)

✅ AFTER:
<!-- Node providers not available in Platform 4.2 -->
vCluster provides node provider support in Platform 4.3+
```

**Important**: It's OK if some links point to empty pages in discontinued versions. Don't spend too much time perfecting old docs.

### 6. Build and Deploy

```bash
# Clear cache
scripts/clear_cache.sh

# Build (expect multiple iterations)
npm run build

# Fix errors using efficient debugging method
# Typical: 5-8 build attempts for Platform archives
```

**Netlify Deployment**:
- Branch: `platform-v4.2` or `doc-1029/archive-v4.2`
- Deploys to: `platform-v4-2--vcluster-docs-site.netlify.app`
- Note: Slashes and dots in branch names become hyphens

### 7. Update Main Branch

**⚠️ DO NOT COMMIT - Stage for user**

```bash
git checkout main

# 1. Update docusaurus.config.js
# Remove Platform 4.2 from onlyIncludeVersions (keep version definition)

# 2. Update dropdown
# File: src/theme/DocSidebar/Desktop/Content/index.js
# Add to dropdownItemsAfter:
{
  to: "https://vcluster.com/docs/v4.2",
  label: "v4.2 (EOS) ↗"  # EOS not EOL!
}

# 3. Delete archived folder
rm -rf platform_versioned_docs/version-4.2.0

# 4. Stage changes (DO NOT COMMIT)
git add docusaurus.config.js src/theme/DocSidebar/Desktop/Content/index.js platform_versioned_docs/
git status  # Show user what will be committed
```

### 8. Add Redirects (Separate Repo)

**File**: `/home/decoder/loft/vcluster.com/themes/loft/static/_redirects`

```
# Platform v4.2 Docs Site (EOS version with dedicated standalone site)
/docs/v4.2          https://platform-v4-2--vcluster-docs-site.netlify.app/docs/platform/   302!
/docs/v4.2/*        https://platform-v4-2--vcluster-docs-site.netlify.app/docs/platform/:splat   302!
```

**User must commit vcluster.com changes and create PR**

## Archive Branch vs Main Branch

### Archive Branch (Standalone Deployment)
- Contains: Platform 4.2.0 + vCluster 0.30.0
- Config: `onlyIncludeVersions: ["4.2.0"]` and `["0.30.0"]`
- Dropdown: Empty (`dropdownItemsAfter={[]}`)
- **NEVER merged to main** - permanent standalone branch
- Netlify URL: `platform-v4-2--vcluster-docs-site.netlify.app`

### Main Branch (After Archiving)
- Remove Platform 4.2 from `onlyIncludeVersions`
- Delete `platform_versioned_docs/version-4.2.0/` folder
- Add dropdown link to archived deployment
- User commits manually (AI never commits)

## Common Platform Archiving Mistakes

1. **❌ Using oldest vCluster version (0.25.0)**
   - ✅ Always use LATEST (0.30.0)

2. **❌ Leaving /next/ prefixes in links**
   - ✅ Remove ALL /next/ early (13+ files typically)

3. **❌ Keeping links to non-existent features**
   - ✅ Remove/comment links to node-providers, new templates

4. **❌ Adding .mdx to absolute paths**
   - ✅ Absolute paths NEVER have .mdx

5. **❌ Attempting to commit changes**
   - ✅ Stage everything, user commits manually

## Platform-Specific Build Stats

Typical Platform archive build:
- Build attempts: 5-8
- Files with broken links: 20-40
- /next/ links to fix: 10-15
- Feature links to remove: 5-10
- Time: 2-4 hours total

Don't expect perfection on first build. Platform archives are complex due to cross-version references.
