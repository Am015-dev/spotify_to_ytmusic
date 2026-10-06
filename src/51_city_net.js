// ---------- Kenney CC0 models (City Kit Commercial/Suburban/Roads, Car Kit, Nature Kit, Watercraft): quantized, decoded on demand
let KMBUF=null;const KMG={},KMM={};
function kmBuf(){if(!KMBUF){const s=atob(KM_BIN),a=new Uint8Array(s.length);for(let i=0;i<s.length;i++)a[i]=s.charCodeAt(i);KMBUF=a.buffer}return KMBUF}
function kmGeo(nm,sc=1){const key=nm+'@'+sc;if(KMG[key])return KMG[key];const[kit,off,n,ni,mx,my,mz,sx,sy,sz,tx,big]=KM_IDX[nm],B=kmBuf(),al=v=>(v+3)&~3;let o=off;
  const q=new Int16Array(B,o,n*3);o=al(o+n*6);const nr=new Int8Array(B,o,n*3);o=al(o+n*3);const pos=new Float32Array(n*3),nrm=new Float32Array(n*3),mn=[mx,my,mz],S3=[sx,sy,sz];
  for(let i=0;i<n*3;i++){pos[i]=(mn[i%3]+(q[i]+32768)/65535*S3[i%3])*sc;nrm[i]=nr[i]/127}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nrm,3));
  if(tx){const u=new Uint16Array(B,o,n*2);o=al(o+n*4);const uv=new Float32Array(n*2);for(let i=0;i<n*2;i++)uv[i]=u[i]/65535;g.setAttribute('uv',new THREE.BufferAttribute(uv,2))}
  else{const c=new Uint8Array(B,o,n*3);o=al(o+n*3);const col=new Float32Array(n*3);for(let i=0;i<n*3;i++)col[i]=c[i]/255;g.setAttribute('color',new THREE.BufferAttribute(col,3))}
  g.setIndex(new THREE.BufferAttribute(big?new Uint32Array(B.slice(o,o+ni*4)):new Uint16Array(B.slice(o,o+ni*2)),1));g.computeBoundingBox();g.computeBoundingSphere();return KMG[key]=g}
function kmKit(nm){return KM_IDX[nm][0]}
function kmSize(nm,sc=1){const e=KM_IDX[nm];return[e[7]*sc,e[8]*sc,e[9]*sc]}
function kmMat(kit){if(KMM[kit])return KMM[kit];let m;if(kit==='nat')m=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.85,metalness:0});
  else{const t=new THREE.TextureLoader().load(KM_TEX[kit]);t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.flipY=false;KEEP_TEX.add(t);
    m=new THREE.MeshStandardMaterial({map:t,roughness:.55,metalness:.05,emissiveMap:kit==='com'||kit==='sub'?t:null,emissive:kit==='com'||kit==='sub'?new THREE.Color('#ffffff'):new THREE.Color(0),emissiveIntensity:.1})}
  return KMM[kit]=m}
// ---------- real-Frankfurt layout (Stage 2). Real data (metres east e / north n of the Römerberg) enters only through WP(e,n):
// 1:1 inside the city box, compressed x0.35 outside; real east is world -x (the camera shows -x on the right when facing north/+z)
const ATH_DIST={A:{id:'A',name:'Historic Centre',el:'Istoriko Kentro',r:[[-1350,760,-1150,1000]],st:[39,29],col:'#e8b04a'},
  B:{id:'B',name:'Syntagma · Kolonaki',el:'Syntagma · Lykavittos',r:[[760,2700,-1350,1250],[300,760,1000,1250]],st:[829,-40],col:'#4ab0e8'},
  C:{id:'C',name:'Ambelokipi · Psychiko',el:'Ampelokipoi · Psychiko',r:[[2700,5300,-400,4600]],st:[3099,943],col:'#6ad06a'},
  D:{id:'D',name:'Chalandri · Marousi',el:'Chalandri · Marousi',r:[[5300,8000,3700,8700]],st:[6350,5073],col:'#d07ad0'}};
const SM_ON=CID==='ath'&&(()=>{try{return !/[?&]sm=0/.test(location.search)&&localStorage.getItem('mho_sm')!=='0'}catch(e){return true}})();
const SM={cross:0,log:[],first:1};let SM_WR=null,SM_GT=null;
function SM_inD(x,z,m){const W=SM_WR||(SM_WR=Object.values(ATH_DIST).flatMap(D=>D.r).map(r=>rfRect(r)));for(const r of W)if(inR(r,x,z,m))return true;return false}
function SM_dz(x,z){return SM_ON?(athDistAt(...RW(x,z))||ATHD):ATHD}
let ATHD=(()=>{try{const v=localStorage.getItem('mho_athd@'+SLOT);return ATH_DIST[v]?v:'A'}catch(e){return 'A'}})();
const athIn=(d,e,n)=>ATH_DIST[d].r.some(([a,b,c,f])=>e>=a&&e<b&&n>=c&&n<f),athDistAt=(e,n)=>{for(const d in ATH_DIST)if(athIn(d,e,n))return d;return null};
function athDistCfg(){const R=SM_ON?Object.values(ATH_DIST).flatMap(D=>D.r):ATH_DIST[ATHD].r,e0=Math.min(...R.map(r=>r[0])),e1=Math.max(...R.map(r=>r[1])),n0=Math.min(...R.map(r=>r[2])),n1=Math.max(...R.map(r=>r[3])),M=300;
  return{box:[e0,e1,n0,n1],k:1,off:[1850,1750],world:[-(e1+M-1850),-(e0-M-1850),n0-M-1750,n1+M-1750],lay:102,dist:ATHD,name:'Athens · '+ATH_DIST[ATHD].name}}
const CITYCFG={fra:{id:'fra',name:'Frankfurt',data:'rf-data',box:[-3000,3000,-1800,2600],k:.35,off:[0,0],world:[-8000,8000,-5200,7000],mood:'brick',lay:2,fb:['Frankfurt','Outskirts'],edge:['Hanau ▸','◂ Wiesbaden','▾ Darmstadt','▴ Gießen'],edgeT:'EDGE OF THE MAP',raise:'Raising Frankfurt',career:'MAINHATTAN CAREER',ch:'Chapter',code:'FRA',to:'ath',flyTxt:'✈ Boarding · FRA → ATH',arrTxt:'✈ Landing in Frankfurt',flight:'LH 1284 · 2 h 50 min',gnd:'#6cbf45'},
 ath:{id:'ath',name:'Athens',data:'ath-data',box:[-1300,3500,-1300,2000],k:.55,off:[1850,1750],world:[-4100,4100,-3800,3800],mood:'athens',lay:101,fb:['Athens','Attica'],edge:['Ymittos · Agia Paraskevi ▸','◂ Piraeus','▾ Faliro','▴ Kifisia · Marousi'],edgeT:'EDGE OF THE MAP',raise:'Raising Athens',career:'AKROPOLIS CUP',ch:'Chapter',code:'ATH',to:'fra',flyTxt:'✈ Boarding · ATH → FRA',arrTxt:'✈ Landing in Athens',flight:'A3 840 · 2 h 55 min',gnd:'#6cbf45'}};if(CID==='ath')Object.assign(CITYCFG.ath,athDistCfg());const CCF=CITYCFG[CID];
const HWY=-3.2,[RF_E0,RF_E1,RF_N0,RF_N1]=CCF.box,RF_K=CCF.k,[RF_EO,RF_NO]=CCF.off;
const rfC=(v,lo,hi)=>v>hi?hi+(v-hi)*RF_K:v<lo?lo+(v-lo)*RF_K:v,rfU=(v,lo,hi)=>v>hi?hi+(v-hi)/RF_K:v<lo?lo+(v-lo)/RF_K:v;
const WP=(e,n)=>[-(rfC(e,RF_E0,RF_E1)-RF_EO),rfC(n,RF_N0,RF_N1)-RF_NO],RW=(x,z)=>[rfU(RF_EO-x,RF_E0,RF_E1),rfU(z+RF_NO,RF_N0,RF_N1)],rfWorld=WP;
const HX0=WP(RF_E1,0)[0],HX1=WP(RF_E0,0)[0],HZS=WP(0,RF_N0)[1],HZN=WP(0,RF_N1)[1],HZT=HZS;
const MIRX=v=>-v,LAYOUT_VER=CCF.lay;
const RF=JSON.parse(document.getElementById(CCF.data).textContent);
const[WX0,WX1,WZS,WZN]=CCF.world;const inCity=(x,z,m=0)=>x>HX0-m&&x<HX1+m&&z>HZT-m&&z<HZN+m&&(!SM_ON||SM_inD(x,z,m));
const rfRect=r=>{const[a,b]=WP(r[0],r[2]),[c,d]=WP(r[1],r[3]);return{x0:Math.min(a,c),x1:Math.max(a,c),z0:Math.min(b,d),z1:Math.max(b,d)}},inR=(R,x,z,m=0)=>x>R.x0-m&&x<R.x1+m&&z>R.z0-m&&z<R.z1+m;
// Athens street network (real e/n): [cls, w*2, name|id, n, zigzag deltas] as varints in base64
function athNetDecode(){const N=RF.net;if(!N)return[];const b=atob(N.b64),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);let o=0;const v=()=>{let r=0,s=1,c;do{c=u[o++];r+=(c&127)*s;s*=128}while(c&128);return r},zz=()=>{const x=v();return x%2?-(x+1)/2:x/2};
  const CL=['arterial','main','sec','res','ped','link'],out=[];while(o<u.length){const c0=v(),cls=CL[c0&7],one=c0>>3&1,w=v()/2,ni=v(),n=v(),pts=[];let e=0,nn=0;for(let k=0;k<n;k++){e+=zz();nn+=zz();pts.push([e,nn])}const[name,id]=N.names[ni].split('|');out.push({cls,one,w,name,id:id||(name?'a'+ni:'u'),pts})}return out}
// linear samples (<= step apart) that keep every vertex; vertices carry their key (junction lookup)
function linSamples(pts,step,keys){const P=[];let s=0;for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.ceil(L/step));for(let k=0;k<n;k++){const t=k/n,p={x:a[0]+(b[0]-a[0])*t,z:a[1]+(b[1]-a[1])*t,s:s+L*t};if(k===0)p.k=keys[i];P.push(p)}s+=L}
  const l=pts[pts.length-1];P.push({x:l[0],z:l[1],s,k:keys[pts.length-1]});for(let i=0;i<P.length;i++){const a=P[Math.max(0,i-1)],b=P[Math.min(P.length-1,i+1)],m=Math.hypot(b.x-a.x,b.z-a.z)||1;P[i].tx=(b.x-a.x)/m;P[i].tz=(b.z-a.z)/m}return{pts:P,L:s}}
function polySamples(pts,step){const c=new THREE.CatmullRomCurve3(pts.map(p=>V3(p[0],0,p[1])));const L=c.getLength(),n=Math.max(2,Math.ceil(L/step)),P=c.getSpacedPoints(n).map(v=>({x:v.x,z:v.z}));
  for(let i=0;i<P.length;i++){const a=P[Math.max(0,i-1)],b=P[Math.min(P.length-1,i+1)],l=Math.hypot(b.x-a.x,b.z-a.z)||1;P[i].tx=(b.x-a.x)/l;P[i].tz=(b.z-a.z)/l;P[i].s=i*L/n}return{pts:P,L}}
// ---------- the Main (and the Osthafen basin) as polylines with a half-width profile: riverAt / inRiver(x,z)
const rfHW=e=>{const T=[[-3000,90],[-1500,85],[-1150,70],[950,70],[1500,85],[3000,90]];if(e<=T[0][0])return T[0][1];for(let i=1;i<T.length;i++)if(e<=T[i][0]){const a=T[i-1],b=T[i];return a[1]+(b[1]-a[1])*(e-a[0])/(b[0]-a[0])}return 90};
const WATERS=[];{const mk=(id,name,real,hwf,basin)=>{const S=polySamples(real.map(p=>WP(p[0],p[1])),8);for(const p of S.pts)p.hw=hwf(RW(p.x,p.z)[0]);WATERS.push({id,name,basin:!!basin,pts:S.pts,L:S.L})};
  if(RF.river.length)mk('main','Main',RF.river,rfHW);for(const b of RF.basins)mk(b.id,b.name,b.pts,()=>b.hw,1)}
const MAINR=WATERS[0],RIV_C=128,RIV_G=new Map();WATERS.forEach((S,wi)=>S.pts.forEach((p,i)=>{const k=Math.floor(p.x/RIV_C)*100000+Math.floor(p.z/RIV_C);let L=RIV_G.get(k);if(!L)RIV_G.set(k,L=[]);L.push(wi,i)}));
let _rwi=0,_ri=0;
function rivNear(x,z){const kx=Math.floor(x/RIV_C),kz=Math.floor(z/RIV_C);let bd=1e12,bw=-1,bi=0;for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const L=RIV_G.get((kx+a)*100000+kz+b);if(!L)continue;for(let j=0;j<L.length;j+=2){const p=WATERS[L[j]].pts[L[j+1]],dx=p.x-x,dz=p.z-z,d=dx*dx+dz*dz;if(d<bd){bd=d;bw=L[j];bi=L[j+1]}}}_rwi=bw;_ri=bi;return bw>=0}
// {d: signed lateral (+ = real north bank), a: along offset from the sample, s, hw, tx,tz, w: water body, end: metres beyond an open end}
function riverAt(x,z){if(!rivNear(x,z))return null;const S=WATERS[_rwi],p=S.pts[_ri],a=(x-p.x)*p.tx+(z-p.z)*p.tz,d=(x-p.x)*p.tz-(z-p.z)*p.tx,sp=p.s+a;return{d,a,s:sp,hw:p.hw,tx:p.tx,tz:p.tz,w:S,i:_ri,p,end:Math.max(-sp,sp-S.L)}}
function inRiver(x,z,m=0){if(!rivNear(x,z))return false;const S=WATERS[_rwi],p=S.pts[_ri],a=(x-p.x)*p.tx+(z-p.z)*p.tz,sp=p.s+a;if(sp<-1||sp>S.L+1)return false;const d=(x-p.x)*p.tz-(z-p.z)*p.tx;return d<p.hw-m&&d>m-p.hw}
const inWater=inRiver;
function rivClear(x,z){let b=1e9;for(const S of WATERS)for(let i=0;i<S.pts.length;i+=3){const p=S.pts[i],d=Math.hypot(p.x-x,p.z-z)-p.hw;if(d<b)b=d}return b}
// signed side of the Main for a point (+1 real north, -1 south), from the nearest centre sample (coarse, any distance)
function rivSide(x,z){if(!MAINR)return 1;const P=MAINR.pts;let b=1e18,bi=0;for(let i=0;i<P.length;i+=4){const d=(P[i].x-x)**2+(P[i].z-z)**2;if(d<b){b=d;bi=i}}const p=P[bi];return (x-p.x)*p.tz-(z-p.z)*p.tx>=0?1:-1}
// ---------- oriented decks: {cx,cz,ux,uz (unit along the deck), half, w, prof 'hump'|'ramp', H, L}
function deckLocal(b,x,z){const dx=x-b.cx,dz=z-b.cz;return[dx*b.ux+dz*b.uz,dx*b.uz-dz*b.ux]}
function deckY(b,a){const A=Math.abs(a);if(A>b.half)return null;if(b.prof==='ramp')return A>b.half-b.L?b.H*(b.half-A)/b.L:b.H;const t=A/b.half;return b.H*(1-t*t)}
function deckAt(b,x,z){if(Math.abs(x-b.cx)>b.r||Math.abs(z-b.cz)>b.r)return null;const dx=x-b.cx,dz=z-b.cz,c=dx*b.uz-dz*b.ux;if(Math.abs(c)>=b.w/2)return null;return deckY(b,dx*b.ux+dz*b.uz)}
const deckPt=(b,a,c=0)=>[b.cx+a*b.ux+c*b.uz,b.cz+a*b.uz-c*b.ux];
// the real bridges: centre snapped to the river, axis = river normal (no hand-entered angles), hump decks meet the quay roads at grade
const BRIDGES=RF.bridges.map(([id,name,e,n,w,H,kind,look])=>{const[x0,z0]=WP(e,n);rivNear(x0,z0);const S=WATERS[_rwi],p=S.pts[_ri],b={id,name,kind,look,cx:p.x,cz:p.z,ux:p.tz,uz:-p.tx,w,H:H||3,prof:H?'hump':'ramp',L:18,hw:p.hw,half:p.hw+(kind==='foot'?6:7),water:S.id};b.r=b.half+b.w;return b});
const SLIPS=RF.slips.map(([e,sd])=>{const P=MAINR.pts;let bi=0,bd=1e9;P.forEach((p,i)=>{const d=Math.abs(RW(p.x,p.z)[0]-e);if(d<bd){bd=d;bi=i}});const p=P[bi];return{x:p.x+p.tz*sd*p.hw,z:p.z-p.tx*sd*p.hw,tx:p.tx,tz:p.tz,ix:-p.tz*sd,iz:p.tx*sd,sd,i:bi}});
// ---------- streets: real polylines (ring, radials, quays), split where they would cross water off a bridge
const CITY_S=[];
{const raw=RF.streets.map(([id,name,cls,w,pts])=>({id,name,cls,w,pts:pts.map(p=>WP(p[0],p[1]))}));
  if(CID!=='fra')for(const q of (N=>{const H=new Map(),K=40,add=(x,z)=>{const k=Math.floor(x/K)*100000+Math.floor(z/K);let L=H.get(k);if(!L)H.set(k,L=[]);L.push(x,z)},near=(x,z,r)=>{const cx=Math.floor(x/K),cz=Math.floor(z/K),n=Math.ceil(r/K);for(let a=-n;a<=n;a++)for(let b=-n;b<=n;b++){const L=H.get((cx+a)*100000+cz+b);if(L)for(let i=0;i<L.length;i+=2)if((L[i]-x)**2+(L[i+1]-z)**2<r*r)return true}return false},W=q=>q.pts.map(p=>WP(p[0],p[1])),samp=P=>{const o=[];for(let i=0;i<P.length-1;i++){const d=Math.hypot(P[i+1][0]-P[i][0],P[i+1][1]-P[i][1]),n=Math.max(1,Math.ceil(d/20));for(let k=0;k<n;k++)o.push([P[i][0]+(P[i+1][0]-P[i][0])*k/n,P[i][1]+(P[i+1][1]-P[i][1])*k/n])}if(P.length)o.push(P[P.length-1]);return o},sp=Object.values(RF.spots).map(s=>WP(s[0],s[1])),keep=new Set(),res=[];for(const q of N){if(q.cls==='res')res.push(q);else for(const[x,z]of samp(W(q)))add(x,z)} res.sort((a,b)=>b.pts.length-a.pts.length);for(const q of res){const S=samp(W(q));const far=S.filter(([x,z])=>!near(x,z,75)).length,ns=S.some(([x,z])=>sp.some(([sx,sz])=>(x-sx)**2+(z-sz)**2<4900));if(ns||far>=Math.max(2,S.length*.3)){keep.add(q);for(const[x,z]of S)add(x,z)}}return N.filter(q=>q.cls!=='res'||keep.has(q))})(athNetDecode())){const pts=q.pts.map(p=>WP(p[0],p[1]));if(!pts.some(([x,z])=>x>WX0&&x<WX1&&z>WZS&&z<WZN&&(!SM_ON||SM_inD(x,z,300))))continue;const cmp=false;raw.push({id:q.id,name:q.name,cls:q.cls,one:q.one,w:cmp&&(q.cls==='res'||q.cls==='sec')?Math.max(6.5,q.w*.85):q.w,pts,lin:1,keys:q.pts.map(p=>p[0]+'|'+p[1])})}
  for(const[id,name,sd,w,e0,e1]of RF.quays){const P=MAINR.pts,pts=[];for(let i=0;i<P.length;i+=3){const p=P[i],e=RW(p.x,p.z)[0];if(e<e0||e>e1)continue;const o=sd*(p.hw+18);pts.push([p.x+p.tz*o,p.z-p.tx*o])}raw.push({id,name,cls:'quay',w,pts,side:sd})}
  const onDeck=(x,z,m)=>BRIDGES.some(b=>{if(Math.abs(x-b.cx)>b.r+m||Math.abs(z-b.cz)>b.r+m)return false;const[a,c]=deckLocal(b,x,z);return Math.abs(a)<b.half+3&&Math.abs(c)<b.w/2+m});
  for(const r of raw){const S=r.lin?linSamples(r.pts,8,r.keys):polySamples(r.pts,8),P=S.pts;let run=[];const flush=()=>{if(run.length>=(r.lin?2:4)){const s0=run[0].s;CITY_S.push({r,pts:run.map(p=>({...p,s:p.s-s0})),L:run[run.length-1].s-s0})}run=[]};
    for(const p of P){const bad=inRiver(p.x,p.z,-6)||onDeck(p.x,p.z,r.w/2)||p.x<WX0+30||p.x>WX1-30||p.z<WZS+30||p.z>WZN-30;if(bad)flush();else run.push(p)}flush()}}
// ===== OB roads: audit + load-time repair of the drawn street network (CITY_S), run once BEFORE the street grid, junctions (AJ/JUNC),
// meshes and the traffic / GPS graph (HUB.nodes -> QV) are built, so the drawn roads and the GPS graph come from the same fixed data.
// Fixes: crossings without a junction (shared vertex inserted), dead ends < 40 m from a road snapped onto it (with a junction),
// short dead-end stubs that cannot reach a road trimmed back to their junction, orphan fragments linked to the main network or removed.
// localStorage.ob_nofix='1' disables the repair (raw network) so before/after can be measured from the same build.
const OB_RA={on:!(()=>{try{return localStorage.getItem('ob_nofix')==='1'}catch(e){return false}})(),before:null,fixed:null,ops:{cross:0,snap:0,trim:0,del:0,link:0,delOrphan:0,rounds:0},ms:0};
const OB_DRV=S=>S.r.cls!=='ped'&&S.r.cls!=='hill',OB_KA=new Map();
const OB_kf=k=>{if(k==null)return k;let r=k;while(OB_KA.has(r))r=OB_KA.get(r);return r};
const OB_kunion=(a,b)=>{a=OB_kf(a);b=OB_kf(b);if(a!==b)OB_KA.set(b,a);return a};
let OB_kn=0;const OB_log=(t,x,z,d)=>{if(OB_RA.log.length<400)OB_RA.log.push([t,Math.round(x),Math.round(z),Math.round(d)])};OB_RA.log=[];
// is (x,z) a deliberate cut (world edge, river bank, bridge deck)? such ends are not dead ends
function OB_cut(x,z,w){if(x<WX0+44||x>WX1-44||z<WZS+44||z>WZN-44)return 1;if(WATERS.length&&inRiver(x,z,-24))return 2;
  for(const b of BRIDGES){if(b.kind==='foot'||Math.abs(x-b.cx)>b.r+40||Math.abs(z-b.cz)>b.r+40)continue;const[a,c]=deckLocal(b,x,z);if(Math.abs(a)<b.half+26&&Math.abs(c)<b.w/2+w/2+14)return 3}return 0}
function OB_okLine(x0,z0,x1,z1){const d=Math.hypot(x1-x0,z1-z0),n=Math.max(1,Math.ceil(d/3));for(let m=0;m<=n;m++){const x=x0+(x1-x0)*m/n,z=z0+(z1-z0)*m/n;if(x<WX0+30||x>WX1-30||z<WZS+30||z>WZN-30)return false;if(WATERS.length&&inRiver(x,z,-6))return false;
  for(const b of BRIDGES){if(Math.abs(x-b.cx)>b.r+8||Math.abs(z-b.cz)>b.r+8)continue;const[a,c]=deckLocal(b,x,z);if(Math.abs(a)<b.half+3&&Math.abs(c)<b.w/2+4)return false}}return true}
// snapshot of the drivable network: samples grid, junction flags (the game's own rules), union-find components, dead ends
function OB_net(segs,ext){segs=segs||CITY_S.filter(OB_DRV);const n=segs.length,G=new Map(),ck=(x,z)=>(Math.floor(x/32)+4096)*8192+Math.floor(z/32)+4096;
  segs.forEach((S,a)=>S.pts.forEach((p,i)=>{const k=ck(p.x,p.z);let L=G.get(k);if(!L)G.set(k,L=[]);L.push(a,i)}));
  const cells=(x,z,R,f)=>{const r=Math.ceil(R/32),kx=Math.floor(x/32)+4096,kz=Math.floor(z/32)+4096;for(let a=-r;a<=r;a++)for(let c=-r;c<=r;c++){const L=G.get((kx+a)*8192+kz+c);if(L)for(let j=0;j<L.length;j+=2)f(L[j],L[j+1])}};
  const near=(x,z,R,skip)=>{let b=null,bd=R*R;cells(x,z,R,(a,i)=>{if(a===skip)return;const p=segs[a].pts[i],d=(p.x-x)**2+(p.z-z)**2;if(d<bd){bd=d;b=[a,i,0]}});if(b)b[2]=Math.sqrt(bd);return b};
  // nearest point on the sample polylines: {a,i (piece start),t,x,z,d}
  const proj=(x,z,R,flt)=>{let b=null,bd=R;cells(x,z,R+10,(a,i)=>{if(flt&&!flt(a,i))return;const P=segs[a].pts;for(const k of[i-1,i]){if(k<0||k+1>=P.length)continue;const p=P[k],q=P[k+1],dx=q.x-p.x,dz=q.z-p.z,l2=dx*dx+dz*dz||1e-9,t=clamp(((x-p.x)*dx+(z-p.z)*dz)/l2,0,1),px=p.x+dx*t,pz=p.z+dz*t,d=Math.hypot(px-x,pz-z);if(d<bd){bd=d;b={a,i:k,t,x:px,z:pz,d}}}});return b};
  const par=new Int32Array(n+BRIDGES.length+(ext?ext.extra:0)).map((_,i)=>i),find=i=>{while(par[i]!==i){par[i]=par[par[i]];i=par[i]}return i},uni=(a,b)=>{a=find(a);b=find(b);if(a!==b)par[b]=a};
  const jf=segs.map(S=>new Uint8Array(S.pts.length)),joins=[];
  if(CID!=='fra'){const K=new Map();segs.forEach((S,a)=>S.pts.forEach((p,i)=>{if(p.k==null)return;const k=OB_kf(p.k);let L=K.get(k);if(!L)K.set(k,L=[]);L.push(a,i)}));
    for(const L of K.values()){if(L.length<4)continue;for(let j=0;j<L.length;j+=2){jf[L[j]][L[j+1]]=1;uni(L[0],L[j]);for(let m=0;m<j;m+=2)joins.push(L[m],L[j],segs[L[j]].pts[L[j+1]].x,segs[L[j]].pts[L[j+1]].z)}}}
  else segs.forEach((S,a)=>{const P=S.pts;for(let i=0;i<P.length;i++){const end=i===0||i===P.length-1,q=near(P[i].x,P[i].z,end?64:6,a);if(!q)continue;const wB=segs[q[0]].r.w;if(q[2]<6||(end&&q[2]<wB/2+10)){jf[a][i]=1;jf[q[0]][q[1]]=1;uni(a,q[0]);joins.push(a,q[0],P[i].x,P[i].z)}}});
  // ends: deliberate cuts and bridge joins
  const cut=segs.map(()=>[0,0]);segs.forEach((S,a)=>{const P=S.pts;[0,P.length-1].forEach((i,e)=>{const p=P[i],c=OB_cut(p.x,p.z,S.r.w);cut[a][e]=c;if(c===3){BRIDGES.forEach((b,bi)=>{if(b.kind==='foot')return;const[u,v]=deckLocal(b,p.x,p.z);if(Math.abs(u)<b.half+26&&Math.abs(v)<b.w/2+S.r.w/2+14)uni(n+bi,a)})}})});
  if(ext)ext.link({segs,uni,cut,jf,n,near,proj});
  const len=segs.map(S=>S.L),root=segs.map((_,a)=>find(a)),cl=new Map();segs.forEach((S,a)=>cl.set(root[a],(cl.get(root[a])||0)+S.L));
  let main=-1,mL=-1;for(const[r,l]of cl)if(l>mL){mL=l;main=r}
  const tot=len.reduce((s,v)=>s+v,0);
  // dead ends + stub length (dead end -> first junction along the piece)
  const dead=[];segs.forEach((S,a)=>{const P=S.pts;for(const e of[0,1]){const i0=e?P.length-1:0;if(jf[a][i0]||cut[a][e])continue;let st=S.L;if(!e){for(let i=0;i<P.length;i++)if(jf[a][i]){st=P[i].s;break}}else{for(let i=P.length-1;i>=0;i--)if(jf[a][i]){st=S.L-P[i].s;break}}
    if(st>=S.L-1e-6){const oe=e?0:P.length-1;if(!(jf[a][oe]||cut[a][1-e])&&e===1)continue}
    dead.push({a,e,i:i0,x:P[i0].x,z:P[i0].z,st})}});
  return{segs,G,cells,near,proj,par,find,uni,jf,joins,cut,root,main,mainL:mL,tot,dead,comps:cl}}
function OB_sum(N,extra){const near12=N.dead.filter(D=>{const S=N.segs[D.a],sE=S.pts[D.i].s;return !!N.proj(D.x,D.z,12,(a,i)=>a!==D.a||Math.abs(N.segs[a].pts[i].s-sE)>40)}).length;
  let orphN=0,orphL=0;for(const[r,l]of N.comps)if(r!==N.main){orphN++;orphL+=l}
  return Object.assign({segs:N.segs.length,km:+(N.tot/1000).toFixed(2),deadEnds:N.dead.length,stubs40:N.dead.filter(D=>D.st<40).length,gaps12:near12,comps:N.comps.size,orphans:orphN,orphanKm:+(orphL/1000).toFixed(2),mainFrac:+(N.mainL/Math.max(1,N.tot)).toFixed(4)},extra||{})}
// add samples from the end of S (e=0 start / 1 end) to (x,z)
function OB_extend(S,e,x,z){const P=S.pts,p=e?P[P.length-1]:P[0],d=Math.hypot(x-p.x,z-p.z);if(d<.05)return p;const tx=(x-p.x)/d,tz=(z-p.z)/d,m=Math.max(1,Math.ceil(d/8)),add=[];
  for(let k=1;k<=m;k++)add.push({x:p.x+(x-p.x)*k/m,z:p.z+(z-p.z)*k/m,tx:e?tx:-tx,tz:e?tz:-tz,s:0});
  if(e){add.forEach((q,k)=>q.s=p.s+d*(k+1)/m);P.push(...add);S.L=P[P.length-1].s}else{add.reverse();add.forEach((q,k)=>q.s=d*k/m);for(const q of P)q.s+=d;P.unshift(...add);S.L=P[P.length-1].s}
  return e?P[P.length-1]:P[0]}
// insert a sample on piece i of S at parameter t (or reuse a sample within 2.5 m); returns the sample
function OB_insert(S,i,t,x,z){const P=S.pts,p=P[i],q=P[i+1];if(Math.hypot(p.x-x,p.z-z)<2.5)return p;if(q&&Math.hypot(q.x-x,q.z-z)<2.5)return q;const l=Math.hypot(q.x-p.x,q.z-p.z)||1,s={x,z,tx:(q.x-p.x)/l,tz:(q.z-p.z)/l,s:p.s+(q.s-p.s)*t};P.splice(i+1,0,s);return s}
// make samples A and B one junction (Athens: shared vertex key; Frankfurt: coincident samples satisfy the JUNC distance rule)
function OB_tie(pA,pB){if(CID==='fra')return;const ka=pA.k!=null?pA.k:pB.k!=null?pB.k:'ob'+(++OB_kn);if(pA.k==null)pA.k=ka;if(pB.k==null)pB.k=ka;OB_kunion(pA.k,pB.k)}
function OB_fix(){const t0=performance.now();OB_RA.before=OB_sum(OB_net());if(!OB_RA.on){OB_RA.ms=Math.round(performance.now()-t0);return}const O=OB_RA.ops;
  O.spike=OB_despike();OB_crossPass(O);
  // 2. dead ends: snap onto the nearest street within 40 m (forward-biased; anything within 12 m), else trim a < 40 m stub back to its junction
  OB_deadPass(O);
  // 3. orphan fragments: link to the main network (an end within 60 m, 150 m for fragments >= 400 m) or drop short ones.
  //    Frankfurt: its streets are tied together by the filler grid / bridges / Autobahn at runtime, so only the grid pass (OB_fillFix) runs there.
  if(CID!=='fra')OB_orphPass(O);
  OB_crossPass(O);OB_deadPass(O);for(let k=0;k<3&&OB_crossPass(O);k++);OB_RA.crossLeft=OB_crossPass({cross:0});
  if(CID!=='fra')for(const S of CITY_S)for(const p of S.pts)if(p.k!=null)p.k=OB_kf(p.k);
  OB_RA.fixed=OB_sum(OB_net());OB_RA.ms=Math.round(performance.now()-t0)}
// 0. hairpin spikes (an OSM vertex that doubles back < 8 m, e.g. a street folding over its own junction): sample dropped
function OB_despike(){const KC=new Map();for(const S of CITY_S)for(const p of S.pts)if(p.k!=null)KC.set(p.k,(KC.get(p.k)||0)+1);let n=0;
  for(const S of CITY_S){if(!OB_DRV(S))continue;const P=S.pts;for(let i=1;i+1<P.length;i++){const a=P[i-1],p=P[i],b=P[i+1],ax=p.x-a.x,az=p.z-a.z,bx=b.x-p.x,bz=b.z-p.z,la=Math.hypot(ax,az),lb=Math.hypot(bx,bz);
    if(!la||!lb||Math.min(la,lb)>8||(ax*bx+az*bz)/(la*lb)>-.7||(p.k!=null&&KC.get(p.k)>1))continue;P.splice(i,1);i--;n++;let s0=0;for(let k=0;k<P.length;k++){if(k)s0+=Math.hypot(P[k].x-P[k-1].x,P[k].z-P[k-1].z);P[k].s=s0}S.L=s0}}return n}
// 1. crossings of two drivable streets without a junction: one shared sample on both
function OB_crossPass(O){{const N=OB_net(),S=N.segs,J=new Map(),jk=(x,z)=>Math.floor(x/16)*100000+Math.floor(z/16);for(let j=0;j<N.joins.length;j+=4){const k=jk(N.joins[j+2],N.joins[j+3]);let L=J.get(k);if(!L)J.set(k,L=[]);L.push(N.joins[j],N.joins[j+1],N.joins[j+2],N.joins[j+3])}
    const joined=(a,b,x,z)=>{const kx=Math.floor(x/16),kz=Math.floor(z/16);for(let u=-1;u<=1;u++)for(let v=-1;v<=1;v++){const L=J.get((kx+u)*100000+kz+v);if(L)for(let j=0;j<L.length;j+=4)if(((L[j]===a&&L[j+1]===b)||(L[j]===b&&L[j+1]===a))&&Math.hypot(L[j+2]-x,L[j+3]-z)<(CID==='fra'?8:3))return true}return false};
    const X=[];S.forEach((A,a)=>{const P=A.pts;for(let i=0;i+1<P.length;i++){const p=P[i],q=P[i+1];N.cells((p.x+q.x)/2,(p.z+q.z)/2,12,(b,j)=>{if(b<=a)return;const Q=S[b].pts;for(const k of[j-1,j]){if(k<0||k+1>=Q.length)continue;const r=Q[k],s=Q[k+1],d1x=q.x-p.x,d1z=q.z-p.z,d2x=s.x-r.x,d2z=s.z-r.z,den=d1x*d2z-d1z*d2x;if(Math.abs(den)<1e-6)continue;
      const t=((r.x-p.x)*d2z-(r.z-p.z)*d2x)/den,u=((r.x-p.x)*d1z-(r.z-p.z)*d1x)/den;if(t<0||t>=1||u<0||u>=1)continue;const x=p.x+d1x*t,z=p.z+d1z*t;if(X.some(c=>c.a===a&&c.b===b&&Math.hypot(c.x-x,c.z-z)<10))continue;if(!joined(a,b,x,z))X.push({a,i,t,b,j:k,u,x,z})}})}});
    const by=new Map();for(const c of X){(by.get(c.a)||by.set(c.a,[]).get(c.a)).push({i:c.i,t:c.t,c,A:1});(by.get(c.b)||by.set(c.b,[]).get(c.b)).push({i:c.j,t:c.u,c,A:0})}
    for(const[a,L]of by){L.sort((m,n)=>n.i-m.i||n.t-m.t);for(const o of L){const p=OB_insert(S[a],o.i,o.t,o.c.x,o.c.z);if(o.A)o.c.pa=p;else o.c.pb=p}}
    for(const c of X){c.pb.x=c.pa.x;c.pb.z=c.pa.z;OB_tie(c.pa,c.pb);O.cross++}return X.length}}
function OB_deadPass(O){for(let round=0;round<8;round++){const N=OB_net(),S=N.segs;let did=0;const src=new Set(),tgt=new Set(),ins=new Map(),cuts=[];O.rounds++;
    const D=N.dead.slice().map(d=>{const A=S[d.a],P=A.pts,p=P[d.i],o=P[d.e?Math.max(0,d.i-2):Math.min(P.length-1,2)],ox=p.x-o.x,oz=p.z-o.z,ol=Math.hypot(ox,oz)||1;let best=null,bs=1e9;
const cand=N.proj(p.x,p.z,40,(b,j)=>b!==d.a||Math.abs(S[b].pts[j].s-p.s)>60);
      // forward search: best score among candidates (distance, penalised when behind the end)
      const seen=new Set();N.cells(p.x,p.z,40,(b,j)=>{if(b===d.a&&Math.abs(S[b].pts[j].s-p.s)<=60)return;const key=b*1e6+j;if(seen.has(key))return;seen.add(key);const Q=S[b].pts;for(const k of[j-1,j]){if(k<0||k+1>=Q.length)continue;const r=Q[k],s=Q[k+1],dx=s.x-r.x,dz=s.z-r.z,l2=dx*dx+dz*dz||1e-9,t=clamp(((p.x-r.x)*dx+(p.z-r.z)*dz)/l2,0,1),x=r.x+dx*t,z=r.z+dz*t,dd=Math.hypot(x-p.x,z-p.z);if(dd>40)continue;const cs=dd<.01?1:((x-p.x)*ox+(z-p.z)*oz)/(dd*ol);if(dd>12&&cs<.35)continue;const sc=dd*(1.6-.6*cs);if(sc<bs){bs=sc;best={a:b,i:k,t,x,z,d:dd}}}});
      return{...d,best:best||(cand&&cand.d<=12?cand:null)}}).sort((m,n)=>(m.best?m.best.d:1e9)-(n.best?n.best.d:1e9));
    for(const d of D){if(src.has(d.a)||tgt.has(d.a))continue;const b=d.best;if(b&&!src.has(b.a)&&b.a!==d.a&&OB_okLine(d.x,d.z,b.x,b.z)){src.add(d.a);tgt.add(b.a);(ins.get(b.a)||ins.set(b.a,[]).get(b.a)).push({d,b});did++;continue}
      if(d.st<40&&!(b&&b.a===d.a)){src.add(d.a);cuts.push(d);did++}}
    for(const[a,L]of ins){L.sort((m,n)=>n.b.i-m.b.i||n.b.t-m.b.t);for(const o of L)o.p=OB_insert(S[a],o.b.i,o.b.t,o.b.x,o.b.z)}
    for(const[,L]of ins)for(const o of L){const A=S[o.d.a],e=OB_extend(A,o.d.e,o.p.x,o.p.z);OB_tie(e,o.p);O.snap++;OB_log('snap',o.p.x,o.p.z,o.b.d)}
    const kill=new Set();for(const d of cuts){const A=S[d.a],P=A.pts,jf=N.jf[d.a];let k=-1;if(!d.e){for(let i=0;i<P.length;i++)if(jf[i]){k=i;break}}else for(let i=P.length-1;i>=0;i--)if(jf[i]){k=i;break}
      if(k<0||(!d.e&&k>=P.length-2)||(d.e&&k<=1)){kill.add(A);O.del++;OB_log('del',d.x,d.z,A.L);continue}if(d.e)P.length=k+1;else{P.splice(0,k);const s0=P[0].s;for(const q of P)q.s-=s0}A.L=P[P.length-1].s;O.trim++;OB_log('trim',d.x,d.z,d.st)}
    if(kill.size){for(let i=CITY_S.length-1;i>=0;i--)if(kill.has(CITY_S[i]))CITY_S.splice(i,1)}
    if(!did)break}}
function OB_orphPass(O){for(let round=0;round<6;round++){const N=OB_net(),S=N.segs;let did=0;const C=[...N.comps].filter(([r])=>r!==N.main).sort((m,n)=>n[1]-m[1]);const ins=new Map(),busy=new Set();
    for(const[r]of C){let best=null;S.forEach((A,a)=>{if(N.root[a]!==r||busy.has(a))return;const P=A.pts;for(const e of[0,1]){const p=P[e?P.length-1:0],q=N.proj(p.x,p.z,N.comps.get(r)>=400?150:60,b=>N.root[b]===N.main);if(q&&(!best||q.d+(N.jf[a][e?P.length-1:0]?15:0)<best.sc)&&OB_okLine(p.x,p.z,q.x,q.z))best={a,e,q,sc:q.d+(N.jf[a][e?P.length-1:0]?15:0)}}});
      if(best&&!busy.has(best.q.a)){busy.add(best.a);(ins.get(best.q.a)||ins.set(best.q.a,[]).get(best.q.a)).push(best);did++}}
    for(const[a,L]of ins){L.sort((m,n)=>n.q.i-m.q.i||n.q.t-m.q.t);for(const o of L)o.p=OB_insert(S[a],o.q.i,o.q.t,o.q.x,o.q.z)}
    for(const[,L]of ins)for(const o of L){const e=OB_extend(S[o.a],o.e,o.p.x,o.p.z);OB_tie(e,o.p);O.link++;OB_log('link',o.p.x,o.p.z,o.q.d)}
    if(!did)break}
  {const N=OB_net(),kill=new Set();for(const[r,l]of N.comps)if(r!==N.main&&l<400)N.segs.forEach((A,a)=>{if(N.root[a]===r)kill.add(A)});for(let i=CITY_S.length-1;i>=0;i--)if(kill.has(CITY_S[i])){const P=CITY_S[i].pts;OB_log('odel',P[P.length>>1].x,P[P.length>>1].z,CITY_S[i].L);CITY_S.splice(i,1);O.delOrphan++}}}
// ---------- filler grid (Frankfurt): axis-aligned synthetic streets FILL_R. Joints: crossings (FILL_X), an end touching another
// grid street, a grid street running over / ending on a drivable CITY_S street.
function OB_fpt(r,t){return[r.x0+r.ux*t,r.z0+r.uz*t]}
function OB_fJ(r,N){const J=(r.cross||[]).map(c=>c[0]),hit=[];for(let t=0;;t=Math.min(r.L,t+4)){const[x,z]=OB_fpt(r,t),q=N.proj(x,z,40);if(q&&q.d<N.segs[q.a].r.w/2+.5){J.push(t);hit.push(q.a)}if(t>=r.L)break}
  const endJ=[0,1].map(e=>{const t=e?r.L:0,[x,z]=OB_fpt(r,t);if(J.some(c=>Math.abs(c-t)<r.w/2+1))return 1;const f=fillAt(x,z,r);if(f&&f.d<f.r.w/2+1)return 2;const q=N.proj(x,z,40);if(q&&q.d<N.segs[q.a].r.w/2+1)return 3;return OB_cut(x,z,r.w)?4:0});return{J,hit,endJ}}
function OB_fillIdx(){for(const r of FILL_R){r.L=Math.hypot(r.x1-r.x0,r.z1-r.z0);r.cross=null}FILL_X.length=0;const V=FILL_R.filter(r=>r.v),H=FILL_R.filter(r=>!r.v);
  for(const v of V)for(const h of H)if(v.x0>=h.x0-1&&v.x0<=h.x1+1&&h.z0>=v.z0-1&&h.z0<=v.z1+1){(v.cross=v.cross||[]).push([h.z0-v.z0,h.w]);(h.cross=h.cross||[]).push([v.x0-h.x0,v.w]);FILL_X.push({x:v.x0,z:h.z0,wa:v.w,wb:h.w,v,h})}
  FILL_G.clear();for(const r of FILL_R){const a=Math.min(r.x0,r.x1)-r.w,b=Math.max(r.x0,r.x1)+r.w,c=Math.min(r.z0,r.z1)-r.w,d=Math.max(r.z0,r.z1)+r.w;for(let k=Math.floor(a/64);k<=Math.floor(b/64);k++)for(let j=Math.floor(c/64);j<=Math.floor(d/64);j++){const key=k*100000+j;let L=FILL_G.get(key);if(!L)FILL_G.set(key,L=[]);L.push(r)}}}
// union-find extension: grid streets, Autobahn joins
function OB_ext(FR,nB){const info=[];return{extra:FR.length+1,info,link:N=>{const{segs,uni,cut,jf,n}=N,fi=k=>n+nB+k,AB=n+nB+FR.length,ix=new Map(FR.map((r,k)=>[r,k]));
  for(const X of FILL_X)uni(fi(ix.get(X.v)),fi(ix.get(X.h)));
  FR.forEach((r,k)=>{const I=OB_fJ(r,N);info[k]=I;for(const a of I.hit)uni(fi(k),a);for(const e of[0,1])if(I.endJ[e]===2){const[x,z]=OB_fpt(r,e?r.L:0),f=fillAt(x,z,r);uni(fi(k),fi(ix.get(f.r)))}else if(I.endJ[e]===3){const[x,z]=OB_fpt(r,e?r.L:0);uni(fi(k),N.proj(x,z,40).a)}});
  segs.forEach((S,a)=>{const P=S.pts;[0,P.length-1].forEach((i,e)=>{if(jf[a][i]||cut[a][e])return;const p=P[i],f=FR.length?fillAt(p.x,p.z):null;if(f&&f.d<f.r.w/2+S.r.w/2+2){jf[a][i]=2;uni(a,fi(ix.get(f.r)))}
    let ab=null;try{ab=abAt(p.x,p.z)}catch(_){}if(ab&&ab.d<ab.road.w/2+S.r.w/2+12){jf[a][i]=2;uni(a,AB)}})})}}}
function OB_fillFix(){const t0=performance.now(),O=OB_RA.ops;O.fExt=0;O.fTrim=0;O.fDel=0;OB_fillIdx();const N=OB_net();
  const blocked=(r,x,z)=>{if(!rfFree(x,z,1)||(WATERS.length&&inRiver(x,z,-(r.w/2+2))))return true;for(const B of BLOCK_C)if(x>B.x0-r.w/2-1&&x<B.x1+r.w/2+1&&z>B.z0-r.w/2-1&&z<B.z1+r.w/2+1)return true;const q=N.proj(x,z,30);return !!(q&&q.d<N.segs[q.a].r.w/2+r.w/2+1&&false)};
  const cityBad=(x,z,w)=>{const q=cityAt(x,z);return q&&!OB_DRV(q.S)&&q.d<q.road.w/2+w/2+1};
  for(let round=0;round<4;round++){let did=0;for(const r of FILL_R){const I=OB_fJ(r,N);for(const e of[0,1]){if(I.endJ[e])continue;const t=e?r.L:0,[x0,z0]=OB_fpt(r,t),sg=e?1:-1;let hit=null;
      for(let d=1;d<=40&&!hit;d++){const x=x0+r.ux*sg*d,z=z0+r.uz*sg*d;if(blocked(r,x,z)||cityBad(x,z,r.w))break;const f=fillAt(x,z,r);if(f&&f.d<.6){hit=f.r.v!==r.v?(r.v?[x,f.r.z0]:[f.r.x0,z]):[x,z];break}const q=N.proj(x,z,30);if(q&&q.d<N.segs[q.a].r.w/2-1)hit=[x,z]}
      if(hit){OB_log('fext',hit[0],hit[1],Math.hypot(hit[0]-x0,hit[1]-z0));if(e){r.x1=r.v?r.x0:hit[0];r.z1=r.v?hit[1]:r.z0}else{r.x0=r.v?r.x0:hit[0];r.z0=r.v?hit[1]:r.z0}r.x1=r.v?r.x0:r.x1;r.z1=r.v?r.z1:r.z0;r.L=Math.hypot(r.x1-r.x0,r.z1-r.z0);O.fExt++;did++;continue}
      const js=I.J.filter(c=>Math.abs(c-t)>r.w/2+1);if(!js.length)continue;const tj=e?Math.max(...js):Math.min(...js);if(Math.abs(tj-t)>=40)continue;
      if(e){r.x1=r.x0+r.ux*tj;r.z1=r.z0+r.uz*tj}else{r.x0=r.x0+r.ux*tj;r.z0=r.z0+r.uz*tj}r.L=Math.hypot(r.x1-r.x0,r.z1-r.z0);O.fTrim++;did++;I.J=I.J.map(c=>e?c:c-tj)}}
    for(let k=FILL_R.length-1;k>=0;k--)if(FILL_R[k].L<12){FILL_R.splice(k,1);O.fDel++}OB_fillIdx();if(!did)break}
  // orphan grid pieces (not tied to the main network): removed
  {const nB=BRIDGES.length,ext=OB_ext(FILL_R,nB),M=OB_net(null,ext),cl=new Map(M.comps);FILL_R.forEach((r,k)=>{const R=M.find(M.segs.length+nB+k);cl.set(R,(cl.get(R)||0)+r.L)});let main=-1,mL=-1;for(const[r,l]of cl)if(l>mL){mL=l;main=r}
    const keep=FILL_R.filter((r,k)=>M.find(M.segs.length+nB+k)===main);for(const r of FILL_R)if(!keep.includes(r))OB_log('fdel',(r.x0+r.x1)/2,(r.z0+r.z1)/2,r.L);O.fDel+=FILL_R.length-keep.length;FILL_R.length=0;FILL_R.push(...keep);OB_fillIdx()}
  O.fillMs=Math.round(performance.now()-t0)}
{const _g=rfGrid;rfGrid=function(){if(FILL_R)return;_g();if(OB_RA.on&&FILL_R.length)OB_fillFix()}}
// runtime audit of the CURRENT drawn network: CITY_S drivable streets + filler grid + bridges + Autobahn links, junction plates, GPS coverage
function OB_audit(){const t0=performance.now(),FR=typeof hubRoads==='function'?hubRoads():[],nF=FR.length,nB=BRIDGES.length;
  const ext=OB_ext(FR,nB),N=OB_net(null,ext),segs=N.segs;
  // fill roads: length in the components, dead ends, stubs (< 40 m to the next joint), gaps (another street within 12 m)
  let fillKm=0,fillDead=0,fillStub=0,fillGap=0;FR.forEach((r,k)=>{fillKm+=r.L;const R=N.find(segs.length+nB+k);N.comps.set(R,(N.comps.get(R)||0)+r.L);const I=ext.info[k];
    for(const e of[0,1]){if(I.endJ[e])continue;const t=e?r.L:0,[x,z]=OB_fpt(r,t);fillDead++;const js=I.J.filter(c=>Math.abs(c-t)>r.w/2+1),nxt=js.length?Math.min(...js.map(c=>Math.abs(c-t))):(r.L<40?0:1e9);if(nxt<40)fillStub++;
      const f=fillAt(x,z,r),q=N.proj(x,z,12);if((f&&f.d<12)||q)fillGap++}});
  let main=-1,mL=-1;for(const[r,l]of N.comps)if(l>mL){mL=l;main=r}const tot=N.tot+fillKm;
  let mainCity=0;segs.forEach((S,a)=>{if(N.find(a)===main)mainCity+=S.L});
  // crossings of two drivable streets that no junction plate covers
  let noPlate=0,cross=0;const npAt=[];{const J=typeof JUNC!=='undefined'?JUNC:[],JG=new Map(),jk=(x,z)=>Math.floor(x/50)*100000+Math.floor(z/50);for(const j of J){const k=jk(j.x,j.z);(JG.get(k)||JG.set(k,[]).get(k)).push(j)}
    const covered=(x,z)=>{const kx=Math.floor(x/50),kz=Math.floor(z/50);for(let a=-1;a<=1;a++)for(let c=-1;c<=1;c++)for(const j of JG.get((kx+a)*100000+kz+c)||[])if(Math.hypot(j.x-x,j.z-z)<j.r+4)return true;return false};
    const seen=[];segs.forEach((A,a)=>{const P=A.pts;for(let i=0;i+1<P.length;i++){const p=P[i],q=P[i+1];N.cells((p.x+q.x)/2,(p.z+q.z)/2,12,(b,j)=>{if(b<=a)return;const Q=segs[b].pts;for(const k of[j-1,j]){if(k<0||k+1>=Q.length)continue;const r=Q[k],s=Q[k+1],d1x=q.x-p.x,d1z=q.z-p.z,d2x=s.x-r.x,d2z=s.z-r.z,den=d1x*d2z-d1z*d2x;if(Math.abs(den)<1e-6)continue;
      const t=((r.x-p.x)*d2z-(r.z-p.z)*d2x)/den,u=((r.x-p.x)*d1z-(r.z-p.z)*d1x)/den;if(t<0||t>=1||u<0||u>=1)continue;const x=p.x+d1x*t,z=p.z+d1z*t;if(seen.some(c=>c[0]===a&&c[1]===b&&Math.hypot(c[2]-x,c[3]-z)<10))continue;
      if((t<.02||t>.98)&&(u<.02||u>.98)){const pp=t<.5?p:q,rr=u<.5?r:s;if(pp.k!=null&&OB_kf(pp.k)===OB_kf(rr.k))continue}seen.push([a,b,x,z]);cross++;if(!covered(x,z)){noPlate++;npAt.push([Math.round(x),Math.round(z),segs[a].r.cls,segs[b].r.cls,p.k!=null?OB_kf(p.k):null,r.k!=null?OB_kf(r.k):null])}}})}})}
  // GPS coverage: drawn street samples (every ~40 m) with a QV graph node near
  let qvN=0,qvOk=0;const Gq=typeof qvGraph==='function'?qvGraph():null;if(Gq)segs.forEach(S=>{for(let i=0;i<S.pts.length;i+=5){const p=S.pts[i];if(OB_cut(p.x,p.z,S.r.w))continue;qvN++;const j=qvNear(p.x,p.z,S.r.w/2+14);if(j>=0)qvOk++}});
  // dead ends that run into a building
  let deadBld=0;for(const d of N.dead){const S=segs[d.a],P=S.pts,p=P[d.i],o=P[d.e?Math.max(0,d.i-1):Math.min(P.length-1,1)],l=Math.hypot(p.x-o.x,p.z-o.z)||1;if(roamHit(p.x+(p.x-o.x)/l*4,p.z+(p.z-o.z)/l*4,S.r.w/2))deadBld++}
  const s=OB_sum(N,{fillKm:+(fillKm/1000).toFixed(2),fillDead,fillStub,fillGap,crossings:cross,noPlate,deadBld,qvCov:qvN?+(qvOk/qvN).toFixed(4):null,juncs:typeof JUNC!=='undefined'?JUNC.length:0});
  s.cityStubs40=s.stubs40;s.cityGaps12=s.gaps12;s.cityDead=s.deadEnds;s.stubs40+=fillStub;s.gaps12+=fillGap;s.deadEnds+=fillDead;s.km=+((N.tot+fillKm)/1000).toFixed(2);s.fillSegs=nF;
  s.mainFrac=+(mL/Math.max(1,tot)).toFixed(4);s.mainFracCity=+(mainCity/Math.max(1,N.tot)).toFixed(4);s.comps=N.comps.size;let oN=0,oL=0;for(const[r,l]of N.comps)if(r!==main&&l>0){oN++;oL+=l}s.orphans=oN;s.orphanKm=+(oL/1000).toFixed(2);s.ms=Math.round(performance.now()-t0);
  s.city=CID==='fra'?'fra':'ath'+ATHD;s.fixOn=OB_RA.on;
  // a few problem spots for screenshots / inspection
  const sp=N.dead.filter(d=>d.st<40).map(d=>[Math.round(d.x),Math.round(d.z),Math.round(d.st),'city']);FR.forEach((r,k)=>{const I=ext.info[k];for(const e of[0,1])if(!I.endJ[e]){const[x,z]=OB_fpt(r,e?r.L:0);sp.push([Math.round(x),Math.round(z),0,'fill'])}});s.spots=sp.slice(0,12);s.noPlateAt=npAt.slice(0,6);return s}
OB_fix();
window.__ob=Object.assign(window.__ob||{},{roadAudit:()=>OB_audit(),RA:OB_RA,
  // debug: drawn street samples within R of (x,z): [segment index, class, width, sample index, x, z, junction key]
  roadsNear:(x,z,R=20)=>{const o=[];CITY_S.forEach((S,si)=>S.pts.forEach((p,i)=>{if(Math.hypot(p.x-x,p.z-z)<R)o.push([si,S.r.cls,S.r.w,i,+p.x.toFixed(1),+p.z.toFixed(1),p.k==null?null:OB_kf(p.k)])}));return o}});

const CITY_G=new Map();CITY_S.forEach((S,si)=>S.pts.forEach((p,i)=>{const k=Math.floor(p.x/64)*100000+Math.floor(p.z/64);let L=CITY_G.get(k);if(!L)CITY_G.set(k,L=[]);L.push(si,i)}));
function cityAt(x,z,skip=-1){const kx=Math.floor(x/64),kz=Math.floor(z/64);let bd=1e12,bs=-1,bi=0;for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const L=CITY_G.get((kx+a)*100000+kz+b);if(!L)continue;for(let j=0;j<L.length;j+=2){if(L[j]===skip)continue;const p=CITY_S[L[j]].pts[L[j+1]],dx=p.x-x,dz=p.z-z,d=dx*dx+dz*dz;if(d<bd){bd=d;bs=L[j];bi=L[j+1]}}}
  if(bs<0)return null;const S=CITY_S[bs],p=S.pts[bi];return{d:Math.sqrt(bd),lat:(x-p.x)*p.tz-(z-p.z)*p.tx,s:p.s,road:S.r,si:bs,i:bi,S,p}}
// street crossings and T-junctions (junction discs, traffic links)
const AJ=[];if(CID!=='fra'){const JK=new Map();CITY_S.forEach((S,si)=>S.pts.forEach((p,i)=>{if(p.k==null)return;let L=JK.get(p.k);if(!L)JK.set(p.k,L=[]);L.push(si,i)}));
  for(const L of JK.values()){if(L.length<4)continue;const ids=[],ix=[];let wm=0,ends=0,road=0;for(let j=0;j<L.length;j+=2){const S=CITY_S[L[j]],i=L[j+1];ix.push([L[j],i]);S.pts[i].j=1;if(!ids.includes(L[j]))ids.push(L[j]);wm=Math.max(wm,S.r.w);if(i===0||i===S.pts.length-1)ends++;if(S.r.cls!=='ped')road++}
    const p=CITY_S[L[0]].pts[L[1]],pass=ix.length===2&&ends===2&&Math.abs(CITY_S[ix[0][0]].r.w-CITY_S[ix[1][0]].r.w)<3;AJ.push({x:p.x,z:p.z,r:pass||!road?0:wm/2+1.5,ids,ix})}}
const JUNC=[];if(CID!=='fra'){for(const J of AJ)if(J.r>0)JUNC.push(J)}else{const add=(x,z,r,a,b)=>{for(const J of JUNC)if(Math.hypot(J.x-x,J.z-z)<26){J.r=Math.max(J.r,r);if(!J.ids.includes(a))J.ids.push(a);if(!J.ids.includes(b))J.ids.push(b);return}JUNC.push({x,z,r,ids:[a,b]})};
  CITY_S.forEach((S,si)=>{const P=S.pts;for(let i=0;i<P.length;i++){const end=i===0||i===P.length-1,q=cityAt(P[i].x,P[i].z,si);if(!q)continue;const wB=q.road.w;if(q.d<6||(end&&q.d<wB/2+10))add(q.p.x,q.p.z,Math.max(S.r.w,wB)/2+3,si,q.si)}})}
// ---------- landmarks, plazas and parks (exclusions for the filler grid and buildings)
const PLAZAS=RF.plazas.map(([name,r])=>({name,...rfRect(r)})),PARKS=RF.parks.map(([name,r])=>({name,...rfRect(r)}));
if(CID!=='fra')RF.lm.push(['odeon','Odeon of Herodes Atticus',-86,-612,48,1],['tomb','Tomb of the Unknown Soldier',935,-95,26,1],['chapel','Agios Georgios',1552,643,20,1]);
const LMX=RF.lm.map(([id,name,e,n,r,fx])=>{let[x,z]=WP(e,n);for(let k=0;k<(fx?0:12);k++){const q=cityAt(x,z);if(!q||q.d>q.road.w/2+r*.75+4)break;const s=q.lat>=0?1:-1,need=q.road.w/2+r*.75+5-q.d;x+=q.p.tz*s*need;z-=q.p.tx*s*need}return{id,name,x,z,r}});
const LM_BY=Object.fromEntries(LMX.map(L=>[L.name,L]));
// ---------- TR: real terrain (AWS Terrarium DEM, see trdata.py). ONE height function for the whole city: TR_Y(x,z).
// TR_real(e,n) = metres above sea level from the embedded grid; TR_G(x,z) = world terrain (datum = river / district low point,
// Frankfurt x1.25, Athens x1, river banks flattened, Acropolis plateau flat); TR_Y adds the road shelves (graded street profiles).
// hillH() stays the old "hill feature" mask (used for placement rules); heights go through groundY/tH -> TR_Y.
