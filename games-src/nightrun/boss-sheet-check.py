#!/usr/bin/env python3
"""Boss art check (no browser): every frame of every boss sheet in media/anim-boss-<id>.webp.
 - no light matte: opaque near-white pixels touching transparency (halo) and enclosed neutral-white gaps (outside the allow-list of real glows)
 - ground bosses: the lowest solid row of every frame is within 4 sheet px (about 2 px on screen) of the cell bottom (feet / wheels on one baseline)
 - config: every boss has move ground|air|water and face left (they stand on the right, the player is on the left)
Run: python3 games-src/nightrun/boss-sheet-check.py   (exit 1 on any failure)"""
import json, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
M = os.path.dirname(os.path.abspath(__file__)) + '/../../games/mainhattan-nightrun/media/'
meta = json.load(open(M + 'anim-boss.json'))
GLOW = {'kronos', 'zentral-ice', 'flusskrake', 'messe-waechter', 'hoplite', 'sek-adler', 'talos', 'bruecken-waechter', 'tresor-wart', 'schranken-wart'}   # real white glows (cores, sparks, tentacle tips) are small or interior; only big enclosed gaps count below
bad = []
for nm, A in meta.items():
    if A.get('move') not in ('ground', 'air', 'water'): bad.append(f'{nm}: move missing')
    if A.get('face') != 'left': bad.append(f'{nm}: face is not left')
    im = np.array(Image.open(M + f'anim-boss-{nm}.webp').convert('RGBA')); cw, ch = A['cw'], A['ch']
    rows = im.shape[0] // ch
    for r in range(rows):
        for c in range(4):
            f = im[r * ch:(r + 1) * ch, c * cw:(c + 1) * cw]; al = f[..., 3]; rgb = f[..., :3].astype(int)
            light = (rgb.min(2) >= 228) & (al > 200) & ((rgb.max(2) - rgb.min(2)) < 26)
            edge = ndi.binary_dilation(al < 40, iterations=2)
            halo = int((light & edge).sum())
            lab, n = ndi.label(light); big = 0
            for i in range(1, n + 1):
                m = lab == i
                if m.sum() >= 40 and not ndi.binary_dilation(m, iterations=2)[al < 40].any() and (rgb[m].min(1) >= 240).mean() > .9:
                    # enclosed pure-white blob: a glow (soft, bright core inside coloured pixels) or a gap? a gap is flat white with no colour inside
                    if rgb[m].std() < 4 and nm != 'kronos': big += int(m.sum())
            if halo > 40 or big > 0: bad.append(f'{nm} r{r}c{c}: light halo {halo}px, flat white {big}px')
            if A.get('move') == 'ground':
                rr = np.where((al > 90).sum(axis=1) >= 6)[0]
                if len(rr) and ch - 1 - rr.max() > 4: bad.append(f'{nm} r{r}c{c}: feet {ch - 1 - rr.max()} sheet px above the cell bottom')
print('\n'.join(bad) or 'boss sheets OK (%d bosses)' % len(meta)); sys.exit(1 if bad else 0)
