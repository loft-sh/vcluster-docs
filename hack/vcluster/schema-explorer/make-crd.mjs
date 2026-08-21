#!/usr/bin/env node
// make-crd.mjs
//
// Convert one section of the vCluster JSON Schema (draft 2020-12, $defs/$ref)
// into a Kubernetes STRUCTURAL CustomResourceDefinition manifest that
// kubectl-doc can ingest via `-f`.
//
// Pipeline:
//   1. Load vcluster.schema.json.
//   2. Walk a dotted path from the root (resolving $ref hops) to the target subtree.
//   3. Recursively inline every $ref against #/$defs, cutting cycles
//      (a back-reference to an ancestor def becomes {type: object,
//       x-kubernetes-preserve-unknown-fields: true}).
//   4. Sanitize each node into a structural-schema-legal shape: guarantee
//      `type`, keep validation keywords, convert patternProperties->additionalProperties,
//      drop draft-2020-12-only / unsupported keywords (oneOf/anyOf/allOf/$ref/$defs/etc).
//   5. Wrap the result under spec and emit a v1 CRD YAML.
//
// Dependency-free. Node >= 18 (uses structuredClone). ESM.
//
// Usage:
//   node make-crd.mjs <schema.json> <dotted.path> <Kind> <out-crd.yaml>
// Example:
//   node make-crd.mjs vcluster.schema.json sync.toHost.pods SyncToHostPods synthetic-crd.yaml

import { readFileSync, writeFileSync } from "node:fs";

// ---------------------------------------------------------------------------
// CLI args (with sensible defaults for the SyncPods prototype).
// ---------------------------------------------------------------------------
const [, , schemaPathArg, dottedPathArg, kindArg, outPathArg] = process.argv;
const schemaPath = schemaPathArg ?? "vcluster.schema.json";
const dottedPath = dottedPathArg ?? "sync.toHost.pods";
const kind = kindArg ?? "SyncToHostPods";
const outPath = outPathArg ?? "synthetic-crd.yaml";

const GROUP = "config.vcluster.com";
const VERSION = "v1alpha1";

const root = JSON.parse(readFileSync(schemaPath, "utf8"));
const defs = root.$defs ?? root.definitions ?? {};

// ---------------------------------------------------------------------------
// $ref helpers.
// ---------------------------------------------------------------------------
// Resolve a "#/$defs/Name" pointer to the def name, or null if not such a ref.
function refDefName(ref) {
  if (typeof ref !== "string") return null;
  const m = ref.match(/^#\/(?:\$defs|definitions)\/(.+)$/);
  return m ? decodeURIComponent(m[1]) : null;
}

// Follow $ref hops at the top of a node until we reach a concrete schema object.
// Returns the resolved schema (still possibly containing nested $refs).
function deref(node) {
  let cur = node;
  const seen = new Set();
  while (cur && typeof cur === "object" && typeof cur.$ref === "string") {
    const name = refDefName(cur.$ref);
    if (name == null || !(name in defs)) {
      throw new Error(`cannot resolve $ref: ${cur.$ref}`);
    }
    if (seen.has(name)) {
      // self-cycle at the head: bail to an opaque object.
      return { type: "object" };
    }
    seen.add(name);
    // Merge sibling keywords (e.g. description) over the target.
    const { $ref, ...siblings } = cur;
    cur = { ...structuredClone(defs[name]), ...siblings };
  }
  return cur;
}

// ---------------------------------------------------------------------------
// Navigate the dotted path from the root to the target subtree. Also collect
// the description of each ancestor segment (every segment except the last) so
// the synthetic wrapper nodes can carry the real `sync:`/`toHost:` docs.
// ---------------------------------------------------------------------------
function navigate(startPath) {
  const segs = startPath.split(".");
  let node = deref(root);
  const ancestorDescriptions = [];
  for (let i = 0; i < segs.length; i++) {
    const seg = segs[i];
    if (!node.properties || !(seg in node.properties)) {
      throw new Error(`path segment "${seg}" not found while walking ${startPath}`);
    }
    node = deref(node.properties[seg]);
    if (i < segs.length - 1) {
      ancestorDescriptions.push(typeof node.description === "string" ? node.description : undefined);
    }
  }
  return { node, ancestorDescriptions };
}

// ---------------------------------------------------------------------------
// Recursive inliner. `stack` carries the set of def names currently being
// expanded along this branch so a back-reference can be cut into an opaque
// object instead of recursing forever.
// ---------------------------------------------------------------------------
function inline(node, stack) {
  if (Array.isArray(node)) return node.map((n) => inline(n, stack));
  if (!node || typeof node !== "object") return node;

  // Head $ref: detect cycle, then expand.
  if (typeof node.$ref === "string") {
    const name = refDefName(node.$ref);
    if (name != null) {
      if (stack.has(name)) {
        // Cut the cycle. Preserve description if the ref carried one.
        const cut = { type: "object", "x-kubernetes-preserve-unknown-fields": true };
        if (node.description) cut.description = node.description;
        return cut;
      }
      const target = defs[name];
      if (!target) throw new Error(`cannot resolve $ref: ${node.$ref}`);
      const { $ref, ...siblings } = node;
      const merged = { ...structuredClone(target), ...siblings };
      const nextStack = new Set(stack);
      nextStack.add(name);
      return inline(merged, nextStack);
    }
  }

  // Plain object: recurse into every value.
  const out = {};
  for (const [k, v] of Object.entries(node)) {
    out[k] = inline(v, stack);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Structural-schema sanitizer.
// Upstream k8s NewStructural rejects: $ref/$defs/$schema/$id, oneOf/anyOf/allOf/not,
// patternProperties, and nodes lacking a `type`. It also forbids
// additionalProperties together with a non-empty properties map.
// ---------------------------------------------------------------------------
const KEEP = new Set([
  "type", "description", "title", "default", "enum", "format",
  "properties", "items", "additionalProperties", "required", "nullable",
  "maximum", "minimum", "exclusiveMaximum", "exclusiveMinimum",
  "maxLength", "minLength", "pattern", "maxItems", "minItems", "uniqueItems",
  "multipleOf", "maxProperties", "minProperties",
]);

// Structural-schema legal x-kubernetes extensions worth preserving.
const KEEP_X = new Set([
  "x-kubernetes-preserve-unknown-fields",
  "x-kubernetes-int-or-string",
  "x-kubernetes-embedded-resource",
  "x-kubernetes-list-type",
  "x-kubernetes-list-map-keys",
  "x-kubernetes-map-type",
]);

function inferType(node) {
  if (node.properties) return "object";
  if (node.additionalProperties || node.patternProperties) return "object";
  if (node.items) return "array";
  if (Array.isArray(node.enum) && node.enum.length) {
    const t = typeof node.enum[0];
    if (t === "string") return "string";
    if (t === "boolean") return "boolean";
    if (t === "number") return Number.isInteger(node.enum[0]) ? "integer" : "number";
  }
  return "string"; // last-resort scalar so the node stays structural.
}

function sanitize(node) {
  if (!node || typeof node !== "object") return node;

  const out = {};
  for (const [k, v] of Object.entries(node)) {
    if (KEEP_X.has(k)) { out[k] = v; continue; }
    if (!KEEP.has(k)) continue; // drop $ref/$defs/$schema/$id/oneOf/anyOf/allOf/not/etc.

    if (k === "properties") {
      const props = {};
      for (const [pk, pv] of Object.entries(v)) props[pk] = sanitize(pv);
      out.properties = props;
    } else if (k === "items") {
      out.items = Array.isArray(v) ? sanitize(v[0]) : sanitize(v);
    } else if (k === "additionalProperties") {
      out.additionalProperties = typeof v === "boolean" ? v : sanitize(v);
    } else {
      out[k] = v;
    }
  }

  // patternProperties: collapse the single ".*" / catch-all into additionalProperties.
  if (node.patternProperties && out.additionalProperties === undefined) {
    const patterns = Object.values(node.patternProperties);
    if (patterns.length) out.additionalProperties = sanitize(patterns[0]);
  }

  // Guarantee a type on every node (structural-schema requirement), unless the
  // node opts out via x-kubernetes-preserve-unknown-fields / int-or-string.
  if (out.type === undefined &&
      !out["x-kubernetes-preserve-unknown-fields"] &&
      !out["x-kubernetes-int-or-string"]) {
    out.type = inferType(node);
  }

  // additionalProperties:false alongside properties is legal and intended
  // (closed object). But additionalProperties as a *schema* may not coexist
  // with a non-empty properties map under NewStructural. Resolve the conflict
  // in favor of declared properties.
  if (out.properties && Object.keys(out.properties).length > 0 &&
      out.additionalProperties && typeof out.additionalProperties === "object") {
    delete out.additionalProperties;
  }

  // An object with neither properties nor additionalProperties is a free-form
  // map; mark it so it stays structural rather than an empty closed object.
  if (out.type === "object" &&
      !out.properties &&
      out.additionalProperties === undefined &&
      !out["x-kubernetes-preserve-unknown-fields"]) {
    out["x-kubernetes-preserve-unknown-fields"] = true;
  }

  return out;
}

// ---------------------------------------------------------------------------
// Minimal YAML emitter (objects, arrays, scalars). Enough for a CRD manifest.
// ---------------------------------------------------------------------------
function yamlScalar(v) {
  if (v === null) return "null";
  if (typeof v === "boolean" || typeof v === "number") return String(v);
  const s = String(v);
  // Always quote strings to dodge YAML type coercion and special chars
  // (newlines in descriptions, leading symbols, "true"/"123"-looking values).
  return JSON.stringify(s);
}

function yamlEmit(value, indent) {
  const pad = "  ".repeat(indent);
  if (Array.isArray(value)) {
    if (value.length === 0) return `${pad}[]\n`;
    let s = "";
    for (const item of value) {
      if (item && typeof item === "object") {
        const body = yamlEmit(item, indent + 1);
        // splice the dash onto the first emitted line
        const firstNL = body.indexOf("\n");
        const firstLine = body.slice(0, firstNL).trimStart();
        const rest = body.slice(firstNL + 1);
        s += `${pad}- ${firstLine}\n${rest}`;
      } else {
        s += `${pad}- ${yamlScalar(item)}\n`;
      }
    }
    return s;
  }
  if (value && typeof value === "object") {
    const keys = Object.keys(value);
    if (keys.length === 0) return `${pad}{}\n`;
    let s = "";
    for (const k of keys) {
      const v = value[k];
      if (v && typeof v === "object" && (Array.isArray(v) ? v.length : Object.keys(v).length)) {
        s += `${pad}${k}:\n${yamlEmit(v, indent + 1)}`;
      } else if (v && typeof v === "object") {
        s += `${pad}${k}: ${Array.isArray(v) ? "[]" : "{}"}\n`;
      } else {
        s += `${pad}${k}: ${yamlScalar(v)}\n`;
      }
    }
    return s;
  }
  return `${pad}${yamlScalar(value)}\n`;
}

// ---------------------------------------------------------------------------
// Build it.
// ---------------------------------------------------------------------------
const { node: subtree, ancestorDescriptions } = navigate(dottedPath);
const inlined = inline(subtree, new Set());
const sectionSchema = sanitize(inlined);

// Nest the section under its real ancestor path inside spec, so kubectl-doc
// renders the YAML a user actually writes (sync: -> toHost: -> <fields>) rather
// than hoisting the section's children to the document root. Wrapping the tree
// here keeps the rendered lines faithful (kubectl-doc still does all tokenizing;
// nothing is hand-built) and lets generate-payloads.mjs simply drop the CRD
// frame and the leading `spec.` path segment. Each wrapper carries its real
// schema description so the intermediate keys stay clickable.
const segs = dottedPath.split(".");
let nested = sectionSchema; // value of the leaf segment (segs[last])
for (let i = segs.length - 1; i >= 1; i--) {
  const wrapper = { type: "object", properties: { [segs[i]]: nested } };
  const desc = ancestorDescriptions[i - 1];
  if (desc) wrapper.description = desc;
  nested = wrapper;
}
const specSchema = { type: "object", properties: { [segs[0]]: nested } };

const plural = kind.toLowerCase() + "s";
const singular = kind.toLowerCase();
const listKind = kind + "List";

const crd = {
  apiVersion: "apiextensions.k8s.io/v1",
  kind: "CustomResourceDefinition",
  metadata: { name: `${plural}.${GROUP}` },
  spec: {
    group: GROUP,
    names: { kind, listKind, plural, singular },
    scope: "Namespaced",
    versions: [
      {
        name: VERSION,
        served: true,
        storage: true,
        schema: {
          openAPIV3Schema: {
            type: "object",
            properties: { spec: specSchema },
          },
        },
      },
    ],
  },
};

writeFileSync(outPath, yamlEmit(crd, 0));

// Diagnostics to stderr (keeps stdout clean if ever piped).
const sectionProps = Object.keys(sectionSchema.properties ?? {});
process.stderr.write(
  `wrote ${outPath}\n` +
  `  section: ${dottedPath}  kind: ${kind}\n` +
  `  nested under spec as: spec.${dottedPath}\n` +
  `  ${dottedPath}.properties (${sectionProps.length}): ${sectionProps.join(", ")}\n`,
);
