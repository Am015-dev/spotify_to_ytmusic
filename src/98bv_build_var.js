// ===== BV (art-3, 2026-10-14): building / street VARIETY. Alex: "environments are extremely repetitive, boring and flat".
// Every building gets a variant key = facade type + roof type (Athens: kind + facade texture + roof; Frankfurt: Kenney model + roof crown).
// Placement asks BV_pick for the option used LEAST within 100 m (ties broken by a position hash), so no street repeats one look.
// Test (checklist bv1/*, GO parks you on the densest street): same variant within 100 m ≤ 20 %, ≥ 3 facade types per 80 m block. ?bv=0 = off.
const BV={on:!/[?&]bv=0\b/.test(location.search),G:new Map(),C:80,last:null};
const BV_k=(x,z)=>Math.floor(x/BV.C)*100000+Math.floor(z/BV.C);
function BV_reset(){BV.G=new Map()}
function BV_add(x,z,key,fac){const k=BV_k(x,z);let A=BV.G.get(k);if(!A)BV.G.set(k,A=[]);A.push({x,z,key,fac})}
// how many buildings within r m carry each key (or facade, by='fac')
function BV_near(x,z,r,by){const n={},c=Math.ceil(r/BV.C),kx=Math.floor(x/BV.C),kz=Math.floor(z/BV.C);for(let a=-c;a<=c;a++)for(let b=-c;b<=c;b++){const A=BV.G.get((kx+a)*100000+kz+b);if(!A)continue;
  for(const o of A)if((o.x-x)**2+(o.z-z)**2<r*r){const k=by==='fac'?o.fac:o.key;n[k]=(n[k]||0)+1}}return n}
const BV_h=(x,z,s)=>{const h=Math.sin(x*12.9898+z*78.233+(s||0)*37.719)*43758.5453;return h-Math.floor(h)};
// least-used option near (x,z); W = optional weights (higher = preferred, e.g. the district's usual kind); 'by' picks facade or full key
function BV_pick(opts,x,z,s,by,W){const n=BV_near(x,z,100,by),N=BV_near(x,z,45,by);let best=opts[0],bs=1e9;opts.forEach((o,i)=>{const sc=((n[o]||0)+3*(N[o]||0))/(W?W[i]:1)+BV_h(x,z,s+i)*.9;if(sc<bs){bs=sc;best=o}});return best}
// the placed buildings: [{x,z,key,fac}]
function BV_list(){const L=[];for(const A of BV.G.values())L.push(...A);return L}
// repeat = mean over buildings of (same key within 100 m) / (all others within 100 m); blocks = 80 m cells with ≥ 4 buildings
function BV_measure(cx,cz,R){const L=BV_list().filter(o=>(o.x-cx)**2+(o.z-cz)**2<R*R);let rs=0,rn=0;
  for(const o of L){const n=BV_near(o.x,o.z,100),tot=Object.values(n).reduce((a,b)=>a+b,0)-1;if(tot<1)continue;rs+=(n[o.key]-1)/tot;rn++}
  const B=new Map();for(const o of L){const k=BV_k(o.x,o.z);let s=B.get(k);if(!s)B.set(k,s={n:0,f:new Set()});s.n++;s.f.add(o.fac)}
  let nb=0,ok=0,mn=99;for(const s of B.values()){if(s.n<4)continue;nb++;if(s.f.size>=3)ok++;mn=Math.min(mn,s.f.size)}
  const keys=new Set(L.map(o=>o.key)),facs=new Set(L.map(o=>o.fac));
  return{n:L.length,repeat:+(100*rs/Math.max(1,rn)).toFixed(1),blocks:nb,blk3:+(100*ok/Math.max(1,nb)).toFixed(1),minFac:nb?mn:0,variants:keys.size,facades:facs.size}}
// pass line: same variant within 100 m ≤ 20 % AND ≥ 3 facade types in ≥ 95 % of the blocks (the odd 4-house corner may have 2)
BV.pass=m=>m.n>=40&&m.repeat<=20&&m.blk3>=95;
// GO: the street node with the most buildings within 150 m, car on it facing along the road; measured over 600 m around it
function BV_go(){const N=HUB.nodes||[];let best=null,bn=-1;for(let i=0;i<N.length;i+=2){const A=N[i];if(!A)continue;const n=Object.values(BV_near(A.x,A.z,150)).reduce((a,b)=>a+b,0);if(n>bn){bn=n;best=A}}
  if(!best)return'📍 BV · no street node';const q=cityAt(best.x,best.z),h=q?Math.atan2(q.p.tx,q.p.tz):0;roamWarp(best.x,best.z,h);RO.v=0;camSnap=true;BV.last=null;
  setTimeout(()=>{const m=BV_measure(RO.x,RO.z,600),a=BV_measure(0,0,1e6);m.city=a;m.pass=BV.pass(m)&&BV.pass(a);BV.last=m;try{say('',(m.pass?'✅ PASS':'❌ FAIL')+` · same look ≤100 m ${m.repeat}% (city ${a.repeat}%) · blocks with ≥3 facades ${m.blk3}% (city ${a.blk3}%) · ${a.variants} looks`,5)}catch(e){}},1500);
  return'📍 BUSIEST STREET · measuring building variety'}
window.__bv={BV,measure:BV_measure,go:BV_go,list:BV_list,near:BV_near};
// Athens roofs (called from athBuildG put for poly): garden = green roof plate + planters + pergola; tank = the Greek rooftop solar water
// heaters (tilted dark-blue panel + white tank, 1-3 per roof); pent = penthouse (CE_dec builds it); flat = parapet + antenna only
function BV_roof(E,U,x,z,ry,h,L){const{w,d}=U,r=BV_h(x,z,11);
  if(U.rf==='terr'){const[gx,gz]=L(0,0);E('box',gx,h+.7,gz,ry,w*.6,.14,d*.5,0xf2eee6);for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]]){const[qx,qz]=L(a*w*.28,b*d*.22);E('box',qx,h+.6,qz,ry,.18,2,.18,0xf2eee6)}const[px,pz]=L(w*.3,d*.3);E('box',px,h+.7,pz,ry,1.2,.9,1.2,0x3f8a30)}
  else if(U.rf==='garden'){E('box',x,h+.5,z,ry,w-1.2,.18,d-1.2,0x5a9a3e);for(let i=0;i<3;i++){const[px,pz]=L((i-1)*w*.28,(BV_h(x,z,12+i)-.5)*d*.5);E('box',px,h+.68,pz,ry,1.6,.9,1.6,i%2?0x3f8a30:0x62b848)}
    const[gx,gz]=L(w*.2,-d*.2);E('box',gx,h+2.6,gz,ry,w*.35,.14,d*.3,0xf2eee6);for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]]){const[qx,qz]=L(w*.2+a*w*.16,-d*.2+b*d*.13);E('box',qx,h+.6,qz,ry,.18,2,.18,0xf2eee6)}}
  else if(U.rf==='tank'){const n=1+Math.floor(r*3);for(let i=0;i<n;i++){const[tx,tz]=L((i-(n-1)/2)*3.2,-d*.15);E('box',tx,h+.6,tz,ry,2.2,.12,1.6,0x24406a);E('box',tx,h+.7,tz,ry,.08,1,.08,0x8a8a8a);
    const[cx,cz]=L((i-(n-1)/2)*3.2,-d*.15-1.3);E('box',cx,h+1.4,cz,ry,1.9,.75,.75,0xf4f4f0)}}}
