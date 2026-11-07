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

PLAN = {}
for k in SLOTS:
    if k in BUILD: PLAN[k] = (lambda k=k: building(k))
    elif k.startswith('tile-lore'): PLAN[k] = (lambda k=k: lore(k))
    elif k.startswith('tile-pas'): PLAN[k] = (lambda k=k: pasture(k))
PLAN.update({'tile-back': back, 'tile-barge': barge, 'ui-tile-frame': frame, 'ui-scroll': scroll,
             'token-banner-0': lambda: banner(0), 'token-banner-1': lambda: banner(1), 'token-banner-2': lambda: banner(2), 'token-banner-3': lambda: banner(3),
             'bg-title': lambda: scene('title'), 'bg-map': lambda: scene('map'), 'bg-table': table, 'ui-result-win': lambda: scene('win'),
             'ui-result-lose': lambda: scene('lose'), 'board-estate': board_estate, 'board-market': board_market})

if __name__ == '__main__':
    only = sys.argv[sys.argv.index('--only') + 1] if '--only' in sys.argv else '.'
    for stem, fn in PLAN.items():
        if re.search(only, stem): save(stem, fn())
    print('composed', len([s for s in PLAN if re.search(only, s)]), 'of', len(SLOTS), 'slots')
