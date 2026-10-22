// ===== phone-path-bugs-r22e26 (bughunt on the phone profile: npcPop ath 7/h, launch ath 14/h + fra 2.5/h, popup ath 3.5/h; desktop 0).
// npcPop: hubRecycle (60_city_build6.js) re-places a far car on a street node near you; with ?law off nothing checked that the new spot is out of the camera's view
// (LV_nearHid falls back to the last node it tried, 35 % of the picks skip it) -> a car appears 40-60 m ahead in plain view. On touch/LOWMEM the recycle runs 2 a frame
// for the first seconds after a warp, so a recycle lands in view well after the warp grace. HT_inView now vetoes any recycle spot the frustum sees (retried next frame).
// GO traffic/recycle-view: no graphics. 8 headings x 60 recycle calls, 40 cars teleported far each call; every recycled spot is tested against the real frustum (852x393).
// launch: the bughunt counted AIR TIME kicker / ramp jumps (RO.crRJ, CR_rampLaunch, intended) as 'launch'; popup: already fixed by roamcard-quiet (b4634df), 0 in 6 phone runs.
function PP_recycle(){
 if(state!=='roam'||!RO.on||!HUB.cars||!HUB.nodes||typeof LV_seen!=='function')return'';
 const sv={h:RO.h,vh:RO.vh,rcN:HUB.rcN,rr:HUB.rr,cp:camera.position.clone(),cq:camera.quaternion.clone(),asp:camera.aspect},C=HUB.cars,saved=new Map(),V=new THREE.Vector3();
 let moved=0,recycled=0,inView=0,worst=1e9;
 try{camera.aspect=852/393;camera.updateProjectionMatrix();
  const el=C.filter(c=>!c.route&&!c.tr&&!c.pk&&!(c.dead>0)).slice(0,40);for(const c of el)saved.set(c,{a:c.a,b:c.b,t:c.t,x:c.x,z:c.z});
  HUB.rcN=1e9;   // no first-seconds budget: 6 recycles a call
  for(let k=0;k<8;k++){const h=k*Math.PI/4;RO.h=RO.vh=h;const sx=Math.sin(h),sz=Math.cos(h);
   camera.position.set(RO.x-sx*8,RO.y+4,RO.z-sz*8);camera.lookAt(RO.x+sx*20,RO.y+1,RO.z+sz*20);camera.updateMatrixWorld();LV_seenF.setFromProjectionMatrix(_lvPM.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));
   for(let j=0;j<60;j++){const was=new Map();for(const c of el){c.x=RO.x+900+(c.x%7);c.z=RO.z+900;was.set(c,c.a+'|'+c.b+'|'+c.t)}moved+=el.length;
    hubRecycle();
    for(const c of el){if(was.get(c)===c.a+'|'+c.b+'|'+c.t)continue;const A=HUB.nodes[c.a],B=HUB.nodes[c.b];if(!A||!B)continue;recycled++;
     const x=A.x+(B.x-A.x)*c.t,z=A.z+(B.z-A.z)*c.t,d=Math.hypot(x-RO.x,z-RO.z);if(d<250&&LV_seen(x,A.y||0,z)){inView++;worst=Math.min(worst,d)}}}}
 }finally{for(const[c,s]of saved)Object.assign(c,s);RO.h=sv.h;RO.vh=sv.vh;HUB.rcN=sv.rcN;HUB.rr=sv.rr;camera.position.copy(sv.cp);camera.quaternion.copy(sv.cq);camera.aspect=sv.asp;camera.updateProjectionMatrix();camera.updateMatrixWorld();LV_seenF.setFromProjectionMatrix(_lvPM.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse))}
 const ok=recycled>=10&&inView===0;
 return`📍 RECYCLE VIEW ${CID}: ${recycled} recycled cars of ${moved} offered (≥ 10), ${inView} placed inside the 852x393 camera frustum${inView?' (nearest '+worst.toFixed(0)+' m)':''} (must be 0) → ${ok?'✅ PASS':'❌ FAIL'}`}
function PP_rows(GO,goSay,CK){CK.push({ver:'traffic',id:'recycle-view',area:'world',text:'phone-path-bugs-r22e26:2026-10-22 · A recycled traffic car never appears inside the camera view: 📍 GO teleports 40 cars far away, calls the real hubRecycle 480 times over 8 headings (phone aspect 852x393, no graphics) and tests every new spot against the frustum. Pass line: ≥ 10 recycled, 0 inside the view.'});
 for(const c of['fra','ath'])(GO['traffic/recycle-view']=GO['traffic/recycle-view']||[]).push({c,n:'recycle view '+c,secs:30,fn:()=>PP_recycle()})}
window.__pp={recycle:PP_recycle};
