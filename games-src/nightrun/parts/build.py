import re,sys
P='/home/user/spotify_to_ytmusic/games-src/nightrun/parts/'
rd=lambda n:open(P+n,encoding='utf8').read()
def rep(s,a,b,cnt=1):
    assert s.count(a)>=1,('missing',a[:60])
    return s.replace(a,b) if cnt==0 else s.replace(a,b,cnt)
bg=rd('bg.js'); dr=rd('draw.js'); b=rd('b.js')
# bg patches
bg=rep(bg,"trainX-=scroll>0?7:0;","trainX-=scroll>0?420*FD:0;")
bg=rep(bg,"ctx.globalCompositeOperation='lighter';G_(W*.72,H*.28,260,D.a,.18);ctx.globalCompositeOperation='source-over';",
 "ctx.globalCompositeOperation='lighter';G_(W*.72,H*.28,260+40*PUL*FX(),D.a,.18+.1*PUL*FX());\n  if(PUL>.02){ctx.globalAlpha=PUL*.11*FX();ctx.fillStyle=D.a;ctx.fillRect(0,H*.25,W,H*.75);ctx.globalAlpha=1;}\n  ctx.globalCompositeOperation='source-over';")
bg=rep(bg,"ctx.fillStyle=D.a;ctx.fillRect(0,ty,W,1.5);","ctx.fillStyle=D.a;ctx.fillRect(0,ty,W,1.5+2.5*PUL*FX());")
# draw patches
dr=rep(dr,"const red=Math.floor(t*6+e.by)%2;","const red=(Math.floor(G.bp)+Math.floor(e.by))%2;")
dr=rep(dr,"else if(e.tele&&Math.floor(t*16)%2)","else if(e.tele&&(SET.reduce||Math.floor(t*16)%2))")
dr=rep(dr,"const tele=l.t<.85;","const tele=l.t<2*BT.spb;")
dr=rep(dr,"ctx.strokeStyle=Math.floor(l.t*14)%2?'#ff3040cc':'#ff304044';","ctx.strokeStyle=(SET.reduce||Math.floor(l.t*14)%2)?'#ff3040cc':'#ff304044';")
dr=rep(dr,"G_(0,0,e.r*2.2,c,.35);","G_(0,0,e.r*2.2+10*PUL,c,.3+.25*PUL*FX());")
dr=rep(dr,"e.hp<e.max*.5?'#ff3040':c","e.ph===3?'#ff3040':c")
dr=rep(dr,"if(P.inv>0&&Math.floor(t*20)%2)return;","if(P.inv>0&&(SET.reduce?Math.floor(t*6)%3===0:Math.floor(t*20)%2))return;")
out=rd('head.html')+rd('a.js')+"\n"+bg+"\n"+b+"\n"+dr+"\n"+rd('garage.js')+"\n"+rd('shop.js')+"\n"+rd('story.js')+"\n"+rd('c.js')
open('/home/user/spotify_to_ytmusic/games/mainhattan-nightrun/index.html','w',encoding='utf8').write(out)
print(len(out))
import subprocess
subprocess.run(['python3','/home/user/spotify_to_ytmusic/games-src/scripts/stamp-copyright.py','/home/user/spotify_to_ytmusic/games/mainhattan-nightrun/index.html'],check=True)
