#!/usr/bin/env python3
"""Compose every wildmark free-art slot from Kenney CC0 packs (see ART-DIRECTION.md, CREDITS.md).
Needs the packs unzipped under $PACKS (default ./packs) and the vector sheets rendered to PNG by
render-vectors.sh (Chromium, filters stripped):  r/round4.png (Animal Pack Redux round.svg @4x),
r/hexobj4.png (Hexagon Pack objects @4x), svg/toon_{ma,fa,mp,fp}.svg (Toon Characters 1, filters stripped).
Usage: PACKS=/path python3 compose.py [outdir]"""
import os, sys, random, math
from PIL import Image, ImageDraw, ImageFilter, ImageChops, ImageEnhance

PACKS = os.environ.get('PACKS', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'packs'))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(os.path.abspath(__file__))
R = os.path.join(PACKS, 'r')
SAVE = lambda im, stem, q=88: im.save(os.path.join(OUT, stem + '.webp'), quality=q, method=6)

def hx(c):
    c = c.lstrip('#'); return tuple(int(c[i:i + 2], 16) for i in (0, 2, 4))
def mix(a, b, t): return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))

# ---------- sprite extraction (connected component around a seed point) ----------
_sheets = {}
_masks = {}
def sheet(name):
    if name not in _sheets: _sheets[name] = Image.open(os.path.join(R, name)).convert('RGBA')
    return _sheets[name]

def component(name, tx, ty, k, grow=6):
    """Crop the sprite whose pixels touch thumbnail point (tx,ty) (thumb scale k)."""
    im = sheet(name)
    if (name, grow) not in _masks:
        _masks[(name, grow)] = im.split()[3].point(lambda v: 255 if v > 10 else 0).filter(ImageFilter.MaxFilter(grow * 2 + 1))
    m = _masks[(name, grow)]
    x, y = int(tx * k), int(ty * k)
    # walk to nearest opaque pixel
    best = None
    for r in range(0, 200, 2):
        for dx, dy in ((r, 0), (-r, 0), (0, r), (0, -r), (r, r), (-r, -r), (r, -r), (-r, r)):
            if 0 <= x + dx < m.width and 0 <= y + dy < m.height and m.getpixel((x + dx, y + dy)) == 255:
                best = (x + dx, y + dy); break
        if best: break
    w = 900; box = (max(0, best[0] - w), max(0, best[1] - w), min(m.width, best[0] + w), min(m.height, best[1] + w))
    sub = m.crop(box).convert('L'); seed = (best[0] - box[0], best[1] - box[1])
    ImageDraw.floodfill(sub, seed, 128)
    comp = sub.point(lambda v: 255 if v == 128 else 0)
    bb = comp.getbbox()
    crop = im.crop(box).crop(bb)
    mask = comp.crop(bb).filter(ImageFilter.MinFilter(grow * 2 + 1 if grow else 1)) if False else comp.crop(bb)
    out = Image.new('RGBA', crop.size); out.paste(crop, (0, 0), ImageChops.multiply(crop.split()[3], mask))
    return out.crop(out.getbbox())

KA = 5135 / 1400   # animal sheet thumb scale
ANIMAL_AT = {'bear': (418, 765), 'moose': (1253, 550), 'owl': (418, 1185), 'parrot': (1253, 140), 'dog': (1253, 1185),
             'whale': (140, 550), 'goat': (140, 1185), 'rabbit': (1253, 350)}
_an = {}
def animal(n):
    if n not in _an: _an[n] = component('round4.png', *ANIMAL_AT[n], KA, grow=8)
    return _an[n].copy()

def recolour(im, pairs, tol=60):
    """Map pixels near each source colour to the target colour (flat vector art, so exact)."""
    px = im.load(); src = [(hx(a), hx(b)) for a, b in pairs]
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, al = px[x, y]
            if al == 0: continue
            bd, bt = 1e9, None
            for s, t in src:
                d = abs(r - s[0]) + abs(g - s[1]) + abs(b - s[2])
                if d < bd: bd, bt = d, t
            if bd < tol: px[x, y] = bt + (al,)
    return im

def palette(im, n=12):
    q = im.convert('RGB').quantize(n); p = q.getpalette()[:n * 3]
    cs = sorted(q.getcolors(), reverse=True)
    return ['#%02x%02x%02x' % tuple(p[i * 3:i * 3 + 3]) for _, i in cs]

def fox():
    im = animal('dog').copy()
    # dog greys -> fox oranges, light grey muzzle -> cream white, ears inner -> dark
    return recolour(im, [('#9f9898', '#e2762b'), ('#b1aaaa', '#ee8a3c'), ('#958f8f', '#c95f1c'), ('#d2d0d0', '#fbf1e2')], tol=36)
def hawk():
    im = animal('parrot').copy()
    return recolour(im, [('#d23007', '#8a5a33'), ('#b22705', '#6e4526'), ('#ad4b3a', '#7b4e2c'),
                         ('#5d98ea', '#f2b630'), ('#4a80c8', '#d99a1c'), ('#fecd09', '#f3ead8'), ('#e0b400', '#e2d6bf')], tol=60)
def salmon():
    im = animal('whale').copy()
    return recolour(im, [('#365a66', '#d8576b'), ('#2e4c55', '#b8414f'), ('#4c6e7a', '#e46f7f'), ('#c3dce9', '#f6c9b8'), ('#bcd2dd', '#eab2a0')], tol=40)
def elk(): return animal('moose')
def bear(): return animal('bear')
ANI = {'bear': bear, 'elk': elk, 'salmon': salmon, 'hawk': hawk, 'fox': fox}

# ---------- hexagon pack objects (vector @4x) ----------
KO = 6350 / 1500
OBJ_AT = {'rock_big': (160, 235), 'rock_a': (143, 325), 'rock_b': (197, 330), 'rock_c': (258, 330),
          'rock_s1': (135, 440), 'rock_s2': (177, 447), 'rock_s3': (220, 450), 'tree_round_s': (442, 392), 'tree_round': (474, 388),
          'pine': (512, 393), 'pine_s': (549, 394), 'log': (460, 740), 'logpile': (395, 735)}
_ob = {}
def obj(n):
    if n not in _ob: _ob[n] = component('hexobj4.png', *OBJ_AT[n], KO, grow=3)
    return _ob[n].copy()

def fit(im, h=None, w=None):
    if h: w2 = int(im.width * h / im.height); return im.resize((max(1, w2), h), Image.LANCZOS)
    h2 = int(im.height * w / im.width); return im.resize((w, max(1, h2)), Image.LANCZOS)

def shadow_for(spr, alpha=70, blur=6):
    a = spr.split()[3].point(lambda v: alpha if v > 0 else 0)
    sh = Image.new('RGBA', spr.size, (0, 0, 0, 0)); sh.putalpha(a)
    return sh.filter(ImageFilter.GaussianBlur(blur))

# ---------- terrain textures (seamless, Kenney flat look) ----------
TER = {'peak': '#7f8a91', 'forest': '#3f8a4f', 'meadow': '#cdb65c', 'marsh': '#5c9a86', 'river': '#4a8cc4'}

def wrap_paste(base, spr, x, y, S):
    for ox in (-S, 0, S):
        for oy in (-S, 0, S):
            base.alpha_composite(spr, (int(x + ox), int(y + oy))) if (-spr.width < x + ox < S and -spr.height < y + oy < S) else None

def blobs(d, S, rnd, col, n, rmin, rmax):
    for _ in range(n):
        x, y, r = rnd.uniform(0, S), rnd.uniform(0, S), rnd.uniform(rmin, rmax)
        for ox in (-S, 0, S):
            for oy in (-S, 0, S):
                d.ellipse((x + ox - r, y + oy - r * .7, x + ox + r, y + oy + r * .7), fill=col)

def terrain(t, S=1024, seed=7):
    rnd = random.Random(seed + hash(t) % 1000)
    base = hx(TER[t]); im = Image.new('RGBA', (S, S), base + (255,)); d = ImageDraw.Draw(im)
    blobs(d, S, rnd, mix(base, (255, 255, 255), .07) + (255,), 26, 40, 90)
    blobs(d, S, rnd, mix(base, (0, 0, 0), .06) + (255,), 18, 30, 70)
    pts = []
    grid = 3 if t in ('forest', 'peak') else 4
    for i in range(grid):
        for j in range(grid):
            pts.append(((i + .5) / grid * S + rnd.uniform(-.18, .18) * S / grid, (j + .5) / grid * S + rnd.uniform(-.18, .18) * S / grid))
    if t == 'forest':
        pts2 = pts + [((x + S / 6) % S, (y + S / 6) % S) for x, y in pts]
        pts2.sort(key=lambda p: p[1])
        for k, (x, y) in enumerate(pts2):
            spr = fit(obj('pine' if k % 3 else 'tree_round'), h=int(rnd.uniform(190, 250)))
            sh = shadow_for(spr, 80, 8)
            wrap_paste(im, sh, x - spr.width / 2 + 14, y - spr.height + 12, S)
            wrap_paste(im, spr, x - spr.width / 2, y - spr.height, S)
    elif t == 'peak':
        # snow patches then rocks
        blobs(d, S, rnd, (236, 242, 246, 255), 12, 34, 64)
        pts.sort(key=lambda p: p[1])
        for k, (x, y) in enumerate(pts):
            spr = fit(obj(['rock_big', 'rock_a', 'rock_c', 'rock_b'][k % 4]), h=int(rnd.uniform(230, 290) if k % 4 == 0 else rnd.uniform(170, 220)))
            spr = ImageEnhance.Brightness(spr).enhance(1.18)
            wrap_paste(im, shadow_for(spr, 90, 7), x - spr.width / 2 + 12, y - spr.height + 10, S)
            wrap_paste(im, spr, x - spr.width / 2, y - spr.height, S)
    elif t == 'meadow':
        gold, dark, light = hx('#e6cf74'), hx('#a8913c'), hx('#f6e7a8')
        for (x, y) in pts + [((x + S / 8) % S, (y + S / 8) % S) for x, y in pts]:
            for ox in (-S, 0, S):
                for oy in (-S, 0, S):
                    X, Y = x + ox, y + oy
                    for b in range(5):  # wheat tuft: blades + heads
                        a = math.radians(-90 + (b - 2) * 16); L = 62 + (b % 2) * 18
                        ex, ey = X + math.cos(a) * L, Y + math.sin(a) * L
                        d.line((X, Y, ex, ey), fill=dark + (255,), width=7)
                        d.ellipse((ex - 9, ey - 16, ex + 9, ey + 8), fill=gold + (255,), outline=dark + (255,), width=3)
            r = rnd.choice([(232, 96, 76), (255, 255, 255), (246, 214, 92)])
            fx, fy = (x + S / 5) % S, (y + S / 3) % S
            d.ellipse((fx - 9, fy - 9, fx + 9, fy + 9), fill=r + (255,))
    elif t == 'marsh':
        water, wl = hx('#4a8cc4'), hx('#7fb2dc')
        for (x, y) in pts[::2]:
            for ox in (-S, 0, S):
                for oy in (-S, 0, S):
                    X, Y = x + ox, y + oy
                    d.ellipse((X - 95, Y - 50, X + 95, Y + 50), fill=water + (255,))
                    d.arc((X - 60, Y - 25, X + 20, Y + 15), 200, 330, fill=wl + (255,), width=6)
        for (x, y) in pts[1::2] + [((x + S / 7) % S, (y + S / 5) % S) for x, y in pts[::3]]:
            for ox in (-S, 0, S):
                for oy in (-S, 0, S):
                    X, Y = x + ox, y + oy
                    for b in range(4):
                        bx = X + (b - 1.5) * 16; h = 70 + (b % 2) * 26
                        d.line((bx, Y, bx + (b - 1.5) * 4, Y - h), fill=hx('#2f6b4f') + (255,), width=6)
                        if b % 2 == 0: d.rounded_rectangle((bx - 7 + (b - 1.5) * 4, Y - h - 30, bx + 7 + (b - 1.5) * 4, Y - h + 2), 7, fill=hx('#8a5a33') + (255,))
    elif t == 'river':
        lt, dk = hx('#8cc0e8'), hx('#3b78ad')
        for j in range(8):
            y = (j + .5) * S / 8
            for i in range(5):
                x = (i + (j % 2) * .5) * S / 4 + rnd.uniform(-20, 20)
                for ox in (-S, 0, S):
                    d.arc((x + ox - 60, y - 22, x + ox + 60, y + 22), 200, 340, fill=lt + (255,), width=9)
                    d.arc((x + ox - 30, y + 30, x + ox + 50, y + 54), 200, 340, fill=dk + (255,), width=6)
    return im.resize((512, 512), Image.LANCZOS).convert('RGB')

# ---------- hex scene (title, results, logo) ----------
def hex_poly(cx, cy, r):
    return [(cx + r * math.cos(math.radians(60 * i - 30)), cy + r * math.sin(math.radians(60 * i - 30))) for i in range(6)]

_tex = {}
def tex(t, size):
    k = (t, size)
    if k not in _tex: _tex[k] = terrain(t).resize((size, size), Image.LANCZOS).convert('RGBA')
    return _tex[k]

def hex_tile(t, r, rim='#2e3a2f'):
    w, h = int(2 * r * math.cos(math.radians(30))) + 4, 2 * r + 4
    T = tex(t, int(r * 1.5))
    fill = Image.new('RGBA', (w, h + 18))
    for x in range(0, w, T.width):
        for y in range(0, h, T.height): fill.alpha_composite(T, (x, y))
    m = Image.new('L', fill.size, 0); md = ImageDraw.Draw(m)
    side = Image.new('RGBA', fill.size, (0, 0, 0, 0)); sd = ImageDraw.Draw(side)
    cx, cy = w / 2, h / 2
    sd.polygon(hex_poly(cx, cy + 14, r - 2), fill=mix(hx(TER[t]), (0, 0, 0), .45) + (255,))   # tile thickness
    md.polygon(hex_poly(cx, cy, r - 2), fill=255)
    top = Image.new('RGBA', fill.size, (0, 0, 0, 0)); top.paste(fill, (0, 0), m)
    ImageDraw.Draw(top).polygon(hex_poly(cx, cy, r - 2), outline=mix(hx(TER[t]), (255, 255, 255), .25) + (255,), width=max(2, int(r * .04)))
    side.alpha_composite(top)
    return side

def token(a, size, ring=None):
    S = size * 2; im = Image.new('RGBA', (S, S), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    col = hx('#b5803f') if a == 'acorn' else hx({'bear': '#7a4e2d', 'elk': '#c08a4a', 'salmon': '#d8576b', 'hawk': '#4f6fa3', 'fox': '#e2762b'}[a])
    d.ellipse((4, 4, S - 4, S - 4), fill=mix(col, (255, 255, 255), .78) + (255,))
    spr = acorn_sprite(S) if a == 'acorn' else ANI[a]()
    sc = min(S * .80 / spr.width, S * .80 / spr.height); spr = spr.resize((int(spr.width * sc), int(spr.height * sc)), Image.LANCZOS)
    m = Image.new('L', (S, S), 0); ImageDraw.Draw(m).ellipse((4, 4, S - 4, S - 4), fill=255)
    layer = Image.new('RGBA', (S, S)); layer.alpha_composite(spr, ((S - spr.width) // 2, (S - spr.height) // 2 + int(S * .02)))
    im.alpha_composite(Image.composite(layer, Image.new('RGBA', (S, S)), m))
    if ring: ImageDraw.Draw(im).ellipse((4, 4, S - 4, S - 4), outline=col + (255,), width=int(S * .06))
    return im.resize((size, size), Image.LANCZOS)

def acorn_sprite(S):
    im = Image.new('RGBA', (S, S)); d = ImageDraw.Draw(im); c = S / 2
    d.ellipse((c - S * .26, c - S * .18, c + S * .26, c + S * .38), fill=hx('#c98b4a') + (255,))
    d.ellipse((c - S * .16, c - S * .08, c - S * .04, c + S * .2), fill=hx('#dda36a') + (255,))
    d.chord((c - S * .32, c - S * .36, c + S * .32, c + S * .08), 180, 360, fill=hx('#8a5a35') + (255,))
    d.rectangle((c - S * .32, c - S * .15, c + S * .32, c - S * .1), fill=hx('#8a5a35') + (255,))
    for i in range(-3, 4):
        for j in range(2):
            x, y = c + i * S * .08 + j * S * .04, c - S * .24 + j * S * .07
            d.ellipse((x - S * .022, y - S * .022, x + S * .022, y + S * .022), fill=hx('#6b4426') + (255,))
    d.rounded_rectangle((c - S * .03, c - S * .46, c + S * .03, c - S * .32), S * .02, fill=hx('#6b4426') + (255,))
    return im.crop(im.getbbox())

def scene(W, H, seed, r=110, animals=True, sky=None):
    rnd = random.Random(seed)
    im = Image.new('RGBA', (W, H), hx('#1f3326') + (255,))
    dx, dy = r * math.sqrt(3), r * 1.5
    terrs = list(TER)
    # rows top to bottom so lower hexes overlap upper ones (tile thickness)
    rows = int(H / dy) + 3; cols = int(W / dx) + 3
    layout = {}
    for j in range(-1, rows):
        for i in range(-1, cols):
            # clustered terrain: smooth noise by position
            v = math.sin(i * .7 + seed) + math.cos(j * .9 - seed * .3) + rnd.uniform(-.8, .8)
            t = terrs[int((v + 2.8) / 5.6 * 5) % 5]
            if j <= 0 and rnd.random() < .7: t = 'peak'
            layout[(i, j)] = t
    for j in range(-1, rows):
        for i in range(-1, cols):
            t = layout[(i, j)]; cx = i * dx + (j % 2) * dx / 2; cy = j * dy
            tile = hex_tile(t, r); im.alpha_composite(tile, (int(cx - tile.width / 2), int(cy - (2 * r + 4) / 2)))
    if animals:
        spots = [(i, j) for (i, j) in layout if 0 < i < cols - 2 and 0 < j < rows - 2]
        rnd.shuffle(spots)
        hab = {'bear': 'forest', 'elk': 'meadow', 'salmon': 'river', 'hawk': 'peak', 'fox': 'marsh'}
        n = 0
        for (i, j) in spots:
            a = [k for k, v in hab.items() if v == layout[(i, j)]]
            if not a or n > 12: continue
            if rnd.random() < .55: continue
            cx = i * dx + (j % 2) * dx / 2; cy = j * dy
            tk = token(a[0], int(r * .9), ring=True)
            im.alpha_composite(shadow_for(tk, 110, 6), (int(cx - tk.width / 2 + 6), int(cy - tk.height / 2 + 8)))
            im.alpha_composite(tk, (int(cx - tk.width / 2), int(cy - tk.height / 2)))
            n += 1
    return im

def vignette(im, strength=.55):
    W, H = im.size; m = Image.new('L', (W // 8, H // 8), 0); d = ImageDraw.Draw(m)
    d.ellipse((-W // 16, -H // 16, W // 8 + W // 16, H // 8 + H // 16), fill=255)
    m = m.filter(ImageFilter.GaussianBlur(W // 60)).resize((W, H), Image.LANCZOS)
    dark = Image.new('RGBA', (W, H), (8, 14, 10, 255))
    return Image.composite(im, Image.blend(im, dark, strength), m)

# ---------- toon portraits ----------
TOON_CELL = (96, 128)
def toon(kind, swaps, scale=7):
    """Render pose 0 (idle) of a Toon Characters 1 vector sheet with fill colours swapped."""
    import subprocess
    svg = open(os.path.join(PACKS, 'svg', f'toon_{kind}.svg')).read()
    for a, b in swaps: svg = svg.replace(f'fill="{a}"', f'fill="{b}"').replace(f'stop-color="{a}"', f'stop-color="{b}"')
    tmp = os.path.join(PACKS, 'r', f'_toon_{kind}_{abs(hash(str(swaps)))}.svg'); open(tmp, 'w').write(svg)
    png = tmp[:-4] + f'@{scale}.png'
    if not os.path.exists(png):
        subprocess.run(['node', os.path.join(PACKS, 'tools', 'rsvg.js'), tmp, png, str(scale)], check=True, stdout=subprocess.DEVNULL)
    im = Image.open(png).convert('RGBA').crop((0, 0, TOON_CELL[0] * scale, TOON_CELL[1] * scale))
    return im.crop(im.getbbox())

def portrait(kind, swaps, bg, prop=None, glow=None, animal_sprite=None):
    S = 768; im = Image.new('RGBA', (S, S), hx(bg) + (255,)); d = ImageDraw.Draw(im)
    # soft hex backdrop from the same tile language
    for k, (cx, cy) in enumerate([(130, 640), (640, 600), (700, 120), (80, 150)]):
        d.polygon(hex_poly(cx, cy, 170), fill=mix(hx(bg), (255, 255, 255), .12) + (255,))
    d.ellipse((S * .12, S * .1, S * .88, S * .86), fill=mix(hx(bg), (255, 255, 255), .22) + (255,))
    if prop:
        p = fit(obj(prop), h=560); im.alpha_composite(p, (S - p.width + 40, S - p.height - 10))
    if glow:
        g = Image.new('RGBA', (S, S)); ImageDraw.Draw(g).ellipse((150, 120, 620, 640), fill=hx(glow) + (190,))
        im.alpha_composite(g.filter(ImageFilter.GaussianBlur(60)))
    if animal_sprite is not None:
        a = animal_sprite; sc = 600 / max(a.size); a = a.resize((int(a.width * sc), int(a.height * sc)), Image.LANCZOS)
        im.alpha_composite(shadow_for(a, 70, 14), ((S - a.width) // 2 + 10, (S - a.height) // 2 + 30))
        im.alpha_composite(a, ((S - a.width) // 2, (S - a.height) // 2 + 20))
        return im.convert('RGB')
    f = toon(kind, swaps)
    # head-and-shoulders: top 62% of the figure, scaled to fill
    f = f.crop((0, 0, f.width, int(f.height * .64)))
    sc = 700 / f.width if f.width / f.height > 1 else 640 / f.height * 1.0
    sc = min(760 / f.width, 700 / f.height); f = f.resize((int(f.width * sc), int(f.height * sc)), Image.LANCZOS)
    im.alpha_composite(f, ((S - f.width) // 2, S - f.height))
    return im.convert('RGB')

SKIN = ['#FFD7B1', '#E7B687', '#F0C49A']
SKIN_P = ['#BF7958', '#A8603F', '#955435']
def skin(tone, person=False):
    t = {'light': ['#FFD7B1', '#E7B687', '#F0C49A'], 'tan': ['#E8B48A', '#C9946A', '#D9A57C'], 'brown': ['#B97A55', '#9A6040', '#A86C4A'],
         'bark': ['#8D5B3C', '#734630', '#7E5036'], 'ice': ['#DDEFFA', '#B9DAEE', '#CBE5F5'], 'ash': ['#C9C4BE', '#A9A39C', '#B9B3AC']}[tone]
    return list(zip(SKIN_P if person else SKIN, t))
def hair(c, person=False): return [('#3C3E41', c), ('#454A51', mix_hex(c, '#ffffff', .1))] if person else [('#BF7958', c), ('#DB855C', mix_hex(c, '#ffffff', .18))]
def shirt(c): return [('#3DBF7B', c), ('#25A863', mix_hex(c, '#000000', .18)), ('#79ADCB', c), ('#71A2BE', mix_hex(c, '#000000', .08)),
                      ('#5A93B4', mix_hex(c, '#000000', .18)), ('#69A1C2', mix_hex(c, '#000000', .1)), ('#EEA160', mix_hex(c, '#000000', .3)),
                      ('#676AC6', mix_hex(c, '#000000', .35)), ('#4C4EAA', mix_hex(c, '#000000', .45))]
def mix_hex(a, b, t): return '#%02X%02X%02X' % mix(hx(a), hx(b), t)

PORTRAITS = {
    'ranger':   ('ma', skin('light') + hair('#9C5B36') + shirt('#3F8A4F'), '#a9c99a', 'pine'),
    'rowan':    ('mp', skin('light', True) + hair('#E8E4DC', True) + shirt('#7B6A55'), '#b7c7a0', 'tree_round'),
    'pip':      ('fa', skin('light') + hair('#D9773A') + shirt('#7CB85A'), '#b9d69a', None),
    'bram':     ('mp', skin('tan', True) + hair('#4A3022', True) + shirt('#8A4B2E'), '#a8b88f', 'logpile'),
    'sorrel':   ('ma', skin('brown') + hair('#3A2A20') + shirt('#C9A43E'), '#d7cf9a', None),
    'quill':    ('fp', skin('light', True) + hair('#2E2A28', True) + shirt('#3B4656'), '#b3c2b8', None),
    'linnet':   ('fa', skin('tan') + hair('#5A3A26') + shirt('#4F86C6'), '#a9c6d8', None),
    'oake':     ('mp', skin('bark', True) + hair('#9AA58C', True) + shirt('#5C6B3A'), '#9fb48c', 'tree_round'),
    'warden':   ('ma', skin('ash') + hair('#55585C') + shirt('#5E6266'), '#8e9a96', 'rock_big'),
    'frost':    ('fp', skin('ice', True) + hair('#F4FBFF', True) + shirt('#9CCBEB'), '#b9d4e6', None),
}

# ---------- scoring cards ----------
def nine_slice(path, w, h, m=32, k=2, tint='#5a3d24'):
    src = Image.open(path).convert('RGBA'); src = src.resize((src.width * k, src.height * k), Image.NEAREST); M = m * k
    t = Image.new('RGBA', src.size, hx(tint) + (255,)); t.putalpha(src.split()[3]); src = t
    out = Image.new('RGBA', (w, h)); W0, H0 = src.size
    parts = [(0, 0, M, M, 0, 0, M, M), (W0 - M, 0, W0, M, w - M, 0, w, M), (0, H0 - M, M, H0, 0, h - M, M, h), (W0 - M, H0 - M, W0, H0, w - M, h - M, w, h),
             (M, 0, W0 - M, M, M, 0, w - M, M), (M, H0 - M, W0 - M, H0, M, h - M, w - M, h), (0, M, M, H0 - M, 0, M, M, h - M), (W0 - M, M, W0, H0 - M, w - M, M, w, h - M)]
    for sx0, sy0, sx1, sy1, dx0, dy0, dx1, dy1 in parts:
        out.alpha_composite(src.crop((sx0, sy0, sx1, sy1)).resize((dx1 - dx0, dy1 - dy0), Image.NEAREST), (dx0, dy0))
    return out

ANI_COL = {'bear': '#7a4e2d', 'elk': '#c08a4a', 'salmon': '#d8576b', 'hawk': '#4f6fa3', 'fox': '#e2762b'}
HAB = {'bear': 'forest', 'elk': 'meadow', 'salmon': 'river', 'hawk': 'peak', 'fox': 'marsh'}
SET_TER = {'a': None, 'b': 'meadow', 'c': 'river', 'd': 'peak'}
SET_N = {'a': 2, 'b': 1, 'c': 3, 'd': 2}
FRAME = os.path.join(PACKS, 'kenney_fantasy-ui-borders', 'PNG', 'Double', 'Border', 'panel-border-011.png')

def card(a, s):
    W, H = 600, 840; im = Image.new('RGBA', (W, H), hx('#f3ead2') + (255,)); d = ImageDraw.Draw(im)
    col = hx(ANI_COL[a])
    # illustration window: two half hex tiles of the animal's habitat (+ set terrain) and the animal(s)
    win = (40, 40, W - 40, 560)
    ww, wh = win[2] - win[0], win[3] - win[1]
    t1 = HAB[a]; t2 = SET_TER[s] or t1
    ill = Image.new('RGBA', (ww, wh), hx(TER[t1]) + (255,))
    T = tex(t1, 300)
    for x in range(0, ww, 300):
        for y in range(0, wh, 300): ill.alpha_composite(T, (x, y))
    if t2 != t1:
        T2 = tex(t2, 300); lower = Image.new('RGBA', (ww, wh))
        for x in range(0, ww, 300):
            for y in range(0, wh, 300): lower.alpha_composite(T2, (x, y))
        m = Image.new('L', (ww, wh), 0); ImageDraw.Draw(m).polygon([(0, wh * .62), (ww * .5, wh * .74), (ww, wh * .6), (ww, wh), (0, wh)], fill=255)
        ill = Image.composite(lower, ill, m)
    # soft light pool behind animals
    g = Image.new('RGBA', (ww, wh)); ImageDraw.Draw(g).ellipse((ww * .05, wh * .12, ww * .95, wh * .92), fill=(255, 250, 230, 120))
    ill.alpha_composite(g.filter(ImageFilter.GaussianBlur(40)))
    n = SET_N[s]; spr = ANI[a]()
    size = {1: 360, 2: 250, 3: 200}[n]
    pos = {1: [(.5, .52)], 2: [(.31, .55), (.69, .45)] if s == 'a' else [(.3, .4), (.7, .62)], 3: [(.22, .62), (.5, .38), (.78, .62)]}[n]
    for (px, py) in pos:
        sp = spr.resize((int(spr.width * size / max(spr.size)), int(spr.height * size / max(spr.size))), Image.LANCZOS)
        x, y = int(px * ww - sp.width / 2), int(py * wh - sp.height / 2)
        ill.alpha_composite(shadow_for(sp, 90, 10), (x + 8, y + 14)); ill.alpha_composite(sp, (x, y))
    im.alpha_composite(ill, win[:2])
    d.rectangle(win, outline=hx('#5a3d24') + (255,), width=6)
    # type colour band under the picture
    d.rectangle((40, 560, W - 40, 620), fill=col + (255,))
    d.rectangle((40, 560, W - 40, 566), fill=mix(col, (0, 0, 0), .3) + (255,))
    # small habitat hex badge on the band (no text)
    badge = hex_tile(HAB[a], 44); im.alpha_composite(badge, (W - 40 - badge.width - 14, 560 + 30 - badge.height // 2 - 4))
    frame = nine_slice(FRAME, W, H, m=32, k=2, tint='#5a3d24'); im.alpha_composite(frame)
    return im.convert('RGB')

def main():
    os.makedirs(OUT, exist_ok=True)
    for t in TER: SAVE(terrain(t), 'ter-' + t, 90)
    for a in list(ANI) + ['acorn']: SAVE(token(a, 512), 'tok-' + a, 90)
    for a in ANI:
        for s in 'abcd': SAVE(card(a, s), f'card-{a}-{s}')
    for n, (k, sw, bg, prop) in PORTRAITS.items():
        SAVE(portrait(k, sw, bg, prop, glow='#eaf6ff' if n == 'frost' else ('#ffb45a' if n == 'warden' else None)), 'portrait-' + n)
    goat = recolour(animal('goat'), [('#a16639', '#f4f4f0'), ('#8d5a33', '#dfe3e6'), ('#99663e', '#e9ecee'), ('#574335', '#9aa3ab'), ('#463121', '#7d868e')], tol=40)
    SAVE(portrait(None, None, '#c9dbe8', 'rock_big', animal_sprite=goat), 'portrait-snowline')
    big = scene(1920 * 2 // 2, 1080, seed=3, r=105)
    SAVE(vignette(big, .35).convert('RGB'), 'title-bg', 86)
    win = scene(1600, 900, seed=11, r=100)
    SAVE(vignette(ImageEnhance.Color(win).enhance(1.1), .3).convert('RGB'), 'result-win', 86)
    lose = scene(1600, 900, seed=11, r=100, animals=False)
    lose = ImageEnhance.Color(lose).enhance(.35); lose = Image.blend(lose, Image.new('RGBA', lose.size, (40, 60, 90, 255)), .35)
    SAVE(vignette(lose, .5).convert('RGB'), 'result-lose', 86)
    # table: dark moss with faint hex grid
    W, H = 1920, 1080; tb = Image.new('RGBA', (W, H), hx('#22382a') + (255,)); d = ImageDraw.Draw(tb); r = 70
    for j in range(-1, int(H / (r * 1.5)) + 2):
        for i in range(-1, int(W / (r * 1.732)) + 2):
            d.polygon(hex_poly(i * r * 1.732 + (j % 2) * r * .866, j * r * 1.5, r - 3), fill=hx('#26402f') + (255,), outline=hx('#2c4836') + (255,))
    SAVE(vignette(tb, .5).convert('RGB'), 'table-bg', 84)
    # logo: one hex tile with the elk
    lg = Image.new('RGBA', (512, 512)); ht = hex_tile('forest', 240); lg.alpha_composite(ht, ((512 - ht.width) // 2, 8))
    e = elk(); e = e.resize((int(e.width * 360 / e.width), int(e.height * 360 / e.width)), Image.LANCZOS)
    lg.alpha_composite(shadow_for(e, 100, 8), ((512 - e.width) // 2 + 6, 250 - e.height // 2 + 10)); lg.alpha_composite(e, ((512 - e.width) // 2, 250 - e.height // 2))
    SAVE(lg.resize((256, 256), Image.LANCZOS), 'icon-logo', 92)
    print('pass compose', OUT)

if __name__ == '__main__':
    main()
