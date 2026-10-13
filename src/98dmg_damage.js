// ---- DMG (cam-1, 2026-10-13). Alex: "city driving is frustrating: one hit and the car smashes and explodes. Bricks could come off as it crashes, then it
// explodes and dies, like GTA". References: LEGO 2K Drive (bricks break off on hits, repaired by smashing scenery, heavy damage = flaming wreck + respawn;
// GTPlanet "LEGO 2K Drive's Physics Engine is Surprisingly Complex"), GTA V (engine health → smoke → fire → explosion; GTA wiki).
// Behind DMG.on (?dmg=0 = off). Entry points stay roamDamage / roamWreck (71_roam_drive.js):
// - a hit is graded by its relative NORMAL speed (km/h): < 25 = sparks only; above, dmg = 15·sqrt((v-25)/25) % of a car's health ÷ class (bus/truck ×1.7),
//   so 50 km/h ≈ -15 %, 60 km/h ≈ -18 %, a 15° graze at 80 km/h (21 km/h normal) = nothing; 6-7 real crashes to 0.
// - each damaging hit throws 2-6 bricks (60-piece instanced pool, gravity + bounce, gone after 4 s) and hides outer bricks of the ride (missing panels);
//   smoke < 50 %, fire < 20 %; at 0 a fireball + the existing brick explosion, rebuilt in place within 2 s (roamWreck).
// - repair: 5 s without a hit rebuilds the bricks over 1.5 s. HUD: the hull bar shows only while < 100 %.
const DMG={on:!/[?&]dmg=0/.test(location.search),vn:null,lastHit:-1e9,cls:1,deb:[],im:null,N:60,hid:0,want:0,G:new Map(),fxT:0,wk0:false,n:{hits:0,light:0,boom:0,rebuilt:0,deb:0},tBoom:0,tReb:0};
const _dmM=new THREE.Matrix4(),_dmQ=new THREE.Quaternion(),_dmE=new THREE.Euler(),_dmS=new THREE.Vector3(),_dmV=new THREE.Vector3();
function DMG_cls(){const m=(typeof BC!=='undefined'&&BC.big&&BC.m)||1;return clamp(Math.pow(m,.35),1,2)}
function DMG_pool(){if(DMG.im&&DMG.im.parent)return DMG.im;if(!DMG.im){DMG.im=new THREE.InstancedMesh(brickGeo(),new THREE.MeshStandardMaterial({color:0xffffff,roughness:.35,metalness:.05}),DMG.N);DMG.im.frustumCulled=false;DMG.im.count=0;
  DMG.im.setColorAt(0,new THREE.Color(1,1,1));DMG.im.instanceColor.needsUpdate=true}(HUB.grp||scene).add(DMG.im);return DMG.im}
// the ride's merged brick meshes: per brick its triangles + centroid, outer bricks first (they come off first); a clone geometry we collapse bricks in
function DMG_info(o){const g0=o.userData.dmG0||o.geometry;let I=DMG.G.get(g0);if(I!==undefined)return I;I=null;const id=g0.userData&&g0.userData.bid,T=g0.userData&&g0.userData.bt,P=g0.attributes.position;
 if(id&&T&&P&&!g0.index){const B=new Map();for(let t=0;t<id.length;t++){const b=id[t];if(b<0)continue;const ty=T[b]||'';if(/^(drv|szF|szR|wh|tyre|tire|rim|wheel)/i.test(ty))continue;let e=B.get(b);if(!e)B.set(b,e={t:[],x:0,y:0,z:0});e.t.push(t);e.x+=P.getX(t*3);e.y+=P.getY(t*3);e.z+=P.getZ(t*3)}
  const L=[...B].map(([b,e])=>({b,t:e.t,x:e.x/e.t.length,y:e.y/e.t.length,z:e.z/e.t.length}));if(L.length>=6){g0.computeBoundingBox();const c=g0.boundingBox.getCenter(new THREE.Vector3()),s=g0.boundingBox.getSize(new THREE.Vector3());
   for(const e of L)e.o=Math.abs(e.x-c.x)/Math.max(.01,s.x)+Math.abs(e.z-c.z)/Math.max(.01,s.z)+.6*(e.y-c.y)/Math.max(.01,s.y)+Math.random()*.15;L.sort((a,b)=>b.o-a.o);
   const g=g0.clone();I={g0,g,L,orig:Float32Array.from(P.array),col:g0.attributes.color||null,hid:0}}}
 DMG.G.set(g0,I);return I}
function DMG_meshes(){const ud=pl&&pl.mesh&&pl.mesh.userData,R=[];if(!ud||!ud.m)return R;ud.m.traverse(o=>{if(o.isMesh&&!o.isInstancedMesh&&o.geometry&&(o.userData.dmG0||o.geometry.userData&&o.geometry.userData.bid))R.push(o)});return R}
// hide the outer `frac` (0..1) share of up to 30 % of the bricks; returns world positions + colours of the bricks newly hidden (for the flying debris)
function DMG_panels(frac,want){const out=[];try{pl.mesh.updateMatrixWorld(true)}catch(e){}for(const o of DMG_meshes()){if(o.userData.ofG0)continue;const I=DMG_info(o);if(!I)continue;const n=Math.min(I.L.length,Math.round(frac*.3*I.L.length));if(n===I.hid)continue;
  const q=I.g.attributes.position,a=q.array;if(n<I.hid){a.set(I.orig)}else if(want)for(let k=I.hid;k<n&&out.length<want;k++){const e=I.L[k];_dmV.set(e.x,e.y,e.z).applyMatrix4(o.matrixWorld);_dmV.x+=RO.x-pl.mesh.position.x;_dmV.z+=RO.z-pl.mesh.position.z;const c=I.col?new THREE.Color(I.col.getX(e.t[0]*3),I.col.getY(e.t[0]*3),I.col.getZ(e.t[0]*3)):null;out.push([_dmV.clone(),c])}
  for(let k=0;k<n;k++){const e=I.L[k],x=a[e.t[0]*9],y=a[e.t[0]*9+1],z=a[e.t[0]*9+2];for(const t of e.t)for(let j=0;j<9;j+=3){a[t*9+j]=x;a[t*9+j+1]=y;a[t*9+j+2]=z}}
  q.needsUpdate=true;I.hid=n;if(!o.userData.dmG0){o.userData.dmG0=o.geometry;o.geometry=I.g}if(!n&&o.userData.dmG0){o.geometry=o.userData.dmG0;o.userData.dmG0=null}}return out}
function DMG_throw(n,src,vk){const im=DMG_pool(),t=pl&&pl.team,cols=[t&&t.a,t&&t.b,'#2a2f38'].filter(Boolean).map(c=>new THREE.Color(c)),fw=_dmV.set(Math.sin(RO.h),0,Math.cos(RO.h)).clone();
 for(let i=0;i<n;i++){const s=src[i],p=s?s[0].clone():new THREE.Vector3(RO.x+rr(-1,1),RO.y+rr(.6,1.4),RO.z+rr(-1.5,1.5)).addScaledVector(fw,1.6);
  const d={p,v:new THREE.Vector3(rr(-5,5),rr(4,9),rr(-5,5)).addScaledVector(fw,Math.max(2,Math.abs(RO.v)*.5)),q:new THREE.Quaternion().setFromEuler(_dmE.set(rr(0,6),rr(0,6),rr(0,6))),w:new THREE.Vector3(rr(-9,9),rr(-9,9),rr(-9,9)),t:0,s:rr(.12,.17),c:s&&s[1]||cols[i%cols.length]||new THREE.Color(.8,.2,.2)};
  if(DMG.deb.length>=DMG.N)DMG.deb.shift();DMG.deb.push(d);DMG.n.deb++}}
function DMG_debStep(dt){const im=DMG.im;if(!im||!DMG.deb.length){if(im&&im.count){im.count=0}return}const L=DMG.deb;for(let i=L.length-1;i>=0;i--){const d=L[i];d.t+=dt;if(d.t>=4){L.splice(i,1);continue}
  d.v.y-=22*dt;d.p.addScaledVector(d.v,dt);const fl=groundAt(d.p.x,d.p.z,d.p.y+1)+d.s*.5;if(d.p.y<fl){d.p.y=fl;d.v.y=Math.abs(d.v.y)*.3;d.v.x*=.6;d.v.z*=.6;d.w.multiplyScalar(.6)}d.q.multiply(_dmQ.setFromEuler(_dmE.set(d.w.x*dt,d.w.y*dt,d.w.z*dt)))}
 L.forEach((d,i)=>{const k=d.t>3.6?Math.max(.01,(4-d.t)/.4):1;_dmM.compose(d.p,d.q,_dmS.setScalar(d.s*k));im.setMatrixAt(i,_dmM);im.setColorAt(i,d.c)});im.count=L.length;im.instanceMatrix.needsUpdate=true;im.instanceColor.needsUpdate=true}
// THE hit: v = relative normal speed in km/h. Returns the health lost (%).
function DMG_impact(v,o){if(!DMG.on||state!=='roam'||RO.wk||(RO.inv||0)>0)return 0;const at=new THREE.Vector3(RO.x+Math.sin(RO.h)*1.8,RO.y+.8,RO.z+Math.cos(RO.h)*1.8);
 if(v<25){DMG.n.light++;if(v>8)try{burst(SPARK,at,8,6,.3,new THREE.Color(2,1.6,.9))}catch(e){}return 0}
 DMG.cls=DMG_cls();const d=15*Math.sqrt((v-25)/25)/DMG.cls;RO.hp=Math.max(0,(RO.hp??100)-d);RO.lastHit=0;DMG.lastHit=performance.now();DMG.n.hits++;
 const nb=clamp(Math.round(2+d/4),2,6),src=DMG_panels(1-RO.hp/100,nb);DMG_throw(nb,src,v);try{burst(SPARK,at,16,9,.4,new THREE.Color(2,1.6,.9))}catch(e){}
 DMG_hud(RO.hp);if(d>6)try{flashHud()}catch(e){}if(RO.hp<=0){DMG.n.boom++;DMG.tBoom=performance.now();try{fireball(V3(RO.x,RO.y+1.4,RO.z),26,3,1.1)}catch(e){}DMG_panels(0);roamWreck()}return d}
DMG.wall=(kmh,deg)=>DMG_impact(kmh*Math.sin((deg??90)*Math.PI/180));
// collisions → DMG_impact: walls (roamBounce knows the normal speed), traffic (the closing speed), the rest (falls, quest walls) keep their own amount
roamBounce=(f=>function(ax,sp,nX,nZ){if(!DMG.on)return f.apply(this,arguments);const vx=Math.sin(RO.vh)*RO.v,vz=Math.cos(RO.vh)*RO.v;let X=nX,Z=nZ;if(X==null){if(ax==='x'){X=-(Math.sign(vx)||1);Z=0}else{X=0;Z=-(Math.sign(vz)||1)}}
 DMG.vn=Math.max(0,-(vx*X+vz*Z))*3.6;try{return f.apply(this,arguments)}finally{DMG.vn=null}})(roamBounce);
roamDamage=(f=>function(d){if(!DMG.on)return f(d);if(DMG.vn!=null)return DMG_impact(DMG.vn);if(d===5||d===12)return DMG_impact(Math.abs(RO.v)*3.6*(d===12?1.3:.8));
 if(RO.wk||(RO.inv||0)>0||d<1||state!=='roam')return;RO.hp=Math.max(0,(RO.hp??100)-d/DMG_cls());DMG.lastHit=performance.now();if(RO.hp<=0){DMG.n.boom++;DMG.tBoom=performance.now();DMG_panels(0);roamWreck()}})(roamDamage);
// per frame (inside roamStep): debris, smoke/fire, repair, rebuilt detection, HUD
function DMG_step(dt){DMG_debStep(dt);if(!DMG.on)return;const wk=!!RO.wk;if(DMG.wk0&&!wk){DMG.n.rebuilt++;DMG.tReb=performance.now();DMG_panels(0)}DMG.wk0=wk;if(wk)return;
 const hp=RO.hp??100;if(hp<100&&performance.now()-DMG.lastHit>5000){RO.hp=Math.min(100,hp+dt*100/1.5);if(Math.floor(RO.hp/10)!==Math.floor(hp/10)||RO.hp>=100)DMG_panels(1-RO.hp/100)}
 if(hp<50&&(DMG.fxT-=dt)<=0){DMG.fxT=hp<20?.08:.16;const at=V3(RO.x+Math.sin(RO.h)*1.6,RO.y+1.3,RO.z+Math.cos(RO.h)*1.6);try{puff(at,1,hp<20?new THREE.Color(.25,.22,.2):new THREE.Color(.55,.55,.58),.8,2.6,1.2,.5,.4,3);if(hp<20)fireball(at,1,.9,.45)}catch(e){}}
 DMG_hud(hp)}
function DMG_hud(hp){try{const el=document.getElementById('rgHull');if(el)el.style.visibility=hp>=99.5?'hidden':'visible'}catch(e){}}
roamStep=(f=>function(dt){const r=f(dt);try{if(state==='roam'&&(!RO.foot||RO.foot==='car'))DMG_step(dt);else DMG_debStep(dt)}catch(e){if(!DMG.e1){DMG.e1=1;console.warn('DMG',e)}}return r})(roamStep);
// ---- 📍 GO + test: the default ride on a straight street, then the scripted hits (the same DMG_impact the collisions call)
function DMG_go(kind){if(state!=='roam'||!RO.on)return'📍 Start free roam first';if(!DMG.on)return'📍 Damage is off (?dmg=0)';try{OF_reset()}catch(e){}if(RO.wk){RO.wk=null;try{RBRK.visible=false;pl.mesh.visible=true}catch(e){}}
 const q=CAM_road(40);if(q)roamWarp(q.x,q.z,q.h,true);RO.hp=100;RO.inv=0;DMG_panels(0);DMG.deb.length=0;DMG.lastHit=-1e9;const r={kind,hp0:100,t:performance.now()};DMG.go=r;
 if(kind==='light'){r.d=DMG_impact(20);r.txt='20 km/h bump: sparks only, health stays 100 %'}
 else if(kind==='medium'){r.d=DMG_impact(50);r.txt='50 km/h crash: 2-6 bricks fly off, health 70-90 %, no explosion'}
 else if(kind==='graze'){r.d=DMG.wall(80,15);r.txt='15° wall graze at 80 km/h: no damage'}
 else if(kind==='wreck'){let i=0;const hit=()=>{RO.inv=0;DMG_impact(60);if(++i<8&&!RO.wk)setTimeout(hit,150)};hit();r.txt='8 crashes at 60 km/h: smoke, fire, explosion, rebuilt within 2.5 s'}
 return'📍 '+r.txt}
window.__dmg={bench:()=>{DMG_throw(DMG.N,[],40);const t=performance.now();for(let i=0;i<100;i++){DMG_debStep(1/60)}const ms=(performance.now()-t)/100;return{ms:+ms.toFixed(3),live:DMG.deb.length}},S:DMG,go:DMG_go,impact:DMG_impact,wall:(k,a)=>DMG.wall(k,a),st:()=>({on:DMG.on,ro:[+RO.x.toFixed(1),+RO.z.toFixed(1)],mp:pl?[+pl.mesh.position.x.toFixed(1),+pl.mesh.position.z.toFixed(1)]:null,hp:+(RO.hp??100).toFixed(1),wk:!!RO.wk,deb:DMG.deb.length,n:Object.assign({},DMG.n),hid:DMG_meshes().reduce((s,o)=>{const I=DMG.G.get(o.userData.dmG0||o.geometry);return s+(I?I.hid:0)},0),tBoom:DMG.tBoom,tReb:DMG.tReb,cls:+DMG_cls().toFixed(2),hull:(document.getElementById('rgHull')||{}).style?.visibility||''})};
