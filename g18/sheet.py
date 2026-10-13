# g18/sheet.py <dir> <out.jpg> <title>: contact sheet of every ride in <dir>/audit*.json: stage crop (left 540 px of the 852x393 shot) + card thumb,
# caption = type, id, floor gap (m, red if |gap| > 0.05), errors.
import sys, json, glob, os
from PIL import Image, ImageDraw, ImageFont
D, out, title = sys.argv[1:4]
R = []
for f in sorted(glob.glob(D + '/audit*.json')): R += [r for r in json.load(open(f)) if not r.get('miss')]
R.sort(key=lambda r: ({'car': 0, 'off': 1, 'boat': 2}[r['ty']], r['id']))
f = ImageFont.load_default(size=15); ft = ImageFont.load_default(size=24)
CW, CH, TW, cols = 360, 210, 112, 5; cell = (CW + TW + 8, CH + 22); rows = (len(R) + cols - 1) // cols
im = Image.new('RGB', (cols * cell[0], 40 + rows * cell[1]), (16, 18, 28)); d = ImageDraw.Draw(im); d.text((10, 8), title, fill=(255, 255, 255), font=ft)
for i, r in enumerate(R):
    x, y = (i % cols) * cell[0], 40 + (i // cols) * cell[1]; p = f"{D}/{r['ty']}_{r['id']}"
    if os.path.exists(p + '.png'):
        a = Image.open(p + '.png').convert('RGB').crop((72, 52, 552, 332)); a = a.resize((CW, CH)); im.paste(a, (x, y + 20))
    if os.path.exists(p + '_th.png'):
        t = Image.open(p + '_th.png').convert('RGB'); t.thumbnail((TW, CH)); im.paste(t, (x + CW + 2, y + 20))
    g = r.get('gap'); bad = g is None or abs(g) > .05 or r['errs']
    d.text((x + 4, y + 2), f"{r['ty']} {r['nm'][:24]}  gap {g}  err {len(r['errs'])}", fill=(255, 90, 80) if bad else (140, 230, 140), font=f)
im.save(out, quality=82); print('SHEET', out, im.size, len(R))
