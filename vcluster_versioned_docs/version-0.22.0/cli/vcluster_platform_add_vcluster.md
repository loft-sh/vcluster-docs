---
title: "vcluster platform add vcluster --help"
sidebar_label: vcluster platform add vcluster
---


Adds an existing vCluster to the vCluster platform

## Synopsis

```
vcluster platform add vcluster [flags]
```

```
###############################################
############# vcluster platform add vcluster ##############
###############################################
Adds a vCluster to the vCluster platform.

Example:
vcluster platform add vcluster my-vcluster --namespace vcluster-my-vcluster --project my-project --import-name my-vcluster

Add all vCluster instances in the host cluster:
vcluster platform add vcluster --project my-project --all

###############################################
```


## Flags

```
      --access-key string     The access key for the vCluster to connect to the platform. If empty, the CLI will generate one
      --all                   all will try to add Virtual Cluster found in all namespaces in the host cluster. If this flag is set, any provided vCluster name argument is ignored
      --ca-data bytesBase64   additional, base64 encoded certificate authority data that will be passed to the platform secret
  -h, --help                  help for vcluster
      --host string           The host where to reach the platform
      --import-name string    The name of the vCluster under projects. If unspecified, will use the vcluster name
      --insecure              If the platform host is insecure
      --project string        The project to import the vCluster into
      --restart               Restart the vCluster control-plane after creating the platform secret (default true)
```


## Global & Inherited Flags

```
      --config string       The vcluster CLI config to use (will be created if it does not exist) (default "~/.vcluster/config.json")
      --context string      The kubernetes config context to use
      --debug               Prints the stack trace if an error occurs
      --log-output string   The log format to use. Can be either plain, raw or json (default "plain")
  -n, --namespace string    The kubernetes namespace to use
  -s, --silent              Run in silent mode and prevents any vcluster log output except panics & fatals
```

