/**
 * Unit tests for scripts/check-eos-eol-labels.js.
 *
 * Uses Node's built-in test runner (node --test); no extra dependencies.
 * Run: node --test tests/check-eos-eol-labels.test.js
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
  parsePartial,
  parseDate,
  expectedSuffix,
  actualSuffix,
  extractVersion,
  parseVersionConfigLabels,
  parseDocusaurusConfigLabels,
  detectDrift,
  deriveNewLabel,
  applyDocusaurusUpdate,
  applyVersionConfigUpdate,
} = require('../scripts/check-eos-eol-labels.js');

const VCLUSTER_PARTIAL_FIXTURE = `
import SupportTerminology from '@site/docs/_partials/support_terminology.mdx';

<table>
  <thead>
    <tr><th>Release</th><th>Released</th><th>EOS</th><th>EOL</th></tr>
  </thead>
  <tbody>
    <tr>
      <td>v0.34</td>
      <td>April 29, 2026</td>
      <td>July 29, 2026</td>
      <td>October 29, 2026</td>
    </tr>
    <tr>
      <td>v0.33</td>
      <td>March 13, 2026</td>
      <td>June 13, 2026</td>
      <td>September 13, 2026</td>
    </tr>
    <tr>
      <td colspan="4" align="center"><i>Versions below are no longer supported</i></td>
    </tr>
    <tr>
      <td>v0.30</td>
      <td>October 28, 2025</td>
      <td>January 28, 2026</td>
      <td>April 28, 2026</td>
    </tr>
    <tr>
      <td>v0.19</td>
      <td>February 12, 2024</td>
      <td>April 1, 2025*</td>
      <td>July 1, 2025</td>
    </tr>
  </tbody>
</table>
`;

const VERSION_CONFIG_FIXTURE = `
export const vclusterEOLVersions = [
  { to: "https://vcluster.com/docs/v0.30", label: "v0.30 (EOL)" },
  { to: "https://vcluster.com/docs/v0.19", label: "v0.19 (EOL)" },
];
`;

const DOCUSAURUS_CONFIG_FIXTURE = `
versions: {
  current: { label: "main 🚧" },
  "0.34.0": {
    label: "v0.34 Stable",
    banner: "none",
  },
  "0.33.0": {
    label: "v0.33",
    banner: "none",
  },
},
`;

test('parsePartial extracts version rows and skips colspan separators', () => {
  const rows = parsePartial(VCLUSTER_PARTIAL_FIXTURE);
  assert.equal(rows.length, 4);
  assert.deepEqual(rows[0], {
    version: 'v0.34',
    released: 'April 29, 2026',
    eos: 'July 29, 2026',
    eol: 'October 29, 2026',
  });
  assert.equal(rows[3].version, 'v0.19');
  assert.equal(rows[3].eos, 'April 1, 2025*');
});

test('parseDate strips trailing footnote markers', () => {
  const d1 = parseDate('April 1, 2025*');
  const d2 = parseDate('April 1, 2025');
  assert.equal(d1.getTime(), d2.getTime());
});

test('parseDate handles short and long month names', () => {
  assert.equal(parseDate('Aug 15, 2025').getTime(), new Date('August 15, 2025').getTime());
});

test('parseDate throws on unparseable input', () => {
  assert.throws(() => parseDate('not a date'), /Cannot parse date/);
});

test('expectedSuffix returns empty before EOS', () => {
  const row = { eos: 'July 29, 2026', eol: 'October 29, 2026' };
  assert.equal(expectedSuffix(row, new Date('2026-05-11T00:00:00Z')), '');
});

test('expectedSuffix returns (EOS) on the EOS boundary day', () => {
  const row = { eos: 'July 29, 2026', eol: 'October 29, 2026' };
  assert.equal(expectedSuffix(row, new Date('2026-07-29T00:00:00Z')), '(EOS)');
});

test('expectedSuffix returns (EOS) between EOS and EOL', () => {
  const row = { eos: 'July 29, 2026', eol: 'October 29, 2026' };
  assert.equal(expectedSuffix(row, new Date('2026-08-15T00:00:00Z')), '(EOS)');
});

test('expectedSuffix returns (EOL) on the EOL boundary day', () => {
  const row = { eos: 'July 29, 2026', eol: 'October 29, 2026' };
  assert.equal(expectedSuffix(row, new Date('2026-10-29T00:00:00Z')), '(EOL)');
});

test('expectedSuffix returns (EOL) after EOL', () => {
  const row = { eos: 'July 29, 2026', eol: 'October 29, 2026' };
  assert.equal(expectedSuffix(row, new Date('2027-01-15T00:00:00Z')), '(EOL)');
});

test('actualSuffix extracts (EOS) and (EOL)', () => {
  assert.equal(actualSuffix('v0.31 (EOS)'), '(EOS)');
  assert.equal(actualSuffix('v0.30 (EOL)'), '(EOL)');
  assert.equal(actualSuffix('v0.34 Stable'), '');
  assert.equal(actualSuffix('v0.33'), '');
});

test('extractVersion returns vX.Y regardless of suffix', () => {
  assert.equal(extractVersion('v0.34 Stable'), 'v0.34');
  assert.equal(extractVersion('v4.6'), 'v4.6');
  assert.equal(extractVersion('v0.31 (EOS)'), 'v0.31');
  // Reject patch-form X.Y.Z labels — these are config keys, not display labels.
  assert.equal(extractVersion('0.34.0'), null);
});

test('parseVersionConfigLabels returns one entry per label string', () => {
  const out = parseVersionConfigLabels(VERSION_CONFIG_FIXTURE);
  assert.equal(out.length, 2);
  assert.equal(out[0].label, 'v0.30 (EOL)');
  assert.equal(out[0].source, 'src/config/versionConfig.js');
});

test('parseDocusaurusConfigLabels skips the unquoted current key', () => {
  const out = parseDocusaurusConfigLabels(DOCUSAURUS_CONFIG_FIXTURE);
  assert.equal(out.length, 2);
  assert.equal(out[0].key, '0.34.0');
  assert.equal(out[0].label, 'v0.34 Stable');
});

test('detectDrift reports stale Stable label after EOS', () => {
  const partials = { vcluster: parsePartial(VCLUSTER_PARTIAL_FIXTURE), platform: [] };
  const labels = parseDocusaurusConfigLabels(DOCUSAURUS_CONFIG_FIXTURE);
  // v0.34 EOS is July 29 2026; this date is after EOL too.
  const drift = detectDrift({ today: new Date('2027-01-15T00:00:00Z'), partials, labels });
  const v034 = drift.find((d) => d.version === 'v0.34');
  assert.ok(v034, 'expected v0.34 in drift list');
  assert.equal(v034.actual, '(none)');
  assert.equal(v034.expected, '(EOL)');
});

test('detectDrift returns empty when labels match dates', () => {
  const partials = { vcluster: parsePartial(VCLUSTER_PARTIAL_FIXTURE), platform: [] };
  const labels = parseVersionConfigLabels(VERSION_CONFIG_FIXTURE);
  // Today: 2026-05-11. v0.30 EOL = April 28 2026 → expect (EOL). Label = "(EOL)".
  // v0.19 EOL = July 1 2025 → expect (EOL). Label = "(EOL)". Both match.
  const drift = detectDrift({ today: new Date('2026-05-11T00:00:00Z'), partials, labels });
  assert.equal(drift.length, 0);
});

test('detectDrift catches (EOS) -> (EOL) transition', () => {
  const partial = `
    <tr>
      <td>v4.5</td>
      <td>October 29, 2025</td>
      <td>April 29, 2026</td>
      <td>July 29, 2026</td>
    </tr>
  `;
  const labels = [{ source: 'test', label: 'v4.5 (EOS)' }];
  const drift = detectDrift({
    today: new Date('2026-08-01T00:00:00Z'),
    partials: { vcluster: parsePartial(partial), platform: [] },
    labels,
  });
  assert.equal(drift.length, 1);
  assert.equal(drift[0].actual, '(EOS)');
  assert.equal(drift[0].expected, '(EOL)');
});

test('deriveNewLabel transitions Stable -> (EOS)', () => {
  assert.equal(deriveNewLabel('v0.34', 'v0.34 Stable', '(EOS)'), 'v0.34 (EOS)');
});

test('deriveNewLabel transitions (EOS) -> (EOL)', () => {
  assert.equal(deriveNewLabel('v0.31', 'v0.31 (EOS)', '(EOL)'), 'v0.31 (EOL)');
});

test('deriveNewLabel appends (EOS) to bare version', () => {
  assert.equal(deriveNewLabel('v0.33', 'v0.33', '(EOS)'), 'v0.33 (EOS)');
});

test('applyDocusaurusUpdate rewrites only the keyed entry', () => {
  const input = `versions: {
  current: { label: "v0.32" },
  "0.32.0": {
    label: "v0.32",
    banner: "none",
  },
},`;
  const out = applyDocusaurusUpdate(input, '0.32.0', 'v0.32', 'v0.32 (EOS)');
  // The "current" key's label must stay as "v0.32"; only the 0.32.0 entry bumps.
  assert.match(out, /current: \{ label: "v0\.32" \}/);
  assert.match(out, /"0\.32\.0":\s*\{\s*label:\s*"v0\.32 \(EOS\)"/);
});

test('applyDocusaurusUpdate throws when key is wrong', () => {
  const input = `"0.31.0": { label: "v0.31 (EOS)" }`;
  assert.throws(
    () => applyDocusaurusUpdate(input, '0.99.0', 'v0.31 (EOS)', 'v0.31 (EOL)'),
    /Failed to rewrite/
  );
});

test('applyVersionConfigUpdate replaces label in array entry', () => {
  const input = `export const vclusterEOLVersions = [
  { to: "https://example.com/v0.31", label: "v0.31 (EOS)" },
  { to: "https://example.com/v0.30", label: "v0.30 (EOL)" },
];`;
  const out = applyVersionConfigUpdate(input, 'v0.31 (EOS)', 'v0.31 (EOL)');
  assert.match(out, /"v0\.31 \(EOL\)"/);
  // The unrelated v0.30 entry is untouched.
  assert.match(out, /"v0\.30 \(EOL\)"/);
});

test('applyVersionConfigUpdate throws when label is missing', () => {
  const input = `label: "v0.31 (EOS)"`;
  assert.throws(
    () => applyVersionConfigUpdate(input, 'v0.99 (EOS)', 'v0.99 (EOL)'),
    /Failed to find/
  );
});
