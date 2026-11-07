"""Rule engine: a per-game cfg maps stems to subjects; make_recipe(cfg) -> recipe(item) for kit.run.
cfg keys: pal(dict name->rgb), stage(rgb default), tex(card texture), ground(tex), kw=[(regex, spec)], pool=[spec...], chars=[animal names],
scene=dict(sky,ground,mid,midtint,props=[...]), bands=[rgb...]. spec = ('a',animal[,tintrgb]) | ('g',glyph[,rgb]) | ('c',carto) """
import re
from kit import *

SRC = {'a': 'kenney-animals', 'g': 'kenney-icons', 'c': 'kenney-carto'}


def _subject(spec):
    t, n = spec[0], spec[1]
    col = spec[2] if len(spec) > 2 else None
    if t == 'a':
        sp = animal(n)
        return tint(sp, col, .55) if col else sp
    if t == 'g': return glyph(n, col or (255, 246, 220))
    if t == 'c': return ink(carto(n), col or (35, 28, 20))


def _src(spec):
    return ['quaternius' if (spec[0] == 'a' and spec[1].startswith('q_')) else SRC[spec[0]]]


def pick(cfg, stem, table=None):
    for rx, spec in cfg['kw']:
        if re.search(rx, stem): return spec[seed_of(stem) % len(spec)] if isinstance(spec, list) else spec
    pool = table or cfg['pool']
    return pool[seed_of(stem) % len(pool)]


def stage_for(cfg, stem):
    st = cfg.get('stages') or [cfg['stage']]
    return st[seed_of(stem + 's') % len(st)]


def make_recipe(cfg, texs):
    def T(n): texs.add(n); return n
    sc = cfg['scene']

    def props_for(w, h, stem, n=5):
        out = []; r = random.Random(seed_of(stem))
        for i, p in enumerate(sc['props']):
            out.append((lambda p=p: _subject(p[0]), p[1], p[2], p[3]))
        return out

    def recipe(it):
        s, k, w, h, al = it['stem'], it['kind'], it['w'], it['h'], it['alpha']
        if cfg.get('special'):
            r = cfg['special'](it, T)
            if r: return r
        stage = stage_for(cfg, s); st_tex = T(cfg['tex'])
        sub = pick(cfg, s); cr = ['polyhaven'] + _src(sub)
        if k == 'bg' or (k == 'board' and w >= 1000 and h >= 700 and w / h > 1.2) or (k == 'board' and h > w * 1.5 and w >= 800):
            ground = T(sc['ground_alt'] if re.search(sc.get('alt_rx', '$^'), s) and sc.get('ground_alt') else sc['ground'])
            if re.search(r'table|mat', s) and not re.search(r'title', s) and cfg.get('table'):
                return board_grid(w, h, T(cfg['table']), cfg.get('table_tint'), 6, 10 if h > w else 6, seed=s, alt=stage), ['polyhaven']
            r = random.Random(seed_of(s)); hz = r.uniform(.5, .64)
            pr = props_for(w, h, s)
            if sub[0] != 'g': pr = pr + [(lambda: _subject(sub), r.uniform(.3, .7), hz + .16, .22)]
            return scene(w, h, sc['sky'][seed_of(s) % len(sc['sky'])], ground, hz, seed=s, mid_tex=T(sc['mid']), mid_tint=sc.get('midtint'), ground_tint=sc.get('gtint'),
                         haze=sc.get('haze'), props=pr, dark_top=.2 if h > w else .12), cr + ['kenney-carto']
        if k == 'board':
            if cfg.get('table') and re.search(r'table|mat|row|track|map', s) and w / h > 2.5:
                r = random.Random(seed_of(s))
                return scene(w, h, sc['sky'][seed_of(s) % len(sc['sky'])], T(sc['ground']), .55, seed=s, mid_tex=T(sc['mid']), mid_tint=sc.get('midtint'), ground_tint=sc.get('gtint'), props=[(lambda p=p: _subject(p[0]), p[1], p[2] * .95, p[3] * 1.3) for p in sc['props'][:4]] + [(lambda: _subject(sub), .5, .7, .6)]), ['polyhaven', 'kenney-carto'] + _src(sub)
            return card(w, h, lambda: _subject(sub), st_tex, cfg['paper'], stage, None, None, seed=s, ground=T(cfg['ground']), scale=.74), cr
        if k == 'card':
            band = cfg['bands'][seed_of(s + 'b') % len(cfg['bands'])] if cfg.get('band', True) and h > w else None
            badge = None
            if h > w: badge = glyph(cfg['badges'][seed_of(s + 'g') % len(cfg['badges'])], (255, 246, 220))
            if re.search(r'back$|^card-back', s):
                return card(w, h, lambda: glyph(cfg['badges'][0], (255, 240, 200)), st_tex, cfg['paper'], shade(stage, .7), band, None, seed=s), ['polyhaven', 'kenney-icons']
            return card(w, h, lambda: _subject(sub), st_tex, cfg['paper'], stage, band, badge, seed=s, ground=T(cfg['ground']) if cfg.get('card_ground', True) else None, flip=bool(seed_of(s) & 1)), cr + ['kenney-icons']
        if k == 'portrait':
            a = cfg['chars'][seed_of(s) % len(cfg['chars'])]
            for rx, spec in cfg['kw']:
                if re.search(rx, s) and spec[0] == 'a': a = spec[1]; break
            return portrait(w, h, lambda: animal(a), stage, alpha=al, seed=s, base_tex=T(cfg['tex']) if not al else None, scale=.82), ['kenney-animals' if not a.startswith('q_') else 'quaternius', 'polyhaven']
        if k in ('token', 'icon'):
            col = stage
            return token(w, h, lambda: _subject(sub), shade(col, 1.0), alpha=al, shape='disc' if k == 'icon' or seed_of(s) % 3 else 'sq', scale=.62), _src(sub)
        if k == 'fx':
            return glow(w, h, cfg.get('fxcol', (255, 210, 120)), ['burst', 'ring', 'sparkle', 'smoke'][seed_of(s) % 4] if not re.search('smoke|cloud|poison', s) else 'smoke', s), []
        if k == 'ui':
            return card(w, h, lambda: _subject(sub), st_tex, cfg['paper'], shade(stage, .8), None, None, seed=s, scale=.6) if h > 200 else \
                tex(T(cfg['table'] or cfg['tex']), w, h, s, tint=stage, k=.5), ['polyhaven'] + _src(sub)
        return tex(st_tex, w, h, s), ['polyhaven']
    return recipe


def main(game, slug, here, slots, cfg, sheet=None):
    texs = set()
    used, tot = run(game, slots, make_recipe(cfg, texs), here, sheet=sheet)
    write_credits(here + '/CREDITS.md', game, used, texs); write_install(here + '/install.py', slug)
    return tot
