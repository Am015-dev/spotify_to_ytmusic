import sys,glob,os
from PIL import Image,ImageDraw
D=sys.argv[1];out=sys.argv[2];fs=sorted(glob.glob(D+'/*.png'));W,H=320,200;n=len(fs);cols=3;rows=(n+cols-1)//cols
c=Image.new('RGB',(W*cols,H*rows),'white');d=ImageDraw.Draw(c)
for i,f in enumerate(fs):
  b=Image.open(f).convert('RGBA');bg=Image.new('RGB',b.size,(235,240,245));bg.paste(b,mask=b.split()[3]);bg=bg.resize((W,H));c.paste(bg,((i%cols)*W,(i//cols)*H));d.text(((i%cols)*W+4,(i//cols)*H+4),os.path.basename(f),fill='black')
c.save(out)
