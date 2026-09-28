#!/usr/bin/env bash
#
# needs-stacked-preview.sh — decide whether a PR needs the stacked PR preview.
#
# Netlify builds its own Deploy Preview when a PR's base branch is one it
# deploys. PRs in a native GitHub stack (gh stack) also get one: the API
# reports the stack's bottom base as stack.base.ref, and Netlify previews
# stacks based on main. Deploying those again would duplicate the preview.
#
# Inputs (env):
#   PR_NUMBER  Pull request number.
#   GH_REPO    owner/name. Read by gh.
#   GH_TOKEN   Read by gh.
#   GH_BIN     (optional) gh executable. Used by the bats suite.
#   GITHUB_OUTPUT  (optional) Receives "deploy=true|false".

set -euo pipefail

# netlify_deploys_branch returns 0 when Netlify deploys the branch itself:
# production, next, and the archived version branches.
netlify_deploys_branch() {
    case "$1" in
        main | next | vcluster-v* | platform-v*) return 0 ;;
        *) return 1 ;;
    esac
}

pr_number="${PR_NUMBER:?PR_NUMBER is required}"
gh_bin="${GH_BIN:-gh}"

refs="$("$gh_bin" api "repos/${GH_REPO:?GH_REPO is required}/pulls/${pr_number}" \
    --jq '[.base.ref, (.stack.base.ref // "")] | @tsv')"
IFS=$'\t' read -r base_ref stack_base_ref <<<"$refs"

deploy=true
if netlify_deploys_branch "$base_ref"; then
    echo "Base ${base_ref} gets a Netlify Deploy Preview."
    deploy=false
elif [[ -n "$stack_base_ref" ]] && netlify_deploys_branch "$stack_base_ref"; then
    echo "PR is in a native stack based on ${stack_base_ref}, which gets a Netlify Deploy Preview."
    deploy=false
else
    echo "Base ${base_ref} gets no Netlify Deploy Preview."
fi

if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
    echo "deploy=${deploy}" >> "$GITHUB_OUTPUT"
fi
