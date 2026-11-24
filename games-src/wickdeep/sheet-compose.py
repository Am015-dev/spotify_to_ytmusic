# Compose phone/pc contact sheets from sheet-shots.js output: python3 sheet-compose.py <shotdir> <out-prefix>; flags flat (blank) cells as BAD
import os, sys
from PIL import Image, ImageDraw, ImageStat
d, pre = sys.argv[1], sys.argv[2]
bad = 0
for tag, cols, tw in (('phone', 4, 201), ('pc', 3, 456)):
    fs = sorted(f for f in os.listdir(d) if f.startswith(tag + '-') and f.endswith('.png'))
    ims = [Image.open(os.path.join(d, f)).convert('RGB') for f in fs]
    th = int(ims[0].height * tw / ims[0].width); rows = (len(ims) + cols - 1) // cols
    sh = Image.new('RGB', (cols * (tw + 6), rows * (th + 24)), (20, 18, 24)); dr = ImageDraw.Draw(sh)
    for i, (f, im) in enumerate(zip(fs, ims)):
        x, y = (i % cols) * (tw + 6), (i // cols) * (th + 24)
        sh.paste(im.resize((tw, th)), (x, y + 20))
        flat = max(ImageStat.Stat(im).stddev) < 6; bad += flat
        dr.text((x + 2, y + 4), f[len(tag) + 1:-4] + (' BAD' if flat else ''), fill=(255, 80, 80) if flat else (230, 220, 200))
    sh.save(pre + '-' + tag + '.jpg', quality=82)
print('bad cells', bad)
