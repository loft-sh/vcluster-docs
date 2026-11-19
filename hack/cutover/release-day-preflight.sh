#!/usr/bin/env bash
# release-day-preflight.sh: read-only go/no-go checks for the Platform 5.0 and
# vCluster 0.38 release PR (next -> main, DOC-1763). It changes nothing. When
# every check passes, it prints the command that opens the release PR.
#
# Usage, from the repo root:
#   bash hack/cutover/release-day-preflight.sh
#
# Exit codes: 0 = go, 1 = at least one blocking check failed.
set -uo pipefail

REPO="loft-sh/vcluster-docs"
blocking=0
pass() { printf '  \033[32mPASS\033[0m  %s\n' "$1"; }
warn() { printf '  \033[33mWARN\033[0m  %s\n' "$1"; }
fail() { printf '  \033[31mFAIL\033[0m  %s\n' "$1"; blocking=1; }

echo "Fetching origin..."
git fetch -q origin main next || { echo "git fetch failed"; exit 1; }

echo
echo "1. Product releases"
for pair in "loft-sh/loft v5.0.0" "loft-sh/vcluster v0.38.0"; do
    set -- $pair
    if gh release view "$2" -R "$1" >/dev/null 2>&1; then
        pass "$1 $2 is published (check-latest-versions needs it)"
    else
        fail "$1 $2 is not published yet. Wait for it before opening the PR."
    fi
done

echo
echo "2. Release sync PRs into next"
open_syncs="$(gh pr list -R "$REPO" --base next --state open --author app/github-actions \
    --json number,title -q '.[] | "#\(.number) \(.title)"')"
if [[ -n "$open_syncs" ]]; then
    while IFS= read -r line; do
        fail "Open sync PR into next: $line. Merge it once its checks pass (it writes version-5.0.0 or version-0.38.0), then rerun."
    done <<< "$open_syncs"
else
    pass "No open release sync PRs into next"
fi
ga_sync="$(gh pr list -R "$REPO" --base next --state merged --search 'v5.0.0 in:title' \
    --json number,title -q '.[] | select(.title | test("v5\\.0\\.0($|[^-])")) | "#\(.number) \(.title)"' | head -1)"
if [[ -n "$ga_sync" ]]; then
    pass "Platform v5.0.0 GA sync merged: $ga_sync"
else
    warn "No merged Platform v5.0.0 GA sync PR found. That's fine if the run found nothing to change. Check the last handle-source-release run: gh run list -R $REPO --workflow handle-source-release.yml -L 3"
fi

echo
echo "3. Branch state"
ahead="$(git rev-list --count origin/next..origin/main)"
if [[ "$ahead" == "0" ]]; then
    pass "main has no commits that next lacks, so the release PR has no conflicts"
else
    fail "main has $ahead commit(s) that next lacks: $(git log --oneline origin/next..origin/main | head -5 | tr '\n' ';'). Merge main into next first."
fi
open_main="$(gh pr list -R "$REPO" --base main --state open --json number,title -q '.[] | "#\(.number) \(.title)"')"
if [[ -n "$open_main" ]]; then
    while IFS= read -r line; do
        warn "Open PR into main, don't merge it before the release: $line"
    done <<< "$open_main"
fi
existing="$(gh pr list -R "$REPO" --base main --head next --state open --json number -q '.[0].number')"
if [[ -n "$existing" ]]; then
    warn "The release PR is already open: #$existing"
fi

echo
echo "4. Version tokens on next (validate-latest-versions)"
tmp="$(mktemp -d)"
git worktree add -q --detach "$tmp/next" origin/next
if (cd "$tmp/next" && node scripts/check-latest-versions.js >/dev/null 2>&1); then
    pass "check-latest-versions passes on next"
else
    fail "check-latest-versions fails on next. Run 'node scripts/check-latest-versions.js' on next to see why. Before v5.0.0 is published it refuses the 5.0 minor."
fi
git worktree remove --force "$tmp/next"
rm -rf "$tmp"

echo
if [[ "$blocking" -ne 0 ]]; then
    echo "NO-GO: fix the FAIL lines above, then rerun this script."
    exit 1
fi

cat <<'EOF'
GO. Open the release PR with:

  gh pr create -R loft-sh/vcluster-docs --base main --head next \
    --title "docs: publish the Platform 5.0 and vCluster 0.38 docs" \
    --body-file hack/cutover/release-pr-body.md

Then post the details comment:

  gh pr comment <PR> -R loft-sh/vcluster-docs --body-file hack/cutover/release-pr-comment.md

Expected on the PR: Lint fails (Vale fallback on 3,000+ whole files, mostly old
4.x versioned pages) and "Update Lifecycle JSON" fails (it can't push its
date-only regen to next). Neither is a required check. Everything else passes.

Merge: main requires linear history, so use the bypass to merge with a merge
commit, or fast-forward instead (only while main hasn't moved):

  git fetch origin && git push origin origin/next:main

Then run: bash hack/cutover/release-day-post-merge.sh
EOF
