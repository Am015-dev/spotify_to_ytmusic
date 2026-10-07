const TR_EX=CID==='fra'?1.25:1,TR_GR=.12,TR_GJ=.11;
function TR_dec(G){const b=atob(G.b),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);let o=0,bit=0;
  const rb=n=>{let v=0;for(let i=0;i<n;i++){v=v*2+((u[o]>>(7-bit))&1);if(++bit===8){bit=0;o++}}return v};const{nx,nz}=G,v=new Int32Array(nx*nz);
  for(let j=0;j<nz;j++){const k=rb(3);for(let i=0;i<nx;i++){let m=0;while(m<24&&rb(1))m++;const q=m===24?rb(20):m*(1<<k)+rb(k),r=q&1?-(q+1)/2:q/2;
    const a=i?v[j*nx+i-1]:j?v[(j-1)*nx]:0,up=j?v[(j-1)*nx+i]:a,c=i&&j?v[(j-1)*nx+i-1]:up;v[j*nx+i]=r+(i&&j?a+up-c:a)}}
  const h=new Float32Array(nx*nz);for(let i=0;i<h.length;i++)h[i]=G.base+v[i]*G.q;return{...G,h}}
const SM_TG=SM_ON?['A','B','C','D'].map(d=>TR_dec(TR_DATA['ath'+d].f)):null;const TR_SET=(TR_DATA[CID==='fra'?'fra':'ath'+(SM_ON?'A':ATHD)]||{}),TR_F=TR_SET.f?TR_dec(TR_SET.f):null,TR_C=TR_SET.c?TR_dec(TR_SET.c):null;
function TR_bil(G,e,n){let fx=(e-G.e0)/G.cs,fz=(n-G.n0)/G.cs;fx=fx<0?0:fx>G.nx-1.001?G.nx-1.001:fx;fz=fz<0?0:fz>G.nz-1.001?G.nz-1.001:fz;const i=fx|0,j=fz|0,tx=fx-i,tz=fz-j,k=j*G.nx+i,h=G.h;
  return(h[k]*(1-tx)+h[k+1]*tx)*(1-tz)+(h[k+G.nx]*(1-tx)+h[k+G.nx+1]*tx)*tz}
// metres above sea level at real (e,n); the fine grid fades into the coarse one over its last 400 m
function SM_trReal(e,n){const D=[];let dm=-1e9;for(const G of SM_TG){const d=Math.min(e-G.e0,G.e0+(G.nx-1)*G.cs-e,n-G.n0,G.n0+(G.nz-1)*G.cs-n);D.push(d);if(d>dm)dm=d}
  let a=0,w=0;const cm=Math.min(dm,300);for(let i=0;i<D.length;i++){if(D[i]<dm-400)continue;const k=Math.exp((Math.min(D[i],300)-cm)/50);a+=TR_bil(SM_TG[i],e,n)*k;w+=k}return a/w}
function TR_real(e,n){if(SM_TG)return SM_trReal(e,n);if(!TR_F)return 0;const hf=TR_bil(TR_F,e,n);if(!TR_C)return hf;const G=TR_F,d=Math.min(e-G.e0,G.e0+(G.nx-1)*G.cs-e,n-G.n0,G.n0+(G.nz-1)*G.cs-n);if(d>=400)return hf;const hc=TR_bil(TR_C,e,n);if(d<=0)return hc;const t=d/400;return hc+(hf-hc)*t*t*(3-2*t)}
const TR_DATUM=TR_F?TR_F.base:0;
// world raster (bakes datum, exaggeration, river flattening and the Acropolis plateau): Athens 6 m, Frankfurt 12 m in the city, sampled bilinear
let TR_W=null;
function TR_init(){if(TR_W)return TR_W;const r=CID==='fra'?12:6,nx=Math.ceil((WX1-WX0)/r)+1,nz=Math.ceil((WZN-WZS)/r)+1,h=new Float32Array(nx*nz);
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const[e,n]=RW(WX0+i*r,WZS+j*r);h[j*nx+i]=Math.max(0,(TR_real(e,n)-TR_DATUM)*TR_EX)}
  if(WATERS.length){const D=new Float32Array(nx*nz).fill(1e9);for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)if(inRiver(WX0+i*r,WZS+j*r))D[j*nx+i]=0;
    const s2=r*Math.SQRT2;for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=j*nx+i;let d=D[k];if(i)d=Math.min(d,D[k-1]+r);if(j){d=Math.min(d,D[k-nx]+r);if(i)d=Math.min(d,D[k-nx-1]+s2);if(i<nx-1)d=Math.min(d,D[k-nx+1]+s2)}D[k]=d}
    for(let j=nz-1;j>=0;j--)for(let i=nx-1;i>=0;i--){const k=j*nx+i;let d=D[k];if(i<nx-1)d=Math.min(d,D[k+1]+r);if(j<nz-1){d=Math.min(d,D[k+nx]+r);if(i<nx-1)d=Math.min(d,D[k+nx+1]+s2);if(i)d=Math.min(d,D[k+nx-1]+s2)}D[k]=d}
    for(let k=0;k<h.length;k++){const t=clamp((D[k]-30)/150,0,1);h[k]*=t*t*(3-2*t)}}
  if(CID!=='fra'&&typeof HILL_BY!=='undefined'&&HILL_BY.akro){const A=HILL_BY.akro;let top=0;for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=WX0+i*r,z=WZS+j*r;if(athHill1(A,x,z)>=A.H-.01)top=Math.max(top,h[j*nx+i])}
    top=OC_top(top);const H0=A.H;for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=WX0+i*r,z=WZS+j*r,m=athHill1(A,x,z)/H0;if(m>0){const k=j*nx+i;h[k]+=(top-h[k])*m}}A.H=top;A.trH0=H0}
  OC_lyka(h,nx,nz,r);TR_W={r,nx,nz,h};return TR_W}
function TR_G(x,z){const W=TR_W||TR_init();let fx=(x-WX0)/W.r,fz=(z-WZS)/W.r;fx=fx<0?0:fx>W.nx-1.001?W.nx-1.001:fx;fz=fz<0?0:fz>W.nz-1.001?W.nz-1.001:fz;const i=fx|0,j=fz|0,tx=fx-i,tz=fz-j,k=j*W.nx+i,h=W.h;
  return(h[k]*(1-tx)+h[k+1]*tx)*(1-tz)+(h[k+W.nx]*(1-tx)+h[k+W.nx+1]*tx)*tz}
const TR_tauH0=tauH;
// the Taunus keeps its sculpted ridges on top of the real ground; Frankfurt has no road shelves (gentle, smoothed DEM)
tauH=(x,z)=>{let h=TR_G(x,z)+TR_tauH0(x,z);if(x<TAU_R.x0||z<TAU_R.z0)return h;for(const P of[TAU_SUM,TAU_CAS]){const d=Math.hypot(x-P.x,z-P.z);if(d<P.r){const H=P.trH??(P.trH=TR_G(P.x,P.z)+TR_tauH0(P.x,P.z)),k=clamp((P.r-d)/(P.r*.55),0,1);h+=(H-h)*k*k*(3-2*k)}}return h};
function TR_Y(x,z){return CID==='fra'?tauH(x,z):athShelfY(x,z,TR_G(x,z))}
function TR_grad(x,z,e=1.5){return[(groundY(x+e,z)-groundY(x-e,z))/(2*e),(groundY(x,z+e)-groundY(x,z-e))/(2*e)]}
// Athens road shelves follow the real ground: every street (pedestrian lanes too) gets a graded profile (TR_GR cap, TR_GJ between junctions);
// the hill trails follow the smoothed ground without the old "monotone to the top" rule
athBlurH=(x,z)=>{let a=TR_G(x,z)*2,c=2;for(let k=0;k<8;k++){const t=k/8*Math.PI*2;a+=TR_G(x+Math.cos(t)*24,z+Math.sin(t)*24);c++}return a/c};
athShelfMark=()=>{for(const S of CITY_S)if(S.r.cls!=='hill')S.hs=1};
{const _p=athRoadProfiles;athRoadProfiles=()=>{for(const S of CITY_S){if(S.r.cls!=='hill')continue;const P=S.pts,n=P.length,raw=P.map(p=>TR_G(p.x,p.z));
    for(let i=0;i<n;i++){let a=0,c=0;for(let k=-4;k<=4;k++){const j=i+k;if(j<0||j>=n)continue;a+=raw[j];c++}P[i].y=a/c}for(let i=0;i<n;i++){const a=P[Math.max(0,i-1)],b=P[Math.min(n-1,i+1)];P[i].dy=(b.y-a.y)/Math.max(1,b.s-a.s)}}_p();
  // wider shelf lookup (feathers up to 60 m), see athShelfY below
  SHELF.clear();for(const S of CITY_S){if(!(S.r.cls==='hill'||S.hs))continue;const Rr=S.r.w/2+70;
    S.pts.forEach((p,i)=>{for(let kx=Math.floor((p.x-Rr)/32);kx<=Math.floor((p.x+Rr)/32);kx++)for(let kz=Math.floor((p.z-Rr)/32);kz<=Math.floor((p.z+Rr)/32);kz++){const k=kx*100000+kz;let L=SHELF.get(k);if(!L)SHELF.set(k,L=[]);L.push(S,i)}})}}}
// road shelves blend back to the real ground over 3x the cut/fill height (18..60 m), so cuts and embankments stay <= ~27 deg
athShelfY=(x,z,h)=>{const L=SHELF.get(Math.floor(x/32)*100000+Math.floor(z/32));if(!L)return h;const st=++TR_sst;let sw=0,sy=0,im=0;
  for(let j=0;j<L.length;j+=2){const S=L[j],Q=S.pts,i=L[j+1],hw=S.r.w/2;for(let a=i-1;a<=i;a++){if(a<0||a+1>=Q.length)continue;const A=Q[a];if(A._st===st)continue;A._st=st;
    const Bq=Q[a+1],dx=Bq.x-A.x,dz=Bq.z-A.z,l2=dx*dx+dz*dz||1e-9;let t=((x-A.x)*dx+(z-A.z)*dz)/l2;t=t<0?0:t>1?1:t;const ex=A.x+dx*t-x,ez=A.z+dz*t-z,lat=Math.sqrt(ex*ex+ez*ez);if(lat>=hw+66)continue;
    const ay=A.y??0,y=ay+((Bq.y??0)-ay)*t,F=Math.min(60,Math.max(18,3*Math.abs(y-h))),u=(lat-hw-6)/F;if(u>=1)continue;const tt=u<0?0:u,I=1-tt*tt*(3-2*tt),o=lat>hw?lat-hw+1:1,w=I/(o*o);sw+=w;sy+=y*w;if(I>im)im=I}}
  if(!sw)return h;const y=sy/sw;return y+(h-y)*(1-im)};
let TR_sst=0;
const SM_SC=new Map();
function SM_shC(L,cx,cz){const seen=new Set(),f=[],o=[];
  for(let j=0;j<L.length;j+=2){const S=L[j],Q=S.pts,i=L[j+1],hw=S.r.w/2;for(let a=i-1;a<=i;a++){if(a<0||a+1>=Q.length)continue;const A=Q[a];if(seen.has(A))continue;seen.add(A);const B=Q[a+1],dx=B.x-A.x,dz=B.z-A.z;
    // conservative reject: no point of the 32 m cell (half diagonal 22.7 m) can come within hw+66 of this segment
    if(Math.hypot(A.x+dx/2-cx,A.z+dz/2-cz)-Math.hypot(dx,dz)/2-23>=hw+66)continue;f.push(A.x,A.z,dx,dz,dx*dx+dz*dz||1e-9,hw);o.push(A,B)}}
  return{L,n:L.length,f:Float64Array.from(f),o}}
if(CID!=='fra'){const _s0=athShelfY;athShelfY=(x,z,h)=>{const kx=Math.floor(x/32),kz=Math.floor(z/32),k=kx*100000+kz,L=SHELF.get(k);if(!L)return h;let C=SM_SC.get(k);
  if(!C||C.L!==L||C.n!==L.length){if(SM_SC.size>=6000)SM_SC.clear();SM_SC.set(k,C=SM_shC(L,kx*32+16,kz*32+16))}const F=C.f,O=C.o,n=O.length;let sw=0,sy=0,im=0;
  for(let s=0,q=0;s<n;s+=2,q+=6){const ax=F[q],az=F[q+1],dx=F[q+2],dz=F[q+3],hw=F[q+5];let t=((x-ax)*dx+(z-az)*dz)/F[q+4];t=t<0?0:t>1?1:t;const ex=ax+dx*t-x,ez=az+dz*t-z,lat=Math.sqrt(ex*ex+ez*ez);if(lat>=hw+66)continue;
    const A=O[s],B=O[s+1],ay=A.y??0,y=ay+((B.y??0)-ay)*t,Fq=Math.min(60,Math.max(18,3*Math.abs(y-h))),u=(lat-hw-6)/Fq;if(u>=1)continue;const tt=u<0?0:u,I=1-tt*tt*(3-2*tt),oo=lat>hw?lat-hw+1:1,w=I/(oo*oo);sw+=w;sy+=y*w;if(I>im)im=I}
  if(!sw)return h;const y=sy/sw;return y+(h-y)*(1-im)};
 window.__smShelf={old:_s0,cur:(x,z,h)=>athShelfY(x,z,h),cells:()=>SM_SC.size}}
// the Acropolis keeps its real plateau height in akro.H (walls, temples), but every placement mask still sees the original hill values
{const _h1=athHill1;athHill1=(h,x,z)=>{const v=_h1(h,x,z);return h.trH0?v*h.trH0/h.H:v}}
// how far a street profile leaves the real ground (cut/fill); building placement keeps clear only of real cuts/embankments
const TR_dev=p=>Math.abs((p.y||0)-TR_G(p.x,p.z));
// ---------- Sachsenhäuser Berg (Henninger Turm / Goetheturm) and the Taunus in the north-west
const HILL=CID==='fra'?{cx:-900,cz:-1650,rx:760,rz:430,H:32}:{cx:1e9,cz:1e9,rx:1,rz:1,H:0};
function athHills(){return(RF.hills||[]).map(([id,name,e,n,rx,rz,H,shape,o])=>{o=o||{};const[cx,cz]=WP(e,n),sx=Math.abs(WP(e+5,n)[0]-WP(e-5,n)[0])/10,sz=Math.abs(WP(e,n+5)[1]-WP(e,n-5)[1])/10,a=(o.rot||0)*Math.PI/180,ext=shape==='mesa'?1+(o.apron||3.2):1,Rr=Math.max(rx*sx,rz*sz)*ext+2;
  return{id,name,e,n,cx,cz,rx,rz,sx,sz,H,shape,ca:Math.cos(a),sa:Math.sin(a),ap:o.apron||3.2,cl:o.cliff||.3,cap:o.cap||.1,ex:o.ex||1.3,trees:o.trees||0,x0:cx-Rr,x1:cx+Rr,z0:cz-Rr,z1:cz+Rr}})}
// one hill at a world point: real offsets (local compression undone), rotated into the hill frame, q = normalised radius squared
function athHill1(h,x,z){if(x<h.x0||x>h.x1||z<h.z0||z>h.z1)return 0;const de=-(x-h.cx)/h.sx,dn=(z-h.cz)/h.sz,u=(de*h.ca-dn*h.sa)/h.rx,v=(de*h.sa+dn*h.ca)/h.rz,q=u*u+v*v;
  if(h.shape==='dome')return q>=1?0:h.H*(1-q)*(1-q);const r=Math.sqrt(q);if(h.shape==='cone'){if(r>=1)return 0;if(r<h.cap)return h.H;const t=(1-r)/(1-h.cap);return h.H*t*t*(3-2*t)}
  if(r<=1)return h.H;const cw=-u/r,wt=clamp((cw-.5)/.35,0,1),wd=h.cl+(h.ap-h.cl)*wt*wt*(3-2*wt),t=(r-1)/wd;return t>=1?0:h.H*(1-t*t*(3-2*t))}
function athHillH(x,z){let m=0;for(const h of HILLS){const v=athHill1(h,x,z);if(v>m)m=v}return m}
const HILLS=CID==='fra'?[HILL]:athHills(),HILL_BY=Object.fromEntries(HILLS.map(h=>[h.id||'hill',h]));
// road shelf for the hill streets: the profile is the hill height along the centreline, smoothed (±32 m) and monotone towards the top;
// the ground is flat across the carriageway (+6 m) and feathers back to the hill over 18 m. Samples sit in a 32 m grid within reach.
function athHillFit(){const drv=S=>S.r.cls!=='hill'&&S.r.cls!=='ped';for(const h of HILLS){if(h.shape!=='dome'||!h.H)continue;const qt=1-Math.sqrt(.5/h.H);let f=1;for(const S of CITY_S){if(!drv(S))continue;for(const p of S.pts){if(p.x<h.x0||p.x>h.x1||p.z<h.z0||p.z>h.z1)continue;const de=-(p.x-h.cx)/h.sx,dn=(p.z-h.cz)/h.sz,u=(de*h.ca-dn*h.sa)/h.rx,v=(de*h.sa+dn*h.ca)/h.rz,q=u*u+v*v;if(q<qt)f=Math.min(f,Math.sqrt(q/qt))}}
  f=Math.max(.3,f);if(f<1){h.rx*=f;h.rz*=f;h.fit=+f.toFixed(2);h.trees=Math.round(h.trees*f*f);const Rr=Math.max(h.rx*h.sx,h.rz*h.sz)+2;h.x0=h.cx-Rr;h.x1=h.cx+Rr;h.z0=h.cz-Rr;h.z1=h.cz+Rr}}}
if(CID!=='fra'){athHillFit();athShelfMark()}const SHELF=new Map();if(CID!=='fra')for(const S of CITY_S){if(S.r.cls!=='hill'&&!S.hs)continue;const P=S.pts,n=P.length,raw=P.map(p=>athHillH(p.x,p.z)),sm=raw.map((_,i)=>{let a=0,c=0;for(let k=-6;k<=6;k++){const j=i+k;if(j<0||j>=n)continue;a+=raw[j];c++}return a/c});let mx=0;for(let i=0;i<n;i++){mx=S.r.cls==='hill'?Math.max(mx,sm[i]):sm[i];P[i].y=mx}
  for(let i=0;i<n;i++){const a=P[Math.max(0,i-1)],b=P[Math.min(n-1,i+1)];P[i].dy=(b.y-a.y)/Math.max(1,b.s-a.s)}const Rr=S.r.w/2+34;S.shelf=1;
  P.forEach((p,i)=>{for(let kx=Math.floor((p.x-Rr)/32);kx<=Math.floor((p.x+Rr)/32);kx++)for(let kz=Math.floor((p.z-Rr)/32);kz<=Math.floor((p.z+Rr)/32);kz++){const k=kx*100000+kz;let L=SHELF.get(k);if(!L)SHELF.set(k,L=[]);L.push(S,i)}})}
// road profile on a hill: blurred hill height, pinned at junctions (shared value), 9 % grade cap, smoothed; ends pinned too
function athBlurH(x,z){let a=athHillH(x,z)*2,c=2;for(let k=0;k<8;k++){const t=k/8*Math.PI*2;a+=athHillH(x+Math.cos(t)*30,z+Math.sin(t)*30);c++}return a/c}
// streets touching a hill + two rings of neighbours get a road profile; junction heights are relaxed over the network so every stretch
// between junctions is feasible at 8 % (junctions shared with flat streets stay at ground level)
function athShelfMark(){for(const S of CITY_S)if(S.r.cls!=='hill')S.hs=S.pts.some(p=>athHillH(p.x,p.z)>.15);for(let ring=0;ring<2;ring++){const add=[];for(const J of AJ)if(J.ids.some(i=>CITY_S[i].hs))for(const i of J.ids)if(!CITY_S[i].hs&&CITY_S[i].r.cls!=='hill')add.push(i);for(const i of add)CITY_S[i].hs=1}}
function athVirtJ(){let nv=0;CITY_S.forEach((S,si)=>{if(!S.hs)return;const P=S.pts;for(let i=0;i<P.length;i+=2){const p=P[i];if(p.j)continue;const kx=Math.floor(p.x/64),kz=Math.floor(p.z/64);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const L=CITY_G.get((kx+a)*100000+kz+b);if(!L)continue;for(let j=0;j<L.length;j+=2){const t=L[j];if(t<=si||!CITY_S[t].hs)continue;const T=CITY_S[t],q=T.pts[L[j+1]];if(q.j||Math.hypot(q.x-p.x,q.z-p.z)>(S.r.w+T.r.w)/2*.8)continue;
    if(AJ.some(J=>J.ids.includes(si)&&J.ids.includes(t)&&Math.hypot(J.x-p.x,J.z-p.z)<40))continue;const k='v'+(nv++);p.j=1;p.k=k;q.j=1;q.k=k;AJ.push({x:p.x,z:p.z,r:0,ids:[si,t],ix:[[si,i],[t,L[j+1]]],virt:1})}}}});return nv}
function athRoadProfiles(){athVirtJ();const NH=new Map(),key=(si,i)=>CITY_S[si].pts[i].k??('e'+si+'_'+i),inc=new Map();for(const J of AJ)for(const[si,i]of J.ix){const k=key(si,i);let L=inc.get(k);if(!L)inc.set(k,L=[]);L.push(si)}
  const E=[];CITY_S.forEach((S,si)=>{if(!S.hs)return;const P=S.pts;let last=0;for(let i=1;i<P.length;i++){if(!(P[i].j||i===P.length-1))continue;E.push([key(si,last),key(si,i),P[i].s-P[last].s]);last=i}
    for(let i=0;i<P.length;i++){if(!(P[i].j||i===0||i===P.length-1))continue;const k=key(si,i);if(!NH.has(k)){const L=inc.get(k)||[si];NH.set(k,{h:athBlurH(P[i].x,P[i].z),f:L.some(t=>!CITY_S[t].hs&&CITY_S[t].r.cls!=='hill')})}}});
  for(let it=0;it<120;it++){let mv=0;for(const[a,b,L]of E){const A=NH.get(a),B=NH.get(b),d=A.h-B.h,lim=TR_GJ*Math.max(L,1);if(Math.abs(d)<=lim||(A.f&&B.f))continue;const ex=(Math.abs(d)-lim)*Math.sign(d);if(A.f)B.h+=ex;else if(B.f)A.h-=ex;else{A.h-=ex/2;B.h+=ex/2}mv++}if(!mv)break}
  CITY_S.forEach((S,si)=>{if(!S.hs)return;athRoadProfile(S,i=>NH.get(key(si,i)).h)});
  // shelf lookup only for streets that really leave the ground (flat ring streets keep the plain ground: cheaper mesh and lookups)
  SHELF.clear();for(const S of CITY_S){if(!(S.r.cls==='hill'||S.hs))continue;const P=S.pts;if(S.r.cls!=='hill'&&!P.some(p=>Math.abs(p.y||0)>.05)){S.hs=0;S.prof=0;continue}const Rr=S.r.w/2+34;
    P.forEach((p,i)=>{for(let kx=Math.floor((p.x-Rr)/32);kx<=Math.floor((p.x+Rr)/32);kx++)for(let kz=Math.floor((p.z-Rr)/32);kz<=Math.floor((p.z+Rr)/32);kz++){const k=kx*100000+kz;let L=SHELF.get(k);if(!L)SHELF.set(k,L=[]);L.push(S,i)}})}}
function athRoadProfile(S,pinH){const P=S.pts,n=P.length,y=P.map(p=>athBlurH(p.x,p.z)),pin=new Uint8Array(n);pin[0]=pin[n-1]=1;for(let i=0;i<n;i++)if(P[i].j)pin[i]=1;if(pinH)for(let i=0;i<n;i++)if(pin[i])y[i]=pinH(i);
  {let a=0;for(let i=1;i<n;i++){if(!pin[i])continue;for(let k=a+1;k<i;k++){const t=(P[k].s-P[a].s)/Math.max(.1,P[i].s-P[a].s),base=y[a]+(y[i]-y[a])*t;y[k]=base+.5*(y[k]-base)}a=i}}
  const sm=(k)=>{const o=y.slice();for(let i=0;i<n;i++){if(pin[i])continue;let a=0,c=0;for(let j=Math.max(0,i-k);j<=Math.min(n-1,i+k);j++){a+=y[j];c++}o[i]=a/c}for(let i=0;i<n;i++)y[i]=o[i]};sm(4);
  const G=TR_GR;for(let it=0;it<3;it++){for(let i=1;i<n;i++){const ds=Math.max(.5,P[i].s-P[i-1].s);if(!pin[i])y[i]=Math.min(Math.max(y[i],y[i-1]-G*ds),y[i-1]+G*ds)}for(let i=n-2;i>=0;i--){const ds=Math.max(.5,P[i+1].s-P[i].s);if(!pin[i])y[i]=Math.min(Math.max(y[i],y[i+1]-G*ds),y[i+1]+G*ds)}}sm(2);sm(2);
  for(let i=0;i<n;i++)P[i].y=y[i];for(let i=0;i<n;i++){const a=P[Math.max(0,i-1)],b=P[Math.min(n-1,i+1)];P[i].dy=(b.y-a.y)/Math.max(1,b.s-a.s)}S.prof=1}
if(CID!=='fra')athRoadProfiles();
function shelfY(x,z,h){if(CID!=='fra')return athShelfY(x,z,h);const L=SHELF.get(Math.floor(x/32)*100000+Math.floor(z/32));if(!L)return h;let bd=1e18,bS=null,bi=0;for(let j=0;j<L.length;j+=2){const p=L[j].pts[L[j+1]],d=(p.x-x)**2+(p.z-z)**2;if(d<bd){bd=d;bS=L[j];bi=L[j+1]}}
  const p=bS.pts[bi],a0=(x-p.x)*p.tx+(z-p.z)*p.tz,al=clamp(a0,-6,6),lat=Math.hypot((x-p.x)*p.tz-(z-p.z)*p.tx,Math.max(0,Math.abs(a0)-6)),y=p.y+al*p.dy,t=clamp((lat-bS.r.w/2-6)/18,0,1),k=t*t*(3-2*t);return y+(h-y)*k}
// ground mesh resolution for a ground cell: 10 m next to a hill street, 20 m on a hill, else coarse
let _sst=0;function athShelfY(x,z,h){const L=SHELF.get(Math.floor(x/32)*100000+Math.floor(z/32));if(!L)return h;const st=++_sst;let sw=0,sy=0,im=0;for(let j=0;j<L.length;j+=2){const S=L[j],Q=S.pts,i=L[j+1],hw=S.r.w/2;for(let a=i-1;a<=i;a++){if(a<0||a+1>=Q.length)continue;const A=Q[a];if(A._st===st)continue;A._st=st;const Bq=Q[a+1],dx=Bq.x-A.x,dz=Bq.z-A.z,l2=dx*dx+dz*dz||1e-9;let t=((x-A.x)*dx+(z-A.z)*dz)/l2;t=t<0?0:t>1?1:t;const ex=A.x+dx*t-x,ez=A.z+dz*t-z,lat=Math.sqrt(ex*ex+ez*ez);if(lat>=hw+24)continue;const u=(lat-hw-6)/18,tt=u<0?0:u>1?1:u,I=1-tt*tt*(3-2*tt);if(I<=0)continue;const ay=A.y??0,y=ay+((Bq.y??0)-ay)*t,o=lat>hw?lat-hw+1:1,w=I/(o*o);sw+=w;sy+=y*w;if(I>im)im=I}}
  if(!sw)return h;const y=sy/sw;return y+(h-y)*(1-im)}
function athHilly(a,b,c,d){for(const h of HILLS)if(h.H&&h.shape==='mesa'&&b>h.x0&&a<h.x1&&d>h.z0&&c<h.z1)return 5;for(const h of HILLS)if(h.H&&b>h.x0&&a<h.x1&&d>h.z0&&c<h.z1)return 12;for(let kx=Math.floor(a/32);kx<=Math.floor(b/32);kx++)for(let kz=Math.floor(c/32);kz<=Math.floor(d/32);kz++)if(SHELF.has(kx*100000+kz))return 12;return false;}
function athHilly0(a,b,c,d){let r=false;for(const h of HILLS){if(b>h.x0&&a<h.x1&&d>h.z0&&c<h.z1){for(let i=0;i<=6;i++)for(let j=0;j<=6;j++){const v=athHill1(h,a+(b-a)*i/6,c+(d-c)*j/6);if(h.shape==='mesa'&&v>.5&&v<h.H-.5)return 5;if(v>0)r=20}}}
  for(let kx=Math.floor(a/32);kx<=Math.floor(b/32);kx++)for(let kz=Math.floor(c/32);kz<=Math.floor(d/32);kz++)if(SHELF.has(kx*100000+kz))return r?6:10;return r}
function hillH(x,z){if(CID!=='fra')return athHillH(x,z);const dx=(x-HILL.cx)/HILL.rx,dz=(z-HILL.cz)/HILL.rz,q=dx*dx+dz*dz;if(q>=1)return 0;const k=1-q;return HILL.H*k*k}
const TAU_R=CID==='fra'?{x0:4250,x1:8000,z0:3700,z1:7000}:{x0:1e9,x1:1e9,z0:1e9,z1:1e9},TAU_O=[4300,3850];
function tauFade(x,z){const a=clamp((x-4330)/420,0,1),b=clamp((z-3720)/380,0,1),f=Math.min(a,b);return f*f*(3-2*f)}
function tauRaw(x,z){if(x<TAU_R.x0||z<TAU_R.z0)return 0;const fd=tauFade(x,z);if(fd<=0)return 0;const v=((x-TAU_O[0])+(z-TAU_O[1]))*Math.SQRT1_2,u=((x-TAU_O[0])-(z-TAU_O[1]))*Math.SQRT1_2,t=clamp(v/3400,0,1),s=t*t*(3-2*t),e=clamp(v/260,0,1);
  const h=70*s+(16*Math.sin(u/340+1.3)*Math.sin(v/380)+4*Math.sin(u/150)*Math.cos(v/170))*e;return h>=0?h*fd:h*Math.max(0,2*fd-1)}
const TAU_SUM={x:WP(-16044,13397)[0],z:WP(-16044,13397)[1],r:120},TAU_CAS={x:WP(-15120,7782)[0],z:WP(-15120,7782)[1],r:85};
const TAU_SH=tauRaw(TAU_SUM.x,TAU_SUM.z)+6,TAU_CH=tauRaw(TAU_CAS.x,TAU_CAS.z)+5;
function tauH(x,z){if(x<TAU_R.x0||z<TAU_R.z0)return 0;let h=tauRaw(x,z);for(const[P,H]of[[TAU_SUM,TAU_SH],[TAU_CAS,TAU_CH]]){const d=Math.hypot(x-P.x,z-P.z);if(d<P.r){const k=clamp((P.r-d)/(P.r*.55),0,1);h+=(H-h)*k*k*(3-2*k)}}return h}
const ZONES=CID!=='fra'?(RF.zones||[]).map(([t,name,e0,e1,n0,n1])=>({t,name,...rfRect([e0,e1,n0,n1])})):[{t:'forest',x0:-1500,x1:3300,z0:-3200,z1:-1800,name:'Stadtwald'},{t:'forest',x0:HILL.cx-HILL.rx*.8,x1:HILL.cx+HILL.rx*.8,z0:HILL.cz-HILL.rz*.8,z1:HILL.cz+HILL.rz*.8,name:'Sachsenhäuser Berg'},{t:'hills',x0:TAU_R.x0,x1:TAU_R.x1,z0:TAU_R.z0,z1:TAU_R.z1,name:'Taunus'}];
// Taunus roads (world metres): up from the A66 / Nordwestkreuz to the Großer Feldberg and Burg Königstein
const MTN=CID!=='fra'?[]:[{name:'Feldbergstraße',w:26,pts:[[-6290,5740],[-7000,6030],[-7710,6540],[-8140,7310],[-9000,7800],[-10000,7690],[-11000,8200],[-11710,9030],[-11570,9890],[-12290,10740],[-13430,11460],[-14430,12170],[-15140,12740],[-15910,13290]]},
 {name:'Burgweg',w:22,pts:[[-10000,7690],[-10860,7460],[-11860,7260],[-12860,7460],[-13860,7340],[-14570,7600],[-14910,7710]]},
 {name:'Kammweg',w:22,pts:[[-7860,10170],[-8710,10740],[-9860,11230],[-11000,11740],[-12140,12170],[-13430,12690],[-14570,13110],[-15800,13430]]},
 {name:'Feldberg-Abfahrt',w:24,pts:[[-16030,13660],[-15800,14090],[-15290,14430],[-14570,14660],[-13710,14800],[-12860,14890]]}];
MTN.forEach(r=>r.pts=r.pts.map(p=>WP(p[0],p[1])));
// Stadtwald dirt trails
const TRAILS=RF.trails.map(([id,name,w,pts])=>({id,name,w,...polySamples(pts.map(p=>WP(p[0],p[1])),8)}));
function trailDist(x,z){let b=1e9;for(const T of TRAILS)for(let i=0;i<T.pts.length;i+=2){const p=T.pts[i],d=(p.x-x)**2+(p.z-z)**2;if(d<b)b=d}return Math.sqrt(b)}
// Stage 4: the Autobahn ring in real coordinates (metres east / north of the Römerberg) through WP(); the interchanges sit at the real crossings
const AB_R=350,ABW=L=>L.map(p=>WP(p[0],p[1])),AB=CID!=='fra'?[]:[{id:'A5',name:'A5 Kassel–Basel',w:38,y:.10,ab:1,pts:ABW([[-5900,-11300],[-6050,-8500],[-6082,-6257],[-6120,-4000],[-6146,-1700],[-6146,265],[-6180,2600],[-6212,5019],[-4300,7600],[-1789,9772],[-700,12500],[650,15050]]),to:['Kassel · Bad Homburg','Basel · Flughafen']},
 {id:'A661',name:'A661 Oberursel–Egelsbach',w:30,y:.10,ab:1,pts:ABW([[-1789,9772],[-200,8000],[1500,6000],[3774,3803],[4100,1700],[4134,-508],[4500,-2000],[5422,-3493],[5650,-6000],[5800,-11300]]),to:['Offenbach · Darmstadt','Bad Homburg · Oberursel']},
 {id:'A3',name:'A3 Köln–Würzburg',w:38,y:.16,ab:1,pts:ABW([[-17200,-4700],[-14000,-4900],[-11000,-5300],[-7900,-5830],[-6082,-6257],[-4000,-6300],[-1500,-6150],[1500,-5600],[3500,-4700],[5422,-3493],[8000,-3800],[11500,-4300],[17100,-4500]]),to:['Würzburg · Offenbach','Köln · Flughafen']},
 {id:'A66',k:'A66w',name:'A66 Wiesbaden–Frankfurt',w:30,y:.16,ab:1,pts:ABW([[-17200,1800],[-13000,2400],[-9800,3000],[-7500,4400],[-6212,5019]]),to:['Frankfurt · Nordwestkreuz','Wiesbaden · Höchst']},
 {id:'A66',k:'A66e',name:'A66 Frankfurt–Fulda',w:30,y:.16,ab:1,pts:ABW([[3774,3803],[5500,3700],[9000,3500],[13000,3400],[17100,3300]]),to:['Fulda · Hanau','Frankfurt']}];
// interchanges: [name, road a, road b, real point along a (towards the ring inside), real point along b]; the connector is a curve between
// the two carriageways ~420 m from the crossing (filled in by abSamples, so the curve follows the real road shapes)
const AB_K=CID!=='fra'?[]:[['Frankfurter Kreuz','A5','A3',[-6146,265],[5422,-3493]],['Offenbacher Kreuz','A661','A3',[4134,-508],[-6082,-6257]],['Nordwestkreuz','A5','A66w',[-6146,265],[-9800,3000]],['Bad Homburger Kreuz','A5','A661',[-6212,5019],[3774,3803]]];
// W12: asphalt height above groundY (the physics ground). Was r.y*2.5 = 0.25-0.6 m, so tyres sank into the ribbon; now 4-5.5 cm like city
// streets (grass under roads dips 10 cm, ART8_dip). The small per-road step plus polygonOffset keeps overlapping ribbons apart.
const AB_RY=r=>.03+r.y*.1;
const AB_C=[],AB_X=[];
// feeders from the outer end of a real radial to the nearest Autobahn
const AB_FEED=CID!=='fra'?[]:[['mainzer','A5','Feeder road A5 · Mainzer Landstraße'],['heuss','A5','Feeder road A648 · Westkreuz'],['esch','A661','Feeder road A661 · Eschersheimer Landstraße'],['friedberger','A661','Feeder road A661 · Friedberger Landstraße'],['hanauer','A661','Feeder road A661 · Hanauer Landstraße'],['darm','A3','Feeder road A3 · Darmstädter Landstraße']];
const AB_Z=[];
let AB_BRIDGES=[],ALL_DECKS=[];
const GARAGES=CID!=='fra'?[{id:'g_city',name:"Eleni's Garage · Psyrri"},...(RF.garages||[]).map(([id,name,e,n,h])=>{const[x,z]=WP(e,n);return{id,name,x,z,h:-h}})]:[{id:'g_city',name:'Werkstatt Innenstadt'},{id:'g_fra',name:'Fraport Hangar 7',x:4480,z:-3500,h:-2.789},{id:'g_port',name:'Hafen Offenbach',x:-3630,z:-900,h:0},{id:'g_wet',name:'Bad Vilbel Hof',x:-3150,z:4250,h:-Math.PI/2},{id:'g_tau',name:'Königstein',x:6850,z:4190,h:0},{id:'g_rast',name:'Raststätte Taunusblick',x:1500,z:-3440,h:0},{id:'g_nw',name:'Rastplatz Main-Taunus',x:6000,z:2680,h:Math.PI},{id:'g_se',name:'Rastplatz Offenbach-Ost',x:-6000,z:-2800,h:0},{id:'g_hom',name:'Kurpark Bad Homburg',x:3250,z:5900,h:Math.PI/2}];
// Athens: lots for the garages (clear of every real street), Eleni's garage relocated to a free block near Psyrri
function athRectClr(x,z,w,d,ry,m){const hd=Math.hypot(w,d)/2;if(hd+m+20<128){const r0=athRoadD(x,z,100);if(!r0||r0.e>=hd+m)return true;if(r0.e<m)return false}const c=Math.cos(ry),s=Math.sin(ry),nw=Math.ceil(w/4),nd=Math.ceil(d/4);for(let a=0;a<=nw;a++)for(let b=0;b<=nd;b++){const lx=(a/nw-.5)*w,lz=(b/nd-.5)*d,r=athRoadD(x+lx*c+lz*s,z-lx*s+lz*c,40);if(r&&r.e<m)return false}return true}
if(CID!=='fra'){const used=[];
  for(const g of GARAGES){if(g.x==null)continue;let best=null,bd=1e9;const kx=Math.floor(g.x/64),kz=Math.floor(g.z/64);
    for(let a=-4;a<=4;a++)for(let b=-4;b<=4;b++){const L=CITY_G.get((kx+a)*100000+kz+b);if(!L)continue;for(let j=0;j<L.length;j+=2){const S=CITY_S[L[j]],p=S.pts[L[j+1]];if(S.r.cls==='ped'||S.r.cls==='hill'||L[j+1]%2)continue;const dd=Math.hypot(p.x-g.x,p.z-g.z);if(dd>=bd||dd>260)continue;
      for(const sd of[-1,1]){const nx=p.tz*sd,nz=-p.tx*sd,o=S.r.w/2,hx=p.x+nx*(o+16),hz=p.z+nz*(o+16),ry=Math.atan2(-nx,-nz);if(used.some(u=>Math.hypot(u[0]-hx,u[1]-hz)<60))continue;if(!athRectClr(hx,hz,30,20,ry,2))continue;bd=dd;best={x:p.x+nx*(o+2.5),z:p.z+nz*(o+2.5),h:ry,hx,hz}}}}
    if(best){g.x=best.x;g.z=best.z;g.h=best.h;g.wx=best.hx;g.wz=best.hz;used.push([best.hx,best.hz]);const L=LMX.find(l=>l.name===g.name);if(L){L.x=best.hx;L.z=best.hz;L.r=20}}}
  const E=LM_BY['Garaz Psyrri'];if(E){let best=null,bd=1e9;for(let r=0;r<=260&&!best;r+=6)for(let k=0;k<Math.max(1,Math.round(r/3));k++){const a=k/Math.max(1,Math.round(r/3))*Math.PI*2,x=E.x+Math.cos(a)*r,z=E.z+Math.sin(a)*r;
      if(!athRectClr(x,z,39,25,0,1.5))continue;const q=athRoadD(x,z-11-8,40);if(!q||q.e>3)continue;const dd=Math.hypot(x-E.x,z-E.z);if(dd<bd){bd=dd;best=[x,z]}}
    if(best){E.x=best[0];E.z=best[1];E.r=30;E.ath=1;RF.spots.garage=RW(best[0],best[1]-20);RF.spots.flight=RW(best[0]+34,best[1]-20)}}}
let AB_S=null,AB_G=null;function abSamp(r){const c=new THREE.CatmullRomCurve3(r.pts.map(p=>V3(p[0],0,p[1])));const L=c.getLength(),n=Math.max(2,Math.ceil(L/10)),P=c.getSpacedPoints(n).map(v=>({x:v.x,z:v.z}));for(let i=0;i<P.length;i++){const a=P[Math.max(0,i-1)],b=P[Math.min(P.length-1,i+1)],l=Math.hypot(b.x-a.x,b.z-a.z)||1;P[i].tx=(b.x-a.x)/l;P[i].tz=(b.z-a.z)/l;P[i].s=i*L/n}return{r,pts:P,L}}
const abNearI=(S,x,z)=>{let b=0,bd=1e18;S.pts.forEach((p,i)=>{const d=(p.x-x)**2+(p.z-z)**2;if(d<bd){bd=d;b=i}});return[b,Math.sqrt(bd)]};
function abSamples(){if(AB_S)return AB_S;const M=AB.map(abSamp),by=k=>M.find(S=>(S.r.k||S.r.id)===k);AB_C.length=0;AB_X.length=0;AB_Z.length=0;
  for(const[name,ka,kb,ta,tb]of AB_K){const A=by(ka),B=by(kb);let bi=0,bj=0,bd=1e18;for(let i=0;i<A.pts.length;i+=4)for(let j=0;j<B.pts.length;j+=4){const d=(A.pts[i].x-B.pts[j].x)**2+(A.pts[i].z-B.pts[j].z)**2;if(d<bd){bd=d;bi=i;bj=j}}
    for(let i=Math.max(0,bi-6);i<=Math.min(A.pts.length-1,bi+6);i++)for(let j=Math.max(0,bj-6);j<=Math.min(B.pts.length-1,bj+6);j++){const d=(A.pts[i].x-B.pts[j].x)**2+(A.pts[i].z-B.pts[j].z)**2;if(d<bd){bd=d;bi=i;bj=j}}
    const C={x:(A.pts[bi].x+B.pts[bj].x)/2,z:(A.pts[bi].z+B.pts[bj].z)/2,name};AB_X.push(C);const D=AB_R*1.2,sa=Math.sign(abNearI(A,...WP(...ta))[0]-bi)||1,sb=Math.sign(abNearI(B,...WP(...tb))[0]-bj)||1;
    const pa=A.pts[clamp(bi+sa*Math.round(D/(A.L/(A.pts.length-1))),0,A.pts.length-1)],pb=B.pts[clamp(bj+sb*Math.round(D/(B.L/(B.pts.length-1))),0,B.pts.length-1)],pts=[];
    for(let k=0;k<=12;k++){const t=k/12,u=1-t;pts.push([u*u*pa.x+2*u*t*C.x+t*t*pb.x,u*u*pa.z+2*u*t*C.z+t*t*pb.z])}AB_C.push({id:'K',name,w:24,y:.20,ab:1,c:1,pts,X:C,ka,kb})}
  // the A661 starts on the A5 at the Bad Homburger Kreuz and the A66 east on the A661 at Seckbach: T-junctions count as crossings too
  for(const S of M)for(const p of[S.pts[0],S.pts[S.pts.length-1]])if(M.some(T=>T!==S&&abNearI(T,p.x,p.z)[1]<30))AB_X.push({x:p.x,z:p.z,name:S.r.name+' (Anschluss)'})
  for(const[sid,k,name]of AB_FEED){let E=null,be=-1;for(const S of CITY_S){if(S.r.id!==sid)continue;for(const p of[S.pts[0],S.pts[S.pts.length-1]]){const d=Math.hypot(p.x,p.z);if(d>be){be=d;E=p}}}if(!E)continue;
    const A=by(k),[bi,dd]=abNearI(A,E.x,E.z),q=A.pts[bi],ux=(E.x-q.x)/dd,uz=(E.z-q.z)/dd,o=A.r.w/2-4;AB_Z.push({id:A.r.id,name,w:22,y:.24,pts:[[E.x,E.z],[(E.x+q.x)/2,(E.z+q.z)/2],[q.x+ux*o,q.z+uz*o]]})}
  AB_S=[...M,...AB_C.map(abSamp),...AB_Z.map(abSamp)];return AB_S}
function abAt(x,z){const S0=abSamples();if(!AB_G){AB_G=new Map();S0.forEach((S,si)=>S.pts.forEach((p,i)=>{const k=Math.floor(p.x/100)*10000+Math.floor(p.z/100);if(!AB_G.has(k))AB_G.set(k,[]);AB_G.get(k).push(si,i)}))}const kx=Math.floor(x/100),kz=Math.floor(z/100);let bd=3600,bs=-1,bi=0;for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const L=AB_G.get((kx+a)*10000+kz+b);if(!L)continue;for(let j=0;j<L.length;j+=2){const p=S0[L[j]].pts[L[j+1]],d=(p.x-x)**2+(p.z-z)**2;if(d<bd){bd=d;bs=L[j];bi=L[j+1]}}}if(bs<0)return null;const S=S0[bs],p=S.pts[bi];return{d:Math.sqrt(bd),lat:(x-p.x)*p.tz-(z-p.z)*p.tx,s:p.s,road:S.r,i:bi,S,p}}
// Autobahn river crossings: deck centre = AB polyline ∩ river, axis = AB tangent; the A5-over-A3 flyover at the Frankfurter Kreuz stays literal
function abBridgesAuto(){const out=[];for(const S of abSamples()){const r=S.r;if(!r.ab||r.c)continue;const P=S.pts,step=S.L/(P.length-1);let i=0;while(i<P.length){if(!inRiver(P[i].x,P[i].z)){i++;continue}let j=i;while(j+1<P.length&&inRiver(P[j+1].x,P[j+1].z))j++;const m=P[(i+j)>>1],wl=(j-i+1)*step,L=160,half=wl/2+40+L;
    out.push({id:'ab_'+r.id,name:r.id==='A5'?'Schwanheimer Brücke (A5)':r.id==='A661'?'Kaiserleibrücke (A661)':r.id+' Mainbrücke',kind:'ab',cx:m.x,cz:m.z,ux:m.tx,uz:m.tz,w:r.w+2,H:12,prof:'ramp',L,half,road:r,r:half+r.w});i=j+1}}
  {const S=abSamples().find(q=>q.r.id==='A5'),X=AB_X.find(q=>q.name==='Frankfurter Kreuz');if(S&&X){const p=S.pts[abNearI(S,X.x,X.z)[0]];out.push({id:'ab_fk',name:'Frankfurter Kreuz (A5 über A3)',kind:'ab',cx:p.x,cz:p.z,ux:p.tx,uz:p.tz,w:40,H:9,prof:'ramp',L:120,half:180,road:AB[0],r:220})}}return out}
AB_BRIDGES=abBridgesAuto();ALL_DECKS=[...BRIDGES,...AB_BRIDGES];
const abSkip=(x,z,m=0)=>(abSamples(),AB_X).some(q=>Math.hypot(x-q.x,z-q.z)<520)||AB_BRIDGES.some(b=>{if(Math.abs(x-b.cx)>b.r+40+m||Math.abs(z-b.cz)>b.r+40+m)return false;const[a,c]=deckLocal(b,x,z);return Math.abs(a)<b.half+20+m&&Math.abs(c)<b.w+m});
function abClear(x,z){const a=abAt(x,z);if(a&&a.d<a.road.w/2+10)return false;return !GARAGES.some(g=>g.x!=null&&Math.hypot(x-g.x,z-g.z)<70)&&mtnDist(x,z)>20}
let MTN_S=null;function mtnSamples(){if(MTN_S)return MTN_S;MTN_S=MTN.map(r=>{const c=new THREE.CatmullRomCurve3(r.pts.map(p=>V3(p[0],0,p[1])));const L=c.getLength(),n=Math.ceil(L/6);return{r,pts:c.getSpacedPoints(n).map(v=>({x:v.x,z:v.z})),L}});return MTN_S}
function mtnDist(x,z){if(x<TAU_R.x0-200||z<TAU_R.z0-200)return 1e9;let best=1e9;for(const S of mtnSamples())for(let i=0;i<S.pts.length;i+=2){const p=S.pts[i],d=(p.x-x)**2+(p.z-z)**2;if(d<best)best=d}return Math.sqrt(best)}
const HUB={grp:null,built:false,bld:[],grid:null,props:[],ptypes:{},pgrid:null,cars:[],nodes:[],studFX:[],ramps:[],blocks:[]};
function zoneAt(x,z){for(let i=ZONES.length-1;i>=0;i--){const Z=ZONES[i];if(x>Z.x0&&x<Z.x1&&z>Z.z0&&z<Z.z1)return Z}return null}
const inLot=(x,z)=>{const Z=zoneAt(x,z);return !!Z&&(Z.t==='dirt'||Z.t==='grass'||Z.t==='forest')};
function slipY(x,z){for(const s of SLIPS){const dx=x-s.x,dz=z-s.z;if(dx>40||dx<-40||dz>40||dz<-40)continue;const al=dx*s.tx+dz*s.tz,inw=dx*s.ix+dz*s.iz;if(Math.abs(al)<10&&inw>0&&inw<30)return HWY*inw/30}return null}
function roamTerr(x,z,y){let low=false;for(const b of ALL_DECKS){const h=deckAt(b,x,z);if(h!=null&&h>.2){if(y>=h-2.4){let g2=h;for(const r of RO.ramps){if(!r.dk)continue;const dx=x-r.x,dz=z-r.z,a=dx*Math.sin(r.h)+dz*Math.cos(r.h),c=dx*Math.cos(r.h)-dz*Math.sin(r.h);if(Math.abs(c)<r.w/2&&a>-r.len/2&&a<r.len/2)g2=Math.max(g2,r.y0+(a+r.len/2)/r.len*r.hgt)}return{g:g2,deck:b}}if(h-y<5.5)low=true}}
  let g=groundY(x,z);const sl=slipY(x,z);if(sl!=null)g=Math.max(g,sl);
  for(const r of RO.ramps){if(r.dk)continue;const dx=x-r.x,dz=z-r.z,a=dx*Math.sin(r.h)+dz*Math.cos(r.h),b=dx*Math.cos(r.h)-dz*Math.sin(r.h);if(Math.abs(b)<r.w/2&&a>-r.len/2&&a<r.len/2)g=Math.max(g,r.y0+(a+r.len/2)/r.len*r.hgt)}
  return{g,deck:null,low}}
function groundAt(x,z,y){return roamTerr(x,z,y).g}
const groundY=CID==='fra'?(x,z)=>inRiver(x,z)?HWY:TR_Y(x,z):(x,z)=>TR_Y(x,z);
function roofAt(){return null}
// building colliders: axis-aligned {x,z,hw,hd,h}, or oriented when built with ry (c=cos, s=sin; local x = width)
function hubAddB(b,to){if(b.ry!=null){const c=Math.cos(b.ry),s=Math.sin(b.ry);if(Math.abs(s)<1e-3||Math.abs(c)<1e-3){if(Math.abs(s)>.5){const t=b.hw;b.hw=b.hd;b.hd=t}}else{b.c=c;b.s=s}}(to||HUB.bld).push(b);return b}
function bHit(b,x,z,rad){const dx=x-b.x,dz=z-b.z;let lx=dx,lz=dz;if(b.c!=null){lx=dx*b.c-dz*b.s;lz=dx*b.s+dz*b.c}const ex=Math.abs(lx)-b.hw,ez=Math.abs(lz)-b.hd;if(ex>=rad||ez>=rad)return false;if(ex<=0||ez<=0)return true;return ex*ex+ez*ez<rad*rad}
const bExt=b=>b.c==null?[b.hw,b.hd]:[Math.abs(b.c)*b.hw+Math.abs(b.s)*b.hd,Math.abs(b.s)*b.hw+Math.abs(b.c)*b.hd];
function roamHit(x,z,rad,y=0){const L=HUB.grid&&HUB.grid.get(Math.floor(x/40)*10000+Math.floor(z/40));if(!L)return null;for(const b of L){if(y>=(b.h||999)-.6||(b.y0!=null&&y<b.y0))continue;if(bHit(b,x,z,rad))return b}return null}
// push a point out of a collider along its nearest face (local frame for oriented boxes); returns [x,z,'x'|'z' world axis of the push]
function bldPush(b,x,z,rad){const dx=x-b.x,dz=z-b.z;if(b.c==null){const xf=Math.abs(dx)/(b.hw+rad)>Math.abs(dz)/(b.hd+rad);return xf?[b.x+Math.sign(dx||1)*(b.hw+rad+.05),z,'x']:[x,b.z+Math.sign(dz||1)*(b.hd+rad+.05),'z']}
  let lx=dx*b.c-dz*b.s,lz=dx*b.s+dz*b.c;const xf=Math.abs(lx)/(b.hw+rad)>Math.abs(lz)/(b.hd+rad);if(xf)lx=Math.sign(lx||1)*(b.hw+rad+.05);else lz=Math.sign(lz||1)*(b.hd+rad+.05);
  const nx=xf?b.c:b.s,nz=xf?-b.s:b.c;return[b.x+lx*b.c+lz*b.s,b.z-lx*b.s+lz*b.c,Math.abs(nx)>Math.abs(nz)?'x':'z']}
function hubGrid(){const G=new Map();for(const b of HUB.bld){const[ex,ez]=bExt(b);for(let k=Math.floor((b.x-ex-5)/40);k<=Math.floor((b.x+ex+5)/40);k++)for(let j=Math.floor((b.z-ez-5)/40);j<=Math.floor((b.z+ez+5)/40);j++){const key=k*10000+j;if(!G.has(key))G.set(key,[]);G.get(key).push(b)}}HUB.grid=G}
// road helpers shared by buildHub, props, traffic and the map
function hubTile(x,z){return (Math.floor((x-HX0)/800)+64)+256*(Math.floor((z-HZS)/800)+64)}
// ---------- filler grid per district (axis-aligned, clipped against water, parks, plazas, landmarks, the hill and parallel streets) + blocks
let FILL_R=null,FILL_G=null,BLOCK_C=null,FILL_X=[];const GRIDS=RF.grids.map(([name,r,sp,w,mix],gi)=>({gi,name,...rfRect(r),sp,w,mix}));
const gridAt=(x,z)=>{for(const G of GRIDS)if(x>=G.x0&&x<G.x1&&z>=G.z0&&z<G.z1)return G;return null};
function lmNear(x,z,m=0){for(const L of LMX)if(Math.hypot(x-L.x,z-L.z)<L.r+m)return L;return null}
function rfFree(x,z,m=0){return x>HX0+20&&x<HX1-20&&z>HZS+20&&z<HZN-30&&!PLAZAS.some(R=>inR(R,x,z,m))&&!PARKS.some(R=>inR(R,x,z,m))&&!lmNear(x,z,m)&&hillH(x,z)<.2}
function fillAt(x,z,skip){if(!FILL_G)return null;const kx=Math.floor(x/64),kz=Math.floor(z/64);let bd=1e9,br=null;for(let a=-1;a<=1;a++)for(let c=-1;c<=1;c++){const L=FILL_G.get((kx+a)*100000+kz+c);if(L)for(const r of L){if(r===skip)continue;const t=clamp((x-r.x0)*r.ux+(z-r.z0)*r.uz,0,r.L),d=Math.hypot(r.x0+r.ux*t-x,r.z0+r.uz*t-z);if(d<bd){bd=d;br=r}}}return br?{d:bd,r:br}:null}
function rfGrid(){if(FILL_R)return;FILL_R=[];FILL_G=new Map();BLOCK_C=[];
  const okPt=(G,x,z,vert)=>{if(gridAt(x,z)!==G||!rfFree(x,z,4)||inRiver(x,z,-(G.w/2+12)))return false;const q=cityAt(x,z);if(q&&(q.road.cls==='ped'||q.road.cls==='hill')&&q.d<q.road.w/2+G.w/2+3)return false;if(q&&Math.abs(vert?q.p.tz:q.p.tx)>.8&&q.d<q.road.w/2+G.w/2+14)return false;return true};
  for(const G of GRIDS){const xs=[],zs=[];for(let x=Math.ceil(G.x0/G.sp)*G.sp;x<G.x1;x+=G.sp)xs.push(x);for(let z=Math.ceil(G.z0/G.sp)*G.sp;z<G.z1;z+=G.sp)zs.push(z);G.xs=xs;G.zs=zs;
    for(const vert of[1,0])for(const c of vert?xs:zs){const a0=vert?G.z0:G.x0,a1=vert?G.z1:G.x1;let s=null,la=null;
      const fl=e=>{if(s!=null&&e-s>=50){const r=vert?{x0:c,z0:s,x1:c,z1:e}:{x0:s,z0:c,x1:e,z1:c};r.w=G.w;r.v=vert;r.g=G.gi;r.L=e-s;r.ux=vert?0:1;r.uz=vert?1:0;FILL_R.push(r)}s=null};
      for(let a=a0+2;a<a1-1;a+=10){const ok=okPt(G,vert?c:a,vert?a:c,vert);if(ok){if(s==null)s=a;la=a}else if(s!=null)fl(la)}if(s!=null)fl(la)}
    // blocks: grid cells inset by the road half width + 9 m; cells cut by a street, water or an exclusion are split once into quarters
    const ins=G.w/2+9,test=(x0,x1,z0,z1)=>{for(const[x,z]of[[x0,z0],[x1,z0],[x0,z1],[x1,z1],[(x0+x1)/2,(z0+z1)/2],[(x0+x1)/2,z0],[(x0+x1)/2,z1],[x0,(z0+z1)/2],[x1,(z0+z1)/2]]){if(gridAt(x,z)!==G||!rfFree(x,z,2)||inRiver(x,z,-20))return false;const q=cityAt(x,z);if(q&&q.d<q.road.w/2+6)return false}return true};
    for(let i=0;i<xs.length-1;i++)for(let j=0;j<zs.length-1;j++){const x0=xs[i]+ins,x1=xs[i+1]-ins,z0=zs[j]+ins,z1=zs[j+1]-ins;if(x1-x0<30||z1-z0<30)continue;
      if(test(x0,x1,z0,z1)){BLOCK_C.push({x0,x1,z0,z1,g:G.gi});continue}const mx=(x0+x1)/2,mz=(z0+z1)/2;if(mx-x0<36||mz-z0<36)continue;
      for(const[a,b,c,d]of[[x0,mx-4,z0,mz-4],[mx+4,x1,z0,mz-4],[x0,mx-4,mz+4,z1],[mx+4,x1,mz+4,z1]])if(test(a,b,c,d))BLOCK_C.push({x0:a,x1:b,z0:c,z1:d,g:G.gi,sub:1})}}
  {const byG={};for(const r of FILL_R)(byG[r.g]=byG[r.g]||[]).push(r);for(const k in byG){const L=byG[k],V=L.filter(r=>r.v),H=L.filter(r=>!r.v);for(const v of V)for(const h of H)if(v.x0>=h.x0-1&&v.x0<=h.x1+1&&h.z0>=v.z0-1&&h.z0<=v.z1+1){(v.cross=v.cross||[]).push([h.z0-v.z0,h.w]);(h.cross=h.cross||[]).push([v.x0-h.x0,v.w]);FILL_X.push({x:v.x0,z:h.z0,wa:v.w,wb:h.w,v,h})}}}
  for(const r of FILL_R){const a=Math.min(r.x0,r.x1)-r.w,b=Math.max(r.x0,r.x1)+r.w,c=Math.min(r.z0,r.z1)-r.w,d=Math.max(r.z0,r.z1)+r.w;for(let k=Math.floor(a/64);k<=Math.floor(b/64);k++)for(let j=Math.floor(c/64);j<=Math.floor(d/64);j++){const key=k*100000+j;let L=FILL_G.get(key);if(!L)FILL_G.set(key,L=[]);L.push(r)}}}
function hubRoads(){rfGrid();return FILL_R}
// footprint test for buildings (9 points of the rotated rectangle): off streets, filler roads, water, plazas/parks/landmarks
function fpOK(x,z,w,d,ry,lm=true){const c=Math.cos(ry),s=Math.sin(ry);for(const[a,b]of[[0,0],[-.5,-.5],[.5,-.5],[-.5,.5],[.5,.5],[0,-.5],[0,.5],[-.5,0],[.5,0]]){const lx=a*w,lz=b*d,px=x+lx*c+lz*s,pz=z-lx*s+lz*c;
    if(!(px>HX0+10&&px<HX1-10&&pz>HZS+10&&pz<HZN-10))return false;const q=cityAt(px,pz);if(q&&q.d<q.road.w/2+(SC_S&&SC_S.on?SC_K.sbF:2.5))return false;const f=fillAt(px,pz);if(f&&f.d<f.r.w/2+(SC_S&&SC_S.on?SC_K.sbF:2.5))return false;if(inRiver(px,pz,-10)||hillH(px,pz)>.3)return false;
    if(PLAZAS.some(R=>inR(R,px,pz,2))||PARKS.some(R=>inR(R,px,pz,2))||(lm&&lmNear(px,pz)))return false}return true}
const onAnyDeck=(x,z)=>{for(const b of ALL_DECKS){const h=deckAt(b,x,z);if(h!=null)return b}return null};
// ---------- textures
function hubFacadeTex(kind){const W=256,H=256,[c,g]=cv(W,H),r=mul(kind.length*97);
  if(kind==='glass'){const gr=g.createLinearGradient(0,0,W,H);gr.addColorStop(0,'#9fd0ff');gr.addColorStop(.5,'#3f7fc0');gr.addColorStop(1,'#a8dcff');g.fillStyle=gr;g.fillRect(0,0,W,H);g.fillStyle='rgba(255,255,255,.18)';for(let i=0;i<6;i++)g.fillRect(r()*W,0,10+r()*30,H);g.fillStyle='#24384f';for(let x=0;x<W;x+=32)g.fillRect(x,0,3,H);for(let y=0;y<H;y+=24)g.fillRect(0,y,W,3)}
  else if(kind==='office'){g.fillStyle='#ffffff';g.fillRect(0,0,W,H);for(let y=10;y<H;y+=32)for(let x=10;x<W;x+=32){g.fillStyle=r()<.2?'#ffe9a8':'#5a7fa8';g.fillRect(x,y,22,18);g.fillStyle='rgba(255,255,255,.35)';g.fillRect(x,y,22,4)}}
  else if(kind==='gable'){g.fillStyle='#ffffff';g.fillRect(0,0,W,H);g.strokeStyle='#5a3a24';g.lineWidth=7;for(let x=0;x<=W;x+=64){g.beginPath();g.moveTo(x,0);g.lineTo(x,H);g.stroke()}for(let y=0;y<=H;y+=64){g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke()}g.lineWidth=5;for(let x=0;x<W;x+=64)for(let y=0;y<H;y+=64){g.beginPath();g.moveTo(x,y+64);g.lineTo(x+20,y+40);g.stroke();g.beginPath();g.moveTo(x+64,y+64);g.lineTo(x+44,y+40);g.stroke()}
    for(let x=0;x<W;x+=64)for(let y=0;y<H;y+=64){g.fillStyle='#3a5a7a';g.fillRect(x+22,y+14,20,24);g.fillStyle='#fff8e6';g.fillRect(x+31,y+14,2,24);g.fillRect(x+22,y+25,20,2);g.fillStyle='#2e6b3a';g.fillRect(x+18,y+14,4,24);g.fillRect(x+42,y+14,4,24)}}
  else if(kind==='brick'){g.fillStyle='#ffffff';g.fillRect(0,0,W,H);for(let y=0;y<H;y+=8)for(let x=(y/8%2)*8;x<W;x+=16){g.fillStyle=`rgb(${200+r()*40|0},${190+r()*40|0},${180+r()*40|0})`;g.fillRect(x,y,15,7)}for(let x=16;x<W;x+=64){g.fillStyle='#2a3440';g.fillRect(x,40,32,60);g.beginPath();g.arc(x+16,40,16,Math.PI,0);g.fill();g.fillRect(x,150,32,60);g.beginPath();g.arc(x+16,150,16,Math.PI,0);g.fill()}}
  else if(kind==='grund'){g.fillStyle='#ffffff';g.fillRect(0,0,W,H);for(let y=0;y<H;y+=64){g.fillStyle='rgba(0,0,0,.08)';g.fillRect(0,y+58,W,6);for(let x=12;x<W;x+=42){g.fillStyle='#4b6684';g.fillRect(x,y+12,18,34);g.fillStyle='rgba(255,255,255,.6)';g.fillRect(x-3,y+8,24,4);g.fillStyle='rgba(0,0,0,.12)';g.fillRect(x-4,y+46,26,6)}}}
  else if(kind==='shop'){g.fillStyle='#ffffff';g.fillRect(0,0,W,H);for(let y=0;y<H*.6;y+=40)for(let x=8;x<W;x+=40){g.fillStyle='#55779b';g.fillRect(x,y+8,26,22)}g.fillStyle='#2a3a4a';g.fillRect(0,H*.7,W,H*.3);for(let x=0;x<W;x+=64){g.fillStyle='#bfe3ff';g.fillRect(x+6,H*.74,52,H*.22)}}
  else if(kind==='poly'){g.fillStyle='#ffffff';g.fillRect(0,0,W,H);for(let f=0;f<4;f++){const y=f*64;g.fillStyle='#d6d2ca';g.fillRect(0,y+55,W,9);g.fillStyle='rgba(0,0,0,.06)';g.fillRect(0,y+50,W,5);
      for(let b=0;b<3;b++){const x=b*85+6,sh=r();g.fillStyle=sh<.4?'#3d5a6e':'#2a3a48';g.fillRect(x,y+12,34,40);g.fillRect(x+40,y+12,34,40);if(sh>.62){g.fillStyle=['#ece4d0','#c8b48a','#a8bcae','#d8c8a8'][Math.floor(r()*4)];g.fillRect(x,y+12,34,40)}
        g.fillStyle='rgba(255,255,255,.28)';g.fillRect(x,y+12,74,3);g.fillStyle='#59636b';g.fillRect(x-5,y+34,84,2.5);for(let k=0;k<13;k++)g.fillRect(x-5+k*7,y+34,1.5,18);
        if(r()<.4){const c2=['#3f8a4a','#e8822a','#2f7fd0'][Math.floor(r()*3)];for(let k=0;k<8;k++){g.fillStyle=k%2?c2:'#f4f4f0';g.beginPath();g.moveTo(x-3+k*10,y+4);g.lineTo(x+7+k*10,y+4);g.lineTo(x+9+k*10,y+18);g.lineTo(x-1+k*10,y+18);g.fill()}}}}}
  else if(kind==='neo'){g.fillStyle='#ffffff';g.fillRect(0,0,W,H);for(let f=0;f<4;f++){const y=f*64;g.fillStyle='rgba(0,0,0,.1)';g.fillRect(0,y+60,W,4);g.fillStyle='rgba(255,255,255,.75)';g.fillRect(0,y+56,W,4);
      for(let b=0;b<4;b++){const x=b*64+18;g.fillStyle='rgba(0,0,0,.07)';g.fillRect(b*64,y,4,64);g.fillStyle='#34444e';g.fillRect(x,y+12,28,40);g.fillStyle='#faf6ec';g.fillRect(x-5,y+6,38,6);g.fillRect(x+13,y+12,2,40);
        g.fillStyle=r()<.5?'#3f6a4a':'#55707e';if(r()<.65){g.fillRect(x-10,y+12,10,40);g.fillRect(x+28,y+12,10,40)}}if(f<3){g.fillStyle='#3a3a3a';g.fillRect(12,y+46,104,2);g.fillRect(140,y+46,104,2);for(let k=0;k<26;k++){g.fillRect(12+k*4,y+46,1,10);g.fillRect(140+k*4,y+46,1,10)}}}}
  else if(kind==='plaka'){g.fillStyle='#ffffff';g.fillRect(0,0,W,H);for(let i=0;i<600;i++){g.fillStyle='rgba(0,0,0,.035)';g.fillRect(r()*W,r()*H,3,3)}for(let f=0;f<4;f++){const y=f*64;for(let b=0;b<3;b++){const x=b*85+28,c2=['#2f6fb0','#2e7a4a','#1f8a9a','#8a3a2a'][Math.floor(r()*4)];
      if(f===3&&b===1){g.fillStyle=c2;g.fillRect(x,y+12,28,52);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x+13,y+12,2,52)}else{g.fillStyle='#2c343a';g.fillRect(x,y+18,26,28);g.fillStyle=c2;g.fillRect(x-9,y+18,9,28);g.fillRect(x+26,y+18,9,28);g.fillStyle='#e6e0d4';g.fillRect(x-3,y+46,32,4)}}}}
  const t=tex(c);KEEP_TEX.add(t);return t}
function hubWinEm(kind){const W=256,H=256,[c,g]=cv(W,H),r=mul(kind.length*131);g.fillStyle='#000';g.fillRect(0,0,W,H);const lit=()=>{const v=r();return v<.78?`rgba(255,${205+r()*35|0},${140+r()*50|0},${.55+r()*.35})`:v<.93?`rgba(150,220,255,${.5+r()*.3})`:`rgba(255,120,200,${.5+r()*.3})`};
  if(kind==='glass'){for(let y=3;y<H;y+=24)for(let x=3;x<W;x+=32)if(r()<.24){g.fillStyle=lit();g.fillRect(x,y,26,18)}}
  else if(kind==='office'){for(let y=10;y<H;y+=32)for(let x=10;x<W;x+=32)if(r()<.32){g.fillStyle=lit();g.fillRect(x,y,22,18)}}
  else if(kind==='gable'){for(let x=0;x<W;x+=64)for(let y=0;y<H;y+=64)if(r()<.55){g.fillStyle=lit();g.fillRect(x+22,y+14,20,24)}}
  else if(kind==='brick'){for(let x=16;x<W;x+=64)for(const y of[40,150])if(r()<.4){g.fillStyle=lit();g.fillRect(x,y-16,32,76)}}
  else if(kind==='grund'){for(let y=0;y<H;y+=64)for(let x=12;x<W;x+=42)if(r()<.5){g.fillStyle=lit();g.fillRect(x,y+12,18,34)}}
  else if(kind==='poly'){for(let f=0;f<4;f++)for(let b=0;b<3;b++)for(let k=0;k<2;k++)if(r()<.3){g.fillStyle=lit();g.fillRect(b*85+6+k*40,f*64+12,34,40)}}
  else if(kind==='neo'){for(let f=0;f<4;f++)for(let b=0;b<4;b++)if(r()<.35){g.fillStyle=lit();g.fillRect(b*64+18,f*64+12,28,40)}}
  else if(kind==='plaka'){for(let f=0;f<4;f++)for(let b=0;b<3;b++)if(r()<.45){g.fillStyle=lit();g.fillRect(b*85+28,f*64+18,26,28)}}
  else if(kind==='shop'){for(let y=0;y<H*.6;y+=40)for(let x=8;x<W;x+=40)if(r()<.45){g.fillStyle=lit();g.fillRect(x,y+8,26,22)}for(let x=0;x<W;x+=64){g.fillStyle=['#ffe0a0','#a0e8ff','#ffb0e0'][(x/64)%3];g.fillRect(x+6,H*.74,52,H*.22)}}
  const t=tex(c);KEEP_TEX.add(t);return t}
function signTex(word,col){const[c,g]=cv(64,256);g.fillStyle='#05030c';g.fillRect(0,0,64,256);g.strokeStyle=col;g.lineWidth=4;g.strokeRect(4,4,56,248);g.fillStyle=col;g.shadowColor=col;g.shadowBlur=10;g.font='bold 30px sans-serif';g.textAlign='center';g.textBaseline='middle';const L=[...word];L.forEach((ch,i)=>g.fillText(ch,32,128+(i-(L.length-1)/2)*Math.min(34,220/L.length)));const t=tex(c,false);KEEP_TEX.add(t);return t}
function adTex(b){const[c,g]=cv(512,256);const gr=g.createLinearGradient(0,0,512,256);gr.addColorStop(0,'#0a0420');gr.addColorStop(1,'#180a30');g.fillStyle=gr;g.fillRect(0,0,512,256);g.strokeStyle=b[2];g.lineWidth=8;g.strokeRect(8,8,496,240);g.fillStyle=b[2];g.font='bold 64px sans-serif';g.textAlign='center';g.fillText(b[0],256,120);g.fillStyle=b[3];g.font='bold 28px sans-serif';g.fillText(b[1],256,190);const t=tex(c,false);KEEP_TEX.add(t);return t}
function groundTex(kind){const Z=256,[c,g]=cv(Z,Z),r=mul(kind.length*13);
  if(kind==='road'){g.fillStyle='#14161f';g.fillRect(0,0,Z,Z);for(let i=0;i<1400;i++){g.fillStyle=`rgba(${r()<.5?0:255},${r()<.5?0:255},${r()<.5?0:255},.05)`;g.fillRect(r()*Z,r()*Z,2,2)}g.fillStyle='#cfe8ff';for(let y=0;y<Z;y+=64)g.fillRect(Z/2-3,y,6,34);g.fillStyle='#ff2d95';g.fillRect(6,0,4,Z);g.fillStyle='#22e4ff';g.fillRect(Z-10,0,4,Z)}
  else if(kind==='walk'){g.fillStyle='#4a4858';g.fillRect(0,0,Z,Z);g.strokeStyle='rgba(0,0,0,.18)';g.lineWidth=2;for(let x=0;x<=Z;x+=32){g.beginPath();g.moveTo(x,0);g.lineTo(x,Z);g.stroke();g.beginPath();g.moveTo(0,x);g.lineTo(Z,x);g.stroke()}}
  else if(kind==='cobble'){g.fillStyle='#8e8478';g.fillRect(0,0,Z,Z);for(let y=0;y<Z;y+=12)for(let x=(y/12%2)*6;x<Z;x+=12){g.fillStyle=`rgb(${120+r()*50|0},${112+r()*45|0},${100+r()*40|0})`;g.beginPath();g.arc(x+6,y+6,5,0,7);g.fill()}}
  else if(kind==='grass'){g.fillStyle='#5aa83a';g.fillRect(0,0,Z,Z);for(let i=0;i<3000;i++){g.fillStyle=r()<.5?'rgba(40,110,30,.35)':'rgba(150,210,90,.3)';g.fillRect(r()*Z,r()*Z,2,3)}}
  else if(kind==='yard'){g.fillStyle='#7d7f86';g.fillRect(0,0,Z,Z);g.fillStyle='rgba(255,210,0,.6)';for(let x=0;x<Z;x+=64)g.fillRect(x,0,3,Z)}
  const t=tex(c);KEEP_TEX.add(t);return t}
// ---------- geometry helpers
function bxUV(w,h,d,tw,th){const g=new THREE.BoxGeometry(w,h,d),uv=g.attributes.uv,nm=g.attributes.normal;for(let i=0;i<uv.count;i++){const nx=Math.abs(nm.getX(i)),ny=Math.abs(nm.getY(i));if(ny>.5){uv.setXY(i,.02,.02);continue}uv.setXY(i,uv.getX(i)*(nx>.5?d:w)/tw,uv.getY(i)*h/th)}return g}
function roofGeo(w,d,h){const sh=new THREE.Shape();sh.moveTo(-w/2,0);sh.lineTo(w/2,0);sh.lineTo(0,h);sh.lineTo(-w/2,0);const g=new THREE.ExtrudeGeometry(sh,{depth:d,bevelEnabled:false});g.translate(0,0,-d/2);return g}
function mergeG(list){let n=0;for(const g of list){n+=(g.index?g.index.count:g.attributes.position.count)}const P=new Float32Array(n*3),N=new Float32Array(n*3),C=new Float32Array(n*3);let o=0;
  for(let g of list){g=g.index?g.toNonIndexed():g;const p=g.attributes.position,nn=g.attributes.normal,cc=g.attributes.color;for(let i=0;i<p.count;i++){P.set([p.getX(i),p.getY(i),p.getZ(i)],o*3);N.set([nn.getX(i),nn.getY(i),nn.getZ(i)],o*3);C.set(cc?[cc.getX(i),cc.getY(i),cc.getZ(i)]:[1,1,1],o*3);o++}}
  const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.BufferAttribute(P,3));G.setAttribute('normal',new THREE.BufferAttribute(N,3));G.setAttribute('color',new THREE.BufferAttribute(C,3));return G}
const cbox=(w,h,d,x,y,z,col,ry=0)=>{const g=new THREE.BoxGeometry(w,h,d);if(ry)g.rotateY(ry);g.translate(x,y,z);return colorize(g,new THREE.Color(col))};
const ccyl=(r1,r2,h,x,y,z,col,seg=10)=>{const g=new THREE.CylinderGeometry(r1,r2,h,seg);g.translate(x,y,z);return colorize(g,new THREE.Color(col))};
const csph=(r,x,y,z,col,sx=1,sy=1,sz=1)=>{const g=new THREE.IcosahedronGeometry(r,1);g.scale(sx,sy,sz);g.translate(x,y,z);return colorize(g,new THREE.Color(col))};
// ---------- smashable prop catalogue (r = hit radius, st = studs, m = mass slow-down)
function propDefs(){return{
  lamp:{g:mergeG([ccyl(.18,.24,7,0,3.5,0,'#2f3640'),cbox(1.6,.3,.5,.6,7,0,'#2f3640'),cbox(.9,.25,.7,1.2,6.8,0,'#fff3c4')]),r:1,st:2,m:.95,cols:['#2f3640','#fff3c4']},
  tree:{g:mergeG([ccyl(.28,.38,3.4,0,1.7,0,'#6b4a2a'),csph(2.2,0,4.4,0,'#ffffff'),csph(1.6,.9,5.6,.4,'#ffffff'),csph(1.5,-.8,5.2,-.5,'#ffffff')]),r:1.5,st:3,m:.85,cols:['#3f8a2e','#6b4a2a','#7cc05a'],tint:['#4f9a36','#3f8a2e','#6fb83f','#8cc04a','#3a7a3a']},
  bench:{g:mergeG([cbox(2.2,.15,.6,0,.55,0,'#b07a44'),cbox(2.2,.6,.12,0,.9,.28,'#b07a44'),cbox(.15,.55,.5,-.9,.28,0,'#2f3640'),cbox(.15,.55,.5,.9,.28,0,'#2f3640')]),r:1.3,st:2,m:.96,cols:['#b07a44','#2f3640']},
  bin:{g:mergeG([ccyl(.42,.36,1.1,0,.55,0,'#ffffff'),ccyl(.46,.46,.12,0,1.12,0,'#2f3640')]),r:.8,st:1,m:.98,cols:['#e8502a','#2f3640'],tint:['#e8502a','#2a7ad8','#3aa04a']},
  post:{g:mergeG([cbox(.6,1.1,.45,0,.55,0,'#ffcc00'),cbox(.62,.15,.47,0,1.15,0,'#1a1a1a')]),r:.8,st:2,m:.98,cols:['#ffcc00','#1a1a1a']},
  hydrant:{g:mergeG([ccyl(.22,.26,.8,0,.4,0,'#d8302a'),csph(.24,0,.85,0,'#d8302a'),cbox(.6,.14,.14,0,.5,0,'#d8302a')]),r:.6,st:1,m:.98,cols:['#d8302a']},
  column:{g:mergeG([ccyl(.75,.8,3.2,0,1.6,0,'#ffffff',14),ccyl(.9,.9,.3,0,3.35,0,'#2f6b4a',14),ccyl(.2,.9,.6,0,3.8,0,'#2f6b4a',14)]),r:1.1,st:3,m:.93,cols:['#f0e6d0','#2f6b4a','#e8502a'],tint:['#f0e0c0','#ffd0c0','#d0e8ff']},
  stop:{g:mergeG([cbox(4,.15,1.6,0,2.6,0,'#2f3640'),cbox(.12,2.6,.12,-1.9,1.3,.7,'#2f3640'),cbox(.12,2.6,.12,1.9,1.3,.7,'#2f3640'),cbox(3.8,2.2,.06,0,1.4,-.75,'#bfe3ff'),cbox(.5,.5,.1,2.2,2.9,.7,'#ffcc00')]),r:2,st:4,m:.9,cols:['#2f3640','#bfe3ff','#ffcc00']},
  stall:{g:mergeG([cbox(3,1,1.8,0,.5,0,'#a0703a'),cbox(.1,2.2,.1,-1.4,1.6,-.8,'#5a3a24'),cbox(.1,2.2,.1,1.4,1.6,-.8,'#5a3a24'),cbox(.1,2.2,.1,-1.4,1.6,.8,'#5a3a24'),cbox(.1,2.2,.1,1.4,1.6,.8,'#5a3a24'),(()=>{const g=roofGeo(3.4,2.2,.9);g.translate(0,2.7,0);return colorize(g,new THREE.Color('#ffffff'))})()]),r:2,st:5,m:.88,cols:['#e8502a','#ffffff','#a0703a'],tint:['#ff5a4a','#3a8ad8','#ffb02a','#4ab86a','#c45ad8']},
  table:{g:mergeG([ccyl(.55,.55,.08,0,.8,0,'#f0e6d0'),ccyl(.06,.06,.8,0,.4,0,'#2f3640'),ccyl(.05,.05,2.2,0,1.6,0,'#2f3640'),(()=>{const g=new THREE.ConeGeometry(1.4,.6,8);g.translate(0,2.6,0);return colorize(g,new THREE.Color('#ffffff'))})()]),r:1.2,st:2,m:.96,cols:['#f0e6d0','#e8502a'],tint:['#e8502a','#2a7ad8','#f0d040','#3aa04a']},
  cone:{g:mergeG([(()=>{const g=new THREE.ConeGeometry(.32,.9,10);g.translate(0,.45,0);return colorize(g,new THREE.Color('#ff7a1c'))})(),cbox(.7,.06,.7,0,.03,0,'#2f3640')]),r:.5,st:1,m:.99,cols:['#ff7a1c','#ffffff']},
  barrier:{g:mergeG([cbox(2.4,.35,.12,0,.9,0,'#ffffff'),cbox(.12,1,.5,-1,.5,0,'#d8302a'),cbox(.12,1,.5,1,.5,0,'#d8302a')]),r:1.3,st:2,m:.96,cols:['#d8302a','#ffffff']},
  crate:{g:mergeG([cbox(1.4,1.4,1.4,0,.7,0,'#b07a44'),cbox(1.46,.14,1.46,0,1.2,0,'#7a5030'),cbox(1.46,.14,1.46,0,.2,0,'#7a5030')]),r:1.1,st:3,m:.94,cols:['#b07a44','#7a5030']},
  fence:{g:mergeG([cbox(3,.12,.08,0,.9,0,'#f0f0f0'),cbox(3,.12,.08,0,.5,0,'#f0f0f0'),cbox(.12,1.1,.12,-1.4,.55,0,'#f0f0f0'),cbox(.12,1.1,.12,1.4,.55,0,'#f0f0f0')]),r:1.6,st:1,m:.98,cols:['#f0f0f0']},
  pot:{g:mergeG([ccyl(.6,.45,.8,0,.4,0,'#b05a3a'),csph(.7,0,1.1,0,'#ffffff')]),r:.8,st:1,m:.98,cols:['#b05a3a','#e85aa0'],tint:['#e85aa0','#ffd02a','#ff6a3a','#a05ae8']},
  car:{g:mergeG([cbox(2.2,.8,4.4,0,.75,0,'#ffffff'),cbox(1.9,.7,2.2,0,1.45,.2,'#20303a'),ccyl(.35,.35,.3,-1,.25,1.4,'#1a1a1a'),ccyl(.35,.35,.3,1,.25,1.4,'#1a1a1a'),ccyl(.35,.35,.3,-1,.25,-1.4,'#1a1a1a'),ccyl(.35,.35,.3,1,.25,-1.4,'#1a1a1a')]),r:2.4,st:6,m:.82,cols:['#e8e8e8','#20303a'],tint:['#e84a3a','#2a6ad8','#f0f0f0','#2a2a30','#f0c020','#3aa05a','#9a9aa8']},
  container:{g:mergeG([cbox(2.44,2.6,12,0,1.3,0,'#ffffff'),cbox(2.5,.16,12.06,0,2.6,0,'#d0d0d0')]),r:3,st:10,m:.7,cols:['#b8322a','#1f5fa8','#e0a020'],tint:['#b8322a','#1f5fa8','#e0a020','#2c8a5a','#8a3aa0','#d85a1a']},
  rock:{g:mergeG([csph(1.1,0,.7,0,'#8a8478',1.2,.8,1)]),r:1.2,st:2,m:.92,cols:['#8a8478']},
  bush:{g:mergeG([csph(1,0,.8,0,'#ffffff',1.2,.9,1.2)]),r:1.1,st:1,m:.97,cols:['#3f8a2e'],tint:['#4f9a36','#3f8a2e','#6fb83f']},
  lights:{g:mergeG([ccyl(.1,.1,4,0,2,0,'#2f3640'),...Array.from({length:7},(_,i)=>csph(.18,0,3.9,(i-3)*.9,'#ffe08a'))]),r:.8,st:2,m:.98,cols:['#ffe08a','#2f3640']}}}
