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
      {shouldShowVClusterVersioning && <VersionSelector docsPluginId={"vcluster"} dropdownItemsAfter={[
        {
          to: "https://vcluster.com/docs/v0.24",
          label: "v0.24 (EOS) ↗"
        },
        {
          to: "https://vcluster.com/docs/v0.23",
          label: "v0.23 (EOL) ↗"
        },
        {
          to: "https://vcluster.com/docs/v0.22",
          label: "v0.22 (EOL) ↗"
        },
        {
          to: "https://vcluster.com/docs/v0.21",
          label: "v0.21 (EOL) ↗"
        },
        {
          to: "https://vcluster.com/docs/v0.20",
          label: "v0.20 (EOL) ↗"
        },
        {
          to: "https://vcluster.com/docs/v0.19",
          label: "v0.19 (EOL) ↗"
        }
      ]} />}
      {shouldShowPlatformVersioning && <VersionSelector docsPluginId={"platform"} dropdownItemsAfter={[
        {
          to: "https://loft.sh/docs/getting-started/install", label: "v3.4"
        }
      ]} />}
      <Content {...props} />
    </>
  );
}