---
title: "vcluster delete --help"
sidebar_label: vcluster delete
---


Deletes a virtual cluster

## Synopsis

```
vcluster delete VCLUSTER_NAME [flags]
```

```
#######################################################
################### vcluster delete ###################
#######################################################
Deletes a virtual cluster

Example:
vcluster delete test --namespace test
#######################################################
```


## Flags

```
      --auto-delete-namespace   If enabled, vCluster deletes the virtual cluster namespace if it was originally created by vclusterctl. If namespace syncing is enabled, it also deletes any additional namespaces that vCluster created. 
      --delete-configmap        If enabled, vCluster deletes the ConfigMap of the vCluster
      --delete-context          If the corresponding kube context should be deleted if there is any (default true)
      --delete-namespace        If enabled, vcluster deletes the namespace of the vcluster. In the case of namespace mode, will also delete all other namespaces created by vcluster
      --driver string           The driver to use for managing the virtual cluster, can be either helm or platform.
  -h, --help                    help for delete
      --ignore-not-found        If enabled, vcluster will not error out in case the target vcluster does not exist
      --keep-pvc                If enabled, vcluster will not delete the persistent volume claim of the vcluster
      --project string          [PLATFORM] The vCluster platform project to use
      --wait                    If enabled, vcluster will wait until the vcluster is deleted (default true)
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

