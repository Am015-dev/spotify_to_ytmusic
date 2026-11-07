#!/usr/bin/env python3
"""Compose deep-signal free-kit pictures. Usage: FREEKIT_CACHE=/path python3 compose.py [sheet.png]"""
import sys, os, json
H = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, H + '/../../free-kit')
import generic
G = lambda n, c=None: ('g', n, c) if c else ('g', n)
CFG = dict(
    stage=(30, 90, 120), stages=[(30, 90, 120), (25, 110, 110), (60, 70, 130), (30, 70, 100)], tex='blue_metal_plate', paper=(160, 190, 205), ground='damp_sand', table='blue_metal_plate',
    bands=[(30, 120, 140), (190, 130, 50), (150, 70, 80), (60, 100, 160)], badges=['hexagon_tile', 'award', 'flag_triangle'], chars=['q_whale', 'penguin', 'narwhal', 'walrus', 'frog', 'q_fish', 'hippo'],
    pool=[G('hexagon'), G('token'), G('spinner')], card_ground=False,
    kw=[(r'coral', ('a', 'q_fish', (240, 120, 100))), (r'kelp', G('resource_wheat')), (r'tide', ('a', 'q_whale')), (r'amber', G('hexagon')), (r'sonar|ping|signal', G('spinner')), (r'flare|fire', G('fire')),
        (r'trick', G('cards_fan')), (r'deadzone|silence|jam', G('lock_closed')), (r'decide|goal|share', G('hand_token')), (r'drone', ('a', 'q_piranha')), (r'warden|boss', ('a', 'q_whale')), (r'swarm', ('a', 'q_piranha')),
        (r'source', G('spinner')), (r'complete|win', G('award')), (r'lost|lose', G('skull')), (r'captain|you', ('a', 'penguin')), (r'order|relative|final', G('flag_triangle')), (r'act', G('hexagon_tile')), (r'emblem', G('spinner'))],
    scene=dict(sky=[((10, 50, 90), (20, 100, 130)), ((5, 30, 70), (25, 80, 110))], ground='blue_metal_plate', gtint=(60, 110, 140), mid='blue_metal_plate', midtint=(30, 80, 120), haze=(20, 90, 130),
               props=[(('a', 'q_whale'), .7, .38, .13), (('a', 'q_fish', (120, 220, 220)), .25, .55, .07), (('a', 'q_fish', (120, 220, 220)), .45, .3, .06), (('c', 'ship', (10, 25, 40)), .4, .82, .12)]),
    fxcol=(120, 230, 235))
if __name__ == '__main__':
    generic.main('deep-signal', 'deep-signal', H, json.load(open(H + '/../assets.json'))['items'], CFG, sys.argv[1] if len(sys.argv) > 1 else None)
