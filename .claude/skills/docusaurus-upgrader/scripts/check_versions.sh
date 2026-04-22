#!/usr/bin/env bash
set -eo pipefail

# Check current Docusaurus versions and show available updates
# Usage: check_versions.sh

echo "Checking Docusaurus versions..."
echo ""

if [[ ! -f "package.json" ]]; then
  echo "Error: package.json not found. Are you in the correct directory?" >&2
  exit 1
fi

echo "=== Current Versions ==="
echo ""

# Check Docusaurus core packages
packages=(
  "@docusaurus/core"
  "@docusaurus/preset-classic"
  "@docusaurus/theme-classic"
  "@docusaurus/theme-mermaid"
  "@docusaurus/module-type-aliases"
  "@docusaurus/types"
)

for package in "${packages[@]}"; do
  current=$(grep "\"$package\"" package.json | sed 's/.*": "//;s/".*//')
  if [[ -n "$current" ]]; then
    echo "$package: $current"
  fi
done

echo ""
echo "=== Related Dependencies ==="
echo ""

# Check related packages
related=(
  "@mdx-js/react"
  "@saucelabs/theme-github-codeblock"
  "clsx"
  "docusaurus-plugin-sass"
  "prism-react-renderer"
  "redocusaurus"
  "sass"
)

for package in "${related[@]}"; do
  current=$(grep "\"$package\"" package.json | sed 's/.*": "//;s/".*//')
  if [[ -n "$current" ]]; then
    echo "$package: $current"
  fi
done

echo ""
echo "=== Check for Updates ==="
echo ""
echo "Run: npm outdated | grep @docusaurus"
echo ""

exit 0
