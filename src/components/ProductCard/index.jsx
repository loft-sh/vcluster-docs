import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

export default function ProductCard({ 
  title, 
  description, 
  icon, 
  link, 
  linkText = 'Get started',
  className,
  accentColor,
  features = []
}) {
  const isExternal = link && (link.startsWith('http://') || link.startsWith('https://'));
  
  return (
    <div className={styles.productSection}>
      <div className={clsx('card', styles.productCard, className)} 
           style={accentColor ? { borderLeftColor: accentColor } : {}}>
        <div className={styles.productHeader}>
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
          <div className={styles.productContent}>
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.description}>{description}</p>
            {isExternal ? (
              <a 
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className={clsx('button button--primary button--lg', styles.ctaButton)}
              >
                {linkText}
              </a>
            ) : (
              <Link 
                to={link} 
                className={clsx('button button--primary button--lg', styles.ctaButton)}
              >
                {linkText}
              </Link>
            )}
          </div>
        </div>
      </div>
      
      {features && features.length > 0 && (
        <div className={styles.featuresGrid}>
          {features.map((feature, idx) => {
            const FeatureLink = feature.external ? 'a' : Link;
            const linkProps = feature.external 
              ? { href: feature.link, target: '_blank', rel: 'noopener noreferrer' }
              : { to: feature.link };
            
            return (
              <FeatureLink 
                key={idx} 
                {...linkProps}
                className={clsx('card', styles.featureBox)}
              >
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>{feature.description}</p>
              </FeatureLink>
            );
          })}
        </div>
      )}
    </div>
  );
}