---
title: "vcluster platform sleep vcluster --help"
sidebar_label: vcluster platform sleep vcluster
---


Put a virtual cluster to sleep

## Synopsis

```
vcluster platform sleep vcluster VCLUSTER_NAME [flags]
```

```
########################################################################
################### vcluster platform sleep vcluster ###################
########################################################################
Sleep will stop a virtual cluster and free all its used
computing resources.

Sleep will scale down the virtual cluster and delete
all workloads created through the virtual cluster. Upon resume,
all workloads will be recreated. Other resources such
as persistent volume claims, services etc. will not be affected.

Example:
vcluster platform sleep vcluster test --namespace test
########################################################################
```


## Flags

```
  -h, --help                                      help for vcluster
      --prevent-wakeup vcluster resume vcluster   The amount of seconds this vcluster should sleep until it can be woken up again (use 0 for infinite sleeping). During this time the space can only be woken up by vcluster resume vcluster, manually deleting the annotation on the namespace or through the loft UI (default -1)
      --project string                            The vCluster platform project to use
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

