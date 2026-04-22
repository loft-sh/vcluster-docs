#!/usr/bin/env bash
set -eo pipefail

# Find all _partials, _fragments, and _code directories in the repository
# These directories contain reusable content that can be imported into documentation

# Get git repository root
git_root=$(git rev-parse --show-toplevel 2>/dev/null)

if [[ -z "$git_root" ]]; then
  echo "Error: Not inside a git repository." >&2
  exit 1
fi

echo "Searching for partials directories in: $git_root"
echo ""

# Find directories matching the partial patterns, excluding node_modules and .git
fd -t d '^(_partials|_fragments|_code)$' "$git_root" \
  --exclude node_modules \
  --exclude .git \
  --exclude .docusaurus \
  --exclude build

exit 0
