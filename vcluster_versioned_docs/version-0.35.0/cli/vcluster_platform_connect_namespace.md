---
title: "vcluster platform connect namespace --help"
sidebar_label: vcluster platform connect namespace
---


Creates a kube context for the given vCluster platform namespace

## Synopsis

```
vcluster platform connect namespace SPACE_NAME [flags]
```

```
########################################################
################ loft connect namespace ################
########################################################

Creates a new kube context for the given vCluster platform namespace.

Example:
vcluster platform connect namespace
vcluster platform connect namespace myspace
vcluster platform connect namespace myspace --project myproject
########################################################
```


## Flags

```
      --cluster string                    The cluster to use
      --disable-direct-cluster-endpoint   When enabled does not use an available direct cluster endpoint to connect to the cluster
  -h, --help                              help for namespace
      --print                             When enabled prints the context to stdout
  -p, --project string                    The project to use
      --skip-wait                         If true, will not wait until the namespace is running
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

