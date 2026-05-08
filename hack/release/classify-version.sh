#!/usr/bin/env bash
#
# classify-version.sh — pure(-ish) classifier for release-dispatch routing.
#
# Maps a released VERSION + EVENT_TYPE to a routing decision:
#   - skip:           true if the version should not produce docs
#   - target_folder:  path (relative to REPO_ROOT) where generated docs land
#   - channel:        stable | rc | alpha | beta | invalid | unknown-event
#
# Inputs (env):
#   VERSION      Released version, e.g. v0.34.5, v0.34.0-rc.3, v4.6.0-alpha.1
#   EVENT_TYPE   One of: vcluster-released | vcluster-cli-released | platform-released
#   REPO_ROOT    (optional) docs-repo root; default $PWD. Used for folder probes
#                and reading versions.json. Tests override to point at fixtures.
#
# Outputs:
#   key=value lines on stdout, also appended to $GITHUB_OUTPUT when set.
#
# Always exits 0; "skip" is signalled via the output, not the exit code, so a
# calling workflow can branch with `if: steps.classify.outputs.skip != 'true'`
# without conflating skip-by-design with classifier failure.
#
# Routing rules (matches A4 design appendix B):
#
#   * alpha / beta  → always skip
#   * MAJOR.MINOR strictly newer than the highest frozen MAJOR.MINOR in the
#     event's versions.json → target = current docs root (the unreleased
#     "next" docs folder)
#   * MAJOR.MINOR ≤ highest frozen, candidate folder exists →
#     target = versioned folder (e.g. version-0.34.0)
#   * MAJOR.MINOR ≤ highest frozen, candidate folder absent → skip
#     (past minor we don't track)

set -eo pipefail

: "${VERSION:?VERSION env var required (e.g. VERSION=v0.34.5)}"
: "${EVENT_TYPE:?EVENT_TYPE env var required (vcluster-released|vcluster-cli-released|platform-released)}"
REPO_ROOT="${REPO_ROOT:-$PWD}"

emit() {
    printf '%s=%s\n' "$1" "$2"
    if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
        printf '%s=%s\n' "$1" "$2" >>"$GITHUB_OUTPUT"
    fi
}

emit_skip() {
    # $1 = channel
    emit skip true
    emit target_folder ""
    emit channel "$1"
    exit 0
}

case "$EVENT_TYPE" in
    vcluster-released|vcluster-cli-released)
        versioned_root="vcluster_versioned_docs"
        current_root="vcluster"
        versions_json="vcluster_versions.json"
        ;;
    platform-released)
        versioned_root="platform_versioned_docs"
        current_root="platform"
        versions_json="platform_versions.json"
        ;;
    *)
        emit_skip unknown-event
        ;;
esac

stripped="${VERSION#v}"

channel=stable
case "$stripped" in
    *-alpha*) emit_skip alpha ;;
    *-beta*)  emit_skip beta  ;;
    *-rc.*|*-rc[0-9]*) channel=rc ;;
esac

base="${stripped%%-*}"
if ! [[ "$base" =~ ^([0-9]+)\.([0-9]+)\.([0-9]+)$ ]]; then
    emit_skip invalid
fi
major="${BASH_REMATCH[1]}"
minor="${BASH_REMATCH[2]}"
incoming_key=$(( major * 100000 + minor ))

# Highest frozen MAJOR.MINOR from versions.json (Docusaurus convention).
versions_path="${REPO_ROOT}/${versions_json}"
highest_key=-1
if [[ -f "$versions_path" ]]; then
    while read -r v; do
        [[ -z "$v" ]] && continue
        if [[ "$v" =~ ^([0-9]+)\.([0-9]+)\.[0-9]+$ ]]; then
            v_major="${BASH_REMATCH[1]}"
            v_minor="${BASH_REMATCH[2]}"
            v_key=$(( v_major * 100000 + v_minor ))
            (( v_key > highest_key )) && highest_key=$v_key
        fi
    done < <(tr -d '[]" ' <"$versions_path" | tr ',' '\n')
fi

if (( incoming_key > highest_key )); then
    # Strictly newer than anything frozen → next/current docs.
    emit skip false
    emit target_folder "$current_root"
    emit channel "$channel"
    exit 0
fi

candidate="${versioned_root}/version-${major}.${minor}.0"
if [[ -d "${REPO_ROOT}/${candidate}" ]]; then
    emit skip false
    emit target_folder "$candidate"
    emit channel "$channel"
    exit 0
fi

# Past minor that was frozen-but-pruned (in versions.json, no folder) — skip.
emit_skip "$channel"
