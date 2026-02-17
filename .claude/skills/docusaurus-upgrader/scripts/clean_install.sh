#!/usr/bin/env bash
set -eo pipefail

# Clean and reinstall dependencies
# This is critical after upgrading packages to avoid dependency conflicts

echo "Cleaning Docusaurus installation..."
echo ""

# Step 1: Clear Docusaurus cache
if command -v npm &> /dev/null; then
  echo "Running npm run clear..."
  npm run clear || echo "No clear script found, continuing..."
else
  echo "Error: npm not found" >&2
  exit 1
fi

# Step 2: Remove node_modules
echo ""
echo "Removing node_modules/..."
if [[ -d "node_modules" ]]; then
  rm -rf node_modules
  echo "✅ node_modules removed"
else
  echo "✓ node_modules already clean"
fi

# Step 3: Remove package-lock.json
echo ""
echo "Removing package-lock.json..."
if [[ -f "package-lock.json" ]]; then
  rm -f package-lock.json
  echo "✅ package-lock.json removed"
else
  echo "✓ package-lock.json already clean"
fi

# Step 4: Clean install
echo ""
echo "Running npm install..."
npm install

echo ""
echo "✅ Clean installation complete!"
echo ""
echo "Next steps:"
echo "  1. Run: npm start (test development server)"
echo "  2. Run: npm run build (test production build)"

exit 0
