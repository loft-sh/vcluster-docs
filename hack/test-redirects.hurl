# Auto-generated redirect tests
# Generated: 2026-01-09 18:24:12 UTC
# Usage: hurl --test --variable BASE_URL=https://www.vcluster.com test-redirects.hurl

# Test: deploy/control-plane/container/flux -> third-party-integrations/git-operations/flux
GET {{BASE_URL}}/docs/vcluster/deploy/control-plane/container/flux/
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/third-party-integrations/git-operations/flux"

# Verify destination exists
GET {{BASE_URL}}/docs/vcluster/third-party-integrations/git-operations/flux/
HTTP 200

# Test: manage/backup-restore/volume-snapshots -> manage/backup-restore/volume-snapshots/setup
GET {{BASE_URL}}/docs/vcluster/manage/backup-restore/volume-snapshots/
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/manage/backup-restore/volume-snapshots/setup"

# Verify destination exists
GET {{BASE_URL}}/docs/vcluster/manage/backup-restore/volume-snapshots/setup/
HTTP 200

# Test: manage/backup-restore/volume-snapshots/README -> manage/backup-restore/volume-snapshots/setup
GET {{BASE_URL}}/docs/vcluster/manage/backup-restore/volume-snapshots/README/
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/manage/backup-restore/volume-snapshots/setup"

# Verify destination exists
GET {{BASE_URL}}/docs/vcluster/manage/backup-restore/volume-snapshots/setup/
HTTP 200

# Test: platform/configure/advanced/audit -> platform/configure/platform-configs/audit
GET {{BASE_URL}}/docs/platform/configure/advanced/audit/
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/configure/platform-configs/audit"

# Verify destination exists
GET {{BASE_URL}}/docs/platform/configure/platform-configs/audit/
HTTP 200

# Test: platform/configure/config -> platform/configure/introduction
GET {{BASE_URL}}/docs/platform/configure/config/
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/configure/introduction"

# Verify destination exists
GET {{BASE_URL}}/docs/platform/configure/introduction/
HTTP 200

# Test: platform/configure/cost-control -> platform/configure/platform-configs/cost-control
GET {{BASE_URL}}/docs/platform/configure/cost-control/
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/configure/platform-configs/cost-control"

# Verify destination exists
GET {{BASE_URL}}/docs/platform/configure/platform-configs/cost-control/
HTTP 200

# Test: platform/configure/custom-branding -> platform/configure/platform-configs/custom-branding
GET {{BASE_URL}}/docs/platform/configure/custom-branding/
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/configure/platform-configs/custom-branding"

# Verify destination exists
GET {{BASE_URL}}/docs/platform/configure/platform-configs/custom-branding/
HTTP 200

# Test: platform/configure/domain -> platform/configure/installation-options/domain
GET {{BASE_URL}}/docs/platform/configure/domain/
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/configure/installation-options/domain"

# Verify destination exists
GET {{BASE_URL}}/docs/platform/configure/installation-options/domain/
HTTP 200

# Test: platform/configure/high-availability -> platform/configure/introduction
GET {{BASE_URL}}/docs/platform/configure/high-availability/
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/configure/introduction"

# Verify destination exists
GET {{BASE_URL}}/docs/platform/configure/introduction/
HTTP 200

# Test: platform/configure/single-sign-on/group-sync -> platform/configure/platform-configs/single-sign-on
GET {{BASE_URL}}/docs/platform/configure/single-sign-on/group-sync/
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/configure/platform-configs/single-sign-on"

# Verify destination exists
GET {{BASE_URL}}/docs/platform/configure/platform-configs/single-sign-on/
HTTP 200

# Test: platform/configure/single-sign-on/multiple-sso -> platform/configure/platform-configs/single-sign-on
GET {{BASE_URL}}/docs/platform/configure/single-sign-on/multiple-sso/
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/configure/platform-configs/single-sign-on"

# Verify destination exists
GET {{BASE_URL}}/docs/platform/configure/platform-configs/single-sign-on/
HTTP 200

# Test: platform/configure/single-sign-on/overview -> platform/configure/platform-configs/single-sign-on
GET {{BASE_URL}}/docs/platform/configure/single-sign-on/overview/
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/configure/platform-configs/single-sign-on"

# Verify destination exists
GET {{BASE_URL}}/docs/platform/configure/platform-configs/single-sign-on/
HTTP 200

# Test: platform/configure/single-sign-on/providers/github -> platform/configure/platform-configs/single-sign-on
GET {{BASE_URL}}/docs/platform/configure/single-sign-on/providers/github/
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/configure/platform-configs/single-sign-on"

# Verify destination exists
GET {{BASE_URL}}/docs/platform/configure/platform-configs/single-sign-on/
HTTP 200

# Test: platform/configure/single-sign-on/providers/gitlab -> platform/configure/platform-configs/single-sign-on
GET {{BASE_URL}}/docs/platform/configure/single-sign-on/providers/gitlab/
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/configure/platform-configs/single-sign-on"

# Verify destination exists
GET {{BASE_URL}}/docs/platform/configure/platform-configs/single-sign-on/
HTTP 200

# Test: platform/configure/single-sign-on/providers/google -> platform/configure/platform-configs/single-sign-on
GET {{BASE_URL}}/docs/platform/configure/single-sign-on/providers/google/
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/configure/platform-configs/single-sign-on"

# Verify destination exists
GET {{BASE_URL}}/docs/platform/configure/platform-configs/single-sign-on/
HTTP 200

# Test: platform/configure/single-sign-on/providers/ldap -> platform/configure/platform-configs/single-sign-on
GET {{BASE_URL}}/docs/platform/configure/single-sign-on/providers/ldap/
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/configure/platform-configs/single-sign-on"

# Verify destination exists
GET {{BASE_URL}}/docs/platform/configure/platform-configs/single-sign-on/
HTTP 200

# Test: platform/configure/single-sign-on/providers/microsoft -> platform/configure/platform-configs/single-sign-on
GET {{BASE_URL}}/docs/platform/configure/single-sign-on/providers/microsoft/
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/configure/platform-configs/single-sign-on"

# Verify destination exists
GET {{BASE_URL}}/docs/platform/configure/platform-configs/single-sign-on/
HTTP 200

# Test: platform/configure/single-sign-on/providers/okta -> platform/configure/platform-configs/single-sign-on
GET {{BASE_URL}}/docs/platform/configure/single-sign-on/providers/okta/
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/configure/platform-configs/single-sign-on"

# Verify destination exists
GET {{BASE_URL}}/docs/platform/configure/platform-configs/single-sign-on/
HTTP 200

# Test: platform/configure/single-sign-on/providers/openid-connect -> platform/configure/platform-configs/single-sign-on
GET {{BASE_URL}}/docs/platform/configure/single-sign-on/providers/openid-connect/
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/configure/platform-configs/single-sign-on"

# Verify destination exists
GET {{BASE_URL}}/docs/platform/configure/platform-configs/single-sign-on/
HTTP 200

# Test: platform/configure/single-sign-on/providers/other-dex -> platform/configure/platform-configs/single-sign-on
GET {{BASE_URL}}/docs/platform/configure/single-sign-on/providers/other-dex/
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/configure/platform-configs/single-sign-on"

# Verify destination exists
GET {{BASE_URL}}/docs/platform/configure/platform-configs/single-sign-on/
HTTP 200

# Test: platform/configure/single-sign-on/providers/saml -> platform/configure/platform-configs/single-sign-on
GET {{BASE_URL}}/docs/platform/configure/single-sign-on/providers/saml/
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/configure/platform-configs/single-sign-on"

# Verify destination exists
GET {{BASE_URL}}/docs/platform/configure/platform-configs/single-sign-on/
HTTP 200

