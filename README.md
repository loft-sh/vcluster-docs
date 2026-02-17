# vCluster development links

- vCluster [repo](https://github.com/loft-sh/vcluster)
- vCluster [open issues](https://github.com/loft-sh/vcluster/issues)
- vCluster [releases and release notes](https://github.com/loft-sh/vcluster/releases)

## vCluster resources

- [Website](https://www.vcluster.com)
- [Documentation](https://www.vcluster.com/docs/)
- [Blog](https://loft.sh/blog)
- [Twitter](https://twitter.com/loft_sh)
- [Slack](https://slack.loft.sh/)

## Contribute to the docs

Contributions from all users are encouraged.

### Develop locally

1. Run `npm install`

    This will initially install all necessary dependencies.

2. Run `npm run start`

    This will continuously watch changes, build a development version and serve it locally.

### Other ways to contribute

- [Create a docs issue](https://github.com/loft-sh/vcluster-docs/issues).
- Open a pull request.
  - [Use the GitHub web UI](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request?tool=webui)
    to update a single page.
  - To update several pages or add new pages:
    - Fork the repo.
    - Clone your fork.
    - Ceate a local working branch.
    - Commit your changes.
    - Push your changes.
    - Create a pull request.

     See the GitHub [Pull requests documentation](https://docs.github.com/en/pull-requests)
     for specific guides.

The docs site uses Docusaurus. See
[Contribute to the vCluster docs](./CONTRIBUTING.md) for how to build the site locally.

Content locations:

- vcluster: vCluster content
- platform: vCluster Platform content

### Generate new vCluster version

```bash
npm run docusaurus docs:version:vcluster 0.22.0
```

### Generate new Platform version

```bash
npm run docusaurus docs:version:platform 4.3.0
```

### Generate vCluster partials

```bash
go run hack/vcluster/partials/main.go
```

### Generate platform partials

```bash
go run hack/platform/partials/main.go
```

### Generate CLI documentation

```bash
go run hack/vcluster-cli/main.go
```

See the [CLI generator README](hack/vcluster-cli/README.md) for options.

### Wrap glossary terms

To automatically wrap glossary terms in MDX files with `<GlossaryTerm>` components:

```bash
# Wrap terms in a single file
npm run wrap-glossary vcluster/deploy/basics.mdx

# Wrap terms in all files in a directory (recursive)
npm run wrap-glossary vcluster/deploy/

# Or use the script directly
node scripts/wrap-glossary-terms.js platform/understand/
```

The script will:

- Only wrap terms that exist in `src/data/glossary.yaml`
- Only wrap the first occurrence of each term in a document
- Respect the glossary type setting (vcluster, platform, or both)
- Skip terms in front matter, code blocks, links, and HTML/JSX tags
- Preserve the original case of matched terms

## Platform UI Links E2E flow

This repo is the source of truth for permanent docs permalinks consumed by the UI.

Contract and generated outputs:

- Contract: `config/platform-ui-links.contract.json`
- Generated manifest: `static/platform-ui-links-manifest.json`
- Generated redirects block: `netlify.toml` (`/docs/platform-ui-link/...`)

### Docs-side workflow

1. Update contract entries in `config/platform-ui-links.contract.json`.
2. Regenerate artifacts:

```bash
npm run platform-ui-links:generate
```

3. Ensure generated files are up to date:

```bash
npm run platform-ui-links:check
```

4. Validate permalink liveness:

```bash
# default production base URL
npm run platform-ui-links:validate-targets

# explicit base URL
DOCS_BASE_URL=https://www.vcluster.com npm run platform-ui-links:validate-targets
```

5. Run full verification:

```bash
npm run platform-ui-links:verify
```

### UI-side workflow (consumer)

In `loft-enterprise/ui`, sync generated docs links from this docs repo:

```bash
DOCS_REPO_PATH=/Users/alexandrutirim/Documents/Work/vcluster-docs yarn docs-links:refresh
```

Equivalent split commands:

```bash
DOCS_REPO_PATH=/Users/alexandrutirim/Documents/Work/vcluster-docs yarn docs-links:sync
DOCS_REPO_PATH=/Users/alexandrutirim/Documents/Work/vcluster-docs yarn docs-links:verify
```

### CI behavior

- Docs CI fails if:
  - generated outputs are stale vs contract, or
  - contract permalinks are unreachable on preview/prod checks.
- UI CI fails if synced/generated docs-link artifacts are stale or usages break tests/types.

This is what catches both contract drift and moved-page breakages before merge.
