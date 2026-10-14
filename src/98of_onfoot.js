// ===== OF (v89a): ON FOOT P1 (docs/ON_FOOT_PLAN.md §4 P1). EXIT at a stop, the minifig steps out, the car stays parked; walk / run / jump with a
// floating left stick (touch) or WASD/arrows + Shift + Space (PC); camera behind; ENTER near your own car or any parked car (traffic cars with c.pk).
// State RO.foot: 'car' | 'exit' (0.35 s step-out) | 'walk' | 'enter' (0.45 s tween to the door). BRAKE (#tB) becomes 🚪 EXIT only once the car is
// stopped and idle, and 🚪 ENTER on foot near a car (hidden otherwise). On foot: ◀ ▶ DRIFT FIRE hidden, GAS = RUN, BOOST = JUMP (5 controls with ❚❚).
// Entering another car swaps bodies: the body you leave becomes a static parked group, the parked traffic car's instanced body is lifted into the
// player car (3 one-instance meshes, same geometry/material/tint), its pool slot is retired (dead = 1e9). Physics stay the player car's.
const OF={cyIn:0,cp:0,camT:9,steady:0,inA:null,hPrev:null,recen:false,cam:{id:null,x:0,y:0,t0:0,tap:0},st:'car',fig:null,x:0,z:0,y:0,h:0,vx:0,vz:0,vy:0,air:false,ph:0,spd:0,cy:0,camB:4.5,car:null,vs:[],taken:[],near:null,tw:null,idle:0,btn:'',
  stick:{id:null,on:false,x0:0,y0:0,dx:0,dy:0},keys:{},n:{exit:0,enter:0,swap:0,jack:0,stuckF:0,walkF:0,camIn:0},star:{n:0,t:0},jk:null,fl:null,cur:{own:true},figH:0,log:[]};
const OF_R=.35,OF_STEP=.45,OF_WALK=2,OF_RUN=5,OF_G=18,OF_JV=Math.sqrt(2*18*.9),OF_FIGH=1.8,OF_NEAR=1.7,OF_JV_MAX=7,OF_JREACH=3;
RO.foot='car';
// --- seated-driver hiding: GB_geo remembers the brick types so the 'drv*' triangles of the player's car can be collapsed while he is out
GB_geo=(f=>function(bricks,fig){const r=f(bricks,fig);const T=(bricks||[]).map(b=>b&&b.t);for(const g of[r&&r.m,r&&r.l])if(g)g.userData.bt=T;return r})(GB_geo);
const OF_DG=new WeakMap();
function OF_drvGeo(g){if(OF_DG.has(g))return OF_DG.get(g);const id=g.userData.bid,T=g.userData.bt;let out=null;
  if(id&&T&&T.some(t=>/^drv/.test(t||''))){const p=g.attributes.position;let n=0;const c=g.clone(),q=c.attributes.position;
    for(let t=0;t<id.length;t++){const b=id[t];if(b<0||!/^drv/.test(T[b]||''))continue;n++;for(let k=0;k<3;k++)q.setXYZ(t*3+k,0,-50,0)}if(n){q.needsUpdate=true;c.computeBoundingSphere();out=c}else c.dispose()}
  OF_DG.set(g,out);return out}
function OF_drv(root,show){if(!root)return;root.traverse(o=>{if(o.userData.ofSeat){o.visible=!!show;return}if(!o.isMesh||o.isInstancedMesh)return;const u=o.userData;
  if(show){if(u.ofG0){o.geometry=u.ofG0;u.ofG0=null}return}if(u.ofG0||!o.geometry||!o.geometry.userData)return;const h=OF_drvGeo(o.geometry);if(h){u.ofG0=o.geometry;o.geometry=h}})}
// --- the player minifig: GAR_fig standing pose split into body / 2 legs / 2 arms (5 meshes, swing pivots at hip and shoulders), scaled to 1.8 m
function OF_figBuild(){if(OF.fig)return OF.fig;OF.fig=OF_figMake(GB_figGet());OF.figH=OF.fig.h;return OF.fig}
function OF_figMake(spec,opt){const P=[],Q=[];GAR_fig(spec,P,Q,false);const parts={b:[],lL:[],lR:[],aL:[],aR:[]},bb=new THREE.Box3();
  for(const g of[...P,...Q]){g.computeBoundingBox();const B=g.boundingBox,cx=(B.min.x+B.max.x)/2,cy=(B.min.y+B.max.y)/2,dz=B.max.z-B.min.z;bb.union(B);
    if(B.max.y<=.37&&Math.abs(cx)>.005)parts[cx<0?'lL':'lR'].push(g);else if(Math.abs(cx)>.17&&cy>.45&&cy<.86&&dz>.02)parts[cx<0?'aL':'aR'].push(g);else parts.b.push(g)}
  const s=OF_FIGH/(bb.max.y-Math.min(0,bb.min.y)),grp=new THREE.Group(),inner=new THREE.Group();inner.scale.setScalar(s);grp.add(inner);
  const piv={b:[0,0,0],lL:[0,.36,0],lR:[0,.36,0],aL:[-.215,.8,0],aR:[.215,.8,0]},M={};
  if(opt&&opt.armsUp)for(const k of['aL','aR']){const p=piv[k];for(const g of parts[k]){g.translate(-p[0],-p[1],-p[2]);g.rotateX(-2.5);g.rotateZ(k==='aL'?.35:-.35);g.translate(p[0],p[1],p[2]);parts.b.push(g)}parts[k]=[]}
  for(const k in parts){if(!parts[k].length)continue;const g=mergeGeometries(parts[k].map(q=>{q=q.index?q.toNonIndexed():q;for(const a of Object.keys(q.attributes))if(a!=='position'&&a!=='normal'&&a!=='color')q.deleteAttribute(a);return q}));
    const p=piv[k];g.translate(-p[0],-p[1],-p[2]);const m=new THREE.Mesh(g,GB_MAT);m.position.set(p[0],p[1],p[2]);m.castShadow=false;m.receiveShadow=false;inner.add(m);M[k]=m}
  grp.userData.qaFig=1;grp.userData.of=1;grp.visible=false;return{g:grp,M,s,h:+(s*(bb.max.y-Math.min(0,bb.min.y))).toFixed(3)}}
function OF_figPose(dt){const F=OF.fig;if(!F)return;F.g.position.set(OF.x,OF.y,OF.z);F.g.rotation.y=OF.h+Math.PI;
  const v=OF.air?0:OF.spd,str=.8+.7*clamp((v-OF_WALK)/(OF_RUN-OF_WALK),0,1),hz=v/str,Lg=.36*F.s,amp=clamp(str/(6.283*Lg),.2,.8);OF.ph+=dt*hz*6.283;OF.footV=Lg*amp*hz*6.283;
  OF.legA=(OF.legA||0)+((v>.15?amp:0)-(OF.legA||0))*Math.min(1,dt*10);const k=Math.min(1,v/OF_WALK);const a=OF.air?.5:Math.sin(OF.ph)*OF.legA,M=F.M;if(M.lL)M.lL.rotation.x=a;if(M.lR)M.lR.rotation.x=-a;if(M.aL)M.aL.rotation.x=-a*.9-(OF.air?.9:0);if(M.aR)M.aR.rotation.x=a*.9-(OF.air?.9:0);
  if(M.b)M.b.position.y=OF.air?0:Math.abs(Math.sin(OF.ph))*.02*k}
// --- cars around the walker: the parked current body, static parked bodies, parked traffic (pk) — and moving traffic as obstacles
const OF_cH=c=>{const N=HUB.nodes,A=N[c.a],B=N[c.b];if(!A||!B)return 0;return Math.atan2(B.x-A.x,B.z-A.z)};
const OF_box=(x,z,h,hw=1.02,hd=2.35)=>({x,z,hw,hd,c:Math.cos(h),s:Math.sin(h),h:999});
function OF_cars(withTraffic){const L=[];if(OF.car)L.push({k:'cur',x:OF.car.x,z:OF.car.z,y:OF.car.y,h:OF.car.h,hw:OF.car.hw,hd:OF.car.hd,ref:OF.car});for(const v of OF.vs)L.push({k:'grp',x:v.x,z:v.z,y:v.y,h:v.h,hw:v.hw,hd:v.hd,ref:v});
  if(withTraffic&&HUB.cars)for(const c of HUB.cars){if(c.dead>0||c.x==null)continue;const dx=c.x-OF.x,dz=c.z-OF.z;if(dx*dx+dz*dz>30*30)continue;// v89f: scooters / trolleybuses get their own size (was a 2 × 4.7 m car box: a stopped Athens scooter walled off the lane and the walker never reached the car behind it)
    const dm=OF_cdim(c.k);L.push({k:c.pk&&!(c.cv>.3)?'park':'traf',x:c.x,z:c.z,y:c.y||0,h:OF_cH(c),hw:dm?dm[0]:undefined,hd:dm?dm[1]:undefined,ref:c})}return L}
// foot-2: the walker's box of a traffic / parked ride = the bounding box of its REAL model (HUB.cim[k]): a delivery truck is 6.2 m long, a bus 12 m, not the 4.7 m car box
function OF_cdim(k){const m=HUB.cim&&HUB.cim[k];if(m&&m.geometry){const g=m.geometry;if(!g.boundingBox)g.computeBoundingBox();const b=g.boundingBox,w=(b.max.x-b.min.x)/2,l=(b.max.z-b.min.z)/2;if(w>.3&&l>.5)return[w,l]}return typeof OB_cdim==='function'?OB_cdim(k):null}
function OF_edge(o){const b=OF_box(o.x,o.z,o.h,o.hw,o.hd),dx=OF.x-b.x,dz=OF.z-b.z,lx=dx*b.c-dz*b.s,lz=dx*b.s+dz*b.c,ex=Math.max(0,Math.abs(lx)-b.hw),ez=Math.max(0,Math.abs(lz)-b.hd);return Math.hypot(ex,ez)}
function OF_nearCar(){let best=null,bd=OF_NEAR;for(const o of OF_cars(true)){if(Math.abs((o.y||0)-OF.y)>2.5)continue;let d=OF_edge(o);
  if(o.k==='traf'){if(o.ref.tr||o.ref.route||o.ref.crW||HCAR[o.ref.k][0]==='#'||(o.ref.cv||0)>OF_JV_MAX)continue;d-=OF_JREACH-OF_NEAR}if(d<bd){bd=d;best=o}}return best}
// --- touch: floating stick in the left 40 %, button relabels
function OF_dom(){if(OF.dom)return OF.dom;const T=$('#touch');if(!T)return null;const z=document.createElement('div');z.id='ofZone';z.innerHTML='<div id="ofRing"><i></i></div><div id="ofHint">DRAG TO WALK</div>';T.insertBefore(z,T.firstChild);const cz=document.createElement('div');cz.id='ofCam';T.insertBefore(cz,T.firstChild);
  const st=document.createElement('style');st.id='ofCss';st.textContent=`#ofZone{position:absolute;left:0;top:18%;width:40%;bottom:0;display:none;touch-action:none;z-index:1;pointer-events:auto}
#ofCam{position:absolute;left:40%;right:0;top:12%;bottom:0;display:none;touch-action:none;z-index:0;pointer-events:auto}body.onfoot #ofZone,body.onfoot #ofCam{display:block}#ofRing{position:absolute;width:140px;height:140px;margin:-70px 0 0 -70px;border-radius:50%;border:3px solid rgba(255,255,255,.55);background:rgba(10,14,30,.22);pointer-events:none;opacity:.55}
#ofZone.on #ofRing{opacity:1}#ofRing i{position:absolute;left:50%;top:50%;width:56px;height:56px;margin:-28px 0 0 -28px;border-radius:50%;background:rgba(255,255,255,.85);box-shadow:0 2px 8px rgba(0,0,0,.4)}
#ofHint{position:absolute;font:800 12px system-ui;letter-spacing:.06em;color:#fff;text-shadow:0 1px 3px #000;transform:translate(-50%,0);pointer-events:none;white-space:nowrap}#ofZone.used #ofHint{display:none}
body.onfoot #btnZone,body.onfoot #steerZone,body.onfoot #tD,body.onfoot #tF,body.onfoot #tW,body.onfoot #roamVeh,body.onfoot #roamHorn{display:none!important}
body.onfoot #tN::after,body.onfoot #tG::before{display:none!important}body.onfoot #tN{background:#183a5c!important;color:#fff!important;font-size:13px!important}body.onfoot #tG{font-size:13px!important}
body.onfoot #roamGauge small{font-size:12px!important}#tB.ofDoor{background:linear-gradient(#ffd12c,#f0a400)!important;color:#1b1d22!important;font-weight:900;font-size:13px!important;border-color:#fff!important}#tB.ofHide{display:none!important}`;document.head.appendChild(st);
  const R=z.querySelector('#ofRing'),K=R.querySelector('i'),H=z.querySelector('#ofHint'),S=OF.stick;
  const home=()=>{const r=z.getBoundingClientRect();if(!r.width)return;S.x0=Math.min(130,r.width*.45);S.y0=r.height-Math.min(90,r.height*.3);R.style.left=S.x0+'px';R.style.top=S.y0+'px';H.style.left=S.x0+'px';H.style.top=(S.y0+76)+'px';K.style.transform=''};
  const set=(cx,cy)=>{let dx=cx-S.x0,dy=cy-S.y0;const l=Math.hypot(dx,dy);if(l>70){dx*=70/l;dy*=70/l}S.dx=dx/70;S.dy=-dy/70;K.style.transform=`translate(${dx}px,${dy}px)`};
  const start=(id,x,y)=>{if(S.id!=null)return;AU.init();TOUCH.on=TOUCH.used=true;const r=z.getBoundingClientRect();S.id=id;S.on=true;S.x0=clamp(x-r.left,60,r.width-20);S.y0=clamp(y-r.top,60,r.height-40);R.style.left=S.x0+'px';R.style.top=S.y0+'px';S.dx=S.dy=0;K.style.transform='';z.classList.add('on','used')};
  const mv=(id,x,y)=>{if(id!==S.id)return;const r=z.getBoundingClientRect();set(x-r.left,y-r.top)};
  const end=id=>{if(id!==S.id)return;S.id=null;S.on=false;S.dx=S.dy=0;z.classList.remove('on');home()};
  z.addEventListener('touchstart',e=>{e.preventDefault();const t=e.changedTouches[0];start('t'+t.identifier,t.clientX,t.clientY)},{passive:false});
  z.addEventListener('touchmove',e=>{e.preventDefault();for(const t of e.changedTouches)mv('t'+t.identifier,t.clientX,t.clientY)},{passive:false});
  const te=e=>{for(const t of e.changedTouches)end('t'+t.identifier)};z.addEventListener('touchend',te);z.addEventListener('touchcancel',te);
  z.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')return;try{z.setPointerCapture(e.pointerId)}catch(_){}start('p'+e.pointerId,e.clientX,e.clientY)});
  z.addEventListener('pointermove',e=>{if(e.pointerType!=='touch')mv('p'+e.pointerId,e.clientX,e.clientY)});const pe=e=>{if(e.pointerType!=='touch')end('p'+e.pointerId)};z.addEventListener('pointerup',pe);z.addEventListener('pointercancel',pe);
  addEventListener('resize',()=>{if(S.id==null)setTimeout(home,50);setTimeout(()=>{const B=$('#tB');if(B)OF_doorPlace(B,B.classList.contains('ofDoor'))},80)});
  // BRAKE slot: in door mode a fresh press is EXIT / ENTER (claimed before the BRAKE handlers; no brake, no PARK double-tap)
  const B=$('#tB');const door=e=>{if(!B||!B.classList.contains('ofDoor'))return;if(e.type==='pointerdown'&&e.pointerType==='mouse'&&!e.isTrusted)return;e.preventDefault();e.stopImmediatePropagation();
    const n=performance.now();if(n-(OF.dT||-1e9)<350)return;OF.dT=n;AU.init();OF_door()};
  if(B)for(const ev of['touchstart','pointerdown','mousedown'])B.addEventListener(ev,door,{capture:true,passive:false});
  {const Nb=$('#tN');if(Nb)for(const ev of['touchstart','pointerdown'])Nb.addEventListener(ev,()=>{if(RO.foot==='walk')OF.jQ=.2},{capture:true,passive:true})}  // JUMP tap buffered (foot-1)
  OF_camDom(cz);
  OF.dom={z,R,K,H,home};setTimeout(home,0);return OF.dom}
let OF_lbl0=null;
// the door button sits left of BOOST/JUMP (#tN), vertically centred on it, ≥ 12 px from #tN and #tG (BRAKE's own spot touches GAS on phones)
function OF_doorPlace(B,on){const P=['left','top','right','bottom','transform'];if(!on){for(const k of P)B.style.removeProperty(k);OF.doorGap=null;return}
  for(const k of P)B.style.removeProperty(k);const N=$('#tN'),G=$('#tG');if(!N||!N.offsetWidth)return;const n=N.getBoundingClientRect(),b=B.getBoundingClientRect(),par=(B.offsetParent||document.body).getBoundingClientRect();
  let x=n.left-b.width-14,y=n.top+(n.height-b.height)/2;if(G&&G.offsetWidth){const g=G.getBoundingClientRect();if(x+b.width>g.left-12&&y+b.height>g.top-12)y=Math.min(y,g.top-12-b.height)}y=Math.max(par.top+60,y);
  B.style.setProperty('left',(x-par.left)+'px','important');B.style.setProperty('top',(y-par.top)+'px','important');B.style.setProperty('right','auto','important');B.style.setProperty('bottom','auto','important');B.style.setProperty('transform','none','important');
  const r=B.getBoundingClientRect(),gap=e=>{if(!e||!e.offsetWidth)return 999;const q=e.getBoundingClientRect();return Math.round(Math.max(q.left-r.right,r.left-q.right,q.top-r.bottom,r.top-q.bottom))};OF.doorGap={n:gap(N),g:gap(G)}}
function OF_btns(){const B=$('#tB'),G=$('#tG'),N=$('#tN');if(!B)return;if(!OF_lbl0)OF_lbl0={g:G&&G.innerHTML,n:N&&N.innerHTML};
  const foot=RO.foot!=='car';document.body.classList.toggle('onfoot',foot);let want;
  if(foot){const a=RO.foot==='walk'&&OF.act;want=!a?'hide':a.k==='traf'?'take':a.k==='car'?'enter':a.k}else want=OF_canExit()?'exit':'brake';
  if(want!==OF.btn){OF.btn=want;const door=want!=='hide'&&want!=='brake';B.classList.toggle('ofDoor',door);B.classList.toggle('ofHide',want==='hide');
    if(want==='exit')B.textContent='🚪 EXIT';else if(want==='enter')B.textContent='🚪 ENTER';else if(want==='take')B.textContent='🚗 TAKE';else if(want==='npc')B.textContent='👋 HI';else if(want==='bench')B.textContent='🪑 SIT';else if(want==='mission')B.textContent='📋 TALK';else B.textContent=TOUCH.park?'GO ▶':'BRAKE';OF_doorPlace(B,door)}
  if(foot!==!!OF.lblFoot){OF.lblFoot=foot;if(G)G.innerHTML=foot?'RUN':OF_lbl0.g;if(N)N.innerHTML=foot?'JUMP':OF_lbl0.n;const u=document.querySelector('#roamGauge small');if(u)u.textContent=foot?'ON FOOT':'KM/H';if(foot&&OF.dom)requestAnimationFrame(()=>OF.dom.home())}}
// EXIT is offered only when the car is stopped and idle (no gas/brake held for 0.5 s), on the ground, not in a cutscene/menu/event, not a boat
function OF_canExit(){if(state!=='roam'||!RO.on||RO.frozen||RO.wk||!pl||pl.air||RO.sp||RO.card||RO.mapOpen||RO.story)return false;if(typeof M1!=='undefined'&&M1.cs)return false;
  if(pl.boatMode||(pl.vmode&&pl.vmode!=='car'&&pl.vmode!=='4x4'))return false;if(TOUCH.park)return Math.abs(RO.v)<2.2;return Math.abs(RO.v)<2.2&&OF.idle>.5}
function OF_door(){if(RO.foot==='car'){if(OF_canExit())OF_exit()}else if(RO.foot==='walk')OF_use(OF.act)}
// --- EXIT: car stops, driver hidden, minifig at the driver's door (left), else right, else behind
// half extents of the driven body in its own frame (metres), clamped to car-like sizes
function OF_ext(){try{const ud=pl.mesh.userData;pl.mesh.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(ud.m.matrixWorld).invert(),B=new THREE.Box3(),b=new THREE.Box3(),m=new THREE.Matrix4(),sc=new THREE.Vector3();ud.m.getWorldScale(sc);
  ud.m.traverseVisible(o=>{if(!o.isMesh||!o.geometry||(o.material&&o.material.transparent))return;if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();m.multiplyMatrices(inv,o.matrixWorld);if(o.isInstancedMesh){const k=new THREE.Matrix4();o.getMatrixAt(0,k);m.multiply(k)}b.copy(o.geometry.boundingBox).applyMatrix4(m);B.union(b)});
  if(B.isEmpty())return{};return{hw:clamp(Math.max(-B.min.x,B.max.x)*sc.x,.8,1.5),hd:clamp(Math.max(-B.min.z,B.max.z)*sc.z,1.8,3.3)}}catch(e){return{}}}
function OF_exit(){const F=OF_figBuild();if(!F.g.parent)HUB.grp.add(F.g);const h=RO.h,fx=Math.sin(h),fz=Math.cos(h),rx=-fz,rz=fx;
  if(TOUCH.park)try{parkSet(false)}catch(e){}OF.car=Object.assign({x:RO.x,z:RO.z,y:RO.y,h,own:OF.cur.own},OF_ext());RO.v=0;RO.vy=0;TOUCH.gas=TOUCH.brake=TOUCH.boost=TOUCH.hb=false;
  let px=RO.x-rx*1.75,pz=RO.z-rz*1.75;const ok=(x,z)=>!roamHit(x,z,OF_R,RO.y+1)&&!(CID==='fra'&&inRiver(x,z))&&Math.abs(groundAt(x,z,RO.y+1)-RO.y)<1.2;
  if(!ok(px,pz)){px=RO.x+rx*1.75;pz=RO.z+rz*1.75}if(!ok(px,pz)){px=RO.x-fx*3.4;pz=RO.z-fz*3.4}
  OF.x=RO.x-rx*.6;OF.z=RO.z-rz*.6;OF.y=groundAt(OF.x,OF.z,RO.y+1);OF.h=h-Math.PI/2;OF.vx=OF.vz=OF.vy=0;OF.spd=0;OF.air=false;
  OF.tw={t:0,d:.35,x0:OF.x,z0:OF.z,x1:px,z1:pz,h1:h-Math.PI/2};OF_drv(pl.mesh,false);F.g.visible=true;RO.foot='exit';OF.cy=OF.cyIn=h;OF.cp=0;OF.camT=9;OF.steady=0;OF.inA=null;OF.recen=false;OF.camB=4.5;OF.n.exit++;
  if(AU.engine)AU.engine(pl,0,false);if(AU.scrape)AU.scrape(false);AU.sfx&&AU.sfx('pick');OF.log.push('exit@'+Math.round(RO.x)+','+Math.round(RO.z));OF_btns()}
// --- ENTER: tween to the door, then (own body) restore or (other car) swap bodies
function OF_enter(o){if(o.k==='traf')return OF_jack(o);const fx=Math.sin(o.h),fz=Math.cos(o.h),rx=-fz,rz=fx,dx=o.x-rx*1.4,dz=o.z-rz*1.4;
  OF.tw={t:0,d:.45,x0:OF.x,z0:OF.z,x1:dx,z1:dz,h1:Math.atan2(o.x-dx,o.z-dz),o};RO.foot='enter';OF.stick.dx=OF.stick.dy=0;OF_btns()}
const OF_noW=new THREE.Group();OF_noW.visible=false;
function OF_bodyKids(ud){const keep=new Set([...(ud.ribbons||[]),...(ud.flares||[])]);return ud.m.children.filter(c=>!keep.has(c))}
function OF_poseCar(x,z,y,h){RO.x=x;RO.z=z;RO.y=y;RO.h=RO.vh=h;RO.v=0;RO.vy=0;if(pl){pl.air=false;pl.mesh.position.set(x,y,z);try{roamPose(pl,1/60)}catch(e){}pl.mesh.updateMatrixWorld(true)}}
function OF_finishEnter(o){const ud=pl.mesh.userData;
  if(o.k!=='cur'){// park the body we are leaving as a static group at its current world pose
    pl.mesh.updateMatrixWorld(true);const S=new THREE.Group();S.matrixAutoUpdate=false;S.matrix.copy(ud.m.matrixWorld);S.matrixWorldNeedsUpdate=true;for(const c of OF_bodyKids(ud))S.add(c);
    S.userData.of=1;HUB.grp.add(S);const st={g:S,x:OF.car.x,z:OF.car.z,y:OF.car.y,h:OF.car.h,hw:OF.car.hw,hd:OF.car.hd,own:OF.cur.own,wheels:ud.wheels,inst:OF.cur.inst||null,lowL:OF.cur.lowL};if(OF.cur.own)ud.wheels=OF_noW;OF.vs.push(st);
    // a kerb-parked traffic car is driven off from the lane next to it (1.6 m towards the road centre) so its kerb trees/lamps don't pin the car
    let sx=0,sz=0;if(o.k==='park'){const dx=Math.sin(o.h),dz=Math.cos(o.h);for(const k of[1.6,1.1,.6,0]){if(!roamHit(o.x+dz*k,o.z-dx*k,2,groundY(o.x,o.z)+.5)){sx=dz*k;sz=-dx*k;break}}}
    OF_poseCar(o.x+sx,o.z+sz,o.k==='park'?groundY(o.x+sx,o.z+sz):o.y,o.h);const inv=new THREE.Matrix4().copy(ud.m.matrixWorld).invert(),m4=new THREE.Matrix4();
    if(o.k==='grp'){const G=o.ref;OF.cur={own:G.own,inst:G.inst,lowL:G.lowL};G.g.updateMatrixWorld(true);for(const c of[...G.g.children]){c.updateMatrix();m4.multiplyMatrices(G.g.matrixWorld,c.matrix);m4.premultiply(inv);m4.decompose(c.position,c.quaternion,c.scale);ud.m.add(c)}
      HUB.grp.remove(G.g);OF.vs.splice(OF.vs.indexOf(G),1);if(G.own){ud.wheels=G.wheels}}
    else{const c=o.ref,im=HUB.cim[c.k];im.updateMatrixWorld(true);const body=[],bx=new THREE.Box3();let lo=1e9;
      // tyres on the road: the lowest point of the parked body (wheels) is put exactly on the ground under the car
      for(const src of[im,im.userData.w]){if(!src)continue;if(!src.geometry.boundingBox)src.geometry.computeBoundingBox();src.getMatrixAt(c.j,m4);m4.premultiply(src.matrixWorld);bx.copy(src.geometry.boundingBox).applyMatrix4(m4);lo=Math.min(lo,bx.min.y)}
      const T=new THREE.Matrix4().makeTranslation(sx,lo<1e8?RO.y-lo:0,sz);
      for(const src of[im,im.userData.w,im.userData.g]){if(!src)continue;const one=new THREE.InstancedMesh(src.geometry,src.material,1);src.getMatrixAt(c.j,m4);m4.premultiply(src.matrixWorld).premultiply(T).premultiply(inv);one.setMatrixAt(0,m4);
        if(src.instanceColor){const col=new THREE.Color();src.getColorAt(c.j,col);one.setColorAt(0,col)}one.frustumCulled=false;one.renderOrder=src.renderOrder;one.castShadow=src.castShadow;one.receiveShadow=src.receiveShadow;one.userData.of=1;ud.m.add(one);body.push(one)}
      if(c.pk){c.v=c.pv||c.v||16;c.lane=.36}c.dead=20;c.pk=0;c.hitT=0;c.ofJ=0;c.ofW=0;OF.taken.push(c);
      // lowest tyre point in the body's local frame (ud.m): kept on the road every frame by OF_lift (CR_carPose only grounds real wheel meshes)
      const lb=new THREE.Box3();let lowL=1e9;for(const q of body.slice(0,2)){if(!q.geometry.boundingBox)q.geometry.computeBoundingBox();q.getMatrixAt(0,m4);lb.copy(q.geometry.boundingBox).applyMatrix4(m4);lowL=Math.min(lowL,lb.min.y)}
      const wb=new THREE.Box3();if(body[1]){body[1].getMatrixAt(0,m4);wb.copy(body[1].geometry.boundingBox).applyMatrix4(m4)}
      OF.cur={own:false,inst:body,lowL,wb:wb.isEmpty()?null:wb};OF.n.swap++;try{OF_bcBody(ud,body)}catch(e){console.warn('OF bc',e)}try{OF_seat(ud,body)}catch(e){console.warn('OF seat',e)}}}
  else OF_poseCar(OF.car.x,OF.car.z,OF.car.y,OF.car.h);
  OF_drv(pl.mesh,true);OF.car=null;if(OF.fig)OF.fig.g.visible=false;RO.foot='car';OF.idle=0;camSnap=true;OF.n.enter++;TOUCH.gas=TOUCH.brake=TOUCH.boost=false;
  // far static bodies are dropped (borrowed ones only; your own car always stays where you left it)
  for(const v of[...OF.vs])if(!v.own&&Math.hypot(v.x-RO.x,v.z-RO.z)>300){HUB.grp.remove(v.g);OF.vs.splice(OF.vs.indexOf(v),1)}
  AU.sfx&&AU.sfx('go');OF.log.push('enter:'+o.k+'@'+Math.round(RO.x)+','+Math.round(RO.z));OF_btns()}
// --- walking physics: camera-relative stick, accel 20 m/s², turn 720°/s, buildings (roamHit + bldPush), cars (oriented boxes), props, kerbs ≤ 0.45 m
function OF_input(){const S=OF.stick;let fx=0,fy=0,run=false,jump=false;
  let mag=0;if(S.on){const l=Math.hypot(S.dx,S.dy);if(l>.1){mag=Math.min(1,(l-.1)/.9);fx=S.dx/l*mag;fy=S.dy/l*mag}}
  else{const kx=(K.KeyD||K.ArrowRight?1:0)-(K.KeyA||K.ArrowLeft?1:0),ky=(K.KeyW||K.ArrowUp?1:0)-(K.KeyS||K.ArrowDown?1:0),l=Math.hypot(kx,ky);if(l){fx=kx/l;fy=ky/l;mag=.5}run=!!(K.ShiftLeft||K.ShiftRight)}
  if(TOUCH.gas)run=true;jump=!!(TOUCH.boost||K.Space)||OF.jQ>0;return{fx,fy,run,jump,mag}}
// foot-1: speed from stick travel, continuous: half stick = walk (2 m/s), full = run (5 m/s), RUN / Shift = run at any travel; keys = walk
function OF_tv(I){if(I.mag<=0)return 0;if(I.run)return OF_RUN;const m=I.mag;return m<=.5?OF_WALK*(.45+.55*m/.5):OF_WALK+(OF_RUN-OF_WALK)*Math.pow((m-.5)/.5,1.3)}
// foot-2: a prop blocks the walker with its real footprint (oriented box from the model's bounding box: a 11 m fence, a 4.6 m parked car, a bench, a stall, a container),
// not a ≤ 1.1 m circle. Poles / trunks / overhead things / tiny things keep a round collider; pigeons none. Cached per type.
const OF_PF_RND=/^(tree|tree2|tree3|CE_pine|CE_olive|CE_cypress|lamp|post|sign|tlight|clight|lights|awning|parasol|CE_pigeon)$/;
function OF_pf(t,d){const C=OF.pfc||(OF.pfc={});let f=C[t];if(f&&f.d===d)return f;f={d};
  if(OF_PF_RND.test(t))f.r=t==='CE_pigeon'?0:Math.max(.15,Math.min(1.1,d.r*.45));
  else{let b=null;try{d.g.computeBoundingBox();b=d.g.boundingBox}catch(e){}if(!b)f.r=Math.max(.15,Math.min(1.1,d.r*.45));
    else{f.hw=Math.max(.2,(b.max.x-b.min.x)/2);f.hd=Math.max(.2,(b.max.z-b.min.z)/2);f.ox=(b.max.x+b.min.x)/2;f.oz=(b.max.z+b.min.z)/2}}
  return C[t]=f}
// foot-2 GO: 📍 spawns ONLY the requirement. 'patch' = standing on the nearest dirt/sand patch; 'car' / 'fence' = 5 m in front of the nearest parked car / fence, facing it (hold forward: you stop at the body)
function OF_surfGo(kind){if(state!=='roam'||!RO.on)return'📍 Start free roam first';try{LF_ensure(RO.x,RO.z,900)}catch(e){}
  let best=null,bd=1e9;const d2=(x,z)=>(x-RO.x)**2+(z-RO.z)**2;
  if(kind==='patch'){for(const A of LF.PG.values())for(const q of A)if(q.sx>=3&&d2(q.x,q.z)<bd){bd=d2(q.x,q.z);best=q}if(!best)return'📍 No patch near';
    if(!OF_spawn({cx:best.x-6,cz:best.z-6,h:.8},best.x,best.z,.8))return'📍 Can\'t jump right now';return'📍 PATCH · you stand on the sand/dirt patch: feet on its top (no half-buried legs). Walk across it and off it'}
  const re=kind==='fence'?/^fence$/:/^(car\d?|CE_car\d?)$/;for(const L of HUB.pgrid.values())for(const q of L)if(q.alive&&re.test(q.t)&&d2(q.x,q.z)<bd){bd=d2(q.x,q.z);best=q}
  if(!best)return'📍 No '+kind+' near';const a=best.ry+Math.PI/2,x=best.x+Math.sin(a)*6,z=best.z+Math.cos(a)*6;
  if(!OF_spawn({cx:x-3,cz:z-3,h:0},x,z,Math.atan2(best.x-x,best.z-z)))return'📍 Can\'t jump right now';return'📍 '+kind.toUpperCase()+' · hold forward: you stop AT it (no walking through), slide along it when you steer'}
function OF_collide(x,z,y){for(let pass=0;pass<2;pass++){const x0=x,z0=z;[x,z]=OF_collide1(x,z,y);if(Math.abs(x-x0)+Math.abs(z-z0)<1e-4)break}return[x,z]}
function OF_collide1(x,z,y){for(let it=0;it<4;it++){const b=roamHit(x,z,OF_R,y+1);if(!b)break;const p=bldPush(b,x,z,OF_R);x=p[0];z=p[1]}
  for(const o of OF_cars(true)){if(Math.abs((o.y||0)-y)>2)continue;const b=OF_box(o.x,o.z,o.h,o.hw,o.hd);if(bHit(b,x,z,OF_R)){const p=bldPush(b,x,z,OF_R);x=p[0];z=p[1]}}
  const PG=HUB.pgrid,D=HUB.ptypes;if(PG&&D){const kx=Math.floor(x/16),kz=Math.floor(z/16);for(let a=-1;a<=1;a++)for(let c=-1;c<=1;c++){const L=PG.get((kx+a)*10000+kz+c);if(!L)continue;
    for(const p of L){if(!p.alive)continue;const d=D[p.t];if(!d||Math.abs((p.y||0)-y)>2)continue;const f=OF_pf(p.t,d);
      if(f.r!=null){if(f.r>0){const r=f.r+OF_R,dx=x-p.x,dz=z-p.z,l=Math.hypot(dx,dz);if(l<r&&l>1e-4){x=p.x+dx/l*r;z=p.z+dz/l*r}}}
      else{const cy=Math.cos(p.ry||0),sy=Math.sin(p.ry||0),b={x:p.x+cy*f.ox+sy*f.oz,z:p.z-sy*f.ox+cy*f.oz,hw:f.hw,hd:f.hd,c:cy,s:sy};if(bHit(b,x,z,OF_R)){const q=bldPush(b,x,z,OF_R);x=q[0];z=q[1]}}}}}
  return[x,z]}
function OF_walk(dt){const I=OF_input(),il=Math.hypot(I.fx,I.fy),ia=Math.atan2(I.fx,I.fy);
  // v89b1: the stick's frame is the camera yaw, frozen while the stick direction is held (an auto-recentre never steers the walker = no "rounds"); follows a manual orbit
  if(il<.05||OF.camT<.05||OF.inA==null||Math.abs(angDiff(ia,OF.inA))>.35){OF.cyIn=OF.cy;OF.inA=il<.05?null:ia}
  const cy=OF.cyIn,fw=[Math.sin(cy),Math.cos(cy)],rt=[-Math.cos(cy),Math.sin(cy)];
  const wx=fw[0]*I.fy+rt[0]*I.fx,wz=fw[1]*I.fy+rt[1]*I.fx,m=Math.min(1,Math.hypot(wx,wz)),tv=OF_tv(I);
  const tx=m>1e-3?wx/Math.hypot(wx,wz)*tv:0,tz=m>1e-3?wz/Math.hypot(wx,wz)*tv:0,ax=tx-OF.vx,az=tz-OF.vz,al=Math.hypot(ax,az),amax=20*dt*(OF.air?.35:1);
  if(al>amax){OF.vx+=ax/al*amax;OF.vz+=az/al*amax}else{OF.vx=tx;OF.vz=tz}
  OF.spd=Math.hypot(OF.vx,OF.vz);if(OF.spd>.2){const want=Math.atan2(OF.vx,OF.vz),e=angDiff(want,OF.h),k=Math.min(Math.abs(e),12.57*dt);OF.h+=Math.sign(e)*k}
  OF.jQ=Math.max(0,(OF.jQ||0)-dt);if(I.jump&&!OF.air&&(!OF.jHeld||OF.jQ>0)){OF.vy=OF_JV;OF.air=true;OF.jQ=0;AU.sfx&&AU.sfx('pick')}OF.jHeld=!!(TOUCH.boost||K.Space);
  let nx=OF.x+OF.vx*dt,nz=OF.z+OF.vz*dt;const g1=groundAt(nx,nz,OF.y+OF_STEP+.05);
  let why='';if(g1>OF.y+OF_STEP||(CID==='fra'&&inRiver(nx,nz)&&g1<=HWY+.3)){nx=OF.x;nz=OF.z;why=g1>OF.y+OF_STEP?'step'+(g1-OF.y).toFixed(2):'river'}
  [nx,nz]=OF_collide(nx,nz,OF.y);if(roamHit(nx,nz,OF_R*.6,OF.y+1)){nx=OF.x;nz=OF.z}
  const moved=Math.hypot(nx-OF.x,nz-OF.z);if(m>.3&&moved<tv*dt*.25){OF.n.stuckF++;if((OF.stk||(OF.stk=[])).length<12&&OF.n.stuckF%10===1)OF.stk.push([Math.round(OF.x),Math.round(OF.z),why||(roamHit(OF.x,OF.z,OF_R+.1,OF.y+1)?'bld':'car/prop')])}if(m>.3)OF.n.walkF++;
  OF.x=nx;OF.z=nz;const g=groundAt(OF.x,OF.z,OF.y+OF_STEP+.05);
  if(OF.air||OF.y>g+.05){OF.vy-=OF_G*dt;OF.y+=OF.vy*dt;if(OF.y<=g){OF.y=g;OF.vy=0;OF.air=false}else OF.air=true}else{OF.y=g;OF.vy=0}
  if(Math.hypot(OF.vx,OF.vz)>0)OF.spd=moved/Math.max(dt,1e-4)}
function OF_step(dt){if(!pl)return;dt=Math.min(dt,.05);const T0=OF.tw;
  OF_fleeStep(dt);OF_starStep(dt);if(RO.foot==='jack'){if(OF_jackStep(dt))return}
  else if(RO.foot==='exit'||RO.foot==='enter'){T0.t+=dt;const k=Math.min(1,T0.t/T0.d),e=k*k*(3-2*k);OF.x=T0.x0+(T0.x1-T0.x0)*e;OF.z=T0.z0+(T0.z1-T0.z0)*e;OF.y=groundAt(OF.x,OF.z,OF.y+1);OF.h+=angDiff(T0.h1,OF.h)*Math.min(1,dt*12);OF.spd=OF_WALK;
    if(k>=1){if(RO.foot==='exit'){RO.foot='walk';OF.spd=0}else{OF_finishEnter(T0.o);return}}}
  else OF_walk(dt);
  // the world follows the walker (culling, peds, traffic braking, minimap); the parked car stays where it is
  RO.x=OF.x;RO.z=OF.z;RO.y=OF.y;RO.h=RO.vh=OF.h;RO.v=0;RO.vy=0;
  if(OF.car&&pl)pl.mesh.position.set(OF.car.x,OF.car.py??OF.car.y,OF.car.z);
  OF.near=RO.foot==='walk'?OF_nearCar():null;
  // a traffic car you can TAKE brakes and waits while you are within reach (resumes 0.4 s after you step away)
  if(OF.near&&OF.near.k==='traf')OF.near.ref.hitT=Math.max(OF.near.ref.hitT||0,.4);OF_figPose(dt);
  if(AU.engine)AU.engine(pl,0,false);if(AU.scrape)AU.scrape(false);
  try{hubTrafficStep(dt)}catch(e){if(!OF.e1){OF.e1=1;console.warn('OF traffic',e)}}try{studFXStep(dt)}catch(e){}try{roamHud()}catch(e){}
  try{const s=$('#rgSpd');if(s)s.textContent='🚶'}catch(e){}OF_btns()}
// --- foot camera: 4.5 m back, OF_CAMH up (cam-1: 2.9, was 2.2: the ray to the pavement 10 m ahead passed through the minifig's head),
const OF_CAMH=2.9;
// yaw follows the walking direction (not when walking towards the camera), pulled in before walls
function OF_cam(dt){if(OF.car&&pl)pl.mesh.position.set(OF.car.x,OF.car.py??OF.car.y,OF.car.z);
  OF_camYaw(dt);
  const fx=Math.sin(OF.cy),fz=Math.cos(OF.cy),hy=OF.y+OF_CAMH+Math.sin(OF.cp)*4.2;const PC=OF_cars(false).map(o=>OF_box(o.x,o.z,o.h,o.hw,o.hd));let back=4.5,carUp=0;for(let d=.3;d<=4.8;d+=.3){const x=OF.x-fx*d,z=OF.z-fz*d;if(roamHit(x,z,.35,hy)){back=Math.max(.25,d-.5);break}if(!carUp&&PC.some(b=>bHit(b,x,z,.3)))carUp=1}
  OF.camB=back<OF.camB?back:OF.camB+(back-OF.camB)*Math.min(1,dt*3);const cx=OF.x-fx*OF.camB,cz=OF.z-fz*OF.camB;
  OF.camU=(OF.camU||0)+((carUp?1.6:0)-(OF.camU||0))*Math.min(1,dt*4);const cyv=Math.max(hy+OF.camU,groundAt(cx,cz,hy)+.6);camera.position.set(cx,cyv,cz);{const la=2.5*clamp((OF.camB-.4)/3.6,0,1);camera.lookAt(OF.x+fx*la,OF.y+1.25-(1-la/2.5)*.4,OF.z+fz*la)};
  if(roamHit(cx,cz,.3,cyv))OF.n.camIn++;camera.fov+=(pFov(TUNE.fov||62)-camera.fov)*Math.min(1,dt*4);camera.updateProjectionMatrix()}
// parked cars stay parked while you walk (the lively-city parker would re-park them relative to the walker)
if(typeof LV_parkStep==='function')LV_parkStep=(f=>function(){if(RO.foot&&RO.foot!=='car')return;return f.apply(this,arguments)})(LV_parkStep);
// borrowed body: lift ud.m so its lowest tyre point sits CR_TYRE_Y above the road (same rule as CR_carPose for real wheels)
const OF_v3=new THREE.Vector3();
function OF_lift(){const C=OF.cur;if(C.own||C.lowL==null||!pl||pl.air||(pl.boatK||0)>.5)return;const ud=pl.mesh.userData;pl.mesh.updateMatrixWorld(true);OF_v3.set(0,C.lowL,0).applyMatrix4(ud.m.matrixWorld);
  // lowest tyre point under each wheel's contact patch (box corner moved in by the tyre radius) (pitch/roll included) vs the ground there: the lowest corner gap is held at CR_TYRE_Y − 1 cm, tyres just touching (no float on a crowned road or by a kerb)
  let lift=-1e9;const W=C.wb;if(W){for(let i=0;i<4;i++){const r=Math.min((W.max.y-W.min.y)/2,(W.max.z-W.min.z)/4);OF_v3.set(i&1?W.max.x:W.min.x,C.lowL,i&2?W.max.z-r:W.min.z+r).applyMatrix4(ud.m.matrixWorld);lift=Math.max(lift,groundAt(OF_v3.x,OF_v3.z,OF_v3.y+1)+CR_TYRE_Y-.01-OF_v3.y)}}
  else lift=groundAt(RO.x,RO.z,RO.y+1)+CR_TYRE_Y-OF_v3.y;lift=clamp(lift,-.4,.4);ud.m.position.y+=lift/(pl.mesh.scale.y||1);ud.m.updateMatrixWorld(true)}
// own car parked while you walk: nothing re-poses it on foot, so the exit-frame squat/pitch froze (rear sunk into the road). Settle it: level pose, then pitch/roll to the ground under the 4 corners, lowest tyre point CR_TYRE_Y above the road.
const OF_wbx=new THREE.Box3(),OF_q=new THREE.Quaternion(),OF_ax=new THREE.Vector3(),OF_bx=new THREE.Box3();
function OF_corners(){const ud=pl.mesh.userData;pl.mesh.updateMatrixWorld(true);const B=OF_bx.makeEmpty(),inv=new THREE.Matrix4().copy(pl.mesh.matrixWorld).invert(),m=new THREE.Matrix4(),b=new THREE.Box3();
  ud.m.traverseVisible(o=>{if(!o.isMesh||!o.geometry||(o.material&&o.material.transparent)||o.userData.ofSeat)return;if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();m.multiplyMatrices(inv,o.matrixWorld);if(o.isInstancedMesh){const k=new THREE.Matrix4();o.getMatrixAt(0,k);m.multiply(k)}b.copy(o.geometry.boundingBox).applyMatrix4(m);B.union(b)});
  if(B.isEmpty())return null;const ix=(B.max.x-B.min.x)*.12,iz=(B.max.z-B.min.z)*.12,P=[];for(let i=0;i<4;i++)P.push(new THREE.Vector3(i&1?B.max.x-ix:B.min.x+ix,B.min.y,i&2?B.max.z-iz:B.min.z+iz).applyMatrix4(pl.mesh.matrixWorld));return P}
function OF_gap(){if(!pl)return null;const P=OF_corners();if(!P)return null;let mx=-9,mn=9;for(const v of P){const d=v.y-groundAt(v.x,v.z,v.y+1);mx=Math.max(mx,d);mn=Math.min(mn,d)}const f=new THREE.Vector3(0,0,1).applyQuaternion(pl.mesh.quaternion);return{max:+mx.toFixed(3),min:+mn.toFixed(3),pitch:+(Math.asin(clamp(f.y,-1,1))*180/Math.PI).toFixed(2)}}
function OF_settle(){const C=OF.car;if(!C||!C.own||!pl||!pl.mesh||(pl.boatK||0)>.5)return;try{
  pl.pitch=0;pl.roll=0;pl.pv=0;RO.v=0;RO.vy=0;RO.landK=0;pl.air=false;const sx=RO.x,sz=RO.z,sh=RO.h,sy=RO.y,sv=RO.vy,tn=RO.trN&&RO.trN.clone();RO.x=C.x;RO.z=C.z;RO.h=RO.vh=C.h;try{roamPose(pl,1/60)}catch(e){}RO.x=sx;RO.z=sz;RO.h=RO.vh=sh;RO.y=sy;RO.vy=sv;if(tn)RO.trN.copy(tn);
  // roamPose's terrain tilt (TR_tilt) already leans ud.m to the slope and the pitch/roll below leans pl.mesh again: a parked car on a slope got TWICE the slope (one end buried). Keep ud.m level (heading only); the settle below does the whole tilt
  {const ud=pl.mesh.userData,f=new THREE.Vector3(Math.sin(C.h),0,Math.cos(C.h)),u=new THREE.Vector3(0,1,0);ud.m.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3().crossVectors(f,u),u,f.clone().negate()))}
  // real wheels (userData.r) when the ride has them: wheels back to rest height, pitch/roll from the ground under each tyre, lowest tyre bottom CR_TYRE_Y above the road, then each wheel drops/rises ≤ 4 cm onto the road (box corners only as a fallback)
  const ud=pl.mesh.userData,W=[];ud.m.traverse(w=>{if(!w.isMesh||!w.userData.r)return;let v=true,q=w;while(q&&q!==ud.m){if(!q.visible)v=false;q=q.parent}if(v)W.push(w)});
  // the tyre bottom is the wheel mesh's real world box (its geometry is not always centred on its origin: the Hot Rod's tyres hung 14 cm below origin − r·scale, so the old centre-minus-radius settle sank them into the road)
  const tyre=()=>{pl.mesh.updateMatrixWorld(true);return W.map(w=>{const b=OF_wbx.setFromObject(w),p=b.getCenter(new THREE.Vector3()),sc=w.getWorldScale(new THREE.Vector3()).y,g=groundAt(p.x,p.z,b.min.y+1);return{w,p,sc,g,d:b.min.y-g}})};
  if(W.length>=3){for(const w of W){if(w.userData.by!=null)w.position.y=w.userData.by}let T=tyre();const fx=Math.sin(C.h),fz=Math.cos(C.h);
   const lf=t=>(t.p.x-C.x)*fx+(t.p.z-C.z)*fz,ls=t=>(t.p.x-C.x)*fz-(t.p.z-C.z)*fx,F=T.filter(t=>lf(t)>0),Bk=T.filter(t=>lf(t)<=0),L=T.filter(t=>ls(t)>0),R=T.filter(t=>ls(t)<=0),av=(A,f)=>A.reduce((a,t)=>a+f(t),0)/A.length,gy=t=>t.g;// the road under each tyre (was p.y−d = road + tyre radius: bigger rear wheels pitched the parked car nose-down)
   
   if(F.length&&Bk.length&&L.length&&R.length){const pit=Math.atan2(av(F,gy)-av(Bk,gy),av(F,lf)-av(Bk,lf)),rol=Math.atan2(av(L,gy)-av(R,gy),av(L,ls)-av(R,ls));
    OF_ax.set(fz,0,-fx);OF_q.setFromAxisAngle(OF_ax,-clamp(pit,-.35,.35));pl.mesh.quaternion.premultiply(OF_q);OF_ax.set(fx,0,fz);OF_q.setFromAxisAngle(OF_ax,clamp(rol,-.35,.35));pl.mesh.quaternion.premultiply(OF_q);T=tyre()}
   const mn=Math.min(...T.map(t=>t.d));if(mn<5)pl.mesh.position.y+=CR_TYRE_Y-mn;T=tyre();for(const t of T){const k=t.w.parent?t.w.parent.getWorldScale(new THREE.Vector3()).y:1;t.w.position.y-=clamp(t.d-CR_TYRE_Y,-.04,.04)/(k||1)}}
  else{const fx=Math.sin(C.h),fz=Math.cos(C.h),hd=(C.hd||2)*.8,hw=(C.hw||1)*.8,g=(a,b)=>groundAt(C.x+fx*a+fz*b,C.z+fz*a-fx*b,(C.y||0)+1.5);
  const pit=Math.atan2(((g(hd,hw)+g(hd,-hw))-(g(-hd,hw)+g(-hd,-hw)))/2,2*hd),rol=Math.atan2(((g(hd,hw)+g(-hd,hw))-(g(hd,-hw)+g(-hd,-hw)))/2,2*hw);
  OF_ax.set(fz,0,-fx);OF_q.setFromAxisAngle(OF_ax,-clamp(pit,-.35,.35));pl.mesh.quaternion.premultiply(OF_q);OF_ax.set(fx,0,fz);OF_q.setFromAxisAngle(OF_ax,clamp(rol,-.35,.35));pl.mesh.quaternion.premultiply(OF_q);
  const P=OF_corners();if(P){let mn=9;for(const v of P)mn=Math.min(mn,v.y-groundAt(v.x,v.z,v.y+1));if(mn<5)pl.mesh.position.y+=CR_TYRE_Y-.01-mn}}pl.mesh.updateMatrixWorld(true);C.py=pl.mesh.position.y;OF.n.settle=(OF.n.settle||0)+1}catch(e){if(!OF.e3){OF.e3=1;console.warn('OF settle',e)}}}
OF_exit=(f=>function(){const r=f.apply(this,arguments);OF.stT=0;OF_settle();setTimeout(()=>{try{if(window.__chk&&RO.foot!=='car')window.__chk.parkSit=OF_parkChk()}catch(e){}},1200);return r})(OF_exit);
// park check (v90k/park-sit): visible tyres' bottom − road, body (non-wheel) bottom − road at the 8 CR_bodyPts, and the car's pitch/roll minus the road's slope under it (degrees)
function OF_parkChk(){if(!pl||!pl.mesh)return null;const ud=pl.mesh.userData;pl.mesh.updateMatrixWorld(true);const A=new THREE.Vector3(),S=new THREE.Vector3(),W=[];
  ud.m.traverse(w=>{if(!w.isMesh||!w.userData.r)return;let v=true,q=w;while(q&&q!==ud.m){if(!q.visible)v=false;q=q.parent}if(v)W.push(w)});
  const tyre=W.map(w=>{const b=OF_wbx.setFromObject(w);b.getCenter(A);return +(b.min.y-groundAt(A.x,A.z,b.min.y+1)).toFixed(3)});// real tyre bottom = the wheel mesh's world box (origin − r·scale was 14 cm off on the Hot Rod)
  CR_PS.k='';let body=9;for(const p of CR_bodyPts(ud)){A.copy(p).applyMatrix4(ud.m.matrixWorld);body=Math.min(body,A.y-groundAt(A.x,A.z,A.y+1.5))}
  const C=OF.car||{x:RO.x,z:RO.z,h:RO.h,y:RO.y},h=C.h,fx=Math.sin(h),fz=Math.cos(h),g=(a,b)=>groundAt(C.x+fx*a+fz*b,C.z+fz*a-fx*b,(C.y||0)+1.5);
  const f=new THREE.Vector3(fx,0,fz),r=new THREE.Vector3(fz,0,-fx),up=new THREE.Vector3(0,1,0).applyQuaternion(ud.m.getWorldQuaternion(new THREE.Quaternion())),D=180/Math.PI;
  const gp=Math.atan2(g(1.5,0)-g(-1.5,0),3)*D,gr=Math.atan2(g(0,-.8)-g(0,.8),1.6)*D,cp=-Math.asin(clamp(up.dot(f),-1,1))*D,cr=Math.asin(clamp(up.dot(r),-1,1))*D;
  const pitch=+(cp-gp).toFixed(2),roll=+(cr-gr).toFixed(2),tmx=Math.max(...tyre.map(Math.abs));
  return{foot:RO.foot,tyre,body:+body.toFixed(3),pitch,roll,ok:tyre.length>=3&&tmx<=.05&&body>=0&&Math.abs(pitch)<=1&&Math.abs(roll)<=1}}
// --- per-frame hooks (outermost wrappers: none of the car-only wrappers run on foot)
// on-the-go markers (OG: event rings, gold, district collectibles = OG.imC, a translucent 2 m vase in the district colour, Gallus = mint green) are only
// ticked in the car (roamStep); on foot they froze in the lane as a floating translucent green blob you can't collect (Alex b4). Hide them on foot.
function OF_ogVis(on){try{if(typeof OG!=='undefined'&&OG.grp&&OG.grp.visible!==on)OG.grp.visible=on}catch(e){}}
roamStep=(f=>function(dt){if(RO.foot&&RO.foot!=='car'){OF_ogVis(false);if(state==='roam'&&!RO.frozen){OF_step(dt);OF.stT=(OF.stT||0)+(dt||0);if(OF.stT>.25){OF.stT=0;OF_settle()}}return}
  OF_ogVis(true);const busy=TOUCH.gas||TOUCH.brake||K.ArrowUp||K.ArrowDown||K.KeyW||K.KeyS;OF.idle=busy||Math.abs(RO.v)>2.2?0:OF.idle+(dt||0);const r=f(dt);try{OF_lift()}catch(e){}try{OF_fleeStep(dt||0);OF_starStep(dt||0)}catch(e){if(!OF.e2){OF.e2=1;console.warn('OF flee',e)}}OF_dom();OF_btns();return r})(roamStep);
roamCam=(f=>function(dt){if(RO.foot&&RO.foot!=='car')return OF_cam(dt);return f(dt)})(roamCam);
// leaving roam (menu, district change, wreck reset) puts you back in the car
function OF_reset(){OF_jackEnd();OF_fleeEnd();if(RO.foot==='car'&&!OF.car)return;try{if(OF.car)OF_poseCar(OF.car.x,OF.car.z,OF.car.y,OF.car.h)}catch(e){}OF.car=null;if(OF.fig)OF.fig.g.visible=false;RO.foot='car';try{if(OF.cur.own)OF_drv(pl&&pl.mesh,true)}catch(e){}OF_btns()}
if(typeof exitRoam==='function')exitRoam=(f=>function(){OF_reset();return f.apply(this,arguments)})(exitRoam);
if(typeof roamWarp==='function')roamWarp=(f=>function(){OF_reset();return f.apply(this,arguments)})(roamWarp);
enterRoam=(f=>function(){OF_jackEnd();OF_fleeEnd();OF.star.n=0;OF.star.t=0;RO.foot='car';OF.car=null;OF.vs=[];OF.taken=[];OF.cur={own:true};OF.btn='';if(OF.fig){if(OF.fig.g.parent)OF.fig.g.parent.remove(OF.fig.g);OF.fig.g.visible=false}const r=f.apply(this,arguments);return r})(enterRoam);
// no M1 weapon on foot (P3/P4 bring punches and blasters); F / E = EXIT / ENTER when no M1 weapon is out
if(typeof M1_fire==='function')M1_fire=(f=>function(){if(RO.foot&&RO.foot!=='car')return;return f.apply(this,arguments)})(M1_fire);
const OF_m1=()=>typeof M1!=='undefined'&&(M1.cs||M1.inv||(typeof M1_wpn==='function'&&M1_wpn()));
addEventListener('keydown',e=>{if(state!=='roam'||e.repeat||!(e.code==='KeyF'||e.code==='KeyE'))return;if(!$('#settings').hidden||RO.jOpen)return;
  if(RO.foot==='walk'){e.preventDefault();OF_use(OF.act)}else if(RO.foot==='car'&&!OF_m1()&&OF_canExit()){e.preventDefault();OF_exit()}},true);
addEventListener('keydown',e=>{if(e.code==='Space'&&!e.repeat&&RO.foot==='walk')OF.jQ=.2},true);
function OF_api(){return{state:RO.foot,x:+OF.x.toFixed(2),z:+OF.z.toFixed(2),y:+OF.y.toFixed(2),h:+OF.h.toFixed(3),spd:+OF.spd.toFixed(2),air:OF.air,near:OF.near&&{k:OF.near.k,x:+OF.near.x.toFixed(1),z:+OF.near.z.toFixed(1)},
  car:OF.car&&{x:+OF.car.x.toFixed(1),z:+OF.car.z.toFixed(1),h:+OF.car.h.toFixed(3)},parked:OF.vs.length,taken:OF.taken.length,own:OF.cur.own,btn:OF.btn,figH:OF.figH,n:Object.assign({},OF.n),log:OF.log.slice(-8),stk:OF.stk||[],canExit:OF_canExit(),doorGap:OF.doorGap,idle:+OF.idle.toFixed(2),
  stars:OF.star.n,starT:+OF.star.t.toFixed(1),jack:OF.jk&&{t:+OF.jk.t.toFixed(2),ph:OF.jk.ph},flee:OF.fl&&{t:+OF.fl.t.toFixed(2),d:+OF.fl.d.toFixed(1),x:+OF.fl.x.toFixed(1),z:+OF.fl.z.toFixed(1),ph:OF.fl.ph},athPk:OF.athPk||0,bub:OF.fl&&OF.fl.bi,bc:OF.bcD&&Object.assign({cam:BC.cam,big:BC.big},OF.bcD),hp:100,lock:null,ko:0}}
// ===== OF P2 (v89c): car-jacking (docs/ON_FOOT_PLAN.md §4 P2). On foot near a slow (< 25 km/h) or stopped traffic car the door button reads
// 🚗 TAKE: the car brakes to a stop, you step to the driver's door, the driver (GAR_riv racer, same 1.8 m scale as you and the peds) is pulled out,
// shouts "HEY!", stumbles and runs off for 6 s; you drive the car away (same body lift as a parked car + your seated minifig). +1 ★ per jack
// (chip in the speed box; one star drops after 60 s without a new crime; P4's WNT_ module takes the wanted level over). Athens: a few cars are
// kerb-parked on its g-streets (traffic drives on the centre line there; c.ofW gives a parked car a lane offset in hubTrafficStep).
function OF_jack(o){const c=o.ref;OF.jk={c,o,t:0,ph:'walk',x0:OF.x,z0:OF.z};c.hitT=99;c.ofJ=1;RO.foot='jack';OF.stick.dx=OF.stick.dy=0;OF.n.jack++;
  OF.log.push('jack@'+Math.round(c.x)+','+Math.round(c.z));OF_btns()}
function OF_jackEnd(){const J=OF.jk;if(!J)return;if(J.c){J.c.hitT=0;J.c.ofJ=0}OF.jk=null}
// returns true once the body swap ran (OF_step stops for this frame)
function OF_jackStep(dt){const J=OF.jk;if(!J||!J.c){OF.jk=null;RO.foot='walk';return false}const c=J.c;J.t+=dt;
  if(c.dead>0||c.x==null){OF.log.push('jack-abort:'+(c.x==null?'gone':'dead'+(+c.dead).toFixed(2)));OF_jackEnd();RO.foot='walk';return false}
  c.hitT=99;c.cv=J.t>.35?0:Math.min(c.cv||0,OF_JV_MAX);
  const h=OF_cH(c),fx=Math.sin(h),fz=Math.cos(h),rx=-fz,rz=fx,dx=c.x-rx*1.45+fx*.55,dz=c.z-rz*1.45+fz*.55,k=Math.min(1,J.t/.4),e=k*k*(3-2*k);
  OF.x=J.x0+(dx-J.x0)*e;OF.z=J.z0+(dz-J.z0)*e;OF.y=groundAt(OF.x,OF.z,OF.y+1);OF.h+=angDiff(Math.atan2(rx,rz),OF.h)*Math.min(1,dt*12);OF.spd=k<1?OF_WALK:0;
  if(J.ph==='walk'&&J.t>=.45){J.ph='pull';OF_fleeStart(c,h);AU.sfx&&AU.sfx('brick');try{feed('😠 "HEY!"',0,'#ff5a4a')}catch(_){}}
  if(J.ph==='pull'&&J.t>=1.25){const o=J.o;o.x=c.x;o.z=c.z;o.y=c.y||OF.y;o.h=h;OF_jackEnd();OF_crime(1,'jack');OF_finishEnter(o);return true}
  return false}
// arms reach for the door while pulling
OF_figPose=(f=>function(dt){f(dt);const J=OF.jk,F=OF.fig;if(!F||RO.foot!=='jack'||!J||J.ph!=='pull')return;const a=-1.35+.35*Math.sin(J.t*18);if(F.M.aL)F.M.aL.rotation.x=a;if(F.M.aR)F.M.aR.rotation.x=a})(OF_figPose);
// --- the fleeing driver: 3 meshes (body with arms up in panic, 2 legs) + a "HEY!" bubble for 1.8 s
function OF_bubble(){const cv0=document.createElement('canvas');cv0.width=128;cv0.height=64;const g=cv0.getContext('2d');g.fillStyle='#ffffff';g.beginPath();g.roundRect(4,4,120,46,16);g.fill();
  g.beginPath();g.moveTo(52,48);g.lineTo(64,62);g.lineTo(72,48);g.fill();g.lineWidth=5;g.strokeStyle='#e0301e';g.beginPath();g.roundRect(4,4,120,46,16);g.stroke();
  g.fillStyle='#1b1d22';g.font='900 italic 32px system-ui';g.textAlign='center';g.textBaseline='middle';g.fillText('HEY!',64,28);
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv0),transparent:true,depthWrite:false,depthTest:false}));s.scale.set(1.3,.65,1);s.position.y=2.45;s.renderOrder=5;return s}
function OF_fleeStart(c,h){OF_fleeEnd();const im=HUB.cim[c.k],col=new THREE.Color('#d8302a');try{if(im&&im.instanceColor)im.getColorAt(c.j,col)}catch(e){}
  const F=OF_figMake(GAR_riv('#'+col.getHexString()),{armsUp:1}),fx=Math.sin(h),fz=Math.cos(h),rx=-fz,rz=fx,y0=c.y!=null?c.y:OF.y,bub=OF_bubble();F.g.add(bub);F.g.rotation.order='YXZ';
  HUB.grp.add(F.g);F.g.visible=true;
  // seat (inside, left of the centre line) → out through the door → thrown 1.2 m further back, a stumble, then the run (ahead-left, onto the pavement, where you see him as you drive off)
  const s={x:c.x-rx*.3-fx*.1,z:c.z-rz*.3-fz*.1},o={x:c.x-rx*1.6-fx*.4,z:c.z-rz*1.6-fz*.4},l={x:c.x-rx*2.6-fx*1.3,z:c.z-rz*2.6-fz*1.3};let ra=Math.atan2(-rx+fx*.7,-rz+fz*.7);
  OF.fl={F,bub,t:0,ph:'out',s,o,l,y0,x:s.x,z:s.z,y:y0+.45,h:Math.atan2(rx,rz),ra,d:0,lph:0,cx:c.x,cz:c.z}}
// the bubble never hides under a HUD card (event banner, checklist pin): above the head → beside the head → beside the chest, first spot whose
// screen rect (+8 px) is clear of opaque HUD; sticky (never moves back up while shown)
const OF_BUBP=[[0,2.45],[1.05,1.75],[1.05,1.15]],_ofBv=new THREE.Vector3();
function OF_hudOver(x,y){for(const e of document.elementsFromPoint(x,y)){if(e.tagName==='CANVAS')return false;if(e.closest('#touch')||e===document.body||e===document.documentElement)continue;
  const cs=getComputedStyle(e);if(cs.backgroundColor!=='rgba(0, 0, 0, 0)'&&+cs.opacity>.1||cs.backgroundImage!=='none')return true}return false}
function OF_bubPlace(L){const b=L.bub;for(let i=L.bi||0;i<OF_BUBP.length;i++){b.position.set(OF_BUBP[i][0],OF_BUBP[i][1],0);L.F.g.updateMatrixWorld(true);b.getWorldPosition(_ofBv).project(camera);
    if(_ofBv.z>1){L.bi=i;return}const W=innerWidth,H=innerHeight,cx=(_ofBv.x+1)/2*W,cy=(1-_ofBv.y)/2*H,hw=Math.max(20,b.scale.x/Math.max(1,camera.position.distanceTo(b.getWorldPosition(new THREE.Vector3())))*H*.9);
    const pts=[[cx,cy-hw*.3-8],[cx-hw*.5,cy],[cx+hw*.5,cy],[cx,cy+hw*.3]];if(!pts.some(p=>p[1]>=0&&p[1]<H&&p[0]>=0&&p[0]<W&&OF_hudOver(p[0],p[1]))){L.bi=i;return}}L.bi=OF_BUBP.length-1}
function OF_fleeEnd(){const L=OF.fl;if(!L)return;if(L.F.g.parent)L.F.g.parent.remove(L.F.g);L.F.g.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.isSprite){o.material.map.dispose();o.material.dispose()}});OF.fl=null}
function OF_fleeStep(dt){const L=OF.fl;if(!L)return;L.t+=dt;const F=L.F,M=F.M;let pitch=0,legs=0;
  if(L.t<.45){const k=L.t/.45,e=k*k*(3-2*k);L.x=L.s.x+(L.o.x-L.s.x)*e;L.z=L.s.z+(L.o.z-L.s.z)*e;const g=groundAt(L.x,L.z,L.y0+1.5);L.y=g+(L.y0+.45-g)*(1-k)+Math.sin(k*Math.PI)*.35;pitch=-.35*e;legs=.6}
  else if(L.t<.95){const k=(L.t-.45)/.5,e=1-(1-k)*(1-k);L.x=L.o.x+(L.l.x-L.o.x)*e;L.z=L.o.z+(L.l.z-L.o.z)*e;L.y=groundAt(L.x,L.z,L.y0+1.5)+Math.sin(k*Math.PI)*.25;pitch=-.35+Math.sin(k*Math.PI*2.5)*.45*(1-k);L.lph+=dt*14;legs=Math.sin(L.lph)*.6;L.ph='stumble'}
  else if(L.t<1.15){L.y=groundAt(L.x,L.z,L.y+1);L.h+=angDiff(L.ra,L.h)*Math.min(1,dt*14);L.ph='turn';L.lph+=dt*10;legs=Math.sin(L.lph)*.3}
  else{L.ph='run';const v=OF_RUN;let ok=false;for(const da of[0,.45,-.45,.9,-.9,1.5,-1.5,2.4,-2.4]){const a=L.ra+da,nx=L.x+Math.sin(a)*v*dt,nz=L.z+Math.cos(a)*v*dt,g=groundAt(nx,nz,L.y+.6);
      if(g>L.y+.5||roamHit(nx,nz,.3,L.y+1)||(CID==='fra'&&inRiver(nx,nz)))continue;L.ra=a;L.d+=Math.hypot(nx-L.x,nz-L.z);L.x=nx;L.z=nz;L.y=g;ok=true;break}
    if(!ok)L.ra+=Math.PI*.5;L.h+=angDiff(L.ra,L.h)*Math.min(1,dt*10);L.lph+=dt*3.4*6.283;legs=Math.sin(L.lph)*.8;L.y+=Math.abs(Math.sin(L.lph))*.04}
  F.g.position.set(L.x,L.y,L.z);F.g.rotation.set(pitch,L.h+Math.PI,0);if(M.lL)M.lL.rotation.x=legs;if(M.lR)M.lR.rotation.x=-legs;
  if(M.b)M.b.position.y=0;L.bub.visible=L.t>.25&&L.t<2.1;if(L.bub.visible){L.bub.material.rotation=Math.sin(L.t*20)*.06;try{OF_bubPlace(L)}catch(e){}}
  if(L.t>7.5||Math.hypot(L.x-RO.x,L.z-RO.z)>120)OF_fleeEnd()}
// --- your minifig in the seat of a borrowed body (traffic geometry has no driver): GAR_fig sit pose, same scale as the walker, hidden on EXIT.
// Fits the cabin like the own car's driver bricks: head under the glass top, seat ≥ 0.3 m above the body's underside (scaled down in low cars, never feet through the road)
function OF_seat(ud,body){const F=OF_figBuild(),P=[],Q=[];GAR_fig(GB_figGet(),P,Q,true);const g=mergeGeometries(P.concat(Q).map(q=>{q=q.index?q.toNonIndexed():q;for(const a of Object.keys(q.attributes))if(a!=='position'&&a!=='normal'&&a!=='color')q.deleteAttribute(a);return q}));
  g.computeBoundingBox();const fb=g.boundingBox;ud.m.updateMatrixWorld(true);const m4=new THREE.Matrix4(),bx=new THREE.Box3(),B=new THREE.Box3(),G=new THREE.Box3();
  for(let i=0;i<body.length;i++){const q=body[i];if(i===1||!q)continue;if(!q.geometry.boundingBox)q.geometry.computeBoundingBox();q.getMatrixAt(0,m4);m4.premultiply(ud.m.matrixWorld);bx.copy(q.geometry.boundingBox).applyMatrix4(m4);(i===2?G:B).union(bx)}
  const top=(G.isEmpty()?B.max.y-.12:Math.min(G.max.y,B.max.y)-.06),h=RO.h,fl=B.min.y+.3,s=Math.min(F.s,(top-fl)/Math.max(.1,fb.max.y-fb.min.y)),y=top-fb.max.y*s,cz=G.isEmpty()?0:((G.min.x+G.max.x)/2-RO.x)*Math.sin(h)+((G.min.z+G.max.z)/2-RO.z)*Math.cos(h);
  const w=new THREE.Matrix4().compose(new THREE.Vector3(RO.x+Math.sin(h)*(cz-.15),y,RO.z+Math.cos(h)*(cz-.15)),new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),h+Math.PI),new THREE.Vector3(s,s,s));
  w.premultiply(new THREE.Matrix4().copy(ud.m.matrixWorld).invert());const m=new THREE.Mesh(g,GB_MAT);w.decompose(m.position,m.quaternion,m.scale);m.userData.ofSeat=1;m.userData.of=1;m.castShadow=false;ud.m.add(m);OF.seat=m;return m}
// --- wanted stars (stub for P4): +n per crime, one star drops after 60 s without a new crime
function OF_crime(n,why){const S=OF.star;S.n=Math.min(5,S.n+n);S.t=60;OF.log.push('★+'+n+':'+why);OF_starHud()}
function OF_starStep(dt){const S=OF.star;if(!S.n)return;S.t-=dt;if(S.t<=0){S.n--;S.t=S.n?60:0;OF_starHud()}}
function OF_starHud(){let e=document.getElementById('ofStar');if(!e){const G=$('#roamGauge');if(!G)return;e=document.createElement('span');e.id='ofStar';G.appendChild(e);
    const st=document.createElement('style');st.textContent='#ofStar{font:900 14px system-ui;color:#ffd12c;text-shadow:0 1px 2px #000,0 0 6px rgba(255,190,0,.6);letter-spacing:.02em;white-space:nowrap;align-self:center}';document.head.appendChild(st)}
  e.textContent=OF.star.n?'★'+OF.star.n:'';e.style.display=OF.star.n?'':'none'}
// --- Athens: kerb-parked cars on g-streets (LV_park1 skips them: their traffic runs on the centre line). Athens blocks are short (26–30 m edges,
// 8.5 m wide): park ≥ 7.5 m from a node, kerb offset W/2 − 1.3 m (car edge ~0.3 m inside the kerb, ~0.9 m clear of centre-line traffic)
function OF_athPark1(C,far){const N=HUB.nodes,fx=Math.sin(RO.h),fz=Math.cos(RO.h);let cand=null;
  for(let k=0;k<12&&!cand;k++){const c=C[Math.floor(R()*C.length)];if(c.pk||c.route||c.tr||c.dead>0||c.crW||c.ofJ||HCAR[c.k][0]==='#')continue;const dx=c.x-RO.x,dz=c.z-RO.z,d=Math.hypot(dx,dz);if(d>200||dx*fx+dz*fz<-d*.3&&!LV_seen(c.x,c.y||0,c.z))cand=c}
  if(!cand)return;const nd=LV_edges(far?30:70,far?100:130,.6).filter(e=>Math.min(e.s,e.L-e.s)>=7.5);
  for(let k=0;k<Math.min(12,nd.length);k++){const E=nd[k],A=N[E.i],B=N[E.bi],L=E.L,W=Math.min(A.w||9,B.w||9);if(W<8)continue;const t=E.s/L,off=W/2-1.3,ux=(B.x-A.x)/L,uz=(B.z-A.z)/L,
      cx=A.x+(B.x-A.x)*t,cz=A.z+(B.z-A.z)*t,x=cx-uz*off,z=cz+ux*off,y=groundAt(x,z,groundAt(cx,cz,999)+2),d=Math.hypot(x-RO.x,z-RO.z);
    if(Math.abs(y-groundAt(cx,cz,y+2))>.35)continue;if(LV.cl&&LV.cl.L.some(q=>q.on&&(q.x-x)**2+(q.z-z)**2<14*14))continue;if(C.some(o=>o.pk&&(o.x-x)**2+(o.z-z)**2<9*9))continue;
    if(roamHit(x,z,1.4,y+.5)||roamHit(x+ux*2.2,z+uz*2.2,1.2,y+.5)||roamHit(x-ux*2.2,z-uz*2.2,1.2,y+.5))continue;if(typeof QS_rampNear==='function'&&QS_rampNear(x,z))continue;if(!far&&LV_seen(x,0,z)&&d<90)continue;
    Object.assign(cand,{pk:1,pv:cand.pv||cand.v,v:0,cv:0,a:E.i,b:E.bi,t,lane:off/W,ofW:W,hitT:0,x,z});LV.n.park=(LV.n.park||0)+1;OF.athPk=(OF.athPk||0)+1;return}}
if(typeof LV_park1==='function')LV_park1=(f=>function(C,far){if(CID==='ath')return OF_athPark1(C,far);return f.apply(this,arguments)})(LV_park1);

// ===== v89b1 camera hotfix (Alex: "the walk in the street is impossible … it's doing rounds"). Cause: the stick was camera-relative AND the camera
// turned towards the walker's facing every frame (rate 3/s), so a stick held off-centre turned the walker, which turned the camera, which turned the
// walker … = endless circles. Now (GTA / LEGO City Undercover style): the camera only follows the position; its yaw changes by (1) a drag on the
// empty right part of the screen / mouse drag / Q Z keys (yaw + limited pitch; double-tap = recentre), (2) a slow recentre behind the walker after
// 1.5 s of steady movement with no camera input, never while he is turning. The stick's frame is frozen while its direction is held (OF_walk).
const OF_CAMK=.0065,OF_CAMP=.004;
function OF_camYaw(dt){OF.camT+=dt;const tr=OF.hPrev==null?0:Math.abs(angDiff(OF.h,OF.hPrev))/Math.max(dt,1e-4);OF.hPrev=OF.h;
  const kq=(K.KeyQ?1:0)-(K.KeyZ?1:0);if(kq&&RO.foot==='walk'){OF.cy+=kq*1.8*dt;OF.camT=0;OF.recen=false}
  if(OF.recen){const a=angDiff(OF.h,OF.cy),r=Math.min(Math.abs(a),dt*5);OF.cy+=Math.sign(a)*r;OF.cp+=(0-OF.cp)*Math.min(1,dt*6);if(Math.abs(a)<.01)OF.recen=false;return}
  if(OF.spd>.8&&tr<4&&OF.camT>1)OF.steady+=dt;else OF.steady=0;
  if(OF.steady>.25){const a=angDiff(OF.h,OF.cy);if(Math.abs(a)<2.3&&Math.abs(a)>.005){const r=Math.min(Math.abs(a),dt*Math.min(2.6,Math.abs(a)*2.2+.15));OF.cy+=Math.sign(a)*r}}}
function OF_camDrag(dx,dy){OF.cy-=dx*OF_CAMK;OF.cp=clamp(OF.cp+dy*OF_CAMP,-.25,.6);OF.camT=0;OF.recen=false}
function OF_camDom(cz){const C=OF.cam;
  const st=(id,x,y)=>{if(C.id!=null)return;C.id=id;C.x=x;C.y=y;C.mv=0;const n=performance.now();if(n-C.tap<320){OF.recen=true;OF.camT=0}C.tap=n};
  const mv=(id,x,y)=>{if(id!==C.id)return;const dx=x-C.x,dy=y-C.y;C.x=x;C.y=y;C.mv+=Math.abs(dx)+Math.abs(dy);if(C.mv>12)C.tap=0;OF_camDrag(dx,dy)};const en=id=>{if(id===C.id)C.id=null};
  // window-level (capture): a touch that lands on the drag zone or the bare game view (not a button / the stick) orbits
  const onCam=t=>RO.foot==='walk'&&state==='roam'&&t&&(t.id==='ofCam'||t.tagName==='CANVAS');OF.camEv=0;
  addEventListener('touchstart',e=>{for(const t of e.changedTouches){OF.camEv++;OF.camTg=(t.target&&(t.target.id||t.target.tagName))+'@'+Math.round(t.clientX)+','+Math.round(t.clientY);if(onCam(t.target)){st('t'+t.identifier,t.clientX,t.clientY);break}}},{capture:true,passive:true});
  addEventListener('touchmove',e=>{if(C.id==null)return;for(const t of e.changedTouches)mv('t'+t.identifier,t.clientX,t.clientY)},{capture:true,passive:true});
  const te=e=>{for(const t of e.changedTouches)en('t'+t.identifier)};addEventListener('touchend',te,{capture:true,passive:true});addEventListener('touchcancel',te,{capture:true,passive:true});
  cz.addEventListener('touchstart',e=>e.preventDefault(),{passive:false});cz.addEventListener('touchmove',e=>e.preventDefault(),{passive:false});
  // PC: mouse drag anywhere on the game view (not on buttons) while on foot
  addEventListener('pointerdown',e=>{if(e.pointerType==='touch'||e.button!==0||RO.foot!=='walk'||state!=='roam')return;const t=e.target;if(!(t&&(t.tagName==='CANVAS'||t.id==='ofCam')))return;st('m',e.clientX,e.clientY)});
  addEventListener('pointermove',e=>{if(e.pointerType!=='touch')mv('m',e.clientX,e.clientY)});addEventListener('pointerup',e=>{if(e.pointerType!=='touch')en('m')})}
// --- chase camera / collider for a borrowed body: 98bc's BC_dims only measures real body meshes, so it would keep the last car's size. Measure the
// lifted instances (body + glass + wheels, ud.m frame) and run BC_apply with them; BC_upd waits while the body is borrowed and re-measures your own car after.
function OF_bcBody(ud,body){if(typeof BC_apply!=='function')return;const m4=new THREE.Matrix4(),b=new THREE.Box3(),U=new THREE.Box3(),Wb=new THREE.Box3(),sc=new THREE.Vector3();ud.m.updateMatrixWorld(true);ud.m.getWorldScale(sc);
  body.forEach((q,i)=>{if(!q)return;if(!q.geometry.boundingBox)q.geometry.computeBoundingBox();q.getMatrixAt(0,m4);b.copy(q.geometry.boundingBox).applyMatrix4(m4);U.union(b);if(i===1)Wb.copy(b)});if(U.isEmpty())return;
  const d={W:(U.max.x-U.min.x)*sc.x,L:(U.max.z-U.min.z)*sc.z,H:(U.max.y-U.min.y)*sc.y,WB:Wb.isEmpty()?0:Math.max(0,(Wb.max.z-Wb.min.z-(Wb.max.y-Wb.min.y))*sc.z)};OF.bcD=d;BC_apply(d);if(BC.d)BC.d.of=1;
  // wider-than-reference bodies (not 'big' for 98bc) still get the chase distance scaled by the width ratio, so the car is never larger on screen than your own
  const R=BC.ref||d,c=Math.max(BC.cam||1,d.W/R.W,Math.pow(Math.max(1,d.L/R.L,d.H/R.H*1.1),.65));if(c>(BC.cam||1)+1e-3){BC.cam=c;SC_K.cam=+(BC.D0.cam*c).toFixed(3);SC_rcam()}}
if(typeof BC_upd==='function')BC_upd=(f=>function(){if(OF.cur&&!OF.cur.own)return;if(BC.d&&BC.d.of){BC.d=null;BC.k=''}return f()})(BC_upd);
// ===== OF GO (foot-1, 2026-10-13; Alex: "the figure outside moves very badly and cannot interact with others"): 📍 GO spawns for the foot: checklist tests.
// OF_go(kind) parks the car on a straight street and puts the minifig on foot on the pavement beside it (facing along the street, camera behind);
// npc: a pedestrian stands 2.2 m ahead · car: next to the parked car's door · bench: 2 m from a bench · mission: 2.5 m in front of a mission giver.
function OF_propAt(x,z,y,r){const PG=HUB.pgrid,D=HUB.ptypes;if(!PG||!D)return null;const kx=Math.floor(x/16),kz=Math.floor(z/16);for(let a=-1;a<=1;a++)for(let c=-1;c<=1;c++){const L=PG.get((kx+a)*10000+kz+c);if(!L)continue;
  for(const p of L){if(!p.alive)continue;const d=D[p.t];if(!d||Math.abs((p.y||0)-y)>2)continue;if(Math.hypot(x-p.x,z-p.z)<Math.max(.15,Math.min(1.1,d.r*.45))+r)return p}}return null}
function OF_clear(x,z,y){return!roamHit(x,z,OF_R+.25,y+1)&&!(CID==='fra'&&inRiver(x,z))&&Math.abs(groundAt(x,z,y+1)-y)<.5&&!OF_propAt(x,z,y,.6)}
function OF_pave(far){const N=HUB.nodes;if(!N)return null;const L=[];for(let i=0;i<N.length;i++){const A=N[i];if(!A||A.ab||!A.nb||!A.nb.length)continue;const d=Math.hypot(A.x-RO.x,A.z-RO.z);if(d<=(far||300))L.push([d,i])}L.sort((a,b)=>a[0]-b[0]);
  for(const[,i]of L.slice(0,150)){const A=N[i];for(const j of A.nb){const B=N[j];if(!B||B.ab||A.g&&B.g)continue;const len=Math.hypot(B.x-A.x,B.z-A.z);if(len<40)continue;const dx=(B.x-A.x)/len,dz=(B.z-A.z)/len,W=Math.min(A.w||20,B.w||20);
    for(const sd of[1,-1]){const off=sd*(W/2+(CID==='fra'?3.2:2.1)),t0=8/len,mx=A.x+(B.x-A.x)*t0,mz=A.z+(B.z-A.z)*t0,x=mx-dz*off,z=mz+dx*off,y=groundAt(x,z,99),rx=dz*sd,rz=-dx*sd;let ok=true;
      for(let s=0;s<=16&&ok;s++)ok=OF_clear(x+dx*s,z+dz*s,groundAt(x+dx*s,z+dz*s,y+1));for(let s=1;s<=3&&ok;s++)ok=OF_clear(x+rx*s,z+rz*s,groundAt(x+rx*s,z+rz*s,y+1));
      if(ok)return{x,z,y,h:Math.atan2(dx,dz),rx,rz,cx:mx-dz*sd*W/4,cz:mz+dx*sd*W/4}}}}return null}
// car parked at (cx,cz) heading h, minifig on foot at (x,z) heading fh (default h), camera behind
function OF_spawn(P,fx,fz,fh){if(!roamWarp(P.cx,P.cz,P.h,true))return false;OF_poseCar(RO.x,RO.z,RO.y,RO.h);OF.idle=1;OF_exit();const T=OF.tw;RO.foot='walk';OF.tw=null;OF.x=fx??P.x;OF.z=fz??P.z;OF.y=groundAt(OF.x,OF.z,RO.y+2);OF.h=fh??P.h;
  OF.vx=OF.vz=OF.vy=0;OF.spd=0;OF.air=false;OF.cy=OF.cyIn=OF.h;OF.cp=0;OF.camT=9;OF.camB=4.5;OF.inA=null;OF.recen=false;OF.hPrev=null;RO.x=OF.x;RO.z=OF.z;RO.y=OF.y;RO.h=RO.vh=OF.h;OF_btns();return true}
function OF_go(kind){if(state!=='roam'||!RO.on)return'📍 Start free roam first';if(RO.ch||RO.sp){try{if(RO.sp)sprintEnd();chAbort()}catch(e){}}if(RO.card){RO.card=null;$('#roamCard').hidden=true}
  OF_reset();OF_actEnd&&OF_actEnd();
  if(kind==='bench'||kind==='mission'){const T=[];
    if(kind==='bench'){for(const q of HUB.props||[])if(q.t==='bench'&&q.alive!==false)T.push({x:q.x,z:q.z,y:q.y??groundAt(q.x,q.z,99),q})}
    else for(const m of RO.marks||[]){if(!m.fig||markLocked(m))continue;const v=m.fig.getWorldPosition(new THREE.Vector3());T.push({x:v.x,z:v.z,y:v.y,m})}
    if(!T.length)return'📍 No '+kind+' nearby · try again';T.sort((a,b)=>((a.x-RO.x)**2+(a.z-RO.z)**2)-((b.x-RO.x)**2+(b.z-RO.z)**2));
    for(const t of T.slice(0,25)){const q=rfSnap(t.x,t.z,200);if(!q)continue;  // the nearest one with a free spot 2-3 m away (the bench itself does not block it)
      for(const r of[2,2.5,3])for(let a=0;a<16;a++){const an=a/16*6.283,x=t.x+Math.sin(an)*r,z=t.z+Math.cos(an)*r,y=groundAt(x,z,t.y+2);if(Math.abs(y-t.y)>.6||roamHit(x,z,OF_R+.25,y+1)||CID==='fra'&&inRiver(x,z))continue;
        const pr=OF_propAt(x,z,y,.4);if(pr&&pr!==t.q)continue;
        if(!OF_spawn({cx:q[0],cz:q[1],h:q[2]??0},x,z,Math.atan2(t.x-x,t.z-z)))return'📍 Can\'t jump right now';return'📍 '+(kind==='bench'?'BENCH':'MISSION GIVER')+' · walk up, tap the button (PC: E)'}}
    return'📍 No free spot at the '+kind}
  const P=OF_pave();if(!P)return'📍 No clear pavement nearby · drive on and try again';
  if(kind==='car'){if(!OF_spawn(P))return'📍 Can\'t jump right now';const c=OF.car,fx=Math.sin(c.h),fz=Math.cos(c.h);OF.x=c.x+fz*1.9-fx*.3;OF.z=c.z-fx*1.9-fz*.3;OF.y=groundAt(OF.x,OF.z,c.y+1);OF.h=Math.atan2(c.x-OF.x,c.z-OF.z);OF.cy=OF.cyIn=OF.h;return'📍 YOUR CAR · 🚪 ENTER appears, tap it (PC: E)'}
  if(!OF_spawn(P))return'📍 Can\'t jump right now';
  if(kind==='npc'){const p=OF_npcPick();if(!p)return'📍 No pedestrian free · try again';const x=P.x+Math.sin(P.h)*2-P.rx*.9,z=P.z+Math.cos(P.h)*2-P.rz*.9;/* ahead, a step towards the shops: in view beside the minifig */p.ofS={x,z,h:P.h+Math.PI/2,go:1};p._x=x;p._z=z;p.y=groundAt(x,z,P.y+2);p.yc=1;OF.npc=p;return'📍 PEDESTRIAN AHEAD · walk up, tap 👋 HI (PC: E)'}
  return kind==='phone'?'📍 ON FOOT · half stick = walk, full stick = run':kind==='jump'?'📍 ON FOOT · JUMP (PC: Space)':'📍 ON FOOT · walk ahead, then turn (PC: WASD, Shift runs)'}
function OF_npcPick(){const P=HUB.peds;if(!P)return null;const n=typeof LV_pn==='function'?LV_pn(P.length):P.length;let b=null,bd=-1;for(let i=0;i<n;i++){const p=P[i];if(p.cw||p.jy>0||p.ofS)continue;const d=p._x==null?1e9:Math.hypot(p._x-RO.x,p._z-RO.z);if(d>bd){bd=d;b=p}}return b}
function OF_actEnd(){for(const p of HUB.peds||[])if(p.ofS)delete p.ofS}
OF_api=(f=>function(){const o=f(),P=OF.npc,v=P&&P.ofS;let face=null;if(v){face=+Math.abs(angDiff(v.h,Math.atan2(OF.x-v.x,OF.z-v.z))).toFixed(2)}
  return Object.assign(o,{cy:+OF.cy.toFixed(3),cyIn:+OF.cyIn.toFixed(3),vx:+OF.vx.toFixed(2),vz:+OF.vz.toFixed(2),ph:+OF.ph.toFixed(3),footV:+(OF.footV||0).toFixed(2),gnd:+(OF.y-groundAt(OF.x,OF.z,OF.y+1)).toFixed(3),
    act:OF.act?OF.act.k:null,sit:!!OF.sit,npc:P?{d:+Math.hypot((P._x??0)-OF.x,(P._z??0)-OF.z).toFixed(2),w:v?+(v.w||0).toFixed(2):0,face,jy:+(P.jy||0).toFixed(2),bub:!!(OF.bub&&OF.bub.s.visible)}:null,
    flying:(HUB.peds||[]).filter(p=>p.jy>0&&p._x!=null&&Math.hypot(p._x-OF.x,p._z-OF.z)<6).length,card:!!RO.card,btnTxt:($('#tB')||{}).textContent||''})})(OF_api);
// ===== OF ACT (foot-1): one context button on foot, nearest/most-faced target wins: 🚪 ENTER / 🚗 TAKE (cars), 👋 HI (a pedestrian: turns to you,
// waves, says a line), 🪑 SIT (a bench; the stick or JUMP stands up), 📋 TALK (a mission giver: opens its card; starting it puts you back in your car).
const OF_HI=['HI THERE!','HELLO!','NICE DAY!','HIGH FIVE!','LOVE YOUR CAR!','WATCH THE TRAFFIC!','GREAT HAT!','SEEN THE RIVER?'];
function OF_say(txt,col){const cv=document.createElement('canvas');cv.width=256;cv.height=64;const g=cv.getContext('2d');g.font='900 italic 26px system-ui';const w=Math.min(248,g.measureText(txt).width+34),x0=128-w/2;
  g.fillStyle='#ffffff';g.beginPath();g.roundRect(x0,4,w,44,16);g.fill();g.beginPath();g.moveTo(116,46);g.lineTo(128,62);g.lineTo(138,46);g.fill();g.lineWidth=4;g.strokeStyle=col||'#2a7de1';g.beginPath();g.roundRect(x0,4,w,44,16);g.stroke();
  g.fillStyle='#1b1d22';g.textAlign='center';g.textBaseline='middle';g.fillText(txt,128,27);
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv),transparent:true,depthWrite:false,depthTest:false}));s.scale.set(2.4,.6,1);s.renderOrder=5;return s}
function OF_bubOff(){const B=OF.bub;if(!B)return;if(B.s.parent)B.s.parent.remove(B.s);B.s.material.map.dispose();B.s.material.dispose();OF.bub=null}
const OF_pedS=()=>typeof SC_S!=='undefined'&&SC_S&&SC_S.on?SC_K.ped:.66;
function OF_acts(){const L=[],fx=Math.sin(OF.h),fz=Math.cos(OF.h),add=(k,o,d,x,z,bon)=>{const dx=x-OF.x,dz=z-OF.z,l=Math.hypot(dx,dz)||1,c=(dx*fx+dz*fz)/l;L.push({k,o,d,s:d+(1-c)*(k==='traf'?1.5:.6)-bon})};  // a passing car only wins when you face it
  if(OF.near)add(OF.near.k==='traf'?'traf':'car',OF.near,OF_edge(OF.near)-(OF.near.k==='traf'?OF_JREACH-OF_NEAR:0),OF.near.x,OF.near.z,OF.near.k==='traf'?-.6:.4);
  const P=HUB.peds||[],n=typeof LV_pn==='function'?LV_pn(P.length):P.length;for(let i=0;i<n;i++){const p=P[i];if(p._x==null||p.jy>0||Math.abs((p.y||0)-OF.y)>1.5)continue;const d=Math.hypot(p._x-OF.x,p._z-OF.z);if(d<2.8)add('npc',p,d,p._x,p._z,1.2)}
  const PG=HUB.pgrid;if(PG){const kx=Math.floor(OF.x/16),kz=Math.floor(OF.z/16);for(let a=-1;a<=1;a++)for(let c=-1;c<=1;c++){for(const q of PG.get((kx+a)*10000+kz+c)||[]){if(q.t!=='bench'||!q.alive||Math.abs((q.y||0)-OF.y)>1.2)continue;const d=Math.hypot(q.x-OF.x,q.z-OF.z);if(d<2.2)add('bench',q,d,q.x,q.z,.3)}}}
  for(const m of RO.marks||[]){if(!m.fig||markLocked(m))continue;const v=m.fig.getWorldPosition(_ofBv),d=Math.hypot(v.x-OF.x,v.z-OF.z);if(d<3.5&&Math.abs(v.y-OF.y)<2)add('mission',m,d,v.x,v.z,1.2)}
  let b=null;for(const q of L)if(!b||q.s<b.s)b=q;return b}
function OF_use(a){if(!a||RO.foot!=='walk')return;OF.n.use=(OF.n.use||0)+1;
  if(a.k==='car'||a.k==='traf')return OF_enter(a.o);
  if(a.k==='npc'){const p=a.o,S=p.ofS||(p.ofS={x:p._x,z:p._z,h:0,rel:1});S.h=Math.atan2(OF.x-S.x,OF.z-S.z);S.w=1.6;S.t=Math.max(S.t||0,4);OF.npc=p;OF.h=Math.atan2(S.x-OF.x,S.z-OF.z);OF.vx=OF.vz=0;OF.wave=.9;
    OF_bubOff();const s=OF_say(OF_HI[(OF.n.use*5+Math.floor(performance.now()/1000))%OF_HI.length]);HUB.grp.add(s);OF.bub={s,p,t:2.4};AU.sfx&&AU.sfx('pick');OF.log.push('hi');return}
  if(a.k==='bench'){const q=a.o;OF.sit={x:q.x,z:q.z,y:q.y??groundAt(q.x,q.z,OF.y+1),h:(q.ry||0)+Math.PI,x0:OF.x,z0:OF.z,t:0,q};OF_sitFit(OF.sit);OF.vx=OF.vz=0;OF.spd=0;AU.sfx&&AU.sfx('brick');OF.log.push('sit');return}
  if(a.k==='mission'){OF.vx=OF.vz=0;roamOpen(a.o);RO.cardPin=1;OF.log.push('talk');if(!$('#roamCard').hidden)OF.n.card=(OF.n.card||0)+1;return}}
// per frame (walk): pick the target, run the greeting / bubble timers, sit
function OF_actStep(dt){for(const p of HUB.peds||[]){const S=p.ofS;if(!S)continue;if(S.w>0)S.w-=dt;if(S.rel){S.t-=dt;if(S.t<=0)delete p.ofS}else if(Math.hypot(S.x-OF.x,S.z-OF.z)>30)delete p.ofS}
  if(OF.wave>0)OF.wave-=dt;const B=OF.bub;if(B){B.t-=dt;const p=B.p;B.s.position.set(p._x??0,(p.y||0)+3.95*OF_pedS()+.45,p._z??0);if(B.t<=0)OF_bubOff()}
  OF.act=RO.foot==='walk'&&!OF.sit?OF_acts():null}
// sit pose fit (cam-2, 2026-10-14; Alex beta.25: the figure stood INSIDE the bench, hips below the seat top). The bench model (53 terrain_roads) in its own frame: seat box top y .625,
// 2.2 × .6 m, backrest centre z +.28 (front face z +.22), seated minifig faces -z (away from the backrest). Measured on the real figure with the legs already at their seated angle:
// lift so the lowest leg point rests ON the seat top, then slide along the bench z so the torso's back touches the backrest front face (2 cm gap).
function OF_sitFit(S){try{const q=S.q,F=OF.fig;if(!q||!q.im||!F)return;const m=new THREE.Matrix4();q.im.getMatrixAt(q.i,m);q.im.updateMatrixWorld(true);const M4=m.premultiply(q.im.matrixWorld),sc=new THREE.Vector3().setFromMatrixScale(M4).y,M=F.M,legs=[M.lL,M.lR].filter(Boolean);
  S.M4=M4;S.sc=sc;S.top=new THREE.Vector3(0,.625*sc,0).applyMatrix4(M4).y;for(const l of legs)l.rotation.x=-1.5;
  const pose=()=>{F.g.position.set(S.x,S.y+(S.dy||0),S.z);F.g.rotation.y=S.h+Math.PI;F.g.updateMatrixWorld(true)};S.dy=0;pose();let mn=1e9;for(const l of legs)mn=Math.min(mn,OF_wbx.setFromObject(l).min.y);S.dy=S.top-mn;pose();
  const inv=M4.clone().invert(),v=new THREE.Vector3();let zmax=-9;F.g.traverse(o=>{if(!o.isMesh)return;const P=o.geometry.attributes.position;for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i).applyMatrix4(o.matrixWorld);const wy=v.y-S.top;v.applyMatrix4(inv);if(wy>.1*sc&&wy<.6*sc)zmax=Math.max(zmax,v.z)}});
  if(zmax>-9){const dz=.20*sc-zmax,d=new THREE.Vector3(0,0,1).transformDirection(M4);S.x+=d.x*dz;S.z+=d.z*dz;S.dz=dz;pose()}}catch(e){if(!OF.e4){OF.e4=1;console.warn('OF sitFit',e)}}}
// state check of the seated pose (every bench): legs rest on the seat top (±3 cm), nothing of the figure below the seat top over the seat, torso between the backrest front face and 8 cm in front of it, facing away from the backrest
function OF_sitChk(){const S=OF.sit,F=OF.fig;if(!S||!S.M4||!F)return{err:'not sitting'};F.g.updateMatrixWorld(true);const M4=S.M4,inv=M4.clone().invert(),sc=S.sc,M=F.M,v=new THREE.Vector3();let lm=1e9,under=0,zmax=-9;
  for(const l of[M.lL,M.lR])if(l)lm=Math.min(lm,OF_wbx.setFromObject(l).min.y);
  F.g.traverse(o=>{if(!o.isMesh)return;const P=o.geometry.attributes.position;for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i).applyMatrix4(o.matrixWorld);const wy=v.y-S.top;v.applyMatrix4(inv);if(Math.abs(v.x)<1.05*sc&&Math.abs(v.z)<.29*sc&&wy<-.03)under++;if(wy>.1*sc&&wy<.6*sc)zmax=Math.max(zmax,v.z)}});
  const fw=new THREE.Vector3(Math.sin(OF.h),0,Math.cos(OF.h)).transformDirection(inv.clone()),back=new THREE.Vector3(0,0,1),face=+(fw.dot(back)).toFixed(2);
  const r={legGap:+(lm-S.top).toFixed(3),under,zBack:+(zmax/sc-.22).toFixed(3),face,t:+S.t.toFixed(2)};r.ok=S.t>=1&&Math.abs(r.legGap)<=.03&&under===0&&r.zBack<=.01&&r.zBack>=-.08&&face<=-.9;return r}
// sitting: the minifig slides onto the seat, legs forward; any stick push / JUMP stands up
function OF_sitStep(dt){const S=OF.sit,I=OF_input();if(Math.hypot(I.fx,I.fy)>.25||I.jump){OF.sit=null;OF.jQ=0;OF.jHeld=true;OF.x+=Math.sin(OF.h)*.45;OF.z+=Math.cos(OF.h)*.45;OF.y=groundAt(OF.x,OF.z,OF.y+1);return false}
  S.t=Math.min(1,S.t+dt*4);const e=S.t*S.t*(3-2*S.t);OF.x=S.x0+(S.x-S.x0)*e;OF.z=S.z0+(S.z-S.z0)*e;OF.h+=angDiff(S.h,OF.h)*Math.min(1,dt*10);OF.y=S.y;OF.vx=OF.vz=0;OF.spd=0;return true}
OF_walk=(f=>function(dt){if(OF.sit&&OF_sitStep(dt))return;return f.apply(this,arguments)})(OF_walk);
OF_figPose=(f=>function(dt){f.apply(this,arguments);const F=OF.fig;if(!F)return;const M=F.M,S=OF.sit;
  if(S){const k=S.t;for(const l of[M.lL,M.lR])if(l)l.rotation.x=-1.5*k;if(M.aL)M.aL.rotation.x=-.3*k;if(M.aR)M.aR.rotation.x=-.3*k;F.g.position.y=S.y+(S.dy!=null?S.dy:.42-.36*F.s)*k}
  else if(OF.wave>0&&M.aR)M.aR.rotation.x=-2.7+Math.sin(performance.now()/90)*.35})(OF_figPose);
OF_step=(f=>function(dt){f.apply(this,arguments);try{OF_actStep(Math.min(dt||0,.05))}catch(e){if(!OF.e2){OF.e2=1;console.warn('OF act',e)}}})(OF_step);
OF_actEnd=(f=>function(){f();OF_bubOff();OF.sit=null;OF.act=null;OF.wave=0})(OF_actEnd);
OF_reset=(f=>function(){OF_actEnd();return f.apply(this,arguments)})(OF_reset);
// starting a mission from its card while on foot: back into your car first (the event then places the car as usual)
document.addEventListener('click',e=>{if(e.target&&e.target.closest&&e.target.closest('#rcGo')&&RO.foot&&RO.foot!=='car')OF_reset()},true);
// ---- sink audit (cam-2, 2026-10-14; Alex beta.25: the yellow semi cab and the dark-blue Hot Rod sat half under the asphalt after he stepped out in Hot Drop).
// OF_sinkChk = the parked ride vs the road under every tyre: each real wheel mesh's WORLD BOX bottom (not origin − radius: the geometry is not centred on the origin) and the body box corners; gap > 0 = float, < 0 = sunk (m).
function OF_sinkChk(){if(!pl||!pl.mesh)return null;const ud=pl.mesh.userData,W=[];ud.m.traverse(w=>{if(!w.isMesh||!w.userData.r)return;for(let q=w;q&&q!==ud.m;q=q.parent)if(!q.visible)return;W.push(w)});pl.mesh.updateMatrixWorld(true);
  const g=[];for(const w of W){const b=new THREE.Box3().setFromObject(w),c=b.getCenter(new THREE.Vector3());g.push(b.min.y-groundAt(c.x,c.z,b.min.y+1))}
  const P=OF_corners(),c=P?P.map(p=>p.y-groundAt(p.x,p.z,p.y+1)):[],mx=a=>a.length?+Math.max(...a).toFixed(3):null,mn=a=>a.length?+Math.min(...a).toFixed(3):null;
  return{nW:W.length,wMax:mx(g),wMin:mn(g),cMax:mx(c),cMin:mn(c)}}
const OF_sinkOk=r=>!r.err&&(r.wMax==null||(r.wMax<=.05&&r.wMin>=-.03))&&(r.cMin==null||r.cMin>=-.03)&&(r.nW>0||r.cMax!=null);
// each ride (ids, default all 157): pick it in the garage, exit on foot on the steepest clear street (or the Hot Drop start with hd=1), wait for the settle, measure, step back in
async function OF_sinkAll(ids,hd){const W=ms=>new Promise(r=>setTimeout(r,ms)),until=async(f,ms)=>{const e=performance.now()+ms;while(performance.now()<e){try{if(f())return true}catch(x){}await W(60)}return false};
  const L=(ids?ids.map(GAR_set):RSZ.sets()).filter(Boolean),out=[];if(state!=='roam'||!RO.on)return{err:'start roam first'};try{OF_reset()}catch(e){}const q=CAM_road(60,true);
  for(const S of L){const r={id:S.id};try{gbOpen();GAR_select(S.id);await W(250);await until(()=>typeof LDL==='undefined'||!LDL.wait.size,30000);gbClose(true);await W(300);
    if(q)roamWarp(q.x,q.z,q.h,true);RO.v=0;await W(200);OF_exit();await until(()=>RO.foot==='walk',3000);await W(700);Object.assign(r,OF_sinkChk()||{err:'no ride'});
    const o=OF_cars(false).find(k=>k.k==='cur');if(o){OF.x=o.x+Math.cos(o.h)*3;OF.z=o.z-Math.sin(o.h)*3;OF_enter(o);await until(()=>RO.foot==='car',5000)}}catch(e){r.err=String(e).slice(0,80)}
    r.ok=OF_sinkOk(r);out.push(r)}
  const bad=out.filter(r=>!r.ok);return{n:out.length,bad:bad.length,fails:bad,slope:q&&+(q.gr||0).toFixed(3)}}
window.OF_sinkAll=OF_sinkAll;
// every bench of the loaded city (or the `max` nearest): on foot next to it, SIT, wait for the slide, OF_sitChk, stand up (cam-2). Resolves {n, bad, fails:[{x,z,...chk}]}
async function OF_sitAll(max){const W=ms=>new Promise(r=>setTimeout(r,ms));if(state!=='roam'||!RO.on)return{err:'start roam first'};if(RO.foot!=='walk'){OF_go('walk');await W(600)}
  const B=(HUB.props||[]).filter(q=>q.t==='bench'&&q.alive!==false&&q.im).sort((a,b)=>Math.hypot(a.x-RO.x,a.z-RO.z)-Math.hypot(b.x-RO.x,b.z-RO.z)).slice(0,max||1e9),fails=[];let n=0;
  for(const q of B){OF.sit=null;OF.x=q.x+Math.sin(q.ry||0)*-2.2;OF.z=q.z+Math.cos(q.ry||0)*-2.2;OF.y=groundAt(OF.x,OF.z,OF.y+3);OF.h=(q.ry||0)+Math.PI;OF.vx=OF.vz=0;OF.spd=0;OF_use({k:'bench',o:q});
    const e=performance.now()+3000;while(performance.now()<e&&!(OF.sit&&OF.sit.t>=1))await W(50);await W(60);const r=OF_sitChk();n++;if(!r.ok)fails.push(Object.assign({x:Math.round(q.x),z:Math.round(q.z)},r));OF.sit=null}
  return{n,bad:fails.length,fails:fails.slice(0,8)}}
window.OF_sitAll=OF_sitAll;
