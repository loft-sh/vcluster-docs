#!/usr/bin/env bash
set -eo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

MAIN_BRANCH="${MAIN_BRANCH:-main}"
NEXT_BRANCH="${NEXT_BRANCH:-next}"
REMOTE="${REMOTE:-origin}"

echo "Starting sync of $NEXT_BRANCH with $MAIN_BRANCH"

# Fetch latest changes
echo "Fetching latest changes..."
git fetch "$REMOTE" "$MAIN_BRANCH"
git fetch "$REMOTE" "$NEXT_BRANCH"

# Save current branch to return to it later
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "HEAD")

# Get commits that are only on next (not on main)
echo "Analyzing commits unique to $NEXT_BRANCH..."
NEXT_ONLY_COMMITS=$(git log --oneline "$REMOTE/$MAIN_BRANCH..$REMOTE/$NEXT_BRANCH" 2>/dev/null | wc -l)
echo "Found $NEXT_ONLY_COMMITS commits on $NEXT_BRANCH that are not on $MAIN_BRANCH"

if [ "$NEXT_ONLY_COMMITS" -gt 0 ]; then
    echo "Commits unique to $NEXT_BRANCH:"
    git log --oneline "$REMOTE/$MAIN_BRANCH..$REMOTE/$NEXT_BRANCH" | head -20
fi

# Store the original next SHA for verification
ORIGINAL_NEXT_SHA=$(git rev-parse "$REMOTE/$NEXT_BRANCH")
echo "Original $NEXT_BRANCH SHA: $ORIGINAL_NEXT_SHA"

# Create a temp branch for the rebase attempt
TEMP_BRANCH="temp-sync-$(date +%s)"
echo "Creating temporary branch: $TEMP_BRANCH"
git checkout -b "$TEMP_BRANCH" "$REMOTE/$NEXT_BRANCH"

# Try to rebase onto main
echo "Attempting to rebase $NEXT_BRANCH onto $MAIN_BRANCH..."
if git rebase "$REMOTE/$MAIN_BRANCH"; then
    echo -e "${GREEN}Clean rebase successful${NC}"
    
    # CRITICAL: Verify no commits were lost
    echo "Verifying all commits are preserved..."
    
    # Get the new commit count after rebase
    NEW_COMMITS_AFTER_REBASE=$(git log --oneline "$REMOTE/$MAIN_BRANCH..HEAD" 2>/dev/null | wc -l)
    
    # Check if we have at least the same number of unique commits
    if [ "$NEW_COMMITS_AFTER_REBASE" -lt "$NEXT_ONLY_COMMITS" ]; then
        echo -e "${RED}ERROR: Commit loss detected!${NC}"
        echo "Original unique commits: $NEXT_ONLY_COMMITS"
        echo "Commits after rebase: $NEW_COMMITS_AFTER_REBASE"
        echo "Aborting to prevent data loss!"
        
        # Clean up and exit
        git checkout "$CURRENT_BRANCH" 2>/dev/null || git checkout "$MAIN_BRANCH"
        git branch -D "$TEMP_BRANCH" 2>/dev/null || true
        exit 1
    fi
    
    # Additional safety check: verify specific important commits if needed
    # This could check for specific commit messages or authors
    echo "Rebase statistics:"
    echo "  - Commits unique to next before: $NEXT_ONLY_COMMITS"
    echo "  - Commits unique to next after: $NEW_COMMITS_AFTER_REBASE"
    
    # Check if any commits were actually added from main
    MAIN_COMMITS_ADDED=$(git log --oneline "$ORIGINAL_NEXT_SHA..$REMOTE/$MAIN_BRANCH" 2>/dev/null | wc -l)
    echo "  - New commits from main: $MAIN_COMMITS_ADDED"
    
    if [ "$MAIN_COMMITS_ADDED" -eq 0 ]; then
        echo -e "${YELLOW}Warning: No new commits from main. Next is already up to date.${NC}"
        echo "No push needed."
        git checkout "$CURRENT_BRANCH" 2>/dev/null || git checkout "$MAIN_BRANCH"
        git branch -D "$TEMP_BRANCH" 2>/dev/null || true
        exit 0
    fi
    
    # Success - rebase worked and no commits lost
    echo -e "${GREEN}All commits preserved. Safe to push.${NC}"
    echo "Clean rebase successful"
    
else
    echo -e "${YELLOW}Rebase has conflicts${NC}"
    git rebase --abort
    
    # Fall back to merge strategy for manual resolution
    echo "Creating merge PR for manual conflict resolution..."
    BRANCH_NAME="sync/$MAIN_BRANCH-to-$NEXT_BRANCH-$(date +%Y%m%d-%H%M%S)"
    git checkout -b "$BRANCH_NAME" "$REMOTE/$NEXT_BRANCH"
    
    # Try to merge main into next
    echo "Attempting merge of $MAIN_BRANCH into $NEXT_BRANCH..."
    if git merge "$REMOTE/$MAIN_BRANCH" --no-edit; then
        echo -e "${GREEN}Merge completed successfully${NC}"
    else
        echo -e "${YELLOW}Merge has conflicts that need manual resolution${NC}"
    fi
    
    echo "Conflicts detected - created branch: $BRANCH_NAME"
fi

# Return to original branch
git checkout "$CURRENT_BRANCH" 2>/dev/null || git checkout "$MAIN_BRANCH"

echo "Sync process completed"