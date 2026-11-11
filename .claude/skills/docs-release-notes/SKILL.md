---
name: docs-release-notes
description: Write or update the per-release notes pages for vCluster Platform and vCluster, and the What's new page for a minor release. Decides what each change gets (its own entry, a summary line, or nothing), the section order, the wording, and which branch and backport label carry the notes. Use when drafting release notes or a changelog for a minor or patch release, triaging a tag diff or a Linear release project into notes, adding a patch section, writing a What's new page, or acting on review feedback that the notes are too detailed.
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

The `vcluster-docs-releaser` and `platform-docs-releaser` skills cut the docs
version and flip it live. This skill covers what goes on the notes pages.

## Where the work happens

Write release notes on a branch off `main` and open the PR into `main`, like any
other docs change. Notes are usually drafted well before the docs are versioned,
which happens late in the release. Whether the PR needs a backport label depends
on whether the version folder exists yet:

- **Minor release, before versioning:** no label. The notes live in the current
  docs (`platform/` or `vcluster/`), and versioning copies them into the new
  version folder.
- **Minor release, after versioning:** add the backport label for the new
  version, such as `backport-v0.39` (vCluster) or `backport-v5.1.0`
  (Platform). If the label doesn't exist yet, create it with the same pattern.
  The label copies each changed file to the same path in the version folder.
- **Patch release:** the minor's version folder already exists, so add the
  backport label for that minor. The new `## X.Y.Z` section then lands in the
  version folder as well.
- **Every page you change** for the release, such as the upgrade page or a
  deprecation admonition, follows the same rule. A page whose path differs in
  the version folder can't be backported by label. Edit it there by hand, with
  explicit approval. See "Backport changes to released versions" in
  CONTRIBUTING.md.

Release notes publish with the announcement on release day, when the version
flips live. Merge before the flip, and don't announce the preview links outside
the release thread.

A major release staged on the `next` branch is the exception. Then the notes go
into `next` with the rest of the release, and they reach `main` at cutover.

## The reader

Write for a customer who runs the **previous GA release** and is deciding
whether and how to upgrade. For a patch, that's the previous patch of the same
minor.

Every entry has to pass one test: *Would that customer notice this, or need to
do something about it?* If not, it doesn't go in. A release note isn't a
changelog of everything engineering merged, and it isn't a debugging guide.

## Gather the changes

1. **Diff the stable tags**, not the alphas. In `loft-sh/loft-enterprise`
   (Platform) and `loft-sh/vcluster-pro` (vCluster), compare the new release
   tag against the previous GA tag:
   - Minor release: the previous minor's latest patch, such as `v0.38.0` against
     `v0.37.5`.
   - Patch release: the previous patch of the same minor, such as `v0.38.2`
     against `v0.38.1`.

   Before the release is tagged, use the newest pre-release in its place: the
   latest rc on the release branch, or, if there's no release branch yet, the
   latest tag on the repo's `main`, whether that's an alpha or an rc. Changes can
   still land, so re-run the diff against the newest rc before merge, and
   against the final tag once it exists.

   The base is always a GA tag. A change that only differs from an earlier alpha
   means nothing to a GA customer.
2. **Read the release's removals and deprecations project in Linear** (for 5.0
   that was "5.0 Removals and Deprecations"). Each decided item goes in, and it
   goes at the top. An item needs a linked decision (Slack, a ticket comment, or
   a merged PR) before it's written as decided. A proposal page isn't one.
3. **Check what's shipping**, not the tip of the product repo's `main`. Before
   you write "removed" or "changed", confirm the change is in the release:
   - If the release branch exists, such as `release-5.0`, confirm the PR is
     merged on it, or has the backport label.
   - If it doesn't exist yet, check against the latest tag on the repo's `main`,
     whether that's an alpha or an rc. Find the tag with
     `git tag --merged origin/main --sort=-v:refname | head -1`, then confirm the
     PR's merge commit is in it with
     `git merge-base --is-ancestor <merge-sha> <tag>`.

   If the change isn't there yet, add an MDX TODO comment with the PR numbers
   and re-check before merge.
4. **Note patch backports.** For a minor release, a change that also shipped in
   a patch of the previous minor still goes in, followed by "Also in v0.37.4."
   That tells readers who already run that patch that nothing changes for them.

## Triage: add, summarize, or ignore

Put every candidate change in exactly one bucket.

The examples in this section come from the Platform v5.0 and vCluster v0.38
notes. They show the shape of an entry, not current behavior.

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
- **Upstream dependency and image updates.** Write "The rebuilt Kubernetes
  images include upstream security fixes." Leave out the CVE IDs. This covers
  fixes that come from upstream components only. A vulnerability in our own
  code is a security fix, which goes under Ignore.
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
- **Security fixes and open weaknesses in our own code.** Any vulnerability in
  vCluster or Platform code, anything with a vCluster Labs advisory, and any
  known issue that describes how to read or reach something a user shouldn't.
  These go through the security disclosure process. Raise them with the
  security team, and keep them out of the notes.
- **Quiet removals.** Items product has decided to remove with no announcement.
  Check the removals project for "no public announcement".
- **Unshipped features.** Nothing that isn't on the product release branch, or
  in the latest tag on `main` when there's no release branch yet.

If you're unsure, leave it out and ask the product reviewer. Over-detail is the
failure mode reviewers flag most, and a missing line is easier to add than a
debugging note is to defend.

## Page structure

### New minor release

A new minor needs more than the notes page:

1. Create `<product>/reference/release-notes/<major>-<minor>.mdx`. Copy the
   frontmatter and intro from the previous minor's page, then update the
   `title`, `sidebar_label`, and `description` to the new version, such as
   `title: vCluster v0.39 release notes` and `sidebar_label: vCluster v0.39`.
2. If the product has no `release-notes` folder yet, add a `_category_.json`
   with `"label": "Release notes"`, `"position": 1`, `"collapsible": true`, and
   `"collapsed": true`.
3. Replace the What's new page with the new release (see [What's new
   page](#whats-new-page)).
4. Add the supported upgrade path, with a link to the new notes page:
   - Platform: a `:::warning Upgrading to X.Y` admonition near the top of
     `platform/administer/upgrade-migrate/upgrade.mdx`, when the upgrade has
     removals or breaking changes.
   - vCluster: a bullet at the top of the upgrade path list in
     `vcluster/operate/upgrade/upgrade-version.mdx`.
5. If the release changes supported versions, update
   `docs/_partials/*_supported_versions.mdx` and run
   `npm run generate-lifecycle-json`.

### Platform minor page

Sections in this order, omitting any that are empty:

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

### vCluster minor page

The same, except `### Upgrade notes` comes first and holds breaking changes and
removals, because vCluster rarely removes config keys. Add `### Deprecations`
after it when anything is deprecated.

### Patch release

Add a `## X.Y.Z` section above the previous one, with the same headings, and
omit the empty ones. Don't edit earlier patch sections except to fix errors.

### Vale toggles

"Removed features" and "Breaking changes" trip `Loft.imperative-headings`. Wrap
each one in Vale toggle comments, with a JSX comment saying why. The toggles are
HTML comments, and the JSX comment between them is the one Vale doesn't lint:

```mdx
<!-- vale Loft.imperative-headings = NO -->
{/* "Removed features" is the term readers scan release notes for. */}
### Removed features
<!-- vale Loft.imperative-headings = YES -->
```

## Writing each entry

- One bullet per change. Lead with what changes for the reader, then what to
  do.
- New features use a bold label and a sentence: `- **Node pools.** A NodePool
  defines ...`
- Link to the task or reference page that has the detail:
  - Within a product, use relative links with the `.mdx` suffix, such as
    `../../overview/whats-new.mdx`. They keep the reader's docs version.
  - Across products, the link depends on whether the docs are versioned yet.
    Before versioning, the pages the release adds or moves exist only in the
    current docs, which are served under `/next/`. Link them as
    `/docs/<product>/next/<path>`, or the link won't resolve.
  - When the docs are versioned for the release, remove `/next/` from those
    links, in the current docs and in the new version folder. Left in, they send
    readers of released notes into unreleased docs. A link with no version
    segment resolves to the other product's stable docs.
  - A link to a page that's new in the paired release can still 404 until that
    product's version flips live. Check those links on release day.
- Use the `v` prefix for every vCluster Labs product version in prose, for
  example "vCluster v0.38", "Platform v5.0", and "Also in v0.37.4". Vale only
  catches a version that follows a product name, so check bare versions by eye.
  Version numbers in headings, such as `## 0.38.0`, stay bare.
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
- **Older released docs:** a deprecation notice in an earlier version's folder
  is a versioned docs edit and needs explicit approval.

## Verify and review

1. Run `docs-fact-check` on every entry that asserts behavior, against the
   product release tag, the release branch, or the latest tag on `main`.
2. Run `docs-review` on each changed page for style, readability, and
   usability.
3. Run Vale on each changed page and fix every warning.
4. Open the PR into `main`, with the backport label if the version folder
   exists. Then post the preview links in the release thread in
   #release-engineering for product review. The PR preview serves the current
   docs under `/docs/<product>/next/`, so the preview links need that segment.
5. When a reviewer flags lines as too detailed, apply the same filter to the
   whole page, not only the lines they named. Then reply in the thread with what
   changed, per point.
6. Before merge, clear every `TODO before merge` comment, or confirm with the
   owner that it can stay.
7. When the docs are versioned, remove `/next/` from the release notes and
   What's new links, in the current docs and the new version folder.
8. On release day, after the version flips live, check that every
   cross-product link resolves.

## Checklist

- [ ] Diffed against the previous GA tag (previous patch for a patch release),
      not an alpha, and re-diffed against the newest rc or final tag before merge
- [ ] Every decided removal and deprecation from the Linear project is listed,
      at the top
- [ ] Each "removed" or "changed" item is on the product release branch, or in
      the latest alpha or rc tag on `main` if there's no branch yet
- [ ] No CVE IDs, security fixes in our own code, open weaknesses, error strings
      without a reason, or internal mechanics
- [ ] Hardening and resilience changes are summarized, one line each
- [ ] Every product version in prose has a `v` prefix
- [ ] Cross-product links use `/next/` before versioning, and drop it once the
      docs are versioned
- [ ] New minor: category, What's new, upgrade path, and lifecycle data updated
- [ ] Deprecated features have an admonition on their page
- [ ] PR targets `main` (or `next` for a staged major), with the backport label
      if the version folder exists
- [ ] Fact check and docs review run, Vale clean, preview reviewed by product
- [ ] Release day: cross-product links checked
