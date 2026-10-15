#!/usr/bin/env bash
# check-partials_test.sh — Tests for check-partials.sh
#
# Builds throwaway git repos and checks the exit code for each scenario.
#
# Usage: bash hack/check-partials_test.sh

SCRIPT="$(cd "$(dirname "$0")" && pwd)/check-partials.sh"
PASS=0
FAIL=0

# Creates a repo with a legacy hand-written partial and a generated partial on
# main, then checks out a PR branch. Prints the repo path.
setup() {
    local dir
    dir="$(mktemp -d)"
    git init -q -b main "$dir"
    git -C "$dir" config user.email test@test.com
    git -C "$dir" config user.name Test
    git -C "$dir" config core.hooksPath /dev/null
    mkdir -p "$dir/vcluster/_partials/config" "$dir/vcluster/_partials/admonitions" "$dir/platform/_partials"
    echo legacy > "$dir/vcluster/_partials/admonitions/legacy.mdx"
    echo generated > "$dir/vcluster/_partials/config/sync.mdx"
    echo page > "$dir/platform/page.mdx"
    git -C "$dir" add -A
    git -C "$dir" commit -q -m base
    git -C "$dir" checkout -q -b pr
    echo "$dir"
}

commit() { git -C "$1" add -A && git -C "$1" commit -q -m change; }

expect() {
    local name="$1" want="$2" dir="$3" got
    (cd "$dir" && GITHUB_BASE_REF=main bash "$SCRIPT" >/dev/null 2>&1)
    got=$?
    if [[ "$got" == "$want" ]]; then
        echo "PASS  $name"
        PASS=$((PASS + 1))
    else
        echo "FAIL  $name (want exit $want, got $got)"
        FAIL=$((FAIL + 1))
    fi
    rm -rf "$dir"
}

d="$(setup)"; mkdir -p "$d/vcluster/_partials/deploy"; echo new > "$d/vcluster/_partials/deploy/new.mdx"; commit "$d"
expect "new top-level hand-written partial fails" 1 "$d"

d="$(setup)"; mkdir -p "$d/platform/tenants/_partials"; echo new > "$d/platform/tenants/_partials/new.mdx"; commit "$d"
expect "new nested hand-written partial fails" 1 "$d"

d="$(setup)"; mkdir -p "$d/docs/_partials"; echo new > "$d/docs/_partials/new.mdx"; commit "$d"
expect "new root hand-written partial fails" 1 "$d"

d="$(setup)"; mkdir -p "$d/vcluster/_fragments"; echo new > "$d/vcluster/_fragments/new.mdx"; commit "$d"
expect "new fragment passes" 0 "$d"

d="$(setup)"; echo new > "$d/vcluster/_partials/config/networking.mdx"; commit "$d"
expect "new generated config partial passes" 0 "$d"

d="$(setup)"; mkdir -p "$d/platform/api/_partials/resources"; echo new > "$d/platform/api/_partials/resources/project.mdx"; commit "$d"
expect "new generated API partial passes" 0 "$d"

d="$(setup)"; mkdir -p "$d/platform/_partials/reference"; echo new > "$d/platform/_partials/reference/platform-cli-commands.mdx"; commit "$d"
expect "generated CLI index passes" 0 "$d"

d="$(setup)"; echo edited >> "$d/vcluster/_partials/admonitions/legacy.mdx"; commit "$d"
expect "editing a legacy partial passes" 0 "$d"

d="$(setup)"; mkdir -p "$d/vcluster/moved/_partials"; git -C "$d" mv vcluster/_partials/admonitions/legacy.mdx vcluster/moved/_partials/legacy.mdx; commit "$d"
expect "moving a legacy partial passes" 0 "$d"

d="$(setup)"; mkdir -p "$d/vcluster_versioned_docs/version-0.38.0/_partials"; echo copy > "$d/vcluster_versioned_docs/version-0.38.0/_partials/new.mdx"; commit "$d"
expect "versioned docs copy passes" 0 "$d"

d="$(setup)"; echo new > "$d/platform/new-page.mdx"; commit "$d"
expect "PR without partials passes" 0 "$d"

echo
echo "$PASS passed, $FAIL failed"
[[ "$FAIL" -eq 0 ]]
