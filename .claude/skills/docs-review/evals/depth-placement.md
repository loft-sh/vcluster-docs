# Regression cases: depth and placement

Three cases for the Pass 3 "Depth and placement" check in `../SKILL.md`. They
pull in opposite directions on purpose. One needs trimming, one needs its
detail kept, and one needs better navigation without thin pages. Guidance that
passes only one of them is biased, not working.

Re-run them when you change Pass 3, the "Document the Contract, Not the
Implementation" section of the writer skill's style guide, or the page-type
guide in its `references/templates/README.md`. Re-run them when the model
changes, too. They aren't automated, and a run takes a few minutes per case.

## How to run a case

Give a subagent this prompt, with the case's PR number and revision filled in.
Run the three cases in parallel.

```text
You are trialing a docs review skill on a real PR. Read-only: no edits, no
GitHub comments, no commits, and don't check out branches in the main checkout.

Read these in full: .claude/skills/docs-review/SKILL.md (Pass 3 "Depth and
placement" and "Reporting"), the "Document the Contract, Not the
Implementation" section of
.claude/skills/vcluster-docs-writer/references/style-guide.md, and
the "Page types", "Where reference pages go", and "Signs that content is on the
wrong page" sections of
.claude/skills/vcluster-docs-writer/references/templates/README.md.

Target: loft-sh/vcluster-docs PR #<N> at revision <SHA>. Fetch it with
`git fetch origin pull/<N>/head`, list the changed files with
`git diff --name-only <SHA>^1...<SHA>` or `gh pr view <N> --json files`, and
read each changed page in full with `git show <SHA>:<path>`.

Step 1: Run only the Pass 3 depth and placement check, and report in its
format.

Step 2: Evaluate the skill, not the PR, against this success criterion:
<criterion>. Quote any skill sentence that pushed you toward over-trimming or
over-keeping, and suggest replacement wording. Keep the report under 600 words.
```

`pull/<N>/head` keeps the revision reachable after the branch is merged or
deleted.

## Judging a run

Compare the run with the case's expected outcome, not with the representative
output word for word. Wording and line numbers vary between runs. A run
passes when it keeps everything in "Must keep", reaches the outcome in
"Must reduce", and shows none of the failure signs.

## Case 1: trimming without losing limitations

- **PR:** #3011, vMetal instance lifecycle
- **Revision:** `079089003d8968fc32867c325c95d90c18ec2151`
- **Criterion:** shortens scheduling and retry mechanics while keeping quota
  limitations.
- **Must keep:** quota scope and enforcement, timeouts after which the state
  changes, placement policy, release semantics, and both limitations: the
  NICo quota race and the BMO error that waits with no timeout. The
  limitations may be rewritten as impact plus mitigation.
- **Must reduce:** the scheduling order of waiting requests, retry intervals
  (replaced by "retries automatically"), slot bookkeeping, and the label,
  lock, and Secret names that release removes.
- **Failure signs:** a limitation cut or softened, a new reference page or
  folder proposed for the conditions table, or retry intervals kept as
  contract.
- **Representative output (2026-10-22):** summarized the conditions table's
  retry intervals and kept it inline. Cut only the scheduling order. Rewrote
  both limitations as impact plus mitigation. Proposed no moves and no new
  pages. Asked Engineering how to word the quota race and whether one
  condition reason can occur.

## Case 2: keeping detail a recovery depends on

- **PR:** #2993, Platform backup, restore, and admin recovery
- **Revision:** `dfde5f8bd875a232860043d2fc63b43c48f42fa7`
- **Criterion:** keeps detailed backup and recovery requirements, even where
  they read like internals.
- **Must keep:** what each backup path leaves out, the identity Secrets table
  and its names, the restore startup order, the `serviceUID` status field
  the verify step checks, credential rotation, revocation, and cleanup.
- **Must reduce:** only small summaries, such as how the platform reads the
  project namespace prefix, and the license Secret explanation repeated on a
  sibling page.
- **Failure signs:** Secret names, startup order, or backup omissions cut as
  implementation, or recovery steps moved off the procedure that uses them.
- **Representative output (2026-10-22):** kept every item above. Found no
  moves and no cuts. Summarized five passages, including replacing a repeated
  Secret explanation with a link to the table.

## Case 3: better navigation without thin pages

- **PR:** #2821, NICo bare metal driver guide (one page of about 800 lines)
- **Revision:** `2adced5ca3469cdf77c5965bb1d9d8d674d1d42d`
- **Criterion:** improves navigation without producing many thin pages.
- **Must keep:** authentication requirements, the FNN and FLAT network
  differences, settings that can't change after creation, destructive cleanup
  order, the FLAT isolation limits, and the best-effort capability
  limitation.
- **Must reduce:** a split into a small number of pages, each with its own
  reader and enough content to stand alone, following the `metal3/` driver
  folder.
- **Failure signs:** more than three or four resulting pages, a page that
  holds only one section of another, configuration tables moved away from the
  steps that set them, or a separate project-user page that depends on the
  admin page's variables.
- **Representative output (2026-10-22):** proposed `nico/overview.mdx`
  (concept, about 160 lines), `nico/set-up.mdx` (task, about 520 lines), and
  a borderline `nico/troubleshooting.mdx` (about 40 lines). Turned down a
  project-user page and any reference page. Summarized three passages.
