import React from 'react';
import clsx from 'clsx';
import DocVersionBanner from '@theme-original/DocVersionBanner';
import {useDocsVersion} from '@docusaurus/plugin-content-docs/client';
import {ThemeClassNames} from '@docusaurus/theme-common';
import {
  limitedAvailabilityContactUrl,
  limitedAvailabilityVersions,
} from '@site/src/config/versionConfig';

/**
 * Shows a limited availability notice on every page of the versions listed in
 * limitedAvailabilityVersions. Other versions keep the default banner.
 */
export default function DocVersionBannerWrapper(props) {
  const {pluginId, version} = useDocsVersion();
  const releaseName = limitedAvailabilityVersions[pluginId]?.[version];

  if (!releaseName) {
    return <DocVersionBanner {...props} />;
  }

  return (
    <div
      className={clsx(
        props.className,
        ThemeClassNames.docs.docVersionBanner,
        'alert alert--warning margin-bottom--md',
      )}
      role="alert">
      <div>
        <b>{releaseName} is a limited availability release.</b> If you're
        interested in using it or upgrading to it,{' '}
        <a href={limitedAvailabilityContactUrl} target="_blank" rel="noopener">
          contact vCluster Labs
        </a>
        .
      </div>
    </div>
  );
}
