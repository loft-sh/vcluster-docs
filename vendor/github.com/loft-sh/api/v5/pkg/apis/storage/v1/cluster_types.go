package v1

import (
	agentstoragev1 "github.com/loft-sh/agentapi/v5/pkg/apis/loft/storage/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

const (
	LoftCluster = "loft-cluster"

	EmbeddedPostgresAppliedHashAnnotation                              = "loft.sh/platform-db-applied-hash"
	EmbeddedPostgresDeployed              agentstoragev1.ConditionType = "EmbeddedPostgresDeployed"
	EmbeddedPostgresAvailable             agentstoragev1.ConditionType = "EmbeddedPostgresAvailable"

	BuildKitServiceAddress                                         = "loft.sh/buildkit-service-address"
	BuildKitLastAppliedHashAnnotation                              = "loft.sh/buildkit-last-applied-hash"
	BuildKitDeployed                  agentstoragev1.ConditionType = "BuildKitDeployed"
	BuildKitAvailable                 agentstoragev1.ConditionType = "BuildKitAvailable"

	// HTTPRouteRequestMirrorSupported is True when at least one GatewayClass in the
	// managed cluster supports HTTPRoute request mirroring, either by advertising the
	// HTTPRouteRequestMirror feature in status.supportedFeatures or by matching the
	// agent's allowlisted spec.controllerName set.
	HTTPRouteRequestMirrorSupported agentstoragev1.ConditionType = "HTTPRouteRequestMirrorSupported"
)

// +genclient
// +genclient:nonNamespaced
// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

// Cluster holds the cluster information
// +k8s:openapi-gen=true
type Cluster struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   ClusterSpec   `json:"spec,omitempty"`
	Status ClusterStatus `json:"status,omitempty"`
}

func (a *Cluster) GetOwner() *UserOrTeam {
	return a.Spec.Owner
}

func (a *Cluster) SetOwner(userOrTeam *UserOrTeam) {
	a.Spec.Owner = userOrTeam
}

func (a *Cluster) GetAccess() []Access {
	return a.Spec.Access
}

func (a *Cluster) SetAccess(access []Access) {
	a.Spec.Access = access
}

func (a *Cluster) GetConditions() agentstoragev1.Conditions {
	return a.Status.Conditions
}

func (a *Cluster) SetConditions(conditions agentstoragev1.Conditions) {
	a.Status.Conditions = conditions
}

// ClusterSpec holds the cluster specification
type ClusterSpec struct {
	// If specified this name is displayed in the UI instead of the metadata name
	// +optional
	DisplayName string `json:"displayName,omitempty"`

	// Description describes a cluster access object
	// +optional
	Description string `json:"description,omitempty"`

	// Owner holds the owner of this object
	// +optional
	Owner *UserOrTeam `json:"owner,omitempty"`

	// Holds a reference to a secret that holds the kube config to access this cluster
	// +optional
	Config SecretRef `json:"config,omitempty"`

	// Local specifies if it is the local cluster that should be connected, when this is specified, config is optional
	// +optional
	Local bool `json:"local,omitempty"`

	// NetworkPeer specifies if the cluster is connected via tailscale, when this is specified, config is optional
	// +optional
	NetworkPeer bool `json:"networkPeer,omitempty"`

	// The namespace where the cluster components will be installed in
	// +optional
	ManagementNamespace string `json:"managementNamespace,omitempty"`

	// If unusable is true, no spaces or tenant clusters can be scheduled on this cluster.
	// +optional
	Unusable bool `json:"unusable,omitempty"`

	// Access holds the access rights for users and teams
	// +optional
	Access []Access `json:"access,omitempty"`

	// ArgoCD holds the cluster's argo cd configuration
	// +optional
	ArgoCD *ArgoCD `json:"argoCD,omitempty"`
}

type ArgoCD struct {
	// Enabled defines if argo cd is enabled
	// +optional
	Enabled bool `json:"enabled,omitempty"`

	// Connector specifies the argo cd connector name
	// +optional
	Connector string `json:"connector,omitempty"`

	// Cluster holds settings for the cluster entry that is registered in argo cd
	// +optional
	Cluster *ArgoCDClusterSpec `json:"cluster,omitempty"`
}

// ArgoCDClusterSpec holds settings for the cluster entry that is registered in argo cd.
type ArgoCDClusterSpec struct {
	// Metadata is set on the argo cd cluster, so an ApplicationSet can select it.
	// The platform's own loft.sh/cluster label wins over it.
	// On Akuity, a key removed here stays on the cluster until it is removed in Akuity.
	// +optional
	Metadata TemplateMetadata `json:"metadata,omitempty"`
}

type AllowedClusterAccountTemplate struct {
	// Name is the name of a cluster account template
	// +optional
	Name string `json:"name,omitempty"`
}

// ClusterStatus holds the user status
type ClusterStatus struct {
	// +optional
	Phase ClusterStatusPhase `json:"phase,omitempty"`

	// +optional
	Reason string `json:"reason,omitempty"`

	// +optional
	Message string `json:"message,omitempty"`

	// Conditions holds several conditions the cluster might be in
	// +optional
	Conditions agentstoragev1.Conditions `json:"conditions,omitempty"`
}

// ClusterStatusPhase describes the phase of a cluster
type ClusterStatusPhase string

// These are the valid admin account types
const (
	ClusterStatusPhaseInitializing ClusterStatusPhase = ""
	ClusterStatusPhaseInitialized  ClusterStatusPhase = "Initialized"
	ClusterStatusPhaseFailed       ClusterStatusPhase = "Failed"
)

// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

// ClusterList contains a list of Cluster
type ClusterList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []Cluster `json:"items"`
}

func init() {
	SchemeBuilder.Register(&Cluster{}, &ClusterList{})
}

type HelmChart struct {
	// Metadata provides information about a chart
	// +optional
	Metadata Metadata `json:"metadata,omitempty"`

	// Versions holds all chart versions
	// +optional
	Versions []string `json:"versions,omitempty"`

	// Repository is the repository name of this chart
	// +optional
	Repository HelmChartRepository `json:"repository,omitempty"`
}

type HelmChartRepository struct {
	// Name is the name of the repository
	// +optional
	Name string `json:"name,omitempty"`

	// URL is the repository url
	// +optional
	URL string `json:"url,omitempty"`

	// Username of the repository
	// +optional
	Username string `json:"username,omitempty"`

	// Password of the repository
	// +optional
	Password string `json:"password,omitempty"`

	// Insecure specifies if the chart should be retrieved without TLS
	// verification
	// +optional
	Insecure bool `json:"insecure,omitempty"`
}
