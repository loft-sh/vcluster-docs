import React from 'react';
import {useLocation} from '@docusaurus/router';
import {useVersions} from '@docusaurus/plugin-content-docs/client';
import Content from '@theme-original/DocSidebar/Desktop/Content';
import DocsVersionDropdownNavbarItem from '@theme-original/NavbarItem/DocsVersionDropdownNavbarItem';
import {vclusterEOLVersions, platformEOLVersions, vclusterHiddenVersions, platformHiddenVersions, getDesktopVersions} from '@site/src/config/versionConfig';
import styles from "./styles.module.css";

function VersionSelector({docsPluginId, dropdownItemsAfter, hiddenVersions = []}) {
  const allVersions = useVersions(docsPluginId);
  const visibleVersions = hiddenVersions.length > 0
    ? allVersions.filter(v => !hiddenVersions.includes(v.name)).map(v => v.name)
    : undefined;

  return (
    <div className={styles["version-selector-wrapper"]}>
      <div className={styles["version-selector"]}>
        <DocsVersionDropdownNavbarItem
          docsPluginId={docsPluginId}
          dropdownItemsBefore={[]}
          dropdownItemsAfter={dropdownItemsAfter}
          versions={visibleVersions}
        />
      </div>
    </div>
  );
}

export default function ContentWrapper(props) {
  const {pathname} = useLocation();
  const shouldShowVClusterVersioning = pathname.startsWith('/docs/vcluster');
  const shouldShowPlatformVersioning = pathname.startsWith('/docs/platform');

  return (
    <>
      {shouldShowVClusterVersioning && (
        <VersionSelector
          docsPluginId="vcluster"
          dropdownItemsAfter={[]}
        />
      )}
      {shouldShowPlatformVersioning && (
        <VersionSelector
          docsPluginId="platform"
          dropdownItemsAfter={[]}
        />
      )}
      <Content {...props} />
    </>
  );
}
