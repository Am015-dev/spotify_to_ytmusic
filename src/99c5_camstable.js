// camloop: GO cam/stable (lazy chunk). State asserts, no graphics: 60 s of scripted touch-style driving (gas held, steering bursts) with phone frame hitches (a 50 ms dt every 40th frame, the dt clamp)
// and a car <-> 4x4 form flip every 6 s (the real trigger: the camera re-fit read the half-swapped body and pushed the camera to 10 m). Per frame: the player never jumps while moving > 10 km/h
// (RO step <= 1.6 v dt + 1.5 m), the camera -> car distance stays in 0.35-2 x its median and never steps by more than that median in one frame.
function CAMST_go(say){const ok=b=>b?' ✅':' ❌';const N=60*30,S={tele:0,step:0,band:0,flip:0};let i=0,ds=[],px=RO.x,pz=RO.z,pd=null,med=0;const rec=[];
 const run=()=>{for(let n=0;n<240&&i<N;n++,i++){const dt=i%40===39?.05:1/30;K.ArrowUp=true;K.ArrowLeft=((i/45|0)%4===0);K.ArrowRight=((i/45|0)%4===2);
   if(i%180===179&&pl){pl.vmode=pl.vmode==='4x4'?'car':'4x4';S.flip++}
   roamStep(dt);try{roamCam(dt)}catch(e){}const c=camera.position,d=Math.hypot(c.x-RO.x,c.z-RO.z),sp=Math.hypot(RO.x-px,RO.z-pz);
   if(i>120){if(Math.abs(RO.v)*3.6>10&&sp>Math.abs(RO.v)*dt*1.6+1.5)S.tele++;rec.push([d,pd==null?0:Math.abs(d-pd),i,Math.abs(RO.v)*3.6|0,pl&&pl.vmode])}px=RO.x;pz=RO.z;pd=d}
  if(i<N){setTimeout(run,0);return}
  K.ArrowUp=K.ArrowLeft=K.ArrowRight=false;const q=rec.map(r=>r[0]).sort((a,b)=>a-b);med=q[q.length>>1]||1;for(const r of rec){if(r[0]<.35*med||r[0]>2*med){S.band++;(S.bf=S.bf||[]).push(r[2]+':'+r[0].toFixed(1)+'@'+r[3]+r[4])}if(r[1]>med)S.step++}
  const pass=!S.tele&&!S.band&&!S.step;window.__chk.camst=S;
  say('📍 CAM STABLE · 60 s hitchy touch drive, '+S.flip+' form flips · teleports while moving '+S.tele+' · distance out of band '+S.band+' (median '+med.toFixed(1)+' m) · frame jumps > median '+S.step+ok(pass))};
 setTimeout(run,0);return'📍 CAM STABLE · 60 s scripted drive…'}
(function CAMST_reg(i){const C=window.__chk;if(C&&C.GO&&C.items){if(!C.items.some(q=>q.ver==='cam'&&q.id==='stable'))C.items.push({ver:'cam',id:'stable',area:'drive',text:'rv:2026-10-17 · cam/stable: 60 s hitchy touch drive in both cities: no teleports while moving, camera distance in its band'});
  C.GO['cam/stable']=['fra','ath'].map(c=>({c,n:'stable follow camera',secs:90,fn:()=>CAMST_go(window.__chk.goSay)}));return}
 if(i<600)setTimeout(()=>CAMST_reg(i+1),100)})(0);
