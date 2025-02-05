---
title: "vcluster platform start --help"
sidebar_label: vcluster platform start
---


Start a vCluster platform instance and connect via port-forwarding

## Synopsis

```
vcluster platform start [flags]
```

```
########################################################
############# vcluster platform start ##################
########################################################

Starts a vCluster platform instance in your Kubernetes cluster
and then establishes a port-forwarding connection.

Please make sure you meet the following requirements
before running this command:

1. Current kube-context has admin access to the cluster
2. Helm v3 must be installed
3. kubectl must be installed

########################################################
```


## Flags

```
      --chart-name string    The chart name to deploy vCluster platform (default "vcluster-platform")
      --chart-path string    The vCluster platform chart path to deploy vCluster platform
      --chart-repo string    The chart repo to deploy vCluster platform (default "https://charts.loft.sh/")
      --context string       The kube context to use for installation
      --email string         The email to use for the installation
  -h, --help                 help for start
      --host string          Provide a hostname to enable ingress and configure its hostname
      --local-port string    The local port to bind to if using port-forwarding
      --namespace string     The namespace to install vCluster platform into (default "vcluster-platform")
      --no-login             If true, vCluster platform will not login to a vCluster platform instance on start
      --no-port-forwarding   If true, vCluster platform will not do port forwarding after installing it
      --no-tunnel            If true, vCluster platform will not create a loft.host tunnel for this installation
      --no-wait              If true, vCluster platform will not wait after installing it
      --password string      The password to use for the admin account. (If empty this will be the namespace UID)
      --reset                If true, existing vCluster Platform resources, including the deployment, will be deleted before installing vCluster platform
      --reuse-values         Reuse previous vCluster platform helm values on upgrade (default true)
      --upgrade              If true, vCluster platform will try to upgrade the release
      --values string        Path to a file for extra vCluster platform helm chart values
      --version string       The vCluster platform version to install (default "latest")
```


## Global & Inherited Flags

```
      --config string       The vcluster CLI config to use (will be created if it does not exist) (default "~/.vcluster/config.json")
      --debug               Prints the stack trace if an error occurs
      --log-output string   The log format to use. Can be either plain, raw or json (default "plain")
  -s, --silent              Run in silent mode and prevents any vcluster log output except panics & fatals
```

