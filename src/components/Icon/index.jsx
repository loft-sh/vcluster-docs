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

  if (type === 'warning' || type === '!') {
    return (
      <span className={styles.warning} title={title || 'Warning'}>
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
          <path d="M109-120q-11 0-20-5.5T75-140q-5-9-5.5-19.5T75-180l370-640q6-10 15.5-15t19.5-5q10 0 19.5 5t15.5 15l370 640q6 10 5.5 20.5T885-140q-5 9-14 14.5t-20 5.5H109Zm399.5-131.5Q520-263 520-280t-11.5-28.5Q497-320 480-320t-28.5 11.5Q440-297 440-280t11.5 28.5Q463-240 480-240t28.5-11.5Zm0-120Q520-383 520-400v-120q0-17-11.5-28.5T480-560q-17 0-28.5 11.5T440-520v120q0 17 11.5 28.5T480-360q17 0 28.5-11.5Z"/>
        </svg>
      </span>
    );
  }

  return null;
};

export default Icon;
