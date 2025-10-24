# Auto-generated redirect tests
# Generated: 2025-10-24 13:36:09 UTC
# Usage: hurl --test --variable BASE_URL=https://www.vcluster.com test-redirects.hurl

# Test: configure/vcluster-yaml/sync/to-host/storage/volume-snapshots -> understand/volume-snapshots
GET {{BASE_URL}}/docs/vcluster/configure/vcluster-yaml/sync/to-host/storage/volume-snapshots/
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/understand/volume-snapshots"

GET {{BASE_URL}}/docs/vcluster/next/configure/vcluster-yaml/sync/to-host/storage/volume-snapshots/
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/next/understand/volume-snapshots"

# Verify destination exists
GET {{BASE_URL}}/docs/vcluster/understand/volume-snapshots/
HTTP 200

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

