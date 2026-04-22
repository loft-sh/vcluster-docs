#!/usr/bin/env bash
set -eo pipefail

# Find common broken link patterns in versioned docs
# Usage: find_broken_patterns.sh <versioned-docs-directory>
# Example: find_broken_patterns.sh vcluster_versioned_docs/version-0.22.0

if [[ $# -eq 0 ]]; then
  echo "Usage: find_broken_patterns.sh <versioned-docs-directory>" >&2
  echo "Example: find_broken_patterns.sh vcluster_versioned_docs/version-0.22.0" >&2
  exit 1
fi

docs_dir="$1"

if [[ ! -d "$docs_dir" ]]; then
  echo "Error: Directory not found: $docs_dir" >&2
  exit 1
fi

echo "Searching for common broken link patterns in: $docs_dir"
echo ""

# Pattern 1: /platform/next/ references
echo "🔍 Pattern 1: /platform/next/ references"
count=$(grep -r "/platform/next/" "$docs_dir" 2>/dev/null | wc -l)
if [[ $count -gt 0 ]]; then
  echo "   ❌ Found $count occurrences"
  grep -r "/platform/next/" "$docs_dir" 2>/dev/null | head -5
  echo "   → Fix: Replace /platform/next/ with /platform/"
else
  echo "   ✅ No issues found"
fi
echo ""

# Pattern 2: .mdx# fragments (should not have .mdx extension)
echo "🔍 Pattern 2: .mdx# fragments in links"
count=$(grep -r "\.mdx#" "$docs_dir" 2>/dev/null | wc -l)
if [[ $count -gt 0 ]]; then
  echo "   ❌ Found $count occurrences"
  grep -r "\.mdx#" "$docs_dir" 2>/dev/null | head -5
  echo "   → Fix: Remove .mdx extension before #"
else
  echo "   ✅ No issues found"
fi
echo ""

# Pattern 3: /docs/vcluster/ references (should not have /docs/ prefix)
echo "🔍 Pattern 3: /docs/vcluster/ references"
count=$(grep -r "/docs/vcluster/" "$docs_dir" 2>/dev/null | wc -l)
if [[ $count -gt 0 ]]; then
  echo "   ❌ Found $count occurrences"
  grep -r "/docs/vcluster/" "$docs_dir" 2>/dev/null | head -5
  echo "   → Fix: Replace /docs/vcluster/ with /vcluster/"
else
  echo "   ✅ No issues found"
fi
echo ""

# Pattern 4: /docs/platform/ references
echo "🔍 Pattern 4: /docs/platform/ references"
count=$(grep -r "/docs/platform/" "$docs_dir" 2>/dev/null | wc -l)
if [[ $count -gt 0 ]]; then
  echo "   ❌ Found $count occurrences"
  grep -r "/docs/platform/" "$docs_dir" 2>/dev/null | head -5
  echo "   → Fix: Replace /docs/platform/ with /platform/"
else
  echo "   ✅ No issues found"
fi
echo ""

# Pattern 5: @site imports (should use relative paths in versioned docs)
echo "🔍 Pattern 5: @site imports in versioned docs"
count=$(grep -r "@site" "$docs_dir" 2>/dev/null | wc -l)
if [[ $count -gt 0 ]]; then
  echo "   ❌ Found $count occurrences"
  grep -r "@site" "$docs_dir" 2>/dev/null | head -5
  echo "   → Fix: Replace @site imports with relative paths"
else
  echo "   ✅ No issues found"
fi
echo ""

# Pattern 6: .mdx) in links (should not have .mdx extension)
echo "🔍 Pattern 6: .mdx) extensions in links"
count=$(grep -r "\.mdx)" "$docs_dir" 2>/dev/null | wc -l)
if [[ $count -gt 0 ]]; then
  echo "   ❌ Found $count occurrences"
  grep -r "\.mdx)" "$docs_dir" 2>/dev/null | head -5
  echo "   → Fix: Run scripts/fix_mdx_extensions.sh to remove all .mdx extensions"
else
  echo "   ✅ No issues found"
fi
echo ""

echo "🔍 Scan complete!"

exit 0
