import React from 'react';
import Layout from '@theme/Layout';
import SchemaExplorer from '@site/src/components/kubectl-doc';

// DOC-1512 evaluation prototype. Standalone sandbox page (not in any sidebar) that
// renders the vendored kubectl-doc explorer against a generated vcluster.yaml payload.
// Payload generated from configsrc/vcluster/main/vcluster.schema.json (sync.toHost.pods)
// via hack/vcluster/schema-explorer/make-crd.mjs + kubectl-doc. Regenerate with that script.
import payload from '@site/src/components/kubectl-doc/payloads/sync-toHost-pods.json';

export default function KubectlDocPrototype() {
  return (
    <Layout
      title="kubectl-doc prototype"
      description="DOC-1512: interactive schema reference evaluation"
    >
      <main style={{padding: '2rem', maxWidth: 1100, margin: '0 auto'}}>
        <h1>vcluster.yaml schema explorer (prototype)</h1>
        <p>
          DOC-1512 evaluation. Interactive YAML-shaped schema explorer powered by the
          vendored <code>kubectl-doc</code> <code>KubeSchemaDoc</code> component. Click a
          field to open its details panel; use the filter box and folding controls.
        </p>
        <SchemaExplorer data={payload} />
      </main>
    </Layout>
  );
}
