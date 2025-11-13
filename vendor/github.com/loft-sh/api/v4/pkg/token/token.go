package token

import (
	storagev1 "github.com/loft-sh/api/v4/pkg/apis/storage/v1"
	"k8s.io/apiserver/pkg/authentication/user"
)

type PrivateClaims struct {
	Loft Loft `json:"loft.sh,omitempty"`
}

const LoftAdminKind = "LoftAdmin"

type Loft struct {
	// The UID of the user or team that this token is for
	UID string `json:"uid,omitempty"`
	// The kubernetes name of the user or team that this token is signed for
	Name string `json:"name,omitempty"`
	// The kind of the entity (either User or Team)
	Kind string `json:"kind,omitempty"`
	// The generation of the token
	Gen int64 `json:"gen,omitempty"`
	// The requester name of the token
	OriginalRequester *user.DefaultInfo `json:"originalRequester,omitempty"`
	// The scope of the token if there is any
	Scope *storagev1.AccessKeyScope `json:"scope,omitempty"`
}
