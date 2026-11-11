// ===== OG "something to do every 150 m" (LEGO 2K Drive Bricklandia density): on-the-go events that start the moment you drive
// through their ring (8 types, bronze/silver/gold, instant retry, stud payout), hidden golden bricks (behind ramps, on hill tops,
// on rooftops via a roof ramp), district Unique Collectibles with a collection screen, per-area completion % (map + pop-up, 100% reward).
// Spots are placed procedurally on the qv street graph (greedy cover, ≤150 m to the nearest unfinished thing), never on district gates,
// garages or mission starts, and markers are hidden near the NEXT story path. Rendering: 3 InstancedMeshes (≤ OG_N markers, alpha fade).
// Self-contained: globals are prefixed OG_ / OG; existing functions are extended by re-binding (roamStep, roamLanded, drawRoamMap).
CK.push('mho_og');CITYK.push('mho_og');
const OG={key:null,S:[],grid:new Map(),ev:null,last:null,cool:0,f:0,area:null,areaT:0,navP:null,navC:new Set(),vis:[],A:{},err:0,ramps:[],log:{start:0,fin:0,tier:[0,0,0,0],gold:0,col:0,retry:0}};
const OG_N=10,OG_R=105,OG_FADE=[150,270];
const OG_T={gate:{n:'Gate Crasher',ic:'⛓',col:'#ff5a2d',d:'Smash every gate before time runs out'},ring:{n:'Boost Rings',ic:'💫',col:'#2f9bff',d:'Fly through every ring'},
 drift:{n:'Drift Zone',ic:'🌀',col:'#c46bff',d:'Hold DRIFT and score points in the zone'},stunt:{n:'Stunt Jump',ic:'🎯',col:'#ff2d95',d:'Hit the ramp and land on the target'},
 rush:{n:'Stud Rush',ic:'🟡',col:'#ffd12c',d:'Grab as many studs as you can'},smash:{n:'Smash Count',ic:'💥',col:'#ff9a3c',d:'Smash the crates before the timer ends'},
 ghost:{n:'Ghost Race',ic:'👻',col:'#9fe8ff',d:'Beat the ghost to the finish flag'},ljump:{n:'Long Jump',ic:'🚀',col:'#5dffb0',d:'Launch off the ramp and fly far'}};
const OG_KS=Object.keys(OG_T),OG_PAY=[0,250,500,900];
// unique collectible themes: Frankfurt cycles per area, Athens one theme per district
const OG_TH={fra:[['Bembel jugs','🫖',0x4a6fd0,['Grey Bembel','Blue-glaze Bembel','Rippchen Bembel','Festival Bembel',"Oma's Bembel"]],
  ['Pretzels','🥨',0xc68a3a,['Laugenbrezel','Butterbrezel','Kümmelbrezel','Käsebrezel','Riesenbrezel']],
  ['Apple-wine glasses','🍎',0x5dd16a,['Geripptes','Schoppen','Sauergespritzter','Süßgespritzter','Fassbrause glass']],
  ['Green-sauce herbs','🌿',0x36b04a,['Borage','Chervil','Cress','Parsley','Sorrel']],
  ['Skyline bricks','🏙',0x9fb0c0,['Main Tower brick','Messeturm brick','Commerzbank brick','Opernturm brick','Westend brick']]],
 ath:{A:['Greek amphora set','🏺',0xd07a3a,['Black-figure amphora','Red-figure amphora','Panathenaic amphora','Wine amphora','Oil amphora']],
  B:['Owl coins','🦉',0xc0c8d0,['Silver tetradrachm','Bronze obol','Gold stater','Drachma','Didrachm']],
  C:['Komboloi beads','📿',0xd0a040,['Amber komboloi','Coral komboloi','Olive-wood komboloi','Bone komboloi','Glass komboloi']],
  D:['Olive branches','🫒',0x6a9a3a,['Kalamata branch','Koroneiki branch','Ancient olive branch','Silver-leaf branch','Victory wreath']]}};
function OG_sv(){if(OG.slot!==SLOT||!OG.s){OG.slot=SLOT;OG.s=store.get('mho_og',null)||{};for(const k of['e','g','c','rw','sum'])OG.s[k]=OG.s[k]||{}}return OG.s}
function OG_save(){store.set('mho_og',OG.s)}
const OG_snd=n=>{try{AU.sfx(n)}catch(e){}};
const OG_gk=(x,z)=>Math.floor(x/100)*100000+Math.floor(z/100);
function OG_rng(seed){let a=seed>>>0;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function OG_inD(x,z){return CID==='fra'||athIn(ATHD,...RW(x,z))}
function OG_areaAt(x,z){let a=null;try{a=districtAt(x,z)}catch(e){}return a&&a!=='Am Main'?a:(CID==='fra'?'Frankfurt':ATH_DIST[ATHD].name)}
function OG_distName(){return CID==='fra'?'Frankfurt':ATH_DIST[ATHD].name}
// walk the street graph from node i in direction (dx,dz) for L metres, always taking the straightest continuation
function OG_walk(i,dx,dz,L){const G=qvGraph(),P=[[G.X[i],G.Z[i]]],C=[0];const d0x=dx,d0z=dz;let len=0,turn=0;const seen=new Set([i]);
  while(len<L){let b=-1,bs=-2;for(let k=G.off[i];k<G.off[i+1];k++){const j=G.nb[k];if(seen.has(j))continue;const ex=G.X[j]-G.X[i],ez=G.Z[j]-G.Z[i],l=Math.hypot(ex,ez)||1,c=(ex*dx+ez*dz)/l;if(c>bs){bs=c;b=j}}
    if(b<0||bs<.4)break;const ex=G.X[b]-G.X[i],ez=G.Z[b]-G.Z[i],l=Math.hypot(ex,ez)||1;dx=ex/l;dz=ez/l;turn=Math.max(turn,Math.acos(clamp(dx*d0x+dz*d0z,-1,1)));len+=l;P.push([G.X[b],G.Z[b]]);C.push(len);seen.add(b);i=b}
  return{P,C,len,turn}}
function OG_at(W,s){const P=W.P,C=W.C;let k=1;while(k<P.length-1&&C[k]<s)k++;const a=P[k-1],b=P[k]||a,l=(C[k]-C[k-1])||1,u=clamp((s-C[k-1])/l,0,1),hx=(b[0]-a[0])/l,hz=(b[1]-a[1])/l;return{x:a[0]+(b[0]-a[0])*u,z:a[1]+(b[1]-a[1])*u,hx,hz,h:Math.atan2(hx,hz)}}
function OG_excl(){const ex=[];for(const g of HUB.gates||[])ex.push([g.x,g.z,55]);for(const m of RO.marks||[])if(Number.isFinite(m.x))ex.push([m.x,m.z,45]);for(const g of GARAGES)if(g.x!=null)ex.push([g.x,g.z,45]);return ex}
const OG_near=(ex,x,z,f=1)=>ex.some(([a,b,r])=>(a-x)**2+(b-z)**2<r*r*f);
// ---------- procedural placement
function OG_build(){const G=qvGraph();if(!G||!RO.grp)return false;const t0=performance.now();OG_clear();OG_sv();
  const rn=OG_rng((CID==='fra'?7:ATHD.charCodeAt(0)*977)+G.n),ex=OG_excl(),S=[],grid=new Map(),A={};
  const put=sp=>{sp.id=sp.k[0]+Math.round(sp.x/4)+'_'+Math.round(sp.z/4);sp.a=OG_areaAt(sp.x,sp.z);sp.y=sp.y??groundY(sp.x,sp.z);S.push(sp);const k=OG_gk(sp.x,sp.z);(grid.get(k)||grid.set(k,[]).get(k)).push(sp);return sp};
  const nearest=(x,z,R)=>{let b=null,bd=R*R;const r=Math.ceil(R/100),kx=Math.floor(x/100),kz=Math.floor(z/100);for(let a=-r;a<=r;a++)for(let c=-r;c<=r;c++){const L=grid.get((kx+a)*100000+kz+c);if(L)for(const s of L){const d=(s.x-x)**2+(s.z-z)**2;if(d<bd){bd=d;b=s}}}return b};
  const ok=(x,z)=>OG_inD(x,z)&&!inRiver(x,z)&&!OG_near(ex,x,z);
  // road samples every 20 m on the main component (inside the loaded district)
  const smp=[];for(const i of G.list)for(let k=G.off[i];k<G.off[i+1];k++){const j=G.nb[k];if(j<=i)continue;const L=Math.hypot(G.X[j]-G.X[i],G.Z[j]-G.Z[i]),n=Math.max(1,Math.ceil(L/20));for(let q=0;q<n;q++){const u=q/n,x=G.X[i]+(G.X[j]-G.X[i])*u,z=G.Z[i]+(G.Z[j]-G.Z[i])*u;if(OG_inD(x,z)&&!inRiver(x,z))smp.push([x,z,u<.5?i:j])}}
  OG.smp=smp;const deg=i=>G.off[i+1]-G.off[i];
  // golden bricks 1: in the air behind the city's jump ramps
  for(const r of RO.ramps||[]){if(r.dk||r.og)continue;const fx=Math.sin(r.h),fz=Math.cos(r.h),x=r.x+fx*(r.len/2+11),z=r.z+fz*(r.len/2+11);if(!ok(x,z)||nearest(x,z,120))continue;put({k:'gold',t:'ramp',x,z,y:r.y0+r.hgt+2.6})}
  // golden bricks 2: hill tops (highest road node of its 300 m cell, ≥ 12 m above the cell's lowest)
  {const C=new Map();for(const s of smp){const k=Math.floor(s[0]/300)*100000+Math.floor(s[1]/300),y=groundY(s[0],s[1]);let c=C.get(k);if(!c)C.set(k,c={hi:-1e9,lo:1e9,p:null,kx:Math.floor(s[0]/300),kz:Math.floor(s[1]/300)});if(y>c.hi){c.hi=y;c.p=s}c.lo=Math.min(c.lo,y)}
    for(const[k,c]of C){if(c.hi-c.lo<8)continue;const kx=c.kx,kz=c.kz;let top=true;for(let a=-1;a<=1&&top;a++)for(let b=-1;b<=1;b++){const o=C.get((kx+a)*100000+kz+b);if(o&&o!==c&&o.hi>c.hi){top=false;break}}
      if(top&&ok(c.p[0],c.p[1])&&!nearest(c.p[0],c.p[1],120))put({k:'gold',t:'hill',x:c.p[0],z:c.p[1],y:c.hi+2.4})}}
  // golden bricks 3: rooftops (low axis-aligned building beside a road; a yellow roof ramp leads up, the roof becomes drivable)
  {const seenB=new Set(),byA={};for(const L of HUB.grid?HUB.grid.values():[])for(const b of L){if(seenB.has(b))continue;seenB.add(b);if(b.c!=null||b.y0!=null||!b.h)continue;const gy=groundY(b.x,b.z),hh=b.h-gy;if(hh<3.5||hh>14||b.hw<6||b.hd<6||b.hw>22||b.hd>22)continue;
      const a=OG_areaAt(b.x,b.z);if((byA[a]||0)>=1||!ok(b.x,b.z)||nearest(b.x,b.z,150))continue;const R=OG_roof(b,gy,hh);if(!R)continue;byA[a]=1;put({k:'gold',t:'roof',x:b.x,z:b.z,y:b.h+1.6,roof:R})}}
  // unique collectibles: up to 5 per area, preferring dead ends / side streets, spread out (farthest-point)
  {const byA={};for(const s of smp){const a=OG_areaAt(s[0],s[1]);(byA[a]=byA[a]||[]).push(s)}
    let ti=0;for(const a of Object.keys(byA).sort()){const L=byA[a];const th=CID==='fra'?OG_TH.fra[ti++%OG_TH.fra.length]:OG_TH.ath[ATHD];A[a]={th,n:0};const want=Math.min(5,Math.floor(L.length/25));const pick=[];
      for(let it=0;it<want;it++){let b=null,bv=-1;for(let q=0;q<L.length;q+=3){const s=L[q];if(!ok(s[0],s[1]))continue;let dm=400;for(const p of pick)dm=Math.min(dm,Math.hypot(p[0]-s[0],p[1]-s[1]));const sp=nearest(s[0],s[1],60);if(sp)continue;const v=dm+(deg(s[2])===1?120:0)+rn()*40;if(v>bv){bv=v;b=s}}
        if(!b)break;pick.push(b);put({k:'col',t:a,x:b[0],z:b[1],ci:it,y:groundY(b[0],b[1])+1.6})}A[a].n=pick.length}}
  // on-the-go events: greedy cover of the road samples (no two rings closer than 60 m), then a fix-up pass for any sample > 140 m
  const ord=smp.map((s,i)=>i);for(let i=ord.length-1;i>0;i--){const j=Math.floor(rn()*(i+1));[ord[i],ord[j]]=[ord[j],ord[i]]}
  const addEv=s=>{const sp=put({k:'ev',t:null,x:s[0],z:s[1],i:s[2]});return sp};
  for(const oi of ord){const s=smp[oi];if(nearest(s[0],s[1],OG_R))continue;if(ok(s[0],s[1]))addEv(s)}
  for(let pass=0;pass<2;pass++)for(const s of smp){if(nearest(s[0],s[1],140))continue;let b=null,bd=1e9;for(const q of smp){const d=(q[0]-s[0])**2+(q[1]-s[1])**2;if(d<bd&&d<130*130&&ok(q[0],q[1])&&!nearest(q[0],q[1],45)){bd=d;b=q}}if(b)addEv(b)}
  // event types: balanced per area; jumps only where the road runs straight ≥ 110 m both ways
  const cnt={};let ti2=0;for(const sp of S){if(sp.k!=='ev')continue;const i=sp.i,nb=[];for(let k=G.off[i];k<G.off[i+1];k++)nb.push(G.nb[k]);let st=false,dir=null;
    if(nb.length===2){const a=nb[0],ax=G.X[a]-G.X[i],az=G.Z[a]-G.Z[i],la=Math.hypot(ax,az)||1,w1=OG_walk(i,ax/la,az/la,110),w2=OG_walk(i,-ax/la,-az/la,110);st=w1.len>=105&&w2.len>=105&&w1.turn<.22&&w2.turn<.22;dir=[ax/la,az/la]}
    const c=cnt[sp.a]=cnt[sp.a]||{};const pool=OG_KS.filter(k=>st||(k!=='stunt'&&k!=='ljump'));pool.sort((p,q)=>(c[p]||0)-(c[q]||0)||((OG_KS.indexOf(p)+ti2)%8)-((OG_KS.indexOf(q)+ti2)%8));ti2++;
    const t=pool[0];c[t]=(c[t]||0)+1;sp.t=t;sp.dir=dir;if(sp.i!=null){sp.x=G.X[i];sp.z=G.Z[i];sp.y=groundY(sp.x,sp.z)}}
  OG.S=S;OG.grid=grid;OG.A=A;OG.key=OG_key();OG.ms=Math.round(performance.now()-t0);OG_meshes();OG_sum();return true}
function OG_key(){const G=QV.g;return CID+'|'+(CID==='fra'?'':ATHD)+'|'+(G?G.n:0)+'|'+(RO.grp?RO.grp.uuid:'')}
function OG_clear(){if(OG.ev)OG_end(null,1);for(const r of OG.ramps){for(const m of r.meshes)m.parent&&m.parent.remove(m);for(const q of r.rr){const i=RO.ramps.indexOf(q);if(i>=0)RO.ramps.splice(i,1)}}OG.ramps=[];if(OG.grp&&OG.grp.parent)OG.grp.parent.remove(OG.grp);OG.grp=null;OG.S=[];OG.grid=new Map()}
// a ramp from the road up onto a low roof + a flat drivable deck on the roof (as a hgt-0 ramp, which roamTerr treats as ground)
function OG_roof(b,gy,hh){const G=qvGraph();for(const[ax,sg]of[[0,1],[0,-1],[1,1],[1,-1]]){const fx=ax?sg:0,fz=ax?0:sg,face=ax?b.hw:b.hd,len=hh*3,cx=b.x+fx*(face+len/2),cz=b.z+fz*(face+len/2),sx=b.x+fx*(face+len+3),sz=b.z+fz*(face+len+3);
    const i=qvNear(sx,sz,14);if(i<0)continue;let clear=true;for(let d=2.5;d<len+2&&clear;d+=1.5)for(const o of[-3,0,3]){const px=b.x+fx*(face+d)+(ax?0:o),pz=b.z+fz*(face+d)+(ax?o:0);if(roamHit(px,pz,1.2,0)){clear=false;break}}if(!clear)continue;
    return{x:cx,z:cz,h:Math.atan2(-fx,-fz),len,hgt:hh+.15,w:7,gy,sx,sz,deck:{x:b.x,z:b.z,h:0,len:2*b.hd-.4,w:2*b.hw-.4,hgt:0,y0:b.h+.15,og:1}}}return null}
function OG_roofOn(sp){if(sp.roofOn)return;sp.roofOn=1;const R=sp.roof,n0=RO.grp.children.length;addRamp(R.x,R.z,R.h,R.len,R.hgt,R.w,0xffd12c);const rr=[RO.ramps[RO.ramps.length-1],R.deck];rr[0].og=1;RO.ramps.push(R.deck);OG.ramps.push({sp,meshes:RO.grp.children.slice(n0),rr})}
// ---------- rendering: 3 instanced meshes, per-instance alpha fade
function OG_fadeMat(col){const m=new THREE.MeshBasicMaterial({color:col,transparent:true,depthWrite:false,toneMapped:false});m.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float aF;varying float vF;').replace('#include <begin_vertex>','#include <begin_vertex>\nvF=aF;');sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying float vF;').replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.a*=vF;')};return m}
function OG_meshes(){const grp=OG.grp=new THREE.Group();grp.name='OG';RO.grp.add(grp);const mk=(geo,col)=>{const im=new THREE.InstancedMesh(geo,OG_fadeMat(col),OG_N);im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);im.setColorAt(0,new THREE.Color(1,1,1));const f=new THREE.InstancedBufferAttribute(new Float32Array(OG_N),1);f.setUsage(THREE.DynamicDrawUsage);geo.setAttribute('aF',f);im.count=0;im.frustumCulled=false;grp.add(im);return im};
  OG.imE=mk(new THREE.TorusGeometry(5.6,.55,8,28),0xffffff);const bg=new THREE.BoxGeometry(2.4,1.1,1.2);OG.imG=mk(bg,0xffc21a);
  OG.imC=mk(new THREE.LatheGeometry([[0,0],[.55,.05],[.8,.6],[.75,1.2],[.4,1.6],[.45,2],[.6,2.15]].map(([x,y])=>new THREE.Vector2(x,y)),12),0xffffff)}
const _om=new THREE.Matrix4(),_oq=new THREE.Quaternion(),_oe=new THREE.Euler(),_ov=new THREE.Vector3(),_os=new THREE.Vector3(),_oc=new THREE.Color();
function OG_navCells(){const N=QV.nav,P=N&&N.P,wp=RO.wp;const key=P||wp?(P?P.length+':'+(P[0]&&P[0][0]):'')+'|'+(wp?Math.round(wp.x)+','+Math.round(wp.z):''):'';if(key===OG.navK)return OG.navC;OG.navK=key;const C=new Set();
  const add=(x,z)=>{for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)C.add((Math.floor(x/30)+a)*100000+Math.floor(z/30)+b)};
  if(P)for(let k=1;k<P.length;k++){const a=P[k-1],b=P[k],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.ceil(L/15));for(let q=0;q<=n;q++)add(a[0]+(b[0]-a[0])*q/n,a[1]+(b[1]-a[1])*q/n)}
  if(wp&&Number.isFinite(wp.x))add(wp.x,wp.z);return OG.navC=C}
const OG_onPath=sp=>OG.navC.has(Math.floor(sp.x/30)*100000+Math.floor(sp.z/30));
function OG_done(sp){const s=OG_sv();return sp.k==='ev'?(s.e[sp.id]||0):sp.k==='gold'?(s.g[sp.id]?3:0):(s.c[sp.id]?3:0)}
function OG_blocked(sp){if(OG_onPath(sp))return true;for(const m of RO.marks||[])if(Number.isFinite(m.x)&&(m.x-sp.x)**2+(m.z-sp.z)**2<40*40)return true;for(const g of HUB.gates||[])if((g.x-sp.x)**2+(g.z-sp.z)**2<50*50)return true;return false}
function OG_pickVis(){const x=RO.x,z=RO.z,kx=Math.floor(x/100),kz=Math.floor(z/100),L=[];OG_navCells();
  for(let a=-3;a<=3;a++)for(let c=-3;c<=3;c++){const Q=OG.grid.get((kx+a)*100000+kz+c);if(!Q)continue;for(const sp of Q){const t=OG_done(sp);if(t>=3)continue;const d=Math.hypot(sp.x-x,sp.z-z);if(d>OG_FADE[1])continue;if(OG_blocked(sp))continue;L.push([d+(t?60:0),sp,d])}}
  L.sort((p,q)=>p[0]-q[0]);OG.vis=L.slice(0,OG_N).map(q=>q[1]);for(const sp of OG.vis)if(sp.roof&&!sp.roofOn)OG_roofOn(sp);
  for(const r of OG.ramps){const v=Math.hypot(r.sp.x-x,r.sp.z-z)<400;for(const m of r.meshes)m.visible=v}}
function OG_draw(){if(!OG.imE)return;const on=!OG.ev&&state==='roam';const n={E:0,G:0,C:0},t=performance.now()/1000;
  if(on)for(const sp of OG.vis){const d=Math.hypot(sp.x-RO.x,sp.z-RO.z),f=clamp((OG_FADE[1]-d)/(OG_FADE[1]-OG_FADE[0]),0,1)*(OG_done(sp)?.45:1);if(f<=0)continue;let im,k;
    if(sp.k==='ev'){im=OG.imE;k='E';_oe.set(0,sp.dir?Math.atan2(sp.dir[0],sp.dir[1]):t*.6,0);_ov.set(sp.x,sp.y+5.6,sp.z);_os.setScalar(1);_oc.set(OG_T[sp.t].col)}
    else if(sp.k==='gold'){im=OG.imG;k='G';_oe.set(0,t*1.6,0);_ov.set(sp.x,sp.y+Math.sin(t*2+sp.x)*.3,sp.z);_os.setScalar(1);_oc.setRGB(1,1,1)}
    else{im=OG.imC;k='C';_oe.set(0,t*1.2,0);_ov.set(sp.x,sp.y-1+Math.sin(t*2+sp.z)*.25,sp.z);_os.setScalar(1.3);_oc.set(OG.A[sp.t]?OG.A[sp.t].th[2]:0xffffff)}
    const i=n[k]++;_oq.setFromEuler(_oe);_om.compose(_ov,_oq,_os);im.setMatrixAt(i,_om);im.setColorAt(i,_oc);im.geometry.attributes.aF.array[i]=f}
  for(const[im,k]of[[OG.imE,'E'],[OG.imG,'G'],[OG.imC,'C']]){im.count=n[k];im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;im.geometry.attributes.aF.needsUpdate=true}}
// ---------- area completion
function OG_stats(a){const s=OG_sv(),o={ev:[0,0],g:[0,0],c:[0,0],st:[0,0]};for(const sp of OG.S){if(sp.a!==a)continue;const q=sp.k==='ev'?o.ev:sp.k==='gold'?o.g:o.c;q[1]++;if(OG_done(sp))q[0]++}
  for(const g of RO.gbs||[]){if(OG_areaAt(g.x,g.z)!==a)continue;o.g[1]++;if(g.m&&!g.m.visible)o.g[0]++}
  for(const m of RO.marks||[]){if(!m.ev||m.dyn||!['rival','boss','quest','otg','challenge','sprint','mode'].includes(m.kind)||!Number.isFinite(m.x)||OG_areaAt(m.x,m.z)!==a)continue;o.st[1]++;try{if(markDone(m))o.st[0]++}catch(e){}}
  const D=o.ev[0]+o.g[0]+o.c[0]+o.st[0],T=o.ev[1]+o.g[1]+o.c[1]+o.st[1];o.pct=T?Math.floor(100*D/T):100;o.D=D;o.T=T;return o}
function OG_areas(){const L=[...new Set(OG.S.map(s=>s.a))];return L.sort()}
function OG_sum(){const s=OG_sv();for(const a of OG_areas())s.sum[a]=OG_stats(a).pct;if(CID!=='fra'){let D=0,T=0;for(const a of OG_areas()){const o=OG_stats(a);D+=o.D;T+=o.T}s.sum['§'+ATHD]=T?Math.floor(100*D/T):0}OG_save()}
function OG_reward(a){const s=OG_sv();if(s.rw[a])return;const o=OG_stats(a);if(o.pct<100)return;s.rw[a]=1;let gift='';try{const own=gbOwn(),q=GB_PATS.find(p=>!own.includes('pat_'+p[0])&&p[2]);if(q){own.push('pat_'+q[0]);store.set('mho_gbown',own);gift=q[1]+' livery'}}catch(e){}
  const S2=season();S2.cr+=5000;saveSeason(S2);OG_save();say('🏆 '+a.toUpperCase()+' 100%',(gift?'Reward: '+gift+' · ':'')+'+5.000 studs',3);OG_snd('finish');OG.log.reward=(OG.log.reward||0)+1}
function OG_pop(a,first){const o=OG_stats(a),el=OG_el('ogArea');const th=OG.A[a]&&OG.A[a].th;el.innerHTML=`<b>📍 ${a.toUpperCase()}</b><div class="ogBar"><i style="width:${o.pct}%"></i></div><em>${o.pct}% COMPLETE</em><span>⚡ ${o.ev[0]}/${o.ev[1]} events · 🧱 ${o.g[0]}/${o.g[1]} golden · ${th?th[1]:'🏺'} ${o.c[0]}/${o.c[1]} · 📖 ${o.st[0]}/${o.st[1]}</span>`;
  el.hidden=false;el.classList.remove('on');void el.offsetWidth;el.classList.add('on');OG.popT=first?2.5:4;OG.lastPop=a}
// ---------- DOM
function OG_el(id){let e=document.getElementById(id);if(e)return e;e=document.createElement('div');e.id=id;e.hidden=true;(document.getElementById('roamHud')||document.body).appendChild(e);return e}
function OG_css(){if(document.getElementById('ogCss'))return;const st=document.createElement('style');st.id='ogCss';st.textContent=`
#ogHud{position:fixed;left:50%;top:calc(142px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:40;background:rgba(12,14,30,.84);border:2px solid #ffd12c;border-radius:14px;color:#fff;font:700 13px system-ui,sans-serif;padding:7px 12px;text-align:center;min-width:220px;max-width:92vw;pointer-events:auto}
#ogHud b{display:block;font:italic 900 15px system-ui,sans-serif;letter-spacing:.08em}#ogHud .ogT{display:flex;gap:8px;justify-content:center;font-size:12px;color:#cfe6f5;margin-top:2px}#ogHud .ogT i{font-style:normal;opacity:.45}#ogHud .ogT i.on{opacity:1}
#ogHud .ogP{font-size:20px;font-weight:900;color:#ffd12c}#ogHud button,#ogRes button{margin-left:8px;background:#ffd12c;color:#111;border:0;border-radius:9px;font:900 12px system-ui;padding:5px 9px;cursor:pointer}
#ogRes{position:fixed;left:50%;top:32%;transform:translate(-50%,-50%);z-index:41;background:radial-gradient(circle,#2a2f5a,#121428);border:3px solid #ffd12c;border-radius:18px;color:#fff;font:800 14px system-ui;padding:14px 22px;text-align:center;pointer-events:auto}
#ogRes .md{font-size:52px;line-height:1}#ogRes.on{animation:ogPop .45s cubic-bezier(.2,1.6,.4,1)}@keyframes ogPop{0%{transform:translate(-50%,-50%) scale(.3)}100%{transform:translate(-50%,-50%) scale(1)}}
#ogArea{position:fixed;left:50%;top:calc(142px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:39;background:rgba(12,14,30,.86);border-left:5px solid #5dffb0;border-radius:12px;color:#fff;font:700 12px system-ui;padding:8px 14px;text-align:center;pointer-events:none;max-width:92vw}
#ogArea b{font:italic 900 16px system-ui;letter-spacing:.1em}#ogArea em{display:block;font-style:normal;color:#5dffb0;font-weight:900}#ogArea.on{animation:ogIn .4s ease-out}@keyframes ogIn{0%{opacity:0;transform:translate(-50%,-14px)}100%{opacity:1}}
.ogBar{height:7px;background:#333a;border-radius:4px;margin:4px 0;overflow:hidden}.ogBar i{display:block;height:100%;background:linear-gradient(90deg,#5dffb0,#ffd12c)}
#ogMapP{position:absolute;right:10px;top:calc(56px + env(safe-area-inset-top,0px));z-index:5;background:rgba(12,14,30,.86);color:#fff;border-radius:12px;padding:8px 10px;font:700 12px system-ui;max-width:min(260px,44vw);max-height:46vh;overflow:auto}
#ogMapP .r{display:flex;justify-content:space-between;gap:8px}#ogMapP .r.cur{color:#ffd12c}#ogMapP button{width:100%;margin-top:6px;background:#ffd12c;border:0;border-radius:8px;font:900 12px system-ui;padding:6px;cursor:pointer}
#ogCol{position:fixed;inset:0;z-index:60;background:rgba(8,10,22,.94);color:#fff;font:700 13px system-ui;overflow:auto;padding:calc(16px + env(safe-area-inset-top,0px)) 16px 16px}
#ogCol h2{margin:0 0 10px;font:italic 900 20px system-ui;letter-spacing:.08em}#ogCol .set{background:#1b1f3a;border-radius:12px;padding:8px 12px;margin:0 0 8px}#ogCol .it{display:inline-block;margin:4px 6px 0 0;padding:3px 7px;border-radius:8px;background:#2a3058;font-size:12px}#ogCol .it.no{opacity:.35}
#ogCol .x{position:sticky;top:0;float:right;background:#ffd12c;border:0;border-radius:9px;font:900 14px system-ui;padding:6px 12px;cursor:pointer}
@media (max-height:500px){#ogHud,#ogArea{top:calc(96px + env(safe-area-inset-top,0px));font-size:11px;padding:5px 10px}#ogHud .ogP{font-size:15px}#ogRes{top:40%;padding:8px 14px}#ogRes .md{font-size:34px}}
body.og-map #ogHud,body.og-map #ogArea{display:none}`;document.head.appendChild(st)}
function OG_hud(){const e=OG.ev,el=OG_el('ogHud');if(!e){el.hidden=true;return}const T=OG_T[e.kind],g=e.goal,u=e.u,lab=[`🥉 ${g[0]}${u}`,`🥈 ${g[1]}${u}`,`🥇 ${g[2]}${u}`],cur=OG_tier(e,OG_val(e,1));
  const html=`<b>${T.ic} ${T.n.toUpperCase()}</b><span class="ogP">${OG_prog(e)}</span> · ${Math.max(0,e.lim-e.tm).toFixed(1)} s<button id="ogRetryB">↻ RETRY (Y)</button><div class="ogT">${lab.map((l,i)=>`<i class="${cur>i?'on':''}">${l}</i>`).join('')}</div>`;
  if(el._h!==html){el._h=html;el.innerHTML=html;const b=el.querySelector('#ogRetryB');b.onclick=()=>OG_retry();b.addEventListener('touchstart',ev=>{ev.preventDefault();ev.stopPropagation();OG_retry()},{passive:false})}el.hidden=false}
function OG_prog(e){const k=e.kind;return k==='gate'?`${e.n}/${e.objs.length} gates`:k==='ring'?`${e.n}/${e.objs.length} rings`:k==='rush'?`${e.n} studs`:k==='smash'?`${e.n} smashed`:k==='drift'?`${Math.round(e.n)} pts`:k==='ghost'?`${Math.round(e.d)} m · ghost ${Math.round(e.gd)} m`:k==='stunt'?(e.land!=null?`${e.land.toFixed(1)} m off`:'hit the ramp'):e.land!=null?`${Math.round(e.land)} m`:'hit the ramp'}
// ---------- events
const OG_mat={};const OG_m=(c,e=1.6)=>OG_mat[c+e]||(OG_mat[c+e]=neonMat(c,e));
function OG_obj(e,m,x,y,z){m.position.set(x,y,z);RO.grp.add(m);e.meshes.push(m);return m}
function OG_start(sp,re){if(OG.ev)return;const G=qvGraph();let i=sp.i??qvNear(sp.x,sp.z,40);if(i<0)return;let dx=Math.sin(RO.h),dz=Math.cos(RO.h);if(re){dx=re.dx;dz=re.dz}
  const t=sp.t,L={gate:560,ring:600,rush:520,smash:420,ghost:650,drift:0,stunt:150,ljump:160}[t];let W=OG_walk(i,dx,dz,L);if(L&&W.len<L*.6){const W2=OG_walk(i,-dx,-dz,L);if(W2.len>W.len){W=W2;dx=-dx;dz=-dz}}
  const e={sp,kind:t,W,t0:performance.now(),tm:0,n:0,lim:30,objs:[],meshes:[],ramps:[],start:{x:RO.x,z:RO.z,h:RO.h,y:RO.y,dx,dz},hi:1,u:'',done:0};OG.ev=e;OG.log.start++;
  const len=W.len||200,tm=(v)=>+(len/v).toFixed(1);const y=(x,z)=>groundY(x,z);
  if(t==='gate'){const n=5;for(let k=1;k<=n;k++){const q=OG_at(W,len*k/(n+.3)),g=new THREE.Group();const w=11;for(const sd of[-1,1]){const p=new THREE.Mesh(OG.gP||(OG.gP=new THREE.BoxGeometry(1,5,1)),OG_m('#ff5a2d',1.2));p.position.set(sd*w/2,2.5,0);g.add(p)}for(let c=0;c<5;c++){const l=new THREE.Mesh(OG.gL||(OG.gL=new THREE.BoxGeometry(2,.45,.45)),OG_m('#ffd12c',1.4));l.position.set(-w/2+1.1+c*2.2,2.6+(c%2)*.4,0);g.add(l)}g.rotation.y=q.h;OG_obj(e,g,q.x,y(q.x,q.z),q.z);e.objs.push({x:q.x,z:q.z,m:g})}
    e.goal=[tm(13),tm(19),tm(25)];e.lim=Math.min(60,Math.max(20,tm(9)));e.hi=0;e.u=' s'}
  else if(t==='ring'){const n=6;for(let k=1;k<=n;k++){const q=OG_at(W,len*k/(n+.3)),r=new THREE.Mesh(OG.rG||(OG.rG=new THREE.TorusGeometry(5.2,.5,8,28)),OG_m('#2f9bff',2.6));r.rotation.y=q.h;OG_obj(e,r,q.x,y(q.x,q.z)+5.4,q.z);e.objs.push({x:q.x,z:q.z,m:r})}
    e.goal=[tm(13),tm(19),tm(25)];e.lim=Math.min(60,Math.max(20,tm(9)));e.hi=0;e.u=' s'}
  else if(t==='rush'){const n=26,im=new THREE.InstancedMesh(OG.sG||(OG.sG=new THREE.CylinderGeometry(.75,.75,.3,12).rotateX(Math.PI/2)),OG_m('#ffd12c',1.8),n);for(let k=0;k<n;k++){const q=OG_at(W,len*(k+1)/(n+1)),o=(k%3-1)*2.2,x=q.x+q.hz*o,z=q.z-q.hx*o;_om.makeTranslation(x,y(x,z)+1.3,z);im.setMatrixAt(k,_om);e.objs.push({x,z,k})}OG_obj(e,im,0,0,0);e.im=im;
    e.goal=[10,17,23];e.lim=Math.min(60,Math.max(20,Math.round(len/17)));e.u=''}
  else if(t==='smash'){const n=14,im=new THREE.InstancedMesh(OG.cG||(OG.cG=new THREE.BoxGeometry(2.2,2.2,2.2)),new THREE.MeshStandardMaterial({color:0xc8862a,roughness:.7}),n);for(let k=0;k<n;k++){const q=OG_at(W,len*(k+1)/(n+1)),o=(k%2?1:-1)*1.6,x=q.x+q.hz*o,z=q.z-q.hx*o;_om.makeTranslation(x,y(x,z)+1.1,z);im.setMatrixAt(k,_om);e.objs.push({x,z,k})}OG_obj(e,im,0,0,0);e.im=im;
    e.goal=[6,10,13];e.lim=Math.min(60,Math.max(20,Math.round(len/21)));e.u=''}
  else if(t==='ghost'){const g=new THREE.Group();const gm=new THREE.MeshBasicMaterial({color:0x9fe8ff,transparent:true,opacity:.45,depthWrite:false});box(g,gm,2.4,1.2,4.4,0,1,0);box(g,gm,2,1,2.2,0,2,-.3);OG_obj(e,g,W.P[0][0],y(W.P[0][0],W.P[0][1]),W.P[0][1]);e.gh=g;
    const f=OG_at(W,len),fl=new THREE.Mesh(OG.fG||(OG.fG=new THREE.TorusGeometry(6,.5,8,28)),OG_m('#ffffff',2.4));fl.rotation.y=f.h;OG_obj(e,fl,f.x,y(f.x,f.z)+6,f.z);e.d=0;e.gd=0;e.gv=len/(len/21);e.fin=f;
    e.goal=[tm(15),tm(21),tm(26)];e.lim=Math.min(60,Math.max(20,tm(10)));e.hi=0;e.u=' s'}
  else if(t==='drift'){const r=new THREE.Mesh(OG.dG||(OG.dG=new THREE.TorusGeometry(70,.6,6,64).rotateX(Math.PI/2)),OG_m('#c46bff',2));OG_obj(e,r,sp.x,y(sp.x,sp.z)+.4,sp.z);e.goal=[450,1000,1800];e.lim=30;e.u=' pts'}
  else if(t==='stunt'||t==='ljump'){const q=OG_at(W,32),big=t==='ljump',len2=big?12:10,hg=big?5:3.2,n0=RO.grp.children.length,r0=RO.ramps.length;addRamp(q.x,q.z,q.h,len2,hg,8,big?0x5dffb0:0xff2d95);e.rampMeshes=RO.grp.children.slice(n0);e.rampR=RO.ramps.slice(r0);e.rampR.forEach(r=>r.og=1);e.ramp=e.rampR[0];
    e.rx=q.x+q.hx*len2/2;e.rz=q.z+q.hz*len2/2;e.rh=q.h;
    if(t==='stunt'){const v=28,rv=v*hg/len2,vy=rv*1.15+3,ft=(vy+Math.sqrt(vy*vy+60*hg))/30,d=v*ft,tx=e.rx+q.hx*d,tz=e.rz+q.hz*d;e.tx=tx;e.tz=tz;for(const[r,c]of[[18,'#ff2d95'],[10,'#ffffff'],[5,'#ffd12c']]){const m=new THREE.Mesh(new THREE.RingGeometry(r-1.2,r,40).rotateX(-Math.PI/2),OG_m(c,1.6));OG_obj(e,m,tx,y(tx,tz)+.15+r*.002,tz)}
      e.goal=[18,10,5];e.lim=25;e.hi=0;e.u=' m'}
    else{e.goal=[28,38,48];e.lim=25;e.u=' m'}}
  OG_snd('go');say(OG_T[t].ic+' '+OG_T[t].n.toUpperCase(),OG_T[t].d,1.4);OG.cool=0;OG_draw();OG_hud()}
function OG_val(e,live){const k=e.kind;if(k==='gate'||k==='ring'||k==='ghost')return e.fin_t??(live?null:null);if(k==='stunt'||k==='ljump')return e.land??null;return e.n}
function OG_tier(e,v){if(v==null)return 0;const g=e.goal;if(e.hi)return v>=g[2]?3:v>=g[1]?2:v>=g[0]?1:0;return v<=g[2]?3:v<=g[1]?2:v<=g[0]?1:0}
function OG_step(dt){const e=OG.ev;e.tm+=dt;const x=RO.x,z=RO.z;const sp=Math.abs(RO.v);
  if(e.tm>e.lim){if((e.kind==='stunt'||e.kind==='ljump')&&RO.takeoff&&e.tm<e.lim+4)return;return OG_end(e.kind==='drift'||e.kind==='rush'||e.kind==='smash'?e.n:null)}
  if(e.kind==='gate'){const o=e.objs.find(o=>!o.done);if(o&&Math.hypot(o.x-x,o.z-z)<7.5){o.done=1;o.m.visible=false;e.n++;OG_boom(o.x,o.z,'#ff5a2d');OG_snd('crash');hitPop('⛓ GATE '+e.n+'/'+e.objs.length);if(e.n===e.objs.length){e.fin_t=e.tm;return OG_end(e.tm)}}}
  else if(e.kind==='ring'){const o=e.objs.find(o=>!o.done);if(o&&Math.hypot(o.x-x,o.z-z)<6.8){o.done=1;o.m.visible=false;e.n++;RO.v=Math.sign(RO.v||1)*Math.min(Math.abs(RO.v)+4,48);if(pl)pl.bm=Math.min(100,pl.bm+8);OG_snd('pick');hitPop('💫 RING '+e.n+'/'+e.objs.length);if(e.n===e.objs.length){e.fin_t=e.tm;return OG_end(e.tm)}}}
  else if(e.kind==='rush'||e.kind==='smash'){for(const o of e.objs){if(o.done)continue;if(Math.hypot(o.x-x,o.z-z)<(e.kind==='rush'?3.6:3.4)&&(e.kind==='rush'||sp>5)){o.done=1;e.n++;_om.makeScale(0,0,0);e.im.setMatrixAt(o.k,_om);e.im.instanceMatrix.needsUpdate=true;if(e.kind==='rush'){OG_snd('pick')}else{OG_boom(o.x,o.z,'#c8862a');OG_snd('crash');RO.v*=.93}}}
    if(e.n===e.objs.length)return OG_end(e.n)}
  else if(e.kind==='ghost'){e.gd=Math.min(e.W.len,e.gd+dt*e.gv);const q=OG_at(e.W,e.gd);e.gh.position.set(q.x,groundY(q.x,q.z),q.z);e.gh.rotation.y=q.h;let bd=1e9,bs=0;const P=e.W.P;for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i],ex=b[0]-a[0],ez=b[1]-a[1],l2=ex*ex+ez*ez||1,u=clamp(((x-a[0])*ex+(z-a[1])*ez)/l2,0,1),d=Math.hypot(a[0]+ex*u-x,a[1]+ez*u-z);if(d<bd){bd=d;bs=e.W.C[i-1]+u*Math.sqrt(l2)}}e.d=Math.max(e.d,bd<25?bs:e.d);
    if(Math.hypot(e.fin.x-x,e.fin.z-z)<8&&e.d>e.W.len*.8){e.fin_t=e.tm;return OG_end(e.tm)}}
  else if(e.kind==='drift'){if(RO.dDir&&Math.hypot(e.sp.x-x,e.sp.z-z)<75){const tr=RO.dT>2?3:RO.dT>1.1?2:RO.dT>.5?1:0;e.n+=dt*sp*1.2*(1+.5*tr)}}
  OG_hud()}
function OG_landed(t){const e=OG.ev;if(!e||!t||(e.kind!=='stunt'&&e.kind!=='ljump')||t.r!==e.ramp)return;if(e.kind==='stunt'){e.land=Math.hypot(RO.x-e.tx,RO.z-e.tz);if(e.land>40)e.land=null}else e.land=Math.hypot(RO.x-t.x,RO.z-t.z);OG_end(e.land)}
function OG_boom(x,z,c){try{const p=V3(x,groundY(x,z)+1.5,z);burst(SPARK,p,22,16,.5,new THREE.Color(c));debris(p,V3(Math.sin(RO.h)*12,6,Math.cos(RO.h)*12),6,[new THREE.Color(c),new THREE.Color('#ffd12c')],.8)}catch(err){}}
function OG_end(v,silent){const e=OG.ev;if(!e)return;OG.ev=null;for(const m of e.meshes)m.parent&&m.parent.remove(m);for(const m of e.rampMeshes||[])m.parent&&m.parent.remove(m);for(const r of e.rampR||[]){const i=RO.ramps.indexOf(r);if(i>=0)RO.ramps.splice(i,1)}
  OG_el('ogHud').hidden=true;OG.cool=2.5;if(silent)return;const md=OG_tier(e,v),s=OG_sv(),prev=s.e[e.sp.id]||0;OG.log.fin++;OG.log.tier[md]++;
  let pay=0;if(md>prev){for(let q=prev+1;q<=md;q++)pay+=OG_PAY[q];s.e[e.sp.id]=md;OG_save()}else if(md)pay=Math.round(OG_PAY[md]*.15);if(pay){const S2=season();S2.cr+=pay;saveSeason(S2)}
  OG.last={sp:e.sp,start:e.start,t:performance.now(),md,v,pay};OG.lastRes=OG.last;OG_res(e,md,v,pay,md>prev);if(md){OG_snd('finish');try{for(let q=0;q<md*3;q++)studBurst(V3(RO.x,RO.y+1.5,RO.z),V3(Math.sin(RO.h),0,Math.cos(RO.h)),10);burst(SPARK,V3(RO.x,RO.y+3,RO.z),40,22,.8,new THREE.Color(['#cd7f32','#cd7f32','#d8dde4','#ffd12c'][md]));fovKick=Math.max(fovKick,6)}catch(err){}}else OG_snd('crash');
  if(md>prev){OG_sum();OG_reward(e.sp.a)}}
function OG_res(e,md,v,pay,fresh){const el=OG_el('ogRes'),T=OG_T[e.kind],nm=['NO MEDAL','BRONZE','SILVER','GOLD'][md],val=v==null?'TIME UP':(e.u===' s'?v.toFixed(1)+' s':Math.round(v)+e.u);
  el.innerHTML=`<div class="md">${['💨','🥉','🥈','🥇'][md]}</div><b>${T.n.toUpperCase()} · ${nm}!</b><div>${val}</div><small>${pay?'+'+pay.toLocaleString('de-DE')+' studs':'no studs this time'}${fresh&&md?' · NEW BEST':''}</small><div><button id="ogRetryR">↻ RETRY (Y)</button></div>`;
  const b=el.querySelector('#ogRetryR');b.onclick=()=>OG_retry();b.addEventListener('touchstart',ev=>{ev.preventDefault();ev.stopPropagation();OG_retry()},{passive:false});
  el.hidden=false;el.classList.remove('on');void el.offsetWidth;el.classList.add('on');clearTimeout(OG_res.t);OG_res.t=setTimeout(()=>el.hidden=true,4500)}
function OG_retry(){const L=OG.ev?{sp:OG.ev.sp,start:OG.ev.start}:OG.last;if(!L||state!=='roam')return false;if(OG.ev)OG_end(null,1);else if(performance.now()-L.t>12000)return false;OG.log.retry++;
  const s=L.start;RO.x=s.x;RO.z=s.z;RO.h=RO.vh=s.h;RO.y=groundAt(s.x,s.z,s.y+2);RO.v=8;RO.vy=0;RO.dDir=0;RO.takeoff=null;RO.lastRamp=null;camSnap=true;OG_el('ogRes').hidden=true;OG_start(L.sp,{dx:s.dx,dz:s.dz});return true}
// ---------- pickups
function OG_pick(sp){const s=OG_sv();if(sp.k==='gold'){s.g[sp.id]=1;OG.log.gold++;const S2=season();S2.cr+=500;saveSeason(S2);OG_snd('brick');say('🧱 GOLDEN BRICK',{ramp:'Found behind the ramp',hill:'Found on the hill top',roof:'Found on the rooftop'}[sp.t]+' · +500 studs',1.6)}
  else{s.c[sp.id]=1;OG.log.col++;const th=OG.A[sp.t].th,got=OG.S.filter(q=>q.k==='col'&&q.t===sp.t&&s.c[q.id]).length,tot=OG.A[sp.t].n;const S2=season();S2.cr+=300;saveSeason(S2);OG_snd('pick');say(th[1]+' '+th[3][sp.ci%5].toUpperCase(),`${th[0]} · ${sp.t} ${got}/${tot}${got===tot?' · SET COMPLETE!':''}`,1.8)}
  try{burst(SPARK,V3(sp.x,sp.y,sp.z),26,14,.6,new THREE.Color('#ffd12c'));studBurst(V3(sp.x,sp.y,sp.z),V3(0,1,0),8)}catch(e){}OG_save();OG_sum();OG_reward(sp.a)}
// mission marks can appear after placement (story steps, encounters): drop spots that now sit on one
function OG_prune(){const sig=(RO.marks||[]).length+':'+(HUB.gates||[]).length;if(sig===OG.mkSig)return;OG.mkSig=sig;const ex=OG_excl(),keep=OG.S.filter(sp=>!OG_near(ex,sp.x,sp.z));if(keep.length===OG.S.length)return;OG.S=keep;const g=new Map();for(const sp of keep){const k=OG_gk(sp.x,sp.z);(g.get(k)||g.set(k,[]).get(k)).push(sp)}OG.grid=g;OG.vis=OG.vis.filter(sp=>keep.includes(sp))}
// ---------- per-frame
function OG_tick(dt){if(state!=='roam'||!RO.on||!RO.built)return;if(!OG.grp||OG.key!==OG_key()){if(!QV.g&&(OG.f++%30))return;if(!OG_build())return}
  OG.cool=Math.max(0,OG.cool-dt);if(OG.ev){if(RO.ch||RO.sp||RO.wk)OG_end(null,1);else OG_step(dt)}
  if(OG.f%120===0)OG_prune();if(++OG.f%8===0)OG_pickVis();
  const busy=RO.ch||RO.sp||RO.wk||RO.card||RO.mapOpen||RO.story||RO.frozen||(window.__m1&&__m1.cs&&__m1.cs());
  if(!OG.ev&&!busy&&OG.cool<=0)for(const sp of OG.vis){const d2=(sp.x-RO.x)**2+(sp.z-RO.z)**2;if(sp.k==='ev'){if(d2<7.2*7.2&&Math.abs(RO.y-sp.y)<6&&Math.abs(RO.v)>3&&!OG_blocked(sp)){OG_start(sp);break}}
    else if(!OG_done(sp)&&d2<4.6*4.6&&Math.abs(RO.y+.8-sp.y)<4.2){OG_pick(sp);OG_pickVis();break}}
  OG_draw();document.body.classList.toggle('og-map',!!RO.mapOpen);
  if(OG.f%30===0){const a=OG_areaAt(RO.x,RO.z);if(a!==OG.area){const first=OG.area==null;OG.area=a;if(!first||OG.f>60)OG_pop(a,first)}}
  if(OG.popT>0){OG.popT-=dt;if(OG.popT<=0)OG_el('ogArea').hidden=true}}
// ---------- map overlay + panel, collection screen
function OG_map(){const cvs=$('#roamMapC');if(!cvs||!RO.mapP||!OG.S.length)return;const g=cvs.getContext('2d'),P=RO.mapP,sc=RO.mapSc||1,W=cvs.width,H=cvs.height,s=OG_sv(),dpr=DPR2();
  const r=Math.max(2.6,Math.min(6,sc*6))*dpr;for(const sp of OG.S){const[px,py]=P(sp.x,sp.z);if(px<-8||py<-8||px>W+8||py>H+8)continue;const d=OG_done(sp);if(d>=3&&sp.k!=='ev')continue;
    g.globalAlpha=d?.45:1;if(sp.k==='ev'){g.fillStyle=OG_T[sp.t].col;g.beginPath();g.arc(px,py,r,0,7);g.fill();if(d>=1){g.strokeStyle='#fff';g.lineWidth=1;g.stroke()}}
    else if(sp.k==='gold'){g.fillStyle='#ffc21a';g.fillRect(px-r,py-r*.6,r*2,r*1.2)}else{g.fillStyle='#fff';g.beginPath();g.moveTo(px,py-r*1.3);g.lineTo(px+r,py+r);g.lineTo(px-r,py+r);g.fill()}}
  g.globalAlpha=1;const C={};for(const sp of OG.S){const c=C[sp.a]||(C[sp.a]={x:0,z:0,n:0});c.x+=sp.x;c.z+=sp.z;c.n++}g.font=`900 ${Math.round(12*dpr)}px system-ui`;g.textAlign='center';
  for(const a in C){const c=C[a];if(c.n<8)continue;const[px,py]=P(c.x/c.n,c.z/c.n);if(px<0||py<0||px>W||py>H)continue;const t=`${a} ${s.sum[a]??OG_stats(a).pct}%`;g.lineWidth=4*dpr;g.strokeStyle='rgba(10,12,30,.85)';g.strokeText(t,px,py);g.fillStyle=s.rw[a]?'#ffd12c':'#5dffb0';g.fillText(t,px,py)}
  OG_mapPanel()}
function OG_mapPanel(){const host=$('#roamMap');if(!host)return;let el=document.getElementById('ogMapP');if(!el){el=document.createElement('div');el.id='ogMapP';host.appendChild(el)}const s=OG_sv(),cur=OG_areaAt(RO.x,RO.z);
  const rows=OG_areas().map(a=>`<div class="r${a===cur?' cur':''}"><span>${a}</span><span>${s.sum[a]??0}%${s.rw[a]?' 🏆':''}</span></div>`).join('');
  const dist=CID!=='fra'?Object.keys(ATH_DIST).map(d=>`<div class="r${d===ATHD?' cur':''}"><span>${d} · ${ATH_DIST[d].name}</span><span>${s.sum['§'+d]!=null?s.sum['§'+d]+'%':'—'}</span></div>`).join('')+'<hr>':'';
  const html=`<b>AREA COMPLETION</b>${dist}${rows}<button id="ogColB">🏺 COLLECTION (U)</button>`;if(el._h!==html){el._h=html;el.innerHTML=html;el.querySelector('#ogColB').onclick=e=>{e.stopPropagation();OG_col(true)}}}
function OG_col(on){const el=OG_el('ogCol');if(!on){el.hidden=true;return}const s=OG_sv();let h=`<button class="x" id="ogColX">✕ CLOSE</button><h2>🏺 UNIQUE COLLECTIBLES · ${OG_distName().toUpperCase()}</h2>`;
  for(const a of Object.keys(OG.A).sort()){const A=OG.A[a];if(!A.n)continue;const L=OG.S.filter(q=>q.k==='col'&&q.t===a).sort((p,q)=>p.ci-q.ci),got=L.filter(q=>s.c[q.id]).length,o=OG_stats(a);
    h+=`<div class="set"><b>${A.th[1]} ${a} · ${A.th[0]}</b> <span>${got}/${L.length}${got===L.length?' ✔ SET COMPLETE':''}</span><div class="ogBar"><i style="width:${o.pct}%"></i></div><small>${o.pct}% area · 🧱 ${o.g[0]}/${o.g[1]} golden · ⚡ ${o.ev[0]}/${o.ev[1]} events${s.rw[a]?' · 🏆 reward claimed':''}</small><div>${L.map(q=>`<span class="it${s.c[q.id]?'':' no'}">${s.c[q.id]?A.th[1]+' '+A.th[3][q.ci%5]:'❔ ???'}</span>`).join('')}</div></div>`}
  el.innerHTML=h;el.querySelector('#ogColX').onclick=()=>OG_col(false);el.hidden=false}
// ---------- hooks (re-binding; non-OG callers fall straight through)
roamStep=(f=>function(dt){f(dt);try{OG_tick(dt)}catch(e){if(OG.err++<3)console.warn('OG',e)}})(roamStep);
roamLanded=(f=>function(){const t=RO.takeoff;f.apply(this,arguments);try{OG_landed(t)}catch(e){}})(roamLanded);
drawRoamMap=(f=>function(){f.apply(this,arguments);try{OG_map()}catch(e){if(OG.err++<3)console.warn('OG map',e)}})(drawRoamMap);
addEventListener('keydown',e=>{if(state!=='roam'||e.repeat)return;if(e.code==='KeyY'){if(OG_retry())e.preventDefault()}else if(e.code==='KeyU'){const el=document.getElementById('ogCol');OG_col(!el||el.hidden)}else if(e.code==='Escape'){const el=document.getElementById('ogCol');if(el&&!el.hidden){OG_col(false);e.stopImmediatePropagation()}}});
OG_css();
window.__og={OG,T:OG_T,build:()=>OG_build(),sv:()=>OG_sv(),stats:a=>OG_stats(a),areas:()=>OG_areas(),areaAt:(x,z)=>OG_areaAt(x,z),start:id=>{const sp=OG.S.find(q=>q.id===id);if(sp)OG_start(sp);return !!OG.ev},retry:()=>OG_retry(),
  end:()=>OG_end(null,1),ev:()=>OG.ev&&{t:OG.ev.kind,n:OG.ev.n,time:OG.ev.tm,lim:OG.ev.lim,goal:OG.ev.goal,hi:OG.ev.hi,P:OG.ev.W.P,len:OG.ev.W.len,objs:OG.ev.objs.map(o=>[o.x,o.z,!!o.done]),ramp:OG.ev.ramp&&{x:OG.ev.ramp.x,z:OG.ev.ramp.z,h:OG.ev.ramp.h,len:OG.ev.ramp.len},tx:OG.ev.tx,tz:OG.ev.tz,d:OG.ev.d,gd:OG.ev.gd},
  appr:(id,back=55)=>{const sp=OG.S.find(q=>q.id===id);if(!sp)return null;const G=qvGraph(),i=sp.i??qvNear(sp.x,sp.z,40);let d=sp.dir;if(!d){const j=G.nb[G.off[i]],l=Math.hypot(G.X[j]-G.X[i],G.Z[j]-G.Z[i])||1;d=[(G.X[i]-G.X[j])/l,(G.Z[i]-G.Z[j])/l]}const W=OG_walk(i,-d[0],-d[1],back),F=OG_walk(i,d[0],d[1],60);return{P:W.P.slice().reverse().concat(F.P.slice(1)),d}},
  spots:()=>OG.S.map(s=>({id:s.id,k:s.k,t:s.t,x:s.x,z:s.z,y:s.y,a:s.a,done:OG_done(s),dir:s.dir})),vis:()=>OG.vis.map(s=>s.id),drawn:()=>OG.imE?OG.imE.count+OG.imG.count+OG.imC.count:0,samples:()=>OG.smp,
  excl:()=>OG_excl(),nav:()=>[...OG.navC].length,col:on=>OG_col(on),pop:a=>OG_pop(a||OG_areaAt(RO.x,RO.z)),tick:()=>{OG_prune();OG_pickVis()},blocked:id=>{const sp=OG.S.find(q=>q.id===id);return sp&&OG_blocked(sp)},roofOn:id=>{const sp=OG.S.find(q=>q.id===id);if(sp)OG_roofOn(sp);return sp&&sp.roof&&{...sp.roof,deck:undefined}}};
