#!/usr/bin/env bats
#
# Tests for run-generator.sh. Use DRY_RUN=true so the suite verifies the
# resolved command line per event type without actually invoking `go run`.

setup() {
    SCRIPT="${BATS_TEST_DIRNAME}/run-generator.sh"
    export DRY_RUN=true
}

@test "vcluster-released → vcluster partials generator with _partials/config suffix" {
    EVENT_TYPE=vcluster-released \
        TARGET_FOLDER=vcluster_versioned_docs/version-0.34.0 \
        SOURCE_PATH=/tmp/_source \
        run "$SCRIPT"
    [ "$status" -eq 0 ]
    [[ "$output" == *"hack/vcluster/partials/main.go"* ]]
    [[ "$output" == *"--source-path /tmp/_source"* ]]
    [[ "$output" == *"--target-folder vcluster_versioned_docs/version-0.34.0/_partials/config"* ]]
}

@test "vcluster-cli-released → vcluster-cli generator with cli suffix" {
    EVENT_TYPE=vcluster-cli-released \
        TARGET_FOLDER=vcluster_versioned_docs/version-0.34.0 \
        SOURCE_PATH=/tmp/_source \
        run "$SCRIPT"
    [ "$status" -eq 0 ]
    [[ "$output" == *"hack/vcluster-cli/main.go"* ]]
    [[ "$output" == *"--source-path /tmp/_source"* ]]
    [[ "$output" == *"--target-folder vcluster_versioned_docs/version-0.34.0/cli"* ]]
}

@test "platform-released → platform partials with both base flags" {
    EVENT_TYPE=platform-released \
        TARGET_FOLDER=platform_versioned_docs/version-4.6.0 \
        run "$SCRIPT"
    [ "$status" -eq 0 ]
    [[ "$output" == *"hack/platform/partials/main.go"* ]]
    [[ "$output" == *"--partials-base platform_versioned_docs/version-4.6.0/api/_partials/resources/"* ]]
    [[ "$output" == *"--resources-base platform_versioned_docs/version-4.6.0/api/resources"* ]]
}

@test "vcluster-released against the next/current docs folder works the same" {
    # Confirms the suffix is appended to whatever the classifier output, not just versioned.
    EVENT_TYPE=vcluster-released \
        TARGET_FOLDER=vcluster \
        SOURCE_PATH=/tmp/_source \
        run "$SCRIPT"
    [ "$status" -eq 0 ]
    [[ "$output" == *"--target-folder vcluster/_partials/config"* ]]
}

@test "platform-released does not require SOURCE_PATH" {
    # Platform reflects against vendored Go types; SOURCE_PATH has no role.
    unset SOURCE_PATH || true
    EVENT_TYPE=platform-released \
        TARGET_FOLDER=platform_versioned_docs/version-4.6.0 \
        run "$SCRIPT"
    [ "$status" -eq 0 ]
    [[ "$output" == *"hack/platform/partials/main.go"* ]]
}

@test "vcluster-released without SOURCE_PATH → script exits non-zero" {
    EVENT_TYPE=vcluster-released TARGET_FOLDER=vcluster run "$SCRIPT"
    [ "$status" -ne 0 ]
}

@test "vcluster-cli-released without SOURCE_PATH → script exits non-zero" {
    EVENT_TYPE=vcluster-cli-released TARGET_FOLDER=vcluster run "$SCRIPT"
    [ "$status" -ne 0 ]
}

@test "unknown EVENT_TYPE → script exits with code 2" {
    EVENT_TYPE=mystery-released \
        TARGET_FOLDER=foo \
        SOURCE_PATH=/tmp/_source \
        run "$SCRIPT"
    [ "$status" -eq 2 ]
    [[ "$output" == *"unsupported EVENT_TYPE"* ]]
}

@test "missing EVENT_TYPE env var → script exits non-zero" {
    TARGET_FOLDER=vcluster SOURCE_PATH=/tmp/_source run "$SCRIPT"
    [ "$status" -ne 0 ]
}

@test "missing TARGET_FOLDER env var → script exits non-zero" {
    EVENT_TYPE=vcluster-released SOURCE_PATH=/tmp/_source run "$SCRIPT"
    [ "$status" -ne 0 ]
}
