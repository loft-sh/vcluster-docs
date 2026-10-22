#!/usr/bin/env bats

setup() {
    SCRIPT="${BATS_TEST_DIRNAME}/skip-notice.sh"
    export EVENT=vcluster-released VERSION=v0.39.0
}

@test "routine skip channels are a notice and pass" {
    for channel in stable rc rc-patch alpha beta next stale-line invalid unknown-event; do
        CHANNEL=$channel run "$SCRIPT"
        [ "$status" -eq 0 ]
        [[ "$output" == "::notice::"*"channel=$channel"* ]]
    done
}

@test "channels that need a person fail with an error" {
    for channel in out-of-range unfrozen-line major-cutover generator-unknown history-unknown; do
        EVENT=platform-released CHANNEL=$channel run "$SCRIPT"
        [ "$status" -eq 1 ]
        [[ "$output" == "::error::"* ]]
    done
}

@test "an unlisted channel fails, so a new skip channel can't pass silently" {
    CHANNEL=some-new-skip run "$SCRIPT"
    [ "$status" -eq 1 ]
    [[ "$output" == "::error::"*"unknown skip channel"* ]]
}

@test "every channel classify-version.sh emits is listed" {
    classify="${BATS_TEST_DIRNAME}/classify-version.sh"
    channels=$(grep -oE '(emit_skip |channel=)[a-z][a-z-]*' "$classify" | sed -E 's/^(emit_skip |channel=)//' | sort -u)
    [ -n "$channels" ]
    for channel in $channels; do
        CHANNEL=$channel run "$SCRIPT"
        [[ "$output" != *"unknown skip channel"* ]] || { echo "unlisted: $channel"; false; }
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

@test "unfrozen-line says the line gets no docs and not to copy current docs" {
    CHANNEL=unfrozen-line run "$SCRIPT"
    [[ "$output" == *"gets no docs"* ]]
    [[ "$output" == *"not a copy of current docs"* ]]
    [[ "$output" != *"add it to versions.json if it needs docs"* ]]
}
