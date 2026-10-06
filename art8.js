// ==== ART pART8 · crisp car-shaped sun shadows (player, AI, race and city traffic), LEGO 2K Drive style.
// Each car mesh gets a shadow twin (same geometry) whose vertices are projected along the sun direction onto the car's ground plane
// (through the tyre contact points, normal = the car's up axis). One flat dark silhouette per car: the stencil stops overlapping
// parts (body, wheels, glass) and neighbouring cars from darkening twice. Only cars within ~70 m of the camera draw one.
// The ART6 tyre patches stay on top as contact darkening.
const ART8={L:{value:new THREE.Vector3(.45,-.75,.35).normalize()},op:.6,far:70,cars:new Set(),ims:[]};
const ART8_VS=`uniform vec3 uL;uniform vec3 uP0;uniform vec3 uN;uniform float uGy;uniform float uFar;
void main(){mat4 M=modelMatrix;vec3 n=uN,p0=uP0;
#ifdef USE_INSTANCING
 M=M*instanceMatrix;vec3 up=mat3(M)*vec3(0.,1.,0.);if(dot(up,up)<1e-8){gl_Position=vec4(2.,2.,2.,1.);return;}n=normalize(up);p0=(M*vec4(0.,uGy,0.,1.)).xyz;
#endif
 if(distance(p0,cameraPosition)>uFar){gl_Position=vec4(2.,2.,2.,1.);return;}
 vec4 w=M*vec4(position,1.);float d=min(dot(n,uL),-.35);w.xyz+=uL*(dot(p0-w.xyz,n)/d)+n*.07;gl_Position=projectionMatrix*viewMatrix*w;}`;
const ART8_FS=`uniform float uOp;void main(){gl_FragColor=vec4(0.,0.,0.,uOp);}`;
function ART8_mat(gy){return new THREE.ShaderMaterial({uniforms:{uL:ART8.L,uP0:{value:new THREE.Vector3()},uN:{value:new THREE.Vector3(0,1,0)},uGy:{value:gy||0},uFar:{value:ART8.far},uOp:{value:ART8.op}},
  vertexShader:ART8_VS,fragmentShader:ART8_FS,side:THREE.DoubleSide,transparent:true,depthWrite:false,fog:false,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-16,
  stencilWrite:true,stencilRef:1,stencilFunc:THREE.NotEqualStencilFunc,stencilZPass:THREE.ReplaceStencilOp,stencilFail:THREE.KeepStencilOp,stencilZFail:THREE.KeepStencilOp})}
const ART8_skip=o=>{const m=o.material;if(!m||Array.isArray(m))return false;return m.blending===THREE.AdditiveBlending||(m.transparent&&m.opacity<.3&&!m.vertexColors)||o.userData.art6||o.userData.keep};
const ART8_lock=(o,k,v)=>Object.defineProperty(o,k,{configurable:true,get:typeof v==='function'?v:()=>v,set(){}});
// a shadow twin under every visible part of a ship-style car (player, AI racers, garage cars)
function ART8_car(s){if(!s||!s.mesh)return;if(!s.a8m)s.a8m=ART8_mat(0);const m=()=>s.a8m;
  s.mesh.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||o.userData.a8s||o.userData.a8d||!o.geometry||!o.geometry.attributes.position)return;o.userData.a8d=1;if(ART8_skip(o))return;
    const t=new THREE.Mesh(o.geometry);t.userData.a8s=1;ART8_lock(t,'material',m);ART8_lock(t,'castShadow',false);ART8_lock(t,'receiveShadow',false);t.frustumCulled=false;t.renderOrder=1;t.raycast=()=>{};o.add(t)});ART8.cars.add(s)}
// shadow twins of instanced traffic: same geometry, own 16-slot instance buffer filled each frame with the cars near the camera only
// (the traffic pools hold hundreds of parked/dead slots); the plane sits at the model's tyre bottom
function ART8_inst(im,gy){if(!im||!im.isInstancedMesh||im.userData.a8)return;const t=new THREE.InstancedMesh(im.geometry,ART8_mat(gy),16);
  t.instanceMatrix.setUsage(THREE.DynamicDrawUsage);t.count=0;t.frustumCulled=false;t.renderOrder=1;t.userData.a8s=1;t.userData.keep=1;t.raycast=()=>{};im.add(t);im.userData.a8=t;ART8.ims.push(t)}
const ART8_minY=(...g)=>{let y=1e9;for(const x of g){if(!x||!x.geometry)continue;if(!x.geometry.boundingBox)x.geometry.computeBoundingBox();y=Math.min(y,x.geometry.boundingBox.min.y)}return y<1e8?y:0};
// wheel: axle = the thinnest box axis; radius = the farthest vertex from the axle (exact for a spinning wheel, any modelling axis)
function ART8_whl(g){if(g.userData.a8w)return g.userData.a8w;if(!g.boundingBox)g.computeBoundingBox();const b=g.boundingBox,c=b.getCenter(new THREE.Vector3()),e=b.getSize(new THREE.Vector3()),ax=e.x<=e.y&&e.x<=e.z?0:e.y<=e.z?1:2,P=g.attributes.position;let r=0;
  for(let i=0;i<P.count;i++){const d=[P.getX(i)-c.x,P.getY(i)-c.y,P.getZ(i)-c.z];d[ax]=0;r=Math.max(r,d[0]*d[0]+d[1]*d[1]+d[2]*d[2])}return g.userData.a8w={c,r:Math.sqrt(r)}}
let ART8_t=0;function ART8_sweep(){const t=performance.now();if(t-ART8_t<500)return;ART8_t=t;
  // filler roads and trails also win the depth test against the grass at a distance (city streets already had an offset)
  try{for(const k of['road','dirt']){const m=HUB.M&&HUB.M[k];if(m&&!m.polygonOffset){m.polygonOffset=true;m.polygonOffsetFactor=-1;m.polygonOffsetUnits=-2}}}catch(e){}
  try{for(const s of[pl,...(ships||[])])if(s&&s.mesh)ART8_car(s)}catch(e){}
  try{for(const k in HUB.cim||{}){const im=HUB.cim[k];if(!im)continue;const w=im.userData.w,gy=w?ART8_minY(w):ART8_minY(im);ART8_inst(im,gy);if(w)ART8_inst(w,gy);if(im.userData.g)ART8_inst(im.userData.g,gy)}}catch(e){}
  try{for(const o of TRM||[]){const L=Object.values(o).filter(x=>x&&x.isInstancedMesh&&x.material&&x.material.blending!==THREE.AdditiveBlending),gy=ART8_minY(...L);for(const x of L)ART8_inst(x,gy)}}catch(e){}}
const ART8_M=new THREE.Matrix4(),ART8_C=new THREE.Vector3();const ART8_put=(im,j)=>{const t=im&&im.userData.a8;if(!t||t.count>=16)return;im.getMatrixAt(j,ART8_M);t.setMatrixAt(t.count++,ART8_M)};
const ART8_V=new THREE.Vector3(),ART8_W=new THREE.Vector3(),ART8_Q=new THREE.Quaternion(),ART8_S=new THREE.Vector3();
function ART8_step(){ART8_sweep();
  // sun direction from the key light (its target may follow the player)
  moonL.getWorldPosition(ART8_V);moonL.target.getWorldPosition(ART8_W);const L=ART8.L.value.copy(ART8_W).sub(ART8_V);if(L.lengthSq()<1e-6)L.set(.45,-.75,.35);L.normalize();if(L.y>-.88){const h=Math.hypot(L.x,L.z)||1;L.x*=.475/h;L.z*=.475/h;L.y=-.88}
  for(const s of ART8.cars){const m=s.a8m;if(!m)continue;let ok=s.mesh&&s.mesh.visible&&s.mesh.parent&&!s.air&&(s.boatK||0)<=.5&&!(state==='roam'&&(s!==pl||RO.vy!==0));
    if(ok){let v=s.mesh;for(;v;v=v.parent)if(!v.visible){ok=false;break}}
    if(ok){s.mesh.getWorldQuaternion(ART8_Q);m.uniforms.uN.value.set(0,1,0).applyQuaternion(ART8_Q);
      // plane through the lowest wheel points (ART6 found the wheel meshes); fallback: the car origin
      let n=0;ART8_W.set(0,0,0);for(const w of s.art6w||[]){let vis=true;for(let a=w;a&&a!==s.mesh;a=a.parent)if(!a.visible){vis=false;break}if(!vis)continue;const q=ART8_whl(w.geometry);w.getWorldScale(ART8_S);ART8_V.copy(q.c).applyMatrix4(w.matrixWorld);
        ART8_V.addScaledVector(m.uniforms.uN.value,-q.r*Math.max(ART8_S.x,ART8_S.y,ART8_S.z));ART8_W.add(ART8_V);n++}
      if(n)ART8_W.multiplyScalar(1/n);else s.mesh.getWorldPosition(ART8_W);m.uniforms.uP0.value.copy(ART8_W)}
    m.visible=!!ok}
  for(const t of ART8.ims)t.count=0;camera.getWorldPosition(ART8_C);const f2=(ART8.far+10)**2;
  if(state==='roam'&&HUB.cars&&HUB.cim)for(const c of HUB.cars){if(c.dead>0||c.x==null)continue;const dx=c.x-ART8_C.x,dz=c.z-ART8_C.z;if(dx*dx+dz*dz>f2)continue;const im=HUB.cim[c.k];if(!im)continue;ART8_put(im,c.j);ART8_put(im.userData.w,c.j);ART8_put(im.userData.g,c.j)}
  if(state!=='roam')for(const c of traffic||[]){const o=TRM[c.k];if(c.i==null||!o||!o.body)continue;o.body.getMatrixAt(c.i,ART8_M);const e=ART8_M.elements,dx=e[12]-ART8_C.x,dz=e[14]-ART8_C.z;if(dx*dx+dz*dz>f2||e[0]*e[0]+e[1]*e[1]+e[2]*e[2]<1e-6)continue;for(const k in o)ART8_put(o[k],c.i)}
  for(const t of ART8.ims)t.instanceMatrix.needsUpdate=true}
renderer.render=(f=>function(sc,cam){if(sc===scene)try{ART8_step()}catch(e){}return f.call(this,sc,cam)})(renderer.render);
// ---- roads always on top of the grass: road strips used to have vertices only at their path points and at the two edges, so on humps
// the asphalt chord sagged under the (now exact) grass. Strips are refined where the ground is not linear: ≤ 2.5 m along, ≤ 4 m across.
function ART8_err(ax,az,bx,bz){return Math.abs(groundY((ax+bx)/2,(az+bz)/2)-(groundY(ax,az)+groundY(bx,bz))/2)}
function ART8_lin(ax,az,bx,bz){return ART8_err(ax,az,bx,bz)<.006}
// chord sag shrinks with the square of the step: split into the fewest pieces that keep it ≤ 1 cm (the asphalt rides 3.5-7 cm above the ground)
const ART8_n=e=>e<.01?1:Math.ceil(Math.sqrt(e/.01));
function abStrip(P,i0,i1,oa,ob,ya,yb,uvL){const pos=[],uvs=[],idx=[],Q=[];let nc=1;const W=ob-oa;
  for(let i=i0;i<=i1;i++){const p=P[i],rx=p.tz,rz=-p.tx;if(Math.abs(W)>3)nc=Math.max(nc,Math.min(Math.ceil(Math.abs(W)/2),ART8_n(ART8_err(p.x+rx*oa,p.z+rz*oa,p.x+rx*ob,p.z+rz*ob))));
    Q.push([p.x,p.z,p.tx,p.tz,p.s]);if(i<i1){const q=P[i+1],L=Math.hypot(q.x-p.x,q.z-p.z);if(L>2){const rq=q.tz,rzq=-q.tx;let e=0;for(const o of[oa,(oa+ob)/2,ob])e=Math.max(e,ART8_err(p.x+rx*o,p.z+rz*o,q.x+rq*o,q.z+rzq*o));
      const n=Math.min(Math.ceil(L/1.5),ART8_n(e));for(let k=1;k<n;k++){const t=k/n;let tx=p.tx+(q.tx-p.tx)*t,tz=p.tz+(q.tz-p.tz)*t;const l=Math.hypot(tx,tz)||1;Q.push([p.x+(q.x-p.x)*t,p.z+(q.z-p.z)*t,tx/l,tz/l,p.s+(q.s-p.s)*t])}}}}
  const C=nc+1;for(let i=0;i<Q.length;i++){const[px,pz,tx,tz,ps]=Q[i],rx=tz,rz=-tx;for(let c=0;c<=nc;c++){const u=c/nc,o=oa+W*u,x=px+rx*o,z=pz+rz*o;pos.push(x,groundY(x,z)+ya+(yb-ya)*u,z);uvs.push(u,ps/uvL)}
    if(i<Q.length-1)for(let c=0;c<nc;c++){const k=i*C+c;idx.push(k,k+C,k+1,k+1,k+C,k+C+1)}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.setIndex(idx);g.computeVertexNormals();return g}
window.__a8={ART8,get HUB(){return HUB},tH:(x,z)=>tH(x,z),gy:(x,z)=>groundY(x,z),rd:(x,z)=>ART7_rd(x,z)};
// filler streets / crossing squares (pART5 drape): 4 m segments only where the ground under them is not linear (pART7 split every street
// 4 m both ways, ~400k extra vertices on flat ground); flat stretches keep 24 m segments
function ART8_ps(x0,z0,ux,uz,w,L){const vx=uz,vz=-ux;let ac=1,bend=false;for(let t=0;t<=L;t+=4){const x=x0+ux*t,z=z0+uz*t;if(w>3)ac=Math.max(ac,Math.min(Math.ceil(w/2),ART8_n(ART8_err(x-vx*w/2,z-vz*w/2,x+vx*w/2,z+vz*w/2))));
    }const nl=Math.max(1,Math.ceil(L/24)),sl=L/nl;for(let k=0;k<nl&&!bend;k++)for(const o of[-w/2,0,w/2]){const x=x0+ux*sl*k+vx*o,z=z0+uz*sl*k+vz*o;if(ART8_err(x,z,x+ux*sl,z+uz*sl)>=.01){bend=true;break}}return[ac,bend?Math.max(1,Math.ceil(L/4)):nl]}
function ART8_pq(cx,cz,wa,wb){const a=wa/2,b=wb/2;let e=0;for(const t of[-1,-.5,0,.5,1]){e=Math.max(e,ART8_err(cx-a,cz+b*t,cx+a,cz+b*t),ART8_err(cx+a*t,cz-b,cx+a*t,cz+b))}return e>=.01?[Math.max(1,Math.ceil(wa/4)),Math.max(1,Math.ceil(wb/4))]:[1,1]}
