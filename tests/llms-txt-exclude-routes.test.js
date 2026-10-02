/**
 * Tests the llms-txt plugin's excludeRoutes in docusaurus.config.js against
 * the plugin's own matcher, so a pattern that matches nothing fails here
 * instead of shipping an oversized llms.txt.
 *
 * Needs node_modules (npm ci). Uses Node's built-in test runner.
 * Run: node --test tests/llms-txt-exclude-routes.test.js
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// The plugin ships extensionless ESM under lib/, so load it the way
// Docusaurus does, through jiti.
const jiti = require('jiti')(__filename);
const { createExclusionMatcher, isRouteExcluded } = jiti(
  path.join(ROOT, 'node_modules/@signalwire/docusaurus-plugin-llms-txt/lib/discovery/exclusion-matcher.js')
);

// Read as text: loading the config would pull in every plugin it imports.
function readExcludeRoutes() {
  const config = fs.readFileSync(path.join(ROOT, 'docusaurus.config.js'), 'utf8');
  const block = config.match(/\bexcludeRoutes:\s*\[([\s\S]*?)\]/);
  assert.ok(block, 'excludeRoutes not found in docusaurus.config.js');
  const body = block[1].replace(/^\s*\/\/.*$/gm, '');
  return [...body.matchAll(/'([^']+)'/g)].map((m) => m[1]);
}

const patterns = readExcludeRoutes();
const matcher = createExclusionMatcher(patterns);

const AGGREGATES = [
  '/docs/vcluster/configure/vcluster-yaml',
  '/docs/vcluster/configure/vcluster-yaml/sync',
  '/docs/platform/api/resources/project/templates',
];

test('aggregate reference pages are excluded', () => {
  for (const route of AGGREGATES) {
    assert.ok(isRouteExcluded(route, matcher), `${route} is not excluded`);
  }
});

test('sub-pages of the aggregate pages stay indexed', () => {
  const kept = [
    '/docs/vcluster/configure/vcluster-yaml/control-plane',
    '/docs/vcluster/configure/vcluster-yaml/sync/from-host/nodes',
    '/docs/vcluster/configure/vcluster-yaml/sync/to-host/core/pods',
    '/docs/platform/api/resources/project/members',
  ];
  for (const route of kept) {
    assert.equal(isRouteExcluded(route, matcher), false, `${route} is excluded`);
  }
});

test('each exact excludeRoutes entry names a docs page that exists', () => {
  // A pattern with no glob characters must equal a real route. Map it back
  // to its source file so a moved page or a stray regex anchor fails here.
  for (const pattern of patterns.filter((p) => !/[*?[\]{}()!]/.test(p))) {
    const m = pattern.match(/^\/docs\/(vcluster|platform)\/(.+)$/);
    assert.ok(m, `${pattern} is outside the vcluster and platform docs`);
    const base = path.join(ROOT, m[1], m[2]);
    const sources = [`${base}.mdx`, `${base}.md`, path.join(base, 'README.mdx')];
    assert.ok(sources.some((s) => fs.existsSync(s)), `${pattern} has no source page`);
  }
});

test('no excludeRoutes entry uses a regex anchor', () => {
  // The plugin compiles entries with micromatch, where `$` is a literal.
  for (const pattern of patterns) {
    assert.ok(!pattern.endsWith('$'), `${pattern} ends with a regex anchor`);
  }
});
