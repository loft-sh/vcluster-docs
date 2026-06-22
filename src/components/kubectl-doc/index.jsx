import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

// Site-side positioning override for the vendored explorer (see overrides.css).
// Bundled at build time; the import is stripped from the JS, so it stays SSR-safe.
import './overrides.css';

/**
 * SchemaExplorer: SSR-safe Docusaurus wrapper around the vendored kubectl-doc
 * KubeSchemaDoc component (sttts/kubectl-doc, Apache-2.0, pinned to v0.2.9).
 *
 * The underlying component mounts an imperative runtime (window.KubectlDoc) in a
 * useEffect and dynamically imports an 87KB runtime bundle. BrowserOnly keeps that
 * client-only code path out of the SSR bundle entirely, so the server renders the
 * fallback and the explorer hydrates on the client.
 *
 * This is an evaluation prototype (DOC-1512). It is intentionally not wired into
 * any docs sidebar or the generated config reference pipeline.
 */
export default function SchemaExplorer({data, ...props}) {
  return (
    <BrowserOnly
      fallback={
        <div className="kdoc-loading" style={{padding: '1rem', opacity: 0.7}}>
          Loading schema explorer…
        </div>
      }
    >
      {() => {
        const {KubeSchemaDoc} = require('./KubeSchemaDoc');
        return <KubeSchemaDoc data={data} {...props} />;
      }}
    </BrowserOnly>
  );
}
