#!/usr/bin/env bash
# check-redirects_test.sh — Tests for check-redirects.sh
#
# Creates isolated git repos to prove the redirect checker works
# under various real-world scenarios.
#
# Usage: bash hack/check-redirects_test.sh
# No set -e: tests must handle exit codes themselves

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SCRIPT_UNDER_TEST="${SCRIPT_DIR}/check-redirects.sh"
PASS=0
FAIL=0
TESTS_RUN=0
ORIGINAL_DIR="$(pwd)"

if [[ -t 1 ]]; then
    RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[0;33m'; BOLD='\033[1m'; NC='\033[0m'
else
    RED=''; GREEN=''; YELLOW=''; BOLD=''; NC=''
fi

# --- Harness ---

setup_test_repo() {
    local test_dir
    test_dir="$(mktemp -d)"
    git init -q "$test_dir"
    git -C "$test_dir" config user.email "test@test.com"
    git -C "$test_dir" config user.name "Test"
    mkdir -p "$test_dir"/{vcluster/configure,vcluster/introduction,vcluster/deploy}
    mkdir -p "$test_dir"/{platform/understand,platform/configure,platform/administer}
    mkdir -p "$test_dir"/hack
    cp "$SCRIPT_UNDER_TEST" "$test_dir/hack/check-redirects.sh"
    chmod +x "$test_dir/hack/check-redirects.sh"
    touch "$test_dir/hack/redirect-allowlist.txt"
    echo "$test_dir"
}

seal_initial_state() {
    git add -A && git commit -q -m "initial state on main"
    git checkout -q -b feature
}

create_netlify_toml() {
    cat > netlify.toml <<'TOML'
[build]
base = "/"
TOML
}

add_redirect() {
    cat >> netlify.toml <<EOF

[[redirects]]
  from = "${1}"
  to = "${2}"
  status = 301
EOF
}

commit_all() { git add -A && git commit -q -m "${1:-commit}"; }

cleanup() { cd "$ORIGINAL_DIR" && rm -rf "$1"; }

assert_exit() {
    local expected="$1" actual="$2" name="$3"
    TESTS_RUN=$((TESTS_RUN + 1))
    if [[ "$actual" -eq "$expected" ]]; then
        echo -e "${GREEN}PASS${NC}: $name (exit=$actual)"; PASS=$((PASS + 1))
    else
        echo -e "${RED}FAIL${NC}: $name (expected=$expected, got=$actual)"; FAIL=$((FAIL + 1))
    fi
}

assert_contains() {
    local output="$1" pattern="$2" name="$3"
    TESTS_RUN=$((TESTS_RUN + 1))
    if echo "$output" | grep -qF "$pattern"; then
        echo -e "${GREEN}PASS${NC}: $name"; PASS=$((PASS + 1))
    else
        echo -e "${RED}FAIL${NC}: $name — expected: $pattern"; FAIL=$((FAIL + 1))
    fi
}

assert_not_contains() {
    local output="$1" pattern="$2" name="$3"
    TESTS_RUN=$((TESTS_RUN + 1))
    if echo "$output" | grep -qF "$pattern"; then
        echo -e "${RED}FAIL${NC}: $name — should NOT contain: $pattern"; FAIL=$((FAIL + 1))
    else
        echo -e "${GREEN}PASS${NC}: $name"; PASS=$((PASS + 1))
    fi
}

# Capture output; always returns 0. Use run_script_rc for exit code tests.
run_script() { NO_COLOR=1 bash hack/check-redirects.sh "$@" 2>&1 || true; }
run_script_rc() { NO_COLOR=1 bash hack/check-redirects.sh "$@" 2>&1; }


echo -e "${BOLD}=== check-redirects.sh Test Suite ===${NC}"

# =========================================================================
echo -e "\n${BOLD}--- url_resolves ---${NC}"
# =========================================================================

test_resolves_mdx() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    echo "# T" > vcluster/configure/tenancy-model.mdx
    create_netlify_toml
    add_redirect "/docs/platform-ui-link/vcluster/t" "/docs/vcluster/configure/tenancy-model"
    commit_all
    local out; out=$(run_script --audit)
    assert_not_contains "$out" "FILE NOT FOUND" "resolves .mdx file"
    cleanup "$dir"
}; test_resolves_mdx

test_resolves_index() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    mkdir -p vcluster/configure/vcluster-yaml
    echo "# I" > vcluster/configure/vcluster-yaml/index.mdx
    create_netlify_toml
    add_redirect "/docs/old" "/docs/vcluster/configure/vcluster-yaml"
    commit_all
    local out; out=$(run_script --audit)
    assert_not_contains "$out" "FILE NOT FOUND" "resolves index.mdx"
    cleanup "$dir"
}; test_resolves_index

test_resolves_category() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    create_netlify_toml
    add_redirect "/docs/old" "/docs/vcluster/category/components"
    commit_all
    local out; out=$(run_script --audit)
    assert_not_contains "$out" "FILE NOT FOUND" "resolves /category/ auto-page"
    cleanup "$dir"
}; test_resolves_category

test_resolves_next() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    echo "# N" > vcluster/configure/tenancy-model.mdx
    create_netlify_toml
    add_redirect "/docs/old" "/docs/vcluster/next/configure/tenancy-model"
    commit_all
    local out; out=$(run_script --audit)
    assert_not_contains "$out" "FILE NOT FOUND" "resolves /next/ to current source"
    cleanup "$dir"
}; test_resolves_next

test_resolves_versioned() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    mkdir -p vcluster_versioned_docs/version-0.33.0/configure
    echo "# V" > vcluster_versioned_docs/version-0.33.0/configure/foo.mdx
    create_netlify_toml
    add_redirect "/docs/old" "/docs/vcluster/0.33.0/configure/foo"
    commit_all
    local out; out=$(run_script --audit)
    assert_not_contains "$out" "FILE NOT FOUND" "resolves versioned path"
    cleanup "$dir"
}; test_resolves_versioned

test_resolves_missing() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    create_netlify_toml
    add_redirect "/docs/old" "/docs/vcluster/does-not-exist"
    commit_all
    local out; out=$(run_script --audit)
    assert_contains "$out" "FILE NOT FOUND" "detects missing file"
    cleanup "$dir"
}; test_resolves_missing

test_resolves_external() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    create_netlify_toml
    add_redirect "/docs/old" "https://example.com/x"
    commit_all
    local out; out=$(run_script --audit)
    assert_not_contains "$out" "FILE NOT FOUND" "skips external URLs"
    cleanup "$dir"
}; test_resolves_external

test_resolves_splat() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    create_netlify_toml
    add_redirect "/docs/old/*" "/docs/vcluster/new/:splat"
    commit_all
    local out; out=$(run_script --audit)
    assert_not_contains "$out" "FILE NOT FOUND" "skips :splat placeholder"
    cleanup "$dir"
}; test_resolves_splat

test_resolves_fragment() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    echo "# F" > vcluster/configure/tenancy-model.mdx
    create_netlify_toml
    add_redirect "/docs/old" "/docs/vcluster/configure/tenancy-model#heading"
    commit_all
    local out; out=$(run_script --audit)
    assert_not_contains "$out" "FILE NOT FOUND" "strips fragment before check"
    cleanup "$dir"
}; test_resolves_fragment

# =========================================================================
echo -e "\n${BOLD}--- has_redirect_coverage ---${NC}"
# =========================================================================

test_coverage_exact() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    echo "# A" > vcluster/configure/tenancy-model.mdx
    echo "# B" > vcluster/introduction/architecture.mdx
    create_netlify_toml
    add_redirect "/docs/vcluster/configure/tenancy-model" "/docs/vcluster/introduction/architecture"
    seal_initial_state
    git rm -q vcluster/configure/tenancy-model.mdx; commit_all "del"
    local out; out=$(run_script pr)
    assert_contains "$out" "Redirect exists for deleted" "exact from-url match"
    cleanup "$dir"
}; test_coverage_exact

test_coverage_wildcard() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    echo "# A" > vcluster/configure/tenancy-model.mdx
    create_netlify_toml
    add_redirect "/docs/vcluster/configure/*" "/docs/vcluster/new/:splat"
    seal_initial_state
    git rm -q vcluster/configure/tenancy-model.mdx; commit_all "del"
    local out; out=$(run_script pr)
    assert_contains "$out" "Redirect exists for deleted" "wildcard covers deleted"
    cleanup "$dir"
}; test_coverage_wildcard

test_coverage_no_false_wildcard() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    echo "# A" > vcluster/introduction/architecture.mdx
    create_netlify_toml
    add_redirect "/docs/vcluster/configure/*" "/docs/vcluster/new/:splat"
    seal_initial_state
    git rm -q vcluster/introduction/architecture.mdx; commit_all "del"
    local out; out=$(run_script pr)
    assert_contains "$out" "No redirect for deleted" "wildcard does NOT cover different path"
    cleanup "$dir"
}; test_coverage_no_false_wildcard

test_coverage_no_substring() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    echo "# A" > vcluster/configure/tenancy-model.mdx
    create_netlify_toml
    add_redirect "/docs/platform-ui-link/vcluster/tenancy-model" "/docs/vcluster/configure/tenancy-model"
    seal_initial_state
    git rm -q vcluster/configure/tenancy-model.mdx; commit_all "del"
    local out; out=$(run_script pr)
    assert_contains "$out" "No redirect for deleted" "platform-ui-link from != deleted url"
    cleanup "$dir"
}; test_coverage_no_substring

# =========================================================================
echo -e "\n${BOLD}--- PR mode: deletions & renames ---${NC}"
# =========================================================================

test_pr_deleted() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    echo "# T" > vcluster/configure/tenancy-model.mdx
    create_netlify_toml; seal_initial_state
    git rm -q vcluster/configure/tenancy-model.mdx; commit_all "del"
    local out; out=$(run_script_rc pr); local ec=$?
    assert_exit 1 "$ec" "deleted file -> exit 1"
    assert_contains "$out" "No redirect for deleted file: vcluster/configure/tenancy-model.mdx" "names deleted file"
    assert_contains "$out" "/docs/vcluster/configure/tenancy-model" "shows 404 URL"
    assert_contains "$out" "npm run fix-redirects" "suggests fix command"
    cleanup "$dir"
}; test_pr_deleted

test_pr_renamed() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    echo "# O" > vcluster/configure/tenancy-model.mdx
    create_netlify_toml; seal_initial_state
    mkdir -p vcluster/introduction
    git mv vcluster/configure/tenancy-model.mdx vcluster/introduction/tenancy-model.mdx
    commit_all "rename"
    local out; out=$(run_script_rc pr); local ec=$?
    assert_exit 1 "$ec" "renamed file -> exit 1"
    assert_contains "$out" "No redirect for renamed" "reports renamed file"
    cleanup "$dir"
}; test_pr_renamed

test_pr_ignores_partials() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    mkdir -p vcluster/_partials
    echo "# P" > vcluster/_partials/some-partial.mdx
    create_netlify_toml; seal_initial_state
    git rm -q vcluster/_partials/some-partial.mdx; commit_all "del"
    local out; out=$(run_script_rc pr); local ec=$?
    assert_exit 0 "$ec" "ignores _partials -> exit 0"
    assert_contains "$out" "No doc files deleted" "_partials not reported"
    cleanup "$dir"
}; test_pr_ignores_partials

test_pr_no_changes() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    echo "# P" > vcluster/configure/tenancy-model.mdx
    create_netlify_toml; seal_initial_state
    echo "# Updated" >> vcluster/configure/tenancy-model.mdx; commit_all "edit"
    local out; out=$(run_script_rc pr); local ec=$?
    assert_exit 0 "$ec" "content-only edit -> exit 0"
    assert_contains "$out" "No doc files deleted or renamed" "no changes reported"
    cleanup "$dir"
}; test_pr_no_changes

# =========================================================================
echo -e "\n${BOLD}--- Platform-UI-link validation ---${NC}"
# =========================================================================

test_ui_valid() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    echo "# P" > vcluster/configure/tenancy-model.mdx
    create_netlify_toml
    add_redirect "/docs/platform-ui-link/vcluster/t" "/docs/vcluster/configure/tenancy-model"
    seal_initial_state
    local out; out=$(run_script pr)
    assert_contains "$out" "platform-ui-link targets resolve" "valid target passes"
    cleanup "$dir"
}; test_ui_valid

test_ui_broken() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    create_netlify_toml
    add_redirect "/docs/platform-ui-link/vcluster/t" "/docs/vcluster/configure/tenancy-model"
    seal_initial_state
    local out; out=$(run_script_rc pr); local ec=$?
    assert_exit 1 "$ec" "broken ui-link -> exit 1"
    assert_contains "$out" "Platform-UI-link broken" "reports broken target"
    assert_contains "$out" "hardcoded in the Platform UI" "warns about product impact"
    cleanup "$dir"
}; test_ui_broken

# =========================================================================
echo -e "\n${BOLD}--- Chain detection ---${NC}"
# =========================================================================

test_chain_warn() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    echo "# C" > vcluster/deploy/new-page.mdx
    create_netlify_toml
    add_redirect "/docs/vcluster/old-a" "/docs/vcluster/old-b"
    add_redirect "/docs/vcluster/old-b" "/docs/vcluster/deploy/new-page"
    seal_initial_state
    local out; out=$(run_script pr)
    assert_contains "$out" "Redirect chain:" "detects A->B->C chain"
    cleanup "$dir"
}; test_chain_warn

test_chain_ui_error() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    echo "# F" > vcluster/deploy/final.mdx
    echo "# M" > vcluster/deploy/middle.mdx
    create_netlify_toml
    add_redirect "/docs/platform-ui-link/vcluster/thing" "/docs/vcluster/deploy/middle"
    add_redirect "/docs/vcluster/deploy/middle" "/docs/vcluster/deploy/final"
    seal_initial_state
    local out; out=$(run_script_rc pr); local ec=$?
    assert_exit 1 "$ec" "ui-link chain -> exit 1"
    assert_contains "$out" "Platform-UI-link chain" "flags ui-link chains as errors"
    cleanup "$dir"
}; test_chain_ui_error

# =========================================================================
echo -e "\n${BOLD}--- Allowlist ---${NC}"
# =========================================================================

test_allowlist_skips() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    create_netlify_toml
    add_redirect "/docs/old" "/docs/vcluster/does-not-exist"
    echo "/docs/vcluster/does-not-exist" > hack/redirect-allowlist.txt
    commit_all
    local out; out=$(run_script_rc --audit); local ec=$?
    assert_exit 0 "$ec" "allowlisted URL passes"
    assert_not_contains "$out" "FILE NOT FOUND" "no broken report"
    cleanup "$dir"
}; test_allowlist_skips

test_allowlist_selective() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    create_netlify_toml
    add_redirect "/docs/old" "/docs/vcluster/does-not-exist"
    add_redirect "/docs/old2" "/docs/vcluster/also-missing"
    echo "/docs/vcluster/does-not-exist" > hack/redirect-allowlist.txt
    commit_all
    local out; out=$(run_script --audit)
    assert_contains "$out" "also-missing" "non-listed still reported"
    assert_not_contains "$out" "does-not-exist" "listed URL suppressed"
    cleanup "$dir"
}; test_allowlist_selective

# =========================================================================
echo -e "\n${BOLD}--- Fix mode ---${NC}"
# =========================================================================

test_fix_rename() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    echo "# P" > vcluster/configure/tenancy-model.mdx
    create_netlify_toml; seal_initial_state
    mkdir -p vcluster/introduction
    git mv vcluster/configure/tenancy-model.mdx vcluster/introduction/tenancy-model.mdx
    commit_all "rename"
    local out; out=$(run_script --fix)
    assert_contains "$out" "Added redirect" "reports added redirect"
    local toml; toml="$(cat netlify.toml)"
    assert_contains "$toml" "/docs/vcluster/configure/tenancy-model" "from-url in toml"
    assert_contains "$toml" "/docs/vcluster/introduction/tenancy-model" "to-url is new location"
    cleanup "$dir"
}; test_fix_rename

test_fix_delete() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    echo "# P" > vcluster/configure/tenancy-model.mdx
    create_netlify_toml; seal_initial_state
    git rm -q vcluster/configure/tenancy-model.mdx; commit_all "del"
    local out; out=$(run_script --fix)
    assert_contains "$out" "Added redirect" "reports added redirect"
    assert_contains "$out" "verify destination" "warns to verify"
    local toml; toml="$(cat netlify.toml)"
    assert_contains "$toml" 'from = "/docs/vcluster/configure/tenancy-model"' "from-url written"
    # Parent dir removed by git, falls back to product root
    assert_contains "$toml" 'to = "/docs/vcluster"' "to-url falls back to product root"
    cleanup "$dir"
}; test_fix_delete

test_fix_already_covered() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    echo "# A" > vcluster/configure/tenancy-model.mdx
    echo "# B" > vcluster/introduction/architecture.mdx
    create_netlify_toml
    add_redirect "/docs/vcluster/configure/tenancy-model" "/docs/vcluster/introduction/architecture"
    seal_initial_state
    git rm -q vcluster/configure/tenancy-model.mdx; commit_all "del"
    local out; out=$(run_script --fix)
    assert_contains "$out" "Already covered" "skips covered file"
    assert_contains "$out" "Nothing to fix" "nothing-to-fix message"
    cleanup "$dir"
}; test_fix_already_covered

# =========================================================================
echo -e "\n${BOLD}--- Audit mode ---${NC}"
# =========================================================================

test_audit_clean() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    echo "# P" > vcluster/configure/tenancy-model.mdx
    create_netlify_toml
    add_redirect "/docs/old" "/docs/vcluster/configure/tenancy-model"
    commit_all
    local out; out=$(run_script_rc --audit); local ec=$?
    assert_exit 0 "$ec" "clean repo -> exit 0"
    cleanup "$dir"
}; test_audit_clean

test_audit_broken() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    create_netlify_toml
    add_redirect "/docs/old" "/docs/vcluster/missing-page"
    add_redirect "/docs/old2" "/docs/platform/also-missing"
    commit_all
    local out; out=$(run_script --audit)
    assert_contains "$out" "2 broken of 2 checked" "counts broken"
    assert_contains "$out" "missing-page" "reports first broken"
    assert_contains "$out" "also-missing" "reports second broken"
    cleanup "$dir"
}; test_audit_broken

test_audit_ui_critical() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    create_netlify_toml
    add_redirect "/docs/platform-ui-link/vcluster/broken" "/docs/vcluster/gone"
    commit_all
    local out; out=$(run_script_rc --audit); local ec=$?
    assert_exit 1 "$ec" "broken ui-link -> exit 1"
    assert_contains "$out" "CRITICAL (platform-ui-link)" "marked CRITICAL"
    cleanup "$dir"
}; test_audit_ui_critical

# =========================================================================
echo -e "\n${BOLD}--- Edge cases ---${NC}"
# =========================================================================

test_multiple_deletes() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    echo "# A" > vcluster/configure/tenancy-model.mdx
    echo "# B" > vcluster/introduction/architecture.mdx
    echo "# C" > platform/understand/what-are-projects.mdx
    create_netlify_toml; seal_initial_state
    git rm -q vcluster/configure/tenancy-model.mdx vcluster/introduction/architecture.mdx platform/understand/what-are-projects.mdx
    commit_all "del"
    local out; out=$(run_script pr)
    assert_contains "$out" "tenancy-model" "reports first"
    assert_contains "$out" "architecture" "reports second"
    assert_contains "$out" "what-are-projects" "reports third"
    cleanup "$dir"
}; test_multiple_deletes

test_delete_plus_add() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    echo "# Old" > vcluster/configure/tenancy-model.mdx
    create_netlify_toml; seal_initial_state
    git rm -q vcluster/configure/tenancy-model.mdx
    mkdir -p vcluster/configure
    echo "# New unrelated" > vcluster/configure/brand-new-page.mdx
    git add vcluster/configure/brand-new-page.mdx; commit_all "del+add"
    local out; out=$(run_script_rc pr); local ec=$?
    assert_exit 1 "$ec" "delete+add different -> exit 1"
    assert_contains "$out" "tenancy-model" "reports deleted file"
    cleanup "$dir"
}; test_delete_plus_add

# =========================================================================
echo -e "\n${BOLD}=== Results ===${NC}"
echo "Total: $TESTS_RUN  Pass: $PASS  Fail: $FAIL"
if [[ $FAIL -gt 0 ]]; then
    echo -e "${RED}${BOLD}SOME TESTS FAILED${NC}"; exit 1
else
    echo -e "${GREEN}${BOLD}ALL TESTS PASSED${NC}"; exit 0
fi
