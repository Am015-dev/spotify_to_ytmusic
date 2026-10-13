"""2D image review: Keep / Redo votes with an optional note, stored in viewer/votes2d.json ({"game/name": {"v": "ok"|"redo", "note": str}}).
Redo moves flow-2d/<game>/<name>.jpg to flow-2d/<game>/_redo/ (so run-images.mjs generates it again) and rewrites
flow-2d/<game>/prompts-redo-auto[-wide|-43|-34|-tall].json from the original prompt + the note. Un-voting a redo moves the old picture back."""
import json, os, re, shutil
from pathlib import Path

V = Path(__file__).parent
GA = Path(os.environ.get("GAME_ASSETS", V.parent))
FILE = V / "votes2d.json"
KEY = re.compile(r"^[a-z0-9-]+/[a-z0-9_-]+$")
SUF = {"1:1": "", "16:9": "-wide", "4:3": "-43", "3:4": "-34", "9:16": "-tall"}


def load():
    try: return json.loads(FILE.read_text(encoding="utf-8"))
    except Exception: return {}


def ratio_of(fname):
    for key, r in (("-wide", "16:9"), ("-43", "4:3"), ("-34", "3:4"), ("-tall", "9:16"), ("djinn", "4:3"), ("cards", "16:9")):
        if key in fname: return r
    return "1:1"


def sources(game):
    """name -> (style, prompt, ratio) from the game's own prompt files (not the auto redo files)."""
    out = {}
    for p in sorted((GA / "flow-2d" / game).glob("prompts*.json")):
        if p.name.startswith("prompts-redo-auto"): continue
        try: d = json.loads(p.read_text(encoding="utf-8"))
        except Exception: continue
        for n, pr in d.get("cards", {}).items(): out.setdefault(n, (d.get("style", ""), pr, ratio_of(p.name)))
    return out


def write_redo_files(game, votes):
    src, files = sources(game), {}
    for k, e in votes.items():
        g, n = k.split("/")
        if g != game or e.get("v") != "redo" or n not in src: continue
        style, prompt, ratio = src[n]
        note = (e.get("note") or "").strip()
        f = files.setdefault(SUF[ratio], {"style": style, "cards": {}})
        f["cards"][n] = prompt + (f", {note}" if note else "")
    folder = GA / "flow-2d" / game
    for suf in SUF.values():
        p = folder / f"prompts-redo-auto{suf}.json"
        if suf in files: p.write_text(json.dumps(files[suf], indent=1, ensure_ascii=False), encoding="utf-8")
        elif p.exists(): p.unlink()


def apply(key, v, note):
    if not KEY.match(key) or v not in ("ok", "redo", None) or len(note or "") > 300: raise ValueError("bad vote")
    game, name = key.split("/")
    folder = GA / "flow-2d" / game
    if not folder.is_dir(): raise ValueError("unknown game")
    votes, jpg, old = load(), folder / f"{name}.jpg", folder / "_redo" / f"{name}.jpg"
    was = votes.get(key, {}).get("v")
    if v: votes[key] = {"v": v, "note": (note or "").strip()}
    else: votes.pop(key, None)
    if v == "redo" and jpg.exists():
        old.parent.mkdir(exist_ok=True); shutil.move(str(jpg), str(old))
    if was == "redo" and v != "redo" and old.exists() and not jpg.exists():
        shutil.move(str(old), str(jpg))
    FILE.write_text(json.dumps(votes, indent=1, sort_keys=True, ensure_ascii=False), encoding="utf-8")
    write_redo_files(game, votes)
    return votes
