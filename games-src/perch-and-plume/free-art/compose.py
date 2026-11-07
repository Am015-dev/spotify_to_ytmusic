#!/usr/bin/env python3
"""Build every perch-and-plume free-art slot (see ART-DIRECTION.md).
Birds + UI: flat-vector SVG (birds.py, ui.py) rendered by render.js (Chromium). Portraits: Kenney Toon Characters 1
via ../../wildmark/free-art/compose.py (needs PACKS like wildmark). Usage: PACKS=<dir> python3 compose.py <outdir> [--only birds|ui|portraits]"""
import os, sys, json, subprocess, importlib.util
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import birds, ui

OUT = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith('--') else HERE
ONLY = sys.argv[sys.argv.index('--only') + 1] if '--only' in sys.argv else None
TMP = os.path.join(OUT, '_svg'); os.makedirs(TMP, exist_ok=True)
items = json.load(open(os.path.join(HERE, '..', 'assets.json')))['items']
size = {i['stem']: (i['w'], i['h'], bool(i.get('alpha'))) for i in items}

def job(stem, svgtext):
    w, h, a = size[stem]; f = os.path.join(TMP, stem + '.svg'); open(f, 'w').write(svgtext)
    return [f, os.path.join(TMP, stem + '.png'), w, h, 1 if a else 0]

jobs = []
for stem in size:
    p = stem.split('-', 1)
    if stem.startswith('bird-') and ONLY in (None, 'birds'):
        _, var, sp = stem.split('-', 2); jobs.append(job(stem, birds.bird_svg(sp, var)))
    if ONLY not in (None, 'ui') or stem.startswith('bird-') or stem.startswith('portrait-'): continue
    if p[0] == 'food': jobs.append(job(stem, ui.food(p[1])))
    elif stem == 'token-egg': jobs.append(job(stem, ui.egg()))
    elif p[0] == 'nest': jobs.append(job(stem, ui.nest(p[1])))
    elif p[0] == 'goal': jobs.append(job(stem, ui.goal(p[1])))
    elif p[0] == 'bonus': jobs.append(job(stem, ui.bonus(p[1])))
    elif stem == 'card-back': jobs.append(job(stem, ui.card_back()))
    elif stem == 'ui-feeder': jobs.append(job(stem, ui.feeder()))
    elif stem == 'ui-tray': jobs.append(job(stem, ui.tray()))
    elif stem == 'ui-cube': jobs.append(job(stem, ui.cube()))
    elif stem == 'ui-trophy': jobs.append(job(stem, ui.trophy()))
    elif p[0] == 'fx': jobs.append(job(stem, ui.fx(p[1])))
    elif p[0] == 'row': jobs.append(job(stem, ui.row(p[1])))
    elif stem == 'board-mat': jobs.append(job(stem, ui.mat()))
    elif stem == 'bg-map': jobs.append(job(stem, ui.mapbg()))
    elif stem == 'bg-title':
        jobs.append(job(stem, ui.landscape(1080, 1920, [('jay', 120, 820, 340, 'mist', 'branch'), ('meadowlark', 640, 960, 340, 'sun', 'post'), ('kingfisher', 420, 1300, 360, 'opal', 'reed')])))
    elif stem == 'bg-result':
        jobs.append(job(stem, ui.landscape(1080, 1920, [('owl', 360, 1000, 380, 'dusk', 'branch')], evening=True, seed=5)))
    elif stem not in size: pass
json.dump(jobs, open(os.path.join(TMP, 'list.json'), 'w'))
if jobs: subprocess.run(['node', os.path.join(HERE, 'render.js'), os.path.join(TMP, 'list.json')], check=True)
for svgf, png, w, h, a in jobs:
    stem = os.path.basename(png)[:-4]; im = Image.open(png); im = im.convert('RGBA' if a else 'RGB')
    im.save(os.path.join(OUT, stem + '.webp'), quality=88, method=6)

if ONLY in (None, 'portraits'):
    spec = importlib.util.spec_from_file_location('wm', os.path.join(HERE, '..', '..', 'wildmark', 'free-art', 'compose.py'))
    wm = importlib.util.module_from_spec(spec); sys.argv = sys.argv[:1]; spec.loader.exec_module(wm)
    P = {  # kind, swaps, background, prop
        'ottilie': ('fp', wm.skin('light', True) + wm.hair('#E4E2DE', True) + wm.shirt('#6A8A5A'), '#cfe0bf', 'tree_round'),
        'pip': ('ma', wm.skin('light') + wm.hair('#6A4028') + wm.shirt('#3F8A4F'), '#d8e6c0', 'pine'),
        'mags': ('fa', wm.skin('tan') + wm.hair('#C8603A') + wm.shirt('#D8A040'), '#f0e2b4', None),
        'tobias': ('mp', wm.skin('brown', True) + wm.hair('#2A2420', True) + wm.shirt('#4A6A8A'), '#c8dce6', None),
        'corvin': ('ma', wm.skin('light') + wm.hair('#1E1E24') + wm.shirt('#2A2A32'), '#b8b8c4', 'rock_big'),
        'delphine': ('fa', wm.skin('brown') + wm.hair('#2A1E18') + wm.shirt('#3A6AB0'), '#bcd6e6', None),
        'barnaby': ('mp', wm.skin('light', True) + wm.hair('#F2F0EA', True) + wm.shirt('#8A6A44'), '#e0d4b4', 'logpile'),
        'you': ('fp', wm.skin('tan', True) + wm.hair('#5A3A26', True) + wm.shirt('#4F8A6A'), '#d4e4c8', 'pine'),
    }
    for n, (k, sw, bg, prop) in P.items():
        wm.portrait(k, sw, bg, prop).resize((512, 512), Image.LANCZOS).save(os.path.join(OUT, f'portrait-{n}.webp'), quality=88, method=6)
print('pass compose perch-and-plume', len(jobs) + (8 if ONLY in (None, 'portraits') else 0))
