#!/usr/bin/env python3
"""Adds this game's pictures to next-wave/expected-assets.json (what ingest-assets.py reads). Run by the orchestrator once at merge time
(kept out of the worker branch: that file is one long line and every branch editing it conflicts).   python3 games-src/redline-rally/register-assets.py"""
import json, pathlib
D = pathlib.Path(__file__).resolve().parent; P = D.parent / "next-wave" / "expected-assets.json"
rows = json.loads(P.read_text()); rows = [r for r in rows if r.get("slug") != "redline-rally"]
for i in json.loads((D / "assets.json").read_text())["items"]:
    rows.append({"id": "redline-rally:" + i["stem"], "slug": "redline-rally", "kind": "art", "stem": i["stem"], "element": i["slot"], "save_as": i["stem"] + ".webp",
                 "repo_target": "games/redline-rally/media/" + i["stem"] + ".webp", "size": f"{i['w']}x{i['h']}", "ratio": i["ratio"], "transparent": bool(i["alpha"]), "tag": "", "priority": i["wave"]})
P.write_text(json.dumps(rows, separators=(",", ":")))
print("registered", sum(1 for r in rows if r["slug"] == "redline-rally"), "pictures")
