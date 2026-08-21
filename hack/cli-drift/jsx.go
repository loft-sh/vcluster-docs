package main

import (
	"regexp"
	"strings"
)

// InterpolatedCodeBlock is the repo's preferred component for code examples
// with user-customizable values (see CLAUDE.md), so fence-only scanning is
// blind to a large slice of the corpus. This extracts each component's code
// string so it gets the same validation as a fenced block.
//
// Supported code value shapes (anything else is skipped, never guessed at,
// so an unparseable expression can only cause a missed finding, not a
// phantom one):
//   - a plain JSX attribute string: code="vcluster create x" (may span
//     lines; JSX keeps the newlines literally and entity-escapes specials)
//   - a single template literal:    code={`vcluster create x`}
//   - a single quoted string:       code={'...'} or code={"..."}
//   - expression literals joined with "+" (the concatenation style)
//
// Template literals containing ${...} interpolation are skipped: their value
// is not statically known.
//
// [[VAR:NAME:default]] / [[GLOBAL:NAME]] placeholders are substituted with
// their default (or name) so the code parses like the rendered example.
//
// Findings inside a component are reported at the component's opening-tag
// line, not the exact code line: escaped "\n" sequences make an exact
// source-line mapping impossible in general.

// interpolatedBlock is one extracted InterpolatedCodeBlock component.
type interpolatedBlock struct {
	language  string
	title     string
	code      string
	startLine int // 1-indexed file line of the component's opening tag
	ignored   bool
}

const interpolatedTag = "<InterpolatedCodeBlock"

var (
	languageAttrPattern = regexp.MustCompile(`language=["']([A-Za-z0-9]+)["']`)
	titleAttrPattern    = regexp.MustCompile(`title=["']([^"']*)["']`)
	placeholderPattern  = regexp.MustCompile(`\[\[(?:VAR|GLOBAL):([^:\]]+?)(?::([^\]]*))?\]\]`)
)

// extractInterpolatedBlocks returns every parseable InterpolatedCodeBlock
// component in content, honoring the drift-ignore marker on the line directly
// above the component (the same convention fenced blocks use).
func extractInterpolatedBlocks(content string) []interpolatedBlock {
	var blocks []interpolatedBlock
	lines := strings.Split(content, "\n")

	searchFrom := 0
	for {
		rel := strings.Index(content[searchFrom:], interpolatedTag)
		if rel == -1 {
			break
		}
		idx := searchFrom + rel
		startLine := 1 + strings.Count(content[:idx], "\n")

		tagEnd := findTagEnd(content, idx+len(interpolatedTag))
		if tagEnd == -1 {
			break // unterminated tag; nothing after it is parseable
		}
		tag := content[idx:tagEnd]
		searchFrom = tagEnd

		b := interpolatedBlock{
			startLine: startLine,
			ignored:   startLine >= 2 && strings.Contains(lines[startLine-2], driftIgnoreMarker),
		}

		code, codeStart, codeEnd, ok := parseCodeAttr(tag)
		if !ok {
			continue
		}
		b.code = substitutePlaceholders(code)

		// Attribute regexes must not look inside the code string, which can
		// legitimately contain text like `language="yaml"`.
		rest := tag[:codeStart] + tag[codeEnd:]
		if m := languageAttrPattern.FindStringSubmatch(rest); m != nil {
			b.language = m[1]
		}
		if m := titleAttrPattern.FindStringSubmatch(rest); m != nil {
			b.title = m[1]
		}
		blocks = append(blocks, b)
	}
	return blocks
}

// entityReplacer decodes the HTML entities JSX attribute strings use for
// characters that cannot appear raw.
var entityReplacer = strings.NewReplacer(
	"&quot;", `"`, "&amp;", "&", "&lt;", "<", "&gt;", ">", "&#123;", "{", "&#125;", "}",
)

// parseCodeAttr locates the code attribute inside a component tag and returns
// its decoded string value plus the [start, end) tag offsets of the whole
// attribute value, so the caller can exclude it from attribute matching.
func parseCodeAttr(tag string) (code string, start, end int, ok bool) {
	attr := strings.Index(tag, "code=")
	if attr == -1 || attr+len("code=") >= len(tag) {
		return "", 0, 0, false
	}
	start = attr + len("code=")

	switch tag[start] {
	case '{':
		expr, exprEnd, found := braceExpr(tag, start+1)
		if !found {
			return "", 0, 0, false
		}
		code, found = evalStringExpr(expr)
		return code, start, exprEnd, found
	case '"', '\'':
		// A plain JSX attribute string: content is verbatim (newlines
		// included), with specials entity-escaped rather than backslashed.
		q := tag[start]
		rel := strings.IndexByte(tag[start+1:], q)
		if rel == -1 {
			return "", 0, 0, false
		}
		end = start + 1 + rel + 1
		return entityReplacer.Replace(tag[start+1 : end-1]), start, end, true
	default:
		return "", 0, 0, false
	}
}

// findTagEnd returns the index just past the '>' that closes the component
// tag whose attributes start at pos, skipping string literals and balancing
// the braces of attribute expressions (a '>' inside code={...} must not end
// the tag). Returns -1 if the tag never closes.
func findTagEnd(s string, pos int) int {
	depth := 0
	for i := pos; i < len(s); i++ {
		switch s[i] {
		case '\'', '"', '`':
			j := skipStringLiteral(s, i)
			if j == -1 {
				return -1
			}
			i = j
		case '{':
			depth++
		case '}':
			depth--
		case '>':
			if depth == 0 {
				return i + 1
			}
		}
	}
	return -1
}

// braceExpr returns the expression between an already-consumed '{' and its
// matching '}', plus the index just past that '}'.
func braceExpr(s string, start int) (string, int, bool) {
	depth := 1
	for i := start; i < len(s); i++ {
		switch s[i] {
		case '\'', '"', '`':
			j := skipStringLiteral(s, i)
			if j == -1 {
				return "", 0, false
			}
			i = j
		case '{':
			depth++
		case '}':
			depth--
			if depth == 0 {
				return s[start:i], i + 1, true
			}
		}
	}
	return "", 0, false
}

// skipStringLiteral returns the index of the closing quote of the JS string
// literal opening at s[i], honoring backslash escapes. Returns -1 if the
// literal never closes.
func skipStringLiteral(s string, i int) int {
	q := s[i]
	for j := i + 1; j < len(s); j++ {
		switch s[j] {
		case '\\':
			j++
		case q:
			return j
		}
	}
	return -1
}

// evalStringExpr evaluates a JS expression consisting solely of string
// literals joined by '+'. Anything else returns ok=false.
func evalStringExpr(expr string) (string, bool) {
	var sb strings.Builder
	i := 0
	for i < len(expr) {
		switch c := expr[i]; {
		case c == ' ' || c == '\t' || c == '\n' || c == '\r' || c == '+':
			i++
		case c == '\'' || c == '"' || c == '`':
			end := skipStringLiteral(expr, i)
			if end == -1 {
				return "", false
			}
			body := expr[i+1 : end]
			if c == '`' && strings.Contains(body, "${") {
				return "", false
			}
			sb.WriteString(unescapeJS(body))
			i = end + 1
		default:
			return "", false
		}
	}
	return sb.String(), true
}

// unescapeJS resolves the backslash escapes meaningful to this scan (\n, \t,
// \r); any other escaped character (quotes, backslash, backtick, $) becomes
// itself, matching JS semantics for the sequences the docs actually use.
func unescapeJS(s string) string {
	var sb strings.Builder
	for i := 0; i < len(s); i++ {
		if s[i] != '\\' || i+1 == len(s) {
			sb.WriteByte(s[i])
			continue
		}
		i++
		switch s[i] {
		case 'n':
			sb.WriteByte('\n')
		case 't':
			sb.WriteByte('\t')
		case 'r':
			sb.WriteByte('\r')
		default:
			sb.WriteByte(s[i])
		}
	}
	return sb.String()
}

// substitutePlaceholders replaces [[VAR:NAME:default]] and [[GLOBAL:NAME]]
// interpolation markers with their default value (or the variable name when
// no default is given).
func substitutePlaceholders(s string) string {
	return placeholderPattern.ReplaceAllStringFunc(s, func(m string) string {
		g := placeholderPattern.FindStringSubmatch(m)
		if g[2] != "" {
			return g[2]
		}
		return g[1]
	})
}
