#!/usr/bin/env python3
"""Cut the boss pose stills (games-src/anims/mainhattan-nightrun/poses/NN-boss-<name>-{a,b,c,d,atk1..atk4}.webp, white background)
into one transparent frame sheet per boss: games/mainhattan-nightrun/media/anim-boss-<name>.webp, plus anim-boss.json (cell size, frames, body width ratio).
Row 1 = idle (a b c d), row 2 = attack (atk1..atk4, only bosses that have them). Run: python3 games-src/nightrun/make-boss-anim.py"""
import glob, json, os, re
from PIL import Image, ImageDraw, ImageFilter, ImageChops
import numpy as np
R = os.path.dirname(os.path.abspath(__file__)) + '/../../'
P = R + 'games-src/anims/mainhattan-nightrun/poses/'; M = R + 'games/mainhattan-nightrun/media/'
LONG = 300   # px of the long side of one cell
INTERIOR = {'flusskrake', 'schranken-wart'}   # white gaps inside these (between tentacles, inside the barrier arm) are background too
ONLY = set(os.sys.argv[1:])
def cut(path, interior=False):
    im = Image.open(path).convert('RGB'); w, h = im.size
    work = im.copy()
    for s in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1), (w // 2, 0), (w // 2, h - 1), (0, h // 2), (w - 1, h // 2)]:
        if work.getpixel(s) != (255, 0, 255) and sum(work.getpixel(s)) > 690: ImageDraw.floodfill(work, s, (255, 0, 255), thresh=30)
    a = np.array(work); bg = (a[:, :, 0] == 255) & (a[:, :, 1] == 0) & (a[:, :, 2] == 255)
    if interior: bg |= np.array(im).min(axis=2) >= 244
    alpha = Image.fromarray(np.where(bg, 0, 255).astype('uint8'))
    alpha = alpha.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(.9))    # eat the white fringe, soften the edge
    out = im.convert('RGBA'); out.putalpha(alpha); return out
names = sorted(set(re.sub(r'^\d+-boss-(.*)-(?:a|b|c|d|atk\d)\.webp$', r'\1', os.path.basename(f)) for f in glob.glob(P + '*-boss-*.webp')))   # sek-adler has attack stills only: its idle flaps between atk4 and atk1
meta = json.load(open(M + 'anim-boss.json')) if os.path.exists(M + 'anim-boss.json') else {}
for nm in names:
    if ONLY and nm not in ONLY: continue
    I = nm in INTERIOR
    num = os.path.basename(glob.glob(P + '*-boss-' + nm + '-*.webp')[0]).split('-')[0]
    atk = [cut(P + f'{num}-boss-{nm}-atk{i}.webp', I) for i in range(1, 5) if os.path.exists(P + f'{num}-boss-{nm}-atk{i}.webp')]
    if os.path.exists(P + f'{num}-boss-{nm}-a.webp'): idle = [cut(P + f'{num}-boss-{nm}-{k}.webp', I) for k in 'abcd']
    else: idle = [atk[3], atk[0], atk[3], atk[0]]
    allf = idle + atk
    bb = [f.getchannel('A').point(lambda v: 255 if v > 40 else 0).getbbox() for f in allf]
    u = (min(b[0] for b in bb), min(b[1] for b in bb), max(b[2] for b in bb), max(b[3] for b in bb))
    aw = bb[0][2] - bb[0][0]; ah = bb[0][3] - bb[0][1]; uw, uh = u[2] - u[0], u[3] - u[1]
    sc = LONG / max(uw, uh); cw, ch = round(uw * sc), round(uh * sc)
    rows = 2 if len(atk) == 4 else 1
    sheet = Image.new('RGBA', (cw * 4, ch * rows), (0, 0, 0, 0))
    for i, f in enumerate(allf):
        c = f.crop(u).resize((cw, ch), Image.LANCZOS); sheet.paste(c, ((i % 4) * cw, (i // 4) * ch))
    sheet.save(M + f'anim-boss-{nm}.webp', quality=82, method=6)
    meta[nm] = {'cw': cw, 'ch': ch, 'idle': 4, 'atk': len(atk) if len(atk) == 4 else 0, 'kw': round(uw / aw, 3), 'kh': round(uh / ah, 3)}
    print(nm, cw, ch, 'rows', rows, 'kw', meta[nm]['kw'], os.path.getsize(M + f'anim-boss-{nm}.webp') // 1024, 'KB')
json.dump(meta, open(M + 'anim-boss.json', 'w'), indent=1)
