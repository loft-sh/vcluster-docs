#!/usr/bin/env bash
#
# bump-platform-pins.sh: pin this repo's loft-sh/api + loft-sh/agentapi
# module requirements to the just-released platform version, re-tidy and
# re-vendor, and assert the selected versions are exactly the release.
#
# Run by handle-source-release.yml on platform-released events, after
# wait-for-platform-modules.sh confirms the tags are consumable.
#
# Why bump at all: the platform partials generator reflects against the
# loft-sh/api + loft-sh/agentapi types pinned here. Without moving the pins
# to the released version, regen sees identical types and emits no diff, so
# the receiver produces no PR.
#
# Why re-vendor: this repo carries a vendor/ tree and `go run` resolves with
# vendor semantics. Without re-vendoring, vendor/modules.txt still records
# the previous version while go.mod claims the new one, and the generator
# fails with "inconsistent vendoring". go.mod/go.sum + the bumped vendor
# tree + regenerated partials must ship together in the same docs-sync PR.
#
# Why assert the selected version: `go mod edit -require` sets a floor, not
# a ceiling. Minimal version selection still picks a HIGHER version if any
# transitive requirement exceeds VERSION, which would generate docs against
# unreleased types. The post-tidy check fails loudly instead.
#
# Resolution routing: the workflow's "Route api + agentapi to direct VCS"
# step exports GONOPROXY/GONOSUMDB so api + agentapi resolve straight from
# GitHub, bypassing the public proxy + sum.golang.org whose propagation lag
# repeatedly broke this receiver (DEVOPS-904/1008/1041, platform v4.11.0).
# A manual run of this script outside the workflow must export the same:
#   export GONOPROXY=github.com/loft-sh/vcluster-pro*,github.com/loft-sh/api,github.com/loft-sh/agentapi
#   export GONOSUMDB=github.com/loft-sh/vcluster-pro*,github.com/loft-sh/api,github.com/loft-sh/agentapi
#
# `go list -m` runs with -mod=mod because the vendor tree is stale between
# `go mod tidy` and `go mod vendor`, and vendor mode cannot answer a
# version query against an inconsistent tree.
#
# The major-version segment is derived from VERSION, so a future v5 cutover
# needs no change here.
#
# Inputs (env):
#   VERSION   Released platform version, vX.Y.Z[-pre] (required).

set -eo pipefail

: "${VERSION:?VERSION env var required}"

stripped="${VERSION#v}"
major="v${stripped%%.*}"

echo "Bumping github.com/loft-sh/{api,agentapi}/${major} to ${VERSION}"
go mod edit -require "github.com/loft-sh/agentapi/${major}@${VERSION}"
go mod edit -require "github.com/loft-sh/api/${major}@${VERSION}"
go mod tidy

for mod in "github.com/loft-sh/agentapi/${major}" "github.com/loft-sh/api/${major}"; do
    selected="$(GOFLAGS=-mod=mod go list -m -f '{{.Version}}' "${mod}")"
    if [ "${selected}" != "${VERSION}" ]; then
        echo "::error::${mod} resolved to ${selected}, not the released ${VERSION}; a transitive requirement exceeds the release, so docs would reflect unreleased types" >&2
        exit 1
    fi
    echo "::notice::${mod} pinned at ${selected}"
done

go mod vendor
