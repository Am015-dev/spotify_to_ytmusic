#!/usr/bin/env python3
"""PWA icons for Mainhattan Nightrun (B30). Crops the title art to a square and writes icons/icon-192.png, icon-512.png and icon-512-maskable.png
(the maskable one keeps the subject inside the central 80%). Run: python3 games-src/nightrun/make-pwa-icons.py"""
import os
from PIL import Image
G = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'games', 'mainhattan-nightrun'))
src = Image.open(os.path.join(G, 'media', 'title-phone.webp')).convert('RGB')
w, h = src.size; s = min(w, h)
sq = src.crop(((w - s) // 2, (h - s) // 2, (w - s) // 2 + s, (h - s) // 2 + s))
os.makedirs(os.path.join(G, 'icons'), exist_ok=True)
for n in (192, 512):
    sq.resize((n, n), Image.LANCZOS).save(os.path.join(G, 'icons', f'icon-{n}.png'), optimize=True)
bg = Image.new('RGB', (512, 512), (5, 3, 12)); inner = sq.resize((410, 410), Image.LANCZOS); bg.paste(inner, (51, 51))
bg.save(os.path.join(G, 'icons', 'icon-512-maskable.png'), optimize=True)
print('icons written')
