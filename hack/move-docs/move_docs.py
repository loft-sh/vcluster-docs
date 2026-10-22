#!/usr/bin/env python3
"""Move docs pages with git mv and rewrite links that point at them.

Usage: [SECTION=platform|vcluster|docs] [REDIRECTS_OUT=FILE] \\
       hack/move-docs/move_docs.py OLD=NEW [OLD=NEW ...]

OLD and NEW are paths relative to the repo root, files or directories, for
example platform/install=platform/administer/install. SECTION defaults to
platform and must be the tree (platform, vcluster, or docs) that every path
is in. NEW must not exist yet, and a moved file keeps its extension. All
pairs are checked before anything moves.

Rewrites, in every unversioned .md/.mdx under SECTION:
  * relative markdown links, imports, require() and src/href/to attributes
  * absolute links to moved pages (/docs/SECTION[/next]/..., or /docs/... for
    the root docs), converted to relative .mdx links (same-section rule)
In the other two trees, rewrites links to moved pages as
/docs/SECTION/next/<new route>, or /docs/<new route> for the root docs.
In all three trees, rewrites @site/ imports and requires of moved files,
including loader prefixes such as !!raw-loader!. Versioned docs that import a
moved file are listed as VERSIONED IMPORT but not changed.

Prints every change. Writes netlify.toml redirect entries to REDIRECTS_OUT
(skipping pages whose URL a slug pins) and warns when an existing rule would
match an old URL first. Doesn't edit versioned docs or netlify.toml; use
insert_redirects.py for netlify.toml.
"""
import os, re, subprocess, sys

ROOT = subprocess.check_output(["git", "rev-parse", "--show-toplevel"], text=True).strip()
os.chdir(ROOT)
SECTION = os.environ.get("SECTION", "platform")
if SECTION not in ("platform", "vcluster", "docs"):
    sys.exit(f"SECTION must be platform, vcluster, or docs, not {SECTION!r}")

# URL layout. The root docs plugin serves docs/ at /docs/<route> with no /next/
# and no versions. The product plugins serve /docs/<product>[/next]/<route>.
if SECTION == "docs":
    URL_RE = r"/docs/"
    NEXT_BASE = "/docs"
    REDIRECT_PREFIXES = ["/docs/"]
else:
    URL_RE = r"/docs/" + SECTION + r"/(?:next/)?"
    NEXT_BASE = f"/docs/{SECTION}/next"
    REDIRECT_PREFIXES = [f"/docs/{SECTION}/next/"]
    if SECTION == "vcluster":  # stable redirects stay dormant until the release removes the old page
        REDIRECT_PREFIXES.append(f"/docs/{SECTION}/")

pairs = [a.split("=", 1) for a in sys.argv[1:]]
if not pairs or any(len(p) != 2 for p in pairs):
    sys.exit(__doc__)

# Validate every pair before touching anything, so a bad pair can't leave a half-done move.
errors = []
for old, new in pairs:
    old, new = old.rstrip("/"), new.rstrip("/")
    for p in (old, new):
        if not p.startswith(SECTION + "/"):
            errors.append(f"{p} is outside {SECTION}/ (set SECTION to match the paths)")
    if not os.path.exists(old):
        errors.append(f"missing: {old}")
    if os.path.lexists(new):
        errors.append(f"destination already exists: {new} (git mv would nest {old} inside it)")
    if os.path.isfile(old) and os.path.splitext(old)[1] != os.path.splitext(new)[1]:
        errors.append(f"{new} must keep the extension of {old}")
if errors:
    sys.exit("\n".join(errors))

# Expand moves into a file map before moving anything.
fmap = {}
for old, new in pairs:
    old, new = old.rstrip("/"), new.rstrip("/")
    if os.path.isdir(old):
        for dp, _, fns in os.walk(old):
            for fn in fns:
                src = os.path.join(dp, fn)
                fmap[src] = new + src[len(old):]
    elif os.path.isfile(old):
        fmap[old] = new
    else:
        sys.exit(f"missing: {old}")
dmap = {o.rstrip("/"): n.rstrip("/") for o, n in pairs if os.path.isdir(o)}
inv = {v: k for k, v in fmap.items()}

for old, new in pairs:
    os.makedirs(os.path.dirname(new.rstrip("/")), exist_ok=True)
    subprocess.check_call(["git", "mv", old.rstrip("/"), new.rstrip("/")])


def remap(path):
    path = os.path.normpath(path)
    if path in fmap:
        return fmap[path]
    if path + ".mdx" in fmap:  # suffix-less link (JSX <Link to>, reference defs)
        return fmap[path + ".mdx"][:-4]
    for o, n in dmap.items():
        if path == o or path.startswith(o + "/"):
            return n + path[len(o):]
    return path


def route_to_file(route):
    """Old route (no /docs/platform prefix) -> old source file, if it moved."""
    route = route.strip("/")
    base = f"{SECTION}/{route}" if route else SECTION
    for cand in (base + ".mdx", base + ".md", base + "/index.mdx", base + "/README.mdx"):
        if cand in fmap:
            return cand
    for src in fmap:  # slug overrides
        if src.endswith((".md", ".mdx")) and os.path.isfile(fmap[src]):
            with open(fmap[src]) as fh:
                m = re.search(r"^slug:\s*['\"]?(/[^'\"\n]+)", fh.read(), re.M)
            if m and m.group(1).strip("/") == route:
                return src
    return None


REL = re.compile(r"""(?m)(?P<pre>^\[[^\]]+\]:\s*|\]\(|from\s+['"]|import\s+['"]|require\(\s*['"]|(?:src|href|to)=\{?['"])(?P<url>\.{1,2}/[^)'"\s]*|[\w-]+\.mdx?(?:#[^)'"\s]*)?)""")
ABS = re.compile(r"""(?P<pre>\]\()(?P<url>(?:https?://(?:www\.)?vcluster\.com)?""" + URL_RE + r"""(?P<route>[^)#?\s]*)(?P<frag>#[^)\s]*)?)\)""")

changed = 0
for dp, dirs, fns in os.walk(SECTION):
    for fn in fns:
        if not fn.endswith((".md", ".mdx")):
            continue
        cur = os.path.join(dp, fn)          # current (post-move) path
        orig = inv.get(cur, cur)            # where it lived before the move
        with open(cur) as fh:
            text = fh.read()
        new_text = text

        def fix_rel(m):
            url = m.group("url")
            path, sep, frag = url.partition("#")
            if not path:
                return m.group(0)
            target_old = os.path.normpath(os.path.join(os.path.dirname(orig), path))
            target_new = remap(target_old)
            rel = os.path.relpath(target_new, os.path.dirname(cur))
            if path.endswith("/") and not rel.endswith("/"):
                rel += "/"
            if path.startswith("./") and not rel.startswith("."):
                rel = "./" + rel
            elif not rel.startswith(".") and path.startswith("../"):
                rel = "./" + rel
            if os.path.normpath(rel) == os.path.normpath(path):
                return m.group(0)
            return m.group("pre") + rel + sep + frag

        def fix_abs(m):
            src = route_to_file(m.group("route"))
            if not src:
                return m.group(0)
            rel = os.path.relpath(fmap[src], os.path.dirname(cur))
            if not rel.startswith("."):
                rel = "./" + rel
            return m.group("pre") + rel + (m.group("frag") or "") + ")"

        new_text = REL.sub(fix_rel, new_text)
        new_text = ABS.sub(fix_abs, new_text)
        if new_text != text:
            with open(cur, "w") as fh:
                fh.write(new_text)
            a, b = text.splitlines(), new_text.splitlines()
            for i, (x, y) in enumerate(zip(a, b)):
                if x != y:
                    changed += 1
                    print(f"{cur}:{i+1}\n  - {x.strip()[:160]}\n  + {y.strip()[:160]}")

def slug_of(path):
    try:
        with open(path) as fh:
            m = re.search(r"^slug:\s*['\"]?(/[^'\"\n]*)", fh.read(), re.M)
        return m.group(1).strip("/") if m else None
    except FileNotFoundError:
        return None


def route_of(path, slug=None):
    if slug is not None:
        return slug
    r = re.sub(r"\.mdx?$", "", path[len(SECTION) + 1:])
    return re.sub(r"(^|/)(index|README)$", "", r)


# Cross-section links (the other two trees) -> NEXT_BASE/<new route>
XABS = re.compile(r"(?P<url>(?:https?://(?:www\.)?vcluster\.com)?" + URL_RE + r"(?P<route>[A-Za-z][^)\s\"'#?]*?))(?P<end>/?(?:#[^)\s\"']*)?(?=[)\s\"']))")
for top in [t for t in ("platform", "vcluster", "docs") if t != SECTION]:
    for dp, dirs, fns in os.walk(top):
        for fn in fns:
            if not fn.endswith((".md", ".mdx")):
                continue
            cur = os.path.join(dp, fn)
            text = open(cur).read()
            def fix_x(m):
                route = m.group("route").rstrip("/")
                if re.match(r"\d+\.\d+", route):
                    return m.group(0)
                src = route_to_file(route)
                if not src:
                    return m.group(0)
                new = route_of(fmap[src], slug_of(fmap[src]))
                frag = m.group("end").lstrip("/")
                return f"{NEXT_BASE}/{new}{frag}"
            new_text = XABS.sub(fix_x, text)
            if new_text != text:
                open(cur, "w").write(new_text)
                for i, (x, y) in enumerate(zip(text.splitlines(), new_text.splitlines())):
                    if x != y:
                        changed += 1
                        print(f"{cur}:{i+1}\n  - {x.strip()[:160]}\n  + {y.strip()[:160]}")

# @site/ imports and requires of moved files, including loader prefixes such as
# !!raw-loader!. Unversioned trees are rewritten; versioned docs are only reported.
SITE = re.compile(r"""(?P<pre>['"](?:!![\w-]+!)?@site/)(?P<path>(?:platform|vcluster|docs)/[^'"\s]+)(?P<post>['"])""")


def fix_site(m):
    new = remap(m.group("path"))
    if new == os.path.normpath(m.group("path")):
        return m.group(0)
    return m.group("pre") + new + m.group("post")


for top in ("platform", "vcluster", "docs"):
    for dp, dirs, fns in os.walk(top):
        for fn in fns:
            if not fn.endswith((".md", ".mdx")):
                continue
            cur = os.path.join(dp, fn)
            text = open(cur).read()
            new_text = SITE.sub(fix_site, text)
            if new_text != text:
                open(cur, "w").write(new_text)
                for i, (x, y) in enumerate(zip(text.splitlines(), new_text.splitlines())):
                    if x != y:
                        changed += 1
                        print(f"{cur}:{i+1}\n  - {x.strip()[:160]}\n  + {y.strip()[:160]}")

for top in ("vcluster_versioned_docs", "platform_versioned_docs"):
    for dp, dirs, fns in os.walk(top):
        for fn in fns:
            if not fn.endswith((".md", ".mdx")):
                continue
            cur = os.path.join(dp, fn)
            for i, line in enumerate(open(cur), 1):
                for m in SITE.finditer(line):
                    if fix_site(m) != m.group(0):
                        print(f"VERSIONED IMPORT: {cur}:{i} imports @site/{m.group('path')}, "
                              "which moved. Not changed; that version's build breaks until it's fixed by hand.")

# Redirect entries for netlify.toml (file-path URL, plus slug URL when it differs)
red = []
for src, dst in sorted(fmap.items()):
    if not src.endswith((".md", ".mdx")) or "/_" in src:
        continue
    if slug_of(dst) is not None:
        continue  # slug pins the URL, nothing moved
    for pre in REDIRECT_PREFIXES:
        o, n = pre + route_of(src), pre + route_of(dst, slug_of(dst))
        if o != n:
            red.append((src, dst, o, n))
with open(os.environ.get("REDIRECTS_OUT", "/dev/null"), "w") as fh:
    for s, d, o, n in red:
        fh.write(f'# Renamed: {s} -> {d}\n[[redirects]]\n  from = "{o}"\n  to = "{n}"\n  status = 301\n\n')
print(f"\n{len(fmap)} files moved, {changed} lines rewritten, {len(red)} redirects")

# Warn about existing netlify.toml rules that match an old URL first (Netlify: first match wins).
import fnmatch
_rules = re.findall(r'\[\[redirects\]\][^\[]*?from\s*=\s*"([^"]+)"[^\[]*?to\s*=\s*"([^"]+)"',
                    open("netlify.toml").read(), re.S)
for _s, _d, _o, _n in red:
    for _f, _to in _rules:
        _pat = re.sub(r":[a-z]+", "*", _f)
        if _f == _o or ("*" in _pat and _f != "/*" and fnmatch.fnmatch(_o, _pat)):
            print(f"SHADOW: {_o} already matched by {_f} -> {_to}; place the new rule above it")
            break
