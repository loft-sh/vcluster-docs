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

Do NOT modify `vcluster_versioned_docs/version-*/` folders unless explicitly
requested.

## Link resolution

**Within same section** (e.g., platform → platform): Prefer relative file paths with `.mdx`:

- **Preferred:** `[Link](../understand/what-are-projects.mdx)`
- **Also works:** `[Link](/docs/platform/understand/what-are-projects)`

Relative paths are better: they work on GitHub, survive slug changes, and track moves.

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

**CI runs automatically:** validate-glossary, integration-tests,
lifecycle-json updates

**On-demand:** mention `@claude` in a PR comment for AI review

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

## Misc

- Check `vcluster/configure/` for configuration docs
- No emojis in code
