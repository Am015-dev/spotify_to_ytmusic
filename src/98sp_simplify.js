// ---------- SIMP (simplify-1, 2026-10-14). Alex beta.60: "why so many pointless buildings if no road or story ... gaps, buildings that I can pass through. Horrible!!!"
// A smaller, denser, SOLID map (2K Drive's curated open world). ?simp=1 = on (WIP, default OFF until simp/perf passes; then ?simp=0 = the old map).
//  CUT     no building whose whole footprint is > 25 m from a drivable road edge (streets, filler grid, Autobahn), unless near a landmark, story spot or garage
//          (hooks: putK / athUnit in buildHubG, put + the interior pass in athBuildG).
//  POCKETS inside the city box every 16 m cell ≥ 24 m from every road edge (block interiors, back lots) becomes a park pocket: a LEGO hedge on its rim,
//          trees inside, one collider per merged rectangle (hedge face = collider face). You can't drive into the back lots any more.
//  GAPS    bare 20 m cells left in the street band get trees (smashable props, like the street trees).
//  SOLID   every building-like instance without a collider gets one (its footprint); half-timber overlays left without their house go.
function SIMP_S(){return window.__simpS||(window.__simpS={on:/[?&]simp=1\b/.test(location.search),/* WIP: default OFF until simp/perf passes (draw calls not yet -30 %), then flip to !/[?&]simp=0/ */R:null,cut:0,keep:0,ex:null,P:null,st:{}})}
const SIMP_RS=4,SIMP_CUT=25,SIMP_PK=16,SIMP_PE=24,SIMP_HH=2.6,SIMP_HT=1.4;
// road-edge distance raster (4 m cells, metres to the nearest drivable road edge, 0..254; 255 = farther)
function SIMP_paint(R,ax,az,bx,bz,hw){const RS=SIMP_RS,M=SIMP_PE+10,r=hw+M,x0=Math.max(0,Math.floor((Math.min(ax,bx)-r-R.x0)/RS)),x1=Math.min(R.nx-1,Math.floor((Math.max(ax,bx)+r-R.x0)/RS)),z0=Math.max(0,Math.floor((Math.min(az,bz)-r-R.z0)/RS)),z1=Math.min(R.nz-1,Math.floor((Math.max(az,bz)+r-R.z0)/RS)),dx=bx-ax,dz=bz-az,L2=dx*dx+dz*dz||1e-9,D=R.D;
  for(let j=z0;j<=z1;j++){const pz=R.z0+(j+.5)*RS;for(let i=x0;i<=x1;i++){const px=R.x0+(i+.5)*RS;let t=((px-ax)*dx+(pz-az)*dz)/L2;t=t<0?0:t>1?1:t;const e=Math.hypot(ax+dx*t-px,az+dz*t-pz)-hw;if(e>M)continue;const v=e<=0?0:Math.ceil(e),k=j*R.nx+i;if(v<D[k])D[k]=v}}}
// plazas are open, drivable squares: buildings on a plaza front it
function SIMP_rectP(R,x0,x1,z0,z1){const RS=SIMP_RS,M=SIMP_PE+10,i0=Math.max(0,Math.floor((x0-M-R.x0)/RS)),i1=Math.min(R.nx-1,Math.floor((x1+M-R.x0)/RS)),j0=Math.max(0,Math.floor((z0-M-R.z0)/RS)),j1=Math.min(R.nz-1,Math.floor((z1+M-R.z0)/RS));
  for(let j=j0;j<=j1;j++){const pz=R.z0+(j+.5)*RS;for(let i=i0;i<=i1;i++){const px=R.x0+(i+.5)*RS,e=Math.hypot(Math.max(x0-px,0,px-x1),Math.max(z0-pz,0,pz-z1));if(e>M)continue;const v=Math.ceil(e),k=j*R.nx+i;if(v<R.D[k])R.D[k]=v}}}
function SIMP_poly(R,P,hw){for(let i=1;i<P.length;i++)SIMP_paint(R,P[i-1].x,P[i-1].z,P[i].x,P[i].z,hw)}
function SIMP_R(){const S=SIMP_S();if(S.R)return S.R;const t=performance.now(),x0=WX0,z0=WZS,nx=Math.ceil((WX1-WX0)/SIMP_RS),nz=Math.ceil((WZN-WZS)/SIMP_RS),R={x0,z0,nx,nz,D:new Uint8Array(nx*nz).fill(255),lz:0};
  for(const s of CITY_S)if(s.r.cls!=='hill')SIMP_poly(R,s.pts,s.r.w/2);
  for(const f of FILL_R||[])SIMP_paint(R,f.x0,f.z0,f.x1,f.z1,f.w/2);
  try{for(const a of abSamples())SIMP_poly(R,a.pts,a.r.w/2)}catch(e){}
  try{for(const P of PLAZAS)SIMP_rectP(R,P.x0,P.x1,P.z0,P.z1)}catch(e){}
  try{for(const b of ALL_DECKS){const[ax,az]=deckPt(b,-b.hw,0),[bx,bz]=deckPt(b,b.hw,0);SIMP_paint(R,ax,az,bx,bz,b.w/2)}}catch(e){}/* bridges */
  S.R=R;S.st.rasterMs=Math.round(performance.now()-t);return R}
// biome roads are planned after the city (lzPlanAll): painted once they exist
function SIMP_lzRoads(){const R=SIMP_R();if(R.lz>=LZ.roads.length)return;for(let i=R.lz;i<LZ.roads.length;i++){const S=LZ.roads[i];SIMP_poly(R,S.pts,(S.w||8)/2)}R.lz=LZ.roads.length}
function SIMP_D(x,z){const R=SIMP_R(),i=Math.floor((x-R.x0)/SIMP_RS),j=Math.floor((z-R.z0)/SIMP_RS);return i<0||j<0||i>=R.nx||j>=R.nz?255:R.D[j*R.nx+i]}
// landmarks, story / quest / event spots, garages: buildings there stay, no pocket there
function SIMP_ex(){const S=SIMP_S();if(S.ex)return S.ex;const E=[];try{for(const L of LMX)E.push([L.x,L.z,(L.r||40)+30])}catch(e){}
  try{if(CID!=='fra')for(const L of athLmkList())E.push([L.x,L.z,/^(acropolis|lykavittos|filopappou)$/.test(L.id)?350:90])}catch(e){}/* the hills carry walls and terraces of their own */
  try{for(const k in RF.spots){const[x,z]=WP(RF.spots[k][0],RF.spots[k][1]);E.push([x,z,45])}}catch(e){}try{for(const g of GARAGES)if(g.x!=null)E.push([g.x,g.z,70])}catch(e){}
  const G=new Map();for(const e of E){const r=e[2];for(let i=Math.floor((e[0]-r)/200);i<=Math.floor((e[0]+r)/200);i++)for(let j=Math.floor((e[1]-r)/200);j<=Math.floor((e[1]+r)/200);j++){const k=i*100000+j;let A=G.get(k);if(!A)G.set(k,A=[]);A.push(e)}}
  return S.ex={E,G}}
function SIMP_isEx(x,z,m=0){const A=SIMP_ex().G.get(Math.floor(x/200)*100000+Math.floor(z/200));if(A)for(const[a,b,r]of A)if(Math.hypot(a-x,b-z)<r+m)return true;return false}
// footprint distance: min over a 5 × 5 grid of the footprint (edges included)
const SIMP_FP=[];for(const a of[0,-.5,.5,-.25,.25])for(const b of[0,-.5,.5,-.25,.25])SIMP_FP.push([a,b]);
function SIMP_fpD(x,z,w,d,c,s){let m=255;for(const[a,b]of SIMP_FP){const lx=a*w,lz=b*d,v=SIMP_D(x+lx*c+lz*s,z-lx*s+lz*c);if(v<m)m=v;if(m<=SIMP_CUT)break}return m}
// true = do not build it (counted)
function SIMP_cut(x,z,w,d,ry){const S=SIMP_S();if(!S.on)return false;const c=Math.cos(ry||0),s=Math.sin(ry||0);if(SIMP_fpD(x,z,w,d,c,s)<=SIMP_CUT||SIMP_isEx(x,z)){S.keep++;return false}S.cut++;return true}
// cheap early-out for the Athens interior pass: even a 40 m block centred here can't reach a road
function SIMP_far(x,z){return SIMP_S().on&&SIMP_D(x,z)>SIMP_CUT+22&&!SIMP_isEx(x,z)}

// ---------- pockets: 16 m cells ≥ 24 m from every road edge inside the city box → hedge + trees, solid
function SIMP_inRect(R,x,z,m){return x>R.x0-m&&x<R.x1+m&&z>R.z0-m&&z<R.z1+m}
function SIMP_pockets(){const S=SIMP_S();if(!S.on||!HUB.grp||(S.P&&S.P.grp===HUB.grp))return;const t0=performance.now();SIMP_lzRoads();const C=SIMP_PK,x0=Math.max(HX0,WX0+40),z0=Math.max(HZS,WZS+40),nx=Math.floor((Math.min(HX1,WX1-40)-x0)/C),nz=Math.floor((Math.min(HZN,WZN-40)-z0)/C),M=new Uint8Array(nx*nz);
  const BIO=LAZY.filter(L=>!/^(lf_|woods)/.test(L.id)).map(L=>({x0:L.rect[0],x1:L.rect[1],z0:L.rect[2],z1:L.rect[3]})),PZ=[...PARKS,...PLAZAS],ZP=(typeof ZONES!=='undefined'?ZONES:[]).filter(Z=>Z.t==='plaza'||Z.t==='cobble');
  const ok=(x,z)=>{if(SIMP_D(x,z)<SIMP_PE)return false;for(const[a,b]of[[-.5,-.5],[.5,-.5],[-.5,.5],[.5,.5]])if(SIMP_D(x+a*C,z+b*C)<SIMP_PE)return false;
    if(SIMP_isEx(x,z,8)||inRiver(x,z,-(C+6))||onAnyDeck(x,z)||hillH(x,z)>.5)return false;if(PZ.some(R=>SIMP_inRect(R,x,z,6))||ZP.some(R=>SIMP_inRect(R,x,z,4))||BIO.some(R=>SIMP_inRect(R,x,z,20)))return false;
    try{if(trailDist(x,z)<C+8||mtnDist(x,z)<C+14)return false}catch(e){}for(const q of RO.ramps||[])if(q.x!=null&&Math.hypot(q.x-x,q.z-z)<50)return false;return true};
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)if(ok(x0+(i+.5)*C,z0+(j+.5)*C))M[j*nx+i]=1;
  // drop small pockets (< 4 cells): a hedge box round one back yard reads as clutter
  {const seen=new Uint8Array(nx*nz),st=[];for(let k=0;k<nx*nz;k++){if(!M[k]||seen[k])continue;const comp=[];st.push(k);seen[k]=1;while(st.length){const q=st.pop();comp.push(q);const i=q%nx,j=(q-i)/nx;for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]]){const ii=i+a,jj=j+b;if(ii<0||jj<0||ii>=nx||jj>=nz)continue;const kk=jj*nx+ii;if(M[kk]&&!seen[kk]){seen[kk]=1;st.push(kk)}}}if(comp.length<4)for(const q of comp)M[q]=0}}
  const P=S.P={grp:HUB.grp,x0,z0,nx,nz,C,M,rects:[],hedge:0,cells:0,trees:[]},gy=(x,z)=>{try{return groundY(x,z)}catch(e){return 0}};
  // hedge segments on every pocket edge that faces open ground, skipped where a kept building already closes it
  const mat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.62,metalness:0}),bt=new LBatch(1400),root=new THREE.Group();root.userData.simp=1;const cG=new THREE.Color('#2f8a3c'),cT=new THREE.Color('#3fa34a');
  const seg=(ax,az,bx,bz,nxv,nzv)=>{const mx=(ax+bx)/2+nxv*SIMP_HT/2,mz=(az+bz)/2+nzv*SIMP_HT/2,ga=gy(ax,az),gb=gy(bx,bz),g0=Math.min(ga,gb,gy(mx,mz))-.4,g1=Math.max(ga,gb,gy(mx,mz)),h=SIMP_HH+(g1-g0)-.4;
    if(roamHit(mx,mz,.6,g1+1))return;const L=Math.hypot(bx-ax,bz-az)+SIMP_HT,ry=Math.atan2(bx-ax,bz-az),g=new THREE.BoxGeometry(SIMP_HT,h,L);g.rotateY(ry);g.translate(mx,g0+h/2,mz);bt.add(colorize(g,cG),mat);
    const k=new THREE.BoxGeometry(SIMP_HT*.7,.5,L-.4);k.rotateY(ry);k.translate(mx,g0+h+.2,mz);bt.add(colorize(k,cT),mat);P.hedge++};
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){if(!M[j*nx+i])continue;P.cells++;const xa=x0+i*C,za=z0+j*C,xb=xa+C,zb=za+C,m=(ii,jj)=>ii>=0&&jj>=0&&ii<nx&&jj<nz&&M[jj*nx+ii];
    if(!m(i-1,j))seg(xa,za,xa,zb,1,0);if(!m(i+1,j))seg(xb,za,xb,zb,-1,0);if(!m(i,j-1))seg(xa,za,xb,za,0,1);if(!m(i,j+1))seg(xa,zb,xb,zb,0,-1);
    // trees: every other rim cell (behind the hedge) and one per ~25 cells inside, so a pocket reads as a park from the street without 90k trees
    const edge=!m(i-1,j)||!m(i+1,j)||!m(i,j-1)||!m(i,j+1);if(edge?(i+j)%2===0:(i*7+j*13)%25===0)P.trees.push([xa+C*(.3+.4*((i*31+j*17)%5)/4),za+C*(.3+.4*((i*13+j*29)%5)/4),edge?1:0])}
  bt.flush(root);root.traverse(o=>{if(o.isMesh){o.receiveShadow=true;o.userData.simp=1}});HUB.grp.add(root);P.root=root;
  // colliders: column runs merged across equal neighbours (like DR solid), top = highest ground + hedge
  const runs=[];for(let i=0;i<nx;i++){let j=0;while(j<nz){if(!M[j*nx+i]){j++;continue}let k=j;while(k<nz&&M[k*nx+i])k++;runs.push({i0:i,i1:i,j0:j,j1:k});j=k}}
  const byKey=new Map(),out=[];for(const r of runs){const key=r.j0+'_'+r.j1,p=byKey.get(key);if(p&&p.i1===r.i0-1){p.i1=r.i0;continue}const n={...r};byKey.set(key,n);out.push(n)}
  const B=[];for(const r of out){const xa=x0+r.i0*C,xb=x0+(r.i1+1)*C,za=z0+r.j0*C,zb=z0+r.j1*C,x=(xa+xb)/2,z=(za+zb)/2;let g0=1e9,g1=-1e9;for(let a=0;a<=4;a++)for(let b=0;b<=4;b++){const g=gy(xa+(xb-xa)*a/4,za+(zb-za)*b/4);if(g<g0)g0=g;if(g>g1)g1=g}
    B.push(hubAddB({x,z,hw:(xb-xa)/2,hd:(zb-za)/2,h:g1+SIMP_HH+.2,y0:g0-2,simp:1}))}P.rects=B;hubGridAdd(B);S.st.pockets={cells:P.cells,m2:P.cells*C*C,rects:B.length,hedge:P.hedge,ms:Math.round(performance.now()-t0)}}
function SIMP_inPocket(x,z){const P=SIMP_S().P;if(!P)return false;const i=Math.floor((x-P.x0)/P.C),j=Math.floor((z-P.z0)/P.C);return i>=0&&j>=0&&i<P.nx&&j<P.nz&&!!P.M[j*P.nx+i]}
// pocket trees: decorative (behind the hedge, the pocket collider holds the car), one InstancedMesh per tile and kind
function SIMP_pocketTrees(){const S=SIMP_S(),P=S.P,D=HUB.ptypes;if(!P||!P.trees.length||!D||P.tm)return;P.tm=1;const K=['tree3','tree2','tree'].filter(k=>D[k]&&D[k].g),by={};if(!K.length)return;
  P.trees.forEach((t,n)=>{const k=K[n%K.length]+'#'+hubTile(t[0],t[1]);(by[k]=by[k]||[]).push(t)});const q=new THREE.Quaternion(),up=V3(0,1,0),c=new THREE.Color();let n=0;
  for(const key in by){const t=key.split('#')[0],def=D[t],A=by[key],mat=def.mat||D.__pmC||D.__pm||new THREE.MeshStandardMaterial({vertexColors:true,roughness:.5}),im=new THREE.InstancedMesh(def.g,mat,A.length);
    A.forEach((p,i)=>{const s=.9+((i*37)%7)/14;_m.compose(V3(p[0],groundY(p[0],p[1])-.1,p[1]),q.setFromAxisAngle(up,(i*2.39)%6.28),_ts.set(s,s,s));im.setMatrixAt(i,_m);c.set(def.tint?def.tint[i%def.tint.length]:'#ffffff');im.setColorAt(i,c)});
    im.computeBoundingSphere();im.userData.simp=1;P.root.add(im);n+=A.length}S.st.pocketTrees=n}
// gaps: bare 10 m cells in the open street band (no road surface, no building, no prop, no pocket, no water / deck / plaza / story spot).
// A bare patch bigger than 4 cells (400 m²) gets smashable trees through the city's own prop path, on a checkerboard, so no bare patch > 200 m² is left.
function SIMP_any(x,z,r){const L=HUB.grid&&HUB.grid.get(Math.floor(x/40)*10000+Math.floor(z/40));if(L)for(const b of L)if(bHit(b,x,z,r))return true;return false}
function SIMP_bareMap(props){const C=10,x0=Math.max(HX0,WX0+40),z0=Math.max(HZS,WZS+40),nx=Math.floor((Math.min(HX1,WX1-40)-x0)/C),nz=Math.floor((Math.min(HZN,WZN-40)-z0)/C),B=new Uint8Array(nx*nz);
  const PR=new Set();for(const p of props)if(p.alive!==false)PR.add(Math.floor((p.x-x0)/C)+Math.floor((p.z-z0)/C)*nx);
  const PZ=[...PLAZAS,...(typeof ZONES!=='undefined'?ZONES:[]).filter(Z=>Z.t==='plaza'||Z.t==='cobble')];let n=0;
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=x0+(i+.5)*C,z=z0+(j+.5)*C,d=SIMP_D(x,z);if(d===0||d>=255||PR.has(i+j*nx))continue;let ok=true;
    for(const[a,b]of[[0,0],[-3.5,-3.5],[3.5,-3.5],[-3.5,3.5],[3.5,3.5]]){const px=x+a,pz=z+b;if(SIMP_D(px,pz)===0||SIMP_inPocket(px,pz)||SIMP_any(px,pz,.8)){ok=false;break}}
    if(!ok||inRiver(x,z,-2)||onAnyDeck(x,z)||SIMP_isEx(x,z)||PZ.some(R=>SIMP_inRect(R,x,z,0)))continue;B[i+j*nx]=1;n++}
  // 4-connected bare patches
  const lab=new Int32Array(nx*nz).fill(-1),sz=[],st=[];for(let k=0;k<nx*nz;k++){if(!B[k]||lab[k]>=0)continue;const id=sz.length;let c=0;st.push(k);lab[k]=id;while(st.length){const q=st.pop();c++;const i=q%nx,j=(q-i)/nx;
    for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]]){const ii=i+a,jj=j+b;if(ii<0||jj<0||ii>=nx||jj>=nz)continue;const kk=jj*nx+ii;if(B[kk]&&lab[kk]<0){lab[kk]=id;st.push(kk)}}}sz.push(c)}
  return{C,x0,z0,nx,nz,B,lab,sz,n,big:sz.filter(c=>c>4).length,maxM2:Math.max(0,...sz)*C*C}}
function SIMP_gaps(add,L){const S=SIMP_S();if(!S.on)return;const t0=performance.now(),K=['tree3','tree2','tree3','tree','bush'].filter(k=>HUB.ptypes&&HUB.ptypes[k]);if(!K.length)return;
  const M=SIMP_bareMap(L),rnd=mul(9091);let n=0;for(let k=0;k<M.nx*M.nz;k++){if(!M.B[k]||M.sz[M.lab[k]]<=4)continue;const i=k%M.nx,j=(k-i)/M.nx;if((i+j)%2)continue;
    const x=M.x0+(i+.5)*M.C+(rnd()-.5)*4,z=M.z0+(j+.5)*M.C+(rnd()-.5)*4,l0=L.length;add(K[Math.floor(rnd()*K.length)],x,z);if(L.length>l0){L[L.length-1].simp=1;n++}}
  S.st.gaps={bare:M.n,patches:M.big,maxM2:M.maxM2,trees:n,ms:Math.round(performance.now()-t0)}}

// ---------- SOLID: building-like instances without a collider get their footprint as one (half-timber overlays without a house are hidden)
function SIMP_solidTag(o){const u=o.userData;if(u.lf||u.simp||u.st||u.w13||u.art6c)return null;if(u.athB)return/^(poly|neo|plaka)/.test(u.athB)?'athB':null;if(u.cv)return'cv';if(u.bvL)return'bv';if(u.ks)return'ks';
  const n=o.name||'';if(/^ctb/.test(n))return'ctb';if(/^ad_kiosk/.test(n))return'kiosk';if(u.keep&&/^ld_|^ldw_/.test(n))return'ld';return null}
function SIMP_hit(x,z,y){const L=HUB.grid&&HUB.grid.get(Math.floor(x/40)*10000+Math.floor(z/40));if(!L)return null;for(const b of L){if(y>=(b.h||999)-.6||(b.y0!=null&&y<b.y0))continue;if(bHit(b,x,z,.05))return b}return null}
function SIMP_solid(o2){const S=SIMP_S();if(!S.on||!HUB.grid)return;const t0=performance.now(),Mx=new THREE.Matrix4(),bb=new THREE.Box3(),P=V3(),Q=new THREE.Quaternion(),Sc=V3(),E=new THREE.Euler(),Z=new THREE.Matrix4().makeScale(0,0,0);
  const st=S.st.solid=S.st.solid||{seen:0,added:0,hidden:0,by:{}};const add=[];(o2||HUB.grp).updateMatrixWorld(true);
  (o2||HUB.grp).traverse(o=>{if(!o.isInstancedMesh||o.userData.simpS)return;const tag=SIMP_solidTag(o);if(!tag)return;o.userData.simpS=1;const g=o.geometry;if(!g.boundingBox)g.computeBoundingBox();let dirty=false;
    for(let i=0;i<o.count;i++){o.getMatrixAt(i,Mx);Mx.premultiply(o.matrixWorld);bb.copy(g.boundingBox).applyMatrix4(Mx);const h=bb.max.y-bb.min.y,w=bb.max.x-bb.min.x,d=bb.max.z-bb.min.z;if(h<2.5||Math.min(w,d)<2.2||Math.max(w,d)>160)continue;
      const x=(bb.min.x+bb.max.x)/2,z=(bb.min.z+bb.max.z)/2;if(bb.min.y>groundY(x,z)+3)continue;/* roof overlays (crowns) */st.seen++;if(SIMP_hit(x,z,bb.min.y+.6)||SIMP_hit(x,z,groundY(x,z)+.5))continue;
      if(tag==='cv'){o.setMatrixAt(i,Z);dirty=true;st.hidden++;continue}
      // oriented footprint from the instance matrix (local bbox × scale, yaw); thin facade attachments (awnings, shop glass, signs < 1.8 m deep) stay as they are
      Mx.decompose(P,Q,Sc);E.setFromQuaternion(Q,'YXZ');const ry=E.y,lb=g.boundingBox,hw=(lb.max.x-lb.min.x)*Math.abs(Sc.x)/2,hd=(lb.max.z-lb.min.z)*Math.abs(Sc.z)/2,lx=(lb.max.x+lb.min.x)/2*Sc.x,lz=(lb.max.z+lb.min.z)/2*Sc.z,c=Math.cos(ry),s=Math.sin(ry);
      if(Math.min(hw,hd)<.9){st.thin=(st.thin||0)+1;continue}
      add.push(hubAddB({x:P.x+lx*c+lz*s,z:P.z-lx*s+lz*c,hw:Math.max(.5,hw-.15),hd:Math.max(.5,hd-.15),h:bb.max.y,y0:bb.min.y-1.5,ry,simp:2}));st.added++;st.by[tag]=(st.by[tag]||0)+1}
    if(dirty){o.instanceMatrix.needsUpdate=true;o.computeBoundingSphere()}});
  if(add.length)hubGridAdd(add);st.ms=(st.ms||0)+Math.round(performance.now()-t0)}
// late pass (first roam frame): far LEGO sets (CTB rows can end deeper than their slot) are taken out of the set lists (CTB_step reads them), far colliders with
// nothing drawn on them (invisible walls) are dropped; anything else far is left for the simp/far test to report
function SIMP_farClean(only){const S=SIMP_S();if(!S.on)return;const t0=performance.now(),F=new Set(SIMP_farList().far.filter(b=>!only||only.has(b)));if(!F.size){S.st.farClean=S.st.farClean||{ctb:0,ghost:0,left:0,ms:0};return}const del=new Set();let ctb=0,ghost=0;
  const gone=new Set();try{for(const k in CTB.K){const L=CTB.K[k].L;for(let i=L.length-1;i>=0;i--){const o=L[i];if(o.b&&F.has(o.b)){L.splice(i,1);del.add(o.b);F.delete(o.b);gone.add(o);ctb++}}}
    if(gone.size&&CTB.pim){const Z=new THREE.Matrix4().makeScale(0,0,0);CTB.pl.forEach(([o],i)=>{if(gone.has(o))CTB.pim.setMatrixAt(i,Z)});CTB.pim.instanceMatrix.needsUpdate=true;CTB.pim.computeBoundingSphere()}}catch(e){}
  if(F.size){const Mx=new THREE.Matrix4(),P=V3(),Z=new THREE.Matrix4().makeScale(0,0,0),FG=new Map();gridAddTo(FG,[...F]);/* the building and everything standing on its footprint (Athens roofs, balconies) */
    HUB.grp.traverse(o=>{if(!o.isInstancedMesh||!(SIMP_solidTag(o)||o.userData.athB))return;let dirty=false;for(let i=0;i<o.count;i++){o.getMatrixAt(i,Mx);P.setFromMatrixPosition(Mx);const L=FG.get(Math.floor(P.x/40)*10000+Math.floor(P.z/40));if(!L)continue;for(const b of L)if(bHit(b,P.x,P.z,.6)){o.setMatrixAt(i,Z);dirty=true;if(!del.has(b)){del.add(b);S.st.farHid=(S.st.farHid||0)+1}break}}if(dirty){o.instanceMatrix.needsUpdate=true;o.computeBoundingSphere()}});for(const b of del)F.delete(b)}
  const rc=new THREE.Raycaster(),objs=[];HUB.grp.traverse(q=>{if((q.isMesh||q.isInstancedMesh)&&!q.userData.trG&&!q.userData.gk&&!q.userData.simp&&!q.userData.lf)objs.push(q)});HUB.grp.updateMatrixWorld(true);
  for(const b of F){const g=groundY(b.x,b.z);let any=false;for(const[a,c]of[[0,0],[.3,.3],[-.3,-.3]]){rc.set(V3(b.x+a*b.hw,g+400,b.z+c*b.hd),V3(0,-1,0));rc.far=400-.5;try{if(rc.intersectObjects(objs,false).some(h=>h.point.y>g+1.5)){any=true;break}}catch(e){any=true}}if(!any){del.add(b);ghost++}}
  if(del.size){let j=0;for(const b of HUB.bld)if(!del.has(b))HUB.bld[j++]=b;HUB.bld.length=j;for(const[k,A]of HUB.grid){if(A.some(b=>del.has(b)))HUB.grid.set(k,A.filter(b=>!del.has(b)))}}
  const fc=S.st.farClean||{ctb:0,ghost:0,left:0,ms:0};S.st.farClean={ctb:fc.ctb+ctb,ghost:fc.ghost+ghost,left:only?fc.left:F.size-ghost,ms:fc.ms+Math.round(performance.now()-t0)}}
// hooks: pockets after the biome plan (city grid + biome roads known), pocket trees after the props, SOLID once the roam world is up and after each biome
if(typeof lzPlanAll==='function'){const _f=lzPlanAll;lzPlanAll=function(){const r=_f.apply(this,arguments);try{SIMP_pockets()}catch(e){console.warn('SIMP pockets',e)}return r}}
if(typeof buildHubProps==='function'){const _f=buildHubProps;buildHubProps=function(){const r=_f.apply(this,arguments);try{SIMP_pocketTrees()}catch(e){console.warn('SIMP trees',e)}return r}}
if(typeof lzFinish==='function'){const _f=lzFinish;lzFinish=function(L){const r=_f.apply(this,arguments);try{if(L&&L.root)SIMP_solid(L.root);if(L&&L.bld&&L.bld.length)SIMP_farClean(new Set(L.bld))}catch(e){}return r}}
if(typeof lazyStep==='function'){const _f=lazyStep;lazyStep=function(){const S=SIMP_S();if(HUB.built&&HUB.grid&&S.solidGrp===HUB.grp&&++S.sf%300===0){try{SIMP_solid()}catch(e){}}/* late dressing (Athens kiosks) */if(HUB.built&&HUB.grid&&SIMP_S().solidGrp!==HUB.grp){S.sf=0;SIMP_S().solidGrp=HUB.grp;try{SIMP_solid()}catch(e){console.warn('SIMP solid',e)}try{SIMP_farClean()}catch(e){console.warn('SIMP far',e)}}return _f.apply(this,arguments)}}

// ---------- measures + tests (src/99c_checklist.js items ver 'simp'; tools/tSimp.js = before/after numbers + shot grid)
const SIMP_BASE={fra:{calls:1878,tris:17661206},ath:{calls:654,tris:5090560}};/* simp=0 baseline at the 5 perf spots (tools/tSimp.js, docs/SIMPLIFY.md) */
function SIMP_inHX(x,z){return x>HX0&&x<HX1&&z>HZS&&z<HZN}
function SIMP_isBld(b){return !b.simp&&b.hw>=2.5&&b.hd>=2.5&&(b.h-(b.trMin??0))>3}
// buildings in the city box whose whole footprint is > 25 m from a road edge (landmarks / story spots / garages exempt)
function SIMP_farList(){SIMP_lzRoads();const F=[],BIO=LAZY.filter(L=>!/^(lf_|woods)/.test(L.id)).map(L=>L.rect);let n=0;for(const b of HUB.bld){if(!SIMP_isBld(b)||!SIMP_inHX(b.x,b.z))continue;if(BIO.some(r=>b.x>r[0]&&b.x<r[1]&&b.z>r[2]&&b.z<r[3]))continue;/* district set pieces (Osthafen port, Fraport…) are curated like landmarks */n++;const c=b.c??1,s=b.s??0;if(SIMP_fpD(b.x,b.z,b.hw*2+2,b.hd*2+2,c,s)>SIMP_CUT&&!SIMP_isEx(b.x,b.z))F.push(b)/* colliders sit up to 1 m inside the visual */}return{n,far:F}}
// 20 fixed street spots (seeded) in the city box
function SIMP_spots(k=20,seed=77){const rnd=mul(seed),S=CITY_S.filter(S=>S.r.cls!=='quay'&&S.r.cls!=='hill'&&S.r.cls!=='ped'),o=[];let t=0;while(o.length<k&&t++<50000){const s=S[Math.floor(rnd()*S.length)],p=s.pts[Math.floor(rnd()*s.pts.length)];if(SIMP_inHX(p.x,p.z)&&Math.abs(p.x-HX0)>200&&Math.abs(p.x-HX1)>200)o.push([p.x,p.z])}return o}
// building-like visuals (tagged instanced meshes, ≥ 1.8 m deep, ≥ 2.5 m tall, standing on the ground) within 300 m of the spots, and how many have no collider
function SIMP_visCheck(){const spots=SIMP_spots(),near=(x,z)=>spots.some(([a,b])=>Math.abs(a-x)<300&&Math.abs(b-z)<300&&Math.hypot(a-x,b-z)<300),Mx=new THREE.Matrix4(),bb=new THREE.Box3(),P=V3(),Q=new THREE.Quaternion(),Sc=V3();let vis=0,noc=0;const ex=[],by={};HUB.grp.updateMatrixWorld(true);
  HUB.grp.traverse(o=>{if(!o.isInstancedMesh)return;const tag=SIMP_solidTag(o);if(!tag)return;const g=o.geometry;if(!g.boundingBox)g.computeBoundingBox();const lb=g.boundingBox;
    for(let i=0;i<o.count;i++){o.getMatrixAt(i,Mx);Mx.premultiply(o.matrixWorld);bb.copy(lb).applyMatrix4(Mx);const h=bb.max.y-bb.min.y,w=bb.max.x-bb.min.x,d=bb.max.z-bb.min.z;if(h<2.5||Math.min(w,d)<2.2||Math.max(w,d)>160)continue;const x=(bb.min.x+bb.max.x)/2,z=(bb.min.z+bb.max.z)/2;if(!near(x,z)||bb.min.y>groundY(x,z)+3)continue;
      Mx.decompose(P,Q,Sc);if(Math.min((lb.max.x-lb.min.x)*Math.abs(Sc.x),(lb.max.z-lb.min.z)*Math.abs(Sc.z))<1.8)continue;vis++;by[tag]=(by[tag]||0)+1;if(!SIMP_hit(x,z,bb.min.y+.6)&&!SIMP_hit(x,z,groundY(x,z)+.5)){noc++;if(ex.length<5)ex.push([tag,Math.round(x),Math.round(z)])}}});return{vis,noc,ex,by}}
// static draw cost at a view (test page: no forced render): visible meshes in the camera frustum = draw calls, their triangles
function SIMP_drawStat(){camera.updateMatrixWorld(true);const F=new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));let calls=0,tris=0;
  const walk=o=>{if(o.visible===false)return;if((o.isMesh||o.isInstancedMesh||o.isPoints||o.isLine)&&o.geometry){const n=o.isInstancedMesh?o.count:1;if(n>0&&(o.frustumCulled===false||F.intersectsObject(o))){const m=Array.isArray(o.material)?o.material.length:1;calls+=m;const g=o.geometry;tris+=((g.index?g.index.count:g.attributes.position?g.attributes.position.count:0)/3)*n}}for(const c of o.children)walk(c)};walk(scene);return{calls,tris}}
function SIMP_perfSpots(){const o=[];if(CID==='fra')o.push([-64,425,1.6]);else o.push([1720,46,.047]);const ks=Object.keys(RF.spots).sort();for(const k of ks){if(o.length>=5)break;const[x,z]=WP(RF.spots[k][0],RF.spots[k][1]);if(!SIMP_inHX(x,z))continue;const q=rfSnap(x,z,300);if(q&&!o.some(p=>Math.hypot(p[0]-q[0],p[1]-q[1])<300))o.push([q[0],q[1],q[2]])}return o}
function SIMP_park(x,z,h){try{OF_reset()}catch(e){}if(RO.wk){RO.wk=null;try{RBRK.visible=false;pl.mesh.visible=true}catch(e){}}K.ArrowUp=false;roamWarp(x,z,h,true);RO.x=x;RO.z=z;RO.h=RO.vh=h;RO.v=0}
const SIMP_wait=ms=>new Promise(r=>setTimeout(r,ms));
// test-only: traffic cars near the test path are sent to a far node (a traffic car ramming the test car turned it 90° and failed a facade run)
function SIMP_clearTraffic(x,z,r){const N=HUB.nodes||[];let far=-1;for(let i=0;i<N.length;i+=7)if(N[i].nb&&N[i].nb.length&&Math.hypot(N[i].x-x,N[i].z-z)>400){far=i;break}if(far<0)return 0;let n=0;
  for(const c of HUB.cars||[]){if(c.route||c.pk||Math.hypot(c.x-x,c.z-z)>r)continue;c.a=far;c.b=N[far].nb[0];c.t=0;c.x=N[far].x;c.z=N[far].z;n++}
  try{for(const p of HUB.peds||[])if(p&&p.x!=null&&Math.hypot(p.x-x,p.z-z)<r/2)pedPlace(p,150,380)}catch(e){}/* pedestrians too: a push deflected the car */return n}
async function SIMP_perfRun(){const sp=SIMP_perfSpots(),R=[];for(const[x,z,h]of sp){SIMP_park(x,z,h);await SIMP_wait(700);try{hubCullStep()}catch(e){}R.push(SIMP_drawStat())}const s=k=>R.reduce((a,r)=>a+r[k],0);return{spots:sp.length,calls:s('calls'),tris:s('tris'),per:R}}
// facade candidates: a building's face with ≥ d m of clear open ground in front (seeded, spread over the city box)
function SIMP_faces(k,d,seed){const rnd=mul(seed),B=HUB.bld.filter(b=>SIMP_isBld(b)&&SIMP_inHX(b.x,b.z)&&b.hw>=3&&b.hd>=3&&b.hw<40&&b.hd<40),o=[];let t=0;
  while(o.length<k&&t++<4000){const b=B[Math.floor(rnd()*B.length)];if(o.some(f=>Math.hypot(f.b.x-b.x,f.b.z-b.z)<200))continue;const c=b.c??1,s=b.s??0;
    for(const[ax,az,ext]of[[1,0,b.hw],[-1,0,b.hw],[0,1,b.hd],[0,-1,b.hd]]){/* local axis → world normal (bHit: lx=dx*c-dz*s, lz=dx*s+dz*c) */const nx=ax*c+az*s,nz=-ax*s+az*c;let dd=0;/* start on the asphalt in front of the face (as a player would), ≤ d m out: no off-road transform mid-test */for(let q=4;q<=d&&!dd;q+=1)if(SIMP_D(b.x+nx*(ext+q),b.z+nz*(ext+q))===0)dd=Math.min(d,q+2.5);if(!dd)continue;const cx=b.x+nx*(ext+dd),cz=b.z+nz*(ext+dd);
      if(SIMP_any(cx,cz,2.2)||SIMP_inPocket(cx,cz)||inRiver(cx,cz,-2)||onAnyDeck(cx,cz)||SIMP_D(cx,cz)>14)continue;const g0=groundY(cx,cz);let ok=Math.abs(groundY(b.x+nx*(ext+.5),b.z+nz*(ext+.5))-g0)<1.5;
      let gp=g0;for(let q=dd-1;q>.8&&ok;q-=1){const px=b.x+nx*(ext+q),pz=b.z+nz*(ext+q),gq=groundY(px,pz);if(Math.abs(gq-gp)>.5||onAnyDeck(px,pz)||onAnyDeck(px+nz*2.5,pz-nx*2.5)||onAnyDeck(px-nz*2.5,pz+nx*2.5)){ok=false;break}gp=gq;/* no kerb / terrain step on the way (the car bounces off a step, not the building) */const L=HUB.grid.get(Math.floor(px/40)*10000+Math.floor(pz/40))||[];for(const o2 of L)if(o2!==b&&bHit(o2,px,pz,1.3)){ok=false;break}if(ok&&SIMP_propNear(px,pz,2.4))ok=false}
      if(ok){o.push({b,nx,nz,ext,x:cx,z:cz,h:Math.atan2(-nx,-nz)});break}}}return o}
function SIMP_propNear(x,z,r){const G=HUB.pgrid;if(!G)return false;const kx=Math.floor(x/16),kz=Math.floor(z/16);for(let a=-1;a<=1;a++)for(let c=-1;c<=1;c++){const L=G.get((kx+a)*10000+kz+c);if(L)for(const p of L)if(p.alive!==false&&Math.hypot(p.x-x,p.z-z)<r)return true}return false}
// drive (real gas, K.ArrowUp) head-on into each face: the car must stop at the wall (0 frames with its centre inside, centre ≤ 3.6 m from the face)
async function SIMP_hitRun(i0,i1,say){const as0=SET.assist;SET.assist='off';/* the lane assist (a setting) turns a car that starts across a street; this test is about the wall */try{return await SIMP_hitRun1(i0,i1,say)}finally{SET.assist=as0}}
async function SIMP_hitRun1(i0,i1,say){const A=SIMP_faces(15,16,CID==='fra'?501:502),F=A.slice(i0,i1),spare=A.slice(10+i0/2,11+i0/2);if(!F.length)return say('📍 SOLID · no clear facade found ❌');const R=[];
  // one drive: real gas from rolling 11 km/h; 'defl' = something turned the car > 0.35 rad before it got within 4 m of the face (not a wall result: that facade is swapped for the run's spare)
  const drive=async f=>{SIMP_clearTraffic(f.x,f.z,90);SIMP_park(f.x,f.z,f.h);await SIMP_wait(120);RO.h=RO.vh=f.h;RO.crTurn=RO.crBT=null;RO.stkT=0;RO.v=3;let mn=1e9,vmax=0,inb=0,defl=false;const tr=[];K.ArrowUp=true;const t0=performance.now();let st=0,fr=0;
    while(performance.now()-t0<3400&&st<12){await SIMP_wait(16);if(++fr%10===0)SIMP_clearTraffic(RO.x,RO.z,45);if(fr%8===0&&tr.length<30)tr.push([Math.round(performance.now()-t0),+(RO.x-f.x).toFixed(1),+(RO.z-f.z).toFixed(1),+RO.h.toFixed(2),Math.round(Math.abs(RO.v)*3.6)]);
      const dd=(RO.x-f.b.x)*f.nx+(RO.z-f.b.z)*f.nz-f.ext;mn=Math.min(mn,dd);if(mn>4&&Math.abs(angDiff(RO.h,f.h))>.35){defl=true;break}const v=Math.abs(RO.v)*3.6;vmax=Math.max(vmax,v);st=vmax>=10&&v<3?st+1:0;if(bHit(f.b,RO.x,RO.z,0))inb++}K.ArrowUp=false;RO.v=0;
    const ok=inb===0&&mn<=3.6&&mn>=.3&&vmax>=10;return{x:Math.round(f.b.x),z:Math.round(f.b.z),mn:+mn.toFixed(2),vmax:Math.round(vmax),inb,ok,defl:defl&&!inb,h:+f.h.toFixed(2),n:[+f.nx.toFixed(2),+f.nz.toFixed(2)],tr:ok?undefined:tr}};
  let sw=0;for(const f of F){let r=await drive(f);if(!r.ok&&r.defl&&spare.length){sw++;r=await drive(spare.shift());r.swapped=1}R.push(r)}
  const bad=R.filter(r=>!r.ok);window.__chk=window.__chk||{};window.__chk.simpHit=R;say(`📍 SOLID FACADES: drove into ${R.length} buildings with the gas held: ${R.length-bad.length} stopped at the wall`+(sw?` (${sw} swapped: car turned by something else before the wall)`:'')+(bad.length?' · FAIL at '+bad.map(r=>`${r.x},${r.z} (centre ${r.mn} m, ${r.vmax} km/h, ${r.inb} frames inside${r.defl?', deflected':''})`).join('; ')+' ❌':' (centre 0.3–3.6 m from the face, 0 frames inside) ✅'))}
// walk (real W key) into 3 facades: the walker stops at the wall
async function SIMP_walkRun(say){const F=SIMP_faces(3,5,CID==='fra'?601:602);if(!F.length)return say('📍 SOLID ON FOOT · no clear facade ❌');const R=[],key=(t)=>dispatchEvent(new KeyboardEvent(t,{code:'KeyW',key:'w',bubbles:true}));
  for(const f of F){SIMP_park(f.x,f.z,f.h);await SIMP_wait(100);const q=rfSnap(f.x,f.z,400)||[f.x,f.z,0];try{OF_reset()}catch(e){}if(!OF_spawn({cx:q[0],cz:q[1],h:q[2]??0},f.x,f.z,f.h)){R.push({ok:false,x:Math.round(f.b.x),z:Math.round(f.b.z),why:'no spawn'});continue}
    let mn=1e9,inb=0;key('keydown');const t0=performance.now();while(performance.now()-t0<2600){await SIMP_wait(16);const dd=(OF.x-f.b.x)*f.nx+(OF.z-f.b.z)*f.nz-f.ext;mn=Math.min(mn,dd);if(bHit(f.b,OF.x,OF.z,0))inb++}key('keyup');
    R.push({x:Math.round(f.b.x),z:Math.round(f.b.z),mn:+mn.toFixed(2),inb,ok:inb===0&&mn<=3})}try{OF_reset()}catch(e){}
  const bad=R.filter(r=>!r.ok);window.__chk=window.__chk||{};window.__chk.simpWalk=R;say(`📍 SOLID ON FOOT: walked into ${R.length} buildings: ${R.length-bad.length} stopped at the wall`+(bad.length?' · FAIL at '+bad.map(r=>`${r.x},${r.z} (${r.why||r.mn+' m, '+r.inb+' frames inside'})`).join('; ')+' ❌':' (≤ 3 m from the face, 0 frames inside) ✅'))}
// drive into a pocket hedge: it stops the car at the hedge face (the back lots are closed)
async function SIMP_hedgeRun(say){const as0=SET.assist;SET.assist='off';try{return await SIMP_hedgeRun1(say)}finally{SET.assist=as0}}
async function SIMP_hedgeRun1(say){const P=SIMP_S().P;if(!P)return say('📍 HEDGE · no pockets (?simp=0) ❌');const rnd=mul(CID==='fra'?71:72);let f=null;
  for(let t=0;t<300000&&!f;t++){const i=Math.floor(rnd()*P.nx),j=Math.floor(rnd()*P.nz);if(!P.M[j*P.nx+i])continue;for(const[a,b]of[[-1,0],[1,0],[0,-1],[0,1]]){const ii=i+a,jj=j+b;if(ii<0||jj<0||ii>=P.nx||jj>=P.nz||P.M[jj*P.nx+ii])continue;
    const ex=P.x0+(i+.5+a*.5)*P.C,ez=P.z0+(j+.5+b*.5)*P.C,x=ex+a*12,z=ez+b*12;if(SIMP_any(x,z,2.2)||SIMP_D(x,z)>16||inRiver(x,z,-2)||onAnyDeck(x,z))continue;let ok=Math.abs(groundY(x,z)-groundY(ex,ez))<1.5;for(let q=11;q>1&&ok;q--)if(SIMP_any(ex+a*q,ez+b*q,1.3))ok=false;if(ok){f={ex,ez,a,b,x,z};break}}}
  if(!f)return say('📍 HEDGE · no clear hedge found ❌');SIMP_clearTraffic(f.x,f.z,90);SIMP_park(f.x,f.z,Math.atan2(-f.a,-f.b));await SIMP_wait(120);RO.h=RO.vh=Math.atan2(-f.a,-f.b);RO.crTurn=RO.crBT=null;RO.stkT=0;RO.v=3;let mn=1e9,vmax=0,inp=0;K.ArrowUp=true;const t0=performance.now();let st=0;
  while(performance.now()-t0<3400&&st<12){await SIMP_wait(16);const dd=(RO.x-f.ex)*f.a+(RO.z-f.ez)*f.b;mn=Math.min(mn,dd);const v=Math.abs(RO.v)*3.6;vmax=Math.max(vmax,v);st=vmax>=10&&v<3?st+1:0;if(SIMP_inPocket(RO.x,RO.z))inp++}K.ArrowUp=false;RO.v=0;
  const ok=inp===0&&mn<=3.6&&vmax>=10;say(`📍 HEDGE: drove at a park-pocket hedge at up to ${vmax.toFixed(0)} km/h: car centre stopped ${mn.toFixed(2)} m from it (≤ 3.6), ${inp} frames inside the pocket `+(ok?'✅':'❌'))}
function SIMP_go(t,say){if(state!=='roam'||!RO.on)return'📍 Start free roam first';const S=SIMP_S();if(!S.on)return'📍 PENDING · simplify is OFF (WIP): open the page with ?simp=1 to test';const off=S.on?'':' (simplify is OFF: ?simp=0)';
  if(t==='far'){const sp=SIMP_perfSpots()[0];SIMP_park(sp[0],sp[1],sp[2]);const r=SIMP_farList(),ok=r.far.length===0&&S.on;window.__chk=window.__chk||{};window.__chk.simpFar={n:r.n,far:r.far.length};
    return`📍 ROADS ONLY: ${r.n} buildings in the city, ${r.far.length} stand > 25 m from every road (not a landmark / story spot)${r.far.length?' e.g. '+r.far.slice(0,3).map(b=>Math.round(b.x)+','+Math.round(b.z)).join(' '):''} (need 0); removed at build ${S.cut}${off} `+(ok?'✅':'❌')}
  if(t==='solid'){const r=SIMP_visCheck(),ok=r.noc===0&&r.vis>0;window.__chk=window.__chk||{};window.__chk.simpSolid=r;return`📍 SOLID: ${r.vis} buildings / LEGO sets / kiosks within 300 m of 20 street spots, ${r.noc} without a collider${r.ex.length?' e.g. '+r.ex.map(e=>e.join(' ')).join('; '):''} (need 0)${off} `+(ok?'✅':'❌')}
  if(t==='gaps'){const sp=SIMP_perfSpots()[0];SIMP_park(sp[0],sp[1],sp[2]);const M=SIMP_bareMap(HUB.props||[]),ok=M.maxM2<=400&&S.on;window.__chk=window.__chk||{};window.__chk.simpGaps={bare:M.n,big:M.big,maxM2:M.maxM2};
    return`📍 NO BARE GAPS: biggest bare patch in the street band ${M.maxM2} m² (≤ 400), ${M.big} patches > 400 m², ${S.P?S.st.pockets.m2/1e6:0} km² of back lots closed as park pockets${off} `+(ok?'✅':'❌')}
  if(t==='perf'){SIMP_perfRun().then(r=>{const B=SIMP_BASE[CID]||{},dc=B.calls?(1-r.calls/B.calls)*100:0,dt=B.tris?(1-r.tris/B.tris)*100:0,ok=B.calls>0&&dc>=30&&S.on;window.__chk=window.__chk||{};window.__chk.simpPerf={...r,base:B,dc,dt};
    say(`📍 LIGHTER CITY: ${r.calls} draw calls / ${(r.tris/1e6).toFixed(2)} M tris at ${r.spots} street spots vs ${B.calls} / ${((B.tris||0)/1e6).toFixed(2)} M before: ${dc.toFixed(0)} % fewer calls (≥ 30), ${dt.toFixed(0)} % fewer tris${off} `+(ok?'✅':'❌'))});return'📍 LIGHTER CITY · measuring…'}
  {const m=/^hit([1-5])$/.exec(t);if(m){const k=+m[1]-1;SIMP_hitRun(k*2,k*2+2,say);return'📍 SOLID FACADES · driving…'}}
  if(t==='walk'){SIMP_walkRun(say);return'📍 SOLID ON FOOT · walking…'}if(t==='hedge'){SIMP_hedgeRun(say);return'📍 HEDGE · driving…'}return'📍 unknown simp test ❌'}
window.__simp={S:SIMP_S,go:SIMP_go,far:SIMP_farList,vis:SIMP_visCheck,bare:()=>{const M=SIMP_bareMap(HUB.props||[]);return{bare:M.n,big:M.big,maxM2:M.maxM2}},perf:SIMP_perfRun,draw:SIMP_drawStat,spots:SIMP_perfSpots,faces:SIMP_faces,D:SIMP_D,inPocket:SIMP_inPocket,
  stat:()=>({on:SIMP_S().on,cut:SIMP_S().cut,keep:SIMP_S().keep,...SIMP_S().st,bld:HUB.bld.filter(SIMP_isBld).length})};
