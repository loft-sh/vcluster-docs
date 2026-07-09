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
#   2. Checksum-verified download (go mod download <module>@<version>).
#      The bump step runs `go mod tidy`, which both resolves api/agentapi
#      through GOPROXY (proxy.golang.org) AND verifies each module against
#      GOSUMDB (sum.golang.org); these modules are NOT in GOPRIVATE, which
#      is narrowed to vcluster-pro*, so the checksum database is consulted.
#      Both Google services cache a version only after fetching it from the
#      origin, and they lag tag creation independently:
#        - DEVOPS-1008 (platform v4.10.1): the tag check passed but the
#          proxy had not cached agentapi/v4@v4.10.1, so `go mod tidy` failed
#          with `unknown revision`. A `go list -m` probe (proxy only) closed
#          that gap.
#        - DEVOPS-1041 (platform v4.10.2): the proxy HAD cached the version
#          (the `go list -m` probe passed) but sum.golang.org had not, so
#          `go mod tidy` failed verifying the module: 404 from
#          `sum.golang.org/lookup/...` ("unknown revision v4.10.2"). The
#          proxy and the checksum DB propagate on separate timelines, so a
#          proxy-only probe is not sufficient.
#      `go mod download` exercises BOTH services exactly as the bump step
#      does, so the wait does not pass until the release is genuinely
#      consumable. Gating on tag presence first keeps these requests from
#      racing ahead of the origin tag; the download then verifies and warms
#      the module cache, so the bump never runs ahead of propagation.
#
# `go mod download <module>@<version>` needs -mod=mod: this repo carries a
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

# Phase 2: checksum-verified download. `go mod download` resolves through
# the proxy AND verifies against the checksum database (sum.golang.org) for
# these public modules, which is exactly what the bump step's `go mod tidy`
# requires; gating on it here keeps the bump from racing either service's
# propagation.
for mod in "github.com/loft-sh/agentapi/${major}" "github.com/loft-sh/api/${major}"; do
    attempt=0
    until GOFLAGS=-mod=mod go mod download "${mod}@${VERSION}" >/dev/null 2>&1; do
        attempt=$((attempt + 1))
        if [ "$attempt" -ge "$MAX_ATTEMPTS" ]; then
            echo "::error::${mod}@${VERSION} was not downloadable and checksum-verified after ${MAX_ATTEMPTS} attempts; proxy or checksum database (sum.golang.org) propagation stalled" >&2
            exit 1
        fi
        echo "${mod}: waiting for ${VERSION} to download and checksum-verify (attempt ${attempt}/${MAX_ATTEMPTS})"
        sleep "$SLEEP_SECONDS"
    done
    echo "::notice::${mod}: ${VERSION} downloads and checksum-verifies (attempt ${attempt})"
done
