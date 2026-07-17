#!/usr/bin/env bats
#
# Tests for run-drift-check.sh. DRY_RUN=true verifies the resolved tool command
# per event type without building or running the Go tools.

setup() {
    SCRIPT="${BATS_TEST_DIRNAME}/run-drift-check.sh"
    export DRY_RUN=true
    export GITHUB_OUTPUT="${BATS_TEST_TMPDIR}/gh_output"
    export GITHUB_STEP_SUMMARY="${BATS_TEST_TMPDIR}/gh_summary"
    : >"$GITHUB_OUTPUT"
    : >"$GITHUB_STEP_SUMMARY"
}

# make_stub writes a fake drift tool that exits with the given code, for
# exercising the wrapper's exit-code → output dispatch without a Go build.
make_stub() {
    local stub="${BATS_TEST_TMPDIR}/stub-tool"
    printf '#!/bin/sh\nexit %s\n' "$1" >"$stub"
    chmod +x "$stub"
    echo "$stub"
}

@test "vcluster-cli-released → cli-drift against \${TARGET_FOLDER}/cli with old-ref" {
    EVENT_TYPE=vcluster-cli-released \
        TARGET_FOLDER=vcluster \
        OLD_REF=abc123 \
        REPORT_DIR=/tmp/reports \
        run "$SCRIPT"
    [ "$status" -eq 0 ]
    [[ "$output" == *"./hack/cli-drift"* ]]
    [[ "$output" == *"--cli vcluster/cli"* ]]
    [[ "$output" == *"--docs vcluster"* ]]
    [[ "$output" == *"--old-ref abc123"* ]]
    [[ "$output" == *"--json-output /tmp/reports/cli-drift.json"* ]]
}

@test "vcluster-released → config-drift against \${TARGET_FOLDER}/_partials/config" {
    EVENT_TYPE=vcluster-released \
        TARGET_FOLDER=vcluster_versioned_docs/version-0.34.0 \
        REPORT_DIR=/tmp/reports \
        run "$SCRIPT"
    [ "$status" -eq 0 ]
    [[ "$output" == *"./hack/config-drift"* ]]
    [[ "$output" == *"--config vcluster_versioned_docs/version-0.34.0/_partials/config"* ]]
    [[ "$output" == *"--docs vcluster_versioned_docs/version-0.34.0"* ]]
    [[ "$output" == *"--json-output /tmp/reports/config-drift.json"* ]]
}

@test "cli old-ref defaults to HEAD when unset" {
    EVENT_TYPE=vcluster-cli-released \
        TARGET_FOLDER=vcluster \
        REPORT_DIR=/tmp/reports \
        run "$SCRIPT"
    [ "$status" -eq 0 ]
    [[ "$output" == *"--old-ref HEAD"* ]]
}

@test "platform-released is a no-op with drift_detected=false" {
    EVENT_TYPE=platform-released \
        TARGET_FOLDER=platform_versioned_docs/version-4.6.0 \
        REPORT_DIR=/tmp/reports \
        run "$SCRIPT"
    [ "$status" -eq 0 ]
    [[ "$output" == *"no prose drift check"* ]]
    grep -q "drift_detected=false" "$GITHUB_OUTPUT"
    grep -q "report_path=" "$GITHUB_OUTPUT"
}

@test "unknown event is a no-op, never fails" {
    EVENT_TYPE=mystery-released \
        TARGET_FOLDER=foo \
        REPORT_DIR=/tmp/reports \
        run "$SCRIPT"
    [ "$status" -eq 0 ]
    grep -q "drift_detected=false" "$GITHUB_OUTPUT"
}

@test "tool exit 0 → drift_detected=false, empty report_path, job green" {
    stub=$(make_stub 0)
    DRY_RUN=false TOOL_BIN="$stub" \
        EVENT_TYPE=vcluster-released \
        TARGET_FOLDER=vcluster \
        REPO_ROOT="$BATS_TEST_TMPDIR" \
        REPORT_DIR="${BATS_TEST_TMPDIR}/reports" \
        run "$SCRIPT"
    [ "$status" -eq 0 ]
    grep -q "^drift_detected=false$" "$GITHUB_OUTPUT"
    grep -q "^report_path=$" "$GITHUB_OUTPUT"
}

@test "tool exit 1 → drift_detected=true with report_path, job green" {
    stub=$(make_stub 1)
    DRY_RUN=false TOOL_BIN="$stub" \
        EVENT_TYPE=vcluster-released \
        TARGET_FOLDER=vcluster \
        REPO_ROOT="$BATS_TEST_TMPDIR" \
        REPORT_DIR="${BATS_TEST_TMPDIR}/reports" \
        run "$SCRIPT"
    [ "$status" -eq 0 ]
    grep -q "^drift_detected=true$" "$GITHUB_OUTPUT"
    grep -q "^report_path=${BATS_TEST_TMPDIR}/reports/config-drift.json$" "$GITHUB_OUTPUT"
}

@test "tool exit ≥2 degrades to no drift with warning and summary, job green" {
    stub=$(make_stub 3)
    DRY_RUN=false TOOL_BIN="$stub" \
        EVENT_TYPE=vcluster-cli-released \
        TARGET_FOLDER=vcluster \
        REPO_ROOT="$BATS_TEST_TMPDIR" \
        REPORT_DIR="${BATS_TEST_TMPDIR}/reports" \
        run "$SCRIPT"
    [ "$status" -eq 0 ]
    [[ "$output" == *"::warning::"* ]]
    [[ "$output" == *"exited 3"* ]]
    grep -q "^drift_detected=false$" "$GITHUB_OUTPUT"
    grep -q "drift NOT checked" "$GITHUB_STEP_SUMMARY"
}

@test "build failure degrades to no drift with warning and summary, job green" {
    # REPO_ROOT is an empty dir: hack/<tool> does not exist, so the go build
    # fails (also covers "go not installed" — both must degrade, not fail).
    DRY_RUN=false \
        EVENT_TYPE=vcluster-released \
        TARGET_FOLDER=vcluster \
        REPO_ROOT="$BATS_TEST_TMPDIR" \
        REPORT_DIR="${BATS_TEST_TMPDIR}/reports" \
        run "$SCRIPT"
    [ "$status" -eq 0 ]
    [[ "$output" == *"::warning::"* ]]
    [[ "$output" == *"could not build"* ]]
    grep -q "^drift_detected=false$" "$GITHUB_OUTPUT"
    grep -q "drift NOT checked" "$GITHUB_STEP_SUMMARY"
}

@test "missing EVENT_TYPE → non-zero (wiring bug)" {
    TARGET_FOLDER=vcluster REPORT_DIR=/tmp/reports run "$SCRIPT"
    [ "$status" -ne 0 ]
}

@test "missing TARGET_FOLDER → non-zero (wiring bug)" {
    EVENT_TYPE=vcluster-released REPORT_DIR=/tmp/reports run "$SCRIPT"
    [ "$status" -ne 0 ]
}
