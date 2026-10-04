// ===== OC (owner bugs 2): soft night lights, real-scale Acropolis, height fixes, nothing standing on the roads
const OC={dropT:{},pool:null,lamps:[],acro:null,moved:0,dropped:0,sunk:0,scaled:{},skip:/^(parthenon|erechtheion|propylaea|odeon)$/};
// ---------- 1 · night lights. Headlights: one faint additive fan per car that fades along its length and to its edges (peak +0.24 after
// FL's 2.4x night colour, no hard polygon); street lamps: a small bulb under each head + a warm radial pool on the ground (one draw call)
function OC_beamGeo(){const NL=14,NW=8,L=20,P=[],C=[],I=[];
  for(let i=0;i<=NL;i++){const t=i/NL,z=2.3+t*L,hw=.95+t*L*.3,f=Math.min(1,t/.06)*(1-t)*(1-t);for(let j=0;j<=NW;j++){const u=j/NW*2-1,g=(1-u*u)*(1-u*u),k=.1*f*g;P.push(u*hw,.16,z);C.push(k,k*.93,k*.78)}}
  for(let i=0;i<NL;i++)for(let j=0;j<NW;j++){const a=i*(NW+1)+j,b=a+1,c=a+NW+1,d=c+1;I.push(a,c,b,b,c,d)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));g.setIndex(I);g.setAttribute('uv',new THREE.Float32BufferAttribute(new Array(P.length/3*2).fill(0),2));g.computeVertexNormals();return g}
FL_headlights=function(n){if(!HUB.grp||!HUB.cars)return;let H=FL.hl;const N=HUB.cars.length+1;
  if(!H||H.parent!==HUB.grp||H.count<N){if(H&&H.parent)H.parent.remove(H);
    const L=[cbox(.42,.26,.12,-.72,.85,2.25,'#fff6d8'),cbox(.42,.26,.12,.72,.85,2.25,'#fff6d8'),cbox(.36,.2,.1,-.74,.9,-2.25,'#ff2a20'),cbox(.36,.2,.1,.74,.9,-2.25,'#ff2a20')];L.push(OC_beamGeo());
    const mat=new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false,color:0x000000,fog:true,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4});
    H=FL.hl=new THREE.InstancedMesh(mergeG(L),mat,N+8);H.frustumCulled=false;H.renderOrder=2;HUB.grp.add(H);H.userData.keep=1;H.userData.oc=1}
  H.material.color.setScalar(2.4*n);let j=0;
  if(pl&&RO.on){FL_hq.setFromAxisAngle(FL_hy,RO.h);FL_hm.compose(FL_hv.set(RO.x,RO.y,RO.z),FL_hq,FL_hs.set(1.2,1.2,1.25));H.setMatrixAt(j++,FL_hm)}
  for(const c of HUB.cars){if(c.dead>0)continue;const im=HUB.cim[c.k];if(!im)continue;im.getMatrixAt(c.j,FL_hm);H.setMatrixAt(j++,FL_hm)}
  H.count=j;H.instanceMatrix.needsUpdate=true;OC_poolStep(n)};
// radial pool: 6 concentric discs (radius 1 .. 0.2) merged into one geometry, each adding 1/6 of the light: a soft stepped falloff to the rim
function OC_poolGeo(){const L=[];for(let k=0;k<6;k++){const r=.5*(1-k*.16);L.push(new THREE.CircleGeometry(r,28).rotateX(-Math.PI/2).toNonIndexed())}const P=[];for(const g of L)P.push(...g.attributes.position.array);
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));return g}
// lamp heads: the 1.4 m white glow ball becomes a small flattened bulb under the head; pools of light on the ground under every lamp
function OC_lampsBuild(){const D=HUB.ptypes;if(!D||!D.lamp||!HUB.lampGlow)return;const bulb=new THREE.SphereGeometry(.3,10,6);bulb.scale(1.3,.5,1);bulb.translate(0,-.3,0);
  HUB.grp.traverse(o=>{if(o.isInstancedMesh&&o.material===HUB.lampGlow)o.geometry=bulb});
  const L=OC.lamps=HUB.props.filter(p=>p.t==='lamp');if(OC.pool&&OC.pool.parent)OC.pool.parent.remove(OC.pool);OC.pool=null;if(!L.length)return;
  const g=OC_poolGeo(),mat=new THREE.MeshBasicMaterial({color:new THREE.Color(1,.74,.42),transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false,fog:true,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-6});
  const im=new THREE.InstancedMesh(g,mat,L.length),m=new THREE.Matrix4(),q=new THREE.Quaternion(),up=V3(0,1,0),nv=V3(),s=V3(10,1,10);
  L.forEach((p,i)=>{const o=D.lamp.head.clone().applyAxisAngle(up,p.ry),x=p.x+o.x*.8,z=p.z+o.z*.8,[gx,gz]=TR_grad(x,z,2.5);nv.set(-gx,1,-gz).normalize();q.setFromUnitVectors(up,nv);m.compose(V3(x,groundY(x,z)+.12,z),q,s);im.setMatrixAt(i,m);p.ocP=i});
  im.computeBoundingSphere();im.frustumCulled=false;im.renderOrder=1;im.visible=false;im.userData.keep=1;im.userData.ocPool=1;HUB.grp.add(im);OC.pool=im;OC.pm=m;OC.dead=new Set()}
function OC_poolStep(n){const P=OC.pool;if(!P)return;P.material.opacity=.04*n;OC.poolPeak=6*.04*n;P.visible=n>.02;if(!P.visible)return;OC.pt=(OC.pt||0)+1;if(OC.pt%20)return;let ch=false;
  for(const p of OC.lamps){const dead=!p.alive;if(dead===OC.dead.has(p))continue;if(dead){OC.dead.add(p);P.getMatrixAt(p.ocP,OC.pm);p.ocM=OC.pm.clone();OC.pm.makeScale(0,0,0)}else{OC.dead.delete(p);OC.pm.copy(p.ocM)}P.setMatrixAt(p.ocP,OC.pm);ch=true}if(ch)P.instanceMatrix.needsUpdate=true}
// ---------- 2 · props: nothing stands on a drivable surface (streets, filler roads, Autobahn, biome roads, trails, junctions); real heights;
// ground-placed props sit on the lowest ground under their footprint (no floating edge on slopes)
const OC_GAME=new Set(['bricks','tower','gold','cone','barrier','clight']);// smash pickups / roadworks deliberately placed on the lanes
const OC_fp=(t,D)=>t.startsWith('car')||/^CE_(car|taxi)/.test(t)?1.1:Math.min((D[t]?D[t].r:1)*.5,1.2);
function OC_roadE(x,z){let e=1e9;const r=athRoadD(x,z,48);if(r)e=r.e;const f=fillAt(x,z);if(f)e=Math.min(e,f.d-f.r.w/2);const a=abAt(x,z);if(a)e=Math.min(e,a.d-a.road.w/2);
  e=Math.min(e,lzRoadD(x,z),OC_segE(x,z));for(const J of OC_junc(x,z))e=Math.min(e,Math.hypot(J.x-x,J.z-z)-J.r);return e}
// trails and Taunus roads: exact distance to their sampled centrelines (segments), edge = half width
function OC_segE(x,z){if(!OC.sg){OC.sg=new Map();const L=[...TRAILS.map(T=>[T.pts,(T.w||12)/2])];if(CID==='fra')for(const S of mtnSamples())L.push([S.pts,6]);
    for(const[P,h]of L)for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i],k=Math.floor((a.x+b.x)/2/64)*100000+Math.floor((a.z+b.z)/2/64);let A=OC.sg.get(k);if(!A)OC.sg.set(k,A=[]);A.push(a,b,h)}}
  let e=1e9;const kx=Math.floor(x/64),kz=Math.floor(z/64);for(let u=-1;u<=1;u++)for(let v=-1;v<=1;v++){const A=OC.sg.get((kx+u)*100000+kz+v);if(!A)continue;for(let j=0;j<A.length;j+=3){const a=A[j],b=A[j+1],dx=b.x-a.x,dz=b.z-a.z,l2=dx*dx+dz*dz||1e-9;let t=((x-a.x)*dx+(z-a.z)*dz)/l2;t=t<0?0:t>1?1:t;e=Math.min(e,Math.hypot(a.x+dx*t-x,a.z+dz*t-z)-A[j+2])}}return e}
function OC_junc(x,z){if(!OC.jg||OC.jgn!==JUNC.length){OC.jg=new Map();OC.jgn=JUNC.length;for(const J of JUNC){if(!(J.r>0))continue;const k=Math.floor(J.x/64)*100000+Math.floor(J.z/64);let A=OC.jg.get(k);if(!A)OC.jg.set(k,A=[]);A.push(J)}}
  const out=[],kx=Math.floor(x/64),kz=Math.floor(z/64);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const A=OC.jg.get((kx+a)*100000+kz+b);if(A)out.push(...A)}return out}
function OC_minG(x,z,r){let m=groundY(x,z);for(let k=0;k<6;k++){const a=k/6*Math.PI*2;m=Math.min(m,groundY(x+Math.cos(a)*r,z+Math.sin(a)*r))}return m}
function OC_props(L,D){OC_scaleDefs(D);let j=0;for(const p of L){let ground=Math.abs(p.y-groundY(p.x,p.z))<.05;
    if(!OC_GAME.has(p.t)){const fp=OC_fp(p.t,D),m=.35;let e=OC_roadE(p.x,p.z);
      if(e<fp+m){const car=p.t.startsWith('car')||/^CE_(car|taxi)/.test(p.t);let ok=false;
        if(!car&&p.t!=='lamp'){const h=.8,gx=OC_roadE(p.x+h,p.z)-OC_roadE(p.x-h,p.z),gz=OC_roadE(p.x,p.z+h)-OC_roadE(p.x,p.z-h),gl=Math.hypot(gx,gz);
          if(gl>.1){for(const ex of[.6,2]){const s=fp+m+ex-e,x=p.x+gx/gl*s,z=p.z+gz/gl*s;if(OC_roadE(x,z)>=fp+m&&!roamHit(x,z,(D[p.t]?D[p.t].r:1)*.6)&&!inRiver(x,z,-1)){p.x=x;p.z=z;if(ground)p.y=groundY(x,z);ok=true;OC.moved++;break}}}}
        if(!ok){OC.dropped++;const k=car?'cars':/tree|olive|pine|cypress|bush/.test(p.t)?'trees':p.t==='lamp'?'lamps':'other';OC.dropT[k]=(OC.dropT[k]||0)+1;continue}}}
    const g0=groundY(p.x,p.z);if(!ground&&p.y<g0-.3&&p.y>g0-4){p.y=g0;ground=true}// buried props come up to the ground
    if(ground&&D[p.t]){const y=OC_minG(p.x,p.z,OC_fp(p.t,D));if(g0-y>1){OC.steep=(OC.steep||0)+1;continue}if(p.y-y>.05){p.y=y;OC.sunk++}p.gp=1}
    L[j++]=p}L.length=j;HUB.OC={moved:OC.moved,dropped:OC.dropped,by:OC.dropT,sunk:OC.sunk,steep:OC.steep||0};return L}
const OC_onRoad=(t,x,z)=>!OC_GAME.has(t)&&HUB.ptypes&&OC_roadE(x,z)<OC_fp(t,HUB.ptypes)+.35;
// real heights: Athens street tree 4.8 m -> 6.5 m, olive 3.7 -> 6.1 m; parked and traffic cars (toy 3.0-3.5 m tall, 5.9-6.3 m long) -> ~1.6 x 1.95 x 4.6 m
function OC_carScale(g,car){if(g.userData.oc)return;g.computeBoundingBox();const b=g.boundingBox,w=b.max.x-b.min.x,h=b.max.y-b.min.y,l=b.max.z-b.min.z;if(h<2.2)return;
  if(w<1.2){const k=1.75/h;g.scale(k,k,k)}else if(car||l<=6.4&&w>=3.2)g.scale(1.95/w,1.6/h,4.6/l);else g.scale(Math.min(1,2.5/w),Math.min(1,(h>4.5?4.2:3.4)/h),1);// cars: real size; vans, trucks, buses: real width, height capped
  g.userData.oc=1;g.computeBoundingBox();g.computeBoundingSphere()}
function OC_scaleDefs(D){const S={tree:CID==='fra'?null:[1.25,1.35,1.25],CE_olive:[1.2,1.65,1.2]};for(const t in S){const d=D[t];if(!d||!S[t]||d.g.userData.oc)continue;d.g.scale(...S[t]);d.g.userData.oc=1;OC.scaled[t]=S[t]}
  for(const t of['car','car2','car3','car4'])if(D[t]){OC_carScale(D[t].g,1);OC.scaled[t]=1}}
function OC_traffic(){for(const k in HUB.cim||{}){const im=HUB.cim[k];if(im&&im.geometry){OC_carScale(im.geometry);im.computeBoundingSphere&&im.computeBoundingSphere()}}}
// ---------- 3 · the Acropolis at real scale (1 world unit = 1 m). Plateau ~266 x 156 m (hill data), Parthenon 69.5 x 30.9 m stylobate,
// 8 x 17 Doric columns 10.43 m, entablature 3.29 m, pediments; Erechtheion + caryatid porch, Propylaea, Athena Nike on its bastion,
// Odeon of Herodes Atticus, Theatre of Dionysus; scaffolding + tower crane at the Parthenon. Offsets in metres east/north of the Parthenon
// centre (site plan + Wikipedia coordinates). Built right after the terrain fix, merged into one batch, colliders added to the grid.
const OC_AK={parth:[0,0],erech:[-15,60],propy:[-118,15],nike:[-137,-9],odeon:[-186,-88],dion:[111,-125],crane:[-6,27]};
function OC_acroBuild(){if(CID==='fra'||!HUB.grp||OC.acroG===HUB.grp)return;OC.acroG=HUB.grp;const[px,pz]=WP(80,-507);if(px<WX0+300||px>WX1-300||pz<WZS+300||pz>WZN-300)return;
  const bt=new LBatch(),BM=HUB.BM,MB='#e6d8b8',MW='#efe4cb',MD='#d4c29c',W=(e,n)=>[px-e,pz+n],cols=[],bl=[],box=(w,h,d,x,y,z,c,ry=0)=>bt.add(cbox(w,h,d,x,y+h/2,z,c,ry),BM.plain);
  const col=(x,y,z,r,h,c=MB,seg=10)=>{bt.add(ccyl(r*.8,r,h,x,y+h/2,z,c,seg),BM.plain);bt.add(cbox(r*2.1,.32,r*2.1,x,y+h-.16,z,c),BM.plain)};
  const ped=(x,y,z,span,th,h,c=MW,alongX=true)=>{const g=roofGeo(span,th,h);if(alongX)g.rotateY(Math.PI/2);g.translate(x,y,z);bt.add(colorize(g,new THREE.Color(c)),BM.plain)};
  const gmin=(x,z,hw,hd)=>{let m=1e9;for(const a of[-1,0,1])for(const b of[-1,0,1])m=Math.min(m,groundY(x+a*hw,z+b*hd));return m};
  const coll=(x,z,hw,hd,y0,top,ry)=>bl.push(hubAddB({x,z,hw,hd,h:top,y0:y0-1.5,ry}));const A={cols:0};
  // Parthenon
  {const[x,z]=W(...OC_AK.parth),SW=69.5,SD=30.9,y0=gmin(x,z,SW/2+1.5,SD/2+1.5);box(SW+6,y0-gmin(x,z,SW/2+3,SD/2+3)+.5,SD+6,x,gmin(x,z,SW/2+3,SD/2+3)-.5,z,MD);
    for(let k=0;k<3;k++)box(SW+2.8-k*1.4,.51,SD+2.8-k*1.4,x,y0+k*.51,z,k===2?MW:MB);const yb=y0+1.53,CH=10.43,ix=(SW-2)/16,iz=(SD-2)/7;
    for(let i=0;i<17;i++)for(const s of[-1,1]){col(x-SW/2+1+i*ix,yb,z+s*(SD/2-1),.95,CH);A.cols++}for(let j=1;j<7;j++)for(const s of[-1,1]){col(x+s*(SW/2-1),yb,z-SD/2+1+j*iz,.95,CH);A.cols++}
    const ye=yb+CH;for(const s of[-1,1]){box(SW,2.7,2.3,x,ye,z+s*(SD/2-1),MB);box(SW+.6,.6,2.9,x,ye+2.7,z+s*(SD/2-.9),MW);box(2.3,2.7,SD,x+s*(SW/2-1),ye,z,MB);box(2.9,.6,SD+.6,x+s*(SW/2-.9),ye+2.7,z,MW);
      ped(x+s*(SW/2-1),ye+3.3,z,SD+.6,2.2,3.7,MW);for(let i=0;i<6;i++)col(x+s*(SW/2-6),yb,z-SD/2+6+i*(SD-12)/5,.8,CH-.9)}
    for(const s of[-1,1]){let lx=-SW/2+9;for(const[len,h]of[[9,4.2],[7,2.1],[11,5.5],[6,1.4],[10,3.6]]){box(len,h,1.5,x+lx+len/2,yb,z+s*(SD/2-5.5),MD);lx+=len+1.2}}
    box(1.6,11.8,SD-11,x-SW/2+12,yb,z,MD);box(1.4,6,SD-12,x+SW/2-14,yb,z,MD);box(SW-24,.25,SD-12,x,yb,z,'#cbb994');
    // scaffolding on the west front (poles, ledgers, planks, braces)
    const sx=x+SW/2+2.2;for(let i=0;i<=13;i++){const zz=z-SD/2-1+i*(SD+2)/13;for(const o of[0,1.6])bt.add(cbox(.12,19.6,.12,sx+o,yb+8.3,zz,'#8d939a'),BM.plain)}
    for(let k=0;k<9;k++){const yy=yb+.9+k*2.1;for(const o of[0,1.6])bt.add(cbox(.1,.1,SD+2,sx+o,yy,z,'#8d939a'),BM.plain);if(k%2)bt.add(cbox(1.7,.08,SD+2,sx+.8,yy+.1,z,'#b8935a'),BM.plain)}
    for(let i=0;i<4;i++){const g=new THREE.BoxGeometry(.08,.08,11.5);g.rotateX(-.95);g.translate(sx+1.7,yb+9,z-SD/2+3+i*8.2);bt.add(colorize(g,new THREE.Color('#8d939a')),BM.plain)}
    coll(x,z,SW/2+1.4,SD/2+1.4,y0,yb+CH+6.6,0);coll(sx+.8,z,1.1,SD/2+1,yb,yb+19,0);A.parth={x,z,y0,yb,w:SW,d:SD,ny:8,nx:17,top:+(yb+CH+3.3+3.7-y0).toFixed(2)}}
  // tower crane on the north side (mast, jib, counter-jib, cab, counterweight, hook)
  {const[x,z]=W(...OC_AK.crane),y=groundY(x,z),Y='#f2c200',H=42;for(let k=0;k<7;k++)box(1.8,H/7-.4,1.8,x,y+k*H/7,z,Y);for(let k=0;k<7;k++)for(const s of[-1,1])bt.add(cbox(.1,6,.1,x+s*.85,y+k*H/7+3,z+.85*s,'#d8a800'),BM.plain);
    box(2.2,2.4,2.2,x,y+H,z,'#d8a800');box(46,1.2,1.2,x-14,y+H+2.4,z,Y);box(14,1,1.2,x+16,y+H+2.4,z,Y);box(4,2.6,2.4,x+20,y+H+.2,z,'#7a7a7a');box(2.2,2,2.2,x+1.8,y+H-1.6,z-1.7,'#ffffff');
    box(.1,8,.1,x,y+H+3.6,z,Y);box(.06,16,.06,x-30,y+H+2.4-16,z,'#333333');box(.8,.8,.8,x-30,y+H+2.4-16.8,z,'#e8302a');coll(x,z,1.2,1.2,y,y+H+3,0);A.crane=H+3.6}
  // Erechtheion: main block 23.5 x 11.6 m, east porch (6 Ionic columns), north porch (4+2), caryatid porch on the south side (6 korai on a podium)
  {const[x,z]=W(...OC_AK.erech),y=gmin(x,z,14,9),BW=23.5,BD=11.6;box(BW+2,1,BD+2,x,y-.4,z,MD);box(BW,8.6,BD,x+1,y+.6,z,MB);box(BW+.8,1.4,BD+.8,x+1,y+9.2,z,MW);
    for(let i=0;i<6;i++)col(x-BW/2-1.6,y+.6,z-BD/2+1+i*(BD-2)/5,.42,6.6);box(1.6,1.4,BD,x-BW/2-1.6,y+7.2,z,MW);ped(x-BW/2-1.2,y+8.6,z,BD+.6,2.4,2.2,MW);
    {const nx=x+BW/2-5.5,nz=z+BD/2+3.8;box(10.7,.6,7.6,nx,y-.2,nz,MD);for(let i=0;i<4;i++)col(nx-4.5+i*3,y+.4,nz+3.2,.45,7.6);for(const s of[-1,1])col(nx+s*4.5,y+.4,nz,.45,7.6);box(10.7,1.6,7.6,nx,y+8,nz,MW)}
    {const cx=x+BW/2-4,cz=z-BD/2-1.9;box(5.6,1.8,3.8,cx,y+.6,cz,MD);for(const[a,b]of[[-2.2,-1.5],[-.75,-1.5],[.75,-1.5],[2.2,-1.5],[-2.2,0],[2.2,0]]){bt.add(ccyl(.28,.36,2.3,cx+a,y+2.4+1.15,cz+b,'#f2e8d2',8),BM.plain);bt.add(csph(.3,cx+a,y+4.85,cz+b,'#f2e8d2'),BM.plain)}box(5.9,.7,4.1,cx,y+5.1,cz,MW)}
    coll(x+1,z+1.5,BW/2+1.6,BD/2+3,y,y+10.6,0);A.erech={x,z,y}}
  // Propylaea: central gate building (6 Doric columns west and east, pediments), Pinakotheke (NW wing), SW wing; stairs down the west approach
  {const[x,z]=W(...OC_AK.propy),y=gmin(x,z,14,12);box(24,1.2,20,x,y-.6,z,MD);const yw=y+.6;
    for(const[ex,h]of[[12,8.8],[-12,8.5]])for(let i=0;i<6;i++){col(x+ex,yw,z-8.5+i*3.4,.78,h);}for(const s of[-1,1])box(22,9.2,1.4,x,yw,z+s*9.5,MB);for(const zz of[-5.1,5.1])box(1.4,9,2.6,x+1,yw,z+zz,MB);
    for(const ex of[12,-12]){box(2.2,2.4,20,x+ex,yw+8.8,z,MB);ped(x+ex,yw+11.2,z,20.4,2.2,2.6,MW)}box(22,.5,20,x,yw+11,z,MW);
    {const[nx,nz]=[x+6,z+18];box(14,7.6,11,nx,yw,nz,MB);box(14.6,.8,11.6,nx,yw+7.6,nz,MW);for(let i=0;i<3;i++)col(nx+7.6,yw,nz-3.2+i*3.2,.55,6.4);coll(nx,nz,7.6,5.8,yw,yw+8.4,0)}
    {const[sx2,sz2]=[x+6,z-15];box(10,7.6,8,sx2,yw,sz2,MB);box(10.6,.8,8.6,sx2,yw+7.6,sz2,MW);for(let i=0;i<3;i++)col(sx2+5.6,yw,sz2-2.4+i*2.4,.55,6.4);coll(sx2,sz2,5.6,4.3,yw,yw+8.4,0)}
    for(let k=1;k<=22;k++){const xx=x+13+k*1.9,g=groundY(xx,z),top=Math.min(yw,Math.max(g+.18,yw-k*.42));if(top<g+.08)break;box(1.9,top-g+.6,20,xx,g-.6,z,k%2?MW:MB)}
    for(const s of[-1,1])coll(x,z+s*9.5,11.5,.9,yw,yw+11.5,0);for(const zz of[-5.1,5.1])coll(x+1,z+zz,.9,1.4,yw,yw+11.5,0);A.propy={x,z,y}}
  // Temple of Athena Nike (8.27 x 5.64 m, 4+4 Ionic columns 4.1 m) on its bastion at the south-west corner
  {const[x,z]=W(...OC_AK.nike),yt=groundY(...W(-118,0))-.4,gb=gmin(x,z,8,6);box(16,yt-gb+1,12,x,gb-1,z,'#cdb88f');box(16.4,.4,12.4,x,yt,z,MD);
    for(let k=0;k<3;k++)box(8.27+1.2-k*.6,.3,5.64+1.2-k*.6,x,yt+.4+k*.3,z,MB);const yb=yt+1.3;for(const s of[-1,1])for(let i=0;i<4;i++)col(x+s*3.6,yb,z-2.1+i*1.4,.27,4.1,MB,8);
    box(4.4,4.1,4.6,x,yb,z,MB);box(8.4,.9,5.8,x,yb+4.1,z,MW);for(const s of[-1,1])ped(x+s*3.9,yb+5,z,5.8,.6,1,MW);box(7.6,.2,5.6,x,yb+5,z,MD);coll(x,z,8,6,gb,yb+6,0);A.nike={x,z,y:yt}}
  // Odeon of Herodes Atticus: 76 m semicircular cavea against the slope (north), 28 m three-storey arched stage wall (south)
  {const[x,z]=W(...OC_AK.odeon),yo=groundY(x,z);box(19,.3,10,x,yo-.1,z,'#cfc2a6');for(let t=0;t<15;t++){const R=11+t*1.9,top=yo+.5+t*1.05,n=Math.ceil(R*Math.PI/4.6);
      for(let k=0;k<n;k++){const a=Math.PI*(k+.5)/n,cx=x+Math.cos(a)*R,cz=z+Math.sin(a)*R,g=groundY(cx,cz);if(g>top-.2)continue;box(R*Math.PI/n+.4,top-g+.8,2.1,cx,g-.8,cz,t%5===4?'#cdbfa2':'#e2d6bc',Math.PI/2-a)}}
    const zs=z-8,gs=gmin(x,zs,40,2.5),L=80;box(L,28+(yo-gs),4.6,x,gs,zs,'#cdb88f');for(let r=0;r<3;r++)for(let k=0;k<11;k++)for(const s of[-1,1])box(3.6,r?5.6:7.4,.3,x-35+k*7,yo+(r?5+r*7.6:1),zs+s*2.35,'#4a3a2a');
    for(const s of[-1,1])box(8,24,22,x+s*(L/2+2),gmin(x+s*(L/2+2),z+3,4,11),z+3,'#cdb88f');
    for(let k=-3;k<=3;k++)coll(x+k*11.5,zs,5.8,2.4,gs,yo+28,0);for(let k=0;k<7;k++){const a=Math.PI*(k+.5)/7;coll(x+Math.cos(a)*30,z+Math.sin(a)*30,6,4.5,yo,yo+16,-a)}A.odeon={x,z,y:yo,R:39.5,wall:28}}
  // Theatre of Dionysus: cavea on the south slope (marble lower tiers, front-row thrones), orchestra, low stage foundations
  {const[x,z]=W(...OC_AK.dion),yo=groundY(x,z);bt.add(ccyl(10,10,.3,x,yo,z,'#d9cdb2',24),BM.plain);for(let t=0;t<18;t++){const R=11+t*1.55,top=yo+.45+t*.78,n=Math.ceil(R*1.25*Math.PI/4.2);
      for(let k=0;k<n;k++){const a=-.12*Math.PI+1.24*Math.PI*(k+.5)/n,cx=x+Math.cos(a)*R,cz=z+Math.sin(a)*R,g=groundY(cx,cz);if(g>top-.2)continue;box(R*1.24*Math.PI/n+.3,top-g+.8,1.7,cx,g-.8,cz,t===0?'#f0e6d0':t%6===5?'#cbbd9e':'#dfd3b8',Math.PI/2-a)}}
    const zs=z-14,gs=gmin(x,zs,22,3);box(44,2.4+(yo-gs),5,x,gs,zs,'#c9b994');for(let k=0;k<6;k++)col(x-15+k*6,yo+2.4,zs,.4,3.2,MB,8);coll(x,zs,22,2.5,gs,yo+3,0);A.dion={x,z,y:yo}}
  // circuit walls along the plateau edge (the base ring is skipped: the terrain fix lifted it by the plateau height); open to the west approach
  {const H=HILL_BY.akro,N=72,pt=t=>{const u=Math.sin(t),v=Math.cos(t),de=(u*H.rx*.975)*H.ca+(v*H.rz*.975)*H.sa,dn=-(u*H.rx*.975)*H.sa+(v*H.rz*.975)*H.ca;return[H.cx-de*H.sx,H.cz+dn*H.sz,u]},yH=groundY(H.cx,H.cz);
    for(let k=0;k<N;k++){const t0=k/N*Math.PI*2,t1=(k+1)/N*Math.PI*2,[x0,z0,u0]=pt(t0),[x1,z1,u1]=pt(t1);if((u0+u1)/2<-.42)continue;const cx=(x0+x1)/2,cz=(z0+z1)/2,L=Math.hypot(x1-x0,z1-z0)+1.6,ry=Math.atan2(-(z1-z0),x1-x0),g=groundY(cx,cz);
      box(L,yH+1.3-(g-7),2.2,cx,g-7,cz,'#cdb995',ry);box(L,.35,2.6,cx,yH+1.3,cz,'#bba882',ry);coll(cx,cz,L/2,1.1,g,yH+1.6,ry)}}
  bt.flush(HUB.grp);hubGridAdd(bl);OC.acro=A;HUB.ocAcro=A}
function OC_unbury(){const F=HUB.bld.filter(b=>b.trMin!=null&&b.trBase!=null&&b.trMin>-1&&b.trMax-b.trBase>1);OC.unb=F.length;if(!F.length)return;
  const find=(x,z,m)=>{for(const b of F){const dx=x-b.x,dz=z-b.z,lx=b.c==null?dx:dx*b.c-dz*b.s,lz=b.c==null?dz:dx*b.s+dz*b.c;if(Math.abs(lx)<=b.hw+m&&Math.abs(lz)<=b.hd+m)return b}return null};const M=new THREE.Matrix4(),P=V3(),pl=[];
  for(const b of F)b.ocUp=b.trMax-.8-b.trBase;
  for(const o of HUB.grp.children){if(!(o.isMesh||o.isInstancedMesh)||o.userData.trG||!o.geometry||!o.geometry.attributes.position)continue;let ch=false;
    if(o.isInstancedMesh){for(let i=0;i<o.count;i++){o.getMatrixAt(i,M);P.setFromMatrixPosition(M);const b=find(P.x,P.z,.4);if(!b||P.y<b.trBase-.5)continue;M.elements[13]+=b.ocUp;o.setMatrixAt(i,M);ch=true}if(ch){o.instanceMatrix.needsUpdate=true;o.computeBoundingSphere()}continue}
    const A=o.geometry.attributes.position,p=A.array;for(let i=0;i<p.length;i+=3){const b=find(p[i],p[i+2],.4);if(b&&p[i+1]>=b.trBase-.5){p[i+1]+=b.ocUp;ch=true}}if(ch){A.needsUpdate=true;o.geometry.computeBoundingBox();o.geometry.computeBoundingSphere()}}
  for(const b of F){b.h+=b.ocUp;if(b.y0!=null)b.y0+=b.ocUp;b.trBase+=b.ocUp;b.trDoor=(b.trDoor||0)+b.ocUp;TR_PL.push(b);pl.push(cbox(b.hw*2+.7,b.trBase-b.trMin+.45,b.hd*2+.7,b.x,(b.trBase+b.trMin-.4)/2,b.z,'#b5a68c',b.c==null?0:Math.atan2(-b.s,b.c)))}
  const m=new THREE.Mesh(mergeG(pl),new THREE.MeshStandardMaterial({vertexColors:true,roughness:.92}));m.receiveShadow=true;m.userData.trPl=1;HUB.grp.add(m)}
{const _hg=hubGrid;hubGrid=()=>{if(CID==='fra'&&HUB.grp&&OC.altG!==HUB.grp){OC.altG=HUB.grp;try{OC_altFix()}catch(e){console.warn('OC alt',e)}}const first=HUB.grp&&OC.ubG!==HUB.grp,r=_hg();if(first){OC.ubG=HUB.grp;try{OC_unbury()}catch(e){console.warn('OC unbury',e)}}try{OC_acroBuild()}catch(e){console.warn('OC acro',e)}return r}}
{const _ts=hubTrafficStep;hubTrafficStep=function(){if(HUB.cim&&OC.cimS!==HUB.cim){OC.cimS=HUB.cim;OC_traffic()}return _ts.apply(this,arguments)}}
// Frankfurt Altstadt core (Römerberg - Dom - Paulsplatz): non-landmark blocks above 19 m are brought down to 4-5 storeys (14.5-18 m incl. roof),
// before the terrain fix (bodies still at y=0): colliders, instances and merged vertices inside each footprint scale in y
function OC_altFix(){const R=LM_BY['Römer'],K=LM_BY['Kaiserdom'];if(!R||!K)return;const cx=(R.x+K.x)/2,cz=(R.z+K.z)/2,inC=(x,z)=>((x-cx)/280)**2+((z-cz)/170)**2<1&&!inRiver(x,z);OC.alt={cx,cz,n:0};
  const LMS=Object.values(LM_BY).filter(L=>L&&L.x!=null),lmk=b=>LMS.some(L=>Math.hypot(b.x-L.x,b.z-L.z)<Math.max(L.r||0,28));const F=[];
  for(const b of HUB.bld){if(!inC(b.x,b.z)||b.hw*b.hd<20||lmk(b)||b.h<19||b.h>140||(b.y0||0)>1)continue;const T=14.5+3.5*((Math.sin(b.x*12.99+b.z*78.23)*43758.5)%1+1)%1,k=T/b.h;b.h=T;F.push([b,k]);OC.alt.n++}
  if(!F.length)return;const find=(x,z)=>{for(const[b,k]of F){const dx=x-b.x,dz=z-b.z,lx=b.c==null?dx:dx*b.c-dz*b.s,lz=b.c==null?dz:dx*b.s+dz*b.c;if(Math.abs(lx)<=b.hw+.4&&Math.abs(lz)<=b.hd+.4)return k}return 0};
  const M=new THREE.Matrix4(),P=V3();for(const o of HUB.grp.children){if(!(o.isMesh||o.isInstancedMesh)||!o.geometry||!o.geometry.attributes.position)continue;let ch=false;
    if(o.isInstancedMesh){for(let i=0;i<o.count;i++){o.getMatrixAt(i,M);P.setFromMatrixPosition(M);const k=find(P.x,P.z);if(!k||P.y>1)continue;const e=M.elements;e[4]*=k;e[5]*=k;e[6]*=k;e[13]*=k;o.setMatrixAt(i,M);ch=true}if(ch){o.instanceMatrix.needsUpdate=true;o.computeBoundingSphere()}continue}
    const A=o.geometry.attributes.position,p=A.array;for(let i=0;i<p.length;i+=3){const k=find(p[i],p[i+2]);if(k&&p[i+1]>.05){p[i+1]*=k;ch=true}}if(ch){A.needsUpdate=true;o.geometry.computeBoundingBox();o.geometry.computeBoundingSphere()}}}
{const _bp=buildHubProps;buildHubProps=function(){const r=_bp.apply(this,arguments);try{OC_lampsBuild();OC_traffic()}catch(e){console.warn('OC lamps',e)}return r}}
// ---------- 4 · height audit (both cities): props, traffic, buildings (storeys), named landmarks, floating / buried
const OC_REAL={Commerzbank:259,'Main Tower':240,Messeturm:257,'Athens Tower':103,Lycabettus:277,Parthenon:13.72+1.53+3.7};
const OC_RANGE={tree:[6,12],lamp:[6.5,9.5],car:[1.2,2.1],storey:[3,3.4],poly_c:[5,8],poly_o:[3,6],neo:[2,4],plaka:[1,3],fraAlt:[3,5],tower:[.9,1.1]};
const OC_TREES=['tree','tree2','tree3','CE_pine','CE_cypress','CE_olive'],OC_CARS=['car','car2','car3','car4','CE_car','CE_car2','CE_taxi'];
function OC_audit(){const D=HUB.ptypes,T=[],out={rows:T,bad:[],float:0,buried:0,fl:[],bu:[]},hgt=g=>{g.computeBoundingBox();return g.boundingBox.max.y-g.boundingBox.min.y};
  const row=(cls,name,v,lo,hi,real)=>{const ok=v>=lo-1e-6&&v<=hi+1e-6;T.push({cls,name,v:+v.toFixed(2),lo,hi,real,ok});if(!ok)out.bad.push(cls+':'+name+'='+v.toFixed(2))};
  const used=t=>HUB.props.some(p=>p.t===t);for(const t of OC_TREES)if(D[t]&&used(t))row('tree',t,hgt(D[t].g),...OC_RANGE.tree);if(D.lamp)row('lamp','lamp',hgt(D.lamp.g),...OC_RANGE.lamp,8);
  for(const t of OC_CARS)if(D[t]&&used(t))row('car',t,hgt(D[t].g),...OC_RANGE.car,1.5);OC_traffic();for(const k in HUB.cim||{}){const g=HUB.cim[k].geometry;g.computeBoundingBox();const l=g.boundingBox.max.z-g.boundingBox.min.z;const w=g.boundingBox.max.x-g.boundingBox.min.x;if(w<1.2)row('two-wheeler','traffic#'+k+' (scooter + rider)',hgt(g),1.3,2,1.7);else if(l<5.2)row('car','traffic#'+k,hgt(g),...OC_RANGE.car,1.5);else row('heavy','traffic#'+k+' (van/truck/bus)',hgt(g),1.9,4.3,3.2)}
  // buildings: Athens instanced bodies (storeys by style), Frankfurt colliders (Altstadt storeys, named towers)
  if(CID!=='fra'){const st={},M=new THREE.Matrix4(),P=V3(),Q=new THREE.Quaternion(),S=V3();HUB.grp.traverse(o=>{const k=o.userData&&o.userData.athB;if(!o.isInstancedMesh||!['poly','neo','plaka'].includes(k))return;const fh=k==='poly'?3.1:3.3;
      for(let i=0;i<o.count;i++){o.getMatrixAt(i,M);M.decompose(P,Q,S);if(S.y<1.5)continue;const g=OC_minG(P.x,P.z,Math.min(S.x,S.z)/2);if(P.y>g+2.5)continue;const sty=athStyleAt(P.x,P.z),fl=Math.round((S.y-.6)/fh),
        c=k==='poly'?(sty==='poly'||sty==='kolon'?'poly_c':'poly_'+sty):k==='neo'?'neo':S.x*S.z>110&&S.y<5?'villa':'plaka',r=c==='villa'?[1,3]:k==='poly'&&c!=='poly_c'?[sty==='villa'?2:3,sty==='old'||sty==='plaka'?5:sty==='town'||sty==='villa'?4:6]:OC_RANGE[c];const e=st[c]||(st[c]={n:0,min:99,max:0,sum:0,bad:0,r});e.n++;e.sum+=fl;e.min=Math.min(e.min,fl);e.max=Math.max(e.max,fl);if(fl<r[0]||fl>r[1])e.bad++}});
    for(const c in st){const e=st[c];T.push({cls:'storeys',name:c,v:+(e.sum/e.n).toFixed(2),min:e.min,max:e.max,n:e.n,lo:e.r[0],hi:e.r[1],ok:!e.bad,bad:e.bad});if(e.bad)out.bad.push('storeys '+c+' x'+e.bad)}
    row('storey','poly',3.1,...OC_RANGE.storey);row('storey','neo/plaka',3.3,...OC_RANGE.storey);
    const at=HUB.bld.filter(b=>{const L=athLmNear(b.x,b.z);return L&&L.id==='athenstower'}).reduce((m,b)=>Math.max(m,b.h-(b.trBase??groundY(b.x,b.z))),0);if(at)row('landmark','Athens Tower',at,103*.95,103*1.05,103);
    const ly=HILL_BY.lyka;if(ly&&ly.cx>WX0&&ly.cx<WX1&&ly.cz>WZS&&ly.cz<WZN){let m=0;for(let r=0;r<200;r+=5)for(let k=0;k<24;k++){const a=k/24*Math.PI*2;m=Math.max(m,groundY(ly.cx+Math.cos(a)*r,ly.cz+Math.sin(a)*r))}row('landmark','Lycabettus (m a.s.l.)',m+TR_DATUM,277*.95,277*1.05,277)}
    if(OC.acro){const A=OC.acro;row('landmark','Parthenon (stylobate->apex)',A.parth.top-1.53,17.4*.95,17.4*1.05,17.4);const H=HILL_BY.akro;row('landmark','Acropolis plateau (m a.s.l.)',H.H+TR_DATUM,150,160,156)}}
  else{for(const n of['Commerzbank','Main Tower','Messeturm']){const L=LM_BY[n];if(!L)continue;let m=0;for(const b of HUB.bld)if(Math.hypot(b.x-L.x,b.z-L.z)<45)m=Math.max(m,b.h-(b.trBase??groundY(b.x,b.z)));row('landmark',n,m,OC_REAL[n]*.95,OC_REAL[n]*1.05,OC_REAL[n])}
    const st={n:0,min:99,max:0,sum:0,bad:0},A=OC.alt,LMS=Object.values(LM_BY).filter(L=>L&&L.x!=null);for(const b of HUB.bld){if(!A||((b.x-A.cx)/280)**2+((b.z-A.cz)/170)**2>=1||inRiver(b.x,b.z)||b.hw*b.hd<20||LMS.some(L=>Math.hypot(b.x-L.x,b.z-L.z)<Math.max(L.r||0,28)))continue;const h=b.h-(b.trBase??groundY(b.x,b.z)),fl=Math.floor(h/3.25);if(h<6)continue;st.n++;st.sum+=fl;st.min=Math.min(st.min,fl);st.max=Math.max(st.max,fl);if(fl<OC_RANGE.fraAlt[0]-1||fl>OC_RANGE.fraAlt[1]+1)st.bad++}
    if(st.n){T.push({cls:'storeys',name:'Altstadt core (roof incl., floor(h/3.25))',v:+(st.sum/st.n).toFixed(2),min:st.min,max:st.max,n:st.n,lo:3,hi:5,ok:!st.bad,bad:st.bad});if(st.bad)out.bad.push('Altstadt x'+st.bad)}}
  // floating / buried: ground-placed props (centre and footprint), building colliders on the terrain, the Acropolis monuments
  for(const p of HUB.props){if(!D[p.t]||!p.alive||!p.gp)continue;const g0=groundY(p.x,p.z);const fp=OC_fp(p.t,D),gm=OC_minG(p.x,p.z,fp);if(p.y-gm>.3){out.float++;if(out.fl.length<6)out.fl.push([p.t,Math.round(p.x),Math.round(p.z),+(p.y-gm).toFixed(2)])}if(g0-p.y>1){out.buried++;if(out.bu.length<6)out.bu.push([p.t,Math.round(p.x),Math.round(p.z),+(g0-p.y).toFixed(2)])}}
  const pl=new Set(TR_PL);out.riverbed=0;for(const b of HUB.bld){if(b.trMin==null||b.trBase==null)continue;if(b.trMin<-1){out.riverbed++;continue}// bridge piers / quay walls stand in the riverbed by design
  if(b.trBase-b.trMin>.3&&!pl.has(b)){out.float++;if(out.fl.length<12)out.fl.push(['bld',Math.round(b.x),Math.round(b.z),+(b.trBase-b.trMin).toFixed(2)])}if(b.trMax-b.trBase>1){out.buried++;if(out.bu.length<12)out.bu.push(['bld',Math.round(b.x),Math.round(b.z),+(b.trMax-b.trBase).toFixed(2)])}}
  if(OC.acro)for(const k of['parth','erech','propy','nike']){const a=OC.acro[k],y=a.y0??a.y,g=groundY(a.x,a.z);if(y-g>.3||g-y>1){out.float++;out.fl.push([k,Math.round(a.x),Math.round(a.z),+(y-g).toFixed(2)])}}
  return out}
// Lycabettus: the 20 m DEM rounds the peak off (~257 m); a smooth cone (r 190 m) restores the real 277 m a.s.l. summit
function OC_lyka(h,nx,nz,r){if(CID==='fra'||typeof HILL_BY==='undefined'||!HILL_BY.lyka)return;const L=HILL_BY.lyka;if(L.cx<WX0+300||L.cx>WX1-300||L.cz<WZS+300||L.cz>WZN-300)return;let b=-1,bi=0,bj=0;const i0=Math.max(0,Math.floor((L.cx-260-WX0)/r)),i1=Math.min(nx-1,Math.ceil((L.cx+260-WX0)/r)),j0=Math.max(0,Math.floor((L.cz-260-WZS)/r)),j1=Math.min(nz-1,Math.ceil((L.cz+260-WZS)/r));
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++)if(h[j*nx+i]>b){b=h[j*nx+i];bi=i;bj=j}const d=277-TR_DATUM-b;if(!(d>0)||b<100)return;const R=190;
  for(let j=Math.max(0,bj-Math.ceil(R/r));j<=Math.min(nz-1,bj+Math.ceil(R/r));j++)for(let i=Math.max(0,bi-Math.ceil(R/r));i<=Math.min(nx-1,bi+Math.ceil(R/r));i++){const t=1-Math.hypot(i-bi,j-bj)*r/R;if(t>0)h[j*nx+i]+=d*t*t*(3-2*t)}window.__ocLyka=d}
// the Acropolis south slope (Odeon - Theatre of Dionysus) is an archaeological park: no apartment blocks in the building raster there
function OC_zone(cap){if(CID==='fra')return;const[px,pz]=WP(80,-507),W=(e,n)=>[px-e,pz+n],[ox,oz]=W(...OC_AK.odeon),[dx,dz]=W(...OC_AK.dion);cap(ox,oz,dx,dz,50,3);cap(ox,oz,ox,oz,56,3);cap(dx,dz,dx,dz,64,3)}
function OC_top(t){return Math.max(t,156-TR_DATUM)}// plateau at the real summit level (156 m a.s.l.), ~70 m above the Plaka streets
function OC_fix(U,x,z){if(U.k!=='poly')return U;const s=athStyleAt(x,z),lo=s==='old'||s==='town'||s==='outer'||s==='plaka'?3:s==='villa'?2:5,hi=s==='old'||s==='plaka'?5:s==='town'||s==='villa'?4:s==='outer'?6:8,f=Math.min(hi,Math.max(lo,U.fl));return f===U.fl?U:{...U,fl:f}}
const OC_gy=(t,x,z)=>HUB.ptypes&&HUB.ptypes[t]?Math.max(OC_minG(x,z,OC_fp(t,HUB.ptypes)),groundY(x,z)-.9):groundY(x,z);
function OC_ifl(f,s){return s==='poly'||s==='kolon'?f+2:f}// interior polykatoikia in the central districts: 5-7 storeys (was 3-5)
window.__oc={ev:s=>window.__dbg?eval(s):null,OC,acro:()=>OC.acro,props:()=>HUB.OC,fp:t=>OC_fp(t,HUB.ptypes),GAME:[...OC_GAME],roadE:(x,z)=>OC_roadE(x,z),audit:()=>OC_audit()};
