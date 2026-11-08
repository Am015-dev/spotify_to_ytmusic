#!/usr/bin/env python3
"""vg3.py - Vinegrave vintage-expedition art pipeline (public-domain sources only).

Usage:  python3 -I vg3.py [--only stem,stem] [--offline] [--out DIR]
Fetches every source in MANIFEST (Met Open Access CC0, Wikimedia Commons PD, loc.gov PD), caches downloads in SRC,
grades everything to ONE sepia-and-jungle palette, composes each slot at its exact size and writes webp.
Slots without a manifest entry keep their previous file (listed at the end).  No text is ever drawn into pictures.
"""
import os, sys, io, json, math, time, hashlib, urllib.request, urllib.parse, random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageChops, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
import tempfile
SRC = os.environ.get('VG_SRC', os.path.join(tempfile.gettempdir(), 'vinegrave-art-src'))
UA = 'vinegrave-art-builder/1.0'
os.makedirs(SRC, exist_ok=True)

# ---------------------------------------------------------------- palette
PARCH = (0xef, 0xe2, 0xc0); SEPIA = (0x8a, 0x5a, 0x2b); JUNGLE = (0x1f, 0x3a, 0x2a)
JADE = (0x3f, 0xa0, 0x7a); GOLD = (0xd9, 0xa4, 0x41); INK = (0x1a, 0x14, 0x0c); CREAM = (0xf3, 0xe9, 0xca)

def lut(stops):
    """stops: [(pos 0..1, rgb)] -> (256,3) uint8"""
    out = np.zeros((256, 3), np.float32)
    xs = [s[0] for s in stops]
    for c in range(3):
        out[:, c] = np.interp(np.linspace(0, 1, 256), xs, [s[1][c] for s in stops])
    return out
TRITONE = lut([(0, (0x2a, 0x1f, 0x14)), (0.2, (0x33, 0x4d, 0x3a)), (0.55, (0x9a, 0x66, 0x30)), (0.86, (0xe0, 0xcc, 0x9c)), (1, PARCH)])   # lifted black point

def net(url, cache_name=None, tries=4):
    key = cache_name or hashlib.md5(url.encode()).hexdigest() + os.path.splitext(urllib.parse.urlparse(url).path)[1][:5]
    p = os.path.join(SRC, key)
    if os.path.exists(p) and os.path.getsize(p) > 500:
        return p
    url = urllib.parse.quote(url, safe=':/?&=%@+,;~')
    wiki = 'wikimedia.org' in url
    if wiki: tries = max(tries, 7)
    for i in range(tries):
        try:
            if wiki: time.sleep(2.5)       # be polite to Wikimedia
            b = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=60).read()
            open(p, 'wb').write(b); return p
        except Exception as e:
            time.sleep((12 if wiki else 2) * (i + 1))
    raise RuntimeError('fetch failed ' + url)

def load(url):
    return Image.open(net(url)).convert('RGB')

# ---------------------------------------------------------------- grading
def lum(a):
    return a[..., 0] * .299 + a[..., 1] * .587 + a[..., 2] * .114

def autolevel(l, lo=1.5, hi=98.5, gamma=1.0):
    a, b = np.percentile(l, lo), np.percentile(l, hi)
    l = np.clip((l - a) / max(b - a, 1), 0, 1)
    return l ** gamma

def grade(im, keep=0.22, gamma=1.0, contrast=1.0, lo=1.5, hi=98.5, jade=0.0):
    """Tritone map of luminance + a little of the original colour. im RGB PIL -> RGB PIL."""
    a = np.asarray(im.convert('RGB'), np.float32)
    l = autolevel(lum(a), lo, hi, gamma * .9)      # lift mids a little so cards read at 118 px
    contrast *= 1.12
    if contrast != 1.0:
        l = np.clip((l - .5) * contrast + .5, 0, 1)
    t = TRITONE[(l * 255).astype(np.uint8)]
    # original colour, desaturated to ~55% so it only tints
    g = lum(a)[..., None]
    col = g + (a - g) * .55
    out = t * (1 - keep) + col * keep * (0.5 + l[..., None])
    if jade:
        sh = np.clip(1 - l * 2.2, 0, 1)[..., None]
        out = out * (1 - jade * sh) + np.array(JADE, np.float32) * jade * sh * .6 + out * jade * sh * .4
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))

def grain(im, amt=7, seed=1):
    rs = np.random.RandomState(seed)
    a = np.asarray(im.convert('RGB'), np.float32)
    n = rs.normal(0, 1, a.shape[:2]).astype(np.float32)
    n = np.asarray(Image.fromarray(((n * 40) + 128).clip(0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(.7)), np.float32) - 128
    fib = rs.normal(0, 1, a.shape[:2]).astype(np.float32)
    fib = np.asarray(Image.fromarray(((fib * 40) + 128).clip(0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2.2)), np.float32) - 128
    a += (n * .12 + fib * .35)[..., None] * amt / 7 * 3
    return Image.fromarray(a.clip(0, 255).astype(np.uint8))

def vignette(im, strength=.42, power=2.2):
    strength *= .5      # half-strength vignette (phone readability)
    w, h = im.size
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    d = np.sqrt(((x - w / 2) / (w / 2)) ** 2 + ((y - h / 2) / (h / 2)) ** 2) / 1.2
    m = 1 - strength * np.clip(d, 0, 1.3) ** power
    a = np.asarray(im.convert('RGB'), np.float32)
    dark = np.array(INK, np.float32)
    a = a * m[..., None] + dark * (1 - m[..., None]) * .5
    return Image.fromarray(a.clip(0, 255).astype(np.uint8))

def noise_tex(w, h, seed, scales=((64, .5), (16, .3), (4, .2))):
    rs = np.random.RandomState(seed)
    acc = np.zeros((h, w), np.float32)
    for s, wt in scales:
        n = rs.rand(max(2, h // s + 2), max(2, w // s + 2)).astype(np.float32)
        im = Image.fromarray((n * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)
        acc += np.asarray(im, np.float32) / 255 * wt
    return acc / sum(w_ for _, w_ in scales)

def cover(im, size, focus=(.5, .5), zoom=1.0):
    """Crop-to-fill with focus point (fractions) and zoom>=1."""
    W, H = size
    iw, ih = im.size
    s = max(W / iw, H / ih) * zoom
    nw, nh = int(iw * s + .5), int(ih * s + .5)
    im2 = im.resize((nw, nh), Image.LANCZOS)
    x0 = int(min(max(focus[0] * nw - W / 2, 0), nw - W)); y0 = int(min(max(focus[1] * nh - H / 2, 0), nh - H))
    return im2.crop((x0, y0, x0 + W, y0 + H))

def print_border(im, margin=None, line=2, inner=3):
    """cream margin + dark ink line + thin inner cream hairline: reads as a printed plate."""
    w, h = im.size
    m = margin if margin is not None else max(5, round(min(w, h) * .022))
    out = im.copy(); d = ImageDraw.Draw(out)
    d.rectangle([0, 0, w - 1, m - 1], fill=CREAM); d.rectangle([0, h - m, w - 1, h - 1], fill=CREAM)
    d.rectangle([0, 0, m - 1, h - 1], fill=CREAM); d.rectangle([w - m, 0, w - 1, h - 1], fill=CREAM)
    d.rectangle([m, m, w - m - 1, h - m - 1], outline=INK, width=line)
    k = m + line + inner
    d.rectangle([k, k, w - k - 1, h - k - 1], outline=tuple(int(.6 * c + .4 * s) for c, s in zip(CREAM, SEPIA)), width=1)
    return out

def finish(im, border=True, vig=.4, g=7, seed=1, **kw):
    im = vignette(im, vig)
    im = grain(im, g, seed)
    return print_border(im, **kw) if border else im

# ---------------------------------------------------------------- cut-out + backdrops
def cutout(im, edge=5.0, soften=1.3, max_side=700, close=2, median=5):
    """Remove seamless grey/white museum background -> RGBA.
    Smooth (low-gradient) regions connected to the picture edge are background; the object's outline is an
    edge ring that stops the flood.  Then median + erode + blur for a soft, clean rim."""
    s = min(1, max_side / max(im.size))
    sm = im.resize((int(im.width * s), int(im.height * s)), Image.LANCZOS) if s < 1 else im.copy()
    w, h = sm.size
    g = np.asarray(sm.convert('L').filter(ImageFilter.GaussianBlur(1.2)), np.float32)
    gx = np.abs(np.diff(g, axis=1, prepend=g[:, :1])); gy = np.abs(np.diff(g, axis=0, prepend=g[:1]))
    mag = np.maximum(gx, gy)
    wall = Image.fromarray(((mag > edge) * 255).astype(np.uint8))
    for _ in range(close): wall = wall.filter(ImageFilter.MaxFilter(3))
    m = Image.fromarray((255 - np.asarray(wall)).astype(np.uint8)).copy()   # 255 = smooth candidate
    pts = [(x, y) for x in range(0, w, max(1, w // 16)) for y in (0, h - 1)] + [(x, y) for y in range(0, h, max(1, h // 16)) for x in (0, w - 1)]
    for p in pts:
        if m.getpixel(p) == 255:
            ImageDraw.floodfill(m, p, 128)
    mm = np.asarray(m)
    alpha = Image.fromarray(np.where(mm == 128, 0, 255).astype(np.uint8))
    for _ in range(close + 1): alpha = alpha.filter(ImageFilter.MinFilter(3))   # undo wall dilation + trim halo
    alpha = (alpha.filter(ImageFilter.MedianFilter(median)) if median else alpha)
    if median >= 5:   # opening: drop specks and 1-3 px stand/shadow lines
        opened = alpha.filter(ImageFilter.MinFilter(5)).filter(ImageFilter.MaxFilter(5))
        if np.asarray(opened, np.float32).sum() >= .93 * np.asarray(alpha, np.float32).sum():   # never eat thin objects
            alpha = opened
    alpha = alpha.filter(ImageFilter.GaussianBlur(soften))
    out = sm.convert('RGBA'); out.putalpha(alpha)
    return out

def cutout_auto(im):
    """try several edge settings until a plausible silhouette (6-90 % of the frame kept)"""
    best = None
    for kw in (dict(), dict(edge=8.0, close=1), dict(edge=3.0, close=1, median=3), dict(edge=12.0, close=1, median=3), dict(edge=18.0, close=1, median=3), dict(edge=26.0, close=1, median=3), dict(edge=2.0, close=0, median=0)):
        ob = cutout(im, **kw)
        keep = 1 - float((np.asarray(ob.getchannel('A')) < 20).mean())
        if .02 < keep < .92:
            return ob
        best = best or ob
    return best

def parchment(size, seed=3):
    w, h = size
    n = noise_tex(w, h, seed)
    n2 = noise_tex(w, h, seed + 9, ((128, .6), (32, .4)))
    base = np.zeros((h, w, 3), np.float32)
    lo = np.array((0xcf, 0xb5, 0x82), np.float32); hi = np.array((0xef, 0xe2, 0xc0), np.float32); st = np.array((0xa5, 0x7a, 0x45), np.float32)
    base[:] = lo + (hi - lo) * n[..., None]
    base = base * (1 - .35 * np.clip(n2 - .55, 0, 1)[..., None] * 2) + st * .35 * np.clip(n2 - .55, 0, 1)[..., None] * 2
    # soft light from top-left + darker edges (aged)
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    d = np.sqrt(((x - w * .45) / w) ** 2 + ((y - h * .4) / h) ** 2)
    base *= (1.08 - .5 * d)[..., None]
    return Image.fromarray(base.clip(0, 255).astype(np.uint8))

def jungle_stone(size, seed=5):
    w, h = size
    n = noise_tex(w, h, seed, ((48, .45), (12, .35), (3, .2)))
    base = np.zeros((h, w, 3), np.float32)
    lo = np.array((0x1a, 0x30, 0x23), np.float32); hi = np.array((0x48, 0x6a, 0x4e), np.float32)
    base[:] = lo + (hi - lo) * n[..., None]
    # block lines (weathered masonry)
    im = Image.fromarray(base.astype(np.uint8)); d = ImageDraw.Draw(im, 'RGBA')
    rs = random.Random(seed); bh = max(24, h // 7)
    for r in range(0, h, bh):
        d.line([(0, r), (w, r)], fill=(8, 14, 10, 150), width=2)
        off = rs.randint(0, bh * 2)
        for x in range(-off, w, bh * 2):
            d.line([(x, r), (x, r + bh)], fill=(8, 14, 10, 130), width=2)
    base = np.asarray(im, np.float32)
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    g = np.exp(-(((x - w * .5) / (w * .42)) ** 2 + ((y - h * .52) / (h * .5)) ** 2))
    glow = np.array((0xd9, 0x9a, 0x3c), np.float32)
    base = base + glow * (g * .42)[..., None]
    return Image.fromarray(base.clip(0, 255).astype(np.uint8))

def place_object(obj, size, back, fill=.80, shadow=.55, grade_kw=None, dy=0.0, rot=0):
    """obj RGBA cut-out -> graded & set on backdrop, filling `fill` of the frame (fit by the larger ratio)."""
    W, H = size
    bb = obj.getchannel('A').point(lambda v: 255 if v > 40 else 0).getbbox()
    if bb: obj = obj.crop(bb)
    gk = dict(keep=.3, gamma=.95, contrast=1.1); gk.update(grade_kw or {})
    rgb = grade(obj.convert('RGB'), **gk)
    obj = Image.merge('RGBA', (*rgb.split(), obj.getchannel('A')))
    if rot: obj = obj.rotate(rot, expand=True, resample=Image.BICUBIC)
    s = min(W * fill / obj.width, H * fill / obj.height)
    obj = obj.resize((max(1, int(obj.width * s)), max(1, int(obj.height * s))), Image.LANCZOS)
    cv = back.copy().convert('RGBA')
    x = (W - obj.width) // 2; y = int((H - obj.height) / 2 + dy * H)
    sh = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    m = Image.new('L', (W, H), 0); m.paste(obj.getchannel('A'), (x + 5, y + 8))
    m = m.filter(ImageFilter.GaussianBlur(7)).point(lambda v: int(v * shadow))
    sh.putalpha(m); cv = Image.alpha_composite(Image.merge('RGBA', (Image.new('L', (W, H), 20), Image.new('L', (W, H), 14), Image.new('L', (W, H), 8), m)) if False else cv, Image.merge('RGBA', (Image.new('L', (W, H), 20), Image.new('L', (W, H), 14), Image.new('L', (W, H), 8), m)))
    cv.alpha_composite(obj, (x, y))
    return cv.convert('RGB')

def save(im, path, q=82, maxkb=None):
    for qq in (q, 76, 70, 62, 55, 48, 40):
        im.save(path, 'WEBP', quality=qq, method=6)
        if maxkb is None or os.path.getsize(path) <= maxkb * 1024:
            break

# ---------------------------------------------------------------- source resolvers
_met_cache = {}
def met_img(oid, big=False, idx=None):
    p = os.path.join(SRC, 'met_%s.json' % oid)
    if not os.path.exists(p):
        net('https://collectionapi.metmuseum.org/public/collection/v1/objects/%s' % oid, 'met_%s.json' % oid)
    o = json.load(open(p))
    assert o.get('isPublicDomain'), 'not PD: %s' % oid
    url = o['primaryImage'] if big and o.get('primaryImage') else o['primaryImageSmall']
    if idx is not None and o.get('additionalImages'):
        url = o['additionalImages'][idx]
    return load(url), o

def commons_img(title, width=1400):
    """Wikimedia Commons file -> thumb URL (checks licence via extmetadata; only PD / CC0 accepted)."""
    key = 'wc_' + hashlib.md5(title.encode()).hexdigest()
    jp = os.path.join(SRC, key + '.json')
    if not os.path.exists(jp):
        u = ('https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=%d&titles=%s'
             % (width, urllib.parse.quote(title)))
        net(u, key + '.json')
        time.sleep(1.2)
    d = json.load(open(jp))
    pg = list(d['query']['pages'].values())[0]; ii = pg['imageinfo'][0]
    lic = ii['extmetadata'].get('LicenseShortName', {}).get('value', '')
    assert any(k in lic.lower() for k in ('public domain', 'pd', 'cc0')), 'licence %s for %s' % (lic, title)
    return load(ii['thumburl']), dict(title=title, creator=ii['extmetadata'].get('Artist', {}).get('value', ''), lic=lic, page=ii['descriptionurl'])

def aic_img(aid, width=843):
    jp = os.path.join(SRC, 'aic_%s.json' % aid)
    if not os.path.exists(jp):
        net('https://api.artic.edu/api/v1/artworks/%s?fields=id,title,artist_title,image_id,is_public_domain' % aid, 'aic_%s.json' % aid)
    d = json.load(open(jp))['data']
    assert d.get('is_public_domain'), 'not PD (AIC %s)' % aid
    url = 'https://www.artic.edu/iiif/2/%s/full/%d,/0/default.jpg' % (d['image_id'], width)
    return load(url), dict(title=d['title'], creator=d.get('artist_title') or 'unknown maker', lic='CC0', page='https://www.artic.edu/artworks/%s' % aid)

def loc_img(path, title, creator='unknown photographer'):
    """path like 'ggbain/13100/13186r.jpg' (or 'cph/3b00000/.../3b01439r.jpg'); Library of Congress, no known restrictions / PD."""
    return load('https://tile.loc.gov/storage-services/service/pnp/' + path), dict(
        title=title, creator=creator, lic='Public domain', page='https://www.loc.gov/pictures/search/?q=' + urllib.parse.quote(title))

def get_source(spec):
    """spec: ('met', id[, opts]) | ('aic', id) | ('loc', path, title) | ('wc', 'File:...') -> (PIL, info dict)"""
    k = spec[0]
    opts = spec[2] if len(spec) > 2 and isinstance(spec[2], dict) else {}
    if k == 'met':
        im, o = met_img(spec[1], **{x: opts[x] for x in ('big', 'idx') if x in opts})
        who = o.get('artistDisplayName') or o.get('culture') or o.get('department')
        return im, dict(title=o['title'], creator=who, lic='CC0', page=o['objectURL'])
    if k == 'aic':
        return aic_img(spec[1])
    if k == 'loc':
        return loc_img(spec[1], spec[2])
    if k == 'url':   # ('url', image_url, title, creator, page)
        return load(spec[1]), dict(title=spec[2], creator=spec[3], lic='Public domain', page=spec[4])
    if k == 'wc':
        return commons_img(spec[1])
    raise ValueError(k)


# ---------------------------------------------------------------- printed card frames (procedural, same layout as before)
WIN = (22, 22, 277, 397)   # transparent window x0,y0,x1,y1 inclusive (as the code-side layout expects)

def _tex(w, h, base, var, seed):
    n = noise_tex(w, h, seed, ((40, .4), (9, .35), (2, .25)))
    a = np.zeros((h, w, 3), np.float32); a[:] = np.array(base, np.float32) + (n[..., None] - .5) * var
    return Image.fromarray(a.clip(0, 255).astype(np.uint8))

def frame(kind):
    S = 3; W, H = 300 * S, 420 * S
    cfg = dict(item=dict(base=(0x7a, 0x52, 0x2c), var=70, line=(0xd9, 0xa4, 0x41), inner=(0x3a, 0x26, 0x14), seed=11),
               art=dict(base=(0x24, 0x40, 0x31), var=60, line=(0xd9, 0xa4, 0x41), inner=(0x0e, 0x1d, 0x15), seed=12),
               fear=dict(base=(0x1b, 0x16, 0x10), var=40, line=(0x3f, 0xa0, 0x7a), inner=(0x08, 0x0a, 0x08), seed=13))[kind]
    im = _tex(W, H, cfg['base'], cfg['var'], cfg['seed']).convert('RGBA')
    d = ImageDraw.Draw(im)
    x0, y0, x1, y1 = [v * S for v in WIN]; x1 += S; y1 += S
    L = cfg['line']
    d.rectangle([0, 0, W - 1, H - 1], outline=cfg['inner'], width=3 * S)
    d.rectangle([4 * S, 4 * S, W - 4 * S - 1, H - 4 * S - 1], outline=L, width=2 * S)
    d.rectangle([8 * S, 8 * S, W - 8 * S - 1, H - 8 * S - 1], outline=cfg['inner'], width=S)
    d.rounded_rectangle([x0 - 4 * S, y0 - 4 * S, x1 + 4 * S - 1, y1 + 4 * S - 1], radius=16 * S, outline=L, width=2 * S)
    d.rounded_rectangle([x0 - 7 * S, y0 - 7 * S, x1 + 7 * S - 1, y1 + 7 * S - 1], radius=19 * S, outline=cfg['inner'], width=2 * S)
    for cx, cy in [(11, 11), (289, 11), (11, 409), (289, 409)]:
        cx *= S; cy *= S
        if kind == 'item':   # brass rivets
            d.ellipse([cx - 6 * S, cy - 6 * S, cx + 6 * S, cy + 6 * S], fill=L, outline=cfg['inner'], width=S)
            d.ellipse([cx - 2 * S, cy - 2 * S, cx + 2 * S, cy + 2 * S], fill=cfg['inner'])
        elif kind == 'art':  # gold lozenges
            d.polygon([(cx, cy - 8 * S), (cx + 8 * S, cy), (cx, cy + 8 * S), (cx - 8 * S, cy)], fill=L, outline=cfg['inner'])
            d.polygon([(cx, cy - 3 * S), (cx + 3 * S, cy), (cx, cy + 3 * S), (cx - 3 * S, cy)], fill=JADE)
        else:                # thorns
            for a in range(0, 360, 45):
                r = 9 * S if a % 90 == 0 else 5 * S
                d.line([(cx, cy), (cx + r * math.cos(math.radians(a)), cy + r * math.sin(math.radians(a)))], fill=L, width=2 * S)
    for k, cx in enumerate((110, 150, 190)):
        cx *= S; cy = 11 * S
        if kind == 'fear':
            d.polygon([(cx - 6 * S, cy + 3 * S), (cx, cy - 6 * S), (cx + 6 * S, cy + 3 * S)], fill=L)
        elif kind == 'art':
            d.ellipse([cx - 6 * S, cy - 4 * S, cx + 6 * S, cy + 4 * S], fill=JADE if k == 1 else L, outline=cfg['inner'], width=S)
        else:
            d.ellipse([cx - 8 * S, cy - 4 * S, cx + 8 * S, cy + 4 * S], fill=(0x3f, 0x7a, 0x4a), outline=cfg['inner'], width=S)
    a = np.asarray(im).copy()
    sp = np.random.RandomState(cfg['seed']).rand(H, W) > .996
    a[..., :3][sp] = np.clip(a[..., :3][sp].astype(int) + 60, 0, 255)
    im = Image.fromarray(a)
    mask = Image.new('L', (W, H), 255); md = ImageDraw.Draw(mask)
    md.rounded_rectangle([x0, y0, x1 - 1, y1 - 1], radius=12 * S, fill=0)
    im.putalpha(ImageChops.multiply(im.getchannel('A'), mask))
    out = im.resize((300, 420), Image.LANCZOS)
    al = np.asarray(out).copy()
    al[WIN[1] + 2:WIN[3] - 1, WIN[0] + 2:WIN[2] - 1, 3] = 0     # window stays fully transparent, same as the old files
    return Image.fromarray(al)

def card_back():
    W, H = 300, 420
    im = _tex(W, H, (0x1d, 0x35, 0x28), 50, 21)
    d = ImageDraw.Draw(im, 'RGBA')
    for i in range(-H, W + H, 26):    # diamond lattice
        d.line([(i, 0), (i + H, H)], fill=(0xd9, 0xa4, 0x41, 60), width=1)
        d.line([(i, H), (i + H, 0)], fill=(0xd9, 0xa4, 0x41, 60), width=1)
    d.rectangle([0, 0, W - 1, H - 1], outline=INK, width=4)
    d.rectangle([9, 9, W - 10, H - 10], outline=GOLD, width=3)
    d.rectangle([16, 16, W - 17, H - 17], outline=(0xf3, 0xe9, 0xca, 200), width=1)
    cx, cy = W // 2, H // 2
    d.ellipse([cx - 92, cy - 92, cx + 92, cy + 92], fill=(0x10, 0x20, 0x17, 235), outline=GOLD, width=3)
    d.ellipse([cx - 82, cy - 82, cx + 82, cy + 82], outline=(0xf3, 0xe9, 0xca, 170), width=1)
    for a in range(0, 360, 20):   # sun rays
        r1, r2 = 62, 78
        d.line([(cx + r1 * math.cos(math.radians(a)), cy - 8 + r1 * math.sin(math.radians(a))), (cx + r2 * math.cos(math.radians(a)), cy - 8 + r2 * math.sin(math.radians(a)))], fill=GOLD, width=2)
    d.ellipse([cx - 22, cy - 38, cx + 22, cy + 6], fill=GOLD)
    y = cy + 52
    for hw, hh in [(70, 26), (56, 24), (42, 22), (28, 20)]:   # stepped temple
        d.rectangle([cx - hw, y - hh // 2, cx + hw, y + 2], fill=(0xc9, 0xb0, 0x7f), outline=INK)
        y -= hh // 2 + 1
    d.rectangle([cx - 8, y + 4, cx + 8, y + 16], fill=INK)
    out = vignette(im.convert('RGB'), .35)
    return grain(out, 6, 4)


# ================================================================ MANIFEST
# Every slot -> recipe.  kinds:
#   io  item object cut out on aged parchment        (spec, fill)
#   ip  item photo/print mounted as a plate on parchment (spec, crop(l,t,r,b), rot)
#   ao  artifact cut out on dark jungle stone with warm glow (spec, fill)
#   go  guardian cut out on jungle stone, 400x400    (spec, fill)
#   sc  scene: cover-crop + grade + printed border    (spec, crop, focus, zoom)
#   id  idol token cut out, transparent               (spec, crop)
#   pt  portrait                                       (spec, crop)
M = lambda i, **k: ('met', i, k)
A = lambda i: ('aic', i)
LB = lambda path, title: ('loc', path, title)
MAPU = lambda url, title, page: ('url', url, title, 'Library of Congress, Geography and Map Division (cartographer unknown or historic)', page)

MANIFEST = {
 # ---- item cards: expedition gear (parchment family)
 'card-sextant':    ('io', M(923639)), 'card-theodolite': ('io', M(8030)), 'card-spyglass': ('io', M(102501), .86),
 'card-lamp':       ('io', M(4741)),   'card-camera': ('ip', M(631211), (0, 0, 1, 1), 0),   'card-radio': ('io', M(8484)),
 'card-dinghy':     ('io', M(241307)), 'card-rope': ('io', M(551077), .88), 'card-machete': ('io', M(315670)),
 'card-pickaxe':    ('io', M(322851), .86), 'card-chisel': ('io', M(43632)), 'card-canteen': ('io', M(205024)),
 'card-kettle':     ('io', M(207823)), 'card-satchel': ('io', M(87665), .86), 'card-crate': ('io', M(191179), .86),
 'card-lockbox':    ('io', M(187132)), 'card-jeepkey': ('io', M(206349), .86), 'card-scale': ('io', M(629597)),
 'card-ledger':     ('io', M(20365)),  'card-quiver': ('io', M(34069)),    'card-flares': ('io', M(471625), .86),
 'card-mapcase':    ('io', M(4942)),   'card-brush': ('io', M(201367), .88), 'card-codebook': ('io', M(307602)),
 'card-tarp':       ('ip', M(448936), (.03, .03, .97, .97), 0),
 'card-almanac':    ('ip', M(591852), (.0, .0, 1, 1), -1),
 'card-journal':    ('ip', M(16449), (.04, .04, .96, .96), 1),
 'card-grant':      ('ip', M(289191), (.05, .02, .95, .98), -1), 'card-permit': ('ip', M(289207), (.05, .02, .95, .98), 1),
 'card-trail':      ('ip', M(287849), (.08, .02, .92, .98), 1),
 'card-seaplane':   ('ip', LB('ggbain/18600/18612r.jpg', 'British seaplane'), (.04, .10, .96, .96), -1),
 'card-airship':    ('ip', LB('ggbain/09800/09800r.jpg', 'British Naval airship'), (.05, .30, .95, .64), 1),
 'card-mule':       ('ip', LB('ggbain/03300/03315r.jpg', 'Pack mule of U.S. Army Signal Corps'), (.06, .04, .94, .80), -1),
 'card-gramophone': ('ip', LB('ggbain/50200/50225r.jpg', 'First phonograph'), (.02, .03, .98, .84), 1),
 'card-tent':       ('ip', M(286361), (.02, .02, .98, .98), -1),
 'card-ropebridge': ('ip', M(283069), (.02, .02, .98, .98), 1),
 'card-hammock':    ('ip', M(375939), (.05, .04, .95, .96), -1),
 # ---- artifact cards (dark jungle-stone family)
 'card-ancestor-mask': ('ao', M(312736)), 'card-ash-urn': ('ao', M(319468)), 'card-bat-wing-fan': ('ao', M(312719)),
 'card-bone-dice': ('ao', M(449310)), 'card-clay-cup': ('ao', M(318628)), 'card-coral-throne': ('ao', M(313138)),
 'card-ember-mask': ('ao', M(309973)), 'card-feather-cloak': ('ao', M(313343)), 'card-gilded-beetle': ('ao', M(316686)),
 'card-glyph-stone': ('ao', M(307636)), 'card-gold-mask': ('ao', M(312716)), 'card-jade-frog': ('ao', A(8088)),
 'card-lava-blade': ('ao', M(307737)), 'card-moon-comb': ('ao', M(310499)), 'card-moss-idol': ('ao', M(307633)),
 'card-obsidian-mirror': ('ao', M(314189)), 'card-old-codex': ('ao', M(662967)), 'card-owl-totem': ('ao', M(315119)),
 'card-rain-drum': ('ao', M(313290)), 'card-reed-flute': ('ao', M(502628)), 'card-root-sceptre': ('ao', M(310644)),
 'card-serpent-ring': ('ao', M(310648)), 'card-sky-lens': ('ao', M(314705)), 'card-spirit-bowl': ('ao', M(315883)),
 'card-star-chart': ('ao', M(307746)), 'card-stone-heart': ('ao', M(316290)), 'card-storm-horn': ('ao', M(503544)),
 'card-sun-disc': ('ao', M(320313)), 'card-tide-shell': ('ao', M(313132)), 'card-tusk-horn': ('ao', M(312459)),
 'card-twin-idols': ('ao', M(316299)), 'card-vine-crown': ('ao', M(316700)), 'card-wind-chime': ('ao', M(315672)),
 'card-world-seed': ('ao', M(313018)), 'card-thorn-key': ('ao', M(463340)), 'card-dread': ('ao', M(307664), .86),
 # ---- guardians (400x400)
 'guard-ash-jaguar': ('go', M(308523)), 'guard-bone-heron': ('go', M(316728)), 'guard-canopy-wyrm': ('go', M(313345)),
 'guard-ember-hound': ('go', M(318999)), 'guard-glass-moth': ('go', M(316685)), 'guard-howl-bat': ('go', M(313292)),
 'guard-mire-crawler': ('go', M(313335, ), 1.0), 'guard-moss-golem': ('go', M(310498)), 'guard-old-warden': ('sc', M(341061, big=True), (0, .02, 1, .98), (.5, .45), 1.0),
 'guard-rootback-boar': ('go', M(317647)), 'guard-stone-ape': ('go', M(765334)), 'guard-temple-cat': ('go', M(503542)),
 'guard-thunder-toad': ('go', M(310471)), 'guard-tide-serpent': ('go', M(308590)), 'guard-vine-widow': ('go', M(314477)),
 # ---- idols (transparent tokens)
 'idol-ape': ('id', M(312567)), 'idol-bat': ('id', M(309419), (0, 0, .5, 1)), 'idol-bird': ('id', M(316783)),
 'idol-boar': ('id', M(309559)), 'idol-cat': ('id', M(309519)), 'idol-fish': ('id', M(312960)), 'idol-frog': ('id', M(313511)),
 'idol-moon': ('id', M(316707)), 'idol-owl': ('id', M(308732), (0, 0, 1, .72)), 'idol-snake': ('id', M(307635)),
 'idol-star': ('id', M(309411)), 'idol-sun': ('id', M(320311)),
 # ---- sites (engraving-like photographs / prints, 400x300)
 'site-bone-chapel': ('sc', M(286948), (.03, .03, .97, .80)), 'site-broken-arch': ('sc', M(287659), (.02, .02, .98, .98)),
 'site-c-cliff': ('sc', M(286041), (.03, .03, .97, .97)), 'site-c-cove': ('sc', M(286191), (.03, .03, .97, .97)),
 'site-c-road': ('sc', M(264538), (.03, .03, .97, .97)), 'site-c-spring': ('sc', M(288554), (.0, .0, 1, 1), (.5, .5)),
 'site-c-wreck': ('sc', M(393392), (.0, .0, 1, 1)), 'site-crystal-vault': ('sc', M(285438), (.0, .0, 1, 1), (.5, .4)),
 'site-drowned-hall': ('sc', M(302650), (.03, .03, .97, .80)), 'site-echo-pit': ('sc', M(286079), (.02, .02, .98, .98)),
 'site-fern-steps': ('sc', M(288201), (.04, .04, .96, .85)), 'site-frog-pool': ('sc', M(287844), (.03, .03, .97, .97)),
 'site-hidden-1': ('sc', M(265904), (.02, .02, .98, .98)), 'site-hidden-2': ('sc', M(265075), (.02, .02, .98, .98)),
 'site-hollow-tree': ('sc', M(264524), (.03, .03, .97, .97)), 'site-jade-court': ('sc', M(288198), (.03, .02, .97, .80)),
 'site-lava-stair': ('sc', M(260973), (.03, .03, .97, .97)), 'site-moth-cave': ('sc', M(683200), (.07, .03, .93, .82)),
 'site-root-gate': ('sc', M(287851), (.03, .03, .97, .97)), 'site-sky-altar': ('sc', M(302636), (.02, .03, .98, .84)),
 'site-snake-ford': ('sc', LB('cph/3b30000/3b37000/3b37800/3b37806r.jpg', 'Otuwhakakaireau, Wanganui River'), (0, 0, 1, 1), (.5, .5)),
 'site-star-pool': ('sc', M(286187), (.03, .03, .97, .97)), 'site-statue-row': ('sc', M(265917), (.05, .04, .95, .95)),
 'site-sunken-well': ('sc', M(680014), (.03, .03, .97, .85)), 'site-thorn-palace': ('sc', M(286467), (.02, .02, .98, .98)),
 # ---- portraits (512x512)
 'portrait-mira': ('pt', M(283119), (.0, .02, 1, .82)), 'portrait-okoro': ('pt', LB('ggbain/00800/00857r.jpg', 'Capt. Benard, Arctic explorer'), (.05, .05, .95, .70)),
 'portrait-pell': ('pt', M(286386), (.1, .02, .9, .62)), 'portrait-quell': ('pt', LB('ggbain/12200/12229r.jpg', 'Prof. M. Pupin'), (.05, .02, .95, .62)),
 'portrait-sallow': ('pt', M(288069), (.05, .02, .95, .65)), 'portrait-tamsin': ('pt', LB('ggbain/19300/19367r.jpg', 'Lady Mackenzie'), (.05, .03, .95, .65)),
 'portrait-vane': ('pt', LB('cph/3b00000/3b01000/3b01400/3b01439r.jpg', 'Walter Wellman, head-and-shoulders portrait'), (.1, .0, .9, .82)),
 'portrait-warden': ('pt', M(307640), (.0, .05, 1, .98)),
}

# ---- big scenes, maps, small icons
MANIFEST.update({
 'title-bg':    ('ti', M(286467, big=True), (.0, .0, 1, 1), (.5, .62)),
 'result-win':  ('sc', M(288198, big=True), (.02, .02, .98, .80), (.5, .55), 1.0, dict(warm=.35)),
 'result-lose': ('sc', M(302638, big=True), (.02, .02, .98, .80), (.5, .5), 1.0, dict(dark=.35)),
 'board-map':   ('mp', MAPU('https://tile.loc.gov/image-services/iiif/service:gmd:gmd4:g4930:g4930:ct000952/full/pct:25/0/default.jpg', 'Map of the islands of Hispaniola and Puerto Rico (1639)', 'https://www.loc.gov/item/2003623402/')),
 'map-act1':    ('mp', MAPU('https://tile.loc.gov/image-services/iiif/service:gmd:gmd5:g5000:g5000:ct000878/full/pct:25/0/default.jpg', 'Map of Lesser Antilles (1650)', 'https://www.loc.gov/item/99443222/')),
 'map-act2':    ('mp', MAPU('https://tile.loc.gov/image-services/iiif/service:gmd:gmd4:g4412:g4412c:ct002415r/full/pct:12.5/0/default.jpg', 'Portolan chart of the Pacific coast from Mexico to northern Chile (about 1500)', 'https://www.loc.gov/item/2008628167/'), (.07, .10, .93, .88)),
 'map-act3':    ('mp', MAPU('https://tile.loc.gov/image-services/iiif/service:gmd:gmd4:g4390:g4390:ar168000/full/pct:25/0/default.jpg', 'An accurate map of the West Indies with the adjacent coast (1762)', 'https://www.loc.gov/item/2010585586/')),
 'track-bg':    ('sc', M(732750, big=True), (.30, 0, .70, 1), (.5, .5), 1.0, dict(dark=.3)),
 'temple-2':    ('md', M(288201), (.04, .04, .96, .85)),
 'temple-6':    ('md', M(302636), (.02, .03, .98, .84)),
 'temple-11':   ('md', M(260973), (.03, .03, .97, .97)),
 'res-coin':    ('ic', M(316707)), 'res-compass': ('ic', M(8029)), 'res-jewel': ('ic', M(313018)),
 'res-tablet':  ('ic', M(307636)), 'res-arrow': ('ic', M(307737)), 'tr-ship': ('ic', M(241307)),
 'token-notebook': ('ic', M(20365)), 'token-glass': ('ic', M(102501)),
 'card-frame-item': ('fr', 'item'), 'card-frame-art': ('fr', 'art'), 'card-frame-fear': ('fr', 'fear'), 'card-back': ('bk',),
})
KEPT = {   # slots deliberately kept from vg.py / vg2.py (small vector UI glyphs: a photograph would not read at 40 px)
 'fx-discover': 'effect overlay (glow), no picture content', 'fx-guardian': 'effect overlay (glow)', 'fx-idol': 'effect overlay (glow)',
 'icon-howto': 'UI glyph', 'icon-quick': 'UI glyph', 'icon-story': 'UI glyph', 'shrine-slot': 'empty-slot marker',
 'explorer-0': 'player pawn, 4 player colours must stay readable', 'explorer-1': 'player pawn', 'explorer-2': 'player pawn', 'explorer-3': 'player pawn',
 'tr-boot': 'travel glyph, no PD photo that reads at 40 px', 'tr-car': 'travel glyph', 'tr-plane': 'travel glyph',
}

# ================================================================ builders
def seed_of(slot):
    return int(hashlib.md5(slot.encode()).hexdigest()[:6], 16)

def crop_frac(im, c):
    if not c: return im
    w, h = im.size
    return im.crop((int(c[0] * w), int(c[1] * h), int(c[2] * w), int(c[3] * h)))

def solid_ratio(a):
    return float((np.asarray(a.getchannel('A')) < 20).mean())

def b_object(slot, rec, size, back, fill_default, vig, kind):
    im, info = get_source(rec[1])
    ob = cutout_auto(im)
    r = solid_ratio(ob)
    if r < .06 or r > .97:       # flood failed (textured backdrop): fall back to a mounted plate
        raise RuntimeError('cutout failed (%.2f transparent)' % r)
    fill = rec[2] if len(rec) > 2 and not isinstance(rec[2], tuple) else fill_default
    gk = dict(keep=.34, gamma=.95, contrast=1.12)
    if kind == 'io': gk = dict(keep=.30, gamma=.9, contrast=1.15)
    img = place_object(ob, size, back, fill=fill, shadow=.5 if kind == 'io' else .7, grade_kw=gk)
    return finish(img, vig=vig, seed=seed_of(slot)), info

def b_plate(slot, rec, size, back):
    im, info = get_source(rec[1])
    im = crop_frac(im, rec[2] if len(rec) > 2 else None)
    rot = rec[3] if len(rec) > 3 else 0
    W, H = size
    pl = grade(im, keep=.2, gamma=.95, contrast=1.1, lo=1, hi=99)
    s = min(W * .88 / pl.width, H * .88 / pl.height)
    pl = pl.resize((max(1, int(pl.width * s)), max(1, int(pl.height * s))), Image.LANCZOS)
    pl = ImageOps.expand(pl, border=2, fill=INK)
    pl = ImageOps.expand(pl, border=5, fill=CREAM)
    pl = ImageOps.expand(pl, border=1, fill=(0x6b, 0x4a, 0x28)).convert('RGBA')
    if rot: pl = pl.rotate(rot, expand=True, resample=Image.BICUBIC)
    cv = back.convert('RGBA')
    x, y = (W - pl.width) // 2, (H - pl.height) // 2
    sh = Image.new('L', (W, H), 0); sh.paste(pl.getchannel('A'), (x + 4, y + 7)); sh = sh.filter(ImageFilter.GaussianBlur(6)).point(lambda v: int(v * .55))
    cv = Image.alpha_composite(cv, Image.merge('RGBA', (Image.new('L', (W, H), 30), Image.new('L', (W, H), 20), Image.new('L', (W, H), 10), sh)))
    cv.alpha_composite(pl, (x, y))
    return finish(cv.convert('RGB'), vig=.3, seed=seed_of(slot)), info

def finish_big(g, slot):
    return grain(vignette(g, .5), 3, seed_of(slot))

def b_scene_wrap(slot, rec, size):
    im, info = get_source(rec[1])
    im = crop_frac(im, rec[2] if len(rec) > 2 else None)
    focus = rec[3] if len(rec) > 3 else (.5, .5)
    zoom = rec[4] if len(rec) > 4 else 1.0
    tune = rec[5] if len(rec) > 5 else {}
    sm = cover(im, size, focus, zoom)
    g = grade(sm, keep=.16, gamma=.95, contrast=1.12, lo=1, hi=99, jade=.28)
    a = np.asarray(g, np.float32)
    if tune.get('warm'):
        a = a * (1 - tune['warm']) + (a * np.array([1.12, 1.0, .78], np.float32) + 12) * tune['warm']
    if tune.get('dark'):
        a = a * (1 - tune['dark'] * .6) + np.array(JUNGLE, np.float32) * tune['dark'] * .3
    g = Image.fromarray(a.clip(0, 255).astype(np.uint8))
    if size[0] >= 900 or slot == 'track-bg':
        return finish_big(g, slot), info
    return finish(g, vig=.42, seed=seed_of(slot)), info

def b_title(slot, rec, size):
    im, info = get_source(rec[1])
    sm = cover(crop_frac(im, rec[2]), size, rec[3], 1.0)
    g = grade(sm, keep=.2, gamma=.95, contrast=1.1, lo=1, hi=99, jade=.3)
    a = np.asarray(g, np.float32)
    w, h = size
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    # calm, darker pool at top centre for the logo
    d = np.sqrt(((x - w / 2) / (w * .36)) ** 2 + ((y - h * .16) / (h * .30)) ** 2)
    m = np.clip(1 - d, 0, 1) ** .8 * .78
    ink = np.array((0x12, 0x24, 0x1a), np.float32)
    top = np.clip(1 - y / (h * .5), 0, 1)[..., None] * .35
    a = a * (1 - m[..., None]) + ink * m[..., None]
    a = a * (1 - top) + ink * top
    return finish_big(Image.fromarray(a.clip(0, 255).astype(np.uint8)), slot), info

def b_portrait(slot, rec, size):
    im, info = get_source(rec[1])
    im = crop_frac(im, rec[2])
    sm = cover(im, size, (.5, .35), 1.0)
    g = grade(sm, keep=.22, gamma=.95, contrast=1.08, lo=1, hi=99, jade=.18)
    return finish(g, vig=.5, seed=seed_of(slot)), info

def b_idol(slot, rec, size, thick=3):
    im, info = get_source(rec[1])
    im = crop_frac(im, rec[2] if len(rec) > 2 and isinstance(rec[2], tuple) else None)
    ob = cutout_auto(im)
    r = solid_ratio(ob)
    if r < .06 or r > .97: raise RuntimeError('cutout failed (%.2f)' % r)
    bb = ob.getchannel('A').point(lambda v: 255 if v > 60 else 0).getbbox()
    ob = ob.crop(bb)
    rgb = grade(ob.convert('RGB'), keep=.38, gamma=.95, contrast=1.15)
    ob = Image.merge('RGBA', (*rgb.split(), ob.getchannel('A')))
    W, H = size
    s = min(W * .88 / ob.width, H * .88 / ob.height)
    ob = ob.resize((max(1, int(ob.width * s)), max(1, int(ob.height * s))), Image.LANCZOS)
    cv = Image.new('RGBA', size, (0, 0, 0, 0))
    x, y = (W - ob.width) // 2, (H - ob.height) // 2
    al = ob.getchannel('A')
    rim = al.filter(ImageFilter.MaxFilter(thick * 2 + 1)).filter(ImageFilter.GaussianBlur(1))
    layer = Image.merge('RGBA', (Image.new('L', ob.size, INK[0]), Image.new('L', ob.size, INK[1]), Image.new('L', ob.size, INK[2]), rim))
    sh = Image.new('L', size, 0); sh.paste(al, (x + 3, y + 5)); sh = sh.filter(ImageFilter.GaussianBlur(4)).point(lambda v: int(v * .45))
    cv = Image.alpha_composite(cv, Image.merge('RGBA', (Image.new('L', size, 10), Image.new('L', size, 8), Image.new('L', size, 4), sh)))
    cv.alpha_composite(layer, (x, y)); cv.alpha_composite(ob, (x, y))
    return cv, info

def b_medallion(slot, rec, size):
    im, info = get_source(rec[1])
    im = crop_frac(im, rec[2])
    W, H = size
    D = int(W * .92)
    sm = cover(im, (D, D), (.5, .5), 1.0)
    g = grade(sm, keep=.2, gamma=.95, contrast=1.15, lo=1, hi=99, jade=.28)
    g = vignette(g, .35)
    mask = Image.new('L', (D * 3, D * 3), 0); ImageDraw.Draw(mask).ellipse([0, 0, D * 3 - 1, D * 3 - 1], fill=255)
    mask = mask.resize((D, D), Image.LANCZOS)
    cv = Image.new('RGBA', size, (0, 0, 0, 0))
    x = (W - D) // 2
    ring = Image.new('RGBA', size, (0, 0, 0, 0)); rd = ImageDraw.Draw(ring)
    rd.ellipse([x - 3, x - 3, x + D + 2, x + D + 2], fill=CREAM + (255,))
    rd.ellipse([x - 1, x - 1, x + D, x + D], fill=INK + (255,))
    cv = Image.alpha_composite(cv, ring)
    g = g.convert('RGBA'); g.putalpha(mask)
    cv.alpha_composite(g, (x, x))
    return cv, info

def b_map(slot, rec, size):
    im, info = get_source(rec[1])
    im = crop_frac(im, rec[2] if len(rec) > 2 else None)
    sm = cover(im, size, (.5, .5), 1.0)
    g = grade(sm, keep=.1, gamma=1.3, contrast=1.45, lo=3, hi=97, jade=.12)
    par = np.asarray(parchment(size, seed_of(slot)), np.float32)
    a = np.asarray(g, np.float32)
    out = a * .8 + (a * par / 255.0) * .2          # fold a little paper mottling into the ink
    return finish_big(Image.fromarray(out.clip(0, 255).astype(np.uint8)), slot), info

def build_one(slot):
    rec = MANIFEST[slot]
    k = rec[0]
    p = os.path.join(HERE, slot + '.webp')
    size = Image.open(p).size if os.path.exists(p) else None
    if k == 'fr': return frame(rec[1]), dict(title='procedural frame', creator='drawn in vg3.py', lic='CC0 (original drawing)', page='-')
    if k == 'bk': return card_back(), dict(title='procedural card back', creator='drawn in vg3.py', lic='CC0 (original drawing)', page='-')
    if k == 'io':
        try: return b_object(slot, rec, size, parchment(size, seed_of(slot)), .86, .3, 'io')
        except RuntimeError as e:
            print('  note %s: %s -> plate' % (slot, e)); return b_plate(slot, ('ip', rec[1], None, 0), size, parchment(size, seed_of(slot)))
    if k == 'ip': return b_plate(slot, rec, size, parchment(size, seed_of(slot)))
    if k == 'ao': return b_object(slot, rec, size, jungle_stone(size, seed_of(slot) % 97), .86, .42, 'ao')
    if k == 'go': return b_object(slot, rec, size, jungle_stone(size, seed_of(slot) % 97), .86, .45, 'go')
    if k == 'sc': return b_scene_wrap(slot, rec, size)
    if k == 'ti': return b_title(slot, rec, size)
    if k == 'pt': return b_portrait(slot, rec, size)
    if k == 'id': return b_idol(slot, rec, size)
    if k == 'ic': return b_idol(slot, rec, size, thick=2)
    if k == 'md': return b_medallion(slot, rec, size)
    if k == 'mp': return b_map(slot, rec, size)
    raise ValueError(k)

def main():
    only = None; mf = os.path.join(HERE, 'manifest.json')
    for i, a in enumerate(sys.argv):
        if a == '--only': only = set(sys.argv[i + 1].split(','))
    done = json.load(open(mf)) if os.path.exists(mf) else {}
    ok = bad = 0
    for slot in sorted(MANIFEST):
        if only and slot not in only and not any(slot.startswith(o) for o in only): continue
        try:
            im, info = build_one(slot)
            path = os.path.join(HERE, slot + '.webp')
            big = im.size[0] * im.size[1] > 400 * 420
            kb = None if slot.startswith('card-frame') or slot == 'card-back' else (250 if big else 60)
            if im.mode == 'RGBA': im.save(path, 'WEBP', quality=84, method=6, alpha_quality=90)
            else: save(im, path, 82, kb)
            sz = os.path.getsize(path) // 1024
            if kb and sz > kb: print('  warn size %s %dKB' % (slot, sz))
            done[slot] = dict(info, src=[str(x) for x in MANIFEST[slot][1:2]] if MANIFEST[slot][0] not in ('fr', 'bk') else [], kind=MANIFEST[slot][0])
            ok += 1
        except Exception as e:
            bad += 1; print('FAIL %s: %r' % (slot, e))
    json.dump(done, open(mf, 'w'), indent=1, default=str)
    print('built %d, failed %d' % (ok, bad))

if __name__ == '__main__':
    main()
