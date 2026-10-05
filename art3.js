// ==== ART step 3+4 · soft contact shadows under cars, blue boost speed lines + FOV kick, LEGO-2K HUD skin (module art3.js; patch pART3.py)
const ART3={};
function ART_blobTex(){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),r=g.createRadialGradient(32,32,4,32,32,31);r.addColorStop(0,'rgba(0,0,0,1)');r.addColorStop(.55,'rgba(0,0,0,.75)');r.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=r;g.fillRect(0,0,64,64);const t=new THREE.CanvasTexture(c);if(typeof KEEP_TEX!=='undefined')KEEP_TEX.add(t);return t}
function ART_shadows(){if(ART3.pl)return;const tex=ART_blobTex(),geo=new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2);
  const mat=new THREE.MeshBasicMaterial({map:tex,color:0x000000,transparent:true,opacity:.5,depthWrite:false,fog:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
  ART3.pl=new THREE.Mesh(geo,mat);ART3.pl.renderOrder=1;ART3.pl.frustumCulled=false;ART3.pl.userData.keep=1;
  ART3.tr=new THREE.InstancedMesh(geo,mat.clone(),96);ART3.tr.material.opacity=.42;ART3.tr.renderOrder=1;ART3.tr.frustumCulled=false;ART3.tr.count=0;ART3.tr.userData.keep=1;scene.add(ART3.pl,ART3.tr)}
const ART_m=new THREE.Matrix4(),ART_q=new THREE.Quaternion(),ART_s=new THREE.Vector3(),ART_p=new THREE.Vector3(),ART_up=new THREE.Vector3(0,1,0);
function ART_step(dt){if(!RO.on){if(ART3.pl)ART3.pl.visible=ART3.tr.visible=false;return}ART_shadows();const gy=(x,z)=>{try{return groundY(x,z)}catch(e){return 0}};
  const P=ART3.pl;P.visible=true;const air=RO.y-gy(RO.x,RO.z);P.position.set(RO.x,gy(RO.x,RO.z)+.07,RO.z);P.rotation.y=RO.h;const k=Math.max(.35,1-Math.max(0,air)/8);P.scale.set(3.1*k+.6,1,5.6*k+.6);P.material.opacity=.5*k;
  const T=ART3.tr,C=HUB.cars||[];let n=0;for(const c of C){if(n>=96)break;if(c.dead||c.x==null)continue;const dx=c.x-RO.x,dz=c.z-RO.z;if(dx*dx+dz*dz>140*140)continue;ART_q.identity();ART_m.compose(ART_p.set(c.x,(c.y??gy(c.x,c.z))+.07,c.z),ART_q,ART_s.set(4.6,1,4.6));T.setMatrixAt(n++,ART_m)}T.count=n;T.instanceMatrix.needsUpdate=true;T.visible=true;
  // boost: blue speed lines + FOV kick
  const b=!!(pl&&pl.nitro);document.body.classList.toggle('artBoost',b);if(b)fovKick=Math.max(fovKick,7);
  const bar=ART3.bar||(ART3.bar=document.getElementById('artBoost'));if(bar&&pl){const v=Math.max(0,Math.min(100,pl.bm||0));if(ART3.bv!==(v|0)){ART3.bv=v|0;bar.firstChild.style.width=v+'%'}bar.classList.toggle('full',v>=99)}}

// sky light columns: 140 m mission/garage beacons become 1.5 m glowing ground rings; 1600 m searchlight beams are hidden
function ART_beacons(dt){ART3.bt=(ART3.bt||0)-dt;if(ART3.bt<=0||!ART3.bl){ART3.bt=4;const L=[];scene.traverse(o=>{const m=o.material;if(!o.isMesh||!m||Array.isArray(m)||!m.transparent||!o.geometry||o.geometry.type!=='CylinderGeometry')return;const g=o.geometry;if(!g.boundingBox)g.computeBoundingBox();const h=g.boundingBox.max.y-g.boundingBox.min.y;if(h>=100)L.push(o)});ART3.bl=L}
  for(const o of ART3.bl){const g=o.geometry,b=g.boundingBox,h=b.max.y-b.min.y;if(h>1000){o.visible=false;continue}const u=o.userData;if(o.position.y!==u.artY)u.artB=o.position.y;const k=1.5/h;o.scale.y=k;o.position.y=u.artB+b.min.y*(1-k);u.artY=o.position.y}}
roamStep=(f=>function(dt){f(dt);try{ART_step(dt);ART_beacons(dt)}catch(e){}})(roamStep);
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
body.artBoost #speedFx{opacity:.55!important;filter:hue-rotate(10deg) saturate(2.2) drop-shadow(0 0 2px #3aa8ff)}
.hcard h3,.hcard b,#home h2,#home h1{font-style:italic;font-weight:900;letter-spacing:.01em}`;document.head.appendChild(st);
 const b=document.createElement('div');b.id='artBoost';b.innerHTML='<i></i>';(document.getElementById('hud')||document.body).appendChild(b)}
