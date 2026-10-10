// PERF-2: enter roam (CITY), drive DRIVE s, then eval JS inside the game's module scope (window.__oc.ev, dbg pages only) and print the result.
// usage: CITY=ath DRIVE=30 node tools/eff/evalprobe.js <url local_dbg.html> <file with an expression>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
const URL=process.argv[2],EX=fs.readFileSync(process.argv[3],'utf8'),CITY=process.env.CITY||'ath',DRIVE=+(process.env.DRIVE||30);
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--js-flags=--expose-gc']});
const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await ctx.newPage();p.setDefaultTimeout(1800000);
await p.addInitScript("Object.defineProperty(window,'devicePixelRatio',{get:()=>0.35,configurable:true})");const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,160)));
await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:200});
await p.evaluate(c=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}));if(c==='ath'){localStorage.setItem('mho_city@1','ath');localStorage.setItem('mho_athd@1','A');localStorage.setItem('mho_roam.ath@1','{"otg":{}}');localStorage.setItem('mho_story.ath@1','{"seen":1}')}},CITY);
await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:200});
await p.evaluate(()=>__mho.enterRoam());await p.waitForFunction(()=>__mho.state==='roam'&&!(__mho.LD&&__mho.LD.on),null,{polling:200});
await p.keyboard.down('ArrowUp');for(let i=0;i<DRIVE;i++){await p.waitForTimeout(1000);if(i%6===3){await p.keyboard.down('ArrowRight');await p.waitForTimeout(400);await p.keyboard.up('ArrowRight')}}await p.keyboard.up('ArrowUp');
await p.evaluate(()=>gc());const r=await p.evaluate(ex=>{try{return JSON.stringify(window.__oc.ev(ex))}catch(e){return 'ERR '+e}},EX);console.log(r);console.log('errs',errs.slice(0,3));await b.close()})().catch(e=>{console.error(e);process.exit(1)});
