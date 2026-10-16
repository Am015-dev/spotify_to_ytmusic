// ---------- build the map
// generic geometry helpers: quads with explicit normals (winding fixed against the normal), ribbons along sample lists
function qGeo(){const P=[],N=[];return{P,N,quad(a,b,c,d,n){const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2],cx=uy*vz-uz*vy,cy=uz*vx-ux*vz,cz=ux*vy-uy*vx,flip=cx*n[0]+cy*n[1]+cz*n[2]<0;
  const T=flip?[a,c,b,b,c,d]:[a,b,c,b,d,c];for(const p of T){P.push(p[0],p[1],p[2]);N.push(n[0],n[1],n[2])}},geo(col){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));return col?colorize(g,new THREE.Color(col)):g}}}
// ground heightfield: coarse cells, refined near water (vertices snapped onto the bank line, water vertices sunk deep) and on hills
const tH=(x,z)=>TR_Y(x,z);
function gndVert(x,z,y0,f){const r=riverAt(x,z);if(!r)return[x,y0+tH(x,z),z,0];const S=r.w,band=f*.6,ad=Math.abs(r.d);let P=r.p,a=r.a,d=r.d,mv=false;
  if(S.basin){if(r.s<-band||r.s>S.L+band)return[x,y0+tH(x,z),z,0];if(r.s<band||r.s>S.L-band){const E=r.s<band?S.pts[0]:S.pts[S.pts.length-1];d=(x-E.x)*E.tz-(z-E.z)*E.tx;P=E;a=0;mv=true}}
  if(ad>=r.hw+band)return[x,y0+tH(x,z),z,0];
  if(ad<r.hw-band&&!mv)return[x,HWY-30,z,1];
  if(ad>=r.hw-band)d=(d<0?-1:1)*r.hw;
  return[P.x+P.tx*a+P.tz*d,y0,P.z+P.tz*a-P.tx*d,0]}
function gndBuild(grp,x0,x1,z0,z1,o){const B=new Map(),cs=o.cs,nx=Math.round((x1-x0)/cs),nz=Math.round((z1-z0)/cs),dx=(x1-x0)/nx,dz=(z1-z0)/nz;
  for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){const ax=x0+i*dx,az=z0+j*dz,cx=ax+dx/2,cz=az+dz/2;if(o.hole&&o.hole(cx,cz))continue;
    let n=1,f=cs,Q=null;if(rivClear(cx,cz)<Math.hypot(dx,dz)/2+o.fine*1.5){n=Math.ceil(dx/o.fine);f=o.fine;if(o.hilly)Q=ART8_riv(ax,az,dx,dz,n)}else if(o.hilly){Q=[];ART7_quad(ax,az,dx,dz,Q)}
    const k0=o.cls(cx,cz),tk='|'+Math.floor((cx-x0)/o.tile)+'|'+Math.floor((cz-z0)/o.tile);let G=null;
    for(const[lx,lz,lw,lh,ln,sn]of Q||[[ax,az,dx,dz]]){if(Q){n=ln||1;f=lw/n}
    // terr-5: o.qcls re-classes each quadtree quad (green mound crowns inside a pavement cell)
    {const k=o.qcls?o.qcls(lx+lw/2,lz+lh/2,k0):k0,key=k+tk;G=B.get(key);if(!G)B.set(key,G={k,p:[],u:[],c:[],n:[],i:[],m:new Map()})}
    const V=[],sx=lw/n,sz=lh/n;for(let a=0;a<=n;a++)for(let b=0;b<=n;b++){const vx=lx+a*sx,vz=lz+b*sz;
      // hot-1: a quadtree corner already in this group's vertex map is re-used below without reading its height: skip its ground samples (same mesh, ~30% fewer TR_Y calls)
      V.push(n>1||sn?gndVert(vx,vz,o.y0,f):Q&&G.m.has(Math.round(vx*16)+','+Math.round(vz*16))?[vx,0,vz,0]:[vx,o.y0+tH(vx,vz)-ART8_dip(vx,vz),vz,0])}
    const ix=[];for(const v of V){const kk=Q?Math.round(v[0]*16)+','+Math.round(v[2]*16):null;if(kk!==null&&G.m.has(kk)){ix.push(G.m.get(kk));continue}ix.push(G.p.length/3);if(kk!==null)G.m.set(kk,G.p.length/3);G.p.push(v[0],v[1],v[2]);G.u.push(v[0]/o.uv,v[2]/o.uv);if(o.col){const c=o.col(v[0],v[2]);G.c.push(c.r,c.g,c.b)}
      if(v[3])G.n.push(0,1,0);else{const e=2,hx=tH(v[0]+e,v[2])-tH(v[0]-e,v[2]),hz=tH(v[0],v[2]+e)-tH(v[0],v[2]-e),l=Math.hypot(hx,2*e,hz);G.n.push(-hx/l,2*e/l,-hz/l)}}
    for(let a=0;a<n;a++)for(let b=0;b<n;b++){const q=a*(n+1)+b;if(V[q][3]&&V[q+1][3]&&V[q+n+1][3]&&V[q+n+2][3])continue;G.i.push(ix[q],ix[q+1],ix[q+n+1],ix[q+1],ix[q+n+2],ix[q+n+1])}}}
  const out=[];for(const G of B.values()){if(!G.i.length)continue;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(G.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(G.n,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(G.u,2));if(o.col)g.setAttribute('color',new THREE.Float32BufferAttribute(G.c,3));g.setIndex(G.i);
    const m=new THREE.Mesh(g,o.mats[G.k]);m.receiveShadow=true;m.userData.gk=G.k;grp.add(m);out.push(m)}return out}
// the Main and the Osthafen basin: water ribbons (~1.2 km pieces so they cull) with the distance to the bank as a vertex attribute (quay foam)
function waterBuild(grp,wm){HUB.water=[];for(const S of WATERS){const P=S.pts,n=P.length;let i0=0;while(i0<n-1){const c=P[i0],city=Math.abs(c.x)<HX1+600&&c.z>HZS-500&&c.z<HZN,st=city?2:4,i1=Math.min(n-1,i0+150),idx=[];for(let i=i0;i<i1;i+=st)idx.push(i);idx.push(i1);
    const K=8,pos=[],bank=[],ix=[];for(const i of idx){const p=P[i],e=p.hw+2;for(let k=0;k<=K;k++){const d=-e+2*e*k/K;pos.push(p.x+p.tz*d,HWY-.1,p.z-p.tx*d);bank.push(Math.max(0,p.hw-Math.abs(d)))}}
    for(let r=0;r<idx.length-1;r++)for(let k=0;k<K;k++){const a=r*(K+1)+k,b=a+K+1;ix.push(a,a+1,b,a+1,b+1,b)}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('aBank',new THREE.Float32BufferAttribute(bank,1));g.setIndex(ix);g.computeVertexNormals();
    {const nn=g.attributes.normal;let sy=0;for(let i=0;i<nn.count;i++)sy+=nn.getY(i);if(sy<0){for(let t=0;t<ix.length;t+=3){const q=ix[t+1];ix[t+1]=ix[t+2];ix[t+2]=q}g.setIndex(ix);g.computeVertexNormals()}}
    const m=new THREE.Mesh(g,wm);grp.add(m);HUB.water.push(m);i0=i1}}}
// quay walls along both banks (inner face, coping, land face), gaps at the slipways, end walls for the basin
function quayBuild(bt,BM){for(const S of WATERS){const P=S.pts,n=P.length;for(const sd of[-1,1]){let i0=0;while(i0<n-1){const i1=Math.min(n-1,i0+100),Q=qGeo();
    for(let i=i0;i<i1;i++){const a=P[i],b=P[i+1];if(S.id==='main'&&SLIPS.some(s=>s.sd===sd&&Math.abs(i-s.i)<=1.5))continue;const pa=d=>[a.x+a.tz*d,a.z-a.tx*d],pb=d=>[b.x+b.tz*d,b.z-b.tx*d],nx=a.tz*sd,nz=-a.tx*sd;
      const A0=pa(sd*a.hw),B0=pb(sd*b.hw),A1=pa(sd*(a.hw+1.6)),B1=pb(sd*(b.hw+1.6));
      Q.quad([A0[0],HWY-1,A0[1]],[B0[0],HWY-1,B0[1]],[A0[0],.25,A0[1]],[B0[0],.25,B0[1]],[-nx,0,-nz]);Q.quad([A0[0],.25,A0[1]],[B0[0],.25,B0[1]],[A1[0],.25,A1[1]],[B1[0],.25,B1[1]],[0,1,0]);Q.quad([A1[0],.25,A1[1]],[B1[0],.25,B1[1]],[A1[0],-.35,A1[1]],[B1[0],-.35,B1[1]],[nx,0,nz])}
    if(Q.P.length)bt.add(Q.geo('#b9ad98'),BM.plain);i0=i1}}
  if(S.basin)for(const p of[S.pts[0],S.pts[S.pts.length-1]])bt.add(cbox(2*p.hw+4,-HWY+.3+1,2,p.x,(HWY-1+.25)/2,p.z,'#b9ad98',Math.atan2(p.tx,p.tz)),BM.plain)}}
// slipways down into the water
// terr-3: the top end meets the bank's ground (slipTop; was fixed at y 0 while the bank stood +4.7..+15 m), the top face is the drive surface (slipY)
function slipBuild(bt,BM){for(const s of SLIPS){const L=30,yT=s.yT=slipTop(s),dy=HWY-yT,len=Math.hypot(L,dy),an=Math.atan2(dy,L),g=new THREE.BoxGeometry(20,.4,len);g.rotateX(-an);const yaw=Math.atan2(s.ix,s.iz);g.rotateY(yaw);g.translate(s.x+s.ix*L/2,(yT+HWY)/2-.2/Math.cos(an),s.z+s.iz*L/2);bt.add(colorize(g,new THREE.Color('#9a9488')),BM.plain);
  for(const sd of[-1,1])bt.add(cbox(.5,.6,L,s.x+s.ix*L/2+s.tx*sd*10,(yT+HWY)/2+.3,s.z+s.iz*L/2+s.tz*sd*10,'#ffcc00',yaw),BM.plain)}}
// an oriented deck: road surface (texture), sides and underside, rails; piers and arches by look
function deckBuild(b,bt,BM,top,uvL,col,railCol){const N=Math.max(12,Math.ceil(b.half*2/6)),A=[];for(let k=0;k<=N;k++){const a=-b.half+2*b.half*k/N;A.push([a,Math.max(deckY(b,a)??0,0)])}
  const pos=[],uv=[],ix=[];for(let k=0;k<=N;k++){const[a,y]=A[k];for(const[c,u]of[[-b.w/2,0],[b.w/2,1]]){const[x,z]=deckPt(b,a,c);pos.push(x,y+.03,z);uv.push(u,(a+b.half)/uvL)}if(k<N){const q=k*2;ix.push(q,q+2,q+1,q+1,q+2,q+3)}}
  const tg=new THREE.BufferGeometry();tg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));tg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));tg.setIndex(ix);tg.computeVertexNormals();if(tg.attributes.normal.getY(0)<0){for(let t=0;t<ix.length;t+=3){const q=ix[t+1];ix[t+1]=ix[t+2];ix[t+2]=q}tg.setIndex(ix);tg.computeVertexNormals()}bt.add(tg,top);
  const Q=qGeo(),R=qGeo(),cn=[b.uz,0,-b.ux],P3=(a,c,y)=>{const[x,z]=deckPt(b,a,c);return[x,y,z]};
  for(let k=0;k<N;k++){const[a0,y0]=A[k],[a1,y1]=A[k+1];for(const sd of[-1,1]){const c=sd*b.w/2,n=[cn[0]*sd,0,cn[2]*sd];Q.quad(P3(a0,c,y0),P3(a1,c,y1),P3(a0,c,y0-.8),P3(a1,c,y1-.8),n);
      const rc=sd*(b.w/2+.25),rh=b.kind==='foot'?1.4:1.2;for(const[o,nn]of[[-.25,[-n[0],0,-n[2]]],[.25,n]])R.quad(P3(a0,rc+sd*o,y0),P3(a1,rc+sd*o,y1),P3(a0,rc+sd*o,y0+rh),P3(a1,rc+sd*o,y1+rh),nn);R.quad(P3(a0,rc-.25*sd,y0+rh),P3(a1,rc-.25*sd,y1+rh),P3(a0,rc+.25*sd,y0+rh),P3(a1,rc+.25*sd,y1+rh),[0,1,0])}
    Q.quad(P3(a0,-b.w/2,y0-.8),P3(a1,-b.w/2,y1-.8),P3(a0,b.w/2,y0-.8),P3(a1,b.w/2,y1-.8),[0,-1,0])}
  bt.add(Q.geo(col),BM.plain);bt.add(R.geo(railCol),BM.plain);const yaw=Math.atan2(b.ux,b.uz);
  if(b.kind==='ab'){for(let a=-b.half+b.L*.75;a<=b.half-b.L*.75;a+=50){const[x,z]=deckPt(b,a),gy=groundY(x,z),H=deckY(b,a)-.8-gy;if(H>1)bt.add(cbox(b.w*.45,H,4,x,gy+H/2,z,'#b9ad98',yaw),BM.plain)}return}
  const pier=a=>{const[x,z]=deckPt(b,a),gy=groundY(x,z),H=(deckY(b,a)??0)-.8-gy;if(H>.5)bt.add(cbox(b.w*.6,H,b.look==='stone'?7:5,x,gy+H/2,z,b.look==='stone'?'#a8553f':'#b9ad98',yaw),BM.plain)};
  if(b.look==='stone'){for(const f of[-.62,-.3,.3,.62])pier(b.hw*f)}else if(b.look!=='lift')for(const f of[-.55,.55])pier(b.hw*f);
  const arch=(a0,R,c,colA,tube=.8,hg=R)=>{const g=new THREE.TorusGeometry(R,tube,6,32,Math.PI);g.scale(1,hg/R,1);g.rotateY(Math.atan2(-b.uz,b.ux));const[x,z]=deckPt(b,a0,c);g.translate(x,(deckY(b,a0)??0)+.2,z);bt.add(colorize(g,new THREE.Color(colA)),BM.plain)};
  if(b.look==='pylon')for(const sd of[-1,1])for(const k of[-1,1])arch(k*b.hw/2,b.hw/2,sd*(b.w/2+.3),b.look==='truss'?'#7b2d26':'#e8ecf0',.6,b.look==='truss'?10:24);
  if(b.look==='arch1')for(const sd of[-1,1])arch(0,b.hw*.95,sd*(b.w/2+.4),'#8a9098',1,22);
  if(b.look==='arch2')for(const sd of[-1,1])for(const k of[-1,1])arch(k*b.hw*.45,b.hw*.5,sd*(b.w/2+.4),'#f2f4f6',.9,18);
  if(b.look==='steel')for(const sd of[-1,1]){const[x,z]=deckPt(b,0,sd*(b.w/2+.4));bt.add(cbox(.8,2.4,b.hw*1.6,x,(deckY(b,0)??0)+1,z,'#4f6f8a',yaw),BM.plain)}
  if(b.look==='lift')for(const sd of[-1,1])for(const k of[-1,1]){const[x,z]=deckPt(b,k*(b.hw+2),sd*(b.w/2+3));bt.add(cbox(5,22,5,x,11,z,'#c0392b',yaw),BM.plain);hubAddB({x,z,hw:2.5,hd:2.5,h:22})}}
// real streets: asphalt ribbons (one material, polygon offset over the filler roads), junction discs on top at every crossing
function cityStreetsBuild(bt,M){const sm=new THREE.MeshStandardMaterial({map:M.road.map,roughness:.85,metalness:0,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4});M.street=sm;
  const pm=CITY_S.some(S=>S.r.cls==='ped')?new THREE.MeshStandardMaterial({map:M.walk.map,color:CID==='fra'?0xf6eedd:0xe2d8c4,roughness:.8,metalness:0,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4}):null;
  const rm=CID!=='fra'?new THREE.MeshStandardMaterial({map:athResTex(),roughness:.85,metalness:0,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4}):sm;M.resSt=rm;
  for(const S of CITY_S){const P=S.pts,w=S.r.w,c=S.r.cls,mt=c==='ped'?pm:c==='res'||c==='link'?rm:sm,yy=c==='hill'||S.hs?.07:.045;let a=0;for(let i=1;i<P.length;i++)if(i-a>=100||i===P.length-1){bt.add(abStrip(P,a,i,-w/2,w/2,yy,yy,32),mt);a=i}}
  const jm=new THREE.MeshStandardMaterial({map:M.jn,roughness:.85,metalness:0,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-8});
  for(const J of JUNC){const g=new THREE.RingGeometry(.01,J.r,24,Math.max(2,Math.ceil(J.r/2)));g.rotateX(-Math.PI/2);g.translate(J.x,0,J.z);const uv=g.attributes.uv,p0=g.attributes.position;for(let i=0;i<uv.count;i++)uv.setXY(i,p0.getX(i)/8,p0.getZ(i)/8);/* terr-2: world uv like every pad */const ps=g.attributes.position;for(let i=0;i<ps.count;i++)ps.setY(i,TJ_y(ps.getX(i),ps.getZ(i),.056,Math.max(.75,J.r*.13)));g.computeVertexNormals();bt.add(g,jm)}/* terr-2: TJ_y = conformed to the streets under the disc */
  for(const T of TRAILS){const P=T.pts;let a=0;for(let i=1;i<P.length;i++)if(i-a>=100||i===P.length-1){bt.add(abStrip(P,a,i,-T.w/2,T.w/2,.06,.06,12),M.dirt);a=i}}}
function* taunusBuildG(L){const grp=L.root,bt=L.bt,BM=HUB.BM,M=HUB.M,lzB=b=>hubAddB(b,L.bld),R=TAU_R,NX=4,NZ=3,W2=(R.x1-R.x0)/NX,D=(R.z1-R.z0)/NZ,nx=Math.ceil(W2/20),nz=Math.ceil(D/25),c=new THREE.Color(),lo=new THREE.Color('#d6f0a8'),mid=new THREE.Color('#a8d888'),hi=new THREE.Color('#e8e2cc'),out=new THREE.Color(WGC);const tm=HUB.tauMat;HUB.terr=[];
  for(let sI=0;sI<NX;sI++)for(let sJ=0;sJ<NZ;sJ++){const g=new THREE.PlaneGeometry(W2,D,nx,nz);g.rotateX(-Math.PI/2);g.translate(R.x0+W2*(sI+.5),0,R.z0+D*(sJ+.5));const p=g.attributes.position,uv=g.attributes.uv,col=new Float32Array(p.count*3);
  for(let i=0;i<p.count;i++){if(i%1200===1199)yield;const x=p.getX(i),z=p.getZ(i),h=tauH(x,z);p.setY(i,h+.01);const k=clamp(h/75,0,1);c.copy(lo).lerp(mid,clamp(k*1.6,0,1));if(k>.75)c.lerp(hi,(k-.75)*3);c.lerp(out,1-tauFade(x,z));col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;uv.setXY(i,x/14,z/14)}
  g.setAttribute('color',new THREE.BufferAttribute(col,3));g.computeVertexNormals();const terr=new THREE.Mesh(g,tm);terr.receiveShadow=true;grp.add(terr);HUB.terr.push(terr);yield}
  // roads: ribbons that follow the hills, with white edge lines
  const em=HUB.tauEdge;
  for(const S0 of mtnSamples())for(let c0=0;c0<S0.pts.length-1;c0+=150){const S={r:S0.r,pts:S0.pts.slice(c0,c0+151)},P=S.pts,w=S.r.w,n=P.length,pos=[],uvs=[],idx=[],ep=[],ei=[];let acc=0;
    for(let i=0;i<n;i++){const a=P[Math.max(0,i-1)],b=P[Math.min(n-1,i+1)],dx=b.x-a.x,dz=b.z-a.z,l=Math.hypot(dx,dz)||1,rx=dz/l,rz=-dx/l;if(i)acc+=Math.hypot(P[i].x-P[i-1].x,P[i].z-P[i-1].z);
      for(const sd of[-1,1]){const x=P[i].x+rx*sd*w/2,z=P[i].z+rz*sd*w/2;pos.push(x,tauH(x,z)+.14,z);uvs.push(sd<0?0:w/16,acc/16);const x2=P[i].x+rx*sd*(w/2-1.2),z2=P[i].z+rz*sd*(w/2-1.2);ep.push(x,tauH(x,z)+.18,z,x2,tauH(x2,z2)+.18,z2)}
      if(i<n-1){const k=i*2;idx.push(k,k+2,k+1,k+1,k+2,k+3);const e=i*4;ei.push(e,e+4,e+1,e+1,e+4,e+5,e+2,e+6,e+3,e+3,e+6,e+7)}}
    const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));rg.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));rg.setIndex(idx);rg.computeVertexNormals();bt.add(rg,M.road);
    const eg=new THREE.BufferGeometry();eg.setAttribute('position',new THREE.Float32BufferAttribute(ep,3));eg.setIndex(ei);eg.computeVertexNormals();bt.add(eg,em);yield}
  // Großer Feldberg: telecom tower and summit hut
  {const S=TAU_SUM,y=TAU_SH;bt.add(cbox(22,16,22,S.x-50,y+8,S.z+15,'#d8d2c8'),BM.plain);lzB({x:S.x-50,z:S.z+15,hw:11,hd:11,h:y+16});
   for(let k=0;k<8;k++)bt.add(colorize(new THREE.CylinderGeometry(4.2-k*.25,4.4-k*.25,9,14).translate(S.x+40,y+4.5+k*9,S.z-20),new THREE.Color(k%2?'#e01e2b':'#f4f4f4')),BM.plain);
   bt.add(colorize(new THREE.CylinderGeometry(.6,.9,30,8).translate(S.x+40,y+87,S.z-20),new THREE.Color('#dfe3ea')),BM.plain);lzB({x:S.x+40,z:S.z-20,hw:4.4,hd:4.4,h:y+100});
   bt.add(colorize(new THREE.SphereGeometry(7,14,10).translate(S.x+40,y+60,S.z-20),new THREE.Color('#f4f4f4')),BM.plain)}
  // Burg Königstein: ruined walls and towers on its hill
  {const C=TAU_CAS,y=TAU_CH,stone='#9a9384';const wall=(x,z,w,d,h)=>{bt.add(cbox(w,h,d,x,y+h/2,z,stone),BM.plain);lzB({x,z,hw:w/2,hd:d/2,h:y+h})};
   wall(C.x,C.z-45,90,6,14);wall(C.x+45,C.z,6,90,14);wall(C.x-45,C.z-20,6,50,14);wall(C.x+25,C.z+45,40,6,14);
   for(const[tx,tz]of[[C.x+45,C.z-45],[C.x-45,C.z-45],[C.x+45,C.z+45]]){bt.add(colorize(new THREE.CylinderGeometry(8,9,30,12).translate(tx,y+15,tz),new THREE.Color(stone)),BM.plain);lzB({x:tx,z:tz,hw:8,hd:8,h:y+30});for(let k=0;k<8;k++){const a=k/8*Math.PI*2;bt.add(cbox(2.4,3,2.4,tx+Math.cos(a)*7.4,y+31.5,tz+Math.sin(a)*7.4,stone),BM.plain)}}
   bt.add(cbox(16,40,16,C.x,y+20,C.z-10,'#8a8374'),BM.plain);lzB({x:C.x,z:C.z-10,hw:8,hd:8,h:y+40});bt.add(colorize(new THREE.ConeGeometry(12,14,4).translate(C.x,y+47,C.z-10),new THREE.Color('#6a3a2a')),BM.plain)};yield
  // Taunus forests: the boot pass kept its random sequence (city props unchanged) and only recorded the spots; more pines for the larger hills
  for(const p of LZ.defer.taunus)L.props.push(p);const rnd=mul(9091);for(let i=0;i<2600;i++){const x=TAU_R.x0+20+rnd()*(TAU_R.x1-TAU_R.x0-40),z=TAU_R.z0+20+rnd()*(TAU_R.z1-TAU_R.z0-40),t=rnd()<.6?'tree3':rnd()<.6?'tree':rnd()<.5?'rock':'bush';if(tauH(x,z)<3||Math.hypot(x-TAU_SUM.x,z-TAU_SUM.z)<TAU_SUM.r+10||Math.hypot(x-TAU_CAS.x,z-TAU_CAS.z)<TAU_CAS.r+10)continue;if(i%200===0)yield;if(mtnDist(x,z)<22||!abClear(x,z))continue;L.props.push([t,x,z])}
  {const ti=new TInst(lzWoodG(),lzWoodM(),1400),TC=['#2f6a3a','#3f7a34','#2a5e34','#4f8a36'],r2=mul(4242),keep=[];let t0=performance.now();for(const p of L.props){if(performance.now()-t0>1.2){yield;t0=performance.now()}if(p[0]==='tree3'||p[0]==='tree'){ti.add(p[1],tauH(p[1],p[2])-.2,p[2],r2()*6,.85+r2()*.5,TC[Math.floor(r2()*TC.length)])}else keep.push(p)}L.props=keep;yield;for(const im of ti.flush(grp))im.userData.nsh=1}}
// Stage 4 biomes (world rects [x0,x1,z0,z1]); g = ground look: field (Wetterau stripes), forest, air (airport grass), town, hill
const BIOMES=CID!=='fra'?(RF.biomes||[]).map(([id,name,e0,e1,n0,n1,g])=>{const R=rfRect([e0,e1,n0,n1]);return{id,name,r:[R.x0,R.x1,R.z0,R.z1],g}}):[{id:'fraport',name:'Fraport',r:[4250,6100,-5170,-3330],g:'air'},{id:'taunus',name:'Taunus',r:[TAU_R.x0,TAU_R.x1,TAU_R.z0,TAU_R.z1],g:'hill'},{id:'homburg',name:'Bad Homburg',r:[2600,4250,5450,6950],g:'town'},
  {id:'wetterau',name:'Wetterau · Bad Vilbel',r:[-8000,2600,3550,7000],g:'field'},{id:'offenbach',name:'Offenbach',r:[-5300,-3440,-1950,250],g:'town'},{id:'hoechst',name:'Höchst',r:[4300,7000,-2100,-250],g:'town'},
  {id:'osthafen',name:'Osthafen',r:[-3000,-1900,-450,250],g:'city'},{id:'stadtwald',name:'Stadtwald',r:[-1500,3300,-3250,-1750],g:'forest'}];
const biomeAt=(x,z)=>{for(const B of BIOMES)if(x>=B.r[0]&&x<B.r[1]&&z>=B.r[2]&&z<B.r[3])return B;return null};
const WGC=CID==='fra'?'#7aa860':'#a9a77a';const outerFree=(x,z)=>!inRiver(x,z,-40)&&!inCity(x,z,350)&&abClear(x,z)&&!inR(TAU_R,x,z,-60);
function worldGroundBuild(grp,bt,BM){const tm=new THREE.MeshStandardMaterial({map:CID==='fra'?groundTex('grass'):athGrassTex(),vertexColors:true,roughness:.92}),base=new THREE.Color(WGC),c=new THREE.Color(),FC=['#9cb85a','#7aa860','#b8b860','#8aa04a','#a0a868'].map(v=>new THREE.Color(v)),FO=new THREE.Color('#5a8a48'),hsh=(x,z)=>{const v=Math.sin(x*12.9898+z*78.233)*43758.5453;return v-Math.floor(v)};
  // outer land: one heightfield with holes for the city box and the Taunus terrain, bank-snapped along the Main
  if(typeof ENV_ground==='function')ENV_ground(tm,{kind:'land',tint:true,base:WGC,s:[900,260,70]});/* env-1 */tm.polygonOffset=true;tm.polygonOffsetFactor=1;tm.polygonOffsetUnits=2;gndBuild(grp,WX0,WX1,WZS,WZN,{cs:200,fine:25,y0:-.01,uv:14,tile:1000,cls:()=>'g',mats:{g:tm},hole:(x,z)=>inCity(x,z)||inR(TAU_R,x,z),hilly:(a,b,c,d)=>(b>HILL.cx-HILL.rx&&a<HILL.cx+HILL.rx&&d>HILL.cz-HILL.rz&&c<HILL.cz+HILL.rz)||[[a,c],[b,c],[a,d],[b,d],[(a+b)/2,(c+d)/2]].some(([x,z])=>tauH(x,z)>.3)||(CID!=='fra'&&athHilly(a,b,c,d)),
    col:(x,z)=>{const r=typeof ENV_on==='function'&&ENV_on()?ENV_vn(x/250,z/250):hsh(Math.round(x/250),Math.round(z/250)),B=biomeAt(x,z),g=B?B.g:CID!=='fra'?'':z>3400?'field':z<-2600&&!inCity(x,z,200)?'forest':'';if(CID!=='fra'){const hh=hillH(x,z);c.copy(base).multiplyScalar(.92+r*.16);if(g==='villa')c.lerp(FO,.45);else if(g==='quarry')c.lerp(new THREE.Color('#d8c6a2'),.5);if(hh>1.5)c.lerp(new THREE.Color('#7f9a5a'),clamp(hh/25,0,.8))}else if(g==='field')c.copy(FC[Math.floor(r*FC.length)]);else if(g==='forest')c.copy(FO).lerp(base,r*.4);else if(g==='air')c.copy(base).lerp(FC[2],.35).multiplyScalar(.95+r*.1);else c.copy(base).multiplyScalar(.9+r*.2);if(Math.abs(x)>WX1-30||z<WZS+30||z>WZN-30)c.lerp(FO,.6);return c}});
  for(const[a,b,z,vert]of[[WX0,WX1,WZS+4,0],[WX0,WX1,WZN-4,0],[WZS,WZN,WX0+4,1],[WZS,WZN,WX1-4,1]]){const n=Math.ceil((b-a)/350);for(let i=0;i<n;i++){const L=(b-a)/n,m=a+L*(i+.5),y=vert?groundY(z,m):groundY(m,z);bt.add(vert?cbox(3,3.2,L,z,1.4+y,m,'#3f7a34'):cbox(L,3.2,3,m,1.4+y,z,'#3f7a34'),BM.plain)}}}
function athResTex(){const[c,g]=cv(128,256),r=mul(92);g.fillStyle='#5d6169';g.fillRect(0,0,128,256);for(let i=0;i<1400;i++){const v=72+r()*40|0;g.fillStyle=`rgba(${v},${v+2},${v+8},.5)`;g.fillRect(r()*128,r()*256,2,2)}for(let i=0;i<6;i++){g.fillStyle='rgba(40,42,46,.35)';g.fillRect(20+r()*80,r()*256,8+r()*20,3)}
  g.fillStyle='#e8e6de';g.fillRect(3,0,3,256);g.fillRect(122,0,3,256);const t=tex(c);t.wrapS=THREE.ClampToEdgeWrapping;t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;KEEP_TEX.add(t);return t}
// CE: raised kerbs (top + street-side face, 0.5 m wide, 0.17 m high) along the drivable real streets; broken at junctions, other streets, filler roads, decks and water.
// Athens: zebra crossings on every street arm of a junction (3+ arms)
function CE_kerbs(bt){const T0=performance.now(),KM=new THREE.MeshStandardMaterial({color:CID==='fra'?0xc9c6be:0xece7dd,roughness:.75,metalness:0,side:THREE.DoubleSide}),NO={ped:1,hill:1,quay:1,trail:1};const KT=new Map();let nRun=0,nSeg=0;
  const JG=new Map();for(const J of JUNC){const k=Math.floor(J.x/64)*100000+Math.floor(J.z/64);if(!JG.has(k))JG.set(k,[]);JG.get(k).push(J)}
  const ok=(x,z,si)=>{const kx=Math.floor(x/64),kz=Math.floor(z/64);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const L=JG.get((kx+a)*100000+kz+b);if(L)for(const J of L)if(Math.hypot(J.x-x,J.z-z)<J.r+1.2)return false}const f=fillAt(x,z);if(f&&f.d<f.r.w/2+.3)return false;if(inRiver(x,z,-2)||onAnyDeck(x,z))return false;return true};
  for(let si=0;si<CITY_S.length;si++){const S=CITY_S[si],c=S.r.cls;if(NO[c]||S.r.w<6)continue;const P=S.pts,w=S.r.w,yb=S.hs?.22:.045;
    for(const sd of[-1,1]){let run=[];const out=()=>{if(run.length>=2){const pos=[],nor=[];for(let k=1;k<run.length;k++){const a=run[k-1],b=run[k];
          const A=[a[0],a[2]+.17,a[1]],B=[b[0],b[2]+.17,b[1]],A2=[a[3],a[5]+.17,a[4]],B2=[b[3],b[5]+.17,b[4]],Ad=[a[0],a[2]-.05,a[1]],Bd=[b[0],b[2]-.05,b[1]];
          pos.push(...A,...B,...B2,...A,...B2,...A2);for(let q=0;q<6;q++)nor.push(0,1,0);const nx=-a[6]*sd,nz=-a[7]*sd;pos.push(...Ad,...Bd,...B,...Ad,...B,...A);for(let q=0;q<6;q++)nor.push(nx,0,nz);nSeg++}
          const tk=hubTile(run[0][0],run[0][1]);let e=KT.get(tk);if(!e)KT.set(tk,e={p:[],n:[]});for(const v of pos)e.p.push(v);for(const v of nor)e.n.push(v);nRun++}run=[]};
      for(let i=0;i<P.length;i++){const p=P[i],rx=p.tz*sd,rz=-p.tx*sd,x=p.x+rx*w/2,z=p.z+rz*w/2,x2=p.x+rx*(w/2+.5),z2=p.z+rz*(w/2+.5);if(ok(p.x+rx*(w/2+.25),p.z+rz*(w/2+.25),si)){const gy=groundY(x,z)+yb;run.push([x,z,gy,x2,z2,gy,rx,rz])}else out()}out()}}
  const T1=performance.now();for(const e of KT.values()){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(e.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(e.n,3));bt.add(g,KM)}
  const T2=performance.now();let nZ=0;if(CID!=='fra'){const ZM=new THREE.MeshStandardMaterial({color:0xf4f4ee,roughness:.6,metalness:0,polygonOffset:true,polygonOffsetFactor:-6,polygonOffsetUnits:-10,side:THREE.DoubleSide}),pos=[];
    for(const J of AJ){if(!J.r||J.ix.length<3)continue;for(const[si,i]of J.ix){const S=CITY_S[si];if(NO[S.r.cls]||S.r.w<7)continue;const P=S.pts,dirs=[];if(i<P.length-1)dirs.push(P[Math.min(P.length-1,i+1)]);if(i>0)dirs.push(P[i-1]);
      for(const q of dirs){let dx=q.x-J.x,dz=q.z-J.z;const l=Math.hypot(dx,dz);if(l<.5)continue;dx/=l;dz/=l;const nx=dz,nz=-dx,c0=J.r+1.4,hw=S.r.w/2-.7;if(l<c0+3.4&&P.length<3)continue;
        for(let o=-hw;o<=hw-.5;o+=1.25){const pts=[[o,c0],[o+.62,c0],[o+.62,c0+3.2],[o,c0+3.2]].map(([a,b])=>{const x=J.x+nx*a+dx*b,z=J.z+nz*a+dz*b;return[x,TJ.conf&&TJ.cap?TJ_y(x,z,.035,0):groundY(x,z)+(S.hs?.24:.068),z]});/* terr-2: on the road under it (+.24 floated 17 cm with TERR shelves off) */
          const[A,B,C,D]=pts;pos.push(...A,...B,...C,...A,...C,...D)}nZ++}}}
    if(pos.length){for(let s=0;s<pos.length;s+=18*400){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos.slice(s,s+18*400),3));const n=new Float32Array(g.attributes.position.count*3);for(let i=1;i<n.length;i+=3)n[i]=1;g.setAttribute('normal',new THREE.BufferAttribute(n,3));bt.add(g,ZM)}}}
  HUB.CE=Object.assign(HUB.CE||{},{kerbRuns:nRun,kerbSeg:nSeg,zebra:nZ,kerbMs:Math.round(performance.now()-T0),kt:[Math.round(T1-T0),Math.round(T2-T1)]})}
function abStrip_v86(P,i0,i1,oa,ob,ya,yb,uvL){const pos=[],uvs=[],idx=[];for(let i=i0;i<=i1;i++){const p=P[i],rx=p.tz,rz=-p.tx;for(const[o,yy,u]of[[oa,ya,0],[ob,yb,1]]){const x=p.x+rx*o,z=p.z+rz*o;pos.push(x,groundY(x,z)+yy,z);uvs.push(u,p.s/uvL)}if(i<i1){const k=(i-i0)*2;idx.push(k,k+2,k+1,k+1,k+2,k+3)}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.setIndex(idx);g.computeVertexNormals();return g}
function abTex(w,lanes){const[c,g]=cv(256,512),k=256/w,r=mul(w*7),X=m=>128+m*k;g.fillStyle='#454950';g.fillRect(0,0,256,512);for(let i=0;i<2600;i++){const v=58+r()*36|0;g.fillStyle=`rgba(${v},${v+2},${v+6},.55)`;g.fillRect(r()*256,r()*512,2,2)}
  g.fillStyle='#8f8f88';g.fillRect(X(-1.1),0,2.2*k,512);g.fillStyle='#f4f4f0';const ln=(m,dash)=>{if(dash)g.fillRect(X(m)-1,0,2,512/3);else g.fillRect(X(m)-1.5,0,3,512)};for(const sd of[-1,1]){ln(sd*1.5);ln(sd*(1.6+lanes*3.8));for(let j=1;j<lanes;j++)ln(sd*(1.6+j*3.8),1)}const t=tex(c);t.wrapS=THREE.ClampToEdgeWrapping;t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;KEEP_TEX.add(t);return t}
const AB_SGN={};function abSign(a,b){const key=a+'|'+b;if(AB_SGN[key])return AB_SGN[key];const[c,g]=cv(512,192);g.fillStyle='#1f4fa8';g.fillRect(0,0,512,192);g.strokeStyle='#fff';g.lineWidth=7;g.strokeRect(8,8,496,176);g.fillStyle='#fff';g.font='bold 34px sans-serif';g.textBaseline='middle';const w=g.measureText(a).width+24;g.fillRect(26,30,w,52);g.fillStyle='#1f4fa8';g.fillText(a,38,57);g.fillStyle='#fff';g.font='bold 40px sans-serif';g.fillText(b,30,132);const t=tex(c,false);KEEP_TEX.add(t);return AB_SGN[key]=new THREE.MeshBasicMaterial({map:t})}
// W12: the asphalt surface is flat between its vertices while groundY (where the tyres sit) is not. ART8's strip checks only the midpoints of
// each 10 m step and of the full width, so on the Autobahn a cell could be 10 m × 38 m with the ground 7-13 cm off its plane under the wheels.
// This strip measures the real error of each triangle on a 2 m grid and adds columns / rows until the asphalt is within 2.5 cm of groundY.
const W12_TOL=.025,W12_ST={t:0,tri:0};
function W12_abStrip(P,i0,i1,w,y,uvL){const T0=performance.now(),oa=-w/2,G=(p,o)=>groundY(p.x+p.tz*o,p.z-p.tx*o),off=(nc,c)=>oa+w*c/nc;
  // columns: lateral chord error at the path points (2 m steps)
  let nc=Math.max(1,Math.ceil(w/12));for(;nc<Math.ceil(w/2);nc++){let e=0;for(let i=i0;i<=i1&&e<=W12_TOL;i+=1){const p=P[i];for(let c=0;c<nc&&e<=W12_TOL;c++){const o0=off(nc,c),o1=off(nc,c+1),g0=G(p,o0),g1=G(p,o1),m=Math.max(1,Math.round((o1-o0)/2));for(let k=1;k<m;k++){const u=k/m;e=Math.max(e,Math.abs(G(p,o0+(o1-o0)*u)-(g0+(g1-g0)*u)))}}}if(e<=W12_TOL)break}
  const mid=(a,b)=>{let tx=a.tx+b.tx,tz=a.tz+b.tz;const l=Math.hypot(tx,tz)||1;return{x:(a.x+b.x)/2,z:(a.z+b.z)/2,tx:tx/l,tz:tz/l,s:(a.s+b.s)/2}};
  // error of the two triangles of every cell between rows a and b (same split as the index below: A,C,B and B,C,D)
  const E=(a,b)=>{const L=Math.hypot(b.x-a.x,b.z-a.z),nt=Math.max(1,Math.round(L/2));let e=0;for(let c=0;c<nc;c++){const o0=off(nc,c),o1=off(nc,c+1),A=G(a,o0),B=G(a,o1),C=G(b,o0),D=G(b,o1),nu=Math.max(1,Math.round((o1-o0)/2));
    for(let i=0;i<=nt;i++)for(let k=0;k<=nu;k++){const t=i/nt,u=k/nu;if((i===0||i===nt)&&(k===0||k===nu))continue;const h=t+u<=1?A+t*(C-A)+u*(B-A):D+(1-t)*(B-D)+(1-u)*(C-D);
     const px=a.x+(b.x-a.x)*t,pz=a.z+(b.z-a.z)*t,tx=a.tx+(b.tx-a.tx)*t,tz=a.tz+(b.tz-a.tz)*t,tl=Math.hypot(tx,tz)||1,o=o0+(o1-o0)*u;e=Math.max(e,Math.abs(groundY(px+tz/tl*o,pz-tx/tl*o)-h));if(e>W12_TOL)return e}}return e};
  const Q=[],rec=(a,b,d)=>{if(d<4&&Math.hypot(b.x-a.x,b.z-a.z)>1.2&&E(a,b)>W12_TOL){const m=mid(a,b);rec(a,m,d+1);Q.push(m);rec(m,b,d+1)}};
  for(let i=i0;i<=i1;i++){Q.push(P[i]);if(i<i1)rec(P[i],P[i+1],0)}
  const pos=[],uvs=[],idx=[],C=nc+1;for(let i=0;i<Q.length;i++){const p=Q[i];for(let c=0;c<=nc;c++){const o=off(nc,c),x=p.x+p.tz*o,z=p.z-p.tx*o;pos.push(x,groundY(x,z)+y,z);uvs.push(c/nc,p.s/uvL)}
    if(i<Q.length-1)for(let c=0;c<nc;c++){const k=i*C+c;idx.push(k,k+C,k+1,k+1,k+C,k+C+1)}}
  W12_ST.tri+=idx.length/3;W12_ST.t+=performance.now()-T0;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.setIndex(idx);g.computeVertexNormals();return g}
function abBuild(grp,bt,BM,M){const MT={},TX={};let rk=0;const mat=r=>{const t=r.w+'/'+(r.w>=38?3:2),k=t+'/'+r.id+'/'+(r.c?1:0)+'/'+r.y;if(!TX[t])TX[t]=abTex(r.w,r.w>=38?3:2);if(!MT[k]){rk++;MT[k]=new THREE.MeshStandardMaterial({map:TX[t],roughness:.8,metalness:0,polygonOffset:true,polygonOffsetFactor:-1-rk*.25,polygonOffsetUnits:-2-rk*2})}return MT[k]};
  // asphalt ribbons in 400 m pieces (tile-batched); stretches over an oriented deck are drawn as the deck instead
  for(const S of abSamples()){const P=S.pts,r=S.r,mt=r.ab?mat(r):M.road,uL=r.ab?18:32;let a=0;const fl=(i0,i1)=>{if(i1>i0)bt.add(W12_abStrip(P,i0,i1,r.w,AB_RY(r),uL),mt)};for(let i=0;i<P.length-1;i++){const mx=(P[i].x+P[i+1].x)/2,mz=(P[i].z+P[i+1].z)/2;if(AB_BRIDGES.some(b=>{if(Math.abs(P[i].tx*b.ux+P[i].tz*b.uz)<.9)return false;const[da,dc]=deckLocal(b,mx,mz);return Math.abs(da)<b.half&&Math.abs(dc)<b.w/2+2})){fl(a,i);a=i+1;continue}if(i+1-a>=40){fl(a,i+1);a=i+1}}fl(a,P.length-1)}
  for(const b of AB_BRIDGES)deckBuild(b,bt,BM,mat(b.road),18,'#6a6f7a','#dfe3ea');
  // gantry signs every 2 km, reflector posts every 50 m
  const RP=new TInst(mergeG([cbox(.2,1.1,.2,0,.55,0,'#f4f4f0'),cbox(.22,.2,.22,0,.85,0,'#1a1a1a')]),new THREE.MeshStandardMaterial({vertexColors:true,roughness:.6}),1000);
  for(const S of abSamples()){const r=S.r;if(!r.ab)continue;const P=S.pts;for(let i=0;i<P.length;i+=5){const p=P[i];if(abSkip(p.x,p.z))continue;for(const sd of[-1,1])RP.add(p.x+p.tz*sd*(r.w/2+.8),groundY(p.x,p.z),p.z-p.tx*sd*(r.w/2+.8))}
    if(r.c)continue;for(let s=1000;s<S.L-300;s+=2000){const p=P[Math.round(s/(S.L/(P.length-1)))];if(abSkip(p.x,p.z))continue;const gy=groundY(p.x,p.z),ry=Math.atan2(p.tx,p.tz),rx=p.tz,rz=-p.tx;for(const sd of[-1,1])bt.add(cbox(.7,8.4,.7,p.x+rx*sd*(r.w/2+1.5),gy+4.2,p.z+rz*sd*(r.w/2+1.5),'#8a9098'),BM.plain);bt.add(cbox(r.w+3.6,.7,.7,p.x,gy+8,p.z,'#8a9098',ry),BM.plain);
      for(const dir of[1,-1]){const sw=r.w/2-3,cx=p.x-rx*dir*r.w/4-p.tx*dir*.6,cz=p.z-rz*dir*r.w/4-p.tz*dir*.6,pg=new THREE.PlaneGeometry(sw,sw*.375);pg.rotateY(Math.atan2(-p.tx*dir,-p.tz*dir));pg.translate(cx,gy+6.2,cz);bt.add(pg,abSign(r.id,r.to[dir>0?0:1]));const bk=new THREE.BoxGeometry(sw+.3,sw*.375+.3,.2);bk.rotateY(ry);bk.translate(p.x-rx*dir*r.w/4,gy+6.2,p.z-rz*dir*r.w/4);bt.add(colorize(bk,new THREE.Color('#2a2f38')),BM.plain)}}}
  RP.flush(grp);
  // connector signs at the city end ('Autobahn' + target)
  for(const S of abSamples()){const r=S.r;if(r.ab)continue;const p=S.pts[3],rx=p.tz,rz=-p.tx,x=p.x-rx*(r.w/2+2.5),z=p.z-rz*(r.w/2+2.5),gy=groundY(x,z);bt.add(cbox(.4,4.6,.4,x,gy+2.3,z,'#8a9098'),BM.plain);const A=AB.find(q=>q.id===r.id),pg=new THREE.PlaneGeometry(6,2.25);pg.rotateY(Math.atan2(-p.tx,-p.tz));pg.translate(x-p.tx*.3,gy+4.6,z-p.tz*.3);bt.add(pg,abSign(r.id,'Autobahn ▶'))}
  // garages outside the city (fast-travel points): a small workshop behind each beacon
  for(const G of GARAGES){if(G.x==null)continue;const sx=Math.sin(G.h),sz=Math.cos(G.h),hx=G.wx??G.x-sx*36,hz=G.wz??G.z-sz*36,sw=Math.abs(sx)>.5,ys=[[-14,-9],[14,-9],[-14,9],[14,9]].map(([a,b])=>groundY(hx+(sw?b:a),hz+(sw?a:b))),y0=Math.min(...ys)-.4,H=10+Math.max(...ys)-y0;
    bt.add(cbox(28,H,18,hx,y0+H/2,hz,CID==='fra'?'#7ac05a':'#f4f2ec',G.h),BM.brick);bt.add(cbox(14,7,.5,hx+sx*9.1,y0+H-10+3.5+.4,hz+sz*9.1,'#2f3640',G.h),BM.plain);bt.add(cbox(20,2.6,.5,hx+sx*9.4,y0+H-1.6,hz+sz*9.4,'#ffcc00',G.h),BM.plain);hubAddB({x:hx,z:hz,hw:14,hd:9,h:y0+H,ry:G.h})}}
// ---------- living water: rolling waves (same function drives the boat), ripples, crest highlights, quay foam
const waveH=(x,z,t)=>.38*Math.sin(x*.045+t*1.6)+.26*Math.sin(z*.09+x*.021-t*1.9)+.15*Math.sin((x+z)*.13+t*2.7);
function waterMat(){const m=new THREE.MeshStandardMaterial({color:0x2b7fb0,roughness:.14,metalness:.3,envMapIntensity:1.5});const U={uT:{value:0}};HUB.waterU=U.uT;
  m.onBeforeCompile=sh=>{sh.uniforms.uT=U.uT;
    sh.vertexShader='uniform float uT;varying vec3 vWP;attribute float aBank;varying float vBank;\nfloat wvH(vec2 p,float t){return .38*sin(p.x*.045+t*1.6)+.26*sin(p.y*.09+p.x*.021-t*1.9)+.15*sin((p.x+p.y)*.13+t*2.7);}\n'+sh.vertexShader
      .replace('#include <beginnormal_vertex>','#include <beginnormal_vertex>\nvec3 wpN=(modelMatrix*vec4(position,1.)).xyz;float e=.6,h0=wvH(wpN.xz,uT);objectNormal=normalize(vec3(-(wvH(wpN.xz+vec2(e,0.),uT)-h0)/e,1.,(wvH(wpN.xz+vec2(0.,e),uT)-h0)/e));')
      .replace('#include <begin_vertex>','#include <begin_vertex>\nvec3 wp0=(modelMatrix*vec4(transformed,1.)).xyz;transformed.y+=wvH(wp0.xz,uT);vWP=wp0;vBank=aBank;');
    sh.fragmentShader='uniform float uT;varying vec3 vWP;varying float vBank;\n'+sh.fragmentShader
      .replace('#include <normal_fragment_maps>','#include <normal_fragment_maps>\nvec2 q=vWP.xz;float r1=sin(q.x*.9+uT*3.1)*sin(q.y*1.1-uT*2.3),r2=sin(q.x*2.3-uT*4.)*sin(q.y*1.9+uT*3.6);normal=normalize(normal+vec3(r1*.12+r2*.06,0.,r2*.1-r1*.05));')
      .replace('#include <color_fragment>','#include <color_fragment>\nfloat bank=vBank;float fo=smoothstep(6.,0.,bank+sin(vWP.x*.35+uT*2.)*1.4);float crest=smoothstep(.45,.7,wvH(vWP.xz,uT)/.79*.5+.5);float mid=1.-smoothstep(0.,70.,bank);diffuseColor.rgb=mix(diffuseColor.rgb*vec3(.72,.85,1.),diffuseColor.rgb*1.12,mid);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.92,.97,1.),max(fo*.85,crest*.35));');
    sh.fragmentShader=sh.fragmentShader.replace('float wvH','float wvH');if(!/float wvH/.test(sh.fragmentShader))sh.fragmentShader=sh.fragmentShader.replace('varying vec3 vWP;','varying vec3 vWP;\nfloat wvH(vec2 p,float t){return .38*sin(p.x*.045+t*1.6)+.26*sin(p.y*.09+p.x*.021-t*1.9)+.15*sin((p.x+p.y)*.13+t*2.7);}')};
  return m}
// ---------- Stage 3: landmark set pieces (LEGO look: blocky stepped forms, flat saturated colours, studs on flat roofs).
// Every piece is merged into the tile batches (no extra draw calls), registers its colliders and sets LM_BY[name].h (top y)
// and .top (x,z of the highest part); the photo spot (a clear street point nearby) is found lazily by lmPhoto().
function flipG(g){g=g.index?g.toNonIndexed():g;for(const k of['position','normal','uv','color']){const A=g.attributes[k];if(!A)continue;const s=A.itemSize,a=A.array;for(let t=0;t<a.length;t+=3*s)for(let j=0;j<s;j++){const q=a[t+s+j];a[t+s+j]=a[t+2*s+j];a[t+2*s+j]=q}}const n=g.attributes.normal.array;for(let i=0;i<n.length;i++)n[i]=-n[i];return g}
const LMI={sky:[],hbf:null};
