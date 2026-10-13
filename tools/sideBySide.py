# sideBySide: our 852×393 shot next to the LEGO 2K Drive reference frame (same height), labelled. usage: python3 tools/sideBySide.py out.jpg ours.jpg ref.jpg "caption"
import sys
from PIL import Image, ImageDraw, ImageFont
out, ours, ref, cap = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4] if len(sys.argv) > 4 else ''
a = Image.open(ours).convert('RGB'); a = a.resize((852, round(852 * a.height / a.width)))
b = Image.open(ref).convert('RGB'); b = b.resize((round(b.width * a.height / b.height), a.height))
H = 30; im = Image.new('RGB', (a.width + b.width + 6, a.height + H), (16, 18, 28))
im.paste(a, (0, H)); im.paste(b, (a.width + 6, H)); d = ImageDraw.Draw(im); f = ImageFont.load_default(size=18)
d.text((8, 5), 'OURS · ' + cap, fill=(255, 210, 44), font=f); d.text((a.width + 14, 5), 'LEGO 2K Drive (reference)', fill=(200, 210, 230), font=f)
im.save(out, quality=82)
