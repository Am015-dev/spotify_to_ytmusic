// dev5: render from a fixed camera (x,z -> look x2,z2) at the Messe road, on foot; save canvas. node qa_dev5/view.js <url> <out.png> x z x2 z2
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const [,,url,out,x,z,x2,z2]=process.argv;const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const p=await (await b.newContext({viewport:{width:393,height:852}})).newPage();
 await p.goto(url+'?test=fra');for(let i=0;i<400;i++){if(await p.evaluate(()=>!!(window.__tq&&__tq.ready&&window.__chk)))break;await p.waitForTimeout(300)}
 await p.waitForTimeout(1500);for(let i=0;i<20;i++){const s=await p.evaluate(()=>__chk.go('v90m/green-blob'));if(!/jump|Can/.test(s))break;await p.waitForTimeout(500)}await p.waitForTimeout(10000);
 const u=await p.evaluate(a=>__oc.ev(`(()=>{const[x,z,x2,z2]=[${a}];const y=groundAt(x,z,60);camera.position.set(x,y+1.9,z);camera.lookAt(x2,groundAt(x2,z2,60)+1,z2);camera.updateMatrixWorld(true);renderer.render(scene,camera);return renderer.domElement.toDataURL('image/png')})()`),[x,z,x2,z2].join(','));
 fs.writeFileSync(out,Buffer.from(u.split(',')[1],'base64'));await b.close()})();
