package v1

import (
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

// SlurmInstanceAccounting holds Slurm accounting data (jobs and the resources
// allocated to them) retrieved from the tenant cluster's accounting REST API.
// +subresource-request
type SlurmInstanceAccounting struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Status SlurmInstanceAccountingStatus `json:"status,omitempty"`
}

// SlurmInstanceAccountingStatus is the observed accounting state.
type SlurmInstanceAccountingStatus struct {
	// Enabled is true when accounting is enabled on the SlurmInstance. When false,
	// Jobs is empty and the caller should render a disabled state.
	Enabled bool `json:"enabled"`

	// Message optionally describes why accounting data could not be retrieved even
	// though accounting is enabled (for example the accounting REST endpoints are
	// not being served yet).
	// +optional
	Message string `json:"message,omitempty"`

	// Jobs are the accounting records for jobs in the requested time window.
	// +optional
	Jobs []SlurmJob `json:"jobs,omitempty"`
}

// SlurmJob is a single accounting record for a Slurm job.
type SlurmJob struct {
	// ID is the Slurm job id.
	ID int64 `json:"id"`
	// Name is the job name.
	// +optional
	Name string `json:"name,omitempty"`
	// User is the user that submitted the job.
	// +optional
	User string `json:"user,omitempty"`
	// Account is the accounting account the job was charged to.
	// +optional
	Account string `json:"account,omitempty"`
	// Partition is the partition the job ran in.
	// +optional
	Partition string `json:"partition,omitempty"`
	// State is the job state (for example COMPLETED, FAILED, RUNNING).
	// +optional
	State string `json:"state,omitempty"`
	// SubmitTime is when the job was submitted.
	// +optional
	SubmitTime *metav1.Time `json:"submitTime,omitempty"`
	// StartTime is when the job started running.
	// +optional
	StartTime *metav1.Time `json:"startTime,omitempty"`
	// EndTime is when the job finished.
	// +optional
	EndTime *metav1.Time `json:"endTime,omitempty"`
	// Elapsed is the job run time in seconds.
	// +optional
	Elapsed int64 `json:"elapsed,omitempty"`
	// Nodes is the node allocation string (for example slinky-[0-1]).
	// +optional
	Nodes string `json:"nodes,omitempty"`
	// AllocatedResources are the trackable resources (TRES) allocated to the job,
	// including cpu, mem and gres/gpu.
	// +optional
	AllocatedResources []SlurmTRES `json:"allocatedResources,omitempty"`
}

// SlurmTRES is a single trackable resource entry, faithful to slurmrestd's TRES
// representation. For a GPU allocation Type is "gres" and Name is "gpu".
type SlurmTRES struct {
	// Type is the TRES type (for example cpu, mem, node, gres).
	Type string `json:"type"`
	// Name is the TRES name, set for named TRES such as gres/gpu (Name "gpu").
	// +optional
	Name string `json:"name,omitempty"`
	// Count is the allocated amount.
	Count int64 `json:"count"`
}
