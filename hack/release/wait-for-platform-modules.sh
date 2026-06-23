#!/usr/bin/env bash
#
# wait-for-platform-modules.sh: block until the released loft-sh/api and
# loft-sh/agentapi module versions are actually consumable by the
# platform-pin bump step, not merely present as GitHub tags.
#
# Run by handle-source-release.yml before the bump step, only for
# platform-released events.
#
# Two checks, in order:
#
#   1. GitHub tag presence (gh api). loft-enterprise's release pipeline
#      publishes its own release first (which fires the repository_dispatch
#      that triggers the receiver), THEN creates the matching tags in
#      loft-sh/{agentapi,api} a short time later. The bump step must not
#      run before those tags exist. (DEVOPS-904.)
#
#   2. Module-proxy resolution (go list -m <module>@<version>). The bump
#      step runs `go mod tidy`, which resolves api/agentapi through GOPROXY
#      (proxy.golang.org; these modules are NOT in GOPRIVATE, which is
#      narrowed to vcluster-pro*). The proxy caches a version only after it
#      first fetches it from the origin, which lags tag creation. DEVOPS-1008:
#      on platform v4.10.1 the tag check passed but `go mod tidy` still
#      failed with `unknown revision v4.10.1` because the proxy had not
#      cached agentapi/v4@v4.10.1 yet. Gating on tag presence first keeps the
#      proxy request from racing ahead of the origin tag; the `go list` step
#      then both verifies and warms the proxy, so the bump never runs ahead
#      of propagation.
#
# `go list -m <module>@<version>` needs -mod=mod: this repo carries a
# vendor/ tree, so the default -mod=vendor cannot satisfy a version query.
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

# Phase 1: GitHub tag presence. Surfaces "upstream never published" as a
# distinct, actionable error instead of a confusing downstream go mod error.
for repo in loft-sh/agentapi loft-sh/api; do
    attempt=0
    until gh api "repos/${repo}/git/refs/tags/${VERSION}" >/dev/null 2>&1; do
        attempt=$((attempt + 1))
        if [ "$attempt" -ge "$MAX_ATTEMPTS" ]; then
            echo "::error::${repo}: tag ${VERSION} not present after ${MAX_ATTEMPTS} attempts; upstream pipeline never published it" >&2
            exit 1
        fi
        echo "${repo}: waiting for tag ${VERSION} (attempt ${attempt}/${MAX_ATTEMPTS})"
        sleep "$SLEEP_SECONDS"
    done
    echo "::notice::${repo}: tag ${VERSION} present (attempt ${attempt})"
done

# Phase 2: module-proxy resolution. This is what the bump step's `go mod
# tidy` actually requires; checking it here keeps the bump from racing
# proxy propagation.
for mod in "github.com/loft-sh/agentapi/${major}" "github.com/loft-sh/api/${major}"; do
    attempt=0
    until GOFLAGS=-mod=mod go list -m "${mod}@${VERSION}" >/dev/null 2>&1; do
        attempt=$((attempt + 1))
        if [ "$attempt" -ge "$MAX_ATTEMPTS" ]; then
            echo "::error::${mod}@${VERSION} did not resolve through the module proxy after ${MAX_ATTEMPTS} attempts; proxy propagation stalled" >&2
            exit 1
        fi
        echo "${mod}: waiting for proxy to resolve ${VERSION} (attempt ${attempt}/${MAX_ATTEMPTS})"
        sleep "$SLEEP_SECONDS"
    done
    echo "::notice::${mod}: resolves at ${VERSION} through the proxy (attempt ${attempt})"
done
