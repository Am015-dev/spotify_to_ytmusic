#!/usr/bin/env python3
"""Compose vinegrave free-kit pictures. Usage: FREEKIT_CACHE=/path python3 compose.py [sheet.png]"""
import sys, os, json
H = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, H + '/../../free-kit')
import generic
G = lambda n, c=None: ('g', n, c) if c else ('g', n)
CFG = dict(
    stage=(70, 120, 95), stages=[(70, 120, 95), (60, 105, 110), (120, 110, 60), (90, 120, 70), (110, 85, 70)], tex='rough_linen', paper=(232, 220, 190), ground='forest_ground_04',
    table='brown_planks_05', bands=[(48, 105, 80), (150, 105, 40), (110, 60, 50), (60, 90, 120)], badges=['compass' if False else 'flag_triangle', 'shield', 'award', 'hexagon_tile'],
    chars=['gorilla', 'monkey', 'parrot', 'sloth', 'rabbit', 'owl', 'bear', 'panda'],
    pool=[G('book_closed'), G('pouch'), G('flask_full'), G('hexagon_tile'), G('award'), G('puzzle'), G('token'), G('hand')],
    kw=[(r'dread|fear', G('skull')), (r'machete|chisel|blade|pickaxe|hammer|thorn', G('sword')), (r'rope|bridge', ('c', 'bridgeRope')), (r'lamp|flare|ember|campfire', ('c', 'campfire')),
        (r'tent|tarp|hammock', ('c', 'tent')), (r'camera|spyglass|sextant|lens|theodolite', G('hourglass')), (r'journal|ledger|almanac|codex|codebook|permit|chart|map', G('book_open')),
        (r'mule|horse', ('a', 'horse')), (r'seaplane|airship|dinghy|ship|wreck', ('c', 'ship')), (r'crate|lockbox|chest', ('c', 'chest')), (r'canteen|kettle|cup|bowl|urn', G('flask_full')),
        (r'mask|crown|throne|gold|sun-disc|disc', G('crown_a')), (r'owl', ('a', 'owl')), (r'frog|toad', ('a', 'frog')), (r'snake|serpent|wyrm|ford', ('a', 'snake')), (r'boar|pig', ('a', 'pig')),
        (r'jaguar|cat', ('a', 'q_cat')), (r'ape|golem|warden', ('a', 'gorilla')), (r'heron|bird|moth|bat|feather|fish|beetle', ('a', 'parrot')), (r'hound|dog', ('a', 'q_dog')),
        (r'crawler|widow|tick', ('a', 'crocodile')), (r'idol-moon|moon|star', G('suit_diamonds')), (r'idol-sun|sun', G('fire')), (r'tide|coral|well|pool|spring|cove|water', ('c', 'lake')),
        (r'cliff|pit|stair|vault|cave|hall', ('c', 'rocksMountain')), (r'palace|court|arch|altar|gate|chapel|temple|statue', ('c', 'castleWide')), (r'tree|fern|root|thorn|vine', ('c', 'treePines')),
        (r'res-coin|dollar', G('dollar')), (r'res-compass|compass', ('c', 'compass')), (r'res-jewel', G('hexagon')), (r'tr-ship', ('c', 'ship')), (r'explorer|notebook', G('character')),
        (r'discover', G('award')), (r'story|howto|quick', G('book_open')), (r'^icon', G('hourglass')), (r'map-act|board-map|track', ('c', 'compass'))],
    scene=dict(sky=[((140, 190, 170), (225, 225, 170)), ((70, 120, 120), (190, 200, 150))], ground='forest_ground_04', mid='lichen_rock', midtint=(110, 150, 120), haze=(200, 225, 205),
               props=[(('c', 'treePines', (20, 50, 30)), .1, .8, .3), (('c', 'treePineTall', (20, 50, 30)), .27, .76, .22), (('c', 'pyramid', (30, 40, 30)), .72, .66, .22), (('c', 'treePines', (20, 50, 30)), .92, .8, .3), (('a', 'parrot'), .55, .9, .16)]),
    fxcol=(150, 235, 190))
if __name__ == '__main__':
    generic.main('vinegrave', 'vinegrave', H, json.load(open(H + '/../assets.json'))['items'], CFG, sys.argv[1] if len(sys.argv) > 1 else None)
