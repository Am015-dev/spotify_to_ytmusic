// SHB (v90k): soft blob shadows on the ground under the player car, city traffic, people and trees. One InstancedMesh, depth-write off, ~1 draw call.
// Cause of "no shadows": the sun shadow map only runs on HIGH quality (LK_shadow), auto-quality drops it on busy PCs, and v86v (ART6) replaced the car
// blobs with tiny 45 % tyre patches. These blobs are cheap and always on in free roam. window.__sh = {n, pl} for the checklist test.
const SHB={n:0,pl:null,t:0,trees:[],tt:0};
function SHB_pool(){if(SHB.im)return SHB.im;const im=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:ART_blobTex(),color:0,transparent:true,opacity:.5,depthWrite:false,fog:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),900);
 im.renderOrder=1;im.frustumCulled=false;im.userData.keep=1;im.userData.sh=1;im.count=0;scene.add(im);return SHB.im=im}
const SHB_M=new THREE.Matrix4(),SHB_V=new THREE.Vector3(),SHB_Q=new THREE.Quaternion(),SHB_S=new THREE.Vector3(),SHB_E=new THREE.Euler(),SHB_B=new THREE.Box3();
// trees: brick-tree instanced meshes (ART_trees material: roughness .42, vertex colours, 5–12 m tall) → their instance positions, rescanned every 3 s
function SHB_scanTrees(){const L=[];if(HUB.grp)HUB.grp.traverse(o=>{if(!o.isInstancedMesh||o.userData.sh||!o.material||o.material.roughness!==.42||!o.material.vertexColors)return;const g=o.geometry;if(!g.boundingBox)g.computeBoundingBox();const b=g.boundingBox,h=b.max.y-b.min.y;if(h<4||h>14||b.max.x-b.min.x>12)return;
  o.updateMatrixWorld();for(let i=0;i<o.count;i++){o.getMatrixAt(i,SHB_M);SHB_M.premultiply(o.matrixWorld);SHB_M.decompose(SHB_V,SHB_Q,SHB_S);if(SHB_S.x<1e-3)continue;L.push([SHB_V.x,SHB_V.z,Math.max(2.4,(b.max.x-b.min.x)*SHB_S.x*.75)])}});SHB.trees=L}
function SHB_put(x,y,z,w,l,h){if(SHB.n>=900)return;SHB_M.compose(SHB_V.set(x,y+.03,z),SHB_Q.setFromEuler(SHB_E.set(0,h||0,0)),SHB_S.set(w,1,l));SHB.im.setMatrixAt(SHB.n++,SHB_M)}
function SHB_gy(x,z,y){try{const g=tH(x,z);return y!=null&&Math.abs(y-g)<3?Math.max(g,y):g}catch(e){return y||0}}
function SHB_step(){const T=SHB_pool();SHB.n=0;SHB.pl=null;let on=false;try{on=state==='roam'&&RO.on&&HUB.grp&&HUB.grp.visible}catch(e){}if(!on){T.count=0;return}
 const now=performance.now();if(now-SHB.tt>3000){SHB.tt=now;SHB_scanTrees()}
 // player car: blob sized to the car body, at the lowest point of the car (tyres on the road)
 if(pl&&pl.mesh&&pl.mesh.visible&&!RO.wk){if(now-SHB.t>500||!SHB.pb){SHB.t=now;SHB_B.setFromObject(pl.mesh);SHB.pb=[SHB_B.max.x-SHB_B.min.x,SHB_B.max.z-SHB_B.min.z,SHB_B.min.y-pl.mesh.position.y]}
  const p=pl.mesh.position,air=Math.max(0,p.y+SHB.pb[2]-SHB_gy(p.x,p.z)),k=Math.max(.35,1-air*.15),w=Math.min(SHB.pb[0],SHB.pb[1])*1.15*k,L=Math.max(SHB.pb[0],SHB.pb[1])*1.1*k;
  SHB.pl=[p.x,p.z];SHB_put(p.x,SHB_gy(p.x,p.z,p.y+SHB.pb[2]),p.z,w,L,RO.h)}
 // city traffic (within 140 m): the car's instance matrix gives position + heading
 for(const c of HUB.cars||[]){if(c.dead>0||c.x==null)continue;const dx=c.x-RO.x,dz=c.z-RO.z;if(dx*dx+dz*dz>140*140)continue;const im=HUB.cim&&HUB.cim[c.k];let h=c.h||0,y=c.y;
  if(im&&c.j!=null){im.getMatrixAt(c.j,SHB_M);SHB_M.decompose(SHB_V,SHB_Q,SHB_S);if(SHB_S.x<1e-3)continue;SHB_E.setFromQuaternion(SHB_Q,'YXZ');h=SHB_E.y;y=SHB_V.y}SHB_put(c.x,SHB_gy(c.x,c.z,y),c.z,2.3,4.8,h)}
 // people (within 90 m)
 for(const p of HUB.peds||[]){if(p._x==null)continue;const dx=p._x-RO.x,dz=p._z-RO.z;if(dx*dx+dz*dz>90*90)continue;SHB_put(p._x,SHB_gy(p._x,p._z,p.y),p._z,.9,.9,0)}
 // trees (within 160 m)
 for(const t of SHB.trees){const dx=t[0]-RO.x,dz=t[1]-RO.z;if(dx*dx+dz*dz>160*160)continue;SHB_put(t[0],SHB_gy(t[0],t[1]),t[1],t[2],t[2],0)}
 T.count=SHB.n;T.instanceMatrix.needsUpdate=true}
renderer.render=(f=>function(sc,cam){if(sc===scene)try{SHB_step()}catch(e){}return f.call(this,sc,cam)})(renderer.render);
window.__sh=()=>({n:SHB.n,trees:SHB.trees.length,pl:SHB.pl,plUnder:!!(SHB.pl&&SHB.pl[0]===pl.mesh.position.x)});
