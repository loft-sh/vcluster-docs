#!/usr/bin/env python3
"""Apply the Platform 5.0 cutover redirects to netlify.toml (DOC-1854).

Run once on the cutover branch, after `lastVersion` moves to 5.0.0:

    python3 hack/cutover/platform-50-redirects.py

It does three things:

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

The script refuses to run twice: it exits if a /5.0.0 route already exists.
"""
import re
import sys

PATH = "netlify.toml"
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
    s = set_target(s, stacks, "/docs/platform/tenants/templates/what-are-stacks")
    s = set_target(s, stacks + "/:version", "/docs/platform/:version/tenants/templates/what-are-stacks")
    s = add_exact(s, stacks, "/docs/platform/tenants/templates/what-are-stacks")
    s = add_exact(s, stacks, "/docs/platform/4.12.0/understand/what-are-stacks", "4.12.0")

    for frm, to in DORMANT.items():
        s = set_target(s, frm, to)

    open(PATH, "w").write(s)
    print(
        f"retargeted {done} permalinks with /next routes and {extra} without, "
        f"the Stacks permalink, and {len(DORMANT)} dormant rules"
    )


if __name__ == "__main__":
    main()
