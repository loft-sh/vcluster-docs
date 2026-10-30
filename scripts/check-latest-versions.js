#!/usr/bin/env node

/**
 * Sync src/data/latest-versions.json with the latest stable patch release of
 * the minor each product's docs serve as stable.
 *
 * That file is the single source of truth for the version tokens. It is read
 * by src/components/InterpolatedCodeBlock (render time) and by
 * plugins/remark-version-tokens.js (build time), so __PLATFORM_VERSION__ and
 * __VCLUSTER_VERSION__ resolve identically in plain markdown fences and in
 * interpolated code blocks.
 *
 * The tracked minor is the `lastVersion` of each docs plugin in
 * docusaurus.config.js. The release process moves `lastVersion` when a minor
 * goes GA, because the stable docs root is built from it, so a new minor
 * reaches this file on the next sync with no separate edit. versions.json is
 * not a substitute: docs are versioned at RC time, so it lists a minor before
 * that minor has a stable release. A minor with no stable release is refused,
 * never written.
 *
 * Usage:
 *   node scripts/check-latest-versions.js            # check, exit 1 on drift
 *   node scripts/check-latest-versions.js --update   # write updated file
 *
 * Outputs (when GITHUB_OUTPUT is set and --update applied changes):
 *   changed=true
 *   summary=<human-readable list of bumps>
 */

const fs = require('fs');
const path = require('path');

const TARGETS = {
  vcluster: { repo: 'loft-sh/vcluster' },
  platform: { repo: 'loft-sh/loft' },
};

const PRERELEASE_MARKERS = ['-next', '-alpha', '-rc', '-beta'];

const TARGET_FILE = path.join(__dirname, '..', 'src', 'data', 'latest-versions.json');
const CONFIG_FILE = path.join(__dirname, '..', 'docusaurus.config.js');

function getMinor(version) {
  return version.split('.').slice(0, 2).join('.');
}

// Reads the config as text: the sync workflow runs without `npm ci`, and
// loading the config would pull in every plugin it imports. The match stays
// inside one plugin block (it may not cross another `id:`), because other
// plugins set their own lastVersion, for example "current".
function parseLastVersions(configText) {
  const out = {};
  for (const key of Object.keys(TARGETS)) {
    const re = new RegExp(
      `\\bid:\\s*["']${key}["'](?:(?!\\bid:)[\\s\\S])*?\\blastVersion:\\s*["'](\\d+\\.\\d+\\.\\d+)["']`
    );
    const m = configText.match(re);
    if (!m) {
      throw new Error(`No semver lastVersion for the '${key}' docs plugin in ${CONFIG_FILE}`);
    }
    out[key] = m[1];
  }
  return out;
}

function readCurrentVersions(content) {
  let data;
  try {
    data = JSON.parse(content);
  } catch (err) {
    throw new Error(`Could not parse ${TARGET_FILE}: ${err.message}`);
  }
  for (const key of Object.keys(TARGETS)) {
    if (typeof data[key] !== 'string') {
      throw new Error(`Missing or non-string '${key}' in ${TARGET_FILE}`);
    }
  }
  return data;
}

// Preserves any other keys in the file (for example the _comment banner) so
// the daily sync only ever rewrites the version values.
function applyUpdate(content, next) {
  const data = JSON.parse(content);
  for (const key of Object.keys(TARGETS)) {
    data[key] = next[key];
  }
  return `${JSON.stringify(data, null, 2)}\n`;
}

function selectLatestPatch(releases, minor) {
  const candidates = releases
    .filter((r) => r.prerelease === false && r.draft === false)
    .map((r) => r.tag_name)
    .filter((t) => !PRERELEASE_MARKERS.some((m) => t.includes(m)))
    .map((t) => t.replace(/^v/, ''))
    .filter((v) => /^\d+\.\d+\.\d+$/.test(v))
    .filter((v) => getMinor(v) === minor);

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => {
    const pa = parseInt(a.split('.')[2], 10);
    const pb = parseInt(b.split('.')[2], 10);
    return pb - pa;
  });
  return candidates[0];
}

async function fetchReleases(repo) {
  const url = `https://api.github.com/repos/${repo}/releases?per_page=100`;
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'vcluster-docs-version-sync',
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub API ${res.status} for ${repo}: ${body}`);
  }
  return res.json();
}

function appendGithubOutput(lines) {
  if (!process.env.GITHUB_OUTPUT) return;
  fs.appendFileSync(process.env.GITHUB_OUTPUT, lines.join('\n') + '\n');
}

async function main() {
  const update = process.argv.includes('--update');

  const content = fs.readFileSync(TARGET_FILE, 'utf8');
  const current = readCurrentVersions(content);
  const lastVersions = parseLastVersions(fs.readFileSync(CONFIG_FILE, 'utf8'));

  const latest = {};
  for (const [key, { repo }] of Object.entries(TARGETS)) {
    const minor = getMinor(lastVersions[key]);
    const v = selectLatestPatch(await fetchReleases(repo), minor);
    if (!v) {
      console.error(
        `No stable release found for ${repo} matching minor ${minor} ` +
          `(docs lastVersion ${lastVersions[key]}). ` +
          `Refusing to change ${key} (currently '${current[key]}').`
      );
      process.exit(2);
    }
    latest[key] = v;
  }

  const drift = Object.keys(TARGETS).filter((k) => current[k] !== latest[k]);

  console.log(`Current: vcluster=${current.vcluster} platform=${current.platform}`);
  console.log(`Latest:  vcluster=${latest.vcluster}  platform=${latest.platform}`);

  if (drift.length === 0) {
    console.log('LATEST_VERSIONS is in sync with the latest stable patches.');
    appendGithubOutput(['changed=false']);
    return;
  }

  const summary = drift.map((k) => `${k} ${current[k]}→${latest[k]}`).join(', ');
  console.log(`Drift detected: ${summary}`);

  if (!update) {
    console.error('');
    console.error(
      'LATEST_VERSIONS is stale. Run `node scripts/check-latest-versions.js --update` ' +
        'or wait for the daily sync workflow to open a PR.'
    );
    appendGithubOutput(['changed=true', `summary=${summary}`]);
    process.exit(1);
  }

  const next = { ...current };
  for (const k of drift) next[k] = latest[k];
  fs.writeFileSync(TARGET_FILE, applyUpdate(content, next));
  console.log(`Wrote ${path.relative(process.cwd(), TARGET_FILE)}`);

  appendGithubOutput([
    'changed=true',
    `summary=${summary}`,
    `vcluster_version=${next.vcluster}`,
    `platform_version=${next.platform}`,
  ]);
}

module.exports = {
  getMinor,
  parseLastVersions,
  readCurrentVersions,
  applyUpdate,
  selectLatestPatch,
};

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
