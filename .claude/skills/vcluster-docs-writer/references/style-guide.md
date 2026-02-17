# vCluster Documentation Style Guide

This style guide is enforced by the `vale` linter. Most rules will be automatically checked when running `scripts/run_vale.sh`.

The vCluster docs use the following style guides in this order:

1. [Google developer documentation style guide](https://developers.google.com/style)
2. Kubernetes [Documentation Style Guide](https://kubernetes.io/docs/contribute/style/style-guide/) for Kubernetes terms.

Page titles follow **sentence** case. Capitalize Kubernetes objects [according to the K8s style guide](https://kubernetes.io/docs/contribute/style/style-guide/#documentation-formatting-standards).

## Core Principles

Here are some core principles to keep in mind when writing documentation:

- **Active voice** creates stronger documentation and helps with translations - write "deploy the configuration" instead of "the configuration was deployed".

- Using **sentence case in headings** makes content more approachable - write "Getting started with providers" instead of "Getting Started with Providers".

- Keep **sentences under 25 words** to improve readability and SEO performance - break down complex ideas into digestible chunks.

- Write in **present tense** - say "this command installs" rather than "this command will install". Docs refer to actions that happen in the present as users read them.

- Use **contractions** (don't, isn't, can't) for better clarity - "don't" stands out more than "do not" when expressing negatives.

- **Avoid Latin phrases** (e.g., i.e., etc.) - choose plain English alternatives that all readers can understand easily.

- **Never use terms** like "easy," "simple," or "obvious" as they can undermine reader confidence and create unnecessary pressure.

- Create **descriptive link text** - instead of "click here," explain where the link leads, such as "view the installation guide".

- **Spell out acronyms** on first use unless they're universally known in technical contexts.

## Consistency and Document Flow

When creating new documentation, review similar existing documents to maintain consistent flow and structure. For example, see how platform deployment documentation follows a standard pattern in the [Quick Start Guide](https://www.vcluster.com/docs/platform/install/quick-start-guide). This helps readers navigate documentation intuitively since they know what to expect.

Documents of the same kind should use consistent header levels and structure. All installation guides should use the same header hierarchy and naming conventions to help users navigate between different installation options.

## Admonitions

Docusaurus admonitions should be used consistently throughout the documentation to highlight important information.

```markdown
:::note
Additional context: The `vcluster create` command automatically creates a new namespace if it doesn't exist.
:::

:::tip
Use `vcluster` CLI to quickly deploy a virtual cluster.
:::

:::info
The default configuration uses minimal resources suitable for testing.
:::

:::warning
Ensure your Kubernetes cluster has sufficient available memory before deploying vCluster.
:::

:::danger
Do not delete the vCluster pod.
:::
```

## Oxford Comma

Use the Oxford comma (serial comma) before the last item when listing 3 or more items in a sentence.

- **Do Not**: vCluster requires a, b and c.
- **Do**: vCluster requires a, b, and c.

See Scribbr's [article](https://www.scribbr.com/commas/oxford-comma/) on the Oxford comma for a detailed explanation and examples.

## Code Blocks

Use `<>` to indicate placeholders in code blocks. For example:

```bash
kubectl get pods <pod-name>
```

### Interactive Code Blocks

For code blocks that contain values users need to customize, use the `InterpolatedCodeBlock` component instead of regular code blocks. This allows users to edit values directly in the documentation.

**Using local variables** (user can edit each instance):
```mdx
import InterpolatedCodeBlock from '@site/src/components/InterpolatedCodeBlock';

<InterpolatedCodeBlock
  code={`kubectl create namespace [[VAR:NAMESPACE:my-namespace]]`}
  language="bash"
/>
```

**Using global variables** (define once, use everywhere on the page):
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

This eliminates repeated export statements across multiple code blocks. Use `PageVariables` when the same values (like version numbers or registry URLs) appear in multiple code examples on a page.

Notes:
- Place `PageVariables` before any code blocks that use those variables
- Can be placed anywhere on the page (doesn't have to be at the top)
- Multiple `PageVariables` components will merge together

### Formatting and Variables

To make code blocks easier to work with, consider adding variables and use [here docs](https://en.wikipedia.org/wiki/Here_document) to make it easier to copy and paste code snippets.

Using a variable in a code block:

```bash
$POD_NAME = pod-name
kubectl get pods $POD_NAME
```

Creating a file using a here doc:

```bash
cat <<EOF > vcluster.yaml
controlPlane:
  # Deploy etcd instead of using the embedded SQLite
  backingStore:
    etcd:
      deploy:
        enabled: true
        statefulSet:
          highAvailability:
            replicas: 3
  # Deploy vCluster with 3 replicas
  statefulSet:
    highAvailability:
      replicas: 3
EOF
```

Applying a Kubernetes manifest using docs:

```bash
cat << EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: example-pod
  labels:
    app: nginx
spec:
  containers:
  - name: nginx
    image: nginx:1.21
    ports:
    - containerPort: 80
EOF
```

> [!NOTE]
> here docs support is available in most shells, including bash, zsh, and fish, however in shells other than bash, the syntax may vary.

### Highlight Lines of Code

Use [inline comments](https://docusaurus.io/docs/markdown-features/code-blocks#highlighting-with-comments) in the code to highlight lines.

## Feature Documentation Template

When writing documentation for vCluster features, follow this structure:

### 1. Overview Section
- **WHAT**: High-level description of what the feature is
- **WHY**: Explain why users would want to use this feature and what use cases it solves
- Include diagrams if architecture changes are involved

### 2. How to Use the Feature
- Describe attributes/properties introduced with the feature
- **Important**: Always indicate if a feature changes default behavior using info/warning admonitions
- Examples should progress from simple (with defaults) to complex (special properties)

### 3. YAML Examples Best Practices
- **Always include descriptive comments** in yaml blocks explaining what each section does
- **Add context before the yaml** explaining the use case
- **Add "What happens" or "Effect" after the yaml** explaining the result
- Use `title` attribute for yaml code blocks (e.g., `yaml title="example.yaml"`)
- Structure examples by use case (e.g., "Use Case 1: Production namespace with specific naming")

### 4. Step-by-Step Examples
- Use `<Flow>` and `<Step>` components for multi-step procedures
- Each step should have clear description before commands
- Include expected output where relevant
- Group related examples under descriptive headings

### 5. Known Limitations Section
- Clearly document any limitations at the end
- Use subsections for different limitation categories
- Provide workarounds or alternative approaches where possible
- Include failing and working examples to illustrate limitations

### 6. Admonition Usage
- `:::info` for neutral information and default behaviors
- `:::warning` or `:::caution` for important limitations or immutable configurations
- `:::note` for additional helpful context
- **Never place admonitions inside JSX components** like `<Step>`

### 7. Writing Style
- Use sentence case for headings (not Title Case)
- Avoid future tense - use present tense
- Avoid first-person plural
- Be concise but complete
- Think from the user's perspective

## Controlling Vale Rules

### Disabling All Rules

Use these HTML-style comments to control Vale checking:

```
<!-- vale off -->  // Stops all Vale checks
<!-- vale on -->   // Resumes Vale checks
```

Example usage:
```
<!-- vale off -->
<!-- this section ignores all Vale rules -->
This content won't be checked by Vale.
<!-- vale on -->
```

### Disabling Specific Rules

Target individual rules with this syntax:
```
<!-- vale RuleName = NO -->  // Disables one rule
<!-- vale RuleName = YES --> // Re-enables that rule
```

Important formatting requirements:
- Use capital "YES" and "NO"
- Include spaces around the equals sign
- Specify the full rule name

Example usage:
```
<!-- vale Google.Contractions = NO -->
This section ignores only the contractions rule
<!-- vale Google.Contractions = YES -->
```
