---
title: "vcluster platform share vcluster --help"
sidebar_label: vcluster platform share vcluster
---


Shares a virtual cluster with another vCluster platform user or team

## Synopsis

```
vcluster platform share vcluster VCLUSTER_NAME [flags]
```

```
##########################################################################
#################### vcluster platform share vcluster ####################
##########################################################################
Shares a virtual cluster with another vCluster platform user or team

Example:
vcluster platform share vcluster myvcluster
vcluster platform share vcluster myvcluster --project myproject
vcluster platform share vcluster myvcluster --project myproject --user admin
##########################################################################
```


## Flags

```
      --cluster string        The cluster to use
      --cluster-role string   The cluster role which is assigned to the user or team for that space (default "loft-cluster-space-admin")
  -h, --help                  help for vcluster
      --project string        The project to use
      --team string           The team to share the space with. The team needs to have access to the cluster
      --user string           The user to share the space with. The user needs to have access to the cluster
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

