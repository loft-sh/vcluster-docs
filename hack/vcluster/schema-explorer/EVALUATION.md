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

One artifact of the CRD round-trip: `kubectl-doc` emits the payload wrapped in
Kubernetes machinery (`apiVersion`, `kind`, `metadata`, `spec`). The page
generator (`generate-payloads.mjs`) strips that frame and re-roots the tree at
the section's real path, so the `sync/to-host` explorer renders the nested YAML a
user writes (`sync:` -> `toHost:` -> `<fields>`) with dotted config paths in the
details panel. The standalone sandbox payload keeps the raw frame.

## 3. Explorer vs the accordion reference

| Dimension | Generated accordions (current) | kubectl-doc explorer |
| --- | --- | --- |
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

## 5. Source of truth, versioning, and drift control

The source of truth is not any file committed to this repo. It is
`chart/values.schema.json` in `loft-sh/vcluster`, which is itself generated from
the Go config by `hack/schema/main.go` and shipped with every release (CI there
sha-guards it against the code). The `configsrc/vcluster/<version>/vcluster.schema.json`
copies in this repo are per-release snapshots, not the source; they are pulled
in at release time and must never be hand-edited.

The explorer payloads ride the automation that already keeps the accordions
fresh, so versioning is inherited, not reinvented:

1. Trigger and source. `handle-source-release.yml` fires on a vCluster release
   and calls `hack/release/run-generator.sh` with `EVENT_TYPE=vcluster-released`,
   `SOURCE_PATH` set to the checked-out released vcluster repo (which carries the
   authoritative `chart/values.schema.json`), and a per-version `TARGET_FOLDER`
   from `classify-version.sh` (e.g. `vcluster_versioned_docs/version-0.35.0` or
   `vcluster` for next).
2. Generation. Today the `vcluster-released` case runs
   `hack/vcluster/partials/main.go --source-path … --target-folder …/_partials/config`.
   The explorer payload generator slots into the same case with the same flag
   interface, emitting per-version payloads next to the partials. New release in,
   new accordions and new explorer payloads out, in one PR, per version. The
   docs version switcher then shows each version's own schema with no special
   handling.
3. Drift check. Commit the payloads and add a `git diff --exit-code` gate after
   regeneration, exactly as the partials are guarded. This is the same model the
   Dynamo reference uses (`make check-generated`).

Recommended production path: emit the `KubeSchemaDocument` payload directly from
the schema inside `hack/vcluster/partials/main.go`, reusing the existing walker
in `hack/platform/util` that already resolves `$ref`, defaults, enums, required,
and descriptions. Direct emission keeps unions and refs first-class, needs no
external binary, drops the synthetic-CRD round-trip and the injected Kubernetes
metadata, and inherits the per-version dispatch and drift gate for free. The
only new work is the YAML token rendering and fold logic (the payload shape is
fully specified in upstream `internal/render/webschema/payload.go`).

The `make-crd.mjs` + `kubectl-doc` adapter in this PR is the prototype's payload
source: it produces a faithful payload today without writing the Go emitter. If
it were kept for production instead of the native emitter, the costs are pinning
the `kubectl-doc` version (the payload contract can shift across releases),
filtering out the injected Kubernetes metadata, and tracking upstream
`NewStructural` behaviour.

## Risks for the go/no-go

- Vendoring an 87 KB generated, opaque runtime bundle into the docs site
  (`kubectl-doc-runtime.js`) is a maintenance and supply-chain consideration.
  It is pinned to v0.2.9 and Apache-2.0; provenance is recorded in the
  component README. Revisit if upstream stalls.
- Client-only rendering means no SSR content. The site uses Algolia DocSearch
  (index `vcluster`), which crawls rendered HTML, so fields that exist only
  inside the widget are absent from both site search and Google. The explorer's
  own in-tree filter is excellent; it is global search that regresses. This is
  the core reason the recommendation is augment, not replace: the accordions stay
  the indexed layer. If the explorer page itself must be findable, emit a plain
  SSR text block (field paths plus descriptions) from the same payload so the
  crawler indexes it while the interactive widget renders on top.
- `oneOf`/`anyOf`/`allOf` collapse in the CRD adapter is lossy for polymorphic
  fields. Audit the full schema before extending beyond the pilot sections.

## Files

- `hack/vcluster/schema-explorer/make-crd.mjs`: JSON Schema section to
  structural CRD adapter. Nests the section under its real ancestor path so the
  rendered YAML keeps its structure (`sync:` -> `toHost:` -> `<fields>`).
- `hack/vcluster/schema-explorer/generate-payloads.mjs`: section generator. Runs
  make-crd + kubectl-doc, strips the CRD frame, and writes per-section payloads
  to `static/schema-explorer/vcluster/` as fetchable assets.
- `hack/vcluster/schema-explorer/example-synthetic-crd.yaml`: generated CRD for
  `sync.toHost.pods`.
- `src/components/kubectl-doc/`: vendored component (see its README),
  `LazySchemaExplorer` (runtime fetch), and `MountWhenVisible` (defer to tab open).
- `static/schema-explorer/vcluster/sync/toHost.explorer.json`: the `sync/to-host`
  page payload, fetched at runtime rather than bundled into the route chunk.
- `src/pages/kubectl-doc-prototype.jsx`: sandbox page, not in any sidebar
  (excluded from the sitemap via `ignorePatterns`).
