package v1

import (
	"strings"

	agentstoragev1 "github.com/loft-sh/agentapi/v5/pkg/apis/loft/storage/v1"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

const (
	ConditionTypeVaultIntegration agentstoragev1.ConditionType = "VaultIntegration"

	ConditionReasonVaultIntegrationError = "VaultIntegrationError"

	VaultLastAppliedHashAnnotation                = "loft.sh/vault-integration-last-applied-hash"
	VaultPreviousClusterAnnotation                = "loft.sh/vault-integration-previous-cluster"
	VaultPreviousNamespaceAnnotation              = "loft.sh/vault-integration-previous-namespace"
	VaultPreviousVirtualClusterInstanceAnnotation = "loft.sh/vault-integration-previous-virtualclusterinstance"
)

const (
	ConditionTypeNamespaceTemplateSynced agentstoragev1.ConditionType = "NamespaceTemplateSynced"
)

// +genclient
// +genclient:nonNamespaced
// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

// Project
// +k8s:openapi-gen=true
type Project struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   ProjectSpec   `json:"spec,omitempty"`
	Status ProjectStatus `json:"status,omitempty"`
}

func (a *Project) GetConditions() agentstoragev1.Conditions {
	return a.Status.Conditions
}

func (a *Project) SetConditions(conditions agentstoragev1.Conditions) {
	a.Status.Conditions = conditions
}

func (a *Project) GetOwner() *UserOrTeam {
	return a.Spec.Owner
}

func (a *Project) SetOwner(userOrTeam *UserOrTeam) {
	a.Spec.Owner = userOrTeam
}

func (a *Project) GetAccess() []Access {
	return a.Spec.Access
}

func (a *Project) SetAccess(access []Access) {
	a.Spec.Access = access
}

type ProjectSpec struct {
	// DisplayName is the name that should be displayed in the UI
	// +optional
	DisplayName string `json:"displayName,omitempty"`

	// Description describes an app
	// +optional
	Description string `json:"description,omitempty"`

	// Owner holds the owner of this object
	// +optional
	Owner *UserOrTeam `json:"owner,omitempty"`

	// Quotas define the quotas inside the project
	// +optional
	Quotas Quotas `json:"quotas,omitempty"`

	// AllowedClusters are target clusters that are allowed to target with
	// environments.
	// +optional
	AllowedClusters []AllowedCluster `json:"allowedClusters,omitempty"`

	// AllowedRunners are target runners that are allowed to target with
	// +optional
	AllowedRunners []AllowedRunner `json:"allowedRunners,omitempty"`

	// AllowedTemplates are the templates that are allowed to use in this
	// project.
	// +optional
	AllowedTemplates []AllowedTemplate `json:"allowedTemplates,omitempty"`

	// AllowedNodeTypes restricts which NodeTypes can be referenced by
	// NodeClaims in this project. An entry can be an exact name
	// ("aws.large") or a provider wildcard ("aws.*"). If unset (nil),
	// all NodeTypes are allowed; an empty list disallows all NodeTypes.
	// +optional
	AllowedNodeTypes []AllowedNodeType `json:"allowedNodeTypes" jsonschema:"nullable"`

	// AllowedNodeProfiles restricts which NodeProfiles can be referenced
	// by NodeClaims and joinscript requests in this project. An entry can
	// be an exact name ("platform.gpu-training") or an owner wildcard
	// ("platform.*"). If unset (nil), all NodeProfiles are allowed; an
	// empty list disallows all NodeProfiles.
	// +optional
	AllowedNodeProfiles []AllowedNodeProfile `json:"allowedNodeProfiles" jsonschema:"nullable"`

	// AllowedNetworkEnvironments restricts which NetworkEnvironments can be
	// referenced by NodeClaims in this project. NetworkEnvironments are cluster
	// scoped and shared across projects, so this is how a project is scoped to a
	// subset of them. Each entry is an exact NetworkEnvironment name ("shared-vpc").
	// If unset (nil), all NetworkEnvironments are allowed; an empty list disallows
	// all NetworkEnvironments.
	// +optional
	AllowedNetworkEnvironments []AllowedNetworkEnvironment `json:"allowedNetworkEnvironments" jsonschema:"nullable"`

	// DefaultNodeProfile is the default NodeProfile applied to nodes in this
	// project when none is selected explicitly. It is overridden by the
	// vCluster-level privateNodes.defaultProfile and by per-node/per-pool
	// selection, and is validated against allowedNodeProfiles.
	// +optional
	DefaultNodeProfile string `json:"defaultNodeProfile,omitempty"`

	// RequireTemplate configures if a template is required for instance creation.
	// +optional
	RequireTemplate RequireTemplate `json:"requireTemplate,omitempty"`

	// RequirePreset configures if a preset is required for instance creation.
	// +optional
	RequirePreset RequirePreset `json:"requirePreset,omitempty"`

	// Members are the users and teams that are part of this project
	// +optional
	Members []Member `json:"members,omitempty"`

	// Access holds the access rights for users and teams
	// +optional
	Access []Access `json:"access,omitempty"`

	// NamespaceTemplate defines metadata that should be applied to the project's namespace on creation.
	// This is useful for environments where admission controllers (e.g., Kyverno)
	// require specific labels or annotations on namespaces.
	// +optional
	NamespaceTemplate *ProjectNamespaceTemplate `json:"namespaceTemplate,omitempty"`

	// NamespacePattern specifies template patterns to use for creating each space or tenant cluster's namespace
	// +optional
	NamespacePattern *NamespacePattern `json:"namespacePattern,omitempty"`

	// VaultIntegration holds information about Vault Integration
	// +optional
	VaultIntegration *VaultIntegrationSpec `json:"vault,omitempty"`
}

type RequireTemplate struct {
	// If true, all users within the project will be allowed to create a new instance without a template.
	// By default, only admins are allowed to create a new instance without a template.
	// +optional
	Disabled bool `json:"disabled,omitempty"`
}

type RequirePreset struct {
	// If true, all users within the project will not be allowed to create a new instance without a preset.
	// By default, all users are allowed to create a new instance without a preset.
	// +optional
	Enabled bool `json:"disabled,omitempty"`
}

// ProjectNamespaceTemplate defines metadata to apply to the auto-created project namespace.
type ProjectNamespaceTemplate struct {
	// The namespace metadata
	// +optional
	TemplateMetadata `json:"metadata,omitempty"`
}

type NamespacePattern struct {
	// Space holds the namespace pattern to use for space instances
	// +optional
	Space string `json:"space,omitempty"`

	// VirtualCluster holds the namespace pattern to use for tenant cluster instances
	// +optional
	VirtualCluster string `json:"virtualCluster,omitempty"`
}

type Quotas struct {
	// Project holds the quotas for the whole project
	// +optional
	Project map[string]string `json:"project,omitempty"`

	// User holds the quotas per user / team
	User map[string]string `json:"user,omitempty"`
}

var (
	SpaceTemplateKind          = "SpaceTemplate"
	VirtualClusterTemplateKind = "VirtualClusterTemplate"
	StackTemplateKind          = "StackTemplate"
)

type AllowedTemplate struct {
	// Kind of the template that is allowed. Supports DevPodWorkspaceTemplate, VirtualClusterTemplate, SpaceTemplate and StackTemplate.
	// +optional
	Kind string `json:"kind,omitempty"`

	// Group of the template that is allowed. Currently only supports storage.loft.sh
	// +optional
	Group string `json:"group,omitempty"`

	// Name of the template
	// +optional
	Name string `json:"name,omitempty"`

	// IsDefault specifies if the template should be used as a default
	// +optional
	IsDefault bool `json:"isDefault,omitempty"`
}

type Member struct {
	// Kind is the kind of the member. Currently either User or Team
	// +optional
	Kind string `json:"kind,omitempty"`

	// Group of the member. Currently only supports storage.loft.sh
	// +optional
	Group string `json:"group,omitempty"`

	// Name of the member
	// +optional
	Name string `json:"name,omitempty"`

	// ClusterRole is the assigned role for the above member
	ClusterRole string `json:"clusterRole"`
}

type AllowedRunner struct {
	// Name is the name of the runner that is allowed to create an environment in.
	// +optional
	Name string `json:"name,omitempty"`
}

type AllowedCluster struct {
	// Name is the name of the cluster that is allowed to create an environment in.
	// +optional
	Name string `json:"name,omitempty"`
}

type AllowedNodeType struct {
	// Name of the NodeType, or "<provider>.*" to allow all NodeTypes
	// of the given provider.
	// +optional
	Name string `json:"name,omitempty"`
}

// AllowedNodeProfile restricts which NodeProfile a project's consumers may
// reference. The Name field is either an exact profile name or an
// "<owner>.*" wildcard, matching the same semantics as AllowedNodeType.
type AllowedNodeProfile struct {
	// Name of the NodeProfile, or "<owner>.*" to allow all NodeProfiles
	// with the given owner prefix.
	// +optional
	Name string `json:"name,omitempty"`
}

// AllowedNetworkEnvironment restricts which NetworkEnvironment a project's
// consumers may reference.
//
// Unlike AllowedNodeType and AllowedNodeProfile, there is no "<provider>.*" wildcard
// here: those resources are named "<provider>.<name>", whereas NetworkEnvironment names
// are rejected at creation if they contain a dot, so no such prefix could ever match.
type AllowedNetworkEnvironment struct {
	// Name is the exact name of the NetworkEnvironment.
	// +optional
	Name string `json:"name,omitempty"`
}

// IsNodeProfileAllowed reports whether name is permitted by AllowedNodeProfiles. A nil
// list means all NodeProfiles are allowed; an empty list means none are.
func (s ProjectSpec) IsNodeProfileAllowed(name string) bool {
	if s.AllowedNodeProfiles == nil {
		return true
	}
	for _, a := range s.AllowedNodeProfiles {
		if a.Name == name {
			return true
		}
		if strings.HasSuffix(a.Name, ".*") && strings.HasPrefix(name, strings.TrimSuffix(a.Name, "*")) {
			return true
		}
	}
	return false
}

type ProjectStatus struct {
	// Quotas holds the quota status
	// +optional
	Quotas *QuotaStatus `json:"quotas,omitempty"`

	// Conditions holds several conditions the project might be in
	// +optional
	Conditions agentstoragev1.Conditions `json:"conditions,omitempty"`
}

type QuotaStatus struct {
	// Project is the quota status for the whole project
	// +optional
	Project *QuotaStatusProject `json:"project,omitempty"`

	// User is the quota status for each user / team. An example status
	// could look like this:
	// status:
	//   quotas:
	//     user:
	//       limit:
	//         pods: "10"
	//         spaces: "5"
	//       users:
	//         admin:
	//           used:
	//             spaces: "3"  # <- calculated in our apiserver
	//             pods: "8"    # <- the sum calculated from clusters
	//       clusters:
	//         cluster-1:  # <- populated by agent from cluster-1
	//           users:
	//             admin:
	//               pods: "3"
	//         cluster-2:
	//           users:
	//             admin:
	//               pods: "5"
	// +optional
	User *QuotaStatusUser `json:"user,omitempty"`
}

type QuotaStatusUser struct {
	// Limit is the amount limited per user / team
	// +optional
	Limit map[string]string `json:"limit,omitempty"`

	// Used is the used amount per user / team
	// +optional
	Used QuotaStatusUserUsed `json:"used,omitempty"`

	// Clusters holds the used amount per cluster. Maps cluster name to used resources
	// +optional
	Clusters map[string]QuotaStatusUserUsed `json:"clusters,omitempty"`
}

type QuotaStatusUserUsed struct {
	// Users is a mapping of users to used resources
	// +optional
	Users map[string]map[string]string `json:"users,omitempty"`

	// Teams is a mapping of teams to used resources
	// +optional
	Teams map[string]map[string]string `json:"teams,omitempty"`
}

type QuotaStatusProject struct {
	// Limit is the amount limited, copied from spec.quotas.project
	// +optional
	Limit map[string]string `json:"limit,omitempty"`

	// Used is the amount currently used across all clusters
	// +optional
	Used map[string]string `json:"used,omitempty"`

	// Clusters holds the used amount per cluster. Maps cluster name to used resources
	// +optional
	Clusters map[string]QuotaStatusProjectCluster `json:"clusters,omitempty"`
}

type QuotaStatusProjectCluster struct {
	// Used is the amount currently used. Maps resource name, such as pods, to their
	// used amount.
	// +optional
	Used map[string]string `json:"used,omitempty"`
}

type VaultIntegrationSpec struct {
	// Enabled indicates if the Vault Integration is enabled for the project -- this knob only
	// enables the syncing of secrets to or from Vault, but does not setup Kubernetes authentication
	// methods or Kubernetes secrets engines for vclusters.
	// +optional
	Enabled bool `json:"enabled,omitempty"`

	// Address defines the address of the Vault instance to use for this project.
	// Will default to the `VAULT_ADDR` environment variable if not provided.
	// +optional
	Address string `json:"address,omitempty"`

	// SkipTLSVerify defines if TLS verification should be skipped when connecting to Vault.
	// +optional
	SkipTLSVerify bool `json:"skipTLSVerify,omitempty"`

	// Namespace defines the namespace to use when storing secrets in Vault.
	// +optional
	Namespace string `json:"namespace,omitempty"`

	// Auth defines the authentication method to use for this project.
	// +optional
	Auth *VaultAuthSpec `json:"auth,omitempty"`

	// SyncInterval defines the interval at which to sync secrets from Vault.
	// Defaults to `1m.`
	// See https://pkg.go.dev/time#ParseDuration for supported formats.
	// +optional
	SyncInterval string `json:"syncInterval,omitempty"`
}

type VaultAuthSpec struct {
	// Token defines the token to use for authentication.
	// +optional
	Token *string `json:"token,omitempty"`

	// TokenSecretRef defines the Kubernetes secret to use for token authentication.
	// Will be used if `token` is not provided.
	//
	// Secret data should contain the `token` key.
	// +optional
	TokenSecretRef *corev1.SecretKeySelector `json:"tokenSecretRef,omitempty"`
}

// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

// ProjectList contains a list of Project objects
type ProjectList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []Project `json:"items"`
}

func init() {
	SchemeBuilder.Register(&Project{}, &ProjectList{})
}
