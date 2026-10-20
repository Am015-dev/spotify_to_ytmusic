/* ---------- enemies that react = parts/react.js (flag RET.react; ?react=0 = the old fixed paths and fire timers). BALANCE.md "Enemies that react".
   Owner, 19 Oct 2026: "Very predictive moves of enemies ... the game needs to be more strategic and timing."
   Drones, flankers, turrets and gunships get a small brain. They read the ship (position, smoothed velocity PV, the half it favours) and react,
   always with a visible tell of at least RX.TELL s before any shot or dive:
     HUNT    leads the ship's velocity instead of aiming at where it is now, and drifts towards the line it will be on
     FEINT   starts a tell, cancels it ('?'), slides to the other side of the ship, then fires for real
     RETREAT backs off when the ship closes in, then dives at it (dashed line = the dive path, locked at the end of the tell)
     PRESS   fills the half of the screen the ship has been hugging
     BAIT    holds fire while the ship is still; when it crosses a lane it fires where that dodge is going
     WINDOW  armoured (steel ring): shots bounce off, except for 1 s after it fires (gold ring) = timing
   Squads (enemies spawned together): PIN + EXIT pair (one shoots your lane, the other the open side, same tell, gap >= RX.GAP),
   a LEADER (gold crown) whose death enrages the rest for 3 s (faster cycle, same tells), a shield-BEARER that covers a gunner until you flank.
   Each run has its own seed (daily / weekly runs: a fixed seed, so they stay the same for everyone); timing varies +-25%, states and sides vary.
   Fire still goes through eb(), so ebCap/BCAP hold. Formation path units, zoo kinds, ground units, bosses and the tutorial keep their old code. */
if(RET.react===undefined)RET.react=!/[?&]react=0/.test(location.search);
const RX=window.RX={get on(){return!!RET.react;},TELL:.6,GAP:96,J:.25,rng:Math.random,seed:0,fav:270,force:null,pend:[],sq:[],stat:{},
  reset(){this.act={hunt:0,feint:0,retreat:0,press:0,bait:0,window:0};this.stat={hunt:0,feint:0,retreat:0,dive:0,press:0,bait:0,window:0,pin:0,exit:0,leader:0,enrage:0,cover:0,block:0,tells:0,minTell:9,fires:0,reacts:0};this.pend=[];this.sq=[];this.fav=H/2;
    const q=/[?&]rseed=(\d+)/.exec(location.search),f=/[?&]rxs=(\w+)/.exec(location.search);this.force=f?f[1]:null;
    if(!this.on)return;   // flag off: not even one draw from the dice
    this.seed=q?+q[1]:window.__rxseed!=null?window.__rxseed:GR!==Math.random?(todayN()*31+(ST.on?ST.n:0)*977+7)|0:(Math.random()*2147483647)|0;this.rng=mul(this.seed);},
  r(a,b){return a+(b-a)*this.rng();},
  jit(){return 1+this.r(-this.J,this.J);},
  easy(){return SET.diff==='easy';},
  hard(){return HARDS.includes(SET.diff);},
  ok(e){return!!e.rx&&!e.dead&&e.hp>0&&G.en.includes(e);},
  pick(e){const t=e.type,R=this.rng(),ez=this.easy();   // which brain this enemy gets
    if(this.force)return this.force;
    if(t==='turret')return ez?(R<.5?'feint':'hunt'):R<.35?'window':R<.7?'feint':'bait';
    if(t==='gunship')return ez?'feint':R<.4?'window':R<.75?'feint':'retreat';
    return ez?(R<.5?'hunt':'press'):R<.28?'hunt':R<.48?'retreat':R<.68?'press':R<.88?'bait':'feint';},
  per(e){const d=diff(),k=frK(),t=e.type;return(t==='turret'?1.5:t==='gunship'?1.4:2.4)/d/Math.max(.2,k)/(e.el?1.3:1);},   // the old mean fire period in seconds
  tell(e){const sp=BT.spb||.5,b=bpos()+this.TELL/sp,fr=b-Math.floor(b);return this.TELL+(fr>1e-3?(1-fr)*sp:0);}   // >= TELL, and the shot lands on a beat
};
RX.reset();
NR.on('runStart',()=>RX.reset());
NR.on('spawn',e=>{if(!RX.on||!G.live||G.tut||G.lab||e.zt||e.gnd||e.wpt||e.mini)return;
  if(!['drone','flank','turret','gunship'].includes(e.type))return;
  let st=RX.pick(e);if(e.fp&&(st==='retreat'||st==='press'))st=RX.rng()<.5?'hunt':'bait';   // formation units keep their path: fire brains only
  e.rx={fx:!!e.fp,st,c:RX.r(.2,.8),tl:0,hold:0,rt:0,dv:0,sl:0,ty:null,mate:null,role:null,sq:null,enr:0,vw:-9};
  Object.defineProperty(e,'bf',{get:()=>1e9,set(){},configurable:true});e.arm=false;   // the old beat timer never fires this one
 if(e.type==='drone'||e.type==='gunship'){e.amp=0;}
  if(st==='window'){e.rxA=1;}
  if(!e.fp){const m=50,y0=e.type==='drone'||e.type==='gunship'?'by':'y',dy=RX.r(-40,40);if(e[y0]!=null&&e.y>m&&e.y<H-m){e[y0]=clamp(e[y0]+dy,m,H-m);if(y0==='by')e.y=e.by;if(e.stop!=null)e.stop+=RX.r(-30,30);}}   // spawn side / place varies per run
  RX.stat[st]=(RX.stat[st]||0)+1;RX.pend.push(e);});
/* moving a brained enemy: drones and gunships hover on e.by, the rest on e.y; never closer than 130 px to the ship, never faster than v */
RX.mvY=function(e,ty,v,dt){ty=clamp(ty,40,H-40);const d=clamp(ty-e.y,-v*dt,v*dt);if(e.by!=null&&(e.type==='drone'||e.type==='gunship'))e.by+=d;e.y+=d;};
RX.far=(x,y,r)=>Math.hypot(x-P.x,y-P.y)>(r||130);
RX.canShoot=e=>e.x<W-30&&e.x>P.x+60&&e.y>14&&e.y<H-14&&Math.hypot(e.x-P.x,e.y-P.y)>minShot(160);
/* squads: the enemies spawned on one frame */
RX.squad=function(g){if(this.easy()||!g.length)return;if(g.length<2&&!(g[0].type==='turret'||g[0].type==='gunship'))return;const s={m:g.slice(),ld:null,t:0};this.sq.push(s);for(const e of g)e.rx.sq=s;
  const gun=g.find(e=>e.type==='turret'||e.type==='gunship'),sm=g.filter(e=>e.type==='drone'||e.type==='flank');
  if(gun&&this.rng()<.6){const b=sm[0]||G.en.find(x=>x.rx&&!x.rx.role&&!x.rx.fx&&(x.type==='drone'||x.type==='flank')&&this.ok(x)&&Math.hypot(x.x-gun.x,x.y-gun.y)<400);   // a drone already on screen can be recruited
    if(b&&!b.rx.fx){b.rx.role='bear';b.rx.mate=gun;gun.rx.cov=b;b.rx.st='cover';this.stat.cover++;}}
  const fr=sm.filter(e=>!e.rx.role);

  if(fr.length>=2&&this.rng()<.6){const[a,b]=fr;a.rx.role='pin';b.rx.role='exit';a.rx.mate=b;b.rx.mate=a;b.rx.c=a.rx.c;a.rx.st=b.rx.st='hunt';this.stat.pin++;this.stat.exit++;}
  if(g.length>=3&&this.rng()<.6){const l=g.find(e=>!e.rx.role)||g[0];s.ld=l;l.rx.ld=1;l.hp=l.max=Math.round(l.max*1.5);this.stat.leader++;}};
/* the fire itself: through eb(), so caps hold */
RX.fire=function(e,dir){const d=diff(),s=(e.type==='turret'?170+15*d:e.type==='gunship'?190:150+22*d),r=e.rx,lk=this.hard()?.85:.55;
  let tx=P.x,ty=P.y;const dist=Math.hypot(P.x-e.x,P.y-e.y),t=Math.min(.9,dist/Math.max(120,s));
  if(r.st==='hunt'||r.role==='pin'||r.role==='exit'){tx+=PV.x*t*lk;ty+=PV.y*t*lk;}
  if(r.st==='bait'){ty=P.y+Math.sign(r.bd||PV.y||1)*Math.min(110,Math.abs(r.bdv||PV.y)*.45+40);}
  if(r.role==='exit'){const up=P.y>H/2;ty=P.y+(up?-1:1)*(RX.GAP+18);}   // the open side: one bullet line RX.GAP+ away from the pin line, the far side stays free
  if(r.role==='pin')ty=P.y;
  const a=Math.atan2(ty-e.y,tx-e.x),n0=G.eb.length;eb.src=e;
  if(e.type==='turret'||e.el)fan0(e,3,a,s,e.el?'#ffd23d':'#ffa02d');
  else if(e.type==='gunship')fan0(e,3,a,210,'#ffa02d');
  else eb(e.x-10,e.y,a,s);
  for(let i=n0;i<G.eb.length;i++)G.eb[i].rxb=1;eb.src=null;r.vw=G.t;this.stat.fires++;if(r.st==='hunt')this.act.hunt++;};
function fan0(e,n,a,s,c){const room=ebCap()-G.eb.length;if(room<n)n=room>=3?3:room>=1?1:0;for(let i=0;i<n;i++)eb(e.x-20,e.y,a+fanAngle(n,.42,i)*1.6,s,c);}   // fanAngle step x1.6: bullets >= 96 px apart at 300 px
/* every frame, after the old movement */
NR.on('tick',dt=>{if(!RX.on||!G.live||G.dead||G.tut||G.lab)return;
  if(RX.pend.length){const g=RX.pend.filter(e=>RX.ok(e));RX.pend=[];RX.squad(g);}
  RX.fav+=(P.y-RX.fav)*Math.min(1,dt/4);
  const enr=e=>e.rx.enr>0?1.6:1;let telling=0;for(const e of G.en)if(e.rx&&e.rx.tl>0)telling++;
  const tmax=RX.easy()?3:RX.hard()?6:4;
  for(const e of G.en){const r=e.rx;if(!r||e.dead||e.hp<=0)continue;if(e.type!=='drone'&&e.type!=='gunship'&&e.type!=='turret'&&e.type!=='flank')continue;
    r.enr=Math.max(0,r.enr-dt);if(r.role==='exit'&&!RX.ok(r.mate))r.role=null;
    /* leader down: the squad enrages */
    if(r.sq&&r.sq.ld&&r.sq.ld!==e&&!RX.ok(r.sq.ld)&&!r.sq.done){r.sq.done=1;for(const m of r.sq.m)if(RX.ok(m)){m.rx.enr=3;floater(m.x,m.y-20,'ENRAGED','#ff3d6a');}RX.stat.enrage++;}
    /* movement */
    const v=(e.type==='turret'?60:90)*enr(e);
    if(r.fx){}
    else if(r.dv>0){r.dv-=dt;e.x+=r.vx*dt;RX.mvY(e,e.y+r.vy*dt,Math.abs(r.vy)+1,dt);if(e.stop!=null)e.stop=Math.min(e.stop,e.x);continue;}
    if(r.role==='bear'&&RX.ok(r.mate)){const g=r.mate,dx=P.x-g.x,dy=P.y-g.y,L=Math.hypot(dx,dy)||1,tx=g.x+dx/L*70,ty=g.y+dy/L*70;
      e.x+=clamp(tx-e.x,-150*dt,150*dt);RX.mvY(e,ty,150,dt);}
    else if(r.st==='press'){const k=RX.sq.indexOf(r.sq),ty=RX.fav+(k%2?-60:60)*(e.id1=e.id1||(RX.rng()<.5?1:-1));if(RX.far(e.x,ty,140)&&Math.abs(ty-e.y)>20){RX.mvY(e,ty,v,dt);RX.act.press+=dt;}}
    else if(r.st==='hunt'&&!r.role){const ty=P.y+PV.y*.6;if(RX.far(e.x,ty,140))RX.mvY(e,ty,v*.7,dt);}
    else if(r.st==='feint'&&r.ty!=null){RX.mvY(e,r.ty,180*enr(e),dt);if(Math.abs(e.y-r.ty)<4)r.ty=null;}
    else if(r.st==='retreat'){const close=Math.hypot(P.x-e.x,P.y-e.y)<230&&e.x-P.x<260;
      if(close&&r.tl<=0&&e.x<W-50){e.x+=150*dt;if(e.stop!=null)e.stop=Math.max(e.stop,e.x);r.rt+=dt;}
      else if(r.rt>0)r.rt+=dt;}
    /* the fire cycle: cool -> tell (e.arm, >= RX.TELL) -> shot / dive / feint */
    if(r.tl>0){r.tl-=dt;e.arm=true;if(r.tl<=0){e.arm=false;
        if(r.kind==='feint'){r.ty=r.fx?null:clamp(2*P.y-e.y,60,H-60);if(r.ty!=null&&!RX.far(e.x,r.ty,140))r.ty=clamp(e.y+(e.y<P.y?-120:120),60,H-60);r.fk=0;floater(e.x,e.y-20,'?','#ffe14d');RX.stat.reacts++;RX.act.feint++;r.c=.25;r.fk=2;}
        else if(r.kind==='dive'){const dx=r.lx-e.x,dy=r.ly-e.y,L=Math.hypot(dx,dy)||1;r.vx=dx/L*380;r.vy=dy/L*380;r.dv=Math.min(1.1,L/380+.3);r.rt=0;RX.stat.dive++;RX.act.retreat++;r.c=RX.per(e)*RX.jit();}
        else{if(RX.canShoot(e))RX.fire(e);r.c=RX.per(e)*RX.jit()/enr(e);}}
      continue;}
    e.arm=false;r.c-=dt;
    if(e.x>P.x+60&&Math.abs(P.y-e.y)<26){r.lin=(r.lin||0)+dt;if(r.lin>.6&&r.c>.2&&!RX.easy()){r.c=.2;r.lin=0;RX.stat.reacts++;}}else r.lin=0;   // parking in front of a gun is read and punished (after a full tell)
    if(r.st==='bait'&&r.c<=0){if(Math.abs(PV.y)<100&&r.hold<RX.per(e)*1.2){r.hold+=dt;continue;}r.bd=Math.sign(PV.y)||1;r.bdv=PV.y;if(r.hold>0){RX.stat.reacts++;RX.act.bait++;}r.hold=0;}
    if(r.st==='retreat'&&r.rt>1&&(r.rt>2.2||Math.hypot(P.x-e.x,P.y-e.y)>260)&&telling<tmax&&!RX.easy()){r.kind='dive';r.lx=P.x+PV.x*.3;r.ly=P.y+PV.y*.3;r.tl=Math.max(RX.TELL+.1,RX.tell(e));RX.stat.tells++;RX.stat.minTell=Math.min(RX.stat.minTell,r.tl);telling++;continue;}
    if(r.c>0||!RX.canShoot(e)||telling>=tmax)continue;
    if(r.role==='exit')continue;   // the exit gun fires with its pin partner
    const go=x=>{x.rx.kind=x.rx.st==='feint'&&!x.rx.fk?'feint':'shot';x.rx.fk=0;x.rx.tl=RX.tell(x);RX.stat.tells++;RX.stat.minTell=Math.min(RX.stat.minTell,x.rx.tl);telling++;};
    if(r.st==='feint'&&!r.fk&&RX.rng()<.4)r.fk=1;   // not every cycle is a feint (fk 2: the real shot right after a feint)
    go(e);if(r.role==='pin'&&RX.ok(r.mate)&&RX.canShoot(r.mate)){go(r.mate);r.mate.rx.kind='shot';}}});
/* WINDOW + BEARER: shots bounce off an armoured enemy except for 1 s after it fired, and off a gunner its bearer covers */
RX.shut=function(e,b){if(!this.on||!e||!e.rx)return false;
  if(e.rxA&&G.t-e.rx.vw>1){this.stat.block++;this.act.window++;return true;}
  const c=e.rx.cov;if(c&&this.ok(c)&&b){const x1=b.x,y1=b.y,dx=e.x-x1,dy=e.y-y1,L2=dx*dx+dy*dy||1,u=clamp(((c.x-x1)*dx+(c.y-y1)*dy)/L2,0,1);
    if(Math.hypot(x1+u*dx-c.x,y1+u*dy-c.y)<c.r+14){this.stat.block++;return true;}}
  return false;};
{const h0=DMG.hit;DMG.hit=function(dm,b,e){const v=h0.apply(this,arguments);if(e&&RX.shut(e,b)){if(G.t-(e.rxB||0)>.6){e.rxB=G.t;floater(e.x,e.y-e.r-12,e.rxA?'WAIT FOR IT':'FLANK IT','#19e3ff');}return 0;}return v;};}
/* tells and marks, drawn over the enemies */
RX.over=function(t){if(!RX.on||!running)return;const mo=RET.motion?RET.motion():!(SET.rm||RM);ctx.save();ctx.lineWidth=2;
  for(const e of G.en){const r=e.rx;if(!r||e.dead||e.hp<=0)continue;
    if(r.tl>0){const k=mo?.6+.4*Math.abs(Math.sin(t*14)):1;ctx.strokeStyle='rgba(255,45,120,'+k+')';ctx.beginPath();ctx.arc(e.x,e.y,e.r+6+r.tl*14,0,6.283);ctx.stroke();
      ctx.setLineDash([6,6]);ctx.beginPath();ctx.moveTo(e.x,e.y);if(r.kind==='dive')ctx.lineTo(r.lx,r.ly);else ctx.lineTo(e.x+(P.x-e.x)*.35,e.y+(P.y-e.y)*.35);ctx.stroke();ctx.setLineDash([]);}
    if(e.rxA){const open=G.t-r.vw<=1;ctx.strokeStyle=open?'#ffe14d':'#8fa3b8';ctx.lineWidth=open?3:4;ctx.beginPath();ctx.arc(e.x,e.y,e.r+3,0,6.283);ctx.stroke();ctx.lineWidth=2;}
    if(r.ld){ctx.fillStyle='#ffd23d';ctx.beginPath();ctx.moveTo(e.x-8,e.y-e.r-4);ctx.lineTo(e.x-8,e.y-e.r-12);ctx.lineTo(e.x-3,e.y-e.r-7);ctx.lineTo(e.x,e.y-e.r-14);ctx.lineTo(e.x+3,e.y-e.r-7);ctx.lineTo(e.x+8,e.y-e.r-12);ctx.lineTo(e.x+8,e.y-e.r-4);ctx.fill();}
    if(r.role==='bear'&&RX.ok(r.mate)){const a=Math.atan2(P.y-e.y,P.x-e.x);ctx.strokeStyle='#4ad1ff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(e.x,e.y,e.r+8,a-.9,a+.9);ctx.stroke();ctx.lineWidth=2;}
    if(r.enr>0){ctx.strokeStyle=mo&&Math.sin(t*20)>0?'#ff3d6a':'rgba(255,61,106,.6)';ctx.beginPath();ctx.arc(e.x,e.y,e.r+2,0,6.283);ctx.stroke();}}
  ctx.restore();};
{const dp=drawPickups;drawPickups=function(t){dp(t);try{RX.over(t);}catch(err){}};}
RX.spawn=(t,o)=>en(t,o);   // test hook (react-test)
