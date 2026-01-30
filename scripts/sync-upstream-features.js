#!/usr/bin/env node

/**
 * sync-upstream-features.js
 *
 * Syncs feature definitions and tier assignments from upstream repos:
 * - Features: loft-sh/admin-apis/definitions/features.yaml
 * - Tiers: loft-sh/plans/*.yaml (free.yaml, dev.yaml, prod.yaml, scale.yaml)
 *
 * This script MERGES upstream data with local files:
 * - Adds new features from upstream
 * - Updates tier assignments to match upstream plans
 * - Warns about features in local that are deprecated upstream
 * - Preserves local-only metadata (categories, docs_url overrides)
 *
 * Usage:
 *   npm run sync-upstream           # Fetch and update local files
 *   npm run validate-upstream       # Check if local files are in sync (CI)
 *
 * Options:
 *   --dry-run    Show what would change without writing
 *   --verbose    Show detailed output
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { execSync } = require('child_process');

// Configuration
const FEATURES_YAML = path.join(__dirname, '../src/data/features.yaml');
const PRODUCTS_YAML = path.join(__dirname, '../src/data/products.yaml');

// GitHub repos (uses gh CLI for auth)
const UPSTREAM = {
  features: { repo: 'loft-sh/admin-apis', path: 'definitions/features.yaml' },
  plans: {
    free: { repo: 'loft-sh/plans', path: 'free.yaml' },
    dev: { repo: 'loft-sh/plans', path: 'dev.yaml' },
    prod: { repo: 'loft-sh/plans', path: 'prod.yaml' },
    scale: { repo: 'loft-sh/plans', path: 'scale.yaml' },
  }
};

// Known deprecated/removed features (comments in upstream YAML are not parsed)
// These should be filtered out from tier assignments
const DEPRECATED_FEATURES = new Set([
  'auto-ingress-authentication',
  'vcluster-enterprise-plugins',
  'rancher-integration',
  'secret-encryption',
  'vcp-distro-admission-control',
  'devpod',
  'disable-platform-db',  // allowBefore: 2025-09-09 - expires soon
]);

// Parse args
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isVerbose = args.includes('--verbose') || isDryRun;

/**
 * Fetch file content from GitHub using gh CLI (handles auth for private repos)
 */
function fetchGitHub(repo, filePath) {
  try {
    const result = execSync(
      `gh api repos/${repo}/contents/${filePath} -q '.content'`,
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
    );
    return Buffer.from(result.trim(), 'base64').toString('utf8');
  } catch (error) {
    throw new Error(`Failed to fetch ${repo}/${filePath}: ${error.message}`);
  }
}

/**
 * Extract feature IDs with 'active' status from plan file
 */
function extractPlanFeatures(planData) {
  const features = [];
  if (planData.features) {
    for (const [featureId, status] of Object.entries(planData.features)) {
      if (status === 'active') {
        features.push(featureId);
      }
    }
  }
  return features;
}

/**
 * Build upstream feature lookup by ID
 */
function buildUpstreamLookup(upstreamFeatures) {
  const lookup = {};
  for (const f of upstreamFeatures) {
    lookup[f.name] = f;
  }
  return lookup;
}

/**
 * Main
 */
function main() {
  console.log('>> Syncing feature definitions from upstream repos\n');

  if (isDryRun) {
    console.log('[DRY RUN] No files will be modified\n');
  }

  try {
    // Fetch upstream data
    console.log('Fetching upstream features...');
    const featuresRaw = fetchGitHub(UPSTREAM.features.repo, UPSTREAM.features.path);
    const upstreamFeaturesData = yaml.load(featuresRaw);
    const upstreamFeatures = upstreamFeaturesData.features || [];
    const upstreamLookup = buildUpstreamLookup(upstreamFeatures);
    console.log(`[OK] Fetched ${upstreamFeatures.length} features\n`);

    console.log('Fetching upstream plans...');
    const upstreamPlans = {};
    for (const [tier, config] of Object.entries(UPSTREAM.plans)) {
      const planRaw = fetchGitHub(config.repo, config.path);
      const planData = yaml.load(planRaw);
      upstreamPlans[tier] = extractPlanFeatures(planData);
      if (isVerbose) {
        console.log(`  ${tier}: ${upstreamPlans[tier].length} features`);
      }
    }
    console.log('[OK] Fetched all plans\n');

    // Load existing local files
    let localFeatures = { features: {} };
    let localProducts = { products: {} };

    if (fs.existsSync(FEATURES_YAML)) {
      const content = fs.readFileSync(FEATURES_YAML, 'utf8');
      // Strip comment header before parsing
      const yamlContent = content.replace(/^#[^\n]*\n/gm, '');
      localFeatures = yaml.load(yamlContent) || { features: {} };
    }
    if (fs.existsSync(PRODUCTS_YAML)) {
      const content = fs.readFileSync(PRODUCTS_YAML, 'utf8');
      const yamlContent = content.replace(/^#[^\n]*\n/gm, '');
      localProducts = yaml.load(yamlContent) || { products: {} };
    }

    // Track changes
    const changes = {
      featuresAdded: [],
      featuresDeprecated: [],
      tiersUpdated: [],
      validationErrors: [],
    };

    // Check for new features in upstream that aren't in local
    console.log('Checking for new/deprecated features...');
    const localFeatureIds = new Set(Object.keys(localFeatures.features || {}));

    for (const upstream of upstreamFeatures) {
      if (upstream.deprecated || upstream.removed || DEPRECATED_FEATURES.has(upstream.name)) continue;

      if (!localFeatureIds.has(upstream.name)) {
        changes.featuresAdded.push(upstream.name);
        if (isVerbose) {
          console.log(`  [NEW] ${upstream.name}: ${upstream.displayName || upstream.name}`);
        }

        // Add to local features with upstream data
        localFeatures.features[upstream.name] = {
          name: upstream.displayName || upstream.name,
        };
        if (upstream.description) {
          localFeatures.features[upstream.name].description = upstream.description.trim();
        }
        if (upstream.docsLink) {
          localFeatures.features[upstream.name].docs_url = upstream.docsLink.replace('https://www.vcluster.com', '');
        }
      }
    }

    // Check for features in local that are deprecated upstream
    for (const featureId of localFeatureIds) {
      const upstream = upstreamLookup[featureId];
      if (upstream && (upstream.deprecated || upstream.removed)) {
        changes.featuresDeprecated.push(featureId);
        if (isVerbose) {
          console.log(`  [DEPRECATED] ${featureId}`);
        }
      }
    }

    if (changes.featuresAdded.length === 0 && changes.featuresDeprecated.length === 0) {
      console.log('[OK] Features are in sync\n');
    } else {
      console.log(`[INFO] ${changes.featuresAdded.length} new, ${changes.featuresDeprecated.length} deprecated\n`);
    }

    // Update tier assignments in products.yaml
    console.log('Updating tier assignments...');
    const tiers = ['free', 'dev', 'prod', 'scale'];

    for (const tier of tiers) {
      const upstreamFeatureIds = upstreamPlans[tier] || [];
      // Filter out deprecated features
      const activeFeatures = upstreamFeatureIds.filter(id => {
        if (DEPRECATED_FEATURES.has(id)) return false;
        const upstream = upstreamLookup[id];
        return !upstream || (!upstream.deprecated && !upstream.removed);
      });

      if (!localProducts.products[tier]) {
        // Initialize tier if missing
        localProducts.products[tier] = {
          name: tier.charAt(0).toUpperCase() + tier.slice(1),
          enterprise: tier !== 'free',
          description: `${tier.charAt(0).toUpperCase() + tier.slice(1)} tier`,
          pricing_url: 'https://www.vcluster.com/pricing',
          features: [],
        };
        if (tier !== 'free') {
          localProducts.products[tier].contact_sales_url = 'https://www.vcluster.com/enterprise-demo';
        }
      }

      const localTierFeatures = localProducts.products[tier].features || [];
      const sortedLocal = [...localTierFeatures].sort();
      const sortedUpstream = [...activeFeatures].sort();

      if (JSON.stringify(sortedLocal) !== JSON.stringify(sortedUpstream)) {
        changes.tiersUpdated.push(tier);
        if (isVerbose) {
          const added = activeFeatures.filter(f => !localTierFeatures.includes(f));
          const removed = localTierFeatures.filter(f => !activeFeatures.includes(f));
          if (added.length) console.log(`  [${tier}] Added: ${added.join(', ')}`);
          if (removed.length) console.log(`  [${tier}] Removed: ${removed.join(', ')}`);
        }
        localProducts.products[tier].features = activeFeatures;
      }
    }

    if (changes.tiersUpdated.length === 0) {
      console.log('[OK] Tier assignments are in sync\n');
    } else {
      console.log(`[INFO] Updated tiers: ${changes.tiersUpdated.join(', ')}\n`);
    }

    // Validate: all features in products should exist in features
    console.log('Validating feature references...');
    const allFeatureIds = new Set(Object.keys(localFeatures.features));
    for (const tier of tiers) {
      const tierFeatures = localProducts.products[tier]?.features || [];
      for (const featureId of tierFeatures) {
        if (!allFeatureIds.has(featureId)) {
          changes.validationErrors.push(`Tier '${tier}' references unknown feature: ${featureId}`);
        }
      }
    }

    if (changes.validationErrors.length > 0) {
      console.log('[ERROR] Validation failed:');
      for (const err of changes.validationErrors) {
        console.log(`  - ${err}`);
      }
    } else {
      console.log('[OK] All feature references are valid\n');
    }

    // Check if anything changed
    const hasChanges = changes.featuresAdded.length > 0 ||
                       changes.tiersUpdated.length > 0;

    if (!hasChanges) {
      console.log('>> All files are in sync with upstream');
      if (changes.featuresDeprecated.length > 0) {
        console.log(`\n[WARN] ${changes.featuresDeprecated.length} local features are deprecated upstream:`);
        for (const id of changes.featuresDeprecated) {
          console.log(`  - ${id}`);
        }
        console.log('Consider removing these from local files.');
      }
      process.exit(0);
    }

    // Write updates
    if (!isDryRun) {
      // Write features.yaml
      const featuresHeader = `# features.yaml - Feature definitions with metadata
#
# This file contains detailed information about each vCluster feature.
# Feature IDs (keys) are synced from: https://github.com/loft-sh/admin-apis/blob/main/definitions/features.yaml
# Used by the FeatureTable component to display feature information in docs.
#
# Tiers are defined in products.yaml based on: https://github.com/loft-sh/plans/
#
# Run: npm run sync-upstream to update from upstream

`;
      const featuresContent = featuresHeader + yaml.dump(localFeatures, {
        lineWidth: 120,
        quotingType: '"',
        forceQuotes: true,
        noRefs: true,
      });
      fs.writeFileSync(FEATURES_YAML, featuresContent, 'utf8');
      console.log('[WRITE] Updated features.yaml');

      // Write products.yaml
      const productsHeader = `# products.yaml - Maps products to their available features
#
# This file defines vCluster product tiers and which features are available in each.
# Used by the FeatureTable component to display product/feature matrices.
#
# Source of truth for features: https://github.com/loft-sh/admin-apis/blob/main/definitions/features.yaml
# Source of truth for plans: https://github.com/loft-sh/plans/
#
# Tiers: Free | Dev | Prod | Scale
# Dev, Prod, Scale are Enterprise tiers (shown with optional Enterprise header)
#
# Run: npm run sync-upstream to update from upstream

`;
      const productsContent = productsHeader + yaml.dump(localProducts, {
        lineWidth: 120,
        quotingType: '"',
        forceQuotes: true,
        noRefs: true,
      });
      fs.writeFileSync(PRODUCTS_YAML, productsContent, 'utf8');
      console.log('[WRITE] Updated products.yaml');

      console.log('\n>> Sync complete');
    } else {
      console.log('\n>> Run without --dry-run to apply changes');
      process.exit(1); // Exit 1 for CI to detect drift
    }

    if (changes.featuresDeprecated.length > 0) {
      console.log(`\n[WARN] ${changes.featuresDeprecated.length} local features are deprecated upstream:`);
      for (const id of changes.featuresDeprecated) {
        console.log(`  - ${id}`);
      }
      console.log('Consider removing these from local files.');
    }

    process.exit(changes.validationErrors.length > 0 ? 1 : 0);

  } catch (error) {
    console.error(`[ERROR] ${error.message}`);
    process.exit(1);
  }
}

main();
