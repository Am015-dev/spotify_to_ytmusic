// PURPOSE: scale round 3: power-aware enemy hull
// FLAG: scale3 (?scale3=0)
// TEST: scale3-test.js
/* ---------- scale, round 3 = parts/hard.js (flag RET.scale3; ?scale3=0 = round 2 exactly). BALANCE.md "Power scale, round 3". ----------
   Owner, 17 Oct 2026 (third report): on Legend a maxed ship parks, homing swarm + guns + fusions + power-ups kill everything and bosses fall in seconds.
   Hard tiers only (hard, very hard, legend); Easy and Normal keep round 2.
   A. a total damage-per-second ceiling on ordinary enemies: refilled at S3.cap() per second (1 s saved up at most); it grows with the stage and the
      ship's power and is never below what a fresh ship deals.
   B. auto-aim: a homing shot retargets at most S3.RT times, loses its lock when the target is behind the ship or outside the ship's forward cone,
      and does not keep a CRESCENDO bonus; damage from shots that really curved (and arc/leap chains) is held at <= S3.SH of the total.
   C. bosses: auto-aimed damage on a boss counts x S3.bA; with no aimed hit on it for 2.5 s the boss repairs itself (up to its phase top). */
if(RET.scale3===undefined)RET.scale3=!/[?&]scale3=0/.test(location.search);
const S3=window.S3={get on(){return!!RET.scale3;},RT:1,SH:.35,bA:.35,bK:.55,bT:.55,
  st:{aup:0,all:0,au:0,man:0,cut:0,bau:0,bman:0,reg:0,t:0},   // damage counters (counted with the flag off too: the probe reads them)
  au:0,man:0,ka:1,bud:0,cur:null,ctx:0,
  hard(){return S2.hard();},
  act(){return this.on&&this.hard()&&!G.lab&&!G.tut;},
  fresh(n){return 40+2.8*n;},                                    // about what a fresh ship deals on ordinary enemies on stage n, Legend (measured, BALANCE.md round 3)
  cap(){const n=Math.min(40,S2.stg());return this.fresh(n)*SC.hpK()*(1+.8*SC.f());}};   // fresh ship x the power's hull factor x up to 1.7: a maxed ship kills ~1.7x faster than a fresh one, not 2.3x+ (tighter crowds the screen: ram deaths)
NR.on('runStart',()=>{S3.au=S3.man=0;S3.ka=1;S3.bud=0;for(const k in S3.st)S3.st[k]=0;});
const S3auto=b=>b&&b.au&&(b.tu||0)>.2;                           // a shot that locked and really curved
/* B. homing with a lock budget and a facing rule (hard tiers); round 2's steer elsewhere */
{const st1=SH.steer;SH.steer=function(b,dt,k){S3.cur=b;if(!S3.act()){const c0=Math.atan2(b.vy,b.vx),r=st1.call(this,b,dt,k);let d=Math.atan2(b.vy,b.vx)-c0;b.tu=(b.tu||0)+Math.abs(Math.atan2(Math.sin(d),Math.cos(d)));return r;}
  k=k||this.hm;b.ag=(b.ag||0)+dt;if(b.ag<.18)return;
  const ok=e=>e&&!e.dead&&e.hp>0&&!e.dying&&!e.gr&&!e.wpt&&e.type!=='gate'&&e.x<W-20&&e.y>0&&e.y<H&&e.x>P.x+30&&e.x>b.x-10&&Math.abs(Math.atan2(e.y-P.y,e.x-P.x))<.87;
  const cur=Math.atan2(b.vy,b.vx);let t=b.tg;if(t&&!ok(t))t=b.tg=null;
  if(!t){if((b.rt|0)>S3.RT)return;let bd=1e9;
    for(const e of G.en){if(!ok(e))continue;const dx=e.x-b.x,dy=e.y-b.y,d=Math.hypot(dx,dy);if(d>=300||d>=bd)continue;let da=Math.atan2(dy,dx)-cur;da=Math.atan2(Math.sin(da),Math.cos(da));if(Math.abs(da)>.7)continue;bd=d;t=e;}
    if(!t)return;b.tg=t;b.rt=(b.rt|0)+1;}
  if(!b.au&&(b.hk||SH.hm)){b.au=1;const a=S2.ak();b.dm*=(b.hk?a:(1+a)/2)*S2.park();if(b.ck>1)b.dm/=b.ck;}   // round 2's cut; a homing shot drops its CRESCENDO bonus
  const sp=Math.hypot(b.vx,b.vy);let want=Math.atan2(t.y-b.y,t.x-b.x)-cur;want=Math.atan2(Math.sin(want),Math.cos(want));
  const tk=dt*2.2*k*.75,dv=clamp(want,-tk,tk),a=cur+dv;b.tu=(b.tu||0)+Math.abs(dv);b.vx=Math.cos(a)*sp;b.vy=Math.sin(a)*sp;};}
{const vol=SH.volley;SH.volley=function(x,y,pf){const n0=G.pb.length;vol.call(this,x,y,pf);const k=typeof PW2!=='undefined'&&PW2.cresK?PW2.cresK():1;if(k>1)for(let i=n0;i<G.pb.length;i++)G.pb[i].ck=k;};}
/* every bullet hit (b.js passes the bullet and the enemy) and every weapon hit (WP.hurtE) is counted; arc and leap chains are auto-aim */
{HOOK['DMG.hit'](h0=>function(d,b,e){let v=h0.call(this,d);S3.cur=null;const au=S3auto(b),boss=e&&e.type==='boss';
  if(au)S3.au+=v;else S3.man+=v;
  if(boss){if(au)S3.st.bau+=v;else{S3.st.bman+=v;e.s3a=G.t;}}
  if(S3.act()&&au)v*=boss?Math.min(S3.ka,S3.bA):S3.ka;if(au)S3.st.aup+=v;return v;});
 const hu=WP.hurtE;WP.hurtE=function(e,dm){if(S3.ctx){S3.au+=dm;if(e.type==='boss')S3.st.bau+=dm;if(S3.act())dm*=e.type==='boss'?Math.min(S3.ka,S3.bA):S3.ka;}else{S3.man+=dm;if(e.type==='boss'){S3.st.bman+=dm;e.s3a=G.t;}}return hu.call(this,e,dm);};
 for(const f of['arcZap','leap']){const o=WP[f];WP[f]=function(...a){S3.ctx++;try{return o.apply(this,a);}finally{S3.ctx--;}};}}
/* A. the damage ceiling on ordinary enemies, applied where DMG.pass books each frame's hull loss */
{const p0=DMG.pass;DMG.pass=function(dt){if(this.on){let raw=0;const L=[];
    for(const e of G.en){if(e.dead||e.type==='boss'||e.gr||e.rk||e.hq==null||e.x>W-40)continue;const l=Math.min(e.hq-e.hp,Math.max(0,e.hq));if(l>0){raw+=l;L.push(e,l);}}
    S3.st.all+=raw;S3.st.t+=dt;
    if(S3.act()){const c=S3.cap();S3.bud=Math.min(c,S3.bud+c*dt);
      if(raw>S3.bud){const k=S3.bud/raw;for(let i=0;i<L.length;i+=2)L[i].hp=L[i].hq-L[i+1]*k;S3.st.cut+=raw-S3.bud;S3.bud=0;}else S3.bud-=raw;}}
  return p0.call(this,dt);};}
NR.on('tick',dt=>{const a=Math.min(1,dt/3),au=S3.au,man=S3.man;S3.st.au+=au;S3.st.man+=man;S3.au=S3.man=0;
  S3.eA=(S3.eA||0)+(au/Math.max(dt,1e-3)-(S3.eA||0))*a;S3.eM=(S3.eM||0)+(man/Math.max(dt,1e-3)-(S3.eM||0))*a;
  S3.ka=S3.eA>1?clamp(S3.SH/(1-S3.SH)*S3.eM/S3.eA,.08,1):1;     // auto-aimed damage after the cut is at most SH of the total
  S3.ka=1-(1-S3.ka)*Math.min(1,SC.f()/.4);                       // ... for a strong ship: a fresh one keeps its homing
  if(!S3.act()||!G.live)return;const e=G.boss;if(!e||e.dead||!e.minBar||e.x>bossX())return;
  if(e.s3a==null)e.s3a=G.t;if(G.t-e.s3a>2.5&&!(e.cores&&e.cores.length)&&!(window.B2X&&B2X.on&&!CAMP.on)){const top=e.max*[1,.66,.33][Math.min(2,e.gi|0)],r=Math.min(top-e.hp,e.max*.012*dt);if(r>0){e.hp+=r;e.hq=e.hp;if(e.hp0!=null)e.hp0+=r;S3.st.reg+=r;}}});
/* the district and final bosses on the hard tiers: auto-aim hits them at bA and they repair themselves, so their hull is cut to keep the fight at ~55-80 s for a maxed ship */
{const sb1=spawnBoss;spawnBoss=function(o){const b=sb1(o);if(b&&S3.on&&S2.hard()&&!b.mini){b.hp=b.max=Math.round(b.max*S3.bK);b.floor=b.pf0=Math.ceil(b.max*.62);}return b;};}
{const t0=B2.tmin;B2.tmin=function(e){const t=t0.call(this,e);return S3.on&&S2.hard()&&!e.mini?Math.round(t*S3.bT):t;};}   // ... and its damage budget is shorter: the shield cores and the repair add their time
window.__s3={S3};
