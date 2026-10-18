/* ---------- scale, round 2 = parts/fair.js (flag RET.scale2; ?scale2=0 = the state after round 1). BALANCE.md "Power scale, round 2". ----------
   Owner, 17 Oct 2026: on Legend a maxed ship parks, its missiles kill everything, it hops between two spots when bullets come, and bosses are trivial.
   A. auto-aim: homing shots only lock on a foe that is on screen, past its entry grace and inside a forward cone, after a short lock-on delay, and a locked shot
      hits softer (S2.ak); arc chains too. A ship that camps (stays within 60 px of one spot for 6 s, hops between near spots included) is treated as standing
      still by the anti-idle logic (h.js STILL) and its auto-aim hits at half strength.
   B. bosses: hull grows with the player's power, a damage-per-second ceiling stops burst from skipping phases, and at 66% / 33% the boss is shielded until
      its cores are shot (cores are never auto-aimed).
   C. pattern pressure (hard tiers, stage 11 on): an aimed shot at the ship's current position (a little lead) on the beat and, from stage 15, a bullet wall
      every 4 bars whose gap moves; every gap is >= S2.GAP px. Normal with a strong ship gets a sparse aimed shot. Kill-goal stages keep the old hull. */
if(RET.scale2===undefined)RET.scale2=!/[?&]scale2=0/.test(location.search);
const S2=window.S2={get on(){return!!RET.scale2;},GAP:120,
  hard(){return HARDS.includes(SET.diff);},
  stg(){return ST.on?ST.n:6*(G.pos+5*G.loop)+2;},
  ak(){return{easy:1,normal:.8,hard:.62,vhard:.56,legend:.5}[SET.diff]||1;},     // damage of an auto-aimed (locked) shot
  park(){return CAMP.on?.5:1;},                                        // a parked ship's auto-aim hits at half strength
  walls:[],shots:0};
const CAMP={buf:[],acc:0,ct:0,on:0};
/* A. auto-aim */
{const st0=SH.steer;SH.steer=function(b,dt,k){if(!S2.on)return st0.call(this,b,dt,k);k=k||this.hm;b.ag=(b.ag||0)+dt;const hd=S2.hard();
  if(b.ag<(hd?.18:.1))return;                                                  // lock-on delay: a missile flies straight first
  const cur=Math.atan2(b.vy,b.vx),cone=hd?.7:1.05,R=hd?300:380;let best=null,bd=1e9;
  for(const e of G.en){if(e.type==='gate'||e.hp<=0||e.dying||e.gr||e.wpt||e.x<b.x-10||e.x>W-20||e.y<0||e.y>H)continue;
    const dx=e.x-b.x,dy=e.y-b.y,d=Math.hypot(dx,dy);if(d>=R||d>=bd)continue;let da=Math.atan2(dy,dx)-cur;da=Math.atan2(Math.sin(da),Math.cos(da));if(Math.abs(da)>cone)continue;bd=d;best=e;}
  if(!best)return;if(!b.au&&(b.hk||SH.hm)){b.au=1;const a=S2.ak();b.dm*=(b.hk?a:(1+a)/2)*S2.park();}   // weapon homing pays the full price, the shop's Homing perk half
  const sp=Math.hypot(b.vx,b.vy);let want=Math.atan2(best.y-b.y,best.x-b.x)-cur;want=Math.atan2(Math.sin(want),Math.cos(want));
  const tk=dt*2.2*k*(hd?.75:1),a=cur+clamp(want,-tk,tk);b.vx=Math.cos(a)*sp;b.vy=Math.sin(a)*sp;};
 for(const f of['arcZap','leap']){const o=WP[f];WP[f]=function(...a){if(!S2.on)return o.apply(this,a);const h=this.hurtE,m=S2.ak()*S2.park();this.hurtE=(e,dm)=>h.call(this,e,dm*m);try{return o.apply(this,a);}finally{this.hurtE=h;}};}}
/* camping: within 60 px of the mean of the last 6 s (two near spots included) counts as standing still on the hard tiers */
NR.on('runStart',()=>{CAMP.buf=[];CAMP.acc=0;CAMP.ct=0;CAMP.on=0;S2.walls=[];S2.shots=0;});
NR.on('tick',dt=>{if(!S2.on||!G.live||G.dead||!S2.hard()){CAMP.on=0;return;}
  CAMP.acc+=dt;if(CAMP.acc>=.1){CAMP.acc=0;CAMP.buf.push(P.x,P.y);if(CAMP.buf.length>120)CAMP.buf.splice(0,2);}
  const b=CAMP.buf,n=b.length/2;let on=0;if(n>=60){let mx=0,my=0;for(let i=0;i<b.length;i+=2){mx+=b[i];my+=b[i+1];}mx/=n;my/=n;let md=0;for(let i=0;i<b.length;i+=2)md=Math.max(md,Math.hypot(b[i]-mx,b[i+1]-my));on=md<60;}
  CAMP.on=on;CAMP.ct=on?CAMP.ct+dt:0;
  if(on&&G.t>6&&G.transT<0&&!G.lab&&!G.tut)STILL.t=Math.max(STILL.t,STILLF()+1+CAMP.ct);});   // h.js does the rest: hunter shots, the sniper lane, then the static discharge
/* B. bosses */
const B2={tmin(e){return(e.mini?{normal:30,hard:40,vhard:44,legend:46}:{normal:34,hard:48,vhard:52,legend:56})[SET.diff]||0;}};   // seconds the HP bar takes at the most (DPS ceiling)
{const sb0=spawnBoss;spawnBoss=function(o){const b=sb0(o);if(S2.on&&b){const k=(1+.3*SC.f())*(b.mini?1:.7);b.hp=b.max=Math.round(b.max*k);b.floor=b.pf0=Math.ceil(b.max*.62);b.gi=0;b.cores=[];b.gw=0;b.cf=0;}return b;};   // district and final bosses x.7: the shield gates add their time
 const bb0=bossBeat;bossBeat=function(e,d){bb0(e,d);e.pf0=e.floor;if(S2.on&&e.cf>0&&e.minBar)e.floor=Math.max(e.floor,e.cf);};}   // pf0: the phase floor (b.js) under the DPS ceiling
NR.on('tick',dt=>{if(!S2.on||!G.live)return;const e=G.boss;if(!e||e.dead||!e.minBar||e.x>bossX()||!e.cores)return;   // minBar 0 = a test or lab kill
  const n=S2.hard()?2:SET.diff==='normal'?1:0;
  if(n&&e.gi<2&&!e.gw&&e.hp<=e.max*[.66,.33][e.gi]){e.gw=1;const ys=n>1?[70,H-70]:[P.y<H/2?H-70:70];
    for(const y of ys){const c=en('turret',{x:W+30,y,stop:W-250-60*Math.random(),wpt:1});c.t=-60;c.hp=c.max=c.hq=Math.max(6,Math.round(e.max*.035));e.cores.push(c);}floater(e.x,e.y-e.r-30,'SHIELD! SHOOT THE CORES','#19e3ff');AU.sfx('warn');}
  if(e.gw){e.cores=e.cores.filter(c=>!c.dead&&c.hp>0&&G.en.includes(c));if(!e.cores.length){e.gw=0;e.gi++;floater(e.x,e.y-e.r-30,'SHIELD DOWN','#ffe14d');shake(6);}}
  const T=B2.tmin(e),cap=T?e.max/T:0;if(e.hp0==null)e.hp0=e.hp;e.bud=Math.min(cap*1.5,Math.max(0,(e.bud==null?cap:e.bud)-Math.max(0,e.hp0-e.hp))+cap*dt);e.hp0=e.hp;   // a damage budget: cap per second, at most 1.5 s of it saved up
  e.cf=e.gw?e.hp:T?e.hp-e.bud:0;e.floor=Math.max(e.pf0||0,e.cf);});
/* C. pattern pressure */
NR.on('beat',()=>{if(!S2.on||!G.live||G.dead||G.transT>=0||G.lab||G.tut||SH.active)return;const s=S2.stg(),n=Math.floor(G.bc);let ev=0;
  if(S2.hard()&&s>=11)ev=SET.diff==='legend'&&s>=25?2:3;else if(SET.diff==='normal'&&s>=8&&SC.f()>.4)ev=4;   // Normal: only a strong ship gets the extra aimed shot
  if(ev&&n%ev===0){const c=G.en.filter(e=>e.type!=='gate'&&e.type!=='swarm'&&!e.gr&&!e.wpt&&e.x<W-30&&e.x>P.x+150&&e.x<bossX()+40);
    if(c.length){const e=c[Math.floor(Math.random()*c.length)],t=Math.min(.6,Math.hypot(P.x-e.x,P.y-e.y)/420)*.5;eb.src=e;eb(e.x-10,e.y,Math.atan2(P.y+PV.y*t-e.y,P.x+PV.x*t-e.x),200,'#ff7ad9',5);eb.src=null;S2.shots++;}}
  if(S2.hard()&&s>=(SET.diff==='hard'?25:18)&&n%16===0){const m=S2.GAP/2+30,gy=m+Math.random()*(H-2*m);S2.walls.push(gy);if(S2.walls.length>40)S2.walls.shift();   // the gap moves every 2 bars
    for(let y=16;y<H;y+=34)if(Math.abs(y-gy)>S2.GAP/2+5){const k=G.eb.length;eb(W+8,y,Math.PI,135+15*(SET.diff==='legend'),'#ff9a3d',5);if(G.eb.length>k)G.eb[k].s2w=1;}}});
/* stage 30 was a wall: a kill goal with round 1's hull could not be met inside the song; kill-goal stages keep the old hull */
{const h0=SC.hpK.bind(SC);SC.hpK=()=>{const v=h0();return S2.on&&ST.on&&ST.def&&ST.def.goal&&ST.def.goal.k==='kill'?1:v;};}
window.__s2={S2,CAMP,B2};
