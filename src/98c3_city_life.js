// ===== C3 (city-3, 2026-10-16): STREET LIFE. docs/CITY_VARIETY.md #5 prop vignettes, #6 ground breakup, #7 roofline extras.
// (1) a prop vignette every ~45 m of pavement (one per 45 m cell and side): bench set, café, kiosk, bus stop, scooter rack; existing prop types only (no new draw calls);
// (2) ground plates: a paving pad under every vignette, kerb-edge strips, dirt paths and flowerbeds on bare lawns beside streets;
// (3) roof kit on flat roofs: water tanks, AC units, antennas, roof gardens.
// (2)+(3) are unit boxes in ONE InstancedMesh per 1400 m cell (frustum + distance culled). No rnd(), no colliders on plates / roof kit. Default OFF: ?c3=1 on (or TUNE.c3), ?c3=0 off. Hook: side() in 60_city_build6.js.
const C3={on:/[?&]c3=1\b/.test(location.search)||(!/[?&]c3=0\b/.test(location.search)&&!!(typeof TUNE!=='undefined'&&TUNE.c3)),/* default OFF until the look is clearly livelier (handoff city-3); ?c3=1 on, ?c3=0 off, TUNE.c3 */cells:new Set(),G:[],R:[],V:[],n:{vig:0,gnd:0,roof:0,bld:0},meshes:0};
const C3_h=(x,z,s)=>{const h=Math.sin(x*12.9898+z*78.233+s*37.719)*43758.5453;return h-Math.floor(h)};
const C3_F=['#ff4a8a','#ffd23a','#ff7a2a','#ffffff','#b46aff','#e8402a'],C3_PAVE=['#d9d0bf','#c9b8a0','#b8b0a4','#e0c8a8'],C3_PAVE_A=['#e8dcc4','#d8b48a','#efe6d2','#c89a78'];
// vignettes: [type, along, out, yaw (0 = facing the road)]; out = metres away from the road from the kerb-side prop line
const C3_V={bench:[['bench',0,1.2,Math.PI],['lamp',-2.4,.3,0],['planter',2.3,1.3,0],['bin',1.3,.2,0]],
  cafe:[['table',-1.6,1.6,0],['parasol',-1.6,1.6,0],['table',1.6,1.8,.6],['parasol',1.6,1.8,0],['planter',3.4,.6,0]],
  cafeA:[['CE_cafe',-1.5,1.6,0],['CE_cafe2',1.6,1.8,.7],['planter',3.3,.5,0],['bin',-3.3,.3,0]],
  kiosk:[['stall',0,2.2,Math.PI],['planter',2.6,1,0],['bin',-1.8,.2,0],['bench',-3.6,1.4,Math.PI]],
  stop:[['stop',0,.8,0],['bench',-3,1.5,Math.PI],['bin',2.8,.3,0],['planter',3.8,1,0]]};/* existing common types only: rare types (lights, crate, sign, scooters) put a new instanced bucket in many tiles (+draw calls) */
function C3_box(A,x,y,z,ry,sx,sy,sz,col){A.push([x,y,z,ry,sx,sy,sz,col])}
function C3_side(add,px,pz,ux,uz,w,nx,nz,x,z,D){if(!C3.on||!HUB.grid)return;const ath=CID!=='fra';
  // (1) vignette: one per 45 m cell + side; needs a clear 8 x 4 m pavement spot
  const key=Math.floor(x/45)*100000+Math.floor(z/45)+(nx>0?.5:0);
  if(!C3.cells.has(key)){C3.cells.add(key);const r=C3_h(x,z,11);if(r<.82){const cx=x+nx*1.2,cz=z+nz*1.2;
    if(!gridHit(HUB.grid,cx+nx*1.5,cz+nz*1.5,4)&&!inRiver(cx,cz,2)&&!onAnyDeck(cx,cz)){const q=cityAt(cx,cz);if(!(q&&q.d<q.road.w/2+2.2)){const f=fillAt(cx,cz);if(!(f&&f.d<f.r.w/2+2.2)){
      const K=ath?['bench','cafeA','kiosk','stop','cafeA','bench']:['bench','cafe','kiosk','stop','cafe','bench'],V=C3_V[K[Math.floor(C3_h(x,z,12)*K.length)]],yaw=Math.atan2(-nx,-nz);
      for(const[t,a,o,ry]of V)if(D[t])add(t,cx+ux*a+nx*o,cz+uz*a+nz*o,yaw+ry);C3.V.push([cx,cz]);
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
// (2b) verge flower strips along every city street (both sides, every ~8 m, colour runs of ~40 m): sampled from CITY_S, so it also covers streets whose side() slots are taken
function C3_verge(){const A=C3.G;for(const S of CITY_S){if(S.r.cls==='hill'||S.r.cls==='quay')continue;const P=S.pts,w=S.r.w;let acc=0;for(let i=1;i<P.length;i++){const p=P[i],q0=P[i-1];acc+=Math.hypot(p.x-q0.x,p.z-q0.z);if(acc<8)continue;acc=0;if(A.length>60000)return;
    for(const sd of[-1,1]){const nx=p.tz*sd,nz=-p.tx*sd,o=w/2+2.4,x=p.x+nx*o,z=p.z+nz*o,run=C3_h(Math.floor(x/40),Math.floor(z/40),31+sd);if(run>.75)continue;
      if(gridHit(HUB.grid,x,z,2.2)||roamHit(x,z,1.5))continue;const q=cityAt(x,z);if(q&&q.d<q.road.w/2+1.2)continue;const f=fillAt(x,z);if(f&&f.d<f.r.w/2+1.2)continue;if(inRiver(x,z,1)||onAnyDeck(x,z))continue;
      const y=groundY(x,z),ry=Math.atan2(p.tx,p.tz),fc=C3_F[Math.floor(run*8)%C3_F.length],fc2=C3_F[Math.floor(run*13+2)%C3_F.length];
      if(run<.45){C3_box(A,x,y+.12,z,ry,1.6,.36,7.4,'#6a4a32');for(let j=0;j<5;j++)C3_box(A,x+p.tx*(j-2)*1.45,y+.42,z+p.tz*(j-2)*1.45,ry,1.1,.34,1.1,j%2?fc:fc2)}/* flower strip */
      else{C3_box(A,x,y+.05,z,ry,1.8,.14,7.6,CID!=='fra'?'#e2d6bc':'#cfc9be');C3_box(A,x-nx*.95,y+.1,z-nz*.95,ry,.3,.24,7.6,'#8f8a84')}}}}}/* paved verge + kerb */
function C3_build(){C3_roofs();C3_verge();const all=C3.G.concat(C3.R);if(!all.length)return;const cells=new Map();for(const o of all){const kk=Math.floor(o[0]/1400)*1000+Math.floor(o[2]/1400);let a=cells.get(kk);if(!a)cells.set(kk,a=[]);a.push(o)}
  const g=new THREE.BoxGeometry(1,1,1),mat=new THREE.MeshStandardMaterial({roughness:.75,metalness:0}),M=new THREE.Matrix4(),Q=new THREE.Quaternion(),Y=new THREE.Vector3(0,1,0),P=new THREE.Vector3(),S=new THREE.Vector3(),c=new THREE.Color();
  for(const[,a]of cells){const im=new THREE.InstancedMesh(g,mat,a.length);a.forEach((o,i)=>{M.compose(P.set(o[0],o[1],o[2]),Q.setFromAxisAngle(Y,o[3]),S.set(o[4],o[5],o[6]));im.setMatrixAt(i,M);im.setColorAt(i,c.set(o[7]))});
    im.receiveShadow=true;im.userData.c3=1;im.userData.cd=700;im.userData.nsh=1;im.computeBoundingSphere();HUB.grp.add(im);C3.meshes++}
  C3.n.gnd=C3.G.length;C3.n.roof=C3.R.length;C3.n.vig=C3.V.length}
buildHubProps=(f=>function(){C3.cells=new Set();C3.G=[];C3.R=[];C3.V=[];C3.n={vig:0,gnd:0,roof:0,bld:0};C3.meshes=0;const r=f.apply(this,arguments);try{if(C3.on)C3_build()}catch(e){console.warn('C3',e)}return r})(buildHubProps);
window.__c3={C3,bs:()=>{const B=HUB.bld,K={};for(const b of B)for(const k in b)K[k]=(K[k]||0)+1;return{n:B.length,K,s:B.filter(b=>b.hw>4&&b.hd>4).slice(0,4)}},stat:()=>({on:C3.on,meshes:C3.meshes,...C3.n}),near:(r=120)=>{const d=o=>Math.hypot(o[0]-RO.x,(o.length>2?o[2]:o[1])-RO.z)<r;return{g:C3.G.filter(d).length,v:C3.V.filter(d).length,roof:C3.R.filter(d).length}},view:(x,z,h)=>{roamWarp(x,z,h);RO.v=0;camSnap=true}};
