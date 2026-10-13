#!/usr/bin/env python3
# Shot contact sheet: grid.py OUT.jpg "Title" file1 [file2 ...]  (label = file name; "label=path" overrides)
import sys, os
from PIL import Image, ImageDraw, ImageFont
out, title, items = sys.argv[1], sys.argv[2], sys.argv[3:]
TW, TH, LB, COLS, PAD = 640, 295, 34, 3, 8
def font(sz):
    for f in ("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", "/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf"):
        if os.path.exists(f): return ImageFont.truetype(f, sz)
    return ImageFont.load_default()
F, FT = font(20), font(30)
tiles = []
for it in items:
    lab, p = it.split("=", 1) if "=" in it and not os.path.exists(it) else (os.path.splitext(os.path.basename(it))[0], it)
    im = Image.open(p).convert("RGB"); im.thumbnail((TW, TH))
    t = Image.new("RGB", (TW, TH + LB), (24, 24, 28)); t.paste(im, ((TW - im.width) // 2, LB + (TH - im.height) // 2))
    ImageDraw.Draw(t).text((10, 6), f"{len(tiles)+1}. {lab}", fill=(255, 220, 60), font=F)
    tiles.append(t)
rows = (len(tiles) + COLS - 1) // COLS; HDR = 50
W = COLS * (TW + PAD) + PAD; H = HDR + rows * (TH + LB + PAD) + PAD
g = Image.new("RGB", (W, H), (10, 10, 12)); ImageDraw.Draw(g).text((PAD + 4, 10), title, fill=(255, 255, 255), font=FT)
for i, t in enumerate(tiles):
    g.paste(t, (PAD + (i % COLS) * (TW + PAD), HDR + PAD + (i // COLS) * (TH + LB + PAD)))
g.save(out, quality=85); print(out, g.size, len(tiles), "shots")
