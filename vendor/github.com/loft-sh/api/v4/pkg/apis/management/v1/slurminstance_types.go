package v1

import (
	storagev1 "github.com/loft-sh/api/v4/pkg/apis/storage/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// +genclient
// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

// SlurmInstance represents a Slurm cluster running inside a tenant cluster.
// +k8s:openapi-gen=true
// +resource:path=slurminstances,rest=SlurmInstanceREST,statusRest=SlurmInstanceStatusREST
// +subresource:request=SlurmInstanceAccounting,path=accounting,kind=SlurmInstanceAccounting,rest=SlurmInstanceAccountingREST
type SlurmInstance struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   SlurmInstanceSpec   `json:"spec,omitempty"`
	Status SlurmInstanceStatus `json:"status,omitempty"`
}

func (a *SlurmInstance) GetOwner() *storagev1.UserOrTeam {
	return a.Spec.Owner
}

func (a *SlurmInstance) SetOwner(userOrTeam *storagev1.UserOrTeam) {
	a.Spec.Owner = userOrTeam
}

func (a *SlurmInstance) GetAccess() []storagev1.Access {
	return a.Spec.Access
}

func (a *SlurmInstance) SetAccess(access []storagev1.Access) {
	a.Spec.Access = access
}

// SlurmInstanceSpec defines the desired state of a SlurmInstance.
type SlurmInstanceSpec struct {
	storagev1.SlurmInstanceSpec `json:",inline"`
}

// SlurmInstanceStatus defines the observed state of a SlurmInstance.
type SlurmInstanceStatus struct {
	storagev1.SlurmInstanceStatus `json:",inline"`

	// CanUse specifies if the requester can use the instance
	// +optional
	CanUse bool `json:"canUse,omitempty"`

	// CanUpdate specifies if the requester can update the instance
	// +optional
	CanUpdate bool `json:"canUpdate,omitempty"`
}
