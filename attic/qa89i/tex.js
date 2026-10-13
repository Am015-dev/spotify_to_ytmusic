const{chromium,boot}=require('../tools/d24lib');const fs=require('fs');
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const{p,errs}=await boot(b,{city:'fra',url:process.argv[2],phone:true});
for(const k of['office','brick','gable']){const u=await p.evaluate(k=>__oc.ev(`(()=>{const t=HUB.BM.${k}.map.image;const c=document.createElement('canvas');c.width=t.width;c.height=t.height;c.getContext('2d').drawImage(t,0,0);return c.toDataURL('image/png')})()`),k);fs.writeFileSync(`qa89i/tex_${k}.png`,Buffer.from(u.split(',')[1],'base64'))}
console.log(errs);await b.close()})()
