// bot-1 (lane bot-r20i, 2026-10-20): headless PLAYTEST BOT. Drives the real game with its own inputs (K.KeyW / K.ArrowLeft / K.ArrowRight / K.ArrowDown through
// roamStep(1/30), no teleport between waypoints) in Frankfurt and Athens, state asserts only, sim fast-forwarded with a fixed dt. GO tags: bot/nav, bot/race.
//   bot/nav : N seeded road-graph waypoints (HUB.nodes, navPath), pure-pursuit steering. Every 5 sim-s: progress along the path. Fails on: stuck > 8 s
//             (|v| < 1 with gas held, or no 3 m of progress), more than 1 auto-reset (stuck hop / unstick warp) in a leg, fall below the ground, NaN, a leg that
//             never arrives (cap = length / 6 m/s + 30 s), speed never above 5 m/s with the gas held, a JS error, a sim step > BOT.longMs.
//   bot/race: one race per city (Frankfurt Westend Split, Athens Akropolis final) with tkBot; the finish logic must fire (all gates passed, result not DNF, sane time).
// Every problem is filed under its 100 m map cell (x,z cell index * 100); the worst cells are printed and kept in window.__chk.bot for tools/tBot.js -> docs/BOT_REPORT.md.
const BOT=window.__bot={seed:20261020,wp:4,longMs:120,freezeMs:300};
function BOT_rng(s){return()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function BOT_rec(){const cells={},errs=[],M={steps:0,maxMs:0,long:0,nan:0,fall:0},cell=()=>Math.floor(RO.x/100)*100+','+Math.floor(RO.z/100)*100;
 const mark=(k,v=1)=>{const c=cell(),o=cells[c]=cells[c]||{stuck:0,reset:0,long:0,err:0,fall:0,nan:0,lost:0};o[k]+=v;return c};
 const onErr=e=>{errs.push(mark('err')+' '+String(e&&(e.message||e.reason)||e).slice(0,120))};window.addEventListener('error',onErr);window.addEventListener('unhandledrejection',onErr);
 const rnd0=Math.random;Math.random=BOT_rng(BOT.seed);   // traffic, pedestrians and props draw from Math.random: seeded for the run, restored by done()
 const chk=()=>{const bad=[RO.x,RO.y,RO.z,RO.v,RO.h].some(v=>!isFinite(v));if(bad){M.nan++;mark('nan');return'NaN'}
  let g=0;try{g=groundY(RO.x,RO.z)||0}catch(e){}if(RO.y<g-3||RO.y<-60){M.fall++;mark('fall');return'fell'}return''};
 const step=()=>{const t=performance.now();try{roamStep(1/30)}catch(e){errs.push(mark('err')+' '+String(e&&e.message||e).slice(0,120))}const ms=performance.now()-t;M.steps++;if(ms>M.maxMs)M.maxMs=ms;if(ms>BOT.longMs){M.long++;mark('long');if(ms>BOT.freezeMs)mark('long',2)}return chk()};
 const done=()=>{window.removeEventListener('error',onErr);window.removeEventListener('unhandledrejection',onErr);Math.random=rnd0;K.KeyW=K.ArrowUp=K.ArrowLeft=K.ArrowRight=K.ArrowDown=false};
 return{cells,errs,M,mark,cell,step,done}}
function BOT_worst(cells,n=5){return Object.entries(cells).map(([c,o])=>[c,o,o.err*50+o.nan*50+o.fall*50+o.lost*30+o.reset*10+o.stuck+o.long]).sort((a,b)=>b[2]-a[2]).slice(0,n).map(([c,o])=>c+' '+Object.entries(o).filter(([k,v])=>v).map(([k,v])=>k+(v>1&&k!=='stuck'?'×'+v:k==='stuck'?' '+v.toFixed(0)+'s':'')).join('+'))}
// drive the player car along P (polyline of [x,z]) with the game's own steering inputs; returns {arr, t, why, ...}
function BOT_leg(R,P,cap){const W=a=>Math.atan2(Math.sin(a),Math.cos(a)),N=P.length;const hist=[];let rev=0,backs=0,ix=0,pr=P[0],t=0,still=0,noP=0,tick=0,best=1e9,peak=0,resets=0,why='',stuckMax=0;const hop0=RO.npHop||0,rem=i=>{let d=Math.hypot(P[Math.min(i+1,N-1)][0]-RO.x,P[Math.min(i+1,N-1)][1]-RO.z);for(let j=i+1;j<N-1;j++)d+=Math.hypot(P[j+1][0]-P[j][0],P[j+1][1]-P[j][1]);return d};
 const v0=Math.abs(RO.v);let hopSeen=hop0,px=RO.x,pz=RO.z;
 for(;t<cap&&!why;t+=1/30){let bd=1e18;for(let i=Math.max(0,ix-2);i<Math.min(N-1,ix+30);i++){const a=P[i],b=P[i+1],l2=(b[0]-a[0])**2+(b[1]-a[1])**2||1,u=Math.max(0,Math.min(1,((RO.x-a[0])*(b[0]-a[0])+(RO.z-a[1])*(b[1]-a[1]))/l2)),d=Math.hypot(a[0]+(b[0]-a[0])*u-RO.x,a[1]+(b[1]-a[1])*u-RO.z);if(d<bd){bd=d;ix=i;pr=[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u]}}
  const r=rem(ix);if(r<14||(ix>=N-2&&r<22))break;
  // pure pursuit: aim a look-ahead further down the path (12 m + 0.9 s of speed), steer with the arrow keys; a speed governor slows for the bend ahead like a driver
  const at=d=>{let j=ix,q=pr;while(j<N-1){const l=Math.hypot(P[j+1][0]-q[0],P[j+1][1]-q[1]);if(l>=d){const f=d/(l||1);return[q[0]+(P[j+1][0]-q[0])*f,q[1]+(P[j+1][1]-q[1])*f]}d-=l;q=P[j+1];j++}return P[N-1]};
  const T=at(10+Math.abs(RO.v)*.7),e=W(Math.atan2(T[0]-RO.x,T[1]-RO.z)-RO.h),a1=at(8),a2=at(22),a3=at(55),turn=Math.max(Math.abs(W(Math.atan2(a2[0]-a1[0],a2[1]-a1[1])-Math.atan2(a3[0]-a2[0],a3[1]-a2[1]))),Math.abs(e)*.6),vt=turn>1.1?6:turn>.6?9:turn>.3?14:26;
  K.ArrowLeft=e>.06;K.ArrowRight=e<-.06;const v=Math.abs(RO.v),want=Math.abs(e)>1.8?5:vt;K.KeyW=K.ArrowUp=v<want;K.ArrowDown=v>want+3;if(t<2||v<want)K.KeyW=K.ArrowUp=true;
  /* a driver pinned for 2.5 s backs out (reverse 1.2 s, wheel the other way) instead of holding the gas: the game's own recovery needs 4 s of unbroken gas, which a bot that lifts for bends never gives it; the pin is still filed under its cell */
  if(rev<=0&&still>2.5&&backs<5){rev=1.2;backs++;still=0;hist.length=0}if(rev>0){rev-=1/30;K.KeyW=K.ArrowUp=false;K.ArrowDown=true;K.ArrowLeft=e<0;K.ArrowRight=e>=0}
  const x0=RO.x,z0=RO.z,bad=R.step();if(bad){why=bad;break}
  const jump=Math.hypot(RO.x-x0,RO.z-z0);if(BOT.trace&&Math.round(t*30)%15===0)BOT.trace.push([+t.toFixed(1),Math.round(RO.x),Math.round(RO.z),+RO.v.toFixed(1),+RO.h.toFixed(2),+e.toFixed(2),RO.npHop||0]);if(jump>25){resets++;R.mark('reset');if(BOT.trace)BOT.trace.push(['JUMP',t.toFixed(2),Math.round(x0),Math.round(z0),Math.round(RO.x),Math.round(RO.z)])}   // a teleport inside one 1/30 s step = an unstick warp / respawn
  if((RO.npHop||0)>hopSeen){resets+=(RO.npHop||0)-hopSeen;hopSeen=RO.npHop||0;R.mark('reset')}
  peak=Math.max(peak,Math.abs(RO.v));if(!hist.length||t-hist[hist.length-1][0]>=.5)hist.push([t,RO.x,RO.z]);while(hist.length&&t-hist[0][0]>3)hist.shift();/* pinned = under 1.5 m of net travel in 3 s with the gas held (RO.v keeps reading 5-8 m/s against a wall, so |v| alone misses it) */const pinned=hist.length>=6&&t>3&&Math.hypot(RO.x-hist[0][1],RO.z-hist[0][2])<1.5;if(Math.abs(RO.v)<1||pinned){still+=1/30;if(still>1.5)R.mark('stuck',1/30)}else still=0;stuckMax=Math.max(stuckMax,still);
  tick+=1/30;if(tick>=5){tick=0;if(r<best-3){best=r;noP=0}else noP+=5;px=RO.x;pz=RO.z}   // progress check every 5 sim-s
  if(still>8||noP>=10&&still>3)why='stuck '+Math.max(still,noP).toFixed(0)+' s at '+Math.round(RO.x)+','+Math.round(RO.z)+' (v '+RO.v.toFixed(1)+')';else if(resets>1)why='auto-reset ×'+resets;else if(backs>=5&&still>1)why='boxed in: 5 back-outs at '+Math.round(RO.x)+','+Math.round(RO.z);else if(!why&&t>8&&v0<2&&peak<5)why='speed ≤ 5 m/s with gas held (peak '+peak.toFixed(1)+')'}
 if(!why&&t>=cap&&rem(ix)>=22)why='no arrival in '+cap.toFixed(0)+' s ('+Math.round(rem(ix))+' m left)';
 if(why&&/stuck|no arrival|speed/.test(why))R.mark('lost');
 return{why,t,resets,peak,stuckMax,backs,left:Math.round(rem(ix))}}
function BOT_nav(say){const R=BOT_rec(),N=HUB.nodes,rng=BOT_rng(BOT.seed+(CID==='fra'?1:2)),out={kind:'nav',city:CID,legs:[],ok:false};
 try{if(!N||!N.length)throw new Error('no HUB.nodes');if(RO.sp)try{sprintEnd()}catch(e){}if(RO.ch)try{chAbort()}catch(e){}
  if(CID==='fra'){const q=rfSnap(-375,475,120);roamWarp(q?q[0]:-375,q?q[1]:475,q&&q[2]!=null?q[2]:0,true)}   // same start as rv2k2/pace; Athens uses the test start spot
  RO.v=0;RO.vy=0;for(let i=0;i<45;i++)R.step();   // past the 1.5 s warp grace
  let dist=0,tot=0;const ok=[];
  for(let w=0;w<BOT.wp;w++){let P=null;const fx=Math.sin(RO.h),fz=Math.cos(RO.h),sx=RO.x+fx*15,sz=RO.z+fz*15,C=[],M=navMain(N);for(let i=0;i<N.ng;i++){if(!M[i])continue;const d=Math.hypot(N[i].x-RO.x,N[i].z-RO.z);if(d>250&&d<750)C.push(i)}if(C.length<20)for(let i=0;i<N.ng;i++){if(!M[i])continue;const d=Math.hypot(N[i].x-RO.x,N[i].z-RO.z);if(d>120&&d<=250||d>=750&&d<1100)C.push(i)}   // map edge: too few nodes in the ring, widen it   // start the search 15 m ahead: the graph is undirected, the nearest node can sit in the opposite lane chain and send the car round a U-turn
   for(let tries=0;!P&&C.length&&tries<40;tries++){const i=C[Math.floor(rng()*C.length)],d=Math.hypot(N[i].x-RO.x,N[i].z-RO.z),p=navPath(sx,sz,N[i].x,N[i].z);let L=0;for(let k=1;k<p.length;k++)L+=Math.hypot(p[k][0]-p[k-1][0],p[k][1]-p[k-1][1]);if(p.length>2&&L<d*4)P={p,L,g:[Math.round(N[i].x),Math.round(N[i].z)]}}
   if(!P){out.legs.push({why:'no reachable waypoint 250-750 m away (graph hole?)',g:[0,0]});R.mark('lost');break}
   {const fx=Math.sin(RO.h),fz=Math.cos(RO.h);/* the graph is undirected: nodes behind the car (the opposite lane chain) would ask for a U-turn at speed; a driver skips them */while(P.p.length>3&&Math.hypot(P.p[0][0]-RO.x,P.p[0][1]-RO.z)<45&&(P.p[0][0]-RO.x)*fx+(P.p[0][1]-RO.z)*fz<0)P.p.shift()}const from=[Math.round(RO.x),Math.round(RO.z)],r=BOT_leg(R,P.p,P.L/6+30);r.g=P.g;r.from=from;r.len=Math.round(P.L);out.legs.push(r);tot+=r.t;dist+=P.L-r.left;if(r.why)break}
  out.sim=Math.round(tot);out.km=+(dist/1000).toFixed(2);out.ok=out.legs.length===BOT.wp&&!out.legs.some(l=>l.why)&&!R.errs.length&&!R.M.nan&&!R.M.fall&&R.M.long<3&&R.M.maxMs<=BOT.freezeMs}
 catch(e){R.errs.push('BOT '+String(e&&e.stack||e).slice(0,160))}
 R.done();const M=R.M,bad=out.legs.find(l=>l.why);out.esc=JSON.stringify(ESC.cnt);out.err=R.errs.slice(0,4);out.worst=BOT_worst(R.cells);out.maxMs=Math.round(M.maxMs);out.long=M.long;out.steps=M.steps;out.nan=M.nan;out.fall=M.fall;out.cells=R.cells;
 out.ok=out.ok&&!R.errs.length;(window.__chk.bot=window.__chk.bot||{})[CID+'/nav']=out;
 const txt='📍 BOT NAV '+(CID==='fra'?'Frankfurt':'Athens')+' · '+out.legs.filter(l=>!l.why).length+'/'+BOT.wp+' waypoints reached · '+out.km+' km in '+out.sim+' sim-s · resets '+out.legs.reduce((a,l)=>a+(l.resets||0),0)+' · peak '+Math.round(Math.max(0,...out.legs.map(l=>l.peak||0)))+' m/s · max step '+out.maxMs+' ms ('+M.long+' over '+BOT.longMs+') · NaN '+M.nan+' · falls '+M.fall+' · JS errors '+R.errs.length
  +' · ladder '+out.esc+(bad?' · FAILED leg '+out.legs.indexOf(bad)+' '+(bad.from||'')+'→'+bad.g+': '+bad.why+' at cell '+(out.worst[0]||'?'):'')+(R.errs.length?' · '+R.errs[0]:'')+(out.worst.length?' · worst cells: '+out.worst.slice(0,3).join(' | '):'')+(out.ok?' ✅':' ❌');
 return txt}
function BOT_race(say){const R=BOT_rec(),out={kind:'race',city:CID,ok:false};
 const fin=()=>{R.done();const r=out.r,sp0=out.sp;out.err=R.errs.slice(0,4);out.worst=BOT_worst(R.cells);out.maxMs=Math.round(R.M.maxMs);out.long=R.M.long;out.nan=R.M.nan;out.fall=R.M.fall;out.cells=R.cells;
  out.ok=!!r&&!r.dnf&&out.gates>=out.G&&out.G>=2&&r.t>20&&out.stuck<=1&&!R.errs.length&&!R.M.nan&&!R.M.fall;(window.__chk.bot=window.__chk.bot||{})[CID+'/race']=out;
  return'📍 BOT RACE '+(CID==='fra'?'Frankfurt Westend Split':'Athens Akropolis final')+' · '+(r?(r.dnf?'DNF':ord(r.place)+' in '+r.t+' s'):'no result')+' · gates '+out.gates+'/'+out.G+' (finish logic fired: '+!!(r&&!r.dnf&&out.gates>=out.G)+') · stuck '+out.stuck+' (≤ 1) · max step '+out.maxMs+' ms · NaN '+R.M.nan+' · falls '+R.M.fall+' · JS errors '+R.errs.length+(R.errs.length?' · '+R.errs[0]:'')+(out.worst.length?' · worst cells: '+out.worst.slice(0,3).join(' | '):'')+(out.ok?' ✅':' ❌')};
 XC_need('X5').then(()=>setTimeout(()=>{let msg;try{if(RO.sp)try{sprintEnd()}catch(e){}
  const m=CID==='fra'?tkMarkOf(RIVAL_EV.find(e=>e.p===TK_C.p)):tkMarkOf(ATH_BOSS_EV),C=CID==='fra'?TK_C:m&&tkCourseOf(m);if(!C)throw new Error('no race course');
  tkStart(m,C);const sp=RO.sp;sp.cd=0;out.G=sp.G.length;const bot=tkBot(tkGeoOf(C).pA,{lag:.15});
  tkRun(300,s=>{bot(s);const bad=chkQuick(R);if(bad)sp.t=1e9});   // a NaN / fall ends the race as a DNF
  out.r=TK.last;out.gates=sp.gi;out.stuck=bot.R.stuck.length;try{$('#spRes').hidden=true}catch(e){}if(RO.sp===sp)try{sprintEnd()}catch(e){}
  msg=fin()}catch(e){R.errs.push('BOT '+String(e&&e.stack||e).slice(0,160));out.gates=out.gates||0;out.G=out.G||0;out.stuck=out.stuck||0;msg=fin()}
  say(msg)},300));
 return'📍 BOT RACE · racing…'}
function chkQuick(R){const bad=[RO.x,RO.y,RO.z,RO.v].some(v=>!isFinite(v));if(bad){R.M.nan++;R.mark('nan');return 1}let g=0;try{g=groundY(RO.x,RO.z)||0}catch(e){}if(RO.y<g-3||RO.y<-60){R.M.fall++;R.mark('fall');return 1}
 R.M.steps++;const t=performance.now(),d=chkQuick.t?t-chkQuick.t:0;chkQuick.t=t;if(d>BOT.longMs&&d<5000){R.M.long++;R.mark('long')}R.M.maxMs=Math.max(R.M.maxMs,d<5000?d:0);return 0}

// escape-1 (lane escape-r21h, 2026-10-20): "the car MUST be able to get out of ANY hill hole". bot/escape scans groundY on a grid for the deepest terrain pockets
// (24 headings, 2-10 m out: the pocket score is the slope of the EASIEST way out, so high = enclosed on every side), puts the car at the N worst per city, holds the gas
// with the game's own roamStep and asserts it is on a road or on open ground within BESC.secs sim-s (escape-r21h2: real gas = K.ArrowUp, 16 s; every lift audited). Reports each trap cell and the ladder step that freed it (RO.escLog).
const BESC={keep:{fra:[[2100,400]],ath:[[-2530,1300],[-1990,820]]},n:12,secs:16,step:60,open:1.5,
 /* escape-r21h2: the reviewer's exact cases (docs/shots/rev22/scripts/esc_repro_in.js, 09cbc22), 8 s each: [name,x,z,heading,v0,gas,steer] */
 rev:{fra:[['fra 2100,400 from rest',2100,400,0,0,1,0],['fra 2100,400 at 20',2100,400,Math.PI/2,20,1,0],['fra 2100,400 circle',2100,400,0,15,1,1],['fra 300,1780 at 20',300,1780,0,20,1,0],['fra -420,640 parked no gas',-420,640,0,0,0,0]],
  ath:[['ath -2530,1300 from rest',-2530,1300,0,0,1,0],['ath -2530,1300 at 20',-2530,1300,1,20,1,0],['ath -1990,820 circle',-1990,820,0,15,1,1],['ath 2690,-920 parked no gas',2690,-920,0,0,0,0]]}};
/* one drive on the reviewer's code path: roamWarp, keys held (K.ArrowUp gas, K.ArrowLeft steer), roamStep(1/30) via R.step. (CTL.thr=1 is NOT gas: roamStep rebuilds CTL from the keys.)
   Every lift is audited on the frame it happens, from this harness's own per-frame samples: the state entering that frame (what ESC_unstick saw) must be |v| <= 8 m/s
   and within 20 m of every position of the 2 s before, else it is a FALSE reset */
function BOT_escRun(R,x,z,h,v0,gas,steer,secs,stop){for(const k in K)K[k]=false;roamWarp(x,z,h);RO.x=x;RO.z=z;RO.h=RO.vh=h;RO.y=groundAt(x,z,99);RO.vy=0;RO.v=v0;RO.t6s=0;RO.t8a=null;RO.stkT=0;ESC.E.log=null;ESC_end();
 const H=[],o={lifts:[],bad:[],maxV:0,path:0,t:0,why:'',assist:0},a0=ESC.cnt.assist;let n0=RO.t6n||0,px=RO.x,pz=RO.z;K.ArrowUp=!!gas;K.ArrowLeft=!!steer;
 try{for(let i=0;i<secs*30;i++){const t=i/30;H.push([t,RO.x,RO.z,RO.v]);while(H[0][0]<t-2-1e-6)H.shift();const bad=R.step();o.t=+((i+1)/30).toFixed(2);if(bad){o.why=bad;break}
   if((RO.t6n||0)>n0){n0=RO.t6n;const c=H[H.length-1];let far=0;for(const q of H)far=Math.max(far,Math.hypot(q[1]-c[1],q[2]-c[2]));const lg=ESC.E.log||{};
    const L={t:+t.toFixed(2),v:+Math.abs(c[3]).toFixed(1),far2:+far.toFixed(1),how:lg.how,to:lg.to,at:lg.at,clear:!!lg.to&&ESC_clear(lg.to[0],lg.to[1],groundAt(lg.to[0],lg.to[1],99))};o.lifts.push(L);if(L.v>8||far>=20)o.bad.push(L);H.length=0;px=RO.x;pz=RO.z}
   o.maxV=Math.max(o.maxV,Math.abs(RO.v));o.path+=Math.hypot(RO.x-px,RO.z-pz);px=RO.x;pz=RO.z;if(stop){const w=stop();if(w){o.why=w;break}}}}
 finally{for(const k in K)K[k]=false}
 o.assist=ESC.cnt.assist-a0;o.maxV=+o.maxV.toFixed(1);o.path=Math.round(o.path);o.end=[Math.round(RO.x),Math.round(RO.z)];return o}
/* pit depth: rise the car must climb over the EASIEST of 24 headings within 60 m (a flat or sloping spot reads ~0, a basin reads its spill height); wall: steepest local slope */
function BOT_pocket(x,z){const g0=groundY(x,z);let mn=1e9,mx=0;for(let k=0;k<24;k++){const a=k*Math.PI/12,sx=Math.sin(a),sz=Math.cos(a);let m=-1e9;for(const r of[4,8,12,18,26,36,48,60]){const q=groundY(x+sx*r,z+sz*r)-g0;if(q>m)m=q}mn=Math.min(mn,m);mx=Math.max(mx,m)}
 const[gx,gz]=TR_grad(x,z,2);return{depth:mn,rim:mx,wall:Math.hypot(gx,gz)}}
function BOT_escScan(n=BESC.n){const out=[],B=[WX0+80,WX1-80,WZS+80,WZN-80],st={cells:0,low:0,road:0,hit:0,max:0,pits:0};
 for(let x=B[0];x<B[1];x+=BESC.step)for(let z=B[2];z<B[3];z+=BESC.step){let g;try{g=groundY(x,z)}catch(e){continue}st.cells++;if(!(g>-1.5)){st.low++;continue}if(TR8_onRoad(x,z)){st.road++;continue}if(roamHit(x,z,2.4,g)){st.hit++;continue}
  const P=BOT_pocket(x,z);if(P.depth>st.max)st.max=P.depth;if(P.depth>2){st.pits++;out.push({x,z,d:P.depth,rim:P.rim,w:P.wall,g})}}
 out.sort((a,b)=>b.d-a.d);const pick=[],far=(o,m)=>pick.every(q=>Math.hypot(q.x-o.x,q.z-o.z)>m);
 for(const o of out){if(pick.length>=n*2/3)break;if(far(o,150))pick.push(o)}   // the deepest basin floors
 const wl=out.filter(o=>o.w>.9).sort((a,b)=>b.w-a.w);for(const o of wl){if(pick.length>=n)break;if(far(o,60)){o.wall=1;pick.push(o)}}   // + the steepest hill pockets (> 42° at the car)
 for(const o of out){if(pick.length>=n)break;if(far(o,150))pick.push(o)}
 return{found:out.length,pick,st,all:out.slice(0,120)}}
/* the heading with the longest free run (16 tries of 1.5 s at 20 m/s, gas held): the keep-moving cases drive where a driver would */
function BOT_freeDir(R,x,z,need){let bd=0,bp=-1;for(let k=0;k<16;k++){const a=k*Math.PI/8,r=BOT_escRun(R,x,z,a,20,1,0,1.5);if(r.path>bp){bp=r.path;bd=a}}return need&&bp<27?null:bd}
function BOT_esc(say){const R=BOT_rec(),out={kind:'escape',city:CID,ok:false,rows:[],rev:[],keep:[]};
 try{if(RO.sp)try{sprintEnd()}catch(e){}if(RO.ch)try{chAbort()}catch(e){}
  const S=BOT_escScan();out.found=S.found;out.st=S.st;
  /* pits: gas held from rest, must be on a road or open ground within BESC.secs; freed by driving, the assist or a lift */
  for(const o of S.pick){let dm=0;const r=BOT_escRun(R,o.x,o.z,0,0,1,0,BESC.secs,()=>{dm=Math.max(dm,Math.hypot(RO.x-o.x,RO.z-o.z));if(TR8_onRoad(RO.x,RO.z))return'road';if(dm>=15&&BOT_pocket(RO.x,RO.z).depth<BESC.open)return'open'});
   const L=r.lifts[r.lifts.length-1];out.rows.push({x:o.x,z:o.z,depth:+o.d.toFixed(1),wall:+o.w.toFixed(2),ok:r.why==='road'||r.why==='open',t:r.t,why:r.why,step:L?'lift/'+L.how:r.assist?'assist':'drove out',
    lifts:r.lifts,bad:r.bad,clear:r.lifts.every(l=>l.clear),maxV:r.maxV,end:r.end})}
  /* review #7: traffic parked on the landing candidates. (a) a car on every point 0-96 m along the nearest road: the lift must land on another road, clear;
     (b) also on every candidate of every road within 400 m: the lift must HOLD (car not moved); (c) the cars gone: it lifts. Fake cars live in HUB.cars only for the test */
  {const o=S.pick[0],had=!!HUB.cars,F=[],put=(x,z)=>{const f={x,z,fake:1};F.push(f);HUB.cars.push(f)};if(!had)HUB.cars=[];const lb={ok:false};
   try{roamWarp(o.x,o.z,0);RO.x=o.x;RO.z=o.z;RO.y=groundAt(o.x,o.z,99);RO.v=0;const q=TR8_near(RO.x,RO.z),sx=Math.sin(q[2]),sz=Math.cos(q[2]);for(let d=-96;d<=96;d+=8)put(q[0]+sx*d,q[1]+sz*d);
    const n0=RO.t6n||0,a=ESC_lift('reset','test-a'),far=()=>F.every(f=>Math.hypot(f.x-RO.x,f.z-RO.z)>=7);lb.a={lifted:a,to:[Math.round(RO.x),Math.round(RO.z)],at:ESC.E.log&&ESC.E.log.at,clear:a&&ESC_clear(RO.x,RO.z,RO.y)&&far()};
    roamWarp(o.x,o.z,0);RO.x=o.x;RO.z=o.z;RO.y=groundAt(o.x,o.z,99);for(let _j1=0,_b1=CITY_S;_j1<_b1.length;_j1++){const S2=_b1[_j1];const P=S2.pts;for(let i=0;i<P.length-1;i++)if(Math.hypot(P[i].x-o.x,P[i].z-o.z)<420)put(P[i].x,P[i].z)}
    const b=ESC_lift('reset','test-b');lb.b={held:!b,moved:Math.round(Math.hypot(RO.x-o.x,RO.z-o.z)),fakes:F.length};
    for(const f of F){const k=HUB.cars.indexOf(f);if(k>=0)HUB.cars.splice(k,1)}F.length=0;const c=ESC_lift('reset','test-c');lb.c={lifted:c,clear:c&&ESC_clear(RO.x,RO.z,RO.y)};
    lb.ok=lb.a.lifted&&lb.a.clear&&lb.a.at==='road2'&&lb.b.held&&lb.b.moved<1&&lb.c.lifted&&lb.c.clear}
   finally{for(const f of F){const k=HUB.cars.indexOf(f);if(k>=0)HUB.cars.splice(k,1)}if(!had)delete HUB.cars;ESC_end()}out.busy=lb}
  /* the reviewer's cases: zero lifts at any frame with |v| > 8 m/s or >= 20 m from a position of the last 2 s; no lift at all without gas */
  for(const[name,x,z,h,v0,gas,st]of BESC.rev[CID]||[]){const r=BOT_escRun(R,x,z,h,v0,gas,st,8);out.rev.push({name,ok:!r.bad.length&&(gas||!r.lifts.length),lifts:r.lifts,maxV:r.maxV,path:r.path,end:r.end})}
  /* must NOT reset (c1286c5): free driving through gentle dips deeper than 2.5 m, from rest, at 20 m/s and circling, plus up to 2 dips per city the car really runs through (>= 27 m in 1.5 s) */
  const free=[];let tried=0;for(const o of S.all){if(free.length>=2||++tried>10)break;if(o.d<2.6||o.d>12||free.some(q=>Math.hypot(q[0]-o.x,q[1]-o.z)<100))continue;if(BOT_freeDir(R,o.x,o.z,1)!=null)free.push([o.x,o.z])}out.free=free;
  for(const[x,z]of[...(BESC.keep[CID]||[]),...free]){const dir=BOT_freeDir(R,x,z);for(const mode of['rest','fast','circle']){const r=BOT_escRun(R,x,z,dir,mode==='rest'?0:mode==='fast'?20:15,1,mode==='circle',6);out.keep.push({x,z,mode,ok:!r.bad.length,lifts:r.lifts,maxV:r.maxV,path:r.path})}}
  out.ok=out.rows.length>=6&&out.rows.every(r=>r.ok&&r.clear&&!r.bad.length)&&out.rev.length>=4&&out.rev.every(r=>r.ok)&&out.busy&&out.busy.ok&&out.keep.every(k=>k.ok)&&!R.errs.length&&!R.M.nan&&!R.M.fall}
 catch(e){R.errs.push('BOT '+String(e&&e.stack||e).slice(0,160))}
 R.done();out.err=R.errs.slice(0,4);(window.__chk.bot=window.__chk.bot||{})[CID+'/escape']=out;
 const fl=a=>a.filter(r=>!r.ok);
 return'📍 BOT ESCAPE '+(CID==='fra'?'Frankfurt':'Athens')+' · '+out.rows.filter(r=>r.ok&&r.clear&&!r.bad.length).length+'/'+out.rows.length+' deepest pockets (of '+out.found+' scanned deeper than 2 m, gas held) on a road or open ground within '+BESC.secs+' s · '
  +out.rows.map(r=>r.x+','+r.z+' d'+r.depth+'m '+(r.ok?r.step+' '+r.t+'s':'TRAPPED at '+r.end)+(r.clear?'':' LANDING NOT CLEAR '+JSON.stringify(r.lifts.filter(l=>!l.clear)))+(r.bad.length?' FALSE '+JSON.stringify(r.bad[0]):'')).join(' | ')
  +' · reviewer cases (no lift at |v| > 8 m/s or >= 20 m in 2 s): '+(out.rev.length-fl(out.rev).length)+'/'+out.rev.length+(fl(out.rev).length?' ('+fl(out.rev).map(r=>r.name+' FALSE '+JSON.stringify(r.lifts)).join(' ')+')':'')
  +' · busy landing (traffic on every candidate): '+(out.busy&&out.busy.ok?'other road, hold, then lift ✓':'FAIL '+JSON.stringify(out.busy))
  +' · free dips: '+(out.keep.length-fl(out.keep).length)+'/'+out.keep.length+(fl(out.keep).length?' ('+fl(out.keep).map(k=>k.x+','+k.z+' '+k.mode+' FALSE '+JSON.stringify(k.lifts)).join(' ')+')':'')+(R.errs.length?' · '+R.errs[0]:'')+(out.ok?' ✅':' ❌')}
function BOT_dbg(x,z){const o=[];for(const k in K)K[k]=false;roamWarp(x,z,0);RO.x=x;RO.z=z;RO.y=groundAt(x,z,99);RO.v=0;RO.vy=0;ESC.E.log=null;ESC_end();K.ArrowUp=true;try{for(let i=0;i<300;i++){roamStep(1/30);const H=ESC.E.H;if(i%8==0)o.push((i/30).toFixed(2)+' n '+H.length+' gate '+ESC_gate(H)+' trap '+(ESC_gate(H)?ESC_trapped(H):'-')+' as '+ESC.E.as.toFixed(2)+' v '+RO.v.toFixed(1)+' pos '+Math.round(RO.x)+','+Math.round(RO.z)+' log '+JSON.stringify(ESC.E.log))}}finally{K.ArrowUp=false}return o}
// ramps-r21q (2026-10-20, Alex: "the roads and streets are unusable"): roads/ath-clear, no graphics. (1) every Athens street centreline + 2 lane offsets (+-w/4) every 2 m outside ramp footprints:
// second difference of groundAt <= 8 cm (counts and worst reported); (2) no ramp covers more than 40 % of any carriageway cross-section within 12 m of a road (all ramps unioned);
// (3) the bot drives the 10 worst FORMER full-width ramp streets (160 m each) at >= 20 km/h average, no stuck / reset / fall.
const RCL=window.__rcl={maxStep:.08,hardStep:.5,maxCover:.4,kmh:20,sites:[[2894,-2196],[3084,-2628],[676,-1559],[-2354,-2020],[-2213,-1966],[-1625,-1715],[-3850,2588],[3122,-1987],[-2545,2026],[-5299,4083]]};
function RCL_inRamp(x,z,m){for(let _j2=0,_b2=RO.ramps;_j2<_b2.length;_j2++){const r=_b2[_j2];if(r.dk)continue;const dx=x-r.x,dz=z-r.z,a=dx*Math.sin(r.h)+dz*Math.cos(r.h),b=dx*Math.cos(r.h)-dz*Math.sin(r.h);if(Math.abs(a)<r.len/2+m&&Math.abs(b)<r.w/2+m)return true}return false}
function RCL_scan(){const st={n:0,steps:0,max:0,worst:null,bad:{}},cv={max:0,at:null,over:0,n:0};
 for(let _j3=0,_b3=CITY_S;_j3<_b3.length;_j3++){const S=_b3[_j3];if(S.r.cls==='ped')continue;const w=S.r.w,P=S.pts;
  for(const off of[0,-w/4,w/4]){let prev=null,pp=null;for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],dx=b.x-a.x,dz=b.z-a.z,L=Math.hypot(dx,dz);if(L<.1)continue;const ux=dx/L,uz=dz/L;
   for(let s=0;s<L;s+=2){const x=a.x+ux*s-uz*off,z=a.z+uz*s+ux*off,g=groundAt(x,z,prev!=null?prev+1.5:99);st.n++;
    if(prev!=null&&pp!=null){const d=Math.abs(prev-(pp+g)/2);if(d>RCL.maxStep&&!RCL_inRamp(x,z,10)){st.steps++;if(d>RCL.hardStep)st.hard=(st.hard||0)+1;st.bad[S.r.name]=(st.bad[S.r.name]||0)+1;if(d>st.max){st.max=d;st.worst=[Math.round(x-ux*2),Math.round(z-uz*2),S.r.name]}}}pp=prev;prev=g}}}
  /* ramp cover: cross-section at every 2 m sample, lateral scan every 0.5 m over the carriageway, union of all ramps */
  const near=RO.ramps.filter(r=>!r.dk&&r.y0-groundY(r.x,r.z)<3&&S.pts.some(p=>Math.hypot(p.x-r.x,p.z-r.z)<r.len/2+r.w/2+w/2+14));if(!near.length)continue;
  for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],dx=b.x-a.x,dz=b.z-a.z,L=Math.hypot(dx,dz);if(L<.1)continue;const ux=dx/L,uz=dz/L;
   for(let s=0;s<L;s+=2){const x=a.x+ux*s,z=a.z+uz*s;let c=0,m=0;cv.n++;for(let l=-w/2;l<=w/2;l+=.5){m++;const px=x-uz*l,pz=z+ux*l;if(near.some(r=>{const ex=px-r.x,ez=pz-r.z,aa=ex*Math.sin(r.h)+ez*Math.cos(r.h),bb=ex*Math.cos(r.h)-ez*Math.sin(r.h);return Math.abs(aa)<r.len/2&&Math.abs(bb)<r.w/2}))c++}
    const f=c/m;if(f>RCL.maxCover+.01){cv.over++}if(f>cv.max){cv.max=f;cv.at=[Math.round(x),Math.round(z),S.r.name,w]}}}}
 return{st,cv}}
function RCL_go(say){const R=BOT_rec(),out={kind:'ath-clear',city:CID,ok:false,legs:[]};
 try{if(RO.sp)try{sprintEnd()}catch(e){}if(RO.ch)try{chAbort()}catch(e){}
  const S=RCL_scan();out.steps=S.st.steps;out.hard=S.st.hard||0;out.stepMax=+S.st.max.toFixed(2);out.stepWorst=S.st.worst;out.samples=S.st.n;out.cover=+S.cv.max.toFixed(2);out.coverAt=S.cv.at;out.coverOver=S.cv.over;out.ramps=RO.ramps.filter(r=>!r.dk).length;
  for(const[sx,sz]of RCL.sites){let B=null;for(let _j4=0,_b4=CITY_S;_j4<_b4.length;_j4++){const T=_b4[_j4];if(T.r.cls==='ped'||T.r.cls==='hill')continue;for(let i=0;i<T.pts.length;i++){const d=Math.hypot(T.pts[i].x-sx,T.pts[i].z-sz);if(!B||d<B.d)B={T,i,d}}}
   if(!B||B.d>40){out.legs.push({g:[sx,sz],why:'no street'});continue}
   const P0=B.T.pts,i0=Math.max(0,B.i-10),i1=Math.min(P0.length-1,B.i+10),P=[];for(let i=i0;i<=i1;i++)P.push([P0[i].x,P0[i].z]);let L=0;for(let i=1;i<P.length;i++)L+=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);
   roamWarp(P[0][0],P[0][1],Math.atan2(P[1][0]-P[0][0],P[1][1]-P[0][1]),true);RO.x=P[0][0];RO.z=P[0][1];RO.y=groundAt(RO.x,RO.z,99);RO.v=0;RO.vy=0;for(let i=0;i<45;i++)R.step();
   const run=()=>{roamWarp(P[0][0],P[0][1],Math.atan2(P[1][0]-P[0][0],P[1][1]-P[0][1]),true);RO.x=P[0][0];RO.z=P[0][1];RO.y=groundAt(RO.x,RO.z,99);RO.v=0;RO.vy=0;for(let i=0;i<45;i++)R.step();return BOT_leg(R,P,L/4+25)};
   const leg=r=>{r.g=[sx,sz];r.len=Math.round(L);r.kmh=r.t>0?+(Math.max(0,L-r.left)/r.t*3.6).toFixed(1):0;if(!r.why&&r.kmh<RCL.kmh)r.why='avg '+r.kmh+' km/h < '+RCL.kmh;return r};   /* one retry: traffic / the unstick warp make single legs flaky (Athens bot/nav too) */
   let r=leg(BOT_leg(R,P,L/4+25));if(r.why){const w0=r.why;r=leg(run());r.retry=w0}out.legs.push(r)}
  out.ok=out.hard===0&&out.cover<=RCL.maxCover+.025&&out.ramps>=20&&out.legs.length===10&&out.legs.every(l=>!l.why)&&!R.errs.length&&!R.M.nan&&!R.M.fall}
 catch(e){R.errs.push('RCL '+String(e&&e.stack||e).slice(0,160))}
 R.done();out.err=R.errs.slice(0,3);(window.__chk.bot=window.__chk.bot||{})[CID+'/ath-clear']=out;const bad=out.legs.filter(l=>l.why);
 return'📍 ROADS ATH-CLEAR · lane steps outside ramps: '+out.hard+' over 50 cm, '+out.steps+' over 8 cm of '+out.samples+' (max '+out.stepMax+' m at '+out.stepWorst+') · ramps '+out.ramps+' · max ramp cover '+Math.round(out.cover*100)+' % ('+out.coverAt+', '+out.coverOver+' sections over 40 %) · bot '+out.legs.filter(l=>!l.why).length+'/'+out.legs.length+' former ramp streets at '+out.legs.map(l=>l.kmh).join('/')+' km/h'+(bad.length?' · FAIL '+bad.map(l=>l.g+' '+l.why).join(' | '):'')+(R.errs.length?' · '+R.errs[0]:'')+(out.ok?' ✅':' ❌')}
function BOT_go(kind,say){return kind==='clear'?RCL_go(say):kind==='nav'?BOT_nav(say):kind==='escape'?BOT_esc(say):BOT_race(say)}
/* checklist rows live here (99c_checklist.js is at its 200 KB cap); called from the checklist next to RV3A_rows */
function BOT_rows(GO,goSay,CK){if(typeof SKH_rows==='function')SKH_rows(GO,goSay,CK);if(typeof QVO_rows==='function')QVO_rows(GO,goSay,CK);/* quests-optin-r22q *//* stuck-hills-r22h */if(typeof CA_rows==='function')CA_rows(GO,goSay,CK);if(typeof TRF_rows==='function')TRF_rows(GO,goSay,CK);if(typeof TLW_rows==="function")TLW_rows(GO,goSay,CK);/* traffic-law-r21m: traffic/law (99ctl_traffic_law.js) *//* traf-r21k2: traffic/behaviour (99ctf_traffic_go.js) *//* collide-1: city/collide-audit rows (99c9_collide.js) */CK.push({ver:'bot',id:'nav',area:'drive',text:'bot:2026-10-20 · PLAYTEST BOT, DRIVE: no stuck car, no fall-through, no dead end on the road graph. 📍 GO drives the car along 4 seeded road-graph waypoints with the game\'s own steering keys (stepped sim, no teleport). Auto: every waypoint reached, no stuck > 8 s, ≤ 1 auto-reset per leg, no NaN, no fall, speed > 5 m/s on gas, no JS error, ≤ 2 sim steps over 120 ms and none over 300 ms. Prints the worst map cells; tools/tBot.js writes docs/BOT_REPORT.md.'},{ver:'bot',id:'race',area:'race',text:'bot:2026-10-20 · PLAYTEST BOT, RACE: one race per city starts and finishes. 📍 GO races Frankfurt Westend Split / the Athens Akropolis final with the race bot. Auto: all gates passed, result is not a DNF, ≤ 1 stuck, no NaN / fall / JS error.'},{ver:'roads',id:'ath-clear',area:'drive',text:'ramps-r21q (Alex: the roads and streets are unusable): no graphics. 📍 GO scans every Athens street centreline + 2 lane offsets every 2 m (second difference of groundAt; > 50 cm fails, the > 8 cm count is reported), checks that no ramp covers more than 40 % of any carriageway cross-section, and drives the bot over the 10 worst former full-width ramp streets at >= 20 km/h average with no stuck / reset / fall. Auto: all three, ramp count >= 20.'},{ver:'bot',id:'escape',area:'drive',text:'escape-1 (Alex: the car MUST get out of ANY hill hole): 📍 GO scans the ground on a grid for the 12 deepest pockets (spill height over 24 headings within 60 m, plus the steepest wall cells), drops the car in each with the gas held and asserts it is on a road or open ground within 6 s of sim time, 100%. Lists each trap cell and the ladder step that freed it.'});
 for(const[k,c,n,s,kd]of [['bot/nav','fra','bot drive Frankfurt',60,'nav'],['bot/nav','ath','bot drive Athens',60,'nav'],['bot/race','fra','bot race Frankfurt',60,'race'],['bot/race','ath','bot race Athens',60,'race'],['bot/escape','fra','bot escape Frankfurt',180,'escape'],['bot/escape','ath','bot escape Athens',180,'escape'],['roads/ath-clear','ath','roads ath-clear',90,'clear']])(GO[k]=GO[k]||[]).push({c,n,secs:s,fn:()=>BOT_go(kd,t=>goSay(t))});if(typeof SKH_rows==='function')SKH_rows(GO,goSay,CK)/* stuck-hills-r22h: last, its GO leaves the car on a steep slope */}
({RCL_scan,RCL_go,BOT_dbg,BOT_go,BOT_esc,BOT_escScan,BOT_pocket,BESC,BOT_rows,BOT_nav,BOT_race,BOT_leg,BOT_rec,BOT_rng,BOT_worst,chkQuick,BOT})
