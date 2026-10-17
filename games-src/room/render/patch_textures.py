#!/usr/bin/env python3
"""Edits to CC0 textures before rendering (run after fetch.py). Paints the brand logo off the TV and makes a cream wall."""
from PIL import Image,ImageDraw
import numpy as np
src='assets/models/Television_01/textures/Television_01_diff_2k.jpg'
im=Image.open(src).convert('RGB');d=ImageDraw.Draw(im)
d.rectangle((763,1423,941,1454),fill=im.getpixel((960,1440)))      # front logo plate
d.rectangle((1022,1500,1068,1690),fill=im.getpixel((1040,1495)))   # side label
im.save(src.replace('.jpg','_nologo.jpg'),quality=95)
g=open('assets/models/Television_01/Television_01_2k.gltf').read().replace('Television_01_diff_2k.jpg','Television_01_diff_2k_nologo.jpg')
open('assets/models/Television_01/Television_01_2k_nologo.gltf','w').write(g)
a=np.asarray(Image.open('assets/tex/beige_wall_002/Diffuse.jpg').convert('RGB')).astype(float)
lum=a@np.array([.3,.59,.11]);out=np.array([238,229,208.])[None,None,:]*(1+0.55*((lum-lum.mean())/lum.mean()))[...,None]
Image.fromarray(np.clip(out,0,255).astype('uint8')).save('assets/tex/beige_wall_002/Diffuse_cream.jpg',quality=92)
