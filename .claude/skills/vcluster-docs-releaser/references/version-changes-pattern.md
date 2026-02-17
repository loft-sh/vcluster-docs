# Version Change Patterns

This document shows the exact before/after patterns for each file during a vCluster release.

Example: Releasing version **0.30.0** (when current is 0.29.0)

## docusaurus.config.js Changes

### 1. Main Docs Label (~line 81)

**Before:**
```js
versions: {
  current: {
    label: "v0.29",
    banner: "none",
    badge: false,
  },
},
```

**After:**
```js
versions: {
  current: {
    label: "v0.30",
    banner: "none",
    badge: false,
  },
},
```

### 2. SEO Sitemap Priority Comment (~line 108)

**Before:**
```js
// Latest stable versions get highest priority (0.29.0 for vCluster, 4.4.0 for platform)
if (item.url.match(/\/vcluster\/0\.29\.0\//) ||
    item.url.match(/\/platform\/4\.4\.0\//)) {
```

**After:**
```js
// Latest stable versions get highest priority (0.30.0 for vCluster, 4.4.0 for platform)
if (item.url.match(/\/vcluster\/0\.30\.0\//) ||
    item.url.match(/\/platform\/4\.4\.0\//)) {
```

### 3. SEO Comment for Old Versions (~line 120)

**Before:**
```js
// ALL other versioned docs get very low priority (0.19-0.28 for vCluster, older platform versions)
```

**After:**
```js
// ALL other versioned docs get very low priority (0.19-0.29 for vCluster, older platform versions)
```

### 4. vCluster Plugin lastVersion (~line 192)

**Before:**
```js
lastVersion: "0.29.0",
```

**After:**
```js
lastVersion: "0.30.0",
```

### 5. vCluster Plugin onlyIncludeVersions (~line 193)

**Before:**
```js
onlyIncludeVersions: ["current", "0.29.0", "0.28.0", "0.27.0", "0.26.0", "0.25.0"],
```

**After:**
```js
onlyIncludeVersions: ["current", "0.30.0", "0.29.0", "0.28.0", "0.27.0", "0.26.0"],
```

**Pattern:** Add new version, remove oldest (0.25.0 drops out)

### 6. vCluster Plugin versions Object (~line 194-223)

**Before:**
```js
versions: {
  current: {
    label: "main 🚧",
  },
  "0.29.0": {
    label: "v0.29 Stable",
    banner: "none",
    badge: true,
  },
  "0.28.0": {
    label: "v0.28",
    banner: "none",
    badge: true,
  },
  "0.27.0": {
    label: "v0.27",
    banner: "none",
    badge: true,
  },
  "0.26.0": {
    label: "v0.26 (EOS)",
    banner: "none",
    badge: true,
  },
  "0.25.0": {
    label: "v0.25 (EOS)",
    banner: "none",
    badge: true,
  },
},
```

**After:**
```js
versions: {
  current: {
    label: "main 🚧",
  },
  "0.30.0": {                    // NEW ENTRY
    label: "v0.30 Stable",       // Gets "Stable" label
    banner: "none",
    badge: true,
  },
  "0.29.0": {
    label: "v0.29",              // DEMOTED: "Stable" removed
    banner: "none",
    badge: true,
  },
  "0.28.0": {
    label: "v0.28",
    banner: "none",
    badge: true,
  },
  "0.27.0": {
    label: "v0.27",
    banner: "none",
    badge: true,
  },
  "0.26.0": {
    label: "v0.26 (EOS)",
    banner: "none",
    badge: true,
  },
  // 0.25.0 REMOVED - drops out of build
},
```

**Pattern:**
- New version gets "Stable" suffix
- Previous stable loses "Stable" suffix
- Oldest version removed entirely

### 7. Announcement Bar (~line 400)

**Before:**
```js
announcementBar: {
  id: "platform-4-4-release",
  content:
    '🚀 <strong>New releases: <a href="https://www.vcluster.com/releases/en/changelog?hideLogo=true&hideMenu=true&theme=dark&embed=true&c=vCluster" target="_blank">vCluster Platform 4.4 and vCluster 0.29</a></strong>',
  backgroundColor: "#4a90e2",
  textColor: "#ffffff",
  isCloseable: true,
},
```

**After:**
```js
announcementBar: {
  id: "platform-4-4-release",
  content:
    '🚀 <strong>New releases: <a href="https://www.vcluster.com/releases/en/changelog?hideLogo=true&hideMenu=true&theme=dark&embed=true&c=vCluster" target="_blank">vCluster Platform 4.4 and vCluster 0.30</a></strong>',
  backgroundColor: "#4a90e2",
  textColor: "#ffffff",
  isCloseable: true,
},
```

## netlify.toml Changes

### Redirect Configuration (~line 521)

**Before:**
```toml
[[redirects]]
  from = "/docs/vcluster/0.29.0/*"
  to = "/docs/vcluster/:splat"
  status = 301
  force = true
```

**After:**
```toml
[[redirects]]
  from = "/docs/vcluster/0.30.0/*"
  to = "/docs/vcluster/:splat"
  status = 301
  force = true
```

## Hurl Test File

### New File Creation

**Action:** Copy and modify
```bash
cp hack/test-vcluster-0.29.hurl hack/test-vcluster-0.30.hurl
```

### Header Changes (lines 1-3)

**Before:**
```
# vCluster 0.29 Comprehensive Redirect Tests
# Generated from netlify.toml redirects
# Usage: hurl --test --variable BASE_URL=https://deploy-preview-1194--vcluster-docs-site.netlify.app hack/test-vcluster-0.29.hurl
```

**After:**
```
# vCluster 0.30 Comprehensive Redirect Tests
# Generated from netlify.toml redirects
# Usage: hurl --test --variable BASE_URL=https://deploy-preview-XXXX--vcluster-docs-site.netlify.app hack/test-vcluster-0.30.hurl
```

### Version Redirect Test (~line 207)

**Before:**
```
# Test 32: vCluster 0.29.0 wildcard redirect
GET {{BASE_URL}}/docs/vcluster/0.29.0/introduction/what-are-virtual-clusters
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/introduction/what-are-virtual-clusters"
```

**After:**
```
# Test 32: vCluster 0.30.0 wildcard redirect
GET {{BASE_URL}}/docs/vcluster/0.30.0/introduction/what-are-virtual-clusters
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/introduction/what-are-virtual-clusters"
```

### Verification Tests (~lines 441-448)

**Before:**
```
# Test 69: Documentation home page should load
GET {{BASE_URL}}/docs/
HTTP 200
[Asserts]
body contains "vCluster 0.29"
body contains "Platform 4.4"

# Test 70: vCluster main page should show v0.29 as stable
GET {{BASE_URL}}/docs/vcluster/
HTTP 200
[Asserts]
body contains "v0.29 Stable"
```

**After:**
```
# Test 69: Documentation home page should load
GET {{BASE_URL}}/docs/
HTTP 200
[Asserts]
body contains "vCluster 0.30"
body contains "Platform 4.4"

# Test 70: vCluster main page should show v0.30 as stable
GET {{BASE_URL}}/docs/vcluster/
HTTP 200
[Asserts]
body contains "v0.30 Stable"
```

### Section Headers (multiple locations)

**Remove all volatile line references:**

**Before:**
```
# =====================================================
# vCluster 0.29.0 redirect (lines 497-501)
# =====================================================
```

**After:**
```
# =====================================================
# vCluster 0.30.0 redirect
# =====================================================
```

**Pattern:** Remove `(lines X-Y)` from ALL section headers

## Automatic Changes (No Action Needed)

These files are automatically updated by Docusaurus versioning command:

### vcluster_versions.json

**Before:**
```json
[
  "0.29.0",
  "0.28.0",
  "0.27.0",
  "0.26.0",
  "0.25.0",
  "0.24.0"
]
```

**After:**
```json
[
  "0.30.0",
  "0.29.0",
  "0.28.0",
  "0.27.0",
  "0.26.0",
  "0.25.0"
]
```

### Directory Structure

**Created automatically:**
- `vcluster_versioned_docs/version-0.30.0/` (full docs copy)
- `vcluster_versioned_sidebars/version-0.30.0-sidebars.json` (sidebar config)

## Summary Table

| File | Changes | Count |
|------|---------|-------|
| `docusaurus.config.js` | Version strings, labels, config | 7 locations |
| `netlify.toml` | Redirect rule | 1 location |
| `hack/test-vcluster-0.30.hurl` | New file, all tests | ~10 changes |
| `vcluster_versions.json` | Auto-updated | - |
| Versioned dirs | Auto-created | - |

## Regex Search Patterns

Useful for finding all occurrences:

```bash
# Find all version references in docusaurus.config.js
grep "0\.29" docusaurus.config.js

# Find all version references in netlify.toml
grep "0\.29" netlify.toml

# Find all version references in hurl files
grep "0\.29" hack/test-vcluster-*.hurl

# Find volatile line references
grep "(lines [0-9]" hack/test-vcluster-*.hurl
```

## Version Number Format Reference

| Context | Format | Example |
|---------|--------|---------|
| Full version | X.Y.Z | 0.30.0 |
| Short version (label) | vX.Y | v0.30 |
| Short version (stable) | vX.Y Stable | v0.30 Stable |
| Short version (EOL) | vX.Y (EOS) | v0.26 (EOS) |
| Regex pattern | X\.Y\.Z | 0\.30\.0 |
| URL pattern | /X.Y.Z/ | /0.30.0/ |
| File naming | X.Y | 0.30 |
