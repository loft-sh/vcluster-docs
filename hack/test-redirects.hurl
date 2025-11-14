# Auto-generated redirect tests
# Generated: 2025-11-12 16:16:05 UTC
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

# Test: manage/backup-restore/volume-snapshots -> manage/backup-restore/volume-snapshots/setup
GET {{BASE_URL}}/docs/vcluster/manage/backup-restore/volume-snapshots/
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/manage/backup-restore/volume-snapshots/setup"

GET {{BASE_URL}}/docs/vcluster/next/manage/backup-restore/volume-snapshots/
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/next/manage/backup-restore/volume-snapshots/setup"

# Verify destination exists
GET {{BASE_URL}}/docs/vcluster/manage/backup-restore/volume-snapshots/setup/
HTTP 200

# Test: manage/backup-restore/volume-snapshots/README -> manage/backup-restore/volume-snapshots/setup
GET {{BASE_URL}}/docs/vcluster/manage/backup-restore/volume-snapshots/README/
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/manage/backup-restore/volume-snapshots/setup"

GET {{BASE_URL}}/docs/vcluster/next/manage/backup-restore/volume-snapshots/README/
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/next/manage/backup-restore/volume-snapshots/setup"

# Verify destination exists
GET {{BASE_URL}}/docs/vcluster/manage/backup-restore/volume-snapshots/setup/
HTTP 200

