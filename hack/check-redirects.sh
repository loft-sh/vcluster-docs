#!/usr/bin/env bash
# check-redirects.sh — Validate and fix netlify.toml redirects.
#
# Modes:
#   pr (default):  Check deleted/renamed files have redirects + validate platform-ui-links.
#   --fix:         Auto-generate missing redirects for moved/deleted files in netlify.toml.
#   --audit:       Validate ALL redirect targets against the file tree.
#
# Usage:
#   bash hack/check-redirects.sh              # PR check (CI or local)
#   bash hack/check-redirects.sh --fix        # Auto-fix missing redirects
#   bash hack/check-redirects.sh --audit      # Full audit
#
# Break-glass (skip in CI):
#   Add "redirect-check-skip" label to the PR, OR
#   Add <!-- redirect-check: skip --> to the PR body.
#   Skipped URLs are logged in hack/redirect-allowlist.txt with reason.
#
# Exit codes:
#   0 - All checks pass (or skipped via break-glass)
#   1 - Broken redirects found
set -eo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NETLIFY_TOML="${REPO_ROOT}/netlify.toml"
ALLOWLIST="${REPO_ROOT}/hack/redirect-allowlist.txt"
MODE="${1:-pr}"
ERRORS=0
WARNINGS=0
FIXED=0

# Colors (disabled in CI if NO_COLOR is set)
if [[ -z "${NO_COLOR:-}" && -t 1 ]]; then
    RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[0;33m'; BOLD='\033[1m'; NC='\033[0m'
else
    RED=''; GREEN=''; YELLOW=''; BOLD=''; NC=''
fi

error() { echo -e "${RED}ERROR:${NC} $*"; ERRORS=$((ERRORS + 1)); }
warn()  { echo -e "${YELLOW}WARN:${NC} $*"; WARNINGS=$((WARNINGS + 1)); }
ok()    { echo -e "${GREEN}OK:${NC} $*"; }
info()  { echo -e "  $*"; }
header() { echo -e "\n${BOLD}=== $* ===${NC}"; }

# --------------------------------------------------------------------------
# Allowlist: URLs that are known-ok to be "broken" (with documented reason)
# --------------------------------------------------------------------------
is_allowlisted() {
    local url="$1"
    [[ ! -f "$ALLOWLIST" ]] && return 1
    grep -qxF "$url" "$ALLOWLIST" 2>/dev/null
}

# --------------------------------------------------------------------------
# Parse netlify.toml: extract from->to pairs (tab-separated)
# --------------------------------------------------------------------------
parse_redirects() {
    python3 -c "
import re, sys

with open('${NETLIFY_TOML}') as f:
    content = f.read()

pattern = r'\[\[redirects\]\][^\[]*?from\s*=\s*\"([^\"]+)\"[^\[]*?to\s*=\s*\"([^\"]+)\"'
for m in re.finditer(pattern, content, re.DOTALL):
    print(f'{m.group(1)}\t{m.group(2)}')
"
}

# --------------------------------------------------------------------------
# Check if a URL path resolves to an actual file
# --------------------------------------------------------------------------
url_resolves() {
    local url="$1"

    [[ "$url" == http* ]] && return 0
    [[ "$url" == *":version"* || "$url" == *":splat"* ]] && return 0

    url="${url%%#*}"
    url="${url%/}"

    local rel="${url#/docs/}"

    # /next/ = current source
    case "$rel" in
        vcluster/next/*) rel="vcluster/${rel#vcluster/next/}" ;;
        platform/next/*) rel="platform/${rel#platform/next/}" ;;
    esac

    # Versioned paths -> versioned_docs folders
    local versioned_rel=""
    case "$rel" in
        vcluster/[0-9]*.*)
            local ver="${rel#vcluster/}"
            ver="${ver%%/*}"
            local rest="${rel#vcluster/${ver}/}"
            versioned_rel="vcluster_versioned_docs/version-${ver}/${rest}"
            ;;
        platform/[0-9]*.*)
            local ver="${rel#platform/}"
            ver="${ver%%/*}"
            local rest="${rel#platform/${ver}/}"
            versioned_rel="platform_versioned_docs/version-${ver}/${rest}"
            ;;
    esac

    local paths_to_check=("$rel")
    [[ -n "$versioned_rel" ]] && paths_to_check=("$versioned_rel")

    for base in "${paths_to_check[@]}"; do
        local full="${REPO_ROOT}/${base}"

        [[ -f "${full}.mdx" ]] && return 0
        [[ -f "${full}.md" ]] && return 0
        [[ -f "${full}/index.mdx" ]] && return 0
        [[ -f "${full}/index.md" ]] && return 0
        [[ -f "${full}/README.mdx" ]] && return 0
        [[ -f "${full}/_category_.json" ]] && return 0
        [[ -d "${full}" ]] && return 0
    done

    [[ "$rel" == */category/* ]] && return 0
    [[ -f "${REPO_ROOT}/static/${rel}" ]] && return 0

    return 1
}

# --------------------------------------------------------------------------
# Check if a URL is covered by an existing redirect (exact or wildcard)
# --------------------------------------------------------------------------
has_redirect_coverage() {
    local url="$1"

    is_allowlisted "$url" && return 0

    if grep -qxF "$url" <<<"$ALL_FROM_URLS"; then
        return 0
    fi

    while IFS= read -r pattern; do
        [[ "$pattern" != *"*"* ]] && continue
        if [[ "$pattern" == *'/*' && "$pattern" != *'*'*'*' ]]; then
            local prefix="${pattern%\*}"
            if [[ "$url" == "${prefix}"* ]]; then
                return 0
            fi
        fi
    done <<<"$ALL_FROM_URLS"

    return 1
}

file_to_url() {
    local url="$1"
    url="${url%.mdx}"
    url="${url%.md}"
    url="${url%/index}"
    echo "/docs/${url}"
}

get_base_ref() {
    local base_ref="${GITHUB_BASE_REF:-main}"
    if git rev-parse --verify "origin/${base_ref}" &>/dev/null; then
        echo "origin/${base_ref}"
    elif git rev-parse --verify "${base_ref}" &>/dev/null; then
        echo "${base_ref}"
    else
        echo ""
    fi
}

detect_changes() {
    local base_ref
    base_ref="$(get_base_ref)"
    if [[ -z "$base_ref" ]]; then
        warn "Cannot find base ref. Skipping change detection."
        DELETED_FILES=""
        RENAMED_OLD=""
        RENAMED_NEW=""
        return
    fi

    DELETED_FILES="$(git diff --name-status --diff-filter=D "${base_ref}"...HEAD -- \
        'vcluster/**/*.mdx' 'vcluster/**/*.md' \
        'platform/**/*.mdx' 'platform/**/*.md' 2>/dev/null | \
        awk '{print $2}' | \
        grep -v '/_' || true)"

    RENAMED_OLD=""
    RENAMED_NEW=""
    local rename_lines
    rename_lines="$(git diff --name-status -M50 --diff-filter=R "${base_ref}"...HEAD -- \
        'vcluster/**/*.mdx' 'vcluster/**/*.md' \
        'platform/**/*.mdx' 'platform/**/*.md' 2>/dev/null || true)"

    while IFS=$'\t' read -r status old_path new_path; do
        [[ -z "$status" ]] && continue
        RENAMED_OLD="${RENAMED_OLD}${old_path}"$'\n'
        RENAMED_NEW="${RENAMED_NEW}${new_path}"$'\n'
    done <<<"$rename_lines"

    ADDED_FILES="$(git diff --name-status --diff-filter=A "${base_ref}"...HEAD -- \
        'vcluster/**/*.mdx' 'vcluster/**/*.md' \
        'platform/**/*.mdx' 'platform/**/*.md' 2>/dev/null | \
        awk '{print $2}' | \
        grep -v '/_' || true)"

    # Build a map of sidebar_position -> added file path per directory,
    # so guess_destination can match a deleted file to its replacement by position.
    # Format: "dir/sidebar_pos=new_path" stored in ADDED_BY_POS
    ADDED_BY_POS=""
    while IFS= read -r added_path; do
        [[ -z "$added_path" ]] && continue
        local added_dir="${added_path%/*}"
        local pos
        pos="$(grep -m1 '^sidebar_position:' "${REPO_ROOT}/${added_path}" 2>/dev/null | awk '{print $2}')"
        [[ -n "$pos" ]] && ADDED_BY_POS="${ADDED_BY_POS}${added_dir}/${pos}=${added_path}"$'\n'
    done <<<"$ADDED_FILES"
}

append_redirect() {
    local from_url="$1" to_url="$2" comment="${3:-}"

    local insert_marker="# AUTO-GENERATED REDIRECTS START"
    local tempfile
    tempfile="$(mktemp)"

    if grep -qF "$insert_marker" "$NETLIFY_TOML"; then
        awk -v marker="$insert_marker" -v comment="$comment" \
            -v from="$from_url" -v to="$to_url" '
            $0 ~ marker {
                if (comment != "") print "# " comment
                print "[[redirects]]"
                print "  from = \"" from "\""
                print "  to = \"" to "\""
                print "  status = 301"
                print ""
            }
            { print }
        ' "$NETLIFY_TOML" > "$tempfile"
    else
        cp "$NETLIFY_TOML" "$tempfile"
        {
            echo ""
            [[ -n "$comment" ]] && echo "# $comment"
            echo "[[redirects]]"
            echo "  from = \"${from_url}\""
            echo "  to = \"${to_url}\""
            echo "  status = 301"
        } >> "$tempfile"
    fi

    mv "$tempfile" "$NETLIFY_TOML"
    FIXED=$((FIXED + 1))
}

guess_destination() {
    local filepath="$1"
    local base_ref="$2"
    local url
    url="$(file_to_url "$filepath")"
    local dir="${filepath%/*}"
    local parent_url="${url%/*}"
    local parent_path="${parent_url#/docs/}"

    # Match by sidebar_position: find the added file in the same dir with the same position
    local pos
    pos="$(git show "${base_ref}:${filepath}" 2>/dev/null | grep -m1 '^sidebar_position:' | awk '{print $2}')"
    if [[ -n "$pos" ]]; then
        local match
        match="$(grep "^${dir}/${pos}=" <<<"$ADDED_BY_POS" | head -1 | cut -d= -f2-)"
        if [[ -n "$match" ]]; then
            file_to_url "$match"
            return
        fi
    fi

    # Fallback: if exactly one file was added in the same directory, redirect there
    local siblings
    siblings="$(grep "^${dir}/" <<<"$ADDED_FILES" 2>/dev/null || true)"
    local sibling_count
    sibling_count="$(echo "$siblings" | grep -c . || true)"
    if [[ "$sibling_count" -eq 1 ]]; then
        file_to_url "$(echo "$siblings" | tr -d '[:space:]')"
        return
    fi

    if [[ -f "${REPO_ROOT}/${parent_path}/index.mdx" ]] || \
       [[ -f "${REPO_ROOT}/${parent_path}/_category_.json" ]] || \
       [[ -d "${REPO_ROOT}/${parent_path}" ]]; then
        echo "${parent_url}"
        return
    fi

    case "$filepath" in
        vcluster/*) echo "/docs/vcluster" ;;
        platform/*) echo "/docs/platform" ;;
        *) echo "/docs/vcluster" ;;
    esac
}

# --------------------------------------------------------------------------
# CHECK A: Deleted/renamed files in PR need redirects
# --------------------------------------------------------------------------
check_pr_deletions() {
    header "Check A: Deleted/renamed files need redirects"
    detect_changes

    local count=0
    local missing=0

    while IFS= read -r filepath; do
        [[ -z "$filepath" ]] && continue
        count=$((count + 1))
        local url
        url="$(file_to_url "$filepath")"

        if has_redirect_coverage "$url"; then
            ok "Redirect exists for deleted: $filepath"
        else
            missing=$((missing + 1))
            error "No redirect for deleted file: $filepath"
            info ""
            info "URL that will 404: $url"
            info ""
            info "Run: ${BOLD}npm run fix-redirects${NC}"
            info ""
        fi
    done <<<"$DELETED_FILES"

    local i=0
    while IFS= read -r old_path; do
        [[ -z "$old_path" ]] && continue
        local url
        url="$(file_to_url "$old_path")"
        if has_redirect_coverage "$url"; then
            ok "Redirect exists for renamed: $old_path"
        else
            error "No redirect for renamed file: $old_path"
            info "Run: ${BOLD}npm run fix-redirects${NC}"
            info ""
        fi
        i=$((i + 1))
    done <<<"$RENAMED_OLD"

    if [[ $count -eq 0 && -z "$RENAMED_OLD" ]]; then
        ok "No doc files deleted or renamed in this PR."
    elif [[ $missing -eq 0 ]]; then
        ok "All $count deleted files have redirect coverage."
    fi
}

# --------------------------------------------------------------------------
# CHECK B: Platform-UI-link targets resolve to real files
# --------------------------------------------------------------------------
check_platform_ui_targets() {
    header "Check B: Platform-UI-link redirect targets resolve"
    local count=0
    local broken=0

    while IFS=$'\t' read -r from_url to_url; do
        [[ "$from_url" != /docs/platform-ui-link/* ]] && continue
        [[ "$to_url" == *":version"* || "$to_url" == *":splat"* ]] && continue
        count=$((count + 1))

        if is_allowlisted "$to_url"; then
            :
        elif url_resolves "$to_url"; then
            :
        else
            broken=$((broken + 1))
            error "Platform-UI-link broken: $from_url"
            info "Points to: $to_url"
            info "But that file does not exist!"
            info ""
            info "This link is hardcoded in the Platform UI."
            info "Update the 'to' value in netlify.toml to the correct path."
            info ""
        fi
    done < <(parse_redirects)

    if [[ $broken -eq 0 ]]; then
        ok "All $count platform-ui-link targets resolve."
    else
        error "$broken of $count platform-ui-link targets are broken."
    fi
}

# --------------------------------------------------------------------------
# CHECK C: All redirect targets resolve (audit mode)
# --------------------------------------------------------------------------
check_all_targets() {
    header "Check C: All redirect targets resolve"
    local count=0 broken=0 ui_broken=0 other_broken=0

    while IFS=$'\t' read -r from_url to_url; do
        [[ "$to_url" == *":version"* || "$to_url" == *":splat"* ]] && continue
        [[ "$to_url" == http* ]] && continue
        count=$((count + 1))

        if is_allowlisted "$to_url"; then
            :
        elif url_resolves "$to_url"; then
            :
        else
            broken=$((broken + 1))
            if [[ "$from_url" == /docs/platform-ui-link/* ]]; then
                echo "  CRITICAL (platform-ui-link): ${from_url}"
                ui_broken=$((ui_broken + 1))
            else
                echo "  OTHER: ${from_url}"
                other_broken=$((other_broken + 1))
            fi
            echo "    -> ${to_url}  (FILE NOT FOUND)"
        fi
    done < <(parse_redirects)

    echo ""
    if [[ $broken -eq 0 ]]; then
        ok "All $count redirect targets resolve."
    else
        echo "Summary: $broken broken of $count checked"
        [[ $ui_broken -gt 0 ]] && error "$ui_broken CRITICAL platform-ui-link targets broken"
        [[ $other_broken -gt 0 ]] && warn "$other_broken other redirect targets broken"
    fi
}

# --------------------------------------------------------------------------
# CHECK D: Redirect chains (to -> from -> to)
# --------------------------------------------------------------------------
check_chains() {
    header "Check D: Redirect chains"
    local chains=0
    local from_set
    from_set="$(parse_redirects | cut -f1 | sort -u)"

    while IFS=$'\t' read -r from_url to_url; do
        [[ "$to_url" == http* ]] && continue
        [[ "$to_url" == *":version"* || "$to_url" == *":splat"* ]] && continue
        local to_clean="${to_url%%#*}"
        to_clean="${to_clean%/}"

        if grep -qxF "$to_clean" <<<"$from_set"; then
            chains=$((chains + 1))
            if [[ "$from_url" == /docs/platform-ui-link/* ]]; then
                error "Platform-UI-link chain: $from_url -> $to_url -> (another redirect)"
            else
                warn "Redirect chain: $from_url -> $to_url -> (another redirect)"
            fi
        fi
    done < <(parse_redirects)

    if [[ $chains -eq 0 ]]; then
        ok "No redirect chains detected."
    fi
}

# --------------------------------------------------------------------------
# FIX MODE: Auto-generate missing redirects
# --------------------------------------------------------------------------
fix_redirects() {
    header "Fix: Auto-generating missing redirects"
    detect_changes

    local i=0
    while IFS= read -r old_path; do
        [[ -z "$old_path" ]] && continue
        local new_path
        new_path="$(echo "$RENAMED_NEW" | sed -n "$((i + 1))p")"
        [[ -z "$new_path" ]] && { i=$((i + 1)); continue; }

        local old_url new_url
        old_url="$(file_to_url "$old_path")"
        new_url="$(file_to_url "$new_path")"

        if has_redirect_coverage "$old_url"; then
            ok "Already covered: $old_path"
        else
            append_redirect "$old_url" "$new_url" "Renamed: $old_path -> $new_path"
            ok "Added redirect: $old_url -> $new_url"
        fi
        i=$((i + 1))
    done <<<"$RENAMED_OLD"

    while IFS= read -r filepath; do
        [[ -z "$filepath" ]] && continue
        local url
        url="$(file_to_url "$filepath")"

        if has_redirect_coverage "$url"; then
            ok "Already covered: $filepath"
        else
            local dest base_ref
            base_ref="$(get_base_ref)"
            dest="$(guess_destination "$filepath" "$base_ref")"
            if [[ "$dest" == */$(basename "${filepath%.mdx}") || "$dest" == */$(basename "${filepath%.md}") ]]; then
                append_redirect "$url" "$dest" "Renamed: $filepath"
                ok "Added redirect: $url -> $dest"
            else
                append_redirect "$url" "$dest" "Deleted: $filepath — TODO: verify destination"
                warn "Added redirect: $url -> $dest  (verify destination!)"
            fi
        fi
    done <<<"$DELETED_FILES"

    if [[ $FIXED -eq 0 ]]; then
        ok "Nothing to fix. All changes already have redirects."
    else
        echo ""
        echo -e "${GREEN}${BOLD}Fixed $FIXED redirect(s)${NC} in netlify.toml"
        echo ""
        echo "Next steps:"
        echo "  1. Review the added redirects (search for TODO in netlify.toml)"
        echo "  2. git add netlify.toml"
        echo "  3. git commit --amend (or new commit)"
    fi
}

# --------------------------------------------------------------------------
# Main
# --------------------------------------------------------------------------
cd "$REPO_ROOT"

ALL_FROM_URLS="$(parse_redirects | cut -f1)"

echo "Redirect Checker for vcluster-docs"
echo "Mode: ${MODE}"
echo ""

case "$MODE" in
    pr)
        check_pr_deletions
        check_platform_ui_targets
        check_chains
        ;;
    --fix|fix)
        fix_redirects
        ALL_FROM_URLS="$(parse_redirects | cut -f1)"
        check_platform_ui_targets
        ;;
    --audit|audit)
        check_all_targets
        check_chains
        ;;
    *)
        echo "Usage: $0 [pr|--fix|--audit]"
        echo ""
        echo "  pr       Check PR for missing redirects (default, used in CI)"
        echo "  --fix    Auto-generate missing redirects for moved/deleted files"
        echo "  --audit  Validate ALL redirect targets against the file tree"
        exit 1
        ;;
esac

header "Summary"
echo "Errors:   $ERRORS"
echo "Warnings: $WARNINGS"
[[ $FIXED -gt 0 ]] && echo "Fixed:    $FIXED"

if [[ $ERRORS -gt 0 ]]; then
    echo ""
    echo -e "${RED}${BOLD}FAILED${NC} — $ERRORS error(s) found."
    [[ "$MODE" == "pr" ]] && echo "Run: npm run fix-redirects"
    exit 1
elif [[ $WARNINGS -gt 0 ]]; then
    echo ""
    echo -e "${YELLOW}PASSED with warnings${NC} — $WARNINGS warning(s)."
    exit 0
else
    echo ""
    echo -e "${GREEN}${BOLD}PASSED${NC} — All checks clean."
    exit 0
fi
