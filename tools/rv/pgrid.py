# pgrid.py DIR OUTPREFIX "Title" [per=8]  → pairs <n>_L.jpg + <n>_P.jpg per tile, 2 cols
import sys,os,glob
from PIL import Image,ImageDraw,ImageFont
d,outp,title=sys.argv[1:4];per=int(sys.argv[4]) if len(sys.argv)>4 else 8
F=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",18)
names=sorted(set(os.path.basename(f)[:-6] for f in glob.glob(d+'/*_L.jpg') if os.path.exists(f[:-6]+'_P.jpg')))
TW,TH=852,393;PW=int(393*TH/852);W=TW+PW+6;LB=24
for k in range(0,len(names),per):
  ch=names[k:k+per];rows=(len(ch)+1)//2
  G=Image.new('RGB',(2*W+8,rows*(TH+LB+6)+34),(30,30,30));D=ImageDraw.Draw(G);D.text((6,6),title+f' ({k//per+1})',fill='white',font=F)
  for i,n in enumerate(ch):
    x=(i%2)*(W+8);y=34+(i//2)*(TH+LB+6)
    D.text((x+4,y+2),n,fill=(255,230,80),font=F)
    L=Image.open(f'{d}/{n}_L.jpg');G.paste(L.resize((TW,TH)),(x,y+LB))
    P=Image.open(f'{d}/{n}_P.jpg');G.paste(P.resize((PW,TH)),(x+TW+6,y+LB))
  G.save(f'{outp}_{k//per+1}.jpg',quality=80);print(f'{outp}_{k//per+1}.jpg')
