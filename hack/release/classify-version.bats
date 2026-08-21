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

    # go.mod pins the loft-sh/api line the platform generator compiles against.
    # The fixture's current line is 4.9 (matches highest frozen), so a
    # platform-released event on an older line (4.5-4.8) must classify as skip
    # while a 4.9 patch still regenerates. classify-version reads only the
    # api/v4 pin from this file for the platform stale-line guard.
    cat >"$FIXTURE/go.mod" <<EOF
module github.com/loft-sh/vcluster-docs

go 1.26

require (
	github.com/loft-sh/agentapi/v4 v4.9.0
	github.com/loft-sh/api/v4 v4.9.0
)
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

@test "vcluster: way-future minor (>+1 above max-frozen) → skip per A4 appx B" {
    # A4 example: v9.9.9 against a 0.x history must skip, not silently
    # land into the current docs folder.
    VERSION=v9.9.9 EVENT_TYPE=vcluster-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get skip)" = "true" ]
}

@test "vcluster: major-version bump (1.0.0 against 0.x history) → skip" {
    # Prevents silent routing of an unexpected major to current_root.
    VERSION=v1.0.0 EVENT_TYPE=vcluster-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get skip)" = "true" ]
}

@test "vcluster: skipped a minor (current=0.34, incoming=0.36) → skip" {
    # Only the immediate next minor (max-frozen + 1) maps to current_root.
    VERSION=v0.36.0 EVENT_TYPE=vcluster-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get skip)" = "true" ]
}

@test "vcluster: RC on frozen minor → versioned folder, channel=rc" {
    VERSION=v0.34.0-rc.3 EVENT_TYPE=vcluster-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get skip)" = "false" ]
    [ "$(get target_folder)" = "vcluster_versioned_docs/version-0.34.0" ]
    [ "$(get channel)" = "rc" ]
}

@test "vcluster: RC of next minor → current docs folder, channel=rc" {
    # Next minor against max-frozen 0.34 is 0.35 (max + 1).
    VERSION=v0.35.0-rc.1 EVENT_TYPE=vcluster-released run "$SCRIPT"
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

@test "vcluster: -next prerelease on a frozen minor is always skipped" {
    # -next.internal.* tags are cut from feature branches (DEVOPS-1092).
    # 0.34.0 is frozen with a folder, so without the -next guard this would
    # classify skip=false and open a docs-sync PR. The guard must win.
    VERSION=v0.34.0-next.internal.0 EVENT_TYPE=vcluster-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get skip)" = "true" ]
    [ "$(get target_folder)" = "" ]
    [ "$(get channel)" = "next" ]
}

@test "vcluster: -next prerelease of the next minor is always skipped" {
    # 0.35 is max-frozen+1, which would otherwise route to the current docs
    # folder. The -next guard fires before either routing branch.
    VERSION=v0.35.0-next.internal.0 EVENT_TYPE=vcluster-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get skip)" = "true" ]
    [ "$(get channel)" = "next" ]
}

@test "vcluster-cli: -next prerelease is always skipped" {
    VERSION=v0.34.0-next.internal.0 EVENT_TYPE=vcluster-cli-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get skip)" = "true" ]
    [ "$(get channel)" = "next" ]
}

@test "platform: -next prerelease is always skipped" {
    # Real-world shape from DEVOPS-1092: v4.11.0-next.internal.5.
    VERSION=v4.9.0-next.internal.5 EVENT_TYPE=platform-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get skip)" = "true" ]
    [ "$(get channel)" = "next" ]
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

@test "platform: stable patch on the current (generator) minor → versioned folder" {
    # go.mod pins api to 4.9, so 4.9 is the line the platform generator compiles
    # against. A patch on it regenerates into its versioned folder.
    VERSION=v4.9.5 EVENT_TYPE=platform-released run "$SCRIPT"
    [ "$(get skip)" = "false" ]
    [ "$(get target_folder)" = "platform_versioned_docs/version-4.9.0" ]
    [ "$(get channel)" = "stable" ]
}

@test "platform: stable patch on a line older than the generator → skip (stale-line)" {
    # 4.6 < the go.mod api line (4.9). The platform generator can't compile
    # against the older api pin (types moved/added at minor boundaries), so the
    # receiver must skip rather than fail. Folder version-4.6.0 exists, proving
    # the guard fires before folder-based routing. See DEVOPS-1168.
    VERSION=v4.6.5 EVENT_TYPE=platform-released run "$SCRIPT"
    [ "$(get skip)" = "true" ]
    [ "$(get target_folder)" = "" ]
    [ "$(get channel)" = "stale-line" ]
}

@test "platform: rc on a line older than the generator → skip (stale-line)" {
    VERSION=v4.8.0-rc.1 EVENT_TYPE=platform-released run "$SCRIPT"
    [ "$(get skip)" = "true" ]
    [ "$(get target_folder)" = "" ]
    [ "$(get channel)" = "stale-line" ]
}

@test "platform: release of next minor → current docs folder" {
    # 4.10 is newer than the highest frozen line (4.9): it routes to the current
    # docs root and is never subject to the older-line guard.
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
