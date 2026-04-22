---
title: "vcluster platform add standalone --help"
sidebar_label: vcluster platform add standalone
---


Adds an existing vCluster Standalone cluster to the vCluster platform

## Synopsis

```
vcluster platform add standalone [flags]
```

```
################################################
####### vcluster platform add standalone #######
################################################
Adds a vCluster Standalone cluster to the vCluster platform.

Example:
vcluster platform add standalone my-cluster --project my-project --access-key my-access-key --host https://my-vcluster-platform.com

################################################
```


## Flags

```
      --access-key string   The access key for the vCluster to connect to the platform. If empty, the CLI will generate one
  -h, --help                help for standalone
      --host string         The host where to reach the platform
      --insecure            If the platform host is insecure
      --project string      The project to import the vCluster into
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

