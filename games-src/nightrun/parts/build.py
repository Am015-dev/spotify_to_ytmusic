import re,sys,os
P='/home/user/spotify_to_ytmusic/games-src/nightrun/parts/'
rd=lambda n:open(P+n,encoding='utf8').read()
def rep(s,a,b,cnt=1):
    assert s.count(a)>=1,('missing',a[:60])
    return s.replace(a,b) if cnt==0 else s.replace(a,b,cnt)
bg=rd('bg.js'); dr=rd('draw.js'); b=rd('b.js')   # (the old string patches are baked into bg.js and draw.js)
# bg patches
# (the beat pulse no longer flashes the backdrop: it lives on the screen edges and the ship ring, see parts/fx.js)
# draw patches
out=rd('head.html')+rd('a.js')+"\n"+rd('songs.js')+"\n"+bg+"\n"+b+"\n"+dr+"\n"+rd('garage.js')+"\n"+rd('shop.js')+"\n"+rd('fx.js')+"\n"+rd('power.js')+"\n"+rd('story.js')+"\n"+rd('athens.js')+"\n"+rd('dir.js')+"\n"+rd('upgrades.js')+"\n"+rd('up2.js')+"\n"+rd('perks2.js')+"\n"+rd('athens2.js')+"\n"+rd('art.js')+"\n"+rd('ai.js')+"\n"+rd('meta.js')+"\n"+rd('shapes.js')+"\n"+rd('hud.js')+"\n"+rd('lagfix.js')+"\n"+rd('g.js')+"\n"+rd('h.js')+"\n"+rd('fun.js')+"\n"+rd('c.js')
OUT=os.environ.get('NR_OUT','/home/user/spotify_to_ytmusic/games/mainhattan-nightrun/index.html')   # NR_OUT=<file> builds somewhere else (tests); default is the deploy path
open(OUT,'w',encoding='utf8').write(out)
print(len(out))
import subprocess
if 'NR_OUT' not in os.environ:subprocess.run(['python3','/home/user/spotify_to_ytmusic/games-src/scripts/stamp-copyright.py',OUT],check=True)
