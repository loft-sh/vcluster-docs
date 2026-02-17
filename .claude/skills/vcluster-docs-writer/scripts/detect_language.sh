#!/usr/bin/env bash
set -eo pipefail

# Map file extension to language identifier for code blocks
# Usage: detect_language.sh <filename>

if [[ $# -eq 0 ]]; then
  echo "Usage: detect_language.sh <filename>" >&2
  exit 1
fi

filename="$1"
extension="${filename##*.}"

# Map common extensions where the extension doesn't match the language identifier
case "${extension,,}" in  # ${extension,,} converts to lowercase
  yml) echo "yaml" ;;
  js) echo "javascript" ;;
  ts) echo "typescript" ;;
  jsx) echo "javascriptreact" ;;
  tsx) echo "typescriptreact" ;;
  sh) echo "bash" ;;
  py) echo "python" ;;
  rs) echo "rust" ;;
  md) echo "markdown" ;;
  mdx) echo "markdown" ;;
  # For all other extensions, return the extension itself
  *) echo "$extension" ;;
esac

exit 0
