#!/usr/bin/env python3
"""Writes specs.json: one three.js scene per picture (KayKit Medieval Hexagon models). usage: python3 specs.py [out.json]"""
import json, sys, math
def B(n, c): return f'buildings/{c}/building_{n}_{c}'
def N(n): return f'buildings/neutral/{n}'
def P(n): return f'decoration/props/{n}'
def D(n): return f'decoration/nature/{n}'
def T(n): return f'tiles/base/{n}'
def o(m, p=(0,0,0), r=0, s=1, nofit=False, sy=1): return {'m': m, 'p': list(p), 'r': r, 's': s, **({'nofit': True} if nofit else {}), **({'sy': sy} if sy != 1 else {})}
GRASS, DIRT, WATER = o(T('hex_grass'), sy=.22), o(N('building_dirt')), o(T('hex_water'), sy=.22)
PROPSCENES = {'a1-timber-stand','a1-brick-cut','a1-rock-face','a1-stone-depot','a1-clay-depot','a1-timber-depot','a1-herb-garden','a1-mud-basin','a1-reed-press','a2-sawpit','a2-kiln-yard','a2-podium','a2-parade-ground','a3-armory','a3-fountain','a3-gardens','a2-caravan-post','a2-herbarium','g-merchants','g-moneylenders','g-tacticians','a1-open-stage','a3-war-pavilion','a2-customs-quay','a1-pony-pen','a2-horse-yard','a1-stake-fence','a2-deep-quarry','a3-siege-yard','g-builders','a2-drying-rack'}
def fence_sq(s=1.0):  # four wooden fences round a pen
    return [o(N('fence_wood_straight'), (0, 0, -1.0), 0, s), o(N('fence_wood_straight'), (0, 0, 1.0), 0, s), o(N('fence_wood_straight'), (-1.0, 0, 0), 90, s), o(N('fence_wood_straight_gate'), (1.0, 0, 0), 90, s)]
CARDS = {  # stem: (objs, az, el)
 # age 1 brown / grey / blue / green / yellow / red
 'a1-timber-stand': [o(P('resource_lumber'), (0,0,0), 20, 2.4), o(D('tree_single_B_cut'), (-1.7,0,-.9), 0, 1.4), o(D('trees_B_cut'), (1.6,0,1.2), 0, 1.3)],
 'a1-hewing-camp': [GRASS, o(B('lumbermill','yellow'), (0,0,0), 0, 1)],
 'a1-mud-basin': [DIRT, o(P('wheelbarrow'), (.1,0,.1), -30, 1.9), o(P('bucket_water'), (-.8,0,-.7), 0, 1.3)],
 'a1-brick-cut': [DIRT, o(P('crate_A_big'), (-.5,0,-.2), 15, 1.0), o(P('crate_A_small'), (.55,0,-.3), -10, 1.0), o(P('crate_A_small'), (-.1,0,.65), 5, 1.0), o(P('crate_A_small'), (-.5,1.0,-.2), 30, .8)],
 'a1-rock-face': [o(D('rock_single_C'), (0,0,0), 20, 2.6), o(D('rock_single_A'), (1.5,0,.9), 0, 1.5), o(P('resource_stone'), (-1.4,0,1.0), 25, 1.3)],
 'a1-gravel-pit': [o(B('mine','yellow'), (0,0,0), 0, 1)],
 'a1-glass-kiln': [GRASS, o(B('blacksmith','yellow'), (0,0,0), 0, 1)],
 'a1-reed-press': [GRASS, o(D('waterplant_C'), (-.2,0,-.3), 0, 3.2), o(P('sack'), (.8,0,.6), 20, 1.2)],
 'a1-open-stage': [GRASS, o(P('tent'), (0,0,0), 0, 3.4), o(P('flag_blue'), (-1.2,0,.9), 0, 2.0), o(P('flag_blue'), (1.2,0,.9), 0, 2.0)],
 'a1-shrine': [GRASS, o(B('church','blue'), (0,0,0), 0, 1)],
 'a1-bathhouse': [WATER, o(B('well','blue'), (0,0,0), 0, 1.5), o(D('waterlily_A'), (.9,0,.8), 0, 1.2)],
 'a1-herb-garden': [GRASS, o(P('crate_long_B'), (-.2,0,-.5), 0, 1.5), o(P('crate_long_A'), (-.2,0,.55), 0, 1.5), o(D('waterplant_A'), (1.1,0,0), 0, 1.6)],
 'a1-weights-hall': [GRASS, o(B('market','green'), (0,0,0), 0, 1)],
 'a1-scribe-room': [GRASS, o(B('home_A','green'), (0,0,0), 0, 1)],
 'a1-remedy-shop': [GRASS, o(B('home_B','green'), (0,0,0), 0, 1)],
 'a1-roadside-inn': [GRASS, o(B('home_A','yellow'), (0,0,0), 0, 1)],
 'a1-timber-depot': [GRASS, o(P('resource_lumber'), (-.4,0,-.3), 20, 2.0), o(P('crate_A_big'), (.9,0,.5), 0, 1.0), o(P('pallet'), (-.2,0,.9), 0, 1.2)],
 'a1-clay-depot': [DIRT, o(P('barrel'), (-.6,0,-.3), 0, 1.6), o(P('crate_A_small'), (.7,0,-.1), 20, 1.4), o(P('barrel'), (.1,0,.8), 0, 1.3)],
 'a1-stone-depot': [GRASS, o(P('resource_stone'), (-.2,0,-.2), 15, 2.2), o(P('crate_B_big'), (1.0,0,.6), 0, 1.0)],
 'a1-pony-pen': [GRASS] + fence_sq(0.9) + [o(P('sack'), (0,0,0), 20, 1.0), o(P('weaponrack'), (.3,0,-.5), 0, 1.2)],
 'a1-barrack-yard': [GRASS, o(B('home_B','red'), (0,0,0), 0, 1)],
 'a1-stake-fence': [GRASS, o(N('fence_wood_straight'), (0,0,-.6), 0, 1.0), o(N('fence_wood_straight'), (0,0,.6), 0, 1.0), o(P('tent'), (0,0,0), 0, 1.4)],
 'a1-lookout': [GRASS, o(B('tower_B','red'), (0,0,0), 0, 1)],
 # age 2
 'a2-sawpit': [DIRT, o(P('resource_lumber'), (-.3,0,-.4), 25, 1.9), o(P('pallet'), (.5,0,.7), 0, 1.5), o(D('tree_single_A_cut'), (1.1,0,-.8), 0, 1.3)],
 'a2-kiln-yard': [DIRT, o(P('crate_A_big'), (-.6,0,-.3), 0, 1.1), o(P('crate_A_big'), (.7,0,.0), 25, 1.1), o(P('crate_A_small'), (-.1,0,.8), 0, 1.3), o(P('barrel'), (.9,0,.9), 0, 1.0)],
 'a2-deep-quarry': [o(D('mountain_C'), (0,0,0), 0, 1.0), o(P('resource_stone'), (1.7,0,1.3), 20, 1.0)],
 'a2-glassblower': [GRASS, o(B('blacksmith','blue'), (0,0,0), 0, 1)],
 'a2-drying-rack': [GRASS, o(N('building_scaffolding'), (0,0,0), 0, 1.3), o(D('waterplant_C'), (1.2,0,1.0), 0, 1.6)],
 'a2-judges-hall': [GRASS, o(B('home_A','blue'), (0,0,0), 0, 1)],
 'a2-hero-monument': [GRASS, o(B('tower_B','blue'), (0,0,0), 0, 1)],
 'a2-sun-temple': [GRASS, o(B('church','yellow'), (0,0,0), 0, 1)],
 'a2-water-arch': [WATER, o(N('building_bridge_A'), (0,0,0), 0, 1.0), o(D('waterlily_B'), (.7,0,.8), 0, 1.1)],
 'a2-podium': [GRASS, o(P('crate_B_big'), (0,0,0), 0, 1.6), o(P('flag_blue'), (-.9,0,.5), 0, 2.0), o(P('flag_blue'), (.9,0,.5), 0, 2.0)],
 'a2-star-gazers': [GRASS, o(B('tower_A','green'), (0,0,0), 0, 1)],
 'a2-chart-room': [GRASS, o(B('home_A','green'), (0,0,0), 90, 1), o(P('crate_long_C'), (1.0,0,1.0), 0, 1.0)],
 'a2-herbarium': [GRASS, o(P('crate_long_B'), (-.2,0,-.5), 0, 1.6), o(D('waterplant_A'), (.9,0,.6), 0, 2.0), o(D('waterplant_B'), (-.9,0,.7), 0, 2.0)],
 'a2-measure-hall': [GRASS, o(B('tower_base','green'), (0,0,0), 0, 1)],
 'a2-open-bazaar': [GRASS, o(B('market','yellow'), (0,0,0), 0, 1)],
 'a2-caravan-post': [GRASS, o(P('tent'), (-.3,0,-.2), 0, 2.6), o(P('wheelbarrow'), (.9,0,.7), 20, 1.4), o(P('sack'), (-.6,0,.9), 0, 1.1)],
 'a2-customs-quay': [WATER, o(N('fence_wood_straight_gate'), (0,0,0), 0, 1.4), o(P('crate_A_big'), (.9,0,.8), 0, .8), o(P('barrel'), (-.9,0,.8), 0, 1.0)],
 'a2-brewhouse': [GRASS, o(B('tavern','yellow'), (0,0,0), 0, 1)],
 'a2-horse-yard': [GRASS] + fence_sq(0.9) + [o(P('sack'), (0,0,0), 20, 1.1)],
 'a2-barracks': [GRASS, o(B('barracks','red'), (0,0,0), 0, 1)],
 'a2-archery-range': [GRASS, o(B('archeryrange','red'), (0,0,0), 0, 1)],
 'a2-parade-ground': [GRASS, o(P('flag_red'), (-1.0,0,0), 0, 3.0), o(P('flag_red'), (0,0,0), 0, 3.0), o(P('flag_red'), (1.0,0,0), 0, 3.0)],
 'a2-city-wall': [GRASS, o(N('wall_straight_gate'), (0,0,0), 0, 1)],
 # age 3
 'a3-pantheon': [GRASS, o(B('castle','blue'), (0,0,0), 0, 1)],
 'a3-gardens': [GRASS, o(D('trees_B_medium'), (-.4,0,-.3), 0, 1.0), o(P('bucket_water'), (.7,0,.7), 0, 1.5), o(D('trees_B_small'), (.9,0,-.6), 0, 1.0)],
 'a3-town-hall': [GRASS, o(B('home_B','blue'), (0,0,0), 0, 1)],
 'a3-palace': [GRASS, o(B('tower_base','blue'), (-.5,0,0), 0, 1), o(B('tower_A','blue'), (.5,0,.2), 0, 1)],
 'a3-obelisk': [GRASS, o(B('tower_A','blue'), (0,0,0), 0, 1)],
 'a3-fountain': [GRASS, o(P('bucket_water'), (0,0,0), 0, 3.0), o(D('waterlily_A'), (1.2,0,1.0), 0, 1.0)],
 'a3-planetarium': [GRASS, o(B('tower_A','green'), (-.3,0,0), 0, 1), o(D('cloud_small'), (.8,2.4,0), 0, .7, True)],
 'a3-globe-hall': [GRASS, o(B('castle','green'), (0,0,0), 0, 1)],
 'a3-scholar-court': [GRASS, o(B('church','green'), (0,0,0), 0, 1)],
 'a3-apothecary-guild': [GRASS, o(B('tavern','green'), (0,0,0), 0, 1)],
 'a3-trade-chamber': [GRASS, o(B('castle','yellow'), (0,0,0), 0, 1)],
 'a3-beacon-quay': [WATER, o(B('tower_A','yellow'), (0,0,0), 0, 1)],
 'a3-sand-arena': [GRASS, o(B('barracks','yellow'), (0,0,0), 0, 1)],
 'a3-grand-port': [WATER, o(B('market','yellow'), (0,0,0), 0, 1)],
 'a3-armory': [GRASS, o(P('weaponrack'), (-.5,0,0), 0, 2.2), o(P('target'), (.8,0,.4), -20, 2.0)],
 'a3-bastion': [GRASS, o(B('tower_base','red'), (0,0,0), 0, 1), o(N('wall_corner_A_outside'), (0,0,0), 0, 0.01)],
 'a3-siege-yard': [GRASS, o(N('building_scaffolding'), (0,0,0), 0, 1.3), o(P('ladder'), (1.0,0,0), 0, 1.6)],
 'a3-arsenal': [GRASS, o(B('tower_catapult','red'), (0,0,0), 0, 1)],
 'a3-war-pavilion': [GRASS, o(P('tent'), (0,0,0), 0, 3.0), o(P('flag_red'), (-1.2,0,.9), 0, 2.2), o(P('flag_red'), (1.2,0,.9), 0, 2.2)],
 'a3-high-fort': [GRASS, o(B('castle','red'), (0,0,0), 0, 1)],
 # guilds (purple frame)
 'g-merchants': [GRASS, o(P('crate_long_B'), (0,0,0), 0, 2.4), o(P('sack'), (1.2,0,.8), 0, 1.0)],
 'g-shipowners': [WATER, o(B('watermill','yellow'), (0,0,0), 0, 1)],
 'g-builders': [GRASS, o(N('building_scaffolding'), (-.2,0,0), 0, 1.3), o(P('resource_stone'), (1.0,0,.9), 0, 1.0)],
 'g-magistrates': [GRASS, o(B('tower_base','blue'), (0,0,0), 0, 1)],
 'g-scientists': [GRASS, o(B('tower_B','green'), (0,0,0), 0, 1)],
 'g-tacticians': [GRASS, o(P('tent'), (-.2,0,0), 0, 2.4), o(P('weaponrack'), (1.0,0,.8), 0, 1.2), o(P('target'), (-1.0,0,.8), 0, 1.0)],
 'g-moneylenders': [GRASS, o(P('crate_open'), (-.4,0,-.1), 0, 2.2), o(P('crate_open'), (.9,0,.8), 0, 1.0), o(P('sack'), (-1.0,0,.9), 0, 1.0)],
}
WONDERS = {
 'w-bronze-titan': [WATER, o(B('tower_A','yellow'), (0,0,0), 0, 1.6), o(B('tower_B','yellow'), (-1.6,0,.4), 0, 0.9)],
 'w-sky-tomb': [o(T('hex_grass'), (0,0,0), 0, 1.0, False, .22), o(D('mountain_C'), (0,0,0), 0, 1.0), o(P('flag_yellow'), (0,2.2,0), 0, 2.4), o(P('flag_yellow'), (-.9,0,.9), 0, 2.2), o(P('flag_yellow'), (.9,0,.9), 0, 2.2)],
 'w-moon-grove': [GRASS, o(B('church','blue'), (0,0,0), 0, 1.2), o(D('trees_B_large'), (-1.5,0,.5), 0, 1.0), o(D('trees_B_medium'), (1.6,0,.3), 0, 1.0)],
 'w-terraced-orchard': [o(D('mountain_B_grass'), (0,0,0), 0, 1), o(D('trees_B_small'), (1.4,0,.9), 0, 1.0), o(D('trees_B_small'), (-1.4,0,.9), 0, 1.0)],
 'w-archive-of-dust': [GRASS, o(B('barracks','green'), (0,0,0), 0, 1.2)],
 'w-marble-barrow': [o(D('hills_A'), (0,0,0), 0, 1.4), o(N('wall_corner_A_gate'), (0,0,.2), 0, 1.0)],
 'w-stone-riddle': [o(T('hex_grass'), (0,0,0), 0, 1.5, False, .22), o(P('sack'), (-.3,0,.7), 0, 4.0), o(D('rock_single_C'), (.6,0,-.7), 0, 3.0), o(D('rock_single_E'), (-1.2,0,-.9), 0, 2.2)],
 'w-beacon-isle': [WATER, o(D('rock_single_C'), (0,0,0), 0, 1.3), o(B('tower_A','yellow'), (0,.2,0), 0, 1.2)],
 'w-grand-arena': [GRASS, o(B('barracks','red'), (0,0,0), 0, 1.4), o(P('flag_red'), (-1.4,0,.9), 0, 2.4), o(P('flag_red'), (1.4,0,.9), 0, 2.4)],
 'w-thunder-idol': [GRASS, o(B('tower_B','yellow'), (0,0,0), 0, 1.5), o(P('flag_yellow'), (-1.0,0,.8), 0, 2.0), o(P('flag_yellow'), (1.0,0,.8), 0, 2.0)],
 'w-merchant-road': [o(T('hex_grass'), (-2,0,0)), o(T('hex_grass'), (0,0,0)), o(T('hex_grass'), (2,0,0)), o(P('wheelbarrow'), (-1.8,0,.3), 90, 1.4), o(B('market','yellow'), (.2,0,0), 0, .9), o(P('flag_yellow'), (2.0,0,.4), 0, 2.0)],
 'w-sunken-harbor': [WATER, o(B('watermill','yellow'), (0,0,0), 0, 1.0), o(D('waterlily_A'), (1.0,0,1.0), 0, 1.4), o(D('waterplant_C'), (-1.0,0,.9), 0, 1.4)],
}
# progress tokens + resource icons (small, centred object)
ICONS = {
 't-agriculture': [o(N('building_grain'), (0,0,0), 0, 1), o(B('windmill','yellow'), (0,0,0), 0, 1)],
 't-architecture': [o(N('building_scaffolding'), (0,0,0), 0, 1)],
 't-economy': [o(P('crate_long_A'), (0,0,0), 0, 1)],
 't-law': [o(N('wall_straight_gate'), (0,0,0), 0, 1)],
 't-masonry': [o(P('resource_stone'), (0,0,0), 20, 1)],
 't-mathematics': [o(P('crate_long_B'), (0,0,0), 0, 1)],
 't-philosophy': [o(D('hill_single_A'), (0,0,0), 0, 1), o(D('tree_single_B'), (0,0,0), 0, 1.6)],
 't-strategy': [o(P('weaponrack'), (0,0,0), 0, 1)],
 't-theology': [o(B('church','blue'), (0,0,0), 0, 1)],
 't-urbanism': [o(B('home_A','yellow'), (-.4,0,.3), 0, 1), o(B('home_B','yellow'), (.7,0,-.5), 0, 1)],
 'res-wood': [o(P('resource_lumber'), (0,0,0), 20, 1)],
 'res-clay': [o(N('building_dirt'), (0,0,0), 0, 1)],
 'res-stone': [o(P('resource_stone'), (0,0,0), 20, 1)],
 'res-glass': [o(P('bucket_water'), (0,0,0), 0, 1)],
 'res-papyrus': [o(D('waterplant_C'), (0,0,0), 0, 1)],
 'military-pawn': [o(P('flag_yellow'), (0,0,0), 0, 2.8), o(P('barrel'), (0,-.62,0), 0, .9, False, .5)],
 'logo-castle-blue': [o(B('castle','blue'), (0,0,0), 0, 1)],
 'logo-castle-red': [o(B('castle','red'), (0,0,0), 0, 1)],
 'logo-tower-gold': [o(B('tower_A','yellow'), (0,0,0), 0, 1)],
}
def hexpos(q, r): return (2*q + (r % 2), 0, 1.7320508*r)
def island(rows, cols_for, deco, skip=()):
    out = []
    for r in range(-rows, rows+1):
        w = cols_for(r)
        for q in range(-w, w+1):
            if (q, r) in skip: continue
            x, _, z = hexpos(q, r)
            out.append(o(T('hex_grass'), (x, 0, z)))
    for (q, r, m, rot, s, dy) in deco:
        x, _, z = hexpos(q, r); out.append(o(m, (x, dy, z), rot, s))
    return out
def ring_water(tiles, rows, cols_for):
    out = []
    for r in range(-rows-1, rows+2):
        for q in range(-cols_for(max(-rows, min(rows, r)))-2, cols_for(max(-rows, min(rows, r)))+3):
            x, _, z = hexpos(q, r)
            out.append(o(T('hex_water'), (x, 0, z)))
    return out
SPECS = []
def grow(v, k):
    out = []
    if not any(x['m'].startswith('tiles/') or x['m'].endswith('building_dirt') for x in v): out.append(o(T('hex_grass'), sy=.22))
    for x in v:
        y = dict(x)
        if x['m'].startswith('tiles/') or x['m'].endswith('building_dirt'): y['s'] = x['s'] * k
        else: y['p'] = [x['p'][0] * k, x['p'][1], x['p'][2] * k]; y['s'] = x['s'] * (1.45 if x['m'].startswith(('decoration/props','decoration/nature')) else 1)
        out.append(y)
    return out
for k, v in CARDS.items():
    if k in PROPSCENES: v = grow(v, 0.78)
    SPECS.append({'id': k, 'w': 900, 'h': 900, 'objs': v, 'az': 35, 'el': 33, 'margin': .02})
for k, v in WONDERS.items(): SPECS.append({'id': k, 'w': 1100, 'h': 800, 'objs': v, 'az': 35, 'el': 30, 'margin': .03})
for k, v in ICONS.items(): SPECS.append({'id': k, 'w': 640, 'h': 640, 'objs': v, 'az': 35, 'el': 33, 'margin': .03})
# title island: two kingdoms facing across a calm valley
dec = [(-4,0,B('castle','blue'),90,1.0,0), (4,0,B('castle','red'),-90,1.0,0), (-3,-2,D('mountain_B_grass'),0,1.0,0), (3,-2,D('mountain_A_grass_trees'),0,1.0,0),
       (-3,2,D('hills_A_trees'),0,1.0,0), (3,2,D('hills_B_trees'),0,1.0,0), (-5,-1,D('trees_B_large'),0,1.0,0), (5,1,D('trees_A_large'),0,1.0,0), (-2,-3,D('trees_B_medium'),0,1.0,0),
       (2,-3,D('trees_A_medium'),0,1.0,0), (-1,3,D('trees_B_small'),0,1.0,0), (1,3,D('trees_A_small'),0,1.0,0), (-4,-3,D('rock_single_C'),0,1.0,0), (4,3,D('rock_single_B'),0,1.0,0),
       (-4,2,B('windmill','blue'),0,1.0,0), (4,-2,B('tower_B','red'),0,1.0,0), (-2,1,B('home_A','blue'),0,1.0,0), (2,-1,B('home_A','red'),0,1.0,0), (0,-2,P('tent'),0,2.2,0), (0,2,P('flag_yellow'),0,2.4,0)]
cols = lambda r: 6 - abs(r)//1
isl = island(3, lambda r: 6 - abs(r), dec)
water = []
for r in range(-10, 11):
    for q in range(-16, 17):
        x, _, z = hexpos(q, r)
        if not any(abs(t['p'][0]-x) < .1 and abs(t['p'][2]-z) < .1 for t in isl): water.append(o(T('hex_water'), (x, 0, z), 0, 1, True))
SPECS.append({'id': 'scene-title', 'w': 2400, 'h': 1350, 'objs': water + isl, 'az': 0, 'el': 40, 'margin': .03})
dec2 = [(0,0,B('castle','blue'),0,1.2,0), (-3,1,P('flag_blue'),0,3.0,0), (3,1,P('flag_blue'),0,3.0,0), (-2,-2,D('trees_B_large'),0,1.0,0), (2,-2,D('trees_B_medium'),0,1.0,0), (-4,-1,D('hills_A_trees'),0,1.0,0), (4,-1,D('mountain_B_grass'),0,1.0,0), (-2,3,B('home_A','blue'),0,1.0,0), (2,3,B('windmill','blue'),0,1.0,0), (0,3,P('crate_long_A'),0,1.4,0)]
isl2 = island(3, lambda r: 5 - abs(r), dec2)
water2 = [o(T('hex_water'), hexpos(q, r), 0, 1, True) for r in range(-10, 11) for q in range(-16, 17) if not any(abs(t['p'][0]-hexpos(q, r)[0]) < .1 and abs(t['p'][2]-hexpos(q, r)[2]) < .1 for t in isl2)]
SPECS.append({'id': 'scene-victory', 'w': 2400, 'h': 1350, 'objs': water2 + isl2, 'az': 0, 'el': 40, 'margin': .03})
dec3 = [(0,0,N('building_destroyed'),0,1.4,0), (-3,1,N('building_destroyed'),0,1.0,0), (3,1,P('flag_red'),0,3.0,0), (-2,-2,D('trees_B_cut'),0,1.5,0), (2,-2,D('tree_single_A_cut'),0,1.5,0), (-4,-1,D('rock_single_C'),0,1.5,0), (4,-1,D('rock_single_A'),0,1.5,0), (2,3,N('building_destroyed'),0,1.0,0), (-2,3,P('barrel'),0,1.6,0), (0,3,P('crate_open'),0,1.6,0)]
isl3 = island(3, lambda r: 5 - abs(r), dec3)
water3 = [o(T('hex_water'), hexpos(q, r), 0, 1, True) for r in range(-10, 11) for q in range(-16, 17) if not any(abs(t['p'][0]-hexpos(q, r)[0]) < .1 and abs(t['p'][2]-hexpos(q, r)[2]) < .1 for t in isl3)]
SPECS.append({'id': 'scene-defeat', 'w': 2400, 'h': 1350, 'objs': water3 + isl3, 'az': 0, 'el': 40, 'margin': .03})
# table-top and boards: top-down hex rows
SPECS.append({'id': 'row-grass', 'w': 2400, 'h': 400, 'objs': [o(T('hex_grass'), hexpos(q, 0)) for q in range(-12, 13)] + [o(T('hex_grass'), hexpos(q, 1)) for q in range(-12, 12)], 'az': 0, 'el': 62, 'margin': 0})
json.dump(SPECS, open(sys.argv[1] if len(sys.argv) > 1 else 'specs.json', 'w'))
print(len(SPECS), 'specs')
