#!/usr/bin/env node

/**
 * Generate JSON lifecycle endpoints from MDX partials
 *
 * Reads:
 *   - docs/_partials/vcluster_supported_versions.mdx
 *   - docs/_partials/platform_supported_versions.mdx
 *
 * Writes:
 *   - static/api/lifecycle/vcluster.json
 *   - static/api/lifecycle/platform.json
 *
 * Schema: Follows .claude/specs/ops-409-json-endpoint/proofs/json-endpoint-validation/CONTRACT.md
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

/**
 * Parse date from "Month Day, Year" format to ISO 8601 (YYYY-MM-DD)
 */
function parseDate(dateStr) {
  if (!dateStr || dateStr.trim() === '') return null;

  // Handle special cases like "April 1, 2025*" (with asterisk)
  const cleaned = dateStr.replace(/\*/, '').trim();

  const months = {
    'January': '01', 'February': '02', 'March': '03', 'April': '04',
    'May': '05', 'June': '06', 'July': '07', 'August': '08',
    'September': '09', 'October': '10', 'November': '11', 'December': '12',
    'Aug': '08'  // Handle abbreviated months
  };

  // Parse "Month Day, Year"
  const match = cleaned.match(/(\w+)\s+(\d+),\s+(\d{4})/);
  if (!match) {
    console.warn(`Warning: Could not parse date "${dateStr}"`);
    return null;
  }

  const [_, month, day, year] = match;
  const monthNum = months[month];

  if (!monthNum) {
    console.warn(`Warning: Unknown month "${month}" in date "${dateStr}"`);
    return null;
  }

  return `${year}-${monthNum}-${day.padStart(2, '0')}`;
}

/**
 * Calculate version status based on dates
 */
function calculateStatus(eosDate, eolDate) {
  if (!eosDate) return 'active';

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  if (today < eosDate) return 'active';
  if (today >= eosDate && today < eolDate) return 'eos';
  if (today >= eolDate) return 'eol';

  return 'active';  // Default fallback
}

/**
 * Parse MDX table into version objects
 */
function parseMDXTable(content, product) {
  const versions = [];

  // Extract table rows
  const tableMatch = content.match(/<tbody>([\s\S]*?)<\/tbody>/);
  if (!tableMatch) {
    throw new Error(`No table found in ${product} partial`);
  }

  const tbody = tableMatch[1];
  const rows = tbody.match(/<tr>[\s\S]*?<\/tr>/g) || [];

  let extendedSupportNote = null;

  for (const row of rows) {
    // Skip separator rows
    if (row.includes('colspan') || row.includes('no longer supported')) {
      continue;
    }

    // Extract cells
    const cells = row.match(/<td[^>]*>(.*?)<\/td>/g) || [];
    if (cells.length < 4) continue;

    const extractText = (cell) => cell.replace(/<[^>]+>/g, '').trim();

    const version = extractText(cells[0]);
    const releaseDate = extractText(cells[1]);
    const eosDate = extractText(cells[2]);
    const eolDate = extractText(cells[3]);

    // Check for extended support note (asterisk)
    if (eosDate.includes('*')) {
      extendedSupportNote = `Extended support: Due to breaking changes, this version has extended support period.`;
    }

    const versionObj = {
      version: version.replace('v', '') + '.0',  // v0.30 → 0.30.0
      releaseDate: parseDate(releaseDate),
      status: calculateStatus(parseDate(eosDate), parseDate(eolDate)),
      eosDate: parseDate(eosDate),
      eolDate: parseDate(eolDate)
    };

    // Add notes for extended support versions
    if (eosDate.includes('*') && extendedSupportNote) {
      versionObj.notes = extendedSupportNote;
    }

    versions.push(versionObj);
  }

  return versions;
}

/**
 * Generate JSON for a product
 */
function generateJSON(partialPath, product) {
  console.log(`\n📋 Processing ${product}...`);

  const content = readFileSync(partialPath, 'utf-8');
  const versions = parseMDXTable(content, product);

  console.log(`   Found ${versions.length} versions`);
  console.log(`   Active: ${versions.filter(v => v.status === 'active').length}`);
  console.log(`   EOS: ${versions.filter(v => v.status === 'eos').length}`);
  console.log(`   EOL: ${versions.filter(v => v.status === 'eol').length}`);

  const json = {
    product,
    lastUpdated: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    versions
  };

  return json;
}

/**
 * Main execution
 */
function main() {
  console.log('='.repeat(70));
  console.log('Generating JSON Lifecycle Endpoints from MDX Partials');
  console.log('='.repeat(70));

  try {
    // Generate vCluster JSON
    const vclusterPartial = join(rootDir, 'docs/_partials/vcluster_supported_versions.mdx');
    const vclusterJSON = generateJSON(vclusterPartial, 'vCluster');
    const vclusterOutput = join(rootDir, 'static/api/lifecycle/vcluster.json');
    writeFileSync(vclusterOutput, JSON.stringify(vclusterJSON, null, 2) + '\n');
    console.log(`   ✅ Written to ${vclusterOutput}`);

    // Generate Platform JSON
    const platformPartial = join(rootDir, 'docs/_partials/platform_supported_versions.mdx');
    const platformJSON = generateJSON(platformPartial, 'Platform');
    const platformOutput = join(rootDir, 'static/api/lifecycle/platform.json');
    writeFileSync(platformOutput, JSON.stringify(platformJSON, null, 2) + '\n');
    console.log(`   ✅ Written to ${platformOutput}`);

    console.log('\n' + '='.repeat(70));
    console.log('✅ JSON endpoints generated successfully');
    console.log('='.repeat(70));
    console.log('\nNext steps:');
    console.log('  1. Validate: npm run validate-lifecycle-json');
    console.log('  2. Test queries: cd .claude/specs/ops-409-json-endpoint/proofs/json-endpoint-validation && npm test');
    console.log('  3. Commit changes');

  } catch (error) {
    console.error('\n❌ Error generating JSON:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
