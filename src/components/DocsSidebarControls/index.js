import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import {useLocation} from '@docusaurus/router';
import {useVersions} from '@docusaurus/plugin-content-docs/client';
import DocsVersionDropdownNavbarItem from '@theme-original/NavbarItem/DocsVersionDropdownNavbarItem';
import {
  getDesktopVersions,
  platformEOLVersions,
  platformHiddenVersions,
  vclusterEOLVersions,
  vclusterHiddenVersions,
} from '@site/src/config/versionConfig';
import styles from './styles.module.css';

const sections = [
  {label: 'vCluster', to: '/vcluster/', id: 'vcluster'},
  {label: 'vMetal', to: '/platform/next/vmetal/overview', id: 'vmetal'},
  {label: 'Platform', to: '/platform/', id: 'platform'},
];

function getActiveSection(pathname) {
  if (pathname.startsWith('/docs/vcluster')) {
    return 'vcluster';
  }

  if (/^\/docs\/platform\/(?:next\/|[^/]+\/)?vmetal(?:\/|$)/.test(pathname)) {
    return 'vmetal';
  }

  if (pathname.startsWith('/docs/platform')) {
    return 'platform';
  }

  return 'overview';
}

function VersionSelector({docsPluginId, dropdownItemsAfter, hiddenVersions = []}) {
  const allVersions = useVersions(docsPluginId);
  const visibleVersions = hiddenVersions.length > 0
    ? allVersions.filter((version) => !hiddenVersions.includes(version.name)).map((version) => version.name)
    : undefined;

  return (
    <div className={styles.versionSelector}>
      <DocsVersionDropdownNavbarItem
        docsPluginId={docsPluginId}
        dropdownItemsBefore={[]}
        dropdownItemsAfter={dropdownItemsAfter}
        versions={visibleVersions}
      />
    </div>
  );
}

export default function DocsSidebarControls({className}) {
  const {pathname} = useLocation();
  const activeSection = getActiveSection(pathname);

  return (
    <div className={clsx(styles.controls, className)}>
      <nav className={styles.productSwitcher} aria-label="Documentation products">
        {sections.map((section) => {
          const active = section.id === activeSection;

          return (
            <Link
              key={section.id}
              to={section.to}
              className={clsx(styles.productLink, active && styles.productLinkActive)}
              aria-current={active ? 'page' : undefined}>
              {section.label}
            </Link>
          );
        })}
      </nav>

      {activeSection === 'vcluster' && (
        <VersionSelector
          docsPluginId="vcluster"
          dropdownItemsAfter={getDesktopVersions(vclusterEOLVersions)}
          hiddenVersions={vclusterHiddenVersions}
        />
      )}
      {(activeSection === 'platform' || activeSection === 'vmetal') && (
        <VersionSelector
          docsPluginId="platform"
          dropdownItemsAfter={getDesktopVersions(platformEOLVersions)}
          hiddenVersions={platformHiddenVersions}
        />
      )}
    </div>
  );
}
