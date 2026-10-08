import re,sys
P='/home/user/spotify_to_ytmusic/games-src/nightrun/parts/'
rd=lambda n:open(P+n,encoding='utf8').read()
def rep(s,a,b,cnt=1):
    assert s.count(a)>=1,('missing',a[:60])
    return s.replace(a,b) if cnt==0 else s.replace(a,b,cnt)
bg=rd('bg.js'); dr=rd('draw.js'); b=rd('b.js')
# bg patches
bg=rep(bg,"trainX-=scroll>0?7:0;","trainX-=scroll>0?420*FD:0;")
# (the beat pulse no longer flashes the backdrop: it lives on the screen edges and the ship ring, see parts/fx.js)
# draw patches
dr=rep(dr,"const red=Math.floor(t*6+e.by)%2;","const red=(Math.floor(G.bp)+Math.floor(e.by))%2;")
dr=rep(dr,"else if(e.tele&&Math.floor(t*16)%2)","else if(e.tele&&(SET.reduce||Math.floor(t*16)%2))")
dr=rep(dr,"const tele=l.t<.85;","const tele=l.t<2*BT.spb;")
dr=rep(dr,"ctx.strokeStyle=Math.floor(l.t*14)%2?'#ff3040cc':'#ff304044';","ctx.strokeStyle=(SET.reduce||Math.floor(l.t*14)%2)?'#ff3040cc':'#ff304044';")
dr=rep(dr,"e.hp<e.max*.5?'#ff3040':c","e.ph===3?'#ff3040':c")
dr=rep(dr,"if(P.inv>0&&Math.floor(t*20)%2)return;","if(P.inv>0&&(SET.reduce?Math.floor(t*6)%3===0:Math.floor(t*20)%2))return;")
out=rd('head.html')+rd('a.js')+"\n"+bg+"\n"+b+"\n"+dr+"\n"+rd('garage.js')+"\n"+rd('shop.js')+"\n"+rd('fx.js')+"\n"+rd('power.js')+"\n"+rd('story.js')+"\n"+rd('c.js')
open('/home/user/spotify_to_ytmusic/games/mainhattan-nightrun/index.html','w',encoding='utf8').write(out)
print(len(out))
import subprocess
subprocess.run(['python3','/home/user/spotify_to_ytmusic/games-src/scripts/stamp-copyright.py','/home/user/spotify_to_ytmusic/games/mainhattan-nightrun/index.html'],check=True)
