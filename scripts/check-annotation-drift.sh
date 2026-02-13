#!/usr/bin/env bash
set -eo pipefail

# Extracts annotations from a Go source repo and compares against
# documented annotations in an MDX reference page.
# Exit 0 = no drift, Exit 1 = drift detected, Exit 2 = error.
#
# Usage:
#   ./scripts/check-annotation-drift.sh <source-repo-path> <docs-mdx-path>
#
# Environment:
#   SOURCE_REF          Git ref (branch/tag) to check out in source repo (default: current)
#   SOURCE_LABEL        Human-readable label for the source (default: repo dir name)
#   UNDOCUMENTED_OUT    If set, write undocumented annotation list to this file path

SOURCE_REPO_PATH="${1:?Usage: $0 <source-repo-path> <docs-mdx-path>}"
DOCS_MDX_PATH="${2:?Usage: $0 <source-repo-path> <docs-mdx-path>}"
SOURCE_REF="${SOURCE_REF:-}"
SOURCE_LABEL="${SOURCE_LABEL:-$(basename "$SOURCE_REPO_PATH")}"
UNDOCUMENTED_OUT="${UNDOCUMENTED_OUT:-}"

if [[ ! -d "$SOURCE_REPO_PATH" ]]; then
    echo "ERROR: Source repo path does not exist: $SOURCE_REPO_PATH" >&2
    exit 2
fi

if [[ ! -f "$DOCS_MDX_PATH" ]]; then
    echo "SKIP: MDX file does not exist: $DOCS_MDX_PATH" >&2
    exit 0
fi

# Switch ref if requested
if [[ -n "$SOURCE_REF" ]]; then
    git -C "$SOURCE_REPO_PATH" checkout "$SOURCE_REF" --quiet 2>/dev/null || \
    git -C "$SOURCE_REPO_PATH" checkout "origin/$SOURCE_REF" --quiet 2>/dev/null || {
        echo "ERROR: Could not checkout ref: $SOURCE_REF" >&2
        exit 2
    }
fi

# --- Extract annotations from Go source ---
# Matches all known annotation namespaces:
#   loft.sh/*, sleepmode.loft.sh/*, vcluster.loft.sh/*,
#   virtualcluster.loft.sh/*, drift.loft.sh/*, rbac.loft.sh/*,
#   platform.vcluster.com/*
extract_codebase_annotations() {
    local path="$1"
    grep -roh \
        '"loft\.sh/[^"]*"\|"sleepmode\.loft\.sh/[^"]*"\|"vcluster\.loft\.sh/[^"]*"\|"virtualcluster\.loft\.sh/[^"]*"\|"drift\.loft\.sh/[^"]*"\|"rbac\.loft\.sh/[^"]*"\|"platform\.vcluster\.com/[^"]*"' \
        --include='*.go' "$path" \
    | tr -d '"' \
    | sort -u \
    | grep -v '%s\|%d\|%v' \
    | grep -v '=$' \
    | grep -v '=true$\|=false$\|=[^,]*$' \
    | grep -v '^vcluster\.loft\.sh/$' \
    | grep -vE '\-[a-f0-9]{10}$'
}

# --- Extract documented annotations from MDX ---
# Parses headings like: ### annotation.namespace/key {#anchor-id}
extract_documented_annotations() {
    local mdx="$1"
    grep -oP '### [a-z].*\{#[^}]+\}' "$mdx" \
    | sed 's/### //; s/ {#.*}//' \
    | sort -u
}

TMPDIR_WORK=$(mktemp -d)
trap 'rm -rf "$TMPDIR_WORK"' EXIT

CODEBASE_FILE="$TMPDIR_WORK/codebase.txt"
DOCUMENTED_FILE="$TMPDIR_WORK/documented.txt"

extract_codebase_annotations "$SOURCE_REPO_PATH" > "$CODEBASE_FILE"
extract_documented_annotations "$DOCS_MDX_PATH" > "$DOCUMENTED_FILE"

codebase_count=$(wc -l < "$CODEBASE_FILE")
documented_count=$(wc -l < "$DOCUMENTED_FILE")

# --- Compare ---
UNDOCUMENTED_FILE="$TMPDIR_WORK/undocumented.txt"
REMOVED_FILE="$TMPDIR_WORK/removed.txt"

# Annotations in codebase but not documented
comm -23 "$CODEBASE_FILE" "$DOCUMENTED_FILE" > "$UNDOCUMENTED_FILE"

# Annotations documented but not in codebase (possibly removed/renamed)
comm -13 "$CODEBASE_FILE" "$DOCUMENTED_FILE" > "$REMOVED_FILE"

undocumented_count=$(wc -l < "$UNDOCUMENTED_FILE")
removed_count=$(wc -l < "$REMOVED_FILE")

# Write undocumented list to external file if requested
if [[ -n "$UNDOCUMENTED_OUT" ]] && [[ "$undocumented_count" -gt 0 ]]; then
    cp "$UNDOCUMENTED_FILE" "$UNDOCUMENTED_OUT"
fi

# --- Output ---
echo "=== Annotation Drift Report ($SOURCE_LABEL) ==="
echo "Codebase annotations:   $codebase_count"
echo "Documented annotations: $documented_count"
echo ""

drift_detected=false

if [[ "$undocumented_count" -gt 0 ]]; then
    drift_detected=true
    echo "--- Undocumented annotations ($undocumented_count) ---"
    echo "These exist in $SOURCE_LABEL but are NOT in the docs:"
    while IFS= read -r line; do
        echo "  + $line"
    done < "$UNDOCUMENTED_FILE"
    echo ""
fi

if [[ "$removed_count" -gt 0 ]]; then
    drift_detected=true
    echo "--- Possibly removed annotations ($removed_count) ---"
    echo "These are documented but NOT found in $SOURCE_LABEL:"
    while IFS= read -r line; do
        echo "  - $line"
    done < "$REMOVED_FILE"
    echo ""
fi

if [[ "$drift_detected" == "true" ]]; then
    echo "RESULT: Drift detected"

    # If running in GitHub Actions, set outputs
    if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
        {
            echo "drift=true"
            echo "undocumented_count=$undocumented_count"
            echo "removed_count=$removed_count"
            echo "codebase_count=$codebase_count"
            echo "documented_count=$documented_count"
        } >> "$GITHUB_OUTPUT"

        # Write the report for the issue body
        REPORT_FILE="$TMPDIR_WORK/report.md"
        {
            echo "## Annotation drift report: $SOURCE_LABEL"
            echo ""
            echo "| Metric | Count |"
            echo "|--------|-------|"
            echo "| Codebase annotations | $codebase_count |"
            echo "| Documented annotations | $documented_count |"
            echo "| Undocumented | $undocumented_count |"
            echo "| Possibly removed | $removed_count |"
            echo ""
            if [[ "$undocumented_count" -gt 0 ]]; then
                echo "### Undocumented annotations"
                echo ""
                echo "These annotations exist in \`$SOURCE_LABEL\` but are not documented:"
                echo ""
                echo '```'
                cat "$UNDOCUMENTED_FILE"
                echo '```'
                echo ""
            fi
            if [[ "$removed_count" -gt 0 ]]; then
                echo "### Possibly removed annotations"
                echo ""
                echo "These are documented but no longer found in \`$SOURCE_LABEL\`:"
                echo ""
                echo '```'
                cat "$REMOVED_FILE"
                echo '```'
                echo ""
            fi
            echo "---"
            echo "*Generated by check-annotation-drift workflow*"
        } > "$REPORT_FILE"

        # Make report available via GITHUB_OUTPUT (multiline delimiter)
        {
            echo "report<<REPORT_EOF"
            cat "$REPORT_FILE"
            echo "REPORT_EOF"
        } >> "$GITHUB_OUTPUT"
    fi

    exit 1
else
    echo "RESULT: No drift detected"
    if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
        echo "drift=false" >> "$GITHUB_OUTPUT"
    fi
    exit 0
fi
