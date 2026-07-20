#!/usr/bin/env bats
#
# Tests for bump-platform-pins.sh. `go` is shimmed onto PATH so the bump
# runs without network, a real module graph, or a vendor tree. The shim
# logs every `go` invocation to $SHIM_STATE/go.log so tests can assert on
# the edited module paths, that the version assertion uses -mod=mod, and
# that vendoring only happens after the assertion passes.
#
# Shim behaviour is driven by env vars:
#   LIST_VERSION  version `go list -m` reports (default: VERSION). Set it to
#                 something other than VERSION to simulate MVS selecting a
#                 higher version than the pin.

setup() {
    SCRIPT="${BATS_TEST_DIRNAME}/bump-platform-pins.sh"
    BIN="$(mktemp -d)"
    SHIM_STATE="$(mktemp -d)"
    export SHIM_STATE
    export PATH="$BIN:$PATH"
    _make_go
}

teardown() {
    rm -rf "$BIN" "$SHIM_STATE"
}

_make_go() {
    cat >"$BIN/go" <<'SH'
#!/usr/bin/env bash
echo "GOFLAGS=${GOFLAGS} args=$*" >>"$SHIM_STATE/go.log"
# `go list -m -f {{.Version}} <mod>` must print a version for the assertion.
[ "$1" = "list" ] && printf '%s\n' "${LIST_VERSION:-$VERSION}"
exit 0
SH
    chmod +x "$BIN/go"
}

@test "bumps both pins, tidies, verifies, and vendors" {
    VERSION=v4.11.0 run "$SCRIPT"
    [ "$status" -eq 0 ]
    [[ "$output" == *"github.com/loft-sh/agentapi/v4 pinned at v4.11.0"* ]]
    [[ "$output" == *"github.com/loft-sh/api/v4 pinned at v4.11.0"* ]]
    grep -q "args=mod edit -require github.com/loft-sh/agentapi/v4@v4.11.0" "$SHIM_STATE/go.log"
    grep -q "args=mod edit -require github.com/loft-sh/api/v4@v4.11.0" "$SHIM_STATE/go.log"
    grep -q "args=mod tidy" "$SHIM_STATE/go.log"
    grep -q "args=mod vendor" "$SHIM_STATE/go.log"
}

@test "version assertion queries with -mod=mod" {
    VERSION=v4.11.0 run "$SCRIPT"
    [ "$status" -eq 0 ]
    grep -q "GOFLAGS=-mod=mod args=list -m -f {{.Version}} github.com/loft-sh/agentapi/v4" "$SHIM_STATE/go.log"
    grep -q "GOFLAGS=-mod=mod args=list -m -f {{.Version}} github.com/loft-sh/api/v4" "$SHIM_STATE/go.log"
}

@test "MVS selecting a higher version than the pin → fails before vendoring" {
    LIST_VERSION=v4.11.1 VERSION=v4.11.0 run "$SCRIPT"
    [ "$status" -eq 1 ]
    [[ "$output" == *"resolved to v4.11.1, not the released v4.11.0"* ]]
    # tidy ran, but the failed assertion must stop us before re-vendoring.
    grep -q "args=mod tidy" "$SHIM_STATE/go.log"
    ! grep -q "args=mod vendor" "$SHIM_STATE/go.log"
}

@test "major version is derived from VERSION (v5 needs no code change)" {
    VERSION=v5.2.0 run "$SCRIPT"
    [ "$status" -eq 0 ]
    grep -q "args=mod edit -require github.com/loft-sh/agentapi/v5@v5.2.0" "$SHIM_STATE/go.log"
    grep -q "args=mod edit -require github.com/loft-sh/api/v5@v5.2.0" "$SHIM_STATE/go.log"
}

@test "pre-release versions are pinned verbatim" {
    VERSION=v4.11.0-rc.1 run "$SCRIPT"
    [ "$status" -eq 0 ]
    grep -q "args=mod edit -require github.com/loft-sh/agentapi/v4@v4.11.0-rc.1" "$SHIM_STATE/go.log"
}

@test "missing VERSION env var → exits non-zero" {
    run "$SCRIPT"
    [ "$status" -ne 0 ]
    [[ "$output" == *"VERSION env var required"* ]]
}
