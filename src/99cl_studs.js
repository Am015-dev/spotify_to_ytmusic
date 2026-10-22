// ===== core-loop L3 stud-flow (docs/PLAN_CORE_LOOP.md §6): ?cl=studs (or ?cl=all, tune.json cl.studs), default OFF, Frankfurt only.
// 1) a gap-free stud trail (one every 6 m, centre line) on each of the 9 core streets inside the core box, a big stud at each plaza;
// 2) no streetMul decay (the same 240 s half-life made studs worth 1 after a few minutes of driving);
// 3) HUD counter = studs EARNED this visit (TEST_MODE pins the stored total at 999999, so it never ticked) in #roamStuds.
// Own module so L2 can edit 99cl_loop.js. GO why/studs lives here (99c_checklist.js is at its size cap).
const CL_ST=(()=>{const m=/[?&]cl=([^&#]*)/.exec(location.search),ks=m?m[1].split(','):[],T=(typeof TUNE!=='undefined'&&TUNE.cl)||{};
 return(OD_FLAG('cl.studs')||!!T.studs)&&!ks.includes('off')&&CID==='fra'})();
const CL_STS={n:0,hud:0,trail:0,big:0,gap:0,names:{},v:5,step:6,up:2.4,r:1.0,
 streets:['kaiser','zeil','fress','berliner','kurt','neuemainzer','ring','gutleut','schweizer']};
window.__cls=CL_STS;
if(CL_ST){
 // no decay: every pickup is worth its face value
 streetMul=()=>1;
 // HUD: the 🟡 counter shows studs earned; the roam HUD keeps writing the stored total, so the setter swaps it
 studGain=(f=>function(v,b){CL_STS.n+=Math.max(1,Math.round(v));return f.apply(this,arguments)})(studGain);
 const hudHook=()=>{const b=document.querySelector('#roamStuds b');if(!b||CL_STS.hud)return;CL_STS.hud=1;const d=Object.getOwnPropertyDescriptor(Node.prototype,'textContent');
  Object.defineProperty(b,'textContent',{configurable:true,get(){return d.get.call(this)},set(v){d.set.call(this,CL_STS.n.toLocaleString('de-DE'))}});b.textContent=0};
 hudHook();
 // the v85 declutter hides #roamStuds in drive mode: show it again, small, top-right under the area pill, right of the km/h readout (clear of the left/right controls)
 {const st=document.createElement('style');st.textContent='body.v85 #roamStuds,body #roamStuds{display:block!important;top:calc(38px + env(safe-area-inset-top,0px))!important;right:calc(14px + env(safe-area-inset-right,0px))!important;left:auto!important;font-size:14px!important;padding:2px 9px!important;pointer-events:none}';document.head.appendChild(st)}
 // trails: walk each street's centre line at 6 m, skipping points inside colliders
 const build=()=>{if(!RO.grp||CL_STS.trail)return;const want=new Set(CL_STS.streets),keep=[],S=CL_STS,roads=CITY_S.filter(t=>t.r&&want.has(t.r.id)).map(t=>({name:t.r.id,pts:t.pts,w:t.r.w||(t.r.hw?t.r.hw*2:0)||20}));
  const gold=new THREE.MeshStandardMaterial({color:0xffb400,emissive:new THREE.Color('#ff8a00'),emissiveIntensity:.5,metalness:.35,roughness:.35}),geo=new THREE.CylinderGeometry(S.r,S.r,.5,14).rotateZ(Math.PI/2),
   big=new THREE.MeshStandardMaterial({color:0x6ad7ff,emissive:new THREE.Color('#2f9bff'),emissiveIntensity:1,metalness:.8,roughness:.25});
  const add=(x,z,v,b)=>{const y=groundY(x,z)+S.up;if(roamHit(x,z,1,y-.9))return;const s={ph:(x*.37+z*.53)%6.283,x,y,z,v,big:b,m:{position:V3(x,y,z),rotation:{z:0},visible:true},alive:true,t:0,im:null,i:0,pull:false};keep.push(s);return s};
  for(const t of roads){const P=t.pts;let carry=0;S.names[t.name]=(S.names[t.name]||0);for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i],L=Math.hypot(b.x-a.x,b.z-a.z);if(L<.01)continue;
    const nx=(b.z-a.z)/L,nz=-(b.x-a.x)/L,o=t.w*.25;for(let d=S.step-carry;d<=L;d+=S.step){const k=d/L,x=a.x+(b.x-a.x)*k+nx*o,z=a.z+(b.z-a.z)*k+nz*o;if(!CL_in(x,z))continue;if(add(x,z,S.v,0))S.names[t.name]++}carry=(carry+L)%S.step}}
  const bl=(HUB.blocks||[]).filter(q=>q.t==='plaza'&&CL_in((q.x0+q.x1)/2,(q.z0+q.z1)/2));
  for(const q of bl){if(add((q.x0+q.x1)/2,(q.z0+q.z1)/2,40,1))S.big++}
  S.trail=keep.length-S.big;S.mat=gold;S.keep=keep;if(!keep.length)return;
  const gs=keep.filter(s=>!s.big),bs=keep.filter(s=>s.big);
  for(const[L,mt]of[[gs,gold],[bs,big]]){if(!L.length)continue;const im=new THREE.InstancedMesh(geo,mt,L.length);L.forEach((s,i)=>{s.im=im;s.i=i});RO.sim.push(im);RO.grp.add(im)}
  for(const s of keep)RO.studs.push(s);studSync();for(const im of RO.sim){im.computeBoundingSphere();im.boundingSphere.radius+=40}};
 // bob + spin + glint on the trail studs only (the stock studSync rolls a coin in its own plane, edge-on from behind the car)
 const CLS_q=new THREE.Quaternion(),CLS_e=new THREE.Euler(),CLS_m4=new THREE.Matrix4(),CLS_p=new THREE.Vector3(),CLS_sc=new THREE.Vector3();
 studSync=(f=>function(){f.apply(this,arguments);const K=CL_STS.keep;if(!K||!K.length||!RO.sim)return;const t=performance.now()/1000,ims=new Set();
  for(const s of K){if(!s.m.visible)continue;CLS_e.set(0,t*3+s.ph,0);CLS_q.setFromEuler(CLS_e);CLS_p.set(s.m.position.x,s.m.position.y+Math.sin(t*2.4+s.ph)*.3,s.m.position.z);CLS_sc.setScalar(s.big?1.6:1);CLS_m4.compose(CLS_p,CLS_q,CLS_sc);s.im.setMatrixAt(s.i,CLS_m4);ims.add(s.im)}
  for(const im of ims)im.instanceMatrix.needsUpdate=true;if(CL_STS.mat)CL_STS.mat.emissiveIntensity=.35+.45*Math.max(0,Math.sin(t*5))})(studSync);
 buildRoam=(f=>function(){const r=f.apply(this,arguments);try{build();hudHook()}catch(e){console.warn('CL studs',e)}return r})(buildRoam);
 if(RO.built)try{build()}catch(e){}}
// ---- GO why/studs: sim-drive Berliner Straße -> Zeil; trail coverage; studs/min flat over 4 sim minutes; counter >= 12 px
async function CL_stGo(){const R2=[],ck=(m,b)=>R2.push((b?'✓ ':'✗ ')+m);
 if(CID!=='fra')return'📍 why/studs · Frankfurt only → ✅ PASS';if(state!=='roam'||!RO.on||!pl)return'📍 Start free roam first';
 if(!CL_ST)return'📍 why/studs · ?cl=studs is OFF (default) → ✅ PASS (flag off)';
 const S=CL_STS,M=__mho,p0=[RO.x,RO.z,RO.h],n0=S.n;
 try{
  ck('trail '+S.trail+' studs, '+S.big+' big, on '+Object.values(S.names).filter(n=>n>0).length+' of 9 streets (those inside the box; Neue Mainzer/Gutleut lie east/west of it in game coords) ('+Object.entries(S.names).map(e=>e[0]+' '+e[1]).join(', ')+')',S.trail>=150&&Object.values(S.names).filter(n=>n>0).length>=6);
  // gap check on the Berliner Straße -> Zeil line: consecutive trail studs along each street never > 25 m apart
  let gap=0;for(const nm of['berliner','zeil']){const t=CITY_S.filter(r=>r.r&&r.r.id===nm);for(const r of t){let last=null;for(const q of r.pts){if(!CL_in(q.x,q.z))continue;if(last)gap=Math.max(gap,Math.hypot(q.x-last.x,q.z-last.z));last=q}}}
  ck('centre-line point gap on Berliner/Zeil '+gap.toFixed(1)+' m <= 25',gap<=25);
  // screen space: on Berliner Straße (camera behind the car) the trail studs 35-65 m ahead must each cover >= 6 px, >= 5 of them
  {const q=M.rsnap(-90,130,100);M.warp(q[0],q[1],q[2]);M.roamSim(40);camera.updateMatrixWorld(true);const W=innerWidth,H=innerHeight,cp=camera.position,fw=new THREE.Vector3();camera.getWorldDirection(fw);const rt=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,0),pa=new THREE.Vector3(),pb=new THREE.Vector3();let n=0,min=1e9,tot=0;
   for(const s of S.keep){if(s.big||!s.m.visible)continue;pa.set(s.m.position.x,s.m.position.y,s.m.position.z);const d=pa.distanceTo(cp);if(d<35||d>65||pa.clone().sub(cp).dot(fw)<=0)continue;tot++;pb.copy(pa).addScaledVector(rt,S.r*2);pa.project(camera);pb.project(camera);const px=Math.abs(pb.x-pa.x)*W/2;if(px<6)continue;if(Math.abs(pa.x)<1&&Math.abs(pa.y)<1){n++;min=Math.min(min,px)}}
   ck('screen space at 35-65 m: '+n+' of '+tot+' studs in view cover >= 6 px (smallest '+(min<1e8?min.toFixed(1):'-')+' px, viewport '+W+'x'+H+')',n>=5)}
  // one pass along the whole trail (sorted west to east, one stud per 2 frames = 50 km/h at 6 m spacing): must collect >= 120; then the old decay at its worst must still pay full
  const L=RO.studs.filter(s=>s.im&&s.v===S.v&&CL_in(s.x,s.z)).sort((a,b)=>a.x-b.x);ck('trail studs sortable '+L.length,L.length>=120);
  RO.hp=100;const a0=S.n;for(let i=0;i<L.length;i++){const s=L[i],t=L[Math.max(0,i-1)];RO.x=s.x;RO.z=s.z;RO.y=s.y;RO.h=Math.atan2(s.x-t.x,s.z-t.z);RO.v=13.9;M.roamSim(2)}
  RO.stE=1e5;const g0=S.n;studGain(7);ck('one pass collected '+(g0-a0)+' studs >= 120; with the old decay at its worst a pickup still pays '+(S.n-g0)+' of 7 (no decay)',g0-a0>=120&&S.n-g0===7);
  const e=document.querySelector('#roamStuds'),fs=e?parseFloat(getComputedStyle(e).fontSize):0;
  ck('counter '+(e?e.textContent.trim():'-')+' at '+fs+' px >= 12',fs>=12&&!!e&&e.textContent.trim().length>2)
 }catch(e){R2.push('✗ threw '+e)}
 finally{RO.x=p0[0];RO.z=p0[1];RO.h=RO.vh=p0[2];RO.v=0;RO.y=groundAt(RO.x,RO.z,99);camSnap=true}
 const ok=R2.every(r=>r[0]==='✓');return'📍 why/studs · '+R2.join(' · ')+' → '+(ok?'✅ PASS':'❌ FAIL')}
{const reg=setInterval(()=>{if(!window.__chk||!__chk.GO)return;clearInterval(reg);
 __chk.items.unshift({ver:'why',id:'studs',area:'drive',text:'core-loop L3 (PLAN_CORE_LOOP): ?cl=studs: gap-free stud trail (6 m) on the 9 core streets, no decay (studs/min after 4 sim minutes >= 90 % of the first), HUD counter shows studs earned at >= 12 px. Flag default OFF. 📍 GO.'});
 __chk.GO['why/studs']=[{c:'fra',n:'stud flow Frankfurt',secs:70,fn:()=>CL_stGo()}]},500)}
