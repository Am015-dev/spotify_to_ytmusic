// ===== B2K (worker 16): LEGO 2K Drive driving techniques, one module. Roam + races.
// 1 DRIFT-TO-BOOST: hold GAS+BRAKE while steering (or a thumb on the seam between them) = drift with a pink tyre trail; drifting fills
//   the pink drift bar, which turns into boost when the drift ends. 2 SMASH: breakables add boost (+pop next to the meter).
// 3 BOOST METER (cyan, slow regen). BOOST on a full meter = big burst, turbines pop out; boost held 2 s = BRICKBASH (faster, knocks traffic aside).
// 4 HOP: swipe up on GAS (Space on PC). API for races: window.B2K (see B2K_API at the bottom).
window.B2K_DMIN=12; // m/s: lowest drift speed (hook in 71_roam_drive hbOk)
const B2K={dm:0,dmS:0,dT:0,slS:0,slN:0,slMax:0,bt:0,bash:false,wasB:false,turbS:0,tG:false,tB:false,req:false,hopReq:false,pulse:0,
  log:{drift:[],smash:[],burst:0,bash:0,hop:0},trail:null,turb:null,tm:null,tbox:null,el:null,fr:0};
const B2K_REGEN=4;   // net meter regen per s in roam (FL_RECH 9 minus 5): "regenerates slowly"
const B2K_CONV=.55;  // drift bar (0-100) -> boost
const B2K_BASHT=2;   // s of continuous boost before BRICKBASH
// ---- input: GAS/BRAKE held by any touch, incl. one thumb on the seam between the two buttons
function B2K_touch(e){const g=document.getElementById('tG'),b=document.getElementById('tB');if(!g||!b)return;const G=g.getBoundingClientRect(),Bb=b.getBoundingClientRect();
  const gc=[G.left+G.width/2,G.top+G.height/2,G.width/2],bc=[Bb.left+Bb.width/2,Bb.top+Bb.height/2,Bb.width/2];let tg=false,tb=false;
  for(const t of e.touches){const dg=Math.hypot(t.clientX-gc[0],t.clientY-gc[1]),db=Math.hypot(t.clientX-bc[0],t.clientY-bc[1]);
    if(G.width>4&&Bb.width>4&&dg<gc[2]+12&&db<bc[2]+12){tg=tb=true}}
  B2K.tG=tg;B2K.tB=tb}
for(const ev of['touchstart','touchmove','touchend','touchcancel'])addEventListener(ev,B2K_touch,{passive:true,capture:true});
// swipe up on GAS = hop (keeps the thumb on the gas; no 6th button)
{const sw=new Map();const g=()=>document.getElementById('tG');
  addEventListener('touchstart',e=>{const G=g();if(!G)return;for(const t of e.changedTouches)if(G.contains(t.target)||t.target===G)sw.set(t.identifier,{y:t.clientY,t:e.timeStamp,ly:t.clientY,lt:e.timeStamp,done:false})},{passive:true,capture:true});
  // the thumb may rest on GAS for minutes: a flick is measured from where it last rested (>150 ms still), not from touch-down
  addEventListener('touchmove',e=>{const n=e.timeStamp;for(const t of e.changedTouches){const s=sw.get(t.identifier);if(!s)continue;const y=t.clientY;if(n-s.lt>150){s.y=s.ly;s.t=n}
    if(s.done){if(y>s.y-10)s.done=false}else if(s.y-y>26&&n-s.t<500){s.done=true;B2K_hop()}s.ly=y;s.lt=n}},{passive:true,capture:true});
  const end=e=>{for(const t of e.changedTouches)sw.delete(t.identifier)};addEventListener('touchend',end,{passive:true,capture:true});addEventListener('touchcancel',end,{passive:true,capture:true})}
function B2K_hop(){if(state==='roam')pressed.fire=true;else B2K.hopReq=true;B2K.log.hop++;const G=document.getElementById('tG');if(G){G.classList.remove('b2kHop');void G.offsetWidth;G.classList.add('b2kHop')}}
// ctlPlayer: drift (hb), never a brake. Free roam: ONLY an explicit GAS+BRAKE+steer (two thumbs, the seam, or keys Up+Down+steer);
// plain BRAKE+steer always brakes (auto-gas must not turn a brake tap into a drift). Races on touch (auto-gas, GAS hidden):
// BRAKE+steer above B2K_RDMIN (60 km/h) drifts, so phone players can drift.
window.B2K_RDMIN=16.7; // m/s
{const f0=ctlPlayer;ctlPlayer=function(){const c=f0.apply(this,arguments);try{if(state==='roam'||state==='race'){
  const gas=TOUCH.gas||B2K.tG||K.ArrowUp||K.KeyW,brk=TOUCH.brake||B2K.tB||K.ArrowDown||K.KeyS,race=state==='race',tauto=race&&TOUCH.on&&TOUCH.used;
  const sp=race?(pl?pl.v:0):Math.abs(RO.v),dr=race?!!(pl&&pl.hbDir):!!RO.dDir,st=dr||Math.abs(c.steer)>.25;
  B2K.req=brk&&st&&!TOUCH.park&&(gas&&sp>window.B2K_DMIN||tauto&&(sp>window.B2K_RDMIN||dr&&sp>window.B2K_DMIN));if(B2K.req){c.hb=1;c.brk=0;c.thr=1}}}catch(e){}return c}}
// ---- HUD: pink drift bar over a cyan boost bar, just above the speed readout
(()=>{const st=document.createElement('style');st.id='b2kCss';st.textContent=`
#b2kM{position:fixed;left:50%;bottom:calc(36px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);width:clamp(150px,22vw,200px);z-index:6;pointer-events:none;display:none}
#b2kM.on{display:block}#b2kM .d,#b2kM .b{position:relative;border:2px solid #141413;border-radius:6px;background:rgba(20,20,19,.55);overflow:hidden}
#b2kM .d{height:7px;margin:0 14px 3px;border-radius:5px}#b2kM .b{height:11px}
#b2kM .d i,#b2kM .b i{position:absolute;left:0;top:0;bottom:0;width:0;transition:width .08s linear}
#b2kM .d i{background:linear-gradient(#ff8ad0,#ff2d95)}#b2kM .b i{background:linear-gradient(#a8fbff,#16b4d6)}
#b2kM .b:after{content:'';position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent 0 calc(10% - 2px),rgba(20,20,19,.7) calc(10% - 2px) 10%)}
#b2kM.full .b{border-color:#d6fbff;box-shadow:0 0 10px rgba(76,234,255,.9)}#b2kM.pulse .b{animation:b2kP .35s ease-out}#b2kM.dr .d{box-shadow:0 0 9px rgba(255,45,149,.9);border-color:#ffd0ec}
#b2kM.bash .b i{background:linear-gradient(#fff3a0,#ff9a1f)}#b2kM.bash .b{border-color:#ffd12c;box-shadow:0 0 14px rgba(255,170,30,.95)}
@keyframes b2kP{0%{transform:scale(1)}40%{transform:scale(1.12,1.5)}100%{transform:scale(1)}}
#b2kT{position:absolute;left:50%;bottom:30px;transform:translateX(-50%);font:italic 900 15px/1 system-ui,sans-serif;letter-spacing:.04em;color:#ffd12c;-webkit-text-stroke:1px #141413;text-shadow:0 2px 0 #141413;white-space:nowrap;opacity:0}
#b2kT.on{opacity:1;animation:b2kTb .5s ease-in-out infinite alternate}@keyframes b2kTb{to{transform:translateX(-50%) scale(1.1)}}
.b2kPop{position:absolute;bottom:4px;font:italic 900 17px/1 system-ui,sans-serif;-webkit-text-stroke:1px #141413;text-shadow:0 2px 0 #141413;white-space:nowrap;animation:b2kUp 1.1s ease-out forwards}
@keyframes b2kUp{0%{transform:translateY(6px) scale(.6);opacity:0}15%{transform:translateY(-8px) scale(1.2);opacity:1}70%{transform:translateY(-16px) scale(1);opacity:1}100%{transform:translateY(-30px) scale(1);opacity:0}}
#flPop{display:none!important}#b2kM.dim{opacity:.3}
#tG.b2kHop{animation:b2kH .35s ease-out}@keyframes b2kH{40%{transform:scale(.78) translateY(-10px)}}
#tG:before{content:'▲';position:absolute;top:5px;left:50%;transform:translateX(-50%);font-size:12px;opacity:.65}`;document.head.appendChild(st);
  const m=document.createElement('div');m.id='b2kM';m.innerHTML='<div id="b2kT">BRICKBASH!</div><div class="d"><i></i></div><div class="b"><i></i></div>';document.body.appendChild(m);B2K.el=m})();
function B2K_pop(txt,col){const m=B2K.el;if(!m)return;const p=document.createElement('div');p.className='b2kPop';p.textContent=txt;p.style.color=col;p.style.left=(m.childElementCount%2?'72%':'4%');m.appendChild(p);setTimeout(()=>p.remove(),1150)}
function B2K_hud(bm){const m=B2K.el;if(!m)return;const vis=(state==='roam'&&!RO.mapOpen&&!RO.card&&!RO.story&&!RO.frozen||state==='race')&&!!pl;m.classList.toggle('on',vis);if(!vis)return;
  B2K.dmS+=(B2K.dm-B2K.dmS)*.35;m.children[1].firstChild.style.width=B2K.dmS.toFixed(1)+'%';m.children[2].firstChild.style.width=clamp(bm,0,100).toFixed(1)+'%';
  m.classList.toggle('full',bm>=99);m.classList.toggle('dr',B2K.dm>1);m.classList.toggle('bash',B2K.bash);m.children[0].classList.toggle('on',B2K.bash);
  if((++B2K.fr&15)===0){const q=document.getElementById('roamPrompt');let ov=false;if(q&&!q.hidden&&q.offsetWidth){const a=m.getBoundingClientRect(),b=q.getBoundingClientRect();ov=Math.min(a.right,b.right)-Math.max(a.left,b.left)>6&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>6}m.classList.toggle('dim',ov)}
  if(B2K.pulse>0){B2K.pulse=0;m.classList.remove('pulse');void m.offsetWidth;m.classList.add('pulse')}}
// ---- car-local box (rear tyres, turbines)
function B2K_rear(mesh){if(state!=="race")return -1;if(B2K.rsT===mesh&&B2K.rsS===state&&B2K.rs)return B2K.rs;const c=new THREE.Vector3().copy(camera.position);mesh.updateMatrixWorld();mesh.worldToLocal(c);if(Math.abs(c.z)>.5){B2K.rs=c.z<0?-1:1;B2K.rsT=mesh;B2K.rsS=state}return B2K.rs||-1}
function B2K_box(mesh){if(B2K.tm===mesh&&B2K.tbox&&B2K.tst===state)return B2K.tbox;B2K.tst=state;mesh.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(mesh.matrixWorld).invert(),M=new THREE.Matrix4();
  const b=new THREE.Box3();const tv=B2K.turb&&B2K.turb.parent===mesh?B2K.turb.visible:null;if(tv!=null)B2K.turb.visible=false;
  mesh.traverseVisible(o=>{if(o!==mesh&&o.isMesh&&o.geometry&&!(o.material&&(o.material.transparent||o.material.blending===THREE.AdditiveBlending))){if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();b.union(o.geometry.boundingBox.clone().applyMatrix4(M.multiplyMatrices(inv,o.matrixWorld)))}});
  if(tv!=null)B2K.turb.visible=tv;const rc=state==='race',r={hw:rc?clamp((b.max.x-b.min.x)/2,.8,2.6):clamp((b.max.x-b.min.x)/2,.8,1.15)||1,hl:rc?clamp((b.max.z-b.min.z)/2,1.5,4):2.2,y0:b.isEmpty()?0:b.min.y,hh:clamp(b.max.y-b.min.y,.8,2.4)||1.3,cz:0,raw:[b.min.toArray(),b.max.toArray()]};B2K.tbox=r;B2K.tm=mesh;return r}
// ---- turbines that pop out of the car while boosting
function B2K_turbines(s,on,dt){const mesh=s&&s.mesh;if(!mesh)return;const bx=B2K_box(mesh),par=mesh.parent;if(!par)return;B2K.tCar=mesh;
  if(!B2K.turb||B2K.turb.parent!==par){if(B2K.turb&&B2K.turb.parent)B2K.turb.parent.remove(B2K.turb);if(!B2K.turbG){
      const body=new THREE.CylinderGeometry(.42,.5,1.6,16).rotateX(Math.PI/2),ring=new THREE.TorusGeometry(.43,.11,8,18),fan=new THREE.CylinderGeometry(.37,.37,.06,10).rotateX(Math.PI/2);
      B2K.turbG={body,ring,fan,mB:new THREE.MeshStandardMaterial({color:0x3a3f4a,metalness:.6,roughness:.35}),mR:new THREE.MeshBasicMaterial({color:0xffb347}),mF:new THREE.MeshBasicMaterial({color:0x4ceaff})}}
    // scene-level group; every part takes car.matrixWorld x its car-local matrix right before it is drawn (no frame lag, no per-car hide rules)
    const T=B2K.turbG,g=new THREE.Group();g.name='b2kTurb';g.userData.gbG=1;g.matrixAutoUpdate=false;g.units=[];
    for(const sd of[-1,1]){const parts=[[T.body,T.mB,0],[T.ring,T.mR,-.86],[T.fan,T.mF,-.84]].map(([geo,mat,z])=>{const m=new THREE.Mesh(geo,mat);m.matrixAutoUpdate=false;m.frustumCulled=false;m.userData.gbG=1;m.userData.z=z;m.userData.L=new THREE.Matrix4();
        m.onBeforeRender=function(){if(B2K.tCar){this.matrixWorld.multiplyMatrices(B2K.tCar.matrixWorld,this.userData.L)}};g.add(m);return m});g.units.push({sd,parts,spin:0})}
    B2K.turb=g;par.add(g)}
  const tgt=on?1:0;B2K.turbS+=(tgt-B2K.turbS)*Math.min(1,dt*(on?9:6));const fz=bx.hl/2.2,k=B2K.turbS,ov=on?1+.25*Math.sin(Math.min(1,k)*Math.PI):1,sc=Math.max(.001,k*ov*fz),tx=sd=>sd*(bx.hw+(.25+.3*k)*fz),rs=B2K_rear(mesh),tz=bx.cz+rs*bx.hl*.55;
  B2K.turb.visible=k>.02&&mesh.visible;const U=new THREE.Matrix4(),Pm=new THREE.Matrix4(),Sv=new THREE.Vector3(sc,sc,sc),Q=new THREE.Quaternion(),Pv=new THREE.Vector3();
  for(const u of B2K.turb.units){u.spin+=dt*30;Pv.set(tx(u.sd),bx.y0+bx.hh*.6,tz);U.compose(Pv,Q.identity(),Sv);
    for(const m of u.parts){Pm.makeTranslation(0,0,m.userData.z*-rs);if(m.geometry===B2K.turbG.fan)Pm.multiply(new THREE.Matrix4().makeRotationZ(u.spin));m.userData.L.multiplyMatrices(U,Pm)}}
  if(on&&k>.6&&R()<.9){const pt=new THREE.Vector3(),back=new THREE.Vector3(0,0,rs).transformDirection(mesh.matrixWorld);for(const u of B2K.turb.units){pt.set(tx(u.sd),bx.y0+bx.hh*.6,tz+rs*1.0*k*fz).applyMatrix4(mesh.matrixWorld);
    emit(SPARK,pt,back.clone().multiplyScalar(rr(6,10)).add(V3(rr(-1,1),rr(0,1.5),rr(-1,1))),.22,B2K.bash?new THREE.Color(2.6,1.4,.3):new THREE.Color(.7,1.8,2.6))}}}
// ---- pink drift trail (two ribbons from the rear tyres)
function B2K_trailInit(par){const N=64,g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(N*2*2*3),3));g.setAttribute('color',new THREE.BufferAttribute(new Float32Array(N*2*2*3),3));
  const idx=[];for(let sd=0;sd<2;sd++)for(let i=0;i<N-1;i++){const a=(sd*N+i)*2;idx.push(a,a+1,a+2,a+1,a+3,a+2)}g.setIndex(idx);
  const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));m.frustumCulled=false;m.renderOrder=3;par.add(m);
  B2K.trail={m,g,N,pts:[[],[]],t:0}}
function B2K_trail(s,on,dt){if(!s||!s.mesh)return;const par=s.mesh.parent||scene;if(!B2K.trail||B2K.trail.m.parent!==par){if(B2K.trail&&B2K.trail.m.parent)B2K.trail.m.parent.remove(B2K.trail.m);B2K_trailInit(par)}const T=B2K.trail,mesh=s.mesh,bx=B2K_box(mesh);T.t+=dt;
  const P=new THREE.Vector3(),side=new THREE.Vector3(1,0,0).transformDirection(mesh.matrixWorld);
  for(let sd=0;sd<2;sd++){const L=T.pts[sd];for(const p of L)p.a+=dt;while(L.length&&L[0].a>1.4)L.shift();
    if(on){P.set((sd?1:-1)*bx.hw*.82,Math.max(bx.y0,0)+.09,bx.cz+B2K_rear(mesh)*bx.hl*.62);mesh.localToWorld(P);const l=L[L.length-1];if(!l||l.end||P.distanceTo(l.p)>.35)L.push({p:P.clone(),s:side.clone(),a:0,brk:!l||!!l.end});if(L.length>T.N)L.shift()}
    else if(L.length)L[L.length-1].end=true}
  const pos=T.g.attributes.position.array,col=T.g.attributes.color.array;pos.fill(0);col.fill(0);
  for(let sd=0;sd<2;sd++){const L=T.pts[sd];for(let i=0;i<L.length;i++){const p=L[i],o=((sd*T.N+i)*2)*3,w=.22,k=Math.max(0,1-p.a/1.4)*(i+1<L.length&&L[i+1].brk?0:1);
    pos[o]=p.p.x-p.s.x*w;pos[o+1]=p.p.y;pos[o+2]=p.p.z-p.s.z*w;pos[o+3]=p.p.x+p.s.x*w;pos[o+4]=p.p.y;pos[o+5]=p.p.z+p.s.z*w;
    const c=p.brk?0:k;col[o]=col[o+3]=1.0*c;col[o+1]=col[o+4]=.18*c;col[o+2]=col[o+5]=.62*c}
    for(let i=L.length;i<T.N;i++){const o=((sd*T.N+i)*2)*3,l=L[L.length-1];if(l){pos[o]=pos[o+3]=l.p.x;pos[o+1]=pos[o+4]=l.p.y;pos[o+2]=pos[o+5]=l.p.z}}}
  T.g.attributes.position.needsUpdate=true;T.g.attributes.color.needsUpdate=true;T.m.visible=T.pts[0].length+T.pts[1].length>0}
// ---- shared per-frame logic (roam + race): drift bar, conversion, burst, Brickbash, FX, HUD
function B2K_drift(s,on,slip,sp,dt){if(on){const r=24*clamp(sp/22,.5,1.3)*(.55+Math.min(1,slip/.45)*.65);B2K.dm=Math.min(100,B2K.dm+r*dt);B2K.dT+=dt;B2K.slS+=slip;B2K.slN++;B2K.slMax=Math.max(B2K.slMax,slip)}}
function B2K_driftEnd(s){if(B2K.dT<=0)return;const b0=s.bm;s.bm=Math.min(100,s.bm+B2K.dm*B2K_CONV);const g=s.bm-b0;
  B2K.log.drift.push({s:+B2K.dT.toFixed(2),bar:+B2K.dm.toFixed(1),boost:+g.toFixed(1),slipAvg:+(B2K.slS/Math.max(1,B2K.slN)*57.3).toFixed(1),slipMax:+(B2K.slMax*57.3).toFixed(1)});if(B2K.log.drift.length>40)B2K.log.drift.shift();
  if(g>=1){B2K_pop('+'+Math.round(g)+' BOOST','#ff8ad0');B2K.pulse=1}B2K.dm=0;B2K.dT=0;B2K.slS=0;B2K.slN=0;B2K.slMax=0}
function B2K_boost(s,boosting,bm0,dt,roam){if(boosting&&!B2K.wasB&&bm0>=99){B2K.log.burst++;fovKick=Math.max(fovKick,15);shake=Math.max(shake,.25);try{AU.sfx('boost')}catch(e){}B2K_pop('FULL BOOST!','#7ff3ff');
    if(roam)RO.bRamp=1;else s.boost=Math.max(s.boost||0,.25)}
  B2K.bt=boosting?B2K.bt+dt:0;const bash=boosting&&B2K.bt>=B2K_BASHT;if(bash&&!B2K.bash){B2K.log.bash++;try{AU.sfx('finish')}catch(e){}fovKick=Math.max(fovKick,12);shake=Math.max(shake,.3)}B2K.bash=bash;
  if(bash){s.bm=Math.min(100,s.bm+8*dt);if(roam){RO.turbo=Math.max(RO.turbo||0,.12);RO.inv=Math.max(RO.inv||0,.15)}else s.boost=Math.max(s.boost||0,.12)}B2K.wasB=boosting}
// Brickbash in roam: traffic within reach is knocked aside (tumble + debris) instead of stopping the car
function B2K_bashPush(){if(!B2K.bash||!HUB||!HUB.cars)return;const fx=Math.sin(RO.h),fz=Math.cos(RO.h);for(const c of HUB.cars){if(c.dead||c.x==null)continue;const dx=c.x-RO.x,dz=c.z-RO.z,d=Math.hypot(dx,dz);
  if(d<7.5&&Math.abs((c.y??RO.y)-RO.y)<3&&dx*fx+dz*fz>-1){c.dead=25;try{CR_tumbleStart(c,c.x,c.z,dx/d||fx,dz/d||fz)}catch(e){}const at=V3(c.x,(c.y??RO.y)+1.5,c.z);
    try{debris(at,V3(dx/d*8,9,dz/d*8),14,[new THREE.Color('#ffd12c'),new THREE.Color('#22252f'),new THREE.Color('#d0e8ff')],1,c.y??RO.y)}catch(e){burst(SPARK,at,14,10,.4,new THREE.Color(2.6,1.6,.3))}
    try{AU.sfx('crash')}catch(e){}shake=Math.max(shake,.35);comboAdd(2);B2K_pop('BASH!','#ffd12c')}}}
// roam: wrap roamStep (pre: Brickbash push; post: drift bar instead of the old trickle, conversion, slow regen, FX, HUD)
{const f0=roamStep;roamStep=function(dt){const s=pl;if(state!=='roam'||!s||RO.wk){const r=f0.apply(this,arguments);B2K_hud(s?s.bm:0);return r}
  B2K_bashPush();const bm0=s.bm,d0=RO.dDir,t0=RO.dT||0;{const L=B2K.log;L.stk=L.stk||[];if(Math.abs(RO.v)<1.4&&!RO.card&&!RO.story){B2K.stT=(B2K.stT||0)+dt;if(B2K.stT>2&&!B2K.stOn){B2K.stOn=1;if(L.stk.length<20)L.stk.push({x:Math.round(RO.x),z:Math.round(RO.z),lastDrift:+(B2K.tD||0).toFixed(1),bash:B2K.bash,boostT:+(B2K.tB0||0).toFixed(1),hp:Math.round(RO.hp??100),wk:!!RO.wk})}}else{B2K.stT=0;B2K.stOn=0}B2K.tD=RO.dDir?0:(B2K.tD||0)+dt;B2K.tB0=CTL&&CTL.boost?0:(B2K.tB0||0)+dt}const r=f0.apply(this,arguments);try{
  const boosting=!!(CTL&&CTL.boost)&&bm0>1&&!RO.card&&!RO.mapOpen&&!RO.story;
  // take back the old drift trickle (8/s) and end bonus (6 per tier): the drift bar pays out instead
  let take=(RO.dDir?8*dt:0)+(d0&&!RO.dDir?6*(t0>2?3:t0>1.1?2:t0>.5?1:0):0);if(take>0){const base=boosting?Math.max(0,bm0-22*dt):Math.min(100,bm0+((RO.bIdle||0)>.5?FL_RECH*dt:0));s.bm-=Math.min(take,Math.max(0,s.bm-base))}
  if(!boosting&&!RO.dDir&&(RO.bIdle||0)>.5&&s.bm<100)s.bm=Math.max(bm0,s.bm-(FL_RECH-B2K_REGEN)*dt);
  const sp=Math.abs(RO.v),slip=Math.abs(angDiff(RO.h,RO.vh??RO.h));B2K_drift(s,!!RO.dDir,slip,sp,dt);if(d0&&!RO.dDir)B2K_driftEnd(s);
  B2K_boost(s,boosting,bm0,dt,true);B2K_turbines(s,boosting||B2K.bash,dt);B2K_trail(s,!!RO.dDir&&!(s.air),dt);
  if(B2K.bash&&R()<.5)emit(SPARK,V3(RO.x+rr(-2,2),RO.y+rr(.5,2),RO.z+rr(-2,2)),V3(rr(-3,3),rr(1,4),rr(-3,3)),.3,new THREE.Color(2.6,1.8,.4))}catch(e){B2K.err=String(e)}B2K_hud(s.bm);return r}}
// races: wrap physPlayer the same way (race drift is s.hbDir/s.hbT; race boost is c.boost on s.bm)
{const f0=physPlayer;physPlayer=function(s,c){if(!s||!s.isPlayer||state!=='race')return f0.apply(this,arguments);const bm0=s.bm,d0=s.hbDir,H0=(typeof H==='number'?H:1/60);const r=f0.apply(this,arguments);try{
  const dt=H0,boosting=!!(c&&c.boost)&&bm0>.5&&!s.air;if(s.hbDir){const base=boosting?Math.max(0,bm0-24*dt):bm0;s.bm-=Math.min(6*dt,Math.max(0,s.bm-base))}
  B2K_drift(s,!!s.hbDir,Math.abs(s.beta||0),s.v||0,dt);if(d0&&!s.hbDir)B2K_driftEnd(s);B2K_boost(s,boosting,bm0,dt,false);B2K_turbines(s,boosting||B2K.bash,dt);B2K_trail(s,!!s.hbDir&&!s.air,dt);if(B2K.hopReq)B2K.hopReq=false}catch(e){B2K.err=String(e)}B2K_hud(s.bm);return r}}
// SMASH refills boost: every breakable adds +4 on top of the FL chain bonus, with a pop next to the meter and a cyan brick-burst
{const f0=FL_smash;FL_smash=function(def){const s=pl;const b0=s?s.bm:0;const r=f0.apply(this,arguments);try{if(s){s.bm=Math.min(100,s.bm+4);const g=s.bm-b0;B2K.log.smash.push(+g.toFixed(1));if(B2K.log.smash.length>60)B2K.log.smash.shift();
  if(g>=.5){B2K_pop('+'+Math.round(g)+' BOOST','#7ff3ff');B2K.pulse=1}const fx=Math.sin(RO.h),fz=Math.cos(RO.h),at=V3(RO.x+fx*3,RO.y+1.2,RO.z+fz*3);
  burst(SPARK,at,16,11,.45,new THREE.Color(.6,1.9,2.6));burst(SPARK,at,8,7,.4,new THREE.Color(2.6,2.2,.5))}}catch(e){}return r}}
// hide the HUD outside roam/race
setInterval(()=>{try{if(state!=='roam'&&state!=='race'&&B2K.el)B2K.el.classList.remove('on')}catch(e){}},250);
// ---- API (races + tests). Races read/write the same meter (pl.bm); see the message to the race worker.
window.B2K=window.__b2k={box:()=>B2K.tbox,st:()=>({dm:+B2K.dm.toFixed(1),bm:pl?+pl.bm.toFixed(1):0,bash:B2K.bash,bt:+B2K.bt.toFixed(2),req:B2K.req,tG:B2K.tG,tB:B2K.tB,turb:+B2K.turbS.toFixed(2),err:B2K.err||null}),log:B2K.log,
  add:(n,why)=>{if(!pl)return 0;const b0=pl.bm;pl.bm=clamp(pl.bm+n,0,100);if(why)B2K_pop(why,'#7ff3ff');B2K.pulse=1;return pl.bm-b0},
  bash:()=>B2K.bash,hop:()=>{const h=B2K.hopReq;B2K.hopReq=false;return h},drift:()=>B2K.dm};
// touch hint text: the DRIFT/HOP buttons are hidden on phones, so NPC/tutorial lines name the real gestures
{const f0=QA_untouchKeys;QA_untouchKeys=function(el){f0.apply(this,arguments);if(!el||!document.body.classList.contains('touch'))return;const w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let n;
  while((n=w.nextNode())){const t=n.nodeValue;if(t.indexOf('DRIFT')<0&&t.indexOf('HOP')<0)continue;const u=t.replace(/^DRIFT$/,'GAS+BRAKE').replace(/Hold DRIFT/g,'Hold GAS+BRAKE').replace(/^HOP$/,'HOP (swipe GAS ▲)').replace(/\bHOP button\b/g,'swipe up on GAS');if(u!==t)n.nodeValue=u}}}
