// tShot.js <built page url ?lowmem=1> <fra|ath> <outPrefix>: 852x393 touch shots at ready and after a 30 s simulated roam (K/roamStep), then draw. ios-r18m
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:852,height:393},hasTouch:true,isMobile:true});const p=await ctx.newPage();
await p.addInitScript('window.__dbg=1');await p.goto(process.argv[2]+'&test='+process.argv[3]+'&draw=0');await p.waitForFunction(()=>window.__tq&&__tq.ready&&window.__oc,null,{polling:250,timeout:150000});
const shot=async n=>{await p.evaluate(()=>__tq.draw());await p.screenshot({path:process.argv[4]+n+'.jpg',type:'jpeg',quality:70})};
await p.waitForTimeout(4000);await shot('_ready');
await p.evaluate(()=>__oc.ev('K.ArrowUp=true;for(let i=0;i<900;i++){K.ArrowLeft=((i/90|0)%3===0);roamStep(1/30);if(i%300===299)try{__tq.draw()}catch(e){}}K.ArrowUp=K.ArrowLeft=false;'));await p.waitForTimeout(3000);await shot('_30s');await b.close()})();
