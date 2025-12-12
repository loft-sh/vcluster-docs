import React from 'react';
import clsx from 'clsx';
import {useLocation} from '@docusaurus/router';
import {useCollapsible, Collapsible} from '@docusaurus/theme-common';
import {
  useVersions,
  useActiveDocContext,
} from '@docusaurus/plugin-content-docs/client';
import TOCCollapsible from '@theme-original/TOCCollapsible';
import {vclusterEOLVersions, platformEOLVersions} from '@site/src/config/versionConfig';
import styles from './styles.module.css';

function VersionSelectorCollapsible({pluginId, eolVersions}) {
  const {collapsed, toggleCollapsed} = useCollapsible({
    initialState: true,
  });

  const versions = useVersions(pluginId);
  const {activeVersion} = useActiveDocContext(pluginId);
  const activeLabel = activeVersion?.label ?? 'Version';

  return (
    <div
      className={clsx(
        styles.tocCollapsible,
        !collapsed && styles.tocCollapsibleExpanded,
      )}>
      <button
        type="button"
        onClick={toggleCollapsed}
        className={clsx(
          'clean-btn',
          styles.tocCollapsibleButton,
          !collapsed && styles.tocCollapsibleButtonExpanded,
        )}>
        {activeLabel}
      </button>
      <Collapsible
        lazy
        className={styles.tocCollapsibleContent}
        collapsed={collapsed}>
        <ul>
          {versions.map((version) => (
            <li key={version.name}>
              <a
                href={version.path}
                className={clsx(
                  version.name === activeVersion?.name && styles.versionActive
                )}>
                {version.label}
              </a>
            </li>
          ))}
          {eolVersions.map((version) => (
            <li key={version.label}>
              <a href={version.to}>
                {version.label}
              </a>
            </li>
          ))}
        </ul>
      </Collapsible>
    </div>
  );
}

export default function TOCCollapsibleWrapper(props) {
  const {pathname} = useLocation();
  const isVClusterDocs = pathname.startsWith('/docs/vcluster');
  const isPlatformDocs = pathname.startsWith('/docs/platform');
  const showVersionSelector = isVClusterDocs || isPlatformDocs;
  const pluginId = isVClusterDocs ? 'vcluster' : 'platform';
  const eolVersions = isVClusterDocs ? vclusterEOLVersions : platformEOLVersions;

  return (
    <>
      {showVersionSelector && (
        <VersionSelectorCollapsible
          pluginId={pluginId}
          eolVersions={eolVersions}
        />
      )}
      <TOCCollapsible {...props} />
    </>
  );
}
