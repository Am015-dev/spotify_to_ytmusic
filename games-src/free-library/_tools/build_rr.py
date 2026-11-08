import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib2 import *
OUT = '/home/user/spotify_to_ytmusic/games-src/free-library/redline-rally'
os.makedirs(OUT, exist_ok=True)
NAVY, ORG, CREAM = hexc('#1b2a41'), hexc('#e87722'), hexc('#f4e9cd')
rows = []
def gi_row(stem, name, flag='real'):
    a = IDX[name][1]
    rows.append((stem, f'game-icons.net {name}', 'CC BY 3.0 (author %s)' % a, 'https://game-icons.net/1x1/%s/%s.html' % (a, name), flag))
def mix(c, t, k): return tuple(int(c[i] * (1 - k) + t[i] * k) for i in range(3))
def checker(d, W, H, y0, y1, s=22):
    for y in range(y0, y1, s):
        for x in range(0, W, s):
            if ((x // s) + (y // s)) % 2 == 0: d.rectangle([x, y, x + s - 1, y + s - 1], fill=(250, 250, 250))
            else: d.rectangle([x, y, x + s - 1, y + s - 1], fill=(20, 24, 32))
def card(stem, name, c, size=330, gy=470):
    W, H = 500, 700
    g = Image.linear_gradient('L').resize((W, H))
    im = gradmap(g, [(0, mix(c, (255, 255, 255), .12)), (1, mix(c, (0, 0, 0), .62))]).convert('RGBA')
    # soft radial spot behind the picture
    y, x = np.ogrid[:H, :W]
    spot = np.clip(1 - np.sqrt(((x - W / 2) / 230) ** 2 + ((y - gy) / 230) ** 2), 0, 1) ** 1.5
    sp = Image.fromarray((spot * 110).astype(np.uint8))
    white = Image.new('RGBA', (W, H), (255, 255, 255, 0)); white.putalpha(sp); im.alpha_composite(white)
    paste_c(im, glyph(name, size, (255, 255, 255), mix(c, (255, 255, 255), .55)), W / 2, gy)
    d = ImageDraw.Draw(im); checker(d, W, H, 0, 22); checker(d, W, H, H - 22, H)
    d.rectangle([0, 0, W - 1, H - 1], outline=(250, 250, 250), width=6)
    d.rectangle([20, 44, W - 21, H - 45], outline=mix(c, (255, 255, 255), .6), width=3)
    save(im.convert('RGB'), f'{OUT}/{stem}.webp', 86); gi_row(stem, name)
SP = [('card-speed-1', 'traffic-cone', hexc('#2d8fd0')), ('card-speed-2', 'road', hexc('#2fa268')), ('card-speed-3', 'speedometer', hexc('#e5a21f')), ('card-speed-4', 'rocket-flight', hexc('#d9453b')),
      ('card-heat', 'fire', hexc('#c0392b')), ('card-stress', 'steering-wheel', hexc('#7a4fc0')),
      ('card-upgrade-coolant', 'snowflake-2', hexc('#2aa7c9')), ('card-upgrade-pit', 'mechanic-garage', hexc('#e87722')), ('card-upgrade-grip', 'tyre', hexc('#45505e')),
      ('card-upgrade-brakes', 'tire-iron-cross', hexc('#b8322e')), ('card-upgrade-rocket', 'rocket', hexc('#e5701f')), ('card-upgrade-tuned', 'cog', hexc('#1f9d8a'))]
for s, n, c in SP: card(s, n, c)
# card back
W, H = 500, 700
cb = Image.new('RGB', (W, H), NAVY); d = ImageDraw.Draw(cb)
for y in range(0, H, 50):
    for x in range(0, W, 50):
        if ((x // 50) + (y // 50)) % 2 == 0: d.rectangle([x, y, x + 49, y + 49], fill=mix(NAVY, (255, 255, 255), .07))
cb = cb.convert('RGBA'); paste_c(cb, glyph('checkered-flag', 270, CREAM, ORG), W / 2, H / 2)
d = ImageDraw.Draw(cb); checker(d, W, H, 0, 22); checker(d, W, H, H - 22, H); d.rectangle([0, 0, W - 1, H - 1], outline=(250, 250, 250), width=6); d.rectangle([20, 44, W - 21, H - 45], outline=ORG, width=3)
save(cb.convert('RGB'), f'{OUT}/card-back.webp', 86); gi_row('card-back', 'checkered-flag')
def icon(stem, name, c1, c2, w, h, size, shadow=True):
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); paste_c(im, glyph(name, size, c1, c2), w / 2, h / 2, shadow)
    save(im, f'{OUT}/{stem}.webp', 88); gi_row(stem, name)
icon('icon-heat', 'fire', (255, 215, 90), (240, 90, 40), 128, 128, 112); icon('icon-stress', 'lightning-flame' if 'lightning-flame' in IDX else 'lightning-arc', (215, 190, 255), (150, 100, 230), 128, 128, 112)
icon('icon-gear', 'gear-stick', (235, 240, 245), (150, 165, 180), 128, 128, 112); icon('icon-lap', 'stopwatch', (255, 240, 200), ORG, 128, 128, 112); icon('icon-place', 'podium', (255, 225, 120), (230, 150, 30), 128, 128, 112)
icon('ui-trophy', 'trophy-cup', (255, 235, 140), (230, 150, 25), 512, 512, 440); icon('ui-flag-checkered', 'checkered-flag', (250, 250, 250), (150, 160, 175), 512, 384, 360)
icon('fx-heat-flame', 'fire', (255, 235, 130), (235, 70, 30), 512, 384, 370); icon('fx-boost-flare', 'star-prominences', (255, 250, 190), (255, 190, 40), 512, 384, 370)
for st in ['bg-title', 'bg-podium', 'track-sunline', 'track-hairpin', 'car-crimson', 'car-azure', 'car-jade', 'car-amber', 'car-violet', 'car-graphite', 'portrait-kit', 'portrait-juno', 'portrait-dax', 'portrait-pia', 'portrait-oto', 'portrait-bex',
           'ui-gear-dial', 'ui-engine-tray', 'ui-corner-sign', 'fx-spinout-smoke', 'fx-slipstream-streaks']:
    rows.append((st, 'none (no CC0 top-down car/track/person source found; keep Kenney composite)', '-', '-', 'FALLBACK'))
with open(f'{OUT}/_MAP.tsv', 'w') as f:
    f.write('stem\tsource_file\tlicence\tsource_url\tflag\n')
    for r in rows: f.write('\t'.join(r) + '\n')
open(f'{OUT}/_CREDITS.md', 'w').write('''# Redline Rally temporary free library: credits

CC BY 3.0 (credit required): icons from game-icons.net, https://game-icons.net. Icons made by %s. Available on https://game-icons.net, licensed CC BY 3.0 (https://creativecommons.org/licenses/by/3.0/). Recoloured and framed by this library.

Per icon author and page: see _MAP.tsv. Slots flagged FALLBACK keep the earlier Kenney Racing Pack composites (CC0).
''' % ', '.join(sorted(set(USED.values()))))
fs = [s for s, *_ in SP] + ['card-back', 'icon-heat', 'icon-stress', 'icon-gear']
S = Image.new('RGB', (4 * 240, 4 * 240), (60, 60, 60))
for i, s in enumerate(fs[:16]):
    im = Image.open(f'{OUT}/{s}.webp').convert('RGBA'); im.thumbnail((236, 236))
    S.paste(im, ((i % 4) * 240 + 2, (i // 4) * 240 + 2), im)
S.save(f'{OUT}/_preview.webp', quality=70)
print('rr real', sum(r[4] == 'real' for r in rows), 'fallback', sum(r[4] != 'real' for r in rows), os.path.getsize(f'{OUT}/_preview.webp'))
