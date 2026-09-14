import React from 'react';
import Link from '@docusaurus/Link';
import {useDocsVersion} from '@docusaurus/plugin-content-docs/client';

const productPrefixes = {
  platform: '/docs/platform',
  vcluster: '/docs/vcluster',
};

/**
 * Resolve the URL segment Docusaurus serves a version under.
 *
 * The segment is not the version name. `lastVersion` is served at the plugin's
 * route base with no segment at all, and the current version is served under
 * `/next` whenever it is not also the last version. Deriving the segment from
 * the version name alone produces `/docs/vcluster/0.37.0/...`, which has no
 * generated route: a hard load only survives because netlify.toml carries a
 * hand-maintained 301 per release, and an in-app click falls through to the
 * router's 404.
 */
function versionSegment({version, isLast}) {
  if (isLast) {
    return '';
  }
  return version === 'current' ? '/next' : `/${version}`;
}

/**
 * Link to a product doc, keeping the reader's version when the source page
 * belongs to that same product.
 *
 * A cross-product link gets no version segment, which resolves to the other
 * product's `lastVersion` — its stable docs, not its `/next` current docs.
 * That is deliberate. Platform and vCluster version independently, so there is
 * no matching version to carry across, and stable is the only target that
 * never drops a reader of released docs into unreleased ones.
 */
export default function VersionAwareDocLink({product, to, ...props}) {
  const versionMetadata = useDocsVersion();
  const productPrefix = productPrefixes[product];

  if (!productPrefix) {
    throw new Error(`Unsupported docs product: ${product}`);
  }

  const isSameProduct = versionMetadata.pluginId === product;
  const segment = isSameProduct ? versionSegment(versionMetadata) : '';
  const targetPath = to.startsWith('/') ? to : `/${to}`;

  return <Link to={`${productPrefix}${segment}${targetPath}`} {...props} />;
}
