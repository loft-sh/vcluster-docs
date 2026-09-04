# Cross-domain redirect tests
# Usage:
# hurl --test \
#   --variable VCLUSTER_COM_URL=https://www.vcluster.com \
#   --variable VCLUSTER_APEX_URL=https://vcluster.com \
#   --variable VCLUSTER_PRO_URL=https://vcluster.pro \
#   --variable VCLUSTER_PRO_WWW_URL=https://www.vcluster.pro \
#   hack/test-domain-redirects.hurl

# vcluster.com marketing redirects
GET {{VCLUSTER_COM_URL}}/pro
HTTP 301
[Asserts]
header "Location" == "/enterprise-demo"

GET {{VCLUSTER_COM_URL}}/pro/
HTTP 301
[Asserts]
header "Location" == "/enterprise-demo"

GET {{VCLUSTER_COM_URL}}/pro?source=hurl
HTTP 301
[Asserts]
header "Location" == "/enterprise-demo?source=hurl"

# vcluster.com Pro docs redirects
GET {{VCLUSTER_COM_URL}}/pro/docs
HTTP 302
[Asserts]
header "Location" == "/pro/docs/getting-started/explore"

GET {{VCLUSTER_COM_URL}}/pro/docs/getting-started/install
HTTP 301
[Asserts]
header "Location" == "{{VCLUSTER_COM_URL}}/docs/platform/install/quick-start-guide"

GET {{VCLUSTER_COM_URL}}/pro/docs/virtual-clusters/create
HTTP 301
[Asserts]
header "Location" == "{{VCLUSTER_COM_URL}}/docs/platform/use-platform/virtual-clusters/create/create-no-template"

# vcluster.com control routes
GET {{VCLUSTER_COM_URL}}/docs/
HTTP 200

GET {{VCLUSTER_COM_URL}}/docs/v0.33
HTTP 302
[Asserts]
header "Location" contains "vcluster-v0-33--vcluster-docs-site.netlify.app/docs/vcluster/"

GET {{VCLUSTER_COM_URL}}/docs/v4.7
HTTP 302
[Asserts]
header "Location" contains "platform-v4-7--vcluster-docs-site.netlify.app/docs/platform/"

GET {{VCLUSTER_COM_URL}}/releases/en/changelog
HTTP 302
[Asserts]
header "Location" == "/releases/changelog"

GET {{VCLUSTER_COM_URL}}/pricing
HTTP 200

GET {{VCLUSTER_COM_URL}}/robots.txt
HTTP 200

# vcluster.pro preserves the incoming path
GET {{VCLUSTER_PRO_URL}}/
HTTP 302
[Asserts]
header "Location" == "{{VCLUSTER_APEX_URL}}/"

GET {{VCLUSTER_PRO_URL}}/pro
HTTP 302
[Asserts]
header "Location" == "{{VCLUSTER_APEX_URL}}/pro"

GET {{VCLUSTER_PRO_URL}}/pro/
HTTP 302
[Asserts]
header "Location" == "{{VCLUSTER_APEX_URL}}/pro/"

GET {{VCLUSTER_PRO_URL}}/pro/docs/getting-started/install
HTTP 302
[Asserts]
header "Location" == "{{VCLUSTER_APEX_URL}}/pro/docs/getting-started/install"

GET {{VCLUSTER_PRO_URL}}/pro/docs/virtual-clusters/create
HTTP 302
[Asserts]
header "Location" == "{{VCLUSTER_APEX_URL}}/pro/docs/virtual-clusters/create"

GET {{VCLUSTER_PRO_URL}}/docs/getting-started/install
HTTP 302
[Asserts]
header "Location" == "{{VCLUSTER_APEX_URL}}/docs/getting-started/install"

GET {{VCLUSTER_PRO_URL}}/pro/docs/getting-started/install?source=hurl
HTTP 302
[Asserts]
header "Location" == "{{VCLUSTER_APEX_URL}}/pro/docs/getting-started/install?source=hurl"

GET {{VCLUSTER_PRO_WWW_URL}}/pro/docs/getting-started/install
HTTP 301
[Asserts]
header "Location" == "{{VCLUSTER_PRO_URL}}/pro/docs/getting-started/install"
