// tools/ld/ldProp.js <url> <out.png> <model ids comma> (env LV=CR_LO level, default 2) : a world prop as the world builds it (CR_LO 2) rendered alone at 852×393 (3/4 street view),
// prints triangles and draw calls. For when roam can't load headless; the in-world placement is checked by Alex (checklist).
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const p=await (await b.newContext({viewport:{width:852,height:393}})).newPage();
 const errs=[];p.on('pageerror',e=>errs.push(String(e)));await p.goto(process.argv[2]);await p.waitForFunction(()=>window.__ld&&window.__mho,null,{timeout:240000});
 const r=await p.evaluate(([ids,lv])=>{const T=__ld.THREE,B=[].concat(...ids.split(',').map(i=>__ld.br(i))),g=__ld.grpLo(B,lv);let tris=0,dc=0;g.traverse(o=>{if(o.isMesh){dc++;const q=o.geometry;tris+=(q.index?q.index.count:q.attributes.position.count)/3}});
  const box=new T.Box3().setFromObject(g),c=box.getCenter(new T.Vector3()),s=box.getSize(new T.Vector3()),R=Math.max(s.x,s.y,s.z);
  const sc=new T.Scene();sc.background=new T.Color(0x4a90d9);sc.add(new T.HemisphereLight(0xffffff,0x667755,1.6));const d=new T.DirectionalLight(0xffffff,1.6);d.position.set(1,2,1.4);sc.add(d);sc.add(g);
  const gr=new T.Mesh(new T.PlaneGeometry(R*6,R*6),new T.MeshLambertMaterial({color:0x6c6c6c}));gr.rotation.x=-Math.PI/2;gr.position.y=box.min.y-.01;sc.add(gr);
  const cam=new T.PerspectiveCamera(45,852/393,.1,R*20);cam.position.set(c.x+R*.95,c.y+R*.35,c.z-R*1.25);cam.lookAt(c);
  const rd=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});rd.setSize(852,393);rd.render(sc,cam);
  return{tris:Math.round(tris),dc,size:[s.x,s.y,s.z].map(v=>+v.toFixed(2)),png:rd.domElement.toDataURL('image/png')}},[process.argv[4],+(process.env.LV||2)]);
 require('fs').writeFileSync(process.argv[3],Buffer.from(r.png.split(',')[1],'base64'));console.log('PROP tris',r.tris,'draws',r.dc,'size',r.size,'errs',errs.slice(0,3));await b.close()})();
