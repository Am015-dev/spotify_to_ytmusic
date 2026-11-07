#!/usr/bin/env python3
"""Compose emberclimb free-kit pictures from ONE family: Dungeon Crawl Stone Soup 32x32 tiles (CC0), see ART-DIRECTION.md.
Usage: ART_CACHE=/path/to/cache python3 compose.py [--only REGEX]
Cache: x/dcss/Dungeon Crawl Stone Soup Full/  (https://opengameart.org/content/dungeon-crawl-32x32-tiles)
Every sprite is scaled by an integer factor with nearest-neighbour so pixels stay square and crisp; backdrops are the same
set's wall/floor tiles. Frames, gems, dice and card back are drawn as pixel art at 1/4 size and scaled x4 to match."""
import os, sys, re, json, math, random, glob
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance, ImageOps, ImageChops
H = os.path.dirname(os.path.abspath(__file__))
C = os.environ.get('ART_CACHE', '/tmp/art-cache')
D = C + '/x/dcss/Dungeon Crawl Stone Soup Full'
SLOTS = {s['stem']: s for s in json.load(open(H + '/../assets.json'))['items']}
IDX = {}
for p in glob.glob(D + '/**/*.png', recursive=True):
    IDX.setdefault(os.path.basename(p)[:-4], p)
MISS = []
def find(tok):
    """'dir/name' or 'name': exact basename, then name_new, then prefix match (prefers *_new)."""
    if '/' in tok:
        g = sorted(glob.glob(f'{D}/**/{tok}*.png', recursive=True), key=lambda p: ('_old' in p, len(p)))
        if g: return g[0]
        tok = tok.split('/')[-1]
    for k in (tok, tok + '_new', tok + '1', tok + '_1', tok + '0', tok + '_0', tok + '_1_new'):
        if k in IDX: return IDX[k]
    c = sorted([k for k in IDX if k.startswith(tok)], key=lambda k: ('_old' in k, len(k)))
    if c: return IDX[c[0]]
    MISS.append(tok); return None
def spr(tok):
    p = find(tok)
    if not p: return Image.new('RGBA', (32, 32))
    im = Image.open(p).convert('RGBA')
    if '/gui/' in p:   # GUI spell icons sit on a dark framed square: drop the 1px frame and key out the near-black field
        im = im.crop((3, 3, im.width - 3, im.height - 3)); px = im.load()
        for y in range(im.height):   # stray frame pixels (neutral light grey) near the edge
            for x in range(im.width):
                r, g, b, al = px[x, y]
                if (x < 3 or y < 3 or x > im.width - 4 or y > im.height - 4) and abs(r - g) < 6 and abs(g - b) < 6 and r > 120: px[x, y] = (0, 0, 0, 0)
        for y in range(im.height):
            for x in range(im.width):
                r, g, b, a = px[x, y]
                if max(r, g, b) < 34: px[x, y] = (r, g, b, 0)
    bb = im.getbbox()
    return im.crop(bb) if bb else im
def nn(im, k): return im.resize((im.width * k, im.height * k), Image.NEAREST)
def fit_k(im, w, h): return max(1, min(w // im.width, h // im.height))
def tile_bg(toks, W, Hh, k, seed=0, dark=.55):
    rnd = random.Random(seed); ts = [spr(t) for t in toks]; t0 = ts[0]
    out = Image.new('RGBA', (W, Hh), (10, 8, 8, 255)); s = 32 * k
    for y in range(0, Hh, s):
        for x in range(0, W, s): out.alpha_composite(nn(rnd.choice(ts), k).convert('RGBA'), (x, y))
    return ImageEnhance.Brightness(out).enhance(dark)
def glow(W, Hh, cx, cy, r, col, a=200):
    g = Image.new('RGBA', (W, Hh), col + (0,)); m = Image.new('L', (W, Hh), 0); ImageDraw.Draw(m).ellipse((cx - r, cy - r, cx + r, cy + r), fill=a)
    g.putalpha(m.filter(ImageFilter.GaussianBlur(r * .45))); return g
def vign(im, a=.6):
    W, Hh = im.size; m = Image.new('L', (W, Hh), 0); ImageDraw.Draw(m).ellipse((-W * .2, -Hh * .2, W * 1.2, Hh * 1.2), fill=255)
    m = m.filter(ImageFilter.GaussianBlur(min(W, Hh) // 5)); dark = ImageEnhance.Brightness(im).enhance(1 - a)
    return Image.composite(im, dark, m)
def put(base, sp, cx, cy, k, shadow=True):
    s = nn(sp, k)
    if shadow:
        sh = Image.new('RGBA', s.size, (0, 0, 0, 0)); sh.paste((0, 0, 0, 150), (0, 0), s.getchannel('A'))
        base.alpha_composite(sh, (int(cx - s.width / 2 + k), int(cy - s.height / 2 + k)))
    base.alpha_composite(s, (int(cx - s.width / 2), int(cy - s.height / 2)))

TONE = {'w': (255, 110, 40), 's': (90, 220, 110), 'a': (80, 170, 255), 'm': (255, 200, 80), 'n': (220, 220, 200), 'x': (200, 90, 200)}
WALL = {'w': ['wall/brick_dark_0', 'wall/brick_dark_1', 'wall/brick_dark_2'], 's': ['wall/brick_brown-vines_1', 'wall/brick_brown-vines_2', 'wall/brick_brown_0'],
        'a': ['wall/metal_wall', 'wall/metal_wall_cracked', 'wall/lab-metal_0'], 'm': ['wall/marble_wall_1', 'wall/marble_wall_2', 'wall/marble_wall_3'],
        'n': ['wall/stone_brick_1', 'wall/stone_brick_2', 'wall/stone_brick_3'], 'x': ['wall/catacombs_0', 'wall/catacombs_1', 'wall/catacombs_2']}
CARD = {  # stem -> list of DCSS sprite tokens (first = focal; extras flank it smaller)
 'w-strike': ['weapon/long_sword', 'flame_0'], 'w-defend': ['armor/buckler_1', 'flame_0'], 'w-hammer': ['hammer_1', 'boulder'], 'w-cleave': ['executioner_axe_2', 'goblin', 'orc'],
 'w-twin-slash': ['double_sword'], 'w-warm-up': ['cloud_fire_0'], 'w-bulwark-bash': ['large_shield', 'goblin'], 'w-sunder': ['broad_axe', 'chain_mail'],
 'w-iron-skin': ['stoneskin'], 'w-skull-rap': ['helmet_1_visored', 'xom_sparkles_blue'], 'w-roar': ['berserker_rage'], 'w-wild-swing': ['great_flail', ],
 'w-whirlwind': ['tornado'], 'w-kindle': ['inner_flame'], 'w-slow-burn': ['fire/sticky_flame'], 'w-body-check': ['crystal_plate_mail', 'closed_door'],
 'w-second-wind': ['swiftness'], 'w-berserk-roll': ['deep_troll_berserker'], 'w-reapers-edge': ['scythe'], 'w-plate-up': ['plate_mail', ],
 'w-pyre-heart': ['ring_of_flames'], 'w-colossus-slam': ['bolt_of_magma'], 'w-double-down': ['fire/fireball', 'fire/fireball'], 'w-final-gambit': ['summon_dragon'],
 's-strike': ['dagger'], 's-defend': ['cloak'], 's-pinprick': ['needle'], 's-slip-away': ['evoke_fog'], 's-blade-fan': ['knife', 'dagger', 'dagger'],
 's-toxic-vial': ['emerald'], 's-quick-stab': ['quickblade'], 's-dodge-roll': ['controlled_blink'], 's-hidden-knives': ['elven_dagger', 'cloak_1_leather'],
 's-dagger-spray': ['dispersal'], 's-cripple': ['throwing_net', 'ogre'], 's-lucky-pick': ['gold_pile', 'misc_deck'], 's-snap-cut': ['poison_brand'],
 's-catalyst': ['alistairs_intoxication'], 's-noxious': ['mephitic_cloud'], 's-envenom': ['poison_ammunition'], 's-knife-rain': ['portal_projectile'],
 's-backstab': ['invisibility'], 's-choking-cloud': ['poisonous_cloud'], 's-needle-rain': ['poison_arrow'], 's-venom-storm': ['olgrebs_toxic_radiance'],
 's-afterimage': ['dithmenos_shadow_form'], 's-final-flourish': ['tukimas_dance'], 's-plague-doctor': ['necromancer'],
 'a-strike': ['iron_shot'], 'a-defend': ['stonemail'], 'a-zap': ['shock'], 'a-dualcast': ['orb_of_electricity', 'orb_of_electricity'], 'a-ball-lightning': ['conjure_ball_lightning'],
 'a-cool-circuit': ['ozocubus_armor'], 'a-charge-up': ['static_discharge'], 'a-barrier-pulse': ['condensation_shield'], 'a-beam-cell': ['magic_dart'],
 'a-sweeping-beam': ['searing_ray'], 'a-overclock': ['haste'], 'a-static-jolt': ['lightning_bolt'], 'a-compile-strike': ['bolt_of_cold'], 'a-capacitor': ['misc_phial', 'misc_phial'],
 'a-defrag': ['lehudibs_crystal_spear'], 'a-glacier': ['orb_of_ice', 'orb_of_ice'], 'a-darkness': ['darkness'], 'a-tempest': ['chain_lightning'],
 'a-multicast': ['fulminant_prism'], 'a-core-breach': ['orb_of_destruction'], 'a-biased-core': ['misc_crystal'], 'a-meteor-strike': ['fire_storm'],
 'a-hyperbeam': ['iskenderuns_mystic_blast'], 'a-reactor': ['irradiate'],
 'm-strike': ['airstrike'], 'm-defend': ['repel_missiles'], 'm-eruption': ['throw_flame'], 'm-vigilance': ['corona'], 'm-palm-flurry': ['blade_hands'],
 'm-crush-joints': ['shatter'], 'm-pressure-point': ['agony'], 'm-still-water': ['ledas_liquefaction'], 'm-sash-whip': ['bullwhip'], 'm-cut-through': ['force_lance'],
 'm-empty-fist': ['glove_1'], 'm-bow': ['altar_zin'], 'm-third-eye': ['see_invisible'], 'm-inner-peace': ['ru_draw_out_power'], 'm-wheel-kick': ['cloud_cone'],
 'm-rushdown': ['ru_power_leap'], 'm-mental-fort': ['statue_form'], 'm-flying-sleeves': ['flight'], 'm-windmill': ['qazlal_elemental_force'], 'm-roll-with-it': ['jump'],
 'm-sky-hammer': ['maxwells_silver_hammer'], 'm-zen-burst': ['qazlal_disaster_area'], 'm-deva-form': ['daeva'], 'm-judgment': ['tso_bless_weapon'],
 'n-bandage': ['elyvilon_heal_other'], 'n-good-instincts': ['detect_creatures'], 'n-finesse': ['levitation'], 'n-panic-button': ['controlled_teleport'], 'n-hand-of-greed': ['gozag_bribe_branch'],
 'wound': ['drain_red'], 'dazed': ['confuse'], 'burn': ['cloud_fire_0'], 'slimed': ['acid_blob'], 'regret': ['scroll-grey'], 'doubt': ['mirror'], 'injury': ['ru_sacrifice_health'],
 'calm-spark': ['fire/conjure_flame'], 'shiv': ['elven_dagger'],
}
def card(stem):
    W, Hh = 512, 384; h = stem[0] if stem[1] == '-' else 'x'
    if h == 'x' and stem in ('calm-spark',): h = 'm'
    base = tile_bg(WALL[h], W, Hh, 4, hash(stem) % 99, .42)
    toks = CARD[stem]; col = TONE[h]
    base.alpha_composite(glow(W, Hh, W // 2, Hh // 2, 170, col, 190))
    if len(toks) > 1:
        side = [(W // 2 - 150, Hh // 2 + 40), (W // 2 + 150, Hh // 2 + 40)]
        for t, (x, y) in zip(toks[1:], side): e = spr(t); put(base, e, x, y, min(5, fit_k(e, 150, 150)))
    f = spr(toks[0]); put(base, f, W // 2, Hh // 2, min(10, fit_k(f, 300, 280)))
    return vign(base, .55)

ENEMY = {'enemy-mire-slug': 'giant_slug', 'enemy-gnawer': 'grey_rat', 'enemy-hex-acolyte': 'deep_elf_high_priest', 'enemy-gape-grub': 'brain_worm', 'enemy-rust-tick': 'giant_mite',
         'enemy-bile-blob': 'acid_blob', 'enemy-snare-vine': 'oklob_plant', 'enemy-ash-imp': 'shadow_imp', 'enemy-thorn-brute': 'deep_troll', 'enemy-sleeper-statue': 'statue_ancient_hero',
         'enemy-iron-warden': 'iron_golem', 'enemy-mire-behemoth': 'rotting_hulk', 'enemy-ashen-wraith': 'flayed_ghost', 'enemy-gate-colossus': 'stone_golem'}
HERO = {'hero-w': 'hell_knight', 'hero-s': 'unique/sonja', 'hero-a': 'electric_golem', 'hero-m': 'unique/mennas'}
def figure(tok, W, Hh, aura=None):
    sp = spr(tok); sp = sp.crop(sp.getbbox() or (0, 0, 32, 32)); k = fit_k(sp, int(W * .92), int(Hh * .9))
    out = Image.new('RGBA', (W, Hh))
    if aura: out.alpha_composite(glow(W, Hh, W // 2, Hh // 2, int(min(W, Hh) * .42), aura, 120))
    e = Image.new('RGBA', (W, Hh)); ImageDraw.Draw(e).ellipse((W * .2, Hh * .86, W * .8, Hh * .96), fill=(0, 0, 0, 110)); out.alpha_composite(e.filter(ImageFilter.GaussianBlur(10)))
    s = nn(sp, k); out.alpha_composite(s, ((W - s.width) // 2, int(Hh * .92 - s.height)))
    return out

ITEM = {'relic-ember-brand': 'fire_brand', 'relic-whetstone-ring': 'ring/steel', 'relic-spark-core': 'orb_of_electricity', 'relic-prayer-beads': 'amulet/bone_gray',
        'relic-lucky-coin': 'gold_pile', 'relic-iron-bangle': 'ring/iron', 'relic-lantern': 'misc_lantern', 'relic-bag-of-marbles': 'misc_bottle',
        'relic-clover-dice': 'misc_deck', 'relic-healing-moss': 'misc_stone', 'relic-gold-tooth': 'ring/gold', 'relic-oak-heart': 'amulet/face_1_gold',
        'relic-candle-stub': 'misc_lamp', 'relic-pocket-satchel': 'misc_box', 'relic-tin-flute': 'misc_horn', 'relic-smoking-censer': 'magic_lamp',
        'relic-dawnstone': 'amulet/stone_1_pink', 'relic-gale-cloak': 'cloak', 'relic-phoenix-ash': 'misc_orb',
        'pot-fire-flask': 'potion/orange', 'pot-block-brew': 'potion/silver', 'pot-strength-tonic': 'potion/ruby', 'pot-swift-draught': 'potion/sky_blue',
        'pot-energy-vial': 'potion/yellow', 'pot-venom-vial': 'potion/emerald', 'pot-frost-gas': 'potion/cloudy', 'pot-healing-draught': 'potion/pink', 'pot-fortune-die': 'potion/golden',
        'node-monster': 'weapon/long_sword', 'node-elite': 'flying_skull', 'node-rest': 'cloud_fire_0', 'node-shop': 'shop_general', 'node-event': 'insubstantial_wisp',
        'node-treasure': 'chest', 'node-boss': 'statue_ancient_evil',
        'intent-attack': 'weapon/long_sword', 'intent-attack-big': 'double_sword', 'intent-defend': 'armor/buckler_1', 'intent-buff': 'haste', 'intent-debuff': 'curse_skull', 'intent-sleep': 'ensorcelled_hibernation', 'intent-weak': 'slow', 'intent-vuln': 'shatter', 'intent-frail': 'armor/buckler_2', 'intent-poison': 'sting', 'intent-burn': 'fire/sticky_flame', 'intent-slime': 'acid_blob', 'intent-daze': 'confuse', 'intent-unknown': 'detect_creatures',
        'st-str': 'glove_4_gauntlets', 'st-vuln': 'shatter', 'st-weak': 'slow', 'st-poison': 'sting', 'st-frail': 'armor/buckler_2',
        'orb-L': 'orb_of_electricity', 'orb-F': 'orb_of_ice', 'orb-D': 'darkness', 'stance-w': 'berserker_rage', 'stance-c': 'ru_sacrifice_purity',
        'icon-energy': 'orb_of_fire', 'icon-remove': 'abjuration'}
NODE_RING = {'node-monster': (150, 60, 40), 'node-elite': (150, 30, 30), 'node-rest': (200, 120, 40), 'node-shop': (190, 150, 50), 'node-event': (70, 110, 170),
             'node-treasure': (180, 140, 50), 'node-boss': (120, 40, 140)}
def icon(stem):
    s = SLOTS[stem]; W = s['w']; sp = spr(ITEM[stem]); sp = sp.crop(sp.getbbox() or (0, 0, 32, 32))
    out = Image.new('RGBA', (W, W))
    if stem in NODE_RING:   # round pixel medallion behind the map marker
        m = Image.new('RGBA', (W // 4, W // 4)); d = ImageDraw.Draw(m); n = W // 4
        d.ellipse((1, 1, n - 2, n - 2), fill=(30, 22, 18, 255), outline=NODE_RING[stem] + (255,), width=3); out = nn(m, 4)
    k = fit_k(sp, int(W * (.62 if stem in NODE_RING else .9)), int(W * (.62 if stem in NODE_RING else .9)))
    put(out, sp, W // 2, W // 2, k, shadow=True); return out

# ---- pixel-art UI drawn at 1/4 and scaled x4 ----
FR = {'attack': ((196, 74, 40), 'weapon/long_sword'), 'skill': ((60, 110, 180), 'armor/buckler_1'), 'power': ((140, 80, 190), 'misc_crystal'), 'status': ((110, 110, 110), None)}
def frame(kind):
    col, motif = FR[kind]; w, h = 125, 175; im = Image.new('RGBA', (w, h)); d = ImageDraw.Draw(im)
    dk = tuple(int(c * .55) for c in col); lt = tuple(min(255, int(c * 1.35)) for c in col)
    for i, c in enumerate((dk + (255,), col + (255,), col + (255,), lt + (255,), dk + (255,))): d.rectangle((i, i, w - 1 - i, h - 1 - i), outline=c)
    for (x, y) in ((0, 0), (w - 9, 0), (0, h - 9), (w - 9, h - 9)):
        d.rectangle((x, y, x + 8, y + 8), fill=(214, 168, 72, 255), outline=(110, 70, 20, 255)); d.rectangle((x + 3, y + 3, x + 5, y + 5), fill=(255, 236, 160, 255))
    out = nn(im, 4)
    if motif:
        m = spr(motif); m = m.crop(m.getbbox()); put(out, m, 250, 22, 1, False)
    if kind == 'status':
        cd = ImageDraw.Draw(out)
        for a, b in (((60, 20), (90, 120)), ((420, 600), (470, 690))): cd.line(a + b, fill=(60, 60, 60, 255), width=4)
    return out
def gem(kind):
    w, h = 125, 175; im = Image.new('RGBA', (w, h)); d = ImageDraw.Draw(im); cx, cy = 62, 168
    col = {'common': ((150, 150, 150), (210, 210, 210)), 'uncommon': ((40, 90, 200), (140, 190, 255)), 'rare': ((210, 150, 30), (255, 230, 120))}[kind]
    d.polygon([(cx - 6, cy), (cx, cy - 6), (cx + 6, cy), (cx, cy + 6)], fill=col[0] + (255,), outline=(30, 20, 10, 255)); d.rectangle((cx - 2, cy - 3, cx, cy - 1), fill=col[1] + (255,))
    if kind == 'rare': d.line((cx - 10, cy, cx - 8, cy), fill=(255, 220, 120, 255)); d.line((cx + 8, cy, cx + 10, cy), fill=(255, 220, 120, 255))
    return nn(im, 4)
def card_back():
    w, h = 125, 175; im = Image.new('RGB', (w, h), (40, 24, 18)); d = ImageDraw.Draw(im)
    for y in range(0, h, 6):
        for x in range(0, w, 6):
            if (x // 6 + y // 6) % 2: d.point((x + 3, y + 3), fill=(62, 38, 26))
    for i, c in enumerate(((20, 12, 8), (190, 120, 40), (120, 70, 20))): d.rectangle((i + 2, i + 2, w - 3 - i, h - 3 - i), outline=c)
    out = nn(im, 4).convert('RGBA'); out.alpha_composite(glow(500, 700, 250, 330, 170, (255, 120, 40), 170))
    put(out, spr('statue_ancient_evil') if False else spr('wall/stone_brick_1'), 250, 330, 1, False)
    t = spr('statue_orb'); t = t.crop(t.getbbox()); put(out, t, 250, 340, 6); f = spr('flame_0'); put(out, f, 250, 170, 4)
    return out.convert('RGB')
def die(n):
    s = 48; im = Image.new('RGBA', (s, s)); d = ImageDraw.Draw(im)
    d.rectangle((4, 6, 44, 46), fill=(60, 40, 30, 120)); d.rectangle((3, 3, 43, 43), fill=(246, 236, 214, 255), outline=(80, 60, 40, 255)); d.line((4, 42, 42, 42), fill=(200, 186, 160, 255)); d.line((42, 4, 42, 42), fill=(200, 186, 160, 255))
    P = {1: [(23, 23)], 2: [(13, 13), (33, 33)], 3: [(13, 13), (23, 23), (33, 33)], 4: [(13, 13), (33, 13), (13, 33), (33, 33)], 5: [(13, 13), (33, 13), (23, 23), (13, 33), (33, 33)], 6: [(13, 12), (33, 12), (13, 23), (33, 23), (13, 34), (33, 34)]}[n]
    for x, y in P: d.rectangle((x - 3, y - 3, x + 3, y + 3), fill=(220, 100, 30, 255)); d.point((x - 2, y - 2), fill=(255, 170, 90, 255))
    return nn(im, 4)
def fx(stem):
    t = {'fx-block-burst': 'condensation_shield', 'fx-fire-burst': 'fireball', 'fx-heal-sparkle': 'gold_sparkles', 'fx-poison-cloud': 'cloud_poison_0', 'fx-slash': 'tukimas_vorpal_blade'}[stem]
    out = Image.new('RGBA', (256, 256)); col = {'fx-block-burst': (90, 160, 255), 'fx-fire-burst': (255, 120, 40), 'fx-heal-sparkle': (255, 220, 120), 'fx-poison-cloud': (90, 220, 90), 'fx-slash': (240, 240, 255)}[stem]
    out.alpha_composite(glow(256, 256, 128, 128, 110, col, 170)); sp = spr(t); sp = sp.crop(sp.getbbox()); put(out, sp, 128, 128, fit_k(sp, 200, 200), False); return out

# ---- backgrounds (1080x1920): same tile family, x6 tiles, a few props ----
BG = {'bg-title': (['wall/stone_brick_1', 'wall/stone_brick_2'], ['floor/grass_0', 'floor/grass_1'], [('statue_orb', .5, .55, 12), ('cloud_fire_0', .5, .76, 6)], (255, 120, 40)),
      'bg-map': (['floor/sand_1', 'floor/sand_2', 'floor/sand_3'], None, [('trees/tree_1_red', .2, .3, 6), ('trees/tree_2_yellow', .78, .62, 6), ('statue_orb', .5, .12, 6), ('cloud_fire_0', .5, .9, 5)], (255, 200, 120)),
      'bg-battle-1': (['wall/brick_dark_0', 'wall/brick_dark_1'], ['floor/rect_gray_0', 'floor/rect_gray_1'], [('statue_sword', .14, .52, 8), ('statue_sword', .86, .52, 8)], (255, 150, 60)),
      'bg-battle-2': (['wall/brick_brown-vines_1', 'wall/brick_brown-vines_2'], ['floor/bog_green_0', 'floor/bog_green_1'], [('crumbled_column', .14, .5, 8), ('crumbled_column', .86, .52, 8)], (120, 220, 140)),
      'bg-battle-3': (['wall/stone_brick_1', 'wall/stone_brick_3'], ['floor/pebble_brown_0', 'floor/pebble_brown_1'], [('granite_statue', .14, .5, 8), ('granite_statue', .86, .5, 8)], (255, 170, 100)),
      'bg-elite': (['wall/hell_1', 'wall/hell_2'], ['floor/cobble_blood_1', 'floor/cobble_blood_2'], [('statue_demonic_bust', .14, .5, 8), ('statue_demonic_bust', .86, .5, 8)], (255, 60, 40)),
      'bg-boss-mire-behemoth': (['wall/lair_0', 'wall/lair_1'], ['floor/bog_green_2', 'floor/bog_green_3'], [('mangrove', .12, .5, 8), ('mangrove', .88, .5, 8)], (150, 220, 160)),
      'bg-boss-ashen-wraith': (['wall/church_0', 'wall/church_1'], ['floor/crypt_10', 'floor/crypt_11'], [('altar_old', .5, .36, 8), ('flame_0', .2, .45, 5), ('flame_0', .8, .45, 5)], (255, 170, 90)),
      'bg-boss-gate-colossus': (['wall/marble_wall_1', 'wall/marble_wall_2'], ['floor/marble_floor_1', 'floor/marble_floor_2'], [('statue_iron', .14, .5, 8), ('statue_iron', .86, .5, 8)], (120, 170, 255)),
      'bg-reward': (['wall/stone_brick_1'], ['floor/rect_gray_1'], [('chest_2_open', .5, .58, 10)], (255, 220, 140)),
      'bg-rest': (['floor/grass_0', 'floor/grass_1', 'floor/grass_2'], None, [('trees/tree_1_red', .15, .3, 8), ('trees/tree_2_red', .85, .35, 8), ('trees/tree_1_yellow', .2, .75, 8), ('cloud_fire_0', .5, .55, 8)], (255, 150, 60)),
      'bg-shop': (['wall/brick_brown_0', 'wall/brick_brown_1'], ['floor/rect_gray_0'], [('shop_general', .5, .45, 10), ('misc_lantern', .25, .38, 6), ('misc_lantern', .75, .38, 6)], (255, 200, 110)),
      'bg-event': (['floor/grass_0', 'floor/grass_1'], None, [('trees/tree_1_lightred', .15, .3, 8), ('trees/tree_2_lightred', .85, .3, 8), ('trees/tree_1_yellow', .2, .78, 8), ('trees/tree_2_yellow', .8, .8, 8), ('insubstantial_wisp', .5, .5, 7)], (150, 200, 255)),
      'bg-victory': (['wall/marble_wall_1'], ['floor/marble_floor_1'], [('statue_angel', .5, .42, 12), ('goldaura_0', .5, .42, 12)], (255, 220, 140)),
      'bg-defeat': (['wall/stone_brick_2'], ['floor/grass_2'], [('statue_orb', .5, .42, 12), ('cloud_grey_smoke', .5, .7, 8)], (120, 100, 140))}
def title():
    """Lone pixel tower (the set's stone-brick wall tiles) rising into a starry ember sky, campfire at its foot."""
    W, Hh = 1080, 1920; out = Image.new('RGBA', (W, Hh)); d = ImageDraw.Draw(out); rnd = random.Random(2)
    for y in range(Hh):
        t = y / Hh; d.line((0, y, W, y), fill=(int(14 + 70 * t ** 2), int(12 + 30 * t ** 2), int(30 + 10 * t), 255))
    for _ in range(160):
        x, y = rnd.randrange(W), rnd.randrange(int(Hh * .6)); r = rnd.choice((2, 2, 4)); d.rectangle((x, y, x + r, y + r), fill=(255, 240, 210, rnd.randint(120, 255)))
    out.alpha_composite(glow(W, Hh, W // 2, int(Hh * .78), 600, (255, 110, 40), 160))
    k = 4; s32 = 32 * k; top = int(Hh * .40); base = int(Hh * .84) // s32 * s32
    tw = 3; x0 = W // 2 - tw * s32 // 2
    for y in range(top, base, s32):
        for i in range(tw): out.alpha_composite(ImageEnhance.Brightness(nn(spr(f'wall/stone_brick_{rnd.randint(1, 3)}'), k)).enhance(.36 + .08 * i), (x0 + i * s32, y))
    for i in range(tw + 1):   # crenellations
        if i % 2 == 0: out.alpha_composite(ImageEnhance.Brightness(nn(spr('wall/stone_brick_1'), k)).enhance(.6).crop((0, 0, s32 * 2 // 3, s32 // 2)), (x0 - 20 + i * (tw * s32 + 40) // tw, top - s32 // 2))
    win = Image.new('RGBA', (40, 64), (255, 170, 60, 255)); out.alpha_composite(win, (W // 2 - 20, top + s32))
    out.alpha_composite(glow(W, Hh, W // 2, top + s32 + 30, 90, (255, 160, 60), 200))
    put(out, spr('flame_0'), W // 2, top - s32, 6)
    for x in range(0, W, s32): out.alpha_composite(ImageEnhance.Brightness(nn(spr(f'floor/grass_{rnd.randint(0, 2)}'), k)).enhance(.45), (x, base))
    for x in range(0, W, s32): out.alpha_composite(ImageEnhance.Brightness(nn(spr(f'floor/grass_{rnd.randint(0, 2)}'), k)).enhance(.35), (x, base + s32)) if base + s32 < Hh else None
    for y2 in range(base + 2 * s32, Hh, s32):
        for x in range(0, W, s32): out.alpha_composite(ImageEnhance.Brightness(nn(spr('floor/grass_1'), k)).enhance(.28), (x, y2))
    put(out, spr('trees/tree_1_red'), int(W * .12), base - 20, 5); put(out, spr('trees/tree_2_red'), int(W * .88), base - 10, 5)
    put(out, spr('cloud_fire_0'), int(W * .64), base + 70, 4)
    return vign(out, .45)

def background(stem):
    W, Hh = 1080, 1920; walls, floor, props, col = BG[stem]; k = 6; s = 32 * k
    out = tile_bg(walls, W, Hh, k, 3, .62)
    if floor:
        fl = tile_bg(floor, W, Hh, k, 4, .7); horizon = int(Hh * .42) // s * s; out.paste(fl.crop((0, horizon, W, Hh)), (0, horizon))
        sh = Image.new('RGBA', (W, 60)); ImageDraw.Draw(sh).rectangle((0, 0, W, 60), fill=(0, 0, 0, 120)); out.alpha_composite(sh.filter(ImageFilter.GaussianBlur(12)), (0, horizon))
    out.alpha_composite(glow(W, Hh, W // 2, int(Hh * .55), 520, col, 150))
    for t, x, y, kk in props:
        sp = spr(t)
        if x < .3 or x > .7: kk = min(kk, 3); x = .07 if x < .5 else .91; y = max(y, .56)   # side props stay small and low (desktop cover crop)
        put(out, sp, int(W * x), int(Hh * y), kk)
    out = vign(out, .62)
    if stem == 'bg-defeat': out = ImageEnhance.Color(out).enhance(.5)
    return out
EVENT = {'event-ember-shrine': (['altar_makhleb_flame_1', 'flame_0'], 'x'), 'event-wandering-tinker': (['deep_dwarf_artificer', 'shop_gadgets'], 'n'), 'event-whispering-well': (['blue_fountain', 'gold_pile'], 'a'),
         'event-stranded-caravan': (['abandoned_shop', 'misc_box'], 'n'), 'event-mirror-pool': (['mirrored_wall', 'deep_water'], 'a'), 'event-back-alley-gambler': (['unique/crazy_yiuf', 'misc_deck'], 's')}
def event(stem):
    toks, h = EVENT[stem]; W, Hh = 512, 384; base = tile_bg(['floor/grass_0', 'floor/grass_1'] if h in 'ns' else WALL[h], W, Hh, 4, 7, .45)
    base.alpha_composite(glow(W, Hh, W // 2, Hh // 2, 170, TONE[h], 170)); put(base, spr(toks[1]), W // 2 + 130, Hh // 2 + 50, 5); put(base, spr(toks[0]), W // 2 - 40, Hh // 2, 8)
    return vign(base, .5)

def save(stem, im):
    s = SLOTS[stem]; w, h = s['w'], s['h']
    if im.size != (w, h): im = ImageOps.fit(im, (w, h), Image.NEAREST)
    if not s['alpha']: im = im.convert('RGB')
    im.save(f'{H}/free-art/{stem}.webp' if False else f'{H}/{stem}.webp', 'WEBP', quality=92, method=6)

PLAN = {}
for st in SLOTS:
    if st in CARD: PLAN[st] = (lambda st=st: card(st))
    elif st in ENEMY: PLAN[st] = (lambda st=st: figure(ENEMY[st], 768, 768, (255, 90, 40) if st in ('enemy-mire-behemoth', 'enemy-ashen-wraith', 'enemy-gate-colossus') else None))
    elif st in HERO: PLAN[st] = (lambda st=st: figure(HERO[st], 768, 1024, TONE[st[-1]]))
    elif st in ITEM: PLAN[st] = (lambda st=st: icon(st))
    elif st.startswith('frame-'): PLAN[st] = (lambda st=st: frame(st[6:]))
    elif st.startswith('gem-'): PLAN[st] = (lambda st=st: gem(st[4:]))
    elif st.startswith('die-'): PLAN[st] = (lambda st=st: die(int(st[-1])))
    elif st.startswith('fx-'): PLAN[st] = (lambda st=st: fx(st))
    elif st in BG: PLAN[st] = (lambda st=st: background(st))
    elif st in EVENT: PLAN[st] = (lambda st=st: event(st))
PLAN['card-back'] = card_back
PLAN['bg-title'] = title
if __name__ == '__main__':
    only = sys.argv[sys.argv.index('--only') + 1] if '--only' in sys.argv else '.'
    done = [s for s in PLAN if re.search(only, s)]
    for st in done: save(st, PLAN[st]())
    print('composed', len(done), 'of', len(SLOTS), 'slots; unplanned:', [s for s in SLOTS if s not in PLAN])
    if MISS: print('MISSING sprites:', sorted(set(MISS)))
