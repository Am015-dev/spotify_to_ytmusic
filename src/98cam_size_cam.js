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
function CAM_prof(){const ud=pl&&pl.mesh&&pl.mesh.userData,host=ud&&ud.m;if(!host)return null;host.updateMatrixWorld(true);
 const sh=Math.sin(RO.h),ch=Math.cos(RO.h),bins=new Map();let z0=1e9,z1=-1e9,g=1e9,top=-1e9,n=0;
 const add=(x,y,z)=>{const dz=(x-RO.x)*sh+(z-RO.z)*ch,dy=y-RO.y;if(!isFinite(dz)||!isFinite(dy))return;const k=Math.round(dz*2);bins.set(k,Math.max(bins.get(k)??-1e9,dy));z0=Math.min(z0,dz);z1=Math.max(z1,dz);g=Math.min(g,dy);top=Math.max(top,dy);n++};
 host.traverse(o=>{if(!o.isMesh)return;for(let q=o;q&&q!==host;q=q.parent)if(!q.visible)return;if(o.material&&o.material.visible===false)return;const P=o.geometry&&o.geometry.attributes.position;if(!P)return;
  if(o.isInstancedMesh){if(!o.boundingBox)o.computeBoundingBox();_cmB.copy(o.boundingBox).applyMatrix4(o.matrixWorld);for(let i=0;i<8;i++){_cmV.set(i&1?_cmB.max.x:_cmB.min.x,i&2?_cmB.max.y:_cmB.min.y,i&4?_cmB.max.z:_cmB.min.z);add(_cmV.x,_cmV.y,_cmV.z)}return}
  const st=Math.max(1,Math.floor(P.count/6000));for(let i=0;i<P.count;i+=st){_cmV.fromBufferAttribute(P,i).applyMatrix4(o.matrixWorld);add(_cmV.x,_cmV.y,_cmV.z)}});
 if(!n||z1-z0<.5)return null;const B=[...bins].map(([k,y])=>[k/2,y]).sort((a,b)=>a[0]-b[0]);return{z0,z1,g,top,B,L:z1-z0,H:top-g}}
// side-view projection: camera at (-b, h) looking down by th; screen fraction from the top of a point (z,y); T = tan(vfov/2)
const CAM_s=(b,h,th,T,z,y)=>.5+Math.tan(Math.atan2(h-y,z+b)-th)/(2*T);
function CAM_eval(P,b,h,th,T){const pz=P.z1+CAM.ahead,py=P.g;let clr=1e9,smin=1e9,smax=-1e9;
 for(const[z,y]of P.B){const ry=h+(py-h)*(z+b)/(pz+b);clr=Math.min(clr,ry-y);for(const yy of[y,P.g]){const s=CAM_s(b,h,th,T,z,yy);smin=Math.min(smin,s);smax=Math.max(smax,s)}}
 return{clr,sP:CAM_s(b,h,th,T,pz,py),fill:Math.min(1,smax)-Math.max(0,smin),smax}}
const CAM_ok=e=>e.clr>=CAM.m&&e.sP>=.42&&e.sP<=.82&&e.fill>=.16&&e.fill<=.34&&e.smax<=.98;
function CAM_vfov(){const a=camera.aspect||1.5,f=TUNE.fov+({narrow:-6,normal:0,wide:8}[SET.fov]||0);return(a<.9?Math.min(100,f*(1+.5*Math.min(1,(.9-a)/.45))):f)*Math.PI/180}
function CAM_base(n){const k=SC_S&&SC_S.on?BC.D0.cam:1,C=SC_RC0[n];return{b:C.b*k,h:C.h*k,l:C.l*k,ly:C.ly*k,bk:C.bk*k,hk:C.hk*k,lk:C.lk*k}}
function CAM_solve(P,n){const C0=CAM_base(n),T=Math.tan(CAM_vfov()/2);
 const th0=Math.atan2(C0.h-C0.ly,C0.l+C0.b),e0=CAM_eval(P,C0.b,C0.h,th0,T);if(CAM_ok(e0))return Object.assign({keep:1,e:e0},C0);
 let best=null,bc=1e9;const bMin=Math.max(C0.b*.8,-P.z0+1.5),aim=Math.atan(2*(CAM.sP-.5)*T);
 for(let b=bMin;b<=60;b+=.25)for(let h=Math.max(1.2,C0.h*.8);h<=30;h+=.1){const aP=Math.atan2(h-P.g,P.z1+CAM.ahead+b),th=aP-aim,e=CAM_eval(P,b,h,th,T);if(!CAM_ok(e))continue;
  const c=((b-C0.b)/C0.b)**2+((h-C0.h)/C0.h)**2+6*(e.fill-CAM.fill)**2;if(c<bc){bc=c;best={b,h,th,e}}}
 if(!best)return Object.assign({keep:1,fail:1,e:e0},C0);const{b,h,th}=best,ly=C0.ly,l=Math.max(4,(h-ly)/Math.max(.02,Math.tan(th))-b),r=b/C0.b;
 return{b:+b.toFixed(2),h:+h.toFixed(2),l:+l.toFixed(2),ly,bk:C0.bk*r,hk:0,lk:C0.lk*l/C0.l,e:best.e}}
function CAM_fit(){const P=CAM_prof();if(!P)return;CAM.P=P;CAM.asp=camera.aspect;CAM.T={};let kp=0;for(const n in RCAM){if(n==='high')continue;const s=CAM_solve(P,n);CAM.T[n]=s;if(n===(SET.rcam||'chase'))kp=s.keep}
 CAM.n.fit++;if(kp)CAM.n.keep++;CAM.log.push([RO.vsel||'',+P.L.toFixed(2),+P.H.toFixed(2),(CAM.T[SET.rcam||'chase']||{}).b,(CAM.T[SET.rcam||'chase']||{}).h]);if(CAM.log.length>20)CAM.log.shift()}
// when: 30 sim frames after the ride (mesh / form) changes (the first frames still show stock parts), on a big aspect change (rotation), then every 4 s
function CAM_upd(){const ud=pl&&pl.mesh&&pl.mesh.userData;if(!ud||!ud.m||(pl.boatK||0)>.5)return;const key=ud.m.uuid+'|'+(ud.gbM?ud.gbM.length:0)+'|'+(RO.vsel||'')+'|'+(typeof CR_MODE!=='undefined'?CR_MODE:''),now=++CAM.f;
 if(key!==CAM.k){CAM.k=key;CAM.due=now+30;CAM.pend=1;return}if(Math.abs((camera.aspect||1)-CAM.asp)>.05){CAM.due=Math.min(CAM.due,now);CAM.pend=1}if(now<CAM.due)return;CAM.due=now+240;CAM_fit();CAM.pend=0}
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
window.__cam={S:CAM,meas:CAM_meas,pass:m=>CAM_pass(m||CAM_meas()),go:CAM_go,fit:()=>{CAM.k='';CAM.due=0;CAM_fit();return CAM.T},prof:()=>CAM.P&&{L:CAM.P.L,H:CAM.P.H,z0:CAM.P.z0,z1:CAM.P.z1,g:CAM.P.g},rc:()=>RCAM[SET.rcam||'chase'],cp:()=>CAM.cp||null,settled:()=>{const n=SET.rcam||'chase',T=CAM.T[n],c=CAM.cur;if(RO.foot&&RO.foot!=='car')return true;if(!T||!c||CAM.pend||Math.abs((camera.aspect||1)-CAM.asp)>.05)return false;return['b','h','l','ly'].every(q=>Math.abs((c[q]??0)-(T[q]??0))<.05)},sel:()=>{try{return GAR_get().sel}catch(e){return null}}};
