# vCluster partials generation

This tool generates MDX documentation partials from vCluster JSON schema files.

## Usage

```bash
go run hack/vcluster/partials/main.go <schema-dir> <output-dir>
```

### Arguments

- `<schema-dir>`: Directory containing `vcluster.schema.json` and `default_values.yaml`
- `<output-dir>`: Directory where MDX partials are generated

### Examples

Generate partials for a specific version:

```bash
# For vCluster 0.21
go run hack/vcluster/partials/main.go configsrc/v0.21/ vcluster_versioned_docs/version-0.21.0/_partials/config

# For current development version
go run hack/vcluster/partials/main.go configsrc/vcluster/main/ vcluster/_partials/config
```

## Version compatibility

The partials generation tool is designed to work across different
vCluster versions. When generating partials for older versions, the tool:

1. **Skips missing schema paths**: If a path exists in the code but not in the
   schema (for example, `integrations/istio` in v0.24), it is skipped with a warning
2. **Continues processing**: The generation does not fail due to missing paths
3. **Logs warnings**: Missing paths are logged to help identify version
   differences

### Example output

```text
Warning: Skipping path "integrations/istio": couldn't find schema path
  'integrations/istio' at 'istio'
Warning: Skipping path "logging": couldn't find schema path 'logging' at
  'logging'
```

## Add new paths

When adding new configuration paths to vCluster:

1. Add the path to the `paths` array in `hack/vcluster/partials/main.go`
2. The path is included in future versions
3. Older versions without this path skip it automatically

The legacy `sleepMode` path is handled conditionally: older input schemas that
still define it generate `sleepMode.mdx`, while current schemas use `sleep` and
do not print a permanent missing-path warning for the renamed field.

## Orphan detection

The generator only (re)writes files for entries in the `paths` array — it never
deletes anything under `--target-folder`. If a schema field gains a dedicated
partial, for example because a new prose page starts importing it, but the
corresponding entry is never added to `paths`, or a `paths` entry is removed
later, the on-disk file stops being regenerated and silently goes stale. The
"Skipping path" warning above does not catch this: it only fires for paths
that ARE listed but fail to resolve against the schema, not for paths that
were never listed at all (see DOC-1739).

To catch this, every run walks `--target-folder` after writing and panics if
it finds a `.mdx` file that wasn't (re)written this run:

```text
panic: 3 generated partial(s) exist under "vcluster/_partials/config" but were
not (re)written this run: [.../sleepMode.mdx ...]
Either add the corresponding schema path to `paths` in
hack/vcluster/partials/main.go, or delete the stale file if it's no longer
needed.
```

Treat this as a build-break: either add the missing `paths` entry, or delete
the stale file if the field is genuinely gone.

### Legacy orphans

`legacyOrphanTargets` in `main.go` grandfathers a small set of files that were
already stale before this check existed. The exemptions are scoped to the
specific `vcluster_versioned_docs/version-0.35.0` through `version-0.37.0`
output directories, which still carry a `sleepMode.mdx` and lowercase
`resourceclaims.mdx` / `resourceclaimtemplates.mdx` from before DOC-1739.
Repository policy requires versioned docs changes to go through the automatic,
label-driven backport process, so those directories can't be cleaned up in the
source change that introduces the check. A matching file in those targets
prints a warning instead of failing the build; the same relative file anywhere
else remains an error. Remove a target entry once its backport PR deletes or
renames all three files.

## CI integration

The partials generation is triggered by the `sync-config-schema.yaml` workflow
in the vCluster repository when:

- A new release is published
- Manual workflow dispatch is triggered

The CI workflow:

1. Generates schema files from the vCluster release
2. Runs this partials generation tool
3. Creates a PR with the updated documentation

## Troubleshoot common issues

### Panic: "Couldn't find schema path"

If you encounter this error with older code, update to the latest version that
includes error handling for missing paths.

### Check for missing partials

Check the warnings output to see which paths were skipped due to version
differences.
