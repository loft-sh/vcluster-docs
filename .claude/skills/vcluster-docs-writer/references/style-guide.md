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

- Keep **sentences under 25 words** to improve readability and SEO performance - break down complex ideas into digestible chunks. When a sentence is over 25 words, split it into two sentences rather than adding more punctuation.

- **Prefer periods over complex punctuation.** Use a period to end a thought rather than connecting clauses with em dashes, semicolons, or colons. Specific exceptions are fine:
  - **Em dashes** are acceptable in next-steps lists (`- [Link](url) — short description`) and code comments.
  - **Colons** are acceptable to introduce a list or a code block.
  - **Semicolons** should almost never appear in prose — split into two sentences instead.

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
Use `vcluster` CLI to quickly deploy a cluster.
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

## Word Choice: "delete" vs. "terminate"

Google.WordList flags "terminate" (along with "kill" and "abort") and suggests "stop",
"exit", "cancel", or "end" instead. That rule assumes "terminate" means ending a session,
process, or request. It doesn't hold for the other sense of the word: destroying a
Kubernetes object or the infrastructure behind it.

Pick the verb based on what's actually being destroyed:

- **"delete"** for a Kubernetes API object, matching the literal `kubectl delete` verb:
  deleting a pod, PVC, namespace, or other resource. kubectl displays `Terminating` for an
  object once its `metadata.deletionTimestamp` is set and removal is pending. That's not an
  actual `status.phase` value (Pod phases are `Pending`, `Running`, `Succeeded`, `Failed`, or
  `Unknown`), but it's still Kubernetes' own display convention, not a style choice, so
  leave `Terminating` as-is even though it contains "terminat-".
- **"terminate"** for a controller or component destroying the underlying cloud instance or
  VM behind a node, for example a cloud autoscaler or a remediation controller calling a
  provider API that actually destroys the instance, like `ec2:TerminateInstances`. Don't use
  it for a reboot-only API such as `compute.instances.reset`, which restarts the VM without
  destroying it. Call that a reboot, not a termination. Don't substitute "delete" for a real
  termination either: it blurs the distinction from `kubectl delete`, and it doesn't match
  the actual API being described.

If a page's prose legitimately needs "terminate" in the cloud-instance sense throughout and
Vale keeps flagging it, don't hand-edit around individual warnings; scope `Google.WordList
= NO` for that page in `.vale.ini` instead, with a comment explaining why. Double-check the
glob matches the file's **current** name: a page rename after the override was added leaves
a dead glob that silently stops applying, and the warnings resurface with no obvious cause.

## Oxford Comma

Use the Oxford comma (serial comma) before the last item when listing 3 or more items in a sentence.

- **Do Not**: vCluster requires a, b and c.
- **Do**: vCluster requires a, b, and c.

See Scribbr's [article](https://www.scribbr.com/commas/oxford-comma/) on the Oxford comma for a detailed explanation and examples.

## Version Numbers

Version numbers for vCluster Labs products carry a lowercase `v` prefix in prose. This is a company-wide convention, not a docs-only one.

- **Do Not**: Upgrade to vCluster 0.38 before you install Platform 5.0.
- **Do**: Upgrade to vCluster v0.38 before you install Platform v5.0.
- **Do Not**: This migration requires version 0.24.2 or later.
- **Do**: This migration requires vCluster v0.24.2 or later.

The rule covers vCluster, vCluster Platform, vNode, vMetal, and the vCluster CLI, whether the version is a minor (`v0.38`) or a patch (`v0.38.1`). Prefix every number in a range, as in "v0.24.2 to v0.28.x".

Leave these unchanged:

- Third-party versions follow their upstream style, such as Kubernetes 1.34, etcd 3.5, Helm 3.16, and Go 1.22.
- Code blocks, inline code, commands, flags, YAML values, URLs, file paths, and folder names. Helm's `--version 0.38.0` takes no prefix, and `vcluster_versioned_docs/version-0.38/` is a path.
- Dynamic version tokens such as `__VCLUSTER_VERSION__` render without the prefix, because most of them sit in code. When one appears in prose, write `v__VCLUSTER_VERSION__`.
- Versioned docs keep the format their release shipped.

`Loft.version-prefix` flags a product name or "version" followed by an unprefixed number. It can't tell a bare "0.37 or later" from a third-party version, so check those by eye.

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

## Integration Pages

A page about using vCluster or the platform with another product should stand
on its own for a reader who doesn't know that product yet:

- Start with a short summary of what the other product is and why someone
  would use the two together.
- Link to the other product's own documentation for its installation and
  configuration, instead of repeating it.
- Document only the vCluster or platform side in detail, plus the settings
  that connect the two.

## Document the Contract, Not the Implementation

Document what a reader can observe and rely on. Leave out how the code gets
there.

**The contract** includes API fields, defaults, allowed values, permissions,
conditions and events, timeouts after which the state changes, limits, failure
behavior, cleanup and deletion semantics, and upgrade and recovery behavior.
Retry intervals usually aren't, and "retries automatically" is enough. Keep
an interval when it changes an operational decision, such as how long to wait
before stepping in, or how much load the retries put on an external API.

**The implementation** includes controller and scheduling order, retry and
backoff mechanics, locks and bookkeeping annotations, internal storage such as
Secret names and encryption, admission code paths, and lists of which fields
each response strips.

Keep one of these details when it's necessary to perform or verify a
supported operation. Examples are the Secret names a restore extracts, an
annotation the reader checks before reusing a machine, a status field a verify
step checks, and the order in which a restore must bring components back. A
step added only to justify the detail doesn't count.

Keep a passage when it helps a reader do at least one of these:

- Choose a design.
- Configure it.
- Verify that it works.
- Diagnose a failure they're likely to hit.
- Upgrade, remove, or recover it safely.

Being true to the source isn't enough on its own. Detail you read in the code
while checking a claim belongs in the review, not on the page, unless it
changes what the reader does or checks.

Describe outcomes rather than code paths. For example:

- **Implementation:** "The controller requeues the claim with exponential
  backoff and takes a lock annotation before it selects a machine."
- **Contract:** "If no machine matches, the claim stays `Pending` and retries
  automatically. Check the claim's conditions for the reason."

Some internals are part of the contract for one reader. Where the product
stores configuration matters to someone restoring from a backup, so it
belongs on the backup and restore page, not on the task that changes the
setting. Put the detail on the page where it changes what the reader does.

**Never cut a limitation to make a page shorter or to avoid revealing
internals.** State its impact and what the reader can do about it. If a
limitation hasn't been approved for publication, ask Engineering how to
describe it. Don't drop it while the page still promises the guarantee it
weakens.

Don't link to private repositories or cite source file paths in published
docs.

## Page Templates

Start a new page from the template for its type in
[templates/](templates/README.md): feature, task, troubleshooting, and
reference pages. The README there also maps each kind of information to the
page type where it belongs. The templates apply this guide to those page types.
Where a template and this guide disagree, this guide wins.

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
