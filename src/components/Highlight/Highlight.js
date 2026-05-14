import React from 'react';
import styles from './styles.module.css';

const COLORS = {
  secondary: '#FFE0CC',
  success:   'var(--ifm-color-success)',
  info:      'var(--ifm-color-info)',
  warning:   'var(--ifm-color-warning)',
  danger:    'var(--ifm-color-danger)',
};

const DEFAULT_BG = '#E6E7E9';

export default function Highlight({ children, color, className }) {
  if (color && !COLORS[color]) {
    console.warn(`Highlight: unknown color "${color}". Valid values: ${Object.keys(COLORS).join(', ')}.`);
  }
  return (
    <span
      style={{ backgroundColor: (color && COLORS[color]) || DEFAULT_BG, color: '#050B24' }}
      className={`${styles.highlight} ${className || ''}`}
    >
      {children}
    </span>
  );
}