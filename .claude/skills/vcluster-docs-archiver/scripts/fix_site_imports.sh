#!/usr/bin/env bash
set -eo pipefail

# Find all @site imports in versioned docs that need to be replaced with relative paths
# Usage: fix_site_imports.sh <versioned-docs-directory>
# Example: fix_site_imports.sh vcluster_versioned_docs/version-0.22.0

if [[ $# -eq 0 ]]; then
  echo "Usage: fix_site_imports.sh <versioned-docs-directory>" >&2
  echo "Example: fix_site_imports.sh vcluster_versioned_docs/version-0.22.0" >&2
  echo "" >&2
  echo "This script finds @site imports but does not automatically fix them," >&2
  echo "because the correct relative path depends on the file's location." >&2
  exit 1
fi

docs_dir="$1"

if [[ ! -d "$docs_dir" ]]; then
  echo "Error: Directory not found: $docs_dir" >&2
  exit 1
fi

echo "Searching for @site imports in: $docs_dir"
echo ""

# Find all @site imports
site_imports=$(grep -rn "@site" "$docs_dir" 2>/dev/null || true)

if [[ -z "$site_imports" ]]; then
  echo "✅ No @site imports found!"
  exit 0
fi

echo "❌ Found @site imports that need to be replaced with relative paths:"
echo ""
echo "$site_imports"
echo ""
echo "📝 How to fix:"
echo "   1. For each file, determine the relative path from the file to the target"
echo "   2. Common pattern: @site/vcluster/_fragments/ → ../../../_fragments/"
echo "   3. The number of '../' depends on the directory depth of the importing file"
echo ""
echo "Example replacements:"
echo "   @site/vcluster/_fragments/example.mdx  →  ../../../_fragments/example.mdx"
echo "   @site/docs/_partials/example.mdx       →  ../../_partials/example.mdx"

exit 1
