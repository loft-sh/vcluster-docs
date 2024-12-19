---
title: "vcluster platform get secret --help"
sidebar_label: vcluster platform get secret
---


Returns the key value of a project / shared secret

## Synopsis

```
vcluster platform get secret SECRET_NAME [flags]
```

```
#########################################################
#################### loft get secret ####################
#########################################################

Returns the key value of a project / shared secret.

Example:
vcluster platform get secret test-secret.key
vcluster platform get secret test-secret.key --project myproject
########################################################
```


## Flags

```
  -a, --all                Display all secret keys
  -h, --help               help for secret
  -n, --namespace string   The namespace in the vCluster platform cluster to read the secret from. If omitted will use the namespace where vCluster platform is installed in
  -o, --output string      Output format. One of: (json, yaml, value). If the --all flag is passed 'yaml' will be the default format
  -p, --project string     The project to read the project secret from.
```


## Global & Inherited Flags

```
      --config string       The vcluster CLI config to use (will be created if it does not exist) (default "/Users/ryanswanson/.vcluster/config.json")
      --context string      The kubernetes config context to use
      --debug               Prints the stack trace if an error occurs
      --log-output string   The log format to use. Can be either plain, raw or json (default "plain")
  -s, --silent              Run in silent mode and prevents any vcluster log output except panics & fatals
```

