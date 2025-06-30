---
title: "vcluster platform share namespace --help"
sidebar_label: vcluster platform share namespace
---


Shares a vCluster platform namespace with another platform user or team

## Synopsis

```
vcluster platform share namespace NAMESPACE_NAME [flags]
```

```
########################################################
################# loft share namespace #################
########################################################

Shares a vCluster platform namespace with another platform user or team. The user
or team need to have access to the cluster.
Example:
vcluster platform share namespace myspace
vcluster platform share namespace myspace --project myproject
vcluster platform share namespace myspace --project myproject --user admin
########################################################
```


## Flags

```
      --cluster string        The cluster to use
      --cluster-role string   The cluster role which is assigned to the user or team for that namespace (default "loft-cluster-namespace-admin")
  -h, --help                  help for namespace
  -p, --project string        The project to use
      --team string           The team to share the namespace with. The team needs to have access to the cluster
      --user string           The user to share the namespace with. The user needs to have access to the cluster
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

