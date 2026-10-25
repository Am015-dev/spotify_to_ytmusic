// stkcam-r24m: GO cam/steady (lazy chunk, phone profile, fra + ath). Alex: "the car camera is zoom in and out".
// Stepped frames (dt 1/30, Math.random seeded), the full roamCam wrapper chain (wall pull-in, foliage pull, size fit, speed feel, juice) runs every frame.
// Two drives on the city race course line (building edges, ramps / Athens slopes): free roam (bot + two boosts + a scripted hairpin) and the same course as a city race.
// Measured: d = camera -> car distance (3D) and camera.fov, 0.1 s mean (drops the speed shake). Pass line, every 10 s window, both drives:
// d reverses direction (by >= 0.3 m) <= 4 times, FOV reverses (by >= 1 deg) <= 4 times; d grows (zoom out) <= 2 m/s; FOV changes <= 8 deg/s (0.5 s steps).
// A zoom IN may be fast (a wall right behind the car must pull the camera in at once); frames after a respawn / teleport start a new window.
const CST={A_D:.3,A_F:1,N:4,OUT:2,FR:8};
function CST_rev(a,A){let n=0,dir=0,hi=a[0],lo=a[0];for(const v of a){if(dir===0){hi=Math.max(hi,v);lo=Math.min(lo,v);if(v-lo>=A){dir=1;hi=v}else if(hi-v>=A){dir=-1;lo=v}}
  else if(dir>0){hi=Math.max(hi,v);if(hi-v>=A){n++;dir=-1;lo=v}}else{lo=Math.min(lo,v);if(v-lo>=A){n++;dir=1;hi=v}}}return n}
function CST_judge(S,tag){const sm=j=>S.map((_,i)=>{let a=0,n=0;for(let k=Math.max(0,i-1);k<=Math.min(S.length-1,i+1);k++){if(S[k][3]!==S[i][3])continue;a+=S[k][j];n++}return a/n});
  const D=sm(0),F=sm(1),r={tag,revD:0,revF:0,out:0,fr:0,win:0,dmin:1e9,dmax:0,fmin:1e9,fmax:0};
  for(let i=15;i<S.length;i++){if(S[i][3]!==S[i-15][3])continue;r.out=Math.max(r.out,(D[i]-D[i-15])*2);r.fr=Math.max(r.fr,Math.abs(F[i]-F[i-15])*2)}
  for(let i=0;i+300<=S.length;i+=30){if(S[i][3]!==S[i+299][3])continue;r.win++;r.revD=Math.max(r.revD,CST_rev(D.slice(i,i+300),CST.A_D));r.revF=Math.max(r.revF,CST_rev(F.slice(i,i+300),CST.A_F))}
  for(let i=0;i<S.length;i++){r.dmin=Math.min(r.dmin,D[i]);r.dmax=Math.max(r.dmax,D[i]);r.fmin=Math.min(r.fmin,F[i]);r.fmax=Math.max(r.fmax,F[i])}
  r.ok=r.win>=2&&r.revD<=CST.N&&r.revF<=CST.N&&r.out<=CST.OUT&&r.fr<=CST.FR;
  r.say=`${tag}: d ${r.dmin.toFixed(1)}-${r.dmax.toFixed(1)} m, reversals ${r.revD} (<= ${CST.N}), zoom-out ${r.out.toFixed(1)} m/s (<= ${CST.OUT}); FOV ${r.fmin.toFixed(0)}-${r.fmax.toFixed(0)}°, reversals ${r.revF} (<= ${CST.N}), ${r.fr.toFixed(1)}°/s (<= ${CST.FR}); ${r.win} windows`;return r}
// one drive: n frames, bot on the course line, boosts at 4-6.5 s and 15-17 s (10 s apart: one boost per judged window), a hard-left hairpin at 18-20.5 s (free roam only)
function CST_drive(G,sp,n,race){const bot=tkBot(G.pA,{lag:.15}),S=[];let seg=0,px=RO.x,pz=RO.z,r0=sp.resp||0;camSnap=true;
  for(let i=0;i<n&&RO.sp===(race?sp:RO.sp);i++){const t=i/30,dt=1/30;if(!race)sp.t=t;bot(sp);const bo=(t>4&&t<6.5)||(t>15&&t<17);K.ShiftLeft=bo;if(bo&&pl)pl.bm=100;
    if(!race&&t>18&&t<20.5){K.ArrowLeft=true;K.ArrowRight=false;K.ArrowUp=K.KeyW=true;K.ArrowDown=false}
    roamStep(dt);roamCam(dt);const c=camera.position,mv=Math.hypot(RO.x-px,RO.z-pz);if(mv>Math.abs(RO.v)*dt*1.6+1.5||(sp.resp||0)!==r0||camSnap){seg++;r0=sp.resp||0}px=RO.x;pz=RO.z;
    S.push([Math.hypot(c.x-RO.x,c.y-RO.y,c.z-RO.z),camera.fov,Math.abs(RO.v),seg])}
  K.ShiftLeft=K.ArrowUp=K.KeyW=K.ArrowLeft=K.ArrowRight=K.ArrowDown=false;return S}
function CST_go(){const rnd0=Math.random;let sd=4242;Math.random=()=>(sd=(sd*16807)%2147483647)/2147483647;const R=[];window.__chk.cst=R;
  try{const ev=tkWorldEvs()[0],m=ev&&tkMarkOf(ev),C=m&&tkCourseOf(m);if(!C)return'📍 CAM STEADY · no city course ❌';const G=tkGeoOf(C);
    // free roam: start on the course line, no race
    try{if(RO.sp)sprintEnd()}catch(e){}const q=tkAt(G.pA,0);RO.x=q.x;RO.z=q.z;RO.y=groundAt(q.x,q.z,99);RO.h=RO.vh=q.h;RO.v=0;RO.vy=0;camSnap=true;
    const fsp={cd:0,done:false,t:0};const S1=CST_drive(G,fsp,660,false);const r1=CST_judge(S1,'free roam');r1.tr=S1.map(s=>[+s[0].toFixed(2),+s[1].toFixed(1),+s[2].toFixed(0),s[3]]);R.push(r1);
    // city race on the same course
    tkStart(m,C);const sp=RO.sp;sp.cd=0;const S2=CST_drive(G,sp,600,true);const r2=CST_judge(S2,'city race');r2.tr=S2.map(s=>[+s[0].toFixed(2),+s[1].toFixed(1),+s[2].toFixed(0),s[3]]);R.push(r2);
    try{$('#spRes').hidden=true}catch(e){}try{if(RO.sp===sp)sprintEnd()}catch(e){}}
  catch(e){R.push({ok:false,say:'threw '+String(e).slice(0,160)})}finally{Math.random=rnd0;K.ShiftLeft=K.ArrowUp=K.KeyW=K.ArrowLeft=K.ArrowRight=K.ArrowDown=false}
  const ok=R.length===2&&R.every(r=>r.ok);return`📍 CAM STEADY · ${R.map(r=>(r.ok?'✓ ':'✗ ')+r.say).join(' · ')} → ${ok?'✅ PASS':'❌ FAIL'}`}
window.__cst={go:()=>CST_go(),C:CST,pose:n=>{const ev=tkWorldEvs()[0],m=ev&&tkMarkOf(ev),C=m&&tkCourseOf(m),G=tkGeoOf(C),q=tkAt(G.pA,0);RO.x=q.x;RO.z=q.z;RO.y=groundAt(q.x,q.z,99);RO.h=RO.vh=q.h;RO.v=0;RO.vy=0;const S=CST_drive(G,{cd:0,done:false,t:0},n,false);return S[S.length-1]},   // shots: free roam drive to frame n
 pos:()=>{const c=camera.position,m=pl.mesh.position;return{cam:[c.x,c.y,c.z].map(v=>+v.toFixed(1)),ro:[RO.x,RO.y,RO.z].map(v=>+v.toFixed(1)),mesh:[m.x,m.y,m.z].map(v=>+v.toFixed(1)),fov:+camera.fov.toFixed(1),st:state}},
 tog:(c,on)=>{try{if(/nofc/.test(c))FC.pull=on}catch(e){}try{if(/noju/.test(c))JU.on=on}catch(e){}try{if(/nosf/.test(c))SF.on=on}catch(e){}try{if(/nocam/.test(c))CAM.on=on?1:0}catch(e){}try{if(/nostk/.test(c))window.__skc.on=on}catch(e){}}};   // probe toggles (off = layer disabled)
(function CST_reg(i){const C=window.__chk;if(C&&C.GO&&C.items){if(!C.items.some(q=>q.ver==='cam'&&q.id==='steady'))C.items.push({ver:'cam',id:'steady',area:'drive',text:'stkcam-r24m · cam/steady: free roam + city race on the course line (building edges, boosts, slopes, a hairpin): the chase camera distance and FOV never pump (<= 4 reversals per 10 s, zoom-out <= 2 m/s, FOV <= 8°/s)'});
  C.GO['cam/steady']=['fra','ath'].map(c=>({c,n:'steady chase camera',secs:120,fn:()=>CST_go()}));return}
 if(i<600)setTimeout(()=>CST_reg(i+1),100)})(0);
({CST_judge})
