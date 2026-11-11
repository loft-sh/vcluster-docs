# Resolve docs pull request event

This action resolves current pull request state after a read-only `pull_request`
signal workflow completes. It reads no artifacts. It matches the API run's head
repository, branch, and commit to a PR returned by the commit association API,
then fetches the PR and its current labels. It rejects ambiguous matches.
The consumer must run from the default branch and check `eligible` before using
the other outputs.

The signal workflow must use `pull_request` with the required event types, no
permissions, no secrets, and a no-op step. It is untrusted and must not run
privileged code. The consumer needs `actions: read`, `contents: read`,
`pull-requests: read` (or write for commenting). Pull request access also permits
reading the PR comments used to detect an existing follow-up.

| Input | Default | Purpose |
| --- | --- | --- |
| `github-token` | `github.token` | GitHub API token. |
| `source-workflow` | `.github/workflows/pull-request-events.yaml` | Expected signal workflow path. |
| `expected-base` | Empty | Optional base branch restriction. |

| Output | Purpose |
| --- | --- |
| `eligible` | `true` only for one matching current PR. |
| `event-json` | Full synthetic event with the current API PR and repository. |
| `event-path` | Runner-local event file. |
| `node-options` | Node preload that supplies the synthetic event. Set `RESOLVED_PR_EVENT_PATH` to `event-path`. |
| `pr-number` | PR number. |
| `body-without-comments` | Current PR body with HTML comments removed. |
| `follow-up-created` | Whether a trusted bot posted the follow-up marker or a legacy plain Linear issue URL. |

The relay places the action and label in its run name. These are untrusted hints:
they can narrow a consumer's work, but do not authorize it. The resolver checks
the current PR state and rejects a labeled hint if the label is no longer present.
A forged or replayed hint can still repeat work, so port actions need independent
idempotence for retries and untrusted signals. A signal can be missed if GitHub cannot associate its head
commit with the PR, the head has changed, or the run fails. API calls are capped
at 30, candidate PRs at 10, and comment pages at three. Exhausted limits and API
errors fail the job. No match skips the event.

## Workflow contract

| Stage | Trigger and reads | Effect and output | Skip or failure |
| --- | --- | --- | --- |
| Signal | PR opened, edited, labeled, closed, reopened, or synchronized | No-op with no permissions or secrets | GitHub may require fork approval. Conflicted PRs cannot signal until GitHub can run the workflow. |
| Resolution | Completed signal; repository, run attempt, workflow, commit associations, and current PR from the API | Validated PR identity and current state | Stale or ambiguous identity skips. API errors and exhausted limits fail the job. |
| Ports | Validated merged PR and current labels | Existing backport and forwardport actions create target PRs | Close signals process current labels; label signals process only the matching current label. Replayed or forged signals can still repeat work. A checkout, resolver, or backport failure reaches the existing backport alert. |
| Linear links | Validated PR targeting main | The trusted commenter adds missing Linear links | Dependabot is excluded. All comment pages are checked before any link is added. |
| Follow-up | Current follow-up label and PR comments | Existing Linear action creates an issue, then posts its link with a marker | A trusted bot marker or legacy plain Linear URL skips creation. Runs for the same head serialize. |

This resolver mirrors the identity checks in `loft-sh/github-actions` PR #349.
That action supports merged default-branch PRs only. Docs also needs open PRs and
ports to other base branches, so consolidation needs a separate shared contract.
There is no dependency on an unreleased action tag.

The signal file must reach each target branch, including `next`, before PRs into
that branch can signal. Reopening or synchronizing a PR retries resolution after
its head changes. The migration does not bypass GitHub's fork approvals or
conflict restrictions. Only completed successful signals reach the consumers.

If Linear issue creation succeeds but posting its marker fails, inspect the
created issue before rerunning. The marker provides replay protection after the
comment succeeds; the two remote writes are not atomic.
