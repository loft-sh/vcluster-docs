#!/usr/bin/env bash
set -eo pipefail

MAIN_BRANCH="${MAIN_BRANCH:-main}"
NEXT_BRANCH="${NEXT_BRANCH:-next}"
REMOTE="${REMOTE:-origin}"

git fetch "$REMOTE" "$MAIN_BRANCH"
git fetch "$REMOTE" "$NEXT_BRANCH"

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "HEAD")

TEMP_BRANCH="temp-sync-$(date +%s)"
git checkout -b "$TEMP_BRANCH" "$REMOTE/$NEXT_BRANCH"

if git rebase "$REMOTE/$MAIN_BRANCH"; then
    echo "Clean rebase successful"
else
    git rebase --abort
    
    BRANCH_NAME="sync/$MAIN_BRANCH-to-$NEXT_BRANCH-$(date +%Y%m%d-%H%M%S)"
    git checkout -b "$BRANCH_NAME" "$REMOTE/$NEXT_BRANCH"
    
    git merge "$REMOTE/$MAIN_BRANCH" --no-edit || true
    
    echo "Conflicts detected - created branch: $BRANCH_NAME"
fi

git checkout "$CURRENT_BRANCH" 2>/dev/null || git checkout "$MAIN_BRANCH"