#!/usr/bin/env bats
#
# Tests for classify-version.sh. Each test points the script at a fixture repo
# layout (versions.json + version-X.Y.Z folders) instead of the real docs tree
# so cases stay deterministic and don't depend on which versions happen to be
# frozen on main today.

setup() {
    SCRIPT="${BATS_TEST_DIRNAME}/classify-version.sh"
    FIXTURE="$(mktemp -d)"

    # vcluster fixture: 0.28, 0.30, 0.31, 0.32, 0.33, 0.34 frozen with folders.
    # versions.json also lists 0.26 and 0.25 — frozen-but-pruned, no folder.
    mkdir -p "$FIXTURE/vcluster_versioned_docs/version-0.28.0"
    mkdir -p "$FIXTURE/vcluster_versioned_docs/version-0.30.0"
    mkdir -p "$FIXTURE/vcluster_versioned_docs/version-0.31.0"
    mkdir -p "$FIXTURE/vcluster_versioned_docs/version-0.32.0"
    mkdir -p "$FIXTURE/vcluster_versioned_docs/version-0.33.0"
    mkdir -p "$FIXTURE/vcluster_versioned_docs/version-0.34.0"
    cat >"$FIXTURE/vcluster_versions.json" <<EOF
[
  "0.34.0",
  "0.33.0",
  "0.32.0",
  "0.31.0",
  "0.30.0",
  "0.28.0",
  "0.26.0",
  "0.25.0"
]
EOF

    # platform fixture: 4.5–4.9 frozen with folders, plus 4.4-4.2 in versions.json without folders.
    mkdir -p "$FIXTURE/platform_versioned_docs/version-4.5.0"
    mkdir -p "$FIXTURE/platform_versioned_docs/version-4.6.0"
    mkdir -p "$FIXTURE/platform_versioned_docs/version-4.7.0"
    mkdir -p "$FIXTURE/platform_versioned_docs/version-4.8.0"
    mkdir -p "$FIXTURE/platform_versioned_docs/version-4.9.0"
    cat >"$FIXTURE/platform_versions.json" <<EOF
[
  "4.9.0",
  "4.8.0",
  "4.7.0",
  "4.6.0",
  "4.5.0",
  "4.4.0",
  "4.3.0",
  "4.2.0"
]
EOF

    export REPO_ROOT="$FIXTURE"
}

teardown() {
    rm -rf "$FIXTURE"
}

# Pull a single key from the script's `key=value` stdout block.
get() {
    local key="$1"
    grep "^${key}=" <<<"$output" | head -n1 | cut -d= -f2-
}

@test "vcluster: stable patch on frozen minor → versioned folder" {
    VERSION=v0.34.5 EVENT_TYPE=vcluster-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get skip)" = "false" ]
    [ "$(get target_folder)" = "vcluster_versioned_docs/version-0.34.0" ]
    [ "$(get channel)" = "stable" ]
}

@test "vcluster: stable release of next minor → current docs folder" {
    VERSION=v0.35.0 EVENT_TYPE=vcluster-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get skip)" = "false" ]
    [ "$(get target_folder)" = "vcluster" ]
    [ "$(get channel)" = "stable" ]
}

@test "vcluster: RC on frozen minor → versioned folder, channel=rc" {
    VERSION=v0.34.0-rc.3 EVENT_TYPE=vcluster-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get skip)" = "false" ]
    [ "$(get target_folder)" = "vcluster_versioned_docs/version-0.34.0" ]
    [ "$(get channel)" = "rc" ]
}

@test "vcluster: RC of next minor → current docs folder, channel=rc" {
    VERSION=v0.36.0-rc.1 EVENT_TYPE=vcluster-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get skip)" = "false" ]
    [ "$(get target_folder)" = "vcluster" ]
    [ "$(get channel)" = "rc" ]
}

@test "vcluster: alpha is always skipped" {
    VERSION=v0.34.5-alpha.1 EVENT_TYPE=vcluster-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get skip)" = "true" ]
    [ "$(get target_folder)" = "" ]
    [ "$(get channel)" = "alpha" ]
}

@test "vcluster: beta is always skipped" {
    VERSION=v0.36.0-beta.2 EVENT_TYPE=vcluster-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get skip)" = "true" ]
    [ "$(get channel)" = "beta" ]
}

@test "vcluster: frozen-but-pruned minor (in versions.json, no folder) → skip" {
    # 0.26.0 is in versions.json but no folder exists for it.
    VERSION=v0.26.5 EVENT_TYPE=vcluster-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get skip)" = "true" ]
    [ "$(get target_folder)" = "" ]
    [ "$(get channel)" = "stable" ]
}

@test "vcluster: missing-from-versions.json minor with folder → versioned folder" {
    # 0.29 isn't in versions.json AND has no folder; treated as past minor → skip.
    # Confirms classifier doesn't accidentally route to "current" when it's lower than highest.
    VERSION=v0.29.0 EVENT_TYPE=vcluster-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get skip)" = "true" ]
}

@test "vcluster-cli rides on vcluster versioning" {
    VERSION=v0.34.5 EVENT_TYPE=vcluster-cli-released run "$SCRIPT"
    [ "$(get skip)" = "false" ]
    [ "$(get target_folder)" = "vcluster_versioned_docs/version-0.34.0" ]
}

@test "platform: stable patch on frozen minor → versioned folder" {
    VERSION=v4.6.5 EVENT_TYPE=platform-released run "$SCRIPT"
    [ "$(get skip)" = "false" ]
    [ "$(get target_folder)" = "platform_versioned_docs/version-4.6.0" ]
    [ "$(get channel)" = "stable" ]
}

@test "platform: release of next minor → current docs folder" {
    VERSION=v4.10.0 EVENT_TYPE=platform-released run "$SCRIPT"
    [ "$(get skip)" = "false" ]
    [ "$(get target_folder)" = "platform" ]
}

@test "unknown event type → skip with channel=unknown-event" {
    VERSION=v1.2.3 EVENT_TYPE=something-else run "$SCRIPT"
    [ "$(get skip)" = "true" ]
    [ "$(get channel)" = "unknown-event" ]
}

@test "malformed version → skip with channel=invalid" {
    VERSION=not-a-version EVENT_TYPE=vcluster-released run "$SCRIPT"
    [ "$(get skip)" = "true" ]
    [ "$(get channel)" = "invalid" ]
}

@test "missing VERSION env var → script exits non-zero" {
    EVENT_TYPE=vcluster-released run "$SCRIPT"
    [ "$status" -ne 0 ]
}

@test "missing EVENT_TYPE env var → script exits non-zero" {
    VERSION=v0.34.5 run "$SCRIPT"
    [ "$status" -ne 0 ]
}

@test "GITHUB_OUTPUT is appended when set" {
    OUTFILE="$(mktemp)"
    GITHUB_OUTPUT="$OUTFILE" VERSION=v0.34.5 EVENT_TYPE=vcluster-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    grep -q "^skip=false$" "$OUTFILE"
    grep -q "^target_folder=vcluster_versioned_docs/version-0.34.0$" "$OUTFILE"
    grep -q "^channel=stable$" "$OUTFILE"
    rm -f "$OUTFILE"
}
