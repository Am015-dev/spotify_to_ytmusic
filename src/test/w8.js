// ===== W8 · test-only model viewer (local builds only). __w8.shot(kind,col,yaw,dist,h) → PNG dataURL of a traffic model next to the player.
window.__w8={
 geo:nm=>{delete CR_CG[nm];return CR_cityGeo(nm)},
 shot(nm,col='#3aa04a',yaw=.6,dist=7,h=1.2,W=852,H=393,fresh=1){
  if(fresh)delete CR_CG[nm];const G=CR_cityGeo(nm);if(!G)return null;const grp=new THREE.Group(),c=new THREE.Color(col);
  const mk=(g,m,tint)=>{const im=new THREE.InstancedMesh(g,m,1);im.setMatrixAt(0,new THREE.Matrix4());if(tint){im.setColorAt(0,c)}im.frustumCulled=false;grp.add(im);return im};
  const wm=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.8,metalness:0,envMapIntensity:.5});
  mk(G.body,ART9_cabMat(),1);mk(G.wheels,wm);if(G.glass)mk(G.glass,wm);
  const x=RO.x+Math.sin(RO.h||0)*12,z=RO.z+Math.cos(RO.h||0)*12,y=groundAt(x,z,99);grp.position.set(x,y,z);grp.rotation.y=0;scene.add(grp);
  const cam=new THREE.PerspectiveCamera(40,W/H,.1,3000);cam.position.set(x+dist*Math.sin(yaw),y+h,z+dist*Math.cos(yaw));cam.lookAt(x,y+.8,z);
  cam.aspect=renderer.domElement.width/renderer.domElement.height;cam.updateProjectionMatrix();renderer.setRenderTarget(null);renderer.render(scene,cam);const png=renderer.domElement.toDataURL('image/png');scene.remove(grp);
  const bb=new THREE.Box3().setFromBufferAttribute(G.body.attributes.position);return{png,size:[bb.max.x-bb.min.x,bb.max.y-bb.min.y,bb.max.z-bb.min.z].map(v=>+v.toFixed(2))}}};
window.__w8.boat=()=>{const ud=pl&&pl.mesh&&pl.mesh.userData;if(!ud)return null;const b=ud.gbV&&ud.gbV.boat;const out={veh:RO.veh,bk:+(pl.boatK||0).toFixed(2),roY:+RO.y.toFixed(3)};
 if(!b)return out;b.updateMatrixWorld(true);const B=new THREE.Box3().setFromObject(b,true);const t=T;if(HUB.waterU)HUB.waterU.value=T;const w=RO.y+waveH(RO.x,RO.z,t);
 out.vis=b.visible;out.hullMin=+B.min.y.toFixed(3);out.hullMax=+B.max.y.toFixed(3);out.waterY=+w.toFixed(3);out.gap=+(B.min.y-w).toFixed(3);out.h=+(B.max.y-B.min.y).toFixed(3);out.T=+T.toFixed(2);out.uT=HUB.waterU&&+HUB.waterU.value.toFixed(2);out.mY=+ud.m.position.y.toFixed(3);out.meshY=+pl.mesh.position.y.toFixed(3);return out};
window.__w8.cam=(ang=1.5708,dist=9,h=1.2)=>{const x=pl.mesh.position.x,z=pl.mesh.position.z,y=pl.mesh.position.y;const cam=new THREE.PerspectiveCamera(40,renderer.domElement.width/renderer.domElement.height,.1,3000);
 const a=RO.h+ang;cam.position.set(x+dist*Math.sin(a),y+h,z+dist*Math.cos(a));cam.lookAt(x,y+.3,z);renderer.setRenderTarget(null);renderer.render(scene,cam);return{png:renderer.domElement.toDataURL('image/png')}};
window.__w8.sel=id=>{const G=GAR_get();G.own=GAR_SETS.map(s=>s.id);GAR_put(G);GAR_select(id);CR_attachV(pl.mesh);CR_vis(pl,pl.mesh.userData);return GAR_get().sel};
window.__w8.boatRun=(spot,n=40)=>{__mho.warp(spot[0],spot[1],0,true);RO.vsel='boat';const a=[];for(let i=0;i<n;i++){RO.v=0;__ju.step(3);if(i>15)a.push(__w8.boat())}
 const g=a.filter(o=>o.vis).map(o=>o.gap),sub=a.filter(o=>o.vis).map(o=>(o.waterY-o.hullMin)/o.h);const avg=v=>v.length?+(v.reduce((x,y)=>x+y,0)/v.length).toFixed(3):null;
 return{veh:RO.veh,vmode:pl.vmode,n:g.length,gapAvg:avg(g),gapMin:g.length?Math.min(...g):null,gapMax:g.length?Math.max(...g):null,subAvg:avg(sub),h:a.length&&a[a.length-1].h,mY:a.length&&a[a.length-1].mY}};
window.__w8.dbg=()=>{const ud=pl.mesh.userData,g=ud.gbV.boat,host=ud.m;g.updateMatrixWorld(true);const o={mY:host.position.y,hostScale:host.scale.toArray(),parent:host.parent===pl.mesh,meshY:pl.mesh.position.y,meshS:pl.mesh.scale.toArray(),roY:RO.y,water:RO.y+waveH(RO.x,RO.z,T),bb:[...W8B.bb.keys()].length,gPos:g.position.toArray(),gScale:g.scale.toArray(),chain:[],parts:[]};
 for(let a=g;a;a=a.parent)o.chain.push([a.type,a.name||'',+a.position.y.toFixed(3),+a.scale.y.toFixed(3)]);
 g.traverse(m=>{if(!m.isMesh)return;const B=new THREE.Box3().setFromObject(m,true);o.parts.push([m.userData.a8s?'a8s':'m',m.visible,+B.min.y.toFixed(2),+B.max.y.toFixed(2),m.material&&m.material.type])});return o};
