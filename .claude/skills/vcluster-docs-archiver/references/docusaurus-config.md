# Docusaurus Configuration for Archiving

## Overview

When archiving vCluster or Platform versions, you must configure three Docusaurus plugins and the dropdown selector.

## File Locations

- **Main config**: `docusaurus.config.js`
- **Dropdown**: `src/theme/DocSidebar/Desktop/Content/index.js`

## Configuration Patterns

### vCluster Version Archive

**Example**: Archiving vCluster 0.22.0

```javascript
// docusaurus.config.js

plugins: [
  [
    "@docusaurus/plugin-content-docs",
    {
      id: "vcluster",
      path: "vcluster",
      routeBasePath: "vcluster",
      sidebarPath: require.resolve("./sidebarsVCluster.js"),
      editUrl: ({ versionDocsDirPath, docPath }) =>
        `https://github.com/loft-sh/vcluster-docs/edit/main/${versionDocsDirPath}/${docPath}`,
      editCurrentVersion: true,

      // KEY SETTINGS for archive branch:
      lastVersion: "0.22.0",  // The version being archived
      onlyIncludeVersions: ["0.22.0"],  // ONLY this version builds

      versions: {
        "0.22.0": {
          label: "v0.22",
          banner: "none",
          badge: true,
        },
        // Keep other version definitions but they won't build
        "0.21.0": {
          label: "v0.21",
          banner: "none",
          badge: true,
        },
      },
    },
  ],
]
```

**Important**: Keep all version definitions in `versions` object, but only include the archived version in `onlyIncludeVersions`. This prevents build errors if any references exist.

### Platform Version Archive

**Example**: Archiving Platform 4.2.0 with vCluster 0.30.0

```javascript
// docusaurus.config.js

plugins: [
  // Platform plugin
  [
    "@docusaurus/plugin-content-docs",
    {
      id: "platform",
      path: "platform",
      routeBasePath: "platform",
      sidebarPath: require.resolve("./sidebarsPlatform.js"),
      editUrl: ({ versionDocsDirPath, docPath }) =>
        `https://github.com/loft-sh/vcluster-docs/edit/main/${versionDocsDirPath}/${docPath}`,
      editCurrentVersion: true,

      // KEY SETTINGS:
      lastVersion: "4.2.0",
      onlyIncludeVersions: ["4.2.0"],  // MUST NOT be empty!

      versions: {
        "4.2.0": {
          label: "v4.2",
          banner: "none",
          badge: true,
        },
        // Other versions...
      },
    },
  ],

  // vCluster plugin (dragged along with Platform)
  [
    "@docusaurus/plugin-content-docs",
    {
      id: "vcluster",
      path: "vcluster",
      routeBasePath: "vcluster",
      sidebarPath: require.resolve("./sidebarsVCluster.js"),
      editUrl: ({ versionDocsDirPath, docPath }) =>
        `https://github.com/loft-sh/vcluster-docs/edit/main/${versionDocsDirPath}/${docPath}`,
      editCurrentVersion: true,

      // Use LATEST vCluster version!
      lastVersion: "0.30.0",  // NOT 0.25.0!
      onlyIncludeVersions: ["0.30.0"],

      versions: {
        "0.30.0": {
          label: "v0.30 Stable",
          banner: "none",
          badge: true,
        },
      },
    },
  ],
]
```

### Main Docs Label

The main docs plugin (not versioned) should indicate which version this archive represents:

```javascript
// docusaurus.config.js

presets: [
  [
    "classic",
    {
      docs: {
        path: "docs",
        routeBasePath: "/",
        sidebarPath: require.resolve("./sidebars.js"),
        editUrl: "https://github.com/loft-sh/vcluster-docs/edit/main/",
        editCurrentVersion: true,
        lastVersion: "current",
        versions: {
          current: {
            label: "v0.22",  // For vCluster archive
            // OR
            label: "Platform v4.2",  // For Platform archive
            banner: "none",
            badge: false,
          },
        },
      },
    },
  ],
]
```

## Dropdown Configuration

**File**: `src/theme/DocSidebar/Desktop/Content/index.js`

### Archive Branch (Empty Dropdown)

Archive branches should have empty version dropdowns:

```javascript
export default function ContentWrapper(props) {
  const {pathname} = useLocation();
  const shouldShowVClusterVersioning = pathname.startsWith('/docs/vcluster');
  const shouldShowPlatformVersioning = pathname.startsWith('/docs/platform');

  return (
    <>
      {shouldShowVClusterVersioning && <VersionSelector
        docsPluginId={"vcluster"}
        dropdownItemsAfter={[]}
      />}

      {shouldShowPlatformVersioning && <VersionSelector
        docsPluginId={"platform"}
        dropdownItemsAfter={[]}
      />}

      <Content {...props} />
    </>
  );
}
```

### Main Branch (With EOL/EOS Links)

Main branch adds archived versions to dropdown:

**For vCluster**:
```javascript
{shouldShowVClusterVersioning && <VersionSelector docsPluginId={"vcluster"} dropdownItemsAfter={[
  {
    to: "https://vcluster.com/docs/v0.24",
    label: "v0.24 (EOL) ↗"
  },
  {
    to: "https://vcluster.com/docs/v0.23",
    label: "v0.23 (EOL) ↗"
  },
  {
    to: "https://vcluster.com/docs/v0.22",
    label: "v0.22 (EOL) ↗"  // Newly archived
  },
]} />}
```

**For Platform**:
```javascript
{shouldShowPlatformVersioning && <VersionSelector docsPluginId={"platform"} dropdownItemsAfter={[
  {
    to: "https://vcluster.com/docs/v4.2",
    label: "v4.2 (EOS) ↗"  // EOS not EOL!
  },
  {
    to: "https://loft.sh/docs/getting-started/install",
    label: "v3.4 (EOL) ↗"
  }
]} />}
```

## Common Configuration Mistakes

### ❌ Empty Platform onlyIncludeVersions

```javascript
// WRONG - causes build failure
{
  id: "platform",
  onlyIncludeVersions: [],  // NEVER empty!
}
```

### ❌ Setting includeCurrentVersion: false

```javascript
// WRONG - breaks partial imports
{
  id: "vcluster",
  includeCurrentVersion: false,
}
```

Keep default behavior - do not set this option.

### ❌ Using Oldest vCluster Version

```javascript
// WRONG - outdated docs
{
  id: "vcluster",
  lastVersion: "0.25.0",  // Oldest version
}

// CORRECT - current docs
{
  id: "vcluster",
  lastVersion: "0.30.0",  // Latest version
}
```

### ❌ Not Keeping Version Definitions

```javascript
// WRONG - may cause errors
versions: {
  "0.22.0": { label: "v0.22" },
  // Deleted other versions
}

// CORRECT - keep all definitions
versions: {
  "0.22.0": { label: "v0.22" },
  "0.21.0": { label: "v0.21" },
  "0.20.0": { label: "v0.20" },
  // onlyIncludeVersions controls what builds
}
```

## Main Branch Configuration

After archiving, update main branch `docusaurus.config.js`:

### Remove from onlyIncludeVersions

```javascript
// BEFORE archiving
onlyIncludeVersions: ["current", "0.30.0", "0.29.0", "0.28.0", "0.27.0", "0.26.0"],

// AFTER archiving 0.26.0
onlyIncludeVersions: ["current", "0.30.0", "0.29.0", "0.28.0", "0.27.0"],
```

### Keep Version Definition

```javascript
// Keep in versions object (don't delete)
versions: {
  "0.26.0": {
    label: "v0.26 (EOS)",
    banner: "none",
    badge: true,
  },
}
```

This prevents errors if any lingering references exist.

## Testing Configuration

After updating config:

```bash
# Clear all caches
rm -rf .docusaurus build node_modules/.cache

# Test build
npm run build

# Verify only correct versions are built
ls -la build/docs/vcluster/
ls -la build/docs/platform/
```

## Configuration Checklist

**Archive Branch**:
- [ ] Set `lastVersion` to archived version
- [ ] Set `onlyIncludeVersions` to single version array
- [ ] Platform plugin has non-empty `onlyIncludeVersions`
- [ ] vCluster version is LATEST (for Platform archives)
- [ ] Main docs label updated
- [ ] Dropdown set to empty array

**Main Branch**:
- [ ] Remove version from `onlyIncludeVersions`
- [ ] Keep version definition in `versions`
- [ ] Add EOL/EOS link to dropdown
- [ ] Delete versioned folder
- [ ] Test build succeeds
