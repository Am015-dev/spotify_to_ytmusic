#!/usr/bin/env python3
"""Composes every Twin Thrones picture (assets.json slots) from rendered KayKit models + simple vector chrome.
PACKS=/path python3 compose.py   (PACKS holds out/*.png from tools/render.js and glyph/*.png from tools/render-glyphs.js)"""
import os, json, math, random, glob
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageChops
PK = os.environ.get('PACKS', '/tmp/claude-0/p'); OUT = os.path.dirname(os.path.abspath(__file__))
A = {i['stem']: i for i in json.load(open(os.path.join(OUT, '..', 'assets.json')))['items']}
def hexc(h): h = h.lstrip('#'); return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))
CAT = {  # frame, light, dark
 'brown': ('#8a5a2b', '#ecdab5', '#4a2f14'), 'grey': ('#7d8892', '#e6e9eb', '#3d454c'), 'blue': ('#2d6fb7', '#d9e8f7', '#173a63'),
 'green': ('#3a8f4a', '#dff0d6', '#1c4a26'), 'yellow': ('#e0a820', '#f9efc4', '#7a5a0a'), 'red': ('#b8352f', '#f7dcd4', '#5e1a17'), 'purple': ('#7a4aa0', '#e8dcf1', '#3d2354')}
GOLD, INK = hexc('#e8bd4c'), hexc('#2b1d0e')
def load(n):
    p = os.path.join(PK, 'out', n + '.png'); return Image.open(p).convert('RGBA')
def trim(im, pad=0):
    b = im.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox(); return im.crop(b) if b else im
def fit(im, w, h):
    im = trim(im); s = min(w / im.width, h / im.height); return im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)
def grad(w, h, top, bot):
    t = np.linspace(0, 1, h)[:, None, None]; a = np.array(top)[None, None, :] * (1 - t) + np.array(bot)[None, None, :] * t
    return Image.fromarray(np.repeat(a, w, 1).astype('uint8'), 'RGB')
def radial(w, h, inner, outer, cx=.5, cy=.5, r=.75):
    y, x = np.mgrid[0:h, 0:w]; d = np.sqrt(((x - w * cx) / w) ** 2 + ((y - h * cy) / h) ** 2) / r; d = np.clip(d, 0, 1)[..., None]
    a = np.array(inner)[None, None, :] * (1 - d) + np.array(outer)[None, None, :] * d; return Image.fromarray(a.astype('uint8'), 'RGB')
def hexlines(w, h, size, col, alpha):
    """faint pointy-top hex lattice overlay"""
    L = Image.new('RGBA', (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(L); dx = size * math.sqrt(3); dy = size * 1.5
    for r in range(-1, int(h / dy) + 2):
        for q in range(-1, int(w / dx) + 2):
            cx = q * dx + (dx / 2 if r % 2 else 0); cy = r * dy
            pts = [(cx + size * math.cos(math.radians(60 * i - 30)), cy + size * math.sin(math.radians(60 * i - 30))) for i in range(6)]
            d.line(pts + [pts[0]], fill=col + (alpha,), width=max(1, round(size / 18)))
    return L
def shadow(canvas, cx, cy, rw, rh, a=110):
    s = Image.new('RGBA', canvas.size, (0, 0, 0, 0)); ImageDraw.Draw(s).ellipse((cx - rw, cy - rh, cx + rw, cy + rh), fill=(20, 12, 4, a)); s = s.filter(ImageFilter.GaussianBlur(rh * .45)); canvas.alpha_composite(s)
def soft_shadow(canvas, obj, x, y, off=(10, 14), a=120, blur=14):
    m = Image.new('RGBA', canvas.size, (0, 0, 0, 0)); sh = Image.new('RGBA', obj.size, (20, 12, 4, 0)); sh.putalpha(obj.getchannel('A').point(lambda v: v * a // 255)); m.alpha_composite(sh, (x + off[0], y + off[1])); canvas.alpha_composite(m.filter(ImageFilter.GaussianBlur(blur)))
def save(img, stem, alpha=False):
    it = A[stem]; assert img.size == (it['w'], it['h']), (stem, img.size)
    img.save(os.path.join(OUT, stem + '.webp'), quality=90, method=6) if (alpha or img.mode == 'RGBA') else img.convert('RGB').save(os.path.join(OUT, stem + '.webp'), quality=88, method=6)
def cat_of(stem):
    s = A[stem]['slot']
    if stem.startswith('g-'): return 'purple'
    for c in CAT:
        if f', {c}' in s: return c
    return 'brown'
def frame_rect(img, col, light, dark, w=500, h=700, thick=13):
    d = ImageDraw.Draw(img)
    d.rectangle((0, 0, w - 1, h - 1), outline=hexc(col), width=thick)
    d.rectangle((thick, thick, w - 1 - thick, h - 1 - thick), outline=hexc(dark), width=3)
    d.rectangle((thick + 3, thick + 3, w - 1 - thick - 3, h - 1 - thick - 3), outline=GOLD, width=2)
def card_face(stem):
    W, H = 500, 700; col, light, dark = CAT[cat_of(stem)]
    bg = radial(W, H, hexc(light), tuple(int(c * .86 + 255 * .0) for c in hexc(light)), .5, .52, .8).convert('RGBA')
    # tinted lower sky / ground wash so the object sits in a scene
    bg.alpha_composite(Image.new('RGBA', (W, H), hexc(col) + (26,)))
    bg.alpha_composite(hexlines(W, H, 34, hexc(col), 40))
    # top band zone (the game draws its own band on top; keep it colour-matched) and bottom cost strip
    top = Image.new('RGBA', (W, 150), (0, 0, 0, 0)); tg = grad(W, 150, hexc(col), hexc(col)).convert('RGBA'); tg.putalpha(Image.linear_gradient('L').resize((W, 150)).transpose(Image.FLIP_TOP_BOTTOM).point(lambda v: min(255, v * 2))); bg.alpha_composite(tg, (0, 0))
    bt = grad(W, 120, hexc(dark), hexc(dark)).convert('RGBA'); bt.putalpha(Image.linear_gradient('L').resize((W, 120)).point(lambda v: v * 190 // 255)); bg.alpha_composite(bt, (0, H - 120))
    # object
    obj = fit(load(stem), 430, 410); cx, cy = 250, 392
    x, y = cx - obj.width // 2, cy - obj.height // 2 + 10
    shadow(bg, cx, y + obj.height - 14, obj.width * .42, 20, 90)
    bg.alpha_composite(obj, (x, y))
    frame_rect(bg, col, light, dark); return bg
def wonder_face(stem):
    W, H = 700, 500; col = '#c99a2e'
    bg = radial(W, H, hexc('#b99552'), hexc('#4d3a1c'), .5, .5, .85).convert('RGBA'); bg.alpha_composite(hexlines(W, H, 34, hexc('#e8bd4c'), 40))
    obj = fit(load(stem), 600, 400); x, y = 350 - obj.width // 2, 262 - obj.height // 2
    shadow(bg, 350, y + obj.height - 10, obj.width * .4, 18, 80); bg.alpha_composite(obj, (x, y)); frame_rect(bg, col, '#f4e3b0', '#4a2f14', W, H, 12); return bg
def card_back(age):
    W, H = 500, 700; base = {1: '#35486a', 2: '#6b4a3a', 3: '#4d3a6b'}[age]; b = hexc(base)
    bg = radial(W, H, tuple(min(255, int(c * 1.35)) for c in b), tuple(int(c * .7) for c in b), .5, .5, .8).convert('RGBA'); bg.alpha_composite(hexlines(W, H, 30, (240, 215, 150), 70))
    cx, cy, r = 250, 340, 150; s = 4; m = Image.new('RGBA', (W * s, H * s), (0, 0, 0, 0)); d = ImageDraw.Draw(m)
    for rr, c in ((r, (60, 40, 10, 255)), (r - 8, GOLD + (255,)), (r - 22, (60, 40, 10, 255)), (r - 26, tuple(int(v * .6) for v in b) + (255,))): d.ellipse(((cx - rr) * s, (cy - rr) * s, (cx + rr) * s, (cy + rr) * s), fill=c)
    bg.alpha_composite(m.resize((W, H), Image.LANCZOS)); t = fit(load('logo-tower-gold'), 190, 220); shadow(bg, cx, cy + 105, 70, 12, 100); bg.alpha_composite(t, (cx - t.width // 2, cy - t.height // 2 - 6))
    d = ImageDraw.Draw(bg)
    for i in range(age):  # age pips
        px = cx + (i - (age - 1) / 2) * 34; py = 548; pts = [(px + 11 * math.cos(math.radians(60 * k - 30)), py + 11 * math.sin(math.radians(60 * k - 30))) for k in range(6)]; d.polygon(pts, fill=GOLD, outline=(60, 40, 10))
    frame_rect(bg, '#e8bd4c', '', '#2b1d0e'); return bg
def medallion(size, ring, fill_in, fill_out, obj=None, glyph=None, objscale=.72):
    s = 4; S = size * s; m = Image.new('RGBA', (S, S), (0, 0, 0, 0)); d = ImageDraw.Draw(m); c = S // 2
    d.ellipse((s * 6, s * 8, S - s * 6, S - s * 2), fill=(0, 0, 0, 90)); m = m.filter(ImageFilter.GaussianBlur(s * 3)); d = ImageDraw.Draw(m)
    R = c - s * 8; d.ellipse((c - R, c - R, c + R, c + R), fill=INK + (255,)); R2 = R - s * 3; d.ellipse((c - R2, c - R2, c + R2, c + R2), fill=hexc(ring) + (255,))
    R3 = R2 - s * 9; d.ellipse((c - R3, c - R3, c + R3, c + R3), fill=tuple(int(v * .55) for v in hexc(ring)) + (255,)); R4 = R3 - s * 2
    inner = radial(S, S, hexc(fill_in), hexc(fill_out), .45, .38, .75).convert('RGBA'); mk = Image.new('L', (S, S), 0); ImageDraw.Draw(mk).ellipse((c - R4, c - R4, c + R4, c + R4), fill=255); inner.putalpha(mk); m.alpha_composite(inner)
    d = ImageDraw.Draw(m); d.arc((c - R4 + s * 3, c - R4 + s * 3, c + R4 - s * 3, c + R4 - s * 3), 200, 290, fill=(255, 255, 255, 120), width=s * 3)
    if obj is not None:
        o = fit(obj, int(R4 * 2 * objscale), int(R4 * 2 * objscale)); o = o.resize((o.width, o.height)); m.alpha_composite(o, (c - o.width // 2, c - o.height // 2 + int(R4 * .06)))
    if glyph is not None:
        g = fit(glyph, int(R4 * 2 * .62), int(R4 * 2 * .62)); m.alpha_composite(g, (c - g.width // 2, c - g.height // 2))
    return m.resize((size, size), Image.LANCZOS)
def vignette(img, a=.45):
    w, h = img.size; y, x = np.mgrid[0:h, 0:w]; d = np.sqrt(((x - w / 2) / (w / 2)) ** 2 + ((y - h / 2) / (h / 2)) ** 2) / 1.41; v = 1 - a * np.clip(d, 0, 1) ** 2.2
    arr = np.array(img.convert('RGB')).astype('float') * v[..., None]; return Image.fromarray(arr.clip(0, 255).astype('uint8'))
def scene_bg(stem, W, H, sky_top, sky_bot, tint=None, desat=0.0, dark=0.0):
    src = Image.open(os.path.join(PK, 'out', stem + '.png')).convert('RGBA'); sc = max(W / src.width, H / src.height)
    src = src.resize((round(src.width * sc), round(src.height * sc)), Image.LANCZOS); bg = grad(W, H, sky_top, sky_bot).convert('RGBA')
    ox, oy = (W - src.width) // 2, (H - src.height) // 2; layer = Image.new('RGBA', (W, H), (0, 0, 0, 0)); layer.alpha_composite(src, (ox, oy)) if ox <= 0 and oy <= 0 else layer.paste(src, (ox, oy)); bg.alpha_composite(layer)
    img = bg.convert('RGB')
    if desat: g = img.convert('L').convert('RGB'); img = Image.blend(img, g, desat)
    if dark: img = Image.blend(img, Image.new('RGB', (W, H), (10, 14, 24)), dark)
    if tint: img = Image.blend(img, Image.new('RGB', (W, H), tint[0]), tint[1])
    return vignette(img, .5)
def strip_board(W, H, p1col, p2col, castles):
    src = Image.open(os.path.join(PK, 'out', 'row-grass.png')).convert('RGBA'); sc = max(W / src.width, H / src.height); src = src.resize((round(src.width * sc), round(src.height * sc)), Image.LANCZOS)
    bg = grad(W, H, hexc('#16302f'), hexc('#0d1c20')).convert('RGBA'); bg.alpha_composite(src.crop(((src.width - W) // 2, (src.height - H) // 2, (src.width + W) // 2, (src.height + H) // 2)))
    img = bg.convert('RGB'); img = Image.blend(img, Image.new('RGB', (W, H), (14, 26, 30)), .38)
    if castles:
        img = img.convert('RGBA')
        for nm, side in (('logo-castle-blue', 0), ('logo-castle-red', 1)):
            c = fit(load(nm), int(H * .95), int(H * .95)); x = -int(c.width * .15) if side == 0 else W - c.width + int(c.width * .15); soft_shadow(img, c, x, H - c.height - 6, (6, 8), 140, 10); img.alpha_composite(c, (x, H - c.height - 6))
    return vignette(img.convert('RGB'), .35)
def coin(size=256):
    s = 4; S = size * s; c = S // 2; m = Image.new('RGBA', (S, S), (0, 0, 0, 0)); d = ImageDraw.Draw(m)
    d.ellipse((c - c * .93 + s * 4, c - c * .93 + s * 8, c + c * .93 + s * 4, c + c * .93 + s * 8), fill=(0, 0, 0, 100)); m = m.filter(ImageFilter.GaussianBlur(s * 3)); d = ImageDraw.Draw(m)
    R = int(c * .9)
    for rr, col in ((R, '#2b1d0e'), (R - s * 3, '#f2cf62'), (R - s * 13, '#b88a22'), (R - s * 17, '#e8bd4c')): d.ellipse((c - rr, c - rr, c + rr, c + rr), fill=hexc(col))
    r = R - s * 17; pts = [(c + r * .6 * math.cos(math.radians(60 * k - 30)), c + r * .6 * math.sin(math.radians(60 * k - 30))) for k in range(6)]; d.polygon(pts, fill=hexc('#b88a22')); pts2 = [(c + r * .5 * math.cos(math.radians(60 * k - 30)), c + r * .5 * math.sin(math.radians(60 * k - 30))) for k in range(6)]; d.polygon(pts2, fill=hexc('#f6dc82'))
    d.arc((c - r + s * 6, c - r + s * 6, c + r - s * 6, c + r - s * 6), 200, 280, fill=(255, 255, 255, 170), width=s * 4); return m.resize((size, size), Image.LANCZOS)
def fx_dust(size=512):
    random.seed(4); m = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    for i in range(16):
        a = random.random() * 6.28; r = random.uniform(40, 150); x = size / 2 + math.cos(a) * r; y = size / 2 + math.sin(a) * r * .6 + 40; rad = random.uniform(30, 62)
        p = Image.new('RGBA', (size, size), (0, 0, 0, 0)); ImageDraw.Draw(p).ellipse((x - rad, y - rad, x + rad, y + rad), fill=(226, 205, 160, random.randint(70, 130))); m.alpha_composite(p.filter(ImageFilter.GaussianBlur(10)))
    return m
def fx_coins(size=512):
    random.seed(9); m = Image.new('RGBA', (size, size), (0, 0, 0, 0)); c = coin(120)
    for i in range(11):
        a = i / 11 * 6.28 + random.random() * .4; r = random.uniform(70, 190); k = random.uniform(.6, 1.1); cc = c.resize((int(120 * k), int(120 * k)), Image.LANCZOS).rotate(random.uniform(-40, 40), expand=True)
        m.alpha_composite(cc, (int(size / 2 + math.cos(a) * r - cc.width / 2), int(size / 2 + math.sin(a) * r * .8 - cc.height / 2)))
    return m
def fx_glow(size=512):
    y, x = np.mgrid[0:size, 0:size]; d = np.sqrt((x - size / 2) ** 2 + (y - size / 2) ** 2) / (size / 2); a = np.clip(1 - d, 0, 1) ** 1.8
    arr = np.zeros((size, size, 4), 'uint8'); arr[..., 0] = 255; arr[..., 1] = 214; arr[..., 2] = 110; arr[..., 3] = (a * 235).astype('uint8'); return Image.fromarray(arr, 'RGBA')
def run():
    done = []
    def put(stem, img, alpha=False):
        save(img, stem, alpha); done.append(stem)
    for stem, it in A.items():
        try:
            if stem[:3] in ('a1-', 'a2-', 'a3-') or stem.startswith('g-'): put(stem, card_face(stem))
            elif stem.startswith('w-'): put(stem, wonder_face(stem))
            elif stem.startswith('back-age'): put(stem, card_back(int(stem[-1])))
            elif stem.startswith('t-'):
                fill = ('#fff1c9', '#e2c37a'); put(stem, medallion(256, '#d9a935', *fill, obj=load(stem), objscale=.74), True)
            elif stem.startswith('res-'):
                o = fit(load(stem), 224, 224); m = Image.new('RGBA', (256, 256), (0, 0, 0, 0)); x, y = 128 - o.width // 2, 128 - o.height // 2 - 4; soft_shadow(m, o, x, y, (4, 8), 130, 5); m.alpha_composite(o, (x, y)); put(stem, m, True)
            elif stem.startswith('sci-') or stem in ('icon-shield', 'icon-vp'):
                ring = {'sci': '#3a8f4a', 'icon-shield': '#b8352f', 'icon-vp': '#d9a935'}[stem.split('-')[0] if stem.startswith('sci') else stem]; fi = ('#fff4d6', '#e8cf8c')
                put(stem, medallion(256, ring, *fi, glyph=Image.open(os.path.join(PK, 'glyph', stem + '.png')).convert('RGBA')), True)
            elif stem == 'coin': put(stem, coin(), True)
            elif stem == 'military-pawn':
                o = fit(load('military-pawn'), 200, 236); m = Image.new('RGBA', (256, 256), (0, 0, 0, 0)); x, y = 128 - o.width // 2, 246 - o.height; soft_shadow(m, o, x, y, (4, 6), 130, 5); m.alpha_composite(o, (x, y)); put(stem, m, True)
            elif stem == 'title-bg': put(stem, scene_bg('scene-title', 2048, 1152, hexc('#2f86be'), hexc('#1f6a9e'), dark=.28))
            elif stem == 'result-victory': put(stem, scene_bg('scene-victory', 2048, 1152, hexc('#2f86be'), hexc('#1f6a9e'), tint=(hexc('#ffd27a'), .08)))
            elif stem == 'result-defeat': put(stem, scene_bg('scene-defeat', 2048, 1152, hexc('#58506a'), hexc('#2a3340'), desat=.62, dark=.32, tint=(hexc('#3a2a4a'), .15)))
            elif stem == 'table-bg':
                W = 2048; base = grad(W, W, hexc('#17393a'), hexc('#0f2628')).convert('RGBA'); base.alpha_composite(hexlines(W, W, 64, hexc('#e8bd4c'), 70)); base.alpha_composite(hexlines(W, W, 64, (0, 0, 0), 60).transform((W, W), Image.AFFINE, (1, 0, 3, 0, 1, 3)))
                rnd = np.random.RandomState(3).randint(-9, 9, (W // 4, W // 4)).astype('int16'); nz = Image.fromarray((rnd + 128).astype('uint8'), 'L').resize((W, W), Image.BICUBIC); base = Image.blend(base.convert('RGB'), ImageChops.overlay(base.convert('RGB'), nz.convert('RGB')), .35); put(stem, vignette(base, .5))
            elif stem == 'military-board': put(stem, strip_board(1800, 240, 0, 0, True))
            elif stem.startswith('city-board'):
                im = strip_board(1500, 300, 0, 0, False); tint = hexc('#1e4f8f') if stem.endswith('p1') else hexc('#8f2a24'); put(stem, Image.blend(im, Image.new('RGB', im.size, tint), .34))
            elif stem.startswith('portrait-'):
                p1 = stem.endswith('p1'); cs = load('logo-castle-blue' if p1 else 'logo-castle-red'); base = radial(512, 512, hexc('#ffe9b0'), hexc('#2d6fb7' if p1 else '#b8352f'), .5, .35, .85).convert('RGBA'); base.alpha_composite(hexlines(512, 512, 40, (255, 255, 255), 50))
                o = fit(cs, 400, 420); shadow(base, 256, 470, 150, 16, 110); base.alpha_composite(o, (256 - o.width // 2, 480 - o.height)); put(stem, base)
            elif stem == 'fx-lift-dust': put(stem, fx_dust(), True)
            elif stem == 'fx-coin-burst': put(stem, fx_coins(), True)
            elif stem == 'fx-pawn-glow': put(stem, fx_glow(), True)
            else: print('NO RULE', stem)
        except Exception as e:
            print('FAIL', stem, type(e).__name__, e)
    print('composed', len(done), '/', len(A))
if __name__ == '__main__': run()
