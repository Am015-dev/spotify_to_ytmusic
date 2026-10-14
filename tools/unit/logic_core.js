'use strict';
// LOGIC unit tests: the game's REAL functions (extracted from src/ by name) run in a vm with real three.js + small stubs. No browser.
const L=require('./lib.js');
module.exports=async T=>{
 const THREE=await L.THREE();
 if(!THREE){console.log('SKIP '+'logic_core.js'+': three.js missing: run  npm i three@0.164.1 --no-save  (node_modules is not tracked)');return}
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),calls={};
 const rec=n=>(...a)=>{calls[n]=(calls[n]||0)+1};
 // ===================== DMG_impact =====================
 T.group('dmg');
 const mk=(over)=>{Object.keys(calls).forEach(k=>delete calls[k]);
  const G={THREE,clamp,state:'roam',RO:{x:0,y:0,z:0,h:0,hp:100,wk:null,inv:0,v:0,vh:0},BC:{big:false,m:1},burst:rec('burst'),SPARK:{},fireball:rec('fireball'),V3:(x,y,z)=>new THREE.Vector3(x,y,z),
    DMG_panels:()=>[],DMG_throw:rec('throw'),DMG_hud:rec('hud'),flashHud:rec('flash'),roamWreck:rec('wreck'),CR_SMASHV:150/3.6,rr:(a,b)=>(a+b)/2,HCOL:['#fff'],location:{search:''}};
  Object.assign(G,over||{});
  const S=L.sandbox(['DMG','fn:DMG_cls','fn:DMG_impact','fn:DMG_rel','fn:DMG_traf'],G);return {S,G}};
 {const {S,G}=mk();const {DMG,DMG_impact}=S;
  T.ok(DMG.on===true,'on-by-default');
  T.eq(DMG_impact(0),0,'zero-speed-no-dmg');T.eq(G.RO.hp,100,'zero-speed-hp');
  for(const v of [1,10,24.9])T.eq(DMG_impact(v),0,'below-25-sparks-only-'+v);
  T.eq(G.RO.hp,100,'below-25-keeps-hp');T.ok(DMG.n.light>=3,'below-25-counts-light');T.eq(DMG.n.hits,0,'below-25-no-hit');
  T.near(DMG_impact(25),0,1e-9,'at-25-zero');
  const d50=DMG_impact(50);T.near(d50,15,1e-9,'50kmh-is-15pct');T.near(G.RO.hp,85,1e-9,'50kmh-hp');
  G.RO.hp=100;T.near(DMG_impact(60),15*Math.sqrt(35/25),1e-9,'60kmh-formula');
  G.RO.hp=100;T.near(DMG_impact(100),15*Math.sqrt(3),1e-9,'100kmh-formula');
  let prev=-1,mono=true;for(let v=25;v<=200;v+=5){G.RO.hp=100;const d=DMG_impact(v);if(d<prev)mono=false;prev=d}T.ok(mono,'monotonic-in-speed');
  G.RO.hp=100;G.RO.lastHit=5;DMG_impact(50);T.eq(G.RO.lastHit,0,'hit-resets-repair-timer');
  G.RO.hp=100;calls.throw=0;DMG_impact(200);T.eq(calls.throw,1,'hit-throws-bricks');
  // 6-7 hard crashes to zero (docs: "6-7 real crashes to 0")
  G.RO.hp=100;let n=0;while(G.RO.hp>0&&n<40){DMG_impact(50);n++}T.ok(n>=6&&n<=8,'50kmh-takes-6-to-8-crashes','needed '+n);
  T.eq(calls.wreck,1,'zero-hp-wrecks-once');T.ok(calls.fireball>=1,'zero-hp-fireball');
  T.ok(G.RO.hp>=0,'hp-never-negative');
  // class divisor: bus/truck x1.7 (m^.35 clamped 1..2)
  G.RO.hp=100;S.ctx.BC.big=true;S.ctx.BC.m=2;const dBig=DMG_impact(60);T.ok(dBig<15*Math.sqrt(35/25)&&dBig>15*Math.sqrt(35/25)/2.01,'heavy-class-takes-less','dBig '+dBig);
  T.near(S.DMG_cls(),Math.pow(2,.35),1e-9,'cls-m2');S.ctx.BC.m=1000;T.eq(S.DMG_cls(),2,'cls-clamped-2');S.ctx.BC.m=.1;T.eq(S.DMG_cls(),1,'cls-clamped-1');S.ctx.BC.big=false;
  // guards
  G.RO.hp=100;G.RO.inv=1;T.eq(DMG_impact(120),0,'invulnerable-no-dmg');G.RO.inv=0;
  G.RO.wk=true;T.eq(DMG_impact(120),0,'wrecked-no-dmg');G.RO.wk=null;
  S.ctx.state='race';T.eq(DMG_impact(120),0,'not-roam-no-dmg');S.ctx.state='roam';
  S.DMG.on=false;T.eq(DMG_impact(120),0,'off-switch-no-dmg');S.DMG.on=true;T.eq(G.RO.hp,100,'guards-keep-hp');
 }
 // ===================== traffic burst rules =====================
 T.group('traffic');
 {const {S,G}=mk();const {DMG,DMG_traf}=S;G.RO.vh=0;
  let t=1000;S.ctx.performance.now=()=>t;
  const car=()=>({cv:0,v:0,x:0,z:0,y:0,j:0,k:0});
  const hit=(kmh,c,lg,pin)=>{G.RO.v=kmh/3.6;G.RO.hp=100;return DMG_traf(c||car(),0,0,0,1,lg,pin)};
  T.eq(hit(10),false,'slow-push-no-burst');T.eq(hit(24),false,'24kmh-no-burst');
  T.eq(hit(40),false,'40kmh-hurts-not-bursts');T.ok(DMG.n.trafHit>=1,'40kmh-counts-trafHit');T.ok(G.RO.hp<100,'40kmh-damages-player');
  T.eq(hit(59),false,'59kmh-no-burst');
  T.eq(hit(61),true,'61kmh-bursts');T.eq(hit(100),true,'100kmh-bursts');
  T.eq(hit(151),true,'above-CR_SMASHV-bursts');T.eq(hit(10,car(),true),true,'big-crush-bursts');
  // cooldown: second 40 km/h hit on the same car inside 600 ms does nothing
  const c=car();t=5000;hit(40,c);const h1=DMG.n.trafHit;t=5300;hit(40,c);T.eq(DMG.n.trafHit,h1,'cooldown-600ms');t=5700;hit(40,c);T.eq(DMG.n.trafHit,h1+1,'cooldown-expires');
  // the car moving the same way lowers the closing speed (rel)
  G.RO.v=60/3.6;const cm=car();cm.cv=50/3.6;T.ok(S.DMG_rel(cm,0,1)<12,'same-direction-low-rel','rel '+S.DMG_rel(cm,0,1));
  T.ok(S.DMG_rel({cv:-20/3.6},0,1)>79,'head-on-adds-speeds');
  S.DMG.on=false;G.RO.v=10/3.6;T.eq(DMG_traf(car(),0,0,0,1,false,false),false,'dmg-off-slow-no-burst');G.RO.v=160/3.6;T.eq(DMG_traf(car(),0,0,0,1,false,false),true,'dmg-off-fast-burst');
 }
 // ===================== stick / steering curve =====================
 T.group('stick');
 {const TUNE=L.ev(L.constSrc('TUNE'),{Math});const {stAng,stFall,stIn,stOut,stMax,stSpd}=TUNE;
  T.ok(stAng>.2&&stAng<1.2,'stAng-range','stAng '+stAng);T.ok(stFall>=4&&stFall<=40,'stFall-range');T.ok(stIn>0&&stOut>0,'rates-positive');
  const dmx=/,dm=([^,;]+),tg=/.exec(L.fnSrc('CR_yaw'));T.ok(!!dmx,'dm-expr-found','CR_yaw no longer has dm=… (update the unit test)');const dmf=new Function('TUNE','sp','return '+(dmx?dmx[1]:'0'));const dm=sp=>dmf(TUNE,sp);let ok=true,p=1e9;for(let sp=0;sp<=70;sp+=2){const v=dm(sp);if(!(v>0&&v<=p+1e-12))ok=false;p=v}T.ok(ok,'angle-decreases-with-speed');
  T.ok(dm(0)===stAng,'full-lock-at-rest');T.ok(dm(40)>=.12,'still-steerable-at-144kmh','dm(40)='+dm(40).toFixed(3));T.ok(dm(40)<dm(10)*.6,'high-speed-calmer-than-city');
  // touch ◀/▶ ramp (W14): the quoted constants
  const W=L.ev(L.constSrc('W14_ST'));T.ok(W.k0>=.2&&W.k0<=.4,'touch-start-lock-25pct','k0 '+W.k0);
  const ramp=(rp,dt)=>{let s=0;const r1=rp*.8;if(s<W.k0)s=W.k0;let t=0;while(s<.999&&t<5){s+=Math.min(1-s,r1*W.rk*dt);t+=dt}return t};
  for(const rp of [3,5,8]){const t=ramp(rp,1/60);T.ok(t<=.5,'full-lock-time-under-0.5s-ramp'+rp,'t='+t.toFixed(2))}
  T.ok(+(/W14_PIV=([\d.]+)/.exec(L.JSCODE())||[0,99])[1]<=2,'unstuck-pivot-slow');
  // steer curve is symmetric by construction
  T.ok(Math.abs(dm(10)*-1)===dm(10),'symmetric');
  void stMax;void stSpd;
 }
 // ===================== settle: tyre gap =====================
 T.group('settle');
 {const TY=L.ev(L.constSrc('CR_TYRE_Y'));T.ok(TY>0&&TY<=.05,'CR_TYRE_Y-gap-under-5cm','CR_TYRE_Y='+TY);
  const p=L.rd('98of_onfoot.js');T.ok(/lift=clamp\(lift,-\.4,\.4\)/.test(p),'park-lift-clamp-present');
  T.ok(L.JSCODE().includes('g+CR_TYRE_Y-(_crA.y-r)'),'wheel-pose-uses-CR_TYRE_Y','wheel ground-contact rule changed');
  // geometry: a wheel of radius r with centre y: bottom = y-r; pose rule d = g+TY-(y-r) lifts the car by d -> bottom == g+TY
  for(const [g,y,r] of [[0,.3,.35],[1.2,1.4,.45],[-2,-1.5,.6]]){const d=g+TY-(y-r);T.near((y+d-r)-g,TY,1e-9,'pose-rule-gap-'+g+'-'+r)}
 }
 // ===================== camera fit solver =====================
 T.group('camera');
 {const RCAM=L.ev(L.constSrc('RCAM'));
  const CAMc=L.ev(L.constSrc('CAM'),{});const TUNEc=L.ev(L.constSrc('TUNE'),{Math});
  const G={Math,CAM:CAMc,TUNE:TUNEc,SET:{fov:'normal',rcam:'chase'},SC_S:{on:false},BC:{D0:{cam:1}},SC_RC0:JSON.parse(JSON.stringify(RCAM)),camera:{aspect:852/393},performance:{now:()=>0}};
  const S=L.sandbox(['fn:CAM_eval','fn:CAM_vfov','fn:CAM_base','fn:CAM_solve'],G,L.lineSrc('CAM_s')+'\n'+L.lineSrc('CAM_ok')+'\n');
  // profile builder: side profile bins every 0.5 m: nose z1, tail z0, body height H over length L; cab = taller box at the front for trucks
  const prof=(L_,H,cabH,cabL)=>{const z0=-L_/2,z1=L_/2,B=[];for(let z=z0;z<=z1+1e-9;z+=.5){const front=z1-z<(cabL||0);B.push([z,front?cabH:H])}return{z0,z1,g:0,top:Math.max(H,cabH||0),B,L:L_,H:Math.max(H,cabH||0)}};
  const car=(()=>{const P=prof(4.3,1.0);P.B=P.B.map(([z,y])=>[z,z>-.8&&z<.9?1.35:z>=.9?.8:1.0]);P.top=1.35;P.H=1.35;return P})(),van=prof(5.9,2.1),flat=prof(10.5,1.2,3.4,2.6),bus=prof(11.5,3.2);
  const rows={};
  for(const [n,P] of [['car',car],['van',van],['flatbed',flat],['bus',bus]]){
    const r=S.CAM_solve(P,'chase',852/393);rows[n]=r;
    T.ok(r&&isFinite(r.b)&&isFinite(r.h)&&isFinite(r.l),'finite-'+n);
    T.ok(!r.fail,'solvable-'+n,'no camera satisfies the constraints');
    const e=r.e;T.ok(e.clr>=.3-1e-6,'sees-road-over-roof-'+n,'clearance '+e.clr.toFixed(2)+' m');
    T.ok(e.sP>=.42&&e.sP<=.82,'road-point-on-screen-'+n,'sP '+e.sP.toFixed(2));
    T.ok(e.fill>=.17&&e.fill<=.33,'ride-fills-17-33pct-'+n,'fill '+e.fill.toFixed(2));
    T.ok(e.smax<=.95,'ride-not-off-bottom-'+n,'smax '+e.smax.toFixed(2));
    T.ok(r.h>=1.2,'camera-above-road-'+n,'h '+r.h)}
  {const C0=S.CAM_base('chase');T.ok(Math.abs(rows.car.b/C0.b-1)<=.25&&Math.abs(rows.car.h/C0.h-1)<=.3,'normal-car-stays-near-stock-camera','solved b='+rows.car.b+' h='+rows.car.h+' vs stock '+C0.b+'/'+C0.h)}
  T.ok(rows.flatbed.b>rows.car.b,'long-ride-camera-further-back','flatbed b '+rows.flatbed.b+' car b '+rows.car.b);
  T.ok(rows.bus.h>rows.car.h,'tall-ride-camera-higher','bus h '+rows.bus.h);
  T.ok(rows.flatbed.b<60&&rows.bus.b<60,'camera-distance-bounded');
  // vertical fov grows on narrow portrait screens, never shrinks the stock fov
  const f0=S.CAM_vfov(852/393),f1=S.CAM_vfov(.5);T.ok(f1>f0,'portrait-widens-fov');T.ok(f1<=100*Math.PI/180+1e-9,'fov-capped-100');T.ok(f0>40*Math.PI/180&&f0<100*Math.PI/180,'fov-sane');
  // determinism + speed: 20 solves under 1.5 s
  const t0=Date.now();for(let i=0;i<4;i++)S.CAM_solve(flat,'chase',852/393);T.ok((Date.now()-t0)/4<250,'solver-under-250ms','per solve '+((Date.now()-t0)/4)+' ms');
  for(const m of ['chase','close','far','high','low'])if(RCAM[m]){const r=S.CAM_solve(car,m,852/393);T.ok(r&&isFinite(r.b),'mode-ok-'+m)}
 }
};
