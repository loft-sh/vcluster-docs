#!/usr/bin/env python3
"""List relative links and imports that don't resolve to a file.

Usage: hack/move-docs/check_rel.py DIR [DIR ...]   (for example: platform vcluster docs)

Run it before and after a move and compare the counts, since a few
unresolved links are known and pre-existing.
"""
import os, re, subprocess, sys

if len(sys.argv) < 2:
    sys.exit(__doc__)
os.chdir(subprocess.check_output(["git", "rev-parse", "--show-toplevel"], text=True).strip())

REL = re.compile(r"""(?m)(?:^\[[^\]]+\]:\s*|\]\(|from\s+['"]|import\s+['"]|require\(\s*['"]|(?:src|href|to)=\{?['"])(\.{1,2}/[^)'"\s#]*|[\w-]+\.mdx?)""")
bad = 0
for top in sys.argv[1:]:
    for dp, _, fns in os.walk(top):
        for fn in fns:
            if not fn.endswith((".md", ".mdx")): continue
            f = os.path.join(dp, fn)
            for i, line in enumerate(open(f), 1):
                for m in REL.finditer(line):
                    p = os.path.normpath(os.path.join(dp, m.group(1)))
                    if not (os.path.exists(p) or os.path.exists(p + ".mdx") or os.path.exists(p + ".md")):
                        bad += 1; print(f"{f}:{i}: {m.group(1)}")
print("unresolved:", bad)
