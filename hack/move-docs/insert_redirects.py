#!/usr/bin/env python3
"""Insert a redirect block from move_docs.py into netlify.toml.

Usage: hack/move-docs/insert_redirects.py BLOCK_FILE "comment for the block"

Inserts the block above the AUTO-GENERATED REDIRECTS START marker, retargets
existing rules whose `to` points at a moved URL, and drops any self-redirects
that the retarget creates.
"""
import os, re, subprocess, sys

if len(sys.argv) != 3:
    sys.exit(__doc__)
os.chdir(subprocess.check_output(["git", "rev-parse", "--show-toplevel"], text=True).strip())

block, comment = open(sys.argv[1]).read(), sys.argv[2]
pairs = re.findall(r'from = "([^"]+)"\n  to = "([^"]+)"', block)
t = open("netlify.toml").read()
if "# AUTO-GENERATED REDIRECTS START" not in t:
    sys.exit("netlify.toml has no '# AUTO-GENERATED REDIRECTS START' marker")
n = 0
for o, nw in pairs:
    for suf in ('"', '#'):
        c = t.count(f'to = "{o}{suf}')
        if c:
            n += c
            t = t.replace(f'to = "{o}{suf}', f'to = "{nw}{suf}')
# Drop rules that the retarget turned into self-redirects (from == to).
t, k = re.subn(r'\[\[redirects\]\]\n  from = "([^"]+)"\n  to = "\1"\n  status = 301\n\n', "", t)
if k:
    print(f"removed {k} self-redirect(s) created by retargeting")
t = t.replace("# AUTO-GENERATED REDIRECTS START", f"# {comment}\n{block}# AUTO-GENERATED REDIRECTS START", 1)
open("netlify.toml", "w").write(t)
print(f"{len(pairs)} added; {n} existing targets retargeted")
