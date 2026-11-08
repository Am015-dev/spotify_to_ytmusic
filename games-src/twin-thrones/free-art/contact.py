#!/usr/bin/env python3
"""Contact sheets of the free-art pictures -> review/contact-*.webp. usage: python3 contact.py"""
import os, glob
from PIL import Image, ImageDraw
here = os.path.dirname(os.path.abspath(__file__)); os.makedirs(here + '/review', exist_ok=True)
def sheet(files, name, cols, cw, ch, bgc=(70, 84, 88)):
    rows = (len(files) + cols - 1) // cols; S = Image.new('RGB', (cols * (cw + 4), rows * (ch + 16)), bgc); d = ImageDraw.Draw(S)
    for i, f in enumerate(files):
        im = Image.open(f).convert('RGBA'); im.thumbnail((cw, ch)); x, y = (i % cols) * (cw + 4), (i // cols) * (ch + 16); S.paste(im, (x, y), im); d.text((x + 2, y + ch + 2), os.path.basename(f)[:-5][:24], fill=(255, 255, 255))
    S.save(f'{here}/review/{name}.webp', quality=80)
g = lambda *p: sorted(sum([glob.glob(f'{here}/{x}*.webp') for x in p], []))
sheet(g('a1-', 'a2-'), 'contact-cards-a1a2', 9, 118, 165)
sheet(g('a3-', 'g-', 'back-'), 'contact-cards-a3-guilds', 9, 118, 165)
sheet(g('w-'), 'contact-wonders', 4, 300, 215)
sheet(g('t-', 'res-', 'sci-', 'icon-', 'coin', 'military-pawn', 'fx-'), 'contact-tokens', 10, 120, 120)
sheet(g('title-bg', 'result-', 'table-bg', 'portrait-', 'military-board', 'city-board'), 'contact-scenes', 3, 480, 270)
