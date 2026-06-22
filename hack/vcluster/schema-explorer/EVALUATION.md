# DOC-1512: kubectl-doc interactive schema reference evaluation

Evaluation of the `kubectl-doc` `KubeSchemaDoc` explorer (sttts/kubectl-doc,
Apache-2.0) as an interactive reference for `vcluster.yaml`. A working prototype
renders the `sync.toHost.pods` section inside this Docusaurus site at
`/docs/kubectl-doc-prototype`.

## Verdict

Conditional go, as an augmentation pilot on one or two large config pages. Do
not replace the generated accordion reference. The explorer is client-only, so
it loses the server-rendered HTML, in-page anchors, and no-JS access that the
accordions provide; those properties matter for search indexing and
deep-linking. Treat it as an optional companion view where the accordion page
is too large to scan (`controlPlane` is 5,425 lines / 357 fields today).

## 1. Can kubectl-doc consume the vcluster schema directly?

No. `kubectl doc` ingests Kubernetes inputs only: cluster OpenAPI v3, or a local
CRD manifest via `-f`. `jsonschema` is an output format, not an input. The
`vcluster.yaml` source is plain JSON Schema (draft 2020-12, `$defs`/`$ref`), so
it needs an adapter.

The adapter built here (`make-crd.mjs`) converts one schema section into a
synthetic structural CRD that `kubectl doc -f` accepts:

```bash
node make-crd.mjs configsrc/vcluster/main/vcluster.schema.json \
  sync.toHost.pods SyncToHostPods synthetic-crd.yaml
kubectl-doc -f synthetic-crd.yaml -o markdown-fern \
  --fern-schema-dir payload-out --fern-schema-url-path . --version v1alpha1
```

`kubectl doc` consumes the result through the upstream
`k8s.io/apiextensions-apiserver` `NewStructural` validator, so the manifest must
be a legal structural schema, not merely valid JSON Schema. The converter:

- inlines every `$ref` against `$defs`, cutting cycles to opaque
  `x-kubernetes-preserve-unknown-fields` objects;
- guarantees a `type` on every node (inferred from `properties`/`items`/
  `additionalProperties`/`enum`, scalar fallback `string`);
- collapses `patternProperties` catch-alls into `additionalProperties`;
- drops keywords the apiserver does not model (`$schema`, `$id`, `oneOf`,
  `anyOf`, `allOf`, `not`).

Lossiness for `sync.toHost.pods` is zero: it has no unions and no cycles, so
types, descriptions, enums, defaults, and constraints all survive verbatim.
Schema-wide, the `oneOf`/`anyOf`/`allOf` collapse is the real risk; a handful of
polymorphic config fields would silently flatten and need an audit before any
wider rollout.

## 2. Prototype in Docusaurus

Done and render-verified. Four upstream files are vendored (pinned to v0.2.9)
under `src/components/kubectl-doc/`: `KubeSchemaDoc.tsx`, `kubectl-doc-styles.ts`,
`kubectl-doc-runtime.d.ts`, and the generated `kubectl-doc-runtime.js` (87 KB
IIFE that registers `window.KubectlDoc`). An SSR-safe wrapper
(`index.jsx`, `BrowserOnly` + deferred `require`) and a standalone sandbox page
(`src/pages/kubectl-doc-prototype.jsx`) render a payload generated from the real
vcluster schema.

Confirmed against the prototype: the YAML-shaped tree renders with syntax
highlighting; clicking a field opens a details panel with path, type, required,
and the verbatim schema description; folding works (per-node toggles); filtering
is enabled. No Fern-specific assumptions remain, and the production build
renders the page (the component is client-only, so the server emits a loading
placeholder and the explorer mounts after hydration).

One artifact of the CRD round-trip: the payload carries Kubernetes machinery
(`apiVersion`, `kind`, `metadata`, ~21 metadata fields) wrapping the real config
under `spec`. A production integration would strip to `spec.*` and relabel.

## 3. Explorer vs the accordion reference

| Dimension | Generated accordions (current) | kubectl-doc explorer |
|---|---|---|
| Shape | Nested prose disclosure (`<details>`) | YAML document users actually write |
| Rendering | Server-rendered HTML | Client-only; empty until JS mounts |
| Deep links | Per-field anchors (`#controlPlane-distro-k8s-enabled`) | None per field today |
| Search | Indexed by site + web search | Not indexed (no SSR content) |
| No-JS | Fully readable | Blank |
| Filtering | Browser find / site search only | In-tree filter, built in |
| Large pages | `controlPlane`: 5,425 lines, scroll-heavy | Foldable tree, scannable |
| Maintenance | Go generator already in CI | Adds 87 KB vendored runtime + payload generation |

The explorer wins on scannability for large schemas and on matching the YAML
mental model. The accordions win on SSR, indexing, deep links, and no-JS access,
and they are already wired into the release pipeline.

## 4. Augment or replace?

Augment. Keep the generated accordions as the canonical, indexed, deep-linkable
reference. Add the explorer as an optional companion on the pages where the
accordion length hurts most (`controlPlane`, `sync`). Replacing the accordions
would regress search indexing, per-field deep links, and no-JS readability for
the entire config reference, in exchange for a UX gain that only matters on the
largest pages.

## 5. Generation workflow and drift control

If this proceeds past the pilot:

1. Generation: extend the existing `sync-config-schema` pipeline (the same one
   that runs `hack/vcluster/partials/main.go`). For each target section, run
   `make-crd.mjs` then `kubectl-doc` and commit the payload JSON next to the
   partials, version by version.
2. Drift check: regenerate in CI and `git diff --exit-code` on the payloads,
   exactly as the partials are guarded today. Pin the `kubectl-doc` version and
   record it; the `markdown-fern` payload contract can change across releases.
3. Costs to accept: the injected Kubernetes metadata is carried forever and must
   be filtered out, and bending a CRD tool to render non-CRD config means
   tracking upstream `NewStructural` and payload-shape changes.

Longer term, the cleaner adapter is to emit the `KubeSchemaDocument` payload
directly from the JSON Schema (the shape is fully specified in upstream
`internal/render/webschema/payload.go`). Direct emission keeps unions and refs
first-class, drops the synthetic-CRD round-trip and the injected metadata, and
removes the Go binary from the build. The cost is reimplementing the YAML
token rendering and fold logic that `kubectl-doc` gives for free. Recommended
path: pilot with the kubectl-doc adapter now; plan a native emitter as the
replacement once the payload contract is validated against the component.

## Risks for the go/no-go

- Vendoring an 87 KB generated, opaque runtime bundle into the docs site
  (`kubectl-doc-runtime.js`) is a maintenance and supply-chain consideration.
  It is pinned to v0.2.9 and Apache-2.0; provenance is recorded in the
  component README. Revisit if upstream stalls.
- Client-only rendering means no SSR content: a search-indexing and no-JS
  regression if it ever replaces the accordions. This is the core reason the
  recommendation is augment, not replace.
- `oneOf`/`anyOf`/`allOf` collapse in the CRD adapter is lossy for polymorphic
  fields. Audit the full schema before extending beyond the pilot sections.

## Files

- `hack/vcluster/schema-explorer/make-crd.mjs`: JSON Schema section to
  structural CRD adapter.
- `hack/vcluster/schema-explorer/example-synthetic-crd.yaml`: generated CRD for
  `sync.toHost.pods`.
- `src/components/kubectl-doc/`: vendored component (see its README) plus the
  generated payload.
- `src/pages/kubectl-doc-prototype.jsx`: sandbox page, not in any sidebar.
