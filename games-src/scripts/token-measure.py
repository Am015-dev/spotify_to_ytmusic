#!/usr/bin/env python3
"""Token estimate (chars/4) to locate and read what a typical small UI fix needs: whole files (before) versus
MODULES.md + find.sh + line ranges (after). Numbers are written into CHECK-SPEED.md by hand from this output."""
import subprocess, pathlib, sys
SRC = pathlib.Path(__file__).resolve().parents[1]
t = lambda n: round(n / 4)
def size(p): return len((SRC / p).read_text(encoding="utf-8", errors="replace"))
def rng(p, line, pad=25):
    L = (SRC / p).read_text(encoding="utf-8", errors="replace").splitlines()
    return len("\n".join(L[max(0, line - 1 - pad): line + pad]))
def find(q, g):
    return len(subprocess.run([str(SRC / "scripts" / "find.sh"), q, g], capture_output=True, text=True).stdout)
# game, task, [whole files a worker reads without maps], map file, [(query)], [(file, line) ranges read]
CASES = [
 ("thornbound", "Undo button label bigger", ["thornbound/game/src/ui3.js", "thornbound/game/src/head.html"], "thornbound/game/MODULES.md",
  ["Undo", "#act .btn"], [("thornbound/game/src/ui3.js", 151), ("thornbound/game/src/head.html", 140)]),
 ("doorkick-dungeon", "Help button label bigger", ["munch/ui.js", "munch/head.html", "munch/tbl.css"], "munch/MODULES.md",
  ["helpb", ".btn{"], [("munch/ui.js", 123), ("munch/head.html", 477)]),
 ("crown-city-smash", "Got it button label bigger", ["kot/ui.js", "kot/head.html", "kot/extra.css"], "kot/MODULES.md",
  ["Got it", ".btn{"], [("kot/ui.js", 151), ("kot/head.html", 36)]),
]
for g, task, whole, mp, qs, rs in CASES:
    before = sum(size(f) for f in whole) if all((SRC / f).exists() for f in whole) else None
    after = size(mp) + sum(find(q, g) for q in qs) + sum(rng(f, l) for f, l in rs)
    print("%-17s %-28s before %6d tok (%s)  after %5d tok (map %d + find %d + ranges %d)" % (g, task, t(before or 0), " + ".join(whole), t(after), t(size(mp)), t(sum(find(q, g) for q in qs)), t(sum(rng(f, l) for f, l in rs))))
