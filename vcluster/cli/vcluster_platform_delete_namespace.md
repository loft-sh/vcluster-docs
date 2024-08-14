---
title: "vcluster platform delete namespace --help"
sidebar_label: vcluster platform delete namespace
---


Deletes a vCluster platform namespace from a cluster

## Synopsis

```
vcluster platform delete namespace NAMESPACE_NAME [flags]
```

```
#########################################################
################# loft delete namespace #################
#########################################################

Deletes a vCluster platform namespace from a cluster

Example:
vcluster platform delete namespace myspace
vcluster platform delete namespace myspace --project myproject
########################################################
```


## Flags

```
      --cluster string   The cluster to use
      --delete-context   If the corresponding kube context should be deleted if there is any (default true)
  -h, --help             help for namespace
  -p, --project string   The project to use
      --wait             Termination of this command waits for namespace to be deleted
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

