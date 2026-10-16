// ---- AS world assets (asset-1, 2026-10-14). Alex: "Assets should look more complicated, with more tiles ... make foliage and trees more realistic,
// based on LEGO builds." Trees and bushes are now BUILT from real LEGO elements like official City/Creator sets: every part mesh comes from the
// official LDraw library (src/98as0_parts.js, tools/as/mkparts.py: 2417 Plant Leaves 6x5, 2423 Plant Leaves 4x3, 3941 Brick 2x2 Round,
// 3062b Brick 1x1 Round, 6141 Plate 1x1 Round, 24866 Plate 1x1 with 5 Petals, 32607 Plate 1x1 Round with 3 Leaves, 2518 Plant Tree Palm Leaf
// Large, 2536a Palm Trunk, 2563a Palm Base, 4589 Cone 1x1, 6148 Palm Leaf Small, 6255 Plant 1x1 Round with 3 Large Leaves ...), placed like an
// LDraw model (AS_R recipes, LDU, y up, part origin = its top face) and merged into ONE geometry per variant and LOD:
//  full  (≤ ASSET.near 40 m): decimated part bodies + real stud cylinders on every uncovered top stud;
//  mid   (≤ ASSET.mid 150 m): harder-decimated bodies, no studs;
//  far   (beyond): the city's per-tile prop meshes draw a 6-sided lathe blob (one per base type), scaled + tinted per instance to its variant.
// Placement is unchanged (art-3 fill / life-1 / 60_city_build6 add('tree'...) on groundY): each tree/bush prop gets a variant (p.av) picked so the
// same variant is ≤ 30 % of the trees within 30 m; near/mid = 2 global InstancedMeshes per variant, refilled from HUB.pgrid when the camera moves,
// the far tile instance of a near/mid prop is zero-scaled meanwhile (smash/revive keep working: they write the far instance, we re-hide it).
// Loaded only when the flag is on: src/98as_assets.js (page stub) loads models/as.js (tools/as/pack.sh: this file as a string + part data) and
// evals it in the page's module scope, so the page grows ~0.5 KB. Applied after the city's props are built (AS_apply), also when it arrives late.
const AS_PD=window.__AS_PD,ASSET={on:true,near:40,mid:150,fr:0,cx:1e9,cz:1e9,st:null,V:{},P:{},nm:{},mm:{},hid:new Set(),dirty:new Set()};
const AS_COL={DBG:'#6C6E68',LBG:'#A0A5A9',BL:'#0055BF',G:'#00852B',BG:'#58AB41',DG:'#00451A',LI:'#A5CA18',OG:'#77774E',SG:'#708E7C',RB:'#5F3109',DB:'#352100',DT:'#897D62',T:'#D7BA8C',
 W:'#F4F4F4',K:'#1B2A34',O:'#D67923',DO:'#91501C',R:'#B40000',DR:'#720012',Y:'#FAC80A',BLO:'#FCAC00',PK:'#FF9ECD',LV:'#A06EB9',MN:'#AA7D55'};
// part height (LDU) when stacked / set on a stud
const AS_H={3003:24,3622:24,3008:24,3010:24,3009:24,4070:24,3941:24,'3062b':24,3005:24,3004:24,6141:8,24866:8,32607:8,'4032a':8,3024:8,4589:24,'2536a':32,'2563a':32,2423:8,2417:8};
const AS_pg={};// decoded part geometry per lod: {p:Float32Array LDU, i:Uint16Array, s:[[x,y,z]]}
function AS_part(id,lod){const k=id+lod;if(AS_pg[k])return AS_pg[k];const D=AS_PD[id];if(!D)throw new Error('AS part '+id);const b=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0)).buffer,[v,i]=D[lod==='n'?'n':'m'];
 const q=new Int16Array(b(v)),p=new Float32Array(q.length);for(let j=0;j<q.length;j++)p[j]=q[j]/4;const s=[];for(let j=0;j<D.s.length;j+=3)s.push([D.s[j],D.s[j+1],D.s[j+2]]);return AS_pg[k]={p,i:new Uint16Array(b(i)),s}}
// recipe builder: B.p(part,col,x,y,z,ry,rx,rz) (degrees; R = Ry·Rx·Rz), B.stack, B.ring (n parts around the axis, local +z (+x for palm leaves) outward),
// B.dress(from,part,col,n) sets parts on the free top studs of the parts placed since index `from` (covers those studs)
function AS_B(seed){const L=[];let s=seed||1;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;
 const B={L,rnd,p(id,c,x,y,z,ry=0,rx=0,rz=0){L.push({id,c,x,y,z,ry,rx,rz});return L.length-1},
  stack(id,c,n,x,z,y0,dx=0,dz=0){const h=AS_H[id]||24;let y=y0;const cs=Array.isArray(c)?c:[c];for(let i=0;i<n;i++){y+=h;B.p(id,cs[i%cs.length],x+dx*i,y,z+dz*i,i*37%360)}return y},
  ring(id,c,n,r,y,ry0=0,rx=0,ax='z',jit=0){const cs=Array.isArray(c)?c:[c];for(let i=0;i<n;i++){const a=ry0+i*360/n+(rnd()-.5)*jit,ar=a*Math.PI/180,yy=y+(rnd()-.5)*jit*.15;
   if(ax==='z')B.p(id,cs[i%cs.length],Math.sin(ar)*r,yy,Math.cos(ar)*r,a,rx);else B.p(id,cs[i%cs.length],Math.cos(ar)*r,yy,-Math.sin(ar)*r,a,0,-rx)}},
  dress(from,id,c,n){const S=[];for(let j=from;j<L.length;j++){const q=L[j],P=AS_part(q.id,'n'),M=AS_mat(q);P.s.forEach((st,k)=>{const v=new THREE.Vector3(...st).applyMatrix4(M);S.push([v,j,k])})}
   const cs=Array.isArray(c)?c:[c];for(let i=0;i<n&&S.length;i++){const[v,j,k]=S.splice(Math.floor(rnd()*S.length),1)[0];(L[j].cov=L[j].cov||new Set()).add(k);B.p(id,cs[i%cs.length],v.x,v.y+(AS_H[id]||8),v.z,rnd()*360)}}};return B}
// a stud is hidden when another part's box covers (on props, plant parts only cover the stud they clip onto) the 3..14 LDU just above it (a leaf or plate sits on / right over it)
const AS_PLANT=new Set(['2417','2423','6255','32607','24866','3742','2518','6148']);
function AS_hid(L,q0,o,pr){for(const q of L){if(q===q0)continue;if(pr&&AS_PLANT.has(String(q.id))&&!(Math.hypot(q.x-o.x,q.z-o.z)<12&&q.y-o.y>0&&q.y-o.y<16))continue;const b=AS_PD[q.id].b,Mi=(q.Mi||(q.Mi=AS_mat(q).invert()));for(const dy of[3,8,14]){const v=new THREE.Vector3(o.x,o.y+dy,o.z).applyMatrix4(Mi);
  if(v.x>=b[0]-1&&v.x<=b[3]+1&&v.y>=-b[4]-1&&v.y<=-b[1]+1&&v.z>=-b[5]-1&&v.z<=-b[2]+1)return true}}return false}
function AS_mat(q){const e=new THREE.Euler(q.rx*Math.PI/180,q.ry*Math.PI/180,q.rz*Math.PI/180,'YXZ');return new THREE.Matrix4().compose(new THREE.Vector3(q.x,q.y,q.z),new THREE.Quaternion().setFromEuler(e),new THREE.Vector3(1,1,1))}
// tree / bush recipes. H = target height (m); far = far-blob class; leaf = crown colour (far tint, debris)
const AS_R={
 oak:{H:9,far:'round',leaf:'G',f:B=>{B.p(3941,'RB',0,24,0,0);B.stack('3062b','RB',3,0,0,24);B.p('3062b','RB',18,84,0,0);B.p('3062b','RB',-16,90,6,0);B.stack(3941,'G',3,0,0,96);
  B.ring(2417,['G','BG'],5,18,110,0,14,'z',14);B.ring(2417,['BG','G'],5,16,128,36,6,'z',14);B.ring(2417,'G',4,10,146,10,-2,'z',14);B.ring(2423,['BG','G'],4,6,162,45,0,'z',20);B.p(2423,'BG',0,172,0,0);B.p(2423,'G',0,174,0,180)}},
 linden:{H:10.5,far:'round',leaf:'BG',f:B=>{B.p(3941,'RB',0,24,0,0);B.stack('3062b','RB',4,0,0,24);B.stack(3941,'BG',4,0,0,120);B.ring(2417,'G',6,22,132,0,18,'z',10);B.ring(2417,['G','BG'],6,22,150,30,8,'z',10);
  B.ring(2417,'BG',5,14,168,18,0,'z',10);B.ring(2423,['BG','LI'],4,6,186,0,0,'z',20);B.p(2423,'LI',0,196,0,45)}},
 birch:{H:10,far:'column',leaf:'LI',f:B=>{let y=0;for(const[id,c]of[['3062b','W'],['3062b','W'],[6141,'K'],['3062b','W'],['3062b','W'],[6141,'K'],['3062b','W'],['3062b','W'],[6141,'K'],['3062b','W'],['3062b','W']]){y+=AS_H[id];B.p(id,c,0,y,0,0)}
  B.p(6141,'K',10,150,0,0);B.stack('3062b','BG',3,0,0,y);B.ring(2423,['LI','BG'],5,8,150,0,25,'z',16);B.ring(2423,['BG','LI'],5,6,172,36,15,'z',16);B.ring(2423,'LI',4,4,194,10,8,'z',20);B.ring(2423,'BG',3,2,214,50,0,'z',20);B.p(2423,'LI',0,226,0,90)}},
 fir:{H:11,far:'cone',leaf:'DG',f:B=>{B.p(3941,'RB',0,24,0,0);B.stack('3062b','RB',1,0,0,24);B.stack(3941,'DG',4,0,0,48);B.ring(2417,'DG',6,10,64,0,25,'z',8);B.ring(2417,['DG','G'],6,8,88,30,25,'z',8);B.ring(2417,'DG',5,6,112,0,22,'z',8);
  B.ring(2423,['DG','G'],5,4,134,36,22,'z',8);B.ring(2423,'DG',4,3,154,0,20,'z',8);B.stack('3062b','DG',2,0,0,144);B.p(4589,'DG',0,216,0,0)}},
 chestnut:{H:9,far:'round',leaf:'G',f:B=>{B.p(3941,'RB',0,24,0,0);B.stack('3062b','RB',3,0,0,24);B.stack(3941,'G',3,0,0,96);B.ring(2417,'G',5,18,110,0,14,'z',14);B.ring(2417,['G','DG'],5,16,128,36,6,'z',14);const k=B.L.length;B.ring(2417,'G',4,10,146,10,-2,'z',14);
  B.ring(2423,'G',3,6,162,20,0,'z',20);B.p(2423,'G',0,172,0,0);B.dress(k,24866,['W','W','PK'],12)}},
 oakAut:{H:9,far:'round',leaf:'O',f:B=>{B.p(3941,'RB',0,24,0,0);B.stack('3062b','RB',3,0,0,24);B.p('3062b','RB',18,84,0,0);B.stack(3941,'O',3,0,0,96);B.ring(2417,['O','DO'],5,18,110,0,14,'z',14);B.ring(2417,['BLO','O'],5,16,128,36,6,'z',14);
  B.ring(2417,['DO','Y'],4,10,146,10,-2,'z',14);B.ring(2423,['BLO','O'],4,6,162,45,0,'z',20);B.p(2423,'Y',0,172,0,0)}},
 maple:{H:10,far:'round',leaf:'R',f:B=>{B.p(3941,'RB',0,24,0,0);B.stack('3062b','RB',4,0,0,24);B.stack(3941,'DR',4,0,0,120);B.ring(2417,['R','DR'],6,22,132,0,18,'z',10);B.ring(2417,['DR','R'],6,22,150,30,8,'z',10);
  B.ring(2417,'R',5,14,168,18,0,'z',10);B.ring(2423,['O','R'],4,6,186,0,0,'z',20);B.p(2423,'R',0,196,0,45)}},
 stonepine:{H:11,far:'umbrella',leaf:'DG',f:B=>{B.stack('3062b','RB',7,0,0,0,1,0);B.p('3062b','RB',12,156,6,0);B.ring(2417,['DG','G'],6,30,172,0,-4,'z',10);B.ring(2417,'G',5,14,180,30,2,'z',10);B.ring(2423,'DG',3,4,186,0,0,'z',10)}},
 aleppo:{H:9.5,far:'cone',leaf:'OG',f:B=>{B.stack(3941,'MN',2,0,0,0);B.ring(2417,['OG','G'],4,12,64,10,20,'z',30);B.ring(2417,['G','OG'],4,8,92,55,18,'z',30);B.ring(2423,['OG','SG'],4,6,118,0,16,'z',30);
  B.ring(2423,'G',3,4,140,40,12,'z',30);B.stack('3062b','OG',1,0,0,140);B.p(2423,'OG',0,172,0,0)}},
 olive:{H:5,far:'umbrella',leaf:'OG',f:B=>{let y=0;for(const[dx,c]of[[0,'DT'],[3,'DT'],[-2,'DB'],[4,'DT']]){y+=24;B.p('3062b',c,dx,y,0,0)}B.p('3062b','DT',16,92,4,0);B.p('3062b','DT',-14,96,-6,0);
  B.ring(2417,['OG','SG'],5,20,104,0,8,'z',20);B.ring(2423,['SG','OG'],4,12,114,30,4,'z',20);B.ring(2423,'OG',3,6,124,0,0,'z',20)}},
 cypress:{H:10,far:'column',leaf:'DG',f:B=>{B.stack('3062b','RB',1,0,0,0);const top=B.stack(3941,'DG',8,0,0,24);for(let i=0;i<8;i++){const y=48+i*24,r=14-i*1.2;B.ring(32607,['DG','G'],3,r,y,i*40,0,'z',10)}
  B.p(4589,'DG',0,top+24,0,0)}},
 palm:{H:9.5,far:'palm',leaf:'G',f:B=>{B.p('2563a','RB',0,0,0,0);let y=0;for(let i=0;i<6;i++){y+=32;B.p('2536a',i%2?'RB':'DB',(i%3)*1.5,y,0,i*50)}B.ring(2518,['G','BG'],5,4,y+30,0,22,'x',16);B.ring(6148,'BG',3,2,y+36,30,-30,'x',16)}},
 orange:{H:5,far:'round',leaf:'G',f:B=>{B.stack('3062b','RB',4,0,0,0);const k=B.L.length;B.ring(2423,'G',4,6,100,0,30,'z',12);B.ring(2423,['G','DG'],4,4,116,45,10,'z',12);B.ring(2423,'DG',3,2,130,0,0,'z',12);B.dress(k,6141,'O',10)}},
 plane:{H:11,far:'round',leaf:'BG',f:B=>{B.p(3941,'T',0,24,0,0);B.stack('3062b',['DT','T','MN','T'],4,0,0,24);B.p('3062b','DT',20,110,0,0);B.stack(3941,'G',4,0,0,120);B.ring(2417,['BG','G'],6,26,132,0,16,'z',12);B.ring(2417,['G','LI'],6,24,150,30,6,'z',12);B.ring(2417,'BG',5,12,168,18,-4,'z',12);B.ring(2423,'LI',4,6,184,0,0,'z',20)}},
 // almond (Athens, 8th tree, asset-2): grey-brown forked trunk, open crown of 6x5 / 4x3 leaves, dressed with white and pink 5-petal flower plates (spring blossom)
 almond:{H:6,far:'round',leaf:'BG',f:B=>{B.p(3941,'DT',0,24,0,0);B.stack('3062b',['DT','MN'],3,0,0,24);B.p('3062b','DT',14,84,4,0);B.p('3062b','DT',-12,90,-6,0);const k=B.L.length;
  B.ring(2417,['BG','G'],5,16,104,15,10,'z',18);B.ring(2423,['BG','LI'],4,10,120,50,4,'z',18);B.ring(2423,'BG',3,4,134,0,0,'z',20);B.dress(k,24866,['W','PK','W','#FFC8DC'],16)}},
 bush:{H:1.5,far:'bush',leaf:'G',f:B=>{B.p(3941,'G',0,24,0,0);B.ring(2417,['G','BG'],4,4,30,0,-8,'z',20);B.ring(2423,['BG','G'],4,2,40,45,-4,'z',20);B.ring(2423,'G',3,1,48,0,0,'z',20);B.p(2423,'BG',0,52,0,60)}},
 bushFl:{H:1.4,far:'bush',leaf:'BG',f:B=>{B.p(3941,'G',0,24,0,0);const k=B.L.length;B.ring(2417,['BG','G'],4,4,30,20,-8,'z',20);B.ring(2423,'G',4,2,40,65,-4,'z',20);B.p(2423,'BG',0,48,0,0);B.dress(k,24866,['Y','PK','W','LV'],10)}},
 oleander:{H:1.8,far:'bush',leaf:'G',f:B=>{B.p(3941,'G',0,24,0,0);B.p(6255,'G',0,40,0,0);B.p(6255,'BG',6,58,4,60);B.p(6255,'G',-4,74,-4,120);const k=B.L.length;B.ring(2423,'G',4,3,46,30,-6,'z',20);B.p(2423,'BG',0,82,0,0);B.dress(k,24866,['PK','PK','W'],8)}},
 // street props (one variant each; far = the city's existing mesh; size fitted to it on axis fit, x = long side)
 p_bench:{prop:1,fit:'y',far:'keep',leaf:'RB',f:B=>{for(const x of[-50,50])B.stack(3004,'DBG',2,x,0,0);for(const x of[-20,20])B.p(3020,'RB',x,56,0,0);for(const x of[-40,40])B.p(2431,'RB',x,64,10,0);
  for(const x of[-40,40])B.p(3010,'RB',x,88,-10,0)}},
 p_bin:{prop:1,fit:'y',far:'keep',leaf:'DG',f:B=>{B.p(3022,'DBG',0,8,0,0);B.stack(3941,'DG',3,0,0,8);B.p('4032a','DG',0,88,0,0);B.p('3062b','DBG',0,112,0,0);B.p(98138,'Y',0,56,22,0,90);B.p(98138,'Y',0,56,-22,180,90);B.p(6141,'DBG',0,120,0,0)}},
 p_hydrant:{prop:1,fit:'y',far:'keep',leaf:'R',f:B=>{B.p('4032a','DBG',0,8,0,0);B.stack('3062b','R',3,0,0,8);B.p(6141,'R',0,88,0,0);B.p(6141,'Y',12,56,0,90,0,90);B.p(6141,'Y',-12,56,0,-90,0,-90);B.p(6141,'R',0,40,12,0,90)}},
 p_post:{prop:1,fit:'y',far:'keep',leaf:'DBG',f:B=>{B.p('4032a','DBG',0,8,0,0);B.p('3062b','DBG',0,32,0,0);B.p(6141,'Y',0,40,0,0);B.p('3062b','DBG',0,64,0,0);B.p(6141,'Y',0,72,0,0);B.p('3062b','DBG',0,96,0,0);B.p(6141,'DBG',0,104,0,0);B.p(4589,'Y',0,128,0,0)}},
 p_planter:{prop:1,fit:'x',far:'keep',leaf:'G',f:B=>{for(const z of[-30,30])B.p(3009,'T',0,24,z,0);for(const x of[-50,50])B.p(3004,'T',x,24,0,90);for(const x of[-30,30])B.p(3020,'RB',x,16,0,90);
  const k=B.L.length;B.p(6255,'G',-30,24,0,0);B.p(6255,'BG',30,24,0,90);B.p(32607,'G',0,24,10,0);B.p(32607,'G',0,24,-10,180);for(const x of[-50,50])B.p('3070b','T',x,32,0,0);
  [[-10,0,'Y'],[10,-10,'R'],[-40,-10,'PK'],[40,10,'W'],[-20,10,'Y'],[20,10,'PK']].forEach(([x,z,c])=>B.p(24866,c,x,26,z,0))}},
 p_stall:{prop:1,fit:'y',far:'keep',leaf:'R',f:B=>{for(const y of[24,48])B.p(3009,'RB',0,y,20,0);B.p(6636,'W',0,56,20,0);for(const x of[-50,50])for(const z of[-20,20])B.stack('3062b','W',5,x,z,0);
  for(const z of[-10,10])B.p(3020,'W',0,128,z,0);[-40,-20,0,20,40].forEach((x,i)=>B.p('3068b',i%2?'W':'R',x,136,0,0));[-30,-10,10,30].forEach((x,i)=>B.p(6141,['O','R','Y','LI'][i],x,64,20,0))}},
 p_parasol:{prop:1,fit:'y',far:'keep',leaf:'R',f:B=>{B.p(3941,'DBG',0,24,0,0);B.p(30374,'W',0,104,0,0);B.p(3960,'R',0,104,0,0,180);B.p(4740,'W',0,120,0,0,180);B.p(6141,'W',0,128,0,0);for(const x of[-30,30])B.p(3024,'DBG',x,8,0,0);B.p(98138,'W',0,8,30,0)}},
 p_table:{prop:1,fit:'y',far:'keep',leaf:'W',f:B=>{B.p('4032a','DBG',0,8,0,0);B.p('3062b','DBG',0,32,0,0);B.p('4032a','W',0,40,0,0);B.p(30374,'LBG',0,120,0,0);B.p(3960,'W',0,120,0,0,180);B.p(4740,'R',0,136,0,0,180);B.p(6141,'R',0,144,0,0);for(const x of[-45,45]){B.p(3005,'LBG',x,24,0,0);B.p('3023b','W',x,32,0,90);B.p(3004,'W',x+(x>0?10:-10),56,0,90)}}},
 p_fence:{prop:1,fit:'x',far:'keep',leaf:'W',f:B=>{for(const x of[-80,0,80]){B.p(3710,'DBG',x,8,0,0);B.p(3633,'W',x,32,0,0)}for(const x of[-120,-40,40,120]){B.p(3005,'W',x,56,0,0);B.p(6141,'R',x,64,0,0)}}},
 // asset-2 street furniture (LDraw parts verified by header: 2039 Support 2x2x7 Lamppost, 4070 Brick 1x1 with Headlight, 3957a Antenna 4H,
 // 30260 Roadsign Clip-on 2x2 Octagonal, 30261 Roadsign Clip-on 2x2 Round, 4215b Panel 1x4x3, 30413 Panel 1x4x1, 3035 Plate 4x8, 3034 Plate 2x8 ...)
 // lamp: 2x2 round plate + 2x2 round brick foot, the 2039 lamppost (7 bricks), a trans-yellow 1x1 round brick bulb under an inverted 2x2 dish shade
 p_lamp:{prop:1,fit:'y',far:'keep',leaf:'K',f:B=>{const c=CID==='fra'?'K':'DBG';B.p('4032a',c,0,8,0,0);B.p(3941,c,0,32,0,0);B.p(2039,c,0,200,0,0);B.p('3062b','#FFE68A',0,224,0,0);B.p(4740,c,0,234,0,0,180)}},
 // traffic light: pole of 1x1 round bricks, head = 3 headlight bricks (black) with trans red / yellow / green 1x1 round plates on their side studs, a visor plate on top
 p_tlight:{prop:1,fit:'y',far:'keep',leaf:'K',f:B=>{B.p('4032a','DBG',0,8,0,0);B.stack('3062b','DBG',7,0,0,8);const y0=176;for(let i=0;i<3;i++){B.p(4070,'K',0,y0+24*(i+1),0,0);B.p(6141,['#30C040','#F8C000','#E02020'][i],0,y0+24*i+12,14,0,90)}
  B.p(3024,'K',0,y0+80,0,0);B.p(3024,'K',0,y0+80,10,0)}},
 // stop sign: round plate, 1x1 round bricks, 3957a antenna pole, red 30260 octagon with a white 1x2 tile bar on both faces
 p_sign:{prop:1,fit:'y',far:'keep',leaf:'R',f:B=>{B.p('4032a','DBG',0,8,0,0);B.stack('3062b','LBG',3,0,0,8);B.p('3957a','LBG',0,80,0,0);B.p(30260,'R',0,150,0,0);for(const z of[-7,7])B.p('3069b','W',0,150,z,0,z>0?90:-90)}},
 // bus shelter: 4x8 floor plate, trans-light-blue 1x4x3 panels + 1x4x1 top panels as the back wall, two round-brick posts, 4x8 roof, bench (1x6 plate on bricks),
 // the stop sign: yellow 30261 round sign with a green tile on a round-brick post
 p_stop:{prop:1,fit:'x',far:'keep',leaf:'DBG',f:B=>{B.p(3035,'LBG',0,8,0,0);for(const x of[-40,40]){B.p('4215b','#AEE9EF',x,80,-30,0);B.p(30413,'#AEE9EF',x,104,-30,0)}for(const x of[-70,70])B.stack('3062b','DBG',4,x,30,8);
  B.p(3035,'DBG',0,112,0,0);B.p(4162,'BL',0,120,30,0);for(const x of[-40,40])B.p(3005,'DBG',x,32,-10,0);B.p(3666,'RB',0,40,-10,0);B.stack('3062b','LBG',6,100,30,0);B.p(30261,'Y',100,150,30,0);B.p('3069b','G',100,150,37,0,90)}},
 // Athens periptero (kiosk): green 6x4 brick body, magazine tiles on the front, 4x8 roof with a white fascia, white 2x2 freezer stack at the side
 p_kiosk:{prop:1,fit:'x',far:'keep',leaf:'G',f:B=>{B.p(3032,'DBG',0,8,0,0);for(let k=0;k<4;k++){const y=32+24*k,c=k%2?'G':'DG';B.p(3009,c,0,y,-30,0);B.p(3010,c,-50,y,0,90);B.p(3010,c,50,y,0,90);if(k<2||k===3)B.p(3009,c,0,y,30,0)}
  [['R',-40],['BL',0],['Y',40]].forEach(([c,x])=>B.p('3069b',c,x,94,42,0,90));[['W',-40],['O',0],['LI',40]].forEach(([c,x])=>B.p('3069b',c,x,70,42,0,90));B.p(3035,'DG',0,112,0,0);B.p(4162,'W',0,120,40,0);B.p(4162,'W',0,120,-40,0);
  B.stack(3003,'W',3,85,0,8);B.p('3068b','BL',85,80,0,0)}},
 // hedge (fence variant in 40 m runs): 2x8 plate, two courses of green 1x8 bricks, 2x8 plate top, 6x5 plant leaves along both sides and the top
 p_hedge:{prop:1,fit:'x',far:'keep',mid:1,leaf:'G',f:B=>{B.p(3034,'DG',0,8,0,0);for(const z of[-10,10])B.stack(3008,['G','DG'],2,0,z,8);B.p(3034,'G',0,64,0,0);
  for(const x of[-60,0,60])for(const z of[-1,1])B.p(2417,(x/60+z)&1?'G':'BG',x,40+(x?0:8),z*14,z>0?0:180,-55);for(const x of[-50,10,60])B.p(2423,'BG',x,70,0,x*3,-10)}}};
// variants per city (≥ 6 trees each) and the bias each placed base type gives them (score = neighbours of that variant within 30 m / bias)
const AS_POOL={fra:{tree:{oak:1,linden:1,chestnut:.8,oakAut:.7,maple:.6,birch:.5,plane:.4},tree2:{linden:1,birch:1,maple:.6,oakAut:.6,oak:.6,plane:.4},tree3:{fir:1,birch:.6,oak:.5,linden:.5,maple:.4,oakAut:.4},
  bush:{bush:1,bushFl:.8}},
 ath:{tree:{plane:1,orange:1,olive:.8,almond:.7,stonepine:.6,palm:.5,cypress:.4},tree2:{orange:1,olive:1,almond:.8,plane:.7,stonepine:.6,cypress:.5,palm:.4},tree3:{stonepine:1,aleppo:1,cypress:.6,olive:.5,almond:.4},
  CE_pine:{stonepine:1,aleppo:1,cypress:.5,olive:.4},CE_olive:{olive:1,orange:.7,almond:.6,stonepine:.5,cypress:.5,aleppo:.4},CE_cypress:{cypress:1,stonepine:.6,olive:.6,aleppo:.5},
  bush:{oleander:1,bush:.8,bushFl:.6}}};
const AS_PROPS={fra:['bench','bin','hydrant','post','planter','stall','parasol','table','fence','lamp','tlight','sign','stop'],ath:['bench','bin','hydrant','planter','stall','parasol','table','fence','lamp','tlight','sign','stop','post']};
// prop type -> recipe when it is not p_<type> (Athens 'post' is the periptero kiosk), and the alternative variant in some 40 m runs (fence -> hedge)
const AS_PN={ath:{post:'p_kiosk'}},AS_ALT={fence:['p_hedge',.45]};
const AS_FARS={round:[[.07,0],[.07,.32],[.75,.4],[1,.62],[.8,.86],[0,1]],umbrella:[[.06,0],[.06,.62],[1,.72],[.9,.9],[0,1]],cone:[[.07,0],[.07,.18],[1,.22],[.45,.62],[0,1]],
 column:[[.08,0],[.08,.08],[.9,.15],[1,.5],[.6,.85],[0,1]],palm:[[.05,0],[.05,.82],[1,.86],[.3,.96],[0,1]],bush:[[.6,0],[1,.35],[.85,.75],[0,1]]};
function AS_build(name,lod,fit){if(TR1.on&&TR1_R[name])return TR1_build(name,lod,fit);/* trees-1 (tr1.js) */const R=AS_R[name],B=AS_B(name.length*7919+13);R.f(B);const P=[],C=[];let parts=0,studs=0,ymax=0;const col=new THREE.Color(),v=new THREE.Vector3();
 const SG=5;// stud cylinder r 6, h 4 LDU (real stud 4.8 mm x 1.7 mm), SG sides + 4-tri cap
 for(const q of B.L){const G=AS_part(q.id,lod),M=AS_mat(q);col.set(AS_COL[q.c]||q.c);parts++;
  for(let j=0;j<G.i.length;j++){const a=G.i[j]*3;v.set(G.p[a],G.p[a+1],G.p[a+2]).applyMatrix4(M);P.push(v.x,v.y,v.z);C.push(col.r,col.g,col.b);if(v.y>ymax)ymax=v.y}
  if(lod==='n')G.s.forEach((s,k)=>{if(q.cov&&q.cov.has(k))return;const o=new THREE.Vector3(...s).applyMatrix4(M),up=new THREE.Vector3(0,1,0).transformDirection(M);if(up.y<.5||AS_hid(B.L,q,o,R.prop))return;studs++;
   const lo=Array.from({length:SG},(_,i)=>{const a=i/SG*Math.PI*2;return new THREE.Vector3(s[0]+Math.cos(a)*6,s[1],s[2]+Math.sin(a)*6).applyMatrix4(M)}),hi=Array.from({length:SG},(_,i)=>{const a=i/SG*Math.PI*2;return new THREE.Vector3(s[0]+Math.cos(a)*6,s[1]+4,s[2]+Math.sin(a)*6).applyMatrix4(M)});
   const T=(a,b,c)=>{P.push(a.x,a.y,a.z,b.x,b.y,b.z,c.x,c.y,c.z);for(let i=0;i<3;i++)C.push(col.r,col.g,col.b)};
   for(let i=0;i<SG;i++){const j=(i+1)%SG;T(lo[i],hi[j],lo[j]);T(lo[i],hi[i],hi[j])}for(let i=1;i<SG-1;i++)T(hi[0],hi[i+1],hi[i])})}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));
 let k=R.H/ymax;if(fit){g.computeBoundingBox();const b=g.boundingBox;k=fit[1]/(fit[0]==='x'?b.max.x-b.min.x:ymax)}g.scale(k,k,k);g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();const bb=g.boundingBox;
 g.userData.as={name,lod,parts,studs,tris:P.length/9,ids:[...new Set(B.L.map(q=>q.id))],H:bb.max.y,rx:Math.max(-bb.min.x,bb.max.x,-bb.min.z,bb.max.z)};return g}
// far blob: one 6-sided lathe per class, unit height/radius (instance scale = the variant's crown radius and height); trunk darker (tint multiplies)
function AS_farGeo(cls){const pr=AS_FARS[cls],g=new THREE.LatheGeometry(pr.map(([r,y])=>new THREE.Vector2(Math.max(r,.001),y)),6).toNonIndexed(),p=g.attributes.position,c=[];
 for(let i=0;i<p.count;i+=3){const y=(p.getY(i)+p.getY(i+1)+p.getY(i+2))/3,r=Math.max(...[0,1,2].map(j=>Math.hypot(p.getX(i+j),p.getZ(i+j)))),t=cls!=='bush'&&r<.1&&y<.9;for(let j=0;j<3;j++)c.push(...(t?[.35,.25,.18]:[1,1,1]))}
 g.setAttribute('color',new THREE.Float32BufferAttribute(c,3));g.deleteAttribute('uv');g.computeVertexNormals();g.computeBoundingSphere();return g}
function AS_variants(){const C=CID==='fra'?'fra':'ath';if(ASSET.city===C&&(ASSET.np||!HUB.ptypes))return ASSET.V;ASSET.city=C;ASSET.V={};const st={};
 for(const b in AS_POOL[C])for(const n in AS_POOL[C][b])if(!ASSET.V[n]){const t0=performance.now(),gm=AS_build(n,'m'),gn=TR1.on&&TR1_R[n]&&TR1_low()?gm:AS_build(n,'n'),u=gn.userData.as;/* tr1: low tier = one LOD */
  ASSET.V[n]={n,gn,gm,cls:AS_R[n].far,H:u.H,rx:Math.max(u.rx,gm.userData.as.rx),leaf:new THREE.Color(AS_COL[AS_R[n].leaf])};st[n]={parts:u.parts,studs:u.studs,near:u.tris,mid:gm.userData.as.tris,ids:u.ids.join(' '),ms:Math.round(performance.now()-t0)}}
 const D=HUB.ptypes;if(D)for(const t of AS_PROPS[C])for(const n of[AS_pn(t),...(AS_ALT[t]?[AS_ALT[t][0]]:[])]){const d=D[t];if(!d||!d.g)continue;const og=d.gAS0||d.g;og.computeBoundingBox();const ob=og.boundingBox,ax=AS_R[n].fit,fit=[ax,ax==='x'?ob.max.x-ob.min.x:ob.max.y-ob.min.y];
  const t0=performance.now(),gn=AS_build(n,'n',fit),gm=AS_build(n,'m',fit),u=gn.userData.as;ASSET.V[n]={n,gn,gm,cls:'keep',mid:!!AS_R[n].mid,H:u.H,rx:1,leaf:new THREE.Color(AS_COL[AS_R[n].leaf])};
  st[n]={parts:u.parts,studs:u.studs,near:u.tris,mid:gm.userData.as.tris,ids:u.ids.join(' '),ms:Math.round(performance.now()-t0)}}
 ASSET.st=st;ASSET.np=D?1:0;return ASSET.V}
// variant per prop: greedy, least represented among the trees within 30 m (bias by base type), deterministic per position
const AS_pn=t=>(AS_PN[CID==='fra'?'fra':'ath']||{})[t]||'p_'+t;
// street prop variant: its recipe, or the alternative for the whole 40 m cell (hedge runs instead of fence runs)
function AS_pv(p){const A=AS_ALT[p.t];if(A&&ASSET.V[A[0]]){const h=Math.abs(Math.sin(Math.floor(p.x/40)*12.9898+Math.floor(p.z/40)*78.233)*43758.5453)%1;if(h<A[1])return A[0]}return ASSET.V[AS_pn(p.t)]?AS_pn(p.t):null}
function AS_assign(L){const C=CID==='fra'?'fra':'ath',POOL=AS_POOL[C],G=ASSET.ag||(ASSET.ag=new Map()),key=(x,z)=>Math.floor(x/30)*100000+Math.floor(z/30);let n=0;
 for(const p of L){const pool=POOL[p.t];if(!pool){if(!p.av){const v=AS_pv(p);if(v)p.av=v}continue}if(p.av){if(p._ag!==ASSET.agId){p._ag=ASSET.agId;const k=key(p.x,p.z);let A=G.get(k);if(!A)G.set(k,A=[]);A.push(p)}continue}p._ag=ASSET.agId;const cnt={},kx=Math.floor(p.x/30),kz=Math.floor(p.z/30);
  for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const A=G.get((kx+a)*100000+kz+b);if(A)for(const q of A)if(Math.abs(q.x-p.x)<30&&Math.abs(q.z-p.z)<30&&Math.hypot(q.x-p.x,q.z-p.z)<=30)cnt[q.av]=(cnt[q.av]||0)+1}
  const h=Math.abs(Math.sin(p.x*12.9898+p.z*78.233)*43758.5453)%1;let best=null,bs=1e9;for(const v in pool){const s=((cnt[v]||0)+.5+h*.6)/pool[v];if(s<bs){bs=s;best=v}}
  p.av=best;const k=key(p.x,p.z);let A=G.get(k);if(!A)G.set(k,A=[]);A.push(p);n++}return n}
// rebalance (local search): a tree takes the variant with the fewest same-variant trees within 45 m, nearer ones weigh more (its pool first, then the city pool)
// terr-3 (Athens boot: 4.7 s of 5 full passes over ~100k trees): a tree is re-scored only when a variant changed within its 5x5 cells since its
// last scoring (cell stamps; same result as re-scoring all), distances squared first
function AS_fix(L,passes=5){const C=CID==='fra'?'fra':'ath',POOL=AS_POOL[C],G=ASSET.ag;let sw=0,step=0;const all={};for(const b in POOL)if(b!=='bush')Object.assign(all,POOL[b]);delete all.palm;
 // numeric variant ids + one reused counter (sums in the same order as the old cnt object, so the same swaps); bush-free cell lists
 const VI=new Map(),vi=v=>{let k=VI.get(v);if(k==null){k=VI.size;VI.set(v,k)}return k},GF=new Map();for(const[k,A]of G){const F=[];for(const q of A){q._vi=vi(q.av);if(q.t!=='bush')F.push(q)}GF.set(k,F)}
 for(const p of L)p._vi=vi(p.av);const PL=P=>Object.keys(P).map(v=>[v,vi(v)]),PA=PL(all),PP={};for(const t in POOL)PP[t]=PL(POOL[t]);
 const cnt=new Float64Array(VI.size+1),T=[];
 const ST=new Map(),EV=new Map();
 for(let k=0;k<passes;k++){let ch=0;for(const p of L){if(!p.av||p.t==='bush'||AS_R[p.av].prop)continue;const kx=Math.floor(p.x/30),kz=Math.floor(p.z/30);step++;
  const e0=EV.get(p);if(e0!=null){let st=false;for(let a=-2;a<=2&&!st;a++)for(let b=-2;b<=2;b++){const t=ST.get((kx+a)*100000+kz+b);if(t!=null&&t>e0){st=true;break}}if(!st)continue}EV.set(p,step);
  for(let a=-2;a<=2;a++)for(let b=-2;b<=2;b++){const A=GF.get((kx+a)*100000+kz+b);if(A)for(const q of A){if(q===p)continue;const dx=q.x-p.x,dz=q.z-p.z,d2=dx*dx+dz*dz;if(d2>3600)continue;const d=Math.sqrt(d2),i=q._vi;if(cnt[i]===0)T.push(i);cnt[i]+=(d<30?1.5:1)-d/80}}
  const c0=cnt[p._vi];if(c0){let best=p.av,bv=p._vi,bc=c0;for(const P of[PP[p.t]||[],PA]){for(const[v,i]of P){const c=cnt[i];if(c<bc-1e-6){bc=c;best=v;bv=i}}if(bc===0)break}if(best!==p.av){p.av=best;p._vi=bv;ch++;ST.set(kx*100000+kz,step)}}
  for(const i of T)cnt[i]=0;T.length=0}sw+=ch;if(!ch)break}return sw}
function AS_farM(p,m){const V=ASSET.V[p.av];TR1_s(p);return m.compose(V3(p.x,p.y,p.z),new THREE.Quaternion().setFromAxisAngle(V3(0,1,0),p.ry),V.cls==='keep'?_ts.set(1,1,1):_ts.set(V.rx*(p.cvs?p.cvs[0]:1),V.H*(p.cvs?p.cvs[1]:1),V.rx*(p.cvs?p.cvs[0]:1)))/* city-var: p.cvs = foliage-mix size (98cv) */}
// far instances of assigned props: variant scale + crown tint (+ debris colour)
function AS_far(L){const M=new THREE.Matrix4(),dirty=new Set();for(const p of L){if(!p.av||!p.im)continue;const V=ASSET.V[p.av];if(V.cls==='keep')continue;if(p.alive)p.im.setMatrixAt(p.i,AS_farM(p,M));if(p.im.geometry.userData.asImp){p.im.setColorAt(p.i,_asC.setRGB(V.cell/255,0,0));if(p.im.material!==ASSET.imp.mat)p.im.material=ASSET.imp.mat;p.im.castShadow=false}else if(p.im.instanceColor)p.im.setColorAt(p.i,V.leaf);p.col=V.leaf.clone();dirty.add(p.im)}
 for(const im of dirty){im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;im.computeBoundingSphere()}}
// far LOD = LEGO impostors (asset-2; Alex: replace the cone trees in the far distance): every tree/bush variant's simplified build is rendered once into
// a 4x4 atlas (256 px cells, render target with mipmaps, cleared to the crown colour at alpha 0 so mips have no dark fringe) from 22° above (as the player sees far trees) under a fixed sun + sky,
// and drawn as two crossed quads (4 tris instead of the ~40-tri lathe blob), alpha-tested. The atlas cell rides in the instance colour's red channel
// (cell/255), so the city's per-tile prop meshes keep one geometry + one material per base type and AS_far just writes the cell per instance.
const AS_IP=.04,AS_IE=22;// cell padding (uv); capture elevation (deg): from the side the flat leaf plates are edge-on slivers
function AS_impAtlas(){const V=ASSET.V,L=Object.values(V).filter(v=>v.cls!=='keep');if(ASSET.imp&&ASSET.imp.city===ASSET.city&&ASSET.imp.n===L.length)return ASSET.imp;
 const R=renderer,S=256,rt=new THREE.WebGLRenderTarget(S*4,S*4,{generateMipmaps:true,minFilter:THREE.LinearMipmapLinearFilter,magFilter:THREE.LinearFilter}),sc=new THREE.Scene(),cam=new THREE.OrthographicCamera(-1,1,1,0,-200,200);ASSET.mat=ASSET.mat||new THREE.MeshStandardMaterial({vertexColors:true,roughness:.32,metalness:0});
 sc.add(new THREE.HemisphereLight(0xdfefff,0x55603a,1.6));const sun=new THREE.DirectionalLight(0xfff2dd,2.4);sun.position.set(.5,1,.9);sc.add(sun);const ms=new THREE.Mesh(undefined,ASSET.mat);sc.add(ms);
 const pr=R.getRenderTarget(),cc=R.getClearColor(new THREE.Color()),ca=R.getClearAlpha(),ac=R.autoClear,sh=R.shadowMap.autoUpdate;R.autoClear=false;R.shadowMap.autoUpdate=false;const TD=typeof TQ!=='undefined'&&TQ?TQ:null,d0=TD&&TD.draw;if(TD)TD.draw=1;// &draw=0 test pages block renderer.render unless TQ.draw
 L.forEach((v,i)=>{v.cell=i;const cx=(i%4)*S,cy=Math.floor(i/4)*S,p=Math.round(AS_IP*S);ms.geometry=v.gm;const e=AS_IE*Math.PI/180;cam.position.set(0,Math.sin(e)*50,Math.cos(e)*50);cam.lookAt(0,0,0);cam.updateMatrixWorld();let y0=1e9,y1=-1e9;
  for(const x of[-v.rx,v.rx])for(const y of[0,v.H])for(const z of[-v.rx,v.rx]){const q=V3(x,y,z).applyMatrix4(cam.matrixWorldInverse);y0=Math.min(y0,q.y);y1=Math.max(y1,q.y)}cam.left=-v.rx;cam.right=v.rx;cam.top=y1;cam.bottom=y0;cam.updateProjectionMatrix();
  rt.scissor.set(cx,cy,S,S);rt.scissorTest=true;rt.viewport.set(cx,cy,S,S);R.setRenderTarget(rt);R.setClearColor(v.leaf,0);R.clear();rt.viewport.set(cx+p,cy+p,S-2*p,S-2*p);R.setRenderTarget(rt);R.render(sc,cam)});
 rt.scissorTest=false;rt.viewport.set(0,0,S*4,S*4);if(TD)TD.draw=d0;R.setRenderTarget(pr);R.setClearColor(cc,ca);R.autoClear=ac;R.shadowMap.autoUpdate=sh;
 const m=new THREE.MeshBasicMaterial({map:rt.texture,alphaTest:.42,side:THREE.DoubleSide});m.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\n#ifdef USE_INSTANCING_COLOR\n{float ci=floor(instanceColor.r*255.+.5);vMapUv=(vec2(mod(ci,4.),floor(ci/4.))+vMapUv)*.25;}\n#endif')
  .replace('#include <color_vertex>','#include <color_vertex>\n#ifdef USE_INSTANCING_COLOR\nvColor=vec3(1.);\n#endif')};m.customProgramCacheKey=()=>'asImp';
 const q=AS_IP,P=[],U=[];for(const[ax,az]of[[1,0],[0,1]]){const c=[[-1,0],[1,0],[1,1],[-1,0],[1,1],[-1,1]];for(const[x,y]of c){P.push(x*ax,y,x*az);U.push(q+(x+1)/2*(1-2*q),q+y*(1-2*q))}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));g.computeVertexNormals();g.computeBoundingSphere();g.userData.asImp=1;
 return ASSET.imp={city:ASSET.city,n:L.length,rt,mat:m,geo:g}}
const _asC=new THREE.Color();
// an InstancedMesh of impostors for a list of {x,y,z,ry,s,v} (v = variant name), e.g. the open race courses' trees and bushes (98ro_open)
function AS_impMesh(L){const I=AS_impAtlas(),im=new THREE.InstancedMesh(I.geo,I.mat,L.length),M=new THREE.Matrix4(),Q=new THREE.Quaternion(),Y=V3(0,1,0),S=new THREE.Vector3();
 L.forEach((a,i)=>{const V=ASSET.V[a.v];M.compose(V3(a.x,a.y,a.z),Q.setFromAxisAngle(Y,a.ry||0),S.set(V.rx*(a.s||1),V.H*(a.s||1),V.rx*(a.s||1)));im.setMatrixAt(i,M);im.setColorAt(i,_asC.setRGB(V.cell/255,0,0))});
 im.computeBoundingSphere();im.userData.asImp=1;return im}
// base types: far geometry = blob (also what LDS's tile LOD switches between, so both of its picks are the blob)
function AS_defs(D){const C=CID==='fra'?'fra':'ath';AS_variants();ASSET.far=ASSET.far||{};for(const t in AS_POOL[C]){const d=D[t];if(!d)continue;const cls=AS_R[Object.keys(AS_POOL[C][t])[0]].far;
 const I=AS_impAtlas(),g=I.geo;if(d.g!==g){d.gAS0=d.gAS0||d.g;d.mAS0=d.mAS0||d.mat;d.g=g;if(d.gFar)d.gFar=g;if(d.gOld)d.gOld=g;d.mat=I.mat;d.mFar=null}d.asB=1}}
// after the city's props are built (or when this file arrives later): far blobs, variants, rebalance, tints, near/mid meshes
function AS_apply(){const D=HUB.ptypes;if(!D||!HUB.props||!HUB.grp)return;const C=CID==='fra'?'fra':'ath',old=new Map();for(const t in AS_POOL[C]){const d=D[t];if(d&&!d.asB)for(const g of[d.g,d.gFar,d.gOld])if(g)old.set(g,t)}
 AS_defs(D);if(old.size)scene.traverse(o=>{if(o.isInstancedMesh&&old.has(o.geometry)){const d=D[old.get(o.geometry)];if(!d.mAS0)d.mAS0=o.material;o.userData.asOld=o.geometry;o.userData.asOldM=o.material;o.geometry=d.g;o.material=d.mat;o.castShadow=false}});ASSET.ag=new Map();ASSET.agId=(ASSET.agId|0)+1;ASSET.hid.clear();
 ASSET.nA=AS_assign(HUB.props);ASSET.nFix=AS_fix(HUB.props);AS_far(HUB.props);AS_mk();ASSET.cx=1e9;AS_tufts()}
// fill grass tufts (98lf, ~216k in Frankfurt, two open 5-sided cones = 10 tris each) -> a low-poly copy of LEGO 6255 Plant 1x1 Round with 3 Large Leaves:
// 3 kite leaves 120° apart (centre r 4 -> sides r 28 ±16 -> tip r 54 LDU as measured on the LDraw part; tips arched up to 27-33 LDU so the tuft keeps the old ~0.9 m height), a second one turned 60° on a
// 1x1 round stem above it (plants stacked on round bricks, as in LEGO bushes): 12 tris, white (the fill's instance colour picks the green), double-sided material
function AS_tuftGeo(){const P=[],C=[],k=.018,leaf=(a0,y0,s)=>{for(let i=0;i<3;i++){const a=(a0+i*120)*Math.PI/180,ca=Math.cos(a),sa=Math.sin(a),pt=(r,w,y)=>[(ca*r-sa*w)*s*k,(y0+y)*k,(sa*r+ca*w)*s*k],
  c=pt(4,0,4),l=pt(28,-16,19),r=pt(28,16,19),t=pt(54,0,27+i*3);P.push(...c,...l,...t,...c,...t,...r);for(let j=0;j<6;j++){const d=j%3===0?.72:j%3===1?.92:1;C.push(d,d,d)}}};
 leaf(15,0,1);leaf(75,30,.72);const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));g.computeVertexNormals();g.computeBoundingSphere();g.userData.as='tuft 6255';return g}
function AS_tufts(){if(typeof LF==='undefined'||typeof LF_geos!=='function'||ASSET.off)return;const GE=LF.geo||(LF.geo=LF_geos());if(GE.tuft.userData.as)return;const old=GE.tuft;GE.tuft=ASSET.tuft||(ASSET.tuft=AS_tuftGeo());GE.tuftOld=old;
 scene.traverse(o=>{if(o.isInstancedMesh&&o.geometry===old)o.geometry=GE.tuft})}
buildHubProps=(f=>function(){const r=f.apply(this,arguments);try{AS_apply()}catch(e){console.warn('AS apply',e)}return r})(buildHubProps);
lzPropsG=(f=>function*(L){yield* f.apply(this,arguments);try{const P=HUB.props,n=L.nProps|0,T=P.slice(P.length-n);if(HUB.ptypes)AS_defs(HUB.ptypes);AS_assign(T);AS_fix(T);AS_far(T);ASSET.cx=1e9}catch(e){console.warn('AS lz',e)}})(lzPropsG);
propRevive=(f=>function(p){f.apply(this,arguments);if(p.av&&p.im&&ASSET.V[p.av]){p.im.setMatrixAt(p.i,AS_farM(p,new THREE.Matrix4()));ASSET.cx=1e9}})(propRevive);
hubCullStep=(f=>function(){f.apply(this,arguments);try{AS_step()}catch(e){if(!ASSET.err)console.warn('AS step',e);ASSET.err=e}})(hubCullStep);
// near/mid instanced meshes, one pair per variant, in their own group next to HUB.grp (visible while HUB.grp is; not in the hubCull list,
// which snapshots HUB.grp's children and would cull these origin-centred meshes away from the origin)
function AS_mk(){const V=ASSET.V;if(ASSET.grp&&ASSET.grp.parent)ASSET.grp.parent.remove(ASSET.grp);const gp=ASSET.grp=new THREE.Group(),hg=HUB.grp;gp.name='AS';
 Object.defineProperty(gp,'visible',{get:()=>hg.visible&&!!hg.parent&&!ASSET.off,set(){}});(hg.parent||scene).add(gp);ASSET.mat=ASSET.mat||new THREE.MeshStandardMaterial({vertexColors:true,roughness:.32,metalness:0});ASSET.nm={};ASSET.mm={};
 for(const n in V)for(const[lod,g,M]of[['n',V[n].gn,ASSET.nm],['m',V[n].gm,ASSET.mm]]){if(lod==='m'&&V[n].cls==='keep'&&!V[n].mid)continue;const im=new THREE.InstancedMesh(g,ASSET.mat,lod==='n'?256:1024);im.count=0;im.visible=false;im.userData.asLod=lod;im.userData.as=n;im.frustumCulled=true;gp.add(im);M[n]=im}}
function AS_step(){if(ASSET.off||!HUB.pgrid||!HUB.props||!ASSET.nm||!camera)return;const cp=camera.position;if((ASSET.fr=(ASSET.fr+1)%4)&&Math.hypot(cp.x-ASSET.cx,cp.z-ASSET.cz)<6)return;
 if(Math.hypot(cp.x-ASSET.cx,cp.z-ASSET.cz)<1.5&&ASSET.fr)return;ASSET.cx=cp.x;ASSET.cz=cp.z;const t0=performance.now(),R=ASSET.mid,kx=Math.floor(cp.x/16),kz=Math.floor(cp.z/16),kr=Math.ceil(R/16)+1;
 const near={},mid={},now=new Set(),M=new THREE.Matrix4(),Z=new THREE.Matrix4().makeScale(0,0,0);
 for(let a=-kr;a<=kr;a++)for(let b=-kr;b<=kr;b++){const A=HUB.pgrid.get((kx+a)*10000+kz+b);if(!A)continue;for(const p of A){if(!p.im)continue;if(!p.av){if((AS_POOL[CID==='fra'?'fra':'ath'][p.t]&&HUB.ptypes[p.t]&&HUB.ptypes[p.t].asB)||ASSET.V[AS_pn(p.t)]){AS_assign([p]);AS_far([p])}if(!p.av)continue}
  if(!p.alive)continue;const d=Math.hypot(p.x-cp.x,p.z-cp.z);const V=ASSET.V[p.av];if(d>R||(d>ASSET.near&&V.cls==='keep'&&!V.mid))continue;(d<=ASSET.near?near:mid)[p.av]=((d<=ASSET.near?near:mid)[p.av]||[]);(d<=ASSET.near?near:mid)[p.av].push(p);now.add(p)}}
 // hide the far instance of every near/mid prop (re-hide after a revive), show the ones that left
 for(const p of now){const e=p.im.instanceMatrix.array;if(e[p.i*16]!==0||e[p.i*16+5]!==0){p.im.setMatrixAt(p.i,Z);ASSET.dirty.add(p.im)}}
 for(const p of ASSET.hid)if(!now.has(p)&&p.alive&&p.im){p.im.setMatrixAt(p.i,AS_farM(p,M));ASSET.dirty.add(p.im)}ASSET.hid=now;for(const im of ASSET.dirty)im.instanceMatrix.needsUpdate=true;ASSET.dirty.clear();
 let draws=0,tris=0,inst=[0,0];for(const[S,MM,li]of[[near,ASSET.nm,0],[mid,ASSET.mm,1]])for(const n in MM){let im=MM[n];const L=S[n]||[];
  if(L.length>im.instanceMatrix.count){const g=im.geometry,par=im.parent;par&&par.remove(im);im.dispose&&im.dispose();im=new THREE.InstancedMesh(g,ASSET.mat,Math.ceil(L.length*1.5));im.userData=Object.assign({},MM[n].userData);par&&par.add(im);MM[n]=im}
  L.forEach((p,i)=>{TR1_s(p);if(TR1.on&&TR1_R[n]&&!AS_R[n].prop)im.setColorAt(i,TR1_col(p));const w=p.cvs?p.cvs[0]:1;M.compose(V3(p.x,p.y,p.z),new THREE.Quaternion().setFromAxisAngle(V3(0,1,0),p.ry),_ts.set(w,p.cvs?p.cvs[1]:1,w));im.setMatrixAt(i,M)});im.count=L.length;im.visible=L.length>0;
  if(L.length){im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;im.computeBoundingSphere();draws++;tris+=L.length*im.geometry.userData.as.tris;inst[li]+=L.length}}
 ASSET.last={ms:+(performance.now()-t0).toFixed(2),draws,tris,near:inst[0],mid:inst[1],hidden:now.size}}
// test hook: chk() = per-variant parts/studs/tris; lod() = every drawn instance on the right LOD for its distance; mix(r) = worst same-variant share within r m
// ab(1): draw the old trees again (A/B shots and perf), ab(0): back to the LEGO builds
function AS_ab(off){const D=HUB.ptypes,M=new THREE.Matrix4(),dirty=new Set();ASSET.off=!!off;{const GE=typeof LF!=='undefined'&&LF.geo;if(GE&&GE.tuftOld){const a=off?GE.tuft:GE.tuftOld,b=off?GE.tuftOld:GE.tuft;scene.traverse(o=>{if(o.isInstancedMesh&&o.geometry===a)o.geometry=b})}}for(const M2 of[ASSET.nm,ASSET.mm])for(const n in M2)M2[n].visible=!off&&M2[n].count>0;
 for(const p of HUB.props||[]){if(!p.av||!p.im)continue;const d=D[p.t],im=p.im;if(ASSET.V[p.av].cls==='keep'){if(off&&p.alive){M.compose(V3(p.x,p.y,p.z),new THREE.Quaternion().setFromAxisAngle(V3(0,1,0),p.ry),_ts.set(1,1,1));im.setMatrixAt(p.i,M);dirty.add(im)}continue}if(!im.userData.asOld){im.userData.asOld=d.gAS0;im.userData.asOldM=d.mAS0}if(!im.userData.asOldM)continue;im.geometry=off?im.userData.asOld:d.g;im.material=off?im.userData.asOldM:d.mat;
  if(p.alive){if(off)M.compose(V3(p.x,p.y,p.z),new THREE.Quaternion().setFromAxisAngle(V3(0,1,0),p.ry),_ts.set(1,1,1));im.setMatrixAt(p.i,off?M:AS_farM(p,M))}
  if(off&&im.instanceColor)im.setColorAt(p.i,new THREE.Color(d.tint?d.tint[(p.i*7)%d.tint.length]:'#ffffff'));dirty.add(im)}
 for(const im of dirty){im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true}if(!off){AS_far(HUB.props);ASSET.hid.clear();ASSET.cx=1e9;AS_step()}return off?'old':'lego'}
// checklist GO (src/99c_checklist.js as1/*): parks the car among the trees, then measures. kind: parts | mix | lod
function AS_spot(F){const T=HUB.props.filter(p=>p.av&&(F?F(p):p.t!=='bush')&&Math.hypot(p.x-RO.x,p.z-RO.z)<1500),G=new Map(),K=new Map(),key=p=>Math.floor(p.x/40)+','+Math.floor(p.z/40);
 for(const p of T){const k=key(p);G.set(k,(G.get(k)||0)+1);if(F)(K.get(k)||K.set(k,new Set()).get(k)).add(p.av)}// street: most kinds first, then most pieces
 let bk=null,bs=-1;for(const[k,n]of G){const[a,b]=k.split(',').map(Number),sc=(F?K.get(k).size*1000:0)+n;if(sc>bs&&!roamHit(a*40+20,b*40+20,2)){bs=sc;bk=[a,b]}}if(bk)roamWarp(bk[0]*40+20,bk[1]*40+20,RO.h||0,performance.now());return bk?G.get(bk.join(',')):0}
const AS_FURN=/^p_(lamp|tlight|sign|stop|hedge|kiosk)$/;
function AS_go(kind){const C=CID==='fra'?'fra':'ath',n=AS_spot(kind==='street'?p=>AS_FURN.test(p.av):null),st=AS_variants()&&ASSET.st,tree=Object.keys(st).filter(v=>AS_R[v].far!=='bush'&&!AS_R[v].prop);let ok,msg;
 if(kind==='parts'){const bad=Object.entries(st).filter(([v,o])=>o.parts<(AS_R[v].prop?5:8)||(o.studs<1&&!AS_R[v].prop)||o.ids.split(' ').some(i=>i!=='tr1'&&!AS_PD[i])/* tr1 builds are procedural */);ok=!bad.length;
  msg=`${Object.keys(st).length} types: parts ${Math.min(...Object.values(st).map(o=>o.parts))}-${Math.max(...Object.values(st).map(o=>o.parts))}, studs ≥ ${Math.min(...Object.values(st).map(o=>o.studs))}, real LDraw parts ${[...new Set(Object.values(st).flatMap(o=>o.ids.split(' ')))].join(' ')}${bad.length?' · BAD '+bad.map(b=>b[0]).join(' '):''}`}
 else if(kind==='mix'){const m=__as.mix();ok=tree.length>=6&&m.variants>=6&&m.p95<=.3;msg=`${m.variants} tree variants placed (${tree.length} built) · most common variant in a 30 m disc: median ${m.p50*100|0}%, p95 ${m.p95*100|0}% (pass ≤ 30%), worst ${m.worst*100|0}% · ${m.trees} trees`}
 else if(kind==='far'){const I=ASSET.imp,T=HUB.props.filter(p=>p.av&&p.im&&ASSET.V[p.av].cls!=='keep'),imp=T.filter(p=>I&&p.im.material===I.mat&&p.im.geometry===I.geo),cells=Object.values(ASSET.V).filter(v=>v.cls!=='keep'),noc=cells.filter(v=>v.cell==null).length;
  ok=!!I&&imp.length>=T.length*.99&&!noc&&I.n<=16;msg=`${T.length} trees/bushes, ${imp.length} drawn far as LEGO impostors (4 tris, was a ~40-tri blob) · atlas ${I?I.n:0} variants${noc?' · '+noc+' without a cell':''} · near/mid LEGO builds unchanged`}
 else if(kind==='street'){const o=__as.lod(),k={};for(const v in ASSET.nm)if(AS_FURN.test(v)&&ASSET.nm[v].count)k[v.slice(2)]=ASSET.nm[v].count;for(const v in ASSET.mm)if(AS_FURN.test(v)&&ASSET.mm[v].count)k[v.slice(2)+'(mid)']=ASSET.mm[v].count;const kinds=new Set(Object.keys(k).map(x=>x.replace('(mid)','')));
  ok=kinds.size>=3&&!o.wrong&&!o.farShown&&o.ms<=1.5;msg=`${n} furniture pieces in this 40 m cell · LEGO near the car: ${Object.entries(k).map(([a,b])=>a+' '+b).join(', ')} · ${o.wrong} on the wrong LOD, ${o.farShown} doubled · +${o.draws} draws, ${Math.round(o.tris/1000)}k tris · refresh ${o.ms} ms`}
 else{const o=__as.lod();ok=!o.wrong&&!o.farShown&&o.near>0&&o.mid>0&&o.ms<=1.5;msg=`${n} trees in this 40 m cell · ${o.near} full (≤ ${ASSET.near} m) + ${o.mid} simplified (≤ ${ASSET.mid} m), ${o.wrong} on the wrong LOD, ${o.farShown} doubled · +${o.draws} draws, ${Math.round(o.tris/1000)}k tris · refresh ${o.ms} ms (pass ≤ 1.5)`}
 return (ok?'PASS':'FAIL')+' · LEGO world assets '+C+' · '+msg}
// lineup(['p_lamp',..],d,old): the variants' full builds in a row d m in front of the camera (old = also the old prop mesh right of each), for shots; lineup() clears
function AS_lineup(L,d=9,old=1){const sc=scene;if(ASSET.lu){sc.remove(ASSET.lu);ASSET.lu=null}ASSET.luCam=null;if(!L)return 'cleared';AS_variants();const g=ASSET.lu=new THREE.Group(),cp=camera.position,f=V3(RO.x-cp.x,0,RO.z-cp.z).normalize(),r=V3(-f.z,0,f.x),D=HUB.ptypes,w=[];
 for(const n of L){const V=ASSET.V[n];if(!V)continue;const t=Object.keys(D).find(t=>AS_pn(t)===n||(AS_ALT[t]&&AS_ALT[t][0]===n)),d0=D[t];w.push([V.gn,ASSET.mat]);if(old&&d0)w.push([d0.gAS0||d0.g,d0.mat])}
 const sp=w.map(([g])=>{g.computeBoundingBox();return Math.max(2.2,g.boundingBox.max.x-g.boundingBox.min.x+.8)}),tot=sp.reduce((a,b)=>a+b,0);let x=-tot/2;
 w.forEach(([geo,m],i)=>{x+=sp[i]/2;const px=RO.x+f.x*d+r.x*x,pz=RO.z+f.z*d+r.z*x,o=new THREE.Mesh(geo,m);o.position.set(px,groundY(px,pz),pz);o.rotation.y=Math.atan2(f.x,f.z)+(d<0?Math.PI:0);g.add(o);x+=sp[i]/2});sc.add(g);
 const cx=RO.x+f.x*d,cz=RO.z+f.z*d,cy=groundY(cx,cz),back=Math.max(11,tot*.55);const cam=()=>{const sg=d<0?-1:1;camera.position.set(cx+sg*f.x*back,cy+1.6,cz+sg*f.z*back);camera.lookAt(cx,cy+3.2,cz);camera.updateMatrixWorld()};
 if(window.__tq&&!ASSET.luD){ASSET.luD=__tq.draw;__tq.draw=()=>{ASSET.luCam&&ASSET.luCam();return ASSET.luD()}}ASSET.luCam=cam;return w.length+' meshes, shot camera '+back.toFixed(1)+' m back'}
window.__as={impMesh:AS_impMesh,impAtlas:AS_impAtlas,A:ASSET,R:AS_R,build:AS_build,ab:AS_ab,step:AS_step,go:AS_go,lineup:AS_lineup,
 chk(){AS_variants();return ASSET.st},
 lod(){ASSET.cx=1e9;ASSET.fr=0;AS_step();const cp=camera.position,o={...ASSET.last,wrong:0,farShown:0};const e=new THREE.Matrix4(),v=new THREE.Vector3();
  for(const[MM,lo,hi]of[[ASSET.nm,0,ASSET.near],[ASSET.mm,ASSET.near,ASSET.mid]])for(const n in MM){const im=MM[n];for(let i=0;i<im.count;i++){im.getMatrixAt(i,e);v.setFromMatrixPosition(e);const d=Math.hypot(v.x-cp.x,v.z-cp.z);if(d>hi+.01||d<lo-.01)o.wrong++}}
  for(const p of ASSET.hid){const a=p.im.instanceMatrix.array;if(a[p.i*16]!==0)o.farShown++}return o},
 mix(r=30){const T=(HUB.props||[]).filter(p=>p.av&&/tree|CE_(pine|olive|cypress)/.test(p.t)),G=new Map();for(const p of T){const k=Math.floor(p.x/r)*100000+Math.floor(p.z/r);(G.get(k)||G.set(k,[]).get(k)).push(p)}
  const by={},S=[];for(const p of T)by[p.av]=(by[p.av]||0)+1;for(let i=0;i<T.length;i+=Math.max(1,Math.floor(T.length/3000))){const p=T[i],kx=Math.floor(p.x/r),kz=Math.floor(p.z/r),N=[];
   for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)for(const q of G.get((kx+a)*100000+kz+b)||[])if(Math.hypot(q.x-p.x,q.z-p.z)<=r)N.push(q);if(N.length<5)continue;const c={};for(const q of N)c[q.av]=(c[q.av]||0)+1;S.push(Math.max(...Object.values(c))/N.length)}
  S.sort((a,b)=>a-b);const q=f=>+(S[Math.min(S.length-1,Math.floor(S.length*f))]||0).toFixed(2);// share of the most common variant among the trees in a 30 m disc (≥5 trees)
  return{trees:T.length,variants:Object.keys(by).length,by,p50:q(.5),p95:q(.95),worst:q(1),over:+(S.filter(v=>v>.3).length/Math.max(S.length,1)).toFixed(3),samples:S.length}}};
try{AS_apply()}catch(e){console.warn('AS apply',e)}
