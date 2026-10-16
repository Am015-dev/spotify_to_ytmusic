// ===== C1 (city-1, 2026-10-16): STREET GREEN. Alex: "the city looks repetitive". docs/CITY_VARIETY.md #4 (+ #1 lives in src/95_drive_flow.js DR_fraSplit).
// (1) a second street tree per ~40 m on pavements (3 tree kinds, hashed yaw; sizes come from the foliage mix TUNE.cvFol);
// (2) low hedge / flower-box runs on bare lawns beside streets (no building within 6 m): one InstancedMesh of unit boxes per 700 m cell (frustum + distance culled).
// No rnd() is used (the prop stream and every later layout stay as they were). Decor only: no colliders. ?c1=0 = off. Called from side() in 60_city_build6.js.
const C1={on:!/[?&]c1=0\b/.test(location.search),n:0,meshes:0,L:[]};
const C1_h=(x,z,s)=>{const h=Math.sin(x*12.9898+z*78.233+s*37.719)*43758.5453;return h-Math.floor(h)};
const C1_G=['#1f6f34','#2a7a46','#246b3a','#33803a','#1b5f2e'],C1_F=['#ff4a8a','#ffd23a','#ff7a2a','#ffffff','#b46aff','#e8402a'];
function C1_side(add,px,pz,ux,uz,w,nx,nz,k,M7,boul,x,z){if(!C1.on||!HUB.grid)return;
  if(k%M7===M7-1&&w>=10&&(boul||C1_h(x,z,1)<.8)){const t=['tree','tree2','tree3','tree'][Math.floor(C1_h(x,z,2)*4)];add(t,x+nx*2.2+ux*1.5,z+nz*2.2+uz*1.5,C1_h(x,z,3)*6.28)}
  if(C1_h(px,pz,4)<.7){const o=w/2+7.6,hx=px+nx*o,hz=pz+nz*o;if(gridHit(HUB.grid,hx,hz,6)||roamHit(hx,hz,2.2))return;const q=cityAt(hx,hz);if(q&&q.d<q.road.w/2+4)return;const f=fillAt(hx,hz);if(f&&f.d<f.r.w/2+4)return;
    if(inRiver(hx,hz,2)||onAnyDeck(hx,hz))return;HUB.H1.push([hx,hz,Math.atan2(ux,uz),k])}}
function C1_build(){const A=HUB.H1;if(!C1.on||!A||!A.length)return;const A2=A.length>9000?A.filter((_,i)=>i%Math.ceil(A.length/9000)===0):A,cells=new Map(),c=new THREE.Color();
  for(const[hx,hz,ry,k]of A2){const kk=Math.floor(hx/700)*1000+Math.floor(hz/700);let a=cells.get(kk);if(!a)cells.set(kk,a=[]);a.push([hx,hz,ry,k])}
  const g=new THREE.BoxGeometry(1,1,1),mat=new THREE.MeshStandardMaterial({roughness:.7,metalness:0}),M=new THREE.Matrix4(),Q=new THREE.Quaternion(),Y=new THREE.Vector3(0,1,0),P=new THREE.Vector3(),S=new THREE.Vector3();
  for(const[,a]of cells){const inst=[];for(const[hx,hz,ry,k]of a){const y=groundY(hx,hz),r=C1_h(hx,hz,5),h=1.1+.5*C1_h(hx,hz,6);
      if(r<.2){inst.push([hx,y+.3,hz,ry,1.5,.6,6,'#a89a8a']);inst.push([hx,y+.7,hz,ry,1.2,.25,5.6,C1_F[Math.floor(C1_h(hx,hz,7)*C1_F.length)]])}/* flower box: stone rim + bloom */
      else{inst.push([hx,y+h/2-.1,hz,ry,1.5,h,6.4,C1_G[Math.floor(C1_h(hx,hz,8)*C1_G.length)]]);if(r<.7)inst.push([hx,y+h-.05,hz,ry,1.2,.25,6,C1_F[Math.floor(C1_h(hx,hz,9)*C1_F.length)]])}}
    const im=new THREE.InstancedMesh(g,mat,inst.length);inst.forEach((o,i)=>{M.compose(P.set(o[0],o[1],o[2]),Q.setFromAxisAngle(Y,o[3]),S.set(o[4],o[5],o[6]));im.setMatrixAt(i,M);im.setColorAt(i,c.set(o[7]))});
    im.receiveShadow=true;im.userData.c1h=1;im.userData.cd=420;im.userData.nsh=1;im.computeBoundingSphere();HUB.grp.add(im);C1.meshes++;C1.n+=inst.length}}
buildHubProps=(f=>function(){HUB.H1=[];const r=f.apply(this,arguments);try{C1.meshes=C1.n=0;C1_build()}catch(e){console.warn('C1',e)}return r})(buildHubProps);
window.__c1={C1,build:C1_build,dr:()=>DR.solid,h1:()=>HUB.H1,rd:(x,z)=>{const q=cityAt(x,z);return q?q.d-q.road.w/2:999}};
