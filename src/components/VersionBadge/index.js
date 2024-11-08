import React from 'react';
import Admonition from '@theme/Admonition';
import styles from './version-badge.module.css';

const VersionBadge = ({ version, vclusterVersion }) => {
  return (
    <Admonition type="info">
      <span>This feature is available from version </span>
      <span className={styles.versionBadge}>{version}</span>
      {vclusterVersion && (
        <>
          <span> and was introduced in <strong>vCluster</strong> version </span>
          <span className={styles.versionBadge}>{vclusterVersion}</span>
        </>
      )}
    </Admonition>
  );
};

export default VersionBadge;