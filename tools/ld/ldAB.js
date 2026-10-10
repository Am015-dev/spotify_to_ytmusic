// tools/ld/ldAB.js <url> <model.mpd url> <model id> <out.png> [yaw quarter turns] [hide submodel substring,...]
// Ground truth check: the original LDraw file (three.js LDrawLoader, real parts library) next to our converted model, same camera, 4 views.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const [url,mpd,id,out,yaw='0',hide='']=process.argv.slice(2);const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await (await b.newContext({viewport:{width:900,height:500}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));
 await p.goto(url);await p.waitForFunction(()=>window.__ld&&window.__mho,null,{timeout:240000});
 await p.evaluate(i=>__ld.need?__ld.need([i]):0,id);
 const r=await p.evaluate(async([mpd,id,yaw,hide])=>{const T=__ld.THREE,{LDrawLoader}=await import('/ld/vendor/LDrawLoader.js');const L=new LDrawLoader();L.setPartsLibraryPath('/ld/lib/ldraw/');
  await L.preloadMaterials('/ld/lib/ldraw/LDConfig.ldr');const g0=await L.loadAsync(mpd);const H=hide?hide.split(','):[];
  g0.traverse(o=>{if(o.isLineSegments)o.visible=false;if(H.some(h=>(o.userData.fileName||o.name||'').toLowerCase().includes(h)))o.visible=false});
  const ref=new T.Group();ref.add(g0);g0.rotation.x=Math.PI;g0.scale.setScalar(.03);ref.rotation.y=+yaw*Math.PI/2;
  const ours=__ld.grp(__ld.br(id));const box=o=>{o.updateMatrixWorld(true);const B=new T.Box3();o.traverse(q=>{if(q.isMesh&&q.visible){q.geometry.computeBoundingBox();B.union(q.geometry.boundingBox.clone().applyMatrix4(q.matrixWorld))}});return B};
  for(const o of[ref,ours]){const B=box(o);o.position.x-=(B.min.x+B.max.x)/2;o.position.z-=(B.min.z+B.max.z)/2;o.position.y-=B.min.y}
  const B1=box(ref),B2=box(ours),S=new T.Vector3();B1.getSize(S);const R=new T.WebGLRenderer({preserveDrawingBuffer:true,antialias:true});R.setSize(440,300);R.setClearColor('#dfe6ee');
  const sc=new T.Scene();sc.add(new T.HemisphereLight('#ffffff','#667788',2.2));const dl=new T.DirectionalLight('#ffffff',2.4);dl.position.set(3,6,4);sc.add(dl);
  const cam=new T.PerspectiveCamera(30,440/300,.1,500),D=Math.max(S.x,S.y,S.z)*2.6,shots=[];
  for(const[az,el]of[[-2.3,.35],[Math.PI/2,.08],[Math.PI,.15],[-.6,.5]]){const row=[];for(const o of[ref,ours]){sc.add(o);cam.position.set(Math.sin(az)*D*Math.cos(el),S.y/2+D*Math.sin(el),Math.cos(az)*D*Math.cos(el));cam.lookAt(0,S.y/2.2,0);R.render(sc,cam);row.push(R.domElement.toDataURL('image/png'));sc.remove(o)}shots.push(row)}
  const sz=[B1.getSize(new T.Vector3()),B2.getSize(new T.Vector3())].map(v=>[v.x,v.y,v.z].map(q=>+q.toFixed(3)));return{shots,sz}},[mpd,id,yaw,hide]);
 const tmp=out.replace(/\.png$/,'');fs.mkdirSync(tmp,{recursive:true});r.shots.forEach((row,i)=>row.forEach((u,j)=>fs.writeFileSync(`${tmp}/${i}_${j?'ours':'ldraw'}.png`,Buffer.from(u.split(',')[1],'base64'))));
 console.log('size ldraw',JSON.stringify(r.sz[0]),'ours',JSON.stringify(r.sz[1]));console.log('ERR',JSON.stringify(errs.slice(0,5)));await b.close()})();
