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

Output: `./vcluster/cli/`

For details, see the [vCluster CLI reference](/docs/vcluster/cli/vcluster).
