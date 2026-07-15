---
title: "vcluster registry pull --help"
sidebar_label: vcluster registry pull
---

## vcluster registry pull

Pull a docker image from a container registry and save it to a tarball that can be imported into the vCluster registry

```
vcluster registry pull [flags]
```

### Options

```
      --architecture string   Architecture of the image to pull. If not specified, the architecture will be detected automatically. Use 'all' to pull all architectures. (default "amd64")
      --destination string    Path to the destination directory. If not specified, the images will be pulled to the current directory.
  -h, --help                  help for pull
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