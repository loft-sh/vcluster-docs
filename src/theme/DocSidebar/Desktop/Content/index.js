import React from 'react';
import {useLocation} from '@docusaurus/router';
import Content from '@theme-original/DocSidebar/Desktop/Content';
import DocsVersionDropdownNavbarItem from '@theme-original/NavbarItem/DocsVersionDropdownNavbarItem';
import styles from "./styles.module.css";

function VersionSelector(props) {
  return <div className={styles["version-selector-wrapper"]}>
    <div className={styles["version-selector"]}>
      <DocsVersionDropdownNavbarItem docsPluginId={props.docsPluginId}
                                     dropdownItemsBefore={[]}
                                     dropdownItemsAfter={props.dropdownItemsAfter}/>
    </div>
  </div>
}

export default function ContentWrapper(props) {
  const {pathname} = useLocation();
  const shouldShowVClusterVersioning = pathname.startsWith('/docs/vcluster');
  const shouldShowPlatformVersioning = pathname.startsWith('/docs/platform');

  return (
    <>
      {shouldShowVClusterVersioning && <VersionSelector docsPluginId={"vcluster"} dropdownItemsAfter={[]} />}
      {shouldShowPlatformVersioning && <VersionSelector docsPluginId={"platform"} dropdownItemsAfter={[]} />}
      <Content {...props} />
    </>
  );
}