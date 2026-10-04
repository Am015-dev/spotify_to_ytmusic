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
