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
 *   - In current/main docs → shows latest from lifecycle API
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

// Load lifecycle data once at startup
let lifecycleData = null;

function loadLifecycleData(siteDir) {
  if (lifecycleData) return lifecycleData;

  try {
    const staticDir = path.join(siteDir, 'static', 'api', 'lifecycle');
    const platformJson = JSON.parse(fs.readFileSync(path.join(staticDir, 'platform.json'), 'utf-8'));
    const vclusterJson = JSON.parse(fs.readFileSync(path.join(staticDir, 'vcluster.json'), 'utf-8'));

    const getLatest = (data) => {
      const active = data.versions?.filter(v => v.status === 'active') || [];
      return active[0]?.version || data.versions?.[0]?.version || 'VERSION_NOT_FOUND';
    };

    lifecycleData = {
      platform: {
        latest: getLatest(platformJson),
        latestMinor: getLatest(platformJson)?.split('.')?.slice(0, 2)?.join('.') || 'VERSION_NOT_FOUND'
      },
      vcluster: {
        latest: getLatest(vclusterJson),
        latestMinor: getLatest(vclusterJson)?.split('.')?.slice(0, 2)?.join('.') || 'VERSION_NOT_FOUND'
      }
    };

    return lifecycleData;
  } catch (err) {
    console.warn('remark-version-tokens: Could not load lifecycle data:', err.message);
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
    const data = loadLifecycleData(siteDir);
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
