#!/usr/bin/env python3
"""Compose every redline-rally slot (assets.json) from Kenney CC0 packs. See ART-DIRECTION.md and CREDITS.md.
Needs $PACKS (default ./packs) with racing-pack/, kenney_ui-pack/, boardgamePack_v2/ unzipped and rendered sheets:
  r/objects4.png  (Racing Pack Vector/vector_objects.svg @4x, tools/render-vectors.js)
  r/toonsheet_<name>.png (Toon Characters 1 vector pose sheets @4x, filters stripped, tools/render-toons.js)
Usage: PACKS=/path python3 compose.py [outdir]"""
import os, sys, re, json, math, random, glob
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageChops, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
PACKS = os.environ.get('PACKS', os.path.join(HERE, 'packs'))
OUT = sys.argv[1] if len(sys.argv) > 1 else HERE
R = os.path.join(PACKS, 'r')
SAVE = lambda im, stem, q=90: im.save(os.path.join(OUT, stem + '.webp'), quality=q, method=6)
NAVY, CREAM, ORANGE, TEAL = (27, 42, 65), (244, 233, 205), (232, 119, 34), (42, 157, 143)

def hx(c): c = c.lstrip('#'); return tuple(int(c[i:i + 2], 16) for i in (0, 2, 4))
def mixc(a, b, t): return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))

# ------------------------------------------------------------------ sprites from the Racing Pack vector sheet
_obj = Image.open(os.path.join(R, 'objects4.png')).convert('RGBA')
def O(x0, y0, x1, y1):
    im = _obj.crop((x0 * 4, y0 * 4, x1 * 4, y1 * 4)); return im.crop(im.getbbox())
CARCOL = {'orange': 57, 'blue': 107, 'green': 157, 'yellow': 207, 'black': 257}
def car_up(col): c = CARCOL[col]; return O(c - 25, 5, c + 25, 80)           # nose up
OBJ = {
    'cone': (526, 72, 552, 97), 'cone_top': (494, 72, 520, 97), 'oil': (493, 112, 552, 163),
    'rock1': (570, 24, 616, 63), 'rock2': (621, 24, 658, 63), 'rock3': (668, 24, 713, 63),
    'tyre_o': (570, 73, 600, 103), 'tyre_w': (610, 73, 640, 103), 'ball_b': (650, 73, 680, 103), 'barrel_b': (688, 73, 725, 103),
    'donut_o': (570, 113, 600, 143), 'donut_w': (610, 113, 640, 143), 'ball_o': (650, 113, 680, 143), 'barrel_o': (688, 113, 725, 143),
    'tree_s': (493, 181, 565, 253), 'tree_l': (571, 164, 680, 272),
    'bar_w': (742, 24, 849, 57), 'bar_o': (862, 24, 969, 57), 'chev': (843, 114, 927, 166), 'gantry': (752, 253, 834, 286),
    'tent_o': (862, 259, 927, 325), 'tent_b': (862, 399, 927, 465),
    'tribune': (702, 476, 927, 590), 'tribune_e': (702, 606, 927, 720), 'bar_big_o': (462, 476, 687, 551), 'bar_stripe': (462, 606, 687, 681),
}
_oc = {}
def obj(n, h=None, w=None, rot=0):
    if n not in _oc: _oc[n] = O(*OBJ[n])
    im = _oc[n]
    if h or w:
        s = (h / im.height) if h else (w / im.width); im = im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)
    if rot: im = im.rotate(rot, expand=True, resample=Image.BICUBIC)
    return im

def hue_shift(im, dh, sat=1.0, val=1.0):
    a = im.split()[3]; hsv = im.convert('RGB').convert('HSV'); h, s, v = hsv.split()
    h = h.point(lambda x: (x + dh) % 256); s = s.point(lambda x: min(255, int(x * sat))); v = v.point(lambda x: min(255, int(x * val)))
    out = Image.merge('HSV', (h, s, v)).convert('RGB').convert('RGBA'); out.putalpha(a); return out

CARS = {'crimson': ('orange', -22, 1.15, .93), 'azure': ('blue', 0, 1, 1), 'jade': ('green', 0, 1, 1), 'amber': ('yellow', 0, 1, 1),
        'violet': ('blue', 75, 1, .95), 'graphite': ('black', 0, 1, 1)}
def car_sprite(name, h=None):
    col, dh, s, v = CARS[name]; c = car_up(col)
    if dh or s != 1 or v != 1: c = hue_shift(c, dh, s, v)
    c = c.rotate(-90, expand=True)                          # nose up -> nose right
    return c

def paste(dst, im, cx, cy, shadow=0.0, sh_off=(6, 8), blur=6):
    x, y = int(cx - im.width / 2), int(cy - im.height / 2)
    if shadow:
        a = im.split()[3].filter(ImageFilter.GaussianBlur(blur)).point(lambda v: int(v * shadow))
        sh = Image.new('RGBA', im.size, (10, 20, 30, 0)); sh.putalpha(a); dst.alpha_composite(sh, (x + sh_off[0], y + sh_off[1]))
    dst.alpha_composite(im, (x, y)) if x >= 0 and y >= 0 else dst.paste(im, (x, y), im)

# ------------------------------------------------------------------ Racing Pack ground tiles
def tile_pick(folder, pat, uniform=True):
    best, bs = None, 1e9
    for f in sorted(glob.glob(os.path.join(PACKS, 'racing-pack/PNG/Tiles', folder, pat))):
        a = np.asarray(Image.open(f).convert('RGB')).astype(float)
        if a[:3].mean() == 0: continue
        sd = a.reshape(-1, 3).std(0).sum()
        if sd < bs: best, bs = f, sd
    return Image.open(best).convert('RGB')
def tiled(tile, w, h, scale=1.0):
    t = tile if scale == 1 else tile.resize((int(tile.width * scale), int(tile.height * scale)), Image.LANCZOS)
    im = Image.new('RGB', (w, h))
    for y in range(0, h, t.height):
        for x in range(0, w, t.width): im.paste(t, (x, y))
    return im
GRASS = tile_pick('Grass', '*.png'); SAND = tile_pick('Sand', '*.png'); DIRT = tile_pick('Dirt', '*.png')
def noise_grade(im, amp=10, seed=1, size=(14, 9)):
    rng = np.random.RandomState(seed); n = rng.rand(size[1], size[0])
    n = np.asarray(Image.fromarray((n * 255).astype('uint8')).resize(im.size, Image.BICUBIC)).astype(float) / 255 - .5
    a = np.asarray(im.convert('RGB')).astype(float) + n[..., None] * amp * 2
    return Image.fromarray(np.clip(a, 0, 255).astype('uint8'))

# ------------------------------------------------------------------ track boards
def read_guide(tid):
    s = open(os.path.join(HERE, '..', 'guides', 'track-%s.svg' % tid)).read()
    d = re.search(r'<path d="(M[^"]+)"', s).group(1)
    pts = [tuple(map(float, m)) for m in re.findall(r'([\d.]+) ([\d.]+)', d)]
    corners = [(float(a), float(b)) for a, b in re.findall(r'<circle cx="([\d.]+)" cy="([\d.]+)"', s)]
    return pts, corners
def mask_poly(pts, width, S=2, W=2000, H=1200):
    m = Image.new('L', (W * S, H * S), 0); d = ImageDraw.Draw(m); r = width * S / 2
    P = [(x * S, y * S) for x, y in pts]
    d.line(P + [P[0]] if False else P, fill=255, width=int(width * S), joint='curve')
    for x, y in P[::3]: d.ellipse([x - r, y - r, x + r, y + r], fill=255)
    return m.resize((W, H), Image.LANCZOS)
def arc(pts):
    out = [0.0]
    for a, b in zip(pts, pts[1:]): out.append(out[-1] + math.dist(a, b))
    return out
def tangent(pts, i):
    a, b = pts[max(0, i - 2)], pts[min(len(pts) - 1, i + 2)]; l = math.dist(a, b) or 1; return ((b[0] - a[0]) / l, (b[1] - a[1]) / l)
def seg_layer(pts, corners, closed=True):
    pass

def board(tid, theme):
    W, H = 2000, 1200
    pts, corners = read_guide(tid)
    ground = noise_grade(tiled(GRASS if theme == 'sun' else GRASS, W, H), 5, 3 if theme == 'sun' else 7)
    if theme == 'hill':   # hillside: darker, rocky
        ground = ImageOps.colorize(ImageOps.grayscale(ground), (20, 78, 52), (62, 160, 96))
    im = ground.convert('RGBA')
    run_w = 214 if theme == 'sun' else 176
    runoff = mask_poly(pts, run_w); road = mask_poly(pts, 124)
    rt = tiled(SAND if theme == 'sun' else DIRT, W, H, 1.0)
    rt = noise_grade(rt, 4, 5)
    # run-off border: darker rim + texture
    rim = ImageChops.subtract(runoff.filter(ImageFilter.MaxFilter(9)), runoff)
    im.paste(Image.new('RGBA', (W, H), (36, 92, 60, 255) if theme == 'sun' else (24, 66, 46, 255)), (0, 0), rim.filter(ImageFilter.GaussianBlur(.8)))
    im.paste(rt.convert('RGBA'), (0, 0), runoff)
    # road drop shadow + body
    sh = road.filter(ImageFilter.GaussianBlur(7)).point(lambda v: int(v * .35)); im.paste(Image.new('RGBA', (W, H), (10, 20, 30, 255)), (6, 8), sh)
    asphalt = (141, 178, 184) if theme == 'sun' else (128, 158, 168)
    body = noise_grade(Image.new('RGB', (W, H), asphalt), 3, 11, (60, 36))
    im.paste(body.convert('RGBA'), (0, 0), road)
    # edge lines (white) hugging the road border
    edge2 = ImageChops.subtract(road.filter(ImageFilter.MinFilter(11)), road.filter(ImageFilter.MinFilter(21)))
    im.paste(Image.new('RGBA', (W, H), (246, 244, 236, 255)), (0, 0), edge2)
    # kerbs at corners: alternating orange/white on both edges
    ov = Image.new('RGBA', (W * 2, H * 2), (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
    L = arc(pts)
    for cx_, cy_ in corners:
        near = [i for i, p in enumerate(pts) if math.dist(p, (cx_, cy_)) < 150]
        if not near: continue
        i0 = min(near, key=lambda i: math.dist(pts[i], (cx_, cy_)))
        lo = min(range(len(pts)), key=lambda i: abs(L[i] - (L[i0] - 120))); hi = min(range(len(pts)), key=lambda i: abs(L[i] - (L[i0] + 120)))
        for side in (1, -1):
            prev = None
            for i in range(lo, hi):
                tx, ty = tangent(pts, i); nx, ny = -ty * side, tx * side
                a = (pts[i][0] + nx * 56, pts[i][1] + ny * 56); b = (pts[i + 1][0] + nx * 56, pts[i + 1][1] + ny * 56)
                k = int((L[i] - L[lo]) // 22) % 2
                d.line([(a[0] * 2, a[1] * 2), (b[0] * 2, b[1] * 2)], fill=(232, 96, 28, 255) if k else (250, 248, 240, 255), width=26)
    im.alpha_composite(ov.resize((W, H), Image.LANCZOS))
    # dashed centre line
    ov = Image.new('RGBA', (W * 2, H * 2), (0, 0, 0, 0)); d = ImageDraw.Draw(ov); acc = 0; on = True; start = None
    for i in range(len(pts) - 1):
        seg = L[i + 1] - L[i]
        acc += seg
        if on and acc > 24:
            d.line([(pts[max(0, i - 1)][0] * 2, pts[max(0, i - 1)][1] * 2), (pts[i + 1][0] * 2, pts[i + 1][1] * 2)], fill=(250, 248, 240, 235), width=7); acc = 0; on = False
        elif not on and acc > 30: acc = 0; on = True
    im.alpha_composite(ov.resize((W, H), Image.LANCZOS))
    # chequered start line across the road at pts[0]
    tx, ty = tangent(pts, 2); ang = math.degrees(math.atan2(ty, tx))
    strip = Image.new('RGBA', (28, 124), (0, 0, 0, 0)); sd = ImageDraw.Draw(strip)
    for r_ in range(124 // 14 + 1):
        for c_ in range(2):
            sd.rectangle([c_ * 14, r_ * 14, c_ * 14 + 13, r_ * 14 + 13], fill=(250, 248, 240, 255) if (r_ + c_) % 2 else (30, 40, 56, 255))
    strip = strip.crop((0, 0, 28, 124)).rotate(-ang, expand=True, resample=Image.BICUBIC)
    # rotate so the strip's long axis is perpendicular to the track direction
    strip = Image.new('RGBA', (28, 124)); strip = None
    st = Image.new('RGBA', (124, 28), (0, 0, 0, 0)); sd = ImageDraw.Draw(st)
    for c_ in range(124 // 14 + 1):
        for r_ in range(2):
            sd.rectangle([c_ * 14, r_ * 14, c_ * 14 + 13, r_ * 14 + 13], fill=(250, 248, 240, 255) if (r_ + c_) % 2 else (30, 40, 56, 255))
    st = st.crop((0, 0, 124, 28)).rotate(-ang + 90, expand=True, resample=Image.BICUBIC)
    sx, sy = pts[0]; im.alpha_composite(st, (int(sx - st.width / 2), int(sy - st.height / 2)))
    # scenery (kept clear of the road, the run-off and the corner-sign ring)
    keep = mask_poly(pts, 124 + 2 * (118 if theme == 'sun' else 110))
    for cx_, cy_ in corners:
        ImageDraw.Draw(keep).ellipse([cx_ - 8, cy_ - 8, cx_ + 8, cy_ + 8], fill=0)
    keepa = np.asarray(keep) > 8
    rng = random.Random(77 if theme == 'sun' else 91)
    placed = []
    def free(x, y, r):
        if x < r or y < r or x > W - r or y > H - r: return False
        yy, xx = int(y), int(x)
        for dx, dy in ((0, 0), (r, 0), (-r, 0), (0, r), (0, -r), (.7 * r, .7 * r), (-.7 * r, -.7 * r)):
            if keepa[min(H - 1, max(0, int(yy + dy))), min(W - 1, max(0, int(xx + dx)))]: return False
        return all(math.dist((x, y), (px, py)) > r + pr for px, py, pr in placed)
    def put(name, x, y, h=None, w=None, rot=0, shadow=.35):
        s = obj(name, h=h, w=w, rot=rot); r = max(s.width, s.height) / 2 * .9
        if not free(x, y, r): return False
        paste(im, s, x, y, shadow=shadow); placed.append((x, y, r)); return True
    if theme == 'sun':
        for (x, y) in [(1000, 860), (700, 870)]: pass
        for nm, x_, y_, kw in (('tribune', 1050, 800, dict(w=270)), ('tribune_e', 740, 800, dict(w=230)), ('tent_o', 1330, 810, dict(h=80)), ('tent_b', 1420, 810, dict(h=80))):
            sp = obj(nm, **kw); paste(im, sp, x_, y_, shadow=.35); placed.append((x_, y_, max(sp.size) / 2))
        for i in range(10): put('bar_stripe', 330 + i * 60, 1150, h=20) if False else None
        for _ in range(240):
            n = rng.choice(['tree_l', 'tree_s', 'tree_s', 'tree_l']); put(n, rng.uniform(40, W - 40), rng.uniform(40, H - 40), h=rng.choice([84, 96, 110]) if n == 'tree_l' else rng.choice([70, 82]))
            if len(placed) > 46: break
    else:
        for _ in range(520):
            n = rng.choice(['rock1', 'rock2', 'rock3', 'rock1']); put(n, rng.uniform(30, W - 30), rng.uniform(30, H - 30), h=rng.choice([40, 52, 62]), rot=rng.uniform(0, 360))
            if len(placed) > 20: break
        for _ in range(900):
            put('tree_s', rng.uniform(30, W - 30), rng.uniform(30, H - 30), h=rng.choice([66, 78, 90]))
            if len(placed) > 52: break
        put('tribune', 900, 842, w=260)
    # tyre walls on the outside of the tightest corners (on the run-off edge)
    for i, (cx_, cy_) in enumerate(corners):
        if theme == 'hill' or i % 2 == 0:
            near = [j for j, p in enumerate(pts) if math.dist(p, (cx_, cy_)) < 150]
            if not near: continue
            j0 = min(near, key=lambda j: math.dist(pts[j], (cx_, cy_)))
            # outside = away from the track curvature centre: take the side pointing away from the next+prev chord
            pa, pb = pts[max(0, j0 - 25)], pts[min(len(pts) - 1, j0 + 25)]; mid = ((pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2)
            ox, oy = pts[j0][0] - mid[0], pts[j0][1] - mid[1]; l = math.hypot(ox, oy) or 1; ox, oy = ox / l, oy / l
            for k in range(-3, 4):
                tx, ty = tangent(pts, j0); dist = 112
                x = pts[j0][0] + ox * dist + tx * k * 26; y = pts[j0][1] + oy * dist + ty * k * 26
                s = obj('tyre_o' if (k % 2 == 0) else 'tyre_w', h=34)
                if 20 < x < W - 20 and 20 < y < H - 20: paste(im, s, x, y, shadow=.4, blur=3, sh_off=(3, 4))
    for cx_, cy_ in []: pass
    # start-line cones
    tx, ty = tangent(pts, 2); nx, ny = -ty, tx
    for sgn in (1, -1):
        for k in (-1, 1):
            paste(im, obj('cone_top', h=24), pts[0][0] + nx * sgn * 80 + tx * k * 40, pts[0][1] + ny * sgn * 80 + ty * k * 40, shadow=.4, blur=2, sh_off=(2, 3))
    # warm sunset grade + soft vignette
    rgb = im.convert('RGB'); a = np.asarray(rgb).astype(float)
    yy, xx = np.mgrid[0:H, 0:W]; vig = 1 - .16 * (((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2) / 2
    warm = np.array([1.04, 1.0, .93]); a = a * warm * vig[..., None]
    return Image.fromarray(np.clip(a, 0, 255).astype('uint8'))

# ------------------------------------------------------------------ cars
def make_cars():
    for n in CARS:
        c = car_sprite(n); s = min(240 / c.width, 116 / c.height); c = c.resize((round(c.width * s), round(c.height * s)), Image.LANCZOS)
        im = Image.new('RGBA', (256, 128), (0, 0, 0, 0)); paste(im, c, 128, 64, shadow=.3, sh_off=(3, 5), blur=4); SAVE(im, 'car-' + n, 92)

# ------------------------------------------------------------------ backgrounds
def rounded(sz, r, fill, outline=None, ow=0):
    S = 3; m = Image.new('L', (sz[0] * S, sz[1] * S), 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, sz[0] * S - 1, sz[1] * S - 1], r * S, fill=255)
    return m.resize(sz, Image.LANCZOS)
def sunset_grade(im, strength=.22, top=(255, 160, 80)):
    W, H = im.size; a = np.asarray(im.convert('RGB')).astype(float)
    g = np.linspace(1, 0, H)[:, None, None] ** 1.5; t = np.array(top, float)[None, None, :]
    a = a * (1 - strength * g) + (a * t / 255) * (strength * g) + 8 * g
    return Image.fromarray(np.clip(a, 0, 255).astype('uint8'))
def vroad(W, H, x0, x1, tile_asph):
    """vertical road strip with edge lines, dashes, kerbs, in the Kenney palette"""
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rectangle([x0 + 8, 0, x1 + 8, H], fill=(10, 20, 30, 70))
    d.rectangle([x0, 0, x1, H], fill=(141, 178, 184, 255))
    d.rectangle([x0 + 16, 0, x0 + 24, H], fill=(246, 244, 236, 255)); d.rectangle([x1 - 24, 0, x1 - 16, H], fill=(246, 244, 236, 255))
    for y in range(0, H, 72): d.rectangle([(x0 + x1) // 2 - 5, y, (x0 + x1) // 2 + 5, y + 40], fill=(246, 244, 236, 255))
    for y in range(0, H, 60):
        c = (232, 96, 28, 255) if (y // 60) % 2 else (250, 248, 240, 255)
        d.rectangle([x0 - 22, y, x0, y + 60], fill=c); d.rectangle([x1, y, x1 + 22, y + 60], fill=c)
    return im
def make_title():
    W, H = 1080, 1920
    im = noise_grade(tiled(GRASS, W, H, 1.0), 5, 2).convert('RGBA')
    x0, x1 = 250, 830
    im.alpha_composite(vroad(W, H, x0, x1, None))
    rng = random.Random(5)
    # sand run-off bands and trees beside the road
    for side, xr in ((0, (20, 170)), (1, (920, 1060))):
        for _ in range(40):
            n = rng.choice(['tree_l', 'tree_s']); s = obj(n, h=rng.choice([130, 160, 190]) if n == 'tree_l' else rng.choice([100, 120]))
            x = rng.uniform(*xr); y = rng.uniform(40, H - 40)
            im_ok = all(abs(y - py) > 280 or abs(x - px) > 150 for px, py in getattr(make_title, 'pl', [])) if hasattr(make_title, 'pl') else True
            if im_ok:
                paste(im, s, x, y, shadow=.35, blur=8, sh_off=(8, 10)); make_title.pl = getattr(make_title, 'pl', []) + [(x, y)]
    # pit tribune on the left verge, tyre wall right
    paste(im, obj('tribune', w=210), 125, 1450, shadow=.4, blur=8)
    paste(im, obj('tribune_e', w=210), 125, 560, shadow=.4, blur=8)
    for y in range(980, 1500, 44): paste(im, obj('tyre_o' if (y // 44) % 2 else 'tyre_w', h=44), 880, y, shadow=.4, blur=3, sh_off=(3, 4))
    # start grid + pack of cars thundering toward us (nose down), staggered
    st = Image.new('RGBA', (x1 - x0 - 60, 40)); sd = ImageDraw.Draw(st)
    for c_ in range((x1 - x0 - 60) // 20 + 1):
        for r_ in range(2): sd.rectangle([c_ * 20, r_ * 20, c_ * 20 + 19, r_ * 20 + 19], fill=(250, 248, 240, 255) if (r_ + c_) % 2 else (30, 40, 56, 255))
    im.alpha_composite(st.crop((0, 0, x1 - x0 - 60, 40)), (x0 + 30, 1190))
    
    order = ['crimson', 'azure', 'amber', 'jade', 'violet', 'graphite']
    slots = [(550, 1630), (380, 1790), (720, 1790), (440, 190), (700, 260), (540, 1330)]
    for n, (cx_, cy_) in zip(order, slots):
        c = car_up({'crimson': 'orange', 'azure': 'blue', 'amber': 'yellow', 'jade': 'green', 'violet': 'blue', 'graphite': 'black'}[n])
        if CARS[n][1] or CARS[n][2] != 1: c = hue_shift(c, CARS[n][1], CARS[n][2], CARS[n][3])
        c = c.rotate(180, expand=True); s = 290 / c.height; c = c.resize((round(c.width * s * 1.0), 290), Image.LANCZOS)
        paste(im, c, cx_, cy_, shadow=.45, blur=10, sh_off=(14, 16))
    # leader car large foreground
    for xx, yy_ in ((300, 1560),): pass
    im = sunset_grade(im.convert('RGB'), .30)
    # calm upper strip for the title text: soft navy fade
    a = np.asarray(im).astype(float); g = np.clip(1 - np.arange(H) / 300, 0, 1)[:, None, None] ** 1.4
    a = a * (1 - .35 * g) + np.array(NAVY, float)[None, None] * .35 * g
    g2 = np.clip((np.arange(H) - 1560) / 360, 0, 1)[:, None, None]; a = a * (1 - .5 * g2) + np.array(NAVY, float)[None, None] * .5 * g2
    return Image.fromarray(np.clip(a, 0, 255).astype('uint8'))

def make_podium():
    W, H = 1080, 1920
    im = Image.new('RGB', (W, H)); a = np.zeros((H, W, 3))
    t = np.linspace(0, 1, H)[:, None]; top = np.array(NAVY, float); bot = np.array((236, 124, 50), float)
    mid = np.array((132, 70, 96), float); u = t.copy(); a[:] = np.where(u < .5, top * (1 - u * 2) + mid * (u * 2), mid * (1 - (u - .5) * 2) + bot * ((u - .5) * 2))[:, None, :]
    im = Image.fromarray(a.astype('uint8')).convert('RGBA')
    # sun rays
    ray = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(ray)
    for k in range(18):
        a0 = math.radians(k * 20 - 90 - 5); a1 = math.radians(k * 20 - 90 + 5)
        d.polygon([(W / 2, 960), (W / 2 + 2400 * math.cos(a0), 960 + 2400 * math.sin(a0)), (W / 2 + 2400 * math.cos(a1), 960 + 2400 * math.sin(a1))], fill=(255, 214, 140, 14))
    im.alpha_composite(ray)
    # chequered bands + barriers
    d = ImageDraw.Draw(im)
    for y0, hh in ((70, 54), (H - 170, 54)):
        for c_ in range(W // 54 + 1):
            for r_ in range(1):
                d.rectangle([c_ * 54, y0, c_ * 54 + 53, y0 + hh - 1], fill=(250, 248, 240, 255) if c_ % 2 else (30, 40, 56, 255))
    # the result banner shows only the middle band (~y 700-1220): keep it calm, framed by ribbons, chevrons and cones
    for k, x_ in enumerate((120, 960)):
        for j in range(3): paste(im, obj('chev', w=96), x_, 880 + j * 62, shadow=.0)
    for x_ in (60, 1020):
        paste(im, obj('cone', h=64), x_, 740, shadow=.3); paste(im, obj('cone', h=64), x_, 1190, shadow=.3)
    d = ImageDraw.Draw(im)
    for y0 in (700, 1200):
        for c_ in range(W // 30 + 1):
            for r_ in range(2): d.rectangle([c_ * 30, y0 + r_ * 15, c_ * 30 + 29, y0 + r_ * 15 + 14], fill=(250, 248, 240, 255) if (c_ + r_) % 2 else (30, 40, 56, 255))
    for (n, cx_, y_) in (('crimson', 330, 1470), ('azure', 540, 1570), ('amber', 750, 1470)):
        c = car_sprite(n).rotate(90, expand=True); s_ = 240 / c.height; c = c.resize((round(c.width * s_), round(c.height * s_)), Image.LANCZOS); paste(im, c, cx_, y_, shadow=.4, blur=6)
    return sunset_grade(im.convert('RGB'), .0)

# ------------------------------------------------------------------ cards
CARD = (500, 700)
def card_base(top, bot, rim=(244, 233, 205), pattern=True):
    W, H = CARD; a = np.zeros((H, W, 3)); t = np.linspace(0, 1, H)[:, None]
    a[:] = (np.array(top, float) * (1 - t) + np.array(bot, float) * t)[:, None, :]
    im = Image.fromarray(a.astype('uint8')).convert('RGBA'); d = ImageDraw.Draw(im)
    if pattern:   # chequer bands, top and bottom (race flag motif)
        for y0 in (0, H - 36):
            for c_ in range(W // 36 + 1):
                for r_ in range(1):
                    d.rectangle([c_ * 36, y0, c_ * 36 + 35, y0 + 35], fill=(250, 248, 240, 70) if c_ % 2 else (20, 30, 48, 70))
    # frame
    d.rounded_rectangle([5, 5, W - 6, H - 6], 30, outline=NAVY, width=10)
    d.rounded_rectangle([16, 16, W - 17, H - 17], 22, outline=rim, width=7)
    d.rounded_rectangle([26, 26, W - 27, H - 27], 16, outline=tuple(int(c * .55) for c in top), width=3)
    m = rounded(CARD, 30, 255); out = Image.new('RGBA', CARD, (0, 0, 0, 0)); out.paste(im, (0, 0), m)
    return out.convert('RGB') if True else out
def disc(im, cx, cy, r, col=(20, 32, 52), alpha=.42):
    ov = Image.new('RGBA', im.size, (0, 0, 0, 0)); d = ImageDraw.Draw(ov); d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=col + (int(255 * alpha),), outline=(250, 248, 240, 120), width=5)
    return Image.alpha_composite(im.convert('RGBA'), ov)
def card(stem, top, bot, items, disc_col=(20, 32, 52)):
    im = card_base(top, bot).convert('RGBA'); cy = 520
    im = disc(im, 250, cy, 136, disc_col, .38)
    for n, kw, (x, y) in items:
        s = obj(n, **kw) if isinstance(n, str) else n
        s = s.resize((round(s.width * .78), round(s.height * .78)), Image.LANCZOS); paste(im, s, x, y + 50, shadow=.4, blur=6, sh_off=(5, 8))
    SAVE(im.convert('RGB'), stem, 90)
def chev_up(w): return obj('chev', w=w)
def make_cards():
    # card back: crimson/navy chequer with a car silhouette-free emblem (two chevrons)
    im = card_base((38, 58, 92), (22, 34, 56), rim=(232, 119, 34), pattern=False).convert('RGBA'); d = ImageDraw.Draw(im)
    for r_ in range(2, 17):
        for c_ in range(1, 12):
            if (r_ + c_) % 2: d.rectangle([c_ * 40 + 10, r_ * 40 + 4, c_ * 40 + 49, r_ * 40 + 43], fill=(255, 255, 255, 12))
    im = disc(im, 250, 350, 150, (232, 119, 34), .9)
    paste(im, chev_up(190), 250, 320, shadow=.35); paste(im, chev_up(190), 250, 390, shadow=.35)
    SAVE(im.convert('RGB'), 'card-back', 90)
    base = {1: ((92, 176, 214), (30, 94, 130), 1), 2: ((88, 190, 130), (28, 112, 80), 2), 3: ((244, 190, 80), (200, 118, 28), 3), 4: ((240, 112, 84), (160, 36, 30), 4)}
    for n, (tp, bt, k) in base.items():
        y0 = 470 - (k - 1) * 28 + 0
        items = [(obj('chev', w=170), {}, (250, 470 + 56 - 56 * i + (k - 1) * 28)) for i in range(k)]
        items = [(obj('chev', w=170 if k < 3 else 150), {}, (250, 470 - 31 * (k - 1) * (1 if k > 2 else 1.3) + 62 * (1 if k > 2 else 1.3) * i)) for i in range(k)]
        card('card-speed-%d' % n, tp, bt, [(a, {}, p) for a, _, p in items])
    card('card-heat', (214, 86, 40), (110, 24, 20), [(obj('tyre_o', h=230), {}, (250, 470))], (60, 14, 10))
    card('card-stress', (116, 90, 168), (46, 34, 84), [(obj('oil', h=230), {}, (250, 470))], (20, 14, 40))
    up = {'coolant': ((70, 170, 200), (24, 84, 118), [('barrel_b', dict(h=190))]),
          'pit': ((236, 140, 60), (150, 70, 22), [('tent_o', dict(h=250))]),
          'grip': ((110, 112, 128), (50, 54, 70), [('tyre_w', dict(h=230))]),
          'brakes': ((226, 82, 70), (120, 28, 34), [('bar_stripe', dict(w=270))]),
          'rocket': ((244, 196, 70), (200, 100, 30), [(car_sprite('crimson').rotate(90, expand=True), dict(), (250, 480))]),
          'tuned': ((84, 190, 150), (28, 106, 90), [('gantry', dict(w=290))])}
    for k, (tp, bt, its) in up.items():
        items = []
        for it in its:
            if isinstance(it[0], str):
                items.append((obj(it[0], **it[1]), {}, (250, 470)))
            else:
                c = it[0]; s = 290 / c.height; c = c.resize((round(c.width * s), 290), Image.LANCZOS); items.append((c, {}, (250, 490)))
        if k == 'rocket': items.append((obj('chev', w=110), {}, (250, 330)))
        card('card-upgrade-' + k, tp, bt, items)

# ------------------------------------------------------------------ UI + icons + fx
def trim_fit(im, w, h, pad=0):
    im = im.crop(im.getbbox()); s = min((w - 2 * pad) / im.width, (h - 2 * pad) / im.height); return im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)
def canvas(w, h, items):
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    for s, x, y in items: paste(im, s, x, y, shadow=.35, blur=4, sh_off=(3, 5))
    return im
def ui_panel(w, h, col, r=26):
    """Kenney-style flat panel (cream rim, navy outline, soft top highlight, chequer notch ends)"""
    S = 3; im = Image.new('RGBA', (w * S, h * S), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, w * S - 1, h * S - 1], r * S, fill=NAVY + (255,))
    d.rounded_rectangle([5 * S, 5 * S, w * S - 6 * S, h * S - 6 * S], (r - 4) * S, fill=tuple(int(c * .55) for c in col) + (255,))
    d.rounded_rectangle([9 * S, 9 * S, w * S - 10 * S, h * S - 10 * S], (r - 8) * S, fill=col + (255,))
    d.rounded_rectangle([9 * S, 9 * S, w * S - 10 * S, int(h * S * .5)], (r - 8) * S, fill=tuple(min(255, int(c * 1.14) + 8) for c in col) + (255,))
    d.rounded_rectangle([5 * S, 5 * S, w * S - 6 * S, h * S - 6 * S], (r - 4) * S, outline=(244, 233, 205, 255), width=3 * S)
    return im.resize((w, h), Image.LANCZOS)
def make_ui():
    SAVE(ui_panel(512, 160, (46, 74, 112)), 'ui-gear-dial', 92)
    SAVE(ui_panel(512, 192, (62, 40, 40), 30), 'ui-engine-tray', 92)
    # corner sign: Kenney round button base + chequer ring, number is drawn by the game (white face)
    sz = 256; S = 3; im = Image.new('RGBA', (sz * S, sz * S), (0, 0, 0, 0)); d = ImageDraw.Draw(im); c = sz * S // 2
    for rr_, col in ((124, (20, 30, 48)), (116, (232, 96, 28)), (92, (250, 248, 240)), (84, (250, 248, 240))): d.ellipse([c - rr_ * S, c - rr_ * S, c + rr_ * S, c + rr_ * S], fill=col + (255,))
    for k in range(16):
        a0 = k * 22.5; d.pieslice([c - 116 * S, c - 116 * S, c + 116 * S, c + 116 * S], a0, a0 + 11.25, fill=(250, 248, 240, 255))
    d.ellipse([c - 94 * S, c - 94 * S, c + 94 * S, c + 94 * S], fill=(250, 248, 240, 255)); d.ellipse([c - 94 * S, c - 94 * S, c + 94 * S, c + 94 * S], outline=(20, 30, 48, 255), width=6 * S)
    SAVE(im.resize((sz, sz), Image.LANCZOS), 'ui-corner-sign', 92)
    # trophy: stacked Kenney round parts (orange tyre cup, chevron crown) -> use a gold chevron over the orange barrel on tent plinth
    S = 3; t = Image.new('RGBA', (512 * S, 512 * S), (0, 0, 0, 0)); d = ImageDraw.Draw(t)
    G1, G2, G3, OL = (255, 205, 60, 255), (255, 232, 130, 255), (214, 140, 24, 255), NAVY + (255,)
    def poly(P, fill): d.polygon([(x * S, y * S) for x, y in P], fill=fill, outline=OL, width=7 * S)
    for sx in (1, -1):   # handles
        d.arc([(256 + sx * 150 - 54) * S, 110 * S, (256 + sx * 150 + 54) * S, 250 * S], 0, 360, fill=OL, width=34 * S)
        d.arc([(256 + sx * 150 - 54) * S, 110 * S, (256 + sx * 150 + 54) * S, 250 * S], 0, 360, fill=G1, width=18 * S)
    poly([(110, 70), (402, 70), (380, 230), (330, 300), (182, 300), (132, 230)], G1)       # bowl
    poly([(110, 70), (402, 70), (398, 108), (114, 108)], G3)                                # rim
    d.polygon([(150 * S, 130 * S), (190 * S, 130 * S), (200 * S, 250 * S), (176 * S, 270 * S)], fill=G2)   # highlight
    poly([(226, 300), (286, 300), (296, 380), (216, 380)], G3)                              # stem
    poly([(150, 380), (362, 380), (382, 430), (130, 430)], G1)                              # base
    poly([(110, 430), (402, 430), (402, 470), (110, 470)], (232, 119, 34, 255))
    t = t.resize((512, 512), Image.LANCZOS);
    SAVE(t, 'ui-trophy', 92)
    # chequered flag (cloth) : pole + checker
    S = 3; fl = Image.new('RGBA', (512 * S, 384 * S), (0, 0, 0, 0)); d = ImageDraw.Draw(fl)
    d.rounded_rectangle([40 * S, 20 * S, 62 * S, 380 * S], 8 * S, fill=(244, 233, 205, 255), outline=NAVY + (255,), width=4 * S)
    for r_ in range(6):
        for c_ in range(8):
            x = 70 + c_ * 52; y = 40 + r_ * 52 + 10 * math.sin(c_ * .7)
            d.polygon([(x * S, y * S), ((x + 52) * S, (y + 7 * math.cos(c_ * .7 + .7) * 0.0) * S), ((x + 52) * S, (y + 52) * S), (x * S, (y + 52) * S)], fill=(250, 248, 240, 255) if (r_ + c_) % 2 else (30, 40, 56, 255))
    d.rectangle([70 * S, 40 * S, 486 * S, 352 * S], outline=NAVY + (255,), width=4 * S)
    SAVE(fl.resize((512, 384), Image.LANCZOS), 'ui-flag-checkered', 92)
    # icons
    def icon(stem, items): SAVE(canvas(128, 128, items), stem, 92)
    icon('icon-heat', [(obj('tyre_o', h=100), 64, 64)])
    icon('icon-stress', [(obj('oil', h=96), 64, 64)])
    icon('icon-gear', [(trim_fit(obj('donut_w', h=100), 100, 100), 64, 64), (obj('chev', w=52), 64, 64)])
    icon('icon-lap', [(obj('cone_top', h=96), 64, 64)])
    icon('icon-place', [(obj('chev', w=100), 64, 66)])
    # fx pops: layered comic starbursts in the pack palette (navy outline, two tones, pack chevrons)
    def star(w, h, pts_n, r_out, r_in, col, jitter=.0, seed=1):
        S = 3; r = random.Random(seed); P = []
        for i in range(pts_n * 2):
            rad = (r_out if i % 2 == 0 else r_in) * (1 + r.uniform(-jitter, jitter)); an = math.pi * i / pts_n
            P.append(((w / 2 + math.cos(an) * rad * 1.28) * S, (h / 2 + math.sin(an) * rad) * S))
        return P
    def burst(stem, outer, inner, n, extra=None, seed=1):
        S = 3; im = Image.new('RGBA', (512 * S, 384 * S), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
        P = star(512, 384, n, 175, 108, None, .12, seed)
        d.polygon(P, fill=NAVY + (255,)); 
        c = (256 * S, 192 * S); P2 = [(c[0] + (x - c[0]) * .93, c[1] + (y - c[1]) * .93) for x, y in P]; d.polygon(P2, fill=outer + (255,))
        P3 = [(c[0] + (x - c[0]) * .66, c[1] + (y - c[1]) * .66) for x, y in P]; d.polygon(P3, fill=inner + (255,))
        im = im.resize((512, 384), Image.LANCZOS)
        if extra: im = extra(im)
        SAVE(im, stem, 92)
    burst('fx-heat-flame', (240, 100, 34), (255, 214, 90), 11, lambda im: (paste(im, obj('tyre_o', h=110), 256, 192, shadow=.3, blur=3, sh_off=(2, 4)), im)[1], 2)
    burst('fx-spinout-smoke', (160, 172, 190), (236, 238, 244), 9, lambda im: (paste(im, obj('oil', h=120), 256, 192, shadow=.3, blur=3, sh_off=(2, 4)), im)[1], 4)
    burst('fx-boost-flare', (255, 190, 40), (255, 244, 170), 13, lambda im: (paste(im, obj('chev', w=170), 256, 196, shadow=.3, blur=3, sh_off=(2, 4)), im)[1], 6)
    im = Image.new('RGBA', (512, 384), (0, 0, 0, 0))
    for i, (x, y) in enumerate(((150, 120), (230, 190), (150, 262), (330, 120), (410, 190), (330, 262))):
        c = obj('chev', w=110 if i < 3 else 80).rotate(-90, expand=True); paste(im, c, x, y, shadow=.3, blur=3, sh_off=(2, 4))
    SAVE(im, 'fx-slipstream-streaks', 92)

# ------------------------------------------------------------------ portraits (Toon Characters 1, idle pose, recoloured)
PORT = {'kit': ('femaleAdventurer', (232, 119, 34)), 'juno': ('femalePerson', (42, 157, 143)), 'dax': ('maleAdventurer', (90, 120, 200)),
        'pia': ('robot', (196, 70, 90)), 'oto': ('maleperson'.replace('p', 'P', 1) if False else 'malePerson', (120, 100, 180)), 'bex': ('zombie', (230, 190, 60))}
def toon(name):
    sh = Image.open(os.path.join(R, 'toonsheet_%s.png' % name)).convert('RGBA')
    cw, ch = sh.width // 9, sh.height // 5
    c = sh.crop((0, 0, cw, ch)); return c.crop(c.getbbox())
def make_portraits():
    for stem, (name, col) in PORT.items():
        W = 512; a = np.zeros((W, W, 3)); yy, xx = np.mgrid[0:W, 0:W]; r = np.hypot(xx - 256, yy - 220) / 360
        a[:] = np.array(col, float)[None, None] * (1.05 - .55 * np.clip(r, 0, 1))[..., None]
        im = Image.fromarray(np.clip(a, 0, 255).astype('uint8')).convert('RGBA'); d = ImageDraw.Draw(im)
        for k in range(-3, 9):   # racing stripe + chevrons
            d.polygon([(k * 90 - 40, 512), (k * 90 + 10, 512), (k * 90 + 210, 300), (k * 90 + 160, 300)], fill=(255, 255, 255, 26))
        for c_ in range(W // 32 + 1): d.rectangle([c_ * 32, 0, c_ * 32 + 31, 31], fill=(250, 248, 240, 70) if c_ % 2 else (20, 30, 48, 70))
        ch = toon(name); s = 600 / ch.height; ch = ch.resize((round(ch.width * s), 600), Image.LANCZOS)
        paste(im, ch, 256, 78 + 300, shadow=.35, blur=10, sh_off=(8, 10))
        d = ImageDraw.Draw(im); d.rectangle([0, 0, W - 1, W - 1], outline=NAVY, width=10); d.rectangle([10, 10, W - 11, W - 11], outline=(244, 233, 205), width=5)
        SAVE(im.convert('RGB'), 'portrait-' + stem, 90)

if __name__ == '__main__':
    only = set(sys.argv[2:])
    run = lambda k, f: (not only or k in only) and f()
    run('cars', make_cars); run('cards', make_cards); run('ui', make_ui); run('portraits', make_portraits)
    run('title', lambda: SAVE(make_title(), 'bg-title', 88)); run('podium', lambda: SAVE(make_podium(), 'bg-podium', 88))
    run('tracks', lambda: [SAVE(board('sunline', 'sun'), 'track-sunline', 88), SAVE(board('hairpin', 'hill'), 'track-hairpin', 88)])
    print('composed', len(glob.glob(os.path.join(OUT, '*.webp'))))
