## Verification

A trial merge of `next` into `main` ran on 2026-11-18 in a scratch worktree. `main` had no commits that `next` lacked, so the merge had no conflicts.

| Check | Result |
| -- | -- |
| Build | Passed. Peak memory 14.4 GB without share cards and 13.3 GB with them (760 cards). |
| `check-redirects.sh pr` against `main` | 0 errors, 0 warnings, no chains. All removed stable routes have redirects. |
| Hurl (`hack/test-vcluster-0.38.hurl`, `hack/test-platform-5.0.hurl`) | 1,284 requests passed against the trial build served by `netlify dev`. |
| Check-partials, SPA links, reusable imports, glossary, feature tables, Platform CLI index, EOS/EOL labels | Passed |
| `validate-versioned-links` | 148 known errors. The job is allowed to fail. |

## Expected check failures

Neither of these is a required check.

- **Lint.** With more than 300 changed files, the Vale step falls back to `vale --minAlertLevel error` on whole files, not just added lines. The trial found 99 errors, almost all `Vale.Terms` in 4.x versioned pages that the link pinning touched, plus generated text in `platform-cli-commands.mdx`.
- **Update Lifecycle JSON.** The regenerated JSON differs from `next` only in `lastUpdated`, and the job can't push to `next`.

## Merge method

`main` requires linear history, so merge with a merge commit using the ruleset bypass. Squash would collapse the release history into one commit. If `main` hasn't moved, fast-forwarding `main` to `next` gives the same result.

## After the merge

`bash hack/cutover/release-day-post-merge.sh` runs the hurl tests against production, then closes #3165 and #2499 and merges loft-sh/vmetal-docs#85 after asking. It lists the manual steps last: the Algolia crawl, the Notion links, and the backport announcement.
