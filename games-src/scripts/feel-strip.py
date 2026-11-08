#!/usr/bin/env python3
"""Join a game's 6 feel frames into one captioned strip (FEEL.md gate). Usage: feel-strip.py <frames.json> <out.png> [height=640]"""
import json, sys
from PIL import Image, ImageDraw, ImageFont
frames = json.load(open(sys.argv[1])); out = sys.argv[2]; H = int(sys.argv[3]) if len(sys.argv) > 3 else 640
ims = [Image.open(f).convert('RGB') for f, _ in frames]
ims = [im.resize((int(im.width * H / im.height), H), Image.LANCZOS) for im in ims]
cap = 34; W = sum(im.width for im in ims) + 8 * (len(ims) + 1)
strip = Image.new('RGB', (W, H + cap + 16), (24, 28, 22)); d = ImageDraw.Draw(strip)
try: font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 17)
except Exception: font = ImageFont.load_default()
x = 8
for i, (im, (_, tag)) in enumerate(zip(ims, frames)):
    strip.paste(im, (x, 8)); d.text((x + 4, H + 14), '%d. %s' % (i + 1, tag), fill=(255, 226, 138), font=font); x += im.width + 8
strip.save(out, optimize=True); print(out, strip.size)
