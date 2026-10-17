#!/usr/bin/env python3
"""Crop the transparent margins off the 9-slice kit files so border-image fits the element edge.
Writes <name>-c.webp next to each original in games/<slug>/media (originals untouched). Run: python3 games-src/scripts/crop-kit.py [slug...]"""
import sys, pathlib
from PIL import Image
R = pathlib.Path(__file__).resolve().parents[2]
NAMES = ['ui-row', 'ui-button-cream', 'ui-button-go', 'ui-button-power', 'ui-panel', 'ui-bubble', 'ui-act-banner', 'ui-phrase', 'ui-button-roll', 'ui-altbar', 'ui-sheet', 'ui-sheet-head', 'ui-round-shield', 'ui-trick-pad', 'ui-seat', 'ui-nametag-gold', 'ui-nametag-green', 'ui-nametag-purple', 'ui-nametag-red', 'ui-nametag-teal', 'ui-nameplate', 'ui-eq-frame', 'ui-job-sheet', 'ui-rack', 'wire-tile-frame', 'awning', 'ui-stall', 'ui-stall-locked', 'btn-stop', 'btn-draw', 'icon-boom']
for slug in sys.argv[1:] or ['sands-of-qamar', 'crown-city-smash', 'doorkick-dungeon']:
    m = R / 'games' / slug / 'media'
    for n in NAMES:
        f = m / f'{n}.webp'
        if not f.exists(): continue
        im = Image.open(f).convert('RGBA'); bb = im.getbbox()
        im.crop(bb).save(m / f'{n}-c.webp', 'WEBP', quality=92, method=6)
        print(slug, n, im.size, '->', bb)

# -k files: the painted medallion / icon-button rings are delivered with an opaque white hole in the hanging loop; key it out (flood from near-white pixels, top part only)
KEY = ['ui-iconbtn', 'ui-node-open', 'ui-node-done', 'ui-node-locked', 'ui-node-boss']
for slug in sys.argv[1:] or []:
    m = R / 'games' / slug / 'media'
    for n in KEY:
        f = m / f'{n}.webp'
        if not f.exists(): continue
        im = Image.open(f).convert('RGBA'); px = im.load(); W, H = im.size
        for y in range(int(H * .45)):
            for x in range(W):
                r, g, b, a = px[x, y]
                if a and min(r, g, b) > 222 and max(r, g, b) - min(r, g, b) < 28: px[x, y] = (r, g, b, 0)
        im.save(m / f'{n}-k.webp', 'WEBP', quality=92, method=6, exact=True)
        print(slug, n, '-k')
