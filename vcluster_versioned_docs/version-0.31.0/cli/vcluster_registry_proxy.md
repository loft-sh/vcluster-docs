---
title: "vcluster registry proxy --help"
sidebar_label: vcluster registry proxy
---

## vcluster registry proxy

Proxy the vCluster registry to use it with docker and other tools

```
vcluster registry proxy [flags]
```

### Options

```
  -h, --help       help for proxy
      --port int   The local port to proxy the registry to (default 15000)
```

### Options inherited from parent commands

```
      --config string       The vcluster CLI config to use (will be created if it does not exist) (default "~/.vcluster/config.json")
      --context string      The kubernetes config context to use
      --debug               Prints the stack trace if an error occurs
      --log-output string   The log format to use. Can be either plain, raw or json (default "plain")
  -n, --namespace string    The kubernetes namespace to use
  -s, --silent              Run in silent mode and prevents any vcluster log output except panics & fatals
```

```

```


## Flags
## Global and inherited flags