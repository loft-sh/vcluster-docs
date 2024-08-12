---
title: "vcluster platform add cluster --help"
sidebar_label: vcluster platform add cluster
---


add current cluster to vCluster platform

## Synopsis

```
vcluster platform add cluster [flags]
```

```
#######################################################
############ vcluster platform add cluster ############
#######################################################
Adds a cluster to the vCluster platform instance.

Example:
vcluster platform add cluster my-cluster
########################################################
```


## Flags

```
      --context string              The kube context to use for installation
      --display-name string         The display name to show in the UI for this cluster
      --helm-chart-path string      The agent chart to deploy
      --helm-chart-version string   The agent chart version to deploy
      --helm-set stringArray        Extra helm values for the agent chart
      --helm-values stringArray     Extra helm values for the agent chart
  -h, --help                        help for cluster
      --insecure                    If true, deploys the agent in insecure mode
      --namespace string            The namespace to generate the service account in. The namespace will be created if it does not exist (default "loft")
      --service-account string      The service account name to create (default "loft-admin")
      --wait                        If true, will wait until the cluster is initialized
```


## Global & Inherited Flags

```
      --config string       The vcluster CLI config to use (will be created if it does not exist) (default "/home/runner/.vcluster/config.json")
      --debug               Prints the stack trace if an error occurs
      --log-output string   The log format to use. Can be either plain, raw or json (default "plain")
  -s, --silent              Run in silent mode and prevents any vcluster log output except panics & fatals
```

