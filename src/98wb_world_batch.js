
// ===== WB (v88v): world batching / LOD for perf. Owner: world perf worker (alex/od-world). =====
// Measured v88u Frankfurt street spot: ~2.0M tris / ~265 draws; the 150 LEGO traffic cars (23k tris each, never culled, full detail at any
// distance) were ~1.0M of it. WB_car: every scene render, the traffic instance buffers are compacted to the cars inside the view:
// near (≤ TUNE.wbNear m) keep the full brick model + wheels + glass, far ones draw a vertex-clustered copy (~5-10 % of the triangles,
// same colours), cars outside the view or past TUNE.wbFar are not drawn. The buffers are restored right after the render, so all game
// code (slots c.j, getMatrixAt, ART8 twins, tumble) sees exactly what it wrote.
const WB={st:{hi:0,lo:0,cut:0},lo:new Map(),fr:new THREE.Frustum(),pm:new THREE.Matrix4(),sp:new THREE.Sphere(),bk:new Map(),act:[]};
// vertex-clustering decimation: cells of `cell` m; each triangle whose corners fall in 3 different cells survives, flat-shaded with its own mean colour
function WB_cluster(parts,cell){const cm=new Map(),cs=[];const key=(x,y,z)=>Math.floor(x/cell)+','+Math.floor(y/cell)+','+Math.floor(z/cell);
  const tri=[];for(const {g,col} of parts){const P=g.attributes.position,C=g.attributes.color,I=g.index,n=I?I.count:P.count,ids=new Int32Array(P.count);
    for(let i=0;i<P.count;i++){const x=P.getX(i),y=P.getY(i),z=P.getZ(i),k=key(x,y,z);let c=cm.get(k);if(c===undefined){c=cs.length;cm.set(k,c);cs.push([0,0,0,0])}const s=cs[c];s[0]+=x;s[1]+=y;s[2]+=z;s[3]++;ids[i]=c}
    for(let t=0;t+2<n;t+=3){const a=I?I.getX(t):t,b=I?I.getX(t+1):t+1,d=I?I.getX(t+2):t+2;const A=ids[a],B=ids[b],D=ids[d];if(A===B||B===D||A===D)continue;
      let r,gg,bb;if(C){r=(C.getX(a)+C.getX(b)+C.getX(d))/3;gg=(C.getY(a)+C.getY(b)+C.getY(d))/3;bb=(C.getZ(a)+C.getZ(b)+C.getZ(d))/3}else{r=col.r;gg=col.g;bb=col.b}tri.push(A,B,D,r,gg,bb)}}
  const seen=new Set(),pos=[],colr=[];for(let i=0;i<tri.length;i+=6){const A=tri[i],B=tri[i+1],D=tri[i+2],s=[A,B,D].sort((p,q)=>p-q).join(',');if(seen.has(s))continue;seen.add(s);
    for(const v of[A,B,D]){const c=cs[v];pos.push(c[0]/c[3],c[1]/c[3],c[2]/c[3]);colr.push(tri[i+3],tri[i+4],tri[i+5])}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colr,3));g.computeVertexNormals();g.computeBoundingSphere();return g}
const WB_tris=g=>((g.index?g.index.count:g.attributes.position.count)/3)|0;
// far model of one traffic type = body + wheels + glass clustered together (wheels dark, glass deep blue when they carry no colours)
function WB_loOf(im){const u=im.userData,key=im.geometry.uuid+(u.w?u.w.geometry.uuid:'')+(u.g?u.g.geometry.uuid:'');let e=WB.lo.get(im);if(e&&e.key===key)return e;
  if(e){e.m.removeFromParent();e.m.geometry.dispose();e.m.dispose()}
  const parts=[{g:im.geometry,col:new THREE.Color(1,1,1)}];if(u.w)parts.push({g:u.w.geometry,col:new THREE.Color(.08,.08,.09)});if(u.g)parts.push({g:u.g.geometry,col:new THREE.Color(.12,.2,.3)});
  if(!im.geometry.boundingSphere)im.geometry.computeBoundingSphere();const R=im.geometry.boundingSphere.radius||3;
  const geo=WB_cluster(parts,Math.max(.12,R*TUNE.wbCell));const mat=[].concat(im.material)[0];
  let cap=0;for(const c of HUB.cim)if(c&&c.instanceMatrix)cap+=c.instanceMatrix.count;const m=new THREE.InstancedMesh(geo,mat,Math.max(cap,im.instanceMatrix.count));m.count=0;m.frustumCulled=false;m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);m.userData.keep=1;m.userData.wbLo=1;m.raycast=()=>{};
  if(im.instanceColor){m.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(im.instanceColor.array.length),3);m.instanceColor.setUsage(THREE.DynamicDrawUsage)}
  if(!im.geometry.boundingBox)im.geometry.computeBoundingBox();const bs=im.geometry.boundingBox.getSize(new THREE.Vector3());
  e={key,m,R,mat,bs,cap:m.instanceMatrix.count,l:0,hiT:WB_tris(im.geometry)+(u.w?WB_tris(u.w.geometry):0)+(u.g?WB_tris(u.g.geometry):0),loT:WB_tris(geo)};WB.lo.set(im,e);return e}
const WB_save=a=>{let b=WB.bk.get(a);if(!b||b.length!==a.array.length){b=new Float32Array(a.array.length);WB.bk.set(a,b)}b.set(a.array);return b};
function WB_pre(r,sc,cam){WB.act.length=0;for(const e of WB.lo.values())e.m.visible=false;if(!TUNE.wbCarLod||typeof state==='undefined'||state!=='roam'||typeof HUB==='undefined'||!HUB.cim||!cam||!cam.isPerspectiveCamera)return;
  WB.pm.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse);WB.fr.setFromProjectionMatrix(WB.pm);const cx=cam.matrixWorld.elements[12],cy=cam.matrixWorld.elements[13],cz=cam.matrixWorld.elements[14];
  const n2=TUNE.wbNear*TUNE.wbNear,f2=TUNE.wbFar*TUNE.wbFar;let hi=0,lo=0,cut=0;
  // v88w: far copies share one model per size class (a type within wbLoShare× of a leader's body box in every axis draws as the leader, scaled) → fewer draws
  const Ls=[];for(const im of HUB.cim){if(!im||!im.visible||!im.parent||!im.geometry||WB_tris(im.geometry)<600)continue;const L=WB_loOf(im);L.l=0;L.T=L;L.s=null;Ls.push(L)}
  const thr=TUNE.wbLoShare||0;if(thr>1)for(let i=0;i<Ls.length;i++){const B=Ls[i];for(let j=0;j<i;j++){const A=Ls[j];if(A.T!==A||A.mat!==B.mat)continue;const sx=B.bs.x/A.bs.x,sy=B.bs.y/A.bs.y,sz=B.bs.z/A.bs.z;
    if(Math.max(sx,1/sx,sy,1/sy,sz,1/sz)<=thr){B.T=A;B.s=[sx,sy,sz];break}}}
  for(const im of HUB.cim){if(!im||!im.visible||!im.parent||!im.geometry||WB_tris(im.geometry)<600)continue;const u=im.userData,L=WB_loOf(im);if(L.m.parent!==im.parent)im.parent.add(L.m);
    const n=im.count,M=WB_save(im.instanceMatrix),Cc=im.instanceColor?WB_save(im.instanceColor):null,W=u.w?WB_save(u.w.instanceMatrix):null,G=u.g?WB_save(u.g.instanceMatrix):null;
    const T=L.T,S=L.s,am=im.instanceMatrix.array,ac=im.instanceColor&&im.instanceColor.array,aw=u.w&&u.w.instanceMatrix.array,ag=u.g&&u.g.instanceMatrix.array,lm=T.m.instanceMatrix.array,lc=T.m.instanceColor&&T.m.instanceColor.array;
    let h=0,l=0;for(let j=0;j<n;j++){const o=j*16,s2=M[o]*M[o]+M[o+1]*M[o+1]+M[o+2]*M[o+2];if(s2<1e-6)continue;const x=M[o+12],y=M[o+13],z=M[o+14],d2=(x-cx)**2+(y-cy)**2+(z-cz)**2;
      WB.sp.center.set(x,y,z);WB.sp.radius=L.R*Math.sqrt(s2)+1;if(d2>f2||!WB.fr.intersectsSphere(WB.sp)){cut++;continue}
      if(d2<=n2){const q=h*16;for(let i=0;i<16;i++)am[q+i]=M[o+i];if(aw)for(let i=0;i<16;i++)aw[q+i]=W[o+i];if(ag)for(let i=0;i<16;i++)ag[q+i]=G[o+i];if(ac){ac[h*3]=Cc[j*3];ac[h*3+1]=Cc[j*3+1];ac[h*3+2]=Cc[j*3+2]}h++}
      else{if(T.l>=T.cap){cut++;continue}const k=T.l++,q=k*16;for(let i=0;i<16;i++)lm[q+i]=M[o+i];if(S)for(let c=0;c<3;c++)for(let i=0;i<3;i++)lm[q+c*4+i]*=S[c];if(lc&&Cc){lc[k*3]=Cc[j*3];lc[k*3+1]=Cc[j*3+1];lc[k*3+2]=Cc[j*3+2]}l++}}
    WB.act.push([im,n,u.w?u.w.count:0,u.g?u.g.count:0]);im.count=h;im.instanceMatrix.needsUpdate=true;if(ac)im.instanceColor.needsUpdate=true;
    if(u.w){u.w.count=Math.min(h,u.w.count);u.w.instanceMatrix.needsUpdate=true}if(u.g){u.g.count=Math.min(h,u.g.count);u.g.instanceMatrix.needsUpdate=true}
    hi+=h;lo+=l}
  for(const L of Ls){L.m.count=L.l;L.m.visible=L.l>0;if(L.l){L.m.instanceMatrix.needsUpdate=true;if(L.m.instanceColor)L.m.instanceColor.needsUpdate=true}}
  WB.st.hi=hi;WB.st.lo=lo;WB.st.cut=cut}
function WB_post(){for(const [im,n,nw,ng] of WB.act){const u=im.userData;im.instanceMatrix.array.set(WB.bk.get(im.instanceMatrix));im.count=n;if(im.instanceColor)im.instanceColor.array.set(WB.bk.get(im.instanceColor));
  if(u.w){u.w.instanceMatrix.array.set(WB.bk.get(u.w.instanceMatrix));u.w.count=nw}if(u.g){u.g.instanceMatrix.array.set(WB.bk.get(u.g.instanceMatrix));u.g.count=ng}}WB.act.length=0}

// ---- WB_city: far cells of the static instanced city (Kenney buildings, trees, lamps, props) ----
// v88u: each model type was its own InstancedMesh per 1 km tile, drawn up to 750/1600 m: ~250 of Frankfurt's ~430 draw calls.
// Now the city is split into 200 m cells. Cells nearer than TUNE.wbLodD keep the real instanced models (drawn through a proxy buffer
// that holds only their near instances); every farther cell is ONE simplified mesh (all its models vertex-clustered at ~1.4 m, colours
// sampled from the Kenney atlas). The original meshes stay in the scene untouched (game code, hubCull, smash writes all still use them);
// they are only switched off for the duration of each render. Collisions are separate boxes (hubAddB) and do not change.
const WBC={C:320,on:false,objs:[],mobjs:[],sup:[],cells:new Map(),tpl:new Map(),px:new Map(),near:new Set(),sig:'',st:{lod:0,prox:0,ms:0},mat:null};
function WB_srgb(c){return c<=.04045?c/12.92:Math.pow((c+.055)/1.055,2.4)}
function WB_pix(tex){if(!tex||!tex.image)return null;let e=WBC.px.get(tex.uuid);if(e!==undefined)return e;const tp=performance.now();try{const im=tex.image,W0=im.width,H0=im.height;if(!W0||!H0)return null;const sc=Math.min(1,256/Math.max(W0,H0)),w=Math.max(1,Math.round(W0*sc)),h=Math.max(1,Math.round(H0*sc));const cv=document.createElement('canvas');cv.width=w;cv.height=h;const x=cv.getContext('2d',{willReadFrequently:true});x.drawImage(im,0,0,w,h);e={w,h,d:x.getImageData(0,0,w,h).data,fy:tex.flipY,lin:Float32Array.from({length:256},(_,i)=>WB_srgb(i/255))}}catch(err){e=null}WBC.px.set(tex.uuid,e);const ms=performance.now()-tp;WBC.st.pixN=(WBC.st.pixN||0)+1;WBC.st.pixMs=Math.round((WBC.st.pixMs||0)+ms);WBC.st.pixMax=Math.max(WBC.st.pixMax||0,Math.round(ms));return e}
// simplified template of one model at one size: per-triangle positions (local) + linear colour (texel × material colour × vertex colour)
// vertex clustering with open-addressing hash tables on typed arrays (the Map/Set version cost ~1 µs per source triangle = +3.5 s load)
const WBH={k:new Float64Array(0),v:new Int32Array(0)};
function WB_hash(n){let z=1<<Math.ceil(Math.log2(Math.max(64,n*2)));if(WBH.k.length<z){WBH.k=new Float64Array(z);WBH.v=new Int32Array(z)}WBH.k.fill(-1,0,z);return z-1}
function WB_tpl(geo,mat,cell,nocache){const key=geo.uuid+'|'+mat.uuid+'|'+cell.toFixed(3);let t=nocache?null:WBC.tpl.get(key);if(t)return t;
  const P=geo.attributes.position,U=geo.attributes.uv,C=mat.vertexColors?geo.attributes.color:null,I=geo.index,n=I?I.count:P.count,px=mat.map?WB_pix(mat.map):null,mc=mat.color||new THREE.Color(1,1,1);
  const PA=!P.isInterleavedBufferAttribute&&!P.normalized&&P.itemSize===3?P.array:null,IA=I?I.array:null,ic=1/cell;
  // pass 1: cluster id per corner (corners, not vertices: indexed views may reference few of many vertices)
  let mask=WB_hash(n),HK=WBH.k,HV=WBH.v,nc=0;const cid=new Int32Array(n),acc=new Float64Array(n*4);
  for(let f=0;f<n;f++){const i=IA?IA[f]:f,x=PA?PA[i*3]:P.getX(i),y=PA?PA[i*3+1]:P.getY(i),z=PA?PA[i*3+2]:P.getZ(i),ix=Math.floor(x*ic),iy=Math.floor(y*ic),iz=Math.floor(z*ic),k=(ix+4096)+(iy+4096)*8192+(iz+4096)*67108864;
    let h=((ix*73856093)^(iy*19349663)^(iz*83492791))&mask;while(HK[h]!==-1&&HK[h]!==k)h=(h+1)&mask;let c;if(HK[h]===-1){HK[h]=k;c=HV[h]=nc++}else c=HV[h];
    cid[f]=c;const o=c*4;acc[o]+=x;acc[o+1]+=y;acc[o+2]+=z;acc[o+3]++}
  // corners of the same vertex were summed once per use: the mean is still the mean of the cell's corners (weighted by use), fine for a far LOD
  // pass 2: surviving triangles, deduplicated
  mask=WB_hash(n/3);HK=WBH.k;const pos=new Float32Array(n*3),col=new Float32Array(n);let nt=0;
  for(let f=0;f+2<n;f+=3){const A=cid[f],B=cid[f+1],D=cid[f+2];if(A===B||B===D||A===D)continue;let a1=A,b1=B,d1=D,q;if(a1>b1){q=a1;a1=b1;b1=q}if(b1>d1){q=b1;b1=d1;d1=q}if(a1>b1){q=a1;a1=b1;b1=q}
    const s=(a1*nc+b1)*nc+d1;let h=((a1*73856093)^(b1*19349663)^(d1*83492791))&mask;while(HK[h]!==-1&&HK[h]!==s)h=(h+1)&mask;if(HK[h]===s)continue;HK[h]=s;
    const a=IA?IA[f]:f,b=IA?IA[f+1]:f+1,d=IA?IA[f+2]:f+2;let r=mc.r,g=mc.g,bb=mc.b;
    if(px&&U){let u=(U.getX(a)+U.getX(b)+U.getX(d))/3,v=(U.getY(a)+U.getY(b)+U.getY(d))/3;u-=Math.floor(u);v-=Math.floor(v);const X=Math.min(px.w-1,(u*px.w)|0),Y=Math.min(px.h-1,((px.fy?1-v:v)*px.h)|0),o=(Y*px.w+X)*4;r*=px.lin[px.d[o]];g*=px.lin[px.d[o+1]];bb*=px.lin[px.d[o+2]]}
    if(C){r*=(C.getX(a)+C.getX(b)+C.getX(d))/3;g*=(C.getY(a)+C.getY(b)+C.getY(d))/3;bb*=(C.getZ(a)+C.getZ(b)+C.getZ(d))/3}
    if(mat.emissiveMap&&mat.emissiveIntensity){const k=1+mat.emissiveIntensity*.5;r*=k;g*=k;bb*=k}
    const o9=nt*9;let w=0;for(const v of[A,B,D]){const o=v*4,m=1/acc[o+3];pos[o9+w]=acc[o]*m;pos[o9+w+1]=acc[o+1]*m;pos[o9+w+2]=acc[o+2]*m;w+=3}col[nt*3]=r;col[nt*3+1]=g;col[nt*3+2]=bb;nt++}
  t={p:pos.slice(0,nt*9),c:col.slice(0,nt*3),n:nt};if(!nocache)WBC.tpl.set(key,t);return t}
const WB_skipUD=['keep','lz','sky','a8s','wbLo','cv','trG','trPl','nr','ramp','art6','gb','sim'];
function WB_cand(o){if(!o.isInstancedMesh||o.count<1||o.frustumCulled===false&&!TUNE.wbNfc||o.instanceMatrix.usage!==THREE.StaticDrawUsage)return false;const m=o.material;if(!m||Array.isArray(m)||!m.isMeshStandardMaterial||m.transparent||m.opacity<1||m.alphaTest>0||m.polygonOffset)return false;
  for(const k of WB_skipUD)if(o.userData[k])return false;if(HUB.cim&&HUB.cim.includes(o))return false;return !!(o.geometry&&o.geometry.attributes.position)}
function WB_mcand(o,mats){if(!o.isMesh||o.isInstancedMesh||o.frustumCulled===false||Object.keys(o.userData).length)return false;const m=o.material,g=o.geometry;if(!m||Array.isArray(m)||!m.isMeshStandardMaterial||m.transparent||m.opacity<1||m.alphaTest>0)return false;
  if(!g||!g.attributes.position||g.morphAttributes.position||g.drawRange.start||g.drawRange.count!==Infinity||g.groups.length)return false;for(const nm in g.attributes)if(!g.attributes[nm].array)return false;if(g.index&&!g.index.array)return false;/* arrays freed after the GPU upload */
  return (g.index?g.index.count:g.attributes.position.count)>=36}
// sort a merged (non-indexed) mesh's triangles by cell in place; each cell's run becomes a piece mesh that SHARES the attributes (no copy)
function WB_split(o,lift){const T0=performance.now(),Q=WBC.st;const g=o.geometry,P=g.attributes.position,I=g.index,nt=(I?I.count:P.count)/3|0,e=o.matrixWorld.elements,key=new Float64Array(nt),ord=new Uint32Array(nt);
  for(let t=0;t<nt;t++){let x=0,z=0;for(let k=0;k<3;k++){const i=I?I.getX(t*3+k):t*3+k,X=P.getX(i),Y=P.getY(i),Z=P.getZ(i);x+=e[0]*X+e[4]*Y+e[8]*Z+e[12];z+=e[2]*X+e[6]*Y+e[10]*Z+e[14]}key[t]=WB_cellK(x/3,z/3);ord[t]=t}
  Q.sk=(Q.sk||0)+performance.now()-T0;ord.sort((a,b)=>key[a]-key[b]);Q.so=(Q.so||0)+performance.now()-T0;if(I){const src=I.array.slice();for(let t=0;t<nt;t++){I.array[t*3]=src[ord[t]*3];I.array[t*3+1]=src[ord[t]*3+1];I.array[t*3+2]=src[ord[t]*3+2]}I.needsUpdate=true}else for(const nm in g.attributes){const A=g.attributes[nm];if(A.isInterleavedBufferAttribute)return null;const w=A.itemSize*3,src=A.array.slice();for(let t=0;t<nt;t++)A.array.set(src.subarray(ord[t]*w,ord[t]*w+w),t*w);A.needsUpdate=true}
  Q.pe=(Q.pe||0)+performance.now()-T0;const runs=[];let s0=0;for(let t=1;t<=nt;t++)if(t===nt||key[ord[t]]!==key[ord[s0]]){runs.push([key[ord[s0]],s0*3,(t-s0)*3]);s0=t}
  const out=[],b=new THREE.Box3(),v=new THREE.Vector3();for(const [k,st,cn] of runs){const pg=new THREE.BufferGeometry();for(const nm in g.attributes)pg.setAttribute(nm,g.attributes[nm]);if(I)pg.setIndex(I);pg.setDrawRange(st,cn);b.makeEmpty();for(let i=st;i<st+cn;i++)b.expandByPoint(v.fromBufferAttribute(P,I?I.getX(i):i));pg.boundingBox=b.clone();pg.boundingSphere=b.getBoundingSphere(new THREE.Sphere());
    const m=new THREE.Mesh(pg,o.material);m.position.copy(o.position);m.quaternion.copy(o.quaternion);m.scale.copy(o.scale);m.castShadow=o.castShadow;m.receiveShadow=o.receiveShadow;m.renderOrder=o.renderOrder;m.visible=false;m.userData.keep=1;m.userData.wbM=1;m.raycast=()=>{};o.parent.add(m);
    // its far version: built later in the background from the run's CPU arrays (kept by reference: SM_upload drops them from the attributes)
    const A={};for(const nm of['position','uv','color'])if(g.attributes[nm]){const X=g.attributes[nm];A[nm]=[X.array,X.itemSize,X.normalized]}const IA=I?I.array:null,mat=o.material;
    out.push({k,m,mk:()=>{const tg=new THREE.BufferGeometry();for(const nm in A){const [arr,sz,nz]=A[nm];tg.setAttribute(nm,IA?new THREE.BufferAttribute(arr,sz,nz):new THREE.BufferAttribute(arr.subarray(st*sz,(st+cn)*sz),sz,nz))}if(IA)tg.setIndex(new THREE.BufferAttribute(IA.subarray(st,st+cn),1));
      const tp=WB_tpl(tg,mat,TUNE.wbLodCell,true);if(lift)for(let i=1;i<tp.p.length;i+=3)tp.p[i]+=lift;return tp}})}Q.all=(Q.all||0)+performance.now()-T0;return out}
// loading screen, before SM_upload: sort the merged tiles by cell (~0.2 s) while their CPU arrays still exist
function WB_cityPrep(){if(!TUNE.wbCity||!TUNE.wbMerged||!HUB||!HUB.grp)return;WB_cityClear();const t0=performance.now();HUB.grp.updateMatrixWorld(true);
  const mobjs=[],mats=new Set(Object.values(HUB.M||{}).concat(HUB.flatMat||[])),geos=new Map();const walk=o=>{if(o===RO.grp||o.userData.lz||o.userData.keep||o.visible===false&&!o.isMesh)return;if(!WB_cand(o)&&WB_mcand(o,mats)){mobjs.push(o);geos.set(o.geometry,(geos.get(o.geometry)||0)+1)}for(const c of o.children)walk(c)};walk(HUB.grp);
  const L=[];for(const o of mobjs){if(geos.get(o.geometry)>1)continue;const P=WB_split(o,o.material.polygonOffset||mats.has(o.material)?.25:0);if(P)L.push({o,P})}WBC.prep={grp:HUB.grp,L};WBC.st.tPrep=Math.round(performance.now()-t0)}
const WB_cellK=(x,z)=>(Math.floor(x/WBC.C)+2048)*4096+(Math.floor(z/WBC.C)+2048);
const WB_supK=k=>{const ix=Math.floor(k/4096)-2048,iz=k%4096-2048;return (Math.floor(ix/2)+1024)*4096+(Math.floor(iz/2)+1024)};
function WB_rangeSphere(p,st,n){let x0=1e9,y0=1e9,z0=1e9,x1=-1e9,y1=-1e9,z1=-1e9;for(let i=st*3;i<(st+n)*3;i+=3){const x=p[i],y=p[i+1],z=p[i+2];if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;if(z<z0)z0=z;if(z>z1)z1=z}
  return new THREE.Sphere(new THREE.Vector3((x0+x1)/2,(y0+y1)/2,(z0+z1)/2),Math.hypot(x1-x0,y1-y0,z1-z0)/2)}
// build once per city, inside the loading screen (time-sliced so the bar keeps moving)
async function WB_cityBuild(a,b){if(!TUNE.wbCity||!HUB||!HUB.grp||WBC.built===HUB.grp||WBC.busy)return;WBC.busy=1;try{await WB_cityBuild2(a,b)}finally{WBC.busy=0}}
// a==null: in-game background build, ~5 ms slices; aborts if the city changes under it
const WB_big=(t,l)=>{const ms=performance.now()-t;if(ms<30)return;const B=WBC.st.big||(WBC.st.big=[]);B.push([Math.round(ms),l]);B.sort((a,b)=>b[0]-a[0]);B.length=Math.min(B.length,6)};
async function WB_cityBuild2(a,b){const t0=performance.now(),SL=a==null?6:14,grp=HUB.grp,gone=()=>HUB.grp!==grp||!TUNE.wbCity;const yl=async(f)=>{const sl=performance.now()-tt,S=WBC.st;S.slN=(S.slN||0)+1;if(sl>(S.slMax||0))S.slMax=Math.round(sl);if(sl>50)S.sl50=(S.sl50||0)+1;if(sl>100)S.sl100=(S.sl100||0)+1;if(a!=null&&typeof ldSet==='function'){ldSet(a+(b-a)*f,'Simplifying far streets');await nextFrame()}else await nextFrame();if(gone())throw 'WBabort';return performance.now()};const prep=WBC.prep&&WBC.prep.grp===grp?WBC.prep:null;WBC.prep=null;WB_cityClear(prep);WBC.grp=grp;WBC.built=grp;grp.updateMatrixWorld(true);
  const objs=[];const walk=o=>{if(o===RO.grp||o.userData.lz||o.userData.keep||o.visible===false&&!o.isMesh)return;if(WB_cand(o))objs.push(o);for(const c of o.children)walk(c)};walk(grp);
  const M=new THREE.Matrix4(),W=new THREE.Matrix4(),col=new THREE.Color();let tt=performance.now();
  for(const o of objs){const ti=performance.now(),n=o.count,ck=new Float64Array(n),e={o,ck,ver:o.instanceMatrix.version,P:null,nc:0,cells:new Set()};
    for(let j=0;j<n;j++){o.getMatrixAt(j,M);W.multiplyMatrices(o.matrixWorld,M);const el=W.elements,s=Math.hypot(el[0],el[1],el[2]);if(s<1e-4){ck[j]=-1;continue}const k=WB_cellK(el[12],el[14]);ck[j]=k;e.cells.add(k);
      let c=WBC.cells.get(k);if(!c){const cx=Math.floor(el[12]/WBC.C)*WBC.C,cz=Math.floor(el[14]/WBC.C)*WBC.C;c={k,x0:cx,z0:cz,objs:new Set(),items:[],lod:null};WBC.cells.set(k,c)}c.objs.add(e);
      const cell=TUNE.wbLodCell/s;if(o.instanceColor)o.getColorAt(j,col);else col.setRGB(1,1,1);c.items.push([WB_tpl(o.geometry,o.material,Math.pow(2,Math.round(Math.log2(cell)*4)/4)),new Float32Array(W.elements),col.r,col.g,col.b]);if(!WBC.fast&&(j&127)===127&&performance.now()-tt>SL)tt=await yl(.4*WBC.objs.length/objs.length)}
    WB_big(ti,'inst '+n+'x'+(o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count)+(o.material.map?' tex':''));WBC.objs.push(e);if(!WBC.fast&&performance.now()-tt>SL)tt=await yl(.4*WBC.objs.length/objs.length)}
  WBC.st.tI=Math.round(performance.now()-t0);const getC=(k,x,z)=>{let c=WBC.cells.get(k);if(!c){c={k,x0:Math.floor(x/WBC.C)*WBC.C,z0:Math.floor(z/WBC.C)*WBC.C,objs:new Set(),items:[],lod:null};WBC.cells.set(k,c)}return c};
  for(const {o,P:L} of prep?prep.L:[]){const e={o,mesh:1,pcs:L.map(q=>[q.k,q.m]),cells:new Set()};
    for(const q of L){const kx=Math.floor(q.k/4096)-2048,kz=q.k%4096-2048,c=getC(q.k,kx*WBC.C+1,kz*WBC.C+1);c.objs.add(e);e.cells.add(q.k);const ti=performance.now();c.items.push([q.mk(),new Float32Array(o.matrixWorld.elements),1,1,1]);q.mk=null;WB_big(ti,'piece '+(q.m.geometry.drawRange.count)+(o.material.map?' tex':''));if(!WBC.fast&&performance.now()-tt>SL)tt=await yl(.5)}
    WBC.mobjs.push(e)}
  WBC.st.tM=Math.round(performance.now()-t0);WBC.mat=WBC.mat||new THREE.MeshStandardMaterial({vertexColors:true,roughness:.75,metalness:.05});let i=0;
  // v88w: 2x2 cells share ONE buffer (a "super cell"); each cell's far mesh is a drawRange view of it, the super mesh draws all four in 1 call far away
  const SUP=new Map();for(const c of WBC.cells.values()){const sk=WB_supK(c.k);let S=SUP.get(sk);if(!S){S={k:sk,cells:[],lod:null};SUP.set(sk,S)}S.cells.push(c)}
  for(const S of SUP.values()){const ti=performance.now();let nt=0;S.grp=grp;S.x0=Math.min(...S.cells.map(c=>c.x0));S.z0=Math.min(...S.cells.map(c=>c.z0));S.x1=Math.max(...S.cells.map(c=>c.x0))+WBC.C;S.z1=Math.max(...S.cells.map(c=>c.z0))+WBC.C;
    for(const c of S.cells)for(const it of c.items)nt+=it[0].n;S.nt=nt;
    // v89b STR: streaming keeps the items and builds the super cell's buffer only within range of the camera (STR_step); otherwise build it now as before
    if(!STR_on())for(const _ of WB_supMk(S,false));
    WBC.sup.push(S);WB_big(ti,'super '+nt);i+=S.cells.length;if(!WBC.fast&&performance.now()-tt>SL)tt=await yl(.5+.5*i/WBC.cells.size)}
  {const sl=performance.now()-tt,S=WBC.st;if(sl>(S.slMax||0))S.slMax=Math.round(sl);if(sl>50)S.sl50=(S.sl50||0)+1;if(sl>100)S.sl100=(S.sl100||0)+1}
  WBC.on=true;WBC.sig='';WBC.st.ms=Math.round(performance.now()-t0);WBC.st.objs=WBC.objs.length;WBC.st.mobjs=WBC.mobjs.length;WBC.st.cells=WBC.cells.size}
// v89b: one super cell's far buffer from its cells' items (keep=true: items stay for a later rebuild; the CPU copy is dropped after the GPU upload)
function* WB_supMk(S,keep){const nt=S.nt,grp=S.grp;if(!nt){if(!keep)for(const c of S.cells)c.items=null;return}const p=new Float32Array(nt*9),nn=new Int8Array(nt*9),cc=new Uint8Array(nt*9),v=new THREE.Vector3(),q=new THREE.Vector3(),r=new THREE.Vector3();let o=0,ty=performance.now();const rng=[];
  for(const c of S.cells){const o0=o;for(const [t,el,cr,cg,cb] of c.items){for(let f=0;f<t.n;f++){for(let k=0;k<3;k++){const s=f*9+k*3,x=t.p[s],y=t.p[s+1],z=t.p[s+2];p[o+k*3]=el[0]*x+el[4]*y+el[8]*z+el[12];p[o+k*3+1]=el[1]*x+el[5]*y+el[9]*z+el[13];p[o+k*3+2]=el[2]*x+el[6]*y+el[10]*z+el[14]}
      v.set(p[o+3]-p[o],p[o+4]-p[o+1],p[o+5]-p[o+2]);q.set(p[o+6]-p[o],p[o+7]-p[o+1],p[o+8]-p[o+2]);r.crossVectors(v,q).normalize();const R8=Math.round(r.x*127),G8=Math.round(r.y*127),B8=Math.round(r.z*127),c0=Math.min(255,Math.round(t.c[f*3]*cr*255)),c1=Math.min(255,Math.round(t.c[f*3+1]*cg*255)),c2=Math.min(255,Math.round(t.c[f*3+2]*cb*255));for(let k=0;k<3;k++){nn[o+k*3]=R8;nn[o+k*3+1]=G8;nn[o+k*3+2]=B8;cc[o+k*3]=c0;cc[o+k*3+1]=c1;cc[o+k*3+2]=c2}o+=9}
      if(keep&&performance.now()-ty>STR.sl){yield;ty=performance.now()}}
    rng.push([c,o0/3,(o-o0)/3]);if(!keep)c.items=null}
  const A=[new THREE.BufferAttribute(p,3),new THREE.BufferAttribute(nn,3,true),new THREE.BufferAttribute(cc,3,true)];if(keep&&TUNE.strFree){const rel=function(){STR.st.relMB+=this.array.byteLength/1048576;this.array=null};for(const a of A)a.onUpload(rel)}
  const mk=(st,n)=>{const g=new THREE.BufferGeometry();g.setAttribute('position',A[0]);g.setAttribute('normal',A[1]);g.setAttribute('color',A[2]);g.setDrawRange(st,n);g.boundingSphere=WB_rangeSphere(p,st,n);
    const m=new THREE.Mesh(g,WBC.mat);m.matrixAutoUpdate=false;m.visible=false;m.userData.keep=1;m.userData.wbLod=1;m.raycast=()=>{};m.receiveShadow=false;m.castShadow=false;grp.add(m);return m};
  for(const [c,st,n] of rng)if(n)c.lod=mk(st,n);if(rng.filter(q=>q[2]).length>1)S.lod=mk(0,nt*3);S.built=1;S.mb=nt*54/1048576;WBC.st.lodT=(WBC.st.lodT||0)+nt}
function WB_supFree(S){const gs=new Set();for(const c of S.cells)if(c.lod){c.lod.removeFromParent();gs.add(c.lod.geometry);c.lod=null}if(S.lod){S.lod.removeFromParent();gs.add(S.lod.geometry);S.lod=null}for(const g of gs)g.dispose();S.built=0;WBC.st.lodT=Math.max(0,(WBC.st.lodT||0)-S.nt)}
function WB_cityClear(keep){if(WBC.prep&&WBC.prep!==keep){for(const {P} of WBC.prep.L)for(const q of P)q.m.removeFromParent();WBC.prep=null}for(const c of WBC.cells.values())if(c.lod){c.lod.removeFromParent();c.lod.geometry.dispose()}for(const S of WBC.sup||[])if(S.lod){S.lod.removeFromParent();S.lod.geometry.dispose()}WBC.sup=[];for(const G of WBC.grps||[])if(G.P){G.P.removeFromParent();G.P.dispose()}WBC.grps=null;for(const e of WBC.mobjs){for(const [,m] of e.pcs)m.removeFromParent();for(const r of e.rm||[])r.removeFromParent()}WBC.cells.clear();WBC.objs=[];WBC.mobjs=[];WBC.tpl.clear();WBC.on=false;WBC.grp=null;WBC.built=null}
// near proxy of one original: only its instances in near cells (rebuilt when the near set changes or the game rewrote the original)
const WB_M=new THREE.Matrix4(),WB_Cl=new THREE.Color();
// v88w: near proxies are per (model, material, parent) across all 1 km tiles: two tiles' copies of the same house were 2 draws, now 1
function WB_groups(){WBC.grps=[];WBC.grpsFor=WBC.objs;const m=new Map();for(const e of WBC.objs){const o=e.o,k=o.geometry.uuid+'|'+o.material.uuid+'|'+(o.instanceColor?1:0)+'|'+o.parent.uuid+'|'+o.castShadow+'|'+o.receiveShadow+'|'+o.renderOrder;
  let G=m.get(k);if(!G){G={L:[],P:null,dirty:1,sig:0,n:0,cap:0};m.set(k,G);WBC.grps.push(G)}G.L.push(e);G.cap+=o.count;e.G=G}}
function WB_prox(e){e.ver=e.o.instanceMatrix.version;if(e.G)e.G.dirty=1}
function WB_gprox(G){let n=0;for(const e of G.L){if(!e.v)continue;const o=e.o;for(let j=0;j<o.count;j++)if(e.ck[j]>=0&&WBC.near.has(e.ck[j]))n++}G.n=n;G.dirty=0;if(!n){if(G.P)G.P.count=0;return}const o0=G.L[0].o;
  if(!G.P||G.P.instanceMatrix.count<n){if(G.P){G.P.removeFromParent();G.P.dispose()}const P=new THREE.InstancedMesh(o0.geometry,o0.material,Math.max(n,Math.min(G.cap,n*2)));P.userData.keep=1;P.userData.wbP=1;P.castShadow=o0.castShadow;P.receiveShadow=o0.receiveShadow;P.renderOrder=o0.renderOrder;P.raycast=()=>{};
    if(o0.instanceColor)P.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(P.instanceMatrix.count*3),3);o0.parent.add(P);G.P=P}
  const P=G.P;let i=0;for(const e of G.L){if(!e.v)continue;const o=e.o;o.updateMatrix();const id=WB_isId(o.matrix);for(let j=0;j<o.count;j++){if(!(e.ck[j]>=0&&WBC.near.has(e.ck[j])))continue;o.getMatrixAt(j,WB_M);if(!id)WB_M.premultiply(o.matrix);P.setMatrixAt(i,WB_M);if(o.instanceColor){o.getColorAt(j,WB_Cl);P.setColorAt(i,WB_Cl)}i++}}
  P.count=n;P.instanceMatrix.needsUpdate=true;if(P.instanceColor)P.instanceColor.needsUpdate=true;P.computeBoundingSphere()}
const WB_isId=m=>{const e=m.elements;return e[0]===1&&e[5]===1&&e[10]===1&&e[15]===1&&!e[1]&&!e[2]&&!e[4]&&!e[6]&&!e[8]&&!e[9]&&!e[12]&&!e[13]&&!e[14]};
// v88w: neighbouring near cells are neighbours in the sorted buffer too (same column): one drawRange mesh per contiguous run of near pieces
function WB_mruns(e){for(const r of e.rm||[])r.visible=false;e.show=[];const P=e.pcs;let i=0,u=0;while(i<P.length){if(!WBC.near.has(P[i][0])){i++;continue}let j=i;while(j+1<P.length&&WBC.near.has(P[j+1][0]))j++;
    if(j===i||!TUNE.wbRuns){for(let q=i;q<=j;q++)e.show.push(P[q][1])}else{const m0=P[i][1],g0=m0.geometry,st=g0.drawRange.start,gl=P[j][1].geometry,end=gl.drawRange.start+gl.drawRange.count;let r=(e.rm||(e.rm=[]))[u];
      if(!r){const pg=new THREE.BufferGeometry();for(const nm in g0.attributes)pg.setAttribute(nm,g0.attributes[nm]);if(g0.index)pg.setIndex(g0.index);r=new THREE.Mesh(pg,m0.material);r.position.copy(m0.position);r.quaternion.copy(m0.quaternion);r.scale.copy(m0.scale);r.castShadow=m0.castShadow;r.receiveShadow=m0.receiveShadow;r.renderOrder=m0.renderOrder;r.visible=false;r.userData.keep=1;r.userData.wbM=1;r.raycast=()=>{};m0.parent.add(r);e.rm.push(r)}
      u++;r.geometry.setDrawRange(st,end-st);const b=new THREE.Box3();for(let q=i;q<=j;q++)b.union(P[q][1].geometry.boundingBox);r.geometry.boundingBox=b;r.geometry.boundingSphere=b.getBoundingSphere(new THREE.Sphere());e.show.push(r)}i=j+1}}
const WBC_v=[];
function WB_cityHide(){if(WBC.hid)return;WBC.hid=1;for(const G of WBC.grps||[])if(G.P)G.P.visible=false;for(const e of WBC.mobjs){for(const [,m] of e.pcs)m.visible=false;for(const r of e.rm||[])r.visible=false}for(const c of WBC.cells.values())if(c.lod)c.lod.visible=false;for(const S of WBC.sup||[])if(S.lod)S.lod.visible=false}
function WB_cityPre(cam){WBC_v.length=0;if(!WBC.on)return;if(WBC.grp!==HUB.grp||!HUB.grp.visible||!TUNE.wbCity||state!=='roam'&&state!=='loading'){WB_cityHide();return}WBC.hid=0;const cx=cam.matrixWorld.elements[12],cz=cam.matrixWorld.elements[14],D=TUNE.wbLodD,R=(SET.q==='high'?2100:1600);
  // near set: cells whose rectangle is within D of the camera (updated when the camera crosses a 25 m step)
  const sk=Math.round(cx/25)+','+Math.round(cz/25)+','+D;if(sk!==WBC.sig){WBC.sig=sk;const nw=new Set();for(const c of WBC.cells.values()){const dx=Math.max(c.x0-cx,0,cx-c.x0-WBC.C),dz=Math.max(c.z0-cz,0,cz-c.z0-WBC.C);c.d=Math.hypot(dx,dz);if(c.d<=D)nw.add(c.k)}
    const ch=new Set();for(const k of nw)if(!WBC.near.has(k))ch.add(k);for(const k of WBC.near)if(!nw.has(k))ch.add(k);WBC.near=nw;const t=performance.now();for(const e of WBC.mobjs)WB_mruns(e);for(const e of WBC.objs){let hit=false;for(const k of ch)if(e.cells.has(k)){hit=true;break}if(hit)WB_prox(e)}WBC.st.reb=performance.now()-t}
  if(!WBC.grps||WBC.grpsFor!==WBC.objs)WB_groups();let lod=0,px=0;const now=performance.now();for(const e of WBC.objs){const o=e.o;if(e.off){WBC_v.push(o.visible);e.v=false;continue}if(e.ver!==o.instanceMatrix.version){if(now-(e.rt||0)<2000&&++e.rn>4){e.off=1;WBC_v.push(o.visible);e.v=false;continue}if(now-(e.rt||0)>=2000){e.rt=now;e.rn=0}WB_prox(e)}const v=o.visible;e.v=v;WBC_v.push(v);o.visible=false}
  for(const G of WBC.grps){let h=0;for(let q=0;q<G.L.length;q++)if(G.L[q].v)h=(h*31+q+1)|0;if(h!==G.sig){G.sig=h;G.dirty=1}if(G.dirty)WB_gprox(G);if(G.P){G.P.visible=G.n>0;if(G.P.visible)px++}}
  for(const e of WBC.mobjs){const v=e.o.visible;e.v=v;WBC_v.push(v);e.o.visible=false;if(!e.show)WB_mruns(e);for(const [,m] of e.pcs)m.visible=false;for(const m of e.show){m.visible=v;if(v)px++}}
  for(const c of WBC.cells.values())if(c.lod){let any=false;for(const e of c.objs)if(e.v&&e.o.parent){any=true;break}c.lod.visible=!WBC.near.has(c.k)&&c.d<R&&any;c.ok=any;if(c.lod.visible)lod++}
  const SD=TUNE.wbSuperD;if(SD>0)for(const S of WBC.sup){if(!S.lod)continue;let ok=true,vis=false;for(const c of S.cells){if(!c.lod)continue;if(WBC.near.has(c.k)||c.d<SD||!c.ok){ok=false;break}if(c.lod.visible)vis=true}
    S.lod.visible=false;if(ok&&vis){for(const c of S.cells)if(c.lod&&c.lod.visible){c.lod.visible=false;lod--}S.lod.visible=true;lod++}}
  WBC.st.lod=lod;WBC.st.prox=px}
// far small things: mission-giver minifigs, the 1.5 m beacon stubs, ramp parts (each 1-35 draws, a few px tall beyond ~260 m)
const WBF={L:[],t:0,h:[]};function WB_figPre(cam){WBF.h.length=0;const D=TUNE.wbFig;if(!D||state!=='roam')return;const now=performance.now();if(now-WBF.t>2000){WBF.t=now;WBF.L=[];WBF.T=[];scene.traverse(o=>{const u=o.userData;if(u&&o.parent&&(u.qaFig||u.artB!=null||u.ramp))WBF.L.push(o);if(o.isMesh&&o.geometry&&o.geometry.type==='TorusGeometry'&&o.geometry.parameters.radius>=3)WBF.T.push(o)})}
  const cx=cam.matrixWorld.elements[12],cz=cam.matrixWorld.elements[14],D2=D*D;for(const g of WBF.L){if(!g.visible)continue;const e=g.matrixWorld.elements;if((e[12]-cx)**2+(e[14]-cz)**2>D2){g.visible=false;WBF.h.push(g)}}
  // v88v review: never draw a ring (story/quest/event/pop-up torus, radius ≥ 3 m) with the camera at or inside it: within 6 m of its plane and R+6 m of its centre
  // (the chase camera reaches a ring ~1 m before the car: the torus became a huge opaque arc over a third of the phone screen)
  if(TUNE.wbRingCam){const cy=cam.matrixWorld.elements[13],K=TUNE.wbRingCam;for(const o of WBF.T||[]){if(!o.visible||!o.parent)continue;const e=o.matrixWorld.elements,dx=cx-e[12],dy=cy-e[13],dz=cz-e[14],R=o.geometry.parameters.radius*Math.hypot(e[0],e[1],e[2]);if(dx*dx+dy*dy+dz*dz>(R+K)**2)continue;
    const nl=Math.hypot(e[8],e[9],e[10])||1;if(Math.abs(dx*e[8]+dy*e[9]+dz*e[10])/nl<K){o.visible=false;WBF.h.push(o)}}}}
function WB_figPost(){for(const g of WBF.h)g.visible=true;WBF.h.length=0}
function WB_cityPost(){if(!WBC_v.length)return;const L=WBC.objs,n=L.length,M=WBC.mobjs;for(let i=0;i<n&&i<WBC_v.length;i++)L[i].o.visible=WBC_v[i];for(let i=0;i<M.length&&n+i<WBC_v.length;i++)M[i].o.visible=WBC_v[n+i];WBC_v.length=0}
{const ob=scene.onBeforeRender,oa=scene.onAfterRender;scene.onBeforeRender=function(...a){try{WB_pre(...a)}catch(e){WB.act.length=0;WB.err=String(e)+(e.stack||'').slice(0,300);console.warn('WB',e)}try{if(a[2]&&a[2].isPerspectiveCamera)WB_cityPre(a[2])}catch(e){WB_cityPost();console.warn('WBC',e)}try{if(a[2]&&a[2].isPerspectiveCamera)WB_figPre(a[2])}catch(e){WB_figPost()}return ob.apply(this,a)};
 scene.onAfterRender=function(...a){try{WB_post()}catch(e){}try{WB_cityPost()}catch(e){}try{WB_figPost()}catch(e){}return oa.apply(this,a)}}
// v88v: the texture colour readback (WB_pix) stalls on the GPU (8 s for one canvas in swiftshader while the game renders): do it here, behind the loading bar
function WB_pixPrep(){if(!TUNE.wbCity||!HUB||!HUB.grp)return;const t0=performance.now(),mats=new Set(Object.values(HUB.M||{}).concat(HUB.flatMat||[]));const walk=o=>{if(o===RO.grp||o.userData.lz||o.userData.keep||o.visible===false&&!o.isMesh)return;if((WB_cand(o)||WB_mcand(o,mats))&&o.material.map)WB_pix(o.material.map);for(const c of o.children)walk(c)};walk(HUB.grp);WBC.st.tPix=Math.round(performance.now()-t0)}
{const _lp=ldPrewarm;ldPrewarm=async function(...a){try{WB_cityPrep();WB_pixPrep()}catch(e){console.warn('WBC prep',e);try{WB_cityClear()}catch(_){}}return _lp.apply(this,a)}}
{const _rp=roamPost;roamPost=function(...a){const r=_rp.apply(this,a);setTimeout(()=>{WB_cityBuild(null).catch(e=>{WBC.err=String(e)+' '+(e&&e.stack||'').slice(0,400);if(e!=='WBabort')console.warn('WBC build',e);try{WB_cityClear()}catch(_){}})},1500);return r}}
// tests: __wb.fast() finishes a running/pending background build without yielding (headless frames are ~300 ms each)
window.__wb={WB,WBC,fast:()=>{WBC.fast=1;return new Promise(r=>{const t=performance.now(),w=()=>WBC.on||WBC.err||performance.now()-t>120000?r(WBC.st):setTimeout(w,50);w()})}};
// v88w: map icons (≈70 mission/garage/event sprites, 1 draw each) draw as ONE instanced camera-facing quad from a 16×8 atlas of their 128 px canvases.
// Pre-render: visible icon sprites are hidden and copied into the batch; post-render they are shown again (game code keeps using m.sp as before).
const WBI={slot:new Map(),free:[],h:[],m:null,cv:null,tx:null};
function WB_icoInit(){const c=document.createElement('canvas');c.width=2048;c.height=1024;WBI.cv=c;WBI.cx=c.getContext('2d');for(let i=127;i>=0;i--)WBI.free.push(i);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;WBI.tx=t;const N=160,geo=new THREE.PlaneGeometry(1,1),ia=new THREE.InstancedBufferAttribute(new Float32Array(N*3),3);ia.setUsage(THREE.DynamicDrawUsage);geo.setAttribute('iA',ia);
  const mat=new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false});mat.onBeforeCompile=s=>{s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nattribute vec3 iA;varying float vIA;').replace('#include <uv_vertex>','#include <uv_vertex>\nvMapUv=vMapUv*vec2(.0625,.125)+iA.xy;vIA=iA.z;');
    s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nvarying float vIA;').replace('#include <map_fragment>','#include <map_fragment>\ndiffuseColor.a*=vIA;')};mat.customProgramCacheKey=()=>'wbIco';
  const m=new THREE.InstancedMesh(geo,mat,N);m.count=0;m.frustumCulled=false;m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);m.userData.keep=1;m.raycast=()=>{};m.name='WB_icons';WBI.m=m;WBI.ia=ia;scene.add(m)}
function WB_icoSlot(t){let k=WBI.slot.get(t);if(k!=null)return k;const img=t&&t.image;if(!img||!img.width||!WBI.free.length)return -1;k=WBI.free.pop();const x=(k%16)*128,y=Math.floor(k/16)*128;
  WBI.cx.clearRect(x,y,128,128);WBI.cx.drawImage(img,x,y,128,128);WBI.tx.needsUpdate=true;WBI.slot.set(t,k);t.addEventListener('dispose',()=>{if(WBI.slot.get(t)===k){WBI.slot.delete(t);WBI.free.push(k)}});return k}
const _wbiQ=new THREE.Quaternion(),_wbiP=new THREE.Vector3(),_wbiS=new THREE.Vector3(),_wbiM=new THREE.Matrix4();
function WB_icoPre(cam){WBI.h.length=0;if(WBI.m)WBI.m.visible=false;if(!TUNE.wbIcon||typeof state==='undefined'||state!=='roam'||typeof RO==='undefined'||!RO||!RO.marks)return;if(!WBI.m)WB_icoInit();
  const m=WBI.m,a=WBI.ia.array;let n=0;cam.getWorldQuaternion(_wbiQ);
  for(const mk of RO.marks){const sp=mk&&mk.sp;if(!sp||!sp.visible||n>=160)continue;let o=sp.parent,vis=!!o;while(o){if(!o.visible){vis=false;break}if(o===scene)break;o=o.parent;if(!o)vis=false}if(!vis)continue;
    const mt=sp.material;if(!mt||mt.depthTest===false||sp.renderOrder)continue;const k=WB_icoSlot(mt.map);if(k<0)continue;const e=sp.matrixWorld.elements;
    _wbiP.set(e[12],e[13],e[14]);_wbiS.set(Math.hypot(e[0],e[1],e[2]),Math.hypot(e[4],e[5],e[6]),1);_wbiM.compose(_wbiP,_wbiQ,_wbiS);m.setMatrixAt(n,_wbiM);
    a[n*3]=(k%16)*.0625;a[n*3+1]=1-(Math.floor(k/16)+1)*.125;a[n*3+2]=mt.opacity;n++;sp.visible=false;WBI.h.push(sp)}
  m.count=n;m.visible=n>0;if(n){m.instanceMatrix.needsUpdate=true;WBI.ia.needsUpdate=true}}
function WB_icoPost(){for(const s of WBI.h)s.visible=true;WBI.h.length=0}
{const ob=scene.onBeforeRender,oa=scene.onAfterRender;scene.onBeforeRender=function(...a){const r=ob.apply(this,a);try{if(a[2]&&a[2].isPerspectiveCamera)WB_icoPre(a[2])}catch(e){WB_icoPost();console.warn('WBI',e)}return r};
 scene.onAfterRender=function(...a){try{WB_icoPost()}catch(e){}return oa.apply(this,a)}}
