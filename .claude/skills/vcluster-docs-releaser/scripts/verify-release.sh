#!/usr/bin/env bash
set -eo pipefail

# vCluster Documentation Release Verification Script
# Usage: ./verify-release.sh 0.30.0

VERSION="${1}"

if [ -z "$VERSION" ]; then
  echo "Error: Version number required"
  echo "Usage: ./verify-release.sh 0.30.0"
  exit 1
fi

echo "🔍 Verifying vCluster $VERSION release configuration..."
echo

# Check 1: Versioned docs exist
echo "✓ Checking versioned docs directory..."
if [ -d "vcluster_versioned_docs/version-$VERSION" ]; then
  echo "  ✅ vcluster_versioned_docs/version-$VERSION exists"
else
  echo "  ❌ vcluster_versioned_docs/version-$VERSION NOT FOUND"
  exit 1
fi

# Check 2: Sidebar JSON exists
echo "✓ Checking sidebar JSON..."
if [ -f "vcluster_versioned_sidebars/version-$VERSION-sidebars.json" ]; then
  echo "  ✅ Sidebar JSON exists"
else
  echo "  ❌ Sidebar JSON NOT FOUND"
  exit 1
fi

# Check 3: vcluster_versions.json includes version
echo "✓ Checking vcluster_versions.json..."
if grep -q "\"$VERSION\"" vcluster_versions.json; then
  echo "  ✅ Version $VERSION in vcluster_versions.json"
else
  echo "  ❌ Version $VERSION NOT in vcluster_versions.json"
  exit 1
fi

# Check 4: CLI docs count
echo "✓ Checking CLI documentation files..."
CLI_COUNT=$(find "vcluster_versioned_docs/version-$VERSION/cli" -name "*.md" | wc -l)
echo "  ✅ Found $CLI_COUNT CLI doc files"
if [ "$CLI_COUNT" -lt 90 ]; then
  echo "  ⚠️  Warning: Expected 90+ CLI files, found $CLI_COUNT"
fi

# Check 5: docusaurus.config.js updates
echo "✓ Checking docusaurus.config.js..."

# Extract short version (0.30 from 0.30.0)
SHORT_VERSION="${VERSION%.*}"

if grep -q "label: \"v$SHORT_VERSION\"" docusaurus.config.js; then
  echo "  ✅ Main docs label updated to v$SHORT_VERSION"
else
  echo "  ❌ Main docs label NOT updated (expected: v$SHORT_VERSION)"
fi

if grep -q "lastVersion: \"$VERSION\"" docusaurus.config.js; then
  echo "  ✅ vCluster lastVersion set to $VERSION"
else
  echo "  ❌ vCluster lastVersion NOT set to $VERSION"
fi

if grep -q "\"$VERSION\"" docusaurus.config.js; then
  echo "  ✅ Version $VERSION mentioned in config"
else
  echo "  ❌ Version $VERSION NOT found in config"
fi

if grep -q "vCluster 0\.${SHORT_VERSION#*.}" docusaurus.config.js; then
  echo "  ✅ Announcement bar updated"
else
  echo "  ⚠️  Warning: Announcement bar may not be updated"
fi

# Check 6: netlify.toml redirect
echo "✓ Checking netlify.toml..."
if grep -q "from = \"/docs/vcluster/$VERSION/\*\"" netlify.toml; then
  echo "  ✅ Netlify redirect configured for $VERSION"
else
  echo "  ❌ Netlify redirect NOT configured for $VERSION"
fi

# Check 7: Hurl test file
echo "✓ Checking hurl test file..."
if [ -f "hack/test-vcluster-$SHORT_VERSION.hurl" ]; then
  echo "  ✅ Hurl test file exists"

  # Check for volatile line references
  if grep -q "(lines [0-9]" "hack/test-vcluster-$SHORT_VERSION.hurl"; then
    echo "  ⚠️  Warning: Found volatile line references - should be removed"
  fi
else
  echo "  ❌ Hurl test file NOT found: hack/test-vcluster-$SHORT_VERSION.hurl"
fi

echo
echo "✅ Verification complete!"
echo
echo "Remaining tasks:"
echo "  - Review enterprise/pro tags (user)"
echo "  - Update support dates (user)"
echo "  - Update compatibility matrix (user)"
echo "  - Run: npm run build (user)"
echo "  - Run hurl tests after PR deployed (user)"
