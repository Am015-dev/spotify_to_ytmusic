import sys, glob, json, re, os, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *

SRC = '/home/user/spotify_to_ytmusic/games-src/vinegrave/free-art'
DST = OUT + '/vinegrave'
META = json.load(open(S + '/meta.json'))
roots = glob.glob(S + '/vg/*') + glob.glob('/tmp/claude-0/s/work/vg/met*') + glob.glob('/tmp/claude-0/s/work/vg/cath*')
P = load_pool(roots)

AM = re.compile(r'Maya|Olmec|Aztec|Inca|Moche|Mixtec|Zapotec|Teotihuac|Costa Rica|Panama|Colombia|Nasca|Nazca|Chim|Wari|Huari|Veracruz|Mexic|Peru|Tairona|Sin[uú]|Nicoya|Diquis|Taino|Huastec|Mezcala|Chav[ií]n|Paracas|Tiwanaku|Guatemala|Honduras|Ecuador|Brazil|Andean|Pre-Columbian|Quimbaya|Calima|Muisca|Tolima|Chorrera|Jama|Tumaco|Colima|Nayarit|Jalisco|Tlatilco|Toltec|Chupicuaro|Capacha|Cocle|Veraguas|Chiriqu|Casas|Huaxtec|Isthmian|Lambayeque|Vic[uú]s|Chancay|Ica|Recuay|Cupisnique|Tolita|Guanacaste|Atlantic Watershed|Greater')
BAD = re.compile(r'Greek|Attic|Roman|Egypt|Etrusc|Cypri|Chinese|Japan|Korea|Indian|Persia|Iran|Mesopot|Sumer|Assyr|Babylon|Byzant|Italian|French|Dutch|Flemish|British|German|American|Syria|Anatol|Hittite|Phoeni|Coptic|Islamic|Ottoman|Tibet|Nepal|Thai|Khmer|Javan|Indones|Burm|Africa|Benin|Yoruba|Cycladic|Minoan|Mycen')
BADCLS = re.compile(r'Vases|Costume|Prints|Paintings|Drawings|Photograph|Textiles|Books|Glass|Coins|Arms|Armor|Netsuke|Jewelry-Rings')


def info(it):
    m = META.get(it['url'].rsplit('/', 1)[-1], {})
    it['culture'] = m.get('culture', ''); it['dept'] = m.get('dept', ''); it['artist'] = m.get('artist', '')
    return it


for _v in P.values():
    for _it in _v:
        info(_it)
used = set()
cutcache = {}


def get_cut(it):
    k = it['path']
    if k not in cutcache:
        im = Image.open(k)
        s, _ = border_score(im)
        cutcache[k] = cutout(im) if s < 24 else None
    return cutcache[k]


allobj = []
seen = set()
for q, items in P.items():
    if q in ('catherwood',):
        continue
    for it in items:
        if it['url'] in seen:
            continue
        seen.add(it['url'])
        info(it)
        allobj.append(it)


def am(it):
    return bool(AM.search(it['culture'] or '')) and not BAD.search(it['culture'])


def okobj(it, americas_pref=True):
    if BAD.search(it['culture'] or '') and not am(it):
        return False
    if BADCLS.search(it['cls'] or ''):
        return False
    return True


def pick(dirs, need_cut=True, pref_am=True, allow_reuse=True, strict=False):
    cands = []
    for d in dirs:
        for it in P.get(d, []):
            if not okobj(it):
                continue
            cands.append(it)
    cands.sort(key=lambda it: (0 if am(it) else 1, it['path'] in used))
    for it in cands:
        if strict and not am(it) and pref_am == 'only':
            continue
        if it['path'] in used and not allow_reuse:
            continue
        c = get_cut(it) if need_cut else True
        if c is None:
            continue
        used.add(it['path'])
        return it, c
    return None, None


GENERIC = ['Maya', 'Olmec', 'Aztec', 'Inca', 'Moche', 'Mixtec', 'Zapotec', 'jade', 'mask', 'idol', 'figurine', 'vessel', 'gold_pendant', 'stone_sculpture', 'earflares', 'obsidian', 'ceremonial', 'metmaya', 'whistle', 'spindle_whorl', 'feather', 'mosaic', 'shell', 'pottery_cup', 'urn', 'cup', 'bowl', 'horn', 'comb', 'dice', 'bone']
random.seed(7)
mapping = {}   # stem -> (source item, flag)

# ---- keyword -> dirs ----
KW = [
    ('mask', ['mask']), ('frog', ['frog']), ('owl', ['owl']), ('serpent', ['serpent', 'snake']), ('snake', ['snake', 'serpent']),
    ('sun', ['sun']), ('star', ['star']), ('bat', ['bat']), ('ape', ['monkey']), ('boar', ['boar']), ('cat', ['jaguar']), ('fish', ['fish']),
    ('bird', ['bird', 'hummingbird']), ('moon', ['gold_ornament', 'gold_pendant']), ('jaguar', ['jaguar']), ('heron', ['bird']),
    ('hound', ['jaguar']), ('toad', ['frog']), ('wyrm', ['serpent', 'snake']), ('moth', ['wing', 'shell']), ('widow', ['shell']),
    ('crawler', ['shell']), ('golem', ['idol', 'Olmec']), ('warden', ['idol', 'mask']), ('lamp', ['lamp']), ('flask', ['flask']),
    ('canteen', ['flask']), ('kettle', ['flask', 'bowl']), ('telescope', ['telescope']), ('spyglass', ['telescope']), ('theodolite', ['telescope']),
    ('sextant', ['compass', 'telescope']), ('compass', ['compass']), ('almanac', ['book']), ('journal', ['book']), ('ledger', ['book']), ('codebook', ['book']),
    ('codex', ['codex', 'book']), ('book', ['book']), ('chisel', ['ax', 'axe']), ('pickaxe', ['ax', 'axe']), ('machete', ['knife', 'ax']), ('blade', ['knife', 'ax']),
    ('crate', ['chest']), ('lockbox', ['chest']), ('mapcase', ['chest']), ('satchel', ['basket']), ('bell', ['bell']), ('chime', ['bell']),
    ('cup', ['pottery_cup', 'cup']), ('bowl', ['bowl']), ('urn', ['urn']), ('dice', ['dice', 'bone']), ('horn', ['horn']), ('comb', ['comb']),
    ('dinghy', ['boat_model']), ('boat', ['boat_model']), ('ship', ['boat_model']), ('plane', ['airplane']), ('airship', ['airplane']), ('seaplane', ['airplane']),
    ('boot', ['boot']), ('car', ['carriage']), ('coin', ['gold_coin']), ('jewel', ['jade', 'gold_ornament']), ('tablet', ['tablet', 'codex']), ('arrow', ['arrow']),
    ('quiver', ['arrow']), ('drum', ['whistle']), ('flute', ['whistle']), ('disc', ['sun', 'gold_ornament']), ('totem', ['owl', 'idol']),
    ('glyph', ['stone_sculpture']), ('heart', ['jade', 'stone_sculpture']), ('ring', ['serpent', 'gold_ornament']), ('beetle', ['gold_ornament']),
    ('shell', ['shell']), ('mirror', ['obsidian']), ('hammock', ['hammock', 'basket']), ('rope', ['basket']), ('tent', ['tent']), ('mule', ['mule', 'boar']),
    ('camera', ['telescope']), ('radio', ['bell']), ('gramophone', ['horn']), ('scale', ['compass']), ('fan', ['feather']), ('cloak', ['feather']),
    ('crown', ['gold_ornament']), ('sceptre', ['idol']), ('throne', ['stone_sculpture']), ('key', ['gold_ornament']), ('lens', ['obsidian']),
    ('seed', ['jade']), ('tarp', ['basket']), ('flares', ['lamp']), ('brush', ['comb']), ('trail', ['compass']), ('permit', ['book']), ('grant', ['book']),
]
ITEM_STEMS = {'airship', 'almanac', 'brush', 'camera', 'canteen', 'chisel', 'codebook', 'crate', 'dinghy', 'flares', 'gramophone', 'grant', 'hammock', 'jeepkey',
              'journal', 'kettle', 'lamp', 'ledger', 'lockbox', 'machete', 'mapcase', 'mule', 'permit', 'pickaxe', 'quiver', 'radio', 'rope', 'ropebridge', 'satchel',
              'scale', 'seaplane', 'sextant', 'spyglass', 'tarp', 'tent', 'theodolite', 'trail'}
HONEST = {'lamp', 'canteen', 'kettle', 'spyglass', 'theodolite', 'sextant', 'almanac', 'journal', 'ledger', 'codebook', 'chisel', 'pickaxe', 'machete',
          'crate', 'lockbox', 'mapcase', 'satchel', 'dinghy', 'seaplane', 'airship', 'tent', 'hammock', 'rope', 'mule', 'flares', 'permit', 'grant', 'trail', 'camera',
          'scale', 'brush', 'quiver', 'gramophone', 'radio', 'jeepkey', 'tarp', 'ropebridge'}


def dirs_for(stem):
    s = stem.split('-', 1)[1] if '-' in stem else stem
    toks = re.split(r'-', s)
    for t in toks:
        for k, d in KW:
            if t == k:
                return d, True
    for t in toks:
        for k, d in KW:
            if k in t:
                return d, True
    return GENERIC, False


def backdrop_for(i):
    return backdrop((400, 300), (52, 66, 46), (24, 32, 26), seed=i)


def stems(prefix):
    return sorted(os.path.basename(f)[:-5] for f in glob.glob(SRC + '/' + prefix + '*.webp'))


rows = []


def rec(stem, it, flag, note=''):
    if it is None:
        rows.append((stem, 'generated', 'n/a (own work)', '-', 'FALLBACK'))
    else:
        rows.append((stem, os.path.basename(os.path.dirname(it['path'])) + '/' + os.path.basename(it['path']) + ' | ' + it['title'][:60], it['lic'], it['url'], flag))


def emit(stem, im, q=78):
    save(im, f'{DST}/{stem}.webp', q)


def sizeof(stem):
    return Image.open(f'{SRC}/{stem}.webp').size


def fallback_glow(size, col):
    w, h = size
    y, x = np.ogrid[:h, :w]
    d = np.sqrt(((x - w / 2) / (w / 2)) ** 2 + ((y - h / 2) / (h / 2)) ** 2)
    a = np.clip(1 - d, 0, 1) ** 2
    arr = np.zeros((h, w, 4), np.uint8)
    arr[..., 0], arr[..., 1], arr[..., 2] = col
    arr[..., 3] = (a * 200).astype(np.uint8)
    return Image.fromarray(arr, 'RGBA')


def fallback_frame(size, col, inner=0.08, rad=22, wd=14):
    w, h = size
    sc = 3
    im = Image.new('RGBA', (w * sc, h * sc), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 0, w * sc - 1, h * sc - 1), rad * sc, fill=col + (255,))
    d.rounded_rectangle((wd * sc, wd * sc, (w - wd) * sc, (h - wd) * sc), (rad - 8) * sc, fill=(0, 0, 0, 0))
    d.rounded_rectangle((wd * sc - 4, wd * sc - 4, (w - wd) * sc + 4, (h - wd) * sc + 4), (rad - 6) * sc, outline=tuple(int(c * 0.6) for c in col) + (255,), width=5)
    return im.resize((w, h), Image.LANCZOS)


# ============ LANDSCAPES / BACKGROUNDS ============
REL = re.compile(r'Virgin|Lady|Christ|Saint|St\.|Madonna|Portrait|Apparition|Annunc|Crucif|Holy|Nativity|Adoration|Hermit|Piet|Entomb|Bishop|Allegor|Still Life|Study|Head of|Gentleman|Woman|Man |Girl|Boy|Child|Altar|Triptych|Mary|Jesus|Angel|Martyr|Resurrect|Lamentation|Deposition|Magi|Nude|Venus|Apollo|Diana|Mars|Hercules|Bacchus|Cupid|Flowers|Vase|Bouquet')
LAND_DIRS = ['catherwood', 'metjungle'] + [d for d in P if d.startswith('L_')] + ['waterfall', 'cave', 'cliff', 'ruins', 'temple', 'jungle', 'tropical_landscape', 'river', 'lagoon', 'stone_pool', 'spring', 'shipwreck', 'pyramid']
LAND_DIRS = [d for d in LAND_DIRS if d not in ('L_explorer', 'L_traveler', 'L_naturalist', 'L_portrait_man')]
land = []
seenu = set()
for d in LAND_DIRS:
    for it in P.get(d, []):
        if it['url'] in seenu:
            continue
        if d != 'catherwood' and (REL.search(it['title']) or not re.match(r'Paintings|Drawings|Prints|Photo|^$', it['cls'] or '')):
            continue
        seenu.add(it['url'])
        land.append(info(it))
BYKEY = {}
for _v in P.values():
    for _it in _v:
        BYKEY[_it['path'].split('/')[-2] + '/' + _it['path'].split('/')[-1]] = _it
CUR = ['catherwood/06.jpg', 'catherwood/08.jpg', 'L_waterfall/06.jpg', 'catherwood/00.jpg', 'catherwood/04.jpg', 'L_cave/02.jpg', 'metjungle/02.jpg', 'catherwood/05.jpg',
       'L_waterfall/01.jpg', 'L_cave/10.jpg', 'catherwood/03.jpg', 'L_waterfall/00.jpg', 'L_cave/09.jpg', 'metjungle/03.jpg', 'L_cave/04.jpg', 'catherwood/01.jpg',
       'L_waterfall/03.jpg', 'L_cave/05.jpg', 'L_cave/08.jpg', 'metjungle/01.jpg', 'L_shipwreck/10.jpg', 'L_cave/11.jpg', 'metjungle/10.jpg', 'L_spring/04.jpg',
       'L_jungle/06.jpg', 'L_jungle/07.jpg', 'L_ruins/07.jpg', 'L_ruins/08.jpg', 'L_ruins/00.jpg', 'L_ruins/02.jpg', 'L_cliff/00.jpg', 'L_cliff/06.jpg', 'L_cliff/05.jpg']
land = [info(BYKEY[k]) for k in CUR if k in BYKEY]
bgs = land
bgiter = iter(bgs * 3)
lcount = 0


def land_img(size, k, zoom=1.0):
    global lcount
    it = bgs[k % len(bgs)]
    im = Image.open(it['path']).convert('RGB')
    if 'catherwood' in it['path'] or (it['cls'] or '').startswith('Prints'):
        W0, H0 = im.size
        im = im.crop((int(W0 * .06), int(H0 * .07), int(W0 * .94), int(H0 * .86)))
    w, h = im.size
    # sub-window by zoom + position variation
    r = (k // len(bgs))
    z = zoom - 0.18 * (r % 3)
    cw, ch = int(w * z), int(h * z)
    cx = 0.5 if r == 0 else [0.2, 0.8, 0.5][r % 3]
    x0 = int((w - cw) * cx); y0 = int((h - ch) * (0.4 if r == 0 else 0.7))
    im = im.crop((x0, y0, x0 + cw, y0 + ch))
    out = cover(im, size, 0.5, 0.45)
    out = grade_vg(out)
    return vignette(out, 0.35), it


bgstems = ['title-bg', 'board-map', 'map-act1', 'map-act2', 'map-act3', 'result-win', 'result-lose', 'track-bg']
k = 0
for st in bgstems:
    sz = sizeof(st)
    im, it = land_img(sz, k)
    if st == 'result-lose':
        im = ImageEnhance.Brightness(im).enhance(0.7)
    emit(st, im, 74)
    rec(st, it, 'real'); k += 1

for st in stems('site-') + stems('temple-'):
    sz = sizeof(st)
    im, it = land_img(sz, k, 0.9)
    emit(st, im, 74)
    rec(st, it, 'real'); k += 1

# ============ PORTRAITS ============
pdirs = ['explorer', 'traveler', 'naturalist', 'portrait_man', 'L_explorer', 'L_traveler', 'L_naturalist', 'L_portrait_man']
ports = [info(BYKEY[k]) for k in ['naturalist/06.jpg', 'portrait_man/02.jpg', 'L_portrait_of_a_man/00.jpg', 'L_portrait_of_a_man/01.jpg', 'L_portrait_of_a_man/02.jpg', 'L_portrait_of_a_man/06.jpg', 'L_portrait_of_a_man/09.jpg', 'L_officer_portrait/06.jpg'] if k in BYKEY]
pi = 0
for st in stems('portrait-'):
    sz = sizeof(st)
    if ports:
        it = ports[pi % len(ports)]; pi += 1
        im = Image.open(it['path']).convert('RGB')
        if 'portrait_man' in it['path']:
            W0, H0 = im.size
            im = im.crop((int(W0 * .12), int(H0 * .08), int(W0 * .88), int(H0 * .92)))
        out = cover(im, sz, 0.5, 0.12)
        out = vignette(grade_vg(out), 0.4)
        emit(st, out); rec(st, it, 'real')
    else:
        rec(st, None, 'FALLBACK')

# ============ CARDS ============
ci = 0
for st in stems('card-'):
    s = st[5:]
    if s in ('back',):
        continue
    if s.startswith('frame-'):
        col = {'frame-art': (150, 110, 50), 'frame-item': (110, 90, 60), 'frame-fear': (70, 40, 50)}[st[5:]]
        emit(st, fallback_frame((300, 420), col)); rec(st, None, 'FALLBACK'); continue
    dirs, matched = dirs_for(st)
    isitem = s in ITEM_STEMS
    flag = 'real'
    it, c = pick(dirs, strict=True) if matched else (None, None)
    if it is None:
        it, c = pick(GENERIC)
        flag = 'FALLBACK' if isitem else 'real'
    elif isitem and dirs and s not in HONEST:
        flag = 'FALLBACK'
    if it is None:
        rec(st, None, 'FALLBACK'); continue
    bd = backdrop_for(ci); ci += 1
    cardbase = bd.convert('RGBA')
    sub = contain_rgba(c, (400, 300), 0.10)
    cardbase.alpha_composite(grade_vg(sub))
    emit(st, cardbase.convert('RGB'))
    rec(st, it, flag)

# card back: textile / engraving pattern
sz = (300, 420)
cb = Image.new('RGB', sz, (30, 44, 36))
cat = P.get('catherwood', [])
if cat:
    srcim = Image.open(cat[0]['path']).convert('RGB'); _w, _h = srcim.size; srcim = srcim.crop((int(_w * .1), int(_h * .1), int(_w * .9), int(_h * .8)))
    cb = grade_vg(cover(srcim, sz, 0.5, 0.5))
    cb = ImageEnhance.Brightness(cb).enhance(0.75)
d = ImageDraw.Draw(cb)
d.rounded_rectangle((10, 10, sz[0] - 11, sz[1] - 11), 14, outline=(214, 176, 90), width=4)
d.rounded_rectangle((22, 22, sz[0] - 23, sz[1] - 23), 8, outline=(150, 120, 60), width=2)
emit('card-back', cb); rows.append(('card-back', 'catherwood/' + os.path.basename(cat[0]['path']) + ' | engraving + drawn border', cat[0]['lic'], cat[0]['url'], 'real') if cat else ('card-back', 'generated', '-', '-', 'FALLBACK'))

# ============ CUTOUT SLOTS ============
for prefix, size, pad in [('idol-', None, 0.08), ('guard-', None, 0.06), ('explorer-', None, 0.05), ('icon-', None, 0.1), ('res-', None, 0.1), ('tr-', None, 0.1), ('token-', None, 0.1)]:
    for st in stems(prefix):
        sz = sizeof(st)
        dirs, matched = dirs_for(st)
        flag = 'real'
        if prefix == 'explorer-':
            dirs, matched = ['figurine', 'idol', 'Maya', 'Aztec', 'Inca', 'Moche'], True
        if prefix == 'icon-':
            dirs, matched = {'icon-howto': (['book', 'codex'], True), 'icon-quick': (['arrow', 'jade'], True), 'icon-story': (['codex', 'book'], True)}.get(st, (GENERIC, False))
        it, c = pick(dirs, strict=True) if matched else (None, None)
        if it is None:
            it, c = pick(GENERIC); flag = 'FALLBACK'
        if it is None:
            rec(st, None, 'FALLBACK'); continue
        sub = contain_rgba(c, sz, pad)
        if prefix == 'explorer-':
            # figure upright preference: contain keeps aspect
            pass
        emit(st, grade_vg(sub)); rec(st, it, flag)

# ============ FALLBACKS ============
for st in stems('fx-'):
    col = {'fx-discover': (240, 210, 120), 'fx-guardian': (200, 70, 60), 'fx-idol': (110, 220, 170)}[st]
    emit(st, fallback_glow(sizeof(st), col)); rec(st, None, 'FALLBACK')
st = 'shrine-slot'
sz = sizeof(st)
bd = backdrop(sz[:2] if len(sz) == 2 else sz, (70, 74, 60), (40, 44, 36), 3).convert('RGBA')
emit(st, bd); rec(st, None, 'FALLBACK')

# ---------- write map ----------
os.makedirs(DST, exist_ok=True)
with open(DST + '/_MAP.tsv', 'w') as f:
    f.write('stem\tsource_file\tlicence\tsource_url\tflag\n')
    for r in sorted(rows):
        f.write('\t'.join(r) + '\n')
done = {r[0] for r in rows}
allst = {os.path.basename(x)[:-5] for x in glob.glob(SRC + '/*.webp')}
print('missing', sorted(allst - done))
print('real', sum(1 for r in rows if r[4] == 'real'), 'fallback', sum(1 for r in rows if r[4] == 'FALLBACK'))
# credits
cred = {}
for r in rows:
    if r[2].startswith('n/a'):
        continue
    cred.setdefault(r[3], r[1].split(' | ')[-1] + ' | ' + r[2])
with open(DST + '/_CREDITS.md', 'w') as f:
    f.write('# Vinegrave temporary free library: credits\n\nAll sources are CC0 / public domain. No AI-generated, NC, ND or SA material. Colour grade (one gradient map + vignette) applied by this library.\n\n')
    f.write('- Metropolitan Museum of Art, Open Access (CC0, isPublicDomain=true via the keyless collection API), object pages listed in _MAP.tsv.\n')
    f.write('- Frederick Catherwood, "Views of Ancient Monuments in Central America, Chiapas and Yucatan" (1844), public domain, via Wikimedia Commons / Cleveland Museum of Art Open Access (CC0).\n\n## Per object\n\n')
    for u, t in sorted(cred.items(), key=lambda x: x[1]):
        f.write(f'- {t} | {u}\n')
