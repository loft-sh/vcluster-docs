#!/usr/bin/env python3
"""Sync vcluster-docs MDX content to R2R vector database.

Walks versioned docs directories, extracts prose content from MDX files,
and indexes into R2R for semantic search / RAG context injection.

Usage:
    python scripts/r2r-sync.py --dry-run
    python scripts/r2r-sync.py --r2r-url https://r2r.homelab.local/v3
    python scripts/r2r-sync.py --vcluster-version 0.33.0 --platform-version 4.8.0

Requires: Python 3.9+ (stdlib only, no pip dependencies).
"""

import argparse
import json
import os
import re
import ssl
import sys
import time
import uuid
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

# Deterministic UUID namespace — shared with obsidian sync script
UUID_NAMESPACE = uuid.UUID("a1b2c3d4-e5f6-7890-abcd-ef1234567890")

# --- Content extraction patterns ---

RE_FRONTMATTER = re.compile(r"^---\s*\n.*?\n---\s*\n", re.DOTALL)
RE_IMPORT = re.compile(r"^import\s+.+$", re.MULTILINE)
RE_JSX_SELF_CLOSING = re.compile(r"<[A-Z]\w+[^>]*/>", re.DOTALL)
RE_JSX_OPEN_TAG = re.compile(r"<([A-Z]\w+)[^>]*>")
RE_JSX_CLOSE_TAG = re.compile(r"</[A-Z]\w+>")
RE_HTML_COMMENT = re.compile(r"<!--.*?-->", re.DOTALL)
RE_EXCESS_NEWLINES = re.compile(r"\n{3,}")

# Minimum content length (chars) to bother indexing
MIN_CONTENT_LENGTH = 50

# R2R retry settings
MAX_RETRIES = 3
RETRY_BASE_DELAY = 1


def extract_frontmatter(content: str) -> tuple[dict, str]:
    """Parse YAML frontmatter and return (metadata, remaining_content)."""
    match = RE_FRONTMATTER.match(content)
    if not match:
        return {}, content

    metadata = {}
    for line in match.group(0).splitlines():
        if ":" in line and not line.strip().startswith("---"):
            key, _, value = line.partition(":")
            key = key.strip()
            value = value.strip().strip("\"'")
            if key and value:
                metadata[key] = value

    return metadata, content[match.end() :]


def strip_mdx(content: str) -> str:
    """Remove MDX artifacts, keeping prose and code blocks."""
    content = RE_IMPORT.sub("", content)
    content = RE_HTML_COMMENT.sub("", content)
    content = RE_JSX_SELF_CLOSING.sub("", content)
    content = RE_JSX_OPEN_TAG.sub("", content)
    content = RE_JSX_CLOSE_TAG.sub("", content)
    content = RE_EXCESS_NEWLINES.sub("\n\n", content)
    return content.strip()


def doc_uuid(path_key: str) -> str:
    """Deterministic UUID5 from document path."""
    return str(uuid.uuid5(UUID_NAMESPACE, f"vcluster-docs:{path_key}"))


def detect_product_version(rel_path: str) -> tuple[str, str]:
    """Return (product, version) from relative path."""
    parts = rel_path.split("/")
    if parts[0] == "vcluster_versioned_docs":
        return "vcluster", parts[1].removeprefix("version-")
    if parts[0] == "platform_versioned_docs":
        return "platform", parts[1].removeprefix("version-")
    return "unknown", "next"


def detect_section(rel_path: str) -> str:
    """Return top-level section name from path."""
    parts = rel_path.split("/")
    # Skip prefix: {product}_versioned_docs/version-X.Y.Z/<section>/...
    if "versioned_docs" in parts[0] and len(parts) > 2:
        return parts[2]
    return "root"


def construct_url(rel_path: str, product: str, version: str) -> str:
    """Build docs site URL from file path."""
    path = rel_path
    # Strip directory prefix
    for prefix in (
        f"vcluster_versioned_docs/version-{version}/",
        f"platform_versioned_docs/version-{version}/",
        "docs/",
    ):
        if path.startswith(prefix):
            path = path[len(prefix) :]
            break

    path = re.sub(r"\.mdx?$", "", path)
    if path.endswith("/index"):
        path = path[:-6]

    return f"https://www.vcluster.com/docs/{product}/{version}/{path}"


# --- R2R API ---

_ssl_ctx = ssl.create_default_context()
_ssl_ctx.check_hostname = False
_ssl_ctx.verify_mode = ssl.CERT_NONE


def _build_multipart(fields: dict[str, str]) -> tuple[bytes, str]:
    """Build multipart/form-data body from string fields."""
    boundary = f"----Boundary{uuid.uuid4().hex[:16]}"
    parts = []
    for key, value in fields.items():
        parts.append(
            f"--{boundary}\r\n"
            f'Content-Disposition: form-data; name="{key}"\r\n\r\n'
            f"{value}\r\n"
        )
    parts.append(f"--{boundary}--\r\n")
    return "".join(parts).encode("utf-8"), boundary


def r2r_request(url: str, method: str = "GET", fields: dict | None = None, timeout: int = 20):
    """HTTP request to R2R with retries."""
    for attempt in range(MAX_RETRIES):
        try:
            if fields:
                body, boundary = _build_multipart(fields)
                req = Request(url, data=body, method=method)
                req.add_header("Content-Type", f"multipart/form-data; boundary={boundary}")
            else:
                req = Request(url, method=method)

            with urlopen(req, timeout=timeout, context=_ssl_ctx) as resp:
                return json.loads(resp.read())
        except HTTPError as e:
            if e.code == 404 and method == "DELETE":
                return {"status": "not_found"}
            if e.code == 409:
                # "already exists" — retry after delete
                return {"status": "conflict"}
            if attempt < MAX_RETRIES - 1:
                time.sleep(RETRY_BASE_DELAY * (2**attempt))
                continue
            raise
        except (URLError, TimeoutError):
            if attempt < MAX_RETRIES - 1:
                time.sleep(RETRY_BASE_DELAY * (2**attempt))
                continue
            raise


def r2r_search(url: str, query: str, limit: int = 5, source_filter: str | None = None):
    """Search R2R vector store."""
    payload = {"query": query, "search_settings": {"limit": limit}}
    if source_filter:
        payload["search_settings"]["filters"] = {"source": {"$eq": source_filter}}

    body = json.dumps(payload).encode("utf-8")
    req = Request(f"{url}/retrieval/search", data=body, method="POST")
    req.add_header("Content-Type", "application/json")

    with urlopen(req, timeout=30, context=_ssl_ctx) as resp:
        return json.loads(resp.read())


# --- Sync logic ---


def find_content_files(base_dir: Path) -> list[Path]:
    """Find MDX files excluding partials and fragments."""
    return sorted(
        p
        for p in base_dir.rglob("*.mdx")
        if "_partials" not in p.parts and "_fragments" not in p.parts
    )


def sync_docs(
    docs_root: str,
    r2r_url: str,
    dry_run: bool = False,
    vcluster_version: str | None = None,
    platform_version: str | None = None,
) -> dict:
    root = Path(docs_root).resolve()
    targets = []

    if vcluster_version:
        vdir = root / "vcluster_versioned_docs" / f"version-{vcluster_version}"
        if vdir.exists():
            targets.append(("vcluster", vcluster_version, vdir))
        else:
            print(f"Warning: {vdir} not found", file=sys.stderr)

    if platform_version:
        pdir = root / "platform_versioned_docs" / f"version-{platform_version}"
        if pdir.exists():
            targets.append(("platform", platform_version, pdir))
        else:
            print(f"Warning: {pdir} not found", file=sys.stderr)

    if not targets:
        print("Error: no version directories found", file=sys.stderr)
        sys.exit(1)

    stats = {"synced": 0, "skipped": 0, "failed": 0, "total": 0}

    for product, version, base_dir in targets:
        files = find_content_files(base_dir)
        print(f"\n=== {product} v{version}: {len(files)} docs ===")
        stats["total"] += len(files)

        for mdx_file in files:
            rel_path = str(mdx_file.relative_to(root))
            raw = mdx_file.read_text(errors="replace")

            fm, prose = extract_frontmatter(raw)
            title = fm.get("title", mdx_file.stem.replace("-", " ").title())
            clean = strip_mdx(prose)

            if len(clean) < MIN_CONTENT_LENGTH:
                stats["skipped"] += 1
                continue

            did = doc_uuid(rel_path)
            section = detect_section(rel_path)
            url = construct_url(rel_path, product, version)

            metadata = json.dumps(
                {
                    "title": title,
                    "source": "vcluster-docs",
                    "product": product,
                    "version": version,
                    "section": section,
                    "url": url,
                    "path": rel_path,
                }
            )

            if dry_run:
                words = len(clean.split())
                print(f"  [{product}] {title} ({words}w) → {did[:8]}...")
                stats["synced"] += 1
                continue

            # Delete-then-create (idempotent upsert)
            try:
                r2r_request(f"{r2r_url}/documents/{did}", method="DELETE")
            except Exception:
                pass  # may not exist

            try:
                result = r2r_request(
                    f"{r2r_url}/documents",
                    method="POST",
                    fields={"id": did, "raw_text": clean, "metadata": metadata},
                )
                if result.get("results", {}).get("document_id"):
                    stats["synced"] += 1
                    print(f"  + {title}")
                else:
                    stats["failed"] += 1
                    print(f"  x {title}: {result}", file=sys.stderr)
            except Exception as e:
                stats["failed"] += 1
                print(f"  x {title}: {e}", file=sys.stderr)

    print(f"\n--- Results ---")
    print(
        f"Total: {stats['total']}, Synced: {stats['synced']}, "
        f"Skipped: {stats['skipped']}, Failed: {stats['failed']}"
    )
    return stats


def test_retrieval(r2r_url: str):
    """Run test queries and print results."""
    queries = [
        "how to sync nodes from host cluster",
        "configure sleep mode for virtual clusters",
        "vcluster architecture and components",
        "RBAC and permissions in platform projects",
        "how to back up and restore vcluster",
        "ingress access for virtual clusters",
        "configure networking and DNS in vcluster",
    ]

    print("\n=== Retrieval Quality Test ===\n")
    for query in queries:
        print(f"Q: {query}")
        try:
            result = r2r_search(r2r_url, query, limit=3, source_filter="vcluster-docs")
            chunks = result.get("results", {}).get("chunk_search_results", [])
            if not chunks:
                print("  (no results)\n")
                continue
            for i, chunk in enumerate(chunks):
                score = chunk.get("score", 0)
                meta = chunk.get("metadata", {})
                title = meta.get("title", "?")
                product = meta.get("product", "?")
                text = chunk.get("text", "")[:120].replace("\n", " ")
                print(f"  {i+1}. [{score:.3f}] ({product}) {title}")
                print(f"     {text}...")
            print()
        except Exception as e:
            print(f"  Error: {e}\n")


def main():
    parser = argparse.ArgumentParser(description="Sync vcluster-docs to R2R vector DB")
    parser.add_argument("--docs-root", default=".", help="Docs repo root (default: cwd)")
    parser.add_argument(
        "--r2r-url",
        default=os.environ.get("R2R_URL", "https://r2r.homelab.local/v3"),
        help="R2R API base URL",
    )
    parser.add_argument("--dry-run", action="store_true", help="Print without syncing")
    parser.add_argument("--vcluster-version", default="0.33.0")
    parser.add_argument("--platform-version", default="4.8.0")
    parser.add_argument("--test", action="store_true", help="Run retrieval quality test")
    args = parser.parse_args()

    if args.test:
        test_retrieval(args.r2r_url)
        return

    stats = sync_docs(
        args.docs_root,
        args.r2r_url,
        args.dry_run,
        args.vcluster_version,
        args.platform_version,
    )
    sys.exit(0 if stats["failed"] == 0 else 1)


if __name__ == "__main__":
    main()
