#!/usr/bin/env python3
"""Prevent product docs from bypassing their versioned reusable content.

Same-product partial and fragment imports must be source-relative. Docusaurus
rewrites those imports when it creates a version, so the snapshot remains
self-contained. Site-root imports continue to resolve to live content.
"""

from pathlib import Path
import re
import sys


DOC_ROOTS = (
    (Path("platform"), "platform"),
    (Path("vcluster"), "vcluster"),
    (Path("platform_versioned_docs"), "platform"),
    (Path("vcluster_versioned_docs"), "vcluster"),
)
IMPORT_PATTERN = re.compile(
    r"^\s*import(?:\s+.+?\s+from)?\s+[\"']([^\"']+)[\"']",
    re.MULTILINE,
)

# Versioned snapshots that legitimately import live same-product reusable
# content. Empty by design: the four entries this check was written against
# (DOC-1043) were version-locked instead of baselined. Add an entry only with a
# recorded reason, and the stale-entry check below forces removal once fixed.
HISTORICAL_BASELINE: set[tuple[str, str]] = set()


def is_same_product_reusable_import(specifier: str, product: str) -> bool:
    resource = specifier.rsplit("!", 1)[-1]
    prefixes = (
        f"@site/{product}/_partials/",
        f"@site/{product}/_fragments/",
        f"/{product}/_partials/",
        f"/{product}/_fragments/",
    )
    return resource.startswith(prefixes)


def main() -> int:
    violations = []
    baseline_seen = set()

    for root, product in DOC_ROOTS:
        for path in sorted(root.rglob("*.mdx")):
            for match in IMPORT_PATTERN.finditer(path.read_text()):
                specifier = match.group(1)
                if not is_same_product_reusable_import(specifier, product):
                    continue

                finding = (path.as_posix(), specifier)
                if finding in HISTORICAL_BASELINE:
                    baseline_seen.add(finding)
                else:
                    line = path.read_text()[: match.start()].count("\n") + 1
                    violations.append((path.as_posix(), line, specifier))

    stale_baseline = HISTORICAL_BASELINE - baseline_seen
    if stale_baseline:
        print("Remove resolved entries from HISTORICAL_BASELINE:")
        for filename, specifier in sorted(stale_baseline):
            print(f"  {filename}: {specifier}")
        return 1

    if violations:
        print("Same-product reusable imports must be source-relative:")
        for filename, line, specifier in violations:
            print(f"  {filename}:{line}: {specifier}")
        return 1

    print(
        "Reusable imports are version-safe "
        f"({len(baseline_seen)} documented historical exceptions)."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
