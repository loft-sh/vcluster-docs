# vCluster Documentation Glossary System

This document explains the glossary system implemented for vCluster documentation.

## What It Does

The glossary system provides:
- A centralized YAML file for all terminology definitions
- A React component to display tooltips with copy functionality for technical terms
- Visual error indicators for missing terms in development
- Automated validation in CI/CD to prevent missing term references
- A dedicated glossary page listing all available terms

## How It Works

### 1. Data Storage
- All terms are defined in `src/data/glossary.yaml`
- Each term has a display name, definition, and optional related terms

### 2. Displaying Terms
- The `<GlossaryTerm>` component renders terms with a dotted underline 
- Hovering over a term displays its definition in a tooltip
- Tooltips include a "Copy" button and links to related terms
- The tooltip remains visible when the user moves from the term to the tooltip

### 3. Error Detection
- In development mode, references to non-existent terms show with a red dotted underline
- The CI workflow automatically detects missing term references
- A validation script can be run locally with `npm run validate-glossary`

## How to Use

### Adding a Term to Content

```jsx
<GlossaryTerm term="vcluster">vCluster</GlossaryTerm> is a tool for creating 
virtualized Kubernetes clusters.
```

### Adding a New Term Definition

Edit `src/data/glossary.yaml` to add a new term:

```yaml
new-term-key:
  term: "Display Name"
  definition: "The definition of the term."
  related: ["optional-related-term1", "optional-related-term2"]
```

### Viewing All Terms
The glossary page at `/glossary` displays all available terms alphabetically.

### Best Practices

1. **First Occurrence**: Use the component for the first occurrence of a term on a page
2. **Important Concepts**: Use it for important or potentially confusing terms
3. **Consistency**: Ensure related terms are linked properly
4. **Validation**: Run the validation script before committing changes

## Glossary Validation

The validation system checks that all referenced terms exist in the glossary:

- Run locally with `npm run validate-glossary`
- Automatically runs on PRs affecting documentation
- Fails if any terms are referenced but not defined

## Implementation Details

The system consists of:
- `src/data/glossary.yaml` - The glossary data
- `src/components/GlossaryTerm` - The React component with copy functionality
- `scripts/validate-glossary-terms.js` - The validation script
- `.github/workflows/validate-glossary.yml` - The CI integration
- `docs/glossary.mdx` - The glossary page

## Contributing

When adding new documentation:
1. Use the `<GlossaryTerm>` component for important technical terms
2. Add any new terms to the glossary data file
3. Run the validation script to ensure all terms are defined
4. Submit your PR for review