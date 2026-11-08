#!/usr/bin/env python3
"""Contact sheet of every file this pipeline writes -> ../review/contact-v2.webp"""
import os
from PIL import Image, ImageDraw
H = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = ['bear', 'elk', 'salmon', 'hawk', 'fox']; T = ['forest', 'peak', 'meadow', 'marsh', 'river']
W = 1800; sheet = Image.new('RGB', (W, 1500), (46, 40, 34)); d = ImageDraw.Draw(sheet)
def put(f, x, y, w, h=None):
    p = os.path.join(H, f + '.webp')
    if not os.path.exists(p): return
    im = Image.open(p).convert('RGBA'); im = im.resize((w, h or int(im.height * w / im.width)), Image.LANCZOS)
    sheet.paste(im, (x, y), im)
d.text((20, 8), 'terrain (512, shown 260)  |  tokens (shown 150 and 40)', fill=(230, 220, 200))
for i, t in enumerate(T): put('ter-' + t, 20 + i * 270, 28, 260)
for i, a in enumerate(A): put('tok-' + a, 20 + i * 190, 310, 150); put('tok-' + a, 20 + i * 190 + 100, 480, 40)
d.text((1000, 310), 'table-bg (shown 760 wide)', fill=(230, 220, 200)); put('table-bg', 1000, 330, 760, 430)
d.text((20, 540), 'cards a-d', fill=(230, 220, 200))
cw = 170; ch = 238
for i, a in enumerate(A):
    for j, s in enumerate('abcd'):
        put(f'card-{a}-{s}', 20 + (i * 4 + j) % 10 * (cw + 6), 560 + ((i * 4 + j) // 10) * (ch + 6), cw, ch)
os.makedirs(os.path.join(H, 'review'), exist_ok=True)
sheet.crop((0, 0, W, 1060)).save(os.path.join(H, 'review', 'contact-v2.webp'), quality=84, method=6)
print('pass contact')
