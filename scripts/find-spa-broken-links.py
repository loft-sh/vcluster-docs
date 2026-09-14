#!/usr/bin/env python3
"""Find relative Markdown links that can break during SPA navigation.

Docusaurus rewrites relative links ending in .md or .mdx at build time. Bare
relative paths survive in the client bundle and are resolved against the page
URL when clicked. In reusable partials and fragments, the result can also vary
with the importing page's depth.

With no arguments, both live documentation roots are checked. Explicit roots
may be supplied to audit a particular live or versioned documentation tree.
"""

from pathlib import Path
import re
import sys
from urllib.parse import urljoin, urlsplit


LIVE_ROOTS = {"platform", "vcluster"}
DEFAULT_ROOTS = ("platform", "vcluster")
LINK_PATTERN = re.compile(r"\]\(((?:\.\./|\./)[^)\s]+)\)")

# These targets cannot simply receive an .mdx suffix. They point to generated,
# renamed, or removed pages and are tracked separately from DOC-1043.
KNOWN_EXCEPTIONS = {
    ("deploy/control-plane/binary/basics.mdx", "../../../cli/vcluster_platform_connect_vcluster"),
    ("deploy/control-plane/binary/high-availability.mdx", "../../../cli/vcluster_platform_connect_vcluster"),
    ("introduction/oss-vs-free.mdx", "../quick-start"),
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
    version = ""
    if not is_live and name.startswith("version-"):
        version = f"/{name.removeprefix('version-')}"

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


def scan(root: Path) -> tuple[int, int, int]:
    product, url_prefix, is_live = root_details(root)
    reusable = []
    broken = []
    coincidental = []

    for path in sorted(root.rglob("*.mdx")):
        relative_file = path.relative_to(root).as_posix()
        is_reusable = any(part in {"_fragments", "_partials"} for part in path.parts)
        page_url = file_to_url(path, root, url_prefix)

        for line_number, line in enumerate(path.read_text().splitlines(), 1):
            if line.strip().startswith("import "):
                continue

            for match in LINK_PATTERN.finditer(line):
                link = match.group(1)
                link_path = urlsplit(link).path
                if link_path.endswith((".md", ".mdx")):
                    continue
                if any(
                    relative_file.endswith(exception_file) and link == exception_link
                    for exception_file, exception_link in KNOWN_EXCEPTIONS
                ):
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

    # Existing version snapshots are immutable. Report their reusable findings
    # without blocking; live roots must remain clean so future snapshots are safe.
    blockers = len(broken) + (len(reusable) if is_live else 0)
    return blockers, len(reusable), len(coincidental)


def main() -> int:
    roots = [Path(value) for value in sys.argv[1:]] or [Path(value) for value in DEFAULT_ROOTS]
    missing = [str(root) for root in roots if not root.is_dir()]
    if missing:
        print(f"Missing docs root(s): {', '.join(missing)}", file=sys.stderr)
        return 2

    totals = [scan(root) for root in roots]
    blockers = sum(item[0] for item in totals)
    reusable = sum(item[1] for item in totals)
    coincidental = sum(item[2] for item in totals)
    print(
        f"\nTotal: {blockers} blocking, {reusable} reusable, "
        f"{coincidental} coincidental"
    )
    return 1 if blockers else 0


if __name__ == "__main__":
    raise SystemExit(main())
