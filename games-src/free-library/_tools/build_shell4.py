#!/usr/bin/env python3
"""W410 shell slots for hollowbough, kaiten-kitchen, lantern-dive, nebula-aces: ui-star-on/off, ui-act-banner-c, story-map.
Colours and textures come from each game's own painted media, so the grade matches. Output: games-src/free-library/<slug>/."""
import os, sys, math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageChops, ImageEnhance
ROOT = '/home/user/spotify_to_ytmusic'
MAPSRC = {'hollowbough': 'table-woodland-phone', 'kaiten-kitchen': 'table-dinner-counter', 'lantern-dive': 'table-tunnel-glow-phone', 'nebula-aces': 'table-default-phone'}
GAMES = {'hollowbough': 'hollowbough', 'kaiten-kitchen': 'kaiten', 'lantern-dive': 'lantern-dive', 'nebula-aces': 'xw'}
M = lambda s, f: Image.open(f'{ROOT}/games/{s}/media/{f}.webp').convert('RGBA')

def mean_col(im, thresh=200):
    a = np.asarray(im, dtype=np.float32); m = a[..., 3] > thresh
    return tuple(int(v) for v in a[m][:, :3].mean(0))

def tex_from(s, w, h):
    """texture crop from the game's own drawer head (painted band) scaled to (w,h)"""
    t = M(s, 'ui-drawer-head').convert('RGB'); t = t.resize((max(w, 2), max(h, 2)), Image.LANCZOS); return t

def shade(mask, base, light=1.0, size=1):
    """bevel: lit top-left, dark bottom-right, from a blurred mask"""
    m = mask.filter(ImageFilter.GaussianBlur(size * 1.5)); a = np.asarray(m, dtype=np.float32) / 255
    gy, gx = np.gradient(a); lit = np.clip(0.5 - (gx + gy) * 6 * size, 0, 1)
    out = np.asarray(base, dtype=np.float32)
    k = (0.62 + 0.75 * lit)[..., None] * light
    return Image.fromarray(np.clip(out * k, 0, 255).astype(np.uint8))

def star_poly(cx, cy, R, r, rot=-90):
    pts = []
    for i in range(10):
        ang = math.radians(rot + i * 36); rad = R if i % 2 == 0 else r
        pts.append((cx + rad * math.cos(ang), cy + rad * math.sin(ang)))
    return pts

def make_star(s, on, S=512):
    acc = mean_col(M(s, 'ui-button-go-c'))
    gold = (238, 180, 60)
    if on:
        col = tuple(int(g * .78 + a * .22) for g, a in zip(gold, acc))
    else:
        g = sum(acc) // 3; col = tuple(int(g * .45 + a * .25 + 40) for a in acc)
    mask = Image.new('L', (S, S), 0); ImageDraw.Draw(mask).polygon(star_poly(S / 2, S / 2 + S * .03, S * .46, S * .2), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(S * .02)).point(lambda v: 255 if v > 128 else 0).filter(ImageFilter.GaussianBlur(1.2))
    # painted texture: noise + the game's own band texture
    ta = np.zeros((S, S, 3), dtype=np.float32)
    rng = np.random.RandomState(7 if on else 9); nz = rng.normal(0, 9, (S, S, 1)); nz = np.asarray(Image.fromarray(np.clip(nz[..., 0] * 3 + 128, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2)), dtype=np.float32)[..., None] - 128
    base = np.clip(np.array(col, dtype=np.float32) + ta + nz * .7, 0, 255).astype(np.uint8)
    base = Image.fromarray(base)
    body = shade(mask, base, 1.05 if on else .9, S / 128)
    # inner facet: lighter inner star for the lit one
    inner = Image.new('L', (S, S), 0); ImageDraw.Draw(inner).polygon(star_poly(S / 2, S / 2 + S * .03, S * .30, S * .13), fill=255); inner = inner.filter(ImageFilter.GaussianBlur(S * .01))
    hi = Image.fromarray(np.clip(np.asarray(body, dtype=np.float32) * (1.18 if on else 1.08), 0, 255).astype(np.uint8))
    body = Image.composite(hi, body, inner.point(lambda v: int(v * .55)))
    # rim
    rim = ImageChops.subtract(mask, mask.filter(ImageFilter.MinFilter(int(S * .035) | 1)))
    rimc = Image.new('RGB', (S, S), tuple(int(c * .38) for c in col)); body = Image.composite(rimc, body, rim)
    out = body.convert('RGBA'); out.putalpha(mask)
    # soft glow behind lit star, small shadow behind both
    glow = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    gm = mask.filter(ImageFilter.GaussianBlur(S * (.05 if on else .025)))
    gc = (255, 220, 120) if on else (0, 0, 0)
    glow = Image.new('RGBA', (S, S), gc + (0,)); glow.putalpha(gm.point(lambda v: int(v * (.55 if on else .45))))
    canvas = Image.alpha_composite(glow, out)
    return canvas.resize((64, 64), Image.LANCZOS)

def make_banner(s, W=206, H=96, S=4):
    acc = mean_col(M(s, 'ui-button-go-c')); h, l, sat = 0, 0, 0
    # darken and saturate the game's accent into a cloth colour
    cloth = tuple(int(c * .62) for c in acc)
    mx = max(cloth); cloth = tuple(int(c + (c - sum(cloth) / 3) * .6) for c in cloth); cloth = tuple(max(0, min(255, c)) for c in cloth)
    w, h = W * S, H * S
    body = Image.new('L', (w, h), 0); d = ImageDraw.Draw(body)
    x0, x1 = 58 * S, (W - 58) * S; y0, y1 = 14 * S, (H - 14) * S
    d.rectangle([x0 - 8 * S, y0 + 2 * S, x1 + 8 * S, y1 - 2 * S], fill=255)
    # ribbon tails with swallow-tail notches
    for side in (0, 1):
        xa = 0 if side == 0 else W * S; xb = 62 * S if side == 0 else (W - 62) * S
        ya, yb = 24 * S, (H - 24) * S; nx = 22 * S if side == 0 else (W - 22) * S
        pts = [(xb, ya), (xa + (3 * S if side == 0 else -3 * S), ya + 2 * S), (nx, H * S / 2), (xa + (3 * S if side == 0 else -3 * S), yb - 2 * S), (xb, yb)]
        d.polygon(pts, fill=255)
    body = body.filter(ImageFilter.GaussianBlur(S * .6)).point(lambda v: 255 if v > 128 else 0).filter(ImageFilter.GaussianBlur(S * .5))
    rn = np.random.RandomState(3).normal(0, 1, (h, w)); ta = (np.asarray(Image.fromarray(np.clip(rn * 40 + 128, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(S * 1.2)), dtype=np.float32) - 128)[..., None] * .5
    # cloth weave
    yy, xx = np.mgrid[0:h, 0:w]; weave = (np.sin(xx / S * 2.3) * np.sin(yy / S * 2.3)) * 6
    base = np.clip(np.array(cloth, dtype=np.float32) + ta + weave[..., None], 0, 255)
    # fold shading: darker at left/right tails, vertical sheen on main
    fold = np.ones((h, w), dtype=np.float32)
    fold[:, :62 * S] *= .78; fold[:, (W - 62) * S:] *= .78
    sheen = 1 + .22 * np.cos((yy - h / 2) / h * math.pi * 1.1)
    base = np.clip(base * (fold * sheen)[..., None], 0, 255).astype(np.uint8)
    img = shade(body, Image.fromarray(base), 1.0, S)
    dr = ImageDraw.Draw(img)
    trim = tuple(min(255, int(c * 1.6 + 70)) for c in acc)
    for yy_ in (y0 + 5 * S, y1 - 5 * S):
        dr.line([(x0 - 2 * S, yy_), (x1 + 2 * S, yy_)], fill=trim, width=max(1, int(S * .9)))
    for xx_ in (x0 - 4 * S, x1 + 4 * S):
        dr.line([(xx_, y0 + 3 * S), (xx_, y1 - 3 * S)], fill=tuple(int(c * .45) for c in cloth), width=S * 2)
        dr.line([(xx_ + S, y0 + 3 * S), (xx_ + S, y1 - 3 * S)], fill=tuple(int(c * 1.3) for c in cloth), width=S)
    # outline darker rim
    rim = ImageChops.subtract(body, body.filter(ImageFilter.MinFilter(S * 2 + 1)))
    img = Image.composite(Image.new('RGB', (w, h), tuple(int(c * .3) for c in cloth)), img, rim)
    out = img.convert('RGBA'); out.putalpha(body)
    return out.resize((W, H), Image.LANCZOS)

def make_map(s, W=780, H=2200):
    src = M(s, MAPSRC[s]).convert('RGB')
    if src.width > src.height: src = src.transpose(Image.ROTATE_90)
    sc = W / src.width; src = src.resize((W, int(src.height * sc)), Image.LANCZOS)
    # drop the focal top/bottom 6% (frame edges) then mirror-stack with soft seams
    sh = src.height; strip = src.crop((0, int(sh * .04), W, int(sh * .96))); sh = strip.height
    flip = ImageOps_flip(strip)
    tiles = []; y = 0; k = 0; canvas = Image.new('RGB', (W, H + sh))
    ov = 120
    while y < H:
        t = strip if k % 2 == 0 else flip
        if k == 0: canvas.paste(t, (0, 0)); y = sh
        else:
            m = Image.linear_gradient('L').resize((W, ov)); region = canvas.crop((0, y - ov, W, y)); top = t.crop((0, 0, W, ov))
            canvas.paste(Image.composite(top, region, m), (0, y - ov)); canvas.paste(t.crop((0, ov, W, sh)), (0, y)); y += sh - ov
        k += 1
    out = canvas.crop((0, 0, W, H))
    out = out.filter(ImageFilter.GaussianBlur(1.6))
    # calm it so the road and medallions read: lower contrast, slight dark, vignette
    out = ImageEnhance.Contrast(out).enhance(.82); out = ImageEnhance.Color(out).enhance(.92)
    a = np.asarray(out, dtype=np.float32); mid = a.mean((0, 1)); a = (a - mid) * 1.0 + mid * .86
    yy, xx = np.mgrid[0:H, 0:W]; v = 1 - .38 * (((xx - W / 2) / (W / 2)) ** 2 * .7 + ((yy - H / 2) / (H / 2)) ** 4 * .5)
    a = np.clip(a * v[..., None], 0, 255)
    return Image.fromarray(a.astype(np.uint8))

def ImageOps_flip(im): return im.transpose(Image.FLIP_TOP_BOTTOM)

def main():
    for slug, d in GAMES.items():
        if len(sys.argv) > 1 and slug not in sys.argv[1:]: continue
        out = f'{ROOT}/games-src/free-library/{slug}'; os.makedirs(out, exist_ok=True)
        make_star(slug, True).save(f'{out}/ui-star-on.webp', quality=92, method=6)
        make_star(slug, False).save(f'{out}/ui-star-off.webp', quality=92, method=6)
        make_banner(slug).save(f'{out}/ui-act-banner-c.webp', quality=92, method=6)
        make_map(slug).save(f'{out}/story-map.webp', quality=82, method=6)
        print(slug, 'built')
if __name__ == '__main__': main()
