// ===== core-loop L1 core-zone (docs/PLAN_CORE_LOOP.md §6): ONE Frankfurt core, 1.57 x 1.52 km (Altstadt, Innenstadt, Bankenviertel, the Main quays).
// Flag CL.core (?cl=core or ?cl=all, tune.json cl.core), default OFF. CL_CORE is what the later loop lanes read (true = Frankfurt + flag).
// Under it: a PLAY that does not resume inside the box spawns at Paulsplatz heading east; density shifts to the core WITHOUT a wall:
//   props outside the box lose 60 % of their instances (first cut; the x1.5 add inside is L1b) (hidden like a smash that never respawns: draw calls unchanged), traffic and peds are moved to core roads
//   (20 cars on the roads within 140 m of the spawn, the rest ~70 % of the fleet inside the box). Nothing is deleted from the data; ?cl off = old world.
// GO why/core (state asserts).
const CL=(()=>{const m=/[?&]cl=([^&#]*)/.exec(location.search),ks=m?m[1].split(','):[],T=(typeof TUNE!=='undefined'&&TUNE.cl)||{};
 return{box:[-1100,470,-720,800],spawn:[-120,100],out:.6,car:.7,carNear:20,
  core:(ks.includes('core')||ks.includes('all')||!!T.core)&&!ks.includes('off'),smash:(ks.includes('smash')||ks.includes('all')||!!T.smash)&&!ks.includes('off'),sm:{small:14.9,big:29.9,bricks:20,studs:3,stop:.05},sn:0,pi:0,pn:0,thin:0,cars:0,peds:0,sp:0}})();
const CL_CORE=CL.core&&CID==='fra';
const CL_SMASH=CL.smash&&CID==='fra';
const CL_in=(x,z)=>x>=CL.box[0]&&x<=CL.box[1]&&z>=CL.box[2]&&z<=CL.box[3];
const CL_h=(x,z)=>{const h=Math.sin(x*12.9898+z*78.233)*43758.5453;return h-Math.floor(h)};
// fresh PLAY (no saved position) or a resume outside the box: Paulsplatz, on the nearest road, heading to the side that points most east
function CL_spawn(){if(!CL_CORE||!RO.on)return false;const s=CL.spawn,q=rfSnap(s[0],s[1],120);if(!q)return false;
 const a=q[2],b=a+Math.PI;const h=Math.sin(a)>=Math.sin(b)?a:b;
 RO.x=q[0];RO.z=q[1];RO.h=RO.vh=h;RO.v=0;RO.vy=0;RO.y=groundAt(RO.x,RO.z,99);RO.spawn0=[RO.x,RO.z,RO.h];camSnap=true;CL.sp=1;return true}
roamPost=(f=>function(atMark){const fresh=CL_CORE&&!atMark&&!(roamSave().pos),r=f.apply(this,arguments);if(CL_CORE&&!atMark&&(fresh||RO.spawn0&&!CL_in(RO.spawn0[0],RO.spawn0[1])))try{CL_spawn()}catch(e){}CL.cars=0;return r})(roamPost);
// props: outside the box a deterministic half of the instances is hidden for good (rt = never), in slices so no frame pays more than ~1500 props
function CL_thinStep(){if(!CL_CORE||state!=='roam'||!HUB.props)return;const P=HUB.props,n=P.length;if(!n)return;let i=CL.pi%n,k=0;
 const M=new THREE.Matrix4().makeScale(0,0,0),dirty=new Set();
 for(;k<1500;k++){if(CL.pi>=n){CL.pi=0;break}const p=P[CL.pi++];if(p._cl||!p.im||p.i==null)continue;p._cl=1;CL.pn++;
  if(!p.alive||CL_in(p.x,p.z)||CL_h(p.x,p.z)>=CL.out)continue;
  p.alive=false;p.rt=1e12;p.im.setMatrixAt(p.i,M);dirty.add(p.im);if(p.gi!=null&&p.gim){p.gim.setMatrixAt(p.gi,M);dirty.add(p.gim)}CL.thin++}
 for(const im of dirty)im.instanceMatrix.needsUpdate=true}
// traffic + peds: move them onto core roads once the fleet exists
function CL_nodes(x,z,r){const N=HUB.nodes,o=[];for(let i=0;i<N.ng;i++){const q=N[i];if(!q||!q.nb||!q.nb.length||q.ab)continue;if(r?Math.hypot(q.x-x,q.z-z)<r:CL_in(q.x,q.z))o.push(i)}return o}
function CL_move(c,i,N){c.a=i;c.b=N[i].nb[Math.floor(R()*N[i].nb.length)];c.t=R();if('hga'in c){c.hga=c.hgb=c.fsa=c.fsb=-1}}
function CL_fill(){if(!CL_CORE||state!=='roam'||!RO.on||!HUB.nodes)return;const N=HUB.nodes;
 if(!CL.cars&&HUB.cars&&HUB.cars.length>20&&HUB.cars[0].k!=null){const near=CL_nodes(RO.x,RO.z,140),core=CL_nodes(),pl=HUB.cars.filter(c=>!c.route&&!c.pk&&!c.tr&&!c.fake);let n=0;
  if(near.length&&core.length){for(const c of pl){CL_move(c,n<CL.carNear?near[Math.floor(R()*near.length)]:core[Math.floor(R()*core.length)],N);n++;if(n>=Math.round(pl.length*CL.car))break}}CL.cars=n||1}
 if(!CL.peds&&HUB.peds&&HUB.peds.length){const core=CL_nodes();if(core.length){for(const p of HUB.peds)if(p.a!=null&&N[p.a]&&!CL_in(N[p.a].x,N[p.a].z)){const i=core[Math.floor(R()*core.length)];p.a=i;p.b=N[i].nb[Math.floor(R()*N[i].nb.length)];p.t=R()}CL.peds=1}}}
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
  const dc=(renderer.info.render.calls|0);await W(400);const d2=renderer.info.render.calls|0;ck('draw calls steady '+dc+' -> '+d2,Math.abs(d2-dc)<=Math.max(6,dc*.2))
 }catch(e){R2.push('✗ threw '+e)}
 finally{RO.spawn0=sv.sp;RO.x=p0[0];RO.z=p0[1];RO.h=RO.vh=p0[2];RO.v=sv.v;RO.y=groundAt(RO.x,RO.z,99);camSnap=true}
 const ok=R2.every(r=>r[0]==='✓');return'📍 why/core · '+R2.join(' · ')+' → '+(ok?'✅ PASS':'❌ FAIL')}
// ---- L2 smash-everything (CL.smash, ?cl=smash): inside the core props smash at any real driving speed (small >= 15 km/h, big/stalls >= 30; traffic keeps SM2's 45 until the traffic brain lands).
// Each smash there tops the burst up to >= 20 bricks and >= 3 studs and adds a 50 ms hit-stop; the speed loss stays smashCheck's own (<= 8 %). Outside the core / flag off = SM2 untouched.
const CL_sm=()=>CL_SMASH&&state==='roam'&&RO.on&&CL_in(RO.x,RO.z);
SM2_smash=(f=>function(kind,imp,quiet){if(!CL_sm()||kind==='car')return f.apply(this,arguments);const a=TUNE.sm2Small,b=TUNE.sm2Big;TUNE.sm2Small=CL.sm.small;TUNE.sm2Big=CL.sm.big;try{return f.apply(this,arguments)}finally{TUNE.sm2Small=a;TUNE.sm2Big=b}})(SM2_smash);
function CL_burst(x,y,z,def,sp){const base=def&&def.st>5?18:9,at=V3(x,y+1.2,z),fw=V3(Math.sin(RO.vh),0,Math.cos(RO.vh)),cols=[new THREE.Color('#ffd12c'),new THREE.Color('#e4002b'),new THREE.Color('#0055bf'),new THREE.Color('#ffffff'),...(def&&def.cols?def.cols.map(c=>new THREE.Color(c)):[])];
 debris(at,fw.clone().multiplyScalar(sp*.5).add(V3(0,8,0)),Math.max(0,CL.sm.bricks-base)+2,cols,.6,y);for(let k=Math.max(0,CL.sm.studs-((def&&def.st)|0));k>0;k--)studBurst(at,fw,sp);
 HIT_stop(CL.sm.stop);CL.sn++;CL.lastB=Math.max(base,CL.sm.bricks);CL.lastS=Math.max((def&&def.st)|0,CL.sm.studs)}
SM2_prop=(f=>function(p,def,sp){const r=f.apply(this,arguments);if(!r&&CL_sm()&&!(RO.rcT>0&&sp<3))try{CL_burst(p.x,p.y,p.z,def,sp)}catch(e){}return r})(SM2_prop);
// ---- GO why/smash: a scripted 30 km/h hit on a bin and a big prop in the core smashes both with >= 20 bricks, studs and a hit-stop, loss <= 30 %; 20 km/h on a bin smashes, 10 km/h bumps
async function CL_smashGo(){const R2=[],ck=(m,b)=>R2.push((b?'✓ ':'✗ ')+m);
 if(CID!=='fra')return'📍 why/smash · Frankfurt only (Athens parked) → ✅ PASS';if(state!=='roam'||!RO.on||!pl)return'📍 Start free roam first';
 if(!CL_SMASH)return'📍 why/smash · ?cl=smash is OFF (default) → ✅ PASS (flag off)';
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
 __chk.GO['why/core']=[{c:'fra',n:'core zone Frankfurt',secs:40,fn:()=>CL_go()}];
 __chk.items.unshift({ver:'why',id:'smash',area:'drive',text:'core-loop L2 (PLAN_CORE_LOOP): ?cl=smash: inside the core props smash at 15 km/h (small) / 30 km/h (big), >= 20 bricks, >= 3 studs, 50 ms hit-stop, loss <= 30 %; 10 km/h bumps. Flag default OFF. 📍 GO.'});
 __chk.GO['why/smash']=[{c:'fra',n:'smash core Frankfurt',secs:30,fn:()=>CL_smashGo()}]},500)}
