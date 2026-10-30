// world-r30b: GO world/* (lazy chunk, phone profile) = the gauntlet "seen" rows of beta.164 as state asserts. Alex: "no AI sloppiness".
// world/pickup: every roam mark icon (the 'floating wrench') sits <= 3 m above the ground with a contact shadow (HITRUN_GAP gap 2); the star badge <= 6 m.
// world/roof: 0 HDR neon strips (MeshBasic, toneMapped off, < 1.2 m tall) along roof edges in the city batch (gauntlet seen/roof-seam).
// world/birds: two mirrored wing instances per bird (a V flap, not a see-saw bar); a scattered pigeon flock levels off <= 14 m up (gauntlet seen/sky-debris).
const WRG={};
function WRG_pickup(){const r={marks:0,hi:0,noSh:0,badge:0,worst:0},P=new THREE.Vector3();
  for(const m of RO.marks||[]){if(!m.sp||!m.g)continue;r.marks++;m.g.updateMatrixWorld(true);m.sp.getWorldPosition(P);const g=groundY(m.x,m.z),h=P.y-g;if(h>3)r.hi++;r.worst=Math.max(r.worst,+h.toFixed(2));if(!m.sh||m.sh.parent!==m.g)r.noSh++;
    if(m.sb){m.sb.getWorldPosition(P);if(P.y-g>6)r.badge++}}
  try{if(typeof PIN_S!=='undefined'&&PIN_S.mesh&&PIN_S.mesh.visible)r.pin=1}catch(e){}
  r.ok=r.marks>0&&!r.hi&&!r.noSh&&!r.badge;return r}
function WRG_roof(){const r={neon:0,strips:0,ex:[]},NE=new Set(HUB.NEONS||[]);
  HUB.grp.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||!o.geometry)return;const ms=Array.isArray(o.material)?o.material:[o.material];
    for(const m of ms){if(!m)continue;if(NE.has(m)){r.neon++;continue}if(!m.isMeshBasicMaterial||m.toneMapped!==false||m.map||!m.color||Math.max(m.color.r,m.color.g,m.color.b)<1.2)continue;
      const g=o.geometry;if(!g.boundingBox){if(!g.attributes.position||!g.attributes.position.array)continue;g.computeBoundingBox()}const b=g.boundingBox,h=b.max.y-b.min.y,L=Math.max(b.max.x-b.min.x,b.max.z-b.min.z);
      if(h<1.2&&L>6&&b.min.y>groundAt((b.min.x+b.max.x)/2,(b.min.z+b.max.z)/2,b.max.y)+8){r.strips++;if(r.ex.length<3)r.ex.push(m.color.getHexString()+'@'+(b.min.x|0)+','+(b.min.z|0))}}});
  r.ok=!r.neon&&!r.strips;return r}
function WRG_birds(){const B=LV.birds;if(!B)return{err:'no birds (LV off?)'};const r={wingInst:B.w.count,bodies:B.b.count,mirror:0,flat:0,maxUp:0};
  const F=B.fl.find(q=>!q.gull)||null;if(!F)return Object.assign(r,{err:'no pigeon flock'});
  // a scatter like the car does it (LV_birdStep st 2), then 6 s of the real step
  const s0=LV_spot(24,70,false)||{x:RO.x+20,z:RO.z+20,y:RO.y};let y0=null,chk=0;F.on=true;F.x=s0.x;F.z=s0.z;F.y=s0.y;F.st=2;F.t=0;
  for(const b of F.b){b.x=s0.x+b.ox;b.z=s0.z+b.oz;b.y=Math.max(0,groundAt(b.x,b.z,s0.y+3));const a=b.h;b.vx=Math.sin(a)*7;b.vz=Math.cos(a)*7;b.vy=7}
  const M=new THREE.Matrix4(),xa=new THREE.Vector3(),xb=new THREE.Vector3();
  for(let i=0;i<170;i++){LV.t+=1/30;LV_birdStep(1/30);if(!F.on||F.st!==2)break;
    for(const b of F.b){if(y0==null)y0=Math.min(...F.b.map(q=>q.y));r.maxUp=Math.max(r.maxUp,+(b.y-y0).toFixed(1))}
    if(!chk&&i>=2){chk=1;const b=F.b[0];B.w.getMatrixAt(b.k*2,M);xa.setFromMatrixColumn(M,0);B.w.getMatrixAt(b.k*2+1,M);xb.setFromMatrixColumn(M,0);
      const s=xa.length()||1;if(xa.dot(xb)/(s*s)<-.2)r.mirror=1;if(Math.abs(xa.y/s)<.02&&Math.abs(xb.y/s)<.02)r.flat=1}}
  F.on=false;for(const b of F.b){B.b.setMatrixAt(b.k,_lvZ);B.w.setMatrixAt(b.k*2,_lvZ);B.w.setMatrixAt(b.k*2+1,_lvZ)}B.b.instanceMatrix.needsUpdate=B.w.instanceMatrix.needsUpdate=true;
  r.ok=r.wingInst===2*r.bodies&&r.mirror===1&&r.maxUp<=14;return r}
// world/mstart: the car is put ON a real street prop next to a quest marker and the quest starts: 0 visible props / street-life props within 4.5 m of the car or its first 12 m (gauntlet seen/prop-on-car)
function WRG_props(){const L=[];for(const l of HUB.pgrid.values())for(const p of l)if(p.im&&p.alive!==false&&p.t!=='lamp'&&!CVF_RX.test(p.t)&&FC_body(p)[0])L.push(p);return L}
function WRG_inZone(R){const x=RO.x,z=RO.z,fx=Math.sin(RO.h),fz=Math.cos(RO.h);let n=0;const near=(px,pz,r)=>{const dx=px-x,dz=pz-z,a=Math.max(0,Math.min(12,dx*fx+dz*fz)),ex=dx-fx*a,ez=dz-fz*a;return ex*ex+ez*ez<(R+r)**2};
  for(const l of HUB.pgrid.values())for(const p of l){if(!p.im||p.alive===false||p.t==='lamp'||CVF_RX.test(p.t))continue;const b=FC_body(p);if(b[0]&&near(p.x,p.z,Math.min(b[0],3)))n++}
  if(LV.cl)for(const C of LV.cl.L)if(C.on)for(const q of C.pr||[])if(!q.dead&&near(q.x,q.z,q.r))n++;return n}
function WRG_mstart(){const r={tries:0,before:0,left:0,ex:[]},ms=(RO.marks||[]).filter(q=>q.ev&&q.kind==='quest'&&qvUse(q)&&!markLocked(q)).slice(0,4),P=WRG_props();if(!ms.length)return{err:'no quest marker'};
  for(const m of ms){const p=P.filter(q=>q.alive!==false).sort((a,b)=>Math.hypot(a.x-m.x,a.z-m.z)-Math.hypot(b.x-m.x,b.z-m.z))[0];if(!p)continue;try{chAbort()}catch(e){}RO.card=null;
    RO.x=p.x;RO.z=p.z;RO.y=groundY(p.x,p.z);RO.v=0;r.tries++;r.before+=WRG_inZone(4.5);chStart(m,{});const n=WRG_inZone(4.5);r.left+=n;if(n&&r.ex.length<3)r.ex.push(p.t);try{chAbort()}catch(e){}}
  r.ok=r.tries>0&&r.before>0&&r.left===0;return r}
// world/camprop: the chase camera is put inside a street prop's body (kiosk, umbrella, statue...) behind the car: FC hides it on its next step (gauntlet seen/camera-in-props)
function WRG_camprop(){const P=WRG_props().filter(p=>{const b=FC_body(p);return b[2]-b[1]>1.4}).sort((a,b)=>Math.hypot(a.x-RO.x,a.z-RO.z)-Math.hypot(b.x-RO.x,b.z-RO.z)).slice(0,5);if(!P.length)return{err:'no prop'};
  const r={n:0,hid:0,ex:[]},c=camera.position.clone();for(const p of P){const b=FC_body(p);RO.x=p.x+7;RO.z=p.z;RO.h=Math.PI/2;RO.y=groundY(RO.x,RO.z);camera.position.set(p.x,(b[1]+b[2])/2,p.z);r.n++;FC_step();if(p.alive===false)r.hid++;else if(r.ex.length<3)r.ex.push(p.t)}
  camera.position.copy(c);FC_restore(true);r.ok=r.n>0&&r.hid===r.n;return r}
WRG.say=(n,r)=>'📍 '+n+' · '+JSON.stringify(r).slice(0,400)+(r.ok?' ✅ PASS':' ❌ FAIL');
(function WRG_reg(i){const C=window.__chk;if(C&&C.GO&&C.items&&C.goSay){
  const add=(id,t)=>{if(!C.items.some(q=>q.ver==='world'&&q.id===id))C.items.push({ver:'world',id,area:'city',text:'world-r30b · world/'+id+': '+t})};
  add('pickup','every roam mark icon (garage 🔧, quests, events) sits ≤ 3 m above the ground over its ring, with a contact shadow; star badge ≤ 6 m. Was a 10 m sprite 12 m up (gauntlet seen/floating-pickup).');
  add('roof','no neon strip along any roof edge (gauntlet seen/roof-seam: magenta seam on the long green building).');
  add('birds','birds flap two mirrored wings; a scattered pigeon flock levels off ≤ 14 m above where it took off instead of climbing away like grey debris (gauntlet seen/sky-debris).');
  add('mstart','a quest starting with the car on a street prop clears it: 0 props / stalls / café sets within 4.5 m of the car and its first 12 m (gauntlet seen/prop-on-car).');
  add('camprop','a chase camera inside a street prop (kiosk, umbrella, statue) hides that prop on the next FC step: the car stays visible (gauntlet seen/camera-in-props).');
  for(const[id,f]of[['pickup',WRG_pickup],['roof',WRG_roof],['birds',WRG_birds],['mstart',WRG_mstart],['camprop',WRG_camprop]])C.GO['world/'+id]=['fra','ath'].map(c=>({c,n:id,secs:20,fn:()=>{let r;try{r=f()}catch(e){r={err:String(e).slice(0,160)}}return WRG.say(id.toUpperCase(),r)}}));return}
 if(i<600)setTimeout(()=>WRG_reg(i+1),100)})(0);
({WRG_pickup,WRG_roof,WRG_birds,WRG_mstart,WRG_camprop})
