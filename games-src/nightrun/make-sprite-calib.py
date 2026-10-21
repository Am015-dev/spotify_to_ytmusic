# Writes sprite-calib.json: how each strip sheet maps onto the size/spot of the still it replaces (read by build.py, bundled into ANIM.c).
#  bosses: bw = body width in sheet px (idle frames), gap = empty rows under the body in the idle frame; the body is drawn as wide as the still was.
#  ships:  k = scale (world units per sheet px) so ship + flame spans the old ship + jet; ox, oy = where the frame centre goes so the nose sits where the still's nose was.
import json,os
from PIL import Image
R='/home/user/spotify_to_ytmusic/'
S=R+'games-src/anims/mainhattan-nightrun/sheets/'; M=R+'games/mainhattan-nightrun/media/'
BOSS=['sek-adler','flusskrake','zentral-ice','kronos','bruecken-waechter','schranken-wart','talos','hoplite','tresor-wart','messe-waechter']
SHIP=['std','tri','hv','ec','swg','syn','drift','lancer','nova']
def frames(who,act):
    j=json.load(open(S+'%s/%s-strip.json'%(who,act)));im=Image.open(S+'%s/%s-strip.webp'%(who,act)).convert('RGBA');a=im.getchannel('A')
    return j,[a.crop((i*j['w'],0,(i+1)*j['w'],j['h'])) for i in range(j['frames'])]
c={}
for n in BOSS:
    j,fr=frames('boss-'+n,'idle');bb=[f.point(lambda v:255 if v>16 else 0).getbbox() for f in fr]
    c['boss-'+n]={'bw':round(sum(b[2]-b[0] for b in bb)/len(bb),1),'gap':round(sum(j['h']-b[3] for b in bb)/len(bb),1)}
for n in SHIP:
    j,fr=frames('ship-'+n,'flame');b=fr[0].point(lambda v:255 if v>128 else 0).getbbox()
    st=Image.open(M+'spr-ship-%s.webp'%n);hull=60*st.height/st.width
    bw,bh=b[2]-b[0],b[3]-b[1];k=min(92/bw,1.5*hull/bh)
    c['ship-'+n]={'k':round(k,4),'ox':round(30-(b[2]-j['w']/2)*k,2),'oy':round(-((b[1]+b[3])/2-j['h']/2)*k,2)}
#  weapon fx, explosions, small fx, pickups (media/anim/wpn-*, fx-*, pk-*): bw = mean content width in sheet px (alpha > 48), so the content is drawn as wide as the still it replaces
for who in sorted(os.listdir(M+'anim')):
    if not who.startswith(('wpn-','fx-','pk-')):continue
    for f in sorted(os.listdir(M+'anim/'+who)):
        if not f.endswith('-strip.webp'):continue
        act=f[:-11];j,fr=frames(who,act);bb=[b for b in (x.point(lambda v:255 if v>48 else 0).getbbox() for x in fr) if b]
        c[who+'/'+act]={'bw':round(sum(b[2]-b[0] for b in bb)/max(1,len(bb)),1) or j['w']}
json.dump(c,open(R+'games-src/nightrun/sprite-calib.json','w'),separators=(',',':'),sort_keys=True)
print(len(c),'calibrated')
