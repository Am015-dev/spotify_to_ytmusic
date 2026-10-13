// dev3: GO to a place then a high oblique shot of the car's surroundings. node qa_dev3/tTop.js <url> <city> <go id> <out.jpg> [height] [back]
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const [,,url,c,id,out,H,B]=process.argv;const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await(await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1})).newPage();
 await p.goto(url+'?test='+c+'&draw=0');await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{timeout:240000,polling:1000});
 const m=await p.evaluate(id=>__chk.go(id),id);await p.waitForTimeout(1500);
 await p.evaluate(code=>__oc.ev(code),`(()=>{const x=RO.x,z=RO.z,hd=RO.h;camera.position.set(x-Math.sin(hd)*${+(B||25)},${+(H||40)}+groundY(x,z),z-Math.cos(hd)*${+(B||25)});camera.lookAt(x,groundY(x,z),z);TQ.draw=1;composer.render();TQ.draw=0})()`);
 await p.screenshot({path:out,type:'jpeg',quality:75});console.log(m);await b.close()})();
