// ==== ART step 5 · cars sit ON the road, boats IN the water (module art4.js; patch pART4.py)
// tyre bottoms measured from the visible model (cached per model), no hover bob; nose up on throttle, down on braking; front wheels steer;
// a dark blob under each tyre; boats: hull sunk to a waterline, bow rises with speed, white foam trail
const ART4={off:new Map(),b3:new THREE.Box3(),v:new THREE.Vector3(),q:new THREE.Quaternion()};
function ART4_vis(o){for(let a=o;a;a=a.parent)if(!a.visible)return false;return true}
function ART4_base(s,ud,boat){const host=ud.m;const key=host.uuid+'|'+(ud.gbM?ud.gbM.length:0)+'|'+(boat?'b':'c')+'|'+(typeof CR_MODE!=='undefined'?CR_MODE:'');let o=ART4.off.get(key);if(o!=null)return o;
  const p0=host.position.clone(),q0=host.quaternion.clone();host.position.set(0,0,0);host.quaternion.identity();s.mesh.updateMatrixWorld(true);
  const B=ART4.b3.makeEmpty(),wh=[];host.traverse(m=>{if(!m.isMesh||!ART4_vis(m)||m.material&&m.material.transparent&&m.material.opacity<.6)return;if(!m.geometry.boundingBox)m.geometry.computeBoundingBox();const bb=m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld);B.union(bb);if(m.userData.r)wh.push(m)});
  host.position.copy(p0);host.quaternion.copy(q0);if(B.isEmpty())return 0;const y0=s.mesh.position.y,h=B.max.y-B.min.y;
  o=boat?-(B.min.y-y0)-Math.min(.7,h*.3):-(B.min.y-y0);ART4.off.set(key,o);if(ART4.off.size>40)ART4.off.delete(ART4.off.keys().next().value);return o}
function ART4_tyres(){if(ART4.ty)return ART4.ty;const im=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:ART_blobTex(),color:0,transparent:true,opacity:.7,depthWrite:false,fog:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}),8);im.count=0;im.frustumCulled=false;im.renderOrder=1;im.userData.keep=1;scene.add(im);return ART4.ty=im}
function ART4_foam(){if(ART4.fm)return ART4.fm;const im=new THREE.InstancedMesh(new THREE.CircleGeometry(1,12).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.75,depthWrite:false,fog:false}),90);im.count=90;im.frustumCulled=false;im.userData.keep=1;ART4.fp=[];for(let i=0;i<90;i++){ART4.fp.push({x:0,y:-999,z:0,a:0,s:0});im.setMatrixAt(i,new THREE.Matrix4().makeScale(0,0,0))}ART4.fi=0;ART4.ft=0;scene.add(im);return ART4.fm=im}
// W8 (v87f): boats sit IN the water. Boat mode kept the street car's ride-height offset (0 to 0.58 m depending on the garage set), so set
// boats rode high. Now the hull bottom sits W8B.sink below the local wave surface every frame (world metres, through the live transform chain).
const W8B={bb:new Map(),sink:.22,v:new THREE.Vector3(),q:new THREE.Quaternion(),sc:new THREE.Vector3(),M:new THREE.Matrix4(),T:new THREE.Matrix4()};
function W8_boatY(s,ud){const g=ud.gbV&&ud.gbV.boat,host=ud.m,P=host.parent;if(!g||!P)return host.position.y;let n=0;g.traverse(m=>{if(m.isMesh&&m.geometry.attributes.position)n+=m.geometry.attributes.position.count});
  const key=g.uuid+'|'+n;let B=W8B.bb.get(key);P.updateWorldMatrix(true,false);const y0=host.position.y;host.position.y=0;host.updateMatrixWorld(true);
  if(!B){B=new THREE.Box3();W8B.M.copy(g.matrixWorld).invert();g.traverse(m=>{if(!m.isMesh||m.userData.a8s||m.material&&m.material.transparent&&m.material.opacity<.6)return;const pa=m.geometry.attributes.position;if(!pa)return;
    W8B.T.multiplyMatrices(W8B.M,m.matrixWorld);for(let i=0;i<pa.count;i++)B.expandByPoint(W8B.v.fromBufferAttribute(pa,i).applyMatrix4(W8B.T))});
   if(B.isEmpty()){host.position.y=y0;return y0}W8B.bb.set(key,B);if(W8B.bb.size>20)W8B.bb.delete(W8B.bb.keys().next().value)}
  let lo=1e9;for(let i=0;i<8;i++){W8B.v.set(i&1?B.max.x:B.min.x,i&2?B.max.y:B.min.y,i&4?B.max.z:B.min.z).applyMatrix4(g.matrixWorld);if(W8B.v.y<lo)lo=W8B.v.y}
  P.matrixWorld.decompose(W8B.v,W8B.q,W8B.sc);const sy=W8B.sc.y||1,water=RO.y+waveH(RO.x,RO.z,T)*Math.min(1,s.boatK||0)+Math.sin((s.bob||0)*.55)*.05;
  host.position.y=y0;return(water-W8B.sink-lo)/sy}
roamPose=(f=>function(s,dt){f(s,dt);try{const ud=s.mesh&&s.mesh.userData;if(!ud||!ud.m||s!==pl)return;const boat=(s.boatK||0)>.5;
  if(s.air){if(ART4.ty)ART4.ty.count=0;return}
  if(!boat){const base=ART4_base(s,ud,false);const land=(RO.landK||0);ud.m.position.y=base-land*.18}else ud.m.position.y=W8_boatY(s,ud);
  // front wheels steer (front = -z), spin order keeps the steer axis vertical
  const st=-(CTL.steer||0)*.42;let n=0;const T=ART4_tyres();
  for(const w of ud.gbM||[]){if(!w.userData.r||!ART4_vis(w))continue;if(w.position.z<-.2){w.rotation.order='YXZ';w.rotation.y=st}
    if(!boat&&n<8){w.getWorldPosition(ART4.v);const g=groundAt?groundAt(ART4.v.x,ART4.v.z,ART4.v.y+1):RO.y;const r=w.userData.r*(w.getWorldScale(new THREE.Vector3()).x||1);_m.compose(ART4.v.set(ART4.v.x,g+.06,ART4.v.z),ART4.q.setFromAxisAngle(V3(0,1,0),RO.h),V3(r*1.3,1,r*2.1));T.setMatrixAt(n++,_m)}}
  T.count=n;T.instanceMatrix.needsUpdate=true;
  // boats: bow up with speed, foam trail from the stern
  if(boat){const F=ART4_foam(),fw=s._fw||V3(Math.sin(RO.h),0,Math.cos(RO.h));ART4.ft+=dt;if(Math.abs(RO.v)>3&&ART4.ft>.06){ART4.ft=0;const p=ART4.fp[ART4.fi++%90];p.x=RO.x-fw.x*3.6+(Math.random()-.5)*1.2;p.z=RO.z-fw.z*3.6+(Math.random()-.5)*1.2;p.y=RO.y+.05;p.a=0;p.s=.9+Math.min(1.6,Math.abs(RO.v)/30)}
   for(let i=0;i<90;i++){const p=ART4.fp[i];if(p.y<-900)continue;p.a+=dt;const k=Math.max(0,1-p.a/2.4);_m.makeScale(p.s*(1+p.a*1.4)*k+.001,1,p.s*(1+p.a*1.4)*k+.001);_m.setPosition(p.x,p.y,p.z);F.setMatrixAt(i,_m)}F.instanceMatrix.needsUpdate=true;F.visible=true;
   const bow=Math.min(.06,Math.abs(RO.v)*.001);ud.m.rotateX(bow)}else if(ART4.fm)ART4.fm.visible=false}catch(e){}})(roamPose);

/*ART<art.js>*/// ==== ART · LEGO 2K Drive look (module art.js; patch pART1.py) — step 1: deep-blue sky, studded green baseplate ground, grey asphalt with double yellow line, bright midday light
const ART={top:[.02,.12,.62],mid:[.06,.3,.92],hor:[.42,.66,1.0],gnd:[.4,.6,.9],sun:[.5,.42,.3],done:0,day:1,hook:null};
// free roam is always bright midday unless the player picks another time of day in settings (one-time migration from the old 24-min cycle)
try{if(!localStorage.getItem('mho_art_tod')){localStorage.setItem('mho_art_tod','1');SET.tod='day';saveSet()}}catch(e){}
function ART_tex(w,h,draw,rep){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;t.generateMipmaps=true;t.minFilter=THREE.LinearMipmapLinearFilter;if(typeof KEEP_TEX!=='undefined')KEEP_TEX.add(t);return t}
// green baseplate: 8×8 studs per tile with a light rim and soft shadow; mipmaps fade them to flat green in the distance
function ART_plate(base,lit,dark){return ART_tex(512,512,(g,W)=>{g.fillStyle=base;g.fillRect(0,0,W,W);let r=11;const rnd=()=>(r=(r*16807)%2147483647)/2147483647;
  for(let i=0;i<2600;i++){g.fillStyle=`rgba(${rnd()<.5?'255,255,190':'0,50,0'},.06)`;g.fillRect(rnd()*W,rnd()*W,3+rnd()*5,2+rnd()*3)}
  const n=40,s=W/n;for(let y=0;y<n;y++)for(let x=0;x<n;x++){const cx=x*s+s/2,cy=y*s+s/2,R=s*.3;g.fillStyle='rgba(0,40,0,.12)';g.beginPath();g.arc(cx+.8,cy+1,R+.6,0,7);g.fill();g.fillStyle=lit;g.globalAlpha=.35;g.beginPath();g.arc(cx-.4,cy-.4,R*.8,0,7);g.fill();g.globalAlpha=1}})}
// asphalt: mid grey, light kerbs, white edge lines, double yellow centre line
function ART_road(){return ART_tex(256,512,(g,W,H)=>{g.fillStyle='#55585f';g.fillRect(0,0,W,H);let r=91;const rnd=()=>(r=(r*16807)%2147483647)/2147483647;
  for(let i=0;i<4000;i++){const v=70+rnd()*40|0;g.fillStyle=`rgba(${v},${v+2},${v+6},.45)`;g.fillRect(rnd()*W,rnd()*H,2,2)}
  g.fillStyle='#d6d4cc';g.fillRect(0,0,9,H);g.fillRect(W-9,0,9,H);g.fillStyle='#9b9a94';g.fillRect(9,0,2,H);g.fillRect(W-11,0,2,H);
  g.fillStyle='#f2f2ee';g.fillRect(17,0,5,H);g.fillRect(W-22,0,5,H);for(const u of[.27,.73])for(let y=0;y<H;y+=128)g.fillRect(u*W-2,y,4,60);
  g.fillStyle='#ffc61a';g.fillRect(121,0,3,H);g.fillRect(132,0,3,H)})}
function ART_hub(){if(!HUB||!HUB.M||HUB.M.artDone===CID)return;const M=HUB.M;M.artDone=CID;
  const grass=ART_plate('#4fa83a','#8fdc5c','#3c8a2a'),park=ART_plate('#5cb841','#9fe36a','#46962f');grass.repeat.set(1,1);
  for(const k of['walk','yard'])if(M[k]){M[k].map=grass;M[k].color.set(0xffffff);M[k].roughness=.55;M[k].needsUpdate=true}
  if(M.grass){M.grass.map=park;M.grass.color.set(0xffffff);M.grass.roughness=.55;M.grass.needsUpdate=true}
  if(M.resSt){const t=ART_road();t.wrapS=THREE.ClampToEdgeWrapping;M.resSt.map=t;M.resSt.color.set(0xffffff);M.resSt.needsUpdate=true}
  if(M.street&&M.street!==M.road){const t=ART_road();t.wrapS=THREE.ClampToEdgeWrapping;M.street.map=t;M.street.color.set(0xffffff);M.street.needsUpdate=true}
  if(CID==='ath'&&M.cobble){M.cobble.map=ART_tex(256,256,(g,W)=>{g.fillStyle='#5a5d64';g.fillRect(0,0,W,W);let r=7;const rnd=()=>(r=(r*16807)%2147483647)/2147483647;for(let i=0;i<2500;i++){const v=72+rnd()*40|0;g.fillStyle=`rgba(${v},${v+2},${v+6},.45)`;g.fillRect(rnd()*W,rnd()*W,2,2)}});M.cobble.color.set(0xffffff);M.cobble.roughness=.75;M.cobble.needsUpdate=true}
  if(M.road){const t=ART_road();t.wrapS=THREE.ClampToEdgeWrapping;M.road.map=t;M.road.color.set(0xffffff);M.road.roughness=.7;M.road.needsUpdate=true}}

// brick clouds (ART10: 14 big ones, 1.85× the brick size, 12-20° above the horizon so they clear the rooftops; whiter): stacked-plate clouds with studs on a far ring that follows the camera (never overhead, so the sky stays deep blue); 2 draw calls
cloudsOn=function(v){if(v&&!CLOUDS){const L=24,BR=[],ST=[];let r=5;const rnd=()=>(r=(r*16807)%2147483647)/2147483647;
  for(let c=0;c<14;c++){const a=c/14*Math.PI*2+rnd()*.3,R=1200+rnd()*400,cx=Math.cos(a)*R,cz=Math.sin(a)*R,cy=240+rnd()*260,yaw=a+Math.PI/2;const ca=Math.cos(yaw),sa=Math.sin(yaw);
   const lay=[[4+(rnd()*3|0),2],[2+(rnd()*3|0),2],[1+(rnd()*2|0),1]];let y=0;
   for(let li=0;li<3;li++){const[n,dep]=lay[li];if(li===2&&rnd()<.35)break;const h=li===0?1.2:.4+.8*(rnd()<.5);for(let i=0;i<n;i++){const w=2*(1+(rnd()*2|0)),d=dep*2,ox=(i-(n-1)/2)*w*.78*L+(rnd()-.5)*L,oz=(rnd()-.5)*L;
     BR.push([cx+ox*ca-oz*sa,cy+y+h*L/2,cz+ox*sa+oz*ca,w*L,h*L,d*L,yaw]);for(let sx=0;sx<w;sx++)for(let sz=0;sz<d;sz++){const px=ox+(sx-(w-1)/2)*L,pz=oz+(sz-(d-1)/2)*L;ST.push([cx+px*ca-pz*sa,cy+y+h*L,cz+px*sa+pz*ca])}}y+=(li===0?1.2:.8)*L}}
  const mat=new THREE.MeshLambertMaterial({color:0xffffff,emissive:0xdce6fa,emissiveIntensity:.6,fog:false});
  const bg=new THREE.BoxGeometry(1,1,1),sg=new THREE.CylinderGeometry(.3*L,.3*L,.36*L,10);sg.translate(0,.18*L,0);
  const bi=new THREE.InstancedMesh(bg,mat,BR.length),si=new THREE.InstancedMesh(sg,mat,ST.length),M=new THREE.Matrix4(),q=new THREE.Quaternion(),S=new THREE.Vector3(),P=new THREE.Vector3(),Y=new THREE.Vector3(0,1,0);
  BR.forEach((b,i)=>{q.setFromAxisAngle(Y,-b[6]);M.compose(P.set(b[0],b[1],b[2]),q,S.set(b[3]*.98,b[4]*.98,b[5]*.98));bi.setMatrixAt(i,M)});
  ST.forEach((t,i)=>{M.makeTranslation(t[0],t[1],t[2]);si.setMatrixAt(i,M)});
  bi.frustumCulled=si.frustumCulled=false;CLOUDS=new THREE.Group();CLOUDS.add(bi,si);CLOUDS.userData.keep=1;CLOUDS.userData.art=1}
 if(CLOUDS){if(v&&!CLOUDS.parent)scene.add(CLOUDS);if(!v&&CLOUDS.parent)scene.remove(CLOUDS)}};
if(typeof CLOUDS!=='undefined'&&CLOUDS&&!CLOUDS.userData.art){const p=CLOUDS.parent;if(p)p.remove(CLOUDS);CLOUDS=null;if(p)cloudsOn(true)}
// sky + light, applied after every mood / day-cycle update while roaming by day
function ART_light(){if(!RO.on||!MOOD)return;const n=typeof FL!=='undefined'&&FL.n||0;if(n>.5||MOOD.id==='night'||MOOD.id==='flnight')return;const w=1-n*2;
  const U=SKYU,L=(v,a)=>v.lerp(new THREE.Vector3(...a),w);L(U.uTop.value,ART.top);L(U.uMid.value,ART.mid);L(U.uHor.value,ART.hor);L(U.uGround.value,ART.gnd);L(U.uSun.value,ART.sun);U.uCloud.value*=1-w;U.uBand.value=0;U.uStar.value*=1-w;
  scene.fog.color.setRGB(.7,.84,1.0);hemi.color.set('#e6edfb');hemi.groundColor.set('#7d9852');hemi.intensity=1.0;moonL.color.set('#fff3e0');moonL.intensity=3.1;renderer.toneMappingExposure=1.0;scene.environmentIntensity=.55;if(!ART.envDay){ART.envDay=1;ENVSC.traverse(o=>{if(o.isMesh&&o.geometry&&o.geometry.type==='BoxGeometry')o.visible=false});ENVC.clear();ENVD=true}if(ART.hook)try{ART.hook(w)}catch(e){}}
{const _am=applyMood;applyMood=function(){const r=_am.apply(this,arguments);ART_light();return r}}
{const _fa=FL_apply;FL_apply=function(){const r=_fa.apply(this,arguments);ART_light();return r}}
{const _he=hubEnter;hubEnter=function(){const r=_he.apply(this,arguments);ART_hub();ART_light();return r}}
roamStep=(f=>function(dt){f(dt);if(flash>1)flash=1;if(hitFx>1)hitFx=1;if(CLOUDS&&CLOUDS.userData.art)CLOUDS.position.set(camera.position.x,0,camera.position.z);if(!ART.done||HUB.M&&HUB.M.artDone!==CID){ART.done=1;ART_hub();ART_light()}})(roamStep);
window.__art={get pl(){return pl},get PED_N(){return PED_N},gAt:(x,z,y)=>groundAt(x,z,y),gY:(x,z)=>groundY(x,z),get CITY_S(){return typeof CITY_S!=="undefined"?CITY_S:null},hubRoads:()=>hubRoads(),ART,ART_hub,ART_light,get HUB(){return HUB},get MOOD(){return MOOD},get FL(){return FL},SKYU,hemi,moonL,scene,renderer,THREE,get RO(){return RO},get CID(){return CID},LK,get bloom(){return bloom}};
/*ART</art.js>*/
/*ART<art2.js>*/// ==== ART step 2 · scenery: brick-built trees (autumn red/orange/yellow + green), studs on up-facing plastic, plastic rim sheen (module art2.js; patch pART2.py)
function ART_brickGeo(layers,trunk,stud){const P=[],u=.8;const add=(g,c)=>{const q=g.index?g.toNonIndexed():g;q.deleteAttribute('uv');P.push(colorize(q,new THREE.Color(c)))};
  if(trunk)add(new THREE.BoxGeometry(trunk[0],trunk[1],trunk[0]).translate(0,trunk[1]/2,0),trunk[2]);
  const sg=new THREE.CylinderGeometry(.24,.24,.2,6,1,false);sg.deleteAttribute('uv');
  layers.forEach((L,i)=>{const[w,h,y,ox=0,oz=0,col='#ffffff']=L;add(new THREE.BoxGeometry(w-.04,h,w-.04).translate(ox,y+h/2,oz),col);
    const nx=Math.round(w/u),nu=layers[i+1];for(let a=0;a<nx;a++)for(let b=0;b<nx;b++){const x=ox+(a-(nx-1)/2)*u,z=oz+(b-(nx-1)/2)*u;
      if(nu&&Math.abs(x-(nu[3]||0))<nu[0]/2&&Math.abs(z-(nu[4]||0))<nu[0]/2)continue;if(!stud||(a+b)%stud)continue;add(sg.clone().translate(x,y+h+.1,z),col)}});
  const g=mergeGeometries(P);g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();return g}
const ART_TREES={
 tree:()=>ART_brickGeo([[4.8,1.2,3.2],[6.4,1.6,4.4],[4.8,1.2,6.0],[3.2,1.0,7.2]],[1.6,3.4,'#8a5a32'],0),
 tree2:()=>ART_brickGeo([[5.6,1.2,3.6],[7.2,1.6,4.8],[5.6,1.4,6.4,.4,.4],[2.4,1.0,7.8,.4,.4]],[1.6,3.8,'#7a4a28'],0),
 tree3:()=>ART_brickGeo([[5.6,1.2,2.0],[4.8,1.2,3.2],[4.0,1.2,4.4],[3.2,1.2,5.6],[2.4,1.2,6.8],[1.6,1.2,8.0]],[1.2,2.2,'#6a4426'],0),
 bush:()=>ART_brickGeo([[3.2,1.0,0],[2.4,.8,1.0]],null,0)};
const ART_TINT={tree:['#e8402a','#f07a1a','#f6c21c','#5cbc3a','#f07a1a'],tree2:['#f39a1a','#ffd23a','#d83a2a','#7cc84a'],tree3:['#3f9a3a','#56b048','#2f8a3a'],bush:['#5cbc3a','#7cc84a','#e8402a']};
function ART_trees(D){try{const mat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.42,metalness:0});
  for(const k in ART_TREES)if(D[k]){D[k].g=ART_TREES[k]();D[k].mat=mat;D[k].tint=ART_TINT[k];D[k].cols=[ART_TINT[k][0],'#8a5a32']}}catch(e){console.warn('ART_trees',e)}}
function ART_athTreeBy(k){if(k==='cypress')return ART_brickGeo([[2.4,1.2,1.2,0,0,'#3f8a3a'],[2.4,1.2,2.4,0,0,'#3a8236'],[2.4,1.2,3.6,0,0,'#3f8a3a'],[2.4,1.2,4.8,0,0,'#46923e'],[1.6,1.2,6.0,0,0,'#4f9a42'],[1.6,1.2,7.2,0,0,'#56a046'],[.8,1.0,8.4,0,0,'#5ea84a']],[.8,1.2,'#6a4426'],0);
  if(k==='olive')return ART_brickGeo([[4.8,1.0,2.6,.4,0,'#8fae5a'],[5.6,1.0,3.6,.4,0,'#9cbc64'],[3.2,.8,4.6,.8,0,'#a8c46e']],[1.2,2.6,'#7a6448'],0);
  if(k==='pine')return ART_brickGeo([[2.4,1.0,5.2,0,0,'#4f7a3a'],[7.2,1.0,6.2,0,0,'#5a8a3e'],[5.6,1.0,7.2,0,0,'#66984a']],[1.2,5.2,'#6a5040'],0);
  if(k==='plane')return ART_brickGeo([[5.6,1.4,4.2,0,0,'#f07a1a'],[7.2,1.6,5.6,0,0,'#f39a1a'],[5.6,1.4,7.2,.4,.4,'#ffc21c'],[3.2,1.0,8.6,.4,.4,'#e8402a']],[1.6,4.2,'#7a6a58'],0);
  return null}
function ART_athTree(){return ART_brickGeo([[4.0,1.0,2.8,0,0,'#5a9a3a'],[5.6,1.4,3.8,0,0,'#4f8f34'],[4.0,1.0,5.2,.4,0,'#6aaa42'],[2.4,.8,6.2,.4,0,'#7cbc4a']],[1.2,2.8,'#7a5236'],0)}
// global plastic look: studs on up-facing untextured surfaces above the ground, soft warm rim, slightly higher gloss
{const _ob=THREE.MeshStandardMaterial.prototype.onBeforeCompile;THREE.MeshStandardMaterial.prototype.onBeforeCompile=function(sh,r){_ob.call(this,sh,r);if(sh.fragmentShader.includes('artStud'))return;
  let f=sh.fragmentShader;
  f=f.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\n#ifndef USE_MAP\nroughnessFactor=min(roughnessFactor,.5);\n#endif');
  if(f.includes('vLkW'))f=f.replace('#include <color_fragment>','#include <color_fragment>\n#ifndef USE_MAP\n{/*artStud*/vec3 an=normalize(cross(dFdx(vLkW),dFdy(vLkW)));float fw=length(fwidth(vLkW.xz))/.32;if(an.y>.96&&vLkW.y>.6&&fw<.45){vec2 g=fract(vLkW.xz/.32)-.5;float rr=length(g);float k=1.-smoothstep(.15,.45,fw);float disc=1.-smoothstep(.24,.27,rr);float ring=smoothstep(.26,.3,rr)*(1.-smoothstep(.3,.38,rr));float lit=dot(normalize(g+1e-4),vec2(-.7,-.7));diffuseColor.rgb*=1.+k*(disc*(.08+.1*lit)-ring*.22);}}\n#endif');
  f=f.replace('#include <opaque_fragment>','{float fr=1.-max(dot(normalize(normal),normalize(vViewPosition)),0.);outgoingLight+=vec3(1.,.86,.66)*pow(fr,4.)*.16*(1.-roughnessFactor*.5);}\n#include <opaque_fragment>');
  sh.fragmentShader=f}}
/*ART</art2.js>*/
/*ART<art3.js>*/// ==== ART step 3+4 · blue boost speed lines + FOV kick, LEGO-2K HUD skin (module art3.js; patch pART3.py)
const ART3={};
const ART_m=new THREE.Matrix4(),ART_q=new THREE.Quaternion(),ART_s=new THREE.Vector3(),ART_p=new THREE.Vector3(),ART_up=new THREE.Vector3(0,1,0);
function ART_blobTex(){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),r=g.createRadialGradient(32,32,4,32,32,31);r.addColorStop(0,'rgba(0,0,0,1)');r.addColorStop(.55,'rgba(0,0,0,.75)');r.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=r;g.fillRect(0,0,64,64);const t=new THREE.CanvasTexture(c);if(typeof KEEP_TEX!=='undefined')KEEP_TEX.add(t);return t}
function ART_step(dt){if(!RO.on)return;
  // boost: blue speed lines + FOV kick
  const b=!!(pl&&pl.nitro);document.body.classList.toggle('artBoost',b);if(b)fovKick=Math.max(fovKick,7*TUNE.fxFov);if(ART3.fxL!==TUNE.fxLines){ART3.fxL=TUNE.fxLines;document.body.style.setProperty('--fxL',TUNE.fxLines)}
  const bar=ART3.bar||(ART3.bar=document.getElementById('artBoost'));if(bar&&pl){const v=Math.max(0,Math.min(100,pl.bm||0));if(ART3.bv!==(v|0)){ART3.bv=v|0;bar.firstChild.style.width=v+'%'}bar.classList.toggle('full',v>=99)}}

// sky light columns: 140 m mission/garage beacons become 1.5 m glowing ground rings; 1600 m searchlight beams are hidden
// registered at creation: every open transparent cylinder ≥ 60 m tall that gets added anywhere (6 beacon builders + searchlights)
ART3.bl=new Set();const ART_isBeam=o=>{const m=o&&o.material,g=o&&o.geometry;if(!o||!o.isMesh||!m||Array.isArray(m)||!m.transparent||!g||g.type!=='CylinderGeometry'||!g.parameters||!g.parameters.openEnded)return false;return g.parameters.height>=60};
{const _add=THREE.Object3D.prototype.add;THREE.Object3D.prototype.add=function(...a){for(const o of a)if(ART_isBeam(o))ART3.bl.add(o);return _add.apply(this,a)}}
scene.traverse(o=>{if(ART_isBeam(o))ART3.bl.add(o)});
function ART_beacons(dt){
  for(const o of ART3.bl){if(!o.parent){ART3.bl.delete(o);continue}const g=o.geometry;if(!g.boundingBox)g.computeBoundingBox();const b=g.boundingBox,h=b.max.y-b.min.y;if(h>1000){o.visible=false;continue}const u=o.userData;if(o.position.y!==u.artY)u.artB=o.position.y;const k=1.5/h;o.scale.y=k;const wd=b.max.x-b.min.x;if(wd>0){const kx=Math.min(1,3/wd);o.scale.x=o.scale.z=kx}o.position.y=u.artB+b.min.y*(1-k);u.artY=o.position.y}}
roamStep=(f=>function(dt){f(dt);try{ART_step(dt)}catch(e){}try{ART_beacons(dt)}catch(e){}})(roamStep);
// HUD skin: minimap N marker, purple NPC card with yellow header + round portrait, thin boost bar bottom-centre, bold italic headings
{const st=document.createElement('style');st.id='artHud';st.textContent=`
body #npcSay{background:linear-gradient(180deg,#6a35b8,#4a2290)!important;color:#fff!important;border:3px solid #ffd400;border-radius:14px!important;box-shadow:0 6px 0 rgba(0,0,0,.25),0 8px 20px rgba(0,0,0,.35)!important;padding:6px 12px 6px 6px!important}
body #npcSay img{width:46px;height:46px;border-radius:50%;border:3px solid #ffd400;background:#ffe9a8;object-fit:cover;flex:none}
body #npcSay b{display:inline-block;background:#ffd400;color:#141413;font:italic 900 12px/1.3 system-ui;text-transform:uppercase;padding:1px 8px;border-radius:6px;transform:skewX(-8deg);margin-bottom:3px}
body #npcSay p{margin:0;font:700 13px/1.25 system-ui;color:#fff}
body.touch #npcSay{left:calc(112px + env(safe-area-inset-left,0px))!important;top:calc(52px + env(safe-area-inset-top,0px))!important;transform:none!important;max-width:min(330px,42vw)!important}
#artBoost{position:absolute;left:50%;transform:translateX(-50%) skewX(-12deg);bottom:calc(44px + env(safe-area-inset-bottom,0px));width:min(180px,30vw);height:7px;border-radius:4px;background:rgba(10,14,28,.55);box-shadow:0 0 0 2px rgba(255,255,255,.85);overflow:hidden;pointer-events:none;display:none;z-index:5}
#artBoost i{display:block;height:100%;width:0;background:linear-gradient(90deg,#3aa8ff,#7ae0ff);transition:width .15s}
#artBoost.full i{background:linear-gradient(90deg,#3aa8ff,#bdf3ff);box-shadow:0 0 8px #7ae0ff}
body[data-mode=roam] #artBoost{display:block}
body.artBoost #speedFx{opacity:calc(.55*var(--fxL,1))!important;filter:hue-rotate(10deg) saturate(2.2) drop-shadow(0 0 2px #3aa8ff)}
.hcard h3,.hcard b,#home h2,#home h1{font-style:italic;font-weight:900;letter-spacing:.01em}`;document.head.appendChild(st);
 const b=document.createElement('div');b.id='artBoost';b.innerHTML='<i></i>';(document.getElementById('hud')||document.body).appendChild(b)}
/*ART</art3.js>*/
/*ART<art5.js>*/// ==== ART step 6 · road surfaces follow the physics ground (module art5.js; patch pART5.py): filler-grid streets and crossing squares were flat planes at y=.035,
// so on hills the ground covered them (green "grass" streets) or they floated; their vertices are now draped onto groundY + offset
function ART_gy(x,z){try{return groundY(x,z)}catch(e){return 0}}
function ART_drape(g,off){const p=g.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,ART_gy(p.getX(i),p.getZ(i))+off);p.needsUpdate=true;g.computeVertexNormals();return g}
/*ART</art5.js>*/
/*ART<art6.js>*/// ==== ART pART6 · no shadow blobs under cars; only one small soft contact patch under EACH TYRE (player, AI, race and city traffic).
// Visual only: grounding (ART4_base, the cars session's suspension) is untouched.
const ART6={};
const ART6_off=o=>{if(!o||o.userData.art6)return;o.userData.art6=1;Object.defineProperty(o,'visible',{configurable:true,get(){return false},set(v){}})};
const ART6_noCast=root=>{if(root)root.traverse(o=>{if(o.isMesh&&!o.userData.art6c){o.userData.art6c=1;Object.defineProperty(o,'castShadow',{configurable:true,get(){return false},set(v){}})}})};
shipMesh=(f=>function(){const g=f.apply(this,arguments);try{ART6_off(g.userData.shadow);ART6_noCast(g)}catch(e){}return g})(shipMesh);
ART4_tyres=(f=>function(){const im=f.apply(this,arguments);ART6_off(im);return im})(ART4_tyres);
let ART6_t=0;function ART6_sweep(){const t=performance.now();if(t-ART6_t<500)return;ART6_t=t;
  try{if(trShadow)ART6_off(trShadow);if(trGlow)ART6_off(trGlow)}catch(e){}try{if(CR_SH)ART6_off(CR_SH)}catch(e){}if(ART4.ty)ART6_off(ART4.ty);
  for(const s of[pl,...ships])if(s&&s.mesh){const ud=s.mesh.userData;if(ud&&ud.shadow)ART6_off(ud.shadow);ART6_noCast(s.mesh);const w=[];s.mesh.traverse(o=>{if(o.isMesh&&o.userData.r)w.push(o)});s.art6w=w}
  for(const o of TRM||[])for(const k in o)if(o[k]&&o[k].isMesh)ART6_noCast(o[k]);for(const k in HUB.cim||{})ART6_noCast(HUB.cim[k])}
// tyre patch pool (soft radial, 45 %)
function ART6_pool(){if(ART6.p)return ART6.p;const im=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:ART_blobTex(),color:0,transparent:true,opacity:.45,depthWrite:false,fog:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}),640);
  im.renderOrder=1;im.frustumCulled=false;im.userData.keep=1;im.count=0;scene.add(im);return ART6.p=im}
const ART6_M=new THREE.Matrix4(),ART6_L=new THREE.Matrix4(),ART6_B=new THREE.Box3(),ART6_V=new THREE.Vector3(),ART6_Q=new THREE.Quaternion(),ART6_S=new THREE.Vector3(),ART6_wl={};
// wheel clusters of a merged wheel geometry: split by side, then by gaps along z → [cx,minY,cz,width,length] in model space
function ART6_wheels(geo){const P=geo.attributes.position,out=[];for(const sd of[-1,1]){const pts=[];for(let i=0;i<P.count;i++){const x=P.getX(i);if(Math.sign(x)===sd)pts.push([x,P.getY(i),P.getZ(i)])}pts.sort((a,b)=>a[2]-b[2]);let g=[];
    const flush=()=>{if(!g.length)return;let x0=1e9,x1=-1e9,y0=1e9,z0=1e9,z1=-1e9;for(const p of g){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);z0=Math.min(z0,p[2]);z1=Math.max(z1,p[2])}out.push([(x0+x1)/2,y0,(z0+z1)/2,x1-x0,z1-z0]);g=[]};
    for(const p of pts){if(g.length&&p[2]-g[g.length-1][2]>.25)flush();g.push(p)}flush()}return out}
function ART6_step(){const T=ART6_pool();let n=0;const put=m=>{if(n<640)T.setMatrixAt(n++,m)};
  // player + race cars: one patch under each wheel mesh, at its lowest point, along the car's heading
  for(const s of[pl,...ships]){if(!s||!s.mesh||!s.mesh.visible||!s.art6w||s.air||(s.boatK||0)>.5)continue;if(state==='roam'&&(s!==pl||RO.vy!==0))continue;s.mesh.getWorldQuaternion(ART6_Q);
    for(const w of s.art6w){let v=true;for(let a=w;a;a=a.parent)if(!a.visible){v=false;break}if(!v)continue;const g=w.geometry;if(!g.boundingBox)g.computeBoundingBox();const lb=g.boundingBox;
      // spinning wheel: centre and radius from the local box (rotation-invariant), not the world AABB of the rotated box
      w.getWorldScale(ART6_S);lb.getCenter(ART6_V).applyMatrix4(w.matrixWorld);const r=Math.max(lb.max.y-lb.min.y,lb.max.z-lb.min.z)/2*ART6_S.y,t=(lb.max.x-lb.min.x)*ART6_S.x;
      ART6_V.y-=r-.015;ART6_M.compose(ART6_V,ART6_Q,ART6_S.set(t*1.25,1,r*1.1));put(ART6_M)}}
  // city traffic: wheel clusters of each model's wheel mesh × the car's instance matrix
  if(state==='roam'&&RO.on&&HUB.cars&&HUB.cim)for(const c of HUB.cars){if(c.dead>0||c.x==null)continue;const dx=c.x-RO.x,dz=c.z-RO.z;if(dx*dx+dz*dz>120*120)continue;const im=HUB.cim[c.k],wm=im&&im.userData.w;if(!wm)continue;
    const W=ART6_wl[c.k]||(ART6_wl[c.k]=ART6_wheels(wm.geometry));wm.getMatrixAt(c.j,ART6_M);
    for(const q of W){ART6_L.makeScale(q[3]*1.25,1,q[4]*.55).setPosition(q[0],q[1]+.015,q[2]);put(ART6_L.premultiply(ART6_M))}}
  // race traffic: four corner patches inside the car footprint (its old shadow matrix: width×1.1, length×1.05 on the road)
  if(state!=='roam'&&typeof trShadow!=='undefined'&&trShadow)for(const c of traffic||[]){if(c.i==null)continue;trShadow.getMatrixAt(c.i,ART6_M);const e=ART6_M.elements;if(e[0]*e[0]+e[1]*e[1]+e[2]*e[2]<1e-6)continue;
    for(const[x,z]of[[-.38,-.32],[.38,-.32],[-.38,.32],[.38,.32]]){ART6_L.makeScale(.2,1,.13).setPosition(x,0,z);put(ART6_L.premultiply(ART6_M))}}
  T.count=n;T.instanceMatrix.needsUpdate=true}
posShip=(f=>function(s,dt,snap){f(s,dt,snap);if(s===pl)ART6_sweep()})(posShip);
roamStep=(f=>function(dt){f(dt);ART6_sweep()})(roamStep);
// draw the patches right before each frame is rendered, after every pose and traffic update
renderer.render=(f=>function(sc,cam){if(sc===scene)try{ART6_step()}catch(e){}return f.call(this,sc,cam)})(renderer.render);
/*ART</art6.js>*/
/*ART<art7.js>*/// ==== ART pART7 · hill grass on the physics ground (±0.05 m): ground cells that are not flat split as a quadtree until each leaf's two
// triangles (gndBuild's diagonal) are within 3 cm of tH at 25 sample points; leaves stop at ~3 m. River-bank cells keep their own step.
// (constants inline: the world is built before this module's top-level lines run; function declarations are hoisted)
function ART7_flat(x,z,w,h,tol,dn){tol=tol||.03;dn=dn||tol;const A=tH(x,z),Bv=tH(x,z+h),C=tH(x+w,z),D=tH(x+w,z+h);
  for(let i=1;i<6;i++)for(let j=1;j<6;j++){const u=i/6,v=j/6,l=u+v<=1?A+(C-A)*u+(Bv-A)*v:D+(Bv-D)*(1-u)+(C-D)*(1-v);const e=l-tH(x+w*u,z+h*v);if(e>tol||-e>dn)return false}return true}
// pART8: the 3 cm fit is only needed where cars drive and the camera is close: cells ≤ 64 m whose every point is more than 8 m from every road edge
// (city, filler, autobahn, trails, mountain and town roads) use a 6 cm fit with ≥ 8 m leaves (same look from the road, far fewer triangles)
function ART7_rd(x,z){try{let b=1e9;const q=cityAt(x,z);if(q)b=Math.min(b,q.d-q.road.w/2);const f=fillAt(x,z);if(f)b=Math.min(b,f.d-f.r.w/2);const a=abAt(x,z);if(a)b=Math.min(b,a.d-a.road.w/2);
  return Math.min(b,trailDist(x,z)-7,mtnDist(x,z)-12,lzRoadD(x,z))}catch(e){return 0}}
function ART7_far(x,z,w,h){if(w>64||ART7_rd(x+w/2,z+h/2)<=Math.hypot(w,h)/2+4)return false;for(let i=0;i<=4;i++)for(let j=0;j<=4;j++)if(ART7_rd(x+w*i/4,z+h*j/4)<10)return false;return true}
// pART8: leaves that overlap a road keep splitting down to ~3 m until they fit within 2.5 cm (a 6 m leaf on a cambered street poked 7 cm
// through it); grass off the road may sit up to 4.5 cm high (tyre patches/cars on grass stay within ±5 cm)
function ART7_near(x,z,w,h){const r=Math.hypot(w,h)/4+1;for(let i=0;i<3;i++)for(let j=0;j<3;j++)if(ART7_rd(x+w*(2*i+1)/6,z+h*(2*j+1)/6)<r)return true;return false}
// grass vertices under a road sink up to 10 cm (some street strips run a few cm below the ground; the road covers the dip)
function ART8_dip(x,z){const r=ART7_rd(x,z);return r<-.6?.1:r<.4?.1*(.4-r):0}
function ART7_quad(x,z,w,h,out){const far=ART7_far(x,z,w,h),nr=!far&&ART7_near(x,z,w,h);if(w/2<(far?12:nr?2:6)||(far?ART7_flat(x,z,w,h,.2):ART7_flat(x,z,w,h,nr?.025:.06,.08))){out.push([x,z,w,h]);return}const w2=w/2,h2=h/2;
  ART7_quad(x,z,w2,h2,out);ART7_quad(x+w2,z,w2,h2,out);ART7_quad(x,z+h2,w2,h2,out);ART7_quad(x+w2,z+h2,w2,h2,out)}
// river-bank cells keep one uniform n×n grid (gndVert snaps it to the banks): the step is verified on the cell's own land triangles (pART8: water and
// bank sub-cells skipped; they used to force the 3 m maximum over every 200 m river cell) and grown to the road/far fit (≥ 3 m)
function ART7_res(a,b,c,d){const L=b-a,W=d-c,nMax=Math.max(1,Math.ceil(L/3));let n=1;
  for(;;){const sx=L/n,sz=W/n;let ok=true;for(let i=0;i<n&&ok;i++)for(let j=0;j<n;j++){const x=a+i*sx,z=c+j*sz,r=Math.hypot(sx,sz)/2;if(rivClear(x+sx/2,z+sz/2)<r+2&&ART7_rd(x+sx/2,z+sz/2)>r+4)continue;const far=ART7_far(x,z,sx,sz);if(!ART7_flat(x,z,sx,sz,far?.2:.025,far?.2:.05)){ok=false;break}}
    if(ok||n>=nMax)return n;n=Math.min(nMax,Math.ceil(n*1.5))}}
// pART8: a river cell as n×n blocks: blocks within reach of the water → [x,z,w,h,steps,snap] (uniform bank-snapped grid), others → quadtree leaves
function ART8_riv(ax,az,dx,dz,n0){const out=[],bs=dx/n0;for(let i=0;i<n0;i++)for(let j=0;j<n0;j++){const x=ax+i*bs,z=az+j*bs;
  if(rivClear(x+bs/2,z+bs/2)<bs*.71+6)out.push([x,z,bs,bs,ART7_res(x,x+bs,z,z+bs),1]);else ART7_quad(x,z,bs,bs,out)}return out}
/*ART</art7.js>*/

/*ART<art10.js>*/// ==== ART10 (v87g) · LEGO 2K Drive look, pass 2: root causes of the pale, cold, flat picture (no new objects on screen)
// 1) Pale lime grass and cyan-washed facades: the grass (roughness .55) and the Kenney facade kits (.55, metal .05) mirrored the bright sky
//    environment at the chase camera's grazing angle (Fresnel), lifting them toward white-blue. Matte baseplate grass and satin bricks keep their colour.
// 2) The environment's lower half was sky blue (ART.gnd), so every side face and car flank reflected/received blue from below. Now a neutral asphalt-grey ground.
// 3) Cars never got their gloss: with scene.environment set, three.js uses scene.environmentIntensity (.55) for every material WITHOUT its own envMap,
//    so the authored car envMapIntensity (1.3-2.2) was ignored. Car paint now carries the env map itself; the world's env drops to .35 (less blue cast).
// 4) Traffic windows used the matte wheel material (rough .8): glossy dark glass now.
ART.gnd=[.24,.25,.27];
const ART10={t:0,mats:new Set()};
function ART10_world(){const M=HUB&&HUB.M;if(!M)return;for(const k of['walk','yard','grass'])if(M[k]){M[k].roughness=.95;M[k].metalness=0}
  if(typeof KMM!=='undefined')for(const k in KMM){const m=KMM[k];if(m&&m.map){m.roughness=.8;m.metalness=0}}}
// cap: env reflections above ~.6-1.2 wash a blue or white paint into pale sky colour (A/B side shots: traffic .35 flat, .6 glossy, 1.3 pale)
function ART10_env(m,cap){const e=scene.environment;if(!m||!m.isMeshStandardMaterial||!e)return;if(m.envMap!==e){const nu=!m.envMap;m.envMap=e;if(nu)m.needsUpdate=true}
  if(m.userData.a10e===undefined)m.userData.a10e=m.envMapIntensity;m.envMapIntensity=Math.min(m.userData.a10e,cap||1.2);ART10.mats.add(m)}
function ART10_glass(){if(ART10.gl)return ART10.gl;return ART10.gl=new THREE.MeshPhysicalMaterial({vertexColors:true,roughness:.06,metalness:0,clearcoat:1,clearcoatRoughness:.04,envMapIntensity:1.4})}
function ART10_cars(){ART10_env(CR_CM,1);ART10_env(ART9_cabMat(),.6);ART10_env(ART10_glass(),1.4);
  if(HUB&&HUB.cim)for(const k in HUB.cim){const im=HUB.cim[k],g=im&&im.userData.g;if(g&&g.material!==ART10.gl)g.material=ART10.gl;if(im)for(const m of[].concat(im.material))ART10_env(m,.6)}
  if(pl&&pl.mesh)pl.mesh.traverse(o=>{if(o.isMesh)for(const m of[].concat(o.material))if(m&&(m.isMeshPhysicalMaterial||m.envMapIntensity>1))ART10_env(m)})}
ART.hook=w=>{scene.environmentIntensity=.55+(.35-.55)*w;moonL.color.set('#fff0dc');hemi.intensity=1-.15*w};
{const _ah=ART_hub;ART_hub=function(){const r=_ah.apply(this,arguments);try{ART10_world()}catch(e){}return r}}
roamStep=(f=>function(dt){f(dt);const t=performance.now();if(t-ART10.t>500){ART10.t=t;try{ART10_cars()}catch(e){}}})(roamStep);
