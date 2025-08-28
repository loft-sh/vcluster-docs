#!/usr/bin/env bash
set -eo pipefail

# Simple sync script: merge main into next, or create PR if conflicts

MAIN_BRANCH="${MAIN_BRANCH:-main}"
NEXT_BRANCH="${NEXT_BRANCH:-next}"
REMOTE="${REMOTE:-origin}"

git fetch "$REMOTE" "$MAIN_BRANCH"
git fetch "$REMOTE" "$NEXT_BRANCH"

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

git checkout "$NEXT_BRANCH"

if git merge "$REMOTE/$MAIN_BRANCH" --no-edit; then
    # Clean merge - just push it
    echo "Clean merge successful"
    echo "Run: git push $REMOTE $NEXT_BRANCH"
else
    # Has conflicts - create PR branch
    BRANCH_NAME="sync/$MAIN_BRANCH-to-$NEXT_BRANCH-$(date +%Y%m%d-%H%M%S)"

    # Reset and create new branch from current next
    git merge --abort
    git checkout -b "$BRANCH_NAME" "$REMOTE/$NEXT_BRANCH"

    # Merge with conflicts
    git merge "$REMOTE/$MAIN_BRANCH" --no-edit || true

    echo "Conflicts detected - created branch: $BRANCH_NAME"
    echo "Run: git push $REMOTE $BRANCH_NAME"
    echo "Then create PR from $BRANCH_NAME to $NEXT_BRANCH"
fi

git checkout "$CURRENT_BRANCH"