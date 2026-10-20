// perf-1 (2026-10-17): GO perf/frame. Stepped frames (dt 1/30, no timers, no render): a road-follow driver at speed for 20 s from wherever the city spawns.
// Per step the frame's JS (roamStep incl. traffic/LIFE/lazy builders/streaming, roamCam, drawTraffic, updWorld) is timed. Judged after the first 15 steps:
// p95 ≤ 16 ms and no step > 50 ms (perf-2: was 8). Prints the worst steps' position. Desktop numbers are in docs/PERF_1.md (tools/perf1/tFrame.js).
function PERF1_go(){const ok=b=>b?' ✅':' ❌',W=a=>Math.atan2(Math.sin(a),Math.cos(a)),N=600,ms=[],worst=[];let dist=0,px=RO.x,pz=RO.z,stk=0;
 try{for(let i=0;i<N&&state==='roam';i++){const la=12+RO.v*.9,fx=Math.sin(RO.h),fz=Math.cos(RO.h),q=rfAim(RO.x+fx*la,RO.z+fz*la,fx,fz,60),e=q?W(Math.atan2(q[0]-RO.x,q[1]-RO.z)-RO.h):0;
   K.KeyW=K.ArrowUp=true;K.ArrowLeft=e>.06;K.ArrowRight=e<-.06;if(Math.abs(RO.v)<.5&&++stk>60){stk=0;const s=rfSnap(RO.x+80,RO.z+80,200);if(s)roamWarp(s[0],s[1],s[2]||0,true)}
   const t=performance.now();roamStep(1/30);roamCam(1/30);drawTraffic(1/30);updWorld(1/30,T);const d=performance.now()-t;dist+=Math.hypot(RO.x-px,RO.z-pz);px=RO.x;pz=RO.z;
   if(i>=15){ms.push(d);worst.push([d,Math.round(RO.x)+','+Math.round(RO.z)])}}}
 finally{K.KeyW=K.ArrowUp=K.ArrowLeft=K.ArrowRight=false}
 const s=ms.slice().sort((a,b)=>a-b),p95=s[Math.floor(s.length*.95)]||0,mx=s[s.length-1]||0,med=s[s.length>>1]||0;worst.sort((a,b)=>b[0]-a[0]);
 const pass=ms.length>=500&&p95<=16&&mx<=50;window.__chk.perf1={p95,mx,med,n:ms.length,dist:Math.round(dist),worst:worst.slice(0,5)};
 return '📍 PERF FRAME · '+ms.length+' stepped frames, '+Math.round(dist)+' m · median '+med.toFixed(1)+' ms · p95 '+p95.toFixed(1)+' ms (≤ 16) · max '+mx.toFixed(0)+' ms (≤ 50) at '+(worst[0]?worst[0][1]:'-')+ok(pass)}
(function PERF1_reg(i){const C=window.__chk;if(C&&C.GO&&C.items){if(!C.items.some(q=>q.ver==='perf'&&q.id==='frame'))C.items.push({ver:'perf',id:'frame',area:'drive',text:'rv:2026-10-17 · perf/frame (Alex beta.90: “lags a lot even on a very powerful machine”): stepped-frame drive at speed in both cities, the frame JS (sim, traffic, LIFE, lazy builders, streaming, camera) p95 ≤ 16 ms and no frame > 50 ms'});
  C.GO['perf/frame']=['fra','ath'].map(c=>({c,n:'frame time',secs:120,fn:()=>PERF1_go()}));return}
 if(i<600)setTimeout(()=>PERF1_reg(i+1),100)})(0);
// telemetry-r20g: GO perf/session-doc. Payload shape of the `session` doc and its rate limit (≤ 1 write / 20 s, ≤ 30 docs), stubbed db, no graphics.
(function TR20G_reg(i){const C=window.__chk;if(C&&C.GO&&C.items){if(!C.items.some(q=>q.ver==='perf'&&q.id==='session-doc'))C.items.push({ver:'perf',id:'session-doc',area:'perf',text:'telemetry-r20g · perf/session-doc: one `session` doc per play session (build, device, phases, frame p50/p95/max per state, gap, errors) with ≤ 1 write / 20 s and ≤ 30 docs'});
  C.GO['perf/session-doc']=[{c:'fra',n:'session doc shape + rate limit',secs:2,fn:async()=>{const S=window.__ps;if(!S)return'📍 SESSION DOC · window.__ps missing ❌ FAIL';const P=S.PS,sv={sent:P.sent,lastW:P.lastW,dirty:P.dirty,seq:P.seq,tPlay:P.tPlay,tm:P.tm,st:P.st},mock=window.__pbDbMock,got=[],R=[];
   window.__pbDbMock={collection:n=>({add:async d=>{got.push([n,d]);return{}}})};
   try{P.st={roam:{a:new Float32Array(4096),k:0,n:0},race:{a:new Float32Array(4096),k:0,n:0}};P.tPlay=P.tPlay||performance.now()-4000;for(let k=0;k<40;k++){P.st.roam.a[P.st.roam.k++]=14+k%5;P.st.roam.n++}P.st.race.a[P.st.race.k++]=40;P.st.race.n++;
    P.sent=0;P.lastW=-1e9;P.dirty=true;const r1=await S.flush(false),d=got[0]&&got[0][1];
    const need=['kind','build','city','vp','dpr','ua','sid','seq','bootMs','phase','long3','roam','race','gapMs','gapState','errN','err','hint','heap','prog','at'],miss=d?need.filter(x=>!(x in d)):need;
    R.push(['write '+r1+' into perf, fields '+(miss.length?'missing '+miss.join(','):'all'),r1==='sent'&&got[0][0]==='perf'&&d.kind==='session'&&!miss.length]);
    R.push(['stats roam p50 '+(d&&d.roam&&d.roam.p50)+' p95 '+(d&&d.roam&&d.roam.p95)+' race max '+(d&&d.race&&d.race.max),!!d&&d.roam.n===40&&d.roam.p95===18&&d.roam.p50===16&&d.race.max===40]);
    P.dirty=true;const r2=await S.flush(false);clearTimeout(P.tm);P.tm=0;R.push(['2nd write < 20 s later → '+r2+', docs '+got.length,r2==='wait'&&got.length===1]);
    P.lastW=-1e9;P.sent=P.maxDocs;P.dirty=true;const r3=await S.flush(false);R.push(['31st doc → '+r3,r3==='cap'&&got.length===1]);
    P.lastW=-1e9;P.sent=0;P.dirty=true;const r4=await S.flush(true);R.push(['pagehide flush → '+r4,r4==='sent'&&got.length===2&&got[1][1].seq===d.seq+1])}
   catch(e){R.push(['threw '+e,false])}
   finally{window.__pbDbMock=mock;Object.assign(P,sv);clearTimeout(P.tm);P.tm=sv.tm}
   const ok=R.every(r=>r[1]);return`📍 SESSION DOC · ${R.map(r=>(r[1]?'✓ ':'✗ ')+r[0]).join(' · ')} → ${ok?'✅ PASS':'❌ FAIL'}`}}];return}
 if(i<600)setTimeout(()=>TR20G_reg(i+1),100)})(0);
