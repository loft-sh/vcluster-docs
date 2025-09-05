#!/usr/bin/env bash
set -eo pipefail

MAIN_BRANCH="${MAIN_BRANCH:-main}"
NEXT_BRANCH="${NEXT_BRANCH:-next}"
REMOTE="${REMOTE:-origin}"

echo "Syncing $NEXT_BRANCH with $MAIN_BRANCH using merge strategy..."

# Full fetch with complete history
git fetch "$REMOTE" "$MAIN_BRANCH" --tags
git fetch "$REMOTE" "$NEXT_BRANCH" --tags

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Checkout next branch
git checkout "$NEXT_BRANCH"
git pull "$REMOTE" "$NEXT_BRANCH"

# Try to merge main into next
if git merge "$REMOTE/$MAIN_BRANCH" --no-edit --no-ff; then
    echo "Clean merge successful"
    echo "Run: git push $REMOTE $NEXT_BRANCH"
else
    # Conflicts detected - create branch for PR
    git merge --abort

    BRANCH_NAME="sync/$MAIN_BRANCH-to-$NEXT_BRANCH-$(date +%Y%m%d-%H%M%S)"
    git checkout -b "$BRANCH_NAME" "$REMOTE/$NEXT_BRANCH"

    # Attempt merge again on new branch
    git merge "$REMOTE/$MAIN_BRANCH" --no-edit || true

    echo "Conflicts detected - created branch: $BRANCH_NAME"
    echo "Manual resolution required"
fi

# Abort any merge in progress before switching branches
git merge --abort 2>/dev/null || true
git checkout "$CURRENT_BRANCH"