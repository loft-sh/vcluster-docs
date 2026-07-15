package v1

import (
	storagev1 "github.com/loft-sh/api/v4/pkg/apis/storage/v1"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

const (
	LoftExternalCredential            = "loft.sh/external-credential"
	LoftExternalCredentialDisplayName = "loft.sh/external-credential-display-name"
	LoftExternalCredentialDescription = "loft.sh/external-credential-description"
	LoftExternalCredentialUsernameKey = "loft.sh/external-credential-username-key"
	LoftExternalCredentialPasswordKey = "loft.sh/external-credential-password-key"
	LoftExternalCredentialAccess      = "loft.sh/external-credential-access"
)

// +genclient
// +genclient:noStatus
// +genclient:onlyVerbs=get,list,update
// +genclient:method=GetCredentials,verb=get,subresource=credentials,result=github.com/loft-sh/api/v4/pkg/apis/management/v1.ExternalCredentialCredentials
// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

// ExternalCredential projects a labeled Secret without exposing its credential value.
// +k8s:openapi-gen=true
// +resource:path=externalcredentials,rest=ExternalCredentialREST
// +subresource:request=ExternalCredentialCredentials,path=credentials,kind=ExternalCredentialCredentials,rest=ExternalCredentialCredentialsREST
type ExternalCredential struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   ExternalCredentialSpec   `json:"spec,omitempty"`
	Status ExternalCredentialStatus `json:"status,omitempty"`
}

type ExternalCredentialSpec struct {
	// +optional
	DisplayName string `json:"displayName,omitempty"`
	// +optional
	Description string `json:"description,omitempty"`
	// +optional
	Username *ExternalCredentialSecretSelector `json:"username,omitempty"`
	Password ExternalCredentialSecretSelector  `json:"password"`
	// +optional
	Access []storagev1.Access `json:"access,omitempty"`
}

type ExternalCredentialSecretSelector struct {
	SecretKeyRef corev1.SecretKeySelector `json:"secretKeyRef"`
}

type ExternalCredentialStatus struct {
	Available bool `json:"available"`
	// +optional
	Username string `json:"username,omitempty"`
}

func (a *ExternalCredential) GetOwner() *storagev1.UserOrTeam { return nil }
func (a *ExternalCredential) SetOwner(*storagev1.UserOrTeam)  {}
func (a *ExternalCredential) GetAccess() []storagev1.Access   { return a.Spec.Access }
func (a *ExternalCredential) SetAccess(access []storagev1.Access) {
	a.Spec.Access = access
}

// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

// +subresource-request
type ExternalCredentialCredentials struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	// +optional
	Username string `json:"username,omitempty"`
	Password string `json:"password"`
}
