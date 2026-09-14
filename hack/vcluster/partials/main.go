package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"path"
	"path/filepath"
	"sort"
	"strings"

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
	// NOTE: do not add a pathExtras key for a field that exists only in newer
	// vCluster versions. The receiver runs this generator against the schema of
	// the exact released version it is processing, which includes still-maintained
	// older release lines (for example 0.34.x). validateExtras requires every key
	// here to resolve in that schema, so a version-conditional key hard-fails the
	// docs-sync run for every release predating the field. The `paths` slice below
	// tolerates a missing path (warn + skip); pathExtras does not. The
	// `sync/toHost/gatewayApi` entry was removed for this reason: the field landed
	// in vCluster 0.35.0, but 0.34.x patch releases still trigger regeneration.
	// See DEVOPS-1075. gatewayApi remains in `paths` so 0.35.0+ still generate it.
}

// we only generate paths we actually need
var paths = []string{
	"sync/fromHost/customResources",
	"sync/toHost/customResources",
	"policies/podSecurityStandard",
	"telemetry",
	"sync/toHost/volumeSnapshots",
	"sync/toHost/volumeSnapshotContents",
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
	"sync/toHost/resourceClaims",
	"sync/toHost/resourceClaimTemplates",
	"sync/toHost",
	"sync/fromHost/storageClasses",
	"sync/fromHost/volumeSnapshotClasses",
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
	"sync/fromHost/deviceClasses",
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

	renderPaths := append([]string(nil), paths...)
	// sleepMode predates the sleep configuration and still exists in older
	// schemas (for example, v0.30). Generate it when present without emitting a
	// permanent missing-path warning for current schemas where sleep replaces it.
	if _, err := util.RenderFromPath(schema, "sleepMode", defaults); err == nil {
		renderPaths = append(renderPaths, "sleepMode")
	}

	written := map[string]bool{}
	for _, p := range renderPaths {
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
		written[filePath] = true
	}

	checkOrphans(outputDir, written)
}

// legacyOrphanTargets grandfathers generated partials that were already stale
// before this check existed. The exemptions are scoped to the exact versioned
// output directories that currently contain the files; using only the relative
// file names would also hide new orphans in current and future documentation.
// Remove a target once its backport PR deletes or renames all three files.
var legacyOrphanTargets = map[string]map[string]bool{
	"vcluster_versioned_docs/version-0.35.0/_partials/config": legacyOrphanFiles(),
	"vcluster_versioned_docs/version-0.36.0/_partials/config": legacyOrphanFiles(),
	"vcluster_versioned_docs/version-0.37.0/_partials/config": legacyOrphanFiles(),
}

func legacyOrphanFiles() map[string]bool {
	return map[string]bool{
		"sleepMode.mdx":                          true,
		"sync/toHost/resourceclaims.mdx":         true,
		"sync/toHost/resourceclaimtemplates.mdx": true,
	}
}

func isLegacyOrphan(outputDir, relativePath string) bool {
	target := filepath.ToSlash(filepath.Clean(outputDir))
	for legacyTarget, files := range legacyOrphanTargets {
		if target == legacyTarget || strings.HasSuffix(target, "/"+legacyTarget) {
			return files[filepath.ToSlash(relativePath)]
		}
	}
	return false
}

// checkOrphans panics if outputDir contains a generated partial that this run
// did not (re)write, unless it's a known legacy orphan (see
// legacyOrphanTargets).
// That situation means a `paths` entry was removed, or - the failure mode
// DOC-1739 found - a file was hand-authored (or a `paths` entry silently
// dropped, e.g. by a schema rename) and never wired back into the `paths`
// list, so routine regeneration has been quietly unable to keep it in sync.
// `Warning: Skipping path` only fires for entries that ARE in `paths` but
// fail to resolve against the schema; it can't detect an entry that was
// never added, so this walk is the only thing that catches that case.
func checkOrphans(outputDir string, written map[string]bool) {
	var orphans []string
	err := filepath.WalkDir(outputDir, func(filePath string, d os.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if d.IsDir() || filepath.Ext(filePath) != ".mdx" {
			return nil
		}
		if written[filePath] {
			return nil
		}
		rel, relErr := filepath.Rel(outputDir, filePath)
		if relErr == nil && isLegacyOrphan(outputDir, rel) {
			fmt.Printf("Warning: %q is a known pre-existing orphan (DOC-1739); not failing the build\n", filePath)
			return nil
		}
		orphans = append(orphans, filePath)
		return nil
	})
	if err != nil {
		panic(fmt.Errorf("failed to walk %q for orphaned partials: %w", outputDir, err))
	}
	if len(orphans) == 0 {
		return
	}
	sort.Strings(orphans)
	panic(fmt.Sprintf(
		"%d generated partial(s) exist under %q but were not (re)written this run: %v\n"+
			"Either add the corresponding schema path to `paths` in hack/vcluster/partials/main.go, "+
			"or delete the stale file if it's no longer needed.",
		len(orphans), outputDir, orphans,
	))
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
