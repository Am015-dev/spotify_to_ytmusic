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
function LV_pedPut(p){const d=LV_d('lvPed');if(d<=0){CID==='fra'?pedPlace(p,120,380):pedPlace(p,60,220);return}if(p.cw)return;const c=LV_edges(30,160,R()<.7?.5:-2),E=c[0];if(!E){pedPlace(p,35,170);p.yc=0;p.y=(RO.y||0)+40;return}p.a=E.i;p.b=E.bi;p.t=E.s/E.L;p.dir=1;p.side=R()<.5?-1:1;p.jy=0;p.jv=0;p.spin=0;p.jx=p.jz=0;p.yc=0;p.y=(RO.y||0)+40}
// a street node min-max m away, in front of the car (±60°) with probability pa
function LV_near(min,max,pa){const c=LV_ahead(min,max,R()<pa?.5:-2);return c.length?c[0]:-1}
// active pedestrians: 70 at 1, up to PED_N (110) at 1.6; knob 0 = the v88i 70, spread over the city
function LV_pn(n){return Math.min(n,LV_walk(n)+(LV.cl?LV_crowdN():0))}
// wave: arms up and waving when the car passes within 16 m (2 of 3 people), never while leaping
const LV_wave=(i,d,sp)=>TUNE.lvWave&&LV_d('lvPed')>0&&d<16&&sp>4&&i%3!==0;
// traffic: cars further than 300 m are moved to streets 100-260 m around, half of them ahead (was 650 / 480 m → 180-480 m, behind)
function LV_trFar(){const d=LV_d('lvTraf');return d<=0?(CID==='fra'?650:480):240}
function LV_trNear(){const d=LV_d('lvTraf');return d<=0?(CID==='fra'?hubNear(180,480,true):hubNear(130,400,true)):R()<.65?LV_nearHid(70,200):hubNear(90,220,true)}
// v88p: a street node 70-200 m ahead that the camera cannot see right now (no pop-in), so cars drive into view 20-60 m ahead
function LV_nearHid(min,max){let i=-1;for(let k=0;k<6;k++){i=LV_near(min,max,1);if(i<0)return i;const n=HUB.nodes[i];if(!LV_seen(n.x,n.y||RO.y||0,n.z))return i}return i}
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
function LV_spot(min,max,ahead){const c=LV_edges(min,max,ahead?.3:-2),E=c[0];if(!E)return null;const N=HUB.nodes,A=N[E.i],B=N[E.bi];
  const L=Math.hypot(B.x-A.x,B.z-A.z)||1,dx=(B.x-A.x)/L,dz=(B.z-A.z)/L,t=E.s,sd=R()<.5?-1:1,off=(Math.min(A.w||20,B.w||20)/2)+(CID==='fra'?3.4:2.3);
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
    if(!F.on){if((LV.fr+f)%20)continue;const s=LV_spot(F.gull?60:24,F.gull?200:70,!F.gull);if(!s)continue;F.on=true;F.st=F.gull?3:0;F.t=0;F.x=s.x;F.z=s.z;F.y=s.y;
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
  try{LV_birdInit()}catch(e){console.warn('LV birds',e)}try{LV_flagInit()}catch(e){console.warn('LV flags',e)}try{LV_blimpInit()}catch(e){console.warn('LV blimp',e)}try{LV_boatInit()}catch(e){console.warn('LV boats',e)}try{LV_clInit()}catch(e){console.warn('LV clusters',e)}}
function LV_step(dt){if(!RO.on)return;LV_init();if(!LV.init)return;LV.t+=dt;LV.fr++;const t0=performance.now();camera.updateMatrixWorld();LV_seenF.setFromProjectionMatrix(_lvPM.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));
  LV_birdStep(dt);LV_flagStep();LV_blimpStep();LV_boatStep(dt);try{LV_clStep(dt)}catch(e){if(!LV.e1){LV.e1=1;console.warn('LV cl',e)}}try{LV_parkStep()}catch(e){if(!LV.e2){LV.e2=1;console.warn('LV park',e)}}LV.ms=LV.ms==null?0:LV.ms*.95+(performance.now()-t0)*.05}
{const _lvHT=hubTrafficStep;hubTrafficStep=dt=>{_lvHT(dt);LV_step(dt)}}
// ===== v88p: life you SEE from the chase camera (reviewer on v88n: "subtle in the chase view"). Everything below sits 20-60 m ahead on the route.
//  7 · life clusters at street corners ahead: crowds (3-6 minifigs chatting, they cheer, wave and leap aside), market stalls, café tables. Same ped pool (PED_N 110).
//  8 · parked cars half on the kerb ahead (real traffic cars from the pool: same mesh, same box collider, smashable) + moving traffic biased into view
//  9 · 2K-style roadside pop-up challenges (ramp jump, drift zone, smash streak, cone slalom): drive through the ring to start; timer on the one objective line
const LV_CPP=[4,5,6,3,5,4];// people per cluster
const LV_seenF=new THREE.Frustum(),_lvPM=new THREE.Matrix4(),_lvV=new THREE.Vector3();
const LV_seen=(x,y,z)=>LV_seenF.containsPoint(_lvV.set(x,y+1,z));
// crowd peds: wave when the car is within 40 m (3 of 4), the rest keep chatting
const LV_cwave=(i,d)=>d<40&&i%4!==0;
function LV_cn(){return Math.round(6*Math.min(2,LV_d('lvCrowd')))}
// a pavement corner beside a street node min-max m ahead (cone cos ≥ cmin), clear of buildings and other clusters
// street nodes min-max m away inside the forward cone (cos ≥ cmin), shuffled (hubNear samples 18 random nodes of a 1.25 km square: almost never one 20-90 m away)
function LV_ahead(min,max,cmin){if(hubNear(1e9,1e9,false)<-9)return[];const N=HUB.nodes,L=HUB.nc?HUB.nc.L:[],fx=Math.sin(RO.h),fz=Math.cos(RO.h),o=[];
  for(const i of L){const n=N[i];if(!n)continue;const dx=n.x-RO.x,dz=n.z-RO.z,d2=dx*dx+dz*dz;if(d2<min*min||d2>max*max)continue;const d=Math.sqrt(d2);if((dx*fx+dz*fz)/d>=cmin)o.push(i)}
  for(let k=o.length-1;k>0;k--){const j=Math.floor(R()*(k+1));[o[k],o[j]]=[o[j],o[k]]}return o}
// points every 10 m along the streets min-max m away inside the forward cone: {i,bi,s,L} (edge A→B, s m from A). Points within 26 m of a junction first (corners)
const LV_eC={};
function LV_edges(min,max,cmin){const key=min+'|'+max+'|'+cmin,c=LV_eC[key],st=(LV.fr||0)+'|'+Math.round(RO.x/10)+'|'+Math.round(RO.z/10);if(c&&c.st===st){c.r=(c.r+1)%Math.max(1,c.L.length);return c.r?c.L.slice(c.r).concat(c.L.slice(0,c.r)):c.L}
  const L=LV_edges0(min,max,cmin);LV_eC[key]={st,L,r:0};return L}
function LV_edges0(min,max,cmin){if(hubNear(1e9,1e9,false)<-9)return[];const N=HUB.nodes,Ls=HUB.nc?HUB.nc.L:[],fx=Math.sin(RO.h),fz=Math.cos(RO.h),o=[],q=[];
  for(const i of Ls){const A=N[i];if(!A||A.ab||!A.nb)continue;for(const bi of A.nb){const B=N[bi];if(!B||B.ab)continue;const L=Math.hypot(B.x-A.x,B.z-A.z);if(L<16)continue;const ux=(B.x-A.x)/L,uz=(B.z-A.z)/L;
    for(let t=8;t<L-7;t+=10){const x=A.x+ux*t,z=A.z+uz*t,dx=x-RO.x,dz=z-RO.z,d2=dx*dx+dz*dz;if(d2<min*min||d2>max*max)continue;const d=Math.sqrt(d2);if((dx*fx+dz*fz)/d<cmin)continue;
      const e=Math.min(t,L-t)<26&&(A.nb.length>=3&&t<26||B.nb.length>=3&&L-t<26);(e?o:q).push({i,bi,s:t,L})}}}
  const sh=a=>{for(let k=a.length-1;k>0;k--){const j=Math.floor(R()*(k+1));[a[k],a[j]]=[a[j],a[k]]}return a};return sh(o).concat(sh(q))}
// road mask: true if (x,z) is within W/2+m of any street edge nearby (the carriageway of ANY street, incl. the crossing one at a corner)
function LV_onRoad(x,z,m){const N=HUB.nodes;for(const i of HUB.nc?HUB.nc.L:[]){const A=N[i];if(!A||!A.nb)continue;if(Math.abs(A.x-x)>400||Math.abs(A.z-z)>400)continue;for(const bi of A.nb){const B=N[bi];if(!B)continue;const dx=B.x-A.x,dz=B.z-A.z,l2=dx*dx+dz*dz||1,t=Math.max(0,Math.min(1,((x-A.x)*dx+(z-A.z)*dz)/l2)),ex=A.x+dx*t-x,ez=A.z+dz*t-z,W=Math.min(A.w||(A.g?8:20),B.w||(B.g?8:20))/2+m;if(ex*ex+ez*ez<W*W)return true}}return false}
function LV_corner(min,max,cmin,avoid){const N=HUB.nodes,fx=Math.sin(RO.h),fz=Math.cos(RO.h),fra=CID==='fra';
  const cand=LV_edges(min,max,cmin);for(let k=0;k<Math.min(20,cand.length);k++){const E=cand[k],i=E.i,bi=E.bi,A=N[i],B=N[bi],L=E.L;
    const ux=(B.x-A.x)/L,uz=(B.z-A.z)/L,W=Math.min(A.w||20,B.w||20),sd=R()<.5?-1:1,al=E.s,off=fra?W/2+4.6:Math.max((A.pw||W/2+1.5)+1.1,W/2+2.6);/* Athens: right behind the walkers' line (A.pw), at the kerb */
    const x=A.x+ux*al-uz*off*sd,z=A.z+uz*al+ux*off*sd;if(LV_onRoad(x,z,2.4))continue;if(avoid&&avoid.some(q=>q.on&&(q.x-x)**2+(q.z-z)**2<22*22))continue;
    const y=groundAt(x,z,(RO.y||0)+20);if(!(y>-1)||Math.abs(y-(RO.y||0))>14)continue;if(roamHit(x,z,1.8,y+.5)||roamHit(x-uz*sd*2,z+ux*sd*2,1.2,y+.5))continue;
    return{x,z,y:Math.max(0,y),h:Math.atan2(uz*sd,-ux*sd),ux,uz,sd,W,a:i,b:bi,al,L}}return null}
// ---------- 7 · clusters
function LV_clInit(){const n=12;// capacity: 2 stalls / 2 café sets per cluster
  const wood='#8a5a30',stall=mergeG([cbox(2.6,.9,1.1,0,.45,0,wood),cbox(2.7,.08,1.2,0,.92,0,'#c8904c'),cbox(.08,2.4,.08,-1.25,1.2,.5,'#e8e8e8'),cbox(.08,2.4,.08,1.25,1.2,.5,'#e8e8e8'),cbox(.08,2.4,.08,-1.25,1.2,-.5,'#e8e8e8'),cbox(.08,2.4,.08,1.25,1.2,-.5,'#e8e8e8'),
    cbox(.5,.22,.4,-.85,1.07,.2,'#e03020'),cbox(.5,.22,.4,-.25,1.07,.2,'#ffb020'),cbox(.5,.22,.4,.35,1.07,.2,'#58c040'),cbox(.5,.22,.4,.9,1.07,.2,'#ffe040'),cbox(.5,.22,.4,-.55,1.07,-.25,'#f07020'),cbox(.5,.22,.4,.6,1.07,-.25,'#a03080'),
    cbox(2.2,.35,.05,0,.55,.56,'#ffffff')]);
  const aw=mergeG([0,1,2,3,4,5].map(j=>cbox(.47,.12,1.7,-1.18+j*.47,2.5,.15,j%2?'#ffffff':'#8c8c8c')).concat([0,1,2,3,4,5].map(j=>cbox(.47,.3,.06,-1.18+j*.47,2.32,1.0,j%2?'#ffffff':'#8c8c8c'))));
  const cafe=mergeG([ccyl(.42,.42,.06,0,.74,0,'#ffffff',12),ccyl(.05,.05,.72,0,.37,0,'#444444',6),ccyl(.25,.25,.04,0,.02,0,'#444444',8),
    cbox(.42,.06,.42,.75,.45,0,'#c8282c'),cbox(.06,.5,.42,.95,.7,0,'#c8282c'),cbox(.42,.06,.42,-.75,.45,0,'#c8282c'),cbox(.06,.5,.42,-.95,.7,0,'#c8282c'),
    cbox(.05,.45,.05,.6,.22,.15,'#444444'),cbox(.05,.45,.05,-.6,.22,-.15,'#444444'),ccyl(.035,.035,2.2,0,1.1,0,'#e8e8e8',6)]);
  const um=mergeG([ccyl(.06,1.25,.45,0,2.25,0,'#ffffff',8),ccyl(1.25,1.25,.08,0,2.0,0,'#d8d8d8',8)]);
  const C=LV.cl={s:LV_im(stall,n*2),a:LV_im(aw,n*2),c:LV_im(cafe,n*2),u:LV_im(um,n*2),L:[],col:new THREE.Color()};
  const AW=['#d01818','#1f5fbf','#2a9a3a','#ff8a1c','#d01818','#9b5de5'],UM=['#ffffff','#d01818','#1f5fbf','#ffd12c','#2a9a3a','#ff5fa2'];
  for(let i=0;i<n*2;i++){C.a.setColorAt(i,C.col.set(AW[i%AW.length]));C.u.setColorAt(i,C.col.set(UM[(i*5)%UM.length]))}C.a.instanceColor.needsUpdate=C.u.instanceColor.needsUpdate=true;
  for(let k=0;k<n;k++)C.L.push({on:false,k:['crowd','market','cafe'][k%3],x:0,z:0,y:0,h:0,gs:1,pr:[],n:LV_CPP[k%LV_CPP.length]})}
// prop slots j=0/1 of cluster k: market = 1-2 stalls side by side, café = 2 table sets with umbrellas
function LV_clProps(k,C){const S=LV.cl,ax=-Math.cos(C.h),az=Math.sin(C.h);C.pr=[];
  if(C.k==='market'){const two=C.n>=5;for(let j=0;j<(two?2:1);j++){const o=two?(j?1.6:-1.6):0;C.pr.push({m:'s',j,x:C.x+ax*o,z:C.z+az*o,r:1.6,dead:false})}}
  else if(C.k==='cafe'){for(let j=0;j<2;j++){const o=j?1.5:-1.5;C.pr.push({m:'c',j,x:C.x+ax*o,z:C.z+az*o,r:1.25,dead:false})}}}
function LV_clDraw(k,C){const S=LV.cl,g=C.gs;for(let j=0;j<2;j++){const i=k*2+j;for(const m of [S.s,S.a,S.c,S.u])m.setMatrixAt(i,_lvZ)}
  if(!C.on)return;for(const p of C.pr){if(p.dead)continue;const i=k*2+p.j;if(p.m==='s'){LV_set(S.s,i,p.x,C.y,p.z,0,C.h,0,g);LV_set(S.a,i,p.x,C.y,p.z,0,C.h,0,g)}else{LV_set(S.c,i,p.x,C.y,p.z,0,C.h+p.j*.9,0,g);LV_set(S.u,i,p.x,C.y,p.z,0,C.h,0,g)}}}
const LV_clUpd=()=>{const S=LV.cl;for(const m of [S.s,S.a,S.c,S.u])m.instanceMatrix.needsUpdate=true};
function LV_clPut(k,C,near){const S=LV.cl,own=S.L.filter(q=>q!==C);const ath=CID!=='fra',sp=near?(k%2||ath&&k<4?LV_corner(ath?16:20,ath?40:45,.6,own)||LV_corner(15,60,.3,own):LV_corner(35,70,.82,own)||LV_corner(25,90,.5,own)):(LV_corner(60,115,.8,own)||LV_corner(55,130,.5,own));
  if(!sp){C.on=false;LV_clDraw(k,C);return false}Object.assign(C,{on:true,x:sp.x,z:sp.z,y:sp.y,h:sp.h,a:sp.a,b:sp.b,gs:near?1:.05,t:0,ux:sp.ux,uz:sp.uz,sd:sp.sd});LV_clProps(k,C);LV_clDraw(k,C);return true}
// people of cluster k stand in a loose ring on the road side of the props (crowd: around a centre), facing each other
function LV_clPeople(k,C,base,P){const n=C.n,rx=Math.sin(C.h),rz=Math.cos(C.h),ax=-Math.cos(C.h),az=Math.sin(C.h);
  for(let j=0;j<n;j++){const p=P[base+j];if(!p)return;p.cw=1;p.a=C.a;p.b=C.b;p.t=0;const fr=(j+.5)/n-.5;let ox,oz;
    if(C.k==='crowd'){const a=j/n*6.283+k;ox=Math.sin(a)*1.3+rx*.9;oz=Math.cos(a)*1.3+rz*.9}else{ox=ax*fr*4.2+rx*(1.25+(j%2)*.45);oz=az*fr*4.2+rz*(1.25+(j%2)*.45)}
    p.cx=C.x+ox;p.cz=C.z+oz;p.mx=C.x+rx*(C.k==='crowd'?.9:1.6);p.mz=C.z+rz*(C.k==='crowd'?.9:1.6);p.jy=0;p.jv=0;p.jx=p.jz=0;p.spin=0;p.yc=0;p.y=C.y;p.gs=C.gs}}
function LV_clStep(dt){const S=LV.cl;if(!S||!HUB.peds)return;const P=HUB.peds,N=LV_cn(),walk=LV_walk(P.length),sp=Math.abs(RO.v),fx=Math.sin(RO.h),fz=Math.cos(RO.h);
  // warp / teleport (> 60 m in one frame) or first frame: re-place every cluster close (no pop-in is visible across a teleport)
  const jump=LV.px==null||Math.hypot(RO.x-LV.px,RO.z-LV.pz)>60;LV.px=RO.x;LV.pz=RO.z;if(jump)LV.parkJ=90;
  if(LV.walk!==walk){for(const p of P)if(p.cw){p.cw=0;LV_pedPut(p)}LV.walk=walk}
  let base=walk,moved=0;
  for(let k=0;k<S.L.length;k++){const C=S.L[k];
    if(k>=N||base+C.n>P.length){if(C.on){C.on=false;LV_clDraw(k,C)}for(let j=0;j<C.n;j++){const p=P[base+j];if(p&&p.cw){p.cw=0;LV_pedPut(p)}}base+=C.n;continue}
    const dx=C.x-RO.x,dz=C.z-RO.z,d=Math.hypot(dx,dz),behind=dx*fx+dz*fz<-d*.2;
    if(jump||!C.on&&(LV.fr+k)%10===0||C.on&&(d>170||behind&&d>30)){if(jump||moved<2){moved++;LV_clPut(k,C,jump||!C.on&&LV.fr<30);if(C.on)LV_clPeople(k,C,base,P);else for(let j=0;j<C.n;j++){const p=P[base+j];if(p&&p.cw){p.cw=0;LV_pedPut(p)}}}}
    if(C.on){C.t+=dt;if(C.gs<1){C.gs=Math.min(1,C.gs+dt*2.2);LV_clDraw(k,C)}
      // props: the car smashes a stall / café set (brick burst, studs, slight slow-down); slow contact pushes the car out (collider = the drawn size)
      for(const q of C.pr){if(q.dead)continue;const ex=RO.x-q.x,ez=RO.z-q.z,e2=ex*ex+ez*ez,rr2=q.r+1.1;if(e2>rr2*rr2||Math.abs((RO.y||0)-C.y)>3)continue;
        if(sp>6){q.dead=true;LV_clDraw(k,C);const at=V3(q.x,C.y+1.2,q.z),fw=V3(Math.sin(RO.vh),0,Math.cos(RO.vh));debris(at,fw.clone().multiplyScalar(sp*.45).add(V3(0,7,0)),14,(q.m==='s'?['#8a5a30','#e03020','#ffb020','#58c040','#ffffff']:['#ffffff','#c8282c','#ffd12c','#444444']).map(c=>new THREE.Color(c)),.8,C.y);
          for(let s2=0;s2<3;s2++)studBurst(at,fw,sp);HUB.smashed++;comboAdd(1);RO.v*=.94;AU.sfx('crash');LV.n.smash=(LV.n.smash||0)+1}
        else{const e=Math.sqrt(e2)||1,o=rr2-e;RO.x+=ex/e*o;RO.z+=ez/e*o;RO.v*=.7}}
      // people: face the car once it is within 35 m, otherwise face the group; cheer-hop as it passes
      for(let j=0;j<C.n;j++){const p=P[base+j];if(!p||!p.cw)continue;p.gs=C.gs;const pd=Math.hypot(p.cx-RO.x,p.cz-RO.z);
        const th=pd<35?Math.atan2(RO.x-p.cx,RO.z-p.cz):Math.atan2(p.mx-p.cx,p.mz-p.cz);let dh=th-(p.ch??th);dh=Math.atan2(Math.sin(dh),Math.cos(dh));p.ch=(p.ch??th)+dh*Math.min(1,dt*5);
        if(p.jy<=0&&pd<30&&sp>6&&R()<dt*1.3){p.jv=5.5;p.jy=.01;p.kx=p.kz=0;p.spin=0}}}
    base+=C.n}LV_clUpd()}
// walkers (70 at 1×, lvPed) + cluster people never exceed PED_N
function LV_crowdN(){let n=0;const c=LV_cn();for(let k=0;k<c&&k<12;k++)n+=LV_CPP[k%LV_CPP.length];return n}
function LV_walk(n){const w=TUNE.life<=0||TUNE.lvPed<=0?70:Math.round(70*LV_d('lvPed'));return Math.max(0,Math.min(w,n-LV_crowdN()))}
// ---------- 8 · parked cars: traffic cars (same mesh + collider) parked half on the kerb 30-110 m ahead; smashing one sends it back into traffic
function LV_parkStep(){const C=HUB.cars;if(!C||!C.length)return;const want=Math.round(5*Math.min(2,LV_d('lvPark'))),N=HUB.nodes,fx=Math.sin(RO.h),fz=Math.cos(RO.h);let n=0;
  for(const c of C){if(!c.pk)continue;if(c.dead>0){c.pk=0;c.v=c.pv||16;continue}const dx=c.x-RO.x,dz=c.z-RO.z,d=Math.hypot(dx,dz);
    if(n>=want||d>200||dx*fx+dz*fz<-d*.3&&d>40&&!LV_seen(c.x,c.y||0,c.z)){c.pk=0;c.v=c.pv||16;c.lane=.36;c.cv=0;continue}n++}
  if(n>=want)return;if(LV.parkJ>0){LV.parkJ--;for(let r=n;r<want;r++)LV_park1(C,true);return}if(LV.fr%15)return;LV_park1(C,LV.fr<30)}
function LV_park1(C,far){const N=HUB.nodes,fx=Math.sin(RO.h),fz=Math.cos(RO.h);
  // take a car the player cannot see (behind or > 200 m), park it on a street ahead, never on top of a cluster
  let cand=null;for(let k=0;k<12&&!cand;k++){const c=C[Math.floor(R()*C.length)];if(c.pk||c.route||c.tr||c.dead>0||c.crW)continue;const dx=c.x-RO.x,dz=c.z-RO.z,d=Math.hypot(dx,dz);if(d>200||dx*fx+dz*fz<-d*.3&&!LV_seen(c.x,c.y||0,c.z))cand=c}
  if(!cand)return;const nd=LV_edges(far?30:70,far?100:130,.6).filter(e=>Math.min(e.s,e.L-e.s)>14&&!N[e.i].g&&!N[e.bi].g)/* g streets (all of Athens): traffic drives at lane 0, no kerb lane to park in */;for(let k=0;k<Math.min(10,nd.length);k++){const E=nd[k],i=E.i,bi=E.bi,A=N[i],B=N[bi],L=E.L,W=Math.min(A.w||20,B.w||20);if(W<9)continue;const d=Math.hypot(A.x+(B.x-A.x)*E.s/L-RO.x,A.z+(B.z-A.z)*E.s/L-RO.z);
    const t=E.s/L,lane=(W/2+.3)/W,x=A.x+(B.x-A.x)*t-(B.z-A.z)/L*lane*W,z=A.z+(B.z-A.z)*t+(B.x-A.x)/L*lane*W;
    if(LV.cl&&LV.cl.L.some(q=>q.on&&(q.x-x)**2+(q.z-z)**2<14*14))continue;if(C.some(o=>o.pk&&(o.x-x)**2+(o.z-z)**2<9*9))continue;if(roamHit(x,z,1.4,groundY(x,z)+.5))continue;
    if(!far&&LV_seen(x,0,z)&&d<90)continue;
    Object.assign(cand,{pk:1,pv:cand.pv||cand.v,v:0,cv:0,a:i,b:bi,t,lane,hitT:0,x,z});LV.n.park=(LV.n.park||0)+1;return}}
// ---------- 9 · roadside pop-up challenges (2K "On-the-Go" style, but no stop): one at a time, ring 45-75 m ahead in your lane
const LVP={c:null,cd:14,k:0,ok:0,miss:0};
const LVP_K=[{k:'jump',name:'RAMP JUMP',ico:'🦘',col:'#ff8a1c',lim:9,goal:.9,u:'s air'},{k:'drift',name:'DRIFT ZONE',ico:'🌀',col:'#4ceaff',lim:10,goal:2.5,u:'s drift'},
  {k:'smash',name:'SMASH STREAK',ico:'💥',col:'#ff3d3d',lim:12,goal:5,u:'smashed'},{k:'slalom',name:'CONE SLALOM',ico:'🚧',col:'#5dff7a',lim:14,goal:5,u:'gates'}];
function LVP_mesh(){if(LVP.m)return LVP.m;const g=new THREE.Group(),ring=new THREE.Mesh(new THREE.TorusGeometry(4.2,.42,8,32),new THREE.MeshStandardMaterial({color:'#ffffff',emissive:'#ffffff',emissiveIntensity:.9,roughness:.3}));ring.position.y=4.5;g.add(ring);
  const disc=new THREE.Mesh(new THREE.CircleGeometry(3.8,32),new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:.18,side:THREE.DoubleSide,depthWrite:false}));disc.position.y=4.5;g.add(disc);
  const [cv0,cx]=cv(256,128),sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv0),transparent:true,depthWrite:false}));sp.scale.set(12,6,1);sp.position.y=12.5;sp.renderOrder=4;g.add(sp);
  // cones (slalom) and crates (smash) as two instanced meshes; 12 each
  const cone=mergeG([cbox(.7,.12,.7,0,.06,0,'#ff6a00'),ccyl(.08,.3,.9,0,.55,0,'#ff6a00',8),ccyl(.2,.24,.16,0,.62,0,'#ffffff',8)]);
  const crate=mergeG([cbox(1.6,1.6,1.6,0,.8,0,'#c8904c'),cbox(1.64,.2,1.64,0,1.3,0,'#8a5a30'),cbox(1.64,.2,1.64,0,.3,0,'#8a5a30'),ccyl(.24,.24,.18,-.4,1.69,-.4,'#c8904c',8),ccyl(.24,.24,.18,.4,1.69,.4,'#c8904c',8),ccyl(.24,.24,.18,-.4,1.69,.4,'#c8904c',8),ccyl(.24,.24,.18,.4,1.69,-.4,'#c8904c',8)]);
  g.visible=false;HUB.grp.add(g);LVP.m={g,ring,disc,sp,cx,cv:cv0,cone:LV_im(cone,12),crate:LV_im(crate,12)};return LVP.m}
function LVP_label(K){const M=LVP.m,g=M.cx;g.clearRect(0,0,256,128);g.fillStyle='rgba(12,14,30,.86)';g.beginPath();g.roundRect(6,10,244,108,30);g.fill();g.lineWidth=7;g.strokeStyle=K.col;g.stroke();
  g.textAlign='center';g.textBaseline='middle';g.font='64px system-ui';g.fillText(K.ico,52,64);g.fillStyle='#ffffff';g.font='italic 900 30px system-ui';const w=K.name.split(' ');g.fillText(w[0],160,46);g.fillText(w[1]||'',160,84);M.sp.material.map.needsUpdate=true;
  M.ring.material.color.set(K.col);M.ring.material.emissive.set(K.col);M.disc.material.color.set(K.col)}
// the street ahead: the HUB street edge you drive along (|cos| > .9, within the road), with ≥ 125 m left before its end node. Q.P(k) = 8 m steps
function LVP_path(){if(hubNear(1e9,1e9,false)<-9)return null;const N=HUB.nodes,fx=Math.sin(RO.h),fz=Math.cos(RO.h);let best=null,bd=1e9;
  for(const i of HUB.nc?HUB.nc.L:[]){const A=N[i];if(!A||A.ab||!A.nb)continue;for(const bi of A.nb){const B=N[bi];if(!B||B.ab)continue;const L=Math.hypot(B.x-A.x,B.z-A.z);if(L<40)continue;const ux=(B.x-A.x)/L,uz=(B.z-A.z)/L,c=ux*fx+uz*fz;if(Math.abs(c)<.9)continue;
    const t=(RO.x-A.x)*ux+(RO.z-A.z)*uz;if(t<0||t>L)continue;const e=Math.abs((RO.x-A.x)*uz-(RO.z-A.z)*ux),W=Math.min(A.w||(A.g?8:20),B.w||(B.g?8:20));if(e>W/2+1.5||e>=bd)continue;
    const dir=c>0?1:-1,left=dir>0?L-t:t;if(left<125)continue;bd=e;best={i,bi,A,B,ux:ux*dir,uz:uz*dir,px:A.x+ux*t,pz:A.z+uz*t,w:W}}}
  if(!best)return null;const Q=best,lat=(RO.x-Q.px)*Q.uz-(RO.z-Q.pz)*Q.ux;Q.lat=clamp(lat,-Q.w/2+2.4,Q.w/2-2.4);if(Q.w<9)Q.lat=0;return Q}
const LVP_pt=(Q,k,lat)=>{const s=k*8;return{x:Q.px+Q.ux*s+Q.uz*lat,z:Q.pz+Q.uz*s-Q.ux*lat,h:Math.atan2(Q.ux,Q.uz),tx:Q.ux,tz:Q.uz}};
function LVP_busy(busy){return busy||RO.ch||RO.sp||RO.card||RO.frozen||RO.mapOpen||RO.story||RO.pop||(typeof OG!=='undefined'&&OG.ev)||!roamSave().tut||state!=='roam'}
function LVP_spawn(){const Q=LVP_path();if(!Q)return false;const M=LVP_mesh(),K=LVP_K[LVP.k++%LVP_K.length],g=LVP_pt(Q,7,Q.lat),gy=Math.max(0,groundAt(g.x,g.z,(RO.y||0)+8));
  if(roamHit(g.x,g.z,3.6,gy+2))return false;LVP_label(K);M.g.position.set(g.x,gy,g.z);M.g.rotation.set(0,g.h,0);M.g.visible=true;M.g.scale.setScalar(.05);
  LVP.c={K,st:0,t:0,v:0,gx:g.x,gz:g.z,gy,gh:g.h,Q,lat:Q.lat,obj:[],s0:0,dist:0};AU.sfx('pick');return true}
// start: lay the course just past the ring
function LVP_start(C){const K=C.K,M=LVP.m,Q=C.Q;M.g.visible=false;C.st=1;C.t=0;C.s0=HUB.smashed;AU.sfx('go');say(K.ico+' '+K.name,K.lim+' s · '+K.goal+' '+K.u,1.4);
  if(K.k==='jump'){const r=LVP_pt(Q,11,C.lat),y0=Math.max(0,groundAt(r.x,r.z,C.gy+6));addRamp(r.x,r.z,r.h,13,3,7,0xff8a1c,y0);C.ramp=RO.ramps[RO.ramps.length-1];C.rampM=RO.grp.children.slice(-3);C.tg=r}
  if(K.k==='slalom'){for(let j=0;j<5;j++){const o=C.lat+(j%2?-2.2:2.2),o2=clamp(o,-Math.max(2.2,Q.w/2-2.2),Math.max(2.2,Q.w/2-2.2)),a=LVP_pt(Q,11+j*3,o2);C.obj.push({x:a.x,z:a.z,h:a.h,tx:a.tx,tz:a.tz,y:Math.max(0,groundAt(a.x,a.z,C.gy+6)),pass:false,hit:[0,0]})}C.tg=C.obj[0]}
  if(K.k==='smash'){for(let j=0;j<6;j++){const o=clamp(C.lat+(j%2?-1.8:1.8),-Math.max(1.8,Q.w/2-1.6),Math.max(1.8,Q.w/2-1.6)),a=LVP_pt(Q,11+j*2.5,o);C.obj.push({x:a.x,z:a.z,h:a.h,y:Math.max(0,groundAt(a.x,a.z,C.gy+6)),dead:false})}C.tg=C.obj[0]}
  if(K.k==='drift')C.tg=null;LVP_draw(C)}
function LVP_draw(C){const M=LVP.m;for(let i=0;i<12;i++){M.cone.setMatrixAt(i,_lvZ);M.crate.setMatrixAt(i,_lvZ)}
  if(C&&C.K.k==='slalom')C.obj.forEach((o,j)=>{for(let s=0;s<2;s++){const i=j*2+s;if(o.hit[s]&&o.hit[s].t>1.2)continue;const sx=o.x+o.tz*(s?2.3:-2.3),sz=o.z-o.tx*(s?2.3:-2.3);if(o.hit[s]){const H=o.hit[s];LV_set(M.cone,i,sx+H.vx*H.t,o.y+H.vy*H.t-6*H.t*H.t,sz+H.vz*H.t,H.t*9,o.h,H.t*7,1.2)}else LV_set(M.cone,i,sx,o.y,sz,0,o.h,0,1.2)}});
  if(C&&C.K.k==='smash')C.obj.forEach((o,j)=>{if(!o.dead)LV_set(M.crate,j,o.x,o.y,o.z,0,o.h+j*.4,0,1)});M.cone.instanceMatrix.needsUpdate=M.crate.instanceMatrix.needsUpdate=true}
function LVP_end(C,win){const K=C.K,M=LVP.m;M.g.visible=false;if(C.ramp){const i=RO.ramps.indexOf(C.ramp);if(i>=0)RO.ramps.splice(i,1);for(const m of C.rampM||[])if(m.userData&&m.userData.ramp){RO.grp.remove(m);m.geometry&&m.geometry.dispose()}}
  C.obj=[];LVP_draw(null);LVP.c=null;LVP.cd=Math.max(8,TUNE.lvPopGap||28)*(win?1:.6);
  if(win){const rw=Math.round(150*(TUNE.lvPopRw??1));LVP.ok++;studGain(rw,true);addXP(40,'pop-up');AU.sfx('finish');const at=V3(RO.x,(RO.y||0)+2.2,RO.z);debris(at,V3(Math.sin(RO.vh)*Math.abs(RO.v)*.5,11,Math.cos(RO.vh)*Math.abs(RO.v)*.5),17,['#d01818','#ffd12c','#1f5fbf','#2a9a3a','#ffffff',K.col].map(c=>new THREE.Color(c)),.9,RO.y||0);for(let s=0;s<6;s++)studBurst(at,V3(Math.sin(RO.vh),0,Math.cos(RO.vh)),Math.abs(RO.v));
    try{JU_pop(K.ico+' '+K.name+'!','+'+rw+' STUDS',K.col)}catch(e){say(K.name+'!','+'+rw+' studs',1.6)}}
  else{LVP.miss++;say('',K.name+' · MISSED',1.2)}}
function LVP_step(dt,busy){const M=LVP.m,C=LVP.c;
  if(!C){LVP.cd-=dt;if(LVP.cd>0||LVP_busy(busy)||Math.abs(RO.v)<8||LV.fr%10)return;if(!LVP_spawn())LVP.cd=1.5;return}
  if(C.st===0){// ring waiting on the road: grow in, spin the label, start when the car passes through (≤ 4.2 m from its centre)
    C.t+=dt;M.g.scale.setScalar(Math.min(1,.05+C.t*2.5));M.ring.rotation.z=Math.sin(C.t*2)*.08;const dx=RO.x-C.gx,dz=RO.z-C.gz,d=Math.hypot(dx,dz),al=dx*Math.sin(C.gh)+dz*Math.cos(C.gh);
    // decided at the ring plane: through it (≤ 5.2 m sideways) = start; past it outside = gone at once, so the chase camera never flies through the ring
    // (v88p review blocker: an off-centre pass left the ring up until 12 m past and the camera crossed the torus + disc = a huge translucent wedge over the car)
    const lt=Math.abs(dx*Math.cos(C.gh)-dz*Math.sin(C.gh));if(al>-1.5&&al<6&&lt<5.2&&Math.abs((RO.y||0)-C.gy)<5){M.g.visible=false;LVP_start(C);return}
    if(al>-1.5||d>140||C.t>25||LVP_busy(busy)){M.g.visible=false;LVP.c=null;LVP.cd=6;return}return}
  // running
  C.t+=dt;const K=C.K;
  if(K.k==='jump'){if(pl&&pl.air)C.v+=dt}else if(K.k==='drift'){if(RO.dDir)C.v+=dt}else if(K.k==='smash'){
    for(const o of C.obj){if(o.dead)continue;const ex=RO.x-o.x,ez=RO.z-o.z;if(ex*ex+ez*ez<2.1*2.1&&Math.abs((RO.y||0)-o.y)<3){o.dead=true;const at=V3(o.x,o.y+1,o.z),fw=V3(Math.sin(RO.vh),0,Math.cos(RO.vh));debris(at,fw.clone().multiplyScalar(Math.abs(RO.v)*.45).add(V3(0,7,0)),12,['#c8904c','#8a5a30','#ffd12c'].map(c=>new THREE.Color(c)),.8,o.y);studBurst(at,fw,Math.abs(RO.v));HUB.smashed++;comboAdd(1);AU.sfx('crash');try{CR_smashHit()}catch(e){}}}
    C.v=HUB.smashed-C.s0;C.tg=C.obj.find(o=>!o.dead)||null;LVP_draw(C)}
  else if(K.k==='slalom'){for(const o of C.obj){const ex=RO.x-o.x,ez=RO.z-o.z,al=ex*o.tx+ez*o.tz,lat=ex*o.tz-ez*o.tx;
      // cones: 0.6 m bases at ±2.3 m; touching one knocks it flying (no penalty beyond the lost gate)
      for(let s=0;s<2;s++){if(o.hit[s])continue;const cl=lat-(s?2.3:-2.3);if(Math.abs(al)<1.5&&Math.abs(cl)<1.3){o.hit[s]={t:0,vx:Math.sin(RO.vh)*Math.abs(RO.v)*.4+(s?1:-1)*o.tz*3,vy:6,vz:Math.cos(RO.vh)*Math.abs(RO.v)*.4-(s?1:-1)*o.tx*3};AU.sfx('bump')}}
      if(!o.pass&&!o.miss&&al>0&&al<6){if(Math.abs(lat)<2.1&&!o.hit[0]&&!o.hit[1]){o.pass=true;C.v++;AU.sfx('pick');feed('GATE '+C.v+'/5',0,K.col)}else o.miss=true}}
    for(const o of C.obj)for(const H of o.hit)if(H)H.t+=dt;C.tg=C.obj.find(o=>!o.pass&&!o.miss)||null;LVP_draw(C);if(!C.tg&&C.v<K.goal){LVP_end(C,false);return}}
  if(C.v>=K.goal){LVP_end(C,true);return}if(C.t>=K.lim||busy&&(RO.ch||RO.sp)){LVP_end(C,false)}}
// the one objective line (#roamArrow; merged into the story line by CR_hud): icon · name · progress · seconds left, arrow to the ring / next target
function LVP_hud(){const C=LVP.c;if(!C||RO.ch||RO.sp)return;const a=huQ('#roamArrow');if(!a)return;const K=C.K,tg=C.st===0?{x:C.gx,z:C.gz}:C.tg;huH(a,false);a.classList.remove('d24soon');
  const ang=tg?Math.atan2(tg.x-RO.x,tg.z-RO.z)-RO.h:0;huS(huQ('#roamArrow i'),'transform',`rotate(${(-ang).toFixed(3)}rad)`);
  const v=K.k==='smash'||K.k==='slalom'?Math.floor(C.v):C.v.toFixed(1);huT(huQ('#roamArrow span'),C.st===0?`${K.ico} ${K.name} → drive through the ring · ${Math.round(Math.hypot(C.gx-RO.x,C.gz-RO.z))} m`:`${K.ico} ${K.name} · ${v}/${K.goal} ${K.u} · ${Math.max(0,K.lim-C.t).toFixed(1)} s`)}
{const _ps=popStep;popStep=(dt,busy)=>{if(LV_d('lvPop')<=0||RO.pop&&!LVP.c){if(LVP.c)LVP_end(LVP.c,false);return _ps(dt,busy)}RO.popCd=Math.max(RO.popCd??0,20);try{LVP_step(dt,busy)}catch(e){console.warn('LVP',e);LVP.c=null;LVP.cd=30}}}
// no 'TAP TO OPEN' zone pill over the boost bar while a pop-up runs (reviewer v88p note 2)
{const _rp=roamPrompt;roamPrompt=dt=>{if(LVP.c&&LVP.c.st===1){const el=document.getElementById('roamPrompt');if(el&&!el.hidden)el.hidden=true;return}return _rp(dt)}}
{const _rh=roamHud;roamHud=()=>{_rh();try{LVP_hud()}catch(e){}}}
window.__lv={LV,n:()=>({peds:HUB.peds?LV_pn(HUB.peds.length):0,flags:LV.flags?LV.flags.L.length:0,roofs:LV.n.flags||0,boats:LV.n.boats||0,birds:LV.birds?LV.birds.fl.filter(f=>f.on).length:0,blimp:!!LV.blimp,ms:LV.ms}),
  view:()=>{// people / cars / birds / boats inside the camera view within 120 m (the "is anything happening" count of the research doc)
    const fr=new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse)),v=new THREE.Vector3(),c={peds:0,cars:0,birds:0,boats:0},inV=(x,y,z)=>fr.containsPoint(v.set(x,y+1,z))&&v.distanceTo(camera.position)<120;
    for(const p of HUB.peds||[])if(p._x!=null&&inV(p._x,p.y,p._z))c.peds++;for(const k of HUB.cars||[])if(k.dead<=0&&inV(k.x,k.y||0,k.z))c.cars++;
    if(LV.birds)for(const F of LV.birds.fl)if(F.on)for(const b of F.b)if(inV(b.x,b.y,b.z))c.birds++;if(LV.boats)for(const b of LV.boats.bt)if(inV(b.x,0,b.z))c.boats++;return c}};
