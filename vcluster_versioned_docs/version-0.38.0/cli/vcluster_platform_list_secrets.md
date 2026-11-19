---
title: "vcluster platform list secrets --help"
sidebar_label: vcluster platform list secrets
---


Lists the project secrets you have access to

## Synopsis

```
vcluster platform list secrets [flags]
```

```
#########################################################
################### loft list secrets ###################
#########################################################

List the project secrets you have access to

Example:
vcluster platform list secrets --project myproject
vcluster platform list secrets --all-projects
########################################################
```


## Flags

```
  -a, --all                   Display project secrets. May be used with the --project flag to display a subset of project secrets
      --all-projects          Display project secrets for all projects.
  -h, --help                  help for secrets
  -p, --project stringArray   The project(s) to read project secrets from
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

