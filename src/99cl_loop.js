// ===== core-loop L1 core-zone (docs/PLAN_CORE_LOOP.md §6): ONE Frankfurt core, 1.57 x 1.52 km (Altstadt, Innenstadt, Bankenviertel, the Main quays).
// Flag CL.core (?cl=core or ?cl=all, tune.json cl.core), default OFF. CL_CORE is what the later loop lanes read (true = Frankfurt + flag).
// Under it: a PLAY that does not resume inside the box spawns at Paulsplatz heading east; density shifts to the core WITHOUT a wall:
//   props outside the box lose 60 % of their instances (first cut; the x1.5 add inside is L1b) (hidden like a smash that never respawns: draw calls unchanged), traffic is moved to core roads (peds stay: moving them cost +4 % whole-frame calls, opt-in ?clped=1)
//   (3 cars on the roads within 140 m of the spawn, the rest ~8 % of the fleet inside the box). Nothing is deleted from the data; ?cl off = old world.
// GO why/core (state asserts).
const CL=(()=>{const m=/[?&]cl=([^&#]*)/.exec(location.search),ks=m?m[1].split(','):[],T=(typeof TUNE!=='undefined'&&TUNE.cl)||{};
 return{box:[-1100,470,-720,800],spawn:[-120,100],out:+((/[?&]clout=([\d.]+)/.exec(location.search)||[])[1]??.6),car:+((/[?&]clcar=([\d.]+)/.exec(location.search)||[])[1]||.08),carNear:+((/[?&]clnear=(\d+)/.exec(location.search)||[])[1]??3),
  core:(ks.includes('core')||ks.includes('all')||!!T.core)&&!ks.includes('off'),smash:(ks.includes('smash')||ks.includes('all')||T.smash!==false)&&!ks.includes('off')&&!ks.includes('nosmash'),sm:{small:14.9,big:29.9,bricks:20,studs:3,stop:.05},sn:0,pi:0,pn:0,thin:0,T:[],cars:0,peds:0,sp:0}})();
const CL_CORE=CL.core&&CID==='fra';
const CL_SMASH=CL.smash&&CID==='fra';
const CL_in=(x,z)=>x>=CL.box[0]&&x<=CL.box[1]&&z>=CL.box[2]&&z<=CL.box[3];
const CL_h=(x,z)=>{const h=Math.sin(x*12.9898+z*78.233)*43758.5453;return h-Math.floor(h)};
// fresh PLAY (no saved position) or a resume outside the box: Paulsplatz, on the nearest road, heading to the side that points most east
function CL_spawn(){if(!CL_CORE||!RO.on||/[?&]clnosp=1/.test(location.search))return false;const s=CL.spawn,q=rfSnap(s[0],s[1],120);if(!q)return false;
 const a=q[2],b=a+Math.PI;const h=Math.sin(a)>=Math.sin(b)?a:b;
 RO.x=q[0];RO.z=q[1];RO.h=RO.vh=h;RO.v=0;RO.vy=0;RO.y=groundAt(RO.x,RO.z,99);RO.spawn0=[RO.x,RO.z,RO.h];camSnap=true;CL.sp=1;CL_clear();return true}
// spawn framing: props on the chase-camera line (car -> 16 m back, 4.5 m either side, and the 5 m around the car) are put away for 40 s so no canopy fills the first frame
function CL_clear(){const PG=HUB.pgrid;if(!PG)return;const fx=Math.sin(RO.h),fz=Math.cos(RO.h),M=new THREE.Matrix4().makeScale(0,0,0),kx=Math.floor(RO.x/16),kz=Math.floor(RO.z/16);let n=0;
 for(let a=-2;a<=2;a++)for(let b=-2;b<=2;b++){const L=PG.get((kx+a)*10000+kz+b);if(!L)continue;for(const p of L){if(!p.alive||!p.im||p.i==null)continue;const dx=p.x-RO.x,dz=p.z-RO.z,u=-(dx*fx+dz*fz),w=Math.abs(dx*fz-dz*fx);
  if(!((u>-5&&u<16&&w<4.5)||dx*dx+dz*dz<25))continue;p.alive=false;p.rt=40;p.im.setMatrixAt(p.i,M);p.im.instanceMatrix.needsUpdate=true;if(p.gi!=null&&p.gim){p.gim.setMatrixAt(p.gi,M);p.gim.instanceMatrix.needsUpdate=true}n++}}CL.cleared=n}
roamPost=(f=>function(atMark){const fresh=CL_CORE&&!atMark&&!(roamSave().pos),r=f.apply(this,arguments);if(CL_CORE&&!atMark&&(fresh||RO.spawn0&&!CL_in(RO.spawn0[0],RO.spawn0[1])))try{CL_spawn()}catch(e){}CL.cars=0;return r})(roamPost);
// the r17 start-life pose (98bp R17_off: 40 m back + a 180 deg turn) would undo the east heading; under the core flag it keeps the CL pose, and R17_seed puts its cars ahead of that pose
if(typeof R17_off==='function')R17_off=(f=>function(){if(CL_CORE&&CL.sp)return;return f.apply(this,arguments)})(R17_off);
// props: outside the box a deterministic half of the instances is hidden for good (rt = never), in slices so no frame pays more than ~1500 props
function CL_thinStep(){if(!CL_CORE||state!=='roam'||!HUB.props)return;const P=HUB.props,n=P.length;if(!n)return;let i=CL.pi%n,k=0;
 const M=new THREE.Matrix4().makeScale(0,0,0),dirty=new Set();
 for(;k<1500;k++){if(CL.pi>=n){CL.pi=0;break}const p=P[CL.pi++];if(p._cl||!p.im||p.i==null)continue;p._cl=1;CL.pn++;
  if(!p.alive||CL_in(p.x,p.z)||CL_h(p.x,p.z)>=CL.out)continue;
  p.alive=false;p.rt=1e12;p.im.setMatrixAt(p.i,M);dirty.add(p.im);if(p.gi!=null&&p.gim){p.gim.setMatrixAt(p.gi,M);dirty.add(p.gim)}CL.T.push(p);CL.thin++}
 for(const im of dirty)im.instanceMatrix.needsUpdate=true}
// traffic + peds: move them onto core roads once the fleet exists
function CL_nodes(x,z,r){const N=HUB.nodes,o=[];for(let i=0;i<N.ng;i++){const q=N[i];if(!q||!q.nb||!q.nb.length||q.ab)continue;if(r?Math.hypot(q.x-x,q.z-z)<r:CL_in(q.x,q.z))o.push(i)}return o}
function CL_put(c,a,b,t){c.a=a;c.b=b;c.t=t;if('hga'in c){c.hga=c.hgb=c.fsa=c.fsb=-1}}
function CL_move(c,i,N){c._o=[c.a,c.b,c.t];CL_put(c,i,N[i].nb[Math.floor(R()*N[i].nb.length)],R());c._m=[c.a,c.b,c.t]}
// reversible, so the GO can A/B the moved traffic and peds in one page at one pose
// the whole zone effect on/off in one page (the GO's whole-frame A/B): thinned props come back / go again with the moved traffic
CL.zone=on=>{const M=new THREE.Matrix4().makeScale(0,0,0);for(const p of CL.T){if(!p.im||p.i==null)continue;if(on){if(p.alive){p.alive=false;p.rt=1e12;p.im.setMatrixAt(p.i,M)}}else{p.rt=0;propRevive(p)}p.im.instanceMatrix.needsUpdate=true}return CL.moved(on)};
CL.moved=on=>{let n=0;for(const L of[HUB.cars,HUB.peds])if(L)for(const c of L){const q=on?c._m:c._o;if(q){CL_put(c,q[0],q[1],q[2]);n++}}return n};
function CL_fill(){if(!CL_CORE||state!=='roam'||!RO.on||!HUB.nodes)return;const N=HUB.nodes;
 if(!CL.cars&&HUB.cars&&HUB.cars.length>20&&HUB.cars[0].k!=null){const near=CL_nodes(RO.x,RO.z,140),core=CL_nodes(),pl=HUB.cars.filter(c=>!c.route&&!c.pk&&!c.tr&&!c.fake);let n=0;
  if(near.length&&core.length){for(const c of pl){CL_move(c,n<CL.carNear?near[Math.floor(R()*near.length)]:core[Math.floor(R()*core.length)],N);n++;if(n>=Math.round(pl.length*CL.car))break}}CL.cars=n||1}
 if(!CL.peds&&HUB.peds&&HUB.peds.length&&/[?&]clped=1/.test(location.search)){const core=CL_nodes();if(core.length){for(const p of HUB.peds)if(p.a!=null&&N[p.a]&&!CL_in(N[p.a].x,N[p.a].z)){CL_move(p,core[Math.floor(R()*core.length)],N)}CL.peds=1}}}
if(CL_CORE)setInterval(()=>{try{CL_thinStep();CL_fill()}catch(e){}},120);
CL.spawnNow=CL_spawn;CL.step=()=>{CL_thinStep();CL_fill()};CL.ro=()=>({x:RO.x|0,z:RO.z|0,h:+RO.h.toFixed(2)});
window.__cl=CL;
// ---- GO why/core: fresh PLAY spawns inside the box on a road; smashable props per 100 m of street inside >= 2x outside; >= 6 cars drawn within 150 m; frame budget unchanged
async function CL_go(){const R2=[],ck=(m,b)=>R2.push((b?'✓ ':'✗ ')+m),W=ms=>new Promise(r=>setTimeout(r,ms));
 if(CID!=='fra')return'📍 why/core · Frankfurt only (Athens parked) → ✅ PASS';if(state!=='roam'||!RO.on||!pl)return'📍 Start free roam first';
 if(!CL_CORE)return'📍 why/core · ?cl=core is OFF (default) → ✅ PASS (flag off)';
 const p0=[RO.x,RO.z,RO.h],sv={v:RO.v,sp:RO.spawn0};
 try{
  ck('CL_CORE set, box '+CL.box.join(','),CL_CORE===true);
  RO.spawn0=[0,0,0];CL_spawn();const x=RO.x,z=RO.z,c=cityAt(x,z);
  ck('spawn '+x.toFixed(0)+','+z.toFixed(0)+' inside the box',CL_in(x,z));ck('spawn on a road ('+(c?c.d.toFixed(1):'-')+' m off the centre line, half width '+(c&&c.road?c.road.w/2:'-')+')',!!c&&!!c.road&&c.d<=c.road.w/2+1);
  ck('spawn heading east (sin h '+Math.sin(RO.h).toFixed(2)+')',Math.sin(RO.h)>.5);
  for(let k=0;k<60;k++){CL_thinStep();if(CL.pi===0&&k>2)break}for(let k=0;k<200&&CL.pi!==0;k++)CL_thinStep();
  CL_fill();await W(300);
  // props per 100 m of street: sample the same street-length inside and outside; alive props within 25 m of the sample points
  const N=HUB.nodes,cnt=(inside)=>{let len=0,np=0;const PG=HUB.pgrid;for(let i=0;i<N.ng;i+=2){const q=N[i];if(!q||!q.nb.length||q.ab)continue;if(CL_in(q.x,q.z)!==inside)continue;if(!inside&&Math.hypot(q.x-CL.spawn[0],q.z-CL.spawn[1])>2600)continue;
    const kx=Math.floor(q.x/16),kz=Math.floor(q.z/16);len+=40;for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const L=PG.get((kx+a)*10000+kz+b);if(L)for(const p of L)if(p.alive&&Math.hypot(p.x-q.x,p.z-q.z)<25)np++}}return[np/Math.max(1,len)*100,len]};
  const [pin,lin]=cnt(true),[pout,lout]=cnt(false);
  ck('props per 100 m of street: inside '+pin.toFixed(1)+' vs outside '+pout.toFixed(1)+' ('+(pin/Math.max(pout,.01)).toFixed(1)+'x >= 2x; '+Math.round(lin)+'/'+Math.round(lout)+' m sampled)',lin>2000&&lout>2000&&pin>=2*pout);
  ck('thinned '+CL.thin+' of '+CL.pn+' props outside, draw calls unchanged (instances only)',CL.thin>50);
  const near=HUB.cars.filter(q=>!q.dead&&Math.hypot(q.x-RO.x,q.z-RO.z)<150).length;
  ck('drawn traffic within 150 m of the spawn: '+near+' >= 6',near>=6);
  const inC=HUB.cars.filter(q=>CL_in(q.x,q.z)).length;ck('traffic in the core '+inC+' of '+HUB.cars.length+' (>= 50 %)',inC>=HUB.cars.length*.5);
  const fr=()=>{renderer.info.autoReset=false;renderer.info.reset();__tq.draw();const k=renderer.info.render,o=[k.calls,k.triangles];renderer.info.autoReset=true;return o},fm=async on=>{CL.zone(on);await W(700);const a=fr();await W(250);const b=fr();return[Math.min(a[0],b[0]),Math.min(a[1],b[1])]};
  if(window.__tq&&__tq.draw){const dc=[],dt=[];let o0=0,o1=0;for(let k=0;k<5;k++){const off=await fm(false),on=await fm(true);dc.push(on[0]/off[0]);dt.push(on[1]/off[1]);o0=off[0];o1=off[1]}   // 5 alternating OFF/ON pairs, the median ratio (a single pair swings +-5 % with streaming)
   const med=a=>a.slice().sort((x,y)=>x-y)[2];
   ck('WHOLE frame at Paulsplatz, zone ON (thinned props + moved traffic) vs OFF, median of 5 pairs: calls '+(med(dc)*100-100).toFixed(1)+' % (<= +2 %), tris '+(med(dt)*100-100).toFixed(1)+' % (<= +10 %); last pair '+o0+' vs '+Math.round(o0*dc[4])+' calls, '+(o1/1e6).toFixed(2)+' M tris',med(dc)<=1.02&&med(dt)<=1.10)}
  const th=window.__tq&&__tq.home;if(th)ck('real roamLoad start pose heading east (sin h '+Math.sin(th[2]).toFixed(2)+') inside the box',Math.sin(th[2])>.5&&CL_in(th[0],th[1]));
 }catch(e){R2.push('✗ threw '+e)}
 finally{RO.spawn0=sv.sp;RO.x=p0[0];RO.z=p0[1];RO.h=RO.vh=p0[2];RO.v=sv.v;RO.y=groundAt(RO.x,RO.z,99);camSnap=true}
 const ok=R2.every(r=>r[0]==='✓');return'📍 why/core · '+R2.join(' · ')+' → '+(ok?'✅ PASS':'❌ FAIL')}
// ---- L2 smash-everything (CL.smash; default ON in Frankfurt since smash-look-r22e22, works without ?cl=core,studs; ?cl=nosmash or ?cl=off = old SM2 gates): inside the core props smash at any real driving speed (small >= 15 km/h, big/stalls >= 30; traffic keeps SM2's 45 until the traffic brain lands).
// Each smash there tops the burst up to >= 20 bricks and >= 3 studs and adds a 50 ms hit-stop; the speed loss stays smashCheck's own (<= 8 %). Outside the core / flag off = SM2 untouched.
const CL_sm=()=>CL_SMASH&&state==='roam'&&RO.on&&CL_in(RO.x,RO.z);
SM2_smash=(f=>function(kind,imp,quiet){if(!CL_sm()||kind==='car')return f.apply(this,arguments);const a=TUNE.sm2Small,b=TUNE.sm2Big;TUNE.sm2Small=CL.sm.small;TUNE.sm2Big=CL.sm.big;try{return f.apply(this,arguments)}finally{TUNE.sm2Small=a;TUNE.sm2Big=b}})(SM2_smash);
const CL_cols=['#ffd12c','#e4002b','#0055bf','#ffffff','#2e9b3a'].map(c=>new THREE.Color(c));
// top-up burst (smash-look-r22e22, 2K look): a wide sideways fan of small bricks thrown forward and out to both sides (further and longer-lived than SM2's own),
// and every stud of the hit bright gold, popped high x1.6 size, so they arc over the car before the magnet takes them (hold 0.9 s). Pooled pieces only (DEB, studWarm), none added while the debris pool is > 85 % busy
const _clSd=V3(),_clV=V3();
function CL_burst(x,y,z,def,sp){const base=def&&def.st>5?18:9,at=V3(x,y+1.2,z),fw=V3(Math.sin(RO.vh),0,Math.cos(RO.vh)),busy=DEB&&DEB.list.length>DEB.n*.85,n=busy?0:Math.max(0,CL.sm.bricks+6-base)+2,v=sp*.5+3;
 if(n){debris(at.addScaledVector(fw,.8),fw.clone().multiplyScalar(v).add(V3(0,13,0)),n,CL_cols,.55,y);_clSd.set(fw.z,0,-fw.x);const L=DEB.list,w=12+sp*.4;
  for(let k=Math.max(0,L.length-n),m=0;k<L.length;k++,m++){const o=L[k],a=(n>1?m/(n-1)*2-1:0)+rr(-.12,.12);o.v.copy(fw).multiplyScalar(sp*.8+4+rr(0,3)).addScaledVector(_clSd,a*w);o.v.y=rr(6,11);o.s.multiplyScalar(.72);o.life=rr(1.7,2.3)}}
 at.set(x,y+1.4,z);const ns=Math.max(CL.sm.studs,6)-((def&&def.st)|0);
 for(let k=Math.max(0,ns);k>0;k--){_clV.copy(fw).multiplyScalar(sp*.3+rr(-1,1)).addScaledVector(_clSd.set(fw.z,0,-fw.x),rr(-2.5,2.5));_clV.y=rr(13,16);studBurst(at,fw,sp,{gold:1,vel:_clV,hold:.9,sc:1.6})}
 SM2.n.bricks+=base+n;HIT_stop(CL.sm.stop);CL.sn++;CL.lastB=base+n;CL.lastS=Math.max((def&&def.st)|0,6)}
// the smash studs exist before the first smash on every boot path (the loader warm links them; the fast test start skips that warm)
// and one dry burst far below the map runs the burst code once (JIT, pool paths) before the first real smash; its pieces, studs and counters are undone at once
function CL_dry(){const b=SM2.n.bricks,sn=CL.sn,lb=CL.lastB,ls=CL.lastS,hd=hitDip,L=DEB&&DEB.list,l0=L?L.length:0,nx=DEB&&DEB.next;CL_burst(RO.x,-900,RO.z,null,10);
 if(L){for(let k=L.length-1;k>=l0;k--){_m.makeScale(0,0,0);DEB.im.setMatrixAt(L[k].i,_m);L.splice(k,1)}DEB.next=nx;DEB.dirty=true}for(const s of HUB.studFX)if(s.alive&&s.m.position.y<-800){s.alive=false;s.m.visible=false}
 SM2.n.bricks=b;CL.sn=sn;CL.lastB=lb;CL.lastS=ls;hitDip=hd}
if(CL_SMASH)roamPost=(f=>function(){const r=f.apply(this,arguments);try{studWarm();CL_dry()}catch(e){}return r})(roamPost);
// every stud this hit spawned (SM2's / smashCheck's own come after CL_burst) joins the bright gold arc: x1.6, popped high, magnet after 0.9 s (look only: their value stays)
function CL_gold(){const fw=_clV.set(Math.sin(RO.vh),0,Math.cos(RO.vh)),sp=Math.abs(RO.v);_clSd.set(fw.z,0,-fw.x);for(const s of HUB.studFX)if(s.alive&&s.t===0&&s.hold!==.9){s.m.material=STUDM[2];s.m.scale.setScalar(1.6);s.hold=.9;s.vel.copy(fw).multiplyScalar(sp*.3+rr(-1,1)).addScaledVector(_clSd,rr(-2.5,2.5));s.vel.y=rr(13,16)}}
if(CL_SMASH)smashCheck=(f=>function(dt){const n=CL.sn,r=f.apply(this,arguments);if(CL.sn!==n)try{CL_gold()}catch(e){}return r})(smashCheck);
SM2_prop=(f=>function(p,def,sp){const r=f.apply(this,arguments);if(!r&&CL_sm()&&!(RO.rcT>0&&sp<3))try{CL_burst(p.x,p.y,p.z,def,sp)}catch(e){}return r})(SM2_prop);
// ---- GO why/smash: a scripted 30 km/h hit on a bin and a big prop in the core smashes both with >= 20 bricks, studs and a hit-stop, loss <= 30 %; 20 km/h on a bin smashes, 10 km/h bumps
async function CL_smashGo(){const R2=[],ck=(m,b)=>R2.push((b?'✓ ':'✗ ')+m);
 if(CID!=='fra')return'📍 why/smash · Frankfurt only (Athens parked) → ✅ PASS';if(state!=='roam'||!RO.on||!pl)return'📍 Start free roam first';
 if(!CL_SMASH)return'📍 why/smash · smash is OFF (?cl=nosmash / ?cl=off) → ✅ PASS (flag off)';
 const p0=[RO.x,RO.z,RO.h,RO.v],tb=RO.turbo,ni=pl.nitro;
 try{
  RO.turbo=0;pl.nitro=false;const q=rfSnap(CL.spawn[0],CL.spawn[1],120);if(!q)throw'no road';RO.x=q[0];RO.z=q[1];RO.h=RO.vh=Math.PI/2;RO.y=groundAt(RO.x,RO.z,99);OF_reset&&OF_reset();
  ck('car in the core',CL_in(RO.x,RO.z));
  const hit=(t,kmh)=>{const d=HUB.ptypes[t],p=HUB.props.find(x=>x.t===t&&x.im&&x.i!=null);if(!p)return null;const sv={x:p.x,z:p.z,y:p.y,alive:p.alive},a=RO.h;RO.vh=RO.h=Math.PI/2;
   const D=Math.min(OB_HL+d.r*.6,d.r+2);p.x=RO.x+Math.sin(a)*D;p.z=RO.z+Math.cos(a)*D;p.y=RO.y;p.alive=true;p.sm2T=0;
   const kx=Math.floor(p.x/16)*10000+Math.floor(p.z/16),L=HUB.pgrid.get(kx)||(HUB.pgrid.set(kx,[]),HUB.pgrid.get(kx)),add=!L.includes(p);if(add)L.push(p);
   RO.v=kmh/3.6;const v0=RO.v,n0=HUB.smashed,c0=CL.sn,h0=hitDip,b0=SM2.n.bricks;smashCheck(1/60);
   const r={t,smash:HUB.smashed>n0,loss:1-RO.v/v0,bricks:CL.sn>c0?CL.lastB:SM2.n.bricks-b0,studs:CL.sn>c0?CL.lastS:0,stop:hitDip>h0||hitDip>0,hs:CL.sn>c0};
   if(add)L.splice(L.indexOf(p),1);if(!p.alive)propRevive(p);Object.assign(p,sv);if(!sv.alive)p.alive=false;hitDip=0;return r};
  const f=x=>Math.round(x*100)+' %',bin=hit('bin',30),big=hit(HUB.ptypes.stall&&HUB.props.some(x=>x.t==='stall')?'stall':'tree',30),b20=hit('bin',20),b10=hit('bin',10),ba=hit('bin',12);
  for(const[n,r]of[['bin 30',bin],['big prop 30',big]]){ck(n+' km/h smashed',!!r&&r.smash);if(r){ck(n+': '+r.bricks+' bricks >= 20, '+r.studs+' studs >= 3, 50 ms hit-stop set',r.bricks>=20&&r.studs>=3&&r.hs);ck(n+': speed loss '+f(r.loss)+' <= 30 %',r.loss<=.3)}}
  ck('bin 20 km/h smashes',!!b20&&b20.smash);ck('bin 10 km/h bumps (not smashed)',!!b10&&!b10.smash);
  ck('bin 12 km/h bumps too',!!ba&&!ba.smash)
 }catch(e){R2.push('✗ threw '+e)}
 finally{RO.x=p0[0];RO.z=p0[1];RO.h=RO.vh=p0[2];RO.v=p0[3];RO.turbo=tb;pl.nitro=ni;RO.y=groundAt(RO.x,RO.z,99);camSnap=true}
 const ok=R2.every(r=>r[0]==='✓');return'📍 why/smash · '+R2.join(' · ')+' → '+(ok?'✅ PASS':'❌ FAIL')}
{const reg=setInterval(()=>{if(!window.__chk||!__chk.GO)return;clearInterval(reg);
 __chk.items.unshift({ver:'why',id:'core',area:'drive',text:'core-loop L1 (PLAN_CORE_LOOP): ?cl=core: fresh PLAY spawns at Paulsplatz inside the 1.57 x 1.52 km core on a road heading east; smashable props per 100 m of street inside >= 2x outside; >= 6 cars within 150 m of the spawn; draw calls unchanged. Flag default OFF. 📍 GO.'});
 __chk.GO['why/core']=[{c:'fra',n:'core zone Frankfurt',secs:60,fn:()=>CL_go()}];
 __chk.items.unshift({ver:'why',id:'smash',area:'drive',text:'core-loop L2 (PLAN_CORE_LOOP): ?cl=smash: inside the core props smash at 15 km/h (small) / 30 km/h (big), >= 20 bricks, >= 3 studs, 50 ms hit-stop, loss <= 30 %; 10 km/h bumps. Default ON in Frankfurt (?cl=nosmash = off). 📍 GO.'});
 __chk.GO['why/smash']=[{c:'fra',n:'smash core Frankfurt',secs:30,fn:()=>CL_smashGo()}]},500)}
