import sys, os, glob
sys.path.insert(0, os.path.dirname(__file__))
from PIL import Image
slug = sys.argv[1]; d = '/home/user/spotify_to_ytmusic/games-src/free-library/' + slug
fs = [f for f in sorted(glob.glob(d + '/*.webp')) if not os.path.basename(f).startswith('_')]
n = min(16, len(fs)); step = len(fs) / n
pick = [fs[int(i * step)] for i in range(n)]
C = 240; s = Image.new('RGB', (C * 4, C * 4), (52, 48, 44))
for i, f in enumerate(pick):
    im = Image.open(f).convert('RGBA'); im.thumbnail((C - 8, C - 8))
    bg = Image.new('RGBA', (C, C), (52, 48, 44, 255)); bg.alpha_composite(im, ((C - im.width) // 2, (C - im.height) // 2))
    s.paste(bg.convert('RGB'), ((i % 4) * C, (i // 4) * C))
for q in (80, 70, 60, 50):
    s.save(d + '/_preview.webp', 'WEBP', quality=q)
    if os.path.getsize(d + '/_preview.webp') < 300000: break
