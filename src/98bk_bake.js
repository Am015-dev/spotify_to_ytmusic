// ===== BK (PERF-2, EFF #3): baked candidate grids for the road / terrain distance queries. Owner: perf worker (alex/od-mem). =====
// Entering roam spent ~28 % of its CPU in trailDist / fillAt / cityAt / abAt / rivClear / mtnDist (called per prop and per vertex): each call scanned
// a 3×3 cell neighbourhood or, for trails / rivers / Taunus roads, every sample on the map. Now each query cell gets a list baked once (lazily,
// when a query first lands in it) of the only samples that can be nearest anywhere in that cell: every sample whose lower-bound distance to
// the cell is ≤ the best upper bound (and ≤ the second-best one from another street, so a `skip` argument stays exact). A query then scans
// ~3–30 samples. Same formula, same order, same ties: the answers are bit-identical (window.__bk.check() compares with the originals).
// Whole-map lists use two levels (512 m cells → 64 m cells). Each cache is capped (cleared past BK_MAX cells) so memory stays bounded.
const BK={on:/[?&]bk=0\b/.test(location.search)?0:1,st:{q:0,c:0},C:[]},BK_MAX=8000;
const BK0={trailDist,fillAt,cityAt,abAt,rivClear,mtnDist};
const BK_cache=()=>{const M=new Map();BK.C.push(M);return M};
// point candidates for cell [x0,x1]×[z0,z1]: P = flat [x,z,off,grp,payload…] (stride st), lim = initial best (squared when sq)
function BK_cand(P,st,x0,z0,x1,z1,sq,lim,grp=true){const n=P.length/st;let u1=lim,g1=-1,u2=lim;const lb=new Float64Array(n);
  for(let j=0,o=0;j<n;j++,o+=st){const px=P[o],pz=P[o+1],dx=Math.max(x0-px,0,px-x1),dz=Math.max(z0-pz,0,pz-z1),ax=Math.max(Math.abs(px-x0),Math.abs(px-x1)),az=Math.max(Math.abs(pz-z0),Math.abs(pz-z1));
    let l=dx*dx+dz*dz,u=ax*ax+az*az;if(!sq){l=Math.sqrt(l)-P[o+2];u=Math.sqrt(u)-P[o+2]}lb[j]=l;const g=P[o+3];
    if(u<u1){if(g!==g1)u2=u1;g1=g;u1=u}else if(u<u2&&g!==g1)u2=u}
  const U=grp?u2:u1,lim2=(sq?U*(1+1e-9)+1e-6:U+1e-6),keep=[];for(let j=0;j<n;j++)if(lb[j]<=lim2)keep.push(j);const out=new Float64Array(keep.length*st);keep.forEach((j,k)=>{for(let a=0;a<st;a++)out[k*st+a]=P[j*st+a]});return out}
// whole-map point list → two-level lookup (512 m coarse, 64 m fine)
function BK_two(P,st,sq,lim){const CO=BK_cache(),FI=BK_cache();return(x,z)=>{const fx=Math.floor(x/64),fz=Math.floor(z/64),fk=fx*100000+fz;let c=FI.get(fk);if(c)return c;
  const cx=Math.floor(x/512),cz=Math.floor(z/512),ck=cx*100000+cz;let C=CO.get(ck);if(!C){if(CO.size>BK_MAX)CO.clear();C=BK_cand(P,st,cx*512,cz*512,cx*512+512,cz*512+512,sq,lim,false);CO.set(ck,C)}
  if(FI.size>BK_MAX)FI.clear();c=BK_cand(C,st,fx*64,fz*64,fx*64+64,fz*64+64,sq,lim,false);FI.set(fk,c);BK.st.c++;return c}}
// trails: min over every 2nd sample of (dx²+dz²), then sqrt
let BK_tr=null;trailDist=function(x,z){if(!BK.on)return BK0.trailDist(x,z);BK.st.q++;if(!BK_tr){const P=[];for(const T of TRAILS)for(let i=0;i<T.pts.length;i+=2)P.push(T.pts[i].x,T.pts[i].z,0,0);BK_tr=BK_two(Float64Array.from(P),4,true,1e9)}
  const C=BK_tr(x,z);let b=1e9;for(let o=0;o<C.length;o+=4){const d=(C[o]-x)**2+(C[o+1]-z)**2;if(d<b)b=d}return Math.sqrt(b)};
// rivers: min over every 3rd sample of hypot − half width
let BK_rv=null;rivClear=function(x,z){if(!BK.on)return BK0.rivClear(x,z);BK.st.q++;if(!BK_rv){const P=[];for(const S of WATERS)for(let i=0;i<S.pts.length;i+=3){const p=S.pts[i];P.push(p.x,p.z,p.hw,0)}BK_rv=BK_two(Float64Array.from(P),4,false,1e9)}
  const C=BK_rv(x,z);let b=1e9;for(let o=0;o<C.length;o+=4){const d=Math.hypot(C[o]-x,C[o+1]-z)-C[o+2];if(d<b)b=d}return b};
// Taunus roads (Frankfurt): same early-out as before, then min over every 2nd sample
let BK_mt=null;mtnDist=function(x,z){if(!BK.on)return BK0.mtnDist(x,z);if(x<TAU_R.x0-200||z<TAU_R.z0-200)return 1e9;BK.st.q++;if(!BK_mt){const P=[];for(const S of mtnSamples())for(let i=0;i<S.pts.length;i+=2)P.push(S.pts[i].x,S.pts[i].z,0,0);BK_mt=BK_two(Float64Array.from(P),4,true,1e9)}
  const C=BK_mt(x,z);let best=1e9;for(let o=0;o<C.length;o+=4){const d=(C[o]-x)**2+(C[o+1]-z)**2;if(d<best)best=d}return Math.sqrt(best)};
// city streets: nearest sample in the 3×3 64 m neighbourhood (skip = a street index); payload = [si, i]
const BK_ci=BK_cache();cityAt=function(x,z,skip=-1){if(!BK.on)return BK0.cityAt(x,z,skip);BK.st.q++;const kx=Math.floor(x/64),kz=Math.floor(z/64),k=kx*100000+kz;let C=BK_ci.get(k);
  if(!C){const P=[];for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const L=CITY_G.get((kx+a)*100000+kz+b);if(!L)continue;for(let j=0;j<L.length;j+=2){const p=CITY_S[L[j]].pts[L[j+1]];P.push(p.x,p.z,0,L[j],L[j+1])}}
    if(BK_ci.size>BK_MAX)BK_ci.clear();C=BK_cand(P,5,kx*64,kz*64,kx*64+64,kz*64+64,true,1e12);BK_ci.set(k,C);BK.st.c++}
  let bd=1e12,bs=-1,bi=0;for(let o=0;o<C.length;o+=5){if(C[o+3]===skip)continue;const dx=C[o]-x,dz=C[o+1]-z,d=dx*dx+dz*dz;if(d<bd){bd=d;bs=C[o+3];bi=C[o+4]}}
  if(bs<0)return null;const S=CITY_S[bs],p=S.pts[bi];return{d:Math.sqrt(bd),lat:(x-p.x)*p.tz-(z-p.z)*p.tx,s:p.s,road:S.r,si:bs,i:bi,S,p}};
// Autobahn: nearest sample within 60 m in the 3×3 100 m neighbourhood
let BK_abG=null;const BK_ab=BK_cache();abAt=function(x,z){if(!BK.on)return BK0.abAt(x,z);if(!AB_G)BK0.abAt(0,0);if(BK_abG!==AB_G){BK_ab.clear();BK_abG=AB_G}BK.st.q++;const S0=abSamples(),kx=Math.floor(x/100),kz=Math.floor(z/100),k=kx*10000+kz;let C=BK_ab.get(k);
  if(!C){const P=[];for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const L=AB_G.get((kx+a)*10000+kz+b);if(!L)continue;for(let j=0;j<L.length;j+=2){const p=S0[L[j]].pts[L[j+1]];P.push(p.x,p.z,0,L[j],L[j+1])}}
    if(BK_ab.size>BK_MAX)BK_ab.clear();C=BK_cand(P,5,kx*100,kz*100,kx*100+100,kz*100+100,true,3600,false);BK_ab.set(k,C);BK.st.c++}
  let bd=3600,bs=-1,bi=0;for(let o=0;o<C.length;o+=5){const dx=C[o]-x,dz=C[o+1]-z,d=dx*dx+dz*dz;if(d<bd){bd=d;bs=C[o+3];bi=C[o+4]}}
  if(bs<0)return null;const S=S0[bs],p=S.pts[bi];return{d:Math.sqrt(bd),lat:(x-p.x)*p.tz-(z-p.z)*p.tx,s:p.s,road:S.r,i:bi,S,p}};
// filler grid streets (segments): nearest segment in the 3×3 64 m neighbourhood; skip = a segment object
let BK_fiG=null;const BK_fi=BK_cache();fillAt=function(x,z,skip){if(!BK.on||!FILL_G)return BK0.fillAt(x,z,skip);if(BK_fiG!==FILL_G){BK_fi.clear();BK_fiG=FILL_G}BK.st.q++;const kx=Math.floor(x/64),kz=Math.floor(z/64),k=kx*100000+kz;let C=BK_fi.get(k);
  if(!C){const R=[],x0=kx*64,z0=kz*64,cx=x0+32,cz=z0+32,hd=Math.SQRT2*32;for(let a=-1;a<=1;a++)for(let c=-1;c<=1;c++){const L=FILL_G.get((kx+a)*100000+kz+c);if(L)for(const r of L)R.push(r)}
    const lb=[],ub=[],md=(px,pz)=>Math.hypot(Math.max(Math.abs(px-x0),Math.abs(px-x0-64)),Math.max(Math.abs(pz-z0),Math.abs(pz-z0-64)));let u1=1e9,g1=null,u2=1e9;
    for(const r of R){const ex=r.x0+r.ux*r.L,ez=r.z0+r.uz*r.L,t=clamp((cx-r.x0)*r.ux+(cz-r.z0)*r.uz,0,r.L),dc=Math.hypot(r.x0+r.ux*t-cx,r.z0+r.uz*t-cz),u=Math.min(md(r.x0,r.z0),md(ex,ez),md(r.x0+r.ux*t,r.z0+r.uz*t));lb.push(dc-hd);ub.push(u);
      if(u<u1){if(r!==g1)u2=u1;g1=r;u1=u}else if(u<u2&&r!==g1)u2=u}
    C=R.filter((r,j)=>lb[j]<=u2+1e-6);if(BK_fi.size>BK_MAX)BK_fi.clear();BK_fi.set(k,C);BK.st.c++}
  let bd=1e9,br=null;for(const r of C){if(r===skip)continue;const t=clamp((x-r.x0)*r.ux+(z-r.z0)*r.uz,0,r.L),d=Math.hypot(r.x0+r.ux*t-x,r.z0+r.uz*t-z);if(d<bd){bd=d;br=r}}return br?{d:bd,r:br}:null};
// check: N random points per function over the map + points near the samples; exact match required (objects compared by d, road/sample identity)
window.__bk={BK,clear:()=>BK.C.forEach(M=>M.clear()),cells:()=>BK.C.reduce((a,M)=>a+M.size,0),check(N=4000,seed=7){let s=seed;const R=()=>(s=(s*16807)%2147483647)/2147483647;const out={},near=[];
  for(const S of CITY_S.filter((_,i)=>i%7===0))for(const p of S.pts.filter((_,i)=>i%5===0))near.push([p.x,p.z]);
  const pts=[];for(let i=0;i<N;i++){if(i%2&&near.length){const q=near[Math.floor(R()*near.length)];pts.push([q[0]+(R()-.5)*120,q[1]+(R()-.5)*120])}else pts.push([WX0+(WX1-WX0)*R(),WZS+(WZN-WZS)*R()])}
  const eq=(a,b)=>a===b||(a&&b&&typeof a==='object'?(a.d===b.d&&a.road===b.road&&a.i===b.i&&a.r===b.r&&a.si===b.si):false);
  const fn={trailDist:(f,x,z)=>f(x,z),rivClear:(f,x,z)=>f(x,z),mtnDist:(f,x,z)=>f(x,z),cityAt:(f,x,z)=>f(x,z),cityAtSkip:(f,x,z,k)=>{const q=BK0.cityAt(x,z);return f(x,z,q?q.si:-1)},abAt:(f,x,z)=>f(x,z),fillAt:(f,x,z)=>f(x,z),fillAtSkip:(f,x,z)=>{const q=BK0.fillAt(x,z);return f(x,z,q?q.r:undefined)}};
  const cur={trailDist,rivClear,mtnDist,cityAt,cityAtSkip:cityAt,abAt,fillAt,fillAtSkip:fillAt},org={...BK0,cityAtSkip:BK0.cityAt,fillAtSkip:BK0.fillAt};
  for(const k in fn){let bad=0,ex=null,t0=performance.now();for(const[x,z]of pts){const a=fn[k](org[k],x,z),b=fn[k](cur[k],x,z);if(!eq(a,b)){bad++;if(!ex)ex={x,z,a:a&&(a.d??a),b:b&&(b.d??b)}}}out[k]={n:pts.length,bad,ex,ms:Math.round(performance.now()-t0)}}
  // speed: the same points, original vs baked (warm caches)
  for(const k of['trailDist','fillAt','cityAt','abAt','rivClear']){let t=performance.now();for(const[x,z]of pts)org[k](x,z);const a=performance.now()-t;t=performance.now();for(const[x,z]of pts)cur[k](x,z);out[k].x=+(a/Math.max(.01,performance.now()-t)).toFixed(1)}
  out.cells=window.__bk.cells();return out}};
// the caches only help while something is being built: 5 s without a query in roam → drop them (lazy regions rebuild them on demand)
{let q0=-1;setInterval(()=>{if(BK.st.q===q0&&state==='roam'&&window.__bk.cells())window.__bk.clear();q0=BK.st.q},5000)}
