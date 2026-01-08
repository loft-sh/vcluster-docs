# Auto-generated redirect tests
# Generated: 2026-01-08 11:50:04 UTC
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

# Test: manage/backup-restore -> manage/backup-restore/backup
GET {{BASE_URL}}/docs/vcluster/manage/backup-restore/
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/manage/backup-restore/backup"

GET {{BASE_URL}}/docs/vcluster/next/manage/backup-restore/
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/next/manage/backup-restore/backup"

# Verify destination exists
GET {{BASE_URL}}/docs/vcluster/manage/backup-restore/backup/
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

