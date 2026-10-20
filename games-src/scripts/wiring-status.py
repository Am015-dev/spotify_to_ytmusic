#!/usr/bin/env python3
"""Recomputes which pushed paintings/3D models the live games actually load, updates the asset viewer
(games/asset-viewer/flow.json: stage pushed|wired) and games-src/WIRING-TODO.md. Run: python3 games-src/scripts/wiring-status.py"""
import json, os, re, collections
import json, os, re, collections, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wiring_scan import ROOT, text, wired   # shared scan: games-src/scripts/wiring_scan.py
P = 'games/asset-viewer/flow.json'; d = json.load(open(P))
todo = collections.defaultdict(list); m3 = collections.defaultdict(list); cnt = collections.Counter()
for b in d['batches']:
    if b['root'] != 'flow-2d' or b.get('source') == 'next-wave': continue   # planned next-wave batches have nothing to wire yet
    for i in b['items']:
        if i.get('stage') in ('pushed', 'wired'):
            i['stage'] = 'wired' if wired(b['game'], i['name'], 'webp') else 'pushed'; cnt['2d-' + i['stage']] += 1
            if i['stage'] == 'pushed': todo[b['game']].append((b.get('wave') or '', b.get('kind') or '', i['name'], (i.get('prompt') or '')[:110]))
for m in d['models']:
    m['stage'] = 'wired' if wired(m['game'], m['name'], 'glb') or wired(m['game'], m['name'], 'webp') else 'pushed'; cnt['3d-' + m['stage']] += 1
    if m['stage'] == 'pushed': m3[m['game']].append(m['name'])
json.dump(d, open(P, 'w'), separators=(',', ':'))
games = sorted(set(todo) | set(m3), key=lambda g: -len(todo[g]))
L = ['# Wiring to-do: pushed files the live games do not load yet', '', 'Regenerate: `python3 games-src/scripts/wiring-status.py` (also refreshes the asset viewer).', '',
     f"Wired: {cnt['2d-wired']} paintings, {cnt['3d-wired']} 3D models. Still to wire: {cnt['2d-pushed']} paintings, {cnt['3d-pushed']} models.", '',
     '| Game | Paintings to wire | 3D to wire |', '|---|---:|---:|'] + [f'| {g} | {len(todo[g])} | {len(m3[g])} |' for g in games]
for g in games:
    L += ['', f'## {g}', '', f'3D: {", ".join(m3[g]) or "none"}', '', '| Wave / kind | File (media/…webp) | What it is |', '|---|---|---|']
    L += [f'| {w} {k} | `{n}` | {p.replace("|", "/")} |' for w, k, n, p in sorted(todo[g])]
open('games-src/WIRING-TODO.md', 'w').write('\n'.join(L) + '\n')
print(dict(cnt)); [print(f'  {g:22} paintings {len(todo[g]):4}  3D {len(m3[g])}') for g in games]
import subprocess, sys
subprocess.run([sys.executable, os.path.join(ROOT, 'games-src/scripts/game-status.py')], check=False)  # refresh games/status.json
