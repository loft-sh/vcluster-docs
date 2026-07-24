#!/usr/bin/env bash
#
# classify-version.sh — pure(-ish) classifier for release-dispatch routing.
#
# Maps a released VERSION + EVENT_TYPE to a routing decision:
#   - skip:           true if the version should not produce docs
#   - target_folder:  path (relative to REPO_ROOT) where generated docs land
#   - channel:        stable | rc | alpha | beta | next | stale-line | invalid | unknown-event
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
#   * alpha / beta / next → always skip (next = -next.internal.* prereleases
#     cut from feature branches; these must never open a docs-sync PR, per
#     DEVOPS-1092)
#   * MAJOR.MINOR strictly newer than the highest frozen MAJOR.MINOR in the
#     event's versions.json → target = current docs root (the unreleased
#     "next" docs folder)
#   * MAJOR.MINOR ≤ highest frozen, candidate folder exists →
#     target = versioned folder (e.g. version-0.34.0)
#   * MAJOR.MINOR ≤ highest frozen, candidate folder absent → skip
#     (past minor we don't track)
#   * platform-released only: MAJOR.MINOR older than the loft-sh/api pin in
#     go.mod → skip (channel=stale-line). The platform partials generator
#     reflects against main's pinned api Go types and only compiles against
#     its own line; regenerating an older line is impossible and unnecessary.
#     See the guard below for the full rationale.

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
    *-next*)  emit_skip next  ;;
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
    # Newer than anything frozen. Only the immediate next minor in the
    # same major series can map to current docs — anything further is
    # treated as garbage / unexpected, per A4 appendix B (e.g. v9.9.9
    # against a 0.x history must skip, not silently write into current).
    if (( incoming_key == highest_key + 1 )); then
        emit skip false
        emit target_folder "$current_root"
        emit channel "$channel"
        exit 0
    fi
    emit_skip "$channel"
fi

# ── Platform generator is current-line-only ───────────────────────────────
# The platform partials generator (hack/platform/partials/main.go) reflects
# against the loft-sh/api + loft-sh/agentapi Go types pinned in this repo's
# go.mod, and the receiver bumps that pin to the released version before
# running it. The generator source tracks the CURRENT api line: types get
# moved or added as upstream evolves (e.g. Authentication/Connector moved
# management/v1 → storage/v1 in v4.11.0 per DEVOPS-1081; NodeProfile is v4.11+
# only). So it only compiles against its own line. Bumping the pin DOWN to an
# older released line leaves the generator referencing types that line lacks,
# and the regen fails to compile — blocking every platform docs sync (see the
# v4.10.6 receiver failure, DEVOPS-1168). Older frozen platform minors are
# snapshots whose api reference does not change on a patch release, so skip
# them rather than fail the receiver. (vcluster + vcluster-cli generators
# compile the source checked out at the released tag, so they carry no such
# constraint and older lines still regenerate — this guard is platform-only.)
#
# The generator line is read from go.mod's api pin, not from highest_key, so
# the guard stays correct in the window between manually freezing a new docs
# version and the receiver bumping the pin to that line. If the pin can't be
# read, gen_key stays -1 and the guard is inert (preserves prior behavior).
if [[ "$EVENT_TYPE" == "platform-released" ]]; then
    gen_key=-1
    if [[ -f "${REPO_ROOT}/go.mod" ]]; then
        gen_line=$(sed -n 's#^[[:space:]]*github\.com/loft-sh/api/v[0-9]\+ v\([0-9]\+\.[0-9]\+\)\..*#\1#p' "${REPO_ROOT}/go.mod" | head -n1)
        if [[ "$gen_line" =~ ^([0-9]+)\.([0-9]+)$ ]]; then
            gen_key=$(( BASH_REMATCH[1] * 100000 + BASH_REMATCH[2] ))
        fi
    fi
    if (( gen_key >= 0 && incoming_key < gen_key )); then
        emit_skip stale-line
    fi
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
