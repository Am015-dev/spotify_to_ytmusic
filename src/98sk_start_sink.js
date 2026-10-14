// ===== SKS: START SINK (sink-1, 2026-10-14). Alex beta.56: "The sinking is still not solved at the beginning of the game."
// Every earlier check measured the tyres against groundAt (the physics ground) and passed at +0.03 m, while the player saw the tyres a third deep in the
// asphalt: the v85 start ribbon (96_scale_qa.js) drew a 16 m road 0.34 m ABOVE groundAt along the first straight of every quest start (Hot Drop too).
// So this check measures BOTH: the gap to groundAt and the gap to the DRAWN surface (the highest drawn mesh under each tyre, read from a height picture rendered
// straight down). Asphalt is drawn ~4.5 cm above groundAt, so "inside the drawn surface" fails below -8 cm.
// SKS_run(city): the real start of that city's first job (Frankfurt: Hot Drop with the full parachute scene, no skip; Athens: the nearest job marker, started
// like a card GO), then from touchdown samples every 100 ms for SKS.secs (15 s): no input for 5 s, then real GAS (keydown ArrowUp) until 25 m driven, release.
// Player tyres (precise wheel boxes): 0..5 cm above groundAt (-2 cm allowed) and not > 6 cm inside the drawn surface; traffic and any other wheeled
// vehicle within 60 m: the same against groundAt / the drawn surface. Samples while the player car is airborne (jumps) are skipped.
const SKS={secs:15,b:null,rt:null,mat:null,last:null,uD:{value:8}},_skO=new THREE.Vector3();
// the DRAWN surface: a height picture from straight above (orthographic, world height in 16 bits per pixel), the GPU's downward ray: the live page frees the
// CPU copy of road/terrain geometry after upload, so a raycast sees nothing there. Hidden while drawing: vehicles (the player car, anything with wheel meshes,
// the traffic instances HUB.cim + their wheel/glass instances; Athens streets are instanced, so other instances stay), sprites, points, see-through fx. SKS_pic(cx,cz,S,P,top) → h(x,z) = surface height or null (nothing drawn).
// see-through / decal fx (shadow blobs, rings, beams): transparent or not writing depth, so they never hide a tyre
const SKS_fx=m=>!m||[].concat(m).every(q=>!q||q.transparent||q.depthWrite===false||q.colorWrite===false||q.visible===false);
function SKS_root(o){let q=o;while(q.parent&&q.parent!==scene&&q.parent!==HUB.grp&&q.parent!==RO.grp)q=q.parent;return q}
function SKS_mat(){if(SKS.mat)return SKS.mat;const m=new THREE.MeshBasicMaterial({side:THREE.DoubleSide});m.toneMapped=false;m.fog=false;
  m.onBeforeCompile=sh=>{sh.vertexShader='varying float vSkD;\n'+sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\n vSkD=-mvPosition.z;');
    sh.uniforms.uSkD=SKS.uD;sh.fragmentShader='varying float vSkD;\nuniform float uSkD;\n'+sh.fragmentShader.replace(/}\s*$/,' float v=clamp(vSkD/uSkD,0.0,1.0)*255.0;gl_FragColor=vec4(floor(v)/255.0,fract(v),0.0,1.0);\n}')};
  m.customProgramCacheKey=()=>'sks-height';return SKS.mat=m}
function SKS_pic(cx,cz,S,P,top,D=8){const cam=new THREE.OrthographicCamera(-S/2,S/2,S/2,-S/2,.01,D);cam.position.set(cx,top,cz);cam.up.set(0,0,-1);cam.lookAt(cx,top-10,cz);cam.updateMatrixWorld();
  const hid=[],veh=new Set();if(pl&&pl.mesh)veh.add(pl.mesh);scene.traverseVisible(o=>{if(o.isMesh&&o.userData.r)veh.add(SKS_root(o))});
  for(const im of HUB.cim||[])if(im){veh.add(im);if(im.userData.w)veh.add(im.userData.w);if(im.userData.g)veh.add(im.userData.g)}
  scene.traverseVisible(o=>{if(veh.has(o)||o.isSprite||o.isPoints||o.isLine||(o.isMesh&&SKS_fx(o.material)))hid.push(o)});
  for(const o of hid)o.visible=false;const rt=SKS.rt&&SKS.rt.width===P?SKS.rt:(SKS.rt&&SKS.rt.dispose(),SKS.rt=new THREE.WebGLRenderTarget(P,P));const px=new Uint8Array(P*P*4),fog=scene.fog,ov=scene.overrideMaterial,bg=scene.background;
  const TD=typeof TQ!=='undefined'&&TQ?TQ:null,d0=TD&&TD.draw;if(TD)TD.draw=1;const cc=new THREE.Color(),ca=renderer.getClearAlpha();renderer.getClearColor(cc);
  const sa=renderer.shadowMap.autoUpdate;renderer.shadowMap.autoUpdate=false;
  SKS.uD.value=D;
  try{scene.fog=null;scene.background=null;scene.overrideMaterial=SKS_mat();renderer.setRenderTarget(rt);renderer.setClearColor(0,0);renderer.clear();renderer.render(scene,cam);renderer.readRenderTargetPixels(rt,0,0,P,P,px)}
  finally{renderer.shadowMap.autoUpdate=sa;if(TD)TD.draw=d0;renderer.setRenderTarget(null);renderer.setClearColor(cc,ca);scene.fog=fog;scene.overrideMaterial=ov;scene.background=bg;for(const o of hid)o.visible=true}
  return(x,z)=>{const i=Math.round((x-cx)/S*P+P/2-.5),j=Math.round(P/2-(z-cz)/S*P-.5);if(i<0||j<0||i>=P||j>=P)return null;const o=(j*P+i)*4;if(px[o+3]<128)return null;return top-(px[o]+px[o+1]/255)/255*D}}
function SKS_wheels(root,skip){const W=[];root.traverse(w=>{if(!w.isMesh||!w.userData.r)return;for(let q=w;q&&q!==root;q=q.parent)if(!q.visible)return;if(skip&&skip(w))return;W.push(w)});return W}
function SKS_tyres(W,H){const b=SKS.b||(SKS.b=new THREE.Box3()),o=[];for(const w of W){b.setFromObject(w,true);const cx=(b.min.x+b.max.x)/2,cz=(b.min.z+b.max.z)/2,s=H?H(cx,cz):null;
  o.push({x:cx,z:cz,g:b.min.y-groundAt(cx,cz,b.min.y+1),v:s==null?null:b.min.y-s})}return o}
// sunk: below the ground by > 2 cm or > 8 cm inside the drawn surface (asphalt is drawn 4.5 cm (Frankfurt) to 6 cm (Athens) above the ground, +2 cm
// between the road strip's vertices; the start bugs were 17-33 cm). Traffic -12 cm: Athens scooters / parked LDraw vans sit on the ground line itself
// (no +3 cm seat) under asphalt drawn up to +10 cm: a known drape offset, not a start sink; floating: the player > 5 cm, traffic > 10 cm
// (traffic is seated on the mean of its 4 corner grounds, FX19_seat: on a kerb or camber one corner reads up to ~9 cm)
// a jump ramp's side rails (addRamp neon strips, LIFE kicker red rails) run along its edges a few cm above the slope: a tyre on that band is against an
// obstacle, not sunk in the road: not judged while you drive (|lateral| within w/2 ± 0.45 m, along the ramp). Parked there (a spawn) still fails.
function SKS_rail(x,z){for(const r of RO.ramps||[]){const dx=x-r.x,dz=z-r.z,sh=Math.sin(r.h),ch=Math.cos(r.h),a=dx*sh+dz*ch,c=dx*ch-dz*sh;if(Math.abs(a)<r.len/2+.5&&Math.abs(Math.abs(c)-r.w/2)<.45)return true}return false}
// kerb-parked traffic (c.pk) may put a tyre on the 0.5 m kerb-stone strip drawn 25 cm up (v90k/kerb-parked placement, not a start sink): judged against the
// ground only, its drawn-surface hits are listed as a warning
const SKS_rok=(q,k)=>k==='pl'&&Math.abs(RO.v)>1&&SKS_rail(q.x,q.z),SKS_kerb=(q,k)=>k==='tr'&&q.pk&&q.v!=null&&q.v<-.08;
const SKS_bad=(q,k)=>!SKS_rok(q,k)&&!SKS_kerb(q,k)&&(q.g<-.02||q.g>(k==='tr'?.1:.05)||(q.v!=null&&q.v<(k==='tr'?-.12:-.08)));
// one sample: player tyres, traffic ≤ 60 m (instanced: c.y is the tyre line), other wheeled meshes ≤ 60 m
// a traffic car's 4 tyre contact points (world): the wheel instance's matrix (FX19_seat pitches/rolls it on the ground) applied to the wheel box's
// bottom corners at the axle positions (the same box FX19_seat seats on); a car without wheel instances: its position
const _skM=new THREE.Matrix4(),_skP=new THREE.Vector3();
function SKS_trTyres(c){const im=HUB.cim&&HUB.cim[c.k],w=im&&im.userData.w;if(!w||!w.geometry)return[{x:c.x,z:c.z,y:c.y}];
  let B=im.userData.fxWB;if(!B){w.geometry.computeBoundingBox();const b=w.geometry.boundingBox,r=(b.max.y-b.min.y)/2;B={l:Math.max(.3,(b.max.z-b.min.z)/2-r),w:(b.max.x-b.min.x)/2*.85,cz:(b.max.z+b.min.z)/2,by:b.min.y}}
  w.getMatrixAt(c.j,_skM);const o=[];for(const[u,v]of[[1,1],[-1,1],[1,-1],[-1,-1]]){_skP.set(u*B.w,B.by,B.cz+v*B.l).applyMatrix4(_skM);o.push({x:_skP.x,z:_skP.z,y:_skP.y})}return o}
// mode 0: player tyres vs groundAt only (cheap); 1: + the player's drawn surface; 2: + traffic and other wheeled meshes within 60 m
function SKS_sample(mode){const r={pl:[],tr:[],ot:[]};if(!pl||!pl.mesh)return r;pl.mesh.updateMatrixWorld(true);const W=SKS_wheels(pl.mesh.userData.m||pl.mesh),b=SKS.b||(SKS.b=new THREE.Box3());
  // the drawn surface is read in a window from 0.5 m above the tyre bottoms down 3 m: a surface the tyre is inside counts, a tree, awning or roof above does not
  const win=(cx,cz,S,P,ys)=>SKS_pic(cx,cz,S,P,Math.max(...ys)+.5,3);
  // the player: an 8 m picture at 6 cm per pixel
  {const ys=W.map(w=>(b.setFromObject(w,true),b.min.y));r.pl=SKS_tyres(W,W.length&&mode>=1?win(RO.x,RO.z,8,128,ys):null)}
  if(!(mode>=2))return r;
  // traffic within 60 m: the 4 tyre contact points of its wheel instance (SKS_trTyres), one 6 m picture per car; other wheeled meshes within 60 m: one per mesh
  for(const c of HUB.cars||[]){if(c.dead>0||c.x==null||(c.x===0&&c.z===0)||Math.hypot(c.x-RO.x,c.z-RO.z)>60)continue;const T=SKS_trTyres(c),H=win(c.x,c.z,6,48,T.map(p=>p.y));
    for(const p of T){const s=H(p.x,p.z);r.tr.push({x:p.x,z:p.z,pk:!!c.pk,g:p.y-groundAt(p.x,p.z,p.y+1),v:s==null?null:p.y-s})}}
  const ex=new Set();pl.mesh.traverse(o=>ex.add(o));const O=[];scene.traverseVisible(o=>{if(o.isMesh&&o.userData.r&&!ex.has(o)){o.getWorldPosition(_skO);if(Math.hypot(_skO.x-RO.x,_skO.z-RO.z)<=60)O.push(o)}});
  for(const w of O){b.setFromObject(w,true);r.ot.push(...SKS_tyres([w],win((b.min.x+b.max.x)/2,(b.min.z+b.max.z)/2,4,32,[b.min.y])))}return r}
const SKS_W=ms=>new Promise(r=>setTimeout(r,ms));
function SKS_key(code,down){window.dispatchEvent(new KeyboardEvent(down?'keydown':'keyup',{code,key:code==='ArrowUp'?'ArrowUp':code,bubbles:true}))}
// start the city's first job the way the player does, resolve when the car is on the ground (Frankfurt: parachute touchdown)
async function SKS_start(){try{OF_reset();if(RO.ch)chAbort()}catch(e){}
  try{SKS_sample(2)}catch(e){}  // compiles the height-picture shader variants now (seconds in software GL), not inside the measured window
  if(CID==='fra'){if(!M1_startHotDrop())return'no Hot Drop marker';let t0=performance.now();while(performance.now()-t0<20000&&!M1.cs)await SKS_W(50);
    const up=()=>pl.mesh.position.y-groundAt(RO.x,RO.z,99);t0=performance.now();while(performance.now()-t0<5000&&M1.cs&&up()<5)await SKS_W(30);  // the scene lifts the car to the plane first
    t0=performance.now();while(performance.now()-t0<30000&&M1.cs&&up()>.01)await SKS_W(50);return M1.cs||!RO.frozen?'':'parachute scene never landed'}
  const m=(RO.marks||[]).filter(q=>q.ev&&q.kind==='quest').sort((a,b)=>Math.hypot(a.x-RO.x,a.z-RO.z)-Math.hypot(b.x-RO.x,b.z-RO.z))[0];if(!m)return'no job marker';
  chStart(m,{});await SKS_W(300);return''}
async function SKS_run(){if(state!=='roam'||!RO.on)return'📍 Start free roam first';const err=await SKS_start();if(err)return'❌ FAIL start-sink '+CID+': '+err;
  const t0=performance.now(),bad=[],W={pl:[9,-9,9],tr:[9,-9,9],ot:[9,-9,9]};let n=0,gas=0,air=0,x0=RO.x,z0=RO.z;const kerb=[];
  // timeline (wall clock; software GL runs the game slower than real time, so GAS is held until the car has really driven): 5 s idle, GAS until 25 m driven
  // (cap 10 s), then idle until SKS.secs and at least 2 s after the release
  let gx=0,gz=0,tr=0;
  try{while(true){const t=(performance.now()-t0)/1000;if(t>=SKS.secs&&gas===2&&t-tr>=2||t>SKS.secs+30)break;
    if(!M1.cs&&!RO.frozen){if(t>=5&&!gas){SKS_key('ArrowUp',1);gas=1;SKS.gT=t;gx=RO.x;gz=RO.z}else if(gas===1&&(Math.hypot(RO.x-gx,RO.z-gz)>=25||t-SKS.gT>=10)){SKS_key('ArrowUp',0);gas=2;tr=t}}
    // airborne (a jump, or the scene's last frame before the car is put down): skipped
    if(pl.air||(RO.vy&&Math.abs(RO.vy)>1.5)||pl.mesh.position.y-groundAt(RO.x,RO.z,99)>1){air++;await SKS_W(100);continue}
    const s=SKS_sample(n%8===0?2:n%4===0?1:0);n++;for(const k of['pl','tr','ot'])for(const q of s[k]){W[k][0]=Math.min(W[k][0],q.g);W[k][1]=Math.max(W[k][1],q.g);if(SKS_kerb(q,k)){if(kerb.length<3)kerb.push(Math.round(q.x)+','+Math.round(q.z)+' v'+q.v.toFixed(3))}else if(q.v!=null&&!SKS_rok(q,k))W[k][2]=Math.min(W[k][2],q.v);if(SKS_bad(q,k)&&bad.length<6)bad.push(k+'@'+Math.round(q.x)+','+Math.round(q.z)+' t'+t.toFixed(1)+' g'+q.g.toFixed(3)+(q.v!=null?' v'+q.v.toFixed(3):''))}
    await SKS_W(100)}}finally{if(gas===1)SKS_key('ArrowUp',0)}
  const mv=Math.hypot(RO.x-x0,RO.z-z0),f=a=>a[0]>8?'none':a[0].toFixed(3)+'..'+a[1].toFixed(3)+' (drawn ≥'+(a[2]>8?'?':a[2].toFixed(3))+')';SKS.last={n,air,W,bad};
  return(bad.length||!n||gas<2?'❌ FAIL ':'✅ PASS ')+(gas<2?'(GAS never pressed) ':'')+'START SINK · '+CID+' · '+SKS.secs+' s from touchdown, '+n+' samples, drove '+mv.toFixed(0)+' m · player tyres '+f(W.pl)+' · traffic ≤60 m '+f(W.tr)+' · other wheels '+f(W.ot)+' m (player 0..0.05 above ground, traffic ≤0.10; none below -0.02 or deeper than 0.08 (traffic 0.12) in the drawn road)'+(bad.length?' · '+bad.join('; '):'')+(kerb.length?' · ⚠ kerb-parked tyre on the kerb stone (not judged): '+kerb.join('; '):'')}
// coordinator matrix (2026-10-14): wheel_gap at Frankfurt -2401,149 and -1921,149 with the long Tiny Muscle (t_v7612_1), phone. GO spawns that ride on each spot
// (the road snap the matrix uses), no input for 3 s, every sample: tyres 0..5 cm above the ground and not inside the drawn road
async function SKS_spots(){if(state!=='roam'||!RO.on)return'📍 Start free roam first';if(!await OF_pickRide('t_v7612_1'))return'❌ FAIL sink-spots: cannot pick t_v7612_1';try{OF_reset();if(RO.ch)chAbort()}catch(e){}
  const out=[],bad=[];for(const[x,z]of[[-2401,149],[-1921,149]]){const q=rfSnap(x,z,60);if(!q||!roamWarp(q[0],q[1],q[2])){bad.push(x+','+z+' warp refused');continue}let lo=9,hi=-9,vlo=9;
    const t0=performance.now();while(performance.now()-t0<3000){await SKS_W(150);for(const p of SKS_sample(1).pl){lo=Math.min(lo,p.g);hi=Math.max(hi,p.g);if(p.v!=null)vlo=Math.min(vlo,p.v);if(SKS_bad(p,'pl')&&bad.length<4)bad.push(x+','+z+' g'+p.g.toFixed(3)+(p.v!=null?' v'+p.v.toFixed(3):''))}}
    out.push(x+','+z+': '+lo.toFixed(3)+'..'+hi.toFixed(3)+' (drawn ≥'+(vlo>8?'?':vlo.toFixed(3))+')')}
  return(bad.length?'❌ FAIL ':'✅ PASS ')+'SINK SPOTS · Tiny Muscle · '+out.join(' · ')+' m'+(bad.length?' · '+bad.join('; '):'')}
function SKS_spotsGo(say){if(state!=='roam'||!RO.on)return'📍 Start free roam first';SKS_spots().then(say,e=>say('❌ FAIL sink-spots: '+String(e).slice(0,80)));return'📍 SINK SPOTS · Tiny Muscle at 2 matrix spots…'}
function SKS_go(say){if(state!=='roam'||!RO.on)return'📍 Start free roam first';SKS_run().then(say,e=>say('❌ FAIL start-sink: '+String(e).slice(0,80)));return'📍 START SINK · '+CID+' · real start + 15 s…'}
// story vehicles (Hilde's tow truck, Kaiser, goons: M1_put) were set level at the ground under their centre: on the 5 % Hot Drop slope the truck's front tyres
// floated 22 cm and the rear sat 12 cm in the road. SKS_seat tilts the body to the ground under its wheels (pitch/roll, the sign pair that fits best) and lifts
// it so the lowest tyre sits CR_TYRE_Y above the ground. Wheel bottoms are cached in the body's frame once (local box of each visible wheel mesh).
const _skQ=new THREE.Vector3();
function SKS_seat(m){if(!m||!m.isObject3D)return;let P=m.userData.skW;if(P===undefined){P=null;const W=SKS_wheels(m);if(W.length>=3){m.rotation.x=m.rotation.z=0;m.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(m.matrixWorld).invert(),b=new THREE.Box3();
    P=W.map(w=>{b.setFromObject(w,true);_skQ.set((b.min.x+b.max.x)/2,b.min.y,(b.min.z+b.max.z)/2).applyMatrix4(inv);return _skQ.clone()})}m.userData.skW=P}
  if(!P)return;const h=m.rotation.y;m.rotation.order='YXZ';const fit=(rx,rz)=>{m.rotation.set(rx,h,rz,'YXZ');m.updateMatrixWorld(true);let lo=9,hi=-9;for(const p of P){_skQ.copy(p).applyMatrix4(m.matrixWorld);const d=_skQ.y-groundAt(_skQ.x,_skQ.z,_skQ.y+1.5);lo=Math.min(lo,d);hi=Math.max(hi,d)}return[hi-lo,lo]};
  // ground slope along the body's own axes from the wheel spread
  let sx=0,sz=0,nx=0,nz=0;m.rotation.set(0,h,0,'YXZ');m.updateMatrixWorld(true);const G=P.map(p=>{_skQ.copy(p).applyMatrix4(m.matrixWorld);return groundAt(_skQ.x,_skQ.z,_skQ.y+1.5)}),gm=G.reduce((a,b)=>a+b,0)/G.length,xm=P.reduce((a,p)=>a+p.x,0)/P.length,zm=P.reduce((a,p)=>a+p.z,0)/P.length;
  P.forEach((p,i)=>{sx+=(p.x-xm)*(G[i]-gm);nx+=(p.x-xm)**2;sz+=(p.z-zm)*(G[i]-gm);nz+=(p.z-zm)**2});const ax=Math.atan(nx>.01?sx/nx:0),az=Math.atan(nz>.01?sz/nz:0);
  let best=null;for(const[rx,rz]of[[0,0],[az,ax],[-az,ax],[az,-ax],[-az,-ax]]){const r=fit(rx,rz);if(!best||r[0]<best[0]-1e-4)best=[r[0],r[1],rx,rz]}
  m.rotation.set(best[2],h,best[3],'YXZ');m.position.y+=CR_TYRE_Y-best[1];m.updateMatrixWorld(true)}
M1_put=(f=>function(m){const r=f.apply(this,arguments);try{SKS_seat(m)}catch(e){}return r})(M1_put);
// the boot spawn (roamPost: new game / continue / city switch) steps off a jump ramp like roamWarp does (RO_clearRamps, 71_roam_drive.js)
roamPost=(f=>function(){const r=f.apply(this,arguments);try{RO.rcT=Math.max(RO.rcT||0,1.5);if(RO_clearRamps())RO.y=groundAt(RO.x,RO.z,RO.y+3)}catch(e){}return r})(roamPost);
// ...and again whenever the ramp list changes under a parked car outside a job: the LIFE "AIR TIME" kicker (lazy models/lx.js) registers its two RO.ramps
// entries seconds after the spawn (the Athens start car ended up on the kicker's edge, two tyres inside its red side rail: beta.56 -0.33 m; LIFE_kick now
// also keeps kickers off garage forecourts, src/assets/lx/code.js)
const SKS_rk={n:-1,a:null};
roamStep=(f=>function(dt){const r=f.apply(this,arguments);try{const L=RO.ramps||[],k=L.length,a=L[k-1]||null;if(k!==SKS_rk.n||a!==SKS_rk.a){SKS_rk.n=k;SKS_rk.a=a;
  if(RO.on&&!RO.ch&&!RO.frozen&&Math.abs(RO.v)<3&&pl&&!pl.air&&RO.foot!=='walk'&&RO_clearRamps()){RO.y=groundAt(RO.x,RO.z,RO.y+3);RO.vy=0}}}catch(e){}return r})(roamStep);
window.SKS_run=SKS_run;window.SKS_sample=SKS_sample;window.SKS_key=SKS_key;
