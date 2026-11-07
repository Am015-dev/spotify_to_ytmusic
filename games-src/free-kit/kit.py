"""Free art kit: compose game pictures from CC0 material with PIL. No text is ever drawn.
Cache dir (env FREEKIT_CACHE, made by fetch.py + render.js): tex/*.jpg, x/<pack>/..., spr/<name>.png (rendered 3D animals)."""
import os, random, hashlib, math
from PIL import Image, ImageDraw, ImageFilter, ImageChops, ImageOps, ImageEnhance

C = os.environ.get('FREEKIT_CACHE', '/tmp/freekit-cache')
_cache = {}


def seed_of(s):
    return int(hashlib.md5(s.encode()).hexdigest()[:8], 16)


def hexrgb(h):
    h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def _open(path, mode='RGBA'):
    k = (path, mode)
    if k not in _cache: _cache[k] = Image.open(path).convert(mode)
    return _cache[k].copy()


# ---------------------------------------------------------------- sources
def tex(name, w, h, seed='', tint=None, k=0.0, bright=1.0):
    """Texture crop (random window of the 1k Poly Haven diffuse map), scaled to w x h, optionally tinted."""
    im = _open(f'{C}/tex/{name}.jpg', 'RGB')
    r = random.Random(seed_of(seed + name))
    s = max(w / 1024, h / 1024, 0.5)
    cw, ch = min(1024, int(w / s)), min(1024, int(h / s))
    x, y = r.randint(0, 1024 - cw), r.randint(0, 1024 - ch)
    im = im.crop((x, y, x + cw, y + ch)).resize((w, h), Image.LANCZOS)
    if bright != 1.0: im = ImageEnhance.Brightness(im).enhance(bright)
    if tint is not None and k > 0:
        im = Image.blend(im, ImageChops.multiply(im, Image.new('RGB', (w, h), tint)), k)
    return im


def _trim(im, pad=0.04):
    bb = im.getchannel('A').point(lambda a: 255 if a > 20 else 0).getbbox()
    if not bb: return im
    im = im.crop(bb)
    p = int(max(im.size) * pad)
    out = Image.new('RGBA', (im.width + 2 * p, im.height + 2 * p), (0, 0, 0, 0)); out.paste(im, (p, p)); return out


def animal(name, flip=False):
    """'bear' -> Kenney Round animal (CC0); 'q_red_fox' -> rendered Quaternius low-poly model (CC0)."""
    if name.startswith('q_'): im = _open(f'{C}/spr/{name[2:]}.png')
    else: im = _open(f'{C}/x/kenney_animal_redux/PNG/Round/{name}.png')
    im = _trim(im)
    return ImageOps.mirror(im) if flip else im


def glyph(name, color=(255, 255, 255)):
    """Kenney board-game icon (white glyph), tinted."""
    im = _open(f'{C}/x/kenney_icons/PNG/Double (128px)/{name}.png')
    a = im.getchannel('A'); out = Image.new('RGBA', im.size, color + (0,)); out.putalpha(a)
    return _trim(out, 0.06)


def carto(name):
    """Kenney cartography line art (dark ink, transparent)."""
    return _trim(_open(f'{C}/x/kenney_carto/PNG/Retina/{name}.png'), 0.02)


def piece(name):
    import glob
    return _trim(_open(glob.glob(f'{C}/x/kenney_boardgame/PNG/**/{name}.png', recursive=True)[0]))


def tint(im, rgb, k=0.7):
    """Recolour an RGBA sprite toward rgb keeping its shading (multiply on luminance)."""
    a = im.getchannel('A'); g = ImageOps.autocontrast(im.convert('L'), cutoff=1)
    col = ImageOps.colorize(g, (int(rgb[0] * .25), int(rgb[1] * .25), int(rgb[2] * .25)), tuple(min(255, int(c * 1.25)) for c in rgb), mid=rgb)
    out = Image.blend(im.convert('RGB'), col, k).convert('RGBA'); out.putalpha(a); return out


# ---------------------------------------------------------------- drawing helpers
def rgba(c, a=255): return tuple(c) + (a,)


def shade(c, f): return tuple(max(0, min(255, int(v * f))) for v in c)


def radial(w, h, inner, outer, cx=.5, cy=.45, power=1.0):
    """Radial gradient image (RGB)."""
    small = Image.new('RGB', (64, 64)); px = small.load()
    for y in range(64):
        for x in range(64):
            d = min(1.0, math.hypot((x / 63 - cx) * (w / max(w, h)) * 1.4, (y / 63 - cy) * (h / max(w, h)) * 1.4)) ** power
            px[x, y] = tuple(int(inner[i] * (1 - d) + outer[i] * d) for i in range(3))
    return small.resize((w, h), Image.BICUBIC)


def vgrad(w, h, top, bot):
    g = Image.linear_gradient('L').resize((w, h))
    return Image.composite(Image.new('RGB', (w, h), bot), Image.new('RGB', (w, h), top), g)


def fit(im, w, h, scale=1.0, dy=0.0):
    """Scale sprite to fit inside w*scale x h*scale; returns (img, pos offset center)."""
    s = min(w * scale / im.width, h * scale / im.height)
    return im.resize((max(1, int(im.width * s)), max(1, int(im.height * s))), Image.LANCZOS)


def put(canvas, sp, cx, cy, shadow=True, sh_alpha=110):
    """Paste RGBA sprite centred at (cx, cy) with a soft drop shadow."""
    x, y = int(cx - sp.width / 2), int(cy - sp.height / 2)
    if shadow:
        sh = Image.new('RGBA', sp.size, (0, 0, 0, 0)); sh.putalpha(sp.getchannel('A').point(lambda a: a * sh_alpha // 255))
        sh = sh.filter(ImageFilter.GaussianBlur(max(2, sp.width // 28)))
        canvas.alpha_composite(sh, (x + max(2, sp.width // 40), y + max(3, sp.height // 30))) if canvas.mode == 'RGBA' else canvas.paste(sh, (x + max(2, sp.width // 40), y + max(3, sp.height // 30)), sh)
    if canvas.mode == 'RGBA': canvas.alpha_composite(sp, (x, y))
    else: canvas.paste(sp, (x, y), sp)


def rounded_mask(w, h, r):
    m = Image.new('L', (w * 2, h * 2), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, w * 2 - 1, h * 2 - 1), r * 2, fill=255)
    return m.resize((w, h), Image.LANCZOS)


def finish(im, w, h, alpha=False):
    im = im.convert('RGBA' if alpha else 'RGB')
    if im.size != (w, h): im = im.resize((w, h), Image.LANCZOS)
    return im


def save_webp(im, path, limit=150_000):
    q = 82
    while True:
        im.save(path, 'WEBP', quality=q, method=6)
        if os.path.getsize(path) <= limit or q <= 35: break
        q -= 7
    return os.path.getsize(path)


# ---------------------------------------------------------------- composers
def card(w, h, subject, base_tex='rough_linen', base_tint=(235, 222, 195), stage=(120, 150, 110), band=None, badge=None,
         seed='', ground=None, flip=False, scale=0.78):
    """Card art: textured card stock, framed picture window with coloured vignette, subject sprite, optional type band + badge glyph."""
    cv = tex(base_tex, w, h, seed, tint=base_tint, k=0.75, bright=1.05).convert('RGBA')
    m = int(min(w, h) * 0.055)
    iw, ih = w - 2 * m, h - 2 * m - (int(h * 0.12) if band else 0)
    win = radial(iw, ih, shade(stage, 1.35), shade(stage, 0.55)).convert('RGBA')
    if ground:
        gt = tex(ground, iw, int(ih * 0.34), seed + 'g', tint=shade(stage, 1.1), k=0.55, bright=0.9).convert('RGBA')
        win.paste(gt, (0, ih - gt.height))
        fade = Image.linear_gradient('L').rotate(180).resize((iw, int(ih * 0.1))).point(lambda v: v)
        edge = Image.new('RGBA', (iw, fade.height), shade(stage, 0.8) + (0,)); edge.putalpha(fade.point(lambda v: v // 3)); win.alpha_composite(edge, (0, ih - gt.height - fade.height // 2))
    sp = subject() if callable(subject) else subject
    if sp is not None:
        sp = fit(sp, iw, ih, scale)
        put(win, sp, iw / 2, ih * (0.52 if not ground else 0.5), shadow=True)
    if badge is not None:
        b = fit(badge, iw, ih, 0.2); disc = Image.new('RGBA', (int(b.width * 1.7),) * 2, (0, 0, 0, 0))
        ImageDraw.Draw(disc).ellipse((0, 0, disc.width - 1, disc.height - 1), fill=rgba(shade(stage, 0.4), 215), outline=(255, 245, 220, 230), width=max(2, w // 150))
        disc.alpha_composite(b, ((disc.width - b.width) // 2, (disc.height - b.height) // 2))
        win.alpha_composite(disc, (int(iw * 0.04), int(ih * 0.04)))
    wm = rounded_mask(iw, ih, int(min(iw, ih) * 0.05))
    cv.paste(win, (m, m), wm)
    d = ImageDraw.Draw(cv)
    d.rounded_rectangle((m, m, m + iw - 1, m + ih - 1), int(min(iw, ih) * 0.05), outline=shade(base_tint, 0.45) + (255,), width=max(3, w // 110))
    if band:
        by = m + ih + int(m * 0.6); bh = h - m - by
        d.rounded_rectangle((m, by, w - m - 1, by + bh), int(bh * 0.35), fill=rgba(band), outline=shade(band, 0.55) + (255,), width=max(2, w // 160))
        d.rounded_rectangle((m + 4, by + 4, w - m - 5, by + bh // 2), int(bh * 0.3), fill=rgba(shade(band, 1.25), 70))
    d.rounded_rectangle((0, 0, w - 1, h - 1), int(min(w, h) * 0.06), outline=shade(base_tint, 0.4) + (255,), width=max(2, w // 120))
    out = Image.new('RGBA', (w, h), (0, 0, 0, 0)); out.paste(cv, (0, 0), rounded_mask(w, h, int(min(w, h) * 0.06)))
    return out.convert('RGB') if True else out


def scene(w, h, sky, ground_tex, horizon=0.58, props=(), seed='', dark_top=0.0, ground_tint=None, mid_tex=None, mid_tint=None, haze=None):
    """Title/background scene: sky gradient, far ridge from a rock texture, textured ground, props (cartography line art / sprites)."""
    r = random.Random(seed_of(seed))
    cv = vgrad(w, h, sky[0], sky[1]).convert('RGBA')
    hy = int(h * horizon)
    if mid_tex:
        mt = tex(mid_tex, w, int(h * 0.3), seed + 'm', tint=mid_tint, k=0.6, bright=0.85).convert('RGBA')
        mask = Image.new('L', (w, mt.height), 0); d = ImageDraw.Draw(mask); pts = [(0, mt.height)]
        y = mt.height * 0.55; step = max(10, w // 24)
        for x in range(0, w + step, step):
            y = max(mt.height * 0.12, min(mt.height * 0.85, y + r.uniform(-1, 1) * mt.height * 0.22)); pts.append((x, y))
        pts.append((w, mt.height)); d.polygon(pts, fill=255); mask = mask.filter(ImageFilter.GaussianBlur(1.5))
        cv.paste(mt, (0, hy - mt.height + int(h * 0.04)), mask)
        if haze:
            hz = Image.new('RGBA', (w, int(h * 0.12)), haze + (0,)); hz.putalpha(Image.linear_gradient('L').resize(hz.size).point(lambda v: v // 2)); cv.alpha_composite(hz, (0, hy - hz.height + int(h * 0.04)))
    gt = tex(ground_tex, w, h - hy, seed + 'g', tint=ground_tint, k=0.6 if ground_tint else 0, bright=0.95).convert('RGBA')
    cv.paste(gt, (0, hy))
    sh = Image.new('RGBA', (w, int(h * 0.06)), (0, 0, 0, 0)); sh.putalpha(Image.linear_gradient('L').rotate(180).resize(sh.size).point(lambda v: v // 2)); cv.alpha_composite(sh, (0, hy))
    for spec in props:
        sp, fx, fy, fh = spec[:4]
        sp = sp() if callable(sp) else sp
        s = fh * h / sp.height; sp = sp.resize((max(1, int(sp.width * s)), max(1, int(sp.height * s))), Image.LANCZOS)
        put(cv, sp, fx * w, fy * h, shadow=True, sh_alpha=90)
    if dark_top:
        ov = Image.new('RGBA', (w, h), (0, 0, 0, 0)); ov.putalpha(Image.linear_gradient('L').rotate(180).resize((w, h)).point(lambda v: int(v * dark_top))); cv.alpha_composite(ov)
    v = Image.new('RGBA', (w, h), (0, 0, 0, 0)); v.putalpha(radial(w, h, (0, 0, 0), (255, 255, 255), power=1.6).convert('L').point(lambda x: int(x * 0.38))); cv.alpha_composite(v)
    return cv.convert('RGB')


def ink(sp, rgb=(40, 28, 20), k=1.0):
    """Recolour dark line-art (cartography) to a given ink colour."""
    a = sp.getchannel('A'); out = Image.new('RGBA', sp.size, tuple(rgb) + (0,)); out.putalpha(a.point(lambda v: int(v * k))); return out


def portrait(w, h, subject, stage=(110, 140, 120), alpha=False, seed='', flip=False, ring=True, base_tex=None, scale=0.8):
    if alpha:
        cv = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    else:
        cv = radial(w, h, shade(stage, 1.4), shade(stage, 0.5)).convert('RGBA')
        if base_tex:
            t = tex(base_tex, w, h, seed, tint=stage, k=0.5, bright=0.9).convert('RGBA'); t.putalpha(70); cv.alpha_composite(t)
    sp = subject() if callable(subject) else subject
    sp = fit(sp, w, h, scale)
    put(cv, sp, w / 2, h * 0.53)
    if ring and not alpha:
        d = ImageDraw.Draw(cv); d.rectangle((0, 0, w - 1, h - 1), outline=shade(stage, 0.4) + (255,), width=max(3, w // 70))
    return cv if alpha else cv.convert('RGB')


def token(w, h, subject, color=(150, 120, 70), alpha=True, shape='disc', rim=(245, 235, 205), scale=0.64):
    """Round (or square) token: disc of colour with rim, subject on top; transparent outside."""
    S = 4; cv = Image.new('RGBA', (w * S, h * S), (0, 0, 0, 0)); d = ImageDraw.Draw(cv)
    m = int(min(w, h) * S * 0.05); box = (m, m, w * S - m, h * S - m)
    sh = Image.new('RGBA', cv.size, (0, 0, 0, 0)); ImageDraw.Draw(sh).ellipse((box[0] + m // 2, box[1] + m, box[2] + m // 2, box[3] + m), fill=(0, 0, 0, 100)); cv.alpha_composite(sh.filter(ImageFilter.GaussianBlur(S * 3)))
    if shape == 'disc':
        d.ellipse(box, fill=rgba(shade(color, 0.55))); i = int(min(w, h) * S * 0.03)
        d.ellipse((box[0] + i, box[1] + i, box[2] - i, box[3] - i), fill=rgba(color)); j = int(min(w, h) * S * 0.07)
        d.ellipse((box[0] + j, box[1] + j, box[2] - j, box[3] - j), outline=rgba(rim, 235), width=max(S, int(min(w, h) * S * 0.025)))
        hl = Image.new('RGBA', cv.size, (0, 0, 0, 0)); ImageDraw.Draw(hl).ellipse((box[0] + j * 2, box[1] + j * 1.6, box[2] - j * 2, (box[1] + box[3]) // 2), fill=(255, 255, 255, 38)); cv.alpha_composite(hl)
    else:
        r = int(min(w, h) * S * 0.16)
        d.rounded_rectangle(box, r, fill=rgba(shade(color, 0.55))); i = int(min(w, h) * S * 0.03)
        d.rounded_rectangle((box[0] + i, box[1] + i, box[2] - i, box[3] - i), r, fill=rgba(color), outline=rgba(rim, 235), width=max(S, int(min(w, h) * S * 0.025)))
    cv = cv.resize((w, h), Image.LANCZOS)
    sp = subject() if callable(subject) else subject
    if sp is not None:
        sp = fit(sp, w, h, scale); put(cv, sp, w / 2, h * 0.5, shadow=True, sh_alpha=90)
    return cv if alpha else cv.convert('RGB')


def glow(w, h, color=(255, 210, 120), kind='burst', seed=''):
    """FX: soft radial glow with star rays / ring, transparent background."""
    r = random.Random(seed_of(seed)); S = 2
    cv = Image.new('RGBA', (w * S, h * S), (0, 0, 0, 0)); d = ImageDraw.Draw(cv); cx, cy = w * S / 2, h * S / 2; R = min(w, h) * S / 2
    g = radial(w * S, h * S, color, (0, 0, 0), cx=.5, cy=.5, power=0.9).convert('L').point(lambda v: 255 - v)
    layer = Image.new('RGBA', cv.size, color + (0,)); layer.putalpha(g.point(lambda v: int(v * 0.85))); cv.alpha_composite(layer)
    if kind in ('burst', 'sparkle'):
        n = 8 if kind == 'burst' else 4
        for i in range(n):
            a = math.pi * 2 * i / n + r.uniform(-.1, .1); L = R * (0.95 if i % 2 == 0 else 0.6)
            d.polygon([(cx + math.cos(a) * L, cy + math.sin(a) * L), (cx + math.cos(a + .12) * R * .12, cy + math.sin(a + .12) * R * .12), (cx - math.cos(a) * R * .06, cy - math.sin(a) * R * .06), (cx + math.cos(a - .12) * R * .12, cy + math.sin(a - .12) * R * .12)], fill=(255, 255, 240, 235))
    if kind == 'ring':
        for k, a in ((0.85, 200), (0.62, 120), (0.4, 70)): d.ellipse((cx - R * k, cy - R * k, cx + R * k, cy + R * k), outline=(255, 255, 255, a), width=max(2, S * 3))
    if kind == 'smoke':
        for _ in range(14):
            x, y, rr = cx + r.uniform(-R * .5, R * .5), cy + r.uniform(-R * .4, R * .4), R * r.uniform(.15, .35)
            d.ellipse((x - rr, y - rr, x + rr, y + rr), fill=color + (90,))
        cv = cv.filter(ImageFilter.GaussianBlur(S * 4))
    return cv.resize((w, h), Image.LANCZOS)


def board_grid(w, h, base_tex, stage_tint, cols, rows, line=(30, 22, 15), seed='', inset=0.04, alt=None):
    """Textured board with a drawn cell grid (no text)."""
    cv = tex(base_tex, w, h, seed, tint=stage_tint, k=0.55 if stage_tint else 0).convert('RGBA')
    d = ImageDraw.Draw(cv, 'RGBA'); mx, my = int(w * inset), int(h * inset); gw, gh = w - 2 * mx, h - 2 * my
    for r_ in range(rows):
        for c_ in range(cols):
            x0, y0 = mx + gw * c_ / cols, my + gh * r_ / rows; x1, y1 = mx + gw * (c_ + 1) / cols, my + gh * (r_ + 1) / rows
            if alt and (r_ + c_) % 2: d.rectangle((x0, y0, x1, y1), fill=alt + (70,))
            d.rectangle((x0, y0, x1, y1), outline=line + (170,), width=max(2, w // 300))
    d.rectangle((mx, my, w - mx, h - my), outline=line + (255,), width=max(3, w // 200))
    return cv.convert('RGB')


# ---------------------------------------------------------------- runner
def run(game, slots, recipe, outdir, sheet=None, only=None):
    """slots: list of asset dicts; recipe(item)->(PIL image, [credit keys]). Saves <stem>.webp, writes sheet PNG."""
    os.makedirs(outdir, exist_ok=True); tot = 0; used = {}; made = []
    for it in slots:
        if only and it['stem'] not in only: continue
        im, cr = recipe(it)
        im = finish(im, it['w'], it['h'], it['alpha'])
        p = f"{outdir}/{it['stem']}.webp"; tot += save_webp(im, p)
        for c in cr: used.setdefault(c, []).append(it['stem'])
        made.append((it, im))
    if sheet: contact_sheet(made, sheet)
    print(f'{game}: {len(made)}/{len(slots)} slots, {tot / 1e6:.2f} MB')
    return used, tot


def contact_sheet(made, path, cell=150, cols=14):
    from PIL import ImageFont
    rows = (len(made) + cols - 1) // cols
    W = Image.new('RGB', (cols * cell, rows * (cell + 14)), (70, 74, 80)); d = ImageDraw.Draw(W)
    for i, (it, im) in enumerate(made):
        t = im.copy().convert('RGBA'); t.thumbnail((cell - 6, cell - 6))
        x, y = (i % cols) * cell, (i // cols) * (cell + 14)
        W.paste(t, (x + 3 + (cell - 6 - t.width) // 2, y + 3), t); d.text((x + 3, y + cell), it['stem'][:22], fill=(230, 230, 230))
    W.save(path)


CREDIT_SRC = {
    'polyhaven': ('Poly Haven textures (diffuse maps, 1k)', 'Poly Haven contributors (see per-texture page)', 'CC0 1.0', 'https://polyhaven.com/textures'),
    'kenney-animals': ('Kenney Animal Pack Redux', 'Kenney', 'CC0 1.0', 'https://opengameart.org/content/animal-pack-redux'),
    'kenney-icons': ('Kenney Board Game Icons', 'Kenney', 'CC0 1.0', 'https://opengameart.org/content/board-game-icons'),
    'kenney-carto': ('Kenney Cartography Pack', 'Kenney', 'CC0 1.0', 'https://opengameart.org/content/cartography-pack'),
    'kenney-board': ('Kenney Boardgame Pack', 'Kenney', 'CC0 1.0', 'https://opengameart.org/content/boardgame-pack'),
    'kenney-cards': ('Kenney Playing Cards Pack', 'Kenney', 'CC0 1.0', 'https://opengameart.org/content/playing-cards-pack'),
    'kenney-borders': ('Kenney Fantasy UI Borders', 'Kenney', 'CC0 1.0', 'https://opengameart.org/content/fantasy-ui-borders'),
    'quaternius': ('Quaternius low-poly animals (OBJ rendered to 2D with three.js, recoloured)', 'Quaternius', 'CC0 1.0', 'https://opengameart.org/content/5-low-poly-animals'),
    'quaternius-farm': ('Quaternius Farm Animals (rendered to 2D)', 'Quaternius', 'CC0 1.0', 'https://opengameart.org/content/lowpoly-animated-farm-animal-pack'),
}


def write_credits(path, game, used, textures):
    L = [f'# Free art credits: {game}', '', 'All pictures in this folder are composed by `compose.py` from CC0 material (no attribution required; logged anyway).',
         'No picture contains text. No publisher, designer or original-game name or logo is used.', '', '## Sources used', '',
         '| Source | Author | Licence | URL | Files |', '|---|---|---|---|---|']
    for k, stems in sorted(used.items()):
        n, a, l, u = CREDIT_SRC[k]
        L.append(f'| {n} | {a} | {l} | {u} | {len(set(stems))} |')
    L += ['', '## Poly Haven textures used (CC0, https://polyhaven.com/a/<name>)', '', ', '.join(sorted(textures)), '', '## Per file', '', '| File | Sources |', '|---|---|']
    per = {}
    for k, stems in used.items():
        for s in stems: per.setdefault(s, set()).add(k)
    for s in sorted(per): L.append(f'| {s}.webp | {", ".join(sorted(per[s]))} |')
    open(path, 'w').write('\n'.join(L) + '\n')


INSTALL = '''#!/usr/bin/env python3
"""Copy the free-kit pictures into games/{slug}/media/ by stem.
Never overwrites a file the owner delivered (any existing <stem>.webp/.png/.jpg) unless --force.
Usage: python3 install.py [--force] [--dry]"""
import os, sys, shutil, glob
here = os.path.dirname(os.path.abspath(__file__))
media = os.path.normpath(os.path.join(here, '..', '..', '..', 'games', '{slug}', 'media'))
force, dry = '--force' in sys.argv, '--dry' in sys.argv
os.makedirs(media, exist_ok=True)
n = skip = 0
for f in sorted(glob.glob(os.path.join(here, '*.webp'))):
    stem = os.path.basename(f)[:-5]
    have = [e for e in ('webp', 'png', 'jpg', 'jpeg') if os.path.exists(os.path.join(media, stem + '.' + e))]
    if have and not force:
        skip += 1; continue
    if not dry: shutil.copyfile(f, os.path.join(media, stem + '.webp'))
    n += 1
print(f'SLUGNAME: installed {n}, kept {skip} existing (owner or earlier art)')
'''


def write_install(path, slug):
    open(path, 'w').write(INSTALL.replace('{slug}', slug).replace('SLUGNAME', slug)); os.chmod(path, 0o755)
