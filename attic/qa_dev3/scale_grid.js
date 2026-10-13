(async()=>{const IDS=['t_v6607_1','t_v6609_1','t_v6608_1','t_v6505_1','t_v6501_1','t_bus'],out=[],b0=gbBuild()||GB.d,F0=Object.assign({},RSZ.F);
const sc=new THREE.Scene();sc.background=new THREE.Color('#9ec9ee');sc.add(new THREE.HemisphereLight('#ffffff','#9a9a9a',2.6));const dl=new THREE.DirectionalLight('#ffffff',2.4);dl.position.set(-8,14,10);sc.add(dl);
const gr=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:'#6b7078',roughness:1}));gr.rotation.x=-Math.PI/2;sc.add(gr);
const vbox=r=>{const bb=new THREE.Box3();r.updateMatrixWorld(true);r.traverse(o=>{if(!o.isMesh)return;for(let q=o;q&&q!==r.parent;q=q.parent)if(!q.visible)return;if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();bb.union(o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld))});return bb};
const RW=640,RH=300,rt=new THREE.WebGLRenderTarget(RW,RH),cam=new THREE.PerspectiveCamera(32,RW/RH,.1,200),shot=()=>{__tq.o.draw=1;renderer.setRenderTarget(rt);renderer.render(sc,cam);__tq.o.draw=0;const px=new Uint8Array(RW*RH*4);renderer.readRenderTargetPixels(rt,0,0,RW,RH,px);renderer.setRenderTarget(null);const c=document.createElement('canvas');c.width=RW;c.height=RH;const x=c.getContext('2d'),im=x.createImageData(RW,RH);for(let y=0;y<RH;y++)im.data.set(px.subarray((RH-1-y)*RW*4,(RH-y)*RW*4),y*RW*4);x.putImageData(im,0,0);return c.toDataURL('image/jpeg',.85)};
for(const id of IDS){const S=GAR_set(id);await LD_need(LD_probe(()=>[].concat(GAR_arr(S.car()))));
 for(const mode of['before','after']){if(mode==='before')delete RSZ.F[id];else Object.assign(RSZ.F,F0);RSZ.S=S;
  const g=shipMesh(gbTeam(TEAMS[teamIdx],Object.assign({},b0,{on:true,bricks:G9C_bricks(S,'car')})));SC_ship(g,true);CR_fx({boatK:0},g.userData);g.userData.m.updateMatrixWorld(true);RSZ.S=null;
  // hide the Hot Rod stock parts that CR_fx leaves, then put it on the ground: lowest wheel y -> 0
  const bb=vbox(g.userData.m);g.position.y=-bb.min.y;sc.add(g);g.updateMatrixWorld(true);const b2=vbox(g.userData.m),c=b2.getCenter(new THREE.Vector3()),sz=b2.getSize(new THREE.Vector3());
  const f=minifig('#d01712');const fb=new THREE.Box3().setFromObject(f),k=1.9/(fb.max.y-fb.min.y);f.scale.setScalar(k);f.position.set(c.x,-fb.min.y*k,c.z+sz.z/2+1.1);sc.add(f);
  const R=Math.max(sz.z,6)*1.0;cam.position.set(c.x+R*1.1,1.5+sz.y*.2,c.z+sz.z*.3);cam.lookAt(c.x,sz.y*.45,c.z+sz.z*.3);cam.updateProjectionMatrix();
  out.push({id,mode,L:+sz.z.toFixed(1),H:+sz.y.toFixed(1),png:shot()});sc.remove(g);sc.remove(f)}}
Object.assign(RSZ.F,F0);return out})()
