# Auto-generated redirect tests
# Generated: 2026-02-13 10:09:51 UTC
# Usage: hurl --test --variable BASE_URL=https://www.vcluster.com hack/test-redirects.hurl
#
# Tests use fake version (99.0.0) to avoid versioned docs serving content.
# Redirects are fallbacks - they only fire when no content exists at source path.

# Test: cli/0-20-cli-changes -> reference/migrations/0-20-cli-changes
GET {{BASE_URL}}/docs/vcluster/99.0.0/cli/0-20-cli-changes/
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/99.0.0/reference/migrations/0-20-cli-changes"

# Test: configure/vcluster-yaml/sleep-mode -> configure/vcluster-yaml/sleep
GET {{BASE_URL}}/docs/vcluster/99.0.0/configure/vcluster-yaml/sleep-mode/
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/99.0.0/configure/vcluster-yaml/sleep"
# Test: deploy/control-plane/container/flux -> third-party-integrations/git-operations/flux
GET {{BASE_URL}}/docs/vcluster/99.0.0/deploy/control-plane/container/flux/
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/99.0.0/third-party-integrations/git-operations/flux"

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

# Test: platform/use-platform/virtual-clusters/key-features/sleep-mode -> vcluster/configure/vcluster-yaml/sleep
GET {{BASE_URL}}/docs/platform/99.0.0/use-platform/virtual-clusters/key-features/sleep-mode/
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/configure/vcluster-yaml/sleep"

# Test: platform/use-platform/virtual-clusters/key-features/snapshots -> vcluster/configure/vcluster-yaml/snapshots
GET {{BASE_URL}}/docs/platform/99.0.0/use-platform/virtual-clusters/key-features/snapshots/
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/configure/vcluster-yaml/snapshots"

