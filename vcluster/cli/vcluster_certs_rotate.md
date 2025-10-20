---
title: "vcluster certs rotate --help"
sidebar_label: vcluster certs rotate
---


Rotates control-plane client and server certs

## Synopsis

```
vcluster certs rotate VCLUSTER_NAME [flags]
```

<!-- vale off -->
```
##############################################################
################### vcluster/cli/vcluster_connect.mdluster certs rotate ####################
##############################################################
Rotates the control-plane client and server leaf certificates
of the given virtual cluster.

Examples:
vcluster -n test certs rotate test
##############################################################
```
<!-- vale on -->


## Flags

```
  -h, --help   help for rotate
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

