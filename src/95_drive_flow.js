// DR probe (measurement only, changes nothing): window.__dr.* used by tDR.js for before/after numbers
function DR_edge(x,z){let e=1e9;const q=cityAt(x,z);if(q){e=q.d-q.road.w/2;if(e<6&&e>-.5)e=Math.min(e,CE_roadE(x,z))}const f=fillAt(x,z);if(f)e=Math.min(e,f.d-f.r.w/2);
  if(CID!=='fra'){try{const a=abAt(x,z);if(a)e=Math.min(e,a.d-a.road.w/2)}catch(_){}}try{e=Math.min(e,lzRoadD(x,z))}catch(_){}return e}
window.__dr={edge:DR_edge,
 props(x,z,R=1e9){const o={total:0,road:0,path:0,side:0,lamp:0,types:{}};for(const p of HUB.props||[]){if(!p.alive&&!(p.rt<1e8))continue;if(R<1e9&&Math.hypot(p.x-x,p.z-z)>R)continue;o.total++;const e=DR_edge(p.x,p.z);if(e<0){o.road++;o.roadT=o.roadT||{};o.roadT[p.t]=(o.roadT[p.t]||0)+1}if(e<2.5){o.path++;o.types[p.t]=(o.types[p.t]||0)+1}else if(e<6)o.side++}return o},
 traffic(R=150){const C=HUB.cars||[];let alive=0,near=0,stop=0;for(const c of C){if(c.dead>0)continue;alive++;if(Math.hypot(c.x-RO.x,c.z-RO.z)<R){near++;if((c.cv??c.v)<.5)stop++}}return{total:C.length,alive,near,stop}},
 objs(){let n=0,m=0,im=0,inst=0;scene.traverse(o=>{n++;if(o.isMesh&&o.visible){m++;if(o.isInstancedMesh){im++;inst+=o.count}}});return{objs:n,meshes:m,instMeshes:im,instances:inst}},
 draws(){renderer.info.autoReset=false;renderer.info.reset();(window.__fastR||composer.render).call(composer);const r={calls:renderer.info.render.calls,tris:renderer.info.render.triangles};renderer.info.autoReset=true;return r},
 // keyboard bot along the street-graph path between two points; returns average km/h, min, stuck seconds, hits
 drive(x0,z0,x1,z1,maxS=150){const M=__mho,R=RO,K=M.K;const q0=M.rsnap(x0,z0,400),q1=M.rsnap(x1,z1,400);const P=M.qv.path(q0[0],q0[1],q1[0],q1[1]).P;if(!P||P.length<5)return{skip:1};if(P.some(q=>(HUB.gates||[]).some(g=>Math.hypot(g.x-q[0],g.z-q[1])<90)))return{skip:'gate'};
  M.warp(P[0][0],P[0][1],Math.atan2(P[2][0]-P[0][0],P[2][1]-P[0][1]));M.roamSim(3);const cum=[0];for(let k=1;k<P.length;k++)cum.push(cum[k-1]+Math.hypot(P[k][0]-P[k-1][0],P[k][1]-P[k-1][1]));
  const sm0=HUB.smashed||0;let i=0,t=0,sv=0,st=0,mst=0,slow=0,drops=0,pv=0,minRet=1;for(t=0;t<maxS*60;t++){let bj=i,bd=1e9;for(let k=i;k<Math.min(P.length,i+60);k++){const d=Math.hypot(P[k][0]-R.x,P[k][1]-R.z);if(d<bd){bd=d;bj=k}}i=bj;
   let k=i;while(k<P.length-1&&cum[k]-cum[i]<9+Math.abs(R.v)*.35)k++;let a=Math.atan2(P[k][0]-R.x,P[k][1]-R.z)-R.h;a=Math.atan2(Math.sin(a),Math.cos(a));const vt=40*Math.max(.35,1-Math.abs(a)*.9);
   K.ArrowLeft=a>.035;K.ArrowRight=a<-.035;K.ArrowUp=R.v<vt;K.ArrowDown=R.v>vt+6;const s0=HUB.smashed;const v0=Math.abs(R.v);M.roamSim(1);const v1=Math.abs(R.v);if(HUB.smashed>s0&&v0>5)minRet=Math.min(minRet,v1/v0);
   sv+=v1;if(v1<2)st++;else st=0;mst=Math.max(mst,st);if(v1<4)slow++;if(i>=P.length-3)break}
  K.ArrowLeft=K.ArrowRight=K.ArrowUp=K.ArrowDown=false;const n=t+1;return{len:Math.round(cum[cum.length-1]),s:+(n/60).toFixed(1),kmh:+(sv/n*3.6).toFixed(1),vavg:+(sv/n*3.6).toFixed(1),stuck:+(mst/60).toFixed(1),slowS:+(slow/60).toFixed(1),smash:(HUB.smashed||0)-sm0,minRet:+minRet.toFixed(3),done:i>=P.length-3,why:i>=P.length-3?undefined:{hp:Math.round(R.hp),wk:R.wk,fr:R.frozen,st:M.state,ch:!!R.ch,card:!!R.card,x:Math.round(R.x),z:Math.round(R.z),v:+R.v.toFixed(1),hit:!!M.roamHitAt(R.x,R.z,1.5),sol:window.__drFix?__drFix.inSolid(R.x,R.z):null}}},
 dist(n){const D=(typeof DIST_R!=='undefined'?DIST_R:[]).find(d=>d.name===n);return D&&[(D.x0+D.x1)/2,(D.z0+D.z1)/2]},
 dists(){return typeof DIST_R!=='undefined'?[...new Set(DIST_R.map(d=>d.name))]:[]},
 bounds(){return{HX0,HX1,HZS,HZN}},
 blocks(){const o={};for(const B of HUB.blocks||[])o[B.t]=(o[B.t]||0)+1;return o}};

// DR: driving flow (owner: "too many breakables and traffic, impossible to drive around").
// 1) no breakables on the road / kerb line (edge < 2.5 m): only spaced street trees, lamps and a quarter of the roadwork smash lines stay
// 2) a smash never stops the car: each hit keeps >= 95 %, a burst of hits keeps >= 85 % of the speed at its first contact
// 3) traffic halved, every AI car in the outer lane (inner lanes always free), long-stopped cars away from view are recycled
// 4) residential blocks without a street into them are solid (one merged mesh + colliders, nothing inside)
// 5) touch HUD: compact, collapsible mission card clear of the steer pads; district plate clear of the minimap
const DR={on:!/[?&]dr=0/.test(location.search),st:{},vref:0,ct:-9,t:0,solid:[]};
const DR_KEEP={bricks:1,tower:1,gold:1,crate:1,lamp:1,tlight:1,lights:1,stop:1,awning:1,boat:1,tug:1,hboat:1};
const DR_h=(x,z)=>{const h=Math.sin(x*12.9898+z*78.233)*43758.5453;return h-Math.floor(h)};
function DR_edgeX(x,z){let e=1e9;const q=cityAt(x,z);if(q){e=q.d-q.road.w/2;if(e<6&&e>-.5)e=Math.min(e,CE_roadE(x,z))}const f=fillAt(x,z);if(f)e=Math.min(e,f.d-f.r.w/2);
  if(CID!=='fra'){try{const a=abAt(x,z);if(a)e=Math.min(e,a.d-a.road.w/2)}catch(_){}}try{e=Math.min(e,lzRoadD(x,z),trailDist(x,z)-7,mtnDist(x,z)-12)}catch(_){}return e}
// keep / drop one prop (t,x,z); TC = spacing cells already holding a street tree
function DR_keep(t,x,z,TC){if(DR.solid.length&&DR_inSolid(x,z,1))return false;if(DR_KEEP[t]&&t!=='lamp')return true;const e=DR_edgeX(x,z);if(e>=2.5)return true;
  if(t==='barrier'||t==='clight')return e>-30&&DR_h(Math.floor(x/90),Math.floor(z/90))<.25; // roadwork smash lines: one in four stays
  if(t==='lamp')return e>=.5;
  if(/^(tree|tree2|tree3|CE_cypress|CE_pine|CE_olive)$/.test(t)&&e>=.6){const k=Math.floor(x/26)*100000+Math.floor(z/26);if(TC.has(k))return false;TC.add(k);return true}
  return false}
function DR_inSolid(x,z,m=0){for(const b of DR.solid)if(x>b.x0-m&&x<b.x1+m&&z>b.z0-m&&z<b.z1+m)return true;return false}
// solid blocks: Frankfurt = 'resid' filler blocks; Athens = 16 m raster of deep interiors (>= 22 m from every street edge)
function DR_solidBuild(){const R=[],lm=(x,z,m)=>LMX.some(L=>Math.hypot(L.x-x,L.z-z)<(L.r||30)+m)||(HUB.garage&&Math.hypot(HUB.garage.x-x,HUB.garage.z-z)<70)||(HUB.gates||[]).some(g=>Math.hypot(g.x-x,g.z-z)<60)||(RO.ramps||[]).some(q=>Math.hypot(q.x-x,q.z-z)<50);
  const free=(x,z)=>!inRiver(x,z,-6)&&!onAnyDeck(x,z)&&!(PARKS.some(P=>inR(P,x,z,4))||PLAZAS.some(P=>inR(P,x,z,4)));
  if(CID==='fra'){for(const B of HUB.blocks||[]){if(B.t!=='resid')continue;const x0=B.x0+4,x1=B.x1-4,z0=B.z0+4,z1=B.z1-4;if(x1-x0<30||z1-z0<30)continue;let ok=true;
      for(let x=x0;x<=x1&&ok;x+=8)for(let z=z0;z<=z1;z+=8){if(DR_edgeX(x,z)<2||!free(x,z)||hillH(x,z)>1){ok=false;break}}if(ok&&lm((x0+x1)/2,(z0+z1)/2,Math.max(x1-x0,z1-z0)/2))ok=false;if(ok)R.push({x0,x1,z0,z1})}}
  else{const C=16,cols=Math.floor((HX1-HX0)/C),rows=Math.floor((HZN-HZS)/C),S=new Uint8Array(cols*rows);
    for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){const x=HX0+(i+.5)*C,z=HZS+(j+.5)*C;if(DR_edgeX(x,z)<22||!free(x,z)||hillH(x,z)>.5||lm(x,z,30))continue;S[i*rows+j]=1}
    // row runs along z, then merge equal runs across neighbouring columns
    const runs=[];for(let i=0;i<cols;i++){let j=0;while(j<rows){if(!S[i*rows+j]){j++;continue}let k=j;while(k<rows&&S[i*rows+k])k++;runs.push({i0:i,i1:i,j0:j,j1:k});j=k}}
    const key=r=>r.j0+'|'+r.j1,open=new Map();for(const r of runs){const o=open.get(key(r));if(o&&o.i1===r.i0-1&&o.i1-o.i0<5){o.i1=r.i0;continue}const n={...r};open.set(key(r),n);R.push(n)}
    for(const r of R){r.x0=HX0+r.i0*C;r.x1=HX0+(r.i1+1)*C;r.z0=HZS+r.j0*C;r.z1=HZS+r.j1*C}}
  DR.solid=R;if(!R.length)return;const G=[],col=CID==='fra'?['#e8dcc8','#a85a3c']:['#efe3c8','#c8643c'];
  for(const r of R){const cx=(r.x0+r.x1)/2,cz=(r.z0+r.z1)/2,w=r.x1-r.x0,d=r.z1-r.z0;let lo=1e9,hi=-1e9;for(const[a,b]of[[r.x0,r.z0],[r.x1,r.z0],[r.x0,r.z1],[r.x1,r.z1],[cx,cz]]){const y=groundY(a,b);lo=Math.min(lo,y);hi=Math.max(hi,y)}
    const h=hi-lo+7.5;G.push(cbox(w,h,d,cx,lo-.5+h/2,cz,col[0]),cbox(w-1.2,.6,d-1.2,cx,lo-.5+h+.3,cz,col[1]));const b={x:cx,z:cz,hw:w/2,hd:d/2};HUB.bld.push(b);if(HUB.grid)gridAddTo(HUB.grid,[b])}
  const m=new THREE.Mesh(mergeG(G),new THREE.MeshStandardMaterial({vertexColors:true,roughness:.8}));m.castShadow=false;m.receiveShadow=true;m.userData.dr=1;HUB.grp.add(m);DR.st.solid=R.length}
function DR_cull(L){const TC=new Set();let j=0,drop=0;for(const p of L){if(DR_keep(p.t,p.x,p.z,TC))L[j++]=p;else drop++}L.length=j;DR.st.drop=(DR.st.drop||0)+drop;DR.st.kept=j}
if(DR.on){
 {const _ce=CE_streets;CE_streets=(add,rnd,D)=>{_ce(add,rnd,D);try{DR_solidBuild()}catch(e){console.warn('DR solid',e)}try{DR_cull(HUB.CE_L)}catch(e){console.warn('DR cull',e)}}}
 {const _lz=lzPropsG;lzPropsG=function*(L){try{const TC=new Set();L.props=L.props.filter(([t,x,z])=>DR_keep(t,x,z,TC))}catch(e){}yield* _lz(L)}}
 {const _sc=smashCheck;smashCheck=dt=>{DR.t+=dt||0;const v0=RO.v,n0=HUB.smashed;_sc(dt);if(HUB.smashed>n0&&Math.abs(v0)>.5){if(DR.t-DR.ct>1){DR.ct=DR.t;DR.vref=Math.abs(v0)}
   const fl=Math.max(Math.abs(v0)*.95,DR.vref*.85);if(Math.abs(RO.v)<fl)RO.v=Math.sign(v0)*fl}}}
 {const _bt=buildHubTraffic;buildHubTraffic=()=>{_bt();try{DR_traffic()}catch(e){console.warn('DR traffic',e)}}}
 {const _ht=hubTrafficStep;hubTrafficStep=dt=>{_ht(dt);try{DR_unjam(dt)}catch(e){}}}}
function DR_traffic(){const C=HUB.cars;if(!C||!C.length)return;const n0=C.length,keep=C.filter((c,i)=>c.tr||i%2===0);for(const c of C)if(!keep.includes(c)){_m.makeScale(0,0,0);HUB.cim[c.k].setMatrixAt(c.j,_m)}
  const per={};for(const c of keep.slice().sort((a,b)=>a.k-b.k||a.j-b.j)){c.j=per[c.k]=(per[c.k]??-1)+1;c.lane=.36}
  HUB.cim.forEach((im,k)=>{im.count=(per[k]??-1)+1;im.instanceMatrix.needsUpdate=true});C.length=0;C.push(...keep);DR.st.cars=[n0,C.length]}
// a car stopped for 8 s that the player cannot see (behind or > 60 m) is recycled: queues never grow into walls
function DR_unjam(dt){const hx=Math.sin(RO.h),hz=Math.cos(RO.h);for(const c of HUB.cars){if(c.dead>0||c.route){c.DRs=0;continue}if((c.cv??c.v)<.5)c.DRs=(c.DRs||0)+dt;else c.DRs=0;if(c.DRs<8)continue;
  const dx=c.x-RO.x,dz=c.z-RO.z,d=Math.hypot(dx,dz);if(d>60||dx*hx+dz*hz<0){c.dead=.05;c.DRs=0;DR.st.unjam=(DR.st.unjam||0)+1}}}
// touch HUD: one-line mission card (title + count + bar), tap the title to show the text; plate and card right of the minimap
if(DR.on){const st=document.createElement('style');st.textContent=`body.touch #qTrk{width:min(300px,38vw);padding:4px 8px 5px;border-width:2px;border-radius:10px}
body.touch #qTrk .qh{min-height:24px;padding-right:62px;font-size:12px;pointer-events:auto}body.touch #qTrk .qh i{font-size:14px}
body.touch #qTrk .qbt{top:3px;right:4px;gap:4px}body.touch #qTrk .qbt button{width:28px;height:24px;font-size:13px;border-radius:7px}
body.touch:not(.drQOpen) #qTrk p,body.touch:not(.drQOpen) #qTrk .qd{display:none}body.touch #qTrk p{font-size:12px;margin:2px 0}body.touch #qTrk .qd{font-size:11px}body.touch #qTrk .qb{height:5px;margin-top:3px}
@media (orientation:landscape){body.touch #qTrk{left:calc(112px + env(safe-area-inset-left,0px))!important}
 body.touch #roamPlate{left:calc(112px + env(safe-area-inset-left,0px))!important;top:calc(112px + env(safe-area-inset-top,0px))!important}
 body.touch.drQOpen #roamPlate{visibility:hidden}}
@media (orientation:landscape) and (max-height:520px){body.touch #qTrk,body.touch #roamPlate{left:calc(104px + env(safe-area-inset-left,0px))!important}}`;document.head.appendChild(st);
 document.addEventListener('click',e=>{const h=e.target&&e.target.closest&&e.target.closest('#qTrk .qh');if(h&&!e.target.closest('.qbt'))document.body.classList.toggle('drQOpen')},true)}
// W10 traffic contact (below smash speed): momentum exchange along the lane, no teleport, no spring-back.
// The traffic car takes the push (it can move forward or back along its lane, and is shoved a little sideways for good),
// then brakes to a stop and waits; the player loses the speed it gave away. Side-on hits stop the player's sideways motion.
function W10_bump(c,x,z,dx,dz,W){const ph=RO.vh??RO.h,px=Math.sin(ph),pz=Math.cos(ph),V=RO.v,u=V*(px*dx+pz*dz),w=c.cv||0,s=(x-RO.x)*dx+(z-RO.z)*dz,
  nx=dz,nz=-dx,un=V*(px*nx+pz*nz),sn=(x-RO.x)*nx+(z-RO.z)*nz;let J=0,Jn=0;
 if((s>=0?u-w:w-u)>0)J=.55*(u-w);           // equal masses, restitution .1: (1+e)/2 of the closing speed
 if(Math.abs(sn)>.6&&un*sn>0)Jn=un*.9;      // driving into its side: the car doesn't roll sideways, so most of that motion stops
 if(!J&&!Jn)return;const cl=Math.abs(J)+Math.abs(Jn);
 c.cv=w+J;RO.v=V-J*(px*dx+pz*dz)-Jn*(px*nx+pz*nz);
 if(W>0&&Jn)c.lane=clamp(c.lane+Math.sign(sn)*Math.min(.5,Math.abs(Jn)*.05)/W,-.48,.48);
 c.hitT=Math.max(c.hitT||0,1.6+Math.min(2.5,cl*.12));
 if((c.crB||0)<=0&&cl>1.2){c.crB=.4;AU.sfx('bump');shake=Math.max(shake,Math.min(.45,.12+cl*.02))}}
// brake to a stop (locked-ish tyres), never past zero
function W10_brake(v,dt){const d=Math.min(Math.abs(v),(Math.abs(v)>12?8:6)*dt);return v-Math.sign(v)*d}
window.__drFix={DR,inSolid:(x,z)=>DR_inSolid(x,z),edge:DR_edgeX};

