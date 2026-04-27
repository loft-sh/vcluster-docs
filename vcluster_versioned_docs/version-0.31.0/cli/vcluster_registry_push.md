---
title: "vcluster registry push --help"
sidebar_label: vcluster registry push
---

## vcluster registry push

Push a docker image, archive or helm chart into vCluster registry

```
vcluster registry push [flags]
```

### Options

```
      --architecture string            Architecture of the image. E.g. amd64, arm64, etc. Only valid if used together with an image argument. E.g. vcluster registry push nginx --architecture amd64. Use 'all' to push all architectures. (default "amd64")
      --archive strings                Path to the archive.tar file. Can also be a directory with .tar files. Needs to have the format registry_repository+tag.tar
      --helm-chart strings             Path to the helm chart. Can also be a directory with .tgz files.
      --helm-chart-repository string   Repository in the vCluster registry to push the helm chart to. E.g. charts will allow you to use the helm chart with oci://<vcluster-host>/charts/my-chart-name:version. (default "charts")
  -h, --help                           help for push
```

### Options inherited from parent commands

```
      --config string       The vcluster CLI config to use (will be created if it does not exist) (default "~/.vcluster/config.json")
      --context string      The kubernetes config context to use
      --debug               Prints the stack trace if an error occurs
      --log-output string   The log format to use. Can be either plain, raw or json (default "plain")
  -n, --namespace string    The kubernetes namespace to use
  -s, --silent              Run in silent mode and prevents any vcluster log output except panics & fatals
```

```

```


## Flags
## Global and inherited flags