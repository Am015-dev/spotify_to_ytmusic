#!/usr/bin/env python3
"""Compose stitchwise free-kit pictures. Usage: FREEKIT_CACHE=/path python3 compose.py [sheet.png]
(slot list copied to slots.json because assets.json lives on another branch)"""
import sys, os, json
H = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, H + '/../../free-kit')
import generic
from kit import *
G = lambda n, c=None: ('g', n, c) if c else ('g', n)
FAB = ['rough_linen', 'denim_fabric', 'gingham_check', 'wool_boucle', 'knitted_fleece', 'floral_jacquard', 'velour_velvet', 'hessian_230', 'brown_leather', 'fabric_leather_01', 'flour']
PAL = [(220, 90, 90), (90, 140, 220), (240, 200, 80), (110, 190, 120), (200, 120, 200), (240, 150, 70), (80, 190, 190), (180, 90, 130), (150, 170, 90), (230, 140, 150), (110, 110, 190), (200, 190, 150)]
def special(it, T):
    s = it['stem']
    if s.startswith('fabric-') or s in ('patch-leather', 'bonus-tile', 'torn-square'):
        n = int(s[-2:]) if s.startswith('fabric-') else 5 + len(s)
        t = 'brown_leather' if s == 'patch-leather' else FAB[n % len(FAB)]; col = PAL[(n * 5) % len(PAL)]
        w, h = it['w'], it['h']
        im = tex(T(t), w, h, s, tint=col, k=.85 if t not in ('brown_leather',) else .3, bright=1.1).convert('RGBA')
        d = ImageDraw.Draw(im); m = int(w * .07); dash = max(6, w // 22)
        for x in range(m, w - m, dash * 2):
            d.line((x, m, min(x + dash, w - m), m), fill=(255, 250, 235, 235), width=max(2, w // 90)); d.line((x, h - m, min(x + dash, w - m), h - m), fill=(255, 250, 235, 235), width=max(2, w // 90))
        for y in range(m, h - m, dash * 2):
            d.line((m, y, m, min(y + dash, h - m)), fill=(255, 250, 235, 235), width=max(2, w // 90)); d.line((w - m, y, w - m, min(y + dash, h - m)), fill=(255, 250, 235, 235), width=max(2, w // 90))
        if s == 'bonus-tile': put(im, fit(glyph('award', (255, 246, 220)), w, h, .5), w / 2, h / 2)
        if s == 'torn-square':
            msk = Image.new('L', (w, h), 255); dd = ImageDraw.Draw(msk); r = random.Random(1)
            for x in range(0, w, 12): dd.rectangle((x, 0, x + 12, r.randint(0, 14)), fill=0)
            im.putalpha(msk)
        return im, ['polyhaven']
CFG = dict(
    stage=(180, 120, 130), stages=[(180, 120, 130), (120, 150, 190), (190, 160, 90), (120, 170, 120)], tex='rough_linen', paper=(236, 224, 200), ground='rough_linen', table='gingham_check', table_tint=(230, 190, 190),
    bands=[(180, 90, 110)], badges=['hexagon_tile'], chars=['rabbit', 'sloth', 'q_sheep', 'goat', 'owl', 'panda', 'pig', 'bear', 'q_llama', 'chicken', 'duck'], card_ground=False,
    pool=[G('award'), G('hexagon_tile'), G('puzzle')], special=special,
    kw=[(r'token-me', ('a', 'rabbit')), (r'token-opp', ('a', 'q_cat')), (r'hourglass', G('hourglass')), (r'button', G('hexagon_tile')), (r'sparkle', G('award')), (r'stitch', G('pawn')), (r'bonus|leather', G('award')),
        (r'win', G('crown_a')), (r'lose', G('skull')), (r'offer|frame|track', G('card'))],
    scene=dict(sky=[((235, 215, 220), (250, 235, 215)), ((200, 220, 235), (250, 240, 220))], ground='gingham_check', gtint=(235, 190, 200), mid='wool_boucle', midtint=(220, 170, 190), haze=(250, 235, 235),
               props=[(('c', 'houseSmall', (80, 50, 55)), .2, .78, .18), (('a', 'q_sheep'), .6, .85, .14), (('c', 'treePines', (60, 80, 60)), .88, .8, .24), (('a', 'rabbit'), .4, .92, .1)]),
    fxcol=(255, 230, 160))
if __name__ == '__main__':
    generic.main('stitchwise', 'stitchwise', H, json.load(open(H + '/slots.json')), CFG, sys.argv[1] if len(sys.argv) > 1 else None)
