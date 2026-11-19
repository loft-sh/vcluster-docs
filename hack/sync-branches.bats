#!/usr/bin/env bats
# Tests for hack/sync-branches.sh. Each test builds a throwaway origin with
# `main` and `next` in a given relationship and checks the classification.

SCRIPT="$BATS_TEST_DIRNAME/sync-branches.sh"

setup() {
    TMP="$(mktemp -d)"
    git init -q --bare -b main "$TMP/origin.git"
    git clone -q "$TMP/origin.git" "$TMP/work" 2>/dev/null
    cd "$TMP/work"
    git config user.email test@example.com
    git config user.name test
    # Ignore any global hooks (for example a local guard against pushing to main).
    git config core.hooksPath /dev/null
    echo base > a.txt && git add a.txt && git commit -qm base
    git push -q origin HEAD:main HEAD:next
}

teardown() {
    rm -rf "$TMP"
}

commit_on() { # branch file content
    git switch -q "$1" 2>/dev/null || git switch -q -c "$1" "origin/$1"
    echo "$3" > "$2" && git add "$2" && git commit -qm "$1: $2"
    git push -q origin "$1"
}

classify() {
    run env SYNC_RESULT_FILE=/dev/stdout "$SCRIPT"
    [ "$status" -eq 0 ]
}

@test "identical branches are up to date" {
    classify
    [[ "$output" == *"status=up-to-date"* ]]
}

@test "main ahead of next is a fast-forward" {
    commit_on main b.txt one
    commit_on main c.txt two
    classify
    [[ "$output" == *"status=fast-forward"* ]]
    [[ "$output" == *"main_ahead=2"* ]]
    [[ "$output" == *"next_ahead=0"* ]]
}

@test "next ahead of main needs nothing" {
    commit_on next b.txt one
    classify
    [[ "$output" == *"status=next-ahead"* ]]
}

@test "diverged without overlap merges cleanly" {
    commit_on main b.txt one
    commit_on next c.txt two
    classify
    [[ "$output" == *"status=diverged-clean"* ]]
    [[ "$output" == *"conflicts="$'\n'* || "$output" == *"conflicts=" ]]
}

@test "diverged edits to the same file report the conflict" {
    commit_on main a.txt from-main
    commit_on next a.txt from-next
    commit_on next d.txt only-next
    classify
    [[ "$output" == *"status=diverged-conflict"* ]]
    [[ "$output" == *"conflicts=a.txt"* ]]
}

@test "classification leaves branches and working tree unchanged" {
    commit_on main a.txt from-main
    commit_on next a.txt from-next
    before_main="$(git rev-parse origin/main)"
    before_next="$(git rev-parse origin/next)"
    classify
    [ "$(git rev-parse origin/main)" = "$before_main" ]
    [ "$(git rev-parse origin/next)" = "$before_next" ]
    [ -z "$(git status --porcelain)" ]
}
