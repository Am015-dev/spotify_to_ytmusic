// ==== QS (v88z quick wins, coordinator plan docs/CITY_LIFE_PLAN.md Q1-Q3 on alex/od-onfoot): per-class top speeds, traffic mix, ramps ====
// Speeds: free roam only (races unchanged). Each class has a roam top and a boost top (km/h on the HUD, open road and Autobahn). City
// streets (RO.inCity) run at TUNE.spCityK of both (×0.82 as before). They replace the single 174 / 224 km/h cap in 99_api.js (CR_VMAX/CR_VBOOST).
// Boost keeps its push (bPush) and fill sources; real nitrous mostly adds acceleration (+≈10 % top), so the boost top is near the class's real top.
// Handling is untouched: steering, camera and FX still scale with the OLD RO.top, so the car turns as before at any given speed.
Object.assign(TUNE,{spOn:1,spCityK:.82,spOpen:1,spMax:345,
 spCar:150,spCarB:175,spVan:130,spVanB:150,spHeavy:90,spHeavyB:100,spSuv:165,spSuvB:195,spSport:230,spSportB:290,spSuper:260,spSuperB:330,spBoat:90,spBoatB:105,
 trOn:1,trHour:1,trCar:55,trHeavy:45,trScoot:45});
// garage set id → class (template description): sports = the default Hot Rod and the street tuners/roadster/coupe; supercar = GT, Gold Rush, hypercar
const QS_CLS={rod:'spSport',ebbel:'spSport',posei:'spSuper',gold:'spSuper',t_su:'spSport',t_su_mid:'spSport',t_su_gt:'spSport',t_su_wide:'spSport',t_su_sky:'spSport',
 t_su_pink:'spSport',t_sc_tm:'spSport',t_sc_hy:'spSuper',t_bus:'spHeavy',t_truck:'spHeavy',t_limo:'spSuv',t_mt:'spVan'};
function QS_cls(){if(CR_MODE==='boat')return'spBoat';if(CR_MODE==='4x4')return'spSuv';let id='rod';try{id=GAR_set().id}catch(e){}return QS_CLS[id]||'spSport'}
// [roam top, boost top] km/h, open road: class × player level × BOOSTER upgrade, capped at spMax
function QS_kmh(lvl){let up=1;try{if(CR_MODE==='car')up=GAR_upMul(GAR_ups(),'top')}catch(e){}const k=QS_cls(),m=(lvl?lvl.top:1)*up;return[Math.min(TUNE.spMax,TUNE[k]*m),Math.min(TUNE.spMax*1.3,TUNE[k+'B']*m)]}
// speed target (m/s) replacing the old tt in roamStep (kf = surface fit × v85 offroad factor); also sets RO.qsV / RO.qsVB, the plain and boosted
// caps the weight layer in 99_api.js uses
function QS_tt(lvl,kf){const a=RO.onAB?1:RO.inCity?TUNE.spCityK:TUNE.spOpen,b=Math.max(RO.bRamp||0,RO.turbo>0&&!RO.bash?1:0),q=QS_kmh(lvl),v=q[0]/3.6*a*kf,vb=q[1]/3.6*a*kf;RO.qsV=v;RO.qsVB=vb;return v+(vb-v)*b}
// ---- traffic mix (of HUB.cars, 150; DR_traffic keeps every 2nd → the mix holds). Plan Q1 targets: Frankfurt trucks 4 %, buses 4 %, police 2 %
// (was i%11: 36 % heavy, 9 % police, no buses); Athens scooters 22 %, taxis 20 % (was 41 % taxis). Sources: Berlin city streets 5.5 % heavy
// vehicles; Attica fleet ≈24 % two-wheelers (EL.STAT via NTUA); see the plan's Sources.
// Frankfurt slots (HCAR after the swaps): 0 sedan,1 hypercar,2 taxi,3 van,4 truck,5 delivery,6 police,7 time coupe,8 bus,9 tuner,10 roadster
// Athens: 0 taxi,1 sedan,2 van,3 suv,4 delivery,5 sports,6 trolleybus,7 scooter,8 tuner,9 silver tuner
const QS_MIX={fra:[50,6,12,12,6,9,3,18,6,15,13],ath:[30,35,10,15,5,5,7,33,5,5]};
{const i=HCAR.indexOf('garbage-truck');if(i>=0)HCAR[i]='bus'} // same type count = same draw calls; garbage trucks are < 1 % of city traffic
let QS_K=null,QS_KC='';function QS_kind(i){if(QS_KC!==CID){QS_K=null;QS_KC=CID}if(!TUNE.trOn)return CID==='fra'?i%HCAR.length:ATH_K[i%ATH_K.length];
 if(!QS_K){const W=QS_MIX[CID==='fra'?'fra':'ath'],T=W.reduce((a,b)=>a+b,0),half=n=>{const c=W.map(w=>Math.floor(w*n/T)),r=W.map((w,k)=>w*n/T-c[k]);let left=n-c.reduce((a,b)=>a+b,0);for(const k of r.map((v,k)=>k).sort((a,b)=>r[b]-r[a]))if(left-->0)c[k]++;const L=[];c.forEach((m,k)=>{for(let q=0;q<m;q++)L.push(k)});
  const g=mul(919+n);for(let q=L.length-1;q>0;q--){const t=Math.floor(g()*(q+1));[L[q],L[t]]=[L[t],L[q]]}return L};const A=half(75),B=half(75);QS_K=[];for(let q=0;q<75;q++)QS_K.push(A[q],B[q])} // even slots (the half DR_traffic keeps) carry the exact mix
 return QS_K[i%QS_K.length]}
// city cruise speeds (km/h → m/s, ±15 %): 50 km/h limit on Frankfurt and Athens city streets
function QS_v0(k,ab){if(!TUNE.trOn)return HCAR[k]==='#scoot'?rr(15,22):rr(14,24);const nm=HCAR[k]||'',hv=/truck|delivery|bus|#troll/.test(nm);
 if(ab)return(hv?rr(80,90):rr(100,130))/3.6;const m=nm==='#scoot'?TUNE.trScoot:hv?TUNE.trHeavy:TUNE.trCar;return m/3.6*(.9+.2*R())}
// ---- ramps stay clear (v88z): traffic was queueing on the ramps' run-ups (ramps sit across the lanes) and the player hit it or stopped
// behind it. Traffic now never turns onto a street edge that carries a free-roam ramp (run-up 40 m, landing 20 m), cars already on one
// out of sight (> 110 m) move to the next free edge, and no car parks there. TUNE.rampClear 0 = as before.
TUNE.rampClear=1;let QS_SH=null,QS_SHk='';
const QS_segD=(x,z,A,B)=>{const dx=B.x-A.x,dz=B.z-A.z,L2=dx*dx+dz*dz||1,t=Math.max(0,Math.min(1,((x-A.x)*dx+(z-A.z)*dz)/L2));return Math.hypot(A.x+dx*t-x,A.z+dz*t-z)};
function QS_pts(r){const s=Math.sin(r.h),c=Math.cos(r.h);return[-r.len/2-40,-r.len/2-20,0,r.len/2+20].map(a=>[r.x+s*a,r.z+c*a])}
function QS_shutSet(){const N=HUB.nodes;if(!N||!RO.ramps)return null;const key=RO.ramps.length+':'+N.ng;if(QS_SH&&QS_SHk===key&&QS_SH.N===N)return QS_SH;const S=new Set();S.N=N;
 for(const r of RO.ramps){if(r.dk)continue;const P=QS_pts(r);for(let i=0;i<N.ng;i++)for(const j of N[i].nb){if(j<=i||j>=N.ng)continue;if(P.some(([x,z])=>QS_segD(x,z,N[i],N[j])<r.w/2+6))S.add(i*100000+j)}}
 QS_SH=S;QS_SHk=key;return S}
function QS_shut(a,b){if(!TUNE.rampClear||a==null||b==null)return false;const S=QS_shutSet();return!!S&&S.has(Math.min(a,b)*100000+Math.max(a,b))}
function QS_rampNear(x,z){if(!TUNE.rampClear)return false;for(const r of RO.ramps||[])if(!r.dk&&QS_pts(r).some(([px,pz])=>Math.hypot(px-x,pz-z)<r.w/2+12))return true;return false}
// traffic count follows the hour (FL day cycle): live cars × QS_hourK/1.2; extra cars out of sight (> 200 m) are parked off-map for 20-40 s
function QS_hourK(){let h=12;try{h=FL_time()*24}catch(e){}const ath=CID!=='fra';if(h<5)return ath?.5:.35;if(h<7)return .7;if(h<9.5)return 1.2;if(h<14.5)return 1;if(h<15.5)return ath?1.2:1;if(h<16)return 1;if(h<19.5)return 1.2;return ath?(h<23?1:.5):.7}
let QS_ct=0;function QS_clear(dt){if(!HUB.cars||!HUB.nodes||(QS_ct+=dt)<.5)return;QS_ct=0;const N=HUB.nodes;
 if(TUNE.trHour){const C=HUB.cars,live=C.filter(c=>!(c.dead>0)).length,want=Math.round(C.length*QS_hourK()/1.2);let over=live-want;
  for(const c of C){if(over<=0)break;if(c.dead>0||c.pk||c.tr||c.route||c.crW||Math.hypot(c.x-RO.x,c.z-RO.z)<200)continue;c.dead=20+R()*20;over--}}
 for(const c of HUB.cars){if(TUNE.trOn&&!c.pk&&!c.tr&&N[c.a]&&N[c.b]){const ab=!!(N[c.a].ab&&N[c.b].ab);if(c.qsAb!==ab){c.qsAb=ab;c.v=QS_v0(c.k,ab)}}/* Autobahn 100-130 (trucks 80-90), city 50-60 km/h */
  if(c.pk||c.tr||c.dead>0||c.route||!QS_shut(c.a,c.b)||Math.hypot(c.x-RO.x,c.z-RO.z)<110)continue;const A=N[c.a];if(!A)continue;
  const nx=A.nb.filter(n=>n<N.ng&&n!==c.b&&!QS_shut(c.a,n));if(nx.length){c.b=nx[Math.floor(R()*nx.length)];c.t=0}}}
hubTrafficStep=(f=>function(dt){try{QS_clear(dt)}catch(e){}return f.apply(this,arguments)})(hubTrafficStep);
// ---- ramp validator (plan Q3): every ramp built without a fixed base height (street, biome, Taunus, long-jump, Autobahn, pop-up) goes through
// QS_rampFit before it is built: on a city street it snaps to the centreline with the street's heading, width ≤ road − 1 m (Athens streets are
// 7.5-8.5 m; ramps were 16 m and their edges sat in walls), the base must be level (entry vs lip ≤ 0.5 m), and the 30 m run-up, the ramp and
// the 40 m landing must be free of colliders, water and junction discs. If the spot fails it slides along the street (±160 m), then to the
// nearest street within 400 m (Höchst ramp in the river, Homburg ramp 290 m off-road). Fixed-height ramps (bridge deck, story, roadside pop-ups)
// and Autobahn shoulder ramps keep their spot. Log: __qs.ramps(). TUNE.rampFit 0 = as before.
TUNE.rampFit=1;const QS_RL=[];
function QS_rampOk(x,z,h,len,w){const s=Math.sin(h),c=Math.cos(h),why=[];const P=(a,b)=>[x+s*a+c*b,z+c*a-s*b];
 const ge=groundY(...P(-len/2,0)),gl=groundY(...P(len/2,0));if(Math.abs(ge-gl)>.5)why.push('slope '+(gl-ge).toFixed(1));
 for(let a=-len/2-30;a<=len/2+40;a+=3)for(const b of[-w/2+.6,0,w/2-.6]){const[px,pz]=P(a,b),g=groundY(px,pz);
  if(roamHit(px,pz,.9,g+.6)){why.push('collider@'+Math.round(a));a=1e9;break}if(typeof inRiver==='function'&&inRiver(px,pz,-1)){why.push('water@'+Math.round(a));a=1e9;break}}
 for(const J of JUNC||[])for(const a of[-len/2-30,-len/2-15,-len/2,0,len/2,len/2+20])if(Math.hypot(P(a,0)[0]-J.x,P(a,0)[1]-J.z)<J.r+2){why.push('junction@'+a);break}
 return why}
// every drivable road as 8 m samples {x,z,tx,tz}: city streets, lazy biome roads (outer towns), Taunus mountain roads
let QS_RD=null;function QS_roads(){if(QS_RD)return QS_RD;const R=[],add=(P,w,cls)=>{if(!P||P.length<2)return;const Q=[];for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],L=Math.hypot(b.x-a.x,b.z-a.z);if(L<.01)continue;
  const n=Math.max(1,Math.ceil(L/8));for(let k=0;k<n;k++)Q.push({x:a.x+(b.x-a.x)*k/n,z:a.z+(b.z-a.z)*k/n,tx:(b.x-a.x)/L,tz:(b.z-a.z)/L})}if(Q.length>8)R.push({pts:Q,w,cls})};
 for(const S of CITY_S)if(S.r.cls!=='ped')add(S.pts,S.r.w,S.r.cls);try{for(const S of LZ.roads||[])add(S.pts,S.w||(S.r&&S.r.w)||8,'lz')}catch(e){}try{for(const S of mtnSamples())add(S.pts,(S.r&&S.r.w)||9,'mtn')}catch(e){}
 return QS_RD=R}
function QS_rampFit(x,z,h,len,w){const o={x0:Math.round(x),z0:Math.round(z),w0:w};
 const ab=typeof abAt==='function'?abAt(x,z):null;if(ab&&ab.road&&ab.road.ab&&Math.abs(ab.lat)<ab.road.w/2+2){o.keep='autobahn';QS_RL.push(o);return null}
 let B=null;for(const r of QS_roads())for(let i=0;i<r.pts.length;i++){const p=r.pts[i],d=Math.hypot(p.x-x,p.z-z);if(!B||d<B.d)B={r,i,d}}
 if(!B||B.d>400){o.keep='no road within 400 m';QS_RL.push(o);return null}
 if(B.d>B.r.w/2+4){const why=QS_rampOk(x,z,h,len,w);if(!why.length){o.keep='off-road ok';QS_RL.push(o);return null}o.why0=why.slice(0,3).join(',')}
 const P=B.r.pts,W=Math.max(5,Math.min(w,B.r.w-1));let best=null;
 for(let k=0;k<=20&&!best;k++)for(const sg of k?[1,-1]:[1]){const j=B.i+sg*k*2;if(j<3||j>P.length-4)continue;const p=P[j],f=Math.sin(h)*p.tx+Math.cos(h)*p.tz>=0?1:-1,hh=Math.atan2(p.tx*f,p.tz*f);
  if(RO.ramps&&RO.ramps.some(r=>Math.hypot(r.x-p.x,r.z-p.z)<120))continue;if(!QS_rampOk(p.x,p.z,hh,len,W).length){best=[p.x,p.z,hh];break}}
 if(!best){const p=P[Math.min(P.length-1,Math.max(0,B.i))],f=Math.sin(h)*p.tx+Math.cos(h)*p.tz>=0?1:-1,hh=Math.atan2(p.tx*f,p.tz*f);o.why=QS_rampOk(p.x,p.z,hh,len,W).slice(0,3).join(',');best=[p.x,p.z,hh];o.bad=/collider|water|junction/.test(o.why)?1:0/* a slope alone is fine: the lip sits on the ground at the low end, the ramp just gets steeper or flatter */}
 Object.assign(o,{x:Math.round(best[0]),z:Math.round(best[1]),w:W,road:B.r.cls,moved:Math.round(Math.hypot(best[0]-x,best[1]-z))});QS_RL.push(o);return[best[0],best[1],best[2],W]}
addRamp=(f=>function(x,z,h,len,hgt,w,col,Y0){if(TUNE.rampFit&&Y0==null&&!QS_rampSkip(col)){try{const r=QS_rampFit(x,z,h,len,w);if(r)[x,z,h,w]=r}catch(e){console.warn('QS ramp',e)}}return f.call(this,x,z,h,len,hgt,w,col,Y0)})(addRamp);
function QS_rampSkip(col){return col===0xffd12c/* OTG roof ramp: leads onto its roof deck */}
window.__qs={ramps:()=>QS_RL,shut:()=>{const S=QS_shutSet();return S?S.size:0},fill:()=>{if(pl)pl.bm=100},veh:()=>CR_MODE,line:ab=>{const S=ab?abSamples().filter(S=>S.r.ab&&!S.r.c):CITY_S.filter(S=>S.r.cls!=='hill'&&S.r.cls!=='ped'&&!S.prof);S.sort((a,b)=>b.L-a.L);return S[0].pts.map(p=>[p.x,p.z])},kmh:()=>QS_kmh(carStat()),cls:QS_cls,mix:()=>{const n={};for(const c of HUB.cars){const k=HCAR[c.k];n[k]=(n[k]||0)+1}return n}};
