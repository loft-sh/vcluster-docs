import React from 'react';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';
import productsData from '@site/src/data/products.yaml';
import featuresData from '@site/src/data/features.yaml';

/**
 * FeatureTable component
 *
 * Displays a table of vCluster features with product tier availability.
 * Used at the top of docs pages to show which features are covered.
 *
 * @param {string} names - Comma-separated list of feature IDs to display, or "all" for all features
 * @param {string} tenancy - Filter features by tenancy model (e.g., "private", "shared", "standalone")
 *
 * @example
 * // Show specific features
 * <FeatureTable names="embedded-etcd,high-availability,sleep-mode" />
 *
 * // Show all features
 * <FeatureTable names="all" />
 *
 * // Show only features available for private nodes
 * <FeatureTable tenancy="private" />
 *
 * // Show specific features filtered by tenancy
 * <FeatureTable names="all" tenancy="shared" />
 */
const FeatureTable = ({ names, tenancy }) => {
  // Check if we should show all features
  const showAll = !names || names.trim() === '' || names.trim().toLowerCase() === 'all';

  // Build list of features to display
  let features;

  if (showAll) {
    // Show all features from features.yaml
    features = Object.entries(featuresData.features || {}).map(([id, feature]) => ({
      id,
      ...feature,
    }));
  } else {
    // Parse comma-separated feature names
    const featureIds = names.split(',').map(id => id.trim()).filter(id => id.length > 0);

    features = featureIds.map(id => {
      const feature = featuresData.features?.[id];
      if (!feature) {
        console.warn(`FeatureTable: Feature "${id}" not found in features.yaml`);
        return null;
      }
      return {
        id,
        ...feature,
      };
    }).filter(f => f !== null);
  }

  // If no valid features found, show nothing
  if (features.length === 0) {
    return null;
  }

  // Filter by tenancy model if specified
  let filteredFeatures = features;
  if (tenancy) {
    filteredFeatures = features.filter(feature => {
      const models = feature.tenancy?.models || [];
      return models.includes(tenancy);
    });

    // If no features match tenancy filter, show nothing
    if (filteredFeatures.length === 0) {
      console.warn(`FeatureTable: No features found for tenancy model "${tenancy}"`);
      return null;
    }
  }

  // Sort features alphabetically by name
  const sortedFeatures = [...filteredFeatures].sort((a, b) => a.name.localeCompare(b.name));

  // Get list of products from products.yaml (order matters for display)
  const productOrder = ['oss', 'free', 'enterprise'];
  const products = productOrder
    .map(key => {
      const product = productsData.products?.[key];
      return product ? { key, ...product } : null;
    })
    .filter(p => p !== null);

  // Check which products include each feature (based on products.yaml)
  const checkProductAvailability = (featureId) => {
    const availability = {};

    // Check each product - products.yaml is the source of truth
    products.forEach(product => {
      availability[product.key] = product.features?.includes(featureId) || false;
    });

    return availability;
  };

  // Get feature type badge
  const getFeatureTypeBadge = (featureType) => {
    if (!featureType) return null;

    const badgeText = {
      'oss': 'OSS',
      'free': 'Free',
      'paid': 'Paid'
    }[featureType];

    return badgeText ? (
      <span className={styles.featureType}>
        ({badgeText})
      </span>
    ) : null;
  };

  // Generate dynamic heading based on tenancy filter
  const getHeading = () => {
    if (tenancy) {
      const tenancyNames = {
        'shared': 'Shared Nodes',
        'private': 'Private Nodes',
        'standalone': 'Standalone'
      };
      const tenancyName = tenancyNames[tenancy] || tenancy;
      return `Features available for ${tenancyName}:`;
    }
    return 'Feature availability:';
  };

  return (
    <>
      <p className={styles.featureTableHeading}>{getHeading()}</p>
      <div className={styles.featureTableWrapper}>
        <table className={styles.featureTable}>
        <thead>
          <tr>
            <th>Feature</th>
            <th>Tenancy</th>
            {products.map(product => (
              <th key={product.key} className={styles.centerAlign}>
                {product.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedFeatures.map((feature) => {
            const availability = checkProductAvailability(feature.id);

            return (
              <tr key={feature.id}>
                <td>
                  {feature.docs_url ? (
                    <a href={feature.docs_url} className={styles.featureName}>
                      {feature.name}
                    </a>
                  ) : (
                    <span className={styles.featureName}>{feature.name}</span>
                  )}
                  {' '}
                  {getFeatureTypeBadge(feature.feature_type)}
                </td>
                <td>
                  {feature.tenancy?.models && feature.tenancy.models.length > 0 && (
                    <div className={styles.tenancyModels}>
                      {feature.tenancy.models.map((model) => (
                        <span key={model}>
                          {model === 'shared' && (
                            <Link to="/docs/vcluster/configure/tenancy-model#host-nodes" className={styles.tenancyBadge}>
                              Shared
                            </Link>
                          )}
                          {model === 'private' && (
                            <Link to="/docs/vcluster/configure/tenancy-model#private-nodes" className={styles.tenancyBadge}>
                              Private
                            </Link>
                          )}
                          {model === 'standalone' && (
                            <Link to="/docs/vcluster/configure/tenancy-model" className={styles.tenancyBadge}>
                              Standalone
                            </Link>
                          )}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                {products.map(product => (
                  <td key={product.key} className={styles.centerAlign}>
                    {availability[product.key] ? (
                      <span className={styles.checkmark} title={`Available in ${product.name}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                          <path d="m424-296 282-282-56-56-226 226-114-114-56 56 170 170Zm56 216q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"/>
                        </svg>
                      </span>
                    ) : (
                      <span className={styles.cross} title={`Not available in ${product.name}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                          <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/>
                        </svg>
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </>
  );
};

export default FeatureTable;
