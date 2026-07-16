// Command check-resource-coverage detects loft-sh/api management API
// resources that are registered upstream but have no corresponding
// util.GenerateObjectOverview call in hack/platform/partials/main.go, so a
// new Kind doesn't silently miss generated reference docs the way the 8
// types fixed by DOC-1630 did.
//
// Ground truth: every `Management<Name>Storage = builders.NewApiResourceWithStorage(`
// entry in the loft-sh/api management API registration file.
// Covered set: every `Resource:` field passed to util.GenerateObjectOverview
// in the platform partials generator.
// Exclude list: a plain manifest of Kinds reviewed and confirmed as
// internal/action-style rather than real user-authored resources. Kinds not
// yet triaged are deliberately left off so this keeps surfacing them.
//
// Exit codes: 0 = no new gaps, 1 = gaps found, 2 = error.
//
// Usage:
//
//	go run ./hack/platform/check-resource-coverage \
//	  [--register <path>] [--generator <path>] [--exclude <path>] \
//	  [--json-output <path>]
package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"regexp"
	"sort"
	"strings"

	pluralize "github.com/gertd/go-pluralize"
)

var (
	registerPattern = regexp.MustCompile(`Management([A-Za-z]+)Storage\s*=\s*builders\.NewApiResourceWithStorage`)
	// (?m)^\s*Resource: anchors on line start so this doesn't also match
	// SubResource: fields, which contain "Resource:" as a substring.
	generatorPattern = regexp.MustCompile(`(?m)^\s*Resource:\s*"([a-z0-9]+)"`)
	pluralizeClient  = pluralize.NewClient()
)

// normalize collapses a Kind name (PascalCase, e.g. "MachineConfigTemplate")
// or a resource path (plural lowercase, e.g. "machineconfigtemplates") down
// to the same comparable form so both sides of the diff line up regardless
// of casing or pluralization.
func normalize(s string) string {
	return strings.ToLower(pluralizeClient.Singular(s))
}

type Report struct {
	RegisteredCount int      `json:"registered_count"`
	CoveredCount    int      `json:"covered_count"`
	ExcludedCount   int      `json:"excluded_count"`
	Gaps            []string `json:"gaps"`
}

func main() {
	registerPath := flag.String("register", "vendor/github.com/loft-sh/api/v4/pkg/apis/management/zz_generated.api.register.go", "path to the loft-sh/api management API registration file")
	generatorPath := flag.String("generator", "hack/platform/partials/main.go", "path to the platform partials generator")
	excludePath := flag.String("exclude", "hack/platform/check-resource-coverage/exclude.txt", "path to the manifest of Kinds intentionally excluded from generation")
	jsonOutput := flag.String("json-output", "", "path to write a JSON report")
	flag.Parse()

	registerData, err := os.ReadFile(*registerPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "ERROR: reading %s: %v\n", *registerPath, err)
		os.Exit(2)
	}
	registered := map[string]string{} // normalized -> original PascalCase Kind
	for _, m := range registerPattern.FindAllStringSubmatch(string(registerData), -1) {
		registered[normalize(m[1])] = m[1]
	}
	if len(registered) == 0 {
		fmt.Fprintf(os.Stderr, "ERROR: found 0 registered resources in %s; regex may be stale\n", *registerPath)
		os.Exit(2)
	}

	generatorData, err := os.ReadFile(*generatorPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "ERROR: reading %s: %v\n", *generatorPath, err)
		os.Exit(2)
	}
	covered := map[string]bool{}
	for _, m := range generatorPattern.FindAllStringSubmatch(string(generatorData), -1) {
		covered[normalize(m[1])] = true
	}

	excluded := map[string]bool{}
	excludeData, err := os.ReadFile(*excludePath)
	switch {
	case err == nil:
		for _, line := range strings.Split(string(excludeData), "\n") {
			line = strings.TrimSpace(line)
			if line == "" || strings.HasPrefix(line, "#") {
				continue
			}
			excluded[normalize(line)] = true
		}
	case os.IsNotExist(err):
		// No exclude list yet; treat as empty rather than erroring.
	default:
		fmt.Fprintf(os.Stderr, "ERROR: reading %s: %v\n", *excludePath, err)
		os.Exit(2)
	}

	var gaps []string
	for key, original := range registered {
		if covered[key] || excluded[key] {
			continue
		}
		gaps = append(gaps, original)
	}
	sort.Strings(gaps)

	report := Report{
		RegisteredCount: len(registered),
		CoveredCount:    len(covered),
		ExcludedCount:   len(excluded),
		Gaps:            gaps,
	}

	data, err := json.MarshalIndent(report, "", "  ")
	if err != nil {
		fmt.Fprintf(os.Stderr, "ERROR: marshaling JSON: %v\n", err)
		os.Exit(2)
	}

	if *jsonOutput != "" {
		if err := os.WriteFile(*jsonOutput, data, 0644); err != nil {
			fmt.Fprintf(os.Stderr, "ERROR: writing %s: %v\n", *jsonOutput, err)
			os.Exit(2)
		}
		fmt.Printf("Wrote report to %s\n", *jsonOutput)
	} else {
		fmt.Println(string(data))
	}

	fmt.Printf("Registered: %d, Covered: %d, Excluded: %d, Gaps: %d\n", report.RegisteredCount, report.CoveredCount, report.ExcludedCount, len(gaps))
	if len(gaps) > 0 {
		fmt.Println("Kinds registered upstream with no generator coverage and no exclude entry:")
		for _, g := range gaps {
			fmt.Printf("  - %s\n", g)
		}
		os.Exit(1)
	}
	os.Exit(0)
}
