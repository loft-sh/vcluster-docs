#!/usr/bin/env bash
# Detect drift between the licensing values stated in the docs and the Go
# constants they came from.
#
# platform/understand/licensing.mdx publishes exact refresh intervals, grace
# periods, cache lifetimes, Secret names, and environment variable names. Those
# live in loft-enterprise and vcluster-pro, neither of which is a dependency of
# this repo, so nothing in the normal build can notice when one changes. This
# script closes that gap: point it at local clones and it reports every constant
# whose declaration no longer matches what constants.json records.
#
# Usage:
#   hack/license-drift/check.sh <loft-enterprise-path> <vcluster-pro-path>
#
# Or set LOFT_ENTERPRISE_PATH and VCLUSTER_PRO_PATH. Exits non-zero on drift.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MANIFEST="${SCRIPT_DIR}/constants.json"

LOFT_ENTERPRISE_PATH="${1:-${LOFT_ENTERPRISE_PATH:-}}"
VCLUSTER_PRO_PATH="${2:-${VCLUSTER_PRO_PATH:-}}"

if [[ -z "${LOFT_ENTERPRISE_PATH}" || -z "${VCLUSTER_PRO_PATH}" ]]; then
  echo "usage: $0 <loft-enterprise-path> <vcluster-pro-path>" >&2
  echo "   or: LOFT_ENTERPRISE_PATH=... VCLUSTER_PRO_PATH=... $0" >&2
  exit 2
fi

for dir in "${LOFT_ENTERPRISE_PATH}" "${VCLUSTER_PRO_PATH}"; do
  if [[ ! -d "${dir}" ]]; then
    echo "error: not a directory: ${dir}" >&2
    exit 2
  fi
done

command -v jq >/dev/null 2>&1 || { echo "error: jq is required" >&2; exit 2; }

if [[ ! -f "${MANIFEST}" ]]; then
  echo "error: manifest not found: ${MANIFEST}" >&2
  exit 2
fi

# Render the manifest up front rather than piping jq straight into the loop.
# In `done < <(jq ...)` the exit status of jq is invisible to set -e, so a
# malformed or restructured constants.json would yield zero records and the
# script would cheerfully report "checked 0 constants ... no drift". Capturing
# first lets a jq failure, or an empty constant set, fail loudly instead.
if ! records="$(jq -er '.constants[] | [.repo, .file, .name, .expected, .documented_as] | @tsv' "${MANIFEST}")"; then
  echo "error: could not read constants from ${MANIFEST} (invalid JSON, or .constants missing/empty)" >&2
  exit 2
fi

if [[ -z "${records//[[:space:]]/}" ]]; then
  echo "error: ${MANIFEST} declares no constants to check" >&2
  exit 2
fi

drift=0
missing=0
checked=0

# Read the manifest as tab-separated records so the loop needs no subshell.
while IFS=$'\t' read -r repo file name expected documented_as; do
  checked=$((checked + 1))

  case "${repo}" in
    loft-enterprise) root="${LOFT_ENTERPRISE_PATH}" ;;
    vcluster-pro)    root="${VCLUSTER_PRO_PATH}" ;;
    *) echo "error: unknown repo in manifest: ${repo}" >&2; exit 2 ;;
  esac

  path="${root}/${file}"
  if [[ ! -f "${path}" ]]; then
    printf 'MISSING FILE  %s\n              %s (%s)\n' "${repo}/${file}" "${name}" "${documented_as}"
    missing=$((missing + 1))
    continue
  fi

  # Match `name = value`, with or without a leading var/const keyword, and strip
  # any trailing line comment (whitespace-preceded, so URLs survive). Take the
  # first declaration in the file.
  actual="$(
    grep -E "^[[:space:]]*(var[[:space:]]+|const[[:space:]]+)?${name}[[:space:]]*=" "${path}" \
      | head -1 \
      | sed -E "s/^[[:space:]]*(var[[:space:]]+|const[[:space:]]+)?${name}[[:space:]]*=[[:space:]]*//" \
      | sed -E 's![[:space:]]+//.*$!!' \
      | sed -E 's/[[:space:]]+$//'
  )" || true

  if [[ -z "${actual}" ]]; then
    printf 'NOT FOUND     %s\n              %s (%s)\n' "${repo}/${file}" "${name}" "${documented_as}"
    missing=$((missing + 1))
    continue
  fi

  if [[ "${actual}" != "${expected}" ]]; then
    printf 'DRIFT         %s\n              %s\n              expected: %s\n              actual:   %s\n              docs say: %s\n' \
      "${repo}/${file}" "${name}" "${expected}" "${actual}" "${documented_as}"
    drift=$((drift + 1))
  fi
done <<< "${records}"

echo
echo "checked ${checked} constants: ${drift} drifted, ${missing} not found"

if (( drift > 0 || missing > 0 )); then
  echo
  echo "Update these docs, then update constants.json to match:"
  jq -r '.docs[] | "  " + .' "${MANIFEST}"
  exit 1
fi

echo "no drift"
