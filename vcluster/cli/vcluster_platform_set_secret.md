---
title: "vcluster platform set secret --help"
sidebar_label: vcluster platform set secret
---


Sets the key value of a project secret

## Synopsis

```
vcluster platform set secret SECRET_NAME SECRET_VALUE [flags]
```

```
#########################################################
#################### loft set secret ####################
#########################################################

Sets the key value of a project secret.


Example:
vcluster platform set secret test-secret.key value
vcluster platform set secret test-secret.key value --project myproject
#######################################################
```


## Flags

```
  -h, --help             help for secret
  -p, --project string   The project to create the project secret in.
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

