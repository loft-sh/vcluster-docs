---
title: "vcluster node upgrade --help"
sidebar_label: vcluster node upgrade
---

## vcluster node upgrade

Upgrade the node

```
vcluster node upgrade [flags]
```

### Options

```
      --binaries-path string       The path to the kubeadm binaries (default "/usr/local/bin")
      --bundle-repository string   The repository to use for downloading the Kubernetes bundle (default "https://github.com/loft-sh/kubernetes/releases/download")
      --cni-binaries-path string   The path to the CNI binaries (default "/opt/cni/bin")
  -h, --help                       help for upgrade
      --image string               The image to use for the upgrade
      --image-pull-policy string   The image pull policy (default "IfNotPresent")
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