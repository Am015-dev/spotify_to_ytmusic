// ==== ART · LEGO 2K Drive look (module art.js; patch pART1.py) — step 1: deep-blue sky, studded green baseplate ground, grey asphalt with double yellow line, bright midday light
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

// brick clouds: ~22 stacked-plate clouds with studs on a far ring that follows the camera (never overhead, so the sky stays deep blue); 2 draw calls
cloudsOn=function(v){if(v&&!CLOUDS){const L=13,BR=[],ST=[];let r=5;const rnd=()=>(r=(r*16807)%2147483647)/2147483647;
  for(let c=0;c<22;c++){const a=c/22*Math.PI*2+rnd()*.2,R=1350+rnd()*500,cx=Math.cos(a)*R,cz=Math.sin(a)*R,cy=170+rnd()*260,yaw=a+Math.PI/2;const ca=Math.cos(yaw),sa=Math.sin(yaw);
   const lay=[[4+(rnd()*3|0),2],[2+(rnd()*3|0),2],[1+(rnd()*2|0),1]];let y=0;
   for(let li=0;li<3;li++){const[n,dep]=lay[li];if(li===2&&rnd()<.35)break;const h=li===0?1.2:.4+.8*(rnd()<.5);for(let i=0;i<n;i++){const w=2*(1+(rnd()*2|0)),d=dep*2,ox=(i-(n-1)/2)*w*.78*L+(rnd()-.5)*L,oz=(rnd()-.5)*L;
     BR.push([cx+ox*ca-oz*sa,cy+y+h*L/2,cz+ox*sa+oz*ca,w*L,h*L,d*L,yaw]);for(let sx=0;sx<w;sx++)for(let sz=0;sz<d;sz++){const px=ox+(sx-(w-1)/2)*L,pz=oz+(sz-(d-1)/2)*L;ST.push([cx+px*ca-pz*sa,cy+y+h*L,cz+px*sa+pz*ca])}}y+=(li===0?1.2:.8)*L}}
  const mat=new THREE.MeshLambertMaterial({color:0xffffff,emissive:0xb8cdf0,emissiveIntensity:.42,fog:false});
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
{const _rc=roamCam;roamCam=function(dt){const r=_rc.apply(this,arguments);try{if(RO.on&&!RO.mapOpen){const c=camera.position,dx=c.x-RO.x,dz=c.z-RO.z,d=Math.hypot(dx,dz),M=11;if(d>M){const k=M/d;c.x=RO.x+dx*k;c.z=RO.z+dz*k;camera.updateMatrixWorld()}}}catch(e){}return r}}
roamStep=(f=>function(dt){f(dt);if(flash>1)flash=1;if(hitFx>1)hitFx=1;if(CLOUDS&&CLOUDS.userData.art)CLOUDS.position.set(camera.position.x,0,camera.position.z);if(!ART.done||HUB.M&&HUB.M.artDone!==CID){ART.done=1;ART_hub();ART_light()}})(roamStep);
window.__art={get pl(){return pl},gAt:(x,z,y)=>groundAt(x,z,y),ART,ART_hub,ART_light,get HUB(){return HUB},get MOOD(){return MOOD},get FL(){return FL},SKYU,hemi,moonL,scene,renderer,THREE,get RO(){return RO},get CID(){return CID},LK,get bloom(){return bloom}};
