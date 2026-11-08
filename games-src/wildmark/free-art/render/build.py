#!/usr/bin/env python3
"""Compose the wildmark free-art set (v2): KayKit 3D terrain renders + public-domain Audubon-style plates.
Inputs : render/out/<terrain>.png (render.js), $PLATES/<animal>.jpg (see CREDITS.md), wood.py.
Output : ../ter-*.webp ../tok-<animal>.webp ../card-<animal>-a..d.webp ../table-bg.webp
Usage  : PLATES=/path/to/plates python3 build.py [outdir]"""
import os, sys, math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageOps, ImageChops
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import wood
PLATES = os.environ.get('PLATES', os.path.join(HERE, 'plates'))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(HERE)
SAVE = lambda im, stem, q: im.save(os.path.join(OUT, stem + '.webp'), quality=q, method=6)
hx = lambda c: tuple(int(c.lstrip('#')[i:i + 2], 16) for i in (0, 2, 4))
mix = lambda a, b, t: tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))
TER = ['forest', 'peak', 'meadow', 'marsh', 'river']
ANI_COL = {'bear': '#7a4e2d', 'elk': '#c08a4a', 'salmon': '#d8576b', 'hawk': '#4f6fa3', 'fox': '#e2762b'}
HAB = {'bear': 'forest', 'elk': 'meadow', 'salmon': 'river', 'hawk': 'peak', 'fox': 'marsh'}
SET_TER = {'a': None, 'b': 'meadow', 'c': 'river', 'd': 'peak'}
SET_N = {'a': 2, 'b': 1, 'c': 3, 'd': 2}
CREAM = hx('#f3ead2'); WALNUT = hx('#5a3d24')

# ---------- one colour grade for every plate (same curves): paper -> warm parchment, slightly muted ----------
def grade(im):
    a = np.asarray(im.convert('RGB')).astype(float) / 255
    lum = (a * [.299, .587, .114]).sum(2, keepdims=True)
    a = lum + (a - lum) * .88                                   # mute saturation
    a = np.clip((a - .04) / .94, 0, 1) ** 1.08                  # gentle contrast
    paper = np.array([.953, .898, .776])                        # parchment white point
    a = a * paper[None, None, :] / np.array([.99, .99, .99])    # multiply = paper tint on whites, keeps inks
    a = a * .94 + .02
    return Image.fromarray((np.clip(a, 0, 1) * 255).astype('uint8'))

def plate(name):
    return Image.open(os.path.join(PLATES, name + '.jpg')).convert('RGB')

# crop boxes as fractions (x0, y0, x1, y1) of the plate: 'head' = tight portrait for tokens, 'full' = whole animal
CROPS = {
    'elk':    {'head': (.34, .02, .70, .46), 'full': (.09, .05, .68, .80)},
    'fox':    {'head': (.40, .08, .85, .52), 'full': (.16, .08, .82, .72)},
    'bear':   {'head': (.60, .26, .92, .64), 'full': (.03, .05, .92, .88)},
    'hawk':   {'head': (.40, .32, .92, .60), 'full': (.0, .03, .92, .60)},
    'salmon': {'head': (.0, .0, .62, 1.0), 'full': (.0, .02, 1.0, .95)},
}
_pl = {}
def crop(a, kind, flip=False):
    if a not in _pl: _pl[a] = grade(plate(a))
    im = _pl[a]; W, H = im.size; x0, y0, x1, y1 = CROPS[a][kind]
    c = im.crop((int(x0 * W), int(y0 * H), int(x1 * W), int(y1 * H)))
    return ImageOps.mirror(c) if flip else c

def oval_mask(size, feather, shape='oval'):
    w, h = size; m = Image.new('L', (w * 2, h * 2), 0); d = ImageDraw.Draw(m)
    d.ellipse((feather * 2, feather * 2, w * 2 - feather * 2, h * 2 - feather * 2), fill=255)
    return m.resize((w, h), Image.LANCZOS).filter(ImageFilter.GaussianBlur(feather * .55))

# ---------- terrain ----------
def terrain(t):
    im = Image.open(os.path.join(HERE, 'out', t + '.png')).convert('RGB').resize((512, 512), Image.LANCZOS)
    a = np.asarray(im).astype(float)
    a = a * np.array([1.02, 1.0, .95]) * .97                    # warm key tint
    return Image.fromarray(np.clip(a, 0, 255).astype('uint8')), None

_ter = {}
def ter(t, size):
    k = (t, size)
    if k not in _ter: _ter[k] = terrain(t)[0].resize((size, size), Image.LANCZOS)
    return _ter[k]

# ---------- tokens ----------
def token(a, S=512):
    K = 2; N = S * K; col = hx(ANI_COL[a])
    out = Image.new('RGBA', (N, N), (0, 0, 0, 0)); d = ImageDraw.Draw(out)
    d.ellipse((2, 2, N - 3, N - 3), fill=col + (255,))                           # coloured rim
    rim = int(N * .045)
    d.ellipse((rim, rim, N - rim - 1, N - rim - 1), fill=hx('#f6edd6') + (255,))  # cream disc
    gap = int(N * .028); inner = rim + gap
    pic = crop(a, 'head').resize((N - 2 * inner, N - 2 * inner), Image.LANCZOS) if crop(a, 'head').width == crop(a, 'head').height else None
    c = crop(a, 'head'); side = min(c.size); cx, cy = c.width // 2, c.height // 2     # centre square so nothing is stretched
    c = c.crop((cx - side // 2, cy - side // 2, cx + side // 2, cy + side // 2)).resize((N - 2 * inner, N - 2 * inner), Image.LANCZOS)
    m = oval_mask(c.size, 0)
    m = Image.new('L', c.size, 0); ImageDraw.Draw(m).ellipse((0, 0, c.width - 1, c.height - 1), fill=255)
    # soft inner vignette towards the cream disc
    v = Image.new('L', c.size, 0); ImageDraw.Draw(v).ellipse((int(c.width * .04),) * 2 + (int(c.width * .96),) * 2, fill=255)
    v = v.filter(ImageFilter.GaussianBlur(c.width * .035))
    creamimg = Image.new('RGB', c.size, hx('#f6edd6')); c = Image.composite(c, creamimg, v)
    out.paste(c, (inner, inner), m)
    ImageDraw.Draw(out).ellipse((inner, inner, N - inner - 1, N - inner - 1), outline=mix(col, (0, 0, 0), .35) + (255,), width=max(2, int(N * .006)))
    return out.resize((S, S), Image.LANCZOS)

# ---------- cards ----------
def frame(im):
    d = ImageDraw.Draw(im); W, H = im.size
    d.rectangle((0, 0, W - 1, H - 1), outline=WALNUT, width=8)
    d.rectangle((14, 14, W - 15, H - 15), outline=mix(WALNUT, CREAM, .35), width=2)
    for (x, y) in ((0, 0), (W - 40, 0), (0, H - 40), (W - 40, H - 40)):          # notched corners like the old frame
        d.rectangle((x, y, x + 39, y + 39), fill=WALNUT); d.rectangle((x + 10, y + 10, x + 29, y + 29), fill=CREAM)
    return im

def shadow(sz, blur=12, alpha=110):
    s = Image.new('L', sz, 0); ImageDraw.Draw(s).ellipse((6, 6, sz[0] - 6, sz[1] - 6), fill=alpha)
    return s.filter(ImageFilter.GaussianBlur(blur))

def card(a, s):
    W, H = 600, 840; im = Image.new('RGB', (W, H), CREAM); col = hx(ANI_COL[a])
    win = (40, 40, W - 40, 560); ww, wh = 520, 520
    t1 = HAB[a]; t2 = SET_TER[s] or t1
    ill = ter(t1, 520).copy()
    if t2 != t1:
        low = ter(t2, 520); m = Image.new('L', (ww, wh), 0)
        ImageDraw.Draw(m).polygon([(0, wh * .66), (ww * .5, wh * .76), (ww, wh * .64), (ww, wh), (0, wh)], fill=255)
        ill = Image.composite(low, ill, m.filter(ImageFilter.GaussianBlur(2)))
    n = SET_N[s]
    layout = {1: [(.5, .5, 380, 'full', 0)], 2: [(.30, .56, 280, 'full', 0), (.70, .42, 240, 'head', 1)] if s == 'a' else [(.3, .38, 250, 'full', 0), (.7, .64, 250, 'head', 1)],
              3: [(.22, .66, 210, 'full', 1), (.5, .36, 200, 'head', 0), (.78, .66, 210, 'full', 0)]}[n]
    for (px, py, sz, kind, fl) in layout:
        c = crop(a, kind, bool(fl)); k = sz / max(c.size); c = c.resize((max(8, int(c.width * k)), max(8, int(c.height * k))), Image.LANCZOS)
        # plate card: cream paper edge + feathered corners, pinned on the terrain with a soft shadow
        pad = 8; paper = Image.new('RGB', (c.width + 2 * pad, c.height + 2 * pad), hx('#efe3c4')); paper.paste(c, (pad, pad))
        pm = Image.new('L', paper.size, 0); ImageDraw.Draw(pm).rounded_rectangle((0, 0, paper.width - 1, paper.height - 1), radius=14, fill=255)
        x, y = int(px * ww - paper.width / 2), int(py * wh - paper.height / 2)
        sh = Image.new('L', paper.size, 0); ImageDraw.Draw(sh).rounded_rectangle((0, 0, paper.width - 1, paper.height - 1), radius=14, fill=120)
        sh = sh.filter(ImageFilter.GaussianBlur(10))
        dark = Image.new('RGB', paper.size, (20, 16, 10)); ill.paste(dark, (x + 8, y + 12), sh); ill.paste(paper, (x, y), pm)
    im.paste(ill, win[:2])
    d = ImageDraw.Draw(im)
    d.rectangle(win, outline=WALNUT, width=6)
    d.rectangle((40, 560, W - 40, 620), fill=col); d.rectangle((40, 560, W - 40, 566), fill=mix(col, (0, 0, 0), .3))
    # habitat badge: a small round crop of the terrain render on the band
    b = ter(HAB[a], 200).crop((50, 50, 150, 150)).resize((52, 52), Image.LANCZOS); bm = Image.new('L', (52, 52), 0); ImageDraw.Draw(bm).ellipse((0, 0, 51, 51), fill=255)
    im.paste(b, (W - 40 - 52 - 14, 566 + 1), bm); ImageDraw.Draw(im).ellipse((W - 40 - 52 - 14, 567, W - 40 - 14, 619), outline=hx('#f3ead2'), width=3)
    return frame(im)

def main():
    os.makedirs(OUT, exist_ok=True)
    for t in TER:
        im = ter(t, 512); SAVE(im, 'ter-' + t, 80); print('pass ter', t)
    avail = [a for a in ANI_COL if os.path.exists(os.path.join(PLATES, a + '.jpg'))]
    for a in avail:
        tk = token(a); q = 68
        while True:                                                      # tokens stay under 30 KB
            SAVE(tk, 'tok-' + a, q)
            if os.path.getsize(os.path.join(OUT, 'tok-' + a + '.webp')) < 30 * 1024 or q <= 40: break
            q -= 6
        for s in 'abcd': SAVE(card(a, s), f'card-{a}-{s}', 82)
        print('pass animal', a)
    SAVE(wood.wood(), 'table-bg', 80); print('pass table')
    print('missing plates:', [a for a in ANI_COL if a not in avail])

if __name__ == '__main__':
    main()
