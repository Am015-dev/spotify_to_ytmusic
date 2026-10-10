// ---- LDS land trees (land-1, 2026-10-10). Alex: "landscape builds for Frankfurt ... drop the free assets and use our own faster assets".
// Frankfurt's trees become the real LEGO tree parts: 3470 Plant Tree Oval (tree), 2435 Plant Tree Pyramidal 3x3x4 (tree2) and 3471 Plant Tree
// Pyramidal 4x4x6⅔ (tree3), the trees of OMR sets 376-2 / 560 / 6388 (CCAL 2.0). The full LDraw meshes are 1,000-1,600 tris each and Frankfurt
// has ~8,300 trees (60-84 tris each today), so each part is drawn as a lathe of its own silhouette: the radius profile sampled from the LDraw
// mesh (tools/ld/lProfile.py; points below in LDU, y up from the trunk foot), 8 sides near, 6 sides + fewer points far (far ≤ the old tris).
// One scale for all three (3470 = 8.2 m) keeps their real LEGO proportions. Set in ART_trees (props build), so instances/draws/smash/tint are
// unchanged; far LOD per 800 m prop tile (the tile groups of buildHubProps), switched in hubCullStep.
const LDS={P:{
 tree:{n:[[6,0],[6,42],[35,56],[33,62],[42,72],[43,98],[42,112],[32,124],[35,128],[0,144]],f:[[6,0],[6,42],[38,58],[43,95],[34,126],[0,144]],src:'3470'},
 tree2:{n:[[6,0],[6,18],[32,18],[18,36],[26,38],[14,56],[20,58],[8,76],[12,78],[0,99]],f:[[6,0],[6,18],[32,18],[0,99]],src:'2435'},
 tree3:{n:[[6,0],[6,42],[44,42],[26,64],[36,66],[20,88],[28,90],[15,112],[20,114],[10,136],[12,138],[0,159]],f:[[6,0],[6,42],[44,42],[0,159]],src:'3471'}},
 k:8.2/144,trunk:48,near:120,on:[],st:null};
// lathe of a profile; trunk part (y < trunk LDU, thin) brown, crown white (the per-instance tint colours it, ART_TINT)
function LDS_lathe(P,seg){const pts=P.map(([r,y])=>new THREE.Vector2(r*LDS.k,y*LDS.k)),g=new THREE.LatheGeometry(pts,seg).toNonIndexed(),p=g.attributes.position,keep=[];
 for(let i=0;i<p.count;i+=3){const a=new THREE.Vector3().fromBufferAttribute(p,i),b=new THREE.Vector3().fromBufferAttribute(p,i+1),d=new THREE.Vector3().fromBufferAttribute(p,i+2);
  if(b.clone().sub(a).cross(d.clone().sub(a)).lengthSq()<1e-10)continue;keep.push(a,b,d)}// drop the degenerate triangles at the r=0 tip
 const q=new THREE.BufferGeometry().setFromPoints(keep),c=[],tb=new THREE.Color('#7a4a28'),cw=new THREE.Color('#ffffff'),yt=LDS.trunk*LDS.k;
 for(let i=0;i<keep.length;i+=3){const ym=(keep[i].y+keep[i+1].y+keep[i+2].y)/3,r=Math.max(...[0,1,2].map(j=>Math.hypot(keep[i+j].x,keep[i+j].z))),C=ym<yt&&r<7*LDS.k+.01?tb:cw;for(let j=0;j<3;j++)c.push(C.r,C.g,C.b)}
 q.setAttribute('color',new THREE.Float32BufferAttribute(c,3));q.computeVertexNormals();q.computeBoundingBox();q.computeBoundingSphere();return q}
const LDS_tri=g=>g?(g.index?g.index.count:g.attributes.position.count)/3:0;
// ART_trees (97_art.js) builds the tree types inside kmProps: replace their geometry right after it (Frankfurt; Athens keeps its own trees)
// street lamp (swap 2): LEGO 2039 Support 2x2x7 Lamppost (as in 10184 Town Plan, CCAL 2.0) + 3062b round brick lamp + 4740 dish shade, one lathe
// (profile from tools/ld/lProfile.py 2039.dat / 3062b.dat, LDU), 6 sides; replaces the Kenney CC0 'light-curved' (92 tris). Colours by height.
LDS.L={p:[[25,0],[8,12],[6,150],[10,168],[10,190],[20,192],[20,196],[0,198]],h:6.5,c:[[168,'#3a3f48'],[191,'#ffe9a0'],[999,'#2a2e36']]};
function LDS_lamp(){const L=LDS.L,k=L.h/198,g=new THREE.LatheGeometry(L.p.map(([r,y])=>new THREE.Vector2(r*k,y*k)),6).toNonIndexed(),p=g.attributes.position,keep=[];
 for(let i=0;i<p.count;i+=3){const a=new THREE.Vector3().fromBufferAttribute(p,i),b=new THREE.Vector3().fromBufferAttribute(p,i+1),d=new THREE.Vector3().fromBufferAttribute(p,i+2);if(b.clone().sub(a).cross(d.clone().sub(a)).lengthSq()>1e-10)keep.push(a,b,d)}
 const q=new THREE.BufferGeometry().setFromPoints(keep),c=[],C=new THREE.Color();for(let i=0;i<keep.length;i+=3){const ym=(keep[i].y+keep[i+1].y+keep[i+2].y)/3/k;C.set(L.c.find(e=>ym<e[0])[1]);for(let j=0;j<3;j++)c.push(C.r,C.g,C.b)}
 q.setAttribute('color',new THREE.Float32BufferAttribute(c,3));q.computeVertexNormals();q.computeBoundingBox();q.computeBoundingSphere();return q}
// park fence (swap 3): LEGO 3633 Fence Lattice 1x4x1 (LDraw part, CCAL 2.0) instead of the Kenney CC0 'fence-1x3' (204 tris): top rail 80x8x20 LDU,
// end posts, bottom rail and the diamond lattice (4+4 diagonal bars), boxes in LDU from the part file; stretched to the old fence's length.
function LDS_fence(old){old.computeBoundingBox();const ob=old.boundingBox,ox=ob.max.x-ob.min.x,oz=ob.max.z-ob.min.z,len=Math.max(ox,oz),s=len/80,G=[],add=(w,h,d,x,y,z,rz)=>{const b=new THREE.BoxGeometry(w,h,d);if(rz)b.rotateZ(rz);b.translate(x,y,z);G.push(colorize(b.toNonIndexed(),new THREE.Color('#ffffff')))};
 add(80,8,20,0,20,0);add(4,16,6,-38,8,0);add(4,16,6,38,8,0);add(80,4,6,0,2,0);const L=Math.hypot(18,12)+2,a=Math.atan2(12,18);for(let i=0;i<4;i++){const x=-27+i*18;add(L,2,4,x,10,0,a);add(L,2,4,x,10,0,-a)}
 const g=mergeG(G);
 g.scale(s,Math.min(s,(ob.max.y-ob.min.y)/24),s);if(oz>ox)g.rotateY(Math.PI/2);g.translate((ob.min.x+ob.max.x)/2,ob.min.y,(ob.min.z+ob.max.z)/2);g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();return g}
ART_trees=(f=>function(D){f.apply(this,arguments);if(CID!=='fra')return;const st={};try{if(D.lamp&&!D.lamp.lds){const old=LDS_tri(D.lamp.g);D.lamp.gOld=D.lamp.g;D.lamp.mOld=D.lamp.mat;D.lamp.g=LDS_lamp();D.lamp.mat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.35,metalness:.1});D.lamp.lds='lamp';st.lamp={src:'2039',old,near:LDS_tri(D.lamp.g),far:LDS_tri(D.lamp.g)}}}catch(e){console.warn('LDS lamp',e)}try{for(const t in LDS.P){const d=D[t];if(!d)continue;const P=LDS.P[t],old=LDS_tri(d.g);
  d.gOld=d.g;d.g=LDS_lathe(P.n,8);d.gFar=LDS_lathe(P.f,6);d.lds=t;st[t]={src:P.src,old,near:LDS_tri(d.g),far:LDS_tri(d.gFar)}}}catch(e){console.warn('LDS trees',e)}LDS.st=st;LDS.on=[]})(ART_trees);
// fence: D.fence is made after ART_trees, at the end of kmProps (60_city_build.js)
kmProps=(f=>function(D){const r=f.apply(this,arguments);if(CID==='fra'&&D.fence&&!D.fence.lds)try{const old=LDS_tri(D.fence.g);D.fence.gOld=D.fence.g;D.fence.mOld=D.fence.mat;D.fence.g=LDS_fence(D.fence.g);
 D.fence.mat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.35,metalness:0});D.fence.lds='fence';if(LDS.st)LDS.st.fence={src:'3633',old,near:LDS_tri(D.fence.g),far:LDS_tri(D.fence.g)}}catch(e){console.warn('LDS fence',e)}return r})(kmProps);
// LOD: a tree prop mesh (one per type per 800 m tile) draws the near lathe only while the camera is within LDS.near m of its instances' box
function LDS_scan(){const D=HUB.ptypes;LDS.on=[];LDS.n=HUB.props?HUB.props.length:0;if(!D||!HUB.grp)return;HUB.grp.traverse(o=>{if(!o.isInstancedMesh)return;for(const t in LDS.P){const d=D[t];if(d&&d.lds&&(o.geometry===d.g||o.geometry===d.gFar||o.geometry===d.gOld)){o.userData.lds=t;if(!o.boundingBox)o.computeBoundingBox();LDS.on.push(o)}}})}
hubCullStep=(f=>function(){f.apply(this,arguments);if(!LDS.st||LDS.off||!HUB.ptypes||!HUB.props)return;if(!LDS.on.length||LDS.n!==HUB.props.length)LDS_scan();const cp=camera.position,D=HUB.ptypes;
 for(const o of LDS.on){const d=D[o.userData.lds],b=o.boundingBox,dx=Math.max(b.min.x-cp.x,0,cp.x-b.max.x),dz=Math.max(b.min.z-cp.z,0,cp.z-b.max.z),g=Math.hypot(dx,dz)<LDS.near?d.g:d.gFar;if(o.geometry!==g)o.geometry=g}})(hubCullStep);
// test hook (before/after shots of the same spot): ab(1) draws the old trees again
function LDS_ab(off){for(const DL of[HUB.ptypes&&HUB.ptypes.lamp,HUB.ptypes&&HUB.ptypes.fence])if(DL&&DL.lds)HUB.grp.traverse(o=>{if(o.isInstancedMesh&&(o.geometry===DL.g||o.geometry===DL.gOld)){o.geometry=off?DL.gOld:DL.g;o.material=off?DL.mOld:DL.mat}});LDS.off=off;const D=HUB.ptypes;LDS_scan();for(const o of LDS.on){const d=D[o.userData.lds];o.geometry=off?d.gOld:d.g}}
window.__ld.lds=LDS;window.__ld.ldsAB=LDS_ab;window.__ld.ldsLathe=LDS_lathe;
