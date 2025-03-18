---
title: "vcluster restore --help"
sidebar_label: vcluster restore
---


Restores a virtual cluster from snapshot

## Synopsis

```
vcluster restore VCLUSTER_NAME [flags]
```

```
#######################################################
################# vcluster restore ####################
#######################################################
Restore a virtual cluster.

Example:
# Restore from oci image
vcluster restore my-vcluster oci://ghcr.io/my-user/my-repo:my-tag
# Restore from s3 bucket
vcluster restore my-vcluster s3://my-bucket/my-bucket-key
# Restore from vCluster container filesystem
vcluster restore my-vcluster container:///data/my-local-snapshot.tar.gz
#######################################################
```


## Flags

```
  -h, --help                                help for restore
      --pod-env stringArray                 Additional environment variables for the created pod. Use key=value. E.g.: MY_ENV=my-value
      --pod-image string                    Image to use for the created pod
      --pod-image-pull-secret stringArray   Additional pull secrets for the created pod
      --pod-mount stringArray               Additional mounts for the created pod. Use form <type>:<name>/<key>:<mount>. Supported types are: pvc, secret, configmap. E.g.: pvc:my-pvc:/path-in-pod or secret:my-secret/my-key:/path-in-pod
      --pod-service-account string          Service account to use for the created pod
```


## Global & Inherited Flags

```
      --config string       The vcluster CLI config to use (will be created if it does not exist) (default "~/.vcluster/config.json")
      --context string      The kubernetes config context to use
      --debug               Prints the stack trace if an error occurs
      --log-output string   The log format to use. Can be either plain, raw or json (default "plain")
  -n, --namespace string    The kubernetes namespace to use
  -s, --silent              Run in silent mode and prevents any vcluster log output except panics & fatals
```

