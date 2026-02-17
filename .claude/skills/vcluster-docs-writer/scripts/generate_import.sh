#!/usr/bin/env bash
set -eo pipefail

# Generate correct import statement for partials or code blocks
# Usage: generate_import.sh <partial-path> <current-file-dir> [--raw]
#
# Arguments:
#   partial-path: Absolute path to the partial file
#   current-file-dir: Absolute path to directory of current file
#   --raw: (optional) Generate raw-loader import for code blocks
#
# The script determines whether to use @site (for shared non-versioned content)
# or relative paths (for versioned content)

if [[ $# -lt 2 ]]; then
  echo "Usage: generate_import.sh <partial-path> <current-file-dir> [--raw]" >&2
  echo "" >&2
  echo "Arguments:" >&2
  echo "  partial-path: Absolute path to the partial file" >&2
  echo "  current-file-dir: Absolute path to directory of current file" >&2
  echo "  --raw: (optional) Generate raw-loader import for code blocks" >&2
  exit 1
fi

partial_path="$1"
current_file_dir="$2"
use_raw_loader=false

if [[ "$3" == "--raw" ]]; then
  use_raw_loader=true
fi

# Get git repository root
git_root=$(git rev-parse --show-toplevel 2>/dev/null)

if [[ -z "$git_root" ]]; then
  echo "Error: Not inside a git repository." >&2
  exit 1
fi

# Get repository-relative path for the partial
repo_path="${partial_path#"$git_root"/}"

# Check if this path should use @site (shared non-versioned content)
use_site_import=false
allowed_patterns=(
  "^docs/_partials/"
  "^docs/_fragments/"
  "^docs/_code/"
)

for pattern in "${allowed_patterns[@]}"; do
  if [[ "$repo_path" =~ $pattern ]]; then
    use_site_import=true
    break
  fi
done

# Generate component name from file (CamelCase)
filename=$(basename "$partial_path")
filename_no_ext="${filename%.*}"
# Convert hyphens and underscores to spaces, then title case, then remove spaces
component_name=$(echo "$filename_no_ext" | sed 's/[-_]/ /g' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2))}1' | sed 's/ //g')

# Generate import statement
if [[ "$use_site_import" == true ]]; then
  # Use @site for shared non-versioned content
  if [[ "$use_raw_loader" == true ]]; then
    echo "import $component_name from '!!raw-loader!@site/$repo_path';"
  else
    echo "import $component_name from '@site/$repo_path';"
  fi
else
  # Calculate relative path
  # Remove git root from both paths
  from_rel="${current_file_dir#"$git_root"/}"
  to_rel="$repo_path"

  # Split paths into arrays
  IFS='/' read -ra from_parts <<< "$from_rel"
  IFS='/' read -ra to_parts <<< "$to_rel"

  # Find common prefix length
  common=0
  for ((i=0; i<${#from_parts[@]} && i<${#to_parts[@]}; i++)); do
    if [[ "${from_parts[$i]}" == "${to_parts[$i]}" ]]; then
      ((common++))
    else
      break
    fi
  done

  # Build relative path
  relative_path=""
  # Add ../ for each remaining from_parts
  for ((i=common; i<${#from_parts[@]}; i++)); do
    relative_path="../$relative_path"
  done

  # Add remaining to_parts
  for ((i=common; i<${#to_parts[@]}; i++)); do
    relative_path="$relative_path${to_parts[$i]}"
    if [[ $i -lt $((${#to_parts[@]} - 1)) ]]; then
      relative_path="$relative_path/"
    fi
  done

  # Generate import with relative path
  if [[ "$use_raw_loader" == true ]]; then
    echo "import $component_name from '!!raw-loader!$relative_path';"
  else
    echo "import $component_name from '$relative_path';"
  fi
fi

exit 0
