#!/usr/bin/env python3
"""Writes the files the runtime coverage run PROVED were drawn (games-src/nightrun/asset-coverage.json, made by asset-coverage.js with JSON=...)
into games-src/wiring-manual.json under 'mainhattan-nightrun', in the names the asset viewer scan expects, so names built at runtime
('anim/<who>/<act>-strip.webp' = strip-<who>-<act>, 'foot/<x>.webp' = foot-<x>) stop showing as unwired.
Only files in the log's drawn / shown lists are added; entries that no longer appear in the log are removed (the list is regenerated, never hand-edited).
Run: python3 games-src/nightrun/coverage-manual.py   then   python3 games-src/scripts/wiring-status.py"""
import json, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.chdir(ROOT)
GAME = 'mainhattan-nightrun'
log = json.load(open('games-src/nightrun/asset-coverage.json'))
proved = set(log['drawnFiles']) | set(log['shownFiles'])
def viewer_name(f):
    f = re.sub(r'\.(webp|png|jpe?g)$', '', f)
    m = re.match(r'anim/([^/]+)/([^/]+)-strip$', f)
    if m: return f'strip-{m.group(1)}-{m.group(2)}'
    return f.replace('/', '-')
names = sorted({viewer_name(f) for f in proved})
M = json.load(open('games-src/wiring-manual.json'))
M[GAME] = names
json.dump(M, open('games-src/wiring-manual.json', 'w'), indent=1)
open('games-src/wiring-manual.json', 'a').write('\n')
print(f'{GAME}: {len(names)} names written to games-src/wiring-manual.json')
