#!/usr/bin/env bats
#
# Tests for resolve-inputs.sh: event/version selection, the v-prefix shape
# check, and the outputs the failure notice reads when a version is rejected.

setup() {
    SCRIPT="${BATS_TEST_DIRNAME}/resolve-inputs.sh"
    export GITHUB_OUTPUT="${BATS_TEST_TMPDIR}/gh_output"
    : >"$GITHUB_OUTPUT"
    unset GITHUB_EVENT_NAME DISPATCH_EVENT DISPATCH_VERSION MANUAL_EVENT MANUAL_VERSION PLATFORM_V5_DOCS_BRANCH
    # Model the remote refs fetched by the receiver without depending on the
    # runner's checkout depth or on which branch invoked the workflow.
    git init -q "${BATS_TEST_TMPDIR}/repo"
    cd "${BATS_TEST_TMPDIR}/repo"
    git -c user.name=test -c user.email=test@example.com commit -qm baseline --allow-empty
    git update-ref refs/remotes/origin/main HEAD
    git update-ref refs/remotes/origin/next HEAD
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

@test "platform v5 release and RC target next before cutover" {
    for version in v5.0.0-rc.1 v5.0.0 v5.1.0; do
        : >"$GITHUB_OUTPUT"
        PLATFORM_V5_DOCS_BRANCH=next DISPATCH_EVENT=platform-released DISPATCH_VERSION="$version" run "$SCRIPT"
        [ "$status" -eq 0 ]
        grep -qx 'target_branch=next' "$GITHUB_OUTPUT"
    done
}

@test "manual platform v5 sync selects the same target branch" {
    GITHUB_EVENT_NAME=workflow_dispatch PLATFORM_V5_DOCS_BRANCH=next \
        MANUAL_EVENT=platform-released MANUAL_VERSION=v5.0.0-rc.1 run "$SCRIPT"
    [ "$status" -eq 0 ]
    grep -qx 'target_branch=next' "$GITHUB_OUTPUT"
}

@test "other release lines and events keep targeting main" {
    for pair in platform-released:v4.12.4 platform-released:v6.0.0 vcluster-released:v5.0.0 vcluster-cli-released:v0.38.0; do
        : >"$GITHUB_OUTPUT"
        PLATFORM_V5_DOCS_BRANCH=next DISPATCH_EVENT="${pair%%:*}" DISPATCH_VERSION="${pair#*:}" run "$SCRIPT"
        [ "$status" -eq 0 ]
        grep -qx 'target_branch=main' "$GITHUB_OUTPUT"
    done
}

@test "platform v5 targets main after the cutover flag is removed" {
    DISPATCH_EVENT=platform-released DISPATCH_VERSION=v5.0.0 run "$SCRIPT"
    [ "$status" -eq 0 ]
    grep -qx 'target_branch=main' "$GITHUB_OUTPUT"
}

@test "invalid target branch fails before checkout or PR creation" {
    PLATFORM_V5_DOCS_BRANCH=unreviewed DISPATCH_EVENT=platform-released DISPATCH_VERSION=v5.0.0 run "$SCRIPT"
    [ "$status" -eq 1 ]
    [[ "$output" == *'PLATFORM_V5_DOCS_BRANCH must be main or next'* ]]
    ! grep -q '^target_branch=' "$GITHUB_OUTPUT"
}

@test "manual dispatch from another ref uses the selected main baseline for drift" {
    expected=$(git rev-parse refs/remotes/origin/main)
    git -c user.name=test -c user.email=test@example.com commit -qm other-ref --allow-empty
    GITHUB_EVENT_NAME=workflow_dispatch MANUAL_EVENT=vcluster-released MANUAL_VERSION=v0.38.0 run "$SCRIPT"
    [ "$status" -eq 0 ]
    grep -qx "base_sha=$expected" "$GITHUB_OUTPUT"
}

@test "platform v5 baseline comes from next rather than the initial checkout" {
    git -c user.name=test -c user.email=test@example.com commit -qm next-docs --allow-empty
    git update-ref refs/remotes/origin/next HEAD
    expected=$(git rev-parse refs/remotes/origin/next)
    git checkout -q --detach refs/remotes/origin/main
    PLATFORM_V5_DOCS_BRANCH=next DISPATCH_EVENT=platform-released DISPATCH_VERSION=v5.0.0 run "$SCRIPT"
    [ "$status" -eq 0 ]
    grep -qx "base_sha=$expected" "$GITHUB_OUTPUT"
}
