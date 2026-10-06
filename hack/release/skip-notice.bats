#!/usr/bin/env bats

setup() {
    SCRIPT="${BATS_TEST_DIRNAME}/skip-notice.sh"
    export EVENT=vcluster-released VERSION=v0.39.0
}

@test "routine skip channels are a notice and pass" {
    for channel in stable rc alpha beta next stale-line invalid unknown-event; do
        CHANNEL=$channel run "$SCRIPT"
        [ "$status" -eq 0 ]
        [[ "$output" == "::notice::"*"channel=$channel"* ]]
    done
}

@test "channels that need a person fail with an error" {
    for channel in out-of-range unfrozen-line major-cutover generator-unknown; do
        EVENT=platform-released CHANNEL=$channel run "$SCRIPT"
        [ "$status" -eq 1 ]
        [[ "$output" == "::error::"* ]]
    done
}

@test "the error points to a new run, not a re-run" {
    CHANNEL=out-of-range run "$SCRIPT"
    [ "$status" -eq 1 ]
    [[ "$output" == *"start a new run with Run workflow"* ]]
}

@test "vcluster-cli-released only warns, so one release pages once" {
    EVENT=vcluster-cli-released CHANNEL=out-of-range run "$SCRIPT"
    [ "$status" -eq 0 ]
    [[ "$output" == "::warning::"* ]]
}

@test "missing CHANNEL → exits non-zero" {
    CHANNEL= run "$SCRIPT"
    [ "$status" -ne 0 ]
}
