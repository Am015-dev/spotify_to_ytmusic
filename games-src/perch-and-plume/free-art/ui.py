#!/usr/bin/env python3
"""Non-bird slots for perch-and-plume, same flat-vector family as birds.py (SVG -> render.js)."""
import math, random
from birds import mix, dk, lt, bird_svg, scene, TINT

WOOD, WOOD_D, WOOD_L = '#c8925a', '#9a6a3c', '#e2b47c'
CREAM, MOSS, INK = '#f3ead2', '#4f7a4a', '#3a3226'
HABC = {'F': '#4f8a4a', 'G': '#d2b25a', 'W': '#4a8cc4'}

def svg(w, h, body): return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">{body}</svg>'

def wood_disc(c=128, r=118):
    return (f'<circle cx="{c}" cy="{c + 6}" r="{r}" fill="{WOOD_D}"/><circle cx="{c}" cy="{c}" r="{r}" fill="{WOOD}"/>'
            f'<circle cx="{c}" cy="{c}" r="{r * .82}" fill="{WOOD_L}"/>'
            f'<path d="M{c - r * .6} {c - r * .25} q{r * .3} -{r * .12} {r * .6} 0 M{c - r * .2} {c + r * .5} q{r * .3} -{r * .1} {r * .6} 0" stroke="{WOOD}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".5"/>')

# ---- food pictures (centred at 0,0, ~ radius 70) ----
def f_grub(): return ('<g><path d="M-40 10 A45 45 0 1 1 30 40" stroke="#e8a088" stroke-width="40" fill="none" stroke-linecap="round"/>'
                      '<path d="M-40 10 A45 45 0 1 1 30 40" stroke="#d4846c" stroke-width="40" fill="none" stroke-dasharray="4 18" stroke-linecap="butt"/>'
                      '<circle cx="34" cy="40" r="22" fill="#8a4a3a"/><circle cx="40" cy="34" r="5" fill="#fff"/></g>')
def f_seed(): return ''.join(f'<ellipse cx="{x}" cy="{y}" rx="16" ry="26" transform="rotate({a} {x} {y})" fill="{c}"/><path d="M{x} {y - 18} v30" stroke="{dk(c, .2)}" stroke-width="3" transform="rotate({a} {x} {y})"/>'
                             for x, y, a, c in [(-30, 10, -30, '#e8bf4a'), (0, -18, 0, '#f2cf5a'), (30, 10, 30, '#e0b040'), (0, 30, 0, '#d8a83a')])
def f_fish(): return ('<path d="M-60 0 Q-10 -46 40 -6 L70 -34 L64 0 L70 34 L40 6 Q-10 46 -60 0Z" fill="#7aa8c8"/>'
                      '<path d="M-60 0 Q-10 46 40 6 L40 0 L-60 0Z" fill="#c8dce8"/><circle cx="-36" cy="-6" r="7" fill="#26262c"/><path d="M-14 -24 q8 24 0 48" stroke="#5a88a8" stroke-width="5" fill="none"/>')
def f_berry(): return ('<path d="M0 -60 Q8 -30 -6 -10 M0 -50 Q30 -40 34 -14 M0 -50 Q-30 -40 -34 -16" stroke="#6a4a2a" stroke-width="6" fill="none" stroke-linecap="round"/>'
                       '<ellipse cx="16" cy="-58" rx="20" ry="10" fill="#5a9a4a" transform="rotate(-20 16 -58)"/>'
                       + ''.join(f'<circle cx="{x}" cy="{y}" r="26" fill="#d8303a"/><circle cx="{x - 8}" cy="{y - 9}" r="7" fill="#f28890"/>' for x, y in [(-34, 6), (34, 4), (0, 34)]))
def f_rodent(): return ('<path d="M40 40 Q90 50 70 0" stroke="#d8a0a0" stroke-width="7" fill="none" stroke-linecap="round"/>'
                        '<ellipse cx="0" cy="16" rx="52" ry="40" fill="#9a9aa4"/><ellipse cx="-6" cy="30" rx="30" ry="22" fill="#c8c8d0"/>'
                        '<circle cx="-34" cy="-22" r="28" fill="#9a9aa4"/><circle cx="-20" cy="-50" r="18" fill="#9a9aa4"/><circle cx="-20" cy="-50" r="10" fill="#e8b0b0"/>'
                        '<circle cx="-50" cy="-44" r="14" fill="#9a9aa4"/><circle cx="-50" cy="-44" r="7" fill="#e8b0b0"/><circle cx="-42" cy="-24" r="5" fill="#26262c"/><circle cx="-62" cy="-14" r="6" fill="#e8909a"/>')
FOOD = {'grub': f_grub, 'seed': f_seed, 'fish': f_fish, 'berry': f_berry, 'rodent': f_rodent}

def food(kind):
    if kind == 'gs':
        inner = (f'<clipPath id="l"><rect x="-128" y="-128" width="128" height="256"/></clipPath><clipPath id="r"><rect x="0" y="-128" width="128" height="256"/></clipPath>'
                 f'<g clip-path="url(#l)"><g transform="translate(-28 0) scale(.72)">{f_grub()}</g></g><g clip-path="url(#r)"><g transform="translate(34 0) scale(.72)">{f_seed()}</g></g>'
                 f'<path d="M0 -84 V84" stroke="{WOOD_D}" stroke-width="5"/>')
    elif kind == 'any':
        inner = f'<g transform="translate(-30 -26) scale(.5)">{f_seed()}</g><g transform="translate(32 -22) scale(.5)">{f_berry()}</g><g transform="translate(0 36) scale(.55)">{f_fish()}</g>'
    else: inner = f'<g transform="scale(.95)">{FOOD[kind]()}</g>'
    return svg(256, 256, wood_disc() + f'<g transform="translate(128 128)">{inner}</g>')

def egg(sz=256, c='#bfe0ea'):
    s = sz / 256
    return svg(sz, sz, f'<g transform="scale({s})"><ellipse cx="132" cy="214" rx="64" ry="12" fill="#000" opacity=".12"/>'
               f'<path d="M128 30 C70 30 52 130 60 160 C70 205 100 216 128 216 C156 216 186 205 196 160 C204 130 186 30 128 30Z" fill="{c}"/>'
               f'<path d="M100 70 C84 96 80 120 82 140" stroke="#ffffff" stroke-width="12" fill="none" stroke-linecap="round" opacity=".7"/>'
               + ''.join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{dk(c, .35)}"/>' for x, y, r in [(150, 80, 6), (120, 120, 5), (165, 140, 7), (110, 170, 6), (145, 185, 4), (170, 105, 4), (95, 135, 3)]) + '</g>')

# ---- nests (128) ----
def nest(kind, sz=128):
    s = sz / 128
    if kind == 'bowl': b = ('<path d="M14 60 Q64 130 114 60Z" fill="#9a6a3c"/><path d="M14 60 Q64 72 114 60 Q64 50 14 60Z" fill="#5a3a22"/>'
                            + ''.join(f'<path d="M{18 + i * 10} {62 + (i % 3) * 8} q20 10 40 0" stroke="#c8925a" stroke-width="4" fill="none"/>' for i in range(7))
                            + '<ellipse cx="54" cy="58" rx="10" ry="13" fill="#bfe0ea"/><ellipse cx="74" cy="58" rx="10" ry="13" fill="#bfe0ea"/>')
    elif kind == 'cavity': b = '<rect x="30" y="4" width="68" height="124" rx="10" fill="#8a5a36"/><rect x="40" y="4" width="10" height="124" fill="#9e6c44"/><ellipse cx="64" cy="58" rx="22" ry="26" fill="#2a1c12"/><ellipse cx="64" cy="58" rx="22" ry="26" fill="none" stroke="#6a4226" stroke-width="6"/>'
    elif kind == 'ground': b = '<ellipse cx="64" cy="82" rx="58" ry="26" fill="#d8c08a"/><ellipse cx="64" cy="78" rx="38" ry="14" fill="#b89a64"/>' + ''.join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="#9a9088"/>' for x, y, r in [(16, 84, 7), (110, 86, 8), (30, 100, 6), (96, 102, 6)]) + '<ellipse cx="56" cy="72" rx="10" ry="12" fill="#e8dcc0"/><ellipse cx="74" cy="72" rx="10" ry="12" fill="#e8dcc0"/>'
    elif kind == 'platform': b = ''.join(f'<rect x="{6 + (i % 2) * 8}" y="{56 + i * 9}" width="{116 - (i % 2) * 16}" height="9" rx="4.5" fill="{["#8a5a36", "#a8784a", "#9a6a3c"][i % 3]}" transform="rotate({(i % 3 - 1) * 4} 64 {60 + i * 9})"/>' for i in range(5))
    else:  # star
        pts = ' '.join(f'{64 + (54 if i % 2 == 0 else 22) * math.cos(math.radians(-90 + i * 36)):.1f},{66 + (54 if i % 2 == 0 else 22) * math.sin(math.radians(-90 + i * 36)):.1f}' for i in range(10))
        b = f'<polygon points="{pts}" fill="#e8b830"/><polygon points="{pts}" fill="none" stroke="#a87a1a" stroke-width="5" stroke-linejoin="round"/>'
    return svg(sz, sz, f'<g transform="scale({s})">{b}</g>')

def mini_bird(col, x, y, s=1.0, flip=False):
    t = f'translate({x} {y}) scale({-s if flip else s} {s})'
    return (f'<g transform="{t}"><path d="M-30 4 L-58 -4 L-58 12Z" fill="{dk(col, .25)}"/><ellipse rx="34" ry="24" fill="{col}"/>'
            f'<path d="M14 -8 Q-10 -26 -40 2 Q-10 14 14 4Z" fill="{dk(col, .2)}"/><circle cx="26" cy="-22" r="18" fill="{col}"/>'
            f'<path d="M40 -26 L56 -20 L40 -14Z" fill="#e8a030"/><circle cx="30" cy="-25" r="5" fill="#fff"/><circle cx="31" cy="-25" r="3" fill="#26262c"/>'
            f'<path d="M-4 22 v14 M8 22 v14" stroke="#5a4a3a" stroke-width="4" stroke-linecap="round"/></g>')

def goal(kind):
    hab = kind.split('-')[-1] if kind.split('-')[0] in ('birds', 'eggs') else None
    base = HABC.get(hab, '#7a9a6a') if hab else {'sets': '#b8925a', 'total': '#6a8aa8'}.get(kind, '#8a7a5a')
    b = f'<circle cx="128" cy="134" r="118" fill="{dk(base, .3)}"/><circle cx="128" cy="128" r="118" fill="{base}"/><circle cx="128" cy="128" r="96" fill="{lt(base, .35)}"/>'
    if kind.startswith('birds'): b += mini_bird('#8a5a3a', 96, 128, 1.0) + mini_bird('#4a7ab0', 160, 118, .9, True)
    elif kind.startswith('eggs'): b += ''.join(f'<ellipse cx="{x}" cy="{y}" rx="26" ry="34" fill="#bfe0ea"/><ellipse cx="{x - 8}" cy="{y - 10}" rx="6" ry="10" fill="#fff" opacity=".7"/>' for x, y in [(96, 140), (160, 140), (128, 100)])
    elif kind.startswith('nest'):
        nk = kind.split('-')[1]; b += f'<g transform="translate(64 60)">' + nest(nk).split('>', 1)[1].rsplit('</svg>', 1)[0] + '</g>'
    elif kind == 'sets': b += ''.join(f'<rect x="58" y="{70 + i * 40}" width="140" height="32" rx="10" fill="{c}"/><ellipse cx="128" cy="{86 + i * 40}" rx="12" ry="15" fill="#bfe0ea"/>' for i, c in enumerate([HABC['F'], HABC['G'], HABC['W']]))
    else: b += mini_bird('#8a5a3a', 84, 140, .8) + mini_bird('#d8303a', 128, 104, .8) + mini_bird('#4a7ab0', 172, 140, .8, True)
    return svg(256, 256, b)

def frame(w, h, inset=14, col=MOSS):
    return (f'<rect width="{w}" height="{h}" rx="22" fill="{col}"/><rect x="{inset}" y="{inset}" width="{w - 2 * inset}" height="{h - 2 * inset}" rx="14" fill="{CREAM}"/>'
            f'<rect x="{inset + 10}" y="{inset + 10}" width="{w - 2 * inset - 20}" height="{h - 2 * inset - 20}" rx="10" fill="none" stroke="{col}" stroke-width="3" stroke-dasharray="2 0"/>')

def feather(x, y, s=1, rot=-30, c='#4a7ab0'):
    return (f'<g transform="translate({x} {y}) rotate({rot}) scale({s})"><path d="M0 -120 C40 -80 40 60 0 110 C-40 60 -40 -80 0 -120Z" fill="{c}"/>'
            f'<path d="M0 -120 C-40 -80 -40 60 0 110Z" fill="{dk(c, .15)}"/><path d="M0 -110 V150" stroke="{lt(c, .5)}" stroke-width="5" stroke-linecap="round"/>'
            + ''.join(f'<path d="M0 {-80 + i * 30} l{20 if i % 2 else -20} -14" stroke="{lt(c, .3)}" stroke-width="3"/>' for i in range(6)) + '</g>')

def laurel(cx, cy, r, c='#5a8a4a'):
    o = ''
    for side in (-1, 1):
        for i in range(9):
            a = math.radians(110 + i * 17); x = cx + side * r * math.cos(a) * -1; y = cy + r * math.sin(a) * -1 + r * .2
            ang = math.degrees(a) * side + (90 if side > 0 else -90)
            o += f'<ellipse cx="{x:.1f}" cy="{y:.1f}" rx="13" ry="26" transform="rotate({ang:.0f} {x:.1f} {y:.1f})" fill="{c if i % 2 else lt(c, .15)}"/>'
    return o

def card_back():
    return svg(500, 700, frame(500, 700, 18) + f'<circle cx="250" cy="350" r="150" fill="{lt(MOSS, .78)}"/>' + laurel(250, 330, 150) + feather(250, 350, 1.0, -25))

BONUS = {
 'small-wings': ('birds', ['kinglet', 'wren', 'warbler']), 'big-wings': ('birds', ['heron', 'crane', 'hawk']),
 'bowl-keeper': ('nest', 'bowl'), 'hollow-keeper': ('nest', 'cavity'), 'ground-keeper': ('nest', 'ground'), 'ledge-keeper': ('nest', 'platform'),
 'angler': ('food', 'fish', 'kingfisher'), 'seed-saver': ('food', 'seed', 'bunting'), 'mouser': ('food', 'rodent', 'owl'),
 'berry-picker': ('food', 'berry', 'waxwing'), 'grub-digger': ('food', 'grub', 'thrush'),
 'woodland': ('hab', 'forest', 'jay'), 'prairie': ('hab', 'grassland', 'meadowlark'), 'marsh': ('hab', 'wetland', 'heron'),
 'bargain': ('birds', ['sparrow', 'finch', 'pipit']), 'brood': ('eggs', 4), 'hoarder': ('food', 'seed', 'nuthatch'), 'flock-friend': ('birds', ['swallow', 'swallow', 'swift']),
}

def bird_inline(sp, x, y, w, variant='mist'):
    """Embed a full bird card picture (with its scene) as a nested svg."""
    inner = bird_svg(sp, variant).replace('<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">', '').rsplit('</svg>', 1)[0]
    return f'<svg x="{x}" y="{y}" width="{w}" height="{w}" viewBox="0 0 512 512"><clipPath id="c{sp}{x}"><rect width="512" height="512" rx="40"/></clipPath><g clip-path="url(#c{sp}{x})">{inner}</g></svg>'

def bonus(key):
    kind = BONUS[key]; o = frame(500, 700, 18, '#8a6a3c')
    o += f'<rect x="52" y="52" width="396" height="420" rx="16" fill="{lt("#c8b48a", .5)}"/>'
    if kind[0] == 'birds':
        for i, sp in enumerate(kind[1]):
            o += bird_inline(sp, [60, 252, 156][i], [62, 62, 262][i], 190, ['dawn', 'mist', 'sun'][i])
    elif kind[0] == 'nest':
        o += f'<g transform="translate(70 90) scale(2.8)">' + nest(kind[1]).split('>', 1)[1].rsplit('</svg>', 1)[0] + '</g>'
    elif kind[0] == 'food':
        o += bird_inline(kind[2], 62, 62, 300, 'mist') + f'<g transform="translate(236 236) scale(.9)">' + food(kind[1]).split('>', 1)[1].rsplit('</svg>', 1)[0] + '</g>'
    elif kind[0] == 'hab':
        o += bird_inline(kind[2], 70, 76, 360, 'opal')
    elif kind[0] == 'eggs':
        o += f'<g transform="translate(90 110) scale(1.25)">' + nest('bowl').split('>', 1)[1].rsplit('</svg>', 1)[0] + '</g>'
        o += ''.join(f'<g transform="translate({x} {y}) scale(.42)">' + egg().split('>', 1)[1].rsplit('</svg>', 1)[0] + '</g>' for x, y in [(110, 290), (190, 300), (270, 290), (190, 230)])
    o += f'<rect x="52" y="488" width="396" height="10" rx="5" fill="#8a6a3c" opacity=".35"/>'
    return svg(500, 700, o)

# ---- UI objects ----
def feeder():
    return svg(512, 512, f'<ellipse cx="256" cy="300" rx="226" ry="150" fill="{WOOD_D}"/><ellipse cx="256" cy="280" rx="226" ry="150" fill="{WOOD}"/>'
               f'<ellipse cx="256" cy="282" rx="190" ry="120" fill="#7a5232"/><ellipse cx="256" cy="290" rx="190" ry="112" fill="#8e6440"/>'
               + ''.join(f'<path d="M{80 + i * 40} {200 + (i % 2) * 6} q10 80 0 170" stroke="#7a5232" stroke-width="3" opacity=".5" fill="none"/>' for i in range(9))
               + f'<rect x="240" y="40" width="32" height="250" rx="10" fill="{WOOD_D}"/><rect x="246" y="40" width="10" height="250" fill="{WOOD_L}" opacity=".5"/>'
               f'<path d="M150 70 L256 18 L362 70 L350 86 L256 42 L162 86Z" fill="#a84a3a"/>')

def tray():
    o = f'<rect x="8" y="22" width="752" height="222" rx="26" fill="{WOOD_D}"/><rect x="8" y="10" width="752" height="222" rx="26" fill="{WOOD}"/>'
    for i in range(3):
        x = 40 + i * 238; o += f'<rect x="{x}" y="34" width="210" height="176" rx="14" fill="#8e6440"/><rect x="{x}" y="34" width="210" height="14" rx="7" fill="#7a5232"/>'
    return svg(768, 256, o)

def cube():
    return svg(128, 128, '<path d="M64 10 L114 36 L114 92 L64 118 L14 92 L14 36Z" fill="#c8802a"/><path d="M64 10 L114 36 L64 62 L14 36Z" fill="#f2b04a"/><path d="M64 62 L114 36 L114 92 L64 118Z" fill="#a8681e"/>')

def trophy():
    o = '<path d="M200 300 L150 490 L210 450 L240 500 L256 320Z" fill="#3f7a4a"/><path d="M312 300 L362 490 L302 450 L272 500 L256 320Z" fill="#3f7a4a"/>'
    pts = ' '.join(f'{256 + (170 if i % 2 == 0 else 150) * math.cos(math.radians(i * 15)):.1f},{230 + (170 if i % 2 == 0 else 150) * math.sin(math.radians(i * 15)):.1f}' for i in range(24))
    o += f'<polygon points="{pts}" fill="#e0b040"/><circle cx="256" cy="230" r="128" fill="#4f8a4a"/><circle cx="256" cy="230" r="100" fill="{CREAM}"/>'
    o += feather(256, 230, .62, -30, '#4a7ab0')
    return svg(512, 512, o)

def fx(kind):
    if kind == 'chain-spark':
        o = ''.join(f'<path d="M128 128 L{128 + 110 * math.cos(math.radians(a)):.0f} {128 + 110 * math.sin(math.radians(a)):.0f}" stroke="#f2c040" stroke-width="{14 if i % 2 else 8}" stroke-linecap="round"/>' for i, a in enumerate(range(0, 360, 30)))
        o += '<circle cx="128" cy="128" r="46" fill="#ffe8a0"/>' + feather(70, 70, .22, -40, '#d89a3a') + feather(190, 186, .22, 140, '#d89a3a')
    elif kind == 'egg-pop':
        o = f'<g transform="translate(40 30) scale(.7)">' + egg().split('>', 1)[1].rsplit('</svg>', 1)[0] + '</g>'
        o += '<path d="M200 60 l10 -26 l10 26 l26 10 l-26 10 l-10 26 l-10 -26 l-26 -10Z" fill="#f2c040"/><path d="M36 180 q-20 -40 0 -80 M20 200 q-30 -60 0 -120" stroke="#ffffff" stroke-width="7" fill="none" stroke-linecap="round" opacity=".9"/>'
    else:
        o = ''
        for i, a in enumerate(range(0, 360, 45)):
            x, y = 128 + 82 * math.cos(math.radians(a)), 128 + 82 * math.sin(math.radians(a))
            o += f'<circle cx="{x:.0f}" cy="{y:.0f}" r="18" fill="#d8303a"/>' if i % 2 else f'<ellipse cx="{x:.0f}" cy="{y:.0f}" rx="12" ry="20" fill="#e8bf4a" transform="rotate({a + 90} {x:.0f} {y:.0f})"/>'
        o += '<circle cx="128" cy="128" r="30" fill="#fff3c8"/>'
    return svg(256, 256, o)

def strip(hab, w, h, seed=3):
    r = random.Random(seed); o = []
    if hab == 'forest':
        o.append(f'<rect width="{w}" height="{h}" fill="#5a8a50"/>')
        for i in range(int(w * h / 3000)):
            x, y, rr = r.uniform(0, w), r.uniform(0, h), r.uniform(20, 60); o.append(f'<ellipse cx="{x:.0f}" cy="{y:.0f}" rx="{rr:.0f}" ry="{rr * .7:.0f}" fill="{r.choice(["#527f49", "#628f58", "#5a8a50", "#4a7843"])}"/>')
        for i in range(int(w / 70)):
            x, y = r.uniform(0, w), r.uniform(0, h); o.append(f'<path d="M{x:.0f} {y:.0f} l14 -40 l14 40Z" fill="#46733f" opacity=".7"/>')
    elif hab == 'grassland':
        o.append(f'<rect width="{w}" height="{h}" fill="#d8bd66"/>')
        for i in range(int(w * h / 2500)):
            x, y, rr = r.uniform(0, w), r.uniform(0, h), r.uniform(20, 60); o.append(f'<ellipse cx="{x:.0f}" cy="{y:.0f}" rx="{rr:.0f}" ry="{rr * .6:.0f}" fill="{r.choice(["#d2b65e", "#dec470", "#cfb058"])}"/>')
        for i in range(int(w / 25)):
            x, y = r.uniform(0, w), r.uniform(10, h); o.append(f'<path d="M{x:.0f} {y:.0f} q-3 -16 -8 -24 M{x:.0f} {y:.0f} q3 -16 7 -22" stroke="#b8983e" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>')
    else:
        o.append(f'<rect width="{w}" height="{h}" fill="#6aa0c4"/>')
        for i in range(int(w * h / 3500)):
            x, y = r.uniform(0, w), r.uniform(0, h); o.append(f'<path d="M{x:.0f} {y:.0f} h{r.uniform(30, 90):.0f}" stroke="#8cbad8" stroke-width="5" stroke-linecap="round" opacity=".8"/>')
        for i in range(int(w / 120)):
            x, y = r.uniform(0, w), r.uniform(0, h); o.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="22" fill="#5a9a6a" opacity=".8"/><path d="M{x:.0f} {y:.0f} l22 -6" stroke="#6aa0c4" stroke-width="5"/>')
    return ''.join(o)

def row(hab): return svg(1600, 320, strip(hab, 1600, 320))
def mat():
    o = f'<rect width="1600" height="960" fill="#8a6440"/>'
    for i, hb in enumerate(['forest', 'grassland', 'wetland']):
        o += f'<g transform="translate(24 {24 + i * 304})"><svg width="1552" height="288"><rect width="1552" height="288" rx="18" fill="#000"/>{strip(hb, 1552, 288, 5 + i)}</svg></g>'
    return svg(1600, 960, o)

def landscape(w, h, birds, evening=False, seed=2):
    """Tall composed scene: wetland at the bottom, meadow middle, forest edge left, calm sky top."""
    r = random.Random(seed)
    sky = '#2e3a58' if evening else '#f6e6c4'; o = [f'<rect width="{w}" height="{h}" fill="{sky}"/>']
    o.append(f'<circle cx="{w * .72:.0f}" cy="{h * .2:.0f}" r="{w * .09:.0f}" fill="{"#f2e6b0" if evening else "#f8d27a"}"/>')
    hz = h * .5
    o.append(f'<path d="M0 {hz} Q{w * .3} {hz - 90} {w * .6} {hz - 20} T{w} {hz - 50} V{h} H0Z" fill="{"#3e4a62" if evening else "#c8d8a0"}"/>')
    o.append(f'<path d="M0 {hz + 120} Q{w * .4} {hz + 50} {w} {hz + 110} V{h} H0Z" fill="{"#4a5a5a" if evening else "#d8bd66"}"/>')
    o.append(f'<rect y="{h * .78:.0f}" width="{w}" height="{h * .22:.0f}" fill="{"#34506a" if evening else "#7fb4d6"}"/>')
    for k in range(10): o.append(f'<path d="M{r.uniform(0, w * .7):.0f} {h * .8 + k * 34:.0f} h{r.uniform(60, 160):.0f}" stroke="#ffffff" stroke-opacity=".35" stroke-width="6" stroke-linecap="round"/>')
    for k in range(9):
        x = r.uniform(-40, w * .3); s = r.uniform(.8, 1.4); yb = hz + 150 + r.uniform(-40, 60); c = '#2e4a3a' if evening else r.choice(['#3f7a4a', '#4f8a4a', '#5a9a52'])
        for j in range(3):
            y = yb - j * 70 * s; o.append(f'<path d="M{x:.0f} {y - 150 * s:.0f} L{x + 70 * s * (1 - j * .18):.0f} {y:.0f} L{x - 70 * s * (1 - j * .18):.0f} {y:.0f}Z" fill="{c}"/>')
    o.append(f'<rect x="{w * .58:.0f}" y="{hz + 30:.0f}" width="26" height="{h * .3:.0f}" fill="#8a5a36"/><path d="M{w * .58 - 80:.0f} {hz + 40:.0f} L{w * .58 + 13:.0f} {hz - 30:.0f} L{w * .58 + 106:.0f} {hz + 40:.0f}Z" fill="#a84a3a"/><rect x="{w * .58 - 60:.0f}" y="{hz + 40:.0f}" width="146" height="20" rx="6" fill="{WOOD}"/>')
    for k in range(14):
        x = w * .8 + r.uniform(-60, 200); ht = r.uniform(120, 260)
        o.append(f'<path d="M{x:.0f} {h * .8:.0f} q8 -{ht / 2:.0f} {r.uniform(-20, 20):.0f} -{ht:.0f}" stroke="#4f8a5a" stroke-width="9" fill="none" stroke-linecap="round"/>')
    import birds as B
    for sp, bx, by, bw, var, perch in birds:
        inner = bird_svg(sp, var, bare=True).split('>', 1)[1].rsplit('</svg>', 1)[0]
        fy = by + bw * B.FEET[sp] / 512; cx = bx + bw / 2
        if perch == 'branch':
            o.append(f'<path d="M{cx - bw * .9:.0f} {fy + 14:.0f} Q{cx:.0f} {fy - 6:.0f} {cx + bw * .6:.0f} {fy + 4:.0f}" stroke="#7a5236" stroke-width="22" fill="none" stroke-linecap="round"/>')
            o.append(f'<ellipse cx="{cx + bw * .5:.0f}" cy="{fy - 8:.0f}" rx="30" ry="13" fill="#4f9a4a" transform="rotate(-20 {cx + bw * .5:.0f} {fy - 8:.0f})"/>')
        elif perch == 'post':
            o.append(f'<rect x="{cx - 34:.0f}" y="{fy:.0f}" width="68" height="{h * .8 - fy:.0f}" rx="8" fill="#9a6e44"/><rect x="{cx - 34:.0f}" y="{fy:.0f}" width="68" height="14" rx="7" fill="#b88a5a"/>')
        elif perch == 'reed':
            o.append(f'<path d="M{cx - 6:.0f} {h * .82:.0f} Q{cx + 10:.0f} {fy + 60:.0f} {cx:.0f} {fy + 4:.0f} L{cx + bw * .3:.0f} {fy - 30:.0f}" stroke="#3f7a4a" stroke-width="18" fill="none" stroke-linecap="round"/>')
        o.append(f'<svg x="{bx}" y="{by}" width="{bw}" height="{bw}" viewBox="0 0 512 512">{inner}</svg>')
    if evening: o.append(f'<rect width="{w}" height="{h}" fill="#101828" opacity=".25"/>')
    return svg(w, h, ''.join(o))

def mapbg():
    o = ['<rect width="1920" height="1080" fill="#efe2c2"/>']
    r = random.Random(4)
    for i in range(40): o.append(f'<circle cx="{r.uniform(0, 1920):.0f}" cy="{r.uniform(0, 1080):.0f}" r="{r.uniform(40, 160):.0f}" fill="#e6d6b0" opacity=".5"/>')
    o.append('<path d="M120 200 Q420 80 700 260 Q620 520 300 560 Q80 480 120 200Z" fill="#9cc08a"/>')
    for i in range(16):
        x, y = r.uniform(180, 600), r.uniform(200, 480); o.append(f'<path d="M{x:.0f} {y - 40:.0f} l22 50 h-44Z" fill="#4f8a4a"/>')
    o.append('<path d="M1100 600 Q1500 520 1800 700 Q1760 980 1300 1000 Q1000 900 1100 600Z" fill="#9ccbe0"/>')
    for i in range(18):
        x, y = r.uniform(1150, 1700), r.uniform(650, 940); o.append(f'<path d="M{x:.0f} {y:.0f} v-34" stroke="#4f8a5a" stroke-width="6" stroke-linecap="round"/>')
    o.append('<path d="M1200 120 Q1600 60 1820 240 Q1700 420 1340 420 Q1120 340 1200 120Z" fill="#e2cc84"/>')
    for i in range(14):
        x, y = r.uniform(1250, 1700), r.uniform(160, 380); o.append(f'<path d="M{x:.0f} {y:.0f} q-4 -16 -8 -22 M{x:.0f} {y:.0f} q4 -16 8 -20" stroke="#b8983e" stroke-width="4" fill="none"/>')
    o.append('<path d="M420 420 C760 600 900 300 1300 280 M1300 280 C1500 420 1300 600 1420 800" stroke="#8a5a36" stroke-width="10" stroke-dasharray="4 26" stroke-linecap="round" fill="none"/>')
    o.append('<rect x="20" y="20" width="1880" height="1040" rx="30" fill="none" stroke="#8a6a3c" stroke-width="12"/>')
    return svg(1920, 1080, ''.join(o))
