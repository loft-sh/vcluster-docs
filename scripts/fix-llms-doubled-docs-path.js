#!/usr/bin/env node
/**
 * Post-build fix for DOC-1330.
 *
 * Why this exists
 * ---------------
 * The `@signalwire/docusaurus-plugin-llms-txt@1.2.2` plugin, when configured
 * with `relativePaths: false` (required by ENGAI-58 / PR #1914 so that
 * `llms-full.txt` carries absolute URLs for the R2R RAG pipeline), is not
 * idempotent when the site lives under a non-root `baseUrl`.
 *
 * For this site:
 *   - `url`     = https://www.vcluster.com
 *   - `baseUrl` = /docs/
 *   - `siteUrl` (derived) = https://www.vcluster.com/docs
 *
 * Docusaurus feeds the plugin route paths that already include the
 * `baseUrl` prefix (e.g. `/docs/vcluster/.../sleep`). The plugin then
 * joins that with the derived `siteUrl`, producing
 * `https://www.vcluster.com/docs/docs/vcluster/.../sleep.md` — a doubled
 * `/docs/docs/` segment that 404s when followed.
 *
 * Upstream stable 1.x has no config option to disable the extra join,
 * and the only newer release is `2.0.0-alpha.*`, a major-version rewrite
 * with a breaking options schema. Bumping to 2.x or patching upstream is
 * the long-term path; this script is the minimal, surgical fix that
 * unblocks agents today.
 *
 * What this script does
 * ---------------------
 * 1. Walk the Docusaurus build output and rewrite the literal substring
 *    `/docs/docs/` → `/docs/` inside `.md` page bodies and the top-level
 *    `llms.txt` / `llms-full.txt` files. No other files are touched —
 *    HTML, JS, and assets are left alone.
 * 2. After rewriting, re-scan the same files to confirm no `/docs/docs/`
 *    substring remains. Exits non-zero if any is left, so a future
 *    plugin change that emits the bug in a new shape breaks CI
 *    immediately instead of shipping silently. This doubles as the
 *    DOC-1330 regression check.
 *
 * Safety
 * ------
 * The pattern `/docs/docs/` is only ever produced by the doubled-prefix
 * bug; a repo-wide grep across `.md` and `.mdx` source files confirms
 * zero legitimate matches (see DOC-1330 for the full analysis).
 * Absolute URLs of the form `https://www.vcluster.com/docs/...` continue
 * to work, so the ENGAI-58 regression check still passes.
 *
 * Remove this script when the plugin is upgraded past the doubled-prefix
 * bug and the `postbuild` hook in `package.json` is dropped.
 */

const fs = require('fs');
const path = require('path');

const BUILD_DIR = path.resolve(__dirname, '..', 'build');
const DOUBLED = '/docs/docs/';
const FIXED = '/docs/';

// Files we touch: generated markdown pages and the llms index files.
// Anything else (HTML, JS, CSS, assets) is left untouched.
function shouldRewrite(filePath) {
  if (filePath.endsWith('.md')) return true;
  const base = path.basename(filePath);
  return base === 'llms.txt' || base === 'llms-full.txt';
}

function* walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else if (entry.isFile()) {
      yield full;
    }
  }
}

function rewriteFile(filePath) {
  const original = fs.readFileSync(filePath, 'utf8');
  if (!original.includes(DOUBLED)) return 0;
  // Global literal replacement — `/docs/docs/` only ever appears as the
  // plugin's doubled-prefix bug output.
  const updated = original.split(DOUBLED).join(FIXED);
  const occurrences = (original.length - updated.length) / (DOUBLED.length - FIXED.length);
  fs.writeFileSync(filePath, updated);
  return occurrences;
}

function main() {
  if (!fs.existsSync(BUILD_DIR)) {
    console.error(`[fix-llms-doubled-docs-path] build dir not found: ${BUILD_DIR}`);
    process.exit(1);
  }

  let filesScanned = 0;
  let filesModified = 0;
  let totalReplacements = 0;

  for (const filePath of walk(BUILD_DIR)) {
    if (!shouldRewrite(filePath)) continue;
    filesScanned += 1;
    const count = rewriteFile(filePath);
    if (count > 0) {
      filesModified += 1;
      totalReplacements += count;
    }
  }

  console.log(
    `[fix-llms-doubled-docs-path] scanned ${filesScanned} file(s), ` +
      `modified ${filesModified} with ${totalReplacements} replacement(s)`,
  );

  // Regression check: after the rewrite pass, no eligible file should
  // still contain `/docs/docs/`. If this ever fails, either the rewrite
  // logic regressed or the plugin started emitting the bug in a new
  // shape — either way, we want CI red, not a silent 404 in prod.
  const stragglers = [];
  for (const filePath of walk(BUILD_DIR)) {
    if (!shouldRewrite(filePath)) continue;
    const contents = fs.readFileSync(filePath, 'utf8');
    if (contents.includes(DOUBLED)) {
      stragglers.push(path.relative(BUILD_DIR, filePath));
    }
  }
  if (stragglers.length > 0) {
    console.error(
      `[fix-llms-doubled-docs-path] regression: ${stragglers.length} file(s) ` +
        `still contain "${DOUBLED}" after rewrite:`,
    );
    for (const rel of stragglers.slice(0, 10)) console.error(`  - ${rel}`);
    if (stragglers.length > 10) {
      console.error(`  ... and ${stragglers.length - 10} more`);
    }
    process.exit(1);
  }
}

main();
