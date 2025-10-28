# Auto-generated redirect tests
# Generated: 2025-10-28 14:56:02 UTC
# Usage: hurl --test --variable BASE_URL=https://www.vcluster.com test-redirects.hurl

# Test: deploy/control-plane/container/flux -> third-party-integrations/git-operations/flux
GET {{BASE_URL}}/docs/vcluster/deploy/control-plane/container/flux/
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/third-party-integrations/git-operations/flux"

GET {{BASE_URL}}/docs/vcluster/next/deploy/control-plane/container/flux/
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/next/third-party-integrations/git-operations/flux"

# Verify destination exists
GET {{BASE_URL}}/docs/vcluster/third-party-integrations/git-operations/flux/
HTTP 200

# Test: deploy/worker-nodes/private-nodes/auto-nodes -> deploy/worker-nodes/private-nodes/auto-nodes/README
GET {{BASE_URL}}/docs/vcluster/deploy/worker-nodes/private-nodes/auto-nodes/
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/deploy/worker-nodes/private-nodes/auto-nodes/README"

GET {{BASE_URL}}/docs/vcluster/next/deploy/worker-nodes/private-nodes/auto-nodes/
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/next/deploy/worker-nodes/private-nodes/auto-nodes/README"

# Verify destination exists
GET {{BASE_URL}}/docs/vcluster/deploy/worker-nodes/private-nodes/auto-nodes/README/
HTTP 200

