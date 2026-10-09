import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import services from '@site/src/data/services';
import styles from './styles.module.css';

// One clickable card with a Material icon, a title, and a short description.
export function LinkCard({to, icon, title, description}) {
  return (
    <Link to={to} className={clsx('card', styles.card)}>
      {icon && (
        <span className={clsx('material-icons-outlined', styles.icon)} aria-hidden="true">
          {icon}
        </span>
      )}
      <span className={styles.title}>{title}</span>
      {description && <span className={styles.description}>{description}</span>}
    </Link>
  );
}

// Responsive grid for LinkCards. `columns` sets the desktop column count.
export function LinkCardGrid({columns = 3, children}) {
  return (
    <div className={clsx(styles.grid, columns === 2 && styles.twoColumns)}>
      {children}
    </div>
  );
}

// The shipped root service pages, shared by every "What do you want to build?" grid.
export function ServiceCards() {
  return (
    <LinkCardGrid>
      {services.map((service) => (
        <LinkCard key={service.to} {...service} />
      ))}
    </LinkCardGrid>
  );
}

export default ServiceCards;
