# MDX Components and Formatting Rules

## Important Admonition Formatting Inside JSX Components

When working with vCluster documentation, there's a **critical MDX parsing rule** regarding admonitions inside JSX components like `<Step>`:

### ⚠️ NEVER Place Admonitions Inside JSX Components

**Rule**: Never place Docusaurus admonitions (:::note, :::warning, etc.) inside JSX components like `<Step>`, `<Flow>`, or other custom components.

MDX parsers have trouble with admonitions inside JSX component blocks. Always place admonitions **outside** of JSX components.

#### ❌ WRONG:
```mdx
<Step>
  Do something important.

  :::warning
  This will cause MDX parsing errors!
  :::
</Step>
```

#### ✅ CORRECT:
```mdx
:::warning
Important note before the step.
:::

<Step>
  Do something important.
</Step>
```

Or:

```mdx
<Step>
  Do something important.
</Step>

:::warning
Important note after the step.
:::
```

## Flow and Step Components

Use `<Flow>` and `<Step>` components for multi-step procedures:

```mdx
<Flow>
  <Step>
    ### Step 1: Install the CLI

    Run the following command to install the vCluster CLI:

    ```bash
    curl -L -o vcluster "https://github.com/loft-sh/vcluster/releases/latest/download/vcluster-linux-amd64"
    sudo install -c -m 0755 vcluster /usr/local/bin
    ```
  </Step>

  <Step>
    ### Step 2: Create a virtual cluster

    Create your first virtual cluster:

    ```bash
    vcluster create my-vcluster
    ```

    This creates a new virtual cluster named `my-vcluster` in the current namespace.
  </Step>

  <Step>
    ### Step 3: Connect to the cluster

    The CLI automatically connects you to the virtual cluster. Verify the connection:

    ```bash
    kubectl get namespaces
    ```
  </Step>
</Flow>
```

### Best Practices for Flow/Step:

1. **Each step should have clear description** before commands
2. **Include expected output** where relevant
3. **Group related examples** under descriptive headings
4. **Use heading levels consistently** within steps (typically h3 `###`)
5. **Never nest admonitions** inside `<Step>` components

## Admonition Types

Docusaurus provides several admonition types. Use them consistently:

```markdown
:::note
Additional context or supplementary information.
:::

:::tip
Helpful advice or best practices.
:::

:::info
Neutral information and default behaviors.
:::

:::warning
Important limitations, immutable configurations, or things to be careful about.
:::

:::caution
Similar to warning, use for situations requiring extra attention.
:::

:::danger
Critical warnings about destructive actions or serious consequences.
:::
```

### When to Use Each Type:

- **:::note** - Additional helpful context that's not critical
- **:::tip** - Suggestions for better approaches or shortcuts
- **:::info** - Neutral information, default behaviors, or clarifications
- **:::warning** - Important limitations, breaking changes, or immutable configs
- **:::caution** - Situations requiring extra attention or careful consideration
- **:::danger** - Destructive actions, data loss risks, or serious consequences

## Code Block Components

### Standard Code Blocks

For simple code examples, use standard markdown code blocks with language identifiers:

````markdown
```yaml title="vcluster.yaml"
controlPlane:
  backingStore:
    etcd:
      deploy:
        enabled: true
```
````

### Interactive Code Blocks

For code blocks with customizable values, use the `InterpolatedCodeBlock` component:

```mdx
import InterpolatedCodeBlock from '@site/src/components/InterpolatedCodeBlock';

<InterpolatedCodeBlock
  code={`kubectl create namespace [[VAR:NAMESPACE:my-namespace]]`}
  language="bash"
/>
```

### ⚠️ CRITICAL: InterpolatedCodeBlock Formatting Rule

**Template Literal Formatting**: The backtick (`) must be on a **new line** after `code={`, with **NO leading whitespace** on content lines.

#### ❌ WRONG - Backtick on same line:
```mdx
<InterpolatedCodeBlock
  code={`# Deploy platform pods
nodeSelector:
  kubernetes.azure.com/mode: user`}
  language="yaml"
/>
```

**Problem**: This causes incorrect indentation rendering in the built page.

#### ✅ CORRECT - Backtick on new line:
```mdx
<InterpolatedCodeBlock
  code={
`# Deploy platform pods
nodeSelector:
  kubernetes.azure.com/mode: user`
  }
  language="yaml"
/>
```

**Key Points**:
1. `code={` on one line
2. Opening backtick ` on next line with NO spaces before it
3. Content starts immediately with NO leading indentation
4. Closing backtick ` with proper indentation (aligning with code content)
5. Closing `}` on next line

This formatting ensures the InterpolatedCodeBlock component correctly handles YAML indentation and renders properly in the browser.

### Code Blocks with Imported Content

For code blocks that import content from files (like partials or code examples):

```mdx
import CodeBlock from '@theme/CodeBlock';
import ExampleYaml from '!!raw-loader!@site/docs/_partials/example.yaml';

<CodeBlock language="yaml" title="example.yaml">{ExampleYaml}</CodeBlock>
```

## Page Variables

Use `PageVariables` component to define values that can be reused across multiple code blocks on a page:

```mdx
import PageVariables from '@site/src/components/PageVariables';
import InterpolatedCodeBlock from '@site/src/components/InterpolatedCodeBlock';

<PageVariables VCLUSTER_VERSION="0.25.0" REGISTRY="ecr.io/myteam" />

<InterpolatedCodeBlock
  code={`export VCLUSTER_VERSION=[[GLOBAL:VCLUSTER_VERSION]]
export REGISTRY=[[GLOBAL:REGISTRY]]`}
  language="bash"
/>
```

**Benefits**:
- Define once, use everywhere on the page
- Eliminates repeated export statements
- Makes it easy to update values in one place

**Notes**:
- Place `PageVariables` before any code blocks that use those variables
- Can be placed anywhere on the page (doesn't have to be at the top)
- Multiple `PageVariables` components will merge together

## Common Import Patterns

### Importing from Theme:
```jsx
import CodeBlock from '@theme/CodeBlock';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
```

### Importing from Site Components:
```jsx
import InterpolatedCodeBlock from '@site/src/components/InterpolatedCodeBlock';
import PageVariables from '@site/src/components/PageVariables';
```

### Importing Partials with Raw Loader:
```jsx
import ExampleYaml from '!!raw-loader!@site/docs/_partials/example.yaml';
import ExampleScript from '!!raw-loader!../../../_code/example.sh';
```

### Importing Regular Partials:
```jsx
import MyPartial from '@site/docs/_partials/my-partial.mdx';
import RelativePartial from '../../../_partials/relative-partial.mdx';
```

## MDX Best Practices

1. **Import statements** go after frontmatter and before content
2. **JSX components** must be properly closed (`<Component />` or `<Component></Component>`)
3. **Blank lines** should separate JSX from markdown content
4. **Indentation** inside JSX components should be consistent
5. **Admonitions** must never be placed inside JSX components
6. **Code blocks** inside JSX need proper escaping or use the CodeBlock component
