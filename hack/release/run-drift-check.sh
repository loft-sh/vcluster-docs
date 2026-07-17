#!/usr/bin/env bash
#
# run-drift-check.sh — detect CLI/config drift in hand-written prose after a
# release-dispatch regenerates the canonical references, and signal whether a
# Claude fix PR should be opened.
#
# This runs as a NON-BLOCKING step of handle-source-release.yml's sync job: it
# must never fail the job or block the canonical docs-sync PR. Drift is signaled
# through the `drift_detected` output, never the exit code, and every tool
# failure degrades to "no drift" with a ::warning::. The only hard failures are
# a missing required env var (a workflow wiring bug the bats suite guards).
#
# Inputs (env):
#   EVENT_TYPE     vcluster-released | vcluster-cli-released | anything else.
#                  Only the two vCluster events run a check; platform and any
#                  other event are a deliberate no-op (scope is vCluster only).
#   TARGET_FOLDER  Docs folder from classify-version.sh, e.g. "vcluster" or
#                  "vcluster_versioned_docs/version-0.34.0".
#   OLD_REF        Git ref holding the pre-sync command set, used only by
#                  cli-drift's command-drift diff. Defaults to HEAD.
#   REPORT_DIR     Directory to write the JSON drift report into. Default $PWD.
#   REPO_ROOT      (optional) docs repo root. Default $PWD.
#   DRY_RUN        (optional) "true" prints the resolved tool command and exits
#                  without building or running it. Used by the bats suite.
#
# Outputs (key=value on stdout, also appended to $GITHUB_OUTPUT when set):
#   drift_detected  true | false
#   report_path     path to the JSON report when drift was detected, else ""
#
# Exit codes: 0 always, except a missing required env var (non-zero).

set -eo pipefail

: "${EVENT_TYPE:?EVENT_TYPE env var required (vcluster-released|vcluster-cli-released|...)}"
: "${TARGET_FOLDER:?TARGET_FOLDER env var required}"
REPO_ROOT="${REPO_ROOT:-$PWD}"
REPORT_DIR="${REPORT_DIR:-$PWD}"
OLD_REF="${OLD_REF:-HEAD}"
DRY_RUN="${DRY_RUN:-false}"

emit() {
    printf '%s=%s\n' "$1" "$2"
    if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
        printf '%s=%s\n' "$1" "$2" >>"$GITHUB_OUTPUT"
    fi
}

emit_none() {
    emit drift_detected false
    emit report_path ""
}

case "$EVENT_TYPE" in
    vcluster-cli-released)
        tool="cli-drift"
        report="${REPORT_DIR}/cli-drift.json"
        args=(--cli "${TARGET_FOLDER}/cli"
              --docs "${TARGET_FOLDER}"
              --old-ref "${OLD_REF}"
              --label "vcluster-cli (${TARGET_FOLDER})"
              --json-output "${report}")
        ;;
    vcluster-released)
        tool="config-drift"
        report="${REPORT_DIR}/config-drift.json"
        args=(--config "${TARGET_FOLDER}/_partials/config"
              --docs "${TARGET_FOLDER}"
              --label "vcluster (${TARGET_FOLDER})"
              --json-output "${report}")
        ;;
    *)
        echo "run-drift-check.sh: no prose drift check for EVENT_TYPE='${EVENT_TYPE}' (vCluster CLI/config only)"
        emit_none
        exit 0
        ;;
esac

if [[ "$DRY_RUN" == "true" ]]; then
    printf 'go run ./hack/%s %s\n' "$tool" "${args[*]}"
    exit 0
fi

cd "$REPO_ROOT"
mkdir -p "$REPORT_DIR"

bin="$(mktemp -d)/${tool}"
if ! go build -C "hack/${tool}" -o "$bin" .; then
    echo "::warning::run-drift-check: could not build ${tool}; skipping drift check"
    emit_none
    exit 0
fi

set +e
"$bin" "${args[@]}"
code=$?
set -e

case "$code" in
    0)
        echo "No ${tool} drift detected."
        emit_none
        ;;
    1)
        echo "${tool} drift detected; report at ${report}"
        emit drift_detected true
        emit report_path "${report}"
        ;;
    *)
        echo "::warning::${tool} exited ${code}; treating as no drift to stay non-blocking"
        emit_none
        ;;
esac
exit 0
