---
title: "vcluster platform access-key --help"
sidebar_label: vcluster platform access-key
---


Prints the access token to a vCluster platform instance

## Synopsis

```
vcluster platform access-key [flags]
```

```
########################################################
############# vcluster platform token ##################
########################################################

Prints an access token to a vCluster platform instance. This
can be used as an ExecAuthenticator for kubernetes

Example:
vcluster platform token
########################################################
```


## Flags

```
      --direct-cluster-endpoint   When enabled prints a direct cluster endpoint token
  -h, --help                      help for access-key
      --project string            The project containing the virtual cluster
      --virtual-cluster string    The virtual cluster
```


## Global & Inherited Flags

```
      --config string       The vcluster CLI config to use (will be created if it does not exist) (default "/home/runner/.vcluster/config.json")
      --context string      The kubernetes config context to use
      --debug               Prints the stack trace if an error occurs
      --log-output string   The log format to use. Can be either plain, raw or json (default "plain")
  -n, --namespace string    The kubernetes namespace to use
  -s, --silent              Run in silent mode and prevents any vcluster log output except panics & fatals
```

