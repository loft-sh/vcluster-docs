---
title: "vcluster resume --help"
sidebar_label: vcluster resume
---


Resumes a virtual cluster

## Synopsis

```
vcluster resume VCLUSTER_NAME [flags]
```

```
#######################################################
################### vcluster resume ###################
#######################################################
Resume will start a vcluster after it was paused.
vcluster will recreate all the workloads after it has
started automatically.

Example:
vcluster resume test --namespace test
#######################################################
```


## Flags

```
      --driver string    The driver for the virtual cluster, can be either helm or platform.
  -h, --help             help for resume
      --project string   [PLATFORM] The vCluster platform project to use
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

