// ===== GFX (gfx-1, 2026-10-13): daytime lighting/rendering pass against the "flat, ugly" look.
// Root cause (measured in v90n, Frankfurt, high): Neutral tone mapping (no filmic contrast), a white hemisphere fill at .85 that lights the
// shaded faces almost as bright as the sunlit ones, sun at 54° from above (short shadows, every facade the same), env reflections at .35 with
// roughness .5 (no plastic highlights), and NO sun shadow map at all on the phone tier (med).
// Fix (all behind GFX.on; ?gfx=1 / ?gfx=0 overrides, else store 'mho_gfx'): ACES filmic, a warm lower sun (~33°) with a fitted shadow map
// around the player on high AND med (2048 PCFSoft / 1024 PCF), a weak blue-sky/green-ground fill, glossy LEGO plastic (roughness .3-.42,
// env 1.0) on everything that casts a shadow (buildings, cars, props; never the ground), deeper sky, subtle bloom on highlights.
const GFX={on:(()=>{try{const q=new URLSearchParams(location.search).get('gfx');if(q!==null)return q!=='0';return store.get('mho_gfx',0)===1}catch(e){return false}})(),
 day:false,keyOrig:new Map(),mats:new WeakSet(),pm:[],gm:[],U:{value:1},t:0,n:0,tier:null};
const GFX_SUN=[560,430,330];   // ~33° elevation, from the front-right of the usual driving direction: long side shadows, lit/shaded facades differ
function GFX_tier(){try{const L=LK_lvl();return L==='high'?'high':L==='med'?'med':'off'}catch(e){return SET.q==='high'?'high':SET.q==='med'?'med':'off'}}
function GFX_isDay(){return RO.on&&MOOD&&!(typeof FL!=='undefined'&&FL.n>.5)&&MOOD.id!=='night'&&MOOD.id!=='flnight'}
// lights, tone mapping, sky, fog: applied after ART_light (which runs after every mood / day-cycle update while roaming)
function GFX_light(){if(!GFX.on)return;const day=GFX_isDay();GFX.day=day;
 if(!day){GFX.U.value=1;if(renderer.toneMapping!==THREE.NeutralToneMapping)renderer.toneMapping=THREE.NeutralToneMapping;return}
 if(!GFX.keyOrig.has(MOOD)){GFX.keyOrig.set(MOOD,MOOD.key[2]);MOOD.key[2]=GFX_SUN}moonL.position.set(...GFX_SUN);
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.06;
 const ath=CID==='ath';moonL.color.set(ath?'#ffd9a8':'#ffe1b4');moonL.intensity=4.3;
 hemi.color.set('#a9c8ff');hemi.groundColor.set(ath?'#7a6a48':'#4f6a38');hemi.intensity=.68;
 scene.environmentIntensity=.3;   // ground/road: weak sky reflection (1.0 washed the grass white). Plastic gets its own env, below
 const U=SKYU;U.uTop.value.set(.012,.09,.55);U.uMid.value.set(.05,.26,.86);U.uHor.value.set(ath?.62:.48,ath?.66:.68,ath?.78:.92);U.uSun.value.set(1.0,.8,.5);
 scene.fog.color.set(ath?'#cfd6e2':'#b9cff0');
 GFX.U.value=.15;bloom.strength=.16;bloom.radius=.45;
for(const m of GFX.gm)m.roughness=.88}   // applyMoodMaterials resets the road's roughness on every mood change
// 98_garage_driver forces bloom.threshold=1 before every roam render: by GFX day the threshold reads 2.2 whatever is written
{let thr=bloom.threshold;Object.defineProperty(bloom,'threshold',{configurable:true,get(){return GFX.on&&GFX.day&&RO.on?2.2:thr},set(v){thr=v}})}
function GFX_off(){if(GFX.gtao)GFX.gtao.enabled=false;GFX_carLock();GFX.U.value=1;for(const m of GFX.gm){const o=m.userData.gfx0;if(o)m.roughness=o[0]}GFX.gm=[];for(const m of GFX.pm){const o=m.userData.gfx0;if(o){m.roughness=o[0];m.envMapIntensity=o[1]}m.envMap=null;m.needsUpdate=true}GFX.pm=[];GFX.mats=new WeakSet();GFX.n=0;
 if(HUB.grp)HUB.grp.traverse(o=>{if(o.userData.gfxCast){o.castShadow=false;o.userData.gfxCast=0}});for(const[m,k]of GFX.keyOrig)m.key[2]=k;GFX.keyOrig.clear();renderer.toneMapping=THREE.NeutralToneMapping}
// shadow map: fitted ±55 m (high, 2048, soft) / ±40 m (med, 1024) around the player; LK_roamLook only allowed it on high
function GFX_shadow(){if(!GFX.on||!HUB.grp||!HUB.grp.visible)return;const t=GFX_tier();GFX.tier=t;
 if(t==='off'||!GFX.day){return}
 if(!RO.shadowOn)LK_shadow(true);if(!RO.shadowOn)return;
 const sz=t==='high'?2048:1024,ext=t==='high'?55:40,sh=moonL.shadow,sc=sh.camera;
 renderer.shadowMap.type=t==='high'?THREE.PCFSoftShadowMap:THREE.PCFShadowMap;
 if(sh.mapSize.x!==sz){sh.mapSize.set(sz,sz);if(sh.map){sh.map.dispose();sh.map=null}}
 if(sc.right!==ext){sc.left=sc.bottom=-ext;sc.right=sc.top=ext;sc.near=20;sc.far=1200;sc.updateProjectionMatrix()}
 sh.bias=-.0004;sh.normalBias=t==='high'?.35:.5}
// glossy LEGO plastic: every non-transparent standard material on a shadow-casting mesh (the ground never casts)
// ground: driving towards a low sun, GGX Fresnel at grazing angles turned grass and road into a pale yellow sheen (not bloom: it stays with bloom off).
// Grass and asphalt barely reflect: keep 15 % of the direct specular. Chains any existing onBeforeCompile; own program-cache key.
function GFX_gspec(m){if(m.userData.gfxSpec)return;m.userData.gfxSpec=1;const ob=m.onBeforeCompile,ck=m.customProgramCacheKey;
 m.onBeforeCompile=function(sh,r){if(ob)ob.call(this,sh,r);sh.uniforms.uGfxSp=GFX.U;sh.fragmentShader=sh.fragmentShader.replace('void main() {','uniform float uGfxSp;\nvoid main() {').replace('#include <lights_fragment_end>','#include <lights_fragment_end>\nreflectedLight.directSpecular*=uGfxSp;')};
 m.customProgramCacheKey=function(){return(ck?ck.call(this):'')+'|gfxg'};m.needsUpdate=true}
// ground (meshes that never cast): matte. Grass/pavement at roughness .55 caught the low sun as a white sheen across Frankfurt
// ground = never casts, or mostly up-facing triangles (>= 70 % of sampled normals; pavement strips with kerbs sit near 75 %): Frankfurt's merged grass/pavement/road plates DO cast and
// carry kerbs (bbox > .5 m), so neither "casts" nor a flat bbox found them; at roughness .4 they lit up as a white sun sheen
function GFX_flat(o){const g=o.geometry;if(!g||!g.attributes||!g.attributes.normal)return false;if(g.userData.gfxUp!==undefined)return g.userData.gfxUp;
 const N=g.attributes.normal,n=N.count,st=Math.max(1,Math.floor(n/400));let up=0,k=0;for(let i=0;i<n;i+=st){k++;if(N.getY(i)>.9)up++}return g.userData.gfxUp=k>0&&up/k>=.7}
function GFX_plastic(root){let k=0;root.traverse(o=>{if(!o.isMesh)return;if(!o.castShadow||GFX_flat(o)){for(const m of[].concat(o.material)){if(!m||GFX.mats.has(m)||!m.isMeshStandardMaterial||m.isMeshPhysicalMaterial||m.transparent||m.roughness>=.85)continue;
    GFX.mats.add(m);m.userData.gfx0=[m.roughness,m.envMapIntensity];m.roughness=.88;GFX_gspec(m);GFX.gm.push(m)}return}
  for(const m of[].concat(o.material)){if(!m||GFX.mats.has(m))continue;if(GFX.gm.includes(m))continue;GFX.mats.add(m);
  if(!m.isMeshStandardMaterial||m.transparent||m.metalness>.3)continue;m.userData.gfx0=[m.roughness,m.envMapIntensity];
  m.roughness=Math.min(m.roughness,m.isMeshPhysicalMaterial?.25:.4)*.85+.06;m.envMapIntensity=.9;GFX.pm.push(m);k++}});GFX.n+=k;
 // three uses scene.environmentIntensity for every material without its own envMap: give plastic the scene env explicitly so its own intensity counts
 const env=GFX_room();if(env)for(const m of GFX.pm)if(m.envMap!==env){if(!m.envMap)m.needsUpdate=true;m.envMap=env}return k}
// stock three.js RoomEnvironment through PMREM (three r164 addon, as in the three.js examples): soft studio panels = the white glints of LEGO
// product shots. Built once (~30 ms), shared by all plastic.
function GFX_room(){if(GFX.room)return GFX.room;try{const pm=new THREE.PMREMGenerator(renderer);GFX.room=pm.fromScene(new RoomEnvironment(),.04).texture;pm.dispose()}catch(e){GFX.room=scene.environment}return GFX.room}
// stock GTAOPass (three r164 addon) after the RenderPass, PC high tier by day only: contact shadows where bricks meet the street and in corners.
// It re-renders scene normals/depth, so it costs one extra geometry pass: never on med/phone.
function GFX_ao(){const want=GFX.on&&GFX.day&&GFX.tier==='high'&&state==='roam';if(!want&&!GFX.gtao)return;
 if(!GFX.gtao){const w=innerWidth,h=innerHeight;const p=new GTAOPass(scene,camera,w,h);p.output=GTAOPass.OUTPUT.Default;p.blendIntensity=.7;
  p.updateGtaoMaterial({radius:1.2,distanceExponent:1.5,thickness:1.5,scale:1,samples:12});p.updatePdMaterial({lumaPhi:10,depthPhi:2,normalPhi:3,radius:6,rings:2,samples:12});
  composer.insertPass(p,1);GFX.gtao=p;resize()}
 GFX.gtao.enabled=want}
function GFX_aoSize(){if(GFX.gtao){const pr=renderer.getPixelRatio();GFX.gtao.setSize(innerWidth*pr,innerHeight*pr)}}
resize=(f=>function(){f.apply(this,arguments);GFX_aoSize()})(resize);addEventListener('resize',GFX_aoSize);   // the window listener holds the unwrapped resize
// the player car is rebuilt (LEGO model, garage, ride swap) after LK_shadow flagged it, so it lost castShadow: re-flag every pass.
// It does not receive: self-shadowing small bricks gave red/black acne speckle on the body.
// ART6_noCast (97_art.js, v86v) locks castShadow to a getter returning false on the player car: unlock it (delete the accessor), re-lock on GFX off.
function GFX_car(){if(!pl||!pl.mesh||!RO.shadowOn)return;pl.mesh.traverse(o=>{if(!o.isMesh)return;if(o.userData.art6c&&!o.userData.gfxUnl){delete o.castShadow;o.userData.gfxUnl=1}o.castShadow=true;o.receiveShadow=false})}
function GFX_carLock(){if(pl&&pl.mesh)pl.mesh.traverse(o=>{if(o.userData.gfxUnl){o.userData.gfxUnl=0;Object.defineProperty(o,'castShadow',{configurable:true,get(){return false},set(v){}})}})}
// merged city blocks (95_drive_flow DR_, 98wb world batch) were built with castShadow=false: buildings threw no shadow on the street.
// Tall ones (> 2.5 m) cast again; ground/road merges stay off (they would only add acne and shadow-pass cost).
function GFX_cast(){if(!HUB.grp)return;let k=0;HUB.grp.traverse(o=>{if(!o.isMesh||o.castShadow||o.userData.gfxNo||!o.geometry||!o.visible)return;const g=o.geometry;if(!g.boundingBox)g.computeBoundingBox();
  if(g.boundingBox.max.y-g.boundingBox.min.y<2.5){o.userData.gfxNo=1;return}o.castShadow=true;o.receiveShadow=true;o.userData.gfxCast=1;k++});GFX.cast=(GFX.cast||0)+k}
function GFX_frame(){if(!GFX.on||state!=='roam')return;const now=performance.now();if(now<GFX.t)return;GFX.t=now+2500;GFX.fc=(GFX.fc||0)+1;GFX_shadow();GFX_car();if(RO.shadowOn)GFX_cast();try{GFX_ao()}catch(e){GFX.aoErr=String(e)}try{GFX_plastic(scene)}catch(e){}}
ART_light=(f=>function(){const r=f.apply(this,arguments);try{GFX_light()}catch(e){}return r})(ART_light);
LK_roamLook=(f=>function(){const r=f.apply(this,arguments);try{GFX.t=0;GFX_frame()}catch(e){}return r})(LK_roamLook);
roamStep=(f=>function(dt){f(dt);GFX_frame()})(roamStep);
function GFX_set(on){GFX.on=!!on;try{store.set('mho_gfx',on?1:0)}catch(e){}if(on){GFX.t=0;ART_light()}else{GFX_off();applyMood(MOOD.id)}}
// shadow-map depth check: depth (0 near the sun .. 1 far) at the car's roof vs at open road 12 m to its side; car < road = the car is in the map
function GFX_shChk(){const sh=moonL.shadow;if(!sh.map||!pl)return null;const W=sh.mapSize.x,px=new Uint8Array(4),v=new THREE.Vector3(),rd=p=>{v.copy(p).applyMatrix4(sh.matrix);
  const x=Math.round(v.x*W),y=Math.round(v.y*W);if(x<0||y<0||x>=W||y>=W)return null;renderer.readRenderTargetPixels(sh.map,x,y,1,1,px);return+(px[0]/255/16777216+px[1]/255/65536+px[2]/255/256+px[3]/255).toFixed(4)};
 const c=new THREE.Vector3(RO.x,RO.y+1,RO.z),s=new THREE.Vector3(RO.x+Math.cos(RO.h)*12,RO.y,RO.z-Math.sin(RO.h)*12);return{car:rd(c),road:rd(s)}}
window.__gfx={render:()=>composer.render(),get GFX(){return GFX},set:GFX_set,shChk:GFX_shChk,state(){const sh=moonL.shadow;return{on:GFX.on,day:GFX.day,tier:GFX.tier,tone:renderer.toneMapping===THREE.ACESFilmicToneMapping?'ACES':renderer.toneMapping,
 exp:renderer.toneMappingExposure,shadowMap:renderer.shadowMap.enabled,sunCast:moonL.castShadow,map:sh.mapSize.x,ext:sh.camera.right,sunEl:+(Math.asin(moonL.position.clone().sub(moonL.target.position).normalize().y)*57.3).toFixed(1),
 hemi:hemi.intensity,env:scene.environmentIntensity,plEnv:GFX.pm.length?+(GFX.pm.reduce((a,m)=>a+m.envMapIntensity,0)/GFX.pm.length).toFixed(2):0,plRough:GFX.pm.length?+(GFX.pm.reduce((a,m)=>a+m.roughness,0)/GFX.pm.length).toFixed(2):0,plMetal:GFX.pm.length?+Math.max(...GFX.pm.map(m=>m.metalness)).toFixed(2):0,plastic:GFX.n,ao:!!(GFX.gtao&&GFX.gtao.enabled),aoErr:GFX.aoErr||'',cast:GFX.cast||0,fc:GFX.fc,carCast:pl&&pl.mesh?(()=>{let c=0,n=0;pl.mesh.traverse(o=>{if(o.isMesh){n++;if(o.castShadow)c++}});return c+'/'+n})():'no pl'}}};
