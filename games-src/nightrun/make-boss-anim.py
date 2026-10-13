#!/usr/bin/env python3
"""Cut the boss pose stills (games-src/anims/mainhattan-nightrun/poses/NN-boss-<name>-{a,b,c,d,atk1..atk4}.webp, white background)
into one transparent frame sheet per boss: games/mainhattan-nightrun/media/anim-boss-<name>.webp, plus anim-boss.json (cell size, frames, body width ratio).
Row 1 = idle (a b c d), row 2 = attack (atk1..atk4, only bosses that have them). Run: python3 games-src/nightrun/make-boss-anim.py"""
import glob, json, os, re, sys
from PIL import Image, ImageDraw, ImageFilter, ImageChops
import numpy as np
R = os.path.dirname(os.path.abspath(__file__)) + '/../../'
P = R + 'games-src/anims/mainhattan-nightrun/poses/'; M = os.environ.get('BOSS_OUT') or R + 'games/mainhattan-nightrun/media/'
LONG = 300   # px of the long side of one cell
# per boss: how it moves (config read by the game: ground = walks/rolls on the road line, air = flies, water = rides the water surface),
# whether the pictures were drawn facing right (flip: the bosses stand on the right and must face the player on the left),
# and how big an enclosed white gap must be to count as background (holes: between legs, inside wheels, arms, tentacles)
MOVE = {'sek-adler': 'air', 'flusskrake': 'water', 'zentral-ice': 'air', 'kronos': 'air', 'tresor-wart': 'ground', 'bruecken-waechter': 'ground',
        'schranken-wart': 'air', 'messe-waechter': 'air', 'hoplite': 'ground', 'talos': 'ground'}
FLIP = {'talos'}
HOLES = {'flusskrake': 40, 'schranken-wart': 40, 'bruecken-waechter': 30, 'hoplite': 30, 'talos': 30, 'tresor-wart': 60}
ONLY = set(a for a in os.sys.argv[1:] if not a.startswith('-'))
sys.path.insert(0, R + 'games-src/scripts')
import cutout
def cut(path, nm):
    im = Image.open(path).convert('RGB')
    out, _ = cutout.matte(im, key='white', holes=nm in HOLES, hole_min=HOLES.get(nm, 900), feather=1.0, shrink=1)
    return out.transpose(Image.FLIP_LEFT_RIGHT) if nm in FLIP else out
def low(f):   # lowest row with a real body (not a stray spark): at least 6 solid pixels
    a = np.array(f.getchannel('A')) > 90
    rows = np.where(a.sum(axis=1) >= 6)[0]
    return int(rows.max()) + 1 if len(rows) else a.shape[0]
names = sorted(set(re.sub(r'^\d+-boss-(.*)-(?:a|b|c|d|atk\d)\.webp$', r'\1', os.path.basename(f)) for f in glob.glob(P + '*-boss-*.webp')))   # sek-adler has attack stills only: its idle flaps between atk4 and atk1
meta = json.load(open(M + 'anim-boss.json')) if os.path.exists(M + 'anim-boss.json') else {}
for nm in names:
    if ONLY and nm not in ONLY: continue
    num = os.path.basename(glob.glob(P + '*-boss-' + nm + '-*.webp')[0]).split('-')[0]
    atk = [cut(P + f'{num}-boss-{nm}-atk{i}.webp', nm) for i in range(1, 5) if os.path.exists(P + f'{num}-boss-{nm}-atk{i}.webp')]
    if os.path.exists(P + f'{num}-boss-{nm}-a.webp'): idle = [cut(P + f'{num}-boss-{nm}-{k}.webp', nm) for k in 'abcd']
    else: idle = [atk[3], atk[0], atk[3], atk[0]]
    allf = idle + atk
    bb = [f.getchannel('A').point(lambda v: 255 if v > 40 else 0).getbbox() for f in allf]
    gr = MOVE[nm] == 'ground'
    if gr:   # walkers: every frame is cut so its feet / wheels / tracks sit on the bottom edge of the cell (one baseline for all frames)
        bb = [(b[0], b[1], b[2], low(f)) for b, f in zip(bb, allf)]
        CH = max(b[3] - b[1] for b in bb)
        u = (min(b[0] for b in bb), 0, max(b[2] for b in bb), CH); ah = bb[0][3] - bb[0][1]
    else:
        u = (min(b[0] for b in bb), min(b[1] for b in bb), max(b[2] for b in bb), max(b[3] for b in bb)); ah = bb[0][3] - bb[0][1]
    aw = bb[0][2] - bb[0][0]; uw, uh = u[2] - u[0], u[3] - u[1]
    sc = LONG / max(uw, uh); cw, ch = round(uw * sc), round(uh * sc)
    rows = 2 if len(atk) == 4 else 1
    sheet = Image.new('RGBA', (cw * 4, ch * rows), (0, 0, 0, 0))
    for i, f in enumerate(allf):
        box = (u[0], bb[i][3] - uh, u[2], bb[i][3]) if gr else u
        c = f.crop(box).resize((cw, ch), Image.LANCZOS); sheet.paste(c, ((i % 4) * cw, (i // 4) * ch))
    sheet.save(M + f'anim-boss-{nm}.webp', quality=82, method=6)
    meta[nm] = {'cw': cw, 'ch': ch, 'idle': 4, 'atk': len(atk) if len(atk) == 4 else 0, 'kw': round(uw / aw, 3), 'kh': round(uh / ah, 3), 'move': MOVE[nm], 'gb': 1 if gr else 0}
    print(nm, cw, ch, 'rows', rows, 'kw', meta[nm]['kw'], os.path.getsize(M + f'anim-boss-{nm}.webp') // 1024, 'KB')
json.dump(meta, open(M + 'anim-boss.json', 'w'), indent=1)
