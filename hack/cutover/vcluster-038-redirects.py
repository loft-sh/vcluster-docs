#!/usr/bin/env python3
"""Apply the vCluster 0.38 cutover redirects to netlify.toml (DOC-1854).

Run once on the cutover branch, after `lastVersion` moves to 0.38.0:

    python3 hack/cutover/vcluster-038-redirects.py

It does three things:

1. Replaces each `# Deferred to the 0.38 cutover:` marker with the stable
   redirect it describes.
2. Retargets the platform-ui-link permalinks those redirects would otherwise
   chain through. The unversioned route moves to the 0.38 path. Exact `/0.38.0`
   and `/next` routes are added ahead of the generic `/:version` route, because
   the Platform UI sends the vCluster instance's version. The generic route
   stays on the 0.37 IA for older instances.
3. Retargets any other exact rule whose target is one of the retired stable
   paths, so it doesn't chain through the new redirect.

The script refuses to run twice: it exits if no deferred markers remain.
"""
import re
import sys

PATH = "netlify.toml"
V = "/docs/vcluster"

# Old stable path -> 0.38 path (both relative to /docs/vcluster/).
MOVES = {
    "introduction/architecture": "overview/architecture",
    "manage/backup-restore/backup": "operate/backup-restore/backup",
    "configure/vcluster-yaml": "reference/vcluster-yaml",
    "configure/vcluster-yaml/control-plane": "configure/control-plane",
    "configure/vcluster-yaml/control-plane/components/backing-store": "configure/control-plane/components/backing-store",
    "configure/vcluster-yaml/control-plane/components/distro": "configure/control-plane/components/distro",
    "configure/vcluster-yaml/control-plane/components/host-path-mapper": "configure/control-plane/components/host-path-mapper",
    "configure/vcluster-yaml/control-plane/deployment/ingress": "configure/control-plane/deployment/ingress",
    "configure/vcluster-yaml/control-plane/deployment/service": "configure/control-plane/deployment/service",
    "configure/vcluster-yaml/sync/from-host": "configure/sync/from-host",
    "configure/vcluster-yaml/sync/from-host/nodes": "configure/sync/from-host/nodes",
    "configure/vcluster-yaml/sync/to-host": "configure/sync/to-host",
    "configure/vcluster-yaml/sync/to-host/core/pods/hybrid-scheduling": "configure/sync/to-host/core/pods/hybrid-scheduling",
    "configure/vcluster-yaml/policies/resource-quota": "configure/policies/resource-quota",
    "configure/vcluster-yaml/private-nodes/auto-nodes": "configure/private-nodes/auto-nodes",
    "configure/vcluster-yaml/sleep": "configure/lifecycle/sleep",
    "deploy/worker-nodes/private-nodes/vpn": "configure/private-nodes/vpn",
}

MIGRATE = "operate/backup-restore/restore#migrate-and-override-vcluster-configuration-options-to-create-a-new-cluster"

# platform-ui-link/vcluster/<key> -> 0.38 target (relative to /docs/vcluster/).
VCLUSTER_KEYS = {
    "tenancy-model": "overview/architecture",
    "volume-snapshots": "operate/backup-restore/backup",
    # Both pointed at anchors on the backup page that live on the restore page.
    "backup-restore-migration": MIGRATE,
    "supported-migration-options": MIGRATE,
    "vcluster-yaml": "reference/vcluster-yaml",
    "control-plane": "configure/control-plane",
    "backing-store": "configure/control-plane/components/backing-store",
    "control-plane-distro": "configure/control-plane/components/distro",
    "host-path-mapper": "configure/control-plane/components/host-path-mapper",
    "control-plane-ingress": "configure/control-plane/deployment/ingress",
    "control-plane-service": "configure/control-plane/deployment/service",
    "sync-from-host": "configure/sync/from-host",
    "nodes": "configure/sync/from-host/nodes",
    "sync-to-host": "configure/sync/to-host",
    "hybrid-scheduling": "configure/sync/to-host/core/pods/hybrid-scheduling",
    "resource-quota": "configure/policies/resource-quota",
    "private-nodes-auto-nodes": "configure/private-nodes/auto-nodes",
    # The page has no #requirements anchor; its heading is "Prerequisites".
    "private-nodes-auto-nodes-requirements": "configure/private-nodes/auto-nodes#prerequisites",
    "vpn": "configure/private-nodes/vpn",
}

# Platform keys that send every Platform version to stable vCluster sleep docs.
# Their /next routes already point at the new page.
SLEEP_KEYS = ["sleep-mode", "working-with-sleep-mode"]


def die(msg):
    sys.exit(f"error: {msg}")


def set_target(s, frm, to):
    pat = re.compile(r'(from = "' + re.escape(frm) + r'"\n  to = ")[^"]*(")')
    s, n = pat.subn(lambda m: m.group(1) + to + m.group(2), s)
    if n != 1:
        die(f"expected one rule from {frm}, found {n}")
    return s


def main():
    s = open(PATH).read()

    # 1. Deferred markers -> stable redirects.
    marker = re.compile(
        r"# Deferred to the 0\.38 cutover: (/docs/vcluster/\S+) -> (/docs/vcluster/\S+?)\.\n# Adding it now[^\n]*\n"
    )
    found = marker.findall(s)
    if not found:
        die("no deferred markers left; has this already run?")
    for old, new in found:
        if MOVES.get(old[len(V) + 1:]) != new[len(V) + 1:]:
            die(f"marker {old} -> {new} doesn't match MOVES")
    if len(found) != len(MOVES):
        die(f"found {len(found)} markers, expected {len(MOVES)}")
    s = marker.sub(
        lambda m: (
            "# DOC-1854: stable redirect, added at the 0.38 cutover\n"
            "[[redirects]]\n"
            f'  from = "{m.group(1)}"\n'
            f'  to = "{m.group(2)}"\n'
            "  status = 301\n\n"
        ),
        s,
    )

    # 2. Permalinks.
    for key, target in VCLUSTER_KEYS.items():
        base = f"/docs/platform-ui-link/vcluster/{key}"
        s = set_target(s, base, f"{V}/{target}")
        generic = f'[[redirects]]\n  from = "{base}/:version"\n'
        # Netlify uses the first match, so the exact routes go before the
        # first generic rule (volume-snapshots has a dead duplicate).
        if generic not in s:
            die(f"no generic rule for {base}/:version")
        exact = (
            f'[[redirects]]\n  from = "{base}/0.38.0"\n  to = "{V}/{target}"\n\n'
            f'[[redirects]]\n  from = "{base}/next"\n  to = "{V}/next/{target}"\n\n'
        )
        s = s.replace(generic, exact + generic, 1)
    for key in SLEEP_KEYS:
        base = f"/docs/platform-ui-link/platform/{key}"
        s = set_target(s, base, f"{V}/configure/lifecycle/sleep")
        s = set_target(s, f"{base}/:version", f"{V}/configure/lifecycle/sleep")

    # 3. Other exact rules that target a retired stable path.
    def retarget(m):
        frm, path, frag = m.group(1), m.group(2), m.group(3) or ""
        if path in MOVES and frm != f"{V}/{path}":
            new = f"{V}/{MOVES[path]}{frag}"
            print(f"retarget {frm}: {V}/{path}{frag} -> {new}")
            return f'from = "{frm}"\n  to = "{new}"'
        return m.group(0)

    s = re.sub(
        r'from = "([^"]+)"\n  to = "/docs/vcluster/([a-z0-9/-]+?)/?(#[^"]*)?"',
        retarget,
        s,
    )

    open(PATH, "w").write(s)
    print(f"added {len(found)} stable redirects, retargeted {len(VCLUSTER_KEYS)} vCluster and {len(SLEEP_KEYS)} Platform sleep permalinks")


if __name__ == "__main__":
    main()
