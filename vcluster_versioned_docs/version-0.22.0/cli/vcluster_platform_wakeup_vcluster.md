---
title: "vcluster platform wakeup vcluster --help"
sidebar_label: vcluster platform wakeup vcluster
---


Lists all virtual clusters that are connected to the current platform

## Synopsis

```
vcluster platform wakeup vcluster VCLUSTER_NAME [flags]
```

```
#########################################################################
################### vcluster platform wakeup vcluster ###################
#########################################################################
Wakeup will start a virtual cluster after it was put to sleep.
vCluster will recreate all the workloads after it has
started automatically.

Example:
vcluster platform wakeup vcluster test --namespace test
#########################################################################
```


## Flags

```
  -h, --help             help for vcluster
      --project string   The vCluster platform project to use
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

