"""Build free-library for short-fuse, sunglaze, thornbound, tidewake from Met Open Access (CC0) objects.
Usage: python3 build_w410b.py SLUG"""
import sys, os, json, urllib.request, urllib.parse, time, hashlib
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
    r = get(API.replace('v1/', 'v1.1/') + 'search?hasImages=true&isPublicDomain=true&limit=40&q=' + urllib.parse.quote(q))
    return (r or {}).get('objectIDs') or []

USED = set()
def fetch_img(queries, minside=900, skip=0, aspect=None):
    k = 0
    for q in queries:
        for oid in search(q)[:40]:
            if oid in USED: continue
            o = get(API + 'objects/%d' % oid)
            if not o or not o.get('isPublicDomain') or not o.get('primaryImage'): continue
            if o.get('classification', '') and any(b in o['classification'] for b in ('Photograph',)): pass
            d = get(o['primaryImage'].replace('original', 'web-large'), True) or get(o['primaryImage'], True)
            if not d: continue
            try:
                import io; im = Image.open(io.BytesIO(d)); im.load()
            except Exception: continue
            if max(im.size) < minside: continue
            if aspect:
                a = im.size[0] / im.size[1]
                if not (aspect[0] <= a <= aspect[1]): continue
            if k < skip: k += 1; continue
            USED.add(oid)
            return im.convert('RGB'), dict(title=(o.get('title') or '')[:80], url=o.get('objectURL'), artist=o.get('artistDisplayName') or '', q=q)
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
 ('table-clock-tower', (1920, 1080), 'scene', ['clock tower', 'town clock tower view']),
 ('table-clock-tower-phone', (1080, 1920), 'scene', ['clock tower street', 'bell tower']),
 ('table-blueprint', (1920, 1080), 'scene', ['mechanical drawing machine plan', 'design for a machine'], dict(stops=BLUE, k=.9, inv=True)),
 ('table-blueprint-phone', (1080, 1920), 'scene', ['architectural plan drawing', 'engineering plan'], dict(stops=BLUE, k=.9, inv=True)),
 ('event-boom', (1024, 768), 'scene', ['explosion fire smoke', 'gunpowder explosion']),
 ('event-defused', (1024, 768), 'scene', ['watch movement clockwork', 'clockwork']),
 ('end-lose-b', (1024, 768), 'scene', ['burning city fire', 'ruins after fire']),
 ('end-lose-c', (1024, 768), 'scene', ['smoke ruins battlefield', 'fire at night']),
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
 ('tile-gloss-b', (256, 256), 'scene', ['glazed ceramic tile', 'Iznik tile']),
 ('tile-gloss-c', (256, 256), 'scene', ['lustre tile', 'tile panel Persian']),
 ('table-kiln-hall', (1920, 1080), 'scene', ['potter workshop kiln', 'pottery kiln']),
 ('table-kiln-hall-phone', (1080, 1920), 'scene', ['potters at work', 'kiln furnace']),
 ('table-moon-courtyard', (1920, 1080), 'scene', ['Alhambra courtyard', 'courtyard moonlight']),
 ('table-moon-courtyard-phone', (1080, 1920), 'scene', ['moonlit garden architecture', 'mosque courtyard']),
 ('back-black-kiln', (768, 1024), 'scene', ['black glazed vessel', 'black pottery']),
 ('end-lose-b', (1024, 768), 'scene', ['broken pottery shards', 'ruins sunset']),
 ('end-lose-c', (1024, 768), 'scene', ['cracked tiles wall', 'ruined palace']),
 ('end-win-b', (1024, 768), 'scene', ['tiled palace hall', 'Persian tile panel']),
 ('end-win-c', (1024, 768), 'scene', ['sun rays palace', 'golden dome interior']),
 ('btn-sm-button-plate', (512, 512), 'plate', ['glazed tile blue', 'turquoise tile']),
],
'thornbound': [
 ('board-plate', (1024, 1024), 'scene', ['map of a kingdom', 'old map region']),
 ('tkey-picture', (1024, 1024), 'scene', ['throne', 'royal throne room']),
 ('table-ossuary', (1920, 1080), 'scene', ['ossuary skulls', 'catacomb crypt']),
 ('table-ossuary-phone', (1080, 1920), 'scene', ['crypt interior', 'vaulted crypt']),
 ('table-sinks-masquerade', (1920, 1080), 'scene', ['masquerade ball', 'carnival masks Venice']),
 ('table-sinks-masquerade-phone', (1080, 1920), 'scene', ['ball masked dancers', 'masks festival']),
 ('event-coronation', (1024, 768), 'scene', ['coronation ceremony', 'crowning of a king']),
 ('event-uprising', (1024, 768), 'scene', ['peasants revolt', 'rebellion crowd']),
 ('back-moth-ossuary', (768, 1024), 'scene', ['moth', 'moth insect plate']),
 ('end-lose-b', (1024, 768), 'scene', ['castle ruins storm', 'burning castle']),
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
 ('tile-water-g', (512, 512), 'scene', ['wave foam', 'seascape calm']),
 ('tile-water-h', (512, 512), 'scene', ['sea whirlpool', 'maelstrom']),
 ('table-harbor-noon', (1920, 1080), 'scene', ['harbor ships noon', 'harbor view ships']),
 ('table-harbor-noon-phone', (1080, 1920), 'scene', ['port with ships', 'sailing ships harbour']),
 ('table-rift-night', (1920, 1080), 'scene', ['ship storm at night', 'moonlit sea ship']),
 ('table-rift-night-phone', (1080, 1920), 'scene', ['shipwreck storm', 'sea storm moonlight']),
 ('event-leviathan', (1024, 768), 'scene', ['sea monster', 'whale sea monster print']),
 ('end-lose-b', (1024, 768), 'scene', ['shipwreck', 'ship sinking']),
 ('end-lose-c', (1024, 768), 'scene', ['wreck storm rocks', 'ship in distress']),
 ('end-win-b', (1024, 768), 'scene', ['ships at sunrise sea', 'fleet at sea']),
 ('end-win-c', (1024, 768), 'scene', ['harbor return ship', 'ships in port sunset']),
 ('start-plate', (1024, 1024), 'scene', ['nautical chart', 'sea chart map']),
 ('button-button-plate', (512, 512), 'plate', ['ship rope knot brass', 'brass compass']),
 ('gx-bar-plate', (1024, 512), 'plate', ['old ship timber carved', 'carved wood ship']),
 ('gx-drawer-head-plate', (1024, 512), 'plate', ['ship figurehead carved', 'carved wood panel']),
 ('gxh-ok-button-plate', (512, 512), 'plate', ['bronze porthole', 'brass dial']),
],
}

def main(slug):
    g = GR[slug]; out = os.path.join(OUT, slug); os.makedirs(out, exist_ok=True)
    rows = []; ok = 0
    for spec in SPEC[slug]:
        stem, size, kind, qs = spec[:4]; opt = spec[4] if len(spec) > 4 else {}
        stops = opt.get('stops', g['stops']); k = opt.get('k', g['k'])
        im, meta = fetch_img(qs, minside=900 if size[0] > 600 else 500)
        if im is None:
            rows.append((stem, 'none', '', '', 'FALLBACK')); print('FAIL', stem); continue
        if opt.get('inv'): im = ImageOps.invert(ImageOps.autocontrast(im.convert('L')).convert('RGB')) if False else ImageOps.autocontrast(im.convert('L')).convert('RGB')
        f = lambda x: gradient_map(x, stops, k, g['sat'])
        if kind == 'plate':
            t = grade(cover(im, size), f, 1.1)
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
