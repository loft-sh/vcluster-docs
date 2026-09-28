#!/usr/bin/env bash
#
# deploy-stacked-preview.sh — upload an already built site as a Netlify draft
# deploy at a fixed alias, so a stacked PR gets a stable preview URL.
#
# Inputs (env):
#   PR_NUMBER            Pull request number. The alias is "pr-<number>".
#   NETLIFY_AUTH_TOKEN   Read by the Netlify CLI.
#   NETLIFY_SITE_ID      Read by the Netlify CLI.
#   NETLIFY_CLI_VERSION  netlify-cli version to run through npx.
#   NETLIFY_BIN          (optional) Netlify CLI executable. Used by the bats
#                        suite instead of npx.
#   PUBLISH_DIR          (optional) Built site folder. Default "public".
#   GITHUB_OUTPUT        (optional) Receives "url=<preview docs URL>".
#
# The alias always matches ^pr-[1-9][0-9]*$. Netlify serves an alias at the
# same subdomain as a branch deploy with that name, and no deployed branch
# (main, next, vcluster-v*, platform-v*) has that shape.

set -euo pipefail

pr_number="${PR_NUMBER:-}"
if [[ ! "$pr_number" =~ ^[1-9][0-9]*$ ]]; then
    echo "::error::PR_NUMBER must be a positive integer, got '${pr_number}'" >&2
    exit 1
fi

alias="pr-${pr_number}"
publish_dir="${PUBLISH_DIR:-public}"

netlify_cli() {
    if [[ -n "${NETLIFY_BIN:-}" ]]; then
        "$NETLIFY_BIN" "$@"
    else
        npx --yes "netlify-cli@${NETLIFY_CLI_VERSION:?NETLIFY_CLI_VERSION is required}" "$@"
    fi
}

result="$(netlify_cli deploy \
    --no-build \
    --json \
    --context deploy-preview \
    --dir "$publish_dir" \
    --alias "$alias" \
    --message "Stacked PR #${pr_number} preview")"

deploy_url="$(jq -r '.deploy_url // empty' <<<"$result")"
if [[ -z "$deploy_url" ]]; then
    echo "::error::Netlify returned no deploy_url: ${result}" >&2
    exit 1
fi

preview_url="${deploy_url%/}/docs/"
echo "Preview: ${preview_url}"
if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
    echo "url=${preview_url}" >> "$GITHUB_OUTPUT"
fi
