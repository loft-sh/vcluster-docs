/** CLI regression tests. Run: node --test tests/sync-upstream-features.test.js */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const yaml = require('js-yaml');

const tiers = ['free', 'dev', 'prod', 'scale'];

function fixture(t, { upstream = [], plans = {}, features = {}, assignments = {} } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sync-upstream-features-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  for (const dir of ['scripts', 'src/data', 'bin']) fs.mkdirSync(path.join(root, dir), { recursive: true });
  const script = path.join(root, 'scripts/sync-upstream-features.js');
  fs.copyFileSync(path.join(__dirname, '../scripts/sync-upstream-features.js'), script);
  const files = Object.fromEntries(tiers.map(tier => [
    `repos/loft-sh/plans/contents/${tier}.yaml`,
    { features: Object.fromEntries((plans[tier] || []).map(id => [id, 'active'])) },
  ]));
  files['repos/loft-sh/admin-apis/contents/definitions/features.yaml'] = { features: upstream };
  const encoded = Object.fromEntries(Object.entries(files).map(([key, value]) => [
    key, Buffer.from(yaml.dump(value)).toString('base64'),
  ]));
  fs.writeFileSync(path.join(root, 'bin/gh'), `#!${process.execPath}\nconst files = ${JSON.stringify(encoded)};\nconst value = files[process.argv[3]];\nif (!value) process.exit(2);\nprocess.stdout.write(value);\n`, { mode: 0o755 });
  const locations = ['features', 'products'].map(name => path.join(root, `src/data/${name}.yaml`));
  fs.writeFileSync(locations[0], yaml.dump({ features }));
  fs.writeFileSync(locations[1], yaml.dump({ products: Object.fromEntries(tiers.map(tier => [
    tier, { name: tier, features: assignments[tier] || [] },
  ])) }));
  return {
    run: (...args) => spawnSync(process.execPath, [script, ...args], {
      encoding: 'utf8', timeout: 10000,
      env: { ...process.env, PATH: `${path.join(root, 'bin')}${path.delimiter}${process.env.PATH}`,
        NODE_PATH: path.dirname(path.dirname(require.resolve('js-yaml'))) },
    }),
    bytes: () => locations.map(file => fs.readFileSync(file, 'utf8')),
    read: () => locations.map(file => yaml.load(fs.readFileSync(file, 'utf8'))),
  };
}

function succeeds(result) {
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stdout + result.stderr);
}

test('new features prefer nested UI metadata, trim descriptions, and make vcluster URLs relative', t => {
  const f = fixture(t, { upstream: [{ name: 'new-feature', displayName: 'New feature',
    description: 'Legacy description', docsLink: 'https://example.com/legacy',
    ui: { description: '  Nested description\n', docsLink: 'https://www.vcluster.com/docs/new#setup' } }] });
  succeeds(f.run());
  assert.deepEqual(f.read()[0].features, { 'new-feature': {
    name: 'New feature', description: 'Nested description', docs_url: '/docs/new#setup',
  } });
});

test('legacy and per-field fallbacks handle null, empty, and missing optional metadata', t => {
  const f = fixture(t, { upstream: [
    { name: 'legacy', description: ' Legacy ', docsLink: 'https://example.com/docs' },
    { name: 'partial', description: ' Old ', docsLink: 'https://www.vcluster.com/docs/partial', ui: { description: ' New ' } },
    { name: 'docs-only', description: ' Legacy description ', docsLink: '/legacy', ui: { docsLink: '/nested' } },
    { name: 'null-ui', description: ' Fallback ', docsLink: '/docs/fallback', ui: { description: null, docsLink: null } },
    { name: 'empty-ui', description: 'Unused', docsLink: '/unused', ui: { description: '', docsLink: '' } },
    { name: 'bare' },
  ] });
  succeeds(f.run());
  assert.deepEqual(f.read()[0].features, {
    legacy: { name: 'legacy', description: 'Legacy', docs_url: 'https://example.com/docs' },
    partial: { name: 'partial', description: 'New', docs_url: '/docs/partial' },
    'docs-only': { name: 'docs-only', description: 'Legacy description', docs_url: '/nested' },
    'null-ui': { name: 'null-ui', description: 'Fallback', docs_url: '/docs/fallback' },
    'empty-ui': { name: 'empty-ui' }, bare: { name: 'bare' },
  });
});

test('existing feature metadata and local-only assignments survive an update', t => {
  const local = { name: 'Local title', description: ' Local whitespace ', docs_url: '/local',
    categories: ['platform'], custom: { owner: 'docs', enabled: false } };
  const f = fixture(t, { upstream: [
    { name: 'existing', displayName: 'Upstream', ui: { description: 'Upstream', docsLink: '/upstream' } },
    { name: 'new' },
  ], features: { existing: local }, assignments: { prod: ['existing'] } });
  succeeds(f.run());
  assert.deepEqual(f.read()[0].features.existing, local);
  assert.deepEqual(f.read()[1].products.prod.features, ['existing']);
});

test('curated retired IDs are skipped in new definitions, upstream tiers, and local-only tiers', t => {
  const f = fixture(t, { upstream: [{ name: 'current' }, { name: 'rancher-integration' }],
    plans: { free: ['current', 'rancher-integration'] },
    features: { devpod: { name: 'Existing retired metadata' } }, assignments: { prod: ['devpod'] } });
  succeeds(f.run());
  const [features, products] = f.read();
  assert.deepEqual(features.features, { current: { name: 'current' }, devpod: { name: 'Existing retired metadata' } });
  assert.deepEqual(products.products.free.features, ['current']);
  assert.deepEqual(products.products.prod.features, []);
});

test('dry-run leaves bytes unchanged and reports drift with exit 1 or sync with exit 0', t => {
  const drift = fixture(t, { upstream: [{ name: 'new' }], plans: { dev: ['new'] } });
  const before = drift.bytes();
  const result = drift.run('--dry-run');
  assert.ifError(result.error);
  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stdout, /\[NEW\] new/);
  assert.match(result.stdout, /\[dev\] Added: new/);
  assert.deepEqual(drift.bytes(), before);
  const synced = fixture(t, { upstream: [{ name: 'existing' }], features: { existing: { name: 'Local' } } });
  const syncedBefore = synced.bytes();
  succeeds(synced.run('--dry-run'));
  assert.deepEqual(synced.bytes(), syncedBefore);
});

test('writes apply the dry-run changes and repeated syncs keep identical bytes', t => {
  const f = fixture(t, { upstream: [{ name: 'new', ui: { description: ' New ', docsLink: '/docs/new' } }],
    plans: { scale: ['new'] } });
  assert.equal(f.run('--dry-run').status, 1);
  succeeds(f.run());
  assert.deepEqual(f.read()[0].features, { new: { name: 'new', description: 'New', docs_url: '/docs/new' } });
  assert.deepEqual(f.read()[1].products.scale.features, ['new']);
  const written = f.bytes();
  succeeds(f.run('--dry-run'));
  succeeds(f.run());
  assert.deepEqual(f.bytes(), written);
});
