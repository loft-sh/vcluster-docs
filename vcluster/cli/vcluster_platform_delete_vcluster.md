---
title: "vcluster platform delete vcluster --help"
sidebar_label: vcluster platform delete vcluster
---


Deletes a virtual cluster

## Synopsis

```
vcluster platform delete vcluster VCLUSTER_NAME [flags]
```

```
#########################################################################
################### vcluster platform delete vcluster ###################
#########################################################################
Deletes a virtual cluster

Example:
vcluster platform delete vcluster --namespace test
#########################################################################
```


## Flags

```
      --delete-context   If the corresponding kube context should be deleted if there is any (default true)
  -h, --help             help for vcluster
      --project string   The vCluster platform project to use
      --wait             If enabled, vcluster will wait until the vcluster is deleted (default true)
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

