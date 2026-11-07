#!/usr/bin/env python3
"""Write games/<game>/offline.json for every shelf game: every file the game can load at run time.

  python3 games-src/scripts/offline-manifest.py            # all games
  python3 games-src/scripts/offline-manifest.py nightrun   # one folder name

offline.json = {"v":1,"files":[{"p":"index.html","bytes":N},...],"optional":[{p,bytes}],"total":core bytes,"optionalTotal":bytes}
  files    = core: what the game needs to look and sound right (the shelf downloads these)
  optional = always empty now (kept so older shelf pages still read the file)
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

def build(slug, check=False):
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
    core, opt = files, []   # everything on disk is core: a game may load any of it (Nightrun's unlisted placeholders are only ~7 MB)
    j = lambda L: [{"p": p, "bytes": b} for p, b in L]
    out = {"v": 1, "files": j(core), "optional": j(opt), "total": sum(b for _, b in core), "optionalTotal": sum(b for _, b in opt)}
    text = json.dumps(out, separators=(",", ":")) + "\n"
    if check:   # --check: report only, write nothing
        old = (root / "offline.json").read_text(encoding="utf-8") if (root / "offline.json").is_file() else ""
        return out if old != text else None
    (root / "offline.json").write_text(text, encoding="utf-8")
    return out

if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    check = "--check" in sys.argv   # exit 1 when any offline.json differs from what is on disk (stale list = files missing offline)
    want = args or slugs()
    stale = []
    for s in want:
        o = build(s, check)
        if check:
            if o: stale.append(s)
        elif o: print(f"{s:22} {len(o['files']):4} files {o['total']/1e6:7.1f} MB")
    if check:
        print("offline.json stale: " + (", ".join(stale) if stale else "none"))
        sys.exit(1 if stale else 0)
