# Section overview template

One page at the top of a sidebar section. It answers "what even is this
section?" before it answers "where do I go next?" A reader arrives from the
sidebar, search, or a link elsewhere, often unsure whether the section is the
right place. The page orients them, explains the idea the section is built on,
and then routes them to the page they need.

A page that's only headings over bulleted link lists fails this. It repeats the
sidebar and never says what the section is for.

The model to copy is `platform/tenants/overview.mdx`. It opens with what the
section covers, explains the tenant model with a diagram and a table, says when
tenants apply, summarizes the boundary in two paragraphs, and routes the rest
of the section through a prose paragraph and one card grid.

## Does the section need one?

Write an overview when any of these is true:

- **It's a top-level section** in the vCluster or Platform sidebar.
- **Readers need a model first.** The section's pages make sense only once the
  reader understands an idea they share, such as the tenant hierarchy.
- **Readers have to choose.** The section has several pages or subfolders, and
  their titles alone don't tell a reader which one fits their situation.
- **Order matters.** The pages are steps or decisions a reader works through
  in sequence, such as planning before deploying.
- **It serves more than one role.** For example, a platform admin and a
  project user would start in different places.

Skip the overview when:

- **The section holds one feature.** Its concept or feature page is the entry
  point. Put it at `sidebar_position: 0` instead of adding a page above it.
- **The section has two or three pages** whose titles already make the choice
  obvious.
- **A generator owns the section index**, such as the Platform API resource
  pages.

A folder with one or two pages and a stub overview should either get a real
overview or be flattened. Before flattening, check the IA plan for whether the
section is expected to grow. A folder that's waiting for planned content keeps
its overview.

### When a concept page already explains the section

Often a concept page in the section already explains the model the whole
section builds on. Don't write a link hub above it. Split it instead:

- **The orienting half moves to the overview.** That's what the thing is, a
  diagram, who does what, and when it applies.
- **The mechanics stay on the concept page.** That's how it works in detail,
  edge cases, and the reference tables other pages link into.

Leave the concept page at its path so existing links and anchors keep working.
Give it a short intro that links back to the overview, and give the overview a
short summary that links to the concept page.

## Frontmatter and title

- `title` names the section, usually matching its `_category_.json` label, for
  example "Deliver services to tenants". Never use "Overview", because the
  title is the page's H1, its browser tab, and its search result.
- `sidebar_label: Overview`, so the section name isn't repeated under itself.
- `sidebar_position: 0`. Put the section's own position and tier badge
  (`className`) in its `_category_.json`.
- `slug` matches the folder URL, plugin-relative, for example
  `slug: /tenants`. See "Sidebar Navigation Conventions" in the writer skill's
  `SKILL.md`.
- `description` says what the section is about, in one sentence of 100 to 160
  characters. Docusaurus uses it for the meta description and the Open Graph
  description, so it's what search results and link previews on social sites
  show. Without one, Docusaurus uses the first paragraph. LinkedIn flags
  descriptions under 100 characters, and search engines truncate them after
  about 160.

## The three jobs, in order

### 1. Orient

Open with prose, not a list. In one or two short paragraphs, say what the
section covers, who works in it, and where it stops. Then explain the idea the
section is built on, such as the tenant hierarchy, the planning sequence, or
what the management plane is.

- Use a diagram when one exists for the model.
- Use a table when the content is tabular, such as roles and what each does.
- Say when the section applies and when it doesn't, if a reader might not need
  it at all, as "Tenants are optional" does.
- When a neighboring section covers related work, say where the line falls,
  for example "Deploy decides how a cluster is built. This section covers
  running it."

### 2. Explain just enough to choose

Give the reader what they need to pick a page, and no more. Two or three short
paragraphs is usually the limit. Link to the concept page for the full story.

When the choice depends on conditions, such as which monitoring approach fits
which deployment, use an "If you… / Use…" table so the condition sits in the
left column where scanning finds it.

### 3. Route

Open the routing with a sentence or two of prose that explains how the section
is organized, for example how its groups follow the same handoff as the model
above. Then route with one form:

- **A card grid** (`LinkCardGrid` from `@site/src/components/LinkCards`) for a
  handful of destinations a reader scans, each with a one-line description.
  Use one grid per page at most.
- **A numbered list** when the pages are read in order.
- **A table** when readers look things up, such as commands by task.
- **A short list** when the items are truly parallel and a grid would be
  overkill.

Weave links into the prose of the first two jobs too. A sentence that says
"read [what projects are](...) next" routes as well as a bullet does, and it
says why.

End with "Covered in other sections" only when readers often look here for
work that lives elsewhere. Keep it short. Configure sections end with a link
to the matching key in the generated `vcluster.yaml` reference.

## Skeleton

````mdx
---
title: <Section name>
sidebar_label: Overview
sidebar_position: 0
slug: /<folder-url>
description: <What this section is about, in 100 to 160 characters.>
---

import {LinkCard, LinkCardGrid} from '@site/src/components/LinkCards';

This section covers <scope>. <Who works in it, and where it stops relative to
a neighboring section.>

<The idea the section is built on, in a paragraph or two. Add a diagram or a
table if the content calls for one.>

## <When this applies, or the choice the reader faces>

<Just enough to choose. Use an "If you… / Use…" table when the choice depends
on conditions. Link to the concept page for the details.>

## Work in this section

<A sentence or two on how the section is organized.>

<LinkCardGrid>
  <LinkCard product="<vcluster|platform>" to="/<path>" icon="<material icon>" title="<Group>" description="<What the reader does there, in one line.>" />
</LinkCardGrid>
````

## Don't

- Don't build the page from headings that each hold only a bulleted list.
- Don't open with a list. Open with what the section is.
- Don't use "Overview" as the title.
- Don't explain mechanics at length. Summarize, then link to the concept page.
- Don't put procedures, commands, or configuration examples on the page. Link
  to the task page.
- Don't stack routing forms. Pick one card grid, one list, or one table.
- Don't use a bare `DocCardList` as the page's only content.
- Don't make an overview the only page that holds a feature's real content. A
  full guide in `overview.mdx` belongs on a page named for what it is.
