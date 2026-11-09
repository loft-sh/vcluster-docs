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

write_docusaurus_config() {
    local vcluster_version="$1" platform_version="$2"
    cat > docusaurus.config.js <<EOF
module.exports = {
  plugins: [
    ["@docusaurus/plugin-content-docs", {
      id: "vcluster",
      lastVersion: "${vcluster_version}",
    }],
    ["@docusaurus/plugin-content-docs", {
      id: "platform",
      lastVersion: "${platform_version}",
    }],
  ],
};
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

test_resolves_unversioned_from_stable() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    mkdir -p platform_versioned_docs/version-4.12.0/administer/node-providers
    echo "# Stable" > platform_versioned_docs/version-4.12.0/administer/node-providers/overview.mdx
    cat > docusaurus.config.js <<'JS'
module.exports = {
  plugins: [["@docusaurus/plugin-content-docs", {
    id: "platform",
    lastVersion: "4.12.0",
  }]],
};
JS
    create_netlify_toml
    add_redirect "/docs/platform-ui-link/platform/t" "/docs/platform/administer/node-providers/overview"
    commit_all
    local out; out=$(run_script --audit)
    assert_not_contains "$out" "FILE NOT FOUND" "resolves unversioned path from configured stable version"
    cleanup "$dir"
}; test_resolves_unversioned_from_stable

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
    add_redirect "/docs/vcluster/next/configure/tenancy-model" "/docs/vcluster/next/introduction/architecture"
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
    add_redirect "/docs/vcluster/next/configure/*" "/docs/vcluster/next/new/:splat"
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
    add_redirect "/docs/vcluster/next/configure/*" "/docs/vcluster/next/new/:splat"
    seal_initial_state
    git rm -q vcluster/introduction/architecture.mdx; commit_all "del"
    local out; out=$(run_script pr)
    assert_contains "$out" "No redirect for deleted" "wildcard does NOT cover different path"
    cleanup "$dir"
}; test_coverage_no_false_wildcard

test_coverage_ignores_404_catchall() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    echo "# A" > vcluster/configure/tenancy-model.mdx
    create_netlify_toml
    add_redirect "/*" "/docs/404"
    seal_initial_state
    git rm -q vcluster/configure/tenancy-model.mdx; commit_all "del"
    local out; out=$(run_script_rc pr); local ec=$?
    assert_exit 1 "$ec" "404 catch-all does not cover deleted page"
    assert_contains "$out" "No redirect for deleted" "404 catch-all ignored for coverage"
    cleanup "$dir"
}; test_coverage_ignores_404_catchall

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
    assert_contains "$out" "/docs/vcluster/next/configure/tenancy-model" "shows 404 URL"
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

test_pr_readme_to_overview_with_slug() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    mkdir -p vcluster/configure/networking
    printf -- '---\ntitle: Networking\n---\n# N\n' > vcluster/configure/networking/README.mdx
    create_netlify_toml; seal_initial_state
    git mv vcluster/configure/networking/README.mdx vcluster/configure/networking/overview.mdx
    printf -- '---\ntitle: Networking\nslug: /configure/networking\n---\n# N\n' > vcluster/configure/networking/overview.mdx
    commit_all "readme to overview"
    local out; out=$(run_script_rc pr); local ec=$?
    assert_exit 0 "$ec" "README.mdx -> overview.mdx with matching slug -> exit 0"
    assert_contains "$out" "URL unchanged for renamed" "reports unchanged URL"
    cleanup "$dir"
}; test_pr_readme_to_overview_with_slug

test_pr_deleted_slug_served_by_new_file() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    mkdir -p vcluster/quick-start
    printf -- '---\ntitle: Start Here\nslug: /\n---\n# S\n' > vcluster/quick-start/overview.mdx
    create_netlify_toml; seal_initial_state
    git rm -q vcluster/quick-start/overview.mdx
    mkdir -p vcluster/overview
    printf -- '---\ntitle: Start Here\nslug: /\n---\n# Rewritten landing page with different content\n' > vcluster/overview/start-here.mdx
    commit_all "move landing page and rewrite it"
    local out; out=$(run_script_rc pr); local ec=$?
    assert_exit 0 "$ec" "deleted page whose slug a new page serves -> exit 0"
    assert_contains "$out" "URL still served after delete" "reports URL still served"
    cleanup "$dir"
}; test_pr_deleted_slug_served_by_new_file

test_pr_deleted_slug_not_served() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    mkdir -p vcluster/quick-start
    printf -- '---\ntitle: Old\nslug: /old-landing\n---\n# O\n' > vcluster/quick-start/overview.mdx
    create_netlify_toml; seal_initial_state
    git rm -q vcluster/quick-start/overview.mdx
    commit_all "delete slugged page"
    local out; out=$(run_script_rc pr); local ec=$?
    assert_exit 1 "$ec" "deleted slugged page with no new owner -> exit 1"
    cleanup "$dir"
}; test_pr_deleted_slug_not_served

test_pr_deleted_readme_uses_folder_url() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    mkdir -p vcluster/configure/old-section
    echo "# O" > vcluster/configure/old-section/README.mdx
    create_netlify_toml; seal_initial_state
    git rm -q vcluster/configure/old-section/README.mdx
    add_redirect "/docs/vcluster/next/configure/old-section" "/docs/vcluster/next/configure"
    commit_all "delete readme"
    local out; out=$(run_script_rc pr); local ec=$?
    assert_exit 0 "$ec" "deleted README.mdx covered by its folder URL -> exit 0"
    cleanup "$dir"
}; test_pr_deleted_readme_uses_folder_url

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
echo -e "\n${BOLD}--- Stable-version cutovers ---${NC}"
# =========================================================================

test_stable_cutover_requires_unversioned_redirects() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    mkdir -p vcluster_versioned_docs/version-0.37.0/configure
    mkdir -p platform_versioned_docs/version-4.12.0/administer
    echo "# Old vCluster" > vcluster_versioned_docs/version-0.37.0/configure/old-page.mdx
    echo "# Old Platform" > platform_versioned_docs/version-4.12.0/administer/old-page.mdx
    write_docusaurus_config "0.37.0" "4.12.0"
    create_netlify_toml; seal_initial_state

    mkdir -p vcluster_versioned_docs/version-0.38.0/configure
    mkdir -p platform_versioned_docs/version-4.13.0/administer
    echo "# New vCluster" > vcluster_versioned_docs/version-0.38.0/configure/new-page.mdx
    echo "# New Platform" > platform_versioned_docs/version-4.13.0/administer/new-page.mdx
    write_docusaurus_config "0.38.0" "4.13.0"
    commit_all "release cutover"

    local out; out=$(run_script_rc pr); local ec=$?
    assert_exit 1 "$ec" "stable cutover without redirects -> exit 1"
    assert_contains "$out" "/docs/vcluster/configure/old-page" "reports removed vCluster stable route"
    assert_contains "$out" "/docs/platform/administer/old-page" "reports removed Platform stable route"
    cleanup "$dir"
}; test_stable_cutover_requires_unversioned_redirects

test_stable_cutover_accepts_unversioned_redirects() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    mkdir -p vcluster_versioned_docs/version-0.37.0/configure
    mkdir -p platform_versioned_docs/version-4.12.0/administer
    echo "# Old vCluster" > vcluster_versioned_docs/version-0.37.0/configure/old-page.mdx
    echo "# Old Platform" > platform_versioned_docs/version-4.12.0/administer/old-page.mdx
    write_docusaurus_config "0.37.0" "4.12.0"
    create_netlify_toml; seal_initial_state

    mkdir -p vcluster_versioned_docs/version-0.38.0/configure
    mkdir -p platform_versioned_docs/version-4.13.0/administer
    echo "# New vCluster" > vcluster_versioned_docs/version-0.38.0/configure/new-page.mdx
    echo "# New Platform" > platform_versioned_docs/version-4.13.0/administer/new-page.mdx
    write_docusaurus_config "0.38.0" "4.13.0"
    add_redirect "/docs/vcluster/configure/old-page" "/docs/vcluster/configure/new-page"
    add_redirect "/docs/platform/administer/old-page" "/docs/platform/administer/new-page"
    commit_all "release cutover with redirects"

    local out; out=$(run_script_rc pr); local ec=$?
    assert_exit 0 "$ec" "stable cutover with redirects -> exit 0"
    assert_contains "$out" "All 1 removed vcluster stable routes have unversioned redirects" "accepts vCluster redirect"
    assert_contains "$out" "All 1 removed platform stable routes have unversioned redirects" "accepts Platform redirect"
    cleanup "$dir"
}; test_stable_cutover_accepts_unversioned_redirects

test_stable_cutover_accepts_wildcard_redirect() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    mkdir -p platform_versioned_docs/version-4.12.0/administer/legacy
    echo "# Old Platform" > platform_versioned_docs/version-4.12.0/administer/legacy/page.mdx
    write_docusaurus_config "0.37.0" "4.12.0"
    create_netlify_toml; seal_initial_state

    mkdir -p platform_versioned_docs/version-4.13.0/vmetal
    echo "# New Platform" > platform_versioned_docs/version-4.13.0/vmetal/page.mdx
    write_docusaurus_config "0.37.0" "4.13.0"
    add_redirect "/docs/platform/administer/legacy/*" "/docs/platform/vmetal/:splat"
    commit_all "release cutover with wildcard redirect"

    local out; out=$(run_script_rc pr); local ec=$?
    assert_exit 0 "$ec" "stable cutover with wildcard redirect -> exit 0"
    assert_contains "$out" "/docs/platform/vmetal/page" "resolves wildcard target"
    cleanup "$dir"
}; test_stable_cutover_accepts_wildcard_redirect

test_stable_cutover_rejects_broken_redirect_target() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    mkdir -p platform_versioned_docs/version-4.12.0/administer
    echo "# Old Platform" > platform_versioned_docs/version-4.12.0/administer/old-page.mdx
    write_docusaurus_config "0.37.0" "4.12.0"
    create_netlify_toml; seal_initial_state

    mkdir -p platform_versioned_docs/version-4.13.0/administer
    echo "# New Platform" > platform_versioned_docs/version-4.13.0/administer/new-page.mdx
    write_docusaurus_config "0.37.0" "4.13.0"
    add_redirect "/docs/platform/administer/old-page" "/docs/platform/administer/missing-page"
    commit_all "release cutover with broken redirect"

    local out; out=$(run_script_rc pr); local ec=$?
    assert_exit 1 "$ec" "stable cutover with broken target -> exit 1"
    assert_contains "$out" "Broken unversioned redirect" "reports broken stable redirect"
    assert_contains "$out" "/docs/platform/administer/missing-page" "reports broken stable target"
    cleanup "$dir"
}; test_stable_cutover_rejects_broken_redirect_target

test_stable_cutover_uses_frontmatter_slug() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    mkdir -p platform_versioned_docs/version-4.12.0/introduction
    cat > platform_versioned_docs/version-4.12.0/introduction/platform_intro.mdx <<'MDX'
---
slug: /
---
# Old Platform home
MDX
    write_docusaurus_config "0.37.0" "4.12.0"
    create_netlify_toml; seal_initial_state

    mkdir -p platform_versioned_docs/version-4.13.0/introduction
    echo "# New Platform" > platform_versioned_docs/version-4.13.0/introduction/new-home.mdx
    write_docusaurus_config "0.37.0" "4.13.0"
    commit_all "release cutover changing home route"

    local out; out=$(run_script_rc pr); local ec=$?
    assert_exit 1 "$ec" "stable cutover honors frontmatter slug -> exit 1"
    assert_contains "$out" "No unversioned redirect for route removed during platform stable cutover: /docs/platform" "reports slug URL instead of file path"
    assert_not_contains "$out" "platform_intro" "does not report file-based URL when slug is set"
    cleanup "$dir"
}; test_stable_cutover_uses_frontmatter_slug

test_stable_cutover_preserves_matching_routes() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    mkdir -p vcluster_versioned_docs/version-0.37.0/configure
    mkdir -p platform_versioned_docs/version-4.12.0/administer
    echo "# Old vCluster" > vcluster_versioned_docs/version-0.37.0/configure/same-page.mdx
    echo "# Old Platform" > platform_versioned_docs/version-4.12.0/administer/same-page.mdx
    write_docusaurus_config "0.37.0" "4.12.0"
    create_netlify_toml; seal_initial_state

    mkdir -p vcluster_versioned_docs/version-0.38.0/configure
    mkdir -p platform_versioned_docs/version-4.13.0/administer
    echo "# New vCluster" > vcluster_versioned_docs/version-0.38.0/configure/same-page.mdx
    echo "# New Platform" > platform_versioned_docs/version-4.13.0/administer/same-page.mdx
    write_docusaurus_config "0.38.0" "4.13.0"
    commit_all "release cutover preserving routes"

    local out; out=$(run_script_rc pr); local ec=$?
    assert_exit 0 "$ec" "stable cutover preserving routes -> exit 0"
    assert_contains "$out" "All vcluster 0.37.0 unversioned routes remain in 0.38.0" "recognizes preserved vCluster routes"
    assert_contains "$out" "All platform 4.12.0 unversioned routes remain in 4.13.0" "recognizes preserved Platform routes"
    cleanup "$dir"
}; test_stable_cutover_preserves_matching_routes

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
    assert_contains "$toml" "/docs/vcluster/next/configure/tenancy-model" "from-url in toml"
    assert_contains "$toml" "/docs/vcluster/next/introduction/tenancy-model" "to-url is new location"
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
    assert_contains "$toml" 'from = "/docs/vcluster/next/configure/tenancy-model"' "from-url written"
    # Parent dir removed by git, falls back to product root
    assert_contains "$toml" 'to = "/docs/vcluster/next"' "to-url falls back to product root"
    cleanup "$dir"
}; test_fix_delete

test_fix_already_covered() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    echo "# A" > vcluster/configure/tenancy-model.mdx
    echo "# B" > vcluster/introduction/architecture.mdx
    create_netlify_toml
    add_redirect "/docs/vcluster/next/configure/tenancy-model" "/docs/vcluster/next/introduction/architecture"
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
echo -e "\n${BOLD}--- Root docs (routeBasePath \"/\") ---${NC}"
# =========================================================================

# Root pages as the root plugin lays them out: a landing page with `slug: /`,
# a path-derived page, and a service page with a flattened `slug:`.
seed_root_docs() {
    mkdir -p docs/operator-patterns docs/services docs/_partials
    printf -- '---\ntitle: Home\nslug: /\n---\n# H\n' > docs/index.mdx
    echo "# O" > docs/operator-patterns/overview.mdx
    printf -- '---\ntitle: Internal\nslug: /internal-platforms-and-dev-clusters\n---\n# I\n' \
        > docs/services/internal-platforms-and-dev-clusters.mdx
}

test_root_resolves_path_route() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    seed_root_docs; create_netlify_toml
    add_redirect "/docs/old" "/docs/operator-patterns/overview"
    commit_all
    local out; out=$(run_script --audit)
    assert_not_contains "$out" "FILE NOT FOUND" "resolves path-derived root route"
    cleanup "$dir"
}; test_root_resolves_path_route

test_root_resolves_slug_route() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    seed_root_docs; create_netlify_toml
    add_redirect "/docs/old" "/docs/internal-platforms-and-dev-clusters"
    add_redirect "/docs/older" "/docs"
    commit_all
    local out; out=$(run_script --audit)
    assert_not_contains "$out" "FILE NOT FOUND" "resolves flattened slug root route and /docs"
    cleanup "$dir"
}; test_root_resolves_slug_route

test_root_missing_route_reported() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    seed_root_docs; create_netlify_toml
    add_redirect "/docs/old" "/docs/no-such-page"
    commit_all
    local out; out=$(run_script --audit)
    assert_contains "$out" "/docs/no-such-page  (FILE NOT FOUND)" "missing root route still reported"
    cleanup "$dir"
}; test_root_missing_route_reported

test_root_pr_deleted() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    seed_root_docs; echo "# C" > docs/operator-patterns/cicd-platform.mdx
    create_netlify_toml; seal_initial_state
    git rm -q docs/operator-patterns/cicd-platform.mdx; commit_all "del"
    local out; out=$(run_script_rc pr); local ec=$?
    assert_exit 1 "$ec" "deleted root page without redirect -> exit 1"
    assert_contains "$out" "No redirect for deleted file: docs/operator-patterns/cicd-platform.mdx" "names deleted root file"
    assert_contains "$out" "URL that will 404: /docs/operator-patterns/cicd-platform" "root URL drops the docs/ source prefix"
    cleanup "$dir"
}; test_root_pr_deleted

test_root_pr_deleted_with_redirect() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    seed_root_docs; echo "# C" > docs/operator-patterns/cicd-platform.mdx
    create_netlify_toml; seal_initial_state
    git rm -q docs/operator-patterns/cicd-platform.mdx
    add_redirect "/docs/operator-patterns/cicd-platform" "/docs/internal-platforms-and-dev-clusters"
    commit_all "del with redirect"
    local out; out=$(run_script_rc pr); local ec=$?
    assert_exit 0 "$ec" "deleted root page with redirect -> exit 0"
    assert_contains "$out" "Redirect exists for deleted: docs/operator-patterns/cicd-platform.mdx" "reports root coverage"
    cleanup "$dir"
}; test_root_pr_deleted_with_redirect

test_root_pr_deleted_slug_page() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    seed_root_docs; create_netlify_toml; seal_initial_state
    git rm -q docs/services/internal-platforms-and-dev-clusters.mdx; commit_all "del"
    local out; out=$(run_script_rc pr); local ec=$?
    assert_exit 1 "$ec" "deleted slugged root page -> exit 1"
    assert_contains "$out" "URL that will 404: /docs/internal-platforms-and-dev-clusters" "uses the slug URL"
    cleanup "$dir"
}; test_root_pr_deleted_slug_page

test_root_pr_renamed() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    seed_root_docs; echo "# S" > docs/operator-patterns/single-tenant.mdx
    create_netlify_toml; seal_initial_state
    mkdir -p docs/plan
    git mv docs/operator-patterns/single-tenant.mdx docs/plan/single-tenant.mdx; commit_all "rename"
    local out; out=$(run_script_rc pr); local ec=$?
    assert_exit 1 "$ec" "renamed root page without redirect -> exit 1"
    assert_contains "$out" "No redirect for renamed file: docs/operator-patterns/single-tenant.mdx" "reports renamed root file"
    cleanup "$dir"
}; test_root_pr_renamed

test_root_pr_slug_kept_on_move() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    seed_root_docs; create_netlify_toml; seal_initial_state
    mkdir -p docs/plan
    git mv docs/services/internal-platforms-and-dev-clusters.mdx docs/plan/internal-platforms-and-dev-clusters.mdx
    commit_all "move, keep slug"
    local out; out=$(run_script_rc pr); local ec=$?
    assert_exit 0 "$ec" "root move that keeps its slug -> exit 0"
    assert_contains "$out" "URL unchanged for renamed" "reports unchanged root URL"
    out=$(run_script_rc --fix); ec=$?
    assert_exit 0 "$ec" "fix accepts root move that keeps its slug"
    assert_contains "$out" "URL unchanged for renamed" "fix reports unchanged root URL"
    assert_exit 0 "$(git diff --exit-code -- netlify.toml >/dev/null; echo $?)" "fix leaves redirects unchanged for preserved root slug"
    cleanup "$dir"
}; test_root_pr_slug_kept_on_move

test_root_slug_kept_on_rewrite() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    seed_root_docs; create_netlify_toml; seal_initial_state
    git rm -q docs/services/internal-platforms-and-dev-clusters.mdx
    mkdir -p docs/plan
    printf -- '---\ntitle: Rewritten service\nslug: /internal-platforms-and-dev-clusters\n---\n# A new guide with different content\n' \
        > docs/plan/internal-platforms-and-dev-clusters.mdx
    commit_all "move and rewrite, keep slug"
    local out; out=$(run_script_rc pr); local ec=$?
    assert_exit 0 "$ec" "rewritten root page keeps its URL in PR mode"
    assert_contains "$out" "URL still served after delete" "rewritten root move is detected as a deletion"
    out=$(run_script_rc --fix); ec=$?
    assert_exit 0 "$ec" "fix accepts rewritten root move that keeps its slug"
    assert_contains "$out" "URL still served after delete" "fix reports root URL still served"
    assert_exit 0 "$(git diff --exit-code -- netlify.toml >/dev/null; echo $?)" "fix leaves redirects unchanged for rewritten root page"
    cleanup "$dir"
}; test_root_slug_kept_on_rewrite

test_root_pr_ignores_partials() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    seed_root_docs; echo "# P" > docs/_partials/shared.mdx
    create_netlify_toml; seal_initial_state
    git rm -q docs/_partials/shared.mdx; commit_all "del"
    local out; out=$(run_script_rc pr); local ec=$?
    assert_exit 0 "$ec" "ignores docs/_partials -> exit 0"
    cleanup "$dir"
}; test_root_pr_ignores_partials

test_root_fix_rename() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    seed_root_docs; echo "# S" > docs/operator-patterns/single-tenant.mdx
    create_netlify_toml; seal_initial_state
    mkdir -p docs/plan
    git mv docs/operator-patterns/single-tenant.mdx docs/plan/single-tenant.mdx; commit_all "rename"
    run_script --fix >/dev/null
    local toml; toml="$(cat netlify.toml)"
    assert_contains "$toml" 'from = "/docs/operator-patterns/single-tenant"' "root rename from-url"
    assert_contains "$toml" 'to = "/docs/plan/single-tenant"' "root rename to-url"
    cleanup "$dir"
}; test_root_fix_rename

test_root_fix_delete_falls_back_to_landing() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    seed_root_docs; mkdir -p docs/plan
    echo "# R" > docs/plan/roles-and-scopes.mdx
    echo "# C" > docs/plan/capacity-models.mdx
    printf '{"label": "Plan"}\n' > docs/plan/_category_.json
    create_netlify_toml; seal_initial_state
    git rm -q docs/plan/roles-and-scopes.mdx; commit_all "del"
    run_script --fix >/dev/null
    local toml; toml="$(cat netlify.toml)"
    # No index, README, or overview page, so the folder URL isn't served.
    assert_not_contains "$toml" 'to = "/docs/plan"' "skips unserved folder URL"
    assert_contains "$toml" 'to = "/docs"' "falls back to the root landing page"
    cleanup "$dir"
}; test_root_fix_delete_falls_back_to_landing

test_fix_delete_uses_section_index() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    mkdir -p vcluster/configure/networking
    echo "# N" > vcluster/configure/networking/README.mdx
    echo "# D" > vcluster/configure/networking/dns.mdx
    create_netlify_toml; seal_initial_state
    git rm -q vcluster/configure/networking/dns.mdx; commit_all "del"
    run_script --fix >/dev/null
    local toml; toml="$(cat netlify.toml)"
    assert_contains "$toml" 'to = "/docs/vcluster/next/configure/networking"' "redirects to the section landing page"
    cleanup "$dir"
}; test_fix_delete_uses_section_index

test_fix_delete_uses_section_overview() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    seed_root_docs; echo "# C" > docs/operator-patterns/cicd-platform.mdx
    create_netlify_toml; seal_initial_state
    git rm -q docs/operator-patterns/cicd-platform.mdx; commit_all "del"
    run_script --fix >/dev/null
    local toml; toml="$(cat netlify.toml)"
    assert_contains "$toml" 'to = "/docs/operator-patterns/overview"' "redirects to the section overview page"
    cleanup "$dir"
}; test_fix_delete_uses_section_overview

test_fix_delete_uses_overview_slug() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    mkdir -p platform/administer/users
    printf -- '---\ntitle: Users\nslug: /administer/users\n---\n# U\n' > platform/administer/users/overview.mdx
    echo "# T" > platform/administer/users/teams.mdx
    create_netlify_toml; seal_initial_state
    git rm -q platform/administer/users/teams.mdx; commit_all "del"
    run_script --fix >/dev/null
    local toml; toml="$(cat netlify.toml)"
    assert_contains "$toml" 'to = "/docs/platform/next/administer/users"' "uses the overview page's slug URL"
    cleanup "$dir"
}; test_fix_delete_uses_overview_slug

test_root_unserved_targets_reported() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    seed_root_docs; mkdir -p docs/plan
    echo "# C" > docs/plan/capacity-models.mdx
    printf '{"label": "Plan"}\n' > docs/plan/_category_.json
    create_netlify_toml
    add_redirect "/docs/a" "/docs/plan"
    add_redirect "/docs/b" "/docs/services/internal-platforms-and-dev-clusters"
    commit_all
    local out; out=$(run_script --audit)
    # A folder without a landing page isn't served, and a slugged page isn't
    # served at its folder-based path.
    assert_contains "$out" "/docs/plan  (FILE NOT FOUND)" "root folder without landing page reported"
    assert_contains "$out" "/docs/services/internal-platforms-and-dev-clusters  (FILE NOT FOUND)" "slugged root page's folder path reported"
    cleanup "$dir"
}; test_root_unserved_targets_reported

test_fix_delete_uses_folder_named_landing() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    mkdir -p platform/administer/external-database
    echo "# E" > platform/administer/external-database/external-database.mdx
    echo "# D" > platform/administer/external-database/deploy.mdx
    create_netlify_toml; seal_initial_state
    git rm -q platform/administer/external-database/deploy.mdx; commit_all "del"
    run_script --fix >/dev/null
    local toml; toml="$(cat netlify.toml)"
    assert_contains "$toml" 'to = "/docs/platform/next/administer/external-database"' "redirects to the <folder>/<folder>.mdx landing page"
    cleanup "$dir"
}; test_fix_delete_uses_folder_named_landing

test_pr_deleted_folder_named_landing_url() {
    local dir; dir="$(setup_test_repo)"; cd "$dir"
    mkdir -p platform/administer/external-database
    echo "# E" > platform/administer/external-database/external-database.mdx
    echo "# D" > platform/administer/external-database/deploy.mdx
    create_netlify_toml; seal_initial_state
    git rm -q platform/administer/external-database/external-database.mdx; commit_all "del"
    local out ec; out=$(run_script_rc); ec=$?
    assert_exit 1 "$ec" "deleted folder-named landing page without redirect -> exit 1"
    assert_contains "$out" "URL that will 404: /docs/platform/next/administer/external-database" "reports the folder URL the landing page served"
    assert_not_contains "$out" "404: /docs/platform/next/administer/external-database/external-database" "never reports the unserved doubled path"
    cleanup "$dir"
}; test_pr_deleted_folder_named_landing_url

# =========================================================================
echo -e "\n${BOLD}=== Results ===${NC}"
echo "Total: $TESTS_RUN  Pass: $PASS  Fail: $FAIL"
if [[ $FAIL -gt 0 ]]; then
    echo -e "${RED}${BOLD}SOME TESTS FAILED${NC}"; exit 1
else
    echo -e "${GREEN}${BOLD}ALL TESTS PASSED${NC}"; exit 0
fi
