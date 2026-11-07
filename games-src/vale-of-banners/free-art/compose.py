#!/usr/bin/env python3
"""Compose vale-of-banners free-kit pictures. Usage: FREEKIT_CACHE=/path python3 compose.py [sheet.png]
(slot list copied to slots.json because assets.json lives on another branch)"""
import sys, os, json
H = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, H + '/../../free-kit')
import generic
G = lambda n, c=None: ('g', n, c) if c else ('g', n)
CFG = dict(
    stage=(110, 140, 80), stages=[(110, 140, 80), (150, 120, 70), (90, 130, 140), (140, 100, 90)], tex='rough_linen', paper=(236, 224, 196), ground='aerial_grass_rock', table='brown_planks_03',
    bands=[(90, 130, 70)], badges=['flag_triangle'], chars=['bear', 'goat', 'owl', 'moose', 'horse', 'buffalo', 'rabbit'], card_ground=True,
    pool=[('c', 'treePines'), ('c', 'bush'), ('c', 'rocks'), ('c', 'house'), ('a', 'rabbit'), ('c', 'well'), ('c', 'fence'), ('c', 'flag'), ('c', 'mill'), ('a', 'q_dog')],
    kw=[(r'bld-hall|keep', ('c', 'castleWide')), (r'carp', G('resource_planks')), (r'chapel', ('c', 'church')), (r'mkt', G('pouch')), (r'inn', ('c', 'houseChimney')), (r'mint', G('dollar')),
        (r'tower', ('c', 'towerTall')), (r'store', ('c', 'chest')), (r'mine', ('c', 'mine')), (r'barge', ('c', 'ship')), (r'tile-back', ('c', 'compass')), (r'sheep', ('a', 'q_sheep')), (r'goat', ('a', 'goat')),
        (r'pig', ('a', 'pig')), (r'goose', ('a', 'duck')), (r'goods-1', G('resource_wheat')), (r'goods-2', G('resource_iron')), (r'goods-3', G('resource_lumber')), (r'goods-4', G('resource_planks')),
        (r'goods-5', G('resource_wood')), (r'goods-6', G('resource_apple')), (r'banner-', ('c', 'flag')), (r'worker', G('character')), (r'silver', G('dollar')), (r'points', G('award')), (r'die', G('d6')),
        (r'icon-workers', G('character')), (r'icon-silver', G('dollar')), (r'icon-points', G('award')), (r'icon-storage', ('c', 'chest')), (r'icon-backlane', ('c', 'pathStraight')), (r'icon-season', G('hourglass')),
        (r'icon-track', G('flag_triangle')), (r'win', G('crown_a')), (r'lose', G('skull')), (r'scroll', G('book_open')), (r'coin', G('dollar')), (r'chain', G('token')), (r'region', G('award')), (r'boss', ('a', 'bear'))],
    scene=dict(sky=[((150, 195, 235), (245, 235, 200)), ((245, 200, 140), (255, 240, 205))], ground='aerial_grass_rock', mid='cliff_side', midtint=(130, 160, 130), haze=(230, 238, 235),
               props=[(('c', 'houseViking', (45, 35, 25)), .2, .76, .2), (('c', 'castleWide', (45, 35, 25)), .66, .68, .26), (('c', 'treePines', (25, 55, 35)), .92, .8, .26), (('a', 'q_sheep'), .4, .9, .12), (('c', 'mill', (45, 35, 25)), .08, .72, .22)]),
    fxcol=(255, 220, 130))
if __name__ == '__main__':
    generic.main('vale-of-banners', 'vale-of-banners', H, json.load(open(H + '/slots.json')), CFG, sys.argv[1] if len(sys.argv) > 1 else None)
