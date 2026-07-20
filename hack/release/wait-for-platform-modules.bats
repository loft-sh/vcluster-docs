#!/usr/bin/env bats
#
# Tests for wait-for-platform-modules.sh. `gh` and `go` are shimmed onto
# PATH so the poll loop is exercised deterministically without network or a
# real release. SLEEP_SECONDS=0 keeps the suite fast; MAX_ATTEMPTS is small
# so timeout paths finish quickly.
#
# Shim behaviour is driven by env vars:
#   GH_MODE   ok | fail            (tag present | never published)
#   GO_MODE   ok | fail | flaky:N  (resolves | never | fails N times then ok)
# The go shim logs each `go mod download` invocation to $SHIM_STATE/go.log so
# tests can assert on the queried module path and that -mod=mod was passed.

setup() {
    SCRIPT="${BATS_TEST_DIRNAME}/wait-for-platform-modules.sh"
    BIN="$(mktemp -d)"
    SHIM_STATE="$(mktemp -d)"
    export SHIM_STATE
    export PATH="$BIN:$PATH"
    export SLEEP_SECONDS=0
    export MAX_ATTEMPTS=5
    export GH_TOKEN=test-token
    export GH_MODE=ok
    export GO_MODE=ok
    _make_gh
    _make_go
}

teardown() {
    rm -rf "$BIN" "$SHIM_STATE"
}

_make_gh() {
    cat >"$BIN/gh" <<'SH'
#!/usr/bin/env bash
case "${GH_MODE:-ok}" in
  fail)    echo "gh: Not Found (HTTP 404)" >&2; exit 1 ;;
  autherr) echo "gh: Bad credentials (HTTP 401)" >&2; exit 1 ;;
  *)       exit 0 ;;
esac
SH
    chmod +x "$BIN/gh"
}

_make_go() {
    cat >"$BIN/go" <<'SH'
#!/usr/bin/env bash
# Only intercept `go mod download ...`; anything else is a no-op success.
[ "$1" = "mod" ] && [ "$2" = "download" ] || exit 0
echo "GOFLAGS=${GOFLAGS} args=$*" >>"$SHIM_STATE/go.log"
mode="${GO_MODE:-ok}"
case "$mode" in
  fail) exit 1 ;;
  flaky:*)
    n="${mode#flaky:}"
    key="$(printf '%s' "${@: -1}" | tr -c 'A-Za-z0-9' '_')"
    f="$SHIM_STATE/go_${key}"
    c=0; [ -f "$f" ] && c="$(cat "$f")"
    c=$((c + 1)); printf '%s' "$c" >"$f"
    if [ "$c" -gt "$n" ]; then exit 0; else exit 1; fi
    ;;
  *) exit 0 ;;
esac
SH
    chmod +x "$BIN/go"
}

@test "both phases pass when tag is present and the module resolves" {
    VERSION=v4.10.1 run "$SCRIPT"
    [ "$status" -eq 0 ]
    [[ "$output" == *"loft-sh/agentapi: tag v4.10.1 present"* ]]
    [[ "$output" == *"loft-sh/api: tag v4.10.1 present"* ]]
    [[ "$output" == *"github.com/loft-sh/agentapi/v4: v4.10.1 resolves via direct fetch"* ]]
    [[ "$output" == *"github.com/loft-sh/api/v4: v4.10.1 resolves via direct fetch"* ]]
}

@test "phase 2 downloads with -mod=mod for both modules" {
    VERSION=v4.10.1 run "$SCRIPT"
    [ "$status" -eq 0 ]
    grep -q "GOFLAGS=-mod=mod args=mod download github.com/loft-sh/agentapi/v4@v4.10.1" "$SHIM_STATE/go.log"
    grep -q "GOFLAGS=-mod=mod args=mod download github.com/loft-sh/api/v4@v4.10.1" "$SHIM_STATE/go.log"
}

@test "tag 404s forever → fails with upstream-pipeline error, never reaches fetch check" {
    GH_MODE=fail VERSION=v4.10.1 run "$SCRIPT"
    [ "$status" -eq 1 ]
    [[ "$output" == *"tag v4.10.1 not present after 5 attempts"* ]]
    [[ "$output" == *"upstream pipeline never published it"* ]]
    [ ! -f "$SHIM_STATE/go.log" ]
}

@test "non-404 tag error → surfaced as API/auth problem, not a missing release" {
    GH_MODE=autherr VERSION=v4.10.1 run "$SCRIPT"
    [ "$status" -eq 1 ]
    [[ "$output" == *"non-404 error"* ]]
    [[ "$output" == *"GitHub API/auth problem"* ]]
    [[ "$output" != *"upstream pipeline never published it"* ]]
    [ ! -f "$SHIM_STATE/go.log" ]
}

@test "module never resolves → fails with direct-fetch error after the tag check passes" {
    GO_MODE=fail VERSION=v4.10.1 run "$SCRIPT"
    [ "$status" -eq 1 ]
    [[ "$output" == *"tag v4.10.1 present"* ]]
    [[ "$output" == *"did not resolve via direct fetch after 5 attempts"* ]]
}

@test "fetch lags then resolves within the attempt budget → succeeds" {
    # Each module fails twice then resolves; MAX_ATTEMPTS=5 leaves headroom.
    GO_MODE=flaky:2 VERSION=v4.10.1 run "$SCRIPT"
    [ "$status" -eq 0 ]
    [[ "$output" == *"waiting for v4.10.1 to resolve via direct fetch"* ]]
    [[ "$output" == *"v4.10.1 resolves via direct fetch"* ]]
}

@test "major version is derived from VERSION (v5 needs no code change)" {
    VERSION=v5.2.0 run "$SCRIPT"
    [ "$status" -eq 0 ]
    grep -q "args=mod download github.com/loft-sh/agentapi/v5@v5.2.0" "$SHIM_STATE/go.log"
    grep -q "args=mod download github.com/loft-sh/api/v5@v5.2.0" "$SHIM_STATE/go.log"
}

@test "pre-release versions are accepted and queried verbatim" {
    VERSION=v4.10.1-rc.1 run "$SCRIPT"
    [ "$status" -eq 0 ]
    grep -q "args=mod download github.com/loft-sh/agentapi/v4@v4.10.1-rc.1" "$SHIM_STATE/go.log"
}

@test "missing VERSION env var → exits non-zero" {
    run "$SCRIPT"
    [ "$status" -ne 0 ]
    [[ "$output" == *"VERSION env var required"* ]]
}
