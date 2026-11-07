#!/usr/bin/env python3
"""One bird sprite family for all 120 bird cards: a flat-vector side-view bird (Kenney flat style: no outlines,
soft flat colour, big friendly eye), built from per-species shape parameters and recoloured per species,
standing on a habitat scene (forest branch, meadow post, wetland bank). Writes SVG; render with render.js."""
import math

def hx(c): c = c.lstrip('#'); return tuple(int(c[i:i + 2], 16) for i in (0, 2, 4))
def hexs(t): return '#%02x%02x%02x' % tuple(max(0, min(255, int(v))) for v in t)
def mix(a, b, t): a, b = hx(a), hx(b); return hexs(tuple(a[i] + (b[i] - a[i]) * t for i in range(3)))
def dk(c, t=.2): return mix(c, '#000000', t)
def lt(c, t=.2): return mix(c, '#ffffff', t)

TINT = {'amber': '#e0a030', 'ashen': '#9a9a9a', 'bramble': '#7a3e5a', 'briar': '#a0524a', 'cinder': '#5a4a48', 'clover': '#5aa05a',
        'cobalt': '#3a5ab0', 'copper': '#c0703a', 'dawn': '#f0a08a', 'dusk': '#6a5a8a', 'ember': '#d0502a', 'fern': '#5a9a4a',
        'gilded': '#d8b040', 'hazel': '#9a6a3a', 'hollow': '#6a5a4a', 'juniper': '#4a7a6a', 'lantern': '#f0b040', 'larch': '#8aa04a',
        'marsh': '#5a8a7a', 'meadow': '#b0b050', 'mist': '#b0c0c8', 'moss': '#6a8a3a', 'nettle': '#5a7a3a', 'opal': '#c0d8e0',
        'pebble': '#9a9088', 'pine': '#3a6a4a', 'quill': '#8a8070', 'rush': '#7a8a4a', 'russet': '#a0502a', 'rust': '#a85a2a',
        'saffron': '#f0b030', 'sedge': '#8a9a5a', 'silver': '#c0c4c8', 'slate': '#5a6a7a', 'smoke': '#8a8a90', 'sorrel': '#b0603a',
        'storm': '#4a5a6a', 'sun': '#f0c040', 'thistle': '#9a6aa0', 'tidal': '#3a7a9a', 'umber': '#6a4a2a', 'velvet': '#6a2a4a',
        'willow': '#9ab06a', 'wisp': '#d0d4d8'}

# body, belly, wing, head, beak, leg colours + shape. size 1 = songbird.
D = dict(size=1.0, rx=78, ry=56, tilt=18, neck=0, head=40, beak='cone', bl=26, tail='short', tl=70, legs=26, cap=None, mask=None,
         crest=None, breast=None, wingtip=None, eye='norm', ring=None, belly=None, bib=None, stance='perch')
S = {
 'warbler': dict(body='#8a9a3a', belly='#f2dc3a', wing='#6a7a2a', headc='#9aaa40', beakc='#4a4a3a', beak='thin', size=.82),
 'woodpecker': dict(body='#2a2a2e', belly='#f4f4f0', wing='#1e1e22', headc='#f4f4f0', cap='#d8302a', beakc='#3a3a3a', beak='dagger', bl=40, mask='#2a2a2e', tail='stiff', tilt=55, stance='trunk'),
 'nuthatch': dict(body='#7a8ea8', belly='#d07a4a', wing='#5a6e88', headc='#7a8ea8', mask='#2a2a36', beakc='#3a3a44', beak='dagger', bl=32, tilt=-8, tail='short', tl=50, size=.88),
 'owl': dict(body='#8a6a4a', belly='#efe2c6', wing='#6e523a', headc='#8a6a4a', beakc='#d8a040', beak='hook', bl=18, eye='owl', tilt=75, rx=74, ry=70, head=56, tail='short', tl=40, breast='speck', crest='tufts', size=1.1),
 'jay': dict(body='#3a7ad8', belly='#eef2f8', wing='#2a5ab8', headc='#3a7ad8', crest='point', beakc='#2a2a2e', mask='#1e2a44', wingtip='#ffffff', tail='long', tl=95, size=1.02),
 'thrush': dict(body='#8a5a3a', belly='#f2e4c8', wing='#6e4428', headc='#8a5a3a', beakc='#5a4a3a', beak='thin', breast='speck', size=.95),
 'tanager': dict(body='#e02a2a', belly='#e8302e', wing='#1e1e22', headc='#e02a2a', beakc='#9a9a8a', wingtip=None, tail='short', size=.9),
 'kinglet': dict(body='#8a9a5a', belly='#e4e8c8', wing='#5a6a3a', headc='#8a9a5a', cap='#f2c020', beakc='#2a2a2e', beak='thin', bl=16, size=.68, rx=72, ry=58),
 'treecreeper': dict(body='#8a6a4a', belly='#f4efe4', wing='#6a4e34', headc='#8a6a4a', beakc='#4a3a2a', beak='curve', bl=40, breast='streakback', tilt=50, tail='stiff', stance='trunk', size=.82),
 'vireo': dict(body='#8a9a80', belly='#eef0e4', wing='#6a7a60', headc='#7a8a86', ring='#ffffff', beakc='#4a4a4a', beak='thin', size=.85),
 'lark': dict(body='#b08a5a', belly='#f2e6cc', wing='#8a6a42', headc='#b08a5a', crest='point', beakc='#7a6a5a', beak='thin', breast='streak', size=.92),
 'pipit': dict(body='#b89a6a', belly='#f4e8cc', wing='#8a7048', headc='#b89a6a', beakc='#6a5a4a', beak='thin', breast='streak', size=.86, tail='long', tl=80),
 'bunting': dict(body='#a8603a', belly='#f2e6d4', wing='#7a4428', headc='#c8a07a', beakc='#8a8a8a', beak='cone', bl=20, size=.86),
 'quail': dict(body='#8a6a4a', belly='#c8a882', wing='#6e523a', headc='#6a5a4a', crest='plume', beakc='#3a3a3a', bl=16, breast='speck', tilt=2, rx=86, ry=64, tail='none', legs=20, stance='ground', size=.95),
 'kestrel': dict(body='#c8703a', belly='#f4e2cc', wing='#6a80a8', headc='#7a8ab0', beakc='#3a4a5a', beak='hook', bl=22, mask='#2a2a36', breast='speck', tail='long', tl=92, tilt=40, size=1.05),
 'harrier': dict(body='#b8bcc4', belly='#eef0f4', wing='#a0a6b0', headc='#b8bcc4', beakc='#2a2a2e', beak='hook', bl=22, wingtip='#1e1e22', tail='long', tl=100, tilt=30, size=1.12),
 'meadowlark': dict(body='#a8885a', belly='#f2d22a', wing='#806440', headc='#a8885a', bib='#1e1e22', beakc='#8a8070', beak='dagger', bl=32, breast=None, size=.95),
 'finch': dict(body='#a8805a', belly='#f2e0d0', wing='#7a5a3a', headc='#d84a5a', beakc='#9a8a7a', beak='cone', bl=22, breast='streak', size=.82),
 'shrike': dict(body='#9aa0a8', belly='#f4f4f4', wing='#2a2a2e', headc='#9aa0a8', mask='#1e1e22', beakc='#1e1e22', beak='hook', bl=22, tail='long', tl=90, size=.95),
 'dove': dict(body='#b8a8a0', belly='#e8cfc8', wing='#a09088', headc='#b0a8a8', beakc='#3a3a3a', beak='thin', bl=18, tail='long', tl=85, head=34, size=1.0),
 'heron': dict(body='#7a8a9a', belly='#d8dee4', wing='#5a6a7a', headc='#e8ecef', cap='#1e1e22', beakc='#e8b030', beak='dagger', bl=70, neck=120, legs=120, legc='#c8a040', tilt=10, tail='short', tl=40, stance='wade', size=1.0, head=30),
 'rail': dict(body='#8a6a4a', belly='#8a96a4', wing='#6a4e34', headc='#7a6a5a', beakc='#d8402a', beak='dagger', bl=46, legs=50, legc='#c8603a', tail='cock', tl=40, tilt=8, stance='ground', size=.9, breast='barflank'),
 'grebe': dict(body='#2a2a30', belly='#9a3a2a', wing='#1e1e22', headc='#1e1e22', beakc='#1e1e22', beak='dagger', bl=30, crest='ear', tail='none', legs=0, stance='swim', tilt=0, rx=90, ry=48, ring='#d83a2a', size=1.0),
 'teal': dict(body='#9a9aa0', belly='#e8dccc', wing='#7a7a80', headc='#a8502a', mask='#2a8a5a', beakc='#3a3a3e', beak='duck', bl=34, tail='duck', legs=0, stance='swim', tilt=0, rx=92, ry=50, size=1.0, wingtip='#2a8a5a'),
 'plover': dict(body='#b89a74', belly='#f8f6f2', wing='#9a7e5a', headc='#b89a74', bib='#1e1e22', beakc='#e8902a', beak='thin', bl=16, legs=48, legc='#e8902a', tail='short', tl=40, stance='ground', ring='#e8902a', size=.85, tilt=4),
 'kingfisher': dict(body='#1a8ad0', belly='#e8782a', wing='#106aaa', headc='#1a8ad0', beakc='#1e1e22', beak='dagger', bl=56, head=44, tail='short', tl=34, legs=12, legc='#d8402a', tilt=20, size=.92, mask='#e8782a'),
 'bittern': dict(body='#b08a5a', belly='#e8d4a8', wing='#8a6a42', headc='#b08a5a', cap='#3a2a1e', beakc='#d8b040', beak='dagger', bl=52, neck=90, legs=60, legc='#a0b050', tilt=70, breast='streak', stance='wade', size=.98, head=30),
 'sandpiper': dict(body='#8a8278', belly='#f4f2ee', wing='#6e665c', headc='#8a8278', beakc='#2a2a2e', beak='dagger', bl=40, legs=60, legc='#6a6a50', breast='speck', tail='short', tl=40, stance='wade', tilt=0, size=.82),
 'tern': dict(body='#e8eef2', belly='#ffffff', wing='#c8d2da', headc='#ffffff', cap='#1e1e22', beakc='#d8402a', beak='dagger', bl=44, tail='fork', tl=100, legs=16, legc='#d8402a', tilt=12, size=1.0),
 'coot': dict(body='#2a2a30', belly='#3a3a42', wing='#1e1e24', headc='#1e1e24', beakc='#f4f4f0', beak='shield', bl=26, tail='none', legs=0, stance='swim', rx=84, ry=56, tilt=0, size=.95, eye='red'),
 'swallow': dict(body='#1e3a6a', belly='#f2e2cc', wing='#162c52', headc='#1e3a6a', mask='#c84a2a', beakc='#1e1e22', beak='thin', bl=12, tail='fork', tl=120, tilt=8, rx=70, ry=44, size=.86),
 'crane': dict(body='#9aa0a8', belly='#c8ccd2', wing='#7a8088', headc='#1e1e22', cap='#d8302a', beakc='#4a4a40', beak='dagger', bl=56, neck=130, legs=130, legc='#2a2a2e', tail='bustle', tilt=6, stance='wade', size=1.0, head=30),
 'hawk': dict(body='#7a5236', belly='#f2e2cc', wing='#5e3e28', headc='#7a5236', beakc='#2a2a2e', beak='hook', bl=26, tail='long', tl=96, tailc='#b8502a', breast='speck', tilt=40, size=1.15),
 'wren': dict(body='#8a6040', belly='#c8a07a', wing='#6e4a30', headc='#8a6040', beakc='#4a3a2a', beak='thin', bl=24, tail='cock', tl=56, rx=66, ry=58, size=.72, breast='barflank'),
 'crow': dict(body='#1e1e26', belly='#262632', wing='#14141c', headc='#1e1e26', beakc='#1e1e22', beak='dagger', bl=40, tail='long', tl=88, size=1.12, sheen='#3a4a8a'),
 'sparrow': dict(body='#9a6a42', belly='#d8d4cc', wing='#7a4e2c', headc='#a8a8a8', cap='#8a4a2a', beakc='#5a4a3a', beak='cone', bl=20, breast='streakback', size=.82, bib='#2a2a2a'),
 'waxwing': dict(body='#b89a7a', belly='#e0cc9a', wing='#8a7a6a', headc='#b89a7a', crest='point', mask='#1e1e22', beakc='#2a2a2e', beak='cone', bl=18, tail='short', tailtip='#f2c020', size=.9),
 'oriole': dict(body='#f0802a', belly='#f6902e', wing='#1e1e22', headc='#1e1e22', beakc='#7a7a80', beak='dagger', bl=28, wingtip='#ffffff', size=.92),
 'swift': dict(body='#3e3430', belly='#4a403a', wing='#2a221e', headc='#3e3430', beakc='#1e1e22', beak='thin', bl=10, tail='fork', tl=60, wing_long=True, rx=70, ry=40, tilt=10, size=.95),
 'egret': dict(body='#fafafa', belly='#ffffff', wing='#eceff2', headc='#ffffff', beakc='#e8c030', beak='dagger', bl=66, neck=125, legs=125, legc='#1e1e22', tail='plumes', tilt=8, stance='wade', size=1.0, head=28),
}

HAB = {'forest': ('warbler woodpecker nuthatch owl jay thrush tanager kinglet treecreeper vireo hawk wren crow sparrow waxwing oriole').split(),
       'grassland': ('lark pipit bunting quail kestrel harrier meadowlark finch shrike dove swift').split(),
       'wetland': ('heron rail grebe teal plover kingfisher bittern sandpiper tern coot swallow crane egret').split()}
HAB_OF = {sp: h for h, l in HAB.items() for sp in l}

FEET = {}
def rot(x, y, a):
    c, s = math.cos(math.radians(a)), math.sin(math.radians(a)); return x * c - y * s, x * s + y * c

def scene(h, tint, seed):
    import random
    r = random.Random(seed); o = []
    if h == 'forest':
        sky = mix('#d8ead0', tint, .12); o.append(f'<rect width="512" height="512" fill="{sky}"/>')
        for layer, (col, y0, sc) in enumerate([(mix('#b4d4a8', tint, .1), 300, .8), (mix('#8fbf86', tint, .08), 360, 1.1)]):
            x = -40 + r.uniform(0, 60)
            while x < 560:
                w = 70 * sc; ht = 190 * sc
                for k in range(3):
                    yy = y0 - k * ht * .28
                    o.append(f'<path d="M{x:.0f} {yy - ht * .45:.0f} L{x + w / 2 * (1 - k * .18):.0f} {yy:.0f} L{x - w / 2 * (1 - k * .18):.0f} {yy:.0f}Z" fill="{col}"/>')
                o.append(f'<rect x="{x - 6:.0f}" y="{y0:.0f}" width="12" height="{440 - y0:.0f}" fill="{col}"/>')
                x += r.uniform(70, 120) * sc
        o.append(f'<rect y="440" width="512" height="72" fill="{mix("#6fa864", tint, .08)}"/>')
    elif h == 'grassland':
        sky = mix('#f6eccc', tint, .12); o.append(f'<rect width="512" height="512" fill="{sky}"/>')
        o.append(f'<circle cx="410" cy="110" r="46" fill="{lt("#f6d878", .2)}"/>')
        o.append(f'<path d="M0 330 Q130 280 260 320 T512 300 V512 H0Z" fill="{mix("#e2cc84", tint, .08)}"/>')
        o.append(f'<path d="M0 390 Q160 350 300 385 T512 370 V512 H0Z" fill="{mix("#d2b25a", tint, .08)}"/>')
        for k in range(26):
            x = r.uniform(0, 512); y = r.uniform(420, 512); ht = r.uniform(30, 60)
            o.append(f'<path d="M{x:.0f} {y:.0f} q-4 -{ht * .6:.0f} -10 -{ht:.0f} M{x:.0f} {y:.0f} q4 -{ht * .6:.0f} 9 -{ht * .9:.0f}" stroke="{dk("#c8a44a", .15)}" stroke-width="4" fill="none" stroke-linecap="round"/>')
        for k in range(10):
            x = r.uniform(0, 512); y = r.uniform(400, 500)
            o.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="6" fill="{r.choice(["#ffffff", "#e8604c", "#f6d65c", "#b88ad8"])}"/>')
    else:
        sky = mix('#dcecf2', tint, .12); o.append(f'<rect width="512" height="512" fill="{sky}"/>')
        o.append(f'<path d="M0 300 Q120 270 250 292 T512 280 V340 H0Z" fill="{mix("#a8c8a0", tint, .1)}"/>')
        o.append(f'<rect y="330" width="512" height="182" fill="{mix("#7fb4d6", tint, .08)}"/>')
        for k in range(9):
            y = 350 + k * 18; x = r.uniform(0, 400)
            o.append(f'<path d="M{x:.0f} {y} h{r.uniform(40, 110):.0f}" stroke="{lt("#7fb4d6", .35)}" stroke-width="5" stroke-linecap="round"/>')
        for x0 in (20, 470):
            for k in range(6):
                x = x0 + r.uniform(-24, 24); ht = r.uniform(140, 230)
                o.append(f'<path d="M{x:.0f} 360 q6 -{ht / 2:.0f} {r.uniform(-14, 14):.0f} -{ht:.0f}" stroke="#4f8a5a" stroke-width="7" fill="none" stroke-linecap="round"/>')
                if k % 2: o.append(f'<rect x="{x - 7:.0f}" y="{360 - ht * .8:.0f}" width="14" height="38" rx="7" fill="#8a5a33"/>')
    return ''.join(o)

def perch(h, stance, fy, fx):
    """Return svg for what the feet stand on, at foot y fy."""
    if stance == 'swim': return ''  # water drawn after the body
    if stance == 'trunk':
        return f'<rect x="{fx - 64:.0f}" y="0" width="70" height="512" fill="#7a5236"/><rect x="{fx - 50:.0f}" y="0" width="12" height="512" fill="#8e6444"/>' \
               f'<rect x="{fx - 26:.0f}" y="0" width="8" height="512" fill="#6a4630"/>'
    if stance == 'wade':
        return f'<ellipse cx="{fx:.0f}" cy="{fy:.0f}" rx="70" ry="9" fill="none" stroke="#ffffff" stroke-opacity=".6" stroke-width="4"/>'
    if stance == 'ground':
        g = {'forest': '#6fa864', 'grassland': '#c8a44a', 'wetland': '#a89a74'}[h]
        return f'<ellipse cx="{fx:.0f}" cy="{fy + 18:.0f}" rx="150" ry="34" fill="{g}"/><ellipse cx="{fx:.0f}" cy="{fy + 4:.0f}" rx="60" ry="8" fill="#000" fill-opacity=".12"/>'
    if h == 'forest':
        leaves = ''.join(f'<ellipse cx="{x}" cy="{fy + dy}" rx="24" ry="11" transform="rotate({a} {x} {fy + dy})" fill="{c}"/>'
                         for x, dy, a, c in [(60, -14, -30, '#4f9a4a'), (96, 10, 20, '#3f8a3e'), (420, -10, 30, '#4f9a4a'), (460, 12, -20, '#3f8a3e'), (380, 14, 10, '#5aa852')])
        return f'<path d="M-10 {fy + 6:.0f} Q256 {fy - 10:.0f} 522 {fy + 2:.0f} L522 {fy + 28:.0f} Q256 {fy + 16:.0f} -10 {fy + 34:.0f}Z" fill="#7a5236"/>' \
               f'<path d="M-10 {fy + 6:.0f} Q256 {fy - 10:.0f} 522 {fy + 2:.0f} L522 {fy + 10:.0f} Q256 {fy - 2:.0f} -10 {fy + 14:.0f}Z" fill="#94a84a"/>' + leaves
    if h == 'grassland':
        return f'<rect x="{fx - 34:.0f}" y="{fy:.0f}" width="68" height="{520 - fy:.0f}" rx="6" fill="#9a6e44"/><rect x="{fx - 34:.0f}" y="{fy:.0f}" width="68" height="12" rx="6" fill="#b88a5a"/>' \
               f'<rect x="{fx - 34:.0f}" y="{fy + 40:.0f}" width="68" height="6" fill="#7a5434"/>'
    return f'<path d="M{fx - 150:.0f} {fy + 70:.0f} Q{fx:.0f} {fy - 12:.0f} {fx + 150:.0f} {fy + 70:.0f}Z" fill="#8a7a5a"/><path d="M{fx - 110:.0f} {fy + 40:.0f} Q{fx:.0f} {fy - 6:.0f} {fx + 110:.0f} {fy + 40:.0f}" stroke="#a89a74" stroke-width="10" fill="none"/>'

def bird_svg(sp, variant, seed=1, bare=False):
    p = dict(D); p.update(S[sp]); tint = TINT.get(variant, '#888888'); h = HAB_OF[sp]
    k = p['size']; tv = .14
    body = mix(p['body'], tint, tv); wing = mix(p['wing'], tint, tv); belly = mix(p['belly'], tint, tv * .5); headc = mix(p['headc'], tint, tv * .7)
    rx, ry, a = p['rx'] * k, p['ry'] * k, -p['tilt']
    neck = p['neck'] * k; legs = p['legs'] * k; hr = p['head'] * k
    stance = p['stance']
    # vertical budget: centre the whole bird
    top = ry + neck + hr * 2; bot = ry * .8 + legs
    cy = 250 + (top - bot) * .35 if stance != 'swim' else 300
    cx = 236 if stance != 'trunk' else 290
    o = [] if bare else [scene(h, tint, seed + sum(map(ord, sp)) % 97)]
    fy = cy + ry * .85 + legs
    if stance == 'swim': fy = cy + ry * .4
    topY = cy - ry - neck - hr * 2.2 - (hr * .9 if p['crest'] in ('plume', 'point', 'tufts') else 0)
    Hb = fy - topY; Wb = rx * 1.7 + p['tl'] * k * .8 + p['bl'] * k + hr
    Z = min(1.75, (395 if stance == 'wade' else 330) / Hb, 400 / Wb)
    midx = cx + (p['bl'] * k + hr - p['tl'] * k * .7 - rx * .5) / 2
    fy2 = min(482 if stance in ('wade', 'swim') else 455, 262 + Z * Hb / 2)
    cx2 = 256 - (midx - cx) * Z if stance != 'trunk' else cx
    if stance == 'trunk': Z = min(Z, 1.5)
    if not bare: o.append(perch(h, stance, fy2, cx2 + (- 30 * Z if stance == 'trunk' else 0)))
    FEET[sp] = fy2
    o.append(f'<g transform="translate({cx2:.1f} {fy2:.1f}) scale({Z:.3f}) translate({-cx:.1f} {-fy:.1f})">')
    g = []
    # tail (behind body) in body-local coords, rotated by tilt
    tl = p['tl'] * k; tc = p.get('tailc') or wing
    def P(x, y): X, Y = rot(x, y, a); return f'{cx + X:.1f} {cy + Y:.1f}'
    t = p['tail']
    if t in ('short', 'long', 'stiff'):
        w = ry * (.42 if t != 'stiff' else .3)
        g.append(f'<path d="M{P(-rx * .6, -w)} L{P(-rx * .6 - tl, -w * .55)} L{P(-rx * .6 - tl, w * .55)} L{P(-rx * .6, w)}Z" fill="{tc}"/>')
        if p.get('tailtip'): g.append(f'<path d="M{P(-rx * .6 - tl * .82, -w * .6)} L{P(-rx * .6 - tl, -w * .55)} L{P(-rx * .6 - tl, w * .55)} L{P(-rx * .6 - tl * .82, w * .6)}Z" fill="{p["tailtip"]}"/>')
    elif t == 'fork':
        w = ry * .35
        g.append(f'<path d="M{P(-rx * .6, -w)} L{P(-rx * .6 - tl, -w * 1.3)} L{P(-rx * .6 - tl * .55, 0)} L{P(-rx * .6 - tl, w * 1.3)} L{P(-rx * .6, w)}Z" fill="{tc}"/>')
    elif t == 'cock':
        g.append(f'<path d="M{P(-rx * .7, -ry * .1)} L{P(-rx * .9, -ry - tl * .8)} L{P(-rx * .55, -ry - tl * .7)} L{P(-rx * .3, -ry * .2)}Z" fill="{tc}"/>')
    elif t == 'duck':
        g.append(f'<path d="M{P(-rx * .8, -ry * .2)} L{P(-rx * 1.18, -ry * .55)} L{P(-rx * .8, ry * .3)}Z" fill="{dk(body, .25)}"/>')
    elif t in ('bustle', 'plumes'):
        c = dk(body, .1) if t == 'bustle' else '#ffffff'
        for i in range(4):
            g.append(f'<path d="M{P(-rx * .5, -ry * .2)} Q{P(-rx * 1.1, -ry * .1 + i * 10)} {P(-rx * 1.3 - i * 6, ry * .5 + i * 12)}" stroke="{c}" stroke-width="{10 * k:.0f}" fill="none" stroke-linecap="round"/>')
    # legs
    if legs > 0:
        lc = p.get('legc', '#5a4a3a')
        for dx in (-rx * .12, rx * .14):
            X, Y = rot(dx, ry * .6, a)
            g.append(f'<path d="M{cx + X:.1f} {cy + Y:.1f} L{cx + X:.1f} {fy:.1f}" stroke="{lc}" stroke-width="{max(5, 8 * k):.0f}" stroke-linecap="round"/>')
            g.append(f'<path d="M{cx + X - 12:.1f} {fy:.1f} L{cx + X + 16:.1f} {fy:.1f}" stroke="{lc}" stroke-width="{max(5, 7 * k):.0f}" stroke-linecap="round"/>')
    # neck
    hx0, hy0 = rot(rx * .62, -ry * .55 - neck, a) if not neck else (rx * .5 + 10 * k, -ry * .4 - neck)
    if neck:
        nx, ny = rot(rx * .5, -ry * .3, a)
        g.append(f'<path d="M{cx + nx:.1f} {cy + ny:.1f} Q{cx + hx0 - 40 * k:.1f} {cy + (ny + hy0) / 2:.1f} {cx + hx0:.1f} {cy + hy0:.1f}" stroke="{body}" stroke-width="{hr * 1.05:.0f}" fill="none" stroke-linecap="round"/>')
        g.append(f'<path d="M{cx + nx + 6:.1f} {cy + ny:.1f} Q{cx + hx0 - 30 * k:.1f} {cy + (ny + hy0) / 2:.1f} {cx + hx0 + 4:.1f} {cy + hy0:.1f}" stroke="{belly}" stroke-width="{hr * .4:.0f}" fill="none" stroke-linecap="round"/>')
    # body + belly
    g.append(f'<g transform="translate({cx} {cy}) rotate({a})"><clipPath id="bc"><ellipse rx="{rx:.1f}" ry="{ry:.1f}"/></clipPath>'
             f'<ellipse rx="{rx:.1f}" ry="{ry:.1f}" fill="{body}"/>'
             f'<g clip-path="url(#bc)"><ellipse cx="{rx * .25:.1f}" cy="{ry * .55:.1f}" rx="{rx * .95:.1f}" ry="{ry * .75:.1f}" fill="{belly}"/>')
    br = p['breast']
    if br == 'speck':
        for i in range(14):
            x = rx * (.0 + (i % 5) * .16); y = ry * (.2 + (i // 5) * .22)
            g.append(f'<ellipse cx="{x:.1f}" cy="{y:.1f}" rx="{5 * k:.1f}" ry="{6 * k:.1f}" fill="{dk(p["body"], .1)}"/>')
    elif br in ('streak', 'streakback'):
        for i in range(10):
            x = rx * (-.3 + (i % 5) * .2); y = ry * (.1 + (i // 5) * .3) if br == 'streak' else -ry * (.2 + (i // 5) * .3)
            g.append(f'<rect x="{x:.1f}" y="{y:.1f}" width="{5 * k:.1f}" height="{16 * k:.1f}" rx="{2.5 * k:.1f}" fill="{dk(p["body"], .2) if br == "streak" else lt(p["body"], .35)}"/>')
    elif br == 'barflank':
        for i in range(5):
            g.append(f'<rect x="{-rx * .5 + i * rx * .2:.1f}" y="{ry * .35:.1f}" width="{7 * k:.1f}" height="{ry * .5:.1f}" fill="{lt(p["body"], .45)}"/>')
    if p.get('bib'): g.append(f'<path d="M{rx * .55:.1f} {-ry * .3:.1f} L{rx * .85:.1f} {-ry * .1:.1f} L{rx * .5:.1f} {ry * .25:.1f}Z" fill="{p["bib"]}"/>')
    g.append('</g>')
    # wing
    wl = rx * (1.25 if p.get('wing_long') else .95)
    g.append(f'<path d="M{rx * .45:.1f} {-ry * .35:.1f} Q{-rx * .1:.1f} {-ry * .75:.1f} {-wl:.1f} {ry * .05:.1f} Q{-rx * .1:.1f} {ry * .45:.1f} {rx * .38:.1f} {ry * .15:.1f}Z" fill="{wing}"/>')
    g.append(f'<path d="M{rx * .3:.1f} {-ry * .2:.1f} Q{-rx * .1:.1f} {-ry * .4:.1f} {-rx * .55:.1f} {ry * .0:.1f}" stroke="{lt(wing, .18)}" stroke-width="{4 * k:.1f}" fill="none" stroke-linecap="round"/>')
    if p.get('wingtip'):
        g.append(f'<path d="M{-wl * .55:.1f} {-ry * .14:.1f} L{-wl:.1f} {ry * .05:.1f} L{-wl * .55:.1f} {ry * .2:.1f}Z" fill="{p["wingtip"]}"/>')
    if p.get('sheen'): g.append(f'<path d="M{rx * .2:.1f} {-ry * .45:.1f} Q{-rx * .2:.1f} {-ry * .6:.1f} {-rx * .6:.1f} {-ry * .1:.1f}" stroke="{p["sheen"]}" stroke-width="{6 * k:.1f}" fill="none" stroke-linecap="round" opacity=".7"/>')
    g.append('</g>')
    # head (upright, not rotated)
    HX, HY = cx + hx0, cy + hy0
    if not neck:
        HX, HY = cx + rot(rx * .7, -ry * .45, a)[0], cy + rot(rx * .7, -ry * .45, a)[1] - hr * .35
    # beak
    bl = p['bl'] * k; bc = p['beakc']; bt = p['beak']; by = HY + hr * .08
    bx = HX + hr * .82
    if bt == 'cone': g.append(f'<path d="M{bx - 4:.1f} {by - hr * .32:.1f} L{bx + bl:.1f} {by:.1f} L{bx - 4:.1f} {by + hr * .3:.1f}Z" fill="{bc}"/>')
    elif bt == 'thin': g.append(f'<path d="M{bx - 4:.1f} {by - hr * .16:.1f} L{bx + bl:.1f} {by + 2:.1f} L{bx - 4:.1f} {by + hr * .16:.1f}Z" fill="{bc}"/>')
    elif bt == 'dagger': g.append(f'<path d="M{bx - 6:.1f} {by - hr * .2:.1f} L{bx + bl:.1f} {by + 1:.1f} L{bx - 6:.1f} {by + hr * .18:.1f}Z" fill="{bc}"/><path d="M{bx - 6:.1f} {by:.1f} L{bx + bl * .9:.1f} {by + 1:.1f}" stroke="{dk(bc, .25)}" stroke-width="2"/>')
    elif bt == 'hook': g.append(f'<path d="M{bx - 6:.1f} {by - hr * .32:.1f} Q{bx + bl:.1f} {by - hr * .34:.1f} {bx + bl * .8:.1f} {by + hr * .32:.1f} Q{bx + bl * .3:.1f} {by + hr * .05:.1f} {bx - 6:.1f} {by + hr * .26:.1f}Z" fill="{bc}"/><path d="M{bx - 8:.1f} {by - hr * .34:.1f} h{bl * .4:.1f} v{hr * .2:.1f} h-{bl * .4:.1f}Z" fill="#f2c040"/>')
    elif bt == 'curve': g.append(f'<path d="M{bx - 4:.1f} {by - hr * .14:.1f} Q{bx + bl * .7:.1f} {by - hr * .2:.1f} {bx + bl:.1f} {by + hr * .45:.1f} Q{bx + bl * .6:.1f} {by + hr * .06:.1f} {bx - 4:.1f} {by + hr * .14:.1f}Z" fill="{bc}"/>')
    elif bt == 'duck': g.append(f'<path d="M{bx - 8:.1f} {by - hr * .22:.1f} L{bx + bl:.1f} {by - hr * .06:.1f} Q{bx + bl + 6:.1f} {by + hr * .2:.1f} {bx + bl - 4:.1f} {by + hr * .22:.1f} L{bx - 8:.1f} {by + hr * .2:.1f}Z" fill="{bc}"/>')
    elif bt == 'shield': g.append(f'<path d="M{bx - 6:.1f} {by - hr * .26:.1f} L{bx + bl:.1f} {by + 2:.1f} L{bx - 6:.1f} {by + hr * .24:.1f}Z" fill="{bc}"/><ellipse cx="{bx - 6:.1f}" cy="{by - hr * .4:.1f}" rx="{hr * .2:.1f}" ry="{hr * .32:.1f}" fill="{bc}"/>')
    # crest behind head
    cr = p['crest']
    if cr == 'point': g.append(f'<path d="M{HX - hr * .1:.1f} {HY - hr * .8:.1f} L{HX - hr * 1.15:.1f} {HY - hr * 1.15:.1f} L{HX - hr * .7:.1f} {HY - hr * .3:.1f}Z" fill="{p.get("cap") or headc}"/>')
    elif cr == 'plume': g.append(f'<path d="M{HX:.1f} {HY - hr * .8:.1f} Q{HX + hr * .3:.1f} {HY - hr * 1.9:.1f} {HX + hr * .9:.1f} {HY - hr * 1.5:.1f}" stroke="#2a2a2e" stroke-width="{7 * k:.1f}" fill="none" stroke-linecap="round"/><circle cx="{HX + hr * .9:.1f}" cy="{HY - hr * 1.5:.1f}" r="{8 * k:.1f}" fill="#2a2a2e"/>')
    elif cr == 'tufts':
        for s_ in (-1, 1): g.append(f'<path d="M{HX + s_ * hr * .35:.1f} {HY - hr * .75:.1f} L{HX + s_ * hr * .75:.1f} {HY - hr * 1.35:.1f} L{HX + s_ * hr * .8:.1f} {HY - hr * .5:.1f}Z" fill="{dk(headc, .1)}"/>')
    g.append(f'<circle cx="{HX:.1f}" cy="{HY:.1f}" r="{hr:.1f}" fill="{headc}"/>')
    if p.get('cap'): g.append(f'<path d="M{HX - hr:.1f} {HY - hr * .05:.1f} A{hr:.1f} {hr:.1f} 0 0 1 {HX + hr:.1f} {HY - hr * .05:.1f} Q{HX:.1f} {HY - hr * .45:.1f} {HX - hr:.1f} {HY - hr * .05:.1f}Z" fill="{p["cap"]}"/>')
    if cr == 'ear': g.append(f'<path d="M{HX - hr * .2:.1f} {HY - hr * .1:.1f} L{HX - hr * 1.3:.1f} {HY - hr * .6:.1f} L{HX - hr * 1.1:.1f} {HY + hr * .2:.1f}Z" fill="#e8b030"/>')
    if p.get('mask'): g.append(f'<path d="M{HX - hr * .7:.1f} {HY - hr * .05:.1f} Q{HX + hr * .2:.1f} {HY - hr * .45:.1f} {HX + hr * .95:.1f} {HY - hr * .02:.1f} Q{HX + hr * .2:.1f} {HY + hr * .25:.1f} {HX - hr * .7:.1f} {HY + hr * .18:.1f}Z" fill="{p["mask"]}"/>')
    if p.get('bib') and neck == 0 and sp in ('plover',): g.append(f'<rect x="{HX - hr * .9:.1f}" y="{HY + hr * .6:.1f}" width="{hr * 1.6:.1f}" height="{hr * .3:.1f}" rx="{hr * .15:.1f}" fill="{p["bib"]}"/>')
    # eye
    ex, ey = HX + hr * .35, HY - hr * .1
    if p['eye'] == 'owl':
        for s_ in (-1, 1):
            X = HX + s_ * hr * .42
            g.append(f'<circle cx="{X:.1f}" cy="{HY - hr * .05:.1f}" r="{hr * .42:.1f}" fill="#f4e6c6"/><circle cx="{X:.1f}" cy="{HY - hr * .05:.1f}" r="{hr * .27:.1f}" fill="#f0a020"/><circle cx="{X:.1f}" cy="{HY - hr * .05:.1f}" r="{hr * .14:.1f}" fill="#1e1e22"/><circle cx="{X + hr * .08:.1f}" cy="{HY - hr * .14:.1f}" r="{hr * .06:.1f}" fill="#fff"/>')
    else:
        er = hr * .27
        if p.get('ring'): g.append(f'<circle cx="{ex:.1f}" cy="{ey:.1f}" r="{er * 1.4:.1f}" fill="{p["ring"]}"/>')
        g.append(f'<circle cx="{ex:.1f}" cy="{ey:.1f}" r="{er:.1f}" fill="#ffffff"/><circle cx="{ex + er * .2:.1f}" cy="{ey:.1f}" r="{er * .62:.1f}" fill="{"#c8202a" if p["eye"] == "red" else "#26262c"}"/><circle cx="{ex + er * .38:.1f}" cy="{ey - er * .25:.1f}" r="{er * .22:.1f}" fill="#fff"/>')
    o.extend(g); o.append('</g>')
    fy, cx, rx = fy2, cx2, rx * Z
    if stance == 'swim' and not bare:
        o.append(f'<rect y="{fy:.0f}" width="512" height="{512 - fy:.0f}" fill="{mix("#7fb4d6", tint, .08)}" fill-opacity=".92"/>')
        o.append(f'<path d="M{cx - rx * 1.3:.0f} {fy + 4:.0f} h{rx * 2.6:.0f}" stroke="#ffffff" stroke-opacity=".7" stroke-width="5" stroke-linecap="round"/>')
        o.append(f'<path d="M{cx - rx:.0f} {fy + 26:.0f} h{rx * 1.6:.0f}" stroke="#ffffff" stroke-opacity=".45" stroke-width="4" stroke-linecap="round"/>')
    return '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">' + ''.join(o) + '</svg>'
