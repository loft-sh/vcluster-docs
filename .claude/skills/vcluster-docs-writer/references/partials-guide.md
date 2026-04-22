# Partials and Components Guide

Complete guide to using partials, fragments, code blocks, and imports in vCluster documentation.

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

**Use `@site/` for shared non-versioned content:**
- `docs/_partials/`
- `docs/_fragments/`
- `docs/_code/`

**Use relative paths for everything else:**
- Versioned content in `vcluster_versioned_docs/version-*/`
- Any content specific to a version

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

## Regular Partial Imports

For MDX partials that render directly:

```jsx
import MyPartial from '@site/docs/_partials/my-partial.mdx';

<MyPartial />
```

**Example with parameters:**
```jsx
import InstallSteps from '@site/docs/_partials/install-steps.mdx';

<InstallSteps platform="eks" />
```

## Fragment Imports

Fragments are reusable text snippets:

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

**Host cluster configuration:**
<CodeBlock language="yaml">{HostConfig}</CodeBlock>

**Virtual cluster configuration:**
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
