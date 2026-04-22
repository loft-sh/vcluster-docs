#!/usr/bin/env bash
set -eo pipefail

# Test production build and serve
# Usage: test_build.sh

echo "Testing production build..."
echo ""

if [[ ! -f "package.json" ]]; then
  echo "Error: package.json not found. Are you in the correct directory?" >&2
  exit 1
fi

# Clean previous build
if [[ -d "build" ]]; then
  echo "Cleaning previous build..."
  rm -rf build
fi

# Run build
echo "Running npm run build..."
echo ""

if npm run build; then
  echo ""
  echo "✅ Build succeeded!"
  echo ""
  echo "Build output:"
  du -sh build/
  echo ""
  echo "To serve locally, run:"
  echo "  npm run serve"
  echo ""
  echo "Then visit: http://localhost:3000"
  exit 0
else
  echo ""
  echo "❌ Build failed!"
  echo ""
  echo "Common issues:"
  echo "  - Check for broken links in build output"
  echo "  - Clear cache: rm -rf .docusaurus build node_modules/.cache"
  echo "  - Review error messages above"
  exit 1
fi
