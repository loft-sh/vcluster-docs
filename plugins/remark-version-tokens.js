/**
 * Remark plugin to replace version tokens with actual versions
 *
 * Tokens:
 *   __PLATFORM_VERSION__ - Current platform version (context-aware)
 *   __VCLUSTER_VERSION__ - Current vCluster version (context-aware)
 *   __PLATFORM_VERSION_MINOR__ - Platform minor version (e.g., "4.5")
 *   __VCLUSTER_VERSION_MINOR__ - vCluster minor version (e.g., "0.30")
 *
 * Context awareness:
 *   - In versioned docs (e.g., /platform/4.3.0/) → shows that version
 *   - In current/main docs → shows the latest stable patch release
 *
 * Usage in markdown:
 *   ```bash
 *   PLATFORM_VERSION=__PLATFORM_VERSION__
 *   helm install vcluster --version __VCLUSTER_VERSION__
 *   ```
 *
 *   The current version is __PLATFORM_VERSION__.
 */

const fs = require('fs');
const path = require('path');
const { visit } = require('unist-util-visit');

// Load the latest stable versions once at startup.
//
// Source of truth is src/data/latest-versions.json, which the daily
// sync-latest-versions workflow keeps pointed at the latest stable PATCH of
// each tracked minor, with prereleases filtered out. src/components/
// InterpolatedCodeBlock reads the same file, so a token resolves identically
// whether it sits in a plain markdown fence or inside that component.
//
// Deliberately NOT static/api/lifecycle/*.json. That data is generated from
// the support tables, tracks minor versions only, and gains a version when
// docs are versioned at RC time, so it names releases that have no published
// chart yet. Install commands built from it tell readers to pull a version
// that does not exist.
let latestVersions = null;

function loadLatestVersions(siteDir) {
  if (latestVersions) return latestVersions;

  try {
    const dataFile = path.join(siteDir, 'src', 'data', 'latest-versions.json');
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));

    const shape = (version) => ({
      latest: version || 'VERSION_NOT_FOUND',
      latestMinor: version?.split('.')?.slice(0, 2)?.join('.') || 'VERSION_NOT_FOUND'
    });

    latestVersions = {
      platform: shape(data.platform),
      vcluster: shape(data.vcluster)
    };

    return latestVersions;
  } catch (err) {
    console.warn('remark-version-tokens: Could not load latest versions:', err.message);
    return {
      platform: { latest: 'VERSION_NOT_FOUND', latestMinor: 'VERSION_NOT_FOUND' },
      vcluster: { latest: 'VERSION_NOT_FOUND', latestMinor: 'VERSION_NOT_FOUND' }
    };
  }
}

// Extract version from file path for versioned docs
function getVersionFromPath(filePath, product) {
  if (!filePath) return null;

  // Match patterns like:
  // platform_versioned_docs/version-4.3.0/...
  // vcluster_versioned_docs/version-0.29.0/...
  const versionedPattern = new RegExp(`${product}_versioned_docs/version-([\\d.]+)/`);
  const match = filePath.match(versionedPattern);

  return match ? match[1] : null;
}

function replaceTokens(text, versions) {
  if (!text || typeof text !== 'string') return text;

  return text
    .replace(/__PLATFORM_VERSION__/g, versions.platform.full)
    .replace(/__PLATFORM_VERSION_MINOR__/g, versions.platform.minor)
    .replace(/__VCLUSTER_VERSION__/g, versions.vcluster.full)
    .replace(/__VCLUSTER_VERSION_MINOR__/g, versions.vcluster.minor);
}

function remarkVersionTokens(options = {}) {
  const siteDir = options.siteDir || process.cwd();

  return (tree, file) => {
    const data = loadLatestVersions(siteDir);
    const filePath = file.path || file.history?.[0] || '';

    // Determine versions based on file path context
    const platformVersion = getVersionFromPath(filePath, 'platform');
    const vclusterVersion = getVersionFromPath(filePath, 'vcluster');

    const versions = {
      platform: {
        full: platformVersion || data.platform.latest,
        minor: platformVersion
          ? platformVersion.split('.').slice(0, 2).join('.')
          : data.platform.latestMinor
      },
      vcluster: {
        full: vclusterVersion || data.vcluster.latest,
        minor: vclusterVersion
          ? vclusterVersion.split('.').slice(0, 2).join('.')
          : data.vcluster.latestMinor
      }
    };

    // Visit all nodes and replace tokens in any text content
    visit(tree, (node) => {
      // Handle text nodes (regular markdown text)
      if (node.type === 'text' && node.value) {
        node.value = replaceTokens(node.value, versions);
      }

      // Handle inline code
      if (node.type === 'inlineCode' && node.value) {
        node.value = replaceTokens(node.value, versions);
      }

      // Handle code blocks
      if (node.type === 'code' && node.value) {
        node.value = replaceTokens(node.value, versions);
      }

      // Handle JSX/MDX text content
      if (node.type === 'mdxTextExpression' && node.value) {
        node.value = replaceTokens(node.value, versions);
      }

      // Handle raw HTML content
      if (node.type === 'html' && node.value) {
        node.value = replaceTokens(node.value, versions);
      }

      // Handle MDX JSX elements (admonitions become these)
      if ((node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') && node.children) {
        // Children are processed by the visitor, but check for text in attributes
        if (node.attributes) {
          node.attributes.forEach(attr => {
            if (attr.value && typeof attr.value === 'string') {
              attr.value = replaceTokens(attr.value, versions);
            }
          });
        }
      }
    });
  };
}

module.exports = remarkVersionTokens;
