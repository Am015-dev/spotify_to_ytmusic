#!/usr/bin/env python3
"""Compose vale-of-banners free-kit pictures from real CC0 packs (see ART-DIRECTION.md, CREDITS.md).
Usage: ART_CACHE=/path/to/cache python3 compose.py [--only REGEX] [--sheet out.png]
Cache layout (unzipped OpenGameArt downloads):
  x/hexagon-pack/            Kenney Hexagon Pack           https://opengameart.org/content/hexagon-pack-310x
  x/kenney_piratepack/       Kenney Pirate Pack            https://opengameart.org/content/pirate-pack-190
  x/kenney_medievalRTSpack/  Kenney Medieval RTS           https://opengameart.org/content/medieval-rts-120
  spr/<animal>.png           Quaternius Farm Animals / Animals Pack OBJ rendered to 2D (three.js, see render notes)
  tex/brown_planks_03.jpg    Poly Haven (table only)
Slots not listed in PLAN keep their previous file."""
import os, sys, re, json, math, random, glob
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance, ImageOps
H = os.path.dirname(os.path.abspath(__file__))
C = os.environ.get('ART_CACHE', '/tmp/art-cache')
HEX = C + '/x/hexagon-pack/PNG'
SLOTS = {s['stem']: s for s in json.load(open(H + '/slots.json'))}
LOG = {}

def ld(p):
    return Image.open(p).convert('RGBA')
def hx(name):
    g = glob.glob(f'{HEX}/Tiles/**/{name}.png', recursive=True) or glob.glob(f'{HEX}/Objects/{name}.png')
    return ld(g[0])
def obj(name): return ld(f'{HEX}/Objects/{name}.png')
def up(im, h=None, w=None):
    """Upscale Kenney flat art cleanly: Lanczos then a light unsharp so edges stay crisp."""
    if h: w = round(im.width * h / im.height)
    else: h = round(im.height * w / im.width)
    big = im.resize((w, h), Image.LANCZOS)
    rgb = big.convert('RGB').filter(ImageFilter.UnsharpMask(1.2, 80, 2)); rgb.putalpha(big.getchannel('A'))
    return rgb
def shadow(im, off=(0, 6), blur=6, a=90):
    s = Image.new('RGBA', (im.width + 40, im.height + 40), (0, 0, 0, 0))
    m = im.getchannel('A').point(lambda v: v * a // 255)
    s.paste((20, 30, 20, 255), (20 + off[0], 20 + off[1]), m)
    return s.filter(ImageFilter.GaussianBlur(blur))
def place(base, im, cx, cy, sh=True):
    if sh:
        s = shadow(im, (2, max(3, im.height // 24)), max(2, im.height // 30), 80)
        base.alpha_composite(s, (int(cx - s.width / 2), int(cy - s.height / 2)))
    base.alpha_composite(im, (int(cx - im.width / 2), int(cy - im.height / 2)))
def recolor(im, rgb, keep=0.35):
    """Tint toward rgb keeping shading (luminance multiply)."""
    g = ImageOps.grayscale(im.convert('RGB')); g = ImageEnhance.Contrast(g).enhance(1.2)
    t = Image.merge('RGB', [g.point(lambda v, c=c: int(min(255, c * (keep + (1 - keep) * v / 200)))) for c in rgb])
    t.putalpha(im.getchannel('A')); return t
def water_hex():
    t = hx('stone_02'); return recolor(t, (70, 150, 210), 0.55)

# ---------- hex tile slots ----------
def tile(base, objs=(), size=256, scale=1.0):
    """One hex tile filling a size x size canvas (contain). objs: (sprite, cx, cy, height) in tile-relative units."""
    cv = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    t = up(base, h=int(size * 0.97 * scale)) if base.height != int(size * .97 * scale) else base
    place(cv, t, size / 2, size / 2, sh=True)
    for sp, cx, cy, hh in objs:
        o = sp if hh is None else up(sp, h=int(hh * size)) if sp.height < hh * size else sp.resize((round(sp.width * hh * size / sp.height), int(hh * size)), Image.LANCZOS)
        place(cv, o, cx * size, cy * size)
    return cv

BUILD = {'tile-keep': 'medieval_largeCastle', 'tile-mine': 'medieval_mine', 'tile-bld-hall': 'medieval_house', 'tile-bld-carp': 'medieval_lumber',
         'tile-bld-chapel': 'medieval_church', 'tile-bld-mkt': None, 'tile-bld-inn': None, 'tile-bld-mint': 'medieval_blacksmith',
         'tile-bld-tower': 'medieval_tower', 'tile-bld-store': 'medieval_windmill'}
def building(stem):
    if stem == 'tile-bld-mkt':   # fair green: market stalls (shops + tents) on grass
        return tile(hx('grass_05'), [(obj('shops'), .38, .42, .36), (obj('shops'), .62, .58, .36), (obj('treeRound_large'), .28, .66, .16), (obj('treeRound_large'), .74, .34, .16)])
    if stem == 'tile-bld-inn':
        return tile(hx('grass_05'), [(obj('tavern'), .5, .46, .52), (obj('treePine_large'), .24, .62, .2), (obj('treePine_large'), .76, .62, .2)])
    return tile(hx(BUILD[stem]))

def barge():
    sh = ld(C + '/x/kenney_piratepack/PNG/Retina/Ships/ship (2).png').rotate(-60, expand=True, resample=Image.BICUBIC)
    return tile(water_hex(), [(sh, .5, .5, .66)])

def back():
    t = hx('sand_08'); cv = tile(t)
    d = ImageDraw.Draw(cv)
    # banner emblem: crimson pennant on a pole, drawn flat in pack style (outline + flat fill)
    pole = [(118, 70), (126, 70), (126, 190), (118, 190)]
    d.polygon(pole, fill=(120, 80, 50)); d.ellipse((114, 62, 130, 78), fill=(240, 200, 80))
    flag = [(126, 80), (196, 98), (176, 116), (196, 134), (126, 150)]
    d.polygon(flag, fill=(196, 52, 52)); d.line(flag + [flag[0]], fill=(130, 30, 30), width=4)
    return cv

LORE = {  # stem -> one clear subject on the cream lore hex (knowledge tiles)
    'k1': [('windmill_complete', .5, .5, .52)], 'k2': [('store', .5, .5, .46)], 'k3': [('archway', .5, .5, .5)],
    'k4': [('#water', 0, 0, 0), ('#dinghy', .5, .5, .5)], 'k5': [('rockGrey_large', .44, .48, .46), ('crystals2', .64, .62, .22)], 'k6': [('house_small', .5, .5, .48)],
    'k7': [('wall_corner', .5, .52, .36), ('rockGrey_medium3', .7, .64, .18)], 'k8': [('farm', .44, .48, .44), ('hay', .68, .64, .14)],
    'k9': [('#water', 0, 0, 0), ('#dinghys', .5, .5, .46)], 'k10': [('castle_small', .5, .5, .48)],
    'k11': [('church', .5, .5, .5)], 'k12': [('fountain', .5, .5, .4)], 'k13': [('pallet_full', .5, .52, .36)],
    'k14': [('#water', 0, 0, 0), ('tower', .5, .46, .56)], 'k15': [('crystals1', .40, .5, .34), ('crystals2', .62, .56, .30)],
    'k16': [('oven', .5, .5, .5)], 'k25': [('house', .5, .5, .42)], 'k26': [('#horse', .5, .52, .46)],
}
ROLL = {'k17': 'tile-bld-hall', 'k18': 'tile-bld-carp', 'k19': 'tile-bld-chapel', 'k20': 'tile-bld-mkt', 'k21': 'tile-bld-inn',
        'k22': 'tile-bld-mint', 'k23': 'tile-bld-tower', 'k24': 'tile-bld-store'}
def lore(stem):
    k = stem.split('-')[-1]
    if k in ROLL:   # "Roll of the X": that building as a small hex inset on the cream lore tile
        cv = tile(hx('sand_07'))
        inner = building(ROLL[k]).resize((150, 150), Image.LANCZOS)
        place(cv, inner, 128, 128, sh=True); return cv
    items = LORE[k]; base = hx('sand_07'); objs = []
    for n, x, y, h in items:
        if n == '#water': base = water_hex(); continue
        if n in ('#dinghy', '#dinghys'):
            sp = ld(C + '/x/kenney_piratepack/PNG/Retina/Ships/' + ('dinghyLarge1' if n == '#dinghy' else 'dinghySmall2') + '.png').rotate(-55, expand=True, resample=Image.BICUBIC)
            objs.append((sp, x, y, h)); continue
        if n == '#horse': sp = ld(C + '/spr/horse.png'); objs.append((sp.crop(sp.getbbox()), x, y, h)); continue
        objs.append((obj(n), x, y, h))
    return tile(base, objs)

ANIM = {'sheep': ('sheep', 1.0), 'goat': ('llama', 1.05), 'pig': ('pig', .95), 'goose': ('chick', .85)}
POS = {2: [(.38, .44), (.6, .6)], 3: [(.36, .40), (.64, .44), (.5, .66)], 4: [(.35, .38), (.63, .38), (.37, .64), (.65, .64)]}
def pasture(stem):
    _, _, a, n = stem.split('-'); n = int(n)
    sp, sc = ANIM[a]; im = ld(f'{C}/spr/{sp}.png'); im = im.crop(im.getbbox())
    h = {2: .30, 3: .27, 4: .24}[n] * sc
    objs = [(obj('hedge'), .5, .5, .0)] if False else []
    random.seed(stem)
    for (x, y) in POS[n]:
        s = im if random.random() < .5 else ImageOps.mirror(im)
        objs.append((s, x, y, h))
    return tile(hx('grass_05'), objs)

# ---------- banners / frame / scroll (flat vector in the pack's style, crisp at any size) ----------
SEAT = [(200, 56, 56), (52, 118, 200), (232, 176, 40), (130, 70, 170)]
def banner(i):
    s = 512; cv = Image.new('RGBA', (s, s)); d = ImageDraw.Draw(cv)
    col = SEAT[i]; dk = tuple(int(c * .62) for c in col)
    d.ellipse((150, 420, 360, 470), fill=(0, 0, 0, 60))
    d.rounded_rectangle((226, 70, 254, 450), 10, fill=(120, 80, 50), outline=(70, 45, 28), width=6)
    d.ellipse((208, 40, 272, 104), fill=(244, 204, 90), outline=(170, 120, 40), width=6)
    flag = [(254, 110), (440, 150), (390, 215), (440, 280), (254, 320)]
    d.polygon(flag, fill=col); d.line(flag + [flag[0]], fill=dk, width=10, joint='curve')
    d.polygon([(254, 290), (440, 280), (254, 320)], fill=dk)
    return cv.filter(ImageFilter.SMOOTH).resize((128, 128), Image.LANCZOS)

def hexpts(cx, cy, r):
    return [(cx + r * math.sin(math.radians(60 * k)), cy - r * math.cos(math.radians(60 * k))) for k in range(6)]
def frame():
    s = 1024; cv = Image.new('RGBA', (s, s)); d = ImageDraw.Draw(cv)
    d.polygon(hexpts(512, 530, 500), fill=(0, 0, 0, 70))
    d.polygon(hexpts(512, 512, 500), fill=(150, 105, 60))
    d.polygon(hexpts(512, 512, 470), fill=(238, 220, 180))
    d.polygon(hexpts(512, 512, 430), fill=(200, 160, 100))
    d.polygon(hexpts(512, 512, 410), fill=(0, 0, 0, 0))
    for (x, y) in hexpts(512, 512, 455): d.ellipse((x - 18, y - 18, x + 18, y + 18), fill=(232, 180, 60), outline=(150, 105, 60), width=5)
    return cv.resize((512, 512), Image.LANCZOS)
def scroll():
    w, h = 1600, 1000; cv = Image.new('RGBA', (w, h)); d = ImageDraw.Draw(cv)
    d.rounded_rectangle((60, 90, w - 60, h - 70), 60, fill=(0, 0, 0, 60))
    d.rounded_rectangle((60, 60, w - 60, h - 100), 60, fill=(150, 105, 60))
    d.rounded_rectangle((90, 90, w - 90, h - 130), 40, fill=(242, 228, 196))
    d.rounded_rectangle((120, 120, w - 120, h - 160), 30, outline=(214, 190, 140), width=6)
    return cv.resize((800, 500), Image.LANCZOS)

# ---------- hex maps: boards, title, backgrounds ----------
def hexmap(W, Hh, scale, pick, sea=True, seed=1, tint=None, deco=True):
    random.seed(seed)
    cv = Image.new('RGBA', (W, Hh), (64, 140, 196, 255) if sea else (0, 0, 0, 0))
    if sea:   # gentle sea: vertical gradient plus soft wave dashes in the pack's flat style
        d = ImageDraw.Draw(cv)
        for y in range(Hh):
            t = y / Hh; d.line((0, y, W, y), fill=(int(70 + 20 * t), int(150 + 15 * t), int(205 - 10 * t)))
        for _ in range(W * Hh // 9000):
            x, y = random.randrange(W), random.randrange(Hh); d.rounded_rectangle((x, y, x + random.randint(14, 34), y + 4), 2, fill=(120, 190, 230))
    tw, th = int(120 * scale), int(140 * scale); sx, sy = tw, int(104 * scale)
    rows = Hh // sy + 3; cols = W // sx + 3
    cache = {}
    for r in range(-1, rows):
        for c in range(-1, cols):
            x = c * sx + (sx // 2 if r % 2 else 0) - sx // 2; y = r * sy - sy // 2
            n = pick(c, r, x + tw / 2, y + th / 2)
            if not n: continue
            if n not in cache: cache[n] = up(hx(n), h=th) if th > 140 else hx(n).resize((tw, th), Image.LANCZOS)
            cv.alpha_composite(cache[n], (x, y))
            if n == 'grass_05' and deco and random.random() < .55:
                for k in range(random.randint(1, 3)):
                    t = obj(random.choice(['treePine_large', 'treeRound_large', 'treePine_large']))
                    t = up(t, h=int(th * .32)) if th * .32 > t.height else t.resize((round(t.width * th * .32 / t.height), int(th * .32)), Image.LANCZOS)
                    place(cv, t, x + tw * random.uniform(.3, .7), y + th * random.uniform(.32, .62))
    if tint: cv = Image.blend(cv, Image.new('RGBA', cv.size, tint + (255,)), .25)
    return cv
def vignette(im, a=150):
    W, Hh = im.size; m = Image.new('L', (W, Hh), 0); d = ImageDraw.Draw(m)
    d.ellipse((-W * .25, -Hh * .3, W * 1.25, Hh * 1.3), fill=255); m = m.filter(ImageFilter.GaussianBlur(W // 8))
    dark = Image.new('RGBA', im.size, (20, 18, 30, 255)); out = Image.composite(im, Image.blend(im, dark, a / 255), m)
    return out

def island(W, Hh, scale, seed, ruin=False, center=None):
    cx, cy = center or (W * .5, Hh * .52); R = min(W, Hh) * .5
    feat = ['medieval_house', 'medieval_farm', 'medieval_windmill', 'medieval_lumber', 'medieval_church', 'medieval_cabin', 'medieval_tower', 'medieval_mine', 'medieval_blacksmith', 'medieval_archery']
    rng = random.Random(seed)
    def pick(c, r, x, y):
        dx, dy = (x - cx) / (W * .62), (y - cy) / (Hh * .62)
        dd = math.hypot(dx, dy) + rng.uniform(-.06, .06)
        if dd > .78: return None
        if dd > .66: return 'sand_07'
        if abs(x - cx) < 60 * scale and abs(y - cy) < 52 * scale: return 'medieval_ruins' if ruin else 'medieval_largeCastle'
        v = rng.random()
        if ruin: return rng.choice(['medieval_ruins', 'stone_02', 'medieval_smallCastle', 'grass_05'] if v < .6 else ['stone_02', 'grass_05'])
        if v < .42: return rng.choice(feat)
        if v < .46: return 'medieval_openCastle'
        return 'grass_05'
    return hexmap(W, Hh, scale, pick, True, seed)

def table():
    t = Image.open(C + '/tex/brown_planks_03.jpg').convert('RGB').resize((1600, 1600)).crop((0, 300, 1600, 1300))
    t = ImageEnhance.Brightness(t).enhance(.62); t = ImageEnhance.Color(t).enhance(.85)
    return vignette(t.convert('RGBA'), 120)

def well(d, cx, cy, r):
    """Sunken empty hex slot in the mat: darker rim + inner fill, flat pack palette."""
    d.polygon(hexpts(cx, cy, r), fill=(196, 168, 118)); d.polygon(hexpts(cx, cy + 3, r - 7), fill=(224, 204, 160))
    d.polygon(hexpts(cx, cy, r - 9), fill=(232, 214, 172))
def mat(base, box, rad=50):
    d = ImageDraw.Draw(base); x0, y0, x1, y1 = box
    d.rounded_rectangle((x0, y0 + 20, x1, y1 + 20), rad, fill=(20, 14, 10, 160))
    d.rounded_rectangle(box, rad, fill=(150, 105, 60)); d.rounded_rectangle((x0 + 26, y0 + 26, x1 - 26, y1 - 26), rad - 14, fill=(242, 228, 196))
    d.rounded_rectangle((x0 + 46, y0 + 46, x1 - 46, y1 - 46), rad - 24, outline=(214, 190, 140), width=5)
    return d
def board_estate():
    S = 1024; base = table().resize((1600, 1000)).crop((288, 0, 1312, 1000)).resize((S, S))
    d = ImageDraw.Draw(base)
    d.polygon(hexpts(S / 2, S / 2 + 16, S * .5), fill=(20, 14, 10, 160)); d.polygon(hexpts(S / 2, S / 2, S * .5), fill=(150, 105, 60))
    d.polygon(hexpts(S / 2, S / 2, S * .475), fill=(242, 228, 196))
    r = 62; dx = r * math.sqrt(3) + 4; dy = r * 1.5 + 3.5
    for q in range(-3, 4):
        for rr in range(-3, 4):
            if abs(q + rr) > 3: continue
            x = S / 2 + dx * (q + rr / 2); y = S / 2 + dy * rr; well(d, x, y, r)
    return base
def board_market():
    W, Hh = 1600, 1000; base = table(); d = mat(base, (70, 60, W - 70, Hh - 70))
    for k in range(6):
        a = math.radians(60 * k + 30); x, y = W / 2 + 430 * math.cos(a), Hh / 2 - 20 + 290 * math.sin(a); well(d, x, y, 100)
    for i in range(6): well(d, 330 + i * 188, 880, 0) if False else None
    place(base, up(hx('grass_05'), h=230), W / 2, Hh / 2 - 20)
    place(base, up(obj('fountain'), h=96), W / 2, Hh / 2 - 26)
    return base

def scene(kind):
    W, Hh = (1600, 1000) if kind != 'result' else (1200, 800)
    if kind == 'title': im = island(W, Hh, 1.25, 7)
    elif kind == 'map': im = island(W, Hh, .9, 11)
    elif kind == 'win': im = island(1200, 800, 1.05, 5)
    else: im = island(1200, 800, 1.05, 9, ruin=True); im = ImageEnhance.Color(im).enhance(.45); im = ImageEnhance.Brightness(im).enhance(.8)
    if kind == 'win':   # banners of the victor around the keep
        for (x, y) in [(470, 330), (730, 330), (600, 300)]: place(im, banner(0).resize((110, 110), Image.LANCZOS), x, y)
    return vignette(im, 110 if kind != 'lose' else 170)

def save(stem, im):
    s = SLOTS[stem]; w, h = s['w'], s['h']
    if im.size != (w, h): im = ImageOps.fit(im, (w, h), Image.LANCZOS) if not s['alpha'] else im.resize((w, h), Image.LANCZOS)
    if not s['alpha']: im = im.convert('RGB')
    im.save(f'{H}/{stem}.webp', 'WEBP', quality=88, method=6)


# ---------- portraits: Quaternius low-poly RPG characters (CC0) rendered to 2D (cache rpg/<name>-bust|full.png) ----------
import colorsys
def hue_swap(im, src_h, dst_h, width=.06, min_s=.45, sat_mul=1.0, val_mul=1.0):
    """Recolour one clothing hue band (keeps shading; skin is spared by the saturation floor)."""
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a < 10: continue
            h, sat, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
            dh = min(abs(h - src_h), 1 - abs(h - src_h))
            if dh < width and sat > min_s:
                r2, g2, b2 = colorsys.hsv_to_rgb(dst_h, min(1, sat * sat_mul), min(1, v * val_mul)); px[x, y] = (int(r2 * 255), int(g2 * 255), int(b2 * 255), a)
    return im
CAST = {  # stem -> (model, recolour (src hue, dst hue, sat, val) or None, backdrop tint, hex tile behind)
    'wren': ('ranger', None, (110, 170, 90), 'medieval_lumber'),
    'odo': ('wizard', None, (90, 120, 190), 'medieval_house'),
    'cass': ('rogue', (0.0, .58, 1.0, 1.35), (70, 140, 200), None),
    'hask': ('warrior', None, (150, 150, 160), 'medieval_largeCastle'),
    'marla': ('cleric', None, (200, 190, 120), 'medieval_farm'),
    'ivo': ('monk', None, (130, 90, 170), 'medieval_blacksmith'),
}
def char(model, mode, rc):
    im = ld(f'{C}/rpg/{model}-{mode}.png')
    if rc: im = hue_swap(im, rc[0], rc[1], .035, .62, rc[2], rc[3])
    im = ImageEnhance.Color(im).enhance(1.3); return ImageEnhance.Contrast(im).enhance(1.08)
def backdrop(tint, tile, W=512, boss=False, seed=7):
    bg = island(1200, 800, 1.3, seed, ruin=False).crop((300, 150, 900, 750)).resize((W, W), Image.LANCZOS)
    bg = bg.filter(ImageFilter.GaussianBlur(5 if not boss else 3))
    bg = Image.blend(bg, Image.new('RGBA', bg.size, tint + (255,)), .45 if not boss else .55)
    if tile: place(bg, up(hx(tile), h=int(W * .5)), W * .76, W * .42, sh=True)
    if boss: bg = ImageEnhance.Brightness(bg).enhance(.55)
    g = Image.new('RGBA', (W, W)); ImageDraw.Draw(g).ellipse((W * .12, W * .1, W * .88, W * .86), fill=(255, 240, 210, 110 if not boss else 0))
    if boss: ImageDraw.Draw(g).ellipse((W * .1, W * .05, W * .9, W * .9), fill=(230, 70, 40, 120))
    bg.alpha_composite(g.filter(ImageFilter.GaussianBlur(W // 8)))
    return bg
def portrait(stem):
    model, rc, tint, tile = CAST[stem]; W = 512; bg = backdrop(tint, tile)
    c = char(model, 'bust', rc).resize((W, W), Image.LANCZOS); bg.alpha_composite(c, (0, int(W * .1)))
    return vignette(bg, 120)
BOSS = {'cass': 'tile-barge', 'hask': 'tile-keep', 'ivo': 'tile-bld-mint'}
def boss(stem):
    model, rc, tint, tile = CAST[stem]; W = 512; bg = backdrop(tint, None, boss=True, seed=9)
    t = {'cass': barge, 'hask': lambda: building('tile-keep'), 'ivo': lambda: building('tile-bld-mint')}[stem]().resize((330, 330), Image.LANCZOS)
    place(bg, t, W * .74, W * .40)
    c = char(model, 'full', rc); c = c.crop(c.getbbox()); c = c.resize((int(c.width * 470 / c.height), 470), Image.LANCZOS)
    sh = Image.new('RGBA', (W, W)); ImageDraw.Draw(sh).ellipse((W * .2, W * .9, W * .62, W * .99), fill=(0, 0, 0, 140)); bg.alpha_composite(sh.filter(ImageFilter.GaussianBlur(8)))
    bg.alpha_composite(c, (int(W * .4 - c.width / 2), W - c.height - 10))
    return vignette(bg, 170)

# ---------- goods, tokens, icons, fx: flat vector in the hexagon pack's style (flat fill, darker rim), drawn at 4x ----------
RIM = (110, 72, 40)
def chip(S=512, face=(214, 170, 110)):
    im = Image.new('RGBA', (S, S)); d = ImageDraw.Draw(im)
    d.ellipse((30, 54, S - 30, S - 14), fill=(0, 0, 0, 70)); d.ellipse((24, 40, S - 24, S - 24), fill=tuple(int(c * .7) for c in face))
    d.ellipse((24, 24, S - 24, S - 40), fill=face); d.ellipse((60, 58, S - 60, S - 74), outline=tuple(int(c * .82) for c in face), width=10)
    return im, d
def goods(n):
    im, d = chip(); c = 256
    if n == 1:   # wool: fluffy cream bundle
        for (x, y, r) in ((200, 230, 70), (300, 220, 75), (250, 180, 70), (190, 300, 60), (310, 300, 62), (250, 300, 70)): d.ellipse((x - r, y - r, x + r, y + r), fill=(248, 244, 232), outline=(196, 186, 168), width=8)
    elif n == 2:   # cheese wedge
        d.polygon([(140, 320), (380, 320), (380, 220), (140, 260)], fill=(240, 196, 70), outline=(176, 130, 40)); d.polygon([(140, 260), (380, 220), (300, 160)], fill=(252, 220, 110), outline=(176, 130, 40))
        for (x, y, r) in ((220, 290, 16), (310, 270, 12), (340, 300, 10)): d.ellipse((x - r, y - r, x + r, y + r), fill=(200, 150, 50))
    elif n == 3:   # honey pot
        d.rounded_rectangle((170, 200, 342, 360), 60, fill=(214, 140, 50), outline=RIM, width=8); d.rectangle((180, 170, 332, 210), fill=(190, 120, 40), outline=RIM, width=8)
        d.polygon([(200, 210), (312, 210), (300, 260), (272, 250), (250, 280), (220, 250)], fill=(250, 190, 50))
    elif n == 4:   # cider jug
        d.ellipse((170, 210, 340, 370), fill=(196, 96, 50), outline=RIM, width=8); d.rectangle((220, 150, 290, 220), fill=(196, 96, 50), outline=RIM, width=8)
        d.arc((290, 200, 380, 300), 270, 90, fill=RIM, width=18); d.rectangle((226, 130, 284, 156), fill=(160, 110, 60)); d.ellipse((210, 250, 300, 300), fill=(120, 170, 60))
    elif n == 5:   # linen bolt
        d.rounded_rectangle((150, 190, 362, 330), 30, fill=(236, 226, 200), outline=(170, 150, 120), width=8)
        for x in range(180, 350, 30): d.line((x, 200, x, 320), fill=(214, 202, 172), width=6)
        d.ellipse((120, 190, 190, 330), fill=(220, 208, 178), outline=(170, 150, 120), width=8); d.ellipse((140, 236, 170, 284), fill=(180, 160, 128))
    elif n == 6:   # salt sack
        d.polygon([(170, 360), (342, 360), (320, 210), (192, 210)], fill=(232, 220, 196), outline=(160, 140, 110)); d.polygon([(192, 210), (320, 210), (290, 170), (222, 170)], fill=(220, 206, 178), outline=(160, 140, 110))
        d.line((200, 214, 312, 214), fill=(150, 100, 60), width=14); d.ellipse((228, 132, 284, 180), fill=(250, 250, 250), outline=(200, 200, 200), width=6)
    return im.resize((128, 128), Image.LANCZOS)
def meeple(d, cx, cy, s, col):
    dk = tuple(int(c * .6) for c in col)
    d.ellipse((cx - 50 * s, cy - 140 * s, cx + 50 * s, cy - 40 * s), fill=col, outline=dk, width=int(8 * s))
    d.polygon([(cx - 130 * s, cy + 20 * s), (cx - 60 * s, cy - 50 * s), (cx + 60 * s, cy - 50 * s), (cx + 130 * s, cy + 20 * s), (cx + 60 * s, cy + 20 * s), (cx + 90 * s, cy + 150 * s), (cx + 10 * s, cy + 150 * s), (cx, cy + 90 * s), (cx - 10 * s, cy + 150 * s), (cx - 90 * s, cy + 150 * s), (cx - 60 * s, cy + 20 * s)], fill=col, outline=dk)
def coin(d, cx, cy, r, col=(206, 210, 218), dk=(130, 134, 146)):
    d.ellipse((cx - r, cy - r + r * .12, cx + r, cy + r + r * .12), fill=dk); d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=col, outline=dk, width=max(4, int(r * .08)))
    d.ellipse((cx - r * .62, cy - r * .62, cx + r * .62, cy + r * .62), outline=dk, width=max(3, int(r * .06)))
def star(d, cx, cy, r, col, dk):
    pts = [(cx + (r if k % 2 == 0 else r * .45) * math.cos(math.radians(-90 + k * 36)), cy + (r if k % 2 == 0 else r * .45) * math.sin(math.radians(-90 + k * 36))) for k in range(10)]
    d.polygon(pts, fill=col, outline=dk); d.line(pts + [pts[0]], fill=dk, width=max(4, int(r * .06)))
def token(kind):
    S = 512; im = Image.new('RGBA', (S, S)); d = ImageDraw.Draw(im)
    if kind == 'worker': d.ellipse((120, 420, 392, 480), fill=(0, 0, 0, 70)); meeple(d, 256, 280, 1.3, (214, 170, 110))
    elif kind == 'silver': coin(d, 256, 250, 190)
    elif kind == 'points': d.ellipse((60, 60, 452, 452), fill=(36, 120, 70), outline=(20, 70, 40), width=14); star(d, 256, 262, 150, (246, 206, 80), (170, 120, 30))
    elif kind == 'die':
        d.rounded_rectangle((86, 100, 426, 440), 60, fill=(0, 0, 0, 60)); d.rounded_rectangle((76, 76, 436, 416), 60, fill=(248, 244, 232), outline=(170, 150, 120), width=12)
        for (x, y) in ((166, 166), (256, 246), (346, 326)): d.ellipse((x - 34, y - 34, x + 34, y + 34), fill=(196, 52, 52))
    return im.resize((128, 128), Image.LANCZOS)
def icon(kind):
    S = 384; im = Image.new('RGBA', (S, S)); d = ImageDraw.Draw(im); c = (192, 192)
    if kind == 'workers': meeple(d, 150, 210, .9, (180, 140, 90)); meeple(d, 236, 230, .9, (214, 170, 110))
    elif kind == 'silver': coin(d, 160, 200, 110); coin(d, 236, 170, 110)
    elif kind == 'points': star(d, 192, 196, 160, (246, 206, 80), (170, 120, 30))
    elif kind == 'storage':   # crate
        d.rectangle((70, 110, 314, 320), fill=(196, 140, 80), outline=RIM, width=12); d.line((70, 110, 314, 320), fill=RIM, width=12); d.line((70, 215, 314, 215), fill=RIM, width=10)
    elif kind == 'backlane':   # dirt path between two hedges
        d.polygon([(150, 340), (234, 340), (214, 60), (170, 60)], fill=(206, 160, 100), outline=RIM)
        for x in (90, 294): d.ellipse((x - 60, 120, x + 60, 340), fill=(40, 160, 90), outline=(20, 100, 50), width=10)
    elif kind == 'season':   # sun over leaf
        d.ellipse((92, 60, 292, 260), fill=(250, 196, 60), outline=(200, 140, 30), width=10)
        d.polygon([(110, 330), (192, 210), (274, 330)], fill=(40, 160, 90), outline=(20, 100, 50))
    elif kind == 'track':   # pennant on pole with dashes
        d.rectangle((110, 60, 132, 340), fill=(120, 80, 50)); d.polygon([(132, 70), (310, 120), (132, 170)], fill=(196, 52, 52), outline=(130, 30, 30))
        for x in range(160, 330, 50): d.rounded_rectangle((x, 300, x + 30, 320), 6, fill=(150, 105, 60))
    return im.resize((96, 96), Image.LANCZOS)
def fx(kind):
    S = 1024; im = Image.new('RGBA', (S, S)); d = ImageDraw.Draw(im)
    g = Image.new('RGBA', (S, S)); ImageDraw.Draw(g).ellipse((220, 220, 804, 804), fill=(255, 220, 120, 150)); im.alpha_composite(g.filter(ImageFilter.GaussianBlur(90)))
    if kind == 'region':
        for k in range(12):
            a = math.radians(k * 30); d.polygon([(512 + 120 * math.cos(a - .12), 512 + 120 * math.sin(a - .12)), (512 + 440 * math.cos(a), 512 + 440 * math.sin(a)), (512 + 120 * math.cos(a + .12), 512 + 120 * math.sin(a + .12))], fill=(250, 210, 90) if k % 2 else (255, 240, 180))
        d.polygon(hexpts(512, 512, 150), fill=(246, 206, 80), outline=(170, 120, 30)); d.line(hexpts(512, 512, 150) + [hexpts(512, 512, 150)[0]], fill=(170, 120, 30), width=14)
    elif kind == 'chain':
        pts = [(140 + t * 7.4, 620 - 260 * math.sin(math.pi * t / 100)) for t in range(101)]
        d.line(pts, fill=(196, 52, 52), width=70, joint='curve'); d.line(pts, fill=(232, 96, 80), width=36, joint='curve')
        for t in range(0, 101, 20): x, y = pts[t]; d.ellipse((x - 26, y - 26, x + 26, y + 26), fill=(246, 206, 80), outline=(170, 120, 30), width=6)
    elif kind == 'coin':
        coin(d, 512, 512, 220, (246, 206, 80), (170, 120, 30))
        for (x, y, r) in ((240, 260, 70), (800, 300, 50), (760, 780, 64), (260, 760, 44)):
            d.polygon([(x, y - r), (x + r * .25, y - r * .25), (x + r, y), (x + r * .25, y + r * .25), (x, y + r), (x - r * .25, y + r * .25), (x - r, y), (x - r * .25, y - r * .25)], fill=(255, 250, 220))
    return im.resize((256, 256), Image.LANCZOS)

PLAN = {}
for k in SLOTS:
    if k in BUILD: PLAN[k] = (lambda k=k: building(k))
    elif k.startswith('tile-lore'): PLAN[k] = (lambda k=k: lore(k))
    elif k.startswith('tile-pas'): PLAN[k] = (lambda k=k: pasture(k))
PLAN.update({'tile-back': back, 'tile-barge': barge, 'ui-tile-frame': frame, 'ui-scroll': scroll,
             'token-banner-0': lambda: banner(0), 'token-banner-1': lambda: banner(1), 'token-banner-2': lambda: banner(2), 'token-banner-3': lambda: banner(3),
             'bg-title': lambda: scene('title'), 'bg-map': lambda: scene('map'), 'bg-table': table, 'ui-result-win': lambda: scene('win'),
             'ui-result-lose': lambda: scene('lose'), 'board-estate': board_estate, 'board-market': board_market})
for k in CAST: PLAN['portrait-' + k] = (lambda k=k: portrait(k))
for k in BOSS: PLAN['boss-' + k] = (lambda k=k: boss(k))
for n in range(1, 7): PLAN[f'goods-{n}'] = (lambda n=n: goods(n))
for k in ('worker', 'silver', 'points'): PLAN['token-' + k] = (lambda k=k: token(k))
PLAN['die-white'] = lambda: token('die')
for k in ('workers', 'silver', 'points', 'storage', 'backlane', 'season', 'track'): PLAN['icon-' + k] = (lambda k=k: icon(k))
PLAN.update({'fx-region-complete': lambda: fx('region'), 'fx-chain': lambda: fx('chain'), 'fx-coin': lambda: fx('coin')})

if __name__ == '__main__':
    only = sys.argv[sys.argv.index('--only') + 1] if '--only' in sys.argv else '.'
    for stem, fn in PLAN.items():
        if re.search(only, stem): save(stem, fn())
    print('composed', len([s for s in PLAN if re.search(only, s)]), 'of', len(SLOTS), 'slots')
