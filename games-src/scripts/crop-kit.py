#!/usr/bin/env python3
"""Crop the transparent margins off the 9-slice kit files so border-image fits the element edge.
Writes <name>-c.webp next to each original in games/<slug>/media (originals untouched). Run: python3 games-src/scripts/crop-kit.py [slug...]"""
import sys, pathlib
from PIL import Image
R = pathlib.Path(__file__).resolve().parents[2]
NAMES = ['ui-row', 'ui-button-cream', 'ui-button-go', 'ui-button-power', 'ui-panel', 'ui-bubble', 'ui-act-banner']
for slug in sys.argv[1:] or ['sands-of-qamar', 'crown-city-smash', 'doorkick-dungeon']:
    m = R / 'games' / slug / 'media'
    for n in NAMES:
        f = m / f'{n}.webp'
        if not f.exists(): continue
        im = Image.open(f).convert('RGBA'); bb = im.getbbox()
        im.crop(bb).save(m / f'{n}-c.webp', 'WEBP', quality=92, method=6)
        print(slug, n, im.size, '->', bb)
