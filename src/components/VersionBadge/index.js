import React from 'react';
import PropTypes from 'prop-types';
import Admonition from '@theme/Admonition';
import styles from './version-badge.module.css';

const VersionBadge = ({ platformVersion, vclusterVersion }) => {
  // Validation check - at least one version must be provided
  if (!platformVersion && !vclusterVersion) {
    console.error('VersionBadge: Either platformVersion or vclusterVersion must be provided');
    return null;
  }

  return (
    <Admonition type="info">
      {platformVersion && (
        <>
          <span>This feature is available from the <strong>Platform</strong> version </span>
          <span className={styles.versionBadge}>{platformVersion}</span>
        </>
      )}
      {platformVersion && vclusterVersion && <span> and </span>}
      {vclusterVersion && (
        <>
          <span>
            {!platformVersion && 'This feature '}was introduced in <strong>vCluster</strong> version{' '}
          </span>
          <span className={styles.versionBadge}>{vclusterVersion}</span>
        </>
      )}
    </Admonition>
  );
};

// Prop validation
VersionBadge.propTypes = {
  platformVersion: function(props, propName, componentName) {
    if (!props.platformVersion && !props.vclusterVersion) {
      return new Error(
        `Either 'platformVersion' or 'vclusterVersion' must be provided in '${componentName}'`
      );
    }
  },
  vclusterVersion: function(props, propName, componentName) {
    if (!props.platformVersion && !props.vclusterVersion) {
      return new Error(
        `Either 'platformVersion' or 'vclusterVersion' must be provided in '${componentName}'`
      );
    }
  }
};

export default VersionBadge;