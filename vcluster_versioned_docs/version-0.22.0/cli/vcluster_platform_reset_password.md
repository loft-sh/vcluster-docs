---
title: "vcluster platform reset password --help"
sidebar_label: vcluster platform reset password
---


Resets the password of a user

## Synopsis

```
vcluster platform reset password [flags]
```

```
########################################################
######### vcluster platform reset password #############
########################################################
Resets the password of a user.

Example:
vcluster platform reset password
vcluster platform reset password --user admin
#######################################################
```


## Flags

```
      --create            Creates the user if it does not exist
      --force             If user had no password will create one
  -h, --help              help for password
      --password string   The new password to use
      --user string       The name of the user to reset the password (default "admin")
```


## Global & Inherited Flags

```
      --config string       The vcluster CLI config to use (will be created if it does not exist) (default "/Users/ryanswanson/.vcluster/config.json")
      --context string      The kubernetes config context to use
      --debug               Prints the stack trace if an error occurs
      --log-output string   The log format to use. Can be either plain, raw or json (default "plain")
  -n, --namespace string    The kubernetes namespace to use
  -s, --silent              Run in silent mode and prevents any vcluster log output except panics & fatals
```

