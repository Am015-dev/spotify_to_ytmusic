"""W410 helpers for the icon/plate libraries (game-icons.net CC BY 3.0, Haeckel plates via Internet Archive scan, public domain)."""
import os, glob, numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageOps
SC = '/tmp/claude-0/-home-user-spotify-to-ytmusic/f941656b-316f-5165-bacf-c89b7bddfd02/scratchpad'
GI = SC + '/gi/icons/ffffff/000000/1x1'
IDX = {}
for p in glob.glob(GI + '/*/*.png'):
    IDX[os.path.basename(p)[:-4]] = (p, os.path.basename(os.path.dirname(p)))
USED = {}

def hexc(h): h = h.lstrip('#'); return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def glyph(name, size, c1, c2=None, shadow=True):
    p, au = IDX[name]; USED[name] = au
    im = Image.open(p).convert('L')
    a = ImageOps.autocontrast(im)
    bb = a.point(lambda v: 255 if v > 30 else 0).getbbox() or (0, 0, im.width, im.height)
    a = a.crop(bb)
    s = size / max(a.size)
    a = a.resize((max(1, int(a.width * s)), max(1, int(a.height * s))), Image.LANCZOS)
    c2 = c2 or c1
    h = a.height
    grad = Image.new('RGB', a.size)
    gd = ImageDraw.Draw(grad)
    for y in range(h):
        t = y / max(1, h - 1)
        gd.line([(0, y), (a.width, y)], fill=tuple(int(c1[i] * (1 - t) + c2[i] * t) for i in range(3)))
    g = grad.convert('RGBA'); g.putalpha(a)
    return g

def gradmap(im, stops):
    """stops: list of (pos, rgb)"""
    L = np.asarray(im.convert('L'), dtype=np.float32) / 255
    out = np.zeros(L.shape + (3,), np.float32)
    xs = [s[0] for s in stops]
    for ch in range(3):
        out[..., ch] = np.interp(L, xs, [s[1][ch] for s in stops])
    return Image.fromarray(out.astype(np.uint8))

def page(n): return Image.open(f'{SC}/hk/p{n}.jpg').convert('RGB')

def crop_frac(im, box, size):
    W, H = im.size
    c = im.crop((int(box[0] * W), int(box[1] * H), int(box[2] * W), int(box[3] * H)))
    return ImageOps.fit(c, size, Image.LANCZOS)

def vignette(im, k=0.55):
    w, h = im.size
    y, x = np.ogrid[:h, :w]
    d = np.sqrt(((x - w / 2) / (w / 2)) ** 2 + ((y - h / 2) / (h / 2)) ** 2)
    m = np.clip(1 - k * (d ** 2) / 2, 0.25, 1)[..., None]
    return Image.fromarray((np.asarray(im, np.float32) * m).astype(np.uint8))

def paste_c(base, g, cx, cy, shadow=True):
    if shadow:
        sh = Image.new('RGBA', g.size, (0, 0, 0, 0)); sh.putalpha(g.split()[3].point(lambda v: int(v * .55)))
        sh = sh.filter(ImageFilter.GaussianBlur(max(2, g.width // 40)))
        base.alpha_composite(sh, (int(cx - g.width / 2 + g.width * .03), int(cy - g.height / 2 + g.height * .05)))
    base.alpha_composite(g, (int(cx - g.width / 2), int(cy - g.height / 2)))

def save(im, path, q=82):
    im.save(path, 'WEBP', quality=q, method=6)
