package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"path"
	"path/filepath"
	"sort"

	"github.com/ghodss/yaml"
	"github.com/invopop/jsonschema"
	"github.com/loft-sh/vcluster-docs/hack/platform/util"
)

// Extras carries hand-authored prose that wraps the auto-generated MDX
// for a schema path. Authors include leading/trailing newlines as needed
// to keep MDX admonitions parseable; both fields are inserted as-is.
type Extras struct {
	Before string
	After  string
}

// pathExtras is the single source of truth for hand-authored prose that
// must survive every regeneration. Keys are schema paths (matching the
// `paths` slice). Adding a key whose schema path no longer resolves is
// a build-break (see validateExtras below) — that converts the silent
// drop-on-rename failure mode of the previous "edit the MDX in place"
// workflow into a loud, traceable error.
var pathExtras = map[string]Extras{
	"controlPlane/distro": {
		After: "\n\n:::tip K3s to K8s migration\n" +
			"Starting with vCluster 0.25.0, migration from K3s to K8s is supported. " +
			"For more details, see the [K3s to K8s migration guide](/docs/vcluster/manage/upgrade/distro-migration).\n" +
			":::\n",
	},
	"controlPlane/standalone/joinNode": {
		Before: "\n:::warning Security consideration\n" +
			"When `joinNode.enabled` is `true`, the control-plane node also runs kubelet as a worker.\n" +
			"Tenant workloads scheduled onto this node share the machine with the vCluster control-plane\n" +
			"process and its platform credentials. A tenant with sufficient privileges (such as `hostPID`,\n" +
			"hostPath volumes, or `nodes/proxy` access) can read the platform access key from the process\n" +
			"environment.\n\n" +
			"For production deployments, keep the control-plane node dedicated by setting\n" +
			"`joinNode.enabled: false` and use separate worker nodes for tenant workloads.\n" +
			":::\n\n",
	},
}

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
	"sync/toHost/gatewayApi",
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
	"sync/fromHost/gatewayClasses",
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
	// Two flags + back-compat positional args. Receiver passes the flag
	// form; humans regenerating locally usually still type positional.
	var sourcePath, targetFolder string
	flag.StringVar(&sourcePath, "source-path", "", "Checkout root containing vcluster.schema.json and default_values.yaml. Set by the release-dispatch receiver.")
	flag.StringVar(&targetFolder, "target-folder", "", "Output folder for generated partials, e.g. vcluster_versioned_docs/version-0.34.0/_partials/config. Set by the release-dispatch receiver.")
	flag.Parse()

	versionDir := sourcePath
	outputDir := targetFolder
	if positional := flag.Args(); len(positional) >= 2 {
		if versionDir == "" {
			versionDir = positional[0]
		}
		if outputDir == "" {
			outputDir = positional[1]
		}
	}
	if versionDir == "" || outputDir == "" {
		panic("expected --source-path and --target-folder, e.g.\n" +
			"go run hack/vcluster/partials/main.go --source-path configsrc/v0.21/ --target-folder vcluster_versioned_docs/version-0.21.0/_partials/config\n" +
			"(positional args still accepted for back-compat)")
	}

	util.DefaultRequire = false
	jsonSchemaPath := filepath.Join(versionDir, "vcluster.schema.json")
	defaultValues := filepath.Join(versionDir, "default_values.yaml")
	values, err := os.ReadFile(defaultValues)
	if err != nil {
		panic(fmt.Errorf("failed to read default values from %q: %w", defaultValues, err))
	}
	defaults := map[string]interface{}{}
	if err := yaml.Unmarshal(values, &defaults); err != nil {
		panic(fmt.Errorf("failed to parse default values YAML: %w", err))
	}
	schema := &jsonschema.Schema{}
	schemaBytes, err := os.ReadFile(jsonSchemaPath)
	if err != nil {
		panic(fmt.Errorf("failed to read schema file %q: %w", jsonSchemaPath, err))
	}
	if err := json.Unmarshal(schemaBytes, schema); err != nil {
		panic(fmt.Errorf("failed to parse schema JSON: %w", err))
	}

	// Load-bearing: every pathExtras key must resolve in the live schema
	// before any output is written. A schema rename or removal that left a
	// stale Extras key would otherwise silently orphan the prose; this
	// converts that into a build-break with the full list of dangling keys.
	validateExtras(schema, defaults)

	for _, p := range paths {
		content, err := util.RenderFromPath(schema, p, defaults)
		if err != nil {
			fmt.Printf("Warning: Skipping path %q: %v\n", p, err)
			continue
		}

		extras := pathExtras[p]
		final := extras.Before + content + extras.After

		filePath := path.Join(outputDir, p) + ".mdx"
		_ = os.MkdirAll(path.Dir(filePath), 0o777)
		if err := os.WriteFile(filePath, []byte(final), os.ModePerm); err != nil {
			panic(fmt.Errorf("failed to write %q: %w", filePath, err))
		}
	}
}

// validateExtras panics if any pathExtras key fails to resolve in the
// schema. Output names every dangling key so a schema rename surfaces the
// full migration scope on the first run, not one error at a time.
func validateExtras(schema *jsonschema.Schema, defaults map[string]interface{}) {
	var dangling []string
	for key := range pathExtras {
		if _, err := util.RenderFromPath(schema, key, defaults); err != nil {
			dangling = append(dangling, key)
		}
	}
	if len(dangling) == 0 {
		return
	}
	sort.Strings(dangling)
	panic(fmt.Sprintf(
		"preserve key drift: %d Extras path(s) do not resolve in schema: %v\n"+
			"Either update pathExtras to match the new schema layout, or remove the stale entries.",
		len(dangling), dangling,
	))
}
