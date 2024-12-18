---
title: "vcluster convert config --help"
sidebar_label: vcluster convert config
---


Converts virtual cluster config values to the v0.20 format

## Synopsis

```
vcluster convert config [flags]
```

```
##############################################################
################## vcluster convert config ###################
##############################################################
Converts the given virtual cluster config to the v0.20 format.
Reads from stdin if no file is given via "-f".

Examples:
vcluster convert config --distro k8s -f /my/k8s/values.yaml
vcluster convert config --distro k3s < /my/k3s/values.yaml
cat /my/k0s/values.yaml | vcluster convert config --distro k0s
##############################################################
```


## Flags

```
      --distro string   Kubernetes distro of the config. Allowed distros: k8s, k3s, k0s
  -f, --file string     Path to the input file
  -h, --help            help for config
  -o, --output string   Prints the output in the specified format. Allowed values: yaml, json (default "yaml")
```


## Global & Inherited Flags

```
      --config string       The vcluster CLI config to use (will be created if it does not exist) (default "/Users/ryanswanson/.vcluster/config.json")
      --context string      The kubernetes config context to use
      --debug               Prints the stack trace if an error occurs
      --log-output string   The log format to use. Can be either plain, raw or json (default "plain")
  -n, --namespace string    The kubernetes namespace to use
  -s, --silent              Run in silent mode and prevents any vcluster log output except panics & fatals
```

