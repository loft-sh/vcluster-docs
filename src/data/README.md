# Glossary System

This directory contains the glossary data used throughout the vCluster documentation.

## How It Works

The glossary system consists of:

1. A YAML data file (`glossary.yaml`) that contains all the term definitions
2. A React component (`GlossaryTerm`) for displaying terms with tooltips
3. A validation script to ensure all referenced terms exist

## Using the Glossary

To add a term definition to the documentation:

```jsx
<GlossaryTerm term="vcluster">vCluster</GlossaryTerm>
```

This will display "vCluster" with a dotted underline. When users hover over it, they'll see a tooltip with the definition from the glossary.

## Adding New Terms

To add a new term, edit the `glossary.yaml` file:

```yaml
your-term-key:
  term: "Display Name"
  definition: "The definition of the term."
  related: ["optional-related-term1", "optional-related-term2"]
```

## Validation

To validate that all terms referenced in the documentation exist in the glossary:

```bash
npm run validate-glossary
```

This will scan all MDX files for `<GlossaryTerm>` tags and ensure the terms exist in the glossary.yaml file.

## Development Feedback

In development mode, any references to non-existent terms will appear with a red dotted underline to help identify issues before they reach production.

## Guidelines

- Only use the component for the first occurrence of a term on a page or when it's important to emphasize
- Keep definitions concise and focused
- Use "related" terms to help users discover related concepts
- Maintain alphabetical ordering in the glossary.yaml file for easier maintenance