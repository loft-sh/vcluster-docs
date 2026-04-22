#!/usr/bin/env bash
set -eo pipefail

# Rollback Docusaurus upgrade using git
# Usage: rollback.sh

echo "Rolling back Docusaurus upgrade..."
echo ""

# Check if in git repository
if ! git rev-parse --is-inside-work-tree &> /dev/null; then
  echo "Error: Not in a git repository" >&2
  echo "Manual rollback required:" >&2
  echo "  1. Restore package.json from backup" >&2
  echo "  2. Restore modified files" >&2
  echo "  3. Run: npm install" >&2
  exit 1
fi

# Check for uncommitted changes
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "⚠️  Warning: You have uncommitted changes"
  echo ""
  git status --short
  echo ""
  read -r -p "Continue with rollback? This will discard changes. (y/N): " confirm
  if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
    echo "Rollback cancelled"
    exit 0
  fi
fi

# Files to restore
files=(
  "package.json"
  "docusaurus.config.js"
  "src/theme/DocSidebar/Desktop/Content/index.js"
)

echo "Restoring files:"
for file in "${files[@]}"; do
  if [[ -f "$file" ]]; then
    echo "  - $file"
    git checkout HEAD -- "$file" || echo "    (not in git)"
  fi
done

echo ""
echo "Cleaning installation..."

# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

echo ""
echo "Reinstalling dependencies..."
npm install

echo ""
echo "✅ Rollback complete!"
echo ""
echo "Test the rollback:"
echo "  npm start"

exit 0
