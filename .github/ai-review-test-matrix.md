# ai-pr-review smoke-test matrix (PR #1962)

PR #1962 is a permanent test bed for `loft-sh/github-actions` ai-pr-review.
Never merge. Each row = one configuration commit on this branch.

Input axes (see `loft-sh/github-actions/.github/actions/ai-pr-review/action.yml`
and `src/resolve-config.sh`):

- `provider`: `anthropic` | `openai`
- `effort`: `low` | `medium` | `high` → resolves to a provider-specific model
  - openai: low=`gpt-5.4-mini`, medium=`gpt-5.3-codex`, high=`gpt-5.4`
  - anthropic: low=`claude-haiku-4-5`, medium=`claude-sonnet-4-6`, high=`claude-opus-4-7`
- `outcome`: `pr-comment` (both providers) | `inline-review` (anthropic only)

Verdict legend:

- `check`: conclusion of the `review / ai-review` job on the commit
- `comment`: did `github-actions[bot]` post a new comment after the job?
- `shape`: `ok` (expected shape), `silent` (no comment where one was expected),
  `skipped` (resolver declined, expected for openai+inline-review), or `fail`

## Matrix

Cell 1 lives on this PR (#1962). Cells 2–11 are disposable sibling PRs;
each branches off `main` with only the workflow file edit.

| # | PR | provider | effort | outcome | model | check | comment | shape | notes |
|---|----|----------|--------|---------|-------|-------|---------|-------|-------|
| 1 | #1962 | openai | low | pr-comment | gpt-5.4-mini | success | yes | ok | "No findings." baseline |
| 2 | #1965 | openai | medium | pr-comment | gpt-5.3-codex | | | | |
| 3 | #1966 | openai | high | pr-comment | gpt-5.4 | | | | |
| 4 | #1967 | openai | low | inline-review | (n/a) | | | | expect `skipped` (openai+inline unsupported) |
| 5 | #1968 | anthropic | low | pr-comment | claude-haiku-4-5 | | | | |
| 6 | #1969 | anthropic | medium | pr-comment | claude-sonnet-4-6 | | | | |
| 7 | #1970 | anthropic | high | pr-comment | claude-opus-4-7 | | | | |
| 8 | #1971 | anthropic | low | inline-review | claude-haiku-4-5 | | | | |
| 9 | #1972 | anthropic | medium | inline-review | claude-sonnet-4-6 | | | | |
| 10 | #1973 | anthropic | high | inline-review | claude-opus-4-7 | | | | |
| 11 | #1974 | openai | low | pr-comment | gpt-5.4-mini | | | | finding-forcing prompt (negative test) |
