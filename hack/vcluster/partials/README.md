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
   schema (e.g., `integrations/istio` in v0.24), it is skipped with a warning
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
