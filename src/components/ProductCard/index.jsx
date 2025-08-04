import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

export default function ProductCard({ 
  title, 
  description, 
  icon, 
  link, 
  linkText = 'Read the docs',
  className,
  accentColor 
}) {
  // Check if link is external
  const isExternal = link && (link.startsWith('http://') || link.startsWith('https://'));
  
  return (
    <div className={clsx('card', styles.productCard, className)}>
      <div className={clsx('card__header', styles.cardHeader)}>
        {icon && (
          <div className={styles.iconWrapper}>
            {typeof icon === 'string' ? (
              <img src={icon} alt={`${title} icon`} className={styles.icon} />
            ) : React.isValidElement(icon) ? (
              icon
            ) : (
              React.createElement(icon, { className: styles.icon })
            )}
          </div>
        )}
        <h3 className={styles.title}>{title}</h3>
      </div>
      <div className={clsx('card__body', styles.cardBody)}>
        <p className={styles.description}>{description}</p>
      </div>
      <div className={clsx('card__footer', styles.cardFooter)}>
        {isExternal ? (
          <a 
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className={clsx('button button--primary', styles.cardLink)}
            style={accentColor ? { backgroundColor: accentColor, borderColor: accentColor } : {}}
          >
            {linkText}
          </a>
        ) : (
          <Link 
            to={link} 
            className={clsx('button button--primary', styles.cardLink)}
            style={accentColor ? { backgroundColor: accentColor, borderColor: accentColor } : {}}
          >
            {linkText}
          </Link>
        )}
      </div>
    </div>
  );
}