/* ===== L3 · life-3: smarter traffic and natural pedestrians. default ON since life-4 (?l3=0 / od_l3=0 = off); the stop-line guard + red-light audit only with ?l3lt=1 (WIP). Test hook window.__l3 (GOs life3/*) =====
   1. Lanes: every car keeps a lane (inner -1 / outer +1) on 2-lane-per-direction roads (≥ 14 m), passes slower cars and moves to the turn side
      before a junction (smooth 2.5 s change, only into a free gap). The old drive-flow pass put every car in the outer lane (c.lane=.36).
   2. Signals: the CV junction logic (90_fixes_cv_ju.js) already stops, queues and releases cars; life-4 adds stop lines from each car's route (L3_edges/L3_stop/L3_guard, ?l3lt=1) and audits runs and queue overlaps.
   3. Pedestrians: minifig walk cycle (leg + opposite arm swing scaled by speed, bob at mid-stance, hip roll, torso twist, smooth turns, head look),
      speed variety, idles (look at phone, look around, chat in pairs), sidestep each other. They still leap aside from the player's car.
   4. Hazard blinkers on some parked cars (reuses the CV blinker mesh: no new draw call). */
const L3_ON=!/[?&]l3=0/.test(location.search)&&(()=>{try{return localStorage.getItem('od_l3')!=='0'}catch(e){return true}})()/* life-4: ON by default (?l3=0 or od_l3=0 turns it off) */,L3_LT=L3_ON&&(/[?&]l3lt=1/.test(location.search)||(()=>{try{return localStorage.getItem('od_l3lt')==='1'}catch(e){return false}})())/* stop-line guard + red-light audit: WIP, OFF until life3/lights passes (queue overlaps) */,L3={lc:0,acc:0,pacc:0,run:0,ent:0,ov:0,qs:0,idle:0,chat:0};
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
function L3_near(c){if(c.dead>0||c.pk)return null;const N=HUB.nodes,A=N[c.a],B=N[c.b];if(!A||!B||A.ab||B.ab||c.a>=N.ng||c.b>=N.ng)return null;if(Math.abs(c.x-RO.x)>320||Math.abs(c.z-RO.z)>320)return null;
  const L=Math.hypot(B.x-A.x,B.z-A.z)||1;return[(B.x-A.x)/L,(B.z-A.z)/L]}
// red-light audit: a car that was outside every signalled box on the previous step and is inside one now, on an approach whose light is red, with
// no reservation from before the line. Cars that spawn or jump into a box (no "outside" step before) are not entries.
function L3_audit(){if(!CV.sig.length)return;for(const c of HUB.cars){const h=L3_near(c);if(!h){c.l3Q=null;continue}let In=null;CV_near(c.x,c.z,J=>J.sig&&Math.hypot(J.x-c.x,J.z-c.z)<J.R0&&(In=J));
  if(In&&c.l3Q===0&&c.l3P!==In&&Math.hypot(c.x-c.l3x,c.z-c.l3z)<4/* a respawn or recycle jump is not an entry */){let k=-1,bd=.3;In.ap.forEach((g,i)=>{const v=g.dx*h[0]+g.dz*h[1];if(v>bd){bd=v;k=i}});if(k>=0&&In.ap.length>1){L3.ent++;const t0=In.res&&In.res.get(c);
    if(CV_st(In,k)==='r'&&!(t0<CV.t-.05)){L3.run++;const S=c.l3S;L3.rl=[Math.round(c.x),Math.round(c.z),c.a,c.b,+(c.t||0).toFixed(2),!S?'none':S.J!==In?'other':'k'+S.k+'/'+k+(c.l3V!=null?'g':'')].push(L3.rl.concat([HUB.nodes[c.a].x|0,HUB.nodes[c.a].z|0,HUB.nodes[c.b].x|0,HUB.nodes[c.b].z|0,In.x|0,In.z|0,In.R0|0,(c.cv||0).toFixed(1)]))}}}
  if(In)c.l3P=In;else if(c.l3P&&Math.hypot(c.l3P.x-c.x,c.l3P.z-c.z)>c.l3P.R0+6)c.l3P=null;c.l3Q=In?1:0;c.l3x=c.x;c.l3z=c.z}}
// stop lines from the route (life-4): every road edge knows the first signalled box it runs into (distance from its start to the circle, the
// approach k the audit will see from that heading). A car checks its own edge, then the edge it takes next (its route, or every exit of B when it
// has none and B is close), so it never needs to be "matched" by a proximity box. Red/late amber: brake to 2 m before the line; leads queue it.
function L3_edges(){const N=HUB.nodes,NG=N.ng,K=CV.K,E=new Map();for(let i=0;i<NG;i++){const A=N[i];if(A.ab)continue;for(const j of A.nb){if(j>=NG)continue;const B=N[j];if(B.ab)continue;
  const L=Math.hypot(B.x-A.x,B.z-A.z)||1,hx=(B.x-A.x)/L,hz=(B.z-A.z)/L;let best=null;for(const J of CV.sig){if(J.ap.length<2)continue;const rx=J.x-A.x,rz=J.z-A.z;if(Math.abs(rx)>L+40||Math.abs(rz)>L+40)continue;
    const p=rx*hx+rz*hz,q=Math.abs(rx*hz-rz*hx);if(p<=0||q>=J.R0)continue;/* heading away: leaving that box */const s=Math.max(0,p-Math.sqrt(J.R0*J.R0-q*q));/* 0: starts inside a big merged box but still heads in (lane-offset cars are outside) */if(s>L||best&&s>=best.s)continue;
    let k=-1,bd=.3;J.ap.forEach((g,m)=>{const v=g.dx*hx+g.dz*hz;if(v>bd){bd=v;k=m}});if(k>=0)best={J,k,s}}if(best)E.set(i*K+j,best)}}L3.E=E;return E}
function L3_stop(c,h){const N=HUB.nodes,K=CV.K,E=L3.E||L3_edges(),A=N[c.a],B=N[c.b];if(!A||!B)return null;const L=Math.hypot(B.x-A.x,B.z-A.z)||1,pos=(c.t||0)*L,rem=L-pos;
  const at=(J,k,d0)=>{const rx=J.x-c.x,rz=J.z-c.z,l=Math.hypot(rx,rz);if(l<J.R0)return null;const p=rx*h[0]+rz*h[1],q=Math.abs(rx*h[1]-rz*h[0]);return{J,k,d:q<J.R0&&p>0?p-Math.sqrt(J.R0*J.R0-q*q):Math.max(d0,l-J.R0)}};
  const e=E.get(c.a*K+c.b);if(e&&pos<e.s+12){const S=at(e.J,e.k,e.s-pos);if(S)return S}if(rem>45)return null;let best=null;const nx=c.route&&c.route.length?[c.route[0]]:B.nb.filter(n=>n!==c.a);
  for(const n of nx){const f=E.get(c.b*K+n);if(!f)continue;const S=at(f.J,f.k,rem+f.s);if(S&&(!best||S.d<best.d))best=S}return best}
function L3_guard(){for(const c of HUB.cars){c.l3V=null;c.l3S=null;const h=L3_near(c);if(!h)continue;const S=c.l3S=L3_stop(c,h);if(!S||S.d>60)continue;const{J,k,d}=S,v0=c.cv||0,res=J.res||(J.res=new Map());
  if(res.has(c))continue;const st=CV_st(J,k),go=st==='g'||st==='y'&&d<v0*v0/12+1.5;if(go){if(d<6||st==='y')res.set(c,CV.t);/* amber: committed */continue}
  const vm=Math.sqrt(10*Math.max(0,d-2));c.l3V=c.v;c.v=Math.min(c.v,vm);c.cv=Math.min(v0,vm);c.RDy='sig';L3.gd=(L3.gd||0)+1}}
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
  buildHubTraffic=(f=>function(){const r=f.apply(this,arguments);L3.E=null;try{L3_pedInit()}catch(e){console.warn('L3',e)}return r})(buildHubTraffic);
  hubTrafficStep=(f=>function(dt){if(!HUB.cars||!HUB.nodes)return f.apply(this,arguments);try{L3.acc+=dt;if(L3.acc>=.2){L3.acc=0;L3_tick()}for(const c of HUB.cars){if(c.l3t==null)continue;if(c.l3c>0)c.l3c-=dt;const e=c.l3t-c.l3s;if(e)c.l3s+=Math.sign(e)*Math.min(Math.abs(e),dt*.8)}L3_pedPre(dt);if(CV.G&&L3_LT)L3_guard()}catch(e){console.warn('L3',e)}
    const r=f.apply(this,arguments);try{for(const c of HUB.cars)if(c.l3V!=null){c.v=c.l3V;c.l3V=null}L3_pedPost();if(L3_LT)L3_audit();L3_hazards()}catch(e){console.warn('L3',e)}return r})(hubTrafficStep)}
// kerb fix (life-4): RD_kerb keeps people at the RD road's own half width; where the city street is wider (ath 1899,-1663: an 8.5 m "sec" street on a
// g-chain) that is still on the lane. Every 2nd call per person (every call while pushed out) check the city street and ease them out to its kerb + 0.9 m (not on crossings/boxes).
function L3_kerbFix(p,k,dt){p.l3kn=(p.l3kn||0)+1;if(p.l3kn%2===0||p.l3tx||p.rdK!==p.l3rk){p.l3rk=p.rdK;let tx=0,tz=0;const X=k[0]+(p.jx||0),Z=k[1]+(p.jz||0)/* drawn at k + the leftover leap offset */,q=!p.rdX&&cityAt(X,Z);if(q&&q.road.cls!=='ped'&&q.road.w>0&&!CV_near(X,Z,J=>Math.hypot(J.x-X,J.z-Z)<J.R0+4)){const hw=q.road.w/2,al=Math.abs(q.lat);
    if(al<hw+.5){const sg=q.lat<0?-1:q.lat>0?1:(p.sd||1),m=sg*(hw+.9)-q.lat;tx=q.p.tz*m;tz=-q.p.tx*m;if(al<hw-.6){p.l3kx=tx;p.l3kz=tz}/* deep on the lane: no easing */}}p.l3tx=tx;p.l3tz=tz}
  const e=Math.min(1,dt*5);p.l3kx=(p.l3kx||0)+((p.l3tx||0)-(p.l3kx||0))*e;p.l3kz=(p.l3kz||0)+((p.l3tz||0)-(p.l3kz||0))*e;k[0]+=p.l3kx;k[1]+=p.l3kz;return k}
if(L3_ON&&typeof RD_kerb==='function')RD_kerb=(f=>function(p,bx,bz,dt){const k=f.apply(this,arguments);try{return L3_kerbFix(p,k,dt||0)}catch(e){return k}})(RD_kerb);
// ---- checklist GOs (state asserts, no rendering): sims run the real hubTrafficStep with fixed dt
function L3_sim(sec,dt=1/15){for(let t=0;t<sec;t+=dt){T+=dt;hubTrafficStep(dt)}}
function L3_park(x,z){RO.x=x;RO.z=z;RO.v=0}
function L3_goLanes(){if(!L3_ON)return'📍 PENDING · life-3 is OFF (?l3=0)';const N=HUB.nodes;let best=null,bn=-1;for(const c of HUB.cars){if(c.dead>0||c.l3t==null)continue;const A=N[c.a],B=N[c.b];if(L3_off(c,A,B,0)==null)continue;let n=0;for(const o of HUB.cars)if(Math.abs(o.x-c.x)<160&&Math.abs(o.z-c.z)<160)n++;if(n>bn){bn=n;best=c}}
  if(!best)return'📍 LANES · no 2-lane road with cars ❌';L3_park(best.x+6,best.z+6);const lc0=L3.lc;L3_sim(60);
  let a=0,b=0,cl=0;for(const c of HUB.cars){if(!c.CVn||c.dead>0||c.l3t==null)continue;const A=N[c.a],B=N[c.b];if(L3_off(c,A,B,0)==null)continue;if(Math.abs(c.l3s-c.l3t)>.01){cl++;continue}c.l3s<0?a++:b++}
  const n=a+b,pa=n?a/n:0,pb=n?b/n:0,ok=n>=8&&pa>=.3&&pb>=.3&&L3.lc>lc0;return`📍 LANES after 60 s: ${n} cars on 2-lane roads near you, inner ${Math.round(pa*100)} % / outer ${Math.round(pb*100)} % (${cl} mid-change), ${L3.lc-lc0} lane changes ${ok?'✅':'❌'}`}
function L3_goLights(){if(!L3_LT)return'📍 PENDING · the stop-line guard is OFF in this build (add ?l3lt=1 to try it)';if(!CV.sig.length)return'📍 LIGHTS · no signals ❌';
  // the spot with the most signalled junctions within 250 m (CV only drives cars within 320 m of the player)
  let best=null,bn=0;for(const J of CV.sig){let n=0;for(const K of CV.sig)if(Math.hypot(K.x-J.x,K.z-J.z)<250)n++;if(n>bn){bn=n;best=J}}
  L3_park(best.x+best.R0+14,best.z+best.R0+14);const r0=L3.run,e0=L3.ent;let ov=0,qmax=0;for(let s=0;s<120;s++){L3_sim(1);ov+=L3_overlaps();let q=0;for(const c of HUB.cars)if(c.CVn&&c.RDy==='lead'&&(c.cv||0)<1)q++;qmax=Math.max(qmax,q)}
  const runs=L3.run-r0,ent=L3.ent-e0,ok=bn>=3&&runs<=2&&ov===0&&ent>=20&&qmax>=2;return`📍 LIGHTS 120 s at ${bn} signalled junctions: ${ent} box entries, ${runs} red-light runs${runs?' (last '+L3.rl+')':''}, ${ov} queue overlaps, longest queue ${qmax} cars ${ok?'✅':'❌'}`}
function L3_goPeds(){if(!L3_ON)return'📍 PENDING · life-3 is OFF (?l3=0)';const P=HUB.peds;if(!P)return'📍 PEDS · none ❌';L3.pb=null;let road=0,seen=0,ph=0,phn=0;const PN=()=>Math.min(P.length,LV_pn(P.length));
  for(let s=0;s<30;s++){const b=P.map(p=>p.ph);L3_sim(1);for(let i=0;i<PN();i++){const p=P[i];if(p._x==null||p.jy>0||p.cw||p.ofS)continue;seen++;
    const dph=p.ph-b[i];if(!p.l3k&&!p.rdH&&!p.rdX&&!p.CVj&&!p.CVh&&p.l3v>0&&dph>.5){ph+=Math.abs(dph/p.l3v-3.2)<.5?1:0;phn++}else if(p.l3k===1&&dph>1e-6){phn++}/* idlers must not walk on the spot */
    const q=cityAt(p._x,p._z);if(!q||q.d>q.road.w/2-.6||q.road.cls==='ped')continue;if(p.l3H!=null&&Math.abs(Math.sin(p.l3H)*q.p.tx+Math.cos(p.l3H)*q.p.tz)<.5)continue;/* walking straight across = a crossing */if(p.rdX||CV_near(p._x,p._z,J=>Math.hypot(J.x-p._x,J.z-p._z)<J.R0+4))continue;road++;if(!L3.pb){const A=HUB.nodes[p.a],B=HUB.nodes[p.b];L3.pb=[p._x|0,p._z|0,q.d.toFixed(1),q.road.w,q.road.cls,A&&A.g?'g':'',B&&B.g?'g':'',p.l3k||0,p.rdK!=null?'rd':'',p.sd,q.lat.toFixed(1),(p.l3kx||0).toFixed(1),(p.l3tx||0).toFixed(1),p.rdX?1:0,Math.hypot(p._x-RO.x,p._z-RO.z)|0,p.l3kn|0,(p.rdcx||0).toFixed(1)]}}}
  const kinds=new Set(P.map(p=>p.l3k).filter(Boolean)),ok=road===0&&phn>50&&ph/phn>=.8&&(L3.idle+L3.chat)>0;
  return`📍 PEDS 30 s: ${seen} ped-samples, ${road} on a road lane outside crossings${road?' '+JSON.stringify(L3.pb):''}, walk phase tracks speed in ${phn?Math.round(ph/phn*100):0} % of ${phn}, ${L3.idle} idles + ${L3.chat} chats (now: ${[...kinds].join(',')||'-'}) ${ok?'✅':'❌'}`}
window.__l3={L3,on:L3_ON,lt:L3_LT,sim:L3_sim,sig:()=>CV.sig,cars:()=>HUB.cars,park:L3_park,go:{lanes:L3_goLanes,lights:L3_goLights,peds:L3_goPeds}};
