// PURPOSE: Street foes answer the guard: rushers feint, the heavy has one unblockable slam (red outline), foes flank a player who guards a lot
// FLAG: counter (?counter=1; off by default until the gates pass, see HANDOFF-W202-guard.md)
// TEST: qa/streetsim.js (BOTS=parry,dodge; PJ=0.3 is the sloppy parry bot)
/* ---------- STREETCOUNTER (W198, owner 24 Oct 2026: "the guard is a win button"). The decision: guard now, wait out a fake, or get out of the way.
   1. FEINT: some rushers crouch as usual, then stand up and hold FEINT s with a steady amber outline, then lunge with no second crouch. A guard raised at the
      end of the crouch (hold 0.4 s, then a 0.5 s rest) is spent when the lunge comes. Tell: the stand-up pose + the amber outline for the whole pause.
   2. UNBLOCKABLE SLAM: every other heavy attack is a slam instead of a charge: the wind-up (0.9 s) and the slam wear a steady red outline, the guard does nothing
      against it. Answer: step in depth or dash.
   3. FLANK: after GUARDS blocks or parries within WIN s, one rusher at a time runs round Kai along the far depth lane and attacks from behind (amber outline
      while it circles); the guard covers only the front, so Kai must turn (or dash). ---------- */
if(RET.counter===undefined)RET.counter=/[?&]counter=1/.test(location.search);
(function(){
if(!RET.counter||!window.FOOT||!FOOT._in||!FOOT.STAGES||!FOOT.STAGES.zeil||typeof ART==='undefined'||!ART.footDraw)return;
const F=FOOT,IN=F._in,FE=window.FOOT_ENEMIES||{},abs=Math.abs,sgn=v=>v<0?-1:1,clamp=(v,a,b)=>v<a?a:v>b?b:v;
const C=F.CN={FP:.15,FPG:.55,FXL:.2,DWIN:30,DN:2,FEINT:.45,FDMG:2,FDW:.2,SPENT:.5,FZ:1.6,UW:.9,SLAM:.4,SLAMV:380,SLAMCD:2.4,SLAMOPEN:1.2,SLEVERY:1,GUARDS:2,WIN:12,FLP:.6,FLV:300,FLBACK:120,log:null};
const L=S=>S.cn||(S.cn={feints:0,slams:0,flanks:0,fb:0,fhit:0,fpar:0,dt0:-9,dn:0,dh:[],hist:[],gn:0,told:{}});
const told=(e,S,k,txt,col)=>{const l=L(S);if(l.told[k])return;l.told[k]=1;IN.pop(e.x,e.y-e.h-26,txt,col);};
const on=()=>F.S&&F.S.s3;
/* rusher: feint and flank wrap the ai that is already there */
const R=FE.rusher;
if(R&&R.ai&&!R._cn){R._cn=1;const a0=R.ai;
  R.ai=function(e,dt,env){const S=F.S;if(!on()||e.state==='dead')return a0.apply(this,arguments);const l=L(S),P=env.P;
    const g=S.gd;if(g){const n=g.blocks+g.parries;if(n>l.gn){l.gn=n;l.hist.push(S.time);}}
    while(l.hist.length&&S.time-l.hist[0]>C.WIN)l.hist.shift();
    {const g=S.gd,d=S.dg;if(g&&g.t0>l.dt0){l.dt0=g.t0;l.dh.push(S.time);}if(d&&d.dashes>l.dn){l.dn=d.dashes;l.dh.push(S.time);}while(l.dh.length&&S.time-l.dh[0]>C.DWIN)l.dh.shift();}   // W202: every guard press and dash in the last DWIN s (the foes read a defensive player and bait it)
    if(e.state==='feint'){e.sT+=dt;e.vx=0;e.tele=0;e.facing=sgn(P.x-e.x);if(e.z!=null&&P.z!=null)e.z+=clamp(P.z-e.z,-C.FZ*dt,C.FZ*dt);   // it lines up with Kai's depth while it waits: step in depth to dodge
      for(const b of S.pb)if(b.life>0&&b.kind!=='rkt'&&(b.x-e.x)*e.facing>-6&&(b.x-e.x)*e.facing<40+abs(b.vx||0)*dt*2&&(b.vx||0)*e.facing<0&&(b.z==null||e.z==null||abs(b.z-e.z)<.2)&&abs(b.y-(e.y-e.h/2))<e.h/2+8){b.life=0;l.fb++;IN.ftBurst(e.x+e.facing*16,b.y,'#ffb43a',4);if(!S.sim)IN.sfx('graze');told(e,S,'fb','FEINT: IT BLOCKS SHOTS. WAIT FOR THE REAL STRIKE','#ffb43a');}   // W202: it guards while it baits yours: shots from the front glance off
      if(P.dash>0&&e.sT>C.FEINT-C.FDW)e.sT=C.FEINT-C.FDW;   // W202: it waits out a dash too, then strikes while the dash is cooling down
      if(e.sT>=C.FEINT){e.state='lunge';e.sT=0;e._fL=1;e._fx=1;e._h0=S.hurts;e._p0=S.gd?S.gd.parries:0;const g=S.gd;if(g&&g.t0>S.time-C.FEINT-.5)g.cd=Math.max(g.cd,C.SPENT);}return;}   // a guard raised into the fake is spent: it rests as if it had been held   // the pause, then the lunge with no second crouch
    if(e._fl){e.sT+=dt;e.y=470;const tx=P.x-P.facing*C.FLBACK,G=env.G;
      if((e.x-P.x)*P.facing<-30){e._fl=0;e.zt=null;e.state='run';e.sT=0;}   // behind Kai: the normal rusher takes over
      else{e.facing=sgn(tx-e.x);const nx=e.x+e.facing*C.FLV*dt;if(!e.seen||(nx>=G.camX+e.w/2&&nx<=G.camX+G.viewW-e.w/2))e.x=nx;e.vx=e.facing*C.FLV;
        if(e.z!=null&&P.z!=null){const far=P.z<.5?.95:.05;e.z+=clamp(far-e.z,-2.5*dt,2.5*dt);}return;}}
    if(e.z!=null&&P.z!=null&&e.state==='run'&&abs(e.z-P.z)>.02&&!e._fl&&e._fz)e.z+=clamp(P.z-e.z,-2.5*dt,2.5*dt);
    if(e.state==='run'&&!e._fl&&!e._fk0&&l.hist.length>=C.GUARDS&&!S.E.some(o=>o._fl&&!o.dead)&&abs(P.x-e.x)>150&&abs(P.x-e.x)<420&&(e.x-P.x)*P.facing>0&&e.seen&&e.grace<=0&&P.x-P.facing*C.FLBACK>env.G.camX+30&&P.x-P.facing*C.FLBACK<env.G.camX+env.G.viewW-30){
      e._fk0=1;if(Math.random()<C.FLP){e._fl=1;e._fz=1;l.flanks++;told(e,S,'fl','FLANKED: GUARD COVERS ONLY YOUR FRONT','#ffb43a');}}
    const was=e.state;if(e._fx&&e.state!=='lunge')e._fx=0;
    if(e._fx&&e.sT>=.25&&(e._fxT||0)<C.FXL&&abs(P.x-e.x)>40&&sgn(P.x-e.x)===e.facing){e.sT-=dt;e._fxT=(e._fxT||0)+dt;}   // W202: the real strike runs on (up to FXL s more) until it reaches Kai
    if(e._fx&&C.FDMG>1){const m0=env.melee;env.melee=function(q,r,d,o){return m0.call(this,q,r,q===e?C.FDMG:d,o);};try{a0.apply(this,arguments);}finally{env.melee=m0;}}else a0.apply(this,arguments);   // W202: the real strike after a feint is a full-weight blow (2 hearts; it breaks a guard it meets, a parry still beats it)
    if(e._fL){if(S.hurts>e._h0){l.fhit++;e._fL=0;}else if(S.gd&&S.gd.parries>e._p0){l.fpar++;e._fL=0;}else if(e.state!=='lunge')e._fL=0;}   // telemetry: what the lunge after a feint did
    if(was!=='crouch'&&e.state==='crouch'&&e._fk==null)e._fk=Math.random()<C.FP+C.FPG*Math.min(1,l.dh.length/C.DN)?1:0;
    if(e._fk===1&&was==='crouch'&&e.state==='lunge'){e.state='feint';e.sT=0;e.tele=0;e._fk=2;l.feints++;told(e,S,'fe','FEINT: WAIT FOR THE REAL STRIKE','#ffb43a');}};
  const p0=R.pose;R.pose=e=>e.state==='feint'?'idle':e._fl?(Math.floor(e.t*8)%2?'run-a':'run-b'):p0(e);}
/* heavy: every other attack is the unblockable slam */
const H=FE.heavy;
if(H&&H.ai&&!H._cn){H._cn=1;const a0=H.ai;
  H.ai=function(e,dt,env){const S=F.S;if(!on()||e.state==='dead')return a0.apply(this,arguments);const l=L(S);
    if(e.state==='slam'){e.sT+=dt;const G=env.G,nx=e.x+e.facing*C.SLAMV*dt;if(nx>=G.camX+e.w/2&&nx<=G.camX+G.viewW-e.w/2)e.x=nx;e.vx=e.facing*C.SLAMV;
      env.melee(e,{x:e.x-e.w/2-12,y:e.y-e.h,w:e.w+24,h:e.h},1);
      if(e.sT>=C.SLAM){e.state='stun';e.stun=C.SLAMOPEN;e.sT=0;e.vx=0;e.cd=C.SLAMCD;e._ub=0;}return;}   // W202: the fists stick in the road: OPEN, the reward for getting out of the way
    const was=e.state;
    if(was==='wind'&&e._ub){e.sT+=dt;e.vx=0;e.tele=C.UW-e.sT;if(e.sT>=C.UW){e.tele=0;e.state='slam';e.sT=0;l.slams++;}return;}   // the long red-outlined wind-up
    a0.apply(this,arguments);
    if(was!=='wind'&&e.state==='wind'){e._na=(e._na|0)+1;if(C.SLEVERY<=1||e._na%C.SLEVERY!==0){e._ub=1;told(e,S,'ub','RED OUTLINE: UNBLOCKABLE. STEP OUT OF LINE OR DASH','#ff4060');}}};}
/* the guard does nothing against the slam */
const gh0=F.guardHit;
F.guardHit=function(n,fromX,src,b){const S=F.S;if(S&&RET.counter&&src==='mel:heavy'&&S.E.some(o=>!o.dead&&o.state==='slam'))return 0;return gh0?gh0.apply(this,arguments):0;};
/* the steady outlines: amber = a fake or a flanker, red = unblockable (the sprite is drawn with a glow of that colour, no blink) */
const fd0=ART.footDraw;
ART.footDraw=function(c,who,pose,x,y,h,flip,t){const e=ART.fE;
  const col=!e?null:e.state==='feint'||e._fl?'#ffb43a':e.id==='heavy'&&e._ub&&(e.state==='wind'||e.state==='slam')?'#ff2040':null;
  if(!col)return fd0.apply(this,arguments);
  c.save();c.shadowColor=col;c.shadowBlur=18;fd0.apply(this,arguments);c.shadowBlur=10;const r=fd0.apply(this,arguments);c.restore();return r;};
})();
