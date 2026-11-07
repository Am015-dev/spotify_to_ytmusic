#!/usr/bin/env python3
"""Vinegrave: sites, frames, tokens, UI and backgrounds in the vg.py flat family."""
import math, random
from vg import *

def jungle_bg(w, h, seed, sky='#cfe0c0', far='#9cc28c', near='#6fa864'):
    r = random.Random(seed)
    o = R(0, 0, w, h, sky) + P(f'M0 {h * .45} Q{w * .3} {h * .3} {w * .6} {h * .42} T{w} {h * .38} V{h} H0Z', far)
    for k in range(int(w / 50)):
        x = r.uniform(0, w); s = r.uniform(.7, 1.3)
        o += L(f'M{x:.0f} {h * .6:.0f} Q{x + 8:.0f} {h * .35:.0f} {x + 20:.0f} {h * .2:.0f}', '#3f7a4a', 6 * s)
        o += ''.join(E(x + 20 + c * 24 * s, h * .2 + c2 * 10, 26 * s, 9 * s, ['#3f7a4a', '#4f9a5a'][(c + c2) % 2], f'transform="rotate({c * 40 - 20} {x + 20:.0f} {h * .2:.0f})"') for c in (-1, 1) for c2 in (0, 1))
    o += P(f'M0 {h * .7} Q{w * .5} {h * .62} {w} {h * .7} V{h} H0Z', near)
    return o

def stairs(x, y, w, n, c=STONE):
    return ''.join(R(x + i * w * .06, y - i * 16, w - i * w * .12, 18, mix(c, '#ffffff', .05 * (i % 2)), 3) + R(x + i * w * .06, y - i * 16 + 14, w - i * w * .12, 4, dk(c, .25)) for i in range(n))
def arch(x, y, w, h, c=STONE, broken=False):
    o = R(x, y - h, w * .22, h, c, 4) + R(x + w * .78, y - h, w * .22, h, c, 4)
    o += P(f'M{x} {y - h} Q{x + w / 2} {y - h * 1.6} {x + w} {y - h} L{x + w * .78} {y - h} Q{x + w / 2} {y - h * 1.3} {x + w * .22} {y - h}Z', c) if not broken else R(x, y - h - 20, w * .4, 22, c, 4, f'transform="rotate(-12 {x} {y - h})"')
    return o + L(f'M{x + w * .1} {y - h} q20 40 0 90', LEAF, 5)
def pool(x, y, rx, ry, c='#5aa0c0'): return E(x, y, rx, ry, dk(c, .25)) + E(x, y - 4, rx * .92, ry * .8, c) + L(f'M{x - rx * .5} {y - 4} h{rx * .4}', lt(c, .4), 4)
def statue(x, y, s=1, c=STONE): return G(figure(c, eyes2(10, -56, 5), dk(c, .2)), f'translate({x} {y}) scale({s})')
def crystal(x, y, s=1, c='#8ae0e8'): return G(P('M0 -60 L22 -10 L10 40 L-10 40 L-22 -10Z', c) + P('M0 -60 L22 -10 L0 0Z', lt(c, .4)) + P('M-30 40 L-40 0 L-24 -20 L-18 40Z', dk(c, .1)) + P('M30 40 L42 4 L26 -16 L18 40Z', dk(c, .15)), f'translate({x} {y}) scale({s})')
def tree(x, y, s=1): return G(R(-22, -120, 44, 130, '#6a4a2a', 10) + E(0, -140, 80, 50, '#3f7a4a') + E(-30, -160, 50, 34, '#4f9a5a') + E(0, -10, 30, 40, '#2a1c12'), f'translate({x} {y}) scale({s})')
def cave(x, y, w, h): return P(f'M{x} {y} Q{x} {y - h * 1.2} {x + w / 2} {y - h * 1.2} Q{x + w} {y - h * 1.2} {x + w} {y}Z', STONE) + P(f'M{x + w * .2} {y} Q{x + w * .2} {y - h * .8} {x + w / 2} {y - h * .8} Q{x + w * .8} {y - h * .8} {x + w * .8} {y}Z', '#1a1612')

SITES = {
 'fern-steps': lambda: stairs(110, 250, 180, 6),
 'frog-pool': lambda: pool(200, 240, 120, 34) + G(ART['jade-frog'](), 'translate(200 220) scale(.35)'),
 'broken-arch': lambda: arch(120, 250, 160, 110, broken=True),
 'hollow-tree': lambda: tree(200, 260, 1.1),
 'snake-ford': lambda: P('M0 230 Q200 200 400 240 L400 270 Q200 230 0 262Z', '#5aa0c0') + ''.join(R(80 + i * 60, 236 - i * 2, 40, 16, STONE, 8) for i in range(5)) + L('M240 210 q20 -20 40 0 t40 0', '#3fa07a', 8),
 'moth-cave': lambda: cave(120, 260, 160, 130) + E(200, 180, 16, 10, '#e8e0c0', 'opacity=".9"'),
 'sunken-well': lambda: E(200, 230, 90, 30, dk(STONE, .2)) + R(110, 190, 180, 40, STONE, 6) + E(200, 190, 90, 26, '#1a1612') + E(200, 190, 70, 18, '#3a6a7a'),
 'statue-row': lambda: statue(110, 230, .9) + statue(200, 220, 1.0) + statue(290, 230, .9),
 'root-gate': lambda: arch(120, 255, 160, 120) + L('M120 140 Q150 200 130 255 M280 140 Q250 200 270 255 M150 120 Q200 160 250 120', '#6a4a2a', 10),
 'echo-pit': lambda: E(200, 240, 130, 40, dk(STONE, .2)) + E(200, 236, 110, 30, '#14100e') + L('M150 236 q50 -30 100 0', '#5a554c', 3, 'opacity=".6"'),
 'crystal-vault': lambda: cave(100, 262, 200, 140) + crystal(170, 250, .9) + crystal(230, 246, 1.1) + crystal(200, 256, .7, '#c8a8f0'),
 'lava-stair': lambda: stairs(110, 250, 180, 6, '#5a4a48') + L('M120 262 Q200 240 290 262', '#ff7a2a', 8),
 'sky-altar': lambda: stairs(120, 250, 160, 4) + R(170, 170, 60, 26, STONE, 4) + C(200, 140, 26, '#f2d878') + ''.join(L(f'M200 140 l{40 * math.cos(math.radians(a)):.0f} {40 * math.sin(math.radians(a)):.0f}', '#f2d878', 4) for a in range(0, 360, 45)),
 'drowned-hall': lambda: R(0, 200, 400, 100, '#4a8aa0') + statue(140, 236, .8) + arch(200, 236, 130, 100) + L('M40 230 h80 M260 250 h100', lt('#4a8aa0', .4), 4),
 'thorn-palace': lambda: R(110, 130, 180, 120, STONE, 4) + P('M100 130 L200 70 L300 130Z', dk(STONE, .1)) + R(180, 190, 40, 60, '#1a1612', 20) + L('M100 250 Q130 160 110 120 M300 250 Q270 170 300 120 M110 200 l-14 -8 M300 190 l14 -8', '#3a2a2a', 8),
 'star-pool': lambda: R(0, 0, 400, 300, '#1a2440', 'opacity=".55"') + pool(200, 240, 120, 34, '#2a3a6a') + ''.join(C(x, y, 3, '#f2e6b0') for x, y in [(160, 236), (220, 244), (250, 232), (180, 248), (60, 40), (300, 60), (340, 30), (120, 80)]),
 'bone-chapel': lambda: arch(130, 255, 140, 120, BONE) + ''.join(C(x, 160, 10, BONE) for x in (170, 200, 230)) + E(200, 230, 20, 26, '#1a1612'),
 'jade-court': lambda: R(60, 220, 280, 30, JADE, 4) + statue(120, 210, .7, JADE) + statue(280, 210, .7, JADE) + R(180, 150, 40, 70, JADE, 4) + C(200, 140, 18, GOLD),
 'c-spring': lambda: pool(200, 240, 110, 30, '#7ac8e0') + L('M200 230 q-10 -40 0 -70 M200 160 q20 20 30 50 M200 160 q-20 20 -30 50', '#bfe8f2', 6),
 'c-cliff': lambda: P('M0 300 L0 120 L120 110 L170 180 L180 300Z', STONE) + P('M0 120 L120 110 L130 124 L0 136Z', LEAF) + R(180, 230, 220, 70, '#5aa0c0'),
 'c-wreck': lambda: R(0, 220, 400, 80, '#5aa0c0') + P('M120 240 Q200 190 300 220 L280 260 Q200 250 130 264Z', '#7a5236') + L('M210 220 L240 130', WOOD, 8) + P('M240 130 L290 160 L246 190Z', '#e2d4b0', 'opacity=".9"'),
 'c-cove': lambda: R(0, 0, 400, 300, '#e8d8a8', 'opacity=".25"') + P('M0 300 L0 220 Q200 170 400 220 V300Z', '#5aa0c0') + P('M0 230 Q200 200 400 230 L400 240 Q200 212 0 244Z', '#efe0b8') + G(ITEMS['dinghy'](), 'translate(200 250) scale(.4)'),
 'c-road': lambda: P('M140 300 Q200 220 190 160 L210 160 Q230 220 260 300Z', '#c8a878') + G(ITEMS['tent'](), 'translate(310 220) scale(.45)') + G(ITEMS['crate'](), 'translate(90 240) scale(.3)'),
 'hidden-1': lambda: '',
 'hidden-2': lambda: '',
}

def site(name):
    k = name.replace('site-', ''); seed = sum(map(ord, k))
    if k.startswith('hidden'):
        lvl = int(k[-1])
        o = jungle_bg(400, 300, seed, sky='#a8b8a4', far='#7f9a80', near='#5f7f60') + R(0, 0, 400, 300, '#dfe8dc', 'opacity=".55"')
        o += C(200, 150, 50, '#f3e6c8', 'opacity=".9"') + C(200, 150, 40, BRASS) + C(200, 150, 32, '#f3e6c8') + P('M200 122 L210 150 L200 178 L190 150Z', '#a8302a') + C(200, 150, 5, '#3a3226')
        if lvl == 2: o += C(200, 150, 64, 'none', f'stroke="{GOLD}" stroke-width="5" stroke-dasharray="6 10"')
        return svg(400, 300, o)
    coast = k.startswith('c-'); grand = k in ('crystal-vault', 'lava-stair', 'sky-altar', 'drowned-hall', 'thorn-palace', 'star-pool', 'bone-chapel', 'jade-court')
    sky = '#f2e2b8' if coast else ('#b8c8b0' if grand else '#cfe0c0')
    o = jungle_bg(400, 300, seed, sky=sky, near='#e8d4a0' if coast else '#6fa864')
    return svg(400, 300, o + SITES[k]())

# ---------- frames (alpha centre) ----------
def frame(kind):
    col = {'item': (WOOD, BRASS), 'art': (OCHRE, '#8a6a30'), 'fear': ('#1f3a3a', '#3a2a2a')}[kind]
    o = f'<mask id="m"><rect width="300" height="420" fill="#fff"/><rect x="22" y="22" width="256" height="376" rx="12" fill="#000"/></mask>'
    o += f'<g mask="url(#m)"><rect width="300" height="420" rx="18" fill="{col[0]}"/><rect x="8" y="8" width="284" height="404" rx="14" fill="none" stroke="{lt(col[0], .25)}" stroke-width="4"/>'
    o += f'<rect x="16" y="16" width="268" height="388" rx="12" fill="none" stroke="{col[1]}" stroke-width="5"/></g>'
    if kind == 'item': o += ''.join(C(x, y, 7, BRASS) + C(x, y, 3, dk(BRASS, .3)) for x in (11, 289) for y in (11, 409)) + ''.join(E(x, 11, 12, 5, LEAF) for x in (100, 150, 200))
    elif kind == 'art': o += ''.join(R(x - 9, y - 9, 18, 18, '#8a6a30', 3, f'transform="rotate(45 {x} {y})"') for x in (11, 289) for y in (11, 409)) + L('M60 6 Q100 20 140 6 T240 8', LEAF, 5) + ''.join(R(140 - 10, y - 10, 20, 20, JADE, 3, f'transform="rotate(45 150 {y})"') for y in ())
    else: o += L('M8 60 Q20 30 8 8 Q40 20 60 8 M292 360 Q280 390 292 412 Q260 400 240 412 M8 300 q14 -20 0 -40 M292 120 q-14 20 0 40', '#2a4a3a', 6) + ''.join(P(f'M{x} {y} l6 -12 l6 12Z', '#3a2a2a') for x, y in [(30, 14), (90, 14), (200, 410), (260, 410), (6, 180), (288, 240)])
    return svg(300, 420, o)

def card_back():
    o = R(0, 0, 300, 420, '#24402e', 16) + ''.join(P(f'M{x} {y} l20 20 l-20 20 l-20 -20Z', '#2c4a36') for x in range(0, 320, 40) for y in range(-20, 440, 40))
    o += R(14, 14, 272, 392, 'none', 12, f'stroke="{OCHRE}" stroke-width="5"') + C(150, 210, 86, '#1f3326') + C(150, 210, 86, 'none', f'stroke="{OCHRE}" stroke-width="4"')
    o += stairs(95, 260, 110, 4, OCHRE) + R(118, 160, 64, 42, OCHRE, 4) + R(138, 176, 24, 26, '#1f3326', 10) + L('M90 150 Q120 120 150 140 T210 150', LEAF, 6)
    return svg(300, 420, o)

# ---------- small objects (128 / 256, alpha) ----------
def small(name):
    S = {'res-coin': C(0, 0, 50, GOLD) + C(0, 0, 40, lt(GOLD, .15)) + C(0, 0, 40, 'none', f'stroke="{dk(GOLD, .2)}" stroke-width="4"') + eyes2(10, -6, 4, dk(GOLD, .35)) + L('M-12 14 q12 8 24 0', dk(GOLD, .35), 4),
         'res-compass': ITEMS['sextant']() and (C(0, 0, 52, BRASS) + C(0, 0, 42, '#f3e6c8') + P('M0 -36 L10 0 L0 36 L-10 0Z', '#a8302a') + P('M0 0 L10 0 L0 36 L-10 0Z', '#3a3226') + C(0, -54, 8, BRASS)),
         'res-tablet': R(-40, -50, 80, 100, STONE, 10) + ''.join(R(-26 + (i % 2) * 30, -34 + (i // 2) * 24, 22, 14, dk(STONE, .25), 4) for i in range(8)),
         'res-arrow': P('M0 -54 L30 10 L0 30 L-30 10Z', '#5a5a66') + P('M0 -54 L30 10 L0 0Z', '#7a7a86') + R(-10, 26, 20, 30, LEATHER, 4),
         'res-jewel': P('M-46 -14 L-24 -40 L24 -40 L46 -14 L0 50Z', '#2ab07a') + P('M-24 -40 L24 -40 L14 -14 L-14 -14Z', lt('#2ab07a', .35)) + P('M-46 -14 L-14 -14 L0 50Z', dk('#2ab07a', .15)),
         'tr-boot': P('M-30 -54 L14 -54 L14 20 L52 30 Q60 50 50 54 L-30 54Z', LEATHER) + R(-34, 44, 90, 12, '#3a2a1e', 4) + L('M-20 -40 h26 M-20 -24 h26 M-20 -8 h26', '#e8d8b0', 4),
         'tr-car': R(-56, -10, 112, 34, '#6a7a4a', 8) + P('M-30 -10 L-20 -34 L10 -34 L20 -10Z', 'none', f'stroke="{IRON}" stroke-width="5"') + C(-32, 26, 16, '#2a2a2e') + C(34, 26, 16, '#2a2a2e') + C(-32, 26, 6, BRASS) + C(34, 26, 6, BRASS),
         'tr-ship': P('M-58 10 L58 10 L44 34 L-48 34Z', '#a8302a') + R(-30, -16, 60, 26, '#f3e6c8', 4) + R(-6, -46, 16, 32, '#3a3a3e', 3) + C(4, -54, 8, '#c8c8c8', 'opacity=".8"'),
         'tr-plane': R(-50, -6, 100, 18, '#d8402a', 9) + R(-14, -34, 24, 66, '#e8d8b0', 6, 'transform="rotate(90 0 0)"') + R(-40, -22, 70, 8, '#e8d8b0', 4) + R(-40, 18, 70, 8, '#e8d8b0', 4) + P('M-50 -6 L-62 -24 L-40 -6Z', '#d8402a') + L('M54 -14 v28', IRON, 4),
         'token-notebook': R(-36, -48, 72, 96, '#5a6a3a', 8) + R(28, -46, 8, 92, CANVAS) + L('M-6 -48 v110', '#a8302a', 6),
         'token-glass': C(-10, -14, 34, BRASS) + C(-10, -14, 26, '#bfe0ea') + C(-20, -24, 8, '#ffffff', 'opacity=".7"') + L('M14 12 L48 48', WOOD, 14),
         'shrine-slot': C(0, 0, 54, STONE) + C(0, 0, 40, dk(STONE, .3)) + C(0, 4, 32, '#1a1612') + ''.join(E(54 * math.cos(math.radians(a)), 54 * math.sin(math.radians(a)), 10, 5, LEAF, f'transform="rotate({a + 90} {54 * math.cos(math.radians(a)):.0f} {54 * math.sin(math.radians(a)):.0f})"') for a in (200, 230, 320, 350)),
         'icon-story': G(book('#7a4e2c', open_=True), 'scale(.45)') + P('M30 -40 Q50 -10 40 30', '#4a7ab0', 'stroke="#4a7ab0" stroke-width="8"'),
         'icon-quick': C(0, 6, 44, BRASS) + C(0, 6, 36, '#f3e6c8') + R(-6, -52, 12, 14, BRASS, 3) + L('M0 6 L0 -22 M0 6 L18 14', '#3a3226', 5) + L('M-34 -30 l10 10', '#e8b030', 6),
         'icon-howto': R(-50, -36, 100, 72, CANVAS, 6) + L('M-16 -36 v72 M16 -36 v72', dk(CANVAS, .2), 3) + L('M-36 20 Q-10 -20 10 6 T40 -10', '#a8302a', 4, 'stroke-dasharray="5 6"') + L('M30 -20 q8 -10 0 -18 q-10 -4 -14 6 M24 0 v2', LEAF, 5),
    }
    sz = 128; sc = 1.0
    return svg(sz, sz, G(S[name], f'translate(64 64) scale({sc})'))

def explorer(i):
    c = [TEAL, '#e0a030', '#c03a3a', '#7a4ab0'][i]
    o = E(64, 184, 40, 7, '#000', 'opacity=".2"') + P('M30 182 Q24 100 64 90 Q104 100 98 182Z', c) + P('M64 90 Q104 100 98 182 L64 182Z', dk(c, .15))
    o += C(64, 66, 26, '#f0c49a') + E(64, 50, 40, 10, lt(c, .1)) + P('M38 50 Q40 20 64 18 Q88 20 90 50Z', lt(c, .1)) + R(40, 44, 48, 6, dk(c, .3), 3)
    o += eyes2(10, 68, 3.5, '#26262c').replace('cx="-10"', 'cx="54"').replace('cx="10"', 'cx="74"') + L('M40 110 L84 150', LEATHER, 6) + R(72, 140, 24, 20, LEATHER, 4)
    return svg(128, 192, o)

def temple(n):
    s = {'temple-11': (1.0, GOLD, 6), 'temple-6': (.85, TEAL, 4), 'temple-2': (.7, '#3a3226', 2)}[n]
    sc, glow, steps = s
    o = ''
    for k in range(steps):
        w = 200 - k * (140 / steps); o += R(128 - w / 2, 220 - (k + 1) * 26, w, 26, mix(STONE, LEAF, .15 if k % 2 else 0), 3) + R(128 - w / 2, 220 - (k + 1) * 26 + 22, w, 4, dk(STONE, .25))
    top = 220 - steps * 26
    o += R(98, top - 50, 60, 50, STONE, 4) + P(f'M90 {top - 50} L128 {top - 80} L166 {top - 50}Z', dk(STONE, .1)) + R(116, top - 34, 24, 34, glow, 10)
    o += L(f'M{128 - 100} 214 Q{128 - 60} {top} {128 - 30} {top - 40} M{128 + 100} 214 Q{128 + 70} {top + 30} {128 + 34} {top - 30}', LEAF, 6)
    if n == 'temple-2': o = R(68, 140, 120, 80, STONE, 6) + P('M56 140 L128 90 L200 140Z', '#6a4a2a') + R(112, 170, 32, 50, '#1a1612', 12) + L('M60 220 Q80 120 130 100 M200 220 q-20 -60 -60 -90', LEAF, 7)
    return svg(256, 256, G(o, f'translate({128 * (1 - sc)} {256 * (1 - sc)}) scale({sc})'))

def fx(kind):
    if kind == 'discover': o = ''.join(L(f'M256 256 L{256 + 220 * math.cos(math.radians(a)):.0f} {256 + 220 * math.sin(math.radians(a)):.0f}', '#f2d060', 18 if i % 2 else 8, 'opacity=".85"') for i, a in enumerate(range(0, 360, 20))) + C(256, 256, 70, '#fff0b0') + ''.join(E(256 + 170 * math.cos(math.radians(a)), 256 + 170 * math.sin(math.radians(a)), 26, 11, LEAF, f'transform="rotate({a} {256 + 170 * math.cos(math.radians(a)):.0f} {256 + 170 * math.sin(math.radians(a)):.0f})"') for a in range(10, 360, 50))
    elif kind == 'guardian': o = C(256, 256, 180, 'none', 'stroke="#5ad8c8" stroke-width="10" opacity=".8"') + ''.join(P(f'M{256 + 150 * math.cos(math.radians(a)):.0f} {256 + 150 * math.sin(math.radians(a)):.0f} l24 -10 l10 26 l-26 8Z', STONE) for a in range(0, 360, 36)) + ''.join(C(256 + 210 * math.cos(math.radians(a)), 256 + 210 * math.sin(math.radians(a)), 8, '#8af0e0') for a in range(18, 360, 36))
    else: o = C(256, 256, 160, '#f2d060', 'opacity=".35"') + C(256, 256, 100, '#ffe8a0', 'opacity=".6"') + ''.join(P(f'M{256 + r * math.cos(math.radians(a)):.0f} {256 + r * math.sin(math.radians(a)) - 14:.0f} l8 14 l-8 14 l-8 -14Z', [JADE, '#fff4c0'][i % 2]) for i, (a, r) in enumerate([(a, 120 + (a % 3) * 40) for a in range(0, 360, 30)]))
    return svg(512, 512, o)

def island_map(w, h, act=None, seed=7):
    r = random.Random(seed); o = R(0, 0, w, h, '#3a8aa8')
    for k in range(30): o += L(f'M{r.uniform(0, w):.0f} {r.uniform(0, h):.0f} h{r.uniform(40, 120):.0f}', '#5aa8c4', 5)
    o += P(f'M{w * .1} {h * .9} Q{w * .02} {h * .4} {w * .3} {h * .12} Q{w * .6} {h * .02} {w * .85} {h * .2} Q{w * .98} {h * .55} {w * .8} {h * .92}Z', '#efe0b0')
    o += P(f'M{w * .14} {h * .84} Q{w * .08} {h * .42} {w * .32} {h * .18} Q{w * .6} {h * .08} {w * .8} {h * .24} Q{w * .92} {h * .55} {w * .76} {h * .86}Z', '#6fa864')
    o += P(f'M{w * .24} {h * .62} Q{w * .3} {h * .3} {w * .5} {h * .26} Q{w * .72} {h * .3} {w * .72} {h * .6}Z', '#4f8a4a')
    o += P(f'M{w * .38} {h * .46} Q{w * .44} {h * .32} {w * .52} {h * .32} Q{w * .62} {h * .36} {w * .6} {h * .48}Z', '#8a9a7a')
    for k in range(60):
        x, y = r.uniform(w * .18, w * .8), r.uniform(h * .25, h * .8); o += C(x, y, r.uniform(14, 26), r.choice(['#3f7a4a', '#4f9a5a', '#5aa852']))
    o += G(temple('temple-11').split('>', 1)[1].rsplit('</svg>', 1)[0], f'translate({w * .5 - 64} {h * .26}) scale(.5)')
    o += L(f'M{w * .5} {h * .86} Q{w * .4} {h * .7} {w * .48} {h * .55} T{w * .5} {h * .4}', '#8a5a36', 6, 'stroke-dasharray="4 16"')
    o += G(ITEMS['tent'](), f'translate({w * .5} {h * .84}) scale(.3)')
    return o

def board_map(): return svg(1600, 1000, island_map(1600, 1000))
def act_map(n):
    o = island_map(1600, 1000, n, seed=n * 5)
    tint = {1: ('#f2e2b0', .25), 2: ('#2a5a3a', .25), 3: ('#c8d0d8', .35)}[n]
    return svg(1600, 1000, o + R(0, 0, 1600, 1000, tint[0], 0, f'opacity="{tint[1]}"'))

def title_scene(w, h, mood='day'):
    sky = {'day': '#f2d8a0', 'win': '#f6c878', 'lose': '#5a6a7a'}[mood]
    o = R(0, 0, w, h, sky) + C(w * .5, h * .3, h * .16, '#ffe8b0' if mood != 'lose' else '#7a8a98', 'opacity=".9"')
    o += P(f'M0 {h * .62} Q{w * .25} {h * .5} {w * .5} {h * .55} T{w} {h * .5} V{h} H0Z', '#9cc28c' if mood != 'lose' else '#3a4a48')
    r = random.Random(4)
    for side in (0, 1):
        for k in range(9):
            x = (r.uniform(0, w * .3) if side == 0 else r.uniform(w * .7, w)); s = h / 560 * r.uniform(.9, 1.4); y0 = h * .9
            o += L(f'M{x:.0f} {y0:.0f} Q{x + 10 * s:.0f} {y0 - 120 * s:.0f} {x + 30 * s:.0f} {y0 - 190 * s:.0f}', '#3f6a44' if mood != 'lose' else '#2a3a34', 7 * s)
            o += ''.join(E(x + 30 * s + c * 30 * s, y0 - 190 * s + c2 * 12 * s, 34 * s, 11 * s, ['#3f7a4a', '#4f9a5a'][(c + c2) % 2] if mood != 'lose' else '#2e4a3a', f'transform="rotate({c * 40 - 20} {x + 30 * s:.0f} {y0 - 190 * s:.0f})"') for c in (-1, 1) for c2 in (0, 1))
    t = temple('temple-11').split('>', 1)[1].rsplit('</svg>', 1)[0]
    sc = h * .78 / 256
    o += G(t, f'translate({w * .5 - 128 * sc:.0f} {h * .86 - 220 * sc:.0f}) scale({sc:.3f})')
    o += P(f'M0 {h * .86} Q{w * .5} {h * .8} {w} {h * .86} V{h} H0Z', '#3f6a44' if mood != 'lose' else '#26322e')
    if mood == 'lose': o += ''.join(L(f'M{x} 0 l-30 {h}', '#c8d8e8', 2, 'opacity=".35"') for x in range(0, w + 200, 40)) + R(0, 0, w, h, '#101828', 0, 'opacity=".25"')
    if mood == 'win': o += C(w * .5, h * .86 - 190 * sc, 40 * sc, '#fff4c0', 'opacity=".85"')
    return svg(w, h, o)

def track_bg():
    o = R(0, 0, 300, 900, '#24402e') + ''.join(R(60 - i * 2, 860 - i * 70, 180 + i * 4, 60, mix(STONE, LEAF, .2 * (i % 2)), 6) for i in range(12))
    o += L('M30 900 Q60 500 20 0 M270 900 Q240 400 280 0', LEAF, 10) + G(temple('temple-11').split('>', 1)[1].rsplit('</svg>', 1)[0], 'translate(40 0) scale(.86)')
    return svg(300, 900, o)
