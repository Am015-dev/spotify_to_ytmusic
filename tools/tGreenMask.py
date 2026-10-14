# tGreenMask (art-3): paint the in-page flat-green blocks (LF.gm, from tLiveGo with GM=1) magenta over the shot. python3 tools/tGreenMask.py <png>
import sys,json;from PIL import Image,ImageDraw
f=sys.argv[1];im=Image.open(f).convert('RGB');d=ImageDraw.Draw(im);g=json.load(open(f+'.gm.json'))
for i in range(0,len(g),2):d.rectangle([g[i],g[i+1],g[i]+7,g[i+1]+7],fill=(255,0,255))
im.save(f.replace('.png','_gm.png'))
