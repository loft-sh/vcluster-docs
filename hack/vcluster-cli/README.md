# vCluster CLI documentation generator

Generates CLI documentation for vCluster commands.

## Usage

```bash
go run ./hack/vcluster-cli/main.go
```

Options:

- `-branch` - vCluster branch to use (default: current)
- `-vcluster-dir` - Path to local vCluster repo (default: ~/loft/vCluster)
- `-local` - Use local repo instead of cloning (default: true)
- `-output` - Output folder for generated CLI docs (default: `./vcluster/cli`)
- `-source-path` - Source checkout path; set by the release receiver workflow. Overrides `-vcluster-dir` and forces `-local`.
- `-target-folder` - Output folder; set by the release receiver workflow. Overrides `-output`. Passing this flag with an empty value exits non-zero (caller misconfiguration).

Output: `./vcluster/cli/`

For details, see the [vCluster CLI reference](/docs/vcluster/cli/vcluster).
