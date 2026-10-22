# Platform API generator

The generator reads the vendored `loft-sh/api/v5` and `loft-sh/agentapi/v5`
types and their Go comments. It writes reference partials and resource pages.
Never edit the generated files by hand.

```bash
go run hack/platform/partials/main.go
go run ./hack/platform/check-resource-coverage
```

Each user-facing resource needs a `GenerateObjectOverview` call with an example.
The coverage tool compares these calls with the vendored management API registry.
Its exclusion manifest records reviewed action endpoints and information
projections that are not user-authored resources. Advertise only the operations the API
serves. Machine, for example, refuses create and delete but accepts label and
annotation updates, so it advertises retrieve and update with a note.

## Release routing before the 5.0 cutover

DEVOPS-1693 targets `next`, where the redesigned 5.0 docs live. A
`repository_dispatch` starts from the default branch. The receiver must select
`next` before classifying a Platform 5.x version and use `next` as the sync PR
base. The routing change must also land on `main` for real release dispatches.

The workflow sets `PLATFORM_V5_DOCS_BRANCH=next`. Remove that flag when the
5.0 docs move to `main` as part of DOC-1761. Other events and Platform majors
continue to target `main`.

| Stage | Trigger and reads | Mutation | Failure handling and evidence |
|---|---|---|---|
| Resolve | Dispatch or manual event and version | None | Existing shape check rejects malformed tags. New branch selection accepts only `main` or `next`; invalid config fails with an Actions error. |
| Select branch | Validated target branch | Existing git checkout | Classifier and generator read the same branch used as the PR base. Checkout failure stops the run. |
| Classify | Version, branch history, imports and frozen docs | None | Existing `major-cutover` guard remains for unsupported majors. RC and GA tests cover the v5 imports. |
| Bump pins | Published module tags | Existing tidy and vendor steps | Existing exact-version checks reject a transitive upgrade. Use the proxy settings below for direct module resolution. |
| Generate | Vendored types, comments and examples | Existing generated MDX output | Compile errors fail the run. Coverage reports new gaps; add an example or a reviewed exclusion. |
| Open PR | Generated diff and target branch | Existing feature branch push and PR | Empty diffs skip. Existing PRs update on retry. Actions logs and the receiver failure notification expose failures. |

The generator replaces the temporary Connector Swagger bridge proposed in
PR #2988. Do not preserve `connectors/` in `.generator-preserve` once Connector
is generated here. Keep the unrelated frozen-doc preservation entries.

## Update module pins

Change the generator imports by hand for a new API major. The classifier
deliberately prevents a pin bump from crossing majors on its own.

For a release within v5, use the same routing settings as CI:

```bash
export GONOPROXY='github.com/loft-sh/vcluster-pro*,github.com/loft-sh/api,github.com/loft-sh/agentapi'
export GONOSUMDB="$GONOPROXY"
VERSION=v5.0.0-alpha.4 bash hack/release/bump-platform-pins.sh
```

Commit `go.mod`, `go.sum`, `vendor/`, and the generated output together.

## Verify

```bash
GOFLAGS=-mod=vendor go test ./hack/platform/... ./hack/vcluster/partials
bats hack/release/*.bats
go run ./hack/platform/check-resource-coverage
EVENT_TYPE=platform-released VERSION=v5.0.0-rc.1 bash hack/release/classify-version.sh
EVENT_TYPE=platform-released VERSION=v5.0.0 bash hack/release/classify-version.sh
npm run build
```

The real RC dispatch still needs verification after both PRs merge and an RC
is published. It must open a sync PR against `next` with regenerated API
partials. A local generator run does not establish that result.
