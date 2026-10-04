// ===== BF: play-test bug fixes (Frankfurt). Self-contained; every global is prefixed BF_. Existing functions are wrapped, never edited.
// BF1: the world keeps running behind full-screen overlays (map, garage builder, settings, story scenes) -> event timers tick, goons hit, held keys drive.
const BF_hold=()=>state==='roam'&&!!(RO.mapOpen||!$('#gbx').hidden||!$('#settings').hidden||RO.jOpen||RO.pOpen);
roamStep=(f=>function(dt){if(BF_hold()){if(pl){AU.engine(pl,0,false);AU.scrape(false)}return}return f(dt)})(roamStep);
// BF2: GARAGE from the pause menu during an event: saving re-enters roam, which silently aborts the running mission. Hide it while an event runs.
roamPauseOpen=(f=>function(){f();const b=document.querySelector('#roamPause [data-p="garage"]');if(b)b.hidden=!!(RO.ch||RO.sp)})(roamPauseOpen);
// BF3: a car that ends up inside a building collider (bad warp/landing) is pinned forever: the anti-stuck turn finds no free spot within 7 m
// and there is no reset. After 2 s inside a collider, put it back on the nearest street.
let BF_inT=0;
roamStep=(f=>function(dt){const r=f(dt);if(state!=='roam'||CID!=='fra'||!RO.on||RO.wk||BF_hold()||(pl&&pl.air)){BF_inT=0;return r}
  if(roamHit(RO.x,RO.z,1,RO.y)){BF_inT+=dt;if(BF_inT>2){BF_inT=0;BF_rescue()}}else BF_inT=0;return r})(roamStep);
function BF_rescue(){let best=null;for(const rr of [60,150,400]){for(let k=0;k<12&&!best;k++){const a=k/12*Math.PI*2,q=rfSnap(RO.x+Math.sin(a)*rr*.5,RO.z+Math.cos(a)*rr*.5,rr);if(!roamHit(q[0],q[1],3))best=q}if(best)break}
  if(!best)return;RO.x=best[0];RO.z=best[1];RO.y=groundAt(RO.x,RO.z,99);RO.h=RO.vh=best[2];RO.v=0;RO.vy=0;RO.yr=0;camSnap=true;say('','↺ BACK ON THE ROAD',1.2);AU.sfx('pick')}
// BF4: Escape on the results of a race started from free roam threw the player to the title menu (losing their place); go back to roam instead.
addEventListener('keydown',e=>{if(state==='results'&&e.code==='Escape'&&!$('#roamBack').hidden&&!$('#results').hidden){e.preventDefault();e.stopImmediatePropagation();enterRoam(RO.lastMark)}},true);
// BF5: chase camera clipped into buildings next to walls (occlusion test only looks straight back and keeps >=4 m; the lerp cuts corners).
// After the camera is placed, pull it toward the car until it is outside every building, else lift it above the car.
roamCam=(f=>function(dt){f(dt);if(state!=='roam'||CID!=='fra')return;const c=camera.position;if(!roamHit(c.x,c.z,.3,c.y))return;
  const x0=c.x,z0=c.z;let ok=0;for(let k=1;k<=7&&!ok;k++){const u=k/8,x=x0+(RO.x-x0)*u,z=z0+(RO.z-z0)*u;if(!roamHit(x,z,.3,c.y)){c.x=x;c.z=z;ok=1}}
  if(!ok){c.x=RO.x-Math.sin(RO.h)*2;c.z=RO.z-Math.cos(RO.h)*2;c.y=Math.max(c.y,RO.y+9)}camera.lookAt(RO.x+Math.sin(RO.h)*6,RO.y+1.5,RO.z+Math.cos(RO.h)*6)})(roamCam);
// BF6: phone landscape: the mission HP bar sat on top of the stage timer/stars panel (#raceW), and the district plate's first letters were hidden
// under the minimap ("nnenstadt"). Move the HP bar just below #raceW and the plate right of the minimap.
{const st=document.createElement('style');st.textContent=`@media (max-height:500px){html body #m1Hp{top:calc(46px + env(safe-area-inset-top,0px));left:50%;right:auto;transform:translateX(-50%)}}
@media (max-height:520px){html body.touch #roamPlate{left:calc(102px + env(safe-area-inset-left,0px))}}`;document.head.appendChild(st)}
