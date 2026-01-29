---
title: "vcluster token create --help"
sidebar_label: vcluster token create
---


Create a new node bootstrap token for a vCluster with private nodes enabled.

## Synopsis

```
vcluster token create [flags]
```

```
########################################################
################# vcluster token create #################
########################################################
Create a new node bootstrap token for a vCluster with private nodes enabled.
#######################################################
```


## Flags

```
      --control-plane    If set the created token will be used to join the control plane node. Mutually exclusive with --kubeadm
      --expires string   The duration the token will be valid for. Format: 1h, 1d, 1w, 1m, 1y. If empty, the token will never expire. (default "1h")
  -h, --help             help for create
      --kubeadm          If enabled shows the raw kubeadm join command.
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

