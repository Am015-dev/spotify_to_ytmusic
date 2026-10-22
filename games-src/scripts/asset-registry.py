#!/usr/bin/env python3
"""Asset registry builder: one record per element, the single source of truth for what a game shows.

  python3 games-src/scripts/asset-registry.py [game]        (game: nightrun, the only one so far)

Writes games-src/<game>/assets.registry.json and the read-only view games-src/<game>/ASSET-REGISTRY.md
(plus <GAME_ASSETS>/logs/nr_registry_counts.json when the laptop asset folder exists).

Inputs
  repo (laptop and Linux): live media tree, media/placeholders.json, placeholder_guard.py, asset-coverage.json,
      assets-manifest.json, expected-assets.json, approved sheets (games-src/anims/<slug>/sheets), the built game
      code (wiring_scan.py), the previous registry.
  laptop only (GAME_ASSETS, default C:\\Users\\kourisa\\Desktop\\TALON_assets): logs/NR-MISSING-MASTER.json (element
      list, classes, aliases, code spots, sizes, prompts), Flow images (flow-2d/<slug>/...), viewer/votes2d.json,
      viewer/sprite_reviews.json. When absent, the element list and the source/approval fields come from the
      previous registry unchanged.

Status (scripts only; 'verified' needs a render check record, none exists yet):
  retired    master class SUPERSEDED (flags.duplicate_of = the sheet)
  wired      delivered and at least one slot has hook yes
  delivered  live repo file exists, is not a placeholder, and its size is at least the spec
  approved   owner vote ok recorded for the source image (or the sheet sits in the approved sheet store)
  generated  some image exists (laptop source, ingest branch, live file failing dims) but no approval
  needs-art  nothing usable exists anywhere
Self-checks exit 1; the master/live disagreement gate (> 5 % of rows) exits 2 before anything is written.
"""
import collections, datetime, hashlib, json, os, re, subprocess, sys
from pathlib import Path
from PIL import Image

GAME = (sys.argv[1:] or ["nightrun"])[0]
SLUG = {"nightrun": "mainhattan-nightrun"}[GAME]
REPO = Path(__file__).resolve().parents[2]
SRC = REPO / "games-src" / GAME
PARTS = SRC / "parts"
MEDIA = REPO / "games" / SLUG / "media"
SHEETS = REPO / "games-src" / "anims" / SLUG / "sheets"
INBOX = REPO / "assets-inbox" / SLUG
OUT = SRC / "assets.registry.json"
OUT_MD = SRC / "ASSET-REGISTRY.md"
GA = Path(os.environ.get("GAME_ASSETS", r"C:\Users\kourisa\Desktop\TALON_assets"))
LAPTOP = (GA / "logs").is_dir()
MASTER = GA / "logs" / "NR-MISSING-MASTER.json"
ING_REF = "nr/full-size-assets"
TODAY = datetime.date.today().isoformat()
IMG = (".png", ".jpg", ".jpeg", ".webp")
BY = "asset-registry.py"

jl = lambda p, d=None: json.load(open(p, encoding="utf-8")) if Path(p).exists() else d
git = lambda *a: subprocess.run(["git", "-C", str(REPO), *a], capture_output=True, text=True, encoding="utf-8", errors="replace").stdout.strip()
sha = lambda p: hashlib.sha256(Path(p).read_bytes()).hexdigest()
md5 = lambda p: hashlib.md5(Path(p).read_bytes()).hexdigest()
HEAD = git("rev-parse", "HEAD")

sys.path.insert(0, str(SRC)); import placeholder_guard as PG  # noqa: E402
_cwd = os.getcwd(); sys.path.insert(0, str(REPO / "games-src" / "scripts")); import wiring_scan as W; os.chdir(_cwd)  # noqa: E402
# wiring_scan.text() would also read media/*.json on Windows ('/media' never matches a backslash path): seed it with code only
_t = []
for dp, dn, fn in os.walk(REPO / "games" / SLUG):
    dn[:] = sorted(d for d in dn if d not in ("media", "music", "icons", "models", "cards"))
    _t += [open(os.path.join(dp, x), encoding="utf-8", errors="ignore").read() for x in sorted(fn) if x.endswith((".html", ".js", ".css"))]
W.H[SLUG] = "".join(_t)
# names built in code without a media/ literal ('spr-boss-'+n, 'ach-'+id): wiring_scan.prefixes only sees media/ ones; >= 4 chars keeps 'fx-'/'ui-' out
BUILT = {p for p in re.findall(r"""['"`]([a-z][a-z0-9_]*-(?:[a-z0-9_]+-)*)['"`]\s*\+""", W.H[SLUG]) if len(p) >= 4} | W.prefixes(SLUG)

PH = jl(MEDIA / "placeholders.json", {})
MAN = {e["file"]: e for e in jl(SRC / "assets-manifest.json", [])}
EXP = {e["stem"]: e for e in jl(REPO / "games-src" / "next-wave" / "expected-assets.json", []) if e.get("slug") == SLUG}
COV = jl(SRC / "asset-coverage.json", {})
SEEN = set(COV.get("drawnFiles", [])) | set(COV.get("shownFiles", []))
READY = set(jl(MEDIA / "ready.json", []))
PREV = {r["id"]: r for r in (jl(OUT, {}) or {}).get("records", [])}
PREV_BY_NAME = {a: r["id"] for r in PREV.values() for a in r.get("aliases", [])}
PARTTEXT = {str(p.relative_to(SRC)).replace("\\", "/"): p.read_text(encoding="utf-8", errors="ignore") for p in sorted(PARTS.rglob("*")) if p.suffix in (".js", ".html")}
STREET = {"kai", "grunt", "gunman", "shield", "bruiser", "knife", "sniper", "warden", "drone", "turret", "mech", "jetpack", "hound", "flamer", "ninja", "medic"}
VOTES = jl(GA / "viewer" / "votes2d.json", {}) if LAPTOP else {}
SPRV = jl(GA / "viewer" / "sprite_reviews.json", {}) if LAPTOP else {}
VOTES3 = jl(GA / "viewer" / "votes.json", {}) if LAPTOP else {}


def vote(stem):
    v = VOTES.get(f"{SLUG}/{stem}") or VOTES3.get(f"{SLUG}/{stem}")
    return (v.get("v") if isinstance(v, dict) else v) or None


# ------------------------------------------------------------------ element rows (master list, else the previous registry)
def rows():
    if LAPTOP and MASTER.exists():
        m = jl(MASTER)
        return m["meta"], [dict(old=e["id"], aliases=e["aliases"], title=e["element"], spots=e["code_spots"], size=e["size"], alpha=e["transparent"],
                                prompt=e["prompt"], prompt_status=e["prompt_status"], round=e["round"], cls=e["class"], note=e["note"],
                                needs_hook=e["needs_hook"], paths=e["existing_paths"]) for e in m["rows"]]
    out = []
    for r in PREV.values():
        sp = r["spec"]; mm = r["master"]
        out.append(dict(old=r["aliases"][0], aliases=r["aliases"][1:], title=r["title"], spots=[f"{s['code'][len('games-src/' + GAME + '/'):]} {s.get('what', '')}" for s in r["slots"] if s.get("code") and s.get("from") == "master"],
                        size=f"{sp['w']}x{sp['h']}" if sp.get("w") else None, alpha=sp.get("alpha"), prompt=r["prompt"], prompt_status=r["prompt_status"], round=r["round"],
                        cls=mm["class"], note=mm["note"], needs_hook=mm["needs_hook"], paths=mm["paths"]))
    return {"repo_head": ((jl(OUT, {}) or {}).get("meta") or {}).get("master_repo_head"), "total": len(out)}, out


# ------------------------------------------------------------------ files
def media_files(k):
    if k.startswith("sheet:"): return [f"anim/{k[6:]}-strip.webp"]
    if k.startswith("code:"): return []
    return [f"{k}.webp", f"poses/{k}.webp"]


def dims(p):
    try:
        with Image.open(p) as im: return im.size, (im.mode in ("RGBA", "LA", "PA") or "transparency" in im.info)
    except Exception: return None, None


def is_placeholder(rel):
    p = MEDIA / rel
    if PH.get(rel) == md5(p): return True
    try: return bool(PG.is_placeholder(str(p), MAN, PH))
    except Exception: return False


def laptop_index():
    idx = collections.defaultdict(list)
    if not LAPTOP: return idx
    skip = {"flowthumbs", "_stale", "_redo", "rejects", "__pycache__", "node_modules"}
    for top in sorted(GA.iterdir()):
        if not top.is_dir() or top.name in ("viewer", "logs", "rejects"): continue
        for d, dirs, files in os.walk(top):
            dirs[:] = sorted(x for x in dirs if x not in skip and not x.startswith(("_old_", "_rejected_", "_backup")))
            if "nightrun" not in d.lower(): continue
            for fn in files:
                if fn.lower().endswith(IMG) and not fn.startswith(("_old_", "_rejected_")): idx[os.path.splitext(fn)[0].lower()].append(Path(d) / fn)
    for d, dirs, files in os.walk(INBOX):
        for fn in files:
            if fn.lower().endswith(IMG): idx[os.path.splitext(fn)[0].lower()].append(Path(d) / fn)
    return idx


IDX = laptop_index()


def stems(k):
    if k.startswith("sheet:"):
        w, a = k[6:].split("/", 1); return {f"strip-{w}-{a}", f"{w}-{a}-strip"}
    if k.startswith("code:"): return set()
    b = k.split("/")[-1]; s = {k.replace("/", "-")}
    if k.startswith("foot/"): s |= {b, "foot-" + b}
    return s


_us = {}
def usable(p):
    """(w, h) of a usable full-size laptop image, else None (thumbnail, <= 256 px, skip marker, unreadable, owner redo/drop)"""
    if p not in _us:
        r = None
        if "flowthumbs" not in p.parts and p.stat().st_size >= 1000 and b"SKIP-MARKER" not in p.read_bytes()[:4096]:
            sz, _ = dims(p)
            if sz and max(sz) > 256 and vote(p.stem) not in ("redo", "drop"): r = sz
        _us[p] = r
    return _us[p]


def laptop_hits(names, paths):
    hits = set()
    for k in names:
        for s in stems(k):
            for p in IDX.get(s.lower(), []):
                if not k.startswith("foot/") and INBOX in p.parents and ((MEDIA / "foot" / f"{p.stem}.webp").exists() or f"foot/{p.stem}" in names): continue
                # a bare name (pk-bomb) is the street foot/ picture only inside a foot folder or the inbox; elsewhere it is the fly-stage one
                if k.startswith("foot/") and s == k.split("/")[-1] and INBOX not in p.parents and not any("foot" in x.lower() for x in p.parts[:-1]): continue
                hits.add(p)
    for x in paths:   # the master's own laptop finds ("C:\...\x.jpg (WxH)")
        p = Path(re.sub(r" \(\d+x\d+\)$", "", x))
        if p.is_absolute() and p.exists(): hits.add(p)
    return sorted((p for p in hits if usable(p)), key=lambda p: (vote(p.stem) != "ok", -usable(p)[0] * usable(p)[1], -p.stat().st_mtime, str(p)))


# ------------------------------------------------------------------ screens, kinds, ids
FOLDER = {"audio": "shared", "bosses": "boss", "core": "shared", "difficulty": "fly-stage", "districts": "fly-stage", "drills": "fly-stage", "enemies": "fly-stage",
          "fx": "fly-stage", "hangar": "hangar", "hud": "hud", "lab": "lab", "menus": "menus", "music": "shared", "powers": "fly-stage", "profile": "menus",
          "qa-hooks": "lab", "render": "fly-stage", "story": "story", "street": "street-stage", "waves": "fly-stage", "weapons": "fly-stage", "art": "shared"}
FILE = {"menus/title.js": "title", "art/foeart.js": "fly-stage", "art/bulletart.js": "fly-stage", "art/fxwave.js": "fly-stage",
        "weapons/forge.js": "hangar", "weapons/forgeone.js": "hangar", "weapons/forgeui.js": "hangar", "weapons/inventory.js": "hangar"}
BOSSN = ("boss-", "spr-boss-", "anim-boss-", "kronos-", "messe-", "bruecken-", "flusskrake-", "hoplite-", "schranken-", "sek-", "talos-", "tresor-", "zentral-")
PFX_SCREEN = [("title", "title"), (BOSSN, "boss"), (("foot/", "code:street-"), "street-stage"),
              (("kit-", "wp-", "wpmount-", "garage", "cls-", "abup-"), "hangar"),
              (("ach-", "medal-", "diff-", "soon-", "card-", "go-", "bpause", "nv-skin-", "end-") , "menus"), (("char-",), "story"), (("event-",), "hud"),
              (("fx-", "en-", "ship-e", "eship-", "pk-", "ly-", "bg-", "rule-", "rx-", "bp-", "ac-", "var-", "fl-", "spr-en-", "prop-"), "fly-stage"),
              (("ship-",), "hangar"), (("lab",), "lab"), (("ui-",), "shared")]
AREA = {"title": "title", "hangar": "hangar", "fly-stage": "fly", "street-stage": "street", "boss": "boss", "hud": "hud", "menus": "menu", "story": "story", "lab": "lab", "shared": "shared"}
SCREENS = list(AREA)


def id_screen(k):
    if k.startswith("sheet:"):
        w = k[6:].split("/")[0]
        return "boss" if w.startswith("boss-") else "street-stage" if w in STREET else "fly-stage"
    b = k[5:] if k.startswith("code:") else k
    if k.startswith("code:street-"): return "street-stage"
    if b.endswith("btn") or "btn-" in b: return "menus"
    for pf, sc in PFX_SCREEN:
        if b.startswith(pf): return sc
    return None


def spot_screen(path):
    rel = path[len("parts/"):] if path.startswith("parts/") else path
    return FILE.get(rel) or FOLDER.get(rel.split("/")[0]) if "/" in rel else None


def kind_of(k):
    b = k.split(":")[-1].split("/")[-1]
    if k.startswith("sheet:"): return "strip"
    if b.startswith(("bg-", "ly-")) or b in ("garage", "garage-phone", "title", "title-phone"): return "bg-layer"
    if b.startswith("fx-"): return "fx"
    if b.endswith("-plate"): return "plate"
    if b.startswith(("ui-", "ach-", "kit-", "medal-", "diff-", "card-", "soon-", "cls-", "abup-", "nv-", "wp-", "wpmount-", "gk-", "rx-", "chest-", "event-", "end-", "icon")) or "btn" in b: return "ui"
    return "still"


LAYER = {"bg-layer": "bg", "strip": "sprite", "still": "sprite", "fx": "fx", "ui": "ui", "plate": "ui", "tile": "bg", "audio": "audio"}
clean = lambda s: re.sub(r"[^a-z0-9-]+", "-", s.lower()).strip("-")


def new_id(k, screen):
    a = AREA[screen]
    if k.startswith("sheet:"):
        w, act = k[6:].split("/", 1); return f"nr.{a}.{clean(w)}.{clean(act)}"
    if k.startswith("code:"): return f"nr.{a}.code-{clean(k[5:])}"
    return f"nr.{a}.{clean(k.split('/', 1)[1] if k.startswith('foot/') else k)}"


# ------------------------------------------------------------------ spec
def wxh(s):
    m = re.search(r"(\d+)\s*x\s*(\d+)", str(s or ""))
    return (int(m.group(1)), int(m.group(2))) if m else None


def spec_of(e, k, rel):
    frames, sz = 1, wxh(e["size"])
    if k.startswith("sheet:"):
        j = jl(SHEETS / f"{k[6:]}-strip.json", {}) or {}
        frames = j.get("frames", 1)
        if j.get("w"): sz = (j["w"] * frames, j["h"])
    if not sz and rel and MAN.get(rel, {}).get("w"): sz = (MAN[rel]["w"], MAN[rel]["h"])
    if not sz and not k.startswith(("sheet:", "code:")) and k in EXP: sz = wxh(EXP[k].get("size"))
    w, h = sz or (None, None)
    pre = "lazy" if (not rel or rel.startswith("anim/") or rel not in READY) else "boot"
    return dict(w=w, h=h, frames=frames, alpha=bool(e["alpha"]), max_decoded_kb=(w * h * 4 // 1024) if w else None, preload=pre)


# ------------------------------------------------------------------ hooks
def tok_re(t):
    return re.compile(r"(?<![A-Za-z0-9_-])" + re.escape(t) + ("" if t.endswith("-") else r"(?![A-Za-z0-9_-])"))


def first_line(text, rx):
    m = rx.search(text)
    return text.count("\n", 0, m.start()) + 1 if m else None


def hooks(e, k, names, rel, slots):
    """mark slot hooks; returns (referenced, extra needs_check reason)"""
    if e["needs_hook"] or e["cls"] in ("NEEDS-HOOK", "SUPERSEDED"): return False, None
    if k.startswith("sheet:"):
        w, a = k[6:].split("/", 1)
        refd = f"anim/{w}/{a}-strip.webp" in SEEN
        toks = [f"{w}/{a}", w]
    else:
        plain = [n for n in names if not n.startswith(("sheet:", "code:"))]
        if rel: plain.append(rel[:-5])
        pf = [p for p in sorted(BUILT) if any(n.startswith(p) and len(p) >= 3 for n in plain)]
        refd = bool(rel) and (rel in SEEN or bool(pf) or any(W.refs(SLUG, n) for n in plain))
        toks = list(dict.fromkeys(plain + pf))
    if not refd: return False, None
    rxs = [tok_re(t) for t in toks]
    hit = False
    for s in slots:
        if s["code"]:
            txt = PARTTEXT.get(s["code"].split(":")[0][len(f"games-src/{GAME}/"):], "")
            if any(r.search(txt) for r in rxs): s["hook"] = "yes"; hit = True
    if hit: return True, None
    for r in rxs:   # referenced, but not at a listed spot: locate the first code line that names it
        for f, txt in PARTTEXT.items():
            ln = first_line(txt, r)
            if ln:
                slots.append(dict(screen=spot_screen(f) or "shared", scene=None, entity=slots[0]["entity"] if slots else None, layer=slots[0]["layer"] if slots else None,
                                  code=f"games-src/{GAME}/{f}:{ln}", hook="yes", what="located by name", **{"from": "scan"}))
                return True, None
    slots.append(dict(screen=slots[0]["screen"] if slots else "shared", scene=None, entity=None, layer=None, code=f"games-src/{GAME}/asset-coverage.json", hook="yes",
                      what="drawn in the runtime coverage run", **{"from": "scan"}))
    return True, "referenced only by the runtime coverage run; no code line names it (name built in code)"


# ------------------------------------------------------------------ build
GATE = []


def build():
    meta, R = rows()
    names_all = {n for e in R for n in [e["old"]] + e["aliases"]}
    # gate: master vs live tree
    gate, arrived = [], []
    for e in R:
        rel = next((r for n in [e["old"]] + e["aliases"] for r in media_files(n) if (MEDIA / r).exists()), None)
        real = bool(rel) and not is_placeholder(rel)
        if e["cls"] == "DELIVERED" and e["old"].startswith(("sheet:", "code:")) is False and not real and not any(x.startswith("media/") for x in e["paths"]): gate.append((e["old"], "master DELIVERED, live file missing or placeholder"))
        if e["cls"] in ("NEEDS-ART", "HAVE-SOURCE") and real: arrived.append(e["old"])   # a delivery landed (ingest): the status below is computed from the live file, so this is the expected change, not a disagreement
    if arrived: print(f"note: {len(arrived)} rows the master list still calls NEEDS-ART / HAVE-SOURCE have a real live file now (delivered by ingest)")
    GATE[:] = [len(gate), len(R)]
    if len(gate) > 0.05 * len(R):
        print(f"STOP: master list ({meta.get('repo_head')}) and live tree ({HEAD}) disagree on {len(gate)}/{len(R)} rows"); [print(" ", *g) for g in gate[:60]]; sys.exit(2)

    recs, sheet_ids = [], {}
    for e in R:
        k, names = e["old"], [e["old"]] + e["aliases"]
        rel = next((r for n in names for r in media_files(n) if (MEDIA / r).exists()), None)
        cand = None
        if not rel:   # no own file: the art the master found for it (code rows, NEEDS-CHECK rows)
            cand = next((x[6:] for x in e["paths"] if x.startswith("media/") and "*" not in x and (MEDIA / x[6:]).exists()), None)
            rel = cand
        # slots
        slots = []
        for sp in e["spots"]:
            m = re.match(r"(\S+?):(\d+)\s*(.*)", sp)
            if not m: continue
            f, ln, what = m.groups()
            sc = spot_screen(f)
            slots.append(dict(screen=sc, scene="athens" if "/districts/athens" in f else None, entity=k.split(":")[-1].split("/")[0] if k.startswith("sheet:") else k.split(":")[-1].split("/")[-1],
                              layer=LAYER[kind_of(k)], code=f"games-src/{GAME}/{f}:{ln}", hook="no", what=what, **{"from": "master"}))
        nc = []
        if e["cls"] == "NEEDS-CHECK": nc.append(e["note"])
        if not slots: nc.append("no code spot")
        ids = id_screen(k)
        known = [s["screen"] for s in slots if s["screen"] and s["screen"] != "shared"]
        screen = ids or (collections.Counter(known).most_common(1)[0][0] if known else ("shared" if any(s["screen"] == "shared" for s in slots) else None))
        if not screen: screen = "shared"; nc.append("screen unknown")
        for s in slots:
            if not s["screen"]: s["screen"] = screen if ids else "shared"
        rid = next((PREV_BY_NAME[n] for n in names if n in PREV_BY_NAME), None) or new_id(k, screen)
        if k.startswith("sheet:"): sheet_ids[k] = rid
        # game file
        game, real, gsz, galpha = None, False, None, None
        if rel:
            gsz, galpha = dims(MEDIA / rel)
            real = not is_placeholder(rel)
            game = dict(path=f"games/{SLUG}/media/{rel}", sha256=sha(MEDIA / rel), w=gsz[0] if gsz else None, h=gsz[1] if gsz else None)
        spec = spec_of(e, k, rel)
        # source (laptop) and approval
        if LAPTOP:
            hits = laptop_hits(names, e["paths"])
            src = None
            if hits:
                p = hits[0]; w, h = usable(p)
                src = dict(path=str(p), sha256=sha(p), w=w, h=h, vote=vote(p.stem))
        else:
            src = (PREV.get(rid) or {}).get("source")
        sheet_store = k.startswith("sheet:") and (SHEETS / f"{k[6:]}-strip.json").exists()
        sheet_cand = [x for x in e["paths"] if x.startswith("sheet:") and (SHEETS / x[6:].split("/")[0]).is_dir()]
        review = SPRV.get(f"{SLUG}/{k[6:]}", {}).get("v") if k.startswith("sheet:") else None
        if review == "fix": nc.append("sprite review: fix")
        approved = (src or {}).get("vote") == "ok" or ((sheet_store or (sheet_cand and not src and not rel)) and review != "fix")
        ingest = [x for x in e["paths"] if x.startswith(ING_REF + ":")]
        wild = [x for x in e["paths"] if x.startswith("media/") and "*" in x and any(not is_placeholder(str(q.relative_to(MEDIA)).replace("\\", "/")) for q in MEDIA.glob(x[6:]))]
        image = bool(src or ingest or real or sheet_store or sheet_cand or wild)
        # checks
        if not rel or not real: dck = "not_run"
        elif not gsz: dck = "fail"
        elif spec["w"]: dck = "pass" if gsz[0] >= spec["w"] and gsz[1] >= spec["h"] else "fail"
        else: dck = "pass" if max(gsz) > 256 else "fail"
        if dck == "fail": nc.append(f"repo file {gsz and gsz[0]}x{gsz and gsz[1]} below spec {spec['w']}x{spec['h']}" if spec["w"] else f"no spec size and repo file {gsz and gsz[0]}x{gsz and gsz[1]} is <= 256 px")
        ack = "not_run" if not rel or not real else ("pass" if galpha or not spec["alpha"] else "fail")
        if ack == "fail": nc.append("spec wants alpha, repo file has none")
        refd, why = hooks(e, k, names, rel, slots)
        if why: nc.append(why)
        # status
        if e["cls"] == "SUPERSEDED": st = "retired"
        elif real and dck == "pass": st = "wired" if any(s["hook"] == "yes" for s in slots) else "delivered"
        elif approved: st = "approved"
        elif image: st = "generated"
        else: st = "needs-art"
        blocked = f"real file waits on branch {ING_REF} (not merged)" if ingest and not real else None
        recs.append(dict(id=rid, title=e["title"], kind=kind_of(k), aliases=names, slots=slots, spec=spec, prompt=e["prompt"], prompt_status=e["prompt_status"],
                         source=src, game=game, status=st, screen=screen,
                         flags=dict(placeholder=bool(rel) and not real, needs_check=" | ".join(x for x in nc if x) or None, blocked=blocked, duplicate_of=None),
                         checks=dict(dims=dck, alpha=ack, referenced="pass" if refd else ("fail" if rel else "not_run"), rendered="not_run"),
                         round=e["round"], history=None, master=dict(**{"class": e["cls"]}, note=e["note"], needs_hook=e["needs_hook"], paths=e["paths"]),
                         _image=image, _cand=cand))
    # duplicate_of for retired rows: the covering sheet (exact act if it has a record, else the actor)
    for r in recs:
        if r["status"] != "retired": continue
        sh = next((x for x in r["master"]["paths"] if x.startswith("sheet:")), None)
        if sh:
            w, a = sh[6:].split("/", 1)
            act = r["aliases"][0].split("/")[-1]
            exact = next((sheet_ids[s] for s in (f"sheet:{w}/{a}", f"sheet:{w}/{act.split('-', 1)[-1]}", f"sheet:{w}/{act}") if s in sheet_ids), None)
            r["flags"]["duplicate_of"] = exact or f"nr.{AREA[id_screen('sheet:' + w + '/x')]}.{clean(w)}"
        else: r["flags"]["duplicate_of"] = "unknown"; r["flags"]["needs_check"] = "retired without a covering sheet in the master list"
    # rows without a file of their own (code stand-ins) take the best status of the art the master found for them; their own hooks stay no
    by_name = {a: r for r in recs for a in r["aliases"]}
    for r in recs:
        if r["status"] != "needs-art" or r["game"] and not r["_cand"]: continue
        alt = []
        for x in r["master"]["paths"]:
            x = x[6:-5] if x.startswith("media/") and x.endswith(".webp") else x
            alt += [a for n, a in by_name.items() if n.startswith(x.split("*")[0])] if "*" in x else [by_name.get(x)]
        alt = [a for a in alt if a and a is not r and a["status"] not in ("needs-art", "retired")]
        if alt:
            best = max(alt, key=lambda a: ORDER.index(a["status"]))
            r["status"] = "delivered" if best["status"] == "wired" else best["status"]; r["_image"] = True
            r["flags"]["needs_check"] = " | ".join(x for x in (r["flags"]["needs_check"], f"art is {best['id']} ({best['status']}); this spot never asks for it") if x)
        elif r["master"]["class"] == "NEEDS-HOOK":
            r["flags"]["needs_check"] = " | ".join(x for x in (r["flags"]["needs_check"], "master NEEDS-HOOK names art but lists no file: " + r["master"]["note"]) if x)
    for r in recs:   # history: append only when the status differs from the previous registry
        p = PREV.get(r["id"]); r["history"] = list((p or {}).get("history", []))
        if not p or p.get("status") != r["status"]: r["history"].append({"date": TODAY, "from": p.get("status") if p else None, "to": r["status"], "by": BY})
    recs.sort(key=lambda r: r["id"])
    selfcheck(recs, R, names_all)
    return meta, recs


def selfcheck(recs, R, names_all):
    ids = [r["id"] for r in recs]
    assert len(ids) == len(set(ids)), ("duplicate ids", [i for i, n in collections.Counter(ids).items() if n > 1])
    owner = collections.Counter(a for r in recs for a in r["aliases"])
    assert all(owner[n] == 1 for n in names_all), ("master name not mapped exactly once", [n for n in names_all if owner[n] != 1][:10])
    assert len(recs) == len(R)
    cnt = collections.Counter(r["status"] for r in recs)
    assert sum(cnt.values()) == len(recs)
    for r in recs:
        if r["status"] in ("delivered", "wired"):
            g = r["game"]
            assert g and g["w"] and (max(g["w"], g["h"]) > 256 or (r["spec"]["w"] and max(r["spec"]["w"], r["spec"]["h"]) <= 256)), ("small delivered file", r["id"])
        if r["status"] == "needs-art":
            assert not r["_image"] and not r["source"] and not (r["game"] and not r["flags"]["placeholder"]), ("needs-art has an image", r["id"])
            if LAPTOP: assert not laptop_hits(r["aliases"], r["master"]["paths"]), ("needs-art has a laptop image", r["id"])
        assert r["status"] != "verified"


# ------------------------------------------------------------------ views
ORDER = ["needs-art", "generated", "approved", "delivered", "wired", "verified", "retired"]


def summary(meta, recs):
    st = collections.Counter(r["status"] for r in recs)
    scr = collections.Counter(r["screen"] for r in recs)
    slots = collections.Counter(s["screen"] for r in recs for s in r["slots"])
    mp = collections.Counter(f"{r['master']['class']} -> {r['status']}" for r in recs)
    nc = collections.Counter(re.split(r"[;:(]", x)[0].strip()[:90] for r in recs if r["flags"]["needs_check"] for x in r["flags"]["needs_check"].split(" | "))
    dimf = sorted(f"{r['id']} ({r['game']['w']}x{r['game']['h']} vs spec {r['spec']['w']}x{r['spec']['h']})" for r in recs if r["checks"]["dims"] == "fail")
    return dict(repo_head=HEAD, master_repo_head=meta.get("repo_head"), master_live_disagree=GATE, records=len(recs), status={k: st[k] for k in ORDER}, screen={k: scr[k] for k in SCREENS},
                slots_by_screen={k: slots[k] for k in SCREENS}, slots=sum(slots.values()), slots_hook_no=sum(s["hook"] == "no" for r in recs for s in r["slots"]),
                master_to_status=dict(sorted(mp.items())), needs_check_top=nc.most_common(10), needs_check_records=sum(1 for r in recs if r["flags"]["needs_check"]),
                dims_fail=dimf, blocked=sum(1 for r in recs if r["flags"]["blocked"]), placeholders=sum(1 for r in recs if r["flags"]["placeholder"]))


def md(sm, recs):
    wh = lambda d: f"{d['w']}x{d['h']}" if d and d.get("w") else "-"
    L = [f"# {SLUG}: asset registry (generated view)", "",
         f"Generated by `games-src/scripts/asset-registry.py` from `assets.registry.json`. Do not edit: re-run the script. Live HEAD `{HEAD[:8]}`, master list HEAD `{(sm['master_repo_head'] or '-')[:8]}`, {sm['records']} records, {sm['slots']} slots ({sm['slots_hook_no']} with hook no).", "",
         "Done only ever means `verified` (a render check record); none exists yet, so `checks.rendered` is `not_run` everywhere.", "",
         "## Counts per status", "", "| status | records |", "|---|---|"] + [f"| {k} | {v} |" for k, v in sm["status"].items()] + [
         "", "## Counts per screen", "", "| screen | records | slots |", "|---|---|---|"] + [f"| {k} | {sm['screen'][k]} | {sm['slots_by_screen'][k]} |" for k in SCREENS] + [
         "", "## Master class -> registry status", "", "| mapping | records |", "|---|---|"] + [f"| {k} | {v} |" for k, v in sm["master_to_status"].items()] + [""]
    for sc in SCREENS:
        rows = [(r, s) for r in recs for s in (r["slots"] or [None]) if (s["screen"] if s else r["screen"]) == sc]
        rows += [(r, None) for r in recs if not r["slots"] and r["screen"] == sc and (r, None) not in rows]
        if not rows: continue
        L += [f"## {sc} ({len(rows)} slots)", "", "| id | status | game w x h | source w x h | hook | code spot |", "|---|---|---|---|---|---|"]
        for r, s in sorted(rows, key=lambda x: (ORDER.index(x[0]["status"]), x[0]["id"], x[1]["code"] if x[1] and x[1]["code"] else "")):
            L.append(f"| {r['id']} | {r['status']} | {wh(r['game'])} | {wh(r['source'])} | {s['hook'] if s else 'no'} | {(s['code'] or '-') if s else '-'} |")
        L.append("")
    return "\n".join(L)


def main():
    meta, recs = build()
    sm = summary(meta, recs)
    for r in recs: r.pop("_image"); r.pop("_cand")
    reg = dict(meta=dict(game=GAME, slug=SLUG, repo_head=HEAD, master_repo_head=meta.get("repo_head"), builder=BY, statuses=ORDER, screens=SCREENS), records=recs)
    OUT.write_text(json.dumps(reg, indent=1, ensure_ascii=False, sort_keys=True) + "\n", encoding="utf-8")
    OUT_MD.write_text(md(sm, recs) + "\n", encoding="utf-8")
    if LAPTOP: (GA / "logs" / "nr_registry_counts.json").write_text(json.dumps(sm, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({k: sm[k] for k in ("records", "status", "screen", "slots", "slots_hook_no", "master_to_status", "needs_check_top", "blocked")}, indent=1))
    print("dims_fail", len(sm["dims_fail"]), "| self-checks pass")


if __name__ == "__main__":
    main()
