#!/usr/bin/env python3
"""
find-spa-broken-links.py

Finds relative markdown links without .mdx/.md suffix whose build-time URL
(resolved against file path) differs from click-time URL (resolved against
page URL). A mismatch means the link 404s on SPA click.

Mechanism: Docusaurus rewrites relative markdown links to absolute routes at
build time, but only if they end in .mdx/.md. Without the suffix, the raw
string survives into the compiled bundle and the browser resolves it against
window.location at click time. The trailing slash on page URLs causes path
resolution to differ from file-path-based resolution.

Usage:
    python3 scripts/find-spa-broken-links.py [ROOT_DIR]

    ROOT_DIR defaults to vcluster_versioned_docs/version-0.33.0
    Also accepts 'vcluster' for main/next docs.

Exit codes:
    0 - no broken links found
    1 - broken links found (CI blocker)
"""
import re
import sys
import pathlib
from urllib.parse import urljoin

ROOT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'vcluster_versioned_docs/version-0.33.0')
PROD_PREFIX = '/docs/vcluster'

# Known broken links that cannot take .mdx suffix without breaking the build.
# These are pre-existing issues where the target file doesn't exist (auto-generated
# CLI pages), has a numbered filename prefix (1-control-plane-components.mdx), or
# the target directory was removed (quick-start). Each entry is (file_suffix, link).
KNOWN_EXCEPTIONS = {
    ('deploy/control-plane/binary/basics.mdx', '../../../cli/vcluster_platform_connect_vcluster'),
    ('deploy/control-plane/binary/high-availability.mdx', '../../../cli/vcluster_platform_connect_vcluster'),
    ('introduction/oss-vs-free.mdx', '../quick-start'),
    ('hardening-guide/host-nodes/self-assessment.mdx', './control-plane-components'),
    ('hardening-guide/host-nodes/self-assessment.mdx', './etcd'),
    ('hardening-guide/host-nodes/self-assessment.mdx', './control-plane'),
    ('hardening-guide/host-nodes/self-assessment.mdx', './worker-node'),
    ('hardening-guide/host-nodes/self-assessment.mdx', './policies'),
    ('hardening-guide/private-nodes/self-assessment.mdx', './control-plane-components'),
    ('hardening-guide/private-nodes/self-assessment.mdx', './etcd'),
    ('hardening-guide/private-nodes/self-assessment.mdx', './control-plane'),
    ('hardening-guide/private-nodes/self-assessment.mdx', './worker-node'),
    ('hardening-guide/private-nodes/self-assessment.mdx', './policies'),
}


def file_to_url(p):
    rel = p.relative_to(ROOT).as_posix()
    if rel.endswith('.mdx'):
        rel = rel[:-4]
    if rel.endswith('/README'):
        rel = rel[:-7]
    if rel == 'README':
        rel = ''
    u = PROD_PREFIX + '/' + rel
    return u if u.endswith('/') else u + '/'


def resolve_build(p, link):
    t = (p.parent / link).resolve()
    try:
        rel = t.relative_to(ROOT.resolve()).as_posix()
    except ValueError:
        return '<outside>'
    return PROD_PREFIX + '/' + rel + ('/' if link.endswith('/') else '')


# Match relative markdown links like ](../path) or ](./path)
pattern = re.compile(r'\]\((\.\./[^)#\s]+|\.\/[^)#\s]+)\)')

live = []
fragment = []
coincidental = []

for p in sorted(ROOT.rglob('*.mdx')):
    is_fragment = '_fragments/' in str(p) or '_partials/' in str(p)
    page_url = file_to_url(p)

    for ln, line in enumerate(p.read_text().splitlines(), 1):
        # Skip lines inside import statements or JSX component props
        stripped = line.strip()
        if stripped.startswith('import '):
            continue

        for m in pattern.finditer(line):
            t = m.group(1)

            # Skip links that already have .mdx/.md suffix
            if re.search(r'\.(mdx|md)$', t):
                continue

            # Skip external-looking paths and anchors
            if t.startswith('http') or t.startswith('#'):
                continue

            # Check if this link is in the known-exceptions list
            rel_file = str(p).replace(str(ROOT) + '/', '')
            is_exception = any(
                rel_file.endswith(f) and t == link
                for f, link in KNOWN_EXCEPTIONS
            )
            if is_exception:
                continue

            b = resolve_build(p, t).rstrip('/')
            c = urljoin('https://x' + page_url, t).replace('https://x', '').rstrip('/')

            entry = (rel_file, ln, t, b, c)

            if is_fragment:
                fragment.append(entry)
            elif b != c:
                live.append(entry)
            else:
                coincidental.append(entry)

# Output
print(f'LIVE-BROKEN: {len(live)}')
for f, ln, t, b, c in live:
    print(f'  {f}:{ln}  {t}  ->  click goes to {c}  (expected {b})')

if fragment:
    print(f'\nFRAGMENT/PARTIAL: {len(fragment)}')
    for f, ln, t, b, c in fragment:
        status = 'MISMATCH' if b != c else 'coincidental'
        print(f'  {f}:{ln}  {t}  [{status}]')

if coincidental:
    print(f'\nCOINCIDENTAL (work by URL-depth accident): {len(coincidental)}')
    for f, ln, t, b, c in coincidental:
        print(f'  {f}:{ln}  {t}')

print(f'\nTotal: {len(live)} broken, {len(fragment)} fragment, {len(coincidental)} coincidental')

sys.exit(1 if live else 0)
