// ===== OF (v89a): ON FOOT P1 (docs/ON_FOOT_PLAN.md §4 P1). EXIT at a stop, the minifig steps out, the car stays parked; walk / run / jump with a
// floating left stick (touch) or WASD/arrows + Shift + Space (PC); camera behind; ENTER near your own car or any parked car (traffic cars with c.pk).
// State RO.foot: 'car' | 'exit' (0.35 s step-out) | 'walk' | 'enter' (0.45 s tween to the door). BRAKE (#tB) becomes 🚪 EXIT only once the car is
// stopped and idle, and 🚪 ENTER on foot near a car (hidden otherwise). On foot: ◀ ▶ DRIFT FIRE hidden, GAS = RUN, BOOST = JUMP (5 controls with ❚❚).
// Entering another car swaps bodies: the body you leave becomes a static parked group, the parked traffic car's instanced body is lifted into the
// player car (3 one-instance meshes, same geometry/material/tint), its pool slot is retired (dead = 1e9). Physics stay the player car's.
const OF={cyIn:0,cp:0,camT:9,steady:0,inA:null,hPrev:null,recen:false,cam:{id:null,x:0,y:0,t0:0,tap:0},st:'car',fig:null,x:0,z:0,y:0,h:0,vx:0,vz:0,vy:0,air:false,ph:0,spd:0,cy:0,camB:4.5,car:null,vs:[],taken:[],near:null,tw:null,idle:0,btn:'',
  stick:{id:null,on:false,x0:0,y0:0,dx:0,dy:0},keys:{},n:{exit:0,enter:0,swap:0,jack:0,stuckF:0,walkF:0,camIn:0},star:{n:0,t:0},jk:null,fl:null,cur:{own:true},figH:0,log:[]};
const OF_R=.35,OF_STEP=.45,OF_WALK=1.6,OF_RUN=5,OF_G=18,OF_JV=Math.sqrt(2*18*.9),OF_FIGH=1.8,OF_NEAR=1.7,OF_JV_MAX=7,OF_JREACH=3;
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
  const k=Math.min(1,OF.spd/OF_WALK),run=OF.spd>OF_WALK*1.4,hz=run?3.4:2.2;OF.ph+=dt*hz*6.283*Math.min(1,OF.spd/OF_WALK+.15);
  const a=OF.air?.5:Math.sin(OF.ph)*(run?.75:.5)*k,M=F.M;if(M.lL)M.lL.rotation.x=a;if(M.lR)M.lR.rotation.x=-a;if(M.aL)M.aL.rotation.x=-a*.9-(OF.air?.9:0);if(M.aR)M.aR.rotation.x=a*.9-(OF.air?.9:0);
  if(M.b)M.b.position.y=OF.air?0:Math.abs(Math.sin(OF.ph))*.02*k}
// --- cars around the walker: the parked current body, static parked bodies, parked traffic (pk) — and moving traffic as obstacles
const OF_cH=c=>{const N=HUB.nodes,A=N[c.a],B=N[c.b];if(!A||!B)return 0;return Math.atan2(B.x-A.x,B.z-A.z)};
const OF_box=(x,z,h,hw=1.02,hd=2.35)=>({x,z,hw,hd,c:Math.cos(h),s:Math.sin(h),h:999});
function OF_cars(withTraffic){const L=[];if(OF.car)L.push({k:'cur',x:OF.car.x,z:OF.car.z,y:OF.car.y,h:OF.car.h,hw:OF.car.hw,hd:OF.car.hd,ref:OF.car});for(const v of OF.vs)L.push({k:'grp',x:v.x,z:v.z,y:v.y,h:v.h,hw:v.hw,hd:v.hd,ref:v});
  if(withTraffic&&HUB.cars)for(const c of HUB.cars){if(c.dead>0||c.x==null)continue;const dx=c.x-OF.x,dz=c.z-OF.z;if(dx*dx+dz*dz>30*30)continue;L.push({k:c.pk&&!(c.cv>.3)?'park':'traf',x:c.x,z:c.z,y:c.y||0,h:OF_cH(c),ref:c})}return L}
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
  if(foot)want=RO.foot==='walk'&&OF.near?(OF.near.k==='traf'?'take':'enter'):'hide';else want=OF_canExit()?'exit':'brake';
  if(want!==OF.btn){OF.btn=want;B.classList.toggle('ofDoor',want==='exit'||want==='enter'||want==='take');B.classList.toggle('ofHide',want==='hide');
    if(want==='exit')B.textContent='🚪 EXIT';else if(want==='enter')B.textContent='🚪 ENTER';else if(want==='take')B.textContent='🚗 TAKE';else B.textContent=TOUCH.park?'GO ▶':'BRAKE';OF_doorPlace(B,want==='exit'||want==='enter'||want==='take')}
  if(foot!==!!OF.lblFoot){OF.lblFoot=foot;if(G)G.innerHTML=foot?'RUN':OF_lbl0.g;if(N)N.innerHTML=foot?'JUMP':OF_lbl0.n;const u=document.querySelector('#roamGauge small');if(u)u.textContent=foot?'ON FOOT':'KM/H';if(foot&&OF.dom)requestAnimationFrame(()=>OF.dom.home())}}
// EXIT is offered only when the car is stopped and idle (no gas/brake held for 0.5 s), on the ground, not in a cutscene/menu/event, not a boat
function OF_canExit(){if(state!=='roam'||!RO.on||RO.frozen||RO.wk||!pl||pl.air||RO.sp||RO.card||RO.mapOpen||RO.story)return false;if(typeof M1!=='undefined'&&M1.cs)return false;
  if(pl.boatMode||(pl.vmode&&pl.vmode!=='car'&&pl.vmode!=='4x4'))return false;if(TOUCH.park)return Math.abs(RO.v)<2.2;return Math.abs(RO.v)<2.2&&OF.idle>.5}
function OF_door(){if(RO.foot==='car'){if(OF_canExit())OF_exit()}else if(RO.foot==='walk'&&OF.near)OF_enter(OF.near)}
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
      OF.cur={own:false,inst:body,lowL};OF.n.swap++;try{OF_seat(ud,body)}catch(e){console.warn('OF seat',e)}}}
  else OF_poseCar(OF.car.x,OF.car.z,OF.car.y,OF.car.h);
  OF_drv(pl.mesh,true);OF.car=null;if(OF.fig)OF.fig.g.visible=false;RO.foot='car';OF.idle=0;camSnap=true;OF.n.enter++;TOUCH.gas=TOUCH.brake=TOUCH.boost=false;
  // far static bodies are dropped (borrowed ones only; your own car always stays where you left it)
  for(const v of[...OF.vs])if(!v.own&&Math.hypot(v.x-RO.x,v.z-RO.z)>300){HUB.grp.remove(v.g);OF.vs.splice(OF.vs.indexOf(v),1)}
  AU.sfx&&AU.sfx('go');OF.log.push('enter:'+o.k+'@'+Math.round(RO.x)+','+Math.round(RO.z));OF_btns()}
// --- walking physics: camera-relative stick, accel 20 m/s², turn 720°/s, buildings (roamHit + bldPush), cars (oriented boxes), props, kerbs ≤ 0.45 m
function OF_input(){const S=OF.stick;let fx=0,fy=0,run=false,jump=false;
  if(S.on){const l=Math.hypot(S.dx,S.dy);if(l>.1){const m=Math.min(1,(l-.1)/.9),c=m*m;fx=S.dx/l*c;fy=S.dy/l*c;run=l>.85}}
  else{const kx=(K.KeyD||K.ArrowRight?1:0)-(K.KeyA||K.ArrowLeft?1:0),ky=(K.KeyW||K.ArrowUp?1:0)-(K.KeyS||K.ArrowDown?1:0),l=Math.hypot(kx,ky);if(l){fx=kx/l;fy=ky/l}run=!!(K.ShiftLeft||K.ShiftRight)}
  if(TOUCH.gas)run=true;jump=!!(TOUCH.boost||K.Space);return{fx,fy,run,jump}}
function OF_collide(x,z,y){for(let it=0;it<4;it++){const b=roamHit(x,z,OF_R,y+1);if(!b)break;const p=bldPush(b,x,z,OF_R);x=p[0];z=p[1]}
  for(const o of OF_cars(true)){if(Math.abs((o.y||0)-y)>2)continue;const b=OF_box(o.x,o.z,o.h,o.hw,o.hd);if(bHit(b,x,z,OF_R)){const p=bldPush(b,x,z,OF_R);x=p[0];z=p[1]}}
  const PG=HUB.pgrid,D=HUB.ptypes;if(PG&&D){const kx=Math.floor(x/16),kz=Math.floor(z/16);for(let a=-1;a<=1;a++)for(let c=-1;c<=1;c++){const L=PG.get((kx+a)*10000+kz+c);if(!L)continue;
    for(const p of L){if(!p.alive)continue;const d=D[p.t];if(!d||Math.abs((p.y||0)-y)>2)continue;const r=Math.max(.15,Math.min(1.1,d.r*.45))+OF_R,dx=x-p.x,dz=z-p.z,l=Math.hypot(dx,dz);if(l<r&&l>1e-4){x=p.x+dx/l*r;z=p.z+dz/l*r}}}}
  return[x,z]}
function OF_walk(dt){const I=OF_input(),il=Math.hypot(I.fx,I.fy),ia=Math.atan2(I.fx,I.fy);
  // v89b1: the stick's frame is the camera yaw, frozen while the stick direction is held (an auto-recentre never steers the walker = no "rounds"); follows a manual orbit
  if(il<.05||OF.camT<.05||OF.inA==null||Math.abs(angDiff(ia,OF.inA))>.35){OF.cyIn=OF.cy;OF.inA=il<.05?null:ia}
  const cy=OF.cyIn,fw=[Math.sin(cy),Math.cos(cy)],rt=[-Math.cos(cy),Math.sin(cy)];
  const wx=fw[0]*I.fy+rt[0]*I.fx,wz=fw[1]*I.fy+rt[1]*I.fx,m=Math.min(1,Math.hypot(wx,wz)),top=I.run?OF_RUN:OF_WALK,tv=m*top;
  const tx=m>1e-3?wx/Math.hypot(wx,wz)*tv:0,tz=m>1e-3?wz/Math.hypot(wx,wz)*tv:0,ax=tx-OF.vx,az=tz-OF.vz,al=Math.hypot(ax,az),amax=20*dt*(OF.air?.35:1);
  if(al>amax){OF.vx+=ax/al*amax;OF.vz+=az/al*amax}else{OF.vx=tx;OF.vz=tz}
  OF.spd=Math.hypot(OF.vx,OF.vz);if(OF.spd>.2){const want=Math.atan2(OF.vx,OF.vz),e=angDiff(want,OF.h),k=Math.min(Math.abs(e),12.57*dt);OF.h+=Math.sign(e)*k}
  if(I.jump&&!OF.air&&!OF.jHeld){OF.vy=OF_JV;OF.air=true;AU.sfx&&AU.sfx('pick')}OF.jHeld=I.jump;
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
  if(OF.car&&pl)pl.mesh.position.set(OF.car.x,OF.car.y,OF.car.z);
  OF.near=RO.foot==='walk'?OF_nearCar():null;OF_figPose(dt);
  if(AU.engine)AU.engine(pl,0,false);if(AU.scrape)AU.scrape(false);
  try{hubTrafficStep(dt)}catch(e){if(!OF.e1){OF.e1=1;console.warn('OF traffic',e)}}try{studFXStep(dt)}catch(e){}try{roamHud()}catch(e){}
  try{const s=$('#rgSpd');if(s)s.textContent='🚶'}catch(e){}OF_btns()}
// --- foot camera: 4.5 m back, 2.2 m up, yaw follows the walking direction (not when walking towards the camera), pulled in before walls
function OF_cam(dt){if(OF.car&&pl)pl.mesh.position.set(OF.car.x,OF.car.y,OF.car.z);
  OF_camYaw(dt);
  const fx=Math.sin(OF.cy),fz=Math.cos(OF.cy),hy=OF.y+2.2+Math.sin(OF.cp)*4.2;const PC=OF_cars(false).map(o=>OF_box(o.x,o.z,o.h,o.hw,o.hd));let back=4.5,carUp=0;for(let d=.3;d<=4.8;d+=.3){const x=OF.x-fx*d,z=OF.z-fz*d;if(roamHit(x,z,.35,hy)){back=Math.max(.25,d-.5);break}if(!carUp&&PC.some(b=>bHit(b,x,z,.3)))carUp=1}
  OF.camB=back<OF.camB?back:OF.camB+(back-OF.camB)*Math.min(1,dt*3);const cx=OF.x-fx*OF.camB,cz=OF.z-fz*OF.camB;
  OF.camU=(OF.camU||0)+((carUp?1.6:0)-(OF.camU||0))*Math.min(1,dt*4);const cyv=Math.max(hy+OF.camU,groundAt(cx,cz,hy)+.6);camera.position.set(cx,cyv,cz);{const la=2.5*clamp((OF.camB-.4)/3.6,0,1);camera.lookAt(OF.x+fx*la,OF.y+1.25-(1-la/2.5)*.4,OF.z+fz*la)};
  if(roamHit(cx,cz,.3,cyv))OF.n.camIn++;camera.fov+=(pFov(TUNE.fov||62)-camera.fov)*Math.min(1,dt*4);camera.updateProjectionMatrix()}
// parked cars stay parked while you walk (the lively-city parker would re-park them relative to the walker)
if(typeof LV_parkStep==='function')LV_parkStep=(f=>function(){if(RO.foot&&RO.foot!=='car')return;return f.apply(this,arguments)})(LV_parkStep);
// borrowed body: lift ud.m so its lowest tyre point sits CR_TYRE_Y above the road (same rule as CR_carPose for real wheels)
const OF_v3=new THREE.Vector3();
function OF_lift(){const C=OF.cur;if(C.own||C.lowL==null||!pl||pl.air||(pl.boatK||0)>.5)return;const ud=pl.mesh.userData;pl.mesh.updateMatrixWorld(true);OF_v3.set(0,C.lowL,0).applyMatrix4(ud.m.matrixWorld);
  const lift=clamp(groundAt(RO.x,RO.z,RO.y+1)+CR_TYRE_Y-OF_v3.y,-.4,.4);ud.m.position.y+=lift/(pl.mesh.scale.y||1);ud.m.updateMatrixWorld(true)}
// --- per-frame hooks (outermost wrappers: none of the car-only wrappers run on foot)
roamStep=(f=>function(dt){if(RO.foot&&RO.foot!=='car'){if(state==='roam'&&!RO.frozen)OF_step(dt);return}
  const busy=TOUCH.gas||TOUCH.brake||K.ArrowUp||K.ArrowDown||K.KeyW||K.KeyS;OF.idle=busy||Math.abs(RO.v)>2.2?0:OF.idle+(dt||0);const r=f(dt);try{OF_lift()}catch(e){}try{OF_fleeStep(dt||0);OF_starStep(dt||0)}catch(e){if(!OF.e2){OF.e2=1;console.warn('OF flee',e)}}OF_dom();OF_btns();return r})(roamStep);
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
  if(RO.foot==='walk'){e.preventDefault();if(OF.near)OF_enter(OF.near)}else if(RO.foot==='car'&&!OF_m1()&&OF_canExit()){e.preventDefault();OF_exit()}},true);
function OF_api(){return{state:RO.foot,x:+OF.x.toFixed(2),z:+OF.z.toFixed(2),y:+OF.y.toFixed(2),h:+OF.h.toFixed(3),spd:+OF.spd.toFixed(2),air:OF.air,near:OF.near&&{k:OF.near.k,x:+OF.near.x.toFixed(1),z:+OF.near.z.toFixed(1)},
  car:OF.car&&{x:+OF.car.x.toFixed(1),z:+OF.car.z.toFixed(1),h:+OF.car.h.toFixed(3)},parked:OF.vs.length,taken:OF.taken.length,own:OF.cur.own,btn:OF.btn,figH:OF.figH,n:Object.assign({},OF.n),log:OF.log.slice(-8),stk:OF.stk||[],canExit:OF_canExit(),doorGap:OF.doorGap,idle:+OF.idle.toFixed(2),
  stars:OF.star.n,starT:+OF.star.t.toFixed(1),jack:OF.jk&&{t:+OF.jk.t.toFixed(2),ph:OF.jk.ph},flee:OF.fl&&{t:+OF.fl.t.toFixed(2),d:+OF.fl.d.toFixed(1),x:+OF.fl.x.toFixed(1),z:+OF.fl.z.toFixed(1),ph:OF.fl.ph},athPk:OF.athPk||0,hp:100,lock:null,ko:0}}
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
  if(c.dead>0||c.x==null){OF_jackEnd();RO.foot='walk';return false}
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
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv0),transparent:true,depthWrite:false}));s.scale.set(1.3,.65,1);s.position.y=2.45;s.renderOrder=5;return s}
function OF_fleeStart(c,h){OF_fleeEnd();const im=HUB.cim[c.k],col=new THREE.Color('#d8302a');try{if(im&&im.instanceColor)im.getColorAt(c.j,col)}catch(e){}
  const F=OF_figMake(GAR_riv('#'+col.getHexString()),{armsUp:1}),fx=Math.sin(h),fz=Math.cos(h),rx=-fz,rz=fx,y0=c.y!=null?c.y:OF.y,bub=OF_bubble();F.g.add(bub);F.g.rotation.order='YXZ';
  HUB.grp.add(F.g);F.g.visible=true;
  // seat (inside, left of the centre line) → out through the door → thrown 1.2 m further back, a stumble, then the run (away from the car's left side)
  const s={x:c.x-rx*.3-fx*.1,z:c.z-rz*.3-fz*.1},o={x:c.x-rx*1.6-fx*.4,z:c.z-rz*1.6-fz*.4},l={x:c.x-rx*2.6-fx*1.3,z:c.z-rz*2.6-fz*1.3};let ra=Math.atan2(-rx-fx*.5,-rz-fz*.5);
  OF.fl={F,bub,t:0,ph:'out',s,o,l,y0,x:s.x,z:s.z,y:y0+.45,h:Math.atan2(rx,rz),ra,d:0,lph:0,cx:c.x,cz:c.z}}
function OF_fleeEnd(){const L=OF.fl;if(!L)return;if(L.F.g.parent)L.F.g.parent.remove(L.F.g);L.F.g.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.isSprite){o.material.map.dispose();o.material.dispose()}});OF.fl=null}
function OF_fleeStep(dt){const L=OF.fl;if(!L)return;L.t+=dt;const F=L.F,M=F.M;let pitch=0,legs=0;
  if(L.t<.45){const k=L.t/.45,e=k*k*(3-2*k);L.x=L.s.x+(L.o.x-L.s.x)*e;L.z=L.s.z+(L.o.z-L.s.z)*e;const g=groundAt(L.x,L.z,L.y0+1.5);L.y=g+(L.y0+.45-g)*(1-k)+Math.sin(k*Math.PI)*.35;pitch=-.35*e;legs=.6}
  else if(L.t<1.05){const k=(L.t-.45)/.6,e=1-(1-k)*(1-k);L.x=L.o.x+(L.l.x-L.o.x)*e;L.z=L.o.z+(L.l.z-L.o.z)*e;L.y=groundAt(L.x,L.z,L.y0+1.5)+Math.sin(k*Math.PI)*.25;pitch=-.35+Math.sin(k*Math.PI*2.5)*.45*(1-k);L.lph+=dt*14;legs=Math.sin(L.lph)*.6;L.ph='stumble'}
  else if(L.t<1.5){L.y=groundAt(L.x,L.z,L.y+1);L.h+=angDiff(L.ra,L.h)*Math.min(1,dt*10);L.ph='turn';L.lph+=dt*10;legs=Math.sin(L.lph)*.3}
  else{L.ph='run';const v=OF_RUN;let ok=false;for(const da of[0,.45,-.45,.9,-.9,1.5,-1.5,2.4,-2.4]){const a=L.ra+da,nx=L.x+Math.sin(a)*v*dt,nz=L.z+Math.cos(a)*v*dt,g=groundAt(nx,nz,L.y+.6);
      if(g>L.y+.5||roamHit(nx,nz,.3,L.y+1)||(CID==='fra'&&inRiver(nx,nz)))continue;L.ra=a;L.d+=Math.hypot(nx-L.x,nz-L.z);L.x=nx;L.z=nz;L.y=g;ok=true;break}
    if(!ok)L.ra+=Math.PI*.5;L.h+=angDiff(L.ra,L.h)*Math.min(1,dt*10);L.lph+=dt*3.4*6.283;legs=Math.sin(L.lph)*.8;L.y+=Math.abs(Math.sin(L.lph))*.04}
  F.g.position.set(L.x,L.y,L.z);F.g.rotation.set(pitch,L.h+Math.PI,0);if(M.lL)M.lL.rotation.x=legs;if(M.lR)M.lR.rotation.x=-legs;
  if(M.b)M.b.position.y=0;L.bub.visible=L.t>.25&&L.t<2.1;if(L.bub.visible)L.bub.material.rotation=Math.sin(L.t*20)*.06;
  if(L.t>7.5||Math.hypot(L.x-RO.x,L.z-RO.z)>120)OF_fleeEnd()}
// --- your minifig in the seat of a borrowed body (traffic geometry has no driver): GAR_fig sit pose, same scale as the walker, hidden on EXIT
function OF_seat(ud,body){const F=OF_figBuild(),P=[],Q=[];GAR_fig(GB_figGet(),P,Q,true);const g=mergeGeometries(P.concat(Q).map(q=>{q=q.index?q.toNonIndexed():q;for(const a of Object.keys(q.attributes))if(a!=='position'&&a!=='normal'&&a!=='color')q.deleteAttribute(a);return q}));
  g.computeBoundingBox();const fb=g.boundingBox;ud.m.updateMatrixWorld(true);const m4=new THREE.Matrix4(),bx=new THREE.Box3(),B=new THREE.Box3(),G=new THREE.Box3();
  for(let i=0;i<body.length;i++){const q=body[i];if(i===1||!q)continue;if(!q.geometry.boundingBox)q.geometry.computeBoundingBox();q.getMatrixAt(0,m4);m4.premultiply(ud.m.matrixWorld);bx.copy(q.geometry.boundingBox).applyMatrix4(m4);(i===2?G:B).union(bx)}
  const top=(G.isEmpty()?B.max.y-.12:Math.min(G.max.y,B.max.y)-.06),h=RO.h,s=F.s,y=top-fb.max.y*s,cz=G.isEmpty()?0:((G.min.x+G.max.x)/2-RO.x)*Math.sin(h)+((G.min.z+G.max.z)/2-RO.z)*Math.cos(h);
  const w=new THREE.Matrix4().compose(new THREE.Vector3(RO.x+Math.sin(h)*(cz-.15),y,RO.z+Math.cos(h)*(cz-.15)),new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),h+Math.PI),new THREE.Vector3(s,s,s));
  w.premultiply(new THREE.Matrix4().copy(ud.m.matrixWorld).invert());const m=new THREE.Mesh(g,GB_MAT);w.decompose(m.position,m.quaternion,m.scale);m.userData.ofSeat=1;m.userData.of=1;m.castShadow=false;ud.m.add(m);OF.seat=m;return m}
// --- wanted stars (stub for P4): +n per crime, one star drops after 60 s without a new crime
function OF_crime(n,why){const S=OF.star;S.n=Math.min(5,S.n+n);S.t=60;OF.log.push('★+'+n+':'+why);OF_starHud()}
function OF_starStep(dt){const S=OF.star;if(!S.n)return;S.t-=dt;if(S.t<=0){S.n--;S.t=S.n?60:0;OF_starHud()}}
function OF_starHud(){let e=document.getElementById('ofStar');if(!e){const G=$('#roamGauge');if(!G)return;e=document.createElement('span');e.id='ofStar';G.appendChild(e);
    const st=document.createElement('style');st.textContent='#ofStar{font:900 14px system-ui;color:#ffd12c;text-shadow:0 1px 2px #000,0 0 6px rgba(255,190,0,.6);letter-spacing:.02em;white-space:nowrap;align-self:center}';document.head.appendChild(st)}
  e.textContent=OF.star.n?'★'+OF.star.n:'';e.style.display=OF.star.n?'':'none'}
// --- Athens: kerb-parked cars on g-streets (LV_park1 skips them: their traffic runs on the centre line)
function OF_athPark1(C,far){const N=HUB.nodes,fx=Math.sin(RO.h),fz=Math.cos(RO.h);let cand=null;
  for(let k=0;k<12&&!cand;k++){const c=C[Math.floor(R()*C.length)];if(c.pk||c.route||c.tr||c.dead>0||c.crW||c.ofJ||HCAR[c.k][0]==='#')continue;const dx=c.x-RO.x,dz=c.z-RO.z,d=Math.hypot(dx,dz);if(d>200||dx*fx+dz*fz<-d*.3&&!LV_seen(c.x,c.y||0,c.z))cand=c}
  if(!cand)return;const nd=LV_edges(far?30:70,far?100:130,.6).filter(e=>Math.min(e.s,e.L-e.s)>14);
  for(let k=0;k<Math.min(12,nd.length);k++){const E=nd[k],A=N[E.i],B=N[E.bi],L=E.L,W=Math.min(A.w||9,B.w||9);if(W<9)continue;const t=E.s/L,off=W/2-1.3,ux=(B.x-A.x)/L,uz=(B.z-A.z)/L,
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
  if(OF.spd>1&&tr<.35&&OF.camT>1.5)OF.steady+=dt;else OF.steady=0;
  if(OF.steady>1.5){const a=angDiff(OF.h,OF.cy);if(Math.abs(a)<2.3&&Math.abs(a)>.005){const r=Math.min(Math.abs(a),dt*Math.min(1.2,Math.abs(a)*1.5+.08));OF.cy+=Math.sign(a)*r}}}
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
