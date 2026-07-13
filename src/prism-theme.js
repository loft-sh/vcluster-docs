/**
 * vCluster brand-aligned Prism syntax highlighting theme.
 *
 * Background: #312727 (dark warm brown - from loft-enterprise Figma design tokens)
 * Plain text: #eceaea (foreground - warm near-white default)
 *
 * Token palette sourced from loft-enterprise terminal Figma design tokens,
 * mapped by hue to preserve color intent:
 *   foreground   #eceaea  plain text / default fallback
 *   brightBlue   #6eb2fe  strings / inserted diffs (sky blue, hue ~212 deg)
 *   brightYellow #f9905c  numbers, booleans, variables (warm orange, hue ~20 deg)
 *   brightWhite  #faf8f8  keywords, tags, properties, command names
 *   white        #b7b5b5  operators (slightly dimmed, low visual noise)
 *   yellow       #f86f1f  shebangs, YAML anchors (rare, high-signal)
 *   brightBlack  #6e6a6a  comments, punctuation, null (muted gray)
 *
 * @type {import('prism-react-renderer').PrismTheme}
 */
const vClusterTheme = {
  plain: {
    color: "#eceaea",
    backgroundColor: "#312727",
  },
  styles: [
    // ── De-emphasized structural characters ─────────────────────────────────
    {
      types: ["comment", "prolog", "doctype", "cdata"],
      style: { color: "#6e6a6a", fontStyle: "italic" },
    },
    {
      types: ["punctuation"],
      style: { color: "#6e6a6a" },
    },
    {
      types: ["null", "undefined"],
      style: { color: "#6e6a6a" },
    },

    // ── Strings and inserted diff lines — sky blue ──────────────────────────
    {
      types: ["string", "char", "inserted", "attr-value"],
      style: { color: "#6eb2fe" },
    },

    // ── Literal values — warm orange ────────────────────────────────────────
    // numbers, booleans, $VARIABLES, regex patterns
    {
      types: ["number", "boolean", "variable", "regex"],
      style: { color: "#f9905c" },
    },

    // ── Structural keywords and tags ─────────────────────────────────────────
    // bash: if / for / do / fi / while; YAML tags; CSS selectors
    {
      types: ["keyword", "tag", "selector"],
      style: { color: "#faf8f8" },
    },

    // ── Properties and command names — bright white ──────────────────────────
    // YAML mapping keys (key + attr-name), object properties, class names,
    // and bash/HCL command/function names all share this shade
    {
      types: ["key", "attr-name", "property", "class-name", "namespace", "function", "builtin"],
      style: { color: "#faf8f8" },
    },

    // ── Operators — slightly dimmed, low visual noise ────────────────────────
    {
      types: ["operator"],
      style: { color: "#b7b5b5" },
    },

    // ── High-signal tokens — deep orange ────────────────────────────────────
    // shebangs (#!/bin/bash), YAML anchors (&anchor / *alias) — used sparingly
    {
      types: ["important"],
      style: { color: "#f86f1f", fontWeight: "bold" },
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
      style: { color: "#e47c72" },
    },

    // ── URLs ────────────────────────────────────────────────────────────────
    {
      types: ["url"],
      style: { color: "#f86f1f" },
    },
  ],
};

export default vClusterTheme;
