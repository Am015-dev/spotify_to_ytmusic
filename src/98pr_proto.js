/* proto-1 (2026-10-24, ?proto=1, default OFF): a 2K-Drive-look prototype of ONE small stretch: the Westend Split (TK_C) start grid + the first ~380 m.
   Alex 24 Oct: "focus with the benchmark one small part to make it pretty as a prototype". Benchmark: docs/shots/library/any/race/ref2k_any_race_street_01.jpg.
   Adds, only while that race runs: red/white studded kerbs on both road edges, a low red/white brick barrier behind them (gaps at side streets), flag poles,
   tyre stacks, glowing yellow chevron boards on the outside of the bend, a start gantry with banner + 5 start lights (red during the countdown, green at GO),
   painted grid slots + a checkered start line, a staggered 2-wide grid (rivals in front, the player at the back, like 2K), glowing purple bubbles on the ? bricks.
   Everything is merged per material (one draw per colour); materials are MeshStandard (no map / map) and MeshBasic like the arches, items and pads, so no new
   shader program; they are cached and never disposed (OBJ_free disposes materials, so the props live in their own group, removed in sprintEnd). */
const PROTO={on:OD_FLAG('proto'),n:0,g:null,M:null,lights:null,hw:11};window.PROTO=PROTO;   // lazy chunk (src/LAZY): const is eval-local, tests read window.PROTO
function PR_mats(){if(PROTO.M)return PROTO.M;const A=tkArchMats(),S=c=>new THREE.MeshStandardMaterial({color:c,roughness:.35,metalness:0});
  const tx=(w,h,f)=>{const[c,g]=cv(w,h);f(g);const t=tex(c);KEEP_TEX.add(t);return t};
  const chev=tx(128,128,g=>{g.fillStyle='#ffcd03';g.fillRect(0,0,128,128);g.fillStyle='#1b1c22';for(const o of[0,52]){g.beginPath();g.moveTo(14+o,18);g.lineTo(44+o,18);g.lineTo(78+o,64);g.lineTo(44+o,110);g.lineTo(14+o,110);g.lineTo(48+o,64);g.closePath();g.fill()}g.strokeStyle='#1b1c22';g.lineWidth=8;g.strokeRect(4,4,120,120)});
  const chk=tx(256,32,g=>{for(let i=0;i<32;i++)for(let j=0;j<4;j++){g.fillStyle=(i+j)%2?'#111':'#fff';g.fillRect(i*8,j*8,8,8)}});
  const ban=tx(512,96,g=>{g.fillStyle='#0a5fbf';g.fillRect(0,0,512,96);for(let i=0;i<64;i++){g.fillStyle=i%2?'#111':'#fff';g.fillRect(i*8,0,8,8);g.fillStyle=i%2?'#fff':'#111';g.fillRect(i*8,88,8,8)}
    g.fillStyle='#ffcd03';g.font='italic 900 38px system-ui';g.textAlign='center';g.textBaseline='middle';g.strokeStyle='#1b1c22';g.lineWidth=8;g.strokeText('WESTEND GRAND PRIX',256,50);g.fillText('WESTEND GRAND PRIX',256,50)});
  return PROTO.M={red:A.red,wht:A.wht,yel:A.yel,blu:A.blu,grn:A.grn,blk:S(0x1d1e24),org:S(0xff7a1a),chev:new THREE.MeshBasicMaterial({map:chev,color:new THREE.Color(1.6,1.6,1.6)}),
    chk:new THREE.MeshStandardMaterial({map:chk,roughness:.4}),ban:new THREE.MeshStandardMaterial({map:ban,roughness:.4}),bub:neonMat('#b44cff',1.6,{transparent:true,opacity:.33,depthWrite:false}),
    ring:neonMat('#c070ff',2.4),lr:neonMat('#ff2a1c',2.6),lg:neonMat('#36ff6a',2.6),off:S(0x2a2b33),asp:new THREE.MeshStandardMaterial({color:0x3b3c44,roughness:.8,metalness:0})}}
// the start leg of the course at distance s (m); s<0 extrapolates back along the first heading. lateral +ln = (cos h, -sin h) (the driver's left)
function PR_at(P,L,s){const q=tkAt(P,clamp(s,0,L)/L);if(s>=0)return q;return{x:q.x+Math.sin(q.h)*s,z:q.z+Math.cos(q.h)*s,h:q.h}}
function PR_build(sp){const M=PR_mats(),Gm=tkGeoOf(sp.C),P=Gm.seg.start,L=tkLen(P),B=new Map(),m4=new THREE.Matrix4(),qn=new THREE.Quaternion(),e=new THREE.Euler(),one=new THREE.Vector3(1,1,1);
  const put=(mat,geo,x,y,z,h,rx=0)=>{e.set(rx,h,0,'YXZ');qn.setFromEuler(e);m4.compose(new THREE.Vector3(x,y,z),qn,one);geo.applyMatrix4(m4);(B.get(mat)||B.set(mat,[]).get(mat)).push(geo)};
  const c0=cityAt(PR_at(P,L,40).x,PR_at(P,L,40).z),hw=PROTO.hw=clamp(((c0&&c0.road&&c0.road.w)||22)/2,6,16),S1=Math.min(380,L-20);
  const pt=(s,ln)=>{const q=PR_at(P,L,s);const x=q.x+Math.cos(q.h)*ln,z=q.z-Math.sin(q.h)*ln;return{x,z,h:q.h,y:groundAt(x,z,99)}};
  // side street at (x,z): the nearest street is another one and we are inside its carriageway -> leave a gap
  const gap=(x,z)=>{const c=cityAt(x,z,-1,true);return c&&c0&&c.si!==c0.si&&c.road&&Math.abs(c.d)<(c.road.w||12)/2};
  let n=0;
  for(const sd of[-1,1]){
    for(let s=-28,k=0;s<S1;s+=2,k++){const a=pt(s,sd*(hw-.45));put(k%2?M.wht:M.red,new THREE.BoxGeometry(.9,.22,1.96),a.x,a.y+.11,a.z,a.h);n++;   // kerb + 2 studs
      for(const o of[-.5,.5])put(k%2?M.wht:M.red,new THREE.CylinderGeometry(.24,.24,.16,8),a.x+Math.sin(a.h)*o,a.y+.3,a.z+Math.cos(a.h)*o,a.h)}
    for(let s=-28,k=0;s<S1;s+=4,k++){const a=pt(s,sd*(hw+1.1));if(gap(a.x,a.z))continue;const mt=k%2?M.wht:M.red;put(mt,new THREE.BoxGeometry(.6,.62,3.9),a.x,a.y+.31,a.z,a.h);n++;   // brick barrier (proto-2: lower, with a round top rail and 2 studs)
      put(mt,new THREE.CylinderGeometry(.3,.3,3.9,12),a.x,a.y+.66,a.z,a.h,Math.PI/2);for(const o of[-1,1])put(mt,new THREE.CylinderGeometry(.2,.2,.16,10),a.x+Math.sin(a.h)*o,a.y+.98,a.z+Math.cos(a.h)*o,a.h)}
    const fc=[M.yel,M.blu,M.red,M.grn];for(let s=sd<0?6:16,k=0;s<S1;s+=20,k++){const a=pt(s,sd*(hw+2.6));if(gap(a.x,a.z))continue;put(M.wht,new THREE.CylinderGeometry(.14,.14,7.5,6),a.x,a.y+3.75,a.z,a.h);   // flag pole + banner
      put(fc[k%4],new THREE.BoxGeometry(.12,2.4,1.7),a.x+Math.sin(a.h)*.85,a.y+6.2,a.z+Math.cos(a.h)*.85,a.h);n+=2}
    for(let s=sd<0?30:50;s<S1;s+=45){const a=pt(s,sd*(hw+2.2));if(gap(a.x,a.z))continue;for(let j=0;j<3;j++)for(const o of[-.6,.6]){put(j%2?M.wht:M.blk,new THREE.CylinderGeometry(.55,.55,.42,12),a.x+Math.sin(a.h)*o,a.y+.21+j*.42,a.z+Math.cos(a.h)*o,a.h)}n++}}
  // chevrons on the outside of the bend, facing the driver (heading falls -> the road bends to lateral -, outside is +)
  for(let s=60;s<S1;s+=10){const h0=PR_at(P,L,s-15).h,h1=PR_at(P,L,s+15).h,dh=h1-h0;if(Math.abs(dh)<.035)continue;const sd=dh<0?1:-1,a=pt(s,sd*(hw+1.3));
    const pl=new THREE.PlaneGeometry(2.4,2.4);if(sd<0){const u=pl.attributes.uv;for(let i=0;i<u.count;i++)u.setX(i,1-u.getX(i))}put(M.chev,pl,a.x,a.y+2.6,a.z,a.h+Math.PI);put(M.blk,new THREE.BoxGeometry(.18,1.5,.18),a.x,a.y+.75,a.z,a.h);n++}
  // start line, grid slots, gantry
  const sL=38;for(let s=-24;s<S1;s+=6){const a=pt(s+3,0);put(M.asp,new THREE.BoxGeometry(hw*2-1.2,.05,6.1),a.x,a.y+.02,a.z,a.h);   // proto-2: dark 2K asphalt over the whole stretch (the city road read beige in the warm haze)
    {let m=a,b=36;for(const q of(typeof CV!=='undefined'&&CV.medP)||[]){const d=(q[0]-a.x)**2+(q[1]-a.z)**2;if(d<b){b=d;m={x:q[0],z:q[1],y:groundAt(q[0],q[1],99)}}}put(M.asp,new THREE.BoxGeometry(4.2,.3,6.6),m.x,m.y+.12,m.z,a.h)}   // and over the boulevard's green studded median plate (CV_streets, ~0.17 m high): this was the green strip under the car
    if(s>sL)for(const ln of[-hw/3,hw/3])if((s/6|0)%2===0){const d=pt(s+3,ln);put(M.wht,new THREE.BoxGeometry(.3,.05,3.2),d.x,d.y+.05,d.z,d.h)}}{const a=pt(sL,0);put(M.chk,new THREE.BoxGeometry(hw*2-1.2,.05,1.6),a.x,a.y+.05,a.z,a.h)}
  const nA=sp.ai.length,slots=[[4,4]];sp.ai.forEach((ai,i)=>{const r=nA-1-i;ai.s=11+7*r;ai.lane=r%2?4:-4;slots.push([ai.s,ai.lane])});
  for(const[s,ln]of slots){for(const o of[-1.7,1.7]){const a=pt(s,ln+o);put(M.wht,new THREE.BoxGeometry(.22,.05,4.6),a.x,a.y+.05,a.z,a.h)}const f=pt(s+2.5,ln);put(M.wht,new THREE.BoxGeometry(3.6,.05,.25),f.x,f.y+.05,f.z,f.h)}
  {const gs=sL+4;for(const sd of[-1,1]){const a=pt(gs,sd*(hw+1.6));put(M.blu,new THREE.CylinderGeometry(.62,.72,8.4,16),a.x,a.y+4.2,a.z,a.h);for(const y of[1.6,4.2,6.8])put(M.wht,new THREE.CylinderGeometry(.76,.76,.34,16),a.x,a.y+y,a.z,a.h);   // proto-2: one slim round blue post with white bands (was a 2.4 m striped box tower)
      put(M.yel,new THREE.CylinderGeometry(.5,.5,.28,14),a.x,a.y+8.54,a.z,a.h)}
    const c=pt(gs,0),bw=hw*2+5.6;put(M.blu,new THREE.BoxGeometry(bw,2.6,1.2),c.x,c.y+9.7,c.z,c.h);
    const pl=new THREE.PlaneGeometry(bw*.8,2.3);put(M.ban,pl,c.x-Math.sin(c.h)*.62,c.y+9.7,c.z-Math.cos(c.h)*.62,c.h+Math.PI);   // banner faces the grid
    const Lg=new THREE.Group();PROTO.lights=[];for(let i=0;i<5;i++){const o=(i-2)*1.6,x=c.x+Math.cos(c.h)*o-Math.sin(c.h)*.7,z=c.z-Math.sin(c.h)*o-Math.cos(c.h)*.7;put(M.blk,new THREE.BoxGeometry(1.2,1.4,.4),x,c.y+7.7,z,c.h);
      const l=new THREE.Mesh(new THREE.CylinderGeometry(.42,.42,.2,12),M.off);l.position.set(x-Math.sin(c.h)*.25,c.y+7.7,z-Math.cos(c.h)*.25);l.rotation.set(Math.PI/2,c.h,0,'YXZ');Lg.add(l);PROTO.lights.push(l);
      const hl=new THREE.Mesh(PR_q(),PR_glowMat('h'+i,0));hl.scale.setScalar(3.2);hl.position.set(x-Math.sin(c.h)*.4,c.y+7.7,z-Math.cos(c.h)*.4);hl.rotation.y=c.h+Math.PI;Lg.add(hl);l.userData.halo=hl}
    PROTO.lg=Lg}
  // ? bricks in the stretch: a purple glowing bubble + ring (2K item bubbles)
  for(const it of sp.items){const d=Math.hypot(it.x-P[0][0],it.z-P[0][1]);if(d>S1+10)continue;const y=it.g.position.y,a=PR_at(P,L,0);put(M.bub,new THREE.SphereGeometry(2.3,16,12),it.x,y,it.z,0);put(M.ring,new THREE.TorusGeometry(2.4,.16,8,28),it.x,y,it.z,it.g.rotation.y||a.h);n++}
  const G=new THREE.Group();G.name='proto1';for(const[mat,L2]of B){const g=mergeGeometries(L2.map(x=>x),false);for(const x of L2)x.dispose();const me=new THREE.Mesh(g,mat);me.matrixAutoUpdate=false;me.updateMatrix();G.add(me)}G.add(PROTO.lg);
  // the stretch is the show: traffic and parked cars on the race line go (race-only, at start)
  try{if(typeof SIMP_clearTraffic==='function')for(let _k=0,_c=HUB.cars||[],c;_k<_c.length&&(c=_c[_k],true);_k++){if(c.dead||c.route||c.x==null)continue;for(let s=-30;s<S1;s+=10){const q=PR_at(P,L,s);if(Math.hypot(c.x-q.x,c.z-q.z)<hw+4){SIMP_clearTraffic(c.x,c.z,1);break}}}}catch(err){}
  if(PROTO.g)PR_drop();RO.grp.add(G);PROTO.g=G;PROTO.n=n;PROTO.draws=G.children.length;try{PR_lookOn(sp,P,L)}catch(err){console.warn('proto2',err)}return G}
function PR_drop(){try{PR_lookOff()}catch(err){}const G=PROTO.g;if(!G)return;RO.grp.remove(G);G.traverse(m=>{if(m.geometry)m.geometry.dispose()});PROTO.g=null;PROTO.n=0}
function PR_lights(sp){if(!PROTO.lights)return;const cd=sp.cd||0;PROTO.lights.forEach((l,i)=>{l.material=cd<=0?PROTO.M.lg:(3-cd)>=i*.55?PROTO.M.lr:PROTO.M.off;const h=l.userData.halo;if(h){const m=h.material,on=l.material!==PROTO.M.off;m.opacity=on?.85:0;m.color.setRGB(...(cd<=0?[.25,1.6,.45]:[1.8,.22,.12]))}})}
/* proto-2 (2026-10-24, same flag): the 2K light and finish, only while the proto race runs. Learned from three.js examples (MIT): webgl_shaders_sky (warm low sun
   with a bright horizon band), webgl_materials_physical_clearcoat (low roughness + strong env on paint), webgl_postprocessing_unreal_bloom (only the hot emissives glow).
   Phone budget: no new shader program. Every glow (tail lights, start-light halos, speed lines, boost trail) is the rig's own under-glow material type
   (MeshBasic + GLOW map, additive, toneMapped:false), lights/sky/fog are uniforms, gloss is roughness/envMapIntensity only (no clearcoat toggles, which would relink).
   The look is written right before each composer.render, after every mood / day-cycle / GFX writer, and restored when the race ends. */
const PR_q=()=>new THREE.PlaneGeometry(1,1);
function PR_glowMat(k,op,c){const C=PROTO.GM||(PROTO.GM=new Map());let m=C.get(k);if(!m){m=new THREE.MeshBasicMaterial({map:GLOW,color:new THREE.Color(...(c||[1,1,1])),transparent:true,opacity:op,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false});C.set(k,m)}return m}
const PR_LOOK={sun:'#ffc48a',sunI:3.5,el:22,hemi:['#cfdcff','#b4885e',1.05],fog:'#f0c9a2',fogD:.0015,top:[.05,.2,.7],mid:[.34,.54,.96],hor:[1.3,.88,.58],sky:[2.8,1.6,.7],exp:1.06,env:.5,
  rough:.16,envK:1.8,
  /* proto-3 */ shCast:0,shSz:1024,shExt:24,shK:.58,shTint:[.035,.05,.13],ao:.55,bTh:1.7,bS:.9,bR:.4,pEnv:1.35,pRough:.2,bEnv:1.1}
// a car's rear in its own frame: local bbox + the local forward axis (world forward f through the inverse world matrix)
function PR_rear(g,f){g.updateMatrixWorld(true);const inv=g.matrixWorld.clone().invert(),B=new THREE.Box3(),b=new THREE.Box3(),m=new THREE.Matrix4();
  const vis=o=>{for(let a=o;a&&a!==g.parent;a=a.parent)if(!a.visible)return false;return true};
  g.traverse(o=>{if(!o.isMesh||!o.geometry||!vis(o))return;const mt=[].concat(o.material)[0];if(!mt||mt.transparent||mt.isMeshBasicMaterial)return;/* lit body parts only (no shadow blobs, glows or ribbons) */if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();b.copy(o.geometry.boundingBox).applyMatrix4(m.multiplyMatrices(inv,o.matrixWorld));B.union(b)});
  if(B.isEmpty())return null;const lf=f.clone().transformDirection(inv);lf.y=0;lf.normalize();const c=B.getCenter(new THREE.Vector3()),sz=B.getSize(new THREE.Vector3());
  const ext=Math.abs(lf.x)*sz.x/2+Math.abs(lf.z)*sz.z/2,wid=Math.abs(lf.z)*sz.x+Math.abs(lf.x)*sz.z,ws=g.getWorldScale(new THREE.Vector3()).x||1;
  const pv=new THREE.Group();pv.position.set(c.x-lf.x*ext,B.min.y,c.z-lf.z*ext);pv.rotation.y=Math.atan2(-lf.x,-lf.z);g.add(pv);return{pv,w:wid,h:sz.y,ws,dbg:[sz.x,sz.y,sz.z,lf.x,lf.z,ws].map(v=>+v.toFixed(2))}}
function PR_gloss(X,m,r,k){if(!m||X.mats.has(m)||!(m.isMeshStandardMaterial)||m.transparent)return;X.mats.set(m,[m.roughness,m.envMapIntensity]);m.roughness=Math.min(m.roughness,r);m.envMapIntensity=(m.envMapIntensity||1)*k}
function PR_attach(X){const K=PR_LOOK,sp=X.sp,P=X.P,L=X.L;
  // the stray green stud strip under the cars was the old race rig's additive under-glow plane (20_race_world shipMesh): hidden in the proto race
  scene.traverse(o=>{const u=o.userData&&o.userData.under;if(u&&u.material&&u.material.visible){u.material.visible=false;X.unders.push(u.material)}});
  const gloss=PR_gloss.bind(null,X);
  const cars=[];if(typeof pl!=='undefined'&&pl&&pl.mesh){const w=pl.mesh.getWorldPosition(new THREE.Vector3()).sub(camera.position);w.y=0;cars.push([pl.mesh,new THREE.Vector3(Math.sin(RO.h),0,Math.cos(RO.h)),1])};for(const a of sp.ai)if(a.g){const q=PR_at(P,L,a.s||0);cars.push([a.g,new THREE.Vector3(Math.sin(q.h),0,Math.cos(q.h)),0])}
  for(const[g,f,me]of cars){g.traverse(o=>{if(o.isMesh)for(const m of[].concat(o.material))if(m&&m.roughness<.6)gloss(m,K.rough,K.envK)});/* proto-3: the player too (PR_rear now skips the rig's hidden boat/plane parts, which put its frame ~3 m behind the car) */const r=PR_rear(g,f);if(!r)continue;(X.dbg||(X.dbg=[])).push(r.dbg);const s=1/r.ws;
    // tail lights: a hot core + a soft halo per side (the cheap bloom), facing back at the chase camera
    for(const sd of[-1,1]){const c=new THREE.Mesh(PR_q(),PR_glowMat('tl',1,[2.2,.18,.1]));c.scale.setScalar(.55*s);c.position.set(sd*r.w*.32,r.h*.5,.06*s);const hl=new THREE.Mesh(PR_q(),PR_glowMat('th',.45,[1.6,.25,.12]));hl.scale.setScalar(1.5*s);hl.position.set(sd*r.w*.32,r.h*.5,.08*s);r.pv.add(c,hl)}
    if(me){const tr=[];for(const sd of[-1,1]){const q=new THREE.Mesh(PR_q(),PR_glowMat('tr',0,[.35,1.2,2.4]));q.rotation.x=-Math.PI/2;q.position.set(sd*r.w*.22,.25*s,0);q.scale.set(.55*s,1,1);r.pv.add(q);tr.push(q)}X.trail={tr,s}}
    X.add.push(r.pv)}
  // shadow casters: one proxy box per car (shadow layer only, never drawn in the view): a LEGO car is a box seen from the sun, 5 draws instead of hundreds
  const pm=PR3_px();for(const[g,f]of cars){const r=PR_rear(g,f);if(!r)continue;const pv=r.pv,s=1/r.ws;
    const b=new THREE.Mesh(PROTO.box||(PROTO.box=new THREE.BoxGeometry(1,1,1)),pm);b.layers.set(PR_LAY);b.scale.set(r.w*.9,r.h*.8,4.2*s);b.position.set(0,r.h*.5,-2.1*s);b.frustumCulled=false;pv.add(b);X.add.push(pv)}
  X.cars=cars.map(c=>c[0]);PR_paint(X,cars)}
function PR3_px(){return PROTO.pxm||(PROTO.pxm=new THREE.MeshBasicMaterial({colorWrite:false}))}
function PR_lookOn(sp,P,L){PR_lookOff();const X=PROTO.p2={cars:[],mats:new Map(),unders:[],add:[],t:0},K=PR_LOOK,e=K.el*Math.PI/180;
  X.sd=new THREE.Vector3(.6*Math.cos(e),Math.sin(e)*1.25,-.8*Math.cos(e)).normalize();   // the sky shader's sun azimuth (10_core4 SKY_FS), raised to a low golden-hour sun
  X.o={mc:moonL.color.clone(),mi:moonL.intensity,mp:moonL.position.clone(),hc:hemi.color.clone(),hg:hemi.groundColor.clone(),hi:hemi.intensity,fc:scene.fog.color.clone(),fd:scene.fog.density,
    sky:['uTop','uMid','uHor','uSun'].map(k=>SKYU[k].value.clone()),exp:renderer.toneMappingExposure,tm:renderer.toneMapping,env:scene.environmentIntensity};
  X.sp=sp;X.P=P;X.L=L;X.f=0;
  const M=PROTO.M;for(const k of['red','wht','yel','blu','grn','blk','org','chk','ban'])PR_gloss(X,M[k],.2,1.5);
  // speed lines: thin GLOW streaks in camera space round the screen edge, each in the plane of the view axis and its tangent so it reads as a radial streak
  const SL=new THREE.Group();SL.matrixAutoUpdate=false;X.lines=[];for(let i=0;i<18;i++){const a=i/18*Math.PI*2+Math.sin(i*7.3)*.15,rr=.72+.28*Math.abs(Math.sin(i*3.1)),u=new THREE.Vector3(Math.cos(a),Math.sin(a),0),t=new THREE.Vector3(Math.sin(a),-Math.cos(a),0);
    const q=new THREE.Mesh(PR_q(),PR_glowMat('sl',0,[1.3,1.3,1.4]));q.matrixAutoUpdate=false;q.frustumCulled=false;q.userData={u:u.multiply(new THREE.Vector3(5.6*rr,2.6*rr,1)),t,z:2+((i*5.7)%12),m:new THREE.Matrix4().makeBasis(t,new THREE.Vector3(0,0,1),t.clone().cross(new THREE.Vector3(0,0,1)))};SL.add(q);X.lines.push(q)}
  scene.add(SL);X.SL=SL;try{PR3_on(X)}catch(err){PROTO.err3=String(err);console.warn('proto3',err)}}
function PR_lookOff(){const X=PROTO.p2;if(!X)return;PROTO.p2=null;try{PR3_off(X)}catch(err){}const o=X.o;for(const m of X.unders)m.visible=true;for(const[m,v]of X.mats){m.roughness=v[0];m.envMapIntensity=v[1]}
  for(const pv of X.add){if(pv.parent)pv.parent.remove(pv);pv.traverse(q=>{if(q.geometry)q.geometry.dispose()})}if(X.SL){scene.remove(X.SL);X.SL.traverse(q=>{if(q.geometry)q.geometry.dispose()})}
  moonL.color.copy(o.mc);moonL.intensity=o.mi;moonL.position.copy(o.mp);hemi.color.copy(o.hc);hemi.groundColor.copy(o.hg);hemi.intensity=o.hi;scene.fog.color.copy(o.fc);scene.fog.density=o.fd;
  ['uTop','uMid','uHor','uSun'].forEach((k,i)=>SKYU[k].value.copy(o.sky[i]));renderer.toneMappingExposure=o.exp;renderer.toneMapping=o.tm;scene.environmentIntensity=o.env;try{FX.uniforms.uSpeed.value=0;FX.uniforms.uBoost.value=0}catch(e){}}
// every frame, right before the composer renders
function PR_look(dt){const X=PROTO.p2;if(!X||!PROTO.g)return;const K=PR_LOOK;if(++X.f===3)PR_attach(X);
  moonL.color.set(K.sun);moonL.intensity=K.sunI;moonL.position.copy(moonL.target.position).addScaledVector(X.sd,400);hemi.color.set(K.hemi[0]);hemi.groundColor.set(K.hemi[1]);hemi.intensity=K.hemi[2];
  scene.fog.color.set(K.fog);scene.fog.density=K.fogD;SKYU.uTop.value.set(...K.top);SKYU.uMid.value.set(...K.mid);SKYU.uHor.value.set(...K.hor);SKYU.uSun.value.set(...K.sky);
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=K.exp;scene.environmentIntensity=K.env;
  const v=Math.abs(RO.v||0),top=Math.max(30,RO.top||60),bst=(typeof pl!=='undefined'&&pl&&pl.nitro)?1:0,k=clamp((v/top-.45)/.4,0,1);X.t+=dt;
  try{FX.uniforms.uSpeed.value=Math.max(FX.uniforms.uSpeed.value,k*.85);FX.uniforms.uBoost.value=Math.max(FX.uniforms.uBoost.value,bst)}catch(e){}   // the existing radial speed blur + vignette (motion feel), compiled at boot
  const lm=PROTO.GM.get('sl');lm.opacity=(k*.55+bst*.35)*(X.lines.length?1:0);X.SL.visible=lm.opacity>.01;if(X.SL.visible){camera.updateMatrixWorld();X.SL.matrix.copy(camera.matrixWorld);X.SL.matrixWorldNeedsUpdate=true;
    const sp=8+v*.9,len=1.2+k*3.2,m=new THREE.Matrix4(),sc=new THREE.Matrix4();for(const q of X.lines){const u=q.userData;u.z-=sp*dt;if(u.z<1.5)u.z+=12;sc.makeScale(.05,len,1);m.copy(u.m).multiply(sc);m.setPosition(u.u.x,u.u.y,-u.z);q.matrix.copy(m)}}
  try{PR3_frame(X)}catch(err){PROTO.err3=String(err)}
  if(X.trail){const tm=PROTO.GM.get('tr');tm.opacity=clamp(k*.35+bst*.9,0,1);const L2=(1.2+k*2.5+bst*3.5)*X.trail.s;for(const q of X.trail.tr){q.scale.y=L2;q.position.z=L2/2+.1*X.trail.s}}}
if(PROTO.on&&typeof tkStart==='function'){const _st=tkStart,_step=tkStep,_end=sprintEnd;
  tkStart=function(m,C0){const sp=_st.apply(this,arguments);try{if(sp&&sp.C===TK_C)PR_build(sp);else PR_drop()}catch(err){console.warn('proto1',err)}return sp};
  tkStep=function(dt){const r=_step.apply(this,arguments);try{const sp=RO.sp;if(PROTO.g&&sp)PR_lights(sp)}catch(err){}return r};
  sprintEnd=function(){PR_drop();return _end.apply(this,arguments)};
  {const _cr=composer.render;let t0=performance.now();composer.render=function(){const t=performance.now(),dt=Math.min(.1,(t-t0)/1000);t0=t;try{if(PROTO.p2)PR_look(dt)}catch(err){}return _cr.apply(this,arguments)}}}

/* proto-3 (2026-10-24, same flag): the three gaps round 2 left (docs/HANDOFF_look2k-r3.md). All of it lives only while the proto race runs.
   1. (shCast, WIP, OFF: the depth compare still marks open road as shadowed at the grid; the contact darkening below ships) Sun shadows on the phone too, WITHOUT the renderer's shadow system (switching renderer.shadowMap on relinks every lit program in the city):
      a 1024 depth-only map of the casters (cars + proto props, camera layer PR_LAY) from an ortho sun camera that follows the player (±24 m, texel-snapped
      so edges do not crawl), and a shadow-catcher overlay on the proto asphalt (one ShaderMaterial, 9-tap PCF, warm-blue shade) that also draws the
      contact darkening under every car (rounded box). Idea from three.js examples (MIT): webgl_shadowmap_viewer / ShadowMaterial / the CSM follow camera.
   2. Bloom on the phone tier: the boot UnrealBloomPass (three.js addon, MIT; half-res bright pass + 5 mip blurs) switched on with a high threshold
      (HDR luminance 1.15), so only emissives, glow sprites, the sun and specular hot spots bloom.
   3. Glossy paint: a PMREM env baked from a tiny sky scene (deep blue zenith, a hot warm horizon band, dark ground, sun disc; as in three.js
      webgl_materials_physical_clearcoat / webgl_pmrem_test, MIT) on car paint and prop bricks; Fresnel gives the rim, the horizon band the reflection line.
   Programs: the depth pass (MeshBasic override), the catcher, the env sphere and the bloom passes link once in PR_build (race load), none later. */
const PR_LAY=7;PROTO.K=PR_LOOK;   // knobs for the tools (lazy chunk: PR_LOOK is eval-local)
function PR3_env(){if(PROTO.env)return PROTO.env;const S=new THREE.Scene(),N=48,g=new THREE.SphereGeometry(50,N,24),p=g.attributes.position,c=[],C=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
  for(let i=0;i<p.count;i++){const e=Math.asin(clamp(p.getY(i)/50,-1,1))*57.3;let k;
    if(e<-3)k=[.05,.045,.045];else if(e<1)k=C([.05,.045,.045],[2.6,2.1,1.6],(e+3)/4);else if(e<7)k=C([2.6,2.1,1.6],[.7,.95,1.6],(e-1)/6);else if(e<35)k=C([.7,.95,1.6],[.2,.42,1.2],(e-7)/28);else k=C([.2,.42,1.2],[.06,.18,.75],Math.min(1,(e-35)/40));c.push(...k)}
  g.setAttribute('color',new THREE.Float32BufferAttribute(c,3));S.add(new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide,toneMapped:false,fog:false})));
  const sd=PROTO.p2?PROTO.p2.sd:new THREE.Vector3(.6,.5,-.6).normalize(),sun=new THREE.Mesh(new THREE.SphereGeometry(2.2,12,8),new THREE.MeshBasicMaterial({color:new THREE.Color(40,30,18),toneMapped:false,fog:false}));sun.position.copy(sd).multiplyScalar(40);S.add(sun);
  const pm=new THREE.PMREMGenerator(renderer);PROTO.env=pm.fromScene(S,0).texture;pm.dispose();S.traverse(o=>{if(o.geometry){o.geometry.dispose();o.material.dispose()}});return PROTO.env}
function PR3_paint(X,m,ei,r){if(!m||!m.isMeshStandardMaterial||m.transparent||X.pm.has(m))return;X.pm.set(m,[m.envMap,m.envMapIntensity,m.roughness,m.clearcoatRoughness]);
  m.envMap=PROTO.env;m.envMapIntensity=ei;m.roughness=Math.min(m.roughness,r);if(m.isMeshPhysicalMaterial&&m.clearcoat>0){m.clearcoat=1;m.clearcoatRoughness=.03}}   // clearcoat only where it is already on: 0 -> >0 would relink
function PR_paint(X,cars){const K=PR_LOOK;for(const[g]of cars)g.traverse(o=>{if(o.isMesh)for(const m of[].concat(o.material))if(m&&m.metalness<.5&&m.roughness<.6)PR3_paint(X,m,K.pEnv,K.pRough)})}
function PR3_on(X){const K=PR_LOOK,M=PROTO.M,E=PR3_env();X.pm=new Map();for(const k of['red','wht','yel','blu','grn','blk','org','chk','ban'])PR3_paint(X,M[k],K.bEnv,.22);
  // the shadow map: depth only (colour writes off), its own target; MeshBasic override = a program the city already has
  const sz=K.shSz,rt=new THREE.WebGLRenderTarget(sz,sz,{depthBuffer:true});rt.depthTexture=new THREE.DepthTexture(sz,sz);rt.depthTexture.type=THREE.UnsignedIntType;
  const e=K.shExt,cam=new THREE.OrthographicCamera(-e,e,e,-e,1,320);cam.layers.set(PR_LAY);cam.position.copy(X.sd).multiplyScalar(150);cam.lookAt(0,0,0);cam.updateMatrixWorld();
  const U={uDep:{value:rt.depthTexture},uShM:{value:new THREE.Matrix4()},uTex:{value:new THREE.Vector2(1/sz,1/sz)},uTint:{value:new THREE.Color(...K.shTint)},uK:{value:K.shK},uAo:{value:K.ao},
    uCar:{value:Array.from({length:6},()=>new THREE.Vector4(0,0,0,0))}};
  const mat=new THREE.ShaderMaterial({uniforms:U,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4,toneMapped:false,
    vertexShader:'uniform mat4 uShM;varying vec4 vSh;varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;vSh=uShM*w;gl_Position=projectionMatrix*viewMatrix*w;}',
    fragmentShader:`uniform sampler2D uDep;uniform vec2 uTex;uniform vec3 uTint;uniform float uK,uAo;uniform vec4 uCar[6];varying vec4 vSh;varying vec3 vW;
float tp(vec2 u,float z){return step(texture2D(uDep,u).r,z);}
void main(){vec3 p=vSh.xyz/vSh.w;float s=0.;if(p.x>0.&&p.x<1.&&p.y>0.&&p.y<1.&&p.z<1.){float z=p.z-.0004;vec2 o=uTex*1.4;
 s=(2.*tp(p.xy,z)+tp(p.xy+o,z)+tp(p.xy-o,z)+tp(p.xy+vec2(o.x,-o.y),z)+tp(p.xy+vec2(-o.x,o.y),z)+tp(p.xy+vec2(2.*o.x,0.),z)+tp(p.xy-vec2(2.*o.x,0.),z)+tp(p.xy+vec2(0.,2.*o.y),z)+tp(p.xy-vec2(0.,2.*o.y),z))/10.;
 vec2 e=min(p.xy,1.-p.xy);s*=smoothstep(0.,.1,min(e.x,e.y));}
 float a=0.;for(int i=0;i<6;i++){vec4 c=uCar[i];if(c.w>0.){vec2 d=vW.xz-c.xy;vec2 l=vec2(d.x*cos(c.z)-d.y*sin(c.z),d.x*sin(c.z)+d.y*cos(c.z));vec2 q=abs(l)-vec2(c.w*.42,c.w);
  float dd=length(max(q,0.))+min(max(q.x,q.y),0.);a=max(a,1.-smoothstep(-.7,.9,dd));}}
 gl_FragColor=vec4(uTint,max(s*uK,a*uAo));}`});
  const rc=[];PROTO.g.traverse(o=>{if(!o.isMesh)return;const m=o.material;if(m===M.asp||m===M.chk)rc.push(new THREE.Mesh(o.geometry,mat));else if(m&&!m.transparent&&!m.isMeshBasicMaterial)o.layers.enable(PR_LAY)});
  for(const o of rc){o.matrixAutoUpdate=false;o.renderOrder=2;o.frustumCulled=false;PROTO.g.add(o)}
  X.sh={rt,cam,mat,U,ov:new THREE.MeshBasicMaterial({colorWrite:false}),rc,f:0};
  try{renderer.compile(PROTO.g,camera,scene)}catch(err){}if(K.shCast)PR3_shadow(X);   // link now (race load), not on the first race frame
  // bloom: the boot pass, threshold above every lit surface (the GFX getter pins it at 2.2 by day: shadowed here, restored in PR3_off)
  X.bl={en:bloom.enabled,s:bloom.strength,r:bloom.radius,d:Object.getOwnPropertyDescriptor(bloom,'threshold'),hm:bloom.materialHighPassFilter,hu:bloom.highPassUniforms};
  if(!PROTO.hp){const u={tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:.6},defaultColor:{value:new THREE.Color(0)},defaultOpacity:{value:0}};
    PROTO.hp=new THREE.ShaderMaterial({uniforms:u,vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:'uniform sampler2D tDiffuse;uniform float luminosityThreshold,smoothWidth;varying vec2 vUv;void main(){vec4 t=texture2D(tDiffuse,vUv);float m=max(t.r,max(t.g,t.b));gl_FragColor=vec4(t.rgb*smoothstep(luminosityThreshold,luminosityThreshold+smoothWidth,m),1.);}'})}
  bloom.materialHighPassFilter=PROTO.hp;bloom.highPassUniforms=PROTO.hp.uniforms;
  {const v=renderer.getDrawingBufferSize(new THREE.Vector2());X.bl.sz=[v.x,v.y];bloom.setSize(v.x/2,v.y/2)}   // quarter-res bright pass and mips (phone budget)
  Object.defineProperty(bloom,'threshold',{configurable:true,get(){return PROTO.p2?K.bTh:X.bl.d.get?X.bl.d.get.call(bloom):X.bl.d.value},set(v){if(X.bl.d.set)X.bl.d.set.call(bloom,v);else X.bl.d.value=v}})}
function PR3_shadow(X){const S=X.sh;if(!S)return;const K=PR_LOOK,cam=S.cam,c=new THREE.Vector3(RO.x+Math.sin(RO.h)*8,RO.y||0,RO.z+Math.cos(RO.h)*8);
  // texel snap: move the centre in the light's own axes by whole texels
  const t=2*K.shExt/K.shSz,rx=new THREE.Vector3(1,0,0).applyQuaternion(cam.quaternion),uy=new THREE.Vector3(0,1,0).applyQuaternion(cam.quaternion),a=c.dot(rx),b=c.dot(uy);
  c.addScaledVector(rx,Math.round(a/t)*t-a).addScaledVector(uy,Math.round(b/t)*t-b);cam.position.copy(c).addScaledVector(X.sd,150);cam.updateMatrixWorld();
  S.U.uShM.value.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1).multiply(cam.projectionMatrix).multiply(cam.matrixWorldInverse);
  const R=renderer,rt0=R.getRenderTarget(),ov=scene.overrideMaterial,bg=scene.background,ac=R.autoClear,sm=R.shadowMap.autoUpdate;
  scene.overrideMaterial=S.ov;scene.background=null;R.shadowMap.autoUpdate=false;R.autoClear=true;
  try{R.setRenderTarget(S.rt);R.clear();R.render(scene,cam)}finally{R.setRenderTarget(rt0);scene.overrideMaterial=ov;scene.background=bg;R.autoClear=ac;R.shadowMap.autoUpdate=sm}}
function PR3_frame(X){const K=PR_LOOK,S=X.sh;if(!S)return;
  // paint: ART10_cars / GL_apply re-point car paint every 500 ms: write ours back before each render (assignments only, same program)
  for(const m of X.pm.keys())if(m.envMap!==PROTO.env)m.envMap=PROTO.env;
  bloom.enabled=!K.blOff;bloom.strength=K.bS;bloom.radius=K.bR;
  for(const o of S.rc)o.visible=!K.shOff;S.U.uK.value=K.shCast?K.shK:0;if(K.shCast&&!K.shOff&&(++S.f&1||!K.sh2))PR3_shadow(X);const cv=S.U.uCar.value;let i=0;const v=new THREE.Vector3();
  if(typeof pl!=='undefined'&&pl&&pl.mesh){cv[i++].set(RO.x,RO.z,RO.h,2.3)}
  for(const a of X.sp.ai){if(i>=6||!a.g)break;a.g.getWorldPosition(v);const q=PR_at(X.P,X.L,a.s||0);cv[i++].set(v.x,v.z,q.h,2.3)}for(;i<6;i++)cv[i].w=0}
function PR3_off(X){if(X.pm)for(const[m,v]of X.pm){m.envMap=v[0];m.envMapIntensity=v[1];m.roughness=v[2];if(v[3]!=null)m.clearcoatRoughness=v[3]}
  if(X.bl){Object.defineProperty(bloom,'threshold',X.bl.d);bloom.materialHighPassFilter=X.bl.hm;bloom.highPassUniforms=X.bl.hu;bloom.setSize(...X.bl.sz);bloom.enabled=X.bl.en;bloom.strength=X.bl.s;bloom.radius=X.bl.r}
  const S=X.sh;if(S){for(const o of S.rc)if(o.parent)o.parent.remove(o);S.rt.depthTexture.dispose();S.rt.dispose();S.mat.dispose();S.ov.dispose();X.sh=null}}
