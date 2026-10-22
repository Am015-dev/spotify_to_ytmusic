// PURPOSE: boss HP phases, damage cap, last stand
// FLAG: none (always on)
// TEST: boss2-test.js
/* ---------- boss fights that last = parts/armour.js (flag RET.boss2; ?boss2=0 = the fights before it). BALANCE.md "Boss fights, round 4". ----------
   Owner, 17 Oct 2026: "Legend is still easy ... boss fights are still short", "even boss I can beat in seconds".
   A. a hard damage-rate cap: a boss loses at most max/(T x M) HP in any 1 s window, whatever hits it (bullets, homing, bomblets, mines, chains, blades,
      power-ups, wingmates, blasts: every source lowers e.hp, and the cap is booked in DMG.pass, which runs right before the only place a boss can die).
      Damage above the cap is absorbed by armour: sparks, a dull clang, a sheen on the HP bar. So no build can finish a fight in less than T (table B2X.T).
   B. three phases by HP (100-66 / 66-33 / 33-0%), each starting on a bar line with one bar of calm: phase 2 = new pattern order + fair.js's shield
      cores (aimed hits only); phase 3 = enrage (bigger fans, music layer) + a lane beam aimed at the ship on every 2nd bar + a short last stand
      (EXPOSED: the boss stops firing for 8 beats) at 12%.
   C. power scale: the hull is set high (x HK), and a ship whose honest damage cannot finish inside ~1.2 T gets its boss damage raised (at most x AMP); hard.js's repair is held to REP x the cap,
      so a fresh ship is not stuck: its fight ends near 1.2 T; the cap still holds the floor. */
const BOSSFY=window.BOSSFY=y=>typeof wcv!=='undefined'&&wcv===cv?Math.max(y,150):y;   // boss floaters stay below the hint line at the top of a landscape screen
const B2X=window.B2X={get on(){return true;},HK:1.8,M:1.06,AMP:12,LATE:1.2,LS:8,REP:.2,BK:5,SHT:14,
  T:{mini:{easy:42,normal:50,hard:60,vhard:65,legend:70},dist:{easy:66,normal:80,hard:95,vhard:102,legend:110},fin:{easy:100,normal:120,hard:145,vhard:158,legend:170}},   // the shortest fight in seconds
  kind(e){return e.mini?'mini':(e.k===3||ST.on&&ST.n>=40||!ST.on&&G.pos>=4)?'fin':'dist';},
  tf(e){const t=this.T[this.kind(e)];return t[SET.diff]||t.normal;},
  cap(e){return e.max/(this.tf(e)*this.M);},                     // HP per second at most (rolling 1 s window)
  hz:[],st:{bank:0,abs:0,dealt:0,amp:0,ph:[],hz:0,hzHit:0,ls:0,calm:0}};
NR.on('runStart',()=>{B2X.hz=[];B2X.st={abs:0,dealt:0,amp:0,ph:[],hz:0,hzHit:0,ls:0,calm:0};});
/* spawn: high hull, HP-driven phases (p2/p3 are set on the bar line, b.js bossBeat), the phase pattern lists */
HOOK.spawnBoss(sb=>function(o){const b=sb(o);if(!B2X.on||!b||!b.minBar)return b;
  b.hp=b.max=Math.round(b.max*B2X.HK);b.floor=b.pf0=Math.ceil(b.max*.62);b.p2=b.p3=1e9;
  const p=b.lists[1].slice(),h=Math.ceil(p.length/2),up={fan5:'fan7',fan7:'fan9'};
  b.lists=[b.lists[0],p.slice(h).concat(p.slice(0,h)),p.map(x=>up[x]||x)];   // phase 2 opens with the patterns phase 1 never used; phase 3 fans are one size up
  b.b2={w:[],bk:0,ref:b.hp,act:0,rate:0,amp:1,sp:0,sh:0,cl:0,fl:0,ls:0,lsd:0};return b;});
/* the bar line: a phase starts only on a bar, with one bar of calm; the last stand silences the boss */
{const bb=bossBeat;bossBeat=function(e,d){const s=e.b2;if(!B2X.on||!s)return bb(e,d);
  const nb=e.bt+1;if(nb%4===0&&e.x<=bossX()){const bar=nb/4;
    if(e.ph===1&&s.ref<=e.max*.665)e.p2=bar;else if(e.ph===2&&e.p3>=1e9&&s.ref<=e.max*.335)e.p3=Math.max(bar,e.p2+1);}
  if(s.ls>0){s.ls--;e.pc=-2;e.lasers=[];}
  const ph=e.ph;bb(e,d);
  if(e.ph!==ph){e.pc=-5;e.lasers=[];B2X.st.calm++;B2X.st.ph.push({ph:e.ph,bt:e.bt,t:+G.t.toFixed(2),hp:+(e.hp/e.max).toFixed(3)});
    if(e.ph===3){try{AU.intense(true);}catch(x){}}}};}
/* A + C: the cap, the phase floors and the weak-ship help, booked where DMG.pass books the frame's hull loss (b.js update: next is the boss floor and the kill check) */
{const p0=DMG.pass;DMG.pass=function(dt){const r=p0.call(this,dt);const e=G.boss;if(!B2X.on||!e||e.dead||!e.b2)return r;const s=e.b2;
  if(e.gw){s.gt=(s.gt||0)+dt;if(s.gt>B2X.SHT){s.gt=0;for(const c of e.cores)c.hp=c.hq=0;floater(e.x,e.y-e.r-30,'SHIELD OVERLOAD','#ffe14d');}}else s.gt=0;   // a shield the cores keep up longer than SHT s overloads: the cap, not the shield, sets the length
  if(e.gi===1)e.gi=2;                                            // fair.js: the 66% shield only; phase 3 has its own verb
  const raw=Math.max(0,s.ref-e.hp);
  if(e.x<=bossX())s.act+=dt;                                    // seconds since it took position (shields, calm bars and the last stand count)
  s.rate+=(raw/Math.max(dt,1e-3)-s.rate)*Math.min(1,dt/3);
  const need=s.ref/Math.max(4,B2X.LATE*B2X.tf(e)-s.act);
  s.amp=s.rate>1e-3?clamp(need/s.rate,1,B2X.AMP):B2X.AMP;     // only damage that lands is raised (a ship that does not hit gets nothing)
  const loss=raw*s.amp+s.bk;const now=G.t,cap=B2X.cap(e);s.w=s.w.filter(x=>now-x[0]<1);let used=0;for(const x of s.w)used+=x[1];
  const room=Math.max(0,cap*(window.BPL?BPL.k(e):1)-used),take=Math.min(loss,room),left=loss-take;   // damage above the cap waits in the armour (up to BK s of the cap) and goes in at the cap's pace: bursts (a salvo, a bomb) are not lost, so the cap, not the bot's rhythm, sets the length; bossplay scales the cap itself (k x cap per second; scaling the leftover room let ~94% through at k=.25)
  s.bk=Math.min(left,cap*B2X.BK);
  if(raw>0){B2X.st.dealt+=raw;if(s.amp>1)B2X.st.amp+=take-Math.min(raw,take);}
  if(left>s.bk+.01)B2X.st.abs+=left-s.bk;
  if(left>.01){s.sh=.35;
    if(now-s.sp>.12){s.sp=now;burst(e.x-e.r*.7,e.y+rnd(-e.r*.5,e.r*.5),'#cfe8ff',5,190,.25);}
    if(now-s.cl>.3){s.cl=now;AU.sfx('hit');}
    if(now-s.fl>5){s.fl=now;floater(e.x,BOSSFY(e.y-e.r-34)+22,'ARMOUR HOLDS','#cfe8ff');}}
  if(take>0)s.w.push([now,take]);
  let hp=s.ref-take;const pf=e.ph===1?e.max*.64:e.ph===2?e.max*.31:0;   // hold the HP at the next phase line until that phase starts on the bar
  if(hp<pf)hp=Math.min(s.ref,pf);
  if(raw<=0&&take<=0)hp=Math.min(e.hp,s.ref+cap*B2X.REP*dt);      // a repair (hard.js, campers only) runs at most REP of the cap, so a ship that hits keeps gaining
  e.hp=hp;e.hq=hp;s.ref=hp;
  if(e.ph===3&&!s.lsd&&e.hp<=e.max*.12){s.lsd=1;s.ls=B2X.LS;B2X.st.ls++;floater(e.x,e.y-e.r-34,'EXPOSED!','#ffe14d');G.flash=Math.max(G.flash,.2*FX());shake(8);}
  if(s.sh>0)s.sh-=dt;e.b2s=s.sh>0?1:0;return r;};}
/* phase 3: a lane beam aimed at the ship's row on every 2nd bar (warned for 1 beat on the hard tiers, 2 on Normal / Easy), never in the last stand */
NR.on('bar',()=>{if(!B2X.on||!G.live||G.dead)return;const e=G.boss;if(!e||!e.b2||e.ph!==3||e.b2.ls>0||e.x>bossX())return;e.b2.hb=(e.b2.hb|0)+1;if(e.b2.hb%(window.BPL&&BPL.on&&BPL.easy()?4:2))return;   // bossplay on, Easy/Normal early stages: every 4th bar
  const sb=60/BT.bpm,w=HARDS.includes(SET.diff)?1:2;B2X.hz.push({y:clamp(P.y,40,H-40),h:44,t0:G.t,on:G.t+w*sb,off:G.t+w*sb+.35,hit:0});B2X.st.hz++;AU.sfx('warn');});
NR.on('tick',()=>{if(!B2X.hz.length)return;const t=G.t;B2X.hz=B2X.hz.filter(z=>t<z.off);if(!G.boss){B2X.hz=[];return;}
  for(const z of B2X.hz)if(t>=z.on&&!z.hit&&Math.abs(P.y-z.y)<z.h/2+6&&P.x<G.boss.x){z.hit=1;const h0=P.hp;hurt(1);if(P.hp<h0)B2X.st.hzHit++;}});
{const dp=drawPlayer;drawPlayer=function(t){if(B2X.hz.length&&G.boss){const x1=G.boss.x-G.boss.r;ctx.save();
    for(const z of B2X.hz){const live=G.t>=z.on;ctx.globalAlpha=live?.85:.25+.2*Math.sin(G.t*30);ctx.fillStyle=live?'#ff3d6e':'#ff9a3d';ctx.fillRect(0,z.y-(live?z.h/2:2),x1,live?z.h:4);
      if(!live){ctx.globalAlpha=.18;ctx.fillRect(0,z.y-z.h/2,x1,z.h);}}ctx.restore();}
  return dp(t);};}
B2X.sheen=(x,y,w,h)=>{ctx.save();ctx.globalAlpha=.55+.25*Math.sin(G.t*18);ctx.fillStyle='#e8f4ff';ctx.fillRect(x,y,w,Math.max(1,h*.35));ctx.restore();};   // armour is absorbing: a thin bright line on the boss bar
window.__b2={B2X};
