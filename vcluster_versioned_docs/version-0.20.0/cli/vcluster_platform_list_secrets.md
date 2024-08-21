---
title: "vcluster platform list secrets --help"
sidebar_label: vcluster platform list secrets
---


Lists all the shared secrets you have access to

## Synopsis

```
vcluster platform list secrets [flags]
```

```
#########################################################
################### loft list secrets ###################
#########################################################

List the shared secrets you have access to

Example:
vcluster platform list secrets
########################################################
```


## Flags

```
  -a, --all                   Display global and project secrets. May be used with the --project flag to display global secrets and a subset of project secrets
      --all-projects          Display project secrets for all projects.
  -h, --help                  help for secrets
  -n, --namespace string      The namespace in the vCluster cluster to read global secrets from. If omitted will query all accessible global secrets
  -p, --project stringArray   The project(s) to read project secrets from. If omitted will list global secrets
```


## Global & Inherited Flags

```
      --config string       The vcluster CLI config to use (will be created if it does not exist) (default "/Users/ryanswanson/.vcluster/config.json")
      --context string      The kubernetes config context to use
      --debug               Prints the stack trace if an error occurs
      --log-output string   The log format to use. Can be either plain, raw or json (default "plain")
  -s, --silent              Run in silent mode and prevents any vcluster log output except panics & fatals
```

