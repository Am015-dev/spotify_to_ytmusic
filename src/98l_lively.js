// ===== LV (lively, v88n): Alex "the game is quite boring and repetitive, check how 2K Drive looks and make it more lively". Research + before/after: docs/research/LIVELY_2K.md
// Measured on v88i (5 Frankfurt + 5 Athens street spots, 852×393): 0-1 pedestrians and 0 traffic cars in view, nothing moving, pastel facades.
// Life, not clutter (lesson 5): nothing new stands on a drivable surface except pigeons that fly off before the car arrives.
//  1 · pedestrians and traffic kept near the player (same pools, placed within sight instead of spread over the whole city); pavement minifigs wave as you pass
//  2 · pigeon flocks on the pavement that scatter when you come close + gulls circling over the city
//  3 · flags on rooftops flapping in the wind (Frankfurt red/white, German, EU; Athens blue/white)
//  4 · a LEGO blimp circling over each city
//  5 · Frankfurt: boats cruising on the Main (soft collision, the car is pushed off like a traffic car)
//  6 · bolder LEGO facade colours (Frankfurt districts + Athens units), knob 0 = the old pastel tints
// Every count scales with TUNE.life (master "World life") × its own knob (⚙ TUNE → Life). All new meshes are instanced: +9 draw calls in Frankfurt (birds 2, flags 5, blimp 1, boats 1), +7 in Athens.
const LV={init:false,t:0,fr:0,birds:null,flags:null,blimp:null,boats:null,n:{}};
const LV_d=k=>Math.max(0,TUNE.life*(k==null?1:TUNE[k]));
// ---------- 1 · people and traffic near the player (60_city_build.js pedStep/hubRecycle read these)
// pedestrians: re-placed 35-170 m around the player once they are 200 m away (was 120-380 m / 460 m in Frankfurt: 70 people over ~1 km² = none in view)
function LV_pedFar(){const d=LV_d('lvPed');return d<=0?(CID==='fra'?460:260):(CID==='fra'?200:180)}
function LV_pedPut(p){const d=LV_d('lvPed');if(d<=0){CID==='fra'?pedPlace(p,120,380):pedPlace(p,60,220);return}const i=LV_near(30,160,.7);if(i<0){pedPlace(p,35,170);p.yc=0;p.y=(RO.y||0)+40;return}const n=HUB.nodes[i];if(n.ab||!n.nb.length)return;p.a=i;p.b=n.nb[Math.floor(R()*n.nb.length)];p.t=R();p.dir=1;p.side=R()<.5?-1:1;p.jy=0;p.jv=0;p.spin=0;p.jx=p.jz=0;p.yc=0;p.y=(RO.y||0)+40}
// a street node min-max m away, in front of the car (±60°) with probability pa
function LV_near(min,max,pa){const fx=Math.sin(RO.h),fz=Math.cos(RO.h),want=R()<pa;let i=-1;for(let k=0;k<8;k++){i=hubNear(min,max,false);if(i<0)return -1;if(!want)return i;const n=HUB.nodes[i],dx=n.x-RO.x,dz=n.z-RO.z;if(dx*fx+dz*fz>Math.hypot(dx,dz)*.5)return i}return i}
// active pedestrians: 70 at 1, up to PED_N (110) at 1.6; knob 0 = the v88i 70, spread over the city
function LV_pn(n){if(TUNE.life<=0||TUNE.lvPed<=0)return Math.min(n,70);const k=Math.round(70*LV_d('lvPed'));return Math.max(0,Math.min(n,k))}
// wave: arms up and waving when the car passes within 16 m (2 of 3 people), never while leaping
const LV_wave=(i,d,sp)=>TUNE.lvWave&&LV_d('lvPed')>0&&d<16&&sp>4&&i%3!==0;
// traffic: cars further than 300 m are moved to streets 100-260 m around, half of them ahead (was 650 / 480 m → 180-480 m, behind)
function LV_trFar(){const d=LV_d('lvTraf');return d<=0?(CID==='fra'?650:480):300}
function LV_trNear(){const d=LV_d('lvTraf');return d<=0?(CID==='fra'?hubNear(180,480,true):hubNear(130,400,true)):R()<.5?LV_near(130,260,1):hubNear(100,260,true)}
// ---------- 6 · bolder facade colours: the district tints (90 CV_FP) were near-white pastels; mixed toward LEGO colours by TUNE.lvFac (read once, at city build)
const LV_FAC={bank:['#5fa8e0','#4cc8b8','#e8c070','#8fb4e0','#3f86d0','#f2f2f2','#7cc890'],old:['#ffe39a','#f6b48a','#fff0c8','#f2a0a0','#d8e8f0','#ffd060'],grz:['#e8826a','#f0c070','#d89870','#c8a0b8','#f4dca0','#9ab8d8'],off:['#a8c0d8','#e8ecf0','#7ea8d0','#98c8b0','#f0f0f0'],ware:['#c85a38','#a84a30','#d87850','#904030','#c89060'],mix:['#ff9a8a','#ffd070','#8ac0ff','#9ae08a','#ffb0d0','#fff0a0','#c0a8ff']};
{const k=Math.max(0,Math.min(1,TUNE.lvFac*Math.min(1,TUNE.life))),c=new THREE.Color(),c2=new THREE.Color();if(k>0)for(const s in CV_FP)CV_FP[s]=CV_FP[s].map((h,i)=>'#'+c.set(h).lerp(c2.set(LV_FAC[s][i%LV_FAC[s].length]),k).getHexString())}
// Athens: whitewashed concrete stays mostly white (real); neoclassical + Plaka houses get the warm ochre / terracotta / pink / sky blue of the real old town, at 0.6 × the knob
const LV_AFAC={poly:['#ffffff','#ffe2a8','#ffc890','#f4f0e8','#ffc8b8','#c8e4f4','#f0c8a0','#ffe080','#c8e8b8','#ffd8c8','#b8d0e8','#f0b080'],neo:['#ffd890','#ffc060','#f0b070','#f08868','#f8a8a0','#e8b880','#fff0d0','#f0c080','#b8d8a8'],
  plaka:['#ffffff','#ffd890','#f0a868','#a8d8f8','#ffb8a0','#ffffff','#ffe070','#f09860'],villa:['#ffffff','#fff4d8','#ffe8c0','#ffffff','#ffd8a8','#d8ecf8','#ffe0c8']};
{const k=.6*Math.max(0,Math.min(1,TUNE.lvFac*Math.min(1,TUNE.life))),c=new THREE.Color(),c2=new THREE.Color();if(k>0)for(const s in LV_AFAC)if(CV_AP[s])CV_AP[s]=CV_AP[s].map((h,i)=>'#'+c.set(h).lerp(c2.set(LV_AFAC[s][i%LV_AFAC[s].length]),k).getHexString())}
// ---------- shared
const _lvM=new THREE.Matrix4(),_lvQ=new THREE.Quaternion(),_lvE=new THREE.Euler(),_lvP=new THREE.Vector3(),_lvS=new THREE.Vector3(),_lvZ=new THREE.Matrix4().makeScale(0,0,0);
const LV_mat=()=>new THREE.MeshStandardMaterial({vertexColors:true,roughness:.45});
function LV_im(geo,n){const m=new THREE.InstancedMesh(geo,LV_mat(),Math.max(1,n));m.frustumCulled=false;m.castShadow=false;m.receiveShadow=false;for(let i=0;i<m.count;i++)m.setMatrixAt(i,_lvZ);HUB.grp.add(m);return m}
const LV_set=(m,i,x,y,z,rx,ry,rz,s)=>{_lvE.set(rx,ry,rz,'YXZ');_lvQ.setFromEuler(_lvE);_lvM.compose(_lvP.set(x,y,z),_lvQ,_lvS.set(s,s,s));m.setMatrixAt(i,_lvM)};
// a pavement spot near a street node: 'ahead' = in front of the car
function LV_spot(min,max,ahead){const i=hubNear(min,max,false);if(i<0)return null;const N=HUB.nodes,A=N[i],B=N[A.nb&&A.nb.length?A.nb[0]:i];if(!A||!B||A.ab)return null;
  if(ahead){const fx=Math.sin(RO.h),fz=Math.cos(RO.h),dx=A.x-RO.x,dz=A.z-RO.z;if(dx*fx+dz*fz<Math.hypot(dx,dz)*.3)return null}
  const L=Math.hypot(B.x-A.x,B.z-A.z)||1,dx=(B.x-A.x)/L,dz=(B.z-A.z)/L,t=R()*.8*L,sd=R()<.5?-1:1,off=(Math.min(A.w||20,B.w||20)/2)+(CID==='fra'?3.4:2.3);
  const x=A.x+dx*t-dz*off*sd,z=A.z+dz*t+dx*off*sd;return{x,z,y:Math.max(0,groundAt(x,z,(RO.y||0)+20))}}
// ---------- 2 · birds: pigeon flocks (grey, on the pavement) + gulls (white, circling 26-40 m up). One body + one wing mesh for all.
const LV_PF=6,LV_PB=7,LV_GF=3,LV_GB=4;
function LV_birdInit(){const nb=LV_PF*LV_PB+LV_GF*LV_GB;
  // ~0.55 m chunky LEGO bird (readable at 30 m), white vertex colours tinted per instance
  const body=mergeG([cbox(.26,.24,.44,0,.2,0,'#ffffff'),cbox(.2,.2,.2,0,.38,.22,'#ffffff'),cbox(.07,.05,.12,0,.36,.37,'#f0a020'),cbox(.18,.05,.16,0,.24,-.28,'#ffffff')]);
  const wing=mergeG([cbox(.36,.04,.22,.2,0,0,'#ffffff'),cbox(.36,.04,.22,-.2,0,0,'#ffffff')]);
  const B=LV.birds={b:LV_im(body,nb),w:LV_im(wing,nb),fl:[],c:new THREE.Color()};
  for(let f=0;f<LV_PF+LV_GF;f++){const gull=f>=LV_PF,n=gull?LV_GB:LV_PB,F={gull,st:0,x:0,z:0,y:0,t:0,on:false,b:[]};
    for(let j=0;j<n;j++){const k=B.fl.reduce((a,q)=>a+q.b.length,0)+j;F.b.push({k,ox:rr(-2.2,2.2),oz:rr(-2.2,2.2),h:R()*6.3,ph:R()*6.3,x:0,y:0,z:0,vx:0,vy:0,vz:0});
      B.c.set(gull?'#f4f6f8':['#8a8f9a','#9aa0aa','#7a808c','#b0a8a0'][j%4]);B.b.setColorAt(k,B.c);B.c.set(gull?'#d8dde4':['#6a707c','#7a808a','#5a606c'][j%3]);B.w.setColorAt(k,B.c)}
    B.fl.push(F)}B.b.instanceColor.needsUpdate=true;B.w.instanceColor.needsUpdate=true}
function LV_birdStep(dt){const B=LV.birds;if(!B)return;const d=LV_d('lvBird'),act=Math.round(LV_PF*Math.min(1.5,d)),now=LV.t,sp=Math.abs(RO.v);
  for(let f=0;f<B.fl.length;f++){const F=B.fl[f],want=F.gull?d>0&&f-LV_PF<Math.ceil(LV_GF*Math.min(1,d)):f<act;
    const far=F.on&&Math.hypot(F.x-RO.x,F.z-RO.z)>(F.gull?380:240);
    if(!want||far||(F.on&&F.st===2&&F.t>6)){if(F.on){F.on=false;for(const b of F.b){B.b.setMatrixAt(b.k,_lvZ);B.w.setMatrixAt(b.k,_lvZ)}}if(!want)continue}
    if(!F.on){if((LV.fr+f)%20)continue;const s=LV_spot(F.gull?60:28,F.gull?200:95,!F.gull);if(!s)continue;F.on=true;F.st=F.gull?3:0;F.t=0;F.x=s.x;F.z=s.z;F.y=s.y;
      for(const b of F.b){b.x=s.x+b.ox;b.z=s.z+b.oz;b.y=F.gull?s.y+rr(26,40):Math.max(0,groundAt(b.x,b.z,s.y+3));b.vx=b.vy=b.vz=0}}
    F.t+=dt;const dx=F.x-RO.x,dz=F.z-RO.z,dd=Math.hypot(dx,dz);
    // pigeons: scatter when the car comes within 22 m (any speed > 3 m/s) or 9 m (standing); also when a pedestrian leaps nearby is not tracked (cheap)
    if(F.st===0&&(dd<(sp>3?22:9))){F.st=2;F.t=0;const al=dd||1;for(const b of F.b){const a=Math.atan2(dx/al+rr(-.7,.7),dz/al+rr(-.7,.7)),v=rr(5,9);b.vx=Math.sin(a)*v;b.vz=Math.cos(a)*v;b.vy=rr(4,7);b.h=a}if(dd<14&&R()<.6)AU.sfx('pick')}
    for(const b of F.b){let y,fl,pitch=0;
      if(F.st===3){const a=now*.35+b.ph,r=14+b.ox*3;b.x=F.x+Math.sin(a)*r;b.z=F.z+Math.cos(a)*r;y=b.y+Math.sin(now*.8+b.ph)*1.2;b.h=a+Math.PI/2;fl=Math.sin(now*9+b.ph)*.5*(Math.sin(now*.7+b.ph)>.3?1:.15)}
      else if(F.st===2){b.vy-=2.2*dt;if(b.vy<1.5)b.vy=1.5;b.x+=b.vx*dt;b.y+=b.vy*dt;b.z+=b.vz*dt;y=b.y;fl=Math.sin(now*26+b.ph)*.9;pitch=-.35}
      else{// grounded: peck (body pitch) and shuffle
        const pk=Math.max(0,Math.sin(now*3+b.ph*3));pitch=pk*.5;b.h+=Math.sin(now*.6+b.ph)*dt*.8;y=b.y;fl=.05}
      const sc=F.gull?2.2:1.5;LV_set(B.b,b.k,b.x,y,b.z,pitch,b.h,0,sc);LV_set(B.w,b.k,b.x,y+.3*sc,b.z,pitch,b.h,fl,sc)}}
  B.b.instanceMatrix.needsUpdate=true;B.w.instanceMatrix.needsUpdate=true}
// ---------- 3 · rooftop flags: pole + cloth, the cloth swings about the pole and ripples (scale) in the wind. Roofs 9-60 m up, one per 60 m cell.
// A pool of 36 flags (× knob) sits on the nearest such roofs within 380 m of the player; re-picked every second as you drive.
function LV_flagInit(){const P=Math.round(36*Math.min(2,LV_d('lvFlag')));if(P<=0)return;const C=[],grid=new Set();
  for(const b of HUB.bld){if(!b||b.hw==null||b.hw<3||b.hd<3)continue;const hh=b.h-(b.trY||0);if(!(hh>9&&hh<60))continue;const gk=Math.floor(b.x/60)+'|'+Math.floor(b.z/60);if(grid.has(gk))continue;grid.add(gk);C.push([b.x,b.h,b.z])}
  if(!C.length)return;const pole=mergeG([ccyl(.07,.09,5,0,2.5,0,'#e8e8e8',6),cbox(.22,.22,.22,0,5.05,0,'#ffd12c')]);
  const D=CID==='fra'?[['#d01818','#ffffff','#d01818'],['#1a1a1a','#d01818','#ffcc00'],['#1f4fbf','#1f4fbf','#1f4fbf'],['#ffffff','#d01818','#ffffff']]:[['#1f5fbf','#ffffff','#1f5fbf'],['#ffffff','#1f5fbf','#ffffff'],['#1f5fbf','#1f5fbf','#ffffff']];
  // cloth 2.4 × 1.5 m in three horizontal stripes, x from the pole outwards (pivot at the pole); one mesh per design keeps the stripes in vertex colours
  const cg=mergeG([0,1,2].map(r=>cbox(2.4,.5,.05,1.2,4.55-r*.5,0,'#ffffff'))),nC=cg.attributes.position.count;
  const F=LV.flags={p:LV_im(pole,P),c:null,C,L:[],P,ph:[...Array(P)].map(()=>R()*6.3)};
  F.c=D.map(d=>{const g=cg.clone(),A=g.attributes.color,c=new THREE.Color();for(let v=0;v<nC;v++){c.set(d[Math.floor(v/(nC/3))]);A.setXYZ(v,c.r,c.g,c.b)}return LV_im(g,Math.ceil(P/D.length))});LV.n.flags=C.length}
const LV_FS=1.35; // flag scale (a 6.8 m pole + 3.2 × 2 m flag reads from the street)
function LV_flagPick(){const F=LV.flags,x=RO.x,z=RO.z,near=[];for(const q of F.C){const d=(q[0]-x)**2+(q[2]-z)**2;if(d<380*380)near.push([d,q])}near.sort((a,b)=>a[0]-b[0]);
  F.L=near.slice(0,F.P).map(e=>e[1]);for(let i=0;i<F.P;i++){const q=F.L[i];if(q)LV_set(F.p,i,q[0],q[1],q[2],0,0,0,LV_FS);else F.p.setMatrixAt(i,_lvZ)}F.p.instanceMatrix.needsUpdate=true}
function LV_flagStep(){const F=LV.flags;if(!F)return;if(LV.fr%60===1||!F.L.length&&LV.fr%20===1)LV_flagPick();const t=LV.t,D=F.c.length;
  for(let i=0;i<F.P;i++){const q=F.L[i],m=F.c[i%D],j=Math.floor(i/D);if(!q){m.setMatrixAt(j,_lvZ);continue}const w=t*2.2+F.ph[i];_lvE.set(0,.9+Math.sin(w)*.35+Math.sin(w*2.7)*.12,Math.sin(w*1.7)*.04,'YXZ');_lvQ.setFromEuler(_lvE);
    _lvM.compose(_lvP.set(q[0],q[1],q[2]),_lvQ,_lvS.set(LV_FS*(.82+Math.sin(w*3.1)*.18),LV_FS,LV_FS));m.setMatrixAt(j,_lvM)}
  for(const m of F.c)m.instanceMatrix.needsUpdate=true}
// ---------- 4 · blimp: 46 m LEGO airship circling the city centre at 150 m (one merged mesh, no shadow, no collider: it is in the sky)
function LV_blimpInit(){if(LV_d('lvBlimp')<=0)return;const env=new THREE.SphereGeometry(1,18,12);env.scale(23,8.5,8.5);env.rotateY(Math.PI/2);colorize(env,new THREE.Color(CID==='fra'?'#f2f2f2':'#f4f4f0'));
  const ac=CID==='fra'?'#d01818':'#1f5fbf',parts=[env,cbox(.4,7,6,0,4,-19,ac),cbox(.4,7,6,0,-4,-19,ac),cbox(7,.4,6,4,0,-19,ac),cbox(7,.4,6,-4,0,-19,ac),
   cbox(17.4,3,.3,0,0,8.4,ac),cbox(17.4,3,.3,0,0,-8.4,ac).rotateY(0),cbox(.3,3,17.4,8.45,0,1,ac),cbox(.3,3,17.4,-8.45,0,1,ac),
   cbox(3.2,2,7,0,-9.4,1,'#ffd12c'),cbox(3.3,.8,6.2,0,-9,1.2,'#5fc8ff'),ccyl(.9,.9,1,0,-10.6,1,'#333333',8)];
  // stud row on the top seam (LEGO cue)
  for(let z=-16;z<=16;z+=4)parts.push(ccyl(.9,.9,.6,0,8.6-Math.abs(z)*.06,z,'#ffd12c',10));
  const g=mergeG(parts),m=new THREE.Mesh(g,LV_mat());m.frustumCulled=false;HUB.grp.add(m);
  let cx=0,cz=0,n=0;for(const b of HUB.bld){if(!b)continue;cx+=b.x;cz+=b.z;n++}cx/=Math.max(1,n);cz/=Math.max(1,n);LV.blimp={m,cx,cz,r:CID==='fra'?520:420}}
function LV_blimpStep(){const B=LV.blimp;if(!B)return;B.m.visible=LV_d('lvBlimp')>0;const a=LV.t*.016,x=B.cx+Math.sin(a)*B.r,z=B.cz+Math.cos(a)*B.r;
  B.m.position.set(x,150+Math.sin(LV.t*.3)*3,z);B.m.rotation.set(0,a+Math.PI/2,Math.sin(LV.t*.25)*.03)}
// ---------- 5 · boats on the Main (Frankfurt): small LEGO cruisers along the river centreline, both directions, soft collision with the player
function LV_boatInit(){if(CID!=='fra'||typeof MAINR==='undefined'||!MAINR||!MAINR.pts||MAINR.pts.length<8)return;const n=Math.round(5*Math.min(2,LV_d('lvBoat')));if(n<=0)return;
  const g=mergeG([cbox(3.4,1.2,10,0,.3,0,'#ffffff'),cbox(3.4,.4,10,0,-.3,0,'#d01818'),cbox(2.4,.9,1.8,0,.3,5.6,'#ffffff'),cbox(2.6,1.6,4.6,0,1.7,-.8,'#2f6fd0'),cbox(2.7,.7,4.7,0,1.9,-.8,'#9ad8ff'),cbox(3,.3,5,0,2.65,-.8,'#ffffff'),ccyl(.35,.35,1.1,0,3.3,-2.4,'#ffd12c',8)]);
  const S=MAINR,L=S.L||S.pts[S.pts.length-1].s,bt=[];for(let i=0;i<n;i++)bt.push({s:L*(i+.5)/n,dir:i%2?1:-1,v:rr(5,8),x:0,z:0,h:0,rb:R()*6});
  const m=LV_im(g,n);const c=new THREE.Color();bt.forEach((b,i)=>{m.setColorAt(i,c.set(['#ffffff','#ffe0a0','#d8f0ff','#ffd0d0','#e0ffe0'][i%5]))});m.instanceColor.needsUpdate=true;LV.boats={m,bt,L};LV.n.boats=n}
function LV_rivPt(s){const P=MAINR.pts;let lo=0,hi=P.length-1;while(hi-lo>1){const mi=(lo+hi)>>1;if(P[mi].s<=s)lo=mi;else hi=mi}const p=P[lo];return{x:p.x+p.tx*(s-p.s),z:p.z+p.tz*(s-p.s),tx:p.tx,tz:p.tz,hw:p.hw}}
function LV_boatStep(dt){const B=LV.boats;if(!B)return;const L=B.L;
  for(let i=0;i<B.bt.length;i++){const b=B.bt[i];b.s+=b.v*b.dir*dt;if(b.s>L-30){b.s=L-30;b.dir=-1}if(b.s<30){b.s=30;b.dir=1}
    const p=LV_rivPt(b.s),side=-b.dir*Math.min(p.hw*.45,22);b.x=p.x+p.tz*side;b.z=p.z-p.tx*side;b.h=Math.atan2(p.tx*b.dir,p.tz*b.dir);
    if(b.gy==null||(LV.fr+i)%30===0)b.gy=groundAt(b.x,b.z,40);const y=b.gy+Math.sin(LV.t*1.3+b.rb)*.08;LV_set(B.m,i,b.x,y,b.z,Math.sin(LV.t*1.1+b.rb)*.02,b.h,Math.sin(LV.t*.9+b.rb)*.03,1);
    // soft collision: the player is pushed out of a 10 × 3.4 m hull box (+ car radius), loses some speed; same feel as a glancing hit
    const dx=RO.x-b.x,dz=RO.z-b.z;if(dx*dx+dz*dz<64&&Math.abs((RO.y||0)-y)<3){const fx=Math.sin(b.h),fz=Math.cos(b.h),lz=dx*fx+dz*fz,lx=dx*fz-dz*fx,ox=1.7+1.1-Math.abs(lx),oz=5+1.1-Math.abs(lz);
      if(ox>0&&oz>0){if(ox<oz){const s=Math.sign(lx)||1;RO.x+=fz*ox*s;RO.z-=fx*ox*s}else{const s=Math.sign(lz)||1;RO.x+=fx*oz*s;RO.z+=fz*oz*s}RO.v*=.9;if(!b.bump||LV.t-b.bump>1){b.bump=LV.t;AU.sfx('bump')}}}}
  B.m.instanceMatrix.needsUpdate=true}
// ---------- init + per-frame (runs after the traffic step; free roam only)
function LV_init(){if(LV.init||!HUB.grp||!HUB.nodes||!HUB.nodes.length||!HUB.bld||!HUB.bld.length)return;LV.init=true;
  try{LV_birdInit()}catch(e){console.warn('LV birds',e)}try{LV_flagInit()}catch(e){console.warn('LV flags',e)}try{LV_blimpInit()}catch(e){console.warn('LV blimp',e)}try{LV_boatInit()}catch(e){console.warn('LV boats',e)}}
function LV_step(dt){if(!RO.on)return;LV_init();if(!LV.init)return;LV.t+=dt;LV.fr++;const t0=performance.now();
  LV_birdStep(dt);LV_flagStep();LV_blimpStep();LV_boatStep(dt);LV.ms=LV.ms==null?0:LV.ms*.95+(performance.now()-t0)*.05}
{const _lvHT=hubTrafficStep;hubTrafficStep=dt=>{_lvHT(dt);LV_step(dt)}}
window.__lv={LV,n:()=>({peds:HUB.peds?LV_pn(HUB.peds.length):0,flags:LV.flags?LV.flags.L.length:0,roofs:LV.n.flags||0,boats:LV.n.boats||0,birds:LV.birds?LV.birds.fl.filter(f=>f.on).length:0,blimp:!!LV.blimp,ms:LV.ms}),
  view:()=>{// people / cars / birds / boats inside the camera view within 120 m (the "is anything happening" count of the research doc)
    const fr=new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse)),v=new THREE.Vector3(),c={peds:0,cars:0,birds:0,boats:0},inV=(x,y,z)=>fr.containsPoint(v.set(x,y+1,z))&&v.distanceTo(camera.position)<120;
    for(const p of HUB.peds||[])if(p._x!=null&&inV(p._x,p.y,p._z))c.peds++;for(const k of HUB.cars||[])if(k.dead<=0&&inV(k.x,k.y||0,k.z))c.cars++;
    if(LV.birds)for(const F of LV.birds.fl)if(F.on)for(const b of F.b)if(inV(b.x,b.y,b.z))c.birds++;if(LV.boats)for(const b of LV.boats.bt)if(inV(b.x,0,b.z))c.boats++;return c}};
