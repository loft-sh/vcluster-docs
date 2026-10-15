#!/usr/bin/env bash
# check-partials.sh — Fail when a PR adds a hand-written file under _partials/.
#
# _partials/ holds generated content only. Hand-written reusable snippets go
# in _fragments/. See "Partials vs fragments" in CLAUDE.md. Existing
# hand-written files in _partials/ are legacy and aren't flagged, and neither
# are moves, so only new files count.
#
# Checks the unversioned trees (vcluster/, platform/, docs/). Versioned docs
# are copies made at release time and are out of scope.
#
# Usage:
#   bash hack/check-partials.sh                     # compare HEAD to origin/$GITHUB_BASE_REF (default main)
#   GITHUB_BASE_REF=next bash hack/check-partials.sh
#
# Break-glass: add the "partials-check-skip" label to the PR (handled by the
# workflow, not this script).
#
# Exit codes:
#   0 - No hand-written files added under _partials/
#   1 - One or more were added
#   2 - Base ref not found

set -euo pipefail

# Paths a generator writes. Anything else added under _partials/ is hand-written.
GENERATED_PATTERN='^(vcluster/_partials/config/|platform/api/_partials/resources/|platform/_partials/reference/platform-cli-commands\.mdx$)'

base="${GITHUB_BASE_REF:-main}"
if git rev-parse --verify --quiet "origin/${base}" >/dev/null; then
    base_ref="origin/${base}"
elif git rev-parse --verify --quiet "${base}" >/dev/null; then
    base_ref="${base}"
else
    echo "::error::Base ref '${base}' not found. Fetch it first (actions/checkout with fetch-depth: 0)."
    exit 2
fi

# -M50 reports moves as renames rather than adds, so restructures that move
# existing partials don't trip the check.
added="$(git diff --name-only -M50 --diff-filter=A "${base_ref}...HEAD" -- vcluster platform docs \
    | grep -E '(^|/)_partials/' \
    | grep -v -E "${GENERATED_PATTERN}" || true)"

if [[ -z "$added" ]]; then
    echo "No hand-written files added under _partials/."
    exit 0
fi

echo "These new files are under _partials/, which is for generated content only:"
while IFS= read -r f; do
    echo "  $f"
    echo "::error file=${f}::Hand-written snippet added under _partials/. Move it to the matching _fragments/ folder (see \"Partials vs fragments\" in CLAUDE.md)."
done <<< "$added"
echo
echo "Move each file to the matching _fragments/ folder, for example"
echo "vcluster/_partials/foo.mdx -> vcluster/_fragments/foo.mdx, and update its imports."
echo "If a generator now writes one of these paths, add it to GENERATED_PATTERN in this script."
exit 1
