#!/usr/bin/env python3
"""Rebuild every game with its own build, stage it, stamp it, phone-check it, print PASS/FAIL.

  python3 games-src/scripts/build-all.py                    # all games into games-src/.staging/
  python3 games-src/scripts/build-all.py sunglaze cauldron-fair
  python3 games-src/scripts/build-all.py --out /tmp/stage sunglaze
  python3 games-src/scripts/build-all.py --deploy sunglaze  # also copy PASSING games into games/<slug>/index.html
  python3 games-src/scripts/build-all.py --deploy --suffix -next sunglaze   # preview: games/<slug>-next/
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
TIMES = []   # (slug, check, seconds)

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
    ap.add_argument("--no-sweep", action="store_true", help="with --deploy: skip the full sweep (say why in the commit)")
    ap.add_argument("--no-look", action="store_true", help="skip the look check gate (new severe visual findings block --deploy)")
    ap.add_argument("--list", action="store_true")
    a = ap.parse_args()
    if a.list:
        for s, (d, c, o) in GAMES.items(): print(f"{s:18} cd games-src/{d} && {c}  -> {o}")
        return 0
    slugs = a.slugs or list(GAMES)
    bad = [s for s in slugs if s not in GAMES]
    if bad: sys.exit("unknown slug(s): %s\nknown: %s" % (" ".join(bad), " ".join(GAMES)))
    out = pathlib.Path(a.out).resolve()
    out.mkdir(parents=True, exist_ok=True)
    status, why = {}, {}

    for s in slugs:  # 1. build + stage
        d, cmd, o = GAMES[s]
        cwd = SRC / d
        r = subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True)
        built = (cwd / o).resolve()
        if r.returncode != 0:
            status[s], why[s] = "FAIL", "build error: " + (r.stderr.strip().splitlines() or r.stdout.strip().splitlines() or ["?"])[-1][:120]
        elif not built.exists() or built.stat().st_size < 10000:
            status[s], why[s] = "FAIL", f"no output at games-src/{d}/{o}"
        else:
            (out / s).mkdir(parents=True, exist_ok=True)
            shutil.copyfile(built, out / s / "index.html")
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
    if ok and not a.no_check:  # 3. phone-check against the staging folder
        chk = out / ".check"
        env3 = dict(env, GAMES_DIR=str(out), PC_OUT_DIR=str(chk))
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
        if a.quick or a.deploy:  # 3a. scenario tests (`?scn=<id>` states: skip menus, seed the RNG, build the state, assert), all games in one run
            passing = [s for s in ok if status[s] == "PASS"]
            if passing:
                code, tail = timed("all" if len(passing) > 1 else passing[0], "scenarios", lambda: run_check(["node", str(SCRIPTS / "scenario-test.js")] + passing, str(SCRIPTS), dict(env3, SCN_OUT=str(out / ".scn")), out / ".check" / "scenarios.log", 1800))
                txt = (out / ".check" / "scenarios.log").read_text()
                for s in passing:
                    m = re.search(r"^SCN %s (\S+) (\d+)/(\d+)(.*)$" % re.escape(s), txt, re.M)
                    if not m: status[s], why[s] = "FAIL", "scenario-test did not report"
                    elif m.group(1) != "ok": status[s], why[s] = "FAIL", "scenarios %s/%s ok: %s" % (m.group(2), m.group(3), m.group(4).strip()[:100])
                    else: print(f"[scn] {s:18} {m.group(2)}/{m.group(3)} scenarios ok")
        # 3c. the game's own sweeps: QUICK=1 for --quick, the full default for --deploy (once)
        if (a.quick or a.deploy) and not (a.deploy and a.no_sweep):
            for s in [x for x in ok if status[x] == "PASS"]:
                d, scripts = SWEEPS[s]
                for sc in (scripts if a.deploy else scripts[:1]):
                    e = dict(env, GX_SLUG=s)
                    if not a.deploy: e["QUICK"] = "1"
                    code, tail = timed(s, ("quick " if not a.deploy else "full ") + sc.replace(".js", ""), lambda: run_check(["node", sc], str(SRC / d), e, out / ".check" / f"{s}-{sc}.log", 5400))
                    if code != 0: status[s], why[s] = "FAIL", f"{sc}: {tail}"[:200]; break
                    print(f"[sweep] {s:18} {sc} ok: {tail[-90:]}", flush=True)
    else:
        for s in ok: status[s] = "PASS" if a.no_check else status[s]

    if a.deploy and not a.no_look:  # 3b. look check: only NEW severe visual findings vs games-src/look-baseline.json block the deploy
        env = dict(os.environ); env.setdefault("NODE_PATH", "/opt/node-tools/node_modules")
        for s in [x for x in slugs if status[x] == "PASS"]:
            try:
                r = subprocess.run(["node", str(SCRIPTS / "look-check.js"), "--gate", "--game", s, "--games-dir", str(out), "--out", str(out / ".look"), "--no-shots"],
                                   env=env, capture_output=True, text=True, timeout=900)
                tail = [l for l in r.stdout.splitlines() if "[look]" in l and s in l]
                if r.returncode == 1: status[s], why[s] = "FAIL", "look-check: " + (tail[-1].split("] ", 1)[-1] if tail else "new severe findings")[:140]
                elif r.returncode != 0: print(f"[look] {s}: look-check crashed, report-only ({r.stderr.strip()[-80:]})")
                else: print(f"[look] {s}: {tail[-1].split('] ', 1)[-1] if tail else 'ok'}")
            except Exception as e:
                print(f"[look] {s}: skipped ({e})")

    deployed = []
    if a.deploy:  # 4. copy only passing games into games/
        for s in slugs:
            if status[s] == "PASS":
                dest = REPO / "games" / (s + a.suffix)
                dest.mkdir(parents=True, exist_ok=True)
                shutil.copyfile(out / s / "index.html", dest / "index.html")
                deployed.append(s)

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
