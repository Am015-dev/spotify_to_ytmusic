# side-by-side: reference (docs/shots/garage9/ref/<set>.jpg) | our render (<dir>/<id>.png) -> docs/shots/garage11/sbs/<id>.jpg
import sys,os
from PIL import Image,ImageDraw
D=sys.argv[1];O=sys.argv[2] if len(sys.argv)>2 else 'docs/shots/garage11/sbs'
T={'t_rosso':'76914','t_bianco':'76908','t_papaya':'76919','t_silver':'76917','t_patrol':'60312','t_viola':'60408','t_flame':'60408','t_racer':'31100','t_beast':'60402'}
os.makedirs(O,exist_ok=True)
for k,r in T.items():
  p=f'{D}/{k}.png'
  if not os.path.exists(p):continue
  a=Image.open(f'docs/shots/garage9/ref/{r}.jpg').convert('RGB');b=Image.open(p).convert('RGBA')
  H=400;a=a.resize((int(a.width*H/a.height),H));bg=Image.new('RGB',b.size,(255,255,255));bg.paste(b,mask=b.split()[3]);b=bg.resize((int(b.width*H/b.height),H))
  c=Image.new('RGB',(a.width+b.width+10,H+20),'white');c.paste(a,(0,20));c.paste(b,(a.width+10,20));d=ImageDraw.Draw(c)
  d.text((4,4),f'reference: set {r} (Brickset)',fill='black');d.text((a.width+14,4),f'ours: {k} (builder parts)',fill='black');c.save(f'{O}/{k}.jpg',quality=88)
