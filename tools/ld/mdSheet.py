# tools/ld/mdSheet.py out.jpg title ref.jpg "caption" img1 "caption1" img2 "caption2" ... : side-by-side sheet
# Left column: the official LEGO image. Right: our shots (garage renders, 852×393 game shots), two per row.
import sys
from PIL import Image, ImageDraw, ImageFont
out, title, ref, rcap = sys.argv[1:5]; ours = list(zip(sys.argv[5::2], sys.argv[6::2]))
f = ImageFont.load_default(size=20); ft = ImageFont.load_default(size=26); H = 30; CW, CH = 852, 393; RW = 700; rows = (len(ours) + 1) // 2
im = Image.new('RGB', (RW + 6 + 2 * CW + 6, 44 + rows * (CH + H)), (16, 18, 28)); d = ImageDraw.Draw(im)
d.text((10, 8), title, fill=(255, 255, 255), font=ft)
a = Image.open(ref).convert('RGB'); s = min(RW / a.width, (rows * (CH + H) - H) / a.height); a = a.resize((round(a.width * s), round(a.height * s)))
im.paste(a, (0, 44 + H)); d.text((8, 44 + 5), rcap, fill=(200, 210, 230), font=f)
for i, (p, c) in enumerate(ours):
    b = Image.open(p).convert('RGB'); b.thumbnail((CW, CH)); x = RW + 6 + (i % 2) * (CW + 6); y = 44 + (i // 2) * (CH + H)
    im.paste(b, (x + (CW - b.width) // 2, y + H)); d.text((x + 8, y + 5), c, fill=(255, 210, 44), font=f)
im.save(out, quality=85); print('SHEET', out, im.size)
