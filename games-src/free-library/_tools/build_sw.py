import sys, glob, json, re, os, colorsys
sys.path.insert(0, os.path.dirname(__file__))
from lib import *

SRC = '/home/user/spotify_to_ytmusic/games-src/stitchwise/free-art'
DST = OUT + '/stitchwise'
META = json.load(open(S + '/meta.json'))
roots = glob.glob(S + '/sw/*') + glob.glob('/tmp/claude-0/s/work/sw/met*')
P = load_pool(roots)
BADCLS = re.compile(r'Paintings|Drawings|Prints|Photograph|Sculpture|Books|Metalwork|Ceramics|Glass|Costume|Main dress|Furniture|Woodwork|Aerophone|Codices|Blocks|Tapestries')
rows = []


def info(it):
    m = META.get(it['url'].rsplit('/', 1)[-1], {})
    it['culture'] = m.get('culture', ''); it['dept'] = m.get('dept', ''); it['artist'] = m.get('artist', '')
    return it


def stems(p):
    return sorted(os.path.basename(f)[:-5] for f in glob.glob(SRC + '/' + p + '*.webp'))


def sizeof(st):
    return Image.open(f'{SRC}/{st}.webp').size


def emit(st, im, q=78):
    save(im, f'{DST}/{st}.webp', q)


def rec(st, it, flag, extra=''):
    if it is None:
        rows.append((st, 'generated' + extra, 'n/a (own work)', '-', 'FALLBACK'))
    else:
        rows.append((st, os.path.basename(os.path.dirname(it['path'])) + '/' + os.path.basename(it['path']) + ' | ' + it['title'][:60] + extra, it['lic'], it['url'], flag))


TEXDIRS = ['metquilt', 'metpattern', 'quilt', 'coverlet', 'textile', 'wallpaper', 'sampler', 'embroidery', 'Morris', 'kimono', 'damask', 'block_print', 'brocade', 'calico', 'needlework', 'tapestry', 'lace', 'patchwork', 'S_lace']
tex = []
seen = set()
for d in TEXDIRS:
    for it in P.get(d, []):
        if it['url'] in seen or BADCLS.search(it['cls'] or ''):
            continue
        seen.add(it['url']); tex.append(info(it))


def stat(it):
    im = Image.open(it['path']).convert('RGB')
    w, h = im.size
    c = im.crop((int(w * .25), int(h * .25), int(w * .75), int(h * .75))).resize((48, 48))
    a = np.asarray(c, dtype=np.float32)
    sd = a.std()
    mean = a.reshape(-1, 3).mean(0) / 255
    hh, ll, ss = colorsys.rgb_to_hls(*mean)
    return sd, hh, ll, ss


for it in tex:
    it['sd'], it['h'], it['l'], it['s'] = stat(it)

# fabrics: textured, spread by hue
fab = [it for it in tex if it['sd'] > 22 and not re.search(r'Portrait|Pope|Cardinal|Madonna|Lady|Landscape|Man |Woman|Jacket|Dress|Coat|Panel with figure|Bed|Chair|Table|Stand|Gown|Bodice|Stomacher|Shawl|Picture|scene', it['title'])]
fab.sort(key=lambda it: it['h'] + 0.0 * it['l'])
n = 34
step = max(1, len(fab) / n)
KEYS = ['calico/08.jpg', 'coverlet/10.jpg', 'calico/12.jpg', 'coverlet/12.jpg', 'metquilt/08.jpg', 'calico/01.jpg', 'embroidery/06.jpg', 'metquilt/10.jpg', 'metquilt/00.jpg', 'metpattern/06.jpg', 'coverlet/00.jpg', 'calico/11.jpg', 'calico/03.jpg', 'metquilt/03.jpg', 'metquilt/02.jpg', 'coverlet/07.jpg', 'metquilt/06.jpg', 'metquilt/04.jpg', 'metpattern/04.jpg', 'brocade/09.jpg', 'embroidery/00.jpg', 'metpattern/00.jpg', 'metpattern/05.jpg', 'metquilt/01.jpg', 'metpattern/12.jpg', 'damask/11.jpg', 'metquilt/05.jpg', 'coverlet/06.jpg', 'calico/00.jpg', 'coverlet/08.jpg', 'calico/10.jpg', 'calico/05.jpg', 'coverlet/11.jpg', 'calico/02.jpg']
BYK = {it['path'].split('/')[-2] + '/' + it['path'].split('/')[-1]: it for it in tex}
fab_pick = [BYK[k] for k in KEYS]
fab = fab_pick + fab
used = set(it['path'] for it in fab_pick)

fst = stems('fabric-')
for i, st in enumerate(fst):
    it = fab_pick[i % len(fab_pick)]
    im = Image.open(it['path']).convert('RGB')
    w, h = im.size
    side = int(min(w, h) * (0.45 if i < len(fab_pick) else 0.3))
    x0 = (w - side) // 2; y0 = (h - side) // 2
    c = im.crop((x0, y0, x0 + side, y0 + side)).resize((256, 256), Image.LANCZOS)
    emit(st, grade_sw(c)); rec(st, it, 'real')

# backgrounds 1080x1920: textiles with big size, darkened for table
big = sorted([it for it in tex if it['size'][0] * it['size'][1] > 600 * 600 and it['sd'] > 15], key=lambda it: -it['size'][0] * it['size'][1])


def bg_from(it, size, dark=1.0, zoom=0.8, cx=0.5):
    im = Image.open(it['path']).convert('RGB')
    w, h = im.size
    cw, ch = int(w * zoom), int(h * zoom)
    im = im.crop((int((w - cw) * cx), int((h - ch) * 0.5), int((w - cw) * cx) + cw, int((h - ch) * 0.5) + ch))
    out = cover(im, size, 0.5, 0.5)
    out = out.filter(ImageFilter.GaussianBlur(0.8))
    g = np.random.RandomState(1).normal(0, 4, (out.size[1], out.size[0], 1))
    out = Image.fromarray(np.clip(np.asarray(out, dtype=np.float32) + g, 0, 255).astype(np.uint8))
    out = vignette(grade_sw(out), 0.4)
    return ImageEnhance.Brightness(out).enhance(dark)


bgmap = {'bg-title': 5, 'bg-table': 14, 'bg-map': 10, 'result-win': 6, 'result-lose': 12}
for st in ['bg-title', 'bg-table', 'bg-map', 'result-win', 'result-lose']:
    it = big[bgmap[st] % len(big)]
    if st == 'bg-table': it = fab_pick[10]
    if st == 'bg-map': it = fab_pick[3]
    if st == 'result-lose': it = fab_pick[24]
    dark = {'bg-table': 0.5, 'result-lose': 0.7}.get(st, 1.0)
    emit(st, bg_from(it, sizeof(st), dark, min(0.92, 0.72 + 0.03 * (list(bgmap).index(st))), 0.5), 74); rec(st, it, 'real')

it = fab_pick[12]
emit('quilt-frame', bg_from(it, (900, 900), 1.0, 0.8)); rec('quilt-frame', it, 'real')
it = big[13]
emit('track-frame', bg_from(it, (1600, 400), 0.9, 0.6)); rec('track-frame', it, 'real')

# portraits
pdirs = [d for d in P if d.startswith('p_')] + ['woman_portrait', 'portrait_woman', 'tailor', 'milliner', 'girl_sewing', 'spinning_wheel']
BYKALL = {it['path'].split('/')[-2] + '/' + it['path'].split('/')[-1]: info(it) for v in P.values() for it in v}
ports = [BYKALL[k] for k in ['p_knitting/02.jpg', 'p_knitting/03.jpg', 'p_lacemaker/00.jpg', 'p_spinner/02.jpg', 'p_woman_sewing/05.jpg', 'p_woman_sewing/03.jpg', 'p_woman_sewing/02.jpg', 'p_woman_sewing/11.jpg', 'p_embroiderer/00.jpg', 'p_knitting/01.jpg', 'p_seamstress/01.jpg'] if k in BYKALL]
for i, st in enumerate(stems('portrait-')):
    if not ports:
        rec(st, None, 'FALLBACK'); continue
    it = ports[i % len(ports)]
    im = Image.open(it['path']).convert('RGB')
    emit(st, ImageEnhance.Brightness(vignette(grade_sw(cover(im, (512, 512), 0.5, 0.15)), 0.3)).enhance(1.15)); rec(st, it, 'real')


def pickcut(dirs):
    for d in [x for dd in dirs for x in (dd, 'S_' + dd)]:
        for it in P.get(d, []):
            if it['path'] in used or BADCLS.search('') or (it['cls'] or '').startswith('Paintings'):
                continue
            im = Image.open(it['path'])
            s, _ = border_score(im)
            if s > 24:
                continue
            c = cutout(im)
            if c is not None:
                used.add(it['path']); return it, c
    return None, None


def explicit(d, i):
    its = [x for x in P.get(d, [])]
    it = its[i]
    return it, cutout(Image.open(it['path']))


for st, (d, i, flag) in {'token-me': ('S_spool', 1, 'real'), 'token-opp': ('S_spool', 2, 'real'), 'icon-button': ('S_spool', 7, 'FALLBACK'),
                         'icon-hourglass': ('S_hourglass', 0, 'real'), 'icon-bonus': ('S_thimble', 2, 'FALLBACK'), 'bonus-tile': ('S_spool', 7, 'FALLBACK')}.items():
    sz = sizeof(st)
    it, c = explicit(d, i)
    if c is None:
        rec(st, None, 'FALLBACK'); continue
    emit(st, grade_sw(contain_rgba(c, sz, 0.08))); rec(st, it, flag, ' (approximate stand-in)' if flag == 'FALLBACK' else '')

# leather: procedural (no honest free leather photo found in pool)
rng_ = np.random.RandomState(11)
def leather(n):
    base = np.zeros((n, n, 3), np.float32) + np.array([122, 78, 46], np.float32)
    nz = rng_.normal(0, 14, (n // 3 + 1, n // 3 + 1))
    nz = np.asarray(Image.fromarray(np.clip(nz + 128, 0, 255).astype(np.uint8)).resize((n, n), Image.BICUBIC), dtype=np.float32) - 128
    fine = rng_.normal(0, 6, (n, n))
    arr = base + (nz + fine)[..., None]
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
lc = grade_sw(leather(128)); emit('icon-leather', lc); rec('icon-leather', None, 'FALLBACK', ' (procedural leather)')
pl = grade_sw(leather(256)).convert('RGBA')
m = Image.new('L', (256, 256), 0); ImageDraw.Draw(m).rounded_rectangle((8, 8, 247, 247), 18, fill=255)
d = ImageDraw.Draw(pl)
for x in range(26, 232, 14):
    d.line((x, 22, x + 8, 22), fill=(240, 226, 196, 255), width=3); d.line((x, 233, x + 8, 233), fill=(240, 226, 196, 255), width=3)
    d.line((22, x, 22, x + 8), fill=(240, 226, 196, 255), width=3); d.line((233, x, 233, x + 8), fill=(240, 226, 196, 255), width=3)
pl.putalpha(m); emit('patch-leather', pl); rec('patch-leather', None, 'FALLBACK', ' (procedural leather)')

# torn-square from a fabric
src = fab_pick[3]
c = Image.open(src['path']).convert('RGB'); w, h = c.size; s_ = int(min(w, h) * .4)
c = grade_sw(c.crop(((w - s_) // 2, (h - s_) // 2, (w + s_) // 2, (h + s_) // 2)).resize((256, 256), Image.LANCZOS)).convert('RGBA')
rng = np.random.RandomState(5)
m = Image.new('L', (256, 256), 255); dm = ImageDraw.Draw(m)
ang = np.linspace(0, 2 * np.pi, 28, endpoint=False)
pts = [(128 + (44 + rng.randint(-14, 14)) * np.cos(a), 128 + (40 + rng.randint(-14, 14)) * np.sin(a)) for a in ang]
dm.polygon(pts, fill=0)
em = Image.new('L', (256, 256), 0); ImageDraw.Draw(em).rectangle((4, 4, 251, 251), fill=255)
edge = em.filter(ImageFilter.GaussianBlur(1))
c.putalpha(ImageChops.multiply(m.filter(ImageFilter.GaussianBlur(0.8)), edge))
emit('torn-square', c); rec('torn-square', src, 'real', ' + generated torn hole mask')

# ui-offer-card: pale fabric tag
src = fab_pick[8]
im = Image.open(src['path']).convert('RGB'); w, h = im.size; s_ = int(min(w, h) * .5)
t = grade_sw(cover(im.crop(((w - s_) // 2, (h - s_) // 2, (w + s_) // 2, (h + s_) // 2)), (400, 320)))
t = ImageEnhance.Brightness(ImageEnhance.Color(t).enhance(0.5)).enhance(1.15).convert('RGBA')
d = ImageDraw.Draw(t)
d.rounded_rectangle((14, 14, 385, 305), 14, outline=(150, 110, 90), width=2)
for x in range(26, 380, 16):
    d.line((x, 22, x + 8, 22), fill=(150, 110, 90), width=2); d.line((x, 297, x + 8, 297), fill=(150, 110, 90), width=2)
d.ellipse((190, 28, 210, 48), fill=(60, 50, 40, 255))
m = Image.new('L', (400, 320), 0); ImageDraw.Draw(m).rounded_rectangle((2, 2, 397, 317), 22, fill=255)
t.putalpha(m); emit('ui-offer-card', t); rec('ui-offer-card', src, 'real', ' + drawn stitch border')

# fx fallbacks
sp = Image.new('RGBA', (256, 256), (0, 0, 0, 0)); d = ImageDraw.Draw(sp)
d.polygon([(128, 20), (146, 110), (236, 128), (146, 146), (128, 236), (110, 146), (20, 128), (110, 110)], fill=(238, 200, 96, 255))
sp = sp.filter(ImageFilter.GaussianBlur(0.8)); emit('fx-sparkle', sp); rec('fx-sparkle', None, 'FALLBACK')
sti = Image.new('RGBA', (256, 256), (0, 0, 0, 0)); d = ImageDraw.Draw(sti)
for i in range(7):
    x = 30 + i * 30; y = 150 - int(60 * np.sin(i / 6 * np.pi))
    d.line((x, y, x + 18, y - 6), fill=(244, 232, 206, 255), width=7)
emit('fx-stitch', sti); rec('fx-stitch', None, 'FALLBACK')

os.makedirs(DST, exist_ok=True)
with open(DST + '/_MAP.tsv', 'w') as f:
    f.write('stem\tsource_file\tlicence\tsource_url\tflag\n')
    for r in sorted(rows):
        f.write('\t'.join(r) + '\n')
allst = {os.path.basename(x)[:-5] for x in glob.glob(SRC + '/*.webp')}
print('missing', sorted(allst - {r[0] for r in rows}))
print('real', sum(1 for r in rows if r[4] == 'real'), 'fallback', sum(1 for r in rows if r[4] == 'FALLBACK'))
cred = {}
for r in rows:
    if r[2].startswith('n/a'):
        continue
    cred.setdefault(r[3], r[1].split(' | ')[-1].split(' + ')[0] + ' | ' + r[2])
with open(DST + '/_CREDITS.md', 'w') as f:
    f.write('# Stitchwise temporary free library: credits\n\nAll sources are CC0 / public domain (Met Open Access). No AI-generated, NC, ND or SA material. One colour grade (warm cream, slightly desaturated) applied by this library.\n\n')
    f.write('- The Metropolitan Museum of Art, Open Access (CC0), via the keyless collection API; each object page is listed below and in _MAP.tsv.\n\n## Per object\n\n')
    for u, t in sorted(cred.items(), key=lambda x: x[1]):
        f.write(f'- {t} | {u}\n')
