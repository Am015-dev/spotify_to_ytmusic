// ===== XF: LEGO 2K-style AUTOMATIC VEHICLE TRANSFORMATION (xform-1, 2026-10-14). Alex: "I see no automatic car transformation when switching terrains."
// Already there: FL_veh (85) swaps the ride form by surface, garage loadout = street ride + off-road form + boat form (GAR_frm('off'|'boat')), vehMode/CR_vis
// show the form with a brick burst + label + sound. Why nothing showed on land: R1 mapped grass/dirt to the street car. XF: grass/dirt/sand → off-road form,
// water → boat, road/deck → street car, 0.3 s on the new surface before a swap (+ a 1–2 m band at the road edge: no kerb flicker), surface state reset on
// warp/respawn (a warp kept the old form ~1 s). Flag XF.on; ?xf=0 = old behaviour for one visit. Tests: checklist xf1/* (📍 GO + auto), window.__xf.
const XF={hk:-1,on:!/[?&]xf=0\b/.test(location.search),hold:.3,mIn:1,mOut:2,n:0};
if(XF.on){
 FL_VEH.dirt='offroad';
 // raw surface: on the road while within w/2+mIn; leaving needs w/2+mOut (1 m band), so a kerb run never flips it
 FL_raw=function(T0,ground){if(T0.deck)return'road';if(ground<-1.5)return'water';const m=FL.s==='road'?XF.mOut:XF.mIn;return FL_road(RO.x,RO.z,m)?'road':'dirt'};
 FL_terr=function(T0,ground,dt=1/60){const raw=FL_raw(T0,ground),air=RO.y>ground+.5;FL.lastSurf=raw;FL.hold=Math.max(0,FL.hold-dt);
  if(FL.s==null){FL.s=raw;FL.cand=raw}
  if(!air&&raw!==FL.s){if(raw!==FL.cand){FL.cand=raw;FL.cT=0}FL.cT+=dt;if(FL.cT>=XF.hold&&FL.hold<=0){FL.s=raw;FL.hold=FL_MINHOLD;FL.cT=0;XF.n++}}else if(!air){FL.cand=FL.s;FL.cT=0}
  return raw};
 // warp / respawn: the next step re-seeds the surface and the form at once (no burst for the jump itself)
 roamWarp=(f=>function(){const r=f.apply(this,arguments);FL.s=null;FL.cand=null;FL.cT=0;FL.hold=0;FL.v=null;return r})(roamWarp);
}
// ---- tests (checklist xf1/*): spawn ONLY the requirement, then drive with the keyboard state (K, what keydown sets) and measure
// hold a heading with the arrow keys, like a player (an assist pulls the car along the road edge)
function XF_keep(h){const d=angDiff(h,RO.h);K.ArrowLeft=K.ArrowRight=false;if(Math.abs(d)>.02)K[(d>0)===(XF.hk>0)?'ArrowRight':'ArrowLeft']=true}
function XF_drive(sec,each,done){const c0=FL.clk;let t=0;K.ArrowUp=K.KeyW=true;const iv=setInterval(()=>{t=FL.clk-c0;/* sim seconds */let stop=false;try{stop=each(t)}catch(e){stop=true}
 if(stop||t>=sec||state!=='roam'){clearInterval(iv);K.ArrowUp=K.KeyW=K.ArrowLeft=K.ArrowRight=false;done(t)}},50)}
// road → grass: a road point at a park edge, heading into the park, 70 m of clear grass ahead
function XF_grassSpot(){for(const R of PARKS){const cx=(R.x0+R.x1)/2,cz=(R.z0+R.z1)/2;for(let a=0;a<24;a++){const ang=a/24*6.283,dx=Math.sin(ang),dz=Math.cos(ang);let e=null;
  for(let d=10;d<500;d+=2){const x=cx+dx*d,z=cz+dz*d;if(FL_road(x,z,0)){e=d;break}}if(e==null)continue;
  const sx=cx+dx*(e+30),sz=cz+dz*(e+30);if(e<70||!FL_road(sx,sz,0)||roamHit(sx,sz,3))continue;let ok=true;
  for(let r=e+30;r>=e-66&&ok;r-=3){const x=cx+dx*r,z=cz+dz*r;if(roamHit(x,z,3)||inRiver(x,z,-3))ok=false;if(r<e-XF.mOut-4&&FL_road(x,z,XF.mOut))ok=false}
  if(ok)return{x:sx,z:sz,h:Math.atan2(-dx,-dz),park:R.name}}}return null}
// kerb: D = metres past the asphalt edge (street, fill road or Autobahn); the car runs along the park-edge road at D = 1.5 (inside the 1–2 m band)
function XF_D(x,z){let d=1e9;const q=cityAt(x,z);if(q)d=Math.min(d,q.d-q.road.w/2);const f=fillAt(x,z);if(f)d=Math.min(d,f.d-(f.r.w||12)/2);const a=abAt(x,z);if(a)d=Math.min(d,Math.abs(a.lat)-a.road.w/2);return d}
function XF_kerbH(x,z,h){const e=.5,gx=(XF_D(x+e,z)-XF_D(x-e,z))/(2*e),gz=(XF_D(x,z+e)-XF_D(x,z-e))/(2*e),g=Math.hypot(gx,gz)||1;let tx=-gz/g,tz=gx/g;if(tx*Math.sin(h)+tz*Math.cos(h)<0){tx=-tx;tz=-tz}
 const c=clamp((XF_D(x,z)-1.5)*.35,-.6,.6);return Math.atan2(tx-gx/g*c,tz-gz/g*c)}
function XF_kerbSpot(){const S=XF_grassSpot();if(!S)return null;const dx=Math.sin(S.h),dz=Math.cos(S.h);for(let u=0;u<60;u+=.5){const x=S.x+dx*u,z=S.z+dz*u;if(XF_D(x,z)>=1.5)return{x,z,h:XF_kerbH(x,z,S.h+1.2),park:S.park}}return null}
const XF_GOS={
 grass:{n:'park edge',fn:say=>{const S=XF_grassSpot();if(!S)return'📍 XF · no park edge found ❌';roamWarp(S.x,S.z,S.h);RO.h=RO.vh=S.h;RO.v=0;let tIn=null,vIn=0,tSw=null,vSw=0,vAfter=0;
  XF_drive(9,t=>{XF_keep(S.h);const raw=FL.lastSurf;if(tIn==null&&!FL_road(RO.x,RO.z,0)){tIn=t;vIn=Math.abs(RO.v)}if(tSw==null&&RO.veh==='offroad'){tSw=t;vSw=Math.abs(RO.v)}if(tSw!=null&&t>tSw+.3){vAfter=Math.abs(RO.v);return true}},()=>{
   const dt=tSw!=null&&tIn!=null?tSw-tIn:null,ok=dt!=null&&dt<=.5&&vAfter>=.9*vSw&&pl.vmode==='4x4';window.__xf.res.grass={park:S.park,dt,vIn,vSw,vAfter,form:pl.vmode};
   say(`📍 ROAD → GRASS (${S.park}) · off-road ${dt==null?'never':'after '+dt.toFixed(2)+' s on grass'} at ${Math.round(vSw*3.6)} km/h → ${Math.round(vAfter*3.6)} km/h · form ${pl.vmode} ${ok?'✅':'❌'}`)});return'📍 ROAD → GRASS · driving into '+S.park+'…'}},
 kerb:{n:'kerb run',fn:say=>{const S=XF_kerbSpot();if(!S)return'📍 XF · no park-edge kerb found ❌';roamWarp(S.x,S.z,S.h);RO.h=RO.vh=S.h;RO.v=0;FL_terr(roamTerr(RO.x,RO.z,RO.y+.3),groundY(RO.x,RO.z));const sw0=XF.n;let flips=0,last=null,minD=1e9,maxD=-1e9;
  XF_drive(10,t=>{const raw=FL.lastSurf;if(last!=null&&raw!==last)flips++;last=raw;const D=XF_D(RO.x,RO.z);if(t>1){minD=Math.min(minD,D);maxD=Math.max(maxD,D)}
   XF_keep(XF_kerbH(RO.x,RO.z,RO.h));K.ArrowUp=K.KeyW=Math.abs(RO.v)<14},()=>{
   const n=XF.n-sw0,ok=n===0&&maxD>0;window.__xf.res.kerb={swaps:n,flips,minD,maxD,form:FL.v,park:S.park};
   say(`📍 KERB RUN 10 s (${S.park}) · ${n} swaps (form ${FL.v}), wheels ${minD.toFixed(1)}…${maxD.toFixed(1)} m past the asphalt ${ok?'✅':'❌'}`)});return'📍 KERB RUN · driving 10 s along the road edge…'}}};
window.__xf={XF,GOS:XF_GOS,res:{},surf:()=>({raw:FL.lastSurf,s:FL.s,v:FL.v,veh:RO.veh,vmode:pl&&pl.vmode,n:XF.n}),grass:XF_grassSpot,kerb:XF_kerbSpot,D:XF_D};
