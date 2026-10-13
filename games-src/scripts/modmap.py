#!/usr/bin/env python3
"""Code maps: games-src/<dir>/MODULES.md for every game (and shell/MODULES.md).

For each game: its source files in the order the build inlines them, size, one-line purpose, the top-level
functions/objects with line numbers, and which later file re-defines (overrides) a function of an earlier one.
Read the map first, then read only the line range you change. Never read the built html / x.js / ui.js.

  python3 games-src/scripts/modmap.py                 # write every MODULES.md (build-all.py does this on each build)
  python3 games-src/scripts/modmap.py thornbound      # one game (slug or dir)
  python3 games-src/scripts/modmap.py --find SYMBOL_OR_TEXT [game]   # what scripts/find.sh calls
  python3 games-src/scripts/modmap.py --json          # machine-readable (used by guard.py)

MODULES.md files are generated and git-ignored (line numbers go stale on every edit and would conflict between
workers); find.sh and build-all.py regenerate them. Reads sources only, never a built artefact.
"""
import json, os, pathlib, re, signal, subprocess, sys

SRC = pathlib.Path(__file__).resolve().parents[1]          # games-src/
SHARED_DIRS = [SRC / "shell", SRC / "net", SRC / "perf", SRC / "audio"]
SHARED_NAMES = {p.name for d in SHARED_DIRS if d.exists() for p in d.glob("*.js")}

# slug -> (title, build dir relative to games-src, family dir relative to games-src)
GAMES = {
    "cauldron-fair":    ("Cauldron Fair",    "cauldron-fair",       "cauldron-fair"),
    "crown-city-smash": ("Crown City Smash", "kot",                 "kot"),
    "doorkick-dungeon": ("Doorkick Dungeon", "munch",               "munch"),
    "final-approach":   ("Final Approach",   "final-approach/game", "final-approach"),
    "hollowbough":      ("Hollowbough",      "hollowbough/game",    "hollowbough"),
    "kaiten-kitchen":   ("Kaiten Kitchen",   "kaiten/game",         "kaiten"),
    "lantern-dive":     ("Lantern Dive",     "lantern-dive/game",   "lantern-dive"),
    "nebula-aces":      ("Nebula Aces",      "xw",                  "xw"),
    "rampart-and-vine": ("Rampart and Vine", "carc/game/src",       "carc"),
    "sands-of-qamar":   ("Sands of Qamar",   "ft/src",              "ft"),
    "shipwreck-isle":   ("Shipwreck Isle",   "rc",                  "rc"),
    "short-fuse":       ("Short Fuse",       "short-fuse/game",     "short-fuse"),
    "sunglaze":         ("Sunglaze",         "azul/game/src",       "azul"),
    "thornbound":       ("Thornbound",       "thornbound/game",     "thornbound"),
    "tidewake":         ("Tidewake",         "tidewake/game",       "tidewake"),
    "mainhattan-nightrun": ("Mainhattan Nightrun", "nightrun/parts", "nightrun"),
}
MAP_DIR = {"mainhattan-nightrun": "nightrun"}   # where MODULES.md goes when not the build dir

DEF_FN = re.compile(r"^(?:export\s+)?(?:async\s+)?function\s*\*?\s*([A-Za-z_$][\w$]*)\s*\(")
DEF_VAR = re.compile(r"^(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(.*)")
DEF_CLASS = re.compile(r"^class\s+([A-Za-z_$][\w$]*)")
DEF_ASSIGN = re.compile(r"^([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)\s*=(?!=)\s*(.*)")
DEF_ASSIGN_OBJ = re.compile(r"^Object\.assign\(\s*([A-Za-z_$][\w$.]*)\s*,")
FNISH = re.compile(r"^(?:async\s+)?(?:function\b|\([^)]*\)\s*=>|[A-Za-z_$][\w$]*\s*=>|\(function\b)")


def rd(p):
    return pathlib.Path(p).read_text(encoding="utf-8", errors="replace")


def rel(p):
    try: return str(pathlib.Path(p).resolve().relative_to(SRC))
    except ValueError: return str(p)


def is_data_like(text):
    n = text.count("\n") + 1
    return len(text) > 30000 and len(text) / n > 300


def purpose_of(text, defs):
    """First meaningful comment in the first lines, else the first function names."""
    for line in text.splitlines()[:25]:
        s = line.strip()
        if not s or s.startswith("#!") or s.startswith("'use strict'") or s.startswith('"use strict"'): continue
        m = re.match(r"^(?://+|/\*+|\*)\s*(.*?)(?:\*/)?\s*$", s)
        if not m: break
        t = re.sub(r"[=\-_*#~]{3,}", " ", m.group(1)).strip(" -=:*/")
        t = re.sub(r"\s+", " ", t)
        if len(t) >= 8 and not re.match(r"^(copyright|\(c\)|licen[cs]e)", t, re.I):
            return t[:120]
    names = [d["name"] for d in defs if d["kind"] == "fn"][:4]
    return ("functions: " + ", ".join(names)) if names else ""


def parse_defs(text, path):
    """Top-level definitions: [{name, line, kind}] kind = fn | obj | assign (re-assignment/wrapper) | prop (X.y = ...)."""
    if is_data_like(text):
        defs = []
        for i, line in enumerate(text.splitlines(), 1):
            m = re.match(r"^(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=", line)
            if m: defs.append({"name": m.group(1), "line": i, "kind": "obj"})
            if len(defs) >= 12: break
        return defs, True
    lines = text.splitlines()
    out, in_block = [], False

    def scan(indent_ok):
        res, blk = [], False
        for i, line in enumerate(lines, 1):
            if blk:
                if "*/" in line: blk = False
                continue
            if line.startswith("/*") and "*/" not in line: blk = True; continue
            if not line or line[0] in " \t":
                if not indent_ok or not line.startswith("  ") or line.startswith("   "): continue
                line = line[2:]
                if not line or line[0] in " \t": continue
            if line.startswith("//") or line.startswith("*"): continue
            m = DEF_FN.match(line)
            if m: res.append({"name": m.group(1), "line": i, "kind": "fn"}); continue
            m = DEF_CLASS.match(line)
            if m: res.append({"name": m.group(1), "line": i, "kind": "fn"}); continue
            m = DEF_VAR.match(line)
            if m:
                rhs = m.group(2).strip()
                res.append({"name": m.group(1), "line": i, "kind": "fn" if FNISH.match(rhs) else "obj"})
                continue
            m = DEF_ASSIGN_OBJ.match(line)
            if m: res.append({"name": m.group(1) + "+", "line": i, "kind": "prop"}); continue
            m = DEF_ASSIGN.match(line)
            if m:
                name, rhs = m.group(1), m.group(2).strip()
                if "." in name:
                    if FNISH.match(rhs): res.append({"name": name, "line": i, "kind": "prop"})
                elif FNISH.match(rhs) or re.search(r"\b%s\b" % re.escape(name), rhs):
                    res.append({"name": name, "line": i, "kind": "assign"})
        return res

    out = scan(False)
    if len(out) < 2 and len(text) > 2000:       # whole file wrapped in an IIFE: look one level in
        out = scan(True)
        for d in out: d["scoped"] = True       # private to the IIFE: cannot override anything global
    return out, False


# ---------------------------------------------------------------- build order
def find_body(build_dir, build_text):
    names = re.findall(r"""['"](body\d*\.html)['"]""", build_text)
    for n in names or ["body.html"]:
        for d in (build_dir, build_dir / "src"):
            if (d / n).exists(): return d / n
    return None


def resolve(name, build_dir, family):
    cands = [build_dir / name, build_dir / "src" / name, build_dir.parent / name, build_dir.parent / "src" / name,
             family / name, family / "src" / name, family / "kit" / name, family / "game" / name, family / "game" / "src" / name]
    cands += [d / name for d in SHARED_DIRS]
    for c in cands:
        if c.exists(): return c
    return None


def ui_parts(build_dir, build_text):
    """Numbered ui1..uiN.js parts the build joins into ui.js (same order and limits as the build)."""
    if "ui%d" not in build_text and "ui\\d" not in build_text: return None
    for d in (build_dir / "src", build_dir):
        parts = [p for p in d.glob("ui[0-9]*.js") if re.fullmatch(r"ui\d+\.js", p.name)]
        if not parts: continue
        num = lambda p: int(re.findall(r"\d+", p.name)[0])
        m = re.search(r"range\((\d+)\s*,\s*(\d+)\)", build_text)
        if m: parts = [p for p in parts if int(m.group(1)) <= num(p) < int(m.group(2))]
        if "int(re.findall" in build_text or m: parts.sort(key=num)
        else: parts.sort(key=lambda p: p.name)          # build uses plain sorted(): lexicographic
        return parts
    return None


def build_order(slug):
    title, bdir, fam = GAMES[slug]
    build_dir, family = SRC / bdir, SRC / fam
    build_text = rd(build_dir / "build.py")
    order, generated = [], []          # order: [(path, name)], generated: [str]
    if slug == "mainhattan-nightrun":
        for n in re.findall(r"rd\('([\w.\-]+\.js)'\)", build_text):
            if (build_dir / n).exists() and (build_dir / n) not in [p for p, _ in order]: order.append((build_dir / n, n))
        return order, generated, build_dir, family, title
    body = find_body(build_dir, build_text)
    names = re.findall(r'<script src="([^"]+)"></script>', rd(body)) if body else []
    if not names:
        names = [n for n in re.findall(r"""['"]([\w.\-]+\.js)['"]""", build_text)]
    seen = set()
    for n in names:
        if n in seen: continue
        seen.add(n)
        if n == "ui.js":
            parts = ui_parts(build_dir, build_text)
            if parts:
                m = re.search(r"open\(os\.path\.join\((\w+),\s*'ui\.js'\)", build_text)
                generated.append(rel(build_dir / ("src/ui.js" if (m and m.group(1) == "S") else "ui.js")) + " (joined from the numbered ui parts)")
                for p in parts: order.append((p, p.name))
                continue
        p = resolve(n, build_dir, family)
        if p is None:
            generated.append(n + " (built from json/vendor by build.py)")
            continue
        order.append((p, n))
    return order, generated, build_dir, family, title


def is_shared(path):
    p = pathlib.Path(path).resolve()
    return any(d in p.parents for d in SHARED_DIRS)


def analyse(slug):
    order, generated, build_dir, family, title = build_order(slug)
    files, symtab = [], {}
    for idx, (p, name) in enumerate(order):
        text = rd(p)
        defs, data = parse_defs(text, p)
        f = {"path": rel(p), "name": name, "kb": round(len(text.encode("utf-8", "replace")) / 1024, 1), "bytes": len(text.encode("utf-8", "replace")),
             "shared": is_shared(p), "data": data, "lines": text.count("\n") + 1, "defs": defs, "purpose": purpose_of(text, defs), "idx": idx}
        files.append(f)
        for d in defs:
            if d.get("scoped"): continue
            symtab.setdefault(d["name"], []).append((idx, d["line"], d["kind"]))
    # indented wrappers of an earlier global function: `renderMain = function(){...}` / `fn = wrap(fn)` inside an IIFE or block
    known = set()
    for f in files:
        if not f["shared"] and not f["data"]:
            lines = rd(SRC / f["path"]).splitlines()
            have = {d["name"] for d in f["defs"]}
            for i, line in enumerate(lines, 1):
                if not line[:1] in (" ", "\t"): continue
                m = re.match(r"^\s+(?:window\.)?([A-Za-z_$][\w$]*)\s*=(?!=)\s*(.*)", line)
                if not m or m.group(1) not in known | have: continue
                rhs = m.group(2).strip()
                if FNISH.match(rhs) or re.search(r"\b%s\b" % re.escape(m.group(1)), rhs):
                    d = {"name": m.group(1), "line": i, "kind": "assign", "wrap": True}
                    f["defs"].append(d); symtab.setdefault(d["name"], []).append((f["idx"], i, "assign"))
            f["defs"].sort(key=lambda d: d["line"])
        known |= {d["name"] for d in f["defs"] if d["kind"] == "fn" and not d.get("scoped")}
    # override detection among game files: a function/property defined or re-assigned again later wins over the earlier one
    overrides = {}       # symbol -> [(idx, line, kind)] in build order, only symbols with 2+ places
    for sym, places in symtab.items():
        if sym.endswith("+"): continue
        places = sorted(x for x in places if not files[x[0]]["shared"] and not files[x[0]]["data"])
        fnish = [x for x in places if x[2] in ("fn", "prop")]
        if not fnish or places[-1][2] == "obj": continue
        if len(places) > 1 and any(x[2] != "assign" for x in places[:-1]):
            overrides[sym] = places
    per_file = {}        # file idx -> {from_file_idx: [symbols]} for definitions that override an earlier one
    for sym, places in overrides.items():
        for k in range(1, len(places)):
            idx, line, kind = places[k]
            first = places[0][0]
            per_file.setdefault(idx, {}).setdefault(places[0][0], []).append(sym)
    sizes_ok = None
    for g in generated:
        gp = SRC / g.split(" ")[0]
        if gp.name == "ui.js" and gp.exists():
            parts = [f for f in files if re.fullmatch(r"ui\d+\.js", f["name"])]
            sizes_ok = sum(f["bytes"] for f in parts) == gp.stat().st_size
    return {"slug": slug, "title": title, "build_dir": rel(build_dir), "files": files, "generated": generated, "overrides": overrides,
            "per_file": per_file, "join_check": sizes_ok}


# ---------------------------------------------------------------- MODULES.md
def fmt_defs(f):
    fns = [d for d in f["defs"] if d["kind"] == "fn"]
    objs = [d for d in f["defs"] if d["kind"] == "obj"]
    other = [d for d in f["defs"] if d["kind"] in ("prop", "assign")]
    out = []
    if fns: out.append("fn: " + " ".join("%s:%d" % (d["name"], d["line"]) for d in fns))
    if objs: out.append("obj: " + " ".join("%s:%d" % (d["name"], d["line"]) for d in objs))
    if other: out.append("set: " + " ".join("%s:%d" % (d["name"], d["line"]) for d in other))
    return out


def render(a):
    L = []
    files = a["files"]
    own = [f for f in files if not f["shared"]]
    shared = [f for f in files if f["shared"]]
    L.append("# MODULES: %s  (games-src/%s)" % (a["title"], a["build_dir"]))
    L.append("")
    L.append("Generated by `games-src/scripts/modmap.py` (re-run any time; do not edit, not committed). Read this, then read only the line range you change.")
    L.append("Build: `python3 games-src/scripts/build-all.py --quick <slug>`. **Edit the source files below. Never read or edit the built html, `x.js` or the joined `ui.js`** (they are generated).")
    L.append("Files are listed in the order the build inlines them; for a function defined twice, the LATER definition wins. Find a symbol: `games-src/scripts/find.sh <symbol|text> [game]`.")
    if a["generated"]:
        L.append("Generated at build time (not sources): " + "; ".join(a["generated"]) + ".")
    if a["join_check"] is False:
        L.append("WARNING: the numbered ui parts do not add up to the joined ui.js on disk (stale build or build order changed).")
    L.append("")
    L.append("## Game files, in build order")
    L.append("| # | file (games-src/...) | KB | what it is |")
    L.append("|--:|---|--:|---|")
    n = 0
    for f in files:
        if f["shared"]: continue
        n += 1
        L.append("| %d | %s | %s | %s |" % (n, f["path"], f["kb"], (f["purpose"] or "").replace("|", "/")))
    if shared:
        L.append("")
        L.append("Shared, inlined in this order between the game files (see `shell/MODULES.md`; edit only for cross-game changes): " +
                 ", ".join("%s (%s KB)" % (f["name"], f["kb"]) for f in shared) + ".")
    L.append("")
    L.append("## Functions and objects by file (name:line)")
    for f in own:
        L.append("")
        L.append("### %s  (%s KB, %d lines)%s" % (f["path"], f["kb"], f["lines"], "  [data]" if f["data"] else ""))
        pf = a["per_file"].get(f["idx"], {})
        if pf:
            L.append("overrides: " + "; ".join("%s (from %s)" % (", ".join(sorted(set(s))[:14]) + (" +%d more" % (len(set(s)) - 14) if len(set(s)) > 14 else ""), "this file" if i == f["idx"] else files[i]["name"]) for i, s in sorted(pf.items())))
        for line in fmt_defs(f): L.append(line)
    ov = list(a["overrides"].items())
    L.append("")
    L.append("## Override table (symbol: definitions in build order; the last one wins)")
    if not ov:
        L.append("None: every function is defined once.")
    for s, p in sorted(ov):
        L.append("- `%s`: %s -> **wins: %s:%d**" % (s, " , ".join("%s:%d" % (files[i]["name"], ln) for i, ln, _ in p[:-1]), files[p[-1][0]]["name"], p[-1][1]))
    L.append("")
    return "\n".join(L)


def render_shell():
    L = ["# MODULES: shared shell (games-src/shell, net, perf, audio)", "",
         "Generated by `games-src/scripts/modmap.py`; do not edit. Cross-game code: change it only when every game needs it (see PLAYBOOK).", ""]
    for d in SHARED_DIRS:
        if not d.exists(): continue
        L.append("## %s/" % d.name)
        L.append("| file | KB | what it is |")
        L.append("|---|--:|---|")
        details = []
        for p in sorted(d.glob("*.js")):
            if "min" in p.name.split("."): continue
            text = rd(p)
            defs, data = parse_defs(text, p)
            f = {"defs": defs, "data": data}
            L.append("| %s | %.1f | %s |" % (p.name, len(text.encode()) / 1024, purpose_of(text, defs).replace("|", "/")))
            if not data and defs:
                details.append((p, f, len(text.splitlines())))
        L.append("")
        for p, f, n in details:
            L.append("### %s/%s (%d lines)" % (d.name, p.name, n))
            L.extend(fmt_defs(f)); L.append("")
    return "\n".join(L)


def map_path(slug):
    title, bdir, fam = GAMES[slug]
    return SRC / MAP_DIR.get(slug, bdir) / "MODULES.md"


def write_all(slugs):
    wrote = 0
    for s in slugs:
        a = analyse(s)
        map_path(s).write_text(render(a), encoding="utf-8")
        wrote += 1
        if a["join_check"] is False: print("modmap: WARNING %s numbered ui parts != joined ui.js on disk (stale build?)" % s, file=sys.stderr)
    if slugs == list(GAMES):
        (SRC / "shell" / "MODULES.md").write_text(render_shell(), encoding="utf-8")
        wrote += 1
    return wrote


def pick(arg):
    if not arg: return list(GAMES)
    a = arg.rstrip("/").replace("games-src/", "")
    hits = [s for s, (t, b, f) in GAMES.items() if a in (s, b, f, t.lower())]
    if not hits: hits = [s for s in GAMES if a in s]
    if not hits: sys.exit("unknown game %r; known: %s" % (arg, " ".join(GAMES)))
    return hits


def shell_analysis():
    files = []
    for d in SHARED_DIRS:
        for p in sorted(d.glob("*.js")):
            if "min" in p.name.split("."): continue
            text = rd(p); defs, data = parse_defs(text, p)
            files.append({"path": rel(p), "name": p.name, "shared": False, "data": data, "defs": defs})
    return {"build_dir": "shell+net+perf+audio", "files": files}


def find(query, game=None, limit=30):
    """Definitions first (with the winning layer), then text hits inside the real source files only."""
    q = query.strip()
    for slug in (["shell"] if game == "shell" else pick(game)):
        a = shell_analysis() if slug == "shell" else analyse(slug)
        files = a["files"]
        out = []
        defs_hit = []
        for f in files:
            for d in f["defs"]:
                if d["name"].rstrip("+") == q or (len(q) > 3 and d["name"].lower() == q.lower()):
                    defs_hit.append((f, d))
        if defs_hit:
            win = defs_hit[-1]
            for f, d in defs_hit:
                tag = "WINS (last in build order)" if (f, d) == win and len(defs_hit) > 1 else ("only definition" if len(defs_hit) == 1 else "overridden")
                out.append("DEF  %s:%d  %s %s  [%s]%s" % (f["path"], d["line"], d["kind"], d["name"], tag, "  (shared)" if f["shared"] else ""))
        pat = re.compile(re.escape(q), re.I if os.environ.get("FIND_I") else 0)   # case-sensitive; FIND_I=1 to ignore case
        hits = []
        for f in files:
            if f["data"]: continue
            if f["shared"]: continue
            text = rd(SRC / f["path"]).splitlines()
            nfile = 0
            defs = sorted(f["defs"], key=lambda d: d["line"])
            for i, line in enumerate(text, 1):
                if pat.search(line):
                    enc = ""
                    for d in defs:
                        if d["line"] <= i: enc = d["name"]
                        else: break
                    nfile += 1
                    if nfile > 8: continue
                    hits.append("%s:%d  %s%s" % (f["path"], i, ("[near %s] " % enc) if enc else "", line.strip()[:150]))
        if defs_hit or hits:
            print("== %s (%s)" % (slug, a["build_dir"]))
            for l in out: print(l)
            for l in hits[:limit]: print("hit  " + l)
            if len(hits) > limit: print("... %d more hits; narrow the query or name the game" % (len(hits) - limit))
    return 0


def main(argv):
    if argv and argv[0] == "--find":
        if len(argv) < 2: sys.exit("usage: modmap.py --find SYMBOL_OR_TEXT [game]")
        return find(argv[1], argv[2] if len(argv) > 2 else None)
    if argv and argv[0] == "--json":
        print(json.dumps({s: analyse(s) for s in GAMES}, default=list))
        return 0
    if argv and argv[0] == "--paths":
        for s in GAMES: print("%-18s %s" % (s, rel(map_path(s))))
        print("%-18s %s" % ("shell", "shell/MODULES.md"))
        return 0
    n = write_all(pick(argv[0]) if argv else list(GAMES))
    print("modmap: wrote %d MODULES.md files" % n)
    return 0


if __name__ == "__main__":
    signal.signal(signal.SIGPIPE, signal.SIG_DFL)
    sys.exit(main(sys.argv[1:]))
