"""Build free-library for short-fuse, sunglaze, thornbound, tidewake from Met Open Access (CC0) objects.
Usage: python3 build_w410b.py SLUG"""
import re, sys, os, json, urllib.request, urllib.parse, time, hashlib
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
CACHE = '/tmp/claude-0/w410b'
API = 'https://collectionapi.metmuseum.org/public/collection/v1/'

def get(url, binary=False):
    fn = os.path.join(CACHE, hashlib.md5(url.encode()).hexdigest())
    if os.path.exists(fn):
        d = open(fn, 'rb').read()
    else:
        for t in range(3):
            try:
                d = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=40).read(); break
            except Exception as e:
                d = None; time.sleep(1.5)
        if d is None: return None
        open(fn, 'wb').write(d)
    return d if binary else json.loads(d)

def search(q):
    r = get(API.replace('v1/', 'v1.1/') + 'search?hasImages=true&isPublicDomain=true&limit=100&q=' + urllib.parse.quote(q))
    return (r or {}).get('objectIDs') or []

USED = set()
opt_any = False
def fetch_img(queries, minside=900, skip=0, aspect=None, busy=False, bad=None, must=None):
    k = 0
    for q in queries:
        ids = [i for i in search(q) if i not in USED]
        from concurrent.futures import ThreadPoolExecutor
        with ThreadPoolExecutor(8) as ex: objs = list(ex.map(lambda i: get(API + 'objects/%d' % i), ids))
        for oid, o in zip(ids, objs):
            if not o or not o.get('isPublicDomain') or not o.get('primaryImage'): continue
            if o.get('classification', '') and any(b in o['classification'] for b in ('Photograph',)): pass
            d = get(o['primaryImage'], True)
            if not d: continue
            try:
                import io; im = Image.open(io.BytesIO(d)); im.draft('RGB', (2400, 2400)); im.load()
            except Exception: continue
            if max(im.size) < minside: continue
            txt = ' '.join([o.get('title') or '', o.get('objectName') or '', o.get('classification') or '', ' '.join(t.get('term', '') for t in (o.get('tags') or []))])
            if re.search(r'trade card|title page|frontispiece|letter|manuscript|inscription|certificate|bookplate|label|poster|sheet music|alphabet|calligraph', txt, re.I): continue
            if must and not re.search(must, txt, re.I): continue
            if bad and re.search(bad, o.get('title') or '', re.I): continue
            if re.search(r'portrait|dish|bowl|cup\b|nude|bust|teapot|ewer|jug|spoon|fragment|sherd|ring\b', o.get('title') or '', re.I) and not opt_any: continue
            if busy and border_score(im)[0] < 11: continue
            if aspect:
                a = im.size[0] / im.size[1]
                if not (aspect[0] <= a <= aspect[1]): continue
            if k < skip: k += 1; continue
            USED.add(oid)
            im = im.convert('RGB')
            if re.search(r'Print|Drawing|Photograph|Paper', (o.get('classification') or '') + ' ' + (o.get('objectName') or ''), re.I):
                W0, H0 = im.size; im = im.crop((int(W0*.04), int(H0*.03), int(W0*.96), int(H0*.89)))
            return im, dict(title=(o.get('title') or '')[:80], url=o.get('objectURL'), artist=o.get('artistDisplayName') or '', q=q)
    return None, None

def rounded_plate(tex, size, rim=(30, 22, 16), r=0.12):
    w, h = size
    t = cover(tex, size)
    m = Image.new('L', size, 0)
    ImageDraw.Draw(m).rounded_rectangle((2, 2, w - 3, h - 3), radius=int(min(w, h) * r), fill=255)
    m = m.filter(ImageFilter.GaussianBlur(0.8))
    out = Image.new('RGBA', size, (0, 0, 0, 0))
    base = t.convert('RGBA'); base.putalpha(m)
    bd = Image.new('RGBA', size, (0, 0, 0, 0))
    d = ImageDraw.Draw(bd)
    d.rounded_rectangle((2, 2, w - 3, h - 3), radius=int(min(w, h) * r), outline=rim + (255,), width=max(4, min(w, h) // 40))
    d.rounded_rectangle((2 + max(6, min(w, h) // 28),) * 2 + (w - 3 - max(6, min(w, h) // 28), h - 3 - max(6, min(w, h) // 28)), radius=int(min(w, h) * r * .8), outline=(255, 235, 190, 90), width=2)
    out.alpha_composite(base); out.alpha_composite(bd)
    return out

GR = {
 'short-fuse': dict(stops=[(0, (18, 16, 22)), (.35, (74, 52, 42)), (.7, (196, 134, 62)), (1, (250, 226, 172))], k=.62, sat=.8, rim=(34, 22, 14)),
 'sunglaze': dict(stops=[(0, (16, 26, 50)), (.35, (52, 96, 128)), (.7, (222, 172, 84)), (1, (250, 236, 202))], k=.6, sat=.9, rim=(18, 30, 52)),
 'thornbound': dict(stops=[(0, (24, 14, 22)), (.35, (84, 38, 50)), (.7, (176, 124, 82)), (1, (240, 220, 184))], k=.62, sat=.85, rim=(30, 14, 22)),
 'tidewake': dict(stops=[(0, (8, 28, 38)), (.35, (30, 82, 94)), (.7, (172, 150, 100)), (1, (240, 226, 190))], k=.64, sat=.85, rim=(10, 30, 40)),
}
BLUE = [(0, (8, 30, 70)), (.4, (30, 90, 160)), (.75, (150, 200, 240)), (1, (240, 250, 255))]

# stem, (w,h), kind, queries, options
SPEC = {
'short-fuse': [
 ('table-clock-tower', (1920, 1080), 'scene', ['clock tower', 'clock tower street', 'town hall clock', 'church tower clock']),
 ('table-clock-tower-phone', (1080, 1920), 'scene', ['clock tower street', 'bell tower']),
 ('table-blueprint', (1920, 1080), 'scene', ['mechanical drawing machine plan', 'design for a machine'], dict(stops=BLUE, k=.9, inv=True)),
 ('table-blueprint-phone', (1080, 1920), 'scene', ['architectural plan drawing', 'engineering plan', 'steam engine drawing', 'architectural elevation'], dict(stops=BLUE, k=.9, inv=True)),
 ('event-boom', (1024, 768), 'scene', ['explosion', 'gunpowder', 'siege cannon fire', 'burning ship fire']),
 ('event-defused', (1024, 768), 'scene', ['watch movement clockwork', 'clockwork']),
 ('end-lose-b', (1024, 768), 'scene', ['burning city', 'fire destruction', 'ruins fire smoke', 'conflagration']),
 ('end-lose-c', (1024, 768), 'scene', ['battlefield smoke', 'burning', 'fire at night', 'destruction']),
 ('end-win-b', (1024, 768), 'scene', ['fireworks display', 'fireworks']),
 ('end-win-c', (1024, 768), 'scene', ['festival lanterns celebration', 'illumination celebration night']),
 ('wire-tile-frame-d', (512, 512), 'scene', ['clock dial face', 'compass dial']),
 ('start-plate', (1024, 1024), 'scene', ['astronomical clock', 'gear wheel mechanism']),
 ('tb-plate', (1024, 1024), 'scene', ['brass gears', 'orrery mechanism']),
 ('gx-bar-plate', (1024, 512), 'plate', ['brass plate engraved', 'copper plate']),
 ('gx-drawer-head-plate', (1024, 512), 'plate', ['bronze plaque', 'brass panel']),
 ('plate-mine-plate', (512, 512), 'plate', ['brass tool', 'iron lock plate']),
 ('plate-plate', (512, 512), 'plate', ['copper plate', 'metal plate relief']),
 ('rp-plate', (512, 512), 'plate', ['iron plate', 'bronze disc']),
 ('tile-crew-plate', (512, 512), 'plate', ['brass compass', 'bronze mirror']),
 ('tile-mine-plate', (512, 512), 'plate', ['iron shield boss', 'metal disc']),
],
'sunglaze': [
 ('tile-gloss-b', (256, 256), 'scene', ['glazed ceramic tile', 'Iznik tile'], dict(object=True)),
 ('tile-gloss-c', (256, 256), 'scene', ['lustre tile', 'tile panel Persian'], dict(object=True)),
 ('table-kiln-hall', (1920, 1080), 'scene', ['potter workshop', 'pottery kiln', 'glass furnace', 'ceramic factory']),
 ('table-kiln-hall-phone', (1080, 1920), 'scene', ['potters at work', 'kiln', 'glassmaking furnace', 'furnace workshop']),
 ('table-moon-courtyard', (1920, 1080), 'scene', ['Alhambra courtyard', 'courtyard moonlight']),
 ('table-moon-courtyard-phone', (1080, 1920), 'scene', ['moonlit garden architecture', 'mosque courtyard']),
 ('back-black-kiln', (768, 1024), 'scene', ['black glazed vessel', 'black pottery']),
 ('end-lose-b', (1024, 768), 'scene', ['ruins desert', 'ruined palace', 'abandoned temple ruins', 'crumbling wall']),
 ('end-lose-c', (1024, 768), 'scene', ['ruins', 'ruined mosque', 'desert ruin storm']),
 ('end-win-b', (1024, 768), 'scene', ['palace hall', 'court festival palace', 'tiled interior']),
 ('end-win-c', (1024, 768), 'scene', ['palace garden', 'dome interior', 'mosque interior tile']),
 ('btn-sm-button-plate', (512, 512), 'plate', ['glazed tile blue', 'turquoise tile']),
],
'thornbound': [
 ('board-plate', (1024, 1024), 'scene', ['map of a kingdom', 'old map region']),
 ('tkey-picture', (1024, 1024), 'scene', ['throne', 'royal chair of state', 'bishop throne']),
 ('table-ossuary', (1920, 1080), 'scene', ['catacombs skulls', 'skulls and bones', 'memento mori', 'crypt'], dict(object=True)),
 ('table-ossuary-phone', (1080, 1920), 'scene', ['crypt interior', 'vaulted crypt']),
 ('table-sinks-masquerade', (1920, 1080), 'scene', ['masquerade ball', 'carnival masks', 'Venetian carnival', 'masked ball']),
 ('table-sinks-masquerade-phone', (1080, 1920), 'scene', ['masked ball dancers', 'carnival', 'masquerade', 'harlequin']),
 ('event-coronation', (1024, 768), 'scene', ['coronation', 'crowning', 'enthronement', 'king and court']),
 ('event-uprising', (1024, 768), 'scene', ['peasants revolt', 'rebellion', 'riot crowd', 'revolution barricade', 'mob']),
 ('back-moth-ossuary', (768, 1024), 'scene', ['moth', 'moth insect plate']),
 ('end-lose-b', (1024, 768), 'scene', ['castle ruins', 'ruined abbey', 'burning castle']),
 ('end-lose-c', (1024, 768), 'scene', ['empty throne ruins', 'abandoned abbey ruins']),
 ('end-win-b', (1024, 768), 'scene', ['royal banquet hall', 'knights tournament']),
 ('end-win-c', (1024, 768), 'scene', ['castle sunrise', 'triumphal procession']),
 ('gx-bar-plate', (1024, 512), 'plate', ['carved wood panel', 'oak panel carved']),
 ('gx-drawer-head-plate', (1024, 512), 'plate', ['carved wooden chest panel', 'gothic carved panel']),
 ('gxh-ok-button-plate', (512, 512), 'plate', ['heraldic shield', 'coat of arms plaque']),
 ('tbtn-button-plate', (1024, 512), 'plate', ['leather book binding', 'embossed leather']),
 ('tbtn-story-button-plate', (1024, 512), 'plate', ['velvet embroidery', 'embroidered textile red']),
],
'tidewake': [
 ('tile-water-e', (512, 512), 'scene', ['stormy sea waves', 'sea waves painting']),
 ('tile-water-f', (512, 512), 'scene', ['ocean swell', 'rough sea']),
 ('tile-water-g', (512, 512), 'scene', ['wave foam seascape', 'sea study waves'], dict(bad='dish|plate|vessel|floral')),
 ('tile-water-h', (512, 512), 'scene', ['sea whirlpool', 'maelstrom']),
 ('table-harbor-noon', (1920, 1080), 'scene', ['harbor ships', 'harbor view', 'port scene']),
 ('table-harbor-noon-phone', (1080, 1920), 'scene', ['port with ships', 'sailing ships harbour']),
 ('table-rift-night', (1920, 1080), 'scene', ['ship storm night', 'moonlit sea', 'moonlight marine', 'ship in a storm']),
 ('table-rift-night-phone', (1080, 1920), 'scene', ['shipwreck storm', 'sea storm', 'ship in a storm']),
 ('event-leviathan', (1024, 768), 'scene', ['sea monster', 'whale', 'leviathan', 'sea serpent', 'kraken']),
 ('end-lose-b', (1024, 768), 'scene', ['shipwreck', 'ship sinking']),
 ('end-lose-c', (1024, 768), 'scene', ['wreck storm rocks', 'ship in distress']),
 ('end-win-b', (1024, 768), 'scene', ['ships at sunrise sea', 'fleet at sea']),
 ('end-win-c', (1024, 768), 'scene', ['harbor return ship', 'ships in port sunset']),
 ('start-plate', (1024, 1024), 'scene', ['nautical chart', 'sea chart', 'portolan chart', 'map of coast']),
 ('button-button-plate', (512, 512), 'plate', ['ship rope', 'anchor', 'ship model brass', 'compass']),
 ('gx-bar-plate', (1024, 512), 'plate', ['old ship timber carved', 'carved wood ship']),
 ('gx-drawer-head-plate', (1024, 512), 'plate', ['ship figurehead carved', 'carved wood panel', 'carved ship timber']),
 ('gxh-ok-button-plate', (512, 512), 'plate', ['porthole', 'brass dial', 'ship compass', 'sextant']),
],
}

MUST = {
'short-fuse': {'table-clock-tower': 'clock|tower', 'table-clock-tower-phone': 'clock|tower|bell', 'table-blueprint': 'drawing|design|machine|plan|engine|mill', 'table-blueprint-phone': 'drawing|design|machine|plan|engine|mill|elevation', 'event-boom': 'explo|fire|blast|powder|burning|battle|siege|bomb|cannon', 'event-defused': 'clock|watch|mechan|automat|gear', 'end-lose-b': 'fire|burn|ruin|smoke|battle|destruct|siege', 'end-lose-c': 'fire|burn|ruin|smoke|battle|destruct|siege|storm', 'end-win-b': 'firework|festival|celebrat|lantern|illuminat|triumph|feast', 'end-win-c': 'firework|festival|celebrat|lantern|illuminat|triumph|feast|night', 'wire-tile-frame-d': 'clock|dial|compass|watch', 'start-plate': 'clock|astrolab|armillary|orrery|globe', 'tb-plate': 'gear|clock|watch|mechan|automat|astrolab|instrument|orrery', 'gx-bar-plate': 'brass|bronze|copper|iron|metal|plate', 'gx-drawer-head-plate': 'brass|bronze|copper|iron|metal|plate|plaque', 'plate-mine-plate': 'brass|bronze|copper|iron|metal|steel', 'plate-plate': 'brass|bronze|copper|iron|metal|steel', 'rp-plate': 'brass|bronze|copper|iron|metal|steel', 'tile-crew-plate': 'brass|bronze|copper|iron|metal|steel', 'tile-mine-plate': 'brass|bronze|copper|iron|metal|steel'},
'sunglaze': {'table-kiln-hall': 'kiln|potter|furnace|ceramic|workshop|glass|factory', 'table-kiln-hall-phone': 'kiln|potter|furnace|ceramic|workshop|glass|factory|forge', 'table-moon-courtyard': 'courtyard|garden|palace|mosque|alhambra|moon|night|patio', 'table-moon-courtyard-phone': 'courtyard|garden|palace|mosque|alhambra|moon|night|patio|architect', 'back-black-kiln': 'black|vase|vessel|jar|bottle', 'end-lose-b': 'ruin|broken|crack|desert|abandon|collaps|destruct', 'end-lose-c': 'ruin|broken|crack|desert|abandon|collaps|destruct|storm', 'end-win-b': 'palace|dome|hall|sun|garden|court|festival|mosque', 'end-win-c': 'palace|dome|hall|sun|garden|court|festival|mosque|dawn', 'tile-gloss-b': 'tile', 'tile-gloss-c': 'tile', 'btn-sm-button-plate': 'tile'},
'thornbound': {'board-plate': 'map|chart|plan', 'tkey-picture': 'throne|chair', 'table-ossuary': 'skull|bone|catacomb|crypt|ossuary|death|skeleton|tomb', 'table-ossuary-phone': 'skull|bone|catacomb|crypt|ossuary|death|skeleton|tomb|vault', 'table-sinks-masquerade': 'mask|ball|carnival|masquerade|harlequin|dance|revel', 'table-sinks-masquerade-phone': 'mask|ball|carnival|masquerade|harlequin|dance|revel|festival', 'event-coronation': 'coronation|crown|king|queen|enthron|throne', 'event-uprising': 'revolt|riot|rebel|uprising|peasant|insurrection|mob|barricade|crowd|revolution', 'back-moth-ossuary': 'moth|butterfl|insect', 'end-lose-b': 'ruin|abbey|burn|storm|abandon|empty|castle', 'end-lose-c': 'ruin|abbey|burn|storm|abandon|empty|castle|tomb', 'end-win-b': 'banquet|feast|tournament|triumph|procession|victory|coronation|joust', 'end-win-c': 'banquet|feast|tournament|triumph|procession|victory|coronation|joust|castle', 'gx-bar-plate': 'carved|panel|wood|oak', 'gx-drawer-head-plate': 'carved|panel|wood|oak', 'gxh-ok-button-plate': 'shield|arms|heraldic|armorial', 'tbtn-button-plate': 'leather|bind|emboss|velvet|textile', 'tbtn-story-button-plate': 'embroider|velvet|textile|brocade|silk'},
'tidewake': {'tile-water-e': 'sea|wave|ocean|surf|storm|marine|coast|rapids|whirl|water', 'tile-water-f': 'sea|wave|ocean|surf|storm|marine|coast|rapids|whirl|water', 'tile-water-g': 'sea|wave|ocean|surf|storm|marine|coast|rapids|whirl|water', 'tile-water-h': 'sea|wave|ocean|surf|storm|marine|coast|rapids|whirl|water', 'table-harbor-noon': 'harbor|harbour|port|quay|dock|ship', 'table-harbor-noon-phone': 'harbor|harbour|port|quay|dock|ship', 'table-rift-night': 'night|moon|storm|wreck|sea', 'table-rift-night-phone': 'night|moon|storm|wreck|sea', 'event-leviathan': 'monster|whale|leviathan|serpent|kraken|sea|dragon', 'end-lose-b': 'wreck|sink|storm|distress|rocks|shipwreck', 'end-lose-c': 'wreck|sink|storm|distress|rocks|shipwreck', 'end-win-b': 'ship|fleet|harbor|sail|sunrise|sea', 'end-win-c': 'ship|fleet|harbor|sail|sunset|sea', 'start-plate': 'chart|map|nautical|portolan|compass|navigat', 'button-button-plate': 'rope|brass|anchor|compass|ship|nautical|bronze', 'gx-bar-plate': 'carved|wood|timber|panel|ship', 'gx-drawer-head-plate': 'carved|wood|timber|panel|figurehead', 'gxh-ok-button-plate': 'brass|bronze|porthole|dial|compass|ship'},
}

def main(slug):
    g = GR[slug]; out = os.path.join(OUT, slug); os.makedirs(out, exist_ok=True)
    rows = []; ok = 0
    for spec in SPEC[slug]:
        stem, size, kind, qs = spec[:4]; opt = spec[4] if len(spec) > 4 else {}
        stops = opt.get('stops', g['stops']); k = opt.get('k', g['k'])
        im, meta = fetch_img(qs, minside=900 if size[0] > 600 else 500, busy=(kind == 'scene' and size[0] >= 768 and not opt.get('object')), bad=opt.get('bad'), must=MUST.get(slug, {}).get(stem))
        if im is None:
            rows.append((stem, 'none', '', '', 'FALLBACK')); print('FAIL', stem); continue
        if opt.get('inv'): im = ImageOps.invert(ImageOps.autocontrast(im.convert('L')).convert('RGB')) if False else ImageOps.autocontrast(im.convert('L')).convert('RGB')
        f = lambda x: gradient_map(x, stops, k, g['sat'])
        if kind == 'plate':
            w0, h0 = im.size; im = im.crop((int(w0*.22), int(h0*.22), int(w0*.78), int(h0*.78))); t = grade(cover(im, size), f, 1.1)
            res = rounded_plate(t, size, g['rim'])
        else:
            res = vignette(grade(cover(im, size, 0.5, 0.45), f, 1.1), 0.35)
        save(res, os.path.join(out, stem + '.webp'), 80)
        rows.append((stem, f"{meta['title']} {('/ ' + meta['artist']) if meta['artist'] else ''}".strip(), 'CC0 (Met Open Access)', meta['url'], 'real')); ok += 1
        print('ok', stem, meta['title'][:40])
    return rows

if __name__ == '__main__':
    os.makedirs(CACHE, exist_ok=True)
    slug = sys.argv[1]
    rows = main(slug)
    json.dump(rows, open(os.path.join(CACHE, slug + '.rows.json'), 'w'))
