// ---- CAM (cam-1, 2026-10-13). Alex: "Camera should auto adjust based on the vehicle size, else I can't see the road on big vehicles" (long red flatbed:
// the road ahead hidden by the vehicle). Why 98bc was not enough: BC_apply scales distance AND height by one factor (length^.65) and BC_tall only lifts the
// camera over the roof for H > 2.2 m; neither checks the line of sight past the nose, and the look-at stays ~1.5 m up, so on a 9-11 m ride the cab hides
// the road (the ray camera → road 10 m ahead passes 1-2 m below the cab roof). Also SC_rcam swaps the heights in one frame (a snap on a ride switch).
// Fix: the chase camera (b back, h up, l look-ahead) is SOLVED from the ride's measured side profile (vertices binned along its length): the road point
// 10 m past the nose must be in view over the cab (+0.3 m) at ~62 % screen height, the ride fills 15-35 % of the screen height (target 24 %), as close to
// the stock camera as possible (normal cars keep the stock camera when it already passes). Re-solved on every ride/aspect change, eased (≤ 4 m/s, ~2-3 s).
const CAM={on:1,k:'',due:0,f:0,P:null,T:{},cur:null,asp:0,sP:.62,fill:.24,m:.3,ahead:10,n:{fit:0,keep:0},go:null,log:[]};
const _cmV=new THREE.Vector3(),_cmB=new THREE.Box3();
// side profile in the car frame: z forward from RO, y up from RO.y; bins of 0.5 m → top height; g = lowest point (tyre bottoms)
function CAM_prof(host,F){if(!host){const ud=pl&&pl.mesh&&pl.mesh.userData;host=ud&&ud.m}if(!host)return null;host.updateMatrixWorld(true);F=F||{x:RO.x,y:RO.y,z:RO.z,h:RO.h};
 const sh=Math.sin(F.h),ch=Math.cos(F.h),bins=new Map();let z0=1e9,z1=-1e9,g=1e9,top=-1e9,n=0;
 const add=(x,y,z)=>{const dz=(x-F.x)*sh+(z-F.z)*ch,dy=y-F.y;if(!isFinite(dz)||!isFinite(dy))return;const k=Math.round(dz*2);bins.set(k,Math.max(bins.get(k)??-1e9,dy));z0=Math.min(z0,dz);z1=Math.max(z1,dz);g=Math.min(g,dy);top=Math.max(top,dy);n++};
 host.traverse(o=>{if(!o.isMesh)return;for(let q=o;q&&q!==host;q=q.parent)if(!q.visible)return;if(o.material&&o.material.visible===false)return;const P=o.geometry&&o.geometry.attributes.position;if(!P)return;
  if(o.isInstancedMesh){if(!o.boundingBox)o.computeBoundingBox();_cmB.copy(o.boundingBox).applyMatrix4(o.matrixWorld);for(let i=0;i<8;i++){_cmV.set(i&1?_cmB.max.x:_cmB.min.x,i&2?_cmB.max.y:_cmB.min.y,i&4?_cmB.max.z:_cmB.min.z);add(_cmV.x,_cmV.y,_cmV.z)}return}
  const st=Math.max(1,Math.floor(P.count/6000));for(let i=0;i<P.count;i+=st){_cmV.fromBufferAttribute(P,i).applyMatrix4(o.matrixWorld);add(_cmV.x,_cmV.y,_cmV.z)}});
 if(!n||z1-z0<.5)return null;const B=[...bins].map(([k,y])=>[k/2,y]).sort((a,b)=>a[0]-b[0]);return{z0,z1,g,top,B,L:z1-z0,H:top-g}}
// side-view projection: camera at (-b, h) looking down by th; screen fraction from the top of a point (z,y); T = tan(vfov/2)
const CAM_s=(b,h,th,T,z,y)=>.5+Math.tan(Math.atan2(h-y,z+b)-th)/(2*T);
function CAM_eval(P,b,h,th,T){const pz=P.z1+CAM.ahead,py=P.g;let clr=1e9,smin=1e9,smax=-1e9;
 for(const[z,y]of P.B){const ry=h+(py-h)*(z+b)/(pz+b);clr=Math.min(clr,ry-y);for(const yy of[y,P.g]){const s=CAM_s(b,h,th,T,z,yy);smin=Math.min(smin,s);smax=Math.max(smax,s)}}
 return{clr,sP:CAM_s(b,h,th,T,pz,py),fill:Math.min(1,smax)-Math.max(0,smin),smax}}
const CAM_ok=e=>e.clr>=CAM.m&&e.sP>=.42&&e.sP<=.82&&e.fill>=.17&&e.fill<=.33&&e.smax<=.95;
function CAM_vfov(asp){const a=asp||camera.aspect||1.5,f=TUNE.fov+({narrow:-6,normal:0,wide:8}[SET.fov]||0);return(a<.9?Math.min(100,f*(1+.5*Math.min(1,(.9-a)/.45))):f)*Math.PI/180}
function CAM_base(n){const k=SC_S&&SC_S.on?BC.D0.cam:1,C=SC_RC0[n];return{b:C.b*k,h:C.h*k,l:C.l*k,ly:C.ly*k,bk:C.bk*k,hk:C.hk*k,lk:C.lk*k}}
function CAM_solve(P,n,asp,C0x){const C0=C0x||CAM_base(n),T=Math.tan(CAM_vfov(asp)/2);
 const th0=Math.atan2(C0.h-C0.ly,C0.l+C0.b),e0=CAM_eval(P,C0.b,C0.h,th0,T);if(CAM_ok(e0))return Object.assign({keep:1,e:e0},C0);
 // perf (beta.12 "extremely slow": the full 0.25 m × 0.1 m grid = 58k evaluations, every 4 s, 4 modes): coarse 1 m × 0.5 m grid, then a fine pass around the best
 let best=null,bc=1e9;const bMin=Math.max(C0.b*.8,-P.z0+1.5),hMin=Math.max(1.2,C0.h*.8),aim=Math.atan(2*(CAM.sP-.5)*T);CAM.n.ev=0;
 const scan=(b0,b1,bs,h0,h1,hs)=>{for(let b=Math.max(bMin,b0);b<=b1;b+=bs)for(let h=Math.max(hMin,h0);h<=h1;h+=hs){CAM.n.ev++;const aP=Math.atan2(h-P.g,P.z1+CAM.ahead+b),th=aP-aim,e=CAM_eval(P,b,h,th,T);if(!CAM_ok(e))continue;
  const c=((b-C0.b)/C0.b)**2+((h-C0.h)/C0.h)**2+6*(e.fill-CAM.fill)**2;if(c<bc){bc=c;best={b,h,th,e}}}};
 scan(bMin,60,1,hMin,30,.5);if(best){const B=best.b,H=best.h;scan(B-1,B+1,.25,H-.5,H+.5,.1)}
 if(!best)return Object.assign({keep:1,fail:1,e:e0},C0);const{b,h,th}=best,ly=C0.ly,l=Math.max(4,(h-ly)/Math.max(.02,Math.tan(th))-b),r=b/C0.b;
 return{b:+b.toFixed(2),h:+h.toFixed(2),l:+l.toFixed(2),ly,bk:C0.bk*r,hk:0,lk:C0.lk*l/C0.l,e:best.e}}
function CAM_fit(){const t0=performance.now(),P=CAM_prof();if(!P)return;CAM.P=P;CAM.asp=camera.aspect;CAM.T={};const n0=SET.rcam||'chase';let kp=0;if(n0!=='high'){const s=CAM_solve(P,n0);CAM.T[n0]=s;kp=s.keep}CAM.ms=performance.now()-t0
 CAM.n.fit++;if(kp)CAM.n.keep++;CAM.log.push([RO.vsel||'',+P.L.toFixed(2),+P.H.toFixed(2),(CAM.T[SET.rcam||'chase']||{}).b,(CAM.T[SET.rcam||'chase']||{}).h]);if(CAM.log.length>20)CAM.log.shift()}
// when: 30 sim frames after the ride (mesh / form) changes (the first frames still show stock parts), on a big aspect change (rotation) or a camera-mode change; never periodically (perf)
function CAM_upd(){const ud=pl&&pl.mesh&&pl.mesh.userData;if(!ud||!ud.m||(pl.boatK||0)>.5)return;const key=CAM_rkey(ud)+'|'+(RO.vsel||'')+'|'+(typeof CR_MODE!=='undefined'?CR_MODE:''),now=++CAM.f;
 if(key!==CAM.k){CAM.k=key;CAM.due=now+30;CAM.pend=1;return}if(Math.abs((camera.aspect||1)-CAM.asp)>.05){CAM.due=Math.min(CAM.due,now);CAM.pend=1}if(!CAM.T[SET.rcam||'chase']&&(SET.rcam||'chase')!=='high'&&!CAM.pend&&CAM.P){CAM.due=now;CAM.pend=1}if(!CAM.pend||now<CAM.due)return;CAM_fit();CAM.pend=0}
// ride fingerprint: the player mesh is KEPT across rides (garage pick rebuilds gbM bricks on it; TAKE / ENTER swap the body children of ud.m), so the old key (mesh uuid + gbM.length)
// missed same-count swaps and the camera stayed on the previous ride. Any change of the brick meshes or of the body children now re-fits (all paths, no per-caller hook).
function CAM_rkey(ud){const m=ud.m,g=ud.gbM,c=m.children,l=c[c.length-1],f=c[0];return m.uuid+'|'+(g?g.length+'.'+(g[0]?g[0].uuid:''):0)+'|'+c.length+'.'+(f?f.uuid:'')+'.'+(l?l.uuid:'')}
// race camera (state 'race' = updateCam in 30_race3, not roamCam): same solver, ride profile measured in its own frame; returns multipliers for the stock back / up
// race ride heading = the track tangent at the ship (the model's own +z is not reliably the nose in a race)
function CAM_fwd(s){try{frameAt(TD,s.dist,F2);const l=Math.hypot(F2.t.x,F2.t.z)||1;return[F2.t.x/l,F2.t.z/l]}catch(e){return[0,1]}}
function CAM_rk(s){const one={b:1,h:1,l:1};try{const ud=s&&s.mesh&&s.mesh.userData,host=ud&&ud.m;if(!CAM.on||!host)return one;const R=CAM.R||(CAM.R={}),key=CAM_rkey(ud)+'|'+(camera.aspect||0).toFixed(1)+'|'+SET.camd;
 if(R.s===s&&R.k===key&&R.v)return R.v;host.updateMatrixWorld(true);const e=host.matrixWorld.elements,fw=CAM_fwd(s),F={x:e[12],y:e[13],z:e[14],h:Math.atan2(fw[0],fw[1])},P=CAM_prof(host,F);if(!P)return one;
 const sv=CAM_solve(P,'chase',null,CAM_rbase());R.s=s;R.k=key;R.P=P;R.v={b:clamp(sv.b/R.C0.b,.8,6),h:clamp(sv.h/R.C0.h,.8,6),l:clamp(sv.l/R.C0.l,.6,3)};R.n=(R.n||0)+1;return R.v}catch(e){return one}}
// the race camera's stock numbers as a roam-style base: back 10.5, up 3.4 (× aspect / setting), look point = 58 % of 50 m ahead, 1.66 m up (the lerp to the ship in updateCam)
function CAM_rbase(){const R=CAM.R||(CAM.R={}),tall=camera.aspect<1?1.3:1,cd={close:.85,normal:1,far:1.2}[SET.camd]||1;return R.C0={b:10.5*tall*cd,h:3.4*tall*cd,l:29,ly:1.66,bk:0,hk:0,lk:0}}
const CAM_F=['b','h','l','ly','bk','hk','lk'];
roamCam=(f=>function(dt){if(CAM.on&&state==='roam'&&(!RO.foot||RO.foot==='car')){try{CAM_upd();const n=SET.rcam||'chase',T=CAM.T[n],C=RCAM[n];
  const tn=performance.now(),rd=Math.min(dt,Math.max(0,Math.min(.1,(tn-(CAM.lt||tn))/1000)));CAM.lt=tn;
  if(T&&C){const k=camSnap||!CAM.cur||CAM.cur.n!==n?1:Math.min(1,dt*1.4);if(k===1)CAM.cur={n};for(const q of CAM_F){const o=CAM.cur[q];let v;if(o==null||k===1)v=T[q];else{const d=(T[q]-o)*k,mx=(q==='l'||q==='lk'?Math.max(4,.5*Math.abs(T[q]-o)):q.length===1||q==='ly'?4:2)*rd;v=o+clamp(d,-mx,mx)}CAM.cur[q]=v;C[q]=v}}}catch(e){}}
 const r=f(dt);try{const c=camera.position,ft=RO.foot&&RO.foot!=='car',ox=ft?OF.x:RO.x,oz=ft?OF.z:RO.z;const C=RCAM[SET.rcam||'chase'];CAM.cp={b:Math.hypot(c.x-ox,c.z-oz),h:c.y-(ft?OF.y:RO.y),cb:RO.camB,cy:RO.camY-RO.y,Ch:C&&C.h,Cb:C&&C.b,v:RO.v||0,x:RO.x,z:RO.z,t:performance.now()}}catch(e){}return r})(roamCam);
// SC_rcam (BC_apply on a ride change) rewrites RCAM from the stock table in one frame: put the blended values straight back (no snap)
SC_rcam=(f=>function(){const r=f.apply(this,arguments);try{const n=SET.rcam||'chase',C=RCAM[n];if(CAM.on&&CAM.cur&&CAM.cur.n===n&&C)for(const q of CAM_F)if(CAM.cur[q]!=null)C[q]=CAM.cur[q]}catch(e){}return r})(SC_rcam);
// ---- test: what the player sees (real camera, 3D): ride share of the screen height, road point 10 m past the nose (ray not blocked by the ride, its
// screen spot). Works on foot too (the minifig is "the ride").
function CAM_meas(){camera.updateMatrixWorld(true);const foot=RO.foot&&RO.foot!=='car',host=foot?(OF.fig&&OF.fig.g):pl&&pl.mesh&&pl.mesh.userData.m;
 const objs=[];let h=RO.h;if(foot)h=OF.h;if(host)objs.push(host);if(!objs.length)return null;
 const B=new THREE.Box3();for(const o of objs){o.updateMatrixWorld(true);o.traverse(m=>{if(!m.isMesh)return;for(let q=m;q&&q.parent;q=q.parent)if(!q.visible)return;B.expandByObject(m)})}
 if(B.isEmpty())return null;const fx=Math.sin(h),fz=Math.cos(h),sx=-fz,sz=fx,ox=foot?OF.x:RO.x,oz=foot?OF.z:RO.z;
 // the ride's own oriented box: project all vertices of its meshes onto (forward, side) for the nose, and onto the screen for the share
 let zf=-1e9,ymin=1e9,ymax=-1e9,xmin=1e9,xmax=-1e9;const v=new THREE.Vector3();
 for(const o of objs)o.traverse(m=>{if(!m.isMesh)return;for(let q=m;q&&q.parent;q=q.parent)if(!q.visible)return;const P=m.geometry&&m.geometry.attributes.position;if(!P)return;
  if(m.isInstancedMesh){if(!m.boundingBox)m.computeBoundingBox();const bb=m.boundingBox.clone().applyMatrix4(m.matrixWorld);for(let i=0;i<8;i++){v.set(i&1?bb.max.x:bb.min.x,i&2?bb.max.y:bb.min.y,i&4?bb.max.z:bb.min.z);acc(v)}return}
  const st=Math.max(1,Math.floor(P.count/4000));for(let i=0;i<P.count;i+=st){v.fromBufferAttribute(P,i).applyMatrix4(m.matrixWorld);acc(v)}});
 function acc(w){zf=Math.max(zf,(w.x-ox)*fx+(w.z-oz)*fz);const p=w.clone().project(camera);if(p.z>1)return;ymin=Math.min(ymin,p.y);ymax=Math.max(ymax,p.y);xmin=Math.min(xmin,p.x);xmax=Math.max(xmax,p.x)}
 const px=ox+fx*(zf+CAM.ahead),pz=oz+fz*(zf+CAM.ahead),py=groundAt(px,pz,(foot?OF.y:RO.y)+2)+.05,Pt=new THREE.Vector3(px,py,pz),dir=Pt.clone().sub(camera.position),dist=dir.length();dir.normalize();
 const rc=new THREE.Raycaster(camera.position.clone(),dir,0,dist-.05);rc.camera=camera;const hits=rc.intersectObjects(objs,true).filter(i=>{const m=i.object;for(let q=m;q&&q.parent;q=q.parent)if(!q.visible)return false;return!(m.material&&(m.material.transparent&&m.material.opacity<.6||m.material.visible===false))});
 const sp=Pt.clone().project(camera),fill=(Math.min(1,ymax)-Math.max(-1,ymin))/2;
 return{foot:!!foot,vsel:RO.vsel||'',W:innerWidth,H:innerHeight,fill:+fill.toFixed(3),top:+((1-Math.min(1,ymax))/2).toFixed(3),bot:+((1-Math.max(-1,ymin))/2).toFixed(3),
  road:{x:+((sp.x+1)/2).toFixed(3),y:+((1-sp.y)/2).toFixed(3),blocked:hits.length,by:hits[0]?(hits[0].object.name||hits[0].object.type):null,d:+dist.toFixed(1)},
  cam:{b:+Math.hypot(camera.position.x-ox,camera.position.z-oz).toFixed(2),h:+(camera.position.y-(foot?OF.y:RO.y)).toFixed(2),fov:+camera.fov.toFixed(1)},
  fit:CAM.T[SET.rcam||'chase']?{b:CAM.T[SET.rcam||'chase'].b,h:CAM.T[SET.rcam||'chase'].h,keep:!!CAM.T[SET.rcam||'chase'].keep,fail:!!CAM.T[SET.rcam||'chase'].fail}:null,
  P:CAM.P?{L:+CAM.P.L.toFixed(2),H:+CAM.P.H.toFixed(2)}:null,v:+(RO.v||0).toFixed(1),x:+RO.x.toFixed(1),z:+RO.z.toFixed(1),h:+RO.h.toFixed(3)}}
const CAM_pass=m=>!!m&&!m.road.blocked&&m.road.x>=1/3&&m.road.x<=2/3&&m.road.y>=.4&&m.road.y<=.85&&m.fill>=.15&&m.fill<=.35;
// ---- 📍 GO: put the asked ride on a long straight Frankfurt street (centre of the lane, facing along it), stopped; 'foot' = on foot on a pavement
const CAM_RIDES={bus:['t_bus','SIGHTSEEING BUS'],flatbed:['t_v60017_1','FLATBED (60017)'],truck:['t_v60059_1','LOGGER (60059), the longest/tallest truck'],sport:['t_v75870_1','Z06 RACER (75870), small sports car']};
function CAM_road(minLen){const N=HUB.nodes;if(!N)return null;const L=[];for(let i=0;i<N.length;i++){const A=N[i];if(!A||A.ab||!A.nb||!A.nb.length)continue;L.push([Math.hypot(A.x-RO.x,A.z-RO.z),i])}L.sort((a,b)=>a[0]-b[0]);
 for(const[,i]of L.slice(0,400)){const A=N[i];for(const j of A.nb){const B=N[j];if(!B||B.ab)continue;const len=Math.hypot(B.x-A.x,B.z-A.z);if(len<minLen)continue;const dx=(B.x-A.x)/len,dz=(B.z-A.z)/len;let ok=true;
   for(let s=6;s<=len-6&&ok;s+=2){const x=A.x+dx*s,z=A.z+dz*s;if(roamHit(x,z,2.2,groundAt(x,z,99)+1)||CID==='fra'&&inRiver(x,z))ok=false}
   if(ok){const w=Math.min(A.w||12,B.w||12),lo=w>=10?w/4:0;return{x:A.x+dx*12-dz*lo,z:A.z+dz*12+dx*lo,h:Math.atan2(dx,dz),len}}}}return null}
function CAM_go(kind){if(state!=='roam'||!RO.on)return'📍 Start free roam first';if(RO.ch||RO.sp){try{if(RO.sp)sprintEnd();chAbort()}catch(e){}}if(RO.card){RO.card=null;$('#roamCard').hidden=true}
 if(kind==='foot'){const r=OF_go('walk');CAM.go={kind,done:1,t:performance.now()};return r.replace('walk ahead, then turn','check: road 10 m ahead in view')}
 try{OF_reset()}catch(e){}const R=CAM_RIDES[kind];if(!R)return'📍 ?';const G=CAM.go={kind,done:0,t:performance.now()};
 const place=()=>{const q=CAM_road(70);if(q){roamWarp(q.x,q.z,q.h,true)}G.done=1;G.t=performance.now();G.road=q?Math.round(q.len):0};
 let cur='';try{cur=GAR_get().sel}catch(e){}
 if(cur===R[0]){place();return'📍 '+R[1]+' · on a straight street: the road 10 m past the nose shows in the lower middle, the ride fills 15-35 % of the screen height'}
 try{gbOpen();GAR_select(R[0])}catch(e){G.done=-1;return'📍 Can\'t switch the ride here'}
 let n=0;const w=()=>{if((typeof LDL==='undefined'||!LDL.wait.size)||++n>150){try{gbClose(true)}catch(e){}setTimeout(place,400)}else setTimeout(w,200)};setTimeout(w,300);
 return'📍 '+R[1]+' · loading the ride, then a straight street: the road 10 m past the nose shows in the lower middle, the ride fills 15-35 % of the screen height'}
// ---- audit (cam-1 queue: "every ride, state only, < 60 s"): each ride is built off-screen at the origin facing +z (as RSZ.meas does), its chase
// camera solved for 852×393 and 393×852, then a virtual camera at that pose: raycast to the road 10 m past the nose (blocked by the ride?), project the
// ride's vertices (share of the screen height) and the road point (lower middle?). Returns [{id,n,L,H,land:{…},port:{…},ok}] and the failures.
function CAM_view(g,P,s,asp){const vc=new THREE.PerspectiveCamera(CAM_vfov(asp)*180/Math.PI,asp,.1,2000);vc.position.set(0,s.h,-s.b);vc.lookAt(0,s.ly,s.l);vc.updateMatrixWorld(true);vc.updateProjectionMatrix();
 const objs=[g.userData.m],v=new THREE.Vector3();let y0=1e9,y1=-1e9;g.userData.m.traverse(m=>{if(!m.isMesh)return;for(let q=m;q&&q!==g;q=q.parent)if(!q.visible)return;const A=m.geometry&&m.geometry.attributes.position;if(!A)return;
  const st=Math.max(1,Math.floor(A.count/3000));for(let i=0;i<A.count;i+=st){v.fromBufferAttribute(A,i).applyMatrix4(m.matrixWorld).project(vc);if(v.z>1)continue;y0=Math.min(y0,v.y);y1=Math.max(y1,v.y)}});
 const Pt=new THREE.Vector3(0,P.g+.05,P.z1+CAM.ahead),dir=Pt.clone().sub(vc.position),d=dir.length();dir.normalize();const rc=new THREE.Raycaster(vc.position.clone(),dir,0,d-.05);rc.camera=vc;
 const hit=rc.intersectObjects(objs,true).filter(i=>{const m=i.object;for(let q=m;q&&q!==g;q=q.parent)if(!q.visible)return false;return!(m.material&&(m.material.transparent&&m.material.opacity<.6||m.material.visible===false))}).length,sp=Pt.clone().project(vc);
 const r={bot:+((1-y0)/2).toFixed(3),fill:+((Math.min(1,y1)-Math.max(-1,y0))/2).toFixed(3),rx:+((sp.x+1)/2).toFixed(3),ry:+((1-sp.y)/2).toFixed(3),hit,b:+s.b.toFixed(2),h:+s.h.toFixed(2),keep:!!s.keep};r.ok=!hit&&r.bot<=.98&&r.rx>=1/3&&r.rx<=2/3&&r.ry>=.4&&r.ry<=.85&&r.fill>=.15&&r.fill<=.35;return r}
async function CAM_audit(ids,stock){const t0=performance.now(),b0=gbBuild()||GB.d,L=(ids?ids.map(GAR_set):RSZ.sets()).filter(Boolean),need=[];for(const S of L){try{need.push(...LD_probe(()=>[].concat(GAR_arr(S.car()))))}catch(e){}}
 if(need.length)await LD_need(need);const out=[];
 for(const S of L){let g=null;try{const B=G9C_bricks(S,'car');RSZ.S=S;g=shipMesh(gbTeam(TEAMS[teamIdx],Object.assign({},b0,{on:true,bricks:B})));scene.add(g);SC_ship(g,true);CR_fx({boatK:0},g.userData);g.position.set(0,0,0);g.rotation.set(0,0,0);g.updateMatrixWorld(true);
   const P=CAM_prof(g.userData.m,{x:0,y:0,z:0,h:0});if(!P){out.push({id:S.id,n:S.n,err:'no profile'});continue}const o={id:S.id,n:S.n,L:+P.L.toFixed(2),H:+P.H.toFixed(2)};
   for(const[k,a]of[['land',852/393],['port',393/852]]){const s=stock?Object.assign({keep:1},CAM_base('chase')):CAM_solve(P,'chase',a);o[k]=CAM_view(g,P,s,a);if(s.fail)o[k].fail=1}o.ok=o.land.ok&&o.port.ok;out.push(o)}
  catch(e){out.push({id:S.id,n:S.n,err:String(e).slice(0,80)})}finally{RSZ.S=null;if(g){scene.remove(g)}}}
 const bad=out.filter(o=>!o.ok);return{n:out.length,ok:out.length-bad.length,ms:Math.round(performance.now()-t0),bad,all:out}}
window.__cam={S:CAM,audit:CAM_audit,meas:CAM_meas,pass:m=>CAM_pass(m||CAM_meas()),go:CAM_go,fit:()=>{CAM.k='';CAM.due=0;CAM_fit();return CAM.T},prof:()=>CAM.P&&{L:CAM.P.L,H:CAM.P.H,z0:CAM.P.z0,z1:CAM.P.z1,g:CAM.P.g},rc:()=>RCAM[SET.rcam||'chase'],cp:()=>CAM.cp||null,settled:()=>{const n=SET.rcam||'chase',T=CAM.T[n],c=CAM.cur;if(RO.foot&&RO.foot!=='car')return true;if(!T||!c||CAM.pend||Math.abs((camera.aspect||1)-CAM.asp)>.05)return false;return['b','h','l','ly'].every(q=>Math.abs((c[q]??0)-(T[q]??0))<.05)},sel:()=>{try{return GAR_get().sel}catch(e){return null}}};
// ---- cam-2 (2026-10-14): ride-switch tests. "The camera does not adjust when I switch vehicles / in races": every way the ride changes must re-fit the camera.
// CAM_sw(path) = the 📍 GO of v90n/cam-sw-*: runs the switch with the game's own functions (garage pick, vehicle button, TAKE, ENTER, race start), waits for the
// eased camera and checks it against a FRESH solve of the ride now on screen (within 10 %), and that the road 10 m past the nose is in view. Resolves to a one-line verdict.
const CAM_W=ms=>new Promise(r=>setTimeout(r,ms));
async function CAM_until(f,ms){const e=performance.now()+ms;while(performance.now()<e){try{if(f())return true}catch(x){}await CAM_W(60)}return false}
function CAM_now(tag){const n=SET.rcam||'chase',P=CAM_prof();if(!P)return{tag,ok:false,why:'no ride profile'};const fr=CAM_solve(P,n),C=RCAM[n];
 const dB=Math.abs(C.b-fr.b)/fr.b,dH=Math.abs(C.h-fr.h)/fr.h;return{tag,L:+P.L.toFixed(1),H:+P.H.toFixed(1),fb:+fr.b.toFixed(1),fh:+fr.h.toFixed(1),b:+C.b.toFixed(1),h:+C.h.toFixed(1),ok:dB<=.1&&dH<=.1}}
// wait (≤ 7 s: 30-frame delay + the ≤ 4 m/s ease) until the camera equals the ride's fit, then require the road ahead in view (real camera, lower middle)
async function CAM_conv(tag,wantRoad=true){const t0=performance.now();let r;await CAM_until(()=>{r=CAM_now(tag);return r.ok&&!CAM.pend},7000);r=CAM_now(tag);r.s=+((performance.now()-t0)/1000).toFixed(1);
 if(r.ok&&wantRoad){const m=CAM_meas();r.road=m&&m.road?{x:+m.road.x.toFixed(2),y:+m.road.y.toFixed(2),bl:!!m.road.blocked}:null;r.ok=CAM_pass(m)}return r}
async function CAM_garage(id,force){const cur=(()=>{try{return GAR_get().sel}catch(e){return''}})();if(cur===id&&!force)return true;try{gbOpen();GAR_select(id)}catch(e){return false}
 await CAM_W(300);await CAM_until(()=>typeof LDL==='undefined'||!LDL.wait.size,30000);try{gbClose(true)}catch(e){return false}await CAM_W(400);return true}
function CAM_fmt(R,extra){return R.map(r=>r.tag+' '+(r.ok?'ok':'NO')+' L'+r.L+' cam '+r.b+'/'+r.h+' fit '+r.fb+'/'+r.fh+' '+r.s+'s'+(r.road?' road '+r.road.x+','+r.road.y+(r.clr!==undefined?' clr '+r.clr:''):'')).join(' · ')+(extra||'')}
async function CAM_ground(){if(state!=='roam'||!RO.on)return'📍 Start free roam first';if(RO.ch||RO.sp){try{if(RO.sp)sprintEnd();chAbort()}catch(e){}}if(RO.card){RO.card=null;$('#roamCard').hidden=true}try{OF_reset()}catch(e){}
 const q=CAM_road(70);if(q)roamWarp(q.x,q.z,q.h,true);await CAM_W(200);return''}
const CAM_SP='t_v75870_1',CAM_BUS='t_bus';
// the three-step rule for every path: sports car → bus → sports car; the camera distance must change with the ride (bus fit ≥ 1.3 × the sports fit)
function CAM_verdict(R,name,nobus){const bad=R.filter(r=>!r.ok);let sw='';const a=R[0],b=R[1];if(!nobus&&a&&b&&b.fb<a.fb*1.3){sw=' · bus fit '+b.fb+' not larger than sports '+a.fb;bad.push(b)}
 return(bad.length?'❌ FAIL '+name+': ':'✅ PASS '+name+': ')+CAM_fmt(R,sw)}
async function CAM_sw(path){const R=[];const g=await CAM_ground();if(g)return g;
 try{
 if(path==='garage'){for(const id of[CAM_SP,CAM_BUS,CAM_SP]){if(!await CAM_garage(id,1))return'❌ FAIL garage: cannot pick '+id;R.push(await CAM_conv(id==='t_bus'?'bus':'sports'))}return CAM_verdict(R,'garage pick')}
 if(path==='cycle'){await CAM_garage(CAM_SP,1);R.push(await CAM_conv('auto'));const seen=[];for(let i=0;i<4;i++){cycleVehicle();const v=RO.vsel;seen.push(v);if(v==='boat'){await CAM_W(600);continue}R.push(await CAM_conv(v))}
  return CAM_verdict(R,'vehicle button '+seen.join('>'),1)}
 if(path==='take'||path==='enter'){await CAM_garage(CAM_SP,1);R.push(await CAM_conv('sports'));OF_go('car');await CAM_until(()=>RO.foot==='walk',4000);
  const goTo=o=>{OF.x=o.x+Math.cos(o.h)*3.2;OF.z=o.z-Math.sin(o.h)*3.2;OF.y=groundAt(OF.x,OF.z,OF.y+2)};
  const pick=()=>OF_cars(true).filter(o=>(o.k==='traf'||o.k==='park')&&o.ref&&!o.ref.dead&&HCAR[o.ref.k]&&HCAR[o.ref.k][0]!=='#'&&!o.ref.tr&&!o.ref.route&&!o.ref.crW&&Math.hypot(o.x-RO.x,o.z-RO.z)<200).sort((a,b)=>Math.hypot(a.x-RO.x,a.z-RO.z)-Math.hypot(b.x-RO.x,b.z-RO.z))[0];
  await CAM_until(()=>pick(),8000);const o=pick();if(!o)return'❌ FAIL '+path+': no traffic car near';goTo(o);const o2=OF_cars(true).find(q=>q.ref===o.ref)||o;OF_enter(o2);
  if(!await CAM_until(()=>RO.foot==='car',8000))return'❌ FAIL '+path+': never got into the traffic car';R.push(await CAM_conv('taken '+(HCAR[o.ref.k]||[])[0]));
  if(path==='enter'){OF_exit();await CAM_until(()=>RO.foot==='walk',3000);const v=OF_cars(false).find(q=>q.k==='grp');if(!v)return'❌ FAIL enter: no parked car of yours';goTo(v);OF_enter(v);
   if(!await CAM_until(()=>RO.foot==='car',8000))return'❌ FAIL enter: never got back into your parked car';R.push(await CAM_conv('back in parked'))}
  const bad=R.filter(r=>!r.ok);return(bad.length?'❌ FAIL ':'✅ PASS ')+(path==='take'?'TAKE traffic car':'ENTER parked car')+': '+CAM_fmt(R)+(R[1]&&R[0]&&Math.abs(R[1].fb-R[0].fb)<.05&&R[1].L>R[0].L*1.2?' · fit did not change':'')}
 if(path==='race'||path==='racebus'){const rides=path==='racebus'?[CAM_BUS]:[CAM_SP,CAM_BUS];
  for(const id of rides){await CAM_garage(id,1);R.push(await CAM_race(id===CAM_BUS?'bus race':'sports race'))}return CAM_verdict(R,'race start')}
 }catch(e){return'❌ FAIL '+path+': '+String(e).slice(0,120)}
 return'📍 ?'}
// race start (state 'race', updateCam): launch like a roam race marker, wait for the countdown, compare the camera with the ride's fit; back to the city afterwards
async function CAM_race(tag){roamSavePos();if(CM.on)cmClose();RO.on=false;$('#roam').hidden=true;RO.card=null;menuTab='quick';menuTrack='synt';quickTraffic=false;RO.launching=true;startRace();RO.launching=false;RO.fromRoam=true;
 if(!await CAM_until(()=>state==='race'&&pl&&pl.mesh,25000))return{tag,ok:false,L:0,b:0,h:0,fb:0,fh:0,s:0,why:'race did not start'};await CAM_until(()=>typeof LDL==='undefined'||!LDL.wait.size,20000);await CAM_W(2500);
 const r=CAM_rchk(tag);try{paused=false;$('#pause').hidden=true;enterRoam(RO.lastMark)}catch(e){}await CAM_until(()=>state==='roam'&&RO.on,25000);await CAM_W(400);return r}
// race camera vs the ride: horizontal distance behind the ride = stock × fit multiplier (±10 %), and the road 10 m past the nose is above the ride's roofline from the camera
function CAM_rchk(tag){const s=pl,ud=s.mesh.userData,host=ud.m;host.updateMatrixWorld(true);const e=host.matrixWorld.elements,fw=CAM_fwd(s),fx=fw[0],fz=fw[1],P=CAM_prof(host,{x:e[12],y:e[13],z:e[14],h:Math.atan2(fx,fz)});
 if(!P)return{tag,ok:false,L:0,b:0,h:0,fb:0,fh:0,s:0,why:'no profile'};const c=camera.position,rl=c.clone().sub(new THREE.Vector3(e[12],e[13],e[14])),back=-rl.dot(F2.t),up=rl.dot(F2.u),d=new THREE.Vector3();camera.getWorldDirection(d);const th=-Math.atan2(d.dot(F2.u),d.dot(F2.t));
 const T=Math.tan(CAM_vfov(camera.aspect)/2),ev=CAM_eval(P,back,up,th,T),ck=CAM_rk(s),tall=camera.aspect<1?1.3:1,cd={close:.85,normal:1,far:1.2}[SET.camd]||1,want=10.5*tall*cd*ck.b;
 const okB=Math.abs(back-want)/want<=.1,okRoad=ev.clr>=0&&ev.sP<=.95&&ev.sP>=.3;
 return{tag,L:+P.L.toFixed(1),H:+P.H.toFixed(1),fb:+want.toFixed(1),fh:+(3.4*tall*cd*ck.h).toFixed(1),b:+back.toFixed(1),h:+up.toFixed(1),s:2.5,ok:okB&&okRoad,road:{x:.5,y:+ev.sP.toFixed(2)},clr:+ev.clr.toFixed(2)}}
window.__cam.sw=CAM_sw;window.__cam.now=CAM_now;
