# Workflows

This directory contains GitHub Actions workflows for the vCluster documentation.

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