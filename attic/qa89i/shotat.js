const{chromium,boot}=require('../tools/d24lib');const fs=require('fs');
const[,, url,out,x,z,h,city]=process.argv;fs.mkdirSync(require('path').dirname(out),{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const{p,errs,shot}=await boot(b,{city:city||'ath',url,phone:true});
await p.evaluate(([x,z,h])=>{__mho.warp(x,z,h,true)},[+x,+z,+h]);for(let i=0;i<40;i++)await p.evaluate(()=>__tick(10));await shot(out);console.log(errs);await b.close()})()
