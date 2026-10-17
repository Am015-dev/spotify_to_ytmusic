"""Copy GLBs + their source cut-outs into viewer/ and write viewer/manifest.json.
Run: C:\\Miniforge3\\python.exe viewer\\build_manifest.py [glb dir=vm\\trellis2_facelift]
Serve: C:\\Miniforge3\\python.exe -m http.server 8765 -d viewer   ->  http://127.0.0.1:8765/"""
import json, os, re, shutil, sys
from pathlib import Path

V = Path(__file__).parent
GLB = Path(sys.argv[1]) if len(sys.argv) > 1 else V.parent / "vm" / "trellis2_facelift"
CUT = V.parent / "vm" / "concepts3"
(V / "glb").mkdir(exist_ok=True); (V / "src").mkdir(exist_ok=True)
items = []
for g in sorted(GLB.glob("*.glb")):
    game, _, name = g.stem.partition("__")
    shutil.copy(g, V / "glb" / g.name)
    src = CUT / f"{g.stem}.png"
    if src.exists(): shutil.copy(src, V / "src" / src.name)
    items.append({"game": game, "name": name or g.stem, "glb": f"glb/{g.name}", "src": f"src/{g.stem}.png", "kb": g.stat().st_size // 1024,
                  "t": int(g.stat().st_mtime)})
# Pixal3D results of the same inputs show as "<name>-pixal" next to the TRELLIS.2 card
# and the game-size bake (<stem>_game.glb) as "<name>-pixal-game"
for g in sorted((V.parent / "vm" / "pixal" / "out").glob("*.glb")):
    stem, suffix = (g.stem[:-5], "-pixal-game") if g.stem.endswith("_game") else (g.stem, "-pixal")
    game, _, name = stem.partition("__")
    up = V.parent / "vm" / "pixal" / "upright" / g.name  # lean-corrected copy (vm/pixal/upright.py) when it exists
    dst = f"{stem}{suffix}.glb"; shutil.copy(up if up.exists() else g, V / "glb" / dst)
    src = CUT / f"{stem}.png"
    if src.exists(): shutil.copy(src, V / "src" / src.name)
    items.append({"game": game, "name": f"{name}{suffix}", "glb": f"glb/{dst}", "src": f"src/{stem}.png", "kb": g.stat().st_size // 1024,
                  "t": int(g.stat().st_mtime), "upright": up.exists() if suffix == "-pixal-game" else None,
                  "_ship": up if up.exists() else g})

# badges: see-through % from the hole tests (vm/hole_check.py CSVs, newest wins) and "on GitHub" = byte-identical to the
# file staged in games-src/facelift-3d/ (stage_facelift3d.py)
import csv, hashlib
see = {}
for c in sorted((V.parent / "logs").glob("hole_check_*.csv"), key=lambda p: p.stat().st_mtime):
    for r in csv.DictReader(open(c)):
        if r.get("see_through_worst_view"): see[r["file"]] = float(r["see_through_worst_view"])
REPO3D = Path(os.environ.get("CROWN_REPO", r"C:\Users\kourisa\crown-media\repo")) / "games-src" / "facelift-3d"
md5 = lambda p: hashlib.md5(p.read_bytes()).hexdigest()
shipped = {md5(p) for p in REPO3D.rglob("*.glb")} if REPO3D.exists() else set()
for i in items:
    stem = Path(i["glb"]).stem
    base = re.sub(r"-pixal-game$", "_game", re.sub(r"-pixal$", "", stem))
    for key in (f"{base}.glb", f"{stem}.glb"):
        if key in see: i["see"] = see[key]; break
    ship = i.pop("_ship", None)
    i["shipped"] = bool(ship and md5(ship) in shipped)
# 3D items from games-src/FACELIFT.md that should exist as a Pixal3D game bake; shown as "missing" cards until they do.
# value = why it is missing (shown on the card)
QUEUED = "queued on the A100 (Pixal3D)"
EXPECTED = {
    "crown-city-smash/clampede": QUEUED, "crown-city-smash/dot": QUEUED,
    "rampart-and-vine/piece-champ": QUEUED, "rampart-and-vine/piece-hog": QUEUED,
    "rampart-and-vine/piece-mason": QUEUED, "rampart-and-vine/piece-meeple": QUEUED,
    "thornbound-throne/throne": QUEUED, "cauldron-fair/bag": QUEUED, "cauldron-fair/chip": QUEUED,
    "final-approach/plane": QUEUED,
    "hollowbough/ever-tree": "needs a new single-object Flow image (only a full card scene exists)",
    "kaiten-kitchen/cloche": "needs a new Flow image (no painting exists)",
    "kaiten-kitchen/plate": "needs a new Flow image (no painting exists)",
    "hollowbough/worker": "needs its 2D facelift painting first (FACELIFT H2)",
    "crown-city-smash/token-energy": "needs its 2D facelift painting first (FACELIFT C5)",
    "crown-city-smash/token-star": "needs its 2D facelift painting first (FACELIFT C5)",
    "crown-city-smash/token-heart": "needs its 2D facelift painting first (FACELIFT C5)",
}
for i in items:  # every reviewed item should also get a Pixal3D game bake
    EXPECTED.setdefault(f"{i['game']}/{re.sub(r'(-v[0-9]+)?(-pixal(-game)?)?$', '', i['name'])}", QUEUED)
have = {f"{i['game']}/{re.sub(r'(-v[0-9]+)?-pixal-game$', '', i['name'])}" for i in items if i["name"].endswith("-pixal-game")}
def missing_src(game, item):
    """Picture for a missing card: the cut-out going into Pixal3D, else the Flow source, else none."""
    for p in [CUT / f"{game}__{item}.png", *sorted((V.parent / "flow-3d" / game).glob(f"{item}*.jpg"))]:
        if p.exists():
            shutil.copy(p, V / "src" / f"missing__{game}__{p.name}"); return f"src/missing__{game}__{p.name}"
    return None
missing = [{"game": k.split("/")[0], "name": k.split("/")[1], "missing": why, "src": missing_src(*k.split("/"))}
           for k, why in sorted(EXPECTED.items()) if k not in have]
json.dump(items + missing, open(V / "manifest.json", "w"), indent=1)
print(len(missing), "missing items listed")
print(len(items), "models in viewer/manifest.json")
