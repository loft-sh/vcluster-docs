# Auto-generated redirect tests
# Generated: 2026-01-09 09:10:55 UTC
# Usage: hurl --test --variable BASE_URL=https://www.vcluster.com test-redirects.hurl

# Test: configure/vcluster-yaml/sleep-mode -> configure/vcluster-yaml/sleep
GET {{BASE_URL}}/docs/vcluster/configure/vcluster-yaml/sleep-mode/
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/configure/vcluster-yaml/sleep"

GET {{BASE_URL}}/docs/vcluster/next/configure/vcluster-yaml/sleep-mode/
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/next/configure/vcluster-yaml/sleep"

# Verify destination exists
GET {{BASE_URL}}/docs/vcluster/configure/vcluster-yaml/sleep/
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

