# kubectl-doc (vendored, evaluation prototype)

Vendored copy of the `KubeSchemaDoc` React component from
[sttts/kubectl-doc](https://github.com/sttts/kubectl-doc), used to evaluate an
interactive `vcluster.yaml` schema explorer (DOC-1512).

This is a prototype. It is not wired into any docs sidebar or the generated
config reference pipeline. See `hack/vcluster/schema-explorer/EVALUATION.md` for
the findings and recommendation.

## Provenance

- Upstream: `github.com/sttts/kubectl-doc`
- Pinned tag: `v0.2.9`
- License: Apache-2.0

Vendored files (copied verbatim from upstream):

| File | Upstream path |
|---|---|
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
- `overrides.css`: site-side positioning override that keeps the side-overlay
  details card below the Docusaurus navbar. Imported by `index.jsx`. Stopgap
  only; visual polish is owned by the design team.
- `payloads/sync-toHost-pods.json`: `KubeSchemaDocument` generated from
  `configsrc/vcluster/main/vcluster.schema.json`.

## Regenerate the payload

```bash
go install github.com/sttts/kubectl-doc/cmd/kubectl-doc@v0.2.9
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
