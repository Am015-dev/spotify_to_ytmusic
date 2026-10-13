const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage();
 await p.goto(process.argv[2]);await p.waitForFunction(()=>window.__ld&&window.__ld.need&&window.__g9ev,null,{timeout:240000});
 console.log(await p.evaluate(()=>__g9ev(`(()=>{const o={};const bx=A=>{const B=new THREE.Box3();for(const g of A){g.computeBoundingBox();B.union(g.boundingBox)}return [B.min.toArray(),B.max.toArray()].map(a=>a.map(v=>+v.toFixed(2)))};
  for(const sit of[false,true]){const M=[],L=[];GB_figGeo(GB_figGet(),M,L,sit);o['sit'+sit]=bx(M.concat(L));o['parts'+sit]=M.concat(L).map(g=>{g.computeBoundingBox();const s=g.boundingBox.getSize(new THREE.Vector3());const c=g.boundingBox.getCenter(new THREE.Vector3());return s.x.toFixed(2)+"@"+c.x.toFixed(2)+","+c.y.toFixed(2)+"#"+g.attributes.position.count}).join(' ')}
  for(const t of['drv','drvM']){const M=[],L=[];GB_piece(t,'#0055bf',M,L);o[t]=bx(M.concat(L))}return JSON.stringify(o)})()`)));await b.close()})();
