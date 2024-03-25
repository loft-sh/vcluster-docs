# Website

This website is built using [Docusaurus](https://docusaurus.io/) v3, a modern static website generator.

## Installation

```
$ npm install
```

### Local Development

```
$ npm run start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

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
