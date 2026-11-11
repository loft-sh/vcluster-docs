#!/usr/bin/env bash
# strip-next.sh: drop the /next/ version segment from cross-product links (DOC-1854).
#
# On next, links that cross components point at /docs/platform/next/... and
# /docs/vcluster/next/... because the new paths exist only in the unreleased
# version. At the cutover they must point at stable.
#
# Run on version day, AFTER merging next into the cutover branch and BEFORE
# `docs:version`, so the 5.0 and 0.38 snapshots don't carry /next/ links:
#
#   bash hack/cutover/strip-next.sh --check   # list what would change
#   bash hack/cutover/strip-next.sh           # rewrite in place
#
# Rerunnable: a second run finds nothing to change.
#
# Scope: hand-written content in docs/, platform/, and vcluster/, plus
# src/data/{features,glossary,products}.yaml and the test specs. Never
# versioned docs, generated partials, the generated CLI reference, or
# netlify.toml (its /next/ rules must stay).
set -euo pipefail
export LC_ALL=C

cd "$(git rev-parse --show-toplevel)"

mode="${1:-apply}"

# Matches /docs/<product>/next, base-less /<product>/next (Docusaurus adds
# /docs/), and full www.vcluster.com URLs, followed by /, #, ), a quote, or
# whitespace. The lookbehind skips paths like loft-sh/vcluster/next.
PATTERN='(?<![\w.\/-])((?:https:\/\/www\.vcluster\.com)?(?:\/docs)?\/(?:platform|vcluster))\/next(?=[\/#)"'"'"'`\s]|$)'

files=()
while IFS= read -r f; do files+=("$f"); done < <(
    git grep -l -P "$PATTERN" -- \
        docs platform vcluster \
        src/data/features.yaml src/data/glossary.yaml src/data/products.yaml \
        tests \
        ':!*_versioned_docs/*' \
        ':!vcluster/_partials/config/*' \
        ':!platform/api/_partials/resources/*' \
        ':!platform/_partials/reference/platform-cli-commands.mdx' \
        ':!vcluster/cli/*' \
        || true
)

if [[ ${#files[@]} -eq 0 ]]; then
    echo "No /next/ cross-product links found."
    exit 0
fi

total=0
for f in "${files[@]}"; do
    n=$(perl -ne "\$n++ if /$PATTERN/; END { print \$n+0 }" "$f")
    total=$((total + n))
    if [[ "$mode" == "--check" ]]; then
        printf '%5d  %s\n' "$n" "$f"
    else
        perl -i -pe "s/$PATTERN/\$1/g" "$f"
    fi
done

if [[ "$mode" == "--check" ]]; then
    echo "$total lines in ${#files[@]} files would change."
else
    echo "Stripped /next/ from $total lines in ${#files[@]} files."
    echo "Next: npm run sync-feature-tables && npm run validate-feature-tables"
fi
