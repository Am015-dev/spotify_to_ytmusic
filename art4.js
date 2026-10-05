// ==== ART step 5 · cars sit ON the road, boats IN the water (module art4.js; patch pART4.py)
// tyre bottoms measured from the visible model (cached per model), no hover bob; nose up on throttle, down on braking; front wheels steer;
// a dark blob under each tyre; boats: hull sunk to a waterline, bow rises with speed, white foam trail
const ART4={off:new Map(),b3:new THREE.Box3(),v:new THREE.Vector3(),q:new THREE.Quaternion()};
function ART4_vis(o){for(let a=o;a;a=a.parent)if(!a.visible)return false;return true}
function ART4_base(s,ud,boat){const host=ud.m;const key=host.uuid+'|'+(ud.gbM?ud.gbM.length:0)+'|'+(boat?'b':'c')+'|'+(typeof CR_MODE!=='undefined'?CR_MODE:'');let o=ART4.off.get(key);if(o!=null)return o;
  const p0=host.position.clone(),q0=host.quaternion.clone();host.position.set(0,0,0);host.quaternion.identity();s.mesh.updateMatrixWorld(true);
  const B=ART4.b3.makeEmpty(),wh=[];host.traverse(m=>{if(!m.isMesh||!ART4_vis(m)||m.material&&m.material.transparent&&m.material.opacity<.6)return;if(!m.geometry.boundingBox)m.geometry.computeBoundingBox();const bb=m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld);B.union(bb);if(m.userData.r)wh.push(m)});
  host.position.copy(p0);host.quaternion.copy(q0);if(B.isEmpty())return 0;const y0=s.mesh.position.y,h=B.max.y-B.min.y;
  o=boat?-(B.min.y-y0)-Math.min(.35,h*.14):-(B.min.y-y0);ART4.off.set(key,o);if(ART4.off.size>40)ART4.off.delete(ART4.off.keys().next().value);return o}
function ART4_tyres(){if(ART4.ty)return ART4.ty;const im=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:ART_blobTex(),color:0,transparent:true,opacity:.7,depthWrite:false,fog:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}),8);im.count=0;im.frustumCulled=false;im.renderOrder=1;im.userData.keep=1;scene.add(im);return ART4.ty=im}
function ART4_foam(){if(ART4.fm)return ART4.fm;const im=new THREE.InstancedMesh(new THREE.CircleGeometry(1,12).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.75,depthWrite:false,fog:false}),90);im.count=90;im.frustumCulled=false;im.userData.keep=1;ART4.fp=[];for(let i=0;i<90;i++){ART4.fp.push({x:0,y:-999,z:0,a:0,s:0});im.setMatrixAt(i,new THREE.Matrix4().makeScale(0,0,0))}ART4.fi=0;ART4.ft=0;scene.add(im);return ART4.fm=im}
roamPose=(f=>function(s,dt){f(s,dt);try{const ud=s.mesh&&s.mesh.userData;if(!ud||!ud.m||s!==pl)return;const boat=(s.boatK||0)>.5;
  {const hot=!!s.nitro;for(const rb of ud.ribbons||[])rb.visible=hot&&!boat;for(const f of ud.flares||[])f.visible=hot&&!boat}
  if(s.air){if(ART4.ty)ART4.ty.count=0;return}
  const base=ART4_base(s,ud,boat);const land=(RO.landK||0);ud.m.position.y=base-land*.18+(boat?Math.sin((s.bob||0)*.55)*.08:0);
  // front wheels steer (front = -z), spin order keeps the steer axis vertical
  const st=-(CTL.steer||0)*.42;let n=0;const T=ART4_tyres();
  for(const w of ud.gbM||[]){if(!w.userData.r||!ART4_vis(w))continue;if(w.position.z<-.2){w.rotation.order='YXZ';w.rotation.y=st}
    if(!boat&&n<8){w.getWorldPosition(ART4.v);const g=groundAt?groundAt(ART4.v.x,ART4.v.z,ART4.v.y+1):RO.y;const r=w.userData.r*(w.getWorldScale(new THREE.Vector3()).x||1);_m.compose(ART4.v.set(ART4.v.x,g+.06,ART4.v.z),ART4.q.setFromAxisAngle(V3(0,1,0),RO.h),V3(r*1.3,1,r*2.1));T.setMatrixAt(n++,_m)}}
  T.count=n;T.instanceMatrix.needsUpdate=true;
  // suspension: each tyre is pushed onto the road under it (body keeps its pitch/roll), travel ±0.35 m
  if(!boat){s.mesh.updateMatrixWorld(true);for(const w of ud.gbM||[]){if(!w.userData.r||!ART4_vis(w))continue;if(w.userData.y0==null)w.userData.y0=w.position.y;w.getWorldPosition(ART4.v);const sc=w.parent?w.parent.getWorldScale(new THREE.Vector3()).y:1,ws=w.getWorldScale(new THREE.Vector3()).y;
    const g=groundAt(ART4.v.x,ART4.v.z,ART4.v.y+1),bot=ART4.v.y-w.userData.r*ws,dy=(g-bot)/(sc||1);w.position.y=Math.max(w.userData.y0-.35/(sc||1),Math.min(w.userData.y0+.35/(sc||1),w.position.y+dy))}}
  // boats: bow up with speed, foam trail from the stern
  if(boat){const F=ART4_foam(),fw=s._fw||V3(Math.sin(RO.h),0,Math.cos(RO.h));ART4.ft+=dt;if(Math.abs(RO.v)>3&&ART4.ft>.06){ART4.ft=0;const p=ART4.fp[ART4.fi++%90];p.x=RO.x-fw.x*3.6+(Math.random()-.5)*1.2;p.z=RO.z-fw.z*3.6+(Math.random()-.5)*1.2;p.y=RO.y+.05;p.a=0;p.s=.9+Math.min(1.6,Math.abs(RO.v)/30)}
   for(let i=0;i<90;i++){const p=ART4.fp[i];if(p.y<-900)continue;p.a+=dt;const k=Math.max(0,1-p.a/2.4);_m.makeScale(p.s*(1+p.a*1.4)*k+.001,1,p.s*(1+p.a*1.4)*k+.001);_m.setPosition(p.x,p.y,p.z);F.setMatrixAt(i,_m)}F.instanceMatrix.needsUpdate=true;F.visible=true;
   const bow=Math.min(.16,Math.abs(RO.v)*.003);ud.m.rotateX(bow)}else if(ART4.fm)ART4.fm.visible=false}catch(e){}})(roamPose);
