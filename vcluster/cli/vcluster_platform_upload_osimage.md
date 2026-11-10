---
title: "vcluster platform upload osimage --help"
sidebar_label: vcluster platform upload osimage
---


Uploads a file to an existing OS image

## Synopsis

```
vcluster platform upload osimage OSIMAGE_NAME [flags]
```

```
#########################################################
################## loft upload osimage ##################
#########################################################

Uploads a file to an existing OS image, which holds its bytes
in the image store the OS image names.
Example:
vcluster platform upload osimage ubuntu-24.04 --file ubuntu.qcow2
########################################################
```


## Flags

```
      --file string   The local image file to upload
  -h, --help          help for osimage
      --skip-wait     If true, will not wait until the image is ready
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

