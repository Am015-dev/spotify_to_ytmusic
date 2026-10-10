// ---- CT (city-1, 2026-10-10). Alex: "now we have a big variety, we can include it in our city and replace buildings and cars".
// TRAFFIC: the procedural traffic kinds (CR_cityGeo) are swapped for the real LEGO sets converted from LDraw (LD_MODELS, models.js) and the
// hand-built 40468 taxi. A kind 'ld:<class>:<model>' keeps <class> in its name, so the per-class rules that read HCAR names (QS speeds, SC caps)
// still apply; the slot count stays the same, so draw calls stay the same (body + wheels + glass instanced per kind, 98wb far LOD on top).
// Each model is built once (CR_LO 2, hidden studs culled), at the players' car scale (LD_SW), width capped at SC_K.carW; collision = its own box
// (CT_dim, read by OB_cdim). A model missing from models.js (lazy load not finished) falls back to the old procedural kind (CT_FB).
const CT={geo:{},dim:{},fb:{},stat:[]};
// slot swaps (after QS/SU swaps): name → new kind. Frankfurt: 0 sedan,1 hypercar,2 taxi,3 van,4 truck,5 delivery,6 police,7 coupe,8 bus,9 tuner,10 roadster
const CT_SWAP={fra:{'sedan':'ld:car:v75893_1b','su:t_sc_hy':'ld:car:v75878_1','taxi':'ld:car:tx','van':'ld:van:v7731_1','truck':'ld:truck:v3221_1',
  'delivery':'ld:delivery:v60054_1','police':'ld:police:v4436_1','su:t_sc_tm':'ld:car:v75893_1a'},
 ath:{'taxi':'ld:car:tx','sedan':'ld:car:v75893_1b','van':'ld:van:v7639_1','su:t_sc_tm':'ld:car:v75893_1a','delivery':'ld:delivery:v60054_1','su:t_sc_hy':'ld:car:v75892_1'}};
if(!/[?&]ct=0/.test(location.search)){const S=CT_SWAP[CID==='fra'?'fra':'ath'];for(let i=0;i<HCAR.length;i++){const v=S[HCAR[i]];if(v){CT.fb[v]=HCAR[i];HCAR[i]=v}}}
// target body widths per class (m): Town sets are 4–6 studs wide, Speed Champions 8, so each is scaled uniformly to a road width
const CT_W={tx:1.72/* 6-wide 40468: keep its height near the others */,car:1.9,police:1.95,van:2.1,delivery:2.2,truck:2.4};
function CT_bricks(src){if(src==='tx')return typeof TX_CAR==='function'?GAR_arr(TX_CAR()):[];return LD_MODELS[src]?LD_br(src):[]}
function CT_build(nm){const src=nm.split(':')[2],B=CT_bricks(src).filter(b=>!['drv','drvR','stw','fig','flag'].includes(b.t));if(!B.length)return null;
 const lo=CR_LO;let G=null;for(const lv of[2,3,0]){CR_LO=lv;try{G=GB_geo(B,null)}catch(e){G=null}finally{CR_LO=lo}if(G&&G.m)break}if(!G||!G.m)return null;/* the 40468 taxi's printed parts have no LO-2 builder: next level */G.m=LD_cull(G.m,B);G.l=LD_cull(G.l,B);
 const Wg=(G.w||[]).map(w=>{const g=CR_wheel(w.t).clone();g.translate(w.o.x,w.o.y,w.o.z);return g});if(!G.m||!Wg.length)return null;
 const strip=g=>{if(!g)return g;for(const k of Object.keys(g.attributes))if(!['position','normal','color'].includes(k))g.deleteAttribute(k);return g.index?g.toNonIndexed():g};
 const body=mergeGeometries([G.m,G.l].filter(Boolean).map(strip)),wheels=mergeGeometries(Wg.map(strip)),glass=G.g?strip(G.g):null;
 const box=new THREE.Box3().setFromBufferAttribute(body.attributes.position),bw=new THREE.Box3().setFromBufferAttribute(wheels.attributes.position),y0=Math.min(box.min.y,bw.min.y),
  cx=(box.min.x+box.max.x)/2,cz=(box.min.z+box.max.z)/2,s=(CT_W[src]||CT_W[nm.split(':')[1]]||1.9)/(box.max.x-box.min.x);
 for(const g of[body,wheels,glass].filter(Boolean)){g.translate(-cx,-y0,-cz);g.scale(s,s,s);g.rotateY(Math.PI);g.translate(0,.04,0);g.computeBoundingBox();g.computeBoundingSphere()}
 const W=(box.max.x-box.min.x)*s,L=(box.max.z-box.min.z)*s,H=(box.max.y-y0)*s;CT.dim[nm]=[W/2,L/2];if(SC_K.carL)SC_K.carL[nm]=L+.1;
 const tri=g=>g?(g.index?g.index.count:g.attributes.position.count)/3:0;CT.stat.push({nm,W:+W.toFixed(2),L:+L.toFixed(2),H:+H.toFixed(2),tris:tri(body)+tri(wheels)+tri(glass)});
 return{body,wheels,glass}}
CR_cityGeo=(f=>function(nm){if(!nm||!nm.startsWith('ld:'))return f(nm);if(CR_CG[nm]!==undefined)return CR_CG[nm];let G=null;try{G=CT_build(nm)}catch(e){console.warn('CT traffic',nm,e)}
 if(!G){const fb=CT.fb[nm];return fb?f(fb):null}return CR_CG[nm]=G})(CR_cityGeo);
// real set colours: no per-instance paint (the cab material tints only pure-white bricks, which would repaint e.g. the patrol car's white body)
CR_cityPost=(f=>function(im,nm,k,n){f(im,nm,k,n);if(!nm||!nm.startsWith('ld:')||!CR_CG[nm])return;const c=new THREE.Color('#ffffff');for(let j=0;j<n;j++)im.setColorAt(j,c);im.instanceColor&&(im.instanceColor.needsUpdate=true)})(CR_cityPost);
// collision half sizes [half width, half length] of a kind, from its own model (OB_cdim reads this first)
function CT_dim(k){const n=HCAR[k];return n&&CT.dim[n]&&CR_CG[n]?CT.dim[n]:null}
window.__ct={CT,swap:CT_SWAP,hcar:()=>HCAR.slice(),geo:nm=>CR_cityGeo(nm),r:()=>renderer,
 cars:()=>(HUB.cars||[]).filter(c=>!(c.dead>0)&&c.x!=null).map(c=>{const N=HUB.nodes,A=N[c.a],B=N[c.b];return{nm:HCAR[c.k],x:c.x,z:c.z,y:c.y||0,h:A&&B?Math.atan2(B.x-A.x,B.z-A.z):0,d:Math.hypot(c.x-RO.x,c.z-RO.z)}}).sort((a,b)=>a.d-b.d),
 freeze:on=>{if(on){if(!CT.hts){CT.hts=hubTrafficStep;hubTrafficStep=()=>{}}}else if(CT.hts){hubTrafficStep=CT.hts;CT.hts=null}}};
// ---- CTB (city-1): BUILDINGS. The generic filler buildings (Frankfurt: the Kenney street rows/frontage via putK; Athens: the small 'plaka'
// houses and villas via put) become real LEGO sets at minifig scale (LD_SW × LD_FIG: a figure fits the door). A filler slot is filled along its
// street front with a row of sets that fit its width and depth (front flush with the slot's front = the old road setback), recoloured for variety.
// Colliders = each set's footprint of tall parts (oriented, like the Kenney boxes, so glancing hits slide the same way). Landmarks, towers, quest
// buildings and the existing LDraw props are untouched. Render: one InstancedMesh per model variant and material (near, full bricks) plus one
// far mesh per variant (vertex-clustered, ~5 % tris); every few frames the instances are re-sorted by distance and view direction.
const CTB={on:!/[?&]ctb=0/.test(location.search),K:{},near:70,far:520,st:{slots:0,sets:0,skip:0,by:{}},t:0,cg:[]};
// model variants: id(s), recolour map (old hex → new hex), where. fra = Frankfurt rows; ath = Athens plaka/villa houses (whitewashed)
const CTB_V={fra:[
  {k:'bank',ids:['bank'],w:3},{k:'bank_t',ids:['bank'],w:2,rc:{'#b40000':'#e4cd9e','#f4f4f4':'#b40000'}},
  {k:'6372',ids:['w6372'],w:3},{k:'6372_r',ids:['w6372'],w:2,rc:{'#1e5aa8':'#b40000','#b40000':'#1b2a34'}},{k:'6372_g',ids:['w6372'],w:2,rc:{'#1e5aa8':'#00451a','#b40000':'#f4f4f4'}},
  {k:'6683',ids:['w6683'],w:1},{k:'cg',ids:['cga','cgb'],w:1,gap:260}],
 ath:[{k:'6365_w',ids:['w6365'],w:3,rc:{'#fac80a':'#f4f4f4','#b40000':'#1e5aa8'}},{k:'6365_c',ids:['w6365'],w:1,rc:{'#fac80a':'#f2e3bd','#b40000':'#c8643c'}},
  {k:'6372_w',ids:['w6372'],w:2,rc:{'#1e5aa8':'#f4f4f4','#b40000':'#1e5aa8'}},{k:'6402',ids:['w6402'],w:1}]};
function CTB_city(){return CID==='fra'?'fra':'ath'}
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
function CTB_pick(x,z,i,maxW,maxD){const V=CTB_V[CTB_city()],tot=V.reduce((a,v)=>a+v.w,0);let r=CTB_h(x,z,i)*tot;
 for(let t=0;t<V.length;t++){const v=V[(t+V.findIndex(q=>(r-=q.w)<0)+V.length)%V.length];const K=CTB_kind(v);if(!K||K.W>maxW||K.D>maxD+1)continue;
  if(v.gap&&CTB.cg.some(p=>Math.hypot(p[0]-x,p[1]-z)<v.gap))continue;return K}return null}
// fill a slot (centre x,z; yaw ry; width w along the street, depth d; local +z = the street front). Returns false = keep the old building.
function CTB_fill(x,z,ry,w,d,h0,extra){if(!CTB.on)return false;CTB.st.slots++;const c=Math.cos(ry),s=Math.sin(ry),row=[];let p=-w/2,i=0;
 while(p<w/2-3&&i<8&&!(row.length&&w/2-p<7)){const K=CTB_pick(x+p,z,i++,w/2-p,d);if(!K)break;row.push([K,p+K.W/2]);p+=K.W+.4}
 if(!row.length){CTB.st.skip++;return false}const sh=(w/2-p)/2;// centre the row in the slot
 for(const[K,lx0]of row){const lx=lx0+sh,lz=d/2-K.D/2,px=x+lx*c+lz*s,pz=z-lx*s+lz*c,y=groundY(px,pz),a=ry+Math.PI;// set front (−z) → street (+z local)
  K.L.push({x:px,z:pz,y,a});if(K.v.gap)CTB.cg.push([px,pz]);const ca=Math.cos(a),sa=Math.sin(a);
  hubAddB({x:px+K.col.ox*ca+K.col.oz*sa,z:pz-K.col.ox*sa+K.col.oz*ca,hw:K.col.hw,hd:K.col.hd,h:y+K.H,ry:a,...(extra||{})});CTB.st.sets++}return true}
// Frankfurt hook (putK in buildHubG): only the generic street buildings, never towers
function CTB_putK(nm,sc,x,z,ry,tint,bx,w,h,d){if(!bx||CID!=='fra'||!/^building-([a-m]|type-[a-z])$/.test(nm))return false;return CTB_fill(x,z,ry,w,d,h)}
// Athens hook (put in athBuildG): small old-town houses and villas
function CTB_put(U,x,z,ry){if(CID==='fra'||(U.k!=='plaka'&&U.k!=='villa'))return false;const sty=athStyleAt(x,z);CTB.st.by[sty]=(CTB.st.by[sty]||0)+1;if(sty!=='plaka'&&sty!=='villa')return false;/* old town + villa districts (the 13k suburban 'town' houses stay procedural: CPU + memory) */return CTB_fill(x,z,ry,U.w+1.5,U.d+1,0,{ab:1})}
// meshes once the city is built; LOD + view sort every 6 frames
function CTB_mesh(){if(!HUB.grp)return;for(const k in CTB.K){const K=CTB.K[k];if(K.ims.length||!K.L.length)continue;const n=K.L.length;
  for(const[g,mat]of K.near){const im=new THREE.InstancedMesh(g,mat,n);im.count=0;im.frustumCulled=false;im.receiveShadow=true;im.name='ctb_'+k;if(mat===CR_GM)im.renderOrder=2;im.userData.keep=1;HUB.grp.add(im);K.ims.push(im)}
  const f=new THREE.InstancedMesh(K.far,K.near[0][1],n);f.count=0;f.frustumCulled=false;f.name='ctbf_'+k;f.userData.keep=1;HUB.grp.add(f);K.fim=f}CTB_step(1)}
const _ctbM=new THREE.Matrix4(),_ctbQ=new THREE.Quaternion(),_ctbP=new THREE.Vector3(),_ctbS=new THREE.Vector3(1,1,1),_ctbU=new THREE.Vector3(0,1,0),_ctbD=new THREE.Vector3();
function CTB_step(force){if(!force&&++CTB.t%6)return;if(typeof camera==='undefined')return;const cx=camera.position.x,cz=camera.position.z;camera.getWorldDirection(_ctbD);const dl=Math.hypot(_ctbD.x,_ctbD.z)||1,fx=_ctbD.x/dl,fz=_ctbD.z/dl;
 for(const k in CTB.K){const K=CTB.K[k];if(!K.fim)continue;let nn=0,nf=0;const r=Math.max(K.W,K.D);
  for(const o of K.L){const dx=o.x-cx,dz=o.z-cz,dd=Math.hypot(dx,dz);if(dd>CTB.far||(dd>r+12&&(dx*fx+dz*fz)<-r-6&&(dx*fx+dz*fz)<-dd*.35))continue;// behind the camera
   _ctbM.compose(_ctbP.set(o.x,o.y,o.z),_ctbQ.setFromAxisAngle(_ctbU,o.a),_ctbS);if(dd<CTB.near){for(const im of K.ims)im.setMatrixAt(nn,_ctbM);nn++}else K.fim.setMatrixAt(nf++,_ctbM)}
  for(const im of K.ims){im.count=nn;im.instanceMatrix.needsUpdate=true}K.fim.count=nf;K.fim.instanceMatrix.needsUpdate=true}}
buildRoam=(f=>function(){const r=f.apply(this,arguments);try{CTB_mesh()}catch(e){console.warn('CTB mesh',e)}return r})(buildRoam);
hubCullStep=(f=>function(){f.apply(this,arguments);try{CTB_step()}catch(e){}})(hubCullStep);
window.__ctb={CTB,pos:()=>({x:RO.x,z:RO.z}),V:CTB_V,stat:()=>({...CTB.st,kinds:Object.values(CTB.K).map(K=>({k:K.v.k,n:K.L.length,W:+K.W.toFixed(1),D:+K.D.toFixed(1),H:+K.H.toFixed(1),tris:K.tris,ftris:K.ftris,near:K.ims[0]?K.ims[0].count:0,far:K.fim?K.fim.count:0}))}),
 near:()=>{let best=null;for(const k in CTB.K)for(const o of CTB.K[k].L){const d=Math.hypot(o.x-RO.x,o.z-RO.z);if(!best||d<best.d)best={k,d,...o,W:CTB.K[k].W,D:CTB.K[k].D,H:CTB.K[k].H}}return best},list:k=>CTB.K[k]?CTB.K[k].L:[]};
