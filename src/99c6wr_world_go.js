// world-r30b: GO world/* (lazy chunk, phone profile): the gauntlet "seen" rows as checks of what the player SEES (REVIEW_2K_28: the first GOs reused the fix's own geometry).
// Every GO runs the game's real per-frame code (roamMarks, LV_birdStep, roamCam + FC, the card's START button) and judges with a generic scan of everything drawn
// (any visible mesh / instanced instance, its own bounding box), never with FC_body / FC_clear. The car is put back where it was.
// world/pickup: mark icon <= 3 m up with a contact shadow, star badge <= 6 m, and the icon's real opacity >= 0.75 at 25 / 12 / 6 m (garage + 2 quests).
// world/roof: 0 HDR neon strips along roof edges. world/birds: the car at ~80 km/h (GAS key) scatters a real flock: <= 10 % of flying-bird samples
// within +-2.5 m of the camera height inside 45 m, none within 3 m of the lens. world/mstart: 3 quests started with the card's START button, car at the
// ring point nearest a street prop: 0 drawn objects inside the car body after START. world/camprop: a prop right behind the car, real chase-camera
// frames for 1.5 game s: 0 frames with the lens inside a drawn object after 0.3 s.
const WRG={};// world/camprop judges street props; frames with the lens inside a building are counted in r.bld (INFO, a separate seen row)
const WRG_V=new THREE.Vector3(),WRG_M=new THREE.Matrix4(),WRG_I=new THREE.Matrix4(),WRG_B=new THREE.Box3();
function WRG_wait(sec,maxMs){const t0=T,w0=performance.now();return new Promise(res=>{const f=()=>{if(T-t0>=sec||performance.now()-w0>(maxMs||60000))return res(T-t0);setTimeout(f,40)};f()})}
function WRG_save(){return{x:RO.x,y:RO.y,z:RO.z,h:RO.h,vh:RO.vh,v:RO.v}}
function WRG_back(o){Object.assign(RO,o);RO.v=0;try{camSnap=true}catch(e){}}
// drawn objects whose own box holds a world point (instances: by their drawn slots; meshes: only small ones, not the city batches / ground)
function WRG_inside(pts,R,skip){const out=[];const near=pts[0];scene.traverse(o=>{if(!(o.isMesh||o.isInstancedMesh)||!o.geometry||skip(o))return;let v=true,q=o;while(q){if(!q.visible){v=false;break}q=q.parent}if(!v)return;
  const g=o.geometry;if(!g.boundingBox){if(!g.attributes.position||!g.attributes.position.array)return;g.computeBoundingBox()}const bb=g.boundingBox,sz=bb.getSize(WRG_V).length();if(!o.isInstancedMesh&&sz>16)return;
  const test=mw=>{WRG_I.copy(mw).invert();for(const p of pts){const l=p.clone().applyMatrix4(WRG_I);WRG_B.copy(bb).expandByScalar(.05);if(WRG_B.containsPoint(l))return true}return false};
  if(o.isInstancedMesh){const a=o.instanceMatrix.array,n=o.count;for(let i=0;i<n;i++){const e=i*16;if(a[e]===0&&a[e+5]===0&&a[e+10]===0)continue;WRG_M.fromArray(a,e).premultiply(o.matrixWorld);WRG_V.setFromMatrixPosition(WRG_M);if(WRG_V.distanceTo(near)>R)continue;if(test(WRG_M)){const e=WRG_M.elements,sz=bb.getSize(WRG_V),w=Math.max(sz.x*Math.hypot(e[0],e[1],e[2]),sz.y*Math.hypot(e[4],e[5],e[6]),sz.z*Math.hypot(e[8],e[9],e[10]));const pu=o.parent&&o.parent.userData||{};out.push((w>6||'athB' in pu||'athB' in o.userData?'bld ':'')/* buildings: > 6 m, or the building-variety / Athens building layers */+(o.name||'im')+':'+i+'/'+(o.parent&&(o.parent.name||o.parent.type))+'{'+Object.keys(o.userData).slice(0,3)+'} '+w.toFixed(1)+'m')}}}
  else{o.getWorldPosition(WRG_V);if(WRG_V.distanceTo(near)>R)return;if(test(o.matrixWorld))out.push(o.name||o.type)}});
  try{if(LV.cl)for(const C of LV.cl.L)if(C.on)for(const q of C.pr||[])if(!q.dead&&!q.fh&&pts.some(p=>(p.x-q.x)**2+(p.z-q.z)**2<q.r*q.r&&p.y<C.y+2.6&&p.y>C.y))out.push('LV:'+C.k)}catch(e){}return out}
function WRG_carMesh(o){let q=o;while(q){if(q===(pl&&pl.mesh)||q.userData&&(q.userData.carG!==undefined||q.userData.sky))return true;q=q.parent}return false}
function WRG_pickup(){const r={marks:0,hi:0,noSh:0,badge:0,worst:0,op:[]},P=new THREE.Vector3(),s0=WRG_save();
  for(const m of RO.marks||[]){if(!m.sp||!m.g)continue;r.marks++;m.g.updateMatrixWorld(true);m.sp.getWorldPosition(P);const g=groundY(m.x,m.z),h=P.y-g;if(h>3)r.hi++;r.worst=Math.max(r.worst,+h.toFixed(2));if(!m.sh||m.sh.parent!==m.g)r.noSh++;
    if(m.sb){m.sb.getWorldPosition(P);if(P.y-g>6)r.badge++}}
  const pick=[(RO.marks||[]).find(m=>m.kind==='garage'),...(RO.marks||[]).filter(m=>m.kind==='quest'&&!markLocked(m)).slice(0,2)].filter(Boolean);
  for(const m of pick)for(const d of[25,12,6]){RO.x=m.x-Math.sin(m.h||0)*d;RO.z=m.z-Math.cos(m.h||0)*d;roamMarks(1/30);r.op.push(+m.sp.material.opacity.toFixed(2))}
  WRG_back(s0);roamMarks(1/30);r.minOp=Math.min(...r.op);r.ok=r.marks>0&&!r.hi&&!r.noSh&&!r.badge&&r.op.length>=6&&r.minOp>=.75;return r}
function WRG_roof(){const r={neon:0,strips:0,ex:[]},NE=new Set(HUB.NEONS||[]);
  HUB.grp.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||!o.geometry)return;const ms=Array.isArray(o.material)?o.material:[o.material];
    for(const m of ms){if(!m)continue;if(NE.has(m)){r.neon++;continue}if(!m.isMeshBasicMaterial||m.toneMapped!==false||m.map||!m.color||Math.max(m.color.r,m.color.g,m.color.b)<1.2)continue;
      const g=o.geometry;if(!g.boundingBox){if(!g.attributes.position||!g.attributes.position.array)continue;g.computeBoundingBox()}const b=g.boundingBox,h=b.max.y-b.min.y,L=Math.max(b.max.x-b.min.x,b.max.z-b.min.z);
      if(h<1.2&&L>6&&b.min.y>groundAt((b.min.x+b.max.x)/2,(b.min.z+b.max.z)/2,b.max.y)+8){r.strips++;if(r.ex.length<3)r.ex.push(m.color.getHexString()+'@'+(b.min.x|0)+','+(b.min.z|0))}}});
  r.ok=!r.neon&&!r.strips;return r}

function WRG_birds(){const B=LV.birds;if(!B)return Promise.resolve({err:'no birds'});const F=B.fl.find(q=>!q.gull);if(!F)return Promise.resolve({err:'no pigeon flock'});const s0=WRG_save(),r={n:0,band:0,minCam:1e9,scattered:false,wingInst:B.w.count,bodies:B.b.count,v:0};
  const fx=Math.sin(RO.h),fz=Math.cos(RO.h),x=RO.x+fx*60,z=RO.z+fz*60;F.on=true;F.st=0;F.t=0;F.x=x;F.z=z;F.y=groundAt(x,z,RO.y+5);for(const b of F.b){b.x=x+b.ox;b.z=z+b.oz;b.y=Math.max(0,groundAt(b.x,b.z,F.y+3));b.vx=b.vy=b.vz=0}
  const f0=LV_birdStep;LV_birdStep=function(dt){f0.apply(this,arguments);if(F.st===2){r.scattered=true;if(F.t>.5){const c=camera.position;for(const b of F.b){const hd=Math.hypot(b.x-c.x,b.z-c.z),d3=Math.hypot(hd,b.y-c.y);r.n++;if(hd<45&&Math.abs(b.y-c.y)<2.5)r.band++;r.minCam=Math.min(r.minCam,d3)}}}};
  RO.v=23;K.ArrowUp=true;const iv=setInterval(()=>{if(RO.v<20)RO.v=Math.max(RO.v,20);r.v=Math.max(r.v,+(RO.v*3.6).toFixed(0))},30);
  return WRG_wait(4,90000).then(()=>{clearInterval(iv);K.ArrowUp=false;LV_birdStep=f0;WRG_back(s0);r.minCam=+r.minCam.toFixed(1);r.bandPct=r.n?+(100*r.band/r.n).toFixed(1):100;
    r.ok=r.scattered&&r.n>20&&r.bandPct<=10&&r.minCam>=3&&r.wingInst===2*r.bodies;return r})}
function WRG_mstart(){const r={quests:0,started:0,before:0,after:0,ex:[]},s0=WRG_save(),ms=(RO.marks||[]).filter(q=>q.ev&&q.kind==='quest'&&qvUse(q)&&!markLocked(q)).slice(0,3);if(!ms.length)return Promise.resolve({err:'no quest marker'});
  const body=()=>{const fx=Math.sin(RO.h),fz=Math.cos(RO.h),y=RO.y+.8;return[-1.6,0,1.6].map(a=>new THREE.Vector3(RO.x+fx*a,y,RO.z+fz*a))};
  let k=0;const one=()=>{if(k>=ms.length)return Promise.resolve();const m=ms[k++];r.quests++;try{chAbort()}catch(e){}RO.card=null;
    // the ring point (r <= 8 m) nearest a drawn street prop: where a player can stop
    let best=null,bd=1e9;for(const l of HUB.pgrid.values())for(const p of l){if(!p.im||p.alive===false)continue;const d=Math.hypot(p.x-m.x,p.z-m.z);if(d<bd){bd=d;best=p}}
    const a=best&&bd<30?Math.atan2(best.x-m.x,best.z-m.z):m.h||0,rr=Math.min(8,Math.max(0,bd-1));RO.x=m.x+Math.sin(a)*rr;RO.z=m.z+Math.cos(a)*rr;RO.y=groundY(RO.x,RO.z);RO.h=m.h||0;RO.v=0;RO.cool=0;
    r.before+=WRG_inside(body(),12,WRG_carMesh).length;roamOpen(m);const go=document.getElementById('rcGo');if(go&&!go.disabled)go.click();
    return WRG_wait(1,30000).then(()=>{if(RO.ch)r.started++;const h=WRG_inside(body(),12,WRG_carMesh);r.after+=h.length;if(h.length&&r.ex.length<4)r.ex.push(m.ev.id+':'+h.slice(0,2).join('+'));try{chAbort()}catch(e){}return WRG_wait(.3,8000)}).then(one)};
  return one().then(()=>{WRG_back(s0);r.ok=r.started>=Math.min(3,ms.length)&&r.after===0;return r})}

// REVIEW_2K_31: everything FC holds hidden for > 0.6 s must sit on the car -> camera segment or around the lens (its own box, 0.8 m margin); START-hidden (ms) items are judged by world/mstart
const WRG_OFF=new Map(),WRG_R=new THREE.Ray(),WRG_X=new THREE.Box3(),WRG_Y=new THREE.Vector3();
function WRG_onLine(box){const c=camera.position,o=WRG_Y.set(RO.x,RO.y+1,RO.z),d=c.clone().sub(o),L=d.length();WRG_R.set(o,d.normalize());box.expandByScalar(.8);if(box.containsPoint(c))return true;const h=WRG_R.intersectBox(box,new THREE.Vector3());return!!h&&h.distanceTo(o)<=L}
function WRG_offLine(r,seen){const now=T,chk=(key,mk)=>{if(!seen.has(key))seen.set(key,now);if(now-seen.get(key)<.6)return;let b=null;try{b=mk()}catch(e){}const off=b&&!WRG_onLine(b);if(!off){WRG_OFF.delete(key);return}if(!WRG_OFF.has(key))WRG_OFF.set(key,now);if(now-WRG_OFF.get(key)>.5){/* off the line for > 0.5 s continuously (FC brings a prop back 0.4 s after the line is clear) */r.offLine++;if(r.offEx.length<4)r.offEx.push(String(key&&key.t?key.t+'@'+(key.x|0)+','+(key.z|0):key).slice(0,30))}};const live=new Set();
  for(const h of FC.hid){if(h.ms)continue;const p=h.p,key=p;live.add(key);chk(key,()=>{if(CVF_RX.test(p.t)){/* trees: the drawn crown (asset LOD size, FC margin removed) */const cr=FC_crown(p),r0=Math.max(.3,cr[0]-.8);return new THREE.Box3(new THREE.Vector3(p.x-r0,cr[1],p.z-r0),new THREE.Vector3(p.x+r0,cr[2],p.z+r0))}const g=p.im.geometry;return g.boundingBox.clone().applyMatrix4(h.m.clone().premultiply(p.im.matrixWorld))})}
  for(const[o,h]of FC.lf.hid){if(h.ms)continue;const key='lf:'+o.uuid;live.add(key);chk(key,()=>new THREE.Box3().setFromObject(o))}
  for(const[k,h]of FC.fd){if(h.ms)continue;const key='fd:'+(typeof k==='string'?k:(k._x!=null?'ped':'cafe'));const kk=typeof k==='string'?k:k;live.add(kk);
    chk(kk,()=>{if(typeof k==='string'){const[u,i]=k.split(':');let o=null;HUB.grp.traverse(q=>{if(q.uuid===u)o=q});return o.geometry.boundingBox.clone().applyMatrix4(h.m0.clone().premultiply(o.matrixWorld))}
      if(k._x!=null)return new THREE.Box3(new THREE.Vector3(k._x-.4,(k.y||0),k._z-.4),new THREE.Vector3(k._x+.4,(k.y||0)+2,k._z+.4));return new THREE.Box3(new THREE.Vector3(k.x-k.r,RO.y-1,k.z-k.r),new THREE.Vector3(k.x+k.r,RO.y+3,k.z+k.r))})}
  for(const k of[...seen.keys()])if(!live.has(k))seen.delete(k)}
function WRG_camprop(){const s0=WRG_save(),r={props:0,frames:0,inside:0,ex:[]};const L=[];for(const l of HUB.pgrid.values())for(const p of l){if(!p.im||p.alive===false||p.t==='lamp'||CVF_RX.test(p.t))continue;const d=Math.hypot(p.x-RO.x,p.z-RO.z);if(d<400)L.push([d,p])}
  const P=L.sort((a,b)=>a[0]-b[0]).map(q=>q[1]).filter(p=>{const g=p.im.geometry;if(!g.boundingBox)return false;return g.boundingBox.max.y-g.boundingBox.min.y>1.6}).slice(0,4);if(!P.length)return Promise.resolve({err:'no tall prop'});
  const f0=roamCam;let on=false,t0=0;r.offLine=0;r.offEx=[];const seen=new Map();roamCam=function(dt){const o=f0.apply(this,arguments);if(on&&T-t0>.3){WRG_offLine(r,seen);r.frames++;const h=WRG_inside([camera.position.clone()],10,WRG_carMesh),hp=h.filter(x=>!/^bld /.test(x));if(h.length>hp.length)r.bld=(r.bld||0)+1/* camera inside a BUILDING (Athens athB boxes): reported, not this row (props) */;if(hp.length){r.inside++;if(r.ex.length<4)r.ex.push(hp[0])}}return o};
  let k=0;const one=()=>{if(k>=P.length)return Promise.resolve();const p=P[k++];r.props++;const a=Math.atan2(RO.x-p.x,RO.z-p.z)||0;RO.h=RO.vh=a;RO.x=p.x+Math.sin(a)*6.5;RO.z=p.z+Math.cos(a)*6.5;RO.y=groundY(RO.x,RO.z);RO.v=0;camSnap=true;t0=T;on=true;
    return WRG_wait(1.5,40000).then(()=>{on=false}).then(one)};
  return one().then(()=>{roamCam=f0;WRG_back(s0);try{FC_restore(true)}catch(e){}r.fc={fd:FC.fdn,err:FC.fdErr||'',bv:FC.bv.L.length,prop:FC.prop,on:FC.on};r.ok=r.props>0&&r.frames>3&&r.inside===0&&r.offLine===0;return r})}
WRG.say=(n,r)=>'📍 '+n+' · '+JSON.stringify(r).slice(0,420)+(r.ok?' ✅ PASS':' ❌ FAIL');
// registered after every lazy chunk (XC.done): world/birds drives through traffic at speed, so these run after the why/* traffic items (gate order = item order)
(function WRG_reg(i){const C=window.__chk;if(C&&C.GO&&C.items&&C.goSay&&XC.done){
  const add=(id,t)=>{const o=C.items.find(q=>q.ver==='world'&&q.id===id);if(o)o.text='world-r30b · world/'+id+': '+t;else C.items.push({ver:'world',id,area:'city',text:'world-r30b · world/'+id+': '+t})};
  add('pickup','every mark icon sits ≤ 3 m up over its ring with a contact shadow and stays readable (opacity ≥ 0.75) at 25, 12 and 6 m (garage + 2 quests; REVIEW_2K_28 found 31 % at 26 m).');
  add('roof','no neon strip along any roof edge (gauntlet seen/roof-seam).');
  add('birds','driving at ~80 km/h into a pigeon flock: ≤ 10 % of the flying birds sit at camera height (± 2.5 m, inside 45 m), none within 3 m of the lens (REVIEW_2K_28: grey drones at camera height).');
  add('mstart','3 quests started with the card START button, the car stopped at the ring point nearest a street prop: nothing drawn inside the car body after START (gauntlet seen/prop-on-car).');
  add('camprop','a tall street prop right behind the car, real chase-camera frames: the lens is never inside anything drawn after 0.3 s (gauntlet seen/camera-in-props, REVIEW_2K_28 cafe-at-lens).');
  const sync={pickup:WRG_pickup,roof:WRG_roof},asy={birds:WRG_birds,mstart:WRG_mstart,camprop:WRG_camprop};
  for(const id in sync)C.GO['world/'+id]=['fra','ath'].map(c=>({c,n:id,secs:20,fn:()=>{let r;try{r=sync[id]()}catch(e){r={err:String(e).slice(0,160)}}return WRG.say(id.toUpperCase(),r)}}));
  for(const id in asy)C.GO['world/'+id]=['fra','ath'].map(c=>({c,n:id,secs:120,fn:()=>{const tok=WRG.tok=(WRG.tok||0)+1;/* a late result of an earlier item must not land on the next item's line */try{asy[id]().then(r=>{if(tok===WRG.tok)C.goSay(WRG.say(id.toUpperCase(),r))},e=>{if(tok===WRG.tok)C.goSay('📍 '+id+' · '+e+' ❌ FAIL')})}catch(e){return '📍 '+id+' · '+e+' ❌ FAIL'}return '📍 '+id.toUpperCase()+' · running…'}}));return}
 if(i<600)setTimeout(()=>WRG_reg(i+1),100)})(0);
({WRG_pickup,WRG_roof,WRG_birds,WRG_mstart,WRG_camprop,WRG_inside,WRG_carMesh})
