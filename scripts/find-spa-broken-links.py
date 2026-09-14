#!/usr/bin/env python3
"""Find relative Markdown links that can break during SPA navigation.

Docusaurus rewrites relative links ending in .md or .mdx at build time. Bare
relative paths survive in the client bundle and are resolved against the page
URL when clicked. In reusable partials and fragments, the result can also vary
with the importing page's depth.

With no arguments, both live documentation roots are checked. Explicit roots
may be supplied to audit a particular live or versioned documentation tree.

Reusable findings block on live roots, because a clean live tree is what makes
the next version snapshot clean. On a versioned root they are reported without
blocking, since older snapshots predate the fix and are never edited. Pass
--enforce-reusable to block on them anyway; CI uses it for the newest snapshot
of each product, which is a copy of an already-clean live tree.
"""

from functools import cache
from pathlib import Path
import re
import sys
from urllib.parse import urljoin, urlsplit


LIVE_ROOTS = {"platform", "vcluster"}
DEFAULT_ROOTS = ("platform", "vcluster")
LINK_PATTERN = re.compile(r"\]\(((?:\.\./|\./)[^)\s]+)\)")
FENCE_PATTERN = re.compile(r"^\s*(?:```|~~~)")
CONFIG_PATH = Path(__file__).resolve().parent.parent / "docusaurus.config.js"
# Each docs plugin block declares its own id and lastVersion, in that order.
LAST_VERSION_PATTERN = re.compile(
    r"""id:\s*["'](platform|vcluster)["'][\s\S]*?lastVersion:\s*["']([^"']+)["']"""
)

# These targets cannot simply receive an .mdx suffix. They point to generated,
# renamed, or removed pages and are tracked separately from DOC-1043.
KNOWN_EXCEPTIONS = {
    ("deploy/control-plane/binary/basics.mdx", "../../../cli/vcluster_platform_connect_vcluster"),
    ("deploy/control-plane/binary/high-availability.mdx", "../../../cli/vcluster_platform_connect_vcluster"),
    ("hardening-guide/host-nodes/self-assessment.mdx", "./control-plane-components"),
    ("hardening-guide/host-nodes/self-assessment.mdx", "./etcd"),
    ("hardening-guide/host-nodes/self-assessment.mdx", "./control-plane"),
    ("hardening-guide/host-nodes/self-assessment.mdx", "./worker-node"),
    ("hardening-guide/host-nodes/self-assessment.mdx", "./policies"),
    ("hardening-guide/private-nodes/self-assessment.mdx", "./control-plane-components"),
    ("hardening-guide/private-nodes/self-assessment.mdx", "./etcd"),
    ("hardening-guide/private-nodes/self-assessment.mdx", "./control-plane"),
    ("hardening-guide/private-nodes/self-assessment.mdx", "./worker-node"),
    ("hardening-guide/private-nodes/self-assessment.mdx", "./policies"),
}


@cache
def last_versions() -> dict[str, str]:
    """Map each product to the version Docusaurus serves without a URL segment.

    Docusaurus serves `lastVersion` at the plugin's route base, so
    version-4.12.0 content lives at /docs/platform/, not /docs/platform/4.12.0/.
    Reading the config keeps the reported URLs honest; an unreadable config
    degrades to the version-segment form rather than failing the scan.
    """
    try:
        config = CONFIG_PATH.read_text()
    except OSError:
        return {}
    return {
        match.group(1): match.group(2)
        for match in LAST_VERSION_PATTERN.finditer(config)
    }


def root_details(root: Path) -> tuple[str, str, bool]:
    """Return product, URL prefix, and whether this is a live docs root."""
    name = root.name
    root_string = root.as_posix()

    if "platform_versioned_docs" in root_string:
        product = "platform"
    elif "vcluster_versioned_docs" in root_string:
        product = "vcluster"
    elif name in LIVE_ROOTS:
        product = name
    else:
        raise ValueError(
            f"Cannot infer docs product from {root}. Use a platform or vcluster docs root."
        )

    is_live = name == product
    last_version = last_versions().get(product)
    version = ""

    if is_live:
        # A live root holds the current version, which Docusaurus serves under
        # /next unless it is also the last version.
        if last_version not in (None, "current"):
            version = "/next"
    elif name.startswith("version-"):
        version_name = name.removeprefix("version-")
        # The last version has no URL segment of its own.
        if last_version != version_name:
            version = f"/{version_name}"

    return product, f"/docs/{product}{version}", is_live


def file_to_url(path: Path, root: Path, url_prefix: str) -> str:
    relative = path.relative_to(root).as_posix().removesuffix(".mdx")
    if relative.endswith("/README"):
        relative = relative.removesuffix("README")
    elif relative == "README":
        relative = ""
    url = f"{url_prefix}/{relative}"
    return url if url.endswith("/") else f"{url}/"


def resolve_build(path: Path, link_path: str, root: Path, url_prefix: str) -> str:
    target = (path.parent / link_path).resolve()
    try:
        relative = target.relative_to(root.resolve()).as_posix()
    except ValueError:
        return "<outside>"
    return f"{url_prefix}/{relative}"


def scan(
    root: Path,
    used_exceptions: set[tuple[str, str]],
    enforce_reusable: bool = False,
) -> tuple[int, int, int]:
    product, url_prefix, is_live = root_details(root)
    reusable = []
    broken = []
    coincidental = []

    for path in sorted(root.rglob("*.mdx")):
        relative_file = path.relative_to(root).as_posix()
        is_reusable = any(part in {"_fragments", "_partials"} for part in path.parts)
        page_url = file_to_url(path, root, url_prefix)

        in_code_fence = False

        for line_number, line in enumerate(path.read_text().splitlines(), 1):
            # Links inside fenced blocks are illustrative text, not navigation.
            if FENCE_PATTERN.match(line):
                in_code_fence = not in_code_fence
                continue
            if in_code_fence or line.strip().startswith("import "):
                continue

            for match in LINK_PATTERN.finditer(line):
                link = match.group(1)
                link_path = urlsplit(link).path
                if link_path.endswith((".md", ".mdx")):
                    continue
                matched = {
                    exception
                    for exception in KNOWN_EXCEPTIONS
                    if relative_file.endswith(exception[0]) and link == exception[1]
                }
                if matched:
                    used_exceptions |= matched
                    continue

                build_url = resolve_build(path, link_path, root, url_prefix).rstrip("/")
                click_url = urljoin(f"https://example.invalid{page_url}", link)
                click_url = urlsplit(click_url).path.rstrip("/")
                entry = (relative_file, line_number, link, build_url, click_url)

                if is_reusable:
                    reusable.append(entry)
                elif build_url != click_url:
                    broken.append(entry)
                else:
                    coincidental.append(entry)

    print(f"\n{root} ({product}, {'live' if is_live else 'historical'}):")
    print(f"  PAGE-BROKEN: {len(broken)}")
    for filename, line_number, link, build_url, click_url in broken:
        print(
            f"    {filename}:{line_number}  {link}  -> {click_url} "
            f"(expected {build_url})"
        )

    print(f"  REUSABLE-BARE: {len(reusable)}")
    for filename, line_number, link, build_url, click_url in reusable:
        status = "MISMATCH" if build_url != click_url else "depth-dependent"
        print(f"    {filename}:{line_number}  {link}  [{status}]")

    print(f"  COINCIDENTAL: {len(coincidental)}")
    for filename, line_number, link, _, _ in coincidental:
        print(f"    {filename}:{line_number}  {link}")

    # Older version snapshots predate the fix and are never edited, so their
    # reusable findings are reported without blocking. Live roots must stay
    # clean so future snapshots are safe, and --enforce-reusable extends that
    # bar to the newest snapshot of each product.
    blocking_reusable = len(reusable) if (is_live or enforce_reusable) else 0
    blockers = len(broken) + blocking_reusable
    return blockers, len(reusable), len(coincidental)


def main() -> int:
    arguments = sys.argv[1:]
    enforce_reusable = "--enforce-reusable" in arguments
    positional = [value for value in arguments if not value.startswith("--")]
    unknown = [
        value
        for value in arguments
        if value.startswith("--") and value != "--enforce-reusable"
    ]
    if unknown:
        print(f"Unknown option(s): {', '.join(unknown)}", file=sys.stderr)
        return 2

    roots = [Path(value) for value in positional] or [Path(value) for value in DEFAULT_ROOTS]
    missing = [str(root) for root in roots if not root.is_dir()]
    if missing:
        print(f"Missing docs root(s): {', '.join(missing)}", file=sys.stderr)
        return 2

    used_exceptions: set[tuple[str, str]] = set()
    totals = [scan(root, used_exceptions, enforce_reusable) for root in roots]
    blockers = sum(item[0] for item in totals)
    reusable = sum(item[1] for item in totals)
    coincidental = sum(item[2] for item in totals)

    # A partial scan cannot prove an exception is dead, so this is a note
    # rather than a failure. It stops KNOWN_EXCEPTIONS rotting unnoticed.
    unused = sorted(KNOWN_EXCEPTIONS - used_exceptions)
    if unused:
        print(
            f"\nNOTE: {len(unused)} KNOWN_EXCEPTIONS entries matched nothing in "
            "the scanned roots. Drop any that no longer apply:"
        )
        for exception_file, exception_link in unused:
            print(f"  {exception_file}: {exception_link}")

    print(
        f"\nTotal: {blockers} blocking, {reusable} reusable, "
        f"{coincidental} coincidental"
    )
    return 1 if blockers else 0


if __name__ == "__main__":
    raise SystemExit(main())
