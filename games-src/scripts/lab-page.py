#!/usr/bin/env python3
"""Build games/lab.html (owner page: every game's scenarios with GO, results, filters) from games-src/lab/lab.tpl.html + shell/gx-lab-core.js, then stamp it.
usage: python3 games-src/scripts/lab-page.py"""
import json, pathlib, re, subprocess, sys
SRC = pathlib.Path(__file__).resolve().parents[1]; REPO = SRC.parent
tpl = (SRC / "lab" / "lab.tpl.html").read_text(encoding="utf-8")
core = (SRC / "shell" / "gx-lab-core.js").read_text(encoding="utf-8")
names = {}
idx = (REPO / "games" / "index.html").read_text(encoding="utf-8")
ids = json.loads(re.search(r"var IDS = (\{.*?\});", core).group(1).replace("'", '"'))
for m in re.finditer(r"\{id:'([a-z-]+)',cover:'[^']*',name:'([^']*)',src:'([^/]+)/index\.html'", idx): names[m.group(3)] = re.sub(r" \(preview\)$", "", m.group(2)).replace("&amp;", "&")
out = tpl.replace("<!--CORE-->", core).replace("<!--NAMES-->", json.dumps(names))
(REPO / "games" / "lab.html").write_text(out, encoding="utf-8")
subprocess.run([sys.executable, str(SRC / "scripts" / "stamp-copyright.py"), str(REPO / "games" / "lab.html")], check=False)
print("games/lab.html", len(out) // 1024, "KB")
