#!/usr/bin/env bats
#
# Tests for run-drift-check.sh. DRY_RUN=true verifies the resolved tool command
# per event type without building or running the Go tools.

setup() {
    SCRIPT="${BATS_TEST_DIRNAME}/run-drift-check.sh"
    export DRY_RUN=true
    export GITHUB_OUTPUT="${BATS_TEST_TMPDIR}/gh_output"
    : >"$GITHUB_OUTPUT"
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

@test "missing EVENT_TYPE → non-zero (wiring bug)" {
    TARGET_FOLDER=vcluster REPORT_DIR=/tmp/reports run "$SCRIPT"
    [ "$status" -ne 0 ]
}

@test "missing TARGET_FOLDER → non-zero (wiring bug)" {
    EVENT_TYPE=vcluster-released REPORT_DIR=/tmp/reports run "$SCRIPT"
    [ "$status" -ne 0 ]
}
