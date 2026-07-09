#!/usr/bin/env bash
#
# run-generator.sh — dispatch a release-dispatch event to the matching
# documentation generator with the correct output subpath.
#
# Inputs (env):
#   EVENT_TYPE     vcluster-released | vcluster-cli-released | platform-released
#   TARGET_FOLDER  Folder produced by classify-version.sh, e.g.
#                  "vcluster_versioned_docs/version-0.34.0" or "vcluster".
#   SOURCE_PATH    Local checkout of the released source repo.
#                  (Required for vcluster + cli; ignored for platform, which
#                  reflects against vendored Go types.)
#   REPO_ROOT      (optional) docs repo root. Default $PWD.
#   DRY_RUN        (optional) if "true", print the resolved command and exit
#                  without invoking the generator. Used by the bats suite.
#
# Subpath suffixes per the A4 design doc:
#   vcluster-released      → ${TARGET_FOLDER}/_partials/config
#   vcluster-cli-released  → ${TARGET_FOLDER}/cli
#   platform-released      → ${TARGET_FOLDER}/api/_partials/resources/  (partials)
#                            ${TARGET_FOLDER}/api/resources             (overview)
#
# Note on flag interface: the vcluster + platform partials generators land
# their --source-path / --target-folder / --partials-base / --resources-base
# flags in PR #2b (DEVOPS-888 D.4 / D.5). This router targets that future
# interface so PR #2b can flip the receiver workflow on without touching
# this file. vcluster-cli already accepts the flags as of D.6.

set -eo pipefail

: "${EVENT_TYPE:?EVENT_TYPE env var required}"
: "${TARGET_FOLDER:?TARGET_FOLDER env var required}"
DRY_RUN="${DRY_RUN:-false}"
REPO_ROOT="${REPO_ROOT:-$PWD}"

case "$EVENT_TYPE" in
    vcluster-released)
        : "${SOURCE_PATH:?SOURCE_PATH required for vcluster-released}"
        cmd=(go run hack/vcluster/partials/main.go
             --source-path "$SOURCE_PATH"
             --target-folder "${TARGET_FOLDER}/_partials/config")
        ;;
    vcluster-cli-released)
        : "${SOURCE_PATH:?SOURCE_PATH required for vcluster-cli-released}"
        cmd=(go run hack/vcluster-cli/main.go
             --source-path "$SOURCE_PATH"
             --target-folder "${TARGET_FOLDER}/cli")
        ;;
    platform-released)
        cmd=(go run hack/platform/partials/main.go
             --partials-base "${TARGET_FOLDER}/api/_partials/resources/"
             --resources-base "${TARGET_FOLDER}/api/resources")
        ;;
    *)
        echo "run-generator.sh: unsupported EVENT_TYPE='${EVENT_TYPE}'" >&2
        exit 2
        ;;
esac

if [[ "$DRY_RUN" == "true" ]]; then
    printf '%s\n' "${cmd[*]}"
    exit 0
fi

cd "$REPO_ROOT"
exec "${cmd[@]}"
