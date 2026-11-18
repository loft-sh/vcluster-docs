#!/usr/bin/env bash
# release-day-post-merge.sh: the steps after the Platform 5.0 and vCluster 0.38
# release PR merges into main (DOC-1763). It runs the production hurl tests,
# then asks before each GitHub action. Steps it can't do are printed at the end.
#
# Usage, from the repo root, after the production deploy finishes:
#   bash hack/cutover/release-day-post-merge.sh
set -uo pipefail

REPO="loft-sh/vcluster-docs"
PROD="https://www.vcluster.com"
ask() { read -r -p "$1 [y/N] " a; [[ "$a" == "y" || "$a" == "Y" ]]; }

echo "1. Confirm production serves 5.0 and 0.38"
ver="$(curl -s "$PROD/docs/platform/" | grep -o 'name=docusaurus_version content=[^ >]*' | head -1)"
echo "   /docs/platform/ -> $ver"
if [[ "$ver" != *5.0.0* ]]; then
    echo "   Production doesn't serve 5.0.0 yet. Wait for the Netlify deploy, then rerun."
    exit 1
fi

echo
echo "2. Hurl tests against production"
if hurl --test --jobs 8 --continue-on-error --variable BASE_URL="$PROD" \
    hack/test-vcluster-0.38.hurl hack/test-platform-5.0.hurl > /tmp/release-hurl-prod.log 2>&1; then
    echo "   PASS: $(grep -E 'Executed requests' /tmp/release-hurl-prod.log)"
else
    echo "   FAIL: see /tmp/release-hurl-prod.log"
    grep -A1 '^error' /tmp/release-hurl-prod.log | grep -- '-->' | head -20
    ask "Continue with the remaining steps anyway?" || exit 1
fi

echo
echo "3. vmetal.ai/docs redirect (DOC-1890)"
if ask "   Merge loft-sh/vmetal-docs#85 now?"; then
    gh pr merge 85 -R loft-sh/vmetal-docs --squash
fi

echo
echo "4. Close superseded PRs into main"
if ask "   Close #3165 (LATEST_VERSIONS bot PR; main now carries 5.0.0 and 0.38.0)?"; then
    gh pr close 3165 -R "$REPO" --comment "Superseded by the Platform 5.0 and vCluster 0.38 release, which set latest-versions.json to 5.0.0 and 0.38.0." --delete-branch
fi
if ask "   Close #2499 (upstream feature sync; superseded by DOC-1788 on next)?"; then
    gh pr close 2499 -R "$REPO" --comment "Superseded by DOC-1788, which ran the same upstream sync on next and is now on main with the 5.0 release."
fi

cat <<'EOF'

5. By hand:
   - Trigger the Algolia crawl (crawler dashboard, `vcluster` index). Indexing takes about an hour.
   - Spot-check a few Platform UI links from a 5.0 UI and the limited availability banner.
   - Switch the three Notion `blob/next` links to `blob/main` (DOC-1854).
   - Post the backport process change.
   - Record the results on DOC-1763, and move the DOC-1760 and DOC-1764 checks along.

Leave "Sync Next Branch" disabled. The script and the next ruleset both need
work first (DOC-1889).
EOF
