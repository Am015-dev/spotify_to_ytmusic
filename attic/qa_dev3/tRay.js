// dev3: GO to a place, then list the meshes under the car (and 4/8/12 m behind) by raycast. node qa_dev3/tRay.js <url> <city> <go id>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const [,,url,c,id]=process.argv;const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage();
 await p.goto(url+'?test='+c+'&draw=0');await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{timeout:240000,polling:1000});
 await p.evaluate(id=>__chk.go(id),id);await p.waitForTimeout(1500);
 const r=await p.evaluate(()=>__oc.ev(`(()=>{const out=[],rc=new THREE.Raycaster(),M=[];scene.traverse(o=>{if(o.isMesh)M.push(o)});const hd=RO.h;for(const off of[0,4,8,12]){const x=RO.x-Math.sin(hd)*off,z=RO.z-Math.cos(hd)*off;rc.set(new THREE.Vector3(x,300,z),new THREE.Vector3(0,-1,0));
  out.push([off,rc.intersectObjects(M,false).slice(0,5).map(h=>[+h.point.y.toFixed(2),h.object.geometry.type,h.object.name||'',h.object.material&&h.object.material.color?h.object.material.color.getHexString():'',h.object.renderOrder,h.object.parent&&h.object.parent.name||''].join('|'))])}return out})()`));
 console.log(JSON.stringify(r,null,0));await b.close()})();
