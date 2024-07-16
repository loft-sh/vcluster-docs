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
	"external/platform/autoSleep",
	"external/platform/autoDelete",
}

type Config struct {
	External struct {
		Platform struct {
			// APIKey defines where to find the platform access key and host. By default, vCluster will search in the following locations in this precedence:
			// * platform.api.accessKey
			// * environment variable called LICENSE
			// * secret specified under external.platform.apiKey.secretName
			// * secret called "vcluster-platform-api-key" in the vCluster namespace
			APIKey config.PlatformAPIKey `json:"apiKey,omitempty"`

			// AutoSleep holds configuration for automatic sleep and wakeup
			// +optional
			AutoSleep *AutoSleep `json:"autoSleep,omitempty"`

			// AutoDelete holds configuration for automatic delete
			// +optional
			AutoDelete *AutoDelete `json:"autoDelete,omitempty"`
		} `json:"platform"`
		//*config.PlatformConfig `json:"platform"`
	} `json:"external"`
}

type AutoSleep struct {
	// AfterInactivity specifies after how many seconds of inactivity the virtual cluster should sleep
	// +optional
	AfterInactivity int64 `json:"afterInactivity,omitempty"`

	// Schedule specifies scheduled virtual cluster sleep in Cron format, see https://en.wikipedia.org/wiki/Cron.
	// Note: timezone defined in the schedule string will be ignored. Use ".Timezone" field instead.
	// +optional
	Schedule string `json:"schedule,omitempty"`

	// Timezone specifies time zone used for scheduled virtual cluster operations. Defaults to UTC.
	// Accepts the same format as time.LoadLocation() in Go (https://pkg.go.dev/time#LoadLocation).
	// The value should be a location name corresponding to a file in the IANA Time Zone database, such as "America/New_York".
	// +optional
	Timezone string `json:"timezone,omitempty"`

	// AutoSleep holds configuration for automatic wakeup
	// +optional
	AutoWakeup *AutoWakeup `json:"autoWakeup,omitempty"`
}

type AutoWakeup struct {
	// Schedule specifies scheduled wakeup from sleep in Cron format, see https://en.wikipedia.org/wiki/Cron.
	// Note: timezone defined in the schedule string will be ignored. The timezone for the autoSleep schedule will be
	// used
	// +optional
	Schedule string `json:"schedule,omitempty"`
}

type AutoDelete struct {
	// AfterInactivity specifies after how many seconds of inactivity the virtual cluster be deleted
	// +optional
	AfterInactivity int64 `json:"afterInactivity,omitempty"`
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
