#!/usr/bin/env node

/**
 * Validate that EOS/EOL suffixes on version labels in docusaurus.config.js
 * and src/config/versionConfig.js match the EOS/EOL dates published in the
 * supported-versions MDX partials.
 *
 * Catches drift that no file edit can reveal — labels go stale purely because
 * time has passed. Run on a weekly cron; opens a tracking issue on drift.
 *
 * Usage:
 *   node scripts/check-eos-eol-labels.js                   # validate as of today
 *   node scripts/check-eos-eol-labels.js --date 2027-01-01 # validate as of given date
 *
 * Outputs (when GITHUB_OUTPUT is set):
 *   drift=true|false
 * On drift, writes a markdown report to eos-eol-drift-report.md.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PARTIALS = {
  vcluster: path.join(ROOT, 'docs/_partials/vcluster_supported_versions.mdx'),
  platform: path.join(ROOT, 'docs/_partials/platform_supported_versions.mdx'),
};
const VERSION_CONFIG = path.join(ROOT, 'src/config/versionConfig.js');
const DOCUSAURUS_CONFIG = path.join(ROOT, 'docusaurus.config.js');
const REPORT_PATH = path.join(ROOT, 'eos-eol-drift-report.md');

function parsePartial(content) {
  const rows = [];
  const rowRe = /<tr>([\s\S]*?)<\/tr>/g;
  let m;
  while ((m = rowRe.exec(content)) !== null) {
    const body = m[1];
    if (/colspan=/.test(body)) continue;
    const cells = [];
    const cellRe = /<td>([\s\S]*?)<\/td>/g;
    let cm;
    while ((cm = cellRe.exec(body)) !== null) cells.push(cm[1].trim());
    if (cells.length !== 4) continue;
    const version = cells[0];
    if (!/^v\d+\.\d+$/.test(version)) continue;
    rows.push({ version, released: cells[1], eos: cells[2], eol: cells[3] });
  }
  return rows;
}

function parseDate(s) {
  // Strip trailing footnote markers (e.g. "April 1, 2025*") and escapes.
  const clean = s.replace(/\\?\*.*$/, '').replace(/\s+/g, ' ').trim();
  const d = new Date(clean);
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Cannot parse date: "${s}" (cleaned: "${clean}")`);
  }
  return d;
}

function expectedSuffix(row, today) {
  const eos = parseDate(row.eos);
  const eol = parseDate(row.eol);
  if (today.getTime() >= eol.getTime()) return '(EOL)';
  if (today.getTime() >= eos.getTime()) return '(EOS)';
  return '';
}

function actualSuffix(label) {
  const m = label.match(/\((EOS|EOL)\)/);
  return m ? `(${m[1]})` : '';
}

function extractVersion(label) {
  const m = label.match(/v(\d+\.\d+)(?!\.)/);
  return m ? `v${m[1]}` : null;
}

function parseVersionConfigLabels(content) {
  const out = [];
  const re = /\{[^{}]*label:\s*"([^"]+)"[^{}]*\}/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    out.push({ source: 'src/config/versionConfig.js', label: m[1] });
  }
  return out;
}

function parseDocusaurusConfigLabels(content) {
  const out = [];
  const re = /"(\d+\.\d+\.\d+)":\s*\{\s*label:\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    out.push({ source: 'docusaurus.config.js', key: m[1], label: m[2] });
  }
  return out;
}

function buildRowIndex(partials) {
  const idx = new Map();
  for (const product of Object.keys(partials)) {
    for (const row of partials[product]) {
      idx.set(row.version, { ...row, product });
    }
  }
  return idx;
}

function detectDrift({ today, partials, labels }) {
  const idx = buildRowIndex(partials);
  const drift = [];
  for (const entry of labels) {
    const version = extractVersion(entry.label);
    if (!version) continue;
    const row = idx.get(version);
    if (!row) continue;
    const expected = expectedSuffix(row, today);
    const actual = actualSuffix(entry.label);
    if (expected === actual) continue;
    drift.push({
      source: entry.source,
      version,
      product: row.product,
      label: entry.label,
      actual: actual || '(none)',
      expected: expected || '(none)',
      eos: row.eos,
      eol: row.eol,
    });
  }
  return drift;
}

function renderReport(drift, today) {
  const iso = today.toISOString().slice(0, 10);
  const lines = [
    `As of ${iso}, the following version labels do not match the EOS/EOL`,
    `dates published in the supported-versions MDX partials:`,
    '',
    '| Version | Source | Label | Current suffix | Expected suffix | EOS date | EOL date |',
    '| --- | --- | --- | --- | --- | --- | --- |',
  ];
  for (const d of drift) {
    lines.push(
      `| ${d.version} | \`${d.source}\` | \`${d.label}\` | ${d.actual} | ${d.expected} | ${d.eos} | ${d.eol} |`
    );
  }
  lines.push('');
  lines.push('## How to resolve');
  lines.push('');
  lines.push('1. For an `(EOS)` → `(EOL)` transition, edit the matching label in');
  lines.push('   `src/config/versionConfig.js` (or `docusaurus.config.js` if still');
  lines.push('   in the active version dropdown).');
  lines.push('2. For an active version reaching EOS for the first time, also remove');
  lines.push('   the `Stable` suffix from the current "Stable" version label.');
  lines.push('3. If a version is moving out of active support entirely, run the');
  lines.push('   archive workflow described in `.claude/skills/vcluster-docs-archiver`.');
  lines.push('4. Re-run `node scripts/check-eos-eol-labels.js` to confirm.');
  return lines.join('\n') + '\n';
}

function appendGithubOutput(lines) {
  if (!process.env.GITHUB_OUTPUT) return;
  fs.appendFileSync(process.env.GITHUB_OUTPUT, lines.join('\n') + '\n');
}

function parseArgs(argv) {
  let today = new Date();
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--date') {
      const v = argv[i + 1];
      if (!v || !/^\d{4}-\d{2}-\d{2}$/.test(v)) {
        throw new Error('--date requires YYYY-MM-DD');
      }
      today = new Date(`${v}T00:00:00Z`);
      i++;
    }
  }
  return { today };
}

function main() {
  const { today } = parseArgs(process.argv.slice(2));

  const partials = {
    vcluster: parsePartial(fs.readFileSync(PARTIALS.vcluster, 'utf8')),
    platform: parsePartial(fs.readFileSync(PARTIALS.platform, 'utf8')),
  };

  const labels = [
    ...parseVersionConfigLabels(fs.readFileSync(VERSION_CONFIG, 'utf8')),
    ...parseDocusaurusConfigLabels(fs.readFileSync(DOCUSAURUS_CONFIG, 'utf8')),
  ];

  const drift = detectDrift({ today, partials, labels });

  if (drift.length === 0) {
    console.log(`No EOS/EOL label drift detected as of ${today.toISOString().slice(0, 10)}.`);
    if (fs.existsSync(REPORT_PATH)) fs.unlinkSync(REPORT_PATH);
    appendGithubOutput(['drift=false']);
    return;
  }

  const report = renderReport(drift, today);
  fs.writeFileSync(REPORT_PATH, report);
  console.error(report);
  console.error(`Wrote drift report to ${path.relative(process.cwd(), REPORT_PATH)}`);
  appendGithubOutput(['drift=true']);
  process.exit(1);
}

try {
  main();
} catch (err) {
  console.error(err.stack || err.message);
  process.exit(2);
}
