# Auto-generated redirect tests
# Generated: 2025-10-21 09:46:51 UTC
# Usage: hurl --test --variable BASE_URL=https://www.vcluster.com test-redirects.hurl

# Test: deploy/control-plane/container/security/air-gapped -> deploy/worker-nodes/private-nodes/security/air-gapped
GET {{BASE_URL}}/docs/vcluster/deploy/control-plane/container/security/air-gapped/
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/deploy/worker-nodes/private-nodes/security/air-gapped"

GET {{BASE_URL}}/docs/vcluster/next/deploy/control-plane/container/security/air-gapped/
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/next/deploy/worker-nodes/private-nodes/security/air-gapped"

# Verify destination exists
GET {{BASE_URL}}/docs/vcluster/deploy/worker-nodes/private-nodes/security/air-gapped/
HTTP 200

