---
title: "vcluster platform get current-user --help"
sidebar_label: vcluster platform get current-user
---


Retrieves the current logged in user

## Synopsis

```
vcluster platform get current-user [flags]
```

```
########################################################
############ loft platform get current-user ############
########################################################

Returns the currently logged in user

Example:
vcluster platform get current-user
########################################################
```


## Flags

```
  -h, --help            help for current-user
  -o, --output string   Output format. One of: (json, yaml, value, name). (default "value")
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

