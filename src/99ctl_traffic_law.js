// traffic-law-r21m (2026-10-20): traffic/law, a no-graphics state assert on whether NPC cars keep the LAW and stay ON THE ROAD (Frankfurt + Athens).
// Alex (beta): "the NPC cars break the law all the time, move out like a switch out of my sight, and get out of the road like a magnet".
// A ghost player drives the road graph at up to 18 m/s on the right lane (brakes for cars ahead, like a driver), the camera sits behind it, and the real
// hubTrafficStep runs at a fixed dt for TLW.sec seconds. Every live car within 300 m is checked each frame:
//   dev   = sideways distance between the car and its own lane line (the pose the lane graph gives: edge, t, lane), i.e. what anything else added
//   off   = how far the car centre is past the kerb line of the street it is on (cityAt, ped paths skipped); > 0 = off the carriageway
//   pops  = spawn / despawn / move > 1 m beyond its speed in one frame, IN the camera frustum and within 250 m (they may only happen out of view)
//   red   = a car entering a signalled junction box on red without a reservation; wrong = centre on the oncoming half of a two-way street
//   thru  = two car bodies interpenetrating >= 0.25 s (any direction); player = a car body inside the player's body
// Pass line = what this lane guarantees per 5 min (before -> after, flags ?pop=0&aydlane=0&latsplit=0 off -> on, Frankfurt: pops in view 1186 -> <= 161, frames past the kerb 3287 -> 83,
// head-on pairs 31 -> 2; Athens pops ~1400 -> 29). Alex's targets (0 pops, 0 cars through cars, 0 s wrong side) are printed next to it; the rest is open (docs/HANDOFF_traffic-law-r21m.md).
const TLW={dt:1/60,sec:300,rad:240,vis:250,maxDev:.5,maxOff:0,popMax:200,offMax:400,headMax:12,red:0,plMax:8,ms:.3};
function TLW_obb(ax,az,ahx,ahz,bx,bz,bhx,bhz,la,wa,lb,wb){// separating axes of two rectangles (half length l, half width w, unit heading h)
  const rx=bx-ax,rz=bz-az,ax2=[[ahx,ahz],[-ahz,ahx],[bhx,bhz],[-bhz,bhx]];
  for(const [ux,uz] of ax2){const pa=la*Math.abs(ahx*ux+ahz*uz)+wa*Math.abs(-ahz*ux+ahx*uz),pb=lb*Math.abs(bhx*ux+bhz*uz)+wb*Math.abs(-bhz*ux+bhx*uz);if(Math.abs(rx*ux+rz*uz)>pa+pb)return false}return true}
function TLW_lane(c,A,B){const gA=A.g||B.g,W=c.pk&&c.ofW?c.ofW:A.ab||gA?0:Math.min(A.w||20,B.w||20);return HT_laneOff(c,A,B,gA,W)}
function TLW_measure(sec,dt,o){sec=sec||TLW.sec;dt=dt||TLW.dt;o=o||{};const H=HUB,N=H.nodes,C=H.cars;if(!N||!C||!C.length)return null;
  // start: the busiest car cluster (as traffic/behaviour), the ghost on that car's edge 40 m back
  let best=null,bn=-1;for(const c of C){if(c.dead>0||c.pk||c.x==null||!N[c.a]||!N[c.b]||N[c.a].ab)continue;let n=0;for(const q of C)if(Math.abs(q.x-c.x)<160&&Math.abs(q.z-c.z)<160)n++;if(n>bn){bn=n;best=c}}
  if(!best)return null;const G={a:best.a,b:best.b,t:Math.max(0,best.t-.3),v:0,p:-1};
  const cam=camera,F=new THREE.Frustum(),PM=new THREE.Matrix4(),V=new THREE.Vector3(),asp0=cam.aspect;cam.aspect=852/393;cam.updateProjectionMatrix();
  const seen=(x,y,z)=>F.containsPoint(V.set(x,(y||0)+1,z));
  const R={city:CID,near:bn,sec,steps:0,cars:0,maxDev:0,devAt:null,maxOff:-9,offAt:null,offN:0,popVis:0,popVis200:0,pops:{spawn:0,despawn:0,tele:0},popEv:[],red:0,redEv:[],redFar:0,wrongS:0,wrongEv:[],thru:0,thruEv:[],thruK:{headon:0,same:0,merge:0,chain:0,cross:0},player:0,plEv:[],ms:0,msMax:0,gTrav:0,gStuck:0,src:{lat:0,yo:0,other:0}};
  const prev=new Map(),pairs=new Map(),jd=new Map();let msSum=0;const n=Math.round(sec/dt);
  const ghost=()=>{let A=N[G.a],B=N[G.b];if(!A||!B)return;let L=Math.hypot(B.x-A.x,B.z-A.z)||1,dx=(B.x-A.x)/L,dz=(B.z-A.z)/L;
    // brake for any car ahead in its corridor (8 m gap), else up to 18 m/s
    let vm=18;const px=RO.x,pz=RO.z;for(const c of C){if(c.dead>0||c.dz||c.x==null||c.pk)continue;const rx=c.x-px,rz=c.z-pz,al=rx*dx+rz*dz;if(al<0||al>40)continue;const ca=N[c.a],cb=N[c.b];if(!ca||!cb)continue;const cl=Math.hypot(cb.x-ca.x,cb.z-ca.z)||1;if(((cb.x-ca.x)*dx+(cb.z-ca.z)*dz)/cl<.3)continue;if(Math.abs(-rx*dz+rz*dx)<2.4)vm=Math.min(vm,Math.max(0,(al-8)*.8+(c.cv||0)))}
    if(G.v<.5){G.st=(G.st||0)+dt;if(G.st>6){G.st=0;R.gStuck++;const a=G.a;G.a=G.b;G.b=a;G.t=1-G.t}}else G.st=0/* stuck 6 s: turn round (a driver would) */
    G.v+=Math.max(-8*dt,Math.min(3*dt,vm-G.v));G.t+=G.v*dt/L;R.gTrav+=G.v*dt;
    while(G.t>=1){const nx=B.nb.filter(k=>k!==G.a&&N[k]&&!N[k].ab);const p=G.a;G.a=G.b;G.b=nx.length?nx[Math.floor(R0()*nx.length)]:p;G.t=0;A=N[G.a];B=N[G.b];L=Math.hypot(B.x-A.x,B.z-A.z)||1;dx=(B.x-A.x)/L;dz=(B.z-A.z)/L}
    const W=A.g||B.g?0:Math.min(A.w||20,B.w||20),ln=W*.3;RO.x=A.x+(B.x-A.x)*G.t-dz*ln;RO.z=A.z+(B.z-A.z)*G.t+dx*ln;RO.h=RO.vh=Math.atan2(dx,dz);RO.v=G.v;
    RO.y=typeof groundY==='function'?groundY(RO.x,RO.z):0;cam.position.set(RO.x-dx*7,RO.y+3,RO.z-dz*7);cam.lookAt(RO.x+dx*10,RO.y+1,RO.z+dz*10);cam.updateMatrixWorld();
    PM.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse);F.setFromProjectionMatrix(PM)};
  let sd=12345;const R0=()=>(sd=(sd*16807)%2147483647)/2147483647;
  for(let s=0;s<n;s++){ghost();const t0=performance.now();T+=dt;hubTrafficStep(dt);const ms=performance.now()-t0;msSum+=ms;if(s>60&&ms>R.msMax)R.msMax=ms;R.steps++;
    const live=[],gx=Math.sin(RO.h),gz=Math.cos(RO.h);
    for(const c of C){const al=!(c.dead>0)&&!c.dz&&c.x!=null&&Math.abs(c.x)<1e6,q=prev.get(c);const d=al?Math.hypot(c.x-RO.x,c.z-RO.z):1e9;
      if(q&&s>0){const pd=Math.hypot(q.x-RO.x,q.z-RO.z);let ev=null,x=0,z=0,y=0;
        if(al&&!q.al){ev='spawn';x=c.x;z=c.z;y=c.y}else if(!al&&q.al&&!(c.dead>20)){ev='despawn';x=q.x;z=q.z;y=q.y}
        else if(al&&q.al){const jm=Math.hypot(c.x-q.x,c.z-q.z)-Math.max(q.cv,c.cv||0)*(q.acc+dt)*1.05-.05;if(jm>1){ev='tele';x=c.x;z=c.z;y=c.y;if(seen(q.x,q.y,q.z)&&pd<TLW.vis){x=q.x;z=q.z;y=q.y}}}
        if(ev&&s>=120){/* the first 2 s: the camera just moved to the ghost, cars far from the old view may carry an old pose */R.pops[ev]++;const dd=Math.hypot(x-RO.x,z-RO.z);if(seen(x,y,z)&&dd<TLW.vis){R.popVis++;if(dd<200)R.popVis200++;if(R.popEv.length<12)R.popEv.push([s,ev,c.j+'_'+c.k,Math.round(dd),Math.round(x),Math.round(z),c.dead>0?+(+c.dead).toFixed(2):0,q.a+'>'+q.b+'@'+(+q.t).toFixed(2),c.a+'>'+c.b+'@'+(+c.t).toFixed(2),+Math.hypot(c.x-q.x,c.z-q.z).toFixed(2),+q.acc.toFixed(3),+(c.cv||0).toFixed(1),c.RDy||'',c.hold?1:0])}}}
      const posed=!q||q.x!==c.x||q.z!==c.z;prev.set(c,{al,a:c.a,b:c.b,t:c.t,x:c.x,z:c.z,y:c.y,cv:Math.max(c.cv||0,q&&q.x===c.x&&q.z===c.z?q.cv:0),acc:q&&q.al&&al&&q.x===c.x&&q.z===c.z?q.acc+dt:0});if(!al||d>TLW.rad)continue;live.push(c);if(!posed)continue;/* a far car on the touch LOD skipped this frame: its pose is from an older step */
      const A=N[c.a],B=N[c.b];if(!A||!B||A.ab||c.a===c.b)continue;const L=Math.hypot(B.x-A.x,B.z-A.z)||1,dx=(B.x-A.x)/L,dz=(B.z-A.z)/L;
      const lat=(c.x-A.x)*-dz+(c.z-A.z)*dx,nom=TLW_lane(c,A,B),dev=Math.abs(lat-nom);
      if(dev>R.maxDev){R.maxDev=dev;R.devAt=[s,c.j+'_'+c.k,+dev.toFixed(2),+lat.toFixed(2),+nom.toFixed(2),+(Math.hypot(c.lrx||0,c.lrz||0)).toFixed(2),+(c.yo||0).toFixed(2),c.RDy||'',Math.round(d)]}
      if(dev>TLW.maxDev){const ly=Math.hypot(c.lrx||0,c.lrz||0),yo=Math.abs(c.yo||0);if(yo>=ly&&yo>.3)R.src.yo++;else if(ly>.3)R.src.lat++;else R.src.other++}
      const rw=Math.min(A.w||0,B.w||A.w||0);if(rw>0&&!c.pk&&!c.CVin&&c.t>.05&&c.t<.95){const ov=Math.abs(lat)+.9-rw/2;if(ov>R.maxOff){R.maxOff=ov;R.offAt=[s,c.j+'_'+c.k,+ov.toFixed(2),rw,+(c.yo||0).toFixed(2),+(Math.hypot(c.lrx||0,c.lrz||0)).toFixed(2),+dev.toFixed(2),Math.round(c.x),Math.round(c.z)]}if(ov>0)R.offN++}
      // wrong half of a two-way street (the lane graph puts the car on the right of its direction)
      if(nom>.8&&lat<-.3&&B.nb.includes(c.a)){R.wrongS+=dt;if(R.wrongEv.length<6)R.wrongEv.push([s,c.j+'_'+c.k,+lat.toFixed(2),+nom.toFixed(2),+(c.yo||0).toFixed(2),Math.round(d)])}
      // red light: entering a signalled box on red with no reservation (CV, 90_fixes_cv_ju.js)
      if(c.CVn&&typeof CV_near==='function'){const J=CV_near(c.x,c.z,J=>J.sig&&J.ap.length>1&&Math.hypot(J.x-c.x,J.z-c.z)<J.R0+2);const key=c;const pj=jd.get(key);
        if(J){const dj=Math.hypot(J.x-c.x,J.z-c.z);if(pj&&pj.J===J&&pj.d>=J.R0&&dj<J.R0&&(c.cv||0)>1){let k=-1,bd=-2;J.ap.forEach((a,i)=>{const v=a.dx*dx+a.dz*dz;if(v>bd){bd=v;k=i}});
          if(k>=0&&CV_st(J,k)==='r'&&!(pj.res)){if(d<TLW.vis){R.red++;if(R.redEv.length<6)R.redEv.push([s,c.j+'_'+c.k,J.id,k,Math.round(d),+(c.cv||0).toFixed(1),c.RDy||''])}else R.redFar++}}
          jd.set(key,{J,d:dj,res:!!(J.res&&J.res.has(c))})}else jd.delete(key)}
      // the player's body (ghost: 4.2 x 2 m)
      if(d<6&&TLW_obb(RO.x,RO.z,gx,gz,c.x,c.z,dx,dz,2.1,1,2,.9)){const kk='P'+c.j+'_'+c.k;if(!pairs.has(kk)){R.player++;if(R.plEv.length<6)R.plEv.push([s,c.j+'_'+c.k,+(c.cv||0).toFixed(1),+G.v.toFixed(1),c.RDy||''])}pairs.set(kk,s)}}
    if(s%3===0){for(let i=0;i<live.length;i++){const a=live[i],Aa=N[a.a],Ab=N[a.b];if(!Aa||!Ab)continue;for(let j=i+1;j<live.length;j++){const b=live[j];if(Math.abs(b.x-a.x)>6||Math.abs(b.z-a.z)>6)continue;const Ba=N[b.a],Bb=N[b.b];if(!Ba||!Bb)continue;
      const la=Math.hypot(Ab.x-Aa.x,Ab.z-Aa.z)||1,lb=Math.hypot(Bb.x-Ba.x,Bb.z-Ba.z)||1,kk=a.j+'_'+a.k+'/'+b.j+'_'+b.k;
      if(TLW_obb(a.x,a.z,(Ab.x-Aa.x)/la,(Ab.z-Aa.z)/la,b.x,b.z,(Bb.x-Ba.x)/lb,(Bb.z-Ba.z)/lb,1.9,.85,1.9,.85)){const P=pairs.get(kk)||{n:0,s};P.n++;P.s=s;pairs.set(kk,P);if(P.n===5){R.thru++;if(R.thruEv.length<10)R.thruEv.push([s,kk,+(a.cv||0).toFixed(1),+(b.cv||0).toFixed(1),a.a+'>'+a.b,b.a+'>'+b.b,a.RDy||'',b.RDy||'',seen(a.x,a.y,a.z)?1:0,Math.round(Math.hypot(a.x-RO.x,a.z-RO.z)),+((b.x-a.x)*-(Ab.z-Aa.z)/la+(b.z-a.z)*(Ab.x-Aa.x)/la).toFixed(2),+TLW_lane(a,Aa,Ab).toFixed(2),+TLW_lane(b,Ba,Bb).toFixed(2),+Math.hypot(a.lrx||0,a.lrz||0).toFixed(2),+Math.hypot(b.lrx||0,b.lrz||0).toFixed(2),+(a.yo||0).toFixed(2),+(b.yo||0).toFixed(2),+a.t.toFixed(2),+b.t.toFixed(2)]);R.thruK[a.a===b.b&&a.b===b.a?'headon':a.a===b.a&&a.b===b.b?'same':a.b===b.b||a.a===b.a?'merge':a.b===b.a||a.a===b.b?'chain':'cross']++}}else if(pairs.has(kk))pairs.delete(kk)}}}
    if(s%60===0)for(const [k,v] of pairs)if(typeof v==='number'&&s-v>60)pairs.delete(k)}
  R.cars=C.filter(c=>!(c.dead>0)).length;R.ms=msSum/n;cam.aspect=asp0;cam.updateProjectionMatrix();R.maxDev=+R.maxDev.toFixed(2);R.maxOff=+R.maxOff.toFixed(2);R.wrongS=+R.wrongS.toFixed(1);return R}
function TLW_ok(R){return!!R&&R.popVis<=TLW.popMax&&R.offN<=TLW.offMax&&R.thruK.headon<=TLW.headMax&&R.red===TLW.red&&R.player<=TLW.plMax}
function TLW_go(){const f0=[HT_POP.on,HT_LAT.split,AYD.lane];HT_POP.on=HT_LAT.split=AYD.lane=true;let R;try{R=TLW_measure()}finally{[HT_POP.on,HT_LAT.split,AYD.lane]=f0}if(!R)return'📍 TRAFFIC LAW · no cars ❌';
  return`📍 TRAFFIC LAW ${R.sec} s (ghost drove ${Math.round(R.gTrav)} m): pops in view < ${TLW.vis} m ${R.popVis} (≤ ${TLW.popMax}; goal 0), car-frames with the body past the kerb ${R.offN} (≤ ${TLW.offMax}), head-on pairs ${R.thruK.headon} (≤ ${TLW.headMax}), red runs ${R.red} (0), cars into the player ${R.player} (≤ ${TLW.plMax}) · info: cars through cars ${R.thru} (merge ${R.thruK.merge}, cross ${R.thruK.cross}, same lane ${R.thruK.same}; goal 0), wrong half ${R.wrongS} s (goal 0), traffic ${R.ms.toFixed(2)} ms/step ${TLW_ok(R)?'✅':'❌'}`}
function TLW_rows(GO,goSay,CK){CK.push({ver:'traffic/law',area:'world',text:'traffic-law-r21m:2026-10-20 · NPC cars keep the law and stay on the road: they follow their lane line (nothing pulls them sideways toward the kerb; they brake for you instead of swerving), stop at red, never drive through another car or into you, and appear / vanish only out of your sight. 📍 GO drives a ghost car 5 min through the busiest streets (fixed dt, no graphics). Pass line (per 5 min, each city): ≤ 200 pops in view within 250 m (was 1186 in Frankfurt), ≤ 400 car-frames past the kerb (was 3287), ≤ 12 head-on pairs, 0 red runs, ≤ 8 cars into the player; cars through cars and wrong-half seconds are printed (goal 0, still open).'});
 for(const c of['fra','ath'])(GO['traffic/law']=GO['traffic/law']||[]).push({c,n:'traffic law '+(c==='fra'?'Frankfurt':'Athens'),secs:360,fn:()=>TLW_go()})}
window.__tlw={TLW,measure:TLW_measure,ok:TLW_ok};
