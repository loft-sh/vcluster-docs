import React from 'react';
import Link from '@docusaurus/Link';
import {useDocsVersion} from '@docusaurus/plugin-content-docs/client';

const productPrefixes = {
  platform: '/docs/platform',
  vcluster: '/docs/vcluster',
};

/**
 * Link to a product doc while retaining the current version when the source
 * page belongs to that same product. Cross-product links intentionally target
 * the other product's current docs because the two products version
 * independently.
 */
export default function VersionAwareDocLink({product, to, ...props}) {
  const {pluginId, version} = useDocsVersion();
  const productPrefix = productPrefixes[product];

  if (!productPrefix) {
    throw new Error(`Unsupported docs product: ${product}`);
  }

  const isSameProduct = pluginId === product;
  const versionSegment =
    isSameProduct && version !== 'current'
      ? `/${version}`
      : '';
  const targetPath = to.startsWith('/') ? to : `/${to}`;

  return <Link to={`${productPrefix}${versionSegment}${targetPath}`} {...props} />;
}
