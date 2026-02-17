---
name: vcluster-docs-writer
description: Write and edit vCluster Docusaurus documentation. Use this skill when working with .mdx or .md files in the vcluster-docs repository. Handles vale linting, partials discovery, link validation, versioned docs, and release processes.
context: fork
---

# vCluster Documentation Writer

Specialized knowledge and workflows for writing vCluster documentation in Docusaurus.

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

## Critical Rules

### Never-Do
- ⚠️ **NEVER modify versioned docs** unless explicitly requested
- ⚠️ **NEVER run `npm run build`** (user runs when needed)
- ⚠️ **NEVER use URL paths for links** (use file paths with `.mdx`)
- ⚠️ **NEVER place admonitions inside JSX components** like `<Step>`

### Always-Do
- ✅ **Always run vale** before finalizing documentation
- ✅ **Always use file paths with `.mdx` extension** for links
- ✅ **Always check vCluster terminology** in `references/vcluster-terms.md`
- ✅ **Always use relative paths** for versioned content
- ✅ **Always add descriptive comments** in YAML code blocks

## vCluster Terminology Quick Reference

Key terms (see `references/vcluster-terms.md` for complete guide):
- **vCluster**: The trademark (never "vClusters" - legally incorrect)
- **virtual clusters**: The clusters that vCluster creates
- **vCluster Pro**: Enhanced/paid virtual cluster with Pro functionality
- **vCluster Platform**: Management platform and UI
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
