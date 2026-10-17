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

    # The platform generator imports api/v4 and go.mod pins it at 4.9 (matches
    # highest frozen), so a platform-released event on an older line (4.5-4.8)
    # must classify as skip while a 4.9 patch still regenerates.
    generator_imports_api 4
    write_gomod \
        "github.com/loft-sh/agentapi/v4 v4.9.0" \
        "github.com/loft-sh/api/v4 v4.9.0"

    # The history guards fail closed outside a full checkout, like main is.
    git -C "$FIXTURE" init -q
    git -C "$FIXTURE" -c user.name=t -c user.email=t@example.com \
        commit -q --allow-empty -m "init"

    export REPO_ROOT="$FIXTURE"
}

teardown() {
    rm -rf "$FIXTURE"
}

generator_imports_api() {
    mkdir -p "$FIXTURE/hack/platform/partials"
    printf 'package main\n\nimport managementv1 "github.com/loft-sh/api/v%s/pkg/apis/management/v1"\n' "$1" \
        >"$FIXTURE/hack/platform/partials/main.go"
}

# Writes go.mod with one require block holding the given lines.
write_gomod() {
    {
        printf 'module github.com/loft-sh/vcluster-docs\n\ngo 1.26\n\nrequire (\n'
        printf '\t%s\n' "$@"
        printf ')\n'
    } >"$FIXTURE/go.mod"
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

@test "vcluster: way-future version → skip with channel=out-of-range" {
    # v9.9.9 against a 0.x history must skip, not silently land into the
    # current docs folder.
    VERSION=v9.9.9 EVENT_TYPE=vcluster-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get skip)" = "true" ]
    [ "$(get channel)" = "out-of-range" ]
}

@test "vcluster: next major (1.0.0 against 0.x history) → current docs folder" {
    VERSION=v1.0.0 EVENT_TYPE=vcluster-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get skip)" = "false" ]
    [ "$(get target_folder)" = "vcluster" ]
}

@test "vcluster: patch of next major (1.0.3 against 0.x history) → current docs folder" {
    VERSION=v1.0.3 EVENT_TYPE=vcluster-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get skip)" = "false" ]
    [ "$(get target_folder)" = "vcluster" ]
}

@test "vcluster-cli: next major (1.0.0 against 0.x history) → current docs folder" {
    VERSION=v1.0.0 EVENT_TYPE=vcluster-cli-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get skip)" = "false" ]
    [ "$(get target_folder)" = "vcluster" ]
}

@test "vcluster: no versions.json → next major is not assumed" {
    # Without a baseline, 1.0.0 must not pass as "the major after 0.x".
    rm "$FIXTURE/vcluster_versions.json"
    VERSION=v1.0.0 EVENT_TYPE=vcluster-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get skip)" = "true" ]
    [ "$(get channel)" = "out-of-range" ]
}

@test "vcluster: versions.json with CRLF line endings still parses" {
    printf '[\r\n  "0.34.0",\r\n  "0.33.0"\r\n]\r\n' >"$FIXTURE/vcluster_versions.json"
    VERSION=v0.35.0 EVENT_TYPE=vcluster-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get skip)" = "false" ]
    [ "$(get target_folder)" = "vcluster" ]
}

@test "vcluster: versions.json without trailing newline still reads the last entry" {
    printf '["0.34.0"]' >"$FIXTURE/vcluster_versions.json"
    VERSION=v0.35.0 EVENT_TYPE=vcluster-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get skip)" = "false" ]
    [ "$(get target_folder)" = "vcluster" ]
}

# Commits a docs-sync subject the way a merged sync PR lands on main.
record_sync() {
    git -C "$FIXTURE" -c user.name=t -c user.email=t@example.com \
        commit -q --allow-empty -m "docs: sync $1 $2 (#1)"
}

@test "vcluster: next minor after the next major synced into current → skip (unfrozen-line)" {
    # 1.0 owns current docs now; a 0.35 sync would overwrite it there.
    record_sync vcluster-released v1.0.0-rc.1
    VERSION=v0.35.0 EVENT_TYPE=vcluster-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get skip)" = "true" ]
    [ "$(get channel)" = "unfrozen-line" ]
}

@test "vcluster-cli: a cli sync of the next major also claims current docs" {
    record_sync vcluster-cli-released v1.0.0-rc.1
    VERSION=v0.35.1 EVENT_TYPE=vcluster-cli-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get channel)" = "unfrozen-line" ]
}

@test "vcluster: next major keeps syncing into current after its first sync" {
    record_sync vcluster-released v1.0.0-rc.1
    VERSION=v1.0.0 EVENT_TYPE=vcluster-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get skip)" = "false" ]
    [ "$(get target_folder)" = "vcluster" ]
}

@test "vcluster: syncs of the current major don't block the next minor" {
    record_sync vcluster-released v0.34.2
    VERSION=v0.35.0 EVENT_TYPE=vcluster-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get skip)" = "false" ]
    [ "$(get target_folder)" = "vcluster" ]
}

@test "vcluster: next major while the next minor already synced into current → skip (out-of-range)" {
    # 0.35 is in current docs but not frozen; 1.0 would overwrite it.
    record_sync vcluster-released v0.35.0-rc.1
    VERSION=v1.0.0-rc.1 EVENT_TYPE=vcluster-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get skip)" = "true" ]
    [ "$(get channel)" = "out-of-range" ]
}

@test "vcluster: a stable next-minor sync blocks a stable next major too" {
    record_sync vcluster-released v0.35.2
    VERSION=v1.0.0 EVENT_TYPE=vcluster-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get channel)" = "out-of-range" ]
}

@test "vcluster-cli: a cli sync of the next minor also blocks the next major" {
    record_sync vcluster-cli-released v0.35.0
    VERSION=v1.0.0 EVENT_TYPE=vcluster-cli-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get channel)" = "out-of-range" ]
}

@test "vcluster: syncs of the current frozen line don't block the next major" {
    record_sync vcluster-released v0.34.2
    VERSION=v1.0.0 EVENT_TYPE=vcluster-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get skip)" = "false" ]
    [ "$(get target_folder)" = "vcluster" ]
}

@test "vcluster: a sync of a minor that only shares a prefix doesn't block the next major" {
    record_sync vcluster-released v0.350.0
    VERSION=v1.0.0 EVENT_TYPE=vcluster-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get target_folder)" = "vcluster" ]
}

@test "vcluster: a platform sync of the same version doesn't block the next major" {
    record_sync platform-released v0.35.0
    VERSION=v1.0.0 EVENT_TYPE=vcluster-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get target_folder)" = "vcluster" ]
}

@test "sync PR title still matches the subject the history guard greps for" {
    # The unfrozen-line and out-of-range history checks read merged sync
    # subjects; renaming the title template would disable them silently.
    workflow="${BATS_TEST_DIRNAME}/../../.github/workflows/handle-source-release.yml"
    grep -qF -- '--title "docs: sync ${EVENT} ${VERSION}"' "$workflow"
}

@test "vcluster: next major past .0 (1.1.0 against 0.x history) → skip" {
    VERSION=v1.1.0 EVENT_TYPE=vcluster-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get skip)" = "true" ]
    [ "$(get channel)" = "out-of-range" ]
}

@test "vcluster: two majors ahead (2.0.0 against 0.x history) → skip" {
    VERSION=v2.0.0 EVENT_TYPE=vcluster-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get skip)" = "true" ]
    [ "$(get channel)" = "out-of-range" ]
}

@test "vcluster: skipped a minor (current=0.34, incoming=0.36) → skip" {
    VERSION=v0.36.0 EVENT_TYPE=vcluster-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get skip)" = "true" ]
    [ "$(get channel)" = "out-of-range" ]
}

@test "vcluster: minor RC on frozen minor is skipped" {
    VERSION=v0.34.0-rc.3 EVENT_TYPE=vcluster-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get skip)" = "true" ]
    [ "$(get target_folder)" = "" ]
    [ "$(get channel)" = "rc-patch" ]
}

@test "vcluster: patch RC on frozen minor is skipped" {
    VERSION=v0.34.5-rc.1 EVENT_TYPE=vcluster-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get skip)" = "true" ]
    [ "$(get target_folder)" = "" ]
    [ "$(get channel)" = "rc-patch" ]
}

@test "vcluster-cli: patch RC on frozen minor is skipped" {
    VERSION=v0.34.5-rc.2 EVENT_TYPE=vcluster-cli-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get skip)" = "true" ]
    [ "$(get target_folder)" = "" ]
    [ "$(get channel)" = "rc-patch" ]
}

@test "platform: patch RC on the current generator minor is skipped" {
    # The fixture pins api to 4.9, so this exercises RC filtering rather
    # than the stale-line guard for older Platform releases.
    VERSION=v4.9.5-rc.4 EVENT_TYPE=platform-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get skip)" = "true" ]
    [ "$(get target_folder)" = "" ]
    [ "$(get channel)" = "rc-patch" ]
}

@test "vcluster: RC of next minor → current docs folder, channel=rc" {
    # Next minor against max-frozen 0.34 is 0.35 (max + 1).
    VERSION=v0.35.0-rc.1 EVENT_TYPE=vcluster-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get skip)" = "false" ]
    [ "$(get target_folder)" = "vcluster" ]
    [ "$(get channel)" = "rc" ]
}

@test "vcluster-cli: RC of next minor routes to current docs" {
    VERSION=v0.35.0-rc.1 EVENT_TYPE=vcluster-cli-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get skip)" = "false" ]
    [ "$(get target_folder)" = "vcluster" ]
    [ "$(get channel)" = "rc" ]
}

@test "platform: RC of next minor routes to current docs" {
    VERSION=v4.10.0-rc.1 EVENT_TYPE=platform-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get skip)" = "false" ]
    [ "$(get target_folder)" = "platform" ]
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
    [ "$status" -eq 0 ]
    [ "$(get skip)" = "false" ]
    [ "$(get target_folder)" = "vcluster_versioned_docs/version-0.34.0" ]
    [ "$(get channel)" = "stable" ]
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
    # 4.10 is newer than both the highest frozen line and the api pin (4.9), so
    # the older-line guard lets it through to the current docs root.
    VERSION=v4.10.0 EVENT_TYPE=platform-released run "$SCRIPT"
    [ "$(get skip)" = "false" ]
    [ "$(get target_folder)" = "platform" ]
}

@test "platform: next major before the generator moved to its api major → skip (major-cutover)" {
    # The pin bump can't move the generator from api/v4 to api/v5, so the
    # run would fail later; skip it with a channel the workflow alerts on.
    VERSION=v5.0.0-rc.1 EVENT_TYPE=platform-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get skip)" = "true" ]
    [ "$(get channel)" = "major-cutover" ]
}

@test "platform: frozen next major while the generator is still on the old api major → skip (major-cutover)" {
    # The team freezes a new major at rc-1, so 5.0 gets a versioned folder
    # before the generator moves; that route must not bypass the check.
    mkdir -p "$FIXTURE/platform_versioned_docs/version-5.0.0"
    printf '["5.0.0", "4.9.0"]\n' >"$FIXTURE/platform_versions.json"
    VERSION=v5.0.1 EVENT_TYPE=platform-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get skip)" = "true" ]
    [ "$(get channel)" = "major-cutover" ]
}

@test "platform: no readable generator import → skip (generator-unknown), never an unguarded route" {
    # Without the import the stale-line guard can't run, and 4.8 would pull
    # the pin down to a line the generator doesn't compile against.
    rm -r "$FIXTURE/hack"
    VERSION=v4.8.3 EVENT_TYPE=platform-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get skip)" = "true" ]
    [ "$(get channel)" = "generator-unknown" ]
}

@test "platform: generator importing two api majors → skip (generator-unknown)" {
    printf 'import (\n\t"github.com/loft-sh/api/v4/pkg/apis/management/v1"\n\t"github.com/loft-sh/api/v5/pkg/apis/storage/v1"\n)\n' \
        >>"$FIXTURE/hack/platform/partials/main.go"
    VERSION=v4.9.1 EVENT_TYPE=platform-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get channel)" = "generator-unknown" ]
}

@test "platform: api major in a comment or test file doesn't count as the generator's import" {
    printf '// TODO: move to github.com/loft-sh/api/v5/pkg/apis once it ships\n' \
        >>"$FIXTURE/hack/platform/partials/main.go"
    printf 'package main\n\nimport _ "github.com/loft-sh/api/v5/pkg/apis/management/v1"\n' \
        >"$FIXTURE/hack/platform/partials/main_test.go"
    VERSION=v4.8.3 EVENT_TYPE=platform-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get channel)" = "stale-line" ]
}

@test "platform: module-root import (no subpackage) still names the api major" {
    printf 'package main\n\nimport api "github.com/loft-sh/api/v4"\n' >"$FIXTURE/hack/platform/partials/main.go"
    VERSION=v4.8.3 EVENT_TYPE=platform-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get channel)" = "stale-line" ]
}

@test "platform: next major past .0 (5.1.0 against 4.x history) → skip with channel=out-of-range" {
    # After the cutover, so the major-cutover check isn't what stops it.
    cut_over_to_next_major
    VERSION=v5.1.0 EVENT_TYPE=platform-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get skip)" = "true" ]
    [ "$(get channel)" = "out-of-range" ]
}

# The generator imports api/v5 and go.mod pins it; current docs belong to 5.0.
cut_over_to_next_major() {
    generator_imports_api 5
    write_gomod \
        "github.com/loft-sh/agentapi/v5 v5.0.0-rc.1" \
        "github.com/loft-sh/api/v5 v5.0.0-rc.1"
}

@test "platform: next major after the cutover while the next minor already synced into current → skip (out-of-range)" {
    # 4.10 is in current docs but not frozen; 5.0 would overwrite it.
    record_sync platform-released v4.10.1
    cut_over_to_next_major
    VERSION=v5.0.0-rc.2 EVENT_TYPE=platform-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get skip)" = "true" ]
    [ "$(get channel)" = "out-of-range" ]
}

@test "platform: a vcluster sync of the same version doesn't block the next major" {
    record_sync vcluster-released v4.10.0
    cut_over_to_next_major
    VERSION=v5.0.0 EVENT_TYPE=platform-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get target_folder)" = "platform" ]
}

@test "platform: RC of next major after the cutover → current docs folder, channel=rc" {
    cut_over_to_next_major
    VERSION=v5.0.0-rc.2 EVENT_TYPE=platform-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get skip)" = "false" ]
    [ "$(get target_folder)" = "platform" ]
    [ "$(get channel)" = "rc" ]
}

@test "platform: stable release of next major after the cutover → current docs folder" {
    cut_over_to_next_major
    VERSION=v5.0.0 EVENT_TYPE=platform-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get skip)" = "false" ]
    [ "$(get target_folder)" = "platform" ]
    [ "$(get channel)" = "stable" ]
}

@test "platform: patch on the last frozen line after the cutover → skip (stale-line)" {
    cut_over_to_next_major
    VERSION=v4.9.6 EVENT_TYPE=platform-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get skip)" = "true" ]
    [ "$(get channel)" = "stale-line" ]
}

@test "platform: never-frozen next minor after the cutover → skip (unfrozen-line)" {
    # 4.10 is older than the generator but was never documented, which needs a
    # person rather than the routine stale-line skip.
    cut_over_to_next_major
    VERSION=v4.10.0 EVENT_TYPE=platform-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get skip)" = "true" ]
    [ "$(get channel)" = "unfrozen-line" ]
}

@test "platform: a higher api major listed first in go.mod doesn't move the generator line" {
    # api/v5 pulled in indirectly must not count: the generator imports api/v4.
    write_gomod \
        "github.com/loft-sh/api/v5 v5.0.0-rc.1 // indirect" \
        "github.com/loft-sh/api/v4 v4.9.0"
    VERSION=v4.9.1 EVENT_TYPE=platform-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get skip)" = "false" ]
    [ "$(get target_folder)" = "platform_versioned_docs/version-4.9.0" ]
}

@test "platform: exclude entries don't count as the api pin" {
    printf '\nexclude (\n\tgithub.com/loft-sh/api/v4 v4.97.0\n)\n' >>"$FIXTURE/go.mod"
    VERSION=v4.9.1 EVENT_TYPE=platform-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get skip)" = "false" ]
    [ "$(get target_folder)" = "platform_versioned_docs/version-4.9.0" ]
}

@test "platform: a replace of the api module makes the pin unknown → skip (generator-unknown)" {
    # The generator builds against the replacement, which go.mod's require
    # line no longer describes.
    printf '\nreplace github.com/loft-sh/api/v4 => ../api\n' >>"$FIXTURE/go.mod"
    VERSION=v4.9.1 EVENT_TYPE=platform-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get channel)" = "generator-unknown" ]
}

@test "platform: a replace inside a block is caught too" {
    printf '\nreplace (\n\tgithub.com/loft-sh/api/v4 v4.9.0 => github.com/loft-sh/api/v4 v4.10.0-rc.1\n)\n' >>"$FIXTURE/go.mod"
    VERSION=v4.9.1 EVENT_TYPE=platform-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get channel)" = "generator-unknown" ]
}

@test "platform: go.mod with CRLF line endings still yields the api pin" {
    awk '{ printf "%s\r\n", $0 }' "$FIXTURE/go.mod" >"$FIXTURE/go.mod.crlf"
    mv "$FIXTURE/go.mod.crlf" "$FIXTURE/go.mod"
    VERSION=v4.6.5 EVENT_TYPE=platform-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get channel)" = "stale-line" ]
}

@test "unknown event type → skip with channel=unknown-event" {
    VERSION=v1.2.3 EVENT_TYPE=something-else run "$SCRIPT"
    [ "$(get skip)" = "true" ]
    [ "$(get channel)" = "unknown-event" ]
}

@test "leading zero in a version component → skip with channel=invalid" {
    VERSION=v0.08.0 EVENT_TYPE=vcluster-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get skip)" = "true" ]
    [ "$(get channel)" = "invalid" ]
}

@test "octal-looking component (010) → skip with channel=invalid" {
    VERSION=v0.010.0 EVENT_TYPE=vcluster-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get channel)" = "invalid" ]
}

@test "oversized minor can't alias the next major → skip with channel=invalid" {
    # 0*100000+100000 would equal the key for 1.0.
    VERSION=v0.100000.0 EVENT_TYPE=vcluster-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get skip)" = "true" ]
    [ "$(get channel)" = "invalid" ]
}

@test "oversized major can't overflow the key → skip with channel=invalid" {
    VERSION=v576460752303423489.0.0 EVENT_TYPE=vcluster-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get channel)" = "invalid" ]
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

@test "patch RCs write the skip gate and reason to GITHUB_OUTPUT for every event" {
    for event in vcluster-released vcluster-cli-released platform-released; do
        version=v0.34.5-rc.1
        if [ "$event" = "platform-released" ]; then
            version=v4.9.5-rc.1
        fi
        outfile="$BATS_TEST_TMPDIR/${event}.outputs"
        GITHUB_OUTPUT="$outfile" VERSION="$version" EVENT_TYPE="$event" run "$SCRIPT"
        [ "$status" -eq 0 ]
        grep -qx 'skip=true' "$outfile"
        grep -qx 'target_folder=' "$outfile"
        grep -qx 'channel=rc-patch' "$outfile"
        [ "$(cat "$outfile")" = "$output" ]
    done
}

# ── History guards fail closed ─────────────────────────────────────────────
# Which line owns current docs comes from merged sync commits. Without full
# history that answer is unknown, and routing anyway could overwrite a line.

# Marks the fixture shallow at HEAD, so every earlier commit is hidden.
make_shallow() {
    git -C "$FIXTURE" -c user.name=t -c user.email=t@example.com \
        commit -q --allow-empty -m "unrelated"
    git -C "$FIXTURE" rev-parse HEAD >"$FIXTURE/.git/shallow"
}

@test "history: not a git repo → next minor skips (history-unknown)" {
    rm -rf "$FIXTURE/.git"
    VERSION=v0.35.0 EVENT_TYPE=vcluster-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get skip)" = "true" ]
    [ "$(get channel)" = "history-unknown" ]
}

@test "history: not a git repo → next major skips (history-unknown)" {
    rm -rf "$FIXTURE/.git"
    VERSION=v1.0.0 EVENT_TYPE=vcluster-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get channel)" = "history-unknown" ]
}

@test "history: shallow clone hiding a 1.0 sync → next minor skips (history-unknown)" {
    record_sync vcluster-released v1.0.0-rc.1
    make_shallow
    VERSION=v0.35.0 EVENT_TYPE=vcluster-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get channel)" = "history-unknown" ]
}

@test "history: shallow clone hiding a 0.35 sync → next major skips (history-unknown)" {
    record_sync vcluster-released v0.35.0
    make_shallow
    VERSION=v1.0.0 EVENT_TYPE=vcluster-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get channel)" = "history-unknown" ]
}

@test "history: platform next major after the cutover without history skips (history-unknown)" {
    rm -rf "$FIXTURE/.git"
    cut_over_to_next_major
    VERSION=v5.0.0 EVENT_TYPE=platform-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get channel)" = "history-unknown" ]
}

@test "history: routes that never read history still work without a git repo" {
    rm -rf "$FIXTURE/.git"
    VERSION=v0.34.5 EVENT_TYPE=vcluster-released run "$SCRIPT"
    [ "$(get target_folder)" = "vcluster_versioned_docs/version-0.34.0" ]
    VERSION=v9.9.9 EVENT_TYPE=vcluster-released run "$SCRIPT"
    [ "$(get channel)" = "out-of-range" ]
    VERSION=v4.8.1 EVENT_TYPE=platform-released run "$SCRIPT"
    [ "$(get channel)" = "stale-line" ]
    VERSION=v4.10.0 EVENT_TYPE=platform-released run "$SCRIPT"
    [ "$(get target_folder)" = "platform" ]
}

# ── Old-major minors after the new major is frozen ─────────────────────────
# Once X+1.0 is in versions.json, an X.Y+1 that was never frozen is no longer
# "newer than frozen", but it still has no docs and still needs a person.

freeze_vcluster_1_0() {
    mkdir -p "$FIXTURE/vcluster_versioned_docs/version-1.0.0"
    sed -i 's/^\[$/[\n  "1.0.0",/' "$FIXTURE/vcluster_versions.json"
}

freeze_platform_5_0() {
    mkdir -p "$FIXTURE/platform_versioned_docs/version-5.0.0"
    sed -i 's/^\[$/[\n  "5.0.0",/' "$FIXTURE/platform_versions.json"
}

@test "vcluster: never-frozen old-major minor after the new major is frozen → skip (unfrozen-line)" {
    freeze_vcluster_1_0
    VERSION=v0.35.0 EVENT_TYPE=vcluster-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get skip)" = "true" ]
    [ "$(get channel)" = "unfrozen-line" ]
}

@test "vcluster: RC of a never-frozen old-major minor after the new major is frozen → skip (unfrozen-line)" {
    freeze_vcluster_1_0
    VERSION=v0.35.0-rc.1 EVENT_TYPE=vcluster-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get channel)" = "unfrozen-line" ]
}

@test "vcluster-cli: never-frozen old-major minor after the new major is frozen → skip (unfrozen-line)" {
    freeze_vcluster_1_0
    VERSION=v0.35.1 EVENT_TYPE=vcluster-cli-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get channel)" = "unfrozen-line" ]
}

@test "platform: never-frozen old-major minor after the new major is frozen → skip (unfrozen-line)" {
    freeze_platform_5_0
    cut_over_to_next_major
    VERSION=v4.10.0 EVENT_TYPE=platform-released run "$SCRIPT"
    [ "$status" -eq 0 ]
    [ "$(get channel)" = "unfrozen-line" ]
}

@test "frozen, pruned, archived and gap lines stay quiet after the new major is frozen" {
    freeze_vcluster_1_0
    VERSION=v0.34.5 EVENT_TYPE=vcluster-released run "$SCRIPT"
    [ "$(get target_folder)" = "vcluster_versioned_docs/version-0.34.0" ]
    VERSION=v0.26.3 EVENT_TYPE=vcluster-released run "$SCRIPT"
    [ "$(get channel)" = "stable" ]
    VERSION=v0.20.1 EVENT_TYPE=vcluster-released run "$SCRIPT"
    [ "$(get channel)" = "stable" ]
    VERSION=v0.29.1 EVENT_TYPE=vcluster-released run "$SCRIPT"
    [ "$(get channel)" = "stable" ]
    VERSION=v1.0.2 EVENT_TYPE=vcluster-released run "$SCRIPT"
    [ "$(get target_folder)" = "vcluster_versioned_docs/version-1.0.0" ]
    VERSION=v1.1.0 EVENT_TYPE=vcluster-released run "$SCRIPT"
    [ "$(get target_folder)" = "vcluster" ]
}

@test "platform: frozen old-major lines stay stale-line after the new major is frozen" {
    freeze_platform_5_0
    cut_over_to_next_major
    VERSION=v4.9.6 EVENT_TYPE=platform-released run "$SCRIPT"
    [ "$(get channel)" = "stale-line" ]
    VERSION=v4.3.1 EVENT_TYPE=platform-released run "$SCRIPT"
    [ "$(get channel)" = "stale-line" ]
}
