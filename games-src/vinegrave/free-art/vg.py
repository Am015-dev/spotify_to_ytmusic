#!/usr/bin/env python3
"""Vinegrave flat-vector set (same family as perch-and-plume birds.py: no outlines, flat colour, soft top light).
Every object is drawn centred on (0,0) inside roughly +-120 x +-90; scenes frame them. SVG -> render.js."""
import math, random

def hx(c): c = c.lstrip('#'); return tuple(int(c[i:i + 2], 16) for i in (0, 2, 4))
def hexs(t): return '#%02x%02x%02x' % tuple(max(0, min(255, int(v))) for v in t)
def mix(a, b, t): a, b = hx(a), hx(b); return hexs(tuple(a[i] + (b[i] - a[i]) * t for i in range(3)))
def dk(c, t=.2): return mix(c, '#000000', t)
def lt(c, t=.2): return mix(c, '#ffffff', t)
def svg(w, h, body): return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">{body}</svg>'

WOOD, BRASS, LEATHER, CANVAS, IRON = '#9a6a3c', '#d8a84a', '#8a4e2c', '#e2d4b0', '#5a5e62'
JADE, GOLD, STONE, CLAY, BONE, OBS = '#3fa07a', '#e0b040', '#9a9488', '#c0703a', '#efe4cc', '#2a2830'
TEAL, OCHRE, LEAF, DARK = '#2a8a8a', '#d9a441', '#4f9a5a', '#1f2a24'

def R(x, y, w, h, c, rx=0, extra=''): return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{c}" {extra}/>'
def C(x, y, r, c, extra=''): return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{c}" {extra}/>'
def E(x, y, rx, ry, c, extra=''): return f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="{c}" {extra}/>'
def P(d, c, extra=''): return f'<path d="{d}" fill="{c}" {extra}/>'
def L(d, c, w, extra=''): return f'<path d="{d}" stroke="{c}" stroke-width="{w}" fill="none" stroke-linecap="round" stroke-linejoin="round" {extra}/>'
def G(body, t=''): return f'<g transform="{t}">{body}</g>'

# ---------- shared shapes ----------
def book(c, pages=CANVAS, band=None, emblem=None, open_=False):
    if open_:
        o = P('M-110 -60 Q-55 -78 0 -60 L0 70 Q-55 52 -110 70Z', pages) + P('M110 -60 Q55 -78 0 -60 L0 70 Q55 52 110 70Z', lt(pages, .3))
        o += P('M-118 -52 L-118 78 Q-55 60 0 78 Q55 60 118 78 L118 -52 L110 -60 L110 70 Q55 52 0 70 Q-55 52 -110 70 L-110 -60Z', c)
        o += ''.join(L(f'M{x} {y} q30 -6 60 0', dk(pages, .25), 4) for x in (-96, 18) for y in (-30, -10, 10, 30))
        return o + (emblem or '')
    o = R(-80, -70, 160, 140, dk(c, .25), 10) + R(-86, -76, 160, 140, c, 10) + R(64, -70, 14, 132, pages, 4)
    if band: o += R(-86, -20, 160, 18, band)
    if emblem: o += emblem
    return o

def scroll(c=CANVAS, marks=None):
    o = R(-100, -60, 200, 120, c, 6) + E(-100, 0, 14, 64, dk(c, .15)) + E(100, 0, 14, 64, dk(c, .15)) + E(100, 0, 7, 50, dk(c, .3))
    return o + (marks or '')

def mask(c, accent, eyes='#1e1e22', crown=None, crack=False):
    o = P('M-70 -80 Q0 -100 70 -80 Q86 -10 60 50 Q30 92 0 96 Q-30 92 -60 50 Q-86 -10 -70 -80Z', c)
    o += P('M-70 -80 Q0 -100 70 -80 Q80 -40 74 -20 Q0 -40 -74 -20 Q-80 -40 -70 -80Z', lt(c, .15))
    o += P('M-50 -24 Q-30 -40 -12 -22 Q-30 -10 -50 -24Z', eyes) + P('M50 -24 Q30 -40 12 -22 Q30 -10 50 -24Z', eyes)
    o += P('M-8 -10 L8 -10 L12 30 L-12 30Z', dk(c, .15)) + P('M-30 52 Q0 66 30 52 Q0 76 -30 52Z', dk(c, .35))
    o += L('M-60 4 l20 8 M60 4 l-20 8 M-56 20 l18 6 M56 20 l-18 6', accent, 6)
    if crown: o = crown + o
    if crack: o += L('M20 -86 l-10 30 l14 20 l-8 30', dk(c, .4), 4)
    return o

def disc(c, ring, inner=None, rays=False):
    o = ''
    if rays: o += ''.join(P(f'M{100 * math.cos(math.radians(a)):.0f} {100 * math.sin(math.radians(a)):.0f} L{70 * math.cos(math.radians(a - 9)):.0f} {70 * math.sin(math.radians(a - 9)):.0f} L{70 * math.cos(math.radians(a + 9)):.0f} {70 * math.sin(math.radians(a + 9)):.0f}Z', ring) for a in range(0, 360, 30))
    o += C(0, 4, 78, dk(c, .3)) + C(0, 0, 78, c) + C(0, 0, 64, ring) + C(0, 0, 54, lt(c, .1))
    return o + (inner or '')

def vessel(c, w=70, h=80, neck=26, handles=False, band=None, lid=None):
    o = ''
    if handles: o += L(f'M{-w} {-h * .3} q-30 10 -6 40 M{w} {-h * .3} q30 10 6 40', dk(c, .2), 10)
    o += P(f'M{-neck} {-h} L{neck} {-h} Q{w} {-h * .6} {w} {h * .1} Q{w} {h} 0 {h} Q{-w} {h} {-w} {h * .1} Q{-w} {-h * .6} {-neck} {-h}Z', c)
    o += P(f'M{-w * .5} {-h * .4} Q{-w * .9} {h * .1} {-w * .4} {h * .7}', lt(c, .18), 'opacity=".9"').replace('fill=', 'stroke-width="10" stroke="' + lt(c, .2) + '" fill="none" data-x=')
    o += E(0, -h, neck + 6, 9, dk(c, .25))
    if band: o += R(-w, -h * .05, 2 * w, 16, band)
    if lid: o += lid
    return o

def horn(c, tip, band=GOLD):
    o = P('M-110 30 Q-40 -70 90 -50 Q100 -30 92 -10 Q-20 -20 -96 56Z', c)
    o += P('M80 -54 Q120 -40 112 0 Q98 6 92 -10 Q100 -30 80 -54Z', tip) + R(-20, -46, 14, 60, band, 4, 'transform="rotate(-20)"')
    return o

def figure(c, head, accent):
    o = R(-40, 40, 80, 40, dk(c, .25), 6) + P('M-34 40 Q-40 -10 -24 -30 L24 -30 Q40 -10 34 40Z', c)
    o += C(0, -54, 32, c) + head + R(-26, 6, 52, 10, accent, 4)
    return o

def eyes2(x, y, r, c='#1e1e22'): return C(-x, y, r, c) + C(x, y, r, c)

# ---------- expedition items (camp crate) ----------
ITEMS = {
 'machete': lambda: P('M-110 10 Q0 -40 100 -46 Q118 -40 104 -24 Q0 -10 -96 30Z', '#c8ccd0') + P('M-110 10 Q0 -40 100 -46 L102 -40 Q0 -30 -104 18Z', '#eef0f2') + R(-150, 6, 54, 26, LEATHER, 10, 'transform="rotate(-14)"') + C(-128, 8, 4, BRASS) + C(-112, 4, 4, BRASS),
 'canteen': lambda: C(0, 10, 76, dk('#6a7a4a', .2)) + C(0, 6, 76, '#6a7a4a') + C(0, 6, 56, '#7a8a5a') + R(-14, -92, 28, 26, IRON, 4) + L('M-60 -50 Q0 -150 60 -50', LEATHER, 10) + L('M-30 40 l20 -16 l18 10', dk('#6a7a4a', .3), 5),
 'rope': lambda: ''.join(E(0, 30 - i * 16, 90 - i * 6, 30, ['#c8a060', '#b08850'][i % 2]) for i in range(5)) + E(0, -34, 50, 14, dk('#c8a060', .3)) + L('M60 -40 q40 20 30 70', '#c8a060', 14),
 'lamp': lambda: L('M-30 -70 Q0 -110 30 -70', IRON, 6) + R(-40, -70, 80, 16, dk(IRON, .1), 6) + C(0, -10, 40, '#ffe08a', 'opacity=".9"') + R(-36, -56, 72, 90, '#ffefb0', 10, 'opacity=".55"') + L('M-36 -56 v90 M36 -56 v90 M0 -56 v90', IRON, 6) + R(-46, 34, 92, 22, IRON, 6) + C(0, 0, 12, '#ff9a2a'),
 'satchel': lambda: L('M-50 -40 Q0 -140 50 -40', LEATHER, 10) + R(-90, -40, 180, 120, dk(LEATHER, .1), 16) + P('M-90 -40 L90 -40 L90 10 Q0 30 -90 10Z', LEATHER) + R(-12, 4, 24, 26, BRASS, 4),
 'pickaxe': lambda: L('M-80 90 L40 -40', WOOD, 16) + P('M-30 -70 Q40 -100 110 -30 Q60 -60 20 -40 Q-10 -50 -30 -70Z', '#9aa0a6') + P('M-30 -70 Q-10 -50 20 -40 L30 -50Z', lt('#9aa0a6', .3)),
 'sextant': lambda: P('M0 -90 L-80 50 Q0 80 80 50Z', BRASS) + P('M0 -60 L-50 38 Q0 56 50 38Z', '#3a3226') + L('M0 -90 L40 50', lt(BRASS, .3), 8) + C(0, -90, 12, dk(BRASS, .2)) + R(-90, -20, 50, 18, dk(BRASS, .2), 8),
 'ledger': lambda: book('#5a3a6a', band=BRASS),
 'brush': lambda: R(-120, -12, 150, 24, WOOD, 12, 'transform="rotate(-16)"') + P('M24 -26 L110 -60 Q124 -30 114 -6 L30 6Z', '#e8d8b0', 'transform="rotate(-2)"') + R(10, -30, 28, 34, BRASS, 4, 'transform="rotate(-16)"'),
 'tarp': lambda: P('M-120 -40 Q0 -70 120 -40 L110 60 Q0 40 -110 60Z', '#5a7a5a') + P('M-120 -40 Q0 -70 120 -40 L116 -10 Q0 -40 -116 -10Z', lt('#5a7a5a', .15)) + ''.join(C(x, y, 6, BRASS) for x, y in [(-110, -36), (110, -36), (-102, 54), (102, 54)]) + L('M110 -36 q20 -40 0 -70', '#c8a060', 5),
 'camera': lambda: R(-90, -50, 180, 110, '#3a3a3e', 12) + R(-90, -50, 180, 26, '#5a3a2a', 10) + C(0, 10, 44, '#26262a') + C(0, 10, 30, '#4a6a8a') + C(-8, 2, 10, lt('#4a6a8a', .5)) + R(46, -72, 30, 22, '#3a3a3e', 4) + R(-70, -66, 24, 16, BRASS, 3),
 'hammock': lambda: L('M-130 -60 L-90 -20 M130 -60 L90 -20', '#c8a060', 6) + P('M-90 -20 Q0 90 90 -20 Q0 40 -90 -20Z', '#d8603a') + L('M-80 0 Q0 70 80 0 M-70 18 Q0 76 70 18', '#f2c040', 6) + R(-140, -70, 20, 160, WOOD, 6) + R(120, -70, 20, 160, WOOD, 6),
 'kettle': lambda: L('M-50 -60 Q0 -120 50 -60', IRON, 8) + P('M-70 60 Q-80 -30 -40 -50 L40 -50 Q80 -30 70 60Z', '#6a7076') + P('M70 0 Q120 -10 120 -50 L106 -50 Q100 -20 66 -14Z', '#6a7076') + E(0, -50, 42, 10, dk('#6a7076', .2)) + E(0, -60, 14, 8, dk(IRON, .1)) + P('M-56 -20 Q-66 20 -50 50', lt('#6a7076', .25), 'stroke-width="8"').replace('fill=', 'stroke="' + lt('#6a7076', .25) + '" fill="none" data-x='),
 'spyglass': lambda: R(-120, -16, 70, 32, BRASS, 6, 'transform="rotate(-14)"') + R(-56, -20, 80, 40, dk(BRASS, .1), 6, 'transform="rotate(-14)"') + R(20, -26, 90, 52, LEATHER, 8, 'transform="rotate(-14)"') + R(104, -30, 16, 60, BRASS, 4, 'transform="rotate(-14)"'),
 'jeepkey': lambda: C(-50, 0, 46, BRASS) + C(-50, 0, 18, '#e8d8b0') + R(-10, -12, 120, 24, BRASS, 6) + R(70, 12, 14, 22, BRASS) + R(94, 12, 14, 30, BRASS) + C(-50, 0, 60, 'none', f'stroke="{IRON}" stroke-width="6"'),
 'chisel': lambda: R(-120, -16, 110, 32, WOOD, 10, 'transform="rotate(-10)"') + P('M-14 -14 L100 -26 L120 0 L100 20 L-14 12Z', '#9aa0a6', 'transform="rotate(-10)"') + L('M-10 -8 L104 -20', lt('#9aa0a6', .3), 5, 'transform="rotate(-10)"'),
 'scale': lambda: R(-6, -90, 12, 150, BRASS) + R(-50, 56, 100, 16, dk(BRASS, .2), 6) + L('M-100 -70 L100 -70', BRASS, 8) + L('M-100 -70 L-130 0 M-100 -70 L-70 0 M100 -70 L70 0 M100 -70 L130 0', IRON, 3) + P('M-140 0 Q-100 30 -60 0Z', BRASS) + P('M60 0 Q100 30 140 0Z', BRASS) + C(-100, -8, 10, '#3fa07a'),
 'journal': lambda: book('#7a4e2c', band='#a8483a', emblem=C(-6, 26, 16, BRASS)),
 'flares': lambda: ''.join(R(x, -60, 30, 120, c, 8, f'transform="rotate({a} {x} 0)"') + R(x, -72, 30, 22, '#f2e2c0', 6, f'transform="rotate({a} {x} 0)"') for x, a, c in [(-60, -12, '#d8302a'), (-14, 0, '#e8602a'), (32, 12, '#d8302a')]) + L('M-16 -86 q6 -20 -4 -30', '#ffb040', 6),
 'crate': lambda: R(-100, -70, 200, 150, dk(WOOD, .1), 6) + ''.join(R(-100, -70 + i * 50, 200, 44, WOOD, 4) for i in range(3)) + L('M-96 -66 L96 76', dk(WOOD, .25), 14) + ''.join(C(x, y, 5, IRON) for x in (-90, 90) for y in (-60, 70)),
 'radio': lambda: R(-100, -60, 200, 130, '#5a6a4a', 12) + R(-84, -44, 100, 60, '#3a3a2e', 8) + C(60, -14, 24, '#3a3a2e') + C(60, -14, 10, BRASS) + C(-60, 40, 10, BRASS) + C(-30, 40, 10, BRASS) + L('M70 -60 L110 -120', IRON, 5) + ''.join(L(f'M{-76 + i * 14} -36 v44', '#5a5a48', 4) for i in range(7)),
 'tent': lambda: P('M-130 70 L0 -90 L130 70Z', '#d8c89a') + P('M-130 70 L0 -90 L0 70Z', lt('#d8c89a', .15)) + P('M-30 70 L0 0 L30 70Z', '#5a4a3a') + L('M0 -90 v-20', WOOD, 6) + P('M0 -110 l30 8 l-30 8Z', '#d8302a'),
 'dinghy': lambda: P('M-130 0 Q-130 60 -60 60 L80 60 Q140 60 130 0Z', '#e8a03a') + E(0, 0, 130, 22, dk('#e8a03a', .2)) + E(0, 0, 108, 14, '#6a4a2a') + L('M-40 -60 L40 40', WOOD, 8) + E(46, 46, 16, 8, WOOD),
 'ropebridge': lambda: L('M-130 -50 Q0 20 130 -50', '#c8a060', 6) + L('M-130 0 Q0 70 130 0', '#c8a060', 6) + ''.join(R(-120 + i * 30, (abs(-105 + i * 30) / 130) ** 2 * -40 + 40, 22, 16, WOOD, 3) for i in range(9)) + R(-140, -70, 16, 100, dk(WOOD, .1), 4) + R(124, -70, 16, 100, dk(WOOD, .1), 4),
 'almanac': lambda: book('#2a5a7a', band=BRASS, emblem=P('M-30 20 q15 -14 30 0 t30 0', 'none', f'stroke="{lt("#2a5a7a", .5)}" stroke-width="6"')),
 'theodolite': lambda: L('M0 10 L-70 100 M0 10 L70 100 M0 10 L0 100', WOOD, 10) + R(-30, -10, 60, 26, BRASS, 6) + R(-70, -66, 120, 40, BRASS, 18) + C(50, -46, 14, '#4a6a8a') + R(-10, -30, 20, 24, dk(BRASS, .2)),
 'mule': lambda: E(0, 10, 90, 46, '#8a7060') + R(-70, 40, 14, 60, '#6a5446', 6) + R(-30, 40, 14, 60, '#6a5446', 6) + R(30, 40, 14, 60, '#6a5446', 6) + R(60, 40, 14, 60, '#6a5446', 6) + P('M70 -10 Q100 -70 130 -50 Q140 -20 110 0Z', '#8a7060') + P('M100 -70 l6 -30 l10 28Z', '#6a5446') + C(118, -50, 5, '#1e1e22') + R(-50, -50, 90, 50, '#c8a060', 10) + R(-40, -40, 70, 10, LEATHER),
 'seaplane': lambda: R(-130, -10, 220, 40, '#d8402a', 20) + R(-20, -60, 60, 130, '#e8d8b0', 8, 'transform="rotate(90 10 5) translate(0 0)"') + R(-60, -46, 150, 16, '#e8d8b0', 6) + P('M-130 -10 L-150 -50 L-110 -10Z', '#d8402a') + C(96, 10, 18, IRON) + L('M96 -20 v60', '#3a3a3e', 6) + R(-90, 60, 160, 12, '#9aa0a6', 6) + L('M-60 30 v30 M40 30 v30', IRON, 4),
 'lockbox': lambda: R(-100, -50, 200, 120, '#5a5e62', 10) + R(-100, -60, 200, 40, '#6a6e72', 10) + R(-20, -10, 40, 50, BRASS, 6) + C(0, 8, 7, '#1e1e22') + R(-3, 8, 6, 18, '#1e1e22') + ''.join(C(x, y, 5, '#8a8e92') for x in (-88, 88) for y in (-46, 58)),
 'codebook': lambda: book('#2a2a32', band='#d8302a', emblem=R(-30, 14, 40, 40, BRASS, 4) + C(-10, 34, 8, '#2a2a32')),
 'quiver': lambda: R(-30, -50, 60, 150, LEATHER, 14, 'transform="rotate(16)"') + ''.join(L(f'M{x} -50 L{x + 20} -120', WOOD, 5, 'transform="rotate(16)"') + P(f'M{x + 14} -120 l6 -16 l10 14Z', '#e8e0d0', 'transform="rotate(16)"') for x in (-16, 0, 16)) + R(-30, 0, 60, 12, BRASS, 0, 'transform="rotate(16)"'),
 'permit': lambda: R(-90, -80, 180, 160, CANVAS, 6) + ''.join(R(-70, -54 + i * 22, 120 - (i % 2) * 40, 8, dk(CANVAS, .25), 4) for i in range(5)) + C(50, 50, 22, '#a8302a') + C(50, 50, 12, dk('#a8302a', .2)),
 'mapcase': lambda: R(-130, -26, 260, 52, LEATHER, 26, 'transform="rotate(-12)"') + R(-130, -26, 40, 52, dk(LEATHER, .2), 20, 'transform="rotate(-12)"') + R(-10, -26, 12, 52, BRASS, 0, 'transform="rotate(-12)"') + L('M-100 -40 Q0 -110 100 -60', dk(LEATHER, .2), 6),
 'gramophone': lambda: R(-80, 20, 160, 70, WOOD, 8) + L('M40 20 L40 -10', BRASS, 8) + P('M30 -10 Q-40 -30 -100 -120 Q-30 -110 30 -40 Q60 -70 40 -10Z', BRASS) + P('M-100 -120 Q-130 -60 -60 -70 Q-30 -110 -100 -120Z', dk(BRASS, .25)) + E(0, 20, 70, 10, '#2a2a2e'),
 'airship': lambda: E(0, -30, 130, 50, '#c8b8a0') + E(0, -44, 120, 26, lt('#c8b8a0', .2)) + P('M110 -30 L150 -70 L150 10Z', '#a8302a') + R(-40, 30, 80, 30, WOOD, 8) + L('M-30 14 L-30 30 M30 14 L30 30', IRON, 4) + L('M-120 -30 H120', dk('#c8b8a0', .15), 4),
}

ART = {
 'ember-mask': lambda: mask('#c8502a', '#ffb040', eyes='#ff8a2a'),
 'reed-flute': lambda: ''.join(R(-110 + i * 28, -60 + i * 10, 22, 140 - i * 20, ['#b8a060', '#c8b070'][i % 2], 10) for i in range(7)) + L('M-112 20 H82', '#8a5a33', 8),
 'clay-cup': lambda: vessel(CLAY, 60, 60, 54, band='#3a2a20'),
 'bone-dice': lambda: G(R(-50, -50, 100, 100, BONE, 16) + C(-24, -24, 10, '#3a3226') + C(24, 24, 10, '#3a3226') + C(0, 0, 10, '#3a3226'), 'translate(-50 10) rotate(-12)') + G(R(-40, -40, 80, 80, lt(BONE, .1), 14) + C(-18, -18, 8, '#3a3226') + C(18, 18, 8, '#3a3226'), 'translate(70 -10) rotate(16)'),
 'moss-idol': lambda: figure(STONE, eyes2(12, -56, 6) + P('M-34 -70 Q0 -96 34 -70 Q0 -80 -34 -70Z', LEAF), LEAF) + E(-30, 40, 20, 10, LEAF),
 'sun-disc': lambda: disc(GOLD, dk(GOLD, .2), C(0, 0, 30, lt(GOLD, .2)) + eyes2(12, -6, 5, dk(GOLD, .5)), rays=True),
 'vine-crown': lambda: P('M-90 40 L-90 -20 L-50 10 L0 -50 L50 10 L90 -20 L90 40Z', GOLD) + R(-90, 30, 180, 26, dk(GOLD, .2), 6) + L('M-96 40 Q-40 0 0 40 T96 30', LEAF, 10) + ''.join(E(x, y, 14, 8, LEAF, f'transform="rotate(-30 {x} {y})"') for x, y in [(-60, 26), (10, 44), (70, 20)]) + C(0, 42, 10, JADE),
 'star-chart': lambda: scroll('#2a3a5a', ''.join(C(x, y, r, '#f2e6b0') for x, y, r in [(-60, -20, 6), (-20, 10, 4), (20, -30, 7), (60, 20, 5), (0, 40, 4), (-70, 34, 3)]) + L('M-60 -20 L-20 10 L20 -30 L60 20', '#f2e6b0', 2, 'opacity=".6"')),
 'jade-frog': lambda: E(0, 30, 90, 50, JADE) + E(0, -20, 70, 46, lt(JADE, .1)) + C(-40, -56, 22, JADE) + C(40, -56, 22, JADE) + C(-40, -56, 10, '#1e1e22') + C(40, -56, 10, '#1e1e22') + L('M-30 -6 Q0 10 30 -6', dk(JADE, .3), 5) + E(-70, 70, 30, 12, dk(JADE, .2)) + E(70, 70, 30, 12, dk(JADE, .2)),
 'rain-drum': lambda: R(-80, -50, 160, 120, '#8a4e2c', 10) + E(0, -50, 80, 22, '#e8d8b0') + E(0, 70, 80, 22, dk('#8a4e2c', .2)) + ''.join(L(f'M{x} -40 L{x + 30} 60', '#e8d8b0', 4) for x in range(-70, 60, 30)) + R(-80, 10, 160, 10, TEAL),
 'ash-urn': lambda: vessel('#6a6460', 64, 80, 30, handles=True, band='#a8302a', lid=P('M-36 -80 Q0 -120 36 -80Z', dk('#6a6460', .1))),
 'thorn-key': lambda: C(-70, 0, 40, '#4a3a2a') + C(-70, 0, 18, '#1f2a24') + R(-34, -10, 150, 20, '#4a3a2a', 6) + ''.join(P(f'M{x} -10 l8 -22 l8 22Z', '#4a3a2a') for x in range(-20, 100, 26)) + R(90, 10, 14, 30, '#4a3a2a') + R(110, 10, 10, 20, '#4a3a2a') + C(-70, 0, 10, JADE),
 'owl-totem': lambda: R(-50, -100, 100, 200, WOOD, 12) + C(-22, -60, 20, '#f2e6c0') + C(22, -60, 20, '#f2e6c0') + C(-22, -60, 10, '#1e1e22') + C(22, -60, 10, '#1e1e22') + P('M-10 -38 L10 -38 L0 -20Z', OCHRE) + P('M-50 -100 L-30 -130 L-10 -100Z', WOOD) + P('M50 -100 L30 -130 L10 -100Z', WOOD) + ''.join(L(f'M-40 {y} q40 16 80 0', dk(WOOD, .25), 6) for y in (10, 40, 70)),
 'tide-shell': lambda: P('M0 70 Q-110 40 -100 -30 Q-80 -90 0 -90 Q80 -90 100 -30 Q110 40 0 70Z', '#f2c0a8') + ''.join(L(f'M0 66 L{x} -84', dk('#f2c0a8', .2), 5) for x in (-80, -40, 0, 40, 80)) + R(-30, 60, 60, 24, lt('#f2c0a8', .1), 8),
 'root-sceptre': lambda: L('M-90 90 Q-20 20 40 -40', '#6a4a2a', 18) + L('M-60 60 q-30 -10 -40 10 M-30 30 q-20 -30 -40 -20', '#6a4a2a', 7) + C(56, -56, 34, JADE) + C(46, -66, 10, lt(JADE, .5)) + L('M30 -30 q20 -40 50 -30 q20 30 -10 60', '#6a4a2a', 7),
 'glyph-stone': lambda: R(-80, -90, 160, 180, STONE, 18) + ''.join(R(-56 + (i % 3) * 40, -66 + (i // 3) * 40, 28, 28, dk(STONE, .2), 6) for i in range(12)) + L('M50 -90 l-14 40 l18 30', dk(STONE, .35), 4),
 'serpent-ring': lambda: C(0, 0, 70, 'none', f'stroke="{GOLD}" stroke-width="26"') + C(0, 0, 70, 'none', f'stroke="{dk(GOLD, .2)}" stroke-width="6" stroke-dasharray="10 14"') + E(60, -46, 30, 20, GOLD, 'transform="rotate(-36 60 -46)"') + C(70, -52, 6, '#d8302a'),
 'moon-comb': lambda: P('M-110 -20 Q0 -120 110 -20 Q0 -70 -110 -20Z', '#c8ccd8') + ''.join(R(-100 + i * 20, -24 + abs(i - 5) ** 1.6, 10, 90, '#c8ccd8', 5) for i in range(11)) + C(0, -60, 12, '#8a9ac8'),
 'bat-wing-fan': lambda: ''.join(P(f'M0 70 L{130 * math.cos(math.radians(a)):.0f} {70 + 130 * math.sin(math.radians(a)):.0f} L{130 * math.cos(math.radians(a + 18)):.0f} {70 + 130 * math.sin(math.radians(a + 18)):.0f}Z', ['#3a2a3a', '#4a3a4a'][i % 2]) for i, a in enumerate(range(-170, -10, 18))) + R(-8, 50, 16, 50, WOOD, 6) + C(0, 70, 10, GOLD),
 'lava-blade': lambda: P('M-120 20 L80 -30 Q120 -36 130 -30 Q110 -10 80 -8 L-110 40Z', OBS) + L('M-90 24 L60 -20 M-40 16 l20 -14 M10 0 l26 -10', '#ff7a2a', 4) + R(-150, 16, 50, 28, LEATHER, 10, 'transform="rotate(-14 -125 30)"'),
 'spirit-bowl': lambda: P('M-110 -10 Q-100 80 0 80 Q100 80 110 -10Z', TEAL) + E(0, -10, 110, 26, dk(TEAL, .3)) + E(0, -10, 90, 16, '#9ae8e0', 'opacity=".8"') + R(-40, 76, 80, 16, dk(TEAL, .2), 6) + ''.join(C(x, 30, 8, GOLD) for x in (-60, -20, 20, 60)),
 'wind-chime': lambda: R(-90, -90, 180, 16, WOOD, 6) + ''.join(L(f'M{x} -76 v{30 + h}', '#c8a060', 3) + R(x - 9, -46 + h, 18, 70 + (i % 2) * 20, ['#c8ccd0', BRASS][i % 2], 9) for i, (x, h) in enumerate([(-70, 10), (-35, 0), (0, 20), (35, 0), (70, 10)])),
 'gilded-beetle': lambda: E(0, 20, 64, 80, GOLD) + L('M0 -50 V100', dk(GOLD, .3), 5) + C(0, -70, 34, dk(GOLD, .15)) + L('M-30 -90 q-20 -30 -40 -30 M30 -90 q20 -30 40 -30 M-60 0 l-40 -10 M60 0 l40 -10 M-60 50 l-40 20 M60 50 l40 20', dk(GOLD, .35), 6) + E(-24, 0, 12, 30, lt(GOLD, .35)),
 'storm-horn': lambda: horn('#5a6a8a', '#e8e0d0', '#f2d040') + L('M-40 -60 l20 20 l-14 6 l20 22', '#f2d040', 5),
 'coral-throne': lambda: R(-80, -10, 160, 40, '#e8705a', 10) + P('M-70 -10 Q-80 -110 -40 -120 Q-20 -60 0 -130 Q20 -60 40 -120 Q80 -110 70 -10Z', '#f08a6a') + R(-70, 30, 20, 60, '#d8604a', 6) + R(50, 30, 20, 60, '#d8604a', 6) + ''.join(C(x, y, 6, lt('#f08a6a', .4)) for x, y in [(-40, -80), (0, -96), (40, -80), (-20, -40), (20, -50)]),
 'ancestor-mask': lambda: mask('#8a5a3a', '#f2e6c0', crown=''.join(P(f'M{x} -84 L{x + 10} -130 L{x + 20} -84Z', c) for x, c in [(-60, '#d8302a'), (-30, OCHRE), (0, JADE), (30, OCHRE), (50, '#d8302a')])),
 'obsidian-mirror': lambda: E(0, 0, 84, 100, GOLD) + E(0, 0, 70, 86, OBS) + E(-24, -30, 16, 30, '#5a5a6a', 'opacity=".8"') + R(-14, 96, 28, 40, dk(GOLD, .2), 6),
 'feather-cloak': lambda: ''.join(E(x, y, 22, 50, c, f'transform="rotate({a} {x} {y})"') for x, y, a, c in [(-80, 20, 30, '#2a8a6a'), (-50, 30, 18, '#d8402a'), (-20, 36, 6, '#e8b030'), (10, 36, -6, '#2a8a6a'), (40, 30, -18, '#d8402a'), (70, 20, -30, '#e8b030'), (-60, -20, 24, '#e8b030'), (-20, -10, 8, '#2a8a6a'), (20, -10, -8, '#d8402a'), (60, -20, -24, '#2a8a6a')]) + R(-70, -70, 140, 20, GOLD, 8),
 'tusk-horn': lambda: horn(BONE, dk(BONE, .25), '#8a5a33'),
 'sky-lens': lambda: disc('#9ad0e8', BRASS, C(-20, -20, 18, '#ffffff', 'opacity=".6"')) + R(-12, 76, 24, 50, BRASS, 6),
 'twin-idols': lambda: G(figure(JADE, eyes2(10, -56, 5), GOLD), 'translate(-56 10) scale(.8)') + G(figure(GOLD, eyes2(10, -56, 5), JADE), 'translate(56 10) scale(.8)'),
 'old-codex': lambda: book('#6a4a2a', pages='#e2cc98', open_=True, emblem=C(-55, 0, 14, '#a8302a') + C(55, 0, 14, JADE)),
 'gold-mask': lambda: mask(GOLD, JADE, eyes='#3a2a10') + ''.join(C(x, 80, 6, '#3fa07a') for x in (-20, 0, 20)),
 'stone-heart': lambda: P('M0 90 Q-120 0 -90 -60 Q-60 -110 0 -60 Q60 -110 90 -60 Q120 0 0 90Z', STONE) + L('M-30 -60 l14 40 l-20 30 l30 30', dk(STONE, .3), 5) + C(10, -10, 16, '#d8402a', 'opacity=".85"'),
 'world-seed': lambda: E(0, 10, 70, 90, '#8a5a33') + E(-20, -10, 20, 50, lt('#8a5a33', .2)) + L('M0 -80 Q20 -120 60 -120', LEAF, 8) + E(64, -110, 30, 14, LEAF, 'transform="rotate(-20 64 -110)"') + C(0, 10, 100, 'none', f'stroke="{GOLD}" stroke-width="3" stroke-dasharray="4 10"'),
}

# ---------- scenes ----------
def camp_scene(seed):
    r = random.Random(seed)
    o = R(0, 0, 400, 300, '#cfe0c0') + P('M0 120 Q100 90 200 110 T400 100 V300 H0Z', '#9cc28c')
    o += P('M250 210 L330 60 L410 210Z', '#e2d4b0') + P('M250 210 L330 60 L330 210Z', '#efe4c6') + P('M305 210 L330 150 L355 210Z', '#7a6a50')
    for x in (20, 70, 380):
        o += L(f'M{x} 220 Q{x + 10} 150 {x + 30} 110', '#3f7a4a', 6) + ''.join(E(x + 8 + k * 6, 200 - k * 22, 18, 7, '#4f9a5a', f'transform="rotate(-30 {x + 8 + k * 6} {200 - k * 22})"') for k in range(4))
    o += R(0, 210, 400, 90, '#a8784a') + R(0, 210, 400, 10, '#c8925a') + L('M0 250 H400 M0 280 H400', '#94683e', 3)
    return o

def ruin_scene(seed):
    o = R(0, 0, 400, 300, '#2c3a32')
    for j in range(6):
        for i in range(6):
            x = i * 76 - (j % 2) * 38; y = j * 42
            o += R(x + 2, y + 2, 72, 38, ['#3a4a40', '#34443a', '#405046'][(i + j) % 3], 4)
    o += L('M30 0 Q60 80 20 160 M370 0 Q330 90 380 180', '#3f7a4a', 8) + ''.join(E(x, y, 14, 7, '#4f9a5a', f'transform="rotate({a} {x} {y})"') for x, y, a in [(44, 40, 30), (36, 100, -30), (356, 50, -30), (364, 120, 30), (26, 150, 20)])
    o += f'<radialGradient id="gl"><stop offset="0" stop-color="#ffe2a0" stop-opacity=".55"/><stop offset="1" stop-color="#ffe2a0" stop-opacity="0"/></radialGradient>' + E(200, 140, 160, 120, 'url(#gl)')
    o += R(0, 222, 400, 78, '#7a7468') + R(0, 222, 400, 12, '#9a9488') + L('M60 250 l20 30 M300 240 l-10 40', '#5a554c', 3)
    return o

def card(name):
    if name in ITEMS: bg, f, s = camp_scene(len(name)), ITEMS[name], .98
    elif name in ART: bg, f, s = ruin_scene(len(name)), ART[name], .98
    else: return special(name)
    body = f()
    return svg(400, 300, bg + G(E(0, 96, 120, 14, '#000', 'opacity=".22"'), 'translate(200 128)') + G(body, f'translate(200 122) scale({s})'))

def special(name):
    if name == 'card-dread' or name == 'dread':
        o = R(0, 0, 400, 300, '#16201c') + ''.join(L(f'M{x} 0 Q{x + 20} 120 {x - 10} {200 + x % 60}', '#24382c', 10) for x in range(10, 400, 46))
        o += E(200, 160, 120, 80, '#0c1210') + E(170, 150, 14, 8, '#d8f0e0') + E(230, 150, 14, 8, '#d8f0e0') + R(0, 250, 400, 50, '#1c2a22')
        return svg(400, 300, o)
    if name in ('card-grant', 'grant'):
        return svg(400, 300, camp_scene(3) + G(R(-100, -64, 200, 128, CANVAS, 6) + P('M-100 -64 L0 10 L100 -64Z', dk(CANVAS, .1)) + C(0, 10, 22, '#a8302a') + C(0, 10, 12, dk('#a8302a', .2)) + G(E(0, 0, 40, 30, LEATHER) + L('M-20 -26 q20 -16 40 0', dk(LEATHER, .3), 5) + C(30, 24, 12, GOLD) + C(46, 18, 12, GOLD), 'translate(110 50)'), 'translate(180 130) scale(.85)'))
    if name in ('card-trail', 'trail'):
        return svg(400, 300, camp_scene(9) + G(book('#5a6a3a', open_=True, emblem=L('M-90 30 Q-50 -30 -20 10 T40 -20 T90 20', '#a8302a', 4, 'stroke-dasharray="8 8"')), 'translate(200 130) scale(.8)'))

CARD_KEYS = list(ITEMS) + list(ART)
