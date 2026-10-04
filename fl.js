// ===== FL (feel): automatic vehicle switch by surface, smash-to-boost with combo, free-roam day/night cycle
// ---------- 1 · surface → vehicle (2K-Drive style auto switch, hysteresis, never mid-air, manual button = override)
const FL={clk:0,s:null,cand:null,cT:0,hold:0,log:[],t:null,acc:0,applied:null,mats:new Map(),scanT:0,chain:0,chainT:0,gain:[],hl:null,saveT:0,lastSurf:null};
const FL_HOLD=.35,FL_MINHOLD=.8;
function FL_road(x,z,m){const q=cityAt(x,z);if(q&&q.d<q.road.w/2+m)return true;const f=fillAt(x,z);if(f&&f.d<(f.r.w||12)/2+m)return true;
  const a=abAt(x,z);if(a&&Math.abs(a.lat)<a.road.w/2+m*.5)return true;if(PLAZAS.some(R=>inR(R,x,z,0)))return true;return false}
// raw surface under the car: deck/street = road, low ground = water, everything else (parks, grass, dirt lots, fields) = dirt
function FL_raw(T0,ground){if(T0.deck)return'road';if(ground<-1.5)return'water';const m=FL.s==='road'?6:2.5;return FL_road(RO.x,RO.z,m)?'road':'dirt'}
function FL_terr(T0,ground,dt=1/60){const raw=FL_raw(T0,ground),air=RO.y>ground+.5;FL.lastSurf=raw;FL.hold=Math.max(0,FL.hold-dt);
  if(FL.s==null){FL.s=raw;FL.cand=raw}
  if(!air&&raw!==FL.s){if(raw!==FL.cand){FL.cand=raw;FL.cT=0}FL.cT+=dt;if(FL.cT>=FL_HOLD&&FL.hold<=0){FL.s=raw;FL.hold=FL_MINHOLD;FL.cT=0}}else if(!air){FL.cand=FL.s;FL.cT=0}
  return raw}
const FL_VEH={road:'ship',dirt:'offroad',water:'boat'};
function FL_veh(){const v=(RO.vsel||'auto')==='auto'?FL_VEH[FL.s||'road']:RO.vsel;if(v!==FL.v&&!(pl&&pl.air)){if(FL.v){FL.log.push({v,s:FL.s,x:Math.round(RO.x),z:Math.round(RO.z)});if(FL.log.length>60)FL.log.shift();FL_burst(v)}FL.v=v}return FL.v||v}
function FL_burst(v){if(!pl||!RO.on)return;const at=pl.mesh.position.clone();at.y+=1.2;
  debris(at,V3(0,9,0),16,['#e8302a','#2a7ad8','#ffd12c','#3aa04a','#ffffff'].map(c=>new THREE.Color(c)),.7,RO.y);burst(SPARK,at,18,14,.35,new THREE.Color(2.2,2,1.4));AU.sfx('boost');fovKick=Math.max(fovKick,4)}
// ---------- 2 · smashing fills boost (size-scaled, chain combo), goon takedowns refill, slower passive recharge
const FL_RECH=4.5,FL_CHAIN=1.6;
const FL_mult=n=>Math.min(3,1+.25*Math.max(0,n-1));
function FL_add(b,label){if(!pl)return 0;const b0=pl.bm;pl.bm=Math.min(100,pl.bm+b);const g=pl.bm-b0;FL.gain.push(+b.toFixed(2));if(FL.gain.length>40)FL.gain.shift();FL_pop(label||`+${Math.round(b)} BOOST`);return g}
function FL_smash(def){const now=FL.clk;FL.chain=now-FL.chainT<FL_CHAIN?FL.chain+1:1;FL.chainT=now;const base=2+(def.st||1),m=FL_mult(FL.chain);FL_add(base*m,`+${Math.round(base*m)} BOOST${m>1?' ×'+m:''}`)}
function FL_pop(t){let el=document.getElementById('flPop');const bar=document.getElementById('rgBar');if(!bar)return;
  if(!el){el=document.createElement('div');el.id='flPop';document.getElementById('roamGauge').appendChild(el);const st=document.createElement('style');
    st.textContent='#roamGauge{position:relative}#flPop{position:absolute;right:0;top:-18px;font:900 12px system-ui;color:#ffd12c;text-shadow:0 0 6px #000,0 0 10px #ff9a00;pointer-events:none;opacity:0;white-space:nowrap}#flPop.on{animation:flPop .7s ease-out}@keyframes flPop{0%{opacity:1;transform:translateY(6px) scale(1.25)}70%{opacity:1}100%{opacity:0;transform:translateY(-10px)}}#rgBar.flF{animation:flF .35s}@keyframes flF{0%{filter:brightness(2.6);box-shadow:0 0 14px #ffd12c}100%{filter:none}}';document.head.appendChild(st)}
  el.textContent=t;el.classList.remove('on');void el.offsetWidth;el.classList.add('on');bar.classList.remove('flF');void bar.offsetWidth;bar.classList.add('flF')}
{const _td=M1_takedown;M1_takedown=function(g){const r=_td.apply(this,arguments);if(RO.on&&pl)FL_add(45,'TAKEDOWN +45 BOOST');return r}}
// ---------- 3 · day/night cycle in free roam (24 real minutes per day; lerped moods, emissive windows/lamps/headlights, no extra lights)
const FL_DAY=24*60;if(!SET.tod)SET.tod="cycle";
function FL_mode(){return SET.tod||'cycle'}
function FL_keys(){if(FL.K&&FL.K.cid===CID)return FL.K;const f=id=>MOODS.find(m=>m.id===id)||ATHM.find(m=>m.id===id);const day=f(CCF.mood)||f('brick'),ngt=f('night');
  const night={...ngt,id:'flnight',wet:.2,top:[.012,.016,.05],mid:[.04,.05,.13],hor:[.2,.13,.22],gnd:[.04,.035,.05],fog:'#202238',hemi:['#8a90c8','#3a2c26',1.05],key:['#c8d4ff',.7,[-400,600,-300]],exp:1.12,bloom:[.75,.55],win:1,rain:[0,0,0,0],road:[.42,.3,1],env:.85,lamps:1,star:1,moon:1,band:.6,cloud:0,lightning:false};
  const dawn={...f('dawn'),rain:[0,0,0,0],wet:.1,hemi:['#d8b0c8','#4a3038',1.15],key:['#ffb070',1.7,[700,170,-900]]};
  const dusk={...f('athdusk'),hemi:['#d0a4bc','#3e2c30',1.05],key:['#ffa070',1.4,[-700,170,-500]]};
  const gold={...(CID==='ath'?f('athgold'):f('golden')),key:[CID==='ath'?'#ffcf90':'#ffe2c0',2.4,[-600,430,-300]]};
  // key-light direction is fixed across the cycle: shadow frustum (and its draw calls) stays identical day and night
  for(const m of[night,dawn,dusk,gold])m.key=[m.key[0],m.key[1],day.key[2]];const K=[[0,night],[.2,night],[.25,dawn],[.31,day],[.66,day],[.73,gold],[.79,dusk],[.85,night],[1,night]];K.cid=CID;return FL.K=K}
const FL_c1=new THREE.Color(),FL_c2=new THREE.Color();
function FL_mix(a,b,k){const o={...(k<.5?a:b)};for(const key in a){const x=a[key],y=b[key];if(y===undefined)continue;
    if(typeof x==='number'&&typeof y==='number')o[key]=x+(y-x)*k;
    else if(typeof x==='string'&&x[0]==='#'&&typeof y==='string')o[key]='#'+FL_c1.set(x).lerp(FL_c2.set(y),k).getHexString();
    else if(Array.isArray(x)&&Array.isArray(y))o[key]=x.map((v,i)=>typeof v==='number'?v+(y[i]-v)*k:typeof v==='string'&&v[0]==='#'?'#'+FL_c1.set(v).lerp(FL_c2.set(y[i]),k).getHexString():Array.isArray(v)?v.map((w,j)=>w+(y[i][j]-w)*k):(k<.5?v:y[i]))}
  o.lightning=false;o.rain=[0,0,0,0];return o}
function FL_at(t){const K=FL_keys();let i=0;while(i<K.length-2&&t>=K[i+1][0])i++;const[a0,A]=K[i],[a1,B]=K[i+1],k=a1>a0?Math.min(1,Math.max(0,(t-a0)/(a1-a0))):0,s=k*k*(3-2*k);return FL_mix(A,B,s)}
// night factor 0 (day) … 1 (night): drives windows, lamps, headlights
function FL_night(t){const K=FL_keys(),m=FL_at(t);return Math.min(1,Math.max(0,m.lamps??0))}
function FL_time(){if(FL.t==null){const v=store.get('mho_fl_tod',null);FL.t=typeof v==='number'&&v>=0&&v<1?v:.42}const m=FL_mode();return m==='day'?.45:m==='night'?.02:FL.t}
function FL_clock(t){const h=Math.floor(t*24),mi=Math.floor((t*24-h)*60);return String(h).padStart(2,'0')+':'+String(mi).padStart(2,'0')}
function FL_apply(t,force){const m=FL_at(t);m.id=t<.22||t>=.82?'night':t<.28?'dawn':t>=.69?'golden':CCF.mood;
  const U=SKYU;U.uTop.value.set(...m.top);U.uMid.value.set(...m.mid);U.uHor.value.set(...m.hor);U.uGround.value.set(...m.gnd);U.uSun.value.set(...m.sun);U.uStar.value=m.star;U.uBand.value=m.band;U.uMoon.value=m.moon;U.uCloud.value=m.cloud;
  scene.fog.color.set(m.fog);hemi.color.set(m.hemi[0]);hemi.groundColor.set(m.hemi[1]);hemi.intensity=m.hemi[2];moonL.color.set(m.key[0]);moonL.intensity=m.key[1];if(!RO.shadowOn)moonL.position.set(...m.key[2]);
  renderer.toneMappingExposure=m.exp;bloom.strength=m.bloom[0];bloom.radius=m.bloom[1];scene.environmentIntensity=m.env;
  const idCh=!MOOD||MOOD.id!==m.id;MOOD=m;applyMoodMaterials();if(idCh)ENVD=true;
  const n=Math.min(1,Math.max(0,m.lamps));FL.n=n;FL_emis(n,force);if(cloudsOn&&typeof CLOUDS!=='undefined'&&CLOUDS)CLOUDS.visible=n<.6}
// window/lamp emissives: scan hub materials once in a while (the city streams in lazily), scale from their base
function FL_emis(n,force){if(!HUB.grp)return;FL.scanT-=1;if(FL.scanT<=0||force){FL.scanT=40;HUB.grp.traverse(o=>{if(!o.isMesh)return;const ms=Array.isArray(o.material)?o.material:[o.material];for(const mt of ms)if(mt&&mt.emissiveMap&&!FL.mats.has(mt)&&mt.emissive&&mt.emissive.r>.5)FL.mats.set(mt,mt.emissiveIntensity)})}
  const k=.55+2.1*n;for(const[mt,b]of FL.mats){const v=b*k;if(Math.abs(mt.emissiveIntensity-v)>1e-3)mt.emissiveIntensity=v}
  const g=HUB.lampGlow;if(g){if(!FL.lc)FL.lc=g.color.clone();g.color.setRGB(.55,.52,.45).lerp(FL.lc,n)}
  FL_headlights(n)}
// headlights: one instanced additive mesh for all traffic + the player (always drawn, black by day → same draw calls day and night)
const FL_hm=new THREE.Matrix4(),FL_hq=new THREE.Quaternion(),FL_hv=new THREE.Vector3(),FL_hs=new THREE.Vector3(),FL_hy=new THREE.Vector3(0,1,0);
function FL_headlights(n){if(!HUB.grp||!HUB.cars)return;let H=FL.hl;const N=HUB.cars.length+1;
  if(!H||H.parent!==HUB.grp||H.count<N){if(H&&H.parent)H.parent.remove(H);
    const L=[cbox(.42,.26,.12,-.72,.85,2.25,'#fff6d8'),cbox(.42,.26,.12,.72,.85,2.25,'#fff6d8'),cbox(.36,.2,.1,-.74,.9,-2.25,'#ff2a20'),cbox(.36,.2,.1,.74,.9,-2.25,'#ff2a20')];
    const beam=new THREE.PlaneGeometry(3.4,11).rotateX(-Math.PI/2).translate(0,.12,8);const bc=new Float32Array(beam.attributes.position.count*3);for(let i=0;i<beam.attributes.position.count;i++){const zz=beam.attributes.position.getZ(i),k=zz<5?.32:.04;bc.set([k,k*.92,k*.75],i*3)}beam.setAttribute('color',new THREE.BufferAttribute(bc,3));L.push(beam);
    const mat=new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false,color:0x000000,fog:true});
    H=FL.hl=new THREE.InstancedMesh(mergeG(L),mat,N+8);H.frustumCulled=false;H.renderOrder=2;HUB.grp.add(H);H.userData.keep=1}
  H.material.color.setScalar(2.4*n);let j=0;
  if(pl&&RO.on){FL_hq.setFromAxisAngle(FL_hy,RO.h);FL_hm.compose(FL_hv.set(RO.x,RO.y,RO.z),FL_hq,FL_hs.set(1.2,1.2,1.25));H.setMatrixAt(j++,FL_hm)}
  for(const c of HUB.cars){if(c.dead>0)continue;const im=HUB.cim[c.k];if(!im)continue;im.getMatrixAt(c.j,FL_hm);H.setMatrixAt(j++,FL_hm)}
  H.count=j;H.instanceMatrix.needsUpdate=true}
function FL_step(dt){if(!RO.on||state!=='roam')return;FL.clk+=dt;const mode=FL_mode();FL_time();
  if(mode==='cycle'&&!RO.frozen){FL.t=(FL.t+dt/FL_DAY)%1;FL.saveT+=dt;if(FL.saveT>3){FL.saveT=0;store.set('mho_fl_tod',+FL.t.toFixed(5))}}
  FL.acc+=dt;const t=FL_time();if(FL.acc>=.1||FL.applied==null||FL.am!==mode){FL.acc=0;FL_apply(t,FL.am!==mode);FL.applied=t;FL.am=mode}
  else if(FL.hl&&FL.n>0)FL_headlights(FL.n)}
{const _rs=roamStep;roamStep=function(dt){_rs(dt);try{FL_step(dt)}catch(e){if(!FL.err){FL.err=1;console.warn('FL',e)}}}}
{const _he=hubEnter;hubEnter=function(){const r=_he.apply(this,arguments);FL.applied=null;FL.am=null;return r}}
window.__fl={FL,surf:()=>({raw:FL.lastSurf,s:FL.s,v:FL.v,veh:RO.veh,terr:RO.terr}),log:()=>FL.log.slice(),clr:()=>{FL.log.length=0;FL.gain.length=0},
  road:(x,z,m)=>FL_road(x,z,m??2.5),setT:t=>{FL.t=((t%1)+1)%1;FL.applied=null;FL.acc=1;store.set('mho_fl_tod',FL.t)},t:()=>FL_time(),clock:()=>FL_clock(FL_time()),night:()=>FL.n,apply:()=>{FL_apply(FL_time(),true);FL.applied=FL_time();FL.am=FL_mode()},
  mode:m=>{if(m){SET.tod=m;saveSet();FL.am=null}return FL_mode()},mult:FL_mult,base:def=>2+(def.st||1),RECH:FL_RECH,gainLog:()=>FL.gain.slice(),geo:()=>({parks:PARKS.map(R=>[R.name,Math.round(R.x0),Math.round(R.x1),Math.round(R.z0),Math.round(R.z1)]),riv:WATERS.map(S=>S.pts.filter((p,i)=>i%8==0).map(p=>[Math.round(p.x),Math.round(p.z),Math.round(p.hw)]))}),takedown:g=>M1_takedown(g)};
