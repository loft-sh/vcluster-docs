#!/usr/bin/env bats
#
# Tests for deploy-stacked-preview.sh. A stub Netlify CLI records its
# arguments and prints the JSON the real `netlify deploy --json` returns.

setup() {
    SCRIPT="${BATS_TEST_DIRNAME}/deploy-stacked-preview.sh"
    STUB_DIR="$(mktemp -d)"
    export NETLIFY_ARGS_FILE="${STUB_DIR}/args"
    export GITHUB_OUTPUT="${STUB_DIR}/output"
    : > "$GITHUB_OUTPUT"
    cat > "${STUB_DIR}/netlify" <<'STUB'
#!/usr/bin/env bash
printf '%s\n' "$@" > "$NETLIFY_ARGS_FILE"
alias=""
while [[ $# -gt 0 ]]; do
    if [[ "$1" == "--alias" ]]; then alias="$2"; fi
    shift
done
printf '{"site_name":"vcluster-docs-site","deploy_id":"abc","deploy_url":"https://%s--vcluster-docs-site.netlify.app"}\n' "$alias"
STUB
    chmod +x "${STUB_DIR}/netlify"
    export NETLIFY_BIN="${STUB_DIR}/netlify"
}

teardown() {
    rm -rf "$STUB_DIR"
}

@test "deploys a draft to the pr-<number> alias" {
    PR_NUMBER=2846 run "$SCRIPT"
    [ "$status" -eq 0 ]
    run grep -Fx -A1 -- "--alias" "$NETLIFY_ARGS_FILE"
    [ "${lines[1]}" = "pr-2846" ]
}

@test "never deploys to production and skips the rebuild" {
    PR_NUMBER=2846 run "$SCRIPT"
    [ "$status" -eq 0 ]
    run grep -Fx -- "--prod" "$NETLIFY_ARGS_FILE"
    [ "$status" -ne 0 ]
    grep -Fx -- "--no-build" "$NETLIFY_ARGS_FILE"
}

@test "omits --context, which netlify-cli rejects with --no-build" {
    PR_NUMBER=2846 run "$SCRIPT"
    [ "$status" -eq 0 ]
    run grep -Fx -- "--context" "$NETLIFY_ARGS_FILE"
    [ "$status" -ne 0 ]
}

@test "writes the docs URL to GITHUB_OUTPUT" {
    PR_NUMBER=2846 run "$SCRIPT"
    [ "$status" -eq 0 ]
    grep -Fx "url=https://pr-2846--vcluster-docs-site.netlify.app/docs/" "$GITHUB_OUTPUT"
}

@test "rejects a missing PR number" {
    run env -u PR_NUMBER "$SCRIPT"
    [ "$status" -ne 0 ]
    [ ! -s "$NETLIFY_ARGS_FILE" ]
}

@test "rejects a PR number that could build a branch-like alias" {
    for bad in main next 0 012 "12 --prod" "12;true" vcluster-v0.33; do
        PR_NUMBER="$bad" run "$SCRIPT"
        [ "$status" -ne 0 ]
        [[ "$output" == *"PR_NUMBER"* ]]
    done
    [ ! -e "$NETLIFY_ARGS_FILE" ]
}

@test "fails when Netlify returns no deploy URL" {
    cat > "$NETLIFY_BIN" <<'STUB'
#!/usr/bin/env bash
echo '{"site_name":"vcluster-docs-site"}'
STUB
    PR_NUMBER=2846 run "$SCRIPT"
    [ "$status" -ne 0 ]
    [ ! -s "$GITHUB_OUTPUT" ]
}
