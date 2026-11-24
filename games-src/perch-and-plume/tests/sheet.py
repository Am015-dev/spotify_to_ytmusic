# Contact sheets: python3 tests/sheet.py -> proof/sheet-<before|after|lessons>-<size>.jpg (labelled thumbnails of the proof shots)
import glob, os
from PIL import Image, ImageDraw
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'proof')
def sheet(files, out, w=300):
    if not files: return
    ims = [Image.open(f).convert('RGB') for f in files]; h = int(w * ims[0].height / ims[0].width); cols = min(4, len(ims)); rows = (len(ims) + cols - 1) // cols
    S = Image.new('RGB', (cols * w, rows * (h + 22)), (24, 24, 24)); d = ImageDraw.Draw(S)
    for k, (f, im) in enumerate(zip(files, ims)):
        x, y = (k % cols) * w, (k // cols) * (h + 22); S.paste(im.resize((w, h)), (x, y + 22)); d.text((x + 6, y + 5), os.path.basename(f)[:46], fill=(255, 230, 160))
    S.save(os.path.join(D, out), quality=80); print(out, len(files))
for tag in ('before', 'after'):
    for size in ('402x874', '1366x768'):
        sheet(sorted(glob.glob(os.path.join(D, 'hud-%s-%s-*.jpg' % (tag, size)))), 'sheet-%s-%s.jpg' % (tag, size))
for size in ('402x874', '1366x768'):
    sheet(sorted(glob.glob(os.path.join(D, 'scn-%s-*.jpg' % size)), key=os.path.getmtime), 'sheet-lessons-%s.jpg' % size)
