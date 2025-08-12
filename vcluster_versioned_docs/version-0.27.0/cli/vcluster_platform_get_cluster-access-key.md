---
title: "vcluster platform get cluster-access-key --help"
sidebar_label: vcluster platform get cluster-access-key
---


Retrieve the network peer cluster access key

## Synopsis

```
vcluster platform get cluster-access-key CLUSTER_NAME [flags]
```

```
#########################################################
############## loft get cluster-access-key ##############
#########################################################

Returns the Network Peer Cluster Token

Example:
vcluster platform get cluster-access-key [CLUSTER_NAME]
########################################################
```


## Flags

```
  -h, --help            help for cluster-access-key
  -o, --output string   Output format. One of: (json, yaml, text) (default "text")
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

