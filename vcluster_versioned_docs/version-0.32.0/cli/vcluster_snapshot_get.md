---
title: "vcluster snapshot get --help"
sidebar_label: vcluster snapshot get
---


Get virtual cluster snapshot

## Synopsis

```
vcluster snapshot get [flags]
```

```
##############################################################
################### vcluster snapshot get ####################
##############################################################
Get virtual cluster snapshot.

Example:
# Get snapshot from oci image
vcluster snapshot get my-vcluster oci://ghcr.io/my-user/my-repo:my-tag
# Get snapshot from s3 bucket
vcluster snapshot get my-vcluster s3://my-bucket/my-bucket-key
# Get snapshot from vCluster container filesystem
vcluster snapshot get my-vcluster container:///data/my-local-snapshot.tar.gz
##############################################################
```


## Flags

```
      --customer-key-encryption-file string   AWS customer key encryption file used for SSE-C. Mutually exclusive with kms-key-id
  -h, --help                                  help for get
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

