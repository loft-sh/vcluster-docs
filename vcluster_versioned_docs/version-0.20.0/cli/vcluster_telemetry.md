---
title: "vcluster telemetry --help"
sidebar_label: vcluster telemetry
---


Sets your vcluster telemetry preferences

## Synopsis

```
#######################################################
################## vcluster telemetry #################
#######################################################
Sets your vcluster telemetry preferences.
Default: enabled.

More information about the collected telmetry is in the
docs: https://www.vcluster.com/docs/advanced-topics/telemetry
```


## Flags

```
  -h, --help   help for telemetry
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

