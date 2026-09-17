---
name: docs-three-pass-review
description: Review a docs change in three distinct passes - style, readability, and usability - after verifying every technical claim against source. Use when reviewing a docs PR or branch, when asked for a thorough or multi-pass docs review, or when reviewing a page an engineer wrote about a feature they built.
---

# Docs three-pass review

One review, three passes, each asking a different question. Running them together
produces mush, because style nits crowd out structural problems and structural
rewrites invalidate style nits. Run them in order and keep the findings separate.

| Pass | Question |
|------|----------|
| Style | Does this follow the house rules? |
| Readability | Is the right information available at the right time, in an understandable form? |
| Usability | Does this serve the need the reader arrived with? |

Before any of them, verify the facts. A beautifully structured page that documents
behavior the code doesn't have is worse than a rough one that's true.

## Dependencies

When this skill is loaded, also invoke: `vcluster-docs-writer`

That skill owns the house style rules, partials discovery, link validation, and
versioning workflows. This skill covers only what a review adds on top:
verification, sequencing, and reader fit. Where the two disagree, the writer
skill's `references/style-guide.md` wins.

Repo conventions live in `CLAUDE.md` and `CONTRIBUTING.md`. Cite those rather
than restating a rule, so a reviewer reads the current version of it.

## Pass 0: Verify the claims (gate)

Never review prose about a feature without reading the implementation. Engineer-authored
pages are the common case here, and they're usually right about intent and wrong about
edge behavior.

1. Find the source. Platform behavior lives in `~/git/vcluster/loft-enterprise`,
   vCluster behavior in `~/git/vcluster/vcluster-pro`. Development happens in
   `vcluster-pro`. `loft-sh/vcluster` is the auto-synced public OSS mirror, so
   verify against `vcluster-pro` unless the claim is specifically about what
   ships in OSS.
2. **Scope to the right ref.** This is where reviews go wrong. If the feature is
   unmerged, `main` will show the *old* behavior and you'll conclude the feature
   doesn't exist. Check for an open PR first:
   ```bash
   gh pr list --state all --search "<feature name>" --limit 10 \
     --json number,title,state,headRefName,mergedAt
   gh pr diff <N> > <scratchpad>/pr.diff   # read the patch, not main
   ```
3. Verify each claim individually against the code, chart templates, and tests.
   Chart defaults live in `chart/values.yaml`, env plumbing in
   `chart/templates/deployment.yaml`, behavior in the Go path the env feeds.
4. Quote log strings, annotation keys, and default values from source. Don't
   paraphrase them from the prose under review.
5. If you check rendered output on a deploy preview instead of source, put
   `/next/` after the route base, as in `/docs/platform/next/...`. A bare
   `/docs/platform/...` preview URL serves the released version, not the branch,
   so the page you are reviewing is not the page you are looking at.

### Shipping gate

If the feature is unmerged, say so as a blocker. Docs must not ship ahead of the
feature. Also check whether anything mechanically prevents the merge:

```bash
gh pr view <N> --json isDraft,reviewDecision,mergeable,mergeStateStatus
```

An approved, non-draft, `MERGEABLE`/`CLEAN` PR can be merged today regardless of what
a review comment says. Flag that to the author rather than converting it to draft
yourself, since that neutralizes existing approvals.

### Placeholder check

Grep the diff for text that renders literally to readers. Placeholders inside
`InterpolatedCodeBlock` defaults are the dangerous kind, because they land in a
copy-pasteable command:

```bash
git fetch origin main   # a stale local main hides or invents findings
git diff origin/main...HEAD -U0 | grep -E '^\+' \
  | grep -E "TODO|FIXME|XXX|PLACEHOLDER|CHANGEME|[A-Z_]{8,}"
```

Scan added lines only. Without `^\+`, every placeholder the PR *removed* reports
as a find. `[A-Z_]{8,}` is deliberately loose, so expect legitimate hits from
version tokens and `InterpolatedCodeBlock` variable names. Read the surrounding
diff hunk before flagging one.

Version tokens (`__PLATFORM_VERSION__`) resolve to the *current* version, so they
cannot express "requires X or later" for unshipped work. Don't substitute one in.
If the version isn't knowable yet, leave a visible placeholder with a
`{/* TODO before merge */}` comment rather than a plausible-looking guess.

## Pass 1: Style

`vcluster-docs-writer` owns the rules. This pass checks what its automation
doesn't reach.

```bash
vale <changed files>   # global Homebrew binary, no npx
```

Vale passing is necessary, not sufficient. Three groups it misses.

**House rules with no vale rule behind them.** Check each against the writer
skill's `references/style-guide.md` rather than from memory. Every one of them
has carve-outs, and the guide is the only place those stay current.

- Punctuation: em dashes, semicolons, and mid-sentence colons in prose.
- Contractions.
- Sentence length.

**Mechanical damage, usually introduced by the edit itself.**

- **Comma splices** introduced while rewording.
- **Curly apostrophes** pasted in from elsewhere. Straight quotes dominate the repo.
- **Sentence casing** in `title` and `sidebar_label`. A page that changes one and not
  the other is the common miss.
- **Import placement.** Group imports directly under the frontmatter, not mid-page.
- **Stray double blank lines.**
- **Terminology drift** between a signpost and the section it points at (a warning
  that says "two upgrades" pointing at a procedure that says "two restarts").
- **Admonition titles that no longer match their content** after an edit.

**Repo conventions that reviews catch late.** Each is a section in `CLAUDE.md`,
named in parentheses. Read the section before flagging, since several have
carve-outs.

- **Hand edits under `vcluster_versioned_docs/version-*` or
  `platform_versioned_docs/version-*`.** Blocking. CI backports from main, so
  the change belongs on main with a `backport-vX.XX` label
  (`.github/workflows/backport-docs.yml`). ("Versioned docs")
- **Retired terminology**, such as virtual cluster, host cluster, and
  multi-tenancy. ("Repositioning terminology")
- **CR versus CRD**, decided by the manifest's `kind` and not by the verb.
  ("CR vs CRD terminology")
- **Sidebar tier badges** on the category or on each page, never both.
  ("Sidebar tier badges: category vs. page")
- **SVGs imported as React components**, not `require().default`. ("SVG diagrams")
- **Link form**: relative with the `.mdx` suffix within a section, `/docs/`
  absolute across sections. ("Link resolution")
- **Vale corrections applied to paths, commands, or code** rather than prose.
  ("Vale linting: paths vs prose")

Fix pre-existing warnings in files you touch. Leave versioned-doc snapshots alone.

## Pass 2: Readability

Read the page start to finish as someone following it, and ask where information
arrives relative to where it's needed.

- **Sequencing.** Does a critical caveat appear *after* the procedure it invalidates?
  This is the highest-value find in this pass. If step 3 only works given something
  explained in step 6, either move the explanation up or put a forward-reference
  signpost at the top. A signpost plus one explanation beats duplicating the content.
- **Duplication across steps.** The same instruction restated at configure time and
  apply time. Say it once, at the earlier point.
- **Cross-page contradictions.** Grep sibling pages for the same config keys and
  check whether the advice collides. Two pages can each be correct under different
  preconditions and still read as contradictory when neither states its precondition.
  Scope the guidance rather than softening it.
- **Unheaded trailing prose.** Troubleshooting or caveats dangling after the last
  heading are unfindable and unlinkable. Give them a heading.
- **Notes filed under the wrong heading.** A caveat that applies to a whole procedure
  sitting inside one subsection.
- **Hedging that hides determinism.** "May preserve the existing password" when the
  code branch always preserves it. Vague wording on deterministic behavior sends
  readers hunting for a nondeterminism that isn't there.
- **Branches that aren't signposted.** When scenario A takes one pass and scenario B
  takes two, say so before the reader picks a path.

## Pass 3: Usability

Name the reader and the state they're in before you start, then judge the page
against that. Someone on a password-reset page is locked out and scanning under
pressure. Someone on a config reference is comparing options at leisure. The same
prose serves one and fails the other.

- **Routing walls.** Several consecutive paragraphs that each say "if you have X, go
  to Y" should be a scannable decision list keyed on what the reader has. Don't put
  `GlossaryTerm` in a table cell, which triggers a horizontal-scroll rendering
  bug. Wrap the next prose occurrence instead.
- **Missing success criteria.** Can the reader tell it worked? Every procedure needs
  a verification step. Check that a page's newest section didn't skip the "you should
  now be able to..." that its older siblings have.
- **Expected-looking failures.** If correct behavior looks like failure (an old
  password still working after a deliberate no-op run), say so at the verify step or
  the reader will conclude they broke something.
- **Missing restore-the-safe-state step.** Recovery and debug procedures that widen
  access need a closing step that narrows it again. Ask what the reader had to turn
  on, and whether the page ever tells them to turn it back off.
- **Unstated operational cost.** Restarts, downtime, session invalidation, and
  credential rotation are planning inputs. Surface them in the section intro, not
  buried in a command block.
- **Ordering versus the sidebar.** If the intro routes most readers to the last
  section on the page, either reorder or make sure the intro links jump directly.

## Close out

1. Re-run `vale` and an MDX compile check. Passes 2 and 3 cause rewrites that
   reintroduce style problems.
   ```bash
   node --input-type=module -e "import {compile} from '@mdx-js/mdx';import fs from 'node:fs';
   for (const f of process.argv.slice(1)) {try {await compile(fs.readFileSync(f,'utf8'),{jsx:true});console.log('OK  ',f)} catch(e) {console.log('FAIL',f,e.message)}}" <files>
   ```
   Keep `--input-type=module`. `@mdx-js/mdx` is ESM-only, so `require()` throws
   `ERR_REQUIRE_ESM` on the Node 20 that several workflows in `.github/workflows/`
   pin, even though the repo itself needs Node 22 or later.

   Files using `<!-- vale off -->` fail this bare compile. That's expected, since the
   site configures those as `format: 'md'`. Compare against the file at `HEAD` before
   treating a failure as yours.
2. Run the link checks rather than tracing links by hand. These are the same ones
   CI runs, documented under "Checking links before you push" in `CONTRIBUTING.md`:
   ```bash
   npm run validate-mdx-links         # click-time breaks in live docs
   npm run validate-reusable-imports  # same-product live imports
   npm run check-redirects            # only when a page moved or was renamed
   ```
   `npm run build` also catches links to missing pages, but it peaks around 10 GB
   of memory. Reach for it only when the checks above aren't enough.
3. Verify by hand the things no validator covers: anchors you created this pass,
   and anchors in links pointing at headings you renamed.
4. Don't commit or push unless asked.

## Reporting

Group findings by pass, not by file, so the author can triage structural problems
separately from wording. Within each pass, lead with what changes the reader's
outcome. Use `file.mdx:line` references.

Separate **blocking** (unmerged feature, placeholder in a copy-pasteable command,
wrong technical claim) from **fix now** from **optional**. State plainly what you
changed versus what you're only flagging, and call out anything you deliberately
left alone and why, such as reordering that would add diff noise to an approved PR.

## Delegating

If you fan this out to subagents, give each one the ref to verify against. A subagent
told only "check the admin recovery feature" will scope itself to `main` and report
that the feature doesn't exist. Treat a confident "this doesn't exist" as a scoping
error until you've confirmed the agent read the right ref.
