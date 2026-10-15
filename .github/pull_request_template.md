<!--
The Lint check runs Vale on the lines your PR adds and posts its findings as review comments. Vale errors on added lines fail the check, and warnings don't.
Fix what it flags in the prose, but don't change file paths, commands, or config keys to satisfy it. If you can't resolve a finding, ask the docs team in a PR comment.
PRs into the `next` branch don't run the Lint check, so run `vale` on your changed files locally.
Read more about working with vale in the contribution guidelines: https://github.com/loft-sh/vcluster-docs/blob/main/CONTRIBUTING.md#style-guide-automation-style-guide-automation
-->
# Content description
<!-- Brief overview of changes (1-2 sentences) -->


## Preview link
<!-- The preview link or links to the documents-->


## Internal reference
<!--Add the GitHub or Linear ticket reference-->
Closes DOC-


AI review: mention `@claude` in a comment to request a review or changes. See [CONTRIBUTING.md](https://github.com/loft-sh/vcluster-docs/blob/main/CONTRIBUTING.md#ai-assisted-pr-review) for available commands.

> FORK LIMITATION: `@claude` does not work on pull requests opened from forks. GitHub Actions cannot access the required secrets for fork-originated PRs. To use AI review, push your branch directly to this repository.

<!-- Do not change the line below -->
@netlify /docs

