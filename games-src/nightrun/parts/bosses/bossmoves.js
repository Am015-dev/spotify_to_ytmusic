// PURPOSE: boss movesets: verbs (vd), telegraphs, per-boss lists
// FLAG: bossmoves (?bossmoves=0)
// TEST: bossmoves-test.js
/* ---------- boss movesets = parts/bossmoves.js (flag RET.bossmoves; ?bossmoves=0 = the old ring / fan / spiral / laser lists, exactly).
   Owner, 18 Oct 2026: "Game is extremely repetitive". All ten boss fights were built from the same six attack verbs. Now every fight has its own moveset:
   8+ verbs in three phases (armour.js still owns HP, the damage cap, the 66/33% phase lines and the EXPOSED last stand: nothing here touches them),
   one signature verb found on no other boss and one COUNTER verb (the boss is shielded until you do something: shoot a target, hide, flank, graze, survive).
   A verb runs for one boss slot (8 beats = 2 bars, b.js bossBeat). Every hit it can deal is telegraphed for at least 0.5 s (BMV.tel beats, beat-aligned),
   every wall / lane leaves a gap >= BMV.GAP px, every bullet goes through b.js eb() (ebCap, BCAP and the difficulty factors apply).
   Owner-editable: BMT below (boss id -> three phase lists; an entry is 'verb' or ['verb',{n,s,...}] to scale its count / speed).
   Audit: games-src/nightrun/bossmoves-audit.js; test: bossmoves-test.js. ---------- */
if(RET.bossmoves===undefined)RET.bossmoves=!/[?&]bossmoves=0/.test(location.search);
const BMT={
  // mini-bosses (by city)
  tresor:  {nm:'TRESOR-WART',ground:1,sig:'vault_doors',ctr:'vault_lock',
            ph:[['bar_curtain','lob','rain_lane'],['vault_doors','minefield','vault_lock','split_shot'],['vault_doors','shockwave','split_shot','bar_curtain']]},
  bruecke: {nm:'BRÜCKEN-WÄCHTER',ground:1,sig:'bridge_drop',ctr:'hold_span',
            ph:[['lane_wall','bounce_orbs','g_charge'],['bridge_drop','cross_beams','hold_span','split_shot'],['bridge_drop','shockwave','g_charge','lane_wall']]},
  schranke:{nm:'SCHRANKEN-WART',sig:'barrier_gates',ctr:'signal_override',
            ph:[['tri_burst','pulse_ring','laser_sweep'],['barrier_gates','delay_bombs','signal_override','gravity_well'],['barrier_gates','beat_floor','laser_sweep','tri_burst']]},
  messe:   {nm:'MESSE-WÄCHTER',sig:'mirror_hall',ctr:'spotlight',
            ph:[['spokes','homing_orb','bar_curtain'],['mirror_hall','split_shot','spotlight','vacuum'],['spiral_rev','vacuum','mirror_hall','homing_orb']]},
  hoplite: {nm:'HOPLITE',ground:1,sig:'phalanx_wall',ctr:'flank_shield',
            ph:[['lane_wall','rain_lane','g_charge'],['phalanx_wall','delay_bombs','flank_shield','minefield'],['phalanx_wall','beat_floor','g_charge','rain_lane']]},
  // district bosses (by boss k)
  adler:   {nm:'SEK-ADLER',sig:'siren_ram',ctr:'backup_cores',
            ph:[['tri_burst','laser_sweep','homing_orb'],['siren_ram','track_beam','backup_cores','echo'],['siren_ram','bullet_time','tri_burst','track_beam']]},
  krake:   {nm:'FLUSSKRAKE',sig:'tide_lanes',ctr:'tentacle_tips',
            ph:[['spokes','rain_lane','pulse_ring'],['tide_lanes','vacuum','tentacle_tips','bounce_orbs','echo'],['tide_lanes','orbit_drones','pulse_ring','vacuum']]},
  ice:     {nm:'ZENTRAL-ICE',sig:'firewall',ctr:'overload',
            ph:[['lane_wall','laser_sweep','spiral_rev'],['firewall','cross_beams','overload','orbit_drones','gravity_well'],['firewall','bullet_time','vacuum','lane_wall']]},
  kronos:  {nm:'KRONOS',sig:'cashflow',ctr:'cash_core',
            ph:[['tri_burst','bar_curtain','bounce_orbs'],['cashflow','cross_beams','cash_core','minefield','track_beam'],['cashflow','beat_floor','tri_burst','bar_curtain']]},
  talos:   {nm:'TALOS',ground:1,sig:'spear_throw',ctr:'heat_vent',
            ph:[['stomp','lob','pulse_ring'],['spear_throw','g_charge','heat_vent','shockwave','echo'],['spear_throw','spiral_rev','stomp','lob']]}};
const BM_MINI=['tresor','bruecke','schranke','messe','hoplite'],BM_DIST={0:'adler',1:'krake',2:'ice',3:'kronos',6:'talos'};
const BMV=window.BMV={get on(){return!!RET.bossmoves;},T:BMT,GAP:120,FREE:64,hz:[],q:[],tq:[],gh:[],st:null,
  DK:{easy:.8,normal:1,hard:1.15,vhard:1.25,legend:1.35}};
BMV.reset=()=>{BMV.hz=[];BMV.q=[];BMV.tq=[];BMV.gh=[];};
BMV.stat=()=>BMV.st||(BMV.st={verbs:{},maxEb:0,cap:0,maxV:0,counter:0,guardT:0,hits:{},boss:null});
NR.on('runStart',()=>{BMV.reset();BMV.st=null;});
NR.on('bossPhase',()=>{BMV.reset();const e=G.boss;if(e&&e.bmG)BMV.unguard(e,0);});
BMV.idOf=e=>{if(e.mini)return BM_MINI[G.di]||null;return BM_DIST[e.k]||null;};
BMV.norm=x=>Array.isArray(x)?{v:x[0],p:x[1]||{}}:{v:x,p:{}};
/* lazily on the boss's first beat (armour.js and fair.js have set the hull and the phase lists by then) */
BMV.init=e=>{e.bm=null;if(!BMV.on)return;const id=BMV.idOf(e),T=id&&BMT[id];if(!T)return;
  const L=T.ph.map(l=>l.map(BMV.norm));e.bm={id,T,P:{}};for(const l of L)for(const o of l)e.bm.P[o.v]=o.p;e.lists=L.map(l=>l.map(o=>o.v));if(window.DENS)DENS.trimBoss(e);
  const s=BMV.stat();s.boss=id;if(window.BPL)BPL.init(e);};   // bossplay.js: the encounter mechanics, the seeded order
/* ---- shared helpers ---- */
BMV.tel=()=>{const sb=BT.spb||.5;return Math.max(Math.ceil(.55/sb-1e-6),HARDS.includes(SET.diff)?1:2);};   // telegraph beats: >= 0.55 s at any tempo, 2 beats on Easy / Normal
const BMX=e=>{const ph=e.ph||1,d=diff(),dk=BMV.DK[SET.diff]||1,pk=[1,1.08,1.18][ph-1];
  return{ph,d,dk,pk,tl:BMV.tel(),sb:BT.spb||.5,x1:e.x-e.r-24,gy:UIK.groundY(),
    v:s=>(s+8*Math.min(d,4))*pk,n:n=>Math.max(1,Math.round(n*dk*(ph===3?1.15:1)))};};
const BMSRC={type:'bossmv',arm:true};                             // every bullet below follows a telegraph (an armed shot for f-checks.js); 'bossmv' keeps AI.kind from turning it into a heavy shell
function bmShot(v,x,y,a,s,r,o){const n=G.eb.length;eb.src=BMSRC;eb(x,y,a,s,'#ff3dbb',r||5);eb.src=null;if(G.eb.length===n)return null;
  const b=G.eb[n];b.bmv=v;if(o)Object.assign(b,o);const st=BMV.stat(),vs=st.verbs[v]||(st.verbs[v]={uses:0,bul:0,hz:0,tel:9,boss:{}});vs.bul++;return b;}
const bmAim=(x,y)=>Math.atan2(P.y-y,P.x-x);
const bmRoom=()=>Math.max(0,ebCap()-G.eb.length);
function bmLater(e,beats,f){BMV.q.push({due:e.bt+beats,f,e,v:BMV.cur});if(BMV.cur)bmTelBul(BMV.cur,beats);}             // run f on the boss beat `beats` beats from now (the telegraph runs until then)
function bmSoon(sec,f){BMV.tq.push({t:G.t+sec,f,v:BMV.cur});}                              // a sub-beat step inside an already telegraphed pattern
/* a hazard: telegraphed for tb beats (default BMV.tel), live for dur beats. s = band | col | circ | beam | wall | well */
function bmZone(v,o,tb,dur){const sb=BT.spb||.5;tb=tb==null?BMV.tel():tb;o.v=v;o.t0=G.t;o.on=G.t+tb*sb;o.off=o.on+(dur==null?1:dur)*sb;o.c=o.c||'#ff3d6e';BMV.hz.push(o);
  const st=BMV.stat(),vs=st.verbs[v]||(st.verbs[v]={uses:0,bul:0,hz:0,tel:9,boss:{}});vs.hz++;vs.tel=Math.min(vs.tel,tb*sb);return o;}
function bmTelBul(v,tb){const st=BMV.stat(),vs=st.verbs[v]||(st.verbs[v]={uses:0,bul:0,hz:0,tel:9,boss:{}});vs.tel=Math.min(vs.tel,tb*(BT.spb||.5));}
// a marker that only shows (no damage): an aim line, a charging ball, a safe-lane glow
function bmMark(o,beats){o.t0=G.t;o.on=o.off=G.t+beats*(BT.spb||.5);o.mk=1;BMV.hz.push(o);return o;}
/* ---- shapes: every hazard is a list of primitives (rect, circle, segment) for the hit test, the clearance check and the bot ---- */
BMV.prims=(z,full)=>{if(full&&z.sw&&G.t<z.on)return[0,1,2,3,4,5,6].map(i=>({g:[z.x,z.y,z.a0+(z.a1-z.a0)*i/6,1400,z.w+30]}));switch(z.s){
  case'band':return[{r:[z.x0==null?0:z.x0,z.y-z.h/2,z.x1==null?W:z.x1,z.y+z.h/2]}];
  case'col':return[{r:[z.x-z.w/2,z.y0==null?0:z.y0,z.x+z.w/2,z.y1==null?H:z.y1]}];
  case'circ':return[{c:[z.x,z.y,z.r]}];
  case'beam':return[{g:[z.x,z.y,z.a,z.L==null||full&&z.grow?1500:z.L,z.w]}];
  case'wall':{const out=[];let y=0;const gs=(z.gaps||[]).slice().sort((a,b)=>a[0]-b[0]);for(const g of gs){if(g[0]>y)out.push({r:[z.x-z.w/2,y,z.x+z.w/2,g[0]]});y=Math.max(y,g[1]);}if(y<H)out.push({r:[z.x-z.w/2,y,z.x+z.w/2,H]});return out;}
  case'well':return[{c:[z.x,z.y,z.core||24]}];}
  return[];};
BMV.sd=(p,x,y)=>{if(p.r){const[a,b,c,d]=p.r,dx=Math.max(a-x,x-c),dy=Math.max(b-y,y-d);return dx>0&&dy>0?Math.hypot(dx,dy):Math.max(dx,dy);}
  if(p.c)return Math.hypot(x-p.c[0],y-p.c[1])-p.c[2];
  const[gx_,gy_,a,L,w]=p.g,ca=Math.cos(a),sa=Math.sin(a),px=x-gx_,py=y-gy_,u=px*ca+py*sa,v=-px*sa+py*ca,du=Math.max(-u,u-L),dv=Math.abs(v)-w/2;return du>0&&dv>0?Math.hypot(du,dv):Math.max(du,dv);};
BMV.zsd=(z,x,y)=>{let m=1e9;for(const p of BMV.prims(z))m=Math.min(m,BMV.sd(p,x,y));return m;};
const BMPAD=6;   // the ship's own hit radius around its centre
/* clearance at (x,y): distance to the nearest live (or about to be live, `ahead` s) hazard or boss-move bullet; < 0 = inside */
BMV.clear=(x,y,ahead)=>{let m=1e9;const t=G.t+(ahead||0);for(const z of BMV.hz){if(z.mk||t<z.on||G.t>=z.off)continue;m=Math.min(m,BMV.zsd(z,x,y));}
  for(const b of G.eb)if(b.bmv)m=Math.min(m,Math.hypot(b.x-x,b.y-y)-b.r-3);return m;};
/* the bot (balance-test.js and the sims): a cost for standing at (x,y) and where the counter wants the ship */
BMV.cost=(x,y)=>{if(!BMV.on||!G.boss)return 0;let c=0;for(const z of BMV.hz){if(z.mk||G.t>=z.off)continue;const soon=z.on-G.t;if(soon>.9)continue;let d=1e9;for(const p of BMV.prims(z,1))d=Math.min(d,BMV.sd(p,x,y));if(d<30)c+=(30-d)*(soon>0?60:120);
    if(z.vx)for(const k of[.3,.6]){const x0=z.x;z.x+=z.vx*k;let d2=1e9;for(const p of BMV.prims(z))d2=Math.min(d2,BMV.sd(p,x,y));z.x=x0;if(d2<30)c+=(30-d2)*40;}}   // a moving wall or wave: where it will be
  const g=BMV.goal();if(g)c+=Math.hypot(g.x-x,g.y-y)*.8;return c;};
BMV.goal=()=>{const e=G.boss;if(!e||!e.bmG)return null;return e.bmG.goal?e.bmG.goal():null;};
BMV.target=()=>{const e=G.boss,t=e&&e.bmG&&e.bmG.tg?e.bmG.tg.find(x=>!x.dead&&x.hp>0&&G.en.includes(x)):null;return t||(window.BPL&&BPL.on?BPL.target():null);};   // bossplay.js: a gate's node / medic / flank row
/* ---- counters: the boss is shielded (no HP loss) until the ship does the thing, or the slot ends ---- */
BMV.guard=(e,v,hint,o)=>{if(e.bmG)return;e.bmG=Object.assign({v,hp:e.hp,b0:e.bt,end:e.bt+8-(e.pc|0),t0:G.t,tg:[],p:0},o||{});floater(e.x,e.y-e.r-30,hint,'#19e3ff');AU.sfx('warn');BMV.stat().counter++;};
BMV.unguard=(e,won)=>{const g=e.bmG;if(!g)return;e.bmG=null;BMV.stat().guardT+=G.t-g.t0;for(const t of g.tg)if(!t.dead){t.dead=1;burst(t.x,t.y,'#19e3ff',10,200,.4);}
  if(won){e.bmS=Math.max(e.bt+1,g.end);   /* silent for the rest of the counter's slot (the next verb still starts on its own beat) */BMV.hz=BMV.hz.filter(z=>z.v!==g.v);BMV.q=BMV.q.filter(q=>q.v!==g.v);BMV.tq=BMV.tq.filter(q=>q.v!==g.v);for(const b of G.eb)if(b.bmv===g.v)b.dead=1;
    floater(e.x,e.y-e.r-30,'STUNNED!','#ffe14d');G.rings.push({x:e.x,y:e.y,l:.7,m:.7,c:'#ffe14d'});shake(8);AU.sfx('tier');G.score+=Math.round(1500*(1+G.pos));BMV.stat().won=(BMV.stat().won|0)+1;NR.emit('bmCounter',{v:g.v});}};
function bmTarget(e,v,o){const t=en('mine',Object.assign({x:e.x-80,y:e.y,wpt:1,bmT:v},o));t.hp=t.max=t.hq=Math.max(4,Math.round(e.max*(o&&o.hk||.014)));t.gr=0;if(e.bmG)e.bmG.tg.push(t);return t;}
/* ---- the verbs: VB[id] = {k: air | ground | any, sig?, ctr?, d: what it is, f(e,c,X,p)} called on beats c = 0..7 of its slot ---- */
const VB={};
const vd=(id,k,d,f,o)=>{VB[id]=Object.assign({id,k,d,f},o||{});};
// aimed triple burst: an aim line, then three quick shots down it (sidestep once)
vd('tri_burst','any','aimed triple burst',(e,c,X,p)=>{if(c%4)return;const n=p.n||3;bmMark({s:'aim',e},X.tl);bmTelBul('tri_burst',X.tl);
  bmLater(e,X.tl,()=>{const a=bmAim(e.x-20,e.y);for(let i=0;i<n;i++)bmSoon(i*.11,()=>{bmShot('tri_burst',e.x-20,e.y,a,X.v(230));if(X.ph>1&&i===n-1){bmShot('tri_burst',e.x-20,e.y,a-.4,X.v(200));bmShot('tri_burst',e.x-20,e.y,a+.4,X.v(200));}});});});
// rotating spokes: arms of bullets that turn slowly (circle with the gaps)
vd('spokes','any','rotating spokes',(e,c,X,p)=>{const arms=(p.n||4)+(X.dk>1.1?1:0)+(X.ph===3?1:0);if(c===0){e.bmA=gx(0,6.28);e.bmD=gx(0,1)<.5?1:-1;bmMark({s:'spokes',e,n:arms},X.tl);bmTelBul('spokes',X.tl);return;}
  if(c<X.tl)return;for(const h of[0,.5])bmSoon(h*X.sb,()=>{if(bmRoom()<arms)return;e.bmA+=e.bmD*.16;for(let j=0;j<arms;j++)bmShot('spokes',e.x,e.y,e.bmA+j*6.2832/arms,X.v(150));});});
// lane walls with moving gaps: a wall scrolls in, its gap moves wall to wall (thread it)
vd('lane_wall','any','lane walls with moving gaps',(e,c,X,p)=>{if(c%4)return;const m=BMV.GAP/2+20;let gy=e.bmW==null?clamp(P.y,m,H-m):clamp(e.bmW+gx(-170,170),m,H-m);e.bmW=gy;
  const g=p.gap||BMV.GAP+10;bmZone('lane_wall',{s:'wall',x:X.x1,w:22,vx:-X.v(150)*(p.s||1),gaps:[[gy-g/2,gy+g/2]],tel:'gap'},X.tl,9);});
// laser sweep: a wedge lights up from where the boss stands, then a beam sweeps through it (leave the wedge)
vd('laser_sweep','any','laser sweep',(e,c,X,p)=>{if(c%4)return;const a=bmAim(e.x-30,e.y),dir=c?1:-1,half=.22;
  bmZone('laser_sweep',{s:'beam',x:e.x-30,y:e.y,a:a-dir*half,a0:a-dir*half,a1:a+dir*half,w:16,sw:1},X.tl,2);});
// laser curtain on the bar line: four of five lanes fire on the downbeat, the safe lane moves one step
vd('bar_curtain','any','laser curtain on the bar line',(e,c,X,p)=>{if(c!==2&&c!==6)return;const n=5,lh=H/n;let s=e.bmL==null?clamp(Math.floor(P.y/lh),0,n-1):clamp(e.bmL+(gx(0,1)<.5?-1:1),0,n-1);e.bmL=s;
  const tb=Math.max(X.tl,2);for(let i=0;i<n;i++)if(i!==s)bmZone('bar_curtain',{s:'band',y:(i+.5)*lh,h:lh-2,x0:0,x1:X.x1,c:'#ff3d6e'},tb,.5);bmMark({s:'safe',y:(s+.5)*lh,h:lh,x1:X.x1},tb);});
// pulsing rings with a gap that shifts each pulse (find the gap)
vd('pulse_ring','any','pulsing rings with shifting gaps',(e,c,X,p)=>{const every=X.ph===3?2:4;if(c%every)return;const a0=bmAim(e.x,e.y),off=e.bmG2==null?0:e.bmG2+(gx(0,1)<.5?-.4:.4);e.bmG2=clamp(off,-.8,.8);
  const ga=a0+e.bmG2,dist=Math.max(160,Math.hypot(P.x-e.x,P.y-e.y)),gw=Math.max(.6,(BMV.GAP+40)/dist);bmMark({s:'wedge',x:e.x,y:e.y,a:ga,w:gw},X.tl);bmTelBul('pulse_ring',X.tl);
  bmLater(e,X.tl,()=>{AH.ring(e.x,e.y);const n=X.n(p.n||16);if(bmRoom()<6)return;for(let i=0;i<n;i++){const a=ga+gw/2+(6.2832-gw)*(i+.5)/n;bmShot('pulse_ring',e.x,e.y,a,X.v(140),6);}});});
// homing orb you must shoot: it curves after the ship and pops into a ring if it lives
vd('homing_orb','any','homing orb (shoot it)',(e,c,X,p)=>{if(c!==0&&!(c===4&&X.ph>1))return;bmMark({s:'charge',x:e.x-30,y:e.y,r:22},X.tl);bmTelBul('homing_orb',X.tl);
  bmLater(e,X.tl,()=>{bmShot('homing_orb',e.x-30,e.y,bmAim(e.x-30,e.y),X.v(115),8,{k:'r',hp:HARD?3:2,dmg:1,gc:'#9fb0ff',bmH:1.25,bmL:G.t+4});});});
// bullet rain with a safe lane: drops fall across the screen except one glowing column
vd('rain_lane','any','bullet rain with a safe lane',(e,c,X,p)=>{if(c===0){e.bmR=clamp(P.x+gx(-90,90),90,X.x1-90);bmMark({s:'safecol',x:e.bmR,w:BMV.GAP+20},X.tl+6);bmTelBul('rain_lane',X.tl);return;}
  if(c<X.tl)return;const sx=e.bmR,hw=(BMV.GAP+20)/2;for(const h of[0,.5])bmSoon(h*X.sb,()=>{const k=Math.min(X.n(p.n||3),bmRoom());for(let i=0;i<k;i++){let x;for(let t=0;t<6;t++){x=gx(30,X.x1);if(Math.abs(x-sx)>hw+12)break;}if(Math.abs(x-sx)>hw+12)bmShot('rain_lane',x,-8,Math.PI/2+gx(-.05,.05),X.v(170));}});});
// crossing beams: an X through where the ship is now (step off both lines)
vd('cross_beams','any','crossing beams',(e,c,X,p)=>{if(c%4)return;const px=clamp(P.x,40,X.x1-40),py=P.y;for(const s of[-1,1]){const y0=s<0?0:H,a=Math.atan2(py-y0,px-(X.x1+60));bmZone('cross_beams',{s:'beam',x:X.x1+60,y:y0,a,w:18,L:1500},X.tl,.6);}});
// minefield: mines appear (rings), arm, drift; on phase 2+ they pop into four shots
vd('minefield','any','minefield',(e,c,X,p)=>{if(c!==0)return;const n=X.n(p.n||5),pts=[];for(let t=0;t<40&&pts.length<n;t++){const x=gx(60,X.x1-40),y=gx(40,H-40);if(Math.hypot(x-P.x,y-P.y)<120||pts.some(q=>Math.hypot(q[0]-x,q[1]-y)<BMV.GAP+44))continue;pts.push([x,y]);}
  for(const[x,y]of pts)bmZone('minefield',{s:'circ',x,y,r:20,vx:-36,pop:X.ph>1},X.tl,7-X.tl);});
// vacuum pull, then a burst ring (fight the pull, then take the gap)
vd('vacuum','any','vacuum pull then burst',(e,c,X,p)=>{if(c===0){bmZone('vacuum',{s:'well',x:e.x,y:e.y,core:e.r+8,pull:X.v(130),R:900,fo:e,c:'#c08aff'},X.tl,3);return;}
  if(c===3){const ga=bmAim(e.x,e.y)+(gx(0,1)<.5?-.5:.5),gw=.75;bmMark({s:'wedge',x:e.x,y:e.y,a:ga,w:gw},X.tl);bmLater(e,X.tl,()=>{const n=X.n(16);if(bmRoom()<6)return;for(let i=0;i<n;i++)bmShot('vacuum',e.x,e.y,ga+gw/2+(6.2832-gw)*(i+.5)/n,X.v(150),6);});}});
// bouncing orbs: big slow orbs that bounce off the top and bottom
vd('bounce_orbs','any','bouncing orbs',(e,c,X,p)=>{if(c%4)return;const n=X.ph>1?3:2;bmMark({s:'charge',x:e.x-30,y:e.y,r:18},X.tl);bmTelBul('bounce_orbs',X.tl);
  bmLater(e,X.tl,()=>{for(let i=0;i<n;i++)bmShot('bounce_orbs',e.x-30,e.y,Math.PI+(i-(n-1)/2)*.75+gx(-.1,.1),X.v(165),10,{bmB:3});});});
// delayed bombs: a countdown ring where the ship is; it blows a beat later
vd('delay_bombs','any','delayed bombs',(e,c,X,p)=>{if(c%2||(c===6&&X.ph<2))return;const x=clamp(P.x,30,X.x1),y=P.y;bmZone('delay_bombs',{s:'circ',x,y,r:56,c:'#ffa02d',cd:1},X.tl+1,.35);
  if(X.ph>1)bmLater(e,X.tl+1,()=>{for(let i=0;i<6;i++)bmShot('delay_bombs',x,y,i*1.047+.5,X.v(110));});});
// spiral with reversal: three arms turn one way, flip on beat 4 (the arms flash before)
vd('spiral_rev','any','spiral with reversal',(e,c,X,p)=>{if(c===0){e.bmA=bmAim(e.x,e.y);e.bmD=1;bmMark({s:'spokes',e,n:3},X.tl);bmTelBul('spiral_rev',X.tl);return;}
  if(c===4){e.bmD=-e.bmD;bmMark({s:'flip',e},1);}if(c<X.tl)return;const arms=3+(X.ph===3?1:0);for(const h of[0,.5])bmSoon(h*X.sb,()=>{if(bmRoom()<arms)return;e.bmA+=e.bmD*.34;for(let j=0;j<arms;j++)bmShot('spiral_rev',e.x,e.y,e.bmA+j*6.2832/arms,X.v(150));});});
// tracking beam: a thin line follows the ship while it charges, locks 0.5 s before it fires (sidestep after the lock); three in phase 3
vd('track_beam','any','tracking beam that locks',(e,c,X,p)=>{if(c%(X.ph===3?3:4))return;const tb=Math.max(X.tl,2);bmZone('track_beam',{s:'beam',x:e.x-30,y:e.y,a:bmAim(e.x-30,e.y),w:26,lock:.5,fo:e},tb,1);});
// safe-tile floor: five columns, three strike on the beat, the safe ones glow (step with the beat)
vd('beat_floor','any','safe-tile floor on the beat',(e,c,X,p)=>{if(c%2)return;const n=5,cw=(X.x1-20)/n,cur=clamp(Math.floor((P.x-20)/cw),0,n-1);let s=e.bmF==null?cur:clamp(e.bmF+(gx(0,1)<.5?-1:1),0,n-1);e.bmF=s;
  const s2=clamp(s+(s<n-1?1:-1),0,n-1);for(let i=0;i<n;i++)if(i!==s&&i!==s2)bmZone('beat_floor',{s:'col',x:20+(i+.5)*cw,w:cw-2,c:'#ff3d6e'},Math.max(X.tl,2),.5);});
// orbiting drones: bullets circle the boss, then fling out on beat 6
vd('orbit_drones','any','orbiting drones',(e,c,X,p)=>{if(c===0){bmMark({s:'orbit',e,r:80},X.tl);bmTelBul('orbit_drones',X.tl);
  bmLater(e,X.tl,()=>{const n=X.n(6);for(let i=0;i<n;i++){const b=bmShot('orbit_drones',e.x,e.y,0,1,7);if(b){b.vx=b.vy=0;b.bmO={e,a:i*6.2832/n,r:80,w:2.2,fl:G.t+(6-X.tl)*X.sb,s:X.v(170)};}}});}});
// gravity well: a point pulls the ship while the boss fires aimed singles (thrust away and dodge)
vd('gravity_well','any','gravity well',(e,c,X,p)=>{if(c===0){const x=clamp((P.x+X.x1)/2,200,X.x1-60),y=P.y<H/2?H*.72:H*.28;bmZone('gravity_well',{s:'well',x,y,core:24,pull:X.v(110),R:300,c:'#c08aff'},X.tl,5);return;}
  if(c>=X.tl&&c%2===0&&c<=7-X.tl){bmLater(e,X.tl,()=>bmShot('gravity_well',e.x-20,e.y,bmAim(e.x-20,e.y),X.v(200)));bmMark({s:'aim',e},X.tl);bmTelBul('gravity_well',X.tl);}});
// split bullets: a big blinking shell, then it splits into a fan of five
vd('split_shot','any','split bullets',(e,c,X,p)=>{if(c%4)return;const n=X.ph===3?2:1;bmMark({s:'charge',x:e.x-30,y:e.y,r:20},X.tl);bmTelBul('split_shot',X.tl);
  bmLater(e,X.tl,()=>{const a=bmAim(e.x-30,e.y);for(let i=0;i<n;i++)bmShot('split_shot',e.x-30,e.y,a+(i-(n-1)/2)*.5,X.v(150),11,{bmS:G.t+1.15,bmSv:X.v(170)});});});
// echo: marks drop where the ship is on beats 0-3; each blows exactly one bar later (keep moving)
vd('echo','any','echo of the last bar',(e,c,X,p)=>{if(c>3)return;bmZone('echo',{s:'circ',x:clamp(P.x,20,X.x1),y:P.y,r:44,c:'#c08aff'},4,.4);});
// bullet-time burst: a slow ring, it freezes for a beat, then bursts on at 1.6x
vd('bullet_time','any','bullet-time burst',(e,c,X,p)=>{if(c===0){bmMark({s:'clock',x:e.x,y:e.y,r:e.r+18},X.tl);bmTelBul('bullet_time',X.tl);
  bmLater(e,X.tl,()=>{const n=X.n(12),o=gx(0,.5);for(let i=0;i<n;i++)bmShot('bullet_time',e.x,e.y,o+i*6.2832/n,X.v(95),6,{bmT0:G.t+2*X.sb,bmT1:G.t+3*X.sb});});}});
// GROUND: shockwave line along the road (rise above it)
vd('shockwave','ground','ground shockwave',(e,c,X,p)=>{if(c%4)return;const h=78;bmZone('shockwave',{s:'col',x:X.x1,w:30,y0:X.gy-h+30,y1:H,vx:-X.v(260),c:'#ffa02d'},X.tl,6);});
// GROUND: stomp: the road strikes and rocks fall in marked columns
vd('stomp','ground','stomp with falling rocks',(e,c,X,p)=>{if(c%4)return;bmZone('stomp',{s:'band',y:X.gy+10,h:90,x0:0,x1:X.x1,c:'#ffa02d'},X.tl,.5);
  const n=X.n(3);for(let i=0;i<n;i++){const x=clamp(P.x+(i-(n-1)/2)*(BMV.GAP+60)+gx(-20,20),30,X.x1-20);bmMark({s:'safecol',x,w:26,bad:1},X.tl);bmTelBul('stomp',X.tl);bmLater(e,X.tl,()=>bmShot('stomp',x,-8,Math.PI/2,X.v(260),9));}});
// GROUND: lob: a grenade arcs to where the ship's lane meets the road and burns a column up from it
vd('lob','ground','lobbed fire column',(e,c,X,p)=>{if(c%(X.ph>1?2:4))return;const x=clamp(P.x,40,X.x1-30);bmZone('lob',{s:'col',x,w:62,y0:X.gy-230,y1:H,c:'#ffa02d',arc:{x:e.x,y:e.y}},X.tl+1,.6);});
// GROUND: charge along the road (the boss runs at you on its ground line; rise or fall out of its row)
vd('g_charge','ground','ground charge',(e,c,X,p)=>{if(c!==0)return;bmMark({s:'safe',y:e.y,h:e.r*2+30,x1:e.x,bad:1},X.tl);bmLater(e,X.tl,()=>{e.bmC={t0:G.t,x0:e.x,y:e.y,dur:2*X.sb,to:60};AU.sfx('big');});BMV.stat();bmTelBul('g_charge',X.tl);});
/* ---- signatures (one boss each) ---- */
// TRESOR-WART: the vault doors slide in from both sides and leave one gap that drifts (follow it)
vd('vault_doors','ground','vault doors close the arena',(e,c,X,p)=>{if(c!==0)return;const m=BMV.GAP/2+30;let gy=clamp(P.y+gx(-80,80),m,H-m);const g=X.ph===3?BMV.GAP+10:BMV.GAP+40;
  const z1=bmZone('vault_doors',{s:'band',y:0,h:0,x0:0,x1:X.x1,door:-1,gy,g,c:'#ffb020'},X.tl,7-X.tl),z2=bmZone('vault_doors',{s:'band',y:H,h:0,x0:0,x1:X.x1,door:1,gy,g,c:'#ffb020'},X.tl,7-X.tl);
  for(let k=X.tl+1;k<8;k+=2)bmLater(e,k,()=>{const ty=clamp(z1.gy+gx(-110,110),m,H-m);z1.ty=z2.ty=ty;},'door');}, {sig:1});
// BRÜCKEN-WÄCHTER: bridge sections drop one by one from the right; one pier stays (stand on it or step into fallen spans)
vd('bridge_drop','ground','bridge sections drop',(e,c,X,p)=>{if(c!==0)return;const n=6,cw=(X.x1-20)/n,pier=Math.floor(gx(0,n));bmMark({s:'safecol',x:20+(pier+.5)*cw,w:cw},X.tl+n);
  for(let k=0,j=0;j<n;j++){const col=n-1-j;if(col===pier)continue;bmZone('bridge_drop',{s:'col',x:20+(col+.5)*cw,w:cw-2,c:'#ffa02d',fall:1},X.tl+k*.75,.5);k++;}},{sig:1});
// SCHRANKEN-WART: level-crossing barriers roll in; each barrier's opening flips top / bottom every 2 beats until it is close to the ship (pass in rhythm)
vd('barrier_gates','air','crossing barriers flip with the beat',(e,c,X,p)=>{if(c!==0)return;for(let i=0;i<2;i++){const z=bmZone('barrier_gates',{s:'wall',x:X.x1-i*220,w:20,vx:-X.v(95),gaps:[],flip:i%2,c:'#ffe14d'},X.tl,10);z.gaps=BMV.flipGaps(z);}},{sig:1});
BMV.flipGaps=z=>{if(z.gaps&&z.gaps.length&&z.x<P.x+150&&z.x>P.x-40)return z.gaps;const top=((Math.floor((G.t-z.on)/(2*(BT.spb||.5)))+z.flip)%2+2)%2===0,g=BMV.GAP+30;return top?[[0,g+60]]:[[H-g-60,H]];};
// MESSE-WÄCHTER: a hall of mirrors: two glass copies appear and all three fire (watch every muzzle)
vd('mirror_hall','air','mirrored clones',(e,c,X,p)=>{if(c===0){const ys=[clamp(e.y-170,60,H-60),clamp(e.y+170,60,H-60)];BMV.gh=ys.map(y=>({x:e.x-10,y,e,t0:G.t,on:G.t+X.tl*X.sb,off:G.t+8*X.sb}));bmTelBul('mirror_hall',X.tl);return;}
  if(c<X.tl||c>7-X.tl+1)return;const src=[{x:e.x,y:e.y}].concat(BMV.gh.filter(g=>G.t>=g.on&&G.t<g.off)),k=c%3===0?0:1+(c%2);const s=src[k%src.length];if(!s)return;
  bmMark({s:'aimfrom',x:s.x,y:s.y},X.tl);bmLater(e,X.tl,()=>{const a=bmAim(s.x-20,s.y);for(const d of(k?[0]:[-.3,0,.3]))bmShot('mirror_hall',s.x-20,s.y,a+d,X.v(200));});},{sig:1});
// HOPLITE: the shield wall advances; spears thrust from one of its two openings (take the quiet one)
vd('phalanx_wall','ground','shield wall with spear thrusts',(e,c,X,p)=>{if(c===0){const m=BMV.GAP/2+30,a=clamp(P.y+gx(-60,60),m,H/2-10),b=clamp(a+gx(200,280),H/2+10,H-m),g=BMV.GAP+10;
  e.bmPW=bmZone('phalanx_wall',{s:'wall',x:X.x1,w:26,vx:-X.v(105),gaps:[[a-g/2,a+g/2],[b-g/2,b+g/2]],c:'#ffcf4a',sp:[a,b]},X.tl,9);return;}
  const z=e.bmPW;if(!z||c<X.tl||c%2===0)return;const gi=(c>>1)%2,y=z.sp[gi];const tb=Math.max(2,X.tl);bmMark({s:'spear',x:z.x,y,z},tb);bmTelBul('phalanx_wall',tb);bmLater(e,tb,()=>{if(BMV.hz.includes(z))bmShot('phalanx_wall',z.x-14,y,Math.PI,X.v(300),6);});},{sig:1});
// SEK-ADLER: the siren lane flashes on your row, then the interceptor rams down it and back
vd('siren_ram','air','telegraphed ram dash',(e,c,X,p)=>{if(c!==0&&!(c===4&&X.ph===3))return;const y=clamp(P.y,e.r+10,H-e.r-10);bmMark({s:'safe',y,h:e.r*2+30,x1:e.x,bad:1,siren:1},X.tl+1);bmTelBul('siren_ram',X.tl+1);
  bmLater(e,X.tl+1,()=>{e.bmC={t0:G.t,x0:e.x,y0:e.y,y,dur:1.6*X.sb,to:40,air:1};AU.sfx('big');});},{sig:1});
// FLUSSKRAKE: two tide bands rise and fall together; the channel between them is the way (ride the tide)
vd('tide_lanes','any','tide lanes rise and fall',(e,c,X,p)=>{if(c!==0)return;const gap=BMV.GAP+30,h=110,ph=gx(0,6.28),A=Math.min(110,(H-gap-2*h)/2+60);
  for(const s of[-1,1])bmZone('tide_lanes',{s:'band',y:H/2+s*(gap/2+h/2),h,x0:0,x1:X.x1,tide:{s,A,ph,gap,h,w:1.5},c:'#2ee6d6'},X.tl,7-X.tl);},{sig:1});
// ZENTRAL-ICE: a firewall tunnel scrolls in; its port slides up and down (stay in the port)
vd('firewall','air','scrolling firewall',(e,c,X,p)=>{if(c!==0)return;const m=BMV.GAP/2+20,gy=clamp(P.y,m,H-m),g=BMV.GAP+20,fw={gy,v:X.v(50)*(gx(0,1)<.5?-1:1),m,g};
  for(let i=0;i<3;i++)bmZone('firewall',{s:'wall',x:X.x1+i*70,w:22,vx:-X.v(120),gaps:[[gy-g/2,gy+g/2]],fw,c:'#19e3ff'},X.tl,12);},{sig:1});
// KRONOS: cash-flow lanes: money streams run in two of four lanes and a beam fires down one lane on each bar line
vd('cashflow','air','cash-flow lanes with bar beams',(e,c,X,p)=>{const n=4,lh=H/n;if(c===0){e.bmCF=[0,1,2,3].sort(()=>gx(0,1)-.5).slice(0,2);for(const L of e.bmCF)bmMark({s:'safe',y:(L+.5)*lh,h:44,x1:X.x1,bad:1},X.tl);}
  if(c===0||c===4){const L=e.bmCF[c?1:0];bmZone('cashflow',{s:'band',y:(L+.5)*lh,h:lh*.5,x0:0,x1:X.x1,c:'#ffe14d'},2,.6);}
  if(c>=X.tl){bmTelBul('cashflow',X.tl);for(const L of e.bmCF)bmShot('cashflow',X.x1,(L+.5)*lh+gx(-18,18),Math.PI,X.v(170));}},{sig:1});
// TALOS: the bronze spear: an aim line locks on, then the spear flies down it and sticks for a beat
vd('spear_throw','ground','bronze spear throw',(e,c,X,p)=>{if(c%4)return;const n=X.ph===3?3:1,a=bmAim(e.x-30,e.y);for(let i=0;i<n;i++){const z=bmZone('spear_throw',{s:'beam',x:e.x-30,y:e.y,a:a+(i-(n-1)/2)*.28,w:14,L:0,grow:1700,c:'#ffcf4a'},X.tl,1.5);}},{sig:1});
/* ---- counters (one boss each): shielded until you do it ---- */
const aimSingles=(e,c,X,v)=>{if(c%2===0&&c<6){bmMark({s:'aim',e},X.tl);bmTelBul(v,X.tl);bmLater(e,X.tl,()=>bmShot(v,e.x-20,e.y,bmAim(e.x-20,e.y),X.v(170)));}};
vd('vault_lock','ground','COUNTER: shoot the lock',(e,c,X,p)=>{if(c===0){BMV.guard(e,'vault_lock','SHOOT THE LOCK');const t=bmTarget(e,'vault_lock',{y:clamp(e.y-90,50,H-50)});t.bmAt={e,dx:-120,dy:-90,w:1.6,R:30};}aimSingles(e,c,X,'vault_lock');},{ctr:1});
vd('hold_span','ground','COUNTER: survive the drops',(e,c,X,p)=>{if(c===0){BMV.guard(e,'hold_span','SURVIVE THE DROPS',{h0:ST.hits,need:6});}
  const g=e.bmG;if(c>=1&&c<=6){const n=5,cw=(X.x1-20)/n,i=Math.floor(gx(0,n));bmZone('hold_span',{s:'col',x:20+(i+.5)*cw,w:cw-2,c:'#ffa02d',fall:1},Math.max(X.tl,2),.5);}
  if(g&&g.v==='hold_span'&&c===7){if(ST.hits===g.h0)BMV.unguard(e,1);}},{ctr:1});
vd('signal_override','air','COUNTER: fly through the signals',(e,c,X,p)=>{if(c===0){const pts=[];let x=clamp(P.x,80,X.x1-80),y=P.y;for(let i=0;i<3;i++){x=clamp(x+gx(-160,160),70,X.x1-60);y=clamp(y+gx(-150,150),60,H-60);pts.push({x,y,ok:0});}
  BMV.guard(e,'signal_override','FLY THROUGH THE SIGNALS',{rings:pts,goal:()=>{const r=pts.find(q=>!q.ok);return r?{x:r.x,y:r.y}:null;}});}aimSingles(e,c,X,'signal_override');},{ctr:1});
vd('spotlight','air','COUNTER: hide behind the stalls',(e,c,X,p)=>{if(c===0){const bl=[{x:X.x1*.42,y:H*.3,w:56,h:96},{x:X.x1*.52,y:H*.72,w:56,h:96}];
  BMV.guard(e,'spotlight','HIDE BEHIND THE STALLS',{blocks:bl,hid:0,need:2*X.sb,goal:()=>{let b=bl[0],bd=1e9;for(const q of bl){const d=Math.hypot(q.x-P.x,q.y-P.y);if(d<bd){bd=d;b=q;}}const a=Math.atan2(b.y-e.y,b.x-e.x);return{x:b.x+Math.cos(a)*80,y:b.y+Math.sin(a)*80};}});
  bmZone('spotlight',{s:'beam',x:e.x-30,y:e.y,a:bmAim(e.x-30,e.y),w:30,trk:.3,fo:e,blk:bl,c:'#fff3a8'},X.tl,8-X.tl);}},{ctr:1});
vd('flank_shield','ground','COUNTER: get above or below',(e,c,X,p)=>{if(c===0)BMV.guard(e,'flank_shield','GET ABOVE OR BELOW',{fl:0,need:3*X.sb,goal:()=>({x:Math.min(P.x,X.x1-120),y:e.y>H/2?clamp(e.y-170,40,H-40):clamp(e.y+170,40,H-40)})});
  if(c>=1&&c%2===1){bmZone('flank_shield',{s:'band',y:e.y,h:110,x0:0,x1:X.x1,c:'#ffcf4a'},X.tl,.5);}},{ctr:1});
vd('backup_cores','air','COUNTER: shoot the backup',(e,c,X,p)=>{if(c===0){BMV.guard(e,'backup_cores','SHOOT THE BACKUP');for(let i=0;i<2;i++){const t=bmTarget(e,'backup_cores',{hk:.009});t.bmAt={e,orb:110,a:i*3.14,w:1.1};}}aimSingles(e,c,X,'backup_cores');},{ctr:1});
vd('tentacle_tips','any','COUNTER: shoot the tentacles',(e,c,X,p)=>{if(c===0){BMV.guard(e,'tentacle_tips','SHOOT THE TENTACLES');for(const s of[-1,1]){const t=bmTarget(e,'tentacle_tips',{hk:.009});t.bmAt={e,fx:X.x1-170,fy:H/2+s*150,R:40,w:1.3};}}
  if(c%2===1&&e.bmG){for(const t of e.bmG.tg)if(!t.dead){const tx=t.x,ty=t.y;bmMark({s:'aimfrom',x:tx,y:ty},X.tl);bmTelBul('tentacle_tips',X.tl);bmLater(e,X.tl,()=>bmShot('tentacle_tips',tx,ty,bmAim(tx,ty),X.v(160)));}}},{ctr:1});
vd('overload','air','COUNTER: graze to overload',(e,c,X,p)=>{if(c===0)BMV.guard(e,'overload','GRAZE TO OVERLOAD',{gz:0,need:SET.diff==='easy'?5:7});
  if(c%2===0){const ga=bmAim(e.x,e.y)+gx(-.3,.3),gw=.9;bmMark({s:'wedge',x:e.x,y:e.y,a:ga,w:gw},X.tl);bmTelBul('overload',X.tl);bmLater(e,X.tl,()=>{const n=X.n(12);if(bmRoom()<6)return;for(let i=0;i<n;i++)bmShot('overload',e.x,e.y,ga+gw/2+(6.2832-gw)*(i+.5)/n,X.v(105),6);});}},{ctr:1});
vd('cash_core','air','COUNTER: shoot the gold core',(e,c,X,p)=>{if(c===0){BMV.guard(e,'cash_core','SHOOT THE GOLD CORE');const t=bmTarget(e,'cash_core',{hk:.016});t.bmAt={e,orb:100,a:3.14,w:1.2};t.bmGold=1;}
  if(c%2===0&&c<6){bmMark({s:'aim',e},X.tl);bmTelBul('cash_core',X.tl);bmLater(e,X.tl,()=>{const a=bmAim(e.x-20,e.y);for(const d of[-.32,0,.32])bmShot('cash_core',e.x-20,e.y,a+d,X.v(175));});}},{ctr:1});
vd('heat_vent','ground','COUNTER: shoot the vent',(e,c,X,p)=>{if(c===0)BMV.guard(e,'heat_vent','SHOOT THE VENT');
  if(c===0||c===4){bmZone('heat_vent',{s:'band',y:X.gy+10,h:90,x0:0,x1:X.x1,c:'#ffa02d'},X.tl,.5);bmLater(e,X.tl,()=>{if(!e.bmG)return;const t=bmTarget(e,'heat_vent',{hk:.012});t.bmAt={e,dx:-e.r*.4,dy:-e.r-26,R:0,w:0};t.bmLife=G.t+3*X.sb;});}},{ctr:1});
BMV.VB=VB;
/* ---- the beat: b.js bossBeat calls this in place of its own switch when the boss has a moveset (e.bm) ---- */
BMV.beat=(e,v,c,d)=>{if(e.bmG)e.floor=Math.max(e.floor||0,e.bmG.hp);
  const due=BMV.q.filter(q=>q.e===e&&q.due<=e.bt);BMV.q=BMV.q.filter(q=>!(q.e===e&&q.due<=e.bt));for(const q of due)try{q.f();}catch(x){console.warn(x);}
  if(c===0&&e.bmG&&(e.bmG.v!==v||e.bt>=e.bmG.end))BMV.unguard(e,0);                              // the counter's slot is over: the shield drops (no reward)
  if(e.bmS>e.bt)return;const V=VB[v];if(!V)return;const X=BMX(e),st=BMV.stat();if(c===0){const vs=st.verbs[v]||(st.verbs[v]={uses:0,bul:0,hz:0,tel:9,boss:{}});vs.uses++;vs.boss[e.bm.id]=1;}
  BMV.cur=v;eb.src=null;V.f(e,c,X,e.bm.P[v]||{});eb.src=null;};
// the glow before a shot: is something of this boss due on the next beat?
BMV.next=e=>e.bmS>e.bt+1?false:BMV.q.some(q=>q.e===e&&q.due===e.bt+1);
/* ---- every frame: hazards move, hit, and the counters are judged ---- */
NR.on('graze',()=>{const e=G.boss;if(e&&e.bmG&&e.bmG.v==='overload'){e.bmG.gz++;if(e.bmG.gz>=e.bmG.need)BMV.unguard(e,1);}});
NR.on('tick',dt=>{if(!BMV.on)return;const e=G.boss;if(!e||!e.bm){if(BMV.hz.length||BMV.q.length||BMV.gh.length)BMV.reset();return;}
  const st=BMV.stat();let nl=0;for(const b of G.eb)if(!b.dead&&!(b.g&&!b.bmv&&b.r===3.5))nl++;st.maxEb=Math.max(st.maxEb,nl);   /* ai.js rocket pellets skip eb() on purpose */st.cap=Math.max(st.cap,ebCap());for(const b of G.eb)if(b.bmv)st.maxV=Math.max(st.maxV,Math.hypot(b.vx,b.vy));
  if(e.b2&&e.b2.ls>0){if(BMV.hz.length||BMV.q.length)BMV.reset();if(e.bmG)BMV.unguard(e,0);}            // armour.js last stand: the boss is silent
  const t=G.t,sb=BT.spb||.5;
  const tq=BMV.tq.filter(q=>q.t<=t);BMV.tq=BMV.tq.filter(q=>q.t>t);for(const q of tq)try{q.f();}catch(x){console.warn(x);}
  /* charges (ground run / air ram): the boss leaves its spot and comes back */
  if(e.bmC){const C=e.bmC,k=(t-C.t0)/C.dur;if(k>=1){e.bmC=null;}else{const out=k<.5?k*2:2-k*2,ease=out*out*(3-2*out);e.x=C.x0+(C.to-C.x0)*ease;if(C.air)e.y=C.y0+(C.y-C.y0)*Math.min(1,k*4);}}
  /* hazards */
  for(const z of BMV.hz){if(z.vx)z.x+=z.vx*dt;
    if(z.fo&&!z.mk){z.x=z.fo.x-30;z.y=z.fo.y;}
    if(z.s==='beam'&&z.sw&&t>=z.on){const k=clamp((t-z.on)/(z.off-z.on),0,1);z.a=z.a0+(z.a1-z.a0)*k;}
    if(z.lock){if(t<z.on-z.lock){z.a=bmAim(z.x,z.y);}else if(!z.fx_){z.fx_=1;z.fo=null;}}
    if(z.s==='beam'&&z.trk){const want=bmAim(z.x,z.y);let da=Math.atan2(Math.sin(want-z.a),Math.cos(want-z.a));const r=(t<z.on?2:1)*z.trk*dt;z.a+=clamp(da,-r,r);}
    if(z.s==='beam'&&z.grow&&t>=z.on)z.L=Math.min(1500,(t-z.on)*z.grow);
    if(z.blk&&z.s==='beam'){z.L=BMV.rayBlock(z.x,z.y,z.a,z.blk);}
    if(z.door){const tg=z.ty==null?z.gy:z.ty;z.gy+=clamp(tg-z.gy,-120*dt,120*dt);const k=clamp((t-z.t0)/(z.on-z.t0),0,1),edge=z.door<0?(z.gy-z.g/2)*k:(H-z.gy-z.g/2)*k;z.h=Math.max(0,edge*2);z.y=z.door<0?0:H;}
    if(z.tide){const T=z.tide,mid=H/2+T.A*Math.sin((t-z.t0)*T.w+T.ph);z.y=mid+T.s*(T.gap/2+T.h/2);}
    if(z.fw){const F=z.fw;if(z===BMV.hz.find(q=>q.fw===F)){F.gy+=F.v*dt;if(F.gy<F.m||F.gy>H-F.m){F.v=-F.v;F.gy=clamp(F.gy,F.m,H-F.m);}}z.gaps=[[F.gy-F.g/2,F.gy+F.g/2]];}
    if(z.flip!=null&&t>=z.on)z.gaps=BMV.flipGaps(z);
    if(z.s==='well'&&t>=z.on&&t<z.off&&!G.dead){const dx=z.x-P.x,dy=z.y-P.y,d=Math.hypot(dx,dy);if(d>1&&d<z.R){P.x+=dx/d*z.pull*dt;P.y+=dy/d*z.pull*dt;}}
    if(z.pop&&!z.popd&&t>=z.off-.02){z.popd=1;for(let i=0;i<4;i++)bmShot('minefield',z.x,z.y,i*1.5708+.785,(110+8*diff())*1.05);}
    if(!z.mk&&t>=z.on&&t<z.off&&!G.dead&&!z.hit&&(z.x==null||z.x>-60)&&BMV.zsd(z,P.x,P.y)<BMPAD){const h0=P.hp;hurt(1);z.hit=1;if(P.hp<h0){st.hits[z.v]=(st.hits[z.v]|0)+1;}}}
  BMV.hz=BMV.hz.filter(z=>t<z.off&&(z.x==null||z.x>-80&&z.x<W+200));   // bands and markers have no x
  BMV.gh=BMV.gh.filter(g=>t<g.off);
  /* special bullets */
  for(const b of G.eb){if(!b.bmv)continue;
    if(b.bmH){if(t>b.bmL){b.dead=1;for(let i=0;i<6;i++)bmShot('homing_orb',b.x,b.y,i*1.047,(100+8*diff()));continue;}const sp=Math.hypot(b.vx,b.vy),cur=Math.atan2(b.vy,b.vx),want=Math.atan2(P.y-b.y,P.x-b.x);let da=Math.atan2(Math.sin(want-cur),Math.cos(want-cur));const a=cur+clamp(da,-b.bmH*dt,b.bmH*dt);b.vx=Math.cos(a)*sp;b.vy=Math.sin(a)*sp;}
    if(b.bmB>0&&(b.y<12&&b.vy<0||b.y>H-12&&b.vy>0)){b.vy=-b.vy;b.bmB--;}
    if(b.bmS&&t>=b.bmS){b.dead=1;const a=Math.atan2(b.vy,b.vx);for(let i=0;i<5;i++)bmShot('split_shot',b.x,b.y,a+(i-2)*.32,b.bmSv);continue;}
    if(b.bmO){const O=b.bmO;if(t<O.fl&&G.boss===O.e){O.a+=O.w*dt;b.x=O.e.x+Math.cos(O.a)*O.r;b.y=O.e.y+Math.sin(O.a)*O.r;b.vx=b.vy=0;}else{const a=O.a+.6,k=Math.min(BCAP,O.s*PW.bs*bsM());b.vx=Math.cos(a)*k;b.vy=Math.sin(a)*k;b.bmO=null;}}
    if(b.bmT0){if(t>=b.bmT0&&!b.bmF0){b.bmF0=[b.vx,b.vy];b.vx=b.vy=0;}if(b.bmF0&&t>=b.bmT1){const k=Math.min(1.6,BCAP/Math.max(1,Math.hypot(b.bmF0[0],b.bmF0[1])));b.vx=b.bmF0[0]*k;b.vy=b.bmF0[1]*k;b.bmT0=0;b.bmF0=null;}}}
  /* counter targets follow their anchors */
  for(const x of G.en){if(!x.bmAt)continue;const A=x.bmAt;if(x.bmLife&&t>x.bmLife){x.dead=1;continue;}
    if(A.orb){A.a+=A.w*dt;x.x=A.e.x+Math.cos(A.a)*A.orb;x.y=A.e.y+Math.sin(A.a)*A.orb;}else if(A.fx!=null){x.x=A.fx;x.y=A.fy+Math.sin(t*A.w)*A.R;}else{x.x=A.e.x+A.dx+Math.cos(t*A.w)*A.R;x.y=clamp(A.e.y+A.dy+Math.sin(t*A.w)*A.R,30,H-30);}}
  /* counters */
  const g=e.bmG;if(g&&g.v==='flank_shield'&&Math.abs(P.y-e.y)>120){g.fl+=dt;g.hp=Math.min(g.hp,e.hp);if(g.fl>=g.need)BMV.unguard(e,1);}
  if(g&&e.bmG){if(e.hp<g.hp){e.hp=g.hp;if(e.b2)e.b2.ref=g.hp;}e.floor=Math.max(e.floor||0,g.hp);
    if(g.tg.length&&g.tg.every(x=>x.dead||x.hp<=0||!G.en.includes(x))&&g.v!=='heat_vent')BMV.unguard(e,1);
    else if(g.v==='heat_vent'&&g.tg.some(x=>(x.dead||x.hp<=0)&&!x.bmLifeOut&&!(x.bmLife&&t>x.bmLife)))BMV.unguard(e,1);
    else if(g.rings){for(const r of g.rings){if(!r.ok&&Math.hypot(P.x-r.x,P.y-r.y)<38){r.ok=1;AU.sfx('perfect');G.rings.push({x:r.x,y:r.y,l:.5,m:.5,c:'#3dffb0'});break;}if(!r.ok)break;}if(g.rings.every(r=>r.ok))BMV.unguard(e,1);}
    else if(g.blocks){const hid=BMV.rayBlock(e.x-30,e.y,bmAim(e.x-30,e.y),g.blocks)<Math.hypot(P.x-e.x+30,P.y-e.y)-8;if(hid)g.hid+=dt;if(g.hid>=g.need)BMV.unguard(e,1);}}});
/* the first point where a ray from (x,y) at angle a enters a block (stalls): the spotlight stops there */
BMV.rayBlock=(x,y,a,bl)=>{const ca=Math.cos(a),sa=Math.sin(a);let best=1500;for(const b of bl){const x0=b.x-b.w/2,x1=b.x+b.w/2,y0=b.y-b.h/2,y1=b.y+b.h/2;let t0=0,t1=1500;
  for(const[p,d,lo,hi]of[[x,ca,x0,x1],[y,sa,y0,y1]]){if(Math.abs(d)<1e-9){if(p<lo||p>hi){t0=1e9;break;}continue;}let u=(lo-p)/d,v=(hi-p)/d;if(u>v)[u,v]=[v,u];t0=Math.max(t0,u);t1=Math.min(t1,v);}if(t0<=t1&&t0<best)best=t0;}return best;};
/* ---- drawing (c.js calls BMV.draw before the ship): telegraphs pulse thin, live hazards are solid ---- */
BMV.draw=tm=>{const e=G.boss;if(!e||!e.bm)return;const t=G.t;ctx.save();
  for(const z of BMV.hz){const live=!z.mk&&t>=z.on,k=z.on>z.t0?clamp((t-z.t0)/(z.on-z.t0),0,1):1,pul=.35+.25*Math.sin(t*22);ctx.globalAlpha=live?(RET.first30?F30.A:.82):z.mk?.5*(1-.4*k)+.1:.18+.3*k*pul*2;
    const col=RET.first30&&z.c?F30.col(z.c):z.c||'#ff3d6e';ctx.save();ctx.fillStyle=ctx.strokeStyle=col;
    switch(z.s){
      case'band':case'col':case'wall':for(const p of BMV.prims(z)){const[a,b,c2,d]=p.r;if(live)ctx.fillRect(a,b,c2-a,d-b);else{ctx.lineWidth=2;ctx.setLineDash([8,6]);ctx.strokeRect(a,b,c2-a,d-b);ctx.setLineDash([]);ctx.globalAlpha*=.35;ctx.fillRect(a,b,c2-a,d-b);ctx.globalAlpha/=.35;}}
        if(z.arc&&!live){ctx.beginPath();const ax=z.arc.x+(z.x-z.arc.x)*k,ay=z.arc.y+(z.y0+60-z.arc.y)*k-Math.sin(k*3.1416)*160;ctx.arc(ax,ay,7,0,7);ctx.fill();}break;
      case'circ':ctx.lineWidth=live?0:2;ctx.beginPath();ctx.arc(z.x,z.y,live?z.r:z.r*(z.cd?1.6-.6*k:1),0,7);if(live)ctx.fill();else ctx.stroke();if(!live){ctx.globalAlpha*=.3;ctx.beginPath();ctx.arc(z.x,z.y,z.r*k,0,7);ctx.fill();}break;
      case'beam':{const L=z.L==null?1400:z.L;ctx.translate(z.x,z.y);ctx.rotate(z.a);if(live){if(RET.first30)F30.beam(Math.max(L,2),Math.max(z.w,20),col);else ctx.fillRect(0,-z.w/2,Math.max(L,2),z.w);}else{ctx.lineWidth=2;ctx.setLineDash([10,8]);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(z.grow?1500:z.blk?L:1400,0);ctx.stroke();ctx.setLineDash([]);}
        ctx.rotate(-z.a);ctx.translate(-z.x,-z.y);if(z.sw&&!live){ctx.globalAlpha=.16;ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(z.x,z.y);ctx.arc(z.x,z.y,1400,Math.min(z.a0,z.a1),Math.max(z.a0,z.a1));ctx.closePath();ctx.fill();}break;}
      case'well':ctx.lineWidth=2;for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(z.x,z.y,(z.core||24)+((t*60+i*40)%120),0,7);ctx.globalAlpha=live?.5:.2;ctx.stroke();}ctx.globalAlpha=live?.85:.3;ctx.beginPath();ctx.arc(z.x,z.y,z.core||24,0,7);ctx.fill();break;
      case'aim':{const s=z.e;ctx.lineWidth=2;ctx.setLineDash([6,8]);ctx.beginPath();ctx.moveTo(s.x-20,s.y);ctx.lineTo(P.x,P.y);ctx.stroke();ctx.setLineDash([]);break;}
      case'aimfrom':ctx.lineWidth=2;ctx.setLineDash([6,8]);ctx.beginPath();ctx.moveTo(z.x,z.y);ctx.lineTo(P.x,P.y);ctx.stroke();ctx.setLineDash([]);ctx.beginPath();ctx.arc(z.x,z.y,14,0,7);ctx.stroke();break;
      case'charge':ctx.beginPath();ctx.arc(z.x,z.y,z.r*(.4+.6*k),0,7);ctx.globalAlpha=.6;ctx.fill();break;
      case'clock':ctx.lineWidth=3;ctx.beginPath();ctx.arc(z.x,z.y,z.r,-1.57,-1.57+6.28*k);ctx.stroke();break;
      case'orbit':ctx.lineWidth=2;ctx.setLineDash([5,7]);ctx.beginPath();ctx.arc(z.e.x,z.e.y,z.r,0,7);ctx.stroke();ctx.setLineDash([]);break;
      case'spokes':case'flip':{const s=z.e,n=z.n||3;ctx.lineWidth=2;ctx.setLineDash([6,8]);for(let j=0;j<n;j++){const a=(s.bmA||0)+j*6.2832/n;ctx.beginPath();ctx.moveTo(s.x,s.y);ctx.lineTo(s.x+Math.cos(a)*260,s.y+Math.sin(a)*260);ctx.stroke();}ctx.setLineDash([]);break;}
      case'wedge':ctx.globalAlpha=.22;ctx.fillStyle='#3dffb0';ctx.beginPath();ctx.moveTo(z.x,z.y);ctx.arc(z.x,z.y,900,z.a-z.w/2,z.a+z.w/2);ctx.closePath();ctx.fill();break;
      case'safe':ctx.globalAlpha=.2;ctx.fillStyle=z.bad?'#ff3d6e':'#3dffb0';ctx.fillRect(0,z.y-z.h/2,z.x1||W,z.h);if(z.siren){ctx.globalAlpha=.5*(Math.sin(t*30)>0?1:0);ctx.fillRect(0,z.y-2,z.x1,4);}break;
      case'safecol':ctx.globalAlpha=.2;ctx.fillStyle=z.bad?'#ff3d6e':'#3dffb0';ctx.fillRect(z.x-z.w/2,0,z.w,H);break;
      case'spear':ctx.globalAlpha=.8;ctx.fillStyle='#ff3d6e';ctx.beginPath();ctx.moveTo(z.z.x-18,z.y);ctx.lineTo(z.z.x+4,z.y-8);ctx.lineTo(z.z.x+4,z.y+8);ctx.closePath();ctx.fill();break;}ctx.restore();}
  ctx.globalAlpha=1;
  for(const gh of BMV.gh){const k=clamp((t-gh.t0)/Math.max(.01,gh.on-gh.t0),0,1);ctx.globalAlpha=.25+.3*k;ctx.fillStyle=e.col||'#ffcf4a';ctx.strokeStyle='#e8f4ff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(gh.x,gh.y,e.r,0,7);ctx.fill();ctx.stroke();}
  const g=e.bmG;if(g){ctx.globalAlpha=.5+.2*Math.sin(t*10);ctx.strokeStyle='#19e3ff';ctx.lineWidth=4;ctx.beginPath();ctx.arc(e.x,e.y,e.r+16,0,7);ctx.stroke();
    if(g.rings)for(const r of g.rings){ctx.globalAlpha=r.ok?.25:.85;ctx.strokeStyle='#3dffb0';ctx.lineWidth=4;ctx.beginPath();ctx.arc(r.x,r.y,34,0,7);ctx.stroke();if(!r.ok)break;}
    if(g.blocks){ctx.globalAlpha=.9;for(const b of g.blocks){ctx.fillStyle='#3a2a5e';ctx.fillRect(b.x-b.w/2,b.y-b.h/2,b.w,b.h);ctx.strokeStyle='#ffcf4a';ctx.lineWidth=2;ctx.strokeRect(b.x-b.w/2,b.y-b.h/2,b.w,b.h);}}
    if(g.tg)for(const x of g.tg)if(!x.dead){ctx.globalAlpha=.9;ctx.strokeStyle=x.bmGold?'#ffe14d':'#19e3ff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x.x,x.y,x.r+8+2*Math.sin(t*12),0,7);ctx.stroke();}}
  ctx.restore();};
window.__bmv={BMV,BMT,VB};
/* bossvis.js (loads later) names the phase by its first verb: give the new verbs readable names there */
NR.on('runStart',()=>{const V=window.BV;if(!V||!V.NAMES)return;for(const k in VB)if(!V.NAMES[k])V.NAMES[k]=k.replace(/_/g,' ').toUpperCase();});
