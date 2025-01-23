---
title: "vcluster platform sleep namespace --help"
sidebar_label: vcluster platform sleep namespace
---


Put a vCluster platform namespace to sleep

## Synopsis

```
vcluster platform sleep namespace NAMESPACE_NAME [flags]
```

```
########################################################
################# loft sleep namespace #################
########################################################

Sleep puts a vCluster platform namespace to sleep
Example:
vcluster platform sleep namespace myspace
vcluster platform sleep namespace myspace --project myproject
#######################################################
```


## Flags

```
      --cluster string                                      The cluster to use
  -h, --help                                                help for namespace
      --prevent-wakeup vcluster platform wakeup namespace   The amount of seconds this namespace should sleep until it can be woken up again (use 0 for infinite sleeping). During this time the namespace can only be woken up by vcluster platform wakeup namespace, manually deleting the annotation on the namespace or through the loft UI (default -1)
  -p, --project string                                      The project to use
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

