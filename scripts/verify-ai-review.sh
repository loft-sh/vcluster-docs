#!/usr/bin/env bash
# Verify the ai-pr-review smoke test outcome for a given commit on PR #1962.
# Prints a single line: sha=… check=… comment=posted|none comment_url=… age=…s
#
# A comment counts as "posted" when it comes from github-actions[bot], was
# created after the check-run STARTED (not completed — the comment is posted
# by a step inside the job, so created_at is strictly earlier than the job's
# completed_at), and carries the ai-pr-review provenance marker in its body.
# Looks across all three surfaces the action can post on: issue comments,
# PR reviews (submit-body), and PR review (inline) comments.
#
# Usage: scripts/verify-ai-review.sh [<sha>]
#   default sha = git rev-parse HEAD
#
# Requires: gh (authenticated against github.com), jq.
set -euo pipefail

repo='loft-sh/vcluster-docs'
sha="${1:-$(git rev-parse HEAD)}"
short="${sha:0:9}"
# Auto-detect the PR owning this sha. Multiple cells live on sibling
# PRs now, so hardcoding a single PR number would surface comments
# from the wrong PR.
pr=$(gh api "repos/$repo/commits/$sha/pulls" --jq '.[0].number // empty')
if [ -z "$pr" ]; then
  printf 'sha=%s check=n/a comment=n/a comment_url=none age=n/a\n' "$short"
  echo "no PR associated with sha $short" >&2
  exit 1
fi

# The provenance footer appended by every ai-pr-review comment contains this
# substring. Scoping by it avoids false positives from other bots that share
# the github-actions[bot] identity on this long-lived test-bed PR.
marker='ai-pr-review'

check_json=$(gh api "repos/$repo/commits/$sha/check-runs" \
  --jq '[.check_runs[] | select(.name=="review / ai-review")][0]')
check=$(jq -r '.conclusion // "pending"' <<<"$check_json")
started=$(jq -r '.started_at // empty' <<<"$check_json")

if [ -z "$started" ]; then
  printf 'sha=%s check=%s comment=n/a comment_url=none age=n/a\n' "$short" "$check"
  exit 0
fi

# `gh api --paginate --jq '…'` applies the jq filter per page and
# concatenates — so cross-page operators like `sort_by | last` break once
# the PR grows past one page of comments. Drop --jq here, slurp every
# page array, and apply the filter once after `add` flattens.
paginate() { gh api "$1" --paginate 2>/dev/null || true; }

comment=$(
  {
    paginate "repos/$repo/issues/$pr/comments"
    paginate "repos/$repo/pulls/$pr/reviews"
    paginate "repos/$repo/pulls/$pr/comments"
  } | jq -s --arg started "$started" --arg marker "$marker" '
    (add // [])
    | map(select(.user.login == "github-actions[bot]")
          | select((.body // "") | contains($marker))
          | select(((.created_at // .submitted_at) // "") > $started))
    | sort_by(.created_at // .submitted_at)
    | last')

if [ "$comment" = 'null' ] || [ -z "$comment" ]; then
  comment_status='none'
  comment_url='none'
  age='n/a'
else
  comment_status='posted'
  comment_url=$(jq -r '.html_url // .url' <<<"$comment")
  # jq's fromdateiso8601 is portable across GNU and BSD userland (`date -u -d`
  # is GNU-only and breaks the script on macOS under `set -e`).
  age=$(jq -r '(now - ((.created_at // .submitted_at) | fromdateiso8601)
                | floor | tostring) + "s"' <<<"$comment")
fi

printf 'sha=%s check=%s comment=%s comment_url=%s age=%s\n' \
  "$short" "$check" "$comment_status" "$comment_url" "$age"
