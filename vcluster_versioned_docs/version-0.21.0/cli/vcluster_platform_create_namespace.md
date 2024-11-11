---
title: "vcluster platform create namespace --help"
sidebar_label: vcluster platform create namespace
---


Creates a new vCluster platform namespace in the given cluster

## Synopsis

```
vcluster platform create namespace NAMESPACE_NAME [flags]
```

```
#########################################################
################# loft create namespace #################
#########################################################

Creates a new vCluster platform namespace for the given project, if
it does not yet exist.
Example:
vcluster platform create namespace myspace
vcluster platform create namespace myspace --project myproject
vcluster platform create namespace myspace --project myproject --team myteam
########################################################
```


## Flags

```
      --annotations strings               Comma separated annotations to apply to the namespace
      --cluster string                    The cluster to use
      --create-context                    If loft should create a kube context for the namespace (default true)
      --description string                The description to show in the UI for this namespace
      --disable-direct-cluster-endpoint   When enabled does not use an available direct cluster endpoint to connect to the namespace
      --display-name string               The display name to show in the UI for this namespace
  -h, --help                              help for namespace
  -l, --labels strings                    Comma separated labels to apply to the namespace
      --link strings                      Labeled Links to annotate the object with.
                                          These links will be visible from the UI. When used with update, existing links will be replaced.
                                          E.g. --link 'Prod=http://exampleprod.com,Dev=http://exampledev.com'
      --parameters string                 The file where the parameter values for the apps are specified
  -p, --project string                    The project to use
      --recreate                          If enabled and there already exists a namespace with this name, Loft will delete it first
      --set strings                       Allows specific template parameters to be set. E.g. --set myParameter=myValue
      --skip-wait                         If true, will not wait until the namespace is running
      --switch-context                    If loft should switch the current context to the new context (default true)
      --team string                       The team to create the namespace for
      --template string                   The namespace template to use
      --template-version string           The template version to use
      --update                            If enabled and a namespace already exists, will update the template, version and parameters
      --use                               If loft should use the namespace if its already there
      --user string                       The user to create the namespace for
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

