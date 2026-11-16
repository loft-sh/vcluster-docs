#!/usr/bin/env python3
"""Apply the Platform 5.0 cutover redirects to netlify.toml (DOC-1854).

Run once on the cutover branch, after `lastVersion` moves to 5.0.0:

    python3 hack/cutover/platform-50-redirects.py

It does five things:

1. Retargets each unversioned /docs/platform-ui-link/platform/<key> route that
   has an exact /next route to that /next target without /next/, and adds an
   exact /<key>/5.0.0 route ahead of the generic /:version route. Without it,
   the 5.0 GA UI's /5.0.0 links fall through to the 4.12 paths. The generic
   routes stay on the 4.12 IA for 4.9 to 4.12 UIs. A /next target that is
   already pinned to a version (a page removed in 5.0) is used as is.
2. Adds the same exact /5.0.0 route for keys without a /next route, using the
   unversioned target with any /next/ removed. Without it, the /5.0.0 link
   only works by chaining through the /docs/platform/5.0.0/* stable redirect.
3. Finishes the Stacks permalink. The 4.12 UI sends this key too, so 4.12.0
   gets an exact route to the 4.12 page.
4. Retargets dormant rules that wake up once 4.12 no longer serves a page at
   their `from`, and that would point at a path 5.0 doesn't have.
5. Adds a stable redirect for every 4.12 route that 5.0 no longer serves and
   that has no unversioned rule yet. Each one is the route's /next/ rule with
   /next/ removed, inserted right after it. Check C blocks the release PR
   without them. Older rules that targeted one of those retired paths are
   pointed straight at the new target, so they don't chain. Rules that sent a
   5.0 page's path back to 4.12 are dropped.

The script refuses to run twice: it exits if a /5.0.0 route already exists.
"""
import os
import re
import sys

PATH = "netlify.toml"
OLD_DOCS = "platform_versioned_docs/version-4.12.0"
NEW_DOCS = "platform"
UI = "/docs/platform-ui-link/platform/"

# Keys left alone, with the reason.
SKIP = {
    # vCluster pages; vcluster-038-redirects.py handles them.
    "sleep-mode",
    "working-with-sleep-mode",
    # Pinned to 4.12.0 on purpose; BCM was removed in 5.0 (#3106).
    "bcm-credentials",
    # Handled in step 3.
    "stacks",
}

# Dormant rules: from -> new target. Each comment says why.
DORMANT = {
    # 4.12 serves a page here today, so the rule never fires.
    "/docs/platform/integrations/argocd": "/docs/platform/integrations/gitops-cicd/argocd",
    "/docs/platform/administer/clusters/advanced/derp-relay": "/docs/platform/administer/control-plane-clusters/networking/derp-relay",
    "/docs/platform/how-to/disable-local-admin": "/docs/platform/administer/authentication/disable-local-admin",
    # Points at the 4.12 maintenance/ page; 5.0 split it in two (#2993). The
    # combined page's restore anchor is kept on the backup page as a signpost.
    "/docs/platform/administer/backup-restore/backup-restore-platform": "/docs/platform/administer/backup-restore/backup-platform",
    # The Argo CD v1 legacy page is gone from 5.0 (#3116); keep it on 4.12.
    "/pro/docs/projects/argocd": "/docs/platform/4.12.0/integrations/argocd/legacy",
    "/pro/docs/virtual-clusters/argocd": "/docs/platform/4.12.0/integrations/argocd/legacy",
}

RULE = r'(\[\[redirects\]\]\n[ \t]*from[ \t]*=[ \t]*"{frm}"\n[ \t]*to[ \t]*=[ \t]*")([^"]*)(")'


def die(msg):
    sys.exit(f"error: {msg}")


def target(s, frm):
    m = re.search(RULE.format(frm=re.escape(frm)), s)
    return m.group(2) if m else None


def set_target(s, frm, to):
    pat = re.compile(RULE.format(frm=re.escape(frm)))
    s, n = pat.subn(lambda m: m.group(1) + to + m.group(3), s, count=1)
    if n != 1:
        die(f"no rule from {frm}")
    return s


def add_exact(s, base, to, version="5.0.0"):
    """Insert an exact /<version> route ahead of the generic /:version route."""
    generic = re.compile(
        r'\[\[redirects\]\]\n[ \t]*from[ \t]*=[ \t]*"' + re.escape(base) + r'/:version"'
    )
    m = generic.search(s)
    if not m:
        die(f"no generic rule for {base}/:version")
    exact = f'[[redirects]]\n  from = "{base}/{version}"\n  to = "{to}"\n\n'
    return s[: m.start()] + exact + s[m.start():]


def routes(root):
    """Docs routes under root, relative to the version base, without slashes."""
    out = set()
    for d, dirs, files in os.walk(root):
        dirs[:] = [x for x in dirs if not x.startswith("_")]
        for f in files:
            if f.startswith("_") or not f.endswith((".md", ".mdx")):
                continue
            rel = os.path.relpath(os.path.join(d, f), root)
            base = re.sub(r"\.mdx?$", "", rel)
            parts = base.split("/")
            # README, index, and foo/foo.mdx are the category index.
            if parts[-1] in ("README", "index") or (len(parts) > 1 and parts[-1] == parts[-2]):
                parts = parts[:-1]
            parts = [re.sub(r"^\d+-", "", x) for x in parts]
            route = "/".join(parts)
            with open(os.path.join(d, f), errors="ignore") as fh:
                m = re.search(r"^slug:[ \t]*[\"']?([^\"'\n]+)", fh.read(4000), re.M)
            if m:
                slug = m.group(1).strip()
                route = slug if slug.startswith("/") else "/".join(parts[:-1] + [slug])
            out.add(route.strip("/"))
    return out


def add_stable(s):
    """Step 5: stable redirects for 4.12 routes that 5.0 no longer serves."""
    added = 0
    moved = {}
    current = routes(NEW_DOCS)
    for route in sorted(routes(OLD_DOCS) - current):
        frm = "/docs/platform/" + route
        if target(s, frm) is not None or target(s, frm + "/") is not None:
            continue
        nxt = "/docs/platform/next/" + route
        m = re.search(RULE.format(frm=re.escape(nxt)) + r"[^\n]*\n(?:[ \t]*\w+[ \t]*=[^\n]*\n)*", s)
        if not m:
            die(f"{frm} has no stable rule and no /next/ rule to copy")
        to = m.group(2)
        if to.startswith("/docs/platform/next/"):
            to = to.replace("/next/", "/", 1)
        elif not re.match(r"/docs/platform/\d+\.\d+\.\d+/", to):
            die(f"{nxt} has an unexpected target: {to}")
        rule = (
            "\n# DOC-1854: stable redirect, added at the 5.0 cutover\n"
            f'[[redirects]]\n  from = "{frm}"\n  to = "{to}"\n  status = 301\n'
        )
        s = s[: m.end()] + rule + s[m.end():]
        moved[frm] = to
        added += 1

    # Retarget older rules that point at a retired 4.12 path, so they don't
    # chain through the new redirect. Version-pinned and /next/ rules keep
    # their targets. A rule whose `from` is a 5.0 page is dropped instead: it
    # only ever sent the 5.0 path back to 4.12, and the 5.0 page shadows it.
    retargeted = dropped = 0

    def flatten(m):
        nonlocal retargeted, dropped
        frm, to = m.group(2), m.group(3)
        path, _, anchor = to.partition("#")
        new = moved.get(path.rstrip("/"))
        if new is None or frm in moved or re.search(r"/docs/platform/(next|\d+\.\d+\.\d+|\*|:)", frm):
            return m.group(0)
        if frm.startswith("/docs/platform/") and frm[len("/docs/platform/"):].strip("/") in current:
            dropped += 1
            return ""
        if anchor:
            new = new.partition("#")[0] + "#" + anchor
        retargeted += 1
        return m.group(1) + new + m.group(4)

    s = re.sub(
        r'(\[\[redirects\]\]\n[ \t]*from[ \t]*=[ \t]*"([^"]+)"\n[ \t]*to[ \t]*=[ \t]*")([^"]*)("[^\n]*\n(?:[ \t]*\w+[ \t]*=[^\n]*\n)*\n?)',
        flatten,
        s,
    )
    return s, added, retargeted, dropped


def main():
    s = open(PATH).read()
    if re.search(r'from = "' + re.escape(UI) + r'[^"]+/5\.0\.0"', s):
        die("a /5.0.0 permalink route already exists; has this already run?")

    keys = sorted(
        {
            f[len(UI):-len("/next")]
            for f in re.findall(r'from[ \t]*=[ \t]*"(' + re.escape(UI) + r'[^"]+/next)"', s)
        }
    )
    done = 0
    for key in keys:
        if key in SKIP:
            continue
        base = UI + key
        nxt = target(s, base + "/next")
        if not nxt:
            die(f"{base}/next has no target")
        if "/next/" in nxt:
            stable = nxt.replace("/next/", "/", 1)
        elif re.match(r"/docs/platform/\d+\.\d+\.\d+/", nxt):
            # Removed in 5.0 and pinned to an older version (#3107, #3116).
            stable = nxt
        else:
            die(f"{base}/next has no /next/ or pinned target: {nxt}")
        if target(s, base) is None:
            die(f"no unversioned rule for {base}")
        s = set_target(s, base, stable)
        s = add_exact(s, base, stable)
        done += 1

    # Keys without a /next route.
    unversioned = {
        f[len(UI):]
        for f in re.findall(r'from[ \t]*=[ \t]*"(' + re.escape(UI) + r'[^"]+)"', s)
        if not re.search(r"/(:version|next|\d+\.\d+\.\d+)$", f)
    }
    extra = 0
    for key in sorted(unversioned - set(keys) - SKIP):
        base = UI + key
        cur = target(s, base)
        if cur is None or not cur.startswith("/docs/platform/"):
            die(f"unexpected unversioned target for {base}: {cur}")
        stable = cur.replace("/docs/platform/next/", "/docs/platform/", 1)
        s = set_target(s, base, stable)
        s = add_exact(s, base, stable)
        extra += 1

    # Stacks. The 4.12 UI sends this key, and 4.12 has the page under understand/.
    stacks = UI + "stacks"
    old = re.compile(r"# Stacks \(UI key added in 5\.0, no 4\.12 page\)\.[^\n]*\n#[^\n]*\n")
    s, n = old.subn("# Stacks (UI key added in 4.12; the page moved to tenants/templates/ in 5.0)\n", s)
    if n != 1:
        die("Stacks comment not found")
    s = set_target(s, stacks, "/docs/platform/tenants/templates/what-are-stacks")
    s = set_target(s, stacks + "/:version", "/docs/platform/:version/tenants/templates/what-are-stacks")
    s = add_exact(s, stacks, "/docs/platform/tenants/templates/what-are-stacks")
    s = add_exact(s, stacks, "/docs/platform/4.12.0/understand/what-are-stacks", "4.12.0")

    for frm, to in DORMANT.items():
        s = set_target(s, frm, to)

    s, stable, flat, dropped = add_stable(s)

    open(PATH, "w").write(s)
    print(
        f"retargeted {done} permalinks with /next routes and {extra} without, "
        f"the Stacks permalink, and {len(DORMANT)} dormant rules; "
        f"added {stable} stable redirects, pointed {flat} older rules past them, "
        f"and dropped {dropped} rules that 5.0 pages shadow"
    )


if __name__ == "__main__":
    main()
