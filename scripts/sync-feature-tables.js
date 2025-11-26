#!/usr/bin/env node

/**
 * sync-feature-tables.js
 *
 * Automatically adds/updates FeatureTable components in documentation files
 * based on feature definitions in features.yaml.
 *
 * This script is idempotent - safe to run multiple times.
 *
 * Usage:
 *   node scripts/sync-feature-tables.js [--dry-run] [--verbose]
 *
 * Options:
 *   --dry-run   Show what would be changed without writing files
 *   --verbose   Show detailed output
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Configuration
const FEATURES_YAML = path.join(__dirname, '../src/data/features.yaml');
const DOCS_ROOT = path.join(__dirname, '../vcluster');
const FEATURE_TABLE_IMPORT = "import FeatureTable from '@site/src/components/FeatureTable';";

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isVerbose = args.includes('--verbose') || isDryRun;

// Statistics
const stats = {
  processed: 0,
  inserted: 0,
  updated: 0,
  skipped: 0,
  errors: 0,
  noMapping: 0
};

/**
 * Convert docs URL to file path
 * Example: /docs/vcluster/deploy/control-plane/high-availability
 * Returns: vcluster/deploy/control-plane/high-availability.mdx
 */
function urlToFilePath(docsUrl) {
  if (!docsUrl) return null;

  // Remove leading /docs/vcluster/ and trailing slash
  let filePath = docsUrl
    .replace(/^\/docs\/vcluster\//, '')
    .replace(/\/$/, '');

  // Add .mdx extension
  if (!filePath.endsWith('.mdx') && !filePath.endsWith('.md')) {
    filePath += '.mdx';
  }

  return path.join(DOCS_ROOT, filePath);
}

/**
 * Check if file path exists, try README.mdx if not
 */
function resolveFilePath(filePath) {
  if (fs.existsSync(filePath)) {
    return filePath;
  }

  // Try README.mdx
  const dir = path.dirname(filePath);
  const readmePath = path.join(dir, 'README.mdx');
  if (fs.existsSync(readmePath)) {
    return readmePath;
  }

  return null;
}

/**
 * Build mapping of document paths to feature IDs
 */
function buildFeatureDocumentMapping() {
  const featuresData = yaml.load(fs.readFileSync(FEATURES_YAML, 'utf8'));
  const mapping = {};

  for (const [featureId, featureData] of Object.entries(featuresData.features)) {
    if (!featureData.docs_url) {
      if (isVerbose) {
        console.log(`[WARN] Feature '${featureId}' has no docs_url, skipping`);
      }
      continue;
    }

    const filePath = urlToFilePath(featureData.docs_url);
    const resolvedPath = resolveFilePath(filePath);

    if (!resolvedPath) {
      if (isVerbose) {
        console.log(`[WARN] No file found for '${featureId}' at ${filePath}`);
      }
      stats.noMapping++;
      continue;
    }

    if (!mapping[resolvedPath]) {
      mapping[resolvedPath] = [];
    }
    mapping[resolvedPath].push(featureId);
  }

  return mapping;
}

/**
 * Check if FeatureTable already exists in content
 */
function hasFeatureTable(content) {
  return content.includes('<FeatureTable') || content.includes('FeatureTable names=');
}

/**
 * Extract existing feature IDs from FeatureTable component
 */
function extractExistingFeatures(content) {
  const match = content.match(/<FeatureTable\s+names=["']([^"']+)["']/);
  if (match) {
    return match[1].split(',').map(id => id.trim());
  }
  return [];
}

/**
 * Find insertion point after frontmatter and imports
 */
function findInsertionPoint(content) {
  const lines = content.split('\n');
  let inFrontmatter = false;
  let frontmatterEnd = -1;
  let lastImportLine = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect frontmatter boundaries
    if (line.trim() === '---') {
      if (frontmatterEnd === -1) {
        inFrontmatter = !inFrontmatter;
        if (!inFrontmatter) {
          frontmatterEnd = i;
        }
      }
      continue;
    }

    // After frontmatter ends, track imports
    if (frontmatterEnd !== -1 && !inFrontmatter) {
      if (line.startsWith('import ')) {
        lastImportLine = i;
      } else if (line.trim() !== '' && lastImportLine !== -1) {
        // Found first non-import content after imports
        return lastImportLine + 1;
      }
    }
  }

  // If we found imports, insert after them
  if (lastImportLine !== -1) {
    return lastImportLine + 1;
  }

  // If we found frontmatter end, insert after it
  if (frontmatterEnd !== -1) {
    return frontmatterEnd + 1;
  }

  // Fallback: insert at start
  return 0;
}

/**
 * Insert or update FeatureTable in document
 */
function insertOrUpdateFeatureTable(filePath, featureIds) {
  let content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  // Check if FeatureTable already exists
  if (hasFeatureTable(content)) {
    const existingFeatures = extractExistingFeatures(content);
    const newFeatures = [...new Set([...existingFeatures, ...featureIds])].sort();

    // Check if update needed
    if (JSON.stringify(existingFeatures.sort()) === JSON.stringify(newFeatures)) {
      if (isVerbose) {
        console.log(`[SKIP] ${path.relative(DOCS_ROOT, filePath)} - FeatureTable up to date`);
      }
      stats.skipped++;
      return false;
    }

    // Update existing FeatureTable
    const newNamesAttr = `names="${newFeatures.join(',')}"`;
    content = content.replace(
      /<FeatureTable\s+names=["'][^"']+["']\s*\/>/,
      `<FeatureTable ${newNamesAttr} />`
    );

    if (isDryRun) {
      console.log(`[UPDATE] Would update ${path.relative(DOCS_ROOT, filePath)}`);
      console.log(`   Old: ${existingFeatures.join(',')}`);
      console.log(`   New: ${newFeatures.join(',')}`);
    } else {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`[OK] Updated ${path.relative(DOCS_ROOT, filePath)}`);
    }

    stats.updated++;
    return true;
  }

  // Insert new FeatureTable
  const insertionPoint = findInsertionPoint(content);

  // Check if import already exists
  const needsImport = !content.includes(FEATURE_TABLE_IMPORT);

  const featureTableComponent = `<FeatureTable names="${featureIds.join(',')}" />`;

  // Build insertion content
  let insertionContent = [];
  if (needsImport) {
    insertionContent.push(FEATURE_TABLE_IMPORT);
    insertionContent.push('');
  }
  insertionContent.push(featureTableComponent);
  insertionContent.push('');

  // Insert at insertion point
  lines.splice(insertionPoint, 0, ...insertionContent);
  const newContent = lines.join('\n');

  if (isDryRun) {
    console.log(`[INSERT] Would insert FeatureTable in ${path.relative(DOCS_ROOT, filePath)}`);
    console.log(`   Features: ${featureIds.join(',')}`);
  } else {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`[OK] Inserted FeatureTable in ${path.relative(DOCS_ROOT, filePath)}`);
  }

  stats.inserted++;
  return true;
}

/**
 * Main execution
 */
function main() {
  console.log('>> Syncing FeatureTable components...\n');

  if (isDryRun) {
    console.log('[DRY RUN] No files will be modified\n');
  }

  // Build mapping
  console.log('Building feature -> document mapping...');
  const mapping = buildFeatureDocumentMapping();
  const documentCount = Object.keys(mapping).length;
  console.log(`[OK] Found ${documentCount} documents with features\n`);

  if (stats.noMapping > 0) {
    console.log(`[WARN] ${stats.noMapping} features have docs_url but no matching file\n`);
  }

  // Process each document
  console.log('Processing documents...\n');
  for (const [filePath, featureIds] of Object.entries(mapping)) {
    stats.processed++;
    try {
      insertOrUpdateFeatureTable(filePath, featureIds);
    } catch (error) {
      console.error(`[ERROR] Processing ${path.relative(DOCS_ROOT, filePath)}: ${error.message}`);
      stats.errors++;
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Documents processed:  ${stats.processed}`);
  console.log(`FeatureTables inserted: ${stats.inserted}`);
  console.log(`FeatureTables updated:  ${stats.updated}`);
  console.log(`Skipped (up to date): ${stats.skipped}`);
  console.log(`Errors:               ${stats.errors}`);
  if (stats.noMapping > 0) {
    console.log(`No file mapping:      ${stats.noMapping}`);
  }
  console.log('='.repeat(60));

  if (isDryRun) {
    console.log('\nTip: Run without --dry-run to apply changes');
    // Exit with error if there are pending changes (for CI validation)
    const hasChanges = stats.inserted > 0 || stats.updated > 0;
    if (hasChanges) {
      console.log('\n[ERROR] FeatureTables are out of sync!');
      console.log('Run: npm run sync-feature-tables');
      process.exit(1);
    }
  }

  process.exit(stats.errors > 0 ? 1 : 0);
}

// Run
main();
