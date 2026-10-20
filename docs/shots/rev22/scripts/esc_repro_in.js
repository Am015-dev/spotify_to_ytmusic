(()=>{const out=[];const run=(name,x,z,h,v0,gas,secs,steer)=>{for(const k in K)K[k]=false;roamWarp(x,z,h);RO.x=x;RO.z=z;RO.h=RO.vh=h;RO.y=groundAt(x,z,99);RO.v=v0;ESC.E.age=0;ESC.E.ax=null;ESC.E.log=null;ESC.E.as=0;
 const n0=RO.t6n||0;let maxV=0,lifted=null,vAtLift=null,dist=0,px=RO.x,pz=RO.z;K.ArrowUp=!!gas;if(steer)K.ArrowLeft=true;
 for(let i=0;i<secs*30;i++){roamStep(1/30);maxV=Math.max(maxV,Math.abs(RO.v));dist+=Math.hypot(RO.x-px,RO.z-pz);px=RO.x;pz=RO.z;if((RO.t6n||0)>n0&&!lifted){lifted=+(i/30).toFixed(2);vAtLift=+maxV.toFixed(1)}}
 for(const k in K)K[k]=false;out.push({name,lifted,log:ESC.E.log,maxV:+maxV.toFixed(1),dist:Math.round(dist),end:[Math.round(RO.x),Math.round(RO.z)],onRoad:TR8_onRoad(RO.x,RO.z),clear:!roamHit(RO.x,RO.z,1.2,RO.y+.5),depthStart:+ESC_depth(x,z).toFixed(1)})};
 const C=CID==='fra';
 if(C){run('fra gentle basin 2100,400 gas from rest',2100,400,0,0,1,8);run('fra gentle basin 2100,400 at 20 m/s',2100,400,Math.PI/2,20,1,8);run('fra basin circle 15m/s steer',2100,400,0,15,1,8,1);run('fra 300,1780 at 20',300,1780,0,20,1,8)}
 else{run('ath -2530,1300 gas from rest',-2530,1300,0,0,1,8);run('ath -2530,1300 at 20 m/s',-2530,1300,1,20,1,8);run('ath -1990,820 circle',-1990,820,0,15,1,8,1)}
 // parked on a slope, no gas
 run(C?'fra wall -420,640 parked no gas':'ath 2690,-920 parked no gas',C?-420:2690,C?640:-920,0,0,0,8);
 return JSON.stringify(out)})()
