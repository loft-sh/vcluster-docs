# Auto-generated redirect tests
# Generated: 2026-01-28 14:48:00 UTC
# Usage: hurl --test --variable BASE_URL=https://www.vcluster.com hack/test-redirects.hurl
#
# Tests use fake version (99.0.0) to avoid versioned docs serving content.
# Redirects are fallbacks - they only fire when no content exists at source path.

# Test: deploy/control-plane/container/flux -> third-party-integrations/git-operations/flux
GET {{BASE_URL}}/docs/vcluster/99.0.0/deploy/control-plane/container/flux/
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/99.0.0/third-party-integrations/git-operations/flux"

# Test: manage/backup-restore -> manage/backup-restore/backup
GET {{BASE_URL}}/docs/vcluster/99.0.0/manage/backup-restore/
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/99.0.0/manage/backup-restore/backup"

# Test: manage/backup-restore/volume-snapshots -> manage/backup-restore/volume-snapshots/setup
GET {{BASE_URL}}/docs/vcluster/99.0.0/manage/backup-restore/volume-snapshots/
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/99.0.0/manage/backup-restore/volume-snapshots/setup"

# Test: manage/backup-restore/volume-snapshots/README -> manage/backup-restore/volume-snapshots/setup
GET {{BASE_URL}}/docs/vcluster/99.0.0/manage/backup-restore/volume-snapshots/README/
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/99.0.0/manage/backup-restore/volume-snapshots/setup"

# Test: platform/administer/backup-restore/backup-restore-platform -> platform/maintenance/backup-restore/backup-restore-platform
GET {{BASE_URL}}/docs/platform/99.0.0/administer/backup-restore/backup-restore-platform/
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/99.0.0/maintenance/backup-restore/backup-restore-platform"

# Test: platform/administer/backup-restore/preserve-license -> platform/maintenance/backup-restore/preserve-license
GET {{BASE_URL}}/docs/platform/99.0.0/administer/backup-restore/preserve-license/
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/99.0.0/maintenance/backup-restore/preserve-license"

# Test: platform/administer/monitoring/aggregating-metrics -> platform/maintenance/monitoring/aggregating-metrics
GET {{BASE_URL}}/docs/platform/99.0.0/administer/monitoring/aggregating-metrics/
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/99.0.0/maintenance/monitoring/aggregating-metrics"

# Test: platform/administer/monitoring/central-hostpath-mapper -> platform/maintenance/monitoring/central-hostpath-mapper
GET {{BASE_URL}}/docs/platform/99.0.0/administer/monitoring/central-hostpath-mapper/
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/99.0.0/maintenance/monitoring/central-hostpath-mapper"

# Test: platform/administer/monitoring/metrics -> platform/maintenance/monitoring/metrics
GET {{BASE_URL}}/docs/platform/99.0.0/administer/monitoring/metrics/
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/99.0.0/maintenance/monitoring/metrics"

# Test: platform/administer/platform-database/database -> platform/maintenance/platform-database/database
GET {{BASE_URL}}/docs/platform/99.0.0/administer/platform-database/database/
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/99.0.0/maintenance/platform-database/database"

# Test: platform/administer/users-permissions/access-keys -> platform/administer/authentication/access-keys
GET {{BASE_URL}}/docs/platform/99.0.0/administer/users-permissions/access-keys/
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/99.0.0/administer/authentication/access-keys"

# Test: platform/configure/advanced/audit -> platform/configure/platform-configs/audit
GET {{BASE_URL}}/docs/platform/99.0.0/configure/advanced/audit/
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/99.0.0/configure/platform-configs/audit"

# Test: platform/configure/agent-settings/troubleshotting -> platform/configure/agent-settings/troubleshooting
GET {{BASE_URL}}/docs/platform/99.0.0/configure/agent-settings/troubleshotting/
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/99.0.0/configure/agent-settings/troubleshooting"

# Test: platform/configure/config -> platform/configure/introduction
GET {{BASE_URL}}/docs/platform/99.0.0/configure/config/
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/99.0.0/configure/introduction"

# Test: platform/configure/cost-control -> platform/configure/platform-configs/cost-control
GET {{BASE_URL}}/docs/platform/99.0.0/configure/cost-control/
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/99.0.0/configure/platform-configs/cost-control"

# Test: platform/configure/custom-branding -> platform/configure/platform-configs/custom-branding
GET {{BASE_URL}}/docs/platform/99.0.0/configure/custom-branding/
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/99.0.0/configure/platform-configs/custom-branding"

# Test: platform/configure/domain -> platform/configure/installation-options/domain
GET {{BASE_URL}}/docs/platform/99.0.0/configure/domain/
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/99.0.0/configure/installation-options/domain"

# Test: platform/configure/high-availability -> platform/configure/introduction
GET {{BASE_URL}}/docs/platform/99.0.0/configure/high-availability/
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/99.0.0/configure/introduction"

# Test: platform/configure/single-sign-on/group-sync -> platform/configure/platform-configs/single-sign-on
GET {{BASE_URL}}/docs/platform/99.0.0/configure/single-sign-on/group-sync/
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/99.0.0/configure/platform-configs/single-sign-on"

# Test: platform/configure/single-sign-on/multiple-sso -> platform/configure/platform-configs/single-sign-on
GET {{BASE_URL}}/docs/platform/99.0.0/configure/single-sign-on/multiple-sso/
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/99.0.0/configure/platform-configs/single-sign-on"

# Test: platform/configure/single-sign-on/overview -> platform/configure/platform-configs/single-sign-on
GET {{BASE_URL}}/docs/platform/99.0.0/configure/single-sign-on/overview/
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/99.0.0/configure/platform-configs/single-sign-on"

# Test: platform/configure/single-sign-on/providers/github -> platform/configure/platform-configs/single-sign-on
GET {{BASE_URL}}/docs/platform/99.0.0/configure/single-sign-on/providers/github/
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/99.0.0/configure/platform-configs/single-sign-on"

# Test: platform/configure/single-sign-on/providers/gitlab -> platform/configure/platform-configs/single-sign-on
GET {{BASE_URL}}/docs/platform/99.0.0/configure/single-sign-on/providers/gitlab/
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/99.0.0/configure/platform-configs/single-sign-on"

# Test: platform/configure/single-sign-on/providers/google -> platform/configure/platform-configs/single-sign-on
GET {{BASE_URL}}/docs/platform/99.0.0/configure/single-sign-on/providers/google/
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/99.0.0/configure/platform-configs/single-sign-on"

# Test: platform/configure/single-sign-on/providers/ldap -> platform/configure/platform-configs/single-sign-on
GET {{BASE_URL}}/docs/platform/99.0.0/configure/single-sign-on/providers/ldap/
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/99.0.0/configure/platform-configs/single-sign-on"

# Test: platform/configure/single-sign-on/providers/microsoft -> platform/configure/platform-configs/single-sign-on
GET {{BASE_URL}}/docs/platform/99.0.0/configure/single-sign-on/providers/microsoft/
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/99.0.0/configure/platform-configs/single-sign-on"

# Test: platform/configure/single-sign-on/providers/okta -> platform/configure/platform-configs/single-sign-on
GET {{BASE_URL}}/docs/platform/99.0.0/configure/single-sign-on/providers/okta/
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/99.0.0/configure/platform-configs/single-sign-on"

# Test: platform/configure/single-sign-on/providers/openid-connect -> platform/configure/platform-configs/single-sign-on
GET {{BASE_URL}}/docs/platform/99.0.0/configure/single-sign-on/providers/openid-connect/
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/99.0.0/configure/platform-configs/single-sign-on"

# Test: platform/configure/single-sign-on/providers/other-dex -> platform/configure/platform-configs/single-sign-on
GET {{BASE_URL}}/docs/platform/99.0.0/configure/single-sign-on/providers/other-dex/
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/99.0.0/configure/platform-configs/single-sign-on"

# Test: platform/configure/single-sign-on/providers/saml -> platform/configure/platform-configs/single-sign-on
GET {{BASE_URL}}/docs/platform/99.0.0/configure/single-sign-on/providers/saml/
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/99.0.0/configure/platform-configs/single-sign-on"

# Test: platform/how-to/oidc-provider -> platform/administer/authentication/oidc-provider
GET {{BASE_URL}}/docs/platform/99.0.0/how-to/oidc-provider/
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/99.0.0/administer/authentication/oidc-provider"

# Test: platform/how-to/reset-admin-password -> platform/administer/authentication/reset-admin-password
GET {{BASE_URL}}/docs/platform/99.0.0/how-to/reset-admin-password/
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/99.0.0/administer/authentication/reset-admin-password"

# Test: platform/install/upgrade-migrate/lifecycle-policy -> platform/maintenance/upgrade-migrate/lifecycle-policy
GET {{BASE_URL}}/docs/platform/99.0.0/install/upgrade-migrate/lifecycle-policy/
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/99.0.0/maintenance/upgrade-migrate/lifecycle-policy"

# Test: platform/install/upgrade-migrate/migrate-to-hostcluster -> platform/maintenance/upgrade-migrate/migrate-to-hostcluster
GET {{BASE_URL}}/docs/platform/99.0.0/install/upgrade-migrate/migrate-to-hostcluster/
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/99.0.0/maintenance/upgrade-migrate/migrate-to-hostcluster"

# Test: platform/reference/migrations/4-0-migration -> platform/maintenance/upgrade-migrate/upgrade
GET {{BASE_URL}}/docs/platform/99.0.0/reference/migrations/4-0-migration/
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/99.0.0/maintenance/upgrade-migrate/upgrade"

