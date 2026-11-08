"""Redline Rally: the 21 formerly-FALLBACK slots, rebuilt in the game-icons.net plate style."""
import sys, os, re, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib2 import *
OUT = '/home/user/spotify_to_ytmusic/games-src/free-library/redline-rally'
GUIDES = '/home/user/spotify_to_ytmusic/games-src/redline-rally/guides'
NAVY, ORG, CREAM = hexc('#1b2a41'), hexc('#e87722'), hexc('#f4e9cd')
rows = {}
def gi_row(stem, names):
    names = names if isinstance(names, list) else [names]
    rows[stem] = ('game-icons.net ' + ' + '.join(names), 'CC BY 3.0 (author %s)' % ' / '.join(dict.fromkeys(IDX[n][1] for n in names)),
                  ' ; '.join('https://game-icons.net/1x1/%s/%s.html' % (IDX[n][1], n) for n in names))
def plain_row(stem, what):
    rows[stem] = (what, '-', '-')
def mix(c, t, k): return tuple(int(c[i] * (1 - k) + t[i] * k) for i in range(3))
def checker(d, W, y0, y1, s=22, x0=0):
    for y in range(y0, y1, s):
        for x in range(x0, W, s):
            d.rectangle([x, y, x + s - 1, y + s - 1], fill=(250, 250, 250) if ((x // s) + (y // s)) % 2 == 0 else (20, 24, 32))
def plate(W, H, c, gy=None):
    g = Image.linear_gradient('L').resize((W, H))
    im = gradmap(g, [(0, mix(c, (255, 255, 255), .12)), (1, mix(c, (0, 0, 0), .62))]).convert('RGBA')
    gy = gy or H / 2
    y, x = np.ogrid[:H, :W]; R = min(W, H) * .46
    spot = np.clip(1 - np.sqrt(((x - W / 2) / R) ** 2 + ((y - gy) / R) ** 2), 0, 1) ** 1.5
    wh = Image.new('RGBA', (W, H), (255, 255, 255, 0)); wh.putalpha(Image.fromarray((spot * 110).astype(np.uint8))); im.alpha_composite(wh)
    return im
def frame(im, c, s=22):
    W, H = im.size; d = ImageDraw.Draw(im); checker(d, W, 0, s, s); checker(d, W, H - s, H, s)
    d.rectangle([0, 0, W - 1, H - 1], outline=(250, 250, 250), width=max(4, W // 90))
    d.rectangle([s - 2, s * 2, W - s + 1, H - s * 2 - 1], outline=mix(c, (255, 255, 255), .6), width=3)

# ---- cars
def car(stem, c):
    im = Image.new('RGBA', (256, 128), (0, 0, 0, 0))
    g = glyph('race-car', 236, mix(c, (255, 255, 255), .35), mix(c, (0, 0, 0), .25), shadow=False)
    ol = Image.new('RGBA', g.size, NAVY + (255,)); a = g.split()[3].filter(ImageFilter.MaxFilter(7)); ol.putalpha(a)
    big = Image.new('RGBA', (256, 128), (0, 0, 0, 0)); paste_c(big, ol, 128, 64, False); paste_c(big, g, 128, 64, True)
    save(big, f'{OUT}/{stem}.webp', 90); gi_row(stem, 'race-car')
for s, h in [('crimson', '#d9453b'), ('azure', '#2d8fd0'), ('jade', '#2fa268'), ('amber', '#e5a21f'), ('violet', '#8a5fd0'), ('graphite', '#7b8696')]: car('car-' + s, hexc(h))

# ---- portraits
def portrait(stem, name, c):
    W = H = 512; im = plate(W, H, c, 270)
    d = ImageDraw.Draw(im); disc = Image.new('RGBA', (W, H), (0, 0, 0, 0)); dd = ImageDraw.Draw(disc)
    dd.ellipse([256 - 190, 262 - 190, 256 + 190, 262 + 190], fill=mix(c, (255, 255, 255), .22) + (255,))
    dd.ellipse([256 - 190, 262 - 190, 256 + 190, 262 + 190], outline=CREAM + (255,), width=8)
    dd.ellipse([256 - 168, 262 - 168, 256 + 168, 262 + 168], outline=mix(c, (255, 255, 255), .6) + (255,), width=3)
    im.alpha_composite(disc)
    paste_c(im, glyph(name, 225, (255, 255, 255), mix(c, (255, 255, 255), .6)), 256, 262)
    frame(im, c, 22); save(im.convert('RGB'), f'{OUT}/{stem}.webp', 86); gi_row(stem, name)
for s, n, h in [('kit', 'full-motorcycle-helmet', '#2d8fd0'), ('juno', 'steampunk-goggles', '#2fa268'), ('dax', 'robot-helmet', '#d9453b'),
                ('pia', 'plane-pilot', '#7a4fc0'), ('oto', 'astronaut-helmet', '#2aa7c9'), ('bex', 'spartan-helmet', '#e87722')]: portrait('portrait-' + s, n, hexc(h))

# ---- tracks (drawn from the guide path so cars sit on the road)
def track(stem, tid, glyphname):
    s = open(f'{GUIDES}/track-{tid}.svg').read(); d = re.search(r'<path d="([^"]+)"', s).group(1)
    pts = [tuple(map(float, m)) for m in re.findall(r'[ML]\s*([\d.]+)[ ,]\s*([\d.]+)', d)]
    K = 1; W, H = 2000, 1200
    g = Image.linear_gradient('L').resize((W, H))
    im = gradmap(g, [(0, mix(NAVY, (255, 255, 255), .10)), (1, mix(NAVY, (0, 0, 0), .45))]).convert('RGBA')
    y, x = np.ogrid[:H, :W]; spot = np.clip(1 - np.sqrt(((x - 1000) / 900) ** 2 + ((y - 600) / 560) ** 2), 0, 1) ** 1.5
    wh = Image.new('RGBA', (W, H), (255, 255, 255, 0)); wh.putalpha(Image.fromarray((spot * 38).astype(np.uint8))); im.alpha_composite(wh)
    gl = glyph(glyphname, 520, (255, 255, 255), (255, 255, 255), shadow=False); gl.putalpha(gl.split()[3].point(lambda v: int(v * .10))); paste_c(im, gl, 1000, 600, False)
    def layer(w, col, dash=None):
        L = Image.new('RGBA', (W, H), (0, 0, 0, 0)); dr = ImageDraw.Draw(L)
        seq = pts + [pts[0]]
        if dash is None:
            dr.line(seq, fill=col + (255,), width=w, joint='curve')
            for p in pts: dr.ellipse([p[0] - w / 2, p[1] - w / 2, p[0] + w / 2, p[1] + w / 2], fill=col + (255,))
        else:  # dashed by arc length
            acc = 0; on = True; cur = [seq[0]]
            for a, b in zip(seq, seq[1:]):
                dl = math.dist(a, b)
                if dl == 0: continue
                t = 0
                while t < dl:
                    step = min(dl - t, dash[0 if on else 1] - acc)
                    p = (a[0] + (b[0] - a[0]) * (t + step) / dl, a[1] + (b[1] - a[1]) * (t + step) / dl)
                    if on: dr.line([cur[-1] if cur else p, p], fill=col + (255,), width=w)
                    cur = [p]; t += step; acc += step
                    if acc >= dash[0 if on else 1] - 1e-6: on = not on; acc = 0
        return L
    sh = layer(176, (0, 0, 0)).filter(ImageFilter.GaussianBlur(16)); sh.putalpha(sh.split()[3].point(lambda v: int(v * .55))); im.alpha_composite(sh)
    im.alpha_composite(layer(156, (250, 250, 250)))
    im.alpha_composite(layer(156, (200, 56, 44), (34, 34)).filter(ImageFilter.GaussianBlur(.6)))
    im.alpha_composite(layer(124, (50, 56, 66)))
    im.alpha_composite(layer(124, (50, 56, 66)))
    im.alpha_composite(layer(4, (240, 232, 205), (24, 28)))
    # start line, perpendicular at first point
    p0, p1 = pts[0], pts[3]; a = math.atan2(p1[1] - p0[1], p1[0] - p0[0]); sl = Image.new('RGBA', (W, H), (0, 0, 0, 0)); sd = ImageDraw.Draw(sl)
    for r in range(6):
        for c2 in range(2):
            cx0, cy0 = -9 + c2 * 9, -60 + r * 20
            co = [(cx0, cy0), (cx0 + 9, cy0), (cx0 + 9, cy0 + 20), (cx0, cy0 + 20)]
            sd.polygon([(p0[0] + u * math.cos(a) - v * math.sin(a), p0[1] + u * math.sin(a) + v * math.cos(a)) for u, v in co], fill=((250, 250, 250) if (r + c2) % 2 else (20, 24, 32)) + (255,))
    im.alpha_composite(sl)
    dd = ImageDraw.Draw(im); checker(dd, W, 0, 24, 24); checker(dd, W, H - 24, H, 24)
    dd.rectangle([0, 0, W - 1, H - 1], outline=(250, 250, 250), width=10)
    save(im.convert('RGB'), f'{OUT}/{stem}.webp', 86); gi_row(stem, glyphname)
track('track-sunline', 'sunline', 'road'); track('track-hairpin', 'hairpin', 'horizon-road')

# ---- backgrounds 1080x1920
def bg(stem, c, big, small, gy):
    W, H = 1080, 1920; im = plate(W, H, c, gy)
    ry = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(ry)
    for i in range(-6, 14):  # speed rays
        d.polygon([(W / 2, gy), (W / 2 + (i - 3) * 260 - 60, H), (W / 2 + (i - 3) * 260 + 60, H)], fill=(255, 255, 255, 14))
    im.alpha_composite(ry)
    gl = glyph(small, 980, (255, 255, 255), (255, 255, 255), shadow=False); gl.putalpha(gl.split()[3].point(lambda v: int(v * .09))); paste_c(im, gl, W / 2, gy, False)
    paste_c(im, glyph(big, 640, (255, 255, 255), mix(c, (255, 255, 255), .55)), W / 2, gy)
    d = ImageDraw.Draw(im); checker(d, W, 0, 54, 54); checker(d, W, H - 54, H, 54)
    for yy in (1260, 1320): d.rectangle([0, yy, W, yy + 6], fill=mix(c, (255, 255, 255), .6))
    d.rectangle([0, 0, W - 1, H - 1], outline=(250, 250, 250), width=14)
    save(im.convert('RGB'), f'{OUT}/{stem}.webp', 84); gi_row(stem, [big, small])
bg('bg-title', hexc('#d9531e'), 'race-car', 'steering-wheel', 760)
bg('bg-podium', hexc('#2f7fc0'), 'podium-winner', 'laurels-trophy', 800)

# ---- ui plates
def uiplate(stem, W, H, c):
    S = 2; im = Image.new('RGBA', (W * S, H * S), (0, 0, 0, 0))
    m = Image.new('L', (W * S, H * S), 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, W * S - 1, H * S - 1], radius=22 * S, fill=255)
    g = Image.linear_gradient('L').resize((W * S, H * S))
    body = gradmap(g, [(0, mix(c, (255, 255, 255), .16)), (1, mix(c, (0, 0, 0), .55))]).convert('RGBA'); body.putalpha(m); im.alpha_composite(body)
    d = ImageDraw.Draw(im); s = 10 * S
    inner = Image.new('L', im.size, 0); ImageDraw.Draw(inner).rounded_rectangle([0, 0, W * S - 1, H * S - 1], radius=22 * S, fill=255)
    st = Image.new('RGBA', im.size, (0, 0, 0, 0)); sd = ImageDraw.Draw(st)
    for x in range(0, W * S, s):
        sd.rectangle([x, 0, x + s - 1, s - 1], fill=((250, 250, 250) if (x // s) % 2 == 0 else (20, 24, 32, 255))); sd.rectangle([x, H * S - s, x + s - 1, H * S - 1], fill=((20, 24, 32, 255) if (x // s) % 2 == 0 else (250, 250, 250)))
    st.putalpha(Image.composite(st.split()[3], Image.new('L', im.size, 0), inner)); im.alpha_composite(st)
    d.rounded_rectangle([0, 0, W * S - 1, H * S - 1], radius=22 * S, outline=(250, 250, 250), width=4 * S)
    d.rounded_rectangle([16 * S, 16 * S, W * S - 17 * S, H * S - 17 * S], radius=12 * S, outline=mix(c, (255, 255, 255), .6), width=2 * S)
    save(im.resize((W, H), Image.LANCZOS), f'{OUT}/{stem}.webp', 90); plain_row(stem, 'procedural framed plate in the game palette (no external source)')
uiplate('ui-gear-dial', 512, 160, hexc('#2d6ab0')); uiplate('ui-engine-tray', 512, 192, hexc('#a03a2c'))
def corner():
    S = 4; N = 256 * S; im = Image.new('RGBA', (N, N), (0, 0, 0, 0)); d = ImageDraw.Draw(im); c = N / 2
    d.ellipse([0, 0, N - 1, N - 1], fill=NAVY + (255,))
    seg = 24
    for i in range(seg):
        d.pieslice([8 * S, 8 * S, N - 8 * S, N - 8 * S], i * 360 / seg, (i + 1) * 360 / seg, fill=(CREAM if i % 2 else ORG) + (255,))
    d.ellipse([34 * S, 34 * S, N - 34 * S, N - 34 * S], fill=NAVY + (255,)); d.ellipse([42 * S, 42 * S, N - 42 * S, N - 42 * S], fill=(250, 248, 240, 255))
    save(im.resize((256, 256), Image.LANCZOS), f'{OUT}/ui-corner-sign.webp', 90); plain_row('ui-corner-sign', 'procedural kerb-ring sign in the game palette (no external source)')
corner()

# ---- fx
def fx(stem, name, c1, c2, glow):
    im = Image.new('RGBA', (512, 384), (0, 0, 0, 0)); g = glyph(name, 340, c1, c2, shadow=False)
    pad = Image.new('L', (g.width + 80, g.height + 80), 0); pad.paste(g.split()[3], (40, 40))
    gl = Image.new('RGBA', pad.size, glow + (255,)); gl.putalpha(pad.filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.GaussianBlur(14)).point(lambda v: int(v * .7)))
    paste_c(im, gl, 256, 192, False); paste_c(im, g, 256, 192, True); save(im, f'{OUT}/{stem}.webp', 88); gi_row(stem, name)
fx('fx-spinout-smoke', 'smoke-bomb', (245, 245, 248), (150, 160, 175), (200, 210, 225)); fx('fx-slipstream-streaks', 'wind-slap', (255, 252, 205), (255, 205, 60), (255, 220, 90))

# ---- map + credits
lines = open(f'{OUT}/_MAP.tsv', encoding='utf-8').read().splitlines(); outl = [lines[0]]
for l in lines[1:]:
    p = l.split('\t')
    if p[0] in rows: r = rows[p[0]]; p = [p[0], r[0], r[1], r[2], 'real']
    outl.append('\t'.join(p))
open(f'{OUT}/_MAP.tsv', 'w', encoding='utf-8').write('\n'.join(outl) + '\n')
au = set()
for l in outl[1:]:
    m = re.search(r'author ([^)]+)\)', l.split('\t')[2])
    if m: au.update(a.strip() for a in m.group(1).split('/'))
open(f'{OUT}/_CREDITS.md', 'w').write('''# Redline Rally temporary free library: credits

CC BY 3.0 (credit required): icons from game-icons.net, https://game-icons.net. Icons made by %s. Available on https://game-icons.net, licensed CC BY 3.0 (https://creativecommons.org/licenses/by/3.0/). Recoloured and framed by this library.

Per icon author and page: see _MAP.tsv. Track plates, car plates, UI plates and the corner sign are drawn procedurally in the game palette around those icons.
''' % ', '.join(sorted(au)))
print('built', len(rows))
