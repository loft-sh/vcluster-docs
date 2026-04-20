# ai-pr-review smoke-test matrix (PR #1962)

PR #1962 is a permanent test bed for `loft-sh/github-actions` ai-pr-review.
Never merge. Each row = one configuration cell exercised on a sibling PR
(or on this PR itself for the `openai / low` baseline).

Input axes (see
[`loft-sh/github-actions/.github/actions/ai-pr-review/action.yml`](https://github.com/loft-sh/github-actions/blob/main/.github/actions/ai-pr-review/action.yml)
and its `src/resolve-config.sh`):

- `provider`: `anthropic` | `openai`
- `effort`: `low` | `medium` | `high` → resolves to a provider-specific model
  - openai: low=`gpt-5.4-mini`, medium=`gpt-5.3-codex`, high=`gpt-5.4`
  - anthropic: low=`claude-haiku-4-5`, medium=`claude-sonnet-4-6`, high=`claude-opus-4-7`

The `outcome` axis is gone as of
[`loft-sh/github-actions#129`](https://github.com/loft-sh/github-actions/pull/129)
— the model now picks comment shape per finding (inline for localized
risks, summary for cross-cutting, or both). OpenAI stays summary-only
because `codex-action` has no inline surface.

Verdict legend:

- `check`: conclusion of the `review / ai-review` job on the commit
- `comment`: did a bot comment carrying the `ai-pr-review` provenance
  marker land after the check-run started? (`posted` | `none`)
- `shape`: `ok` (expected shape), `silent` (no comment where one was
  expected), or `fail`
- verdicts populated by `scripts/verify-ai-review.sh <sha>`

## Active matrix

Three cells stay live as ongoing smoke tests. The other provider/effort
combinations were exercised during the sweep and closed; verdicts from
the sweep are captured below for history.

| # | PR | provider | effort | model | check | comment | shape | notes |
|---|----|----------|--------|-------|-------|---------|-------|-------|
| 1 | #1962 | openai | low | gpt-5.4-mini | success | posted | ok | baseline on this PR |
| 2 | #1966 | openai | high | gpt-5.4 | success | posted | ok | openai ceiling |
| 3 | #1973 | anthropic | high | claude-opus-4-7 | success | posted | ok | anthropic ceiling + inline path |

## Closed-cell history (pre-#129 sweep)

Sweep validated every provider × effort combo end-to-end before the
outcome drop. Branches deleted, verdict below:

| provider | effort | outcome | result |
|----------|--------|---------|--------|
| openai | medium | pr-comment | success (#1965, closed) |
| openai | low | inline-review | correctly skipped (#1967, closed) |
| anthropic | low | pr-comment | success (#1968, closed) |
| anthropic | medium | pr-comment | success (#1969, closed) |
| anthropic | high | pr-comment | success after #126 opus-4-7 fix (#1970, closed) |
| anthropic | low | inline-review | success (#1971, closed) |
| anthropic | medium | inline-review | success (#1972, closed) |
| openai | low | pr-comment + force-finding prompt | success (#1974, closed) |
