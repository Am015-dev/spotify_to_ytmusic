// ==== ART pART6 · no shadow blobs under cars; only one small soft contact patch under EACH TYRE (player, AI, race and city traffic).
// Visual only: grounding (ART4_base, the cars session's suspension) is untouched.
const ART6={};
const ART6_off=o=>{if(!o||o.userData.art6)return;o.userData.art6=1;Object.defineProperty(o,'visible',{configurable:true,get(){return false},set(v){}})};
const ART6_noCast=root=>{if(root)root.traverse(o=>{if(o.isMesh&&!o.userData.art6c){o.userData.art6c=1;Object.defineProperty(o,'castShadow',{configurable:true,get(){return false},set(v){}})}})};
shipMesh=(f=>function(){const g=f.apply(this,arguments);try{ART6_off(g.userData.shadow);ART6_noCast(g)}catch(e){}return g})(shipMesh);
ART4_tyres=(f=>function(){const im=f.apply(this,arguments);ART6_off(im);return im})(ART4_tyres);
let ART6_t=0;function ART6_sweep(){const t=performance.now();if(t-ART6_t<500)return;ART6_t=t;
  try{if(trShadow)ART6_off(trShadow);if(trGlow)ART6_off(trGlow)}catch(e){}try{if(CR_SH)ART6_off(CR_SH)}catch(e){}if(ART4.ty)ART6_off(ART4.ty);
  for(const s of[pl,...ships])if(s&&s.mesh){const ud=s.mesh.userData;if(ud&&ud.shadow)ART6_off(ud.shadow);ART6_noCast(s.mesh);const w=[];s.mesh.traverse(o=>{if(o.isMesh&&o.userData.r)w.push(o)});s.art6w=w}
  for(const o of TRM||[])for(const k in o)if(o[k]&&o[k].isMesh)ART6_noCast(o[k]);for(const k in HUB.cim||{})ART6_noCast(HUB.cim[k])}
// tyre patch pool (soft radial, 45 %)
function ART6_pool(){if(ART6.p)return ART6.p;const im=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:ART_blobTex(),color:0,transparent:true,opacity:.45,depthWrite:false,fog:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}),640);
  im.renderOrder=1;im.frustumCulled=false;im.userData.keep=1;im.count=0;scene.add(im);return ART6.p=im}
const ART6_M=new THREE.Matrix4(),ART6_L=new THREE.Matrix4(),ART6_B=new THREE.Box3(),ART6_V=new THREE.Vector3(),ART6_Q=new THREE.Quaternion(),ART6_S=new THREE.Vector3(),ART6_wl={};
// wheel clusters of a merged wheel geometry: split by side, then by gaps along z → [cx,minY,cz,width,length] in model space
function ART6_wheels(geo){const P=geo.attributes.position,out=[];for(const sd of[-1,1]){const pts=[];for(let i=0;i<P.count;i++){const x=P.getX(i);if(Math.sign(x)===sd)pts.push([x,P.getY(i),P.getZ(i)])}pts.sort((a,b)=>a[2]-b[2]);let g=[];
    const flush=()=>{if(!g.length)return;let x0=1e9,x1=-1e9,y0=1e9,z0=1e9,z1=-1e9;for(const p of g){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);z0=Math.min(z0,p[2]);z1=Math.max(z1,p[2])}out.push([(x0+x1)/2,y0,(z0+z1)/2,x1-x0,z1-z0]);g=[]};
    for(const p of pts){if(g.length&&p[2]-g[g.length-1][2]>.25)flush();g.push(p)}flush()}return out}
function ART6_step(){const T=ART6_pool();let n=0;const put=m=>{if(n<640)T.setMatrixAt(n++,m)};
  // player + race cars: one patch under each wheel mesh, at its lowest point, along the car's heading
  for(const s of[pl,...ships]){if(!s||!s.mesh||!s.mesh.visible||!s.art6w||s.air||(s.boatK||0)>.5)continue;if(state==='roam'&&(s!==pl||RO.vy!==0))continue;s.mesh.getWorldQuaternion(ART6_Q);
    for(const w of s.art6w){let v=true;for(let a=w;a;a=a.parent)if(!a.visible){v=false;break}if(!v)continue;const g=w.geometry;if(!g.boundingBox)g.computeBoundingBox();const lb=g.boundingBox;
      // spinning wheel: centre and radius from the local box (rotation-invariant), not the world AABB of the rotated box
      w.getWorldScale(ART6_S);lb.getCenter(ART6_V).applyMatrix4(w.matrixWorld);const r=Math.max(lb.max.y-lb.min.y,lb.max.z-lb.min.z)/2*ART6_S.y,t=(lb.max.x-lb.min.x)*ART6_S.x;
      ART6_V.y-=r-.015;ART6_M.compose(ART6_V,ART6_Q,ART6_S.set(t*1.25,1,r*1.1));put(ART6_M)}}
  // city traffic: wheel clusters of each model's wheel mesh × the car's instance matrix
  if(state==='roam'&&RO.on&&HUB.cars&&HUB.cim)for(const c of HUB.cars){if(c.dead>0||c.x==null)continue;const dx=c.x-RO.x,dz=c.z-RO.z;if(dx*dx+dz*dz>120*120)continue;const im=HUB.cim[c.k],wm=im&&im.userData.w;if(!wm)continue;
    const W=ART6_wl[c.k]||(ART6_wl[c.k]=ART6_wheels(wm.geometry));wm.getMatrixAt(c.j,ART6_M);
    for(const q of W){ART6_L.makeScale(q[3]*1.25,1,q[4]*.55).setPosition(q[0],q[1]+.015,q[2]);put(ART6_L.premultiply(ART6_M))}}
  // race traffic: four corner patches inside the car footprint (its old shadow matrix: width×1.1, length×1.05 on the road)
  if(state!=='roam'&&typeof trShadow!=='undefined'&&trShadow)for(const c of traffic||[]){if(c.i==null)continue;trShadow.getMatrixAt(c.i,ART6_M);const e=ART6_M.elements;if(e[0]*e[0]+e[1]*e[1]+e[2]*e[2]<1e-6)continue;
    for(const[x,z]of[[-.38,-.32],[.38,-.32],[-.38,.32],[.38,.32]]){ART6_L.makeScale(.2,1,.13).setPosition(x,0,z);put(ART6_L.premultiply(ART6_M))}}
  T.count=n;T.instanceMatrix.needsUpdate=true}
posShip=(f=>function(s,dt,snap){f(s,dt,snap);if(s===pl)ART6_sweep()})(posShip);
roamStep=(f=>function(dt){f(dt);ART6_sweep()})(roamStep);
// draw the patches right before each frame is rendered, after every pose and traffic update
renderer.render=(f=>function(sc,cam){if(sc===scene)try{ART6_step()}catch(e){}return f.call(this,sc,cam)})(renderer.render);
