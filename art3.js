// ==== ART step 3+4 · blue boost speed lines + FOV kick, LEGO-2K HUD skin (module art3.js; patch pART3.py)
const ART3={};
const ART_m=new THREE.Matrix4(),ART_q=new THREE.Quaternion(),ART_s=new THREE.Vector3(),ART_p=new THREE.Vector3(),ART_up=new THREE.Vector3(0,1,0);
function ART_blobTex(){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),r=g.createRadialGradient(32,32,4,32,32,31);r.addColorStop(0,'rgba(0,0,0,1)');r.addColorStop(.55,'rgba(0,0,0,.75)');r.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=r;g.fillRect(0,0,64,64);const t=new THREE.CanvasTexture(c);if(typeof KEEP_TEX!=='undefined')KEEP_TEX.add(t);return t}
function ART_step(dt){if(!RO.on)return;
  // boost: blue speed lines + FOV kick
  const b=!!(pl&&pl.nitro);document.body.classList.toggle('artBoost',b);if(b)fovKick=Math.max(fovKick,7);
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
body.artBoost #speedFx{opacity:.55!important;filter:hue-rotate(10deg) saturate(2.2) drop-shadow(0 0 2px #3aa8ff)}
.hcard h3,.hcard b,#home h2,#home h1{font-style:italic;font-weight:900;letter-spacing:.01em}`;document.head.appendChild(st);
 const b=document.createElement('div');b.id='artBoost';b.innerHTML='<i></i>';(document.getElementById('hud')||document.body).appendChild(b)}
