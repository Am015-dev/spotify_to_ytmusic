#!/usr/bin/env python3
"""Builds games/shots.html: every screenshot the workers saved (playtest/, shots/, *-shots/ folders under games-src),
as 640 px WebP copies in games/shots/, grouped by game, newest first. Re-run after workers add screenshots:
    python3 games-src/scripts/shots-gallery.py"""
import os, re, json, hashlib, subprocess, html
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC, OUT = os.path.join(ROOT, 'games-src'), os.path.join(ROOT, 'games', 'shots')
NAMES = {'kaiten': 'Kaiten Kitchen', 'thornbound': 'The Thornbound Throne', 'nightrun': 'Mainhattan Nightrun', 'hollowbough': 'Hollowbough',
 'final-approach': 'Final Approach', 'cauldron-fair': 'Cauldron Fair', 'munch': 'Doorkick Dungeon', 'azul': 'Sunglaze', 'kot': 'Crown City Smash',
 'short-fuse': 'Short Fuse', 'xw': 'Nebula Aces', 'rc': 'Shipwreck Isle', 'ft': 'Sands of Qamar', 'tidewake': 'Tidewake', 'carc': 'Rampart & Vine',
 'lantern-dive': 'Lantern Dive', 'facelift-shots': 'Facelift survey', 'shelf-shots': 'Shelf', 'audit-suite-shots': 'Shelf', 'scripts': 'Phone checks', 'room': 'Shelf'}
SKIP = ('mainhattan-overdrive', 'overdrive', '.staging', 'node_modules', 'licence-snapshots')
REPO = 'https://github.com/Am015-dev/spotify_to_ytmusic/raw/alex/brave-carson-rbpmlk/'
# last commit time per file, in one git call
when = {}
log = subprocess.run(['git', '-C', ROOT, 'log', '--name-only', '--format=@%ct', '--', 'games-src'], capture_output=True, text=True).stdout
t = 0
for line in log.splitlines():
    if line.startswith('@'): t = int(line[1:])
    elif line and line not in when: when[line] = t
os.makedirs(OUT, exist_ok=True)
items, seen = [], set()
for dp, dn, fn in os.walk(SRC):
    rel = os.path.relpath(dp, ROOT)
    if any(s in rel for s in SKIP): dn[:] = []; continue
    if not re.search(r'(playtest|shots)', rel): continue
    for f in fn:
        if not f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')): continue
        p = os.path.join(dp, f); r = os.path.relpath(p, ROOT)
        if r not in when: continue          # only committed screenshots
        data = open(p, 'rb').read(); h = hashlib.sha1(data).hexdigest()[:16]
        if h in seen: continue
        seen.add(h); dst = os.path.join(OUT, h + '.webp')
        try:
            im = Image.open(p); w, hh = im.size
            if not os.path.exists(dst):
                im = im.convert('RGB'); im.thumbnail((640, 640)); im.save(dst, 'WEBP', quality=62, method=4)
        except Exception: continue
        g = rel.split(os.sep)[1]
        size = re.search(r'(\d{3,4})x(\d{3,4})', f)
        kind = 'phone' if size and int(size.group(1)) < int(size.group(2)) and int(size.group(1)) < 500 else ('desktop' if size and int(size.group(1)) >= 1000 else '')
        items.append({'g': NAMES.get(g, g), 'n': os.path.splitext(f)[0], 'f': h + '.webp', 'o': REPO + r.replace(os.sep, '/'), 't': when[r], 'w': w, 'h': hh, 'k': kind, 'd': os.path.relpath(dp, SRC)})
# remove thumbnails no longer used
keep = {i['f'] for i in items}
for f in os.listdir(OUT):
    if f not in keep: os.remove(os.path.join(OUT, f))
items.sort(key=lambda i: -i['t'])
page = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'shots-template.html')).read()
open(os.path.join(ROOT, 'games', 'shots.html'), 'w').write(page.replace('/*DATA*/[]', json.dumps(items, separators=(',', ':'))))
print(len(items), 'screenshots,', sum(os.path.getsize(os.path.join(OUT, f)) for f in keep) // 1024, 'KB of thumbnails')
