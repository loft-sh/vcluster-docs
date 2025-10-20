---
title: "vcluster certs rotate-ca --help"
sidebar_label: vcluster certs rotate-ca
---


Rotates the CA certificate

## Synopsis

```
vcluster certs rotate-ca VCLUSTER_NAME [flags]
```

<!-- vale off -->  
```
##############################################################
################## vcluster certs rotate-ca ##################
##############################################################
Rotates the CA certificates of the given virtual cluster using
the current CA certificates.
The CA files (ca.{crt,key}) can be placed in the PKI directory
(either /data/pki or /var/lib/vcluster/pki) to issue new leaf
certificates to be signed by that CA.
If the ca.crt file is a bundle containing multiple certificates
the new CA cert must be the first one in the bundle.

Examples:
vcluster certs rotate-ca test
##############################################################
```
<!-- vale on -->  


## Flags

```
  -h, --help   help for rotate-ca
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

