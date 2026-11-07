#!/usr/bin/env python3
"""Compose stitchwise free-kit pictures (see ART-DIRECTION.md, CREDITS.md).
Usage: ART_CACHE=/path/to/cache python3 compose.py [--only REGEX]
Cache: tex/<name>.jpg = Poly Haven CC0 diffuse maps (1k): rough_linen, denim_fabric, brown_leather, kitchen_wood,
knitted_fleece, wood_table_001. Prints are drawn seamlessly at 1024 px and woven into the real cloth (multiply on the
cloth's own thread detail), so every patch reads as printed cotton. Slots not in PLAN keep their previous file."""
import os, sys, re, json, math, random
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance, ImageOps, ImageChops
H = os.path.dirname(os.path.abspath(__file__))
C = os.environ.get('ART_CACHE', '/tmp/art-cache')
SLOTS = {s['stem']: s for s in json.load(open(H + '/slots.json'))}
N = 1024

def tex(n): return Image.open(f'{C}/tex/{n}.jpg').convert('RGB')
def detail(n='rough_linen', size=256, k=0.45):
    """High-pass thread detail of a real cloth, centred on 1.0 (as L image around 128)."""
    g = ImageOps.grayscale(tex(n).resize((size * 2, size * 2), Image.LANCZOS))
    blur = g.filter(ImageFilter.GaussianBlur(size // 16))
    hp = ImageChops.subtract(g, blur, 1, 128)
    hp = hp.point(lambda v: int(128 + (v - 128) * k * 2.2))
    return hp.resize((size, size), Image.LANCZOS)
def weave(print_rgb, n='rough_linen', k=0.45):
    """Apply cloth thread detail to a flat print (overlay-like: v * (1 + (d-128)/128))."""
    s = print_rgb.size[0]; d = detail(n, s, k)
    lut = [int(v) for v in range(256)]
    out = []
    for ch in print_rgb.split():
        out.append(Image.eval(ImageChops.multiply(ch, d.point(lambda v: min(255, int(v * 1.0)))), lambda v: min(255, int(v * 2))))
    return Image.merge('RGB', out)
def hexc(h): h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))

def canvas(bg): return Image.new('RGB', (N, N), hexc(bg))
def wrap(fn, x, y):
    for ox in (-N, 0, N):
        for oy in (-N, 0, N):
            if -200 < x + ox < N + 200 and -200 < y + oy < N + 200: fn(x + ox, y + oy)
def grid(step, stagger=False):
    for j in range(N // step):
        for i in range(N // step):
            yield i * step + step / 2 + (step / 2 if stagger and j % 2 else 0), j * step + step / 2, i, j

# ---- motif helpers (all drawn on a 1024 seamless canvas) ----
def dots(bg, fg, step, r, stagger=True):
    im = canvas(bg); d = ImageDraw.Draw(im)
    for x, y, i, j in grid(step, stagger): wrap(lambda X, Y: d.ellipse((X - r, Y - r, X + r, Y + r), fill=hexc(fg)), x, y)
    return im
def stripes(bg, fg, period, width, vertical=True):
    im = canvas(bg); d = ImageDraw.Draw(im)
    for p in range(0, N, period):
        d.rectangle((p, 0, p + width - 1, N) if vertical else (0, p, N, p + width - 1), fill=hexc(fg))
    return im
def checks(a, b, step, gingham=False):
    im = canvas(a); d = ImageDraw.Draw(im)
    if gingham:   # gingham: semi bands both ways, crossing squares darker
        A, B = hexc(a), hexc(b); mid = tuple((x + y) // 2 for x, y in zip(A, B))
        for p in range(0, N, step * 2):
            d.rectangle((p, 0, p + step - 1, N), fill=mid); d.rectangle((0, p, N, p + step - 1), fill=mid)
        for p in range(0, N, step * 2):
            for q in range(0, N, step * 2): d.rectangle((p, q, p + step - 1, q + step - 1), fill=B)
    else:
        for j in range(0, N // step):
            for i in range(0, N // step):
                if (i + j) % 2: d.rectangle((i * step, j * step, i * step + step - 1, j * step + step - 1), fill=hexc(b))
    return im
def tartan(bg):
    im = canvas(bg); d = Image.new('RGBA', (N, N)); dd = ImageDraw.Draw(d)
    for p in range(0, N, 256):
        for w, col, off in ((70, (20, 50, 30, 150), 0), (16, (200, 40, 40, 170), 100), (8, (240, 220, 120, 190), 170), (30, (10, 30, 70, 120), 210)):
            dd.rectangle((p + off, 0, p + off + w, N), fill=col); dd.rectangle((0, p + off, N, p + off + w), fill=col)
    im.paste(d, (0, 0), d); return im
def motifs(bg, step, draw, stagger=True, jitter=0, rot=False, seed=0):
    im = canvas(bg); d = ImageDraw.Draw(im); rnd = random.Random(seed)
    for x, y, i, j in grid(step, stagger):
        jx, jy = rnd.uniform(-jitter, jitter), rnd.uniform(-jitter, jitter); a = rnd.uniform(0, 360) if rot else 0
        wrap(lambda X, Y: draw(d, X + jx, Y + jy, a, i, j), x, y)
    return im
def rpoly(cx, cy, pts, a):
    ca, sa = math.cos(math.radians(a)), math.sin(math.radians(a))
    return [(cx + x * ca - y * sa, cy + x * sa + y * ca) for x, y in pts]
def flower(d, x, y, r, petal, centre, n=5, a=0):
    for k in range(n):
        t = math.radians(a + k * 360 / n); px, py = x + r * .55 * math.cos(t), y + r * .55 * math.sin(t)
        d.ellipse((px - r * .45, py - r * .45, px + r * .45, py + r * .45), fill=hexc(petal))
    d.ellipse((x - r * .3, y - r * .3, x + r * .3, y + r * .3), fill=hexc(centre))
def star(d, x, y, r, col, n=5, a=-90, inner=.45):
    pts = [(x + (r if k % 2 == 0 else r * inner) * math.cos(math.radians(a + k * 180 / n)), y + (r if k % 2 == 0 else r * inner) * math.sin(math.radians(a + k * 180 / n))) for k in range(2 * n)]
    d.polygon(pts, fill=hexc(col))
def heart(d, x, y, r, col):
    d.ellipse((x - r, y - r * .7, x, y + r * .3), fill=hexc(col)); d.ellipse((x, y - r * .7, x + r, y + r * .3), fill=hexc(col))
    d.polygon([(x - r * .97, y - r * .1), (x + r * .97, y - r * .1), (x, y + r * 1.05)], fill=hexc(col))
def leaf(d, x, y, r, col, a, vein=None):
    pts = [(r * math.cos(math.radians(t)) , r * .42 * math.sin(math.radians(t)) * (1 if t < 180 else 1)) for t in range(0, 360, 12)]
    d.polygon(rpoly(x, y, pts, a), fill=hexc(col))
    if vein: d.line(rpoly(x, y, [(-r, 0), (r, 0)], a), fill=hexc(vein), width=max(2, int(r / 10)))

def F(n):
    """33 patch fabrics, one per stem."""
    P = {
     1: lambda: checks('#f7efe4', '#c8343c', 64, True),
     2: lambda: dots('#1f2f5c', '#f3efe6', 64, 11),
     3: lambda: stripes('#d9a527', '#f5e9c8', 64, 10),
     4: lambda: motifs('#8fb98a', 128, lambda d, x, y, a, i, j: flower(d, x, y, 34, '#fbfaf4', '#f0c040', 8, a), True, 10, True, 4),
     5: lambda: lattice('#c98d93', '#efd9d6', 128),
     6: lambda: waves('#2b8c8c', '#e8f4f0'),
     7: lambda: motifs('#c4623e', 64, lambda d, x, y, a, i, j: xs(d, x, y, 12, '#f3e6cc'), False),
     8: lambda: motifs('#8fc3e6', 256, lambda d, x, y, a, i, j: cloud(d, x, y, 60, '#ffffff'), True, 30, False, 8),
     9: lambda: motifs('#5d2c63', 128, lambda d, x, y, a, i, j: star(d, x, y, 26, '#e8b844', 5, a), True, 18, True, 9),
     10: lambda: motifs('#efe6d2', 128, lambda d, x, y, a, i, j: leaf(d, x, y, 42, '#3a63a8', a, '#efe6d2'), True, 12, True, 10),
     11: lambda: tartan('#2f6b3f'),
     12: lambda: motifs('#ee8a7c', 128, lambda d, x, y, a, i, j: heart(d, x, y, 24, '#fff6f0'), True),
     13: lambda: motifs('#2c3570', 128, lambda d, x, y, a, i, j: paisley(d, x, y, 44, '#f1ece0', a), True, 10, True, 13),
     14: lambda: motifs('#f2c232', 64, lambda d, x, y, a, i, j: leaf(d, x, y, 11, '#6a4020', a), True, 10, True, 14),
     15: lambda: stripes('#a8dcc0', '#fbfdf9', 128, 40),
     16: lambda: vine('#7a1f33', '#f1e2c8'),
     17: lambda: motifs('#d6d8dc', 128, lambda d, x, y, a, i, j: d.polygon(rpoly(x, y, [(0, -26), (24, 16), (-24, 16)], 180 * ((i + j) % 2)), fill=hexc('#22305a')), True),
     18: lambda: zigzag('#e8782c', '#fdf4e8'),
     19: lambda: motifs('#b4a2d6', 128, lambda d, x, y, a, i, j: tulip(d, x, y, 26, '#fbf8ff', '#6e9a62'), True, 6, False, 19),
     20: lambda: dots('#6d7232', '#e2b23c', 64, 9),
     21: lambda: denim(),
     22: lambda: chevron('#e19aa9', '#7c7f86'),
     23: lambda: motifs('#6a4a32', 128, lambda d, x, y, a, i, j: feather(d, x, y, 50, '#efe2c8', a), True, 14, True, 23),
     24: lambda: motifs('#2fb3b0', 128, lambda d, x, y, a, i, j: flower(d, x, y, 36, '#f5d038', '#e08a2a', 6, a), True, 14, True, 24),
     25: lambda: stripes('#3b3d42', '#eceae4', 64, 4),
     26: lambda: scallops('#f6c1a0', '#2e8c86'),
     27: lambda: motifs('#c22e34', 128, lambda d, x, y, a, i, j: snow(d, x, y, 36, '#ffffff', a), True, 10, True, 27),
     28: lambda: checks('#f7f6f2', '#3462ad', 128),
     29: lambda: motifs('#f5d548', 128, lambda d, x, y, a, i, j: cherry(d, x, y, 18), True, 10, True, 29),
     30: lambda: motifs('#4f8a45', 128, lambda d, x, y, a, i, j: (leaf(d, x, y, 36, '#efe4c4', a, '#4f8a45') if (i + j) % 2 else acorn(d, x, y, 20, a)), True, 10, True, 30),
     31: lambda: lattice('#b0227a', '#e6b94a', 128, fill=True),
     32: lambda: herringbone('#2a8a88', '#efe6d0'),
     33: lambda: motifs('#1f2b55', 256, lambda d, x, y, a, i, j: sunburst(d, x, y, 90), True),
    }
    return P[n]()

def lattice(bg, fg, step, fill=False):
    im = canvas(bg); d = ImageDraw.Draw(im)
    if fill:
        for x, y, i, j in grid(step, True): wrap(lambda X, Y: d.polygon([(X, Y - 30), (X + 20, Y), (X, Y + 30), (X - 20, Y)], fill=hexc(fg)), x, y)
        return im
    for p in range(-N, 2 * N, step):
        d.line((p, 0, p + N, N), fill=hexc(fg), width=8); d.line((p, 0, p - N, N), fill=hexc(fg), width=8)
    for x, y, i, j in grid(step, True): wrap(lambda X, Y: d.ellipse((X - 8, Y - 8 - step / 2, X + 8, Y + 8 - step / 2), fill=hexc(fg)), x, y)
    return im
def waves(bg, fg):
    im = canvas(bg); d = ImageDraw.Draw(im)
    for row in range(0, N, 128):
        pts = [(x, row + 22 * math.sin(2 * math.pi * x / 256)) for x in range(0, N + 9, 8)]
        d.line(pts, fill=hexc(fg), width=10, joint='curve')
    return im
def xs(d, x, y, r, col):
    d.line((x - r, y - r, x + r, y + r), fill=hexc(col), width=5); d.line((x - r, y + r, x + r, y - r), fill=hexc(col), width=5)
def cloud(d, x, y, r, col):
    for dx, dy, rr in ((-r * .6, r * .1, r * .45), (0, -r * .15, r * .6), (r * .6, r * .1, r * .45)):
        d.ellipse((x + dx - rr, y + dy - rr, x + dx + rr, y + dy + rr), fill=hexc(col))
    d.rounded_rectangle((x - r * 1.05, y, x + r * 1.05, y + r * .5), int(r * .25), fill=hexc(col))
def paisley(d, x, y, r, col, a):
    pts = []
    for t in range(0, 360, 10):
        tt = math.radians(t); rr = r * (.55 + .45 * math.cos(tt / 2) ** 2)
        pts.append((rr * math.cos(tt) * .7, rr * math.sin(tt) * .5 + (r * .3 if t > 180 else 0) * 0))
    d.polygon(rpoly(x, y, pts, a), fill=hexc(col))
    d.ellipse((x - r * .15, y - r * .15, x + r * .15, y + r * .15), fill=hexc('#2c3570'))
def vine(bg, fg):
    im = canvas(bg); d = ImageDraw.Draw(im)
    for col in range(0, N, 256):
        pts = [(col + 128 + 50 * math.sin(2 * math.pi * y / 512), y) for y in range(0, N + 9, 8)]
        d.line(pts, fill=hexc(fg), width=7)
        for k in range(0, N, 128):
            sx = col + 128 + 50 * math.sin(2 * math.pi * k / 512)
            leaf(d, sx + (24 if (k // 128) % 2 else -24), k + 10, 22, fg, 30 if (k // 128) % 2 else 150)
            if (k // 128) % 2 == 0: flower(d, sx + 50, k + 64, 22, fg, '#7a1f33', 5)
    return im
def zigzag(bg, fg):
    im = canvas(bg); d = ImageDraw.Draw(im)
    for row in range(0, N, 128):
        pts = [(x, row + (24 if (x // 64) % 2 else -24)) for x in range(0, N + 65, 64)]
        d.line(pts, fill=hexc(fg), width=14)
    return im
def tulip(d, x, y, r, col, stem):
    d.line((x, y, x, y + r * 1.4), fill=hexc(stem), width=5)
    d.pieslice((x - r * .6, y - r * .9, x + r * .6, y + r * .4), 0, 180, fill=hexc(col))
    d.polygon([(x - r * .6, y - r * .25), (x - r * .3, y - r * .9), (x, y - r * .4), (x + r * .3, y - r * .9), (x + r * .6, y - r * .25)], fill=hexc(col))
def denim():
    t = tex('denim_fabric').resize((N, N), Image.LANCZOS); d = ImageDraw.Draw(t)
    for p in (128, 640):   # orange top-stitching, double rows
        for off in (0, 22):
            for x in range(0, N, 40): d.line((x, p + off, x + 24, p + off), fill=(230, 130, 40), width=6)
    return t
def chevron(bg, fg):
    im = canvas(bg); d = ImageDraw.Draw(im)
    for row in range(0, N, 128):
        pts = [(x, row + (40 if (x // 128) % 2 else 0)) for x in range(0, N + 129, 128)]
        d.line(pts, fill=hexc(fg), width=26, joint='curve')
    return im
def feather(d, x, y, r, col, a):
    leaf(d, x, y, r, col, a)
    for k in range(-3, 4):
        p = rpoly(x, y, [(k * r / 4, 0), (k * r / 4 + r * .18, r * .34)], a); d.line(p, fill=hexc('#6a4a32'), width=3)
        p = rpoly(x, y, [(k * r / 4, 0), (k * r / 4 + r * .18, -r * .34)], a); d.line(p, fill=hexc('#6a4a32'), width=3)
    d.line(rpoly(x, y, [(-r * 1.15, 0), (r, 0)], a), fill=hexc('#6a4a32'), width=4)
def scallops(bg, fg):
    im = canvas(bg); d = ImageDraw.Draw(im)
    for j, row in enumerate(range(0, N + 64, 64)):
        for x in range(-64, N + 64, 128):
            X = x + (64 if j % 2 else 0); d.arc((X - 64, row - 64, X + 64, row + 64), 0, 180, fill=hexc(fg), width=8)
    return im
def snow(d, x, y, r, col, a):
    for k in range(6):
        t = math.radians(a + k * 60); ex, ey = x + r * math.cos(t), y + r * math.sin(t)
        d.line((x, y, ex, ey), fill=hexc(col), width=6)
        for s in (.55,):
            bx, by = x + r * s * math.cos(t), y + r * s * math.sin(t)
            for b in (-40, 40):
                tb = t + math.radians(b); d.line((bx, by, bx + r * .3 * math.cos(tb), by + r * .3 * math.sin(tb)), fill=hexc(col), width=5)
def cherry(d, x, y, r, a=0):
    d.line((x - r, y + r * .3, x, y - r * 1.6), fill=hexc('#3f7a2a'), width=5); d.line((x + r, y + r * .5, x, y - r * 1.6), fill=hexc('#3f7a2a'), width=5)
    leaf(d, x + r * .7, y - r * 1.6, r * .8, '#4f9a34', -20)
    for cx, cy in ((x - r, y + r * .6), (x + r, y + r * .8)):
        d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=hexc('#d0242c')); d.ellipse((cx - r * .5, cy - r * .55, cx - r * .1, cy - r * .2), fill=hexc('#f59a9a'))
def acorn(d, x, y, r, a):
    d.ellipse((x - r * .75, y - r * .3, x + r * .75, y + r * 1.2), fill=hexc('#c8954a'))
    d.pieslice((x - r, y - r * .9, x + r, y + r * .5), 180, 360, fill=hexc('#6b4424')); d.line((x, y - r * .9, x + r * .2, y - r * 1.3), fill=hexc('#6b4424'), width=5)
def herringbone(a, b):
    im = canvas(a); d = ImageDraw.Draw(im)
    for col in range(0, N, 64):
        for y in range(-64, N + 64, 32):
            if (col // 64) % 2: d.line((col, y, col + 64, y + 32), fill=hexc(b), width=10)
            else: d.line((col, y + 32, col + 64, y), fill=hexc(b), width=10)
    return im
def sunburst(d, x, y, r):
    for k in range(16):
        t = math.radians(k * 22.5); col = '#d23a32' if k % 2 else '#e8b844'
        d.polygon([(x, y), (x + r * math.cos(t - .1), y + r * math.sin(t - .1)), (x + r * math.cos(t + .1), y + r * math.sin(t + .1))], fill=hexc(col))
    d.ellipse((x - r * .28, y - r * .28, x + r * .28, y + r * .28), fill=hexc('#e8b844'))

def fabric(n):
    p = F(n).crop((0, 0, 512, 512)).resize((256, 256), Image.LANCZOS)   # 512 crop of the 1024 repeat: still seamless, motifs 2x
    if n == 21: return p
    return weave(p, 'rough_linen', .8)

# ---- notions (flat vector, drawn at 4x and downsampled) ----
def spool(col):
    s = 512; im = Image.new('RGBA', (s, s)); d = ImageDraw.Draw(im)
    d.ellipse((60, 70, 452, 462), fill=(0, 0, 0, 70))
    d.ellipse((50, 50, 462, 462), fill=hexc(col)); d.ellipse((70, 70, 442, 442), outline=tuple(int(c * .7) for c in hexc(col)), width=10)
    for r in range(170, 90, -14): d.ellipse((256 - r, 256 - r, 256 + r, 256 + r), outline=(250, 246, 236), width=10)
    d.ellipse((256 - 88, 256 - 88, 256 + 88, 256 + 88), fill=(244, 238, 226)); d.ellipse((256 - 50, 256 - 50, 256 + 50, 256 + 50), fill=tuple(int(c * .55) for c in hexc(col)))
    return im.resize((128, 128), Image.LANCZOS)
def button(col='#e2b23c', size=128):
    s = 512; im = Image.new('RGBA', (s, s)); d = ImageDraw.Draw(im); c = hexc(col); dk = tuple(int(v * .68) for v in c)
    d.ellipse((50, 66, 466, 482), fill=(0, 0, 0, 70)); d.ellipse((40, 40, 472, 472), fill=dk); d.ellipse((62, 62, 450, 450), fill=c)
    d.ellipse((120, 120, 392, 392), outline=dk, width=14)
    for hx, hy in ((206, 206), (306, 206), (206, 306), (306, 306)): d.ellipse((hx - 26, hy - 26, hx + 26, hy + 26), fill=dk)
    d.line((206, 206, 306, 306), fill=(250, 246, 236), width=14); d.line((306, 206, 206, 306), fill=(250, 246, 236), width=14)
    d.chord((90, 80, 300, 260), 200, 290, fill=tuple(min(255, v + 50) for v in c))
    return im.resize((size, size), Image.LANCZOS)
def hourglass():
    s = 512; im = Image.new('RGBA', (s, s)); d = ImageDraw.Draw(im); wood = (150, 96, 52); dk = (96, 58, 30)
    d.ellipse((110, 440, 402, 490), fill=(0, 0, 0, 60))
    d.polygon([(150, 100), (362, 100), (270, 256), (362, 412), (150, 412), (242, 256)], fill=(220, 236, 240)); d.line([(150, 100), (362, 100), (270, 256), (362, 412), (150, 412), (242, 256), (150, 100)], fill=(150, 170, 180), width=8)
    d.polygon([(190, 330), (322, 330), (362, 412), (150, 412)], fill=(236, 214, 160)); d.polygon([(186, 140), (326, 140), (270, 214), (242, 214)], fill=(236, 214, 160))
    for y in (60, 412): d.rounded_rectangle((110, y, 402, y + 44), 14, fill=wood, outline=dk, width=8)
    for x in (122, 368): d.rounded_rectangle((x, 90, x + 22, 420), 8, fill=wood, outline=dk, width=6)
    return im.resize((128, 128), Image.LANCZOS)
def stitch_border(d, box, col, dash=26, gap=16, w=8, inset=0):
    x0, y0, x1, y1 = [v + (inset if i < 2 else -inset) for i, v in enumerate(box)]
    for x in range(int(x0), int(x1) - dash, dash + gap): d.line((x, y0, x + dash, y0), fill=col, width=w); d.line((x, y1, x + dash, y1), fill=col, width=w)
    for y in range(int(y0), int(y1) - dash, dash + gap): d.line((x0, y, x0, y + dash), fill=col, width=w); d.line((x1, y, x1, y + dash), fill=col, width=w)
def leather(size=256, stitches=True):
    t = tex('brown_leather').resize((size * 2, size * 2), Image.LANCZOS).crop((0, 0, size * 2, size * 2)); t = ImageEnhance.Brightness(t).enhance(1.35)
    d = ImageDraw.Draw(t)
    if stitches: stitch_border(d, (0, 0, size * 2, size * 2), (240, 226, 196), size // 10, size // 16, max(4, size // 40), size // 7)
    return t.resize((size, size), Image.LANCZOS)
def rosette(size=256):
    s = 1024; im = Image.new('RGBA', (s, s)); d = ImageDraw.Draw(im)
    for dx, col in ((-120, (176, 40, 48)), (120, (176, 40, 48))):
        d.polygon([(512 + dx - 70, 560), (512 + dx + 70, 560), (512 + dx * 1.9 + 70, 980), (512 + dx * 1.9, 900), (512 + dx * 1.9 - 70, 980)], fill=col)
    for k in range(24):
        t = math.radians(k * 15); d.ellipse((512 + 330 * math.cos(t) - 90, 470 + 330 * math.sin(t) - 90, 512 + 330 * math.cos(t) + 90, 470 + 330 * math.sin(t) + 90), fill=(214, 160, 48))
    d.ellipse((512 - 360, 470 - 360, 512 + 360, 470 + 360), fill=(238, 196, 72)); d.ellipse((512 - 250, 470 - 250, 512 + 250, 470 + 250), fill=(248, 238, 214))
    d.ellipse((512 - 180, 470 - 180, 512 + 180, 470 + 180), fill=(214, 160, 48))
    stitch_ring = [(512 + 300 * math.cos(math.radians(a)), 470 + 300 * math.sin(math.radians(a))) for a in range(0, 360, 10)]
    for k in range(0, len(stitch_ring) - 1, 2): d.line(stitch_ring[k] + stitch_ring[k + 1], fill=(170, 120, 30), width=12)
    return im.resize((size, size), Image.LANCZOS)
def torn():
    f = fabric(16).convert('RGBA'); m = Image.new('L', (256, 256), 255); d = ImageDraw.Draw(m); rnd = random.Random(5)
    pts = [(128 + (60 + rnd.uniform(-22, 22)) * math.cos(math.radians(a)), 128 + (52 + rnd.uniform(-22, 22)) * math.sin(math.radians(a))) for a in range(0, 360, 12)]
    d.polygon(pts, fill=0); edge = m.filter(ImageFilter.MaxFilter(7)); f.putalpha(m)
    fray = Image.new('RGBA', (256, 256), (240, 228, 205, 0)); fray.putalpha(ImageChops.subtract(m.filter(ImageFilter.MinFilter(5)).point(lambda v: 255 - v), m.point(lambda v: 255 - v)))
    out = Image.new('RGBA', (256, 256)); out.alpha_composite(f); return out
def sparkle():
    s = 1024; im = Image.new('RGBA', (s, s)); d = ImageDraw.Draw(im)
    g = Image.new('RGBA', (s, s)); gd = ImageDraw.Draw(g); gd.ellipse((260, 260, 764, 764), fill=(255, 220, 120, 120)); g = g.filter(ImageFilter.GaussianBlur(80)); im.alpha_composite(g)
    star(d, 512, 512, 420, '#ffd36a', 4, -90, .18); star(d, 512, 512, 260, '#fff6d8', 4, -90, .2)
    d.arc((620, 120, 900, 400), 120, 300, fill=(250, 240, 220), width=14); d.arc((120, 640, 380, 900), 300, 120, fill=(250, 240, 220), width=14)
    return im.resize((256, 256), Image.LANCZOS)
def fxstitch():
    s = 1024; im = Image.new('RGBA', (s, s)); d = ImageDraw.Draw(im)
    pts = [(120 + t * 7, 640 - 260 * math.sin(math.pi * t / 110)) for t in range(0, 111)]
    for k in range(0, 108, 9): d.line(pts[k] + pts[k + 5], fill=(248, 236, 210), width=26)
    d.line((800, 380, 960, 140), fill=(200, 205, 212), width=22); d.ellipse((935, 115, 975, 155), outline=(150, 155, 165), width=8)
    return im.resize((256, 256), Image.LANCZOS)
def offer_card():
    s = 2; W, Hh = 400 * s, 320 * s; im = Image.new('RGBA', (W, Hh)); paper = weave(Image.new('RGB', (W, Hh), (246, 236, 214)).resize((256, 256)), 'rough_linen', .35).resize((W, Hh))
    m = Image.new('L', (W, Hh)); ImageDraw.Draw(m).rounded_rectangle((16, 16, W - 16, Hh - 16), 40, fill=255)
    sh = Image.new('RGBA', (W, Hh), (0, 0, 0, 0)); sh.paste((0, 0, 0, 90), (0, 8), m.crop((0, 0, W, Hh - 8))); im.alpha_composite(sh.filter(ImageFilter.GaussianBlur(8)))
    p = paper.convert('RGBA'); p.putalpha(m); im.alpha_composite(p); d = ImageDraw.Draw(im)
    stitch_border(d, (44, 44, W - 44, Hh - 44), (196, 150, 110), 22, 14, 6)
    return im.resize((400, 320), Image.LANCZOS)

# ---- boards and scenes ----
def wood(W, Hh, n='kitchen_wood', b=1.0):
    t = tex(n); t = t.resize((max(W, Hh), max(W, Hh)), Image.LANCZOS).crop((0, 0, W, Hh)); return ImageEnhance.Brightness(t).enhance(b)
def navy(W, Hh):
    t = ImageOps.grayscale(tex('knitted_fleece')).resize((1024, 1024), Image.LANCZOS)
    t = ImageOps.colorize(ImageEnhance.Contrast(t).enhance(1.4), (14, 22, 48), (52, 72, 120))
    out = Image.new('RGB', (W, Hh))
    for y in range(0, Hh, 1024):
        for x in range(0, W, 1024): out.paste(t, (x, y))
    return out
def vign(im, a=.5):
    W, Hh = im.size; m = Image.new('L', (W, Hh), 0); ImageDraw.Draw(m).ellipse((-W * .3, -Hh * .2, W * 1.3, Hh * 1.2), fill=255)
    m = m.filter(ImageFilter.GaussianBlur(min(W, Hh) // 6)); return Image.composite(im, ImageEnhance.Brightness(im).enhance(1 - a), m)
def bg_table():
    im = navy(1080, 1920); d = ImageDraw.Draw(im); stitch_border(d, (0, 0, 1080, 1920), (120, 140, 190), 30, 18, 6, 40)
    return vign(im, .45)
def quilt_frame():
    S = 900; im = wood(S, S, 'kitchen_wood', .95); d = ImageDraw.Draw(im)
    d.rectangle((54, 54, S - 54, S - 54), fill=(60, 36, 20))
    mat = weave(Image.new('RGB', (256, 256), (240, 230, 206)), 'rough_linen', .5).resize((S - 120, S - 120), Image.LANCZOS); im.paste(mat, (60, 60))
    for k in range(10):
        p = 60 + k * (S - 120) / 9
        for q in range(60, S - 60, 18): d.line((p, q, p, q + 9), fill=(210, 196, 166), width=3); d.line((q, p, q + 9, p), fill=(210, 196, 166), width=3)
    return im
def track_frame():
    W, Hh = 1600, 400; im = wood(W, Hh, 'kitchen_wood', .8); d = ImageDraw.Draw(im)
    felt = weave(Image.new('RGB', (256, 256), (238, 226, 198)), 'rough_linen', .5).resize((W - 60, Hh - 60), Image.LANCZOS)
    m = Image.new('L', felt.size); ImageDraw.Draw(m).rounded_rectangle((0, 0) + felt.size, 40, fill=255); im.paste(felt, (30, 30), m)
    stitch_border(d, (30, 30, W - 30, Hh - 30), (176, 128, 90), 22, 14, 6, 24)
    for k in range(1, 54):
        x = 30 + 24 + k * (W - 108) / 54; d.line((x, 70, x, 90), fill=(200, 176, 140), width=4); d.line((x, Hh - 90, x, Hh - 70), fill=(200, 176, 140), width=4)
    return im
def patch_sprite(n, size, rot):
    f = fabric(n).resize((size, size), Image.LANCZOS).convert('RGBA'); d = ImageDraw.Draw(f)
    stitch_border(d, (0, 0, size, size), (250, 244, 230), max(6, size // 14), max(4, size // 22), max(2, size // 70), size // 12)
    f = f.rotate(rot, expand=True, resample=Image.BICUBIC); return f
def drop(base, sp, x, y, a=110, blur=10):
    sh = Image.new('RGBA', sp.size, (0, 0, 0, 0)); sh.paste((10, 6, 4, a), (0, 0), sp.getchannel('A'))
    base.alpha_composite(sh.filter(ImageFilter.GaussianBlur(blur)), (int(x - sp.width / 2 + 6), int(y - sp.height / 2 + 12)))
    base.alpha_composite(sp, (int(x - sp.width / 2), int(y - sp.height / 2)))
def table_scene(seed, dim=False, rosette_on=False):
    W, Hh = 1080, 1920; im = wood(W, Hh, 'wood_table_001', 1.15).convert('RGBA'); rnd = random.Random(seed)
    spots = [(150, 260), (930, 220), (90, 1650), (980, 1700), (520, 120), (300, 1820), (760, 1830), (60, 900), (1030, 1000), (240, 560), (860, 560), (200, 1340), (900, 1380)]
    for k, (x, y) in enumerate(spots): drop(im, patch_sprite(rnd.randint(1, 33), rnd.randint(220, 300), rnd.uniform(-25, 25)), x, y)
    for (x, y, c) in ((300, 760, '#2b8c8c'), (820, 1250, '#c4623e')): drop(im, spool(c).resize((200, 200), Image.LANCZOS), x, y)
    for (x, y) in ((760, 820), (820, 900), (250, 1180), (330, 1230)): drop(im, button('#e2b23c', 90), x, y, 90, 5)
    if rosette_on: drop(im, rosette(420), 540, 980)
    im = vign(im.convert('RGB'), .55 if not dim else .7)
    if dim: im = ImageEnhance.Color(ImageEnhance.Brightness(im).enhance(.6), ).enhance(.7)
    return im
def bg_map():
    W, Hh = 1080, 1920; im = Image.new('RGB', (W, Hh)); rnd = random.Random(3); s = 180
    greens = [4, 11, 15, 20, 30, 10, 14, 3, 32]
    for j in range(Hh // s + 1):
        for i in range(W // s + 1):
            im.paste(fabric(rnd.choice(greens)).resize((s, s), Image.LANCZOS), (i * s, j * s))
    im = ImageEnhance.Color(im, ).enhance(.75); d = ImageDraw.Draw(im)
    for j in range(Hh // s + 1):
        for i in range(W // s + 1): stitch_border(d, (i * s, j * s, i * s + s, j * s + s), (248, 240, 222), 14, 10, 4, 10)
    path = [(540, 1780), (300, 1500), (700, 1200), (360, 900), (720, 620), (540, 260)]
    for a, b in zip(path, path[1:]):
        L = math.dist(a, b); n = int(L / 30)
        for k in range(0, n, 2):
            p = (a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n); q = (a[0] + (b[0] - a[0]) * (k + 1) / n, a[1] + (b[1] - a[1]) * (k + 1) / n)
            d.line(p + q, fill=(176, 40, 48), width=12)
    out = vign(im, .35).convert('RGBA')
    for (x, y) in (path[1], path[3], path[5]): drop(out, rosette(220), x, y)
    return out.convert('RGB')

def save(stem, im):
    s = SLOTS[stem]; w, h = s['w'], s['h']
    if im.size != (w, h): im = ImageOps.fit(im, (w, h), Image.LANCZOS)
    if not s['alpha']: im = im.convert('RGB')
    im.save(f'{H}/{stem}.webp', 'WEBP', quality=90, method=6)

PLAN = {f'fabric-{n:02d}': (lambda n=n: fabric(n)) for n in range(1, 34)}
PLAN.update({'token-me': lambda: spool('#2b8c8c'), 'token-opp': lambda: spool('#c4623e'), 'icon-button': lambda: button(), 'icon-hourglass': hourglass,
             'patch-leather': lambda: leather(256), 'icon-leather': lambda: leather(128), 'bonus-tile': lambda: rosette(256), 'icon-bonus': lambda: rosette(128),
             'torn-square': torn, 'fx-sparkle': sparkle, 'fx-stitch': fxstitch, 'ui-offer-card': offer_card, 'bg-table': bg_table,
             'quilt-frame': quilt_frame, 'track-frame': track_frame, 'bg-title': lambda: table_scene(1), 'result-win': lambda: table_scene(2, rosette_on=True),
             'result-lose': lambda: table_scene(4, dim=True), 'bg-map': bg_map})
if __name__ == '__main__':
    only = sys.argv[sys.argv.index('--only') + 1] if '--only' in sys.argv else '.'
    done = [s for s in PLAN if re.search(only, s)]
    for stem in done: save(stem, PLAN[stem]())
    print('composed', len(done), 'of', len(SLOTS), 'slots')
