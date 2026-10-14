"""Read-only snapshot of the planner pages for GitHub Pages: <repo>/games/asset-viewer/ (pages.yml deploys games/).
flow.json is frozen at export time; only the 256 px thumbnails are copied (full-size Flow images stay on the laptop, the
lightbox falls back to the thumbnail). Votes and Flow runs need the local server (serve.py).
Run: C:\\Miniforge3\\python.exe viewer\\export_static.py   then push games/asset-viewer with push_repo.sh"""
import datetime as dt, json, os, shutil
from pathlib import Path

import flow_status
import pipeline_api

V = Path(__file__).parent
REPO = Path(os.environ.get("CROWN_REPO", r"C:\Users\kourisa\crown-media\repo"))
OUT = REPO / "games" / "asset-viewer"
PAGES = ["flow.html", "board.html", "assets.html", "screens.html", "anims.html", "music.html", "games.html"]
# local server routes -> GitHub Pages paths (asset-viewer/ sits next to the game folders)
ROUTES = [("src=\"game/${G}/", "src=\"../${G}/"), ("`/repo/${g}/media/", "`../${g}/media/")]

if OUT.exists(): shutil.rmtree(OUT)
(OUT / "flowthumbs").mkdir(parents=True)
flow = flow_status.build()
for b in flow["batches"]:
    for i in b["items"]: i["full"] = i["thumb"]  # no full-size images online
manifest = json.loads((V / "manifest.json").read_text(encoding="utf-8"))
for m in manifest:  # 3D tiles: thumbnail of the TRELLIS source instead of the 1 MB png
    src = V / m.get("src", "")
    m["src"] = flow_status.thumb(src) if src.is_file() else ""
used = {t for t in json.dumps([flow, manifest]).split('"') if t.startswith("flowthumbs/")}
for t in used: shutil.copy2(V / t, OUT / t)
(OUT / "flow.json").write_text(json.dumps(flow), encoding="utf-8")
(OUT / "manifest.json").write_text(json.dumps(manifest), encoding="utf-8")
shutil.copy2(V / "votes.json", OUT / "votes.json")
shutil.copy2(V / "review-tips.js", OUT / "review-tips.js")
shutil.copy2(V / "crown-cards.json", OUT / "crown-cards.json")
games = REPO / "games"
tables = {g.name: sorted(p.name for p in (g / "media").glob("table-*.webp")) for g in games.iterdir() if (g / "media").is_dir()}
(OUT / "tables.json").write_text(json.dumps(tables), encoding="utf-8")
anims = []  # clips copied in (flow-video stays on the laptop)
for w in sorted((flow_status.GA / "flow-video").glob("*/*.webm")):
    d = OUT / "anims" / w.parent.name; d.mkdir(parents=True, exist_ok=True); shutil.copy2(w, d / w.name)
    url = lambda f: f"anims/{w.parent.name}/{f.name}"
    sheet = w.with_name(w.stem + "-sheet.jpg")
    if sheet.exists(): shutil.copy2(sheet, d / sheet.name)
    anims.append({"game": w.parent.name, "name": w.stem, "webm": url(w), "mp4": None, "sheet": url(sheet) if sheet.exists() else None,
                  "kb": w.stat().st_size // 1024, "t": int(w.stat().st_mtime)})
(OUT / "anims.json").write_text(json.dumps(anims), encoding="utf-8")
music = pipeline_api.music(games, "../", flow_status.thumb)
for m in music.values():
    if m["cover"]: shutil.copy2(V / m["cover"], OUT / m["cover"])
(OUT / "music.json").write_text(json.dumps(music), encoding="utf-8")

when = dt.datetime.now().strftime("%d %b %Y %H:%M")
banner = (f'<div style="position:sticky;top:0;z-index:99;background:#3a2f12;color:#ffe9a8;font:13px system-ui;padding:6px 12px">'
          f'Read-only snapshot of {when}. Voting and Flow runs work only in the local viewer.</div>')
for p in PAGES:
    html = (V / p).read_text(encoding="utf-8")
    html = html.replace("cache: 'no-store'", "cache: 'no-cache'")
    for a, b in ROUTES: html = html.replace(a, b)
    i = html.index(">", html.index("<body")) + 1
    (OUT / p).write_text(html[:i] + banner + html[i:], encoding="utf-8")
(OUT / "index.html").write_text('<!doctype html><meta charset="utf-8"><title>Asset viewer</title>'
                                '<meta http-equiv="refresh" content="0; url=board.html"><a href="board.html">Production board</a>',
                                encoding="utf-8")
mb = sum(f.stat().st_size for f in OUT.rglob("*") if f.is_file()) / 1e6
print(f"{len(PAGES) + 1} pages, {len(used)} thumbnails, {mb:.1f} MB -> {OUT}")
