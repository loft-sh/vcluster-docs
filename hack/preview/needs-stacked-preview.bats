#!/usr/bin/env bats
#
# Tests for needs-stacked-preview.sh. A stub gh prints the tab-separated
# base.ref and stack.base.ref the real `gh api --jq` call returns.

setup() {
    SCRIPT="${BATS_TEST_DIRNAME}/needs-stacked-preview.sh"
    STUB_DIR="$(mktemp -d)"
    export GITHUB_OUTPUT="${STUB_DIR}/output"
    : > "$GITHUB_OUTPUT"
    cat > "${STUB_DIR}/gh" <<'STUB'
#!/usr/bin/env bash
printf '%s\t%s\n' "$STUB_BASE" "$STUB_STACK_BASE"
STUB
    chmod +x "${STUB_DIR}/gh"
    export GH_BIN="${STUB_DIR}/gh" GH_REPO=loft-sh/vcluster-docs PR_NUMBER=2846
}

teardown() {
    rm -rf "$STUB_DIR"
}

@test "deploys for a branch-on-branch stack" {
    STUB_BASE=engapps-539/nico-driver-docs STUB_STACK_BASE="" run "$SCRIPT"
    [ "$status" -eq 0 ]
    grep -Fx "deploy=true" "$GITHUB_OUTPUT"
}

@test "skips a native stack based on main, which Netlify previews" {
    STUB_BASE=DOC-1372/tenant-docs STUB_STACK_BASE=main run "$SCRIPT"
    [ "$status" -eq 0 ]
    grep -Fx "deploy=false" "$GITHUB_OUTPUT"
}

@test "deploys for a native stack based on a branch Netlify ignores" {
    STUB_BASE=feature/b STUB_STACK_BASE=feature/a run "$SCRIPT"
    [ "$status" -eq 0 ]
    grep -Fx "deploy=true" "$GITHUB_OUTPUT"
}

@test "skips every base branch Netlify deploys" {
    for base in main next vcluster-v0.33 platform-v4.8; do
        : > "$GITHUB_OUTPUT"
        STUB_BASE="$base" STUB_STACK_BASE="" run "$SCRIPT"
        [ "$status" -eq 0 ]
        grep -Fx "deploy=false" "$GITHUB_OUTPUT"
    done
}

@test "fails when the PR lookup fails" {
    printf '#!/usr/bin/env bash\nexit 1\n' > "$GH_BIN"
    run "$SCRIPT"
    [ "$status" -ne 0 ]
    [ ! -s "$GITHUB_OUTPUT" ]
}
