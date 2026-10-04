# pSM2: faster Athens ground-height query (athShelfY = ~60% of the city build). Same math and result, but each 32 m SHELF
# cell is compiled once into a de-duplicated typed-array segment list (segments that cannot reach the cell are dropped),
# instead of re-walking ~70 entries with per-point dedupe stamps on every query (cache capped at 6000 cells ~ 15 MB).
# Helps the split and the seamless build.
exec(open('P.py').read())
R("let TR_sst=0;","""let TR_sst=0;
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
 window.__smShelf={old:_s0,cur:(x,z,h)=>athShelfY(x,z,h),cells:()=>SM_SC.size}}""")
save()
