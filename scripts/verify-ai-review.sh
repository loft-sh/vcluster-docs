#!/usr/bin/env bash
# Verify the ai-pr-review smoke test outcome for a given commit on PR #1962.
# Prints a single line: sha=… check=… comment=… comment_url=… age=…s
#
# Usage: scripts/verify-ai-review.sh [<sha>]
#   default sha = git rev-parse HEAD
#
# Requires: gh (authenticated against github.com), jq.
set -euo pipefail

repo='loft-sh/vcluster-docs'
pr='1962'
sha="${1:-$(git rev-parse HEAD)}"
short="${sha:0:9}"

# Check conclusion of the `review / ai-review` job on this commit.
check_json=$(gh api "repos/$repo/commits/$sha/check-runs" \
  --jq '[.check_runs[] | select(.name=="review / ai-review")][0]')
check=$(jq -r '.conclusion // "pending"' <<<"$check_json")
completed=$(jq -r '.completed_at // empty' <<<"$check_json")

# Latest `github-actions[bot]` comment newer than the check completion.
if [ -n "$completed" ]; then
  comment=$(gh api "repos/$repo/issues/$pr/comments" --paginate \
    --jq "[.[] | select(.user.login==\"github-actions[bot]\") | select(.created_at > \"$completed\")] | sort_by(.created_at) | last")
else
  comment='null'
fi

if [ "$comment" = 'null' ] || [ -z "$comment" ]; then
  comment_status='none'
  comment_url=''
  age='n/a'
else
  comment_status='posted'
  comment_url=$(jq -r '.html_url' <<<"$comment")
  created=$(jq -r '.created_at' <<<"$comment")
  age=$(( $(date -u +%s) - $(date -u -d "$created" +%s) ))s
fi

printf 'sha=%s check=%s comment=%s url=%s age=%s\n' \
  "$short" "$check" "$comment_status" "${comment_url:-none}" "$age"
