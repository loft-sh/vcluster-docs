# Kubernetes Compatibility Matrix Skill

## Overview

Manages the Kubernetes compatibility matrix — a data-driven React component backed by `static/api/k8s-compatibility.json`. This skill handles adding/removing K8s versions, updating cell statuses based on conformance test results, and documenting known issues with footnotes.

## When to Use This Skill

Trigger this skill when:
- User says "add K8s version", "new kubernetes version", "update compatibility matrix"
- User says "prune", "remove EOL version" for the K8s matrix
- User provides conformance test results to update cell statuses
- User says "mark known issue" or provides a partial failure to document
- Linear issue references updating the K8s compatibility matrix

## Files

| File | Purpose |
|------|---------|
| `static/api/k8s-compatibility.json` | Source of truth for matrix data |
| `src/components/KubernetesCompatibilityMatrix/index.jsx` | React component |
| `src/components/KubernetesCompatibilityMatrix/styles.module.css` | Component styling |
| `scripts/generate-compatibility-matrix.js` | CLI: add/prune/validate |
| `.github/workflows/update-compatibility-matrix.yml` | CI validation on PR |
| `tests/specs/k8s-compatibility-matrix.spec.js` | Playwright/BrowserStack browser tests |
| `vcluster/deploy/upgrade/supported_versions.mdx` | Page that imports the component |

## Statuses

| Status | Emoji | When to use |
|--------|-------|-------------|
| `tested` | checkmark | Conformance tests passed |
| `compatible` | OK | Not tested, expected to work |
| `known-issue` | warning | Works with documented limitations |

## Workflow: Add New Kubernetes Version

1. Run the CLI tool:
   ```bash
   node scripts/generate-compatibility-matrix.js --add <version>
   ```
   This adds a row and column. Diagonal cell = `tested`, all others = `compatible`.

2. Adjust cells based on conformance test results. Change cell values in `static/api/k8s-compatibility.json`:
   - Pass → leave as `"compatible"` or change to `"tested"`
   - Fail → change to `{"status": "known-issue", "note": N}` (see known issues below)

3. Validate:
   ```bash
   node scripts/generate-compatibility-matrix.js
   ```

4. Build to verify rendering:
   ```bash
   npm run build
   ```

5. Commit, push, open PR.

## Workflow: Prune EOL Version

```bash
node scripts/generate-compatibility-matrix.js --prune <version>
```

Removes row, column, and all references. Validate and commit.

## Workflow: Document Known Issue

When a conformance test reveals a partial failure (specific API broken, not full incompatibility):

1. In `static/api/k8s-compatibility.json`, find the `notes` array. Add a new entry:
   ```json
   {
     "id": <next_integer>,
     "text": "Description of the limitation. See [relevant docs](/docs/vcluster/path/to/page) for details."
   }
   ```

2. Change affected cell(s) from a string to an object:
   ```json
   {"status": "known-issue", "note": <matching_id>}
   ```

3. Multiple cells can reference the same note ID.

4. Validate:
   ```bash
   node scripts/generate-compatibility-matrix.js
   ```

## JSON Schema

```
static/api/k8s-compatibility.json
├── lastUpdated: "YYYY-MM-DD" (auto-set by CLI on --add/--prune)
├── kubernetesVersions: ["1.35", "1.34", ...] (descending order)
├── matrix: [
│     { host: "1.35", vcluster: {
│         "1.35": "tested",
│         "1.34": "compatible",
│         "1.31": {"status": "known-issue", "note": 1}
│     }}
│   ]
├── notes: [{ id: 1, text: "description with link" }]
└── statuses: {
      tested: { emoji, label, description },
      compatible: { emoji, label, description },
      known-issue: { emoji, label, description }
    }
```

Cell values: either a status string or `{"status": "<name>", "note": <id>}`.

## Validation

The CLI validates:
- `kubernetesVersions` count matches `matrix` row count
- Every row has entries for all versions
- All status strings exist in `statuses` object
- All note references point to existing note IDs
- `statuses` has at least `tested` and `compatible`

CI runs this automatically on any PR that touches the JSON.

## Testing

Playwright tests in `tests/specs/k8s-compatibility-matrix.spec.js` verify:
- Table renders with correct structure (header rows, data rows, version labels)
- Legend displays all three statuses
- Known-issue cells have superscript footnote markers
- Footnote text appears below the table
- Table accessible on mobile viewport

Run locally:
```bash
cd tests && npm install
TEST_BASE_URL=http://localhost:3000 npx playwright test specs/k8s-compatibility-matrix.spec.js --project=local
```

Note: tests target `/docs/vcluster/next/` path. After a version is cut, update `MATRIX_PATH` in the test spec.

## Troubleshooting

**Validation fails**: Run `node scripts/generate-compatibility-matrix.js` locally to see exact errors. Common causes: missing cell entry, invalid status name, dangling note reference.

**Table shows stale data in dev server**: Clear caches and restart:
```bash
npx docusaurus clear && npm run start
```

**Known-issue footnotes don't render**: Verify cell is an object `{"status": "known-issue", "note": N}` not just the string `"known-issue"`. Check `notes` array has matching `id`.

**Wrong matrix shape after --add**: Versions sort numerically (1.9 < 1.10 < 1.35). Check `kubernetesVersions` ordering.

## Do Not

- Edit the component JSX unless the rendering logic needs to change
- Add statuses without updating both the `statuses` object and the component
- Mark cells as `tested` without evidence from conformance tests
- Modify versioned docs copies of the matrix page (they use the old HTML table)
