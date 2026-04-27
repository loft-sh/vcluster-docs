---
title: "vcluster certs check --help"
sidebar_label: vcluster certs check
---


Checks the current certificates

## Synopsis

```
vcluster certs check VCLUSTER_NAME [flags]
```

```
##############################################################
################### vcluster certs check #####################
##############################################################
Checks the current certificates.

Examples:
vcluster -n test certs check test
##############################################################
```


## Flags

```
  -h, --help            help for check
      --output string   Choose the format of the output. [table|json] (default "table")
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

