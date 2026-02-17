#!/usr/bin/env bash
set -eo pipefail

# Check if versioned docs exist for a given version
# Usage: verify_version.sh <version>
# Example: verify_version.sh 0.22.0

if [[ $# -eq 0 ]]; then
  echo "Usage: verify_version.sh <version>" >&2
  echo "Example: verify_version.sh 0.22.0" >&2
  exit 1
fi

version="$1"

echo "Verifying version: $version"
echo ""

# Check for vCluster versioned docs
vcluster_dir="vcluster_versioned_docs/version-$version"
if [[ -d "$vcluster_dir" ]]; then
  echo "✅ vCluster versioned docs found: $vcluster_dir"
  file_count=$(find "$vcluster_dir" -name "*.mdx" | wc -l)
  echo "   Files: $file_count MDX files"
else
  echo "❌ vCluster versioned docs NOT found: $vcluster_dir" >&2
  exit 1
fi

echo ""

# Check for Platform versioned docs (optional)
# Extract major.minor version (e.g., 4.3 from 4.3.0)
platform_version="${version%.*}"
platform_dir="platform_versioned_docs/version-$platform_version.0"

if [[ -d "$platform_dir" ]]; then
  echo "✅ Platform versioned docs found: $platform_dir"
  file_count=$(find "$platform_dir" -name "*.mdx" 2>/dev/null | wc -l)
  echo "   Files: $file_count MDX files"
else
  echo "⚠️  Platform versioned docs not found: $platform_dir"
  echo "   (This may be expected if no platform docs for this version)"
fi

echo ""
echo "✅ Version verification complete!"

exit 0
