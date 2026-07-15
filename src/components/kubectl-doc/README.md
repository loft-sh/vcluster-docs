# kubectl-doc (vendored, evaluation prototype)

Vendored copy of the `KubeSchemaDoc` React component from
[sttts/kubectl-doc](https://github.com/sttts/kubectl-doc), used to evaluate an
interactive `vcluster.yaml` schema explorer (DOC-1512).

This is a beta. It is surfaced as an "Explorer (beta)" tab beside the accordion
reference on the `sync/to-host` config page; the accordions stay the default,
search-indexed view. It is not yet wired into the generated config reference
pipeline. See `hack/vcluster/schema-explorer/EVALUATION.md` for the findings and
recommendation.

## Provenance

- Upstream: `github.com/sttts/kubectl-doc`
- Pinned tag: `v0.2.9`
- License: Apache-2.0

Vendored files (copied verbatim from upstream):

| File | Upstream path |
| --- | --- |
| `KubeSchemaDoc.tsx` | `react/kubectl-doc/KubeSchemaDoc.tsx` |
| `kubectl-doc-styles.ts` | `react/kubectl-doc/kubectl-doc-styles.ts` |
| `kubectl-doc-runtime.d.ts` | `react/kubectl-doc/kubectl-doc-runtime.d.ts` |
| `kubectl-doc-runtime.js` | `internal/render/web/assets/kubectl-doc.js` (generated) |

`kubectl-doc-runtime.js` is an 87 KB generated bundle (`// Code generated`). It
is an IIFE that registers `window.KubectlDoc`; `KubeSchemaDoc.tsx` dynamically
imports it and calls `runtime.mount(...)`. The component self-injects its CSS.

## Local files (not from upstream)

- `index.jsx`: SSR-safe Docusaurus wrapper (`BrowserOnly` + deferred `require`).
  Import this, not `KubeSchemaDoc.tsx` directly.
- `LazySchemaExplorer.jsx`: fetches a generated payload from a static URL at
  runtime and renders `index.jsx`. Use this on docs pages so the (large) payload
  stays out of the route JS chunk; a static `import` would ship it on first load.
- `MountWhenVisible.jsx`: defers rendering its children until first visible, so
  neither the 87 KB runtime nor the payload load until the reader opens the tab.
- `overrides.css`: site-side positioning override that keeps the side-overlay
  details card below the Docusaurus navbar. Imported by `index.jsx`. Stopgap
  only; visual polish is owned by the design team.
- `payloads/sync-toHost-pods.json`: `KubeSchemaDocument` for the standalone
  sandbox page (`/kubectl-doc-prototype`), generated from
  `configsrc/vcluster/main/vcluster.schema.json`.

The `sync/to-host` page payload is served as a static asset from
`static/schema-explorer/vcluster/sync/toHost.explorer.json` (fetched at runtime
by `LazySchemaExplorer`), not vendored here.

## Regenerate the payloads

Page payloads (served as static assets) are produced by the section generator:

```bash
go install github.com/sttts/kubectl-doc/cmd/kubectl-doc@v0.2.9
node hack/vcluster/schema-explorer/generate-payloads.mjs
# writes static/schema-explorer/vcluster/<section>.explorer.json
```

The standalone sandbox payload (`payloads/sync-toHost-pods.json`) is generated
directly from a single section:

```bash
node hack/vcluster/schema-explorer/make-crd.mjs \
  configsrc/vcluster/main/vcluster.schema.json \
  sync.toHost.pods SyncToHostPods /tmp/synthetic-crd.yaml
kubectl-doc -f /tmp/synthetic-crd.yaml -o markdown-fern \
  --fern-schema-dir /tmp/payload-out --fern-schema-url-path . --version v1alpha1
# the *-full.json sidecar (complete:true) becomes payloads/sync-toHost-pods.json
```

## Update the vendored component

Re-copy the four files from a newer upstream tag and update the pin above.
Re-verify the prototype renders, since the `markdown-fern` payload contract can
change across releases.
