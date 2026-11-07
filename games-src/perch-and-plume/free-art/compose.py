#!/usr/bin/env python3
"""Compose perch-and-plume free-kit pictures. Usage: FREEKIT_CACHE=/path python3 compose.py [sheet.png]"""
import sys, os, json
H = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, H + '/../../free-kit')
import generic
from kit import *
G = lambda n: ('g', n)
SPECIES = {'warbler': 'q_bird', 'woodpecker': 'parrot', 'nuthatch': 'q_bird', 'owl': 'owl', 'jay': 'q_bird', 'thrush': 'q_bird', 'tanager': 'parrot', 'kinglet': 'q_chick',
           'treecreeper': 'q_bird', 'vireo': 'q_bird', 'lark': 'q_chick', 'pipit': 'q_chick', 'bunting': 'q_chick', 'quail': 'chicken', 'kestrel': 'q_eagle', 'harrier': 'q_eagle',
           'meadowlark': 'q_chick', 'finch': 'q_bird', 'shrike': 'q_eagle', 'dove': 'q_bird', 'heron': 'duck', 'rail': 'chicken', 'grebe': 'duck', 'teal': 'duck', 'plover': 'q_chick',
           'kingfisher': 'q_bird', 'bittern': 'duck', 'sandpiper': 'q_bird'}
COL = {'copper': (200, 110, 50), 'tidal': (50, 150, 160), 'hazel': (150, 105, 60), 'fern': (80, 150, 80), 'marsh': (110, 130, 70), 'briar': (130, 60, 50), 'rust': (190, 90, 50),
       'ember': (220, 70, 40), 'gilded': (225, 180, 60), 'lantern': (240, 180, 70), 'slate': (100, 115, 140), 'moss': (90, 140, 70), 'velvet': (130, 70, 150), 'hollow': (130, 120, 105),
       'dawn': (240, 140, 150), 'larch': (150, 170, 70), 'sun': (250, 210, 60), 'cinder': (80, 80, 85), 'pebble': (150, 150, 145), 'silver': (200, 205, 215), 'dusk': (80, 80, 150),
       'umber': (110, 75, 45), 'amber': (225, 150, 40), 'rush': (150, 160, 90), 'cobalt': (50, 90, 190), 'saffron': (245, 170, 40), 'opal': (150, 215, 215), 'pine': (50, 100, 70),
       'russet': (170, 80, 50), 'sedge': (130, 140, 80), 'sorrel': (190, 70, 60), 'mist': (170, 190, 205), 'bramble': (110, 60, 90), 'wisp': (210, 215, 220), 'willow': (120, 150, 120),
       'nettle': (90, 150, 90), 'storm': (60, 75, 120), 'ashen': (130, 130, 135), 'clover': (80, 160, 90), 'quill': (170, 150, 110), 'cobble': (140, 130, 120), 'wren': (150, 110, 80)}
HAB = {'warbler': (110, 150, 100), 'woodpecker': (95, 130, 90), 'nuthatch': (95, 130, 90), 'owl': (90, 105, 140), 'heron': (80, 140, 150), 'grebe': (80, 140, 150), 'teal': (80, 140, 150), 'rail': (90, 140, 130),
       'bittern': (90, 140, 130), 'plover': (190, 170, 100), 'sandpiper': (190, 170, 100), 'lark': (190, 170, 90), 'pipit': (190, 170, 90), 'bunting': (190, 170, 90), 'quail': (190, 165, 95), 'meadowlark': (190, 170, 90)}
def special(it, T):
    s = it['stem']
    if s.startswith('bird-'):
        _, c, sp = s.split('-', 2); a = SPECIES.get(sp, 'q_bird'); col = COL.get(c, (150, 130, 100)); st = HAB.get(sp, (110, 150, 120))
        ground = 'damp_sand' if st[2] > 130 and sp in ('heron', 'grebe', 'teal', 'rail', 'bittern') else ('aerial_grass_rock' if st[0] > 150 else 'forest_ground_04')
        sub = lambda: tint(animal(a, seed_of(s) & 1), col, .85)
        out = card(it['w'], it['h'], sub, 'rough_linen', (236, 226, 200), st, None, glyph(['shield', 'flag_triangle', 'award', 'hexagon_tile'][seed_of(sp) % 4], (255, 246, 220)), seed=s, ground=T(ground), scale=.95)
        return out, ['polyhaven', 'quaternius' if a.startswith('q_') else 'kenney-animals', 'kenney-icons']
CFG = dict(
    stage=(110, 150, 110), stages=[(110, 150, 110), (150, 130, 90), (90, 140, 150), (170, 150, 90)], tex='rough_linen', paper=(236, 226, 200), ground='aerial_grass_rock', table='brown_planks_03',
    bands=[(70, 120, 80), (160, 110, 50), (60, 100, 140)], badges=['flag_triangle', 'shield', 'award'], chars=['owl', 'parrot', 'chicken', 'duck', 'penguin', 'rabbit', 'goat', 'bear'],
    pool=[G('hexagon_tile'), G('award'), G('token'), G('pouch')], special=special, card_ground=True,
    kw=[(r'food-grub|grub', ('a', 'snake')), (r'seed|wheat', G('resource_wheat')), (r'fish', ('a', 'q_fish')), (r'berry|apple', G('resource_apple')), (r'rodent|mouse', ('a', 'rabbit')),
        (r'egg', G('token')), (r'nest', ('c', 'campfire')), (r'feeder', ('c', 'well')), (r'trophy', G('crown_a')), (r'tray|cube', G('d6')), (r'back', G('card')),
        (r'goal|birds', ('a', 'q_bird')), (r'eggs', G('token')), (r'row-forest', ('c', 'treePines')), (r'row-grass', ('c', 'bush')), (r'row-wet', ('c', 'lake')), (r'bonus|keeper|saver|picker', ('a', 'owl')),
        (r'angler|mouser|digger', ('a', 'q_cat')), (r'chain|pop|spark', G('token'))],
    scene=dict(sky=[((190, 215, 235), (250, 235, 200)), ((250, 200, 150), (255, 240, 205))], ground='aerial_grass_rock', mid='forest_ground_04', midtint=(110, 150, 110), haze=(235, 240, 235),
               props=[(('c', 'treePines', (30, 55, 35)), .12, .78, .28), (('c', 'treePineTall', (30, 55, 35)), .3, .74, .2), (('c', 'lake', (50, 80, 100)), .75, .84, .14), (('a', 'q_bird'), .6, .3, .1), (('a', 'q_bird'), .35, .22, .08)]),
    fxcol=(255, 235, 150))
if __name__ == '__main__':
    generic.main('perch-and-plume', 'perch-and-plume', H, json.load(open(H + '/../assets.json'))['items'], CFG, sys.argv[1] if len(sys.argv) > 1 else None)
