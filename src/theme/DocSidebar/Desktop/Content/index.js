import React from 'react';
import {useHistory, useLocation} from '@docusaurus/router';
import Content from '@theme-original/DocSidebar/Desktop/Content';
import DocsVersionDropdownNavbarItem from '@theme-original/NavbarItem/DocsVersionDropdownNavbarItem';
import DropdownNavbarItem from '@theme-original/NavbarItem/DropdownNavbarItem';
import styles from "./styles.module.css";

function VersionSelector(props) {
  let items = [];
  if (props.docsPluginId === "vcluster") {
    items = [
      {
        to: "/docs/vcluster", label: "vCluster"
      },
      {
        to: "/docs/platform", label: "vCluster Platform"
      },
    ]
  } else {
    items = [
      {
        to: "/docs/platform", label: "vCluster Platform"
      },
      {
        to: "/docs/vcluster", label: "vCluster"
      },
    ]
  }

  return <div className={styles["version-selector-wrapper"]}>
    <div className={styles["product-selector"]}>
      <DropdownNavbarItem className={styles["product-selector"]} label={props.docsPluginId === "vcluster" ? "vCluster" : "vCluster Platform"} items={items} />
    </div>
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
          to: "https://vcluster.com/docs/v0.19",
          label: "v0.19 Stable"
        }
      ]} />}
      {shouldShowPlatformVersioning && <VersionSelector docsPluginId={"platform"} dropdownItemsAfter={[
        {
          to: "https://loft.sh/docs/getting-started/install", label: "v3.4 Stable"
        }
      ]} />}
      <Content {...props} />
    </>
  );
}
