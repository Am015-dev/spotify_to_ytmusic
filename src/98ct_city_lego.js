// ---- CT (city-1, 2026-10-10). Alex: "now we have a big variety, we can include it in our city and replace buildings and cars".
// TRAFFIC: the procedural traffic kinds (CR_cityGeo) are swapped for the real LEGO sets converted from LDraw (LD_MODELS, models.js) and the
// hand-built 40468 taxi. A kind 'ld:<class>:<model>' keeps <class> in its name, so the per-class rules that read HCAR names (QS speeds, SC caps)
// still apply; the slot count stays the same, so draw calls stay the same (body + wheels + glass instanced per kind, 98wb far LOD on top).
// Each model is built once (CR_LO 2, hidden studs culled), at the players' car scale (LD_SW), width capped at SC_K.carW; collision = its own box
// (CT_dim, read by OB_cdim). A model missing from models.js (lazy load not finished) falls back to the old procedural kind (CT_FB).
const CT={geo:{},dim:{},fb:{},stat:[]};
// slot swaps (after QS/SU swaps): name → new kind. Frankfurt: 0 sedan,1 hypercar,2 taxi,3 van,4 truck,5 delivery,6 police,7 coupe,8 bus,9 tuner,10 roadster
const CT_SWAP={fra:{'sedan':'ld:car:v6633_1','su:t_sc_hy':'ld:car:v75878_1','taxi':'ld:car:tx','van':'ld:van:v7731_1','truck':'ld:truck:v3221_1',
  'delivery':'ld:delivery:v60054_1','police':'ld:police:v4436_1','su:t_sc_tm':'ld:car:v75893_1b'},
 ath:{'taxi':'ld:car:tx','sedan':'ld:car:v6633_1','van':'ld:van:v7639_1',/* su:t_sc_tm kept: swapping it together with the taxi added ~110 MB JS heap in Athens (cause open, docs/HANDOFF_city1.md) */'delivery':'ld:delivery:v60054_1','su:t_sc_hy':'ld:car:v75892_1'}};
if(!/[?&]ct=0/.test(location.search)){const S=CT_SWAP[CID==='fra'?'fra':'ath'];const ex=(location.search.match(/[?&]ctx=([^&]*)/)||[])[1]||'';/* test: ctx=<old kinds kept> */for(let i=0;i<HCAR.length;i++){const v=!ex.split(',').includes(HCAR[i])&&S[HCAR[i]];if(v){CT.fb[v]=HCAR[i];HCAR[i]=v}}}
// target body widths per class (m): Town sets are 4–6 studs wide, Speed Champions 8, so each is scaled uniformly to a road width
const CT_SC=/^v(758|7689)/;// Speed Champions
const CT_W={tx:1.72/* 6-wide 40468: keep its height near the others */,car:1.9,police:1.95,van:2.1,delivery:2.2,truck:2.4};
// lazy models (v89z LD_need): start loading the traffic sets of both cities at boot, so they are in before roam builds (else: CT_FB fallback)
try{LD_need([...new Set(Object.values(CT_SWAP.fra).concat(Object.values(CT_SWAP.ath)).map(n=>n.split(':')[2]).filter(id=>id!=='tx'))])}catch(e){}
function CT_bricks(src){if(src==='tx')return typeof TX_CAR==='function'?GAR_arr(TX_CAR()):[];return LD_MODELS[src]?LD_br(src):[]}
function CT_build(nm){const src=nm.split(':')[2],B=CT_bricks(src).filter(b=>!['drv','drvR','stw','fig','flag'].includes(b.t));if(!B.length)return null;
 const lo=CR_LO;let G=null;for(const lv of[2,3,0]){CR_LO=lv;try{G=GB_geo(B,null)}catch(e){G=null}finally{CR_LO=lo}if(G&&G.m)break}if(!G||!G.m)return null;/* the 40468 taxi's printed parts have no LO-2 builder: next level */G.m=LD_cull(G.m,B);G.l=LD_cull(G.l,B);
 const Wg=(G.w||[]).map(w=>{const g=CR_wheel(w.t).clone();g.translate(w.o.x,w.o.y,w.o.z);return g});if(!G.m||!Wg.length)return null;
 const strip=g=>{if(!g)return g;for(const k of Object.keys(g.attributes))if(!['position','normal','color'].includes(k))g.deleteAttribute(k);return g.index?g.toNonIndexed():g};
 const body=mergeGeometries([G.m,G.l].filter(Boolean).map(strip)),wheels=mergeGeometries(Wg.map(strip)),glass=G.g?strip(G.g):null;
 const box=new THREE.Box3().setFromBufferAttribute(body.attributes.position),bw=new THREE.Box3().setFromBufferAttribute(wheels.attributes.position),y0=Math.min(box.min.y,bw.min.y),
  cx=(box.min.x+box.max.x)/2,cz=(box.min.z+box.max.z)/2,s=src==='tx'?CT_W.tx/(box.max.x-box.min.x):LD_SW*(CT_SC.test(src)?1:LD_FIG);/* size-1 rule: City/Town sets minifig scale (×LD_FIG), Speed Champions 0.408 like rides */
 for(const g of[body,wheels,glass].filter(Boolean)){g.translate(-cx,-y0,-cz);g.scale(s,s,s);g.rotateY(Math.PI);g.translate(0,.04,0);g.computeBoundingBox();g.computeBoundingSphere()}
 const W=(box.max.x-box.min.x)*s,L=(box.max.z-box.min.z)*s,H=(box.max.y-y0)*s;CT.dim[nm]=[W/2,L/2];if(SC_K.carL)SC_K.carL[nm]=L+.1;
 const tri=g=>g?(g.index?g.index.count:g.attributes.position.count)/3:0;CT.stat.push({nm,W:+W.toFixed(2),L:+L.toFixed(2),H:+H.toFixed(2),tris:tri(body)+tri(wheels)+tri(glass)});
 return{body,wheels,glass}}
CR_cityGeo=(f=>function(nm){if(!nm||!nm.startsWith('ld:'))return f(nm);if(CR_CG[nm]!==undefined)return CR_CG[nm];let G=null;try{G=CT_build(nm)}catch(e){console.warn('CT traffic',nm,e)}
 if(!G){const fb=CT.fb[nm];return fb?f(fb):null}return CR_CG[nm]=G})(CR_cityGeo);
// real set colours: no per-instance paint (the cab material tints only pure-white bricks, which would repaint e.g. the patrol car's white body)
CR_cityPost=(f=>function(im,nm,k,n){f(im,nm,k,n);if(!nm||!nm.startsWith('ld:')||!CR_CG[nm])return;im.userData.sc=1;/* true scale: the 96 SC width cap must not squeeze it */const c=new THREE.Color('#ffffff');for(let j=0;j<n;j++)im.setColorAt(j,c);im.instanceColor&&(im.instanceColor.needsUpdate=true)})(CR_cityPost);
// collision half sizes [half width, half length] of a kind, from its own model (OB_cdim reads this first)
function CT_dim(k){const n=HCAR[k];return n&&CT.dim[n]&&CR_CG[n]?CT.dim[n]:null}
window.__ct={CT,swap:CT_SWAP,hcar:()=>HCAR.slice(),geo:nm=>CR_cityGeo(nm),r:()=>renderer,
 cars:()=>(HUB.cars||[]).filter(c=>!(c.dead>0)&&c.x!=null).map(c=>{const N=HUB.nodes,A=N[c.a],B=N[c.b];return{nm:HCAR[c.k],x:c.x,z:c.z,y:c.y||0,h:A&&B?Math.atan2(B.x-A.x,B.z-A.z):0,d:Math.hypot(c.x-RO.x,c.z-RO.z)}}).sort((a,b)=>a.d-b.d),
 freeze:on=>{if(on){if(!CT.hts){CT.hts=hubTrafficStep;hubTrafficStep=()=>{}}}else if(CT.hts){hubTrafficStep=CT.hts;CT.hts=null}}};
// ---- CTB (city-1, city-2 2026-10-10): BUILDINGS. Alex: "replace the generic city buildings with real LEGO buildings at minifig scale (a LEGO human
// fits the door)". The generic filler buildings (Frankfurt: the Kenney street rows/frontage via putK; Athens: the small 'plaka' houses and villas via
// put) become real LEGO sets (LDraw OMR, models.js) at minifig scale (LD_SW × LD_FIG). A slot is filled along its street front with a row of sets
// (front flush with the slot front = the old road setback) and, where the slot is deep enough, a second row behind it (Frankfurt: the taller modular
// buildings, so streets read as a dense mid-rise city). Memory (city-1's variants cost +20 MB GPU): ONE geometry per model; its wall bricks are
// recoloured to the sentinel #ffffff and tinted per instance (CTB_mat: instanceColor tints only pure-white vertices); positions Int16, colours
// Uint8, no normals (flat shading); CPU copies dropped after upload. LOD: full bricks < CTB.nearD, clustered copy < CTB.midD, coarse copy < CTB.far.
// Colliders = each set's footprint of tall parts (oriented hubAddB boxes: glancing hits slide). Landmarks, towers, quest buildings stay. ?ctb=0 = old.
const CTB={on:!/[?&]ctb=0/.test(location.search),K:{},nearD:34,midD:CID==='fra'?120:80,far:CID==='fra'?560:430,CS:64,st:{slots:0,sets:0,back:0,skip:0,sz:[]},t:0,cg:{},mat:null,gmat:null};
// per city: front-row and back-row models (k = model id, ids = data chunks, w = weight, gap = min distance between two of it, rc = fixed recolour,
// wall = wall colour if the auto pick is wrong) and the wall palette ('o' = the set's own colour)
const CTB_V={fra:{front:[{k:'bank',w:2},{k:'w6372',w:2},{k:'w6362',w:2,wall:'#b40000'},{k:'w6374',w:1},{k:'w6683',w:1},{k:'cg',ids:['cga','cgb'],w:2,gap:60},
   {k:'m10182',w:2},{k:'m10185',w:2},{k:'m10218',w:2},{k:'m10243',w:2},{k:'m10251',w:2},{k:'m10246',w:2},{k:'m10270',w:2}],
  back:[{k:'cg',ids:['cga','cgb'],w:2},{k:'m10182',w:2},{k:'m10185',w:2},{k:'m10218',w:2},{k:'m10243',w:2},{k:'m10251',w:2},{k:'m10246',w:2},{k:'m10270',w:2},{k:'w6372',w:1},{k:'bank',w:1}],
  pal:['o','o','o','#f4f4f4','#e4cd9e','#958a73','#a0a5a9','#720e0f','#b40404','#a0bcac','#6c6e68','#f2e3bd','#5b7590','#c87a3c']},
 ath:{front:[{k:'w6365',w:3,rc:{'#b40000':'#1e5aa8'},wall:'#fac80a'},{k:'w6360',w:2,wall:'#ffff80'},{k:'w6349',w:2},{k:'w6402',w:1},
   {k:'m10182',w:1,gap:120},{k:'m10243',w:1,gap:120}],
  back:[{k:'w6349',w:1},{k:'w6360',w:1,wall:'#ffff80'},{k:'w6365',w:1,rc:{'#b40000':'#1e5aa8'},wall:'#fac80a'}],
  pal:['#f4f4f4','#f4f4f4','#f4f4f4','#f4f4f4','#f2e3bd','#fbf1d8'],
  // old town (Psyrri, around the start): whitewashed modular cafés and restaurants with the cottages between them
  old:{front:[{k:'m10182',w:3},{k:'m10243',w:3},{k:'w6365',w:1,rc:{'#b40000':'#1e5aa8'},wall:'#fac80a'},{k:'w6402',w:1}],
   back:[{k:'w6349',w:1},{k:'w6360',w:1,wall:'#ffff80'},{k:'w6402',w:1}],pal:['#f4f4f4','#f4f4f4','#f4f4f4','#f2e3bd','#fbf1d8','#e4cd9e']}}};
function CTB_city(){return CID==='fra'?'fra':'ath'}
const CTB_ids=v=>v.ids||[v.k];
// lazy models (v89z): this city's sets start loading at boot, so they are in before the city builds (a missing model keeps the old building)
if(CTB.on)try{const V=CTB_V[CTB_city()];LD_need([...new Set(V.front.concat(V.back,V.old?V.old.front.concat(V.old.back):[]).flatMap(CTB_ids))])}catch(e){}
function CTB_free(){this.array=null}
// geometry (world size, centred, base at y 0) → Int16 positions in ±q, Uint8 colours, no normals; CPU copy dropped once on the GPU
function CTB_pack(g,q){const P=g.attributes.position,C=g.attributes.color,n=P.count,p=new Int16Array(n*3),c=new Uint8Array(n*3),k=32767/q;
 for(let i=0;i<n;i++){const j=i*3;p[j]=Math.round(P.getX(i)*k);p[j+1]=Math.round(P.getY(i)*k);p[j+2]=Math.round(P.getZ(i)*k);
  if(C){c[j]=Math.round(Math.min(1,C.getX(i))*255);c[j+1]=Math.round(Math.min(1,C.getY(i))*255);c[j+2]=Math.round(Math.min(1,C.getZ(i))*255)}else c[j]=c[j+1]=c[j+2]=255}
 const o=new THREE.BufferGeometry();o.setAttribute('position',new THREE.BufferAttribute(p,3,true));o.setAttribute('color',new THREE.BufferAttribute(c,3,true));if(g.index)o.setIndex(g.index.clone());
 o.boundingSphere=new THREE.Sphere(new THREE.Vector3(),2);o.boundingBox=new THREE.Box3(new THREE.Vector3(-1,-1,-1),new THREE.Vector3(1,1,1));if(!/[?&]ctbkeep=1/.test(location.search))for(const a in o.attributes)o.attributes[a].onUpload(CTB_free);g.dispose();return o}
// one model, built once: near [[geo,mat]], mid + far clustered copies, size, wall colour, collider box in the set's frame
function CTB_kind(v){const key=v.k;if(CTB.K[key]!==undefined)return CTB.K[key];const ids=CTB_ids(v);if(!ids.every(id=>LD_MODELS[id]))return null;
 try{return CTB.K[key]=CTB_make(v,ids)}catch(e){console.warn('CTB kind',key,e);return CTB.K[key]=null}}
function CTB_make(v,ids){LDW_reg();let B=ids.flatMap(id=>LD_br(id)).map(b=>{let c=b.c;if(v.rc&&v.rc[c])c=v.rc[c];if(c==='#ffffff')c='#fefefe';return c===b.c?b:{...b,c}});
 let wall=v.wall;if(!wall){const n={};for(const b of B){const Q=GB_PC[b.t];if(!Q||Q.h<3||/^[~*]/.test(b.c)||/^#(05131d|1b2a34|000000|6c6e68|595d60)$/i.test(b.c))continue;n[b.c]=(n[b.c]||0)+Q.w*Q.d*Q.h}wall=Object.keys(n).sort((a,b)=>n[b]-n[a])[0]}
 if(wall)B=B.map(b=>b.c===wall?{...b,c:'#ffffff'}:b);
 const lo=CR_LO;let G;CR_LO=2;try{G=GB_geo(B,null)}finally{CR_LO=lo}G.m=LD_cull(G.m,B);G.l=LD_cull(G.l,B);
 const SW=LD_SW*LD_FIG,box=new THREE.Box3(),gs=[G.m,G.l,G.g].filter(Boolean);for(const g of gs){g.computeBoundingBox();box.union(g.boundingBox)}const c=box.getCenter(new THREE.Vector3());
 let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const b of B){const Q=GB_PC[b.t];if(!Q||Q.h<3)continue;const w=b.r%2?Q.d:Q.w,d=b.r%2?Q.w:Q.d;x0=Math.min(x0,b.x);x1=Math.max(x1,b.x+w);z0=Math.min(z0,b.z);z1=Math.max(z1,b.z+d)}
 if(x0>x1){x0=box.min.x/GB_U;x1=box.max.x/GB_U;z0=box.min.z/GB_U;z1=box.max.z/GB_U}
 const X=new THREE.Matrix4().makeScale(SW,SW,SW).multiply(new THREE.Matrix4().makeTranslation(-c.x,-box.min.y,-c.z));for(const g of gs)g.applyMatrix4(X);
 const W=(box.max.x-box.min.x)*SW,D=(box.max.z-box.min.z)*SW,H=(box.max.y-box.min.y)*SW,q=Math.max(W/2,D/2,H)*1.001;
 const parts=[{g:G.m,col:new THREE.Color(1,1,1)}];if(G.g)parts.push({g:G.g,col:new THREE.Color(.25,.35,.45)});const sm=CID!=='fra'&&G.m.attributes.position.count<75000/* Athens small sets (< 25k tris): one clustered copy, no mid band (draw calls) */,mid=sm?null:WB_cluster(parts,.3),far=WB_cluster(parts,sm?.7:1.1);
 const tri=g=>(g.index?g.index.count:g.attributes.position.count)/3,K={v,W,D,H,q,wall:wall||'#f4f4f4',L:[],ims:[],
  tris:gs.reduce((a,g)=>a+tri(g),0),mtris:mid?tri(mid):0,ftris:tri(far),
  col:{ox:((x0+x1)/2*GB_U-c.x)*SW,oz:((z0+z1)/2*GB_U-c.z)*SW,hw:Math.max(.3,(x1-x0)*GB_U*SW/2-.2),hd:Math.max(.3,(z1-z0)*GB_U*SW/2-.2)}};
 // one near mesh per model (draw calls): lamps join the bricks, glass becomes opaque tinted panes (as in the far copies)
 const glass=G.g?(()=>{const g=G.g,n=g.attributes.position.count,c=new Float32Array(n*3);for(let i=0;i<n;i++)c.set([.2,.3,.4],i*3);g.setAttribute('color',new THREE.BufferAttribute(c,3));return g})():null;
 const keep=g=>{for(const k of Object.keys(g.attributes))if(k!=='position'&&k!=='color')g.deleteAttribute(k);return g.index?g.toNonIndexed():g};
 K.near=[[CTB_pack(mergeGeometries([G.m,G.l,glass].filter(Boolean).map(keep)),q),'m']];K.mid=mid&&CTB_pack(mid,q);K.far=CTB_pack(far,q);
 K.mb=[...K.near.map(p=>p[0]),K.mid,K.far].filter(Boolean).reduce((a,g)=>a+Object.values(g.attributes).reduce((s,x)=>s+x.array.byteLength,0),0)/1048576;return K}
const CTB_h=(x,z,s)=>{const v=Math.sin(x*12.9898+z*78.233+s*37.719)*43758.5453;return v-Math.floor(v)};
// weighted pick from a pool that fits (maxW along the street, maxD deep); not the same model twice in a row; 'gap' kinds spaced out
function CTB_pick(pool,x,z,i,maxW,maxD,prev){const tot=pool.reduce((a,v)=>a+v.w,0);let r=CTB_h(x,z,i)*tot,i0=0;for(;i0<pool.length-1;i0++)if((r-=pool[i0].w)<0)break;
 let alt=null;for(let t=0;t<pool.length;t++){const v=pool[(i0+t)%pool.length],K=CTB_kind(v);if(!K||K.W>maxW||K.D>maxD)continue;
  if(v.gap&&(CTB.cg[v.k]||[]).some(p=>Math.hypot(p[0]-x,p[1]-z)<v.gap))continue;if(K===prev){alt=alt||K;continue}return K}return alt}
// one row along the slot's street axis (local x), its front at local z = zf (the back row: the slot turned 180°, facing the street behind); returns the deepest set placed (0 = none)
function CTB_row(x,z,c,s,ry,w,zf,dmax,pool,seed,extra,pal){const row=[];let p=-w/2,i=0,prev=null;
 while(p<w/2-3&&i<10&&!(row.length&&w/2-p<5)){const K=CTB_pick(pool,x+p*c,z-p*s,seed+i++,w/2-p+1,dmax,prev);if(!K)break;row.push([K,p+K.W/2]);p+=K.W+.3;prev=K}
 if(!row.length)return 0;const sh=(w/2-p+.3)/2;let dd=0;
 for(const[K,lx0]of row){const lx=lx0+sh,lz=zf-K.D/2,px=x+lx*c+lz*s,pz=z-lx*s+lz*c,y=groundY(px,pz),a=ry+Math.PI;// set front (−z) → street (+z local)
  const pc=pal[Math.floor(CTB_h(px,pz,7)*pal.length)];K.L.push({x:px,z:pz,y,a,c:new THREE.Color(pc==='o'?K.wall:pc)});if(K.v.gap)(CTB.cg[K.v.k]=CTB.cg[K.v.k]||[]).push([px,pz]);
  const ca=Math.cos(a),sa=Math.sin(a);hubAddB({x:px+K.col.ox*ca+K.col.oz*sa,z:pz-K.col.ox*sa+K.col.oz*ca,hw:K.col.hw,hd:K.col.hd,h:y+K.H,ry:a,...(extra||{})});CTB.st.sets++;dd=Math.max(dd,K.D)}
 return dd}
// which side of a slot faces the street: +1 = local +z (nearest road found first in front), −1 = behind (slots of the Kenney frontage face either way)
function CTB_side(x,z,ry,d){const c=Math.cos(ry),s=Math.sin(ry);for(let r=1;r<40;r+=2)for(const sg of[1,-1]){const lz=sg*(d/2+r);for(const lx of[0,-3,3])if(FL_road(x+lx*c+lz*s,z-lx*s+lz*c,0))return sg}return 1}
// fill a slot (centre x,z; yaw ry; width w along the street, depth d; local +z = the street front). false = keep the old building.
function CTB_fill(x,z,ry,w,d,extra,pk){if(!CTB.on)return false;CTB.st.slots++;if(CTB.st.sz.length<4000)CTB.st.sz.push([+x.toFixed(0),+z.toFixed(0),+w.toFixed(1),+d.toFixed(1),+ry.toFixed(2)]);const V0=CTB_V[CTB_city()],V=pk&&V0[pk]?V0[pk]:V0;if(CTB_side(x,z,ry,d)<0)ry+=Math.PI;const c=Math.cos(ry),s=Math.sin(ry);
 const d1=CTB_row(x,z,c,s,ry,w,d/2,d+1,V.front,0,extra,V.pal);if(!d1){CTB.st.skip++;return false}
 const db=d-d1-.6;if(V.back.length&&db>=3.5){const n0=CTB.st.sets;CTB_row(x,z,-c,-s,ry+Math.PI,w,d/2,db+1,V.back,50,extra,V.pal);CTB.st.back+=CTB.st.sets-n0}return true}
// Frankfurt hook (putK in buildHubG): only the generic street buildings, never towers
function CTB_putK(nm,sc,x,z,ry,tint,bx,w,h,d){if(!bx||CID!=='fra'||!/^building-([a-m]|type-[a-z])$/.test(nm))return false;return CTB_fill(x,z,ry,w,d)}
// Athens hook (put in athBuildG): houses and villas of the plaka + villa districts, and (city-2) the old town around the start (Psyrri: neoclassical
// houses and apartment blocks → whitewashed modular cafés and houses). The ~60k suburban/outer units stay procedural (CPU + memory).
function CTB_put(U,x,z,ry){if(CID==='fra')return false;const sty=athStyleAt(x,z);if(sty==='old'){if(U.k!=='neo'&&U.k!=='poly')return false;return CTB_fill(x,z,ry,U.w+1.5,U.d+1,{ab:1},'old')}if(U.k!=='plaka'&&U.k!=='villa')return false;if(sty!=='plaka'&&sty!=='villa')return false;return CTB_fill(x,z,ry,U.w+1.5,U.d+1,{ab:1})}
// the instanced material: GB_MAT (glossy bricks) with flat shading (no normals stored) and the wall tint on pure-white vertices only
function CTB_mats(){if(CTB.mat)return;const m=GB_MAT.clone(),ob=GB_MAT.onBeforeCompile;m.flatShading=true;
 m.onBeforeCompile=(sh,r)=>{if(ob)ob.call(m,sh,r);sh.vertexShader=sh.vertexShader.replace('#include <color_vertex>','#include <color_vertex>\n#if defined(USE_COLOR) && defined(USE_INSTANCING_COLOR)\nvColor.xyz=min(color.r,min(color.g,color.b))>.995?color.xyz*instanceColor.xyz:color.xyz;\n#endif')};
 m.customProgramCacheKey=()=>'ctbw';CTB.mat=m;const g=CR_GM.clone();g.flatShading=true;CTB.gmat=g}
// meshes once the city is built; LOD + view sort every 6 frames
function CTB_mesh(){if(!HUB.grp)return;CTB_mats();for(const k in CTB.K){const K=CTB.K[k];if(!K||K.ims.length||!K.L.length)continue;const n=K.L.length;
  const mk=(g,mat,nm,col)=>{const im=new THREE.InstancedMesh(g,mat,n);im.count=0;im.frustumCulled=false;im.receiveShadow=true;im.name=nm+k;im.userData.keep=1;
   if(col)for(let j=0;j<n;j++)im.setColorAt(j,K.L[j].c);if(mat===CTB.gmat)im.renderOrder=2;HUB.grp.add(im);return im};
  K.nim=K.near.map(([g,t])=>mk(g,t==='m'?CTB.mat:t==='l'?GB_LMAT:CTB.gmat,'ctb_',t==='m'));K.mim=K.mid?mk(K.mid,CTB.mat,'ctbm_',1):null;K.fim=mk(K.far,CTB.mat,'ctbf_',1);K.ims=[...K.nim,K.mim,K.fim].filter(Boolean)}
 // per instance: matrix + linear wall colour once; a 64 m grid of [kind, instance] pairs, so a step visits only the cells in range
 CTB.KS=Object.values(CTB.K).filter(K=>K&&K.ims.length);CTB.G=new Map();const T=new THREE.Matrix4(),S=new THREE.Vector3();
 CTB.KS.forEach((K,ki)=>{const n=K.L.length;K.r=Math.max(K.W,K.D);K.M=new Float32Array(n*16);K.C=new Float32Array(n*3);S.set(K.q,K.q,K.q);
  K.L.forEach((o,j)=>{T.compose(_ctbP.set(o.x,o.y,o.z),_ctbQ.setFromAxisAngle(_ctbU,o.a),S);T.toArray(K.M,j*16);o.c.toArray(K.C,j*3);const g=Math.floor(o.x/CTB.CS)*65536+Math.floor(o.z/CTB.CS);let P=CTB.G.get(g);if(!P)CTB.G.set(g,P=[]);P.push(ki,j)})});
 CTB_step(1);if(!CTB.loop){CTB.loop=1;requestAnimationFrame(CTB_loop)}}
const _ctbM=new THREE.Matrix4(),_ctbQ=new THREE.Quaternion(),_ctbP=new THREE.Vector3(),_ctbS=new THREE.Vector3(),_ctbU=new THREE.Vector3(0,1,0),_ctbD=new THREE.Vector3();
function CTB_step(force){if(!force&&++CTB.t%6)return;const t0=performance.now();try{CTB_step1()}finally{const ms=performance.now()-t0;CTB.ms=CTB.ms?CTB.ms*.9+ms*.1:ms}}
function CTB_step1(){if(typeof camera==='undefined'||!CTB.G)return;const cx=camera.position.x,cz=camera.position.z;camera.getWorldDirection(_ctbD);const dl=Math.hypot(_ctbD.x,_ctbD.z)||1,fx=_ctbD.x/dl,fz=_ctbD.z/dl;
 const KS=CTB.KS,far=CTB.far,nd=CTB.nearD,md=CTB.midD,CS=CTB.CS,R=Math.ceil(far/CS),i0=Math.floor(cx/CS),j0=Math.floor(cz/CS);for(const K of KS)K.nn=K.nm=K.nf=0;
 const put=(im,n,K,j)=>{im.instanceMatrix.array.set(K.M.subarray(j*16,j*16+16),n*16);if(im.instanceColor)im.instanceColor.array.set(K.C.subarray(j*3,j*3+3),n*3)};
 for(let a=-R;a<=R;a++)for(let b=-R;b<=R;b++){const ex=(i0+a+.5)*CS-cx,ez=(j0+b+.5)*CS-cz,ed=Math.hypot(ex,ez);if(ed>far+CS*.71)continue;if(ed>CS*1.5&&ex*fx+ez*fz<-ed*.35-CS*.71)continue;// cell behind the camera
  const P=CTB.G.get((i0+a)*65536+(j0+b));if(!P)continue;
  for(let q=0;q<P.length;q+=2){const K=KS[P[q]],j=P[q+1],o=K.L[j],dx=o.x-cx,dz=o.z-cz,dd=Math.hypot(dx,dz);if(dd>far)continue;const r=K.r,f=dx*fx+dz*fz;if(dd>r+12&&f<-r-6&&f<-dd*.35)continue;
   if(dd<(K.mim?nd:nd*1.2)){for(const im of K.nim)put(im,K.nn,K,j);K.nn++}else if(K.mim&&dd<md)put(K.mim,K.nm++,K,j);else put(K.fim,K.nf++,K,j)}}
 for(const K of KS)for(const[im,n]of[...K.nim.map(im=>[im,K.nn]),[K.mim,K.nm],[K.fim,K.nf]]){if(!im)continue;im.count=n;im.visible=n>0;if(n){im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true}}}
buildRoam=(f=>function(){const r=f.apply(this,arguments);try{CTB_mesh()}catch(e){console.warn('CTB mesh',e)}return r})(buildRoam);
// own frame loop (hubCullStep does not run everywhere, e.g. Athens): LOD + view sort every 6 frames
function CTB_loop(){try{CTB_step()}catch(e){}requestAnimationFrame(CTB_loop)}
// the same sets as separate world props would be a second copy of their geometry: CTB's instances replace them (Corner Garage prop, v90a LDW props)
if(CTB.on){const i=LD_PROPS.findIndex(q=>q.id==='cgarage');if(i>=0)LD_PROPS.splice(i,1);
 LDW_build1=(f=>function(P){if(P&&CTB.K[P.model]&&CTB.K[P.model].L.length)return;return f.apply(this,arguments)})(LDW_build1)}
window.__ctb={CTB,scene:()=>scene,scam:(x,z)=>{let B=null,bd=1e9;for(const k in CTB.K){const K=CTB.K[k];if(K)for(const o of K.L){const d=Math.hypot(o.x-x,o.z-z);if(d<bd){bd=d;B={...o,D:K.D}}}}if(!B)return null;let fx=-Math.sin(B.a),fz=-Math.cos(B.a),sx=Math.cos(B.a),sz=-Math.sin(B.a),px=B.x,pz=B.z;for(let r=2;r<60;r+=1.5){let hit=0;for(const g of[1,-1]){const qx=B.x+fx*g*r,qz=B.z+fz*g*r;if(FL_road(qx,qz,-2)){px=qx+fx*g*2;pz=qz+fz*g*2;hit=1;break}}if(hit)break}const q=cityAt(px,pz);if(q&&q.p&&q.p.tx!=null){sx=q.p.tx;sz=q.p.tz;px=q.p.x;pz=q.p.z}const y=groundY(px,pz);return[px-sx*8,y+3,pz-sz*8,px+sx*60,y+3,pz+sz*60]},pos:()=>({x:RO.x,z:RO.z}),look:(bk,up,ah,ty)=>{const d=new THREE.Vector3();camera.getWorldDirection(d);const l=Math.hypot(d.x,d.z)||1,x=RO.x,z=RO.z,y=groundY(x,z);return[x-d.x/l*bk,y+up,z-d.z/l*bk,x+d.x/l*ah,y+ty,z+d.z/l*ah]},V:CTB_V,stat:()=>({...CTB.st,sz:undefined,ms:+(CTB.ms||0).toFixed(2),kinds:Object.values(CTB.K).filter(Boolean).map(K=>({k:K.v.k,n:K.L.length,W:+K.W.toFixed(1),D:+K.D.toFixed(1),H:+K.H.toFixed(1),wall:K.wall,tris:K.tris,mtris:K.mtris,ftris:K.ftris,mb:+K.mb.toFixed(2),near:K.nim?K.nim[0].count:0,mid:K.mim?K.mim.count:-1,far:K.fim?K.fim.count:0}))}),
 sz:()=>CTB.st.sz,near:()=>{let best=null;for(const k in CTB.K)if(CTB.K[k])for(const o of CTB.K[k].L){const d=Math.hypot(o.x-RO.x,o.z-RO.z);if(!best||d<best.d)best={k,d,...o,W:CTB.K[k].W,D:CTB.K[k].D,H:CTB.K[k].H}}return best},list:k=>CTB.K[k]?CTB.K[k].L:[]};
