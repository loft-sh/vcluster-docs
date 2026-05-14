import React from 'react';
import styles from './styles.module.css';

const COLORS = {
  secondary: '#FFE0CC',
  green:     '#FFE0CC', // deprecated alias for secondary; kept for versioned docs compatibility
  success:   'var(--ifm-color-success-lightest)',
  info:      'var(--ifm-color-info-lightest)',
  warning:   'var(--ifm-color-warning-lightest)',
  danger:    'var(--ifm-color-danger-lightest)',
};

const DEFAULT_BG = '#E6E7E9';

export default function Highlight({ children, color, className }) {
  return (
    <span
      style={{ backgroundColor: (color && COLORS[color]) || DEFAULT_BG, color: '#050B24' }}
      className={`${styles.highlight} ${className || ''}`}
    >
      {children}
    </span>
  );
}