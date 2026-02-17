#!/usr/bin/env bash
set -eo pipefail

# Clear all Docusaurus build caches
# This is CRITICAL to run after making link fixes - stale cache causes phantom errors!

echo "Clearing Docusaurus build caches..."
echo ""

# Remove .docusaurus directory
if [[ -d ".docusaurus" ]]; then
  echo "Removing .docusaurus/"
  rm -rf .docusaurus
else
  echo "✓ .docusaurus/ already clean"
fi

# Remove build directory
if [[ -d "build" ]]; then
  echo "Removing build/"
  rm -rf build
else
  echo "✓ build/ already clean"
fi

# Remove node_modules/.cache
if [[ -d "node_modules/.cache" ]]; then
  echo "Removing node_modules/.cache/"
  rm -rf node_modules/.cache
else
  echo "✓ node_modules/.cache/ already clean"
fi

echo ""
echo "✅ All caches cleared!"
echo ""
echo "You can now run: npm run build"

exit 0
