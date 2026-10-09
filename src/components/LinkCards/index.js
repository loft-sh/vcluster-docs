import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import VersionAwareDocLink from '@site/src/components/VersionAwareDocLink';
import services from '@site/src/data/services';
import styles from './styles.module.css';

// One clickable card with a Material icon, a title, and a short description.
// Set `product` ("vcluster" or "platform") to keep the reader's docs version,
// with `to` given relative to that product's docs root.
export function LinkCard({to, product, icon, title, description}) {
  const CardLink = product ? VersionAwareDocLink : Link;
  return (
    <CardLink to={to} product={product} className={clsx('card', styles.card)}>
      {icon && (
        <span className={clsx('material-icons-outlined', styles.icon)} aria-hidden="true">
          {icon}
        </span>
      )}
      <span className={styles.title}>{title}</span>
      {description && <span className={styles.description}>{description}</span>}
    </CardLink>
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

// The shipped service pages as an inline "A, B, or C" link list, for prose and
// list items where a card grid would be too heavy.
export function ServiceLinks() {
  return services.map((service, index) => (
    <React.Fragment key={service.to}>
      {index > 0 && (index === services.length - 1 ? (services.length > 2 ? ', or ' : ' or ') : ', ')}
      <Link to={service.to}>{service.shortTitle}</Link>
    </React.Fragment>
  ));
}

export default ServiceCards;
