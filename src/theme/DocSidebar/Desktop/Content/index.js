import React from 'react';
import {useHistory, useLocation} from '@docusaurus/router';
import Content from '@theme-original/DocSidebar/Desktop/Content';
import DocsVersionDropdownNavbarItem from '@theme-original/NavbarItem/DocsVersionDropdownNavbarItem';
import styles from "./styles.module.css";

function VersionSelector(props) {
  const history = useHistory();

  return <div className={styles["version-selector-wrapper"]}>
    <div className={styles["return-to-overview"]} onClick={() => history.push("/docs")}>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16" aria-hidden="true">
        <path fill="currentColor" fill-rule="evenodd"
              d="M10.795 3.235a.75.75 0 01-.03 1.06L6.842 8l3.923 3.705a.75.75 0 01-1.03 1.09l-4.5-4.25a.75.75 0 010-1.09l4.5-4.25a.75.75 0 011.06.03z"
              clip-rule="evenodd"></path>
      </svg>
      Return to main menu
    </div>
    <div className={styles["version-selector"]}>
      <span className={styles["version-selector-label"]}>Version:</span> <DocsVersionDropdownNavbarItem docsPluginId={props.docsPluginId}
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
