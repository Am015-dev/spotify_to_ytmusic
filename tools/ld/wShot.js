// tools/ld/wShot.js <url> <model id> <out.png> [yawDeg] : 852×393 prop render of one converted LDraw model (merged, CR_LO 2 like the world prop),
// own scene + renderer (no roam). Prints tris/draws/size and page errors. build-5 world-prop quick look.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const [URL,ID,OUT,YAW]=process.argv.slice(2);const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await (await b.newContext({viewport:{width:852,height:393}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,200))});
 await p.goto(URL);await p.waitForFunction(()=>window.__ld&&window.__mho,null,{timeout:300000});
 const r=await p.evaluate(([id,yaw])=>{__ld.wreg();const T=__ld.THREE,B=__ld.br(id),g=__ld.grp(B),s=new T.Scene();s.background=new T.Color('#5d9cf2');
  s.add(new T.HemisphereLight('#ffffff','#7a8a5a',1.2));const d=new T.DirectionalLight('#fff4e0',2.2);d.position.set(5,9,7);s.add(d);s.add(g);
  const bx=new T.Box3().setFromObject(g),c=bx.getCenter(new T.Vector3()),z=bx.getSize(new T.Vector3()),R=Math.max(z.x,z.y,z.z);
  const gr=new T.Mesh(new T.PlaneGeometry(R*6,R*6),new T.MeshLambertMaterial({color:'#6aa84f'}));gr.rotation.x=-Math.PI/2;gr.position.y=bx.min.y-.01;s.add(gr);
  const cv=document.createElement('canvas');cv.width=852;cv.height=393;const rn=new T.WebGLRenderer({canvas:cv,antialias:true,preserveDrawingBuffer:true});
  const cam=new T.PerspectiveCamera(35,852/393,.1,R*20),a=(yaw||-35)*Math.PI/180;cam.position.set(c.x+Math.sin(a)*R*2.1,c.y+R*.6,c.z-Math.cos(a)*R*2.1);cam.lookAt(c);
  rn.render(s,cam);let tris=0,draws=0;g.traverse(o=>{if(o.isMesh){draws++;const q=o.geometry;tris+=(q.index?q.index.count:q.attributes.position.count)/3}});
  return{u:cv.toDataURL('image/png'),parts:B.length,tris,draws,size:[z.x,z.y,z.z].map(v=>+(v*.408).toFixed(1))}},[ID,+YAW||0]);
 fs.writeFileSync(OUT,Buffer.from(r.u.split(',')[1],'base64'));delete r.u;console.log('WSHOT',ID,JSON.stringify(r),'ERR',JSON.stringify(errs.slice(0,4)));await b.close()})();
