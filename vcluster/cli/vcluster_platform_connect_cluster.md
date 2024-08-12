---
title: "vcluster platform connect cluster --help"
sidebar_label: vcluster platform connect cluster
---


Creates a kube context for the given cluster

## Synopsis

```
vcluster platform connect cluster [flags]
```

```
########################################################
################# loft connect cluster #################
########################################################

Creates a new kube context for the given cluster, if
it does not yet exist.

Example:
vcluster platform connect cluster mycluster
########################################################
```


## Flags

```
  -h, --help    help for cluster
      --print   When enabled prints the context to stdout
```


## Global & Inherited Flags

```
      --config string       The vcluster CLI config to use (will be created if it does not exist) (default "/home/runner/.vcluster/config.json")
      --context string      The kubernetes config context to use
      --debug               Prints the stack trace if an error occurs
      --log-output string   The log format to use. Can be either plain, raw or json (default "plain")
  -n, --namespace string    The kubernetes namespace to use
  -s, --silent              Run in silent mode and prevents any vcluster log output except panics & fatals
```

