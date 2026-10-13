/* ===== RD · roads-1 (Alex 2026-10-13: "cars should follow traffic rules and also humans"): pedestrian kerb + crossing rules, cars yield, zebras in Frankfurt.
   Network simplification (dead-end cuts, two-way streets, wider main roads, grid stub trims) is in 51_city_net.js (RD_net / RD_fillTrim); RD_ON (?rd=0 = off) lives there.
   Pedestrians: the walker still follows the traffic graph, but its drawn spot is kept off the carriageway (pushed to the kerb of the side it came from).
   Getting to the other side of a street = a crossing: only on an arm OUTSIDE the junction box (= the zebra line), only on WALK at a signal,
   only with no car within 20 m elsewhere; otherwise the walker waits at the kerb (12 s, 90 s at a signal) and then turns back. Cars stop for a walker on a crossing. */
const RD_PS={cross:0,turn:0,wait:0,carHold:0};
function RD_key(p){return p.a*1048576+p.b}
function RD_sd(p){return p.rdK===RD_key(p)?(p.sd||1):1}
function RD_pv(p){if(p.rdK!==RD_key(p))return p.v;return p.rdH?0:p.rdX?p.v*1.6:p.v}
let RD_pred=null;
function RD_predOf(i){const N=HUB.nodes;if(!RD_pred||RD_pred.N!==N){const P=new Array(N.length);for(let a=0;a<N.ng;a++)for(const b of N[a].nb)if(b<N.ng)(P[b]||(P[b]=[])).push(a);RD_pred={N,P}}return RD_pred.P[i]||[]}
// next node at the end of an edge: same physical pavement (sd keeps the side when walking against the traffic direction of a chain)
function RD_inBox(x,z){return !!CV_near(x,z,J=>Math.hypot(J.x-x,J.z-z)<J.r-.5)}
function RD_boxPath(p,B,C,sd){const L=Math.hypot(C.x-B.x,C.z-B.z)||1,dx=(C.x-B.x)/L,dz=(C.z-B.z)/L,W=Math.min(B.w||20,C.w||20),off=(B.g&&C.g?(B.pw??4):p.side*(W/2+(CID==='fra'?3.2:2.1)))*sd;for(const t of[.08,.5]){if(RD_inBox(B.x+(C.x-B.x)*t-dz*off,B.z+(C.z-B.z)*t+dx*off))return true}return false}
function RD_pedNext(p,B){const N=HUB.nodes,sd=RD_sd(p),fw=sd>0,L0=(fw?B.nb:RD_predOf(p.b)).filter(n=>n!==p.a&&n<N.ng&&!N[n].ab),L=L0.filter(n=>!RD_boxPath(p,B,N[n],sd));const a=p.a;p.a=p.b;
  if(L.length){p.b=L[Math.floor(R()*L.length)];p.t=0}else{p.b=a;p.t=0;p.sd=-sd;p.rdK=RD_key(p);RD_PS.turnN=(RD_PS.turnN||0)+1;return}p.sd=sd;p.rdK=RD_key(p)}
function RD_turnBack(p){const sd=RD_sd(p);[p.a,p.b]=[p.b,p.a];p.t=1-p.t;p.sd=-sd;p.rdK=RD_key(p);p.rdH=0;p.rdW=0;p.rdX=null;RD_PS.turn++}
// carriageway under (x,z): real street (drivable) or grid road; {ref,hw,lat,cx,cz,nx,nz}
function RD_road(x,z,skip){let b=null;const ev=q=>{if(!q||!OB_DRV(q.S)||q.road===skip)return;const p=q.p,a=(x-p.x)*p.tx+(z-p.z)*p.tz,P=q.S.pts;if((q.i===0&&a<-2)||(q.i===P.length-1&&a>2))return;const cx=p.x+p.tx*a,cz=p.z+p.tz*a,lat=(x-cx)*p.tz-(z-cz)*p.tx,hw=q.road.w/2;if(!b||Math.abs(lat)-hw<Math.abs(b.lat)-b.hw)b={ref:q.road,hw,lat,cx,cz,nx:p.tz,nz:-p.tx}};
  const q1=cityAt(x,z);ev(q1);if(q1)ev(cityAt(x,z,q1.si));
  const f=fillAt(x,z,skip);if(f&&f.r!==skip){const r=f.r,t=clamp((x-r.x0)*r.ux+(z-r.z0)*r.uz,0,r.L),cx=r.x0+r.ux*t,cz=r.z0+r.uz*t,lat=(x-cx)*r.uz-(z-cz)*r.ux,hw=r.w/2;if(!b||Math.abs(lat)-hw<Math.abs(b.lat)-b.hw)b={ref:r,hw,lat,cx,cz,nx:r.uz,nz:-r.ux}}return b}
function RD_mem(p,ref,s){const M=p.rdM||(p.rdM=[]);for(const m of M)if(m[0]===ref){m[1]=s;return}M.unshift([ref,s]);if(M.length>3)M.pop()}
function RD_memGet(p,ref){if(p.rdM)for(const m of p.rdM)if(m[0]===ref)return m[1];return null}
// may the walker cross road q at (x,z) now? true / false (wait) / null (inside a junction box: never, turn back)
function RD_may(x,z){let J=null,jd=1e9;CV_near(x,z,Q=>{const d=Math.hypot(Q.x-x,Q.z-z);if(d<Q.R0+14&&d<jd){jd=d;J=Q}return false});
  if(J&&jd<J.r-.5)return null;if(J&&J.sig){const w=CV_walk(J);return w>=0&&w<4}
  for(const c of HUB.cars){if(c.dead>0||c.x==null)continue;const dx=c.x-x,dz=c.z-z;if(dx*dx+dz*dz<400&&(c.cv??c.v)>.8)return false}return true}
function RD_kerb(p,bx,bz,dt){const key=RD_key(p);if(p.rdK!==key){p.rdK=key;p.sd=1;p.rdM=null;p.rdX=null;p.rdH=0;p.rdW=0;p.rdcx=0;p.rdcz=0}
  let x=bx,z=bz,hold=0;const sk=[];
  for(let it=0;it<2;it++){const q=RD_road(x,z,sk[0]);if(!q)break;const al=Math.abs(q.lat);if(al>=q.hw+.3){if(al<q.hw+7){const sg=q.lat<0?-1:1;if(p.rdTB===q.ref&&sg===RD_memGet(p,q.ref))p.rdTB=null;if(p.rdTB!==q.ref)RD_mem(p,q.ref,sg)}break}
    sk.push(q.ref);const sN=q.lat<0?-1:1,s0=RD_memGet(p,q.ref);
    if(p.rdX===q.ref){continue}
    if(p.rdTB===q.ref&&sN===s0)p.rdTB=null;let s=s0;if(s0==null){s=sN;RD_mem(p,q.ref,sN)}
    else if(it===0&&sN!==s0&&al>.5&&p.rdTB!==q.ref){const ok=RD_may(x,z);if(ok){p.rdX=q.ref;RD_mem(p,q.ref,sN);p.rdH=0;p.rdW=0;RD_PS.cross++;continue}
      if(ok===null||p.rdW>(RD_maySig(x,z)?90:12)){RD_turnBack(p);p.rdTB=q.ref;RD_PS[ok===null?'tbBox':'tbWait']=(RD_PS[ok===null?'tbBox':'tbWait']||0)+1;s=s0}else{hold=1;p.rdW=(p.rdW||0)+dt;RD_PS.wait+=dt}}
    const o=s*(q.hw+1.2);x=q.cx+q.nx*o;z=q.cz+q.nz*o}
  if(p.rdX&&!sk.includes(p.rdX))p.rdX=null;p.rdH=hold;if(!hold&&!p.rdX)p.rdW=0;
  // smooth the drawn spot towards the target (walking pace), so pushes and crossings do not jump
  const tx=x-bx,tz=z-bz,ex=tx-(p.rdcx||0),ez=tz-(p.rdcz||0),e=Math.hypot(ex,ez),st=dt*(p.rdX?3.2:4);if(e>30){p.rdcx=tx;p.rdcz=tz}else if(e>st){p.rdcx=(p.rdcx||0)+ex/e*st;p.rdcz=(p.rdcz||0)+ez/e*st}else{p.rdcx=tx;p.rdcz=tz}
  return[bx+p.rdcx,bz+p.rdcz]}
function RD_maySig(x,z){return !!CV_near(x,z,Q=>Q.sig&&Math.hypot(Q.x-x,Q.z-z)<Q.R0+14)}
// cars stop for a walker on a crossing ahead of them (frozen like a CV red: speed 0, position kept)
function RD_carPre(){const P=HUB.peds;if(!P)return;const X=[];for(const p of P)if(p.rdX&&p._x!=null&&Math.abs(p._x-RO.x)<330&&Math.abs(p._z-RO.z)<330)X.push(p);if(!X.length)return;const N=HUB.nodes;
  for(const c of HUB.cars){if(c.dead>0||c.x==null||c.route&&!c.CVr)continue;const A=N[c.a],B=N[c.b];if(!A||!B||A.ab)continue;const L=Math.hypot(B.x-A.x,B.z-A.z)||1,hx=(B.x-A.x)/L,hz=(B.z-A.z)/L;
    for(const p of X){const rx=p._x-c.x,rz=p._z-c.z,al=rx*hx+rz*hz;if(al<1||al>16)continue;if(Math.abs(rx*hz-rz*hx)<3){c.RDfz=[c.a,c.b,c.t,c.v];c.RDy2='ped';c.v=0;c.cv=0;RD_PS.carHold++;break}}}}
function RD_carPost(){for(const c of HUB.cars)if(c.RDfz){if(!(c.dead>0)){c.a=c.RDfz[0];c.b=c.RDfz[1];c.t=c.RDfz[2];c.cv=0}c.v=c.RDfz[3];c.RDfz=null}}
if(RD_ON){const _ht=hubTrafficStep;hubTrafficStep=function(dt){try{RD_carPre()}catch(e){}const r=_ht.apply(this,arguments);try{RD_carPost()}catch(e){}return r}}
// zebra crossings on every arm of a Frankfurt junction (Athens has its own, CE_kerbs): band J.r+1.4 … +4.6 from the centre = where walkers cross
function RD_zebra(){if(CID!=='fra'||!HUB.grp)return;const pos=[];let n=0;
  for(const J of[...CV.sig,...CV.yl]){if(J.ap.length<3)continue;for(const g of J.ap){const dx=-g.dx,dz=-g.dz,nx=dz,nz=-dx,c0=J.r+1.4,hw=Math.min(12,(g.w||14)/2)-.7;
      for(let o=-hw;o<=hw-.5;o+=1.25){const pts=[[o,c0],[o+.62,c0],[o+.62,c0+3.2],[o,c0+3.2]].map(([a,b])=>{const x=J.x+nx*a+dx*b,z=J.z+nz*a+dz*b;return[x,groundY(x,z)+.07,z]});const[A,B,C,D]=pts;pos.push(...A,...B,...C,...A,...C,...D)}n++}}
  if(!pos.length)return;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));const nr=new Float32Array(pos.length);for(let i=1;i<nr.length;i+=3)nr[i]=1;g.setAttribute('normal',new THREE.BufferAttribute(nr,3));
  const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:0xf4f4ee,roughness:.6,metalness:0,polygonOffset:true,polygonOffsetFactor:-6,polygonOffsetUnits:-10,side:THREE.DoubleSide}));m.name='rdZebra';m.receiveShadow=true;HUB.grp.add(m);RD_PS.zebra=n}
if(RD_ON){const _bt=buildHubTraffic;buildHubTraffic=function(){const r=_bt.apply(this,arguments);try{RD_zebra()}catch(e){console.warn('RD zebra',e)}return r}}
window.__rd={RD,PS:RD_PS,on:RD_ON,US:()=>RD_US};
// junction box sharing: entry heading + turn (from the chosen exit) at reservation; same approach, or opposite approaches with nobody turning left = compatible
function RD_entry(c,J,k){const N=HUB.nodes,B=N[c.b],X=c.CVx!=null?N[c.CVx]:null;let tr=0;if(X&&B){const l=Math.hypot(X.x-B.x,X.z-B.z)||1,ex=(X.x-B.x)/l,ez=(X.z-B.z)/l,cr=c.CVhx*ez-c.CVhz*ex,dt=c.CVhx*ex+c.CVhz*ez;tr=dt>.7?0:cr>0?1:-1}c.RDe=[c.CVhx,c.CVhz,tr,J.id]}
function RD_compat(o,c){const a=o.RDe,b=c.RDe;if(!a||!b||a[3]!==b[3])return false;const d=a[0]*b[0]+a[1]*b[1];if(d>.8)return true;if(d<-.8){const L=v=>v===RD_LEFT;return !L(a[2])&&!L(b[2])}return false}
const RD_LEFT=-1;// turn sign: cross(h,e)=hx*ez-hz*ex > 0 = right turn (the right side of heading h is (-hz,hx), see the lane offset in hubTrafficStep)
// un-stacker: recycled/respawned cars were dropped on occupied spots (hubRecycle picks any node + t) and then sat inside each other in queues.
// Every 0.25 s: two live cars < 2.6 m apart heading the same way → the one the camera cannot see (else the rear one) respawns elsewhere.
const RD_US={t:0,n:0};
function RD_unstack(dt){RD_US.t+=dt;if(RD_US.t<.25)return;RD_US.t=0;const G=new Map(),N=HUB.nodes;
  for(const c of HUB.cars){if(c.dead>0||c.x==null||c.route&&!c.CVr||c.tr||c.pk)continue;if(Math.abs(c.x-RO.x)>340||Math.abs(c.z-RO.z)>340)continue;const k=Math.floor(c.x/4)*100000+Math.floor(c.z/4);let L=G.get(k);if(!L)G.set(k,L=[]);L.push(c)}
  const hd=c=>{const A=N[c.a],B=N[c.b];if(!A||!B)return[0,0];const l=Math.hypot(B.x-A.x,B.z-A.z)||1;return[(B.x-A.x)/l,(B.z-A.z)/l]};
  for(const L of G.values()){for(const c of L){if(c.dead>0)continue;const kx=Math.floor(c.x/4),kz=Math.floor(c.z/4);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const M=G.get((kx+a)*100000+kz+b);if(!M)continue;for(const o of M){if(o===c||o.dead>0||c.dead>0)continue;const dx=o.x-c.x,dz=o.z-c.z;if(dx*dx+dz*dz>6.76)continue;const h1=hd(c),h2=hd(o);if(h1[0]*h2[0]+h1[1]*h2[1]<.5)continue;
      const sc=typeof LV_seen==='function'?[LV_seen(c.x,c.y||0,c.z),LV_seen(o.x,o.y||0,o.z)]:[1,1];let v=null;if(!sc[0]&&sc[1])v=c;else if(sc[0]&&!sc[1])v=o;else v=dx*h1[0]+dz*h1[1]>0?c:o;v.dead=.05;v.route=null;v.CVr=0;v.CVp=0;RD_US.n++}}}}}
if(RD_ON){const _ht=hubTrafficStep;hubTrafficStep=function(dt){const r=_ht.apply(this,arguments);try{RD_unstack(dt)}catch(e){}return r}}
