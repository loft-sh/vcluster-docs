# Contribute to the vCluster docs
<!-- vale off -->
## Docs website

This docs website is built using [Docusaurus](https://docusaurus.io/) v3, a modern
static website generator.

## Installation

```bash
npm install
```

### Local Development

```bash
npm run start
```

This command starts a local development server and opens up a browser window. Most
changes are reflected live without having to restart the server.
Note that `npm run start` doesn't always catch build errors.

### Build

```bash
npm run build
```

This command generates static content into the `build` directory and can be served
using any static contents hosting service.

`npm run serve`

Serves the built website locally.

Note: Before making a pull request, it's recommended to run `npm run serve` to fix
any broken links that may have been introduced.

## Style guide

Most of the style guide rules is enforced by `vale` linter. See the [style guide
automation](#style-guide-automation) section for more information.

The vCluster docs use the following style guides in this order:

1. [Google developer documentation style guide](https://developers.google.com/style)
2. Kubernetes [Documentation Style Guide](https://kubernetes.io/docs/contribute/style/style-guide/)
for Kubernetes terms.

Page titles follow **sentence** case. Capitalize Kubernetes objects
[according to the K8s style guide](https://kubernetes.io/docs/contribute/style/style-guide/#documentation-formatting-standards).

### Core principles

Here are some core principles to keep in mind when writing documentation:

- Active voice creates stronger documentation and helps with translations -
write "deploy the configuration" instead of "the configuration was deployed".

- Using sentence case in headings makes content more approachable - write
"Getting started with providers" instead of "Getting Started with Providers".

- Keep sentences under 25 words to improve readability and SEO performance -
break down complex ideas into digestible chunks.

- Write in present tense - say "this command installs" rather than "this command
will install". Docs refer to actions that happen in the present as users read
them.

- Use contractions (don't, isn't, can't) for better clarity - "don't" stands out
more than "do not" when expressing negatives.

- Avoid Latin phrases (e.g., i.e., etc.) - choose plain English alternatives
that all readers can understand easily.

- Never use terms like "easy," "simple," or "obvious" as they can undermine
reader confidence and create unnecessary pressure.

- Create descriptive link text - instead of "click here," explain where the link
leads, such as "view the installation guide".

- Spell out acronyms on first use unless they're universally known in technical
contexts.

### Consistency and document flow

When creating new documentation, review similar existing documents to maintain consistent flow and structure. For example, see how platform deployment documentation follows a standard pattern in the [Quick Start Guide](https://www.vcluster.com/docs/platform/install/quick-start-guide). This helps readers navigate documentation intuitively since they know what to expect.

Documents of the same kind should use consistent header levels and structure. All installation guides should use the same header hierarchy and naming conventions to help users navigate between different installation options.

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

### Oxford comma

Use the Oxford comma (serial comma) before the last item when listing 3 or more
items in a sentence.

- **Do Not**: vCluster requires a, b and c.
- **Do**: vCluster requires a, b, and c.

See Scribbr's [article](https://www.scribbr.com/commas/oxford-comma/) on the Oxford
comma for a detailed explanation and examples.

### Code blocks

Use `<>` to indicate placeholders in code blocks. For example:

```bash
kubectl get pods <pod-name>
```

#### Formatting and variables

To make code blocks easier to work with, consider adding variables and use [here
docs](https://en.wikipedia.org/wiki/Here_document) to make it easier to copy and paste code snippets.

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

Applying a Kubernetes manifest using here docs:

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
> here docs support is available in most shells, including bash, zsh, and fish,
> however in shells other than bash, the syntax may vary.

#### Highlight lines of code

Use inline comments in the code to highlight lines. See <https://docusaurus.io/docs/markdown-features/code-blocks#highlighting-with-comments>.

### vCluster terms

Loft Labs is the company. Do not use "Loft" or "Loft Platform" to refer to vCluster
products.

"vCluster" is a trademark. There are strict legal frameworks around how to use a
trademark, e.g. it cannot be used in plural. **Do not use "vClusters"**.

### Products

- vCluster:
- vCluster Pro: a single enhanced/paid/upgraded virtual cluster that uses Pro
  functionality (as labeled "Pro")
- vCluster Platform: the management platform and UI for managing open source and
  commercial vCluster instances

### CLI

`vcluster`

### Virtual clusters

Never use vCluster or vClusters when talking about a virtual cluster or clusters
that vCluster creates.

### Kubernetes distros

Abbreviations for Kubernetes distros:

- [Lightweight Kubernetes](https://k3s.io/): K3s
- [Kubernetes](https://kubernetes.io/): K8s
- [Zero Friction Kubernetes](https://k0sproject.io/ ): k0s  Note that k0s is the
  only Kubernetes distro to use a lower case 'k'
- [AWS Elastic Kubernetes Service](https://aws.amazon.com/eks/): EKS

### Other product terms

- AWS [EKS](https://aws.amazon.com/eks/)
- [CoreDNS](https://coredns.io/)
- [etcd](https://etcd.io/)

## Style guide automation {#style-guide-automation}

To maintain quality and consistency in our technical documentation, we use [vale](https://vale.sh/) as a linter to automatically enforce style guidelines.

> [!NOTE]
> The CI workflow automatically runs Vale on pull requests that change specific documentation files, including `.mdx` and `.md` files in the `platform`, `vcluster`, and `vcluster_versioned_docs` directories.

### What is Vale?

[Vale](https://vale.sh/) is an open-source, command-line linter that helps you enforce style and grammar rules in written documentation. It’s highly configurable, allowing you to define custom rules that suit your project’s needs. By integrating it into our CI pipeline, contributors can receive real-time feedback on their documentation during pull requests.

### Running Vale Locally

Vale offers multiple installation methods suitable for different operating systems:

- **macOS**: `brew install vale`
- **Windows**: `choco install vale`
- **Linux**: `brew install vale` or use another [package manager](https://repology.org/project/vale/versions)
- **Docker**: `docker pull jdkato/vale`

Individual files or folders can be linted

- To check all files (this may take some time): `vale .`
- To check a specific file: `vale path/to/file.mdx`
- To check a specific folder including subfolders: `vale /path/to/folder`

Running `vale` locally allows us to check our documentation before submitting a pull request. This helps catch style issues early and streamlines the review process.

### Plugins
VSCode and Neovim have `vale` plugins that can be installed to lint files as
you write them.

- VSCode [vale plugin](https://github.com/errata-ai/vale-vscode).
- Neovim Setup:
  - Install [mason.nvim](https://github.com/williamboman/mason.nvim) and add vale_ls LSP. Configure and use like any other LSP.
  - Install `vale_ls` on start with `lazy.nvim`
    ```lua
    return {
      "williamboman/mason.nvim",
      optional = true,
      opts = function(_, opts)
        if type(opts.ensure_installed) == "table" then
          vim.list_extend(opts.ensure_installed, { "vale_ls" })
        end
      end,
    }
    ```

> [!IMPORTANT]
> Currently `vale` operates under
**MinAlertLevel = warning**
This means all warnings are treated as errors and will fail the CI. You are
encouraged to set the `MinAlertLevel` to `suggestion` in your local `.vale.ini`
to take advantage of the full range of Vale's capabilities. You can easily
copy the `.vale.ini` file from the root of the repository and run linter with
`vale --config="/path/to/your/.vale.ini"`.

### Controlling Vale Rules

Disabling All Rules
- Use these HTML-style comments to control Vale checking:
  ```
  <!-- vale off -->  // Stops all Vale checks
  <!-- vale on -->   // Resumes Vale checks
  ```

- Example usage:
  ```
  <!-- vale off -->
  <!-- this section ignores all Vale rules -->
  This content won't be checked by Vale.
  <!-- vale on -->
  ```

Disabling Specific Rules
- Target individual rules with this syntax:
  ```
  <!-- vale RuleName = NO -->  // Disables one rule
  <!-- vale RuleName = YES --> // Re-enables that rule
  ```

Important formatting requirements:
  - Use capital YES and NO
  - Include spaces around the equals sign
  - Specify the full rule name

- Example usage:
  ```
  <!-- vale Google.Contractions = NO -->
  This section ignores only the contractions rule
  <!-- vale Google.Contractions = YES -->
  ```
<!-- vale on -->
