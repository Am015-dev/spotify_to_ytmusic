// ===== D24 (drive24): followed cars drive like cars, turn-by-turn HUD cue style, steering stability. Knobs: TUNE drawer "Route" + "Steer" tabs.
// Followed cars (Hilde's tow truck, Kaiser, duel rivals, the escort car) used to slide along the raw GPS polyline at a speed that only
// depended on the player's distance: the heading snapped 90° at every corner at full speed and nothing warned of a turn.
// Now: corners are rounded (radius TUNE.fvRad m), the speed is capped by corner grip (TUNE.fvLat m/s²) with braking ahead (TUNE.fvDec m/s²),
// and the car blinks (TUNE.fvBlink) on the side of a turn that is less than ~3 s away.
// D24_round(P): copy of the polyline with every corner replaced by a 6-segment arc (corner cut = r·tan(θ/2), at most 45 % of each leg)
function D24_round(P,r=TUNE.fvRad){if(!P||P.length<3)return P;const O=[P[0]];for(let k=1;k<P.length-1;k++){const A=P[k-1],B=P[k],C=P[k+1],ux=B[0]-A[0],uz=B[1]-A[1],vx=C[0]-B[0],vz=C[1]-B[1],la=Math.hypot(ux,uz),lb=Math.hypot(vx,vz);
  if(la<.5||lb<.5){O.push(B);continue}const th=Math.acos(clamp((ux*vx+uz*vz)/(la*lb),-1,1));if(th<.08){O.push(B);continue}const d=Math.min(r*Math.tan(Math.min(th,2.6)/2),la*.45,lb*.45);
  const p0=[B[0]-ux/la*d,B[1]-uz/la*d],p2=[B[0]+vx/lb*d,B[1]+vz/lb*d];for(let i=0;i<=6;i++){const t=i/6,a=(1-t)*(1-t),b=2*(1-t)*t,c=t*t;O.push([a*p0[0]+b*B[0]+c*p2[0],a*p0[1]+b*B[1]+c*p2[1]])}}
  O.push(P[P.length-1]);if(P.ids)O.ids=P.ids;return O}
// speed cap per vertex: sqrt(lateral grip × local radius), then a backward pass so the car brakes before the corner
function D24_vc(P,C){const n=P.length,vc=new Float32Array(n).fill(99);for(let k=1;k<n-1;k++){const h0=Math.atan2(P[k][0]-P[k-1][0],P[k][1]-P[k-1][1]),h1=Math.atan2(P[k+1][0]-P[k][0],P[k+1][1]-P[k][1]),th=Math.abs(angDiff(h1,h0));
  if(th<.02)continue;const L=(C[k+1]-C[k-1])/2;vc[k]=Math.sqrt(TUNE.fvLat*Math.max(2,L/th))}for(let k=n-2;k>=0;k--)vc[k]=Math.min(vc[k],Math.sqrt(vc[k+1]**2+2*TUNE.fvDec*(C[k+1]-C[k])));return vc}
function D24_vcap(R,s){const P=R.P,C=R.C;if(!R.vc)R.vc=D24_vc(P,C);let i=1;while(i<C.length-1&&C[i]<s)i++;return Math.min(R.vc[i],Math.sqrt(R.vc[i]**2+2*TUNE.fvDec*Math.max(0,C[i]-s)))}
// blinkers: 4 small amber lights at the corners of the car body (built once from its bounding box); side = +1 left, -1 right, 0 off
const D24_BM=new THREE.MeshBasicMaterial({color:new THREE.Color(3,1.35,.1),toneMapped:false}),D24_BG=new THREE.BoxGeometry(.35,.28,.35);
function D24_blink(m,side){if(!m)return;let L=m.userData.d24b;if(!L){if(!side)return;const r=m.rotation.y;m.rotation.y=0;m.updateMatrixWorld(true);const B=new THREE.Box3().setFromObject(m);m.rotation.y=r;m.updateMatrixWorld(true);if(B.isEmpty())return;
  const sx=m.scale.x||1,sy=m.scale.y||1,sz=m.scale.z||1,cx=(B.min.x+B.max.x)/2-m.position.x,cz=(B.min.z+B.max.z)/2-m.position.z,hx=(B.max.x-B.min.x)/2,hz=(B.max.z-B.min.z)/2,y=(B.min.y-m.position.y)+(B.max.y-B.min.y)*.42;L=m.userData.d24b=[];
  for(const sd of[1,-1])for(const fz of[1,-1]){const b=new THREE.Mesh(D24_BG,D24_BM);b.position.set((cx+sd*hx*.92)/sx,y/sy,(cz+fz*hz*.96)/sz);b.scale.set(1/sx,1/sy,1/sz);b.userData.sd=sd;b.visible=false;m.add(b);L.push(b)}}
  const on=!!side&&TUNE.fvBlink>0&&(T*1.6)%1<.55;for(const b of L)b.visible=on&&b.userData.sd===side}
// side of the next turn within max(45 m, 3 s) of s on route R (turns from D24_turns, cached on R)
function D24_side(R,s,v){if(!R.T)R.T=D24_turns(R.P,R.C);const t=R.T.find(q=>q.s1>s);return t&&t.s-s<Math.max(45,v*3)?(t.a>0?1:-1):0}
// D24 HUD: the arrow turns amber when the announced turn is less than ~3 s away
{const st=document.createElement('style');st.id='d24css';st.textContent=`#roamArrow.d24soon,#roamArrow.d24soon span{color:#ffd12c!important}#roamArrow.d24soon{border-color:#ffd12c!important}`;document.head.appendChild(st)}
// ---- D24 steering (root cause of "unstable when turning left/right", tools/tSteer24.js): ◀/▶ and the arrow keys are on/off, and any press
// reached full lock in ~0.1 s; above ~60 km/h full lock asked for 2-3× the yaw the tyres can give (bicycle yaw v/WB·tan(lock) vs grip
// μ/v), so a short correction tap turned the car at the maximum rate (~57°/s at 50 km/h) and every correction overshot the lane:
// 3 heading flips after each junction turn, never settling within 4 s. Now, in free roam only: (1) the steering builds up over
// TUNE.stRampLo s (standstill) to TUNE.stRampHi s (100 km/h) from a TUNE.stK0 start, and lets go at TUNE.stRet per s, so a tap is a
// small correction and a hold is a full turn; (2) full input asks for TUNE.stLim × the grip limit at this speed, not more.
// Drifting (DRIFT / BRAKE+steer) and analog input (gamepad stick, tilt, drag pad) keep the raw value.
// drive24b: on touch ◀/▶ c.steer is TOUCH.steer, which already has its own ramp (and a slow 7/s let-go); with the ramp below on top, a
// lifted finger kept the steering BUILDING for a few frames and then let go at 7/s (~0.2 s of extra lag: touch had ~3 heading flips per
// turn vs ~1 on keys). TUNE.stTouchDig=1: the buttons feed the same digital value as the arrow keys (TOUCH.dir), so touch = keys.
function D24_shape(c,dt){let raw=clamp(c.steer||0,-1,1);if(TUNE.stTouchDig&&SET.touch==='buttons'&&TOUCH.on&&TOUCH.used&&!RO.dDir&&!c.hb){const kd=(K.ArrowRight||K.KeyD?1:0)-(K.ArrowLeft||K.KeyA?1:0);raw=clamp((TOUCH.dir||0)+kd,-1,1)}c.steerRaw=raw;if(RO.dDir||c.hb||!dt){RO.d24s=raw;return}
  const dig=Math.abs(raw)>.98||raw===0||SET.touch==='buttons',sp=Math.abs(RO.v||0);let s=RO.d24s||0;
  if(dig){const v0=TUNE.stRampV0/3.6,Tin=TUNE.stRampLo+(TUNE.stRampHi-TUNE.stRampLo)*clamp((sp-v0)/Math.max(1,27.8-v0),0,1)/* drive24b: short ramp up to TUNE.stRampV0 km/h (corners), longer above */;
    // drive24b: a press AGAINST the way the car is rotating (a counter-tap after a turn; trace qa24b/dA_*: ±50°/s limit cycle) ramps over
    // TUNE.stRampRev s instead; building a turn keeps the short ramp
    const Tr=raw!==0&&(RO.yr||0)*Math.sign(RO.v||1)*raw>.15?Math.max(Tin,TUNE.stRampRev):Tin;if(raw!==0&&Math.sign(raw)===Math.sign(s||raw)&&Math.abs(s)<Math.abs(raw)){if(Math.abs(s)<TUNE.stK0)s=Math.sign(raw)*TUNE.stK0;s+=Math.sign(raw)*dt/Math.max(.02,Tr);if(Math.abs(s)>Math.abs(raw))s=raw}
    else{const d=raw-s;s+=clamp(d,-TUNE.stRet*dt,TUNE.stRet*dt);/* drive24b: ◀ straight to ▶ used to reach full opposite lock in 0.17 s through this let-go path; past centre it re-enters the ramp */if(raw!==0&&s*raw>0&&Math.abs(s)>TUNE.stK0)s=Math.sign(raw)*TUNE.stK0}}else s=raw;RO.d24s=s;
  const dm=TUNE.stAng/(1+sp/TUNE.stFall),mu=C26.muCity.road*((carStat().han)||1),k=sp>3?clamp(Math.atan(TUNE.stLim*mu*CR_WB/(sp*sp))/dm,.12,1):1;c.steer=s*k;RO.d24k=k}
ctlPlayer=(f=>function(dtR){const c=f.apply(this,arguments);try{if(state==='roam'&&TUNE.stOn)D24_shape(c,Math.min(dtR||1/60,.05))}catch(e){}return c})(ctlPlayer);
