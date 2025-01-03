---
title: "vcluster platform list vclusters --help"
sidebar_label: vcluster platform list vclusters
---


Lists all virtual clusters that are connected to the current platform

## Synopsis

```
vcluster platform list vclusters [flags]
```

```
##########################################################################
#################### vcluster platform list vclusters ####################
##########################################################################
Lists all virtual clusters that are connected to the current platform

Example:
vcluster platform list vclusters
##########################################################################
```


## Flags

```
  -h, --help             help for vclusters
      --output string    Choose the format of the output. [table|json] (default "table")
  -p, --project string   The project to use
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

