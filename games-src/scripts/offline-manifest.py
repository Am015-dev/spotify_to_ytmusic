#!/usr/bin/env python3
"""Write games/<game>/offline.json for every shelf game: every file the game can load at run time.

  python3 games-src/scripts/offline-manifest.py            # all games
  python3 games-src/scripts/offline-manifest.py nightrun   # one folder name

offline.json = {"v":1,"files":[{"p":"index.html","bytes":N},...],"optional":[{p,bytes}],"total":core bytes,"optionalTotal":bytes}
  files    = core: what the game needs to look and sound right (the shelf downloads these)
  optional = files the game never draws today (Nightrun: media/*.webp not listed in media/ready.json)
Excluded: dev/test leftovers (cards.html, preview.html, painted.html, *.md, *.map, *.bak, test*), the game's own sw.js, offline.json.
Paths are relative to the game folder. Run by build-all.py after a deploy. No AI is used.
"""
import json, os, pathlib, re, sys

GAMES = pathlib.Path(__file__).resolve().parents[2] / "games"
DEV_NAMES = {"cards.html", "preview.html", "painted.html", "sw.js", "offline.json", "readme.md", ".ds_store"}
DEV_EXT = (".md", ".map", ".bak", ".orig", ".tmp", ".log")

def slugs():
    t = (GAMES / "sw.js").read_text(encoding="utf-8")
    m = re.search(r"const SLUGS = \[(.*?)\]", t, re.S)
    return re.findall(r"'([^']+)'", m.group(1))

def is_dev(rel):
    n = rel.rsplit("/", 1)[-1].lower()
    return n in DEV_NAMES or n.endswith(DEV_EXT) or n.startswith("test") or n.startswith(".")

def build(slug):
    root = GAMES / slug
    if not (root / "index.html").is_file(): return None
    files = []
    for dp, dn, fn in os.walk(root):
        dn.sort()
        for f in sorted(fn):
            rel = os.path.relpath(os.path.join(dp, f), root).replace(os.sep, "/")
            if is_dev(rel): continue
            files.append((rel, os.path.getsize(root / rel)))
    files.sort(key=lambda x: (x[0] != "index.html", x[0]))
    core, opt = files, []
    ready = root / "media" / "ready.json"
    if slug == "mainhattan-nightrun" and ready.is_file():
        ok = set(json.loads(ready.read_text(encoding="utf-8")))
        # media/*.webp in the top folder that ready.json does not list are placeholders the game never draws
        # (media/placeholders.json, assets-index.json stay core: the game fetches them at boot)
        core = [(p, b) for p, b in files if not (p.startswith("media/") and p.count("/") == 1 and p.endswith(".webp") and p[6:] not in ok)]
        opt = [x for x in files if x not in set(core)]
    j = lambda L: [{"p": p, "bytes": b} for p, b in L]
    out = {"v": 1, "files": j(core), "optional": j(opt), "total": sum(b for _, b in core), "optionalTotal": sum(b for _, b in opt)}
    (root / "offline.json").write_text(json.dumps(out, separators=(",", ":")) + "\n", encoding="utf-8")
    return out

if __name__ == "__main__":
    want = sys.argv[1:] or slugs()
    for s in want:
        o = build(s)
        if o: print(f"{s:22} {len(o['files']):4} files {o['total']/1e6:7.1f} MB core, {len(o['optional'])} optional {o['optionalTotal']/1e6:.1f} MB")
