# vCluster docs - AI guidelines

See CONTRIBUTING.md for general style guide. This file covers AI-specific
gotchas.

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

Use relative file paths with `.mdx` extensions.

**Wrong:** `[Link](/vcluster/integrations/pod-identity)`

**Correct:** `[Link](../pod-identity.mdx)`

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

## Misc

- Check `vcluster/configure/` for configuration docs
- No emojis in code
