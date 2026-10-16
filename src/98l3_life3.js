/* ===== L3 · life-3: smarter traffic and natural pedestrians. default OFF (WIP), ?l3=1 or localStorage od_l3=1 = on. Test hook window.__l3 (GOs life3/*) =====
   1. Lanes: every car keeps a lane (inner -1 / outer +1) on 2-lane-per-direction roads (≥ 14 m), passes slower cars and moves to the turn side
      before a junction (smooth 2.5 s change, only into a free gap). The old drive-flow pass put every car in the outer lane (c.lane=.36).
   2. Signals: the CV junction logic (90_fixes_cv_ju.js) already stops, queues and releases cars; L3 audits it (red-light runs, queue overlaps).
   3. Pedestrians: minifig walk cycle (leg + opposite arm swing scaled by speed, bob at mid-stance, hip roll, torso twist, smooth turns, head look),
      speed variety, idles (look at phone, look around, chat in pairs), sidestep each other. They still leap aside from the player's car.
   4. Hazard blinkers on some parked cars (reuses the CV blinker mesh: no new draw call). */
const L3_ON=/[?&]l3=1/.test(location.search)||(()=>{try{return localStorage.getItem('od_l3')==='1'}catch(e){return false}})()/* WIP: default OFF until life3/lights + life3/peds pass (HANDOFF_life3) */,L3={lc:0,acc:0,pacc:0,run:0,ent:0,ov:0,qs:0,idle:0,chat:0};
function L3_ad(a,b){let d=a-b;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;return d}
// lateral offset (from the edge's node line) of lane s∈[-1,1] for car c on edge A→B; null = no two lanes here
function L3_off(c,A,B,s){if(!A||!B||A.ab||c.pk||c.tr)return null;if(A.g||B.g)return RD_ON&&(A.w||0)>=14?s*Math.min(A.w,B.w||A.w)*.11:null;const W=Math.min(A.w||20,B.w||20);return W>=14?W*(.27+.09*s):null}
function L3_free(c,A,B,tgt){const G=CV.G;if(!G)return false;const kx=Math.floor(c.x/16),kz=Math.floor(c.z/16),cur=L3_off(c,A,B,c.l3s),to=L3_off(c,A,B,tgt);if(cur==null||to==null)return false;
  for(let a=-1;a<=1;a++)for(let e=-1;e<=1;e++)for(const o of G.get((kx+a)*100000+kz+e)||[]){if(o===c||o.dead>0||o.CVhx*c.CVhx+o.CVhz*c.CVhz<.7)continue;const rx=o.x-c.x,rz=o.z-c.z,al=rx*c.CVhx+rz*c.CVhz;if(al<-11||al>15)continue;
    const lat=cur+(-rx*c.CVhz+rz*c.CVhx);if(Math.abs(lat-to)<2)return false}return true}
function L3_tick(){const N=HUB.nodes;for(const c of HUB.cars){if(c.l3t==null){if(c.pk||c.tr||CT_wideHw(c))continue;c.l3t=((c.j*7+c.k*3)>>1)%2?1:-1;c.l3s=c.l3t}
  if(!c.CVn||c.dead>0||c.route&&!c.CVr||(c.l3c||0)>0)continue;const A=N[c.a],B=N[c.b];if(L3_off(c,A,B,0)==null)continue;let want=c.l3t;
  if(c.CVi&&c.CViT>0&&c.RDy!=='box')want=-c.CVi;/* turning soon: be in the lane on the turn side (blinker side = -lane) */
  else{const l=c.CVl;if(l&&!(l.dead>0)&&!c.RDy){const al=(l.x-c.x)*c.CVhx+(l.z-c.z)*c.CVhz;if(al<24&&(l.cv||0)>.5&&(l.cv||0)<(c.v||0)*.75&&!l.RDy)want=-c.l3t}}/* slower car ahead (not queued at a light): pass it */
  if(want!==c.l3t&&L3_free(c,A,B,want)){c.l3t=want;c.l3c=4;L3.lc++}}}
// red-light audit: a car entering a signalled box on red without a reservation granted before the red = a run
function L3_audit(){if(!CV.sig.length)return;for(const c of HUB.cars){if(!c.CVn||c.dead>0){c.l3J=null;continue}let In=null;CV_near(c.x,c.z,J=>J.sig&&Math.hypot(J.x-c.x,J.z-c.z)<J.R0&&(In=J));
  if(In&&c.l3J!==In&&c.l3P!==In){let k=-1,bd=.3;In.ap.forEach((g,i)=>{const v=g.dx*c.CVhx+g.dz*c.CVhz;if(v>bd){bd=v;k=i}});if(k>=0&&In.ap.length>1){L3.ent++;const t0=In.res&&In.res.get(c);if(CV_st(In,k)==='r'&&!(t0<CV.t-.05)){L3.run++;L3.rl=[Math.round(c.x),Math.round(c.z),CV_u(In).toFixed(1)];(L3.why||(L3.why={}))[[c.RDy,c.CVf!=null&&((c.CVf/8)|0)===In.id?'f':'nf',c.route?'r'+c.route.length:'',c.CVr?'cvr':'',c.a<HUB.nodes.ng?'':'ab',CV.seg.has(c.a*CV.K+c.b)?'seg':'noseg',(c.cv||0)>5?'fast':'slow'].join('.')]=((L3.why||{})[[c.RDy,c.CVf!=null&&((c.CVf/8)|0)===In.id?'f':'nf',c.route?'r'+c.route.length:'',c.CVr?'cvr':'',c.a<HUB.nodes.ng?'':'ab',CV.seg.has(c.a*CV.K+c.b)?'seg':'noseg',(c.cv||0)>5?'fast':'slow'].join('.')]||0)+1}}}
  if(c.l3J&&!In)c.l3P=c.l3J;else if(In)c.l3P=null;c.l3J=In}}
// stop-line guard: the CV logic looks for its next junction only outside a signalled box and along the approach edges, so a car leaving one box
// straight into the next (or on a link edge) never saw that light. Here every near car checks each signalled box its heading line passes through.
function L3_guard(){for(const c of HUB.cars){c.l3V=null;if(!c.CVn||c.dead>0||c.pk||c.CVhx==null)continue;const v0=c.cv||0;let vm=1e9;
  CV_near(c.x,c.z,J=>{if(!J.sig||J.ap.length<2)return false;const rx=J.x-c.x,rz=J.z-c.z,l=Math.hypot(rx,rz);if(l<J.R0||l>J.R0+45)return false;const al=rx*c.CVhx+rz*c.CVhz,lat=Math.abs(rx*c.CVhz-rz*c.CVhx),B=HUB.nodes[c.b],bl=B?Math.hypot(B.x-J.x,B.z-J.z):1e9;if(al<=0||lat>=J.R0*.92&&!(bl<J.R0+8&&al>l*.3))return false;/* heading line through the box, or the next node at its edge (the turn into it happens there) */
    const res=J.res||(J.res=new Map());if(res.has(c))return false;const d=lat<J.R0?al-Math.sqrt(J.R0*J.R0-lat*lat):l-J.R0;let k=-1,bd=.3;J.ap.forEach((g,i)=>{const v=g.dx*c.CVhx+g.dz*c.CVhz;if(v>bd){bd=v;k=i}});if(k<0)return false;
    const st=CV_st(J,k),go=st==='g'||st==='y'&&d<v0*v0/12+1.5;if(go){if(d<6)res.set(c,CV.t);return false}const w=Math.sqrt(10*Math.max(0,d-2));if(w<vm)vm=w;return false});
  if(vm<1e9){c.l3V=c.v;c.v=Math.min(c.v,vm);c.cv=Math.min(v0,vm);if(c.RDy==null)c.RDy='sig';L3.gd=(L3.gd||0)+1}}}
// queue overlaps: two nearly stopped cars, same heading, bodies intersecting (< 4 m nose to tail, < 1.6 m apart sideways)
function L3_overlaps(){const G=CV.G;if(!G)return 0;let n=0;for(const L of G.values())for(const c of L)if(!(c.dead>0)&&(c.cv||0)<1)for(const o of L){if(o===c||o.dead>0||(o.cv||0)>=1)continue;const rx=o.x-c.x,rz=o.z-c.z,al=rx*c.CVhx+rz*c.CVhz;if(al>0&&al<4&&Math.abs(-rx*c.CVhz+rz*c.CVhx)<1.6&&o.CVhx*c.CVhx+o.CVhz*c.CVhz>.8)n++}return n}
function L3_hazards(){const im=CV.im;if(!im||!(((CV.t*2.2)|0)%2))return;let n=im.count;for(const c of HUB.cars){if(!c.pk||c.dead>0||(c.j*5+c.k)%3||n>=156)continue;if(Math.abs(c.x-RO.x)>150||Math.abs(c.z-RO.z)>150)continue;const N=HUB.nodes,A=N[c.a],B=N[c.b];if(!A||!B)continue;const L=Math.hypot(B.x-A.x,B.z-A.z)||1,hx=(B.x-A.x)/L,hz=(B.z-A.z)/L;
  for(const s of[1,-1])for(const f of[2.6,-2.6]){_m.makeTranslation(c.x+hz*s*1.1+hx*f,(c.y||0)+1.1,c.z-hx*s*1.1+hz*f);im.setMatrixAt(n++,_m)}}im.count=n;im.instanceMatrix.needsUpdate=true}
// ---- pedestrians
function L3_pedInit(){const P=HUB.peds;if(!P)return;P.forEach((p,i)=>{const r=CV_h(i,7,3);p.v=r<.12?rr(.75,1.0)/* strollers */:r<.85?rr(1.15,1.6):rr(1.8,2.3)/* in a hurry */;p.l3v=p.v;p.l3n=rr(6,30);p.l3o=0;p.l3a=p.l3h=null})}
function L3_pedPre(dt){const P=HUB.peds;if(!P)return;L3.pacc+=dt;const tk=L3.pacc>=.2;if(tk)L3.pacc=0;const PN=Math.min(P.length,LV_pn(P.length));
  for(let i=0;i<PN;i++){const p=P[i];if(p.l3v==null)p.l3v=p.v;if(p.cw||p.ofS||p.jy>0){p.l3k=0;continue}
    if(p.l3k){p.l3i-=dt;p.v=0;if(p.l3i<=0||p.CVj&&p.CVd<1||Math.hypot((p._x||0)-RO.x,(p._z||0)-RO.z)<16&&Math.abs(RO.v)>8){p.l3k=0;p.v=p.l3v;p.l3n=rr(10,40);const q=p.l3q;if(q&&q.l3k===3){q.l3k=0;q.v=q.l3v}p.l3q=null}continue}
    p.v=p.l3v;p.l3n-=dt;if(p.l3n<=0&&!p.rdX&&!p.rdH&&!(p.CVj&&p.CVd<12)&&p.t>.15&&p.t<.85){const r=CV_h(i,L3.idle,9);p.l3k=r<.45?1/* phone */:2/* look around */;p.l3i=rr(3,8);L3.idle++}}
  if(!tk)return;/* 5 Hz: chat pairs and sidestepping on a shared pavement */const G=new Map();for(let i=0;i<PN;i++){const p=P[i];if(p._x==null||p.jy>0)continue;const k=Math.floor(p._x/6)*100000+Math.floor(p._z/6);if(!G.has(k))G.set(k,[]);G.get(k).push(p)}
  for(const L of G.values())for(const p of L){let o=0;for(const q of L){if(q===p)continue;const dx=q._x-p._x,dz=q._z-p._z,dd=Math.hypot(dx,dz);if(dd>3.2)continue;
      if(!p.l3k&&!q.l3k&&!p.cw&&!q.cw&&!p.ofS&&!q.ofS&&dd>1.2&&!p.rdX&&!q.rdX&&!(p.CVj&&p.CVd<12)&&CV_h(p._x|0,q._z|0,5)<.08){p.l3k=q.l3k=3;p.l3i=q.l3i=rr(5,10);p.l3q=q;q.l3q=p;p.l3f=Math.atan2(dx,dz);q.l3f=p.l3f+Math.PI;p.v=q.v=0;L3.chat++;break}
      if(p.l3k||!p.l3H)continue;const fx=Math.sin(p.l3H),fz=Math.cos(p.l3H),al=dx*fx+dz*fz;if(al>0&&al<3.2){const lat=-dx*fz+dz*fx;o+=lat>0?-.7:.7}}p.l3o=Math.max(-1,Math.min(1,o))}}
function L3_pedPost(){const P=HUB.peds;if(!P)return;for(const p of P)if(p.l3k)p.v=p.l3v}
const _l3e=new THREE.Euler(),_l3q=new THREE.Quaternion();
function L3_part(im,i,ox,oy,oz,rx,ry,rz){_l3e.set(rx||0,ry||0,rz||0);_l3q.setFromEuler(_l3e);_pL.compose(_pv.set(ox,oy,oz),_l3q,_ps.set(1,1,1));_pR.multiplyMatrices(_pB,_pL);im.setMatrixAt(i,_pR)}
// returns true when it posed the ped (plain walkers and idlers); jumpers, crowd peds, on-foot standers and wavers keep the old pose
function L3_pose(p,i,x,z,h,S2,air,S,d,sp,dt){if(air||p.cw||S||p.spin)return false;if(typeof LV_wave==='function'&&LV_wave(i,d,sp))return false;const Q=HUB.pP,now=performance.now()/1000;
  if(p.l3k===3&&p.l3f!=null)h=p.l3f;if(p.l3a==null)p.l3a=h;p.l3a+=L3_ad(h,p.l3a)*Math.min(1,dt*(p.l3k?3:5));const H=p.l3a;p.l3H=H;/* smooth turns */
  p.l3so=(p.l3so||0)+((p.l3o||0)-(p.l3so||0))*Math.min(1,dt*3);const sx=Math.cos(H)*p.l3so*1.1,sz=-Math.sin(H)*p.l3so*1.1;/* sidestep */
  const v=p.l3k?0:p.l3v,wk=v>.05,amp=wk?Math.min(.75,.32+.2*v):0,s=Math.sin(p.ph),sw=s*amp,bob=wk?(1-Math.abs(s))*.12*Math.min(1,v):0,roll=wk?Math.cos(p.ph)*.035:0,tw=sw*.18;
  _pq.setFromAxisAngle(_hup,H);_pB.compose(_pv.set(x+sx,p.y+bob,z+sz),_pq,_ps.set(S2,S2,S2));
  const kn=wk?Math.max(0,-Math.cos(p.ph))*.25:0;/* trailing leg lifts a touch */
  L3_part(Q.legL,i,-.3,1.25,0,sw-(s<0?kn:0),0,0);L3_part(Q.legR,i,.3,1.25,0,-sw-(s>0?kn:0),0,0);L3_part(Q.hip,i,0,1.36,0,0,tw*.4,roll);L3_part(Q.tor,i,0,2.22,0,wk?.05:0,tw,roll);
  let aL=-sw*.95,aR=sw*.95,hx=0,hy=0;const ph2=now*.9+i;
  if(p.l3k===1){aR=-1.35+Math.sin(now*2+i)*.04;aL=-.1;hx=.38}/* looks at the phone in the right hand */
  else if(p.l3k===2){hy=Math.sin(ph2*.7)*.75;aL=aR=.05}/* looks around */
  else if(p.l3k===3){const g=Math.max(0,Math.sin(now*2.6+i*1.3));aL=-.15-g*.9;aR=-.1;hy=Math.sin(now*.6+i)*.15}/* chatting, gesturing */
  else hy=Math.sin(ph2*.35)*.22*(i%3?1:0);
  L3_part(Q.armL,i,-.86,2.78,0,aL,tw,-.12);L3_part(Q.armR,i,.86,2.78,0,aR,tw,.12);L3_part(Q.handL,i,-.86,2.78,0,aL,tw,-.12);L3_part(Q.handR,i,.86,2.78,0,aR,tw,.12);
  L3_part(Q.head,i,0,3.32,0,hx,hy+tw,0);L3_part(Q.hair,i,0,3.62,0,hx,hy+tw,0);return true}
if(L3_ON){
  buildHubTraffic=(f=>function(){const r=f.apply(this,arguments);try{L3_pedInit()}catch(e){console.warn('L3',e)}return r})(buildHubTraffic);
  hubTrafficStep=(f=>function(dt){if(!HUB.cars||!HUB.nodes)return f.apply(this,arguments);try{L3.acc+=dt;if(L3.acc>=.2){L3.acc=0;L3_tick()}for(const c of HUB.cars){if(c.l3t==null)continue;if(c.l3c>0)c.l3c-=dt;const e=c.l3t-c.l3s;if(e)c.l3s+=Math.sign(e)*Math.min(Math.abs(e),dt*.8)}L3_pedPre(dt);if(CV.G)L3_guard()}catch(e){console.warn('L3',e)}
    const r=f.apply(this,arguments);try{for(const c of HUB.cars)if(c.l3V!=null){c.v=c.l3V;c.l3V=null}L3_pedPost();L3_audit();L3_hazards()}catch(e){console.warn('L3',e)}return r})(hubTrafficStep)}
// ---- checklist GOs (state asserts, no rendering): sims run the real hubTrafficStep with fixed dt
function L3_sim(sec,dt=1/15){for(let t=0;t<sec;t+=dt){T+=dt;hubTrafficStep(dt)}}
function L3_park(x,z){RO.x=x;RO.z=z;RO.v=0}
function L3_goLanes(){if(!L3_ON)return'📍 PENDING · life-3 is OFF in this build (add ?l3=1 to try it)';const N=HUB.nodes;let best=null,bn=-1;for(const c of HUB.cars){if(c.dead>0||c.l3t==null)continue;const A=N[c.a],B=N[c.b];if(L3_off(c,A,B,0)==null)continue;let n=0;for(const o of HUB.cars)if(Math.abs(o.x-c.x)<160&&Math.abs(o.z-c.z)<160)n++;if(n>bn){bn=n;best=c}}
  if(!best)return'📍 LANES · no 2-lane road with cars ❌';L3_park(best.x+6,best.z+6);const lc0=L3.lc;L3_sim(60);
  let a=0,b=0,cl=0;for(const c of HUB.cars){if(!c.CVn||c.dead>0||c.l3t==null)continue;const A=N[c.a],B=N[c.b];if(L3_off(c,A,B,0)==null)continue;if(Math.abs(c.l3s-c.l3t)>.01){cl++;continue}c.l3s<0?a++:b++}
  const n=a+b,pa=n?a/n:0,pb=n?b/n:0,ok=n>=8&&pa>=.3&&pb>=.3&&L3.lc>lc0;return`📍 LANES after 60 s: ${n} cars on 2-lane roads near you, inner ${Math.round(pa*100)} % / outer ${Math.round(pb*100)} % (${cl} mid-change), ${L3.lc-lc0} lane changes ${ok?'✅':'❌'}`}
function L3_goLights(){if(!L3_ON)return'📍 PENDING · life-3 is OFF in this build (add ?l3=1 to try it)';if(!CV.sig.length)return'📍 LIGHTS · no signals ❌';
  // the spot with the most signalled junctions within 250 m (CV only drives cars within 320 m of the player)
  let best=null,bn=0;for(const J of CV.sig){let n=0;for(const K of CV.sig)if(Math.hypot(K.x-J.x,K.z-J.z)<250)n++;if(n>bn){bn=n;best=J}}
  L3_park(best.x+best.R0+14,best.z+best.R0+14);const r0=L3.run,e0=L3.ent;let ov=0,qmax=0;for(let s=0;s<120;s++){L3_sim(1);ov+=L3_overlaps();let q=0;for(const c of HUB.cars)if(c.CVn&&c.RDy==='lead'&&(c.cv||0)<1)q++;qmax=Math.max(qmax,q)}
  const runs=L3.run-r0,ent=L3.ent-e0,ok=bn>=3&&runs===0&&ov===0&&ent>=20&&qmax>=2;return`📍 LIGHTS 120 s at ${bn} signalled junctions: ${ent} box entries, ${runs} red-light runs${runs?' (last '+L3.rl+' '+JSON.stringify(L3.why)+')':''}, ${ov} queue overlaps, longest queue ${qmax} cars ${ok?'✅':'❌'}`}
function L3_goPeds(){if(!L3_ON)return'📍 PENDING · life-3 is OFF in this build (add ?l3=1 to try it)';const P=HUB.peds;if(!P)return'📍 PEDS · none ❌';let road=0,seen=0,ph=0,phn=0;const PN=()=>Math.min(P.length,LV_pn(P.length));
  for(let s=0;s<30;s++){const b=P.map(p=>p.ph);L3_sim(1);for(let i=0;i<PN();i++){const p=P[i];if(p._x==null||p.jy>0||p.cw||p.ofS)continue;seen++;
    const dph=p.ph-b[i];if(!p.l3k&&!p.rdH&&!p.rdX&&!p.CVj&&!p.CVh&&p.l3v>0&&dph>.5){ph+=Math.abs(dph/p.l3v-3.2)<.5?1:0;phn++}else if(p.l3k===1&&dph>1e-6){phn++}/* idlers must not walk on the spot */
    const q=cityAt(p._x,p._z);if(!q||q.d>q.road.w/2-.6||q.road.cls==='ped')continue;if(p.l3H!=null&&Math.abs(Math.sin(p.l3H)*q.p.tx+Math.cos(p.l3H)*q.p.tz)<.5)continue;/* walking straight across = a crossing */if(p.rdX||CV_near(p._x,p._z,J=>Math.hypot(J.x-p._x,J.z-p._z)<J.R0+4))continue;road++;if(!L3.pb){const A=HUB.nodes[p.a],B=HUB.nodes[p.b];L3.pb=[p._x|0,p._z|0,q.d.toFixed(1),q.road.w,q.road.cls,A&&A.g?'g':'',B&&B.g?'g':'',p.l3k||0,p.rdK!=null?'rd':'',p.sd]}}}
  const kinds=new Set(P.map(p=>p.l3k).filter(Boolean)),ok=road===0&&phn>50&&ph/phn>=.8&&(L3.idle+L3.chat)>0;
  return`📍 PEDS 30 s: ${seen} ped-samples, ${road} on a road lane outside crossings${road?' '+JSON.stringify(L3.pb):''}, walk phase tracks speed in ${phn?Math.round(ph/phn*100):0} % of ${phn}, ${L3.idle} idles + ${L3.chat} chats (now: ${[...kinds].join(',')||'-'}) ${ok?'✅':'❌'}`}
window.__l3={L3,on:L3_ON,go:{lanes:L3_goLanes,lights:L3_goLights,peds:L3_goPeds}};
