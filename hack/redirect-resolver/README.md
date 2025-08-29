# Redirect resolver

Transitive redirect resolution for vCluster docs. Prevents redirect chains when files move multiple times.

## Usage

```bash
# Detect path changes
go run hack/redirect-resolver/main.go -mode detect

# Update redirects
go run hack/redirect-resolver/main.go -mode update

# Audit for cycles/conflicts
go run hack/redirect-resolver/main.go -mode audit
```

## Files

- `redirect-history.json` - All path movements
- `netlify.toml` - Generated redirects
- `test-redirects.hurl` - Generated tests

## CI

Runs on doc PRs. Fails with clear instructions if redirects need updating.

## Test

```bash
go test ./hack/redirect-resolver/...
```