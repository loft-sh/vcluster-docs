// Api versions allow the api contract for a resource to be changed while keeping
// backward compatibility by support multiple concurrent versions
// of the same resource

// +k8s:deepcopy-gen=package,register
// +k8s:defaulter-gen=TypeMeta
// +groupName=application.argoproj.io
package v1alpha1 // import "github.com/loft-sh/external-types/argoproj/argo-cd/v2/pkg/apis/application/v1alpha1"
