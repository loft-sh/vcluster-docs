---
title: "vcluster debug collect --help"
sidebar_label: vcluster debug collect
---


Collects debugging information from the vCluster

## Synopsis

```
vcluster debug collect [flags]
```

```
##############################################################
################### vcluster debug collect ###################
##############################################################
Collects debugging information from the vCluster

Examples:
vcluster debug collect
##############################################################
```


## Flags

```
      --count-virtual-cluster-objects   Collect how many objects are in the vCluster (default true)
  -h, --help                            help for collect
      --host-info                       Collect host cluster info (default true)
      --host-resources strings          Collect host resources in vCluster namespace
      --logs                            Collect vCluster logs (default true)
      --output-filename string          If specified, will write to the given filename
      --release                         Collect vCluster release info (default true)
      --virtual-info                    Collect virtual cluster info (default true)
      --virtual-resources strings       Collect virtual cluster resources
```


## Global & Inherited Flags

```
      --config string       The vcluster CLI config to use (will be created if it does not exist) (default "~/.vcluster/config.json")
      --context string      The kubernetes config context to use
      --debug               Prints the stack trace if an error occurs
      --log-output string   The log format to use. Can be either plain, raw or json (default "plain")
  -n, --namespace string    The kubernetes namespace to use
  -s, --silent              Run in silent mode and prevents any vcluster log output except panics & fatals
```

