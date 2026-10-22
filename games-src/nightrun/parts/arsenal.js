// PURPOSE: 12 extra power-ups and the context-aware drop picker
// FLAG: powers (?powers=0)
// TEST: powers-test.js
/*@@ARSENAL-START@@ ---------- arsenal: twelve more tactical power-ups + a context-aware drop picker (flag RET.powers, ?powers=0 = the game exactly as before) ----------
   Owner, 20 Oct 2026: "Better use of power ups, include a wider selection so it is not boring."
   DEFENSIVE  BUBBLE SHIELD  (charge) absorbs the next hit          STASIS FIELD   enemy bullets near the ship crawl
              GRAVITY WELL   pulls every pickup in, bends close bullets away
   OFFENSIVE  SPLINTER       a kill throws 2 shards at the nearest foes    LANCE BURST  piercing lance every 2 beats, strips shields
              HORNETS        2 homing micro-missiles on every beat         OVERDRIVE    double fire rate, the gun heats much faster
   UTILITY    EMP CHARGE     +1 EMP now, the EMP meter fills x2            DASH REFUND  (charge) the dash that empties you refills every charge
              NEON ZONE      a ring on the field: score x2 while the ship is inside    DECOY DRONE  a drone ahead draws aimed fire and eats bullets
   RISKY      GLASS CANNON   damage x2, but i-frames after a hit are halved
   Stacking: at most 2 of these timed powers at once (the oldest one ends; the older powers keep their own one-at-a-time rules, a cap on all of them
   cost the late build half its stage-3 clears) + 1 stored charge (a new charge replaces the stored one; a charge fades after 32 bars).
   Picker (PW.pick): weighted by stage (rare ones only from later stages), the equipped weapons, the hull (hp and ship power SC.f) and the last 3 drops
   (a role seen twice in them is damped); the same power never comes twice within 4 drops; counters: LANCE when shielded foes are on screen or in the
   shield district, STASIS / GRAVITY when the screen is full of bullets, SPLINTER / HORNETS against crowds.
   Damage: every new shot is an ordinary player bullet (pbRoom cap, DMG.hit, DMG.pass), GLASS CANNON doubles the shot value before DMG.hit's own cap,
   so hard.js's ceiling and armour.js's boss cap book all of it; nothing here writes e.hp. Icons pk-<id> (ASSETS-NEEDED-3.md). Test: powers-test.js. */
if(RET.powers===undefined)RET.powers=!/[?&]powers=0/.test(location.search);
const PWX=window.PWX={get on(){return!!RET.powers;},MAXT:2,REP:4,CHG_BARS:32,
  K:{bubble:{n:'BUBBLE SHIELD',tip:'BUBBLE: stored, absorbs one hit',c:'#7fd8ff',r:'def',st:1,w:2.2,chg:1},
     stasis:{n:'STASIS FIELD',tip:'STASIS: bullets near you crawl',c:'#9fffe8',r:'def',st:2,w:2},
     gwell:{n:'GRAVITY WELL',tip:'GRAVITY: pulls pickups, bends bullets',c:'#c7a0ff',r:'def',st:3,w:1.6},
     splint:{n:'SPLINTER',tip:'SPLINTER: kills throw shards',c:'#ffcf6b',r:'off',st:1,w:2},
     lance:{n:'LANCE BURST',tip:'LANCE: piercing shots break shields',c:'#e8f6ff',r:'off',st:2,w:2},
     hornet:{n:'HORNETS',tip:'HORNETS: homing missiles on the beat',c:'#ffa04d',r:'off',st:4,w:1.6},
     ovd:{n:'OVERDRIVE',tip:'OVERDRIVE: double fire, more heat',c:'#ff5a5a',r:'off',st:5,w:1.4},
     empr:{n:'EMP CHARGE',tip:'EMP CHARGE: +1 EMP, meter fills x2',c:'#ffc23d',r:'utl',st:1,w:1.8},
     dashr:{n:'DASH REFUND',tip:'DASH REFUND: empty dash refills once',c:'#5ef0ff',r:'utl',st:3,w:1.6,chg:1},
     zone:{n:'NEON ZONE',tip:'NEON ZONE: stay in the ring, score x2',c:'#ff4fd8',r:'utl',st:3,w:1.5},
     decoy:{n:'DECOY DRONE',tip:'DECOY: a drone draws enemy fire',c:'#d8ff5a',r:'utl',st:6,w:1.3},
     glass:{n:'GLASS CANNON',tip:'GLASS: damage x2, hits hurt longer',c:'#ff9ad0',r:'risk',st:8,w:1.1}},
  WPN:{swarm:{hornet:.3},laser:{lance:.4},disc:{splint:.6},arc:{splint:.7},beat:{ovd:.7}},   // a power the equipped weapon already does is rarer
  DIST:[{gwell:1.3,empr:1.2},{lance:1.8,splint:1.2},{stasis:1.5,decoy:1.4},{hornet:1.4,splint:1.3},{bubble:1.5,glass:1.3}],   // per district (G.di 0-4)
  stat:{pick:0,newPick:0,bubble:0,stasis:0,gwell:0,bend:0,splint:0,lance:0,pop:0,hornet:0,ovd:0,empr:0,dashr:0,zone:0,decoy:0,glass:0,trim:0,chg:0,fade:0},
  hist:[],log:[],
  S(){return G.px||(G.px={chg:null,zone:null,dec:null,zls:0,sp:0,spT:0,lb:-1,hb:-1});},
  act(k){return PW.on(k);},
  stage(){return ST&&ST.on?ST.n:(window.S2&&S2.stg?S2.stg():1);},
  mine(k){return!!PWX.K[k];},
  /* the context weight of one new power right now (0 = not eligible) */
  wt(k){const K=PWX.K[k],n=PWX.stage();if(n<K.st)return 0;let w=K.w*Math.min(1,(n-K.st+1)/4+.25);
    const hp=P.max?P.hp/P.max:1,f=window.SC&&SC.f?SC.f():0;
    if(K.r==='def')w*=hp<=.4?2:hp<=.7?1.3:.85;
    if(k==='glass')w*=hp<=.4?.3:hp>=1?1.4:1;
    if(K.r==='off')w*=f>.6?.75:f<.2?1.25:1;
    if(K.r==='utl'||K.r==='risk')w*=f>.6?1.3:1;
    for(const id of WP.eq||[])if(id&&PWX.WPN[id]&&PWX.WPN[id][k])w*=PWX.WPN[id][k];
    const D=PWX.DIST[Math.max(0,Math.min(4,G.di|0))];if(D&&D[k])w*=D[k];
    let sh=0,en=0;for(const e of G.en){if(e.hp<=0||e.dying)continue;en++;if(e.shN>0||e.shl||e.sh)sh++;}
    if(k==='lance'&&sh>=2)w*=3;
    if((k==='stasis'||k==='gwell')&&G.eb.length>25)w*=2;
    if((k==='splint'||k==='hornet')&&en>=8)w*=1.5;
    if((k==='lance'||k==='ovd')&&G.boss&&!G.boss.dead)w*=1.5;
    if(k==='bubble'||k==='dashr'){const c=PWX.S().chg;if(c&&c.k===k)w*=.2;}
    const r3=PWX.hist.slice(-3).filter(h=>PWX.K[h]&&PWX.K[h].r===K.r).length;if(r3>=2)w*=.4;
    return w;},
  share(){const n=PWX.stage();return n<=1?.3:Math.min(.6,.42+.02*n);},   // chance a drop comes from the new set
  rec(k){PWX.hist.push(k);if(PWX.hist.length>12)PWX.hist.shift();PWX.log.push(k);if(PWX.log.length>400)PWX.log.shift();PWX.stat.pick++;if(PWX.K[k])PWX.stat.newPick++;return k;},
  recent(k){return PWX.hist.slice(-(PWX.REP-1)).indexOf(k)>=0;},   // with k itself: 4 drops in a row never hold the same power twice
  room(n){return typeof pbRoom!=='function'||pbRoom(n);},
  near(x,y,R,skip,n){const out=[];for(const e of G.en){if(e.hp<=0||e.dying||e.gr||e===skip||e.x>W-20||e.x<0)continue;const d=Math.hypot(e.x-x,e.y-y);if(d<R)out.push([d,e]);}out.sort((a,b)=>a[0]-b[0]);return out.slice(0,n).map(a=>a[1]);},
  trim(keep){const s=PW.st(),n=()=>s.act.filter(a=>PWX.K[a.k]).length;while(n()>PWX.MAXT){let j=-1,lo=1e9;for(let i=0;i<s.act.length;i++){const a=s.act[i];if(a.k===keep||!PWX.K[a.k])continue;if(a.s<lo){lo=a.s;j=i;}}if(j<0)break;s.act.splice(j,1);PW.stat.ended++;PWX.stat.trim++;}}
};
if(PWX.on){
  {const m=/[?&]pxban=([a-z,]+)/.exec(location.search);if(m)for(const k of m[1].split(','))delete PWX.K[k];}   // test switch: ?pxban=zone,glass leaves those out
  for(const k in PWX.K){const K=PWX.K[k];PWK[k]={n:K.n,tip:K.tip,c:K.c,bars:8,w:K.w,px:1};}
  RET.sioKeys&&RET.sioKeys.push('mnr_pxseen');
  PWX.seen=(()=>{try{return load('mnr_pxseen',{})||{};}catch(e){return {};}})();
  /* ----- picker: the old picker for the old set, the context table for the new set, never a repeat within 4 drops ----- */
  {const pk0=PW.pick;PW.pick=function(){const ks=Object.keys(PWX.K);
    if(gx(0,1)<PWX.share()){let t=0;const w={};for(const k of ks){if(PWX.recent(k)){w[k]=0;continue;}w[k]=PWX.wt(k);t+=w[k];}
      if(t>0){let r=gx(0,t);for(const k of ks){r-=w[k];if(w[k]>0&&r<=0)return PWX.rec(k);}}}
    let k=null;for(let i=0;i<8;i++){k=pk0.call(this);if(!PWX.recent(k)&&!PWX.K[k])break;}
    if(PWX.recent(k)||PWX.K[k]){const ok=Object.keys(PWK).filter(q=>!PWX.recent(q)&&!PWX.K[q]&&q!=='drop'&&(!PWK[q].need||(window.GA&&GA.own&&GA.own[PWK[q].need])));if(ok.length)k=ok[Math.floor(gx(0,ok.length))%ok.length];}
    return PWX.rec(k);};}
  /* ----- give: charges go to the one stored slot, timed powers are capped at 2 ----- */
  {const gv=PW.give;PW.give=function(kind,ob){const K=PWX.K[kind];
    if(K&&K.chg){const S=PWX.S();this.stat.given++;if(S.chg&&S.chg.k!==kind)floater(P.x,P.y-42,PWX.K[S.chg.k].n.split(' ')[0]+' LOST',PWX.K[S.chg.k].c);
      S.chg={k:kind,until:PW.cur()+PWX.CHG_BARS*4*(ob?1.5:1)};PWX.stat.chg++;floater(P.x,P.y-24,K.n,K.c);if(ob)floater(P.x,P.y-42,'ON BEAT +50% TIME','#ffe14d');
      PWX.tip(kind);AU.sfx('up');NR.emit('pxGive',{k:kind});return true;}
    const r=gv.call(this,kind,ob);if(!r)return r;
    if(K){const S=PWX.S();PWX.tip(kind);
      if(kind==='empr'){P.emp=Math.min(3,(P.emp|0)+1);floater(P.x,P.y-42,'EMP +1',K.c);PWX.stat.empr++;}
      if(kind==='zone'){S.zone={x:clamp(P.x+170,90,W-120),y:clamp(P.y,90,H-110),r:115};S.zls=G.score;}
      if(kind==='decoy')S.dec={x:P.x+40,y:P.y,hp:10};
      if(kind==='ovd'&&!P.over)P.heat=Math.max(0,(P.heat||0)-20);}
    if(K)PWX.trim(kind);NR.emit('pxGive',{k:kind});return r;};}
  PWX.tip=k=>{const K=PWX.K[k];if(!PWX.seen[k]){PWX.seen[k]=1;try{save('mnr_pxseen',PWX.seen);}catch(e){}hintShow(say(K.tip),6);}else hintShow(say(K.tip),1.6);};
  /* ----- BUBBLE SHIELD: the stored charge goes first ----- */
  {const ab=SH.absorb;SH.absorb=function(){const S=G&&G.px;if(S&&S.chg&&S.chg.k==='bubble'&&!G.dead){S.chg=null;P.inv=Math.max(P.inv,1.2);shake(6);burst(P.x,P.y,PWX.K.bubble.c,24,300,.45);floater(P.x,P.y-24,'BUBBLE POP',PWX.K.bubble.c);AU.sfx('hurt');PWX.stat.bubble++;return true;}
    return ab.call(this);};}
  /* ----- GLASS CANNON: shot value x2 before the per-shot cap; i-frames halved after a real hit ----- */
  HOOK['DMG.hit'](h0=>function(d,b,e){if(b&&b.pl&&e){if(e.shl)e.shl=0;if(e.sh)e.sh=0;}
    if(G&&G.live&&PW.on('glass')){PWX.stat.glass++;return h0.call(this,d*2,b,e);}return h0.call(this,d,b,e);});
  NR.on('hurt',()=>{if(G&&G.live&&PW.on('glass'))P.inv*=.5;});
  /* ----- LANCE BURST: breaks a shielder's front shield instead of being blocked ----- */
  if(window.ZOO&&ZOO.block){const bl=ZOO.block;ZOO.block=function(b,e){if(b&&b.pl&&e&&e.shN>0){e.shN=0;e.shF=.12;PWX.stat.pop++;burst(e.x,e.y,'#4ad1ff',14,220,.4);floater(e.x,e.y-e.r-18,'SHIELD DOWN','#4ad1ff');return false;}return bl.call(this,b,e);};}
  /* ----- EMP CHARGE: the meter fills twice as fast ----- */
  if(window.ABIL&&ABIL.gain){const gn=ABIL.gain;ABIL.gain=function(v,src,e){return gn.call(this,PW.on('empr')?v*2:v,src,e);};}
  /* ----- OVERDRIVE: a second volley on every shot, and the heat that comes with it ----- */
  NR.on('fire',f=>{if(!G.live||G.dead||!PW.on('ovd')||P.over)return;if(!PWX.room(3))return;SH.volley(f.x,f.y+3,0);PWX.stat.ovd++;P.heat=Math.min(100,(P.heat||0)+7);
    if(P.heat>=100){P.over=true;AU.sfx('heat');floater(P.x,P.y-24,'OVERHEAT','#ff5050');}});
  /* ----- LANCE BURST and HORNETS on the beat ----- */
  NR.on('beat',d=>{if(!G.live||G.dead)return;const S=PWX.S();
    if(PW.on('lance')&&d.i%2===0&&PWX.room(1)){G.pb.push({x:P.x+24,y:P.y,vx:1150,vy:0,dm:2.2,pf:0,pl:1,px:new Set(),pn:3,col:PWX.K.lance.c,len:30,th:4});PWX.stat.lance++;}
    if(PW.on('hornet')&&PWX.room(2)){for(const s of[-1,1])G.pb.push({x:P.x+8,y:P.y+s*10,vx:520,vy:s*210,dm:.8,pf:0,hk:3,col:PWX.K.hornet.c,len:9,th:3});PWX.stat.hornet+=2;}});
  /* ----- SPLINTER: a kill throws 2 shards at the nearest foes (6 a second at most) ----- */
  NR.on('kill',o=>{const e=o&&o.e;if(!e||!G.live||G.dead||!PW.on('splint'))return;const S=PWX.S();if(G.t-S.spT>1){S.spT=G.t;S.sp=0;}if(S.sp>=6)return;
    for(const q of PWX.near(e.x,e.y,340,e,2)){if(!PWX.room(1)||S.sp>=6)break;const dx=q.x-e.x,dy=q.y-e.y,l=Math.hypot(dx,dy)||1;G.pb.push({x:e.x,y:e.y,vx:dx/l*820,vy:dy/l*820,dm:1.4,pf:0,px:new Set([e]),pn:0,col:PWX.K.splint.c,len:10,th:3});S.sp++;PWX.stat.splint++;}});
  /* ----- per frame: charges, STASIS, GRAVITY WELL, NEON ZONE, DECOY, DASH REFUND ----- */
  NR.on('tick',dt=>{if(!G.live||G.dead||!G.pw)return;const S=PWX.S(),cur=PW.cur();
    if(S.chg&&cur>=S.chg.until){floater(P.x,P.y-24,PWX.K[S.chg.k].n.split(' ')[0]+' FADED','#9a9ab0');S.chg=null;PWX.stat.fade++;}
    if(S.chg&&S.chg.k==='dashr'){if(window.ABIL&&ABIL.on){const A=G.ab;if(A&&A.n<1&&P.dashT>0){A.n=ABIL.max();A.r=0;S.chg=null;PWX.stat.dashr++;floater(P.x,P.y-24,'DASH REFUND',PWX.K.dashr.c);AU.sfx('up');}}
      else if(P.dashCd>.25&&P.dashT>0){P.dashCd=0;S.chg=null;PWX.stat.dashr++;floater(P.x,P.y-24,'DASH REFUND',PWX.K.dashr.c);}}
    if(PW.on('stasis')){const R=130,k=(HARDS.includes(SET.diff)?.5:.6)*dt*(window.RET&&RET.asB?RET.asB():1);for(const b of G.eb){if(b.dead)continue;const dx=b.x-P.x,dy=b.y-P.y;if(dx*dx+dy*dy>R*R)continue;b.x-=b.vx*k;b.y-=b.vy*k;if(!b._px){b._px=1;PWX.stat.stasis++;}}}
    if(PW.on('gwell')){for(const p of G.pk){if(p.dead||p.t==='pw')continue;const dx=P.x-p.x,dy=P.y-p.y,l=Math.hypot(dx,dy);if(l<8)continue;const v=Math.min(l,340*dt);p.x+=dx/l*v;p.y+=dy/l*v;}
      for(const b of G.eb){if(b.dead)continue;const dx=b.x-P.x,dy=b.y-P.y,l=Math.hypot(dx,dy);if(l>110||l<1)continue;const f=900*dt*(1-l/110);b.vx+=dx/l*f;b.vy+=dy/l*f;
        const sp=Math.hypot(b.vx,b.vy),s0=b._gs||(b._gs=Math.max(1,sp-1));if(sp>s0){b.vx*=s0/sp;b.vy*=s0/sp;}if(!b._gw){b._gw=1;PWX.stat.bend++;}}PWX.stat.gwell++;}
    if(PW.on('zone')&&S.zone){const z=S.zone,inn=Math.hypot(P.x-z.x,P.y-z.y)<z.r;z.in=inn;if(inn&&!PW.on('tempo')&&G.score>S.zls){G.score+=G.score-S.zls;PWX.stat.zone++;}S.zls=G.score;}else S.zone=PW.on('zone')?S.zone:null;
    if(PW.on('decoy')&&S.dec&&S.dec.hp>0){const d=S.dec;d.x+=(clamp(P.x+150,60,W-90)-d.x)*Math.min(1,dt*2.5);d.y+=(P.y-d.y)*Math.min(1,dt*1.8);
      for(const b of G.eb){if(b.dead)continue;const ex=b.x-d.x,ey=b.y-d.y;if(ex*ex+ey*ey<26*26){b.dead=1;d.hp--;PWX.stat.decoy++;burst(b.x,b.y,PWX.K.decoy.c,4,120,.25);if(d.hp<=0){burst(d.x,d.y,PWX.K.decoy.c,18,260,.4);floater(d.x,d.y-20,'DECOY DOWN',PWX.K.decoy.c);break;}continue;}
        if(b._dc)continue;b._dc=1;const sp=Math.hypot(b.vx,b.vy);if(sp<1)continue;const ax=P.x-b.x,ay=P.y-b.y,al=Math.hypot(ax,ay)||1;
        if((b.vx*ax+b.vy*ay)/(sp*al)>.97&&gx(0,1)<.6){const dl=Math.hypot(ex,ey)||1;b.vx=-ex/dl*sp;b.vy=-ey/dl*sp;}}
      G.eb=G.eb.filter(b=>!b.dead);}else if(!PW.on('decoy'))S.dec=null;});
  /* ----- drawing: icons (simple shapes, painted pk-<id> sprites replace them through PW.coin), fields, drone, stored charge ----- */
  {const gl=PW.glyph;PW.glyph=function(k,r,c){if(!PWX.K[k])return gl.call(this,k,r,c);
    ctx.save();ctx.scale(r/11,r/11);ctx.strokeStyle=c;ctx.fillStyle=c;ctx.lineWidth=2;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();
    if(k==='bubble'){ctx.arc(0,0,7,0,7);ctx.moveTo(-3,-3);ctx.arc(-2,-2,2,Math.PI,Math.PI*1.6);}
    else if(k==='stasis'){ctx.arc(0,0,8,0,7);ctx.moveTo(-4,-3);ctx.lineTo(4,-3);ctx.lineTo(-4,3);ctx.lineTo(4,3);}
    else if(k==='gwell'){ctx.arc(0,0,2.5,0,7);ctx.moveTo(7,0);ctx.arc(0,0,7,0,Math.PI*1.4);ctx.moveTo(-9,4);ctx.lineTo(-6,6);}
    else if(k==='splint'){ctx.moveTo(-7,0);ctx.lineTo(0,0);ctx.moveTo(0,0);ctx.lineTo(7,-6);ctx.moveTo(0,0);ctx.lineTo(7,6);ctx.moveTo(0,0);ctx.lineTo(8,0);}
    else if(k==='lance'){ctx.moveTo(-9,0);ctx.lineTo(9,0);ctx.moveTo(4,-4);ctx.lineTo(9,0);ctx.lineTo(4,4);ctx.moveTo(-3,-6);ctx.lineTo(-3,6);}
    else if(k==='hornet'){for(const s of[-1,1]){ctx.moveTo(-7,s*5);ctx.lineTo(5,s*5);ctx.lineTo(8,s*3);}ctx.moveTo(-7,0);ctx.lineTo(-3,0);}
    else if(k==='ovd'){ctx.moveTo(-8,-6);ctx.lineTo(-1,0);ctx.lineTo(-8,6);ctx.moveTo(0,-6);ctx.lineTo(7,0);ctx.lineTo(0,6);ctx.moveTo(-8,9);ctx.lineTo(8,9);}
    else if(k==='empr'){ctx.arc(0,0,7,0,7);ctx.moveTo(1,-5);ctx.lineTo(-2,0);ctx.lineTo(2,0);ctx.lineTo(-1,5);}
    else if(k==='dashr'){ctx.moveTo(-8,0);ctx.lineTo(3,0);ctx.moveTo(-1,-4);ctx.lineTo(3,0);ctx.lineTo(-1,4);ctx.moveTo(7,-6);ctx.arc(5,0,6,-Math.PI/2,Math.PI/2);}
    else if(k==='zone'){ctx.arc(0,0,8,0,7);ctx.moveTo(4,0);ctx.arc(0,0,4,0,7);}
    else if(k==='decoy'){ctx.moveTo(7,0);ctx.lineTo(-5,-6);ctx.lineTo(-2,0);ctx.lineTo(-5,6);ctx.closePath();ctx.moveTo(-9,-8);ctx.lineTo(-9,8);}
    else{ctx.moveTo(0,-9);ctx.lineTo(7,0);ctx.lineTo(0,9);ctx.lineTo(-7,0);ctx.closePath();ctx.moveTo(-2,-3);ctx.lineTo(2,1);ctx.lineTo(-1,4);}
    ctx.stroke();ctx.restore();};}
  HOOK['PW.draw'](pd=>function(t){pd.call(this,t);const S=G.px;if(!S||!G.pw)return;ctx.save();ctx.lineCap='round';
    if(PW.on('stasis')){ctx.globalAlpha=.16+.06*Math.sin(t*4);ctx.fillStyle=PWX.K.stasis.c;ctx.beginPath();ctx.arc(P.x,P.y,130,0,7);ctx.fill();ctx.globalAlpha=.5;ctx.strokeStyle=PWX.K.stasis.c;ctx.lineWidth=1.5;ctx.setLineDash([6,6]);ctx.lineDashOffset=t*10;ctx.stroke();ctx.setLineDash([]);}
    if(PW.on('gwell')){ctx.globalAlpha=.45;ctx.strokeStyle=PWX.K.gwell.c;ctx.lineWidth=2;for(let i=0;i<3;i++){const q=(t*1.5+i/3)%1;ctx.globalAlpha=.5*(1-q);ctx.beginPath();ctx.arc(P.x,P.y,110*(1-q)+8,0,7);ctx.stroke();}}
    const z=S.zone;if(z&&PW.on('zone')){ctx.globalAlpha=z.in?.22:.1;ctx.fillStyle=PWX.K.zone.c;ctx.beginPath();ctx.arc(z.x,z.y,z.r,0,7);ctx.fill();ctx.globalAlpha=z.in?.95:.6;ctx.strokeStyle=PWX.K.zone.c;ctx.lineWidth=z.in?4:2.5;ctx.stroke();
      ctx.globalAlpha=.9;ctx.font='700 14px "Chakra Petch",sans-serif';ctx.textAlign='center';ctx.fillStyle=PWX.K.zone.c;wtxt(z.in?'SCORE ×2':'NEON ZONE',z.x,z.y-z.r-8);}
    const d=S.dec;if(d&&d.hp>0&&PW.on('decoy')){ctx.globalAlpha=.95;ctx.fillStyle='#0a0612';ctx.strokeStyle=PWX.K.decoy.c;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(d.x+14,d.y);ctx.lineTo(d.x-10,d.y-11);ctx.lineTo(d.x-5,d.y);ctx.lineTo(d.x-10,d.y+11);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.globalAlpha=.3+.2*Math.sin(t*8);ctx.beginPath();ctx.arc(d.x,d.y,26,0,7);ctx.stroke();}
    if(PW.on('glass')){ctx.globalAlpha=.5+.3*Math.sin(t*9);ctx.strokeStyle=PWX.K.glass.c;ctx.lineWidth=1.5;ctx.beginPath();for(let i=0;i<6;i++){const a=i*Math.PI/3+t;ctx.moveTo(P.x+Math.cos(a)*24,P.y+Math.sin(a)*24);ctx.lineTo(P.x+Math.cos(a+.5)*30,P.y+Math.sin(a+.5)*30);}ctx.stroke();}
    const c=S.chg;if(c){const K=PWX.K[c.k];if(c.k==='bubble'){ctx.globalAlpha=.45+.2*Math.sin(t*5);ctx.strokeStyle=K.c;ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(P.x,P.y,28,0,7);ctx.stroke();ctx.globalAlpha=.08;ctx.fillStyle=K.c;ctx.fill();}
      ctx.globalAlpha=.95;ctx.translate(P.x-26,P.y-30);PW.coin(c.k,7);}
    ctx.restore();});
  NR.on('runStart',()=>{G.px=null;PWX.hist.length=0;});NR.on('runEnd',()=>{if(G)G.px=null;});
}
window.__pwx={PWX,PWK};
/*@@ARSENAL-END@@*/
