// ===== C3 (city-3, 2026-10-16): STREET LIFE. docs/CITY_VARIETY.md #5 prop vignettes, #6 ground breakup, #7 roofline extras.
// (1) a prop vignette every ~45 m of pavement (one per 45 m cell and side): bench set, café, kiosk, bus stop, scooter rack; existing prop types only (no new draw calls);
// (2) ground plates: a paving pad under every vignette, kerb-edge strips, dirt paths and flowerbeds on bare lawns beside streets;
// (3) roof kit on flat roofs: water tanks, AC units, antennas, roof gardens.
// (2)+(3) are unit boxes in ONE InstancedMesh per 1400 m cell (frustum + distance culled). No rnd(), no colliders on plates / roof kit. Default ON (city-5): ?c3=0 off. Hook: side() in 60_city_build6.js.
const C3={on:/[?&]c3=1\b/.test(location.search)||(!/[?&]c3=0\b/.test(location.search)&&!(typeof TUNE!=='undefined'&&TUNE.c3===0)),/* city-5: default ON; ?c3=0 off, TUNE.c3=0 off */cells:new Set(),G:[],R:[],V:[],n:{vig:0,gnd:0,roof:0,bld:0},meshes:0};
const C3_h=(x,z,s)=>{const h=Math.sin(x*12.9898+z*78.233+s*37.719)*43758.5453;return h-Math.floor(h)};
const C3_F=['#ff4a8a','#ffd23a','#ff7a2a','#ffffff','#b46aff','#e8402a'],C3_PAVE=['#d9d0bf','#c9b8a0','#b8b0a4','#e0c8a8'],C3_PAVE_A=['#e8dcc4','#d8b48a','#efe6d2','#c89a78'];
// vignettes: [type, along, out, yaw (0 = facing the road)]; out = metres away from the road from the kerb-side prop line
const C3_V={bench:[['bench',0,1.2,Math.PI],['lamp',-2.4,.3,0],['planter',2.3,1.3,0],['bin',1.3,.2,0]],
  cafe:[['table',-1.6,1.6,0],['parasol',-1.6,1.6,0],['table',1.6,1.8,.6],['parasol',1.6,1.8,0],['planter',3.4,.6,0]],
  cafeA:[['CE_cafe',-1.5,1.6,0],['CE_cafe2',1.6,1.8,.7],['planter',3.3,.5,0],['bin',-3.3,.3,0]],
  kiosk:[['stall',0,2.2,Math.PI],['planter',2.6,1,0],['bin',-1.8,.2,0],['bench',-3.6,1.4,Math.PI]],
  stop:[['stop',0,.8,0],['bench',-3,1.5,Math.PI],['bin',2.8,.3,0],['planter',3.8,1,0]]};/* existing common types only: rare types (lights, crate, sign, scooters) put a new instanced bucket in many tiles (+draw calls) */
function C3_box(A,x,y,z,ry,sx,sy,sz,col){A.push([x,y,z,ry,sx,sy,sz,col])}
// city-5: vignettes are plain brick boxes merged into the C3 mesh (no prop models, no colliders, 0 new buckets). a = along the road, o = out from the kerb; palette per ~300 m zone zn.
const C3_VP={fra:[['#7a5230','#2f6a3a','#c9c2b4','#2f7a3a'],['#4a4f58','#d8282e','#b8b0a4','#1f3a7a'],['#8a6a3a','#e8b42a','#c9c2b4','#6a2a5a']],ath:[['#f4efe4','#2a6ad8','#e8dcc4','#2a6ad8'],['#f4efe4','#e8762a','#efe6d2','#2a9a9a'],['#d8b48a','#2a6ad8','#e8dcc4','#b8302a']]};
function C3_vig(cx,cz,ux,uz,nx,nz,y,kind,ath,zn){const A=C3.G,ry=Math.atan2(ux,uz),[wood,accent,stone,leaf]=C3_VP[ath?'ath':'fra'][Math.floor(zn*3)%3];
  const B=(a,o,h,sa,sh,so,col)=>C3_box(A,cx+ux*a+nx*o,y+h,cz+uz*a+nz*o,ry,so,sh,sa,col);
  const bench=(a,o)=>{B(a,o,.42,1.7,.08,.5,wood);B(a,o+.26,.75,1.7,.5,.07,wood);B(a-.7,o,.2,.12,.4,.4,'#3a3d44');B(a+.7,o,.2,.12,.4,.4,'#3a3d44')};
  const planter=(a,o)=>{B(a,o,.35,1.1,.7,1.1,stone);B(a,o,.85,.9,.45,.9,leaf)};
  const bin=(a,o)=>B(a,o,.45,.5,.9,.5,'#3a4a42');
  if(kind==='bench'){bench(0,1.2);planter(2.3,1.3);bin(1.3,.2);B(-2.4,.3,2.1,.18,4.2,.18,'#3a3d44')}
  else if(kind==='kiosk'){B(0,2.4,1.3,2.8,2.6,2,accent);B(0,2.4,2.7,3.2,.2,2.4,wood);B(0,1.3,1.5,2.2,.12,.12,'#f4efe4');bench(-3.6,1.4);planter(2.8,1);bin(-1.8,.2)}
  else if(kind==='stop'){B(0,.9,2.4,3.4,.16,1.7,accent);B(0,1.65,1.2,3.4,2.4,.1,'#9fd0e8');B(-1.6,.9,1.2,.12,2.4,.12,'#3a3d44');B(1.6,.9,1.2,.12,2.4,.12,'#3a3d44');bench(0,1.1);bin(2.8,.3)}
  else{for(let i=0;i<2;i++){const a=-1.6+i*3.2,o=1.6+i*.2;B(a,o,.38,.9,.04,.9,accent);B(a,o,.19,.12,.38,.12,'#3a3d44');B(a-.7,o,.22,.4,.44,.4,wood);B(a+.7,o,.22,.4,.44,.4,wood);B(a,o,1.9,2.2,.1,2.2,i?stone:accent)}planter(3.4,.6);bin(-3.3,.3)}}/* cafe: 2 tables + parasol slabs */
function C3_side(add,px,pz,ux,uz,w,nx,nz,x,z,D){if(!C3.on||!HUB.grid)return;const ath=CID!=='fra';
  // (1) vignette: one per 45 m cell + side; needs a clear 8 x 4 m pavement spot
  const key=Math.floor(x/45)*100000+Math.floor(z/45)+(nx>0?.5:0);
  if(!C3.cells.has(key)){C3.cells.add(key);const r=C3_h(x,z,11);if(r<.7){/* city-5: boxes only, so the rate is back up (was .42 with prop models) */const cx=x+nx*1.2,cz=z+nz*1.2;
    if(!gridHit(HUB.grid,cx+nx*1.5,cz+nz*1.5,4)&&!inRiver(cx,cz,2)&&!onAnyDeck(cx,cz)){const q=cityAt(cx,cz);if(!(q&&q.d<q.road.w/2+2.2)){const f=fillAt(cx,cz);if(!(f&&f.d<f.r.w/2+2.2)){
      const K=ath?['bench','cafe','kiosk','stop','cafe','bench']:['bench','kiosk','stop','bench','cafe','bench'],kind=K[Math.floor(C3_h(x,z,12)*K.length)],zn=C3_h(Math.floor(x/300),Math.floor(z/300),45);
      C3_vig(cx,cz,ux,uz,nx,nz,groundY(cx,cz),kind,ath,zn);C3.V.push([cx,cz,ux,uz,nx,nz]);
      const y=groundY(cx,cz),P=ath?C3_PAVE_A:C3_PAVE;C3_box(C3.G,cx+nx*1.4,y+.03,cz+nz*1.4,Math.atan2(ux,uz),4.6,.12,8.6,P[Math.floor(C3_h(x,z,13)*P.length)])}}}}}
  // (2) ground breakup on bare lawn behind the pavement (no building within 7 m)
  const o=w/2+6.4,gx=px+nx*o,gz=pz+nz*o,k2=Math.floor(gx/16)*100000+Math.floor(gz/16)+.25;if(C3.cells.has(k2)||C3.G.length>26000)return;C3.cells.add(k2);const r2=C3_h(gx,gz,14);if(r2>.6)return;if(gridHit(HUB.grid,gx,gz,7)||roamHit(gx,gz,2.5))return;
  const q=cityAt(gx,gz);if(q&&q.d<q.road.w/2+3.5)return;const f=fillAt(gx,gz);if(f&&f.d<f.r.w/2+3.5)return;if(inRiver(gx,gz,2)||onAnyDeck(gx,gz))return;
  const y=groundY(gx,gz),ry=Math.atan2(ux,uz);  C3_box(C3.G,gx-nx*1.6,y+.02,gz-nz*1.6,ry,.9,.16,6.2,ath?'#e2d6bc':'#c8c4bc');/* kerb-edge strip */
  if(r2<.18){for(let i=0;i<4;i++){const d=1+i*2.2;C3_box(C3.G,gx+nx*d+ux*.4*(i%2),y+.015,gz+nz*d+uz*.4*(i%2),ry+.25*(i%2-.5),2.2,.1,1.5,ath?'#c9a06a':'#9a7650')}}/* dirt path into the lawn */
  else if(r2<.38){const fx=gx+nx*2.2,fz=gz+nz*2.2;C3_box(C3.G,fx,y+.1,fz,ry,2.6,.3,5.2,'#7a5236');for(let i=0;i<6;i++)C3_box(C3.G,fx+ux*(i-2.5)*.8+nx*(C3_h(fx,i,15)-.5)*1.2,y+.35,fz+uz*(i-2.5)*.8+nz*(C3_h(fz,i,16)-.5)*1.2,ry,.7,.3,.7,C3_F[Math.floor(C3_h(fx+i,fz,17)*C3_F.length)])}/* flowerbed */
  else{const fx=gx+nx*1.6,fz=gz+nz*1.6;C3_box(C3.G,fx,y+.02,fz,ry+.3,3.4,.12,3.4,(ath?C3_PAVE_A:C3_PAVE)[Math.floor(r2*40)%4])}}/* small paved pad */
// (3) roof kit on flat roofs (colliders with a roof height: b.h, or b.rt from the Frankfurt filler split)
function C3_roofs(){const A=C3.R,pk=Math.min(.62,4500/Math.max(1,HUB.bld.length));let nb=0;for(const b of HUB.bld){if(nb>=6000)break;const top=b.rt??b.h;if(top==null||b.tier||b.hw<3.5||b.hd<3.5||b.hw>45||b.hd>45)continue;const r=C3_h(b.x,b.z,21);if(r>pk)continue;
    const g=b.y0??groundY(b.x,b.z),H=top-g;if(H<5||H>70)continue;nb++;const ry=b.c!=null?Math.atan2(b.s,b.c):0,c=Math.cos(ry),s=Math.sin(ry),W=(lx,lz)=>[b.x+lx*c+lz*s,b.z-lx*s+lz*c];
    const sx=C3_h(b.x,b.z,22)<.5?-1:1,sz=C3_h(b.x,b.z,23)<.5?-1:1,ex=b.hw*.55,ez=b.hd*.55,k=Math.floor(C3_h(b.x,b.z,24)*4);
    if(k===0){const[tx,tz]=W(sx*ex,sz*ez);for(const[a,d]of[[-.8,-.8],[.8,-.8],[-.8,.8],[.8,.8]]){const[lx,lz]=W(sx*ex+a,sz*ez+d);C3_box(A,lx,top+.8,lz,ry,.22,1.6,.22,'#4a3a30')}C3_box(A,tx,top+2.8,tz,ry,2.4,2.6,2.4,'#9a6040');C3_box(A,tx,top+4.3,tz,ry,2,.5,2,'#5a3a2a')}/* water tank */
    else if(k===1&&b.hw>5&&b.hd>5){const[tx,tz]=W(0,0);C3_box(A,tx,top+.2,tz,ry,b.hw*1.3,.4,b.hd*1.3,'#4f9a36');for(let i=0;i<5;i++){const[px,pz]=W((C3_h(b.x,i,25)-.5)*b.hw*1.1,(C3_h(b.z,i,26)-.5)*b.hd*1.1);const big=i<2;C3_box(A,px,top+(big?1.1:.6),pz,ry+i,big?1.6:1,big?1.6:.6,big?1.6:1,big?'#2f7a34':C3_F[i%C3_F.length])}}/* roof garden */
    else if(k===2||k===1){for(let i=0;i<3;i++){const[px,pz]=W(sx*ex-sx*i*1.9,-sz*ez);C3_box(A,px,top+.55,pz,ry,1.5,1.1,1.2,'#c4c8ce');C3_box(A,px,top+1.13,pz,ry,.9,.06,.9,'#3a3f48')}}/* AC units */
    else{const[tx,tz]=W(sx*ex,-sz*ez);C3_box(A,tx,top+3,tz,ry,.22,6,.22,'#9aa0a8');C3_box(A,tx,top+4.6,tz,ry,2.2,.12,.12,'#9aa0a8');C3_box(A,tx,top+5.4,tz,ry,.12,.12,1.6,'#9aa0a8');C3_box(A,tx,top+6.1,tz,ry,.3,.3,.3,'#e8402a');C3_box(A,tx,top+.4,tz,ry,1.4,.8,1.4,'#b8bcc4')}}/* antenna */
  C3.n.bld=nb}
// (4) city-4 shopfronts on street-facing ground floors: shop window band, striped awning (3.1 m up: clears cars and peds), sign fascia. Palette per ~300 m zone = per-district look. Boxes only, no colliders.
const C3_AW={fra:[['#d8282e','#f4efe4'],['#2f7a3a','#f4efe4'],['#1f3a7a','#f5c20c'],['#e8762a','#f6e6c8'],['#6a2a5a','#f0d8e4'],['#2a7a8a','#f4efe4']],
  ath:[['#2a6ad8','#ffffff'],['#c8582a','#f6e6c8'],['#6a8a2a','#f4efe4'],['#e8b42a','#ffffff'],['#2a9a9a','#ffffff'],['#b8302a','#f6e6c8']]},C3_SIGN=['#f5c20c','#ffffff','#e5177f','#2ab0e8','#1b1c3a','#ff7a2a'];
function C3_shops(){const A=C3.G,ath=CID!=='fra',PAL=C3_AW[ath?'ath':'fra'];let na=0;for(const b of HUB.bld){if(na>=3500)break;const top=b.rt??b.h;if(top==null||b.tier||b.hw<2.5||b.hd<2.5||b.hw>40||b.hd>40)continue;
    const g=b.y0??groundY(b.x,b.z),H=top-g;if(H<4.5||H>90)continue;const ry=b.c!=null?Math.atan2(b.s,b.c):0,c=Math.cos(ry),s=Math.sin(ry),W=(lx,lz)=>[b.x+lx*c+lz*s,b.z-lx*s+lz*c];
    let best=null;for(const[fx,fz,hl]of[[1,0,b.hd],[-1,0,b.hd],[0,1,b.hw],[0,-1,b.hw]]){if(hl<2.5)continue;const[mx,mz]=W(fx*(fx?b.hw:0)+fx*2.5,fz*(fz?b.hd:0)+fz*2.5);const q=cityAt(mx,mz),f=fillAt(mx,mz);let e=1e9;if(q)e=Math.min(e,q.d-q.road.w/2);if(f)e=Math.min(e,f.d-f.r.w/2);if(e<9&&e>-.5&&(!best||e<best.e))best={fx,fz,hl,e}}
    if(!best)continue;const r=C3_h(b.x,b.z,41);if(r>.8)continue;na++;const{fx,fz}=best,hl=Math.min(best.hl*.82,7),fry=ry+(fx?Math.PI/2:0),ofs=(fx?b.hw:b.hd);
    const P=(d,a)=>W(fx*(ofs+d)+(fz?a:0),fz*(ofs+d)+(fx?a:0));/* d = out from the facade, a = along it */
    const zone=C3_h(Math.floor(b.x/300),Math.floor(b.z/300),42),pal=PAL[Math.floor((zone*.7+C3_h(b.x,b.z,43)*.3)*PAL.length)%PAL.length],y=g+.04;
    {const[x,z]=P(.06,0);C3_box(A,x,y+1.35,z,fry,hl*2,2.3,.14,'#2c4a6a')}/* shop window */
    {const[x,z]=P(.1,0);C3_box(A,x,y+4.05,z,fry,hl*2+.2,.85,.22,C3_SIGN[Math.floor(C3_h(b.x,b.z,44)*C3_SIGN.length)])}/* sign fascia */
    if(r<.55){const n=3,sw=hl*2/n;for(let i=0;i<n;i++){const a=-hl+sw*(i+.5),[x,z]=P(.85,a);C3_box(A,x,y+3.15,z,fry,sw,.16,1.6,pal[i%2])}const[vx,vz]=P(1.66,0);C3_box(A,vx,y+2.95,vz,fry,hl*2,.32,.06,pal[0])}/* striped awning + valance */
    else{const[x,z]=P(.6,0);C3_box(A,x,y+3.2,z,fry,hl*2,.2,1.1,pal[0])}}/* flat canopy */
  C3.n.shop=na}
// (2b) verge flower strips along every city street (both sides, every ~8 m, colour runs of ~40 m): sampled from CITY_S, so it also covers streets whose side() slots are taken
function C3_verge(){const A=C3.G;for(const S of CITY_S){if(S.r.cls==='hill'||S.r.cls==='quay')continue;const P=S.pts,w=S.r.w;let acc=0;for(let i=1;i<P.length;i++){const p=P[i],q0=P[i-1];acc+=Math.hypot(p.x-q0.x,p.z-q0.z);if(acc<11)continue;acc=0;if(A.length>48000)return;
    for(const sd of[-1,1]){const nx=p.tz*sd,nz=-p.tx*sd,o=w/2+2.4,x=p.x+nx*o,z=p.z+nz*o,run=C3_h(Math.floor(x/40),Math.floor(z/40),31+sd);if(run>.75)continue;
      if(gridHit(HUB.grid,x,z,2.2)||roamHit(x,z,1.5))continue;const q=cityAt(x,z);if(q&&q.d<q.road.w/2+1.2)continue;const f=fillAt(x,z);if(f&&f.d<f.r.w/2+1.2)continue;if(inRiver(x,z,1)||onAnyDeck(x,z))continue;
      const y=groundY(x,z),ry=Math.atan2(p.tx,p.tz),fc=C3_F[Math.floor(run*8)%C3_F.length],fc2=C3_F[Math.floor(run*13+2)%C3_F.length];
      if(run<.45){C3_box(A,x,y+.12,z,ry,1.6,.36,7.4,'#6a4a32');for(let j=0;j<5;j++)C3_box(A,x+p.tx*(j-2)*1.45,y+.42,z+p.tz*(j-2)*1.45,ry,1.1,.34,1.1,j%2?fc:fc2)}/* flower strip */
      else{C3_box(A,x,y+.05,z,ry,1.8,.14,7.6,CID!=='fra'?'#e2d6bc':'#cfc9be');C3_box(A,x-nx*.95,y+.1,z-nz*.95,ry,.3,.24,7.6,'#8f8a84')}}}}}/* paved verge + kerb */
function C3_build(){C3_roofs();try{C3_shops()}catch(e){console.warn('C3 shops',e)}C3_verge();const all=C3.G.concat(C3.R);if(!all.length)return;const cells=new Map();for(const o of all){const kk=Math.floor(o[0]/250)*10000+Math.floor(o[2]/250);let a=cells.get(kk);if(!a)cells.set(kk,a=[]);a.push(o)}
  const g=new THREE.BoxGeometry(1,1,1),mat=new THREE.MeshStandardMaterial({roughness:.75,metalness:0}),M=new THREE.Matrix4(),Q=new THREE.Quaternion(),Y=new THREE.Vector3(0,1,0),P=new THREE.Vector3(),S=new THREE.Vector3(),c=new THREE.Color();
  for(const[,a]of cells){const im=new THREE.InstancedMesh(g,mat,a.length);a.forEach((o,i)=>{M.compose(P.set(o[0],o[1],o[2]),Q.setFromAxisAngle(Y,o[3]),S.set(o[4],o[5],o[6]));im.setMatrixAt(i,M);im.setColorAt(i,c.set(o[7]))});
    im.receiveShadow=true;im.userData.c3=1;im.userData.cd=360;/* city-5: 1400 m cells (always in range, all instances drawn) → 250 m cells, 360 m */im.userData.nsh=1;im.computeBoundingSphere();HUB.grp.add(im);C3.meshes++}
  C3.n.gnd=C3.G.length;C3.n.roof=C3.R.length;C3.n.vig=C3.V.length}
buildHubProps=(f=>function(){C3.cells=new Set();C3.G=[];C3.R=[];C3.V=[];C3.n={vig:0,gnd:0,roof:0,bld:0};C3.meshes=0;const r=f.apply(this,arguments);try{if(C3.on)C3_build()}catch(e){console.warn('C3',e)}return r})(buildHubProps);
window.__c3={C3,bs:()=>{const B=HUB.bld,K={};for(const b of B)for(const k in b)K[k]=(K[k]||0)+1;return{n:B.length,K,s:B.filter(b=>b.hw>4&&b.hd>4).slice(0,4)}},stat:()=>({on:C3.on,meshes:C3.meshes,...C3.n}),near:(r=120)=>{const d=o=>Math.hypot(o[0]-RO.x,(o.length>2?o[2]:o[1])-RO.z)<r;return{g:C3.G.filter(d).length,v:C3.V.filter(d).length,roof:C3.R.filter(d).length}},view:(x,z,h)=>{roamWarp(x,z,h);RO.v=0;camSnap=true},pick:()=>{let b=null,bd=1e9;for(const v of C3.V){const d=Math.hypot(v[0]-RO.x,v[1]-RO.z);if(d<bd&&d>25){bd=d;b=v}}return b},pave:([cx,cz,ux,uz,nx,nz])=>{roamCam=function(){const y=groundY(cx,cz)+1.7;camera.position.set(cx-ux*11+nx*.4,y,cz-uz*11+nz*.4);camera.lookAt(cx+ux*7,y-.1,cz+uz*7);camera.fov=70;camera.updateProjectionMatrix()};RO.frozen=true;HUB.cpos=null;hubCullStep()}};/* pick/pave: pavement-height proof camera (tools/tCity5Pave.js) */
