const{chromium,boot}=require('../tools/d24lib');const OUT='qa89i/walk';require('fs').mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const{p,errs,shot}=await boot(b,{city:'ath',url:process.argv[2],phone:true});
const H=1.3826;for(let k=0;k<10;k++){const d=k*70;await p.evaluate(([x,z,h])=>{__mho.warp(x,z,h,true)},[1049+Math.sin(H)*d,-553+Math.cos(H)*d,H]);for(let i=0;i<25;i++)await p.evaluate(()=>__tick(10));await shot(`${OUT}/w${k}.jpg`);console.log(k,await p.evaluate(()=>__oc.ev('[RO.x|0,RO.z|0]')))}
console.log(errs);await b.close()})()
