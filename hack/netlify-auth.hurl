# Authenticate with Netlify password protection
# This file is used by CI to authenticate with password-protected preview sites
# Usage: hurl --cookie-jar cookies.txt --variable BASE_URL=https://... --variable NETLIFY_PASSWORD=... netlify-auth.hurl

POST {{BASE_URL}}/docs/vcluster/
[Options]
location: true
[FormParams]
password: {{NETLIFY_PASSWORD}}
form-name: form 1
HTTP *

# Verify authentication worked
GET {{BASE_URL}}/docs/vcluster/
HTTP 200
[Asserts]
body contains "vCluster"