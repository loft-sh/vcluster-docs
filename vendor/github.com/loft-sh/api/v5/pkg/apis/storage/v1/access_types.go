package v1

// Access grants users and teams verbs on the object that holds it
type Access struct {
	// Name is an optional name that is used for this access rule
	// +optional
	Name string `json:"name,omitempty"`

	// Verbs is a list of Verbs that apply to ALL the ResourceKinds and AttributeRestrictions contained in this rule. VerbAll represents all kinds.
	Verbs []string `json:"verbs"`

	// Subresources defines the sub resources that are allowed by this access rule
	// +optional
	Subresources []string `json:"subresources,omitempty"`

	// Users specifies which users should be able to access this object with the aforementioned verbs
	// +optional
	Users []string `json:"users,omitempty"`

	// Teams specifies which teams should be able to access this object with the aforementioned verbs
	// +optional
	Teams []string `json:"teams,omitempty"`
}
