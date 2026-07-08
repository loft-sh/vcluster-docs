---
name: vcluster-docs-writer
description: Write and edit vCluster Docusaurus documentation. Use this skill when working with .mdx or .md files in the vcluster-docs repository. Handles vale linting, partials discovery, link validation, versioned docs, and release processes.
context: fork
---

# vCluster Documentation Writer

Specialized knowledge and workflows for writing vCluster documentation in Docusaurus.

## Dependencies

When this skill is loaded, also invoke: `vcluster-brand:vcluster-brand`

## When to Use

Trigger when:
- Working in `/home/decoder/loft/vcluster-docs` repository
- User asks to write, edit, review, or fix documentation
- User mentions: vale, partials, doc links, versioned docs, releases
- User needs to discover partials, components, or code blocks
- User asks about vCluster terminology or style guidelines

## Quick Workflows

### Writing New Documentation

1. Review style guidelines in `references/style-guide.md`
2. Follow document template structure (Overview → How to use → Examples → Limitations)
3. Discover available resources:
   ```bash
   scripts/discover_partials.sh          # Find partials
   scripts/detect_language.sh <file>     # Get language identifier
   scripts/generate_import.sh <path>     # Generate import statement
   ```
4. Run vale for style checking:
   ```bash
   scripts/run_vale.sh <file-path>
   ```
5. Verify links before committing (see Link Validation below)

See `references/style-guide.md` for complete writing guidelines.

### Editing Existing Documentation

1. **Check if file is versioned** (`vcluster_versioned_docs/version-*/`)
   - ⚠️ **CRITICAL**: NEVER modify versioned docs unless explicitly requested
   - Only update files in main `vcluster/` folder for current docs
2. Run vale before and after edits:
   ```bash
   scripts/run_vale.sh <file-path>
   ```
3. Verify links if modified (see Link Validation below)

### Link Validation and Fixing

**Core principle**: Use relative file paths with `.mdx` extensions, NOT URL paths.

❌ **WRONG** (URL paths):
```markdown
[Pod Identity](/vcluster/integrations/pod-identity/eks-pod-identity)
```

✅ **CORRECT** (file paths with .mdx):
```markdown
[Pod Identity](../../../../third-party-integrations/pod-identity/eks-pod-identity.mdx)
```

**Debugging broken links efficiently:**
```bash
cd vcluster_versioned_docs/version-X.X.X/path/from/error/
grep -r "filename-from-error" . --include="*.mdx"
# Fix relative path in file that appears
```

See `references/link-formatting.md` for detailed examples and rules.

### Release Preparation

⚠️ **CRITICAL** before cutting new versioned docs release:

1. Check for problematic patterns:
   ```bash
   grep -r "/vcluster/integrations\|/vcluster/deploy/security" vcluster_versioned_docs/version-X.X.X/
   ```
2. Fix absolute URL paths → relative file paths (common files listed in reference)
3. Clear caches before building:
   ```bash
   rm -rf .docusaurus build node_modules/.cache
   ```
4. **NEVER run `npm run build`** - User runs when needed

See `references/release-checklist.md` for complete release workflow.

### Versioned Docs and lastVersion Routing

**Critical concept**: When `lastVersion` changes in `docusaurus.config.js`, URL routing changes.

```
lastVersion: "0.30.0"  →  /docs/vcluster/...  routes to 0.30.0 content
                          /docs/vcluster/0.29.0/...  routes to 0.29.0 content
```

**Key insight**: `/docs/vcluster/...` (no version) ALWAYS routes to `lastVersion` content.

**Why links break**:
1. Older versioned docs using unversioned paths resolve to new lastVersion
2. Cross-plugin links (vCluster→Platform or Platform→vCluster) resolve to each plugin's lastVersion
3. Path restructuring between versions causes 404s

**Version isolation principle**: Each version should link within itself:
```markdown
<!-- In 0.29.0 docs - CORRECT -->
[Link](../configure/something.mdx)  <!-- relative file path -->

<!-- In 0.29.0 docs - RISKY (resolves to lastVersion) -->
[Link](/docs/vcluster/configure/something)  <!-- unversioned URL -->
```

**Cross-plugin links (vCluster→Platform)**: Always resolve to Platform's lastVersion:
```markdown
<!-- These will break when Platform restructures paths -->
[Platform docs](/docs/platform/administer/monitoring/...)

<!-- After Platform 4.6.0, this became: -->
[Platform docs](/docs/platform/maintenance/monitoring/...)
```

**Fixing broken links after version release**:
```bash
# Find unversioned platform links that need updating
grep -r "/docs/platform/administer/\|/platform/api/" vcluster vcluster_versioned_docs --include="*.mdx"

# Bulk fix with sed
find vcluster vcluster_versioned_docs -name "*.mdx" \
  -exec sed -i 's|/platform/old/path|/platform/new/path|g' {} \;
```

### Sidebar Navigation Conventions

Docusaurus sidebar categories can be made clickable (navigating to a page on click) in two ways. Both are banned — sidebar section labels must expand/collapse only.

**Anti-pattern 1: `link` field in `_category_.json`**

```json
// WRONG — do not add a link field
{
  "label": "Deploy",
  "position": 2,
  "link": {
    "type": "generated-index"
  }
}
```

Remove the `link` field entirely. The `label` and `position` fields are sufficient.

**Anti-pattern 2: `README.mdx` as a folder index (general docs)**

Docusaurus automatically converts a `README.mdx` file into the category's landing page and makes the section label clickable — even without a `link` in `_category_.json`. Do not create `README.mdx` files as folder indices in general docs sections.

Instead, use `overview.mdx` with an explicit `slug:` that matches the directory URL:

```mdx
---
title: Networking
sidebar_label: Overview
sidebar_position: 0
slug: /configure/vcluster-yaml/networking
---
```

When converting an existing `README.mdx` to `overview.mdx`:

1. Add `slug:` matching the directory's URL (plugin-relative, no `/vcluster/` prefix).
2. Set `sidebar_label: Overview` — not the section name, to avoid duplication.
3. Migrate `sidebar_position` and `sidebar_class_name` out of the MDX frontmatter and into `_category_.json` as `position` and `className` respectively. The `_category_.json` controls the section label in the sidebar; the `overview.mdx` frontmatter controls only the child item.
4. Update any relative links inside the file that previously resolved from a directory URL — they now resolve from the slug URL.

**`_category_.json` structure for a folder that has an `overview.mdx`:**

```json
{
  "label": "Networking",
  "position": 3,
  "className": "host-nodes private-nodes"
}
```

Do not add a `link` field.

**Exception: `vcluster/configure/vcluster-yaml/` uses `README.mdx`**

The `vcluster-yaml` section mirrors the structure of the `vcluster.yaml` config file — every folder is a yaml key. Labeling these pages "Overview" is semantically wrong because there is no `overview` key in the yaml. In this section only, use `README.mdx` (not `overview.mdx`) as the folder index. Docusaurus treats it as the category header click target; it does not appear as a named sidebar item. Do NOT set `sidebar_label: Overview` or `sidebar_position: 0` on these files — they are irrelevant once the file becomes the category index.

### PR Preview URLs

Preview links MUST point to actual changed pages, NOT the docs root.

Base: `https://deploy-preview-{PR}--vcluster-docs-site.netlify.app/docs`

Derive the path from the file location — version goes after product name:
- `docs/platform/install/x.mdx` → `/docs/platform/next/install/x`
- `docs/vcluster/deploy/x.mdx` → `/docs/vcluster/next/deploy/x`
- `versioned_docs/version-0.31/vcluster/deploy/x.mdx` → `/docs/vcluster/0.31/deploy/x`
- `versioned_docs/version-0.28/platform/api/x.mdx` → `/docs/platform/0.28/api/x`

The version marked as `lastVersion` in `docusaurus.config.ts` has NO version segment in the URL. For example, if platform `lastVersion` is `4.6.0`, then `versioned_docs/version-4.6.0/platform/install/x.mdx` → `/docs/platform/install/x`.

List a preview link for EVERY modified document in the PR body's Preview section.

### Backporting Assessment

New work typically lands in `docs/` (the `next` version). Before completing a PR, assess whether changes should also apply to released versions in `versioned_docs/`:

- **Backport**: Factual errors, broken links, typos — apply to relevant prior versions
- **Don't backport**: New feature documentation — only applies to `next`
- **When unclear**: Note in the PR description that backporting should be reviewed

When backporting: make the same changes in relevant `versioned_docs/version-X.XX/` folders and include preview links for those versions too.

### Integration Tests (BrowserStack)

Cross-browser tests for documentation rendering (mermaid diagrams, etc.).

**Location**: `tests/` directory

**Structure**:
```
tests/
├── specs/                    # Test files go here
│   └── mermaid-rendering.spec.js
├── browserstack.yml          # BrowserStack SDK config
├── playwright.config.js      # Playwright config
└── package.json
```

**Creating new tests**:
1. Create spec file in `tests/specs/` with `.spec.js` extension
2. Use Playwright Test format:
   ```javascript
   const { test, expect } = require('@playwright/test');

   test.describe('Feature Name', () => {
     test('description', async ({ page }) => {
       await page.goto(process.env.TEST_URL || 'https://www.vcluster.com/docs/...');
       // assertions
     });
   });
   ```
3. Tests run on 7 browser configs (Safari/Chrome/Firefox on macOS/Windows)

**Running tests**:
```bash
cd tests
npm run test:local          # Local Safari only
npm run test:browserstack   # All browsers via BrowserStack (needs credentials)
```

**CI**: Tests run automatically on PRs via `.github/workflows/integration-tests.yml`

### Partials and Components

**Quick commands:**
```bash
scripts/discover_partials.sh              # List all partials
scripts/detect_language.sh file.yml       # Get language for code blocks
scripts/generate_import.sh <path> <dir>   # Generate import statement
```

**Import patterns:**
```jsx
// Code block with raw loader
import Code from '!!raw-loader!@site/docs/_code/example.yaml';
<CodeBlock language="yaml">{Code}</CodeBlock>

// Regular partial
import Partial from '@site/docs/_partials/example.mdx';
<Partial />
```

See `references/partials-guide.md` for complete patterns and troubleshooting.

## Concept and Explanation Pages

Explanation pages (architecture, overview, "what is X") should build the reader's mental model from the outside in. Each section should answer the question a reader would naturally ask next, given what they just learned.

**The progressive disclosure sequence:**

1. What it IS — plain-language definition before any technical framing
2. What it contains — structural components and their roles
3. How the parts connect — topology, agents, registrations
4. How you interact with it — entry points, access patterns
5. How work flows through it — lifecycle, reconciliation, request paths
6. Operational detail — network paths, failure behavior, edge cases

**Rules:**

- Do not introduce a term before the concept behind it is established. Glossary links help but do not substitute for a clear conceptual foundation.
- Add a plain-language "why this matters" sentence before technical component lists. Readers need to know what the list is for before they can absorb its items.
- Place diagrams immediately after the content they illustrate — not after examples that build on the pattern. A diagram should reinforce what was just described, not summarize what follows.
- Do not open explanation pages with defensive disclaimers ("X does not replace Y"). Put the relationship between products where it naturally belongs in the flow — usually at the handoff point between sections.
- Merge sections with confusingly similar names. Adjacent sections covering the same concept from slightly different angles (e.g. "Project lifecycle" and "Project resource lifecycle") signal a structural problem, not a content problem.
- Separate "what it is" sections from "how it works" sections. A section covering both structure and behavior is usually two sections collapsed into one.

**Check the flow by asking:** can a reader who skims only the section headings reconstruct the mental model? If the heading sequence reads like a component inventory rather than a conceptual arc, restructure.

### Never-Do
- ⚠️ **NEVER modify versioned docs** unless explicitly requested
- ⚠️ **NEVER run `npm run build`** (user runs when needed)
- ⚠️ **NEVER use URL paths for links** (use file paths with `.mdx`)
- ⚠️ **NEVER place admonitions inside JSX components** like `<Step>`
- ⚠️ **NEVER add a `link` field to `_category_.json`** — sidebar section labels must expand/collapse only, not navigate
- ⚠️ **NEVER create `README.mdx` as a folder index** in general docs sections — use `overview.mdx` with an explicit `slug:` instead. **Exception**: `vcluster/configure/vcluster-yaml/` uses `README.mdx` because every folder is a yaml key and "Overview" is semantically wrong there (see Sidebar Navigation Conventions)

### Always-Do
- ✅ **Always run vale** before finalizing documentation
- ✅ **Always use file paths with `.mdx` extension** for links
- ✅ **Always check vCluster terminology** in `references/vcluster-terms.md`
- ✅ **Always use relative paths** for versioned content
- ✅ **Always add descriptive comments** in YAML code blocks

## vCluster Terminology Quick Reference

Key terms (see `references/vcluster-terms.md` for complete guide):
- **vCluster**: The trademark (never "vClusters" - legally incorrect)
- **tenant clusters**: The clusters that vCluster creates ("virtual clusters" is retired); lowercase in prose
- **control plane cluster**: The cluster that hosts tenant cluster control planes ("host cluster" is retired); lowercase in prose
- **vCluster Pro**: Enhanced/paid tenant cluster with Pro functionality
- **vCluster Platform**: Management platform and UI for tenant clusters
- **vcluster**: The CLI command name

## Resources

### scripts/
- `discover_partials.sh` - Find all _partials, _fragments, _code directories
- `detect_language.sh` - Map file extension to language identifier
- `run_vale.sh` - Run vale linter with proper configuration
- `generate_import.sh` - Generate correct import statement

### references/
- `style-guide.md` - Complete writing style guide from CONTRIBUTING.md
- `release-checklist.md` - Critical rules for documentation releases
- `link-formatting.md` - Link formatting rules with examples
- `partials-guide.md` - Complete partials and components guide
- `mdx-components.md` - MDX/JSX component usage and admonition rules
- `vcluster-terms.md` - vCluster product terminology and naming
