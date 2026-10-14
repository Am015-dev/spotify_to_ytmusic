// ===== XF: LEGO 2K-style AUTOMATIC VEHICLE TRANSFORMATION (xform-1, 2026-10-14). Alex: "I see no automatic car transformation when switching terrains."
// Already there: FL_veh (85) swaps the ride form by surface, garage loadout = street ride + off-road form + boat form (GAR_frm('off'|'boat')), vehMode/CR_vis
// show the form with a brick burst + label + sound. Why nothing showed on land: R1 mapped grass/dirt to the street car. XF: grass/dirt/sand → off-road form,
// water → boat, road/deck → street car, 0.3 s on the new surface before a swap (+ a 1–2 m band at the road edge: no kerb flicker), surface state reset on
// warp/respawn (a warp kept the old form ~1 s). Flag XF.on; ?xf=0 = old behaviour for one visit. Tests: checklist xf1/* (📍 GO + auto), window.__xf.
const _xq=new THREE.Quaternion(),_xy=new THREE.Vector3(0,1,0);
const XF={pop:.3,t:9,spin:1,hk:-1,on:!/[?&]xf=0\b/.test(location.search),hold:.3,mIn:1,mOut:2,n:0};
if(XF.on){
 FL_VEH.dirt='offroad';
 // raw surface: on the road while within w/2+mIn; leaving needs w/2+mOut (1 m band), so a kerb run never flips it
 FL_raw=function(T0,ground){if(T0.deck)return'road';if(ground<-1.5)return'water';const m=FL.s==='road'?XF.mOut:XF.mIn;return FL_road(RO.x,RO.z,m)?'road':'dirt'};
 FL_terr=function(T0,ground,dt=1/60){const raw=FL_raw(T0,ground),air=RO.y>ground+.5;FL.lastSurf=raw;FL.hold=Math.max(0,FL.hold-dt);
  if(FL.s==null){FL.s=raw;FL.cand=raw}
  if(!air&&raw!==FL.s){if(raw!==FL.cand){FL.cand=raw;FL.cT=0}FL.cT+=dt;if(FL.cT>=XF.hold&&FL.hold<=0){FL.s=raw;FL.hold=FL_MINHOLD;FL.cT=0;XF.n++}}else if(!air){FL.cand=FL.s;FL.cT=0}
  return raw};
 // warp / respawn: the next step re-seeds the surface and the form at once (no burst for the jump itself)
 roamWarp=(f=>function(){const r=f.apply(this,arguments);FL.s=null;FL.cand=null;FL.cT=0;FL.hold=0;FL.v=null;XF.t=9;return r})(roamWarp);
 // the transform (2K: the ride bursts into bricks and snaps into the new form in a blink): 0.3 s squash → overshoot pop with one quick spin,
 // a ring of team-colour bricks + the build sound. Applied only while drawing (render wrapper, restored after), so physics, the ground fit and the camera fit never see it.
 FL_burst=(f=>function(v){f.apply(this,arguments);XF.t=0;XF.to=v;try{const at=pl.mesh.position.clone();at.y+=.8;CR_noGlow=1;
  try{for(let i=0;i<3;i++)debris(at,V3(Math.sin(RO.h+i*2.1)*5,4,Math.cos(RO.h+i*2.1)*5),6,['#e8302a','#2a7ad8','#ffd12c','#3aa04a','#ffffff'].map(c=>new THREE.Color(c)),.4,RO.y)}finally{CR_noGlow=0}AU.sfx('brick')}catch(e){}})(FL_burst);
 roamPose=(f=>function(s,dt){f(s,dt);if(s===pl&&XF.t<XF.pop)XF.t+=dt})(roamPose);
 {const r0=composer.render.bind(composer);composer.render=function(){const m=XF.t<XF.pop&&pl&&pl.mesh&&pl.mesh.userData.m;if(!m)return r0.apply(this,arguments);
  const k=Math.min(1,XF.t/XF.pop),sq=k<.3?1-.3*(k/.3):.7+.3*easeBack((k-.3)/.7),w=1+(1-sq)*.5,S0=m.scale.clone(),Q0=m.quaternion.clone();
  m.scale.set(S0.x*w,S0.y*sq,S0.z*w);if(XF.spin)m.quaternion.premultiply(_xq.setFromAxisAngle(_xy,(1-k)*(1-k)*Math.PI*2));m.updateMatrixWorld(true);
  try{return r0.apply(this,arguments)}finally{m.scale.copy(S0);m.quaternion.copy(Q0);m.updateMatrixWorld(true)}}}
}
// ---- tests (checklist xf1/*): spawn ONLY the requirement, then drive with the keyboard state (K, what keydown sets) and measure
// hold a heading with the arrow keys, like a player (an assist pulls the car along the road edge)
function XF_keep(h){const d=angDiff(h,RO.h);K.ArrowLeft=K.ArrowRight=false;if(Math.abs(d)>.02)K[(d>0)===(XF.hk>0)?'ArrowRight':'ArrowLeft']=true}
function XF_drive(sec,each,done){const c0=FL.clk;let t=0;K.ArrowUp=K.KeyW=true;const iv=setInterval(()=>{t=FL.clk-c0;/* sim seconds */let stop=false;try{stop=each(t)}catch(e){stop=true}
 if(stop||t>=sec||state!=='roam'){clearInterval(iv);K.ArrowUp=K.KeyW=K.ArrowLeft=K.ArrowRight=false;done(t)}},50)}
// road → grass: a road point at a park edge, heading into the park, 70 m of clear grass ahead
function XF_grassSpot(all){const out=[];for(const R of PARKS){const cx=(R.x0+R.x1)/2,cz=(R.z0+R.z1)/2;for(let a=0;a<24;a++){const ang=a/24*6.283,dx=Math.sin(ang),dz=Math.cos(ang);let e=null;
  for(let d=10;d<500;d+=2){const x=cx+dx*d,z=cz+dz*d;if(FL_road(x,z,0)){e=d;break}}if(e==null)continue;
  const sx=cx+dx*(e+30),sz=cz+dz*(e+30);if(e<70||!FL_road(sx,sz,0)||roamHit(sx,sz,3))continue;let ok=true;
  for(let r=e+30;r>=e-66&&ok;r-=3){const x=cx+dx*r,z=cz+dz*r;if(roamHit(x,z,3)||inRiver(x,z,-3))ok=false;if(r<e-XF.mOut-4&&FL_road(x,z,XF.mOut))ok=false}
  if(ok){const S={x:sx,z:sz,h:Math.atan2(-dx,-dz),park:R.name};if(!all)return S;out.push(S)}}}return all?out:null}
// kerb: D = metres past the asphalt edge (street, fill road or Autobahn); the car weaves along a park-edge road at D = 0.3 ± 0.6 m (wheels on and off the kerb)
function XF_D(x,z){let d=1e9;const q=cityAt(x,z);if(q)d=Math.min(d,q.d-q.road.w/2);const f=fillAt(x,z);if(f)d=Math.min(d,f.d-(f.r.w||12)/2);const a=abAt(x,z);if(a)d=Math.min(d,Math.abs(a.lat)-a.road.w/2);return d}
function XF_kerbH(x,z,h,D0=1.5){const e=.5,gx=(XF_D(x+e,z)-XF_D(x-e,z))/(2*e),gz=(XF_D(x,z+e)-XF_D(x,z-e))/(2*e),g=Math.hypot(gx,gz)||1;let tx=-gz/g,tz=gx/g;if(tx*Math.sin(h)+tz*Math.cos(h)<0){tx=-tx;tz=-tz}
 const c=clamp((XF_D(x,z)-D0)*.35,-.6,.6);return Math.atan2(tx-gx/g*c,tz-gz/g*c)}
function XF_kerbSpot(){for(const S of XF_grassSpot(1)){const dx=Math.sin(S.h),dz=Math.cos(S.h);for(let u=0;u<60;u+=.5){let x=S.x+dx*u,z=S.z+dz*u;if(XF_D(x,z)<.3)continue;
  for(const sg of[1.2,-1.2]){const h0=XF_kerbH(x,z,S.h+sg,.3);let h=h0,px=x,pz=z,ok=true,turn=0;for(let m=0;m<70&&ok;m++){const h2=XF_kerbH(px,pz,h,.3);turn+=Math.abs(angDiff(h2,h));h=h2;px+=Math.sin(h)*2;pz+=Math.cos(h)*2;
    const D=XF_D(px,pz);if(D<-1||D>1.6||roamHit(px,pz,2.5)||inRiver(px,pz,-3))ok=false}if(ok&&turn<.8)return{x,z,h:h0,park:S.park}}break}}return null}

// measurements: tyre gap of the visible form (wheel bottoms vs the ground under each wheel), boat draft (water surface − lowest hull point)
const _xv=new THREE.Vector3(),_xs=new THREE.Vector3(),_xb=new THREE.Box3();
function XF_vis(o,top){for(let a=o;a&&a!==top;a=a.parent)if(!a.visible)return false;return true}
function XF_gap(){const ud=pl.mesh.userData,top=pl.mesh;top.updateMatrixWorld(true);const G=[],H=[];
 top.traverse(o=>{if(!o.isMesh||!o.userData.r||!XF_vis(o,top))return;o.getWorldPosition(_xv);o.getWorldScale(_xs);const g=groundAt(_xv.x,_xv.z,_xv.y+1);G.push(_xv.y-o.userData.r*_xs.y-g);H.push(g)});
 if(!G.length)return null;return{n:G.length,min:Math.min(...G),max:Math.max(...G),slope:Math.max(...H)-Math.min(...H)}}
function XF_draft(){const top=pl.mesh;top.updateMatrixWorld(true);let lo=1e9;top.traverse(o=>{if(!o.isMesh||!XF_vis(o,top)||o.userData.a8s)return;const P=o.geometry&&o.geometry.attributes.position;if(!P)return;
  if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();_xb.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld);if(_xb.min.y<lo&&_xb.max.y-_xb.min.y<6)lo=_xb.min.y});
 const water=RO.y+waveH(RO.x,RO.z,T)*Math.min(1,pl.boatK||0);return water-lo}
// the slipway nearest the car: bank point + direction into the water
function XF_slip(){let b=null,bd=1e18;for(const S of SLIPS){const d=(S.x-RO.x)**2+(S.z-RO.z)**2;if(d<bd&&!roamHit(S.x-S.ix*25,S.z-S.iz*25,3)){bd=d;b=S}}return b}
const XF_GOS={
 grass:{n:'park edge',fn:say=>{const S=XF_grassSpot();if(!S)return'📍 XF · no park edge found ❌';roamWarp(S.x,S.z,S.h);RO.h=RO.vh=S.h;RO.v=0;let tIn=null,vIn=0,tSw=null,vSw=0,vAfter=0;
  XF_drive(9,t=>{XF_keep(S.h);const raw=FL.lastSurf;if(tIn==null&&!FL_road(RO.x,RO.z,0)){tIn=t;vIn=Math.abs(RO.v)}if(tSw==null&&RO.veh==='offroad'){tSw=t;vSw=Math.abs(RO.v)}if(tSw!=null&&t>tSw+.6){vAfter=Math.abs(RO.v);return true}},()=>{
   const dt=tSw!=null&&tIn!=null?tSw-tIn:null,gp=XF_gap(),ok=dt!=null&&dt<=.5&&vAfter>=.9*vSw&&pl.vmode==='4x4'&&gp&&gp.min>=-.05&&gp.min<=.05;window.__xf.res.grass={park:S.park,dt,vIn,vSw,vAfter,form:pl.vmode,gap:gp};
   say(`📍 ROAD → GRASS (${S.park}) · off-road ${dt==null?'never':'after '+dt.toFixed(2)+' s on grass'} at ${Math.round(vSw*3.6)} km/h → ${Math.round(vAfter*3.6)} km/h · form ${pl.vmode} · tyre gap ${gp?gp.min.toFixed(2)+' m (no tyre sinks; on a '+gp.slope.toFixed(2)+' m ground step the far tyre floats '+gp.max.toFixed(2)+')':'n/a'} ${ok?'✅':'❌'}`)});return'📍 ROAD → GRASS · driving into '+S.park+'…'}},
 water:{n:'slipway',fn:say=>{const S=XF_slip();if(!S)return'📍 XF · no slipway ❌';const h=Math.atan2(S.ix,S.iz);roamWarp(S.x-S.ix*25,S.z-S.iz*25,h);RO.h=RO.vh=h;RO.v=0;let tIn=null,tSw=null,vSw=0,vA=0,dr=null;
  XF_drive(12,t=>{XF_keep(h);if(tIn==null&&FL.lastSurf==='water')tIn=t;if(tSw==null&&RO.veh==='boat'){tSw=t;vSw=Math.abs(RO.v)}if(tSw!=null&&vA===0&&t>tSw+.3)vA=Math.abs(RO.v);if(tSw!=null&&t>tSw+1.5){dr=XF_draft();return true}},()=>{
   const dt=tSw!=null&&tIn!=null?tSw-tIn:null,ok=dt!=null&&dt<=.5&&pl.vmode==='boat'&&dr!=null&&Math.abs(dr-W8B.sink)<=.1&&vA>=.9*vSw;window.__xf.res.water={dt,vSw,vA,draft:dr,form:pl.vmode};
   say(`📍 SLIPWAY → RIVER · boat ${dt==null?'never':'after '+dt.toFixed(2)+' s on water'} at ${Math.round(vSw*3.6)} → ${Math.round(vA*3.6)} km/h · hull ${dr==null?'?':dr.toFixed(2)} m under the water line (target ${W8B.sink}±0.1) ${ok?'✅':'❌'}`)});return'📍 SLIPWAY → RIVER · driving into the water…'}},
 land:{n:'slipway (from the water)',fn:say=>{const S=XF_slip();if(!S)return'📍 XF · no slipway ❌';const h=Math.atan2(-S.ix,-S.iz);roamWarp(S.x+S.ix*30,S.z+S.iz*30,h);RO.h=RO.vh=h;RO.v=0;let tOut=null,tSw=null,form=null,surf=null,gp=null,vSw=0,vA=0;
  XF_drive(12,t=>{XF_keep(h);if(t<.5&&RO.veh!=='boat')return false;if(tOut==null&&t>.5&&FL.lastSurf!=='water')tOut=t;if(tSw==null&&tOut!=null&&RO.veh!=='boat'){tSw=t;vSw=Math.abs(RO.v)}if(tSw!=null&&vA===0&&t>tSw+.3)vA=Math.abs(RO.v);
   if(tSw!=null&&t>tSw+2.5){form=pl.vmode;surf=FL.s;gp=XF_gap();return true}},()=>{const dt=tSw!=null&&tOut!=null?tSw-tOut:null,want=surf==='road'?'car':'4x4',
   ok=dt!=null&&dt<=.5&&form===want&&gp&&gp.min>=-.05&&gp.min<=.05&&vA>=.9*vSw;window.__xf.res.land={dt,form,surf,gap:gp,vSw,vA};
   say(`📍 RIVER → LAND · ${dt==null?'still a boat':'left the boat '+dt.toFixed(2)+' s after the shore'} → ${form} on ${surf} at ${Math.round(vSw*3.6)} → ${Math.round(vA*3.6)} km/h · tyre gap ${gp?gp.min.toFixed(2)+' m (no tyre sinks; on a '+gp.slope.toFixed(2)+' m ground step the far tyre floats '+gp.max.toFixed(2)+')':'n/a'} ${ok?'✅':'❌'}`)});return'📍 RIVER → LAND · driving up the slipway…'}},
 kerb:{n:'kerb run',fn:say=>{const S=XF_kerbSpot();if(!S)return'📍 XF · no park-edge kerb found ❌';roamWarp(S.x,S.z,S.h);RO.h=RO.vh=S.h;RO.v=0;FL_terr(roamTerr(RO.x,RO.z,RO.y+.3),groundY(RO.x,RO.z));const sw0=XF.n;let flips=0,last=null,minD=1e9,maxD=-1e9;
  XF_drive(10,t=>{const raw=FL.lastSurf;if(last!=null&&raw!==last)flips++;last=raw;const D=XF_D(RO.x,RO.z);if(t>1){minD=Math.min(minD,D);maxD=Math.max(maxD,D)}
   XF_keep(XF_kerbH(RO.x,RO.z,RO.h,.3+.6*Math.sin(t*2.5)));K.ArrowUp=K.KeyW=Math.abs(RO.v)<12},()=>{
   const n=XF.n-sw0,ok=n===0&&maxD>0&&minD<0;window.__xf.res.kerb={swaps:n,flips,minD,maxD,form:FL.v,park:S.park};
   say(`📍 KERB RUN 10 s (${S.park}) · ${n} swaps (form ${FL.v}), wheels ${minD.toFixed(1)}…${maxD.toFixed(1)} m past the asphalt ${ok?'✅':'❌'}`)});return'📍 KERB RUN · driving 10 s along the road edge…'}}};
window.__xf={XF,GOS:XF_GOS,res:{},surf:()=>({raw:FL.lastSurf,s:FL.s,v:FL.v,veh:RO.veh,vmode:pl&&pl.vmode,n:XF.n}),grass:XF_grassSpot,gap:()=>XF_gap(),draft:()=>XF_draft(),kerb:XF_kerbSpot,D:XF_D};
