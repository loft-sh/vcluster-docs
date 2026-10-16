#!/usr/bin/env python3
"""Audit netlify.toml redirect rules.

Usage: hack/move-docs/audit_redirects.py [netlify.toml]

Reports malformed, duplicate, shadowed, self-pointing, chained, and dead
rules, plus dormant rules whose source page still exists (so the redirect
never fires). Unversioned URLs are checked against the stable version that
docusaurus.config.js sets as lastVersion for each docs plugin.
"""
import re,os,sys,subprocess,fnmatch,collections
os.chdir(subprocess.check_output(["git","rev-parse","--show-toplevel"],text=True).strip())
path=sys.argv[1] if len(sys.argv)>1 else "netlify.toml"
txt=open(path).read()
rules=[]
for m in re.finditer(r'\[\[redirects\]\](.*?)(?=\n\[\[|\n\[(?!\[)|\Z)',txt,re.S):
    body=m.group(1)
    g=lambda k: (re.search(rf'^\s*{k}\s*=\s*"?([^"\n]+)"?',body,re.M) or [None,None])[1]
    rules.append(dict(line=txt.count("\n",0,m.start())+1,frm=g("from"),to=g("to"),status=g("status"),force=g("force"),cond="conditions" in body or "query" in body))
_cfg=open("docusaurus.config.js").read()
SV={p:re.search(rf'id:\s*"{p}".*?lastVersion:\s*"([^"]+)"',_cfg,re.S).group(1) for p in ("vcluster","platform")}
def topat(f):  # netlify pattern -> regex
    r=re.escape(f).replace(r"\*",".*")
    r=re.sub(r":[a-z]+",r"[^/]+",r)
    return re.compile("^"+r+"/?$")
pats=[(i,topat(r["frm"])) for i,r in enumerate(rules) if r["frm"]!="/*"]
def page_exists(url):
    u=url.split("#")[0].split("?")[0].rstrip("/")
    m=re.match(r"/docs/(vcluster|platform)(?:/(next|\d+\.\d+\.\d+))?(?:/(.*))?$",u)
    if not m: return None
    p,v,r=m.groups(); r=r or ""
    root=p if v=="next" else f"{p}_versioned_docs/version-{v or SV[p]}"
    if not os.path.isdir(root): return False
    b=f"{root}/{r}" if r else root
    if any(os.path.isfile(b+s) for s in (".mdx",".md","/index.mdx","/README.mdx","/index.md")): return True
    if r=="" : return True
    if subprocess.run(["grep","-rqlE",f"^slug: /?{re.escape(r)}/?$",root]).returncode==0: return True
    if os.path.isdir(b) and os.path.isfile(b+"/_category_.json"): return "category"
    return False
def first_match(url,before=None):
    for i,p in pats:
        if before is not None and i>=before: break
        if p.match(url.split("#")[0].rstrip("/") or "/") or p.match(url.split("#")[0]): return i
    return None
out=collections.defaultdict(list)
seen={}
for i,r in enumerate(rules):
    f,t=r["frm"],r["to"]
    if f is None or t is None: out["MALFORMED"].append(r); continue
    if f in seen: out["DUPLICATE"].append((r["line"],f,t,rules[seen[f]]["line"],rules[seen[f]]["to"]))
    else: seen[f]=i
    if "*" not in f and ":" not in f:
        j=first_match(f,before=i)
        if j is not None and rules[j]["frm"]!=f and not rules[j]["cond"]:
            out["SHADOWED"].append((r["line"],f,t,rules[j]["line"],rules[j]["frm"],rules[j]["to"]))
    if t.split("#")[0].rstrip("/")==f.rstrip("/"): out["SELF"].append((r["line"],f))
    if t.startswith("/docs/") and "*" not in f and ":" not in t:
        j=first_match(t)
        if j is not None and r["force"]!="true":
            pe=page_exists(t)
            if not pe: out["CHAIN"].append((r["line"],f,t,rules[j]["to"]))
        pe=page_exists(t)
        # follow chain
        cur=t;hops=0
        while pe is False and hops<6:
            j=first_match(cur)
            if j is None: break
            cur=rules[j]["to"]; hops+=1
            if ":" in cur or "*" in cur: pe=None; break
            pe=page_exists(cur)
        if pe is False: out["DEAD"].append((r["line"],f,t,cur))
    if "*" not in f and ":" not in f and f.startswith("/docs/") and r["force"]!="true":
        if page_exists(f) is True: out["DORMANT"].append((r["line"],f,t))
for k in ("MALFORMED","DUPLICATE","SHADOWED","SELF","CHAIN","DEAD","DORMANT"):
    print(f"== {k}: {len(out[k])}")
    for x in out[k]: print("  ",x)
