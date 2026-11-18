#!/usr/bin/env python3
"""Generate the vCluster 0.38 and Platform 5.0 release hurl tests.

The tests check a deployed site after the release PR merges: the version flip,
every former stable route that check-redirects found, and every Platform UI
permalink key, for the versions each UI generation sends.

Inputs:
  netlify.toml                     permalink keys are read from it
  a `check-redirects.sh pr` log    the "former stable route" pairs (Check C)

Usage, from the repo root on the release branch:
  GITHUB_BASE_REF=main bash hack/check-redirects.sh pr > /tmp/check-redirects.log
  python3 hack/cutover/gen-release-hurl.py /tmp/check-redirects.log [BASE_REF]

BASE_REF (default origin/main) is the previous stable release's branch. Its
netlify.toml decides which permalink keys older UIs can send.

Then run, for example:
  hurl --test --jobs 8 --variable BASE_URL=https://www.vcluster.com \\
    hack/test-vcluster-0.38.hurl hack/test-platform-5.0.hurl
"""
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

PRODUCTS = {
    "vcluster": {
        "file": "hack/test-vcluster-0.38.hurl",
        "title": "vCluster 0.38 release tests",
        "stable": "0.38.0",
        "previous": "0.37.0",
        "stable_label": "v0.38 Stable",
        "previous_label": "v0.37 (LTS)",
        "sample_page": "overview/architecture",
    },
    "platform": {
        "file": "hack/test-platform-5.0.hurl",
        "title": "Platform 5.0 release tests",
        "stable": "5.0.0",
        "previous": "4.12.0",
        "stable_label": "v5.0 Stable",
        "previous_label": "v4.12 (LTS)",
        "sample_page": "tenants/manage-tenants/overview",
    },
}

BANNER = "is a limited availability release"


def removed_routes(log_text):
    pat = re.compile(r"former stable route: (/docs/(\w+)/\S+) -> (\S+)")
    routes = {"vcluster": [], "platform": []}
    for m in pat.finditer(log_text):
        if m.group(2) in routes:
            routes[m.group(2)].append((m.group(1), m.group(3)))
    return routes


def permalink_keys(toml_text):
    """Return {product: sorted keys}. A key can have several segments
    (crd/project); the version suffix (/next, /5.0.0, /:version) is dropped."""
    keys = {"vcluster": set(), "platform": set()}
    for m in re.finditer(r'from\s*=\s*"/docs/platform-ui-link/(platform|vcluster)/([^"]+)"', toml_text):
        key = re.sub(r"/(:version|next|\d+\.\d+\.\d+)$", "", m.group(2))
        if "*" not in key and ":" not in key:
            keys[m.group(1)].add(key)
    return {k: sorted(v) for k, v in keys.items()}


def released_keys(base_ref):
    """Keys the previous stable netlify.toml already had. Only those can come
    from an older UI, so only they get a /<previous version> test."""
    text = subprocess.run(["git", "show", f"{base_ref}:netlify.toml"], cwd=ROOT,
                          capture_output=True, text=True, check=True).stdout
    return permalink_keys(text)


def version_flip(p, cfg):
    s, prev = cfg["stable"], cfg["previous"]
    return f"""# =====================================================
# Version flip: {s} is lastVersion, {prev} stays reachable
# =====================================================

# Unversioned docs serve {s}, labeled stable, with the limited availability banner
GET {{{{BASE_URL}}}}/docs/{p}/
[Options]
location: true
HTTP 200
[Asserts]
xpath "string(//meta[@name='docusaurus_version']/@content)" == "{s}"
xpath "string(//meta[@name='docsearch:version_label']/@content)" == "{cfg['stable_label']}"
body contains "{BANNER}"

# Pinned {s} URLs collapse to the unversioned URL
GET {{{{BASE_URL}}}}/docs/{p}/{s}/{cfg['sample_page']}
HTTP 301
[Asserts]
header "Location" contains "/docs/{p}/{cfg['sample_page']}"
header "Location" not contains "/{s}/"

# The {s} sample page loads as {s}, with the banner
GET {{{{BASE_URL}}}}/docs/{p}/{cfg['sample_page']}
[Options]
location: true
HTTP 200
[Asserts]
xpath "string(//meta[@name='docusaurus_version']/@content)" == "{s}"
body contains "{BANNER}"

# {prev} is still served under its version segment, labeled LTS, without the banner
GET {{{{BASE_URL}}}}/docs/{p}/{prev}/
[Options]
location: true
HTTP 200
[Asserts]
xpath "string(//meta[@name='docusaurus_version']/@content)" == "{prev}"
xpath "string(//meta[@name='docsearch:version_label']/@content)" == "{cfg['previous_label']}"
body not contains "{BANNER}"

# /next/ serves the unreleased version, without the banner
GET {{{{BASE_URL}}}}/docs/{p}/next/
[Options]
location: true
HTTP 200
[Asserts]
xpath "string(//meta[@name='docusaurus_version']/@content)" == "current"
body not contains "{BANNER}"

"""


def route_tests(routes):
    out = ["# =====================================================",
           "# Former stable routes (check-redirects Check C)",
           "# Each must land on its new page in one redirect, with no 404",
           "# =====================================================", ""]
    for src, dst in routes:
        out += [f"GET {{{{BASE_URL}}}}{src}",
                "[Options]", "location: true",
                "HTTP 200",
                "[Asserts]",
                f'url contains "{dst}"', ""]
    return out


def permalink_tests(p, cfg, keys, old_keys):
    s, prev = cfg["stable"], cfg["previous"]
    out = ["# =====================================================",
           f"# Platform UI permalinks: /docs/platform-ui-link/{p}/<key>",
           f"# Unversioned and /{s} links (the GA UI) must reach a page without /next/.",
           f"# /next links (pre-release UIs) must reach a page, and so must /{prev} links",
           "# for keys that the previous stable release already had (older UIs).",
           "# =====================================================", ""]
    for key in keys:
        base = f"/docs/platform-ui-link/{p}/{key}"
        variants = [("", True), (f"/{s}", True), ("/next", False)]
        if key in old_keys:
            variants.append((f"/{prev}", False))
        for suffix, stable in variants:
            out += [f"GET {{{{BASE_URL}}}}{base}{suffix}",
                    "[Options]", "location: true",
                    "HTTP 200"]
            if stable:
                out += ["[Asserts]", 'url not contains "/next/"']
            out.append("")
    return out


def main():
    if len(sys.argv) not in (2, 3):
        sys.exit(__doc__)
    routes = removed_routes(Path(sys.argv[1]).read_text())
    keys = permalink_keys((ROOT / "netlify.toml").read_text())
    old_keys = released_keys(sys.argv[2] if len(sys.argv) == 3 else "origin/main")
    for p, cfg in PRODUCTS.items():
        if not routes[p]:
            sys.exit(f"No former stable routes for {p} in the log. Is it a `check-redirects.sh pr` log against main?")
        header = [f"# {cfg['title']}",
                  "# Generated by hack/cutover/gen-release-hurl.py. Regenerate instead of editing.",
                  f"# Usage: hurl --test --jobs 8 --variable BASE_URL=https://www.vcluster.com {cfg['file']}",
                  "# For a password-protected preview, authenticate first with hack/netlify-auth.hurl",
                  "# and pass the same --cookie-jar to both runs.", ""]
        body = header + [version_flip(p, cfg)] + route_tests(routes[p]) + permalink_tests(p, cfg, keys[p], set(old_keys[p]))
        (ROOT / cfg["file"]).write_text("\n".join(body))
        print(f"{cfg['file']}: {len(routes[p])} routes, {len(keys[p])} permalink keys")


if __name__ == "__main__":
    main()
