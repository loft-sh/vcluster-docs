# Platform configure redirects - doc-1107 branch
# Tests only the redirects added in this PR

# Test: configure/domain -> configure/installation-options/domain
GET {{BASE_URL}}/docs/platform/configure/domain/
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/configure/installation-options/domain"

# Test: configure/advanced/audit -> configure/platform-configs/audit
GET {{BASE_URL}}/docs/platform/configure/advanced/audit/
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/configure/platform-configs/audit"

# Test: configure/cost-control -> configure/platform-configs/cost-control
GET {{BASE_URL}}/docs/platform/configure/cost-control/
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/configure/platform-configs/cost-control"

# Test: configure/custom-branding -> configure/platform-configs/custom-branding
GET {{BASE_URL}}/docs/platform/configure/custom-branding/
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/configure/platform-configs/custom-branding"

# Test: configure/config -> configure/introduction
GET {{BASE_URL}}/docs/platform/configure/config/
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/configure/introduction"

# Test: configure/high-availability -> configure/introduction
GET {{BASE_URL}}/docs/platform/configure/high-availability/
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/configure/introduction"

# Test: SSO paths -> consolidated single-sign-on page
GET {{BASE_URL}}/docs/platform/configure/single-sign-on/overview/
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/configure/platform-configs/single-sign-on"

GET {{BASE_URL}}/docs/platform/configure/single-sign-on/group-sync/
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/configure/platform-configs/single-sign-on"

GET {{BASE_URL}}/docs/platform/configure/single-sign-on/providers/github/
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/configure/platform-configs/single-sign-on"

# Verify destinations exist
GET {{BASE_URL}}/docs/platform/configure/installation-options/domain/
HTTP 200

GET {{BASE_URL}}/docs/platform/configure/platform-configs/audit/
HTTP 200

GET {{BASE_URL}}/docs/platform/configure/platform-configs/single-sign-on/
HTTP 200

GET {{BASE_URL}}/docs/platform/configure/introduction/
HTTP 200
