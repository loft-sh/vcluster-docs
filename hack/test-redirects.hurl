# vCluster v0.27 Redirect Tests
# Usage: hurl --variable BASE_URL=https://www.vcluster.com test-redirects.hurl
# Or:    export HURL_BASE_URL=https://www.vcluster.com && hurl test-redirects.hurl

# Test 1: kai-scheduler redirect (most common search result) - next stays in next
GET {{BASE_URL}}/docs/vcluster/next/learn-how-to/configure-kai-scheduler/
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/next/third-party-integrations/scheduler/kai-scheduler"

# Test 1b: Verify kai-scheduler destination exists (with trailing slash from pretty URLs)
GET {{BASE_URL}}/docs/vcluster/next/third-party-integrations/scheduler/kai-scheduler/
HTTP 200

# Test 2: Workload identity - GKE (next stays in next)
GET {{BASE_URL}}/docs/vcluster/next/integrations/pod-identity/gke-workload-identity/
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/next/third-party-integrations/pod-identity/gke-workload-identity"

# Test 2b: Verify GKE workload identity destination exists (with trailing slash)
GET {{BASE_URL}}/docs/vcluster/next/third-party-integrations/pod-identity/gke-workload-identity/
HTTP 200

# Test 3: Workload identity - AKS
GET {{BASE_URL}}/docs/vcluster/integrations/pod-identity/aks-workload-identity/
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/third-party-integrations/pod-identity/aks-workload-identity"

# Test 3b: Verify AKS workload identity destination exists (with trailing slash)
GET {{BASE_URL}}/docs/vcluster/third-party-integrations/pod-identity/aks-workload-identity/
HTTP 200

# Test 4: Deploy environment - GKE (next stays in next)
GET {{BASE_URL}}/docs/vcluster/next/deploy/environment/gke/
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/next/deploy/control-plane/container/environment/gke"

# Test 5: Deploy topologies - High Availability (unversioned)
GET {{BASE_URL}}/docs/vcluster/deploy/topologies/high-availability/
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/deploy/control-plane/container/high-availability"

# Test 6: Deploy basics
GET {{BASE_URL}}/docs/vcluster/deploy/basics/
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/deploy/control-plane/container/basics"

# Test 6b: Verify deploy basics destination exists (with trailing slash)
GET {{BASE_URL}}/docs/vcluster/deploy/control-plane/container/basics/
HTTP 200

# Test 7: Learn how to - debug logging (unversioned)
GET {{BASE_URL}}/docs/vcluster/learn-how-to/enable-debug-logging/
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/learn-how-to/control-plane/container/enable-debug-logging"

# Test 7b: Verify debug logging destination exists (with trailing slash)
GET {{BASE_URL}}/docs/vcluster/learn-how-to/control-plane/container/enable-debug-logging/
HTTP 200

# Test 8: Integrations - metrics server
GET {{BASE_URL}}/docs/vcluster/integrations/metrics/metrics-server/
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/third-party-integrations/metrics/metrics-server"

# Test 9: Deploy security - FIPS (skipping - 0.26.0 paths don't redirect)

# Test 10: Control node IP visibility (special case - goes to worker-nodes, next stays in next)
GET {{BASE_URL}}/docs/vcluster/next/learn-how-to/control-node-ip-visibility/
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/next/learn-how-to/worker-nodes/host-nodes/control-node-ip-visibility"