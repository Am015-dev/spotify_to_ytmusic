// ---- CT (city-1, 2026-10-10). Alex: "now we have a big variety, we can include it in our city and replace buildings and cars".
// TRAFFIC: the procedural traffic kinds (CR_cityGeo) are swapped for the real LEGO sets converted from LDraw (LD_MODELS, models.js) and the
// hand-built 40468 taxi. A kind 'ld:<class>:<model>' keeps <class> in its name, so the per-class rules that read HCAR names (QS speeds, SC caps)
// still apply; the slot count stays the same, so draw calls stay the same (body + wheels + glass instanced per kind, 98wb far LOD on top).
// Each model is built once (CR_LO 2, hidden studs culled), at the players' car scale (LD_SW), width capped at SC_K.carW; collision = its own box
// (CT_dim, read by OB_cdim). A model missing from models.js (lazy load not finished) falls back to the old procedural kind (CT_FB).
const CT={geo:{},dim:{},fb:{},stat:[]};
// slot swaps (after QS/SU swaps): name → new kind. Frankfurt: 0 sedan,1 hypercar,2 taxi,3 van,4 truck,5 delivery,6 police,7 coupe,8 bus,9 tuner,10 roadster
const CT_SWAP={fra:{'sedan':'ld:car:v6633_1','su:t_sc_hy':'ld:car:v75878_1','taxi':'ld:car:tx','van':'ld:van:v7731_1',/* ride-1 (Alex v90j "this is not a car": the 3221 Big Rig showed as a hollow open trailer, cab missing, wheel sunk): 'truck' kept procedural until repaired */ /* rescue-1: Big Rig back; it keeps its lane via CT_wide below (v90e had dropped it: 3.84 m wide, lane fit unproven) */
  'delivery':'ld:delivery:v60054_1','police':'ld:police:v4436_1','su:t_sc_tm':'ld:car:v75893_1b'},
 ath:{'taxi':'ld:car:tx','sedan':'ld:car:v6633_1','van':'ld:van:v7639_1',/* su:t_sc_tm kept: swapping it together with the taxi added ~110 MB JS heap in Athens (cause open, docs/HANDOFF_city1.md) */'delivery':'ld:delivery:v60054_1','su:t_sc_hy':'ld:car:v75892_1'}};
if(!/[?&]ct=0/.test(location.search)){const S=CT_SWAP[CID==='fra'?'fra':'ath'];const ex=(location.search.match(/[?&]ctx=([^&]*)/)||[])[1]||'';/* test: ctx=<old kinds kept> */for(let i=0;i<HCAR.length;i++){const v=!ex.split(',').includes(HCAR[i])&&S[HCAR[i]];if(v){CT.fb[v]=HCAR[i];HCAR[i]=v}}}
// target body widths per class (m): Town sets are 4–6 studs wide, Speed Champions 8, so each is scaled uniformly to a road width
const CT_SC=LD_SCRE;// Speed Champions (shared rule, 98ld_import.js)
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
// ---- CT_wide (rescue-1): lane fit for traffic wider than a lane (the 3221 Big Rig, 3.84 m incl. mirrors). Traffic drives at c.lane × road width W
// off the centre line (.36 W), which puts a rig over the kerb or the centre line on roads under ~11 m. A wide kind instead: (1) drives at the offset that
// keeps it between the centre line (+.15 m) and the kerb (−.3 m), (2) only uses road segments wide enough for that (W ≥ 4·hw + 1), choosing its next
// segment among those (U-turn back the way it came at a dead end) and (3) spawns on one. Junction segments (W 0) keep lane 0 like every car.
const CT_WD={hw:1.3,st:{n:0,re:0,ut:0,bad:0}};
function CT_segW(N,a,b){const A=N[a],B=N[b];if(!A||!B)return 0;return A.ab||A.g||B.g?99:Math.min(A.w||20,B.w||20)}
function CT_wideHw(c){const n=HCAR[c.k],d=n&&CT.dim[n]&&CR_CG[n]?CT.dim[n]:null;return d&&d[0]>CT_WD.hw?d[0]:0}
function CT_wideOk(N,a,b,hw){return CT_segW(N,a,b)>=4*hw+1}
buildHubTraffic=(f=>function(){const r=f.apply(this,arguments);try{const N=HUB.nodes,C=HUB.cars;if(!N||!C)return r;const W=[];
 for(let i=0;i<N.ng;i++)for(const n of N[i].nb||[])if(n<N.ng&&CT_segW(N,i,n)>=9&&CT_segW(N,i,n)<99)W.push([i,n]);
 for(const c of C){const hw=CT_wideHw(c);if(!hw)continue;CT_WD.st.n++;if(!CT_wideOk(N,c.a,c.b,hw)&&W.length){const q=W[(c.j*7919+c.k*31)%W.length];c.a=q[0];c.b=q[1];c.t=.5;CT_WD.st.re++}c._wa=c.a}}catch(e){console.warn('CT wide',e)}return r})(buildHubTraffic);
hubTrafficStep=(f=>function(dt){const r=f.apply(this,arguments);try{const N=HUB.nodes,C=HUB.cars;if(!N||!C)return r;
 for(const c of C){const hw=CT_wideHw(c);if(!hw||c.route)continue;
  if(c.a!==c._wa){/* just turned onto a new segment: keep to wide roads */if(!CT_wideOk(N,c.a,c.b,hw)){const nx=(N[c.a].nb||[]).filter(n=>n<N.ng&&n!==c._wa&&CT_wideOk(N,c.a,n,hw)&&!QS_shut(c.a,n));
    if(nx.length)c.b=nx[(c.j+c.a)%nx.length];else{c.b=c._wa;CT_WD.st.ut++}}c._wa=c.a}
  const w=CT_segW(N,c.a,c.b);if(w>=99)continue;if(!CT_wideOk(N,c.a,c.b,hw))CT_WD.st.bad++;c.lane=Math.max((hw+.15)/w,Math.min(.36,.5-(hw+.3)/w))}}catch(e){}return r})(hubTrafficStep);
window.__ct={CT,swap:CT_SWAP,hcar:()=>HCAR.slice(),geo:nm=>CR_cityGeo(nm),r:()=>renderer,
 cars:()=>(HUB.cars||[]).filter(c=>!(c.dead>0)&&c.x!=null).map(c=>{const N=HUB.nodes,A=N[c.a],B=N[c.b];return{nm:HCAR[c.k],x:c.x,z:c.z,y:c.y||0,h:A&&B?Math.atan2(B.x-A.x,B.z-A.z):0,d:Math.hypot(c.x-RO.x,c.z-RO.z)}}).sort((a,b)=>a.d-b.d),
 wide:()=>{const N=HUB.nodes,o=[];for(const c of HUB.cars||[]){const hw=CT_wideHw(c);if(!hw)continue;const w=CT_segW(N,c.a,c.b);o.push({hw:+hw.toFixed(2),W:w,lane:+c.lane.toFixed(3),off:+(c.lane*w).toFixed(2),kerb:+(w/2-c.lane*w-hw).toFixed(2),mid:+(c.lane*w-hw).toFixed(2),x:c.x,z:c.z})}return{st:CT_WD.st,cars:o}},
 freeze:on=>{if(on){if(!CT.hts){CT.hts=hubTrafficStep;hubTrafficStep=()=>{}}}else if(CT.hts){hubTrafficStep=CT.hts;CT.hts=null}}};
// ---- CTB (city-1): BUILDINGS. The generic filler buildings (Frankfurt: the Kenney street rows/frontage via putK; Athens: the small 'plaka'
// houses and villas via put) become real LEGO sets at minifig scale (LD_SW × LD_FIG: a figure fits the door). A filler slot is filled along its
// street front with a row of sets that fit its width and depth (front flush with the slot's front = the old road setback), recoloured for variety.
// Colliders = each set's footprint of tall parts (oriented, like the Kenney boxes, so glancing hits slide the same way). Landmarks, towers, quest
// buildings and the existing LDraw props are untouched. Render: one InstancedMesh per model variant and material (near, full bricks) plus one
// far mesh per variant (vertex-clustered, ~5 % tris); every few frames the instances are re-sorted by distance and view direction.
const CTB={on:!/[?&]ctb=0/.test(location.search)/* art-5: default ON (ctb/fra-row, ctb/collide, ctb/perf pass; heap +13 MB fra, +5 MB ath); ?ctb=0 = the old Kenney/procedural rows */,K:{},near:70,far:520,st:{slots:0,sets:0,skip:0,by:{}},t:0,cg:[],pl:[]};
// model variants: id(s), recolour map (old hex → new hex), where. fra = Frankfurt rows; ath = Athens plaka/villa houses (whitewashed)
const CTB_V={fra:[
  {k:'bank',ids:['bank'],w:3},{k:'bank_t',ids:['bank'],w:2,rc:{'#b40000':'#e4cd9e','#f4f4f4':'#b40000'}},
  {k:'6372',ids:['w6372'],w:3},{k:'6372_r',ids:['w6372'],w:2,rc:{'#1e5aa8':'#b40000','#b40000':'#1b2a34'}},{k:'6372_g',ids:['w6372'],w:2,rc:{'#1e5aa8':'#00451a','#b40000':'#f4f4f4'}},
  {k:'6683',ids:['w6683'],w:1},{k:'cg',ids:['cga','cgb'],w:1,gap:260},
  /* art-5: more facade types for bv1 (≥ 3 per block): 6362 shop, 6374 Holiday Home, 4956 house (docs/HANDOFF_models4.md, RESCUE.md) */{k:'6362',ids:['w6362'],w:3},{k:'6374',ids:['w6374'],w:1},{k:'4956',ids:['w4956'],w:1}],
 ath:[{k:'6365_w',ids:['w6365'],w:3,rc:{'#fac80a':'#f4f4f4','#b40000':'#1e5aa8'}},{k:'6365_c',ids:['w6365'],w:1,rc:{'#fac80a':'#f2e3bd','#b40000':'#c8643c'}},
  {k:'6372_w',ids:['w6372'],w:2,rc:{'#1e5aa8':'#f4f4f4','#b40000':'#1e5aa8'}},{k:'6402',ids:['w6402'],w:1}]};
function CTB_city(){return CID==='fra'?'fra':'ath'}
// art-5: the sets must be in before the city builds (at build time models.js had not loaded them, so 3219 of 3219 Frankfurt slots fell back to
// Kenney). Prefetch both cities' sets at boot; roamLoad waits for the current city's chunks (a few hundred KB, usually already in) before buildHubG.
function CTB_ids(c){return[...new Set(CTB_V[c||CTB_city()].flatMap(v=>v.ids))]}
if(CTB.on)try{LD_need(CTB_ids('fra').concat(CTB_ids('ath')))}catch(e){}
roamLoad=(f=>async function(){if(CTB.on&&!HUB.built){const t=performance.now();try{await Promise.race([LD_need(CTB_ids()),new Promise(r=>setTimeout(r,15000))])}catch(e){}CTB.wait=Math.round(performance.now()-t)}return f.apply(this,arguments)})(roamLoad);
// footprint + geometry of a variant, built once (first slot that wants it): near [[geo,mat]], far geo, size, collider box in the set's frame
function CTB_kind(v){if(CTB.K[v.k])return CTB.K[v.k];if(!v.ids.every(id=>LD_MODELS[id]))return null;LDW_reg();
 let B=v.ids.flatMap(id=>LD_br(id));if(v.rc)B=B.map(b=>v.rc[b.c]?{...b,c:v.rc[b.c]}:b);
 const SW=LD_SW*LD_FIG,lo=CR_LO;let G;CR_LO=2;try{G=GB_geo(B,null)}finally{CR_LO=lo}G.m=LD_cull(G.m,B);G.l=LD_cull(G.l,B);
 const near=[[G.m,GB_MAT],[G.l,GB_LMAT],[G.g,CR_GM]].filter(q=>q[0]);const box=new THREE.Box3();for(const[g]of near){g.computeBoundingBox();box.union(g.boundingBox)}const c=box.getCenter(new THREE.Vector3());
 let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const b of B){const Q=GB_PC[b.t];if(!Q||Q.h<3)continue;const w=b.r%2?Q.d:Q.w,d=b.r%2?Q.w:Q.d;x0=Math.min(x0,b.x);x1=Math.max(x1,b.x+w);z0=Math.min(z0,b.z);z1=Math.max(z1,b.z+d)}
 if(x0>x1){x0=box.min.x/GB_U;x1=box.max.x/GB_U;z0=box.min.z/GB_U;z1=box.max.z/GB_U}
 const X=new THREE.Matrix4().makeScale(SW,SW,SW).multiply(new THREE.Matrix4().makeTranslation(-c.x,-box.min.y,-c.z));
 const strip=g=>{for(const k of Object.keys(g.attributes))if(!['position','normal','color'].includes(k))g.deleteAttribute(k);return g};
 for(const[g]of near){strip(g).applyMatrix4(X);g.computeBoundingSphere()}
 const parts=[{g:G.m,col:new THREE.Color(1,1,1)}];if(G.g)parts.push({g:G.g,col:new THREE.Color(.25,.35,.45)});const far=WB_cluster(parts,.45);
 const W=(box.max.x-box.min.x)*SW,D=(box.max.z-box.min.z)*SW,H=(box.max.y-box.min.y)*SW;
 const col={ox:((x0+x1)/2*GB_U-c.x)*SW,oz:((z0+z1)/2*GB_U-c.z)*SW,hw:Math.max(.3,(x1-x0)*GB_U*SW/2-.2),hd:Math.max(.3,(z1-z0)*GB_U*SW/2-.2)};
 const tri=g=>(g.index?g.index.count:g.attributes.position.count)/3;
 return CTB.K[v.k]={v,near,far,W,D,H,col,L:[],ims:[],fim:null,tris:near.reduce((a,[g])=>a+tri(g),0),ftris:tri(far)}}
const CTB_h=(x,z,s)=>{const v=Math.sin(x*12.9898+z*78.233+s*37.719)*43758.5453;return v-Math.floor(v)};
function CTB_pick(x,z,i,maxW,maxD,row){const V=CTB_V[CTB_city()],tot=V.reduce((a,v)=>a+v.w,0);let r=CTB_h(x,z,i)*tot;
 if(CID==='fra'&&typeof BV_near==='function'&&BV.on){/* art-5: the LEGO family least used nearby (bv1: ≥ 3 facade types per block, no street of one look) */const n=BV_near(x,z,100,'fac'),N=BV_near(x,z,45,'fac'),rn=v=>(row||[]).filter(q=>q[0].v.ids[0]===v.ids[0]).length,sc=v=>{const f='lego:'+v.ids[0];return((n[f]||0)+3*(N[f]||0)+6*rn(v))/v.w+CTB_h(x,z,i+V.indexOf(v))*.9};/* + this slot's row so far */
  for(const v of V.slice().sort((p,q)=>sc(p)-sc(q))){const K=CTB_kind(v);if(!K||K.W>maxW||K.D>maxD+1)continue;if(v.gap&&(rn(v)||CTB.cg.some(p=>Math.hypot(p[0]-x,p[1]-z)<v.gap)))continue;return K}return null}
 for(let t=0;t<V.length;t++){const v=V[(t+V.findIndex(q=>(r-=q.w)<0)+V.length)%V.length];const K=CTB_kind(v);if(!K||K.W>maxW||K.D>maxD+1)continue;
  if(v.gap&&CTB.cg.some(p=>Math.hypot(p[0]-x,p[1]-z)<v.gap))continue;return K}return null}
// fill a slot (centre x,z; yaw ry; width w along the street, depth d; local +z = the street front). Returns false = keep the old building.
function CTB_fill(x,z,ry,w,d,h0,extra){if(!CTB.on)return false;CTB.st.slots++;const c=Math.cos(ry),s=Math.sin(ry),row=[];let p=-w/2,i=0;
 while(p<w/2-3&&i<8&&!(row.length&&w/2-p<7)){const K=CTB_pick(x+p,z,i++,w/2-p,d,row);if(!K)break;row.push([K,p+K.W/2]);p+=K.W+.4}
 if(!row.length){CTB.st.skip++;return false}const sh=(w/2-p)/2;// centre the row in the slot
 const P=[];for(const[K,lx0]of row){const lx=lx0+sh,lz=d/2-K.D/2,px=x+lx*c+lz*s,pz=z-lx*s+lz*c;let g0=1e9,g1=-1e9;// art-5: on a slope the set sits at its HIGH corner on a grey plinth down to the low one (never sunk or floating); a slope over 3 m keeps the old building
  for(const[u,v]of[[-1,-1],[1,-1],[1,1],[-1,1],[0,0]]){const ux=u*K.W/2,uz=v*K.D/2,g=groundY(px+ux*c+uz*s,pz-ux*s+uz*c);g0=Math.min(g0,g);g1=Math.max(g1,g)}if(g1-g0>3){CTB.st.slope=(CTB.st.slope||0)+1;CTB.st.skip++;return false}P.push([K,px,pz,g1,g1-g0])}
 for(const[K,px,pz,y,ph]of P){const a=ry+Math.PI;// set front (−z) → street (+z local)
  const o={x:px,z:pz,y,a,ph};if(ph>.12)CTB.pl.push([o,K,ph+.15]);if(CID==='fra')try{BV_add(px,pz,'ctb:'+K.v.k,'lego:'+K.v.ids[0],{ry,w:K.W,d:K.D,h:K.H,ctb:1,yb:y})}catch(e){}/* art-5: bv1 variety + street life see the sets (Athens slots are already registered by CV_put) */K.L.push(o);if(K.v.gap)CTB.cg.push([px,pz]);const ca=Math.cos(a),sa=Math.sin(a);
  o.b=hubAddB({x:px+K.col.ox*ca+K.col.oz*sa,z:pz-K.col.ox*sa+K.col.oz*ca,hw:K.col.hw,hd:K.col.hd,h:y+K.H,ry:a,...(extra||{})});CTB.st.sets++}return true}
// Frankfurt hook (putK in buildHubG): only the generic street buildings, never towers
function CTB_putK(nm,sc,x,z,ry,tint,bx,w,h,d){if(!bx||CID!=='fra'||!/^building-([a-m]|type-[a-z])$/.test(nm))return false;return CTB_fill(x,z,ry,w,d,h)}
// Athens hook (put in athBuildG): small old-town houses and villas
function CTB_put(U,x,z,ry){if(CID==='fra'||(U.k!=='plaka'&&U.k!=='villa'))return false;const sty=athStyleAt(x,z);CTB.st.by[sty]=(CTB.st.by[sty]||0)+1;if(sty!=='plaka'&&sty!=='villa')return false;/* old town + villa districts (the 13k suburban 'town' houses stay procedural: CPU + memory) */return CTB_fill(x,z,ry,U.w+1.5,U.d+1,0,{ab:1})}
// meshes once the city is built; LOD + view sort every 6 frames
// plinths (art-5): one static instanced box, light bluish grey, under every set on a slope
function CTB_plinth(){if(CTB.pim||!CTB.pl.length)return;const g=new THREE.BoxGeometry(1,1,1);g.translate(0,-.5,0);const im=new THREE.InstancedMesh(g,new THREE.MeshStandardMaterial({color:'#a0a5a9',roughness:.85}),CTB.pl.length);
 im.name='ctb_plinth';im.receiveShadow=true;im.userData.keep=1;const S=new THREE.Vector3();CTB.pl.forEach(([o,K,h],i)=>{_ctbM.compose(_ctbP.set(o.x,o.y+.02,o.z),_ctbQ.setFromAxisAngle(_ctbU,o.a),S.set(K.W,h,K.D));im.setMatrixAt(i,_ctbM)});
 im.computeBoundingSphere();HUB.grp.add(im);CTB.pim=im}
function CTB_mesh(){if(!HUB.grp)return;for(const k in CTB.K){const K=CTB.K[k];if(K.ims.length||!K.L.length)continue;const n=K.L.length;
  for(const[g,mat]of K.near){const im=new THREE.InstancedMesh(g,mat,n);im.count=0;im.frustumCulled=false;im.receiveShadow=true;im.name='ctb_'+k;if(mat===CR_GM)im.renderOrder=2;im.userData.keep=1;HUB.grp.add(im);K.ims.push(im)}
  const f=new THREE.InstancedMesh(K.far,K.near[0][1],n);f.count=0;f.frustumCulled=false;f.name='ctbf_'+k;f.userData.keep=1;HUB.grp.add(f);K.fim=f}CTB_plinth();CTB_step(1)}
const _ctbM=new THREE.Matrix4(),_ctbQ=new THREE.Quaternion(),_ctbP=new THREE.Vector3(),_ctbS=new THREE.Vector3(1,1,1),_ctbU=new THREE.Vector3(0,1,0),_ctbD=new THREE.Vector3();
function CTB_step(force){if(!force&&++CTB.t%6)return;if(typeof camera==='undefined')return;const cx=camera.position.x,cz=camera.position.z;camera.getWorldDirection(_ctbD);const dl=Math.hypot(_ctbD.x,_ctbD.z)||1,fx=_ctbD.x/dl,fz=_ctbD.z/dl;
 for(const k in CTB.K){const K=CTB.K[k];if(!K.fim)continue;let nn=0,nf=0;const r=Math.max(K.W,K.D);
  for(const o of K.L){const dx=o.x-cx,dz=o.z-cz,dd=Math.hypot(dx,dz);if(dd>CTB.far||(dd>r+12&&(dx*fx+dz*fz)<-r-6&&(dx*fx+dz*fz)<-dd*.35))continue;// behind the camera
   _ctbM.compose(_ctbP.set(o.x,o.y,o.z),_ctbQ.setFromAxisAngle(_ctbU,o.a),_ctbS);if(dd<CTB.near){for(const im of K.ims)im.setMatrixAt(nn,_ctbM);nn++}else K.fim.setMatrixAt(nf++,_ctbM)}
  for(const im of K.ims){im.count=nn;im.instanceMatrix.needsUpdate=true}K.fim.count=nf;K.fim.instanceMatrix.needsUpdate=true}}
buildRoam=(f=>function(){const r=f.apply(this,arguments);try{CTB_mesh()}catch(e){console.warn('CTB mesh',e)}return r})(buildRoam);
hubCullStep=(f=>function(){f.apply(this,arguments);try{CTB_step()}catch(e){}})(hubCullStep);
// ---- tests (art-5): ctb/fra-row, ctb/collide, ctb/perf (src/99c_checklist.js). Each GO parks the car at a fixed row of sets (nearest a fixed
// origin with ≥ 3 sets within 40 m and a free road spot in front), so every run checks the same place.
function CTB_all(){const A=[];for(const k in CTB.K)for(const o of CTB.K[k].L)A.push([o,CTB.K[k]]);return A}
// street normal of a set (front → road) and the road spot d m in front of its facade
function CTB_front(o,K,d){const nx=-Math.sin(o.a),nz=-Math.cos(o.a);return{nx,nz,x:o.x+nx*(K.D/2+d),z:o.z+nz*(K.D/2+d)}}
function CTB_spot(d){const A=CTB_all();if(!A.length)return null;const O=CID==='fra'?{x:0,z:0}:{x:0,z:-600};A.sort((p,q)=>Math.hypot(p[0].x-O.x,p[0].z-O.z)-Math.hypot(q[0].x-O.x,q[0].z-O.z));
 for(const[o,K]of A.slice(0,4000)){if(K.v.gap)continue;const n=A.filter(([q])=>Math.hypot(q.x-o.x,q.z-o.z)<40).length;if(n<3)continue;let dd=d;if(!dd){/* row view: 2.5 m onto the asphalt */for(let t=1;t<=14&&!dd;t+=.5){const P=CTB_front(o,K,t);if(CTB_onRoad(P.x,P.z))dd=t+2.5}if(!dd)continue}const F=CTB_front(o,K,dd);
  if(!LF_onRoad(F.x,F.z)||roamHit(F.x,F.z,1.4,groundY(F.x,F.z)+.5))continue;let ok=true;/* clear run to the facade */for(let t=dd;t>1.5&&ok;t-=.5){const b=roamHit(o.x+F.nx*(K.D/2+t),o.z+F.nz*(K.D/2+t),1,groundY(F.x,F.z)+.5);if(b&&b!==o.b)ok=false}
  if(ok)return{o,K,F}}return null}
function CTB_park(S,h){try{OF_reset()}catch(e){}if(RO.wk){RO.wk=null;try{RBRK.visible=false;pl.mesh.visible=true}catch(e){}}roamWarp(S.F.x,S.F.z,h,true);RO.x=S.F.x;RO.z=S.F.z;RO.h=RO.vh=h;RO.v=0;CTB_step(1)}
// on the asphalt itself (no margin: the old Kenney fronts sit at the same slot front)
function CTB_onRoad(x,z){const q=cityAt(x,z);if(q&&q.d<q.road.w/2)return 1;const f=fillAt(x,z);if(f&&f.d<f.r.w/2)return 1;const a=abAt(x,z);return a&&a.d<a.road.w/2?1:0}
const CTB_off=()=>CTB.on?'':'📍 PENDING · LEGO-set buildings are OFF (?ctb=0) ❌';
const CTB_box=(o,K,sh)=>{const c=Math.cos(o.a),s=Math.sin(o.a),C=K.col,cx=o.x+C.ox*c+C.oz*s,cz=o.z-C.ox*s+C.oz*c,P=[];for(const[u,v]of[[-1,-1],[1,-1],[1,1],[-1,1],[0,-1]]){const lx=u*(C.hw-sh),lz=v*(C.hd-sh);P.push([cx+lx*c+lz*s,cz-lx*s+lz*c])}return P};
// ctb/fra-row: a street of sets, near LOD drawn, every footprint off the road, sitting on the ground
function CTB_goRow(say){const off=CTB_off();if(off)return off;if(state!=='roam'||!RO.on)return'📍 Start free roam first';const S=CTB_spot(0);if(!S)return'📍 no row of LEGO sets with a free street spot ❌';
 CTB_park(S,S.o.a+1.1);setTimeout(()=>{CTB_step(1);/* camera has followed the car */const N=CTB_all().filter(([q])=>Math.hypot(q.x-RO.x,q.z-RO.z)<50);let road=0,gmax=0,near=0;
 for(const[q,K]of N){for(const[x,z]of CTB_box(q,K,.3))if(CTB_onRoad(x,z))road++;const c=Math.cos(q.a),s=Math.sin(q.a);for(const[u,v]of[[-1,-1],[1,-1],[1,1],[-1,1]]){const lx=u*K.W/2,lz=v*K.D/2,g=groundY(q.x+lx*c+lz*s,q.z-lx*s+lz*c);gmax=Math.max(gmax,g-q.y,q.ph>.12?0:q.y-g)}}/* sunk anywhere, or floating without a plinth */
 for(const k in CTB.K)near+=CTB.K[k].ims[0]?CTB.K[k].ims[0].count:0;const kinds=new Set(N.map(([,K])=>K.v.k)).size,ok=N.length>=3&&near>=3&&road===0&&gmax<=.15&&kinds>=2;
 window.__chk=window.__chk||{};window.__chk.ctbRow={n:N.length,near,kinds,road,gmax:+gmax.toFixed(2),ok};
 say(`📍 LEGO STREET: ${N.length} sets within 50 m (${kinds} looks), ${near} drawn full-detail, ${road} footprint corners on the road, sunk/floating ≤ ${gmax.toFixed(2)} m (≤ 0.15) `+(ok?'✅':'❌'))},600);return'📍 LEGO STREET · measuring…'}
// ctb/collide: drive (real gas) head-on into a set: the car stops at the facade (no pass-through, no invisible wall)
function CTB_goHit(say){const off=CTB_off();if(off)return off;if(state!=='roam'||!RO.on)return'📍 Start free roam first';const S=CTB_spot(16);if(!S)return'📍 no set with a clear 16 m run ❌';
 const{o,F}=S,KK=S.K;CTB_park(S,Math.atan2(-F.nx,-F.nz));const pd=()=>(RO.x-o.x)*F.nx+(RO.z-o.z)*F.nz-KK.D/2;/* car centre ↔ visual facade plane */let mn=1e9,vmax=0,inb=0;K.ArrowUp=true;const t0=performance.now();
 const iv=setInterval(()=>{const d=pd();mn=Math.min(mn,d);vmax=Math.max(vmax,Math.abs(RO.v)*3.6);if(bHit(o.b,RO.x,RO.z,0))inb++;if(performance.now()-t0<5000)return;/* 5 s of gas: at a low frame rate the first contact stops it a step short; it creeps to the wall */clearInterval(iv);K.ArrowUp=false;
  const ok=vmax>=25&&mn>=.8&&mn<=3.6&&!inb;window.__chk=window.__chk||{};window.__chk.ctbHit={vmax:+vmax.toFixed(0),mn:+mn.toFixed(2),inb,ok};
  say(`📍 LEGO WALL: hit at up to ${vmax.toFixed(0)} km/h, car centre stopped ${mn.toFixed(2)} m from the facade (0.8–3.6), ${inb} frames inside `+(ok?'✅':'❌'))},16);return'📍 LEGO WALL · driving at the set…'}
// ctb/perf: at the row, frame time + draw calls with the sets drawn vs hidden, plus their GPU memory and per-frame CPU
function CTB_goPerf(say){const off=CTB_off();if(off)return off;if(state!=='roam'||!RO.on)return'📍 Start free roam first';const S=CTB_spot(0);if(!S)return'📍 no row ❌';CTB_park(S,S.o.a+1.1);
 const M=[];for(const k in CTB.K){const K=CTB.K[k];M.push(...K.ims);K.fim&&M.push(K.fim)}const R=renderer,ar=R.info.autoReset;
 const fr=vis=>{for(const m of M)m.visible=vis;const T=[];let calls=0,tris=0;for(let i=0;i<3;i++){R.info.autoReset=false;R.info.reset();const t=performance.now(),q=typeof TQ!=='undefined'?TQ:null;/* test mode draws only on TQ.draw */if(q)q.draw=1;try{composer.render()}finally{if(q)q.draw=0}T.push(performance.now()-t);calls=R.info.render.calls;tris=R.info.render.triangles}R.info.autoReset=ar;T.shift();return{ms:Math.min(...T),calls,tris}};
 let a,b;try{fr(true);/* warm-up: compiles the sets' programs */a=fr(false);b=fr(true);for(let r=0;r<2;r++){const a2=fr(false),b2=fr(true);a.ms=Math.min(a.ms,a2.ms);b.ms=Math.min(b.ms,b2.ms)}}finally{for(const m of M)m.visible=true}
 let mb=0;const seen=new Set();for(const k in CTB.K){const K=CTB.K[k];for(const g of[...K.near.map(q=>q[0]),K.far])if(g&&!seen.has(g)){seen.add(g);for(const n in g.attributes)mb+=g.attributes[n].array.byteLength;if(g.index)mb+=g.index.array.byteLength}for(const m of[...K.ims,K.fim])if(m)mb+=m.instanceMatrix.array.byteLength}mb/=1048576;
 const t=performance.now();for(let i=0;i<20;i++)CTB_step(1);const cpu=(performance.now()-t)/20/6;/* step runs every 6 frames */
 const df=(b.ms/a.ms-1)*100,dc=b.calls-a.calls,ok=df<=15&&dc<=40&&mb<=60&&cpu<=.5;window.__chk=window.__chk||{};window.__chk.ctbPerf={off:a,on:b,df:+df.toFixed(1),dc,mb:+mb.toFixed(1),cpu:+cpu.toFixed(3),ok};
 return`📍 LEGO STREET PERF: frame ${df>=0?'+':''}${df.toFixed(1)} % (≤ 15), +${dc} draw calls (≤ 40), ${(b.tris/1e3).toFixed(0)}k tris, sets' GPU memory ${mb.toFixed(1)} MB (≤ 60), sort ${cpu.toFixed(2)} ms/frame (≤ 0.5) `+(ok?'✅':'❌')}
window.__ctb={go:{row:s=>CTB_goRow(s),hit:s=>CTB_goHit(s),perf:s=>CTB_goPerf(s)},spot:CTB_spot,CTB,pos:()=>({x:RO.x,z:RO.z}),V:CTB_V,stat:()=>({...CTB.st,kinds:Object.values(CTB.K).map(K=>({k:K.v.k,n:K.L.length,W:+K.W.toFixed(1),D:+K.D.toFixed(1),H:+K.H.toFixed(1),tris:K.tris,ftris:K.ftris,near:K.ims[0]?K.ims[0].count:0,far:K.fim?K.fim.count:0}))}),
 near:()=>{let best=null;for(const k in CTB.K)for(const o of CTB.K[k].L){const d=Math.hypot(o.x-RO.x,o.z-RO.z);if(!best||d<best.d)best={k,d,...o,W:CTB.K[k].W,D:CTB.K[k].D,H:CTB.K[k].H}}return best},list:k=>CTB.K[k]?CTB.K[k].L:[]};
