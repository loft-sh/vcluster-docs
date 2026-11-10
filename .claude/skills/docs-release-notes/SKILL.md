---
name: docs-release-notes
description: Write or update the per-release notes pages for vCluster Platform and vCluster, and the What's new page for a minor release. Decides what each change gets (its own entry, a summary line, or nothing), the section order, and the wording. Use when drafting release notes for a minor or patch release, triaging a tag diff or a Linear release project into notes, adding a patch section, or acting on review feedback that the notes are too detailed.
---

# Docs release notes

Release notes live in the docs, one page per minor release, with a section for
each patch:

- Platform: `platform/reference/release-notes/<major>-<minor>.mdx`
- vCluster: `vcluster/reference/release-notes/<major>-<minor>.mdx`
- What's new, minor releases only: `platform/overview/whats-new.mdx` and
  `vcluster/overview/whats-new.mdx`

These pages are technical. The marketing announcement on vcluster.com/releases
is drafted separately in Notion, and it's a different document. Don't copy one
into the other.

## The reader

Write for a customer who runs the **previous GA release** and is deciding
whether and how to upgrade. For a patch, that's the previous patch of the same
minor.

Every entry has to pass one test: *Would that customer notice this, or need to
do something about it?* If not, it doesn't go in. A release note isn't a
changelog of everything engineering merged, and it isn't a debugging guide.

## Gather the changes

1. **Diff the stable tags**, not the alphas. Compare the new release tag against
   the previous GA tag in `loft-sh/loft-enterprise` (Platform) and
   `loft-sh/vcluster-pro` (vCluster). A change that only differs from an earlier
   alpha means nothing to a GA customer.
2. **Read the release's removals and deprecations project in Linear** (for 5.0
   that was "5.0 Removals and Deprecations"). Each decided item goes in, and it
   goes at the top. An item needs a linked decision (Slack, a ticket comment, or
   a merged PR) before it's written as decided. A proposal page isn't one.
3. **Check the release branch**, not `main`. Before you write "removed" or
   "changed", confirm the PR is merged on the release branch, or has the
   backport label. If it isn't there yet, add an MDX TODO comment with the PR
   numbers and re-check before merge.
4. **Note patch backports.** For a minor release, a change that also shipped in
   a patch of the previous minor still goes in, followed by "Also in 0.37.4."
   That tells readers who already run that patch that nothing changes for them.

## Triage: add, summarize, or ignore

Put every candidate change in exactly one bucket.

### Add as its own entry

- **Removed features**, with what replaces them and what upgrading does to
  existing data or installs.
- **Deprecations**, with whether anything is removed in this release and the
  replacement, if one is decided. Don't invent a replacement.
- **Breaking changes** that need action on upgrade, such as removed fields, new
  required settings, changed defaults that refuse old input, and module path
  changes.
- **New features** a customer can use, with a link to the task page.
- **Changed defaults**, especially security-relevant ones, such as "Metal3 skips
  OS image TLS verification by default."
- **Upgrade side effects**, such as "Upgrading re-applies the certified stack
  bundle once, and fields it sets are reset."
- **New limits** a user can hit, such as "New Tenant names can't contain `--`."
- **Known issues** with a workaround or a "wait until" instruction.
- **Fixes** a GA customer would have reported or worked around.

### Summarize into one line

When several changes share a cause, write one line about the outcome and link to
the reference page that has the detail.

- **Tenant or permission hardening.** Ten scoping fixes become: "Tenant
  boundaries are enforced more strictly across access rules, ownership labels,
  connectors, stacks, and cluster scheduling. See Tenant boundary reference."
- **Dependency and image security updates.** Write "The rebuilt Kubernetes
  images include upstream security fixes." Leave out the CVE IDs.
- **Diagnostics and status improvements.** Write "Node claims report why
  provisioning is stuck or failing." Leave out the condition names and timers.
- **Retry and resilience changes.** Write "Automatic snapshots retry through
  connection errors instead of failing." Leave out the retry windows.
- **Internal identity or storage details.** Write "A platform restored from a
  management backup keeps its identity." Leave out the Secrets and UIDs it uses
  to do that.

### Ignore

- **Alpha-to-alpha changes.** A behavior that changed between pre-releases and
  never shipped in a GA.
- **Narrow fixes** that few customers hit. Make sure the task page covers the
  behavior instead.
- **Internal mechanics**, such as headers sent on proxied requests, the order
  claims are removed in, reconcile-time rechecks, or a controller rewriting
  registrations once after upgrade.
- **Debugging detail**, such as condition names, reason strings, timeouts, and
  "Before, X crash-looped" descriptions of the old failure.
- **Error strings**, unless the reader will see that message on upgrade and
  needs it to find the fix. `BuildApplicationFailed` on a breaking change
  qualifies, and "refused with `only the platform writes it`" doesn't.
- **Implementation backends named as features.** Describe the capability ("a new
  Connector API"), not every object type behind it, and don't name an internal
  integration that isn't sold on its own.
- **Seamless API changes.** A kind deprecated in favor of a new API, when users
  see no difference, only confuses readers.
- **Security fixes and open weaknesses.** Anything tied to a CVE or an advisory,
  and any known issue that describes how to read or reach something a user
  shouldn't. These go through the security disclosure process. Raise them with
  the security team, and keep them out of the notes.
- **Quiet removals.** Items product has decided to remove with no announcement.
  Check the removals project for "no public announcement".
- **Unshipped features.** Nothing that isn't on the release branch.

If you're unsure, leave it out and ask the product reviewer. Over-detail is the
failure mode reviewers flag most, and a missing line is easier to add than a
debugging note is to defend.

## Page structure

Platform minor page, sections in this order, omitting any that are empty:

1. Intro paragraph with links to What's new and the upgrade path
2. `## X.Y.0` with the release date
3. Supported upgrade path and availability, such as limited availability with a
   contact link
4. `### Removed features`
5. `### Deprecations`
6. `### Breaking changes`
7. `### New features`, grouped under `####` headings by area when there are
   more than about eight
8. `### Changes`
9. `### Fixes`
10. `### Known issues`

vCluster minor page: the same, except `### Upgrade notes` comes first and holds
breaking changes and removals, because vCluster rarely removes config keys.
Add `### Deprecations` after it when anything is deprecated.

Patch release: add a `## X.Y.Z` section above the previous one, with the same
headings, and omit the empty ones. Don't edit earlier patch sections except to
fix errors.

"Removed features" and "Breaking changes" trip `Loft.imperative-headings`. Wrap
them in the Vale toggle comments already on the 5.0 page, with a JSX comment
saying why.

## Writing each entry

- One bullet per change. Lead with what changes for the reader, then what to
  do.
- New features use a bold label and a sentence: `- **Node pools.** A NodePool
  defines ...`
- Link to the task or reference page that has the detail. Use relative `.mdx`
  links within a product and `/docs/<product>/next/...` across products before
  cutover.
- Use the `v` prefix for versions in prose, for example "vCluster v0.38" and
  "Platform v5.0". Vale enforces this.
- Follow the house style: no em dashes, contractions, sentences under about 25
  words, and the terminology rules in CLAUDE.md.
- Track open questions as MDX comments: `{/* TODO before merge: <question> (<ticket>) */}`.
  Name tickets and PRs, not people. The repo is public.

## What's new page

For a minor release only. Group the headline changes by what the reader can now
do (for example "Serve customers on dedicated machines"), not by component. Each
group is a short paragraph plus links. End with:

- An **Availability** table that maps each change to the edition or product
  version it needs.
- An **Upgrade** section that names the removals and deprecations, and links to
  the release notes.

Keep the same trims as the notes. If a detail was cut from the notes, it
doesn't come back here.

## Removals and deprecations outside the notes

A note isn't the whole change:

- **Removed:** delete or redirect the feature page, drop nav entries and
  references, and regenerate the API reference partials from the release tag.
- **Deprecated:** add a `:::warning <Feature> is deprecated` admonition to the
  feature page. State the release, whether it's still available, and the
  replacement if one is decided.
- **Older LTS docs:** a deprecation notice in a released version is a versioned
  docs edit and needs explicit approval.

## Verify and review

1. Run `docs-fact-check` on every entry that asserts behavior, against the
   release tag or the release branch.
2. Run Vale on each changed page and fix every warning.
3. Open the PR, then post the preview links (`/docs/<product>/next/...` on the
   PR preview) in the release thread in #release-engineering for product review.
4. When a reviewer flags lines as too detailed, apply the same filter to the
   whole page, not only the lines they named. Then reply in the thread with what
   changed, per point.
5. Before merge, clear every `TODO before merge` comment, or confirm with the
   owner that it can stay.

## Checklist

- [ ] Diffed against the previous GA tag, not an alpha
- [ ] Every decided removal and deprecation from the Linear project is listed,
      at the top
- [ ] Each "removed" or "changed" item is on the release branch
- [ ] No CVE IDs, open security weaknesses, error strings without a reason, or
      internal mechanics
- [ ] Hardening and resilience changes are summarized, one line each
- [ ] Deprecated features have an admonition on their page
- [ ] Fact check run, Vale clean, preview reviewed by product
