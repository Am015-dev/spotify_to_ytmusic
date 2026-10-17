/* ---------- powerups: six music-tied timed power-ups + a reliable DRUM BURST (flag RET.pw2, off with ?pw2=0 = the old game) ----------
   ECHO         every on-beat shot comes back once, a beat later, from where the ship was (a ghost shot with a trail)
   DOWNBEAT NOVA  on the first beat of each bar a ring leaves the ship: wipes the bullets it touches, light damage to enemies
   MAGNET BASS  on every beat a pulse pulls pickups to the ship (no more chasing orbs)
   WINGMATES    two drone notes fly beside the ship and fire on the off-beats
   CRESCENDO    +12% damage per bar without a hit (max x1.6), resets on a hit; a rising synth line shows the level
   CHORD SHIELD absorbs the next hit, then rings out on the next beat with a chord (one charge)
   One timed power at a time among these and DRUM BURST. Each lasts 8 bars (counted in beats like the others) and adds a short layer in the
   song's key through AU.osc on the music bus. DRUM BURST: its audio is scheduled from the beat event (the old 25 ms timer lost beats in a
   throttled tab and ran on a grid without BT.off). Tests: ret-pw2-test.js. */
if(RET.pw2===undefined)RET.pw2=!/[?&]pw2=0/.test(location.search);
const PW2=PW.p2={stat:{echo:0,echoHit:0,nova:0,novaClr:0,novaHit:0,pull:0,wing:0,cres:0,chord:0,chordRel:0,dhit:0,dskip:0,tip:0},
  K:{echo:{n:'ECHO',tip:'ECHO: shots return on the next beat',c:'#7df9ff'},
     nova:{n:'DOWNBEAT NOVA',tip:'NOVA: a ring blast on every bar line',c:'#ff5fd2'},
     magb:{n:'MAGNET BASS',tip:'MAGNET: every beat pulls pickups in',c:'#4dffa6'},
     wing:{n:'WINGMATES',tip:'WINGS: two drones shoot the off-beats',c:'#ffd23d'},
     cres:{n:'CRESCENDO',tip:'CRESCENDO: dodge to stack damage',c:'#ff8a3d'},
     chord:{n:'CHORD SHIELD',tip:'CHORD: blocks one hit, rings on the beat',c:'#a98bff'}},
  NOTES:[0,3,5,7,10,12,15,17],
  seen:(()=>{try{return load('mnr_pw2seen',{})||{};}catch(e){return {};}})(),
  at(B){return BT.t0+BT.off+B*BT.spb;},
  note(i,dur,vol,type,when,oct){const a=AU.a;if(!a||a.state!=='running')return false;try{AU.osc(Math.max(a.currentTime+.003,when||0),type||'triangle',AU.f(AU.root+(oct==null?24:oct)+PW2.NOTES[((i%8)+8)%8]),dur,vol,AU.musv,0,3200);return true;}catch(e){return false;}},
  act(k){const s=G&&G.pw;return s?s.act.find(a=>a.k===k)||null:null;},
  any(){const s=G&&G.pw;return !!(s&&s.act.some(a=>PW2.K[a.k]));},
  st(){return G.p2||(G.p2={ech:[],trl:[],nv:null,mp:[],wm:[{x:0,y:0},{x:0,y:0}],h:null,rel:null,fl:[]});},
  cresK(){const a=PW2.act('cres');return a?1+.12*Math.min(5,a.bars|0):1;}
};
if(RET.pw2){
  for(const k in PW2.K)PWK[k]={n:PW2.K[k].n,tip:PW2.K[k].tip,c:PW2.K[k].c,bars:8,w:2,pw2:1};
  /* ----- one at a time + the first time each power shows up it is explained once (longer hint) ----- */
  {const give=PW.give;PW.give=function(kind,ob){
    if(PWK[kind]&&(PWK[kind].pw2||kind==='drum')){const s=this.st();for(let i=s.act.length-1;i>=0;i--){const a=s.act[i];if(a.k!==kind&&(PWK[kind].pw2?(PWK[a.k]&&(PWK[a.k].pw2||a.k==='drum')):PWK[a.k]&&PWK[a.k].pw2)){s.act.splice(i,1);PW.stat.ended++;}}}   // a new one replaces the running one
    const r=give.call(this,kind,ob);
    if(r&&PWK[kind]&&PWK[kind].pw2){const a=PW2.act(kind);if(a){a.x={};if(kind==='cres')a.bars=0;if(kind==='chord'){a.used=false;a.rel=false;}}
      PW2.stat[{echo:'echo',nova:'nova',magb:'pull',wing:'wing',cres:'cres',chord:'chord'}[kind]]+=0;
      if(!PW2.seen[kind]){PW2.seen[kind]=1;PW2.stat.tip++;try{save('mnr_pw2seen',PW2.seen);}catch(e){}G.hint={t:6,txt:say(PW2.K[kind].tip)};}else G.hint={t:1.6,txt:say(PW2.K[kind].tip)};
      PW2.note(0,.25,.08,'triangle');PW2.note(4,.3,.07,'triangle',AU.a?AU.a.currentTime+.08:0);}
    return r;};}
  /* ----- DRUM BURST: the layer is scheduled from the beat event (drum shots already are), on the song's grid ----- */
  {const dr=PW.drums;PW.drums=function(){if(!RET.pw2)return dr.call(this);this.dstep=-1;};}
  NR.on('beat',d=>{if(!G||!G.live||G.dead||!PW.on('drum'))return;const a=AU.a;if(!a||a.state!=='running'||BT.mode==='none'||!(BT.spb>0)){PW2.stat.dskip++;return;}
    const now=a.currentTime,s16=BT.spb/4;for(let s=0;s<4;s++){const t=Math.max(now+.003,PW2.at(d.i)+s*s16);PW.hit(d.i*4+s,t);PW2.stat.dhit++;}});
  /* ----- ECHO ----- */
  NR.on('fire',f=>{if(!G.live||G.dead||!f.pf||!PW.on('echo'))return;const s=PW2.st();if(s.ech.length<3)s.ech.push({x:f.x,y:f.y,at:G.bc+1});});
  NR.on('beat',()=>{if(!G.live||G.dead)return;const s=G.p2;if(!s)return;
    if(!PW.on('echo')){s.ech.length=0;}
    else for(let i=s.ech.length-1;i>=0;i--){const g=s.ech[i];if(G.bc<g.at)continue;s.ech.splice(i,1);
      if(typeof pbRoom==='function'&&!pbRoom(2))continue;
      const dm=1;G.pb.push({x:g.x,y:g.y-4,vx:900,vy:-24,dm,pf:0,gh:1},{x:g.x,y:g.y+4,vx:900,vy:24,dm,pf:0,gh:1});
      s.trl.push({x:g.x,y:g.y,l:.32,m:.32});PW2.stat.echo++;PW2.note(5+(G.bc%3),.14,.07,'square',0,24);}});
  /* ----- DOWNBEAT NOVA, CHORD SHIELD release ----- */
  NR.on('bar',()=>{if(!G.live||G.dead||!PW.on('nova'))return;const s=PW2.st();s.nv={x:P.x,y:P.y,r:0,R:230,hit:new Set(),dm:5};PW2.stat.nova++;
    PW2.note(0,.5,.1,'sawtooth',0,12);PW2.note(7,.35,.07,'triangle',0,24);try{if(AU.a&&AU.a.state==='running')AU.osc(AU.a.currentTime+.003,'sine',110,.3,.5,AU.musv,40);}catch(e){}});
  NR.on('beat',()=>{if(!G.live||G.dead)return;const s=G.p2,a=PW2.act('chord');if(!s||!a||!a.used||a.rel)return;a.rel=true;   // the next beat after the hit
    s.nv={x:P.x,y:P.y,r:0,R:170,hit:new Set(),dm:4,ch:1};PW2.stat.chordRel++;
    for(const [i,dl] of [[0,0],[2,.03],[4,.06],[7,.09]])PW2.note(i,.7,.08,'triangle',AU.a?AU.a.currentTime+dl:0,24);
    {const j=G.pw.act.indexOf(a);if(j>=0){G.pw.act.splice(j,1);PW.stat.ended++;}}});
  {const ab=SH.absorb;SH.absorb=function(){const a=PW2.act('chord');
    if(a&&!a.used&&!G.dead){a.used=true;P.inv=Math.max(P.inv,1.3);shake(8);G.flash=Math.max(G.flash,.14*FX());burst(P.x,P.y,PWK.chord.c,26,320,.5);floater(P.x,P.y-24,'CHORD SHIELD',PWK.chord.c);AU.sfx('hurt');PW2.stat.chord++;PW2.note(0,.25,.1,'sawtooth',0,12);return true;}
    return ab.call(this);};}
  /* ----- MAGNET BASS, WINGMATES, nova ring, ghost trails (per frame) ----- */
  NR.on('tick',dt=>{if(!G.live||G.dead)return;const s=PW2.any()?PW2.st():G.p2;
    if(PW.on('magb')){const e=Math.pow(1-PHF,2.5);for(const p of G.pk){if(p.dead)continue;const dx=P.x-p.x,dy=P.y-p.y,l=Math.hypot(dx,dy);if(l<8||l>640)continue;
      const v=(150+950*e)*dt;p.x+=dx/l*v;p.y+=dy/l*v;if(e>.5)PW2.stat.pull++;}}
    if(!s)return;
    if(PW.on('wing')){if(!s.wm.on){s.wm[0].x=s.wm[1].x=P.x-10;s.wm[0].y=s.wm[1].y=P.y;s.wm.on=1;}
      s.wm.forEach((w,i)=>{const tx=P.x-6,ty=P.y+(i?36:-36);w.x+=(tx-w.x)*Math.min(1,dt*9);w.y+=(ty-w.y)*Math.min(1,dt*9);});
      const h=Math.floor(bpos()*2);if(s.h==null)s.h=h;if(h!==s.h){s.h=h;if(h%2&&(typeof pbRoom!=='function'||pbRoom(2))){for(const w of s.wm)G.pb.push({x:w.x+10,y:w.y,vx:900,vy:0,dm:.8,pf:0,gh:1});PW2.stat.wing++;PW2.note(7+(h>>1)%3,.1,.06,'square',0,36);}}}
    else{s.wm.on=0;s.h=null;}
    const n=s.nv;if(n){n.r+=dt*720;
      for(const b of G.eb){if(!b.dead&&Math.hypot(b.x-n.x,b.y-n.y)<n.r+(b.r||4)){b.dead=1;G.score+=5;PW2.stat.novaClr++;}}
      for(const e of G.en){if(e.hp<=0||e.dying||e.gr||n.hit.has(e))continue;if(Math.hypot(e.x-n.x,e.y-n.y)<n.r+e.r&&(e.type!=='boss'||e.x<W-20)){n.hit.add(e);e.hp-=e.type==='boss'?n.dm*.6:n.dm;e.flash=.1;PW2.stat.novaHit++;}}
      if(n.r>=n.R){s.nv=null;}}
    for(const t of s.trl)t.l-=dt;s.trl=s.trl.filter(t=>t.l>0);for(const f of s.fl)f.l-=dt;s.fl=s.fl.filter(f=>f.l>0);});
  /* ----- MAGNET pulse sound + visual, CRESCENDO ----- */
  NR.on('beat',()=>{if(!G.live||G.dead)return;
    if(PW.on('magb')){const s=PW2.st();s.fl.push({x:P.x,y:P.y,r:34,c:PWK.magb.c,l:.35,m:.35,grow:560});PW2.note(0,.22,.14,'sine',0,12);try{if(AU.a&&AU.a.state==='running')AU.osc(AU.a.currentTime+.003,'sine',90,.2,.4,AU.musv,45);}catch(e){}}
    const a=PW2.act('cres');if(a){PW2.note(Math.min(7,(a.bars|0)+(G.bc%4>>1)),.16,.05+.012*Math.min(5,a.bars|0),'triangle',0,24+12*((a.bars|0)>=3?1:0));}});
  NR.on('bar',()=>{const a=PW2.act('cres');if(!a||G.dead||!G.live)return;a.bars=(a.bars|0)+1;if(a.bars<=5)floater(P.x,P.y-40,'×'+PW2.cresK().toFixed(2),PWK.cres.c);PW2.stat.cres=Math.max(PW2.stat.cres,a.bars);});
  NR.on('hurt',()=>{const a=PW2.act('cres');if(a)a.bars=0;});
  {const vol=SH.volley;SH.volley=function(x,y,pf){const n0=G.pb.length;vol.call(this,x,y,pf);const k=PW2.cresK();if(k>1)for(let i=n0;i<G.pb.length;i++)G.pb[i].dm*=k;};}
  NR.on('runStart',()=>{PW2.seen=(()=>{try{return load('mnr_pw2seen',{})||{};}catch(e){return {};}})();});
  /* ----- drawing: icons, ghosts, drones, rings, shield ----- */
  {const gl=PW.glyph;PW.glyph=function(k,r,c){if(!PWK[k]||!PWK[k].pw2)return gl.call(this,k,r,c);
    ctx.save();ctx.scale(r/11,r/11);ctx.strokeStyle=c;ctx.fillStyle=c;ctx.lineWidth=2;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();
    if(k==='echo'){ctx.moveTo(-7,-4);ctx.lineTo(-2,0);ctx.lineTo(-7,4);ctx.moveTo(1,-6);ctx.lineTo(7,0);ctx.lineTo(1,6);}
    else if(k==='nova'){ctx.arc(0,0,3,0,7);ctx.moveTo(8,0);ctx.arc(0,0,8,0,7);ctx.moveTo(0,-11);ctx.lineTo(0,-8);ctx.moveTo(0,11);ctx.lineTo(0,8);}
    else if(k==='magb'){ctx.moveTo(-6,-7);ctx.lineTo(-6,1);ctx.arc(0,1,6,Math.PI,0,true);ctx.lineTo(6,-7);ctx.moveTo(-2,8);ctx.lineTo(2,8);}
    else if(k==='wing'){ctx.moveTo(-8,-6);ctx.lineTo(-4,-9);ctx.lineTo(0,-6);ctx.lineTo(-4,-3);ctx.closePath();ctx.moveTo(0,6);ctx.lineTo(4,3);ctx.lineTo(8,6);ctx.lineTo(4,9);ctx.closePath();ctx.moveTo(-7,2);ctx.lineTo(7,2);}
    else if(k==='cres'){ctx.moveTo(-7,7);ctx.lineTo(-7,3);ctx.moveTo(-2.5,7);ctx.lineTo(-2.5,-1);ctx.moveTo(2.5,7);ctx.lineTo(2.5,-5);ctx.moveTo(7,7);ctx.lineTo(7,-9);}
    else{ctx.moveTo(0,-9);ctx.lineTo(7,-6);ctx.lineTo(6,2);ctx.quadraticCurveTo(4,7,0,9);ctx.quadraticCurveTo(-4,7,-6,2);ctx.lineTo(-7,-6);ctx.closePath();}
    ctx.stroke();ctx.restore();};}
  {const pd=PW.draw;PW.draw=function(t){pd.call(this,t);const s=G.p2;if(!s||!G.pw)return;
    ctx.save();ctx.lineCap='round';
    if(PW.on('echo')){for(const g of s.ech){const f=clamp(1-(g.at-G.bc-PHF),0,1);ctx.globalAlpha=.25+.35*f;ctx.strokeStyle=PWK.echo.c;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(g.x-14,g.y-9);ctx.lineTo(g.x+10,g.y);ctx.lineTo(g.x-14,g.y+9);ctx.closePath();ctx.stroke();ctx.setLineDash([3,5]);ctx.beginPath();ctx.moveTo(g.x+12,g.y);ctx.lineTo(g.x+80,g.y);ctx.stroke();ctx.setLineDash([]);}
      for(const q of s.trl){ctx.globalAlpha=q.l/q.m*.6;ctx.strokeStyle=PWK.echo.c;ctx.lineWidth=5*q.l/q.m+1;ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.lineTo(q.x+260,q.y);ctx.stroke();}}
    if(PW.on('wing')&&s.wm.on)for(const w of s.wm){ctx.globalAlpha=.95;ctx.fillStyle='#0a0612';ctx.strokeStyle=PWK.wing.c;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(w.x+9,w.y);ctx.lineTo(w.x,w.y-7);ctx.lineTo(w.x-8,w.y);ctx.lineTo(w.x,w.y+7);ctx.closePath();ctx.fill();ctx.stroke();ctx.globalAlpha=.25+.5*Math.pow(1-PHF,2);ctx.globalCompositeOperation='lighter';G_(w.x,w.y,18,PWK.wing.c,.5);ctx.globalCompositeOperation='source-over';}
    const n=s.nv;if(n){ctx.globalAlpha=clamp(1-n.r/n.R,0,1)*.9;ctx.strokeStyle=n.ch?PWK.chord.c:PWK.nova.c;ctx.lineWidth=7*(1-n.r/n.R)+2;ctx.beginPath();ctx.arc(n.x,n.y,n.r,0,7);ctx.stroke();}
    for(const f of s.fl){const k=1-f.l/f.m;ctx.globalAlpha=(1-k)*.8;ctx.strokeStyle=f.c;ctx.lineWidth=3;ctx.beginPath();ctx.arc(f.x,f.y,f.r+(f.grow||200)*k,0,7);ctx.stroke();}
    const ch=PW2.act('chord');if(ch&&!ch.used){ctx.globalAlpha=.55+.25*Math.sin(t*6);ctx.strokeStyle=PWK.chord.c;ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(P.x,P.y,32,0,7);ctx.stroke();ctx.globalAlpha=.1;ctx.fillStyle=PWK.chord.c;ctx.fill();}
    const cr=PW2.act('cres');if(cr&&(cr.bars|0)>0){ctx.globalAlpha=.3+.1*cr.bars;ctx.strokeStyle=PWK.cres.c;ctx.lineWidth=2;for(let i=0;i<Math.min(5,cr.bars);i++){ctx.beginPath();ctx.arc(P.x,P.y,36+i*4,Math.PI*.15,Math.PI*.85);ctx.stroke();}}
    ctx.restore();};}
  NR.on('runStart',()=>{G.p2=null;});NR.on('runEnd',()=>{if(G)G.p2=null;});
}
