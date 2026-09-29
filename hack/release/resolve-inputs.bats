#!/usr/bin/env bats
#
# Tests for resolve-inputs.sh: event/version selection, the v-prefix shape
# check, and the outputs the failure notice reads when a version is rejected.

setup() {
    SCRIPT="${BATS_TEST_DIRNAME}/resolve-inputs.sh"
    export GITHUB_OUTPUT="${BATS_TEST_TMPDIR}/gh_output"
    : >"$GITHUB_OUTPUT"
    unset GITHUB_EVENT_NAME DISPATCH_EVENT DISPATCH_VERSION MANUAL_EVENT MANUAL_VERSION
    # base_sha comes from git rev-parse HEAD, so run inside the repo.
    cd "$BATS_TEST_DIRNAME"
}

@test "repository_dispatch with a v-prefixed rc resolves event, version and base_sha" {
    GITHUB_EVENT_NAME=repository_dispatch \
        DISPATCH_EVENT=platform-released \
        DISPATCH_VERSION=v4.12.2-rc.1 \
        run "$SCRIPT"
    [ "$status" -eq 0 ]
    grep -qx 'event=platform-released' "$GITHUB_OUTPUT"
    grep -qx 'version=v4.12.2-rc.1' "$GITHUB_OUTPUT"
    grep -Eqx 'base_sha=[0-9a-f]{40}' "$GITHUB_OUTPUT"
}

@test "workflow_dispatch reads the MANUAL_* pair and ignores DISPATCH_*" {
    GITHUB_EVENT_NAME=workflow_dispatch \
        MANUAL_EVENT=vcluster-released \
        MANUAL_VERSION=v0.34.5 \
        DISPATCH_EVENT=platform-released \
        DISPATCH_VERSION=garbage \
        run "$SCRIPT"
    [ "$status" -eq 0 ]
    grep -qx 'event=vcluster-released' "$GITHUB_OUTPUT"
    grep -qx 'version=v0.34.5' "$GITHUB_OUTPUT"
}

@test "version without the v prefix is rejected and named in the outputs" {
    GITHUB_EVENT_NAME=repository_dispatch \
        DISPATCH_EVENT=platform-released \
        DISPATCH_VERSION=4.12.2-rc.1 \
        run "$SCRIPT"
    [ "$status" -eq 1 ]
    [[ "$output" == *"::error::Refusing to proceed: version '4.12.2-rc.1'"* ]]
    [[ "$output" == *"needs a leading v"* ]]
    grep -qx 'event=platform-released' "$GITHUB_OUTPUT"
    grep -qx 'version=4.12.2-rc.1' "$GITHUB_OUTPUT"
    # A rejected run never reaches the pre-sync commit output.
    ! grep -q '^base_sha=' "$GITHUB_OUTPUT"
}

@test "missing version is rejected and reported as (missing)" {
    GITHUB_EVENT_NAME=repository_dispatch \
        DISPATCH_EVENT=platform-released \
        run "$SCRIPT"
    [ "$status" -eq 1 ]
    grep -qx 'version=(missing)' "$GITHUB_OUTPUT"
}

@test "hostile payload cannot inject a workflow command or a second output" {
    GITHUB_EVENT_NAME=repository_dispatch \
        DISPATCH_EVENT=platform-released \
        DISPATCH_VERSION=$'v1\n::set-output name=x::y <!channel>' \
        run "$SCRIPT"
    [ "$status" -eq 1 ]
    [ "$(grep -c '^version=' "$GITHUB_OUTPUT")" -eq 1 ]
    [ "$(wc -l <"$GITHUB_OUTPUT")" -eq 2 ]
    [[ "$output" != *$'\n::set-output'* ]]
    [[ "$output" != *"<!channel>"* ]]
}

@test "rejected version is capped at 64 characters" {
    long=$(printf 'a%.0s' $(seq 1 200))
    GITHUB_EVENT_NAME=repository_dispatch \
        DISPATCH_EVENT=platform-released \
        DISPATCH_VERSION="$long" \
        run "$SCRIPT"
    [ "$status" -eq 1 ]
    value=$(grep '^version=' "$GITHUB_OUTPUT" | cut -d= -f2-)
    [ "${#value}" -eq 64 ]
}
