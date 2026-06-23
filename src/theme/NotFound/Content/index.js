import React from 'react';
import Link from '@docusaurus/Link';

export default function NotFoundContent() {
  return (
    <main className="not-found">
      <div className="not-found__inner">
        <div className="not-found__code">404</div>
        <h1 className="not-found__heading">Page not found</h1>
        <p className="not-found__body">
          The page you're looking for has moved or doesn't exist.
        </p>
        <Link className="not-found__link" to="/docs">
          Back to docs
        </Link>
      </div>
    </main>
  );
}
