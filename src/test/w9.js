// ===== W9 · test-only probes (local builds only): camera access + pixel raycast for the art pass.
window.__w9={get camera(){return camera},
 ray(pts,W=852,H=393){const r=new THREE.Raycaster(),out={};for(const [px,py] of pts){r.setFromCamera(new THREE.Vector2(px/W*2-1,-(py/H*2-1)),camera);
  const h=r.intersectObjects(scene.children,true).filter(h=>{if(h.object.isLine||h.object.isPoints||h.object.isSprite)return false;for(let a=h.object;a;a=a.parent)if(!a.visible)return false;return true})[0];if(!h){out[px+','+py]='none';continue}
  const ms=[].concat(h.object.material),m=ms[h.face&&h.face.materialIndex||0]||ms[0];let nm='';for(const k in HUB.M)if(HUB.M[k]===m)nm=k;
  out[px+','+py]={d:+h.distance.toFixed(1),obj:h.object.type+':'+(h.object.name||'')+':'+h.object.geometry.type,hubM:nm,mt:m.type,col:m.color&&m.color.getHexString(),em:m.emissive&&m.emissive.getHexString()+'*'+m.emissiveIntensity,
   map:m.map&&m.map.image&&(m.map.image.width+'x'+m.map.image.height),vc:m.vertexColors,rough:m.roughness,ud:Object.keys(h.object.userData).join(','),me:m.metalness,ei:m.emissiveIntensity,isK:typeof KMM!=='undefined'&&Object.values(KMM).includes(m),chain:(()=>{const c=[];for(let a=h.object;a&&c.length<5;a=a.parent)c.push(a.type+':'+(a.name||'')+':'+Object.keys(a.userData).slice(0,3).join('/'));return c.join(' < ')})(),vcol:(()=>{const c=h.object.geometry.attributes.color;return c&&h.face?[c.getX(h.face.a),c.getY(h.face.a),c.getZ(h.face.a)].map(v=>+v.toFixed(2)):null})()}}return out}};
// composer-rendered shot from a custom camera pose (same post chain as the game), restored afterwards
window.__w9.shotAt=(px,py,pz,tx,ty,tz,fov=40)=>{const s={p:camera.position.clone(),q:camera.quaternion.clone(),f:camera.fov};camera.position.set(px,py,pz);camera.lookAt(tx,ty,tz);camera.fov=fov;camera.updateProjectionMatrix();camera.updateMatrixWorld();
 composer.render();const png=renderer.domElement.toDataURL('image/png');camera.position.copy(s.p);camera.quaternion.copy(s.q);camera.fov=s.f;camera.updateProjectionMatrix();return png};
// a real traffic model (live HUB.cim materials) parked beside the player, + low side camera; tyre gaps for both (m, lowest wheel point - ground)
window.__w9.side=(kind,side=3.8,ang=1.5708,dist=12,h=.55,fwd=6,tint='#2f7de0')=>{const ks=Object.keys(HUB.cim);const k=kind&&HUB.cim[kind]?kind:ks.find(q=>/sedan|cab|hatch|suv/.test(q))||ks[0];const src=HUB.cim[k];
 const fw=V3(Math.sin(RO.h),0,Math.cos(RO.h)),rt=V3(Math.cos(RO.h),0,-Math.sin(RO.h));const x=pl.mesh.position.x+rt.x*side+fw.x*fwd,z=pl.mesh.position.z+rt.z*side+fw.z*fwd,y=groundAt(x,z,pl.mesh.position.y+2);
 const grp=new THREE.Group(),M=new THREE.Matrix4().compose(V3(x,y,z),new THREE.Quaternion().setFromAxisAngle(V3(0,1,0),RO.h+Math.PI),V3(1,1,1));
 const cp=o=>{const im=new THREE.InstancedMesh(o.geometry,o.material,1);im.setMatrixAt(0,M);if(o.instanceColor){im.setColorAt(0,new THREE.Color(tint))}im.frustumCulled=false;im.castShadow=o.castShadow;grp.add(im);return im};
 cp(src);const wl=src.userData.w?cp(src.userData.w):null;if(src.userData.g)cp(src.userData.g);scene.add(grp);grp.updateMatrixWorld(true);
 const gap=o=>{const B=new THREE.Box3().setFromObject(o,true);if(B.isEmpty())return null;const cx=(B.min.x+B.max.x)/2,cz=(B.min.z+B.max.z)/2;return+(B.min.y-groundAt(cx,cz,B.max.y+1)).toFixed(3)};
 const ud=pl.mesh.userData;let pg=1e9;for(const w of ud.gbM||[])if(w.userData.r&&ART4_vis(w)){const B=new THREE.Box3().setFromObject(w,true);const g=B.min.y-groundAt((B.min.x+B.max.x)/2,(B.min.z+B.max.z)/2,B.max.y+1);if(g<pg)pg=g}
 const tg=wl?(()=>{const B=new THREE.Box3();const P=wl.geometry.attributes.position,v=new THREE.Vector3();for(let i=0;i<P.count;i++)B.expandByPoint(v.fromBufferAttribute(P,i).applyMatrix4(M));return+(B.min.y-groundAt(x,z,B.max.y+1)).toFixed(3)})():null;
 const mx=(pl.mesh.position.x+x)/2,mz=(pl.mesh.position.z+z)/2,a=RO.h+ang;const png=__w9.shotAt(mx+dist*Math.sin(a),y+h,mz+dist*Math.cos(a),mx,y+.6,mz,35);scene.remove(grp);
 return{png,kind:k,kinds:ks,gapPlayer:+pg.toFixed(3),gapTraffic:tg}};
window.__w9.cabEnv=v=>{ART10.t=1e15;const m=ART9_cabMat();m.userData.a10e=v;m.envMapIntensity=v;const g=ART10_glass();return v};
