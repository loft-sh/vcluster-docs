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
 *
 * @example
 * <FeatureTable names="embedded-etcd,high-availability,sleep-mode" />
 * <FeatureTable names="all" />
 */
const FeatureTable = ({ names }) => {
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

  // Sort features alphabetically by name
  const sortedFeatures = [...features].sort((a, b) => a.name.localeCompare(b.name));

  // Get list of products from products.yaml (order matters for display)
  const productOrder = ['oss', 'free', 'dev', 'prod', 'scale', 'enterprise'];
  const products = productOrder
    .map(key => {
      const product = productsData.products?.[key];
      return product ? { key, ...product } : null;
    })
    .filter(p => p !== null);

  // Check which products include each feature
  const checkProductAvailability = (featureId) => {
    const availability = {};

    // Check each product
    products.forEach(product => {
      if (product.features?.includes(featureId)) {
        availability[product.key] = true;
      } else {
        availability[product.key] = false;
      }
    });

    // Fallback: use enterprise_only flag from feature definition
    const feature = featuresData.features?.[featureId];
    if (feature) {
      if (feature.enterprise_only === false) {
        // Available in all products
        products.forEach(product => {
          availability[product.key] = true;
        });
      } else if (feature.enterprise_only === true) {
        // Only available in enterprise/paid products
        availability.oss = false;
        if (!availability.free && !availability.dev && !availability.prod && !availability.scale && !availability.enterprise) {
          availability.enterprise = true;
        }
      }
    }

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
        [{badgeText}]
      </span>
    ) : null;
  };

  return (
    <>
      <h2>Feature availability</h2>
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
                      <span className={styles.checkmark} title={`Available in ${product.name}`}>✓</span>
                    ) : (
                      <span className={styles.cross} title={`Not available in ${product.name}`}>✗</span>
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
