package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	"github.com/ghodss/yaml"
	"github.com/invopop/jsonschema"
	"github.com/loft-sh/vcluster-docs/hack/platform/util"
)

// we only generate paths we actually need
var paths = []string{
	"sync/fromHost/customResources",
	"sync/toHost/customResources",
	"policies/podSecurityStandard",
	"telemetry",
	"sync/toHost/volumeSnapshots",
	"sync/toHost/storageClasses",
	"sync/toHost/persistentVolumes",
	"sync/toHost/persistentVolumeClaims",
	"sync/toHost/services",
	"sync/toHost/networkPolicies",
	"sync/toHost/ingresses",
	"sync/toHost/endpoints",
	"sync/toHost/endpointSlices",
	"sync/toHost/secrets",
	"sync/toHost/pods",
	"sync/toHost/configMaps",
	"sync/toHost/serviceAccounts",
	"sync/toHost/priorityClasses",
	"sync/toHost/podDisruptionBudgets",
	"sync/toHost",
	"sync/fromHost/storageClasses",
	"sync/fromHost/nodes",
	"sync/fromHost/ingressClasses",
	"sync/fromHost/events",
	"sync/fromHost/runtimeClasses",
	"sync/fromHost/priorityClasses",
	"sync/fromHost/csiStorageCapacities",
	"sync/fromHost/csiNodes",
	"sync/fromHost/csiDrivers",
	"sync/fromHost/configMaps",
	"sync/fromHost/secrets",
	"sync/fromHost",
	"sync",
	"rbac",
	"privateNodes",
	"privateNodes/autoUpgrade",
	"privateNodes/autoNodes",
	"privateNodes/vpn",
	"deletion",
	"deploy",
	"policies/resourceQuota",
	"policies/networkPolicy",
	"policies/limitRange",
	"policies/centralAdmission",
	"policies",
	"platform",
	"plugins",
	"integrations/kubeVirt",
	"integrations/metricsServer",
	"integrations/externalSecrets",
	"integrations/certManager",
	"integrations/istio",
	"integrations/netris",
	"integrations",
	"networking/resolveDNS",
	"networking/replicateServices",
	"networking/advanced",
	"networking",
	"exportKubeConfig",
	"experimental/virtualClusterKubeConfig",
	"experimental/syncSettings",
	"experimental/isolatedControlPlane",
	"experimental/genericSync",
	"experimental/deploy",
	"experimental/denyProxyRequests",
	"experimental/proxy",
	"experimental/docker",
	"experimental",
	"snapshots",
	"sleep",
	"controlPlane/advanced/workloadServiceAccount",
	"controlPlane/advanced/virtualScheduler",
	"controlPlane/advanced/serviceAccount",
	"controlPlane/advanced/headlessService",
	"controlPlane/advanced/globalMetadata",
	"controlPlane/advanced/defaultImageRegistry",
	"controlPlane/advanced/kubeVip",
	"controlPlane/advanced",
	"controlPlane/statefulSet",
	"controlPlane/service",
	"controlPlane/serviceMonitor",
	"controlPlane/ingress",
	"controlPlane/proxy",
	"controlPlane/hostPathMapper",
	"controlPlane/distro/k8s",
	"controlPlane/distro/k3s",
	"controlPlane/distro/k0s",
	"controlPlane/distro",
	"controlPlane/coredns",
	"controlPlane/backingStore/etcd/embedded",
	"controlPlane/backingStore/etcd/deploy",
	"controlPlane/backingStore/database/embedded",
	"controlPlane/backingStore/database/external",
	"controlPlane/backingStore",
	"controlPlane/standalone",
	"controlPlane/standalone/joinNode",
	"controlPlane",
	"logging",
}

func main() {
	if len(os.Args) != 3 {
		panic("expected to be called with vcluster jsonschema directory as first argument and output dir as a second, e.g.\n" +
			"go run hack/vcluster/partials/main.go configsrc/v0.21/ vcluster_versioned_docs/version-0.21.0/_partials/config")
	}

	util.DefaultRequire = false
	versionDir := os.Args[1]
	jsonSchemaPath := filepath.Join(versionDir, "vcluster.schema.json")
	defaultValues := filepath.Join(versionDir, "default_values.yaml")
	values, err := os.ReadFile(defaultValues)
	if err != nil {
		panic(fmt.Errorf("failed to read default values from %q: %w", defaultValues, err))
	}
	outputDir := os.Args[2]
	defaults := map[string]interface{}{}
	err = yaml.Unmarshal(values, &defaults)
	if err != nil {
		panic(fmt.Errorf("failed to parse default values YAML: %w", err))
	}
	schema := &jsonschema.Schema{}
	schemaBytes, err := os.ReadFile(jsonSchemaPath)
	if err != nil {
		panic(fmt.Errorf("failed to read schema file %q: %w", jsonSchemaPath, err))
	}
	err = json.Unmarshal(schemaBytes, schema)
	if err != nil {
		panic(fmt.Errorf("failed to parse schema JSON: %w", err))
	}
	for _, path := range paths {
		err := util.GenerateFromPathWithError(schema, outputDir, path, defaults)
		if err != nil {
			fmt.Printf("Warning: Skipping path %q: %v\n", path, err)
			continue
		}
	}
}