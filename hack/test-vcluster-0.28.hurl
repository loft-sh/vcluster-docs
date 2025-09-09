# vCluster 0.28 Comprehensive Redirect Tests
# Generated from netlify.toml redirects
# Usage: hurl --variable BASE_URL=https://deploy-preview-1137--vcluster-docs-site.netlify.app test-vcluster-0.28-comprehensive.hurl

# =====================================================
# Legacy paths redirects (lines 27-78)
# =====================================================

# Test 1: Legacy architecture paths
GET {{BASE_URL}}/docs/architecture/overview
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/introduction/architecture/"

# Test 2: CLI paths redirect to vcluster.com
GET {{BASE_URL}}/docs/cli/vcluster_create
HTTP 301
[Asserts]
header "Location" contains "https://www.vcluster.com/docs/vcluster/cli/vcluster_create"

# Test 3: Deploying vclusters legacy
GET {{BASE_URL}}/docs/deploying-vclusters/basics
HTTP 301
[Asserts]
header "Location" contains "https://www.vcluster.com/docs/vcluster/deploy/control-plane/container/basics/basics"

# Test 4: Get started redirect
GET {{BASE_URL}}/docs/get-started
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/introduction/what-are-virtual-clusters"

# Test 5: Getting started wildcard
GET {{BASE_URL}}/docs/getting-started/setup
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/"

# Test 6: Networking redirect
GET {{BASE_URL}}/docs/networking/ingress
HTTP 301
[Asserts]
header "Location" contains "https://www.vcluster.com/docs/vcluster/configure/vcluster-yaml/networking/ingress"

# Test 7: Security redirect
GET {{BASE_URL}}/docs/security/overview
HTTP 301
[Asserts]
header "Location" contains "https://www.vcluster.com/docs/platform/understand/what-are-virtual-clusters#robust-security-and-isolation"

# Test 8: Syncer redirect
GET {{BASE_URL}}/docs/syncer/overview
HTTP 301
[Asserts]
header "Location" contains "https://www.vcluster.com/docs/vcluster/0.20.0/introduction/architecture#syncer"

# Test 9: Using vclusters redirect
GET {{BASE_URL}}/docs/using-vclusters/kube-context
HTTP 301
[Asserts]
header "Location" contains "https://www.vcluster.com/docs/vcluster/introduction/what-are-virtual-clusters#common-use-cases"

# Test 10: Config reference redirect
GET {{BASE_URL}}/docs/config-reference/
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/vcluster-yaml/"

# Test 11: Storage redirect
GET {{BASE_URL}}/docs/storage/
HTTP 301
[Asserts]
header "Location" contains "https://www.vcluster.com/docs/vcluster/category/storage"

# Test 12: What are virtual clusters redirect
GET {{BASE_URL}}/docs/what-are-virtual-clusters/
HTTP 301
[Asserts]
header "Location" contains "https://www.vcluster.com/docs/vcluster/introduction/what-are-virtual-clusters"

# Test 13: Help & tutorials redirect
GET {{BASE_URL}}/docs/help&tutorials/faq
HTTP 301
[Asserts]
header "Location" contains "https://www.vcluster.com/docs/vcluster/"

# =====================================================
# Platform UI links for vCluster (lines 341-484)
# =====================================================

# Test 14: Backup restore migration
GET {{BASE_URL}}/docs/platform-ui-link/vcluster/backup-restore-migration
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/manage/backup-restore#migrate-and-override-vcluster-configuration-options-to-create-a-new-vcluster"

# Test 15: Supported migration options
GET {{BASE_URL}}/docs/platform-ui-link/vcluster/supported-migration-options
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/manage/backup-restore#supported-migration-options"

# Test 16: Control plane
GET {{BASE_URL}}/docs/platform-ui-link/vcluster/control-plane
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/category/components"

# Test 17: Backing store
GET {{BASE_URL}}/docs/platform-ui-link/vcluster/backing-store
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/configure/vcluster-yaml/control-plane/components/backing-store/"

# Test 18: Control plane distro
GET {{BASE_URL}}/docs/platform-ui-link/vcluster/control-plane-distro
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/configure/vcluster-yaml/control-plane/components/distro/"

# Test 19: Resource quota
GET {{BASE_URL}}/docs/platform-ui-link/vcluster/resource-quota
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/configure/vcluster-yaml/policies/resource-quota"

# Test 20: 0.20 migration
GET {{BASE_URL}}/docs/platform-ui-link/vcluster/0-20-migration
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/reference/migrations/0-20-migration"

# Test 21: Sync from host
GET {{BASE_URL}}/docs/platform-ui-link/vcluster/sync-from-host
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/configure/vcluster-yaml/sync/from-host/"

# Test 22: Nodes
GET {{BASE_URL}}/docs/platform-ui-link/vcluster/nodes
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/configure/vcluster-yaml/sync/from-host/nodes"

# Test 23: Sync to host
GET {{BASE_URL}}/docs/platform-ui-link/vcluster/sync-to-host
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/configure/vcluster-yaml/sync/to-host/"

# Test 24: Hybrid scheduling
GET {{BASE_URL}}/docs/platform-ui-link/vcluster/hybrid-scheduling
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/configure/vcluster-yaml/sync/to-host/core/pods/hybrid-scheduling"

# Test 25: Private nodes
GET {{BASE_URL}}/docs/platform-ui-link/vcluster/private-nodes
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/deploy/worker-nodes/private-nodes"

# Test 26: Private nodes node requirements
GET {{BASE_URL}}/docs/platform-ui-link/vcluster/private-nodes-node-requirements
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/deploy/worker-nodes/private-nodes/node-requirements"

# Test 27: Private nodes auto nodes
GET {{BASE_URL}}/docs/platform-ui-link/vcluster/private-nodes-auto-nodes
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/configure/vcluster-yaml/private-nodes/auto-nodes"

# Test 28: Private nodes auto nodes requirements
GET {{BASE_URL}}/docs/platform-ui-link/vcluster/private-nodes-auto-nodes-requirements
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/configure/vcluster-yaml/private-nodes/auto-nodes/#requirements"

# Test 29: vcluster.yaml
GET {{BASE_URL}}/docs/platform-ui-link/vcluster/vcluster-yaml
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/configure/vcluster-yaml/"

# =====================================================
# Deploy redirects (lines 487-494)
# =====================================================

# Test 30: Deploy control-plane wildcard
GET {{BASE_URL}}/docs/deploy/control-plane/basics
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/deploy/control-plane/basics"

# Test 31: Deploy wildcard
GET {{BASE_URL}}/docs/deploy/basics
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/deploy/basics"

# =====================================================
# vCluster 0.28.0 redirect (lines 497-501)
# =====================================================

# Test 32: vCluster 0.28.0 wildcard redirect
GET {{BASE_URL}}/docs/vcluster/0.28.0/introduction/what-are-virtual-clusters
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/introduction/what-are-virtual-clusters"

# =====================================================
# vCluster v0.27 restructure redirects (lines 514-658)
# =====================================================

# Test 33: Capture pprof vcluster (0.26.0 just adds trailing slash)
GET {{BASE_URL}}/docs/vcluster/0.26.0/learn-how-to/capture-pprof-vcluster
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/0.26.0/learn-how-to/capture-pprof-vcluster/"

# Test 34: Check vcluster (0.26.0 just adds trailing slash)
GET {{BASE_URL}}/docs/vcluster/0.26.0/learn-how-to/check-vcluster
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/0.26.0/learn-how-to/check-vcluster/"

# Test 35: Configure custom coredns (0.26.0 just adds trailing slash)
GET {{BASE_URL}}/docs/vcluster/0.26.0/learn-how-to/configure-custom-coredns
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/0.26.0/learn-how-to/configure-custom-coredns/"

# Test 36: Enable debug logging (current)
GET {{BASE_URL}}/docs/vcluster/learn-how-to/enable-debug-logging
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/learn-how-to/control-plane/container/enable-debug-logging"

# Test 37: Enable debug logging (next)
GET {{BASE_URL}}/docs/vcluster/next/learn-how-to/enable-debug-logging
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/next/learn-how-to/control-plane/container/enable-debug-logging"

# Test 38: Override alpine sidecar (0.26.0 just adds trailing slash)
GET {{BASE_URL}}/docs/vcluster/0.26.0/learn-how-to/override-alpine-sidecar
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/0.26.0/learn-how-to/override-alpine-sidecar/"

# Test 39: Retrieve vcluster config (0.26.0 just adds trailing slash)
GET {{BASE_URL}}/docs/vcluster/0.26.0/learn-how-to/retrieve-vcluster-config
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/0.26.0/learn-how-to/retrieve-vcluster-config/"

# Test 40: Configure kai scheduler (next with trailing slash)
GET {{BASE_URL}}/docs/vcluster/next/learn-how-to/configure-kai-scheduler/
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/next/third-party-integrations/scheduler/kai-scheduler/"

# Test 41: Configure kai scheduler (next)
GET {{BASE_URL}}/docs/vcluster/next/learn-how-to/configure-kai-scheduler
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/next/third-party-integrations/scheduler/kai-scheduler"

# Test 42: Configure kai scheduler (current with trailing slash)
GET {{BASE_URL}}/docs/vcluster/learn-how-to/configure-kai-scheduler/
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/third-party-integrations/scheduler/kai-scheduler/"

# Test 43: Configure kai scheduler (current)
GET {{BASE_URL}}/docs/vcluster/learn-how-to/configure-kai-scheduler
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/third-party-integrations/scheduler/kai-scheduler"

# Test 44: Configure kai scheduler (0.26.0 just adds trailing slash)
GET {{BASE_URL}}/docs/vcluster/0.26.0/learn-how-to/configure-kai-scheduler
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/0.26.0/learn-how-to/configure-kai-scheduler/"

# Test 45: Control node IP visibility (next)
GET {{BASE_URL}}/docs/vcluster/next/learn-how-to/control-node-ip-visibility
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/next/learn-how-to/worker-nodes/host-nodes/control-node-ip-visibility"

# Test 46: Control node IP visibility (current)
GET {{BASE_URL}}/docs/vcluster/learn-how-to/control-node-ip-visibility
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/learn-how-to/worker-nodes/host-nodes/control-node-ip-visibility"

# Test 47: Control node IP visibility (0.26.0 just adds trailing slash)
GET {{BASE_URL}}/docs/vcluster/0.26.0/learn-how-to/control-node-ip-visibility
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/0.26.0/learn-how-to/control-node-ip-visibility/"

# Test 48: Integrations wildcard (next)
GET {{BASE_URL}}/docs/vcluster/next/integrations/metrics/prometheus
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/next/third-party-integrations/metrics/prometheus"

# Test 49: Integrations wildcard (current)
GET {{BASE_URL}}/docs/vcluster/integrations/pod-identity/eks-pod-identity
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/third-party-integrations/pod-identity/eks-pod-identity"

# Test 50: Integrations pod-identity (0.26.0 just adds trailing slash)
GET {{BASE_URL}}/docs/vcluster/0.26.0/integrations/pod-identity/eks-pod-identity
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/0.26.0/integrations/pod-identity/eks-pod-identity/"

# Test 51: Integrations external-secrets (0.26.0 redirects to third-party)
GET {{BASE_URL}}/docs/vcluster/0.26.0/integrations/external-secrets/overview
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/0.26.0/third-party-integrations/external-secrets/overview"

# Test 52: Integrations github-actions (0.26.0 redirects to third-party)
GET {{BASE_URL}}/docs/vcluster/0.26.0/integrations/github-actions/setup
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/0.26.0/third-party-integrations/github-actions/setup"

# Test 53: Integrations metrics (0.26.0 redirects to third-party)
GET {{BASE_URL}}/docs/vcluster/0.26.0/integrations/metrics/prometheus
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/0.26.0/third-party-integrations/metrics/prometheus"

# Test 54: Integrations generic path (0.26.0 redirects to third-party)
GET {{BASE_URL}}/docs/vcluster/0.26.0/integrations/overview
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/0.26.0/third-party-integrations/overview"

# Test 55: Deploy environment wildcard (next)
GET {{BASE_URL}}/docs/vcluster/next/deploy/environment/eks
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/next/deploy/control-plane/container/environment/eks"

# Test 56: Deploy environment wildcard (current)
GET {{BASE_URL}}/docs/vcluster/deploy/environment/gke
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/deploy/control-plane/container/environment/gke"

# Test 57: Deploy topologies wildcard (next)
GET {{BASE_URL}}/docs/vcluster/next/deploy/topologies/multi-namespace-mode
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/next/deploy/control-plane/container/multi-namespace-mode"

# Test 58: Deploy topologies wildcard (current)
GET {{BASE_URL}}/docs/vcluster/deploy/topologies/single-namespace-mode
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/deploy/control-plane/container/single-namespace-mode"

# Test 59: Deploy basics (next)
GET {{BASE_URL}}/docs/vcluster/next/deploy/basics
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/next/deploy/control-plane/container/basics"

# Test 60: Deploy basics (current)
GET {{BASE_URL}}/docs/vcluster/deploy/basics
HTTP 301
[Asserts]
header "Location" contains "/docs/vcluster/deploy/control-plane/container/basics"

# =====================================================
# Verification tests - pages that should load
# =====================================================

# Test 61: vCluster main page should load
GET {{BASE_URL}}/docs/vcluster/
HTTP 200
[Asserts]
body contains "Virtual Clusters"

# Test 62: vCluster 0.27.0 should still be accessible
GET {{BASE_URL}}/docs/vcluster/0.27.0/
HTTP 200
[Asserts]
body contains "Virtual Clusters"

# Test 63: vCluster 0.26.0 should still be accessible
GET {{BASE_URL}}/docs/vcluster/0.26.0/
HTTP 200
[Asserts]
body contains "Virtual Clusters"

# Test 64: vCluster CLI pages should load
GET {{BASE_URL}}/docs/vcluster/cli/vcluster_create/
HTTP 200
[Asserts]
body contains "vcluster create"

# Test 65: vCluster CLI certs page should load
GET {{BASE_URL}}/docs/vcluster/cli/vcluster_certs/
HTTP 200
[Asserts]
body contains "vcluster certs"

# Test 66: vCluster CLI node page should load
GET {{BASE_URL}}/docs/vcluster/cli/vcluster_node/
HTTP 200
[Asserts]
body contains "vcluster node"

# Test 67: vCluster CLI registry page should load
GET {{BASE_URL}}/docs/vcluster/cli/vcluster_registry/
HTTP 200
[Asserts]
body contains "vcluster registry"

# Test 68: vCluster CLI token page should load
GET {{BASE_URL}}/docs/vcluster/cli/vcluster_token/
HTTP 200
[Asserts]
body contains "vcluster token"

# Test 69: Documentation home page should load
GET {{BASE_URL}}/docs/
HTTP 200
[Asserts]
body contains "vCluster 0.28"
body contains "Platform 4.4"

# Test 70: vCluster main page should show v0.28 as stable
GET {{BASE_URL}}/docs/vcluster/
HTTP 200
[Asserts]
body contains "v0.28 Stable"