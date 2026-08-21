---
title: "vcluster platform create accesskey --help"
sidebar_label: vcluster platform create accesskey
---


Creates a new access key for the current user

## Synopsis

```
vcluster platform create accesskey NAMESPACE_NAME [flags]
```

```
########################################################
################ loft create access key ################
########################################################

Creates a new access key for the current user.
Example:
vcluster platform create accesskey test
# To connect vClusters to the platform
vcluster platform create accesskey test --vcluster-role
vcluster platform create accesskey test --in-cluster --user admin
########################################################
```


## Flags

```
      --display-name string   The display name of the access key as shown in the UI
      --expire-after string   The duration after which the access key will expire, e.g. 1h, 1d, 1w
  -h, --help                  help for accesskey
      --in-cluster            If true, the access key will be created in the current Kubernetes context instead of using the platform api. This allows access key creation without the need to be already logged in.
      --user string           The user to create the access key for
      --vcluster-role         If true, the access key can be used to connect vClusters to the platform
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

