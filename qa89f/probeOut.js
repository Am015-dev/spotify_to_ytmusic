// probe: Athens ring ~R m from the centre; shot looking at the nearest building + ray-pick the mesh at screen centre (diagnosis only; warps ok)
const fs=require('fs');const{chromium,boot}=require('../tools/d24lib');const URL=process.argv[2],OUT=process.argv[3]||'qa89f/out',R=+(process.env.R||1500);fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const{p,errs,shot}=await boot(b,{city:'ath',url:URL,phone:true});
 const ev=s=>p.evaluate(s=>__oc.ev(s),s);
 const c=JSON.parse(await ev(`(()=>{let x=0,z=0,n=0;for(const q of HUB.nodes){if(!q)continue;x+=q.x;z+=q.z;n++}const A=OC.acro||{};const ax=A.x??(A.c&&A.c.x),az=A.z??(A.c&&A.c.z);return JSON.stringify({x:ax??RO.x,z:az??RO.z,n,mean:[x/n,z/n],ro:[RO.x,RO.z],acro:Object.keys(A).slice(0,12)})})()`));console.log('centre',JSON.stringify(c));
 const NB=+(process.env.NB||8);
 for(let k=0;k<NB;k++){const a=k/NB*Math.PI*2,tx=c.x+Math.sin(a)*R,tz=c.z+Math.cos(a)*R;
  const n=JSON.parse(await ev(`(()=>{let b=null,bd=1e9;for(const q of HUB.nodes){if(!q)continue;const d=Math.hypot(q.x-(${tx}),q.z-(${tz}));if(d<bd){bd=d;b=q}}return JSON.stringify({x:b.x,z:b.z,d:bd})})()`));
  await p.evaluate(([x,z,h])=>{__mho.warp(x,z,h,true)},[n.x,n.z,a]);for(let i=0;i<40;i++)await p.evaluate(()=>__tick(10));
  // look sideways (both sides) at the street walls
  for(const side of[-1,1]){const info=await ev(`(()=>{const h=RO.h+${side}*Math.PI/2;camera.position.set(RO.x-Math.sin(h)*2,RO.y+3,RO.z-Math.cos(h)*2);camera.lookAt(RO.x+Math.sin(h)*20,RO.y+4,RO.z+Math.cos(h)*20);camera.updateMatrixWorld(true);
    window.__camLock=[camera.position.clone(),new THREE.Vector3(RO.x+Math.sin(h)*20,RO.y+4,RO.z+Math.cos(h)*20)];
    const rc=new THREE.Raycaster();const out=[];for(const sx of[-.5,0,.5])for(const sy of[0,.3]){rc.setFromCamera(new THREE.Vector2(sx,sy),camera);const I=[];scene.traverseVisible(o=>{if(!o.isMesh||o.isSprite)return;try{o.raycast(rc,I)}catch(e){if(!o.geometry.boundingSphere)o.geometry.computeBoundingSphere&&0;const bs=o.geometry.boundingSphere;if(bs){const S=bs.clone().applyMatrix4(o.matrixWorld);const pt=rc.ray.intersectSphere(S,new THREE.Vector3());if(pt)I.push({object:o,distance:pt.distanceTo(rc.ray.origin)+1000,sph:1})}}});I.sort((a,b)=>a.distance-b.distance);if(I[0]){const o=I[0].object;let path=[];for(let q=o;q&&path.length<5;q=q.parent)path.push((q.name||q.type)+(q.userData&&Object.keys(q.userData).length?'{'+Object.keys(q.userData).slice(0,4).join(',')+'}':''));out.push({sx,sy,d:+I[0].distance.toFixed(1),path:path.join('<'),mat:o.material&&(o.material.name||o.material.type)+':'+(o.material.map?'map':'nomap')+':'+(o.material.color?o.material.color.getHexString():''),inst:o.isInstancedMesh?I[0].instanceId:null,vc:o.geometry.attributes.position.count})}}return JSON.stringify(out)})()`);
   console.log('k',k,'side',side,JSON.stringify(n),info);
   // keep the camera locked for the shot: override roamCam for one frame
   await ev(`(()=>{if(!window.__rcO){window.__rcO=roamCam;roamCam=function(){const r=window.__rcO.apply(this,arguments);if(window.__camLock){camera.position.copy(window.__camLock[0]);camera.lookAt(window.__camLock[1])}return r}}})()`);
   await shot(`${OUT}/k${k}_${side<0?'L':'R'}.jpg`)}}
 console.log('stats',await ev(`JSON.stringify({dr:DR.st,calls:renderer.info.render.calls,tri:renderer.info.render.triangles,fillIM:(()=>{let n=0,i=0;HUB.grp.traverse(o=>{if(o.userData&&o.userData.drF){n++;i+=o.count}});return[n,i]})(),drMesh:(()=>{let v=0;HUB.grp.traverse(o=>{if(o.userData&&o.userData.dr&&o.geometry&&o.geometry.attributes.position)v+=o.geometry.attributes.position.count});return v})()})`));
 console.log('errs',JSON.stringify(errs));await b.close()})();
