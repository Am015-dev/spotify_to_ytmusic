// parked-jump-r22e29 (Alex r22: "cars change on camera turn"): a PARKED car (c.pk) near the player never moves while the camera looks away and back.
// GO why/parked-jump: the player stands among parked cars (lvPark 2 = up to 10), turns on the spot 20 times (a new heading each time, so cars all round are looked at),
// and each time the camera turns 180 deg for 2 s and back for 2 s. Every parked car ON SCREEN within 140 m when the turn starts must stay within 0.5 m (no unpark and drive off,
// no re-place, no swap). Cause: LV_step parks a car between CV_pre/CV_post and RD_carPre/RD_carPost (hubTrafficStep wrappers); the post step wrote the saved driving speed + pose back
// onto the parked car (20-50 m in 2 s with pk set), and LV_parkStep unparked cars the moment the camera looked away (law off: no view memory). docs/HANDOFF_parked-jump-r22e29.md.
const PJ={n:20,maxM:.5,minPk:6,minTurns:20};
const _pjM=new THREE.Matrix4(),_pjF=new THREE.Frustum(),_pjS=new THREE.Sphere();
function PJ_set(){const L=[];for(const c of HUB.cars)if(c.pk&&!(c.dead>0)&&(c.x-RO.x)**2+(c.z-RO.z)**2<19600)L.push(c);return L}
function PJ_inView(c){camera.updateMatrixWorld();_pjF.setFromProjectionMatrix(_pjM.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));_pjS.center.set(c.x,(c.y||0)+1,c.z);_pjS.radius=3;return _pjF.intersectsSphere(_pjS)}
function PJ_look(away){const P=camera.position,ex=P.x-RO.x,ez=P.z-RO.z;if(away){P.set(RO.x-ex,P.y,RO.z-ez);camera.lookAt(RO.x-2*ex,RO.y+1,RO.z-2*ez)}}
function PJ_go(){if(state!=='roam'||!RO.on)return'📍 Start free roam to run this';const P0=[RO.x,RO.z,RO.h],dt=1/60,lv0=TUNE.lvPark;K.ArrowUp=K.ArrowDown=K.ArrowLeft=K.ArrowRight=false;
 const settle=s=>{for(let i=0;i<s;i++){T+=dt;RO.v=0;roamStep(dt);roamCam(dt)}};let best=null,bn=-1;
 try{TUNE.lvPark=2;roamWarp(RO.x,RO.z,RO.h);RO.frozen=false;const spots=[[RO.x,RO.z],...SC_busy(4).map(i=>[HUB.nodes[i].x,HUB.nodes[i].z])];
  for(const[x,z]of spots){if(x!==RO.x||z!==RO.z){if(!roamWarp(x,z,RO.h)){RO.x=x;RO.z=z}}
   for(let r=0;r<8&&PJ_set().length<10;r++){settle(100);for(let q=0;q<6;q++)if(typeof LV_park1==='function')LV_park1(HUB.cars,true)}/* the lively park step runs 1 car / 15 frames: top up to 10 */
   const n=PJ_set().length;if(n>bn){bn=n;best=[RO.x,RO.z]}if(n>=10)break}
  if(best&&(RO.x!==best[0]||RO.z!==best[1])){if(!roamWarp(best[0],best[1],RO.h)){RO.x=best[0];RO.z=best[1]}settle(60)}
  let tn=0,tj=0,worst=0,er=[];
  for(let k=0;k<PJ.n;k++){RO.h=RO.vh=P0[2]+k*Math.PI*2/PJ.n;camSnap=true;settle(45);const L=PJ_set().filter(PJ_inView).map(c=>({c,x:c.x,z:c.z,mx:0,why:''}));tn+=L.length;
   for(let s=0;s<240;s++){T+=dt;RO.v=0;roamStep(dt);roamCam(dt);PJ_look(s<120);camera.updateMatrixWorld();
    for(const e of L){const m=Math.hypot(e.c.x-e.x,e.c.z-e.z);if(m>e.mx){e.mx=m;if(m>PJ.maxM&&!e.why)e.why=` @${k}.${s} d${Math.hypot(e.x-RO.x,e.z-RO.z).toFixed(0)}m pk${e.c.pk?1:0} v${(+e.c.v).toFixed(1)} dead${(+e.c.dead||0).toFixed(1)}`}}}
   for(const e of L){if(e.mx>worst)worst=e.mx;if(e.mx>PJ.maxM){tj++;if(er.length<4)er.push((HCAR.get?HCAR.get(e.c.k):HCAR[e.c.k])+' moved '+e.mx.toFixed(1)+' m'+e.why)}}}
  const ok=bn>=PJ.minPk&&tn>=PJ.minTurns&&tj===0;return`📍 why/parked-jump · ${bn} parked cars within 140 m (>= ${PJ.minPk}) · ${tn} on-screen car-turns over ${PJ.n} camera turns away 2 s and back (>= ${PJ.minTurns}) · parked cars moved > ${PJ.maxM} m: ${tj} (0), worst ${worst.toFixed(1)} m${er.length?' ['+er.join(', ')+']':''} → ${ok?'✅ PASS':'❌ FAIL'}`}
 finally{TUNE.lvPark=lv0;K.ArrowUp=K.ArrowDown=K.ArrowLeft=K.ArrowRight=false;RO.x=P0[0];RO.z=P0[1];RO.h=RO.vh=P0[2];RO.v=0;camSnap=true;if(typeof NC_PM!=='undefined')NC_PM.F.length=0}}
{const reg=setInterval(()=>{if(!window.__chk||!__chk.GO)return;clearInterval(reg);
 __chk.items.unshift({ver:'why',id:'parked-jump',area:'traffic',text:'parked-jump-r22e29 (Alex: "cars change on camera turn"): the player stands among parked cars (up to 10) and turns on the spot 20 times; each time the camera turns away 2 s and back: no parked car on screen within 140 m moves more than 0.5 m (no unpark and drive off, no re-place, no swap). 📍 GO.'});
 __chk.GO['why/parked-jump']=['fra','ath'].map(c=>({c,n:'parked cars '+(c==='fra'?'Frankfurt':'Athens'),secs:150,fn:()=>PJ_go()}))},500)}
