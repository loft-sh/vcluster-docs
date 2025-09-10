# Auto-generated redirect tests
# Generated: 2025-09-10 22:40:13 UTC
# Usage: hurl --test --variable BASE_URL=https://www.vcluster.com test-redirects.hurl

# Test: manage/backup-restore/README -> deploy/worker-nodes/private-nodes/README
GET {{BASE_URL}}/docs/vcluster/manage/backup-restore/README/
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/deploy/worker-nodes/private-nodes/README"

GET {{BASE_URL}}/docs/vcluster/next/manage/backup-restore/README/
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/next/deploy/worker-nodes/private-nodes/README"

# Verify destination exists
GET {{BASE_URL}}/docs/vcluster/deploy/worker-nodes/private-nodes/README/
HTTP 200

