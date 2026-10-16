#!/usr/bin/env bash
#
# skip-notice.sh: report a classify-version.sh skip. Routine skips stay a
# notice; skips that need a person fail the run so the Slack alert fires
# instead of the release passing unnoticed.
#
# Inputs (env):
#   EVENT     vcluster-released | vcluster-cli-released | platform-released
#   VERSION   Released version
#   CHANNEL   Channel emitted by classify-version.sh

set -eo pipefail

: "${EVENT:?EVENT env var required}"
: "${VERSION:?VERSION env var required}"
: "${CHANNEL:?CHANNEL env var required}"

case "$CHANNEL" in
    out-of-range)
        reason="not the next line after the highest frozen version in versions.json, versions.json is missing, or a never-frozen minor already owns current docs; freeze the missing version"
        ;;
    unfrozen-line)
        reason="this line was never frozen and current docs belong to a newer line, so it gets no docs; if it needs them, freeze it as its own version folder from this line's content, not a copy of current docs"
        ;;
    history-unknown)
        reason="could not read the full git history of the docs checkout (no repo, a shallow clone, or a git error), which tells which line owns current docs; make sure the checkout is a full clone (fetch-depth: 0) that git can read"
        ;;
    major-cutover)
        reason="hack/platform/partials/main.go imports an older loft-sh/api major than this release; move it to the new major"
        ;;
    generator-unknown)
        reason="could not read one loft-sh/api import from hack/platform/partials/main.go with a matching require (and no replace) in go.mod; update classify-version.sh if the generator moved"
        ;;
    stable|rc|rc-patch|alpha|beta|next|stale-line|invalid|unknown-event)
        echo "::notice::No docs change for $EVENT $VERSION (channel=$CHANNEL)"
        exit 0
        ;;
    *)
        reason="unknown skip channel; add it to hack/release/skip-notice.sh"
        ;;
esac

# A vCluster release dispatches vcluster-released and vcluster-cli-released
# together and both read vcluster_versions.json, so only one of them pages.
if [[ "$EVENT" == "vcluster-cli-released" ]]; then
    echo "::warning::No docs change for $EVENT $VERSION: $reason. The vcluster-released run alerts on this."
    exit 0
fi

# A re-run reuses the original commit, so it would not see the fix.
echo "::error::No docs change for $EVENT $VERSION: $reason. Once the fix is on main, start a new run with Run workflow instead of re-running this one."
exit 1
