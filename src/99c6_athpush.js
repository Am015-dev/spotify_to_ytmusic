// ath-push (2026-10-17): Athens hunt #2/#3. Root cause: frame() took dt = now - last with no floor, so a rAF stamp behind the last one gave dt = -32 s:
// TR_pre grew the terrain slide to 385 m/s, TR_post moved the car 5-13 km out of the world, T and the story timers ran backwards (chapter banner again),
// and the leftover slide shook the car 7 m per frame for seconds. Fix: frame() floors dt at 0 (72_roam_map_loop_boot.js).
// Safety net here (outermost roamStep wrapper, not the fix): dt outside 0..0.1 s is dropped / capped, the car is kept inside the world, and any step that moves
// the car > 100 m or leaves the world is logged once per second to window.__odPush (console.warn).
const OD_PUSH={n:0,out:0,big:0,log:[],t:0};window.__odPush=OD_PUSH;
roamStep=(f=>function(dt){dt=dt>0?Math.min(dt,.1):0;const x0=RO.x,z0=RO.z,r=f.call(this,dt);
  const mv=Math.hypot(RO.x-x0,RO.z-z0),out=!(RO.x>=WX0&&RO.x<=WX1&&RO.z>=WZS&&RO.z<=WZN);
  if(out||mv>100||!isFinite(mv)){OD_PUSH.n++;if(out)OD_PUSH.out++;else OD_PUSH.big++;const e={x0:Math.round(x0),z0:Math.round(z0),x:Math.round(RO.x),z:Math.round(RO.z),dt};
   if(!isFinite(RO.x)||!isFinite(RO.z)){RO.x=x0;RO.z=z0}RO.x=clamp(RO.x,WX0+10,WX1-10);RO.z=clamp(RO.z,WZS+10,WZN-10);
   if(OD_PUSH.log.length<20)OD_PUSH.log.push(e);const t=performance.now();if(t-OD_PUSH.t>1000){OD_PUSH.t=t;console.warn('roamStep push',JSON.stringify(e))}}
  return r})(roamStep);
// GO ath-push: stepped frames (1/30 s, Math.random seeded) on 3 Athens routes from the hunt (Acropolis ped street, the review push-out street, the south):
// gas along the street, every 4 s a 1 s reverse + steer (the hunt's unstick), plus one frame() with a clock 32 s behind. PASS = 0 jumps > 8 m in one frame,
// 0 out-of-world frames (a TR8 off-road rescue lift is counted, not judged), 0 story resets (ATC step / clock T never go back), the backwards frame moves the car < 1 m, 0 safety-net hits.
function ATHP_go(){const ok=b=>b?' ✅':' ❌';if(CID!=='ath')return'📍 ath-push: Athens only';const rnd0=Math.random;let sd=4242;Math.random=()=>(sd=(sd*16807)%2147483647)/2147483647;
 const R=[[1879,-1615],[1039,-1893],[157,-2900]],S={jump:0,out:0,reset:0,maxJ:0,where:[],back:-1,resc:0,net0:OD_PUSH.n,routes:0};const st0=ATC_st().step;
 try{for(const [x,z] of R){const q=cityAt(x,z,-1,true);if(!q)continue;const p=q.p;if(!roamWarp(p.x,p.z,Math.atan2(p.tx,p.tz),true))continue;RO.v=0;S.routes++;for(let i=0;i<8;i++)roamStep(1/30);
   let px=RO.x,pz=RO.z,T0=T;for(let i=0;i<600;i++){const rev=i%120>=90,qq=cityAt(RO.x,RO.z,-1,true);let e=0;if(qq){e=angDiff(Math.atan2(qq.p.tx,qq.p.tz),RO.h);if(Math.abs(e)>Math.PI/2)e=angDiff(Math.atan2(-qq.p.tx,-qq.p.tz),RO.h)}
    K.ArrowUp=!rev;K.ArrowDown=rev;K.ArrowLeft=rev?Math.random()<.5:e>.08;K.ArrowRight=rev?!K.ArrowLeft:e<-.08;const dt=i%40===39?.05:1/30;T+=dt;const n6=RO.t6n||0;roamStep(dt);
    const j=Math.hypot(RO.x-px,RO.z-pz),resc=(RO.t6n||0)!==n6;if(resc){S.resc++;px=RO.x;pz=RO.z;continue}/* TR8 off-road rescue: 4 s stuck off the road, fade + lift to the nearest street (deliberate; counted, not a push-out) */if(j>8&&!RO.wk){S.jump++;if(S.where.length<4)S.where.push(Math.round(px)+','+Math.round(pz)+'>'+Math.round(RO.x)+','+Math.round(RO.z))}S.maxJ=Math.max(S.maxJ,RO.wk?0:j);
    if(!(RO.x>WX0&&RO.x<WX1&&RO.z>WZS&&RO.z<WZN))S.out++;if(ATC_st().step<st0||T<T0)S.reset++;T0=T;px=RO.x;pz=RO.z}}
  /* the bug itself: one frame() whose rAF stamp is 32 s behind the last one */
  const x0=RO.x,z0=RO.z,T0=T,raf=window.requestAnimationFrame;window.requestAnimationFrame=()=>0;try{frame(last-32000)}finally{window.requestAnimationFrame=raf}S.back=Math.hypot(RO.x-x0,RO.z-z0);if(T<T0)S.reset++}
 finally{K.ArrowUp=K.ArrowDown=K.ArrowLeft=K.ArrowRight=false;Math.random=rnd0}
 const net=OD_PUSH.n-S.net0,pass=S.routes===3&&!S.jump&&!S.out&&!S.reset&&S.back<1&&!net;window.__chk.athp=S;
 return '📍 ATH PUSH · '+S.routes+'/3 routes, 1800 stepped frames · jumps > 8 m/frame: '+S.jump+' (max '+S.maxJ.toFixed(1)+' m'+(S.where.length?' at '+S.where.join(' '):'')+') · off-road rescues (fade + lift to the street, allowed): '+S.resc+' · out of world: '+S.out+' · story/clock resets: '+S.reset+' · frame 32 s behind moved the car '+S.back.toFixed(2)+' m · safety net hits: '+net+ok(pass)}
(function ATHP_reg(i){const C=window.__chk;if(C&&C.GO&&C.items){if(!C.items.some(q=>q.ver==='athbugs'&&q.id==='ath-push'))C.items.push({ver:'athbugs',id:'ath-push',area:'drive',text:'athbugs · ath-push: 3 Athens routes with reverses + a backwards clock frame: no jump > 8 m per frame, never out of the world, no chapter reset'});
  C.GO['athbugs/ath-push']=[{c:'ath',n:'no push-outs',secs:120,fn:()=>ATHP_go()}];return}
 if(i<600)setTimeout(()=>ATHP_reg(i+1),100)})(0);
