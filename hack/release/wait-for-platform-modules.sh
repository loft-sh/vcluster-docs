#!/usr/bin/env bash
#
# wait-for-platform-modules.sh: block until the released loft-sh/api and
# loft-sh/agentapi module versions are actually consumable by the
# platform-pin bump step, not merely present as GitHub tags.
#
# Run by handle-source-release.yml before bump-platform-pins.sh, only for
# platform-released events.
#
# Two checks, in order:
#
#   1. GitHub tag presence (gh api). loft-enterprise's release pipeline
#      publishes its own release first (which fires the repository_dispatch
#      that triggers the receiver), THEN creates the matching tags in
#      loft-sh/{agentapi,api} a short time later. The bump step must not
#      run before those tags exist. (DEVOPS-904.) A clean 404 means the
#      upstream tag is not there yet; any other gh error (auth, rate limit,
#      5xx, network) is a different problem and is surfaced as such instead
#      of being mislabeled "upstream never published".
#
#   2. Direct-fetch consumability (go mod download <module>@<version>).
#      The bump step routes api + agentapi through direct VCS via
#      GONOPROXY/GONOSUMDB (set by the workflow's "Route api + agentapi to
#      direct VCS" step), so once the GitHub tag exists the module is
#      immediately fetchable. This probe fetches exactly the way the bump
#      does: it confirms the tag resolves to a valid Go module (correct
#      module path/major, readable go.mod, constructible zip), exercises the
#      git auth, and warms the module cache so the bump does not re-download.
#
#      This used to poll the PUBLIC module proxy + sum.golang.org, whose
#      propagation lags tag creation on independent, unbounded timelines and
#      repeatedly stalled this receiver: DEVOPS-1008 (proxy had not cached
#      the version), DEVOPS-1041 (sum.golang.org had not), and platform
#      v4.11.0 (agentapi never propagated within the 10-minute wait while
#      api did). Each "wait longer on Google" fix failed again on the next
#      release. Fetching direct from GitHub removes that dependency: the
#      authoritative signal is the GitHub tag, which check 1 already gates.
#
# `go mod download <module>@<version>` needs -mod=mod: this repo carries a
# vendor/ tree, so the default -mod=vendor cannot satisfy a version query.
#
# Resolution routing: this script relies on GONOPROXY/GONOSUMDB being set
# for api + agentapi (the workflow does this before invoking the script). A
# manual run outside the workflow must export the same, or check 2 falls
# back to the flaky public proxy:
#   export GONOPROXY=github.com/loft-sh/vcluster-pro*,github.com/loft-sh/api,github.com/loft-sh/agentapi
#   export GONOSUMDB=github.com/loft-sh/vcluster-pro*,github.com/loft-sh/api,github.com/loft-sh/agentapi
#
# Inputs (env):
#   VERSION        Released platform version, vX.Y.Z[-pre] (required).
#   GH_TOKEN       Token for gh api tag lookups (required at runtime; the
#                  bats suite shims gh, so it is not needed there).
#   MAX_ATTEMPTS   Poll attempts per check. Default 60.
#   SLEEP_SECONDS  Delay between attempts. Default 10. (10s x 60 = 10 min
#                  ceiling per check.)
#
# The major-version segment is derived from VERSION, so a future v5 cutover
# needs no change here.

set -eo pipefail

: "${VERSION:?VERSION env var required}"
MAX_ATTEMPTS="${MAX_ATTEMPTS:-60}"
SLEEP_SECONDS="${SLEEP_SECONDS:-10}"

stripped="${VERSION#v}"
major="v${stripped%%.*}"

# Phase 1: GitHub tag presence. A clean 404 keeps polling (tag not created
# yet); a non-404 error is surfaced immediately so an auth/API problem is
# not misreported as a missing upstream release.
for repo in loft-sh/agentapi loft-sh/api; do
    attempt=0
    last_err=""
    until last_err="$(gh api "repos/${repo}/git/refs/tags/${VERSION}" 2>&1)"; do
        # Surface a non-404 (auth, rate limit, 5xx, network) as it happens; a
        # clean 404 just means the tag is not created yet.
        case "$last_err" in
            *404*|*"Not Found"*) : ;;
            *) echo "::warning::${repo}: tag query failed with a non-404 error (attempt ${attempt}); retrying: ${last_err}" >&2 ;;
        esac
        attempt=$((attempt + 1))
        if [ "$attempt" -ge "$MAX_ATTEMPTS" ]; then
            # Classify on the FINAL error, so a transient early non-404 does
            # not mislabel a run that ends on a clean 404, or vice versa.
            case "$last_err" in
                *404*|*"Not Found"*)
                    echo "::error::${repo}: tag ${VERSION} not present after ${MAX_ATTEMPTS} attempts; upstream pipeline never published it. last error: ${last_err}" >&2
                    ;;
                *)
                    echo "::error::${repo}: tag ${VERSION} could not be queried after ${MAX_ATTEMPTS} attempts; the last error was not a clean 404, so treat this as a GitHub API/auth problem, not a missing release. last error: ${last_err}" >&2
                    ;;
            esac
            exit 1
        fi
        echo "${repo}: waiting for tag ${VERSION} (attempt ${attempt}/${MAX_ATTEMPTS})"
        sleep "$SLEEP_SECONDS"
    done
    echo "::notice::${repo}: tag ${VERSION} present (attempt ${attempt})"
done

# Phase 2: direct-fetch consumability. Mirrors the bump step's resolution
# (GONOPROXY/GONOSUMDB route these two modules to direct VCS) and warms the
# module cache. Succeeds as soon as the tag from phase 1 is fetchable.
for mod in "github.com/loft-sh/agentapi/${major}" "github.com/loft-sh/api/${major}"; do
    attempt=0
    last_err=""
    until last_err="$(GOFLAGS=-mod=mod go mod download "${mod}@${VERSION}" 2>&1)"; do
        attempt=$((attempt + 1))
        if [ "$attempt" -ge "$MAX_ATTEMPTS" ]; then
            echo "::error::${mod}@${VERSION} did not resolve via direct fetch after ${MAX_ATTEMPTS} attempts; the tag exists but its commit is not yet fetchable from GitHub, or the module's go.mod at that tag is invalid. last error: ${last_err}" >&2
            exit 1
        fi
        echo "${mod}: waiting for ${VERSION} to resolve via direct fetch (attempt ${attempt}/${MAX_ATTEMPTS})"
        sleep "$SLEEP_SECONDS"
    done
    echo "::notice::${mod}: ${VERSION} resolves via direct fetch (attempt ${attempt})"
done
