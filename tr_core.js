// ---------- TR: real terrain (AWS Terrarium DEM, see trdata.py). ONE height function for the whole city: TR_Y(x,z).
// TR_real(e,n) = metres above sea level from the embedded grid; TR_G(x,z) = world terrain (datum = river / district low point,
// Frankfurt x1.25, Athens x1, river banks flattened, Acropolis plateau flat); TR_Y adds the road shelves (graded street profiles).
// hillH() stays the old "hill feature" mask (used for placement rules); heights go through groundY/tH -> TR_Y.
/*TR_DATA*/
const TR_EX=CID==='fra'?1.25:1,TR_GR=.12,TR_GJ=.11;
function TR_dec(G){const b=atob(G.b),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);let o=0,bit=0;
  const rb=n=>{let v=0;for(let i=0;i<n;i++){v=v*2+((u[o]>>(7-bit))&1);if(++bit===8){bit=0;o++}}return v};const{nx,nz}=G,v=new Int32Array(nx*nz);
  for(let j=0;j<nz;j++){const k=rb(3);for(let i=0;i<nx;i++){let m=0;while(m<24&&rb(1))m++;const q=m===24?rb(20):m*(1<<k)+rb(k),r=q&1?-(q+1)/2:q/2;
    const a=i?v[j*nx+i-1]:j?v[(j-1)*nx]:0,up=j?v[(j-1)*nx+i]:a,c=i&&j?v[(j-1)*nx+i-1]:up;v[j*nx+i]=r+(i&&j?a+up-c:a)}}
  const h=new Float32Array(nx*nz);for(let i=0;i<h.length;i++)h[i]=G.base+v[i]*G.q;return{...G,h}}
const TR_SET=(TR_DATA[CID==='fra'?'fra':'ath'+ATHD]||{}),TR_F=TR_SET.f?TR_dec(TR_SET.f):null,TR_C=TR_SET.c?TR_dec(TR_SET.c):null;
function TR_bil(G,e,n){let fx=(e-G.e0)/G.cs,fz=(n-G.n0)/G.cs;fx=fx<0?0:fx>G.nx-1.001?G.nx-1.001:fx;fz=fz<0?0:fz>G.nz-1.001?G.nz-1.001:fz;const i=fx|0,j=fz|0,tx=fx-i,tz=fz-j,k=j*G.nx+i,h=G.h;
  return(h[k]*(1-tx)+h[k+1]*tx)*(1-tz)+(h[k+G.nx]*(1-tx)+h[k+G.nx+1]*tx)*tz}
// metres above sea level at real (e,n); the fine grid fades into the coarse one over its last 400 m
function TR_real(e,n){if(!TR_F)return 0;const hf=TR_bil(TR_F,e,n);if(!TR_C)return hf;const G=TR_F,d=Math.min(e-G.e0,G.e0+(G.nx-1)*G.cs-e,n-G.n0,G.n0+(G.nz-1)*G.cs-n);if(d>=400)return hf;const hc=TR_bil(TR_C,e,n);if(d<=0)return hc;const t=d/400;return hc+(hf-hc)*t*t*(3-2*t)}
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
    const H0=A.H;for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=WX0+i*r,z=WZS+j*r,m=athHill1(A,x,z)/H0;if(m>0){const k=j*nx+i;h[k]+=(top-h[k])*m}}A.H=top;A.trH0=H0}
  TR_W={r,nx,nz,h};return TR_W}
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
// the Acropolis keeps its real plateau height in akro.H (walls, temples), but every placement mask still sees the original hill values
{const _h1=athHill1;athHill1=(h,x,z)=>{const v=_h1(h,x,z);return h.trH0?v*h.trH0/h.H:v}}
// how far a street profile leaves the real ground (cut/fill); building placement keeps clear only of real cuts/embankments
const TR_dev=p=>Math.abs((p.y||0)-TR_G(p.x,p.z));
