---
title: "vcluster platform backup management --help"
sidebar_label: vcluster platform backup management
---


Create a vCluster platform management plane backup

## Synopsis

```
vcluster platform backup management [flags]
```

```
########################################################
################ loft backup management ################
########################################################

Backup creates a backup for the vCluster platform management plane

Example:
vcluster platform backup management
########################################################
```


## Flags

```
      --filename string    The filename to write the backup to (default "backup.yaml")
  -h, --help               help for management
      --namespace string   The namespace vCluster platform was installed into
      --skip strings       What resources the backup should skip. Valid options are: users, teams, accesskeys, sharedsecrets, clusters and clusteraccounttemplates
```


## Global & Inherited Flags

```
      --config string       The vcluster CLI config to use (will be created if it does not exist) (default "~/.vcluster/config.json")
      --context string      The kubernetes config context to use
      --debug               Prints the stack trace if an error occurs
      --log-output string   The log format to use. Can be either plain, raw or json (default "plain")
  -s, --silent              Run in silent mode and prevents any vcluster log output except panics & fatals
```

