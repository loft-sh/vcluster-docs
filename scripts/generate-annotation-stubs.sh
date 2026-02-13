#!/usr/bin/env bash
set -eo pipefail

# Generates MDX stub entries for undocumented annotations and appends
# them to the reference page. Extracts Go variable comments as descriptions.
#
# Usage:
#   ./scripts/generate-annotation-stubs.sh <source-repo-path> <docs-mdx-path> <undocumented-file>
#
# Arguments:
#   source-repo-path   Path to Go source repo (loft-enterprise or vcluster)
#   docs-mdx-path      Path to the MDX reference file to update
#   undocumented-file   File containing undocumented annotation keys (one per line)

SOURCE_REPO_PATH="${1:?Usage: $0 <source-repo-path> <docs-mdx-path> <undocumented-file>}"
DOCS_MDX_PATH="${2:?Usage: $0 <source-repo-path> <docs-mdx-path> <undocumented-file>}"
UNDOCUMENTED_FILE="${3:?Usage: $0 <source-repo-path> <docs-mdx-path> <undocumented-file>}"

if [[ ! -f "$UNDOCUMENTED_FILE" ]] || [[ ! -s "$UNDOCUMENTED_FILE" ]]; then
    echo "No undocumented annotations to process"
    exit 0
fi

if [[ ! -f "$DOCS_MDX_PATH" ]]; then
    echo "ERROR: MDX file does not exist: $DOCS_MDX_PATH" >&2
    exit 2
fi

stub_count=$(wc -l < "$UNDOCUMENTED_FILE")
echo "Generating $stub_count annotation stubs..."

TMPDIR_WORK=$(mktemp -d)
trap 'rm -rf "$TMPDIR_WORK"' EXIT

# Single-pass: extract ALL annotation definitions with surrounding context
# Format: filename:linenum:content (with 3 lines before for comments)
grep -rnB3 \
    '"loft\.sh/\|"sleepmode\.loft\.sh/\|"vcluster\.loft\.sh/\|"virtualcluster\.loft\.sh/\|"drift\.loft\.sh/\|"rbac\.loft\.sh/\|"platform\.vcluster\.com/' \
    --include='*.go' "$SOURCE_REPO_PATH" \
    > "$TMPDIR_WORK/all_context.txt" 2>/dev/null || true

# Build a lookup: annotation_key -> {comment, type}
declare -A ANNOTATION_COMMENTS
declare -A ANNOTATION_TYPES

while IFS= read -r annotation_key; do
    [[ -z "$annotation_key" ]] && continue

    # Find the matching block in the pre-extracted context
    local_block=$(grep -B3 "\"$annotation_key\"" "$TMPDIR_WORK/all_context.txt" 2>/dev/null | head -8)

    # Extract comment from // lines
    comment=""
    while IFS= read -r ctx_line; do
        if [[ "$ctx_line" =~ //[[:space:]]*(.*) ]]; then
            stripped="${BASH_REMATCH[1]}"
            # Skip guideline/category comments
            [[ "$stripped" =~ ^(Guidelines:|Informational:|Functional:|Template:|Defaults:|Projects|Cluster\ Quota:|vCluster:) ]] && continue
            if [[ -n "$comment" ]]; then
                comment="$comment $stripped"
            else
                comment="$stripped"
            fi
        fi
    done <<< "$local_block"

    # Determine type from context
    type="Annotation"
    if [[ "$local_block" =~ Label ]]; then
        type="Label"
    elif [[ "$local_block" =~ Finalizer ]]; then
        type="Finalizer"
    fi
    # Check source filename
    source_file=$(echo "$local_block" | grep "\"$annotation_key\"" | head -1 | cut -d: -f1)
    if [[ "$source_file" == *label* ]]; then
        type="Label"
    elif [[ "$source_file" == *finalizer* ]]; then
        type="Finalizer"
    fi

    ANNOTATION_COMMENTS["$annotation_key"]="$comment"
    ANNOTATION_TYPES["$annotation_key"]="$type"
done < "$UNDOCUMENTED_FILE"

# Remove trailing <!-- vale on --> if present (we'll re-add it)
sed -i '/^<!-- vale on -->$/d' "$DOCS_MDX_PATH"

# Remove existing "Needs documentation" section if present (regenerated each run)
needs_doc_line=$(grep -n "^## Needs documentation" "$DOCS_MDX_PATH" | head -1 | cut -d: -f1 || true)
if [[ -n "$needs_doc_line" ]]; then
    sed -i "${needs_doc_line},\$d" "$DOCS_MDX_PATH"
fi

# Generate the stubs section
STUBS_FILE="$TMPDIR_WORK/stubs.md"
{
    echo ""
    echo "## Needs documentation {#needs-documentation}"
    echo ""
    echo ":::caution"
    echo "The following annotations were detected in the codebase but lack full documentation. Entries are auto-generated stubs that need review."
    echo ":::"
    echo ""

    while IFS= read -r annotation_key; do
        [[ -z "$annotation_key" ]] && continue

        comment="${ANNOTATION_COMMENTS[$annotation_key]:-}"
        type="${ANNOTATION_TYPES[$annotation_key]:-Annotation}"
        anchor=$(echo "$annotation_key" | tr '/' '-' | tr '.' '-')

        if [[ -z "$comment" ]]; then
            description="Needs documentation."
        else
            description="$comment"
        fi

        echo "### $annotation_key {#$anchor}"
        echo ""
        echo "**Type:** $type"
        echo ""
        echo "**Example:** \`$annotation_key: \"\"\`"
        echo ""
        echo "$description"
        echo ""
    done < "$UNDOCUMENTED_FILE"

    echo "<!-- vale on -->"
} > "$STUBS_FILE"

# Append stubs to the MDX file
cat "$STUBS_FILE" >> "$DOCS_MDX_PATH"

echo "Appended $stub_count stubs to $DOCS_MDX_PATH"
