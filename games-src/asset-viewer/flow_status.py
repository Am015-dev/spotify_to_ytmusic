"""Live Flow status for the viewer (served as /flow.json by serve.py, rebuilt on every request).
- budget: images made in the last 24 h (Google-Flow_MCP/logs/flow-*.log "Job completed"; all tabs) vs FLOW_DAY_LIMIT, plus
  a 24 h forecast of free slots (each image leaves the window 24 h after it was made) -> plan work against ~380/day
  (flags come at ~415-540/24 h, analysis 2026-10-10).
- batches: every prompts*.json under flow-2d/, flow-3d/, flow-covers/ with done/pending cards; thumbnails (256 px) are
  cached in viewer/flowthumbs/."""
import datetime as dt, glob, json, os, re
from pathlib import Path
from PIL import Image

GA = Path(os.environ.get("GAME_ASSETS", Path(__file__).parent.parent))
LOGS = Path(os.environ.get("FLOW_LOGS", r"C:\Users\kourisa\Google-Flow_MCP\logs"))
THUMBS = Path(__file__).parent / "flowthumbs"
LIMIT = int(os.environ.get("FLOW_DAY_LIMIT", 380))
KIND = {"prompts-kit.json": "Wave 4 kit", "prompts.json": "main set", "prompts-redo.json": "redo", "prompts-redo2.json": "redo",
        "prompts-v2.json": "3D v2", "prompts-v3.json": "3D v3", "prompts-gapfix.json": "3D gap fix", "prompts-tokens.json": "3D tokens",
        "prompts-missing.json": "3D missing", "prompts-tall.json": "story map",
        "prompts-wave1.json": "Wave 1", "prompts-wave1-wide.json": "Wave 1 (16:9)", "prompts-djinn.json": "Wave 1 djinns (4:3)",
        "prompts-cards-a.json": "Wave 2 power cards A (16:9)", "prompts-cards-b.json": "Wave 2 power cards B (16:9)", "prompts-wave2.json": "Wave 2", "prompts-wave2-wide.json": "Wave 2 (16:9)",
        "prompts-wave3.json": "Wave 3", "prompts-wave3-wide.json": "Wave 3 (16:9)", "prompts-wave3-43.json": "Wave 3 (4:3)",
        "prompts-wave3-34.json": "Wave 3 (3:4)", "prompts-wave3-tall.json": "Wave 3 (9:16)",
        "prompts-wave5.json": "Wave 5", "prompts-wave5-wide.json": "Wave 5 (16:9)",
        "prompts-wave6.json": "Wave 6", "prompts-wave6-wide.json": "Wave 6 (16:9)", "prompts-wave6-43.json": "Wave 6 (4:3)", "prompts-wave6-34.json": "Wave 6 (3:4)", "prompts-wave6-tall.json": "Wave 6 (9:16)"}
RATIO_LABEL = {"-wide": " (16:9)", "-43": " (4:3)", "-34": " (3:4)", "-tall": " (9:16)"}


def kind_of(fname):
    """Label of a prompt file. Next-wave files: prompts-wave<N>[-wide|-43|-34|-tall].json = 'Wave N (ratio)' (poses and paintings of one
    production day, <= LIMIT images), prompts-3d-wave<A|B|..>.json = '3D wave A' (3D source paintings, about 40 per wave)."""
    if fname in KIND: return KIND[fname]
    m = re.fullmatch(r"prompts-wave(\d+)(-wide|-43|-34|-tall)?\.json", fname)
    if m: return f"Wave {m.group(1)}" + RATIO_LABEL.get(m.group(2), "")
    m = re.fullmatch(r"prompts-3d-wave([A-Z])\.json", fname)
    if m: return f"3D wave {m.group(1)}"
    return fname


# Production waves from games-src/next-wave (README.md there). Kept in step by games-src/scripts/make-wave7.py, which rewrites the list
# between the markers: (wave label, images). Shown in the plan table until the prompt files are copied here; then they are normal batches.
# PLANNED-BEGIN
PLANNED_WAVES = [("Wave 7", 376), ("Wave 8", 380), ("Wave 9", 183), ("3D wave A", 39), ("3D wave B", 38), ("3D wave C", 38), ("3D wave D", 38), ("3D wave E", 38)]
# PLANNED-END

# 2D items that an approved model in games-src/facelift-3d replaces (logs/FLOW-FACELIFT-PLAN.md "Crossed out by approved 3D")
TWIN = {**{("rampart-and-vine", f"piece-{k}-{c}"): f"piece-{k}" for k in ("meeple", "champ", "mason", "hog") for c in ("red", "blue", "green", "yellow")},
        ("sands-of-qamar", "token-palm"): "palm", ("sands-of-qamar", "token-palace"): "palace",
        ("sunglaze", "kiln-disc"): "plate", ("sunglaze", "kiln-disc-empty"): "plate", ("sunglaze", "token-sun"): "sun",
        ("short-fuse", "icon-bomb"): "bomb"}
CROSSED = [{"game": g, "name": n, "wave": w, "twin": t} for g, n, w, t in [
    ("crown-city-smash", "fx-energy", "Wave 2", "token-energy"), ("crown-city-smash", "fx-star", "Wave 2", "token-star"),
    ("crown-city-smash", "fx-heart", "Wave 2", "token-heart"), ("nebula-aces", "ship-lancer", "Wave 3", "na-lancer"),
    ("nebula-aces", "ship-talon", "Wave 3", "na-talon"), ("kaiten-kitchen", "cloche", "Wave 3", "cloche"),
    ("kaiten-kitchen", "cloche-open", "Wave 3", "cloche")] + [("hollowbough", f"token-worker-{c}", "Wave 5", "worker") for c in ("red", "blue", "green", "yellow")]]


def wave_of(root, fname):
    m = re.match(r"prompts-wave(\d+)(?:-|\.json)", fname)
    if root == "flow-3d":
        m3 = re.fullmatch(r"prompts-3d-wave([A-Z])\.json", fname)
        return f"3D wave {m3.group(1)}" if m3 else "3D sources"
    if root == "flow-covers": return "Covers"
    if root == "flow-video": return "Boss poses"
    if root == "flow-2d" and m: return f"Wave {m.group(1)}"
    for key, w in (("kit", "Wave 4"), ("wave1", "Wave 1"), ("djinn", "Wave 1"), ("cards", "Wave 2"), ("wave2", "Wave 2"), ("wave3", "Wave 3"), ("wave5", "Wave 5"), ("wave6", "Wave 6")):
        if key in fname: return w
    return "Wave 0"


def ratio_of(fname):
    for key, r in (("-wide", "16:9"), ("-43", "4:3"), ("-34", "3:4"), ("-tall", "9:16"), ("djinn", "4:3"), ("cards", "16:9")):
        if key in fname: return r
    return "1:1"


def jobs():
    out = []
    for f in sorted(LOGS.glob("flow-*.log"))[-2:]:
        for line in open(f, encoding="utf-8", errors="ignore"):
            if "Job completed" in line:
                try: out.append(dt.datetime.fromisoformat(line[1:line.index("]")].replace("Z", "+00:00")))
                except ValueError: pass
    return out


def thumb(src):
    t = THUMBS / src.relative_to(GA).as_posix().replace("/", "__")
    if not t.exists() or t.stat().st_mtime < src.stat().st_mtime:
        THUMBS.mkdir(exist_ok=True)
        im = Image.open(src).convert("RGB"); im.thumbnail((256, 256)); im.save(t, quality=82)
    return f"flowthumbs/{t.name}"


# ---- pipeline stages: generated -> approved (votes2d) -> prepped (repo media webp) -> pushed (on origin) -> wired (game uses it) ----
REPO = Path(os.environ.get("CROWN_REPO", r"C:\Users\kourisa\crown-media\repo"))
BRANCH = "origin/alex/brave-carson-rbpmlk"
_cache = {}


def _cached(key, ttl, fn):
    import time
    hit = _cache.get(key)
    if hit and time.time() - hit[0] < ttl: return hit[1]
    v = fn(); _cache[key] = (time.time(), v); return v


def pushed_files():
    import subprocess
    def run():
        try: out = subprocess.run(["git", "-C", str(REPO), "ls-tree", "-r", "--name-only", BRANCH, "games"], capture_output=True, text=True, timeout=30).stdout
        except Exception: return set()
        return {l for l in out.splitlines() if "/media/" in l}
    return _cached("pushed", 120, run)


def pushed_3d():
    import subprocess
    def run():
        try: out = subprocess.run(["git", "-C", str(REPO), "ls-tree", "-r", "--name-only", BRANCH, "games-src/facelift-3d"], capture_output=True, text=True, timeout=30).stdout
        except Exception: return set()
        return set(out.splitlines())
    return _cached("pushed3d", 120, run)


def models():
    """One entry per 3D item (versions grouped like viewer/index.html): stage to-vote/redo/approved/pushed/wired."""
    V = Path(__file__).parent
    try: man = json.loads((V / "manifest.json").read_text(encoding="utf-8")); votes = json.loads((V / "votes.json").read_text(encoding="utf-8"))
    except Exception: return []
    base = lambda n: re.sub(r"-v\d+$", "", re.sub(r"-pixal(-game)?$", "", n))
    groups = {}
    for m in man:
        if not m.get("missing"): groups.setdefault((m["game"], base(m["name"])), []).append(m)
    replaces = {}
    for (g, n), t in TWIN.items(): replaces.setdefault((g, t), []).append(n)
    for c in CROSSED: replaces.setdefault((c["game"], c["twin"]), []).append(c["name"])
    out = []
    for (mg, b), vs in sorted(groups.items()):
        g = "thornbound" if mg == "thornbound-throne" else mg
        ok = next((v for v in vs if votes.get(f"{mg}/{v['name']}") == "ok"), None)
        pick = ok or next((v for v in vs if v["name"].endswith("-pixal-game")), vs[-1])
        if ok:
            stage = "wired" if f"{b}.glb" in game_text(g) else "pushed" if f"games-src/facelift-3d/{g}/{b}.glb" in pushed_3d() else "approved"
        else: stage = "redo" if votes.get(f"{mg}/{b}") == "redo" else "generated"
        out.append({"game": g, "name": b, "glb": pick["glb"], "src": pick["src"], "kb": pick.get("kb"), "stage": stage,
                    "replaces": replaces.get((g, b), [])})
    return out


def game_text(game):
    f = REPO / "games" / game / "index.html"
    if not f.exists(): return ""
    return _cached(("html", game, f.stat().st_mtime), 3600, lambda: f.read_text(encoding="utf-8", errors="ignore"))


# ---- suspect checks (cached per file + mtime): identical duplicates inside a game, near-empty pictures ----
_facts = {}


def facts(f):
    import hashlib
    key = (str(f), f.stat().st_mtime)
    if key not in _facts:
        im = Image.open(f).convert("L"); im.thumbnail((64, 64))
        px = list(im.getdata()); white = sum(p > 235 for p in px) / len(px)
        mean = sum(px) / len(px); std = (sum((p - mean) ** 2 for p in px) / len(px)) ** .5
        _facts[key] = (hashlib.md5(f.read_bytes()).hexdigest(), white > .985 or std < 6)
    return _facts[key]


def stage(game, name, done, vote):
    media = f"games/{game}/media/{name}.webp"
    if game_text(game) and f"media/{name}.webp" in game_text(game): return "wired"
    if media in pushed_files(): return "pushed"
    if (REPO / media).exists(): return "prepped"
    if vote == "redo": return "redo"
    if not done: return "planned"
    return "approved" if vote == "ok" else "generated"


def build():
    now = dt.datetime.now(dt.timezone.utc)
    win = sorted(j for j in jobs() if j > now - dt.timedelta(hours=24))
    forecast = []
    for h in range(0, 25):
        t = now + dt.timedelta(hours=h)
        forecast.append({"h": h, "at": t.isoformat(), "room": max(0, LIMIT - sum(1 for j in win if j > t - dt.timedelta(hours=24)))})
    last_hour = sum(1 for j in win if j > now - dt.timedelta(hours=1))
    batches = []
    import votes2d
    votes = votes2d.load()
    for root, pat in [("flow-2d", "**/prompts*.json"), ("flow-3d", "**/prompts*.json"), ("flow-covers", "**/prompts*.json"),
                      ("flow-video", "*/poses/*.json")]:  # boss pose stills (references for the boss videos)
        for p in sorted((GA / root).glob(pat)):
            if p.name.startswith("prompts-redo-auto"): continue  # mirrors redo votes; the items already appear in their own batch
            try: cards = json.load(open(p, encoding="utf-8"))["cards"]
            except Exception: continue
            folder = p.parent
            items = []
            qf = GA / "logs" / "flow_qa" / f"{root}__{folder.name}__{p.stem}.json"  # first-pass auto check (flow_qa.py, outside this project)
            try: qa = json.loads(qf.read_text(encoding="utf-8")) if qf.exists() else {}
            except ValueError: qa = {}
            for name, prompt in cards.items():
                if isinstance(prompt, dict): prompt = prompt.get("prompt", "")  # pose cards: {"prompt": ..., reference fields}
                f = folder / f"{name}.jpg"
                old = folder / "_redo" / f"{name}.jpg"
                vt = votes.get(f"{folder.name}/{name}", {}) if root == "flow-2d" else {}
                items.append({"name": name, "done": f.exists(), "thumb": thumb(f) if f.exists() else None,
                              "t": int(f.stat().st_mtime) if f.exists() else None, "prompt": prompt,
                              "full": f"full/{f.relative_to(GA).as_posix()}",
                              "twin": TWIN.get((folder.name, name)), "vote": vt.get("v"), "note": vt.get("note", ""),
                              "old": thumb(old) if old.exists() else None,
                              "stage": stage(folder.name, name, f.exists(), vt.get("v")) if root == "flow-2d" else None,
                              "flags": ["blank"] if root == "flow-2d" and f.exists() and facts(f)[1] else [],
                              "qa": {k: qa[name][k] for k in ("ok", "issues") if k in qa[name]} if f.exists() and name in qa else None})
            game = "covers" if root == "flow-covers" else folder.parent.name if root == "flow-video" else folder.name
            batches.append({"root": root, "game": game, "kind": kind_of(p.name), "file": p.relative_to(GA).as_posix(),
                            "wave": wave_of(root, p.name), "ratio": ratio_of(p.name),
                            "done": sum(i["done"] for i in items), "total": len(items), "items": items})
    pending = sum(b["total"] - b["done"] for b in batches)
    # when does the pending work fit? fill the free room hour by hour, then at LIMIT per day after the forecast
    left, eta = pending, None
    for f in forecast:
        if f["room"] >= left: eta = f["at"]; break
    if eta is None and pending:
        extra_days = (left - forecast[-1]["room"]) / LIMIT
        eta = (now + dt.timedelta(hours=24) + dt.timedelta(days=extra_days)).isoformat()
    # facelift waves not turned into prompt files yet (logs/FLOW-FACELIFT-PLAN.md): planned at LIMIT images/day after the queue
    have = {b["wave"] for b in batches}
    PLANNED = [(w, n) for w, n in PLANNED_WAVES if w not in have]
    start = dt.datetime.fromisoformat(eta) if eta else now
    planned, acc = [], 0
    for name, n in PLANNED:
        acc += n
        planned.append({"name": name, "images": n, "eta": (start + dt.timedelta(days=acc / LIMIT)).isoformat()})
    covers = {c.stem: thumb(c) for c in sorted((GA / "flow-covers").glob("*.jpg"))}
    # identical pictures under two names in one game (a late image saved under the next card's name)
    seen = {}
    for b in batches:
        if b["root"] != "flow-2d": continue
        for i in b["items"]:
            if i["done"]: seen.setdefault((b["game"], facts(GA / "flow-2d" / b["game"] / f"{i['name']}.jpg")[0]), []).append(i)
    for same in seen.values():
        names = {x["name"] for x in same}
        if len(names) > 1:
            for i in same: i["flags"].append("dup"); i["dup_of"] = sorted(names - {i["name"]})
    redo_files = [{"game": p.parent.name, "file": p.name, "ratio": ratio_of(p.name), "count": len(json.load(open(p, encoding="utf-8"))["cards"])}
                  for p in sorted((GA / "flow-2d").glob("*/prompts-redo-auto*.json"))]
    return {"now": now.isoformat(), "limit": LIMIT, "last24h": len(win), "last_hour": last_hour, "forecast": forecast,
            "pending": pending, "eta": eta, "batches": batches, "planned": planned, "crossed": CROSSED, "covers": covers, "redo_files": redo_files, "models": models()}


if __name__ == "__main__":
    s = build()
    print(f"{s['last24h']}/{s['limit']} in 24 h, {s['pending']} pending, eta {s['eta']}, {len(s['batches'])} batches")
