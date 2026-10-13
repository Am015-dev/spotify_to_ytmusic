// tools/ct/bInfo.js <url> <ids> : size (m, at minifig scale LD_SW×LD_FIG), parts, tris (CR_LO 2 + LD_cull) of LDraw building models
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const [URL,IDS]=process.argv.slice(2);const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await (await b.newContext({viewport:{width:852,height:393}})).newPage();await p.goto(URL);await p.waitForFunction(()=>window.__ld&&window.__mho,null,{timeout:300000});
 for(const id of IDS.split(',')){const r=await p.evaluate(id=>{__ld.wreg();const T=__ld.THREE,B=id.split('+').flatMap(q=>__ld.br(q)),g=__ld.grpLo(B,2);const bx=new T.Box3().setFromObject(g),z=bx.getSize(new T.Vector3());let tris=0,draws=0;g.traverse(o=>{if(o.isMesh){draws++;const q=o.geometry;tris+=(q.index?q.index.count:q.attributes.position.count)/3}});
  const cols={};for(const q of B)cols[q.c]=(cols[q.c]||0)+1;return{id,parts:B.length,tris,draws,size:[z.x,z.y,z.z].map(v=>+(v*.408*1.6).toFixed(1)),cols:Object.entries(cols).sort((a,b)=>b[1]-a[1]).slice(0,6)}},id);console.log(JSON.stringify(r))}
 await b.close()})();
