# tools/txSheet.py out.jpg : 40468 comparison sheet. Left: box art + PDF final step. Right: our garage front / side / 3/4 rear + drive (852×393 shots).
import sys
from PIL import Image, ImageDraw, ImageFont
D='docs/shots/taxi40468/';out=sys.argv[1]
refs=[(D+'pdf/01.jpg','LEGO 40468 box art'),(D+'pdf/41.jpg','PDF final step (p.41)')]
ours=[(D+'s2/g_front.png','OURS garage · back (LDC-812, tail lights)'),(D+'s2/g_side.png','OURS garage · side'),(D+'s2/g_34rear.png','OURS garage · 3/4 rear'),(D+'s2/d_side_low.png','OURS drive · low side (gap 0.03 m)'),(D+'s2/d_drive.png','OURS drive · chase cam'),(D+'r1/box34.png','OURS model · box-art angle')]
f=ImageFont.load_default(size=20);H=30;CW,CH=852,393;RW=round(591*CH/393*1.0)
im=Image.new('RGB',(RW+6+2*CW+6,3*(CH+H)),(16,18,28));d=ImageDraw.Draw(im)
for i,(p,c) in enumerate(refs):
  a=Image.open(p).convert('RGB');s=min(RW/a.width,(1.5*(CH+H)-H)/a.height);a=a.resize((round(a.width*s),round(a.height*s)));y=round(i*1.5*(CH+H))
  im.paste(a,(0,y+H));d.text((8,y+5),c,fill=(200,210,230),font=f)
for i,(p,c) in enumerate(ours):
  a=Image.open(p).convert('RGB');a.thumbnail((CW,CH));x=RW+6+(i%2)*(CW+6);y=(i//2)*(CH+H)
  im.paste(a,(x,y+H));d.text((x+8,y+5),c,fill=(255,210,44),font=f)
im.save(out,quality=85);print('SHEET',out,im.size)
