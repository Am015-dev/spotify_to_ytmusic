// ===== GFX (gfx-1, 2026-10-13): daytime lighting/rendering pass against the "flat, ugly" look.
// Root cause (measured in v90n, Frankfurt, high): Neutral tone mapping (no filmic contrast), a white hemisphere fill at .85 that lights the
// shaded faces almost as bright as the sunlit ones, sun at 54° from above (short shadows, every facade the same), env reflections at .35 with
// roughness .5 (no plastic highlights), and NO sun shadow map at all on the phone tier (med).
// Fix (all behind GFX.on; ?gfx=1 / ?gfx=0 overrides, else store 'mho_gfx'): ACES filmic, a warm lower sun (~33°) with a fitted shadow map
// around the player on high AND med (2048 PCFSoft / 1024 PCF), a weak blue-sky/green-ground fill, glossy LEGO plastic (roughness .3-.42,
// env 1.0) on everything that casts a shadow (buildings, cars, props; never the ground), deeper sky, subtle bloom on highlights.
const GFX={on:(()=>{try{const q=new URLSearchParams(location.search).get('gfx');if(q!==null)return q!=='0';return store.get('mho_gfx',0)===1}catch(e){return false}})(),
 day:false,keyOrig:new Map(),mats:new WeakSet(),t:0,n:0,tier:null};
const GFX_SUN=[560,430,330];   // ~33° elevation, from the front-right of the usual driving direction: long side shadows, lit/shaded facades differ
function GFX_tier(){try{const L=LK_lvl();return L==='high'?'high':L==='med'?'med':'off'}catch(e){return SET.q==='high'?'high':SET.q==='med'?'med':'off'}}
function GFX_isDay(){return RO.on&&MOOD&&!(typeof FL!=='undefined'&&FL.n>.5)&&MOOD.id!=='night'&&MOOD.id!=='flnight'}
// lights, tone mapping, sky, fog: applied after ART_light (which runs after every mood / day-cycle update while roaming)
function GFX_light(){if(!GFX.on)return;const day=GFX_isDay();GFX.day=day;
 if(!day){if(renderer.toneMapping!==THREE.NeutralToneMapping)renderer.toneMapping=THREE.NeutralToneMapping;return}
 if(!GFX.keyOrig.has(MOOD)){GFX.keyOrig.set(MOOD,MOOD.key[2]);MOOD.key[2]=GFX_SUN}moonL.position.set(...GFX_SUN);
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;
 const ath=CID==='ath';moonL.color.set(ath?'#ffd9a8':'#ffe1b4');moonL.intensity=4.3;
 hemi.color.set('#a9c8ff');hemi.groundColor.set(ath?'#7a6a48':'#4f6a38');hemi.intensity=.45;
 scene.environmentIntensity=1.0;
 const U=SKYU;U.uTop.value.set(.012,.09,.55);U.uMid.value.set(.05,.26,.86);U.uHor.value.set(ath?.62:.48,ath?.66:.68,ath?.78:.92);U.uSun.value.set(1.6,1.25,.8);
 scene.fog.color.set(ath?'#cfd6e2':'#b9cff0');
 bloom.strength=.16;bloom.radius=.45}
function GFX_off(){for(const[m,k]of GFX.keyOrig)m.key[2]=k;GFX.keyOrig.clear();renderer.toneMapping=THREE.NeutralToneMapping;bloom.threshold=1}
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
function GFX_plastic(root){let k=0;root.traverse(o=>{if(!o.isMesh||!o.castShadow)return;for(const m of[].concat(o.material)){if(!m||GFX.mats.has(m))continue;GFX.mats.add(m);
  if(!m.isMeshStandardMaterial||m.transparent||m.metalness>.5)continue;m.userData.gfx0=[m.roughness,m.envMapIntensity];
  m.roughness=Math.min(m.roughness,m.isMeshPhysicalMaterial?.25:.4)*.85+.06;m.envMapIntensity=1;k++}});GFX.n+=k;return k}
// the player car is rebuilt (LEGO model, garage, ride swap) after LK_shadow flagged it, so it lost castShadow: re-flag every pass.
// It does not receive: self-shadowing small bricks gave red/black acne speckle on the body.
function GFX_car(){if(!pl||!pl.mesh||!RO.shadowOn)return;pl.mesh.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=false}})}
function GFX_frame(dt){if(!GFX.on||state!=='roam')return;if((GFX.t-=dt)>0)return;GFX.t=2.5;GFX_shadow();GFX_car();try{GFX_plastic(scene)}catch(e){}}
ART_light=(f=>function(){const r=f.apply(this,arguments);try{GFX_light()}catch(e){}return r})(ART_light);
LK_roamLook=(f=>function(){const r=f.apply(this,arguments);try{GFX.t=0;GFX_frame(0)}catch(e){}return r})(LK_roamLook);
roamStep=(f=>function(dt){f(dt);GFX_frame(dt)})(roamStep);
function GFX_set(on){GFX.on=!!on;try{store.set('mho_gfx',on?1:0)}catch(e){}if(on){GFX.t=0;ART_light()}else{GFX_off();applyMood(MOOD.id)}}
// shadow-map depth check: depth (0 near the sun .. 1 far) at the car's roof vs at open road 12 m to its side; car < road = the car is in the map
function GFX_shChk(){const sh=moonL.shadow;if(!sh.map||!pl)return null;const W=sh.mapSize.x,px=new Uint8Array(4),v=new THREE.Vector3(),rd=p=>{v.copy(p).applyMatrix4(sh.matrix);
  const x=Math.round(v.x*W),y=Math.round(v.y*W);if(x<0||y<0||x>=W||y>=W)return null;renderer.readRenderTargetPixels(sh.map,x,y,1,1,px);return+(px[0]/255/16777216+px[1]/255/65536+px[2]/255/256+px[3]/255).toFixed(4)};
 const c=new THREE.Vector3(RO.x,RO.y+1,RO.z),s=new THREE.Vector3(RO.x+Math.cos(RO.h)*12,RO.y,RO.z-Math.sin(RO.h)*12);return{car:rd(c),road:rd(s)}}
window.__gfx={get GFX(){return GFX},set:GFX_set,shChk:GFX_shChk,state(){const sh=moonL.shadow;return{on:GFX.on,day:GFX.day,tier:GFX.tier,tone:renderer.toneMapping===THREE.ACESFilmicToneMapping?'ACES':renderer.toneMapping,
 exp:renderer.toneMappingExposure,shadowMap:renderer.shadowMap.enabled,sunCast:moonL.castShadow,map:sh.mapSize.x,ext:sh.camera.right,sunEl:+(Math.asin(moonL.position.clone().sub(moonL.target.position).normalize().y)*57.3).toFixed(1),
 hemi:hemi.intensity,env:scene.environmentIntensity,plastic:GFX.n,carCast:!!(pl&&(()=>{let c=0;pl.mesh.traverse(o=>{if(o.isMesh&&o.castShadow)c++});return c})())}}};
