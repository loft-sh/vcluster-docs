# Reference page template

One page per thing a reader looks up: a resource's fields, a behavior matrix,
condition reasons, permissions, or supported versions. The reader already knows
what they're doing and has come back to check a value, so make every fact
findable by scanning and don't make them read prose to find it.

## Before you write one

- **Check whether it's generated.** The vcluster.yaml reference
  (`vcluster/_partials/config/`), the Platform API resource pages
  (`platform/api/_partials/resources/`), and the Platform CLI reference come
  from generators. Don't hand-write what they already cover. Link to the
  generated page and add only what it can't say, such as how fields interact.
- **Check whether it needs its own page.** The fields a task step needs stay
  at that step. Give reference material its own page when no single task
  step uses it, when several pages link to it, or when a step uses only a few
  rows of a much larger table. See "Where reference pages go" in
  [README.md](README.md).

## Frontmatter and title

- `title` names the thing being described, for example "Tenant capability
  reference" or "Machine condition reasons". Use sentence case.
- `description` says what the reader can look up, in one sentence.
- Place the page by the rules in "Where reference pages go" in
  [README.md](README.md).

## Sections

1. **Intro.** One or two sentences: what the page lists and when someone
   needs it. Link to the concept page for how the feature works and to the
   task pages that use these values.
2. **Tables.** One table per kind of thing. Columns usually include the
   name, allowed values, default, and a short effect. Keep cells short.
   Don't put `GlossaryTerm` in a table cell.
3. **Behavior matrices (when they apply).** When the outcome depends on a
   combination of conditions, use a table with one row per situation and a
   column for what the reader sees. This replaces a narrative that walks
   through code paths.
4. **Notes on interactions (optional).** Short headed paragraphs for rules a
   table can't hold, such as two fields that can't both be set.

## Skeleton

````mdx
---
title: <Thing> reference
sidebar_label: <Thing> reference
description: <What the reader can look up here, in one sentence.>
---

<What this page lists and when you need it.> For how <feature> works, see
[<Concept>](<relative-path>.mdx). To <do the task>, see
[<Task>](<relative-path>.mdx).

## <Fields or settings>

| Field | Allowed values | Default | Effect |
|-------|---------------|---------|--------|
| `<field>` | <values> | <default> | <What changes for the reader.> |

## <Behavior>

| Situation | Result |
|-----------|--------|
| <Condition the reader can observe or set> | <What the reader sees> |
````

## Don't

- Don't include procedures. Link to the task page instead.
- Don't describe how the code reaches a result: controller order, retries,
  internal annotations, or where the product stores data. Describe the result.
  See "Document the contract, not the implementation" in
  [style-guide.md](../style-guide.md).
- Don't leave out a limitation because a table makes it look awkward. Give it
  a row or a note.
