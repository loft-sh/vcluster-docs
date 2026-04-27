---
title: "vcluster use driver --help"
sidebar_label: vcluster use driver
---


Switch the virtual clusters driver between platform and helm

## Synopsis

```
vcluster use driver [flags]
```

```
########################################################
################# vcluster use driver #################
########################################################
Either use "helm" or "platform" as the deployment method for managing virtual clusters.
#######################################################
```


## Flags

```
  -h, --help   help for driver
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

