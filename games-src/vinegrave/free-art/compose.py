#!/usr/bin/env python3
"""Build every vinegrave free-art slot (see ART-DIRECTION.md).
Objects/scenes/UI: flat-vector SVG (vg.py, vg2.py) rendered by ../../perch-and-plume/free-art/render.js.
Guardians and idols: Kenney Animal Pack Redux heads (vector @4x) recoloured; portraits: Kenney Toon Characters 1 -
both via ../../wildmark/free-art/compose.py (needs PACKS like wildmark). Usage: PACKS=<dir> python3 compose.py <outdir>"""
import os, sys, json, subprocess, importlib.util
from PIL import Image, ImageOps, ImageDraw, ImageFilter
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import vg, vg2

OUT = sys.argv[1] if len(sys.argv) > 1 else HERE
TMP = os.path.join(OUT, '_svg'); os.makedirs(TMP, exist_ok=True)
items = json.load(open(os.path.join(HERE, '..', 'assets.json')))['items']
size = {i['stem']: (i['w'], i['h'], bool(i.get('alpha'))) for i in items}

def build_svg(stem):
    p = stem.split('-', 1)
    if stem.startswith('card-frame-'): return vg2.frame(stem.split('-')[-1])
    if stem == 'card-back': return vg2.card_back()
    if p[0] == 'card': return vg.card(p[1]) if p[1] in vg.ITEMS or p[1] in vg.ART else vg.special(stem)
    if p[0] == 'site': return vg2.site(stem)
    if p[0] in ('res', 'tr', 'token', 'icon') or stem == 'shrine-slot': return vg2.small(stem)
    if p[0] == 'explorer': return vg2.explorer(int(p[1]))
    if p[0] == 'temple': return vg2.temple(stem)
    if p[0] == 'fx': return vg2.fx(p[1])
    if stem == 'board-map': return vg2.board_map()
    if p[0] == 'map': return vg2.act_map(int(p[1][-1]))
    if stem == 'title-bg': return vg2.title_scene(1920, 1080, 'day')
    if stem == 'result-win': return vg2.title_scene(1600, 1000, 'win')
    if stem == 'result-lose': return vg2.title_scene(1600, 1000, 'lose')
    if stem == 'track-bg': return vg2.track_bg()
    return None

jobs = []
for stem, (w, h, a) in size.items():
    s = build_svg(stem)
    if s is None: continue
    f = os.path.join(TMP, stem + '.svg'); open(f, 'w').write(s); jobs.append([f, os.path.join(TMP, stem + '.png'), w, h, 1 if a else 0])
json.dump(jobs, open(os.path.join(TMP, 'list.json'), 'w'))
subprocess.run(['node', os.path.join(HERE, '..', '..', 'perch-and-plume', 'free-art', 'render.js'), os.path.join(TMP, 'list.json')], check=True)
for svgf, png, w, h, a in jobs:
    Image.open(png).convert('RGBA' if a else 'RGB').save(os.path.join(OUT, os.path.basename(png)[:-4] + '.webp'), quality=88, method=6)

# ---- Animal Pack Redux heads: guardians + idols ----
spec = importlib.util.spec_from_file_location('wm', os.path.join(HERE, '..', '..', 'wildmark', 'free-art', 'compose.py'))
wm = importlib.util.module_from_spec(spec); argv = sys.argv; sys.argv = sys.argv[:1]; spec.loader.exec_module(wm); sys.argv = argv
wm.ANIMAL_AT.update({'gorilla': (695, 975), 'crocodile': (695, 1185), 'frog': (975, 765), 'snake': (140, 140), 'pig': (695, 350),
                     'hippo': (418, 350), 'monkey': (140, 350), 'panda': (975, 140), 'penguin': (695, 140), 'sloth': (975, 1185)})

def tint(im, dark, mid, light, eyes=None):
    a = im.split()[3]; g = ImageOps.autocontrast(im.convert('L'))
    c = ImageOps.colorize(g, wm.hx(dark), wm.hx(light), mid=wm.hx(mid)).convert('RGBA'); c.putalpha(a)
    if eyes:  # very light pixels (eye whites) glow
        px = c.load(); gp = g.load()
        for y in range(c.height):
            for x in range(c.width):
                if gp[x, y] > 238 and px[x, y][3] > 200: px[x, y] = wm.hx(eyes) + (255,)
    return c

GUARD = {  # stem: (animal, dark, mid, light, eye glow, aura)
 'mire-crawler': ('crocodile', '#2a2214', '#6a5a34', '#a8946a', '#c8f060', '#5a6a2a'),
 'stone-ape': ('gorilla', '#3a3a3a', '#7a7872', '#c8c4ba', '#5ae8d0', '#5a6a60'),
 'glass-moth': ('owl', '#2a4a6a', '#7ab8d8', '#e8f8ff', '#ffffff', '#7ad8f0'),
 'rootback-boar': ('pig', '#2a1a10', '#6a4428', '#a8784a', '#ff9a3a', '#6a4a2a'),
 'tide-serpent': ('snake', '#0e2a4a', '#2a6aa8', '#8ac8f0', '#e8fff0', '#2a8ac8'),
 'ember-hound': ('dog', '#1a1416', '#4a3a3a', '#8a6a5a', '#ff7a2a', '#ff6a2a'),
 'moss-golem': ('hippo', '#1e3a22', '#4f8a4a', '#a8c890', '#e8f060', '#4f8a4a'),
 'howl-bat': ('monkey', '#1e1428', '#5a3a6a', '#a888b8', '#ff5a5a', '#6a3a8a'),
 'vine-widow': ('sloth', '#1e2a1e', '#7a9a6a', '#e0ecd0', '#d8ff8a', '#7aa86a'),
 'thunder-toad': ('frog', '#14203a', '#3a5aa8', '#a8c0f0', '#f2e040', '#4a6ad8'),
 'bone-heron': ('penguin', '#3a3428', '#b8ac90', '#f4ecd8', '#6ae8f0', '#c8c0a8'),
 'ash-jaguar': ('panda', '#2a2a2a', '#6a6a68', '#c0bcb4', '#ff8a2a', '#8a6a5a'),
 'canopy-wyrm': ('crocodile', '#0e2a18', '#2a8a4a', '#9ae0a0', '#f2e040', '#2a8a4a'),
 'temple-cat': ('dog', '#1a3a2e', '#3fa07a', '#bfe8d0', '#f2d040', '#3fa07a'),
 'old-warden': ('gorilla', '#1a1e1c', '#4a524c', '#8a948a', '#5ae8d0', '#3a8a7a'),
}
for k, (an, d, m, l, ey, aura) in GUARD.items():
    S = 800; im = Image.new('RGBA', (S, S))
    g = Image.new('RGBA', (S, S)); ImageDraw.Draw(g).ellipse((90, 90, S - 90, S - 90), fill=wm.hx(aura) + (150,)); im.alpha_composite(g.filter(ImageFilter.GaussianBlur(70)))
    h = tint(wm.animal(an), d, m, l, ey); sc = 600 / max(h.size); h = h.resize((int(h.width * sc), int(h.height * sc)), Image.LANCZOS)
    im.alpha_composite(wm.shadow_for(h, 120, 16), ((S - h.width) // 2 + 10, (S - h.height) // 2 + 20)); im.alpha_composite(h, ((S - h.width) // 2, (S - h.height) // 2))
    im.resize((400, 400), Image.LANCZOS).save(os.path.join(OUT, f'guard-{k}.webp'), quality=88, method=6)

IDOL = {'owl': 'owl', 'frog': 'frog', 'snake': 'snake', 'boar': 'pig', 'fish': 'whale', 'bat': 'monkey', 'cat': 'dog', 'bird': 'parrot', 'ape': 'gorilla'}
for i, (k, an) in enumerate(list(IDOL.items()) + [('sun', None), ('moon', None), ('star', None)]):
    S = 512; im = Image.new('RGBA', (S, S)); d = ImageDraw.Draw(im)
    jade = i % 2 == 0
    d.rounded_rectangle((96, 380, 416, 470), 14, fill=wm.hx('#7a7468')); d.rounded_rectangle((96, 380, 416, 400), 10, fill=wm.hx('#9a9488'))
    if an:
        h = tint(wm.animal(an), '#1e4a36', '#3fa07a', '#a8e8c8') if jade else tint(wm.animal(an), '#5a3a10', '#d8a030', '#fff0b0')
        sc = 330 / max(h.size); h = h.resize((int(h.width * sc), int(h.height * sc)), Image.LANCZOS)
        im.alpha_composite(h, ((S - h.width) // 2, 385 - h.height))
    else:
        c = wm.hx('#e0b040' if not jade else '#3fa07a'); cx, cy = 256, 220
        if k == 'sun':
            for a in range(0, 360, 30):
                import math
                d.polygon([(cx + 160 * math.cos(math.radians(a)), cy + 160 * math.sin(math.radians(a))), (cx + 110 * math.cos(math.radians(a - 10)), cy + 110 * math.sin(math.radians(a - 10))), (cx + 110 * math.cos(math.radians(a + 10)), cy + 110 * math.sin(math.radians(a + 10)))], fill=c)
            d.ellipse((cx - 110, cy - 110, cx + 110, cy + 110), fill=c); d.ellipse((cx - 50, cy - 30, cx - 20, cy), fill=wm.hx('#5a3a10')); d.ellipse((cx + 20, cy - 30, cx + 50, cy), fill=wm.hx('#5a3a10'))
        elif k == 'moon':
            d.ellipse((cx - 150, cy - 150, cx + 150, cy + 150), fill=c); d.ellipse((cx - 60, cy - 170, cx + 200, cy + 130), fill=(0, 0, 0, 0))
            d.ellipse((cx - 90, cy - 40, cx - 60, cy - 10), fill=wm.hx('#1e4a36'))
        else:
            import math
            pts = [(cx + (160 if j % 2 == 0 else 70) * math.cos(math.radians(-90 + j * 22.5)), cy + (160 if j % 2 == 0 else 70) * math.sin(math.radians(-90 + j * 22.5))) for j in range(16)]
            d.polygon(pts, fill=c)
    im.resize((256, 256), Image.LANCZOS).save(os.path.join(OUT, f'idol-{k}.webp'), quality=90, method=6)

P = {
 'pell': ('mp', wm.skin('light', True) + wm.hair('#8A8A86', True) + wm.shirt('#8A7A4A'), '#d8d0a8', 'pine'),
 'tamsin': ('fa', wm.skin('light') + wm.hair('#B0602A') + wm.shirt('#2A8A8A'), '#cfe0c0', None),
 'okoro': ('mp', wm.skin('brown', True) + wm.hair('#2A2420', True) + wm.shirt('#7A5A3A'), '#e2d4b0', None),
 'quell': ('fp', wm.skin('tan', True) + wm.hair('#2A1E18', True) + wm.shirt('#2A3A5A'), '#b8c8d0', 'rock_big'),
 'sallow': ('ma', wm.skin('ash') + wm.hair('#2A2A2E') + wm.shirt('#3A3A3E'), '#a8a8a0', None),
 'mira': ('fa', wm.skin('brown') + wm.hair('#3A2418') + wm.shirt('#D9A441'), '#efe0b0', None),
 'vane': ('ma', wm.skin('light') + wm.hair('#E8E4DC') + wm.shirt('#F2F0EA'), '#c8c0b0', None),
}
for n, (k, sw, bg, prop) in P.items():
    wm.portrait(k, sw, bg, prop).resize((512, 512), Image.LANCZOS).save(os.path.join(OUT, f'portrait-{n}.webp'), quality=88, method=6)
# the Old Warden: stone guardian face (same as its guardian) on a portrait backdrop
w = Image.new('RGB', (512, 512), wm.hx('#6a7a70')); g = Image.open(os.path.join(OUT, 'guard-old-warden.webp')).convert('RGBA').resize((480, 480), Image.LANCZOS)
w.paste(g, (16, 24), g); w.save(os.path.join(OUT, 'portrait-warden.webp'), quality=88, method=6)
print('pass compose vinegrave', len(jobs) + len(GUARD) + 12 + 8)
