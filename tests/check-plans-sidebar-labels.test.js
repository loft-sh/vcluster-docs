/**
 * Unit tests for scripts/check-plans-sidebar-labels.js.
 *
 * Uses Node's built-in test runner (node --test); no extra dependencies.
 * Run: node --test tests/check-plans-sidebar-labels.test.js
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
  freeFeatureSet,
  parseFrontmatter,
  sidebarClasses,
  usesProAdmonition,
  resolveDocPath,
  crossCheck,
  buildInventory,
  fetchPlansCommits,
  renderIssueBody,
  findOpenIssue,
  openOrUpdateTrackingIssue,
  parseArgs,
} = require('../scripts/check-plans-sidebar-labels.js');

const PRODUCTS = {
  products: {
    free: { name: 'Free', enterprise: false, features: ['custom-resources', 'sleep-mode'] },
    dev: { name: 'Dev', enterprise: true, features: ['sso', 'sleep-mode'] },
    prod: { name: 'Prod', enterprise: true, features: ['sso'] },
    scale: { name: 'Scale', enterprise: true, features: ['sso'] },
  },
};

const FEATURES = {
  features: {
    'custom-resources': { name: 'Custom Resources', docs_url: '/docs/vcluster/custom-resources' },
    'sleep-mode': { name: 'Sleep Mode', docs_url: '/docs/vcluster/sleep#enable' }, // anchored -> skipped
    sso: { name: 'Single Sign-On', docs_url: '/docs/platform/sso' },
    orphan: { name: 'Orphan', docs_url: '/docs/vcluster/does-not-exist' },
    nourl: { name: 'No URL' },
  },
};

// Virtual filesystem keyed by repo-relative path.
const FILES = {
  // Free feature, but page still marked Enterprise -> over-labeled (DOC-1513 case).
  'vcluster/custom-resources.mdx': '---\ntitle: Custom Resources\nsidebar_class_name: pro host-nodes\n---\nbody',
  // Enterprise feature, but page marked free -> under-labeled.
  'platform/sso.mdx': '---\ntitle: SSO\nsidebar_class_name: free\n---\nbody',
  // Anchored docs_url for sleep-mode; should never be read.
  'vcluster/sleep.mdx': '---\ntitle: Sleep\nsidebar_class_name: pro\n---\nbody',
};

function fakeExists(f) {
  return Object.prototype.hasOwnProperty.call(FILES, f);
}
function fakeRead(f) {
  if (!fakeExists(f)) throw new Error(`ENOENT ${f}`);
  return FILES[f];
}

test('freeFeatureSet returns only the Free tier features', () => {
  const s = freeFeatureSet(PRODUCTS);
  assert.ok(s.has('custom-resources'));
  assert.ok(s.has('sleep-mode'));
  assert.ok(!s.has('sso'));
  assert.equal(s.size, 2);
});

test('freeFeatureSet tolerates missing structure', () => {
  assert.equal(freeFeatureSet({}).size, 0);
  assert.equal(freeFeatureSet({ products: {} }).size, 0);
});

test('parseFrontmatter extracts the block and handles no-frontmatter', () => {
  assert.match(parseFrontmatter('---\na: 1\nb: 2\n---\nrest'), /a: 1/);
  assert.equal(parseFrontmatter('no frontmatter here'), '');
});

test('sidebarClasses tokenizes space-separated classes', () => {
  assert.deepEqual(sidebarClasses('---\nsidebar_class_name: pro host-nodes\n---\n'), ['pro', 'host-nodes']);
  assert.deepEqual(sidebarClasses('---\nsidebar_class_name: free\n---\n'), ['free']);
});

test('sidebarClasses strips quotes and trailing whitespace', () => {
  assert.deepEqual(sidebarClasses('---\nsidebar_class_name: "pro host-nodes"\n---\n'), ['pro', 'host-nodes']);
  assert.deepEqual(sidebarClasses('---\nsidebar_class_name: private-nodes \n---\n'), ['private-nodes']);
});

test('sidebarClasses returns [] when absent', () => {
  assert.deepEqual(sidebarClasses('---\ntitle: X\n---\n'), []);
});

test('usesProAdmonition detects import path and JSX tag', () => {
  assert.ok(usesProAdmonition("import P from '../_partials/admonitions/pro-admonition.mdx'"));
  assert.ok(usesProAdmonition('<ProAdmonition />'));
  assert.ok(!usesProAdmonition('just some text'));
});

test('resolveDocPath maps a whole-page docs_url to a file', () => {
  assert.equal(
    resolveDocPath('/docs/vcluster/custom-resources', { exists: fakeExists }),
    'vcluster/custom-resources.mdx'
  );
});

test('resolveDocPath skips anchored URLs', () => {
  assert.equal(resolveDocPath('/docs/vcluster/sleep#enable', { exists: fakeExists }), null);
});

test('resolveDocPath returns null for unknown or non-docs URLs', () => {
  assert.equal(resolveDocPath('/docs/vcluster/does-not-exist', { exists: fakeExists }), null);
  assert.equal(resolveDocPath('https://example.com', { exists: fakeExists }), null);
  assert.equal(resolveDocPath(undefined, { exists: fakeExists }), null);
});

test('crossCheck flags over-labeled Free feature and under-labeled Enterprise feature', () => {
  const m = crossCheck({ products: PRODUCTS, features: FEATURES, readFile: fakeRead, exists: fakeExists });
  const byId = Object.fromEntries(m.map((x) => [x.id, x]));

  assert.ok(byId['custom-resources'], 'expected custom-resources flagged');
  assert.equal(byId['custom-resources'].kind, 'over-labeled');
  assert.equal(byId['custom-resources'].tier, 'Free');

  assert.ok(byId['sso'], 'expected sso flagged');
  assert.equal(byId['sso'].kind, 'under-labeled');
  assert.equal(byId['sso'].tier, 'Enterprise');

  // sleep-mode is anchored (skipped), orphan/nourl do not resolve.
  assert.ok(!byId['sleep-mode']);
  assert.ok(!byId['orphan']);
  assert.ok(!byId['nourl']);
  assert.equal(m.length, 2);
});

test('crossCheck flags ProAdmonition on a Free-tier page', () => {
  const files = {
    'vcluster/cr.mdx': '---\ntitle: CR\n---\nimport P from "../_partials/admonitions/pro-admonition.mdx"\n<ProAdmonition />',
  };
  const products = { products: { free: { features: ['cr'] }, dev: { features: [] } } };
  const features = { features: { cr: { name: 'CR', docs_url: '/docs/vcluster/cr' } } };
  const m = crossCheck({
    products,
    features,
    readFile: (f) => files[f],
    exists: (f) => Object.prototype.hasOwnProperty.call(files, f),
  });
  assert.equal(m.length, 1);
  assert.equal(m[0].kind, 'over-labeled');
  assert.match(m[0].detail, /ProAdmonition/);
});

test('crossCheck does not flag correctly-labeled pages', () => {
  const files = {
    'vcluster/free-ok.mdx': '---\nsidebar_class_name: free\n---\n',
    'platform/pro-ok.mdx': '---\nsidebar_class_name: pro\n---\n',
  };
  const products = { products: { free: { features: ['a'] }, dev: { features: ['b'] } } };
  const features = {
    features: {
      a: { name: 'A', docs_url: '/docs/vcluster/free-ok' }, // free feature + free label = ok
      b: { name: 'B', docs_url: '/docs/platform/pro-ok' }, // enterprise feature + pro label = ok
    },
  };
  const m = crossCheck({
    products,
    features,
    readFile: (f) => files[f],
    exists: (f) => Object.prototype.hasOwnProperty.call(files, f),
  });
  assert.equal(m.length, 0);
});

test('buildInventory categorizes pages by label and ProAdmonition', () => {
  const files = {
    'vcluster/a.mdx': '---\nsidebar_class_name: pro\n---\n',
    'vcluster/b.mdx': '---\nsidebar_class_name: free host-nodes\n---\n',
    'platform/c.md': '---\ntitle: c\n---\n<ProAdmonition />',
    'platform/d.mdx': '---\ntitle: d\n---\nno labels',
  };
  const listFiles = (dir) => Object.keys(files).filter((f) => f.startsWith(dir + '/'));
  const inv = buildInventory({ listFiles, readFile: (f) => files[f] });
  assert.deepEqual(inv.pro, ['vcluster/a.mdx']);
  assert.deepEqual(inv.free, ['vcluster/b.mdx']);
  assert.deepEqual(inv.proAdmonition, ['platform/c.md']);
});

test('fetchPlansCommits parses gh api JSON and trims sha + message', () => {
  const fakeExec = () =>
    JSON.stringify([
      {
        sha: 'abcdef1234567890',
        html_url: 'https://github.com/loft-sh/plans/commit/abcdef1',
        commit: { message: 'move custom-resources to free\n\nbody', author: { date: '2026-06-28T10:00:00Z' } },
      },
    ]);
  const commits = fetchPlansCommits({ sinceDays: 7, now: new Date('2026-06-29T00:00:00Z'), exec: fakeExec });
  assert.equal(commits.length, 1);
  assert.equal(commits[0].sha, 'abcdef1');
  assert.equal(commits[0].message, 'move custom-resources to free');
  assert.equal(commits[0].date, '2026-06-28T10:00:00Z');
});

test('fetchPlansCommits returns [] on empty response', () => {
  assert.deepEqual(fetchPlansCommits({ exec: () => '[]' }), []);
});

test('renderIssueBody includes commits, mismatch table, inventory, and DOC-1513', () => {
  const body = renderIssueBody({
    commits: [{ sha: 'abc1234', message: 'tier change', date: '2026-06-28T00:00:00Z', url: 'https://x/abc' }],
    mismatches: [
      { id: 'custom-resources', name: 'Custom Resources', tier: 'Free', file: 'vcluster/custom-resources.mdx', detail: 'Free tier but page has `sidebar_class_name: pro`' },
    ],
    inventory: { pro: ['vcluster/custom-resources.mdx'], free: [], proAdmonition: [] },
    sinceDays: 7,
    force: false,
  });
  assert.match(body, /abc1234/);
  assert.match(body, /Custom Resources/);
  assert.match(body, /Suspected mismatches/);
  assert.match(body, /Label inventory/);
  assert.match(body, /DOC-1513/);
  assert.match(body, /Closes DOC-1523/);
});

test('renderIssueBody handles no mismatches and forced (no commits) run', () => {
  const body = renderIssueBody({
    commits: [],
    mismatches: [],
    inventory: { pro: [], free: [], proAdmonition: [] },
    sinceDays: 7,
    force: true,
  });
  assert.match(body, /Manually triggered review/);
  assert.match(body, /None detected automatically/);
});

test('findOpenIssue returns the first open issue number or null', () => {
  assert.equal(findOpenIssue({ label: 'x', exec: () => '[{"number":42}]' }), 42);
  assert.equal(findOpenIssue({ label: 'x', exec: () => '[]' }), null);
});

test('openOrUpdateTrackingIssue creates when none open', () => {
  const calls = [];
  const exec = (_cmd, args) => {
    calls.push(args.join(' '));
    if (args[0] === 'issue' && args[1] === 'list') return '[]';
    if (args[0] === 'issue' && args[1] === 'create') return 'https://github.com/loft-sh/vcluster-docs/issues/7\n';
    return '';
  };
  const res = openOrUpdateTrackingIssue({ title: 'T', body: 'B', label: 'plans-sidebar-review', exec });
  assert.equal(res.action, 'created');
  assert.equal(res.url, 'https://github.com/loft-sh/vcluster-docs/issues/7');
  assert.ok(calls.some((c) => c.startsWith('issue create')));
});

test('openOrUpdateTrackingIssue updates and comments when one is open', () => {
  const calls = [];
  const exec = (_cmd, args) => {
    calls.push(args.join(' '));
    if (args[0] === 'issue' && args[1] === 'list') return '[{"number":99}]';
    return '';
  };
  const res = openOrUpdateTrackingIssue({ title: 'T', body: 'B', label: 'plans-sidebar-review', exec });
  assert.equal(res.action, 'updated');
  assert.equal(res.number, 99);
  assert.ok(calls.some((c) => c.startsWith('issue edit 99')));
  assert.ok(calls.some((c) => c.startsWith('issue comment 99')));
});

test('parseArgs reads flags and --since-days', () => {
  const o = parseArgs(['--open-issue', '--dry-run', '--force', '--since-days', '14']);
  assert.equal(o.openIssue, true);
  assert.equal(o.dryRun, true);
  assert.equal(o.force, true);
  assert.equal(o.sinceDays, 14);
});

test('parseArgs rejects a bad --since-days', () => {
  assert.throws(() => parseArgs(['--since-days', 'x']), /positive integer/);
});

test('parseArgs defaults', () => {
  const o = parseArgs([]);
  assert.equal(o.openIssue, false);
  assert.equal(o.dryRun, false);
  assert.equal(o.force, false);
  assert.equal(o.sinceDays, 7);
});
