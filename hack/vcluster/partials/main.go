package main

import (
	"os"

	"github.com/loft-sh/vcluster-config/config"
	"github.com/loft-sh/vcluster-docs/hack/platform/util"
)

const OutDir = "vcluster/_partials/config"

// we only generate paths we actually need
var configPaths = []string{
	"telemetry",
	"sync/toHost/volumeSnapshots",
	"sync/toHost/storageClasses",
	"sync/toHost/persistentVolumes",
	"sync/toHost/persistentVolumeClaims",
	"sync/toHost/services",
	"sync/toHost/networkPolicies",
	"sync/toHost/ingresses",
	"sync/toHost/endpoints",
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
	"sync/fromHost/csiStorageCapacities",
	"sync/fromHost/csiNodes",
	"sync/fromHost/csiDrivers",
	"sync/fromHost",
	"sync",
	"rbac",
	"policies/resourceQuota",
	"policies/podSecurityStandard",
	"policies/networkPolicy",
	"policies/limitRange",
	"policies/centralAdmission",
	"policies",
	"plugins",
	"integrations/metricsServer",
	"integrations",
	"networking/resolveDNS",
	"networking/replicateServices",
	"networking/advanced",
	"networking",
	"exportKubeConfig",
	"experimental/virtualClusterKubeConfig",
	"experimental/syncSettings",
	"experimental/multiNamespaceMode",
	"experimental/isolatedControlPlane",
	"experimental/genericSync",
	"experimental/deploy",
	"experimental/denyProxyRequests",
	"experimental",
	"external",
	"controlPlane/advanced/workloadServiceAccount",
	"controlPlane/advanced/virtualScheduler",
	"controlPlane/advanced/serviceAccount",
	"controlPlane/advanced/headlessService",
	"controlPlane/advanced/globalMetadata",
	"controlPlane/advanced/defaultImageRegistry",
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
	"controlPlane",
}

var platformConfigPaths = []string{
	"external/platform/apiKey",
}

type Config struct {
	External struct {
		*config.PlatformConfig `json:"platform"`
	} `json:"external"`
}

func main() {
	_ = os.RemoveAll(OutDir)
	util.DefaultRequire = false

	schemaPaths := map[*[]string]any{
		&configPaths:         &config.Config{},
		&platformConfigPaths: &Config{},
	}

	for paths, schema := range schemaPaths {
		for _, path := range *paths {
			util.GenerateFromPath(util.GenerateSchema(schema), OutDir, path)
		}
	}
}
