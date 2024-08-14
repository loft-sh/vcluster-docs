---
title: "vcluster set secret --help"
sidebar_label: vcluster set secret
---


Sets the key value of a project / shared secret

## Synopsis

```
vcluster set secret SECRET_NAME SECRET_VALUE [flags]
```

```
#########################################################
#################### loft set secret ####################
#########################################################

Sets the key value of a project / shared secret.


Example:
vcluster platform set secret test-secret.key value
vcluster platform set secret test-secret.key value --project myproject
#######################################################
```


## Flags

```
  -h, --help               help for secret
  -n, --namespace string   The namespace in the vCluster platform cluster to create the secret in. If omitted will use the namespace were vCluster platform is installed in
  -p, --project string     The project to create the project secret in.
```


## Global & Inherited Flags

```
      --config string       The vcluster CLI config to use (will be created if it does not exist) (default "/Users/ryanswanson/.vcluster/config.json")
      --context string      The kubernetes config context to use
      --debug               Prints the stack trace if an error occurs
      --log-output string   The log format to use. Can be either plain, raw or json (default "plain")
  -s, --silent              Run in silent mode and prevents any vcluster log output except panics & fatals
```

