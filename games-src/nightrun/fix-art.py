#!/usr/bin/env python3
"""Build-time alpha clean-up for painted art (run once after new art lands; idempotent).
- ly-phone-*.webp: trim the transparent bands, feather the alpha edge 1.5 px so the keyed strips have no hard crop line.
Every other painting is either a full-bleed scene shown inside a deliberate frame in the game (ship-*, boss-*), light-on-black drawn additively (fx-*),
or already has clean transparency (checked on a contact sheet over the dark game background)."""
import glob,os
from PIL import Image,ImageFilter
M=os.path.join(os.path.dirname(__file__),'../../games/mainhattan-nightrun/media')
for f in sorted(glob.glob(M+'/ly-phone-*.webp')):
    im=Image.open(f).convert('RGBA');bb=im.getbbox()
    if not bb:continue
    im=im.crop(bb);r,g,b,a=im.split()
    a2=a.filter(ImageFilter.GaussianBlur(1.5)).point(lambda v:min(255,int(v*1.25)) if v>0 else 0)
    a=Image.composite(a,a2,a.point(lambda v:255 if v>250 else 0)) if False else a2
    im.putalpha(a);im.save(f,'WEBP',quality=92,method=6);print(os.path.basename(f),im.size)
