import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib2 import *
OUT = '/home/user/spotify_to_ytmusic/games-src/free-library/deep-signal'
os.makedirs(OUT, exist_ok=True)
NAVY, TEAL, GOLD, CORAL, VIO, KELP, BLUE = map(hexc, ['#071a2b', '#3fd0c9', '#f0b429', '#e0566f', '#9a7be8', '#47b377', '#4a95e6'])
def ramp(c):
    hi = tuple(min(255, int(v + (255 - v) * .72)) for v in c)
    return [(0, (6, 14, 24)), (.18, tuple(int(v * .25 + 8) for v in c)), (.55, c), (1, hi)]
PL = {'coral': 52, 'kelp': 138, 'tide': 34, 'amber': 144, 'sonar': 198}
COL = {'coral': CORAL, 'kelp': KELP, 'tide': BLUE, 'amber': GOLD, 'sonar': VIO}
rows = []
def real(stem, src, lic, url, flag='real'): rows.append((stem, src, lic, url, flag))
PD = 'Public domain (Haeckel, Kunstformen der Natur 1904, Internet Archive scan)'
PU = 'https://archive.org/details/kunstformenderna00haec'
def plate(n, box, size, c):
    return vignette(gradmap(crop_frac(page(n), box, size), ramp(c)))
def frame(im, c, w=10):
    d = ImageDraw.Draw(im); W, H = im.size
    d.rectangle([w // 2, w // 2, W - w // 2 - 1, H - w // 2 - 1], outline=c, width=w // 2)
    d.rectangle([w + 6, w + 6, W - w - 7, H - w - 7], outline=tuple(int(v * .6) for v in c), width=2)
    return im
BOX = (.10, .06, .90, .84)
for k, n in PL.items():
    save(frame(plate(n, BOX, (600, 900), COL[k]), COL[k]), f'{OUT}/card-{k}.webp')
    real(f'card-{k}', f'plate p{n}', PD, PU)
cb = plate(160, (.1, .1, .9, .8), (600, 900), TEAL); cb = Image.eval(cb, lambda v: int(v * .55))
save(frame(cb, GOLD), f'{OUT}/card-back.webp'); real('card-back', 'plate p160 dimmed', PD, PU)
tb = {'coral': (160, (.05, .10, .5, .45)), 'kelp': (226, (.5, .1, .95, .5)), 'tide': (186, (.05, .45, .5, .85)), 'amber': (152, (.5, .45, .95, .85))}
for k, (n, bx) in tb.items():
    im = plate(n, bx, (600, 900), COL[k]); im = Image.eval(im, lambda v: int(v * .8))
    save(frame(im, GOLD, 14), f'{OUT}/task-{k}.webp'); real(f'task-{k}', f'plate p{n} crop', PD, PU)
for st, n, bx, c in [('warden', 212, (.1, .12, .9, .62), GOLD), ('swarm', 160, (.1, .1, .9, .55), TEAL), ('source', 20, (.1, .1, .9, .6), VIO)]:
    save(frame(plate(n, bx, (768, 768), c), c, 12), f'{OUT}/boss-{st}.webp'); real(f'boss-{st}', f'plate p{n} crop', PD, PU)
def bg(stem, n, size, c, dim, box=(.05, .04, .95, .86)):
    im = plate(n, box, size, c); im = Image.eval(im, lambda v: int(v * dim)); save(im, f'{OUT}/{stem}.webp', 78); real(stem, f'plate p{n}', PD, PU)
bg('bg-title', 226, (1080, 1920), TEAL, .75); bg('bg-table', 152, (1080, 1920), BLUE, .42); bg('bg-map', 186, (1080, 1920), TEAL, .6)
bg('result-complete', 144, (1080, 1920), GOLD, .9); bg('result-lost', 34, (1080, 1920), (110, 130, 150), .5)
bg('banner-act1', 52, (1200, 400), TEAL, .8, (.05, .1, .95, .4)); bg('banner-act2', 212, (1200, 400), GOLD, .7, (.05, .12, .95, .4)); bg('banner-act3', 198, (1200, 400), VIO, .8, (.05, .1, .95, .4))
def gi_row(stem, name, flag='real'):
    a = IDX[name][1]
    real(stem, f'game-icons.net {name}', 'CC BY 3.0 (author %s)' % a, 'https://game-icons.net/1x1/%s/%s.html' % (a, name), flag)
def icon(stem, name, c1, c2=None, size=210, canvas=256):
    im = Image.new('RGBA', (canvas, canvas), (0, 0, 0, 0)); paste_c(im, glyph(name, size, c1, c2), canvas / 2, canvas / 2)
    save(im, f'{OUT}/{stem}.webp', 88); gi_row(stem, name)
L = lambda c: tuple(min(255, int(v + (255 - v) * .45)) for v in c)
icon('icon-flare', 'fire-bomb' if 'fire-bomb' in IDX else 'torch', (255, 120, 80), (255, 200, 90))
icon('icon-signal', 'radio-tower', L(TEAL), TEAL); icon('icon-trick', 'card-pickup', L(GOLD), GOLD)
icon('icon-deadzone', 'fog', (190, 205, 215), (130, 150, 165)); icon('icon-silence', 'silenced', (190, 205, 215), (130, 150, 165))
icon('icon-jammed', 'lightning-tree', L(CORAL), CORAL); icon('icon-decide', 'pointing', L(GOLD), GOLD)
icon('icon-share', 'card-exchange', L(GOLD), GOLD); icon('icon-notrick', 'thermometer-hot', L(CORAL), CORAL)
icon('icon-onetrick', 'card-play', L(GOLD), GOLD); icon('icon-sonar-goal', 'radar-cross-section', L(VIO), VIO)
icon('logo-emblem', 'diving-helmet', L(GOLD), GOLD, 460, 512); icon('token-signal', 'radio-tower', L(TEAL), TEAL); icon('token-captain', 'captain-hat-profile', L(GOLD), GOLD)
for st, nm, c in [('you', 'diving-helmet', TEAL), ('ines', 'captain-hat-profile', BLUE), ('bram', 'spanner', GOLD), ('kito', 'headphones', CORAL), ('odile', 'stethoscope', KELP), ('drone', 'robot-helmet', GOLD)]:
    g = Image.linear_gradient('L').resize((512, 512))
    im = gradmap(g, [(0, tuple(int(v * .25) for v in c)), (1, c)]).convert('RGBA')
    paste_c(im, glyph(nm, 320, (255, 255, 255), L(c)), 256, 262)
    save(im, f'{OUT}/portrait-{st}.webp'); gi_row(f'portrait-{st}', nm, 'FALLBACK')
for st in ['token-order', 'token-relative', 'token-final', 'stamp-complete', 'stamp-lost', 'fx-ping']:
    rows.append((st, 'none (no free source; keep existing)', '-', '-', 'FALLBACK'))
with open(f'{OUT}/_MAP.tsv', 'w') as f:
    f.write('stem\tsource_file\tlicence\tsource_url\tflag\n')
    for r in rows: f.write('\t'.join(r) + '\n')
au = sorted(set(USED.values()))
open(f'{OUT}/_CREDITS.md', 'w').write('''# Deep Signal temporary free library: credits

Public domain: plates from Ernst Haeckel, "Kunstformen der Natur" (1899-1904), scan on the Internet Archive (https://archive.org/details/kunstformenderna00haec). One gradient map per suit colour plus vignette applied here; captions cropped out.

CC BY 3.0 (credit required): icons from game-icons.net, https://game-icons.net. Icons made by %s. Available on https://game-icons.net, licensed CC BY 3.0 (https://creativecommons.org/licenses/by/3.0/). Recoloured by this library.

Per icon author and page: see _MAP.tsv.
''' % ', '.join(au))
fs = [r[0] for r in rows if r[4] == 'real'][:16]
fs = ['card-coral', 'card-kelp', 'card-tide', 'card-amber', 'card-sonar', 'card-back', 'task-coral', 'boss-warden', 'boss-swarm', 'boss-source', 'bg-title', 'bg-table', 'bg-map', 'icon-signal', 'icon-flare', 'logo-emblem']
S = Image.new('RGB', (4 * 240, 4 * 240), (30, 30, 30))
for i, s in enumerate(fs):
    im = Image.open(f'{OUT}/{s}.webp').convert('RGBA'); im.thumbnail((236, 236))
    S.paste(im, ((i % 4) * 240 + 2, (i // 4) * 240 + 2), im)
S.save(f'{OUT}/_preview.webp', quality=70)
print('ds real', sum(r[4] == 'real' for r in rows), 'fallback', sum(r[4] != 'real' for r in rows), 'size', os.path.getsize(f'{OUT}/_preview.webp'))
