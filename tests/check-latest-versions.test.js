/**
 * Unit tests for scripts/check-latest-versions.js.
 *
 * Uses Node's built-in test runner (node --test); no extra dependencies.
 * Run: node --test tests/check-latest-versions.test.js
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const {
  getMinor,
  parseLastVersions,
  applyUpdate,
  selectLatestPatch,
} = require('../scripts/check-latest-versions.js');

const ROOT = path.join(__dirname, '..');

function release(tag, { prerelease = false, draft = false } = {}) {
  return { tag_name: tag, prerelease, draft };
}

// Mirrors the shape of docusaurus.config.js: an unrelated plugin with its own
// lastVersion ahead of the two product plugins.
const CONFIG_FIXTURE = `
  plugins: [
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "docs",
        path: "docs",
        lastVersion: "current",
      },
    ],
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "vcluster",
        path: "vcluster",
        lastVersion: "0.38.0",
        versions: { "0.38.0": { label: "v0.38 Stable" } },
      },
    ],
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "platform",
        path: "platform",
        lastVersion: "4.13.0",
      },
    ],
  ],
`;

test('parseLastVersions reads each product plugin', () => {
  assert.deepEqual(parseLastVersions(CONFIG_FIXTURE), {
    vcluster: '0.38.0',
    platform: '4.13.0',
  });
});

test('parseLastVersions refuses to borrow the next plugin lastVersion', () => {
  const missing = CONFIG_FIXTURE.replace('lastVersion: "0.38.0",', '');
  assert.throws(() => parseLastVersions(missing), /'vcluster' docs plugin/);
});

test('parseLastVersions on the real config matches a cut docs version', () => {
  const config = fs.readFileSync(path.join(ROOT, 'docusaurus.config.js'), 'utf8');
  const last = parseLastVersions(config);
  const cut = {
    vcluster: JSON.parse(fs.readFileSync(path.join(ROOT, 'vcluster_versions.json'), 'utf8')),
    platform: JSON.parse(fs.readFileSync(path.join(ROOT, 'platform_versions.json'), 'utf8')),
  };
  for (const key of Object.keys(cut)) {
    assert.ok(cut[key].includes(last[key]), `${key} lastVersion ${last[key]} not in versions file`);
  }
});

test('selectLatestPatch follows the lastVersion minor past an older backport', () => {
  // v0.36.3 shipped after v0.37.2, which is what kept the file on 0.36.
  const releases = [release('v0.36.3'), release('v0.37.2'), release('v0.37.1'), release('v0.37.0')];
  assert.equal(selectLatestPatch(releases, getMinor('0.37.0')), '0.37.2');
});

test('selectLatestPatch orders patches numerically', () => {
  const releases = [release('v0.37.9'), release('v0.37.10'), release('v0.37.2')];
  assert.equal(selectLatestPatch(releases, '0.37'), '0.37.10');
});

test('selectLatestPatch ignores prereleases, drafts, and prerelease tags', () => {
  const releases = [
    release('v0.38.1', { prerelease: true }),
    release('v0.38.2', { draft: true }),
    release('v0.38.0-rc.1'),
    release('v0.38.0-next.3'),
    release('v0.38.0'),
  ];
  assert.equal(selectLatestPatch(releases, '0.38'), '0.38.0');
});

test('selectLatestPatch returns null for a minor with no stable release', () => {
  const releases = [release('v0.38.0-rc.1'), release('v0.37.2')];
  assert.equal(selectLatestPatch(releases, '0.38'), null);
});

test('applyUpdate rewrites versions and keeps the comment banner', () => {
  const content = `${JSON.stringify({ _comment: 'keep me', platform: '4.11.3', vcluster: '0.36.3' }, null, 2)}\n`;
  const next = JSON.parse(applyUpdate(content, { platform: '4.12.1', vcluster: '0.37.2' }));
  assert.deepEqual(next, { _comment: 'keep me', platform: '4.12.1', vcluster: '0.37.2' });
});
