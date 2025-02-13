---
title: "vcluster platform list projects --help"
sidebar_label: vcluster platform list projects
---


Lists the loft projects you have access to

## Synopsis

```
vcluster platform list projects [flags]
```

```
########################################################
################## loft list projects ##################
########################################################

List the vcluster platform projects you have access to

Example:
vcluster platform list projects
########################################################
```


## Flags

```
  -h, --help   help for projects
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

