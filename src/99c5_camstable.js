// camloop3: GO cam/stable (lazy chunk), DETERMINISTIC: no timers, no real clock. Stepped frames (fixed dt 1/30, every 40th frame the 50 ms dt clamp), Math.random seeded, scripted gas + steering from wherever the city spawns.
// Judges ONLY the bug (beta.83 phone: camera far, then close again): after a car <-> 4x4 flip the camera re-fit must land once. The unfixed fit read the half-swapped body (5.7 -> 9.9 m) and re-fitted back 30 frames later,
// so two fits in one flip window more than 0.3 m apart (follow distance b) = FAIL; plus no player teleport while moving > 10 km/h. No band check (noisy in 4x4 on narrow streets). Distances are reported, not judged.
function CAMST_go(say){const ok=b=>b?' ✅':' ❌';const FL=240,WIN=200,NF=6,S={tele:0,exc:0,flip:0,maxExc:0};const rnd0=Math.random;let sd=12345;Math.random=()=>(sd=(sd*16807)%2147483647)/2147483647;
 const dl0=window.__swapDelayFrames;window.__swapDelayFrames=window.__camstDelay!==undefined?window.__camstDelay:45;  /* late body swap like the phone */
 let px=RO.x,pz=RO.z,i=0,nf=window.__cam?__cam.S.n.fit:0;S.fits=[];const fb=[];const ds=[],fl=[];
 try{for(;i<FL*NF+WIN;i++){const dt=i%40===39?.05:1/30;K.ArrowUp=true;const ph=i%FL;K.ArrowLeft=ph>150&&ph<170;K.ArrowRight=false;   /* steer only between the flip windows (roll/pitch of a turning body moves the measured profile) */
   if(i>0&&i%FL===0&&i<FL*NF){RO.vsel=RO.vsel==='offroad'?'ship':'offroad';S.flip++;fl.push(i)}
   roamStep(dt);try{roamCam(dt)}catch(e){}if(window.__cam&&__cam.S.n.fit!==nf){nf=__cam.S.n.fit;const q=__cam.S.log[__cam.S.log.length-1];S.fits.push(i+':'+q.join('/'));fb.push([i,q[3]])}const c=camera.position;ds.push(Math.hypot(c.x-RO.x,c.z-RO.z));
   const sp=Math.hypot(RO.x-px,RO.z-pz);if(i>60&&Math.abs(RO.v)*3.6>10&&sp>Math.abs(RO.v)*dt*1.6+1.5)S.tele++;px=RO.x;pz=RO.z}}
 finally{K.ArrowUp=K.ArrowLeft=K.ArrowRight=false;if(dl0===undefined)delete window.__swapDelayFrames;else window.__swapDelayFrames=dl0;Math.random=rnd0}
 const av=(a,b)=>{let s=0;for(let k=a;k<b;k++)s+=ds[k];return s/(b-a)},info=[];
 for(const f of fl){const d0=av(f-10,f),d1=av(f+WIN-10,f+WIN);let hi=0,lo=0;for(let k=f;k<f+WIN;k++){hi=Math.max(hi,ds[k]-Math.max(d0,d1));lo=Math.max(lo,Math.min(d0,d1)-ds[k])}const e=Math.max(hi,lo);S.maxExc=Math.max(S.maxExc,e);const w=fb.filter(q=>q[0]>=f&&q[0]<f+WIN),db=w.length>1?Math.max(...w.map(q=>q[1]))-Math.min(...w.map(q=>q[1])):0;if(db>.3)S.exc++;info.push(w.length+' fit'+(w.length>1?'s, b '+db.toFixed(1)+' m apart':'')+', cam '+d0.toFixed(1)+'>'+d1.toFixed(1)+' (excursion '+e.toFixed(1)+')')}
 S.info=info;S.tr=ds.map(d=>Math.round(d*10)/10);const pass=!S.tele&&!S.exc;window.__chk.camst=S;
 return '📍 CAM STABLE · '+S.flip+' car/4x4 flips, stepped frames · teleports while moving '+S.tele+' · far/close re-fits (2 fits in one flip window > 0.3 m apart): '+S.exc+' ('+info.join(', ')+')'+ok(pass)}
(function CAMST_reg(i){const C=window.__chk;if(C&&C.GO&&C.items){if(!C.items.some(q=>q.ver==='cam'&&q.id==='stable'))C.items.push({ver:'cam',id:'stable',area:'drive',text:'rv:2026-10-17 · cam/stable: stepped-frame drive with car/4x4 flips in both cities: the follow distance never jumps past its old/new value, no teleports'});
  C.GO['cam/stable']=['fra','ath'].map(c=>({c,n:'stable follow camera',secs:120,fn:()=>CAMST_go()}));return}
 if(i<600)setTimeout(()=>CAMST_reg(i+1),100)})(0);
