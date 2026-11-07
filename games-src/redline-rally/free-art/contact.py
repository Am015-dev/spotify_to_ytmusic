#!/usr/bin/env python3
"""Contact sheet of every composed slot: python3 contact.py <dir> <out.webp> [stem-prefix ...]"""
import sys, glob, os
from PIL import Image, ImageDraw
d, out = sys.argv[1], sys.argv[2]; pre = sys.argv[3:]
fs = [f for f in sorted(glob.glob(d + '/*.webp')) if not pre or any(os.path.basename(f).startswith(p) for p in pre)]
cell = 220; cols = 8; rows = (len(fs) + cols - 1) // cols
sh = Image.new('RGB', (cols * cell, rows * (cell + 18)), (60, 66, 80)); dr = ImageDraw.Draw(sh)
for i, f in enumerate(fs):
    im = Image.open(f).convert('RGBA'); im.thumbnail((cell - 10, cell - 10)); x, y = (i % cols) * cell, (i // cols) * (cell + 18)
    bg = Image.new('RGBA', im.size, (200, 205, 215, 255)); bg.alpha_composite(im); sh.paste(bg.convert('RGB'), (x + 5 + (cell - 10 - im.width) // 2, y + 2))
    dr.text((x + 6, y + cell + 3), os.path.basename(f)[:-5], fill=(240, 240, 240))
sh.save(out, quality=88)
