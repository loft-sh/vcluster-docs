---
name: docs-fact-check
description: Verify that a docs page describes what the code actually does, by reading the implementation at the right ref. Use when asked whether a page is accurate or correct, to fact check or verify claims, to confirm defaults, flags, log strings, or behavior against source, or before publishing a page an engineer wrote about a feature they built.
---

# Docs fact check

Check prose against the implementation, not against how plausible it sounds.
A well-written page that documents behavior the code doesn't have is worse than
a rough one that's true, because confident prose stops the reader from checking.

This is a standalone pass. `docs-review` covers style, readability, and
usability, and expects this one to have run first when a change makes technical
claims.

## When to use this

Use it when the change asserts something about behavior:

- A page about a feature, especially one an engineer wrote about their own work.
- Any claim about defaults, flags, env vars, annotation keys, log output, CLI
  output, API fields, or chart values.
- Any claim about the UI: nav paths, button text, tab names, field labels. A
  click-through procedure is as falsifiable as a config default, and it rots
  faster.
- A procedure whose steps only work if the described behavior holds.
- Anything that says "always", "never", "automatically", or "by default".

Skip it when there's nothing to verify against source: copy edits, link fixes,
formatting, regenerated reference partials, or a page that only routes readers
to other pages.

## Finding the source

Two ways to reach it. Prefer a local checkout when there is one, because
grepping a whole repo is faster than paging an API, but `gh` reaches any
`loft-sh` repo without a checkout and is a first-class path, not a consolation
prize.

### Which repo owns the claim

The org has over 200 repos, so treat this as a starting point rather than a map.

| Claim is about | Start with |
|----------------|-----------|
| Platform behavior | `loft-sh/loft-enterprise` |
| vCluster behavior | `loft-sh/vcluster-pro` |
| What ships in OSS specifically | `loft-sh/vcluster` |
| Licensing, entitlements, feature gates | `loft-sh/admin-apis` |
| Which tier a feature belongs to | `loft-sh/plans` |
| Platform API types | `loft-sh/api` |
| Certified stack definitions | `loft-sh/certified-stacks` |

Development happens in `vcluster-pro`. `loft-sh/vcluster` is the auto-synced
public OSS mirror, so verify against `vcluster-pro` unless the claim is
specifically about what ships in OSS.

When the table doesn't cover the claim, or you're guessing between two repos,
search the org instead of picking one:

```bash
gh search code --owner loft-sh "<exact string from the page>" --limit 10 \
  --json repository,path -q '.[] | "\(.repository.nameWithOwner): \(.path)"'
```

Searching for a quoted log line, annotation key, or flag name usually lands
directly on the owning repo. That's faster than reasoning about which repo
*should* own it, and it doesn't go wrong when the answer is a repo you didn't
know existed.

### Local checkouts

Don't assume a checkout path. People lay their repos out differently, and a
wrong guess reads as "the source isn't available" when it's just somewhere else.
Look for the repo you need, substituting its name:

```bash
for d in "$(git rev-parse --show-toplevel)/.." "$HOME/git" "$HOME/src" "$HOME/code"; do
  [ -d "$d/<repo>/.git" ] && echo "$(cd "$d/<repo>" && pwd)" && break
done
```

Confirm by remote, not by directory name, since a directory called
`vcluster-pro` can be anything:

```bash
git -C <path> remote get-url origin   # expect loft-sh/vcluster-pro
```

Don't search the whole home directory. If the bounded look fails, fall through
to `gh` rather than asking, since `gh` needs no checkout at all.

### Reading source through gh

No checkout required, and reads can be pinned to a ref, which matters for
unmerged work:

```bash
gh api "repos/loft-sh/<repo>/contents/<path>?ref=<branch-or-sha>" \
  --jq '.content' | base64 -d
gh search code --repo loft-sh/<repo> "<term>" --limit 10 --json path -q '.[].path'
```

Code search covers private repos your token can read. It indexes default
branches, so for an unmerged feature read the PR patch or fetch files at the
head ref instead of relying on search.

### When to ask

Ask the user when you can't work out which repo owns the behavior after
searching, or when a repo you need isn't readable with their `gh` auth. Ask
once, early, before starting verification, so you aren't interrupting a pass
halfway through. Don't ask for a checkout path you could have found, and don't
proceed on a guess.

### When neither path works

If you can reach no source at all, you cannot do this pass. Say so and report
the claims as unverified. Do not fall back to inferring behavior from the prose
under review, from other docs pages, or from what the feature name implies. An
unverified claim reported as unverified is useful. An unverified claim reported
as correct is the failure this skill exists to prevent.

## Scope to the right ref

This is where fact checks go wrong. If the feature is unmerged, `main` shows the
*old* behavior and you conclude the feature doesn't exist. Check for an open PR
before reading anything:

```bash
gh pr list --state all --search "<feature name>" --limit 10 \
  --json number,title,state,headRefName,mergedAt
gh pr diff <N> > <scratchpad>/pr.diff   # read the patch, not main
```

Treat a confident "this doesn't exist" as a scoping error until you have
confirmed you read the right ref.

## Verify each claim

1. Verify claims individually. A page is not correct in aggregate, and one wrong
   default invalidates the procedure around it.
2. Read the layer the claim is actually about. Chart defaults live in
   `chart/values.yaml`, env plumbing in `chart/templates/deployment.yaml`,
   behavior in the Go path the env feeds. A default documented from
   `values.yaml` can still be overridden before it reaches the code.
3. Quote log strings, annotation keys, flag names, and default values from
   source. Don't paraphrase them from the prose under review, and don't
   normalize capitalization or punctuation to match the surrounding sentence.
4. Check the tests. They often state the edge behavior the implementation
   leaves implicit, and they're where "what happens if it's already set" is
   usually answered.
5. **A grep hit is not proof.** Finding the string somewhere in the source tells
   you it exists, not that it plays the role the page claims. A nav path of
   `Tenant Management > Cluster Templates` matched for years because "tenant"
   and "management" each appear somewhere in the UI tree, long after the section
   was renamed. Confirm the string appears in the position the claim puts it in,
   not merely in the repo.
6. **Some strings can't be grepped at all.** Labels built from a prop, template
   names rendered from resources, and anything assembled at runtime have no
   literal to find. Not finding one is not evidence it's wrong. This is the
   clearest case for the unverified verdict, and calling it wrong sends an author
   chasing a rename that never happened.
7. **Verify in the reader's configuration, not just the default.** A claim can be
   true in one state and false in another: a tab bar that collapses to a redirect
   when only one sibling feature is enabled, a field that only renders under a
   license tier, a flag that only exists on one distribution. Ask which states the
   page's reader can be in, then check the claim holds in each. Static analysis
   is blind here, so this is where a human-read page beats a script.
5. If you check rendered output on a deploy preview instead of source, put
   `/next/` after the route base, as in `/docs/platform/next/...`. A bare
   `/docs/platform/...` preview URL serves the released version, not the branch,
   so the page you are checking is not the page you are looking at.

Engineer-authored pages are the common case, and they're usually right about
intent and wrong about edge behavior. Give the happy path a quick read and spend
the time on the branches, the defaults, and the "if it already exists" cases.

### UI claims

Platform docs wrap UI tokens in `<NavStep>`, `<Button>`, `<Label>`, `<Input>`,
and `<Field>`, and there's a report that checks them against the UI source:

```bash
npm run report-platform-ui-drift
# checkout elsewhere:
node scripts/report-platform-ui-drift.js --ui-src <path-to-loft-enterprise>/ui/src
```

It defaults to `loft-enterprise` as a sibling of this repo, so pass `--ui-src`
when it's somewhere else rather than concluding the source is unavailable.

`platform-ui-drift` owns this end to end, including which unmatched tokens are
known false positives, how to confirm a nav path in the sidebar config, and the
fix patterns. Invoke that skill instead of grepping the UI tree yourself. Bring
points 5 through 7 above with you: its report produces leads, not verdicts, and
the conditional-rendering case is one it can't detect at all.

## Shipping gate

If the feature is unmerged, say so as a blocker. Docs must not ship ahead of the
feature. Also check whether anything mechanically prevents the merge:

```bash
gh pr view <N> --json isDraft,reviewDecision,mergeable,mergeStateStatus
```

An approved, non-draft, `MERGEABLE`/`CLEAN` PR can be merged today regardless of what
a review comment says. Flag that to the author rather than converting it to draft
yourself, since that neutralizes existing approvals.

Version claims about unshipped work need care. The `__PLATFORM_VERSION__` and
`__VCLUSTER_VERSION__` tokens resolve to the *current* version, so they cannot
express "requires X or later" for something that hasn't shipped. Don't substitute
one in. If the version isn't knowable yet, leave a visible placeholder with a
`{/* TODO before merge */}` comment rather than a plausible-looking guess.

## Reporting

Report per claim, not per file. For each one, give the claim as the page states
it, the verdict, and the source that settles it as `path:line` at a named ref.

Three verdicts, and keep them distinct:

- **Wrong.** The code does something else. Blocking, and quote what it does instead.
- **Unverified.** You couldn't reach the source, or the feature is unmerged.
  Blocking to publish, but it is not a claim of incorrectness.
- **Correct.** Say which ref you confirmed it at, since that's what makes the
  check repeatable when the code moves.

Distinguishing wrong from unverified matters more than it looks. Collapsing them
sends an author rewriting prose that was right all along.

## Delegating

If you fan this out to subagents, give each one the ref to verify against, in the
prompt, explicitly. A subagent told only "check the admin recovery feature" will
scope itself to `main` and report that the feature doesn't exist. Treat a
confident "this doesn't exist" from a subagent as a scoping error until you've
confirmed the agent read the right ref.
