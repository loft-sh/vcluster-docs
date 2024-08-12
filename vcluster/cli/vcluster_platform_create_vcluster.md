---
title: "vcluster platform create vcluster --help"
sidebar_label: vcluster platform create vcluster
---


Creates a new virtual cluster

## Synopsis

```
vcluster platform create vcluster VCLUSTER_NAME [flags]
```

```
#########################################################################
################### vcluster platform create vcluster ###################
#########################################################################
Creates a new virtual cluster

Example:
vcluster platform create vcluster test --namespace test
#########################################################################
```


## Flags

```
      --annotations strings               Comma separated annotations to apply to the virtualclusterinstance
      --chart-name string                 The virtual cluster chart name to use (default "vcluster")
      --chart-repo string                 The virtual cluster chart repo to use (default "https://charts.loft.sh")
      --chart-version string              The virtual cluster chart version to use (e.g. v0.9.1)
      --cluster string                    The vCluster platform connected cluster to use
      --connect                           If true will run vcluster connect directly after the vcluster was created (default true)
      --create-context                    If the CLI should create a kube context for the space (default true)
      --description string                The description to show in the platform UI for this virtual cluster
      --display-name string               The display name to show in the platform UI for this virtual cluster
      --expose                            If true will create a load balancer service to expose the vcluster endpoint
  -h, --help                              help for vcluster
      --kube-config-context-name string   If set, will override the context name of the generated virtual cluster kube config with this name
      --kubernetes-version string         The kubernetes version to use (e.g. v1.20). Patch versions are not supported
  -l, --labels strings                    Comma separated labels to apply to the virtualclusterinstance
      --link stringArray                  A link to add to the vCluster. E.g. --link 'prod=http://exampleprod.com'
      --parameters string                 If a template is used, this can be used to use a file for the parameters. E.g. --parameters path/to/my/file.yaml
      --params string                     If a template is used, this can be used to use a file for the parameters. E.g. --params path/to/my/file.yaml
      --print                             If enabled, prints the context to the console
      --project string                    The vCluster platform project to use
      --recreate                          If enabled and there already exists a virtual cluster with this name, it will be deleted first
      --set stringArray                   Set values for helm. E.g. --set 'persistence.enabled=true'
      --set-param stringArray             If a template is used, this can be used to set a specific parameter. E.g. --set-param 'my-param=my-value'
      --set-parameter stringArray         If a template is used, this can be used to set a specific parameter. E.g. --set-parameter 'my-param=my-value'
      --skip-wait                         If true, will not wait until the virtual cluster is running
      --switch-context                    If the CLI should switch the current context to the new context (default true)
      --team string                       The team to create the space for
      --template string                   The vCluster platform template to use
      --template-version string           The vCluster platform template version to use
      --update-current                    If true updates the current kube config (default true)
      --upgrade                           If true will try to upgrade the vcluster instead of failing if it already exists
      --use                               If the platform should use the virtual cluster if its already there
      --user string                       The user to create the space for
  -f, --values stringArray                Path where to load extra helm values from
```


## Global & Inherited Flags

```
      --config string       The vcluster CLI config to use (will be created if it does not exist) (default "/home/runner/.vcluster/config.json")
      --context string      The kubernetes config context to use
      --debug               Prints the stack trace if an error occurs
      --log-output string   The log format to use. Can be either plain, raw or json (default "plain")
  -n, --namespace string    The kubernetes namespace to use
  -s, --silent              Run in silent mode and prevents any vcluster log output except panics & fatals
```

