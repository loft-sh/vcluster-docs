#!/usr/bin/env bash
# sync-branches.sh: classify how `next` relates to `main` so the Sync Next
# Branch workflow knows what to do. It never changes a branch or the working
# tree; the workflow does the push.
#
# The next ruleset requires linear history and pull requests, so the only
# update that keeps `next` identical to `main` is a fast-forward pushed by an
# account that can bypass the ruleset. A diverged `next` (during a major
# release cycle) needs a person to merge, so this script only reports whether
# that merge is clean and which files conflict.
#
# Writes key=value lines to $SYNC_RESULT_FILE (default: stdout):
#   status=up-to-date | fast-forward | next-ahead | diverged-clean | diverged-conflict
#   main_sha, next_sha, main_ahead, next_ahead
#   conflicts=<space-separated paths>   (diverged-conflict only)
set -euo pipefail

MAIN_BRANCH="${MAIN_BRANCH:-main}"
NEXT_BRANCH="${NEXT_BRANCH:-next}"
REMOTE="${REMOTE:-origin}"
SYNC_RESULT_FILE="${SYNC_RESULT_FILE:-/dev/stdout}"

if [[ "${SKIP_FETCH:-}" != "1" ]]; then
    git fetch --quiet "$REMOTE" "$MAIN_BRANCH" "$NEXT_BRANCH"
fi

main_ref="$REMOTE/$MAIN_BRANCH"
next_ref="$REMOTE/$NEXT_BRANCH"
main_sha="$(git rev-parse "$main_ref")"
next_sha="$(git rev-parse "$next_ref")"
main_ahead="$(git rev-list --count "$next_ref..$main_ref")"
next_ahead="$(git rev-list --count "$main_ref..$next_ref")"
conflicts=""

if [[ "$main_sha" == "$next_sha" ]]; then
    status="up-to-date"
elif [[ "$next_ahead" == "0" ]]; then
    status="fast-forward"
elif [[ "$main_ahead" == "0" ]]; then
    status="next-ahead"
else
    # Dry-run merge in the object store only (git 2.38+). Exit 1 = conflicts.
    if merge_out="$(git merge-tree --write-tree --name-only --no-messages "$next_ref" "$main_ref")"; then
        status="diverged-clean"
    else
        rc=$?
        if [[ "$rc" -ne 1 ]]; then
            echo "git merge-tree failed with exit code $rc" >&2
            exit "$rc"
        fi
        status="diverged-conflict"
        # First line is the tree OID; the rest are conflicted paths.
        conflicts="$(printf '%s\n' "$merge_out" | tail -n +2 | sort -u | tr '\n' ' ' | sed 's/ $//')"
    fi
fi

{
    echo "status=$status"
    echo "main_sha=$main_sha"
    echo "next_sha=$next_sha"
    echo "main_ahead=$main_ahead"
    echo "next_ahead=$next_ahead"
    echo "conflicts=$conflicts"
} >> "$SYNC_RESULT_FILE"
