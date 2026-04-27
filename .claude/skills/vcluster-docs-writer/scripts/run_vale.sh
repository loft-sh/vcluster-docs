#!/usr/bin/env bash
set -eo pipefail

# Run vale linter on documentation files
# Usage: run_vale.sh <file-or-directory>

if [[ $# -eq 0 ]]; then
  echo "Usage: run_vale.sh <file-or-directory>" >&2
  echo "Examples:" >&2
  echo "  run_vale.sh path/to/file.mdx" >&2
  echo "  run_vale.sh path/to/folder" >&2
  echo "  run_vale.sh .  # Check all files" >&2
  exit 1
fi

target="$1"

if [[ ! -e "$target" ]]; then
  echo "Error: File or directory not found: $target" >&2
  exit 1
fi

# Check if vale is installed
if ! command -v vale &> /dev/null; then
  echo "Error: vale is not installed." >&2
  echo "Install vale:" >&2
  echo "  macOS: brew install vale" >&2
  echo "  Linux: brew install vale or use your package manager" >&2
  echo "  Windows: choco install vale" >&2
  exit 1
fi

echo "Running vale on: $target"
echo ""

# Run vale with the repository's .vale.ini configuration
vale "$target"

exit_code=$?

if [[ $exit_code -eq 0 ]]; then
  echo ""
  echo "✅ Vale check passed!"
else
  echo ""
  echo "❌ Vale found issues. Please fix them before committing."
fi

exit $exit_code
