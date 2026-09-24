# license-drift

Detects drift between the licensing values published in the docs and the Go
constants they were read from.

[platform/understand/licensing.mdx](../../platform/understand/licensing.mdx)
states exact refresh intervals, grace periods, cache lifetimes, Secret names,
and environment variable names. Those values live in `loft-sh/loft-enterprise`
and `loft-sh/vcluster-pro`. Neither repo is a dependency of the docs build, so
`npm run build`, vale, and the existing `cli-drift` and `config-drift` tools
can't notice when one of them changes. This script is the guard for that gap.

Unlike `cli-drift` and `config-drift`, which compare prose against generated
reference files already checked into this repo, this one needs the source
repositories. It's a manual or scheduled check, not part of the normal build.

## Run it

```bash
hack/license-drift/check.sh <loft-enterprise-path> <vcluster-pro-path>
```

Or set `LOFT_ENTERPRISE_PATH` and `VCLUSTER_PRO_PATH`. Requires `jq`.

Make sure both clones are on an up-to-date `main` first, otherwise the check
reports the state of whatever is checked out.

```bash
git -C ~/git/vcluster/loft-enterprise fetch origin main && git -C ~/git/vcluster/loft-enterprise checkout origin/main
git -C ~/git/vcluster/vcluster-pro fetch origin main && git -C ~/git/vcluster/vcluster-pro checkout origin/main
hack/license-drift/check.sh ~/git/vcluster/loft-enterprise ~/git/vcluster/vcluster-pro
```

Exits `0` when every constant matches, `1` on drift or a constant it can't
find, and `2` on a usage or environment error.

## When it reports drift

1. Confirm the new value in the source repo.
2. Update the affected prose in the files listed under `docs` in
   `constants.json`.
3. Update `expected` in `constants.json` to the new value.

A `NOT FOUND` or `MISSING FILE` result usually means the constant was renamed or
the file moved, not that the behavior changed. Find its new home, update `file`
or `name` in the manifest, and check whether the behavior changed with it.

Run the check against `main`. The manifest pins named constants, and older
release branches sometimes express the same value as an inline literal. On
`release-4.12`, for example, `keyExpiryWarningDays`, `keyExpiryGraceDays`, and
`warnLimitThreshold` don't exist by name even though the behavior is identical,
so the check reports them as not found. That's a limitation of matching on
identifiers, not a signal that the docs are wrong.

## Add a constant

Add an entry to `constants.json` whenever the docs start stating another exact
licensing value. Each entry records the repo, the path within it, the Go
identifier, the expected right-hand side of the declaration verbatim, and a
short note on what the docs claim because of it.

The `expected` value is compared as a literal string against the text after the
`=`, so write it exactly as the Go source does. `time.Hour * 6` and `6 *
time.Hour` are the same duration but won't compare equal.

## What this can't catch

The check matches `name = value` declarations. Anything the docs state that
isn't expressed that way in Go is invisible to it and will drift silently:

- **Struct literal fields.** The retry backoff the standalone and in-cluster API
  license types use is a `wait.Backoff{Duration: 30 * time.Second, Cap: 5 *
  time.Minute, ...}` literal, so the documented "30 seconds, capped at 5
  minutes" isn't pinned.
- **Function bodies.** `getStandaloneAllowedFeatures()` returns the map that
  decides which features standalone allows by default, which the docs name as
  standalone and Private Nodes. A change there won't be flagged.
- **Control flow.** The order `detectLicenseType` evaluates license types in,
  and conditions like the `!fips140.Enabled()` guard on the online type, are
  documented but unpinnable.
- **Inline literals on older branches.** See the note above about
  `release-4.12`.

Widening the matcher to cover these would mean parsing Go rather than grepping
it. That's a larger tool than this needs to be, so treat the list above as
places to re-verify by hand when the licensing docs change.
