---
title: "vcluster snapshot --help"
sidebar_label: vcluster snapshot
---


Snapshot a virtual cluster

## Synopsis

```
vcluster snapshot VCLUSTER_NAME [flags]
```

```
#######################################################
################# vcluster snapshot ###################
#######################################################
Snapshot a virtual cluster.

Example:
# Snapshot to oci image
vcluster snapshot my-vcluster oci://ghcr.io/my-user/my-repo:my-tag
# Snapshot to s3 bucket
vcluster snapshot my-vcluster s3://my-bucket/my-bucket-key
# Snapshot to vCluster container filesystem
vcluster snapshot my-vcluster container:///data/my-local-snapshot.tar.gz
#######################################################
```


## Flags

```
      --customer-key-encryption-file string   AWS customer key encryption file used for SSE-C. Mutually exclusive with kms-key-id
  -h, --help                                  help for snapshot
      --kms-key-id string                     AWS KMS key ID that is configured for given S3 bucket. If set, aws-kms SSE will be used
      --pod-env stringArray                   Additional environment variables for the created pod. Use key=value. E.g.: MY_ENV=my-value
      --pod-exec                              Instead of creating a pod, exec into the vCluster container
      --pod-image string                      Image to use for the created pod
      --pod-image-pull-secret stringArray     Additional pull secrets for the created pod
      --pod-mount stringArray                 Additional mounts for the created pod. Use form <type>:<name>/<key>:<mount>. Supported types are: pvc, secret, configmap. E.g.: pvc:my-pvc:/path-in-pod or secret:my-secret/my-key:/path-in-pod
      --pod-service-account string            Service account to use for the created pod
      --server-side-encryption string         AWS Server-Side encryption algorithm
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

