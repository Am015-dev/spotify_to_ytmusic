// perf-1 (2026-10-17): GO perf/frame. Stepped frames (dt 1/30, no timers, no render): a road-follow driver at speed for 20 s from wherever the city spawns.
// Per step the frame's JS (roamStep incl. traffic/LIFE/lazy builders/streaming, roamCam, drawTraffic, updWorld) is timed. Judged after the first 15 steps:
// p95 ≤ 8 ms and no step > 50 ms. Prints the worst steps' position. Desktop numbers are in docs/PERF_1.md (tools/perf1/tFrame.js).
function PERF1_go(){const ok=b=>b?' ✅':' ❌',W=a=>Math.atan2(Math.sin(a),Math.cos(a)),N=600,ms=[],worst=[];let dist=0,px=RO.x,pz=RO.z,stk=0;
 try{for(let i=0;i<N&&state==='roam';i++){const la=12+RO.v*.9,fx=Math.sin(RO.h),fz=Math.cos(RO.h),q=rfAim(RO.x+fx*la,RO.z+fz*la,fx,fz,60),e=q?W(Math.atan2(q[0]-RO.x,q[1]-RO.z)-RO.h):0;
   K.KeyW=K.ArrowUp=true;K.ArrowLeft=e>.06;K.ArrowRight=e<-.06;if(Math.abs(RO.v)<.5&&++stk>60){stk=0;const s=rfSnap(RO.x+80,RO.z+80,200);if(s)roamWarp(s[0],s[1],s[2]||0,true)}
   const t=performance.now();roamStep(1/30);roamCam(1/30);drawTraffic(1/30);updWorld(1/30,T);const d=performance.now()-t;dist+=Math.hypot(RO.x-px,RO.z-pz);px=RO.x;pz=RO.z;
   if(i>=15){ms.push(d);worst.push([d,Math.round(RO.x)+','+Math.round(RO.z)])}}}
 finally{K.KeyW=K.ArrowUp=K.ArrowLeft=K.ArrowRight=false}
 const s=ms.slice().sort((a,b)=>a-b),p95=s[Math.floor(s.length*.95)]||0,mx=s[s.length-1]||0,med=s[s.length>>1]||0;worst.sort((a,b)=>b[0]-a[0]);
 const pass=ms.length>=500&&p95<=8&&mx<=50;window.__chk.perf1={p95,mx,med,n:ms.length,dist:Math.round(dist),worst:worst.slice(0,5)};
 return '📍 PERF FRAME · '+ms.length+' stepped frames, '+Math.round(dist)+' m · median '+med.toFixed(1)+' ms · p95 '+p95.toFixed(1)+' ms (≤ 8) · max '+mx.toFixed(0)+' ms (≤ 50) at '+(worst[0]?worst[0][1]:'-')+ok(pass)}
(function PERF1_reg(i){const C=window.__chk;if(C&&C.GO&&C.items){if(!C.items.some(q=>q.ver==='perf'&&q.id==='frame'))C.items.push({ver:'perf',id:'frame',area:'drive',text:'rv:2026-10-17 · perf/frame (Alex beta.90: “lags a lot even on a very powerful machine”): stepped-frame drive at speed in both cities, the frame JS (sim, traffic, LIFE, lazy builders, streaming, camera) p95 ≤ 8 ms and no frame > 50 ms'});
  C.GO['perf/frame']=['fra','ath'].map(c=>({c,n:'frame time',secs:120,fn:()=>PERF1_go()}));return}
 if(i<600)setTimeout(()=>PERF1_reg(i+1),100)})(0);
