// perf-5 (2026-10-17): per-instance distance + frustum compaction for the city-wide InstancedMeshes (street props per tile, plinths, clouds …).
// Their bounding sphere covers the whole city (400-6900 m), so per-mesh frustum culling never hides one: ~60 % of all triangles at q=low.
// Every 10 frames, on a ≥ 20 m camera move or a ≥ 0.1 rad turn, the visible instances (frustum widened by 25 % of the distance, everything
// within PC.keep m for shadows) are copied from a full source copy into the front of instanceMatrix and .count is set (CTB_step pattern).
// setMatrixAt / getMatrixAt / setColorAt / getColorAt / raycast are wrapped so writes by the ORIGINAL index (smash, revive, colour) still land:
// they go to the source copy and to the instance's current slot (slot[] map). ?pc5=0 = off. GO: perf5/compact (src/99c_checklist.js).
const PC={on:!/[?&]pc5=0/.test(location.search),shr:LOWMEM&&!/[?&]pcs=0/.test(location.search),q:[],L:[],grp:null,t:0,f:0,k:0,left:0,x:1e9,y:0,z:1e9,h:1e9,fr:900,keep:60,st:{meshes:0,src:0,vis:0,runs:0,ms:0}};
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
function PC_sph(C,i){const a=C.src,o=i*16,W=C.sky?null:C.im.matrixWorld.elements,bs=C.im.geometry.boundingSphere,c=bs.center,sx=Math.sqrt(a[o]*a[o]+(a[o+1])*(a[o+1])+(a[o+2])*(a[o+2])),sy=Math.sqrt((a[o+4])*(a[o+4])+(a[o+5])*(a[o+5])+(a[o+6])*(a[o+6])),sz=Math.sqrt((a[o+8])*(a[o+8])+(a[o+9])*(a[o+9])+(a[o+10])*(a[o+10]));
 C.c[i*4]=a[o]*c.x+a[o+4]*c.y+a[o+8]*c.z+a[o+12];C.c[i*4+1]=a[o+1]*c.x+a[o+5]*c.y+a[o+9]*c.z+a[o+13];C.c[i*4+2]=a[o+2]*c.x+a[o+6]*c.y+a[o+10]*c.z+a[o+14];C.c[i*4+3]=bs.radius*Math.max(sx,sy,sz);
 if(W){const x=C.c[i*4],y=C.c[i*4+1],z=C.c[i*4+2];C.c[i*4]=W[0]*x+W[4]*y+W[8]*z+W[12];C.c[i*4+1]=W[1]*x+W[5]*y+W[9]*z+W[13];C.c[i*4+2]=W[2]*x+W[6]*y+W[10]*z+W[14]}}
function PC_scan(){PC.L.length=0;PC.st.meshes=PC.st.src=0;PC.grp=HUB.grp;if(!HUB.grp)return;HUB.grp.traverse(o=>{if(PC_cand(o))PC_reg(o,false)});PC.wg=null;PC_addCk(HUB.grp);
 if(typeof CLOUDS!=='undefined'&&CLOUDS)CLOUDS.traverse(o=>{if(o.isInstancedMesh&&!o.userData.pc&&o.count>=16&&o.count===o.instanceMatrix.count)PC_reg(o,true)});
 // traffic bodies + their wheel / glass layers (same index c.j): moving, so tested one by one each pass, not in the grid
 for(const im of Object.values(HUB.cim||{}))for(const q of[im,im&&im.userData.w,im&&im.userData.g])if(q&&q.isInstancedMesh&&!q.userData.pc&&q.count>=8&&q.count===q.instanceMatrix.count)PC_reg(q,false).dyn=true;
 PC.nch=HUB.grp.children.length;PC_grid()}
// perf-6: meshes added to HUB.grp after the first scan (lazy 'lz' leaf/filler groups: 18k-instance leaf IM = 217k tris Fra) are picked up when the child count changes
// boot-1: PC_add only queues the new meshes; PC_drain registers them under a ~3 ms budget per frame (PC_reg + grid were 22-650 ms in one frame on a tile landing)
function PC_add(){PC.nch=HUB.grp.children.length;let n=0;const lg=typeof LIFE!=='undefined'&&LIFE.grp;/* LIFE drives its own pool .count */const Q=PC.q,w=o=>{if(o===lg)return;if(!o.userData.pcQ&&PC_cand(o)){o.userData.pcQ=1;Q.push(o);n++}for(const q of o.children)w(q)};if(PC_addCk(HUB.grp))w(HUB.grp);else for(const t of HUB.grp.children)if(PC_addCk(t))w(t);return n}
// boot-3: PC_add walks only the top-level groups that changed since their last walk (child count; a streamed tile root until it is shown), not the whole hub
function PC_addCk(t){if(t===HUB.grp){if(PC.wg===t)return false;PC.wg=t;for(const c of t.children)PC_addCk(c);return true}const k=t.children.length,u=t.userData;if(u.pcN===k&&(!u.lz||u.pcV))return false;u.pcN=k;u.pcV=t.visible;return true}
function PC_drain(ms){if(!PC.q.length)return 0;const t=performance.now(),A=[];while(PC.q.length&&(!A.length||performance.now()-t<ms)){const o=PC.q.shift();o.userData.pcQ=0;if(o.parent&&PC_cand(o))A.push(PC_reg(o,false))}if(A.length)PC_grid(A);return A.length}
function PC_grid(add){
 // perf-7: one 80 m world grid (PC.G = x,y,z,r per cell) tested ONCE per pass into PC.cv; each mesh keeps its own cell lists (C.G = [cell, Int32Array ids]).
 // Incremental: PC_add grids only the new meshes (a full rebuild was 460 ms in Athens on every lazy group); an existing cell keeps its centre and grows its radius.
 if(!add||!PC.M)PC.M=new Map();const M=PC.M;
 // boot-4: no per-mesh Map / per-cell arrays: one sorted Float64Array of cell*2^20+instance, then C.G = Int32Array [cell id, start, end]* over C.I (instance ids in cell order)
 for(const C of add||PC.L){if(C.sky||C.dyn)continue;const n=C.n,c=C.c,K=new Float64Array(n);for(let i=0;i<n;i++)K[i]=(Math.floor(c[i*4]/80)*100003+Math.floor(c[i*4+2]/80))*1048576+i;K.sort();
  const I=C.I=new Int32Array(n),Gs=[];for(let s=0;s<n;){const k=Math.floor(K[s]/1048576);let e=s;while(e<n&&Math.floor(K[e]/1048576)===k){I[e]=K[e]-k*1048576;e++}
   let q=M.get(k);if(!q){let x=0,y=0,z=0;for(let j=s;j<e;j++){const i=I[j];x+=c[i*4];y+=c[i*4+1];z+=c[i*4+2]}const L=e-s;M.set(k,q={id:M.size,x:x/L,y:y/L,z:z/L,r:0})}
   for(let j=s;j<e;j++){const i=I[j],dx=c[i*4]-q.x,dy=c[i*4+1]-q.y,dz=c[i*4+2]-q.z,rr=Math.sqrt(dx*dx+dy*dy+dz*dz)+Math.max(c[i*4+3],2)+4;if(rr>q.r)q.r=rr}Gs.push(q.id,s,e);s=e}C.G=Int32Array.from(Gs)}
 // boot-3: on an add, write only the touched cells into a capacity-doubling PC.G (was: the whole grid re-copied per landing, 43 ms in Athens); PC.cv keeps one byte per cell
 let G=PC.G;const full=!add||!G;if(full||G.length<M.size*4){const g=new Float64Array(Math.max(M.size*4,full?0:G.length*2));if(!full)g.set(G);G=PC.G=g}
 const W=q=>{G[q.id*4]=q.x;G[q.id*4+1]=q.y;G[q.id*4+2]=q.z;G[q.id*4+3]=q.r};if(full)for(const q of M.values())W(q);else{const U=new Set();for(const C of add)if(C.G)for(let g=0;g<C.G.length;g+=3)U.add(C.G[g]);for(const q of M.values())if(U.has(q.id))W(q)}
 if(!PC.cv||PC.cv.length!==M.size)PC.cv=new Uint8Array(M.size);PC.left=0}
// one instance: visible → copied to the next free slot of its mesh
function PC_one(C,i,x,y,z,cx,cy,cz,far){const r=C.c[i*4+3];if(r<=0)return;const ex=x-cx,ey=y-cy,ez=z-cz,d=Math.sqrt(ex*ex+ey*ey+ez*ez);if(!C.sky&&d-r>far||d-r>PC.keep&&!_pcF.intersectsSphere(_pcS.set(_pcP5.set(x,y,z),r+4+d*.25)))return;
 const s=C.s++,a=C.src;if(C.shr&&s>=C.im.instanceMatrix.count)PC_cap(C,Math.max(s+1,Math.ceil(s*1.5)));const arr=C.im.instanceMatrix.array;
 if(s!==i||C.shr){for(let k=0;k<16;k++)arr[s*16+k]=a[i*16+k];const col=C.col,ic=C.im.instanceColor&&C.im.instanceColor.array;if(ic&&col){ic[s*3]=col[i*3];ic[s*3+1]=col[i*3+1];ic[s*3+2]=col[i*3+2]}}C.slot[i]=s}
// ios-r17h (cut 1+2): in the low-mem tier a compacted mesh keeps instanceMatrix / instanceColor at its drawn size (x1.5), not at the full source count (the source copy C.src
// holds every instance): ath -30 MB. It grows on demand inside PC_one (copy + GPU buffer re-created via the mesh 'dispose' event); a shrunk slot always re-copies (no s===i shortcut).
function PC_cap(C,cap){const im=C.im,M=im.instanceMatrix;cap=Math.min(C.n,Math.max(8,cap));if(cap===M.count)return;const k=Math.min(cap,M.count),a=new Float32Array(cap*16);a.set(M.array.subarray(0,k*16));M.array=a;M.count=cap;M.clearUpdateRanges();
 const IC=im.instanceColor;if(IC){const b=new Float32Array(cap*3);b.set(IC.array.subarray(0,k*3));IC.array=b;IC.count=cap;IC.clearUpdateRanges()}
 im.dispatchEvent({type:'dispose'});M.needsUpdate=true;if(IC)IC.needsUpdate=true;PC.st.shr=(PC.st.shr|0)+1}
function PC_shrink(C){C.shr=1;const cap=Math.ceil(C.s*1.5)+8;if(cap<C.n*.8)PC_cap(C,cap)}

const _pcS=new THREE.Sphere();
// re-pack one mesh against the pass's camera snapshot (PC.x/y/z, _pcF); returns instances tested. Upload only the drawn range (r164 addUpdateRange), not the whole capacity.
function PC_mesh(C){const im=C.im;C.dirty=false;if(!im.parent)return 0;const cx=PC.x,cy=PC.y,cz=PC.z,far=PC.fr;C.s=0;C.slot.fill(-1);let n=0;
 if(C.G){const G=C.G,I=C.I,V=PC.cv;for(let g=0;g<G.length;g+=3){if(!V[G[g]])continue;const e=G[g+2];n+=e-G[g+1];for(let j=G[g+1];j<e;j++){const i=I[j];PC_one(C,i,C.c[i*4],C.c[i*4+1],C.c[i*4+2],cx,cy,cz,far)}}}
 else if(C.sky){im.updateWorldMatrix(true,false);const W=im.matrixWorld.elements;n=C.n;for(let i=0;i<C.n;i++){const lx=C.c[i*4],ly=C.c[i*4+1],lz=C.c[i*4+2];
   PC_one(C,i,W[0]*lx+W[4]*ly+W[8]*lz+W[12],W[1]*lx+W[5]*ly+W[9]*lz+W[13],W[2]*lx+W[6]*ly+W[10]*lz+W[14],cx,cy,cz,far)}}
 else{n=C.n;for(let i=0;i<C.n;i++)PC_one(C,i,C.c[i*4],C.c[i*4+1],C.c[i*4+2],cx,cy,cz,far)}
 if(PC.shr&&!C.shr&&!C.dyn&&!C.sky)PC_shrink(C);
 im.count=C.s;const M=im.instanceMatrix;M.clearUpdateRanges();if(C.s){M.addUpdateRange(0,C.s*16);M.needsUpdate=true}
 const IC=im.instanceColor;if(IC){IC.clearUpdateRanges();if(C.s){IC.addUpdateRange(0,C.s*3);IC.needsUpdate=true}}return n}
// perf-7: a pass starts only on a ≥ 20 m camera move or a ≥ 15° turn (perf-5 also ran every 10 frames: ~570k Athens instances re-tested while parked),
// then walks the static meshes over several frames, PC.bud instances tested per frame (each mesh is re-packed whole, so it never shows half a pass).
// Traffic layers (C.dyn, moving) and clouds are re-packed every 10 frames on their own; a mesh dirtied by setMatrixAt is re-packed alone next frame.
function PC_step(force){if(!PC.on||typeof camera==='undefined'||!HUB.grp||state!=='roam')return;if(PC.grp&&PC.grp!==HUB.grp){PC.L.length=0;PC.grp=null;PC.f=0}
 {const t=performance.now();if(!PC.f)PC.f=t;if(t-PC.f<3000&&!force)return}if(!PC.grp)PC_scan();/* boot-1: the scan normally ran in the loader (PC_prewarm); the first pass is budgeted like any other */
 if(PC.nch!==HUB.grp.children.length&&(force||PC.t%10===9&&!(typeof TWG!=='undefined'&&TWG.pa&&TWG.fr>=0&&TWG.fr<=TWG.fw)))PC_add()/* ios-r17o: tiles added in the first 120 drivable frames are packed after them */;const np=PC_drain(force?1e9:3)>0;/* 3 s after roam starts: after the first-roam-frame passes (98sp_simplify reads every instance by .count) */
 camera.getWorldDirection(_pcD);const cx=camera.position.x,cz=camera.position.z,h=Math.atan2(_pcD.x,_pcD.z);let dh=Math.abs(h-PC.h);if(dh>Math.PI)dh=2*Math.PI-dh;
 const t0=performance.now();let tested=0;
 if(force||np||dh>.26||Math.sqrt((cx-PC.x)*(cx-PC.x)+(cz-PC.z)*(cz-PC.z))>=20){PC_snap(cx,cz,h);PC.left=PC.L.length;PC.t=0;for(let _k1=0,_c1=PC.L,C;_k1<_c1.length&&(C=_c1[_k1],true);_k1++)if(C.sky||C.dyn)tested+=PC_mesh(C);PC.st.runs++}
 else if(++PC.t%10===0&&!PC.left){PC_snap(cx,cz,h);for(let _k2=0,_c2=PC.L,C;_k2<_c2.length&&(C=_c2[_k2],true);_k2++)if(C.sky||C.dyn)tested+=PC_mesh(C)}
 const bud=force?1e9:(TUNE.pc7Bud||60000);/* circular: a new pass mid-way carries on from the same mesh, so no mesh starves under constant turning */
 const mb=typeof TWG!=='undefined'&&TWG.pcB&&!force&&TWG.fr>=0&&TWG.fr<=TWG.pcF?TWG.pcB:0;/* ios-r17k: first drivable seconds on touch: also stop a pass at TWG.pcB ms (a mesh is re-packed whole, so the pass just resumes next frame) */
 while(PC.left>0&&tested<bud&&(!mb||performance.now()-t0<mb)){PC.left--;const C=PC.L[PC.k++%PC.L.length];if(!C.sky&&!C.dyn)tested+=PC_mesh(C)}
 if(!PC.left)for(let _k3=0,_c3=PC.L,C;_k3<_c3.length&&(C=_c3[_k3],true);_k3++)if(C.dirty&&!C.dyn)tested+=PC_mesh(C);
 if(tested){let vis=0;for(let _k4=0,_c4=PC.L,C;_k4<_c4.length&&(C=_c4[_k4],true);_k4++)vis+=C.s|0;PC.st.vis=vis;PC.st.tested=tested;PC.st.ms=+(performance.now()-t0).toFixed(2)}}
const _pcP5=new THREE.Vector3();
// boot-4: the pass's camera snapshot + per-cell visibility (was a closure made every frame, Math.hypot per cell)
function PC_snap(cx,cz,h){camera.updateMatrixWorld();_pcPV.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);_pcF.setFromProjectionMatrix(_pcPV);PC.x=cx;PC.y=camera.position.y;PC.z=cz;PC.h=h;
 const far=PC.fr=PC_far(),cy=PC.y,G=PC.G,V=PC.cv,keep=PC.keep;if(G)for(let q=0;q<V.length;q++){const gx=G[q*4],gy=G[q*4+1],gz=G[q*4+2],dx=gx-cx,dy=gy-cy,dz=gz-cz,d=Math.sqrt(dx*dx+dy*dy+dz*dz),r=G[q*4+3];
  V[q]=d-r>far||d-r>keep&&!_pcF.intersectsSphere(_pcS.set(_pcP5.set(gx,gy,gz),r+4+d*.25))?0:1}}
// boot-1: register + grid every candidate behind the loading screen (it was 180 ms on the first roam frame); nothing is packed until roam (98sp_simplify reads .count)
function PC_prewarm(){try{if(PC.on&&HUB.grp&&!PC.grp&&PC_gate())PC_scan()}catch(e){console.warn('PC prewarm',e)}}
// perf-7 gate: compaction costs ~1.8 ms CPU/frame (A/B), only worth it where the GPU is the limit: quality low/min (phones). med/high skip PC_step entirely
// (nothing is scanned or wrapped); if quality rises after a pass ran (auto ladder / settings), PC_release puts every mesh back to its full source copy.
function PC_gate(){const lv=typeof LK_lvl==='function'?LK_lvl():SET.q;return TUNE.pc7All||lv==='low'||lv==='min'}
function PC_release(){for(let _k5=0,_c5=PC.L,C;_k5<_c5.length&&(C=_c5[_k5],true);_k5++){const im=C.im;if(!im.parent)continue;if(C.shr){C.shr=0;PC_cap(C,C.n)}im.instanceMatrix.array.set(C.src);if(C.col&&im.instanceColor)im.instanceColor.array.set(C.col);
  for(let i=0;i<C.n;i++)C.slot[i]=i;C.s=C.n;C.dirty=false;im.count=C.n;im.instanceMatrix.clearUpdateRanges();im.instanceMatrix.needsUpdate=true;if(im.instanceColor){im.instanceColor.clearUpdateRanges();im.instanceColor.needsUpdate=true}}
 PC.left=0;PC.x=1e9;PC.h=1e9;PC.rel=1}
hubCullStep=(f=>function(){f.apply(this,arguments);try{if(PC_gate()){PC.rel=0;PC_step()}else if(PC.L.length&&!PC.rel)PC_release()}catch(e){if(!PC.err){PC.err=String(e);console.warn('PC',e)}}})(hubCullStep);
// GO perf5/compact: a smashed instanced prop stays hidden after compaction, a revived one comes back, writes by index land, fewer instances drawn
function PC_go(){if(state!=='roam'||!RO.on)return'📍 Start free roam first';if(!PC.on)return'📍 perf5 compaction is OFF (?pc5=0) ❌';PC.rel=0;if(!PC.grp)PC_step(1);
 const ok=b=>b?' ✅':' ❌';const P=HUB.props.find(p=>p.alive&&p.im&&p.im.userData.pc&&p.gi==null&&p.im.userData.pc.c[p.i*4+3]>0);if(!P)return`📍 no compacted prop (meshes ${PC.st.meshes}) ❌`;
 const C=P.im.userData.pc;/* no roamWarp: a warp clears the props it lands on */camera.position.set(P.x+8,P.y+4,P.z+8);camera.lookAt(P.x,P.y,P.z);camera.updateMatrixWorld();PC_step(1);
 const shown0=C.slot[P.i]>=0;_pcM.makeScale(0,0,0);P.alive=false;P.im.setMatrixAt(P.i,_pcM);PC_step(1);
 // hidden: no slot, and no drawn slot carries a non-zero matrix at the prop's spot
 const arr=P.im.instanceMatrix.array;let ghost=0;for(let s=0;s<P.im.count;s++){const o=s*16;if(Math.sqrt((arr[o+12]-P.x)*(arr[o+12]-P.x)+(arr[o+14]-P.z)*(arr[o+14]-P.z))<.05&&Math.sqrt(arr[o]*arr[o]+(arr[o+1])*(arr[o+1])+(arr[o+2])*(arr[o+2]))>1e-4)ghost++}
 const gone=C.slot[P.i]<0&&ghost===0;propRevive(P);PC_step(1);const back=C.slot[P.i]>=0&&P.im.getMatrixAt(P.i,_pcM)&&Math.abs(_pcM.elements[12]-P.x)<.01;
 const ratio=PC.st.vis/Math.max(1,PC.st.src);window.__chk=window.__chk||{};window.__chk.perf5={shown0,gone,ghost,back,meshes:PC.st.meshes,src:PC.st.src,vis:PC.st.vis,ms:PC.st.ms};
 return`📍 compaction: ${PC.st.meshes} meshes, ${PC.st.vis}/${PC.st.src} instances drawn (${PC.st.ms} ms); prop visible ${shown0}, smashed hidden ${gone} (ghosts ${ghost}), revived ${back}`+ok(shown0&&gone&&back&&ratio<.8)}
(function PC_regGo(i){const C=window.__chk;if(C&&C.GO){if(Array.isArray(C.items)&&!C.items.some(x=>x.ver==='perf5'))C.items.push({ver:'perf5',id:'compact',area:'perf',text:'city-wide instanced props drawn only when visible; a smashed prop stays hidden, a revived one comes back'});C.GO['perf5/compact']=[{c:'fra',n:'compact',fn:()=>PC_go()},{c:'ath',n:'compact',fn:()=>PC_go()}];return}if(i<600)setTimeout(()=>PC_regGo(i+1),100)})(0);
