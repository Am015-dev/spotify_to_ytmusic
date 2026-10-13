const{chromium,boot}=require('../tools/d24lib');
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const{p,errs}=await boot(b,{city:'fra',url:process.argv[2],phone:true});
console.log(await p.evaluate(()=>__oc.ev(`JSON.stringify({bm:Object.keys(HUB.BM),solid:(DR.solid||[]).length,st:DR.st,sz:(DR.solid||[]).slice(0,3)})`)));console.log(errs);await b.close()})()
