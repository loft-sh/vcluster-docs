import styles from './styles.module.css';
import productsData from '@site/src/data/products.yaml';
import featuresData from '@site/src/data/features.yaml';

/**
 * FeatureTable component
 *
 * Displays a table of vCluster features with product tier availability.
 * Shows 4 tiers: Free | Dev | Prod | Scale
 * Dev, Prod, Scale are Enterprise tiers (optionally shown with Enterprise header)
 *
 * @param {string} names - Comma-separated list of feature IDs to display, or "all" for all features
 * @param {string} tenancy - Filter features by tenancy model (e.g., "private", "shared", "standalone")
 * @param {boolean} showEnterpriseHeader - Show "Enterprise" header spanning Dev/Prod/Scale columns (default: true)
 *
 * @example
 * // Show specific features
 * <FeatureTable names="vcp-distro-embedded-etcd,ha-mode,vcp-distro-sleep-mode" />
 *
 * // Show all features
 * <FeatureTable names="all" />
 *
 * // Show only features available for private nodes
 * <FeatureTable tenancy="private" />
 *
 * // Show specific features filtered by tenancy
 * <FeatureTable names="all" tenancy="shared" />
 *
 * // Hide Enterprise header
 * <FeatureTable names="all" showEnterpriseHeader={false} />
 */
const FeatureTable = ({ names, tenancy, showEnterpriseHeader = true }) => {
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
  // New order: Free, Dev, Prod, Scale (no OSS column)
  const productOrder = ['free', 'dev', 'prod', 'scale'];
  const products = productOrder
    .map(key => {
      const product = productsData.products?.[key];
      return product ? { key, ...product } : null;
    })
    .filter(p => p !== null);

  // Count enterprise tiers for colspan
  const enterpriseTiers = products.filter(p => p.enterprise);

  // Check which products include each feature (based on products.yaml)
  const checkProductAvailability = (featureId) => {
    const availability = {};

    // Check each product - products.yaml is the source of truth
    products.forEach(product => {
      availability[product.key] = product.features?.includes(featureId) || false;
    });

    return availability;
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
      return `Available for ${tenancyName}`;
    }
    return 'Available in these plans';
  };

  // Use compact layout when showing specific features (not "all")
  const wrapperClass = showAll
    ? styles.featureTableWrapper
    : `${styles.featureTableWrapper} ${styles.featureTableWrapperCompact}`;

  return (
    <>
      <div className={wrapperClass}>
        <table className={styles.featureTable}>
          <thead>
            {showEnterpriseHeader && enterpriseTiers.length > 0 && (
              <tr className={styles.tierGroupRow}>
                <th></th>
                {/* Empty cell for Feature column */}
                <th></th>
                {/* Empty cell for Free column */}
                <th colSpan={enterpriseTiers.length} className={styles.enterpriseHeader}>
                  Enterprise
                </th>
              </tr>
            )}
            <tr>
              <th><span className={styles.headerLabel}>{getHeading()}</span></th>
              {products.map(product => (
                <th key={product.key} className={styles.centerAlign}>
                  {product.docs_url ? (
                    <a href={product.docs_url} className={styles.productLink}>
                      {product.name}
                    </a>
                  ) : (
                    product.name
                  )}
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
