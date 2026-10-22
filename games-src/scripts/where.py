#!/usr/bin/env python3
"""WHERE.md for Mainhattan Nightrun: which part file owns a feature, which later files wrap it, which test and doc go with it.

  python3 games-src/scripts/where.py            # write games-src/nightrun/WHERE.md (<= 8 KB, committed)
  python3 games-src/scripts/where.py --check    # exit 1 when the committed WHERE.md is out of date

Reads parts/*.js sources only (never a built html). Line ranges and wrap lists are computed, so re-run after editing a part
(nightrun/where-test.js fails when WHERE.md is stale). Shared parsing lives in modmap.py (header_info, flag_table, parse_defs).
"""
import importlib.util, pathlib, re, sys

HERE = pathlib.Path(__file__).resolve().parent
SRC = HERE.parent
NR = SRC / "nightrun"
PARTS = NR / "parts"
OUT = NR / "WHERE.md"
LIMIT = 8192


def load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
    return m


mm = load("modmap_for_where", HERE / "modmap.py")
TESTS = sorted(p.name[:-8] for p in NR.glob("*-test.js"))          # stems: 'abil' for abil-test.js
DOCS = {p.name for p in NR.glob("*.md")} | {p.name for p in SRC.glob("*.md")}
NSDEF = re.compile(r"^\s*(?:const|let|var)\s+([A-Z][A-Za-z0-9_]*)\s*=|^\s*window\.([A-Z][A-Za-z0-9_]*)\s*=|^([A-Z][A-Za-z0-9_]*)\s*=", re.M)
PATCH = re.compile(r"^\s*(?:window\.)?([A-Z][A-Za-z0-9_]*)\.([A-Za-z_]\w*)\s*=(?!=)\s*(?:function\b|async\b|\([^)]*\)\s*=>|[A-Za-z_$][\w$]*\s*=>|[A-Za-z_$][\w$.]*\s*\()", re.M)


def short(n):
    return n[:-3] if n.endswith(".js") else n


def spans(defs, nlines):
    ds = sorted(defs, key=lambda d: d["line"])
    return [(d, d["line"], (ds[i + 1]["line"] - 1 if i + 1 < len(ds) else nlines)) for i, d in enumerate(ds)]


def key_fn(name, text, flags, defs):
    """The function/object that carries the feature: name matches the file or flag, else the longest function."""
    n = len(text.splitlines())
    sp = [x for x in spans(defs, n) if x[0]["kind"] in ("fn", "obj", "prop")]
    if not sp: return ""
    want = [w.lower() for w in [short(name)] + list(flags)]
    best = None
    for d, a, b in sp:
        base = d["name"].split(".")[0].lower()
        if any(w and (base == w or base.startswith(w) or w.startswith(base) and len(base) > 2) for w in want):
            if best is None or (b - a) > (best[2] - best[1]): best = (d, a, b)
    if best is None:
        best = max((x for x in sp if x[0]["kind"] == "fn"), key=lambda x: x[2] - x[1], default=max(sp, key=lambda x: x[2] - x[1]))
    d, a, b = best
    if b - a < 4:
        d, a, b = max((x for x in sp if x[0]["kind"] == "fn"), key=lambda x: x[2] - x[1], default=best)
    return "%s %d-%d" % (d["name"], a, b)


def test_for(name, text, flags):
    h = re.search(r"\b([\w-]+)-test\.js", text[:3000])
    if h and h.group(1) in TESTS: return h.group(1)
    for c in [short(name)] + list(flags) + ["ret-" + f for f in flags]:
        if c in TESTS: return c
    return ""


def doc_for(text):
    for m in re.finditer(r"\b([A-Z][A-Za-z0-9-]*\.md)\b", text[:3000]):
        if m.group(1) in DOCS: return m.group(1)[:-3]
    return ""


def analyse():
    a = mm.analyse("mainhattan-nightrun")
    files = a["files"]
    texts = {f["name"]: mm.rd(SRC / f["path"]) for f in files}
    ft = mm.flag_table(texts)
    idx = {f["name"]: f["idx"] for f in files}
    # namespaces (DP, ART, ABIL...) created in a file; later files assigning NS.fn = function are patches of it
    ns_owner = {}
    for f in files:
        for m in NSDEF.finditer(texts[f["name"]]):
            ns_owner.setdefault(next(g for g in m.groups() if g), f["name"])
    patches = {}       # file -> {owner file: [NS.name]}
    for f in files:
        for m in PATCH.finditer(texts[f["name"]]):
            o = ns_owner.get(m.group(1))
            if o and idx[o] < f["idx"]: patches.setdefault(f["name"], {}).setdefault(o, set()).add("%s.%s" % (m.group(1), m.group(2)))
    wraps = {}         # file -> {target file: set(symbols)}
    for i, pf in a["per_file"].items():
        for j, syms in pf.items():
            if j != i: wraps.setdefault(files[i]["name"], {}).setdefault(files[j]["name"], set()).update(syms)
    for fn, pf in patches.items():
        for o, syms in pf.items(): wraps.setdefault(fn, {}).setdefault(o, set()).update(syms)
    wrapped_by = {}
    for fn, pf in wraps.items():
        for o, syms in pf.items(): wrapped_by.setdefault(o, {})[fn] = syms
    return a, texts, ft, wraps, wrapped_by


def rows(a, texts, ft, wraps, wrapped_by):
    out = []
    for f in a["files"]:
        n, t = f["name"], texts[f["name"]]
        h = mm.header_info(t)
        flags = [x for x in re.findall(r"[A-Za-z0-9]+", h["flag"].split("(")[0] if False else (h["flag"] or "")) if x in ft]
        own = [x for x, v in ft.items() if v[0] == n]
        flags = list(dict.fromkeys([x for x in flags if ft[x][0] == n] + own))
        if not flags and n not in ("ret.js",):
            hh = re.findall(r"[Ff]lag RET\.(\w+)", t[:600])
            flags = [x for x in hh if x in ft]
        if not flags: continue
        out.append((n, t, flags, f))
    return out


def fmt_flags(flags, ft):
    if len(flags) > 4: return ",".join(x + ("!" if ft[x][1] == "off" and ft[x][2].startswith("?") else "" if ft[x][2].startswith("?") else "*") for x in flags)
    parts = []
    for x in flags:
        st, sw = ft[x][1], ft[x][2]
        parts.append(x + ("" if (st == "on" and sw.startswith("?")) else ("!" if sw.startswith("?") else "*")))
    return ",".join(parts)


def cell_list(d, cap):
    names = sorted(d, key=lambda k: -len(d[k]))
    s = ",".join(short(x) for x in names[:cap])
    return s + ("+%d" % (len(names) - cap) if len(names) > cap else "")


RECIPES = [
    ("Change an enemy's HP", "base table `en()` in b.js; the 8 later kinds `hp:` in zoo.js; scaling grit.js, scale.js/fair.js/hard.js. Edit the owner, never a wrapper."),
    ("Add a power-up", "`PWK` in power.js, effect in powerups.js (`PW2`), levels in powlevels.js (`PW3L`); extras `PWX` in arsenal.js (picker there). Case in powers-test.js."),
    ("Add a boss verb", "`vd('id','any'|boss,'what',(e,c,X,p)=>{..})` in bossmoves.js (see tri_burst); telegraph `bmMark`+`bmTelBul`; list it in the moveset `BMT`. HP phases armour.js, looks bossvis.js."),
    ("Add a lesson", "`LSN` list in lessons.js (helpers `lsFoe`, `lsWave`, `lsClear`). Test lessons-test.js (`?lessons=1`)."),
    ("Add an asset hook", "id in `assets-manifest.json`; picture only when in media/ready.json: `ART.img(id)` / `ART.anim(key)` (art.js), stand-in shapes.js, effects fxwave.js, on-foot footart.js. ASSET-POLICY.md."),
    ("Change a price", "pit-stop `SHOP.price(u)` + `UPG` in shop.js; perks `tpPrice` in upgrades.js; forge.js; econfit.js; up2.js."),
    ("Add a feature flag", "`if(RET.x===undefined)RET.x=!/[?&]x=0/.test(location.search);` in ret.js or the layer's first lines, new part + one `rd('x.js')` in parts/build.py, header (below). Ship ON; unfinished = OFF."),
    ("Change a formation / stage script", "formations.js (`vary`), stagescripts.js, remix.js, density.js, pacing.js, dir.js."),
    ("Change an on-foot enemy or section", "footen.js (enemies), foot.js (engine), footstage.js (stage `zeil`), footart.js. Tests foot-test.js, footstage-test.js."),
    ("Add a test", "copy the nearest `<name>-test.js` (react-test.js flag, bossmoves-test.js boss): Playwright, `?scn=` URL, PASS/FAIL lines; one at a time: `NODE_PATH=$(npm root -g) node games-src/nightrun/<name>-test.js`. Name it `x-test.js` for `x.js`; log in TEST-LEDGER.md."),
]


HOOKDEF = re.compile(r"hookable\('([\w.]+)'")
HOOKUSE = re.compile(r"HOOK(?:\.(\w+)|\['([\w.]+)'\])\(|(DRAW\.(?:pre|extra))\.push\(")


def hook_lines(a):
    """Hooked functions (consolidation step 3): the one home (hookable / DRAW owner) and its layers in registration (build) order."""
    home, lay = {"drawPickups": None}, {}
    for f in a["files"]:
        n = f["name"]; t = mm.rd(next(PARTS.rglob(n)))
        for m in HOOKDEF.finditer(t): home[m.group(1)] = "%s:%d" % (short(n), t[:m.start()].count("\n") + 1)
        if "const DRAW={" in t: home["drawPickups"] = "%s:%d" % (short(n), t[:t.index("const DRAW={")].count("\n") + 1)
        for m in HOOKUSE.finditer(t):
            if "//" in t[t.rfind("\n", 0, m.start()) + 1:m.start()]: continue   # a comment that names the hook
            k = m.group(1) or m.group(2) or ("drawPickups" if m.group(3) == "DRAW.extra" else "drawPickups(pre)")
            lay.setdefault(k, []).append(short(n))
    L = ["", "Hooked functions: ONE definition in its home part; layers register with one line (`HOOK.name(prev=>function(..){..})`, drawPickups: `DRAW.extra.push`), listed here in build order, last = outermost (zoo/leak register at their first runStart). Runtime list: `HOOKS[name]`.", ""]
    for k in sorted(home, key=lambda k: -len(lay.get(k, []))):
        ls = lay.get(k, []) + (["pre: " + ",".join(lay["drawPickups(pre)"])] if k == "drawPickups" and "drawPickups(pre)" in lay else [])
        L.append("- %s @ %s: %s" % (k, home[k], ", ".join(ls) or "-"))
    return L


def render():
    a, texts, ft, wraps, wrapped_by = analyse()
    L = ["# WHERE: Mainhattan Nightrun, which file owns what", "",
         "Generated by `games-src/scripts/where.py` (do not edit; `where-test.js` fails when stale). Later definition wins: `parts/build.py` order; so a behaviour can be split over its owner and the wrappers. Read the owner's line range, then the wrappers' only if needed.", "",
         "Flag: plain = ON, off with `?flag=0`; `!` = default OFF, on with `?flag=1`; `*` = code only (`RET.x=false`). Key = function and its line range. `>` = old files this layer overrides or patches; `<` = later files that wrap it.", "",
         "| flag | key (file name L1-L2) | > wraps | < wrapped by | test |", "|---|---|---|---|---|"]
    for n, t, flags, f in rows(a, texts, ft, wraps, wrapped_by):
        key = "" if len(flags) > 4 else "%s %s" % (short(n), key_fn(n, t, flags, f["defs"]))
        if len(flags) > 4: key = "ret (one `RET.x` line per flag, top of the file)"
        L.append("| %s | %s | %s | %s | %s |" % (fmt_flags(flags, ft), key.strip(), cell_list(wraps.get(n, {}), 3), cell_list(wrapped_by.get(n, {}), 3),
                                                      test_for(n, t, flags)))
    L += hook_lines(a)
    L += ["", "Files live in `parts/<folder>/<file>.js` (" + ", ".join(sorted({p.parent.name for p in PARTS.rglob("*.js")})) + "); each folder has a README.md (what it owns, its hook lists). Unflagged = core, data, art.", "",
          "## How to find X (named file, then the function)", ""]
    for i, (q, ans) in enumerate(RECIPES, 1): L.append("%d. **%s**: %s" % (i, q, ans))
    L += ["", "## Do not read", "",
          "- Built `games/mainhattan-nightrun/index.html`, `sw.js`, `x.js`, the joined `ui.js`: generated.",
          "- `nightrun/MODULES.md` (36 KB, git-ignored): only for exact line numbers of one file; use `MODULES-COMPACT.md` first, or `games-src/scripts/find.sh <symbol> nightrun`.",
          "- `analysis/`, `REVIEW-*.md`, `ASSETS-NEEDED*.md`, g, foot, ret, a, b whole: read a line range only.",
          "", "Header standard for every new part: first lines `// PURPOSE: <one line>`, `// FLAG: <name (?name=0)|none>`, `// TEST: <x-test.js|none>` (guard.py errors on a new part without it, warns on old ones).", ""]
    return "\n".join(L)


def main(argv):
    text = render()
    if "--check" in argv:
        ok = OUT.exists() and OUT.read_text(encoding="utf-8") == text and len(text.encode()) <= LIMIT
        print("where: ok" if ok else "where: STALE or over %d bytes (%d); run games-src/scripts/where.py" % (LIMIT, len(text.encode())))
        return 0 if ok else 1
    OUT.write_text(text, encoding="utf-8")
    print("where: wrote %s (%d bytes)" % (OUT.relative_to(SRC.parent), len(text.encode())))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
