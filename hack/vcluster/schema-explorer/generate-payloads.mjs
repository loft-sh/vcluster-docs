#!/usr/bin/env node
// generate-payloads.mjs
//
// Automation that produces committed KubeSchemaDocument payloads for the
// vcluster.yaml schema explorer, one per configured section, from the released
// vCluster JSON Schema (chart/values.schema.json, shipped per release).
//
// Pipeline per section:
//   1. make-crd.mjs  : JSON Schema section -> synthetic structural CRD.
//   2. kubectl-doc   : CRD -> markdown-fern -> *-full.json (complete payload).
//   3. stripFrame    : drop the Kubernetes resource frame (apiVersion/kind/
//                      metadata/spec) and re-root the tree at the section, so a
//                      vcluster.yaml page shows real config paths, not k8s noise.
//
// The kubectl-doc binary is the actual upstream renderer, so the lines[] tokens
// are faithful by construction (no hand-rolled YAML tokenizer). Pin it with
//   go install github.com/sttts/kubectl-doc/cmd/kubectl-doc@v0.2.9
//
// Dependency-free except for the kubectl-doc binary on PATH (or GOPATH/bin).
// Node >= 18. ESM.
//
// Usage:
//   node generate-payloads.mjs [--schema <schema.json>] [--out <dir>] [--section <dotted.path>]
//
// Payloads are written under static/ so the docs page fetches them at runtime
// (see src/components/kubectl-doc/LazySchemaExplorer.jsx) instead of importing
// them into the route JS chunk. A static import would ship the whole payload on
// first page load, before the reader ever opens the Explorer tab.
//
// Defaults target the `next` docs version from the in-repo schema snapshot. The
// release pipeline overrides --schema (released chart/values.schema.json) and
// --out (per-version static dir), mirroring hack/vcluster/partials/main.go.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const MAKE_CRD = join(HERE, "make-crd.mjs");

// ---------------------------------------------------------------------------
// Sections to surface. Each becomes <out>/<path-as-dirs>.explorer.json, served
// as a static asset and fetched by the Explorer tab at runtime. Keep to
// union-free sections until the oneOf/anyOf/allOf collapse in make-crd is
// replaced (see EVALUATION.md).
// ---------------------------------------------------------------------------
const SECTIONS = [
  { path: "sync.toHost", kind: "SyncToHost" },
];

// ---------------------------------------------------------------------------
// CLI args.
// ---------------------------------------------------------------------------
function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const schemaPath = resolve(arg("schema", "configsrc/vcluster/main/vcluster.schema.json"));
const outDir = resolve(arg("out", "static/schema-explorer/vcluster"));
const onlySection = arg("section", null);

// ---------------------------------------------------------------------------
// kubectl-doc binary resolution.
// ---------------------------------------------------------------------------
function resolveKubectlDoc() {
  try {
    return execFileSync("which", ["kubectl-doc"], { encoding: "utf8" }).trim();
  } catch {
    // fall through to GOPATH/bin
  }
  try {
    const gopath = execFileSync("go", ["env", "GOPATH"], { encoding: "utf8" }).trim();
    const candidate = join(gopath, "bin", "kubectl-doc");
    if (existsSync(candidate)) return candidate;
  } catch {
    // ignore
  }
  throw new Error(
    "kubectl-doc not found. Install it with:\n" +
      "  go install github.com/sttts/kubectl-doc/cmd/kubectl-doc@v0.2.9",
  );
}

// ---------------------------------------------------------------------------
// Strip the Kubernetes resource frame; keep the real config tree.
//
// kubectl-doc renders a CRD as apiVersion / kind / metadata / spec. make-crd
// nests the section under its real ancestor path inside spec (spec.sync.toHost.*),
// so the config lives one level under spec. We drop every line and field up to
// and including the `spec` node, lift the remaining subtree up one indent level,
// and strip the leading "spec." path segment. What remains renders as the YAML a
// user writes (sync: -> toHost: -> <fields>) with copy-paste-ready vcluster.yaml
// paths in the details panel (e.g. sync.toHost.pods.enabled).
//
// detailId (lines) and id (fields) are opaque and stay untouched, so the
// line<->field linking the runtime relies on remains consistent.
// ---------------------------------------------------------------------------
function dedentToken(tokens) {
  if (!Array.isArray(tokens) || tokens.length === 0) return tokens;
  const first = tokens[0];
  // The leading indent token is pure whitespace ({ t: "  " }, no kind). Remove
  // exactly one level (2 spaces). Drop it entirely if nothing remains.
  if (first && first.k === undefined && typeof first.t === "string" && first.t.trim() === "") {
    const lifted = first.t.startsWith("  ") ? first.t.slice(2) : first.t;
    if (lifted === "") return tokens.slice(1);
    return [{ ...first, t: lifted }, ...tokens.slice(1)];
  }
  return tokens;
}

function dedentCommentPrefix(prefix) {
  if (typeof prefix !== "string") return prefix;
  return prefix.startsWith("  ") ? prefix.slice(2) : prefix;
}

function rewritePath(p) {
  if (typeof p !== "string") return p;
  if (p === "spec") return "";
  if (p.startsWith("spec.")) return p.slice("spec.".length);
  return p;
}

function stripFrame(payload, sectionPath) {
  // The `spec` node itself spans multiple lines (a wrapped comment block plus
  // the `spec:` code line), so slicing at the first `path === "spec"` line would
  // leak the `spec:` line. Cut at the first DESCENDANT instead: the first line
  // whose path starts with "spec." is unambiguously the start of the subtree we
  // keep. `spec` is the last top-level node (the synthetic CRD has no status),
  // so this is a clean contiguous suffix.
  const startIdx = payload.lines.findIndex((ln) => typeof ln.path === "string" && ln.path.startsWith("spec."));
  if (startIdx === -1) {
    throw new Error("no `spec.*` lines found; unexpected payload shape");
  }

  const lines = [];
  for (let i = startIdx; i < payload.lines.length; i++) {
    const ln = { ...payload.lines[i] };
    if (typeof ln.depth === "number" && ln.depth > 0) ln.depth -= 1;
    if (ln.tokens) ln.tokens = dedentToken(ln.tokens);
    if (ln.comment) {
      ln.comment = {
        ...ln.comment,
        prefix: dedentCommentPrefix(ln.comment.prefix),
        wrapPrefix: dedentCommentPrefix(ln.comment.wrapPrefix),
      };
    }
    ln.path = rewritePath(ln.path);
    ln.index = lines.length; // re-number sequentially
    lines.push(ln);
  }

  const fields = payload.fields
    .filter((f) => {
      const p = f.path;
      if (p === "apiVersion" || p === "kind" || p === "spec") return false;
      if (p === "metadata" || (typeof p === "string" && p.startsWith("metadata."))) return false;
      return typeof p === "string" && p.startsWith("spec.");
    })
    .map((f) => ({ ...f, path: rewritePath(f.path) }));

  return {
    apiVersion: "",
    group: payload.group ?? "",
    version: payload.version ?? "",
    kind: sectionPath,
    resource: "",
    complete: true,
    lines,
    fields,
  };
}

// ---------------------------------------------------------------------------
// Generate one section.
// ---------------------------------------------------------------------------
function generate(section, kubectlDoc) {
  const work = mkdtempSync(join(tmpdir(), "kdoc-gen-"));
  try {
    const crd = join(work, "crd.yaml");
    execFileSync("node", [MAKE_CRD, schemaPath, section.path, section.kind, crd], { stdio: ["ignore", "ignore", "inherit"] });

    const out = join(work, "out");
    execFileSync(
      kubectlDoc,
      ["-f", crd, "-o", "markdown-fern", "--fern-schema-dir", out, "--fern-schema-url-path", ".", "--version", "v1alpha1"],
      { stdio: ["ignore", "ignore", "inherit"] },
    );

    const full = readdirSync(out).find((f) => f.endsWith("-full.json"));
    if (!full) throw new Error(`no *-full.json produced for ${section.path}`);
    const raw = JSON.parse(readFileSync(join(out, full), "utf8"));
    const stripped = stripFrame(raw, section.path);

    const dest = join(outDir, ...section.path.split(".")) + ".explorer.json";
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, JSON.stringify(stripped, null, 2) + "\n");

    process.stderr.write(
      `wrote ${dest}\n  section: ${section.path}  lines: ${stripped.lines.length}  fields: ${stripped.fields.length}\n`,
    );
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

// ---------------------------------------------------------------------------
// Run.
// ---------------------------------------------------------------------------
const kubectlDoc = resolveKubectlDoc();
const targets = onlySection ? SECTIONS.filter((s) => s.path === onlySection) : SECTIONS;
if (targets.length === 0) {
  process.stderr.write(`no matching section for --section ${onlySection}\n`);
  process.exit(1);
}
for (const section of targets) generate(section, kubectlDoc);
