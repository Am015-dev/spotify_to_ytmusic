// ===== VF: v82 regression fixes (garage overlay hold, chase camera never inside buildings) =====
// BF1: during an event the garage is refused (gbOpen guard), but the pause button had already closed the pause menu, so nothing covered the
// world and it kept running (gas drove the car, event clock ran). Refuse before the menu closes: the pause menu stays open, the world stays held.
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('#roamPause [data-p="garage"]');if(!b||state!=='roam'||!(RO.ch||RO.sp))return;
  e.stopImmediatePropagation();e.preventDefault();try{say('GARAGE CLOSED','FINISH THE EVENT FIRST')}catch(_){}AU.sfx('bump')},true);
// any full-screen overlay holds the world (builder, settings, profile, logbook, map, pause), whichever module opened it
const VF_OV=['#gbx','#settings','#profile','#journal','#roamMap','#roamPause'];
const VF_hold=()=>state==='roam'&&VF_OV.some(s=>{const e=document.querySelector(s);return !!e&&!e.hidden});
roamStep=(f=>function(dt){if(VF_hold()){if(pl){AU.engine(pl,0,false);AU.scrape(false)}return}return f(dt)})(roamStep);
// BF5: last camera pass (after the juice drop/pull/kick offsets and the taller city-variety roofs): if the eye is inside any building collider,
// slide it along the eye→car line to the first free point; if none, lift it above the car. Offset kept separate so it never feeds the smoothing.
const VF={co:new THREE.Vector3(),n:0};
const VF_in=(x,y,z)=>!!roamHit(x,z,.6,y);
roamCam=(f=>function(dt){const c=camera.position;c.sub(VF.co);VF.co.set(0,0,0);f(dt);if(state!=='roam')return;
  if(!VF_in(c.x,c.y,c.z))return;const x0=c.x,y0=c.y,z0=c.z,tx=RO.x,ty=RO.y+2.4,tz=RO.z;let p=null;
  for(let k=1;k<=24&&!p;k++){const u=k/24,x=x0+(tx-x0)*u,y=y0+(ty-y0)*u,z=z0+(tz-z0)*u;if(!VF_in(x,y,z))p=[x,y,z]}
  if(!p){const sx=Math.sin(RO.h),sz=Math.cos(RO.h);for(const[b,h]of[[3,6],[2,9],[0,4],[0,2.4]]){const x=tx-sx*b,z=tz-sz*b,y=RO.y+h;if(!VF_in(x,y,z)){p=[x,y,z];break}}}
  if(!p)return;VF.n++;VF.co.set(p[0]-x0,p[1]-y0,p[2]-z0);c.add(VF.co);if(VF.co.lengthSq()>4)camera.lookAt(tx+Math.sin(RO.h)*6,RO.y+1.5,tz+Math.cos(RO.h)*6)})(roamCam);
window.__vf={VF,hold:VF_hold};
