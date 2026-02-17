#!/usr/bin/env bash
set -eo pipefail

# Remove .mdx extensions from all links in versioned docs
# Usage: fix_mdx_extensions.sh <versioned-docs-directory>
# Example: fix_mdx_extensions.sh vcluster_versioned_docs/version-0.22.0

if [[ $# -eq 0 ]]; then
  echo "Usage: fix_mdx_extensions.sh <versioned-docs-directory>" >&2
  echo "Example: fix_mdx_extensions.sh vcluster_versioned_docs/version-0.22.0" >&2
  exit 1
fi

docs_dir="$1"

if [[ ! -d "$docs_dir" ]]; then
  echo "Error: Directory not found: $docs_dir" >&2
  exit 1
fi

echo "Removing .mdx extensions from links in: $docs_dir"
echo ""

# Count before
before_count=$(grep -r "\.mdx)" "$docs_dir" 2>/dev/null | wc -l)
echo "Found $before_count occurrences of .mdx) before fix"

# Replace .mdx) with )
find "$docs_dir" -name "*.mdx" -exec sed -i 's/\.mdx)/)/g' {} \;

# Also replace .mdx# with #
find "$docs_dir" -name "*.mdx" -exec sed -i 's/\.mdx#/#/g' {} \;

# Count after
after_count=$(grep -r "\.mdx)" "$docs_dir" 2>/dev/null | wc -l)
echo "Found $after_count occurrences of .mdx) after fix"

echo ""
if [[ $after_count -eq 0 ]]; then
  echo "✅ All .mdx extensions removed from links!"
else
  echo "⚠️  Some .mdx extensions may remain. Check manually."
fi

exit 0
