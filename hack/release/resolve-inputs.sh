#!/usr/bin/env bash
#
# resolve-inputs.sh — resolve the release event and version for the docs-sync
# receiver, and refuse a version that is not vX.Y.Z[-pre].
#
# The v prefix is load-bearing. The platform sync bumps loft-sh/api and
# loft-sh/agentapi pins in go.mod, and Go only resolves module tags that start
# with v. A source release tagged without it (loft-enterprise 4.12.2-rc.1) can
# never sync, so the receiver fails early instead of at the pin bump.
#
# On rejection the script still publishes the event and a sanitized version as
# outputs. The failure notice reads them, and without them it named neither
# the event nor the version, so on-call had to open the run log.
#
# Inputs (env):
#   GITHUB_EVENT_NAME  "workflow_dispatch" selects the MANUAL_* pair; any other
#                      value selects the DISPATCH_* pair. Set by Actions.
#   DISPATCH_EVENT     repository_dispatch action (github.event.action)
#   DISPATCH_VERSION   repository_dispatch client_payload.version
#   MANUAL_EVENT       workflow_dispatch input event_type
#   MANUAL_VERSION     workflow_dispatch input version
#   PLATFORM_V5_DOCS_BRANCH  main (default) or next before the 5.0 docs cutover
#
# Outputs (key=value on stdout, also appended to $GITHUB_OUTPUT when set):
#   event, version, base_sha, target_branch on success.
#   base_sha is the selected branch's pre-sync commit for the drift check.
#   event, version             on rejection, sanitized, then exit 1.
#
# client_payload is untrusted. The rejected values are reduced to the
# characters a release name can hold and length-capped before they reach a
# workflow command or a Slack message.

set -eo pipefail

emit() {
    printf '%s=%s\n' "$1" "$2"
    if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
        printf '%s=%s\n' "$1" "$2" >>"$GITHUB_OUTPUT"
    fi
}

# sanitize <allowed tr set> <max length> <value>; prints "(missing)" when
# nothing survives, so an empty payload field is visible in the notice.
sanitize() {
    local out
    out=$(printf '%s' "$3" | tr -cd "$1" | cut -c1-"$2")
    printf '%s' "${out:-(missing)}"
}

if [[ "${GITHUB_EVENT_NAME:-}" == "workflow_dispatch" ]]; then
    event="${MANUAL_EVENT:-}"
    version="${MANUAL_VERSION:-}"
else
    event="${DISPATCH_EVENT:-}"
    version="${DISPATCH_VERSION:-}"
fi

# Cheap shape check; classify-version.sh does the authoritative one.
if ! [[ "$version" =~ ^v[0-9]+\.[0-9]+\.[0-9]+(-[A-Za-z0-9.+-]+)?$ ]]; then
    safe_event=$(sanitize 'a-z-' 32 "$event")
    safe_version=$(sanitize 'A-Za-z0-9.+-' 64 "$version")
    emit event "$safe_event"
    emit version "$safe_version"
    echo "::error::Refusing to proceed: version '$safe_version' is not vX.Y.Z[-pre]. The source release tag needs a leading v (for example v4.12.2-rc.1). Re-cut the release with a v-prefixed tag, then re-run this receiver with workflow_dispatch." >&2
    exit 1
fi

emit event "$event"
emit version "$version"

# Keep 5.x regeneration with the redesigned docs until the release cutover.
# The workflow sets this flag to next; remove it when next becomes main.
platform_v5_branch="${PLATFORM_V5_DOCS_BRANCH:-main}"
case "$platform_v5_branch" in
    main|next) ;;
    *) echo '::error::PLATFORM_V5_DOCS_BRANCH must be main or next' >&2; exit 1 ;;
esac
target_branch=main
if [[ "$event" == platform-released && "$version" == v5.* ]]; then
    target_branch="$platform_v5_branch"
fi
base_sha="$(git rev-parse --verify "refs/remotes/origin/$target_branch")"
emit target_branch "$target_branch"
# Manual dispatch may start on a different ref. Drift fixes must still branch
# from the selected sync target, rather than the workflow's initial checkout.
emit base_sha "$base_sha"
