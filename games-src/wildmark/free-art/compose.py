#!/usr/bin/env python3
"""Compose the wildmark free-kit pictures. Needs the cache from games-src/free-kit (fetch.py + render.js).
Usage: FREEKIT_CACHE=/path python3 compose.py [sheet.png]"""
import sys, os, json
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'free-kit'))
from kit import *
HERE = os.path.dirname(os.path.abspath(__file__))
slots = json.load(open(HERE + '/../assets.json'))['items']
TEX = set()
def T(name): TEX.add(name); return name

ANIMAL = {'bear': ('bear', False, (120, 90, 60)), 'elk': ('moose', False, (95, 120, 80)), 'salmon': ('q_fish', False, (70, 120, 150)),
          'hawk': ('q_eagle', False, (120, 150, 175)), 'fox': ('q_red_fox', False, (150, 120, 70)), 'acorn': (None, False, (140, 110, 60))}
GROUND = {'bear': 'forest_ground_04', 'elk': 'aerial_grass_rock', 'salmon': 'damp_sand', 'hawk': 'cliff_side', 'fox': 'forest_leaves_04'}
STAGES = {'a': (110, 145, 100), 'b': (150, 125, 85), 'c': (95, 125, 150), 'd': (140, 105, 120)}
BANDS = {'a': (88, 130, 78), 'b': (176, 126, 52), 'c': (70, 110, 150), 'd': (140, 80, 100)}
PORT = {'ranger': ('bear', (95, 130, 90)), 'rowan': ('rabbit', (150, 120, 80)), 'pip': ('chick', (190, 160, 70)), 'bram': ('buffalo', (120, 95, 70)),
        'sorrel': ('goat', (130, 120, 90)), 'quill': ('owl', (100, 100, 140)), 'linnet': ('parrot', (80, 140, 130)), 'oake': ('moose', (105, 125, 85)),
        'warden': ('gorilla', (80, 90, 100)), 'frost': ('q_wolf', (110, 150, 180)), 'snowline': ('penguin', (130, 170, 200))}
TERR = {'peak': ('cliff_side', (200, 205, 215), 'rocksMountain'), 'forest': ('forest_ground_04', (120, 160, 110), 'treePines'),
        'meadow': ('aerial_grass_rock', (170, 190, 100), 'bush'), 'marsh': ('mossy_sandstone', (110, 140, 120), 'lake'), 'river': ('damp_sand', (110, 160, 190), 'bridge')}

def recipe(it):
    s, k, w, h = it['stem'], it['kind'], it['w'], it['h']
    if s == 'title-bg':
        return scene(w, h, ((120, 160, 205), (235, 215, 170)), T('aerial_grass_rock'), 0.6, mid_tex=T('cliff_side'), mid_tint=(150, 160, 190), haze=(220, 225, 235), seed=s, dark_top=0.25,
                     props=[(lambda: ink(carto('treePines'), (25, 45, 30)), .12, .78, .26), (lambda: ink(carto('treePineTall'), (25, 45, 30)), .3, .74, .2),
                            (lambda: animal('moose'), .78, .8, .2), (lambda: animal('q_eagle'), .62, .22, .12), (lambda: ink(carto('treePines'), (25, 45, 30)), .9, .75, .26)]), ['polyhaven', 'kenney-carto', 'kenney-animals', 'quaternius']
    if s == 'table-bg':
        return tex(T('brown_planks_03'), w, h, s, tint=(170, 135, 95), k=.5, bright=.8), ['polyhaven']
    if s.startswith('ter-'):
        t, c, prop = TERR[s[4:]]
        base = tex(T(t), w, h, s, tint=c, k=.55).convert('RGBA')
        sp = ink(carto(prop), (30, 40, 30)); sp = fit(sp, w, h, .6); put(base, sp, w / 2, h * .52)
        return base, ['polyhaven', 'kenney-carto']
    if s.startswith('tok-'):
        n = s[4:]; a, fl, col = ANIMAL[n]
        sub = (lambda: glyph('award', (255, 245, 200))) if a is None else (lambda: tint(animal(a), (235, 120, 110), .55) if n == 'salmon' else animal(a))
        return token(w, h, sub, col), ['kenney-icons'] if a is None else ['kenney-animals' if not a.startswith('q_') else 'quaternius']
    if s.startswith('portrait-'):
        a, c = PORT[s[9:]]
        return portrait(w, h, lambda: animal(a), c, seed=s, base_tex=T('rough_linen')), ['kenney-animals' if not a.startswith('q_') else 'quaternius', 'polyhaven']
    if s.startswith('card-'):
        _, n, v = s.split('-'); a, fl, col = ANIMAL[n]
        flip = v in 'bd'
        sub = (lambda: tint(animal(a), (235, 125, 115), .5)) if n == 'salmon' else (lambda: animal(a, flip))
        return card(w, h, sub, 'rough_linen', (238, 225, 198), STAGES[v], BANDS[v], glyph({'bear': 'shield', 'elk': 'bow', 'salmon': 'flask_full', 'hawk': 'flag_triangle', 'fox': 'pawn'}[n], (255, 245, 215)), seed=s, ground=T(GROUND[n]), flip=flip), \
            ['polyhaven', 'kenney-animals' if not a.startswith('q_') else 'quaternius', 'kenney-icons']
    if s.startswith('result-'):
        win = s.endswith('win')
        return scene(w, h, ((250, 200, 120), (255, 235, 190)) if win else ((60, 70, 100), (120, 110, 120)), T('aerial_grass_rock') if win else T('cliff_side'), .62, seed=s, mid_tex=T('cliff_side'), mid_tint=(200, 190, 170) if win else (90, 90, 110),
                     props=[(lambda: animal('bear'), .5, .76, .3)] if win else [(lambda: animal('q_wolf'), .5, .78, .26)]), ['polyhaven', 'kenney-animals', 'quaternius']
    if s == 'icon-logo':
        return token(w, h, lambda: glyph('pawn', (255, 245, 210)), (110, 140, 90)), ['kenney-icons']
    return tex(T('rough_linen'), w, h, s), ['polyhaven']

if __name__ == '__main__':
    used, tot = run('wildmark', slots, recipe, HERE, sheet=sys.argv[1] if len(sys.argv) > 1 else None)
    write_credits(HERE + '/CREDITS.md', 'wildmark', used, TEX); write_install(HERE + '/install.py', 'wildmark')
