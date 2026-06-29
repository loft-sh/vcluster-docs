#!/usr/bin/env node

/**
 * check-plans-sidebar-labels.js
 *
 * Opens (or updates) a docs follow-up issue when loft-sh/plans changes, so a
 * human reviews whether the left-nav Enterprise/Free sidebar labels and the
 * ProAdmonition partial still match the plan tiers.
 *
 * Why an issue and not an auto-PR:
 *   The Feature Table sync (scripts/sync-upstream-features.js) already mirrors
 *   plan tiers into src/data/products.yaml mechanically. Sidebar labels are
 *   different: they live in per-page `sidebar_class_name: pro|free` frontmatter
 *   and in editorially-placed <ProAdmonition /> includes. There is no reliable
 *   machine mapping from a plan-tier change to the exact pages that need a label
 *   flipped (a page can document several features, a docs_url can point at a
 *   section anchor, a ProAdmonition is placed by hand). So this opens a review
 *   issue carrying a best-effort suspect list, not a pre-written diff. Mechanical
 *   drift gets an auto-PR (see check-eos-eol-labels.js); judgement drift gets a
 *   review issue. DOC-1513 (custom resources wrongly marked Enterprise) is the
 *   exact drift this catches.
 *
 * What it does:
 *   1. Detects recent loft-sh/plans commits (the trigger).
 *   2. Cross-checks every feature in src/data/features.yaml that maps cleanly to
 *      a whole docs page: a Free-tier feature whose page still carries a `pro`
 *      label or a ProAdmonition is flagged (over-labeled); an Enterprise-only
 *      feature whose page carries a `free` label is flagged (under-labeled).
 *   3. Inventories every page currently carrying a pro/free label or a
 *      ProAdmonition, so the reviewer has the full surface to check.
 *   4. Opens or updates a single tracking issue (deduped by label).
 *
 * Usage:
 *   node scripts/check-plans-sidebar-labels.js              # report only (no side effects)
 *   node scripts/check-plans-sidebar-labels.js --dry-run    # print the issue body
 *   node scripts/check-plans-sidebar-labels.js --open-issue # open/update the tracking issue
 *   node scripts/check-plans-sidebar-labels.js --force      # act even without recent plans commits
 *   node scripts/check-plans-sidebar-labels.js --since-days 14
 *
 * GITHUB_EVENT_NAME=workflow_dispatch|repository_dispatch is treated as --force
 * (a human or upstream repo explicitly asked for the review).
 *
 * Outputs (when GITHUB_OUTPUT is set):
 *   drift=true|false
 *   issue=<url-or-number>   (--open-issue only, when an issue was opened/updated)
 *
 * Functions are exported for the test suite. Main execution is gated by
 * require.main === module so the file can be required as a library.
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const PRODUCTS_YAML = path.join(ROOT, 'src/data/products.yaml');
const FEATURES_YAML = path.join(ROOT, 'src/data/features.yaml');

// Live ("next") docs trees. Versioned docs are backported by CI and are not
// reviewed here.
const DOC_ROOTS = ['vcluster', 'platform'];

const PLANS_REPO = 'loft-sh/plans';
const PRODUCTS_PATH = 'src/data/products.yaml';
const PRO_ADMONITION_PARTIAL = 'vcluster/_partials/admonitions/pro-admonition.mdx';
const SIDEBAR_CSS = 'src/css/sidebar.scss';

const ISSUE_TITLE = 'Review sidebar Enterprise/Free labels after loft-sh/plans change';
const ISSUE_LABEL = 'plans-sidebar-review';

function defaultExec(cmd, args) {
  return execFileSync(cmd, args, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
}

function loadYaml(file) {
  // Strip the leading comment header before parsing, mirroring
  // sync-upstream-features.js.
  const content = fs.readFileSync(file, 'utf8').replace(/^#[^\n]*\n/gm, '');
  return yaml.load(content) || {};
}

/**
 * Feature IDs assigned to the Free tier in products.yaml. Everything not in
 * this set is Enterprise-only (Dev/Prod/Scale all have enterprise: true).
 */
function freeFeatureSet(products) {
  const free = products?.products?.free?.features || [];
  return new Set(free);
}

function parseFrontmatter(content) {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return m ? m[1] : '';
}

/**
 * Tokenize the space-separated `sidebar_class_name` frontmatter value. Pages
 * combine label classes with layout classes, e.g. "pro host-nodes".
 */
function sidebarClasses(content) {
  const fm = parseFrontmatter(content);
  const m = fm.match(/^sidebar_class_name:\s*(.+)$/m);
  if (!m) return [];
  return m[1]
    .trim()
    .replace(/^["']|["']$/g, '')
    .split(/\s+/)
    .filter(Boolean);
}

function usesProAdmonition(content) {
  return /pro-admonition\.mdx/.test(content) || /<ProAdmonition\b/.test(content);
}

/**
 * Map a feature's docs_url to a source file, or null when it cannot be mapped
 * to a whole page. Anchored URLs (#section) are skipped on purpose: they point
 * at one feature within a shared page, so the page-level label cannot be
 * attributed to that feature alone.
 */
function resolveDocPath(docsUrl, { exists } = {}) {
  const fileExists = exists || ((f) => fs.existsSync(path.join(ROOT, f)));
  if (!docsUrl || !docsUrl.startsWith('/docs/')) return null;
  if (docsUrl.includes('#')) return null;
  const rel = docsUrl.replace(/^\/docs\//, '').replace(/\/$/, '');
  if (!rel) return null;
  const candidates = [`${rel}.mdx`, `${rel}.md`, `${rel}/README.mdx`, `${rel}/README.md`];
  for (const c of candidates) {
    if (fileExists(c)) return c;
  }
  return null;
}

/**
 * Conservative cross-check of feature tier (from products.yaml) against the
 * label on the feature's docs page. Only whole-page, cleanly-resolved features
 * are considered, and only explicit contradictions are flagged. A missing
 * `pro` label is never flagged: absence is the default and would be pure noise.
 */
function crossCheck({ products, features, readFile, exists } = {}) {
  const read = readFile || ((f) => fs.readFileSync(path.join(ROOT, f), 'utf8'));
  const free = freeFeatureSet(products);
  const feats = (features && features.features) || {};
  const mismatches = [];

  for (const [id, meta] of Object.entries(feats)) {
    const file = resolveDocPath(meta && meta.docs_url, { exists });
    if (!file) continue;

    let content;
    try {
      content = read(file);
    } catch {
      continue;
    }

    const classes = sidebarClasses(content);
    const hasPro = classes.includes('pro');
    const hasFree = classes.includes('free');
    const proAdm = usesProAdmonition(content);
    const isFree = free.has(id);

    if (isFree && (hasPro || proAdm)) {
      const markers = [];
      if (hasPro) markers.push('`sidebar_class_name: pro`');
      if (proAdm) markers.push('ProAdmonition');
      mismatches.push({
        id,
        name: (meta && meta.name) || id,
        tier: 'Free',
        kind: 'over-labeled',
        file,
        docsUrl: meta.docs_url,
        detail: `Free tier but page has ${markers.join(' + ')}`,
      });
    } else if (!isFree && hasFree) {
      mismatches.push({
        id,
        name: (meta && meta.name) || id,
        tier: 'Enterprise',
        kind: 'under-labeled',
        file,
        docsUrl: meta.docs_url,
        detail: 'Enterprise-only but page has `sidebar_class_name: free`',
      });
    }
  }

  mismatches.sort((a, b) => a.file.localeCompare(b.file));
  return mismatches;
}

/**
 * Inventory every live-docs page that currently carries a pro/free label or a
 * ProAdmonition. This is the full surface a reviewer should sweep.
 */
function buildInventory({ root, listFiles, readFile } = {}) {
  const baseRoot = root || ROOT;
  const read = readFile || ((f) => fs.readFileSync(path.join(baseRoot, f), 'utf8'));
  const list =
    listFiles ||
    ((dir) => {
      const abs = path.join(baseRoot, dir);
      if (!fs.existsSync(abs)) return [];
      return fs
        .readdirSync(abs, { recursive: true })
        .filter((e) => /\.(mdx|md)$/.test(e))
        .map((e) => path.join(dir, e));
    });

  const inv = { pro: [], free: [], proAdmonition: [] };
  for (const dir of DOC_ROOTS) {
    for (const rel of list(dir)) {
      let content;
      try {
        content = read(rel);
      } catch {
        continue;
      }
      const classes = sidebarClasses(content);
      if (classes.includes('pro')) inv.pro.push(rel);
      if (classes.includes('free')) inv.free.push(rel);
      if (usesProAdmonition(content)) inv.proAdmonition.push(rel);
    }
  }
  inv.pro.sort();
  inv.free.sort();
  inv.proAdmonition.sort();
  return inv;
}

/**
 * Recent commits on the loft-sh/plans default branch. Returns [] (and logs)
 * when the repo cannot be read, so a forced run still produces a review issue.
 */
function fetchPlansCommits({ sinceDays = 7, now = new Date(), repo = PLANS_REPO, exec = defaultExec } = {}) {
  const since = new Date(now.getTime() - sinceDays * 86400 * 1000).toISOString();
  const raw = exec('gh', [
    'api',
    `repos/${repo}/commits?since=${encodeURIComponent(since)}&per_page=100`,
  ]);
  const arr = JSON.parse(raw || '[]');
  return arr.map((c) => ({
    sha: (c.sha || '').slice(0, 7),
    message: ((c.commit && c.commit.message) || '').split('\n')[0],
    date: (c.commit && c.commit.author && c.commit.author.date) || '',
    url: c.html_url || '',
  }));
}

function renderIssueBody({ commits, mismatches, inventory, sinceDays, force }) {
  const lines = [];
  lines.push(
    'A change in [loft-sh/plans](https://github.com/loft-sh/plans) may have shifted which features are Free vs Enterprise.'
  );
  lines.push(
    'The Feature Table is synced automatically, but the left-nav `Enterprise`/`Free` sidebar labels and the `ProAdmonition` partial are maintained by hand and can drift. Review them and update any that no longer match the plans.'
  );
  lines.push('');

  lines.push('## Triggering plans activity');
  lines.push('');
  if (commits && commits.length) {
    lines.push(`Commits on \`${PLANS_REPO}\` in the last ${sinceDays} day(s):`);
    lines.push('');
    for (const c of commits.slice(0, 30)) {
      const date = c.date ? c.date.slice(0, 10) : '';
      const link = c.url ? `[\`${c.sha}\`](${c.url})` : `\`${c.sha}\``;
      lines.push(`- ${link} ${date} ${c.message}`);
    }
    if (commits.length > 30) lines.push(`- ...and ${commits.length - 30} more`);
  } else if (force) {
    lines.push('Manually triggered review (no recent plans commits were read).');
  } else {
    lines.push(`No commits read on \`${PLANS_REPO}\` in the last ${sinceDays} day(s).`);
  }
  lines.push('');

  lines.push('## Suspected mismatches (best effort)');
  lines.push('');
  lines.push(
    'Computed by comparing each feature tier in `' +
      PRODUCTS_PATH +
      '` against the sidebar label on the feature page it maps to. Only whole-page, cleanly-resolved features are listed, so this is a starting point, not the full set. Confirm each before changing it.'
  );
  lines.push('');
  if (mismatches && mismatches.length) {
    lines.push('| Feature | Tier | Page | Issue |');
    lines.push('| --- | --- | --- | --- |');
    for (const m of mismatches) {
      lines.push(`| ${m.name} (\`${m.id}\`) | ${m.tier} | \`${m.file}\` | ${m.detail} |`);
    }
  } else {
    lines.push('None detected automatically. Review the inventory below by hand.');
  }
  lines.push('');

  lines.push('## Label inventory');
  lines.push('');
  lines.push(
    `Every live-docs page currently carrying a label or a ProAdmonition. Sources: \`sidebar_class_name\` frontmatter (rendered as badges by \`${SIDEBAR_CSS}\`) and \`${PRO_ADMONITION_PARTIAL}\`.`
  );
  lines.push('');
  const section = (heading, files) => {
    lines.push(`<details><summary>${heading} (${files.length})</summary>`);
    lines.push('');
    for (const f of files) lines.push(`- \`${f}\``);
    if (!files.length) lines.push('- _none_');
    lines.push('');
    lines.push('</details>');
    lines.push('');
  };
  section('Pages with the Enterprise (`pro`) sidebar label', inventory.pro);
  section('Pages with the `free` sidebar label', inventory.free);
  section('Pages using the ProAdmonition partial', inventory.proAdmonition);

  lines.push('## How to resolve');
  lines.push('');
  lines.push('1. Check the suspected mismatches above and confirm each against the current plans.');
  lines.push(
    '2. Flip `sidebar_class_name: pro` <-> `free` (or remove it) in the page frontmatter where the tier changed.'
  );
  lines.push(
    `3. Add or remove the \`<ProAdmonition />\` include (from \`${PRO_ADMONITION_PARTIAL}\`) to match.`
  );
  lines.push('4. Open a PR with the label changes and link it here.');
  lines.push('5. Close this issue once the labels match the plans.');
  lines.push('');
  lines.push('## Related');
  lines.push('');
  lines.push('- [DOC-1513](https://linear.app/loft/issue/DOC-1513): custom resources wrongly marked as Enterprise, the drift class this catches.');
  lines.push('- Feature Table sync: `.github/workflows/sync-upstream-features.yml`.');
  lines.push('');
  lines.push('<sub>Opened automatically by `.github/workflows/check-plans-sidebar-labels.yml`. Closes DOC-1523.</sub>');

  return lines.join('\n') + '\n';
}

function findOpenIssue({ label, exec = defaultExec }) {
  const raw = exec('gh', [
    'issue',
    'list',
    '--state',
    'open',
    '--label',
    label,
    '--json',
    'number',
    '--limit',
    '50',
  ]);
  const arr = JSON.parse(raw || '[]');
  return arr.length ? arr[0].number : null;
}

function ensureLabel({ label, exec = defaultExec }) {
  // --force makes this create-or-update and idempotent across runs. The orange
  // is the vCluster brand primary.
  try {
    exec('gh', [
      'label',
      'create',
      label,
      '--description',
      'Review docs sidebar Enterprise/Free labels after a loft-sh/plans change',
      '--color',
      'FF6600',
      '--force',
    ]);
  } catch {
    // Non-fatal: issue creation can still attach an existing label.
  }
}

/**
 * Open a fresh tracking issue, or update the one already open. A single open
 * issue at a time keeps weekly plans churn from spamming the tracker; the next
 * change after a reviewer closes it opens a new one.
 */
function openOrUpdateTrackingIssue({ title, body, label, exec = defaultExec }) {
  ensureLabel({ label, exec });
  const existing = findOpenIssue({ label, exec });
  if (existing) {
    exec('gh', ['issue', 'edit', String(existing), '--body', body]);
    exec('gh', [
      'issue',
      'comment',
      String(existing),
      '--body',
      'Re-checked after new loft-sh/plans activity. Body updated with the latest suspected mismatches and inventory.',
    ]);
    return { number: existing, action: 'updated' };
  }
  const out = exec('gh', ['issue', 'create', '--title', title, '--body', body, '--label', label]);
  const url = (out || '').trim().split('\n').pop();
  return { url, action: 'created' };
}

function appendGithubOutput(entries) {
  if (!process.env.GITHUB_OUTPUT) return;
  fs.appendFileSync(process.env.GITHUB_OUTPUT, entries.join('\n') + '\n');
}

function parseArgs(argv) {
  const opts = { openIssue: false, dryRun: false, force: false, sinceDays: 7 };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--open-issue') opts.openIssue = true;
    else if (argv[i] === '--dry-run') opts.dryRun = true;
    else if (argv[i] === '--force') opts.force = true;
    else if (argv[i] === '--since-days') {
      const v = argv[i + 1];
      if (!v || !/^\d+$/.test(v)) throw new Error('--since-days requires a positive integer');
      opts.sinceDays = parseInt(v, 10);
      i++;
    }
  }
  return opts;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const eventName = process.env.GITHUB_EVENT_NAME || '';
  const force = opts.force || eventName === 'workflow_dispatch' || eventName === 'repository_dispatch';

  const products = loadYaml(PRODUCTS_YAML);
  const features = loadYaml(FEATURES_YAML);

  const mismatches = crossCheck({ products, features });
  const inventory = buildInventory({});

  let commits = [];
  try {
    commits = fetchPlansCommits({ sinceDays: opts.sinceDays });
  } catch (e) {
    console.error(`Could not read ${PLANS_REPO} commits: ${e.message}`);
  }

  const plansChanged = commits.length > 0;
  const shouldAct = force || plansChanged;

  const body = renderIssueBody({
    commits,
    mismatches,
    inventory,
    sinceDays: opts.sinceDays,
    force,
  });

  if (opts.dryRun) {
    console.log(body);
  }

  console.error(
    `plans commits (last ${opts.sinceDays}d): ${commits.length}; suspected mismatches: ${mismatches.length}; ` +
      `labeled pages: pro=${inventory.pro.length} free=${inventory.free.length} proAdmonition=${inventory.proAdmonition.length}`
  );

  if (!shouldAct) {
    console.log(`No ${PLANS_REPO} commits in the last ${opts.sinceDays} day(s); no review needed.`);
    appendGithubOutput(['drift=false']);
    return 0;
  }

  if (opts.openIssue) {
    const res = openOrUpdateTrackingIssue({ title: ISSUE_TITLE, body, label: ISSUE_LABEL });
    const ref = res.url || `#${res.number}`;
    console.log(`Tracking issue ${res.action}: ${ref}`);
    appendGithubOutput(['drift=true', `issue=${ref}`]);
  } else {
    console.log(
      `Plans changed or run forced. ${mismatches.length} suspected mismatch(es). Re-run with --open-issue to file the review issue.`
    );
    appendGithubOutput(['drift=true']);
  }
  return 0;
}

module.exports = {
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
  ISSUE_TITLE,
  ISSUE_LABEL,
};

if (require.main === module) {
  try {
    process.exit(main());
  } catch (err) {
    console.error(err.stack || err.message);
    process.exit(2);
  }
}
