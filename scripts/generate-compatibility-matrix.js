#!/usr/bin/env node

/**
 * Update the Kubernetes compatibility matrix JSON.
 *
 * When a new Kubernetes version is released:
 *   1. Run: node scripts/generate-compatibility-matrix.js --add 1.35
 *   2. The script adds a new row/column with "compatible" defaults.
 *      The new same-version diagonal cell (host 1.35 / vcluster 1.35)
 *      is marked "tested". All other new cells default to "compatible".
 *   3. Optionally prune the oldest version: --prune 1.29
 *   4. Manually adjust cells in the JSON if conformance tests reveal
 *      different results.
 *
 * Without arguments, validates the existing JSON structure.
 *
 * Reads/Writes: static/api/k8s-compatibility.json
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const jsonPath = join(rootDir, 'static/api/k8s-compatibility.json');

function loadData() {
  return JSON.parse(readFileSync(jsonPath, 'utf-8'));
}

function saveData(data) {
  data.lastUpdated = new Date().toISOString().split('T')[0];
  writeFileSync(jsonPath, JSON.stringify(data, null, 2) + '\n');
}

/**
 * Compare Kubernetes version strings numerically.
 * "1.34" > "1.33", "1.9" < "1.10"
 */
function compareVersions(a, b) {
  const [aMajor, aMinor] = a.split('.').map(Number);
  const [bMajor, bMinor] = b.split('.').map(Number);
  return bMajor - aMajor || bMinor - aMinor; // descending
}

function addVersion(data, newVersion) {
  if (data.kubernetesVersions.includes(newVersion)) {
    console.error(`Version ${newVersion} already exists in the matrix.`);
    process.exit(1);
  }

  // Insert in sorted position (descending)
  data.kubernetesVersions.push(newVersion);
  data.kubernetesVersions.sort(compareVersions);

  // Add new column to every existing row (default: "compatible")
  for (const row of data.matrix) {
    row.vcluster[newVersion] = 'compatible';
  }

  // Add new row for the new host version
  const vcluster = {};
  for (const v of data.kubernetesVersions) {
    // Same-version diagonal = "tested", everything else = "compatible"
    vcluster[v] = v === newVersion ? 'tested' : 'compatible';
  }

  // Insert row at the correct sorted position
  const insertIdx = data.kubernetesVersions.indexOf(newVersion);
  data.matrix.splice(insertIdx, 0, { host: newVersion, vcluster });

  console.log(`Added Kubernetes ${newVersion}. Matrix now covers: ${data.kubernetesVersions.join(', ')}`);
  return data;
}

function pruneVersion(data, oldVersion) {
  const idx = data.kubernetesVersions.indexOf(oldVersion);
  if (idx === -1) {
    console.error(`Version ${oldVersion} not found in the matrix.`);
    process.exit(1);
  }

  // Remove from version list
  data.kubernetesVersions.splice(idx, 1);

  // Remove the row for this host version
  data.matrix = data.matrix.filter(row => row.host !== oldVersion);

  // Remove the column from every remaining row
  for (const row of data.matrix) {
    delete row.vcluster[oldVersion];
  }

  console.log(`Pruned Kubernetes ${oldVersion}. Matrix now covers: ${data.kubernetesVersions.join(', ')}`);
  return data;
}

function validate(data) {
  const errors = [];

  if (!Array.isArray(data.kubernetesVersions) || data.kubernetesVersions.length === 0) {
    errors.push('kubernetesVersions must be a non-empty array');
  }

  if (!Array.isArray(data.matrix)) {
    errors.push('matrix must be an array');
  } else {
    if (data.matrix.length !== data.kubernetesVersions.length) {
      errors.push(`matrix has ${data.matrix.length} rows but kubernetesVersions has ${data.kubernetesVersions.length} entries`);
    }

    const validStatuses = Object.keys(data.statuses || {});

    for (const row of data.matrix) {
      if (!data.kubernetesVersions.includes(row.host)) {
        errors.push(`matrix row host "${row.host}" not in kubernetesVersions`);
      }
      for (const v of data.kubernetesVersions) {
        const cell = row.vcluster[v];
        if (!cell) {
          errors.push(`matrix row host "${row.host}" missing vcluster entry for "${v}"`);
          continue;
        }
        const status = typeof cell === 'object' ? cell.status : cell;
        if (!validStatuses.includes(status)) {
          errors.push(`invalid status "${status}" for host ${row.host} / vcluster ${v}`);
        }
        if (typeof cell === 'object' && cell.note != null) {
          const noteIds = (data.notes || []).map(n => n.id);
          if (!noteIds.includes(cell.note)) {
            errors.push(`note ${cell.note} referenced by host ${row.host} / vcluster ${v} not found in notes array`);
          }
        }
      }
    }
  }

  if (!data.statuses || !data.statuses.tested || !data.statuses.compatible) {
    errors.push('statuses must define at least "tested" and "compatible"');
  }

  return errors;
}

function main() {
  const args = process.argv.slice(2);

  let data = loadData();
  let modified = false;

  // Parse flags
  const VERSION_RE = /^\d+\.\d+$/;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--add' && args[i + 1]) {
      if (!VERSION_RE.test(args[i + 1])) {
        console.error(`Invalid version "${args[i + 1]}". Expected MAJOR.MINOR (e.g. 1.35)`);
        process.exit(1);
      }
      data = addVersion(data, args[i + 1]);
      modified = true;
      i++;
    } else if (args[i] === '--prune' && args[i + 1]) {
      if (!VERSION_RE.test(args[i + 1])) {
        console.error(`Invalid version "${args[i + 1]}". Expected MAJOR.MINOR (e.g. 1.35)`);
        process.exit(1);
      }
      data = pruneVersion(data, args[i + 1]);
      modified = true;
      i++;
    } else if (args[i] === '--help') {
      console.log('Usage: generate-compatibility-matrix.js [--add VERSION] [--prune VERSION]');
      console.log('  --add VERSION    Add a new Kubernetes version to the matrix');
      console.log('  --prune VERSION  Remove an old Kubernetes version from the matrix');
      console.log('  (no args)        Validate the existing matrix JSON');
      process.exit(0);
    }
  }

  // Validate
  const errors = validate(data);
  if (errors.length > 0) {
    console.error('Validation errors:');
    errors.forEach(e => console.error(`  - ${e}`));
    process.exit(1);
  }

  if (modified) {
    saveData(data);
    console.log(`Updated ${jsonPath}`);
  } else {
    console.log('Validation passed. No changes made.');
  }
}

main();
