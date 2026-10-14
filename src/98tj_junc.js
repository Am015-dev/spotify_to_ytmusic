// ===== terr-2 (Alex b27 shot: kerb/edge strips cutting across the asphalt, junction surfaces at different heights): junction STATE test.
// Every junction (street discs JUNC, filler crossing squares FILL_X, filler road x real street overlaps): 1 m sample grid, a vertical ray
// against the real road meshes. Pass: no painted edge band / kerb on top inside a junction, top surface flush with the physics (≤0.05 m),
// no step between neighbouring samples (≤0.1 m) and no fold (2nd difference of the visible surface over 1 m samples ≤0.1 m).
// The ground's off-plane residual is reported only: graded hills give smooth 0.1-0.6 m bows over 25-70 m junctions (checked by eye, not a warp).
const TJ={EB:22/256,mg:.028,off:/[?&]tj=0/.test(location.search)};
// true distance from (x,z) to the street polyline near cityAt's nearest sample (cityAt.d is to the sample point: coarse on curves)
function TJ_st(x,z){const q=cityAt(x,z);if(!q)return null;const P=q.S.pts;let d=1e9;for(let i=Math.max(0,q.i-2);i<Math.min(P.length-1,q.i+2);i++){const a=P[i],b=P[i+1],dx=b.x-a.x,dz=b.z-a.z,l2=dx*dx+dz*dz||1,t=clamp(((x-a.x)*dx+(z-a.z)*dz)/l2,0,1);d=Math.min(d,Math.hypot(a.x+dx*t-x,a.z+dz*t-z))}
  if(P.length===1)d=q.d;return{q,d,road:q.road}}
function TJ_list(){const L=[];for(const J of JUNC||[])L.push({k:'disc',x:J.x,z:J.z,r:J.r,inA:(x,z)=>Math.hypot(x-J.x,z-J.z)<J.r-.5});
  if(CID==='fra'){try{hubRoads()}catch(e){}for(const X of FILL_X||[])L.push({k:'sq',x:X.x,z:X.z,r:Math.hypot(X.wa,X.wb)/2,inA:(x,z)=>Math.abs(x-X.x)<X.wa/2-.3&&Math.abs(z-X.z)<X.wb/2-.3});
    for(const f of FILL_R||[]){let a=null;const end=t=>{const tm=(a+t)/2,cx=f.x0+f.ux*tm,cz=f.z0+f.uz*tm,q=cityAt(cx,cz);if(!q)return;const S=q.S||q.road;
        L.push({k:'fxs',x:cx,z:cz,r:Math.max(f.w,q.road.w)*1.2,f,inA:(x,z)=>{const dx=x-f.x0,dz=z-f.z0,t2=dx*f.ux+dz*f.uz,lat=Math.abs(dx*f.uz-dz*f.ux);if(t2<0||t2>f.L||lat>f.w/2-.3)return false;const p=TJ_st(x,z);return p&&p.road===q.road&&p.d<p.road.w/2-.3}})};
      for(let t=0;t<=f.L;t+=2){const x=f.x0+f.ux*t,z=f.z0+f.uz*t,q=TJ_st(x,z),ins=q&&q.d<q.road.w/2;if(ins&&a==null)a=t;else if(!ins&&a!=null){end(t);a=null}}if(a!=null)end(f.L)}}
  return L}
// low, non-instanced meshes = road surfaces, pads, kerbs (props are instanced; buildings rise far above)
// distance culling (hubCullStep) hides far tiles: those count as shown, so every junction is judged at full detail wherever the car is
// static world only (HUB.grp): not the player car, roam objects, ramps or traffic
function TJ_meshes(){const M=HUB.M,R=[],CS=new Set((HUB.cull||[]).map(e=>e.o));scene.updateMatrixWorld();HUB.grp.traverse(m=>{if(RO.grp&&(m===RO.grp||m.parent===RO.grp))return;if(!m.isMesh||m.isInstancedMesh||!m.geometry)return;let o=m,vis=true;for(let a=m;a;a=a.parent)if(a===RO.grp)return;while(o){if(!o.visible&&!CS.has(o))vis=false;o=o.parent}if(!vis)return;
  const a=m.geometry.attributes.position;if(!a||!a.array||a.array.length<9)return;const mt=Array.isArray(m.material)?m.material[0]:m.material;if(!mt||mt.transparent&&mt.opacity<.5)return;
  if(!m.geometry.boundingBox)m.geometry.computeBoundingBox();const b=m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld);
  if(m.userData.ramp||m.userData.wbLod||m.parent&&m.parent.userData.ramp)return;const kind=mt===M.road||mt===M.street||mt===M.resSt?'asph':mt.map&&mt.map===M.jn?'pad':TJ_ped(mt)?'ped':'other';R.push({m,b,kind,pf:mt.polygonOffset?mt.polygonOffsetFactor:0})});return R}
// one pass over every triangle of the low meshes: keep up-facing ones in 8 m cells that junctions cover
function TJ_tris(MS,L){const C=new Map(),key=(i,j)=>i*100000+j;for(const J of L)for(let i=Math.floor((J.x-J.r)/8);i<=Math.floor((J.x+J.r)/8);i++)for(let j=Math.floor((J.z-J.r)/8);j<=Math.floor((J.z+J.r)/8);j++)C.set(key(i,j),null);
  const v=new THREE.Vector3();for(const o of MS){const g=o.m.geometry,P=g.attributes.position,U=g.attributes.uv,I=g.index,n=I?I.count:P.count,mw=o.m.matrixWorld,id=mw.equals(new THREE.Matrix4());
    const W=new Float32Array(P.count*3);for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i);if(!id)v.applyMatrix4(mw);W[i*3]=v.x;W[i*3+1]=v.y;W[i*3+2]=v.z}
    for(let t=0;t<n;t+=3){const a=I?I.getX(t):t,b=I?I.getX(t+1):t+1,c=I?I.getX(t+2):t+2,ax=W[a*3],az=W[a*3+2],bx=W[b*3],bz=W[b*3+2],cx=W[c*3],cz=W[c*3+2];
      const ar=(bx-ax)*(cz-az)-(cx-ax)*(bz-az);if(Math.abs(ar)<1e-6)continue;const i0=Math.floor(Math.min(ax,bx,cx)/8),i1=Math.floor(Math.max(ax,bx,cx)/8),j0=Math.floor(Math.min(az,bz,cz)/8),j1=Math.floor(Math.max(az,bz,cz)/8);if(i1-i0>40||j1-j0>40)continue;
      let T=null;for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){const k=key(i,j);if(!C.has(k))continue;if(!T)T={ax,az,bx,bz,cx,cz,ar,ay:W[a*3+1],by:W[b*3+1],cy:W[c*3+1],ua:U?U.getX(a):.5,ub:U?U.getX(b):.5,uc:U?U.getX(c):.5,kind:o.kind,pf:o.pf};let A=C.get(k);if(!A)C.set(k,A=[]);A.push(T)}}}
  return C}
function TJ_hits(C,x,z){const A=C.get(Math.floor(x/8)*100000+Math.floor(z/8)),H=[];if(A)for(const T of A){const w1=((T.bx-x)*(T.cz-z)-(T.cx-x)*(T.bz-z))/T.ar,w2=((T.cx-x)*(T.az-z)-(T.ax-x)*(T.cz-z))/T.ar,w3=1-w1-w2;if(w1<-1e-6||w2<-1e-6||w3<-1e-6)continue;
    H.push({y:w1*T.ay+w2*T.by+w3*T.cy,u:w1*T.ua+w2*T.ub+w3*T.uc,kind:T.kind,pf:T.pf})}return H.sort((a,b)=>b.y-a.y)}
// bridge decks carry their own surface (their approach may start inside a quay junction): skipped, like the terrain tests
function TJ_deck(x,z){for(const b of ALL_DECKS||[])if(deckAt(b,x,z)!=null)return true;return false}
function TJ_one(J,C){const P=[];let strip=0,n=0,flush=0,wf=null;
  for(let x=Math.ceil(J.x-J.r);x<=J.x+J.r;x++)for(let z=Math.ceil(J.z-J.r);z<=J.z+J.r;z++){if(!J.inA(x,z)||TJ_deck(x,z))continue;const g=groundY(x,z),H=TJ_hits(C,x+.01,z+.01).filter(h=>h.y>g-.4&&h.y<g+.6);if(!H.length)continue;n++;
    // flush = how far the visible top stands above the road surface (asphalt / pad) under it; band = a painted kerb/edge line on top
    // what the GPU shows: the highest surface; a sub-6 mm tie goes to the stronger polygon offset
    let top=H[0];for(const h of H)if(h.y>=H[0].y-.006&&h.pf<top.pf)top=h;const rs=H.find(h=>h.kind!=='other'),band=top.kind==='asph'&&(top.u<TJ.EB||top.u>1-TJ.EB),fl=rs&&top.kind==='other'?top.y-rs.y:0,kerb=fl>.05;if(band||kerb){strip++;if(!wf)wf={x,z,why:band?'edge band':'raised strip '+fl.toFixed(2)+' m'}}
    if(fl>flush)flush=fl;P.push({x,z,g,off:top.y-g})}
  // neighbour step of the visible surface, ground plane residual
  const idx=new Map(P.map(p=>[p.x+','+p.z,p]));let step=0,kink=0,ws=null;for(const p of P)for(const[dx,dz]of[[1,0],[0,1]]){const q=idx.get((p.x+dx)+','+(p.z+dz));if(q){const d=Math.abs(p.off-q.off);if(d>step){step=d;ws={x:p.x,z:p.z}}}
    // kink: second difference of the visible surface (a fold / warp), y = g + off
    const r=idx.get((p.x-dx)+','+(p.z-dz));if(q&&r)kink=Math.max(kink,Math.abs((q.g+q.off)-2*(p.g+p.off)+(r.g+r.off)))}
  let res=0;if(P.length>=6){let sx=0,sz=0,sy=0,sxx=0,szz=0,sxz=0,sxy=0,szy=0;const N=P.length;for(const p of P){const X=p.x-J.x,Z=p.z-J.z;sx+=X;sz+=Z;sy+=p.g;sxx+=X*X;szz+=Z*Z;sxz+=X*Z;sxy+=X*p.g;szy+=Z*p.g}
    const A=[[sxx,sxz,sx],[sxz,szz,sz],[sx,sz,N]],B=[sxy,szy,sy],det=m=>m[0][0]*(m[1][1]*m[2][2]-m[1][2]*m[2][1])-m[0][1]*(m[1][0]*m[2][2]-m[1][2]*m[2][0])+m[0][2]*(m[1][0]*m[2][1]-m[1][1]*m[2][0]),D=det(A);
    if(Math.abs(D)>1e-9){const s=[0,1,2].map(c=>det(A.map((r,i)=>r.map((v,j)=>j===c?B[i]:v)))/D);for(const p of P)res=Math.max(res,Math.abs(s[0]*(p.x-J.x)+s[1]*(p.z-J.z)+s[2]-p.g))}}
  return{k:J.k,x:Math.round(J.x),z:Math.round(J.z),n,strip,flush:+flush.toFixed(3),step:+step.toFixed(3),kink:+kink.toFixed(3),res:+res.toFixed(3),wf,ws}}
function TJ_run(){const T0=performance.now(),MS=TJ_meshes(),L=TJ_list(),C=TJ_tris(MS,L),out=[];for(const J of L){const o=TJ_one(J,C);if(o.n)out.push(o)}
  const bad=o=>o.strip>0||o.flush>.05||o.step>.1||o.kink>.1,B=out.filter(bad),w=k=>out.reduce((a,o)=>o[k]>a[k]?o:a,out[0]||{});
  const by={};for(const o of out){const b=by[o.k]||(by[o.k]={n:0,bad:0,strip:0});b.n++;if(bad(o))b.bad++;if(o.strip)b.strip++}
  const r={n:out.length,skipped:L.length-out.length,bad:B.length,by,strip:out.filter(o=>o.strip).length,maxFlush:w('flush').flush,maxStep:w('step').step,maxKink:w('kink').kink,maxRes:w('res').res,worst:B.sort((a,b)=>b.strip-a.strip||b.step-a.step).slice(0,6),ms:Math.round(performance.now()-T0)};TJ.last=r;return r}
// GO: run the check, then put the car at the worst junction (or Alex's Hot Drop crossing when all pass)
function TJ_go(){const r=TJ_run(),w=r.worst[0];try{const q=w||(CID==='fra'?{x:2160,z:-240}:JUNC.reduce((a,J)=>Math.hypot(J.x,J.z)<Math.hypot(a.x,a.z)?J:a));roamWarp(q.x-14,q.z-14,Math.atan2(14,14));RO.v=0}catch(e){}
  return'📍 JUNCTIONS · '+r.n+' junctions ('+Object.entries(r.by).map(([k,b])=>k+' '+b.n).join(', ')+') · edge strips on junction asphalt: '+r.strip+' · max strip height above the asphalt '+r.maxFlush+' m (≤0.05) · max step '+r.maxStep+' m (≤0.1) · max fold '+r.maxKink+' m (≤0.1) · (info: ground off-plane '+r.maxRes+' m)'+(w?' · worst '+w.k+' ('+w.x+','+w.z+')'+(w.wf?' '+w.wf.why:''):'')+(r.bad?' ❌':' ✅')}
// ---- fix 1 (Frankfurt): filler road x real street crossings had no junction pad, so the street's painted kerb band, white edge line and
// yellow centre line ran straight across the side road's mouth (Alex b27). A plain-asphalt pad (same texture as the crossing squares /
// street discs) now covers the overlap, draped on the ground 1 cm above the street strip. TJ.pad=0 (?tjpad=0) = off.
TJ.pad=!TJ.off&&!/[?&]tjpad=0/.test(location.search);
function TJ_fx(){if(HUB.tjFx)return HUB.tjFx;const F=[];if(CID==='fra'&&!TJ.off){try{hubRoads()}catch(e){}
  // pad = the filler's own rectangle (full width) over the stretch where any part of its width is inside the street (+1.5 m: the street's kerb band)
  for(const f of FILL_R||[]){const nx=f.uz,nz=-f.ux,hw=f.w/2,ins=t=>{for(const o of[-hw,-hw/2,0,hw/2,hw]){const x=f.x0+f.ux*t+nx*o,z=f.z0+f.uz*t+nz*o,q=TJ_st(x,z);if(q&&q.road.cls!=='hill'&&q.d<q.road.w/2)return q.q}return null};
    let a=null,last=-9,qa=null;const end=()=>{const t0=a-1.5,t1=last+1.5/* past a filler end too: a T-junction's mouth */,B=(t1-t0)/2;if(B>40||B<.5)return;const tm=(t0+t1)/2;F.push({x:f.x0+f.ux*tm,z:f.z0+f.uz*tm,tx:nx,tz:nz,ux:f.ux,uz:f.uz,A:hw,B,ws:qa.road.w,wf:f.w})};
    for(let t=0;t<=f.L;){const q0=cityAt(f.x0+f.ux*t,f.z0+f.uz*t);if(!(q0&&q0.d<q0.road.w/2+hw+8)){if(a!=null&&t-last>3){end();a=null}t+=4;continue}const q=ins(t);if(q){if(a==null){a=t;qa=q}last=t}else if(a!=null&&t-last>3){end();a=null}t+=1}if(a!=null)end()}}
  return HUB.tjFx=F}
// inside a street (true distance) or any junction area, + m: filler kerbs stop there (cityAt's sample distance let them run into junctions on curves)
function TJ_inJunc(x,z,m){const p=TJ_st(x,z);if(p&&p.road.cls!=='hill'&&p.d<p.road.w/2+m)return true;for(const J of JUNC||[])if(Math.abs(J.x-x)<J.r+m&&Math.abs(J.z-z)<J.r+m&&Math.hypot(J.x-x,J.z-z)<J.r+m)return true;
  for(const X of FILL_X||[])if(Math.abs(X.x-x)<X.wa/2+m&&Math.abs(X.z-z)<X.wb/2+m)return true;
  for(const c of TJ_fx()){const dx=x-c.x,dz=z-c.z;if(Math.abs(dx*c.tx+dz*c.tz)<c.A+m&&Math.abs(dx*c.ux+dz*c.uz)<c.B+m)return true}return false}
// near a filler crossing (for the CV boulevard medians, which only stopped at street discs)
function TJ_nearFx(x,z,m){for(const c of TJ_fx())if(Math.hypot(c.x-x,c.z-z)<Math.max(c.A,c.B)+m)return true;return false}
// ---- fix 2: pads conform to the road triangles under them. Every surface drapes the ground on its own coarse grid (up to 4 cm off,
// ART8_tol), so a pad only 0.5-2 cm above "the ground" was often BELOW the road it covers: the road's kerb band / edge line showed
// through, or the two z-fought. While the hub batch is built, road/pad triangles inside junction cells are kept (TJ.cap); a pad vertex
// sits 2.8 cm above the highest of them (TJ_y; 1.2 cm left 1-2 cm dips between 3 m pad vertices on convex ground). TJ.conf=0 (?tjconf=0) = off.
TJ.conf=!TJ.off&&!/[?&]tjconf=0/.test(location.search);
function TJ_cells(){const C=new Map(),put=(x,z,r)=>{for(let i=Math.floor((x-r)/8);i<=Math.floor((x+r)/8);i++)for(let j=Math.floor((z-r)/8);j<=Math.floor((z+r)/8);j++)C.set(i*100000+j,[])};
  for(const J of JUNC||[])put(J.x,J.z,J.r+1);for(const X of FILL_X||[])put(X.x,X.z,Math.hypot(X.wa,X.wb)/2+1);for(const c of TJ_fx())put(c.x,c.z,Math.hypot(c.A,c.B)+1);return C}
// pedestrian streets: the walk texture with a polygon offset (M.walk itself, and the terrain ground trG, are ground, not road)
function TJ_ped(mat){const M=HUB.M;return!!(M&&M.walk&&mat!==M.walk&&mat.map&&mat.map===M.walk.map&&mat.polygonOffset)}
function TJ_isRoad(mat){const M=HUB.M;return!!M&&(mat===M.road||mat===M.street||mat===M.resSt||TJ_ped(mat)||(M.jn&&mat.map===M.jn))}
// asphalt only: pads don't stack on pads (they share texture and world uv, so where two overlap they draw the same pixels)
function TJ_capture(g,mat,matrix){if(!TJ.cap||!TJ_isRoad(mat)||mat.map===HUB.M.jn)return;const P=g.attributes.position,I=g.index,n=I?I.count:P.count,v=new THREE.Vector3(),W=[];
  for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i);if(matrix)v.applyMatrix4(matrix);W.push(v.x,v.y,v.z)}
  for(let t=0;t<n;t+=3){const a=(I?I.getX(t):t)*3,b=(I?I.getX(t+1):t+1)*3,c=(I?I.getX(t+2):t+2)*3,T=[W[a],W[a+1],W[a+2],W[b],W[b+1],W[b+2],W[c],W[c+1],W[c+2]];
    const ar=(T[3]-T[0])*(T[8]-T[2])-(T[6]-T[0])*(T[5]-T[2]);if(Math.abs(ar)<1e-6)continue;T.push(ar);
    const i0=Math.floor(Math.min(T[0],T[3],T[6])/8),i1=Math.floor(Math.max(T[0],T[3],T[6])/8),j0=Math.floor(Math.min(T[2],T[5],T[8])/8),j1=Math.floor(Math.max(T[2],T[5],T[8])/8);if((i1-i0)*(j1-j0)>400)continue;
    for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){const A=TJ.cap.get(i*100000+j);if(A)A.push(T)}}}
// highest captured surface at (x,z) within 0.15 m of the ground (roads drape ≤ ~0.13 m; deck/bridge ramps above are not this junction's surface)
function TJ_top(x,z,g){const A=TJ.cap&&TJ.cap.get(Math.floor(x/8)*100000+Math.floor(z/8));let m=-1e9;if(A)for(const T of A){const ar=T[9],w1=((T[3]-x)*(T[8]-z)-(T[6]-x)*(T[5]-z))/ar,w2=((T[6]-x)*(T[2]-z)-(T[0]-x)*(T[8]-z))/ar,w3=1-w1-w2;
    if(w1<-1e-4||w2<-1e-4||w3<-1e-4)continue;const y=w1*T[1]+w2*T[4]+w3*T[7];if(y>m&&y<g+.15)m=y}return m}
function TJ_y(x,z,off,r=.75){const g=groundY(x,z);if(!TJ.conf||!TJ.cap)return g+off;let e=0;
  if(!r){const t=TJ_top(x,z,g);return Math.max(g+off,t+TJ.mg)}  // r=0: one sample (small decals: zebra stripes)
  // how far the roads under it stand above "ground + off" anywhere within half a vertex spacing (relative to the local ground, so a slope adds nothing)
  for(const[dx,dz]of[[0,0],[r,0],[-r,0],[0,r],[0,-r],[r,r],[r,-r],[-r,r],[-r,-r]]){const x2=x+dx,z2=z+dz,g2=groundY(x2,z2),t=TJ_top(x2,z2,g2);if(t>-1e8)e=Math.max(e,t+TJ.mg-(g2+off))}
  // ground convexity towards the next vertex (2r away): the linear pad would dip by that much
  let c=0;for(const[dx,dz]of[[r,0],[-r,0],[0,r],[0,-r]])c=Math.max(c,groundY(x+dx,z+dz)-(g+groundY(x+2*dx,z+2*dz))/2);return g+off+e+Math.min(c,.04)/* more is a quay wall / embankment edge, not road curvature */}
// a pad = parallelogram c ± A·(ax,az) ± B·(bx,bz), vertices every ≤3 m, conformed; a planar pad (≤3 mm off its plane) is one quad
function TJ_padGeo(cx,cz,ax,az,bx,bz,A,B,off){let na=Math.max(1,Math.ceil(2*A/3)),nb=Math.max(1,Math.ceil(2*B/3));const r=Math.max(A/na,B/nb),V=[];
  for(let i=0;i<=na;i++)for(let j=0;j<=nb;j++){const a=(i/na*2-1)*A,b=(j/nb*2-1)*B,x=cx+ax*a+bx*b,z=cz+az*a+bz*b;V.push([x,TJ_y(x,z,off,r),z,a,b])}
  {let n=V.length,sa=0,sb=0,sy=0,saa=0,sbb=0,sab=0,say=0,sby=0;for(const v of V){sa+=v[3];sb+=v[4];sy+=v[1];saa+=v[3]*v[3];sbb+=v[4]*v[4];sab+=v[3]*v[4];say+=v[3]*v[1];sby+=v[4]*v[1]}
    // grid is symmetric (sa=sb=sab=0): y = k0 + ka·a + kb·b
    const k0=sy/n,ka=saa?say/saa:0,kb=sbb?sby/sbb:0;let e=0;for(const v of V)e=Math.max(e,v[1]-(k0+ka*v[3]+kb*v[4]));const up=Math.max(0,e);
    if(V.every(v=>Math.abs(v[1]-(k0+ka*v[3]+kb*v[4]))<.003)){V.length=0;na=nb=1;for(const i of[0,1])for(const j of[0,1]){const a=(i*2-1)*A,b=(j*2-1)*B;V.push([cx+ax*a+bx*b,k0+ka*a+kb*b+up,cz+az*a+bz*b])}}}
  const pos=[],uv=[],idx=[];for(let i=0;i<=na;i++)for(let j=0;j<=nb;j++){const v=V[i*(nb+1)+j];pos.push(v[0],v[1],v[2]);uv.push(v[0]/8,v[2]/8);if(i<na&&j<nb){const k=i*(nb+1)+j;idx.push(k,k+1,k+nb+1,k+1,k+nb+2,k+nb+1)}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
  if(g.attributes.normal.getY(0)<0){idx.reverse();g.setIndex(idx);g.computeVertexNormals()}return g}
function TJ_pads(bt,M){if(!TJ.pad||CID!=='fra'||!M.jn)return;const jm=new THREE.MeshStandardMaterial({map:M.jn,roughness:.85,metalness:0,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-8});let n=0;
  for(const c of TJ_fx()){bt.add(TJ_padGeo(c.x,c.z,c.tx,c.tz,c.ux,c.uz,c.A,c.B,.056),jm);n++}HUB.tjPads=n}
{const _a=TBatch.prototype.add;TBatch.prototype.add=function(g,mat,matrix){try{TJ_capture(g,mat,matrix)}catch(e){}return _a.call(this,g,mat,matrix)}}
// capture runs only while the hub is built (cells from the final street net: after hubRoads + RD_fillLoop, i.e. at the first road)
{const _b=buildHubG;buildHubG=function*(){TJ.cap=null;TJ.capOn=TJ.conf;try{yield*_b()}finally{TJ.cap=null;TJ.capOn=0}}}
{const _r=TJ_capture;TJ_capture=function(g,mat,matrix){if(TJ.capOn&&!TJ.cap&&TJ_isRoad(mat))TJ.cap=TJ_cells();return _r(g,mat,matrix)}}
{const _f=cityStreetsBuild;cityStreetsBuild=function(bt,M){_f(bt,M);try{TJ_pads(bt,M)}catch(e){console.warn('TJ_pads',e)}}}
