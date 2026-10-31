// dest-1 (lane dest, 2026-10-17, Alex: "the game crashes a lot on items, we need more destructible items, let the player find shortcuts").
// Measured with tools/dest/stops.js (2-min wander bot, hard stop = speed drop > 50 % in < 0.3 s): the item stops were (1) solid wall hits that rebounded the car to <= 12 m/s,
// (2) LIFE "set" pieces (LIFE_slide took 20 % of the speed per frame) and (3) traffic taps. This module: (a) solids deflect / slide along instead of a dead stop (DEST_wall),
// (b) the small LIFE set pieces (banner, billboard, balloons, sprinkler, swings, seesaw) smash like props under the smash2 gate (DEST_set, called from lx code.js),
// (c) 3-5 checked shortcuts per city (up to 9 candidates, each re-checked and shown only once streamed tiles are in) over open ground (parks, plazas, lawns between streets) marked with yellow brick arrows. ?dest=0 turns it OFF (default ON). Shortcuts are kept only when the road route is >= 1.7x the straight line (est. save >= 41 %, so the driven save stays >= 20 % with ~30 % wobble).
const DEST={fr:0,hv:[],on:!/[?&]dest=0/.test(location.search),n:{slide:0,setSmash:0,setBump:0},sc:null,done:false,scI:0,scBusy:false,scGrp:null};
const DEST_SET={banner:['#e8502a','#ffffff'],billboard:['#2a7ad8','#ffffff','#ffd12c'],balloons:['#e8502a','#ffd12c','#2a7ad8','#3aa04a'],sprinkler:['#2a7ad8','#bfe3ff'],swings:['#d8302a','#ffd12c','#2f3640'],seesaw:['#ffd12c','#2a7ad8']};
// LIFE set piece (lx code.js): true = handled here (smashed or bumped), false = the old solid slide (windmill, turbine, fountain, crane, carousel, teacups stay solid landmarks)
function DEST_set(it,sp,rr){const cols=DEST_SET[it.t];if(!DEST.on||!cols)return false;const tx=it.x-RO.x,tz=it.z-RO.z,LIFE=window.__life.LIFE;/* LIFE lives in the lx chunk's scope */
 if(SM2_smash('small',SM2_imp(sp,tx,tz))){LIFE.dead.set(it.id,1);const at=V3(it.x,it.y+.8,it.z),fw=V3(Math.sin(RO.vh??RO.h),0,Math.cos(RO.vh??RO.h));
  try{debris(at,fw.clone().multiplyScalar(Math.max(4,sp)*.4).add(V3(0,6,0)),11,cols.map(c=>new THREE.Color(c)),.7,it.y);studBurst(at,fw,Math.max(6,sp));AU.sfx('brick')}catch(e){}
  HUB.smashed++;comboAdd(1);RO.v*=.97;LIFE.n.smash++;LIFE.px=1e9;DEST.n.setSmash++;return true}
 DEST.n.setBump++;return SM2_life(it,sp,rr,cols)}
// street-life stalls / kiosks that hold the car (98l_lively): the old code took 30 % of the speed per frame; now only the into-the-thing part (12 %), and a glancing hit turns the car along the rim. n = unit normal pointing at the car.
function DEST_slide(nx,nz){const s=RO.v<0?-1:1,hx=Math.sin(RO.h)*s,hz=Math.cos(RO.h)*s,cin=-(hx*nx+hz*nz);if(cin<=0)return 1;if(s>0&&cin<.95){const side=hx*-nz+hz*nx>=0?1:-1;RO.h+=angDiff(Math.atan2(-nz*side,nx*side),RO.h)*.25}DEST.n.slide++;return 1-.12*cin}
// solids: the rebound (<= 12 m/s, a dead stop) becomes a slide along the wall at >= 60 % of the speed (glancing hits keep more). Damage / sound / shake are the old code's.
roamBounce=(f=>function(ax,sp,nX,nZ){if(!DEST.on||RO.tb)return f.apply(this,arguments);const vx=Math.sin(RO.vh)*RO.v,vz=Math.cos(RO.vh)*RO.v;let X=nX,Z=nZ;if(X==null){if(ax==='x'){X=-(Math.sign(vx)||1);Z=0}else{X=0;Z=-(Math.sign(vz)||1)}}
 const vn=vx*X+vz*Z,s0=Math.abs(RO.v),v0=RO.v;
 /* wallhit-r31e: square = nose-on (a > .9, sliding part < 30 % of the speed) and fast (> 4 m/s): decided BEFORE the old rebound so every speed cut of this hit is tagged 'wallstop' (DEST_wander, not an item stop) */
 const sq=TUNE.wallStop!==0&&s0>4&&vn<-.05&&RO.vy<=1&&-vn/Math.max(s0,.1)>.9&&Math.sqrt(Math.max(0,s0*s0-vn*vn))<.3*s0;DEST.ws=sq?1:0;let r;try{r=f.apply(this,arguments)}finally{DEST.ws=0}
 const hv=DEST.hv,fl=hv.length?Math.max(...hv)*.56:0;/* no solid takes more than 44 % of the speed of the last 0.3 s */
 if(vn>-.05||s0<2||RO.vy>1)return r;
 const a=Math.min(1,-vn/Math.max(s0,.1));let tx=vx-vn*X,tz=vz-vn*Z,tl=Math.hypot(tx,tz);
 /* wallhit-r31e: a SQUARE hit (sliding part < 30 % of the speed) is a stop, not a slide: dest-1 turned the head-on rebound into a sideways run at >= 56 % of the speed, so the car never stopped at a facade. It now backs off at <= 8 % of the impact speed (and <= 1.2 m/s) along its own heading; glancing hits slide as before. TUNE.wallStop=0 = old. Only the nose-on case (tl < .3 s0, a > .9) and only above 4 m/s. */
 if(sq){const fd=Math.sin(RO.h)*X+Math.cos(RO.h)*Z;RO.vh=RO.h;DEST.ws=1;RO.v=(fd<0?-1:1)*Math.min(1.2,.08*s0);DEST.ws=0;RO.yr*=.3;RO.stkT=0;DEST.n.stop=(DEST.n.stop||0)+1;return r}
 if(Math.abs(RO.v)>=Math.max(s0*.6,fl))return r;
if(tl<.3*s0){/* head-on: slide to the side the car is steered / pointing to */const sd=Math.sign(Math.sin(RO.h)*-Z+Math.cos(RO.h)*X)||1;tx=-Z*sd;tz=X*sd;tl=1}
 const k=Math.max(.6,1-.4*a*a),tf=Math.atan2(tx/tl,tz/tl);RO.vh=tf;RO.h+=angDiff(tf,RO.h)*.6;RO.v=(v0<0?-1:1)*Math.max(s0*k,fl);RO.stkT=0;DEST.n.slide++;return r})(roamBounce);
// ---------- shortcuts: pairs of street nodes 60-130 m apart (longer cut-throughs kept hitting streamed or moving obstacles) (as the crow flies) whose road route is >= 1.45x longer (>= 31 % saved) and whose straight corridor is open ground
// (no collider within 2.6 m, no river, flat, mostly off the road network). Found incrementally (DEST_step, <= 4 ms per roam frame), marked with chevron decals.
// perf-3: allocation-free Dijkstra (typed arrays + stamp + binary heap, reused); was a Map + [d,i] pair per push + splice per pop (~1.5 GB / 30 s with DEST_find in Athens). Same distances.
const DEST_DJ={n:0,D:null,M:null,st:0,hd:null,hi:null};
function DEST_dij(N,a,maxD){const W=DEST_DJ;if(W.n<N.length){W.n=N.length;W.D=new Float64Array(N.length);W.M=new Uint32Array(N.length);W.hd=new Float64Array(64);W.hi=new Int32Array(64)}
 const D=W.D,M=W.M,st=++W.st;let hd=W.hd,hi=W.hi,hn=0;
 const push=(d,i)=>{if(hn>=hd.length){const d2=new Float64Array(hd.length*2),i2=new Int32Array(hd.length*2);d2.set(hd);i2.set(hi);W.hd=hd=d2;W.hi=hi=i2}let k=hn++;while(k>0){const q=(k-1)>>1;if(hd[q]<=d)break;hd[k]=hd[q];hi[k]=hi[q];k=q}hd[k]=d;hi[k]=i};
 D[a]=0;M[a]=st;push(0,a);
 while(hn){const d=hd[0],i=hi[0];hn--;if(hn){const ld=hd[hn],li=hi[hn];let k=0;for(;;){let c=2*k+1;if(c>=hn)break;if(c+1<hn&&hd[c+1]<hd[c])c++;if(hd[c]>=ld)break;hd[k]=hd[c];hi[k]=hi[c];k=c}hd[k]=ld;hi[k]=li}
  if(d>D[i])continue;const A=N[i],nb=A.nb;if(!nb)continue;for(let t=0;t<nb.length;t++){const j=nb[t],B=N[j];if(!B)continue;const nd=d+Math.hypot(B.x-A.x,B.z-A.z);if(nd<maxD&&(M[j]!==st||nd<D[j])){D[j]=nd;M[j]=st;push(nd,j)}}}
 return W}
const DEST_dget=(W,j)=>W.M[j]===W.st?W.D[j]:null;
// perf-3: 130 m node grid for the pair scan (was every scI x every later node)
function DEST_grid(N){const G=new Map();for(let i=0;i<N.length;i++){const B=N[i];if(!B)continue;const k=Math.floor(B.x/130)*100000+Math.floor(B.z/130);let L=G.get(k);if(!L)G.set(k,L=[]);L.push(i)}return G}
const DEST_cand=[];
const _dsO={g:0,deck:null,low:false};// perf-2: scratch result (the shortcut scan probes the ground ~100k times)
// perf-r18o: roamHit for the scan with the collider boxes pre-bounded as Int32 per grid cell (Smi compares; the interpreted double math boxed ~16 B per op for every collider in the cell).
// Skips only colliders whose bounding circle (hw+hd+rad) cannot reach the point, then runs the same tests as roamHit; returns true/false.
const _dhW=new WeakMap();
function DEST_hb(L){const B=new Int32Array(L.length*4+4);for(let i=0;i<L.length;i++){const b=L[i],e=b.hw+b.hd+4,k=i*4,ok=isFinite(e)&&isFinite(b.x)&&isFinite(b.z);B[k]=ok?Math.floor(b.x-e)-1:-1073741824;B[k+1]=ok?Math.ceil(b.x+e)+1:1073741824;B[k+2]=ok?Math.floor(b.z-e)-1:-1073741824;B[k+3]=ok?Math.ceil(b.z+e)+1:1073741824}const E={n:L.length,B};_dhW.set(L,E);return E}
function DEST_hit(x,z,rad,y){const L=HUB.grid&&HUB.grid.get(Math.floor(x/40)*10000+Math.floor(z/40));if(!L)return false;if(!(rad<=4))return !!roamHit(x,z,rad,y);let E=_dhW.get(L);if(!E||E.n!==L.length)E=DEST_hb(L);
 const B=E.B,xi=x|0,zi=z|0,LP=TUNE.lowProp??1.3;for(let bi=0;bi<L.length;bi++){const k=bi*4;if(xi<B[k]||xi>B[k+1]||zi<B[k+2]||zi>B[k+3])continue;const b=L[bi];if(y>=(b.h||999)-.6||(b.y0!=null&&y<b.y0))continue;if(b.h&&(b.rh!==undefined?b.rh<LP:bLow(b,LP)))continue;
  const dx=x-b.x,dz=z-b.z;let lx=dx,lz=dz;if(b.c!=null){lx=dx*b.c-dz*b.s;lz=dx*b.s+dz*b.c}const ex=(lx<0?-lx:lx)-b.hw,ez=(lz<0?-lz:lz)-b.hd;if(ex>=rad||ez>=rad)continue;if(ex<=0||ez<=0||ex*ex+ez*ez<rad*rad)return true}return false}
function DEST_open(ax,az,bx,bz){const L=Math.hypot(bx-ax,bz-az),dx=(bx-ax)/L,dz=(bz-az)/L;let off=0,n=0,g0=groundAt(ax,az,99);for(let s=3;s<=L-3;s+=1.5){const x=ax+dx*s,z=az+dz*s,g=groundAt(x,z,99);n++;if(Math.abs(g-g0)>.5||g<-1||DEST_hit(x,z,3.8,g+.6)||inRiver(x,z,2)||(DK_any(x,z)&&roamTerr(x,z,g+.3,_dsO).low)||Math.abs(groundAt(x+dz*1.6,z-dx*1.6,99)-g)>.6||Math.abs(groundAt(x-dz*1.6,z+dx*1.6,99)-g)>.6)return 0;g0=g;if(!LF_onRoad(x,z))off++;const PL=HUB.pgrid&&HUB.pgrid.get(Math.floor(x/16)*10000+Math.floor(z/16));if(PL)for(const p of PL){const d=HUB.ptypes[p.t];if(d&&d.r>=1.1&&Math.hypot(p.x-x,p.z-z)<d.r+2)return 0}}if(n<6||off/n<.6)return 0;
 const LF=window.__life;if(LF&&LF.cell&&LF.CELL){/* solid LIFE set pieces (crane, carousel, fountain...) near the line; the small ones smash and do not count */try{const C=LF.CELL,seen=new Set();for(let s=0;s<=L;s+=C/2){const x=ax+dx*s,z=az+dz*s,ca=Math.floor(x/C),cb=Math.floor(z/C);for(let da=-1;da<=1;da++)for(let db=-1;db<=1;db++){const k=(ca+da)*100000+cb+db;if(seen.has(k))continue;seen.add(k);for(const it of LF.cell(ca+da,cb+db)){if(it.c!=='set'||DEST_SET[it.t])continue;const t=clamp(((it.x-ax)*dx+(it.z-az)*dz),0,L);if(Math.hypot(ax+dx*t-it.x,az+dz*t-it.z)<it.r+4)return 0}}}}catch(e){}}
 return off/n}
// perf-10: resumable per candidate (S.cj, S.Dd); was budget-checked per node only, so one node's 10-30 DEST_open scans ran in one frame (90+ ms in Frankfurt)
// r8a: nodes are scanned nearest-the-player first (S.ord, sorted once), each passing candidate is published at once (DEST.sc grows, DEST_mark adds its arrows) with the 250 m spacing and the cap of 9,
// and the scan ends (DEST.done) at 9 found or when every node is covered, freeing its tables. Athens used to publish nothing until all 22.7k nodes were scanned (never) and allocated ~9 MB/s forever.
function DEST_find(budgetMs){const N=HUB.nodes;if(!N||!DEST.on||DEST.done)return;const t0=performance.now(),S=DEST;S.sc=S.sc||[];let did=0;
 if(S.gN!==N){S.gN=N;S.grid=DEST_grid(N);const px=typeof RO!=='undefined'&&RO.x||0,pz=typeof RO!=='undefined'&&RO.z||0,ix=[],d2=new Float64Array(N.length);for(let i=0;i<N.length;i++){const B=N[i];if(B&&!B.ab&&B.nb&&B.nb.length){ix.push(i);d2[i]=(B.x-px)*(B.x-px)+(B.z-pz)*(B.z-pz)}}
  ix.sort((p,q)=>d2[p]-d2[q]);S.ord=Int32Array.from(ix);S.seen=new Uint8Array(N.length);S.scI=0;S.cj=-1}
 for(;S.scI<S.ord.length;S.scI++,S.cj=-1){if(did&&performance.now()-t0>=budgetMs)return;const ai=S.ord[S.scI],A=N[ai],C=DEST_cand;
  if(!(S.cj>=0)){S.cj=0;S.Dd=false;C.length=0;const ca=Math.floor(A.x/130),cb=Math.floor(A.z/130);
   for(let da=-1;da<=1;da++)for(let db=-1;db<=1;db++){const L=S.grid.get((ca+da)*100000+cb+db);if(L)for(let t=0;t<L.length;t++)if(L[t]!==ai&&!S.seen[L[t]])C.push(L[t])}}
  for(;S.cj<C.length;S.cj++){if(did&&performance.now()-t0>=budgetMs)return;const j=C[S.cj],B=N[j];if(!B||B.ab||!B.nb||!B.nb.length)continue;const dx=B.x-A.x,dz=B.z-A.z;if(Math.abs(dx)>130||Math.abs(dz)>130)continue;const L=Math.hypot(dx,dz);if(L<60||L>130)continue;
   if(!S.Dd){DEST_dij(N,ai,L*2.2);S.Dd=true}did++;const R=DEST_dget(DEST_DJ,j);if(R==null||R<L*1.7)continue;
   if(!S.sc.every(p=>Math.hypot(p.a.x-A.x,p.a.z-A.z)>250&&Math.hypot(p.b.x-B.x,p.b.z-B.z)>250))continue;/* spacing first: it is far cheaper than DEST_open */
   if(!DEST_open(A.x,A.z,B.x,B.z))continue;
   const c={a:{x:A.x,z:A.z},b:{x:B.x,z:B.z},len:Math.round(L),road:Math.round(R),save:+(1-L/R).toFixed(2)};S.sc.push(c);DEST_mark([c]);if(S.sc.length>=9){S.scI=S.ord.length;S.cj=-1;break}}
  S.seen[ai]=1}
 S.done=true;S.grid=S.ord=S.seen=null;DEST_cand.length=0}
let DEST_texM=null,DEST_geo=null;
function DEST_mark(list){if(!list.length)return;if(!DEST_texM){const[pc,pg]=cv(64,128);pg.strokeStyle='#ffd12c';pg.lineWidth=11;pg.lineCap='round';pg.lineJoin='round';for(let k=0;k<2;k++){pg.beginPath();pg.moveTo(10,104-k*44);pg.lineTo(32,66-k*44);pg.lineTo(54,104-k*44);pg.stroke()}
  const t=tex(pc);KEEP_TEX.add(t);DEST_texM=new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,toneMapped:false,color:new THREE.Color(1.6,1.3,.5)})}
 let grp=DEST.scGrp;if(!grp){grp=DEST.scGrp=new THREE.Group();HUB.grp.add(grp)}const geo=DEST_geo||(DEST_geo=new THREE.PlaneGeometry(4.2,7.4));
 for(const c of list){c.mk=[];const L=Math.hypot(c.b.x-c.a.x,c.b.z-c.a.z),ux=(c.b.x-c.a.x)/L,uz=(c.b.z-c.a.z)/L,h=Math.atan2(ux,uz);
  for(const[o,dir]of[[c.a,1],[c.b,-1]])for(let k=0;k<3;k++){const x=o.x+ux*dir*(5+k*6),z=o.z+uz*dir*(5+k*6),m=new THREE.Mesh(geo,DEST_texM);m.rotation.order='YXZ';m.rotation.set(-Math.PI/2,h+(dir>0?0:Math.PI)+Math.PI,0);m.position.set(x,groundAt(x,z,99)+.18,z);m.renderOrder=3;m.visible=false;grp.add(m);c.mk.push(m)}
  for(let s=14;s<L-12;s+=9){const x=c.a.x+ux*s,z=c.a.z+uz*s,m=new THREE.Mesh(new THREE.BoxGeometry(.8,.28,.8),DEST_texM);m.position.set(x,groundAt(x,z,99)+.2,z);m.visible=false;grp.add(m);c.mk.push(m)}}
 }
// streamed city tiles add colliders near the player: a shortcut is re-checked once the car is within 350 m, and dropped (markers hidden) if something now blocks it
function DEST_check(c){if(c.ok!=null)return c.ok;c.ok=!!DEST_open(c.a.x,c.a.z,c.b.x,c.b.z);for(const m of c.mk||[])m.visible=c.ok;return c.ok}
function DEST_reset(){if(DEST.scGrp&&DEST.scGrp.parent)DEST.scGrp.parent.remove(DEST.scGrp);DEST.scGrp=null;DEST.sc=null;DEST.done=false;DEST.grid=DEST.ord=DEST.seen=null;DEST.scI=0;DEST.cj=-1;DEST.N=HUB.nodes;DEST.gN=null}
// perf-12: the one-off shortcut scan (22.7k nodes in Athens) ran 4 ms every frame for ~35 s; its probes run Maglev-compiled and box every double (~50 MB/s of garbage),
// so it gets 1.5 ms a frame (~90 s in Athens, same result; GO/tests call DEST_find(1e9))
const DEST_BUDGET=1.5;
const DEST_step=dt=>{DEST.fr++;DEST.hv.push(Math.abs(RO.v));if(DEST.hv.length>9)DEST.hv.shift();if(state!=='roam'||!RO.on||!HUB.nodes||!DEST.on)return;if(DEST.N!==HUB.nodes)DEST_reset();if(!DEST.done){try{DEST_find(DEST_BUDGET)}catch(e){DEST.sc=DEST.sc||[];DEST.done=true;console.warn('DEST',e)}}if(DEST.sc&&DEST.fr%20===0)for(const c of DEST.sc)if(c.ok==null&&Math.hypot(c.a.x-RO.x,c.a.z-RO.z)<350){DEST_check(c);break}};   /* perf-10: one re-check per 20 frames (was all of them at once) */
smashCheck=(f=>function(dt){DEST_step(dt);return f.apply(this,arguments)})(smashCheck);
