/**
 * vCluster brand-aligned Prism syntax highlighting theme.
 *
 * Background: Black Pearl (#050B24)
 * Plain text: #CDD3DE (cool near-white, easy on the eyes)
 *
 * Token palette — five deliberate choices:
 *   Sky blue     #48B5FF  strings / inserted diffs (matches vcluster.com highlight.js)
 *   Light orange #FFA366  numbers, booleans, variables (literal values)
 *   White        #FFFFFF  keywords, tags (structural / declarative tokens)
 *   Pale orange  #FFE0CC  YAML keys, bash commands, class names (brand family, readable)
 *   Blaze Orange #FF6600  shebangs, YAML anchors (rare, maximum signal)
 *   Slate       #7B8BB2  comments, punctuation, null (muted / de-emphasized)
 *
 * @type {import('prism-react-renderer').PrismTheme}
 */
const vClusterTheme = {
  plain: {
    color: "#CDD3DE",
    backgroundColor: "#050B24",
  },
  styles: [
    // ── De-emphasized structural characters ─────────────────────────────────
    {
      types: ["comment", "prolog", "doctype", "cdata"],
      style: { color: "#7B8BB2", fontStyle: "italic" },
    },
    {
      types: ["punctuation"],
      style: { color: "#7B8BB2" },
    },
    {
      types: ["null", "undefined"],
      style: { color: "#7B8BB2" },
    },

    // ── Strings and inserted diff lines — soft teal ─────────────────────────
    {
      types: ["string", "char", "inserted", "attr-value"],
      style: { color: "#48B5FF" },
    },

    // ── Literal values — Soft Orange ────────────────────────────────────────
    // numbers, booleans, $VARIABLES, regex patterns
    {
      types: ["number", "boolean", "variable", "regex"],
      style: { color: "#FFA366" },
    },

    // ── Structural keywords and tags — warm amber ───────────────────────────
    // bash: if / for / do / fi / while; YAML tags; CSS selectors
    {
      types: ["keyword", "tag", "selector"],
      style: { color: "#FFFFFF" },
    },

    // ── Properties and command names — pale orange ──────────────────────────
    // YAML mapping keys (key + attr-name), object properties, class names,
    // and bash/HCL command/function names all share this shade
    {
      types: ["key", "attr-name", "property", "class-name", "namespace", "function", "builtin"],
      style: { color: "#FFE0CC" },
    },

    // ── Operators — near-plain, low visual noise ────────────────────────────
    {
      types: ["operator"],
      style: { color: "#CDD3DE" },
    },

    // ── High-signal tokens — Blaze Orange ───────────────────────────────────
    // shebangs (#!/bin/bash), YAML anchors (&anchor / *alias) — used sparingly
    {
      types: ["important"],
      style: { color: "#FF6600", fontWeight: "bold" },
    },
    {
      types: ["bold"],
      style: { fontWeight: "bold" },
    },
    {
      types: ["italic"],
      style: { fontStyle: "italic" },
    },

    // ── Diff markers ────────────────────────────────────────────────────────
    {
      types: ["deleted"],
      style: { color: "#EF4444" },
    },

    // ── URLs ────────────────────────────────────────────────────────────────
    {
      types: ["url"],
      style: { color: "#FF6600" },
    },
  ],
};

export default vClusterTheme;
