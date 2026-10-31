#!/usr/bin/env python3
"""Build the itch.io web zip for Mainhattan Nightrun.

  python3 games-src/nightrun/release/package.py            # build.py, then zip -> release/dist/nightrun-web.zip
  python3 games-src/nightrun/release/package.py --no-build # reuse games/mainhattan-nightrun as it is

itch.io HTML5 limits (https://itch.io/docs/creators/html5, read 31 Oct 2026): <= 1000 files after extraction,
<= 500 MB extracted, <= 200 MB per file, <= 240 chars per path, UTF-8 case-sensitive names, index.html in the zip.
The game folder has 1098 files, so files the game can never fetch are left OUT OF THE ZIP ONLY (the repo keeps them):
  1. media/foot/<who>-<pose>.webp not listed in media/ready.json   (footart.js FA._pic loads a foot picture only if FA._rd has it, and FA._rd = ready.json)
  2. media/poses/*                                                  (no code names this folder)
  3. media/{kit,wp,abup,char}-*.webp not listed in ready.json       (every draw goes through ART.isReal(id) = ready.json; hangar/upgrades.js, weapons, abup, story)
The list is written to release/DROPPED-FILES.txt on every run so it can be reviewed.

W298: release/MUSIC-BLOCKED.txt lists music files the owner has not cleared for sale (one game-relative path per line, '#' = comment).
They are left out of BOTH zips and removed from music/tracks.json (so the song picker never offers them), media/ready.json (the game requests a media file only if listed there) and offline.json. Run with
  --stage-only   write the filtered tree to release/dist/stage/ and stop (used by the desktop build)
  --no-zips      skip the zips
Output: dist/nightrun-web.zip (itch HTML5 limits) and dist/nightrun-download.zip (same files + PLAY.html + README.txt + a file:// shim).
"""
import json, os, re, shutil, subprocess, sys, zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
GAME = os.path.join(ROOT, 'games', 'mainhattan-nightrun')
DIST = os.path.join(HERE, 'dist')
OUT = os.path.join(DIST, 'nightrun-web.zip')
OUT_DL = os.path.join(DIST, 'nightrun-download.zip')
STAGE = os.path.join(DIST, 'stage')
BLOCKED = os.path.join(HERE, 'MUSIC-BLOCKED.txt')
MAX_FILES, MAX_TOTAL, MAX_ONE, MAX_PATH = 1000, 500 * 1024 * 1024, 200 * 1024 * 1024, 240
GATED = re.compile(r'^media/(kit|wp|abup|char)-[^/]+\.webp$')


def droppable(rel, ready):
    if rel.startswith('media/foot/'):
        return rel[len('media/'):] not in ready
    if rel.startswith('media/poses/'):
        return True
    if GATED.match(rel):
        return rel[len('media/'):] not in ready
    return False


def blocked_list():
    out = set()
    if os.path.exists(BLOCKED):
        for ln in open(BLOCKED):
            ln = ln.split('#')[0].strip()
            if ln:
                out.add(ln)
    return out


# Shim injected after <head> (W298). Every build: a fetch of a blocked music file gets a local 404 instead of a network request.
# file:// shim for the download zip. Chromium cannot fetch() from file:, and the game reads media/ready.json (which pictures are
# real) with fetch. The shim answers that one request from a copy embedded at package time and answers every other fetch of a
# file: URL with a quiet 404 (the game treats that as "not there", as on the web). Music files are not fetchable on file:, so a
# double-clicked index.html plays the built-in synth music; pictures loaded from file: taint the canvas, so getImageData (used for
# the on-foot outline pass) returns a blank image instead of throwing; the desktop app serves the same files over http and plays everything.
SHIM = ('<script>(function(){var B=%s,F=%s,D=F?{"ready.json":%s,"tracks.json":%s}:{};var f=window.fetch;'
        'window.fetch=function(u){var p=String(u&&u.url||u).split(/[?#]/)[0],k=p.split("/").pop();'
        'if(D[k]&&location.protocol==="file:")return Promise.resolve(new Response(D[k],{status:200,headers:{"content-type":"application/json"}}));'
        'if(B.indexOf(k)>=0||(F&&/^(file:|[^:]*$)/.test(p)&&location.protocol==="file:"))return Promise.resolve(new Response("",{status:404}));return f.apply(this,arguments);};'
        'if(F){var g=CanvasRenderingContext2D.prototype.getImageData;CanvasRenderingContext2D.prototype.getImageData=function(x,y,w,h){'
        'try{return g.apply(this,arguments);}catch(e){return new ImageData(Math.max(1,w|0),Math.max(1,h|0));}};}})();</script>')


def make_shim(blocked, ready_txt, tracks_txt, file_mode):
    names = sorted({b.split('/')[-1] for b in blocked})
    return SHIM % (json.dumps(names), 'true' if file_mode else 'false', json.dumps(ready_txt), json.dumps(tracks_txt))


PLAY_HTML = """<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Mainhattan Nightrun - play</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>html,body{margin:0;height:100%;background:#050510;color:#e8f6ff;font:18px/1.5 system-ui,sans-serif}
body{display:flex;align-items:center;justify-content:center;text-align:center}a.go{display:inline-block;margin:18px 0;padding:16px 38px;background:#00e5ff;color:#021018;
font-weight:700;font-size:24px;border-radius:8px;text-decoration:none}p{max-width:30em;margin:6px auto;opacity:.8}</style></head>
<body><div><h1>MAINHATTAN NIGHTRUN</h1><a class="go" href="index.html" id="go">PLAY</a>
<p>Opens the game in this browser window. Use Chrome, Edge or Firefox. Works offline, no server needed.</p>
<p>Opened from a file the game uses its built-in synth music; the desktop app version plays the full soundtrack.</p></div>
<script>setTimeout(function(){location.href='index.html'},1200)</script></body></html>
"""

README = """MAINHATTAN NIGHTRUN - download version

HOW TO PLAY
1. Unzip this folder anywhere (do not run it from inside the zip).
2. Open PLAY.html in a web browser (double-click it). Chrome, Edge or Firefox.
   The game starts. Click FLIGHT to start a run. It works offline; no server is needed.
3. Optional: press F11 for full screen.

NOTES
- Opened from a file, the game plays its built-in synth music. The desktop app (Windows / Linux download on the same page) plays the full soundtrack.
- Saves are stored by your browser for this folder. Moving the folder starts a fresh save.
- Controls: arrow keys or WASD to move, Space to fire; on a touch screen drag.
"""


def stage(ready, blocked):
    """Copy the game minus dropped + blocked files into dist/stage; patch tracks.json / offline.json. Returns (keep, dropped, blocked_hit)."""
    shutil.rmtree(STAGE, ignore_errors=True)
    keep, dropped, hit = [], [], []
    for d, _, fs in os.walk(GAME):
        for f in fs:
            p = os.path.join(d, f)
            rel = os.path.relpath(p, GAME).replace(os.sep, '/')
            if rel in blocked:
                hit.append(rel)
            elif droppable(rel, ready):
                dropped.append(rel)
            else:
                keep.append(rel)
    keep.sort(); dropped.sort(); hit.sort()
    for rel in keep:
        dst = os.path.join(STAGE, rel)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.copy2(os.path.join(GAME, rel), dst)
    if blocked:
        names = {b[len('music/'):] for b in blocked if b.startswith('music/')}
        tp = os.path.join(STAGE, 'music', 'tracks.json')
        if os.path.exists(tp):
            t = json.load(open(tp))
            t['tracks'] = [x for x in t['tracks'] if x.get('file') not in names]
            json.dump(t, open(tp, 'w'), indent=1)
        rp = os.path.join(STAGE, 'media', 'ready.json')   # the game fetches a listed media file only if it is named here
        r = json.load(open(rp))
        json.dump([x for x in r if 'media/' + x not in blocked], open(rp, 'w'), separators=(',', ':'))
        op = os.path.join(STAGE, 'offline.json')
        if os.path.exists(op):
            o = json.load(open(op))
            for k in ('files', 'optional'):
                o[k] = [x for x in o.get(k, []) if x['p'] not in blocked]
            o['total'] = sum(x['bytes'] for x in o['files'])
            o['optionalTotal'] = sum(x['bytes'] for x in o.get('optional', []))
            json.dump(o, open(op, 'w'), separators=(',', ':'))
    return keep, dropped, hit


def zip_tree(out, extra=None, patched_index=None):
    if os.path.exists(out):
        os.remove(out)
    files = []
    for d, _, fs in os.walk(STAGE):
        for f in fs:
            files.append(os.path.relpath(os.path.join(d, f), STAGE).replace(os.sep, '/'))
    files.sort()
    with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as z:
        if patched_index is None:
            z.write(os.path.join(STAGE, 'index.html'), 'index.html')   # first entry
        else:
            z.writestr('index.html', patched_index)
        for rel in files:
            if rel != 'index.html':
                z.write(os.path.join(STAGE, rel), rel)
        for name, data in (extra or {}).items():
            z.writestr(name, data)


def check(out, label, itch):
    with zipfile.ZipFile(out) as z:
        infos = [i for i in z.infolist() if not i.is_dir()]
    total = sum(i.file_size for i in infos)
    big = max(i.file_size for i in infos)
    longest = max(len(i.filename) for i in infos)
    names = [i.filename for i in infos]
    ok = (len(infos) <= MAX_FILES and total <= MAX_TOTAL and big <= MAX_ONE and longest <= MAX_PATH
          and names[0] == 'index.html' and all(n == n.encode('utf8').decode('utf8') for n in names))
    print('%s: files %d | extracted %.1f MB | biggest %.1f MB | longest path %d | zip %.1f MB'
          % (label, len(infos), total / 1048576, big / 1048576, longest, os.path.getsize(out) / 1048576))
    print(('PASS' if ok else 'FAIL') + ' ' + label + (' itch limits (<=1000 files, 500 MB, 200 MB/file, 240 chars)' if itch else ' limits'))
    return ok


def main():
    if '--no-build' not in sys.argv:
        subprocess.check_call([sys.executable, os.path.join(ROOT, 'games-src', 'nightrun', 'parts', 'build.py')])
    ready_list = json.load(open(os.path.join(GAME, 'media', 'ready.json')))
    ready = set(ready_list)
    blocked = blocked_list()
    keep, dropped, hit = stage(ready, blocked)
    missing = sorted(blocked - set(hit))
    print('music blocked: %d listed, %d left out, %d not found in the game folder%s'
          % (len(blocked), len(hit), len(missing), (' (' + ', '.join(missing[:5]) + ')') if missing else ''))
    open(os.path.join(HERE, 'DROPPED-FILES.txt'), 'w').write(
        '# left out of the zips only (%d files, %.1f MB); still in the repo\n' % (len(dropped), sum(os.path.getsize(os.path.join(GAME, r)) for r in dropped) / 1e6)
        + '\n'.join(dropped) + '\n')
    if '--stage-only' in sys.argv or '--no-zips' in sys.argv:
        print('staged', len(keep), 'files in', STAGE)
        return 0
    os.makedirs(DIST, exist_ok=True)
    idx = open(os.path.join(STAGE, 'index.html'), encoding='utf8').read()
    # both zips: fetches of a blocked song answer a quiet 404 locally (the game already treats that as "no file"), no network 404 noise
    web_idx = idx.replace('<head>', '<head>' + make_shim(blocked, '', '', False), 1) if blocked else idx
    zip_tree(OUT, patched_index=web_idx)
    ok = check(OUT, 'nightrun-web.zip', True)
    tr = open(os.path.join(STAGE, 'music', 'tracks.json'), encoding='utf8').read()
    rd = open(os.path.join(STAGE, 'media', 'ready.json'), encoding='utf8').read()
    assert '<head>' in idx
    zip_tree(OUT_DL, {'PLAY.html': PLAY_HTML, 'README.txt': README}, patched_index=idx.replace('<head>', '<head>' + make_shim(blocked, rd, tr, True), 1))
    ok = check(OUT_DL, 'nightrun-download.zip', False) and ok
    return 0 if ok else 1


if __name__ == '__main__':
    sys.exit(main())
