/* ---------- boss ENCOUNTER MECHANICS = parts/bossplay.js (flag RET.bossplay, default off for now; ?bossplay=1 = on, ?bossplay=0 / off = the fights before it, exactly). Test: nightrun/bossplay-test.js.
   Owner, 20 Oct 2026: "the enemies, bosses are also very predictable and repeatable; I beat the game very easy on normal ... the game needs to be more creative".
   Every boss had its own moveset (bossmoves.js) but every fight was still "dodge while shooting the bar". Now each boss brings three MECHANICS that change how
   you play, built from placeholder shapes (circles, triangles, squares; real art can replace BPL.draw later):
     GATES (the boss's shield; while a gate is up its armour lets nothing through, B2X room x 0; resolve it and the boss is OPEN for OPEN s, then the next gate rises)
       nodes  : shield nodes orbit the boss; shoot every node (they fire at you while they live)
       medic  : a medic drone holds a link beam on the boss; kill the medic or DASH through the beam
       emp    : an armour plate locks the core; only an EMP strips it
       parry  : a slow signal orb is the only thing that can crack the shell; DASH as it reaches you to send it back
       back   : the shield turns to face you; flank (get above / below) for FLANK s to reach the back
     ARENA rules (the battlefield changes; ignoring them costs hull)
       slab (barrier rises / falls), conveyor (deck pushes you into the boss), grid (laser columns on the bar line), ghost (a mirrored ship hunts you),
       gravity (lanes pull you up / down), blackout (only the beat-lit lane can be seen), zone (a safe ring shrinks)
   Each fight picks 2 of its 3 mechanics per phase (each boss has two gates and one arena rule, so a gate is always up) and shuffles its attack order with a
   seed per attempt (signature verb kept first). A gate that is ignored overloads by itself after FB s, so no fight can lock; armour.js still owns HP, the cap,
   the phase lines and the last stand (EXPOSED = always open). Hooks: armour.js room x BPL.k(e); bossmoves.js BMV.init -> BPL.init; c.js draw; stats.js sheet. */
if(RET.bossplay===undefined)RET.bossplay=/[?&]bossplay=1/.test(location.search);   // OFF by default: bossmoves-test still misses a phase-3 verb now and then with it on, stage 8 Normal ~58-67% (HANDOFF.md)
if(RET.bossplay)RET.sioKeys.push('mnr_bpcodex');
const BPT={
  tresor:  {m:['nodes','emp','slab'],     line:'BREAK THE BOLTS, EMP THE PLATE'},
  bruecke: {m:['medic','back','conveyor'],line:'CUT THE LINK, FLANK THE SHIELD'},
  schranke:{m:['parry','nodes','grid'],   line:'PARRY THE SIGNAL, SHOOT NODES'},
  messe:   {m:['back','medic','ghost'],   line:'FLANK IT, KILL THE MEDIC'},
  hoplite: {m:['back','parry','slab'],    line:'GET BEHIND IT, PARRY THE SPEAR'},
  adler:   {m:['nodes','medic','blackout'],line:'SHOOT THE DRONES, CUT THE LINK'},
  krake:   {m:['medic','nodes','gravity'],line:'KILL THE MEDIC, RIDE THE PULL'},
  ice:     {m:['emp','parry','blackout'], line:'EMP THE FIREWALL, PARRY THE PACKET'},
  kronos:  {m:['nodes','emp','zone'],     line:'SHOOT THE COINS, STAY IN THE RING'},
  talos:   {m:['back','parry','grid'],    line:'FLANK THE GIANT, PARRY THE SPEAR'}};
const BPN={nodes:'SHIELD NODES',medic:'MEDIC LINK',emp:'ARMOUR PLATE',parry:'PARRY ORB',back:'TURNING SHIELD',slab:'MOVING BARRIER',conveyor:'CONVEYOR DECK',
  grid:'LASER GRID',ghost:'MIRROR GHOST',gravity:'GRAVITY LANES',blackout:'BLACKOUT',zone:'SHRINKING RING'};
const BPH={nodes:'SHOOT THE NODES',medic:'KILL THE MEDIC OR DASH THE LINK',emp:'EMP THE PLATE',parry:'DASH TO PARRY THE ORB',back:'FLANK: GET ABOVE OR BELOW'};
const BP_GATES=['nodes','medic','emp','parry','back'];
const BPL=window.BPL={get on(){return!!RET.bossplay&&!!RET.bossmoves;},T:BPT,N:BPN,OPEN:8,FB:24,FBE:4,LEAK:.45,OPENE:14,EASYN:12,FLANK:.8,TEL:.8,GAP:96,auto:/[?&]bpauto=1/.test(location.search)?1.5:0,seed:null,
  st:null,hz:[]};
BPL.fb=()=>BPL.easy()?BPL.FBE:BPL.FB;   /* Easy/Normal early stages: an ignored gate overloads quickly, so a player who only dodges still wins (slowly) */
BPL.easy=()=>ST.on&&ST.n<=BPL.EASYN&&!HARDS.includes(SET.diff);
BPL.opn=()=>BPL.easy()?BPL.OPENE:BPL.OPEN;
BPL.stat=()=>BPL.st||(BPL.st={boss:null,seed:0,pick:[],order:[],seen:{},res:{},how:{},fb:0,open:0,closed:0,tel:9,gap:1e9,hits:0,eb:0,maxV:0,cap:0,maxEb:0,hints:[]});
NR.on('runStart',()=>{BPL.st=null;BPL.hz=[];});
/* a small seeded generator per attempt (the attack order and the picks; the game's own random stays untouched) */
BPL.rng=s=>{let a=s>>>0||1;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};};
BPL.k=e=>{const b=e&&e.bp;if(!BPL.on||!b)return 1;if(e.b2&&e.b2.ls>0||e.bmS>e.bt)return 1;   /* the last stand and a bossmoves STUN are always open */return b.g&&b.g.up?(BPL.easy()?BPL.LEAK:0):1;};   // Easy/Normal early stages: a raised gate still lets LEAK of the damage through, so the fight takes about as long as before
/* called at the end of BMV.init (the movesets are set): the seed, the picks per phase, the shuffled order */
BPL.init=e=>{e.bp=null;if(!BPL.on||!e.bm)return;const T=BPT[e.bm.id];if(!T)return;
  const seed=BPL.seed!=null?BPL.seed:(Math.random()*4294967295)>>>0,R=BPL.rng(seed),sig=e.bm.T.sig;
  e.lists=e.lists.map((l,i)=>{const a=l.slice(),lo=i===2?1:0;for(let j=a.length-1;j>lo;j--){const k=lo+Math.floor(R()*(j-lo+1));[a[j],a[k]]=[a[k],a[j]];}   // phase 3 keeps its second verb (the one verb only it has)
    if(i>0&&a.includes(sig)){a.splice(a.indexOf(sig),1);a.unshift(sig);}return a;});           // phases 2-3 still open with the signature verb
  const pick=[0,1,2].map(()=>{const drop=Math.floor(R()*3);return T.m.filter((_,j)=>j!==drop);});
  e.bp={id:e.bm.id,T,seed,R,pick,g:null,gi:0,ar:null,cy:0};
  const s=BPL.stat();s.boss=e.bm.id;s.seed=seed;s.pick=pick.map(p=>p.slice());s.order=e.lists.map(l=>l.slice());
  BPL.phase(e,1);BPL.say(e.nm+': '+T.line,5);};
BPL.say=(t,d)=>{BPL.stat().hints.push(t);try{hintShow(t,d||3.5);}catch(x){}};
BPL.codex=()=>{try{return JSON.parse(localStorage.getItem('mnr_bpcodex')||'{}')||{};}catch(x){return{};}};
BPL.seen=(e,m)=>{const s=BPL.stat();s.seen[m]=1;const c=BPL.codex(),id=e.bp.id,o=c[id]||(c[id]={nm:String(e.nm||id),m:[]});if(!o.m.includes(m)){o.m.push(m);try{localStorage.setItem('mnr_bpcodex',JSON.stringify(c));}catch(x){}}};
BPL.sheet=()=>{const c=BPL.codex(),ids=Object.keys(BPT).filter(id=>c[id]);if(!ids.length)return'';
  const esc=s=>String(s).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
  return'<h3>BOSS CODEX <span>'+ids.length+'/'+Object.keys(BPT).length+'</span></h3><div class="stParts">'+ids.map(id=>'<div><span>'+esc(c[id].nm)+'</span><em>'+c[id].m.map(m=>esc(BPN[m]||m)).join(' · ')+'</em></div>').join('')+'</div>';};
/* a phase: its two mechanics (gates take turns; an arena rule runs the whole phase) */
BPL.phase=(e,ph)=>{const b=e.bp;if(!b)return;const p=b.pick[ph-1]||b.pick[0];b.gs=p.filter(m=>BP_GATES.includes(m));b.ar=p.find(m=>!BP_GATES.includes(m))||null;b.gi=0;b.arS={};
  BPL.drop(e);BPL.hz=[];if(b.ar)BPL.seen(e,b.ar);BPL.gate(e,G.t+(ph===1?1.5:2*(BT.spb||.5)*4));
  if(ph>1)BPL.say('PHASE '+ph+': '+p.map(m=>BPN[m]).join(' + '),3.5);};
BPL.drop=e=>{const g=e.bp&&e.bp.g;if(!g)return;for(const t of g.tg||[])if(!t.dead&&G.en.includes(t)){t.dead=1;G.en.splice(G.en.indexOf(t),1);}e.bp.g=null;};
/* a gate rises at time t0 (telegraphed TEL s: shapes fade in, damage still counts), then holds until it is resolved or overloads after FB s */
BPL.gate=(e,t0)=>{const b=e.bp,m=b.gs[b.gi%b.gs.length];b.gi++;BPL.drop(e);b.g={m,t0,up:0,tg:[],ct:0,fl:0,orb:null,ob:0,sa:Math.PI,shot:0,open:0};};
BPL.raise=(e,g)=>{g.up=1;g.tu=G.t;BPL.seen(e,g.m);const ph=e.ph||1,s=BPL.stat();s.closed++;
  if(g.m==='nodes'){const n=ph===3?4:3;for(let i=0;i<n;i++)g.tg.push(BPL.add(e,{fx:clamp(e.x-60-i*90,120,W-40),fy:i%2?H-110:110,hk:.010,role:'node'}));}   // out of the centre line: fly up / down to reach them
  if(g.m==='medic')g.tg.push(BPL.add(e,{fx:clamp(e.x+30,0,W-30),fy:e.y>H/2?110:H-110,hk:.022,role:'medic'}));
  BPL.say(BPH[g.m],3);AU.sfx('warn');};
BPL.add=(e,o)=>{const t=en('mine',{x:e.x,y:e.y,wpt:1,bpRole:o.role});t.hp=t.max=t.hq=Math.max(4,Math.round(e.max*o.hk));t.gr=0;t.bpAt=Object.assign({e},o);t.score=0;return t;};
BPL.resolve=(e,how)=>{const b=e.bp,g=b&&b.g;if(!g||!g.up)return;const s=BPL.stat(),k=g.m+':'+how;s.how[k]=(s.how[k]||0)+1;if(how!=='fb'&&how!=='ls'&&how!=='auto')s.res[g.m]=(s.res[g.m]||0)+1;if(how==='fb')s.fb++;else s.open++;
  for(const t of g.tg)if(!t.dead){t.dead=1;burst(t.x,t.y,'#19e3ff',10,200,.4);}g.up=0;g.open=G.t+BPL.opn();
  floater(e.x,e.y-e.r-34,how==='fb'?'SHIELD OVERLOAD':'OPEN!','#ffe14d');if(how!=='fb'){shake(6);AU.sfx('tier');G.score+=Math.round(800*(1+G.pos));}
  G.rings.push({x:e.x,y:e.y,l:.6,m:.6,c:'#ffe14d'});NR.emit('bpOpen',{m:g.m,how});};
/* test / assist hook: a player that does the thing (?bpauto=1 or BPL.auto = seconds of reaction) */
BPL.solve=e=>BPL.resolve(e,'auto');
/* where a player should be: the live node / medic (its row), or the far side of the turning shield (for bots and the aim assist) */
BPL.target=()=>{const e=G.boss,g=e&&e.bp&&e.bp.g;if(!g||!g.up)return null;const x=g.tg.find(q=>!q.dead&&q.hp>0&&G.en.includes(q));if(x)return x;
  if(g.m==='back'&&g.sy!=null)return{x:P.x,y:g.sy<H/2?H-50:50};return null;};
/* ---- every frame ---- */
NR.on('tick',dt=>{if(!BPL.on)return;const e=G.boss;if(!e||!e.bp||e.dead){if(BPL.hz.length)BPL.hz=[];return;}const b=e.bp,g=b.g,t=G.t,s=BPL.stat(),sb=BT.spb||.5;
  if(e.x>bossX())return;
  const dash=P.dashT>0&&!b.dw;b.dw=P.dashT>0;
  if(e.b2&&e.b2.ls>0){if(g&&g.up)BPL.resolve(e,'ls');}
  else if(g){
    if(!g.up&&!g.open&&t>=g.t0+BPL.TEL)BPL.raise(e,g);
    if(g.up){s.tel=Math.min(s.tel,g.tu-g.t0);
      for(const x of g.tg){const A=x.bpAt;if(A.orb){A.a+=A.w*dt;x.x=A.e.x+Math.cos(A.a)*A.orb;x.y=clamp(A.e.y+Math.sin(A.a)*A.orb,30,H-30);}else{x.x=A.fx;x.y=A.fy+Math.sin(t*1.3+A.fx)*(A.role==='node'?18:30);}}
      const live=g.tg.filter(x=>!x.dead&&x.hp>0&&G.en.includes(x));
      for(const x of live){x.bpOpen=Math.abs(P.y-x.y)<(x.bpRole==='medic'?110:80);if(!x.bpOpen)x.hp=x.hq=x.max;}   // closing weak points: a node / the medic only opens to a ship in its row (stray and homing fire does nothing)
      if((g.m==='nodes'||g.m==='medic')&&g.tg.length&&!live.length)BPL.resolve(e,'shot');
      if(g.m==='medic'&&dash&&live.length){const m=live[0];if(BPL.segD(P.x,P.y,e.x,e.y,m.x,m.y)<34){s.cut=(s.cut|0)+1;BPL.resolve(e,'dash');}}
      if(g.m==='emp'&&G.empT>0)BPL.resolve(e,'emp');
      if(g.m==='back'){const w=(e.ph===3?220:160)*dt;if(g.sy==null)g.sy=P.y;g.sy+=clamp(P.y-g.sy,-w,w);g.sa=Math.atan2(g.sy-e.y,-(e.r+80));   // the shield follows your height, slower than you fly
        if(Math.abs(P.y-g.sy)>110){g.fl+=dt;if(g.fl>=BPL.FLANK)BPL.resolve(e,'flank');}else g.fl=Math.max(0,g.fl-dt*.5);}
      if(g.m==='parry')BPL.orb(e,g,dash,sb);
      if(g.m==='nodes'&&live.length&&(e.bt|0)!==g.shot&&(e.bt|0)%(HARDS.includes(SET.diff)?2:4)===0){g.shot=e.bt|0;BPL.aim(live[(e.bt>>2)%live.length],sb);}   // one node shoots back each bar (each 2 beats on the hard tiers): tell .6 s, then one aimed shot
      if(g.up&&BPL.auto&&t-g.tu>=BPL.auto)BPL.solve(e);
      if(g.up&&t-g.tu>=BPL.fb())BPL.resolve(e,'fb');}
    else if(g.open&&t>=g.open)BPL.gate(e,t);}
  BPL.arena(e,b,t,sb,dt);
  for(const z of BPL.hz)if(z.aim&&t>=z.on&&!z.done){z.done=1;const n=G.eb.length;eb.src=BPSRC;eb(z.x,z.y,Math.atan2(P.y-z.y,P.x-z.x),z.v,'#19e3ff',6);eb.src=null;if(G.eb.length>n){G.eb[n].bpl=1;s.eb++;}}
  BPL.hz=BPL.hz.filter(z=>t<z.off);
  let nl=0;for(const x of G.eb)if(!x.dead)nl++;s.maxEb=Math.max(s.maxEb,nl);s.cap=Math.max(s.cap,ebCap());for(const x of G.eb)if(x.bpl)s.maxV=Math.max(s.maxV,Math.hypot(x.vx,x.vy));});
const BPSRC={type:'bossmv',arm:true};
BPL.ang=a=>Math.atan2(Math.sin(a),Math.cos(a));
BPL.segD=(px,py,ax,ay,bx,by)=>{const dx=bx-ax,dy=by-ay,l=dx*dx+dy*dy||1,u=clamp(((px-ax)*dx+(py-ay)*dy)/l,0,1);return Math.hypot(px-ax-u*dx,py-ay-u*dy);};
BPL.aim=(x,sb)=>{const tl=Math.max(.6,sb*Math.ceil(.6/sb));BPL.hz.push({aim:1,x:x.x,y:x.y,on:G.t+tl,off:G.t+tl+.05,t0:G.t,v:150+20*diff()});BPL.stat().tel=Math.min(BPL.stat().tel,tl);};
/* the parry orb: launched on a bar (tell TEL s), flies slow at the ship; a dash while it is within 110 px sends it back and cracks the shell; touching it hurts */
BPL.orb=(e,g,dash,sb)=>{const t=G.t,s=BPL.stat();let o=g.orb;
  if(!o&&t>=g.ob){g.orb=o={x:e.x-e.r,y:e.y,t0:t,on:t+BPL.TEL,v:150+15*diff(),back:0};s.tel=Math.min(s.tel,BPL.TEL);return;}
  if(!o||t<o.on)return;const dt=1/60,tx=o.back?e.x:P.x,ty=o.back?e.y:P.y,a=Math.atan2(ty-o.y,tx-o.x),v=o.back?520:o.v;o.x+=Math.cos(a)*v*dt;o.y+=Math.sin(a)*v*dt;
  const d=Math.hypot(P.x-o.x,P.y-o.y);
  if(!o.back&&dash&&d<110){o.back=1;s.parry=(s.parry|0)+1;floater(P.x,P.y-30,'PARRY!','#19e3ff');AU.sfx('perfect');}
  else if(!o.back&&d<20){hurt(1);s.hits++;g.orb=null;g.ob=t+2*sb*4/2;}
  else if(o.back&&Math.hypot(e.x-o.x,e.y-o.y)<e.r){g.orb=null;BPL.resolve(e,'parry');}
  else if(t-o.t0>9){g.orb=null;g.ob=t+sb*2;}};
/* ---- arena rules ---- */
BPL.arena=(e,b,t,sb,dt)=>{const m=b.ar;if(!m)return;const S=b.arS,s=BPL.stat(),bar=4*sb,x1=e.x-e.r-10;
  if(m==='slab'){if(!S.n||t>=S.n){S.top=!S.top;S.h=Math.round(H*.32);S.t0=t;S.on=t+Math.max(BPL.TEL,bar*.5);S.off=S.on+bar*1.5;S.n=S.off+bar*.5;s.tel=Math.min(s.tel,S.on-S.t0);s.gap=Math.min(s.gap,H-S.h);}
    if(t>=S.on&&t<S.off&&P.x<x1&&(S.top?P.y<S.h:P.y>H-S.h))BPL.hit();}
  if(m==='conveyor'){const lane=P.y<H/2?1:-1;P.x=clamp(P.x+(lane>0?110:-70)*dt,20,W-20);}
  if(m==='gravity'){const k=Math.floor(P.y/(H/3)),dir=(k+Math.floor(t/(bar*2)))%2?1:-1;P.y=clamp(P.y+dir*85*dt,20,H-20);}
  if(m==='grid'){if(!S.n||t>=S.n){const n=e.ph===3?4:3,sp=Math.max(150,(x1-60)/n),o=Math.random()*40;S.c=[];for(let i=0;i<n;i++){const x=60+o+i*sp;if(x<x1-30)S.c.push(x);}
      S.t0=t;S.on=t+Math.max(BPL.TEL,bar*.5);S.off=S.on+.45;S.n=t+bar*2;s.tel=Math.min(s.tel,S.on-S.t0);s.gap=Math.min(s.gap,sp-18);}
    if(t>=S.on&&t<S.off&&S.c.some(x=>Math.abs(P.x-x)<9+10))BPL.hit();}
  if(m==='ghost'){S.tr=S.tr||[];S.tr.push([t,P.x,H-P.y]);while(S.tr.length&&S.tr[0][0]<t-1.2)S.tr.shift();const q=S.tr[0];S.gx=q[1];S.gy=q[2];
    if(t-(S.t0||(S.t0=t))>BPL.TEL&&Math.hypot(P.x-S.gx,P.y-S.gy)<26)BPL.hit();s.tel=Math.min(s.tel,BPL.TEL);}
  if(m==='blackout'){S.lane=Math.floor((e.bt|0)/2)%3;}
  if(m==='zone'){if(!S.n||t>=S.n){S.cx=clamp(P.x,140,x1-140);S.cy=clamp(P.y,140,H-140);S.t0=t;S.n=t+bar*2;}
    S.r=Math.max(130,260-(t-S.t0)/(bar*2)*150);s.gap=Math.min(s.gap,2*S.r);
    if(t-S.t0>BPL.TEL&&Math.hypot(P.x-S.cx,P.y-S.cy)>S.r){S.out=(S.out||0)+dt;if(S.out>.8){S.out=0;BPL.hit();}}else S.out=0;s.tel=Math.min(s.tel,BPL.TEL);}};
BPL.hit=()=>{const h=P.hp;hurt(1);if(P.hp<h)BPL.stat().hits++;};
/* ---- placeholder shapes (circles / triangles / squares); drawn after the boss hazards ---- */
BPL.draw=()=>{const e=G.boss;if(!BPL.on||!e||!e.bp||e.x>W+40)return;const b=e.bp,g=b.g,t=G.t,rm=!!SET.reduce,pul=rm?.5:.5+.5*Math.sin(t*8);ctx.save();
  const S=b.arS||{},x1=e.x-e.r-10,m=b.ar;
  if(m==='blackout'){const lh=H/3;ctx.globalAlpha=rm?.55:.72;ctx.fillStyle='#02030a';for(let i=0;i<3;i++)if(i!==S.lane)ctx.fillRect(0,i*lh,x1,lh);
    ctx.globalAlpha=.35;ctx.strokeStyle='#19e3ff';ctx.lineWidth=2;ctx.strokeRect(2,S.lane*lh+2,x1-4,lh-4);}
  if(m==='slab'&&S.t0!=null&&t<S.off){const live=t>=S.on,y0=S.top?0:H-S.h;ctx.globalAlpha=live?.8:.18+.15*pul;ctx.fillStyle=live?'#ff3d6e':'#ff9a3d';ctx.fillRect(0,y0,x1,S.h);
    if(!live){ctx.globalAlpha=.9;ctx.fillStyle='#ffe14d';for(let x=40;x<x1;x+=90)BPL.tri(x,S.top?S.h+12:H-S.h-12,9,S.top?Math.PI/2:-Math.PI/2);}}
  if(m==='conveyor'){ctx.globalAlpha=.22;ctx.fillStyle='#ffb020';const o=(t*110)%60;for(let x=-60+o;x<x1;x+=60){BPL.tri(x,H*.25,10,0);}ctx.fillStyle='#19e3ff';for(let x=x1-(t*70)%60;x>0;x-=60)BPL.tri(x,H*.75,10,Math.PI);}
  if(m==='gravity'){ctx.globalAlpha=.2;for(let k=0;k<3;k++){const dir=(k+Math.floor(t/((BT.spb||.5)*8)))%2?1:-1;ctx.fillStyle=dir>0?'#ff7ad9':'#7ad9ff';for(let x=50;x<x1;x+=110)BPL.tri(x,(k+.5)*H/3,11,dir*Math.PI/2);}}
  if(m==='grid'&&S.c&&t<S.off){const live=t>=S.on;for(const x of S.c){ctx.globalAlpha=live?.85:.2+.2*pul;ctx.fillStyle=live?'#ff3d6e':'#ff9a3d';ctx.fillRect(x-(live?9:2),0,live?18:4,H);}}
  if(m==='ghost'&&S.gx!=null){ctx.globalAlpha=.55;ctx.strokeStyle='#c78cff';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(S.gx+16,S.gy);ctx.lineTo(S.gx-12,S.gy-12);ctx.lineTo(S.gx-12,S.gy+12);ctx.closePath();ctx.stroke();}
  if(m==='zone'&&S.r){ctx.globalAlpha=.6;ctx.strokeStyle='#ffe14d';ctx.lineWidth=4;ctx.setLineDash([14,10]);ctx.beginPath();ctx.arc(S.cx,S.cy,S.r,0,7);ctx.stroke();ctx.setLineDash([]);}
  if(g){const rise=g.up?1:clamp((t-g.t0)/BPL.TEL,0,1);ctx.globalAlpha=g.up?.9:.4*rise;
    if(g.up&&g.m!=='back'){ctx.strokeStyle='#19e3ff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(e.x,e.y,e.r+12+2*pul,0,7);ctx.stroke();}
    if(g.m==='back'){ctx.strokeStyle='#19e3ff';ctx.lineWidth=8;ctx.beginPath();ctx.arc(e.x,e.y,e.r+16,g.sa-.8,g.sa+.8);ctx.stroke();ctx.fillStyle='#ffe14d';BPL.tri(e.x+Math.cos(g.sa+Math.PI)*(e.r+22),e.y+Math.sin(g.sa+Math.PI)*(e.r+22),9,g.sa);}
    if(g.m==='emp'&&(g.up||rise)){ctx.fillStyle='#8a96a8';ctx.fillRect(e.x-e.r*.9-14,e.y-22,28,44);ctx.strokeStyle='#ffb020';ctx.lineWidth=2;ctx.strokeRect(e.x-e.r*.9-14,e.y-22,28,44);}
    for(const x of g.tg)if(!x.dead){if(x.bpRole==='medic'){ctx.strokeStyle='#4dff9a';ctx.lineWidth=4;ctx.globalAlpha=.5+.3*pul;ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(x.x,x.y);ctx.stroke();ctx.globalAlpha=1;
        ctx.fillStyle='#4dff9a';ctx.beginPath();ctx.arc(x.x,x.y,18,0,7);ctx.fill();ctx.fillStyle='#0b1a10';ctx.fillRect(x.x-3,x.y-10,6,20);ctx.fillRect(x.x-10,x.y-3,20,6);}
      else{ctx.globalAlpha=1;ctx.strokeStyle='#19e3ff';ctx.lineWidth=3;if(x.bpOpen){ctx.beginPath();ctx.arc(x.x,x.y,18,0,7);ctx.stroke();}else{ctx.fillStyle='#19e3ff55';ctx.fillRect(x.x-15,x.y-15,30,30);ctx.strokeRect(x.x-15,x.y-15,30,30);}}}
    if(g.orb){const o=g.orb,live=t>=o.on;ctx.globalAlpha=live?1:.4+.3*pul;ctx.strokeStyle=o.back?'#19e3ff':'#ffe14d';ctx.lineWidth=4;ctx.beginPath();ctx.arc(o.x,o.y,16,0,7);ctx.stroke();ctx.fillStyle=ctx.strokeStyle;ctx.beginPath();ctx.arc(o.x,o.y,6,0,7);ctx.fill();}}
  for(const z of BPL.hz)if(z.aim){ctx.globalAlpha=.6;ctx.strokeStyle='#19e3ff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(z.x,z.y,10+12*clamp((z.on-t)/.6,0,1),0,7);ctx.stroke();}
  ctx.restore();};
BPL.tri=(x,y,r,a)=>{ctx.beginPath();for(let i=0;i<3;i++){const q=a+i*2.094;ctx[i?'lineTo':'moveTo'](x+Math.cos(q)*r,y+Math.sin(q)*r);}ctx.closePath();ctx.fill();};
NR.on('bossPhase',({ph})=>{const e=G.boss;if(BPL.on&&e&&e.bp)BPL.phase(e,ph);});
NR.on('kill',({e,boss})=>{if(!boss||!e||!e.bp)return;BPL.drop(e);BPL.hz=[];const c=BPL.codex()[e.bp.id];BPL.say(e.nm+' DOWN · CODEX '+((c&&c.m)||[]).length+' MECHANICS',4);});
window.__bpl={BPT,BPL};
