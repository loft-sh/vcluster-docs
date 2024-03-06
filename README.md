# Website

This website is built using [Docusaurus](https://docusaurus.io/) v3, a modern static website generator.

## Installation

```
$ yarn
```

### Local Development

```
$ npm start
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

1. Ensure `hack/gen-partials.sh` is executable
2. Run `hack/gen-partials.sh` to generate partials with default arguments

Optional:

- Configure the input file and output directory `hack/gen-partials.sh ./my-schema.json ./gen/my-out-dir`
- Enabled debug logs `DEBUG=true hack/gen-partials.sh`
