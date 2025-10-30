---
title: "vcluster node delete --help"
sidebar_label: vcluster node delete
---


Delete a node from the vcluster

## Synopsis

```
vcluster node delete [flags]
```

```
#######################################################
################### vcluster delete ####################
#######################################################
```


## Flags

```
      --drain   Drain the node before deleting it (default true)
  -h, --help    help for delete
```


## Global and inherited flags

```
      --config string       The vcluster CLI config to use (will be created if it does not exist) (default "~/.vcluster/config.json")
      --context string      The kubernetes config context to use
      --debug               Prints the stack trace if an error occurs
      --log-output string   The log format to use. Can be either plain, raw or json (default "plain")
  -n, --namespace string    The kubernetes namespace to use
  -s, --silent              Run in silent mode and prevents any vcluster log output except panics & fatals
```

