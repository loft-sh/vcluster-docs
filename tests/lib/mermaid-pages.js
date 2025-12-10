/**
 * Mermaid Page Discovery Utility
 *
 * Discovers pages containing mermaid diagrams for testing.
 * Handles underscore folders (_fragments, _partials) by tracing imports.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const DOCS_FOLDERS = ['vcluster', 'platform'];

/**
 * Find all MDX files containing mermaid diagrams in main docs (not versioned)
 */
function findMermaidFiles() {
  const mermaidFiles = [];

  for (const folder of DOCS_FOLDERS) {
    const folderPath = path.join(REPO_ROOT, folder);
    if (!fs.existsSync(folderPath)) continue;

    try {
      const result = execSync(
        `grep -rl '\`\`\`mermaid' --include="*.mdx" "${folderPath}" 2>/dev/null || true`,
        { encoding: 'utf-8' }
      );

      const files = result.trim().split('\n').filter(Boolean);
      mermaidFiles.push(...files);
    } catch (e) {
      // grep returns non-zero if no matches
    }
  }

  return mermaidFiles;
}

/**
 * Check if a file is in an underscore folder (partial/fragment)
 */
function isUnderscoreFile(filePath) {
  return filePath.includes('/_partials/') || filePath.includes('/_fragments/');
}

/**
 * Find host pages that import a given underscore file
 */
function findHostPages(underscoreFile) {
  const filename = path.basename(underscoreFile);
  const hostPages = [];

  for (const folder of DOCS_FOLDERS) {
    const folderPath = path.join(REPO_ROOT, folder);
    if (!fs.existsSync(folderPath)) continue;

    try {
      // Search for import statements referencing this file
      const result = execSync(
        `grep -rl "${filename}" --include="*.mdx" "${folderPath}" 2>/dev/null || true`,
        { encoding: 'utf-8' }
      );

      const files = result.trim().split('\n').filter(Boolean);
      // Filter out underscore files - we want actual pages
      const pages = files.filter(f => !isUnderscoreFile(f));
      hostPages.push(...pages);
    } catch (e) {
      // grep returns non-zero if no matches
    }
  }

  return [...new Set(hostPages)]; // dedupe
}

/**
 * Convert file path to URL path
 * e.g., /repo/vcluster/deploy/foo.mdx -> /docs/vcluster/deploy/foo
 */
function filePathToUrl(filePath) {
  // Get path relative to repo root
  let relativePath = filePath.replace(REPO_ROOT + '/', '');

  // Remove .mdx extension
  relativePath = relativePath.replace(/\.mdx$/, '');

  // Handle README.mdx (folder index)
  relativePath = relativePath.replace(/\/README$/, '');

  return `/docs/${relativePath}`;
}

/**
 * Get list of changed files from git (for PR context)
 * Uses PR_BASE_SHA/PR_HEAD_SHA in CI, or compares against main locally
 */
function getChangedFiles() {
  try {
    let cmd;
    if (process.env.PR_BASE_SHA && process.env.PR_HEAD_SHA) {
      // CI: use exact PR commit range
      cmd = `git diff --name-only ${process.env.PR_BASE_SHA}...${process.env.PR_HEAD_SHA}`;
    } else {
      // Local: compare against main
      cmd = 'git diff --name-only origin/main...HEAD 2>/dev/null || git diff --name-only HEAD~1';
    }

    const result = execSync(cmd, { encoding: 'utf-8', cwd: REPO_ROOT });
    return result.trim().split('\n').filter(Boolean);
  } catch (e) {
    console.warn('[mermaid-pages] Could not get changed files from git, will test all pages');
    return null;
  }
}

/**
 * Build complete mapping of mermaid files to testable URLs
 */
function buildMermaidPageMap() {
  const mermaidFiles = findMermaidFiles();
  const pageMap = new Map(); // URL -> [source files that affect it]

  for (const file of mermaidFiles) {
    if (isUnderscoreFile(file)) {
      // Find pages that import this partial/fragment
      const hostPages = findHostPages(file);
      for (const hostPage of hostPages) {
        const url = filePathToUrl(hostPage);
        if (!pageMap.has(url)) {
          pageMap.set(url, []);
        }
        pageMap.get(url).push(file);
        // Also track the host page itself as a source
        if (!pageMap.get(url).includes(hostPage)) {
          pageMap.get(url).push(hostPage);
        }
      }
    } else {
      // Direct page with mermaid
      const url = filePathToUrl(file);
      if (!pageMap.has(url)) {
        pageMap.set(url, []);
      }
      pageMap.get(url).push(file);
    }
  }

  return pageMap;
}

/**
 * Detect if running in CI environment
 */
function isCI() {
  return !!(process.env.CI || process.env.PR_BASE_SHA || process.env.GITHUB_ACTIONS);
}

/**
 * Get URLs to test based on changed files
 * Returns all URLs if: local run, no changes detected, or FULL_MERMAID_TEST=true
 */
function getUrlsToTest(options = {}) {
  const { fullRun = false } = options;
  const pageMap = buildMermaidPageMap();

  // Local runs always test all pages
  if (!isCI()) {
    console.log(`[mermaid-pages] Local run, testing all ${pageMap.size} pages`);
    return Array.from(pageMap.keys());
  }

  if (fullRun || process.env.FULL_MERMAID_TEST === 'true') {
    console.log(`[mermaid-pages] Full run requested, testing all ${pageMap.size} pages`);
    return Array.from(pageMap.keys());
  }

  const changedFiles = getChangedFiles();

  if (!changedFiles) {
    console.log('[mermaid-pages] Could not determine changed files, testing all pages');
    return Array.from(pageMap.keys());
  }

  // Normalize changed file paths to absolute
  const changedAbsolute = changedFiles.map(f =>
    path.isAbsolute(f) ? f : path.join(REPO_ROOT, f)
  );

  // Find URLs affected by changed files
  const affectedUrls = new Set();

  for (const [url, sourceFiles] of pageMap.entries()) {
    for (const sourceFile of sourceFiles) {
      if (changedAbsolute.some(changed =>
        changed === sourceFile ||
        sourceFile.endsWith(changed) ||
        changed.endsWith(sourceFile.replace(REPO_ROOT + '/', ''))
      )) {
        affectedUrls.add(url);
        break;
      }
    }
  }

  if (affectedUrls.size === 0) {
    console.log('[mermaid-pages] No mermaid-related changes detected');
    return [];
  }

  console.log(`[mermaid-pages] Found ${affectedUrls.size} pages affected by changes`);
  return Array.from(affectedUrls);
}

/**
 * Get all mermaid source files (for CI path filtering reference)
 */
function getAllMermaidSourceFiles() {
  const pageMap = buildMermaidPageMap();
  const allFiles = new Set();

  for (const sourceFiles of pageMap.values()) {
    sourceFiles.forEach(f => allFiles.add(f.replace(REPO_ROOT + '/', '')));
  }

  return Array.from(allFiles).sort();
}

module.exports = {
  findMermaidFiles,
  isUnderscoreFile,
  findHostPages,
  filePathToUrl,
  getChangedFiles,
  buildMermaidPageMap,
  getUrlsToTest,
  getAllMermaidSourceFiles,
  REPO_ROOT,
  DOCS_FOLDERS
};

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--list-all')) {
    const pageMap = buildMermaidPageMap();
    console.log('All pages with mermaid diagrams:\n');
    for (const [url, sources] of pageMap.entries()) {
      console.log(`${url}`);
      sources.forEach(s => console.log(`  <- ${s.replace(REPO_ROOT + '/', '')}`));
    }
  } else if (args.includes('--list-files')) {
    const files = getAllMermaidSourceFiles();
    console.log('Mermaid source files (for CI paths):\n');
    files.forEach(f => console.log(f));
  } else if (args.includes('--urls-to-test')) {
    const urls = getUrlsToTest();
    if (urls.length === 0) {
      console.log('No pages to test');
    } else {
      urls.forEach(u => console.log(u));
    }
  } else {
    console.log('Usage:');
    console.log('  --list-all      List all pages with mermaid diagrams and their sources');
    console.log('  --list-files    List all source files containing mermaid (for CI)');
    console.log('  --urls-to-test  List URLs to test based on changed files');
    console.log('\nEnvironment variables:');
    console.log('  CHANGED_FILES      Newline-separated list of changed files');
    console.log('  FULL_MERMAID_TEST  Set to "true" to test all pages');
  }
}
