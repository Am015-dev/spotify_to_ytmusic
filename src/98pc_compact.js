// perf-5 (2026-10-17): per-instance distance + frustum compaction for the city-wide InstancedMeshes (street props per tile, plinths, clouds …).
// Their bounding sphere covers the whole city (400-6900 m), so per-mesh frustum culling never hides one: ~60 % of all triangles at q=low.
// Every 10 frames, on a ≥ 20 m camera move or a ≥ 0.1 rad turn, the visible instances (frustum widened by 25 % of the distance, everything
// within PC.keep m for shadows) are copied from a full source copy into the front of instanceMatrix and .count is set (CTB_step pattern).
// setMatrixAt / getMatrixAt / setColorAt / getColorAt / raycast are wrapped so writes by the ORIGINAL index (smash, revive, colour) still land:
// they go to the source copy and to the instance's current slot (slot[] map). ?pc5=0 = off. GO: perf5/compact (src/99c_checklist.js).
const PC={on:!/[?&]pc5=0/.test(location.search),L:[],grp:null,t:0,f:0,x:1e9,z:1e9,h:1e9,keep:60,st:{meshes:0,src:0,vis:0,runs:0,ms:0}};
const _pcM=new THREE.Matrix4(),_pcPV=new THREE.Matrix4(),_pcF=new THREE.Frustum(),_pcD=new THREE.Vector3(),_pcC=new THREE.Color(),_pcIM=THREE.InstancedMesh.prototype;
function PC_far(){const lv=typeof LK_lvl==='function'?LK_lvl():SET.q;return TUNE.pc5Far??(lv==='min'?380:lv==='low'?480:lv==='med'?700:900)}
// candidates: full (count = capacity), static, ≥ 16 instances, spread over > 300 m; never pools whose .count other code drives
function PC_cand(o){if(!o.isInstancedMesh||o.userData.pc||o.count<16||o.count!==o.instanceMatrix.count||o.instanceMatrix.usage!==THREE.StaticDrawUsage)return false;
 if(/^ctbf?_(?!plinth)/.test(o.name)||o.userData.ocPool||o.userData.wbP||o.userData.oc||o.userData.noPC||o.isSkinnedMesh)return false;
 if(!o.boundingSphere)o.computeBoundingSphere();return o.boundingSphere.radius>300}
function PC_reg(im,sky){const n=im.count,src=new Float32Array(im.instanceMatrix.array.subarray(0,n*16)),g=im.geometry;if(!g.boundingSphere)g.computeBoundingSphere();
 im.updateWorldMatrix(true,false);const C={im,n,src,col:im.instanceColor?new Float32Array(im.instanceColor.array.subarray(0,n*3)):null,slot:new Int32Array(n),c:new Float32Array(n*4),sky,dirty:false};
 for(let i=0;i<n;i++){C.slot[i]=i;PC_sph(C,i)}
 im.setMatrixAt=function(i,m){if(i>=C.n)return _pcIM.setMatrixAt.call(this,i,m);m.toArray(C.src,i*16);PC_sph(C,i);const s=C.slot[i];if(s>=0)m.toArray(this.instanceMatrix.array,s*16);if(!C.dyn)C.dirty=true};/* traffic rewrites every car each frame: no re-pack for that */
 im.getMatrixAt=function(i,m){return i<C.n?m.fromArray(C.src,i*16):_pcIM.getMatrixAt.call(this,i,m)};
 im.setColorAt=function(i,c){if(!this.instanceColor){_pcIM.setColorAt.call(this,0,_pcC.setRGB(1,1,1));this.instanceColor.array.fill(1)}if(!C.col)C.col=new Float32Array(C.n*3).fill(1);
  if(i>=C.n)return _pcIM.setColorAt.call(this,i,c);c.toArray(C.col,i*3);const s=C.slot[i];if(s>=0)c.toArray(this.instanceColor.array,s*3)};
 im.getColorAt=function(i,c){return C.col&&i<C.n?c.fromArray(C.col,i*3):_pcIM.getColorAt.call(this,i,c)};
 // raycast / bounds see every instance by its original index
 for(const k of['raycast','computeBoundingSphere','computeBoundingBox'])im[k]=function(){const c=this.count;this.count=C.n;try{return _pcIM[k].apply(this,arguments)}finally{this.count=c}};
 im.frustumCulled=false;im.userData.pc=C;PC.L.push(C);PC.st.meshes++;PC.st.src+=n;return C}
// instance i: world-ish centre (mesh local, the step applies matrixWorld) + radius = geometry radius × max scale (0 scale = hidden)
function PC_sph(C,i){const a=C.src,o=i*16,W=C.sky?null:C.im.matrixWorld.elements,bs=C.im.geometry.boundingSphere,c=bs.center,sx=Math.hypot(a[o],a[o+1],a[o+2]),sy=Math.hypot(a[o+4],a[o+5],a[o+6]),sz=Math.hypot(a[o+8],a[o+9],a[o+10]);
 C.c[i*4]=a[o]*c.x+a[o+4]*c.y+a[o+8]*c.z+a[o+12];C.c[i*4+1]=a[o+1]*c.x+a[o+5]*c.y+a[o+9]*c.z+a[o+13];C.c[i*4+2]=a[o+2]*c.x+a[o+6]*c.y+a[o+10]*c.z+a[o+14];C.c[i*4+3]=bs.radius*Math.max(sx,sy,sz);
 if(W){const x=C.c[i*4],y=C.c[i*4+1],z=C.c[i*4+2];C.c[i*4]=W[0]*x+W[4]*y+W[8]*z+W[12];C.c[i*4+1]=W[1]*x+W[5]*y+W[9]*z+W[13];C.c[i*4+2]=W[2]*x+W[6]*y+W[10]*z+W[14]}}
function PC_scan(){PC.L.length=0;PC.st.meshes=PC.st.src=0;PC.grp=HUB.grp;if(!HUB.grp)return;HUB.grp.traverse(o=>{if(PC_cand(o))PC_reg(o,false)});
 if(typeof CLOUDS!=='undefined'&&CLOUDS)CLOUDS.traverse(o=>{if(o.isInstancedMesh&&!o.userData.pc&&o.count>=16&&o.count===o.instanceMatrix.count)PC_reg(o,true)});
 // traffic bodies + their wheel / glass layers (same index c.j): moving, so tested one by one each pass, not in the grid
 for(const im of Object.values(HUB.cim||{}))for(const q of[im,im&&im.userData.w,im&&im.userData.g])if(q&&q.isInstancedMesh&&!q.userData.pc&&q.count>=8&&q.count===q.instanceMatrix.count)PC_reg(q,false).dyn=true;
 // one 80 m world grid over every static mesh: the step tests a cell's sphere first and only walks the instances of the cells that pass
 const M=new Map();for(const C of PC.L){if(C.sky||C.dyn)continue;const T=new Map();for(let i=0;i<C.n;i++){const k=Math.floor(C.c[i*4]/80)*100003+Math.floor(C.c[i*4+2]/80);let L=T.get(k);if(!L)T.set(k,L=[]);L.push(i)}
  for(const[k,L]of T){let Q=M.get(k);if(!Q)M.set(k,Q={x:0,y:0,z:0,r:0,n:0,E:[]});Q.E.push(C,Int32Array.from(L));for(const i of L){Q.x+=C.c[i*4];Q.y+=C.c[i*4+1];Q.z+=C.c[i*4+2];Q.n++}}}
 PC.G=[...M.values()];for(const Q of PC.G){Q.x/=Q.n;Q.y/=Q.n;Q.z/=Q.n;for(let e=0;e<Q.E.length;e+=2){const C=Q.E[e];for(const i of Q.E[e+1])Q.r=Math.max(Q.r,Math.hypot(C.c[i*4]-Q.x,C.c[i*4+1]-Q.y,C.c[i*4+2]-Q.z)+Math.max(C.c[i*4+3],2))}Q.r+=4}}
// one instance: visible → copied to the next free slot of its mesh
function PC_one(C,i,x,y,z,cx,cy,cz,far){const r=C.c[i*4+3];if(r<=0)return;const d=Math.hypot(x-cx,y-cy,z-cz);if(!C.sky&&d-r>far||d-r>PC.keep&&!_pcF.intersectsSphere(_pcS.set(_pcP5.set(x,y,z),r+4+d*.25)))return;
 const s=C.s++,a=C.src,arr=C.im.instanceMatrix.array;if(s!==i){for(let k=0;k<16;k++)arr[s*16+k]=a[i*16+k];const col=C.col,ic=C.im.instanceColor&&C.im.instanceColor.array;if(ic&&col){ic[s*3]=col[i*3];ic[s*3+1]=col[i*3+1];ic[s*3+2]=col[i*3+2]}}C.slot[i]=s}
const _pcS=new THREE.Sphere();
function PC_step(force){if(!PC.on||typeof camera==='undefined'||!HUB.grp||state!=='roam')return;if(PC.grp&&PC.grp!==HUB.grp){PC.L.length=0;PC.grp=null;PC.f=0}
 if(!PC.grp){const t=performance.now();if(!PC.f)PC.f=t;if(t-PC.f<3000&&!force)return;PC_scan()}/* 3 s after roam starts: after the first-roam-frame passes (98sp_simplify reads every instance by .count) */
 camera.getWorldDirection(_pcD);const cx=camera.position.x,cz=camera.position.z,h=Math.atan2(_pcD.x,_pcD.z);let dh=Math.abs(h-PC.h);if(dh>Math.PI)dh=2*Math.PI-dh;
 let dirty=false;for(const C of PC.L)if(C.dirty){dirty=true;break}
 if(!force&&++PC.t%10&&!dirty&&dh<.1&&Math.hypot(cx-PC.x,cz-PC.z)<20)return;PC.t=0;PC.x=cx;PC.z=cz;PC.h=h;const t0=performance.now();
 camera.updateMatrixWorld();_pcPV.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);_pcF.setFromProjectionMatrix(_pcPV);
 const far=PC_far(),cy=camera.position.y;let vis=0;
 for(const C of PC.L){C.s=0;C.slot.fill(-1);C.dirty=false}
 for(const Q of PC.G){const d=Math.hypot(Q.x-cx,Q.y-cy,Q.z-cz);if(d-Q.r>far||d-Q.r>PC.keep&&!_pcF.intersectsSphere(_pcS.set(_pcP5.set(Q.x,Q.y,Q.z),Q.r+4+d*.25)))continue;
  for(let e=0;e<Q.E.length;e+=2){const C=Q.E[e],I=Q.E[e+1];if(!C.im.parent)continue;for(let j=0;j<I.length;j++){const i=I[j];PC_one(C,i,C.c[i*4],C.c[i*4+1],C.c[i*4+2],cx,cy,cz,far)}}}
 for(const C of PC.L){const im=C.im;if(C.dyn&&im.parent)for(let i=0;i<C.n;i++)PC_one(C,i,C.c[i*4],C.c[i*4+1],C.c[i*4+2],cx,cy,cz,far);
  if(C.sky&&im.parent){im.updateWorldMatrix(true,false);const W=im.matrixWorld.elements;for(let i=0;i<C.n;i++){const lx=C.c[i*4],ly=C.c[i*4+1],lz=C.c[i*4+2];
   PC_one(C,i,W[0]*lx+W[4]*ly+W[8]*lz+W[12],W[1]*lx+W[5]*ly+W[9]*lz+W[13],W[2]*lx+W[6]*ly+W[10]*lz+W[14],cx,cy,cz,far)}}
  im.count=C.s;im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;vis+=C.s}
 PC.st.vis=vis;PC.st.runs++;PC.st.ms=+(performance.now()-t0).toFixed(2)}
const _pcP5=new THREE.Vector3();
hubCullStep=(f=>function(){f.apply(this,arguments);try{PC_step()}catch(e){if(!PC.err){PC.err=String(e);console.warn('PC',e)}}})(hubCullStep);
// GO perf5/compact: a smashed instanced prop stays hidden after compaction, a revived one comes back, writes by index land, fewer instances drawn
function PC_go(){if(state!=='roam'||!RO.on)return'📍 Start free roam first';if(!PC.on)return'📍 perf5 compaction is OFF (?pc5=0) ❌';if(!PC.grp)PC_step(1);
 const ok=b=>b?' ✅':' ❌';const P=HUB.props.find(p=>p.alive&&p.im&&p.im.userData.pc&&p.gi==null&&p.im.userData.pc.c[p.i*4+3]>0);if(!P)return`📍 no compacted prop (meshes ${PC.st.meshes}) ❌`;
 const C=P.im.userData.pc;/* no roamWarp: a warp clears the props it lands on */camera.position.set(P.x+8,P.y+4,P.z+8);camera.lookAt(P.x,P.y,P.z);camera.updateMatrixWorld();PC_step(1);
 const shown0=C.slot[P.i]>=0;_pcM.makeScale(0,0,0);P.alive=false;P.im.setMatrixAt(P.i,_pcM);PC_step(1);
 // hidden: no slot, and no drawn slot carries a non-zero matrix at the prop's spot
 const arr=P.im.instanceMatrix.array;let ghost=0;for(let s=0;s<P.im.count;s++){const o=s*16;if(Math.hypot(arr[o+12]-P.x,arr[o+14]-P.z)<.05&&Math.hypot(arr[o],arr[o+1],arr[o+2])>1e-4)ghost++}
 const gone=C.slot[P.i]<0&&ghost===0;propRevive(P);PC_step(1);const back=C.slot[P.i]>=0&&P.im.getMatrixAt(P.i,_pcM)&&Math.abs(_pcM.elements[12]-P.x)<.01;
 const ratio=PC.st.vis/Math.max(1,PC.st.src);window.__chk=window.__chk||{};window.__chk.perf5={shown0,gone,ghost,back,meshes:PC.st.meshes,src:PC.st.src,vis:PC.st.vis,ms:PC.st.ms};
 return`📍 compaction: ${PC.st.meshes} meshes, ${PC.st.vis}/${PC.st.src} instances drawn (${PC.st.ms} ms); prop visible ${shown0}, smashed hidden ${gone} (ghosts ${ghost}), revived ${back}`+ok(shown0&&gone&&back&&ratio<.8)}
(function PC_regGo(i){const C=window.__chk;if(C&&C.GO){if(Array.isArray(C.items)&&!C.items.some(x=>x.ver==='perf5'))C.items.push({ver:'perf5',id:'compact',area:'perf',text:'city-wide instanced props drawn only when visible; a smashed prop stays hidden, a revived one comes back'});C.GO['perf5/compact']=[{c:'fra',n:'compact',fn:()=>PC_go()},{c:'ath',n:'compact',fn:()=>PC_go()}];return}if(i<600)setTimeout(()=>PC_regGo(i+1),100)})(0);
