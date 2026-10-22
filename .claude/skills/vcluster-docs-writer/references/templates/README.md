# Page templates

Start a new page from the template for its type. A template is an outline for
a first draft, not a form to fill in completely. Skip a section that doesn't
apply, and don't pad one to make it fit.

| Template | Use it for | Typical location |
|----------|-----------|------------------|
| [feature.md](feature.md) | Docs for a new feature or setting | Configure, Deploy, or a Platform feature section |
| [task.md](task.md) | One job the reader does from start to finish | Configure, Operate, Use the platform |
| [troubleshooting.md](troubleshooting.md) | One problem: what the reader sees, why, and the fix | Troubleshoot |
| [reference.md](reference.md) | Values a reader looks up: fields, behavior matrices, condition reasons, permissions | Next to the feature's concept and task pages, or Reference |

Integration pages follow the "Integration Pages" section of
[style-guide.md](../style-guide.md) rather than a template of their own.
Concept pages follow "Concept and Explanation Pages" in the writer skill's
`SKILL.md`.

## Page types

Each kind of information has a page type where it belongs. The types follow
[Diátaxis](https://diataxis.fr/) loosely. Use them as a guide for where content
lands, not as a rule that every page must be exactly one type.

| Page type | The reader wants to | Diátaxis | Where it lives | Source |
|-----------|--------------------|----------|----------------|--------|
| Get started | Learn by doing one path that works end to end | Tutorial | vCluster Get started, vMetal Get started, Platform Install quick start | Use task.md, with one path and no branches |
| Task | Get one job done | How-to | Configure, Deploy, Operate, Use the platform, task folders inside a feature | task.md |
| Troubleshooting | Fix a problem they can see | How-to | Troubleshoot, `troubleshoot/` inside a feature | troubleshooting.md |
| Concept | Understand how it works and choose a design | Explanation | Overview, Plan, `concepts/` inside a feature | Writer skill, "Concept and Explanation Pages" |
| Reference | Look up a value | Reference | Next to the feature's other pages, Reference, generated API and vcluster.yaml pages | reference.md |

The feature template is a deliberate mix of concept and task, because it's
the first draft an engineer writes for a new feature. When a feature page
outgrows one page, split it along these types instead of adding sections.

### Where reference pages go

- **A feature whose pages share one folder.** Put the reference page in that
  folder as `<topic>-reference.mdx`, for example
  `platform/fleet-operations/observability/labels-reference.mdx`. When the
  feature has two or more reference pages, group them in a `reference/`
  subfolder.
- **A section already split into subfolders by type**, such as `concepts/`,
  `deploy/`, and `troubleshoot/`. Put reference pages in a `reference/`
  subfolder beside them, even the first one, for example
  `platform/vmetal/reference/`.
- **Reference that spans features.** Put it in the product's top-level
  Reference section, such as licensing, lifecycle policy, annotations, and the
  glossary.
- **Generated reference** stays where its generator writes it: the
  vcluster.yaml reference, the Platform API resource pages, and the CLI
  reference. Link to it rather than repeating it by hand.

### Signs that content is on the wrong page

- A task page explains the design trade-offs before the steps. Move the
  explanation to a concept page and link to it from the intro.
- A task or concept page carries a long field table or behavior matrix. Short
  tables that a reader reads in passing stay inline. Once a table is long
  enough that readers come back to look things up in it, move it to a
  reference page and link to it from where it's needed.
- A concept page has numbered steps. Move them to a task or troubleshooting
  page.
- One integration's or provider's setup sits inside a general procedure. Give
  it its own task page and link to it from the branch point.
- A get started page offers choices. Pick one path and link to the task pages
  for the others.

If the target page doesn't exist yet, name the path it should have and keep
the content where it is until someone creates that page. Moving content into
a page that doesn't exist loses it.

When you move content, leave a one-sentence summary and a link at the point
the reader needs it. A reader in the middle of a task should still learn that
something exists and why it matters, even when the detail lives elsewhere.

## Authority

These templates apply [style-guide.md](../style-guide.md) to specific page
types. Where a template and the style guide disagree, the style guide wins.
`CLAUDE.md` at the repo root wins over both for repo conventions such as links,
versioned docs, and terminology.

The docs team keeps short summaries of these templates in Notion for
engineers. The files here are the source. Change a template here first, then
update its Notion summary.
