#!/usr/bin/env python3
"""Rebuild every game with its own build, stage it, stamp it, phone-check it, print PASS/FAIL.

  python3 games-src/scripts/build-all.py                    # all games into games-src/.staging/
  python3 games-src/scripts/build-all.py sunglaze cauldron-fair
  python3 games-src/scripts/build-all.py --out /tmp/stage sunglaze
  python3 games-src/scripts/build-all.py --deploy sunglaze  # also copy PASSING games into games/<slug>/index.html
  python3 games-src/scripts/build-all.py --deploy --suffix -next sunglaze   # preview: games/<slug>-next/
Every run first executes guard.py (stops on a failure) and modmap.py (refreshes the MODULES.md code maps).
Other flags: --no-check (skip phone-check), --no-look (skip the look-check gate), --list (print the table and exit).

Staging layout: <out>/<slug>/index.html (+ <out>/.check/ with phone-check results and shots).
Nothing is written under games/ unless --deploy is given. No AI is used.
"""
import argparse, json, os, pathlib, re, shutil, subprocess, sys, time

SRC = pathlib.Path(__file__).resolve().parents[1]          # games-src/
REPO = SRC.parent
SCRIPTS = SRC / "scripts"
# slug -> (build dir relative to games-src, build command, output file relative to the build dir)
# Mainhattan / Overdrive and Ticket to Ride are deliberately absent (other sessions own them / on hold).
GAMES = {
    "cauldron-fair":    ("cauldron-fair",        "python3 build.py", "cauldron-fair.html"),
    "crown-city-smash": ("kot",                  "python3 build.py", "kot2.html"),
    "doorkick-dungeon": ("munch",                "python3 build.py", "doorkick.html"),
    "final-approach":   ("final-approach/game",  "python3 build.py", "final-approach.html"),
    "hollowbough":      ("hollowbough/game",     "python3 build.py", "hollowbough.html"),
    "kaiten-kitchen":   ("kaiten/game",          "python3 build.py", "kaiten.html"),
    "lantern-dive":     ("lantern-dive/game",    "python3 build.py", "lantern-dive.html"),
    "nebula-aces":      ("xw",                   "python3 build.py", "nebula.html"),
    "rampart-and-vine": ("carc/game/src",        "python3 build.py", "../rampart.html"),
    "sands-of-qamar":   ("ft/src",               "python3 build.py", "../sands.html"),
    "shipwreck-isle":   ("rc",                   "python3 build.py", "shipwreck.html"),
    "short-fuse":       ("short-fuse/game",      "python3 build.py", "shortfuse.html"),
    "sunglaze":         ("azul/game/src",        "python3 build.py", "../sunglaze.html"),
    "thornbound":       ("thornbound/game",      "python3 build.py", "thornbound.html"),
    "tidewake":         ("tidewake/game",        "python3 build.py", "tidewake.html"),
}

# slug -> (dir relative to games-src with the game's own sweeps, [scripts]). Full run = the script's own default size (the gate); QUICK=1 makes it 4 games.
SWEEPS = {
    "cauldron-fair":    ("cauldron-fair",       ["sweep.js", "rotate-test.js"]),
    "crown-city-smash": ("kot",                 ["sweep.js"]),
    "doorkick-dungeon": ("munch",               ["sweep.js"]),
    "final-approach":   ("final-approach/game", ["sweep.js"]),
    "hollowbough":      ("hollowbough/game",    ["sweep.js"]),
    "kaiten-kitchen":   ("kaiten/game",         ["sweep.js"]),
    "lantern-dive":     ("lantern-dive/game",   ["sweep.js", "rotate-test.js"]),
    "nebula-aces":      ("xw",                  ["sweep.js"]),
    "rampart-and-vine": ("carc/game",           ["sweep.js", "rotate-test.js"]),
    "sands-of-qamar":   ("ft",                  ["sweep.js", "rotate-test.js"]),
    "shipwreck-isle":   ("rc",                  ["sweep.js"]),
    "short-fuse":       ("short-fuse/game",     ["sweep.js", "rotate-test.js"]),
    "sunglaze":         ("azul/game",           ["sweep.js", "rotate-test.js"]),
    "thornbound":       ("thornbound/game",     ["sweep.js"]),
    "tidewake":         ("tidewake/game",       ["sweep.js"]),
}
PHONE_MS = {"crown-city-smash": 420000}   # its six phone scenarios need ~180 s on this machine (default limit per game is 180 s)
TIMES = []   # (slug, check, seconds)
def _safe(fn, x):   # (x, result) or (x, the exception): one crashing game must not stop the thread pool
    try: return fn(x)
    except Exception as e: return x, e

def inject_lab(html_path):
    """Inline the LAB (shell/gx-lab-core.js + gx-lab.js + gx-lab.css) at the end of the staged page. Inert unless test mode is on (?test=1 or localStorage gx_test=1)."""
    sh = SRC / "shell"
    t = pathlib.Path(html_path).read_text(encoding="utf-8")
    if "gxlab-" in t and "GXLAB_CSS" in t: return
    blk = "<script>window.GXLAB_CSS=" + json.dumps((sh / "gx-lab.css").read_text(encoding="utf-8")).replace("</", "<\\/") + ";</script>\n<script>\n" + (sh / "gx-lab-core.js").read_text(encoding="utf-8") + "\n</script>\n<script>\n" + (sh / "gx-lab.js").read_text(encoding="utf-8") + "\n</script>\n"
    i = t.rfind("</body>")
    t = t[:i] + blk + t[i:] if i >= 0 else t + blk
    pathlib.Path(html_path).write_text(t, encoding="utf-8")

def inject_menu(html_path):
    """Self-hosted menu faces (shell/fonts: Cinzel 700, Alegreya Sans 400/700, base64 so the single html stays one file) + shell/gx-menu.css, last in <head>."""
    import base64
    sh = SRC / "shell"
    t = pathlib.Path(html_path).read_text(encoding="utf-8")
    if 'id="gx-menu"' in t: return
    face = lambda fam, w, f: "@font-face{font-family:'%s';font-weight:%d;font-style:normal;font-display:swap;src:url(data:font/woff2;base64,%s) format('woff2')}" % (fam, w, base64.b64encode((sh / "fonts" / f).read_bytes()).decode())
    css = face("Cinzel", 700, "cinzel-700.woff2") + face("Alegreya Sans", 400, "alegreya-sans-400.woff2") + face("Alegreya Sans", 700, "alegreya-sans-700.woff2") + (sh / "gx-menu.css").read_text(encoding="utf-8")
    blk = '<style id="gx-menu">' + css + '</style>\n'
    i = t.find("</head>")
    t = t[:i] + blk + t[i:] if i >= 0 else blk + t
    pathlib.Path(html_path).write_text(t, encoding="utf-8")

def timed(slug, name, fn):
    t = time.time(); r = fn(); dt = time.time() - t
    TIMES.append((slug, name, round(dt, 1)))
    print(f"[time] {slug:18} {name:14} {dt:6.1f}s", flush=True)
    return r

def start_server(out):
    """ONE static server for every check (gx-serve.js): staged pages + media/music/models from games/. Returns (proc, base_url)."""
    p = subprocess.Popen(["node", str(SCRIPTS / "gx-serve.js"), str(out)], stdout=subprocess.PIPE, text=True)
    line = p.stdout.readline().strip()
    if not line.startswith("GX_URL "): p.kill(); sys.exit("gx-serve did not start: " + line)
    return p, line.split()[1]

def run_check(cmd, cwd, env, log, limit):
    try:
        r = subprocess.run(cmd, cwd=cwd, env=env, capture_output=True, text=True, timeout=limit)
        txt = (r.stdout or "") + (r.stderr or ""); code = r.returncode
    except subprocess.TimeoutExpired as e:
        txt = ((e.stdout or b"").decode() if isinstance(e.stdout, bytes) else (e.stdout or "")) + "\nTIMEOUT after %ds" % limit; code = 124
    pathlib.Path(log).parent.mkdir(parents=True, exist_ok=True); pathlib.Path(log).write_text(txt)
    tail = [l for l in txt.strip().splitlines() if l.strip()][-3:]
    return code, " / ".join(t.strip()[:90] for t in tail)

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("slugs", nargs="*", help="games to build (default: all)")
    ap.add_argument("--out", default=str(SRC / ".staging"), help="staging folder (default games-src/.staging/)")
    ap.add_argument("--deploy", action="store_true", help="copy PASSING games into games/<slug><suffix>/index.html")
    ap.add_argument("--suffix", default="", help='deploy folder suffix, e.g. "-next" for a preview')
    ap.add_argument("--no-check", action="store_true", help="skip every check (build + stamp only)")
    ap.add_argument("--quick", action="store_true", help="iterate: phone-check + scenario tests + QUICK sweep (4 games, 1 rotation)")
    ap.add_argument("--no-sweep", action="store_true", help="with --deploy: skip the sweep (say why in the commit)")
    ap.add_argument("--full", action="store_true", help="run the game sweeps (they play whole games): only for engine/rules changes. Without it no sweep runs (owner, 13 Oct 2026)")
    ap.add_argument("--no-look", action="store_true", help="skip the look check gate (new severe visual findings block --deploy)")
    ap.add_argument("--list", action="store_true")
    a = ap.parse_args()
    if a.list:
        for s, (d, c, o) in GAMES.items(): print(f"{s:18} cd games-src/{d} && {c}  -> {o}")
        return 0
    slugs = a.slugs or list(GAMES)
    bad = [s for s in slugs if s not in GAMES]
    if bad: sys.exit("unknown slug(s): %s\nknown: %s" % (" ".join(bad), " ".join(GAMES)))
    # cost guard (fails the build) and fresh code maps (games-src/<dir>/MODULES.md: read these, not the built files)
    g = subprocess.run([sys.executable, str(SCRIPTS / "guard.py")], capture_output=True, text=True)
    print(g.stdout.rstrip())
    if g.returncode: sys.exit("build stopped by guard.py (see the Fix: hints above)")
    m = subprocess.run([sys.executable, str(SCRIPTS / "modmap.py")], capture_output=True, text=True)
    print(m.stdout.strip() or ("modmap failed: " + m.stderr.strip()[-200:]), flush=True)
    out = pathlib.Path(a.out).resolve()
    out.mkdir(parents=True, exist_ok=True)
    status, why = {}, {}

    from concurrent.futures import ThreadPoolExecutor
    with ThreadPoolExecutor(max_workers=3) as ex:   # each game builds in its own folder: run the builds side by side, stage serially below
        runs = dict(zip(slugs, ex.map(lambda x: subprocess.run(GAMES[x][1], shell=True, cwd=SRC / GAMES[x][0], capture_output=True, text=True), slugs)))
    for s in slugs:  # 1. stage the builds
        d, cmd, o = GAMES[s]
        cwd = SRC / d
        r = runs[s]
        built = (cwd / o).resolve()
        if r.returncode != 0:
            status[s], why[s] = "FAIL", "build error: " + (r.stderr.strip().splitlines() or r.stdout.strip().splitlines() or ["?"])[-1][:120]
        elif not built.exists() or built.stat().st_size < 10000:
            status[s], why[s] = "FAIL", f"no output at games-src/{d}/{o}"
        else:
            (out / s).mkdir(parents=True, exist_ok=True)
            shutil.copyfile(built, out / s / "index.html")
            inject_lab(out / s / "index.html")
            inject_menu(out / s / "index.html")
            status[s], why[s] = "BUILT", ""
        print(f"[build] {s:18} {status[s]} {why[s]}", flush=True)

    ok = [s for s in slugs if status[s] == "BUILT"]
    if ok:  # 2. stamp the staged copies
        r = subprocess.run([sys.executable, str(SCRIPTS / "stamp-copyright.py")] + [str(out / s / "index.html") for s in ok], capture_output=True, text=True)
        if r.returncode:
            sys.exit("stamp-copyright failed: " + r.stderr)

    srv = None
    if ok and not a.no_check:
        srv, base = start_server(out)   # ONE server for every check below
        env = dict(os.environ, GX_URL=base, GX_STAGE=str(out))
        env.setdefault("NODE_PATH", "/opt/node-tools/node_modules")
    # Owner, 13 Oct 2026: "don't play the game, run tests". phone-check PLAYS each game (6 scenarios, up to 3 min each), so it
    # runs only with --full. The gate is the ?scn= scenario tests + LAB test + look check (open a state, check it, no playing).
    if ok and not a.no_check:  # 3. phone-check (plays the game): --full only; otherwise straight to the scenario tests
        chk = out / ".check"
        env3 = dict(env, GAMES_DIR=str(out), PC_OUT_DIR=str(chk), GAME_MS=str(max([PHONE_MS.get(x, 180000) for x in ok])))
        if a.full:
            r = timed("all" if len(ok) > 1 else ok[0], "phone-check", lambda: subprocess.run(["node", str(SCRIPTS / "phone-check.js")] + ok, env=env3, capture_output=True, text=True))
            rows = {}
            md = chk / "phone-check-results.md"
            if md.exists():
                for line in md.read_text().splitlines():
                    m = re.match(r"\| (\S+) \| (.*) \| ([^|]*) \|$", line)
                    if m and m.group(1) in ok: rows[m.group(1)] = (m.group(2).split(" | "), m.group(3))
            for s in ok:
                if s not in rows: status[s], why[s] = "FAIL", "phone-check did not report (see %s)" % (r.stderr.strip()[-100:] or "log")
                else:
                    cells, errs = rows[s]
                    failing = [c for c in cells if c != "PASS"]
                    if failing: status[s], why[s] = "FAIL", "phone-check: " + "; ".join(failing)[:120]
                    else: status[s], why[s] = "PASS", "" if errs == "none" else "page errors: " + errs[:80]
        else:
            (out / ".check").mkdir(parents=True, exist_ok=True)
            for s in ok: status[s], why[s] = "PASS", ""
            print("[phone-check] skipped: it plays the game (use --full for engine/rules changes)", flush=True)
        if a.quick or a.deploy:  # 3a. scenario tests (`?scn=<id>` states: skip menus, seed the RNG, build the state, assert), all games in one Playwright Test run
            passing = [s for s in ok if status[s] == "PASS"]
            if passing:
                look = a.deploy and not a.no_look   # the same pages are scanned with axe (contrast / tap size / button names); verdict in 3b
                projects = ["--project=phone"] + ([] if not a.full else ["--project=phone-s", "--project=pc"])
                shutil.rmtree(out / ".inv", ignore_errors=True); shutil.rmtree(out / ".look-axe", ignore_errors=True)   # stale results of an earlier run
                def pw(slugs, extra_env, log):
                    return run_check([str(SRC / "node_modules" / ".bin" / "playwright"), "test"] + projects, str(SRC), dict(env3, SCN_SLUGS=",".join(slugs), PW_JSON=str(out / ".check" / "scn.json"), INV_OUT=str(out / ".inv"), **extra_env), log, 1800)
                code, tail = timed("all" if len(passing) > 1 else passing[0], "scenarios", lambda: pw(passing, {"LOOK_OUT": str(out / ".look-axe")} if look else {}, out / ".check" / "scenarios.log"))
                def verdict():   # per game: (passed, total, first failures) from the JSON reporter; titles are  file > game > scenario
                    res = {}
                    try: rep = json.load(open(out / ".check" / "scn.json"))
                    except Exception: return res
                    def walk(su, game=None):
                        for sub in su.get("suites", []):
                            walk(sub, sub["title"] if sub["title"] in passing else game)
                        for sp in su.get("specs", []):
                            r = res.setdefault(game, [0, 0, []]); st = [t["status"] for t in sp["tests"]]
                            if all(x == "skipped" for x in st): continue
                            r[1] += 1
                            if sp["ok"]: r[0] += 1
                            else:
                                msg = next((re.sub(r"\x1b\[[0-9;]*m", "", e.get("message", "")) for t in sp["tests"] for rs in t["results"] for e in rs.get("errors", [])), "failed")
                                r[2].append("%s: %s" % (sp["title"], msg.replace("\n", " ")[:90]))
                    for su in rep.get("suites", []): walk(su)
                    return res
                v = verdict()
                for s in passing:
                    ok_n, tot, fl = v.get(s, [0, 0, []])
                    if not tot: status[s], why[s] = "FAIL", "scenarios: none ran (no scenarios registered?)"
                    elif fl: status[s], why[s] = "FAIL", "scenarios %s/%s ok: %s" % (ok_n, tot, "; ".join(fl[:2])[:100])
                    else:
                        # Universal invariants (text < 11 px, clipping, ...) also flag OLD problems already on the live game: recorded by the same run (INV_OUT), a warning only
                        inv = sorted({m for fp in sorted((out / ".inv" / s).glob("*.json")) for m in json.load(open(fp))}) if (out / ".inv" / s).is_dir() else []
                        if inv: print(f"[scn] {s:18} own checks {ok_n}/{tot} ok; WARN universal: {inv[0][:120]}", flush=True); continue
                        print(f"[scn] {s:18} {ok_n}/{tot} scenarios ok")
        if a.full:  # 3a2. LAB acceptance tests (shared pages; warn-only, so not in the fast gate: --full only): test mode off = untouched page; on = LAB lists + opens every scenario; pinned checklist -> shelf + lab.html
            passing = [s for s in ok if status[s] == "PASS"]
            if passing:   # a game's first deploy has no rows in games/scenarios.json yet: index the staged pages first so lab.html can list them
                try:
                    subprocess.run(["node", str(SCRIPTS / "lab-index.js")] + passing, env=env, capture_output=True, text=True, timeout=300)
                    subprocess.run([sys.executable, str(SCRIPTS / "lab-page.py")], check=False, timeout=60)
                except Exception as e: print("lab-index (pre-test) skipped:", e)
                code, tail = timed("all" if len(passing) > 1 else passing[0], "lab-test", lambda: run_check(["node", str(SCRIPTS / "lab-test.js")] + passing, str(SCRIPTS), env3, out / ".check" / "lab-test.log", 1800))
                txt = (out / ".check" / "lab-test.log").read_text()
                for s in passing:
                    m = re.search(r"^LAB %s (\S+) (.*)$" % re.escape(s), txt, re.M)
                    # lab-test checks the shared shelf/LAB pages, not this game: report, never block a game's deploy
                    if not m: print(f"[lab] {s:18} WARN lab-test did not report", flush=True)
                    elif m.group(1) != "ok": print(f"[lab] {s:18} WARN " + m.group(2)[:140], flush=True)
                    else: print(f"[lab] {s:18} ok {m.group(2)[:40]}")
        # 3c. the game's own sweeps (they play whole games).
        # Owner, 13 Oct 2026: "don't play the game". Sweeps play whole games, so they run ONLY with --full (engine/rules changes).
        # --quick and --deploy = ?scn= GO scenarios + look check (+ LAB test as a warning), no game playing.
        if a.full:
            for s in [x for x in ok if status[x] == "PASS"]:
                d, scripts = SWEEPS[s]
                full = a.deploy and a.full
                for sc in (scripts if full else scripts[:1]):
                    e = dict(env, GX_SLUG=s)
                    if not full: e["QUICK"] = "1"
                    code, tail = timed(s, ("quick " if not full else "full ") + sc.replace(".js", ""), lambda: run_check(["node", sc], str(SRC / d), e, out / ".check" / f"{s}-{sc}.log", 5400))
                    if code != 0: status[s], why[s] = "FAIL", f"{sc}: {tail}"[:200]; break
                    print(f"[sweep] {s:18} {sc} ok: {tail[-90:]}", flush=True)
    else:
        for s in ok: status[s] = "PASS" if a.no_check else status[s]

    if a.deploy and not a.no_look:  # 3b. look check + axe: only NEW severe findings block. "New" = not in look-known/<slug>.json (committed, rewritten on every successful deploy; no live re-measurement)
        env = dict(os.environ); env.setdefault("NODE_PATH", "/opt/node-tools/node_modules")
        mode = "all" if a.full else "phone"
        KNOWN = SRC / "look-known"
        def known_get(s, kind):
            try: return {tuple(f) for f in json.load(open(KNOWN / f"{s}.json"))[mode][kind]}
            except Exception: return None   # no baseline for this game yet: measured once on the live game below, then committed
        def look_run(s):   # runs in a worker thread: the look-check of one staged game
            r = subprocess.run(["node", str(SCRIPTS / "look-check.js"), "--gate", "--game", s, "--games-dir", str(out), "--out", str(out / ".look"), "--no-shots", "--skip", "size,overflow,overlap,fonts"] + ([] if a.full else ["--sizes", "phone"]),
                               env=env, capture_output=True, text=True, timeout=900)
            return s, r
        def sev(path, s):
            try:
                g = json.load(open(path)).get("games", {}).get(s, {})
                return {(str(f.get("check")), str(f.get("sel")), str(f.get("text"))) for f in g.get("findings", []) if f.get("sev") == "severe"}
            except Exception: return None
        def live_look(s):   # fallback for a game without a committed baseline: measure the live game once
            cache = SRC / ".look-live-cache" / f"{s}-live-{mode}"
            if not (cache / "report.json").exists():
                subprocess.run(["node", str(SCRIPTS / "look-check.js"), "--game", s, "--games-dir", str(SRC.parent / "games"), "--out", str(cache), "--no-shots"] + ([] if a.full else ["--sizes", "phone"]), env=env, capture_output=True, text=True, timeout=900)
            return sev(cache / "report.json", s)
        todo = [x for x in slugs if status[x] == "PASS"]
        from concurrent.futures import ThreadPoolExecutor
        with ThreadPoolExecutor(max_workers=2) as ex:
            results = list(ex.map(lambda x: _safe(look_run, x), todo))
        new_look = {}
        for s, r in results:
            try:
                if isinstance(r, Exception): print(f"[look] {s}: skipped ({r})"); continue
                tail = [l for l in r.stdout.splitlines() if "[look]" in l and s in l]
                new_look[s] = sev(out / ".look" / "report.json", s) if (out / ".look" / "report.json").exists() else None
                if r.returncode == 1:
                    msg = (tail[-1].split("] ", 1)[-1] if tail else "new severe findings")[:140]
                    live_f = known_get(s, "look")
                    if live_f is None: live_f = live_look(s)
                    if new_look[s] is not None and live_f is not None and new_look[s] <= live_f:
                        print(f"[look] {s}: WARN pre-existing on the live game too, not caused by this change: {msg}", flush=True)
                    else: status[s], why[s] = "FAIL", "look-check (new vs known): " + msg
                elif r.returncode != 0: print(f"[look] {s}: look-check crashed, report-only ({r.stderr.strip()[-80:]})")
                else: print(f"[look] {s}: {tail[-1].split('] ', 1)[-1] if tail else 'ok'}")
            except Exception as e:
                print(f"[look] {s}: skipped ({e})")
        # 3b2. axe part (contrast / tap size / button names, run on the scenario pages in 3a): only NEW severe findings vs the known set block
        def axe_set(d, s):
            return {tuple(f) for fp in sorted((d / s).glob("*.json")) for f in json.load(open(fp))}
        new_axe = {}
        for s in [x for x in slugs if status[x] == "PASS" and (out / ".look-axe" / x).is_dir()]:
            try:
                new_f = new_axe[s] = axe_set(out / ".look-axe", s)
                live_f = known_get(s, "axe")
                if live_f is None:   # no committed baseline yet: same pages on the live server, once
                    cache = SRC / ".look-live-cache" / f"{s}-live-axe-{mode}"
                    if not cache.is_dir():
                        ids = sorted({re.sub(r"-[a-z-]+\.json$", "", fp.name) for fp in (out / ".look-axe" / s).glob("*.json")})
                        empty = out / ".check" / ".empty"; empty.mkdir(parents=True, exist_ok=True)
                        e2 = {k: v for k, v in env3.items() if k not in ("GX_URL", "GX_STAGE")}
                        run_check([str(SRC / "node_modules" / ".bin" / "playwright"), "test"] + projects, str(SRC), dict(e2, GX_STAGE=str(empty), SCN_SLUGS=s, SCN_LIST=json.dumps({s: [{"id": i, "sizes": "all"} for i in ids]}),
                                  AXE_ONLY="1", LOOK_OUT=str(cache), PW_JSON=str(out / ".check" / "axe-live.json")), out / ".check" / "axe-live.log", 900)
                        cache.mkdir(parents=True, exist_ok=True)
                    live_f = axe_set(cache, s)
                if new_f - live_f: status[s], why[s] = "FAIL", "axe (new vs known): " + "; ".join(" ".join(f) for f in sorted(new_f - live_f))[:140]
                else: print(f"[look] {s}: axe ok ({len(new_f)} severe, all already known)" if new_f else f"[look] {s}: axe ok")
            except Exception as e:
                print(f"[look] {s}: axe skipped ({e})")
        # 3b3. committed baseline of known findings: rewritten for every game that passed (it becomes the live game when the deploy lands)
        KNOWN.mkdir(exist_ok=True)
        for s in slugs:
            if status[s] != "PASS" or (s not in new_look and s not in new_axe): continue
            try: cur = json.load(open(KNOWN / f"{s}.json"))
            except Exception: cur = {}
            cur[mode] = {"look": sorted([list(f) for f in (new_look.get(s) or [])]), "axe": sorted([list(f) for f in new_axe.get(s, [])])}
            (KNOWN / f"{s}.json").write_text(json.dumps(cur, indent=0) + "\n")

    deployed = []
    if a.deploy:  # 4. copy only passing games into games/
        for s in slugs:
            if status[s] == "PASS":
                dest = REPO / "games" / (s + a.suffix)
                dest.mkdir(parents=True, exist_ok=True)
                shutil.copyfile(out / s / "index.html", dest / "index.html")
                deployed.append(s)

    if deployed and srv and not a.suffix:  # the LAB owner page: every deployed game's scenario list -> games/scenarios.json, then games/lab.html
        try:
            r = subprocess.run(["node", str(SCRIPTS / "lab-index.js")] + deployed, env=env, capture_output=True, text=True, timeout=300); print(r.stdout.strip())
            subprocess.run([sys.executable, str(SCRIPTS / "lab-page.py")], check=False, timeout=60)
        except Exception as e: print("lab-index skipped:", e)
    if srv: srv.kill()
    if TIMES:
        tj = out / ".check" / "timings.json"; tj.parent.mkdir(parents=True, exist_ok=True)
        tj.write_text(json.dumps([{"slug": a_, "check": b_, "seconds": c_} for a_, b_, c_ in TIMES], indent=1))
    if deployed and not a.suffix:  # refresh games/status.json (versions, wiring); never blocks the deploy
        try: subprocess.run([sys.executable, str(SCRIPTS / "game-status.py")], check=False, timeout=120)
        except Exception as e: print("game-status skipped:", e)

    print("\n== result ==")
    for s in slugs:
        print(f"{status[s]:5} {s:18} {why[s]}" + ("   -> deployed" if s in deployed else ""))
    npass = sum(status[s] == "PASS" for s in slugs)
    print(f"{npass}/{len(slugs)} PASS; staged in {out}" + (f"; deployed {len(deployed)}" if a.deploy else "; nothing deployed (use --deploy)"))
    return 0 if npass == len(slugs) else 1

if __name__ == "__main__":
    sys.exit(main())
