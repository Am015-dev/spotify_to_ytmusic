"""Production actions for the viewer: lane status (logs/WORKING_*.txt), bulk 2D votes, and starting Flow lanes (flow_lane.ps1).
Lanes run in their own visible PowerShell window, same as wave*_start.ps1."""
import json, os, re, subprocess, time, urllib.request
from datetime import date
from pathlib import Path

import votes2d

GA = Path(os.environ.get("GAME_ASSETS", Path(__file__).parent.parent))
JOB = re.compile(r"^([a-z0-9-]+)\|(prompts[a-z0-9-]*\.json)\|(1:1|16:9|4:3|3:4|9:16)$")


def lanes():
    out = []
    for f in sorted((GA / "logs").glob("WORKING_*.txt")):
        text = f.read_text(encoding="utf-8", errors="ignore").strip()
        age = time.time() - f.stat().st_mtime
        state = "stopped" if "STOPPED" in text else "done" if "ALL DONE" in text else "running" if age < 600 else "idle"
        out.append({"tab": f.stem[8:], "text": text, "age": int(age), "state": state})
    return out


def bulk(changes):
    if not isinstance(changes, list) or len(changes) > 2000: raise ValueError("bad bulk")
    if not all(isinstance(c, dict) and votes2d.KEY.match(c.get("key", "")) for c in changes): raise ValueError("bad key in bulk")  # all or nothing
    votes = {}
    for c in changes: votes = votes2d.apply(c.get("key", ""), c.get("v"), c.get("note", ""))
    return votes


def flow_tabs():
    with urllib.request.build_opener(urllib.request.ProxyHandler({})).open("http://127.0.0.1:9222/json", timeout=5) as r:
        return [t["id"] for t in json.load(r) if t.get("type") == "page" and "flow.google" in t.get("url", "")]


def run(jobs):
    """Start one lane for these jobs on a Flow tab that no running lane uses."""
    if not isinstance(jobs, list) or not jobs or len(jobs) > 60: raise ValueError("bad jobs")
    for j in jobs:
        m = JOB.match(j or "")
        if not m or not (GA / "flow-2d" / m.group(1) / m.group(2)).is_file(): raise ValueError(f"bad job {j}")
    busy = {l["tab"] for l in lanes() if l["state"] == "running"}
    free = [t for t in flow_tabs() if t[:4] not in busy]
    if not free: raise ValueError("no free Flow tab: open another Flow tab or wait for a lane to finish")
    tab, log = free[0], GA / "logs" / f"flow_gui_{date.today():%Y%m%d}.log"
    subprocess.Popen(["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-NoExit", "-File", str(GA / "flow_lane.ps1"),
                      "-Tab", tab, "-Log", str(log), "-Jobs", ",".join(jobs)], creationflags=subprocess.CREATE_NEW_CONSOLE)
    return {"tab": tab, "jobs": jobs, "log": log.name}


COVER_ALIAS = {"thornbound": "thornbound-throne"}  # flow-covers file names that differ from the game folder


def music(games_dir, base, cover):
    """{game: {cover, tracks: [{name, url, kb}]}} for every games/<game>/music/*.mp3|ogg (preview folders skipped).
    base: URL prefix for the games folder ('game/' via serve.py, '../' on GitHub Pages); cover(path) -> URL or None."""
    out = {}
    for d in sorted(p for p in Path(games_dir).iterdir() if p.is_dir() and not p.name.endswith(("-next", "-new"))):
        files = sorted([*(d / "music").glob("*.mp3"), *(d / "music").glob("*.ogg")])
        if not files: continue
        c = GA / "flow-covers" / f"{COVER_ALIAS.get(d.name, d.name)}.jpg"
        out[d.name] = {"cover": cover(c) if c.is_file() else None,
                       "tracks": [{"name": f.stem, "url": f"{base}{d.name}/music/{f.name}", "kb": f.stat().st_size // 1024} for f in files]}
    return out
