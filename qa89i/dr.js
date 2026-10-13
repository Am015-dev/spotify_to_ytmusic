const{chromium,boot}=require('../tools/d24lib');
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const{p,errs}=await boot(b,{city:'fra',url:process.argv[2],phone:true});
console.log(await p.evaluate(()=>__oc.ev(`(()=>{const o=[];scene.traverse(m=>{if(m.isMesh&&m.userData.dr)o.push([m.geometry.attributes.position.count,!!m.material.map,m.material===HUB.BM.office,m.material===HUB.BM.brick,m.visible])});return JSON.stringify({o,solid:DR.solid.length,bm:!!HUB.BM})})()`)));console.log(errs);await b.close()})()
