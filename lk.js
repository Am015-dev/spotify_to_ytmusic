/* ============================================================ LK · looks + phone performance
   lighting (warm low sun, cool sky fill, sky sun follows the key light, horizon haze, fog = horizon colour),
   materials (world-space colour variation + plastic sheen on every MeshStandardMaterial via one prototype hook: no new programs per material),
   water (sun glints), car paint, FX (boost flames, hotter drift sparks, wreck smoke), HUD polish (CSS only, no layout changes),
   auto quality (frame-time ladder high→med→low→min on top of the dynamic resolution), distance culling + fog/far per level. */
const LK={drop:0,userQ:null,effQ:null,acc:{t:0,n:0,sum:0,sq:0},last:0,since:0,log:[],plM:null,
  U:{uLkOn:{value:1},uLkSheen:{value:new THREE.Color(0,0,0)},uLkSunV:{value:new THREE.Vector3(0,1,0)},uLkT:{value:0}}};
const LK_LV=['high','med','low','min'];
// ---- 1 · day moods: warm, slightly lower sun (46° instead of 54°: longer shadows), cool sky fill + warm ground bounce, warm horizon, slightly lower exposure (no white-out)
(function(){const day={brick:{key:['#ffe1b8',3.2,[560,680,340]],hemi:['#c4d8ff','#8c7450',1.2],hor:[1.0,.88,.74],mid:[.36,.6,.98],sun:[2.8,2.15,1.4],exp:.97,env:1.05},
  athens:{key:['#ffdcaa',3.3,[540,660,-320]],hemi:['#d2e0ff','#9a8058',1.2],hor:[1.02,.86,.66],sun:[3,2.3,1.4],exp:.96,env:1.05},
  athnoon:{key:['#fff1dc',3.3,[260,980,180]],hemi:['#dce8ff','#a49272',1.35],exp:.97},
  day:{key:['#ffe6c2',3,[560,680,340]],hemi:['#c8dbff','#8a7652',1.2],exp:.98}};
 for(const L of [MOODS,typeof ATHM!=='undefined'?ATHM:[]])for(const m of L){const d=day[m.id];if(d)Object.assign(m,d,{lk:1})}})();
// sky: the sun glow follows the key light, plus a soft warm horizon haze on the sun side
function LK_sky(mat){if(!mat||mat.userData.lk)return;mat.userData.lk=1;mat.fragmentShader=mat.fragmentShader.replace('uniform vec3 uTop','uniform vec3 uSunD;uniform vec3 uTop')
  .replace('vec3 sn=normalize(vec3(.6,.06,-.8));','vec3 sn=normalize(uSunD);')
  .replace('c+=vec3(.45,.5,.8)*uLit','{float hz=exp(-max(h,0.)*11.);vec2 sh=normalize(sn.xz+1e-4),dh=normalize(d.xz+1e-4);c=mix(c,hor*1.04,hz*.4);c+=uSun*.05*hz*pow(max(dot(sh,dh),0.),3.);}c+=vec3(.45,.5,.8)*uLit');mat.needsUpdate=true}
SKYU.uSunD={value:new THREE.Vector3(.6,.06,-.8)};LK_sky(skyMat);ENVSC.traverse(o=>{if(o.material&&o.material.uniforms===SKYU)LK_sky(o.material)});
{const _am=applyMood;applyMood=id=>{_am(id);const m=MOOD,k=m.key[2];if(m.sun[0]+m.sun[1]>.5)SKYU.uSunD.value.set(k[0],Math.max(k[1]*.35,40),k[2]).normalize();else SKYU.uSunD.value.set(.6,.06,-.8);
  if(m.lk){const h=m.hor;FOGC.setRGB(h[0]*.92,h[1]*.92,h[2]*.94);scene.fog.color.copy(FOGC)}
  const s=hemi.intensity*(m.sun[0]>.5?.07:.03);LK.U.uLkSheen.value.copy(hemi.color).multiplyScalar(s)}}
// ---- 2 · materials: one prototype hook for every MeshStandard/Physical material without its own onBeforeCompile
const LK_VS='varying vec3 vLkW;\n',LK_VP='\n{vec4 lkP=vec4(transformed,1.);\n#ifdef USE_INSTANCING\nlkP=instanceMatrix*lkP;\n#endif\nvLkW=(modelMatrix*lkP).xyz;}';
const LK_FS='uniform float uLkOn,uLkT;uniform vec3 uLkSheen,uLkSunV;varying vec3 vLkW;\nfloat lkH(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float lkN(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(lkH(i),lkH(i+vec2(1,0)),f.x),mix(lkH(i+vec2(0,1)),lkH(i+vec2(1,1)),f.x),f.y);}\n';
function LK_inject(sh,water){if(sh.fragmentShader.includes('uLkOn'))return;Object.assign(sh.uniforms,LK.U);
  sh.vertexShader=LK_VS+sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>'+LK_VP);
  let f=LK_FS+sh.fragmentShader;
  // macro patches (~30 m) + fine grain (~1.5 m): breaks up flat plastic colour without a texture fetch; albedo capped at .8 so white paving no longer blows out
  if(!water)f=f.replace('#include <color_fragment>','#include <color_fragment>\nif(uLkOn>.5){float m1=lkN(vLkW.xz*.033+vLkW.y*.012),m2=lkN(vLkW.xz*.68+vec2(vLkW.y*.68,-vLkW.y*.4));diffuseColor.rgb=min(diffuseColor.rgb*(1.+(m1-.5)*.13+(m2-.5)*.05),vec3(.8));}');
  // LEGO plastic sheen: a sky-coloured fresnel rim; water also gets sparkling sun glints (HDR, picked up by bloom)
  f=f.replace('#include <opaque_fragment>','if(uLkOn>.5){vec3 lkV=normalize(vViewPosition);float fr=pow(1.-clamp(dot(normal,lkV),0.,1.),4.);outgoingLight+=uLkSheen*fr'+(water?'*3.;vec3 hH=normalize(lkV+uLkSunV);float sp=pow(max(dot(normal,hH),0.),600.)*step(.55,lkN(vLkW.xz*1.7+uLkT*vec2(.9,.6)));outgoingLight+=vec3(3.2,2.8,2.2)*sp*max(uLkSunV.y+.2,0.)':'')+';}\n#include <opaque_fragment>');
  sh.fragmentShader=f}
THREE.MeshStandardMaterial.prototype.onBeforeCompile=function(sh){LK_inject(sh,false)};
{const _wm=waterMat;waterMat=(...a)=>{const m=_wm(...a),o=m.onBeforeCompile,k=m.customProgramCacheKey();m.onBeforeCompile=(sh,r)=>{o(sh,r);LK_inject(sh,true)};m.customProgramCacheKey=()=>k+'|lkw';return m}}
// ---- 3 · car paint: glossier, slightly metallic body colours on the player craft (re-run when the craft changes)
function LK_paint(){if(!pl||!pl.mesh||LK.plM===pl.mesh)return;LK.plM=pl.mesh;const hsl={};pl.mesh.traverse(o=>{if(!o.isMesh)return;for(const m of Array.isArray(o.material)?o.material:[o.material]){
  if(!m.isMeshStandardMaterial||m.userData.lkP||m.map||m.transparent||m.metalness>.6)continue;m.color.getHSL(hsl);if(hsl.s<.25||hsl.l<.12)continue;m.userData.lkP=1;m.roughness=Math.min(m.roughness,.34);m.envMapIntensity=Math.max(m.envMapIntensity??1,1.15)}})}
// ---- 4 · FX: hotter sparks (HDR, bloom), boost flames, dark smoke on wrecks. Fixed-size pools: no new draw calls
{const _em=emit;emit=(pool,p,v,life,c)=>{if(pool===SPARK&&c&&c.isColor&&fxK()>0){c=c.clone().multiplyScalar(1.35);if(GLOWP&&Math.random()<.25)_em(GLOWP,p,v.clone().multiplyScalar(.5),life*.7,new THREE.Color(2.4,1.3,.4))}return _em(pool,p,v,life,c)}}
{const _db=debris;debris=(at,vel,n,...r)=>{_db(at,vel,n,...r);if(n>=12&&fxK()>0&&typeof SMOKE!=='undefined'&&SMOKE)puff(at,4,new THREE.Color(.16,.15,.17),2.2,7,1.6,.5,1.5,5)}}
{const _ex=explode;explode=(s,...r)=>{const o=_ex(s,...r);try{if(fxK()>0&&s&&s.mesh){const at=s.mesh.position.clone();puff(at,6,new THREE.Color(.1,.09,.1),3,10,2.4,.55,2,6);fireball(at,4,4,.6)}}catch(e){}return o}}
const _lkF=new THREE.Vector3();function LK_boost(){if(state!=='roam'||!pl||!pl.nitro||!RO.on||fxK()===0||!FIREB)return;if((LK.bf=(LK.bf||0)+1)%2)return;const fx=Math.sin(RO.h),fz=Math.cos(RO.h);
  for(const sd of[-1,1])emitS(FIREB,_lkF.set(RO.x-fx*3.2+fz*sd*1.1,RO.y+.9,RO.z-fz*3.2-fx*sd*1.1),V3(-fx*14+rr(-1,1),rr(0,1.5),-fz*14+rr(-1,1)),rr(.12,.22),new THREE.Color(.6,1.4,3.2),.9,.25,.6,false)}
// ---- 5 · HUD polish (paint only: no sizes/positions change, so phone layouts are untouched)
{const st=document.createElement('style');st.id='lkHud';st.textContent=`#roamGauge b{text-shadow:0 2px 0 rgba(0,0,0,.35),0 0 14px rgba(90,200,255,.35)}
#rgBar,#rgHull{position:relative;box-shadow:inset 0 1px 2px rgba(0,0,0,.5)}#rgBar::after,#rgHull::after{content:'';position:absolute;inset:0;border-radius:inherit;background:linear-gradient(180deg,rgba(255,255,255,.38),rgba(255,255,255,0) 60%);pointer-events:none}
#roamGauge.on #rgBar{box-shadow:0 0 10px rgba(196,107,255,.8),inset 0 1px 2px rgba(0,0,0,.5)}#roamMini::after{content:'';position:absolute;inset:0;border-radius:50%;box-shadow:inset 0 0 16px rgba(0,0,0,.5),inset 0 0 0 1px rgba(255,255,255,.25);pointer-events:none}
#roamStuds{background:linear-gradient(180deg,#25a64a,#16772f)}#spdbar{box-shadow:inset 0 1px 2px rgba(0,0,0,.5)}`;document.head.appendChild(st)}
// ---- 6 · auto quality. Ladder high→med→low→min, never above the player's own Graphics choice; the player's choice is what gets saved
function LK_shadow(on){if(on&&!RO.shadowOn&&HUB.grp&&HUB.grp.visible){renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;moonL.castShadow=true;moonL.shadow.mapSize.set(2048,2048);const sc=moonL.shadow.camera;sc.left=-90;sc.right=90;sc.top=90;sc.bottom=-90;sc.near=50;sc.far=900;sc.updateProjectionMatrix();moonL.shadow.bias=-.0006;moonL.shadow.normalBias=.6;if(!moonL.target.parent)scene.add(moonL.target);RO.shadowOn=true;if(pl)pl.mesh.traverse(o=>{if(o.isMesh)o.castShadow=true})}
  if(!on&&RO.shadowOn){moonL.castShadow=false;RO.shadowOn=false;renderer.shadowMap.enabled=false}}
function LK_lvl(){return LK_LV[Math.min(3,LK_LV.indexOf(LK.userQ||SET.q)+LK.drop)]}
function LK_roamLook(){if(!HUB.grp||!HUB.grp.visible)return;const L=LK_lvl();scene.fog.density={high:.00042,med:.0006,low:.0008,min:.0011}[L];camera.far={high:3400,med:2600,low:2000,min:1500}[L];camera.updateProjectionMatrix();
  LK.U.uLkOn.value=L==='min'?0:1;LK_shadow(L==='high'&&SET.q==='high');if(RO.shadowOn){const sc=moonL.shadow.camera;if(sc.right!==90){sc.left=sc.bottom=-90;sc.right=sc.top=90;sc.updateProjectionMatrix()}}HUB.cpos=null}
function LK_apply(){const L=LK_lvl(),q=L==='min'?'low':L;LK.effQ=q;if(SET.q!==q){SET.q=q;_lkAQ()}LK_roamLook()}
const _lkAQ=applyQuality;applyQuality=(...a)=>{if(LK.effQ!==null&&SET.q!==LK.effQ){LK.userQ=SET.q;LK.drop=0}else if(LK.userQ===null)LK.userQ=SET.q;LK.effQ=SET.q;const r=_lkAQ(...a);LK_roamLook();return r};
{const _set=store.set;store.set=function(k,v){if(k==='mho_set'&&v&&LK.userQ&&LK.drop>0&&v.q===LK.effQ)v=Object.assign({},v,{q:LK.userQ});return _set.call(this,k,v)}}
{const _ht=hubTrafficStep;hubTrafficStep=dt=>{_ht(dt);LK_paint();LK_boost()}}
{const _he=hubEnter;hubEnter=(...a)=>{const r=_he(...a);LK_roamLook();LK_paint();return r}}
// extra distance culling on low/min (base: 2100/1600 m, small things 750 m)
{const _hc=hubCullStep;hubCullStep=()=>{const p=HUB.cpos;_hc();const L=LK_lvl();if(HUB.cpos!==p&&HUB.cull&&(L==='low'||L==='min')){const cx=camera.position.x,cz=camera.position.z,R2=L==='min'?1050:1350,Rs=L==='min'?420:520;for(const c of HUB.cull)if(c.o.visible&&Math.hypot(c.x-cx,c.z-cz)-c.r>(c.small?Rs:Math.min(R2,c.o.userData.cd||R2)))c.o.visible=false}}}
function LK_feed(ms){if(SET.lkAuto==='off'||paused||document.hidden||!(state==='roam'||state==='race'||state==='countdown')||ms>150||ms<=0){LK.acc={t:0,n:0,sum:0,sq:0};return}
  const A=LK.acc;A.t+=ms;A.n++;A.sum+=ms;A.sq+=ms*ms;LK.since+=ms;if(A.t<3000)return;const a=A.sum/A.n,sd=Math.sqrt(Math.max(0,A.sq/A.n-a*a));LK.acc={t:0,n:0,sum:0,sq:0};
  if(Math.abs(a-33.3)<3&&sd<4)return; // steady 30 fps = iOS low-power cap, not the GPU
  const resFloor=SET.dres!=='on'||DRES.s<=.65,top=LK_LV.indexOf(LK.userQ||SET.q);
  if(a>26&&resFloor&&top+LK.drop<3&&LK.since>4000){LK.drop++;LK.since=0;LK.log.push(['down',Math.round(a),LK_lvl()]);LK_apply()}
  else if(a<13.5&&LK.drop>0&&LK.since>12000){LK.drop--;LK.since=0;LK.log.push(['up',Math.round(a),LK_lvl()]);LK_apply()}}
{const _ds=dresStep;dresStep=ms=>{_ds(ms);LK_feed(ms);LK.U.uLkT.value=T;if(MOOD){const k=MOOD.key[2];LK.U.uLkSunV.value.set(k[0],k[1],k[2]).normalize().transformDirection(camera.matrixWorldInverse)}}}
window.__lk={LK,lvl:()=>LK_lvl(),feed:(ms,n)=>{for(let i=0;i<n;i++)LK_feed(ms)},apply:()=>LK_apply(),reset:()=>{LK.drop=0;LK.since=0;LK_apply()},save:()=>saveSet(),pools:()=>({fireb:FIREB?FIREB.list.length:0,smoke:SMOKE?SMOKE.list.length:0,spark:SPARK?SPARK.list.length:0,glow:GLOWP?GLOWP.list.length:0}),boom:()=>debris(V3(RO.x,RO.y+1,RO.z),V3(0,9,0),18,[new THREE.Color('#888')],1.1,RO.y)};
