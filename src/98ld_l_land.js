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
function LDS_lamp(h,cols){const L=LDS.L,k=(h||L.h)/198,g=new THREE.LatheGeometry(L.p.map(([r,y])=>new THREE.Vector2(r*k,y*k)),6).toNonIndexed(),p=g.attributes.position,keep=[];
 for(let i=0;i<p.count;i+=3){const a=new THREE.Vector3().fromBufferAttribute(p,i),b=new THREE.Vector3().fromBufferAttribute(p,i+1),d=new THREE.Vector3().fromBufferAttribute(p,i+2);if(b.clone().sub(a).cross(d.clone().sub(a)).lengthSq()>1e-10)keep.push(a,b,d)}
 const q=new THREE.BufferGeometry().setFromPoints(keep),c=[],C=new THREE.Color();for(let i=0;i<keep.length;i+=3){const ym=(keep[i].y+keep[i+1].y+keep[i+2].y)/3/k;C.set((cols||L.c).find(e=>ym<e[0])[1]);for(let j=0;j<3;j++)c.push(C.r,C.g,C.b)}
 q.setAttribute('color',new THREE.Float32BufferAttribute(c,3));q.computeVertexNormals();q.computeBoundingBox();q.computeBoundingSphere();return q}
// park fence (swap 3): LEGO 3633 Fence Lattice 1x4x1 (LDraw part, CCAL 2.0) instead of the Kenney CC0 'fence-1x3' (204 tris): top rail 80x8x20 LDU,
// end posts, bottom rail and the diamond lattice (4+4 diagonal bars), boxes in LDU from the part file; stretched to the old fence's length.
function LDS_fence(old){old.computeBoundingBox();const ob=old.boundingBox,ox=ob.max.x-ob.min.x,oz=ob.max.z-ob.min.z,len=Math.max(ox,oz),s=len/80,G=[],add=(w,h,d,x,y,z,rz)=>{const b=new THREE.BoxGeometry(w,h,d);if(rz)b.rotateZ(rz);b.translate(x,y,z);G.push(colorize(b.toNonIndexed(),new THREE.Color('#ffffff')))};
 add(80,8,20,0,20,0);add(4,16,6,-38,8,0);add(4,16,6,38,8,0);add(80,4,6,0,2,0);const L=Math.hypot(18,12)+2,a=Math.atan2(12,18);for(let i=0;i<4;i++){const x=-27+i*18;add(L,2,4,x,10,0,a);add(L,2,4,x,10,0,-a)}
 const g=mergeG(G);
 g.scale(s,Math.min(s,(ob.max.y-ob.min.y)/24),s);if(oz>ox)g.rotateY(Math.PI/2);g.translate((ob.min.x+ob.max.x)/2,ob.min.y,(ob.min.z+ob.max.z)/2);g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();return g}
ART_trees=(f=>function(D){f.apply(this,arguments);if(CID==='ath'&&D.lamp&&!D.lamp.lds)try{const old=LDS_tri(D.lamp.g);D.lamp.gOld=D.lamp.g;D.lamp.mOld=D.lamp.mat;D.lamp.g=LDS_lamp(7.43,LDS.LA);D.lamp.mat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.35,metalness:.1});D.lamp.lds='lamp';LDS.st=LDS.st||{};LDS.st.lamp={src:'2039',old,near:LDS_tri(D.lamp.g),far:LDS_tri(D.lamp.g)}}catch(e){console.warn('LDS lamp ath',e)}if(CID!=='fra')return;const st={};try{if(D.lamp&&!D.lamp.lds){const old=LDS_tri(D.lamp.g);D.lamp.gOld=D.lamp.g;D.lamp.mOld=D.lamp.mat;D.lamp.g=LDS_lamp();D.lamp.mat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.35,metalness:.1});D.lamp.lds='lamp';st.lamp={src:'2039',old,near:LDS_tri(D.lamp.g),far:LDS_tri(D.lamp.g)}}}catch(e){console.warn('LDS lamp',e)}try{for(const t in LDS.P){const d=D[t];if(!d)continue;const P=LDS.P[t],old=LDS_tri(d.g);
  d.gOld=d.g;d.g=LDS_lathe(P.n,8);d.gFar=LDS_lathe(P.f,6);d.lds=t;st[t]={src:P.src,old,near:LDS_tri(d.g),far:LDS_tri(d.gFar)}}}catch(e){console.warn('LDS trees',e)}LDS.st=st;LDS.on=[]})(ART_trees);
// crate (swap 4): LEGO 61780 Container 2x2x2 Crate (LDraw part, CCAL 2.0): open box of slats, 40x48x40 LDU: floor + 2 rings of 4 slats with the gaps of
// the part, instead of the Kenney CC0 'box' (124 tris); fitted to the old crate's footprint, reddish brown like the part's usual colour
function LDS_crate(old){old.computeBoundingBox();const ob=old.boundingBox,w=Math.min(ob.max.x-ob.min.x,ob.max.z-ob.min.z),s=w/40,G=[],C=new THREE.Color('#8a4a2a'),add=(a,h,d,x,y,z)=>{const b=new THREE.BoxGeometry(a,h,d).toNonIndexed();b.translate(x,y,z);G.push(colorize(b,C))};
 add(40,8,40,0,4,0);for(const y of[16,36]){add(40,12,4,0,y,18);add(40,12,4,0,y,-18);add(4,12,32,18,y,0);add(4,12,32,-18,y,0)}
 const g=mergeG(G);g.scale(s,s,s);g.translate((ob.min.x+ob.max.x)/2,ob.min.y,(ob.min.z+ob.max.z)/2);g.computeBoundingBox();g.computeBoundingSphere();return g}
// fence: D.fence is made after ART_trees, at the end of kmProps (60_city_build.js)
kmProps=(f=>function(D){const r=f.apply(this,arguments);if(CID==='fra'&&D.fence&&!D.fence.lds)try{const old=LDS_tri(D.fence.g);D.fence.gOld=D.fence.g;D.fence.mOld=D.fence.mat;D.fence.g=LDS_fence(D.fence.g);
 D.fence.mat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.35,metalness:0});D.fence.lds='fence';if(LDS.st)LDS.st.fence={src:'3633',old,near:LDS_tri(D.fence.g),far:LDS_tri(D.fence.g)}}catch(e){console.warn('LDS fence',e)}if(CID==='fra'&&D.crate&&!D.crate.lds)try{const old=LDS_tri(D.crate.g);D.crate.gOld=D.crate.g;D.crate.mOld=D.crate.mat;D.crate.g=LDS_crate(D.crate.g);D.crate.mat=D.fence.mat;D.crate.lds='crate';if(LDS.st)LDS.st.crate={src:'61780',old,near:LDS_tri(D.crate.g),far:LDS_tri(D.crate.g)}}catch(e){console.warn('LDS crate',e)}
 return r})(kmProps);
// planter (swap 5): LEGO flower bed instead of the Kenney CC0 'planter' (204 tris): a 2x4 bed brick (80x24x40 LDU, reddish brown) + 3020 Plate 2x4 (green),
// on its 8 studs 4 flowers (3741-style thin stem + 33291 Plate 1x1 Round with Tabs, red/yellow) and 4 leaf clumps (6255 Plant 1x1 with 3 Leaves),
// low-poly in LDU (LDraw parts, CCAL 2.0); fitted to the old planter's footprint, long side kept
function LDS_fit(G,old,L){const g=mergeG(G);old.computeBoundingBox();const ob=old.boundingBox,ox=ob.max.x-ob.min.x,oz=ob.max.z-ob.min.z,s=Math.max(ox,oz)/L;g.scale(s,s,s);if(oz>ox)g.rotateY(Math.PI/2);
 g.translate((ob.min.x+ob.max.x)/2,ob.min.y,(ob.min.z+ob.max.z)/2);g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();return g}
function LDS_planter(old){const G=[],B=(w,h,d,x,y,z,c)=>G.push(cbox(w,h,d,x,y,z,c)),Y=(r1,r2,h,x,y,z,c,n)=>G.push(ccyl(r1,r2,h,x,y,z,c,n));
 B(80,24,40,0,12,0,'#7a4a28');B(80,8,40,0,28,0,'#3f8a2e');
 for(let i=0;i<4;i++)for(let j=0;j<2;j++){const x=-30+i*20,z=j?10:-10;if((i+j)%2){const t=new THREE.CylinderGeometry(3,3,22,3,1,true);t.translate(x,43,z);G.push(colorize(t,new THREE.Color('#4f9a36')));Y(10,10,6,x,57,z,i<2?'#d8302a':'#ffd12c',5)}else{const c=new THREE.ConeGeometry(15,20,5,1,true);c.translate(x,42,z);G.push(colorize(c,new THREE.Color('#2f7a2a')))}}
 return LDS_fit(G,old,80)}
// dumpster (swap 6): LEGO brick-built dumpster (as in LEGO City garbage sets): dark green 2x4 body two bricks high (80x48x40 LDU), black 2x4 tile lid
// tilted open a little, 2 black handle bars (bar holders) and 4 black 1x1 round wheels; replaces the Kenney CC0 'dumpster' (234 tris)
function LDS_dumpster(old){const G=[],B=(w,h,d,x,y,z,c,rx)=>{const g=new THREE.BoxGeometry(w,h,d);if(rx)g.rotateX(rx);g.translate(x,y,z);G.push(colorize(g,new THREE.Color(c)))};
 B(80,48,40,0,32,0,'#2a7a4a');B(84,4,44,0,59,-2,'#2f3640',-.12);B(84,6,4,0,44,22,'#2a7a4a');B(4,4,8,-40,40,0,'#2f3640');B(4,4,8,40,40,0,'#2f3640');
 for(const x of[-30,30])for(const z of[-14,14])B(8,8,8,x,4,z,'#2f3640');return LDS_fit(G,old,80)}
// Athens street lamp (swap 8): the same LEGO 2039 lamp post in Athens' dark grey; R1 (kmProps) scales it to 5.5 m like the old Kenney lamp
LDS.LA=[[168,'#4a4a44'],[191,'#ffe9a0'],[999,'#2e302c']];
kmProps=(f=>function(D){const r=f.apply(this,arguments);const d=D.lamp;if(CID==='ath'&&d&&d.lds==='lamp'&&!d.athFix){d.athFix=1;d.mat.color.set('#ffffff');const k=5.5/7.43;d.gOld=d.gOld.clone().scale(k,k,k);d.mOld=d.mOld.clone();d.mOld.color=new THREE.Color('#5a5a52')}return r})(kmProps);
LDS.SW={planter:[LDS_planter,'LEGO flower bed 3020+33291+6255'],dumpster:[LDS_dumpster,'LEGO brick dumpster']};
kmProps=(f=>function(D){const r=f.apply(this,arguments);if(CID!=='fra')return r;for(const t in LDS.SW){const d=D[t];if(!d||d.lds)continue;try{const old=LDS_tri(d.g);d.gOld=d.g;d.mOld=d.mat;d.g=LDS.SW[t][0](d.g);
  d.mat=LDS.mat||(LDS.mat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.35,metalness:0}));d.lds=t;if(LDS.st)LDS.st[t]={src:LDS.SW[t][1],old,near:LDS_tri(d.g),far:LDS_tri(d.g)}}catch(e){console.warn('LDS '+t,e)}}return r})(kmProps);
// construction props, stop sign, rock (land-3, swaps 9-13): LEGO parts (LDraw, CCAL 2.0) in LDU, low-poly; lathes use the part profile (tools/ld/lProfile.py)
// generic lathe in LDU, colour by height stops [[yMax,'#hex'],..]; drops the degenerate tip triangles
function LDS_lth(P,seg,cols){const g=new THREE.LatheGeometry(P.map(([r,y])=>new THREE.Vector2(r,y)),seg).toNonIndexed(),p=g.attributes.position,V=[],c=[],C=new THREE.Color();
 for(let i=0;i<p.count;i+=3){const a=new THREE.Vector3().fromBufferAttribute(p,i),b=new THREE.Vector3().fromBufferAttribute(p,i+1),d=new THREE.Vector3().fromBufferAttribute(p,i+2);if(b.clone().sub(a).cross(d.clone().sub(a)).lengthSq()<1e-8)continue;V.push(a,b,d);C.set(cols.find(e=>(a.y+b.y+d.y)/3<e[0])[1]);for(let j=0;j<3;j++)c.push(C.r,C.g,C.b)}
 const q=new THREE.BufferGeometry().setFromPoints(V);q.setAttribute('color',new THREE.Float32BufferAttribute(c,3));q.computeVertexNormals();return q}
// fit by height (tall thin props): old height, old footprint centre, standing on the old base
function LDS_fitH(G,old,H){const g=mergeG(G);old.computeBoundingBox();const ob=old.boundingBox,s=(ob.max.y-ob.min.y)/H;g.scale(s,s,s);g.translate((ob.min.x+ob.max.x)/2,ob.min.y,(ob.min.z+ob.max.z)/2);g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();return g}
// cone (swap 9): LEGO 4589 Cone 1x1 in orange (the LEGO City traffic cone), lathe of its profile r10 base flange -> r6 top, 8 sides; was Kenney CC0 'construction-cone' (66)
function LDS_cone(old){return LDS_fitH([LDS_lth([[10,0],[10,5],[6,24],[0,24]],8,[[99,'#ff7a1c']])],old,24)}
// barrier (swap 10): LEGO 4083 Bar 1x4x2 (80 LDU long, 2 bricks high: top bar on two legs) with the red/white roadworks stripes: 3 bar stripes + 2 legs; was Kenney 'construction-barrier' (60)
function LDS_barrier(old){const G=[],B=(w,h,d,x,y,z,c)=>G.push(cbox(w,h,d,x,y,z,c));B(26,14,8,-27,40,0,'#d8302a');B(28,14,8,0,40,0,'#ffffff');B(26,14,8,27,40,0,'#d8302a');B(8,33,8,-30,16.5,0,'#ffffff');B(8,33,8,30,16.5,0,'#ffffff');return LDS_fit(G,old,80)}
// warning light (swap 11): 4032 Plate 2x2 Round (black) + 3062b Brick 1x1 Round stack as post + trans-yellow 3062b lamp on top, one 8-sided lathe; was Kenney 'construction-light' (144)
function LDS_clight(old){return LDS_fitH([LDS_lth([[20,0],[20,8],[8,8],[8,48],[10,48],[10,72],[6,74],[0,74]],8,[[9,'#2f3640'],[48,'#ffd12c'],[99,'#fff3a0']])],old,74)}
// stop sign (swap 12): 4032 Plate 2x2 Round base + 3957a Antenna 4H pole (r4, 92 LDU) + 30260p01 Roadsign Clip-on 2x2 Octagonal (red STOP: white bar both sides); was Kenney 'road-sign-stop' (104)
function LDS_sign(old){const G=[LDS_lth([[20,0],[20,8],[4,8],[4,98],[0,98]],6,[[9,'#2f3640'],[99,'#a0a5a9']])],o=new THREE.CylinderGeometry(21,21,4,8);o.rotateX(Math.PI/2);o.rotateZ(Math.PI/8);o.translate(0,104,0);G.push(colorize(o,new THREE.Color('#d8302a')));
 for(const z of[2.2,-2.2]){const w=new THREE.PlaneGeometry(28,7);if(z<0)w.rotateY(Math.PI);w.translate(0,104,z);G.push(colorize(w,new THREE.Color('#ffffff')))}return LDS_fitH(G,old,125)}
// rock (swap 13): LEGO Rock 4x4x3 boulder (42284 top on 42291 bottom, as in 53934p01c01): convex hull of the two LDraw parts, simplified to 56 faces (pyfqmr), flat shaded,
// light bluish grey with the dark bluish grey top of the dual-mould rock; was Kenney 'rock_largeA' (80)
LDS.ROCK={V:[-41,36,-20,-41,36,20,-36,23,-3,-35,58,21,-21,24,-37,-24,70,-4,-19,0,-17,-18,0,18,-19,25,38,-20,46,-40,-14,72,-20,-16,72,16,-27,63,-25,-20,49,39,-4,16,-37,18,0,18,18,23,38,19,0,-17,16,72,-17,20,72,15,19,30,-40,20,55,-39,20,47,40,19,10,-32,25,61,-30,30,57,24,32,15,15,42,38,-20,33,65,-2,41,42,20],
 F:[4,6,0,21,27,20,29,26,27,17,27,26,16,22,8,16,29,22,16,26,29,24,27,21,9,21,20,9,4,0,9,0,12,9,10,21,9,12,10,2,0,6,2,1,0,11,22,19,25,19,22,25,22,29,23,17,6,23,20,27,23,27,17,15,17,26,15,26,16,28,27,24,28,29,27,28,19,25,28,25,29,18,21,10,18,24,21,18,19,28,18,28,24,5,11,10,5,10,12,13,1,8,13,8,22,13,22,11,14,20,23,14,9,20,14,4,9,14,6,4,14,23,6,7,16,8,7,15,16,7,8,1,7,2,6,7,1,2,3,11,5,3,1,13,3,13,11,3,0,1,3,12,0,3,5,12,18,11,19,18,10,11,7,17,15,7,6,17]};
function LDS_rock(old,cl,ch){const{V,F}=LDS.ROCK,P=[],c=[],lo=new THREE.Color(cl||'#a0a5a9'),hi=new THREE.Color(ch||'#6c6e68');for(let i=0;i<F.length;i+=3){let ym=0;for(let j=0;j<3;j++){const k=F[i+j]*3;P.push(V[k],V[k+1],V[k+2]);ym+=V[k+1]/3}const C=ym>54?hi:lo;for(let j=0;j<3;j++)c.push(C.r,C.g,C.b)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(c,3));g.computeVertexNormals();return LDS_fit([g],old,82)}
Object.assign(LDS.SW,{cone:[LDS_cone,'4589 cone'],barrier:[LDS_barrier,'4083 barrier'],clight:[LDS_clight,'4032+3062b warning light'],sign:[LDS_sign,'30260p01 stop sign + 3957a'],rock:[LDS_rock,'42284+42291 rock']});
// Athens CE_* procedural props (land-3, swaps 14-17), same LEGO parts as Frankfurt in Athens colours; set right after CE_defs (buildHubProps)
// CE_pine -> 3471 Plant Tree Pyramidal 4x4x6⅔ (264 tris of icospheres), CE_olive -> 3470 Plant Tree Oval in olive sage (184), CE_rock -> the 42284/42291 boulder
// in tan (160), CE_cypress -> 3778 Plant Tree Columnar 4x4x11.5: its 12 stacked tiers as 4 (lProfile 3778.dat, 6 sides)
LDS.CE={CE_pine:[()=>LDS_lth(LDS.P.tree3.n,8,[[48,'#6b4a2a'],[999,'#3e6b34']]),'3471',7.2],CE_olive:[()=>LDS_lth(LDS.P.tree.n,7,[[48,'#6a5848'],[999,'#8a9a68']]),'3470',4.1],
 CE_cypress:[()=>LDS_lth([[6,0],[6,36],[44,48],[16,70],[47,96],[18,130],[44,150],[14,190],[34,200],[0,280]],6,[[38,'#5a4030'],[999,'#2d5a32']]),'3778',8.6]};
CE_defs=(f=>function(D){const r=f.apply(this,arguments);if(CID!=='ath')return r;LDS.st=LDS.st||{};for(const t in LDS.CE){const d=D[t];if(!d||d.lds)continue;try{const[fn,src,h]=LDS.CE[t],old=LDS_tri(d.g),g=fn();g.computeBoundingBox();const k=h/g.boundingBox.max.y;g.scale(k,k,k);g.computeBoundingBox();g.computeBoundingSphere();d.gOld=d.g;d.g=g;d.lds=t;LDS.st[t]={src,old,near:LDS_tri(g),far:LDS_tri(g)}}catch(e){console.warn('LDS '+t,e)}}
 const d=D.CE_rock;if(d&&!d.lds)try{const old=LDS_tri(d.g),g=LDS_rock(d.g,'#c8b48a','#a89c84');d.gOld=d.g;d.g=g;d.lds='CE_rock';LDS.st.CE_rock={src:'42284+42291 rock',old,near:LDS_tri(g),far:LDS_tri(g)}}catch(e){console.warn('LDS CE_rock',e)}return r})(CE_defs);
// Athens palm (swap 7, Syntagma race palms, TRK.tree 'palm'): LEGO palm as built in set 6376 Breezeway Cafe (ld/land/l_palm.ldr, OMR, CCAL 2.0):
// 2563 base (r 20 LDU), stacked 2536 trunk segments (r 11 -> 14 each), 2566 top and 4 x 2518 Palm Leaf Large (176 LDU long, 90 wide, drooping 43);
// trunk = 5-sided lathe of that profile, each leaf = 2-sided quad + tip triangle; scaled to the old 9.5 m trunk. Replaces athTreeBy0('palm') (108 tris).
LDS.PALM={p:[[20,0],[20,38],[11,40],[14,98],[11,100],[14,160],[11,162],[14,198],[0,216]],k:9.5/198};
function LDS_palm(){const{p,k}=LDS.PALM,g=new THREE.LatheGeometry(p.map(([r,y])=>new THREE.Vector2(r*k,y*k)),5).toNonIndexed(),q=g.attributes.position,V=[],C=[],tb=new THREE.Color('#6b4a2a'),lf=new THREE.Color('#2f8a3a');
 for(let i=0;i<q.count;i+=3){const a=new THREE.Vector3().fromBufferAttribute(q,i),b=new THREE.Vector3().fromBufferAttribute(q,i+1),d=new THREE.Vector3().fromBufferAttribute(q,i+2);if(b.clone().sub(a).cross(d.clone().sub(a)).lengthSq()<1e-12)continue;V.push(a,b,d);for(let j=0;j<3;j++)C.push(tb.r,tb.g,tb.b)}
 const y0=204*k,tri=(a,b,d)=>{for(const T of[[a,b,d],[a,d,b]]){V.push(...T);for(let j=0;j<3;j++)C.push(lf.r,lf.g,lf.b)}};
 for(let i=0;i<4;i++){const ang=i*Math.PI/2+Math.PI/4,cx=Math.cos(ang),cz=Math.sin(ang),P=(r,w,y)=>new THREE.Vector3((cx*r-cz*w)*k,y0+y*k,(cz*r+cx*w)*k);
  const a=P(4,-10,0),b=P(4,10,0),c=P(80,45,6),d=P(80,-45,6),t=P(176,0,-43);tri(a,b,c);tri(a,c,d);tri(d,c,t)}
 const G=new THREE.BufferGeometry().setFromPoints(V);G.setAttribute('color',new THREE.Float32BufferAttribute(C,3));G.computeVertexNormals();G.computeBoundingBox();G.computeBoundingSphere();G.userData.ldsPalm=1;return G}
ART_athTreeBy=(f=>function(k){if(k==='palm'&&!LDS.palmOff)try{const g=LDS_palm();LDS.palm=g;LDS.st=LDS.st||{};LDS.st.palm={src:'6376 palm',old:108,near:LDS_tri(g),far:LDS_tri(g)};return g}catch(e){console.warn('LDS palm',e)}return f.apply(this,arguments)})(ART_athTreeBy);
// palms off the painted streets (reviewer, v90g): athGroundTex paints 2 asphalt streets per 150 m tile (px 96 / 352 of 512, ±30 px with the
// sidewalk) in x and z; a LEGO palm that lands on one moves to the nearer band edge + 1 m (still off the track and buildings), else it is dropped
LDS.onSt=v=>{const p=((v/150)%1+1)%1*512;return[96,352].find(c=>Math.abs(p-c)<31)};
TInst.prototype.add=(f=>function(x,y,z,...a){if(!(this.geo&&this.geo.userData&&this.geo.userData.ldsPalm))return f.call(this,x,y,z,...a);LDS.pm=LDS.pm||{moved:0,drop:0,ok:0};
 const fix=v=>{const c=LDS.onSt(v);if(c==null)return[v];const p=((v/150)%1+1)%1*512,base=v-p*150/512;return[base+(c-32)*150/512-1,base+(c+32)*150/512+1]};
 const ok=(px,pz)=>LDS.onSt(px)==null&&LDS.onSt(pz)==null&&nearestTrackDist(px,pz,HALF+8)>=HALF+3&&!CITY.some(b=>Math.abs(b.x-px)<b.hw+3&&Math.abs(b.z-pz)<b.hd+3);
 if(ok(x,z)){LDS.pm.ok++;return f.call(this,x,y,z,...a)}
 const C=[];for(const px of fix(x))for(const pz of fix(z))C.push([px,pz]);C.sort((A,B)=>Math.hypot(A[0]-x,A[1]-z)-Math.hypot(B[0]-x,B[1]-z));
 for(const[px,pz]of C)if(ok(px,pz)){LDS.pm.moved++;return f.call(this,px,athH(px,pz)-.2,pz,...a)}LDS.pm.drop++;return this})(TInst.prototype.add);
// LOD: a tree prop mesh (one per type per 800 m tile) draws the near lathe only while the camera is within LDS.near m of its instances' box
function LDS_scan(){const D=HUB.ptypes;LDS.on=[];LDS.n=HUB.props?HUB.props.length:0;if(!D||!HUB.grp)return;HUB.grp.traverse(o=>{if(!o.isInstancedMesh)return;for(const t in LDS.P){const d=D[t];if(d&&d.lds&&(o.geometry===d.g||o.geometry===d.gFar||o.geometry===d.gOld)){o.userData.lds=t;if(!o.boundingBox)o.computeBoundingBox();LDS.on.push(o)}}})}
hubCullStep=(f=>function(){f.apply(this,arguments);if(!LDS.st||LDS.off||!HUB.ptypes||!HUB.props)return;if(!LDS.on.length||LDS.n!==HUB.props.length)LDS_scan();const cp=camera.position,D=HUB.ptypes;
 for(const o of LDS.on){const d=D[o.userData.lds],b=o.boundingBox,dx=Math.max(b.min.x-cp.x,0,cp.x-b.max.x),dz=Math.max(b.min.z-cp.z,0,cp.z-b.max.z),g=Math.hypot(dx,dz)<LDS.near?d.g:d.gFar;if(o.geometry!==g)o.geometry=g}})(hubCullStep);
// test hook (before/after shots of the same spot): ab(1) draws the old trees again
function LDS_ab(off){for(const DL of['lamp','fence','crate','planter','dumpster','cone','barrier','clight','sign','rock'].map(k=>HUB.ptypes&&HUB.ptypes[k]))if(DL&&DL.lds)HUB.grp.traverse(o=>{if(o.isInstancedMesh&&(o.geometry===DL.g||o.geometry===DL.gOld)){o.geometry=off?DL.gOld:DL.g;o.material=off?DL.mOld:DL.mat}});LDS.off=off;const D=HUB.ptypes;LDS_scan();for(const o of LDS.on){const d=D[o.userData.lds];o.geometry=off?d.gOld:d.g}}
window.__ld.lds=LDS;LDS.race=t=>setupRace({type:'attract',laps:99,traffic:0,items:false,aggr:0,track:t,mood:(TRACK_DEFS.find(d=>d.id===t)||{}).mood||'brick'});LDS.cam=()=>camera;LDS.palm0=()=>athTreeBy0('palm');LDS.inB=(x,z)=>CITY.some(b=>Math.abs(b.x-x)<b.hw+2&&Math.abs(b.z-z)<b.hd+2);LDS.probe=(x,z)=>({d:nearestTrackDist(x,z,999),HALF,W,ath:athH(x,z)});window.__ld.ldsAB=LDS_ab;window.__ld.ldsLathe=LDS_lathe;
