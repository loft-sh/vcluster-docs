---
title: "vcluster platform wakeup namespace --help"
sidebar_label: vcluster platform wakeup namespace
---


Wakes up a vCluster platform namespace

## Synopsis

```
vcluster platform wakeup namespace NAMESPACE_NAME [flags]
```

```
#########################################################
################# loft wakeup namespace #################
#########################################################

wakeup resumes a sleeping vCluster platform namespace
Example:
vcluster platform wakeup namespace myspace
vcluster platform wakeup namespace myspace --project myproject
#######################################################
```


## Flags

```
      --cluster string   The cluster to use
  -h, --help             help for namespace
  -p, --project string   The project to use
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

