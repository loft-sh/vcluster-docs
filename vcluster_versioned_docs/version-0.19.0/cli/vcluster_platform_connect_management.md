---
title: "vcluster platform connect management --help"
sidebar_label: vcluster platform connect management
---


Creates a kube context to the vCluster platform Management API

## Synopsis

```
vcluster platform connect management [flags]
```

```
#########################################################
################ loft connect management ################
#########################################################

Creates a new kube context to the vCluster platform Management API.

Example:
vcluster platform connect management
########################################################
```


## Flags

```
  -h, --help    help for management
      --print   When enabled prints the context to stdout
```


## Global & Inherited Flags

```
      --config string       The vcluster CLI config to use (will be created if it does not exist) (default "/Users/ryanswanson/.vcluster/config.json")
      --context string      The kubernetes config context to use
      --debug               Prints the stack trace if an error occurs
      --log-output string   The log format to use. Can be either plain, raw or json (default "plain")
  -n, --namespace string    The kubernetes namespace to use
  -s, --silent              Run in silent mode and prevents any vcluster log output except panics & fatals
```

