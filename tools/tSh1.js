// one browser: before (?sh1=0) and after, GO sh1/cut-world, shot during the scene
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for(const [tag,q] of [['before','&sh1=0'],['after','']]){const p=await b.newPage({viewport:{width:852,height:393}});const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,200)));
await p.goto('http://localhost:8812/index.html?test=fra'+q);await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{timeout:120000,polling:500});
await p.evaluate(()=>{__sh1.SH1.hold=1;return __chk.go('sh1/cut-world')});
await p.waitForFunction(()=>__sh1.SH1.last,null,{timeout:60000,polling:250});
await p.screenshot({path:'/tmp/sh1/s5_'+tag+'.png'});
console.log(tag,await p.evaluate(()=>__sh1.SH1.last.out));
await p.evaluate(()=>{__sh1.SH1.hold=0});await p.waitForTimeout(800);console.log(tag,'said',await p.evaluate(()=>__chk.said()),'errs',errs.length,errs.slice(0,2));await p.close()}
await b.close()})();
