package util

import (
	"os"
	"path/filepath"
	"reflect"
	"testing"

	"github.com/invopop/jsonschema"
)

// normalizeRequiredFixture mirrors the loft-sh/api shapes that motivated
// normalizeRequired. The two slices deliberately omit `,omitempty` even though
// they document `+optional`, because nil and an explicitly empty list mean
// different things: nil allows everything, an empty list allows nothing. Adding
// `,omitempty` would serialize an empty list as absent and so turn "allow none"
// into "allow all", which is why the fix has to happen in the generator.
type normalizeRequiredFixture struct {
	DisplayName      string   `json:"displayName"`
	AllowedNodeTypes []string `json:"allowedNodeTypes" jsonschema:"nullable"`
	AllowedProfiles  []string `json:"allowedProfiles"`
	Owner            string   `json:"owner,omitempty"`
}

// seedFixtureComments installs comments for fixture's fields into the package
// comment map, keyed the way the reflector looks them up, and restores the
// previous map afterwards. Seeding directly keeps the test off the vendor
// extraction path, which needs a `vendor` directory relative to the working
// directory. Unknown field names fail loudly so a rename cannot quietly turn
// these assertions into no-ops.
func seedFixtureComments(t *testing.T, fixture interface{}, comments map[string]string) {
	t.Helper()

	fixtureType := reflect.TypeOf(fixture)
	for fixtureType.Kind() == reflect.Ptr {
		fixtureType = fixtureType.Elem()
	}

	seeded := map[string]string{}
	for field, comment := range comments {
		if _, ok := fixtureType.FieldByName(field); !ok {
			t.Fatalf("%s has no field %s", fixtureType.Name(), field)
		}
		seeded[fixtureType.PkgPath()+"."+fixtureType.Name()+"."+field] = comment
	}

	previous := commentMap
	commentMap = seeded
	t.Cleanup(func() { commentMap = previous })
}

func TestWriteGeneratedFileUsesNonExecutablePermissions(t *testing.T) {
	for _, test := range []struct {
		name     string
		existing bool
	}{
		{name: "new file"},
		{name: "existing executable file", existing: true},
	} {
		t.Run(test.name, func(t *testing.T) {
			filePath := filepath.Join(t.TempDir(), "nested", "reference.mdx")
			if test.existing {
				if err := os.MkdirAll(filepath.Dir(filePath), 0o755); err != nil {
					t.Fatal(err)
				}
				if err := os.WriteFile(filePath, []byte("old"), 0o755); err != nil {
					t.Fatal(err)
				}
			}

			if err := writeGeneratedFile(filePath, []byte("generated")); err != nil {
				t.Fatal(err)
			}

			info, err := os.Stat(filePath)
			if err != nil {
				t.Fatal(err)
			}
			if got, want := info.Mode().Perm(), os.FileMode(0o644); got != want {
				t.Fatalf("permissions = %04o, want %04o", got, want)
			}
		})
	}
}

func TestGenerateSchemaNormalizesRequiredFromOptionalMarkers(t *testing.T) {
	seedFixtureComments(t, &normalizeRequiredFixture{}, map[string]string{
		"DisplayName":      "DisplayName is the display name shown in the UI.",
		"AllowedNodeTypes": "If unset (nil), all NodeTypes are allowed; an empty list disallows all NodeTypes.\n+optional",
		"AllowedProfiles":  "AllowedProfiles holds the profiles this project may use.\n+optional",
		"Owner":            "Owner describes the owner of the project.\n+optional",
	})

	required := requiredSet(generateSchema(&normalizeRequiredFixture{}))

	for _, name := range []string{"allowedNodeTypes", "allowedProfiles"} {
		if required[name] {
			t.Errorf("%s is required, want optional: it documents +optional and omits ,omitempty deliberately", name)
		}
	}
	if !required["displayName"] {
		t.Error("displayName is optional, want required: it documents no +optional marker and omits ,omitempty")
	}
	if required["owner"] {
		t.Error("owner is required, want optional: its json tag carries ,omitempty")
	}
}

func TestGenerateSchemaNormalizesNullableOneOfDescription(t *testing.T) {
	seedFixtureComments(t, &normalizeRequiredFixture{}, map[string]string{
		"AllowedNodeTypes": "If unset (nil), all NodeTypes are allowed; an empty list disallows all NodeTypes.\n+optional",
	})

	schema := generateSchema(&normalizeRequiredFixture{})

	// Guard the shape this test exists for: a `jsonschema:"nullable"` field is
	// reflected as a oneOf of the real type plus null, which leaves the property
	// itself undocumented and moves the marker onto the non-null member. If the
	// reflector ever stops doing that, the assertion below would pass for the
	// wrong reason.
	property, ok := schema.Properties.Get("allowedNodeTypes")
	if !ok {
		t.Fatal("allowedNodeTypes is missing from the reflected properties")
	}
	if property.Description != "" {
		t.Fatalf("allowedNodeTypes carries its own description %q, so this no longer covers the nullable oneOf shape", property.Description)
	}
	if len(property.OneOf) == 0 {
		t.Fatal("allowedNodeTypes has no oneOf members, so this no longer covers the nullable oneOf shape")
	}

	documented := false
	for _, member := range property.OneOf {
		if member.Type != "null" && member.Description != "" {
			documented = true
		}
	}
	if !documented {
		t.Fatal("no non-null oneOf member carries the description")
	}

	if requiredSet(schema)["allowedNodeTypes"] {
		t.Error("allowedNodeTypes is required, want optional: the +optional marker on its non-null oneOf member was not honored")
	}
}

func TestNormalizeRequiredClearsFullyOptionalObjects(t *testing.T) {
	seedFixtureComments(t, &normalizeRequiredFixture{}, map[string]string{
		"DisplayName":      "DisplayName is the display name shown in the UI.\n+optional",
		"AllowedNodeTypes": "AllowedNodeTypes holds the allowed node types.\n+optional",
		"AllowedProfiles":  "AllowedProfiles holds the allowed profiles.\n+optional",
	})

	// An object with nothing left to require must drop `required` entirely rather
	// than emit an empty array.
	if got := generateSchema(&normalizeRequiredFixture{}).Required; got != nil {
		t.Errorf("required = %v, want nil", got)
	}
}

func TestNormalizeRequiredToleratesUnusualSchemas(t *testing.T) {
	t.Run("nil schema", func(t *testing.T) {
		normalizeRequired(nil)
	})

	t.Run("required without properties", func(t *testing.T) {
		schema := &jsonschema.Schema{Type: "object", Required: []string{"name"}}

		normalizeRequired(schema)

		if len(schema.Required) != 1 || schema.Required[0] != "name" {
			t.Errorf("required = %v, want [name]: requiredness cannot be disproved without a property to read", schema.Required)
		}
	})

	t.Run("required naming an absent property", func(t *testing.T) {
		seedFixtureComments(t, &normalizeRequiredFixture{}, map[string]string{
			"DisplayName": "DisplayName is the display name shown in the UI.",
		})
		schema := generateSchema(&normalizeRequiredFixture{})
		schema.Required = append(schema.Required, "absent")

		normalizeRequired(schema)

		if !requiredSet(schema)["absent"] {
			t.Error("absent was dropped from required, want kept: an unresolvable name says nothing about optionality")
		}
	})

	t.Run("self referential schema", func(t *testing.T) {
		schema := &jsonschema.Schema{Type: "object"}
		schema.Not = schema
		schema.AllOf = []*jsonschema.Schema{schema}

		normalizeRequired(schema)
	})
}
