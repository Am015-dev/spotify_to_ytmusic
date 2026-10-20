#!/usr/bin/env python3
"""Offline render step: renders the CC0 models (three.js, headless Chromium + SwiftShader) from one camera and writes
optimized WebP layers to games/room/. Usage: python3 make.py [back front sprites]  (default: all)"""
import json,subprocess,sys,os
from PIL import Image
W=1920;H=1200
OUT='../../../games/room/'
os.makedirs(OUT,exist_ok=True);os.makedirs('out',exist_ok=True)
def render(mode,name,layer,extra=''):
    png=f'out/{mode}-{name}.png'
    subprocess.run(['node','render.js',mode,png,str(W),layer,extra],check=True)
    return png,json.load(open(png.replace('.png','.json')))
def bbox_crop(im,pad=3):
    a=im.getchannel('A').point(lambda v:255 if v>6 else 0);b=a.getbbox()
    b=(max(0,b[0]-pad),max(0,b[1]-pad),min(im.width,b[2]+pad),min(im.height,b[3]+pad))
    return im.crop(b),b
meta={}
what=sys.argv[1:] or ['back','front','sprites']
for mode in ['day','night']:
    if 'back' in what:
        png,m=render(mode,'back','back');im=Image.open(png).convert('RGB')
        im.save(OUT+f'room-back-{mode}.webp',quality=80,method=6);meta['back']=m
    if 'front' in what:
        png,m=render(mode,'front','front','cry=-1.0');im=Image.open(png).convert('RGBA')
        meta['front']=m
    if 'sprites' in what and mode=='day':
        for nm in ['suitcase','plant']:
            png,m=render(mode,nm,'sprite','name='+nm);im=Image.open(png).convert('RGBA')
            c,b=bbox_crop(im);sc=min(1,520/c.width);c=c.resize((int(c.width*sc),int(c.height*sc)),Image.LANCZOS)
            c.save(OUT+f'{nm}.webp',quality=85,method=6,alpha_quality=85)
            m['crop_em']=[b[0]/W*144,b[1]/H*90,(b[2]-b[0])/W*144,(b[3]-b[1])/H*90];meta[nm]=m
json.dump(meta,open('out/meta-'+'-'.join(what)+'.json','w'),indent=1)
for f in sorted(os.listdir(OUT)):print(f,os.path.getsize(OUT+f)//1024,'KB')

def front_union():
    # one shared crop for the day and night front layers so they stay pixel-aligned
    ims={m:Image.open(f'out/{m}-front.png').convert('RGBA') for m in ['day','night']}
    bs=[bbox_crop(i)[1] for i in ims.values()];b=(min(x[0] for x in bs),min(x[1] for x in bs),max(x[2] for x in bs),max(x[3] for x in bs))
    for m,i in ims.items():i.crop(b).save(OUT+f'room-front-{m}.webp',quality=84,method=6,alpha_quality=82)
    em=[b[0]/W*144,b[1]/H*90,(b[2]-b[0])/W*144,(b[3]-b[1])/H*90];print('FRONT crop em',[round(x,3) for x in em]);json.dump(em,open('out/front-crop-em.json','w'))
if 'front' in what:front_union()
