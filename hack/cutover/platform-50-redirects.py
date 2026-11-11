#!/usr/bin/env python3
"""Apply the Platform 5.0 cutover redirects to netlify.toml (DOC-1854).

Run once on the cutover branch, after `lastVersion` moves to 5.0.0:

    python3 hack/cutover/platform-50-redirects.py

It does three things:

1. Retargets each unversioned /docs/platform-ui-link/platform/<key> route that
   has an exact /next route to that /next target without /next/, and adds an
   exact /<key>/5.0.0 route ahead of the generic /:version route. Without it,
   the 5.0 GA UI's /5.0.0 links fall through to the 4.12 paths. The generic
   routes stay on the 4.12 IA for 4.9 to 4.12 UIs.
2. Finishes the Stacks permalink, which only exists from 5.0 on.
3. Retargets dormant rules that wake up once 4.12 no longer serves a page at
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
    # #3116 (DOC-1948) retargets this key to the 4.12.0 legacy page. Handle the
    # unversioned route by hand after #3116 merges.
    "argocd-migration",
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
        if not nxt or "/next/" not in nxt:
            die(f"{base}/next has no /next/ target: {nxt}")
        stable = nxt.replace("/next/", "/", 1)
        if target(s, base) is None:
            die(f"no unversioned rule for {base}")
        s = set_target(s, base, stable)
        generic = re.compile(
            r'\[\[redirects\]\]\n[ \t]*from[ \t]*=[ \t]*"' + re.escape(base) + r'/:version"'
        )
        m = generic.search(s)
        if not m:
            die(f"no generic rule for {base}/:version")
        exact = f'[[redirects]]\n  from = "{base}/5.0.0"\n  to = "{stable}"\n\n'
        s = s[: m.start()] + exact + s[m.start():]
        done += 1

    # Stacks shipped in 5.0, so no 4.x UI sends this key.
    stacks = UI + "stacks"
    s = set_target(s, stacks, "/docs/platform/tenants/templates/what-are-stacks")
    s = set_target(s, stacks + "/:version", "/docs/platform/:version/tenants/templates/what-are-stacks")

    for frm, to in DORMANT.items():
        s = set_target(s, frm, to)

    open(PATH, "w").write(s)
    print(f"retargeted {done} permalinks with /5.0.0 routes, the Stacks permalink, and {len(DORMANT)} dormant rules")


if __name__ == "__main__":
    main()
