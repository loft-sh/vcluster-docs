# vCluster docs - AI guidelines

See CONTRIBUTING.md for general style guide. This file covers AI-specific
gotchas.

## MCP Server Usage (PR Reviews)

When reviewing PRs with `@claude`, use these MCP servers based on PR content:

**vcluster-yaml MCP** (`mcp__vcluster-yaml__validate-config`):

- Use when PR modifies or creates vCluster YAML files
- Validates syntax and configuration against schema
- Catches common misconfigurations

**context7 MCP** (`mcp__context7__query-docs`):

- Use when PR references external documentation (Kubernetes, Helm, libraries)
- Verifies claims against official docs
- Confirms API usage is correct
- Example: "PR mentions PodDisruptionBudget" → query Kubernetes docs to verify

**sequential-thinking MCP** (`mcp__sequential-thinking__sequentialthinking`):

- Use for complex architectural decisions or multi-step reasoning
- Breaking down complicated review logic

Always use these tools proactively when the PR content warrants it - don't wait
to be asked.

## Vale linting: paths vs prose

Vale rules apply to PROSE TEXT ONLY. When vale suggests capitalizing
"vcluster" or "helm", check context first.

**NEVER change:** File paths, URLs, commands, filenames, imports, code blocks

**ONLY change in prose:** "The vCluster platform uses Helm charts..."

If in doubt, don't change it. Broken paths break the build.

## Versioned docs

Do NOT modify `vcluster_versioned_docs/version-*/` or `platform_versioned_docs/version-*/`
folders. Changes are backported automatically via a CI process.

## Link resolution

**Within same section** (e.g., platform → platform): Use relative file paths with the `.mdx` suffix. The suffix is mandatory, not a preference.

- **Correct:** `[Link](../understand/what-are-projects.mdx)`
- **Correct (directory target):** `[Link](../networking/README.mdx)`
- **Broken — silent 404 on click:** `[Link](../understand/what-are-projects)` (missing `.mdx`)
- **Broken — silent 404 on click:** `[Link](../networking/)` (directory without `README.mdx`)

Without the `.mdx` suffix, Docusaurus does not recognize the link as a
file reference, so the raw relative string is preserved in the compiled
React module. The SSR-rendered `<a href>` looks correct because build-time
resolution runs against the file path, but the browser's click-time
resolution runs against `window.location` and produces a different URL —
injecting the current page's parent directory into the path. The bug is
invisible to static HTML inspection, `curl`, and `git grep`. It only
fires on click. See [DOC-1311](https://linear.app/loft/issue/DOC-1311)
and the post-mortem for the full failure mode.

Relative paths (with `.mdx`) are also preferred over `/docs/` URL paths:
they work on GitHub, survive slug changes, and track moves.

**Cross-section links** (e.g., platform → vcluster): Use `/docs/` absolute paths
(different Docusaurus plugin instances, so file paths don't resolve):

- **Correct:** `[vCluster docs](/docs/vcluster)`
- **Correct:** `[Sleep mode](/docs/vcluster/configure/vcluster-yaml/sleep-mode)`

**Imports** (components, partials): Use `@site/` prefix:

- `import Flow from '@site/src/components/Flow'`
- `import Partial from '@site/vcluster/_partials/example.mdx'`

**Debugging broken links:**

1. CD into the versioned folder matching the error path
2. Grep for the referenced file name
3. Fix the relative path

Clear caches: `rm -rf .docusaurus build node_modules/.cache`

## InterpolatedCodeBlock (prefer over static code blocks)

For code with user-customizable values, use `InterpolatedCodeBlock` instead
of static code blocks:

```jsx
import InterpolatedCodeBlock from '@site/src/components/InterpolatedCodeBlock';

<InterpolatedCodeBlock
  code={'kubectl create namespace [[VAR:NAMESPACE:my-namespace]]'}
  language="bash"
/>
```

For repeated values across a page, use `PageVariables`:

```jsx
import PageVariables from '@site/src/components/PageVariables';
<PageVariables VCLUSTER_VERSION="0.25.0" />
// Then use [[GLOBAL:VCLUSTER_VERSION]] in code blocks
```

Use string concatenation with `\n` for multi-line (template literals break
YAML indentation).

## Automation (use these)

**Glossary terms** - wrap technical terms for tooltips:

```bash
npm run wrap-glossary          # auto-wrap known terms
npm run validate-glossary      # check for issues
```

See `src/data/glossary.yaml` for available terms.

**Lifecycle JSON** - when updating version support tables:

```bash
npm run generate-lifecycle-json  # regenerate from MDX partials
```

Source: `docs/_partials/*_supported_versions.mdx`

**Local dev:**

```bash
npm run start   # dev server at localhost:3000/docs
npm run build   # production build (validates glossary first)
npm run clear   # clear cache if things look wrong
```

**CI runs automatically:** claude-review, validate-glossary, integration-tests,
lifecycle-json updates

Note: Claude Code reads this file automatically (local and CI).

## Feature documentation template

When writing docs for new features:

### Overview

- WHAT: High-level description (add diagrams for architecture changes)
- WHY: Use cases this feature solves

### How to use

- Describe attributes/properties introduced
- Indicate if feature changes default behavior (use admonitions)
- Examples progress from simple (defaults) to complex (special properties)

### Examples format

- vCluster.yaml: description + code block
- Platform: description + step-by-step (no UI screenshots - they go stale)

### Checklist

- Where else should this feature be referenced?
- Does this change user experience/flow?
- Does structure match similar docs?

## Repositioning terminology (active project)

The docs are being repositioned to target AI cloud providers, neoclouds, and
enterprises. Apply these terminology rules to **all new and edited prose**.

| Retire | Use instead |
|--------|-------------|
| virtual cluster | tenant cluster |
| host cluster | Control Plane Cluster |
| multi-tenancy | tenant isolation |
| nested Kubernetes / runs inside a host cluster | virtualized control plane hosted on a Control Plane Cluster |
| shared cluster | (describe the specific tenancy model instead) |

**Hard rules:**

- Never use "virtual cluster" as a generic descriptor in prose.
- "vCluster" (the product name) is unchanged.
- CLI commands (`vcluster create`, flags, YAML keys) are unchanged — do not
  alter code blocks or command syntax.
- "Virtual Nodes" (the tenancy model powered by vNode) is a product name —
  keep it.
- "Control Plane Cluster" is always title-cased.

**Tone:** Lead with isolation, hyperscaler-grade reliability, and AI workload
suitability. De-emphasize cost/density framing in favor of isolation and
operational simplicity for providers.

See `.claude/skills/vcluster-docs-writer/SKILL.md` for general docs writing
conventions.

## SVG diagrams

SVGs must be imported as React components, not via `require().default`:

```jsx
import MyDiagram from '@site/static/media/diagrams/my-diagram.svg';

<figure>
  <MyDiagram style={{width: '100%', height: 'auto'}} role="img" aria-label="description" />
  <figcaption>Caption text</figcaption>
</figure>
```

`width: '100%'` alone is not enough — SVGs have a fixed `height` in the source
that locks the rendered size. `height: 'auto'` allows proportional scaling from
the `viewBox` aspect ratio. Do NOT use `<img src={require(...).default}>` for
SVGs; that returns a React component, not a URL.

To constrain image size without going full-width, add `maxWidth: '600px'` and
`margin: '0 auto'`. Use judgment — complex diagrams with many labels may need
full width to remain readable.

## Misc

- Check `vcluster/configure/` for configuration docs
- No emojis in code
