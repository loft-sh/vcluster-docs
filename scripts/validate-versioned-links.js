#!/usr/bin/env node

/**
 * validate-versioned-links.js
 *
 * Validates that versioned docs don't contain cross-version links.
 *
 * Rules:
 * - Links in versioned docs should be relative or same-version absolute
 * - /docs/platform/X.Y.Z/... in platform_versioned_docs/version-X.Y.Z/ is OK
 * - /docs/vcluster/X.Y.Z/... in vcluster_versioned_docs/version-X.Y.Z/ is OK
 * - /docs/platform/... (unversioned) in versioned docs is NOT OK
 * - /docs/vcluster/next/... in versioned docs is NOT OK
 * - /docs/platform/A.B.C/... where file is in version-X.Y.Z is NOT OK
 *
 * Usage:
 *   npm run validate-versioned-links
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Match markdown links: [text](/docs/...) and href="/docs/..."
// Also match full URLs: https://...vcluster.com/docs/...
const linkPatterns = [
  /\]\(\/docs\/(platform|vcluster)(\/[^)]*)\)/g,
  /href="\/docs\/(platform|vcluster)(\/[^"]*)"/g,
  /\]\(https?:\/\/(?:www\.)?vcluster\.com\/docs\/(platform|vcluster)(\/[^)]*)\)/g,
];

// Extract version from path: version-X.Y.Z -> X.Y.Z
function extractVersionFromPath(filePath) {
  const match = filePath.match(/version-(\d+\.\d+\.\d+)/);
  return match ? match[1] : null;
}

// Extract version from URL: /docs/platform/4.5.0/... -> 4.5.0
// Returns null for unversioned URLs like /docs/platform/configure/...
function extractVersionFromUrl(urlPath) {
  const match = urlPath.match(/^\/(\d+\.\d+\.\d+)(\/|$)/);
  return match ? match[1] : null;
}

// Check if URL path starts with "next/"
function isNextVersion(urlPath) {
  return urlPath.startsWith('/next/') || urlPath === '/next';
}

function validateFile(filePath, fileVersion, docType) {
  const content = fs.readFileSync(filePath, 'utf8');
  const errors = [];

  for (const pattern of linkPatterns) {
    // Reset regex state
    pattern.lastIndex = 0;
    let match;

    while ((match = pattern.exec(content)) !== null) {
      const linkDocType = match[1]; // 'platform' or 'vcluster'
      const urlPath = match[2]; // everything after /docs/platform or /docs/vcluster

      // Skip cross-section links (platform file linking to vcluster or vice versa)
      // These are expected to use absolute paths
      if (linkDocType !== docType) {
        continue;
      }

      const linkVersion = extractVersionFromUrl(urlPath);

      // Check for "next" version references
      if (isNextVersion(urlPath)) {
        const lineNum = content.substring(0, match.index).split('\n').length;
        errors.push({
          file: filePath,
          line: lineNum,
          link: match[0],
          reason: `Links to /docs/${linkDocType}/next/ which points to development version`,
        });
        continue;
      }

      if (linkVersion === null) {
        // Unversioned URL like /docs/platform/configure/...
        const lineNum = content.substring(0, match.index).split('\n').length;
        errors.push({
          file: filePath,
          line: lineNum,
          link: match[0],
          reason: `Unversioned link should be /docs/${linkDocType}/${fileVersion}${urlPath}`,
        });
      } else if (linkVersion !== fileVersion) {
        // Wrong version
        const lineNum = content.substring(0, match.index).split('\n').length;
        errors.push({
          file: filePath,
          line: lineNum,
          link: match[0],
          reason: `Links to version ${linkVersion} but file is in version ${fileVersion}`,
        });
      }
      // else: correct version, no error
    }
  }

  return errors;
}

function main() {
  const allErrors = [];

  // Scan platform versioned docs (both .md and .mdx files)
  const platformFiles = glob.sync('platform_versioned_docs/version-*/**/*.{md,mdx}', {
    ignore: ['**/node_modules/**'],
  });

  for (const filePath of platformFiles) {
    const version = extractVersionFromPath(filePath);
    if (version) {
      const errors = validateFile(filePath, version, 'platform');
      allErrors.push(...errors);
    }
  }

  // Scan vcluster versioned docs (both .md and .mdx files)
  const vclusterFiles = glob.sync('vcluster_versioned_docs/version-*/**/*.{md,mdx}', {
    ignore: ['**/node_modules/**'],
  });

  for (const filePath of vclusterFiles) {
    const version = extractVersionFromPath(filePath);
    if (version) {
      const errors = validateFile(filePath, version, 'vcluster');
      allErrors.push(...errors);
    }
  }

  if (allErrors.length > 0) {
    console.error('\nCross-version link errors found:\n');
    for (const error of allErrors) {
      console.error(`${error.file}:${error.line}`);
      console.error(`  Link: ${error.link}`);
      console.error(`  Error: ${error.reason}\n`);
    }
    console.error(`\nTotal: ${allErrors.length} error(s)`);
    console.error('\nFix these links to use relative paths or same-version absolute paths.');
    process.exit(1);
  } else {
    console.log('\nAll versioned docs links are valid.');
    process.exit(0);
  }
}

main();
