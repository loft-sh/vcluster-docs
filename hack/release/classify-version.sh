#!/usr/bin/env bash
#
# classify-version.sh — pure(-ish) classifier for release-dispatch routing.
#
# Maps a released VERSION + EVENT_TYPE to a routing decision:
#   - skip:           true if the version should not produce docs
#   - target_folder:  path (relative to REPO_ROOT) where generated docs land
#   - channel:        stable | rc | alpha | beta | next | stale-line | out-of-range |
#                     unfrozen-line | major-cutover | generator-unknown | invalid | unknown-event
#                     (skip-notice.sh decides which skips fail the run)
#
# Inputs (env):
#   VERSION      Released version, e.g. v0.34.5, v0.34.0-rc.3, v4.6.0-alpha.1
#   EVENT_TYPE   One of: vcluster-released | vcluster-cli-released | platform-released
#   REPO_ROOT    (optional) docs-repo root; default $PWD. Used for folder probes,
#                versions.json, go.mod, the platform generator and git history.
#                Tests override to point at fixtures.
#
# Outputs:
#   key=value lines on stdout, also appended to $GITHUB_OUTPUT when set.
#
# Always exits 0; "skip" is signalled via the output, not the exit code, so a
# calling workflow can branch with `if: steps.classify.outputs.skip != 'true'`
# without conflating skip-by-design with classifier failure.
#
# Routing rules:
#
#   * alpha / beta / next → always skip (next = -next.internal.* prereleases
#     cut from feature branches; these must never open a docs-sync PR, per
#     DEVOPS-1092)
#   * MAJOR.MINOR is the next line after the highest frozen MAJOR.MINOR in the
#     event's versions.json (next minor, or next major's .0) → target = current
#     docs root (the unreleased "next" docs folder); anything further → skip
#     (channel=out-of-range)
#   * MAJOR.MINOR ≤ highest frozen, candidate folder exists →
#     target = versioned folder (e.g. version-0.34.0)
#   * MAJOR.MINOR ≤ highest frozen, candidate folder absent → skip
#     (past minor we don't track)
#   * vcluster events only: the next minor (X.Y+1) after a sync of X+1.0
#     already landed on this branch → skip (channel=unfrozen-line), so the old
#     major's next minor can't overwrite the new major in current docs
#   * platform-released only: MAJOR.MINOR older than the generator's
#     loft-sh/api pin → skip (channel=stale-line), or channel=unfrozen-line
#     when that line was never frozen. Checked before the next-line rule, because
#     once X+1.0 has moved the pin, an X.Y+1 release is also "newer than
#     frozen" but must not pull the pin back down. The platform partials
#     generator reflects against main's pinned api Go types and only compiles
#     against its own line; regenerating an older line is impossible and
#     unnecessary.
#     See the guard below for the full rationale.
#   * platform-released only: a major newer than the one the generator imports
#     → skip (channel=major-cutover), frozen or not, because the pin bump
#     cannot cross a major on its own. If the generator's api line can't be
#     read → skip (channel=generator-unknown) rather than run unguarded.

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

emit_route() {
    # $1 = target folder
    emit skip false
    emit target_folder "$1"
    emit channel "$channel"
    exit 0
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

# No leading zeros, because bash arithmetic reads them as octal (010 is 8, 08
# errors). At most 5 digits, so a minor can never reach the next major's key.
num='(0|[1-9][0-9]{0,4})'

# Prints MAJOR*100000+MINOR for an X.Y.Z version; fails on anything else.
version_key() {
    [[ "$1" =~ ^${num}\.${num}\.${num}$ ]] || return 1
    echo $(( BASH_REMATCH[1] * 100000 + BASH_REMATCH[2] ))
}

incoming_key=$(version_key "${stripped%%-*}") || emit_skip invalid
major=$(( incoming_key / 100000 ))
minor=$(( incoming_key % 100000 ))

# Highest frozen MAJOR.MINOR from versions.json (Docusaurus convention).
versions_path="${REPO_ROOT}/${versions_json}"
highest_key=-1
if [[ -f "$versions_path" ]]; then
    # `|| -n` keeps the last entry when the file has no trailing newline.
    while read -r v || [[ -n "$v" ]]; do
        v_key=$(version_key "$v") || continue
        (( v_key > highest_key )) && highest_key=$v_key
    done < <(tr -d '[]" \t\r' <"$versions_path" | tr ',' '\n')
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
# The generator line is the go.mod require for the api major that
# hack/platform/partials/main.go (the only file run-generator.sh compiles)
# imports. go.mod can also carry other api majors as indirect requires that
# the generator never compiles against. A replace of that module makes the
# real version unknowable from go.mod. The pin is read from go.mod rather than
# highest_key, so the guard stays correct in the window between manually
# freezing a new docs version and the receiver bumping the pin to that line.
if [[ "$EVENT_TYPE" == "platform-released" ]]; then
    generator="${REPO_ROOT}/hack/platform/partials/main.go"
    gen_majors=$(grep -oE '"github\.com/loft-sh/api/v[0-9]+[/"]' "$generator" 2>/dev/null |
        sed -E 's#.*/v([0-9]+).#\1#' | sort -u || true)
    # Exactly one api major, or the guard below can't be trusted.
    [[ "$gen_majors" =~ ^[0-9]+$ ]] || emit_skip generator-unknown
    gen_major=$gen_majors

    pin=$(awk -v mod="github.com/loft-sh/api/v${gen_major}" '
        { sub(/\r$/, "") }
        /^[[:space:]]*\)/ { block = ""; next }
        /^[a-z]+[[:space:]]*\(/ { block = $1; sub(/\(.*/, "", block); next }
        ($1 == "replace" && $2 == mod) || (block == "replace" && $1 == mod) { replaced = 1 }
        $1 == "require" && $2 == mod { pin = $3 }
        block == "require" && $1 == mod { pin = $2 }
        END { if (!replaced) print pin }
    ' "${REPO_ROOT}/go.mod" 2>/dev/null || true)
    pin="${pin#v}"
    gen_key=$(version_key "${pin%%-*}") || emit_skip generator-unknown

    if (( incoming_key < gen_key )); then
        # Newer than anything frozen yet older than the generator means the
        # line was never documented; that needs a person, not a quiet skip.
        (( incoming_key > highest_key )) && emit_skip unfrozen-line
        emit_skip stale-line
    fi
    # incoming_key >= gen_key, so a different major can only be a newer one.
    (( major != gen_major )) && emit_skip major-cutover
fi

if (( incoming_key > highest_key )); then
    # Newer than anything frozen. Only the immediate next line (X.Y+1, or
    # X+1.0 after the highest frozen X.Y) maps to current docs. Anything
    # further is unexpected (e.g. v9.9.9 against a 0.x history) and must not
    # silently write into current. With no versions.json there is no
    # baseline, so only the +1 rule applies.
    next_major=$(( highest_key / 100000 + 1 ))
    if (( incoming_key == highest_key + 1 )); then
        # vCluster has no pin that says which line owns current docs, so use
        # the merged sync history: once X+1.0 has synced, X.Y+1 would
        # overwrite it. Platform gets the same protection from its api pin.
        if [[ "$EVENT_TYPE" != "platform-released" && -n "$(GIT_CEILING_DIRECTORIES="$(dirname "$REPO_ROOT")" \
            git -C "$REPO_ROOT" log -1 --format=%h -E \
            --grep="^docs: sync vcluster(-cli)?-released v${next_major}\.0\." 2>/dev/null || true)" ]]; then
            emit_skip unfrozen-line
        fi
        emit_route "$current_root"
    fi
    (( highest_key >= 0 && incoming_key == next_major * 100000 )) && emit_route "$current_root"
    emit_skip out-of-range
fi

candidate="${versioned_root}/version-${major}.${minor}.0"
[[ -d "${REPO_ROOT}/${candidate}" ]] && emit_route "$candidate"

# Past minor that was frozen-but-pruned (in versions.json, no folder) — skip.
emit_skip "$channel"
