#!/usr/bin/env python3
"""Cut-out tool: picture on a flat background -> transparent webp, pose sets aligned to one canvas and one feet line.

Needs: pip install pillow numpy scipy

Backgrounds it understands (mode auto reads the picture's border):
  green    #00FF00 chroma key  -> soft key on chroma distance + despill + un-mix against the key colour
  magenta  #FF00FF chroma key  (for green subjects)
  white    older art on white or light grey: flood from the border (white inside the subject, eyes and highlights, stays),
           a thin soft band at the edge is un-mixed against the background so no white fringe remains
  #rrggbb  any other flat colour (--key)
A 1-px edge feather is applied last (--feather 0 turns it off).

Examples
  # one picture -> 512 px square, trimmed, centred
  python3 games-src/scripts/cutout.py boss.png --out out/ --size 512
  # a pose set: every file that shares the character name before the pose word gets ONE canvas and ONE feet line
  python3 games-src/scripts/cutout.py poses/voltusk-*.png --out out/ --size 512 --sheet
  # one picture holding 4 frames side by side
  python3 games-src/scripts/cutout.py sheet.jpg --crop 0,0,1920,180 --split 6x1 --out out/ --size 480

Pose sets: files named <character>-<pose>.<ext> (pose = idle, attack, atk1, hit, win, lose, walk, run, a-d, pose2 ...; change
with --group-regex) form a set. For a set the scale is the same for all poses (the largest pose fits the canvas), the feet
line (bottom of the figure) sits at --baseline of the canvas height, and the figure is centred on its feet (--align feet),
or keeps its source position (--align source, for frames that already share one camera). --align centre centres the bounding box.

Outputs (in --out): <name>.webp transparent (lossless-quality alpha), contact-sheet.png (checkerboard, canvas frame, feet line,
one row per set), and a printed report: background found, size, spill pixels left (green/magenta that survived), fringe pixels.
"""
import argparse, glob, os, re, sys
import numpy as np
from PIL import Image, ImageFilter, ImageDraw, ImageFont
from scipy import ndimage as ndi

POSE_RE = r'^(.*?)[-_](?:idle\d*|attack\d*|atk\d*|act\d*|hit\d*|hurt\d*|win\d*|lose\d*|lost\d*|walk\d*|run\d*|cheer\d*|talk\d*|sad\d*|defeat\d*|pose\d*|[a-d])$'


# ---------------------------------------------------------------- background detection
def border_pixels(a):
    h, w = a.shape[:2]
    t = max(2, min(h, w) // 100)
    return np.concatenate([a[:t].reshape(-1, 3), a[-t:].reshape(-1, 3), a[:, :t].reshape(-1, 3), a[:, -t:].reshape(-1, 3)])


def parse_key(s):
    s = s.lower()
    if s == 'green': return np.array([0, 255, 0], float), 'green'
    if s == 'magenta': return np.array([255, 0, 255], float), 'magenta'
    if s == 'white': return np.array([255, 255, 255], float), 'white'
    m = re.fullmatch(r'#?([0-9a-f]{6})', s)
    if not m: sys.exit(f'bad --key {s}')
    v = np.array([int(m[1][i:i + 2], 16) for i in (0, 2, 4)], float)
    return v, 'colour'


def detect(a, key):
    """Return (bg colour as measured from the border, kind). kind in green|magenta|white|colour."""
    bp = border_pixels(a).astype(float)
    med = np.median(bp, axis=0)
    if key != 'auto':
        k, kind = parse_key(key)
        # measure the real colour near the nominal key (the picture tool never hits #00FF00 exactly)
        near = bp[np.linalg.norm(bp - k, axis=1) < 140]
        return (np.median(near, axis=0) if len(near) > len(bp) * 0.2 else k), kind
    r, g, b = med
    if g > 150 and g - max(r, b) > 80: return med, 'green'
    if r > 150 and b > 150 and min(r, b) - g > 80: return med, 'magenta'
    if min(med) > 215: return med, 'white'
    return med, 'colour'


# ---------------------------------------------------------------- matting
def smoothstep(x):
    x = np.clip(x, 0, 1)
    return x * x * (3 - 2 * x)


def key_chroma(a, bg, kind, tol):
    """Alpha for a flat chroma background. Distance is measured in a chroma plane (brightness mostly ignored, so a shaded
    background still keys), soft between tol0 and tol1."""
    f = a.astype(float)
    def cc(x):  # chroma coordinates (BT.601 Cb, Cr)
        r, g, b = x[..., 0], x[..., 1], x[..., 2]
        return np.stack([(-0.169 * r - 0.331 * g + 0.5 * b), (0.5 * r - 0.419 * g - 0.081 * b)], -1)
    d = np.linalg.norm(cc(f) - cc(bg.reshape(1, 1, 3)), axis=-1)
    t0, t1 = tol * 0.35, tol          # inside t0 = background, beyond t1 = subject
    al = smoothstep((d - t0) / (t1 - t0))
    # very dark or very bright pixels have no reliable chroma: let the colour distance decide there
    lum = f.mean(-1)
    dc = np.linalg.norm(f - bg.reshape(1, 1, 3), axis=-1) / 441.0
    al = np.where(lum < 25, np.maximum(al, smoothstep((dc - 0.45) / 0.2)), al)
    return al


def key_flat(a, bg, tol, holes, hole_min):
    """White / light-grey / any flat colour: only regions that connect to the border (or, with holes, big enclosed gaps) are
    background, so white inside the subject survives. A soft band at the edge is un-mixed."""
    f = a.astype(float)
    dist = np.linalg.norm(f - bg.reshape(1, 1, 3), axis=-1)
    like = dist <= tol
    lab, n = ndi.label(like)
    h, w = like.shape
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    keep = np.isin(lab, list(edge)) if edge else np.zeros_like(like)
    if holes:
        sizes = ndi.sum(like, lab, index=np.arange(1, n + 1))
        big = [i + 1 for i, s in enumerate(sizes) if s >= hole_min]
        keep |= np.isin(lab, big)
    bgm = keep
    # soft band: pixels within 3 px of the background that are not themselves background are partly bg
    near = ndi.binary_dilation(bgm, iterations=3) & ~bgm
    inner = ndi.binary_erosion(~bgm, iterations=4)                        # solid subject
    alpha = np.where(bgm, 0.0, 1.0)
    if near.any():
        # how far is each band pixel from the background colour, relative to the colour of the nearest solid subject pixel
        idx = ndi.distance_transform_edt(~inner, return_distances=False, return_indices=True)
        fg = f[idx[0], idx[1]]                                            # nearest solid pixel colour
        num = np.linalg.norm(f - bg.reshape(1, 1, 3), axis=-1)
        den = np.maximum(np.linalg.norm(fg - bg.reshape(1, 1, 3), axis=-1), 1.0)
        soft = np.clip(num / den, 0, 1)
        soft = np.where(den < 30, 1.0, soft)                              # subject colour ~ background colour: cannot unmix, keep opaque
        alpha = np.where(near, np.maximum(soft, 0.0), alpha)
    return alpha, bgm


def despill(rgb, kind, alpha, band):
    """Pull key-coloured light out of the subject near its edge (everywhere inside `band`)."""
    f = rgb.astype(float)
    r, g, b = f[..., 0], f[..., 1], f[..., 2]
    if kind == 'green':
        ex = np.maximum(0, g - np.maximum(r, b))
        ex = np.where(band, ex, 0)
        f[..., 1] = g - ex
    elif kind == 'magenta':
        ex = np.maximum(0, np.minimum(r, b) - g)
        ex = np.where(band, ex, 0)
        f[..., 0] = r - ex
        f[..., 2] = b - ex
    return f


def unmix(rgb, alpha, bg):
    """Remove the background colour that leaked into half-covered pixels: pix = a*fg + (1-a)*bg."""
    f = rgb.astype(float)
    a = np.clip(alpha, 1e-3, 1)[..., None]
    out = (f - (1 - a) * bg.reshape(1, 1, 3)) / a
    part = ((alpha > 0.004) & (alpha < 0.996))[..., None]
    return np.where(part, np.clip(out, 0, 255), f)


def matte(img, key='auto', tol=None, holes=False, hole_min=900, feather=1.0, shrink=0):
    """PIL RGB/RGBA -> (RGBA PIL, info dict)."""
    a = np.array(img.convert('RGB'))
    bg, kind = detect(a, key)
    if kind in ('green', 'magenta'):
        alpha = key_chroma(a, bg, kind, tol or 60.0)
        bgm = alpha < 0.02
        if holes is False:
            # chroma gaps inside the subject are real background (key colour), nothing to protect
            pass
    else:
        alpha, bgm = key_flat(a, bg, tol or (28.0 if kind == 'white' else 34.0), holes, hole_min)
    # clean specks: tiny opaque islands and tiny holes
    solid = alpha > 0.5
    lab, n = ndi.label(solid)
    if n > 1:
        sizes = ndi.sum(solid, lab, index=np.arange(1, n + 1))
        small = [i + 1 for i, s in enumerate(sizes) if s < max(12, solid.size * 2e-5)]
        if small: alpha[np.isin(lab, small)] = 0
    if shrink: alpha = np.array(Image.fromarray((alpha * 255).astype('uint8')).filter(ImageFilter.MinFilter(2 * shrink + 1))) / 255.0
    band = ndi.binary_dilation(alpha < 0.98, iterations=3) & (alpha > 0)
    rgb = unmix(a, alpha, bg) if kind != 'colour' or True else a
    if kind in ('green', 'magenta'):
        rgb = despill(rgb, kind, alpha, band | (alpha < 0.98))
        # a second, global pass only on pixels that are still clearly key-coloured (spill from reflected light)
        rgb = despill(rgb, kind, alpha, np.ones_like(alpha, bool) & (ndi.binary_dilation(alpha < 0.5, iterations=6)))
    if feather > 0:
        al = Image.fromarray((np.clip(alpha, 0, 1) * 255).astype('uint8')).filter(ImageFilter.GaussianBlur(feather * 0.7))
        alpha = np.minimum(np.array(al) / 255.0, np.where(ndi.binary_dilation(alpha > 0.5, iterations=1), 1, 0))
        # keep the feather inside +-1 px of the original edge; interior stays 1
        alpha = np.where(ndi.binary_erosion(alpha > 0.99, iterations=1), 1.0, alpha)
    out = np.dstack([np.clip(rgb, 0, 255).astype('uint8'), (np.clip(alpha, 0, 1) * 255).astype('uint8')])
    return Image.fromarray(out, 'RGBA'), dict(kind=kind, bg=tuple(int(x) for x in bg))


# ---------------------------------------------------------------- layout
def bbox_of(im, thr=24):
    return im.getchannel('A').point(lambda v: 255 if v > thr else 0).getbbox()


def feet_x(im, bb):
    """Horizontal centre of the lowest 12% of the figure."""
    al = np.array(im.getchannel('A')) > 24
    x0, y0, x1, y1 = bb
    rows = max(2, int((y1 - y0) * 0.12))
    cols = np.where(al[y1 - rows:y1, x0:x1].any(0))[0]
    return x0 + (cols.mean() if len(cols) else (x1 - x0) / 2)


def layout(frames, W, H, baseline, pad, align):
    """frames: list of RGBA at source resolution. Returns list of RGBA on W x H canvases with one scale and one feet line."""
    bbs = [bbox_of(f) or (0, 0, f.width, f.height) for f in frames]
    if align == 'source':
        # one common crop in source coordinates; the relative placement of the poses is kept
        u = (min(b[0] for b in bbs), min(b[1] for b in bbs), max(b[2] for b in bbs), max(b[3] for b in bbs))
        uw, uh = u[2] - u[0], u[3] - u[1]
        sc = min(W * (1 - 2 * pad) / uw, H * (baseline - pad) / uh)
        out = []
        for f in frames:
            c = Image.new('RGBA', (W, H), (0, 0, 0, 0))
            r = f.crop(u).resize((max(1, round(uw * sc)), max(1, round(uh * sc))), Image.LANCZOS)
            c.alpha_composite(r, (round((W - r.width) / 2), round(H * baseline - r.height)))
            out.append(c)
        return out, sc
    fx = [feet_x(f, b) if align == 'feet' else (b[0] + b[2]) / 2 for f, b in zip(frames, bbs)]
    left = max(fx[i] - bbs[i][0] for i in range(len(frames)))      # widest extent left / right of the anchor, over all poses
    right = max(bbs[i][2] - fx[i] for i in range(len(frames)))
    up = max(b[3] - b[1] for b in bbs)
    sc = min(W * (1 - 2 * pad) / (2 * max(left, right)), H * (baseline - pad) / up)
    out = []
    for f, b, x in zip(frames, bbs, fx):
        r = f.resize((max(1, round(f.width * sc)), max(1, round(f.height * sc))), Image.LANCZOS)
        ox = round(W / 2 - x * sc)
        oy = round(H * baseline - b[3] * sc)
        c = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        c.alpha_composite(r, (max(ox, 0), max(oy, 0)), (max(-ox, 0), max(-oy, 0)))
        out.append(c)
    return out, sc


# ---------------------------------------------------------------- reporting
def spill_count(im):
    a = np.array(im).astype(int)
    m = a[..., 3] > 40
    g = (a[..., 1] - np.maximum(a[..., 0], a[..., 2]) > 40) & m
    mg = (np.minimum(a[..., 0], a[..., 2]) - a[..., 1] > 40) & m
    return int(g.sum()), int(mg.sum())


def checker(w, h, s=16, c1=(205, 205, 205), c2=(245, 245, 245)):
    yy, xx = np.mgrid[0:h, 0:w]
    m = ((yy // s + xx // s) % 2).astype(bool)
    a = np.where(m[..., None], np.array(c1), np.array(c2)).astype('uint8')
    return Image.fromarray(a).convert('RGBA')


def contact_sheet(rows, path, cell=200, baseline=None):
    """rows = [(label, [RGBA ...])]. Checkerboard cells, canvas frame, feet line."""
    cols = max(len(r[1]) for r in rows)
    lab = 18
    sheet = Image.new('RGBA', (cols * cell, len(rows) * (cell + lab)), (30, 30, 30, 255))
    d = ImageDraw.Draw(sheet)
    for ri, (label, ims) in enumerate(rows):
        y0 = ri * (cell + lab)
        d.text((4, y0 + 3), label, fill=(240, 240, 240, 255))
        for ci, im in enumerate(ims):
            t = im.resize((cell, cell), Image.LANCZOS) if im.size != (cell, cell) else im
            bgc = checker(cell, cell)
            bgc.alpha_composite(t)
            sheet.paste(bgc, (ci * cell, y0 + lab))
            d.rectangle([ci * cell, y0 + lab, ci * cell + cell - 1, y0 + lab + cell - 1], outline=(255, 90, 90, 255))
            if baseline:
                yy = y0 + lab + int(cell * baseline)
                d.line([ci * cell, yy, ci * cell + cell, yy], fill=(60, 140, 255, 255))
                d.line([ci * cell + cell // 2, y0 + lab, ci * cell + cell // 2, y0 + lab + cell], fill=(60, 140, 255, 90))
    sheet.convert('RGB').save(path)


# ---------------------------------------------------------------- main
def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('inputs', nargs='+', help='pictures (globs allowed)')
    ap.add_argument('--out', required=True)
    ap.add_argument('--size', default='512', help='canvas, N or WxH (default 512)')
    ap.add_argument('--key', default='auto', help='auto | green | magenta | white | #rrggbb')
    ap.add_argument('--tol', type=float, default=None, help='key tolerance (chroma 60 / flat 28)')
    ap.add_argument('--holes', action='store_true', help='also remove enclosed background gaps (between tentacles, inside a barrier arm)')
    ap.add_argument('--hole-min', type=int, default=900, help='smallest enclosed gap that --holes removes, px')
    ap.add_argument('--feather', type=float, default=1.0, help='edge feather in px (0 = hard)')
    ap.add_argument('--shrink', type=int, default=0, help='eat N px off the edge (white fringe left behind)')
    ap.add_argument('--baseline', type=float, default=0.94, help='feet line as a fraction of canvas height')
    ap.add_argument('--pad', type=float, default=0.04, help='margin as a fraction of the canvas')
    ap.add_argument('--align', choices=['feet', 'centre', 'source'], default='feet')
    ap.add_argument('--group-regex', default=POSE_RE, help='file stem -> character name in group 1; no match = its own set')
    ap.add_argument('--no-group', action='store_true', help='treat every file as its own set')
    ap.add_argument('--one-set', action='store_true', help='treat all inputs as ONE set (shared scale, centre and feet line)')
    ap.add_argument('--crop', default='', help='x0,y0,x1,y1: crop every input first (e.g. one band of a preview sheet)')
    ap.add_argument('--split', default='', help='CxR: cut each input into a grid of frames first (a frame sheet)')
    ap.add_argument('--sheet', action='store_true', help='(always on) kept for clarity')
    ap.add_argument('--ext', default='webp', choices=['webp', 'png'])
    a = ap.parse_args()

    W, H = (int(x) for x in (a.size.lower().split('x') * 2)[:2])
    files = []
    for p in a.inputs: files += sorted(glob.glob(p)) or [p]
    os.makedirs(a.out, exist_ok=True)
    sets = {}                                   # character -> [(name, RGBA at source size)]
    for f in files:
        stem = os.path.splitext(os.path.basename(f))[0]
        img = Image.open(f).convert('RGB')
        if a.crop: img = img.crop(tuple(int(x) for x in a.crop.split(',')))
        pieces = [(stem, img)]
        if a.split:
            c, r = (int(x) for x in a.split.lower().split('x'))
            fw, fh = img.width // c, img.height // r
            pieces = [(f'{stem}-{i + 1:02d}', img.crop(((i % c) * fw, (i // c) * fh, (i % c) * fw + fw, (i // c) * fh + fh))) for i in range(c * r)]
        for name, im in pieces:
            rgba, info = matte(im, a.key, a.tol, a.holes, a.hole_min, a.feather, a.shrink)
            m = None if a.no_group else re.match(a.group_regex, name)
            key = 'all' if a.one_set else (m.group(1) if m else name)
            sets.setdefault(key, []).append((name, rgba, info, f))
    rows, lines = [], []
    for key, items in sets.items():
        frames = [i[1] for i in items]
        laid, sc = layout(frames, W, H, a.baseline, a.pad, a.align)
        for (name, _, info, src), im in zip(items, laid):
            p = os.path.join(a.out, name + '.' + a.ext)
            if a.ext == 'webp': im.save(p, 'WEBP', quality=92, method=6, alpha_quality=100)
            else: im.save(p)
            g, mg = spill_count(im)
            bb = bbox_of(im)
            sp = {'green': f'  spill px {g}', 'magenta': f'  spill px {mg}'}.get(info['kind'], '')
            lines.append(f'{os.path.basename(src):34} -> {name + "." + a.ext:30} bg {info["kind"]:7} {info["bg"]}  feet y={bb[3] if bb else "-"}{sp}')
        rows.append((f'{key}  ({len(items)} pose{"s" if len(items) > 1 else ""}, scale {sc:.3f}, {a.align})', laid))
    contact_sheet(rows, os.path.join(a.out, 'contact-sheet.png'), cell=min(220, max(120, 1400 // max(len(r[1]) for r in rows))), baseline=a.baseline)
    print('\n'.join(lines))
    print(f'{sum(len(v) for v in sets.values())} picture(s) in {len(sets)} set(s) -> {a.out}  (contact-sheet.png)')


if __name__ == '__main__':
    main()
