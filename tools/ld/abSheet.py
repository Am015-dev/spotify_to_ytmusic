# tools/ld/abSheet.py <dir from ldAB.js> <out.png> : 4 rows × (LDraw truth | ours)
import sys
from PIL import Image, ImageDraw, ImageFont
D,out=sys.argv[1].rstrip('/')+'/',sys.argv[2];f=ImageFont.load_default(size=16);W=Image.new('RGB',(880,1224),'white');d=ImageDraw.Draw(W)
for i in range(4):
  for j,k in enumerate(['ldraw','ours']): W.paste(Image.open(f'{D}{i}_{k}.png'),(j*440,24+i*300))
d.text((8,4),'LDraw file (truth, LDrawLoader + official parts library)',fill='black',font=f);d.text((448,4),'ours (converted to garage parts)',fill='black',font=f);W.save(out);print('AB',out)
