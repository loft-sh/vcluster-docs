# Partials and Components Guide

Complete guide to using partials, fragments, code blocks, and imports in vCluster documentation.

## Partials vs fragments

- **`_partials/` is for generated content only**, such as
  `vcluster/_partials/config/` and `platform/api/_partials/resources/`. Never
  hand-edit it, and never add a hand-written file to it.
- **`_fragments/` is for hand-written reusable content.** Put every new
  reusable snippet here, in the product tree that uses it, or in
  `docs/_fragments/` for root and global content.
- Many hand-written files still live in `_partials/`. They're legacy. Import
  them where they are, but don't copy their location for new files.

See "Partials vs fragments" in the repo's `CLAUDE.md` for the full rule.

## Discovering Available Resources

```bash
# List all _partials, _fragments, and _code directories
scripts/discover_partials.sh

# Get language identifier for code blocks
scripts/detect_language.sh example.yml  # Returns: yaml
scripts/detect_language.sh script.sh    # Returns: bash
```

## Generating Import Statements

```bash
# Generate correct import statement (handles @site vs relative paths)
scripts/generate_import.sh <partial-path> <current-file-dir>
```

The script automatically determines whether to use `@site/` or relative paths based on the content location.

## Import Path Rules

Follow "Link resolution" in the repo's `CLAUDE.md`. In short:

- **Same-product fragments and partials:** a relative path, so versioned
  copies keep importing their own version.
- **Root and global content** (`docs/_fragments/`, `docs/_partials/`,
  `docs/_code/`): `@site/docs/...`.
- **Cross-product content:** `@site/<other-product>/...`, only when tracking the
  other product's current content is intentional.

## Code Block Imports

Use the raw loader for importing code files:

```jsx
import ExampleYaml from '!!raw-loader!@site/docs/_partials/example.yaml';

<CodeBlock language="yaml" title="example.yaml">{ExampleYaml}</CodeBlock>
```

**Example with versioned content:**
```jsx
import VirtualScheduler from '!!raw-loader!../../../_code/virtual-scheduler.yaml';

<CodeBlock language="yaml">{VirtualScheduler}</CodeBlock>
```

## Generated Partial Imports

Import generated reference content with a relative path:

```jsx
import ConfigReference from '../../_partials/config/controlPlane.mdx';

<ConfigReference />
```

## Fragment Imports

Fragments are hand-written reusable snippets. They can take props, which the
fragment reads as `props.<name>`:

```jsx
import VersionNote from '@site/docs/_fragments/version-note.mdx';

<VersionNote version="0.20.0" />
```

## Common Patterns

### Pattern 1: Code Block with Title
```jsx
import ConfigYaml from '!!raw-loader!@site/docs/_code/config.yaml';

<CodeBlock language="yaml" title="vcluster.yaml">{ConfigYaml}</CodeBlock>
```

### Pattern 2: Multiple Code Blocks
```jsx
import HostConfig from '!!raw-loader!@site/docs/_code/host-config.yaml';
import GuestConfig from '!!raw-loader!@site/docs/_code/guest-config.yaml';

**Control plane cluster configuration:**
<CodeBlock language="yaml">{HostConfig}</CodeBlock>

**Cluster configuration:**
<CodeBlock language="yaml">{GuestConfig}</CodeBlock>
```

### Pattern 3: Partial with Context
```jsx
import Prerequisites from '@site/docs/_partials/prerequisites.mdx';

## Before you begin

<Prerequisites />

Now you can proceed with...
```

## Troubleshooting

**Import not resolving:**
- Check if path uses `@site/` correctly for shared content
- Verify relative path depth matches directory structure
- Run `scripts/discover_partials.sh` to confirm partial exists

**Code block not rendering:**
- Ensure `!!raw-loader!` prefix is present
- Check language identifier is correct (use `scripts/detect_language.sh`)
- Verify file extension matches content type

**Partial not rendering:**
- Check if partial contains valid MDX syntax
- Ensure partial is exported (most partials export default)
- Verify import path resolves correctly
