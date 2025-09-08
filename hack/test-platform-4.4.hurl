# Platform 4.4 Documentation Release Tests
# Testing on preview URL: https://deploy-preview-1131--vcluster-docs-site.netlify.app
# Usage: hurl --variable BASE_URL=https://deploy-preview-1131--vcluster-docs-site.netlify.app test-platform-4.4.hurl

# Test 1: Platform main redirects to trailing slash
GET {{BASE_URL}}/docs/platform
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/"

# Test 1b: Platform main page loads with trailing slash
GET {{BASE_URL}}/docs/platform/
HTTP 200
[Asserts]
body contains "vCluster Platform"

# Test 2: Platform 4.4.0 redirects to main platform docs (latest doesn't use version in URL)
GET {{BASE_URL}}/docs/platform/4.4.0
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/"

# Test 3: Platform 4.3.0 redirects to main platform docs (preview behavior)
GET {{BASE_URL}}/docs/platform/4.3.0
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/"

# Test 3b: Platform 4.3.0 versioned docs are accessible
# Note: Versioned platform docs exist and are accessible
GET {{BASE_URL}}/docs/platform/4.3.0/
HTTP 200
[Asserts]
body contains "vCluster Platform"

# Test 4: Verify create-templates page exists in Platform 4.4
GET {{BASE_URL}}/docs/platform/administer/templates/create-templates
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/administer/templates/create-templates/"

# Test 4b: Verify create-templates loads with trailing slash
GET {{BASE_URL}}/docs/platform/administer/templates/create-templates/
HTTP 200
[Asserts]
body contains "templates"

# Test 5: Platform 4.3.0 URLs redirect to add trailing slash (stay in 4.3.0)
# Versioned platform docs stay within their version
GET {{BASE_URL}}/docs/platform/4.3.0/administer/templates/create-virtual-cluster-template
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/4.3.0/administer/templates/create-virtual-cluster-template/"

# Test 5b: The consolidated create-templates page should exist in current platform
GET {{BASE_URL}}/docs/platform/administer/templates/create-templates/
HTTP 200
[Asserts]
body contains "templates"

# Test 6: Verify project.mdx removed from Platform 4.4 main (should 404)
GET {{BASE_URL}}/docs/platform/api/_partials/resources/config/external/platform/project
HTTP 404

# Test 7: Check vCluster 0.26.0 references to Platform 4.3 work
GET {{BASE_URL}}/docs/vcluster/0.26.0/configure/vcluster-yaml/policies/network-policy/
HTTP 200
[Asserts]
body contains "VirtualClusterTemplates"
body contains "/platform/4.3.0/administer/templates/create-virtual-cluster-template"

# Test 8: Check main vCluster (latest/next) references to Platform 4.4 work
GET {{BASE_URL}}/docs/vcluster/next/configure/vcluster-yaml/policies/network-policy/
HTTP 200
[Asserts]
body contains "VirtualClusterTemplates"
body contains "/platform/administer/templates/create-templates"

# Test 9: Verify announcement bar shows Platform 4.4
GET {{BASE_URL}}/docs/
HTTP 200
[Asserts]
body contains "Platform 4.4"
body contains "vCluster 0.27"

# Test 10: Platform API redirects to resources
GET {{BASE_URL}}/docs/platform/api
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/api/resources"