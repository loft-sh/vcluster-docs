package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"log/slog"
	"math"
	"os"
	"strings"

	"github.com/invopop/jsonschema"
)

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

	topLevelProps := map[string]bool{}
	for pair := schema.Properties.Oldest(); pair != nil; pair = pair.Next() {
		def := pair.Value
		if def == nil {
			continue
		}
		*def = *pair.Value
		name := strings.ToLower(pair.Key[:1]) + pair.Key[1:]
		upperName := strings.ToUpper(pair.Key[:1]) + pair.Key[1:]
		fileName := fmt.Sprintf("%s/%s.mdx", *outDir, name)
		topLevelProps[upperName] = true

		// some jsonschema massaging to top level properties include themselves :upsidedown:
		// sets properties to a ref to its own definition
		properties := jsonschema.NewProperties()
		_, _ = properties.Set(pair.Key, def)
		def.Properties = properties

		content := buildContent("", def, schema.Definitions, 1)
		l.Debug("generate content", "file", fileName)
		os.WriteFile(fileName, []byte(content), 0644)
	}

	for name, def := range schema.Definitions {
		if ok := topLevelProps[name]; ok {
			l.Debug("skipping", "name", name)
			continue
		}
		defCopy := *def
		lowerName := strings.ToLower(name[:1]) + name[1:]
		fileName := fmt.Sprintf("%s/%s.mdx", *outDir, lowerName)

		properties := jsonschema.NewProperties()
		defCopy.Ref = "#/$defs/" + name
		_, _ = properties.Set(name, &defCopy)
		defCopy.Properties = properties
		content := buildContent("", &defCopy, schema.Definitions, 1)
		if content == "" {
			return
		}
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

func buildContent(prefix string, schema *jsonschema.Schema, allDefinitions jsonschema.Definitions, depth int) string {
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

		fieldContent := renderField(
			prefix,
			fieldName,
			fieldSchema,
			allDefinitions,
			depth,
		)
		if fieldContent != "" {
			content += "\n\n" + fieldContent
		}
	}

	return content
}
func renderField(
	prefix,
	fieldName string,
	fieldSchema *jsonschema.Schema,
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

	ref := ""
	if fieldSchema.Type == "array" {
		ref = fieldSchema.Items.Ref
	} else if patternPropertySchema, ok = fieldSchema.PatternProperties[".*"]; ok {
		ref = patternPropertySchema.Ref
		isNameObjectMap = true
	} else if fieldSchema.Ref != "" {
		ref = fieldSchema.Ref
	}

	if ref != "" {
		refSplit := strings.Split(ref, "/")
		nestedSchema, ok := allDefinitions[refSplit[len(refSplit)-1]]

		if ok {
			newPrefix := prefix + fieldName + prefixSeparator
			fieldContent = buildContent(newPrefix, nestedSchema, allDefinitions, depth+1)
			expandable = true
		}
	}

	required := true
	fieldDefault := ""

	description := fieldSchema.Description
	lines := strings.Split(description, "\n")
	newLines := []string{}
	for _, line := range lines {
		if line == "+optional" {
			required = false
		}
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
		refSplit := strings.Split(ref, "/")
		_, ok = allDefinitions[refSplit[len(refSplit)-1]]
		if ok {
			anchorName := anchorPrefix + fieldName
			fieldContent = fmt.Sprintf(TemplateConfigField, true, "", headlinePrefix, fieldName, required, fieldType, "", "", anchorName, description, fieldContent)
		}
	} else {
		if fieldType == "boolean" {
			fieldDefault = "false"
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
		fieldContent = fmt.Sprintf(TemplateConfigField, expandable, " open", headlinePrefix, fieldName, required, fieldType, fieldDefault, enumValues, anchorName, description, fieldContent)
	}

	return fieldContent
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
