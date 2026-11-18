<!--
The Lint check runs Vale on the lines your PR adds and posts its findings as review comments. Vale errors on added lines fail the check, and warnings don't.
Fix what it flags in the prose, but don't change file paths, commands, or config keys to satisfy it. If you can't resolve a finding, ask the docs team in a PR comment.
PRs into the `next` branch don't run the Lint check, so run `vale` on your changed files locally.
Read more about working with vale in the contribution guidelines: https://github.com/loft-sh/vcluster-docs/blob/main/CONTRIBUTING.md#style-guide-automation-style-guide-automation
-->
# Content description
<!-- Brief overview of changes (1-2 sentences) -->
Publishes the Platform 5.0 and vCluster 0.38 docs by merging `next` into `main`. 5.0 and 0.38 become the stable (`lastVersion`) docs with the limited availability banner, and 4.12 and 0.37 stay available as LTS versions.

Merge on the announcement go-ahead only. Verification and expected check failures are in the first comment.

## Preview link
<!-- The preview link or links to the documents-->
Netlify posts the deploy preview on this PR. Check `/docs/platform/` and `/docs/vcluster/`.

## Internal reference
<!--Add the GitHub or Linear ticket reference-->
Closes DOC-1854
Part of DOC-1763

AI review: mention `@claude` in a comment to request a review. Claude reads the PR and posts review comments. See [CONTRIBUTING.md](https://github.com/loft-sh/vcluster-docs/blob/main/CONTRIBUTING.md#ai-assisted-pr-review) for example commands.

> Only members of the `loft-sh` organization can trigger `@claude`. If you're contributing from outside vCluster Labs, ask a maintainer to request the review.

<!-- Do not change the line below -->
@netlify /docs

🤖 Generated with [Claude Code](https://claude.com/claude-code)
