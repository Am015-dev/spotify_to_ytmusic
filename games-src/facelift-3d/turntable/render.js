const { chromium } = require('playwright');const fs=require('fs');const S=process.env.S;
(async()=>{const b=await chromium.launch({args:['--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});const p=await b.newPage({viewport:{width:600,height:600}});
p.on('pageerror',e=>console.log('ERR',e.message));p.on('console',m=>console.log('C',m.text().slice(0,160)));
await p.goto('http://localhost:8125/index.html');console.log(await p.evaluate(()=>setup()));
for(let i=0;i<24;i++){const d=await p.evaluate(i=>frame(i),i);fs.writeFileSync(S+`/lamp/f${String(i).padStart(2,'0')}.png`,Buffer.from(d.split(',')[1],'base64'))}
await b.close()})()
