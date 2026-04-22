#!/usr/bin/env bash
set -eo pipefail

# Find version-specific feature paths (air-gapped, sleep mode, etc.)
# Usage: find_feature_location.sh <version> <feature>
# Example: find_feature_location.sh 0.22.0 air-gapped
# Example: find_feature_location.sh 0.22.0 sleep

if [[ $# -lt 2 ]]; then
  echo "Usage: find_feature_location.sh <version> <feature>" >&2
  echo "" >&2
  echo "Arguments:" >&2
  echo "  version: Version number (e.g., 0.22.0)" >&2
  echo "  feature: Feature to search for (e.g., air-gapped, sleep)" >&2
  echo "" >&2
  echo "Examples:" >&2
  echo "  find_feature_location.sh 0.22.0 air-gapped" >&2
  echo "  find_feature_location.sh 0.22.0 sleep" >&2
  exit 1
fi

version="$1"
feature="$2"

docs_dir="vcluster_versioned_docs/version-$version"

if [[ ! -d "$docs_dir" ]]; then
  echo "Error: Versioned docs directory not found: $docs_dir" >&2
  exit 1
fi

echo "Searching for '$feature' in version $version..."
echo ""

# Search for files matching the feature name
results=$(find "$docs_dir" -name "*$feature*" -type f 2>/dev/null || true)

if [[ -z "$results" ]]; then
  echo "❌ No files found matching '*$feature*'"
  echo ""
  echo "This feature may not exist in version $version."
  echo "You may need to:"
  echo "  - Remove or comment out links to this feature"
  echo "  - Use a different path for this version"
  exit 1
fi

echo "✅ Found the following files:"
echo ""
echo "$results"
echo ""

# Also search for mentions in markdown files
echo "📝 Checking for mentions in content:"
grep_results=$(grep -r "$feature" "$docs_dir" --include="*.mdx" 2>/dev/null | head -10 || true)

if [[ -n "$grep_results" ]]; then
  echo "$grep_results"
else
  echo "No mentions found in content"
fi

exit 0
