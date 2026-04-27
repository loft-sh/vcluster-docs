# Efficient Broken Link Debugging Method

This guide explains the fastest way to debug and fix broken links during vCluster documentation archiving.

## The Problem

When Docusaurus builds versioned docs, it often reports broken link errors like this:

```
Broken link on source page path = /docs/vcluster/configure/vcluster-yaml/sync/:
   -> linking to ../control-plane/other/advanced/virtual-scheduler
```

The error tells you:
1. **Source page**: Where the broken link appears (`/docs/vcluster/configure/vcluster-yaml/sync/`)
2. **Target link**: What it's trying to link to (`../control-plane/other/advanced/virtual-scheduler`)

## The Naive Approach (DON'T DO THIS)

❌ **Don't try to calculate relative paths manually!**

People often try to:
1. Look at the source path
2. Count directory levels
3. Calculate what the relative path should be
4. Edit the file
5. Rebuild
6. Discover it still doesn't work
7. Repeat steps 2-6 multiple times

This wastes a lot of time and leads to frustration.

## The Efficient Method (DO THIS)

### 🚨 The Fast 3-Step Process

**Step 1: CD to the source directory**

Extract the path from the error message and navigate to it in the versioned docs folder:

```bash
# Error says: "source page path = /docs/vcluster/configure/vcluster-yaml/sync/"
# Remove /docs/vcluster/ prefix and navigate to versioned folder

cd vcluster_versioned_docs/version-0.22.0/configure/vcluster-yaml/sync/
```

**Step 2: Grep for the filename ONLY**

Extract just the filename from the broken link path (not the full path!) and search for it:

```bash
# Error says: "linking to ../control-plane/other/advanced/virtual-scheduler"
# Search for just "virtual-scheduler" (the filename)

grep -r "virtual-scheduler" . --include="*.mdx"
```

This will show you:
- Which file(s) contain the broken link
- The exact line with the broken link
- The context around it

**Step 3: Fix the link**

Now you can:
1. See the actual link in context
2. Find where the target file actually is
3. Calculate the correct relative path (or use absolute path for fragments)
4. Edit and fix

### Why This Works

This method is MUCH faster because:
- ✅ You're searching from the correct directory
- ✅ You're searching for what actually exists in the file (the filename)
- ✅ Grep shows you the exact file and line
- ✅ You can see the full context of the link
- ✅ Error messages often have incorrect full paths, but filenames are usually correct

## Real-World Example

### Error Message
```
Broken link on source page path = /docs/vcluster/configure/vcluster-yaml/sync/:
   -> linking to ../control-plane/other/advanced/virtual-scheduler
```

### Solution

```bash
# Step 1: Navigate to source directory
cd vcluster_versioned_docs/version-0.21.0/configure/vcluster-yaml/sync/

# Step 2: Search for filename
grep -r "virtual-scheduler" . --include="*.mdx"

# Output might show:
# ./README.mdx:123:[Virtual Scheduler](../control-plane/other/advanced/virtual-scheduler)
```

Now you can:
1. Open `./README.mdx`
2. Go to line 123
3. See the broken link
4. Find where `virtual-scheduler` actually is
5. Fix the path

```bash
# Find the actual location of the target file
find vcluster_versioned_docs/version-0.21.0/ -name "*virtual-scheduler*"

# Output:
# vcluster_versioned_docs/version-0.21.0/configure/vcluster-yaml/control-plane/advanced/virtual-scheduler.mdx

# Calculate correct relative path from sync/ to control-plane/advanced/
# sync/ -> configure/vcluster-yaml/sync/
# target -> configure/vcluster-yaml/control-plane/advanced/
# Relative path: ../control-plane/advanced/virtual-scheduler.mdx
```

Edit the link:
```diff
-[Virtual Scheduler](../control-plane/other/advanced/virtual-scheduler)
+[Virtual Scheduler](../control-plane/advanced/virtual-scheduler.mdx)
```

## Special Cases

### Multiple Files Match

If grep returns multiple files:

```bash
grep -r "virtual-scheduler" . --include="*.mdx"
# Returns:
# ./README.mdx:123:[link](../path/virtual-scheduler)
# ./other.mdx:45:[link](../path/virtual-scheduler)
```

Fix all occurrences or check which one is causing the build error.

### Fragment Files

If the broken link is in a fragment (`_fragments/*.mdx`), use **absolute paths** instead of relative paths:

```bash
cd vcluster_versioned_docs/version-0.21.0/_fragments/
grep -r "virtual-scheduler" . --include="*.mdx"
```

**Fix**: Use absolute path starting with `/vcluster/`:
```diff
-[Virtual Scheduler](../../../configure/vcluster-yaml/control-plane/advanced/virtual-scheduler)
+[Virtual Scheduler](/vcluster/configure/vcluster-yaml/control-plane/advanced/virtual-scheduler)
```

**Why**: Fragments are imported by multiple files at different directory depths, so relative paths won't work reliably.

### Target File Doesn't Exist

If you can't find the target file:

```bash
find vcluster_versioned_docs/version-0.21.0/ -name "*virtual-scheduler*"
# Returns nothing
```

The feature doesn't exist in this version. Options:
1. Remove the link
2. Comment it out
3. Link to main docs with a version disclaimer
4. Link to a different but related page

## Bulk Operations

### Find All Potential Issues Before Building

Run these searches BEFORE the build to identify all potential broken links:

```bash
# Find common broken patterns
grep -r "/platform/next/" vcluster_versioned_docs/version-0.22.0/
grep -r "\.mdx#" vcluster_versioned_docs/version-0.22.0/
grep -r "/docs/vcluster/" vcluster_versioned_docs/version-0.22.0/
grep -r "@site" vcluster_versioned_docs/version-0.22.0/
```

### Bulk Fix .mdx Extensions

Remove all .mdx extensions from links at once:

```bash
find vcluster_versioned_docs/version-0.22.0 -name "*.mdx" -exec sed -i 's/\.mdx)/)/g' {} \;
find vcluster_versioned_docs/version-0.22.0 -name "*.mdx" -exec sed -i 's/\.mdx#/#/g' {} \;
```

## Best Practices

1. **Always CD to the source directory first** - this makes grep results relative to where you are
2. **Search for filename only, not full path** - error messages often have incorrect paths
3. **Use `--include="*.mdx"`** - to search only markdown files
4. **Clear cache after fixing** - `rm -rf .docusaurus build node_modules/.cache`
5. **Fix one error at a time** - don't try to fix everything before rebuilding
6. **Use absolute paths for fragments** - saves time later

## Workflow Summary

```bash
# 1. Get error from build
npm run build
# Error: Broken link on source page path = /docs/vcluster/configure/vcluster-yaml/sync/
#        -> linking to ../control-plane/other/advanced/virtual-scheduler

# 2. Navigate to source directory
cd vcluster_versioned_docs/version-0.22.0/configure/vcluster-yaml/sync/

# 3. Search for filename
grep -r "virtual-scheduler" . --include="*.mdx"

# 4. Find target file location
find vcluster_versioned_docs/version-0.22.0/ -name "*virtual-scheduler*"

# 5. Fix the link in the file that grep found

# 6. Clear cache and rebuild
rm -rf .docusaurus build node_modules/.cache
npm run build

# 7. Repeat for next error
```

This method typically solves link issues in **30 seconds instead of 5 minutes** per error.
