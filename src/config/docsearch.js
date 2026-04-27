// Update stableVersion when a new stable release ships — this value drives
// version boosting in the search modal and default selection on the search page.
// See algolia/IMPLEMENTATION.md for the full rollout process.
export const DOCSEARCH_PRODUCTS = {
  vcluster: {
    pluginId: "vcluster",
    displayName: "vCluster",
    stableVersion: "0.33.0",
    stableLabel: "v0.33 Stable",
  },
  platform: {
    pluginId: "platform",
    displayName: "Platform",
    stableVersion: "4.8.0",
    stableLabel: "v4.8 Stable",
  },
};

export function getDocsearchProduct(pluginId) {
  return DOCSEARCH_PRODUCTS[pluginId] ?? null;
}

export function getVersionStatus({ pluginId, versionName }) {
  const product = getDocsearchProduct(pluginId);

  if (!product) {
    return "unknown";
  }

  if (versionName === "current") {
    return "unreleased";
  }

  if (versionName === product.stableVersion) {
    return "stable";
  }

  return "versioned";
}

export function getVersionFacetValue({ pluginId, versionName }) {
  const product = getDocsearchProduct(pluginId);

  if (!product) {
    return versionName;
  }

  if (versionName === "current") {
    return "next";
  }

  return versionName;
}

export function isStableVersion({ pluginId, versionName }) {
  return getVersionStatus({ pluginId, versionName }) === "stable";
}

export function isUnreleasedVersion({ pluginId, versionName }) {
  return getVersionStatus({ pluginId, versionName }) === "unreleased";
}

export function getVersionBoostScore({ pluginId, versionName, pathname }) {
  const versionStatus = getVersionStatus({ pluginId, versionName });

  if (pathname === `/${pluginId}/` || pathname === `/${pluginId}`) {
    return 160;
  }

  if (versionStatus === "stable") {
    return 120;
  }

  if (versionStatus === "versioned") {
    return 60;
  }

  if (versionStatus === "unreleased") {
    return 20;
  }

  return 0;
}


