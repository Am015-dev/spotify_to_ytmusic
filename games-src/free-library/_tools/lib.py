import os, glob, random, math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageChops, ImageOps, ImageEnhance

S = '/tmp/claude-0/-home-user-spotify-to-ytmusic/f941656b-316f-5165-bacf-c89b7bddfd02/scratchpad'
OUT = '/home/user/spotify_to_ytmusic/games-src/free-library'


def load_pool(roots):
    pool = {}
    for r in roots:
        lic = os.path.join(r, 'lic.tsv')
        if not os.path.exists(lic):
            continue
        name = os.path.basename(r)
        items = []
        for line in open(lic, encoding='utf-8', errors='ignore'):
            p = line.rstrip('\n').split('\t')
            if len(p) < 5:
                continue
            fn = os.path.join(r, p[0])
            if not os.path.exists(fn):
                continue
            if 'catherwood' in r:
                title, cls, lic_, url = p[1], 'engraving', p[2], p[4]
                lic_ = 'CC0 (Wikimedia Commons)' if 'CC0' in lic_ else 'Public domain (Wikimedia Commons)'
            else:
                title, cls, lic_, url = p[1], p[2], p[3], p[4]
            try:
                im = Image.open(fn)
                w, h = im.size
            except Exception:
                continue
            if min(w, h) < 250:
                continue
            items.append(dict(path=fn, title=title, cls=cls, lic=lic_, url=url, q=name, size=(w, h)))
        pool[name] = items
    return pool


def border_score(im):
    a = np.asarray(im.convert('RGB').resize((64, 64)), dtype=np.float32)
    b = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]])
    return float(b.std(axis=0).mean()), b.mean(axis=0)


def cutout(im, thresh=46):
    im = im.convert('RGB')
    w, h = im.size
    if max(w, h) > 700:
        sc = 700 / max(w, h)
        im = im.resize((int(w * sc), int(h * sc)), Image.LANCZOS)
        w, h = im.size
    mk = im.copy()
    for pt in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1), (w // 2, 0), (w // 2, h - 1), (0, h // 2), (w - 1, h // 2)]:
        try:
            ImageDraw.floodfill(mk, pt, (255, 0, 255), thresh=thresh)
        except Exception:
            pass
    arr = np.asarray(mk)
    bg = (arr[..., 0] == 255) & (arr[..., 1] == 0) & (arr[..., 2] == 255)
    a_ = arr.astype(np.int16)
    Lm = (a_[..., 0] * 3 + a_[..., 1] * 6 + a_[..., 2]) / 10.0
    sat = (a_.max(-1) - a_.min(-1)) / 255.0
    edge = np.concatenate([Lm[0], Lm[-1], Lm[:, 0], Lm[:, -1]])
    bgL = float(np.median(edge[edge > 0])) if (edge > 0).any() else 200.0
    bgc = np.median(np.concatenate([arr[0], arr[-1], arr[:, 0], arr[:, -1]]).reshape(-1, 3), axis=0)
    dist = np.sqrt(((a_ - bgc) ** 2).sum(-1))
    Li = Image.fromarray(np.clip(Lm, 0, 255).astype(np.uint8))
    mean = np.asarray(Li.filter(ImageFilter.BoxBlur(2)), dtype=np.float32)
    sq = np.asarray(Image.fromarray(np.clip(np.abs(Lm - mean) * 8, 0, 255).astype(np.uint8)).filter(ImageFilter.BoxBlur(2)), dtype=np.float32) / 8
    shadowlike = (dist < 80) & (sq < 3.0) & (Lm < bgL + 12) & ~bg
    bgm = bg.copy()
    for _ in range(9):
        dil = np.asarray(Image.fromarray((bgm * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3))) > 0
        new_ = dil & shadowlike & ~bgm
        if not new_.any():
            break
        bgm |= new_
    fg = ~bgm
    # keep only significant connected components (low-res labelling)
    sm = np.asarray(Image.fromarray((fg * 255).astype(np.uint8)).resize((96, 96), Image.BOX)) > 100
    lab = np.zeros(sm.shape, dtype=np.int32); n = 0; sizes = {}
    for y0 in range(96):
        for x0 in range(96):
            if sm[y0, x0] and not lab[y0, x0]:
                n += 1; st = [(y0, x0)]; lab[y0, x0] = n; c = 0
                while st:
                    y, x = st.pop(); c += 1
                    for dy in (-1, 0, 1):
                        for dx in (-1, 0, 1):
                            yy, xx = y + dy, x + dx
                            if 0 <= yy < 96 and 0 <= xx < 96 and sm[yy, xx] and not lab[yy, xx]:
                                lab[yy, xx] = n; st.append((yy, xx))
                sizes[n] = c
    if not sizes:
        return None
    big = max(sizes.values())
    keep = np.isin(lab, [k for k, v in sizes.items() if v >= 0.3 * big])
    keepbig = np.asarray(Image.fromarray((keep * 255).astype(np.uint8)).resize((w, h), Image.BILINEAR).filter(ImageFilter.MaxFilter(9))) > 100
    fg = fg & keepbig
    m = Image.fromarray((fg * 255).astype(np.uint8))
    m = m.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.1))
    frac = (np.asarray(m) > 128).mean()
    if frac < 0.07 or frac > 0.80:
        return None
    rgba = im.convert('RGBA')
    rgba.putalpha(m)
    bb = m.point(lambda v: 255 if v > 100 else 0).getbbox()
    if not bb:
        return None
    return rgba.crop(bb)


def cover(im, size, cx=0.5, cy=0.5):
    w, h = im.size
    tw, th = size
    s = max(tw / w, th / h)
    nw, nh = max(tw, round(w * s)), max(th, round(h * s))
    im = im.resize((nw, nh), Image.LANCZOS)
    x = int((nw - tw) * cx)
    y = int((nh - th) * cy)
    return im.crop((x, y, x + tw, y + th))


def contain_rgba(sub, size, pad=0.08):
    tw, th = size
    w, h = sub.size
    s = min(tw * (1 - 2 * pad) / w, th * (1 - 2 * pad) / h)
    nw, nh = max(1, round(w * s)), max(1, round(h * s))
    sub = sub.resize((nw, nh), Image.LANCZOS)
    c = Image.new('RGBA', size, (0, 0, 0, 0))
    c.alpha_composite(sub, ((tw - nw) // 2, (th - nh) // 2))
    return c


def gradient_map(im, stops, strength, sat=1.0):
    rgb = im.convert('RGB')
    if sat != 1.0:
        rgb = ImageEnhance.Color(rgb).enhance(sat)
    a = np.asarray(rgb, dtype=np.float32)
    L = (a[..., 0] * .299 + a[..., 1] * .587 + a[..., 2] * .114) / 255.0
    L = np.clip((L - 0.03) / 0.94, 0, 1)
    pos = [s[0] for s in stops]
    out = np.zeros_like(a)
    for c in range(3):
        out[..., c] = np.interp(L, pos, [s[1][c] for s in stops])
    res = a * (1 - strength) + out * strength
    return Image.fromarray(np.clip(res, 0, 255).astype(np.uint8))


def grade(im, f, contrast=1.0):
    if im.mode == 'RGBA':
        a = im.getchannel('A')
        r = f(im.convert('RGB'))
        r = ImageEnhance.Contrast(r).enhance(contrast).convert('RGBA')
        r.putalpha(a)
        return r
    r = f(im.convert('RGB'))
    return ImageEnhance.Contrast(r).enhance(contrast)


VG_STOPS = [(0, (14, 26, 22)), (0.35, (58, 70, 48)), (0.65, (150, 134, 84)), (1, (240, 224, 178))]


def grade_vg(im):
    return grade(im, lambda x: gradient_map(x, VG_STOPS, 0.55, 0.85), contrast=1.08)


def grade_sw(im):
    def f(x):
        x = ImageEnhance.Color(x.convert('RGB')).enhance(0.88)
        a = np.asarray(x, dtype=np.float32)
        a = a * np.array([1.0, 0.965, 0.915]) * 0.96 + np.array([14, 10, 6])
        return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    return grade(im, f, contrast=1.05)


def vignette(im, amt=0.45):
    w, h = im.size
    y, x = np.ogrid[:h, :w]
    d = ((x - w / 2) / (w / 2)) ** 2 + ((y - h / 2) / (h / 2)) ** 2
    m = 1 - amt * np.clip(d - 0.35, 0, 1) / 0.9
    a = np.asarray(im.convert('RGB'), dtype=np.float32) * m[..., None]
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def backdrop(size, c1, c2, seed=0):
    w, h = size
    y = np.linspace(0, 1, h)[:, None, None]
    a = np.array(c1, dtype=np.float32) * (1 - y) + np.array(c2, dtype=np.float32) * y
    a = np.broadcast_to(a, (h, w, 3)).copy()
    rng = np.random.RandomState(seed)
    n = rng.normal(0, 6, (h // 4 + 1, w // 4 + 1))
    n = np.asarray(Image.fromarray(np.clip(n + 128, 0, 255).astype(np.uint8)).resize((w, h), Image.BICUBIC), dtype=np.float32)[..., None] - 128
    a += n
    return vignette(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)), 0.5)


def save(im, path, q=78):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if im.mode == 'RGBA':
        im.save(path, 'WEBP', quality=q, method=5)
    else:
        im.convert('RGB').save(path, 'WEBP', quality=q, method=5)
