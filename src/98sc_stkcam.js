// Ported from SuperTuxKart (stk-code@e05fef37e9d5045b7d272f56216dcc981bd6e616, src/graphics/camera/camera_normal.cpp:CameraNormal::moveCamera), GPL-3.0-or-later.
// (The task named src/graphics/camera_normal.cpp; at this SHA the file lives in src/graphics/camera/.) Code only, no SKC assets. Notes: docs/wiki/learn/stk.md.
// stkcam-r24m. Alex: "the car camera is zoom in and out". GO cam/steady (src/99cst_camsteady_go.js) FAILED on beta.161: 9-11 distance reversals per 10 s in a city race.
// Why: the final drive camera is a stack of layers that each move the distance or the FOV with their own rate: roamCam (raw speed -> FOV, roamHit pull-in
// re-solved every frame: a building corner gives in / out / in), the foliage-cam wall pull, the juice pull + FOV, the speed-feel pull-back + boost FOV.
// SKC's chase camera has ONE smoothed state: the wanted offset comes from the speed ratio (clamped to >= -0.12), and the offset moves toward it by
// delta = dt / smooth_position each frame (moveCamera); the target is the kart + 0.5 up. Same here, as the LAST roamCam layer:
//  - the speed ratio is smoothed once (SKC delta with smooth_position SKC.tp), the wanted length is our rig's back/up at that ratio (+ the boost pull-back);
//  - walls (roamHit behind the car + the foliage-cam raycast) give a limit with hysteresis: pull in fast (SKC.wIn /s), hold SKC.hold s, release slowly (<= SKC.wOut m/s);
//  - the camera keeps the direction the layers below chose (car -> camera line, orientation untouched) and only gets this one length;
//  - one FOV: base + speed (the ratio smoothed slower, SKC.tf: a FOV change reads as a zoom) + boost (eased) + kick, rate-limited to SKC.fr deg/s.
// ?stkcam=0 = the old stack.
const SKC={on:!/[?&]stkcam=0/.test(location.search),tp:.6,tf:1.5,rF:null,wIn:10,hold:.6,wOut:1,fr:7,r:null,d:null,L:1e9,lt:0,bE:0,fov:null,n:0,u:new THREE.Vector3()};
function SKC_free(C,r){const sp=TUNE.camSpr!==0,b=C.b+C.bk*r*(sp?.5:1),h=C.h+C.hk*r;return[b,h]}
// horizontal back distance a wall allows behind the car (the roamCam scan, along the camera heading)
function SKC_wall(bmax){const a=RO.camH!=null?RO.camH:RO.h,fx=Math.sin(a),fz=Math.cos(a);for(let d=2;d<=bmax;d+=.5)if(roamHit(RO.x-fx*d,RO.z-fz*d,1.5,RO.y+2.5))return Math.max(CR_minBack(),d-1);return 1e9}
function SKC_cam(dt,sn){const c=camera.position,C=RCAM[SET.rcam||'chase'];if(!C)return;dt=Math.min(.1,Math.max(1e-4,dt||1/60));
  const u=SKC.u.set(c.x-RO.x,c.y-RO.y,c.z-RO.z),dRaw=u.length();if(dRaw<.5)return;u.multiplyScalar(1/dRaw);
  const snap=SKC.d==null||sn||SKC.lt>0&&performance.now()-SKC.lt>500;SKC.lt=performance.now();
  // SKC moveCamera: ratio = speed / max speed without zipper, >= -0.12; delta = dt / smooth_position
  const r0=Math.max(-.12,Math.min(1.4,Math.abs(RO.v)/Math.max(30,RO.top||60))),dl=Math.min(1,dt/Math.max(dt,SKC.tp));SKC.r=snap?r0:SKC.r+(r0-SKC.r)*dl;const r=SKC.r;SKC.rF=snap||SKC.rF==null?r0:SKC.rF+(r0-SKC.rF)*Math.min(1,dt/Math.max(dt,SKC.tf));
  const bo=!!(pl&&pl.nitro)||(RO.turbo||0)>0;SKC.bE+=((bo?1:0)-SKC.bE)*Math.min(1,dt*(bo?2:1.2));
  const[b,h]=SKC_free(C,r),bk=b+.45*SKC.bE,up=h+(RO.camA||0),dFree=Math.hypot(bk,up);
  // walls: limit with hysteresis (in fast, hold, out slowly)
  let Lw=1e9;{const wb=SKC_wall(b);if(wb<1e9)Lw=Math.hypot(wb,up)}try{if(FC.pull&&FC.kt<1&&FC.dv)Lw=Math.min(Lw,FC.kt*FC.dv.length())}catch(e){}
  if(snap){SKC.L=Lw;SKC.ht=0}else if(Lw<SKC.L){SKC.L+=(Lw-SKC.L)*Math.min(1,dt*SKC.wIn);SKC.ht=0}else{SKC.ht=(SKC.ht||0)+dt;if(SKC.ht>SKC.hold)SKC.L=Math.min(Lw,SKC.L+SKC.wOut*dt)}
  if(Lw<dFree){SKC.wn=(SKC.wn||0)+1;SKC.wmin=Math.min(SKC.wmin||1e9,Lw)}
  const tgt=Math.max(Math.min(dFree,SKC.L),3);
  if(snap)SKC.d=tgt;else if(tgt<SKC.d)SKC.d+=(tgt-SKC.d)*Math.min(1,dt*SKC.wIn);else SKC.d=Math.min(tgt,SKC.d+Math.min(SKC.wOut*1.5*dt,(tgt-SKC.d)*dl));
  c.set(RO.x+u.x*SKC.d,RO.y+u.y*SKC.d,RO.z+u.z*SKC.d);{const gc=groundAt(c.x,c.z,c.y+2);if(c.y<gc+.7)c.y=gc+.7}
  // one FOV from the same smoothed ratio
  let fv=pFov(TUNE.fov+({narrow:-6,normal:0,wide:8}[SET.fov]||0)+Math.min(10,TUNE.fovSpd*.7*Math.min(SKC.rF,1))+4*SKC.bE+Math.min(1.5,(fovKick||0)*.15)),fc=typeof F21!=='undefined'&&F21.on&&F21.rest?F21.rest+F21.max:1e9;   // the feel-r21a cap (rest + 12 deg) still holds
  fv=Math.min(fv,fc);
  SKC.fov=snap||SKC.fov==null?fv:SKC.fov+Math.max(-SKC.fr*dt,Math.min(SKC.fr*dt,(fv-SKC.fov)*Math.min(1,dt*3)));camera.fov=SKC.fov;camera.updateProjectionMatrix();SKC.n++}
roamCam=(f=>function(dt){const sn=camSnap,r=f.apply(this,arguments);try{if(SKC.on&&state==='roam'&&!!pl&&(!RO.foot||RO.foot==='car')&&!(typeof M1!=='undefined'&&M1.cs)&&(SET.rcam||'chase')!=='high')SKC_cam(dt,sn);else SKC.d=null}catch(e){SKC.err=String(e).slice(0,160)}return r})(roamCam);
window.__skc=SKC;
