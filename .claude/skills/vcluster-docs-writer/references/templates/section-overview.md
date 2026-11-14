# Section overview template

One page at the top of a sidebar section that tells readers what the section
covers, whether it's for them, and which page to open next. It's mostly
wayfinding, with just enough explanation to make the choice between pages
clear. The reader arrives from the sidebar, search, or a link from another
section, and leaves within a minute for the page they need.

Good examples: `vcluster/operate/overview.mdx` and
`platform/use-platform/overview.mdx`.

## Does the section need one?

The sidebar already lists a section's pages. An overview earns its place by
adding what the sidebar can't: who the section is for, which page fits which
situation, the order to read pages in, and what lives in another section.

Write an overview when any of these is true:

- **It's a top-level section** in the vCluster or Platform sidebar.
- **Readers have to choose.** The section has several pages or subfolders, and
  their titles alone don't tell a reader which one fits their situation.
- **Order matters.** The pages are steps or decisions a reader works through
  in sequence, such as planning before deploying.
- **It serves more than one role.** For example, a platform admin and a
  project user would start in different places.
- **Other pages link to the section as a whole**, and the link needs a page
  that explains where to go next.

Skip the overview when:

- **The section holds one feature.** Its concept or feature page is the entry
  point. Put it at `sidebar_position: 0` instead of adding a page above it.
- **The section has two or three pages** whose titles already make the choice
  obvious.
- **It would only repeat the sidebar.** A bulleted list of the child pages,
  with nothing about when to use each one, adds a click and no information.
- **A generator owns the section index**, such as the Platform API resource
  pages.

A folder with one or two pages and a stub overview should either get a real
overview or be flattened. Before flattening, check the IA plan for whether the
section is expected to grow. A folder that's waiting for planned content keeps
its overview.

When the test says yes but the overview turns into a long explanation, the
explanation belongs on a concept page. Keep a short version in the overview
intro and link to the concept page.

## Frontmatter and title

- `title` names the section, for example "Operate" or "Use the platform".
  Never use "Overview" as the title, because the title is the page's H1, its
  browser tab, and its search result.
- `sidebar_label: Overview`, so the section name isn't repeated under itself.
- `sidebar_position: 0`. Put the section's own position and tier badge
  (`className`) in its `_category_.json`.
- `slug` matches the folder URL, plugin-relative, for example
  `slug: /operate`. See "Sidebar Navigation Conventions" in the writer skill's
  `SKILL.md`.
- `description` says what the section helps the reader do, in one sentence of
  100 to 160 characters. Docusaurus uses it for the meta description and the
  Open Graph description, so it's what search results and link previews on
  social sites show. Without one, Docusaurus uses the first paragraph, which
  on an overview is often an admonition or a fragment. LinkedIn flags
  descriptions under 100 characters, and search engines truncate them after
  about 160.

## Sections

1. **Intro.** One to three sentences: what the section covers and who it's
   for. When a neighboring section covers related work, say where the line
   falls, for example "Deploy decides how a cluster is built. This section
   covers running it."
2. **Framing (optional).** One short paragraph or list of the idea a reader
   needs before choosing a page, such as what a project controls. Link to the
   concept page for more. If this grows past a paragraph, move it to a
   concept page.
3. **Grouped links.** Group pages by what the reader is trying to do, not by
   sidebar order. Give each link a bold lead-in naming the goal and one
   sentence saying what the page does or when to use it. Use an `H2` per group
   when there are more than about eight links. When order matters, use a
   numbered list instead.
4. **Covered in other sections (optional).** Work a reader might expect here
   that lives elsewhere, one line per item, each with a link. Use full
   `/docs/` paths for pages in the other product.
5. **Config reference (Configure sections only).** A link to the matching key
   in the generated `vcluster.yaml` reference.

Use bulleted lists by default. A card grid (`LinkCardGrid` from
`@site/src/components/LinkCards`) suits a top-level landing page with many
destinations that readers scan, such as Integrate and automate. Use one grid
per page at most.

## Skeleton

````mdx
---
title: <Section name>
sidebar_label: Overview
sidebar_position: 0
slug: /<folder-url>
description: <What this section helps the reader do, in 100 to 160 characters.>
---

This section covers <scope> for <role>. <Where the line falls with a
neighboring section, if a reader could confuse them.>

## <Reader goal>

- **<Goal>.** [<Page title>](./<page>.mdx) <what it does or when to use it>.
- **<Goal>.** [<Page title>](./<page>.mdx) <what it does or when to use it>.

## <Reader goal>

1. [<First page>](./<page>.mdx) <what the reader decides or does here>.
2. [<Second page>](./<page>.mdx) <what the reader decides or does here>.

## Covered in other sections

- To <goal>, see [<Page title>](../<section>/<page>.mdx).
- To <goal>, see [<Page title>](/docs/<product>/<path>) in the <product> docs.
````

## Don't

- Don't use "Overview" as the title.
- Don't explain how a feature works beyond a short paragraph. Link to the
  concept page.
- Don't put procedures, commands, or configuration examples on the page. Link
  to the task page.
- Don't list child pages in sidebar order without saying what each is for.
- Don't use a bare `DocCardList` as the page's only content.
- Don't make an overview the only page that holds a feature's real content. A
  full guide in `overview.mdx` belongs on a page named for what it is.
