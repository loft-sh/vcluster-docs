<!-- vale off -->

This guide is for anyone who wants to improve the vCluster and vCluster
Platform docs, and it's written for contributors outside vCluster Labs.
Everything it describes uses public resources: this repository, the published
docs site, and the public [loft-sh/vcluster](https://github.com/loft-sh/vcluster)
and [loft-sh/api](https://github.com/loft-sh/api) repositories. A few steps,
such as adding backport labels or requesting an AI review, need a maintainer.
Ask for them in your PR description. vCluster Labs staff have an internal
guide with more detail on tickets, branches, and private previews.

This docs website is built using [Docusaurus](https://docusaurus.io/) v3, a
modern static website generator.

## Getting started

Fork the [vCluster docs repository](https://github.com/loft-sh/vcluster-docs) and clone your fork locally

```bash
git clone https://github.com/<your username>/vcluster-docs
```

then run the following command to install dependencies:

```bash
npm install
```

This repository requires Node.js 22 or later. The `.nvmrc` file pins the
version that CI uses.

### Local development

Run the following command to start a local development server:

```bash
npm run start
```

This command opens `http://localhost:3000/docs` in your default browser. Most changes are reflected live without having to restart the server. Note that this command doesn't always catch build errors.

### Build

After finishing your changes, run the following command to test production build locally:

```bash
npm run build
```

This command generates static content into the `build` directory and can be
served using any static contents hosting service.

You can run the following command to serve the built website locally:

```bash
npm run serve
```

Before making a pull request, it's recommended to run this command to
fix any broken links that may have been introduced. A build doesn't catch
every kind of broken link, so also see
[Checking links before you push](#checking-links-before-you-push).

### Preview a stacked PR

Netlify builds a deploy preview only for PRs whose base branch is `main` or
another branch Netlify deploys, such as `next`. A stacked PR, one that targets
another PR's branch, gets no preview from Netlify.

The `stacked-pr-preview` workflow fills the gap. For a PR whose base isn't
`main`, `next`, or a `vcluster-v*` or `platform-v*` branch, it builds the site
and deploys a Netlify draft at the alias `pr-<number>`. It then posts the URL,
`https://pr-<number>--vcluster-docs-site.netlify.app/docs/`, as a PR comment
and updates both on every push. PRs from forks get no preview, because GitHub
doesn't pass repository secrets to them. A native GitHub stack created with
`gh stack` on top of `main` already gets Netlify Deploy Previews, so the
workflow skips it.

#### Deploy a preview by hand

Use the manual steps when the workflow can't run, for example on a PR from a
fork. If you have access to the docs project in Netlify, you can deploy a draft
preview yourself with the Netlify CLI. Otherwise, ask someone who has access.
The build needs about 11 GB of memory.

```bash
npx netlify-cli login
npx netlify-cli link
npx netlify-cli deploy --context deploy-preview --dir=public --alias=pr-<number>
```

`netlify link` prompts you to choose the project. The `deploy` command runs the
site build first, so you don't need a separate `netlify build`. The deploy is a
draft, so it doesn't change the live site, and the CLI prints its URL when it
finishes. Rerun the `deploy` command to update it after you push changes.

Never use `main`, `next`, or another deployed branch name as the alias.
Netlify serves an alias at the same subdomain as a branch deploy with that
name. Omit `--prod`, which publishes to the live site.

As with any preview, put `/next/` after the product path to see unreleased
changes, for example `/docs/platform/next/...`.

## Where your change goes

Start by finding the page you want to change. Most changes update a page that
already exists. Search the docs site, or search this repository for a config
key, flag, or resource name. If a feature extends something that's already
documented, update that page instead of adding a new one.

The site is built from three folders, each with its own sidebar:

| Folder | Covers |
| --- | --- |
| `vcluster/` | The cluster vCluster creates: its control plane, worker nodes, `vcluster.yaml`, resource sync, and the `vcluster` CLI. |
| `platform/` | vCluster Platform: tenants and projects, templates, users and permissions, apps, fleet operations, Platform install and administration, and the API. vMetal, the machine layer, lives in `platform/vmetal/`. |
| `docs/` | Pages that span products, such as the services a provider can offer and end-to-end guides. |

Within each folder, sections are organized by what the reader is doing, not by
where the code lives. These are the placement questions that come up most:

- **vCluster: Deploy, Configure, or Operate?** Deploy (`vcluster/deploy/`) is
  for creating a cluster or attaching its nodes. Configure
  (`vcluster/configure/`) is for changing a `vcluster.yaml` setting to turn on
  or tune a capability. Operate (`vcluster/operate/`) is for actions on a
  cluster that's already running, such as upgrades and backups.
- **Platform: Deliver services to tenants, or Use the platform?** If an admin
  sets something up for others to consume, such as a template or a
  permission, it goes in `platform/tenants/`. If a project user works with what
  they were given, such as creating a cluster from a template, it goes in
  `platform/use-platform/`.
- **vMetal: machine model or driver?** Behavior that's the same for every
  provisioning driver goes in `platform/vmetal/concepts/`. Anything specific to
  one driver, such as Metal3 or KubeVirt, goes with that driver in
  `platform/vmetal/drivers/`.
- **A feature that spans products.** Document each part where its owner lives,
  and link between them, instead of writing the same procedure twice.

If you're not sure where a page belongs, say so in the PR description. A
maintainer will place it.

### Generated pages

Some reference pages are generated from source on each release, so an edit to
them is overwritten. Change the source instead, or describe the problem in an
issue or PR.

| Content | Folder | Generated from |
| --- | --- | --- |
| `vcluster.yaml` key reference | `vcluster/_partials/config/` | The schema field descriptions in [loft-sh/vcluster](https://github.com/loft-sh/vcluster) |
| vCluster CLI reference | `vcluster/cli/vcluster_*.md` | The command help text in [loft-sh/vcluster](https://github.com/loft-sh/vcluster) |
| Platform API reference | `platform/api/` | The Go doc comments in [loft-sh/api](https://github.com/loft-sh/api) |

To add prose next to a generated field, see
[Adding prose to generated partials](#adding-prose-to-generated-partials).

## Versions and branches

### Versioned and unversioned folders

| Folder | What it is | Published at |
| --- | --- | --- |
| `vcluster/`, `platform/` | The docs for the next, unreleased version. Make your changes here. | `/docs/vcluster/next/...` and `/docs/platform/next/...` |
| `vcluster_versioned_docs/version-X.Y.Z/` | A frozen copy of each released vCluster version. The newest is the default. | `/docs/vcluster/...` for the newest, `/docs/vcluster/X.Y.Z/...` for older ones |
| `platform_versioned_docs/version-X.Y.Z/` | A frozen copy of each released Platform version. | `/docs/platform/...` for the newest, `/docs/platform/X.Y.Z/...` for older ones |
| `docs/` | The root docs. Not versioned. | `/docs/...` |

At each release, the unversioned folders are copied into a new version folder.
Don't edit the versioned folders directly. Change the page in `vcluster/` or
`platform/`, and use backport labels to carry the fix into released versions.

### Which branch to target

Open your PR against `main`. Everything merged to `main` appears on the
public site right away, under the unreleased `/next/` URLs.

The repository also has a `next` branch. It isn't the same as the `/next/`
URLs. Maintainers use the `next` branch only for major releases, to prepare
docs that must not appear on the public site before the release, such as a
large reorganization. Don't target it unless a maintainer asks you to.

### Backport changes to released versions

To carry a fix into released versions, add a `backport-vX.XX` label to the PR,
one per version. After the PR merges, a workflow copies each changed file under
`vcluster/` or `platform/` to the same path in that version's folder and opens a
backport PR.

> [!WARNING]
> The copy only works when the page has the same path in the older version.
> Platform 5.0 and vCluster 0.38 reorganized most of the docs, so a page's
> current path often doesn't exist in Platform 4.12 or earlier, or vCluster 0.37
> or earlier. For those pages, don't add a backport label. Make the change by
> hand in each older version's folder, at that version's own path, and say so
> in the PR description. Pages that kept their path still backport normally.
> This applies until Platform 4.12 and vCluster 0.37 reach end of support.

Until Platform 5.0 and vCluster 0.38 are released, the unversioned folders on
`main` still use the Platform 4.12 and vCluster 0.37 layout, so backport labels
on PRs into `main` work normally.

vCluster labels use the minor version, such as `backport-v0.37`. Platform
labels include the patch version, such as `backport-v4.12.0`. Only maintainers
can add labels, so if you're contributing from outside vCluster Labs, list the
versions the fix applies to in your PR description.

## After you open a PR

- **Checks.** If you opened the PR from a fork, GitHub waits for a maintainer to
  approve the workflow runs before any checks start. The checks include the
  Lint check (see [Style guide automation](#style-guide-automation)), link
  validators, glossary and feature table checks, and a redirect check when a
  page moves or is deleted.
- **Preview.** Netlify builds a deploy preview and comments with its link. Your
  changes to `vcluster/` or `platform/` appear in the unreleased version, so
  add `/next/` after `/docs/vcluster` or `/docs/platform` in the preview URL.
- **Review.** A maintainer reviews the PR and may suggest edits for style,
  placement, or accuracy.

## AI-assisted PR review

Maintainers can request an AI review from Claude by mentioning `@claude` in a PR
comment. Only members of the `loft-sh` organization can trigger it, so if
you're contributing from outside vCluster Labs, ask a maintainer.

Example commands:

- `@claude review this PR` - get a focused review
- `@claude fact check this page` - check the technical claims against the code

Claude reads the PR and posts review comments. It doesn't push changes. The
review checks documentation style, validates vCluster YAML configurations, and
identifies broken links. The AI review is meant to assist, not replace, human
review.

## SEO and crawler policy

The docs site exposes multiple versions (current stable, prior supported,
EOS/EOL, and the `next` preview). Only the current stable version should
compete for search engine and AI crawler attention; older versions remain
reachable for users who need them, but must not outrank or dilute the
current docs. See DOC-1325 for background.

### What the current setup does

- **`lastVersion`** in `docusaurus.config.js` makes unversioned URLs (for
  example `/docs/vcluster/deploy/...`) serve the current stable release.
  Those unversioned URLs are the canonical, indexable entry points.
- **noindex on non-current versions** is emitted by
  `src/theme/DocItem/Layout/index.js`. The swizzle reads
  `useActivePluginAndVersion()` and injects
  `<meta name="robots" content="noindex,follow">` whenever `isLast` is
  false. That covers EOS, EOL, any prior stable version still in
  `onlyIncludeVersions`, and the `current` (next/main) preview.
- **Sitemap** (`docusaurus.config.js`, sitemap plugin) lists only
  unversioned URLs. Any path matching `/vcluster/<X.Y.Z>/` or
  `/platform/<X.Y.Z>/` — plus the `next` previews — is stripped by both
  `ignorePatterns` and a post-filter in `createSitemapItems`.
- **`llms.txt`** already excludes versioned docs via
  `includeVersionedDocs: false` on the `docusaurus-plugin-llms-txt` plugin.
  That stays as-is.
- **`static/robots.txt`** is intentionally permissive. `Disallow` would
  block crawlers from fetching the page and therefore from ever seeing the
  `noindex` meta tag, which is the opposite of what we want. Note that the
  production host `vcluster.com/robots.txt` is served by the main site
  repo, not this one; this file applies to the Netlify preview domain.
- **Canonical tags** are not emitted automatically. Only add a `<link
  rel="canonical">` when the content at a versioned URL is effectively
  identical to the current version. Do not point version-specific content
  (release notes, deprecated APIs, migration guides) at the current docs.

### When adding or removing a version

1. Update `onlyIncludeVersions` in `docusaurus.config.js` for the affected
   docs plugin (vcluster or platform). No SEO code changes are required —
   the swizzle derives `isLast` from the plugin config.
2. When bumping `lastVersion`, the previous stable version automatically
   starts emitting `noindex,follow`. No per-version list to edit.
3. Regenerate the lifecycle JSON (`npm run generate-lifecycle-json`) so
   the supported-versions partial stays in sync with the config.

## Style guide

The full style guide is
[style-guide.md](https://github.com/loft-sh/vcluster-docs/blob/main/.claude/skills/vcluster-docs-writer/references/style-guide.md),
with product names and terminology in
[vcluster-terms.md](https://github.com/loft-sh/vcluster-docs/blob/main/.claude/skills/vcluster-docs-writer/references/vcluster-terms.md).
Both are part of the docs-writer skill in this repository, so AI tools that
work in the repository follow the same rules. The sections below summarize the
rules contributors run into most.

The Vale linter enforces most of the rules. See the
[style guide automation](#style-guide-automation) section for more information.

The vCluster docs use the following style guides in this order:

1. [Google developer documentation style guide](https://developers.google.com/style)
2. Kubernetes
   [Documentation Style Guide](https://kubernetes.io/docs/contribute/style/style-guide/)
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

When creating new documentation, review similar existing documents to maintain
consistent flow and structure. For example, see how platform deployment
documentation follows a standard pattern in the
[Quick Start Guide](https://www.vcluster.com/docs/platform/install/quick-start-guide).
This helps readers navigate documentation intuitively since they know what to
expect.

Documents of the same kind should use consistent header levels and structure.
All installation guides should use the same header hierarchy and naming
conventions to help users navigate between different installation options.

Docusaurus admonitions should be used consistently throughout the documentation
to highlight important information.

```markdown
:::note Additional context: The `vcluster create` command automatically creates
a new namespace if it doesn't exist. :::

:::tip Use `vcluster` CLI to quickly deploy a cluster. :::

:::info The default configuration uses minimal resources suitable for testing.
:::

:::warning Ensure your Kubernetes cluster has sufficient available memory before
deploying vCluster. :::

:::danger Do not delete the vCluster pod. :::
```

### Oxford comma

Use the Oxford comma (serial comma) before the last item when listing 3 or more
items in a sentence.

- **Do Not**: vCluster requires a, b and c.
- **Do**: vCluster requires a, b, and c.

See Scribbr's [article](https://www.scribbr.com/commas/oxford-comma/) on the
Oxford comma for a detailed explanation and examples.

### Code blocks

Use `<>` to indicate placeholders in code blocks. For example:

```bash
kubectl get pods <pod-name>
```

#### Dynamic version tokens

Instead of hardcoding version numbers that go stale, use these tokens:

| Token | Renders as |
|-------|------------|
| `__PLATFORM_VERSION__` | Latest platform version (e.g., 4.5.0) |
| `__VCLUSTER_VERSION__` | Latest vCluster version (e.g., 0.30.0) |
| `__PLATFORM_VERSION_MINOR__` | Minor version only (e.g., 4.5) |
| `__VCLUSTER_VERSION_MINOR__` | Minor version only (e.g., 0.30) |

```bash
export PLATFORM_VERSION=__PLATFORM_VERSION__
helm install vcluster --version __VCLUSTER_VERSION__
```

Tokens are replaced at build time by a remark plugin. In versioned docs
(e.g., `/platform/4.3.0/`), tokens resolve to that version instead of latest.

#### Interactive code blocks

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

**Adding titles to code blocks** (optional):

The `InterpolatedCodeBlock` component supports an optional `title`
attribute to display a descriptive title above the code block:

```mdx
<InterpolatedCodeBlock
  code={`export CLUSTER_NAME=[[VAR:CLUSTER_NAME:vcluster-demo]]
export REGION=[[VAR:REGION:eu-central-1]]`}
  language="bash"
  title="Set environment variables"
/>
```

The `title` attribute is completely optional and backwards compatible.
Existing code blocks without a title will continue to work as before.

#### Icon component

Use the `Icon` component to display checkmarks, crosses or warnings for feature availability, comparison tables, or
inline indicators.

**Usage:**

```mdx
import Icon from '@site/src/components/Icon';

| Feature | Supported |
|---------|-----------|
| Connection pooling | <Icon type="check" /> |
| SSL encryption | <Icon type="warning" /> |
| Legacy auth | <Icon type="cross" /> |
```

**Inline usage:**

```mdx
Connection pooling <Icon type="check" /> is available in all tiers.
```

**With custom tooltips:**

```mdx
<Icon type="check" title="Available in all tiers" />
<Icon type="cross" title="Deprecated in v4.0" />
```

**Icon types:**

- `type="check"` or `type="checkmark"` - Orange checkmark (light mode), green (dark mode)
- `type="cross"` or `type="x"` - Gray X symbol
- `type="warning"` or `type="!"` - Yellow ! symbol

The component automatically adapts to dark/light theme changes.

#### Formatting and variables

To make code blocks easier to work with, consider adding variables and use
[here docs](https://en.wikipedia.org/wiki/Here_document) to make it easier to
copy and paste code snippets.

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
> here docs support is available in most shells, including bash, zsh, and fish,
> however in shells other than bash, the syntax may vary.

#### Highlight lines of code

Use
[inline comments](https://docusaurus.io/docs/markdown-features/code-blocks#highlighting-with-comments)
in the code to highlight lines.

### Links and imports

Link to another page in the same docs section with a relative path to the
source file, including the `.mdx` suffix. The suffix is what tells Docusaurus
to rewrite the link at build time. Without it, the raw string survives into the
compiled bundle and the browser resolves it against the current page URL when
clicked, which produces a different path. The server-rendered HTML still looks
correct, so this kind of break is invisible to `curl`, `git grep`, and static
inspection. It only shows up on click.

- Correct: `[Projects](../understand/what-are-projects.mdx)`
- Correct, for a directory target: `[Networking](../networking/README.mdx)`
- Broken: `[Projects](../understand/what-are-projects)`
- Broken: `[Networking](../networking/)`

Relative paths also work on GitHub, survive slug changes, and track file moves,
so prefer them over `/docs/` URL paths inside a section.

Link across sections, such as from Platform to vCluster, with a `/docs/`
absolute path. The two sections are separate Docusaurus plugin instances, so
relative file paths don't resolve between them.

- `[vCluster docs](/docs/vcluster)`
- `[Sleep mode](/docs/vcluster/configure/vcluster-yaml/sleep-mode)`

#### Links inside partials and fragments

Calculate the path from the partial or fragment file itself, not from a page
that imports it. Reusable content gets imported from pages at different depths,
so a path that works from one importer breaks from another.

Markdown link syntax isn't parsed inside a JSX expression. When reusable
content needs to link from within JSX, use the `VersionAwareDocLink` component
so the link keeps the reader's docs version.

```jsx
import VersionAwareDocLink from '@site/src/components/VersionAwareDocLink';

<VersionAwareDocLink product="vcluster" to="/security">security baseline</VersionAwareDocLink>
```

A cross-product link targets the other product's stable docs, because Platform
and vCluster version independently.

#### Import paths

Choose the import path based on what you're importing and whether that content
should freeze with a docs version.

| Importing | Use | Why |
| --- | --- | --- |
| React or theme components | `@site/src/` or `@theme/` | Not version-specific |
| Same-product partials and fragments | a relative path | Versioning copies the docs tree, so each snapshot stays self-contained |
| Intentionally global content | `@site/docs/_partials/` | Updates every docs version at once |
| Cross-product content | `@site/<other-product>/` | Tracks the other product's current content, which is the only option because the version lines don't match up |

A same-product `@site/` import keeps resolving to the live tree even from a
versioned page, so an archived page ends up showing current content. CI rejects
those.

#### Checking links before you push

A production build catches links that point at nothing. It doesn't catch a link
that resolves at build time but breaks on click, so run the link checks too.

```bash
npm run build                      # links to missing pages
npm run validate-mdx-links         # click-time breaks in live docs
npm run validate-reusable-imports  # same-product live imports
```

### vCluster terms

vCluster Labs is the company. Do not use "Loft", "LoftLabs", or "Loft Platform" to refer to
vCluster products.

"vCluster" is a trademark. There are strict legal frameworks around how to use a
trademark, for example, it cannot be used in plural. **Do not use "vClusters"**.

Never use vCluster or vClusters when talking about a cluster that vCluster
creates. Use **clusters**. Both "virtual cluster" and "tenant cluster" are
retired: the Tenant primitive claims the word "tenant" for the customer
organization, so the cluster gives it back.

### The hierarchy

1. A **system admin** installs Platform onto a Kubernetes cluster, which becomes
   the **control plane cluster**.
2. A **platform admin** creates **Tenants**.
3. A **tenant admin** divides the Tenant boundary across **Projects**.
4. A **project user** creates a **cluster**.

A **Tenant** is a customer organization, never a cluster. Capitalize it only
when naming the API resource, the same way "Project" is.

**Tenant isolation** is the term for separation at every layer, from the Tenant
boundary in the management plane down to dedicated nodes. Don't coin "cluster
isolation", and don't convert existing "tenant isolation" prose. When a sentence
needs to say *how* separation happens, name the mechanism: private nodes, vNode,
API-level and namespace separation.

"Multi-Tenancy" stays only as the name of the licensed feature, on the Platform
License page and in `loft-sh/plans`. As a descriptor, "multi-tenancy" and
"multitenancy" are retired. Describe what the product does instead.

### Products

- vCluster: open source project that provisions and manages clusters
- vCluster Platform: the management platform and UI for managing clusters and
  Tenants across one or more control plane clusters
- vMetal: infrastructure orchestrator for bare-metal and VM provisioning beneath
  clusters
- vNode: tenant-isolation container runtime

"vCluster Pro" is not a product and should not be used. License-gated
features are "Enterprise" features, unlocked via a vCluster Platform
Enterprise plan (Dev/Prod/Scale), not a separate "Pro" product or tier. The
`vcluster-pro` container image, the `loft-sh/vcluster-pro` repository name,
and the `sidebar_class_name: pro` frontmatter value are code/engineering
identifiers and are unaffected by this rule — that sidebar class renders as
an "ENTERPRISE" badge.

### CLI

The command line interface name is `vcluster`.

### Abbreviations for Kubernetes distros

- [Lightweight Kubernetes](https://k3s.io/): K3s
- [Kubernetes](https://kubernetes.io/): K8s
- [Zero Friction Kubernetes](https://k0sproject.io/): k0s Note that k0s is the
  only Kubernetes distro to use a lower case 'k'
- [AWS Elastic Kubernetes Service](https://aws.amazon.com/eks/): EKS

### Other product terms

- AWS [EKS](https://aws.amazon.com/eks/)
- [CoreDNS](https://coredns.io/)
- [etcd](https://etcd.io/)

### Positioning shared nodes

Shared nodes are a supported tenancy boundary for trusted tenants, not a security boundary for untrusted tenants with Kubernetes access or arbitrary workload execution. Frame the boundary by trust and tenant access, not by internal versus external.

- Recommend shared nodes for trusted tenants such as development, testing, CI/CD, and internal engineering teams.
- Route external, resale, regulated, or otherwise untrusted tenant offerings to private nodes, optionally with vNode for runtime isolation.
- Don't soften this to "strongly not recommended". Shared-node mitigations such as NetworkPolicy don't replace data-plane isolation for untrusted tenants.
- Recommend NetworkPolicy as an added isolation layer for all tenants, including trusted ones. vCluster can create it through `policies.networkPolicy`, and the CNI enforces it.
- Frame the risk as an architectural property (shared kernel and nodes) plus a configuration responsibility, not as a vCluster defect. Don't reference specific customers or security incidents.
- Reuse the `vcluster/_partials/admonitions/shared-nodes-suitability.mdx` partial rather than rewriting the caveat.

There is one exception. A provider serving its own trusted models behind an API (no tenant Kubernetes access) is application-level multitenancy and can serve external customers. See the inference provider production guide.

See the shared nodes positioning section in `CLAUDE.md` for the full guidance.

## Style guide automation {#style-guide-automation}

To maintain quality and consistency in our technical documentation, we use
[vale](https://vale.sh/) as a linter to automatically enforce style guidelines.

> [!NOTE]
> The Lint check runs Vale on pull requests into `main` that change `.md` or
> `.mdx` files under `platform/`, `vcluster/`, and the versioned docs folders.
> It posts its findings as review comments on your PR. Only Vale errors on lines
> your PR adds fail the check. Warnings appear as comments but don't block the
> merge. Root `docs/` pages and the generated CLI pages aren't checked.
>
> Fix what Vale flags in the prose. Don't change file paths, commands, or
> config keys to satisfy it.

### What is Vale?

[Vale](https://vale.sh/) is an open-source, command-line linter that helps you
enforce style and grammar rules in written documentation. It’s highly
configurable, allowing you to define custom rules that suit your project’s
needs. By integrating it into our CI pipeline, contributors can receive
real-time feedback on their documentation during pull requests.

### Running Vale locally

Vale offers multiple installation methods suitable for different operating
systems:

- **macOS**: `brew install vale`
- **Windows**: `choco install vale`
- **Linux**: `brew install vale` or use another
  [package manager](https://repology.org/project/vale/versions)
- **Docker**: `docker pull jdkato/vale`

Individual files or folders can be linted

- To check all files (this may take some time): `vale .`
- To check a specific file: `vale path/to/file.mdx`
- To check a specific folder including subfolders: `vale /path/to/folder`

Running `vale` locally allows us to check our documentation before submitting a
pull request. This helps catch style issues early and streamlines the review
process.

### Plugins

VSCode and Neovim have `vale` plugins that can be installed to lint files as you
write them.

- VS Code [Vale plugin](https://github.com/errata-ai/vale-vscode).
- Neovim setup:
  - Install [mason.nvim](https://github.com/williamboman/mason.nvim) and add
    vale_ls LSP. Configure and use like any other LSP.
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

Run `vale` from the repository root so it picks up the repository's
`.vale.ini`. CI uses Vale 3.13.0, so a newer local version can report slightly
differently.

> [!NOTE]
> The repository's `.vale.ini` sets `MinAlertLevel = warning`, so Vale hides
> suggestions. To see them too, run `vale --minAlertLevel=suggestion <file>`.

### Adding terms to the vocabulary

If Vale flags a legitimate product or technical term, add it to
`.github/styles/config/vocabularies/Loft/accept.txt` in the same PR. Each line
is a regular expression. Terms that Vale should always flag go in
`reject.txt` in the same folder. Don't add a word only to silence one finding.

### Controlling Vale rules

Use HTML comments to turn Vale off around a block, in both `.md` and `.mdx`
files. The repository's `.vale.ini` treats `.mdx` files as Markdown, so JSX
comments such as `{/* vale off */}` don't suppress Vale.

```text
<!-- vale off -->
This content won't be checked by Vale.
<!-- vale on -->
```

### Suppressing the release drift check

On every vCluster release, `hack/cli-drift` and `hack/config-drift` compare
prose code blocks against the regenerated CLI reference and `vcluster.yaml`
schema partials, and drift findings open an automated fix PR.

Some pages show outdated config or removed commands on purpose: migration
guides, before/after comparisons, changelog examples. Opt such a block out by
placing a `drift-ignore` comment on the line directly above the opening fence:

````text
{/* drift-ignore */}
```yaml
# deliberately shows the pre-0.24 syntax
exportKubeConfig:
  secret:
    name: my-secret
```
````

In `.md` files use `<!-- drift-ignore -->` instead. The marker applies only to
the single fenced block below it. Both scanners honor it, for YAML blocks and
for CLI examples alike. Do not use it to silence a finding on current-state
docs; fix the drift instead.

`InterpolatedCodeBlock` components are scanned the same way as fences:
`[[VAR:...]]` placeholders are resolved to their defaults before validation,
and the marker on the line directly above the component tag opts it out. A
`yaml` block or component titled `vcluster.yaml` is always validated, even
when its top-level keys no longer match any current schema root (that is what
a block looks like after a release removes the field it documents).

<!-- vale on -->

## Adding prose to generated partials

The vCluster config partials under `vcluster/_partials/config/` are
overwritten on every release by `hack/vcluster/partials/main.go`. Editing
those files in place was the original workflow and the original failure
mode: the next regeneration silently dropped the edit. Two routes exist
now, both designed to survive regeneration.

### Use the Extras map when prose belongs with a schema field

If the prose is intrinsically tied to one schema path — a security
warning that only makes sense alongside `controlPlane.standalone.joinNode`,
a migration tip that belongs at the bottom of `controlPlane.distro` —
add a `pathExtras` entry in `hack/vcluster/partials/main.go`:

```go
var pathExtras = map[string]Extras{
    "controlPlane/standalone/joinNode": {
        Before: "\n:::warning Security consideration\n...\n:::\n\n",
    },
}
```

`Before` lands above the rendered schema content, `After` below. Links in
this prose follow the same rules as any other partial, so use a relative path
with the `.mdx` suffix, calculated from where the generated file lands. That
depth is the same for live and versioned output.
The map keys are validated against the live schema before any output
is written; a rename or removal upstream panics the generator with the
full list of dangling keys, so the prose can be migrated explicitly
instead of silently orphaned.

### Use a separate, non-generated partial when prose stands alone

If the prose is conceptual (an overview page, a how-to, a comparison)
and only happens to live near generated content, write it as a
hand-authored `.mdx` outside `vcluster/_partials/config/` and import it
where needed. The generator doesn't modify it. This is the right choice
when:

- The prose can be read on its own without a specific schema field next
  to it.
- The prose references multiple schema paths.
- The prose has its own headings, examples, and lifecycle (changes for
  reasons unrelated to schema bumps).

### Quick rule of thumb

- One schema path with one or two paragraphs of prose → `pathExtras`.
- Multi-paragraph prose, multiple references, own structure → separate
  partial, imported manually.
