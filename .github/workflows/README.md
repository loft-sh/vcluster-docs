# Workflows

This directory contains GitHub Actions workflows for the vCluster documentation.

## Test release scripts and the Platform generator

`test-release-scripts.yml` runs the release-script bats suites, shellcheck,
and `go test ./hack/platform/...`. It also runs the receiver's Platform
generator against the committed vendor tree, writing docs to a temporary
folder. Changes to Go dependencies, vendored code, Platform generator code,
release scripts, or either workflow trigger these checks.

This catches incompatible dependency updates before a release dispatch.
For example, `external-types` v0.1.0-alpha.4 removed Argo types still used by
`loft-sh/api`. PR #2726 introduced that failure; PR #2745 restored the
compatible dependency. The shell tests mock Go and cannot catch such errors.

Run the same generator checks from the repository root with the Go version
in `go.mod`:

```bash
export GOFLAGS=-mod=vendor
go test ./hack/platform/...
export EVENT_TYPE=platform-released
export TARGET_FOLDER="$(mktemp -d)/platform-generator"
bash hack/release/run-generator.sh
```

When diagnosing `handle-source-release`, check the dispatch version, the
classifier's `skip` output, and the bump step's `pinned at` notices. Platform
dispatches change the API pins before generation, so the committed pins may
differ from the failed build. A green run that skips an alpha or stale release
does not test the generator. The PR check covers the committed dependencies;
the receiver still validates newly released API versions after bumping them.

## Sync next branch (`sync-next-branch.yml`)
Keeps `next` branch in sync with `main` by auto-merging or creating PRs when conflicts exist. Runs on push to main, daily, or manually. Never syncs in reverse (next → main is manual only).

## Validate glossary terms

The `validate-glossary.yml` workflow checks that all terms referenced in `<GlossaryTerm>` components throughout the documentation exist in the glossary data file.

### When it runs:
- On all PRs to the main branch that change MDX files or the glossary data
- When manually triggered via the GitHub Actions UI

### What it checks:
- Scans all MDX files in the docs, vCluster, and platform directories
- Looks for `<GlossaryTerm term="...">` usage
- Validates that each referenced term exists in `src/data/glossary.yaml`
- Fails if any referenced terms are missing

### Fix failures:
If this workflow fails, you have two options:
1. Add the missing term to the glossary data file
2. Fix the typo in the term reference in your MDX file

### Run locally:
You can run the same check locally with:
```bash
npm run validate-glossary
```