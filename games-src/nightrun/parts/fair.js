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
  const cur=Math.atan2(b.vy,b.vx),nh=hd||MM.on,cone=nh?.7:1.05,R=nh?300:380;   // MM (must move): every tier gets the narrow cone
  let best=null,bd=1e9;
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
/* D. must move (flag RET.mustmove, ?mustmove=0 = before; BALANCE.md "Must move"). Owner, 19 Oct 2026: on Normal a ship that only lines up with the next foe
   and never dodges cleared most stages with any weapon (mustmove-test.js 'track': 60%). A ship that keeps its x inside 70 px for MM.win() seconds gets a COLUMN
   STRIKE: a vertical lane locks on its x, pulses for MM.tel() s (>= .6), then fires for .25 s. One sidestep of ~45 px (or a dash) clears it, the rest of the
   screen stays free, so a moving ship is never hit. Strikes repeat while the ship stays in the column zone and hit harder from the second one on.
   Homing on Normal and Easy also gets the narrower cone and shorter reach of the hard tiers: a missile needs the ship to point at its target. */
if(RET.mustmove===undefined)RET.mustmove=!/[?&]mustmove=0/.test(location.search);
/* D2. readable + graded strike (flag RET.strike2, ?strike2=0 = D as above; BALANCE.md "Strike 2"). Owner/review, 20 Oct 2026: the strike was the one wall (a bot that did not read it failed 40 of 45
   Normal stages). Now: a faint dotted line shows at 65% of the still-timer (the first one of a stage also hints MOVE, once per profile); the lock-on pulses on the beat for 3 beats (hard tiers 2) and
   the strike lands on a beat. Normal stages <= 8: the first strike of a stage only scorches (-250 score). Damage: Easy 1; Normal 1, 2 from the third in a row; Hard/Very hard 2 from the second (a camper must still die); Legend 3 from the
   third. A repeat strike needs half the still-time and follows after .9 s. The timer is x range < 70 px for win() s (Normal 5 s in stages 3-5, then 3.5 s); it pauses while a pickup is within 70 px (collecting). */
if(RET.strike2===undefined)RET.strike2=!/[?&]strike2=0/.test(location.search);
const MM=window.MM={get on(){return!!RET.mustmove;},COL:24,buf:[],acc:0,col:null,cd:0,n:0,hits:0,strikes:0,sn:0,stk:null,still:0,anc:null,pre:null,scorch:[],
  s2(){return!!RET.strike2;},
  win(){const w={easy:5,normal:3.5,hard:3.2,vhard:3,legend:2.8}[SET.diff]||4;return this.s2()&&SET.diff==='normal'&&ST.on&&ST.n<=5?5:w;},
  rate(){for(const k of G.pk)if(Math.hypot(k.x-P.x,k.y-P.y)<70)return 0;return 1;},   // a ship that is collecting is not camping (a foe lined up ahead does NOT slow it: the tracker bot does exactly that)
  dmg(){const d=SET.diff;if(!this.s2())return this.n>=2&&d!=='easy'?2:1;if(d==='normal'&&ST.on&&ST.n<=8&&this.sn===1)return 0;if(d==='easy')return 1;if(d==='normal')return this.n>=3?2:1;return d==='legend'&&this.n>=3?3:this.n>=2?2:1;},
  tel(){return{easy:1.1,normal:.95,hard:.8,vhard:.75,legend:.7}[SET.diff]||.95;},
  live(){return this.on&&G.live&&!G.dead&&G.transT<0&&!G.lab&&!G.tut&&!SH.active&&!ST.over&&!G.over&&!godMode&&(ST.on?ST.n>=3:G.t>20);},
  cost(x){const c=this.col;return c&&Math.abs(x-c.x)<(c.w||this.COL)+30?(c.fire>0||c.t<.4?6000:1500):0;}};   // for test bots: the lane as a player sees it
NR.on('runStart',()=>{Object.assign(MM,{buf:[],acc:0,col:null,cd:0,n:0,hits:0,strikes:0,sn:0,stk:null,still:0,anc:null,pre:null,scorch:[]});});
NR.on('tick',dt=>{if(!MM.live()){MM.col=null;MM.buf=[];MM.n=0;MM.still=0;MM.anc=null;MM.pre=null;return;}
  const s2=MM.s2();if(s2){const key=ST.on?ST.n:0;if(MM.stk!==key){MM.stk=key;MM.sn=0;MM.still=0;MM.anc=null;MM.scorch=[];}
    for(const q of MM.scorch)q.t-=dt;MM.scorch=MM.scorch.filter(q=>q.t>0);
}
  MM.acc+=dt;const k=Math.round(MM.win()*10);if(MM.acc>=.1){MM.acc=0;if(!s2||MM.rate())MM.buf.push(P.x);if(MM.buf.length>k)MM.buf.splice(0,MM.buf.length-k);}
  let lo=1e9,hi=-1e9;for(const x of MM.buf){if(x<lo)lo=x;if(x>hi)hi=x;}if(hi-lo>140)MM.n=0;   // a real move resets the escalation
  MM.pre=s2&&!MM.col&&MM.cd<=0&&MM.buf.length>=.65*k&&hi-lo<70?P.x:null;
  if(MM.pre!==null&&MM.sn===0&&!MM.hinted){MM.hinted=1;let seen=0;try{seen=localStorage.getItem('mnr_mmhint');if(!seen)localStorage.setItem('mnr_mmhint','1');}catch(e){}if(!seen)hintShow('MOVE! Standing still draws a strike',3.5,'#ff7080');}
  const c=MM.col;if(c){c.t-=dt;if(c.t<=0&&!c.fire&&!c.done){c.fire=.25;AU.sfx('big');shake(4);}
    if(c.fire>0){c.fire-=dt;if(!c.hit&&Math.abs(P.x-c.x)<c.w){c.hit=1;MM.hits++;if(c.dmg>0)hurt(c.dmg);else{G.score=Math.max(0,G.score-250);MM.scorch.push({x:c.x,t:6});floater(P.x,P.y-30,'SCORCHED -250','#ff7080');shake(3);}}if(c.fire<=0){c.done=1;MM.col=null;MM.cd=SET.diff==='easy'?2.4:MM.s2()&&MM.n>=2?.9:1.6;}}return;}
  MM.cd-=dt;if(MM.cd>0)return;const kk=s2&&MM.n>=2?Math.round(k*.5):k;if(MM.buf.length<kk||hi-lo>=70)return;
  MM.n++;MM.strikes++;MM.sn++;let tl=MM.tel();
  if(s2){const bp=bpos(),nb=SET.diff==='hard'||SET.diff==='vhard'||SET.diff==='legend'?2:3;if(isFinite(bp)){tl=(Math.ceil(bp)+nb-bp)*BT.spb;while(tl<.6)tl+=BT.spb;tl=Math.min(tl,2);}MM.buf=[];}   // lands on a beat
  MM.col={x:P.x,t:tl,tl,fire:0,hit:0,dmg:MM.dmg(),w:s2?MM.COL*(1+.5*Math.min(3,Math.max(0,MM.n-1))):MM.COL};AU.sfx('warn');
  if(MM.strikes===1)floater(P.x,P.y-44,'SIDESTEP!','#ff6a7a');});
{const dp=drawPickups;drawPickups=function(t){dp(t);if(G.dead)return;const w0=MM.COL;
  if(MM.scorch.length||MM.pre!==null){ctx.save();for(const q of MM.scorch){ctx.globalAlpha=Math.min(.5,q.t/6*.5);ctx.fillStyle='#401018';ctx.fillRect(q.x-w0*.5,0,w0,H);}
    if(MM.pre!==null){ctx.globalAlpha=SET.reduce?.4:.25+.2*Math.sin(t*9);ctx.strokeStyle='#ff7080';ctx.lineWidth=1.5;ctx.setLineDash([3,12]);ctx.beginPath();ctx.moveTo(MM.pre,0);ctx.lineTo(MM.pre,H);ctx.stroke();ctx.setLineDash([]);}ctx.restore();}
  const c=MM.col;if(!c)return;const w=c.w||MM.COL;
  ctx.save();ctx.globalCompositeOperation='lighter';
  if(c.fire>0){if(!ART.span('fx-w34-strike-col',c.x,H/2,w*2,H,0,.95)){ctx.globalAlpha=.95;ctx.fillStyle='#ffffff';ctx.fillRect(c.x-w*.5,0,w,H);ctx.globalAlpha=.5;ctx.fillStyle='#ff3050';ctx.fillRect(c.x-w,0,w*2,H);}}
  else{const lock=c.t<(c.tl&&MM.s2()?BT.spb:.4),pulse=SET.reduce?1:MM.s2()&&c.tl?(bpos()%1<.5?1:.55):Math.floor(t*(lock?18:8))%2?1:.6;ctx.globalAlpha=(lock?.9:.5)*pulse;ctx.strokeStyle=lock?'#ff3050':'#ff7080';ctx.lineWidth=lock?3:1.5;ctx.setLineDash(lock?[]:[14,10]);
    for(const dx of[-w,w]){ctx.beginPath();ctx.moveTo(c.x+dx,0);ctx.lineTo(c.x+dx,H);ctx.stroke();}ctx.setLineDash([]);if(!ART.span('fx-w34-strike-col',c.x,H/2,w*2,H,0,(lock?.5:.28)*pulse)){ctx.globalAlpha=.16*pulse;ctx.fillStyle='#ff3050';ctx.fillRect(c.x-w,0,w*2,H);}}
  ctx.restore();};}
