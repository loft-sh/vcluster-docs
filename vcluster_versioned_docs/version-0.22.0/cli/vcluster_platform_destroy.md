---
title: "vcluster platform destroy --help"
sidebar_label: vcluster platform destroy
---


Destroy a vCluster Platform instance

## Synopsis

```
vcluster platform destroy [flags]
```

```
########################################################
############# vcluster platform destroy ##################
########################################################

Destroys a vCluster Platform instance in your Kubernetes cluster.

IMPORTANT: This action is done against the cluster the the kube-context is pointing to, and not the vCluster Platform instance that is logged in.
It does not require logging in to vCluster Platform.

Please make sure you meet the following requirements
before running this command:

1. Current kube-context has admin access to the cluster
2. Helm v3 must be installed


VirtualClusterInstances managed with driver helm will be deleted, but the underlying virtual cluster will not be uninstalled.

########################################################
```


## Flags

```
      --context string            The kube context to use for installation
      --delete-namespace          Whether to delete the namespace or not (default true)
      --force                     Try uninstalling even if the platform is not installed. '--namespace' is required if true
      --force-remove-finalizers   IMPORTANT! Removing finalizers may cause unintended behaviours like leaving resources behind, but will ensure the platform is uninstalled.
  -h, --help                      help for destroy
      --ignore-not-found          Exit successfully if platform installation is not found
      --namespace string          The namespace vCluster Platform is installed in
      --non-interactive           Will not prompt for confirmation
      --timeout-minutes int       How long to try deleting the platform before giving up. May increase when removing finalizers if --remove-finalizers is used (default 5)
```


## Global & Inherited Flags

```
      --config string       The vcluster CLI config to use (will be created if it does not exist) (default "~/.vcluster/config.json")
      --debug               Prints the stack trace if an error occurs
      --log-output string   The log format to use. Can be either plain, raw or json (default "plain")
  -s, --silent              Run in silent mode and prevents any vcluster log output except panics & fatals
```

