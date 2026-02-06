#!/usr/bin/env node
/**
 * Check that moved/deleted pages have corresponding redirects in netlify.toml
 *
 * Compares current docs structure against versioned docs to find paths that
 * existed in older versions but not in current. For each missing path, checks
 * if a Netlify redirect exists.
 *
 * Usage: node scripts/check-redirect-coverage.js
 *
 * Exit codes:
 *   0 - All moved pages have redirects
 *   1 - Missing redirects found
 */

const fs = require('fs');
const path = require('path');

const DOCS_ROOT = process.cwd();

// Docs to check: [currentPath, versionedPath, urlPrefix]
const DOCS_TO_CHECK = [
  ['platform', 'platform_versioned_docs/version-4.5.0', '/docs/platform'],
  // Add vcluster when needed
];

function getAllMdxPaths(dir, basePath = '') {
  const paths = new Set();

  if (!fs.existsSync(dir)) return paths;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(basePath, entry.name);

    if (entry.isDirectory() && !entry.name.startsWith('_')) {
      // Recurse into subdirectories
      const subPaths = getAllMdxPaths(fullPath, relativePath);
      subPaths.forEach(p => paths.add(p));
    } else if (entry.isFile() && entry.name.endsWith('.mdx') && !entry.name.startsWith('_')) {
      // Add mdx file path (without extension)
      const urlPath = relativePath.replace(/\.mdx$/, '').replace(/\/index$/, '');
      paths.add(urlPath);
    }
  }

  return paths;
}

function parseNetlifyRedirects(tomlPath) {
  const redirects = new Set();

  if (!fs.existsSync(tomlPath)) return redirects;

  const content = fs.readFileSync(tomlPath, 'utf-8');
  const fromMatches = content.matchAll(/from\s*=\s*"([^"]+)"/g);

  for (const match of fromMatches) {
    // Normalize: remove trailing slash and /docs prefix for comparison
    let fromPath = match[1].replace(/\/$/, '');
    redirects.add(fromPath);
  }

  return redirects;
}

function checkRedirectCoverage() {
  const netlifyPath = path.join(DOCS_ROOT, 'netlify.toml');
  const existingRedirects = parseNetlifyRedirects(netlifyPath);

  const missingRedirects = [];

  for (const [currentDir, versionedDir, urlPrefix] of DOCS_TO_CHECK) {
    const currentPaths = getAllMdxPaths(path.join(DOCS_ROOT, currentDir));
    const versionedPaths = getAllMdxPaths(path.join(DOCS_ROOT, versionedDir));

    // Find paths that exist in versioned but not in current
    for (const oldPath of versionedPaths) {
      // Skip index pages - they're category landing pages handled by Docusaurus
      if (oldPath === 'index' || oldPath.endsWith('/index')) continue;

      if (!currentPaths.has(oldPath)) {
        // This path was removed/moved - check if redirect exists
        const expectedRedirect = `${urlPrefix}/${oldPath}`;
        const expectedRedirectNext = `${urlPrefix}/next/${oldPath}`;

        const hasRedirect = existingRedirects.has(expectedRedirect) ||
                           existingRedirects.has(expectedRedirectNext) ||
                           // Check for wildcard redirects
                           [...existingRedirects].some(r => {
                             const pattern = r.replace(/\*/g, '.*').replace(/:\w+/g, '[^/]+');
                             return new RegExp(`^${pattern}$`).test(expectedRedirect);
                           });

        if (!hasRedirect) {
          missingRedirects.push({
            oldPath,
            expectedRedirect,
            versionedDir
          });
        }
      }
    }
  }

  return missingRedirects;
}

// Main
const missing = checkRedirectCoverage();

if (missing.length === 0) {
  console.log('✓ All moved/deleted pages have redirects');
  process.exit(0);
} else {
  console.log('✗ Missing redirects for moved/deleted pages:\n');

  for (const { oldPath, expectedRedirect, versionedDir } of missing) {
    console.log(`  ${expectedRedirect}`);
    console.log(`    (was in: ${versionedDir}/${oldPath}.mdx)\n`);
  }

  console.log('\nAdd these to netlify.toml or verify the pages were intentionally removed.');
  process.exit(1);
}
