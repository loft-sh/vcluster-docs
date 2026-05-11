#!/usr/bin/env node

/**
 * Validate that EOS/EOL suffixes on version labels in docusaurus.config.js
 * and src/config/versionConfig.js match the EOS/EOL dates published in the
 * supported-versions MDX partials.
 *
 * Catches drift that no file edit can reveal — labels go stale purely because
 * time has passed. Run on a weekly cron; with --update, rewrites the labels in
 * place so the workflow can open a PR for review.
 *
 * Usage:
 *   node scripts/check-eos-eol-labels.js                   # validate as of today
 *   node scripts/check-eos-eol-labels.js --date 2027-01-15 # validate as of given date
 *   node scripts/check-eos-eol-labels.js --update          # also rewrite labels in place
 *
 * Outputs (when GITHUB_OUTPUT is set):
 *   drift=true|false
 *   changed=true|false   (--update only — true if files were rewritten)
 *   summary=<one-line>   (--update only — e.g. "v0.31 (EOS)→(EOL), v0.34 Stable→(EOS)")
 *
 * On drift without --update: writes eos-eol-drift-report.md and exits 1.
 * With --update: writes the report AND rewrites labels in place; exits 0.
 *
 * Functions are exported for the test suite. Main execution is gated by
 * require.main === module so the file can be required as a library.
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
  // Strip trailing footnote markers (e.g. "April 1, 2025*") and MDX escapes.
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
      key: entry.key || null,
      label: entry.label,
      actual: actual || '(none)',
      expected: expected || '(none)',
      eos: row.eos,
      eol: row.eol,
    });
  }
  return drift;
}

function deriveNewLabel(version, oldLabel, expected) {
  // Strip trailing " Stable", " (EOS)", or " (EOL)" decorators, then append
  // the new expected suffix. This handles every direction:
  //   "v0.34 Stable"  + (EOS)  → "v0.34 (EOS)"
  //   "v0.31 (EOS)"   + (EOL)  → "v0.31 (EOL)"
  //   "v0.33"         + (EOS)  → "v0.33 (EOS)"
  const stripped = oldLabel.replace(/\s*(Stable|\(EOS\)|\(EOL\))\s*$/, '');
  // Defensive: the extracted base should start with the version. If not,
  // fall back to vX.Y to keep the rewrite predictable.
  const base = stripped.includes(version) ? stripped : version;
  return expected ? `${base} ${expected}` : base;
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function applyDocusaurusUpdate(content, key, oldLabel, newLabel) {
  // Anchor the replacement on the X.Y.Z key so the unversioned "current"
  // entry (also keyed on a label like "v0.32") never gets touched.
  const re = new RegExp(
    `("${escapeRegex(key)}":\\s*\\{\\s*label:\\s*)"${escapeRegex(oldLabel)}"`
  );
  const replaced = content.replace(re, `$1"${newLabel}"`);
  if (replaced === content) {
    throw new Error(
      `Failed to rewrite docusaurus.config.js label "${oldLabel}" under key "${key}"`
    );
  }
  return replaced;
}

function applyVersionConfigUpdate(content, oldLabel, newLabel) {
  // versionConfig.js entries live in flat arrays of single-line objects;
  // each label string is unique across the arrays, so a literal swap works.
  const target = `"${oldLabel}"`;
  if (!content.includes(target)) {
    throw new Error(`Failed to find versionConfig.js label "${oldLabel}"`);
  }
  return content.replace(target, `"${newLabel}"`);
}

function renderReport(drift, today) {
  const iso = today.toISOString().slice(0, 10);
  const lines = [
    `As of ${iso}, the following version labels do not match the EOS/EOL`,
    `dates published in the supported-versions MDX partials:`,
    '',
    '| Version | Source | Old label | New label | EOS date | EOL date |',
    '| --- | --- | --- | --- | --- | --- |',
  ];
  for (const d of drift) {
    const newLabel = deriveNewLabel(d.version, d.label, d.expected === '(none)' ? '' : d.expected);
    lines.push(
      `| ${d.version} | \`${d.source}\` | \`${d.label}\` | \`${newLabel}\` | ${d.eos} | ${d.eol} |`
    );
  }
  lines.push('');
  lines.push('## Notes');
  lines.push('');
  lines.push('- Suffix transitions are mechanical and applied automatically by');
  lines.push('  `scripts/check-eos-eol-labels.js --update`.');
  lines.push('- If a label loses its `Stable` suffix here, manually add `Stable`');
  lines.push('  to the new latest version in `docusaurus.config.js` in this PR.');
  lines.push('- A version is NOT moved between `docusaurus.config.js` (active) and');
  lines.push('  `src/config/versionConfig.js` (archived) by this automation. Run the');
  lines.push('  archive workflow described in `.claude/skills/vcluster-docs-archiver`');
  lines.push('  when a version should be fully retired.');
  return lines.join('\n') + '\n';
}

function appendGithubOutput(lines) {
  if (!process.env.GITHUB_OUTPUT) return;
  fs.appendFileSync(process.env.GITHUB_OUTPUT, lines.join('\n') + '\n');
}

function parseArgs(argv) {
  let today = new Date();
  let update = false;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--date') {
      const v = argv[i + 1];
      if (!v || !/^\d{4}-\d{2}-\d{2}$/.test(v)) {
        throw new Error('--date requires YYYY-MM-DD');
      }
      today = new Date(`${v}T00:00:00Z`);
      i++;
    } else if (argv[i] === '--update') {
      update = true;
    }
  }
  return { today, update };
}

function main() {
  const { today, update } = parseArgs(process.argv.slice(2));

  const partials = {
    vcluster: parsePartial(fs.readFileSync(PARTIALS.vcluster, 'utf8')),
    platform: parsePartial(fs.readFileSync(PARTIALS.platform, 'utf8')),
  };

  let versionConfigContent = fs.readFileSync(VERSION_CONFIG, 'utf8');
  let docusaurusConfigContent = fs.readFileSync(DOCUSAURUS_CONFIG, 'utf8');

  const labels = [
    ...parseVersionConfigLabels(versionConfigContent),
    ...parseDocusaurusConfigLabels(docusaurusConfigContent),
  ];

  const drift = detectDrift({ today, partials, labels });

  if (drift.length === 0) {
    console.log(`No EOS/EOL label drift detected as of ${today.toISOString().slice(0, 10)}.`);
    if (fs.existsSync(REPORT_PATH)) fs.unlinkSync(REPORT_PATH);
    appendGithubOutput(['drift=false', 'changed=false']);
    return 0;
  }

  const report = renderReport(drift, today);
  fs.writeFileSync(REPORT_PATH, report);
  console.error(report);
  console.error(`Wrote drift report to ${path.relative(process.cwd(), REPORT_PATH)}`);

  if (!update) {
    appendGithubOutput(['drift=true', 'changed=false']);
    return 1;
  }

  const summaryParts = [];
  for (const d of drift) {
    const expected = d.expected === '(none)' ? '' : d.expected;
    const newLabel = deriveNewLabel(d.version, d.label, expected);
    if (d.source === 'docusaurus.config.js') {
      docusaurusConfigContent = applyDocusaurusUpdate(
        docusaurusConfigContent,
        d.key,
        d.label,
        newLabel
      );
    } else {
      versionConfigContent = applyVersionConfigUpdate(
        versionConfigContent,
        d.label,
        newLabel
      );
    }
    summaryParts.push(`${d.label} → ${newLabel}`);
  }

  fs.writeFileSync(VERSION_CONFIG, versionConfigContent);
  fs.writeFileSync(DOCUSAURUS_CONFIG, docusaurusConfigContent);

  const summary = summaryParts.join(', ');
  console.log(`Applied ${drift.length} label rewrite(s): ${summary}`);
  appendGithubOutput(['drift=true', 'changed=true', `summary=${summary}`]);
  return 0;
}

module.exports = {
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
  renderReport,
};

if (require.main === module) {
  try {
    process.exit(main());
  } catch (err) {
    console.error(err.stack || err.message);
    process.exit(2);
  }
}
