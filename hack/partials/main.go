package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"log/slog"
	"math"
	"os"
	"path"
	"slices"
	"strings"

	"github.com/gertd/go-pluralize"
	"github.com/invopop/jsonschema"
)

var pluralizeClient = pluralize.NewClient()

func main() {
	l := slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo}))
	flagSet := flag.NewFlagSet("generate", flag.ExitOnError)
	schemaPath := flagSet.String("schema-path", "", "path to schema file")
	outDir := flagSet.String("out-dir", "", "output directory for generated files")
	debug := flagSet.Bool("debug", false, "enable debug mode")

	err := flagSet.Parse(os.Args[1:])
	if err != nil {
		log.Fatal(err)
		return
	}
	if *debug {
		l = slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelDebug}))
	}
	if *outDir == "" {
		log.Fatal("output directory is required")
		return
	}
	if *schemaPath == "" {
		log.Fatal("schema path is required")
		return
	}

	l.Debug("resolved options", "schema-path", *schemaPath, "out-dir", *outDir)

	schemaBytes, err := os.ReadFile(*schemaPath)
	if err != nil {
		log.Fatal(fmt.Errorf("reading json schema file: %w", err))
		return
	}

	schema := jsonschema.Schema{}
	err = json.Unmarshal(schemaBytes, &schema)
	if err != nil {
		log.Fatal(fmt.Errorf("unmarshalling json schema: %w", err))
		return
	}

	// Is it beautiful? No. Does it work? Probably.

	for pair := schema.Properties.Oldest(); pair != nil; pair = pair.Next() {
		def := pair.Value
		if def == nil {
			continue
		}
		*def = *pair.Value
		name := pair.Key
		fileName := fmt.Sprintf("%s/%s.mdx", *outDir, name)

		// some jsonschema massaging to top level properties include themselves :upsidedown:
		// sets properties to a ref to its own definition
		properties := jsonschema.NewProperties()
		_, _ = properties.Set(pair.Key, def)
		def.Properties = properties

		content := buildContent("", *outDir, def, schema.Definitions, 1)
		l.Debug("generate content", "file", fileName)
		os.WriteFile(fileName, []byte(content), 0644)
	}

}

const (
	prefixSeparator = "/"
	anchorSeparator = "-"
)

const TemplateConfigField = `
<details className="config-field" data-expandable="%t"%s>
<summary>

%s` + "`%s`" + ` <span className="config-field-required" data-required="%t">required</span> <span className="config-field-type">%s</span> <span className="config-field-default">%s</span> <span className="config-field-enum">%s</span> {#%s}

%s

</summary>

%s

</details>
`

func buildContent(prefix string, outDir string, schema *jsonschema.Schema, allDefinitions jsonschema.Definitions, depth int) string {
	if schema.Properties == nil {
		return ""
	}

	content := ""
	for pair := schema.Properties.Oldest(); pair != nil; pair = pair.Next() {
		fieldName := pair.Key
		fieldSchema, ok := schema.Properties.Get(fieldName)
		if !ok {
			continue
		}
		cp := *fieldSchema
		properties := jsonschema.NewProperties()
		_, _ = properties.Set(fieldName, &cp)
		cp.Properties = properties

		fieldContent := renderField(
			prefix,
			outDir,
			fieldName,
			&cp,
			schema,
			allDefinitions,
			depth,
		)
		if fieldContent != "" {
			content += "\n\n" + fieldContent
		}
		fileName := fmt.Sprintf("%s/%s.mdx", outDir, prefix+fieldName)
		err := os.MkdirAll(path.Dir(fileName), 0755)
		if err != nil {
			log.Fatal(fmt.Errorf("creating directory: %w", err))
		}
		os.WriteFile(fileName, []byte(fieldContent), 0644)
	}

	return content
}
func renderField(
	prefix,
	outDir,
	fieldName string,
	fieldSchema *jsonschema.Schema,
	parentSchema *jsonschema.Schema,
	allDefinitions jsonschema.Definitions,
	depth int,
) string {
	headlinePrefix := strings.Repeat("#", int(math.Min(5, float64(depth+1)))) + " "
	anchorPrefix := strings.TrimPrefix(strings.ReplaceAll(prefix, prefixSeparator, anchorSeparator), anchorSeparator)

	fieldContent := ""
	isNameObjectMap := false
	expandable := false

	var patternPropertySchema *jsonschema.Schema
	var ok bool
	var nestedSchema *jsonschema.Schema

	ref := ""
	if fieldSchema.Type == "array" {
		ref = fieldSchema.Items.Ref
	} else if patternPropertySchema, ok = findPatternProperty(fieldSchema); ok {
		ref = fieldSchema.AdditionalProperties.Ref
		isNameObjectMap = true
	} else if fieldSchema.Ref != "" {
		ref = fieldSchema.Ref
	}

	if ref != "" {
		refSplit := strings.Split(ref, "/")
		nestedSchema, ok = allDefinitions[refSplit[len(refSplit)-1]]

		if ok {
			newPrefix := prefix + fieldName + prefixSeparator
			fieldContent = buildContent(newPrefix, outDir, nestedSchema, allDefinitions, depth+1)
			expandable = true
		}
	}

	required := false
	if slices.Contains(parentSchema.Required, fieldName) {
		required = true
	}
	fieldDefault := ""

	description := fieldSchema.Description
	lines := strings.Split(description, "\n")
	newLines := []string{}
	for _, line := range lines {
		if strings.HasPrefix(strings.TrimSpace(line), "+") {
			continue
		}
		newLines = append(newLines, line)
	}
	description = strings.Join(newLines, "\n")

	fieldType := fieldSchema.Type
	if fieldType == "" && fieldSchema.OneOf != nil {
		for _, oneOfType := range fieldSchema.OneOf {
			if fieldType != "" {
				fieldType = fieldType + "|"
			}
			fieldType = fieldType + oneOfType.Type
		}
	}

	if isNameObjectMap {
		fieldType = "&lt;" + fieldName + "_name&gt;:"

		if patternPropertySchema != nil && patternPropertySchema.Type != "" {
			fieldType = fieldType + patternPropertySchema.Type
		} else {
			fieldType = fieldType + "object"
		}
	}

	if fieldType == "array" {
		if fieldSchema.Items.Type == "" {
			fieldType = "object[]"
		} else {
			fieldType = fieldSchema.Items.Type + "[]"
		}
	}

	if fieldType == "" {
		fieldType = "object"
	}

	if ref != "" {
		if isNameObjectMap && nestedSchema != nil {
			// nameField, ok := nestedSchema.Properties.Get(fieldName)
			// if ok {
			// if nameFieldSchema, ok := nameField.(*jsonschema.Schema); ok {
			fieldType = "&lt;" + pluralizeClient.Singular(fieldName) + "_name&gt;:object"
			// }
			// }
		}

		refSplit := strings.Split(ref, "/")
		_, ok = allDefinitions[refSplit[len(refSplit)-1]]
		if ok {
			anchorName := anchorPrefix + fieldName
			fieldContent = fmt.Sprintf(TemplateConfigField, true, "", headlinePrefix, fieldName, required, fieldType, "", "", anchorName, description, fieldContent)
		}
	} else {
		if fieldType == "boolean" {
			// INFO: uncommented because of possible confusion between `default value` and the `default values.yaml` file
			// fieldDefault = "false"
			fieldDefault = ""
			if required {
				fieldDefault = "true"
				required = false
			}
		} else {
			fieldDefault, ok = fieldSchema.Default.(string)
			if !ok {
				fieldDefault = ""
			}
		}

		enumValues := GetEnumValues(fieldSchema, required, &fieldDefault)
		anchorName := anchorPrefix + fieldName

		fieldContent = applyTemplate(templateFieldData{
			expandable:       expandable,
			expandableSuffix: " open",
			headlinePrefix:   headlinePrefix,
			fieldName:        fieldName,
			required:         required,
			fieldType:        fieldType,
			fieldDefault:     fieldDefault,
			enumValues:       enumValues,
			anchorName:       anchorName,
			description:      description,
			content:          fieldContent,
		})
	}

	return fieldContent
}

type templateFieldData struct {
	expandable       bool
	expandableSuffix string
	headlinePrefix   string
	fieldName        string
	required         bool
	fieldType        string
	fieldDefault     string
	enumValues       string
	anchorName       string
	description      string
	content          string
}

func applyTemplate(d templateFieldData) string {
	return fmt.Sprintf(TemplateConfigField, d.expandable, d.expandableSuffix, d.headlinePrefix, d.fieldName, d.required, d.fieldType, d.fieldDefault, d.enumValues, d.anchorName, d.description, d.content)
}

func GetEnumValues(fieldSchema *jsonschema.Schema, required bool, fieldDefault *string) string {
	enumValues := ""
	if fieldSchema.Enum != nil {
		for i, enumVal := range fieldSchema.Enum {
			enumValString, ok := enumVal.(string)
			if ok {
				if i == 0 && !required && *fieldDefault == "" {
					*fieldDefault = enumValString
				}

				if enumValues != "" {
					enumValues = enumValues + "<br/>"
				}
				enumValues = enumValues + enumValString
			}
		}
		enumValues = fmt.Sprintf("<span>%s</span>", enumValues)
	}
	return enumValues
}

func findPatternProperty(schema *jsonschema.Schema) (*jsonschema.Schema, bool) {
	if schema.AnyOf == nil {
		return nil, false
	}

	for _, s := range schema.AnyOf {
		if patternProperty, ok := s.PatternProperties[".*"]; ok {
			return patternProperty, true
		}
	}

	return nil, false
}
