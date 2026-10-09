// ===== BW (v88w): 2x brick detail near the camera (Alex: "double the bricks and tiles, same for the city"). Owner: world worker (alex/od-world). =====
// Everything here is NEAR ONLY: the far city cells (WB_city, WBC.mat) and far traffic copies never see it, so draws/tris stay in budget.
// 1. BW_inject: building materials (Kenney com/sub atlas, the facade materials HUB.BM) get a world-space LEGO surface in the shader:
//    brick courses with staggered joints and a lit top edge on walls, a tile/plate grid on flat tops, window-frame mullions on glass.
//    0 extra draws, 0 extra triangles; it fades out between TUNE.bwFade*0.6 and TUNE.bwFade metres (and wherever the grooves would alias).
// 2. BW studs: real stud geometry on flat roofs and ledges (Kenney buildings + merged facade blocks) within TUNE.bwStudD of the camera,
//    ONE InstancedMesh for the whole city (1 draw). Studs above the camera's eye are skipped (their tops can't be seen from below).
const BW={U:{uBwOn:{value:1},uBwF:{value:60},uBwC:{value:.48}},mats:new Set(),bm:null,km:{},cells:new Map(),idx:new Map(),tp:new Map(),soup:null,q:[],gen:null,sig:'',mesh:null,st:{studs:0,cells:0,ms:0},grp:null,mt:null};
const BW_FS='uniform float uBwOn,uBwF,uBwC;\nfloat bwLn(float c,float w){float d=abs(fract(c)-.5);float aa=fwidth(c)*.9;return smoothstep(.5-w-aa,.5-w+aa,d);}\n';
// bwK: 1 = walls + tops, 2 = walls only, 3 = glass panels (mullions/transoms)
function BW_code(k){return `\nif(uBwOn>.5){float bwD=length(vViewPosition),bwA=1.-smoothstep(uBwF*.6,uBwF,bwD);if(bwA>.01){vec3 bwN=normalize(cross(dFdx(vLkW),dFdy(vLkW)));float bwG=0.,bwT=1.;
 if(abs(bwN.y)<.4){vec2 bwt=normalize(vec2(-bwN.z,bwN.x));float bu=dot(vLkW.xz,bwt),bv=vLkW.y/uBwC;
  ${k===3?`float g1=bwLn(bu/(uBwC*3.),.035),g2=bwLn(bv/3.,.05);bwG=max(g1,g2);bwT=1.+.05*smoothstep(.55,.95,fract(bv/3.));bwA*=clamp(1.-fwidth(bu/(uBwC*3.))*4.,0.,1.);`
  :`float row=floor(bv),bU=bu/(uBwC*2.)+mod(row,2.)*.5;float g1=bwLn(bv,.06),g2=bwLn(bU,.03);bwG=max(g1,g2*(1.-g1));float h=fract(sin(dot(vec2(floor(bU),row),vec2(127.1,311.7)))*43758.5453);
  bwT=(1.+(h-.5)*.07)*(1.+.07*smoothstep(.7,.93,fract(bv)));bwA*=clamp(1.-fwidth(bv)*3.,0.,1.);`}}
 ${k===1?`else if(bwN.y>.7){float tp=uBwC*1.5;vec2 q=vLkW.xz/tp;bwG=max(bwLn(q.x,.03),bwLn(q.y,.03));float h=fract(sin(dot(floor(q),vec2(127.1,311.7)))*43758.5453);bwT=1.+(h-.5)*.06;bwA*=clamp(1.-fwidth(q.x)*3.,0.,1.);}`:''}
 diffuseColor.rgb*=mix(1.,(1.-.3*bwG)*bwT,bwA);}}`}
function BW_inject(sh,k){if(!sh.fragmentShader.includes('vLkW')||sh.fragmentShader.includes('uBwOn'))return;Object.assign(sh.uniforms,BW.U);
  sh.fragmentShader=BW_FS+sh.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>'+BW_code(k))}
function BW_flag(m,k){if(!m||BW.mats.has(m)||!m.isMeshStandardMaterial)return;BW.mats.add(m);const ob=m.onBeforeCompile,pk=m.customProgramCacheKey;
  m.onBeforeCompile=function(sh,r){if(ob)ob.call(this,sh,r);BW_inject(sh,k)};m.customProgramCacheKey=function(){return pk.call(this)+'|bw'+k};m.needsUpdate=true}
function BW_flagAll(){if(typeof KMM!=='undefined'){for(const kit of['com','sub'])if(KMM[kit]&&BW.km[kit]!==KMM[kit]){BW.km[kit]=KMM[kit];BW_flag(KMM[kit],1)}}
  if(HUB&&HUB.BM&&BW.bm!==HUB.BM){BW.bm=HUB.BM;for(const k in HUB.BM)BW_flag(HUB.BM[k],k==='glass'?3:k==='plain'?2:1)}}

// ---- studs ----
const BW_V=[new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3()];
// grid of stud centres on one flat-topped world triangle; the grid is shared by all triangles with the same in-plane rotation (mod 90°)
function BW_triStuds(ax,ay,az,bx,by,bz,cx,cy,cz,r,g,b,out){const P=TUNE.bwStudP;const ux=bx-ax,uz=bz-az,vx=cx-ax,vz=cz-az,area=ux*vz-uz*vx;if(Math.abs(area)<.5)return;
  const e=[[ux,uz],[cx-bx,cz-bz],[vx,vz]].map(([x,z])=>[x,z,x*x+z*z]).sort((p,q)=>p[2]-q[2])[1];let th=Math.atan2(e[1],e[0]);th=((th%(Math.PI/2))+Math.PI/2)%(Math.PI/2);const co=Math.cos(th),si=Math.sin(th);
  const A=[ax*co+az*si,-ax*si+az*co],B=[bx*co+bz*si,-bx*si+bz*co],C=[cx*co+cz*si,-cx*si+cz*co];const a0=Math.min(A[0],B[0],C[0]),a1=Math.max(A[0],B[0],C[0]),b0=Math.min(A[1],B[1],C[1]),b1=Math.max(A[1],B[1],C[1]);
  if((a1-a0)*(b1-b0)>9e4)return;const d=(p,q,x,y)=>(q[0]-p[0])*(y-p[1])-(q[1]-p[1])*(x-p[0]);const sg=d(A,B,C[0],C[1])>0?1:-1;
  for(let i=Math.ceil(a0/P-.5);(i+.5)*P<=a1;i++)for(let j=Math.ceil(b0/P-.5);(j+.5)*P<=b1;j++){const x=(i+.5)*P,y=(j+.5)*P;if(sg*d(A,B,x,y)<0||sg*d(B,C,x,y)<0||sg*d(C,A,x,y)<0)continue;
    const wx=x*co-y*si,wz=x*si+y*co;// plane height at (wx,wz)
    const l1=((bz-cz)*(wx-cx)+(cx-bx)*(wz-cz))/((bz-cz)*(ax-cx)+(cx-bx)*(az-cz)),l2=((cz-az)*(wx-cx)+(ax-cx)*(wz-cz))/((bz-cz)*(ax-cx)+(cx-bx)*(az-cz)),wy=l1*ay+l2*by+(1-l1-l2)*cy;
    out.push(wx,wy,wz,r,g,b,th)}}
const BW_gnd=(x,z)=>{try{return groundY(x,z)}catch(e){return 0}};
// upward triangles of a world-space triangle soup (p: 9 floats per tri) with per-tri colours (c: 3 floats) → studs per cell
function BW_soup(p,c,n,M,cr,cg,cb,ck){const el=M.elements,o=[];for(let f=0;f<n;f++){const s=f*9;
    for(let k=0;k<3;k++){const x=p[s+k*3],y=p[s+k*3+1],z=p[s+k*3+2];BW_V[k].set(el[0]*x+el[4]*y+el[8]*z+el[12],el[1]*x+el[5]*y+el[9]*z+el[13],el[2]*x+el[6]*y+el[10]*z+el[14])}
    const [A,B,C]=BW_V,ex=B.x-A.x,ey=B.y-A.y,ez=B.z-A.z,fx=C.x-A.x,fy=C.y-A.y,fz=C.z-A.z,nx=ey*fz-ez*fy,ny=ez*fx-ex*fz,nz=ex*fy-ey*fx,L=Math.hypot(nx,ny,nz);if(L<1e-6||ny/L<.97)continue;
    const my=(A.y+B.y+C.y)/3,mx=(A.x+B.x+C.x)/3,mz=(A.z+B.z+C.z)/3;const gh=my-BW_gnd(mx,mz);if(gh<TUNE.bwStudH||gh>TUNE.bwStudTop)continue;
    BW_triStuds(A.x,A.y,A.z,B.x,B.y,B.z,C.x,C.y,C.z,c[f*3]*cr,c[f*3+1]*cg,c[f*3+2]*cb,o)}
  if(!o.length)return;let L=BW.tmp.get(ck);if(!L){L=[];BW.tmp.set(ck,L)}for(let i=0;i<o.length;i++)L.push(o[i])}
// merged facade blocks: read their upward triangles in the loader, before SM_upload drops the CPU arrays (wraps WB_cityPrep, same moment);
// stored per 320 m cell in world space (BW.soup: cell → [p,c,n])
function BW_mergedPrep(){BW.soup=new Map();if(!HUB||!HUB.grp||!HUB.BM)return;const bm=new Set(Object.entries(HUB.BM).filter(([k])=>k!=='glass').map(([,m])=>m));HUB.grp.updateMatrixWorld(true);const acc=new Map(),v=new THREE.Vector3();
  const walk=o=>{if(o===RO.grp||o.userData.lz)return;if(o.isMesh&&!o.isInstancedMesh&&bm.has(o.material)){const P=o.geometry.attributes.position,C=o.geometry.attributes.color,I=o.geometry.index,el=o.matrixWorld.elements,mc=o.material.color;
      if(P&&P.array&&P.array.length&&!P.isInterleavedBufferAttribute){const a=P.array,n=(I?I.count:P.count)/3|0,w=new Float32Array(9);
        for(let f=0;f<n;f++){const ii=[I?I.array[f*3]:f*3,I?I.array[f*3+1]:f*3+1,I?I.array[f*3+2]:f*3+2];for(let q=0;q<3;q++){const i=ii[q];v.set(a[i*3],a[i*3+1],a[i*3+2]).applyMatrix4(o.matrixWorld);w[q*3]=v.x;w[q*3+1]=v.y;w[q*3+2]=v.z}
          const ex=w[3]-w[0],ey=w[4]-w[1],ez=w[5]-w[2],fx=w[6]-w[0],fy=w[7]-w[1],fz=w[8]-w[2],ny=ez*fx-ex*fz,L=Math.hypot(ey*fz-ez*fy,ny,ex*fy-ey*fx);if(L<1e-6||ny/L<.97)continue;
          const k=WB_cellK((w[0]+w[3]+w[6])/3,(w[2]+w[5]+w[8])/3);let B=acc.get(k);if(!B){B={p:[],c:[]};acc.set(k,B)}for(let q=0;q<9;q++)B.p.push(w[q]);B.c.push((C?C.getX(ii[0]):1)*mc.r*.92,(C?C.getY(ii[0]):1)*mc.g*.92,(C?C.getZ(ii[0]):1)*mc.b*.92)}}}
    for(const c of o.children)walk(c)};walk(HUB.grp);for(const [k,B] of acc)BW.soup.set(k,[new Float32Array(B.p),new Float32Array(B.c),B.c.length/3])}
const BW_I=new THREE.Matrix4();
// studs of ONE cell (Kenney com/sub instances in it + its merged soup), time-sliced; BW.cells: cell → Float32Array [x,y,z,r,g,b,rot]*
function* BW_cellGen(k){const t0=performance.now();let t=t0;const sl=function*(){if(!BW.fast&&performance.now()-t>3){yield;t=performance.now()}};BW.tmp=new Map();
  const S=BW.soup&&BW.soup.get(k);if(S)BW_soup(S[0],S[1],S[2],BW_I,1,1,1,k);yield* sl();
  const M=new THREE.Matrix4(),W=new THREE.Matrix4(),col=new THREE.Color();
  for(const [e,js] of BW.idx.get(k)||[]){const o=e.o;let T=BW.tp.get(o.geometry);
    if(T===undefined){const t1=WB_tpl(o.geometry,o.material,.002,true),q=[];for(let f=0;f<t1.n;f++){const s=f*9,p=t1.p,ex=p[s+3]-p[s],ey=p[s+4]-p[s+1],ez=p[s+5]-p[s+2],fx=p[s+6]-p[s],fy=p[s+7]-p[s+1],fz=p[s+8]-p[s+2],ny=ez*fx-ex*fz,L=Math.hypot(ey*fz-ez*fy,ny,ex*fy-ey*fx);if(L>1e-6&&ny/L>.97)q.push(f)}
      if(q.length){const p=new Float32Array(q.length*9),c=new Float32Array(q.length*3);q.forEach((f,i)=>{p.set(t1.p.subarray(f*9,f*9+9),i*9);c.set(t1.c.subarray(f*3,f*3+3),i*3)});T={p,c,n:q.length}}else T=null;BW.tp.set(o.geometry,T);yield* sl()}
    if(!T)continue;for(const j of js){o.getMatrixAt(j,M);W.multiplyMatrices(o.matrixWorld,M);if(o.instanceColor)o.getColorAt(j,col);else col.setRGB(1,1,1);BW_soup(T.p,T.c,T.n,W,col.r,col.g,col.b,k);yield* sl()}}
  const L=BW.tmp.get(k)||[];BW.cells.set(k,new Float32Array(L));BW.tmp=null;BW.st.studs+=L.length/7;BW.st.cells++;BW.st.ms+=Math.round(performance.now()-t0);BW.sig=''}
function BW_index(){BW.idx=new Map();BW.tp=new Map();BW.cells.clear();BW.q=[];BW.gen=null;BW.st.studs=0;BW.st.cells=0;BW.st.ms=0;const kms=new Set([KMM.com,KMM.sub].filter(Boolean));
  for(const e of WBC.objs){if(!kms.has(e.o.material)||!e.o.parent)continue;for(let j=0;j<e.o.count;j++){const k=e.ck[j];if(k<0)continue;let L=BW.idx.get(k);if(!L){L=new Map();BW.idx.set(k,L)}let a=L.get(e);if(!a){a=[];L.set(e,a)}a.push(j)}}
  for(const [k,L] of BW.idx)BW.idx.set(k,[...L]);if(BW.soupG!==WBC.grp)BW.soup=null;BW.ready=WBC.grp}
// cells within bwStudD + 90 m of the camera are generated ahead (nearest first, one at a time)
function BW_need(cx,cz){const D=TUNE.bwStudD+90,C=WBC.C;let best=null,bd=1e9;for(let gx=Math.floor((cx-D)/C);gx<=Math.floor((cx+D)/C);gx++)for(let gz=Math.floor((cz-D)/C);gz<=Math.floor((cz+D)/C);gz++){const k=(gx+2048)*4096+(gz+2048);if(BW.cells.has(k))continue;
    const dx=Math.max(gx*C-cx,0,cx-gx*C-C),dz=Math.max(gz*C-cz,0,cz-gz*C-C),d=Math.hypot(dx,dz);if(d<=D&&d<bd){bd=d;best=k}}return best}
function BW_step(cx,cz){if(BW.always&&!BW.fast){BW.fast=1;try{for(let i=0;i<40;i++){BW_step(cx,cz);if(!BW.gen&&BW_need(cx,cz)==null)break}}finally{BW.fast=0}return}if(!BW.gen){const k=BW_need(cx,cz);if(k==null)return;BW.gk=k;BW.gen=BW_cellGen(k)}try{if(BW.gen.next().done)BW.gen=null}catch(e){BW.cells.set(BW.gk,new Float32Array(0));BW.gen=null;BW.tmp=null;console.warn('BW',e)}}
function BW_studGeo(){const r=TUNE.bwStudP*.3,h=TUNE.bwStudP*.2,a=new THREE.CylinderGeometry(r,r,h,10,1,true),b=new THREE.CircleGeometry(r,10);b.rotateX(-Math.PI/2);b.translate(0,h/2,0);const g=mergeGeometries([a.toNonIndexed(),b.toNonIndexed()]);g.translate(0,h/2,0);return g}
function BW_studPre(cam){const m=BW.mesh;if(m)m.visible=false;if(!TUNE.bwStud||typeof state==='undefined'||state!=='roam'||!WBC.on||!HUB||!HUB.grp)return;
  if(BW.ready!==WBC.grp)BW_index();
  if(!BW.mesh||BW.mesh.userData.P!==TUNE.bwStudP){if(BW.mesh){BW.mesh.removeFromParent();BW.mesh.geometry.dispose()}BW.mat=BW.mat||new THREE.MeshStandardMaterial({roughness:.38,metalness:0,envMapIntensity:1.2});
    const cap=TUNE.bwStudMax|0;const M=new THREE.InstancedMesh(BW_studGeo(),BW.mat,cap);M.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(cap*3),3);M.count=0;M.userData.keep=1;M.userData.P=TUNE.bwStudP;M.raycast=()=>{};M.castShadow=false;M.receiveShadow=true;BW.mesh=M;BW.sig=''}
  const M=BW.mesh;if(M.parent!==HUB.grp)HUB.grp.add(M);const e=cam.matrixWorld.elements,cx=e[12],cy=e[13],cz=e[14];BW_step(cx,cz);const D=TUNE.bwStudD,sg=Math.round(cx/6)+','+Math.round(cz/6)+','+Math.round(cy/2)+','+D;
  if(sg!==BW.sig){BW.sig=sg;const cap=M.instanceMatrix.count,am=M.instanceMatrix.array,ac=M.instanceColor.array,D2=D*D,C=WBC.C;let n=0;
    for(let gx=Math.floor((cx-D)/C);gx<=Math.floor((cx+D)/C);gx++)for(let gz=Math.floor((cz-D)/C);gz<=Math.floor((cz+D)/C);gz++){const L=BW.cells.get((gx+2048)*4096+(gz+2048));if(!L)continue;
      for(let i=0;i<L.length&&n<cap;i+=7){const x=L[i],y=L[i+1],z=L[i+2],dx=x-cx,dz=z-cz;if(dx*dx+dz*dz>D2||y>cy+.4)continue;const th=-L[i+6],c=Math.cos(th),s=Math.sin(th),q=n*16;
        am[q]=c;am[q+1]=0;am[q+2]=-s;am[q+3]=0;am[q+4]=0;am[q+5]=1;am[q+6]=0;am[q+7]=0;am[q+8]=s;am[q+9]=0;am[q+10]=c;am[q+11]=0;am[q+12]=x;am[q+13]=y;am[q+14]=z;am[q+15]=1;ac[n*3]=L[i+3];ac[n*3+1]=L[i+4];ac[n*3+2]=L[i+5];n++}}
    M.count=n;M.instanceMatrix.needsUpdate=true;M.instanceColor.needsUpdate=true;if(n)M.computeBoundingSphere();BW.st.drawn=n}
  M.visible=M.count>0}
// ---- draw budget (v88w: Frankfurt ≤ 200 draws) ----
// terrain: the 400 m city ground tiles / 1000 m outer tiles / small lot plates (trG/trPl, ~30 draws) merged into 800 m / 2000 m blocks in the loader
function BW_terrMerge(){if(!TUNE.wbTerr||!HUB||!HUB.grp)return;const G=new Map();let n0=0;HUB.grp.updateMatrixWorld(true);
  for(const o of HUB.grp.children){const u=o.userData,g=o.geometry;if(!o.isMesh||o.isInstancedMesh||!(u.trG||u.trPl)||!o.visible||Array.isArray(o.material)||!g||!g.attributes.position||!g.attributes.position.array.length||g.morphAttributes&&Object.keys(g.morphAttributes).length)continue;
    if(!g.boundingBox)g.computeBoundingBox();const b=g.boundingBox.clone().applyMatrix4(o.matrixWorld),B=Math.max(b.max.x-b.min.x,b.max.z-b.min.z)>900?2000:800,cx=(b.min.x+b.max.x)/2,cz=(b.min.z+b.max.z)/2;
    const k=[o.material.uuid,Object.keys(g.attributes).sort().join(','),!!g.index,Math.floor(cx/B),Math.floor(cz/B),u.trG?'G':'P',o.renderOrder,o.receiveShadow,o.castShadow,o.frustumCulled].join('|');let L=G.get(k);if(!L){L=[];G.set(k,L)}L.push(o)}
  for(const L of G.values()){if(L.length<2)continue;const gs=L.map(o=>{const g=o.geometry.clone();if(!o.matrixWorld.equals(BW_I))g.applyMatrix4(o.matrixWorld);for(const k in g.attributes)if(g.attributes[k].isInterleavedBufferAttribute)return null;return g});if(gs.includes(null))continue;
    const m0=L[0];let mg=null;try{mg=mergeGeometries(gs)}catch(e){}for(const g of gs)g.dispose();if(!mg)continue;mg.computeBoundingSphere();const m=new THREE.Mesh(mg,m0.material);Object.assign(m.userData,m0.userData,{bwT:L.length});m.receiveShadow=m0.receiveShadow;m.castShadow=m0.castShadow;m.renderOrder=m0.renderOrder;m.frustumCulled=m0.frustumCulled;
    HUB.grp.add(m);for(const o of L){o.removeFromParent();o.geometry.dispose()}n0+=L.length-1}BW.st.terrSaved=n0}
// lazy zones (story/biome extras): their small things (stud lines, crates, signs: geometry radius < 3 m) are not drawn beyond TUNE.wbLzD
const BWZ={h:[],L:new Map()};
function BW_lzPre(cam){BWZ.h.length=0;const D=TUNE.wbLzD;if(!D||typeof LAZY==='undefined'||state!=='roam')return;const e=cam.matrixWorld.elements,cx=e[12],cz=e[14];
  for(const L of LAZY){const R=L.root;if(!R||!R.parent||!R.visible||!L.rect)continue;const r=L.rect,d=Math.hypot(Math.max(r[0]-cx,0,cx-r[1]),Math.max(r[2]-cz,0,cz-r[3]));if(d<=D)continue;
    let c=BWZ.L.get(L);if(!c||c.n!==R.children.length){c={n:R.children.length,m:[]};R.traverse(o=>{if(o.isMesh&&o.geometry&&!o.userData.keep){const g=o.geometry;if(!g.boundingSphere)g.computeBoundingSphere();if(g.boundingSphere&&g.boundingSphere.radius<3)c.m.push(o)}});BWZ.L.set(L,c)}
    for(const o of c.m)if(o.visible){o.visible=false;BWZ.h.push(o)}}
  // HUB-level instanced small things (stud lines, crates, markers) whose whole instance spread is farther than D
  if(!BWZ.hub||BWZ.hubG!==HUB.grp||performance.now()-BWZ.ht>3000){BWZ.hub=[];BWZ.hubG=HUB.grp;BWZ.ht=performance.now();for(const o of HUB.grp.children){if(!o.isInstancedMesh||o.userData.keep||Object.keys(o.userData).length||!o.geometry)continue;const g=o.geometry;if(!g.boundingSphere)g.computeBoundingSphere();if(g.boundingSphere.radius>=3)continue;if(!o.boundingSphere||o.userData.bwV!==o.instanceMatrix.version){o.computeBoundingSphere();}BWZ.hub.push(o)}}
  for(const o of BWZ.hub){if(!o.visible||!o.parent||!o.boundingSphere)continue;const b=o.boundingSphere.center.clone().applyMatrix4(o.matrixWorld),d=Math.hypot(b.x-cx,b.z-cz)-o.boundingSphere.radius;if(d>D){o.visible=false;BWZ.h.push(o)}}}
function BW_lzPost(){for(const o of BWZ.h)o.visible=true;BWZ.h.length=0}
WB_figPre=(f=>function(cam){try{BW_lzPre(cam)}catch(e){BW_lzPost()}return f.apply(this,arguments)})(WB_figPre);
WB_figPost=(f=>function(){BW_lzPost();return f.apply(this,arguments)})(WB_figPost);
// hooks: flag materials + stud update once per perspective render (WB_cityPre runs there); merged soups at WB_cityPrep time
WB_cityPre=(f=>function(cam){try{BW.U.uBwOn.value=TUNE.bwOn?1:0;BW.U.uBwF.value=TUNE.bwFade;BW.U.uBwC.value=TUNE.bwCourse;if(TUNE.bwOn)BW_flagAll();BW_studPre(cam)}catch(e){if(BW.mesh)BW.mesh.visible=false;BW.err=String(e)}return f.apply(this,arguments)})(WB_cityPre);
WB_cityPrep=(f=>function(){const r=f.apply(this,arguments);try{if(TUNE.bwStud){BW_mergedPrep();BW.soupG=HUB.grp}}catch(e){BW.soup=null;console.warn('BW prep',e)}try{BW_terrMerge()}catch(e){console.warn('BW terr',e)}return r})(WB_cityPrep);
window.__bw={st:()=>Object.assign({mats:BW.mats.size,ready:!!BW.ready&&BW.ready===WBC.grp,err:BW.err},BW.st),fast:()=>{if(!WBC.on)return;if(BW.ready!==WBC.grp)BW_index();const c=camera.matrixWorld.elements;BW.fast=1;try{for(let i=0;i<40;i++){BW_step(c[12],c[14]);if(!BW.gen&&BW_need(c[12],c[14])==null)break}}finally{BW.fast=0}BW.sig=''}};
// tests: __wb.fast() (perf.js, shots, g11drive) also makes the stud cells build synchronously from then on
if(window.__wb&&window.__wb.fast){const f=window.__wb.fast;window.__wb.fast=function(){BW.always=1;return f.apply(this,arguments)}}
