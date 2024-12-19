package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	orderedmap "github.com/wk8/go-ordered-map/v2"

	"github.com/ghodss/yaml"
	"github.com/invopop/jsonschema"
	"github.com/loft-sh/vcluster-docs/hack/platform/util"
)

var paths []string // we will discover all paths by traversing the schema tree

func main() {
	if len(os.Args) != 3 {
		panic("expected to be called with vcluster jsonschema directory as first argument and output dir as a second, e.g.\n" +
			"go run hack/vcluster/partials/main.go configsrc/v0.21/ vcluster_versioned_docs/version-0.21.0/_partials/config")
	}

	util.DefaultRequire = false
	versionDir := os.Args[1]
	jsonSchemaPath := filepath.Join(versionDir, "vcluster.schema.json")
	defaultValues := filepath.Join(versionDir, "default_values.yaml")
	values, err := os.ReadFile(defaultValues)
	if err != nil {
		panic(fmt.Errorf("failed to read default values from %q: %w", defaultValues, err))
	}
	outputDir := os.Args[2]
	_ = os.RemoveAll(outputDir)
	defaults := map[string]interface{}{}
	err = yaml.Unmarshal(values, &defaults)
	if err != nil {
		panic(fmt.Errorf("failed to parse default values YAML: %w", err))
	}
	schema := &jsonschema.Schema{}
	schemaBytes, err := os.ReadFile(jsonSchemaPath)
	if err != nil {
		panic(fmt.Errorf("failed to read schema file %q: %w", jsonSchemaPath, err))
	}
	err = json.Unmarshal(schemaBytes, schema)
	if err != nil {
		panic(fmt.Errorf("failed to parse schema JSON: %w", err))
	}

	for pair := schema.Properties.Oldest(); pair != nil; pair = pair.Next() {
		walkTree(pair.Value, schema, pair.Key, "")
	}

	for _, path := range paths {
		util.GenerateFromPath(schema, outputDir, strings.TrimPrefix(path, "/"), defaults)
	}
}

func walkTree(node, parent *jsonschema.Schema, name, parentName string) bool {
	if node == nil {
		return true
	}

	children := getChildren(node, parent)
	if children == nil {
		return true
	}
	parentName = fmt.Sprintf("%s/%s", parentName, name)
	paths = append(paths, parentName)

	for childNode := children.Oldest(); childNode != nil; childNode = childNode.Next() {
		if walkTree(childNode.Value, parent, childNode.Key, parentName) {
			continue
		}
	}
	return true
}

func getChildren(node *jsonschema.Schema, parentSchema *jsonschema.Schema) *orderedmap.OrderedMap[string, *jsonschema.Schema] {
	if node == nil {
		return nil
	}
	if node.Ref != "" {
		refSplit := strings.Split(node.Ref, "/")
		fieldSchema, ok := parentSchema.Definitions[refSplit[len(refSplit)-1]]
		if !ok {
			panic(fmt.Errorf("schema definition %q not found in reference %q", refSplit[len(refSplit)-1], node.Ref))
		}
		return fieldSchema.Properties
	}
	return nil
}
