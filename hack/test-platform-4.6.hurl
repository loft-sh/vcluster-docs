# Platform 4.6 Documentation Release Tests
# Usage: hurl --test --variable BASE_URL=https://deploy-preview-XXXX--vcluster-docs-site.netlify.app hack/test-platform-4.6.hurl

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

# Test 2: Platform 4.6.0 redirects to main platform docs (latest doesn't use version in URL)
GET {{BASE_URL}}/docs/platform/4.6.0
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/"

# Test 3: Platform 4.5.0 versioned docs are accessible
GET {{BASE_URL}}/docs/platform/4.5.0/
HTTP 200
[Asserts]
body contains "vCluster Platform"

# Test 3b: Platform 4.4.0 versioned docs are accessible
GET {{BASE_URL}}/docs/platform/4.4.0/
HTTP 200
[Asserts]
body contains "vCluster Platform"

# Test 4: Verify create-templates page exists in Platform 4.6
GET {{BASE_URL}}/docs/platform/administer/templates/create-templates
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/administer/templates/create-templates/"

# Test 4b: Verify create-templates loads with trailing slash
GET {{BASE_URL}}/docs/platform/administer/templates/create-templates/
HTTP 200
[Asserts]
body contains "templates"

# Test 5: Platform 4.5.0 URLs redirect to add trailing slash (stay in 4.5.0)
GET {{BASE_URL}}/docs/platform/4.5.0/administer/templates/create-templates
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/4.5.0/administer/templates/create-templates/"

# Test 6: Verify project.mdx partials path returns 404 (not a valid URL)
GET {{BASE_URL}}/docs/platform/api/_partials/resources/config/external/platform/project
HTTP 404

# Test 7: Verify announcement bar shows Platform 4.6
GET {{BASE_URL}}/docs/
HTTP 200
[Asserts]
body contains "Platform 4.6"

# Test 8: Platform API redirects to resources
GET {{BASE_URL}}/docs/platform/api
HTTP 301
[Asserts]
header "Location" contains "/docs/platform/api/resources"

# Test 9: Version dropdown shows v4.6 Stable
GET {{BASE_URL}}/docs/platform/
HTTP 200
[Asserts]
body contains "v4.6 Stable"
