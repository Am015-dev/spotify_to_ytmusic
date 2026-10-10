#!/usr/bin/env python3
"""Rebuild every game with its own build, stage it, stamp it, phone-check it, print PASS/FAIL.

  python3 games-src/scripts/build-all.py                    # all games into games-src/.staging/
  python3 games-src/scripts/build-all.py sunglaze cauldron-fair
  python3 games-src/scripts/build-all.py --out /tmp/stage sunglaze
  python3 games-src/scripts/build-all.py --deploy sunglaze  # also copy PASSING games into games/<slug>/index.html
  python3 games-src/scripts/build-all.py --deploy --suffix -next sunglaze   # preview: games/<slug>-next/
Other flags: --no-check (skip phone-check), --list (print the table and exit).

Staging layout: <out>/<slug>/index.html (+ <out>/.check/ with phone-check results and shots).
Nothing is written under games/ unless --deploy is given. No AI is used.
"""
import argparse, os, pathlib, re, shutil, subprocess, sys

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

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("slugs", nargs="*", help="games to build (default: all)")
    ap.add_argument("--out", default=str(SRC / ".staging"), help="staging folder (default games-src/.staging/)")
    ap.add_argument("--deploy", action="store_true", help="copy PASSING games into games/<slug><suffix>/index.html")
    ap.add_argument("--suffix", default="", help='deploy folder suffix, e.g. "-next" for a preview')
    ap.add_argument("--no-check", action="store_true", help="skip phone-check (build + stamp only)")
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

    if ok and not a.no_check:  # 3. phone-check against the staging folder
        chk = out / ".check"
        env = dict(os.environ, GAMES_DIR=str(out), PC_OUT_DIR=str(chk))
        env.setdefault("NODE_PATH", "/opt/node-tools/node_modules")
        r = subprocess.run(["node", str(SCRIPTS / "phone-check.js")] + ok, env=env, capture_output=True, text=True)
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
        for s in ok: status[s] = "PASS" if a.no_check else status[s]

    deployed = []
    if a.deploy:  # 4. copy only passing games into games/
        for s in slugs:
            if status[s] == "PASS":
                dest = REPO / "games" / (s + a.suffix)
                dest.mkdir(parents=True, exist_ok=True)
                shutil.copyfile(out / s / "index.html", dest / "index.html")
                deployed.append(s)

    print("\n== result ==")
    for s in slugs:
        print(f"{status[s]:5} {s:18} {why[s]}" + ("   -> deployed" if s in deployed else ""))
    npass = sum(status[s] == "PASS" for s in slugs)
    print(f"{npass}/{len(slugs)} PASS; staged in {out}" + (f"; deployed {len(deployed)}" if a.deploy else "; nothing deployed (use --deploy)"))
    return 0 if npass == len(slugs) else 1

if __name__ == "__main__":
    sys.exit(main())
