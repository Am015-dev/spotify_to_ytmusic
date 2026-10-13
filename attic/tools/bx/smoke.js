// builder-A smoke: boot the page at phone size, tap TRACK BUILDER, screenshot, print page errors.  node tools/bx/smoke.js [url] [outdir]
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const URL=process.argv[2]||'http://127.0.0.1:8766/local_dbg.html?fast=1',OUT=process.argv[3]||'qa_bx';
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const c=await b.newContext({viewport:{width:852,height:393},hasTouch:true,isMobile:true,deviceScaleFactor:1});const p=await c.newPage();const E=[];
 p.on('pageerror',e=>E.push('PAGEERR '+e.message));p.on('console',m=>{if(m.type()==='error')E.push('CONSOLE '+m.text())});
 await p.goto(URL);await p.waitForSelector('#bxMenuBtn',{state:'visible',timeout:120000});await p.waitForTimeout(1500);
 const bb=await p.locator('#bxMenuBtn').boundingBox();await p.touchscreen.tap(bb.x+bb.width/2,bb.y+bb.height/2);await p.waitForTimeout(3000);
 await p.screenshot({path:OUT+'/smoke_build.png'});console.log(JSON.stringify(await p.evaluate(()=>window.__bx.st())));
 console.log(E.length?E.join('\n'):'NO_ERRORS');await b.close()})();
