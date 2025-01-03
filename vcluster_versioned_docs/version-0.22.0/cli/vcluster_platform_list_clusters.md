---
title: "vcluster platform list clusters --help"
sidebar_label: vcluster platform list clusters
---


Lists the loft clusters you have access to

## Synopsis

```
vcluster platform list clusters [flags]
```

```
########################################################
################## loft list clusters ##################
########################################################

List the vcluster platform clusters you have access to

Example:
vcluster platform list clusters
########################################################
```


## Flags

```
  -h, --help   help for clusters
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

