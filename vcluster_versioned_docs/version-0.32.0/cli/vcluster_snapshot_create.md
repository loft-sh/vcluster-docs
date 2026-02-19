---
title: "vcluster snapshot create --help"
sidebar_label: vcluster snapshot create
---


Snapshot a virtual cluster

## Synopsis

```
vcluster snapshot create [flags]
```

```
##############################################################
################# vcluster snapshot create ###################
##############################################################
Snapshot a virtual cluster. The command creates a snapshot
request, which will be processed asynchronously by a vCluster
controller.

Example:
# Snapshot to oci image
vcluster snapshot create my-vcluster oci://ghcr.io/my-user/my-repo:my-tag
# Snapshot to s3 bucket
vcluster snapshot create my-vcluster s3://my-bucket/my-bucket-key
# Snapshot to vCluster container filesystem
vcluster snapshot create my-vcluster container:///data/my-local-snapshot.tar.gz
##############################################################
```


## Flags

```
      --customer-key-encryption-file string   AWS customer key encryption file used for SSE-C. Mutually exclusive with kms-key-id
  -h, --help                                  help for create
      --include-volumes                       Create CSI volume snapshots (shared and private nodes only)
      --kms-key-id string                     AWS KMS key ID that is configured for given S3 bucket. If set, aws-kms SSE will be used
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

