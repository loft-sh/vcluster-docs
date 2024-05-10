# Contribute to the vCluster docs

## Docs website

This docs website is built using [Docusaurus](https://docusaurus.io/) v3, a modern static website generator.

## Installation

```
$ npm install
```

### Local Development

```
$ npm run start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.
Note that `npm run start` doesn't always catch build errors.

### Build

```
$ npm run build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

`npm run serve`

Serves the built website locally.

## Generate partials for vCluster values

1. update vcluster repo
2. run `go run ./hack/schema/main.go`
3. copy jsonschema from `chart/values.schema.json`
4. paste into `vcluster-docs/schema.json`
5. run `./hack/gen-partials.sh`


## Style guide

The vCluster docs use the following style guides in this order:

1. [Google developer documentation style guide](https://developers.google.com/style)
2. Kubernetes [Documentation Style Guide](https://kubernetes.io/docs/contribute/style/style-guide/) for Kubernetes terms.

Page titles follow **sentence** case. Capitalize Kubernetes objects [according to the K8s style guide](https://kubernetes.io/docs/contribute/style/style-guide/#documentation-formatting-standards).

### Oxford comma

Use the Oxford comma (serial comma) before the last item when listing 3 or more items in a sentence.

- **Do Not**: vCluster requires a, b and c.
- **Do**: vCluster requires a, b, and c.

See Scribbr's [article](https://www.scribbr.com/commas/oxford-comma/) on the Oxford comma for a detailed explanation and examples.

## vCluster terms

Loft Labs is the company. Do not use "Loft" or "Loft Platform" to refer to vCluster products.

"vCluster" is a trademark. There are strict legal frameworks around how to use a trademark, e.g. it cannot be used in plural. **Do not use "vClusters"**.

### Products:
  - vCluster: 
  - vCluster Pro: a single enhanced/paid/upgraded virtual cluster that uses Pro functionality (as labeled "Pro")
  - vCluster Platform: the management platform and UI for managing open source and commercial vCluster instances

### CLI

`vcluster`


### Virtual clusters

Never use vCluster or vClusters when talking about a virtual cluster or clusters that vCluster creates.

## Kubernetes distros

Abbreviations for Kubernetes distros:

- [Lightweight Kubernetes](https://k3s.io/): K3s
- [Kubernetes](https://kubernetes.io/): K8s
- [Zero Friction Kubernetes](https://k0sproject.io/ ): k0s  Note that k0s is the only Kubernetes distro to use a lower case 'k'
- [AWS Elastic Kubernetes Service](https://aws.amazon.com/eks/): EKS

## Other product terms

- AWS [EKS](https://aws.amazon.com/eks/)
- [CoreDNS](https://coredns.io/)
- [etcd](https://etcd.io/)


## Highlight lines of code

Use inline comments in the code to highlight lines. See https://docusaurus.io/docs/markdown-features/code-blocks#highlighting-with-comments.
