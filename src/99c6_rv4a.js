// rv4A (docs/REVIEW_2K_4.md top 10 #1 #3): GOs rv2k4/ath-cam and ath-spawn. State asserts only, stepped frames (fixed dt 1/30, every 40th frame the 50 ms clamp), Math.random seeded, no real clock.
// ath-cam: 120 s road-following drive from the Athens spawn; camera-to-car distance swings >= 2 m (zig-zag extremes of the 0.3 s smoothed distance) must be <= 1.5 per minute.
// ath-spawn: from the spawn, gas held and the road-follow law steering: >= 90 km/h within 10 s, and the first 300 m of road ahead has no dead end (the car keeps moving, never < 15 km/h after 4 s).
function RV4A_drive(sec,on){const rnd0=Math.random;let sd=4242;Math.random=()=>(sd=(sd*16807)%2147483647)/2147483647;const W=a=>Math.atan2(Math.sin(a),Math.cos(a)),N=Math.round(sec*30);
 try{for(let i=0;i<N;i++){const dt=i%40===39?.05:1/30,la=12+RO.v*.9,q=rfSnap(RO.x+Math.sin(RO.h)*la,RO.z+Math.cos(RO.h)*la,60),e=q?W(Math.atan2(q[0]-RO.x,q[1]-RO.z)-RO.h):0;
   K.ArrowUp=true;K.ArrowLeft=e>.06;K.ArrowRight=e<-.06;roamStep(dt);try{roamCam(dt)}catch(er){}if(on(i,dt)===false)break}}
 finally{K.ArrowUp=K.ArrowLeft=K.ArrowRight=false;Math.random=rnd0}}
function RV4A_go(kind){const ok=b=>b?' ✅':' ❌',FC=window.__fcam;
 if(kind==='cam'){const ds=[],pk=[];let f0=FC?FC.pulls:0;RV4A_drive(120,(i)=>{const c=camera.position;ds.push(Math.hypot(c.x-RO.x,c.y-RO.y,c.z-RO.z));pk.push(FC?FC.k:1)});
  const sm=ds.map((_,i)=>{let s=0,n=0;for(let k=Math.max(0,i-4);k<=i;k++){s+=ds[k];n++}return s/n});   // 0.3 s smoothing
  let sw=0,ex=sm[0],dir=0,swP=0;const sws=[];for(let i=1;i<sm.length;i++){const d=sm[i]-ex;if(!dir){if(Math.abs(d)>=2){dir=Math.sign(d);sw++;ex=sm[i];sws.push(i)}else if(d*(sm[i]-sm[i-1])<0&&Math.abs(d)<.01)ex=sm[i]}else if(Math.sign(sm[i]-ex)===dir){ex=sm[i]}else if(Math.abs(sm[i]-ex)>=2){dir=-dir;sw++;ex=sm[i];sws.push(i)}}
  for(const i of sws)if(pk[i]<.999||pk[Math.max(0,i-15)]<.999)swP++;
  window.__chk.rv4cam={sw,swP,sws,ds:ds.map(d=>Math.round(d*10)/10),pk:pk.map(k=>Math.round(k*100)/100)};
  const pm=sw/2,mn=Math.min(...ds),mx=Math.max(...ds);
  return '📍 ATH CAMERA · 120 s road-follow from the spawn, stepped frames · distance swings >= 2 m: '+sw+' ('+pm.toFixed(1)+'/min, near a pull-in '+swP+'; max 1.5/min) · distance '+mn.toFixed(1)+'-'+mx.toFixed(1)+' m · pull-in frames '+((FC?FC.pulls:0)-f0)+ok(pm<=1.5)}
 if(kind==='spawn'){const x0=RO.x,z0=RO.z;let t10=-1,vmax=0,lowAt=-1,dist=0,px=RO.x,pz=RO.z;RV4A_drive(25,(i,dt)=>{const v=Math.abs(RO.v)*3.6;vmax=Math.max(vmax,v);dist+=Math.hypot(RO.x-px,RO.z-pz);px=RO.x;pz=RO.z;const t=(i+1)/30;if(t10<0&&v>=90)t10=t;if(t>6&&dist<300&&v<15&&lowAt<0)lowAt=dist;if(dist>=300&&t10>=0)return false});
  const good=t10>=0&&t10<=10&&lowAt<0&&dist>=300;
  return '📍 ATH SPAWN · from ('+Math.round(x0)+','+Math.round(z0)+') gas held, road-follow · 90 km/h '+(t10>=0?'after '+t10.toFixed(1)+' s':'never')+' (max 10 s) · top '+Math.round(vmax)+' km/h · '+Math.round(dist)+' m driven'+(lowAt>=0?' · STOPPED at '+Math.round(lowAt)+' m':'')+ok(good)}
 return'?'}
(function RV4A_reg(i){const C=window.__chk;if(C&&C.GO&&C.items){if(!C.items.some(q=>q.ver==='rv2k4'&&q.id==='ath-cam')){C.items.push({ver:'rv2k4',id:'ath-cam',area:'drive',text:'rv:2026-10-17 · ATHENS CAMERA: 120 s road-follow from the spawn, stepped frames: camera distance swings >= 2 m <= 1.5 per minute'},{ver:'rv2k4',id:'ath-spawn',area:'drive',text:'rv:2026-10-17 · ATHENS SPAWN: on a wide main road: >= 90 km/h within 10 s, no dead end in the first 300 m'});}
  C.GO['rv2k4/ath-cam']=[{c:'ath',n:'ath camera swings',secs:60,fn:()=>RV4A_go('cam')}];C.GO['rv2k4/ath-spawn']=[{c:'ath',n:'ath spawn road',secs:30,fn:()=>RV4A_go('spawn')}];return}
 if(i<600)setTimeout(()=>RV4A_reg(i+1),100)})(0);
