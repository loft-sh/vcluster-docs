---
title: "vcluster describe --help"
sidebar_label: vcluster describe
---


Describes a virtual cluster

## Synopsis

```
vcluster describe [flags]
```

```
#######################################################
################## vcluster describe ##################
#######################################################
describes a virtual cluster

Example:
vcluster describe test
vcluster describe -o json test
#######################################################
```


## Flags

```
      --driver string    The driver to use for managing the virtual cluster, can be either helm or platform.
  -h, --help             help for describe
  -o, --output string    The format to use to display the information, can either be json or yaml
  -p, --project string   The project to use
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

