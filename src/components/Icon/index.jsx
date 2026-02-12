import React from 'react';
import styles from './styles.module.css';

/**
 * Icon component for checkmarks and crosses in documentation
 *
 * Used for inline feature availability indicators in MDX files.
 * Renders SVG icons (Google Material Icons) with automatic dark/light mode styling.
 *
 * @param {string} type - Icon type: "check", "checkmark", "cross", or "x"
 * @param {string} title - Optional tooltip text (defaults: "Available" / "Not available")
 *
 * @example
 * import Icon from '@site/src/components/Icon';
 *
 * | Feature | Supported |
 * |---------|-----------|
 * | Connection pooling | <Icon type="check" /> |
 * | SSL encryption | <Icon type="check" /> |
 * | Legacy auth | <Icon type="cross" /> |
 *
 * @example
 * <Icon type="check" title="Supported in all tiers" />
 * <Icon type="cross" title="Deprecated feature" />
 */
const Icon = ({ type, title }) => {
  if (type === 'check' || type === 'checkmark') {
    return (
      <span className={styles.checkmark} title={title || 'Available'}>
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
          <path d="m424-296 282-282-56-56-226 226-114-114-56 56 170 170Zm56 216q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"/>
        </svg>
      </span>
    );
  }

  if (type === 'cross' || type === 'x') {
    return (
      <span className={styles.cross} title={title || 'Not available'}>
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
          <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/>
        </svg>
      </span>
    );
  }

  return null;
};

export default Icon;
