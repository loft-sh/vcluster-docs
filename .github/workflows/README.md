# GitHub Workflows

This directory contains GitHub Actions workflows for the vCluster documentation.

## Validate Glossary Terms

The `validate-glossary.yml` workflow checks that all terms referenced in `<GlossaryTerm>` components throughout the documentation exist in the glossary data file.

### When it runs:
- On all PRs to the main branch that change MDX files or the glossary data
- When manually triggered via the GitHub Actions UI

### What it checks:
- Scans all MDX files in the docs, vcluster, and platform directories
- Looks for `<GlossaryTerm term="...">` usage
- Validates that each referenced term exists in `src/data/glossary.yaml`
- Fails if any referenced terms are missing

### How to fix failures:
If this workflow fails, you have two options:
1. Add the missing term to the glossary data file
2. Fix the typo in the term reference in your MDX file

### Running locally:
You can run the same check locally with:
```bash
npm run validate-glossary
```