---
title: "vcluster platform connect vcluster --help"
sidebar_label: vcluster platform connect vcluster
---


Connect to a virtual cluster

## Synopsis

```
vcluster platform connect vcluster VCLUSTER_NAME [flags]
```

```
#########################################################################
################## vcluster platform connect vcluster ###################
#########################################################################
Connect to a virtual cluster

Example:
vcluster platform connect vcluster test --namespace test
# Open a new bash with the vcluster KUBECONFIG defined
vcluster platform connect vcluster test -n test -- bash
vcluster platform connect vcluster test -n test -- kubectl get ns
#########################################################################
```


## Flags

```
      --address string           The local address to start port forwarding under
      --background-proxy         Try to use a background-proxy to access the vCluster. Only works if docker is installed and reachable (default true)
      --cluster-role string      If specified, vCluster will create the service account if it does not exist and also add a cluster role binding for the given cluster role to it. Requires --service-account to be set
  -h, --help                     help for vcluster
      --insecure                 If specified, vCluster will create the kube config with insecure-skip-tls-verify
      --local-port int           The local port to forward the virtual cluster to. If empty, vCluster will use a random unused port
      --pod string               The pod to connect to
      --print                    When enabled prints the context to stdout
      --project string           The platform project the vCluster is in
      --server string            The server to connect to
      --service-account string   If specified, vCluster will create a service account token to connect to the virtual cluster instead of using the default client cert / key. Service account must exist and can be used as namespace/name.
      --token-expiration int     If specified, vCluster will create the service account token for the given duration in seconds. Defaults to eternal
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

