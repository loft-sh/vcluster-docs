#!/usr/bin/env bash
set -eo pipefail

MAIN_BRANCH="${MAIN_BRANCH:-main}"
NEXT_BRANCH="${NEXT_BRANCH:-next}"
REMOTE="${REMOTE:-origin}"

git fetch "$REMOTE" "$MAIN_BRANCH"
git fetch "$REMOTE" "$NEXT_BRANCH"

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "HEAD")

# Count commits unique to next
NEXT_ONLY_COMMITS=$(git log --oneline "$REMOTE/$MAIN_BRANCH..$REMOTE/$NEXT_BRANCH" 2>/dev/null | wc -l)
ORIGINAL_NEXT_SHA=$(git rev-parse "$REMOTE/$NEXT_BRANCH")

echo "Commits unique to next: $NEXT_ONLY_COMMITS"

# Create temp branch for rebase
TEMP_BRANCH="temp-sync-$(date +%s)"
git checkout -b "$TEMP_BRANCH" "$REMOTE/$NEXT_BRANCH"

if git rebase "$REMOTE/$MAIN_BRANCH"; then
    # Verify no commits were lost
    NEW_COMMITS_AFTER_REBASE=$(git log --oneline "$REMOTE/$MAIN_BRANCH..HEAD" 2>/dev/null | wc -l)
    
    if [ "$NEW_COMMITS_AFTER_REBASE" -lt "$NEXT_ONLY_COMMITS" ]; then
        echo "ERROR: Commit loss detected! Before: $NEXT_ONLY_COMMITS, After: $NEW_COMMITS_AFTER_REBASE"
        git checkout "$CURRENT_BRANCH" 2>/dev/null || git checkout "$MAIN_BRANCH"
        git branch -D "$TEMP_BRANCH" 2>/dev/null || true
        exit 1
    fi
    
    # Check if any new commits from main
    MAIN_COMMITS_ADDED=$(git log --oneline "$ORIGINAL_NEXT_SHA..$REMOTE/$MAIN_BRANCH" 2>/dev/null | wc -l)
    
    if [ "$MAIN_COMMITS_ADDED" -eq 0 ]; then
        echo "No new commits from main"
        git checkout "$CURRENT_BRANCH" 2>/dev/null || git checkout "$MAIN_BRANCH"
        git branch -D "$TEMP_BRANCH" 2>/dev/null || true
        exit 0
    fi
    
    echo "Clean rebase successful"
else
    git rebase --abort
    
    # Fall back to merge
    BRANCH_NAME="sync/$MAIN_BRANCH-to-$NEXT_BRANCH-$(date +%Y%m%d-%H%M%S)"
    git checkout -b "$BRANCH_NAME" "$REMOTE/$NEXT_BRANCH"
    git merge "$REMOTE/$MAIN_BRANCH" --no-edit || true
    echo "Conflicts detected - created branch: $BRANCH_NAME"
fi

git checkout "$CURRENT_BRANCH" 2>/dev/null || git checkout "$MAIN_BRANCH"